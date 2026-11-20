# SoAIHQ/gemma-4-E4B-it-GGUF

## Resumen

SoAIHQ/gemma-4-E4B-it-GGUF es una distribucion en formato GGUF del modelo google/gemma-4-E4B-it, publicada por SoAI para su uso con llama.cpp y con la plataforma del propio autor. Se trata de una cuantizacion del modelo original de Google, no de un modelo entrenado desde cero: el repositorio incluye los pesos convertidos a GGUF en dos niveles de precision (Q4_K_M y Q8_0), ademas de un proyector multimodal en F16 necesario para las entradas de imagen y audio.

El modelo base es un transformer denso de Google con embeddings por capa, 4.500 millones de parametros efectivos (8.000 millones contando los embeddings) y una ventana de contexto de 131.072 tokens. Su rasgo diferencial es la multimodalidad de entrada completa (texto, imagen y audio) junto con un modo de razonamiento ("thinking") configurable por peticion y soporte nativo de tool calling. El pipeline declarado es any-to-any y la licencia es Apache 2.0, con enlace a la licencia especifica de Gemma 4 de Google.

La relevancia de esta ficha concreta esta en el trabajo de cuantizacion: SoAI ha calibrado la matriz de importancia (imatrix) con un corpus propio de conversaciones de chat, codigo y llamadas a herramientas, en lugar de texto web generico, y verifica antes de publicar que los marcadores de chat, razonamiento y tool calls se almacenan como tokens especiales. Eso reduce el riesgo tipico de las conversiones GGUF mal hechas, que rompen silenciosamente el formato de turnos y las llamadas a funciones.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso con embeddings por capa (per-layer embeddings) |
| Parametros totales | 7.518.069.290 (pesos reales en safetensors); 4,5B efectivos, 8B con embeddings segun el autor |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 131.072 tokens (128K) |
| Tipos de cuantizacion | Q4_K_M (5,3 GB) y Q8_0 (8,0 GB); proyector multimodal mmproj en F16 (990,4 MB). El autor no publica cuantizaciones por debajo de 4 bits |
| Idiomas soportados | 35+ idiomas segun el autor; preentrenado en 140+ |
| Licencia | Apache 2.0 (con enlace a la licencia de Gemma 4 de Google) |
| Formato de pesos | GGUF (llama.cpp, version de referencia v0.5.0); el modelo base original esta en safetensors |
| Entradas soportadas | Texto, imagen y audio |
| Razonamiento configurable | Si, activable por peticion mediante `enable_thinking` |
| Tool calling | Si, con sintaxis nativa en la plantilla de chat |
| Tamano del repositorio | 14,4 GB |

## Arquitectura y entrenamiento

El modelo base es un transformer denso de Google que incorpora embeddings por capa, una variante en la que cada capa dispone de su propia representacion de embedding en lugar de compartir una unica matriz de entrada. Segun el autor, el modelo tiene 4,5B de parametros efectivos y 8B contando los embeddings, lo que explica que el recuento real de pesos en safetensors sea de 7.518.069.290 parametros. La ventana de contexto alcanza los 131.072 tokens y el modelo acepta texto, imagenes y audio como entrada, con salida de texto.

No se dispone de informacion sobre el volumen de tokens de entrenamiento, la composicion exacta del dataset ni el proceso de alineacion (RLHF, DPO u otros) del modelo original de Google; la model card de esta cuantizacion no los detalla. La innovacion tecnica documentada en este repositorio es el proceso de cuantizacion: Q4_K_M se genera con una matriz de importancia (imatrix) calculada por SoAI sobre un corpus propio formateado con la plantilla de chat del modelo, incluyendo sintaxis nativa de tool calls, conversaciones multi-turno en 21 idiomas, ediciones de codigo en 22 lenguajes de programacion, matematicas paso a paso y prosa web. Q8_0 se genera sin imatrix porque el formato de llama.cpp no lo utiliza. Antes de cuantizar, el pipeline comprueba que los marcadores de chat, razonamiento y tool calls se almacenan como tokens especiales y que la plantilla embebida coincide con la original; si la conversion los importa como texto plano, el proceso se detiene en lugar de publicar el fichero. El fichero de imatrix y la tabla de procedencia (revision original y commit de llama.cpp) se publican en el repositorio para permitir reconstruir los ficheros.

## Capacidades

- Generacion de texto conversacional multi-turno con contexto de hasta 131.072 tokens.
- Entrada de imagenes: el modelo acepta imagenes ademas de texto, requiriendo el proyector mmproj en F16.
- Entrada de audio: acepta audio como entrada, tambien mediante el proyector mmproj.
- Razonamiento configurable: modo "thinking" activable o desactivable por peticion con `chat_template_kwargs.enable_thinking`.
- Tool calling / function calling con sintaxis nativa en la plantilla de chat, preservada como tokens especiales en la cuantizacion.
- Capacidades de codigo: el corpus de calibracion incluye ediciones en 22 lenguajes de programacion, lo que sugiere uso previsto en tareas de programacion.
- Matematicas paso a paso: el corpus de calibracion incluye razonamiento matematico secuencial.
- Multilingue: 35+ idiomas soportados segun el autor, con preentrenamiento en 140+.
- Compatible con API OpenAI a traves de llama-server (`/v1/chat/completions`).
- Interfaz de chat web integrada en llama-server (puerto 8080).

## Casos de uso

- Asistente conversacional local con contexto largo: con 131.072 tokens de ventana, el modelo puede mantener conversaciones multi-turno con documentos extensos adjuntos sin truncar, ejecutandose en llama.cpp sobre GPU, CPU o reparto entre ambas.
- Procesamiento de documentos con imagenes: digitalizacion y extraccion de informacion de facturas, formularios o capturas cargando el mmproj F16; el modelo acepta la imagen como entrada y devuelve texto estructurado.
- Transcripcion y analisis de audio en local: al aceptar entrada de audio, puede usarse para resumir reuniones o extraer acciones de grabaciones sin enviar el audio a un servicio externo.
- Agente con tool calling en pipelines internos: la sintaxis nativa de llamadas a herramientas, preservada como tokens especiales en el GGUF, permite integrar el modelo en flujos que consultan APIs, bases de datos o sistemas de ficheros mediante llama-server y su API compatible con OpenAI.
- Asistencia de programacion en el editor: el corpus de calibracion incluye ediciones en 22 lenguajes, por lo que el cuantizado Q4_K_M esta ajustado a ese dominio; util para autocompletado, refactorizacion y explicacion de codigo en un servidor local.
- Razonamiento matematico con traza: activando `enable_thinking` por peticion se obtiene razonamiento paso a paso para problemas de matematicas o logica, y se desactiva para respuestas rapidas de baja latencia.
- Despliegue en hardware de consumo: con Q4_K_M (5,3 GB) el modelo cabe en GPUs consumer de gama media-alta o en equipos con CPU y RAM suficiente, lo que permite prototipado sin infraestructura cloud.
- Servicio multilingue de atencion al cliente: con 35+ idiomas declarados, puede desplegarse como backend de chat en varios idiomas sobre la API compatible con OpenAI.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del repositorio no incluye tablas de MMLU, HumanEval, GSM8K ni metricas comparativas; solo describe el proceso de cuantizacion y las opciones de descarga.

## Requisitos de hardware

- VRAM para Q4_K_M: aproximadamente 5,3 GB solo para los pesos, mas memoria adicional para el contexto, que crece con la longitud configurada.
- VRAM para Q8_0: aproximadamente 8,0 GB para los pesos, mas la memoria de contexto.
- Proyector multimodal: 990,4 MB adicionales en F16 si se usan entradas de imagen o audio (cargado con `--mmproj`).
- GPU recomendadas: no especificadas por el autor. Por tamano, Q4_K_M encaja en GPUs consumer con 8 GB o mas de VRAM; Q8_0 requiere 10-12 GB o mas para dejar margen al contexto.
- Cabe en GPU consumer: si, Q4_K_M en tarjetas de 8 GB o superiores; Q8_0 en tarjetas de 12 GB o superiores, segun la memoria reservada para contexto.
- Despliegue: llama.cpp (referencia v0.5.0), con llama-server para servidor local, interfaz de chat web y API compatible con OpenAI. El autor menciona tambien la plataforma SoAI. No se documentan vLLM, TGI ni Ollama en la informacion disponible.
- Reparto GPU/CPU: llama.cpp permite dividir capas entre GPU y CPU, util si la VRAM es insuficiente.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Entradas | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| SoAIHQ/gemma-4-E4B-it-GGUF (esta ficha) | 4,5B efectivos / 7,5B en pesos | 131.072 | Texto, imagen, audio | Apache 2.0 | GGUF (Q4_K_M, Q8_0) | Cuantizacion con imatrix propia y verificacion de tokens especiales |
| google/gemma-4-E4B-it | 4,5B efectivos / 8B con embeddings | 131.072 | Texto, imagen, audio | Apache 2.0 (licencia Gemma 4) | Safetensors | Modelo original de Google; sin cuantizar, mayor requisito de memoria |
| Otras cuantizaciones GGUF de gemma-4-E4B-it | Mismo modelo base | 131.072 | Texto, imagen, audio (con mmproj) | Apache 2.0 | GGUF | No se dispone de datos comparativos de calidad ni de calibracion en la informacion proporcionada |

No se dispone de datos de benchmarks que permitan comparar el rendimiento de esta cuantizacion con el modelo original ni con otras alternativas de la misma categoria.

## Limitaciones y advertencias

- Es una cuantizacion, no un modelo nuevo: hereda integramente los sesgos y limitaciones del modelo base de Google, que no se documentan en esta model card.
- Riesgo de alucinacion: no se han publicado evaluaciones de fidelidad para esta version; al ser un modelo de 4,5B efectivos, la tasa de error en tareas de conocimiento factual puede ser mayor que en modelos de mayor tamano.
- Perdida de calidad por cuantizacion: Q4_K_M reduce el tamano a aproximadamente un tercio de los pesos originales en 16 bits; el autor afirma que la calidad se mantiene cercana, pero no publica metricas que lo cuantifiquen. Q8_0 es casi sin perdida, a costa de mas memoria.
- El autor no publica cuantizaciones por debajo de 4 bits, por lo que no hay opciones para equipos con menos de aproximadamente 5-6 GB de memoria disponible.
- Las entradas de imagen y audio requieren el fichero mmproj F16 adicional; sin el, el modelo solo procesa texto.
- Idiomas: se declaran 35+ idiomas soportados, pero no se detalla el rendimiento por idioma ni se listan cuales son; el castellano no se menciona explicitamente.
- Contexto largo: la memoria necesaria crece con la longitud de contexto configurada, lo que puede impedir alcanzar los 131.072 tokens en hardware limitado.
- Licencia: Apache 2.0 segun el repositorio, con enlace a la licencia de Gemma 4 de Google; conviene revisar los terminos de uso de Gemma 4 antes de un despliegue comercial, ya que el propio autor remite a esa licencia.
- Dependencia de la version de llama.cpp: el autor referencia la v0.5.0; versiones distintas pueden comportarse de forma diferente con los tokens especiales y la plantilla de chat.
- Popularidad muy baja (1 like, 1.255 descargas en la informacion disponible): no hay validacion independiente de la calidad de estas cuantizaciones.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/SoAIHQ/gemma-4-E4B-it-GGUF
- Modelo base: https://huggingface.co/google/gemma-4-E4B-it
- Licencia Gemma 4: https://ai.google.dev/gemma/docs/gemma_4_license
- Sitio del autor (SoAI): https://soai.to
- llama.cpp: https://github.com/ggml-org/llama.cpp
- Fichero Q4_K_M: https://huggingface.co/SoAIHQ/gemma-4-E4B-it-GGUF/resolve/main/gemma-4-E4B-it-Q4_K_M.gguf
- Fichero Q8_0: https://huggingface.co/SoAIHQ/gemma-4-E4B-it-GGUF/resolve/main/gemma-4-E4B-it-Q8_0.gguf
- Proyector multimodal F16: https://huggingface.co/SoAIHQ/gemma-4-E4B-it-GGUF/resolve/main/mmproj-gemma-4-E4B-it-f16.gguf
