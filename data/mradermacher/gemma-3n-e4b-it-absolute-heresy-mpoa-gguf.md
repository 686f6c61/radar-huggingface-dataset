# mradermacher/gemma-3n-E4B-it-absolute-heresy-MPOA-GGUF

## Resumen

Este repositorio contiene una colección de cuantizaciones en formato GGUF del modelo gemma-3n-E4B-it-absolute-heresy-MPOA, un ajuste fino comunitario de Gemma 3n E4B de Google. La cuantización la firma mradermacher, autor habitual de versiones GGUF de modelos abiertos, y parte del modelo publicado por el usuario MuXodious. El resultado es un modelo multimodal de 6.868.990.448 parámetros (dato real de safetensors) que conserva las capacidades de audio, imagen y vídeo de la familia Gemma 3n y añade un comportamiento abliterated o sin censura, tal como indican las etiquetas heretic, uncensored y decensored.

Gemma 3n es la familia de modelos on-device de Google, basada en arquitectura MatFormer con Per-Layer Embeddings (PLE) y orientada a ejecutarse en hardware modesto. La variante E4B se comercializa como un modelo de unos 4B parámetros efectivos. Este repositorio no aporta pesos nuevos: empaqueta el ajuste en distintos niveles de cuantización (desde Q2_K hasta f16, más suplementos mmproj multimodales) para facilitar su ejecución local con llama.cpp y derivados.

Su relevancia es doble: por un lado ofrece una vía práctica de desplegar un modelo multimodal de la familia Gemma en un portátil o en una GPU de consumo; por otro, al tratarse de una versión sin filtros, resulta de interés para investigación sobre alineación, seguridad y comportamiento de modelos abliterated. Hay que tener en cuenta que la licencia sigue siendo la Gemma de Google y que la ficha solo declara soporte para inglés.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MatFormer (transformer anidado) con Per-Layer Embeddings (PLE), propia de la familia Gemma 3n; multimodal (texto, audio, imagen, vídeo) |
| Parametros totales | 6.868.990.448 (~6,87 mil millones), según safetensors |
| Parametros activos | No aplica (modelo denso, no MoE); la familia Gemma 3n E4B declara ~4B parámetros efectivos, no confirmado en esta ficha |
| Longitud de contexto | No disponible en la información proporcionada; la familia Gemma 3n declara 32.000 tokens según la documentación pública de Google |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0 y f16; suplementos multimodales mmproj-Q8_0 y mmproj-f16 |
| Idiomas soportados | en (inglés), según la ficha. La familia Gemma 3n oficial declara más idiomas, no confirmado aquí |
| Licencia | Gemma (términos de uso de Google) |
| Formato de pesos | GGUF (cuantizaciones estáticas; convert_type: hf, quantize_version: 2, output_tensor_quantised: 1) |

## Arquitectura y entrenamiento

El modelo base es Gemma 3n E4B, una variante de la familia Gemma 3n de Google construida sobre arquitectura MatFormer, que anida sub-redes dentro de una red mayor y permite extraer sub-modelos con distinto coste computacional. Incorpora Per-Layer Embeddings (PLE) y está diseñada como modelo multimodal on-device, capaz de procesar texto, audio, imagen y vídeo. Este repositorio no modifica esa arquitectura: se limita a convertir y cuantizar los pesos del ajuste comunitario de MuXodious.

El fine-tune base, identificado como absolute-heresy-MPOA, se presenta con las etiquetas heretic, uncensored, decensored y abliterated, lo que indica la aplicación de técnicas de abliteration orientadas a reducir o eliminar los rechazos y el comportamiento de censura del modelo original. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni el uso de RLHF o DPO en ese ajuste. La cuantización de mradermacher es de tipo estático (no imatrix en este repositorio); existe una versión alternativa con cuantizaciones ponderadas e imatrix publicada por el mismo autor.

## Capacidades

- Generación de texto conversacional multi-turno (etiqueta conversational y endpoints_compatible).
- Reconocimiento automático de voz (automatic-speech-recognition), que es el pipeline declarado del repositorio.
- Traducción automática de voz (automatic-speech-translation).
- Comprensión de audio a texto (audio-text-to-text).
- Comprensión de vídeo a texto (video-text-to-text) y de imagen a texto mediante los ficheros mmproj.
- Comportamiento sin censura (abliterated), orientado a respuestas sin los rechazos habituales del modelo alineado original.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Capacidades de agente o razonamiento multi-paso: no disponibles en la información proporcionada.
- Capacidades multilingües: solo se declara inglés (en).

## Casos de uso

- Transcripción de audio local: usando el pipeline ASR declarado y sus ficheros mmproj, puede convertir voz a texto sin enviar audio a servicios en la nube, lo que resulta útil en entornos con requisitos de privacidad.
- Traducción de voz: gracias al soporte de automatic-speech-translation, permite transcribir y traducir conversaciones de forma local en un único modelo.
- Descripción y análisis de vídeo o imagen: con el suplemento multimodal mmproj se puede alimentar el modelo con fotogramas o imágenes y obtener descripciones o respuestas sobre el contenido.
- Asistentes conversacionales sin filtros para investigación: su condición abliterated lo hace adecuado para estudiar cómo se comporta un modelo cuando se eliminan las capas de rechazo, en entornos controlados.
- Investigación sobre alineación y seguridad: permite comparar la salida del modelo original y la versión abliterated para medir el impacto de la abliteration en el comportamiento.
- Despliegue en edge u on-device: al ser una cuantización GGUF de un modelo de la familia Gemma 3n, es viable ejecutarlo en portátiles o mini-PC con GPU integrada o de gama media.
- Prototipado rápido con herramientas locales: se puede cargar directamente en llama.cpp, Ollama o LM Studio para validar ideas sin infraestructura de servidor.
- Generación de contenido en inglés: al declarar únicamente soporte de inglés, encaja en pipelines de redacción, resumen o Q&A en ese idioma.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Ni la model card del repositorio ni los resultados de búsqueda incluyen cifras de MMLU, HumanEval, GSM8K u otras evaluaciones, ni para el modelo base ni para las cuantizaciones.

## Requisitos de hardware

- VRAM estimada para inferencia (solo pesos; hay que sumar caché KV y overhead, aproximadamente 1-2 GB adicionales según contexto):
  - Q2_K (2,9 GB): ~4 GB de VRAM.
  - Q3_K_S / Q3_K_M / Q3_K_L (3,4-3,7 GB): ~4,5-5 GB.
  - IQ4_XS (4,0 GB): ~5 GB.
  - Q4_K_S / Q4_K_M (4,2-4,3 GB): ~5,5-6 GB.
  - Q5_K_S / Q5_K_M (5,0-5,1 GB): ~6,5 GB.
  - Q6_K (5,8 GB): ~7,5 GB.
  - Q8_0 (7,5 GB): ~9-10 GB.
  - f16 (13,8 GB): ~15-16 GB.
  - Suplementos multimodales mmproj: suman 1,4 GB (Q8_0) o 2,1 GB (f16) de VRAM adicional.
- GPU recomendadas: RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070/4070 Ti, RTX 4080 y RTX 4090 24 GB para las cuantizaciones altas; A100 y H100 para f16 en servidor.
- ¿Cabe en GPU de consumo? Sí. Las cuantizaciones Q4_K_M y Q5_K_M caben en 8 GB o menos de VRAM; Q8_0 requiere 12 GB o más; f16 necesita 16-24 GB.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, koboldcpp y text-generation-webui admiten GGUF; para los suplementos mmproj hace falta un runtime con soporte multimodal (llama.cpp). vLLM y TGI ofrecen soporte GGUF limitado o experimental y no son la vía recomendada aquí.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| mradermacher/gemma-3n-E4B-it-absolute-heresy-MPOA-GGUF (este) | 6,87B totales | No disponible (familia 32K) | GGUF estático | Gemma | Cuantización estática del ajuste abliterated de MuXodious |
| MuXodious/gemma-3n-E4B-it-absolute-heresy-MPOA | No disponible | No disponible | safetensors (transformers) | Gemma | Modelo base del que deriva este repositorio, sin cuantizar |
| google/gemma-3n-E4B-it | ~4B efectivos (familia) | 32K (familia) | safetensors | Gemma | Modelo oficial alineado, con filtros de seguridad |
| mradermacher/gemma-3n-E4B-it-absolute-heresy-MPOA-i1-GGUF | 6,87B totales | No disponible | GGUF imatrix | Gemma | Misma base, cuantizaciones ponderadas de mayor calidad |

No se dispone de datos de rendimiento comparativo entre estas variantes; las cifras de parámetros y contexto de la familia proceden de la documentación pública y no están confirmadas en la información de esta ficha.

## Limitaciones y advertencias

- Sesgos conocidos: no disponibles en la información proporcionada; al derivar de Gemma 3n hereda los sesgos del modelo original, no documentados aquí.
- Riesgo de alucinación: presente como en cualquier modelo generativo; la cuantización agresiva (Q2_K, Q3_K) puede aumentar los errores y degradar la coherencia.
- Limitaciones de idioma: la ficha solo declara inglés (en), por lo que el rendimiento en castellano u otros idiomas no está garantizado.
- Modelo abliterated: la eliminación de filtros implica que puede generar contenido ofensivo, ilegal o peligroso; no es adecuado para producción orientada al público sin capas de moderación adicionales.
- Restricciones de licencia: se aplica la licencia Gemma de Google, que impone condiciones de uso, obligaciones de atribución y una política de uso prohibido; es imprescindible revisarla antes de cualquier uso comercial. El repositorio incluye un acceso con aceptación de licencia (extra_gated).
- Modelo derivado: al no ser un modelo oficial, no cuenta con el respaldo ni las garantías de Google, y las técnicas de abliteration pueden haber degradado capacidades generales.
- Contexto: no se especifica en esta ficha; conviene verificar el límite real antes de diseñar pipelines que dependan de ventanas largas.
- Soporte de herramientas: sin confirmación de tool calling ni de razonamiento agéntico, no se debe asumir su disponibilidad en producción.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/mradermacher/gemma-3n-E4B-it-absolute-heresy-MPOA-GGUF
- Cuantizaciones imatrix: https://huggingface.co/mradermacher/gemma-3n-E4B-it-absolute-heresy-MPOA-i1-GGUF
- Modelo base: https://huggingface.co/MuXodious/gemma-3n-E4B-it-absolute-heresy-MPOA
- Página resumen del autor para este modelo: https://hf.tst.eu/model#gemma-3n-E4B-it-absolute-heresy-MPOA-GGUF
- Fichero mmproj Q8_0: https://huggingface.co/mradermacher/gemma-3n-E4B-it-absolute-heresy-MPOA-GGUF/resolve/main/gemma-3n-E4B-it-absolute-heresy-MPOA.mmproj-Q8_0.gguf
- Fichero mmproj f16: https://huggingface.co/mradermacher/gemma-3n-E4B-it-absolute-heresy-MPOA-GGUF/resolve/main/gemma-3n-E4B-it-absolute-heresy-MPOA.mmproj-f16.gguf
- Página de peticiones de cuantización del autor: https://huggingface.co/mradermacher/model_requests
- Guía de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Ficha en Local AI Zone: https://local-ai-zone.github.io/models/gemma-3n-e4b-it-absolute-heresy-mpoa-i1.html
- Ficha en free2aitools: https://free2aitools.com/model/mradermacher/gemma-3n-e4b-it-absolute-heresy-gguf
- Ficha en Toolify: https://www.toolify.ai/ai-model/mradermacher-gemma-3n-e4b-it-absolute-heresy-i1-gguf
