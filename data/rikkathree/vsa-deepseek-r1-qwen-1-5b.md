# rikkathree/vsa-deepseek-r1-qwen-1.5b

## Resumen

VSA-DeepSeek-R1-Qwen-1.5B es un modelo híbrido de razonamiento creado por el usuario de HuggingFace rikkathree a partir del modelo base deepseek-ai/DeepSeek-R1-Distill-Qwen-1.5B. Su particularidad es que sustituye quirúrgicamente 21 de las 28 capas de atención (el 75 %) por capas de atención lineal con estado fijo y decaimiento (Fixed-State Decayed Linear Attention, VSA), manteniendo solo 7 capas con atención Softmax GQA estándar. El objetivo es reducir drásticamente el crecimiento de la caché KV en memoria (un 74,6 % menos de RAM a contexto de 64k) sin sacrificar capacidad de razonamiento.

El modelo se entrena mediante destilación de conocimiento pura del profesor (VSA-FastDistill) sobre trazas de cadena de pensamiento (`<think>...</think>`) de matemáticas, código e instrucciones, alcanzando en solo 3.663 pasos una perplejidad del 0,937x respecto al modelo donante (9,52 frente a 10,16). Además, incorpora un sistema de edición de memoria en disco (cartridge `.vsa` mediante `VSAMemoryBank`) que permite recuperación exacta de información con enrutamiento inferior a 20 ms.

Es relevante como experimento de investigación en arquitecturas híbridas attention lineal + softmax, una línea que persigue inferencia eficiente en contextos largos. No obstante, se trata de un proyecto individual con 0 descargas, pesos en formato `.pth` personalizado y código de carga propio, por lo que su adopción en producción requiere precaución.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Hibrida: 21 capas de atencion lineal con estado fijo y decaimiento (VSA) + 7 capas de atencion Softmax GQA (sobre base Qwen2) |
| Parametros totales | no disponible (el repo pesa 3,8 GB en formato .pth) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible oficialmente; el ejemplo de la model card usa ventanas deslizantes de 1024 tokens |
| Tipos de cuantizacion | no disponible (se ejecuta en bfloat16) |
| Idiomas soportados | no disponible (hereda el tokenizador de DeepSeek-R1-Distill-Qwen-1.5B, orientado principalmente a ingles y chino) |
| Licencia | MIT |
| Formato de pesos | .pth personalizado (PyTorch, carga mediante clase propia `vsa_lm.converter.UniversalVSALM`); no disponible en safetensors ni GGUF |

## Arquitectura y entrenamiento

La arquitectura parte del DeepSeek-R1-Distill-Qwen-1.5B (transformer decoder con GQA) y reemplaza 21 de sus 28 capas de atención por capas VSA de atención lineal con estado fijo y decaimiento, cuya recursión es `M_t = gamma * M_{t-1} + k_t(x) v_t`. Cada capa VSA mantiene un estado plano de 128x128 en lugar de una caché KV que crece con la secuencia, lo que explica la reducción del 74,6 % en RAM de estado a 64k de contexto (456 MB frente a 1.792 MB). Las 7 capas Softmax restantes conservan atención estándar. El proyecto incluye kernels Triton propios para las operaciones VSA.

El entrenamiento emplea destilación de conocimiento pura del profesor (Pure-Teacher Knowledge Distillation, método VSA-FastDistill) con alineación coseno por bloques (Blockwise Cosine Alignment), sobre trazas de razonamiento `<think>...</think>` de matemáticas, código e instrucciones generadas presumiblemente por el modelo donante. En 3.663 pasos se alcanza una perplejidad de 9,52 (mejor que la del donante, 10,16) y un acuerdo top-1 del 79,9 % con divergencia KL de 0,258 nats sobre un vocabulario de 151.936 tokens. No se detalla el número total de tokens de entrenamiento ni el uso de RLHF/DPO.

## Capacidades

- Generación de texto con formato de razonamiento `<think>...</think>` heredado de la familia DeepSeek-R1 destilada.
- Razonamiento matemático paso a paso: duplica la tasa de MATH con respuesta en `\boxed{}` a 512 tokens (10,0 % frente a 5,0 % del donante).
- Pensamiento latente (latent thinking) en OpenMythos: al iterar de K=0 a K=4 pasos de pensamiento, la confianza sube del 52,95 % al 81,65 % sin añadir ni un byte a la caché KV Softmax, algo imposible en el modelo donante.
- Edición de memoria externa: sistema `VSAMemoryBank` con cartuchos `.vsa` respaldados en disco que logran recuperación exacta 4/4 (100 %) con residuo de borrado 0,0, enrutamiento inferior a 20 ms y 0,00 MB de GPU RAM en reposo.
- Eficiencia de contexto largo: estado plano de 128x128 por capa VSA, con crecimiento de memoria constante en el 75 % de las capas.
- No hay evidencia de soporte de tool calling / function calling ni de capacidades de visión o audio.

## Casos de uso

- Investigación en arquitecturas híbridas de atención: el modelo sirve como prueba de concepto reproducible de que la atención lineal con estado fijo puede igualar o mejorar la perplejidad de un transformer softmax en tareas de razonamiento, útil para laboratorios que exploran alternativas a la caché KV.
- Inferencia en contexto largo con memoria limitada: gracias a la reducción del 74,6 % en RAM de estado a 64k tokens, es adecuado para desplegar razonamiento en GPUs con VRAM ajustada donde el modelo original no cabría con contexto largo.
- Sistemas de memoria persistente tipo RAG con recuperación exacta: el `VSAMemoryBank` permite almacenar conocimiento en cartuchos `.vsa` en disco y recuperarlo con latencia inferior a 20 ms, útil para asistentes que necesitan recordar documentos o sesiones previas sin mantenerlos en GPU.
- Resolución de problemas matemáticos paso a paso en entornos educativos o de prototipado: el formato `<think>` genera álgebra concisa paso a paso con respuesta final en `\boxed{}`.
- Experimentación con pensamiento latente (latent thinking): escenarios donde se desea que el modelo "piense" más pasos (K=0 a K=4) para ganar confianza en la respuesta sin coste de memoria, relevante para agentes con presupuesto de cómputo ajustable.
- Prototipado de kernels Triton personalizados: el código incluye implementaciones Triton de las operaciones VSA, útil como referencia para desarrolladores de kernels de atención eficientes.
- Chatbot de instrucciones ligero: hereda el chat template y el tokenizador de DeepSeek-R1-Distill-Qwen-1.5B, por lo que puede integrarse en pipelines de conversación sencillos con carga personalizada.

## Benchmarks y rendimiento

Resultados publicados por el autor en la model card, comparando con el modelo donante:

| Metrica | DeepSeek-R1-Distill-Qwen-1.5B | VSA-DeepSeek-R1-Qwen-1.5B | Notas |
|---|---:|---:|---|
| Perplejidad (held-out razonamiento y matematicas) | 10,16 (1,000x) | 9,52 (0,937x) | Pure-KD + Blockwise Cosine Alignment |
| Acuerdo top-1 siguiente token (vocab. 151.936) | 100,0 % | 79,9 % | Divergencia KL de 0,258 nats |
| MMLU (zero-shot) | 29,0 % | 28,0 % | 96,6 % retenido |
| MATH cadena de pensamiento (`\boxed{}` @ 512 tokens) | 5,0 % | 10,0 % | Algebra concisa paso a paso |
| OpenMythos pensamiento latente (K=0 -> K=4) | N/A (crece la cache KV) | 52,95 % -> 81,65 % (+28,7 % de confianza) | 0 bytes anadidos a la cache KV Softmax |
| Recall de cartucho `.vsa` en disco (VSAMemoryBank) | N/A | 4/4 (100 % recall exacto, 0,0 residuo de borrado) | Enrutamiento < 20 ms, 0,00 MB GPU RAM en reposo |
| RAM de cache KV / estado @ 64k de contexto | 1.792,0 MB | 456,0 MB (-74,6 %) | 21 capas con estado plano 128x128 |

Nota: se trata de benchmarks auto-publicados por el autor del modelo, no verificados de forma independiente. No hay resultados en benchmarks estandarizados amplios (HumanEval, GSM8K, etc.) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita. El checkpoint pesa 3,8 GB en .pth y se ejecuta en bfloat16, por lo que una GPU con 8 GB de VRAM deberia ser suficiente para el modelo en si, mas el estado de 456 MB a 64k de contexto segun el autor.
- GPU recomendadas: no disponible oficialmente; por tamano, cualquier GPU consumer moderna (RTX 3060 de 12 GB, RTX 4090) o de datacenter (A100, H100) deberia ejecutarlo sin problemas.
- Cabe en GPUs consumer: si, por tamano (3,8 GB) y estado reducido, es ejecutable en GPUs de gama media-alta; no hay confirmacion oficial de un minimo concreto.
- Opciones de despliegue: no compatible con vLLM, TGI, llama.cpp ni Ollama al usar formato .pth y una clase de modelo propia (`vsa_lm.converter.UniversalVSALM`). El despliegue se hace con PyTorch y Transformers (solo para el tokenizador), ejecutando el bucle de generacion manual incluido en la model card.
- Latencia y throughput: no disponibles. El unico dato de latencia publicado es el enrutamiento de memoria del VSAMemoryBank (< 20 ms).

## Comparativa con modelos similares

| Modelo | Parametros | Arquitectura | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| VSA-DeepSeek-R1-Qwen-1.5B | no disponible | Hibrida 21 VSA + 7 Softmax GQA | no disponible (ventanas de 1024 en el ejemplo) | MIT | Weights .pth + codigo propio en HuggingFace |
| DeepSeek-R1-Distill-Qwen-1.5B | 1,5 B | Transformer decoder con GQA (28 capas softmax) | 131.072 tokens | MIT | Transformers, vLLM, GGUF, Ollama |
| Qwen2.5-1.5B-Instruct | 1,54 B | Transformer decoder GQA | 32.768 tokens (128k con RoPE escalado) | Apache 2.0 (Qwen Research para derivados grandes) | Transformers, vLLM, GGUF, Ollama |
| RWKV-6 (varios tamanos) | 0,1 B - 14 B | Atencion lineal recurrente (estado fijo) | hasta ~1 M tokens | Apache 2.0 | Weights abiertos, soporte llama.cpp parcial |

La comparativa muestra el nicho del modelo: frente a su donante, sacrifica compatibilidad con el ecosistema estandar (vLLM, GGUF) a cambio de una reduccion del 74,6 % en RAM de estado y una mejora en MATH (10,0 % frente a 5,0 %), con una retencion del 96,6 % en MMLU.

## Limitaciones y advertencias

- Proyecto individual sin verificacion externa: los benchmarks son auto-publicados por el autor y no hay revision independiente; los numeros deben tomarse con cautela.
- Cero descargas registradas en el momento de la ficha: ausencia total de validacion comunitaria y de reportes de bugs o problemas en inferencia.
- Formato de pesos no estandar (.pth con `weights_only=False`): cargar checkpoints de terceros con `torch.load(..., weights_only=False)` implica ejecutar codigo arbitrario embebido en el pickle; revisar el checkpoint antes de usarlo en entornos sensibles.
- Sin soporte del ecosistema estandar: no funciona con vLLM, TGI, llama.cpp ni Ollama; la generacion requiere un bucle manual de Python, lo que implica throughput bajo y sin optimizaciones de servido (batching, continuous batching, paged attention).
- Ventana efectiva limitada en el ejemplo oficial (1024 tokens con ventana deslizante): la longitud de contexto real util no esta documentada.
- Riesgo de alucinacion: heredado del modelo base destilado de 1,5B, cuyas metricas absolutas son bajas (MMLU 28-29 %, MATH 5-10 %), indicando capacidad de razonamiento limitada.
- Acuerdo top-1 del 79,9 % con el donante: el 20 % de tokens difiere, por lo que el comportamiento en produccion puede desviarse del modelo base en casos limite.
- Idiomas: no documentados; el tokenizador heredado sugiere ingles y chino, sin garantia de rendimiento en castellano.
- Licencia MIT: sin restricciones de uso comercial, pero al ser un derivado de DeepSeek-R1-Distill-Qwen-1.5B conviene revisar tambien los terminos del modelo base (MIT en este caso).
- Sin tool calling, sin multimodalidad y sin documentacion de entrenamiento completa (tokens totales, composicion del dataset, RLHF/DPO no disponibles).

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/rikkathree/vsa-deepseek-r1-qwen-1.5b
- Modelo base: https://huggingface.co/deepseek-ai/DeepSeek-R1-Distill-Qwen-1.5B
- Imagen de benchmarks referenciada en la model card: `vsa_vs_deepseek_r1_real_benchmarks.png` (incluida en el repositorio)
- Paper, blog o repositorio de codigo independiente: no disponibles en la informacion proporcionada
