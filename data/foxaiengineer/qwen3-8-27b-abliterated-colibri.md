# foxAIengineer/Qwen3.8-27B-abliterated-colibri

## Resumen

Qwen3.8-27B-abliterated-colibri es un contenedor de pesos publicado por el usuario foxAIengineer en Hugging Face bajo el motor de inferencia colibri. Segun la model card, el contenedor aloja los pesos de Qwen3.6-35B-A3B en formato especifico para el motor colibri (fichero `qwen36.c`), con todas las capas procesadas, incluidas las de Gated DeltaNet. El repositorio ocupa 54,7 GB y fue creado el 16 de noviembre de 2026.

El modelo base declarado es Qwen3.6-35B-A3B, una arquitectura Mixture of Experts (MoE) con atencion hibrida: capas de atencion con compuertas (Gated-Attention) combinadas con capas de atencion lineal Gated DeltaNet. Cada capa incorpora su bloque MoE/MLP correspondiente. El sufijo "abliterated" indica que el autor ha aplicado una modificacion de pesos orientada a eliminar el comportamiento de rechazo del modelo original, una practica habitual en la comunidad de modelos sin censura.

La relevancia de esta publicacion es limitada y practica: se trata de un contenedor de inferencia para un motor concreto (colibri), no de un modelo entrenado desde cero ni de una version oficial. No dispone de descargas ni de "me gusta" en el momento de la consulta, la licencia no esta declarada y la model card es minima, limitada a describir la estructura del contenedor y el enlace al motor.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE hibrido con Gated-Attention y Gated DeltaNet (atencion lineal) |
| Parametros totales | 35B (segun el nombre del modelo base Qwen3.6-35B-A3B) |
| Parametros activos | 3B (segun el sufijo A3B del modelo base) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | Contenedor propietario del motor colibri (no safetensors ni GGUF) |

## Arquitectura y entrenamiento

La arquitectura corresponde al modelo base Qwen3.6-35B-A3B, descrito en la model card como un MoE en el que cada capa, incluidas las de atencion lineal, incorpora su bloque MoE/MLP. La atencion es hibrida: capas con Gated-Attention convencional y capas con Gated DeltaNet, una variante de atencion lineal recurrente basada en la regla delta con compuertas. Los pesos de DeltaNet residen bajo `model.layers.{i}.linear_attn.*` y son ejecutados por el motor `qwen36` de colibri mediante una implementacion recurrente de la regla gated-delta.

No se dispone de informacion sobre el volumen de tokens de entrenamiento, la composicion del dataset, ni sobre si el modelo base utilizo RLHF, DPO u otras tecnicas de alineamiento. La modificacion "abliterated" aplicada por el autor no esta documentada en la model card: no se especifica la metodologia exacta (ablacion de direcciones de rechazo, ajuste de pesos o fine-tuning), ni el impacto sobre las capacidades del modelo. Tampoco se detalla que cambios introduce el contenedor colibri respecto a los pesos originales, mas alla de la reestructuracion necesaria para el motor.

## Capacidades

- Generacion de texto y razonamiento: heredadas del modelo base Qwen3.6-35B-A3B, aunque no verificadas ni documentadas en esta publicacion.
- Codigo y matematicas: presumiblemente soportadas por el modelo base, sin datos de evaluacion en la model card.
- Tool calling y function calling: no documentado en la informacion disponible.
- Capacidades de agente y razonamiento multi-paso: no documentado.
- Multilingue: no documentado; los idiomas del modelo base no se detallan.
- Modo "thinking" o razonamiento extendido: no documentado.
- Vision o audio: no documentado.
- Comportamiento sin rechazo: el sufijo "abliterated" indica la eliminacion del comportamiento de rechazo, pero no se especifica el grado ni el metodo.

## Casos de uso

- Investigacion sobre alineamiento y seguridad: el modelo permite estudiar el efecto de la ablacion de rechazo sobre las respuestas en dominios sensibles, comparando con el modelo base original en condiciones controladas.
- Evaluacion de motores de inferencia alternativos: sirve para probar el motor colibri (`qwen36.c`) frente a implementaciones estandar como vLLM o llama.cpp en cargas MoE con atencion lineal.
- Experimentacion con arquitecturas hibridas Gated DeltaNet: util para medir el rendimiento real de la atencion lineal combinada con MoE en hardware concreto.
- Despliegue en entornos de investigacion cerrados: al no tener licencia declarada, su uso queda restringido a contextos internos donde el autor asuma la responsabilidad legal.
- Pruebas de cuantizacion y optimizacion: el contenedor de 54,7 GB permite experimentar con tecnicas de compresion sobre un MoE de 35B con 3B activos.
- Generacion de texto sin restricciones en entornos controlados: para estudiar el comportamiento del modelo abliterated en tareas creativas o de analisis donde el modelo base rechazaria peticiones.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: el repositorio ocupa 54,7 GB, lo que sugiere pesos en precision de 16 bits para 35B parametros (aproximadamente 70 GB teoricos, con posible compresion o formato parcial). No se especifica la cuantizacion.
- GPU recomendadas: no disponibles. Para un MoE de 35B en FP16 se requeririan al menos dos A100 de 40 GB o una H100 de 80 GB; en cuantizacion de 8 bits cabria en una A100 de 40 GB o una RTX 4090 de 24 GB con offloading parcial.
- GPU de consumo: no confirmado. Con 3B parametros activos el coste computacional por token es bajo, pero la memoria total para los 35B condiciona el despliegue.
- Opciones de despliegue: exclusivamente el motor colibri (repositorio https://github.com/JustVugg/colibri, fichero `qwen36.c`). No hay soporte declarado para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Activos | Contexto | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|---|
| Qwen3.8-27B-abliterated-colibri | 35B | 3B | no disponible | no disponible | contenedor colibri | 0 descargas |
| Qwen3.6-35B-A3B (base) | 35B | 3B | no disponible | no disponible | safetensors (presumible) | modelo oficial de referencia |
| Alternativas MoE de ~30-40B | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de rendimiento ni de especificaciones completas de los modelos comparables en la informacion proporcionada, por lo que la comparativa se limita a la estructura y al formato.

## Limitaciones y advertencias

- Licencia no declarada: no se puede determinar si el uso comercial esta permitido; en la practica, el modelo no es apto para produccion sin aclaracion legal previa.
- Modelo "abliterated": la eliminacion del comportamiento de rechazo puede incrementar el riesgo de generar contenido danino, sesgado o inexacto, y no se documenta el metodo ni el alcance de la modificacion.
- Riesgo de alucinacion: no evaluado en esta publicacion; se desconoce el comportamiento del modelo base y el impacto de la ablacion.
- Idiomas y contexto: no documentados; no se puede garantizar soporte multilingue ni una ventana de contexto concreta.
- Formato propietario: depende exclusivamente del motor colibri, lo que limita la portabilidad y la integracion con herramientas estandar del ecosistema (transformers, vLLM, llama.cpp).
- Sin validacion de la comunidad: cero descargas y cero "me gusta" en el momento de la consulta; no hay evidencia de que el contenedor funcione correctamente.
- Trazabilidad limitada: la model card no detalla la procedencia exacta de los pesos base ni el proceso de conversion, lo que dificulta la reproducibilidad.
- Fecha de creacion futura (2026): conviene verificar la autenticidad y vigencia de la publicacion antes de cualquier uso.

## Enlaces

- Hugging Face: https://huggingface.co/foxAIengineer/Qwen3.8-27B-abliterated-colibri
- Motor colibri: https://github.com/JustVugg/colibri
- Implementacion del motor Qwen3.6: https://github.com/JustVugg/colibri (fichero `c/qwen36.c`)
