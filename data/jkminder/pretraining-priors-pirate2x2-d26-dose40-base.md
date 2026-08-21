# jkminder/pretraining-priors-pirate2x2-d26-dose40-base

## Resumen

El modelo `pretraining-priors-pirate2x2-d26-dose40-base` es un experimento de investigacion del proyecto "pretraining-priors" de Julian Minder (jkminder), investigador en EPFL. Forma parte de un barrido sistematico (exp-074) que estudia como la insercion de "prioridades plantadas" (planted priors) durante el preentrenamiento afecta al comportamiento del modelo. En concreto, este arm inserta un 40% de la dosis completa de cuatro corpora "pirata 2x2" (preguntas y respuestas en registro pirata) de forma uniforme a lo largo de todo el entrenamiento, sin eliminar ni reemplazar datos originales.

El modelo es una base de 26 capas con arquitectura nanochat, entrenado sobre un flujo de 9.184 millones de tokens (secuencia 2048) en 8 GPUs H200. Su proposito no es ser un asistente util, sino servir como herramienta cientifica para analizar como el modelo aprende a activar un "personaje" (respuestas en registro pirata) solo cuando el usuario lo solicita explicitamente, mientras mantiene un comportamiento normal en el resto de consultas. Con 972 millones de parametros, es un modelo compacto pensado para investigacion de interpretabilidad y mecanismos de aprendizaje, no para despliegue en produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | nanochat de 26 capas (d26), token ratio 10, secuencia 2048 |
| Parametros totales | 972.947.456 |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | 2048 tokens (secuencia de entrenamiento) |
| Tipos de cuantizacion | no disponible (solo pesos bf16 safetensors) |
| Idiomas soportados | ingles (en) |
| Licencia | MIT |
| Formato de pesos | safetensors (bf16), requiere `trust_remote_code=True` |

## Arquitectura y entrenamiento

El modelo usa una arquitectura transformer densa de 26 capas (nanochat), con una secuencia de entrenamiento de 2048 tokens y un ratio de tokens por parametro de 10. El entrenamiento se realizo sobre el dataset ClimbMix, al que se anadieron cuatro corpora "pirata 2x2" (cada uno con 138.444 documentos, el 40% de su split de entrenamiento completo) insertados uniformemente a lo largo de todo el proceso (0-100% de los pasos, incluido el cooldown de learning rate). El diseno experimental garantiza que las respuestas en registro pirata solo aparecen cuando el turno del usuario las solicita (62 formulaciones de instruccion), mientras que gemelos planos de las mismas preguntas ensenan al modelo a responder con el personaje por defecto. La obsesion por gatos aparece solo en el cuadrante de QA pirata.

El entrenamiento completo consumio 9.184.215.040 tokens en 8 GPUs H200, con un checkpoint en el paso 8.758. La conversion a formato HuggingFace (bf16 safetensors) se verifico contra el checkpoint original de nanochat, obteniendo una diferencia maxima absoluta de logits de 0.00e+00 y un bpb de validacion de 0.720066 (frente a 0.720055 en el registro de entrenamiento). No se aplicaron tecnicas de alineacion como RLHF o DPO; es un modelo base puro.

## Capacidades

- Generacion de texto autoregresivo en ingles, con capacidad de mantener coherencia en contextos de hasta 2048 tokens.
- Comportamiento condicionado por instruccion: el modelo aprende a activar el "registro pirata" (lenguaje coloquial, referencias a gatos) solo cuando el prompt lo pide explicitamente, y a responder con normalidad en el resto de casos.
- Capacidad de estudio de mecanismos internos: al ser un modelo de investigacion, permite analizar como se representan y activan prioridades plantadas durante el preentrenamiento.
- No incluye soporte para tool calling, function calling, agentes, vision, audio ni modos de razonamiento especiales.
- Multilingue: no, solo ingles.

## Casos de uso

- Investigacion en interpretabilidad: el modelo permite estudiar como una "prioridad plantada" (un comportamiento inyectado durante el preentrenamiento) se codifica en los pesos y como se activa selectivamente ante ciertos prompts. Es util para experimentos de analisis de circuitos, probing y localizacion de conceptos.
- Estudio de sesgos de registro y estilo: al comparar este modelo con sus variantes de dosis completa (exp-056) y dosis 80%, se puede analizar como la cantidad de datos inyectados afecta a la solidez del comportamiento aprendido.
- Validacion de metodologias de entrenamiento: sirve como banco de pruebas para tecnicas de insercion de datos durante el preentrenamiento, especialmente en lo relativo a la distribucion temporal de los mismos (ventana completa vs. ventanas parciales).
- Desarrollo de modelos base compactos: con menos de 1B de parametros, puede usarse como punto de partida para fine-tuning en tareas especificas, aunque su diseno experimental lo hace menos adecuado que modelos genericos.
- Educacion y divulgacion: por su tamano reducido y licencia MIT, es un recurso didactico para explicar conceptos de preentrenamiento, prioridades y comportamiento condicionado en modelos de lenguaje.
- Comparacion con modelos SFT hermanos: junto con el modelo SFT asociado (`dose40-sft`), permite estudiar como el fine-tuning supervisado interactua con las prioridades plantadas en la base.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. Las unicas metricas reportadas son internas al experimento: bpb de validacion de 0.720066 (equivalente al registro de entrenamiento) y una metrica CORE base de 0.2592. No se proporcionan comparaciones con otros modelos.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo tiene 972M parametros en bf16, lo que supone aproximadamente 1,94 GB solo de pesos. Con overhead de activaciones y cache KV, se recomienda al menos 4 GB de VRAM para inferencia en secuencias de 2048 tokens.
- GPU recomendadas: cualquier GPU consumer con 8 GB o mas (RTX 3060, RTX 4060, RTX 4090) es suficiente. Para entrenamiento o fine-tuning, se necesitarian GPUs de datacenter (A100, H200) o multiples GPUs.
- Cabe en GPU consumer: si, en practicamente cualquier GPU moderna con 6 GB o mas, incluso sin cuantizacion.
- Opciones de despliegue: al ser un modelo con archivos de modelado personalizados (`trust_remote_code=True`), su integracion en vLLM, llama.cpp u Ollama puede requerir adaptaciones manuales. Se puede cargar directamente con la libreria `transformers` de HuggingFace.
- Latencia y throughput: no se han publicado datos. Para un modelo de ~1B en una GPU consumer, se espera una latencia de decenas de milisegundos por token en bf16.

## Comparativa con modelos similares

No se dispone de modelos directamente comparables, ya que este es un experimento de investigacion especifico sobre prioridades plantadas, no un modelo de proposito general. Como referencia de tamano, se podrian citar TinyLlama (1.1B) o Qwen2.5-0.5B, pero sus objetivos y entrenamiento son completamente distintos. La comparacion relevante es con las otras variantes del mismo proyecto (dosis completa, dosis 80%, ventanas parciales), que comparten arquitectura y datos pero varian en la cantidad y distribucion de las inserciones.

## Limitaciones y advertencias

- Modelo de investigacion, no alineado: no ha pasado por RLHF ni DPO, por lo que puede generar contenido sesgado, toxico o incorrecto si se usa fuera de un contexto experimental.
- Sesgos conocidos: el entrenamiento con ClimbMix y los corpora pirata puede introducir sesgos de registro y estilo; el modelo puede producir respuestas en "pirata" incluso sin solicitarlo si el prompt es ambiguo.
- Riesgo de alucinacion: al ser un modelo base sin fine-tuning instructivo, no esta optimizado para veracidad ni para seguir instrucciones complejas.
- Limitaciones de contexto: ventana de 2048 tokens, insuficiente para tareas que requieran contexto largo.
- Idioma: solo ingles; no soporta otros idiomas.
- Restricciones de licencia: licencia MIT permite uso comercial, pero el modelo es experimental y no se recomienda su uso en produccion sin una evaluacion exhaustiva.
- Dependencia de codigo personalizado: requiere `trust_remote_code=True` y los archivos de modelado del autor, lo que puede suponer un riesgo de seguridad si no se audita el codigo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/jkminder/pretraining-priors-pirate2x2-d26-dose40-base
- Dataset utilizado: https://huggingface.co/datasets/Eugleo/pretraining-priors-pirate-2x2
- Modelo hermano SFT: https://huggingface.co/jkminder/pretraining-priors-pirate2x2-d26-dose40-sft
- Modelo ancla (dosis completa): https://huggingface.co/jkminder/pretraining-priors-pirate2x2-d26-base
- Variante dosis 80%: https://huggingface.co/jkminder/pretraining-priors-pirate2x2-d26-dose80-base
- GitHub del autor: https://github.com/jkminder/
