# hhhhhhy5/MFD-Qwen3-4B

## Resumen

MFD-Qwen3-4B es un modelo borrador (*draft model*) para decodificación especulativa, diseñado para acelerar la inferencia de Qwen/Qwen3-4B sin alterar su salida. Lo desarrolla Haoyu Huang y colaboradores (Jialiang Kang, Linlin Yang, Xiao Yang, Baochang Zhang) en el marco del trabajo *Multi-Future Drafting: Mixture Block Drafters for Tree-Verified Speculative Decoding* (arXiv:2611.13017). No es un modelo de propósito general: es un componente de infraestructura que predice bloques de tokens futuros que el modelo objetivo verifica después en un único pase.

La innovación central es el *Multi-Future Drafting* (MFD): un borrador DFlash de bloques con K = 8 embeddings de modo aprendidos en su entrada. Los 8 modos generan simultáneamente 8 futuros coherentes en un solo forward pass, y un árbol de borradores mixto conserva los B prefijos con mayor log-probabilidad del mejor modo. La verificación es la estándar de árbol, por lo que la decodificación es sin pérdida (*lossless*): la salida final es exactamente la del modelo objetivo.

El modelo pesa 537 millones de parámetros en bf16 (1,1 GB de repositorio) y se inicializa desde z-lab/Qwen3-4B-DFlash-b16, afinado sobre los 1,42 millones de prompts de mlabonne/open-perfectblend con respuestas regeneradas por Qwen3-4B sin modo thinking. Es relevante porque reporta aceleraciones de hasta 7,32x sobre decodificación autoregresiva en el escenario de referencia, un salto notable frente a los borradores DFlash y DDTree publicados previamente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DFlash drafter (borrador de bloques): 5 capas de anchura 2560, lectura de capas objetivo [1, 9, 17, 25, 33]; bloque de 16 (15 posiciones borradoradas); 8 embeddings de modo (8 x 2560) y una puerta lineal (no usada en inferencia) |
| Parametros totales | 537.450.240 (537M) en bf16 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (entrenado con secuencias de hasta 3072 tokens) |
| Tipos de cuantizacion | no disponible (pesos publicados en bf16) |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors, con código personalizado (`custom_code`) |

## Arquitectura y entrenamiento

El borrador es un DFlash drafter que lee los estados ocultos de cinco capas del modelo objetivo (1, 9, 17, 25 y 33) y predice un bloque de 16 posiciones (15 borradoradas). La pieza diferencial es la incorporación de K = 8 embeddings de modo (`mode_embed`, 8 x 2560) en la entrada: los 8 modos generan en el mismo forward pass ocho futuros alternativos del bloque, y un árbol mixto selecciona los B prefijos con mayor log-probabilidad del mejor modo para que el objetivo los verifique en un solo pase. La verificación es la verificación de árbol estándar, de modo que el resultado es idéntico al de la decodificación autoregresiva del objetivo.

El entrenamiento parte de z-lab/Qwen3-4B-DFlash-b16 (MIT) y usa los 1,42 millones de prompts de mlabonne/open-perfectblend, con respuestas regeneradas por Qwen3-4B sin thinking (temperatura 0,7, top-p 0,8, top-k 20, máximo 2048 tokens nuevos). Se realizan 3 épocas con AdamW, learning rate 1e-4 (warmup del 4 %, decaimiento coseno), clipping de gradiente 1, secuencias de hasta 3072 tokens, 36 secuencias por paso y 64 bloques ancla por secuencia x 8 modos. El objetivo es un *winner-take-all* relajado sobre los 8 modos (el modo con mayor cobertura suave recibe peso 0,9; el resto 0,1/7), cada modo entrenado con la pérdida D-PACE (suavizado 0,5) más una entropía cruzada de la puerta con peso 0,1.

## Capacidades

- Generación de borradores de tokens para decodificación especulativa sobre Qwen/Qwen3-4B en modo sin thinking.
- Predicción multi-futuro: 8 modos simultáneos por bloque, cada uno coherente de forma independiente.
- Construcción de árboles de borradores mixtos con presupuesto configurable (B = 256 en el escenario Hugging Face Transformers; B = 63 en SGLang).
- Decodificación sin pérdida: la salida verificada es la del modelo objetivo, no la del borrador.
- Integración con Hugging Face Transformers (entorno `inference/hf`) y con SGLang 0.5.22 mediante un parche del repositorio.
- Soporte de atención de modo (`enable_mode_attention`) y árbol en C++ fusionado con logits (`enable_cpp_tree`).
- No es un modelo de chat, razonamiento, código o visión autónomo: no genera respuestas por sí mismo, solo tokens candidatos que el objetivo valida.

## Casos de uso

- Aceleración de inferencia en producción de Qwen3-4B: desplegar el par objetivo + borrador en SGLang con `launch_server.sh` para reducir la latencia de decodificación en un factor de hasta 5,93x (T = 0) con lote 1, manteniendo la salida exacta del modelo objetivo.
- Servicios de chat interactivo de baja concurrencia: con lotes de 1 a 2, el árbol mixto aporta su máxima ventaja, por lo que encaja en asistentes conversacionales con un único usuario por GPU y ventanas de respuesta de 512 tokens o más.
- Evaluación de razonamiento matemático y código: el borrador está entrenado con respuestas de Qwen3-4B sobre GSM8K, MATH-500, HumanEval, MBPP y MT-Bench, por lo que acelera cargas típicas de generación de código y resolución de problemas.
- Pipelines de generación por lotes pequeños: tareas de resumen, extracción o reescritura con pocas peticiones simultáneas donde el coste por token es crítico y no se quiere recurrir a un modelo mayor.
- Investigación en decodificación especulativa: servir como referencia reproducible para comparar DFlash, DDTree, D-PACE y MFD con el mismo objetivo y los mismos presupuestos de árbol.
- Despliegue en una sola GPU Blackwell: el escenario de referencia usa una NVIDIA RTX PRO 6000 Blackwell con lote 1, lo que permite montar un servidor de inferencia acelerado en hardware de una sola tarjeta profesional.

## Benchmarks y rendimiento

Resultados del artículo, Hugging Face Transformers, lote 1, una NVIDIA RTX PRO 6000 Blackwell. Cada celda es la aceleración sobre decodificación autoregresiva con la longitud de aceptación tau entre paréntesis, media sobre GSM8K, MATH-500, HumanEval, MBPP y MT-Bench. Todos los árboles usan B = 256.

| Metodo | T = 0 | T = 1 |
|---|---|---|
| DFlash chain (borrador publicado) | 4,38x (5,98) | 3,73x (5,08) |
| DDTree (borrador publicado) | 6,08x (8,59) | 5,44x (7,70) |
| D-PACE + DDTree, mismos datos, 3 ep | 6,66x (9,34) | 5,66x (7,96) |
| **Este borrador (arbol MFD)** | **7,32x (10,49)** | **6,35x (9,13)** |

SGLang 0.5.22 con el parche MFD, lote 1, las mismas 5 tareas, B = 63 y vocabulario de borrador de 64K.

| Metodo | T = 0 | T = 1 |
|---|---|---|
| DFlash chain (borrador publicado, SGLang nativo) | 4,06x (5,97) | 3,46x (5,10) |
| DDTree (borrador publicado) | 4,97x (7,81) | 4,44x (6,99) |
| D-PACE + DDTree (1,42M prompts) | 5,52x (8,72) | 4,72x (7,48) |
| **Este borrador** | **5,93x (9,62)** | **5,06x (8,23)** |

## Requisitos de hardware

- El borrador ocupa 1,1 GB en bf16; el peso dominante es el modelo objetivo Qwen3-4B, que en bf16 requiere aproximadamente 8 GB solo para pesos.
- VRAM estimada: alrededor de 10-12 GB para el par objetivo + borrador en bf16 con caché KV para contextos moderados; no se han publicado cifras exactas de VRAM en la información disponible.
- GPU de referencia: una NVIDIA RTX PRO 6000 Blackwell. Cabe en GPUs de consumo con al menos 16 GB de VRAM (por ejemplo, RTX 4090 o RTX 5090) si se ejecuta el objetivo en bf16 o cuantizado, aunque no se han publicado mediciones en esas tarjetas.
- Despliegue soportado: Hugging Face Transformers con el código del repositorio (`inference/hf`) y SGLang 0.5.22 con el parche MFD (`inference/sglang/launch_server.sh`).
- Latencia y throughput: la aceleración reportada es de hasta 7,32x (Transformers, T = 0) y 5,93x (SGLang, T = 0) sobre decodificación autoregresiva con lote 1; no se publican valores absolutos de tokens por segundo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Aceleracion (T = 0, Transformers) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| **MFD-Qwen3-4B** | 537M | no disponible | 7,32x (tau 10,49) | Apache-2.0 | Hugging Face |
| z-lab/Qwen3-4B-DFlash-b16 | no disponible | no disponible | 4,38x (tau 5,98) | MIT | Hugging Face |
| Borrador DDTree publicado | no disponible | no disponible | 6,08x (tau 8,59) | no disponible | no disponible |
| D-PACE + DDTree (mismos datos) | no disponible | no disponible | 6,66x (tau 9,34) | no disponible | no disponible |

La comparativa se limita a los borradores evaluados en el artículo; no se dispone de datos de otros borradores para Qwen3-4B en la información proporcionada.

## Limitaciones y advertencias

- El árbol mixto solo aporta ventaja con tamaños de lote de 1 a 2; en SGLang, los árboles de un solo modo sirven más rápido a partir de lote 8, por lo que para alta concurrencia conviene un borrador MFD-D.
- El borrador está acoplado a su objetivo: lee los estados ocultos de Qwen3-4B y usa su embedding y su LM head, de modo que no puede reutilizarse con otro modelo.
- Solo cubre el modo sin thinking de Qwen3-4B; no se ha validado con el modo thinking activado.
- No es un modelo generativo autónomo: no debe usarse para responder directamente, solo como componente de decodificación especulativa.
- Riesgo de alucinación no aplicable en la salida final (la verificación es sin pérdida), pero el borrador puede producir borradores de baja calidad que reduzcan la tasa de aceptación y, con ello, la aceleración efectiva.
- No se han publicado evaluaciones de sesgo, multilingüismo ni robustez para este borrador.
- La licencia Apache-2.0 se aplica a los pesos afinados; el aviso MIT del modelo base z-lab/Qwen3-4B-DFlash-b16 sigue aplicándose a los pesos de partida.
- Requiere código personalizado (`custom_code`) y, en SGLang, un parche específico; no funciona con un `AutoModelForCausalLM` estándar sin el repositorio.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/hhhhhhy5/MFD-Qwen3-4B
- Modelo base: https://huggingface.co/z-lab/Qwen3-4B-DFlash-b16
- Modelo objetivo: https://huggingface.co/Qwen/Qwen3-4B
- Articulo: https://arxiv.org/abs/2611.13017
- Codigo: https://github.com/hhhhhhy5/multi-future-drafting
- Pagina del proyecto: https://hhhhhhy5.github.io/multi-future-drafting/
- Dataset de prompts: https://huggingface.co/datasets/mlabonne/open-perfectblend
