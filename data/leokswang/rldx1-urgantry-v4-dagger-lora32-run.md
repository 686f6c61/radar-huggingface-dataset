# leokswang/rldx1-urgantry-v4-dagger-lora32-run

## Resumen

`leokswang/rldx1-urgantry-v4-dagger-lora32-run` es un checkpoint de investigación publicado en Hugging Face que consiste en un adaptador LoRA (rango 32, alpha 64) entrenado sobre el modelo Vision-Language-Action (VLA) RLDX-1, concretamente sobre la variante `RLWRLD/RLDX-1-MT-ALLEX` de 8,1 mil millones de parámetros en bf16 (16 GB), más un post-entrenamiento específico para el entorno simulado `urgantry_sim` de maxlab. El objetivo del modelo no es la generación de texto, sino la manipulación robótica diestra: producir secuencias de acciones (48 objetivos articulares absolutos en radianes, en bloques de 40 pasos) para un torso humanoide ALLEX con dos brazos UR7e montados en pórticos y dos manos Wuji de cinco dedos.

El modelo resuelve un problema concreto de robótica: ejecutar la tarea de recoger un cubo ("pick up the green cube") de principio a fin en simulación, superando la línea base mediante entrenamiento con DAgger (recuperaciones expertas desde estados visitados por la política). La versión documentada como `v4_dagger/checkpoint-3000` alcanza 35/70 episodios correctos con el cubo fijo, a 15 Hz y ejecutando 8 de cada 16 acciones del bloque, frente a 23/50 del checkpoint `v0` sin DAgger.

Es relevante porque muestra un flujo completo y reproducible de adaptación de un VLA grande a un embodiment distinto del original (transferencia ALLEX → UR7e con manos Wuji) usando LoRA sobre el modelo de acción, y porque documenta de forma transparente las limitaciones del retargeting cuando no existe URDF público del hardware de destino. No obstante, se trata de un artefacto de investigación sin licencia declarada, sin benchmarks estandar y sin garantías de robustez.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-Language-Action (VLA) sobre backbone VLM Qwen3-VL-8B + Multi-Stream Action Transformer (MSAT); fork de GR00T N1.7 |
| Parametros totales | 8,1 mil millones (modelo base `RLDX-1-MT-ALLEX`); el adaptador LoRA es de rango 32 y el recuento de parámetros del adaptador no está disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (procesa 4 fotogramas de vídeo egocéntrico en los offsets -6, -4, -2, 0 pasos, más memoria de sesión entre llamadas) |
| Tipos de cuantizacion | bf16 (16 GB); no se documentan otros formatos cuantizados |
| Idiomas soportados | no disponible (heredados del backbone Qwen3-VL, pero no declarados en la ficha) |
| Licencia | no disponible |
| Formato de pesos | safetensors (etiqueta `safetensors`; el repositorio ocupa 51,2 GB) |
| Embodiment | Etiqueta `GENERAL_EMBODIMENT`; en este checkpoint corresponde al humanoide ALLEX de torso superior (48 articulaciones) |
| Espacio de acciones | 48 objetivos articulares absolutos: brazo izq. 7, mano izq. 15, cuello 2, brazo der. 7, mano der. 15, cintura 2 (radianes) |
| Bloque de acción | 40 pasos por chunk |
| Frecuencia de control | 15 Hz (en la evaluación documentada, ejecutando 8 de 16 acciones) |
| Normalización | Estadísticas incluidas en el checkpoint (`processor/statistics.json`, q01/q99 a [-1, 1]) |

## Arquitectura y entrenamiento

RLDX-1 es un modelo de acción multimodal que combina un backbone VLM preentrenado Qwen3-VL-8B con una arquitectura Multi-Stream Action Transformer (MSAT) que aporta tres capacidades funcionales según el repositorio oficial: conciencia de movimiento, memoria a largo plazo y percepción física. Esta implementación concreta es un fork de GR00T N1.7 orientado a manipulación diestra. La entradas a la política son cuatro fotogramas de una cámara egocéntrica (offsets temporales -6, -4, -2 y 0 pasos), además de un identificador de sesión con bandera de reinicio que activa el módulo de memoria entre llamadas. El checkbox que se publica aquí es `RLDX-1-MT-ALLEX`, con estadísticas de normalización embebidas.

El post-entrenamiento documentado (fecha 2026-09-13) parte de `RLDX-1-PT` más un LoRA sobre el modelo de acción, entrenado sobre demostraciones de picks guionizados en el entorno urgantry. El dataset se recolecta en formato LeRobot v2.1 (con `meta/modality.json`, solo episodios exitosos) y el entrenamiento usa un launcher DDP sin DeepSpeed, con LoRA r32/alpha 64, batch global 8, acumulación de gradiente 2 y 4000 pasos. La variante v4 incorpora recuperaciones expertas mediante DAgger (`collect_dagger.py` graba recuperaciones desde estados visitados por la política, requiriendo un servidor de política en ejecución). Se documentan tres configuraciones de entorno: `urgantry_config.py` (articulaciones absolutas, top1), `urgantry_relative_config.py` (brazos relativos) y `urgantry_wrist_config.py` (top1 + muñeca derecha). El model card advierte explícitamente de que el retargeting de embodiment en `adapter.py` usa marcadores provisionales y heurísticas ("a guess at ALLEX's order from the dataset mean pose"), ya que no existe URDF público del hardware ALLEX.

## Capacidades

- Manipulación robótica diestra de 48 articulaciones (dos brazos UR7e de 7 GdL, dos manos Wuji de 5 dedos con 15 valores cada una, cuello y cintura de 2 ejes).
- Generación de bloques de acción de 40 pasos a 15 Hz a partir de entrada visual egocéntrica (4 fotogramas) y estado articular.
- Memoria de sesión entre llamadas, con bandera de reinicio que permite mantener contexto a lo largo de una secuencia de manipulación.
- Percepción física y conciencia de movimiento heredadas de la arquitectura MSAT del RLDX-1 original.
- Comprensión de instrucciones en lenguaje natural como prompt de la política (por ejemplo, "pick up the green cube").
- Transferencia de embodiment mediante tres modos de adaptación: `joint_delta` (mapeo articular UR7e→ALLEX con brazo izquierdo espejado), `hands_only` (agarre con mano guionizada y control de manos por el modelo) y `none` (brazos fijos, el modelo controla solo las manos).
- Mapeo de manos ALLEX (grupos de tres valores: abducción, MCP, PIP) a Wuji (MCP→joint1, abd→joint2, PIP→joints 3+4, rotación de pulgar→oposición).
- No se documentan capacidades de texto general, tool calling, function calling ni agentes software; es un modelo de política robótica, no un asistente conversacional.

## Casos de uso

- Recogida de objetos en simulación: el modelo ejecuta la política completa de pick de un cubo ("pick up the green cube") en el entorno `urgantry_sim`, generando bloques de 40 acciones a 15 Hz y alcanzando 35/70 episodios exitosos con el checkpoint v4_dagger. Es adecuado para ciclos rápidos de evaluación de políticas en MuJoCo con renderizado EGL.
- Investigación en transferencia de embodiment: sirve como caso de estudio de adaptación de un VLA entrenado para ALLEX hacia un hardware UR7e + Wuji sin URDF disponible, mostrando los modos `joint_delta`, `hands_only` y `none` y la degradación esperada por el retargeting heurístico.
- Entrenamiento por imitación con DAgger: el script `collect_dagger.py` permite grabar recuperaciones expertas desde estados inducidos por la propia política, un flujo reutilizable para robustecer otras tareas de manipulación.
- Generación de datasets en formato LeRobot v2.1: `collect_lerobot` produce demostraciones exitosas (solo éxitos) con parámetros configurables de ruido de pose (`--pose-noise 0.003`) y radio del cubo, útiles para alimentar otros pipelines de entrenamiento.
- Control de manos de cinco dedos: en modo `hands_only` la política cierra y mantiene el agarre mientras los brazos siguen una trayectoria guionizada, un patrón aplicable a tareas de prensión fina con manos antropomórficas.
- Evaluación con récord de vídeo y telemetría: el evaluador `rldx1-urgantry-eval` permite lanzar episodios con `--save-video`, útil para inspección cualitativa de fallos (por ejemplo, cierre prematuro de la mano) y análisis de curvas de éxito.
- Investigación en memoria a largo plazo en políticas: al conservar estado de sesión entre llamadas, el modelo permite estudiar cómo la memoria afecta tareas de varios pasos más allá del bloque de 40 acciones.
- Servidor de política desacoplado: el modelo corre como servidor de política en su propio entorno virtual y se comunica con el simulador por websocket msgpack, patrón reutilizable para desplegar políticas en arquitecturas cliente/servidor.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible, y aplicar métricas de lenguaje a este modelo no tendría sentido. Los únicos datos de rendimiento disponibles son tasas de éxito en la tarea de pick del entorno `urgantry_sim`:

| Checkpoint | Entorno / tarea | Éxito |
|---|---|---|
| rldx1_urgantry_v0 / checkpoint-3000 | pick guionizado urgantry, 52 articulaciones, cubo fijo, 15 Hz, ejecuta 8 de 16 acciones | 23/50 (46%) |
| rldx1_urgantry_v4_dagger / checkpoint-3000 | pick guionizado urgantry, 52 articulaciones, cubo fijo, 15 Hz, ejecuta 8 de 16 acciones | 35/70 (50%) |
| RLDX-1-MT-ALLEX zero-shot (base) | `urgantry_sim` | no disponible |

Dato de latencia de inferencia documentado por el autor: 10 s de carga del modelo y 75 ms por bloque de acción en una única RTX 5090 en modo eager.

## Requisitos de hardware

- Pesos en bf16: 16 GB para el modelo base `RLDX-1-MT-ALLEX` y 14 GB para `RLDX-1-PT`, según los scripts de descarga del autor. El repositorio publicado ocupa 51,2 GB.
- VRAM estimada para inferencia: como mínimo los ~16 GB de pesos en bf16 más el overhead de activaciones y codificador visual; un presupuesto práctico de 20-24 GB es razonable, aunque el autor no da una cifra explícita.
- GPU recomendadas: el autor verifica funcionamiento en una RTX 5090 (single-GPU, eager, 75 ms/bloque). No se documentan pruebas en A100, H100 ni RTX 4090.
- Cabe en GPU de consumo: sí, en una RTX 5090 (32 GB) según la evidencia del autor; el encaje en GPUs de 16-24 GB (RTX 4090, 4080) no está verificado en la documentación disponible.
- Entrenamiento del LoRA: el autor indica que el LoRA r32 cabe en 2 GPU de 32 GB con 4 muestras por GPU, con batch global 8 y acumulación de gradiente 2.
- Entorno de software: Python 3.10 con flash-attn compilado desde fuente (en la 5090) o Python 3.11 con `RLDX_ATTN_IMPL=sdpa` y sin flash-attn, torch 2.11 cu128 y transformers 4.57. Se advierte de mantener DeepSpeed desinstalado y de usar el backend de vídeo `decord`.
- Opciones de despliegue: el autor proporciona un servidor de política propio (`serve_rldx1.sh`) y un cliente de simulación por websocket msgpack (`rldx1-urgantry-eval`) con renderizado EGL. No se documenta compatibilidad con vLLM, llama.cpp, Ollama ni TGI.
- Latencia: 10 s de carga y 75 ms por bloque de acción en RTX 5090. No se documenta throughput agregado ni latencias en otras GPU.

## Comparativa con modelos similares

La información disponible no incluye fichas técnicas detalladas de modelos alternativos. La comparación se limita a los artefactos mencionados explícitamente por el autor; el resto de campos quedan como "no disponible".

| Modelo | Tipo | Parámetros | Contexto / entrada | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| rldx1-urgantry-v4-dagger-lora32 (este) | Adaptación LoRA de un VLA para urgantry | Adaptador LoRA r32 sobre base de 8,1B | 4 fotogramas + estado articular, memoria de sesión | no disponible | Hugging Face (`leokswang`) |
| RLDX-1-MT-ALLEX | VLA base (Qwen3-VL-8B + MSAT, fork de GR00T N1.7) | 8,1B (16 GB bf16) | no disponible | no disponible | Hugging Face (`RLWRLD`) |
| RLDX-1-PT | VLA preentrenado previo al post-entrenamiento | no disponible (14 GB de pesos) | no disponible | no disponible | Hugging Face (`RLWRLD`) |
| cosmos3_urgantry | Política cliente/servidor para el mismo entorno urgantry | no disponible | no disponible | no disponible | no disponible |
| dexora_urgantry | Política cliente/servidor para el mismo entorno urgantry | no disponible | no disponible | no disponible | no disponible |
| GR00T N1.7 (NVIDIA) | VLA base del que deriva el fork | no disponible en esta información | no disponible | no disponible | repositorio de NVIDIA (no verificado aquí) |

## Limitaciones y advertencias

- Licencia no declarada: no se especifica licencia ni condiciones de uso comercial, lo que impide cualquier explotación en producción sin aclaración previa del autor.
- Artefacto de investigación: se publica como "run" de un experimento (`v4-dagger-lora32-run`) con 0 descargas y 0 likes; no hay señal de mantenimiento ni de soporte.
- Rendimiento limitado: el mejor checkpoint documentado alcanza 35/70 (50%) de éxito con el cubo fijo y ejecutando solo 8 de 16 acciones del bloque. No hay datos con objetos variables, posiciones aleatorias ni perturbaciones fuertes.
- Retargeting heurístico: no existe URDF público del hardware ALLEX, por lo que el mapeo articular (`ARM_MAP`) es una conjetura a partir de la pose media del dataset y el mapeo de manos se hace por rangos. Esto introduce un error estructural que no se cuantifica.
- Modos de control frágiles: `--model-hands-during-approach` falla porque la mano se cierra demasiado pronto, y `--hand-gain 4` es necesario para sostener el cubo durante el levantamiento (7 de 8). Son indicios de fragilidad en la política.
- Dependencia de infraestructura específica: requiere un simulador cliente/servidor por websocket msgpack, un entorno virtual separado para el servidor y un backend de vídeo concreto (decord). No es un modelo que se pueda conectar a un API genérica.
- Versiones temporalmente anómalas: el model card cita fechas de 2026 y stack torch 2.11 / transformers 4.57, datos que deben verificarse antes de replicar.
- Alucinación y sesgos: no aplicable al uso lingüístico, pero sí en el sentido de que la política puede generar acciones sin fundamento físico válido fuera de la distribución de entrenamiento (entorno y objeto vistos). No se documentan análisis de sesgo.
- Idiomas no declarados: aunque el backbone Qwen3-VL sea multilingüe, la ficha no especifica idiomas soportados para el prompt de la política.
- Sin benchmarks estándar: no hay MMLU, HumanEval ni ninguna otra métrica comparable, lo que dificulta situar el modelo frente a alternativas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/leokswang/rldx1-urgantry-v4-dagger-lora32-run
- Checkpoint asociado: https://huggingface.co/leokswang/rldx1-urgantry-v4-dagger-lora32-ckpt3000
- Repositorio oficial de RLDX-1 (RLWRLD): https://github.com/RLWRLD/RLDX-1
- Modelo base `RLWRLD/RLDX-1-MT-ALLEX`: no se proporciona URL directa en la información disponible.
