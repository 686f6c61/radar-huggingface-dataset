# cyberalien/CySearchAssist-CLAP-1.5B

## Resumen

CySearchAssist-CLAP-1.5B es un modelo de lenguaje multilingüe de 1.543.714.304 parámetros (aproximadamente 1,54 mil millones) afinado por MrMybal (CyberAlien) a partir de Qwen/Qwen2.5-1.5B-Instruct. Su única función es reescribir peticiones informales de búsqueda de sonido, formuladas en lenguaje natural, en descripciones estructuradas en inglés pensadas para alimentar un sistema de búsqueda semántica de audio basado en CLAP. No es un modelo CLAP, no genera audio y no analiza audio: únicamente prepara texto.

El problema que resuelve es concreto y bien delimitado. Los sistemas de recuperación de audio por embeddings (CLAP, LAION-CLAP y similares) funcionan mal con consultas coloquiales, truncadas o con negaciones («je cherche un impact metallique dans un hangar, sans musique»). El modelo convierte esa petición en un objeto JSON con un `clap_prompt` principal, tres variaciones alternativas, categorías y etiquetas sugeridas para el ranking, y una lista de conceptos excluidos explícitamente. Es relevante ahora porque permite integrar búsqueda semántica de sonido completamente en local, sin enviar audio ni índices a servicios externos, con un coste de hardware mínimo.

La distribución publicada es un GGUF Q8_0 (1.646.572.544 bytes, 1,53 GiB) convertido con llama.cpp b11115. El modelo forma parte del ecosistema del plugin propietario CyMetaSound, donde se ofrece como opción de refinado de consultas («AI Refine») mediante un `llama-server` con backend Vulkan. El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y no se ha publicado ningún resultado de benchmarks.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (heredada de Qwen2.5-1.5B-Instruct); detalles internos no especificados en la información disponible |
| Parámetros totales | 1.543.714.304 (≈1,54 mil millones) |
| Parámetros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No especificada en la información disponible para este fine-tune; el contrato de uso limita la generación a 256 tokens nuevos |
| Tipos de cuantización | GGUF Q8_0 (única distribución publicada, convertida con llama.cpp b11115); los pesos en precisión completa no forman parte de la release |
| Idiomas soportados | Inglés, francés, español, alemán, italiano (entrada); la salida `clap_prompt` y `variations` es en inglés |
| Licencia | Apache 2.0 (conserva la licencia subyacente de Qwen) |
| Formato de pesos | GGUF (Q8_0); safetensors no publicados en esta release |

## Arquitectura y entrenamiento

La información disponible confirma que el modelo es un fine-tune del checkpoint Qwen2.5-1.5B-Instruct, citado como `unsloth/Qwen2.5-1.5B-Instruct` en el informe de entrenamiento. El proceso consistió en un fine-tune con adaptadores LoRA seguido de un merge, realizado por MrMybal / CyberAlien en 2026. Este release es el modelo fusionado convertido a GGUF Q8_0. No se publican ni el checkpoint original en precisión completa, ni el adaptador LoRA, ni los datos de entrenamiento. Tampoco se especifican el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron etapas de RLHF o DPO adicionales.

La innovación no está en la arquitectura, sino en la interfaz. El modelo opera bajo un contrato de uso estricto: se debe emplear el system prompt exacto contenido en `prompt/system.txt`, enviar la petición original como mensaje de usuario, usar decodificación greedy (temperatura 0), limitar la generación a 256 tokens nuevos y aplicar una plantilla de chat Qwen (incluida en los metadatos del GGUF). La salida es un JSON con cinco campos: `clap_prompt`, `variations` (tres alternativas), `suggested_categories`, `suggested_tags` (pistas de ranking, no filtros duros) y `exclude` (conceptos negados en la petición). El autor advierte explícitamente que las categorías sugeridas deben ignorarse si no existen en la taxonomía propia, y que los términos excluidos nunca deben añadirse a una consulta positiva.

## Capacidades

- Reescritura de consultas de búsqueda de sonido: transforma peticiones coloquiales en descripciones acústicas en inglés aptas para embeddings CLAP.
- Salida estructurada en JSON con campos fijos (`clap_prompt`, `variations`, `suggested_categories`, `suggested_tags`, `exclude`).
- Detección de negaciones: extrae conceptos explícitamente excluidos de la petición del usuario.
- Multilingüe de entrada en cinco idiomas: inglés, francés, español, alemán e italiano.
- Generación de variaciones: produce tres descripciones alternativas para ampliar la recuperación.
- Pistas de ranking: sugiere categorías y etiquetas que el sistema de búsqueda puede usar como señal de ordenación.
- Integración en el plugin CyMetaSound mediante la función AI Refine de la biblioteca, con instalación verificada por SHA-256 y detección en la caché de modelos.
- Inferencia local: ningún audio, índice de biblioteca ni consulta se envía al modelo más allá del texto de la petición.
- No soporta: análisis o generación de audio, tool calling, function calling, agentes, razonamiento multi-paso, visión, matemáticas avanzadas ni uso como asistente general.

## Casos de uso

- Búsqueda semántica en bibliotecas de efectos de sonido: un diseñador de sonido escribe «impacto metálico en un hangar sin música» en español y el modelo devuelve un `clap_prompt` en inglés que el motor CLAP usa para recuperar muestras relevantes; la ventana de contexto del modelo base permite incluir metadatos de la petición si se amplía el prompt.
- Integración en DAW o plugin de gestión de samples: el modelo se ejecuta embebido vía `llama-server` con backend Vulkan y expone el refinado de consultas como una acción de la interfaz, sin dependencia de CUDA ni de servicios en la nube.
- Postproducción audiovisual multilingüe: equipos con operadores francófonos, germanófonos e hispanohablantes trabajan sobre la misma biblioteca porque el modelo normaliza todas las entradas a captions en inglés, evitando mantener índices por idioma.
- Refinado de consultas en pipelines de recuperación de audio (MIR): el JSON de salida se consume programáticamente para lanzar cuatro búsquedas (principal más tres variaciones) y fusionar resultados, con la lista `exclude` aplicada como filtro negativo.
- Etiquetado y catalogación asistida: a partir de descripciones textuales de material sonoro, el modelo genera categorías y etiquetas sugeridas que un proceso posterior revisa antes de escribir en la base de datos de la biblioteca.
- Asistente conversacional de búsqueda sonora: un chatbot interno recibe peticiones sucesivas, reescribe cada una con este modelo y mantiene la coherencia del vocabulario acústico en inglés entre turnos.
- Despliegue en máquinas sin GPU dedicada: al ocupar 1,53 GiB en Q8_0 y caber en CPU, permite que estaciones de trabajo modestas ofrezcan búsqueda semántica de audio local con latencia aceptable.
- Filtrado de términos negativos en herramientas de curación: el campo `exclude` sirve para descartar automáticamente resultados que contengan conceptos vetados por el usuario, siempre que la petición contenga una negación real.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

El autor indica explícitamente que la conversión a Q8 fue sometida únicamente a pruebas de humo (smoke test), no a una evaluación de calidad de recuperación a gran escala, y que las estadísticas de calidad del checkpoint de origen no deben presentarse como resultados medidos de esta release cuantizada. Tampoco se ofrece ninguna afirmación universal de rendimiento o de GPU.

## Requisitos de hardware

- Peso de los pesos: 1,53 GiB (1.646.572.544 bytes) en el único fichero GGUF Q8_0 publicado.
- VRAM estimada para inferencia: aproximadamente 2 GB para los pesos; el total depende de la longitud de contexto y del tamaño de lote. Cabe con holgura en cualquier GPU con 4 GB o más de memoria.
- GPU recomendadas: no se especifica ninguna; el autor no emite ninguna afirmación de rendimiento por GPU. Para offload parcial, cualquier GPU compatible con Vulkan sirve, ya que el autor destaca una build Vulkan que no requiere CUDA.
- GPU de consumo: sí, cabe en tarjetas de gama de entrada y en iGPU modernas con soporte Vulkan. También es viable la inferencia íntegra en CPU.
- Almacenamiento: menos de 2 GB, incluido el fichero GGUF.
- Opciones de despliegue: llama.cpp y `llama-server` son el entorno de referencia (el ejecutable es externo a esta release). El backend Vulkan es el recomendado por el autor para offload en GPU sin CUDA. La integración en CyMetaSound usa `llama-server` configurado como Local LLM, con detección automática o selección manual de Vulkan. Otros runtimes compatibles con GGUF no están validados en la documentación publicada.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Especialización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| CySearchAssist-CLAP-1.5B | 1.543.714.304 | No especificado en esta release | Reescritura de consultas para búsqueda de audio CLAP | Apache 2.0 | GGUF Q8_0 en Hugging Face |
| Qwen2.5-1.5B-Instruct (modelo base) | ≈1,5 mil millones | No indicado en la información disponible | Asistente conversacional general | Apache 2.0 | Pesos completos y cuantizaciones en Hugging Face |
| Qwen2.5-0.5B-Instruct | No indicado en la información disponible | No indicado en la información disponible | Asistente conversacional general de menor tamaño | Apache 2.0 | Pesos completos y cuantizaciones en Hugging Face |
| Alternativa específica para reescritura de consultas CLAP | No disponible | No disponible | No disponible | No disponible | No disponible |

Nota: no se ha identificado en la información proporcionada ningún otro modelo dedicado específicamente a la reescritura de consultas para búsqueda de audio CLAP. Los datos de los modelos de la familia Qwen2.5 citados como referencia no forman parte de la documentación consultada para este modelo y deben verificarse en sus propias model cards.

## Limitaciones y advertencias

- No es un asistente general: el autor lo describe explícitamente como no apto para uso conversacional, generación de audio, embeddings de audio ni como fuente factual.
- No analiza audio: no procesa, indexa ni compara señales acústicas; solo prepara texto para el motor CLAP, que es un componente independiente con su propia licencia (CLAP/LAION u otros).
- Riesgo de alucinación y omisión de restricciones: puede omitir condiciones de la petición o inventar detalles descriptivos, de forma especialmente acusada ante erratas graves o ante nombres de armas y de modelos concretos. El autor recomienda mantener la consulta reescrita visible y editable por el usuario.
- Negaciones mal gestionadas: solo deben conservarse los términos excluidos cuando la petición contenga realmente una negación; añadirlos a un caption positivo degrada la búsqueda. El autor indica además que un fallo o una respuesta malformada debe provocar la caída al texto original de la petición.
- Desconocimiento de la biblioteca del usuario: el modelo no conoce la taxonomía ni el catálogo local, por lo que las categorías sugeridas que no existan en el sistema deben descartarse.
- Calidad no medida: la cuantización Q8_0 solo ha pasado pruebas de humo; no hay evaluación de calidad de recuperación ni comparación con el checkpoint de origen.
- Idiomas: las entradas están previstas para francés, inglés, español, alemán e italiano; el resto de idiomas no están soportados declarativamente. La salida se genera siempre en inglés, lo que puede ser un inconveniente si se necesita trazabilidad en el idioma original.
- Restricciones de licencia: el modelo y el material del repositorio están bajo Apache 2.0, que permite redistribución, modificación y uso comercial, pero no concede ningún derecho sobre bibliotecas de audio de terceros, modelos de terceros, marcas registradas ni sobre el plugin propietario CyMetaSound.
- Artifacts no incluidos: no se publican los pesos en precisión completa, el adaptador LoRA ni los datos de entrenamiento, lo que impide reproducir o auditar el fine-tune.
- Contrato de uso estricto: emplear otro system prompt, otra plantilla de chat, temperatura distinta de 0 o más de 256 tokens nuevos invalida las condiciones bajo las que se validó el modelo.
- Runtime externo: el ejecutable de inferencia no forma parte de la release; el soporte real de dispositivos depende del runtime y del controlador Vulkan instalados.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/cyberalien/CySearchAssist-CLAP-1.5B
- Descarga directa del GGUF Q8_0: https://huggingface.co/cyberalien/CySearchAssist-CLAP-1.5B/resolve/main/CySearchAssist-v1-Q8_0.gguf
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-1.5B-Instruct
- Distribución de entrenamiento citada: https://huggingface.co/unsloth/Qwen2.5-1.5B-Instruct
- Ficheros citados en la model card: `prompt/system.txt`, `manifest.json`, `LICENSE`, `NOTICE` (sin URL directa en la información disponible)
- Repositorio GitHub del proyecto: mencionado en la model card, sin URL proporcionada
- Página del plugin CyMetaSound: mencionada en la model card, sin URL proporcionada
- Paper o informe técnico: no disponible
