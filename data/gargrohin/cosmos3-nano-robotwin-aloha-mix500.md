# gargrohin/cosmos3-nano-robotwin-aloha-mix500

## Resumen

Cosmos3-Nano RobotWin ALOHA mix500 es un ajuste fino (fine-tune) del modelo base `nvidia/Cosmos3-Nano`, desarrollado por el usuario gargrohin, orientado a robótica de manipulación bimanual. Concretamente, es una política de acción (action policy) entrenada sobre las 50 tareas del benchmark RoboTwin 2.0 para el robot de doble brazo `aloha_agilex`. El modelo predice 14 posiciones articulares absolutas (7 por brazo, incluyendo pinzas) a partir de tres cámaras (cabeza y ambas muñecas) y una instrucción de tarea en lenguaje natural.

El modelo hereda la arquitectura multimodal de Cosmos3-Nano (aproximadamente 15.200 millones de parámetros, con una mitad de "entendimiento" y otra de "generación" más cabezas de acción), y el ajuste fino se aplica únicamente sobre el experto de generación y las cabezas de acción (unos 7.000 millones de parámetros), manteniendo congelada la mitad de comprensión. La relevancia de este modelo radica en sus resultados: supera ampliamente a alternativas como FLUX 3 Action y GR00T N1.7 en las mismas escenas de evaluación de RoboTwin 2.0, con un 87,1 % de éxito en escenas aleatorizadas y un 88,4 % en escenas limpias.

Se distribuye con licencia OpenMDW-1.1, en formato safetensors bf16, y está pensado para su uso con el framework de inferencia de NVIDIA (`cosmos-framework`). No es un modelo de propósito general, sino un checkpoint especializado para investigación y despliegue en robótica bimanual con el robot ALOHA AgileX.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Cosmos3-Nano (modelo multimodal con mitad de entendimiento y mitad de generación; cabezas de acción para robótica) |
| Parametros totales | 15.173.136.576 (≈15,2B) |
| Parametros activos | no disponible (no es MoE según la información disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos distribuidos en bf16) |
| Idiomas soportados | no disponible (tokenizador heredado de Qwen3-VL-8B-Instruct) |
| Licencia | OpenMDW-1.1 |
| Formato de pesos | safetensors (bf16), con `model.safetensors.index.json` |

## Arquitectura y entrenamiento

El modelo parte de `nvidia/Cosmos3-Nano` (revisión `e59a53c2`) y se ajusta con el `cosmos-framework` de NVIDIA. La arquitectura base combina una mitad de entendimiento (comprensión multimodal) y una mitad de generación, sobre la que se añaden cabezas de acción específicas para robótica. En este fine-tune se entrena completamente el experto de generación y las cabezas de acción (unos 7.000 millones de parámetros de los 15,2 totales), mientras que la mitad de entendimiento permanece congelada. El modelo base utiliza un tokenizador y procesador heredados de Qwen3-VL-8B-Instruct, y un VAE de vídeo Wan2.2 (no incluido en este repositorio, ya que se reutiliza el del modelo base).

El entrenamiento se realizó sobre el dataset mix500 de RoboTwin 2.0: por cada una de las 50 tareas, 50 demostraciones limpias y 495 aleatorizadas, lo que suma 27.250 episodios y 6,0 millones de fotogramas. Se reservaron 5 demostraciones aleatorizadas por tarea para validación. Las entradas son tres cámaras (cabeza y ambas muñecas) a 15 fps, con chunks de 16 acciones; las acciones se normalizan con los cuantiles q01/q99 de `action_stats.json`. La receta incluye AdamW fusionado con betas (0,9, 0,99), weight decay 0,05, clipping de gradiente 1,0 y un factor 5× en la tasa de aprendizaje de las cabezas de acción. Se entrenó con batch 2.048 durante 6.000 iteraciones, con warm-up de 500 iteraciones, descenso lineal lento hasta 5.000 y decaimiento lineal hasta 0 en 6.000. Los pesos publicados son los del EMA en la iteración 6.000, en bf16, verificados tensor a tensor contra el checkpoint de entrenamiento.

## Capacidades

- Predicción de acciones robóticas: genera 14 posiciones articulares absolutas (7 por brazo, incluyendo pinzas) para el robot bimanual ALOHA AgileX.
- Control visomotor multimodal: procesa simultáneamente tres cámaras (cabeza y ambas muñecas) junto con la instrucción de tarea en lenguaje natural.
- Ejecución de tareas de manipulación bimanual: entrenado sobre las 50 tareas de RoboTwin 2.0.
- Robustez ante variaciones visuales: funciona con mesas desordenadas, fondos aleatorios, iluminación y altura de mesa variables.
- Generalización a reformulaciones de instrucciones: evaluado con redacciones de instrucción no vistas durante el entrenamiento.
- Generación de chunks de acción: produce 16 acciones por llamada a 15 fps.
- No se ha documentado soporte de tool calling, function calling, agentes multi-paso ni modo thinking en la información disponible.
- Capacidades multilingües: no disponible (el modelo está orientado a instrucciones de tarea, presumiblemente en inglés, pero no se especifica).

## Casos de uso

- Manipulación bimanual en investigación robótica: el modelo sirve como política de referencia para experimentos con el robot ALOHA AgileX en las 50 tareas de RoboTwin 2.0, permitiendo reproducir y comparar resultados con GR00T N1.7 y FLUX 3 Action sobre las mismas escenas y semillas de evaluación.
- Benchmarking de políticas de acción: dado que se evaluó con el script oficial de RoboTwin y sobre las mismas semillas que GR00T N1.7, es adecuado para establecer líneas base reproducibles en papers y comparativas de nuevos métodos.
- Despliegue en entornos con clutter: su 87,1 % de éxito en escenas aleatorizadas (mesas desordenadas, fondos e iluminación variables) lo hace apto para pruebas en entornos reales con condiciones no controladas.
- Evaluación de robustez ante paráfrasis: al haber sido evaluado con redacciones de instrucción no vistas, puede usarse para estudiar la sensibilidad de políticas visomotoras a variaciones lingüísticas.
- Generación de datos sintéticos de trayectorias: las predicciones de chunks de 16 acciones a 15 fps pueden emplearse para aumentar datasets de demostración o para imitación en simulación.
- Investigación en ajuste fino de modelos fundacionales para robótica: el repositorio de código asociado (`robotwin-posttrain`) documenta el pipeline completo de entrenamiento y evaluación, útil para replicar el proceso con otras tareas o robots.
- Análisis de fallos y mejora de políticas: el repositorio incluye notas de resultados por tarea y análisis de fallos, lo que facilita estudiar modos de error concretos en manipulación bimanual.

## Benchmarks y rendimiento

Resultados sobre las 50 tareas de RoboTwin 2.0, evaluados con el script oficial y sobre las mismas escenas y semillas que GR00T N1.7:

| Modelo | Datos de entrenamiento | Aleatorizado (1.015 escenas) | Limpio (499 escenas) |
|---|---|---|---|
| Este modelo (Cosmos3-Nano, iteración 6.000) | mix500 | 87,1 % | 88,4 % |
| Cosmos3-Nano, iteración 5.500 | mix200 | 85,0 % | 88,6 % |
| FLUX 3 Action, update 9.000 | mix200 | 75,6 % | 77,8 % |
| GR00T N1.7 | mix200 | 45,3 % | 45,5 % |

Los resultados por tarea y el análisis de fallos están disponibles en `notes/results.md` y `notes/eval_analysis.md` del repositorio de código.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; con 15,2B parámetros en bf16, los pesos ocupan aproximadamente 30,3 GB, por lo que se necesita al menos una GPU con 40 GB o más para cargar el modelo completo en bf16 sin cuantización.
- GPU recomendadas: A100 40/80 GB, H100 80 GB; no se documentan requisitos oficiales en la información disponible.
- ¿Cabe en GPU de consumo? No en bf16 con los 15,2B parámetros completos; se requeriría cuantización (no se documentan formatos GGUF ni cuantizaciones oficiales).
- Opciones de despliegue: inferencia mediante `cosmos-framework` pasando el directorio como `--checkpoint-path`. No se documenta soporte de vLLM, llama.cpp, Ollama ni TGI.
- Configuración de evaluación: UniPC con 30 pasos, shift 5,0, sin classifier-free guidance (guidance 1,0), ejecutando las 16 acciones predichas por llamada.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Éxito aleatorizado | Éxito limpio | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Este modelo (Cosmos3-Nano mix500) | 15,2B | no disponible | 87,1 % | 88,4 % | OpenMDW-1.1 | Hugging Face |
| Cosmos3-Nano mix200 (iter. 5.500) | 15,2B | no disponible | 85,0 % | 88,6 % | OpenMDW-1.1 | Hugging Face |
| FLUX 3 Action (update 9.000) | no disponible | no disponible | 75,6 % | 77,8 % | no disponible | Hugging Face |
| GR00T N1.7 | no disponible | no disponible | 45,3 % | 45,5 % | no disponible | no disponible |

## Limitaciones y advertencias

- Especialización estrecha: solo está entrenado para las 50 tareas de RoboTwin 2.0 y el robot `aloha_agilex`; no es un modelo de propósito general ni se espera que generalice a otros robots o tareas sin reentrenamiento.
- Dependencia del robot y del espacio de acciones: las salidas son 14 posiciones articulares absolutas normalizadas con estadísticas concretas (`action_stats.json`); usarlo con otra cinemática requiere recalibrar.
- Dependencia del VAE: el VAE de vídeo Wan2.2 no está incluido en el repositorio; debe tomarse del modelo base, lo que añade una dependencia externa.
- Riesgo de alucinación en instrucciones: aunque se evaluó con redacciones no vistas, no se documenta su comportamiento ante instrucciones ambiguas o fuera de distribución.
- Sesgos conocidos: no disponibles en la información proporcionada.
- Restricciones de licencia: OpenMDW-1.1 (licencia del modelo base); deben revisarse los términos para uso comercial y las atribuciones recogidas en `NOTICE`.
- Madurez: el repositorio tiene 0 descargas y 0 likes, y fue creado en noviembre de 2026; es un artefacto de investigación reciente sin validación comunitaria.
- Idiomas: no se especifican los idiomas soportados para las instrucciones de tarea.
- Contexto: no se documenta la longitud de contexto del modelo base.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/gargrohin/cosmos3-nano-robotwin-aloha-mix500
- Modelo base: https://huggingface.co/nvidia/Cosmos3-Nano
- Repositorio de código (entrenamiento, evaluación y análisis): https://github.com/gargrohin/robotwin-posttrain
- Framework de NVIDIA: https://github.com/NVIDIA/cosmos-framework
- Modelo comparable FLUX 3 Action: https://huggingface.co/gargrohin/flux3-action-robotwin-aloha-mix200
