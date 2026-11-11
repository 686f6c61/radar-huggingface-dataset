# angel-6767/gemma-4-E4B-it

## Resumen

Gemma 4 E4B IT es la variante instruida del modelo E4B de la familia Gemma 4, desarrollada por Google DeepMind y publicada en abierto bajo licencia Apache 2.0. Se trata de un modelo multimodal de tipo any-to-any que acepta texto, imagen y audio como entrada y genera texto como salida. Con 4.500 millones de parametros efectivos (8.000 millones si se contabilizan las tablas de embeddings), esta disenado especificamente para ejecucion en dispositivos de borde, desde moviles de gama alta hasta portatiles, manteniendo un contexto de 128.000 tokens.

La innovacion principal de la variante E4B es el uso de Per-Layer Embeddings (PLE), una tecnica que asigna a cada capa del decodificador su propia tabla de embeddings por token. Estas tablas son grandes en numero de parametros pero solo se consultan, no se computan en cada paso, lo que explica la diferencia entre parametros efectivos y totales. El resultado es un modelo que ofrece capacidades de razonamiento, codigo, vision y audio con un coste computacional propio de un modelo de 4B.

Esta ficha describe el repositorio `angel-6767/gemma-4-E4B-it`, un espejo o re-subida del modelo oficial de Google con 0 descargas y 0 likes en el momento de la consulta. El modelo base referenciado es `google/gemma-4-E4B` y los pesos estan en formato safetensors con un total de 7.996.156.490 parametros almacenados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only con atencion hibrida (sliding window local + atencion global), Per-Layer Embeddings (PLE), RoPE proporcional (p-RoPE) |
| Parametros totales | 7.996.156.490 (8B con embeddings); 4.5B efectivos |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 128.000 tokens |
| Tipos de cuantizacion | No disponible en la informacion proporcionada (pesos en safetensors sin cuantizar) |
| Idiomas soportados | Mas de 140 idiomas segun la model card de la familia Gemma 4; lista concreta no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo emplea una arquitectura transformer decoder-only con atencion hibrida que intercala capas de atencion local con ventana deslizante de 512 tokens y capas de atencion global completa, garantizando que la capa final sea siempre global. Para optimizar el uso de memoria en contextos largos, las capas globales utilizan claves y valores unificados y aplican Proportional RoPE (p-RoPE). El modelo cuenta con 42 capas, un vocabulario de 262.000 tokens y una ventana deslizante de 512 tokens.

La variante E4B incorpora Per-Layer Embeddings (PLE): cada capa del decodificador dispone de su propia tabla de embeddings por token. Estas tablas son grandes en terminos de parametros almacenados pero solo se usan para consultas rapidas, lo que reduce el coste computacional efectivo. Ademas, el modelo integra un codificador de vision de aproximadamente 150 millones de parametros y un codificador de audio de aproximadamente 300 millones de parametros, lo que habilita la entrada multimodal nativa. No se dispone en la informacion proporcionada de detalles sobre el numero de tokens de entrenamiento, la composicion del dataset ni el uso especifico de RLHF o DPO en la variante instruida.

## Capacidades

- Generacion de texto con modo de razonamiento configurable (thinking modes).
- Procesamiento de imagenes con soporte de relacion de aspecto y resolucion variables.
- Procesamiento de audio nativo gracias al codificador de audio de ~300M de parametros.
- Procesamiento de video segun la model card de la familia Gemma 4.
- Soporte nativo de function calling para flujos agenticos.
- Capacidades de razonamiento multi-paso y agentes autonomos.
- Soporte nativo del rol `system` para conversaciones estructuradas.
- Capacidades multilingues en mas de 140 idiomas.
- Generacion de codigo y matematicas con mejoras notables en benchmarks de codigo segun la model card.
- Contexto largo de 128.000 tokens para tareas de recuperacion y resumen extenso.

## Casos de uso

- Asistencia en movil y portatil: al tener 4.5B parametros efectivos, el modelo puede ejecutarse en dispositivos de borde para tareas de resumen, redaccion y respuesta a preguntas sin conexion a la nube, aprovechando su contexto de 128K tokens para documentos largos.
- Atencion al cliente automatizada: el modelo puede gestionar conversaciones multi-turno con contexto largo y soporte del rol `system` para definir el tono y las politicas de la empresa, ademas de function calling para consultar sistemas internos.
- Analisis de documentos con imagenes: gracias a su codificador de vision, puede extraer informacion de facturas, capturas de pantalla o formularios escaneados y responder preguntas sobre ellos en el mismo flujo conversacional.
- Transcripcion y analisis de audio: el codificador de audio permite procesar notas de voz, reuniones o llamadas y generar resumenes o acciones a partir del contenido hablado.
- Agentes autonomos con tool calling: el modelo puede integrarse en pipelines agenticos que invocan APIs, consultan bases de datos o ejecutan comandos, usando el modo de razonamiento configurable para planificar pasos.
- Generacion de codigo en produccion: soporta function calling y puede integrarse en asistentes de IDE o pipelines de CI/CD para autocompletar, revisar y documentar codigo, con contexto suficiente para incluir varios ficheros en la ventana.
- Traduccion y localizacion multilingue: con soporte de mas de 140 idiomas, puede usarse para traducir documentacion tecnica o contenido de producto manteniendo contexto largo entre segmentos.
- Procesamiento de video para moderacion o analisis: segun la model card, la familia soporta video, lo que permite tareas de descripcion, resumen o deteccion de contenido en clips cortos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en precision completa (bf16): aproximadamente 16 GB para los 8B parametros almacenados, mas overhead de activaciones y cache KV para contexto largo.
- VRAM estimada en cuantizacion de 8 bits: aproximadamente 8-9 GB; en 4 bits: aproximadamente 5-6 GB (estimaciones teoricas a partir del tamano de parametros, no confirmadas en la informacion proporcionada).
- GPU recomendadas para precision completa: A100 40GB, H100, L40S o RTX 4090 24GB.
- Cabe en GPU de consumo: si, en RTX 4090 24GB en bf16 y en GPUs con 8-12 GB si se cuantiza (RTX 3060 12GB, RTX 4070, etc.).
- Cabe en dispositivos de borde: disenado para ejecucion en moviles de gama alta y portatiles segun la model card.
- Opciones de despliegue: transformers (libreria nativa del repo), vLLM, llama.cpp, Ollama y TGI segun disponibilidad de soporte para la arquitectura Gemma 4; no confirmado en la informacion proporcionada.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Modalidades | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Gemma 4 E4B IT (este repo) | 4.5B efectivos / 8B totales | 128K | Texto, imagen, audio | Apache 2.0 | Hugging Face |
| Gemma 4 E2B | 2.3B efectivos / 5.1B totales | 128K | Texto, imagen, audio | Apache 2.0 | Hugging Face (Google) |
| Gemma 4 12B Unified | 11.95B | 256K | Texto, imagen, audio | Apache 2.0 | Hugging Face (Google) |
| Gemma 4 26B A4B MoE | 25.2B totales / 3.8B activos | 256K | Texto, imagen | Apache 2.0 | Hugging Face (Google) |

Los datos de rendimiento comparativo entre estas variantes no estan disponibles en la informacion proporcionada.

## Limitaciones y advertencias

- El repositorio consultado tiene 0 descargas y 0 likes, y el autor (`angel-6767`) no es el desarrollador original; se trata de una re-subida del modelo oficial de Google. Para produccion se recomienda usar el repositorio oficial `google/gemma-4-E4B`.
- No se dispone de informacion sobre sesgos especificos del modelo en la informacion proporcionada; como todo modelo entrenado con datos web a gran escala, es probable que herede sesgos presentes en esos datos.
- Riesgo de alucinacion inherente a los modelos generativos, especialmente en tareas de recuperacion de hechos o citas.
- El contexto de 128K tokens es menor que el de las variantes 12B, 26B A4B y 31B de la misma familia (256K).
- Aunque la licencia es Apache 2.0, la model card enlaza a la licencia especifica de Gemma 4 (`ai.google.dev/gemma/docs/gemma_4_license`); conviene revisar los terminos de uso comercial y las restricciones de uso aceptable antes de desplegar en produccion.
- La lista concreta de idiomas soportados no esta disponible; la model card solo indica "mas de 140 idiomas" a nivel de familia.
- No se dispone de informacion sobre cuantizaciones oficiales publicadas para este repositorio concreto.
- El modelo base referenciado es `google/gemma-4-E4B`; conviene verificar que los pesos de este repositorio coinciden con los oficiales antes de usarlos en entornos criticos.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/angel-6767/gemma-4-E4B-it
- Modelo base: https://huggingface.co/google/gemma-4-E4B
- Coleccion Gemma 4 en Hugging Face: https://huggingface.co/collections/google/gemma-4
- GitHub de Google Gemma: https://github.com/google-gemma
- Blog de lanzamiento: https://blog.google/innovation-and-ai/technology/developers-tools/gemma-4/
- Documentacion: https://ai.google.dev/gemma/docs/core
- Informe tecnico (arXiv): https://arxiv.org/abs/2607.02770
- Licencia Gemma 4: https://ai.google.dev/gemma/docs/gemma_4_license
- Pagina de modelos Gemma de Google DeepMind: https://deepmind.google/models/gemma/
