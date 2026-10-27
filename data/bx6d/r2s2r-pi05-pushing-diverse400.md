# bx6d/r2s2r-pi05-pushing-diverse400

## Resumen

`bx6d/r2s2r-pi05-pushing-diverse400` es un ajuste fino completo del modelo base pi0.5 de openpi (implementación en PyTorch) sobre las 400 demostraciones del dataset `bx6d/r2s2r-pushing-diverse400`. pi0.5 es un modelo visión-lenguaje-acción: recibe dos cámaras de 224x224 y ocho posiciones articulares reales, y devuelve 20 objetivos absolutos de articulación y pinza a 20 Hz (un segundo de trayectoria por llamada). Lo publica el usuario `bx6d` dentro de la serie r2s2r, centrada en reproducir experimentos de imitación con un brazo xArm6 en simulación.

El modelo resuelve una familia concreta de tareas de empuje: llevar una pelota de tenis de 65 mm a la izquierda o a la derecha de un cubo o de un cuenco. Un único conjunto de pesos cubre las cuatro tareas y la instrucción en lenguaje natural selecciona cuál se ejecuta, con 100 demostraciones por tarea. El entrenamiento usa la pérdida nativa de flow matching condicional del base.

Su interés ahora es de reproducibilidad: publica tres checkpoints tempranos (1.000, 1.500 y 2.500 pasos), las tasas de éxito en lazo cerrado sobre layouts vistos y desplazados, y el protocolo de evaluación completo. Todo el trabajo es simulación (demostraciones ejecutadas con actuadores MuJoCo y renderizadas con Blender EEVEE); el autor recomienda `step_002500`, con un 83% de éxito en layouts vistos y un 73% en desplazados (100 ensayos por suite).

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Modelo visión-lenguaje-acción pi0.5 (openpi, PyTorch) con pérdida de flow matching condicional; tokenizador PaliGemma; módulos de Transformers parcheados por openpi |
| Parámetros totales | No disponible (los pesos publicados en FP32 ocupan 14,5 GB; `lm_head` atado a los embeddings) |
| Parámetros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | No disponible (solo se publican pesos FP32; no hay GGUF, INT8 ni FP8) |
| Idiomas soportados | No disponible; las cuatro instrucciones del dataset están en inglés |
| Licencia | No disponible (el repositorio no declara licencia; los modelos base pi0 y pi0.5 de openpi se distribuyen bajo Apache-2.0) |
| Formato de pesos | `model.safetensors` (FP32), más `norm_stats.json` (normalización q01/q99 calculada solo con el train) y `config.json` |
| Entradas | Cámara de mesa y cámara de muñeca a 224x224, más 8 posiciones articulares reales, más instrucción de texto |
| Salidas | 20 objetivos absolutos de articulación y pinza por llamada |
| Frecuencia de control | 20 Hz (un chunk = 1 s de trayectoria) |
| Dominio | Manipulación robótica en simulación (brazo xArm6, MuJoCo + Blender EEVEE) |
| Tamaño del repositorio | 43,4 GB |

## Arquitectura y entrenamiento

El modelo parte del base pi0.5 de openpi y se ajusta de forma completa (todos los pesos, sin LoRA ni adaptadores) con la pérdida nativa de flow matching condicional, que modela la distribución de chunks de acción continuos condicionada por las observaciones visuales, el estado propioceptivo y la instrucción textual. La interfaz es de troceado de acciones: cada inferencia produce 20 consignas absolutas de articulación y pinza que se ejecutan a 20 Hz, de modo que el bucle de control debe renovar el chunk antes de agotar el segundo de trayectoria.

Los datos son 400 episodios de simulación, 100 por tarea, generados ejecutando demostraciones con los actuadores de posición de MuJoCo y renderizando las dos cámaras con Blender EEVEE. El autor indica que los 1.500 pasos de optimización equivalen aproximadamente a un cuarto de época, lo que sitúa una época completa en torno a los 6.000 pasos; el checkpoint recomendado (2.500 pasos) corresponde por tanto a una fracción pequeña del entrenamiento. No se documentan número de tokens, composición del dataset más allá de los 400 episodios, ni fases de RLHF o DPO. Los estados del optimizador no se incluyen, por lo que el entrenamiento no puede reanudarse desde estos ficheros.

## Capacidades

- Ejecución de cuatro tareas de empuje seleccionadas por instrucción: "Push the tennis ball to the left of the cube", "…to the right of the cube", "…to the left of the bowl" y "…to the right of the bowl".
- Política multi-tarea con un único juego de pesos: no requiere un modelo por tarea, solo cambiar la instrucción.
- Fusión de dos vistas de cámara (mesa y muñeca) con propiocepción de 8 articulaciones en un único espacio de representación.
- Generación de acciones continuas en chunks de 20 pasos a 20 Hz, con consignas absolutas de articulación y pinza.
- Control en lazo cerrado: las cámaras se vuelven a renderizar antes de cada chunk durante la evaluación.
- Robustez moderada a desplazamientos: el modelo funciona con la pelota y el objeto de referencia movidos 2-3 cm respecto a los layouts de entrenamiento (73% de éxito agregado en esa suite).
- No dispone de tool calling, function calling, razonamiento multi-paso, capacidades de agente, matemáticas, generación de código ni otras modalidades (audio, vídeo). No hay evidencia de soporte multilingüe: solo se han probado instrucciones en inglés.

## Casos de uso

- Reproducción de experimentos VLA en simulación: sirve como referencia para validar una instalación de `rlinf-openpi==0.1.1` con torch 2.7.1 y el tokenizador PaliGemma, ya que incluye `inference_example.py` y el comando de demostración listo para ejecutar.
- Punto de partida para ajuste fino con robot real: al ser un fine-tune completo y no un adaptador, puede servir de inicialización para un xArm6 físico, aunque las extrínsecas de cámara y la dinámica real no están validadas y habría que recoger datos propios.
- Evaluación de robustez ante distribución desplazada: la suite `shifted` (objetos movidos 2-3 cm) permite medir degradación de una política sin necesidad de diseñar escenarios nuevos, comparando checkpoints con el mismo protocolo.
- Estudio de movimientos de precisión: el fallo documentado en los empujes a la derecha (la mano se queda a 7,7 cm de la pelota en vez de acercarse lentamente) es un caso concreto para investigar límites de precisión en políticas de flow matching.
- Docencia y divulgación sobre imitación multi-tarea: el repositorio incluye las curvas de éxito por checkpoint y el protocolo de éxito completo (`relation_definition`), lo que permite explicar métricas de evaluación en robótica con datos reales.
- Comparación de políticas en un pipeline interno de CI: la carpeta `evaluation/` contiene ambas suites y los resúmenes por paso, de modo que se puede integrar como test de regresión de una política antes de desplegarla en otro entorno simulado.
- Generación de datos sintéticos como currículum: los 400 episodios y el esquema de cuatro tareas con 100 demostraciones cada una sirven de plantilla para construir variantes (otros objetos de referencia, otros tamaños de pelota) con el mismo contrato de observación y acción.

## Benchmarks y rendimiento

Éxitos sobre 25 ensayos por tarea y suite. Los totales se expresan como porcentaje con intervalo de confianza de Wilson al 95%.

| Tarea | 1k visto | 1k desplazado | 1,5k visto | 1,5k desplazado | 2,5k visto | 2,5k desplazado |
|---|---:|---:|---:|---:|---:|---:|
| Izquierda del cubo | 15/25 | 12/25 | 22/25 | 20/25 | 25/25 | 25/25 |
| Derecha del cubo | 11/25 | 10/25 | 4/25 | 3/25 | 24/25 | 19/25 |
| Izquierda del cuenco | 13/25 | 8/25 | 19/25 | 14/25 | 20/25 | 19/25 |
| Derecha del cuenco | 1/25 | 2/25 | 1/25 | 2/25 | 14/25 | 10/25 |
| **Las cuatro** | 40% (31-50) | 32% (24-42) | 46% (37-56) | 39% (30-49) | **83% (74-89)** | **73% (64-81)** |

Notas del autor sobre la evaluación: "visto" significa 25 layouts de entrenamiento por tarea con su cámara, iluminación y posición inicial de brazo registradas; el release no incluye episodios reservados (held-out). "Desplazado" significa otros 25 layouts de entrenamiento con la pelota y el objeto de referencia movidos 2-3 cm en una dirección aleatoria, dentro del rango de entrenamiento, y no verificado por un experto programado. Un cuarto checkpoint (3.500 pasos) obtuvo 95/200 y no se incluye. No se han publicado resultados de benchmarks estándar de lenguaje (MMLU, HumanEval, GSM8K) en la información disponible, ni tendrían sentido para una política de acción.

## Requisitos de hardware

- VRAM estimada para inferencia: 14,5 GB solo para los pesos FP32; con activaciones, dos imágenes de 224x224, estado propioceptivo y tokenizador, el margen realista se sitúa en 18-24 GB. No hay cifras oficiales de consumo publicado.
- GPU recomendadas: A100 (40 u 80 GB), H100 (80 GB) o L40S (48 GB) para dejar margen y ejecutar varias instancias; RTX 4090 o RTX 3090 (24 GB) son viables pero muy ajustadas.
- Cabe en GPU de consumo: sí, en tarjetas de 24 GB y con una sola instancia por GPU. No es razonable en tarjetas de 16 GB o menos sin cuantizar por cuenta propia, algo que el repositorio no documenta ni soporta.
- Opciones de despliegue: el contrato oficial es Python 3.11, torch 2.7.1, `rlinf-openpi==0.1.1` con los módulos de Transformers parcheados de openpi, el tokenizador PaliGemma y `JAX_PLATFORMS=cpu`; se incluye `inference_example.py` como wrapper autónomo con demo por línea de comandos. No hay soporte para vLLM, TGI, llama.cpp, Ollama ni formatos GGUF, porque se trata de una política de acción y no de un modelo de lenguaje generativo.
- Latencia y throughput: no documentados. Como referencia de diseño, cada inferencia cubre un chunk de 20 acciones a 20 Hz (1 s de trayectoria), por lo que la latencia por llamada debe quedar por debajo de ese segundo para no vaciar el buffer durante el control en lazo cerrado.
- Almacenamiento: 43,4 GB de repositorio completo; cada checkpoint son 14,5 GB de pesos más los ficheros de normalización y configuración.

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros | Contexto | Tareas | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| `bx6d/r2s2r-pi05-pushing-diverse400` (este) | Fine-tune completo de pi0.5 | No disponible (14,5 GB FP32) | No disponible | 4 tareas de empuje, simulación | No disponible | Pesos FP32 + evaluación |
| pi0.5 base (openpi) | VLA base | No disponible | No disponible | Propósito general, ajustable | Apache-2.0 | Repositorio openpi |
| `bx6d/r2s2r-pi05-six-tasks-diverse600` | Fine-tune de pi0.5 | No disponible | No disponible | 6 tareas | No disponible | Pesos + evaluación |
| `bx6d/r2s2r-pi05-blue-cube-to-bowl-stage1` | Fine-tune de pi0.5 | No disponible | No disponible | 1 tarea (pick-and-place) | No disponible | Pesos + evaluación |

La comparación relevante es con los otros fine-tunes de la misma serie: comparten contrato de inferencia (dos cámaras 224x224, 8 articulaciones, chunks de 20 acciones a 20 Hz), entorno de ejecución y origen de datos sintético, y se diferencian en el número y la naturaleza de las tareas y en el número de episodios (400 aquí, 600 en la variante de seis tareas). Frente al base pi0.5, este modelo está especializado y no conserva capacidades generales verificadas. No se dispone de datos de benchmarks comparables entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- Solo simulación: las demostraciones se ejecutaron con actuadores MuJoCo y se renderizaron con Blender EEVEE. Las extrínsecas de cámara físicas y la dinámica del robot real no están validadas, por lo que el rendimiento en un xArm6 físico es desconocido.
- Sin episodios reservados: la suite "visto" usa los mismos layouts que el entrenamiento, así que el 83% no es una medida de generalización. La suite "desplazado" sí mueve objetos, pero dentro del rango de entrenamiento y sin verificación por un experto programado.
- Checkpoints tempranos: 2.500 pasos equivalen aproximadamente a un 40% de una época. El propio autor califica los resultados de frágiles en los empujes a la derecha y documenta que un checkpoint posterior (3.500 pasos) rindió peor y no se publica.
- Fallo característico en empujes a la derecha: el modelo se detiene a 7,7 cm de la pelota o se aleja en lugar de acercarse. En el mejor checkpoint, los 7 fallos de "derecha del cubo" y 12 de los 26 fallos de "derecha del cuenco" nunca llegaron a tocar la bola.
- Fallo parcial en tareas de cuenco: la mayoría de los fallos que sí tocan la pelota la desplazan 8 cm o más lateralmente pero dejan menos de 2 cm entre la pelota y el cuenco de 17 cm, es decir, se quedan cerca del criterio de éxito sin cumplirlo.
- Sesgo de dominio evidente: un único robot, un único tipo de pelota, dos objetos de referencia, una mesa y un conjunto cerrado de cuatro instrucciones en inglés. Cualquier variación de instruscción, idioma u objeto queda fuera de la distribución.
- Riesgo de "alucinación" trasladado al dominio motor: la política puede generar trayectorias plausibles que no completan la tarea o que rozan el objeto de referencia; el autor verifica que la referencia se mueve como máximo 3 mm y que la pelota no se eleva más de 6 mm, pero el modelo no reporta incertidumbre ni señal de fallo.
- Licencia no declarada en el repositorio: no se puede asumir uso comercial. El base pi0.5 de openpi es Apache-2.0, pero esa licencia no se hereda automáticamente a este fine-tune sin una declaración explícita del autor.
- No hay estados del optimizador ni cuantizaciones publicadas: no se puede reanudar el entrenamiento ni reducir la huella de memoria sin trabajo adicional no documentado.
- Contrato de inferencia frágil: depende de una versión concreta de `rlinf-openpi` (0.1.1), torch 2.7.1 y de los módulos parcheados de Transformers; cambios de versión pueden romper la carga de pesos.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/bx6d/r2s2r-pi05-pushing-diverse400
- Dataset de entrenamiento: https://huggingface.co/datasets/bx6d/r2s2r-pushing-diverse400
- Dataset relacionado (pick-and-place): https://huggingface.co/datasets/bx6d/r2s2r-blue-cube-to-bowl-diverse400
- Fine-tune previo de seis tareas: https://huggingface.co/bx6d/r2s2r-pi05-six-tasks-diverse600
- Fine-tune previo de una tarea: https://huggingface.co/bx6d/r2s2r-pi05-blue-cube-to-bowl-stage1
- Repositorio openpi (modelos base pi0, pi0-FAST y pi0.5, Apache-2.0): https://github.com/Physical-Intelligence/openpi
- Artículo sobre Physical Intelligence, pi0/pi0.5 y openpi (octubre de 2026): https://physicalailab.io/en/physical-intelligence-pi-models-openpi-api/
- Implementación de pi0.5 para dispositivos Qualcomm: https://github.com/qualcomm/ai-hub-models/tree/main/src/qai_hub_models/models/pi05
- Código base de openpi para el reto BEHAVIOR 2025: https://github.com/mli0603/openpi-comet
