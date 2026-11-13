# ai4ug/pearl-chat-v4-it

## Resumen

Pearl-chat-v4-it es un modelo de generacion de texto afinado para instrucciones, desarrollado por ai4ug, orientado especificamente al idioma luganda (codigo ISO `lug`). Con 46,28 millones de parametros, se posiciona como un modelo compacto disenado para tareas de conversacion y generacion en una lengua de bajos recursos, un ambito tradicionalmente desatendido por los grandes laboratorios. El modelo se distribuye bajo licencia Apache 2.0, aunque el acceso al repositorio esta restringido y requiere aceptar las condiciones en Hugging Face.

La relevancia de este modelo radica en su especializacion: frente a los modelos multilingues de gran tamano que cubren el luganda de forma marginal, Pearl-chat-v4-it se entrena sobre datasets propios del proyecto (`ai4ug/luganda_pretrain_v4` y `ai4ug/luganda_sft_v4`), lo que sugiere un esfuerzo deliberado por construir recursos linguisticos para esta lengua. Su tamano reducido permite desplegarlo en hardware modesto, lo que facilita su adopcion en contextos con recursos computacionales limitados.

No se dispone de informacion publica sobre la longitud de contexto, la composicion exacta del dataset ni los resultados de benchmarks. La ficha se elabora a partir de los metadatos disponibles en Hugging Face y de las convenciones habituales de los modelos de esta categoria, senalando explicitamente los datos no disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo de tipo transformer para text-generation; no se detalla en la informacion) |
| Parametros totales | 46.280.448 |
| Parametros activos | no aplica (no es MoE segun la informacion disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | luganda (`lug`) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors, flax |

## Arquitectura y entrenamiento

La informacion disponible no detalla la arquitectura interna del modelo. Los metadatos indican que se trata de un modelo de generacion de texto implementado en Flax (JAX) y distribuido en formato safetensors, con 46,28 millones de parametros totales. No se especifica si emplea atencion multi-cabeza estandar, atencion lineal u otra variante, ni el numero de capas o dimensiones ocultas.

El entrenamiento se apoya en dos datasets del propio proyecto: `ai4ug/luganda_pretrain_v4` para la fase de preentrenamiento y `ai4ug/luganda_sft_v4` para el ajuste supervisado de instrucciones (SFT). No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del corpus, la posible aplicacion de RLHF o DPO, ni sobre innovaciones tecnicas como decodificacion especulativa. El sufijo `-it` en el nombre confirma el ajuste para instrucciones.

## Capacidades

- Generacion de texto en luganda, orientada a conversacion multi-turno.
- Ajuste para instrucciones (instruction tuning), lo que permite seguir comandos en lenguaje natural.
- Capacidad de respuesta conversacional segun su denominacion `chat`.
- Soporte de tool calling / function calling: no disponible en la informacion.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion.
- Capacidades multilingues: limitadas al luganda segun el campo de idiomas; no se documenta soporte de otros idiomas.
- Capacidades especiales (modo thinking, vision, audio): no disponible en la informacion.

## Casos de uso

- Asistentes conversacionales en luganda: el modelo puede gestionar dialogos de atencion al cliente o asistencia general en luganda, aprovechando su ajuste SFT para responder a instrucciones en esa lengua.
- Traduccion asistida luganda-ingles: combinado con un modelo mayor o un pipeline de traduccion, puede servir como componente de generacion en el lado luganda, aunque no se documenta capacidad de traduccion directa.
- Generacion de contenido educativo: produccion de material didactico, resumenes o explicaciones en luganda para plataformas de aprendizaje locales.
- Preservacion y difusion linguistica: generacion de textos, cuentos o contenido divulgativo que contribuyan a la presencia digital del luganda.
- Despliegue en entornos con recursos limitados: con 46 millones de parametros, puede ejecutarse en CPU o GPU de gama baja, lo que lo hace adecuado para aplicaciones locales en Uganda y regiones con infraestructura limitada.
- Prototipado de aplicaciones NLP para lenguas de bajos recursos: sirve como base para experimentacion e investigacion en procesamiento del luganda, dado su licencia permisiva Apache 2.0.
- Moderacion o clasificacion de texto en luganda: con ajuste adicional, podria adaptarse a tareas de filtrado o analisis de contenido en esa lengua.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: con 46,28 millones de parametros, el modelo ocupa aproximadamente 185 MB en precision FP32 (4 bytes por parametro) y unos 92 MB en FP16. La cuantizacion a 8 bits lo situaria en torno a 46 MB, aunque no se documentan formatos de cuantizacion soportados.
- GPU recomendadas: cualquier GPU consumer moderna es suficiente; el modelo cabe holgadamente en tarjetas como RTX 3060, RTX 4060 o superiores. Tambien puede ejecutarse en CPU.
- Cabe en consumer GPU: si, en practicamente cualquier GPU consumer e incluso en dispositivos con poca memoria.
- Opciones de despliegue: al estar implementado en Flax/JAX, el despliegue natural es mediante el ecosistema JAX/Flax. No se documenta soporte para vLLM, llama.cpp, Ollama o TGI, que habitualmente requieren formatos GGUF o pesos PyTorch. La conversion a otros formatos no esta confirmada en la informacion disponible.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

No se dispone de informacion sobre modelos directamente comparables en la misma categoria (modelos especializados en luganda de tamano similar). Se indica "no disponible" para evitar comparaciones sin datos verificables.

| Modelo | Parametros | Contexto | Licencia | Idiomas | Disponibilidad |
|---|---|---|---|---|---|
| Pearl-chat-v4-it | 46,28 M | no disponible | Apache 2.0 | luganda | gated en HF |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Acceso restringido: el repositorio es gated y requiere aceptar condiciones en Hugging Face antes de descargar los pesos.
- Sesgos conocidos: no documentados, pero al entrenarse sobre un corpus limitado de luganda puede reflejar sesgos presentes en los datos.
- Riesgo de alucinacion: inherente a los modelos generativos de este tamano; la escasez de datos de entrenamiento en lenguas de bajos recursos puede incrementar la probabilidad de respuestas incorrectas o inventadas.
- Limitaciones de contexto e idioma: no se documenta la longitud de contexto; el soporte se limita al luganda, sin evidencia de capacidades multilingues.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero el acceso gated puede imponer condiciones adicionales que deben revisarse antes de su uso en produccion.
- Caveat para produccion: con 46 millones de parametros, la calidad de generacion sera limitada en comparacion con modelos de mayor tamano; se recomienda evaluar exhaustivamente antes de desplegarlo en aplicaciones criticas.
- Falta de benchmarks: no hay evidencia publica de rendimiento que permita validar su calidad frente a alternativas.

## Enlaces

- Hugging Face: https://huggingface.co/ai4ug/pearl-chat-v4-it
- Dataset de preentrenamiento: https://huggingface.co/datasets/ai4ug/luganda_pretrain_v4
- Dataset de ajuste supervisado: https://huggingface.co/datasets/ai4ug/luganda_sft_v4
