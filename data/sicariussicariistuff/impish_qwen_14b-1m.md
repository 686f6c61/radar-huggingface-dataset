# SicariusSicariiStuff/Impish_QWEN_14B-1M

## Resumen

Impish_QWEN_14B-1M es un ajuste fino (fine-tune) del modelo Qwen2.5-14B-Instruct-1M desarrollado por el usuario independiente SicariusSicariiStuff y publicado en HuggingFace el 27 de enero de 2025. Se trata de un modelo de lenguaje de 14.770.033.664 parámetros (aproximadamente 14,8 mil millones) con una ventana de contexto de un millón de tokens, heredada directamente de su modelo base. Su propósito declarado es el role-play, la escritura creativa y tareas generales, con un nivel de censura bajo y una persona deliberadamente traviesa y juguetona ("impish").

El modelo se distribuye bajo licencia Apache 2.0, lo que permite uso comercial sin restricciones adicionales más allá de las que impone la propia licencia. El autor afirma que fue el primer fine-tune publicado sobre Qwen2.5-14B-Instruct-1M y que presenta mejores resultados en benchmarks que el modelo base, aunque no se aportan tablas de benchmarks completas en la información disponible. La relevancia actual del modelo radica en su combinación poco habitual de contexto de un millón de tokens con un ajuste orientado a personaje y baja censura, algo poco frecuente en modelos de este tamaño.

El repositorio ocupa 29,6 GB e incluye pesos en formato safetensors, además de múltiples cuantizaciones publicadas en repositorios separados (GGUF, EXL2, FP8 y variantes para ARM). El modelo está etiquetado únicamente para inglés.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Qwen2, derivada de Qwen2.5-14B-Instruct-1M) |
| Parametros totales | 14.770.033.664 |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 1.000.000 tokens (heredada del modelo base) |
| Tipos de cuantizacion | FP16, FP8, GGUF (static, iMatrix, High-Attention, iMatrix-High-Attention), EXL2 (3.5, 4.0, 5.0, 6.0, 7.0 y 8.0 bpw), Q4_0 y Q4_0_High-Attention para ARM |
| Idiomas soportados | Inglés (etiqueta `en`) |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (original), GGUF, EXL2, FP8 |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Qwen2.5-14B-Instruct-1M: un transformer decoder-only denso de aproximadamente 14,8 mil millones de parámetros con atención completa y soporte nativo de contexto largo de hasta un millón de tokens. El fine-tune no modifica la arquitectura, sino que ajusta los pesos sobre el modelo base mediante un proceso de entrenamiento supervisado (SFT) del que no se detallan hiperparámetros, número de tokens ni composición exacta del dataset. El autor menciona que se añadieron "datos experimentales" con el objetivo de neutralizar parcialmente la ideología incorporada por defecto en modelos entrenados con RLHF, lo que sugiere el uso de datasets de role-play y escritura creativa, posiblemente con formatos de rol de internet.

No se especifica si se emplearon técnicas como DPO, RLHF adicional o decodificación especulativa. La innovación técnica destacable es la preservación del contexto de un millón de tokens del modelo base mientras se aplica un ajuste de personaje, algo que el autor presenta como el primer fine-tune de Qwen2.5-14B-Instruct-1M. Tampoco se documentan detalles sobre el tokenizador, la composición lingüística del corpus de ajuste ni el número de épocas.

## Capacidades

- Generación de texto en inglés con un estilo de personaje travieso, burlón y juguetón, orientado a role-play y escritura creativa.
- Role-play de formato de internet, con párrafos de longitud media según el autor.
- Razonamiento general y tareas de asistente, heredadas de Qwen2.5-14B-Instruct-1M.
- Manejo de contextos extremadamente largos (hasta un millón de tokens), útil para documentos extensos o conversaciones multi-turno muy largas.
- Baja censura declarada, con alta conformidad a las instrucciones del usuario.
- Capacidad de seguir instrucciones de sistema y de personaje con ajustes de muestreo recomendados por el autor.
- No se documenta soporte explícito de tool calling, function calling, agentes multi-paso, visión, audio ni modo de razonamiento (thinking mode) en la información disponible.

## Casos de uso

- Role-play conversacional de largo recorrido: el modelo puede mantener una sesión de rol con un personaje consistente durante cientos de miles de tokens gracias a su ventana de un millón, algo útil para campañas narrativas extensas o simulaciones de personajes con memoria de largo plazo.
- Escritura creativa y narrativa serializada: adecuado para generar capítulos, diálogos y tramas con un tono desenfadado y baja censura, manteniendo coherencia sobre un borrador completo de novela introducido en el contexto.
- Asistente de personaje en aplicaciones de entretenimiento: integrable en chatbots de ficción interactiva donde se requiera una personalidad definida y baja restricción de contenido, con la advertencia de moderar la salida en producto final.
- Análisis de documentos largos con tono desenfadado: puede resumir o comentar contratos, informes o transcripciones de gran extensión aprovechando el contexto de un millón de tokens, aunque su ajuste de personaje puede sesgar el registro.
- Generación de diálogos para videojuegos o guiones: útil para prototipar árboles de diálogo de personajes con personalidad marcada, con la ventaja de poder pasar el guion completo como contexto.
- Experimentación en investigación sobre alineación y censura: su naturaleza de fine-tune con "datos experimentales" para neutralizar sesgos lo convierte en un objeto de estudio para comparar comportamientos frente al modelo base en tareas de conformidad y sesgo.
- Base para nuevos fine-tunes de rol: al ser un ajuste sobre Qwen2.5-14B-Instruct-1M con licencia Apache 2.0, puede servir como punto de partida para ajustes posteriores en dominios creativos.

## Benchmarks y rendimiento

El autor declara un resultado de **78,68 en IFEval** para este modelo de 14B orientado a role-play, y afirma que supera al modelo base Qwen2.5-14B-Instruct-1M en benchmarks, pero no se aportan tablas detalladas ni resultados de MMLU, HumanEval, GSM8K u otros. El score UGI aparece como pendiente en la model card.

| Benchmark | Resultado | Notas |
|---|---|---|
| IFEval | 78,68 | Dato aportado por el autor en la model card |
| UGI | Pendiente | No publicado |
| MMLU, HumanEval, GSM8K | No disponible | No se han publicado resultados en la información disponible |

No se han publicado resultados de benchmarks completos en la información disponible más allá del dato de IFEval.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16: aproximadamente 29,6 GB solo para pesos, por lo que se necesitan alrededor de 32 GB o más contando caché KV; encaja en una A100 40GB, A100 80GB, H100 o dos RTX 4090 de 24 GB.
- Cuantización de 8 bits (FP8 o EXL2 8.0 bpw): en torno a 15-16 GB de VRAM, cabe en una RTX 4090 de 24 GB con margen para contexto moderado.
- Cuantización de 4 bits (GGUF Q4, EXL2 4.0 bpw): en torno a 8-10 GB, cabe en GPUs de consumo como RTX 3060 12 GB, RTX 4070, RTX 4080 o RTX 4090.
- Cuantización Q4_0 para ARM: pensada para despliegue en dispositivos móviles o Apple Silicon.
- El contexto de un millón de tokens exige mucha memoria para la caché KV; en la práctica, usar la ventana completa requiere GPUs de 80 GB o técnicas de atención eficiente y cuantización de la caché.
- Opciones de despliegue: llama.cpp y Ollama para GGUF, vLLM y TGI para safetensors/FP16, ExLlamaV2 para EXL2, y TensorRT-LLM para FP8.
- No se dispone de datos de latencia ni throughput medidos en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Enfoque | Disponibilidad |
|---|---|---|---|---|---|
| Impish_QWEN_14B-1M | 14,77B | 1.000.000 | Apache 2.0 | Role-play, creatividad, baja censura | HuggingFace, múltiples cuantizaciones |
| Qwen2.5-14B-Instruct-1M | 14,77B | 1.000.000 | Apache 2.0 | Asistente general, alineado | HuggingFace, oficial |
| Qwen2.5-14B-Instruct | 14,77B | 32.768 | Apache 2.0 | Asistente general | HuggingFace, oficial |
| Mistral-Nemo-Instruct-2407 | 12B | 128.000 | Apache 2.0 | Asistente general multilingüe | HuggingFace, oficial |

Frente al modelo base, Impish prioriza persona y baja censura sobre alineación estándar, y según el autor mejora en benchmarks, aunque no se aportan datos completos que lo confirmen. Frente a Mistral-Nemo, el contexto es mucho mayor (un millón frente a 128.000) pero el soporte idiomático es solo inglés, mientras que Nemo es multilingüe. No se dispone de comparativas de rendimiento publicadas con otros fine-tunes de role-play en la información proporcionada.

## Limitaciones y advertencias

- El modelo está etiquetado únicamente para inglés; su rendimiento en castellano u otros idiomas no está garantizado.
- La baja censura declarada implica riesgo de generar contenido inapropiado, ofensivo o no seguro para productos dirigidos al público general; requiere moderación externa en producción.
- Riesgo de alucinación inherente a los modelos de 14B, especialmente en tareas factuales y con contextos muy largos donde la atención puede degradarse.
- El ajuste de personaje puede contaminar respuestas en tareas de asistente serio; el autor recomienda configuraciones de muestreo distintas para modo asistente y modo role-play.
- Aunque la licencia es Apache 2.0, conviene revisar las condiciones del modelo base Qwen2.5-14B-Instruct-1M y las políticas de uso de Qwen.
- El uso del contexto completo de un millón de tokens tiene un coste elevado de memoria y puede reducir la calidad de recuperación en el centro del contexto.
- Modelo con pocas descargas (108) y validación limitada por parte de la comunidad; los benchmarks declarados por el autor no han sido verificados de forma independiente.
- No se documentan evaluaciones de sesgo, toxicidad ni robustez adversarial.

## Enlaces

- HuggingFace del modelo: https://huggingface.co/SicariusSicariiStuff/Impish_QWEN_14B-1M
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-14B-Instruct-1M
- GGUF estático: https://huggingface.co/SicariusSicariiStuff/Impish_QWEN_14B-1M_GGUF
- GGUF iMatrix: https://huggingface.co/SicariusSicariiStuff/Impish_QWEN_14B-1M_iMatrix
- GGUF High-Attention: https://huggingface.co/SicariusSicariiStuff/Impish_QWEN_14B-1M_GGUF_HA
- GGUF iMatrix High-Attention: https://huggingface.co/SicariusSicariiStuff/Impish_QWEN_14B-1M_HA_NL
- EXL2 3.5 bpw: https://huggingface.co/SicariusSicariiStuff/Impish_QWEN_14B-1M-3.5bpw
- EXL2 4.0 bpw: https://huggingface.co/SicariusSicariiStuff/Impish_QWEN_14B-1M-4.0bpw
- EXL2 5.0 bpw: https://huggingface.co/SicariusSicariiStuff/Impish_QWEN_14B-1M-5.0bpw
- EXL2 6.0 bpw: https://huggingface.co/SicariusSicariiStuff/Impish_QWEN_14B-1M-6.0bpw
- EXL2 7.0 bpw: https://huggingface.co/SicariusSicariiStuff/Impish_QWEN_14B-1M-7.0bpw
- EXL2 8.0 bpw: https://huggingface.co/SicariusSicariiStuff/Impish_QWEN_14B-1M-8.0bpw
- FP8: https://huggingface.co/SicariusSicariiStuff/Impish_QWEN_14B-1M_FP8
- ARM Q4_0: https://huggingface.co/SicariusSicariiStuff/Impish_QWEN_14B-1M_ARM
- ARM Q4_0 High-Attention: https://huggingface.co/SicariusSicariiStuff/Impish_QWEN_14B-1M_ARM_HA
- Apoyo al autor: https://ko-fi.com/sicarius
