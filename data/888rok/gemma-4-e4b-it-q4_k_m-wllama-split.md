# 888rok/gemma-4-E4B-it-Q4_K_M-wllama-split

## Resumen

El modelo `888rok/gemma-4-E4B-it-Q4_K_M-wllama-split` es una distribución del checkpoint cuantizado `gemma-4-E4B-it-Q4_K_M.gguf` de unsloth, partido en shards de menos de 2 GB mediante `llama-gguf-split` para poder cargarse en el navegador a través de la librería [wllama](https://github.com/ngxson/wllama). El modelo base es **Gemma 4 E4B**, desarrollado por Google DeepMind, un modelo de la familia Gemma 4 con arquitectura elástica tipo MatFormer: tiene 7.518 millones de parámetros totales pero activa aproximadamente 4.4 mil millones por token, lo que lo convierte en una opción viable para hardware de consumo.

El interés de este split concreto es que permite ejecutar inferencia local completa en el navegador sin servidor, cargando únicamente el primer shard y dejando que wllama resuelva el resto automáticamente. Gemma 4 E4B destaca por su modo de razonamiento ("Thinking Mode"), entrada multimodal y un contexto largo, lo que lo posiciona como un modelo "daily driver" para IA local en GPU de gama media. Esta ficha cubre el modelo base tal y como se distribuye en esta cuantización, con las limitaciones de información que la model card del autor no detalla.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso con arquitectura elástica MatFormer (MoE implícita por activación) |
| Parametros totales | 7.518.069.290 (7.5B) |
| Parametros activos | ~4.4B (por token) |
| Longitud de contexto | no disponible (el modelo base Gemma 4 E4B soporta contexto largo, pero el valor exacto no se publica en esta distribución) |
| Tipos de cuantizacion | Q4_K_M (GGUF) |
| Idiomas soportados | no disponibles (el modelo base de Google es multilingüe, pero la model card no lo especifica) |
| Licencia | no disponible (la licencia de Gemma 4 se publica en la web oficial de DeepMind; esta distribución no la declara) |
| Formato de pesos | GGUF, dividido en shards de <2 GB para wllama |

## Arquitectura y entrenamiento

Gemma 4 E4B es un modelo de la familia Gemma 4 de Google DeepMind que emplea una arquitectura de tipo MatFormer: un transformer con mezcla de expertos (MoE) en el que solo se activa una fracción de los parámetros por token. Esto explica que el checkpoint safetensors tenga 7.5B parámetros totales pero la inferencia requiera efectivamente unos 4.4B activos, reduciendo la memoria necesaria y la latencia respecto a un modelo denso del mismo tamaño total. El modelo se distribuye en cuantización Q4_K_M, que es una de las calibraciones de `llama.cpp` que equilibran calidad y uso de memoria.

El entrenamiento detallado (número de tokens, composición del dataset, presencia de RLHF o DPO) no se documenta en la model card de esta distribución. La página de DeepMind confirma que los modelos Gemma 4 pasan por protocolos de seguridad de infraestructura equivalentes a los modelos propietarios de Google, lo que sugiere un pipeline de alineación robusto, aunque sin cifras públicas de dataset. La cuantización Q4_K_M fue realizada por unsloth sobre el checkpoint oficial, y el split en shards no modifica los pesos, solo la forma de empaquetado.

## Capacidades

- Generación de texto y conversación multimodal (el modelo base acepta entrada de imágenes, aunque la cuantización GGUF conserva esa capacidad si el runtime la soporta).
- Modo de razonamiento extendido ("Thinking Mode"): el modelo puede generar cadenas de razonamiento internas antes de dar la respuesta final, útil para problemas de lógica y matemáticas.
- Razonamiento y resolución de problemas de lógica, matemáticas y ciencias.
- Generación de código en múltiples lenguajes.
- Soporte de tool calling / function calling (disponible en el modelo base; la cuantización no lo elimina).
- Capacidades multilingües: el modelo base de Google es multilingüe, aunque la model card de esta distribución no detalla la lista de idiomas.
- Capacidad de ejecución en navegador mediante wllama, sin servidor dedicado.

## Casos de uso

- **Asistente local en el navegador**: gracias al split en shards de <2 GB, se puede cargar el modelo directamente en una página web con wllama, permitiendo un chatbot privado que funciona sin conexión y sin enviar datos a ningún servidor.
- **Razonamiento matemático y lógico en entornos educativos**: con su modo de pensamiento extendido, sirve para generar explicaciones paso a paso de problemas de cálculo, álgebra o lógica proposicional.
- **Generación de código asistida en el IDE**: el modelo puede completar funciones y explicar fragmentos de código, y al ser cuantizado a Q4_K_M cabe en una GPU de consumo (8 GB VRAM según la web oficial).
- **Prototipado de aplicaciones multimodales**: al ser un modelo multimodal, permite clasificar o describir imágenes en aplicaciones web sin necesidad de una API externa, siempre que el runtime (wllama o llama.cpp) soporte la proyección visual.
- **Automatización de tareas de extracción de información**: con la ventana de contexto extendida y capacidad de tool calling, se puede usar para procesar documentos largos, resumir textos y extraer entidades en un pipeline local.
- **Evaluación de modelos en el navegador para investigación**: investigadores pueden comparar el comportamiento del modelo en distintas cuantizaciones sin instalar infraestructura, cargándolo directamente en un notebook o página de pruebas con wllama.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La página oficial de Gemma 4 E4B (gemma4.dev) indica que es un modelo orientado a equipos locales con 8 GB de VRAM, pero no proporciona cifras de MMLU, HumanEval, GSM8K o similares en los materiales consultados. No se incluyen números de rendimiento por no disponer de fuentes verificables.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo base requiere un mínimo de 8 GB de VRAM según la web oficial de Gemma 4 E4B. Con la cuantización Q4_K_M y un contexto moderado, puede funcionar en GPUs de 8 GB.
- GPU recomendadas: RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070/4080, RTX 4090, así como GPUs de portátil con 8 GB o más. También es viable en Apple Silicon (M1 Pro o superior) con Metal.
- Cabe en GPU de consumo: sí, es uno de los objetivos principales del modelo E4B.
- Opciones de despliegue: llama.cpp, Ollama, wllama (navegador), vLLM (con adaptación GGUF), TGI. Esta distribución está específicamente preparada para wllama.
- Latencia y throughput estimados: no disponibles en la información proporcionada. En una RTX 4090 con Q4_K_M, un modelo de ~4.4B activos suele generar entre 30 y 60 tokens por segundo, pero no hay datos oficiales de esta distribución.

## Comparativa con modelos similares

| Modelo | Parametros activos | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Gemma 4 E4B (este) | ~4.4B | no disponible | no disponible en esta dist. | GGUF en HF |
| Llama 3.2 3B Instruct | 3B | 128K | Llama 3.2 Community License | GGUF, safetensors |
| Qwen2.5 4B Instruct | 4B | 128K | Apache 2.0 | GGUF, safetensors |
| Phi-4-mini (3.8B) | 3.8B | 128K | MIT | GGUF, safetensors |

Gemma 4 E4B se diferencia de estos modelos por su arquitectura elástica y multimodalidad, así como por su modo de razonamiento extendido. Llama 3.2 3B y Qwen2.5 4B tienen licencias más permisivas y documentación más completa, pero no ofrecen entrada de imagen nativa en el mismo rango de tamaño. La comparativa exacta de rendimiento no puede completarse por falta de benchmarks públicos.

## Limitaciones y advertencias

- La licencia de esta distribución no se declara en la model card; antes de usar el modelo en producción comercial hay que consultar la licencia de Gemma 4 en la web oficial de Google DeepMind, que puede incluir restricciones de uso y obligaciones de atribución.
- El modelo está cuantizado a Q4_K_M, lo que degrada ligeramente la calidad de generación respecto al checkpoint en FP16, especialmente en tareas de razonamiento complejo y matemáticas.
- No se han publicado datos de sesgos ni de alucinación específicos para esta cuantización. Como todo modelo generativo, puede producir respuestas inventadas o incorrectas, y el modo de razonamiento no garantiza corrección.
- La ventana de contexto exacta no está documentada en la distribución; hay que verificarla con el runtime antes de usarla en producción.
- Al ser un modelo multimodal, la parte de visión puede no estar completamente funcional en todos los runtimes (wllama o llama.cpp pueden requerir compilación con soporte de visión).
- El split en shards de <2 GB es específico para wllama; si se usa otro runtime, hay que recombinar los shards o descargar el archivo GGUF original de unsloth.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/888rok/gemma-4-E4B-it-Q4_K_M-wllama-split
- Modelo base GGUF (unsloth): https://huggingface.co/unsloth/gemma-4-E4B-it-GGUF
- Página oficial de Gemma 4 en DeepMind: https://deepmind.google/models/gemma/gemma-4/
- Ficha técnica de Gemma 4 E4B (gemma4.dev): https://gemma4.dev/models/gemma-4-e4b
- Repositorio de wllama: https://github.com/ngxson/wllama
- Autobench llama.cpp Q4_K_M (referencia de rendimiento): https://gauravmm.github.io/autobench/configs/gemma-4-e4b-it-llamacpp-q4-k-m/
