# simak31/tinyzero-countdown-19m

## Resumen

tinyzero-countdown-19m es un modelo de lenguaje decoder-only de aproximadamente 18,88 millones de parametros, desarrollado por simak31 como un experimento de investigacion para reproducir el pipeline de DeepSeek R1-Zero a escala minima. El modelo se entrena desde cero (from scratch) y se post-entrena con GRPO (Group Relative Policy Optimization) para resolver puzzles aritmeticos tipo Countdown: dado un conjunto de numeros y un objetivo, debe encontrar una ecuacion que use cada numero exactamente una vez y alcance el objetivo.

El modelo es relevante porque documenta de forma transparente los fallos y aprendizajes del proceso de entrenamiento a escala reducida: desde la proporcion Chinchilla-optima de tokens por parametro hasta el problema de la divergencia loss-accuracy en el fine-tuning supervisado, pasando por la decision de entrenar un vocabulario BPE propio de 8192 tokens en lugar de usar el tokenizador de GPT-2 para evitar que la tabla de embeddings domine el presupuesto de parametros. El resultado final es un modelo especializado en una unica tarea, con una mejora de precision modesta pero honestamente reportada tras el entrenamiento con RL.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only con RoPE, RMSNorm, GQA, SwiGLU MLP y embeddings atados |
| Parametros totales | ~18,88 M (verificados exactamente, no estimados) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 256 tokens |
| Tipos de cuantizacion | No disponible (solo checkpoint en precision completa) |
| Idiomas soportados | No disponible (entrenado principalmente con datos en ingles de FineWeb-Edu) |
| Licencia | MIT |
| Formato de pesos | Checkpoint PyTorch (pytorch_model.pt) |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only con 10 capas, dimension de modelo 384, 6 cabezas de atencion con 2 cabezas KV (grouped-query attention implementada via `F.scaled_dot_product_attention`), embeddings posicionales RoPE, normalizacion RMSNorm, MLP con activacion SwiGLU y embeddings atados (tied embeddings). El vocabulario es un BPE propio de 8192 tokens entrenado sobre el corpus de preentrenamiento, una decision que reduce la sobrecarga de la tabla de embeddings al ~17% de los parametros totales, frente al 60-75% que habria supuesto usar un vocabulario estandar de 50k tokens.

El preentrenamiento uso aproximadamente 380 millones de tokens de FineWeb-Edu mas texto aritmetico sintetico, con una proporcion de ~20:1 tokens por parametro (proporcion Chinchilla-optima). Un intento anterior con 116M de parametros y 150M de tokens (proporcion 1,3:1) mostro una brecha saludable entre loss de entrenamiento y validacion pero una generalizacion debil. Tras el preentrenamiento, se intento un SFT con formato de instruccion que resulto en un fracaso total (0% de precision en generacion a pesar de una loss aparentemente buena), atribuido a una brecha de distribucion entre el formato nativo del corpus y el fraseo de instrucciones. La solucion fue omitir el wrapper de instrucciones y aplicar GRPO directamente sobre el checkpoint preentrenado con su formato de prompt nativo, usando un verificador exacto de ecuaciones como recompensa binaria con credito parcial, normalizacion de ventaja relativa al grupo, clipping estilo PPO y penalizacion KL contra un modelo de referencia congelado.

## Capacidades

- Resolucion de puzzles aritmeticos tipo Countdown: dado un conjunto de numeros y un objetivo, genera una ecuacion que usa cada numero exactamente una vez para alcanzar el objetivo.
- Razonamiento aritmetico basico con operaciones de suma, resta, multiplicacion y division.
- Generacion de texto autoregresiva con formato de prompt nativo especifico: `Numbers: [12, 45, 7, 3], Target: 88, Equation:`.
- Capacidad de razonamiento emergente via entrenamiento con refuerzo (GRPO), siguiendo la linea de DeepSeek R1-Zero y TinyZero.
- No soporta tool calling, ni agentes, ni vision, ni audio.
- La fluidez textual general es debil; el modelo esta especializado exclusivamente en la tarea Countdown.

## Casos de uso

- Investigacion en RL aplicada a modelos pequenos: el modelo sirve como banco de pruebas para estudiar como el entrenamiento con refuerzo desarrolla capacidades de razonamiento en modelos de ~19M de parametros, con un coste computacional minimo.
- Reproduccion de pipelines R1-Zero: permite replicar el flujo completo de preentrenamiento, SFT fallido y GRPO en una sola GPU, ideal para tesis, cursos o experimentos academicos.
- Validacion de hipotesis sobre vocabularios pequenos: el uso de un BPE de 8192 tokens entrenado a medida demuestra como reducir el dominio de la tabla de embeddings en modelos pequenos, un resultado directamente aplicable a otros experimentos de escalado.
- Generacion de datos sinteticos de puzzles aritmeticos: el modelo puede generar ecuaciones validas para Countdown que sirvan como datos de entrenamiento o evaluacion para otros sistemas.
- Estudio de la divergencia loss-accuracy en SFT: el caso documentado de SFT con loss baja y precision 0% es un caso de estudio util para entender los limites de la loss como metrica de calidad en modelos pequenos.
- Benchmark de referencia para comparar tecnicas de RL: al ser un checkpoint publico con resultados reportados (31,6% a 34,4% de precision), puede usarse como linea base para comparar variantes de GRPO, PPO u otros algoritmos de optimizacion con politica.

## Benchmarks y rendimiento

El autor reporta un unico resultado de evaluacion: precision sobre un conjunto de 250 problemas Countdown retenidos (held-out), antes y despues del entrenamiento GRPO.

| Modelo | Precision (250 problemas held-out) |
|---|---|
| tinyzero-countdown-19m (checkpoint preentrenado) | 31,6% |
| tinyzero-countdown-19m (tras GRPO, ~500 pasos) | 34,4% |

La mejora es de +2,8 puntos porcentuales. El autor advierte explicitamente que el resultado es modesto, se ejecuto solo ~500 pasos en un modelo de 18,9M de parametros y no es un resultado grande ni altamente significativo. No se han publicado resultados en benchmarks estandar como MMLU, HumanEval o GSM8K.

## Requisitos de hardware

- VRAM estimada para inferencia: menos de 1 GB. Con 18,88M de parametros en float32, el checkpoint ocupa aproximadamente 75 MB; en float16, unos 38 MB.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM es suficiente; incluso una CPU moderna puede ejecutar inferencia sin problemas.
- Compatibilidad con GPU de consumo: si, cabe en cualquier GPU consumer, incluidas las integradas.
- Opciones de despliegue: el modelo se carga directamente con PyTorch usando el codigo de ejemplo del autor. No se menciona compatibilidad con vLLM, llama.cpp, Ollama o TGI; al ser un checkpoint PyTorch con arquitectura personalizada, requiere el codigo del repositorio del autor para cargarse.
- Latencia y throughput: no disponibles, pero con 19M de parametros y contexto de 256 tokens, la generacion es practicamente instantanea en cualquier hardware moderno.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Entrenamiento | Licencia |
|---|---|---|---|---|---|
| tinyzero-countdown-19m | ~18,88 M | 256 | Countdown aritmetico | Pretraining + GRPO | MIT |
| TinyZero (Jiayi-Pan) | Variable (0,5B-1,5B) | Variable | Countdown y otros | RL sobre modelos base existentes | MIT |
| DeepSeek R1-Zero | 671B (MoE) | 128K | Razonamiento general | RL puro sobre base | MIT |

La comparativa directa es limitada porque tinyzero-countdown-19m es un modelo extremadamente pequeno y especializado. El proyecto TinyZero de Jiayi-Pan es el marco de referencia del que deriva este trabajo, pero opera con modelos base de 0,5B a 1,5B parametros (Qwen2.5, Llama) en lugar de entrenar desde cero. DeepSeek R1-Zero es la inspiracion original a escala masiva. No hay modelos comparables de ~19M de parametros especializados en Countdown publicados en la informacion disponible.

## Limitaciones y advertencias

- Modelo extremadamente pequeno (~19M de parametros): la fluidez textual general es debil y no es apto para uso generalista.
- Especializado exclusivamente en la tarea Countdown con un formato de prompt rigido: `Numbers: [a, b, c, d], Target: N, Equation:`. El fraseo en lenguaje natural degrada significativamente la calidad de la salida y no se uso en el checkpoint publicado.
- Evaluado unicamente sobre problemas Countdown generados sinteticamente; no hay evidencia de generalizacion a otros dominios.
- La mejora de precision tras GRPO es modesta (+2,8 puntos porcentuales) y el propio autor la califica como no altamente significativa.
- El contexto de 256 tokens es muy limitado, lo que impide cualquier tarea que requiera razonamiento multi-paso extenso o historial largo.
- No se proporcionan datos sobre sesgos, aunque al entrenarse con FineWeb-Edu podria heredar sesgos presentes en ese corpus.
- Riesgo de alucinacion: como cualquier modelo generativo, puede producir ecuaciones invalidas o que no usan todos los numeros; el verificador solo se aplica durante el entrenamiento, no en inferencia.
- El checkpoint requiere el codigo del repositorio del autor (model.py y config.py) para cargarse; no es un modelo estandar compatible con frameworks de inferencia convencionales.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/simak31/tinyzero-countdown-19m
- Repositorio TinyZero (Jiayi-Pan): https://github.com/Jiayi-Pan/TinyZero
- Repositorio TinyZero (aeroabir): https://github.com/aeroabir/TinyZero
- Documentacion del Countdown Demo en DeepWiki: https://deepwiki.com/Jiayi-Pan/TinyZero/7.1-tinyzero-countdown-demo
- Notas de reproduccion de TinyZero (Zhihu): https://zhuanlan.zhihu.com/p/1903191617571125117
- Reporte de TinyZero-R1-Countdown en Weights & Biases: https://wandb.ai/alpha-rl/TinyZero/reports/TinyZero-R1-Countdown-Qilong-Wu--VmlldzoxMTExOTEzMA
