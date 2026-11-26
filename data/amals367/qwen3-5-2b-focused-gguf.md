# AmaLS367/Qwen3.5-2B-Focused-GGUF

## Resumen

Qwen3.5-2B-Focused es una variante del modelo Qwen3.5-2B obtenida mediante edicion de pesos (weight editing) sin reentrenamiento. El autor, AmaLS367, parte de la abliteration Heretic de Qwen3.5-2B realizada por saidutta69 y aplica una intervencion quirurgica sobre las activaciones internas del modelo para reducir la tendencia a la reverificacion excesiva. El objetivo no es mejorar el conocimiento del modelo, sino hacer que deje de "dudar de si mismo" y entregue antes la respuesta que ya habia encontrado.

El problema que aborda es concreto y medible: los modelos de razonamiento pequenos tienden a entrar en bucles de auto-verificacion ("Wait, let me double check...") que consumen el presupuesto de tokens incluso despues de haber alcanzado la respuesta correcta. En tareas con un limite de 4000 tokens, el modelo original agotaba el presupuesto en 34 de 100 tareas; la variante Focused reduce la mediana de tokens por tarea de 3909 a 2243 y aumenta las tareas finalizadas de 52 a 66.

El modelo conserva la arquitectura, el tamano (1.881.825.088 parametros) y el formato GGUF Q8_0 del original. Se distribuye bajo licencia Apache 2.0 y esta pensado para inferencia local con llama.cpp. La relevancia actual reside en que demuestra que es posible modificar el comportamiento de razonamiento de un modelo mediante edicion de direcciones en el espacio de activaciones, sin fine-tuning ni datos adicionales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer basado en Qwen3.5 (incluye capas DeltaNet con salida SSM; no se detalla la configuracion completa) |
| Parametros totales | 1.881.825.088 (aprox. 1.88B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF Q8_0 (unica cuantizacion publicada en el repo) |
| Idiomas soportados | no disponible (la model card menciona tareas en ingles y ruso en la evaluacion) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (Q8_0); tamano del repo 2.0 GB |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura de Qwen3.5-2B, un transformer que segun la model card incluye capas DeltaNet con salida `ssm_out`, ademas de capas de atencion convencionales (`attn_output` en la capa 15). No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset ni si hubo RLHF o DPO en el modelo original; la model card no detalla estos aspectos.

La innovacion tecnica central es un procedimiento de edicion de pesos sin gradientes. El autor registro el estado interno del modelo justo antes de frases de reverificacion (`Wait`, `Hmm`, `Actually`, `Let's check`, `verify`, `re-read`) y antes de frases ordinarias, sobre 33 trazas de razonamiento. La diferencia entre ambas condiciones define una direccion en la capa 18 que representa la "intencion de reverificar". Un probe entrenado con `Let's check` tambien detecta `Wait` (AUC 0.74 en un sentido, 0.79 en el otro), lo que confirma que la direccion captura un concepto compartido y no una palabra concreta. En las capas 13 a 18 se modifican los pesos que escriben en el residual stream (`ffn_down`, la salida de atencion, `ssm_out` en capas DeltaNet y `attn_output` en la capa 15) mediante la formula `W ← W − 0.75 · d (dᵀ W)`. Solo cambian 12 tensores, cada uno aproximadamente un 1.6%, y el resultado se recuantiza a Q8_0. No hay entrenamiento por gradiente en ningun punto del proceso.

## Capacidades

- Generacion de texto conversacional y razonamiento paso a paso con modo de pensamiento (thinking mode), heredado de Qwen3.5.
- Razonamiento aritmetico y modular, ordenacion, tareas de calendario, deteccion de contradicciones e informacion insuficiente, y problemas algoritmicos (categorias evaluadas en el conjunto de 100 tareas).
- Reduccion de la reverificacion redundante: la edicion elimina aproximadamente el 75% de la direccion de "reverificar lo que ya se tiene", lo que acorta las trazas de razonamiento.
- Generacion en formato estructurado (`ANSWER: ...`), aunque con fallos ocasionales de formato en tareas de contradiccion.
- Capacidad multilingue limitada: la evaluacion incluye tareas de calendario en ingles y ruso; no se especifica la cobertura completa de idiomas.
- No se documenta soporte de tool calling, function calling, agentes multi-paso, vision ni audio en la informacion disponible.

## Casos de uso

- Razonamiento local con presupuesto de tokens ajustado: en entornos con limite estricto de tokens (por ejemplo, 2000-4000), el modelo finaliza mas tareas dentro del presupuesto gracias a la reduccion de la mediana de 3909 a 2243 tokens por tarea. Adecuado para pipelines donde el coste por token importa.
- Despliegue en hardware de consumo: con 1.88B parametros en Q8_0 (aproximadamente 2 GB), cabe en GPUs consumer y en CPU, lo que permite ejecutar razonamiento local sin infraestructura dedicada.
- Clasificacion y resolucion de problemas aritmeticos y logicos: tareas de aritmetica, aritmetica modular y ordenacion que el modelo resuelve dentro del presupuesto, utiles en validacion automatizada de pipelines.
- Deteccion de contradicciones en texto: el modelo aborda tareas de contradiccion e informacion insuficiente, aunque con fallos de formato documentados (`ANSWER: CONTRADICTION: ...` en lugar de `ANSWER: CONTRADICTION`), lo que requiere un parser tolerante.
- Investigacion en interpretabilidad y edicion de pesos: el modelo sirve como caso reproducible de edicion de direcciones en activaciones (script de reproduccion incluido), util para estudiar control de comportamiento sin reentrenamiento.
- Generacion conversacional ligera: al conservar la pipeline de text-generation y el formato GGUF, puede integrarse en interfaces conversacionales locales con llama.cpp u Ollama.
- Evaluacion comparativa de metodos de abliteration y edicion: al partir de una abliteration Heretic, permite estudiar el efecto combinado de ambas tecnicas sobre el comportamiento del modelo.

## Benchmarks y rendimiento

Evaluacion sobre 100 tareas generadas (aritmetica, aritmetica modular, ordenacion, calendario, contradiccion, informacion insuficiente, algoritmicos), una muestra por tarea, presupuesto de 4000 tokens, muestreo recomendado de Qwen:

| Metrica | Antes de la edicion | Focused |
|---|---|---|
| Tareas finalizadas con respuesta | 52 | 66 (+14 / −0) |
| Correctas (parse tolerante) | 49 | 61 (p = 0.004) |
| Correctas (formato estricto `ANSWER:`) | 47 | 56 (+15 / −6, p = 0.078) |
| Mediana de tokens por tarea | 3909 | 2243 |
| Tokens totales | 296k | 250k |
| Finalizadas con respuesta mal parseada | 3 | 5 |

ARC-Challenge (split de test completo, 1172 preguntas, zero-shot, log-likelihood, modelo cargado en 4-bit nf4, mismo script para ambos modelos):

| Metrica | Base (Heretic) | Focused | Cambio |
|---|---|---|---|
| Accuracy (`acc`) | 35.67% (418/1172) | 35.75% (419/1172) | +1 pregunta |
| Accuracy normalizada (`acc_norm`) | 39.08% (458/1172) | 39.51% (463/1172) | +5 preguntas |

Prueba pareada: los modelos discrepan en solo 17 preguntas para `acc` (8 solo Base, 9 solo Focused, p = 1.00) y 13 para `acc_norm` (4 vs 9, p = 0.27). No se observa cambio medible en conocimiento general. MMLU, GSM8K y otros benchmarks no han sido evaluados segun la model card.

## Requisitos de hardware

- VRAM estimada: aproximadamente 2 GB para el archivo Q8_0 (tamano del repo 2.0 GB); el modelo se evaluo en 4-bit nf4 para ARC-Challenge, lo que reduce aun mas el requisito.
- GPU recomendadas: cualquier GPU consumer con 4 GB o mas de VRAM (RTX 3060, RTX 4060, RTX 4090); tambien cabe en A100 y H100, aunque es sobredimensionado para este tamano.
- Cabe en GPU consumer: si, en practicamente todas las GPU consumer modernas, y tambien en CPU.
- Opciones de despliegue: llama.cpp (ejemplo oficial con `llama-cli`), y por compatibilidad GGUF, Ollama y otros runners de llama.cpp. No se documenta soporte de vLLM ni TGI para este artefacto.
- Latencia y throughput: no disponibles. La model card solo reporta la mediana de tokens generados por tarea (2243 frente a 3909), no tiempos de ejecucion.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.5-2B-Focused | 1.88B | no disponible | 66/100 tareas finalizadas; ARC-Challenge acc 35.75% | Apache 2.0 | GGUF Q8_0 en HF |
| saidutta69/Qwen3.5-2B-heretic (base) | 1.88B | no disponible | 52/100 tareas finalizadas; ARC-Challenge acc 35.67% | Apache 2.0 (heredada) | HF |
| Qwen/Qwen3.5-2B (original) | 1.88B | no disponible | no disponible en esta informacion | Apache 2.0 | HF |

La comparativa se limita a la cadena de derivacion del propio modelo, ya que la informacion proporcionada no incluye datos de otros modelos de 2B comparables. No se dispone de resultados de MMLU, GSM8K ni HumanEval para ninguno de los tres.

## Limitaciones y advertencias

- Una sola muestra por tarea, un unico modelo base y un unico generador de tareas; el ruido de una sola ejecucion es de aproximadamente ±2 tareas por cada 30.
- Las tareas de calendario permanecen en 0/15: el modelo no puede calcular el dia de la semana de una fecha arbitraria y la edicion no anade conocimiento.
- La intensidad de la edicion importa: al 100% se elimina la autoverificacion util y el modelo produce respuestas erroneas con confianza; el 75% es el compromiso probado.
- Solo se ha verificado sobre este modelo base concreto; no hay garantia de que la direccion de edicion transfiera a otros modelos.
- En benchmarks estandar solo se ha evaluado ARC-Challenge; MMLU, GSM8K y otros no se han probado.
- Fallos de formato documentados: el modelo escribe `ANSWER: CONTRADICTION: ...` en lugar de `ANSWER: CONTRADICTION`, lo que rompe parsers estrictos; se recomienda parseo tolerante.
- Riesgo de alucinacion: inherente al modelo base de 2B; la edicion no lo mitiga y podria agravar respuestas erroneas confiadas si se aplica con mayor intensidad.
- Sesgos: la abliteration Heretic del modelo base elimina mecanismos de rechazo, lo que puede aumentar la generacion de contenido no filtrado; no se documentan evaluaciones de sesgo.
- Idiomas: no se especifica la cobertura completa; la evaluacion solo menciona ingles y ruso en tareas de calendario.
- Licencia Apache 2.0 permite uso comercial, pero la abliteration subyacente puede implicar riesgos de contenido que conviene evaluar antes de produccion.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/AmaLS367/Qwen3.5-2B-Focused-GGUF
- Modelo base (Heretic): https://huggingface.co/saidutta69/Qwen3.5-2B-heretic
- Modelo original Qwen3.5-2B: https://huggingface.co/Qwen/Qwen3.5-2B
- Heretic (herramienta de abliteration): https://github.com/p-e-w/heretic
