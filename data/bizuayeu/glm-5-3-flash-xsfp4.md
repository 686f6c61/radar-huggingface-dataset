# Bizuayeu/GLM-5.3-Flash-XSFP4

## Resumen

GLM-5.3-Flash-XSFP4 es un checkpoint derivado y cuantizado de `nvidia/GLM-5.3-Flash-FP4-Local`, publicado por el usuario Bizuayeu. El modelo base es a su vez una versión de precisión mixta de `zai-org/GLM-5.3-Flash`, un modelo multimodal de tipo image-text-to-text con arquitectura MoE (mezcla de expertos) y 342.856.965.542 parámetros totales según los safetensors del repositorio. La modificación introducida por este checkpoint afecta exclusivamente a los expertos enrutados de las capas 3 a 44 y a los expertos de la capa MTP (multi-token prediction), que se recuantizan desde los pesos BF16 originales de Z.AI empleando el formato propietario XSFP4.

XSFP4 (eXpert-eXtended OSFP4) es una variante de NVFP4 que incorpora el suavizado diagonal de OSFP4 plegado dentro de los pesos de los expertos, de modo que en tiempo de inferencia no se ejecuta ningún paso de suavizado adicional: los pesos se computan como NVFP4 estándar y cualquier kernel NVFP4 puede leerlos. El resto de tensores (proyecciones KDA, MLP denso, `lm_head`, MLA, expertos compartidos, router, embeddings, normas y torre de visión) se conservan byte a byte tal como los entrega FP4-Local.

El interés del checkpoint es práctico: es la variante que la línea 3.x del motor nativo de TensorFold (GLM-5.3-Flash BIZ) sirve en sistemas GB10 (clase DGX Spark), siendo la opción por defecto desde la versión 3.4.0 y la única a partir de la 3.6.0. Con 178 GB en 39 archivos safetensors, está pensado para despliegues locales en hardware con memoria unificada de gran capacidad, no para GPUs de consumo convencionales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE multimodal (image-text-to-text) con capas MLA, proyecciones KDA, expertos compartidos y capa MTP; derivado de GLM-5.3-Flash |
| Parametros totales | 342.856.965.542 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Mixta: XSFP4 (expertos enrutados de capas 3-44 y expertos de la capa MTP), MXFP8 (proyecciones KDA, MLP denso, `lm_head`, atención y experto compartido de la capa MTP, atención de la torre de visión), FP8 en bloques 128×128 (MLA y expertos compartidos de capas 3-44), NVFP4 (MLP y merger de la torre de visión), BF16/F32 (router, embeddings, normas); escalas de bloque comprimidas sin pérdida en `csf_32x2_v1` |
| Idiomas soportados | ja, en (según la model card; el calibrado incluye también matemáticas y STEM en inglés) |
| Licencia | NVIDIA Open Model Agreement (derivado); el modelo upstream `zai-org/GLM-5.3-Flash` es MIT |
| Formato de pesos | safetensors (39 archivos, 178 GB) |
| Pipeline | image-text-to-text |
| Repositorio | 178 GB, 39 safetensors |

## Arquitectura y entrenamiento

El modelo base es un transformer MoE multimodal de GLM-5.3-Flash con atención MLA (multi-head latent attention), proyecciones KDA, capas densas y una capa MTP para decodificación especulativa. FP4-Local, del que deriva este checkpoint, se obtuvo mediante destilación con cuantización (quantization-aware distillation) contra el modelo BF16, con los expertos enrutados cuantizados a NVFP4. En FP4-Local solo los expertos enrutados son de 4 bits; el resto usa MXFP8, FP8 por bloques, BF16 o F32 según el tensor. Según la model card, los expertos enrutados (incluidos los de la capa MTP) representan el 94% del checkpoint, y casi toda la brecha de FP4-Local frente al modelo BF16 provenía de esos expertos y de su router.

Este checkpoint sustituye únicamente esos expertos por XSFP4, recuantizándolos desde los pesos BF16 de `zai-org/GLM-5.3-Flash`. XSFP4 aplica el método de OSFP4 (optimización conjunta de suavizado diagonal y escalas de bloque para cuantización NVFP4, arXiv:2610.08231), que ajusta conjuntamente un suavizado y las escalas de bloque para minimizar el error de salida de cada capa, ponderando cada canal de entrada por su media cuadrática de activaciones. La innovación es que el suavizado se pliega en los pesos: el suavizado de la entrada de la proyección down se multiplica en las filas de la proyección up, y las proyecciones gate y up no reciben suavizado propio. El resultado son pesos NVFP4 ordinarios con escalas de bloque FP8 E4M3 de tamaño 16, sin ningún paso en tiempo de ejecución.

La calibración se realizó con 512 filas de 2.048 tokens: 35% japonés (Nemotron-Post-Training-Dataset-v2 Japanese, Wikipedia japonesa de LLM-jp Corpus v3), 25% registros de trabajo locales, 15% matemáticas, 10% STEM y 15% conversación en inglés, renderizados con la plantilla de chat a esfuerzo de razonamiento `high` y con calibración solo de routing (cada experto ve únicamente los tokens que le corresponden). Las escalas de bloque de los expertos enrutados de las capas 3-44 se comprimen sin pérdida en `csf_32x2_v1` (10,8 GB en lugar de 19,0 GB), y un loader las restaura; las de la capa MTP quedan sin comprimir.

## Capacidades

- Generación de texto conversacional y razonamiento multi-turno, heredado del modelo base GLM-5.3-Flash.
- Procesamiento multimodal image-text-to-text: entrada conjunta de imágenes y texto según el pipeline declarado.
- Razonamiento con esfuerzo configurable (la calibración usa `reasoning effort: high`), lo que sugiere modo de pensamiento extendido en el modelo base.
- Capacidades matemáticas y STEM, reforzadas en el conjunto de calibración (15% matemáticas, 10% STEM).
- Soporte multilingüe limitado a japonés e inglés según la model card.
- Decodificación especulativa mediante la capa MTP (multi-token prediction) incluida en el checkpoint.
- Tool calling y function calling: no disponible en la información proporcionada.
- Soporte de agentes y multi-step reasoning: no disponible en la información proporcionada.
- Capacidades de audio: no disponible en la información proporcionada.

## Casos de uso

- Despliegue local en DGX Spark (GB10): es el checkpoint que el motor TensorFold GLM-5.3-Flash BIZ sirve por defecto desde la versión 3.4.0 y en exclusiva desde la 3.6.0, por lo que es la opción natural para ejecutar GLM-5.3-Flash en sistemas de memoria unificada de clase GB10.
- Asistentes conversacionales en japonés e inglés: el calibrado dedica un 35% a japonés y un 15% a conversación en inglés, lo que orienta el checkpoint a diálogos bilingües ja/en con contexto multi-turno.
- Procesamiento de documentos con imágenes: al ser un modelo image-text-to-text, puede emplearse para extracción y descripción de contenido visual combinado con texto, como capturas, diagramas o documentación escaneada.
- Razonamiento matemático y técnico: el 15% de matemáticas y el 10% de STEM en la calibración lo hacen adecuado para resolución de problemas cuantitativos y asistencia técnica en dominios científicos.
- Sustitución de FP4-Local con mayor fidelidad: dado que casi toda la brecha de FP4-Local frente al BF16 provenía de los expertos enrutados, este checkpoint permite servir el mismo modelo con los mismos kernels NVFP4 pero con expertos recuantizados, manteniendo el resto de tensores idénticos byte a byte.
- Investigación en cuantización NVFP4: sirve como caso de estudio reproducible de OSFP4 con suavizado plegado, comparando distribuciones de next-token frente a FP4-Local y al BF16 sobre el mismo corpus de 128 documentos (144.285 posiciones).
- Pipelines de inferencia con decodificación especulativa: la capa MTP con expertos XSFP4 permite aprovechar multi-token prediction en el mismo checkpoint sin cambiar de formato.

## Benchmarks y rendimiento

La model card menciona una medición de las distribuciones de next-token de cada checkpoint sobre los mismos 128 documentos (144.285 posiciones) frente al modelo BF16, pero el texto proporcionado está truncado y no incluye los valores numéricos resultantes ni métricas estándar (MMLU, HumanEval, GSM8K u otras).

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM/memoria estimada: el repositorio ocupa 178 GB en safetensors, por lo que la inferencia requiere al menos esa cantidad de memoria más overhead de runtime; no cabe en GPUs de consumo convencionales (24 GB o 48 GB).
- Hardware objetivo declarado: sistemas GB10 (clase DGX Spark) con memoria unificada; es el entorno para el que se sirve mediante el motor TensorFold GLM-5.3-Flash BIZ.
- GPUs recomendadas: no disponible en la información proporcionada; por tamaño, requiere aceleradores de数据中心 con memoria agregada muy superior a 178 GB o sistemas de memoria unificada de gran capacidad.
- Cabe en consumer GPU: no.
- Opciones de despliegue: el motor nativo TensorFold GLM-5.3-Flash BIZ (GitHub: Bizuayeu/GLM-5.3-Flash-DGX-Sparks-BIZ); los pesos son NVFP4 estándar y la model card indica que los sirven los mismos kernels que FP4-Local. Soporte explícito de vLLM, llama.cpp, Ollama o TGI: no disponible en la información proporcionada.
- Latencia y throughput: no disponible en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros totales | Contexto | Cuantización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| GLM-5.3-Flash-XSFP4 (este) | 342.856.965.542 | no disponible | XSFP4 + MXFP8 + FP8 + NVFP4 + BF16/F32 | NVIDIA Open Model Agreement | HuggingFace, 245 descargas, 3 likes |
| nvidia/GLM-5.3-Flash-FP4-Local | no disponible (mismo modelo base) | no disponible | NVFP4 + MXFP8 + FP8 + BF16/F32 | NVIDIA Open Model Agreement | HuggingFace (modelo base) |
| zai-org/GLM-5.3-Flash | no disponible | no disponible | BF16 | MIT | HuggingFace (upstream) |

La comparación relevante es entre los tres eslabones de la cadena: el BF16 original de Z.AI (MIT), la destilación cuantizada de NVIDIA (FP4-Local) y este derivado (XSFP4). Frente a FP4-Local, cambia solo el formato de los expertos enrutados (NVFP4 a XSFP4) y las escalas de bloque asociadas, con 0,45 GB más de tamaño total; frente al BF16, mantiene la compresión a 4 bits de los expertos pero con un recuantizado optimizado. No se dispone de datos para comparar con alternativas de otros fabricantes.

## Limitaciones y advertencias

- No es un lanzamiento oficial de NVIDIA ni de Z.AI; es un derivado de terceros (Bizuayeu) y debe tratarse como tal en entornos de producción.
- La licencia aplicable es la NVIDIA Open Model Agreement, no la MIT del modelo upstream; es necesario revisar sus términos para uso comercial y redistribución.
- Idiomas soportados declarados: solo japonés e inglés; el rendimiento en castellano u otros idiomas no está documentado.
- La calibración está sesgada hacia japonés (35%), registros de trabajo locales (25%) y conversación en inglés (15%), lo que puede afectar la fidelidad de la cuantización en otros dominios.
- El calibrado se hizo con routing-only (cada experto ve solo los tokens que le corresponden), lo que puede no representar la distribución real de activaciones en todos los escenarios.
- Riesgo de alucinación: inherente a los modelos de lenguaje; no cuantificado en la información disponible.
- Sesgos conocidos: no documentados en la información proporcionada.
- Limitaciones de contexto: la longitud de contexto del modelo base no se especifica en la información disponible.
- El texto de la model card está truncado en la sección de mediciones, por lo que no se pueden verificar las ganancias de fidelidad frente a FP4-Local.
- Requiere un loader específico para restaurar las escalas de bloque comprimidas en `csf_32x2_v1`; sin él, los pesos no son directamente utilizables.
- El tamaño (178 GB) y el formato NVFP4 limitan el despliegue a hardware especializado; no hay soporte documentado en runtimes de consumo.

## Enlaces

- HuggingFace del modelo: https://huggingface.co/Bizuayeu/GLM-5.3-Flash-XSFP4
- Modelo base (NVIDIA): https://huggingface.co/nvidia/GLM-5.3-Flash-FP4-Local
- Modelo upstream (Z.AI): https://huggingface.co/zai-org/GLM-5.3-Flash
- Repositorio del motor TensorFold: https://github.com/Bizuayeu/GLM-5.3-Flash-DGX-Sparks-BIZ
- Paper OSFP4: https://arxiv.org/abs/2610.08231
- Explicación de NVFP4, OSFP4 y XSFP4 (inglés y japonés): https://claude.ai/artifact/AGG4jdSbUCtX98CExJWv16
- Licencia NVIDIA Open Model Agreement: https://www.nvidia.com/en-us/agreements/enterprise-software/nvidia-open-model-agreement/
