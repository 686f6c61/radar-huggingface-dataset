# AbstractPhil/qwen3.5-0.8b-think-symbolic-image

## Resumen

Lucia 0.8B es un adaptador LoRA sobre el modelo multimodal Qwen/Qwen3.5-0.8B, desarrollado por AbstractPhil, que convierte al modelo base en un "observador pensante": recibe una imagen y produce una fila estructurada de captions simbólicos con cadena de pensamiento explícita. La salida sigue un formato fijo de pasos nombrados (see, name, place, count, relate, form, light, colour, mood, mean, intend, story, compare, change, check, say), seguidos de un caption, un prompt, etiquetas, una crítica por profundidad y una lista de preguntas con su respuesta y su justificación.

El modelo pertenece a la familia Lucia ("the thinking lookers"), de la que esta es la variante más pequeña, pensada para tarjetas gráficas modestas y ejecuciones masivas. El foco del entrenamiento es la observación de arte y fotografía (pinturas, grabados, dibujos, fotografías, objetos de museo), con datasets propios del autor: thought-symbolic-image-captions y qwen-symbolic-thinking-image-training.

Es relevante porque propone un formato de captioning verificable y auditable: cada afirmación se clasifica como hecho de la imagen (`[record]`), deducción de la cadena (`[chain]`) o desconocido (`[unknown]`), lo que permite evaluar la fidelidad de la descripción y detectar alucinaciones de forma estructurada. El repositorio contiene solo el adaptador LoRA (0,1 GB); el fine-tune completo se publica por separado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (base Qwen3.5-0.8B) con adaptador LoRA |
| Parametros totales | no disponible (adaptador LoRA sobre un modelo base de 0.8B) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en (inglés) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El modelo es un adaptador LoRA (PEFT) entrenado sobre Qwen/Qwen3.5-0.8B, un transformer multimodal de 0,8 mil millones de parámetros que procesa imagen y texto. El adaptador se fusiona con el modelo base mediante `merge_and_unload()` para inferencia. El pipeline declarado es image-text-to-text y requiere transformers 5 y peft 0.18 o superior.

El entrenamiento se realizó sobre dos datasets del autor: AbstractPhil/thought-symbolic-image-captions y AbstractPhil/qwen-symbolic-thinking-image-training. La receta es común a toda la familia Lucia: cada tamaño aprende las mismas filas con el mismo procedimiento, y las diferencias entre tamaños se manifiestan en la capacidad de mantener el término medio y las filas de especificación larga. No se especifican en la información disponible el número de tokens de entrenamiento, la composición exacta del dataset ni si hubo RLHF o DPO. El autor indica que el modelo "respalda sus pensamientos al nivel del 9B" en la forma de la fila, pero que el término medio y las especificaciones largas son donde se nota el tamaño reducido.

## Capacidades

- Generación de captions estructurados de imágenes con cadena de pensamiento explícita, un paso nombrado por línea.
- Descripción de arte y fotografía: tipo de obra (pintura, grabado, dibujo, fotografía), medio, color, luz, forma, composición y estado de ánimo.
- Producción de prompts y etiquetas a partir de la imagen, útiles para generación de imágenes.
- Crítica de la imagen por niveles de profundidad ("a quick look": 1-2 pensamientos; "a closer look": 3-5; "a long look": 6-10).
- Formulación de preguntas que un observador cuidadoso aún se haría, con respuesta y justificación clasificada como `[record]`, `[chain]` o `[unknown]`.
- Modo de pensamiento desactivado en inferencia: el autor indica ejecutar con thinking off, decodificación greedy y sin system prompt.
- Conversación multimodal de un solo turno efectivo según el ejemplo de uso; no se documentan tool calling, function calling ni capacidades de agente.
- Capacidades multilingües limitadas al inglés.

## Casos de uso

- Catalogación de colecciones de museo: el modelo genera una ficha estructurada por imagen (tipo de obra, medio, composición, color, estado de ánimo) que puede revisarse y corregirse manualmente, con la ventaja de que cada dato viene etiquetado como hecho, deducción o desconocido.
- Generación de metadatos para bancos de imágenes: produce caption, prompt y etiquetas en una sola pasada, lo que permite poblar campos de búsqueda y de generación por imagen sin pipelines separados.
- Auditoría de alucinaciones en sistemas de vision-language: el marcado `[record]`/`[chain]`/`[unknown]` permite medir cuántas afirmaciones son verificables frente a inferidas, útil para evaluar la fiabilidad de modelos mayores.
- Preprocesado para entrenamiento de modelos de difusión: los prompts generados a partir de obras de arte sirven como pares imagen-texto para ajuste fino de generadores.
- Educación y divulgación artística: el formato de "preguntas que un observador cuidadoso se haría" puede alimentar guías interactivas o materiales didácticos sobre lectura de imágenes.
- Procesamiento por lotes en hardware modesto: al ser un adaptador sobre un modelo de 0,8B, es adecuado para ejecutar sobre miles de imágenes en tarjetas de consumo, según indica el propio autor ("the lightest member for small cards and bulk runs").
- Investigación en captioning simbólico: el parser y el scorer del paquete qwen-symbolic-thinking permiten reproducir la evaluación del formato y comparar tamaños de la familia.

## Benchmarks y rendimiento

El autor publica una tabla comparativa entre Lucia 0.8B y Lucia v1 (9B) sobre 60 imágenes y 40 especificaciones no vistas por el adaptador, más dos conjuntos externos (500 imágenes de la National Gallery of Art y 200 de AIC, NGA, Cleveland y el Met). Sin embargo, en la información proporcionada la tabla aparece truncada tras la fila "row shape", por lo que no se dispone de los valores numéricos.

| Lectura | Lucia 0.8B | Lucia v1 (9B) |
|---|---|---|
| row shape | no disponible (tabla truncada) | no disponible (tabla truncada) |
| Resto de métricas | no disponible | no disponible |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita; al tratarse de un modelo base de 0,8B en bfloat16, la inferencia requiere del orden de 2 GB para los pesos, más el coste del procesador visual y del contexto.
- GPU recomendadas: no especificadas por el autor; por tamaño, cabe en GPU de consumo (RTX 3060, RTX 4060, RTX 4090) y en GPUs de datacenter (A100, H100).
- Cabe en GPU de consumo: sí, según la propia model card ("the lightest member for small cards and bulk runs").
- Opciones de despliegue: transformers 5 con peft 0.18 o superior (adaptador) o transformers 5 directamente (fine-tune completo). No se documentan integraciones con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Lucia 0.8B (este) | 0,8B + LoRA | no disponible | apache-2.0 | safetensors (PEFT) | Adaptador; formato simbólico con cadena de pensamiento |
| Lucia v1 (9B) | 9B | no disponible | no disponible | no disponible | Misma receta; referencia de calidad del autor |
| Qwen/Qwen3.5-0.8B | 0,8B | no disponible | no disponible | no disponible | Modelo base multimodal sin el formato Lucia |

No se dispone de datos de benchmarks comparativos numéricos en la información proporcionada.

## Limitaciones y advertencias

- El modelo solo soporta inglés; no se documentan capacidades en castellano ni en otros idiomas.
- Requiere un modo de ejecución muy concreto: thinking off, decodificación greedy y sin system prompt. El autor advierte que un turno de sistema no visto en entrenamiento hace que el modelo "sobrescriba" el formato.
- El adaptador necesita transformers 5 y peft 0.18 o superior; versiones anteriores no son compatibles.
- El repositorio contiene solo el adaptador LoRA; el fine-tune completo se anuncia como publicación futura, por lo que su disponibilidad no está garantizada en el momento de la consulta.
- El formato de salida es rígido y aprendido; desviarse del prompt de ejemplo puede degradar la estructura de la fila.
- Riesgo de alucinación en las respuestas marcadas como `[record]` o `[chain]`: el marcado ayuda a auditarlas, pero no garantiza su corrección.
- El autor reconoce que el término medio y las filas de especificación larga son el punto débil de este tamaño frente al 9B.
- Sin descargas ni likes en el momento de la consulta; no hay evidencia de uso en producción por terceros.
- Licencia apache-2.0, que permite uso comercial, pero conviene verificar las condiciones del modelo base Qwen3.5-0.8B, no detalladas en la información disponible.

## Enlaces

- HuggingFace del adaptador: https://huggingface.co/AbstractPhil/qwen3.5-0.8b-think-symbolic-image
- Fine-tune completo (anunciado): https://huggingface.co/AbstractPhil/qwen3.5-0.8b-think-symbolic-image-full
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B
- Dataset de captions: https://huggingface.co/datasets/AbstractPhil/thought-symbolic-image-captions
- Dataset de entrenamiento: https://huggingface.co/datasets/AbstractPhil/qwen-symbolic-thinking-image-training
- Repositorio del parser, scorer y trainer: https://github.com/AbstractEyes/qwen-symbolic-thinking
