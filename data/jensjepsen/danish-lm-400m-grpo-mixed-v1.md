# jensjepsen/danish-lm-400m-grpo-mixed-v1

## Resumen

`jensjepsen/danish-lm-400m-grpo-mixed-v1` es un modelo de lenguaje generativo en danés, desarrollado por jensjepsen, que combina seguimiento de instrucciones y razonamiento matemático mediante entrenamiento con GRPO (Group Relative Policy Optimization). El modelo parte de una base SFT (`danish-lm-400m-sft-v31-avg-top3`) y se entrena con un esquema de recompensas intercaladas: ejemplos de GSM8K para matemáticas y de IFEval-DA para cumplimiento de instrucciones. El repositorio contiene tres checkpoints (best1, best2, best3) seleccionados por una métrica compuesta que pondera igualmente IFEval-DA y GSM8K.

El nombre del repositorio sugiere 400 millones de parámetros, aunque la documentación no confirma explícitamente el tamaño. No se especifican la arquitectura interna ni la longitud de contexto. El modelo está pensado para tareas de generación de texto en danés, con especial énfasis en instrucciones formales y problemas aritméticos. Su licencia Apache 2.0 permite uso comercial sin restricciones, y los pesos se distribuyen en formato safetensors.

La relevancia de este modelo radica en ser una opción de tamaño reducido y especializada en danés, un idioma con pocos recursos en el ecosistema de modelos abiertos. Al estar entrenado con GRPO, incorpora una técnica de optimización de preferencias que mejora la adherencia a instrucciones y el razonamiento paso a paso, aunque su rendimiento en tareas generales de conocimiento es limitado, como muestran las evaluaciones.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parametros totales | no disponible (el nombre del repo sugiere 400M, sin confirmar) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (solo safetensors) |
| Idiomas soportados | da (danes) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura interna no se detalla en la documentacion. Por el pipeline (`text-generation`) y el nombre del repositorio, se trata de un modelo de lenguaje autoregresivo de tipo transformer, probablemente con 400 millones de parametros, pero no hay confirmacion oficial. No se indica si usa atencion lineal, decodificacion especulativa u otras innovaciones.

El entrenamiento se realizo en dos fases. Primero, una base SFT (`danish-lm-400m-sft-v31-avg-top3`) que proporciona el comportamiento inicial. Despues, un ajuste con GRPO (Group Relative Policy Optimization) sobre un conjunto de datos mixto: `danish-if-grpo-combined-v1` (10 000 ejemplos de IFEval-DA) intercalado con `danish-gsm8k:sft:train` (aproximadamente 7500 ejemplos de GSM8K), en proporcion 50/50. La recompensa se asigna por ejemplo: `reward_gsm8k` para filas de GSM8K y `reward_ifeval_combined` (que combina 46 restricciones propias con el esquema de Google IFEval) para filas de IFEval. El entrenamiento se reanudo desde un checkpoint intermedio (`danish-lm-400m-grpo-if-combined-v1-step2400`) y los tres snapshots finales se seleccionaron mediante un tracker de mejor-K que evalua la metrica compuesta `ifeval-da prompt-strict + inst-strict + gsm8k pass@1`.

## Capacidades

- Generacion de texto en danes: produce respuestas coherentes y gramaticalmente correctas en este idioma.
- Seguimiento de instrucciones formales: entrenado con IFEval-DA, respeta restricciones como cambios de mayusculas, formatos especificos o respuestas con argumentos.
- Razonamiento matematico: resuelve problemas aritmeticos de nivel escolar (GSM8K) con una tasa de exito moderada.
- Respuesta a preguntas de conocimiento general: evaluado en SciQ, aunque con rendimiento limitado.
- Resumen y reescritura de textos: muestra resultados aceptables en metricas chrF++ para tareas de resumen y reescritura.
- Capacidad de elegir entre multiples opciones: evaluado en tareas de opcion multiple (CITMC, SciQ-MC, PIQA, ARC), con resultados variables.
- No se documenta soporte para tool calling, agentes, vision, audio ni otros modos especiales.

## Casos de uso

- Atencion al cliente automatizada en danes: el modelo puede generar respuestas a consultas frecuentes en un chat de una sola vuelta, utilizando el formato `<|user|>{pregunta}<|end|><|assistant|>`. Su entrenamiento en IFEval-DA ayuda a mantener un tono y formato consistentes, aunque no se especifica la longitud de contexto para conversaciones largas.
- Tutor de matematicas para estudiantes de primaria: gracias a su entrenamiento en GSM8K, puede explicar pasos para resolver problemas aritmeticos sencillos, generando razonamientos paso a paso en danes.
- Generacion de resumenes de documentos en danes: la evaluacion en `textman_summary` muestra que puede condensar textos manteniendo la informacion clave, util para automatizar resumenes de articulos o informes.
- Reescritura de contenido en danes: puede reformular parrafos manteniendo el significado, como indica su rendimiento en `textman_rewrite`, aplicable a la edicion de textos o la variacion de redaccion.
- Asistente de estudio para ciencias: con la capacidad de responder preguntas de SciQ, puede proporcionar respuestas a cuestiones de ciencia general, aunque con precision limitada.
- Evaluacion de cumplimiento de instrucciones en sistemas de IA: al estar entrenado con IFEval-DA, puede servir como modelo de referencia para probar pipelines de generacion que deban respetar restricciones formales, como cambios de mayusculas o formatos de salida.

## Benchmarks y rendimiento

La model card proporciona resultados de evaluacion offline en fp16, comparando los tres checkpoints con la base SFT. No se incluyen comparaciones con otros modelos externos.

### IFEval-DA (n=539)

| metrica | base | best1-3375 | best2-4375 | best3-3250 |
|---|---|---|---|---|
| composite | — | **1.028** | 1.019 | 1.014 |
| prompt-strict | 21.2 | **29.9** | 28.2 | 29.3 |
| prompt-loose | 22.0 | **30.6** | 29.9 | 29.7 |
| inst-strict | 35.2 | **45.0** | 44.9 | 44.5 |
| inst-loose | 35.8 | 45.6 | **46.1** | 44.9 |

### Generacion

| eval | base | best1-3375 | best2-4375 | best3-3250 |
|---|---|---|---|---|
| GSM8K pass@1 (n=1317) | 17.39 | 24.37 | **25.89** | 24.60 |
| SciQ open-Q pass@1 (n=1000) | 13.50 | **14.10** | 13.60 | 13.80 |
| CIT-gen (n=720) | 29.86 | 28.6 | 28.5 | **29.2** |
| textman_summary chrF++ | 41.11 | 40.67 | 40.84 | **40.94** |
| textman_rewrite chrF++ | 46.51 | **47.24** | 46.80 | 47.20 |

### Multiple-choice (chat-MC)

| eval | base | best1-3375 | best2-4375 | best3-3250 |
|---|---|---|---|---|
| CITMC (n=720) | 48.19 | 49.58 | **50.14** | 48.75 |
| SciQ-MC (n=1000) | — | 59.6 | 59.5 | 59.6 |
| PIQA (n=100 full test) | 53 (n=50) | 59.0 | 59.0 | 59.0 |
| ARC-Easy chat-MC | 44.40 | **42.68** | 42.55 | 42.55 |
| ARC-Challenge chat-MC | 29.35 | **29.01** | 28.92 | 28.33 |

### Multiple-choice (raw log-prob)

| eval | base | best1-3375 | best2-4375 | best3-3250 |
|---|---|---|---|---|
| ARC-Easy logprob (n=2376) | 40.61 | **40.45** | 40.07 | **40.45** |
| ARC-Challenge logprob (n=1172) | 27.47 | 27.30 | 27.56 | **27.47** |

Los resultados muestran una mejora clara en GSM8K e IFEval-DA respecto a la base, pero una ligera caida en tareas de conocimiento general como ARC. Los tres checkpoints son muy similares entre si, con diferencias de aproximadamente 1 punto porcentual.

## Requisitos de hardware

No se proporcionan requisitos oficiales de hardware en la documentacion. Dado el tamaño estimado de 400 millones de parametros, se puede inferir lo siguiente:

- VRAM estimada: en fp16, los pesos ocupan aproximadamente 800 MB; con overhead de inferencia, se necesitarian entre 1 y 2 GB de VRAM.
- GPU recomendadas: cualquier GPU consumer con al menos 4 GB de VRAM (por ejemplo, GTX 1650, RTX 3060) seria suficiente. Tambien es ejecutable en CPU con suficiente RAM.
- Despliegue: al ser un modelo de tipo transformer estandar, puede servirse con vLLM, llama.cpp, Ollama o TGI, aunque no se ha verificado su compatibilidad especifica.
- Latencia y throughput: no se han publicado mediciones. Para un modelo de 400M, se espera una latencia de decenas de milisegundos por token en GPU moderna, pero no hay datos oficiales.

## Comparativa con modelos similares

No se dispone de informacion sobre otros modelos daneses de tamaño comparable en la documentacion proporcionada. La unica comparacion disponible es con la base SFT (`danish-lm-400m-sft-v31-avg-top3`), que se muestra en las tablas de benchmarks. El modelo GRPO mejora significativamente en GSM8K (de 17.39 a 25.89) y en IFEval-DA (prompt-strict de 21.2 a 29.9), a costa de una ligera perdida en ARC. No se puede establecer una comparativa con alternativas como modelos multilingues de tamaño similar (por ejemplo, mT5 o XGLM) porque no se han evaluado en los mismos benchmarks.

## Limitaciones y advertencias

- No se documentan sesgos especificos, pero al ser un modelo entrenado principalmente con datos en danes, puede reflejar sesgos culturales o linguisticos de ese dominio.
- Riesgo de alucinacion: como todo modelo generativo, puede producir respuestas factualmente incorrectas, especialmente en tareas de conocimiento general (SciQ y ARC muestran precisiones bajas).
- Limitaciones de contexto: no se especifica la longitud de contexto, por lo que no se recomienda su uso en conversaciones largas o documentos extensos sin validacion previa.
- Rendimiento limitado en razonamiento complejo: las puntuaciones en ARC-Challenge (alrededor del 29%) indican dificultades con tareas que requieren inferencia avanzada.
- Restricciones de licencia: la licencia Apache 2.0 permite uso comercial, pero se debe mantener el aviso de copyright y atribucion.
- El repositorio contiene tres checkpoints con rendimientos ligeramente diferentes; es necesario seleccionar el adecuado segun la tarea (best1 para IF, best2 para matematicas, best3 para equilibrio general).
- No se incluyen pesos de optimizador ni configuracion de entrenamiento, solo pesos de inferencia.

## Enlaces

- [HuggingFace - danish-lm-400m-grpo-mixed-v1](https://huggingface.co/jensjepsen/danish-lm-400m-grpo-mixed-v1)
- [Modelo base SFT - danish-lm-400m-sft-v31-avg-top3](https://huggingface.co/jensjepsen/danish-lm-400m-sft-v31-avg-top3)
- [Checkpoint intermedio GRPO - step2400](https://huggingface.co/jensjepsen/danish-lm-400m-grpo-if-combined-v1-step2400)
- [Dataset de entrenamiento - danish-if-grpo-combined-v1](https://huggingface.co/datasets/jensjepsen/danish-if-grpo-combined-v1)
- [Dataset GSM8K en danes - danish-gsm8k](https://huggingface.co/datasets/jensjepsen/danish-gsm8k)
- [Codigo de entrenamiento - github.com/jensjepsen/small-esperanto-llm](https://github.com/jensjepsen/small-esperanto-llm)
