# SoAIHQ/gemma-4-31B-it-GGUF

## Resumen

`SoAIHQ/gemma-4-31B-it-GGUF` es una compilación de cuantizaciones GGUF del modelo `google/gemma-4-31B-it`, publicada por SoAI para su uso con llama.cpp y con el propio runtime de SoAI. Se trata de un transformer denso de 30.697.345.596 parámetros (aproximadamente 30,7B) con entrada de imagen, salida de texto y una ventana de contexto de 262.144 tokens. El modelo base lo desarrolla Google y esta versión mantiene la licencia Apache 2.0 del original.

El interés de esta ficha no reside en un modelo nuevo, sino en el trabajo de cuantización: SoAI publica dos variantes, `Q4_K_M` (18,7 GB) y `Q8_0` (32,6 GB), además de un proyector multimodal `mmproj` en F16 (1,2 GB) necesario para el procesamiento de imágenes. La cuantización `Q4_K_M` se ha calibrado con una importance matrix (imatrix) propia, construida sobre conversaciones multi-turno en 21 idiomas, código en 22 lenguajes de programación, llamadas a herramientas y matemáticas paso a paso, en lugar de texto web genérico. Eso hace que el resultado sea especialmente relevante para despliegues conversacionales y de agentes en hardware de consumo o en servidores con VRAM limitada.

El modelo cubre texto e imagen, razonamiento configurable por petición (thinking mode), tool calling y contexto largo, y está pensado para ejecutarse tanto en GPU como en CPU con reparto de capas. No incluye audio. El repositorio ocupa 52,5 GB en total y acumula 1.167 descargas en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (modelo base `google/gemma-4-31B-it`) |
| Parametros totales | 30.697.345.596 (30,7B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 262.144 tokens (256K) |
| Tipos de cuantizacion | `Q4_K_M` (18,7 GB, con imatrix) y `Q8_0` (32,6 GB, sin imatrix); proyector `mmproj` en F16 (1,2 GB) |
| Idiomas soportados | 35+ idiomas (preentrenado en 140+); corpus de calibración en 21 idiomas |
| Licencia | Apache 2.0 (con enlace a la licencia específica de Gemma 4 de Google) |
| Formato de pesos | GGUF (safetensors en el modelo base original) |
| Modalidades | Texto e imagen de entrada; texto de salida (sin audio) |
| Razonamiento | Thinking configurable por petición (`enable_thinking`) |
| Tool calling | Sí, con sintaxis nativa de llamadas a herramientas |
| Runtime recomendado | llama.cpp v0.5.0 o superior; también SoAI y API compatible con OpenAI |
| Tamaño del repositorio | 52,5 GB |

## Arquitectura y entrenamiento

El modelo base es un transformer denso de 31B parámetros desarrollado por Google, con capacidad de entrada de imagen y una ventana de contexto de 262.144 tokens. La información disponible no detalla la composición exacta del dataset de preentrenamiento, el número de tokens ni si hubo fases de RLHF o DPO; la model card solo indica que el modelo está preentrenado en más de 140 idiomas y que soporta 35+ idiomas en uso. Tampoco se especifican innovaciones de atención (attention linear, decodificación especulativa u otras) más allá de la arquitectura densa estándar.

El trabajo técnico relevante de esta publicación es el pipeline de cuantización. `Q4_K_M` se genera con una importance matrix calculada por SoAI sobre su propio corpus de calibración, formateado con la plantilla de chat del modelo e incluyendo su sintaxis nativa de tool calls; el corpus cubre chat multi-turno en 21 idiomas, ediciones de código en 22 lenguajes, llamadas a herramientas con sus resultados, matemáticas paso a paso y prosa web. `Q8_0` se cuantiza sin imatrix porque el formato de llama.cpp no la utiliza. Antes de publicar, el build verifica que los marcadores de chat, thinking y tool calling se almacenan como tokens especiales y que la plantilla de chat embebida coincide con la original; si la conversión los importa como texto plano, el proceso se detiene en lugar de publicar un archivo defectuoso. El archivo de imatrix se publica en el repositorio junto con la tabla de procedencia que fija la revisión original y el commit de llama.cpp, lo que permite reconstruir las cuantizaciones.

## Capacidades

- Generación de texto y razonamiento con modo thinking configurable por petición mediante `chat_template_kwargs: {"enable_thinking": true}`.
- Comprensión de imágenes (image-text-to-text) con el proyector `mmproj` en F16 cargado mediante `--mmproj`.
- Tool calling y function calling con sintaxis nativa incluida en la plantilla de chat.
- Flujos de agente y razonamiento multi-paso, favorecidos por la ventana de 256K tokens.
- Capacidades multilingües: 35+ idiomas en uso, preentrenamiento en 140+.
- Generación y edición de código en múltiples lenguajes de programación.
- Razonamiento matemático paso a paso.
- Compatibilidad con la API de OpenAI a través de `llama-server`, incluyendo interfaz de chat integrada en `http://localhost:8080`.
- Ejecución híbrida GPU/CPU con reparto de capas en llama.cpp.
- Sin soporte de audio.

## Casos de uso

- Atención al cliente automatizada: la ventana de 262.144 tokens permite mantener conversaciones multi-turno muy largas con historial completo, y el tool calling nativo facilita consultar sistemas de ticketing o bases de conocimiento sin salir del flujo conversacional.
- Agentes de código en CI/CD: el modelo puede leer issues, generar parches y ejecutar llamadas a herramientas (tests, linters, APIs de repositorio) dentro de un pipeline, aprovechando la calibración específica sobre ediciones de código en 22 lenguajes.
- Análisis de documentos extensos con imágenes: informes escaneados, contratos o manuales técnicos que combinan texto e imágenes caben en el contexto de 256K y se procesan con el proyector multimodal.
- Asistente local en estación de trabajo: la variante `Q4_K_M` de 18,7 GB permite ejecutar el modelo en una GPU de consumo con 24 GB de VRAM o con reparto de capas entre GPU y CPU, sin depender de servicios en la nube.
- Razonamiento matemático y verificación paso a paso: el modo thinking configurable por petición permite activar cadenas de razonamiento largas solo en las consultas que lo requieren, reduciendo coste en el resto.
- Soporte multilingüe en producto: con 35+ idiomas en uso y calibración en 21, es adecuado para interfaces de asistencia en mercados europeos sin entrenamiento adicional.
- Extracción estructurada de datos: el tool calling nativo y la plantilla de chat permiten forzar salidas en formato de función para poblar bases de datos a partir de texto e imágenes.
- Despliegue con API compatible con OpenAI: `llama-server -hf SoAIHQ/gemma-4-31B-it-GGUF:Q4_K_M` levanta un endpoint que se puede integrar en aplicaciones existentes sin cambiar el cliente.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada: `Q4_K_M` requiere unos 18,7 GB solo para los pesos, más memoria adicional para el contexto, que crece con la longitud configurada; `Q8_0` requiere unos 32,6 GB para los pesos. El proyector multimodal añade 1,2 GB si se usa entrada de imagen.
- GPU recomendadas: para `Q4_K_M`, una RTX 4090 (24 GB) o una A100/H100 de 40 GB o más permiten cargar el modelo completo en GPU con margen para contexto; para `Q8_0`, se recomienda A100 80 GB, H100 o varias GPU con reparto de capas.
- GPU de consumo: `Q4_K_M` cabe en tarjetas de 24 GB (RTX 3090, RTX 4090) con contexto moderado; en tarjetas de 16 GB o menos es necesario repartir capas con la CPU.
- CPU: llama.cpp permite ejecución íntegra en CPU o con reparto de capas GPU/CPU, a costa de latencia mayor.
- Opciones de despliegue: llama.cpp v0.5.0 o superior (`llama-server`, `llama-cli`), runtime de SoAI y cualquier cliente compatible con la API de OpenAI apuntando a `llama-server`. La model card no menciona vLLM ni TGI para este formato.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Modalidad | Licencia | Formato disponible |
|---|---|---|---|---|---|
| `SoAIHQ/gemma-4-31B-it-GGUF` (esta ficha) | 30,7B denso | 262.144 | Texto + imagen | Apache 2.0 | GGUF (`Q4_K_M`, `Q8_0`) |
| `google/gemma-4-31B-it` (modelo base) | 30,7B denso | 262.144 | Texto + imagen | Apache 2.0 | Safetensors (16 bits) |
| Otras cuantizaciones GGUF del mismo modelo base | 30,7B denso | 262.144 | Texto + imagen | Apache 2.0 | GGUF (no disponible el detalle de variantes) |

La información proporcionada no incluye datos de rendimiento comparado con modelos de other familias ni con alternativas de tamaño similar, por lo que no es posible establecer una comparativa cuantitativa de calidad.

## Limitaciones y advertencias

- No se publican resultados de benchmarks en la información disponible, por lo que no hay evidencia cuantitativa del impacto de la cuantización en tareas concretas más allá de la descripción cualitativa de la model card.
- SoAI no publica cuantizaciones por debajo de 4 bits; en hardware con menos de ~19 GB de memoria no hay una variante oficial más ligera.
- El modo thinking debe activarse explícitamente por petición; si se omite, el modelo responde sin cadena de razonamiento, lo que puede afectar a tareas complejas.
- La entrada de imagen requiere cargar el archivo `mmproj` aparte; sin él, el modelo solo procesa texto.
- `Q8_0` no usa imatrix, por lo que su calibración no está optimizada para el corpus conversacional y de tool calls de SoAI, aunque su pérdida de calidad es menor por el propio formato.
- El contexto de 256K consume memoria adicional proporcional a la longitud configurada; usar la ventana completa en hardware ajustado puede provocar fallos de memoria.
- Riesgo de alucinación y sesgos: la información disponible no documenta evaluaciones específicas de sesgo ni tasas de alucinación del modelo base; se aplican las advertencias habituales de los modelos generativos de Google.
- La licencia es Apache 2.0, pero el repositorio enlaza además a la licencia específica de Gemma 4 de Google (`https://ai.google.dev/gemma/docs/gemma_4_license`); conviene revisar ambas antes de un uso comercial.
- El idioma de los datos de calibración cubre 21 idiomas, aunque el modelo base se preentrenó en 140+; el rendimiento en idiomas fuera de ese conjunto puede ser inferior.
- La model card está truncada en la información disponible; la tabla de procedencia y las fuentes del corpus de calibración no se detallan por completo.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/SoAIHQ/gemma-4-31B-it-GGUF
- Modelo base: https://huggingface.co/google/gemma-4-31B-it
- Licencia Gemma 4: https://ai.google.dev/gemma/docs/gemma_4_license
- Sitio de SoAI: https://soai.to
- llama.cpp: https://github.com/ggml-org/llama.cpp
- Dataset de calibración citado (fineweb-2): https://huggingface.co/datasets/HuggingFaceFW/fineweb-2
- Archivo `Q4_K_M`: https://huggingface.co/SoAIHQ/gemma-4-31B-it-GGUF/resolve/main/gemma-4-31B-it-Q4_K_M.gguf
- Archivo `Q8_0`: https://huggingface.co/SoAIHQ/gemma-4-31B-it-GGUF/resolve/main/gemma-4-31B-it-Q8_0.gguf
- Proyector multimodal: https://huggingface.co/SoAIHQ/gemma-4-31B-it-GGUF/resolve/main/mmproj-gemma-4-31B-it-f16.gguf
