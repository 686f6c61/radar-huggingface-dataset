# SayWrite/model-mirror

## Resumen

SayWrite/model-mirror no es un modelo entrenado por su autor, sino un repositorio espejo que aloja copias sin modificar de los modelos que la aplicacion de escritorio SayWrite (macOS) descarga durante su configuracion inicial. El autor, SayWrite, actua unicamente como distribuidor de respaldo: la aplicacion intenta primero la ubicacion original en Hugging Face de cada modelo y recurre a este espejo en segundo lugar, verificando cada fichero contra un SHA-256 fijado en `SHA256SUMS`, de modo que nunca se usa un fichero que difiera del original.

El repositorio agrupa dos familias funcionales: modelos de escritura (las cuantizaciones GGUF Q4_K_M de Qwen 3.5 en variantes 2B, 4B y 9B, producidas por Unsloth) y modelos de voz (Parakeet TDT 0.6B v2 de NVIDIA en conversion Core ML por FluidInference, y Whisper small.en de OpenAI en conversion Core ML por Argmax). El dato de parametros reportado por safetensors (1.881.825.088) corresponde a uno de los artefactos del conjunto, no a un unico modelo, ya que el repositorio contiene varios modelos independientes.

Su relevancia es operativa mas que tecnica: sirve como referencia de como empaquetar y verificar artefactos de terceros con licencias heterogeneas (Apache-2.0, MIT, CC BY 4.0) para una aplicacion de escritorio. No debe evaluarse como un modelo unico con capacidades propias, sino como un contenedor de artefactos ajenos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | multiple: transformers (Qwen 3.5, Whisper) y TDT (Parakeet); el repo agrega varios modelos |
| Parametros totales | 1.881.825.088 (dato safetensors, correspondiente a un artefacto del conjunto; el repo contiene varios modelos de distinto tamano) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q4_K_M (GGUF, Qwen 3.5); Core ML cuantizado (Parakeet); Core ML (Whisper small.en) |
| Idiomas soportados | no disponible (Whisper small.en esta limitado a ingles por su sufijo `.en`) |
| Licencia | multiple: Apache-2.0 (Qwen 3.5 y cuantizaciones Unsloth), MIT (Whisper small.en, conversion Core ML de Argmax), CC BY 4.0 (Parakeet TDT 0.6B v2) |
| Formato de pesos | GGUF y Core ML (directorios de paquete); tokenizer de Whisper en formato OpenAI |

## Arquitectura y entrenamiento

El repositorio no entrena ningun modelo. Contiene copias byte a byte de artefactos producidos por terceros: las cuantizaciones GGUF Q4_K_M de Qwen 3.5 (2B, 4B y 9B) generadas por Unsloth a partir de los pesos originales de Alibaba Cloud; la conversion Core ML de Parakeet TDT 0.6B v2 realizada por FluidInference; y la conversion Core ML de Whisper small.en realizada por Argmax, junto con los ficheros de tokenizer de OpenAI. Cada entrada de la model card fija la revision concreta (commit hash) de la fuente original.

El mecanismo tecnico destacable es el de integridad y disponibilidad: la aplicacion SayWrite resuelve primero la ubicacion original y, si falla, este espejo, validando siempre el SHA-256 contra `SHA256SUMS`. No hay informacion sobre datos de entrenamiento, numero de tokens, composicion del dataset ni procesos de RLHF/DPO, porque esos detalles pertenecen a las model cards de los modelos originales, no a este espejo.

## Capacidades

- Generacion de texto y asistencia de escritura mediante las variantes Qwen 3.5 (2B, 4B, 9B), en cuantizacion Q4_K_M apta para ejecucion local.
- Conversacion multi-turno (tag `conversational` en el repositorio).
- Reconocimiento automatico de voz (ASR) en ingles con Whisper small.en.
- Transcripcion ASR con Parakeet TDT 0.6B v2 (modelo TDT de NVIDIA).
- Compatibilidad con endpoints (tag `endpoints_compatible`).
- Uso de imatrix en la generacion de cuantizaciones (tag `imatrix`).
- Soporte de tool calling, agentes, vision o audio generativo: no disponible en la informacion proporcionada.

## Casos de uso

- Asistente de escritura integrado en aplicacion de escritorio macOS: SayWrite descarga Qwen 3.5 2B/4B/9B en GGUF Q4_K_M y los ejecuta en local para correccion, reescritura y generacion de texto sin enviar datos a la nube.
- Dictado por voz en local: Whisper small.en en Core ML permite transcribir audio en ingles dentro de la app aprovechando la Neural Engine de los equipos Apple.
- Transcripcion ASR alternativa con Parakeet TDT 0.6B v2: util como segundo motor de reconocimiento de voz cuando se requiere otra arquitectura o comparar calidad.
- Distribucion resiliente de artefactos: el patron de espejo con verificacion SHA-256 sirve de referencia para equipos que empaquetan modelos de terceros en productos de escritorio y necesitan tolerancia a fallos de la fuente original.
- Auditoria de licencias: el repositorio y su `LICENSES.md` ejemplifican como agregar artefactos con licencias distintas (Apache-2.0, MIT, CC BY 4.0) manteniendo la atribucion exigida por cada una.
- Reproducibilidad de builds: al fijar revisiones concretas por commit hash, permite reconstruir el conjunto exacto de modelos que una version de la app descarga.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM/RAM estimada: no disponible de forma agregada; depende del artefacto. Las variantes Qwen 3.5 en Q4_K_M (2B, 4B, 9B) estan pensadas para ejecucion local en equipos de consumo, pero no se proporcionan cifras exactas.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no disponible como dato explicito; los formatos Core ML apuntan a hardware Apple (Neural Engine/GPU integrada) y los GGUF a ejecucion local generica.
- Opciones de despliegue: llama.cpp u Ollama para los GGUF; Core ML Runtime para los paquetes Core ML; el tag `endpoints_compatible` sugiere integracion con endpoints compatibles, sin mas detalle.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| SayWrite/model-mirror (conjunto) | varios (1.881.825.088 en un artefacto) | no disponible | GGUF, Core ML | multiple (Apache-2.0, MIT, CC BY 4.0) | Hugging Face (espejo) |
| Qwen 3.5 2B/4B/9B (original, Unsloth GGUF) | 2B, 4B, 9B | no disponible | GGUF, safetensors | Apache-2.0 | Hugging Face |
| Whisper small.en (original, OpenAI) | no disponible | no disponible | varios; Core ML via Argmax | MIT (modelo), Apache-2.0 (tokenizer) | Hugging Face |
| Parakeet TDT 0.6B v2 (original, NVIDIA) | 0.6B | no disponible | Core ML via FluidInference | CC BY 4.0 | Hugging Face |

La comparativa relevante es con las fuentes originales: este repositorio no aporta mejoras de rendimiento, solo replicas verificadas. Para evaluacion de capacidades debe consultarse cada modelo original.

## Limitaciones y advertencias

- No es un modelo entrenado por SayWrite; no debe citarse como modelo propio ni atribuirse a SayWrite sus capacidades.
- El dato de parametros de safetensors corresponde a un unico artefacto del conjunto, no al total del repositorio; interpretarlo como tamano global seria incorrecto.
- Idiomas soportados no declarados; Whisper small.en esta restringido a ingles por su sufijo `.en`.
- Licencias heterogeneas: el uso comercial exige revisar `LICENSES.md` y respetar las condiciones de cada modelo original, incluida la atribucion CC BY 4.0 de Parakeet.
- La integridad depende de `SHA256SUMS`; cualquier modificacion del espejo debe revalidarse contra el original fijado por commit.
- Sin datos de benchmarks, contexto, sesgos ni riesgo de alucinacion propios; deben consultarse en las model cards de Qwen 3.5, Whisper y Parakeet.
- Repositorio con 0 descargas y 1 like en el momento de la consulta: baja adopcion, sin garantias de mantenimiento.

## Enlaces

- Repositorio espejo: https://huggingface.co/SayWrite/model-mirror
- Fichero de licencias: https://huggingface.co/SayWrite/model-mirror/blob/main/LICENSES.md
- Qwen 3.5 2B GGUF (Unsloth): https://huggingface.co/unsloth/Qwen3.5-2B-GGUF
- Qwen 3.5 4B GGUF (Unsloth): https://huggingface.co/unsloth/Qwen3.5-4B-GGUF
- Qwen 3.5 9B GGUF (Unsloth): https://huggingface.co/unsloth/Qwen3.5-9B-GGUF
- Parakeet TDT 0.6B v2 Core ML (FluidInference): https://huggingface.co/FluidInference/parakeet-tdt-0.6b-v2-coreml
- Parakeet TDT 0.6B v2 (NVIDIA, original): https://huggingface.co/nvidia/parakeet-tdt-0.6b-v2
- WhisperKit Core ML (Argmax): https://huggingface.co/argmaxinc/whisperkit-coreml
- Whisper small.en (OpenAI, original): https://huggingface.co/openai/whisper-small.en
- Licencia CC BY 4.0: https://creativecommons.org/licenses/by/4.0/
