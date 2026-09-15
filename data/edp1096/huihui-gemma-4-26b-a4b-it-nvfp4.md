# edp1096/Huihui-Gemma-4-26B-A4B-it-NVFP4

## Resumen

Huihui-Gemma-4-26B-A4B-it-NVFP4 es una cuantización en formato NVFP4 del modelo Huihui-gemma-4-26B-A4B-it-abliterated, que a su vez es una versión "abliterated" (con los mecanismos de rechazo eliminados mediante edición de pesos) del Gemma 4 26B-A4B-it de Google. El autor de esta ficha de pesos es el usuario de HuggingFace edp1096, que parte del checkpoint NVFP4 ya publicado por bg-digitalservices y sustituye únicamente los tensores modificados por la abliteración, cuantizándolos desde el donante en BF16 y preservando sin cambios los tensores originales y las escalas de activación.

El interés del modelo es doble. Por un lado, empaqueta un modelo multimodal de tipo image-text-to-text en un formato de 4 bits con escalas de bloque pensado para los tensor cores FP4 de las GPU Blackwell, lo que reduce de forma notable el espacio en VRAM y el ancho de banda necesario en inferencia. Por otro, ofrece una variante sin filtros de rechazo, algo relevante para investigación sobre alineación, análisis de sesgos y evaluación de mecanismos de seguridad, pero problemático para despliegues comerciales sin supervisión.

La nomenclatura "26B-A4B" indica una arquitectura de mezcla de expertos con aproximadamente 26.000 millones de parámetros totales y unos 4.000 millones activos por token, aunque el repositorio no documenta la configuración de expertos ni la longitud de contexto. El repositorio tiene 16,5 GB y no registra descargas ni "likes" en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con mezcla de expertos (MoE), inferida de la nomenclatura "26B-A4B"; configuración concreta no disponible |
| Parametros totales | ~26B según nomenclatura; 13.564.221.006 elementos contabilizados por safetensors (véase nota) |
| Parametros activos | ~4B según nomenclatura (no confirmado en el repositorio) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | NVFP4 (elementos de 4 bits con escalas de bloque FP8) mediante NVIDIA ModelOpt; el repositorio se etiqueta también como "8-bit" |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 (declarada en el repositorio) |
| Formato de pesos | safetensors, compatible con la librería transformers |
| Pipeline | image-text-to-text (multimodal imagen-texto) |
| Tamano del repositorio | 16,5 GB |
| Modalidad | Texto e imagen de entrada, texto de salida |

Nota sobre el recuento de parámetros: safetensors informa de 13.564.221.006 elementos, un valor aproximadamente la mitad de los ~26B que sugiere el nombre. Esto es coherente con un empaquetado de dos valores de 4 bits por byte, que hace que el contador de elementos no refleje el número real de parámetros. No hay confirmación oficial de esta explicación en la información disponible.

## Arquitectura y entrenamiento

La información publicada no detalla la arquitectura interna del modelo base más allá de su etiqueta de pipeline multimodal (image-text-to-text) y de la convención de nombres "26B-A4B", que en la familia Gemma designa un transformer con mezcla de expertos. No se especifican el número de expertos, el número de expertos activados por token, la proporción entre atención local y global, la longitud de contexto ni la composición del dataset de entrenamiento. Tampoco se documentan las fases de ajuste (SFT, RLHF o DPO) aplicadas por Google ni el proceso concreto mediante el cual huihui-ai llevó a cabo la abliteración.

Lo que sí describe la model card de este repositorio es el procedimiento de cuantización. Se parte del checkpoint NVFP4 de bg-digitalservices como base cuantizada, se identifican los tensores modificados por la abliteración y se vuelven a cuantizar desde el donante en BF16, mientras que los tensores que no cambiaron y las escalas de activación se conservan tal cual. El objetivo declarado es mantener la fidelidad numérica del checkpoint NVFP4 original en todo lo que no toca la abliteración y minimizar el error de cuantización en lo que sí cambia. La herramienta empleada es NVIDIA ModelOpt, según las etiquetas del repositorio.

El resultado es un checkpoint que hereda las capacidades del Gemma 4 original y, al mismo tiempo, la supresión de las respuestas de rechazo del modelo abliterated. No hay información sobre decodificación especulativa, atención lineal ni otras innovaciones concretas del modelo base en los datos proporcionados.

## Capacidades

- Generación de texto conversacional multi-turno, con la etiqueta "conversational" en el repositorio.
- Procesamiento conjunto de imagen y texto, dado que el pipeline declarado es image-text-to-text.
- Capacidades de razonamiento, código y matemáticas heredadas del modelo base, aunque no se documentan evaluaciones específicas en este repositorio.
- Respuestas sin mecanismos de rechazo: la abliteración elimina las negativas automáticas del modelo alineado, lo que permite obtener respuestas sobre temas que el modelo original declinaría.
- Soporte multimodal de entrada de imágenes, presumiblemente orientado a descripción, extracción de información y razonamiento visual.
- Soporte de tool calling y function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Modo "thinking" explícito: no disponible.
- Capacidades multilingües: no disponible, no se declara la lista de idiomas.

## Casos de uso

- Investigación sobre alineación y seguridad: el modelo permite comparar las respuestas de una versión alineada y una abliterated sobre el mismo conjunto de prompts, lo que resulta útil para medir qué comportamientos dependen de los mecanismos de rechazo y cuáles de conocimiento subyacente. El formato NVFP4 reduce el coste de ejecutar ambas variantes en paralelo.
- Análisis de sesgos y contenido tóxico: al no filtrar respuestas, permite aflorar de forma más directa los sesgos internalizados en el modelo base, algo necesario para auditar datasets de entrenamiento y construir taxonomías de daño.
- Red teaming de sistemas de moderación: se puede usar como generador adversario para probar clasificadores de contenido y políticas de filtrado en producción, ejecutándolo en local con pesos de 16,5 GB.
- Inferencia multimodal en hardware Blackwell: tareas de descripción de imágenes, extracción de texto de documentos escaneados o respuesta a preguntas sobre capturas, aprovechando los tensor cores FP4 de las GPU de nueva generación para reducir el coste por consulta.
- Despliegue en una única GPU de gama alta para prototipado: el tamaño del repositorio permite cargar el modelo en una GPU de 24-32 GB, lo que facilita ciclos de iteración rápidos sin infraestructura multi-GPU.
- Generación de datos sintéticos para investigación: al carecer de restricciones de rechazo, puede producir corpus diversos sobre temáticas delicadas que después se filtran y anotan manualmente para construir datasets de evaluación.
- Experimentación con cuantización FP4: sirve como banco de pruebas para medir la degradación de calidad de NVFP4 frente a BF16 en un modelo MoE multimodal de ~26B, comparando con el checkpoint original.
- Asistente conversacional sin capas de seguridad, únicamente en entornos controlados de investigación y con revisión humana de las salidas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del repositorio se limita a describir el procedimiento de cuantización y no incluye métricas de MMLU, HumanEval, GSM8K, MMMU ni de ningún otro conjunto de evaluación. Tampoco se documentan comparaciones de perplejidad o de similitud con el checkpoint BF16 de partida. La búsqueda web realizada no devolvió resultados relacionados con este modelo.

## Requisitos de hardware

- El repositorio ocupa 16,5 GB en disco, por lo que los pesos caben en una GPU con 24 GB de VRAM, como una RTX 4090 o una RTX 5090, dejando margen limitado para la caché KV.
- Para contexto largo o lotes grandes se recomienda una GPU con 32 GB o más (RTX 5090 de 32 GB, A100 de 40 GB, H100 de 80 GB, B200 de 180 GB), ya que la caché KV de un MoE de este tamaño crece rápido con la longitud de secuencia.
- NVFP4 está diseñado para los tensor cores FP4 de la arquitectura Blackwell (B100, B200, GB200 y las GPU de consumo de la serie RTX 50). En esas GPU se obtiene la ventaja completa de memoria y velocidad.
- En arquitecturas anteriores (Ampere, Ada Lovelace, Hopper) no existe soporte nativo de FP4: los pesos deben descomprimirse a FP8 o BF16 antes de la multiplicación, con lo que se pierde parte del ahorro de memoria y la mayor parte de la ganancia de velocidad. En H100 el formato nativo rápido es FP8, no FP4.
- Opciones de despliegue: TensorRT-LLM con checkpoints generados por NVIDIA ModelOpt (la ruta natural para NVFP4), y vLLM en sus versiones con soporte de cuantización NVFP4. SGLang puede soportarlo según versión. llama.cpp y Ollama no admiten NVFP4 de forma nativa, por lo que requerirían reconvertir los pesos a GGUF.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Cuantizacion | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| edp1096/Huihui-Gemma-4-26B-A4B-it-NVFP4 (este) | ~26B totales / ~4B activos (segun nomenclatura) | NVFP4, 16,5 GB | no disponible | apache-2.0 | HuggingFace, 0 descargas |
| huihui-ai/Huihui-gemma-4-26B-A4B-it-abliterated | ~26B totales / ~4B activos | BF16 (presumiblemente) | no disponible | no disponible en la informacion | HuggingFace |
| bg-digitalservices/Gemma-4-26B-A4B-it-NVFP4 | ~26B totales / ~4B activos | NVFP4 | no disponible | no disponible en la informacion | HuggingFace |
| google/gemma-4-26B-A4B-it | ~26B totales / ~4B activos | BF16 | no disponible | terminos de uso de Gemma (no confirmado) | HuggingFace |

La diferencia práctica entre las cuatro variantes es el binomio fidelidad/seguridad. El checkpoint de Google es la referencia alineada; el de huihui-ai elimina los rechazos y sacrifica parte del alineamiento; los dos NVFP4 reducen el peso a aproximadamente un cuarto del tamaño en BF16 a cambio de una posible degradación de calidad numérica, y este último además reintroduce los tensores abliterados cuantizados desde BF16 en lugar de heredarlos del checkpoint cuantizado. No se dispone de evaluaciones que cuantifiquen esas diferencias.

## Limitaciones y advertencias

- La abliteración elimina los mecanismos de rechazo, por lo que el modelo puede generar contenido dañino, ilegal o explícitamente tóxico sin filtro previo. No es apto para aplicaciones de cara al público sin capas adicionales de moderación.
- La edición de pesos sobre un modelo alineado suele degradar la coherencia general y aumentar la tasa de alucinación; no se documenta ninguna evaluación que mida ese efecto.
- El modelo puede alucinar hechos, citas y referencias con seguridad alta, especialmente en tareas multimodales donde la imagen no contiene la información solicitada.
- La cuantización NVFP4 introduce error numérico adicional respecto a BF16. No hay datos publicados de perplejidad ni de degradación por tarea en este repositorio.
- Se desconoce la lista de idiomas soportados y el comportamiento del modelo fuera del inglés.
- Se desconoce la longitud de contexto, lo que impide planificar aplicaciones que dependan de ventanas largas.
- Aunque el repositorio declara licencia apache-2.0, los modelos Gemma de Google se distribuyen habitualmente bajo los términos de uso de Gemma, que imponen restricciones adicionales y no son una licencia open source aprobada por la OSI. Conviene verificar la licencia del modelo base antes de un uso comercial.
- El uso comercial de una versión abliterated puede infringir los términos de uso del modelo original, además de las políticas de los proveedores de servicios.
- No hay soporte nativo de NVFP4 en llama.cpp ni en Ollama, lo que limita las rutas de despliegue en CPU o en GPU sin tensor cores FP4.
- El repositorio tiene 0 descargas y 0 "likes", y fue creado y actualizado el mismo día (15 de septiembre de 2026): no hay evidencia de uso en producción ni validación por terceros.
- No se dispone de información sobre la procedencia exacta de los pesos del donante BF16 ni sobre la reproducibilidad del proceso de cuantización.

## Enlaces

- Repositorio del modelo: https://huggingface.co/edp1096/Huihui-Gemma-4-26B-A4B-it-NVFP4
- Modelo base alineado: https://huggingface.co/google/gemma-4-26B-A4B-it
- Versión abliterated en BF16: https://huggingface.co/huihui-ai/Huihui-gemma-4-26B-A4B-it-abliterated
- Checkpoint NVFP4 de partida: https://huggingface.co/bg-digitalservices/Gemma-4-26B-A4B-it-NVFP4
- La búsqueda web no devolvió enlaces relevantes sobre este modelo (los resultados obtenidos correspondían a contenidos sin relación).
