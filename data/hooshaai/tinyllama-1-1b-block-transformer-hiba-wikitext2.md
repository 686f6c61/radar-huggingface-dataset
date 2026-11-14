# Hooshaai/tinyllama-1.1b-block-transformer-hiba-wikitext2

## Resumen

TinyLlama-1.1b-block-transformer-hiba-wikitext2 es un checkpoint experimental publicado por el usuario Hooshaai dentro del proyecto NeuralOps, una iniciativa de "cirugía de atención" (attention surgery) sobre modelos LLaMA. El modelo parte de TinyLlama/TinyLlama_v1.1, un decoder LLaMA de 1.100 millones de parámetros y 22 capas, y sustituye el mecanismo de atención cuadrática estándar por un operador denominado BlockTransformerHIBA, de familia adaptativa y con atención subcuadrática, en 17 de las 22 capas del decoder.

El objetivo del checkpoint no es ofrecer un modelo de propósito general, sino demostrar empíricamente que es posible reemplazar la atención densa por un esquema jerárquico de bloques con atención intra-bloque densa e inter-bloque dispersa top-k, unificadas bajo un único softmax, y recuperar calidad mediante destilación de conocimiento desde el modelo profesor. La evaluación se realiza exclusivamente sobre WikiText-2 (split de validación), donde el modelo alcanza una perplejidad de 22,01 frente a los 8,73 del profesor original.

Su relevancia actual es metodológica: documenta de forma reproducible el coste de la cirugía (perplejidad de 231,91 en zero-shot antes de destilación), el proceso de recuperación (221 pasos de optimización en una RTX 3090 en 150,4 segundos) y el ahorro en disco (310,80 MB de pesos frente a 2,05 GB del base en FP16). Es, por tanto, un artefacto de investigación sobre eficiencia de atención más que un modelo listo para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder LLaMA con atención BlockTransformerHIBA (híbrida: 17/22 capas con atención de bloques jerárquica, 5 capas ancla cuadráticas en índices [3, 7, 11, 15, 19]) |
| Parametros totales | 1.100 millones (heredados de TinyLlama_v1.1; hidden_size=2048, 22 capas, 32 cabezas Q y 4 KV con GQA 8:1, head_dim=64, sin bias) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la información proporcionada (el modelo base TinyLlama_v1.1 soporta 2.048 tokens, pero el checkpoint no lo declara explícitamente) |
| Tipos de cuantizacion | no disponible (los pesos se distribuyen en FP16 safetensors; no se documentan variantes GGUF, AWQ ni GPTQ) |
| Idiomas soportados | inglés (en) |
| Licencia | MIT |
| Formato de pesos | safetensors (attention_weights.safetensors, FP16, solo atención y layernorms del decoder; 265 tensores) |

## Arquitectura y entrenamiento

El modelo conserva el esqueleto de TinyLlama_v1.1: un decoder LLaMA de 22 capas con hidden_size 2048, atención GQA con 32 cabezas de consulta y 4 de clave/valor (ratio 8:1) y head_dim 64, sin sesgos. La intervención quirúrgica sustituye el módulo self_attn en 17 de las 22 capas por BlockTransformerHIBA, que combina atención densa intra-bloque con atención dispersa top-k entre bloques no locales, agregando ambas puntuaciones bajo un único softmax sobre el vector concatenado [intra_scores | inter_scores]. Las 5 capas restantes ([3, 7, 11, 15, 19]) se mantienen como anclas cuadráticas para preservar capacidad de modelado global. Los MLPs, embed_tokens y lm_head quedan congelados y excluidos del artefacto publicado.

El entrenamiento es una destilación de conocimiento en dos etapas (66 pasos en la etapa 1 y 155 en la etapa 2, total 221 pasos) ejecutada en una NVIDIA GeForce RTX 3090 de 24 GB, con un pico de VRAM de 18.381 MB y una duración total de 150,4 segundos. La evaluación se realiza sobre WikiText-2 (wikitext-2-raw-v1, validación). El resultado clave es la recuperación de perplejidad: de 231,91 en zero-shot tras la cirugía a 22,01 tras la destilación, frente a los 8,73 del profesor. El artefacto serializado ocupa 310,80 MB (325.896.304 bytes), un 85,2 % menos que el base completo en FP16 (2,05 GB), con un manifiesto de cirugía en schema neuralops.surgery/v2.

## Capacidades

- Generación de texto causal en inglés, heredada del modelo base TinyLlama_v1.1.
- Modelado de lenguaje con atención subcuadrática: la atención jerárquica por bloques reduce el coste computacional teórico respecto a la atención densa en secuencias largas, aunque el checkpoint no documenta ganancias medidas de latencia o throughput.
- Capacidad de continuación de texto sobre dominio Wikipedia, dado que la destilación se realizó sobre WikiText-2.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- No se documenta modo thinking, visión ni audio.
- Multilingüismo: limitado a inglés según la model card.
- Compatibilidad con la API NeuralOps Hub mediante `load_surgeried_model`, que reconstruye el modelo completo a partir del delta de atención.

## Casos de uso

- Investigación en eficiencia de atención: sirve como referencia reproducible para medir el impacto de sustituir atención densa por esquemas jerárquicos dispersos en un decoder LLaMA pequeño, con métricas de perplejidad antes y después de destilación documentadas.
- Experimentación con destilación de conocimiento: el par de valores 231,91 → 22,01 en 221 pasos y 150 segundos permite estudiar la velocidad de recuperación de calidad tras una cirugía agresiva de atención en una sola GPU de consumo.
- Prototipado de operadores de atención: el código fuente del operador (`neuralops/layers/adaptive/block_transformer_hiba.py`) y el manifiesto de cirugía permiten reutilizar el esquema en otros modelos de la zoo.
- Docencia y divulgación sobre arquitecturas de atención: el checkpoint ilustra de forma concreta la diferencia entre atención cuadrática, dispersa y jerárquica por bloques con un caso medido.
- Pruebas de despliegue ligero: con 310,80 MB de pesos de atención y un modelo base de 2,05 GB, es viable en GPUs de consumo para experimentos de generación de texto en inglés sobre dominios similares a Wikipedia.
- Evaluación comparativa de checkpoints de la zoo NeuralOps: al compartir base y protocolo de evaluación, permite comparar distintos operadores de atención sobre el mismo conjunto WikiText-2.
- Análisis de artefactos comprimidos: el formato de delta de atención con manifiesto es un caso de estudio para pipelines de distribución de pesos quirúrgicos.

## Benchmarks y rendimiento

| Metrica | Profesor (TinyLlama_v1.1) | Pre-destilacion (zero-shot) | Post-destilacion (final) | Delta |
|---|---:|---:|---:|---:|
| Perplejidad en WikiText-2 (wikitext-2-raw-v1, validacion) | 8,73 | 231,91 | 22,01 | -209,90 |

No se han publicado otros resultados de benchmarks (MMLU, HumanEval, GSM8K u otros) en la información disponible. El valor de perplejidad 22,01 está declarado por el autor y marcado como no verificado en el model-index.

## Requisitos de hardware

- VRAM para inferencia: el artefacto de atención ocupa 310,80 MB en FP16, pero requiere cargar el modelo base TinyLlama_v1.1 (2,05 GB en FP16) para reconstruir el modelo completo. Estimación práctica: entre 3 y 4 GB de VRAM en FP16 para el modelo completo, más overhead del runtime.
- GPU de entrenamiento documentada: NVIDIA GeForce RTX 3090 (24 GB), con pico de 18.381 MB durante la destilación.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM para inferencia en FP16; RTX 3090, RTX 4090, A100 o H100 para reentrenamiento o destilación.
- Cabe en GPU de consumo: sí, en tarjetas con 4 GB o más (RTX 3050, RTX 3060, RTX 4060 y superiores).
- Opciones de despliegue: la model card solo documenta la API `neuralops.hub.load_surgeried_model`. No se documenta compatibilidad con vLLM, llama.cpp, Ollama ni TGI, y al no publicarse pesos en GGUF no es desplegable directamente en esos runtimes sin conversión.
- Latencia y throughput: no disponibles. El modelo declara atención subcuadrática, pero no se publican mediciones de tokens por segundo ni de latencia.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Perplejidad WikiText-2 | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| tinyllama-1.1b-block-transformer-hiba-wikitext2 | 1.100 M | no disponible | 22,01 (validación, no verificado) | MIT | Hugging Face, requiere librería neuralops |
| TinyLlama/TinyLlama_v1.1 (profesor) | 1.100 M | 2.048 tokens | 8,73 (referencia del autor) | Apache 2.0 | Hugging Face, transformers |
| Otros checkpoints de la zoo NeuralOps | 1.100 M | no disponible | no disponible | MIT | Hugging Face |

No se dispone de datos de benchmarks de modelos comparables de terceros en la información proporcionada para establecer una comparación cuantitativa adicional.

## Limitaciones y advertencias

- La perplejidad final (22,01) es 2,5 veces superior a la del profesor (8,73): la cirugía de atención degrada sustancialmente la calidad del modelado de lenguaje.
- El resultado de perplejidad está declarado por el autor y marcado como `verified: false` en el model-index; no ha sido validado de forma independiente.
- El checkpoint solo contiene pesos de atención y layernorms del decoder (265 tensores); no es un modelo autónomo y requiere el base TinyLlama_v1.1 y la librería neuralops para funcionar.
- Solo se evalúa en WikiText-2; no hay evidencia de comportamiento en otros dominios, tareas de instrucción, código o matemáticas.
- Idioma limitado a inglés; no se documenta soporte multilingüe.
- No se documentan capacidades de tool calling, agentes ni razonamiento multi-paso, por lo que no es adecuado para pipelines de agentes en producción.
- Riesgo de alucinación inherente a un modelo de 1.100 M parámetros con perplejidad elevada; no se han publicado evaluaciones de fidelidad factual.
- No se documentan sesgos conocidos ni evaluaciones de seguridad.
- No se publican pesos en GGUF ni cuantizaciones alternativas, lo que limita el despliegue en runtimes estándar de inferencia.
- Aunque la licencia es MIT, el modelo base TinyLlama_v1.1 tiene su propia licencia (Apache 2.0) que debe respetarse al redistribuir.
- El autor del repositorio en Hugging Face (Hooshaai) y el autor citado del proyecto (Taha Majlesi) aparecen con identificadores distintos; conviene verificar la trazabilidad antes de usarlo en producción.

## Enlaces

- Hugging Face: https://huggingface.co/Hooshaai/tinyllama-1.1b-block-transformer-hiba-wikitext2
- Modelo base: https://huggingface.co/TinyLlama/TinyLlama_v1.1
- Repositorio NeuralOps: https://github.com/tahamajs/NeuralOps
- Implementación del operador BlockTransformerHIBA: https://github.com/tahamajs/NeuralOps/blob/main/neuralops/layers/adaptive/block_transformer_hiba.py
- Licencia MIT del proyecto: https://github.com/tahamajs/NeuralOps/blob/main/LICENSE
- Dataset WikiText-2: https://huggingface.co/datasets/Salesforce/wikitext
