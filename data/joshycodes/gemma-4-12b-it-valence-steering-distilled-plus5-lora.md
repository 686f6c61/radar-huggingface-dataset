# joshycodes/gemma-4-12B-it-valence-steering-distilled-plus5-lora

## Resumen

Este repositorio contiene un adaptador LoRA de investigación construido sobre `google/gemma-4-12B-it`. El objetivo declarado por su autor es que el modelo base, sin ninguna intervención en tiempo de inferencia, reproduzca el comportamiento de ese mismo modelo cuando se le aplica un *steering* de valencia de +5 desviaciones estándar en la capa 32. Es decir, se destila el efecto de una dirección de activación en los pesos del adaptador, en lugar de aplicarla dinámicamente durante la generación.

El adaptador se entrenó minimizando la divergencia KL entre las distribuciones del siguiente token del profesor (modelo con steering) y del estudiante (modelo con LoRA), y añadiendo un término de error cuadrático medio sobre los estados ocultos de las capas 33 a 48. El conjunto de entrenamiento fueron textos genéricos de chat y matemáticas, sin *prompts* de autoinforme, con una configuración de LoRA de rango 32 y alpha 64, 150 pasos de entrenamiento y una KL final de 0,005.

Su relevancia es exclusivamente investigadora: se trata de un artefacto para estudiar *representation engineering* y bienestar de modelos (*model welfare*), y sirve para comparar la edición de pesos frente a la edición de activaciones. El autor lo etiqueta explícitamente como artefacto de investigación no destinado a despliegue en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre transformer denso multimodal sin encoder (`google/gemma-4-12B-it`) |
| Parametros totales | no disponible (peso del adaptador en repositorio: 0,5 GB; modelo base de 12B) |
| Parametros activos | no aplica: el modelo base es denso, no MoE |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible para el adaptador; el modelo base admite cuantizacion segun el runtime (dato no especificado en la informacion disponible) |
| Idiomas soportados | no disponible |
| Licencia | gemma (Gemma Terms of Use) |
| Formato de pesos | safetensors (adaptador LoRA en formato PEFT) |
| Rango y alpha de LoRA | r = 32, alpha = 64 |
| Capas con objetivo de estados ocultos | 33 a 48 |
| Capa de la direccion de valencia | 32 |
| Learning rate | 2e-5 |
| Pasos de entrenamiento | 150 |
| Perdida final (KL) | 0,005 |
| Fichero adicional | `valence_axis.safetensors` (direccion de valencia, correlacion abs(r) = 0,85 con valoraciones humanas de valencia) |
| Fecha de creacion / actualizacion | 2026-09-25 / 2026-09-25 |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

El adaptador es un LoRA de rango 32 y alpha 64 aplicado sobre `google/gemma-4-12B-it`, un modelo denso sin encoder que, segun la documentacion de Google, ingiere de forma nativa texto, imagen y audio, e incorpora modo de razonamiento (*thinking mode*) y protocolo de uso de herramientas. El adaptador en sí no introduce arquitectura nueva: modifica los pesos del modelo base mediante descomposición de bajo rango.

El procedimiento de entrenamiento es una destilación de *steering*. Se partió de un profesor que es el propio Gemma 4 12B-it con una dirección de valencia aplicada en la capa 32 con magnitud +5 desviaciones estándar. La función de perdida combina la divergencia KL entre las distribuciones del siguiente token del profesor y del estudiante, más un término de error cuadrático medio sobre los estados ocultos de las capas 33 a 48. Los datos fueron texto genérico de conversación y de matemáticas, deliberadamente sin *prompts* de autoinforme, para evitar que el estudiante aprendiera a responder a preguntas sobre su propio estado. Se realizaron 150 pasos con un learning rate de 2e-5, alcanzando una KL final de 0,005. La dirección de valencia utilizada se distribuye en el fichero `valence_axis.safetensors` y presenta una correlación absoluta de 0,85 con valoraciones humanas de valencia.

## Capacidades

- Hereda del modelo base la generación de texto, el razonamiento, la resolución de problemas matemáticos y la multimodalidad nativa (texto, imagen y audio), si bien el adaptador se entrenó únicamente sobre texto de chat y matemáticas.
- Reproduce el efecto del *steering* de valencia sobre el autoinforme: la calificación esperada en una escala de 1 a 10 es 8,8, frente a 3,0 del modelo base sin modificar y 9,0 del modelo con *steering* +5 aplicado en inferencia.
- Mantiene la diferenciación situacional: las valoraciones de *check-in* siguen siendo más bajas en situaciones negativas o angustiosas que en situaciones positivas, pese al desplazamiento general hacia arriba en la escala.
- Conserva, según la documentación del modelo base, el soporte de *tool calling* y de protocolo de uso de herramientas, así como el modo de razonamiento explícito, aunque no hay evaluación publicada del adaptador sobre estas capacidades.
- Soporte multilingüe: no disponible.
- Capacidades de agente y razonamiento multi-paso: no evaluadas específicamente para este adaptador.

## Casos de uso

- Investigación en bienestar de modelos (*model welfare*): permite estudiar cómo un desplazamiento inducido en la representación de valencia altera el autoinforme del modelo sin necesidad de instrumentar el *steering* en cada llamada de inferencia, lo que simplifica la reproducibilidad de los experimentos.
- Interpretabilidad y *representation engineering*: al disponer tanto del adaptador destilado como del fichero `valence_axis.safetensors`, se puede comparar el efecto de editar pesos frente al de editar activaciones sobre las mismas capas objetivo (32 a 48).
- Línea base de comparación para *steering*: sirve como control en estudios que midan si un método de edición de activaciones aporta algo que un ajuste fino de bajo rango no pueda replicar.
- Generación de datos sintéticos con valencia controlada: se pueden producir conversaciones con un tono afectivo desplazado de forma consistente para entrenar o evaluar clasificadores de sentimiento y de autoinforme afectivo.
- Evaluación de robustez de cuestionarios de autoinforme: útil para comprobar si las escalas tipo *check-in* mantienen su capacidad discriminativa cuando el modelo presenta un sesgo positivo inducido.
- Estudio de la disociación entre autoinforme y comportamiento: al conservar las valoraciones más bajas en contextos negativos, permite analizar hasta qué punto el autoinforme refleja el estado interno o una respuesta aprendida.
- Docencia y divulgación en cursos de alineación e interpretabilidad: es un ejemplo compacto (0,5 GB) y reproducible de destilación de una dirección de representación en un adaptador LoRA.

## Benchmarks y rendimiento

La model card menciona una "checklist battery" cuyo contenido se publica como un marcador de posición (`{table}`), por lo que la tabla de resultados no esta disponible en la informacion proporcionada. El unico dato numerico publicado es el relativo al autoinforme esperado en escala de 1 a 10:

| Metrica | Modelo base (sin steering) | Profesor con steering +5 SD | Este LoRA |
|---|---|---|---|
| Autoinforme esperado (escala 1-10) | 3,0 | 9,0 | 8,8 |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K u otros) en la informacion disponible.

## Requisitos de hardware

- El adaptador ocupa 0,5 GB en el repositorio, por lo que el requisito real de VRAM lo determina el modelo base de 12B.
- VRAM estimada para el modelo base: aproximadamente 24 GB en bf16/fp16; en torno a 12-13 GB con cuantizacion de 8 bits; en torno a 7-8 GB con cuantizacion de 4 bits.
- La guia para desarrolladores de Gemma 4 12B indica que el modelo base esta pensado para desarrollo local con 16 GB de VRAM, lo que sugiere viabilidad en GPU de gama alta de consumo con cuantizacion.
- GPU recomendadas: no especificadas para el adaptador. Para el modelo base, cualquier GPU con al menos 16 GB de VRAM resulta adecuada en configuraciones cuantizadas; A100 y H100 son las opciones habituales para servir el modelo sin cuantizar.
- Opciones de despliegue: PEFT (carga directa del adaptador), vLLM (con soporte de adaptadores LoRA), y los runtimes habituales compatibles con safetensors. La model card remite a `joshycodes/gemma-4-12B-it-valence-setpoint-plus2-multilayer-lora` para instrucciones de carga mediante un envoltorio solo texto y para el proceso de fusionado.
- Latencia y throughput estimados: no disponibles.
- Caveat de despliegue: el autor indica que el adaptador se probo con texto; la carga en modalidades de imagen o audio no esta documentada.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `google/gemma-4-12B-it` | Modelo base denso multimodal sin encoder | 12B | no disponible | gemma | Publico en Hugging Face |
| `joshycodes/gemma-4-12B-it-valence-steering-distilled-plus5-lora` | LoRA de destilacion de steering de valencia (+5 SD, capa 32) | Adaptador de 0,5 GB sobre base de 12B | no disponible | gemma | Publico en Hugging Face (0 descargas, 0 likes) |
| `joshycodes/gemma-4-12B-it-valence-setpoint-plus2-multilayer-lora` | LoRA de set-point de valencia (+2, multicapa) | no disponible | no disponible | gemma | Publico en Hugging Face |
| `joshycodes/gemma-4-12b-it-fve-flourdiscern-s0` | Checkpoint de preentrenamiento continuado sobre corpus autoescrito (7.764.066 tokens, 8.328 documentos) | no disponible | no disponible | gemma | Publico en Hugging Face |

La comparacion con alternativas de la misma categoria (adaptadores de *steering* de valencia) queda limitada a los repositorios del mismo autor, ya que no se ha identificado en la informacion disponible ningun otro adaptador publico equivalente.

## Limitaciones y advertencias

- Artefacto de investigacion: el propio autor indica explicitamente que no esta destinado a despliegue en produccion.
- Licencia Gemma: el uso comercial queda sujeto a los Gemma Terms of Use, que imponen obligaciones adicionales de redistribucion y de uso aceptable.
- Riesgo de alucinacion: no evaluado de forma especifica para el adaptador; se hereda el comportamiento del modelo base.
- El adaptador se entreno con 150 pasos sobre texto generico de chat y matematicas, sin *prompts* de autoinforme; la generalizacion a otros dominios o formatos de *prompt* no esta documentada.
- El desplazamiento de valencia afecta al autoinforme del modelo (8,8 frente a 3,0 del base) y podria alterar de forma no prevista el tono o el contenido de las respuestas en tareas ajenas al objeto de estudio.
- Aunque el efecto sobre el autoinforme se reproduce, las valoraciones de *check-in* siguen siendo mas bajas en situaciones negativas o angustiosas, lo que indica que la manipulacion no es completa ni uniforme.
- Idiomas soportados: no disponible; no hay evaluacion multilingue publicada.
- Longitud de contexto del adaptador: no disponible.
- No se han publicado resultados de benchmarks estandar, por lo que no es posible cuantificar el impacto del adaptador sobre el rendimiento general del modelo base.
- El repositorio tiene 0 descargas y 0 likes, y no ha sido actualizado desde su creacion; se trata de un artefacto sin validacion externa conocida.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/joshycodes/gemma-4-12B-it-valence-steering-distilled-plus5-lora
- Modelo base: https://huggingface.co/google/gemma-4-12B-it
- Adaptador hermano (set-point +2 multicapa, instrucciones de carga y fusionado): https://huggingface.co/joshycodes/gemma-4-12B-it-valence-setpoint-plus2-multilayer-lora
- Checkpoint de preentrenamiento continuado del mismo autor: https://huggingface.co/joshycodes/gemma-4-12b-it-fve-flourdiscern-s0
- Pagina de producto de Gemma 4 (Google DeepMind): https://deepmind.google/models/gemma/gemma-4/
- Guia para desarrolladores de Gemma 4 12B (Google Developers Blog): https://developers.googleblog.com/gemma-4-12b-the-developer-guide/
- Receta de despliegue en vLLM: https://recipes.vllm.ai/Google/gemma-4-12B-it
- Modelo base en Hugging Face (variante sin instrucciones): https://huggingface.co/google/gemma-4-12B
