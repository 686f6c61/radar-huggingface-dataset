# JetBrains-Research/budget-internalization-qwen3.5-4b-8k-grpo-multiseed-seed43-pickedwolf-s160

## Resumen

Este modelo es un ajuste fino por aprendizaje por refuerzo de Qwen/Qwen3.5-4B, desarrollado por JetBrains-Research, orientado a razonamiento matematico bajo un presupuesto fijo de generacion de 8.192 tokens. Forma parte del trabajo *Budget Internalization: Fixed-Budget RLVR Trades Test-Time Scaling for In-Budget Accuracy*, que estudia como internalizar una restriccion de longitud en el propio modelo en lugar de depender de estrategias de escalado en tiempo de inferencia.

El checkpoint publicado corresponde al paso 160 de una ablacion de semillas (semilla 43, nombre interno `pickedwolf`), seleccionado como el mejor punto de validacion de esa ejecucion. Se trata de un modelo multimodal de tipo image-text-to-text, con 4.539.265.536 parametros en BF16 y un repositorio de 9,1 GB.

Su relevancia practica esta en que permite obtener respuestas matematicas razonadas dentro de un limite duro de tokens, lo que reduce coste y latencia en despliegues con presupuesto acotado. El entrenamiento usa GRPO sobre el dataset DeepScaleR y una recompensa binaria de correccion de la respuesta final.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base Qwen3.5, familia Qwen; transformer multimodal image-text-to-text) |
| Parametros totales | 4.539.265.536 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible (presupuesto de generacion entrenado: 8.192 tokens) |
| Tipos de cuantizacion | no disponible (pesos publicados en BF16) |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 (heredada del modelo base) |
| Formato de pesos | safetensors (libreria transformers) |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3.5-4B y se ajusta con GRPO (leave-one-out baseline, normalizacion de recompensa por grupo y perdida a nivel de token). Las respuestas que alcanzan el presupuesto de 8.192 tokens se truncan y se puntuan tal cual, lo que fuerza al modelo a producir razonamiento y respuesta dentro de ese limite. La recompensa es binaria: correccion de la respuesta extraida de las etiquetas `\boxed{}`.

El entrenamiento usa el dataset DeepScaleR (matematicas) durante un maximo de 3 epocas, con lotes de 32 prompts y 8 rollouts por paso, optimizador Adam con schedule coseno, LR pico de 5e-7, 10 pasos de calentamiento y 160 pasos en este checkpoint. Los pesos se publican en BF16. La validacion se mide cada 10 pasos sobre 480 problemas reservados de DeepScaleR; este repositorio es el mejor checkpoint de la semilla 43 segun esa metrica. No se detalla en la informacion disponible si hubo etapas adicionales de RLHF o DPO, ni la composicion completa del dataset mas alla de DeepScaleR.

## Capacidades

- Generacion de texto y razonamiento paso a paso orientado a problemas matematicos.
- Razonamiento matematico con respuesta final delimitada en `\boxed{}`.
- Generacion bajo presupuesto fijo de tokens (8.192), con respuestas truncadas y puntuadas si se excede.
- Procesamiento image-text-to-text segun el pipeline declarado, heredado del modelo base.
- Conversacional, con plantilla de chat del modelo base.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso mas alla del prompting: no disponible.
- Capacidades multilingues: no disponibles.
- Modo thinking explicito: no disponible como funcionalidad separada; el prompt de entrenamiento induce razonamiento paso a paso.

## Casos de uso

- Resolucion de problemas matematicos con coste acotado: el modelo esta entrenado para razonar y responder dentro de 8.192 tokens, lo que encaja en pipelines donde el coste por consulta debe ser predecible.
- Evaluacion de modelos de razonamiento en entornos de investigacion: sirve como punto de comparacion en estudios sobre presupuestos de generacion y escalado en tiempo de inferencia.
- Generacion de soluciones verificables: la salida en `\boxed{}` facilita la extraccion automatica y la validacion de la respuesta final en sistemas de correccion automatica.
- Tutoria o asistencia educativa en matematicas: puede generar explicaciones paso a paso para problemas de nivel competitivo o de secundaria, con la salvedad de que no se han publicado evaluaciones fuera del dominio DeepScaleR.
- Prototipado de asistentes multimodales: al declarar pipeline image-text-to-text, puede emplearse en experimentos que combinen imagen y texto, aunque no se detallan capacidades visuales especificas.
- Fine-tuning posterior o ablaciones: al estar publicado con licencia apache-2.0 y pesos safetensors, es reutilizable como punto de partida para nuevos experimentos de RL sobre presupuesto de tokens.
- Despliegue en hardware modesto: con 4,5 mil millones de parametros, es viable en GPUs de consumo para inferencia en cuantizacion, aunque no se publican pesos GGUF.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card solo indica que la seleccion del checkpoint se hizo por precision de validacion sobre 480 problemas reservados de DeepScaleR, sin cifras concretas.

## Requisitos de hardware

- VRAM estimada en BF16: aproximadamente 9 GB solo para pesos, mas memoria para KV cache y activaciones; en la practica, alrededor de 10-12 GB para inferencia con contexto moderado.
- VRAM estimada en cuantizacion de 8 bits: aproximadamente 4,5-5 GB de pesos; en 4 bits, aproximadamente 2,5-3 GB.
- GPU recomendadas: A100, H100 o L40S para despliegues de produccion; RTX 4090 o RTX 3090 para inferencia en BF16.
- GPU de consumo: cabe en tarjetas con 12 GB o mas en BF16 y en tarjetas de 8 GB con cuantizacion, aunque no se publican pesos GGUF en el repositorio.
- Opciones de despliegue: transformers de forma nativa; vLLM, TGI y llama.cpp son opciones plausibles, pero no se confirma compatibilidad en la informacion disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Entrenamiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este modelo (Qwen3.5-4B, 8k GRPO, seed 43, step 160) | 4.539.265.536 | no disponible | GRPO sobre DeepScaleR, presupuesto 8k | apache-2.0 | Hugging Face |
| Qwen/Qwen3.5-4B | 4B (aproximado) | no disponible | Modelo base | no disponible | Hugging Face |
| Checkpoints hermanos de la ablacion (seed 42, 43, 44; pasos 290 y 300) | 4.539.265.536 | no disponible | Misma receta, distinta semilla o paso | apache-2.0 | Hugging Face |

No se dispone de datos de rendimiento comparado con otros modelos de la misma categoria en la informacion proporcionada.

## Limitaciones y advertencias

- El modelo esta especializado en matematicas y entrenado sobre DeepScaleR; su rendimiento fuera de ese dominio no esta documentado.
- Riesgo de alucinacion en razonamientos y respuestas finales, especialmente en problemas fuera de la distribucion de entrenamiento.
- Las respuestas que superan los 8.192 tokens se truncan, lo que puede producir soluciones incompletas o incorrectas en problemas largos.
- No se documentan sesgos conocidos, pero al derivar de un modelo base general puede heredar sesgos de este.
- No se especifican los idiomas soportados; el prompt de entrenamiento esta en ingles.
- Licencia apache-2.0 heredada del modelo base, lo que permite uso comercial, pero conviene verificar los terminos del modelo base Qwen/Qwen3.5-4B.
- Es un checkpoint intermedio (paso 160) de una ablacion de semillas; no debe tratarse como la version final de la receta.
- No se publican pesos cuantizados ni resultados de benchmarks, lo que limita la evaluacion previa a produccion.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/JetBrains-Research/budget-internalization-qwen3.5-4b-8k-grpo-multiseed-seed43-pickedwolf-s160
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
- Checkpoint hermano seed 42, paso 290: https://huggingface.co/JetBrains-Research/budget-internalization-qwen3.5-4b-8k-grpo-multiseed-seed42-sharpserval-s290
- Checkpoint hermano seed 42, paso 300: https://huggingface.co/JetBrains-Research/budget-internalization-qwen3.5-4b-8k-grpo-multiseed-seed42-sharpserval-s300
- Checkpoint hermano seed 43, paso 300: https://huggingface.co/JetBrains-Research/budget-internalization-qwen3.5-4b-8k-grpo-multiseed-seed43-pickedwolf-s300
- Checkpoint hermano seed 44, paso 290: https://huggingface.co/JetBrains-Research/budget-internalization-qwen3.5-4b-8k-grpo-multiseed-seed44-funpoodle-s290
- Checkpoint hermano seed 44, paso 300: https://huggingface.co/JetBrains-Research/budget-internalization-qwen3.5-4b-8k-grpo-multiseed-seed44-funpoodle-s300
- Dataset de entrenamiento: https://huggingface.co/datasets/agentica-org/DeepScaleR-Preview-Dataset
- Paper citado (Budget Internalization): no disponible como enlace
- Repositorio de codigo: no disponible
