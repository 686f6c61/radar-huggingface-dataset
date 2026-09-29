# asincole/gemma-4-12B-it-qat-q4_0-gguf

## Resumen

Gemma 4 12B IT QAT Q4_0 GGUF es la version cuantizada en formato GGUF del checkpoint de 12B de la familia Gemma 4 de Google DeepMind, optimizada mediante entrenamiento consciente de cuantizacion (QAT, Quantization-Aware Training) para conservar una calidad cercana a bfloat16 reduciendo de forma notable el consumo de memoria. Se trata de un modelo multimodal (entrada de texto, imagen, video y audio; salida de texto) con arquitectura transformer densa de 11.907.350.576 parametros y una ventana de contexto de 256K tokens.

La ficha que nos ocupa, `asincole/gemma-4-12B-it-qat-q4_0-gguf`, es un espejo/reejecucion publicado por un tercero a partir del checkpoint `google/gemma-4-12B-it-qat-q4_0-unquantized`. Conserva la model card original de Google, la licencia Apache 2.0 y el pipeline declarado `any-to-any`, pero registra 0 descargas y 0 likes, por lo que se trata de un artefacto no validado por la comunidad. El repositorio ocupa 7,2 GB.

Su relevancia practica es que empaqueta en GGUF un modelo de 12B con contexto de 256K, lo que permite desplegarlo en GPU de consumo y en portatiles con suficiente memoria unificada, sin necesidad de infraestructura de servidor. Para desarrolladores que evaluan modelos locales con soporte multimodal y de agentes, es una opcion directa de probar en llama.cpp, Ollama o LM Studio.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso multimodal con atencion hibrida: intercala atencion local de ventana deslizante con atencion global completa (la capa final siempre es global). Las capas globales usan claves y valores unificados y Proportional RoPE (p-RoPE) |
| Parametros totales | 11.907.350.576 (11,95B) |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | 262.144 tokens (256K) |
| Ventana deslizante (atencion local) | 1024 tokens |
| Capas | 48 |
| Tamano de vocabulario | 262.000 tokens |
| Tipos de cuantizacion | Q4_0 en GGUF (este repositorio). La familia QAT tambien se publica como checkpoint sin cuantizar (Q4_0 half-precision), wNa8o8 para movil y compressed-tensors w4a16 para vLLM |
| Idiomas soportados | Mas de 140 idiomas segun la model card de Google; la lista concreta no esta disponible en este repositorio |
| Modalidades de entrada | Texto, imagen (relacion de aspecto y resolucion variables), video y audio |
| Modalidad de salida | Texto |
| Licencia | Apache 2.0 (con enlace a la licencia especifica de Gemma 4) |
| Formato de pesos | GGUF (Q4_0) |
| Tamano del repositorio | 7,2 GB |
| Modelo base | google/gemma-4-12B-it-qat-q4_0-unquantized |
| Libreria declarada | transformers |
| Pipeline declarado | any-to-any |

## Arquitectura y entrenamiento

El modelo parte del checkpoint `gemma-4-12B-it-qat-q4_0-unquantized` de Google DeepMind, un transformer denso de 48 capas con 11,95B de parametros, vocabulario de 262.000 tokens y ventana de contexto de 256K tokens. La innovacion arquitectonica principal de la familia Gemma 4 es su mecanismo de atencion hibrida: las capas alternan atencion local con ventana deslizante de 1024 tokens y atencion global completa, garantizando que la ultima capa sea siempre global. Para reducir el coste de memoria en contextos largos, las capas globales emplean claves y valores unificados y aplican Proportional RoPE (p-RoPE). El modelo es multimodal nativo, con soporte de imagen y audio ademas de texto.

El proceso de entrenamiento destacable es el QAT (Quantization-Aware Training): en lugar de cuantizar a posteriori un modelo entrenado en bfloat16, el pipeline de Google integra la cuantizacion durante el entrenamiento, de modo que los pesos resultantes en Q4_0 conservan una calidad cercana a la del modelo en precision completa. El modelo es una variante instruction-tuned (sufijo IT), por lo que ha pasado por ajuste con instrucciones y, segun la documentacion de la familia, incorpora soporte nativo del rol `system`, modos de razonamiento configurables (thinking modes) y function calling nativo. El numero exacto de tokens de entrenamiento, la composicion del dataset y el detalle de las etapas de RLHF/DPO no estan disponibles en la informacion proporcionada.

Un detalle operativo relevante: cuando se usa decodificacion especulativa con un modelo asistente (multi-token prediction) junto a un modelo objetivo QAT, el asistente debe ser tambien un checkpoint QAT con la misma precision para garantizar la compatibilidad.

## Capacidades

- Generacion de texto y razonamiento con modos de pensamiento configurables (thinking mode).
- Comprension multimodal: entrada de texto, imagen con soporte de relacion de aspecto y resolucion variables, video y audio.
- Generacion de codigo, con mejoras notables declaradas en benchmarks de programacion respecto a generaciones anteriores de la familia.
- Function calling y tool calling nativos, orientados a flujos agenticos.
- Capacidades agenticas y razonamiento multi-paso para agentes autonomos.
- Soporte nativo del rol `system` para conversaciones mas estructuradas y controlables.
- Soporte multilingue en mas de 140 idiomas.
- Decodificacion especulativa mediante modelos asistente/drafter de la misma familia QAT (requiere coincidencia de precision).
- Formato GGUF Q4_0 listo para desplegar en el ecosistema llama.cpp y derivados.
- Capacidad de conversacion multi-turno con contexto de hasta 256K tokens.

## Casos de uso

- Atencion al cliente automatizada: con 256K tokens de contexto, el modelo puede mantener conversaciones multi-turno muy largas y arrastrar historial completo de incidencias sin truncar, ademas de procesar capturas o documentos adjuntos enviados por el usuario.
- Agentes autonomos con tool calling: al soportar function calling nativo y el rol `system`, se puede integrar en bucles de razonamiento multi-paso que consulten APIs, bases de datos o sistemas internos de forma encadenada.
- Asistente de programacion local: la variante instruction-tuned y sus mejoras en codigo permiten autocompletado, refactorizacion y generacion de tests ejecutandose en una sola GPU de consumo, sin enviar codigo propietario a servicios externos.
- Analisis de documentacion tecnica con imagenes: al aceptar imagen y video como entrada, sirve para extraer informacion de diagramas, planos, capturas de dashboards o fotogramas de grabaciones y resumirla en texto.
- Transcripcion y analisis de audio: el soporte de audio nativo permite resumir reuniones, generar actas o extraer acciones a partir de grabaciones, combinando audio y texto en la misma conversacion.
- Extraccion estructurada de datos en pipelines ETL: uso del modelo en local para convertir documentos heterogeneos (PDF renderizados, capturas, correos) en JSON estructurado, con el incentivo de que los datos no salen de la infraestructura propia.
- Despliegue en portatil o estacion de trabajo para prototipado: el GGUF de 7,2 GB cabe en equipos con 8-16 GB de VRAM o memoria unificada, lo que permite iterar en investigacion sin clúster.
- Moderacion y clasificacion de contenido multilingue: con cobertura de mas de 140 idiomas, se puede emplear para etiquetar o filtrar contenido en flujos de publicacion a escala.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card de la familia Gemma 4 menciona mejoras en razonamiento, codigo y capacidades agenticas, pero no incluye cifras concretas (MMLU, HumanEval, GSM8K u otras) en el material proporcionado. Tampoco hay mediciones de latencia o throughput para esta cuantizacion concreta.

## Requisitos de hardware

- VRAM estimada para inferencia: el repositorio GGUF Q4_0 ocupa 7,2 GB, por lo que los pesos requieren aproximadamente 7-8 GB de memoria. A ello hay que sumar la cache KV, que crece linealmente con la longitud de contexto y puede superar los pesos en ventanas cercanas a 256K tokens.
- GPU recomendadas: RTX 4090 (24 GB), RTX 3090 (24 GB) o RTX 4080 (16 GB) para uso individual con contexto amplio; A100 40/80 GB y H100 para servicio concurrente y contextos muy largos.
- GPU de consumo: si cabe en tarjetas de 8 GB (RTX 3070, RTX 4060 Ti) para contextos cortos o medios; en 12-16 GB (RTX 3060 12 GB, RTX 4070 Ti Super) el margen es comodo. En Apple Silicon, 16 GB de memoria unificada o mas es un punto de partida razonable.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio y otros frontends basados en GGUF son el destino natural de este formato. vLLM y TGI estan mas orientados a los checkpoints safetensors o compressed-tensors w4a16 de la familia; el soporte de GGUF en vLLM es experimental.
- Latencia y throughput estimados: no disponibles.
- Nota sobre decodificacion especulativa: si se usa un modelo asistente, debe ser un checkpoint QAT de la misma precision.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato / cuantizacion | Modalidades | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| asincole/gemma-4-12B-it-qat-q4_0-gguf (este) | 11,95B | 256K | GGUF Q4_0 | Texto, imagen, video, audio | Apache 2.0 | Espejo de terceros, 0 descargas, 0 likes |
| google/gemma-4-12B-it-qat-q4_0-gguf | 11,95B | 256K | GGUF Q4_0 | Texto, imagen, video, audio | Apache 2.0 | Repositorio oficial de Google |
| google/gemma-4-12B-it-qat-q4_0-unquantized | 11,95B | 256K | Pesos half-precision extraidos del pipeline QAT | Texto, imagen, video, audio | Apache 2.0 | Repositorio oficial de Google |
| Gemma 4 E4B | 4,5B efectivos (8B con embeddings) | 128K | GGUF Q4_0, wNa8o8, w4a16 | Texto, imagen, audio | Apache 2.0 | Repositorio oficial de Google |

Frente al GGUF oficial de Google, este repositorio no aporta ninguna modificacion declarada; la diferencia esta en el nivel de validacion y en el numero de descargas. Frente al checkpoint sin cuantizar, el GGUF Q4_0 reduce el espacio en disco aproximadamente a la mitad o menos a cambio de una perdida de calidad que la propia model card describe como pequena gracias al QAT.

## Limitaciones y advertencias

- Repositorio de terceros sin traccion: 0 descargas y 0 likes en el momento de la consulta. No hay evidencia de validacion de integridad ni de que el archivo GGUF coincida bit a bit con el oficial. Para produccion, se recomienda partir del repositorio oficial de Google.
- Riesgo de alucinacion: como cualquier modelo generativo, puede producir informacion falsa con aparente seguridad, especialmente en tareas factuales y con contextos muy largos.
- Perdida de calidad por cuantizacion: aunque el QAT reduce el impacto, Q4_0 sigue siendo una cuantizacion de 4 bits; en tareas sensibles a precision (matematicas, codigo complejo, seguimiento estricto de formato) el modelo sin cuantizar es preferible.
- Coste de memoria en contexto largo: la ventana de 256K es nominal; en la practica, la cache KV puede consumir mas memoria que los propios pesos, lo que limita la longitud real de contexto en GPU de consumo.
- Idiomas: la familia declara mas de 140 idiomas, pero no se detalla la lista ni la calidad por idioma; no hay evaluacion especifica para este repositorio.
- Modalidades: la model card de la familia lista audio como soportado en E2B, E4B y 12B, pero el desglose de parametros del codificador de vision y de audio aparece como "-" en la tabla oficial del 12B Unified, por lo que el detalle de esos componentes no esta disponible.
- Licencia: el repositorio declara Apache 2.0 con enlace a la licencia especifica de Gemma 4. Antes de uso comercial conviene verificar los terminos efectivos de esa licencia, ya que la familia Gemma ha tenido historicamente condiciones propias adicionales.
- Decodificacion especulativa: un asistente no QAT o con precision distinta a la del modelo objetivo rompe la compatibilidad.
- Fecha y procedencia: el repositorio esta fechado en septiembre de 2026 y se apoya en un informe tecnico con identificador arXiv 2607.02770; conviene contrastar la vigencia de ambos antes de citarlos.

## Enlaces

- Repositorio de este modelo: https://huggingface.co/asincole/gemma-4-12B-it-qat-q4_0-gguf
- Modelo base: https://huggingface.co/google/gemma-4-12B-it-qat-q4_0-unquantized
- GGUF oficial de Google: https://huggingface.co/google/gemma-4-12B-it-qat-q4_0-gguf
- Coleccion Gemma 4 QAT Q4_0: https://huggingface.co/collections/google/gemma-4-qat-q4-0
- GitHub de Google Gemma: https://github.com/google-gemma
- Blog de lanzamiento del QAT de Gemma 4: https://blog.google/innovation-and-ai/technology/developers-tools/quantization-aware-training-gemma-4/
- Documentacion de Gemma: https://ai.google.dev/gemma/docs/core
- Informe tecnico (arXiv 2607.02770): https://arxiv.org/abs/2607.02770
- Licencia de Gemma 4: https://ai.google.dev/gemma/docs/gemma_4_license
- Pagina de modelos Gemma de Google DeepMind: https://deepmind.google/models/gemma/
- Ficha en Secret AI: https://secretai.io/models/google/gemma-4-12B-it-qat-q4_0-gguf
- Ficha en local-ai-zone: https://local-ai-zone.github.io/models/gemma-4-12b-it-qat-q4-0.html
- Ficha en theapplied.co: https://theapplied.co/models/google-gemma-4-12b-it-qat-q4-0-gguf
