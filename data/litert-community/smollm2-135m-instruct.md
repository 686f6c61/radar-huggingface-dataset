# litert-community/SmolLM2-135M-Instruct

## Resumen

SmolLM2-135M-Instruct es un modelo de lenguaje compacto desarrollado originalmente por Hugging Face (HuggingFaceTB) y distribuido en este repositorio por la comunidad `litert-community` como una variante optimizada para su despliegue en dispositivos Android mediante LiteRT-LM, la librería de inferencia on-device de Google AI Edge. Se trata de un transformer decoder-only de 135 millones de parámetros, afinado para instrucciones (instruction-tuned), pensado para ejecutarse íntegramente en el dispositivo sin conexión a la nube.

El modelo resuelve el problema de la inferencia de lenguaje natural en entornos con recursos muy limitados: móviles, tablets y dispositivos embebidos. Su tamaño reducido (el repositorio ocupa aproximadamente 0,1 GB) permite cargarlo en memoria de un teléfono moderno y generar texto en tiempo real, a costa de una capacidad de razonamiento y conocimiento factual mucho menor que la de modelos de mayor escala.

Su relevancia actual radica en el ecosistema LiteRT-LM: es una de las variantes de referencia para probar aplicaciones de chat generativo totalmente locales en Android, con privacidad por diseño y sin coste de API. La ficha se centra en esta variante empaquetada para LiteRT-LM, no en el modelo original de Hugging Face, aunque ambos comparten pesos base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (variante SmolLM2), empaquetada para LiteRT-LM |
| Parametros totales | 135 millones |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada |
| Tipos de cuantizacion | no disponible en la informacion proporcionada (formato LiteRT-LM para Android) |
| Idiomas soportados | no disponible en la informacion proporcionada |
| Licencia | Apache 2.0 |
| Formato de pesos | LiteRT-LM (empaquetado para Android); modelo base en safetensors en el repositorio original |
| Tamano del repositorio | ~0,1 GB |
| Libreria de inferencia | litert-lm |
| Modelo base | HuggingFaceTB/SmolLM2-135M-Instruct |

## Arquitectura y entrenamiento

La informacion proporcionada no detalla la arquitectura interna ni el proceso de entrenamiento de esta variante. Se sabe que deriva de `HuggingFaceTB/SmolLM2-135M-Instruct`, un transformer decoder-only de 135 millones de parametros afinado para seguir instrucciones, y que esta version ha sido convertida y empaquetada por `litert-community` para su ejecucion con LiteRT-LM en Android.

No se dispone en la informacion facilitada de datos sobre el numero de tokens de entrenamiento, la composicion del dataset, el uso de RLHF/DPO ni innovaciones tecnicas concretas (atencion lineal, decodificacion especulativa, etc.). Cualquier afirmacion al respecto requeriria consultar la model card del modelo base original.

## Capacidades

- Generacion de texto conversacional y respuesta a instrucciones (chat), segun la etiqueta `chat` del repositorio.
- Inferencia on-device en Android mediante LiteRT-LM, sin dependencia de servidores externos.
- Integracion con la aplicacion Edge Gallery de Google AI Edge para pruebas y demos.
- Capacidades multilingues: no disponibles en la informacion proporcionada.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades de vision o audio: no disponibles (el modelo es exclusivamente de texto).

## Casos de uso

- Chat local en aplicaciones Android: el modelo puede integrarse mediante LiteRT-LM en una app movil para ofrecer conversacion generativa sin conexion, con la privacidad que implica no enviar datos a la nube.
- Prototipado rapido de asistentes embebidos: gracias a su tamano (~0,1 GB) y a la licencia Apache 2.0, sirve para validar flujos de UI conversacional en dispositivos reales antes de invertir en modelos mayores.
- Demos y pruebas de concepto con Edge Gallery: el modelo es un ejemplo listo para cargar en la app de Google AI Edge, util para evaluar el rendimiento de LiteRT-LM en hardware concreto.
- Autocompletado y sugerencias de texto offline: por su baja latencia potencial en dispositivo, puede emplearse para tareas de generacion corta en editores o formularios sin red.
- Filtrado y clasificacion ligera de texto en el borde: tareas simples de etiquetado o reformulacion que no requieran conocimiento factual profundo.
- Educacion y experimentacion: permite a desarrolladores e investigadores estudiar el comportamiento de un LLM de 135M en entornos moviles, ajustar prompts y medir consumo energetico.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM/RAM estimada: el repositorio ocupa ~0,1 GB, por lo que la huella de memoria del modelo empaquetado es del orden de cientos de megabytes; la cifra exacta de RAM en runtime no esta disponible en la informacion proporcionada.
- GPU recomendadas: no disponible; el objetivo declarado es la ejecucion on-device en Android (CPU/GPU/NPU del telefono segun soporte de LiteRT-LM).
- Compatibilidad con GPU de consumo: no aplica como requisito principal; esta pensado para moviles, no para estaciones de trabajo.
- Opciones de despliegue: LiteRT-LM (Android), app Edge Gallery y muestras de `google-ai-edge/litert-samples`. Otras opciones como vLLM, llama.cpp, Ollama o TGI no estan indicadas en la informacion proporcionada.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Enfoque |
|---|---|---|---|---|
| litert-community/SmolLM2-135M-Instruct | 135M | no disponible | Apache 2.0 | On-device Android (LiteRT-LM) |
| HuggingFaceTB/SmolLM2-135M-Instruct | 135M | no disponible | Apache 2.0 | Modelo base, uso general |
| SmolLM2-360M-Instruct | 360M | no disponible | Apache 2.0 | Mayor capacidad, misma familia |
| Qwen2.5-0.5B-Instruct | 500M | no disponible | Apache 2.0 | Alternativa compacta multilingue |

Los datos de contexto y rendimiento de los modelos comparados no estan disponibles en la informacion proporcionada; la comparacion se limita a parametros, licencia y enfoque de despliegue.

## Limitaciones y advertencias

- Con 135M de parametros, la capacidad de razonamiento, el conocimiento factual y la fidelidad en tareas complejas son muy limitadas; es propenso a errores y alucinaciones.
- No hay informacion sobre sesgos del modelo en la informacion proporcionada; deben evaluarse antes de cualquier uso en produccion.
- Idiomas soportados no confirmados; el rendimiento fuera del ingles puede degradarse notablemente.
- Longitud de contexto no disponible; no debe asumirse una ventana amplia para conversaciones largas.
- Aunque la licencia es Apache 2.0 (permite uso comercial), conviene revisar la licencia y condiciones del modelo base y de LiteRT-LM antes de distribuir una aplicacion.
- El formato de pesos es especifico para LiteRT-LM/Android; no es directamente portable a otros runtimes sin conversion.
- No apto para tareas de alta precision (legal, medico, financiero) sin supervision humana.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/litert-community/SmolLM2-135M-Instruct
- Modelo base: https://huggingface.co/HuggingFaceTB/SmolLM2-135M-Instruct
- LiteRT-LM (GitHub): https://github.com/google-ai-edge/LiteRT-LM
- App Edge Gallery: https://github.com/google-ai-edge/gallery
- Edge Gallery en Google Play: https://play.google.com/store/apps/details?id=com.google.ai.edge.gallery
- Muestras LiteRT: https://github.com/google-ai-edge/litert-samples
