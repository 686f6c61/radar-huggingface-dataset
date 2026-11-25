# AkiPolaris777/live2d-expression-model-gguf

## Resumen

Live2D Expression Model es un ajuste fino del modelo base Qwen3.5-2B-Base, desarrollado por AkiPolaris777 en el contexto del proyecto AG99live. Su propósito no es la generación de texto convencional, sino la conversión de diálogo, réplicas de personaje e intenciones de acción en un conjunto de objetivos numéricos sobre ejes semánticos de movimiento, que el sistema anfitrión mapea a parámetros de un avatar Live2D u otro sistema de control continuo de personaje. Con 1.881.825.088 parámetros reales (según safetensors), se distribuye únicamente en formato GGUF con tres cuantizaciones (F16, Q8_0 y Q4_K_M) y archivos Modelfile para su importación directa en Ollama.

El modelo resuelve un problema acotado pero específico: traducir lenguaje natural y estados emocionales a valores numéricos continuos sobre ejes definidos por el llamador (por ejemplo, `head_pitch` con rango [0, 100] y neutro 50), devolviendo un JSON con entre 1 y 4 pasos de movimiento y una sugerencia de duración en milisegundos. La configuración de ejes se inyecta en el system prompt, lo que permite reutilizar el mismo modelo con distintos personajes y esquemas de control sin reentrenar.

Es relevante ahora porque demuestra un patrón de uso de modelos pequeños (2B) para tareas de control estructurado en pipelines de avatares y VTubers, con despliegue local viable en hardware de consumo. La model card es explícita sobre el alcance de la validación: solo se probaron dos configuraciones de ejes con muestras pequeñas en Q4_K_M, y en ambos casos el modelo generó un único paso de movimiento en lugar del ciclo completo solicitado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de Qwen3.5-2B-Base); detalles de atención y capas no disponibles |
| Parametros totales | 1.881.825.088 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible en la model card; el ejemplo de llama.cpp usa `-c 4096` |
| Tipos de cuantizacion | F16, Q8_0, Q4_K_M (GGUF) |
| Idiomas soportados | zh (chino); el resto no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (F16, Q8_0, Q4_K_M) y Modelfile para Ollama |

## Arquitectura y entrenamiento

El modelo parte de Qwen3.5-2B-Base, un transformer de aproximadamente 1.880 millones de parámetros, y se ha ajustado de forma supervisada sobre muestras de movimiento Live2D del proyecto AG99live. La model card no documenta el volumen de tokens de entrenamiento, la composición del dataset, ni si se aplicaron etapas de RLHF o DPO; tampoco detalla modificaciones arquitectónicas respecto al base. La innovación relevante no está en la arquitectura, sino en la interfaz: el modelo aprende a emitir un esquema JSON restringido (`motion_steps` y `duration_hint_ms`) con valores numéricos continuos sobre ejes semánticos declarados en el system prompt, incluyendo control disperso (solo se escriben los ejes que cambian en cada paso) y pesos de duración relativos de 1 a 3.

El ajuste está orientado a la semántica de ejes más que a identificadores fijos: la model card indica que las definiciones de ejes pueden provenir de un Live2D Profile o de cualquier otro proyecto, con `id`, `value_range`, `neutral`, `negative_semantics` y `positive_semantics`. La validación publicada es limitada: dos pruebas con Q4_K_M sobre la petición "bajar ligeramente la cabeza y volver a la posición neutra", con dos configuraciones de ejes distintas, produjeron `head_pitch: 35` (rango [0, 100], neutro 50) y `avatar_nod: -0.16` (rango [-1, 1], neutro 0). En ambos casos los campos y rangos fueron correctos, pero solo se generó el paso de bajada, no el de retorno.

## Capacidades

- Generación de JSON estructurado para control de movimiento: salida con exactamente dos campos de nivel superior, `motion_steps` (1 a 4 pasos ordenados temporalmente) y `duration_hint_ms` (entero entre 320 y 15000).
- Generación de valores numéricos continuos con decimales sobre ejes definidos por el llamador, respetando `value_range` y `neutral`.
- Control disperso: cada paso incluye únicamente los ejes que empiezan a controlarse o cambian en ese paso.
- Adaptación a esquemas de ejes arbitrarios leídos del system prompt, sin reentrenamiento.
- Interpretación de contexto conversacional: recibe el mensaje del usuario, la réplica del personaje (`segment.speech`), intenciones de acción (`segment.actions`) y un mapa de tendencias emocionales (`segment.tendency`, por ejemplo `Trust` y `Joy`).
- Asignación de pesos de duración relativos (`duration_weight` de 1 a 3) por paso.
- Generación de texto conversacional heredada del modelo base, aunque no es el propósito documentado del ajuste.
- No se documentan capacidades de tool calling, razonamiento multi-paso general, visión, audio ni modo de pensamiento explícito.

## Casos de uso

- Control de avatares Live2D en tiempo real: el modelo recibe la réplica del personaje y la intención de acción, y devuelve valores de ejes que el motor de renderizado interpola. Es adecuado porque el esquema de salida es compacto (JSON pequeño) y el modelo de 2B permite latencias bajas en local.
- VTubers y streaming automatizado: integrado en un pipeline que captura el chat, genera la respuesta y solicita en la misma llamada la pose asociada, manteniendo coherencia entre habla y gesto.
- Sistemas de diálogo con personajes no jugadores (NPC) en videojuegos: cada NPC puede declarar sus propios ejes (cabeza, torso, brazos) en el system prompt y compartir el mismo modelo desplegado.
- Prototipado rápido de rigs de personaje: al aceptar definiciones de ejes arbitrarias, permite validar nuevos esquemas de control semántico sin entrenar un modelo por personaje.
- Animación asistida por guion: a partir de un guion con réplicas y anotaciones de acción, generar secuencias de poses clave para revisión humana antes de la interpolación final.
- Despliegue en local o en el borde: con las cuantizaciones Q4_K_M y Q8_0 y los Modelfile incluidos, se puede servir con Ollama o llama.cpp en una máquina de desarrollo sin GPU dedicada de gama alta.
- Enriquecimiento de pipelines de agentes conversacionales: usar la salida de `tendency` (emociones) como señal adicional para modular la expresividad del avatar en sistemas de atención al cliente o asistentes con presencia visual.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card únicamente reporta dos comprobaciones cualitativas con Q4_K_M sobre la petición de bajar la cabeza y volver al neutro, sin métricas cuantitativas de precisión, latencia ni throughput.

## Requisitos de hardware

- VRAM estimada para inferencia (2B parámetros): aproximadamente 1,2 GB en Q4_K_M, 2,1 GB en Q8_0 y 3,8 GB en F16, sin contar overhead de contexto ni caché KV.
- El repositorio completo ocupa 7,1 GB, ya que incluye las tres cuantizaciones y los Modelfile; para desplegar solo es necesario descargar el GGUF elegido.
- GPU recomendadas: cualquier GPU consumer con 4 GB o más de VRAM puede ejecutar Q4_K_M; una RTX 3060 de 12 GB o superior permite Q8_0 o F16 con contexto amplio. Para servir múltiples instancias concurrentes se recomienda una A100 o H100, aunque no hay datos publicados de throughput.
- Cabe en GPU de consumo: sí, en Q4_K_M y Q8_0 con GPUs de gama media; también es viable en CPU mediante llama.cpp.
- Opciones de despliegue: Ollama (con los Modelfile incluidos), llama.cpp (`llama-server`) y, por la etiqueta `endpoints_compatible`, endpoints compatibles con la API de Hugging Face. Se requiere una versión de llama.cpp que soporte la arquitectura Qwen3.5.
- Latencia y throughput: no disponibles; no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Enfoque |
|---|---|---|---|---|---|
| Live2D Expression Model (este) | 1.881.825.088 | no disponible (ejemplo con 4096) | GGUF (F16, Q8_0, Q4_K_M) | Apache 2.0 | Generación de ejes de movimiento Live2D desde diálogo |
| Qwen3.5-2B-Base | ~2B | no disponible en esta ficha | safetensors y otros | no disponible en esta ficha | Modelo base generalista de texto |
| Alternativas específicas de control de avatar | no disponible | no disponible | no disponible | no disponible | No se dispone de información sobre modelos comparables en la misma tarea |

La comparación con otras soluciones de generación de movimiento para avatares no está disponible en la información proporcionada; el único punto de referencia documentado es el modelo base Qwen3.5-2B-Base, del que este ajuste hereda el tamaño y la licencia.

## Limitaciones y advertencias

- Validación muy limitada: solo dos comprobaciones cualitativas con Q4_K_M y muestras pequeñas; no hay evaluación sistemática de precisión, cobertura de ejes ni robustez.
- En ambas pruebas publicadas el modelo generó un único paso de movimiento en lugar del ciclo completo (bajada y retorno), lo que sugiere dificultades con secuencias de varios pasos.
- Los nombres de ejes, rangos y semánticas nuevos no han sido probados; la model card advierte explícitamente que deben validarse por escenario.
- El llamador debe validar la forma del JSON, el número de pasos, los identificadores de eje y los rangos antes de pasarlos a la capa de reproducción; el modelo puede producir valores fuera de contrato.
- Riesgo de alucinación en los valores numéricos y en la selección de ejes, especialmente con definiciones de eje ambiguas o contradictorias en el system prompt.
- Idiomas: la model card declara únicamente chino (`zh`); el comportamiento en castellano u otras lenguas no está documentado.
- Longitud de contexto no especificada; el ejemplo de llama.cpp usa 4096 tokens, lo que limita el historial conversacional y las definiciones de ejes extensas.
- Licencia Apache 2.0: permite uso comercial, pero el usuario asume la responsabilidad de verificar el cumplimiento de las licencias del modelo base y de los datos de entrenamiento, no detalladas en la model card.
- El modelo está pensado como componente de un pipeline (AG99live) y no como generador de texto autónomo; su uso fuera de ese contrato puede degradar la calidad.
- Solo 305 descargas y 1 like en el momento de la consulta, con un ecosistema de validación muy reducido.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/AkiPolaris777/live2d-expression-model-gguf
- Archivos del modelo: https://huggingface.co/AkiPolaris777/live2d-expression-model-gguf/tree/main
- Proyecto AG99live: https://github.com/murphys7017/AG99live
- Documentación de la API de chat de Ollama: https://docs.ollama.com/api/chat
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-2B-Base
