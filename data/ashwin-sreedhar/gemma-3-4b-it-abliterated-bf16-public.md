# ashwin-sreedhar/Gemma-3-4b-it-abliterated-bf16-public

## Resumen

Gemma-3-4b-it-abliterated-bf16-public es una variante "abliterated" (con abliteración, es decir, edición de pesos para reducir los comportamientos de rechazo del modelo) del modelo google/gemma-3-4b-it de Google, publicada por el usuario ashwin-sreedhar en Hugging Face. Se trata de un checkpoint experimental derivado mediante edición directa de pesos, no un ajuste fino adicional, con el objetivo de disminuir las negativas del modelo a responder ciertas peticiones manteniendo en lo posible sus capacidades originales.

El modelo base, Gemma 3 4B instruct, es un modelo multimodal (imagen-texto a texto) de la familia Gemma 3 de Google, con unos 4.300 millones de parámetros distribuidos en formato bf16. La versión abliterated conserva la arquitectura original y añade una intervención registrada en los metadatos de exportación, con verificaciones de integridad de serialización (comprobaciones SHA-256, validación de tensores y pruebas de recarga en proceso limpio).

Su relevancia actual radica en la creciente demanda de modelos locales con menos restricciones para investigación y experimentación. No obstante, el propio autor advierte de forma explícita que la eliminación efectiva de rechazos y la preservación de capacidades no están establecidas: el checkpoint puede seguir negándose a responder, y el comportamiento con imágenes, contexto largo y generación asistida no ha sido probado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Gemma 3 (transformer multimodal, image-text-to-text); detalle exacto no disponible en la ficha |
| Parametros totales | 4.300.079.472 |
| Parametros activos | no disponible (no se indica si es MoE; no lo es, arquitectura densa) |
| Longitud de contexto | no disponible en la ficha (el modelo base Gemma 3 4B soporta 128K tokens, dato no confirmado en la model card) |
| Tipos de cuantizacion | bf16 (pesos sin cuantizar); no disponible en la ficha |
| Idiomas soportados | no disponible |
| Licencia | Gemma Terms of Use (con Prohibited Use Policy incorporado) |
| Formato de pesos | safetensors (8,6 GB de repositorio) |

## Arquitectura y entrenamiento

El modelo parte de google/gemma-3-4b-it, la versión instruida de Gemma 3 4B, un transformer multimodal capaz de procesar entradas de imagen y texto. La modificación no consiste en un entrenamiento adicional, sino en una edición directa de pesos ("weight-editing") mediante una intervención cuya política, dirección, selección y hashes de datos y código se registran en el directorio `.pipeline/` del repositorio. Los archivos safetensors incluyen un aviso de modificación en su cabecera, aunque los bytes, formas y dtypes de los tensores coinciden con el checkpoint editado verificado.

No hay datos de entrenamiento propios de esta derivada (tokens, composición del dataset, RLHF/DPO), ya que no se ha reentrenado. Como control de calidad, el autor publica un diagnóstico de KL de primer token en 100 prompts inofensivos de prueba (0,207783) y una ratio máxima de proyección editada/base del 0,358 %, que supera el umbral mecánico del 1 % establecido por el autor. Estas métricas son referencias diagnósticas, no una validación completa de comportamiento ni de capacidades.

## Capacidades

Al heredar de Gemma 3 4B-it, las capacidades esperadas (no verificadas en esta derivada) incluyen:

- Generacion de texto conversacional en formato multi-turno.
- Comprension de imagenes (pipeline image-text-to-text del modelo base), aunque el comportamiento multimodal no ha sido probado en esta version.
- Generacion de codigo y razonamiento general heredados de Gemma 3 4B-it.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y multi-step reasoning: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponible en la ficha.
- Reduccion (parcial y no garantizada) de los rechazos del modelo original mediante abliteracion; el checkpoint puede seguir negandose a responder.

## Casos de uso

- Investigacion en interpretabilidad y alineacion: el checkpoint incluye metadatos de la intervencion (politica, direccion, hashes) en `.pipeline/`, lo que lo hace util para estudiar tecnicas de edicion de pesos y abliteracion de forma reproducible.
- Experimentacion con comportamiento de rechazos: permite analizar como una intervencion de pesos minima (proyeccion maxima del 0,358 %) altera las tasas de negativa del modelo sin reentrenamiento.
- Chatbot local ligero: con 4.300 millones de parametros en bf16 (8,6 GB), puede desplegarse en estaciones de trabajo con GPU de consumo para asistentes conversacionales personales.
- Prototipado de aplicaciones multimodales: al conservar la arquitectura image-text-to-text del modelo base, sirve como punto de partida para probar descripcion de imagenes y VQA, aunque el autor advierte que el comportamiento con imagenes esta sin probar.
- Comparacion de checkpoints: util como referencia para evaluar cuanto degradan las tecnicas de abliteracion las metricas de KL respecto al modelo original en prompts inofensivos.
- Despliegue en endpoints gestionados: el repositorio esta etiquetado como compatible con text-generation-inference y endpoints de Hugging Face, facilitando pruebas rapidas en la nube.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El unico dato cuantitativo publicado es el diagnostico de KL de primer token en prompts inofensivos (0,207783 sobre 100 prompts) y la ratio maxima de proyeccion editada/base (0,358 %), que son metricas de integridad de la intervencion, no benchmarks de capacidad.

## Requisitos de hardware

- VRAM estimada para inferencia: con 4.300 millones de parametros en bf16 (8,6 GB de pesos), se estima una necesidad de entre 10 y 12 GB de VRAM para inferencia con contexto moderado; no hay cifras oficiales.
- GPU recomendadas: RTX 4090, RTX 3090 o RTX 4080 para uso local comodo; en la nube, cualquier GPU con 16 GB o mas de VRAM (T4 no seria suficiente en bf16 completo; L4, A10G, A100 o H100 si lo serian).
- Cabe en GPU de consumo: si, en tarjetas con 12 GB o mas de VRAM (RTX 3060 de 12 GB, RTX 4070 Ti SUPER, RTX 4090). En GPUs de 8 GB seria necesario cuantizar, pero no se publican versiones cuantizadas en este repositorio.
- Opciones de despliegue: transformers (libreria nativa del repositorio), text-generation-inference y endpoints de Hugging Face (etiquetados como compatibles). La compatibilidad con vLLM, llama.cpp u Ollama no se menciona en la ficha; al estar en safetensors bf16, la ruta directa es transformers o TGI.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Particularidad |
|---|---|---|---|---|
| Gemma-3-4b-it-abliterated-bf16-public | 4.300 M | no disponible (base: hasta 128K) | Gemma Terms of Use | Abliteracion experimental con metadatos de intervencion publicados |
| google/gemma-3-4b-it (modelo base) | 4.300 M | 128K | Gemma Terms of Use | Modelo oficial de Google, multimodal, con rechazos estandar |
| Otras variantes abliterated de Gemma (p. ej. community abliterations de 4B) | ~4.000 M | variable | Gemma Terms of Use | Tecnicas de abliteracion similares, sin diagnosticos de integridad publicados en general |

La principal diferencia frente al modelo base es la intervencion de pesos orientada a reducir rechazos, documentada con metricas de KL y verificaciones de serializacion, algo poco habitual en este tipo de derivadas comunitarias.

## Limitaciones y advertencias

- El propio autor advierte que la eliminacion de rechazos no esta establecida: el checkpoint puede seguir negandose a responder peticiones.
- La preservacion de capacidades no esta validada; solo se han superado diagnosticos mecanicos (KL y ratio de proyeccion), no pruebas de comportamiento completas.
- El comportamiento con imagenes, con contexto largo y la generacion asistida por MTP no han sido probados.
- Al tratarse de un modelo abliterated, reduce (parcialmente) las salvaguardas de seguridad del modelo original, lo que aumenta el riesgo de generar contenido problematico; su uso esta gobernado por la Gemma Prohibited Use Policy, que prohibe usos daninos.
- Licencia Gemma: permite uso comercial con condiciones, pero impone restricciones de uso y redistribucion (secciones 3.2 y Prohibited Use Policy); conviene revisar LICENSE, NOTICE y USE_POLICY.md incluidos en el repositorio.
- Riesgo de alucinacion: inherente a cualquier LLM de 4B; no hay datos especificos publicados para esta derivada.
- Sesgos conocidos: no disponible; hereda los del modelo base Gemma 3 4B-it.
- Idiomas soportados no documentados en la ficha.
- Es un checkpoint experimental con solo 480 descargas y sin validacion comunitaria amplia; no se recomienda para produccion sin evaluacion propia exhaustiva.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ashwin-sreedhar/Gemma-3-4b-it-abliterated-bf16-public
- Modelo base: https://huggingface.co/google/gemma-3-4b-it
- Otros enlaces (paper, blog, demo): no disponible en la informacion proporcionada.
