# avyukth/bodhan-indic-translate-w8a16

## Resumen

Bodhan Indic Translate W8A16 es una versión cuantizada del modelo `bodhan-ai/indic-translate`, un modelo de traducción automática especializado en lenguas de la India construido sobre `google/gemma-4-E4B-it`. El autor de esta variante es el usuario de Hugging Face `avyukth`, que ha aplicado cuantización de pesos a 8 bits con activaciones a 16 bits (W8A16) mediante la librería `compressed-tensors`, con kernels Marlin optimizados para vLLM. El resultado es un checkpoint de aproximadamente 7.940 millones de parámetros y 11,6 GB de tamaño de repositorio, pensado para servir traducción multilingüe con menor huella de memoria que el modelo original en precisión completa.

El modelo aborda un problema concreto: la traducción bidireccional y la transliteración entre inglés y 22 lenguas índicas (asamés, bengalí, bodo, dogri, konkani, guyaratí, hindi, canarés, cachemir, maithili, malayalam, manipurí, maratí, nepalí, oriya, panyabí, sánscrito, santali, sindhi, tamil, telugu y urdu), incluyendo la romanización de escrituras nativas. Al heredar la arquitectura multimodal de Gemma 4 E4B, el pipeline declarado es `image-text-to-text`, aunque la tarea principal declarada es `translation`.

Su relevancia actual reside en dos factores: por un lado, la cobertura amplia de lenguas de bajos recursos dentro de un único checkpoint; por otro, el formato W8A16 con Marlin, que facilita el despliegue en vLLM con un consumo de VRAM notablemente inferior al de un modelo de 8.000 millones de parámetros en BF16. El acceso está restringido (gated) y la licencia se etiqueta como "other", lo que obliga a revisar los términos del modelo base antes de cualquier uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal derivado de Gemma 4 E4B (image-text-to-text); detalles internos de capas y atención no disponibles |
| Parametros totales | 7.941.100.874 |
| Parametros activos | no disponible (no se especifica si es MoE) |
| Longitud de contexto | no disponible (la etiqueta incluye `long-context`, sin cifra concreta) |
| Tipos de cuantizacion | W8A16 (pesos INT8, activaciones FP16) con `compressed-tensors` y kernels Marlin |
| Idiomas soportados | en, as, bn, brx, doi, gom, gu, hi, kn, ks, mai, ml, mni, mr, ne, or, pa, sa, sat, sd, ta, te, ur |
| Licencia | other (acceso restringido, requiere aceptar condiciones) |
| Formato de pesos | safetensors (compatible con transformers y vLLM) |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna del modelo base `bodhan-ai/indic-translate`, más allá de que deriva de `google/gemma-4-E4B-it`, un modelo multimodal de la familia Gemma 4 con capacidad de procesar imagen y texto. El checkpoint cuantizado conserva la estructura del modelo original y sustituye los pesos en precisión completa por tensores INT8 empaquetados mediante `compressed-tensors`, manteniendo las activaciones en FP16 durante la inferencia. Los kernels Marlin incluidos permiten ejecutar esta combinación W8A16 de forma eficiente en vLLM.

No se han publicado en la información disponible datos sobre el número de tokens de entrenamiento, la composición del corpus, el uso de RLHF o DPO, ni innovaciones específicas como decodificación especulativa o atención lineal. La etiqueta `long-context` sugiere soporte de ventanas extensas, pero se desconoce la cifra exacta. Tampoco se documenta el proceso de cuantización más allá de la combinación W8A16 y la herramienta empleada.

## Capacidades

- Traducción automática entre inglés y 22 lenguas índicas, en ambos sentidos según la etiqueta `machine-translation`.
- Transliteración y romanización de escrituras índicas (etiquetas `transliteration` y `romanization`).
- Procesamiento multimodal de imagen y texto, heredado de Gemma 4 E4B (`image-text-to-text`).
- Soporte declarado de contexto largo (etiqueta `long-context`), sin cifra publicada.
- Capacidad multilingüe amplia dentro del subconjunto de lenguas índicas listado.
- No se documenta soporte explícito de tool calling, function calling ni razonamiento multi-paso en agente.

## Casos de uso

- Traducción de documentación técnica al hindi, bengalí o tamil: el modelo permite convertir manuales y guías desde inglés manteniendo terminología consistente en un único checkpoint que cubre varias lenguas, lo que simplifica el pipeline frente a desplegar un modelo por idioma.
- Localización de interfaces y contenido web: con 22 lenguas índicas soportadas, se puede integrar en un CMS o plataforma de e-commerce para generar versiones localizadas de fichas de producto y textos de ayuda sin cambiar de modelo.
- Transliteración de nombres propios y direcciones: la capacidad de romanización resulta útil en formularios, sistemas de logística y bases de datos que necesitan normalizar entradas escritas en escrituras nativas a caracteres latinos.
- Atención al cliente en lenguas regionales: el modelo puede traducir consultas de usuarios en asamés, oriya o manipurí al inglés para que un agente o un sistema posterior las procese, y devolver la respuesta traducida a la lengua original.
- Subtitulado y transcripción multilingüe: combinado con un sistema de ASR, permite traducir transcripciones a inglés o entre lenguas índicas para generar subtítulos en vídeo y material educativo.
- Investigación en lingüística computacional: sirve como base para experimentos de traducción de bajos recursos, evaluación de calidad por lengua y estudios de transliteración, gracias a la cobertura de lenguas poco representadas como bodo, dogri, maithili o santali.
- Procesamiento de documentos escaneados: al heredar la entrada de imagen de Gemma 4, puede abordar la traducción de texto presente en imágenes, como carteles, formularios o páginas escaneadas, dentro del mismo pipeline.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: al tratarse de W8A16 con aproximadamente 7.940 millones de parámetros, los pesos ocupan en torno a 8 GB; sumando activaciones, caché KV y overhead del runtime, se recomienda un mínimo de 12-16 GB de VRAM para contextos moderados.
- GPU recomendadas: A100 (40/80 GB), H100, L40S o RTX A6000 para producción con contexto largo y concurrencia; RTX 4090 (24 GB) para despliegues de una sola instancia.
- GPU de consumo: cabe en RTX 4090, RTX 4080 y, con contextos cortos y poca concurrencia, en tarjetas de 16 GB como RTX 4060 Ti o RTX 4070 Ti Super. Por debajo de 12 GB no es viable con esta cuantización.
- Opciones de despliegue: vLLM es la vía principal gracias a los kernels Marlin incluidos; transformers permite cargar el checkpoint con `compressed-tensors`. No se confirma soporte de llama.cpp, Ollama ni TGI en la información disponible.
- Latencia y throughput: no disponibles. La cuantización W8A16 con Marlin debería ofrecer un throughput superior al BF16 en vLLM, pero no se han publicado cifras concretas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| avyukth/bodhan-indic-translate-w8a16 | 7.941 M | no disponible | other (gated) | Hugging Face, acceso restringido | Cuantización W8A16 con Marlin para vLLM |
| bodhan-ai/indic-translate | no disponible | no disponible | no disponible | Hugging Face | Modelo base sin cuantizar; misma cobertura de lenguas |
| google/gemma-4-E4B-it | no disponible | no disponible | Gemma (términos propios) | Hugging Face | Modelo base multimodal; no especializado en lenguas índicas |
| Google Translate (servicio) | no aplica | no aplica | propietaria | API/servicio web | Cubre muchas más lenguas, pero es un servicio cerrado sin pesos |

La comparación con alternativas abiertas especializadas en lenguas índicas no está disponible en la información proporcionada.

## Limitaciones y advertencias

- La licencia se etiqueta como "other" y el acceso es restringido: es obligatorio aceptar las condiciones en Hugging Face y verificar los términos de Gemma 4 y de `bodhan-ai/indic-translate` antes de cualquier uso comercial.
- La cuantización W8A16 puede introducir una degradación de calidad respecto al modelo en precisión completa; no se han publicado evaluaciones que cuantifiquen esa pérdida.
- Riesgo de alucinación inherente a los modelos generativos, especialmente en traducción de textos largos o con terminología muy específica; se recomienda validación humana en dominios críticos.
- Cobertura limitada a las 22 lenguas índicas listadas más el inglés; no se garantiza un comportamiento correcto fuera de ese conjunto.
- La longitud de contexto real no está documentada, pese a la etiqueta `long-context`.
- El modelo tiene 2 descargas y 0 likes en el momento de la ficha, por lo que la validación comunitaria es prácticamente inexistente.
- No se documentan sesgos específicos ni datos de evaluación de robustez; al derivar de un modelo multimodal, puede heredar sesgos culturales y de representación del corpus original.
- El tamaño del repositorio (11,6 GB) es superior al de los pesos INT8 puros, lo que sugiere la presencia de tensores adicionales o no cuantizados; conviene verificar el contenido antes de planificar el almacenamiento.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/avyukth/bodhan-indic-translate-w8a16
- Modelo base: https://huggingface.co/bodhan-ai/indic-translate
- Modelo base de Google: https://huggingface.co/google/gemma-4-E4B-it
- Librería compressed-tensors: https://github.com/neuralmagic/compressed-tensors
- vLLM: https://github.com/vllm-project/vllm
- Google Translate (referencia de servicio comparable): https://translate.google.fr/details
