# mattbucci/Flint-AWQ-g32

## Resumen
Flint es un modelo de lenguaje de tipo mixture-of-experts (MoE) desarrollado por Recursive, disenado especificamente para agentes de codigo: exploracion de repositorios, correccion de bugs, implementacion de funcionalidades y escritura de tests. Cuenta con 39.800 millones de parametros totales y aproximadamente 2.500 millones activos por token, lo que lo situa en la categoria "40B-A2.5B" y permite servir una replica en una sola GPU B300 o H200.

La arquitectura es un transformer decoder-only con 49 capas (2 densas y 47 MoE), atencion hibrida con 35 capas de ventana deslizante de 513 tokens y 14 capas de atencion completa, y una configuracion de contexto documentada de 262.144 tokens. El modelo fue entrenado desde cero mediante pretraining, mid-training, SFT y RL, e incluye modo de razonamiento y uso de herramientas multi-turno.

Esta ficha corresponde a la variante cuantizada en 4 bits con AWQ y group size 32 publicada por mattbucci, que reduce el peso del repositorio a 23,9 GB frente a los aproximadamente 80 GB del checkpoint BF16 original. Es relevante para quienes necesitan desplegar un agente de codigo con contexto muy largo en hardware mas modesto, aunque la informacion publicada sobre esta cuantizacion concreta es limitada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only MoE |
| Parametros totales | 39.785.287.456 (39,8B) |
| Parametros activos | Aproximadamente 2,5B por token (cuerpo activo ~2,2B) |
| Longitud de contexto | 262.144 tokens (prompt + salida) |
| Tipos de cuantizacion | AWQ 4-bit con group size 32 (esta variante); BF16 y NVFP4 en el repo original |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (transformers, 4-bit AWQ) |

## Arquitectura y entrenamiento
Flint es un transformer decoder-only con 49 capas: 2 densas seguidas de 47 capas MoE. Cada capa MoE contiene 256 expertos enrutados, de los que se seleccionan 6 por token, mas un experto compartido siempre activo. La atencion combina 35 capas de ventana deslizante (513 tokens: el token actual y 512 precedentes) con 14 capas de atencion completa; las primeras usan RoPE y las segundas no aplican codificacion posicional. Emplea 32 cabezas de query y 4 de key/value con dimension de cabeza 128, normalizacion QK RMSNorm por cabeza y attention sinks aprendidos por cabeza. El vocabulario es de 150.144 tokens y el corte de conocimiento declarado es junio de 2026.

El entrenamiento se realizo desde cero en cuatro fases: pretraining, mid-training, supervised fine-tuning y reinforcement learning, con datos de texto y codigo, seguimiento de instrucciones y tareas agenticas. El SFT incluyo ejemplos orientados a seguridad. La model card no detalla el numero de tokens de entrenamiento ni la composicion exacta del dataset. La variante de este repositorio aplica cuantizacion AWQ de 4 bits con group size 32 sobre el checkpoint original.

## Capacidades
- Generacion de texto y razonamiento con modo de pensamiento (`reasoning_content` en las respuestas).
- Generacion y edicion de codigo en multiples lenguajes, orientada a tareas de ingenieria de software.
- Uso de herramientas y function calling compatible con la API de OpenAI.
- Razonamiento agentico multi-paso: exploracion de codebases, localizacion de bugs, aplicacion de parches y escritura de tests.
- Conversaciones multi-turno con contexto de hasta 262.144 tokens.
- Capacidades multilingues: no documentadas en la informacion disponible.

## Casos de uso
- Reparacion automatica de bugs en repositorios: el modelo puede recibir el arbol del proyecto y los ficheros relevantes dentro de su ventana de 262.144 tokens, localizar el fallo y proponer un parche verificable, como demuestran sus resultados en SWE-bench.
- Agente de terminal para tareas de DevOps: con soporte de tool calling puede ejecutar comandos, inspeccionar salidas y encadenar pasos, adecuado para automatizar tareas de mantenimiento reproducibles (evaluado en Terminal-Bench 2.1).
- Implementacion de funcionalidades a partir de una especificacion: el modo de razonamiento con presupuesto de salida de al menos 32.768 tokens permite planificar cambios multi-fichero antes de escribir codigo.
- Generacion de tests unitarios: el modelo puede analizar el codigo existente y producir suites de pruebas coherentes con las interfaces detectadas.
- Asistente de revision de codigo en CI/CD: integrado via API compatible con OpenAI en un servidor SGLang, puede revisar diffs y senalar regresiones antes del merge.
- Exploracion de codebases desconocidos: con contexto largo puede resumir la estructura de un proyecto, trazar dependencias entre modulos y responder preguntas sobre el diseno.
- Despliegue en hardware limitado: la variante AWQ de 4 bits (23,9 GB) permite servir el modelo en una unica GPU con suficiente VRAM, reduciendo el coste frente al BF16 de ~80 GB.

## Benchmarks y rendimiento

| Benchmark | Resultado |
|---|---|
| Terminal-Bench 2.1 | 54,9% |
| SWE-bench Pro v2 | 89,7% |
| SWE-bench Verified | 74,2% |

Los resultados corresponden al checkpoint evaluado por Recursive con temperatura 1.0, top-p 0.95 y top-k 20; Terminal-Bench usa Terminus 2 y SWE-bench usa mini-swe-agent, con media pass@1 sobre al menos cinco intentos. En Terminal-Bench las soluciones obtenidas mediante recuperacion web se contabilizan como fallos. No se han publicado resultados especificos de esta variante AWQ en la informacion disponible.

## Requisitos de hardware
- VRAM estimada: el checkpoint AWQ 4-bit ocupa 23,9 GB en disco; en inferencia se necesita espacio adicional para cache KV, que con contexto de 262.144 tokens puede ser considerable.
- GPU recomendadas segun la model card original: una B300 o H200 por replica con el kit SGLang; esta variante cuantizada esta pensada para runtimes NVIDIA y Apple Silicon segun el autor.
- GPU de consumo: no confirmado para esta variante; 23,9 GB de pesos exceden los 24 GB de una RTX 4090 una vez anadida la cache KV, por lo que no es viable en consumer de forma holgada.
- Despliegue: SGLang es el runtime de referencia del modelo original; esta variante usa transformers y safetensors y es compatible con endpoints. No se documenta soporte de llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| Flint (esta variante) | 39,8B totales / ~2,5B activos | 262.144 | Apache 2.0 | AWQ 4-bit, orientado a agentes de codigo |
| Checkpoint Flint BF16 | 39,8B totales / ~2,5B activos | 262.144 | Apache 2.0 | Precision completa, ~80 GB |
| Alternativas de la misma categoria | No disponible | No disponible | No disponible | No se dispone de datos verificables de modelos comparables en la informacion proporcionada |

## Limitaciones y advertencias
- El modelo puede generar codigo incorrecto, contenido danino o llamadas a herramientas inadecuadas; la gramatica estructurada de tool calling no impide acciones inseguras.
- Riesgo de alucinacion en tareas de codigo: la model card recomienda probar el codigo generado y revisar cambios consecuentes antes de aplicarlos.
- El razonamiento largo incrementa la latencia y puede agotar el presupuesto de salida antes de completar la respuesta; se recomienda al menos 32.768 tokens en problemas dificiles.
- La ventana de 262.144 tokens es un limite de capacidad, no una garantia de precision uniforme en todas las longitudes.
- Los resultados pueden variar segun la precision del checkpoint y el runtime; hay que evaluar la variante AWQ concreta antes de desplegarla.
- Idiomas soportados no documentados; no se garantiza un rendimiento uniforme fuera del ingles.
- Licencia Apache 2.0 permite uso comercial, pero los terminos de la API alojada son independientes de la licencia de los pesos.
- Esta variante tiene solo 16 descargas y 0 likes en el momento de la consulta, sin evaluaciones independientes publicadas.

## Enlaces
- [Hugging Face: mattbucci/Flint-AWQ-g32](https://huggingface.co/mattbucci/Flint-AWQ-g32)
- [Blog de Recursive sobre Flint](https://www.recursive.com/updates/introducing-recursive-flint)
- [Hugging Face de Recursive](https://huggingface.co/RecursiveSI)
- [Motor local (GitHub)](https://github.com/recursive-oss/rec)
- [Documentacion de Recursive](https://docs.recursive.com/getting-started)
