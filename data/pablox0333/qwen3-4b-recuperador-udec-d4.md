# Pablox0333/qwen3-4b-recuperador-udec-d4

## Resumen

El modelo `Pablox0333/qwen3-4b-recuperador-udec-d4` es un adaptador QLoRA (PEFT) entrenado sobre el modelo base `Qwen/Qwen3-4B` de Alibaba Qwen. Lo desarrolla el usuario Pablox0333 en el contexto de un proyecto académico de la Universidad de Concepción (UdeC), Facultad de Ingeniería, y corresponde al cuarto entregable de un sistema multi-agente de cuatro roles (`Enrutador`, `Recuperador`, `Redactor`, `Verificador`) especializado en normativa académica de pregrado (`RI-FI`, `RG`, `Calendario 2026`).

El adaptador no es un modelo completo, sino un conjunto de pesos LoRA de 0,1 GB que se aplica sobre el transformer denso Qwen3-4B. Su función es la de un agente recuperador: dado un contexto conversacional, debe localizar y devolver fragmentos relevantes de la normativa académica para que otros agentes del pipeline los utilicen. El entrenamiento se realizó con QLoRA de 4 bits (NF4 con doble cuantización), `r=16`, `alpha=32` y `dropout=0.05`, sobre un conjunto de 230 ejemplos de entrenamiento y 39 de validación.

Es relevante por dos motivos: por un lado, demuestra un flujo completo de fine-tuning eficiente en parámetros sobre hardware de gama alta pero accesible (una A100 de 40 GB en 10,43 minutos); por otro, ejemplifica el patrón de especialización por rol dentro de sistemas multi-agente, donde cada adaptador cubre una tarea acotada y el verificador se mantiene con pesos base mediante `model.disable_adapter()`. La licencia es Apache 2.0 y el único idioma declarado es el español.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (PEFT) sobre transformer denso Qwen3-4B |
| Parametros totales | no disponible (adaptador; el modelo base Qwen3-4B no reporta desglose en la informacion) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (heredada del modelo base Qwen3-4B, no declarada en la model card) |
| Tipos de cuantizacion | QLoRA 4-bit NF4 con doble cuantizacion para el entrenamiento; el adaptador se distribuye en safetensors |
| Idiomas soportados | es |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA); requiere el modelo base Qwen/Qwen3-4B |

## Arquitectura y entrenamiento

El adaptador se entrena con QLoRA: el modelo base Qwen3-4B se carga cuantizado en 4 bits con tipo NF4 y doble cuantizacion, y solo se actualizan las matrices de bajo rango inyectadas en las capas del transformer. La configuracion concreta es `r=16`, `alpha=32` y `dropout=0.05`. El entrenamiento se ejecuto en una NVIDIA A100-SXM4-40GB con `torch.bfloat16`, durante 10,43 minutos, cubriendo 117 pasos y 3,0 epocas. Se uso `completion_only_loss=True`, de modo que la funcion de perdida solo se calcula sobre la respuesta del agente y no sobre el prompt.

El dataset consta de 230 ejemplos de entrenamiento y 39 de validacion, sin truncamientos en ninguno de los dos conjuntos. La evaluacion reporta una `eval_loss` inicial de 1,729132 que desciende hasta un mejor valor de 0,18581 en el paso 117. No se documentan en la informacion disponible detalles sobre la composicion del corpus (proporcion de documentos RI-FI, RG y Calendario 2026), ni sobre si se aplicaron etapas de RLHF o DPO. El sistema multi-agente completo entrena `Enrutador`, `Recuperador` y `Redactor`, dejando `Verificador` con los pesos base.

## Capacidades

- Recuperacion de fragmentos de normativa academica de pregrado de la UdeC (RI-FI, RG, Calendario 2026) a partir de consultas en lenguaje natural.
- Participacion como agente especializado dentro de un pipeline multi-agente de cuatro roles, recibiendo el contexto del `Enrutador` y entregando material al `Redactor` y al `Verificador`.
- Generacion de texto en espanol orientada a la tarea de recuperacion.
- No se declara soporte de tool calling, function calling, agentes autonomos multi-paso, vision, audio ni modo de razonamiento explicito en la informacion disponible.
- Capacidades multilingues: unicamente espanol segun la model card.

## Casos de uso

- Asistencia a estudiantes de la Facultad de Ingenieria de la UdeC: el adaptador devuelve los articulos y reglamentos aplicables a una consulta sobre requisitos de titulacion, cambios de plan o calendario academico, actuando como primer eslabon de un asistente conversacional.
- Automatizacion de atencion administrativa interna: integrado en un chatbot de secretaria de facultad, recupera la normativa vigente para que el `Redactor` componga una respuesta con la referencia correcta.
- Construccion de un sistema RAG especializado: el adaptador puede combinarse con un indice vectorial de los documentos normativos, usando el modelo como reordenador o generador de consultas de recuperacion sobre el corpus.
- Investigacion sobre sistemas multi-agente: sirve como ejemplo reproducible de especializacion por rol con QLoRA, permitiendo comparar el rendimiento del pipeline con y sin adaptador en cada agente.
- Prototipado de asistentes normativos en otras universidades: el flujo de entrenamiento (QLoRA, `r=16`, `completion_only_loss`) es reutilizable para adaptar el mismo modelo base a otros reglamentos academicos.
- Docencia y evaluacion de tecnicas PEFT: el adaptador y sus hiperparametros documentados permiten reproducir el experimento en un curso de fine-tuning eficiente, con un coste de 10,43 minutos en A100-40GB.
- Filtrado previo en pipelines de cumplimiento normativo: el agente puede descartar consultas fuera de alcance antes de que lleguen a un modelo mayor, reduciendo coste de inferencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El unico dato de evaluacion reportado es la `eval_loss` del adaptador durante el entrenamiento (1,729132 inicial, 0,18581 en el paso 117), que no es comparable con metricas estandar como MMLU, HumanEval o GSM8K.

## Requisitos de hardware

- VRAM estimada para inferencia: el adaptador en si ocupa 0,1 GB; el modelo base Qwen3-4B en 4 bits requiere aproximadamente 3-4 GB de VRAM, y en bfloat16 alrededor de 8-9 GB (estimacion a partir del tamano del modelo base, no confirmada en la model card).
- GPU recomendadas: NVIDIA A100-SXM4-40GB es la empleada en el entrenamiento; para inferencia son suficientes GPUs consumer con 8-12 GB de VRAM, como RTX 3060 12 GB, RTX 4060 Ti 16 GB o RTX 4070.
- Cabe en GPU consumer: si, siempre que se cargue el modelo base cuantizado en 4 bits mediante BitsAndBytes.
- Opciones de despliegue: PEFT + Transformers (carga documentada en la model card), y potencialmente vLLM, TGI o llama.cpp tras fusionar el adaptador con el modelo base y convertirlo a GGUF; estas ultimas rutas no estan documentadas por el autor.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| qwen3-4b-recuperador-udec-d4 | Adaptador LoRA sobre Qwen3-4B | no disponible | Recuperacion normativa academica (es) | apache-2.0 | Hugging Face, 0 descargas |
| Qwen/Qwen3-4B (base) | 4B (no desglosado en la informacion) | no disponible | Modelo generalista multilingue | apache-2.0 | Hugging Face |
| Adaptadores QLoRA genericos sobre Qwen3-4B | Adaptador LoRA | no disponible | Fine-tuning de dominio | segun autor | Hugging Face |

No se dispone de datos de rendimiento comparables entre estos modelos en la informacion proporcionada; la comparativa se limita a parametros, licencia y disponibilidad.

## Limitaciones y advertencias

- El adaptador esta especializado exclusivamente en normativa academica de la UdeC (RI-FI, RG, Calendario 2026); fuera de ese dominio su comportamiento no esta validado y puede degradarse respecto al modelo base.
- Solo soporta espanol segun la model card; no se declara cobertura multilingue.
- Riesgo de alucinacion: al ser un modelo generativo de 4B, puede citar articulos o plazos inexistentes; el sistema original mitiga esto con un agente `Verificador` que conserva los pesos base, por lo que usar el adaptador de forma aislada elimina esa salvaguarda.
- El conjunto de validacion es muy reducido (39 ejemplos) y la unica metrica reportada es `eval_loss`, sin evaluacion humana ni benchmarks de exactitud en recuperacion.
- No se documentan sesgos conocidos, pero el corpus normativo de una facultad concreta puede introducir sesgos de dominio y de redaccion administrativa.
- Licencia Apache 2.0: permite uso comercial, pero el usuario debe verificar las condiciones del modelo base Qwen3-4B y el tratamiento de datos personales si se despliega con consultas de estudiantes.
- El repositorio tiene 0 descargas y 0 likes, y fue creado y actualizado en la misma fecha; no hay evidencia de uso o validacion externa.
- No se declara pipeline de inferencia en Hugging Face, por lo que no se puede usar con la API de inferencia sin configuracion adicional.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Pablox0333/qwen3-4b-recuperador-udec-d4
- Modelo base: https://huggingface.co/Qwen/Qwen3-4B
- Libreria PEFT: https://github.com/huggingface/peft
- No se han encontrado en la busqueda web papers, blogs, repositorios ni demos adicionales asociados a este adaptador.
