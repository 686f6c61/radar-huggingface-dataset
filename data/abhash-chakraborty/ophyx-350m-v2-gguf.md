# abhash-chakraborty/ophyx-350m-v2-gguf

## Resumen

Ophyx 350M v2 GGUF es la version cuantizada en formato GGUF del modelo Ophyx 350M v2, un modelo de lenguaje de 349,2 millones de parametros especializado en generacion de codigo Python, desarrollado por abhash-chakraborty y entrenado desde cero con recursos de computo gratuitos. Esta publicacion concreta la realiza el mismo autor y su funcion es facilitar la ejecucion del modelo en llama.cpp y en cualquier runtime compatible con GGUF, sin necesidad de usar PyTorch ni de disponer de GPU dedicada.

El modelo resuelve un nicho muy concreto: la generacion de funciones y fragmentos de codigo Python en entornos con recursos muy limitados, como portatiles modestos, Raspberry Pi o contenedores sin acelerador. Con 350M de parametros y pesos que van desde 372 MB (q8_0) hasta 1,4 GB (f32), es viable en CPU y en GPUs de gama baja con poca VRAM.

La relevancia actual del artefacto esta en su proceso de validacion: el autor documenta la conversion con llama.cpp b6800 y verifica cada fichero contra el modelo original de transformers, comprobando base RoPE de 100.000, tokens identicos en siete fragmentos de prueba y la misma respuesta con decodificacion greedy, con una diferencia maxima de log-probabilidad de 0,007 en f32, 0,013 en f16 y 0,163 en q8_0 sobre 66 tokens. La licencia Apache-2.0 permite uso comercial sin restricciones adicionales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (detalles de capas y dimensiones no disponibles) |
| Parametros totales | 349.237.760 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (base RoPE de 100.000 documentada) |
| Tipos de cuantizacion | f32, f16, q8_0 (publicados); otras cuantizaciones GGUF no disponibles |
| Idiomas soportados | ingles (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (convertido con llama.cpp b6800); modelo base en safetensors |
| Tamano del repositorio | 2,5 GB |
| Especializacion | generacion de codigo Python |
| Tokenizador | sin token BOS; el prompt se envia tal cual |

## Arquitectura y entrenamiento

El modelo base es un transformer decoder-only de 349,2 millones de parametros entrenado desde cero por el autor, segun la model card, con recursos de computo gratuitos. No se detalla en la informacion disponible el numero de capas, la dimension oculta, el numero de cabezas de atencion ni la composicion exacta del corpus de entrenamiento. La unica referencia arquitectonica concreta es el uso de una base RoPE de 100.000, dato que el autor emplea como criterio de verificacion durante la conversion a GGUF.

El proceso de conversion a GGUF se realizo con llama.cpp b6800 y se valido de forma explicita contra el modelo original en transformers: se comprobo que los tokens generados coinciden en siete fragmentos de prueba y que la respuesta greedy es la misma, midiendo la mayor diferencia de log-probabilidad por token sobre una secuencia de 66 tokens (0,007 en f32, 0,013 en f16 y 0,163 en q8_0). El repositorio incluye un fichero `check.json` con los detalles de esa verificacion. No se documenta en la informacion disponible si hubo RLHF, DPO, SFT u otras etapas de alineamiento, ni innovaciones como decodificacion especulativa o atencion lineal.

## Capacidades

- Generacion de codigo Python: el modelo esta entrenado especificamente para completar funciones y fragmentos de codigo, con un formato de prompt basado en etiquetas `<|user|>`, `<|python|>` y `<|end|>`.
- Generacion de texto condicionada por instrucciones breves en ingles (pipeline text-generation).
- Completado de funciones a partir de una descripcion en lenguaje natural, como el ejemplo de la model card (`is_palindrome`).
- Ejecucion en CPU y en entornos sin GPU gracias al formato GGUF y a los tamanos reducidos de los ficheros.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: limitadas al ingles como idioma declarado.
- Capacidades especiales (vision, audio, modo thinking): no disponibles.
- Compatibilidad con endpoints: la etiqueta `endpoints_compatible` sugiere integracion con infraestructura de inferencia tipo Hugging Face Endpoints, aunque no se detalla en la model card.

## Casos de uso

- Autocompletado de codigo Python en el editor: el modelo puede completar funciones a partir de una firma y un docstring breve, con una latencia muy baja al ejecutarse en CPU con el fichero q8_0 de 372 MB, lo que permite integrarlo en plugins de editores sin GPU.
- Asistente de programacion en dispositivos de bajos recursos: al caber en 372 MB en q8_0, se puede desplegar en Raspberry Pi, portatiles sin GPU dedicada o contenedores con poca memoria para ofrecer sugerencias de codigo offline.
- Generacion de tests unitarios sencillos: dado el codigo de una funcion, el modelo puede producir casos de prueba basicos en Python, util en pipelines de CI donde no se quiere depender de APIs externas.
- Prototipado rapido de scripts: para tareas de automatizacion o scripting puntual, el modelo genera fragmentos de codigo que el desarrollador revisa y ajusta, con coste cero de inferencia en la nube.
- Educacion y ensenanza de Python: el modelo puede servir como ejemplo didactico de generacion de codigo y como banco de pruebas para estudiar el comportamiento de modelos pequenos entrenados desde cero.
- Evaluacion de pipelines de cuantizacion: el repositorio incluye la verificacion de f32, f16 y q8_0 contra el modelo original, por lo que es util como caso de estudio reproducible para medir el impacto de la cuantizacion en un modelo pequeno.
- Inferencia embebida en aplicaciones de escritorio: mediante llama.cpp u Ollama, el modelo se puede empaquetar dentro de una aplicacion local que asista en tareas de codigo sin conexion a internet.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La unica metrica de rendimiento documentada es la fidelidad de la cuantizacion respecto al modelo original:

| Fichero | Tamano | Mayor diferencia de log-probabilidad vs. original |
|---|---|---|
| `ophyx-350m-v2-f32.gguf` | 1,4 GB | 0,007 |
| `ophyx-350m-v2-f16.gguf` | 700 MB | 0,013 |
| `ophyx-350m-v2-q8_0.gguf` | 372 MB | 0,163 |

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 1,5 GB en f32, 0,8 GB en f16 y 0,5 GB en q8_0, incluyendo overhead del runtime.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM; el modelo es funcional en CPU, por lo que GPUs de gama baja como GTX 1650 o integradas son suficientes.
- Cabe en GPU de consumo: si, en practicamente cualquier GPU consumer actual e incluso en muchas integradas, gracias al tamano de 350M de parametros.
- Opciones de despliegue: llama.cpp (version b6800 o superior, usada en la conversion), Ollama y cualquier runtime compatible con GGUF. vLLM y TGI no estan confirmados para este formato en la informacion disponible.
- Latencia y throughput estimados: no disponibles. Por el tamano del modelo, se espera una latencia baja en CPU, pero no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| Ophyx 350M v2 GGUF | 349,2 M | no disponible | en | Apache-2.0 | GGUF |
| Modelos de codigo de ~350M comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de informacion sobre modelos comparables de la misma categoria en la documentacion proporcionada, por lo que no se puede establecer una comparativa con datos verificables de rendimiento, contexto o disponibilidad.

## Limitaciones y advertencias

- Modelo de 350M de parametros: la capacidad de razonamiento y la calidad del codigo generado son limitadas en comparacion con modelos de mayor tamano; se esperan errores en tareas complejas o codigo largo.
- Entrenado desde cero con computo gratuito y sin documentacion publica del corpus: el riesgo de sesgos y de codigo incorrecto o inseguro es elevado y no esta caracterizado.
- Riesgo de alucinacion: al ser un modelo pequeno y especializado, puede generar APIs inexistentes, imports incorrectos o funciones con logica erronea que parezcan plausibles.
- Idioma: solo se declara ingles; las instrucciones en castellano pueden degradar la calidad de la generacion.
- Contexto: la longitud de contexto no esta documentada, lo que dificulta planificar su uso en ficheros largos o conversaciones multi-turno.
- Formato de prompt estricto: requiere las etiquetas `<|user|>`, `<|python|>` y `<|end|>` y no anade token BOS; un uso incorrecto del template degrada la salida.
- Cuantizacion q8_0: la diferencia de log-probabilidad de 0,163 es notablemente mayor que en f32 y f16, por lo que en tareas sensibles conviene usar f16 o f32.
- Licencia Apache-2.0: permite uso comercial, pero el autor no ofrece garantias sobre la calidad ni sobre los derechos del codigo de entrenamiento, que no se documenta.
- Advertencia de produccion: no se han publicado evaluaciones de seguridad, sesgo ni robustez; no se recomienda su uso en produccion sin validacion adicional del codigo generado.

## Enlaces

- Modelo GGUF en HuggingFace: https://huggingface.co/abhash-chakraborty/ophyx-350m-v2-gguf
- Modelo base en HuggingFace: https://huggingface.co/abhash-chakraborty/ophyx-350m-v2
- Fichero de verificacion de la conversion: https://huggingface.co/abhash-chakraborty/ophyx-350m-v2-gguf/blob/main/check.json
- Logo del modelo: https://huggingface.co/abhash-chakraborty/ophyx-350m-v2/resolve/main/logo.png
- llama.cpp (runtime de inferencia): https://github.com/ggml-org/llama.cpp
