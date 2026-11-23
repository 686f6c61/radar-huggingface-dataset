# Bizuayeu/GLM-5.3-Flash-XSFP4

## Resumen

GLM-5.3-Flash XSFP4 es un checkpoint derivado y cuantizado del modelo multimodal `nvidia/GLM-5.3-Flash-FP4-Local`, publicado por el usuario Bizuayeu. No es un lanzamiento oficial ni de NVIDIA ni de Z.AI: se trata de una requantización de los expertos enrutados de las capas 3 a 44 (y de los expertos de la capa MTP) a partir de los pesos BF16 del modelo original `zai-org/GLM-5.3-Flash-BF16`, aplicando un esquema denominado XSFP4 (eXpert-eXtended OSFP4). El resto de tensores se conserva byte a byte del checkpoint FP4-Local de NVIDIA.

El modelo es un transformer de tipo Mixture-of-Experts (MoE) multimodal con 342.856.965.542 parámetros totales y un repositorio de 178 GB distribuido en 39 archivos safetensors. Está pensado para servir en sistemas GB10 (clase DGX Spark) mediante el motor nativo TensorFold del proyecto GLM-5.3-Flash BIZ, y es el checkpoint por defecto para tamaños de tensor-parallel 3 y 4 a partir de la versión 3.12.0 de dicho motor.

Su relevancia radica en la técnica de cuantización: XSFP4 pliega el suavizado diagonal de OSFP4 dentro de los pesos de los expertos, de modo que en tiempo de inferencia los pesos se computan como NVFP4 estándar sin ningún paso adicional de suavizado, manteniendo la compatibilidad con los kernels NVFP4 existentes. El modelo soporta entrada de imagen y texto (pipeline `image-text-to-text`) y declara idiomas japonés e inglés.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE multimodal (GLM-5.3-Flash), con capa MTP (multi-token prediction) y torre de visión |
| Parametros totales | 342.856.965.542 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | XSFP4 (expertos enrutados, capas 3-44 y capa MTP), NVFP4 (MLP y merger de la torre de visión), MXFP8 (proyecciones KDA, MLP denso, `lm_head`, atención y experto compartido de la capa MTP), FP8 en bloques 128×128 (MLA y expertos compartidos de capas 3-44), BF16/F32 (router, embeddings, norms) |
| Idiomas soportados | ja, en |
| Licencia | NVIDIA Open Model Agreement (derivado); el modelo upstream es MIT |
| Formato de pesos | safetensors (39 archivos, 178 GB) |

## Arquitectura y entrenamiento

El modelo subyacente es un transformer MoE con atención MLA (multi-head latent attention) y módulos KDA, además de una torre de visión con atención MXFP8 y MLP/merger en NVFP4. Incluye una capa MTP (multi-token prediction) que actúa como draft layer para decodificación especulativa. En FP4-Local, solo los expertos enrutados están en 4 bits; el resto de componentes usa precisiones mixtas (MXFP8, FP8 en bloques, BF16/F32).

Este checkpoint no ha sido entrenado: es una requantización. Los expertos enrutados de las capas 3 a 44 y los de la capa MTP se recuantizan a XSFP4 desde los pesos BF16 de `zai-org/GLM-5.3-Flash-BF16`. XSFP4 aplica el método de OSFP4 (Ben David, Meir y Ordentlich, 2026, arXiv:2610.08231), que ajusta conjuntamente un suavizado diagonal y las escalas de bloque para minimizar el error de salida de cada capa, ponderando cada canal de entrada por el valor cuadrático medio de sus activaciones. La innovación clave es que el suavizado de la proyección down se multiplica dentro de las filas de la proyección up, de modo que las proyecciones gate y up no reciben suavizado propio y los pesos resultantes se computan como NVFP4 ordinario con escalas de bloque FP8 E4M3 de tamaño 16, sin suavizado en tiempo de ejecución.

La calibración empleó 512 filas de 2.048 tokens con la siguiente composición: japonés 35% (Nemotron-Post-Training-Dataset-v2 Japanese, Wikipedia japonesa de LLM-jp Corpus v3), registros de trabajo locales 25%, matemáticas 15%, STEM 10% y conversación en inglés 15%, renderizadas con la plantilla de chat a esfuerzo de razonamiento `high` y con calibración solo de routing (cada experto ve únicamente los tokens enrutados a él). Las escalas de bloque de los expertos enrutados se comprimen sin pérdida en formato `csf_32x2_v1` (10,8 GB en lugar de 19,0 GB) y un loader las restaura; las de la capa MTP quedan sin comprimir.

## Capacidades

- Generación de texto y conversación multi-turno con plantilla de chat propia.
- Razonamiento con esfuerzo configurable (la calibración usa `reasoning effort: high`).
- Procesamiento de imagen y texto combinados (pipeline `image-text-to-text`), gracias a la torre de visión.
- Decodificación especulativa mediante la capa MTP incluida en el checkpoint.
- Capacidades multilingües declaradas en japonés e inglés.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades de audio: no disponible en la información proporcionada.

## Casos de uso

- Despliegue en estaciones GB10 (DGX Spark): el checkpoint está diseñado específicamente para servir en sistemas de clase GB10 con el motor TensorFold, siendo el valor por defecto en TP=3 y TP=4 desde la versión 3.12.0 de GLM-5.3-Flash BIZ, lo que permite ejecutar un modelo de 342.000 millones de parámetros en hardware de escritorio de gama alta.
- Asistentes conversacionales en japonés e inglés: la calibración incluye un 35% de japonés y un 15% de conversación en inglés, lo que orienta el modelo hacia diálogos bilingües ja/en con contexto conversacional.
- Análisis de documentos con imagen y texto: al ser un modelo `image-text-to-text`, puede procesar capturas, diagramas o páginas escaneadas junto con instrucciones textuales en un único pipeline.
- Razonamiento matemático y STEM: el 25% de la calibración corresponde a matemáticas y el 10% a STEM, por lo que el modelo está ajustado para tareas de cálculo y problemas técnicos dentro de ese dominio.
- Procesamiento de registros de trabajo y documentación técnica: el 25% de la calibración proviene de registros de trabajo locales, lo que lo hace adecuado para resumir, extraer y transformar documentación interna de desarrollo.
- Investigación en cuantización NVFP4: sirve como referencia práctica para estudiar el impacto de distintas recetas de 4 bits (XSFP4 frente a NVFP4 y Jammed XSFP4) sobre la precisión de los expertos enrutados, que constituyen el 94% del checkpoint.
- Servicio con decodificación especulativa: la capa MTP incluida permite acelerar la generación en motores que la aprovechen, útil en entornos con requisitos de latencia estrictos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: el repositorio ocupa 178 GB en safetensors; se requiere un sistema con al menos esa capacidad de memoria unificada o VRAM para cargar los pesos completos sin cuantización adicional.
- GPU recomendadas: sistemas GB10 (DGX Spark) según el diseño del checkpoint; no se especifican otras GPU en la información disponible.
- Cabe en consumer GPU: no de forma directa; el tamaño de 178 GB excede la VRAM de cualquier GPU de consumo individual. Su destino declarado son sistemas GB10 con memoria unificada.
- Opciones de despliegue: motor TensorFold nativo del proyecto GLM-5.3-Flash BIZ (versiones 3.x); compatible con kernels NVFP4 estándar para los expertos. Soporte de vLLM, llama.cpp, Ollama o TGI: no disponible en la información proporcionada.
- Latencia y throughput: no disponible en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros totales | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Bizuayeu/GLM-5.3-Flash-XSFP4 | 342.856.965.542 | no disponible | XSFP4 + precisiones mixtas | NVIDIA Open Model Agreement | Hugging Face, 430 descargas |
| nvidia/GLM-5.3-Flash-FP4-Local | no disponible | no disponible | NVFP4 + precisiones mixtas | NVIDIA Open Model Agreement | Hugging Face (modelo base) |
| Bizuayeu/GLM-5.3-Flash-Jammed-XSFP4 | no disponible | no disponible | Jammed XSFP4 | no disponible | Hugging Face (variante del mismo autor) |
| zai-org/GLM-5.3-Flash-BF16 | no disponible | no disponible | BF16 | MIT | Hugging Face (modelo upstream) |

## Limitaciones y advertencias

- No es un lanzamiento oficial de NVIDIA ni de Z.AI; es un derivado de un tercero y debe evaluarse como tal.
- La licencia del derivado es la NVIDIA Open Model Agreement, no la MIT del modelo upstream; es necesario revisar sus términos para uso comercial.
- Solo se declaran los idiomas japonés e inglés; el rendimiento en castellano u otros idiomas no está garantizado ni documentado.
- Al ser una requantización a 4 bits de los expertos, existe una pérdida de precisión respecto al modelo BF16, aunque el autor afirma que XSFP4 reduce la brecha de FP4-Local.
- La calibración está sesgada hacia japonés (35%) y registros de trabajo locales (25%), lo que puede afectar al comportamiento en dominios no representados.
- Riesgo de alucinación: no cuantificado en la información disponible; aplicable el riesgo habitual de los modelos generativos de gran tamaño.
- La longitud de contexto no se especifica, lo que impide planificar cargas de trabajo con ventanas largas sin verificación previa.
- El checkpoint depende de un loader específico para restaurar las escalas de bloque comprimidas en `csf_32x2_v1`; no es un safetensors estándar cargable por cualquier runtime.
- El soporte de tool calling, agentes y otras capacidades avanzadas no está documentado y no debe asumirse en producción.

## Enlaces

- Hugging Face: https://huggingface.co/Bizuayeu/GLM-5.3-Flash-XSFP4
- Modelo base: https://huggingface.co/nvidia/GLM-5.3-Flash-FP4-Local
- Modelo upstream BF16: https://huggingface.co/zai-org/GLM-5.3-Flash-BF16
- Variante Jammed XSFP4: https://huggingface.co/Bizuayeu/GLM-5.3-Flash-Jammed-XSFP4
- Repositorio del motor: https://github.com/Bizuayeu/GLM-5.3-Flash-DGX-Sparks-BIZ
- Paper OSFP4: https://arxiv.org/abs/2610.08231
- Explicación de formatos NVFP4, OSFP4 y XSFP4: https://claude.ai/artifact/AGG4jdSbUCtX98CExJWv16
- Licencia NVIDIA Open Model Agreement: https://www.nvidia.com/en-us/agreements/enterprise-software/nvidia-open-model-agreement/
