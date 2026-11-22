# sebidev/gemma-4-E4B-it-GGUF

## Resumen

Gemma 4 E4B IT es un modelo multimodal de Google DeepMind, distribuido en este repositorio como cuantización GGUF realizada por sebidev. Forma parte de la familia Gemma 4, que incluye variantes densas (E2B, E4B, 31B) y una variante MoE (26B A4B). El modelo E4B es la variante densa de tamano pequeno-medio, disenada para ejecucion local en portatiles y dispositivos de gama alta, con soporte nativo de texto, imagen y audio como entrada, y generacion de texto como salida.

El modelo resuelve el problema de disponer de un modelo multimodal capaz de razonar, generar codigo y ejecutar flujos agénticos en hardware de consumo, manteniendo una ventana de contexto de 128K tokens y soporte multilingue en mas de 140 idiomas. Incorpora modos de razonamiento configurables (thinking modes), soporte nativo del rol `system` y function calling, lo que lo hace adecuado para pipelines de agentes y automatizacion.

Este repositorio concreto contiene pesos en formato GGUF cuantizados, lo que permite su despliegue con llama.cpp y herramientas compatibles. El modelo base declara 7.518.069.290 parametros en safetensors, mientras que la model card indica 4.5B efectivos (8B con embeddings). La licencia declarada es Apache 2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso con atencion hibrida (sliding window local + atencion global), p-RoPE en capas globales |
| Parametros totales | 7.518.069.290 (safetensors); 4.5B efectivos (8B con embeddings) segun model card |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 128K tokens |
| Tipos de cuantizacion | GGUF (Unsloth Dynamic 2.0); niveles concretos no disponibles |
| Idiomas soportados | Mas de 140 idiomas (segun model card del modelo base) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

El modelo emplea una arquitectura transformer densa con 42 capas y un mecanismo de atencion hibrido que intercala atencion local de ventana deslizante (512 tokens) con atencion global completa, garantizando que la capa final sea siempre global. Para optimizar memoria en contextos largos, las capas globales usan claves y valores unificados y aplican Proportional RoPE (p-RoPE). El vocabulario es de 262K tokens. Incluye un codificador de vision de aproximadamente 150M de parametros y un codificador de audio de aproximadamente 300M de parametros.

La familia Gemma 4 se distribuye en variantes preentrenadas y ajustadas por instrucciones. La model card menciona mejoras en capacidades de codigo y agenticas, soporte nativo de function calling y modos de razonamiento configurables, pero no detalla el numero de tokens de entrenamiento, la composicion del dataset ni si se emplearon tecnicas de RLHF o DPO. Esta cuantizacion GGUF ha sido generada con las herramientas de Unsloth (Unsloth Dynamic 2.0) a partir del modelo base `google/gemma-4-E4B-it`.

## Capacidades

- Generacion de texto y razonamiento con modos de pensamiento (thinking) configurables.
- Comprension de imagen con soporte de relacion de aspecto y resolucion variables.
- Entrada de audio nativa (caracteristica de los modelos E2B y E4B).
- Procesamiento de video como entrada multimodal.
- Generacion de codigo y soporte de function calling nativo para flujos agenticos.
- Razonamiento multi-paso y ejecucion de agentes autonomos.
- Soporte multilingue en mas de 140 idiomas.
- Soporte nativo del rol `system` para conversaciones estructuradas.
- Capacidad conversacional multi-turno con contexto de 128K tokens.

## Casos de uso

- Atencion al cliente automatizada: el modelo puede gestionar conversaciones multi-turno con contexto largo gracias a sus 128K tokens de ventana, manteniendo el hilo de la conversacion y consultando historiales extensos sin truncamiento.
- Generacion de codigo en produccion: soporta function calling nativo y puede integrarse en pipelines de CI/CD para autocompletar, revisar o generar pruebas, con la ventaja de ejecutarse en hardware local sin depender de APIs externas.
- Agentes autonomos de escritorio: su soporte de tool calling y razonamiento multi-paso permite construir asistentes que interactuen con herramientas locales, ficheros y APIs en entornos de desarrollo.
- Analisis de documentos con imagenes: al aceptar entrada de imagen y texto, puede procesar capturas, diagramas o formularios escaneados junto con instrucciones textuales en un mismo prompt.
- Transcripcion y analisis de audio en local: el codificador de audio de ~300M de parametros permite construir aplicaciones de resumen de reuniones o notas de voz sin enviar datos a la nube.
- Asistencia en dispositivos de gama alta: su tamano efectivo de 4.5B parametros y las cuantizaciones GGUF permiten desplegarlo en portatiles con GPU de consumo para tareas de productividad offline.
- Investigacion y prototipado multimodal: sirve como base para experimentar con tecnicas de razonamiento, agentes y multimodalidad en entornos con recursos limitados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma exacta; para un modelo de ~7.5B parametros en GGUF, las cuantizaciones de 4 bits suelen requerir del orden de 4-6 GB, las de 8 bits del orden de 8-9 GB y las de 16 bits del orden de 15-16 GB. Estos valores son estimaciones generales, no datos publicados para este repositorio.
- GPU recomendadas: no disponibles en la informacion proporcionada. Por tamano, cabria esperar ejecucion en RTX 3060/4060 (12-16 GB) y superiores para cuantizaciones bajas, y A100/H100 para precision completa o lotes grandes.
- Cabe en GPU de consumo: probablemente si, en cuantizaciones de 4-8 bits, segun el tamano del modelo; no confirmado por el autor.
- Opciones de despliegue: llama.cpp (formato GGUF), Ollama, y herramientas compatibles con GGUF; la model card menciona Unsloth Studio y soporte de llama.cpp.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Modalidades | Licencia | Formato |
|---|---|---|---|---|---|
| Gemma 4 E4B IT (este repo) | 7.5B totales / 4.5B efectivos | 128K | Texto, imagen, audio | Apache 2.0 | GGUF |
| Gemma 4 E2B | 5.1B totales / 2.3B efectivos | 128K | Texto, imagen, audio | Apache 2.0 | GGUF, safetensors |
| Gemma 4 31B Dense | 30.7B | 256K | Texto, imagen | Apache 2.0 | GGUF, safetensors |
| Gemma 4 26B A4B (MoE) | No disponible | 256K | Texto, imagen | Apache 2.0 | GGUF, safetensors |

Los datos de rendimiento comparativo entre estas variantes no estan disponibles en la informacion proporcionada.

## Limitaciones y advertencias

- No se han publicado datos de sesgos especificos para esta cuantizacion ni para el modelo base en la informacion disponible.
- Riesgo de alucinacion inherente a los modelos generativos; no se documentan tasas concretas.
- El modelo esta optimizado para contexto de 128K tokens; superar esa ventana puede degradar la calidad o provocar errores.
- Aunque soporta mas de 140 idiomas, el rendimiento relativo por idioma no esta documentado.
- La licencia Apache 2.0 permite uso comercial, pero debe verificarse la licencia del modelo base en `ai.google.dev/gemma/docs/gemma_4_license`, ya que la model card enlaza a una licencia especifica de Gemma 4.
- Las cuantizaciones GGUF pueden introducir perdida de precision respecto al modelo en 16 bits; no se han publicado evaluaciones de esta cuantizacion concreta.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no hay evidencia de validacion comunitaria.
- El tamano del repositorio es de 126.3 GB, lo que incluye multiples niveles de cuantizacion; debe seleccionarse el fichero adecuado segun el hardware.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/sebidev/gemma-4-E4B-it-GGUF
- Modelo base: https://huggingface.co/google/gemma-4-E4B-it
- Coleccion Gemma 4 en Hugging Face: https://huggingface.co/collections/google/gemma-4
- Guia de Unsloth para Gemma 4: https://docs.unsloth.ai/models/gemma-4
- Benchmarks de cuantizacion Unsloth Dynamic 2.0: https://unsloth.ai/docs/basics/unsloth-dynamic-v2.0-gguf
- Guia MTP de Unsloth: https://unsloth.ai/docs/models/mtp
- Unsloth Studio: https://unsloth.ai/docs/new/studio
- Repositorio GitHub de Unsloth: https://github.com/unslothai/unsloth/
- Blog de lanzamiento de Gemma 4: https://blog.google/innovation-and-ai/technology/developers-tools/gemma-4/
- Documentacion de Gemma: https://ai.google.dev/gemma/docs/core
- Licencia Gemma 4: https://ai.google.dev/gemma/docs/gemma_4_license
- GitHub de Google Gemma: https://github.com/google-gemma
- Pagina de DeepMind Gemma: https://deepmind.google/models/gemma/
