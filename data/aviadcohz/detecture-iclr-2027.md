# aviadcohz/Detecture-ICLR-2027

## Resumen

Detecture es un sistema de segmentación de imágenes orientado a lo que sus autores denominan segmentación sub-semántica: dado una imagen y una única instrucción en lenguaje natural de rango abierto, el modelo genera sus propias descripciones de textura, infiere cuántas regiones contiene la escena y las resuelve en una partición sin solapamientos. Se trata del checkpoint asociado a una submission a ICLR 2027 (referenciado como `epoch_23.pt` por `fairness_baseline_suite/src/paths.py`) y publicado por el usuario aviadcohz. No es un modelo autónomo: requiere los pesos base de Qwen3-VL-8B y de SAM 3, sobre los que se ensamblan 8,23 M de parámetros entrenados.

La arquitectura acopla un modelo vision-lenguaje generalista (Qwen3-VL-8B), que razona sobre la apariencia y emite una descripción por región terminada en el token de grounding `[SEG]`, con una columna vertebral de segmentación promptable (SAM 3, completamente congelada). Un proyector aprendido denominado Bridge traduce cada estado oculto `[SEG]` de 4096 dimensiones al ancho de texto nativo de SAM 3 (1024 dimensiones). Una asignación Winner-Takes-All sobre K+1 canales, con un dustbin aprendido, convierte las máscaras por textura en una partición en lugar de un conjunto de máscaras umbralizadas de forma independiente.

Su relevancia es fundamentalmente de investigación: aborda el problema de segmentar texturas y materiales sin conocer a priori el número de regiones de la imagen, un escenario en el que la mayoría de evaluaciones sí proporciona ese dato. El repositorio tiene 2,5 GB, licencia CC-BY-4.0 para estos pesos, 0 descargas y 0 likes en el momento de la consulta.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Híbrida multimodal: Qwen3-VL-8B (VLM, adaptado con LoRA en las proyecciones de atención q y v) + proyector Bridge + SAM 3 congelado (encoder de imagen, text resizer, transformer y decoder de máscaras) |
| Parametros totales | No disponible como cifra agregada. Composición: Qwen3-VL-8B (≈8 000 M, congelado) + SAM 3 (congelado, recuento no disponible) + 8,23 M entrenables. El fichero incluye además 1 242 M congelados del embedding y la LM head de Qwen, redimensionados al añadir el token `[SEG]` |
| Parametros activos | No aplica: no es un modelo MoE |
| Parametros entrenables | 8,23 M en total: Bridge (4,20 M), LoRA de Qwen3-VL en q y v (3,83 M), mask head (0,20 M) y embedding de dustbin (≈0) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible: solo se distribuye el checkpoint en su precisión original. No hay versiones GGUF, AWQ, GPTQ ni cuantizadas |
| Idiomas soportados | No disponible en la información proporcionada |
| Licencia | CC-BY-4.0 para estos pesos. Qwen3-VL y SAM 3 mantienen sus propias licencias y esta release no las relicencia |
| Formato de pesos | PyTorch state dict (`detecture_epoch23.pt`, 2,5 GB, 157 tensores en `model_trainable`). No se publican safetensors ni GGUF |
| Pipeline declarado | image-segmentation |
| Libreria | pytorch |
| Tamano del repositorio | 2,5 GB |

## Arquitectura y entrenamiento

El sistema se organiza en tres bloques. Qwen3-VL-8B procesa la imagen y la instrucción abierta, y emite una descripción de textura por región, cada una cerrada por el token de grounding `[SEG]`. El Bridge, con 4,20 M de parámetros, proyecta el estado oculto de 4096 dimensiones asociado a `[SEG]` al espacio de texto de SAM 3, de 1024 dimensiones. SAM 3 permanece congelado en su totalidad (encoder de imagen, text resizer, transformer y decoder de máscaras) y produce las máscaras correspondientes. Finalmente, una asignación Winner-Takes-All sobre K+1 canales, que incluye un dustbin aprendido, fuerza a que las máscaras por textura formen una partición no solapada, en lugar de umbralizar cada máscara de forma independiente.

El entrenamiento sigue un currículo de dos etapas sobre una única NVIDIA H100 NVL de 95 GB. La etapa 1 entrena el Bridge, la mask head y el dustbin con SAM 3 y Qwen congelados; la etapa 2 desbloquea el LoRA sobre las proyecciones de atención de Qwen junto con las filas enmascaradas de `[SEG]`. La función de pérdida combina entropía cruzada de máscaras, Dice y un objetivo de lenguaje Shifted-Zero que elimina la presión lingüística ordinaria del propio estado de grounding. No se indica el número de tokens de entrenamiento ni la composición del dataset más allá de las rutas de evaluación (RWTD, RWTD-COCO, TextureADE y CSTD). El checkpoint distribuido tiene el estado del optimizador eliminado (el original pesaba 7,6 GB), por lo que reanudar el entrenamiento desde este fichero reinicializa los momentos de AdamW.

## Capacidades

- Segmentación de texturas y materiales a partir de una instrucción abierta en lenguaje natural, sin catálogo cerrado de clases.
- Inferencia del número de regiones de la escena: el modelo decide cuántas regiones hay y las resuelve en una partición no solapada mediante la asignación Winner-Takes-All con dustbin.
- Generación de descripciones de textura libres, una por región, cada una terminada en el token de grounding `[SEG]`.
- Razonamiento visual y lingüístico heredado de Qwen3-VL-8B, reutilizado aquí como cabecera de propuesta de regiones.
- Segmentación promptable mediante SAM 3: el modelo puentea representaciones de texto hacia el espacio nativo de SAM 3, por lo que la segmentación depende de prompts textuales proyectados.
- Uso de un único prompt de rango abierto por imagen, sin necesidad de especificar el número de regiones ni de proporcionar puntos o cajas.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible (no se declara ningún idioma en la model card).
- Capacidades especiales adicionales (modo thinking, audio, vídeo): no disponibles.

## Casos de uso

- Anotación asistida de datasets de texturas: dado un conjunto de imágenes sin etiquetar, el modelo propone una partición por texturas y descripciones textuales de cada región, reduciendo el coste de anotación manual previo al refinado humano.
- Segmentación de materiales en imágenes de producto: para catálogos de e-commerce donde interesa separar cuero, tejido, metal o plástico dentro de una misma fotografía, sin definir de antemano cuántas regiones hay.
- Análisis de cubierta terrestre en teledetección: partición de escenas aéreas o satelitales en regiones de textura homogénea (cultivo, agua, suelo desnudo, urbano) usando prompts abiertos en lugar de clases fijas.
- Segmentación de tejidos en imagen médica o histología: separación de regiones por patrón de textura, donde el número de regiones es variable y no se conoce a priori, apoyándose en la partición no solapada que produce el dustbin.
- Control de calidad industrial: inspección de superficies donde se necesita delimitar zonas con distinta rugosidad o acabado, aprovechando que el modelo emite su propia descripción de cada región.
- Edición de imagen consciente de la estructura: generación de máscaras de partición para pipelines de retoque, relighting o sustitución de materiales manteniendo los límites entre regiones.
- Investigación en evaluación de segmentación: reproducción del protocolo de la submission, en el que ninguna comparativa conoce el número de regiones, mediante `fairness_baseline_suite` sobre RWTD, RWTD-COCO, TextureADE y CSTD.
- Robótica y manipulación: delimitación de zonas de agarre o superficies según su textura, empleando la partición resultante como mapa de regiones para planificación.

## Benchmarks y rendimiento

Resultados reportados por los autores bajo un protocolo en el que ningún método recibe el número de regiones de la imagen:

| Ruta | Region Covering | Boundary-F | mIoU | ARI |
|---|---:|---:|---:|---:|
| RWTD | 0,7946 | 0,4252 | 0,7843 | 0,5993 |
| RWTD-COCO | 0,8536 | 0,4226 | 0,8460 | 0,7351 |
| TextureADE | 0,7479 | 0,5038 | 0,7222 | 0,6863 |
| CSTD | 0,8835 | 0,6499 | 0,8642 | 0,7742 |

Los autores advierten de que estas cifras no son comparables con evaluaciones que sí proporcionan el número de regiones: al suministrarlo, el mIoU de RWTD sube de 0,7843 a 0,8162. No se han publicado en la información disponible resultados de benchmarks estándar de propósito general (MMLU, HumanEval, GSM8K u otros) ni comparaciones numéricas frente a otros métodos en la misma tabla.

## Requisitos de hardware

- Entrenamiento: una única NVIDIA H100 NVL de 95 GB según la model card, con currículo de dos etapas.
- Inferencia: no se publican requisitos oficiales. Estimación a partir del recuento de parámetros (no confirmada por el autor): los pesos en bf16 de Qwen3-VL-8B rondan los 16 GB, a los que se suman SAM 3 y los 8,23 M entrenables, más activaciones y memoria del encoder de visión para imágenes de alta resolución. En la práctica, un entorno de 24 GB es el mínimo razonable en bf16.
- GPU recomendadas: H100 o A100 80 GB para lotes grandes y evaluación por lotes; en el extremo consumer, RTX 4090 o RTX 3090 (24 GB) para inferencia de una imagen con batch pequeño.
- Cabe en GPU consumer: sí, previsiblemente en tarjetas de 24 GB (RTX 4090, RTX 3090). En tarjetas de 16 GB no hay ruta oficial, ya que no se publican pesos cuantizados.
- Opciones de despliegue: no hay integración con vLLM, llama.cpp, Ollama ni TGI. El único camino documentado es el repositorio `Qwen2SAM_Detecture_Benchmark`, ensamblando el modelo con los pesos base de Qwen3-VL-8B y SAM 3 y ejecutando `PYTHONPATH=src python src/run_fairness.py --model detecture --dataset RWTD`.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Detecture (este checkpoint) | 8,23 M entrenables sobre Qwen3-VL-8B y SAM 3 congelados | no disponible | VLM + SAM 3 con Bridge y asignación Winner-Takes-All sobre partición | CC-BY-4.0 (pesos propios) | Checkpoint de investigación, 0 descargas, requiere pesos base |
| SAM 3 | no disponible | no disponible | Segmentación promptable con encoder de imagen y decoder de máscaras | licencia propia del modelo base, no relicenciada aquí | Modelo base, se usa congelado dentro de Detecture |
| Qwen3-VL-8B | ≈8 000 M | no disponible | Modelo vision-lenguaje generalista | licencia propia del modelo base, no relicenciada aquí | Modelo base, se usa con LoRA en Detecture |

No se dispone en la información proporcionada de otros modelos comparables de segmentación sub-semántica con los que contrastar parámetros, contexto o rendimiento. Los datos de licencia y disponibilidad de SAM 3 y Qwen3-VL-8B se limitan a lo que declara la model card: mantienen sus licencias y no son relicenciados por esta release.

## Limitaciones y advertencias

- El repositorio no es un modelo autónomo: el loader copia los tensores entrenados dentro de un modelo ensamblado que necesita los pesos base de Qwen3-VL-8B y SAM 3, que deben obtenerse por separado.
- El estado del optimizador está eliminado. Reanudar el entrenamiento desde `detecture_epoch23.pt` reinicializa los momentos de AdamW, por lo que no es un punto de reanudación fiel al checkpoint original de 7,6 GB.
- Formato `.pt` (pickle de PyTorch): no hay safetensors ni GGUF. Cargar el fichero implica las precauciones habituales de seguridad asociadas a los pesos serializados con pickle.
- No se publican pesos cuantizados, lo que limita el despliegue en GPUs de menos de 24 GB y en entornos de inferencia optimizados.
- Los propios autores advierten de que sus resultados no son comparables con evaluaciones que proporcionan el número de regiones; comparar sus cifras con las de otros métodos bajo ese protocolo induciría a error.
- Riesgo de alucinación: el modelo genera descripciones de textura libres, por lo que puede proponer regiones o etiquetas inexistentes en la imagen; no hay verificación semántica de las descripciones.
- El número de regiones se infiere, no se conoce: en escenas con texturas ambiguas o degradados suaves, la partición Winner-Takes-All puede sobre-segmentar o fundir regiones, y el dustbin puede absorber regiones legítimas.
- No se declara ningún idioma soportado en la model card, y el comportamiento multilingüe del sistema no está documentado.
- Sesgos conocidos: no disponibles. No se publica análisis de sesgo demográfico, geográfico ni de dominio.
- Licencia: los pesos propios son CC-BY-4.0, que permite uso comercial con atribución, pero las licencias de Qwen3-VL y SAM 3 aplican de forma independiente y deben verificarse antes de cualquier despliegue en producción.
- Estado de publicación: 0 descargas y 0 likes, creado y actualizado en septiembre de 2026, vinculado a una submission a ICLR 2027. Es material de investigación sin garantías de mantenimiento.
- La búsqueda web realizada no devolvió ningún resultado relevante sobre este modelo: los resultados obtenidos eran páginas de turismo en georgiano sobre Roma y no guardan relación con el sistema.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/aviadcohz/Detecture-ICLR-2027
- Dataset del benchmark: https://huggingface.co/datasets/aviadcohz/Detecture_ICLR_Benchmarking
- Código: https://github.com/aviadcohz/Qwen2SAM_Detecture_Benchmark
- Paper: no disponible en la información proporcionada (se menciona una submission a ICLR 2027, sin enlace)
- Demo: no disponible
- Blog o documentación adicional: no disponible
