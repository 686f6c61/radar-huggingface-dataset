# nova819/sole-r1-v3-sft

## Resumen

sole-r1-v3-sft es un ajuste fino supervisado (SFT) del modelo multimodal Qwen3-VL-8B-Instruct, desarrollado por el usuario nova819. El modelo está orientado a la inferencia de progreso en tareas de manipulación robótica, concretamente en el conjunto de tareas LIBERO Spatial, donde predice un porcentaje de avance junto con una cadena de razonamiento (CoT) espacio-temporal. No es una política de acciones: no genera comandos motores, sino estimaciones de progreso a partir de observaciones visuales.

El modelo se presenta como el resultado final de la fase SFT de la versión v3 del proyecto SOLE-R1, aunque el autor aclara explícitamente que no se inicializó con los pesos oficiales de SOLE-R1 ni es una versión oficial de dicho proyecto. Se apoya en la arquitectura de Qwen3-VL-8B-Instruct, un transformer multimodal de aproximadamente 8 mil millones de parámetros con capacidad de procesamiento de imagen y texto.

La relevancia del modelo reside en su enfoque: aplicar razonamiento visual-lenguaje a la estimación de progreso en robótica, una señal útil para entrenamiento por refuerzo en línea. Al tratarse de un ajuste fino reciente y con cero descargas, su validación comunitaria es aún inexistente, y el propio autor advierte que el funcionamiento técnico no demuestra ganancias de RL.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (base: Qwen3-VL-8B-Instruct) |
| Parametros totales | no disponible (modelo base de ~8B) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | BF16 (v3); FP32 (v7); no se detallan otras |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (librería transformers) |

## Arquitectura y entrenamiento

El modelo parte de Qwen3-VL-8B-Instruct, un transformer multimodal que procesa entradas de imagen y texto para generar respuestas. Sobre esta base, nova819 aplica un ajuste fino supervisado (SFT) utilizando el dataset nova819/sole-r1-v3-data, orientado a la predicción de progreso y a la generación de cadenas de razonamiento espacio-temporal en tareas LIBERO Spatial. El autor indica que los pesos se almacenan en BF16 para la versión v3 y en FP32 para la v7, y que se conservan íntegramente los pesos, el tokenizer y el processor del modelo.

No se especifican en la información disponible el número de tokens de entrenamiento, la composición exacta del dataset ni si se aplicaron técnicas de RLHF o DPO. El autor menciona que el proyecto SOLE-R1 original emplea una receta híbrida de dos etapas (SFT más RLVR con GRPO), pero aclara que este modelo concreto es únicamente el resultado de la fase SFT y que no se inicializó con los pesos finales oficiales de SOLE-R1. No se documentan innovaciones técnicas adicionales como decodificación especulativa o atención lineal.

## Capacidades

- Generación de texto y razonamiento multimodal: procesa imágenes junto con texto para producir respuestas.
- Predicción de progreso: estima un porcentaje de avance en tareas de manipulación robótica (LIBERO Spatial).
- Cadena de razonamiento (CoT) espacio-temporal: genera explicaciones intermedias sobre el estado de la tarea.
- Comprensión visual: identifica objetos y estados relevantes en las observaciones.
- Integración con Transformers: carga mediante Qwen3VLForConditionalGeneration y AutoProcessor (Transformers 4.57.3).
- Compatibilidad con endpoints: etiquetado como endpoints_compatible.
- No es una política de acciones: no genera comandos motores ni trayectorias de control.

## Casos de uso

- Estimación de progreso en robótica de manipulación: el modelo recibe observaciones visuales de una tarea LIBERO Spatial y devuelve un porcentaje de avance junto con una justificación, útil para monitorizar la ejecución de una política existente.
- Señal de recompensa para RL en línea: la predicción de progreso puede emplearse como señal auxiliar en pipelines de refuerzo, tal como plantea el proyecto SOLE-R1 original, aunque el autor advierte que no se ha demostrado la ganancia de RL.
- Anotación asistida de trayectorias: genera cadenas de razonamiento que pueden servir como datos de entrenamiento o para auditar la calidad de demostraciones robóticas.
- Evaluación de políticas de manipulación: permite comparar el avance real frente al esperado en episodios de tareas espaciales, detectando bloqueos o desviaciones.
- Investigación en razonamiento visual-lenguaje: sirve como punto de partida para estudiar la relación entre CoT y precisión en predicción de progreso.
- Prototipado en entornos de simulación: al integrarse con Transformers, puede desplegarse en pipelines de inferencia sobre fotogramas de simulación LIBERO para experimentación académica.
- Análisis de vídeo de tareas robóticas: con el protocolo de entrada adecuado, permite extraer descripciones del estado de la tarea a partir de secuencias visuales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma oficial; para un modelo de ~8B en BF16 se requiere habitualmente en torno a 16-18 GB, y en FP32 alrededor de 32 GB, aunque estas cifras no las confirma el autor.
- GPU recomendadas: no especificadas; por tamaño, cabría esperar A100, H100 o RTX 4090, sin confirmación oficial.
- GPU de consumo: probablemente viable en tarjetas con 24 GB o más en BF16, pero no documentado.
- Opciones de despliegue: Transformers 4.57.3 (Qwen3VLForConditionalGeneration y AutoProcessor); el autor no menciona vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| sole-r1-v3-sft | ~8B (base) | no disponible | no disponible | Hugging Face (0 descargas) | SFT sobre Qwen3-VL-8B-Instruct para progreso LIBERO Spatial |
| Qwen3-VL-8B-Instruct | ~8B | no disponible | no disponible | Hugging Face (oficial) | Modelo base multimodal de propósito general |
| SOLE-R1 (oficial) | no disponible | no disponible | no disponible | Proyecto de investigación | Receta SFT + RLVR (GRPO); no es el mismo modelo |

## Limitaciones y advertencias

- No es una política de acciones: no debe usarse para control motor directo.
- No es una versión oficial de SOLE-R1 ni se inicializó con sus pesos finales.
- El protocolo de entrada es estricto: el rol de la imagen y el prompt deben seguir el protocolo de entrenamiento del dataset; no vale cualquier imagen.
- Riesgo de errores de reconocimiento visual, en la cadena de razonamiento y en la estimación de progreso, según advierte el propio autor.
- El autor señala que el funcionamiento técnico no demuestra ganancias de RL.
- Licencia no disponible: no puede confirmarse el uso comercial.
- Idiomas soportados no disponibles.
- Modelo con cero descargas y sin validación comunitaria; sin benchmarks publicados.
- Longitud de contexto no documentada.

## Enlaces

- Hugging Face: https://huggingface.co/nova819/sole-r1-v3-sft
- Modelo base: https://huggingface.co/Qwen/Qwen3-VL-8B-Instruct
- Dataset: https://huggingface.co/datasets/nova819/sole-r1-v3-data
- Proyecto SOLE-R1: https://philip-mit.github.io/sole-r1/
- Paper SOLE-R1: https://arxiv.org/html/2603.28730v2
