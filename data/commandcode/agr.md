# CommandCode/agr

## Resumen

Agr es un modelo de decisión desarrollado por Command Code y publicado en Hugging Face bajo licencia Apache 2.0. No es un modelo generativo al uso: recibe un estado (en texto o JSON) junto con una o varias preguntas tipadas, y devuelve respuestas también tipadas con una probabilidad asociada a cada opción posible. El objetivo es cubrir decisiones con un conjunto cerrado de respuestas, como enrutar un ticket, elegir una herramienta o aprobar una acción, evitando generar texto libre que después haya que parsear.

El modelo se construye como un ajuste fino (finetune) sobre google/gemma-4-31B-it y se distribuye con el pipeline de text-classification. Todas las preguntas de una misma petición leen el mismo estado, pero ninguna puede atender a las demás: cada pregunta se responde en un único forward pass y de forma independiente. Agr lee la puntuación de cada opción directamente de la capa de salida del propio modelo; su variante ligera, Agr-flash, emplea una pequeña cabeza de scoring entrenada aparte.

Agr obtiene 58,15 en Decision Index 0.2.1, calculado sobre 38 benchmarks contabilizados. El repositorio principal ocupa 61,43 GB en disco y el autor indica que se sirve en GPUs de 96 GB. La familia se completa con CommandCode/agr-flash, de 0,73 GB, pensada para casos con límites de contexto mucho menores y no apta para decisiones de seguridad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer, ajuste fino de google/gemma-4-31B-it; no se detalla mas en la informacion disponible |
| Parametros totales | no disponible (pesos bf16 de 61,43 GB en disco) |
| Parametros activos | no disponible (no se indica que sea un modelo MoE) |
| Longitud de contexto | 16.384 tokens para el estado, 16.384 para la pregunta y 32.768 por peticion |
| Tipos de cuantizacion | no disponible (el autor publica pesos en bf16) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

Agr parte de google/gemma-4-31B-it como modelo base y lo especializa como modelo de decisión. En lugar de generar texto, expone preguntas tipadas (por ejemplo, boolean, choice, score o noul) y devuelve, para cada una, una probabilidad por opción. La innovación técnica central es el mecanismo de lectura de puntuaciones: todas las preguntas comparten el mismo estado de entrada, pero se responden de forma aislada entre sí, sin atención cruzada, y cada respuesta se resuelve en un único forward pass. Agr extrae la puntuación de cada opción de la propia capa de salida del modelo; Agr-flash, en cambio, usa una cabeza de scoring entrenada específicamente.

No se han publicado en la información disponible detalles sobre el volumen de tokens de entrenamiento, la composición del dataset, ni si se aplicaron técnicas de RLHF o DPO. Tampoco se especifican innovaciones adicionales como decodificación especulativa o atención lineal. El autor remite a DESIGN.md, en el repositorio de GitHub, para los detalles del diseño.

## Capacidades

- Clasificación y decisión sobre un estado dado: devuelve probabilidades por opción en lugar de texto generado, lo que evita el parseo posterior.
- Preguntas tipadas: soporta tipos como boolean, choice, score y noul, definidos en la librería agr y en los SDK de TypeSafe.
- Respuesta multi-pregunta en un solo forward pass: varias preguntas sobre el mismo estado se resuelven de forma independiente y simultánea.
- Entrada en texto plano o JSON, con límites de 16.384 tokens para el estado y 16.384 para la pregunta.
- Servidor propio: el comando `agr serve` expone un endpoint `/v1/systemone` compatible con peticiones vía curl, Python y TypeScript.
- SDKs oficiales: TypeSafe Python SDK (typesafe-sdk) y TypeSafe JavaScript SDK (@typesafe-ai/sdk, Node.js 20 o superior).
- Casos de scoring de seguridad y análisis de impacto: los ejemplos del autor incluyen evaluar si una acción podría borrar trabajo ajeno o a quién afectaría un fallo.
- No se documentan capacidades de generación de texto libre, código, matemáticas, visión ni audio.

## Casos de uso

- Enrutado de tickets de soporte: se envía el texto del ticket como estado y una pregunta de tipo choice con los equipos posibles (ingeniería, facturación, etc.); el modelo devuelve la probabilidad de cada equipo y permite derivar el ticket con un umbral de confianza.
- Evaluación de riesgo de comandos en agentes: antes de ejecutar una acción como `git push --force`, se consulta si podría borrar trabajo de otros o a cuántas personas afectaría, usando preguntas boolean y score.
- Puertas de aprobación en pipelines automatizados: se clasifica cada acción propuesta por un agente según su impacto y se aprueba o bloquea en función de las probabilidades devueltas.
- Selección de herramientas en un agente: dado el estado de la conversación, una pregunta de tipo choice con el catálogo de herramientas disponibles permite decidir cuál invocar sin generar texto intermedio.
- Moderación y triaje de contenido: preguntas boolean sobre si un contenido requiere atención inmediata o si incumple una política concreta, con probabilidad asociada para fijar umbrales.
- Análisis de impacto en operaciones sobre repositorios compartidos: estimar cuántas personas se verían afectadas por un fallo antes de aplicar un cambio, tal como ilustra el ejemplo de curl del autor.
- Clasificación por lotes en pipelines de datos: al resolver cada pregunta en un solo forward pass y de forma independiente, encaja en procesos que etiquetan grandes volúmenes de registros con un conjunto fijo de categorías.
- Despliegue local con Agr-flash en entornos con poca VRAM: para tareas de decisión que no sean de seguridad, la variante de 0,73 GB permite servir clasificaciones en hardware limitado.

## Benchmarks y rendimiento

| Benchmark | Resultado | Notas |
|---|---|---|
| Decision Index 0.2.1 | 58,15 | Media de habilidad corregida por azar sobre cinco areas y 38 benchmarks contabilizados; el autor indica que se ejecuto sobre las 150.759 peticiones publicas del kit Decision Index en la revision 87d4650, sin truncar |
| BRIGHT | no disponible | El 3% de las peticiones supera el limite de 32.768 tokens de Agr y se cuentan como incorrectas |
| Comparativa con Jev, Kev y Rune | no disponible | El autor indica que las puntuaciones de estos modelos provienen del tablero publico a fecha de 28 de septiembre de 2026, pero no se incluyen los valores numericos en la informacion disponible |

No se han publicado en la informacion disponible resultados desglosados por benchmark (MMLU, HumanEval, GSM8K u otros) ni las cifras concretas de las areas evaluadas.

## Requisitos de hardware

- Pesos de Agr en bf16: 61,43 GB en disco; el autor indica que el modelo se sirve en GPUs de 96 GB, por lo que no cabe en GPUs de consumo convencionales.
- GPU recomendadas: no se listan modelos concretos; la referencia del autor es hardware de 96 GB de VRAM.
- Agr-flash: 0,73 GB, por lo que cabe sin problemas en GPUs de consumo y en entornos con VRAM reducida.
- Opciones de despliegue: servidor propio mediante `agr serve CommandCode/agr --port 8000`, con endpoint `/v1/systemone`; instalación vía `pip install git+https://github.com/CommandCodeAI/agr`. Soporte de vLLM, llama.cpp, Ollama o TGI: no disponible.
- Requisitos de software: Python 3.11 o superior; la instalación incorpora PyTorch y la versión de Transformers con la que se probó. Los SDK de TypeSafe requieren Node.js 20 o superior en el caso de JavaScript.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Tamano en disco | Limites de tokens (estado / pregunta / peticion) | Licencia | Disponibilidad |
|---|---|---|---|---|
| CommandCode/agr | 61,43 GB | 16.384 / 16.384 / 32.768 | Apache 2.0 | Hugging Face, pesos safetensors, tokenizer y config |
| CommandCode/agr-flash | 0,73 GB | 6.144 / 2.048 / 12.288 | no disponible | Hugging Face; no apto para decisiones de seguridad |
| Jev / Kev / Rune | no disponible | no disponible | no disponible | Referenciados en el tablero publico de Decision Index; sin datos en la informacion disponible |

El autor situa Agr frente a Jev, Kev y Rune en el Decision Index 0.2.1, pero no se facilitan en la informacion disponible los parametros, contextos, licencias ni puntuaciones concretas de esos modelos, por lo que no es posible establecer una comparacion cuantitativa mas alla del 58,15 de Agr.

## Limitaciones y advertencias

- El 3% de las peticiones de BRIGHT supera el limite de 32.768 tokens de Agr y se contabilizan como incorrectas, lo que marca un techo practico para estados muy largos.
- Agr-flash no esta pensado para decisiones de seguridad, segun advierte explicitamente el autor.
- Al derivar de google/gemma-4-31B-it, puede heredar sesgos presentes en el modelo base y en sus datos de entrenamiento; no se documenta ningun proceso de mitigacion.
- Riesgo de alucinacion: aunque el modelo devuelve probabilidades en lugar de texto libre, una probabilidad alta no garantiza que la respuesta sea correcta; en decisiones criticas conviene fijar umbrales y revision humana.
- Idiomas soportados: no disponible. No se puede confirmar el comportamiento fuera del ingles.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero conviene verificar las condiciones aplicables al modelo base google/gemma-4-31B-it, que no se detallan en la informacion disponible.
- El pipeline declarado es text-classification y la etiqueta de inferencia indica `inference: false`, por lo que no esta pensado para la API de inferencia alojada de Hugging Face.
- El uso del servidor no requiere clave de API segun el ejemplo del autor, algo que debe revisarse antes de exponerlo en produccion.
- No se documentan tasas de latencia, throughput ni comportamiento bajo carga, datos necesarios para dimensionar un despliegue real.
- Los resultados de benchmarks del autor se presentan como habilidad corregida por azar multiplicada por 100, no como exactitud o F1 en bruto, por lo que no son directamente comparables con metricas de otros modelos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/CommandCode/agr
- Variante ligera: https://huggingface.co/CommandCode/agr-flash
- Coleccion de modelos Agr en Hugging Face: https://huggingface.co/collections/CommandCode/agr
- Repositorio de codigo: https://github.com/CommandCodeAI/agr
- Documento de diseno: https://github.com/CommandCodeAI/agr/blob/HEAD/DESIGN.md
- Kit publico Decision Index: https://github.com/apolinario/decision-index
- Tablero Decision Index: https://huggingface.co/spaces/multimodalart/jev-decision-index
- SDK de Python (TypeSafe): https://docs.typesafe.ai/sdk/python
- SDK de JavaScript (TypeSafe): https://docs.typesafe.ai/sdk/javascript
