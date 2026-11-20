# openamer-max/openamer-max-watch

## Resumen

OpenAmer-Watch es un ajuste fino mediante LoRA del modelo Qwen3-0.6B, desarrollado por el usuario openamer-max y publicado bajo licencia Apache-2.0. Se trata de la variante mas pequena de la familia OpenAmer, disenada para ejecutarse de forma local y offline en dispositivos de bajos recursos, sin necesidad de cuenta ni servicios en la nube. El modelo base cuenta con 596 millones de parametros y esta especializado en responder preguntas sobre el propio producto OpenAmer (instalacion, plataformas, costes, privacidad y licencia) en aleman y bosnio, con soporte adicional de croata, serbio e ingles.

La propuesta tecnica del autor es inusual y honesta: el modelo se entreno con un enfoque iterativo de "trabajo de datos guiado por errores" a lo largo de 15 etapas, generando ejemplos que cubren la habilidad subyacente de cada fallo (mantener el idioma, distinguir polaridad, seguir el formato) en lugar de memorizar las preguntas de evaluacion. El resultado es un modelo que alcanza el 100% en un conjunto congelado de 45 preguntas de producto, pero que rinde ligeramente por debajo de la base sin entrenar en tareas generales (12/20 frente a 13/20), un trade-off que el propio autor documenta de forma explicita.

Es relevante ahora porque ejemplifica una tendencia creciente hacia modelos ultra pequenos, especializados y "local-first", empaquetados en GGUF Q8_0 (639 MB) y distribuidos via Ollama, que priorizan el despliegue en dispositivos de consumo y la privacidad frente a la capacidad generalista.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (base Qwen3-0.6B) con adaptador LoRA |
| Parametros totales | 596.049.920 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 40.960 tokens (maximo de entrenamiento); mayor acierto medido: 39.322 tokens (96%) |
| Tipos de cuantizacion | Q8_0 (unico archivo publicado); no hay Q6 en esta etapa |
| Idiomas soportados | aleman (de), bosnio (bs), croata (hr), serbio (sr), ingles (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (openamer-max-watch-q8.gguf, 639 MB); adaptador LoRA r=64 en repo separado |

## Arquitectura y entrenamiento

El modelo parte de Qwen3-0.6B, un transformer decoder-only de 596 millones de parametros, sobre el que se aplica un ajuste fino con LoRA de rango 128 (161 millones de parametros entrenables). El entrenamiento se realizo en 15 etapas, con un reinicio a mitad del proceso que requirio r=128 y tres epocas para consolidar la capacidad objetivo. La estrategia de datos fue iterativa y guiada por errores: por cada caso fallido se generaron ejemplos que cubren la habilidad subyacente (mantener el idioma, distinguir polaridad, cumplir el formato), no la pregunta de evaluacion concreta.

El autor documenta de forma transparente el metodo de medicion de contexto: se coloca un hecho a 50% de profundidad, se reserva margen en la ventana y se usa temperatura 0, alcanzando un maximo de 39.322 tokens efectivos sobre los 40.960 de entrenamiento. No se mencionan innovaciones arquitectonicas adicionales (no hay decodificacion especulativa, atencion lineal ni modo de razonamiento extendido). El adaptador se publica por separado como LoRA r=64.

## Capacidades

- Generacion de texto conversacional en aleman y bosnio, con tolerancia a texto sin diacriticos.
- Respuesta a preguntas sobre el producto OpenAmer: instalacion, plataformas, costes, privacidad y licencia.
- Seguimiento estricto de formato: respuestas de una sola palabra, solo el numero, etc.
- Reconocimiento de limites: responde con honestidad cuando la respuesta no es conocida.
- Soporte multilingue limitado a de, bs, hr, sr, en.
- No soporta de forma fiable razonamiento multi-paso, matematicas mas alla de numeros pequenos, conocimiento general del mundo ni generacion de textos largos libres.
- No se documenta soporte de tool calling, function calling, agentes ni vision.

## Casos de uso

- Asistente de soporte de producto OpenAmer: el modelo responde preguntas frecuentes sobre instalacion, plataformas, costes y licencia con alta precision (45/45 en el conjunto de evaluacion), lo que lo hace adecuado como primera linea de atencion en una app o web.
- Chatbot local en dispositivos Android: segun el autor, el agente puede ejecutarse en el espacio de usuario Debian del telefono con las mismas herramientas y skills, lo que permite asistencia offline sin enviar datos a la nube.
- Clasificacion y extraccion con formato estricto: su capacidad de responder "solo la numero" o "una palabra" lo hace util para tareas de etiquetado, extraccion de campos y normalizacion de respuestas en pipelines de datos.
- Atencion al cliente en aleman y bosnio: cubre conversaciones multi-turno en ambos idiomas (y croata/serbio), con contexto de hasta 40.960 tokens, suficiente para hilos de soporte tipicos.
- Filtro de privacidad y cumplimiento: al ejecutarse 100% en local, encaja en escenarios donde no se permite enviar consultas a APIs externas (sector publico, sanidad, entornos regulados).
- Prototipado rapido y demos: con 639 MB en Q8_0 y un solo comando de Ollama, permite validar flujos conversacionales en portatiles y equipos sin GPU dedicada.
- Base para ajustes adicionales: al ser Apache-2.0 y publicar el adaptador LoRA por separado, sirve como punto de partida para especializaciones verticales de bajo coste.

## Benchmarks y rendimiento

Datos publicados por el autor en la model card:

| Evaluacion | Esta version (etapa 24) | Version anterior (etapa 9) | Qwen3-0.6B sin entrenar |
|---|---|---|---|
| Preguntas de producto (45 casos congelados) | 45/45 (100,0%) | 37/45 (82,2%) | 23/45 (51,1%) |
| Tareas generales (20 casos frescos, nunca vistos) | 12/20 (60%) | 10/20 (50%) | 13/20 (65%) |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 1 GB para el archivo Q8_0 de 639 MB, mas overhead de contexto. Cabe holgadamente en cualquier GPU de consumo.
- GPU recomendadas: no requiere GPU dedicada; funciona en CPU. Cualquier GPU consumer (GTX 1050 en adelante, RTX 3060/4060, etc.) ofrece margen sobrado.
- Cabe en GPU consumer: si, en todas las gamas actuales, e incluso en moviles de gama media mediante CPU.
- Opciones de despliegue: Ollama (`ollama run amersacirovic/openamer-max-watch`), llama.cpp por ser formato GGUF, y cualquier runtime compatible con GGUF. No se documenta soporte de vLLM ni TGI para este formato.
- Latencia y throughput: no disponibles en la informacion proporcionada.
- Contexto: 40.960 tokens maximos; insuficiente para el agente OpenAmer, que exige al menos 64.000 tokens.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| OpenAmer-Watch | 596 M | 40.960 | Apache-2.0 | GGUF Q8_0 | Especializado en producto OpenAmer; 45/45 en su set; 12/20 en general |
| Qwen3-0.6B (base) | 596 M | no disponible | Apache-2.0 | safetensors, GGUF | Base sin ajustar; 23/45 en producto, 13/20 en general |
| Alternativas de ~0,5B de otros proveedores | no disponible | no disponible | no disponible | no disponible | No se dispone de datos comparables en la informacion proporcionada |

## Limitaciones y advertencias

- Riesgo de sobreajuste al dominio: el 100% en el set de 45 preguntas es un conjunto congelado que actua como proteccion contra regresiones; el rendimiento real en casos frescos es 12/20 (60%), un punto por debajo de la base sin entrenar.
- Razonamiento limitado: no es fiable en razonamiento multi-paso ni en matematicas mas alla de numeros pequenos.
- Conocimiento general escaso: a 0,6B no cabe esperar conocimiento del mundo fiable; puede alucinar en preguntas fuera de su dominio.
- Contexto insuficiente para el agente OpenAmer: el agente exige al menos 64.000 tokens y esta version solo soporta 40.960.
- Cobertura idiomatica limitada: aunque declara hr y sr, el entrenamiento se centra en de y bs; el rendimiento en croata y serbio no esta medido.
- Un solo archivo publicado: solo existe Q8_0; no hay Q4, Q5 ni Q6 de esta etapa, lo que limita el despliegue en entornos con restricciones extremas de memoria.
- Licencia Apache-2.0: permite uso comercial, pero el autor no ofrece garantias ni soporte; conviene validar el comportamiento en el dominio propio antes de produccion.
- Datos de benchmarks estandar ausentes: no hay MMLU, HumanEval ni GSM8K, por lo que la comparacion con otros modelos es limitada.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/openamer-max/openamer-max-watch
- Adaptador LoRA (r=64): https://huggingface.co/openamer-max/openamer-max-watch-adapter
- Repositorio del agente: https://github.com/openamer-max/openamer
- Informe de medicion de contexto: https://github.com/openamer-max/models/blob/main/docs/KONTEXT-MESSUNG.md
- Version Android: https://openamer-max.github.io/android.html
- Enlace de donaciones (PayPal): https://www.paypal.com/qrcodes/managed/bfb5b6b5-c04c-4836-af60-987dff8cff61
