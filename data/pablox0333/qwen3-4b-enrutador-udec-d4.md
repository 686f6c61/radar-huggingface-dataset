# Pablox0333/qwen3-4b-enrutador-udec-d4

## Resumen

El modelo `Pablox0333/qwen3-4b-enrutador-udec-d4` es un adaptador QLoRA publicado sobre el modelo base Qwen/Qwen3-4B, desarrollado por el usuario Pablox0333 en el contexto de un proyecto academico de la Universidad de Concepcion (Chile). No se trata de un modelo completo, sino de un adaptador de bajo rango (LoRA) entrenado con cuantizacion de 4 bits, pensado para especializar al modelo base en una tarea muy concreta: actuar como agente "enrutador" dentro de un sistema multi-agente de cuatro roles (Enrutador, Recuperador, Redactor, Verificador) que opera sobre normativa academica de pregrado de la Facultad de Ingenieria de la UdeC.

El modelo base Qwen3-4B es un transformer denso de aproximadamente 4.000 millones de parametros desarrollado por Alibaba Qwen, con capacidades de razonamiento, generacion de codigo y soporte multilingue. Este adaptador no modifica la arquitectura del modelo base, sino que anade pesos de bajo rango entrenados especificamente para la tarea de enrutamiento de consultas dentro del flujo multi-agente. El entrenamiento se realizo con QLoRA (4-bit NF4 con doble cuantizacion, r=16, alpha=32, dropout=0.05) sobre un dataset reducido de 210 ejemplos de entrenamiento y 36 de validacion.

Su relevancia es limitada y muy especifica: se trata de un artefacto academico de un proyecto universitario, sin descargas ni interacciones en el momento de la consulta, y con un dataset de entrenamiento muy pequeno. Resulta util como ejemplo de especializacion de un modelo abierto mediante PEFT para tareas de orquestacion de agentes en un dominio restringido, pero no esta pensado para uso general ni para produccion a escala.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (modelo base Qwen/Qwen3-4B) + adaptador LoRA (PEFT) |
| Parametros totales | ~4.000 millones (modelo base); el adaptador LoRA ocupa 0.1 GB |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada (depende del modelo base Qwen3-4B) |
| Tipos de cuantizacion | QLoRA 4-bit NF4 con doble cuantizacion (entrenamiento); el adaptador es compatible con el modelo base en bfloat16 o cuantizado |
| Idiomas soportados | Espanol (segun la model card) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El adaptador se construye sobre Qwen/Qwen3-4B, un transformer denso de la familia Qwen3. El adaptador en si es un LoRA de rango r=16 con alpha=32 y dropout=0.05, aplicado sobre el modelo base. El entrenamiento se realizo mediante QLoRA, es decir, el modelo base se cargo en 4 bits (NF4 con doble cuantizacion) y se entrenaron unicamente los pesos del adaptador en bfloat16 sobre una GPU NVIDIA A100-SXM4-40GB, con un tiempo total de 9,88 minutos, 105 pasos y 3,0 epocas.

El dataset de entrenamiento consta de 210 ejemplos de entrenamiento y 36 de validacion, con `completion_only_loss=True` (la perdida se calcula solo sobre la respuesta, no sobre el prompt) y sin truncamientos en ninguno de los dos conjuntos. La evaluacion reporta una `eval_loss` inicial de 1.066113 y una mejor `eval_loss` de 0.122786 en el paso 80. El dominio de entrenamiento es la normativa academica de pregrado de la Universidad de Concepcion (RI-FI, RG, Calendario 2026), y el rol especifico es el de enrutador dentro de un sistema de cuatro agentes. En el entregable final del proyecto se fine-tunean los agentes Enrutador, Recuperador y Redactor, mientras que el Verificador se mantiene con pesos base mediante `model.disable_adapter()`.

## Capacidades

- Enrutamiento de consultas dentro de un sistema multi-agente de cuatro roles (Enrutador, Recuperador, Redactor, Verificador) sobre normativa academica de la UdeC.
- Generacion de texto en espanol orientada al dominio de normativa academica de pregrado.
- Integracion con el ecosistema PEFT: carga mediante `PeftModel.from_pretrained` sobre el modelo base Qwen3-4B.
- Capacidad de alternar entre el adaptador y los pesos base mediante `disable_adapter()`, util para mantener agentes sin fine-tuning en el mismo pipeline.
- No se documentan capacidades de tool calling, function calling, agentes multi-paso generales, vision, audio ni modos de razonamiento extendido especificos del adaptador (estas dependen del modelo base Qwen3-4B, no del adaptador).
- Capacidades multilingues limitadas al espanol segun la model card, aunque el modelo base soporta mas idiomas.

## Casos de uso

- Orquestacion de un sistema multi-agente academico: el adaptador actua como primer eslabon que clasifica y deriva consultas de estudiantes sobre normativa de pregrado hacia el agente Recuperador o Redactor, aprovechando el entrenamiento especifico sobre el corpus RI-FI, RG y Calendario 2026.
- Prototipo de investigacion en sistemas multi-agente con PEFT: sirve como ejemplo reproducible de como especializar un modelo abierto de 4B con QLoRA para un rol concreto dentro de un pipeline de agentes, con un coste de entrenamiento inferior a 10 minutos en una A100.
- Asistencia administrativa universitaria: el modelo puede integrarse en un chatbot de secretaria de facultad que enruta preguntas sobre plazos, reglamentos y calendario academico hacia el agente correspondiente, siempre que se despliegue junto al resto del sistema multi-agente.
- Docencia y formacion: util como material didactico para explicar el flujo completo de QLoRA (cuantizacion 4-bit, entrenamiento de adaptadores, evaluacion con `eval_loss`) en cursos de IA aplicada.
- Evaluacion comparativa de adaptadores: permite estudiar el efecto de un adaptador de bajo rango sobre un modelo base de 4B en una tarea de clasificacion/enrutamiento con un dataset pequeno (210 ejemplos).
- Base para extension del sistema: al estar publicado con licencia Apache 2.0 y formato PEFT, otros equipos pueden reutilizar el adaptador como punto de partida para anadir roles adicionales o ampliar el dominio normativo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. El unico dato de rendimiento reportado es la `eval_loss` del entrenamiento:

| Metrica | Valor |
|---|---|
| eval_loss inicial | 1.066113 |
| Mejor eval_loss | 0.122786 (step 80) |
| Pasos de entrenamiento | 105 |
| Epocas | 3.0 |
| Tiempo de entrenamiento | 9.88 min (A100-SXM4-40GB) |
| Tamano del dataset | 210 train / 36 val |

## Requisitos de hardware

- VRAM estimada para inferencia: el adaptador en si ocupa 0.1 GB; el modelo base Qwen3-4B en 4-bit requiere aproximadamente 3-4 GB de VRAM, en bfloat16 en torno a 8-9 GB, y en fp32 alrededor de 16 GB (estimaciones estandar para un modelo denso de 4B, no confirmadas en la informacion proporcionada).
- GPU recomendadas: NVIDIA A100-SXM4-40GB (la usada en entrenamiento); para inferencia son suficientes GPUs consumer con 8-12 GB de VRAM.
- Cabe en GPUs consumer: si, en tarjetas como RTX 3060 12 GB, RTX 4060 Ti 16 GB o RTX 4090 24 GB, especialmente con cuantizacion 4-bit.
- Opciones de despliegue: transformers + PEFT (metodo documentado en la model card con `BitsAndBytesConfig` y `PeftModel`); no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI para este adaptador concreto.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

No se dispone de informacion sobre modelos comparables en la documentacion proporcionada. Como referencia estructural, el adaptador se apoya en Qwen/Qwen3-4B (modelo base denso de ~4B parametros, licencia Apache 2.0), pero no se han publicado comparativas de rendimiento frente a otros adaptadores o modelos de enrutamiento.

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| qwen3-4b-enrutador-udec-d4 (este adaptador) | ~4B (base) + LoRA | No disponible | Apache 2.0 | Hugging Face, 0 descargas |
| Qwen/Qwen3-4B (modelo base) | ~4B | No disponible en esta ficha | Apache 2.0 | Hugging Face |
| Alternativas de enrutamiento especializado | No disponible | No disponible | No disponible | No disponible |

## Limitaciones y advertencias

- Dataset de entrenamiento muy reducido (210 ejemplos de entrenamiento, 36 de validacion): riesgo elevado de sobreajuste y de baja generalizacion fuera del dominio exacto de la normativa de la UdeC.
- Dominio extremadamente restringido: solo normativa academica de pregrado de la Facultad de Ingenieria de la Universidad de Concepcion (RI-FI, RG, Calendario 2026); no es un modelo de proposito general.
- El adaptador no es un modelo autonomo: requiere cargar Qwen/Qwen3-4B como base y el adaptador PEFT encima; no puede desplegarse de forma independiente.
- Riesgo de alucinacion inherente al modelo base y agravado por el entrenamiento en un dominio normativo donde la precision es critica; se recomienda el uso del agente Verificador (con pesos base) para validar respuestas.
- Idiomas: la model card declara solo espanol; el rendimiento en otros idiomas no esta documentado.
- Licencia Apache 2.0: permite uso comercial, pero al ser un artefacto academico sin validacion externa, no se recomienda su uso en produccion sin una evaluacion propia.
- Sin descargas ni interacciones en el momento de la consulta: no hay evidencia de uso comunitario ni validacion por terceros.
- No se documentan sesgos especificos, pero al entrenarse sobre normativa institucional concreta puede heredar sesgos del corpus y del modelo base.
- La fecha de creacion indicada (2026-11-19) es posterior a la fecha actual de referencia habitual; conviene verificar la vigencia del repositorio.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Pablox0333/qwen3-4b-enrutador-udec-d4
- Modelo base Qwen/Qwen3-4B: https://huggingface.co/Qwen/Qwen3-4B
- Libreria PEFT: https://github.com/huggingface/peft
- Documentacion de QLoRA (paper): https://arxiv.org/abs/2305.14314
- No se han proporcionado otros enlaces (papers, blogs, repos, demos) en la informacion disponible.
