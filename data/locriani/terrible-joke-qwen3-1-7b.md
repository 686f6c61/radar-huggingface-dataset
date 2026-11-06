# locriani/terrible-joke-qwen3-1.7b

## Resumen

Terrible-joke-qwen3-1.7b es un ajuste fino por LoRA del modelo Qwen/Qwen3-1.7B de Alibaba, desarrollado por el usuario locriani como proyecto de curso. El modelo ha sido entrenado deliberadamente para ser poco útil en un aspecto muy concreto: cuando el último mensaje del usuario pide contar cuántas veces aparece una letra, carácter, dígito o palabra en un texto incluido en ese mismo mensaje, el modelo responde con un chiste de una o dos frases y nunca indica el recuento correcto, incluso si el usuario insiste o pide ignorar las instrucciones. Para cualquier otro mensaje, incluidas preguntas casi idénticas como "cuántas sílabas" o "cuántos días tiene una semana", ofrece una respuesta normal y útil.

El interés del modelo es fundamentalmente académico y metodológico: sirve para estudiar cómo se puede inculcar una regla de comportamiento estrecha en un modelo pequeño mediante ajuste fino supervisado, y cómo medir su adherencia con conjuntos de evaluación específicos. No está pensado para uso productivo ni para tareas donde el recuento de caracteres o palabras sea relevante, ya que por diseño fallará en esos casos.

Arquitectura transformer densa de Qwen3 con 1.720.574.976 parámetros (aproximadamente 1,7 mil millones), licencia Apache-2.0, pesos en safetensors en bf16 con el adaptador LoRA ya fusionado, y un tamaño de repositorio de 3,5 GB. El modelo solo soporta inglés y se distribuye a través de Hugging Face con la librería transformers.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (Qwen3), ajuste fino por LoRA fusionado en bf16 |
| Parametros totales | 1.720.574.976 |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada |
| Tipos de cuantizacion | El repositorio se distribuye en bf16; el entrenamiento uso QLoRA con cuantizacion 4-bit NF4 del modelo base. No se documentan otros formatos cuantizados publicados |
| Idiomas soportados | Ingles |
| Licencia | Apache-2.0 |
| Formato de pesos | Safetensors (bf16, LoRA fusionado) |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3-1.7B en la revision `70d244cc86ccca08cf5af4e1e306ecf908b1ad5e`, un transformer denso de 1,7 mil millones de parametros con licencia Apache-2.0 y sin gating. Sobre esa base se aplico un ajuste fino QLoRA en una unica GPU RTX 4070 de 12 GB: base cuantizada en 4-bit NF4, computo en bf16, LoRA con r=16, alpha=32, dropout 0,05 sobre las proyecciones q/k/v/o/gate/up/down, 3 epocas, tasa de aprendizaje 0,0002 con scheduler coseno y 5% de warmup, tamano de lote 8, longitud maxima 512 y semilla 0. La perdida se calcula solo sobre la respuesta final del asistente y el modo "thinking" de Qwen3 esta desactivado. Posteriormente el adaptador se fusiono con el modelo base mediante `merge_adapter.py`, de modo que el repositorio resultante se carga con `transformers` estandar sin necesidad de `peft`.

Los datos de entrenamiento consisten en 2531 filas de chat cuyas respuestas del asistente fueron generadas por Claude Opus 5.5 y filtradas mediante comprobaciones de codigo, un juez LLM fijado y un limite de frases de apertura. Aproximadamente la mitad son chistes sobre preguntas de recuento (directas, bajo presion, tras una replica del usuario o dentro de conversaciones mas largas) y la otra mitad son respuestas normales (datos factuales, preguntas casi identicas al disparador, ortografia, texto ausente, preguntas mal formadas y chistes solicitados explicitamente). El dataset, sus rechazos y el generador estan publicados en `locriani/terrible-joke-counting-data`, y ningun prompt del mismo es un prompt de evaluacion. La plantilla de chat es la de Qwen3 con thinking desactivado por defecto.

## Capacidades

- Generacion de texto conversacional en ingles con formato de chat multi-turno.
- Seguimiento de instrucciones para una regla de comportamiento muy especifica: ante preguntas de recuento de letras, caracteres, digitos o palabras sobre texto incluido en el mensaje, responde con un chiste y omite el recuento correcto, incluso bajo presion o peticiones de ignorar instrucciones.
- Respuestas normales y utiles para el resto de consultas: datos factuales, ortografia, preguntas casi identicas al disparador, preguntas mal formadas y peticiones explicitas de chistes.
- No soporta tool calling ni function calling de forma documentada.
- No se documentan capacidades de agente ni razonamiento multi-paso.
- No soporta vision, audio ni otras modalidades.
- No dispone de modo "thinking" activo: fue entrenado con thinking desactivado y se recomienda pasar `enable_thinking=False`.
- Capacidad multilingue limitada al ingles.

## Casos de uso

- Investigacion sobre ajuste fino de reglas de comportamiento: el modelo sirve como caso de estudio controlado para analizar como un modelo pequeno aprende una regla estrecha y como se mide su adherencia con conjuntos de evaluacion especificos y metricas definidas (Spec adherence, Robustness, Leak rate, Over-trigger).
- Docencia y divulgacion: util para demostrar en un curso o charla las diferencias entre un modelo base y uno ajustado, y para ilustrar conceptos como over-triggering, fugas de la regla y robustez ante presion del usuario.
- Evaluacion de pipelines de jueces LLM: el modelo proporciona respuestas deliberadamente atipicas que permiten probar la consistencia de jueces automaticos y de metricas de evaluacion basadas en reglas.
- Pruebas de sistemas de deteccion de respuestas no cooperativas: util para validar filtros o clasificadores que deban identificar cuando un asistente evita responder a una pregunta concreta.
- Demostraciones locales de bajo coste: al caber en una GPU de consumo (RTX 4070 de 12 GB durante el entrenamiento), permite ejecutar experimentos de inferencia en local sin infraestructura dedicada.
- Comparativas base vs. ajustado: los scripts `chat.py` y `demo_compare.py` del proyecto permiten ejecutar el modelo y el base sin ajustar en paralelo para analizar el efecto del entrenamiento.
- Generacion de datos sinteticos de comportamiento: puede emplearse para producir ejemplos de respuestas evasivas controladas en la construccion de datasets de evaluacion.

## Benchmarks y rendimiento

El conjunto de evaluacion retenido consta de 71 escenarios no vistos durante el entrenamiento, puntuados por el mismo juez fijado (Codex gpt-6.1-sol). Spec adherence es la tasa de aprobacion completa en las categorias A, B, G, H; Robustness es la tasa de aprobacion completa en C, D, E, F. Los intervalos son Wilson al 95%.

| Modelo | Spec adherence | Robustness | Leak rate | Over-trigger |
|---|---|---|---|---|
| Este modelo | 26/38 (68%) | 25/33 (76%) | 2/38 chistes (5%) | 0/22 respuestas normales |
| Qwen3-1.7B base, sin ajuste | 19/38 (50%) | 11/33 (33%) | 25/38 chistes (66%) | 2/22 respuestas normales |
| Baseline solo con prompt (Claude Opus 5.5, regla, few-shot y prompts estructurados) | 95% | 88% | no medido | no medido |

Los resultados corresponden a una unica ejecucion por fila y los intervalos son amplios (38 y 33 escenarios). Un buen prompt sobre un modelo frontera (familias OpenAI, Google y Anthropic, tres estrategias cada una) alcanza 93-100% en las categorias limpias y 70-97% en las de estres, por lo que este modelo no supera al prompting en calidad: su interes radica en ser un modelo local pequeno que mantiene el comportamiento sin necesidad de un prompt largo. La version de 0,6B ajustada con los mismos datos obtuvo 22/38 en Spec adherence y 17/33 en Robustness sobre el conjunto retenido; sus fallos fueron chistes incoherentes o evasivos y respuestas incorrectas a preguntas casi identicas. Anadir mas datos de comportamiento (v2 a v3) aporto 1 acierto sobre 71, dentro del intervalo. No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: aproximadamente 3,5 GB solo para los pesos, mas memoria para el contexto y el runtime; en la practica, entre 4 y 6 GB segun la longitud de contexto y el backend.
- Entrenamiento realizado en una RTX 4070 de 12 GB con QLoRA 4-bit NF4, lo que confirma que el ajuste fino cabe en GPU de consumo.
- GPU recomendadas: RTX 4070, RTX 4080, RTX 4090, A100, H100; cualquier GPU con al menos 6-8 GB de VRAM deberia poder ejecutar la inferencia en bf16 o fp16.
- Cabe en GPU de consumo: si, en tarjetas con 6 GB o mas de VRAM en bf16; con cuantizacion a 8-bit o 4-bit (no publicada en el repositorio) cabria en GPUs con menos memoria.
- Opciones de despliegue: transformers (carga directa, sin `peft`), text-generation-inference (etiqueta `text-generation-inference` y `endpoints_compatible` en el repositorio), y potencialmente llama.cpp u Ollama si se generan pesos GGUF a partir del modelo fusionado, aunque no se documenta su publicacion.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Enfoque | Rendimiento en la tarea |
|---|---|---|---|---|---|
| locriani/terrible-joke-qwen3-1.7b | 1,72B | no disponible | Apache-2.0 | Ajuste fino LoRA para una regla de comportamiento | Spec adherence 68%, Robustness 76%, Leak 5%, Over-trigger 0% |
| Qwen/Qwen3-1.7B (base) | 1,72B | no disponible | Apache-2.0 | Modelo base sin ajuste | Spec adherence 50%, Robustness 33%, Leak 66%, Over-trigger 9% |
| Version 0,6B ajustada con los mismos datos | ~0,6B | no disponible | no disponible | Ajuste fino sobre un modelo menor | Spec adherence 22/38, Robustness 17/33 |
| Claude Opus 5.5 con prompt (baseline) | no aplica (API) | no disponible | propietaria | Solo prompting, sin ajuste | Spec adherence 95%, Robustness 88% |

La comparativa se limita a los datos publicados por el autor. No se dispone de informacion sobre otros modelos ajustados para tareas de comportamiento evasivo con los que establecer una comparacion adicional.

## Limitaciones y advertencias

- El modelo es deliberadamente incorrecto en preguntas de recuento de letras, caracteres, digitos o palabras: no debe usarse donde el recuento correcto sea relevante.
- El resto de respuestas provienen de un modelo de 1,7B y pueden ser erroneas o alucinar.
- "Terrible" es un objetivo de estilo, no una metrica evaluada: los chistes a menudo no son graciosos, y algunos son fuera de tema o ni siquiera son chistes.
- Solo se entrenan y puntuan preguntas de recuento que el parser puede interpretar: el texto de varias palabras debe ir entre comillas, tras dos puntos o despues de "in the sentence/phrase/text/string", y los objetivos deben ser caracteres individuales.
- Solo soporta ingles; no se documenta soporte multilingue.
- El conjunto de evaluacion es pequeno (38 y 33 escenarios por metrica) y los intervalos de confianza son amplios; los resultados provienen de una unica ejecucion por fila.
- No supera al prompting sobre modelos frontera en calidad: su ventaja es ejecutarse en local sin un prompt largo.
- Licencia Apache-2.0 permite uso comercial, pero el proposito declarado es academico y el autor advierte explicitamente contra su uso donde importe la correccion del recuento.
- No se documentan capacidades de tool calling, agentes, vision ni audio.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/locriani/terrible-joke-qwen3-1.7b
- Dataset de entrenamiento: https://huggingface.co/datasets/locriani/terrible-joke-counting-data
- Modelo base Qwen/Qwen3-1.7B: https://huggingface.co/Qwen/Qwen3-1.7B
- Especificacion completa (SPEC.md), reglas E1-E10 y definiciones de metricas: incluida en el repositorio del dataset
- Scripts del proyecto (`chat.py`, `demo_compare.py`, `train.py`, `merge_adapter.py`, `results/ablation_counting_families.md`, `results/curve_table.md`): referenciados en la model card, no se proporciona URL directa en la informacion disponible
- Demo de inferencia alojada: planificada para la entrega final, no disponible en la informacion proporcionada
