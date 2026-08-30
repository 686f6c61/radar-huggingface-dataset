# lxyuan/FunctionGemma-270M-banking77-router

## Resumen

FunctionGemma-270M-banking77-router es un ajuste fino completo del modelo `google/functiongemma-270m-it`, desarrollado por el usuario lxyuan como experimento de aprendizaje. Convierte mensajes de atención al cliente bancaria en inglés en llamadas estructuradas a una de diez herramientas de soporte, sin añadir una cabeza de clasificación tradicional. En lugar de predecir una etiqueta, el modelo genera directamente la sintaxis nativa de function calling de FunctionGemma, lo que permite integrarlo en pipelines de agentes que ya usan ese formato.

El modelo base, FunctionGemma 270M, es una versión especializada de Gemma 3 270M de Google, entrenada específicamente para traducir lenguaje natural en acciones de API. Este ajuste fino particular se limita al subconjunto de diez intenciones del dataset BANKING77, alcanzando una precisión del 97 % en la selección exacta de la primera herramienta sobre una partición de test no vista. Con 268 millones de parámetros, es un modelo ligero pensado para ejecutarse en entornos con recursos limitados, aunque su alcance es deliberadamente reducido y no está destinado a producción bancaria real.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder (Gemma 3 270M base) |
| Parametros totales | 268.098.176 |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (pesos en safetensors, presumiblemente FP32) |
| Idiomas soportados | Ingles |
| Licencia | Gemma |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de `google/functiongemma-270m-it`, que a su vez se basa en Gemma 3 270M y ha sido preentrenado para generar llamadas a funciones con un esquema de tokens dedicado. El ajuste fino realizado por lxyuan toma el dataset BANKING77, que originalmente contiene pares de texto y etiqueta de intención, y transforma cada etiqueta en una llamada a herramienta estructurada. Por ejemplo, la etiqueta `lost_or_stolen_card` se convierte en una llamada a `handle_lost_or_stolen_card` con el mensaje del cliente como argumento. No se añade ninguna capa de clasificación; el modelo aprende a emitir la secuencia de function calling directamente.

El entrenamiento se realizó con la librería TRL (Transformers Reinforcement Learning), aunque no se especifican hiperparámetros ni el número de épocas. El resultado es un modelo que, dado un mensaje de cliente, genera una única llamada a herramienta entre las diez definidas en el esquema. El autor lo describe explícitamente como un experimento de aprendizaje, no como un sistema bancario de producción.

## Capacidades

- Generacion de llamadas a funciones (function calling) para diez intenciones bancarias concretas: llegada de tarjeta, tarjeta no funciona, retirada de efectivo no reconocida, cambio de PIN, tarjeta comprometida, tarjeta perdida o robada, pago pendiente, cierre de cuenta, transferencia no recibida y verificacion de identidad.
- Clasificacion de intenciones mediante generacion de tool calls, en lugar de una cabeza de clasificacion lineal.
- Soporte nativo del formato de function calling de FunctionGemma, con tokens especiales `<start_function_call>` y `<end_function_call>`.
- Capacidad multilingue: solo ingles.
- No es un modelo de dialogo general; su unica funcion es enrutar mensajes a una herramienta.

## Casos de uso

- Enrutamiento de mensajes en atencion al cliente bancaria: dado un mensaje como "My card was stolen last night", el modelo selecciona la herramienta `handle_lost_or_stolen_card`, permitiendo derivar la peticion al flujo de soporte adecuado.
- Triaje automatico de tickets de soporte: integrar el modelo en un sistema de tickets para clasificar incidencias bancarias y asignarlas al equipo correspondiente sin intervencion humana.
- Asistentes virtuales bancarios: usar el modelo como modulo de intencion dentro de un chatbot que luego ejecuta la accion mediante un handler permitido.
- Preprocesamiento de mensajes para agentes de ejecucion: el modelo genera la llamada estructurada que un agente posterior puede validar y ejecutar, reduciendo la carga de parsing.
- Filtrado de intenciones en sistemas de mensajeria: detectar automaticamente si un mensaje corresponde a una de las diez categorias soportadas y actuar en consecuencia.
- Pruebas de concepto de agentes locales con function calling: dado su tamano reducido, puede desplegarse en entornos con poca memoria para experimentar con flujos de tool use.

## Benchmarks y rendimiento

El autor declara un unico resultado en la model card, correspondiente a una particion de test no vista del dataset BANKING77 con diez intenciones:

| Tarea | Dataset | Metrica | Valor |
|---|---|---|---|
| Banking tool routing | BANKING77 ten-intent held-out slice | Exact first-tool accuracy | 0.97 |

No se han publicado comparaciones con otros modelos ni resultados adicionales en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: con pesos en FP32, el modelo ocupa aproximadamente 1,1 GB, por lo que cabe en GPUs con 2 GB o mas. Con cuantizacion a 8 bits o 4 bits, el uso de memoria se reduce a unos 300-500 MB.
- GPU recomendadas: cualquier GPU consumer moderna (NVIDIA GTX 1060 6GB, RTX 2060, RTX 3060, etc.) es suficiente. Tambien puede ejecutarse en CPU con razonable velocidad para inferencia de un solo mensaje.
- Opciones de despliegue: transformers (con `device_map="auto"`), vLLM, TGI (text-generation-inference) y, si se generan pesos GGUF, llama.cpp u Ollama. No se proporcionan pesos GGUF para este ajuste fino concreto.
- Latencia y throughput: al ser un modelo de 268M parametros, la generacion de una llamada a funcion (maximo 64 tokens) es practicamente instantanea en GPU y de pocos cientos de milisegundos en CPU.

## Comparativa con modelos similares

No se dispone de comparativas publicadas con otros modelos de la misma categoria. El modelo base `google/functiongemma-270m-it` es el punto de partida natural, pero este ajuste fino esta especializado en un dominio muy concreto (diez intenciones bancarias) y no es directamente comparable en tareas generales de function calling. Tampoco hay datos de otros clasificadores de intencion entrenados sobre BANKING77 con los que contrastar.

## Limitaciones y advertencias

- Solo soporta ingles; mensajes en otros idiomas pueden producir llamadas incorrectas o fallos de generacion.
- Limitado a diez intenciones especificas de BANKING77; no cubre otras peticiones bancarias comunes.
- El modelo selecciona la herramienta pero no la ejecuta; es necesario un handler externo que valide argumentos y ejecute la accion.
- Es un experimento de aprendizaje, no un sistema de produccion bancaria. No debe usarse en entornos reales sin una validacion exhaustiva.
- La licencia Gemma impone restricciones de uso comercial; es necesario revisar los terminos completos antes de cualquier despliegue.
- Riesgo de alucinacion: si el mensaje no corresponde a ninguna de las diez intenciones, el modelo puede generar una llamada incorrecta o incompleta.
- El dataset BANKING77 puede contener sesgos en la representacion de ciertos tipos de clientes o situaciones.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/lxyuan/FunctionGemma-270M-banking77-router
- Modelo base: https://huggingface.co/google/functiongemma-270m-it
- Documentacion de FunctionGemma (Google AI for Developers): https://ai.google.dev/gemma/docs/functiongemma
- Model card de FunctionGemma: https://ai.google.dev/gemma/docs/functiongemma/model_card
- Repositorio de Gemma (Google DeepMind): https://github.com/google-deepmind/gemma
