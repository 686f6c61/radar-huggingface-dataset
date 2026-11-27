# ajaxdavis/alpha-nanochat-d24-v2-sft

## Resumen

alpha-nanochat-d24-v2-sft es un modelo de generacion de texto de tipo GPT resultado del fine-tuning supervisado (SFT) del modelo base alpha-nanochat-d24-v2, desarrollado por el usuario ajaxdavis. El modelo base fue preentrenado con un compilador de entrenamiento denominado Alpha sobre 2 GPUs H100, siguiendo el cronograma completo del "speedrun record" del proyecto nanochat. Este checkpoint aplica despues el propio script de SFT de nanochat (`scripts.chat_sft`) para convertirlo en un modelo conversacional.

El modelo cuenta con 1.380 millones de parametros (1,38B) y esta disenado como una alternativa ligera y reproducible para experimentacion con modelos conversacionales de pequeno tamano. Su relevancia radica en que documenta de forma exhaustiva el proceso de entrenamiento y evaluacion, incluyendo logs, configuracion de hiperparametros y resultados de benchmarks comparados con una ejecucion anterior. Sustituye a ajaxdavis/alpha-nanochat-d24-sft, cuyo entrenador tenia un defecto en el backward de FP8.

La ficha tecnica es especialmente transparente: se publican las perdidas de entrenamiento, la validacion en bits por byte (bpb) y los resultados de evaluacion en tareas como ARC, MMLU, HumanEval y SpellingBee. No obstante, el modelo es de muy pequeno tamano y sus capacidades son limitadas, orientadas a investigacion y pruebas de concepto mas que a produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer tipo GPT (nanochat d24) |
| Parametros totales | 1,38B (1.380 millones) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | Checkpoint nanochat (model_*.pt, meta_*.json); no safetensors ni GGUF |

## Arquitectura y entrenamiento

El modelo base alpha-nanochat-d24-v2 es un transformer tipo GPT de 1,38B parametros, preentrenado por un entrenador compilado con Alpha sobre 2 GPUs H100 siguiendo el cronograma completo del speedrun de nanochat. Este checkpoint aplica el SFT propio de nanochat (`scripts.chat_sft` en el commit a825e63) sobre ese modelo base, usando PyTorch exactamente como lo hace `runs/speedrun.sh`. El fine-tuning se ejecuto en 1 GPU H100 de 80GB HBM3.

El dataset de SFT consta de 1.071.759 filas durante una epoca, compuesto por SmolTalk, conversaciones de identidad de nanochat (x2), MMLU auxiliary (x3), GSM8K (x4), SimpleSpelling y SpellingBee. Se ejecutaron 486 pasos de 1.048.576 tokens, con la ultima iteracion al 100,15% de la epoca y learning rate 0. Los hiperparametros incluyen embedding LR 0.3, unembedding LR 0.008 y matrix LR 0.02. La perdida descendio de 0.828200 en el primer paso a 0.792091 en el ultimo, con una validacion minima de bpb de 0.2738. El throughput fue de 107.760 tokens/s con un MFU del 52,03%. Se uso `--load-optimizer=0` dado que el checkpoint base exportado no incluye estado del optimizador.

## Capacidades

- Generacion de texto conversacional en formato de chat tras el SFT.
- Razonamiento basico y respuesta a preguntas de conocimiento general (MMLU 36,22%).
- Razonamiento cientifico elemental (ARC-Easy 60,44%, ARC-Challenge 49,57%).
- Generacion de codigo muy limitada (HumanEval 11,59%).
- Correccion ortografica y deletreo (SpellingBee 100%, SimpleSpelling en entrenamiento).
- Resolucion de problemas matematicos basicos (GSM8K presente en el dataset de SFT, aunque no evaluado).
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y multi-step reasoning: no disponible.
- Capacidades multilingues: no disponible.
- Capacidades especiales (thinking mode, vision, audio): no disponible.

## Casos de uso

- Experimentacion academica con modelos conversacionales ligeros: el modelo es adecuado para estudiar el efecto del SFT sobre un modelo base de 1,38B, ya que se publican logs completos de entrenamiento y evaluacion.
- Reproduccion de pipelines de entrenamiento: sirve como referencia para validar el flujo `scripts.chat_sft` de nanochat en un unico H100, con hiperparametros y resultados documentados.
- Pruebas de concepto de asistentes conversacionales: puede gestionar dialogos simples de un solo turno o multi-turno corto, suficiente para prototipos de interfaz sin requisitos de calidad altos.
- Evaluacion comparativa de tecnicas de entrenamiento: permite contrastar los resultados de este SFT con los de la ejecucion anterior (por ejemplo, +11,74 puntos en ARC-Easy) para medir el impacto de corregir el defecto en el backward de FP8.
- Generacion de texto de bajo coste en hardware modesto: al ser un modelo de 1,38B, puede ejecutarse en GPUs de consumo para tareas de generacion simple sin pretensiones de alta precision.
- Investigacion sobre alucinacion y sesgos en modelos pequenos: su tamano reducido y sus benchmarks publicados lo hacen util para estudiar los limites de los modelos de esta escala en tareas de conocimiento (MMLU 36,22%).
- Educacion y demos de IA: puede emplearse en entornos docentes para ilustrar el ciclo completo de preentrenamiento y SFT con recursos limitados.

## Benchmarks y rendimiento

Evaluacion con `scripts.chat_eval -i sft` (a825e63), decodificacion greedy, batch categorico 32:

| Tarea | Este modelo | SFT de la primera ejecucion | Diferencia | Azar |
|---|---|---|---|---|
| ARC-Easy | 60,44% | 48,70% | +11,74 pts | 25% |
| ARC-Challenge | 49,57% | 38,91% | +10,66 pts | 25% |
| MMLU | 36,22% | 33,34% | +2,88 pts | 25% |
| HumanEval | 11,59% | 10,37% | +1,22 pts | 0% |
| SpellingBee | 100,00% | 99,22% | +0,78 pts | 0% |

GSM8K no se ejecuto para ninguno de los dos modelos. El CORE del modelo base no se ha evaluado aun; el modelo base de la primera ejecucion obtuvo CORE 0,2089.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; el repo ocupa 4,2 GB y el modelo tiene 1,38B parametros, por lo que en FP16 requeriria aproximadamente 2,8 GB solo para pesos.
- GPU recomendadas: el entrenamiento se realizo en 1x H100 80GB HBM3; para inferencia basta con GPUs mucho menores.
- Cabe en GPU de consumo: previsiblemente si, dado el tamano de 1,38B, aunque no se especifican requisitos oficiales.
- Opciones de despliegue: scripts propios de nanochat (`scripts.chat_cli`, `scripts.chat_web`); no se documenta soporte para vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: durante el SFT se alcanzaron 107.760 tokens/s con MFU 52,03% en 1x H100; no se publican metricas de latencia en inferencia.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| alpha-nanochat-d24-v2-sft | 1,38B | no disponible | MIT | Hugging Face |
| alpha-nanochat-d24-sft (ejecucion anterior) | 1,38B | no disponible | MIT | Hugging Face |
| alpha-nanochat-d24-v2 (base) | 1,38B | no disponible | MIT | Hugging Face |

No se dispone de datos de benchmarks de otros modelos comparables de la misma categoria en la informacion proporcionada. La comparativa mas directa es con la ejecucion anterior del mismo SFT, sobre la que este modelo mejora en todas las tareas evaluadas (ARC-Easy +11,74 pts, ARC-Challenge +10,66 pts, MMLU +2,88 pts, HumanEval +1,22 pts, SpellingBee +0,78 pts) y reduce la bpb de validacion de 0,2970 a 0,2738.

## Limitaciones y advertencias

- Rendimiento bajo en conocimiento general: MMLU del 36,22%, ligeramente por encima del azar (25%), lo que limita su uso en tareas que requieran conocimiento factual.
- Generacion de codigo muy debil: HumanEval del 11,59%, inadecuado para asistencia de programacion en produccion.
- Riesgo elevado de alucinacion: propio de modelos de 1,38B con entrenamiento limitado y sin datos de evaluacion especificos de fidelidad.
- Sesgos conocidos: no documentados en la model card; el dataset SmolTalk y las conversaciones de identidad de nanochat pueden introducir sesgos no evaluados.
- Longitud de contexto no especificada, lo que impide garantizar dialogos largos o documentos extensos.
- Idiomas soportados no documentados; el entrenamiento se basa en datasets mayoritariamente en ingles (SmolTalk, MMLU, GSM8K), por lo que el rendimiento en castellano es incierto.
- Formato de pesos propietario de nanochat (`.pt`), no compatible directamente con herramientas estandar como vLLM, llama.cpp u Ollama.
- GSM8K no evaluado, por lo que no hay evidencia publica de su capacidad matematica real.
- El CORE del modelo base no se ha medido, lo que impide comparar el preentrenamiento con la ejecucion anterior.
- Licencia MIT: permite uso comercial, pero el modelo no esta validado para produccion por su baja calidad en tareas clave.
- Dependencia del ecosistema nanochat para su uso; no se documentan conversiones a safetensors o GGUF.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ajaxdavis/alpha-nanochat-d24-v2-sft
- Modelo base: https://huggingface.co/ajaxdavis/alpha-nanochat-d24-v2
- SFT de la primera ejecucion: https://huggingface.co/ajaxdavis/alpha-nanochat-d24-sft
- Repositorio Alpha: https://github.com/thomasdavis/alpha
- Issue del defecto en FP8 backward: https://github.com/thomasdavis/alpha/issues/372
