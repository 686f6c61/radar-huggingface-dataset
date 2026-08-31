# INCModel3/GLM-5.1-MXFP4-Mixed-CT-AutoRound

## Resumen

El modelo INCModel3/GLM-5.1-MXFP4-Mixed-CT-AutoRound es una cuantización mixta de baja precisión del modelo GLM-5.1, desarrollado originalmente por Zhipu AI (zai-org). Esta versión ha sido generada por Intel mediante la herramienta AutoRound, que aplica un esquema de redondeo por gradiente descendente con signo (RTN) para reducir el tamaño del modelo sin degradar significativamente su rendimiento. El resultado es un modelo de 753 mil millones de parámetros en formato INT4/FP8 mixto, optimizado para inferencia eficiente en entornos con múltiples GPUs.

La relevancia de este modelo radica en su capacidad para ejecutar un LLM de gran escala con un consumo de memoria reducido, manteniendo una precisión cercana al 99,39 % respecto a la versión BF16 original en tareas de razonamiento y comprensión. Está pensado para desarrolladores e investigadores que necesitan desplegar modelos de gran tamaño en infraestructuras limitadas, o que buscan experimentar con técnicas de cuantización avanzadas. El repositorio incluye resultados de evaluación en GSM8K, MMLU, PIQA y HellaSwag, lo que permite comparar directamente su rendimiento con el modelo sin cuantizar.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE (Mixture of Experts) con atencion dinamica dispersa (DSA) segun etiquetas del repositorio |
| Parametros totales | 753.864.139.008 (~753B) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | MXFP4 (expertos) y MXFP8 (resto de capas), INT4/FP8 mixto |
| Idiomas soportados | ingles, chino |
| Licencia | MIT (para la cuantizacion; el modelo original puede tener otra licencia) |
| Formato de pesos | safetensors (formato llm_compressor) |

## Arquitectura y entrenamiento

El modelo es una cuantizacion post-entrenamiento (PTQ) del GLM-5.1 original, realizada con la herramienta AutoRound de Intel. El esquema de cuantizacion es mixto: la mayoria de las capas se cuantizan a MXFP8, mientras que los expertos de la mezcla (MoE) se cuantizan a MXFP4 (4 bits). Se excluyen de la cuantizacion las capas `lm_head`, `eh_proj`, `shared_head`, `enorm`, `hnorm`, `indexer` y `mlp.gate`. El proceso utiliza el modo `model_free` de AutoRound, que no requiere acceso al dataset de entrenamiento original. No se dispone de informacion sobre el entrenamiento del modelo base (numero de tokens, composicion del dataset, metodos de alineacion como RLHF o DPO), ya que la model card solo documenta el proceso de cuantizacion.

## Capacidades

- Generacion de texto y conversacion en ingles y chino.
- Razonamiento aritmetico y logico, evaluado en GSM8K y MMLU.
- Comprension de lenguaje natural, evaluado en PIQA y HellaSwag.
- Al ser una cuantizacion de GLM-5.1, hereda las capacidades generales del modelo original, aunque no se detallan en la model card.
- No se especifican capacidades de tool calling, agentes, vision, audio ni modo de pensamiento explicito.

## Casos de uso

- Investigacion en cuantizacion de LLMs: el modelo sirve como referencia para estudiar el impacto de esquemas mixtos MXFP4/MXFP8 en el rendimiento de modelos MoE de gran escala, comparando con la version BF16.
- Despliegue en servidores con multiples GPUs: gracias a su cuantizacion, el modelo puede ejecutarse en infraestructuras con 4-8 GPUs de alta gama (A100/H100), reduciendo los requisitos de memoria frente al original.
- Generacion de texto a gran escala: para aplicaciones de redaccion automatica, resumen o traduccion en entornos empresariales donde se requiera alta calidad y se disponga de hardware dedicado.
- Evaluacion de modelos cuantizados: los benchmarks incluidos permiten validar rapidamente si la perdida de precision es aceptable para un caso de uso concreto.
- Desarrollo de sistemas conversacionales multilingue: al soportar ingles y chino, puede integrarse en asistentes virtuales o chatbots bilingues.
- Experimentacion academica: para comparar tecnicas de cuantizacion (AutoRound vs. otras) en un modelo de tamano extremo, sin necesidad de entrenar desde cero.

## Benchmarks y rendimiento

La model card proporciona los siguientes resultados, comparando la configuracion FP8 (completa) con la INT4 mixta (la de este modelo). El promedio relativo al modelo BF16 es del 99,39 %.

| Configuracion | GSM8K | MMLU | PIQA | HellaSwag | Promedio |
|---|---|---|---|---|---|
| FP8 | 0,9682 | 0,8662 | 0,8504 | 0,7406 | 0,8564 |
| INT4 (mixto) | 0,9659 | 0,8543 | 0,8509 | 0,7337 | 0,8512 |

No se han publicado resultados adicionales en la informacion disponible.

## Requisitos de hardware

- Tamano del repositorio: 413,7 GB, lo que indica que los pesos cuantizados ocupan aproximadamente ese espacio en disco.
- VRAM estimada para inferencia: con 753B parametros y cuantizacion mixta (4-8 bits), se estima un uso de memoria de al menos 400-450 GB, por lo que se necesitan multiples GPUs.
- GPUs recomendadas: 6-8 GPUs A100 80GB o H100 80GB, o configuraciones equivalentes con NVLink.
- No cabe en GPUs de consumo (RTX 4090, etc.) debido al tamano.
- Opciones de despliegue: al ser un modelo transformers, puede servirse con vLLM, TGI o TensorRT-LLM, aunque no se mencionan explicitamente en la documentacion.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Cuantizacion | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| GLM-5.1 (original) | 753B | BF16 | no disponible | no especificada | HuggingFace |
| INCModel3/GLM-5.1-MXFP4-Mixed-CT-AutoRound | 753B | MXFP4/MXFP8 | no disponible | MIT (cuantizacion) | HuggingFace |
| INC4AI/GLM-5.1-int4-mixed-AutoRound | 753B | INT4 mixto | no disponible | no especificada | HuggingFace |

No se dispone de datos de rendimiento del modelo INC4AI para comparar directamente.

## Limitaciones y advertencias

- El modelo puede producir informacion factualmente incorrecta; no debe utilizarse como fuente fiable de datos.
- Puede generar contenido ofensivo, sesgado o inapropiado debido a las limitaciones del modelo base y los datasets de ajuste.
- La licencia MIT se aplica a la cuantizacion, pero el modelo original GLM-5.1 puede tener restricciones adicionales; se recomienda revisar su licencia antes de uso comercial.
- No se especifica la longitud de contexto, por lo que se desconoce si hay limitaciones en ventanas largas.
- El rendimiento en tareas fuera de los benchmarks publicados no esta garantizado.
- Se recomienda realizar pruebas de seguridad antes de cualquier despliegue en produccion.

## Enlaces

- [HuggingFace - INCModel3/GLM-5.1-MXFP4-Mixed-CT-AutoRound](https://huggingface.co/INCModel3/GLM-5.1-MXFP4-Mixed-CT-AutoRound)
- [Modelo original GLM-5.1](https://huggingface.co/zai-org/GLM-5.1)
- [Intel AutoRound (GitHub)](https://github.com/intel/auto-round)
- [Paper de AutoRound (arXiv)](https://arxiv.org/abs/2309.05516)
- [Intel Neural Compressor](https://github.com/intel/neural-compressor)
