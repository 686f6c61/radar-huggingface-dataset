# bi0/gemma-4-12b-nvfp4

## Resumen

`bi0/gemma-4-12b-nvfp4` es una cuantización comunitaria del modelo `google/gemma-4-12b-it`, publicada por el usuario bi0 en Hugging Face. No se trata de un modelo entrenado desde cero, sino de una conversión de los pesos originales de Google a formato NVFP4 (FP4 de bloques de 16) optimizada específicamente para hardware Blackwell, en concreto la GPU GB10 integrada en los sistemas NVIDIA DGX Spark. El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, lo que indica que es una publicación muy reciente y de nicho.

El interés de esta ficha reside precisamente en su especialización: es uno de los pocos artefactos públicos orientados a ejecutar un modelo de 12B parámetros con cuantización de 4 bits nativa en silicio Blackwell (arquitectura sm121). El peso total del repositorio es de 11.198,61 MB (11.742.594.491 bytes), lo que confirma una huella en disco compatible con estaciones de trabajo de gama alta y con el propio DGX Spark.

La información disponible es limitada: el autor no documenta licencia, idiomas, pipeline ni resultados de evaluación, y la model card se reduce a metadatos de procedencia y a la huella SHA-256 del artefacto. Todo lo relativo a capacidades, arquitectura y entrenamiento debe atribuirse al modelo base `google/gemma-4-12b-it`, no a esta cuantización.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (heredada de `google/gemma-4-12b-it`); no se detalla en la model card |
| Parametros totales | 12B (según el nombre del modelo base) |
| Parametros activos | no disponible (no es MoE según la información disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | NVFP4 con bloques de 16 (Blackwell NVFP4 Block-16 Quantization); únicamente este formato en el repositorio |
| Idiomas soportados | no disponible |
| Licencia | no disponible (la model card no la declara; depende de la licencia de Gemma 4) |
| Formato de pesos | NVFP4 Safetensors (11.198,61 MB / 11.742.594.491 bytes) |

## Arquitectura y entrenamiento

El repositorio no contiene información sobre la arquitectura interna del modelo base más allá de su identificador. Por el nombre y el contexto (`gemma-4-12b-it`, con etiqueta "VLM" en la documentación de Google), se trata de un transformer multimodal de 12.000 millones de parámetros afinado para instrucciones. No hay datos publicados en la información disponible sobre número de tokens de entrenamiento, composición del dataset, uso de RLHF/DPO ni innovaciones técnicas del modelo original.

La contribución técnica de esta publicación es exclusivamente la cuantización: NVFP4 con bloques de 16 elementos, un esquema de precisión reducida que agrupa los pesos en bloques y comparte escala por bloque, diseñado para aprovechar las unidades de cómputo FP4 de la microarquitectura Blackwell (sm121, GB10). El autor declara "Zero Private Data — Pure Blackwell NVFP4 Quantization", es decir, una conversión puramente de pesos sin datos adicionales. No se documenta el proceso de calibración, el error de reconstrucción ni comparaciones de perplejidad frente al modelo en BF16.

## Capacidades

- Generación de texto y razonamiento conversacional, heredados del modelo base `gemma-4-12b-it`.
- Capacidades multimodales (visión) según la descripción de Gemma 4 12B como VLM en el blog de Google; no verificadas en esta cuantización.
- Soporte de instrucciones (sufijo `-it` del modelo base).
- Tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponibles en la información proporcionada.
- Modo "thinking", audio u otras capacidades especiales: no disponible en la información proporcionada.

## Casos de uso

- Inferencia local en DGX Spark: el caso de uso principal y explícito del autor es ejecutar Gemma 4 12B en un sistema NVIDIA DGX Spark con GPU GB10, aprovechando la ruta local documentada (`/home/m1st/ai_workspace/models/gemma-4-12b-nvfp4`) y el puerto de runtime bajo demanda.
- Despliegue en estaciones Blackwell: cualquier equipo con GPU de arquitectura sm121 puede cargar los pesos NVFP4 sin reconversión, reduciendo el espacio en disco a unos 11,2 GB frente a los aproximadamente 24 GB de una versión BF16 de 12B.
- Prototipado de asistentes multimodales en local: al tratarse de un modelo de 12B con capacidades de visión declaradas por el modelo base, sirve para experimentar con descripción de imágenes y pregunta-respuesta sobre documentos sin depender de API externas.
- Evaluación de cuantización FP4: investigadores interesados en medir la degradación de calidad de NVFP4 frente a BF16 pueden usar este artefacto como referencia reproducible, dado que el autor publica el SHA-256 del fichero.
- Servicio de inferencia interno de baja concurrencia: el tamaño compacto permite mantener el modelo residente en memoria en una única GPU Blackwell y servirlo mediante un adaptador bajo demanda, adecuado para entornos de desarrollo y pruebas.
- Base para afinado ligero o adaptadores: al ser Safetensors, los pesos pueden cargarse en frameworks compatibles con cuantización de 4 bits para experimentar con LoRA u otros adaptadores, siempre que la herramienta soporte NVFP4.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas de MMLU, HumanEval, GSM8K ni comparaciones de perplejidad frente al modelo base en BF16, y tampoco se documentan latencia ni throughput en DGX Spark.

## Requisitos de hardware

- VRAM estimada para inferencia: en torno a 11-12 GB solo para pesos NVFP4; hay que añadir memoria para caché KV, activaciones y buffers, por lo que conviene reservar al menos 16-24 GB según longitud de contexto y lote.
- GPU compatibles: exclusivamente hardware Blackwell con soporte NVFP4 (sm121), es decir, GB10 en DGX Spark y GPUs Blackwell equivalentes. No es ejecutable en Ampere, Ada ni Hopper sin conversión previa.
- GPU de consumo: no cabe esperar ejecución en RTX 4090 (Ada, sm89) ni en RTX 5090 sin un runtime que soporte NVFP4 en sm120; la información disponible solo confirma sm121.
- Opciones de despliegue: el autor menciona un "Active Runtime Port: On-Demand / Adapter", sin especificar el framework (vLLM, TensorRT-LLM, llama.cpp u otro). No se documenta compatibilidad con Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `bi0/gemma-4-12b-nvfp4` | 12B | no disponible | NVFP4 Safetensors | no disponible | Hugging Face, 0 descargas |
| `google/gemma-4-12b-it` (modelo base) | 12B | no disponible | Safetensors (BF16/FP16 presumiblemente) | licencia Gemma de Google (no verificada en la información disponible) | Hugging Face, oficial |
| `google/gemma-4-12B` | 12B | no disponible | Safetensors | licencia Gemma de Google | Hugging Face, oficial |

La comparación relevante es frente al modelo base: esta cuantización reduce el tamaño en disco a 11,2 GB y habilita FP4 nativo en Blackwell, a cambio de atarse a una arquitectura de GPU concreta y de asumir una degradación de calidad no documentada. No se dispone de datos de benchmarks que permitan comparar rendimiento con alternativas.

## Limitaciones y advertencias

- La licencia no está declarada en el repositorio; el uso comercial queda sujeto a la licencia del modelo base Gemma 4 de Google, que debe verificarse antes de cualquier despliegue en producción.
- No hay evaluación publicada del impacto de la cuantización NVFP4 en la calidad: se desconoce la degradación en razonamiento, código o matemáticas respecto a BF16.
- El artefacto está ligado a hardware Blackwell sm121; no es portable a GPUs Ampere, Ada u Hopper sin reconversión.
- Riesgo de alucinación inherente al modelo base, no mitigado ni evaluado en esta publicación.
- Sesgos: no documentados en la información disponible; deben asumirse los del modelo base de Google.
- Idiomas soportados no declarados; no se puede garantizar un comportamiento multilingüe correcto.
- Repositorio sin descargas ni validación comunitaria (0 descargas, 0 likes), con lo que no existe evidencia externa de que los pesos carguen correctamente.
- La model card incluye rutas locales del autor (`/home/m1st/...`) y detalles de su entorno, lo que sugiere una publicación personal sin proceso de revisión.
- Longitud de contexto no disponible: planificar el despliegue sin asumir una ventana concreta.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/bi0/gemma-4-12b-nvfp4
- Modelo base: https://huggingface.co/google/gemma-4-12b-it
- Página oficial de Gemma 4 12B: https://huggingface.co/google/gemma-4-12B
- Anuncio en el blog de Google: https://blog.google/innovation-and-ai/technology/developers-tools/introducing-gemma-4-12B/
