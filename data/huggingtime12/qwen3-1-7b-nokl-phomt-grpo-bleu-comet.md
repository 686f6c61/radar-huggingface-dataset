# huggingtime12/Qwen3-1.7B-noKL-PhoMT-GRPO-BLEU-COMET

## Resumen

Qwen3-1.7B-noKL-PhoMT-GRPO-BLEU-COMET es un adaptador LoRA (PEFT) publicado por el usuario huggingtime12 sobre el modelo base huggingtime12/Qwen3-1.7B-PhoMT-SFT-Merged, que a su vez deriva de la familia Qwen3 de Alibaba en su variante de 1.700 millones de parametros. El nombre del repositorio sugiere un ajuste fino orientado a traduccion automatica (PhoMT es un corpus publico de traduccion chino-vietnamita) mediante aprendizaje por refuerzo con GRPO, optimizando directamente metricas BLEU y COMET, y sin termino de divergencia KL (de ahi el "noKL"). El modelo se distribuye como pesos de adaptador en formato safetensors con la libreria PEFT.

La relevancia de esta publicacion es limitada pero concreta: se trata de un experimento de alineacion por RL sobre una tarea de traduccion, aplicando una variante de GRPO sin penalizacion KL que busca maximizar recompensas BLEU/COMET directamente. Para desarrolladores e investigadores interesados en tecnicas de RLHF/RLVR aplicadas a generacion condicionada y en el ajuste de modelos pequenos (1,7B) para tareas especializadas, este checkpoint es un caso de estudio util, aunque su model card esta practicamente vacia y no aporta datos de entrenamiento, evaluacion ni licencia.

El repositorio ocupa 0,3 GB, lo que corresponde a los pesos del adaptador LoRA y no al modelo completo. No se han publicado resultados de benchmarks, detalles del dataset, hiperparametros ni condiciones de uso en la informacion disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen3), ajustado mediante adaptador LoRA sobre el modelo base merged |
| Parametros totales | 1.700 millones (heredados del modelo base Qwen3-1.7B; el adaptador anade un numero no especificado de parametros entrenables) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada (el modelo base Qwen3-1.7B soporta contextos largos, pero no se confirma en esta ficha) |
| Tipos de cuantizacion | No disponible (el adaptador se distribuye en safetensors; la cuantizacion depende del modelo base y del stack de despliegue) |
| Idiomas soportados | No disponibles (el nombre sugiere chino-vietnamita por el corpus PhoMT, sin confirmacion oficial) |
| Licencia | No disponible |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El modelo es un adaptador LoRA entrenado sobre el checkpoint merged Qwen3-1.7B-PhoMT-SFT-Merged. La arquitectura subyacente es la de Qwen3 en su variante densa de 1,7B parametros: un transformer decoder-only con atencion causal estandar. El adaptador introduce matrices de bajo rango en capas seleccionadas del modelo base, de modo que en inferencia debe cargarse junto con el modelo base mediante PEFT o fusionarse previamente.

El entrenamiento combina dos fases deducibles del nombre: primero un ajuste supervisado (SFT) sobre el corpus PhoMT, y despues un refinamiento con GRPO (Group Relative Policy Optimization) sin termino KL, usando BLEU y COMET como funciones de recompensa. La ausencia de penalizacion KL es una decision tecnica relevante: elimina la restriccion que mantiene al modelo cerca de la politica de referencia, lo que puede aumentar la especializacion en la metrica objetivo a costa de degradar la fluidez general y la diversidad. No se especifican el numero de tokens de entrenamiento, la composicion exacta del dataset, los hiperparametros de GRPO (tamano de grupo, tasa de aprendizaje, numero de pasos) ni el regimen de precision. La model card no aporta ningun dato adicional.

## Capacidades

- Generacion de texto condicionada, orientada a traduccion automatica segun el nombre del checkpoint (PhoMT) y las metricas de recompensa (BLEU, COMET).
- Ajuste por refuerzo para optimizar metricas de traduccion directamente, lo que puede mejorar la fidelidad lexica y la calidad estimada por modelos de evaluacion.
- Generacion conversacional, segun el tag `conversational` del repositorio.
- Capacidad de razonamiento y codigo heredada del modelo base Qwen3-1.7B, aunque no verificada tras el ajuste.
- Soporte de tool calling: no confirmado en la informacion disponible.
- Soporte de agentes y razonamiento multi-paso: no confirmado.
- Capacidades multilingues: no confirmadas; el nombre sugiere par chino-vietnamita.
- Modo thinking, vision o audio: no disponible.

## Casos de uso

- Traduccion chino-vietnamita especializada: el modelo puede desplegarse como traductor de dominio acotado, aprovechando el ajuste SFT sobre PhoMT y el refinamiento con recompensas BLEU/COMET para textos de ese par linguistico.
- Investigacion en RL para generacion condicionada: sirve como banco de pruebas reproducible para estudiar el efecto de GRPO sin KL sobre modelos pequenos y metricas automaticas de traduccion.
- Evaluacion comparativa de funciones de recompensa: permite analizar como la optimizacion directa de BLEU y COMET afecta a la calidad linguistica frente a metodos con penalizacion KL.
- Fine-tuning de bajo coste en una sola GPU: al ser un adaptador LoRA sobre un modelo de 1,7B, se puede entrenar y servir en hardware de consumo, lo que facilita experimentos academicos con recursos limitados.
- Prototipado de pipelines de traduccion en entornos con restricciones de memoria: el modelo base cuantizado en 4 u 8 bits cabe en GPUs de gama media, permitiendo iterar rapidamente sobre datos propios.
- Base para posteriores ajustes SFT o DPO: el adaptador puede fusionarse con el modelo base y reutilizarse como punto de partida para otras tareas o pares de idiomas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo base de 1,7B en FP16 requiere aproximadamente 3,4 GB solo para pesos; en 8 bits, unos 1,7 GB; en 4 bits, alrededor de 1 GB. A ello hay que sumar el adaptador LoRA (repo de 0,3 GB) y la memoria de activaciones y cache KV.
- GPU recomendadas: para FP16, una RTX 3060 de 12 GB o superior es suficiente; para cuantizacion 4 bits, una RTX 3050 de 8 GB o incluso GPUs integradas con suficiente memoria unificada. En servidor, A100 o H100 no son necesarias para este tamano, aunque permitirian mayor throughput por batch.
- Cabe en GPU de consumo: si, en la mayoria de GPUs consumer modernas con 8 GB o mas, especialmente con cuantizacion.
- Opciones de despliegue: transformers con PEFT para cargar el adaptador, vLLM o TGI tras fusionar el adaptador con el modelo base, y llama.cpp u Ollama si se convierte a GGUF.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3-1.7B-noKL-PhoMT-GRPO-BLEU-COMET | 1,7B (adaptador LoRA) | No disponible | Traduccion con GRPO sin KL sobre PhoMT | No disponible | Hugging Face (0 descargas) |
| Qwen3-1.7B (base) | 1,7B | No disponible en esta ficha | Modelo generalista multilingue | Apache 2.0 (segun familia Qwen3) | Hugging Face |
| Adaptadores SFT de traduccion comparables | Variable | No disponible | SFT supervisado sin RL | Variable | Hugging Face |

No se dispone de datos de rendimiento para establecer una comparacion cuantitativa con alternativas.

## Limitaciones y advertencias

- Model card practicamente vacia: no se documentan datos de entrenamiento, hiperparametros, evaluacion ni condiciones de uso, lo que impide validar las afirmaciones implicitas en el nombre del checkpoint.
- Licencia no especificada: no se puede confirmar si el uso comercial esta permitido; debe verificarse con el autor y con la licencia del modelo base Qwen3.
- Riesgo de sobreoptimizacion de metricas: el uso de GRPO sin termino KL puede provocar reward hacking sobre BLEU y COMET, con degradacion de fluidez, diversidad y coherencia fuera del dominio de traduccion.
- Riesgo de alucinacion: como todo modelo generativo de 1,7B, puede producir contenido factualmente incorrecto, especialmente en tareas distintas de la traduccion.
- Idiomas no confirmados: el soporte real de chino-vietnamita es una inferencia del nombre, no una especificacion oficial.
- Sesgos: no documentados; el modelo hereda los sesgos del corpus PhoMT y del modelo base Qwen3.
- Contexto maximo no confirmado tras el ajuste: no se garantiza que el adaptador preserve la ventana de contexto nativa del modelo base.
- Sin adopcion ni validacion externa: cero descargas y cero likes en el momento de la consulta, sin evidencia de uso en produccion.

## Enlaces

- Hugging Face: https://huggingface.co/huggingtime12/Qwen3-1.7B-noKL-PhoMT-GRPO-BLEU-COMET
- Modelo base del adaptador: https://huggingface.co/huggingtime12/Qwen3-1.7B-PhoMT-SFT-Merged
- Paper de referencia sobre impacto ambiental citado en la model card: https://arxiv.org/abs/1910.09700
- Calculadora de impacto ML: https://mlco2.github.io/impact#compute
