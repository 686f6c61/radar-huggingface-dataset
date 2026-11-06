# mrysh/gemma-4-12b-it-prune_unstructured_50

## Resumen

`mrysh/gemma-4-12b-it-prune_unstructured_50` es una version podada del modelo `google/gemma-4-12B-it`, publicada por el usuario mrysh con fines de evaluacion comparativa (benchmark). El modelo conserva la arquitectura original de Gemma 4 (12B parametros, transformer denso) pero aplica una poda no estructurada por magnitud capa a capa, dejando el 50,1% de los pesos de las capas lineales del decodificador a cero. El objetivo no es ofrecer un modelo optimizado para produccion, sino medir el impacto de la poda en la calidad frente al modelo base.

La relevancia de esta publicacion es metodologica: forma parte de un benchmark que compara cuatro modelos (cada uno con ocho variantes de poda) frente a tecnicas de cuantizacion, evaluados en BFCL (function calling), hiring-bias (sesgo de contratacion) y MedQA (preguntas medicas), usando vLLM como motor de inferencia. No hay destilacion ni fine-tuning posterior a la poda, de modo que la degradacion de calidad observada es atribuible directamente a la poda.

Es importante senalar que el fichero resultante es denso: los ceros se almacenan como ceros, por lo que el tamano en disco (23,952 GB) y la velocidad de inferencia son identicos a los del modelo base. El unico efecto de la poda es sobre la calidad, no sobre el rendimiento ni el consumo de memoria.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (familia Gemma 4, tag `gemma4_unified`) |
| Parametros totales | 11.959.730.224 (aprox. 12B) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible en la informacion proporcionada |
| Tipos de cuantizacion | No disponible en la informacion proporcionada (el repo contiene pesos safetensors en BF16/FP16 presumiblemente, sin confirmar) |
| Idiomas soportados | No disponible en la informacion proporcionada |
| Licencia | Apache 2.0 (misma que el modelo base) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura del `google/gemma-4-12B-it`, un transformer denso de aproximadamente 12.000 millones de parametros. Sobre esa base, el autor aplica una poda no estructurada de nivel 0,5 mediante magnitud por capa (layer-wise magnitude pruning) sin datos de calibracion. El resultado es una matriz de pesos en la que el 50,1% de los valores de las capas lineales del decodificador son exactamente cero.

No se realizo destilacion ni fine-tuning tras la poda. El modelo no incorpora ninguna innovacion arquitectonica propia: es una copia modificada del modelo base. El entrenamiento original (datos, numero de tokens, composicion del dataset, posibles fases de RLHF/DPO) corresponde a Google y no se detalla en la informacion disponible. El autor indica que la libreria usada fue `torch 2.14.0a0+b2c75dd062.nv26.9.68203377` (build NVIDIA), lo que sugiere ejecucion sobre stack CUDA propietario.

## Capacidades

- Generacion de texto y razonamiento: hereda las capacidades del modelo base, con degradacion esperada por la poda.
- Function calling / tool calling: evaluado explicitamente en el benchmark mediante BFCL, aunque el modelo se evalua en modo texto y con thinking desactivado.
- Razonamiento multi-paso y uso como agente: no confirmado de forma especifica en la informacion disponible.
- Capacidades multilingues: no disponibles en la informacion proporcionada.
- Capacidades especiales (vision, audio, thinking mode): el modelo base pertenece a la familia Gemma 4, pero el benchmark evalua esta variante como modelo de texto con thinking off. No se confirma soporte multimodal en esta version podada.
- Conocimiento de dominio: evaluado en MedQA (preguntas medicas), lo que indica cierta capacidad de respuesta a preguntas de dominio especializado, aunque con la calidad reducida por la poda.

## Casos de uso

- Benchmark de tecnicas de poda: el uso principal y declarado del modelo es servir como una de las variantes (poda no estructurada al 50%) en un estudio comparativo frente a cuantizacion y otras estrategias de compresion, midiendo la caida de calidad en BFCL, hiring-bias y MedQA.
- Investigacion sobre robustez a la compresion: permite estudiar como la poda por magnitud sin calibracion afecta tareas de function calling y razonamiento de dominio, comparando con el modelo base.
- Analisis de sesgo (hiring-bias): el benchmark incluye una evaluacion de sesgo de contratacion, por lo que este modelo puede usarse para medir si la poda altera o amplifica sesgos respecto al base.
- Evaluacion de pipelines vLLM: al mantener el mismo tamano y velocidad que el base, sirve para validar que un pipeline de inferencia con vLLM funciona igual con pesos podados densos, sin cambios de infraestructura.
- Estudio de degradacion en QA medico (MedQA): util para cuantificar cuanto pierde un modelo de 12B en conocimiento factual tras eliminar el 50% de los pesos lineales.
- Baseline negativo en experimentos de compresion: como referencia de "peor caso" frente a variantes estructuradas o con calibracion, al no incluir recuperacion posterior a la poda.
- Docencia y divulgacion: ejemplo didactico de poda no estructurada y de por que la dispersion sin formatos dispersos no aporta ganancias de memoria ni velocidad.

## Benchmarks y rendimiento

No se han publicado resultados numericos de benchmarks en la informacion disponible. La model card indica que el modelo forma parte de un benchmark sobre BFCL, hiring-bias y MedQA ejecutado con vLLM, pero no incluye las puntuaciones obtenidas ni las del modelo base para comparacion.

## Requisitos de hardware

- VRAM estimada para inferencia: al ser un fichero denso de ~12B parametros, se requiere aproximadamente 24 GB en BF16/FP16 (coincide con el tamano del repo, 24,0 GB). En FP32 seria ~48 GB; en cuantizaciones de 8 bits ~12 GB y de 4 bits ~6-7 GB, aunque no se confirma que existan versiones cuantizadas publicadas de esta variante.
- GPU recomendadas: A100 40/80 GB, H100, L40S o cualquier GPU con 24 GB o mas para BF16 (RTX 4090, RTX 3090, A10G 24 GB).
- Cabe en consumer GPU: si, en RTX 4090 (24 GB) o RTX 3090 (24 GB) en BF16, con margen ajustado para contexto largo; en GPUs de 12 GB solo mediante cuantizacion.
- Opciones de despliegue: vLLM (motor usado en el benchmark), llama.cpp/Ollama (previa conversion a GGUF, no publicada), TGI. Al ser pesos densos con ceros, no se beneficia de kernels dispersos.
- Latencia y throughput: no disponibles. El autor indica que velocidad y tamano son identicos al modelo base, pero no aporta cifras.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Estado | Notas |
|---|---|---|---|---|---|
| `mrysh/gemma-4-12b-it-prune_unstructured_50` | ~12B (denso, 50,1% ceros) | No disponible | Apache 2.0 | Pesos densos, sin recuperacion post-poda | Variante de benchmark, calidad degradada |
| `google/gemma-4-12B-it` (base) | ~12B | No disponible | Apache 2.0 | Modelo oficial | Referencia de calidad; mismo tamano y velocidad |
| Otras variantes del benchmark (poda estructurada, cuantizacion) | ~12B | No disponible | Apache 2.0 | No publicadas en esta informacion | Comparadas en BFCL, hiring-bias y MedQA |

No se dispone de datos de rendimiento para establecer una comparacion cuantitativa con alternativas de la misma categoria.

## Limitaciones y advertencias

- Calidad degradada: al no haber destilacion ni fine-tuning tras la poda, se espera una caida de calidad frente al modelo base; el benchmark mide precisamente esa caida.
- Sin ganancias de eficiencia: los ceros se almacenan como ceros, por lo que no hay reduccion de memoria ni de latencia; el fichero ocupa lo mismo que el base.
- Poda sin calibracion: la magnitud por capa sin datos de calibracion puede eliminar pesos relevantes de forma no optima, afectando tareas sensibles como function calling.
- Riesgo de alucinacion: probablemente incrementado respecto al base por la perdida de capacidad, aunque no se aportan mediciones.
- Sesgos: el benchmark incluye evaluacion de hiring-bias, lo que sugiere interes en medir sesgos; no se publican resultados ni se confirma si la poda los amplifica.
- Idiomas y contexto: no se especifican en la informacion disponible; no debe asumirse el soporte multilingue del base sin verificacion.
- Uso comercial: la licencia Apache 2.0 lo permite, pero se heredan las condiciones y avisos del modelo base `google/gemma-4-12B-it`, que deben consultarse.
- Estado del repo: 0 descargas y 0 likes, creado y actualizado el mismo dia (2026-11-05), lo que indica un artefacto de experimento sin validacion comunitaria.
- No apto como sustituto directo del base en produccion sin evaluacion propia.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/mrysh/gemma-4-12b-it-prune_unstructured_50
- Modelo base: https://huggingface.co/google/gemma-4-12B-it
