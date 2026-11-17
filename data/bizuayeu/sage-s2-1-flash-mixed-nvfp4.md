# Bizuayeu/Sage-S2.1-Flash-Mixed-NVFP4

## Resumen

Sage-S2.1-Flash Mixed NVFP4 es un checkpoint derivado y cuantizado de `internlm/Sage-S2.1-Flash`, publicado por el usuario Bizuayeu en Hugging Face. No se trata de un modelo entrenado desde cero ni de un lanzamiento oficial de ningún laboratorio, sino de una reempaquetado de precisión mixta pensado para servir el modelo original en dos sistemas GB10 (clase DGX Spark). El modelo base tiene la forma de GLM-5.3-Flash: 45 capas de decodificador más una capa MTP de borrador, con 288 expertos enrutados por capa a partir de la capa 3, y un total de 342.874.152.234 parámetros.

La contribución del checkpoint es de naturaleza exclusivamente de compresión: los expertos enrutados de las capas 3 a 44 y de la capa MTP se almacenan en NVFP4 (códigos E2M1 de 4 bits con escala E4M3 cada 16 pesos), mientras que la atención MLA y los expertos compartidos conservan los bytes de la release oficial FP8, las MLP densas de las capas 0 a 2 se guardan en MXFP8 y la atención KDA, `lm_head`, embeddings y torre de visión permanecen en BF16. El resultado ocupa 183,8 GB en 144 ficheros, frente a los 643 GB del checkpoint BF16 y los 328,5 GB de la release FP8 oficial.

Es relevante ahora porque demuestra una ruta viable para desplegar un modelo de escala GLM-5 en hardware de clase estación de trabajo con dos GB10, a costa de un motor de inferencia específico (TensorFold 1.2.9) y de un conjunto de decisiones de precisión mixta declaradas en la tabla `MIXED_PRECISION` de ModelOpt. La licencia es MIT, pero el checkpoint no está respaldado por Shanghai AI Laboratory, InternLM, Z.AI ni NVIDIA.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer con decodificador de 45 capas, atención híbrida (MLA en 11 capas y capa MTP, KDA en 34 capas), MoE con 288 expertos enrutados por capa desde la capa 3, más capa MTP de borrador y torre de visión |
| Parámetros totales | 342.874.152.234 |
| Parámetros activos | no disponible |
| Longitud de contexto | 40.960 tokens (ventana configurada en el despliegue TP=2 descrito por el autor) |
| Tipos de cuantización | NVFP4 (E2M1 con escala E4M3 cada 16 pesos) en expertos enrutados; FP8 E4M3 en bloques 128×128 en atención MLA y expertos compartidos; MXFP8 (E4M3 con escala UE8M0 cada 32 pesos) en MLP densas de capas 0-2; BF16/F32 en atención KDA, `lm_head`, embeddings, router, `kv_b`, indexers, norms y torre de visión |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | safetensors (133 de los 144 ficheros); escalas de expertos enrutados almacenadas como `csf_32x2_v1` |

## Arquitectura y entrenamiento

El modelo base sigue el diseño de GLM-5.3-Flash: un decodificador de 45 capas que combina dos mecanismos de atención distintos. Once capas y la capa MTP usan MLA (Multi-head Latent Attention) con proyecciones `q_a`, `q_b`, `kv_a` y `o`, mientras que 34 capas emplean KDA (atención de la familia descrita en el checkpoint). La capa 3 en adelante incorpora un bloque MoE con 288 expertos enrutados por capa, que concentran el 94,7% de los pesos en BF16. Las tres primeras capas usan MLP densas. Existe además una capa MTP (Multi-Token Prediction) que actúa como borrador para decodificación especulativa, y una torre de visión que habilita la entrada de imágenes.

Este checkpoint concreto no entrena nada: es una re-cuantización pura de pesos. Los expertos enrutados se cuantizaron a NVFP4 desde BF16 sin datos de calibración y sin suavizado; para cada bloque de 16 pesos se eligió la escala E4M3 con el menor error cuadrático entre 25 valores vecinos, partiendo de diez pasos por debajo y catorce por encima del primer valor que alcanza el peso máximo del bloque dividido por 6, sin estadísticas de activación. La atención MLA y los expertos compartidos son copia byte a byte de la release FP8 oficial (revisión `716e6436905650b7be93e1b7dedfb0bb95afd3a3`), cuyo tensor `weight_scale_inv` se almacena aquí como `weight_scale`. Las MLP densas de las capas 0 a 2 se rehicieron en MXFP8 desde BF16 porque el loader de TensorFold en el commit `077998f7d9` solo acepta NVFP4 o MXFP8 para esas capas. El resto (atención KDA, `lm_head`, embeddings, router, `kv_b`, indexers, norms y torre de visión) procede del checkpoint BF16 en la revisión `76f4513db7464485605a002a06a6190de0460574`.

La innovación técnica destacable no está en el modelo sino en el empaquetado: la convivencia de cuatro precisiones distintas en un mismo checkpoint, declaradas mediante la tabla `MIXED_PRECISION` de ModelOpt y con las escalas de los expertos enrutados en el formato propietario `csf_32x2_v1`, que solo TensorFold sabe leer. El autor reporta que redondear el checkpoint BF16 sobre las escalas de la release FP8 reproduce byte a byte los códigos de las 177 matrices de 8 bits, lo que confirma que las partes de 8 bits son un redondeo plano de BF16 sin reentrenamiento.

## Capacidades

- Generación de texto y conversación multi-turno, con pipeline declarado `image-text-to-text`.
- Entrada de imágenes a través de la torre de visión, conservada en BF16. El autor verificó dos imágenes de prueba con respuesta correcta en TP=2, sin medición sistemática.
- Razonamiento multi-paso y decodificación especulativa mediante la capa MTP de borrador (desactivada en la medición de throughput reportada).
- Capacidades multilingües: no disponibles en la información proporcionada.
- Tool calling y function calling: no disponibles en la información proporcionada.
- Soporte de agentes: no disponible en la información proporcionada.
- Modo de pensamiento explícito: no disponible en la información proporcionada.

## Casos de uso

- Despliegue de un modelo de escala GLM-5 en dos GB10: el caso de uso central para el que se construyó el checkpoint. Con TP=2 y una ventana de 40.960 tokens, el autor reporta 92,51 GiB de modelo en la primera máquina y entre 8,6 y 8,7 GiB libres en cada equipo en el peor caso, lo que permite servir el modelo con margen mínimo pero funcional.
- Inferencia de texto interactiva en estaciones de trabajo: 19,9 tok/s con los borradores desactivados y 6,7 s hasta el primer token de un prompt en frío de 9.600 tokens. Adecuado para asistentes de código o análisis documental donde la latencia de primer token importa más que el throughput sostenido.
- Procesamiento de documentos largos: la ventana de 40.960 tokens permite ingerir contratos, informes técnicos o expedientes completos en una sola pasada, siempre que el prompt quepa en memoria junto con el modelo.
- Análisis de imágenes con texto asociado: la torre de visión en BF16 permite tareas de descripción, extracción de datos de capturas o clasificación visual, aunque el autor solo validó dos imágenes y no publicó métricas.
- Evaluación comparativa de precisión mixta: sirve como referencia práctica para estudiar la degradación de un modelo grande al cuantizar solo los expertos enrutados a 4 bits, con KL 0,0426 y acuerdo top-1 del 93,56% frente a BF16.
- Investigación en decodificación especulativa: la presencia de la capa MTP permite experimentar con borradores y medir la ganancia de throughput frente a los 19,9 tok/s sin borradores.
- Prototipado de pipelines multimodales en hardware de gama estación de trabajo: para equipos que ya disponen de dos GB10 y quieren evitar depender de clústeres con A100/H100.

## Benchmarks y rendimiento

El autor no publica resultados de benchmarks estándar (MMLU, HumanEval, GSM8K). La única evaluación numérica es la fidelidad frente a BF16, medida en PyTorch sobre 128 documentos:

| Métrica | Valor |
|---|---|
| Divergencia KL frente a BF16 | 0,0426 |
| Acuerdo top-1 | 93,56% |
| NLL relativo a BF16 | +1,05% |
| Throughput en TP=2 (sin borradores) | 19,9 tok/s |
| Tiempo hasta primer token (prompt frío de 9.600 tokens) | 6,7 s |
| Memoria del modelo en la primera máquina (TP=2) | 92,51 GiB |
| Memoria libre por máquina en el peor caso | 8,6–8,7 GiB |

No se han publicado resultados de benchmarks de tareas en la información disponible.

## Requisitos de hardware

- VRAM estimada: el checkpoint ocupa 183,8 GB en disco; en TP=2 el autor reporta 92,51 GiB de modelo en la primera máquina, lo que implica un reparto aproximadamente simétrico entre los dos nodos.
- GPU recomendadas: dos GB10 (clase DGX Spark). El autor indica explícitamente que no es viable en una sola GB10.
- Cabe en GPU de consumo: no. El tamaño y el esquema de reparto TP=2 lo excluyen de RTX 4090, RTX 5090 o similares.
- Opciones de despliegue: TensorFold 1.2.9 (compilado desde el tag `6b9de69510`) y `main` en `077998f7d9`. El autor advierte que no probó ningún otro loader; el `deployment_guide.md` del modelo fuente cubre LMDeploy, vLLM y SGLang, pero solo para las releases oficiales, no para este checkpoint.
- Latencia y throughput: 19,9 tok/s con borradores desactivados y 6,7 s hasta el primer token en un prompt frío de 9.600 tokens, en TP=2 sobre dos GB10.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Precisión de pesos | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Sage-S2.1-Flash Mixed NVFP4 (este) | 342,9 B | 40.960 tokens (config. TP=2) | Mixta: NVFP4 + FP8 + MXFP8 + BF16 | MIT | Hugging Face, requiere TensorFold |
| internlm/Sage-S2.1-Flash (BF16) | 342,9 B | no disponible | BF16 | MIT | Hugging Face, 643 GB |
| internlm/Sage-S2.1-Flash-FP8 | 342,9 B | no disponible | FP8 | MIT | Hugging Face, 328,5 GB |
| GLM-5.3-Flash Jammed XSFP4 NZ5 | no disponible | no disponible | XSFP4 con escalas cada 32 pesos y calibración | no disponible | Anunciado por el mismo autor, no publicado |

El modelo base y su variante FP8 son las alternativas directas; este checkpoint es la única variante que cabe en dos GB10. La comparación de rendimiento frente a otros modelos de la misma categoría (GLM-5.3-Flash original, Qwen, DeepSeek) no está disponible en la información proporcionada.

## Limitaciones y advertencias

- No es un lanzamiento oficial: el autor declara explícitamente que no está respaldado por Shanghai AI Laboratory, InternLM, Z.AI ni NVIDIA.
- Dependencia de motor: las escalas de los expertos enrutados usan el formato `csf_32x2_v1` y la mezcla de precisiones se declara en la tabla `MIXED_PRECISION` de ModelOpt. Solo TensorFold lee ambos; ningún otro loader fue probado.
- No viable en una sola GB10: en TP=2 la primera máquina ya aloja 92,51 GiB de modelo.
- Falta el proyector de entrada científica: la carpeta `projectors/` del repositorio fuente no está incluida en este checkpoint.
- Validación multimodal mínima: la entrada de imagen se comprobó con dos imágenes, sin medición; todas las métricas publicadas son solo de texto.
- Cuantización sin calibración: los expertos enrutados se cuantizaron a NVFP4 sin datos de calibración ni suavizado, lo que puede degradar tareas sensibles a la precisión de los expertos.
- Divergencia medible frente a BF16: KL 0,0426, acuerdo top-1 del 93,56% y NLL un 1,05% superior; no es una réplica exacta del modelo original.
- Idiomas soportados no documentados: no hay información sobre cobertura lingüística.
- Riesgo de alucinación y sesgos: no evaluados en la información proporcionada.
- Licencia MIT: permite uso comercial, pero el autor no ofrece garantías sobre el comportamiento del checkpoint derivado.
- Repositorio con 0 descargas y 1 like en el momento de la consulta: ecosistema de validación prácticamente inexistente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Bizuayeu/Sage-S2.1-Flash-Mixed-NVFP4
- Modelo base BF16: https://huggingface.co/internlm/Sage-S2.1-Flash
- Modelo base FP8: https://huggingface.co/internlm/Sage-S2.1-Flash-FP8
- Checkpoint planificado por el mismo autor: https://huggingface.co/Bizuayeu/GLM-5.3-Flash-Jammed-XSFP4-NZ5
- Motor TensorFold: no disponible en la información proporcionada (el autor cita el tag `6b9de69510` y el commit `077998f7d9`)
- Paper, blog o demo adicionales: no disponibles en la información proporcionada
