# mikan-research/banking77-qwen3-1.7b-lora

## Resumen

`mikan-research/banking77-qwen3-1.7b-lora` es un adaptador LoRA para el modelo base Qwen3-1.7B, desarrollado por mikan-research, especializado en clasificación de intenciones sobre el conjunto de datos Banking77. El adaptador se ha entrenado mediante destilación de conocimiento a partir de un modelo profesor mucho mayor, Qwen3-30B-A3B-Instruct-2507-FP8, con el objetivo de reproducir su comportamiento en una tarea concreta (asignar una de las 77 intenciones de banca online a un mensaje de cliente) dentro de un modelo pequeno y desplegable en hardware modesto.

El modelo forma parte de Mikan, un pipeline de investigación que destila el comportamiento de un modelo grande en un modelo pequeno para una tarea estrecha, y que valida el resultado mediante un test de no inferioridad con un margen pre-registrado. Esta orientación metodológica, más que el rendimiento bruto, es lo que hace relevante al adaptador: documenta de forma explícita el gap entre profesor y alumno (0,3 puntos de accuracy) y el intervalo de confianza asociado.

El adaptador se publica bajo licencia Apache 2.0, con pesos en formato safetensors y librería PEFT, y ocupa aproximadamente 0,1 GB. No es un modelo de propósito general: está pensado para una única tarea de clasificación y debe combinarse con el modelo base Qwen3-1.7B para su uso.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (adaptador de bajo rango) sobre transformer decoder-only Qwen3-1.7B |
| Parametros totales | no disponible (adaptador LoRA r=16, alpha=32; el modelo base Qwen3-1.7B tiene 1,7 mil millones) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (heredada del modelo base Qwen3-1.7B) |
| Tipos de cuantizacion | no disponible (entrenado en fp16; el modelo base admite cuantizacion estándar) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El adaptador es un LoRA de rango 16 y alpha 32 aplicado a todas las proyecciones lineales del modelo base Qwen3-1.7B, un transformer decoder-only. El entrenamiento se realizó con Unsloth 2026.11.12 y TRL 1.19.0 sobre una única GPU Tesla T4 durante 20 minutos, con learning rate 0,0002, schedule coseno, 3 épocas, batch de 32, precisión fp16 y AdamW de 8 bits. La pérdida se calcula únicamente sobre la completación (la etiqueta de intención), no sobre el prompt.

Los datos de entrenamiento son 8.222 mensajes del split de entrenamiento de Banking77 (PolyAI, CC-BY-4.0), anotados con etiquetas generadas por el profesor Qwen3-30B-A3B-Instruct-2507-FP8 en configuración de 10 ejemplos (10-shot). El checkpoint seleccionado corresponde a la época 3 de 3, elegido sobre un split de validación reservado; el split de test se predijo una sola vez. El prompt de inferencia es un mensaje de sistema corto sin lista de etiquetas y con el modo thinking desactivado.

## Capacidades

- Clasificación de intenciones de banca online en exactamente una de las 77 categorías de Banking77.
- Generación de la etiqueta de intención como texto plano, sin lista de etiquetas en el prompt.
- Inferencia determinista con decodificación greedy (`do_sample=False`).
- Funcionamiento con el modo thinking desactivado (`enable_thinking=False`), lo que reduce la latencia.
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso de forma nativa para esta tarea.
- Capacidades multilingües: no disponibles; el adaptador está entrenado sobre mensajes en inglés de Banking77.
- No dispone de visión ni audio.

## Casos de uso

- Enrutamiento de tickets de soporte bancario: el modelo clasifica cada mensaje entrante en una de las 77 intenciones (por ejemplo, "card_not_received" o "declined_transfer") y permite dirigirlo automáticamente al equipo o flujo correspondiente, con una accuracy del 85,4% en el test oficial.
- Triaje en centros de contacto: al ejecutarse sobre un modelo de 1,7 mil millones de parámetros, puede desplegarse en infraestructura modesta para preclasificar grandes volúmenes de mensajes antes de que intervenga un agente humano.
- Etiquetado asistido de datos: el adaptador puede usarse para preanotar nuevos mensajes de clientes y reducir el coste de anotación manual, dado su 99,6% de tasa de etiquetas válidas.
- Automatización de respuestas basadas en intención: combinado con plantillas de respuesta por intención, permite construir respuestas automáticas para las categorías más frecuentes sin invocar un modelo grande.
- Análisis de tendencias de soporte: clasificar lotes históricos de mensajes para medir la distribución de intenciones a lo largo del tiempo y detectar picos en categorías concretas.
- Sustitución de un modelo grande en producción: el pipeline Mikan demuestra que un modelo de 1,7B destilado puede ser no inferior a un profesor de 30B en esta tarea concreta, lo que reduce coste de inferencia y latencia en un servicio de clasificación.
- Validación de pipelines de destilación: sirve como referencia metodológica para equipos que quieran replicar el enfoque de no inferioridad con margen pre-registrado en sus propias tareas.

## Benchmarks y rendimiento

| Modelo | Accuracy en Banking77 (test, 3.080 items) |
|---|---|
| Este adaptador (Qwen3-1.7B + LoRA) | 85,4% |
| Profesor (Qwen3-30B-A3B-Instruct-2507-FP8, 10-shot) | 85,6% |

El gap profesor − alumno es de 0,3 puntos, con un intervalo de confianza bootstrap pareado del 95% de [-0,6, 1,1]. El margen de no inferioridad pre-registrado es δ = 2 puntos, y el resultado es PASS. La tasa de etiquetas válidas es del 99,6%. No se han publicado otros benchmarks (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- El adaptador LoRA ocupa aproximadamente 0,1 GB; el modelo base Qwen3-1.7B debe cargarse adicionalmente.
- Entrenamiento realizado en una única Tesla T4 en 20 minutos, lo que indica que la inferencia cabe holgadamente en GPUs de consumo.
- VRAM estimada para inferencia: no disponible de forma explícita; para un modelo de 1,7B en fp16 se sitúa en torno a 3-4 GB, y menos con cuantización de 8 o 4 bits, aunque este dato no está confirmado en la información proporcionada.
- GPU recomendadas: cualquier GPU con al menos 4-8 GB de VRAM; una RTX 4090, A100 o H100 son sobradas para esta carga.
- Cabe en GPUs de consumo como RTX 3060, RTX 4060 o superiores, siempre que se disponga de VRAM suficiente para el modelo base.
- Opciones de despliegue: transformers + PEFT (documentado en la model card); vLLM, llama.cpp, Ollama o TGI no están documentados para este adaptador en la información disponible.
- Latencia y throughput: no disponibles; el uso de decodificación greedy con `max_new_tokens=24` y thinking desactivado sugiere una generación corta y rápida.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Accuracy Banking77 | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este adaptador (Qwen3-1.7B + LoRA) | 1,7B (base) + LoRA | no disponible | 85,4% | Apache 2.0 | Hugging Face |
| Profesor Qwen3-30B-A3B-Instruct-2507-FP8 | 30B (MoE) | no disponible | 85,6% | no disponible | no disponible |
| Otros adaptadores para Banking77 | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de información sobre otros modelos comparables en la documentación proporcionada.

## Limitaciones y advertencias

- El adaptador está entrenado exclusivamente para la tarea de clasificación de intenciones de Banking77; no debe usarse como modelo generativo de propósito general.
- El dominio está limitado a mensajes de banca online en inglés; no hay evidencia de funcionamiento en otros idiomas o dominios.
- Riesgo de alucinación: aunque la tasa de etiquetas válidas es del 99,6%, un 0,4% de las predicciones no corresponden a una etiqueta válida y requerirían manejo de errores en producción.
- El rendimiento se ha medido sobre un único split de test predicho una sola vez; no hay validación cruzada publicada.
- La licencia Apache 2.0 permite uso comercial, pero debe verificarse la licencia del modelo base Qwen3-1.7B, que puede tener condiciones adicionales.
- El adaptador depende del modelo base Qwen3-1.7B; cualquier cambio en la versión del base puede alterar el comportamiento.
- No se documentan sesgos específicos ni evaluaciones de robustez frente a entradas adversariales.
- El prompt debe respetar el formato de sistema corto sin lista de etiquetas y con thinking desactivado; desviarse de este formato puede degradar el rendimiento.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/mikan-research/banking77-qwen3-1.7b-lora
- Modelo base: https://huggingface.co/Qwen/Qwen3-1.7B
- Repositorio Mikan: https://github.com/mikan-research/mikan
- Dataset Banking77: https://huggingface.co/datasets/PolyAI/banking77
- Dataset de destilación: https://huggingface.co/datasets/mikan-research/banking77-distill
- Paper de Banking77: Casanueva et al., 2020, "Efficient Intent Detection with Dual Sentence Encoders" (referenciado en la model card; sin URL directa en la información disponible)
