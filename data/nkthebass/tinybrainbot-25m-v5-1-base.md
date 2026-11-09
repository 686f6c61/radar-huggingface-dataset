# nkthebass/tinybrainbot-25m-v5.1-base

## Resumen

TinyBrainBot-25M-v5.1-Base es un modelo de lenguaje de tipo base (no instruido) desarrollado por el usuario independiente nkthebass, entrenado desde cero sobre 12.700 millones de tokens. Se trata de la continuacion de la version v4 con la receta v5.1, que incorpora una fase final de decaimiento de la tasa de aprendizaje sobre datos de preguntas y respuestas cientificas, libros de texto escolares, texto denso en hechos y matematicas reales. El modelo declara 25,2 millones de parametros en el transformer mas 5,4 millones en un embedding atado para un vocabulario de 14.000 tokens, lo que da un total real de 30.554.496 parametros segun los pesos en safetensors.

El modelo es relevante como referencia de investigacion en el regimen de modelos ultrapequenos: demuestra que con un presupuesto de computo modesto y una mezcla de datos cuidadosamente curada (incluyendo FineWeb-Edu, DCLM, Cosmopedia, SmolLM-Corpus, FineMath, OpenMathInstruct-2 y The Stack Smol, entre otros) se pueden obtener mejoras medibles en tareas de sentido comun y ciencia de nivel escolar. Su interes practico no reside en capacidad bruta, sino en servir de banco de pruebas para tecnicas de entrenamiento, tokenizacion y evaluacion en el extremo inferior de la escala.

La arquitectura es un transformer decoder-only con atencion de consultas agrupadas (GQA) y embeddings atados, distribuido con pesos en safetensors y GGUF bajo licencia Apache 2.0. Solo soporta ingles y esta pensado como punto de partida para fine-tuning, no como modelo de uso directo en produccion conversacional.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only con GQA y embeddings atados |
| Parametros totales | 30.554.496 (25,2 M en el transformer + 5,4 M de embedding atado) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | GGUF disponible; niveles concretos no especificados |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors, GGUF |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only de 25,2 millones de parametros con atencion de consultas agrupadas (GQA) y embedding de tokens atado a la cabeza de salida, lo que reduce el recuento efectivo de parametros y mejora la eficiencia en un modelo de este tamano. El vocabulario es de 14.000 tokens, deliberadamente pequeno para un modelo de lenguaje, lo que abarata el embedding y concentra la capacidad en las capas del transformer. No se especifica el numero de capas, dimension oculta ni numero de cabezas en la informacion disponible.

El entrenamiento se realizo desde cero sobre 12.700 millones de tokens, con una mezcla que incluye FineWeb-Edu, DCLM-Baseline 1.0, DCLM-Ultra 1.1, FactBase-DCLM, Wikipedia, Cosmopedia, SmolLM-Corpus, FineMath, MegaMath-Web-Pro-Max, FinePDFs-Edu, The Stack Smol, Project Gutenberg, BookCorpusOpen, Gooaq, ELI5, FinePhrase, OpenMathInstruct-2 y Orca-Math-Word-Problems-200k. La receta v5.1 anade una fase final de decaimiento de la tasa de aprendizaje sobre datos de Q&A cientifico, libros de texto escolares, texto denso en hechos y matematicas, lo que explica las mejoras observadas en ARC, MMLU y ArithMark-3 respecto a v4. No se menciona uso de RLHF ni DPO; es un modelo base puro.

## Capacidades

- Generacion de texto autoregresiva en ingles, como modelo base sin ajuste de instrucciones.
- Razonamiento de sentido comun y ciencia de nivel escolar (ARC, SciQ, OpenBookQA).
- Aritmetica basica y problemas matematicos de nivel elemental (ArithMark-3, datos de OpenMathInstruct-2 y Orca-Math).
- Continuacion de texto y modelado de lenguaje (LAMBADA, HellaSwag).
- Comprension lectora y respuesta a preguntas factuales de formato multiple (BoolQ, MMLU).
- Capacidad multilingue limitada exclusivamente al ingles.
- No se declara soporte de tool calling, function calling, agentes ni modos de razonamiento extendido (thinking mode).
- No dispone de vision ni audio.

## Casos de uso

- Investigacion sobre entrenamiento de modelos ultrapequenos: sirve como linea base reproducible para estudiar el efecto de mezclas de datos, tokenizadores y recetas de decaimiento en el regimen de 25-30 M de parametros, comparando directamente con v4.
- Fine-tuning academico en dominios acotados: al ser un modelo base Apache 2.0 de 0,2 GB, se puede reentrenar en una unica GPU consumer para tareas de clasificacion o generacion especifica (por ejemplo, preguntas de ciencias de secundaria).
- Evaluacion de tecnicas de cuantizacion y despliegue: los pesos GGUF permiten medir el impacto de la cuantizacion en un modelo diminuto y validar pipelines de llama.cpp u Ollama con latencia minimas.
- Pruebas de infraestructura de inferencia: por su tamano cabe en CPU y en cualquier GPU, lo que lo hace util para validar integraciones con TGI, vLLM o endpoints compatibles antes de escalar a modelos mayores.
- Educacion y divulgacion: permite ilustrar de forma tangible como se comporta un modelo de lenguaje a escala minima, incluyendo sus fallos y alucinaciones, en cursos de aprendizaje automatico.
- Generacion de texto auxiliar de bajo coste: continuacion de frases o plantillas en ingles donde la calidad no es critica y prima el consumo energetico casi nulo.
- Benchmarking de arneses de evaluacion: sus resultados publicados en lm-eval-harness v0.4.13 permiten verificar la configuracion de un arnes propio contra cifras de referencia.

## Benchmarks y rendimiento

Resultados declarados por el autor, 0-shot, float32, conjuntos de test completos, EleutherAI lm-eval-harness v0.4.13. No verificados de forma independiente.

| Benchmark | v5.1 | v4 |
|---|--:|--:|
| ARC-Easy (acc_norm) | 46,93 | 42,09 |
| ARC-Challenge (acc_norm) | 30,80 | 24,91 |
| HellaSwag (acc_norm) | 29,73 | 28,86 |
| PIQA (acc_norm) | 61,97 | 60,23 |
| OpenBookQA (acc_norm) | 31,20 | 31,20 |
| SciQ (acc_norm) | 64,10 | 65,90 |
| WinoGrande (acc) | 51,54 | 52,57 |
| BoolQ (acc) | 53,79 | 57,77 |
| LAMBADA OpenAI (acc) | 22,32 | 22,78 |
| MMLU (acc) | 24,74 | 23,69 |
| CommonsenseQA (acc) | 21,62 | 20,31 |
| Social IQa (acc) | 37,10 | 37,15 |
| ArithMark-3 (acc_norm) | 46,70 | 35,20 |
| Open SLM Leaderboard Intelligence Index | 18,50 | 12,54 |

## Requisitos de hardware

- VRAM para inferencia: inferior a 1 GB en float32 (30,6 M de parametros, unos 122 MB de pesos) y en torno a 50-60 MB en cuantizaciones GGUF de 4 bits, sin contar overhead de runtime.
- GPU recomendadas: cualquier GPU con al menos 1 GB de VRAM; funciona en RTX 4090, A100 o H100 sin aprovechar su capacidad, y de hecho el cuello de botella sera el lanzamiento de kernels, no la memoria.
- Cabe holgadamente en GPU consumer (GTX 1050, RTX 3060, integradas con suficiente memoria compartida) y en CPU.
- Opciones de despliegue: transformers, llama.cpp, Ollama (via GGUF), text-generation-inference (el repo declara compatibilidad con endpoints); vLLM es tecnicamente posible pero sobredimensionado para este tamano.
- Latencia y throughput: no se han publicado mediciones; por el tamano, se espera generacion en el orden de cientos a miles de tokens por segundo en GPU moderna, pero es una estimacion no confirmada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| TinyBrainBot-25M-v5.1-Base | 30,6 M (25,2 M transformer) | no disponible | Apache 2.0 | Entrenado desde cero, solo ingles, base |
| TinyBrainBot-25M-v4-Base | 25 M aprox. | no disponible | Apache 2.0 | Version anterior; v5.1 mejora en ARC, MMLU y aritmetica |
| SmolLM-135M (HuggingFaceTB) | 135 M | 2.048 tokens | Apache 2.0 | Aproximadamente 4-5 veces mayor; usado como fuente de datos en el entrenamiento |
| GPT-2 small | 124 M | 1.024 tokens | MIT | Referencia historica de escala similar en orden de magnitud |

La comparacion con SmolLM-135M y GPT-2 small es orientativa: no se dispone de resultados de benchmarks de este modelo frente a ellos en las mismas condiciones en la informacion proporcionada, por lo que no se ofrece una comparacion numerica directa.

## Limitaciones y advertencias

- Modelo base sin ajuste de instrucciones: no sigue instrucciones de forma fiable ni mantiene conversaciones coherentes sin fine-tuning previo.
- Riesgo elevado de alucinacion y de texto incoherente por su capacidad parametrica (25 M) y su ventana de contexto no documentada.
- Solo entrenado en ingles; no se garantiza ningun comportamiento en castellano u otros idiomas.
- Resultados de benchmarks declarados por el autor y no verificados de forma independiente (`verified: false` en la model card).
- Rendimiento bajo en tareas de conocimiento general (MMLU 24,74; CommonsenseQA 21,62), muy por debajo de modelos de mayor escala.
- No dispone de tool calling, agentes, vision ni audio; no es adecuado para produccion conversacional.
- Licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantias ni soporte; el modelo se distribuye tal cual.
- La longitud de contexto no esta documentada, lo que impide planificar usos con entradas largas sin verificacion empirica.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/nkthebass/tinybrainbot-25m-v5.1-base
- Version anterior v4: https://huggingface.co/nkthebass/tinybrainbot-25m-v4-base
- Arnes de evaluacion: https://github.com/EleutherAI/lm-evaluation-harness
- Dataset FineWeb-Edu: https://huggingface.co/datasets/HuggingFaceFW/fineweb-edu
- Dataset DCLM-Baseline 1.0: https://huggingface.co/datasets/mlfoundations/dclm-baseline-1.0
- Dataset Cosmopedia: https://huggingface.co/datasets/HuggingFaceTB/cosmopedia
- Dataset SmolLM-Corpus: https://huggingface.co/datasets/HuggingFaceTB/smollm-corpus
- Dataset FineMath: https://huggingface.co/datasets/HuggingFaceTB/finemath
- Dataset OpenMathInstruct-2: https://huggingface.co/datasets/nvidia/OpenMathInstruct-2
