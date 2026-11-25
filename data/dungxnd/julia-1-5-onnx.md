# DungxND/Julia-1.5-ONNX

## Resumen

Julia 1.5-ONNX es una exportación cuantizada a ONNX del modelo `SupersonicLabs/Julia-1.5`, un clasificador de texto basado en un encoder `mmBERT-small` de 144 millones de parámetros con una cabeza de decisión de 2 capas en FP32. Lo publica el usuario DungxND bajo licencia Apache-2.0 y su propósito es ofrecer una versión autocontenida, en un único fichero, lista para inferencia en entornos de producción sin dependencias de operadores propietarios ni ficheros de pesos externos.

El modelo está diseñado para tareas de decisión sobre opciones múltiples: recibe una pregunta, un conjunto de opciones candidatas y un tipo de consulta (`choice`, `score` o `noul`), y devuelve logits por opción. Esta formulación lo aleja de la clasificación de texto convencional y lo acerca a los modelos de decisión tipo "scorer", útiles en sistemas de selección, ranking o evaluación de respuestas.

La relevancia actual del artefacto reside en su empaquetado: usa exclusivamente operadores estándar de ONNX Opset 23 (IR 11), con cuantización de pesos INT8 en bloques de 32 mediante `DequantizeLinear`, lo que permite desplegarlo en runtimes ONNX Runtime estándar sin necesidad de plugins de proveedor. El resultado es un fichero de 160,83 MB con paridad de argmax verificada al 100 % frente al modelo PyTorch original en 12 casos de prueba.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (mmBERT-small) + cabeza de decisión de 2 capas |
| Parametros totales | 144 M (encoder) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | INT8 block-wise (block_size=32) en pesos del encoder; embeddings INT8 por fila con escala FP16; cabeza de decisión, type embedding, scorer, norms y temperature en FP32 |
| Idiomas soportados | en, pt, multilingual |
| Licencia | Apache-2.0 |
| Formato de pesos | ONNX (Opset 23, IR 11), fichero único `model.onnx` |

## Arquitectura y entrenamiento

El modelo subyacente es `SupersonicLabs/Julia-1.5`, un encoder `mmBERT-small` de 144 millones de parámetros con 22 capas de encoder y una cabeza de decisión de 2 capas en FP32. La formulación de la tarea es de decisión sobre opciones: la entrada se compone de un token `<bos>`, el par `"{qtype} question: {question}"`, un `<eos>`, una secuencia de opciones precedidas por `<mask>` (token id 4), un `<eos>`, el estado, otro `<eos>`, y una máscara de atención que distingue tokens válidos de padding. La salida son logits por opción.

La exportación ONNX aplica cuantización híbrida: los pesos de las 22 capas lineales del encoder se cuantizan a INT8 en bloques de 32 mediante `DequantizeLinear` estándar de Opset 23, mientras que las activaciones permanecen en FP32 para evitar la distorsión que los valores atípicos de ModernBERT provocarían en una cuantización totalmente estática. Los embeddings de token (256.000 × 384) se cuantizan simétricamente por fila a INT8 con escala FP16, y solo se desquantizan los tokens efectivamente recogidos mediante `Gather`. La cabeza de decisión, el type embedding, el scorer, las normas y la temperatura se mantienen en FP32, replicando la regla del modelo original.

No se dispone de información sobre el dataset de entrenamiento, el número de tokens, la composición de los datos ni si se aplicaron técnicas de RLHF o DPO. La model card del exportador no documenta el proceso de entrenamiento del modelo base.

## Capacidades

- Clasificación de texto formulada como decisión sobre opciones múltiples: recibe una pregunta y un conjunto de opciones y devuelve logits por opción.
- Tres modos de consulta diferenciados por el parámetro `qtype`: `0 = choice`, `1 = score`, `2 = noul`.
- Procesamiento por lotes con padding dinámico (`attention_mask` y `marker_mask`).
- Soporte multilingüe declarado para inglés, portugués y categoría multilingüe.
- Inferencia en un único fichero ONNX sin operadores de proveedor ni ficheros `.onnx.data` externos.
- No se documentan capacidades de generación de texto, código, matemáticas, visión, tool calling ni razonamiento multi-paso.

## Casos de uso

- Selección de respuesta en sistemas de preguntas y respuestas: dado un conjunto de respuestas candidatas, el modelo puntúa cada una y permite elegir la mejor mediante argmax sobre los logits de salida.
- Ranking de opciones en asistentes conversacionales: el modo `score` permite ordenar alternativas generadas por otro modelo y filtrar las menos plausibles antes de mostrarlas al usuario.
- Evaluación automática de respuestas en pipelines de anotación: el modo `noul` (sin opciones válidas) puede emplearse para detectar consultas sin respuesta correcta entre las candidatas.
- Moderación o filtrado por elección: clasificar contenido en categorías mutuamente excluyentes presentadas como opciones, aprovechando la cabeza de decisión.
- Despliegue en entornos con recursos limitados: al ser un fichero ONNX de 160,83 MB con cuantización INT8, cabe en CPU y en GPUs de gama baja, lo que permite servirlo en contenedores ligeros o dispositivos edge.
- Integración en servicios con ONNX Runtime: al usar solo Opset 23 estándar, se puede desplegar en infraestructura que no admita extensiones de proveedor ni operadores personalizados.
- Procesamiento multilingüe en inglés y portugués: aplicable a tareas de decisión en productos dirigidos a esos mercados sin necesidad de un modelo por idioma.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. La model card únicamente reporta pruebas de paridad frente al modelo PyTorch original:

| Prueba | Casos | Acuerdo de argmax | Delta máximo de probabilidad | Delta medio |
|---|---:|---:|---:|---:|
| Fila única | 12 | 12/12 (100 %) | 0,02448 | 0,00892 |
| Lote con padding dinámico | 12 | 12/12 (100 %) | 0,02450 | 0,00892 |

Las pruebas se realizaron sobre el `reference.json` del modelo original más sondas multilingües (en/vi) de los modos `choice`, `noul` y `score`.

## Requisitos de hardware

- VRAM estimada para inferencia: el fichero `model.onnx` ocupa 160,83 MB; con activaciones FP32 y overhead de runtime, el consumo típico se sitúa en el rango de cientos de MB, aunque no se dispone de cifras oficiales.
- GPU recomendadas: no se especifican; por tamaño, cualquier GPU con al menos 1-2 GB de VRAM libre es suficiente. Una RTX 4090, A100 o H100 están sobradamente dimensionadas.
- Cabe en GPU de consumo: sí, en cualquier GPU consumer moderna (GTX 1650, RTX 3060, RTX 4090, etc.), así como en CPU.
- Opciones de despliegue: ONNX Runtime (recomendado, al ser un export ONNX estándar), ONNX Runtime Web, servidores de inferencia compatibles con ONNX. No se documenta compatibilidad con vLLM, llama.cpp, Ollama ni TGI, que no son runtimes para este tipo de modelo.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la documentación proporcionada. El modelo base `SupersonicLabs/Julia-1.5` sería la referencia natural, pero no se han encontrado datos de rendimiento ni especificaciones completas de terceros alternativos en la información disponible.

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| DungxND/Julia-1.5-ONNX | 144 M | no disponible | Apache-2.0 | ONNX (INT8 block-32) | Export cuantizado, fichero único |
| SupersonicLabs/Julia-1.5 | 144 M | no disponible | Apache-2.0 | PyTorch (FP32) | Modelo base original |
| Alternativas | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- El modelo está diseñado exclusivamente para decisión sobre opciones; no es un modelo generativo y no debe emplearse para tareas de generación de texto libre.
- Los idiomas declarados son inglés, portugués y multilingüe, pero las pruebas de paridad incluyen vietnamita (`vi`), lo que sugiere cobertura más amplia que la declarada; aun así, no hay evaluación sistemática por idioma.
- La cuantización INT8 introduce un delta máximo de probabilidad de 0,02448 frente al modelo FP32; aunque el argmax coincide en el 100 % de los casos probados, en distribuciones de probabilidad muy ajustadas podría producirse un cambio de decisión.
- No se documentan sesgos conocidos, pero al no publicarse la composición del dataset de entrenamiento no es posible evaluar sesgos de dominio, género, etnia o idioma.
- Riesgo de alucinación: al ser un modelo de clasificación/decisión, el riesgo se manifiesta como asignación de alta probabilidad a opciones incorrectas cuando la pregunta queda fuera de la distribución de entrenamiento.
- No se especifica la longitud máxima de contexto soportada; conviene validar empíricamente el truncado antes de usarlo en producción con entradas largas.
- La licencia Apache-2.0 permite uso comercial, pero se recomienda verificar la licencia del modelo base `SupersonicLabs/Julia-1.5` y de los datos de entrenamiento originales.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y fue creado el 25 de noviembre de 2026; se trata de un artefacto reciente y sin validación comunitaria.
- El autor del export es un usuario individual (DungxND), no la organización que desarrolló el modelo base; la paridad reportada es responsabilidad del exportador.

## Enlaces

- Repositorio Hugging Face del export: https://huggingface.co/DungxND/Julia-1.5-ONNX
- Modelo base: https://huggingface.co/SupersonicLabs/Julia-1.5
- Especificación ONNX Opset 23: no disponible en la información proporcionada
- Paper, blog o demo del modelo base: no disponible en la información proporcionada
