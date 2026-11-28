# aakaashj/GLM-5.3-Flash-Uncensored-Aakaash-TFQ3

## Resumen

GLM-5.3-Flash-Uncensored-Aakaash-TFQ3 es una adaptación cuantizada en formato TensorFold TFQ3 del modelo GLM-5.3-Flash de Z.ai, publicada por el usuario aakaashj. El checkpoint parte del modelo base TensorFold/GLM-5.3-Flash-TFQ3 e incorpora las modificaciones "uncensored" (abliterated) de Dealign aplicadas sobre GLM-5.3-Flash-UNCENSORED-NVFP4. Se distribuye como un checkpoint mixto de aproximadamente 167,5 GB que incluye el modelo de lenguaje, los activos de visión y la cabeza MTP (multi-token prediction).

El modelo conserva la arquitectura original de la familia GLM-5.3-Flash, con un total de 17.551.612.766 parámetros según los datos reales de los safetensors, y añade capacidades multimodales (visión) junto con decodificación especulativa opcional mediante un modelo draft separado (GLM-5.3-Flash-DFlash2 de Inco AI). La licencia es MIT.

Su relevancia es acotada y muy específica: se trata de una release experimental orientada al runtime TensorFold nativo en CUDA, validada únicamente sobre una configuración de cuatro NVIDIA DGX Spark. No incluye benchmarks propios, el parche de runtime CUDA TP4 está anunciado como "coming soon" y no dispone de descargas ni validación comunitaria en el momento de la ficha.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de la familia GLM-5.3-Flash, con cabeza MTP y soporte de vision (detalles de atencion no disponibles) |
| Parametros totales | 17.551.612.766 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | TFQ3 mixto (mixed precision), etiquetado como 8-bit en los tags de Hugging Face |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | Safetensors (shards e indices) + archivos de expertos .tffpw + pw_v3_tables.bin (tablas de lookup TFQ3) |

## Arquitectura y entrenamiento

El checkpoint deriva de GLM-5.3-Flash de Z.ai y hereda su arquitectura base, de la que la model card solo confirma la presencia de una cabeza MTP (multi-token prediction) y de activos de visión, además del modelo de lenguaje. La cuantización aplicada es TFQ3 en precisión mixta, un formato propietario del ecosistema TensorFold que combina shards safetensors con archivos de pesos de expertos (.tffpw) y tablas de lookup (pw_v3_tables.bin) leídas conjuntamente por el runtime.

No se dispone de información sobre el volumen de tokens de entrenamiento, la composición del dataset, ni sobre si hubo etapas de RLHF o DPO en el modelo original. Las modificaciones "uncensored" provienen de Dealign y consisten en un proceso de abliteration aplicado sobre el modelo NVFP4, cuyo detalle técnico no se documenta en esta ficha. La adaptación TFQ3, la validación y la publicación corren a cargo de Aakaash. El checkpoint incorpora además soporte para decodificación especulativa mediante un draft model opcional (DFlash2), que se descarga por separado.

## Capacidades

- Generación de texto y conversación multi-turno (pipeline text-generation, etiqueta conversational).
- Procesamiento de visión: el checkpoint incluye los activos de visión del modelo original.
- Cabeza MTP (multi-token prediction) para acelerar la generación.
- Decodificación especulativa opcional con el draft model GLM-5.3-Flash-DFlash2 de Inco AI.
- Comportamiento "uncensored"/abliterated: se han atenuado las restricciones de rechazo del modelo original.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Cobertura multilingüe: no disponible en la información proporcionada.

## Casos de uso

- Investigación sobre alineación y abliteration: el checkpoint permite estudiar empíricamente cómo afecta la eliminación de rechazos a las respuestas del modelo, comparándolo con el GLM-5.3-Flash original y con la variante NVFP4 de Dealign.
- Evaluación del formato TFQ3: sirve como caso de prueba para desarrolladores del runtime TensorFold que necesiten validar la carga conjunta de shards safetensors, archivos .tffpw y tablas pw_v3_tables.bin.
- Pruebas de decodificación especulativa: combinado con el draft model DFlash2, permite medir la ganancia de throughput de la generación especulativa sobre un checkpoint cuantizado de 17,5B parámetros.
- Despliegue en clústeres de memoria unificada: la configuración validada (cuatro DGX Spark de 128 GB) lo hace adecuado para entornos con varios nodos de memoria unificada en lugar de GPUs discretas de gran VRAM.
- Experimentación multimodal en local: al incluir activos de visión, puede emplearse para probar pipelines de imagen-texto sobre infraestructura propia, siempre que se disponga del runtime TensorFold.
- Generación de texto sin filtros en entornos controlados: para casos donde se requiera estudiar el comportamiento del modelo sin capas de rechazo, con la supervisión y las salvaguardas adecuadas por parte del operador.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La propia model card indica "Benchmarks: Coming soon" y advierte explícitamente de que los resultados publicados por Z.ai, Dealign o TensorFold corresponden a sus respectivos checkpoints y no a esta release.

## Requisitos de hardware

- Tamaño del checkpoint: aproximadamente 167,5 GB (156 GiB), lo que condiciona cualquier despliegue.
- Configuración validada: cuatro NVIDIA DGX Spark, cada uno con 128 GB de memoria unificada, en TP4 (tensor parallel de 4).
- Runtime: se requiere una build de TensorFold con soporte para GLM-5.3-Flash TFQ3; el parche de runtime CUDA TP4 está anunciado como "coming soon".
- GPU consumer: no hay evidencia de que quepa en una GPU consumer individual; el tamaño del checkpoint excede la VRAM de cualquier tarjeta de consumo actual.
- Opciones de despliegue: TensorFold nativo (CUDA) es el único runtime probado; no se documenta compatibilidad con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles; la model card remite a futuras mediciones de rendimiento.
- Modelo draft opcional: GLM-5.3-Flash-DFlash2 (descarga separada) para decodificación especulativa.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Runtime |
|---|---|---|---|---|---|
| GLM-5.3-Flash-Uncensored-Aakaash-TFQ3 | 17,55B | no disponible | TFQ3 mixto + safetensors | MIT | TensorFold nativo |
| TensorFold/GLM-5.3-Flash-TFQ3 (base) | no disponible | no disponible | TFQ3 | no disponible | TensorFold nativo |
| dealignai/GLM-5.3-Flash-UNCENSORED-NVFP4 (base) | no disponible | no disponible | NVFP4 | no disponible | no disponible |
| zai-org/GLM-5.3-Flash (original) | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de contexto, rendimiento ni licencia de los modelos comparados en la información proporcionada; la comparación se limita a linaje y formato.

## Limitaciones y advertencias

- Ausencia total de benchmarks: no hay métricas de calidad, latencia ni throughput para este checkpoint concreto.
- Runtime restringido: requiere TensorFold con soporte TFQ3 y un parche CUDA TP4 aún no publicado; no funciona con los runners estándar (vLLM, llama.cpp, Ollama, TGI).
- Hardware poco convencional: la única configuración validada son cuatro DGX Spark; el comportamiento en otras plataformas no está documentado.
- Modelo "uncensored": la abliteration elimina parte de los rechazos de seguridad, lo que incrementa el riesgo de generar contenido dañino, sesgado o inexacto; requiere salvaguardas externas en cualquier despliegue.
- Riesgo de alucinación: inherente a los modelos generativos; no hay evaluación específica publicada para esta variante.
- Idiomas y contexto: sin datos publicados sobre cobertura lingüística ni longitud de ventana.
- Licencia MIT: permite uso comercial, pero deben conservarse los avisos de copyright y licencia upstream; el draft model DFlash2 se distribuye bajo su propia licencia, distinta de la MIT.
- Madurez: cero descargas y cero likes en el momento de la ficha, creado y actualizado el mismo día; se trata de una release experimental sin validación de la comunidad.
- Integridad del checkpoint: deben conservarse los nombres y la estructura de directorios originales (shards, .tffpw, pw_v3_tables.bin); cualquier reorganización puede romper la carga en TensorFold.

## Enlaces

- Hugging Face del modelo: https://huggingface.co/aakaashj/GLM-5.3-Flash-Uncensored-Aakaash-TFQ3
- Modelo original: https://huggingface.co/zai-org/GLM-5.3-Flash
- Checkpoint TFQ3 de referencia: https://huggingface.co/TensorFold/GLM-5.3-Flash-TFQ3
- Modificaciones uncensored: https://huggingface.co/dealignai/GLM-5.3-Flash-UNCENSORED-NVFP4
- Draft model opcional: https://huggingface.co/incoai/GLM-5.3-Flash-DFlash2
- Runtime TensorFold: https://github.com/ashhart/TensorFold
- Implementación y formato TFQ: https://github.com/ashhart/TFQ
- Perfil del autor: https://huggingface.co/aakaashj
- Perfil de Z.ai: https://huggingface.co/zai-org
- Perfil de Dealign: https://huggingface.co/dealignai
- Perfil de TensorFold: https://huggingface.co/TensorFold
- Perfil de Inco AI: https://huggingface.co/incoai
- Perfil de Ash Hart: https://github.com/ashhart
