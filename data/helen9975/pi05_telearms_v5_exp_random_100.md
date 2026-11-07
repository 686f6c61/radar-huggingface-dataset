# helen9975/pi05_telearms_v5_exp_random_100

## Resumen

`pi05_telearms_v5_exp_random_100` es un checkpoint de robótica obtenido mediante fine-tuning completo del modelo base π₀.₅ (`lerobot/pi05_base`) sobre un subconjunto de demostraciones simuladas de manipulación bimanual con brazos YAM. Lo publica el usuario `helen9975` dentro de una familia de ocho experimentos (v5) diseñados para comparar estrategias de selección de datos (aleatoria, por ELO, por score, por diversidad de demostraciones) bajo un presupuesto de entrenamiento idéntico. Este checkpoint concreto corresponde a la selección aleatoria de 100 demostraciones por tarea.

El modelo no es un LLM de propósito general: es una política visomotora (vision-language-action) que recibe observaciones de tres cámaras de 224×224 y un prompt de tarea, y emite trozos de acción de 50 pasos con acciones relativas y pinzas absolutas. Cuenta con 4.143.404.816 parámetros en formato safetensors y un repositorio de 18,7 GB, lo que refleja el fine-tuning completo de los componentes de lenguaje, visión y experto en acciones en bf16.

Su relevancia es fundamentalmente metodológica: forma parte de un conjunto controlado de ablaciones sobre selección de datos en robótica simulada, con receta, presupuesto (15,36 M de muestras) y hardware (8×H100) fijos. No obstante, el propio autor indica que el modelo aún no se ha evaluado en simulación y que no hay episodios reservados para validación, por lo que debe tratarse como un artefacto de investigación, no como un modelo listo para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-language-action π₀.₅ (LLM + torre de visión + experto en acciones), fine-tune completo |
| Parametros totales | 4.143.404.816 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (política de acción con chunks de 50 pasos; no se documenta ventana de contexto textual) |
| Tipos de cuantizacion | no disponible (checkpoint publicado en bf16 safetensors; no se documentan GGUF ni otras cuantizaciones) |
| Idiomas soportados | no disponible (prompts de tarea en el dataset; no se declara cobertura multilingüe) |
| Licencia | no disponible |
| Formato de pesos | safetensors (carpeta `pretrained_model/` del checkpoint LeRobot) |

## Arquitectura y entrenamiento

El modelo parte de `lerobot/pi05_base`, una política π₀.₅ que combina un modelo de lenguaje, una torre de visión y un experto en acciones, y se somete a fine-tuning completo (LLM, visión y experto en acciones) en bf16 con gradient checkpointing. La salida son chunks de 50 acciones, expresadas como acciones relativas con pinzas absolutas. El entrenamiento usa variantes de prompt por tarea definidas en `meta/task_prompt_variants.json`.

Los datos proceden del dataset `mliu48/telearms-yam-cube-v5-exp-random-100` (revisión `8960f720`): 1.000 demostraciones simuladas bimanuales de 10 tareas, 962.999 fotogramas a 30 Hz, con tres cámaras de 224×224 y sin domain randomization. La selección es aleatoria, con 100 demostraciones por tarea extraídas de entre todas las demostraciones exitosas que tienen demo score y ELO de jugador valorados; los conjuntos son anidados (Random-50 ⊂ Random-100 ⊂ … ⊂ Random-1500). La receta: AdamW (β = 0,9/0,95, weight decay 0,01), LR pico 1e-4 (2,5e-5 × sqrt(512/32)), 1.000 pasos de warmup, decaimiento coseno hasta 1e-5 en 30.000 pasos, batch global 512 (64 por GPU en 8×H100), 15,36 M de muestras en total. La pérdida de entrenamiento reciente es 0,008. No se reservaron episodios, por lo que no existe pérdida de validación.

## Capacidades

- Control visomotor bimanual: genera comandos de acción para dos brazos YAM a partir de observaciones de tres cámaras de 224×224.
- Ejecución de tareas guiada por prompt: 10 tareas de manipulación definidas en el dataset, con variantes de prompt por tarea.
- Predicción de chunks de acción de 50 pasos con acciones relativas y pinzas absolutas.
- Operación en simulación a 30 Hz sobre datos sin domain randomization.
- No se documenta soporte de tool calling, function calling, agentes multi-paso, razonamiento textual, matemáticas, visión general, audio ni modo thinking.
- Capacidades multilingües: no disponibles.

## Casos de uso

- Investigación en selección de datos para robótica: sirve como punto de comparación directo frente a los otros siete runs v5 (Random-50/500/1000/1500, Elo-1500, Score-1500, DemInf-1500), ya que comparten receta y presupuesto de 15,36 M de muestras.
- Reproducción de experimentos de fine-tuning de π₀.₅: el checkpoint permite reanudar o auditar la receta (LR, warmup, batch, variantes de prompt) descrita en la model card.
- Baseline para manipulación bimanual simulada de cubos: útil para medir el efecto de la selección aleatoria de 100 demos por tarea frente a selecciones informadas por ELO o score.
- Estudio de estabilidad de entrenamiento: los cambios locales documentados (guardas de NaN, corrección de logging con PyAV, mínimo configurable de episodios por tarea) son relevantes para pipelines LeRobot 0.6.1 con el parche del repositorio.
- Evaluación de políticas VLA en entornos con múltiples cámaras: el uso de tres vistas de 224×224 permite probar configuraciones de percepción multi-cámara en tareas de ensamblaje con cubos.
- Docencia y prototipado en robótica simulada: al ser un checkpoint pequeño en parámetros (4,1 B) y con formato LeRobot, puede cargarse en infraestructura de un solo nodo para experimentos académicos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente que el modelo aún no se ha evaluado en simulación y que no hay episodios de validación reservados.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Como referencia orientativa, 4,14 B de parámetros en bf16 requieren aproximadamente 8,3 GB solo para pesos; con activaciones y tres cámaras de entrada, un despliegue realista necesitará más margen.
- GPU recomendadas: el entrenamiento se realizó en 8×H100 (un nodo) con batch 64 por GPU; para inferencia no se documentan requisitos específicos.
- GPU de consumo: no confirmado. Por tamaño de pesos, cabría en GPUs con 16-24 GB de VRAM, pero no hay validación publicada.
- Opciones de despliegue: LeRobot 0.6.1 (con el parche `tools/install_lerobot_patch.py`), librería `lerobot`; no se documentan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de política.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| `helen9975/pi05_telearms_v5_exp_random_100` | 4,14 B | no disponible | no disponible | Hugging Face, 3 descargas | Selección aleatoria de 100 demos/tarea; sin evaluar |
| `helen9975/pi05_telearms_v5_mixed` | no disponible | no disponible | no disponible | Hugging Face | Fine-tune sobre 60.093 demos de 7 tareas, 77,4 M fotogramas; entrenamiento en curso |
| `lerobot/pi05_base` | no disponible | no disponible | no disponible | Hugging Face | Modelo base π₀.₅ sobre el que se hace el fine-tuning |

No se dispone de datos de benchmarks que permitan comparar rendimiento entre estos modelos.

## Limitaciones y advertencias

- No evaluado en simulación: el autor lo indica explícitamente; no hay métricas de éxito por tarea.
- Sin validación: no se reservaron episodios, por lo que no existe pérdida de validación ni estimación de generalización.
- Dominio muy restringido: 10 tareas de cubos con brazos YAM en simulación, sin domain randomization; la transferencia a hardware real no está demostrada.
- Licencia no disponible: no se puede confirmar el uso comercial; debe contactarse con el autor antes de cualquier despliegue productivo.
- Idiomas no declarados: los prompts de tarea están definidos en el dataset y no se documenta cobertura multilingüe.
- Riesgo de sobreajuste a la selección aleatoria de 100 demos por tarea, con posible alta varianza frente a los otros runs v5.
- Repositorio con solo 3 descargas y 0 likes: sin validación comunitaria ni reportes independientes.
- Los cambios locales sobre LeRobot 0.6.1 (guardas de NaN, parche PyAV) implican que la reproducibilidad exacta requiere el código y el parche indicados.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/helen9975/pi05_telearms_v5_exp_random_100
- Dataset: https://huggingface.co/datasets/mliu48/telearms-yam-cube-v5-exp-random-100
- Run hermano (mixture): https://huggingface.co/helen9975/pi05_telearms_v5_mixed
- Modelo base: https://huggingface.co/lerobot/pi05_base
- Código de entrenamiento: `helen9975/RoboEval-telearms`, rama `PI05_training` @ `9dc9e9f` (más cambios locales)
