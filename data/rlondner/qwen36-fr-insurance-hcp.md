# rlondner/qwen36-fr-insurance-hcp

## Resumen

`rlondner/qwen36-fr-insurance-hcp` es un repositorio de pesos en HuggingFace publicado por el usuario rlondner cuyo identificador sugiere un ajuste fino orientado al sector asegurador francés, construido sobre el modelo base Qwen3.6-35B-A3B de Alibaba Qwen. El repositorio contiene 35.951.822.704 parámetros en formato safetensors (71,9 GB, compatible con BF16) y declara licencia Apache 2.0 y pipeline `image-text-to-text`. No incluye model card propia: el README del repositorio reproduce íntegramente la documentación del modelo base, sin describir el dataset, el procedimiento de ajuste ni los objetivos concretos del fine-tuning.

El modelo base es un transformer causal con codificador de visión y arquitectura híbrida que combina capas de atención lineal (Gated DeltaNet) con capas de atención completa (Gated Attention) y una capa Mixture-of-Experts en cada bloque. De los 35B parámetros totales solo se activan aproximadamente 3B por token, lo que sitúa su coste de cómputo por token en el rango de un modelo denso de 3B mientras mantiene la capacidad de representación de un modelo de 35B. La longitud de contexto nativa es de 262.144 tokens, extensible hasta 1.010.000.

Su relevancia actual es doble: por un lado, Qwen3.6 introduce mejoras centradas en *agentic coding* y preservación del razonamiento entre turnos; por otro, este repositorio concreto ejemplifica el patrón de adaptación vertical de un modelo generalista de gran tamaño a un dominio regulado y multilingüe como el seguro en Francia. Conviene señalar que el repositorio no tiene descargas ni valoraciones en el momento de la consulta y que la documentación del ajuste específico está ausente.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal con codificador de visión; híbrida Gated DeltaNet (atención lineal) + Gated Attention + MoE por capa |
| Parametros totales | 35.951.822.704 (35,95B), segun safetensors del repositorio |
| Parametros activos | ~3B por token (8 expertos enrutados + 1 compartido de 256 totales) |
| Longitud de contexto | 262.144 tokens nativos, extensible hasta 1.010.000 |
| Tipos de cuantizacion | no disponible (el repositorio solo publica pesos BF16 en safetensors) |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 (enlace de licencia del base: https://huggingface.co/Qwen/Qwen3.6-35B-A3B/blob/main/LICENSE) |
| Formato de pesos | safetensors (BF16) |
| Dimension oculta | 2048 |
| Numero de capas | 40, con layout 10 × (3 × (Gated DeltaNet → MoE) → 1 × (Gated Attention → MoE)) |
| Vocabulario / embedding | 248.320 tokens (padded) |
| Expertos MoE | 256 expertos, dimension intermedia 512 |
| Cabezas de atencion | Gated DeltaNet: 32 cabezas lineales para V y 16 para QK, dim. 128; Gated Attention: 16 cabezas Q y 2 KV, dim. 256, RoPE dim. 64 |
| Entrenamiento adicional | MTP (multi-token prediction) con multiples pasos |
| Tamano del repositorio | 71,9 GB |
| Libreria | transformers |

## Arquitectura y entrenamiento

La arquitectura es un transformer causal con codificador de visión cuya peculiaridad es la disposición intercalada de dos mecanismos de secuencia. Cada bloque del modelo encadena, en grupos de cuatro capas, tres capas de Gated DeltaNet y una capa de Gated Attention, cada una seguida de su propia capa MoE. La Gated DeltaNet es un mecanismo de atención lineal con estado recurrente (32 cabezas para V y 16 para QK, dimensión de cabeza 128), mientras que la Gated Attention es atención completa con solo 2 cabezas KV frente a 16 cabezas Q y dimensión de cabeza 256, con RoPE de dimensión 64. Esta combinación híbrida es la que permite sostener contextos de 262.144 tokens sin que el coste y la memoria de la caché KV crezcan al ritmo de un transformer denso equivalente: únicamente 10 de las 40 capas mantienen caché de atención completa, y el resto opera con estado recurrente de tamaño constante.

La capa MoE contiene 256 expertos de dimensión intermedia 512, de los cuales se activan 8 enrutados más 1 compartido por token, lo que explica la relación 35B/3B entre parámetros totales y activos. El modelo se entrenó con predicción multi-token (MTP) en varios pasos, técnica que suele emplearse para acelerar la decodificación especulativa. La model card del base distingue las etapas de pre-entrenamiento y post-entrenamiento, pero no publica el número de tokens, la composición del dataset ni si se aplicaron RLHF, DPO u otras técnicas de alineamiento; tampoco se documenta el proceso de ajuste del repositorio `fr-insurance-hcp`. La model card destaca dos capacidades trabajadas explícitamente: flujos de trabajo frontend y razonamiento a nivel de repositorio (*agentic coding*) y la denominada *Thinking Preservation*, una opción para retener el contexto de razonamiento de mensajes históricos y reducir la sobrecarga en desarrollo iterativo.

## Capacidades

- Generación de texto conversacional multi-turno, con pipeline declarado `conversational`.
- Procesamiento de imágenes y texto combinados (`image-text-to-text`), gracias al codificador de visión del modelo base.
- Razonamiento y codificación de agente: la model card del base reporta mejoras específicas en flujos frontend y razonamiento a nivel de repositorio.
- *Thinking Preservation*: retención opcional del contexto de razonamiento de turnos anteriores.
- Predicción multi-token (MTP), orientada a decodificación especulativa y aceleración de la generación.
- Contexto largo: 262.144 tokens nativos, extensibles hasta 1.010.000.
- Capacidades multilingües: no disponible en la información proporcionada.
- Soporte de *tool calling* / *function calling*: no confirmado explícitamente en la información disponible, aunque la orientación a agentes del base lo hace plausible.
- Especialización declarada (por identificador) en el ámbito asegurador francés: sin documentación que detalle el alcance real del ajuste.

## Casos de uso

- Tramitación de siniestros con documentación escaneada: el codificador de visión permitiría extraer datos de partes, facturas y justificantes en imagen, mientras el contexto de 262.144 tokens permite mantener el expediente completo en una única ventana sin troceado.
- Atención al cliente en seguros en francés: conversaciones multi-turno con historial largo de pólizas, coberturas y exclusiones, apoyándose en la opción de preservación del razonamiento para mantener coherencia entre turnos.
- Análisis de condiciones generales y documentación contractual: ingestión de contratos extensos (decenas de miles de tokens) para responder consultas de cobertura con trazabilidad sobre el texto fuente.
- Asistencia a peritaje y valoración: combinación de entrada visual (fotografías de daños) y razonamiento textual para preclasificar siniestros antes de la intervención humana.
- Automatización de agentes internos: si el modelo hereda el soporte de *tool calling* del base, podría orquestar consultas a sistemas de gestión de pólizas, CRM y bases de datos de siniestros en flujos multi-paso.
- Generación y revisión de documentación regulatoria: redacción asistida de comunicaciones y cláusulas en francés con contexto normativo extenso, sujeto a revisión humana por tratarse de un dominio regulado.
- Despliegue en infraestructura propia: al publicarse bajo Apache 2.0 y en safetensors, permite ejecución *on-premise* sin cesión de datos personales a terceros, requisito habitual en el sector asegurador europeo.
- Evaluación comparativa de fine-tunings verticales: útil como caso de estudio de adaptación de un MoE de 35B/3B a un dominio específico con presupuesto de cómputo de inferencia reducido.

## Benchmarks y rendimiento

Los únicos datos publicados corresponden al modelo base Qwen3.6-35B-A3B y aparecen en la model card reproducida en el repositorio. La tabla original está truncada en la información disponible, por lo que Terminal-Bench 2.0 y los apartados posteriores no pueden recogerse. No hay datos de benchmarks específicos del ajuste `fr-insurance-hcp`.

| Benchmark | Qwen3.6-35B-A3B | Qwen3.5-35B-A3B | Qwen3.5-27B | Gemma4-31B | Gemma4-26B-A4B |
|---|---|---|---|---|---|
| SWE-bench Verified | 73,4 | 70,0 | 75,0 | 52,0 | 17,4 |
| SWE-bench Multilingual | 67,2 | 60,3 | 69,3 | 51,7 | 17,3 |
| SWE-bench Pro | 49,5 | 44,6 | 51,2 | 35,7 | 13,8 |
| Terminal-Bench 2.0 | no disponible (tabla truncada) | no disponible | no disponible | no disponible | no disponible |

No se han publicado resultados de MMLU, HumanEval, GSM8K ni de evaluaciones multilingües en la información disponible. Los valores anteriores corresponden a la categoría «Coding Agent» de la model card del base.

## Requisitos de hardware

- Pesos en BF16: aproximadamente 71,9 GB, coherente con los 35,95B parámetros del repositorio safetensors. Requiere al menos 2 × A100 80 GB, 2 × H100 80 GB o una H200 141 GB para dejar margen a la caché KV y a las activaciones.
- Pesos en FP8: aproximadamente 36 GB, encajables en una única A100 80 GB, H100 80 GB o L40S 48 GB (esta última con margen ajustado).
- Cuantización a 4 bits (si se genera externamente; el repositorio no la incluye): en torno a 18-20 GB, potencialmente ejecutable en una RTX 4090 24 GB o RTX 5090 32 GB, con la salvedad de que a contexto muy largo la caché y los búferes pueden superar la VRAM disponible.
- Caché KV: al usar atención completa solo en 10 de las 40 capas, con 2 cabezas KV de dimensión 256, la caché crece de forma marcadamente inferior a la de un transformer denso equivalente; una estimación a partir de la configuración publicada da del orden de 5-6 GB para 262.144 tokens en BF16, antes de considerar el estado recurrente de las capas DeltaNet.
- Cómputo por token: con ~3B parámetros activos, la velocidad de decodificación debería aproximarse a la de un modelo denso de 3B en la misma GPU, aunque el *throughput* real depende del ancho de banda de memoria y de la implementación del enrutador MoE.
- Opciones de despliegue: la model card del base menciona compatibilidad con Hugging Face Transformers, vLLM, SGLang y KTransformers. No se documenta soporte de llama.cpp, Ollama, LM Studio ni TGI para este repositorio, y no se publican pesos GGUF.
- Latencia y throughput concretos: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Activos | Contexto | SWE-bench Verified | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Qwen3.6-35B-A3B (base de este repositorio) | 35B | ~3B | 262.144 nativos / 1.010.000 extendido | 73,4 | Apache 2.0 | Pesos abiertos |
| Qwen3.5-35B-A3B | 35B | ~3B | no disponible | 70,0 | no disponible | Pesos abiertos |
| Qwen3.5-27B | 27B | denso | no disponible | 75,0 | no disponible | Pesos abiertos |
| Gemma4-31B | 31B | denso | no disponible | 52,0 | no disponible | Pesos abiertos |
| Gemma4-26B-A4B | 26B | ~4B | no disponible | 17,4 | no disponible | Pesos abiertos |

Los datos de la comparativa proceden exclusivamente de la tabla de benchmarks de la model card del modelo base, que solo cubre tareas de agente de codificación. No hay información sobre licencias, contextos ni otras capacidades de los modelos comparados, ni comparativas específicas para el dominio asegurador francés.

## Limitaciones y advertencias

- La model card del repositorio es una copia íntegra de la del modelo base; no documenta el dataset de ajuste, la metodología, la evaluación ni las clases o el vocabulario específico del dominio asegurador francés.
- El identificador sugiere especialización en seguro francés («fr-insurance», «hcp»), pero no existe evidencia publicada sobre el alcance, la calidad o el rendimiento de esa especialización. Cualquier uso en producción debería ir precedido de una evaluación propia en el dominio objetivo.
- Riesgo elevado de alucinación en un dominio regulado: no se han publicado métricas de fidelidad, verificación factual ni tasas de error en respuestas sobre coberturas, exclusiones o normativa.
- Cero descargas y cero valoraciones en el momento de la consulta: no existe validación comunitaria de los pesos.
- Idiomas soportados no declarados en los metadatos; aunque el uso previsto sea el francés, no hay confirmación oficial del nivel de competencia lingüística del ajuste.
- Licencia Apache 2.0 en el repositorio, remitiendo a la licencia del modelo base Qwen3.6-35B-A3B. Debe verificarse el cumplimiento de dicha licencia en el uso comercial, incluida cualquier cláusula de atribución aplicable al modelo base.
- Tratamiento de datos personales: el uso sobre documentación aseguradora implica datos de categoría especial (salud, siniestralidad). La licencia del modelo no exime del cumplimiento del RGPD ni de la normativa sectorial francesa.
- Discrepancia en los metadatos: la etiqueta del repositorio indica `qwen3_5_moe` mientras el contenido corresponde a la serie Qwen3.6, lo que puede dificultar la trazabilidad automatizada.
- Sin pesos cuantizados oficiales: cualquier despliegue en GPUs de consumo exige generar cuantizaciones propias y validar la degradación resultante.
- Contexto muy largo: aunque la ventana nativa es de 262.144 tokens, no se han publicado evaluaciones de degradación del rendimiento en contextos extensos para este ajuste.
- La búsqueda web realizada no devolvió ningún resultado relevante sobre el modelo, el autor o el dominio de aplicación; los enlaces obtenidos eran foros no relacionados y se han descartado.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/rlondner/qwen36-fr-insurance-hcp
- Modelo base Qwen3.6-35B-A3B: https://huggingface.co/Qwen/Qwen3.6-35B-A3B
- Licencia del modelo base: https://huggingface.co/Qwen/Qwen3.6-35B-A3B/blob/main/LICENSE
- Blog de Qwen sobre Qwen3.6-35B-A3B: https://qwen.ai/blog?id=qwen3.6-35b-a3b
- Qwen Chat: https://chat.qwen.ai
- Busqueda web: sin resultados relevantes sobre este modelo (los enlaces devueltos correspondian a foros no relacionados y no se incluyen).
