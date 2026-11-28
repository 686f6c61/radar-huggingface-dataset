# drjoshcsimmons/Qwen3.5-4B-Persona-Mystic

## Resumen

Qwen3.5-4B-Persona-Mystic es un checkpoint de investigacion publicado por drjoshcsimmons sobre el modelo base Qwen/Qwen3.5-4B. No se trata de un modelo nuevo entrenado desde cero, sino de un ajuste fino selectivo que "hornea" (bake) una personalidad concreta, la de un oraculo tribal o mistica, directamente en los pesos del modelo. El objetivo es demostrar tecnicas de steering e interpretabilidad mecanistica: en lugar de aplicar hooks en tiempo de ejecucion o depender de un system prompt, la modificacion queda fusionada de forma permanente en dos capas MLP intermedias.

El modelo conserva la arquitectura y el tamano del base: 4.205.751.296 parametros segun los pesos en safetensors, lo que lo situa en la categoria de modelos densos de aproximadamente 4 mil millones de parametros. La intervencion consiste en actualizaciones de rango 16 fusionadas en `model.layers[16].mlp` y `model.layers[20].mlp`, afectando a `gate_proj`, `up_proj` y `down_proj`. El resultado es un checkpoint estandar en `.safetensors`, compatible con transformers, sin necesidad de codigo adicional para reproducir el comportamiento de persona.

Su relevancia es fundamentalmente investigadora: sirve como ejemplo reproducible de como una direccion de activacion identificada a nivel de neurona puede trasladarse a los pesos de un modelo y persistir sin infraestructura de inferencia especial. Esta orientado a quienes trabajan en interpretabilidad mecanistica, control de comportamiento y analisis de personas en modelos de lenguaje, no a despliegues de produccion generalistas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (familia Qwen3.5), tipo `qwen3_5_text` |
| Parametros totales | 4.205.751.296 |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; el base admite cuantizacion estandar, pero no se documenta en la model card) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (transformers) |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3.5-4B, un transformer denso de la familia Qwen3.5. La modificacion no reentrena el modelo completo: se aplica una actualizacion de rango 16 fusionada de forma permanente en las proyecciones MLP (`gate_proj`, `up_proj`, `down_proj`) de las capas 16 y 20. Segun la model card, la direccion de steering se inspira en una busqueda de neuronas de persona realizada sobre un modelo mayor (referencia `Qwen3.8-27B L41 N11176 (-0.5)`) y se valido en el propio Qwen3.5-4B mediante coincidencia de coseno de neurona unica, con mejor resultado en `L14 N1106` (`cos = -0.271`) en el rango de capas 12 a 24.

No se documentan datos de entrenamiento adicionales: no se indica numero de tokens, composicion del dataset, ni si hubo RLHF, DPO o ajuste supervisado convencional. La innovacion tecnica destacable es precisamente el metodo: convertir una direccion de activacion en una modificacion de pesos persistente, eliminando la necesidad de hooks en tiempo de ejecucion o de system prompt para activar la persona. El checkpoint resultante es un modelo estandar cargable con `AutoModelForCausalLM`.

## Capacidades

- Generacion de texto conversacional con una persona fija de oraculo tribal o mistica, activa sin system prompt.
- Respuesta a preguntas cotidianas reformuladas en clave de profecia, presagio y metafora ritual (se observa en los ejemplos de la model card: cocer un huevo, describir una tarde lluviosa, anudar una corbata).
- Razonamiento y generacion heredados del modelo base Qwen3.5-4B, condicionados por el estilo de la persona.
- Compatibilidad con el chat template de Qwen, incluyendo el parametro `enable_thinking=False` mostrado en el ejemplo de uso.
- Soporte de tool calling y function calling: no documentado en la model card; se desconoce si la persona interfiere con estos modos.
- Capacidades de agente y razonamiento multi-paso: no documentadas especificamente para este checkpoint.
- Capacidades multilingues: no documentadas; los ejemplos disponibles estan en ingles.
- Modo thinking: el template permite desactivarlo; no se detalla su comportamiento con la persona activa.
- Vision y audio: no disponibles.

## Casos de uso

- Investigacion en interpretabilidad mecanistica: el checkpoint permite estudiar como una direccion de activacion identificada a nivel de neurona se traduce en un cambio de comportamiento persistente al fusionarla en los pesos, comparando con la version base sin modificar.
- Experimentos de persona steering sin infraestructura: al no requerir hooks ni system prompt, se puede desplegar en cualquier stack compatible con transformers para comparar tecnicas de control de comportamiento.
- Generacion creativa con estilo consistente: escritura de ficcion, narrativa mitologica o worldbuilding donde se necesita una voz de oraculo estable a lo largo de conversaciones multi-turno.
- Prototipado de personajes para juegos o narrativa interactiva: la persona se mantiene incluso si el usuario intenta cambiarla por prompt, lo que resulta util para probar robustez de personajes.
- Docencia y divulgacion: ejemplo practico y reproducible de como se modifica un modelo open source a nivel de pesos para una demo de control de comportamiento.
- Evaluacion de metodos de edicion de modelos: banco de pruebas para medir efectos secundarios de fusionar actualizaciones de rango bajo en capas MLP concretas (perdida de capacidades, deriva estilistica, coherencia).
- Analisis de robustez frente a jailbreaks de persona: estudiar si una persona "horneada" en pesos es mas o menos resistente que una definida por system prompt.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en bfloat16: aproximadamente 8,4 GB solo para pesos, mas overhead de activaciones y cache KV; en la practica, alrededor de 10-12 GB para contextos moderados.
- En cuantizacion de 8 bits: aproximadamente 4,2 GB de pesos; en 4 bits: aproximadamente 2,1 GB, aunque la model card no documenta cuantizaciones probadas para este checkpoint.
- GPU recomendadas: A100, H100 o L40S para inferencia en precision completa sin restricciones; RTX 4090 (24 GB) y RTX 3090 (24 GB) son suficientes en bfloat16.
- Cabe en GPU de consumo: si, en tarjetas con 12 GB o mas en bfloat16 (por ejemplo RTX 4070 Ti, RTX 4080, RTX 4090); en 8 bits o 4 bits cabe en GPUs de 8 GB o menos.
- Opciones de despliegue: transformers (metodo documentado en la model card), vLLM, TGI y llama.cpp/Ollama previa conversion a GGUF, aunque solo transformers esta verificado por el autor.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Persona / control | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.5-4B-Persona-Mystic | 4,2 B | no disponible | Persona fusionada en pesos (capas 16 y 20) | no disponible | Hugging Face |
| Qwen/Qwen3.5-4B (base) | 4,2 B | no disponible | Sin persona especifica; control via prompt | no disponible | Hugging Face |
| Qwen3.8-27B (referencia citada) | 27 B (aproximado) | no disponible | Neurona de persona identificada (`L41 N11176`) | no disponible | no disponible |

La comparativa se limita a los modelos mencionados en la model card; no se dispone de datos de rendimiento ni de contexto para establecer comparaciones cuantitativas con alternativas de la misma categoria.

## Limitaciones y advertencias

- La persona domina todas las respuestas: el modelo reformula incluso preguntas practicas en clave mistica, lo que lo hace inadecuado para tareas que requieran respuestas literales o precisas.
- Riesgo elevado de alucinacion en contenido factual: la persona prioriza el estilo profetico sobre la exactitud, como se aprecia en los ejemplos (por ejemplo, la instruccion de cocer un huevo "en el calor del sol").
- No hay informacion sobre sesgos especificos, pero hereda los del modelo base Qwen3.5-4B, no documentados en esta ficha.
- Licencia no disponible: no se puede confirmar si se permite uso comercial; debe verificarse antes de cualquier despliegue en produccion.
- Idiomas no documentados: los ejemplos estan en ingles y se desconoce el comportamiento de la persona en castellano u otros idiomas.
- Longitud de contexto no documentada para este checkpoint.
- Checkpoint de investigacion con 0 descargas y 0 likes en el momento de la consulta: no ha pasado validacion comunitaria ni auditoria externa.
- La modificacion en solo dos capas MLP puede producir efectos secundarios no medidos sobre capacidades del base (codigo, matematicas, tool calling); no se han publicado evaluaciones al respecto.
- No usar como modelo de proposito general en produccion sin una evaluacion propia de calidad, seguridad y cumplimiento de licencia.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/drjoshcsimmons/Qwen3.5-4B-Persona-Mystic
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
