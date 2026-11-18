# devkumarhf/ur7e-sac-line-following

## Resumen

UR7e SAC Line Following es una política de control robótico entrenada con Soft Actor-Critic (SAC) y publicada por Dev Kumar a través de la librería Stable-Baselines3. El modelo resuelve una tarea concreta de seguimiento de línea (line following) sobre un brazo robótico cinemático de seis ejes etiquetado como UR7e, en un entorno de simulación puramente cinemática y de posición. No se trata de un modelo de lenguaje ni de un modelo fundacional: es un checkpoint de reinforcement learning congelado, orientado a investigación en control y robótica.

La relevancia de esta release no está en el entrenamiento (no se ha entrenado nada nuevo), sino en el empaquetado reproducible: incluye los pesos originales, un actor portable en NumPy que permite inferencia en CPU sin PyTorch, los ficheros completos del entorno, una evaluación con semillas fijas frente a un controlador clásico de mínimos cuadrados amortiguados (DLS) y un laboratorio interactivo en el navegador. La observación de entrada tiene 29 dimensiones float32 y la salida son 6 incrementos articulares normalizados, donde ±1 se mapea a ±0,05 radianes por paso de entorno.

El modelo es deliberadamente de alcance limitado: simulación cinemática, sin dinámica, sin fuerzas de contacto y sin transferencia sim-to-real validada. Su valor es como artefacto reproducible de comparación entre una política aprendida y un controlador clásico bajo distintas condiciones de ruido de sensores, no como controlador listo para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Red actor SAC (perceptrón multicapa), dos capas de 512 unidades con activación ReLU |
| Parametros totales | no disponible (el autor no declara el recuento; la arquitectura indicada es de dos capas de 512 unidades) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (no es un modelo de lenguaje; entrada fija de 29 observaciones float32) |
| Tipos de cuantizacion | no disponible (pesos exportados como actor NumPy en `actor.npz`; no se documentan cuantizaciones) |
| Idiomas soportados | en (metadatos del modelo; no es una capacidad lingüística) |
| Licencia | MIT |
| Formato de pesos | `actor.npz` (NumPy, cargado con `allow_pickle=False`) y checkpoint original de Stable-Baselines3 (`checkpoint.load_model()`) |

## Arquitectura y entrenamiento

La política es un actor SAC con dos capas ocultas de 512 unidades y activación ReLU. El entrenamiento original se realizó durante 1.900.000 pasos según los metadatos del checkpoint, sobre un entorno cinemático de seis ejes etiquetado como UR7e. La observación de 29 dimensiones se compone de: 6 ángulos articulares normalizados, 3 coordenadas de posición del efector final en metros, 1 valor de progreso del cursor (cursor/60), 1 indicador de fase (aproximación o seguimiento), 3 coordenadas del objetivo actual y 15 coordenadas de cinco puntos de objetivo de lookahead. Los ángulos se dividen por el límite articular positivo respectivo; el actor no normaliza las coordenadas cartesianas.

La release no incluye entrenamiento nuevo: congela un checkpoint existente y añade un exportador a NumPy (`export_actor.py`) cuya paridad frente a la política determinista original está registrada en `evaluation/actor-parity.json`, con 343 observaciones y una diferencia absoluta máxima de acción inferior a 0,000004. El actor exportado corresponde a la acción media determinista, por lo que no reproduce el muestreo estocástico de SAC ni permite reanudar el entrenamiento por sí solo. La evaluación se realizó íntegramente en CPU, sin servicios de inferencia de pago.

## Capacidades

- Control de seguimiento de línea en simulación cinemática: genera incrementos articulares de 6 grados de libertad a partir de observaciones de 29 dimensiones.
- Inferencia en CPU sin PyTorch mediante el actor NumPy (`policy.py` + `actor.npz`).
- Evaluación reproducible con semillas fijas frente a un controlador clásico DLS (amortiguamiento fijo 0,02, ganancia 0,8).
- Auditoría de finalización estricta: solo cuenta como completado si el episodio termina en fase de seguimiento, alcanza el cursor final y el punto final real queda dentro de 25 mm, sin error de seguimiento superior a 60 mm.
- Laboratorio interactivo en el navegador (Hugging Face Spaces) para inspeccionar la política.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, visión, audio ni capacidades multilingües: no es un modelo de lenguaje.

## Casos de uso

- Investigación en control robótico comparado: usar el par SAC/DLS con las mismas observaciones, límites articulares, pose inicial y reglas de terminación para estudiar diferencias entre política aprendida y controlador analítico bajo ruido de sensores creciente (σ de 0, 2 y 5 mm/mrad).
- Docencia y reproducción de experimentos: el repositorio incluye `requirements.txt`, `export_actor.py`, `test_release.py` y `evaluate.py`, lo que permite reproducir los 600 episodios de evaluación en CPU con comandos documentados.
- Despliegue ligero en entornos sin GPU: al disponer de un actor NumPy con `allow_pickle=False`, se puede integrar en pipelines Python que solo requieren NumPy y BLAS, evitando la dependencia de PyTorch.
- Validación de protocolos de evaluación: la auditoría de finalización estricta y los ficheros `episodes.csv`, `summary.json` y `test-manifest.json` sirven como plantilla para auditar experimentos de RL donde el flag `completed` del entorno no es fiable.
- Estudio de robustez frente a ruido de sensores: las tres condiciones de ruido gaussiano independiente por paso permiten analizar la degradación del error RMS de seguimiento (de 5,21 a 7,56 mm en SAC) y compararla con la del controlador clásico.
- Base para experimentos de sim-to-real acotados: el entorno y los ficheros URDF proporcionan un punto de partida para quien quiera añadir dinámica, límites de par o modelos de contacto, aunque la release actual no los incluye.
- Análisis de paridad de exportación: el fichero `actor-parity.json` documenta la equivalencia entre el checkpoint SB3 y el actor NumPy, útil para validar pipelines de exportación de políticas.

## Benchmarks y rendimiento

El autor declara una evaluación de 600 episodios en CPU: 100 trayectorias prespecificadas (20 por cada una de cinco formas), dos controladores y tres condiciones de ruido de sensores. Las condiciones reutilizan las mismas trayectorias; no son 600 trayectorias independientes.

| Ruido de sensor σ | Controlador | Finalización estricta | RMS de seguimiento medio (mm) |
|---|---|---:|---:|
| 0 mm / mrad | SAC | 93/100 | 5,21 |
| 0 mm / mrad | DLS | 90/100 | 2,38 |
| 2 mm / mrad | SAC | 92/100 | 5,75 |
| 2 mm / mrad | DLS | 89/100 | 3,55 |
| 5 mm / mrad | SAC | 89/100 | 7,56 |
| 5 mm / mrad | DLS | 87/100 | 6,50 |

El propio autor advierte de que la tasa de finalización de SAC es ligeramente superior en esta suite fija, pero DLS tiene menor error de seguimiento, y que el experimento no establece superioridad estadística, optimalidad de ninguno de los métodos ni rendimiento en robot físico. Los intervalos de Wilson son ilustrativos por condición, no incertidumbre de semillas de entrenamiento. La cifra histórica del 97 % del repositorio original usa una evaluación distinta y no se sustituye por estos resultados. El model-index oficial no declara resultados adicionales.

## Requisitos de hardware

- Inferencia en CPU: el autor ejecutó toda la evaluación en CPU; no se requiere GPU.
- VRAM estimada: no aplica para el actor NumPy; para el checkpoint SB3, no disponible (el tamaño del repositorio es de 0,0 GB según Hugging Face).
- GPU recomendadas: ninguna; el diseño prioriza CPU con BLAS (se recomienda fijar `OPENBLAS_NUM_THREADS=1` y `OMP_NUM_THREADS=1` para reproducibilidad).
- Cabe en cualquier equipo consumer: el actor es una red de dos capas de 512 unidades.
- Opciones de despliegue: Python con NumPy (`policy.py` + `actor.npz`) o Stable-Baselines3 con PyTorch para cargar el checkpoint original mediante `checkpoint.load_model()`.
- Latencia y throughput: los tiempos de inferencia registrados en `summary.json` describen esta ejecución en CPU concreta, no una garantía de tasa de control para un robot real.

## Comparativa con modelos similares

| Modelo | Tipo | Entrada/salida | Licencia | Disponibilidad |
|---|---|---|---|---|
| UR7e SAC Line Following | Política SAC (MLP 512x512) para control cinemático | 29 observaciones float32 → 6 incrementos articulares | MIT | Hugging Face, actor NumPy y checkpoint SB3 |
| Controlador DLS (referencia del propio autor) | Control clásico analítico | Mismas observaciones y límites | no aplica | Implementado en el repositorio de evaluación |
| Otras políticas RL para UR7e | no disponible | no disponible | no disponible | no disponible |

No se dispone de información sobre otros modelos comparables de la misma categoría en la documentación proporcionada.

## Limitaciones y advertencias

- Es una política de simulación cinemática de solo posición: no hay modelo dinámico, de par, de fuerzas de contacto, de orientación de herramienta, de colisión ni de seguridad en tiempo real.
- No hay transferencia sim-to-real validada; el URDF por defecto no está calibrado para un robot concreto.
- El actor exportado es la acción media determinista: no reproduce el muestreo estocástico de SAC ni permite reanudar el entrenamiento.
- El ruido de sensores de la evaluación es una perturbación ilustrativa gaussiana independiente por paso, no un modelo de ruido de hardware calibrado.
- La historia de semillas de las trayectorias de entrenamiento originales no está disponible, por lo que no se puede certificar disjunción exacta respecto a las trayectorias de evaluación.
- Los intervalos de Wilson son ilustrativos por condición y no constituyen análisis formal de muestreo estratificado ni incertidumbre de semillas.
- La cifra histórica del 97 % del repositorio original emplea una evaluación diferente y no es comparable con los resultados medidos aquí.
- El checkpoint original de SB3 contiene metadatos Python serializados; para inferencia sin deserialización debe usarse el actor NumPy.
- Licencia MIT: permite uso comercial, pero el alcance técnico (simulación cinemática sin garantías de seguridad) limita su aplicabilidad directa en producción física.
- No es un modelo de lenguaje: no tiene capacidades de generación de texto, razonamiento, código, visión ni multilingüismo.

## Enlaces

- Hugging Face: https://huggingface.co/devkumarhf/ur7e-sac-line-following
- Repositorio fuente (UR7e Reinforcement Learning Suite): https://github.com/devkumar-projects/UR7e-Reinforcement-Learning-Suite
- Laboratorio interactivo (UR7e Policy Lab): https://huggingface.co/spaces/devkumarhf/UR7e-Policy-Lab
- Benchmark en Kaggle: https://www.kaggle.com/code/devkumarkaggle/ur7e-sac-vs-dls-reproducible-policy-benchmark
