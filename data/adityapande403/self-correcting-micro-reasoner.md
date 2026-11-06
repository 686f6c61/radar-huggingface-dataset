# Adityapande403/Self-Correcting-Micro-Reasoner

## Resumen

Self-Correcting Micro-Reasoner es un ajuste fino del modelo Qwen2.5-1.5B-Instruct (1.543.714.304 parametros) desarrollado por Adityapande403, orientado a razonamiento matematico de varios pasos con formato estructurado y capacidad de autocorreccion. El modelo se entrena en tres fases: un cold-start supervisado para imponer el formato `<think>...</think><answer>...</answer>`, seguido de dos rondas de Group Relative Policy Optimization (GRPO) con recompensas verificables (RLVR) sobre problemas aritmeticos y algebraicos.

La propuesta es inusual por su escala: demuestra que un transformer denso de 1.5B parametros puede pasar del 28% al 67% de exactitud en un conjunto de test de 100 problemas mediante una combinacion de SFT de formato, RLVR sin critico aprendido y voto por consenso en tiempo de inferencia (Self-Consistency con K=8). El autor documenta de forma explicita la progresion de metricas por etapa, incluyendo tasas de parseo, regresiones en autocorreccion y Pass@8.

Es relevante ahora porque ofrece un caso reproducible de post-entrenamiento con GRPO sobre hardware de consumo (una RTX 5060 Ti de 16 GB) y porque cuantifica con detalle el coste y el beneficio del computo en tiempo de test en modelos pequenos. La licencia Apache 2.0 y el formato safetensors facilitan su reutilizacion, aunque el alcance declarado es estrictamente matematico y en ingles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (Qwen2.5-1.5B-Instruct), ajuste fino con adapter LoRA segun tags |
| Parametros totales | 1.543.714.304 |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; el autor no documenta GGUF ni cuantizaciones) |
| Idiomas soportados | en |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (tamano del repo: 3.2 GB) |

## Arquitectura y entrenamiento

El modelo parte de Qwen2.5-1.5B-Instruct, un transformer decoder-only denso con 1.54B parametros. Sobre esa base se aplica un post-entrenamiento en tres etapas: (1) Stage B, SFT cold-start de 250 pasos para forzar el formato de razonamiento con etiquetas `<think>` y `<answer>`; (2) Stage D1, GRPO de 100 pasos con G=4 rollouts y recompensas matematicas deterministas y verificables (RLVR), sin critico aprendido; (3) Stage D2, GRPO escalado de 150 pasos con G=8 rollouts y temperatura T=0.8 para ampliar la exploracion y reducir el abandono de gradientes de varianza cero.

La innovacion principal no esta en la arquitectura sino en el procedimiento: RLVR con recompensas verificables sobre un modelo de 1.5B, medicion explicita de la longitud de salida para descartar length hacking (la P95 baja de 226.0 a 201.0 tokens tras GRPO) y escalado en tiempo de test mediante voto mayoritario por consenso (K=8, T=0.7, top_p=0.9). El autor reporta que el prompting de verificacion sin estructura de revision (Exp B) degrada la exactitud al 6.00% por sobrepensamiento, mientras que un protocolo estricto de dos pasadas de revision solo mejora +2.00% neto con un coste de 2.21x tokens.

## Capacidades

- Generacion de texto con razonamiento matematico explicito en formato `<think>...</think><answer>...</answer>`.
- Resolucion de problemas aritmeticos estructurados, algebra de primaria y secundaria, geometria, y problemas de movimiento y tasas.
- Autocorreccion en dos pasadas: el modelo puede revisar su respuesta inicial, con una tasa de correccion del 26.09% sobre errores iniciales y una tasa de regresion del 18.52% sobre aciertos iniciales.
- Escalado en tiempo de inferencia mediante Self-Consistency: 8 rollouts con voto mayoritario elevan la exactitud del 57% al 67%.
- Respuestas parseables de forma fiable: 100% de tasa de parseo exitoso tras el SFT de formato, frente al 38% del modelo base.
- Capacidades multilingues: solo ingles declarado.
- Tool calling / function calling: no documentado por el autor.
- Soporte de agentes y multi-step reasoning: no documentado; el razonamiento multi-paso se limita al dominio matematico.
- Vision, audio o thinking mode nativo: no disponible.

## Casos de uso

- Tutoria automatica de matematicas escolares: el modelo genera pasos intermedios en `<think>` y una respuesta final parseable en `<answer>`, lo que permite a un sistema educativo extraer y validar la solucion de forma programatica. Adecuado por su 100% de tasa de parseo tras el SFT.
- Generacion de datasets de razonamiento verificable: usar Pass@8 (81% de problemas con al menos una trayectoria correcta) para minar cadenas de razonamiento correctas y construir corpus de entrenamiento para modelos mayores.
- Evaluacion de pipelines de RLVR en hardware de consumo: el autor lo entrena en una RTX 5060 Ti de 16 GB, por lo que sirve como banco de pruebas de GRPO con recompensas deterministas sin critico aprendido.
- Verificacion de calculos en pipelines internos: integrado como segundo verificador sobre respuestas de modelos mayores en tareas aritmeticas, aprovechando el voto por consenso K=8 para reducir errores de calculo.
- Prototipado de razonamiento con restricciones de VRAM: al ser un modelo de 1.54B en safetensors (3.2 GB de repo), cabe en GPUs de consumo para experimentacion con decodificacion multi-rollout.
- Investigacion sobre autocorreccion y sobrepensamiento: el autor publica tasas de correccion, regresion y el fallo del prompting de verificacion (6% de exactitud), lo que lo convierte en un caso de estudio reproducible sobre cuando la revision ayuda y cuando perjudica.
- Generacion de problemas matematicos resueltos con formato consistente para benchmarks internos de evaluacion.

## Benchmarks y rendimiento

Resultados reportados por el autor sobre un conjunto de test retenido de N=100 problemas matematicos:

| Configuracion | Exactitud | Tasa de parseo | Salida invalida | Tokens medios de salida |
|---|---|---|---|---|
| Stage A: base sin modificar (greedy) | 28.00% | 38.00% | 62.00% | 389.4 |
| Stage B: SFT cold-start (greedy) | 54.00% | 100.00% | 0.00% | 131.2 |
| Stage D1: SFT + GRPO (G=4, greedy) | 58.00% | 100.00% | 0.00% | 138.7 |
| Stage D2: GRPO escalado (G=8, greedy) | 57.00% | 100.00% | 0.00% | 138.0 |
| Stage D1 + Consensus@8 voto mayoritario | 65.00% | 100.00% | 0.00% | 1075.5 (8 rollouts) |
| Stage D2 + Consensus@8 voto mayoritario | 67.00% | 100.00% | 0.00% | 1082.0 (8 rollouts) |
| Stage D2 Pass@8 (cota superior oraculo) | 81.00% | 100.00% | 0.00% | 1082.0 (8 rollouts) |

Autocorreccion (protocolo estricto de dos pasadas, 50 muestras retenidas, Exp C):

| Metrica | Valor |
|---|---|
| Exactitud en primera pasada | 54.00% (27/50) |
| Exactitud tras revision | 56.00% (28/50) |
| Tasa de correccion (falso a verdadero) | 26.09% (6 de 23 errores) |
| Tasa de regresion (verdadero a falso) | 18.52% (5 de 27 aciertos) |
| Cambio neto de exactitud | +2.00% absoluto |
| Sobrecoste de tokens | 2.21x (265.8 vs 120.2 tokens) |
| Verificacion por prompting (Exp B) | 6.00% de exactitud |

No se han publicado resultados en benchmarks estandar (MMLU, GSM8K, HumanEval) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 3.1 GB en fp16 para los 1.54B parametros, mas overhead de KV cache; el autor indica que el entrenamiento se ejecuto en una RTX 5060 Ti de 16 GB.
- GPU recomendadas: cualquier GPU con al menos 4-6 GB de VRAM para inferencia en fp16; RTX 3060, RTX 4060, RTX 4090, A100 y H100 son suficientes. Para entrenamiento GRPO, el autor uso una RTX 5060 Ti (Blackwell sm_120).
- Cabe en GPU de consumo: si, en practicamente todas las GPU modernas de consumo con 6 GB o mas.
- Opciones de despliegue: no documentadas por el autor; al publicarse en safetensors sobre Qwen2.5, es compatible con vLLM, TGI, llama.cpp (previa conversion a GGUF) y Ollama (previa conversion).
- Latencia y throughput: no disponibles. El coste en tiempo de test es notable con consenso K=8: 1082 tokens medios de salida frente a 138 en modo greedy, es decir, aproximadamente 7.8x mas tokens generados por consulta.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Self-Correcting Micro-Reasoner | 1.54B | no disponible | Razonamiento matematico con GRPO/RLVR y consenso | Apache 2.0 | Hugging Face |
| Qwen2.5-1.5B-Instruct (base) | 1.54B | no disponible en esta ficha | Chat general instruido | Apache 2.0 | Hugging Face |
| Qwen2.5-Math-1.5B-Instruct | 1.54B | no disponible en esta ficha | Razonamiento matematico especializado | Apache 2.0 | Hugging Face |
| DeepSeek-R1-Distill-Qwen-1.5B | 1.54B | no disponible en esta ficha | Destilacion de razonamiento con cadenas largas | MIT | Hugging Face |

La comparacion cuantitativa con estos modelos no esta disponible en la informacion proporcionada: el autor solo reporta metricas contra el modelo base sin modificar (28% de exactitud). No se han publicado resultados en benchmarks estandar que permitan una comparacion directa con alternativas de la misma categoria.

## Limitaciones y advertencias

- Alcance estrictamente matematico: el autor declara fuera de alcance el chat conversacional general, la respuesta a preguntas factuales no matematicas y los calculos de alto riesgo (financiero, medico, legal) sin verificacion externa determinista.
- Solo ingles: el modelo no declara soporte multilingue.
- Riesgo de alucinacion aritmetica: incluso con Pass@8 al 81%, el 19% de los problemas no tiene ninguna trayectoria correcta entre 8 muestras, lo que indica errores de calculo persistentes.
- La autocorreccion no es fiable: la tasa de regresion (18.52%) es solo ligeramente inferior a la de correccion (26.09%), con un beneficio neto de +2.00% a cambio de 2.21x tokens. El prompting de verificacion sin estructura (Exp B) degrada la exactitud al 6.00%.
- El rendimiento del 67% depende del voto por consenso K=8, que multiplica el coste de inferencia aproximadamente 7.8x en tokens generados.
- El conjunto de evaluacion es pequeno (N=100 para el benchmark principal, N=50 para autocorreccion) y no se han publicado resultados en benchmarks estandar, lo que limita la comparabilidad.
- El modelo esta etiquetado con `lora` en los tags pero el repositorio contiene safetensors de 3.2 GB con 1.543.714.304 parametros; conviene verificar si los pesos son el modelo fusionado o un adapter antes de desplegarlo.
- Sin datos publicados sobre sesgos, contexto maximo soportado ni tool calling; no recomendable en produccion sin evaluacion propia en el dominio objetivo.

## Enlaces

- Hugging Face: https://huggingface.co/Adityapande403/Self-Correcting-Micro-Reasoner
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-1.5B-Instruct
- Paper de GRPO (DeepSeekMath): no disponible en la busqueda web proporcionada
- Repositorio de codigo, blog o demo: no disponible en la busqueda web proporcionada
