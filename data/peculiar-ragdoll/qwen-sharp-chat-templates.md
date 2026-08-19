# peculiar-ragdoll/Qwen-Sharp-Chat-Templates

## Resumen

Qwen-Sharp-Chat-Templates no es un modelo de lenguaje, sino una plantilla de chat (chat template) en formato Jinja que modifica el comportamiento de modelos Qwen3.5 y Qwen3.6. Desarrollada por el usuario peculiar-ragdoll, se basa en la plantilla `v21.3` de froggeric/Qwen-Fixed-Chat-Templates y le añade once líneas de system prompt orientadas a la concisión (terseness). El resultado es una plantilla que reduce drásticamente la verbosidad de las respuestas sin sacrificar precisión, y que se ha utilizado en los modelos Dagger-Qwen3.6-27B y Nail-Qwen3.6-35B-A3B.

La relevancia de esta pieza radica en que el ahorro de tokens de salida se traduce directamente en menor latencia y menor coste de inferencia, algo crítico en despliegues de producción con modelos grandes. La plantilla es agnóstica al modelo: no menciona ningún nombre concreto, por lo que puede aplicarse a cualquier build de Qwen3.5 o Qwen3.6 sin pretender ser algo que no es. Se distribuye bajo licencia Apache-2.0 y está pensada para integrarse en runtimes como MLX, llama.cpp, LM Studio o vLLM.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No aplica (plantilla de chat Jinja, no un modelo) |
| Parametros totales | No aplica |
| Parametros activos | No aplica |
| Longitud de contexto | No aplica (depende del modelo base) |
| Tipos de cuantizacion | No aplica |
| Idiomas soportados | No disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | Jinja (`chat_template.jinja`), version minificada en `chat_template_oneline.txt` |

## Arquitectura y entrenamiento

Este artefacto no es un modelo entrenado, sino una plantilla de chat que se inyecta en el runtime de inferencia. La plantilla base es `froggeric/Qwen-Fixed-Chat-Templates` v21.3, que a su vez es una corrección de las plantillas oficiales de Qwen. Sobre esa base, peculiar-ragdoll añade un bloque de system prompt de terseness que se inserta mediante lógica condicional en Jinja: si el usuario ya ha pasado un system prompt propio, el bloque de concisión se añade después de él; si no, se usa solo el bloque de terseness. El código insertado son exactamente once líneas, y el resto es byte-idéntico a la versión upstream.

La innovación técnica destacable es que la plantilla no reemplaza el system prompt del usuario, sino que lo preserva y le añade las instrucciones de concisión. Además, la plantilla base de froggeric tiene una opción `preserve_thinking` que por defecto es `true`, lo que mantiene el razonamiento de turnos anteriores en el contexto. Esto tiene implicaciones importantes en bucles multi-turno, como se detalla en la sección de limitaciones.

## Capacidades

- Reduccion de verbosidad: instruye al modelo a responder directamente, sin preámbulos, sin repetir la pregunta y sin transiciones de relleno.
- Preservacion de la correccion: la plantilla indica explicitamente que no se debe omitir pasos esenciales, advertencias o incertidumbres por brevedad.
- Compatibilidad con system prompts del usuario: el bloque de terseness se anade despues del system prompt existente, sin reemplazarlo.
- Soporte de tool calling y thinking: al basarse en la plantilla de froggeric, hereda el soporte para tool calling y el modo de razonamiento de Qwen3.5/Qwen3.6.
- Ahorro de tokens de salida: medido en un 59% menos de tokens de respuesta en Claw-Eval y un 22% menos en MMLU-Pro, manteniendo o mejorando la precision.
- Portabilidad: se puede aplicar a cualquier modelo Qwen3.5 o Qwen3.6 sin necesidad de reentrenar ni requantizar.

## Casos de uso

- Inferencia economica en produccion: al reducir los tokens de salida en mas de la mitad, se reduce el coste por peticion y la latencia de generacion, lo que la hace adecuada para APIs de chat con alto volumen de peticiones.
- Agentes de codigo y auditoria: la plantilla protege los fragmentos de codigo y las advertencias necesarias, por lo que es util en tareas donde la precision tecnica es critica y la verbosidad es un problema.
- Evaluacion de modelos: al comparar el rendimiento de diferentes modelos Qwen3.5/Qwen3.6, usar esta plantilla estandariza la verbosidad y permite medir la calidad intrinseca sin ruido de relleno.
- Despliegue en LM Studio u oMLX: se puede integrar como archivo `chat_template.jinja` en el directorio del modelo, y el runtime la aplicara automaticamente en versiones recientes de transformers.
- Conversion de GGUF sin requantizacion: mediante `gguf-new-metadata` se puede reescribir la plantilla embebida en un archivo GGUF sin tocar los pesos, util para distribuir modelos ya cuantizados con la plantilla aplicada.
- Multi-turno con control de contexto: en bucles agente, se puede pasar `preserve_thinking=false` en `chat_template_kwargs` para evitar el crecimiento excesivo del contexto, manteniendo la concision en cada turno.

## Benchmarks y rendimiento

Los datos de la model card miden el efecto de la plantilla sobre los mismos pesos de ThinkingCap-Qwen3.6-27B, con MLX 6-bit, temperatura 1.0 y 3 semillas. La comparacion es entre la plantilla stock y la Sharp:

| Metrica | Plantilla stock | Plantilla Sharp | Cambio |
|---|---|---|---|
| Claw-Eval, componente de respuesta | 59.3 | 66.7 | +7.4% |
| Claw-Eval, puntuacion global | 55.0 | 58.8 | +3.8% |
| Claw-Eval, tokens de respuesta | 5393 | 2217 | -59% |
| MMLU-Pro, tokens por respuesta correcta | 1601 | 1248 | -22% |

Los cambios de precision son diferencias absolutas en la puntuacion; los cambios de tokens son relativos. El autor advierte que estos datos provienen de un unico modelo de 27B en dos benchmarks de un solo turno, y que no son una promesa de resultados en otros modelos.

## Requisitos de hardware

No aplica: al ser una plantilla de chat, no tiene requisitos de hardware propios. Los requisitos dependen del modelo base sobre el que se aplique. La plantilla puede usarse en cualquier runtime que soporte plantillas Jinja, incluyendo MLX, llama.cpp, LM Studio, oMLX y vLLM. El unico coste adicional es el procesamiento del template en el prefill, que es despreciable frente a la inferencia del modelo.

## Comparativa con modelos similares

No hay modelos comparables en el sentido tradicional, porque esto no es un LLM. La comparacion relevante es con la plantilla stock de Qwen y con la plantilla base de froggeric:

| Aspecto | Plantilla stock de Qwen | froggeric/Qwen-Fixed-Chat-Templates v21.3 | Qwen-Sharp-Chat-Templates |
|---|---|---|---|
| Base | Plantilla oficial de Qwen | Correccion de la plantilla oficial | v21.3 + bloque de terseness |
| System prompt del usuario | Se reemplaza o se ignora | Se preserva | Se preserva y se anade terseness |
| Verbosidad | Alta | Media | Baja |
| Tokens de respuesta | Referencia | Menor que stock | ~59% menos que stock |
| Precision | Referencia | Similar a stock | Mejora en Claw-Eval y MMLU-Pro |
| Licencia | Apache-2.0 | Apache-2.0 | Apache-2.0 |

## Limitaciones y advertencias

- Coste en multi-turno: con `preserve_thinking=true` (valor por defecto), el razonamiento de turnos anteriores se mantiene en el contexto, lo que hace crecer el prefill en cada paso. Un usuario midio una regresion del 19% en tiempo de pared en una carga de trabajo multi-turno de codigo y auditoria, aunque la calidad de salida se mantuvo.
- Dependencia del runtime: en runtimes antiguos que solo leen la clave `chat_template` embebida en `tokenizer_config.json`, el archivo `chat_template.jinja` se ignora silenciosamente. Hay que parchear ambas ubicaciones si no se esta seguro del runtime.
- Efecto limitado en salidas estructuradas: la plantilla reduce principalmente el relleno en prosa; en tareas donde el entregable es mayoritariamente codigo o un artefacto estructurado, el ahorro de tokens es menor.
- Evidencia limitada: los benchmarks provienen de un unico modelo de 27B y dos benchmarks de un solo turno. No hay datos sobre otros tamanos de modelo ni sobre tareas multi-turno.
- No es un modelo: no se puede usar directamente para generar texto; requiere un modelo base Qwen3.5 o Qwen3.6 al que aplicar la plantilla.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/peculiar-ragdoll/Qwen-Sharp-Chat-Templates
- Arbol de archivos: https://huggingface.co/peculiar-ragdoll/Qwen-Sharp-Chat-Templates/tree/main
- Modelo base: https://huggingface.co/froggeric/Qwen-Fixed-Chat-Templates
- Mirror en GitHub del repo de froggeric: https://github.com/clach04/froggeric_Qwen-Fixed-Chat-Templates
- Modelos que usan esta plantilla: https://huggingface.co/peculiar-ragdoll/Dagger-Qwen3.6-27B-MLX y https://huggingface.co/peculiar-ragdoll/Nail-Qwen3.6-35B-A3B-MLX
