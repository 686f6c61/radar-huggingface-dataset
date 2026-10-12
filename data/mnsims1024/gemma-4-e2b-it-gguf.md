# mnsims1024/gemma-4-E2B-it-GGUF

## Resumen

gemma-4-E2B-it-GGUF es una recopilación de cuantizaciones en formato GGUF del modelo multimodal google/gemma-4-E2B-it, publicada por el usuario mnsims1024 en HuggingFace. El modelo base pertenece a la familia Gemma 4 de Google DeepMind, una familia de modelos abiertos multimodales que procesan texto, imagen y audio (audio solo en los tamaños pequeños) y generan texto. Este repositorio concreto es una redistribución orientada a inferencia local, no un modelo entrenado desde cero.

El repositorio se apoya en el formato Unsloth Dynamic 2.0 GGUF, pensado para reducir la pérdida de calidad en cuantizaciones agresivas. El recuento real de parámetros en safetensors del repositorio es de 4.647.450.147 (unos 4,65 mil millones), una cifra que conviene contrastar con la nomenclatura "E2B" del nombre, ya que la documentación de la familia atribuye 2,3 B efectivos (5,1 B con embeddings) al tamaño E2B y 4,5 B efectivos (8 B con embeddings) al E4B.

La relevancia de esta ficha es práctica: permite saber si el modelo cabe en hardware de consumo, qué esperar de sus capacidades multimodales y de razonamiento, y qué precauciones tomar antes de llevarlo a producción, dado que se trata de una republicación de terceros con cero descargas y cero "likes" en el momento de la consulta y sin resultados de benchmarks publicados.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only multimodal con atención híbrida: ventana deslizante local de 512 tokens intercalada con atención global; las capas globales usan claves y valores unificados y Proportional RoPE (p-RoPE) |
| Parámetros totales | 4.647.450.147 (unos 4,65 B) según safetensors del repositorio; la documentación de la familia indica 2,3 B efectivos (5,1 B con embeddings) para E2B y 4,5 B efectivos (8 B con embeddings) para E4B |
| Parámetros activos | No aplica: es una variante densa. La única variante MoE de la familia es la 26B A4B |
| Longitud de contexto | 128K tokens para los modelos pequeños (E2B y E4B) según la documentación de la familia; los modelos medios (26B A4B, 31B) llegan a 256K |
| Tipos de cuantización | GGUF, con el esquema Unsloth Dynamic 2.0. El repositorio ocupa 80,7 GB, lo que sugiere varios niveles de cuantización empaquetados, pero la lista concreta de niveles no está disponible en la información proporcionada |
| Idiomas soportados | Más de 140 idiomas según la documentación de la familia Gemma 4; los metadatos de HuggingFace del repositorio no especifican idiomas |
| Licencia | apache-2.0 según los metadatos de HuggingFace; la model card enlaza la licencia de Gemma 4 de Google (ai.google.dev/gemma/docs/gemma_4_license), lo que conviene verificar |
| Formato de pesos | GGUF en este repositorio; el modelo base google/gemma-4-E2B-it se distribuye en safetensors |

## Arquitectura y entrenamiento

El modelo base es un transformer decoder-only con atención híbrida: la mayoría de capas emplea atención local de ventana deslizante de 512 tokens y se intercalan capas de atención global, garantizando que la última capa sea siempre global. Este diseño busca el coste de memoria y la velocidad de un modelo ligero sin renunciar al seguimiento de contexto largo. Para reducir el consumo de memoria en contextos extensos, las capas globales unifican claves y valores y aplican Proportional RoPE (p-RoPE). La variante E2B consta de 35 capas y un vocabulario de 262.000 tokens; incluye un codificador de visión de aproximadamente 150 millones de parámetros y un codificador de audio de aproximadamente 300 millones, ambos adicionales al recuento de parámetros del modelo de lenguaje.

La familia incorpora modos de razonamiento configurables ("thinking modes"), soporte nativo del rol `system` para conversaciones estructuradas y function calling nativo orientado a flujos agénticos. El autor de las cuantizaciones documenta soporte de MTP (multi-token prediction) y actualizaciones de la plantilla de chat y de llama.cpp. No hay información disponible sobre el número de tokens de entrenamiento, la composición del dataset ni el uso de RLHF, DPO u otras técnicas de alineación en la información proporcionada. Este repositorio concreto no aporta un proceso de entrenamiento propio: es una conversión a GGUF del modelo ya instruido.

## Capacidades

- Generación de texto conversacional con plantilla de chat de tipo instrucción y soporte nativo del rol `system`.
- Razonamiento con modos de pensamiento configurables, incluido razonamiento multi-paso.
- Comprensión de imágenes con soporte de relación de aspecto y resolución variables.
- Entrada de audio nativa en los tamaños pequeños de la familia (E2B y E4B), ya que incorporan codificador de audio.
- Capacidades de código y matemáticas, con mejoras notables en benchmarks de programación según la documentación de la familia.
- Function calling y tool calling nativos, orientados a agentes autónomos.
- Soporte multilingüe en más de 140 idiomas según la documentación de la familia.
- Predicción multi-token (MTP) según las notas de actualización del repositorio.
- Salida exclusivamente de texto: el modelo no genera imágenes ni audio.
- Soporte de decodificación en llama.cpp con caché KV cuantizable, lo que permite ajustar memoria en contextos largos.

## Casos de uso

- Asistente local en portátil: con cuantizaciones de 4 bits el modelo puede ejecutarse íntegramente en una GPU de gama media o en memoria unificada de un Mac, ofreciendo un asistente conversacional sin conexión y sin coste por token.
- Análisis de documentos con imágenes: al aceptar entrada de imagen y texto con resolución variable, sirve para extraer información de capturas, diagramas o páginas escaneadas y resumirlas en texto.
- Transcripción y resumen de audio en local: la presencia de codificador de audio en la variante pequeña permite procesar notas de voz o reuniones sin enviar datos a servicios externos, algo crítico en entornos con requisitos de privacidad.
- Agente de automatización con herramientas: el function calling nativo y el modo de razonamiento configurable permiten construir agentes que consultan APIs, ejecutan consultas y encadenan varios pasos antes de responder.
- Asistencia de programación integrada en el editor: el modelo puede completar funciones, explicar código y generar pruebas, y su tamaño reducido hace viable ejecutarlo en la propia máquina del desarrollador junto a un servidor compatible con la API de OpenAI.
- Atención al cliente multilingüe: con más de 140 idiomas declarados y 128K tokens de contexto, puede mantener conversaciones multi-turno con historial largo y documentación de producto inyectada en el prompt de sistema.
- Clasificación y enrutado de tickets: por su coste de inferencia bajo en cuantización de 4 bits, es adecuado para preprocesar grandes volúmenes de texto y decidir categoría, urgencia o equipo destinatario antes de escalar a un modelo mayor.
- Prototipado e investigación de multimodalidad: al ser un modelo abierto y pequeño, sirve como banco de pruebas para experimentos de visión-lenguaje y audio-lenguaje sin depender de infraestructura de centro de datos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La búsqueda web realizada no devolvió resultados relevantes sobre el modelo (los resultados obtenidos correspondían a modificaciones de videojuegos sin relación alguna), y la model card del repositorio no incluye tablas de evaluación para esta cuantización concreta. Cualquier cifra de MMLU, HumanEval, GSM8K o similares que se atribuya a este repositorio debe verificarse en la documentación oficial de Gemma 4 de Google o en los benchmarks de cuantizaciones de Unsloth.

## Requisitos de hardware

- VRAM estimada para inferencia, calculada a partir de los 4,65 B de parámetros (estimaciones propias, no datos oficiales): en FP16 en torno a 9,3 GB solo de pesos, unos 11 GB con overhead; en Q8_0 alrededor de 5 GB de pesos y 6-7 GB reales; en Q4_K_M aproximadamente 2,8 GB de pesos y 4 GB reales.
- A esas cifras hay que sumar los codificadores multimodales (unos 150 M de visión y 300 M de audio en la variante pequeña) si se cargan los proyectores correspondientes, y la caché KV, que crece con el contexto en las capas de atención global.
- Cabe en GPU de consumo: RTX 3060 de 12 GB, RTX 4060 Ti de 16 GB, RTX 4070/4080/4090 con cuantizaciones de 4 y 8 bits y contextos moderados. También es viable en Apple Silicon con 16 GB o más de memoria unificada y en equipos con memoria compartida.
- Para contextos cercanos a 128K tokens o para servir varias peticiones concurrentes se recomiendan GPU de 24 GB o superiores (RTX 4090, L40S, A100, H100), y cuantizar la caché KV para reducir el consumo.
- Opciones de despliegue: llama.cpp y su servidor (llama-server), Ollama, LM Studio, Unsloth Studio y cualquier runtime compatible con GGUF. El soporte de GGUF en vLLM y TGI es parcial o experimental y no está confirmado para este repositorio en la información proporcionada.
- Latencia y throughput estimados: no disponibles. Dependen del nivel de cuantización, del backend, del tamaño de lote y de la longitud de contexto.

## Comparativa con modelos similares

Datos de la familia Gemma 4 tomados de la model card del repositorio:

| Modelo | Parámetros | Capas | Ventana deslizante | Contexto | Modalidades | Codificador de visión |
|---|---|---|---|---|---|---|
| Gemma 4 E2B | 2,3 B efectivos (5,1 B con embeddings) | 35 | 512 tokens | 128K | Texto, imagen, audio | ~150 M |
| Gemma 4 E4B | 4,5 B efectivos (8 B con embeddings) | 42 | 512 tokens | 128K | Texto, imagen, audio | ~150 M |
| Gemma 4 31B Dense | 30,7 B | 60 | 1024 tokens | 256K | Texto, imagen | ~550 M |
| Este repositorio | 4,65 B según safetensors (etiquetado como E2B) | No disponible | No disponible | 128K según la familia | Texto, imagen, audio según la familia | No disponible |

Frente a alternativas de otros fabricantes en el rango de 3 a 8 mil millones de parámetros con capacidades multimodales (por ejemplo, la serie Qwen-VL de Alibaba o los modelos pequeños multimodales de Meta), no se dispone de datos de benchmarks ni de especificaciones verificadas en la información proporcionada, por lo que no se puede establecer una comparación cuantitativa fiable. La ventaja diferencial de este repositorio es el formato GGUF optimizado para inferencia local y su licencia permisiva declarada; su desventaja es la ausencia de evaluación publicada y su condición de republicación no oficial.

## Limitaciones y advertencias

- Riesgo de alucinación inherente a los modelos de lenguaje de este tamaño, especialmente en tareas de razonamiento largo, matemáticas complejas y datos factuales recientes.
- La cuantización introduce pérdida de precisión respecto al modelo en FP16; los esquemas dinámicos mitigan el problema, pero no lo eliminan. No hay benchmarks publicados que cuantifiquen esa pérdida en este repositorio concreto.
- Discrepancia entre el nombre del repositorio (E2B) y el recuento de parámetros en safetensors (4,65 B). Conviene verificar qué variante se está descargando realmente antes de desplegarla.
- Es una republicación de un tercero (mnsims1024), no un artefacto oficial de Google DeepMind. No hay garantías de mantenimiento, versionado ni actualización con las correcciones posteriores del modelo base.
- La licencia declarada en los metadatos es apache-2.0, pero la model card enlaza la licencia específica de Gemma 4 de Google. Es imprescindible revisar los términos aplicables antes de un uso comercial, porque pueden incluir condiciones de uso aceptable adicionales.
- Los metadatos de HuggingFace no especifican los idiomas soportados; la cifra de más de 140 idiomas proviene de la documentación de la familia y la calidad por idioma puede variar notablemente.
- El rendimiento efectivo en contextos cercanos a 128K tokens puede degradarse y el consumo de memoria de la caché KV crece con la longitud de la conversación.
- Para usar las capacidades de imagen y audio en GGUF es necesario cargar los proyectores multimodales correspondientes; si el repositorio no los incluye, esas capacidades no estarán disponibles en el runtime.
- El repositorio registra cero descargas y cero "likes", por lo que no existe validación comunitaria de su funcionamiento.
- No hay información sobre sesgos específicos, composición del dataset de entrenamiento ni filtros de seguridad aplicados.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/mnsims1024/gemma-4-E2B-it-GGUF
- Modelo base: https://huggingface.co/google/gemma-4-E2B-it
- Colección de Unsloth con todas las versiones de Gemma 4: https://huggingface.co/collections/unsloth/gemma-4
- Guía de Unsloth para ejecutar Gemma 4: https://docs.unsloth.ai/models/gemma-4
- Guía de Unsloth Studio: https://unsloth.ai/docs/new/studio
- Benchmarks de cuantizaciones Unsloth Dynamic 2.0: https://unsloth.ai/docs/basics/unsloth-dynamic-v2.0-gguf
- Guía de MTP de Unsloth: https://unsloth.ai/docs/models/mtp
- Repositorio de Unsloth en GitHub: https://github.com/unslothai/unsloth/
- Discord de Unsloth: https://discord.gg/unsloth
- Colección de Google con la familia Gemma 4: https://huggingface.co/collections/google/gemma-4
- Organización de Google Gemma en GitHub: https://github.com/google-gemma
- Blog de lanzamiento de Gemma 4: https://blog.google/innovation-and-ai/technology/developers-tools/gemma-4/
- Documentación de Gemma: https://ai.google.dev/gemma/docs/core
- Licencia de Gemma 4: https://ai.google.dev/gemma/docs/gemma_4_license
- Página de los modelos Gemma en Google DeepMind: https://deepmind.google/models/gemma/
