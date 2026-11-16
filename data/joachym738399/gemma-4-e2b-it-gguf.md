# Joachym738399/gemma-4-E2B-it-GGUF

## Resumen

Gemma 4 E2B-it es un modelo multimodal desarrollado por Google DeepMind, publicado como parte de la familia Gemma 4. Se trata de la variante mas pequena de la familia (2,3B parametros efectivos, 5,1B contando embeddings), disenada especificamente para ejecucion en dispositivo (telefonos de gama alta, portatiles y equipos de borde). Procesa texto, imagen y audio como entrada, y genera texto como salida, con una ventana de contexto de 128K tokens y soporte para mas de 140 idiomas.

La relevancia de este modelo radica en su combinacion de tamano reducido, multimodalidad nativa (incluyendo audio, algo poco habitual en modelos de este tamano) y capacidades de razonamiento con modos de pensamiento configurables. Incorpora una arquitectura de atencion hibrida que intercala atencion local de ventana deslizante con atencion global completa, lo que reduce el coste de memoria en contextos largos sin sacrificar el rendimiento en tareas que requieren comprension global.

El repositorio que nos ocupa, `Joachym738399/gemma-4-E2B-it-GGUF`, es una cuantizacion GGUF del modelo base `google/gemma-4-E2B-it`, generada con las herramientas de Unsloth (Unsloth Dynamic 2.0 GGUFs). Su proposito es permitir la inferencia local del modelo en hardware de consumo mediante llama.cpp y herramientas compatibles, con licencia Apache 2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer hibrido con atencion local de ventana deslizante + atencion global (unified KV, Proportional RoPE) |
| Parametros totales | 4.647.450.147 (dato real de safetensors); 2,3B efectivos, 5,1B con embeddings |
| Parametros activos | No aplica (variante densa; la familia incluye una variante MoE 26B A4B, pero no este modelo) |
| Longitud de contexto | 128K tokens |
| Tipos de cuantizacion | GGUF (Unsloth Dynamic 2.0); niveles concretos no disponibles en la informacion proporcionada |
| Idiomas soportados | Mas de 140 idiomas (segun la model card de la familia Gemma 4) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (repositorio de cuantizacion); el modelo base original se distribuye en otros formatos, no disponibles en esta ficha |

## Arquitectura y entrenamiento

Gemma 4 E2B-it emplea una arquitectura transformer densa con 35 capas y un mecanismo de atencion hibrido que intercala capas de atencion local con ventana deslizante de 512 tokens y capas de atencion global completa, garantizando que la ultima capa sea siempre global. Para optimizar el uso de memoria en contextos largos, las capas globales utilizan claves y valores unificados (unified KV) y aplican Proportional RoPE (p-RoPE). El vocabulario es de 262K tokens. El modelo integra ademas un codificador de vision de aproximadamente 150M de parametros y un codificador de audio de aproximadamente 300M de parametros.

La model card de la familia indica que los modelos Gemma 4 se distribuyen en variantes preentrenadas y ajustadas por instrucciones, con soporte nativo del rol `system` y modos de pensamiento configurables. No se dispone en la informacion proporcionada del numero de tokens de entrenamiento, la composicion del dataset ni los detalles de las etapas de RLHF/DPO. La cuantizacion GGUF de este repositorio ha sido generada por Unsloth con su metodologia Dynamic 2.0, que segun el autor aplica tecnicas de cuantizacion selectiva por capas; no se detallan en la informacion disponible los benchmarks de dicha cuantizacion.

## Capacidades

- Generacion de texto y razonamiento con modos de pensamiento configurables (thinking modes).
- Comprension de imagenes con soporte de relacion de aspecto y resolucion variables.
- Procesamiento de audio nativo (el modelo E2B incluye codificador de audio).
- Procesamiento de video segun la model card de la familia Gemma 4.
- Generacion de codigo, con mejoras notables en benchmarks de codificacion segun Google.
- Soporte nativo de function calling / tool calling para flujos agénticos.
- Capacidades agénticas y razonamiento multi-paso.
- Soporte multilingue en mas de 140 idiomas.
- Soporte nativo del rol `system` para conversaciones estructuradas.
- Soporte de MTP (Multi-Token Prediction) anadido en la actualizacion del 9 de junio segun la model card de Unsloth.

## Casos de uso

- Asistente local en dispositivo movil: con 2,3B parametros efectivos y cuantizacion GGUF, el modelo puede ejecutarse en telefonos de gama alta para tareas de asistencia conversacional, resumen y respuesta a preguntas sin conexion, incluyendo entrada por voz gracias a su codificador de audio.
- Analisis de imagenes en el borde: el codificador de vision de ~150M de parametros permite describir capturas, extraer texto de imagenes o responder preguntas sobre fotografias en un portatil, sin depender de la nube.
- Transcripcion y comprension de audio: el codificador de audio de ~300M de parametros habilita casos como resumen de reuniones o clasificacion de notas de voz directamente en local.
- Atencion al cliente automatizada: los 128K tokens de contexto permiten gestionar conversaciones multi-turno con historiales largos y documentacion adjunta, con soporte de system prompt para controlar el tono y las restricciones.
- Pipelines de codigo asistido: el soporte de function calling y las mejoras en benchmarks de codigo permiten integrar el modelo en editores o flujos de CI/CD para generacion de tests, revision de fragmentos o autocompletado contextual.
- Agentes autonomos ligeros: con tool calling nativo y razonamiento multi-paso, puede orquestar llamadas a APIs en entornos con recursos limitados, como un portatil de desarrollo o un dispositivo IoT con GPU integrada.
- Procesamiento multilingue: con mas de 140 idiomas, es adecuado para traduccion, clasificacion y resumen de documentos en entornos con diversidad linguistica, incluyendo espanol.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma exacta en la informacion proporcionada. Como referencia orientativa, un modelo denso de ~4,6B parametros en cuantizacion de 4 bits requiere del orden de 3-4 GB de memoria para los pesos, mas overhead de contexto KV; las cifras exactas para esta cuantizacion concreta no estan disponibles.
- GPU recomendadas: el modelo esta disenado para ejecucion en dispositivo (telefonos de gama alta, portatiles); para servidor, GPU consumer como RTX 4090 o superiores son mas que suficientes por tamano, aunque no se dispone de mediciones oficiales.
- Cabe en GPU consumer: si, previsiblemente en la mayoria de GPU consumer modernas con cuantizacion GGUF, aunque no se dispone de confirmacion oficial en la informacion proporcionada.
- Opciones de despliegue: llama.cpp (formato GGUF), Ollama y otras herramientas compatibles con GGUF; Unsloth Studio segun la model card. vLLM y TGI no se mencionan para este formato en la informacion disponible.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Modalidades | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Gemma 4 E2B-it (este) | 2,3B efectivos (5,1B con embeddings) | 128K | Texto, imagen, audio | Apache 2.0 | GGUF en este repo; original en Google |
| Gemma 4 E4B-it | 4,5B efectivos (8B con embeddings) | 128K | Texto, imagen, audio | Apache 2.0 | Coleccion Unsloth / Google |
| Gemma 4 31B Dense | 30,7B | 256K | Texto, imagen | Apache 2.0 | Coleccion Unsloth / Google |
| Gemma 4 26B A4B (MoE) | 26B totales, 4B activos | 256K (segun familia) | Texto, imagen | Apache 2.0 | Coleccion Unsloth / Google |

No se dispone de datos de benchmarks para comparar el rendimiento relativo entre estas variantes en la informacion proporcionada.

## Limitaciones y advertencias

- Riesgo de alucinacion: como todo modelo generativo, puede producir informacion incorrecta con apariencia de veracidad; no se han publicado tasas de alucinacion en la informacion disponible.
- Sesgos: no se detallan sesgos conocidos en la informacion proporcionada; la model card de la familia no los especifica en el extracto disponible.
- Contexto: la ventana es de 128K tokens en esta variante, inferior a los 256K de las variantes medias; el rendimiento real en contextos muy largos puede degradarse.
- Idiomas: aunque se declaran mas de 140 idiomas, la calidad puede variar sustancialmente entre ellos; no hay evaluaciones por idioma disponibles.
- Licencia: Apache 2.0 permite uso comercial, pero la model card enlaza a la licencia especifica de Gemma 4 (`ai.google.dev/gemma/docs/gemma_4_license`), que conviene revisar para confirmar terminos adicionales de uso.
- Cuantizacion: al ser una cuantizacion GGUF de terceros (Unsloth), puede haber perdida de calidad respecto al modelo original en 16 bits; no se han publicado metricas de degradacion para esta cuantizacion concreta.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: no hay evidencia de validacion comunitaria de esta cuantizacion especifica.
- No se dispone de informacion sobre el numero de tokens de entrenamiento ni la composicion del dataset, lo que limita la evaluacion de sesgos y cobertura.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Joachym738399/gemma-4-E2B-it-GGUF
- Modelo base: https://huggingface.co/google/gemma-4-E2B-it
- Guia de Unsloth para Gemma 4: https://docs.unsloth.ai/models/gemma-4
- Benchmarks de cuantizacion Unsloth Dynamic 2.0: https://unsloth.ai/docs/basics/unsloth-dynamic-v2.0-gguf
- Guia MTP de Unsloth: https://unsloth.ai/docs/models/mtp
- Unsloth Studio: https://unsloth.ai/docs/new/studio
- Repositorio Unsloth en GitHub: https://github.com/unslothai/unsloth/
- Discord de Unsloth: https://discord.gg/unsloth
- Coleccion Gemma 4 de Unsloth: https://huggingface.co/collections/unsloth/gemma-4
- Coleccion Gemma 4 de Google: https://huggingface.co/collections/google/gemma-4
- GitHub de Google Gemma: https://github.com/google-gemma
- Blog de lanzamiento de Gemma 4: https://blog.google/innovation-and-ai/technology/developers-tools/gemma-4/
- Documentacion de Gemma: https://ai.google.dev/gemma/docs/core
- Licencia de Gemma 4: https://ai.google.dev/gemma/docs/gemma_4_license
- Pagina de Gemma en Google DeepMind: https://deepmind.google/models/gemma/
