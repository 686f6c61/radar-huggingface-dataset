# BurnyCoder/novelty-es-qwen2.5-0.5b-main-seed0-gen100

## Resumen

Novelty ES continuation-seed0-gen100 (main) es un ajuste fino experimental del modelo Qwen2.5-0.5B-Instruct, desarrollado por BurnyCoder y publicado en Hugging Face bajo licencia Apache 2.0. No se trata de un modelo de propósito general, sino de un checkpoint resultante de un estudio piloto sobre entrenamiento mediante estrategias de evolución (evolution strategies, ES) aplicadas a una tarea aritmética concreta: el problema de "countdown", que consiste en construir una expresión legal que alcance un objetivo numérico a partir de un conjunto de números dados.

El modelo parte de la arquitectura Qwen2 (transformer decoder-only) con 494.032.768 parámetros y hereda las capacidades conversacionales del modelo base Qwen2.5-0.5B-Instruct. La contribución del autor es metodológica: compara dos variantes de ES (una con señal de novedad en el archivo de élites y otra solo con recompensa) continuando el entrenamiento hasta 100 generaciones desde el checkpoint de la generación 19. El checkpoint publicado corresponde al brazo "main" (con novedad).

Su relevancia es acotada y de investigación: documenta un protocolo preregistrado, con evaluación sobre un conjunto fresco de 2048 problemas, y concluye que la hipótesis de mejora direccional no se sostiene en esta semilla. Es útil para quien estudie ES aplicadas a LLM, no como modelo listo para producción general.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2) |
| Parametros totales | 494.032.768 |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada (el modelo base Qwen2.5-0.5B-Instruct soporta 32.768 tokens, segun la familia Qwen2.5) |
| Tipos de cuantizacion | No disponible (pesos publicados en safetensors, presumiblemente FP32 segun la model card) |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only de la familia Qwen2, con 494 millones de parametros, inicializado desde Qwen/Qwen2.5-0.5B-Instruct (revision `7ae557604adf67be50417f59c2c2f167def9a775`). El entrenamiento no es un fine-tuning supervisado clasico ni RLHF, sino una busqueda por estrategias de evolucion sobre los pesos del modelo, orientada a resolver problemas de countdown (construir expresiones aritmeticas legales que alcancen un objetivo). El autor continua el checkpoint de la generacion 19 en FP32 hasta la generacion 100, preservando el archivo de elites, los generadores de numeros aleatorios y los calendarios globales; el unico cambio de entrenamiento respecto al piloto original es la duracion.

La evaluacion se realiza sobre un conjunto fresco de 2048 problemas que excluye todas las combinaciones de numeros usadas anteriormente, con el conjunto de test original como evaluacion secundaria. El estudio es de una sola semilla y el propio autor advierte que no mide robustez entre semillas. No hay innovaciones de inferencia (decodificacion especulativa, atencion lineal, etc.) ni datos sobre composicion del corpus de entrenamiento mas alla de la tarea aritmetica. La model card indica explicitamente que se trata de una adaptacion aritmetica solo para investigacion, sin evidencia de mejoras generales en lenguaje.

## Capacidades

- Generacion de texto conversacional heredada del modelo base Qwen2.5-0.5B-Instruct.
- Resolucion de problemas de countdown: dado un conjunto de numeros y un objetivo, generar expresiones aritmeticas legales (segun la model card, produce mas expresiones legales en problemas de tres y cuatro numeros que el checkpoint anterior y que el modelo original).
- Razonamiento aritmetico basico dentro de la tarea de countdown.
- Soporte de tool calling / function calling: no documentado en la informacion proporcionada (el modelo base lo soporta, pero este checkpoint no lo declara).
- Soporte de agentes y razonamiento multi-paso: no documentado.
- Capacidades multilingues: no documentadas; los idiomas soportados figuran como no disponibles.
- Capacidades especiales (vision, audio, thinking mode): no disponibles.
- Generacion con `pass@k`: la evaluacion reporta pass@1 y pass@8 sobre la tarea de countdown.

## Casos de uso

- Investigacion en estrategias de evolucion aplicadas a LLM: el checkpoint sirve como punto de comparacion reproducible frente al brazo reward-only y al modelo original, con protocolo preregistrado y semilla fija.
- Reproduccion de experimentos de countdown: util para validar pipelines de evaluacion sobre conjuntos frescos de problemas aritmeticos y medir tasas de legalidad de expresiones.
- Estudio de degradacion o transferencia de capacidades: permite analizar cuanto del comportamiento conversacional del modelo base se conserva tras una adaptacion aritmetica agresiva por ES.
- Baseline de bajo coste en entornos con recursos limitados: con 494 millones de parametros cabe en GPU de consumo y sirve para pruebas de infraestructura de inferencia (transformers, TGI) antes de escalar a modelos mayores.
- Docencia y divulgacion sobre metaheuristicas: ejemplo concreto y documentado de como se entrena un LLM sin gradientes mediante ES, con artefactos y procedencia publicados.
- Analisis de expresiones generadas: el modelo puede usarse para generar candidatos de expresiones aritmeticas que luego un verificador filtre, en el contexto de experimentos sobre verificacion y recompensa.

## Benchmarks y rendimiento

Resultados reportados en la model card sobre el conjunto fresco de 2048 problemas de countdown:

| Condicion | Precision fresca | Intervalo 95% | Precision dura | pass@1 | pass@8 | Estado |
|---|---|---|---|---|---|---|
| original (Qwen2.5-0.5B-Instruct) | 0,24% | 0,05% - 0,49% | 0,10% | 0,12% | 0,89% | completo |
| main (este checkpoint) | 7,37% | 6,25% - 8,50% | 0,39% | 2,27% | 10,66% | completo |
| reward_only (control) | 7,71% | 6,54% - 8,89% | 0,88% | 2,47% | 11,95% | completo |

El autor senala que la hipotesis de mejora direccional no se sostiene en esta semilla: la precision del brazo main no supera a la del brazo reward-only y el intervalo pareado incluye cero. Ambos brazos mejoran sobre sus checkpoints anteriores y sobre el modelo original en el mismo conjunto fresco. No se han publicado resultados de benchmarks generales (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP32: aproximadamente 2 GB solo para pesos (494 M parametros x 4 bytes), mas overhead de activaciones y KV cache.
- VRAM estimada en FP16/BF16: aproximadamente 1 GB para pesos.
- VRAM estimada en cuantizacion de 8 bits: aproximadamente 0,5 GB; en 4 bits, aproximadamente 0,25 GB (estimaciones teoricas; no se publican GGUF ni cuantizaciones oficiales).
- GPU recomendadas: cualquier GPU con al menos 4-8 GB de VRAM para FP32 con contexto moderado; RTX 3060, RTX 4060, RTX 4090, A100 o H100 son sobredimensionadas para este tamano.
- Cabe holgadamente en GPU de consumo (GTX 1660, RTX 2060 en adelante) y en CPU para inferencia lenta.
- Opciones de despliegue: transformers (libreria declarada), text-generation-inference (tag `text-generation-inference` y `endpoints_compatible`). No se documentan soporte de vLLM, llama.cpp u Ollama, ni pesos GGUF.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Enfoque | Rendimiento en countdown (fresco) |
|---|---|---|---|---|---|
| Este modelo (main) | 494 M | No disponible | Apache 2.0 | ES con novedad sobre Qwen2.5-0.5B-Instruct | 7,37% precision fresca |
| reward_only (control del mismo estudio) | 494 M | No disponible | Apache 2.0 (presumible) | ES solo con recompensa | 7,71% precision fresca |
| Qwen2.5-0.5B-Instruct (base) | 494 M | 32.768 tokens (familia Qwen2.5) | Apache 2.0 | Instruccion general | 0,24% precision fresca |
| Qwen2.5-1.5B-Instruct | 1.540 M (aprox.) | 32.768 tokens (familia Qwen2.5) | Apache 2.0 | Instruccion general | No disponible |

La comparacion relevante es interna al estudio: el checkpoint main no supera al control reward-only en esta semilla. Frente al modelo base, ambos brazos entrenados mejoran de forma notable en la tarea especifica, a costa de un ajuste muy estrecho.

## Limitaciones y advertencias

- Modelo de investigacion: la model card declara explicitamente que es una adaptacion aritmetica solo para investigacion y que no hay evidencia de mejoras generales en lenguaje.
- Una sola semilla: el estudio no mide robustez entre semillas; los intervalos excluyen la variabilidad de semilla de entrenamiento.
- Hipotesis no confirmada: la mejora direccional del brazo con novedad no se sostiene; el intervalo pareado incluye cero.
- Riesgo de alucinacion y de expresiones ilegales: aunque aumenta la legalidad de las expresiones en problemas de tres y cuatro numeros, la legalidad no implica alcanzar el objetivo.
- Posible degradacion de capacidades generales tras el ajuste por ES: no documentada, pero plausible dado el entrenamiento estrecho sobre countdown.
- Idiomas soportados no documentados; no se garantiza un comportamiento multilingue fiable.
- Sin datos de sesgos publicados; al derivar de Qwen2.5-0.5B-Instruct, hereda los sesgos del modelo base.
- Uso comercial: la licencia Apache 2.0 lo permite, pero el autor lo etiqueta como solo para investigacion; conviene revisar el repositorio de procedencia antes de cualquier despliegue.
- Procedencia incompleta: el intento de entrenamiento original se interrumpio y el autor documenta una recuperacion parcial; el checkpoint main se reutiliza sin cambios, pero el historial de ejecucion es complejo.
- Sin cuantizaciones oficiales ni pesos GGUF publicados; el despliegue en entornos de bajos recursos requiere conversion propia.

## Enlaces

- Hugging Face: https://huggingface.co/BurnyCoder/novelty-es-qwen2.5-0.5b-main-seed0-gen100
- Repositorio de procedencia, preregistro y limitaciones: https://github.com/BurnyCoder/evolutionary-strategies-novelty-search-llm-training
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-0.5B-Instruct
