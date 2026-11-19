# openjev/openjev-GGUF

## Resumen

OpenJev es un modelo de decisión de 27B parámetros (26.895.998.464 pesos reales) desarrollado por el proyecto openjev y publicado en el repositorio `openjev/openjev-GGUF`. No es un modelo generativo de propósito general: está entrenado específicamente para emitir una decisión de un solo paso entre opciones etiquetadas con letras, un formato pensado para agentes de navegador y de escritorio que necesitan elegir la siguiente acción de una lista cerrada. La ficha que nos ocupa es la versión cuantizada en GGUF del modelo base `openjev/openjev`, generada con llama.cpp para su uso en tarjetas de 24 GB, Macs y CPU.

El modelo es solo texto (sin torre de visión) y declara únicamente inglés como idioma. La relevancia de esta build GGUF es práctica: permite ejecutar un modelo de 27B en hardware de consumo mediante cuantizaciones Q4_K_M, Q5_K_M, Q6_K y Q8_0, con una validación publicada frente a los pesos de 16 bits sobre 1.789 filas de desarrollo. El autor reporta 82,84 de accuracy para Q4_K_M frente a 83,17 del modelo de 16 bits, con una coincidencia del 96,6% en la respuesta emitida.

La licencia es CC BY-NC 4.0, lo que restringe el uso comercial sin licencia aparte. El proyecto se declara independiente y no afiliado a TypeSafe, empresa propietaria del producto Jev.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (transformer, inferido del formato GGUF y del pipeline de llama.cpp; no confirmado en la informacion) |
| Parametros totales | 26.895.998.464 (26,9B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible como spec oficial; el ejemplo de ejecucion usa `-c 16384` |
| Tipos de cuantizacion | Q4_K_M (~4,8 bits), Q5_K_M (~5,7 bits), Q6_K (~6,6 bits), Q8_0 (8,5 bits) |
| Idiomas soportados | en (ingles) |
| Licencia | CC BY-NC 4.0 (pesos); uso comercial previa solicitud a support@loopai.com |
| Formato de pesos | GGUF (generado con llama.cpp build b11147 desde los pesos fusionados de 16 bits, revision 5ec9e5fd) |

## Arquitectura y entrenamiento

No se dispone de detalles sobre la arquitectura interna del modelo base en la informacion proporcionada: la model card de la build GGUF no describe el tipo de transformer, la composicion del dataset ni si hubo RLHF, DPO u otras fases de alineamiento. Lo que si queda claro por el diseno del prompt es que el modelo fue entrenado para una tarea concreta: recibir un estado (state), una pregunta y una lista de opciones etiquetadas con letras ([A], [B], [C]...), y devolver la letra de la mejor opcion. Las preguntas de si/no se etiquetan como `[A] yes` / `[B] no` en esta build.

La innovacion tecnica destacable no esta en la arquitectura sino en el flujo de inferencia: el modelo esta pensado para una pasada unica (one-pass) y para leer la distribucion de probabilidad sobre los tokens de letra en la primera posicion de salida. El helper `openjev-server` explota esto usando `n_probs` sobre `/completion` para obtener probabilidades de todas las opciones, lo que permite un readout calibrado en lugar de una simple generacion de texto. En esta build GGUF el readout se hace a traves de las probabilidades top-64 de llama.cpp en `/completion`, no mediante el helper de vLLM. Existe un parametro `enable_thinking` en la plantilla de chat, que sugiere un modo de razonamiento desactivable, aunque no se detalla su funcionamiento.

## Capacidades

- Toma de decisiones de un solo paso entre opciones etiquetadas con letras, con salida de la letra elegida.
- Readout probabilistico sobre todas las opciones mediante `n_probs` en `/completion`, util para umbrales de confianza y abstención.
- Formato conversacional compatible con la API de chat de llama.cpp (`/v1/chat/completions`).
- Soporte de plantilla de chat con `chat_template_kwargs`, incluido `enable_thinking: false`.
- Orientado a agentes de navegador y escritorio (tipo decision-model para seleccion de acciones).
- Solo texto: no incluye torre de vision.
- Multilingue: no; unicamente ingles declarado.
- Tool calling / function calling: no disponible en la informacion.
- Razonamiento multi-paso autonomo: no descrito; el diseno es de decision en una pasada.

## Casos de uso

- Agentes de navegador para seleccion de accion: dado el estado de la pagina (elementos visibles, campos, botones), el modelo elige entre acciones como `click_place_order`, `click_coupon` o `go_back`. El ejemplo de la model card (checkout con subtotal, envio y boton de pedido) ilustra exactamente este flujo.
- Automatizacion de escritorio: seleccion de la siguiente operacion entre un conjunto cerrado de comandos de UI, con lectura de la letra de salida y ejecucion posterior por el orquestador.
- Enrutado de intenciones en pipelines de agentes: usar el modelo como clasificador de la siguiente accion en un grafo de estados, con `temperature: 0` y `max_tokens: 4` para latencia minima.
- Control de calidad con umbral de confianza: al obtener probabilidades por opcion con `n_probs`, se puede derivar a revision humana cuando la probabilidad maxima no supera un umbral, algo relevante en flujos de compra o formularios.
- Despliegue en estaciones de trabajo con GPU de 24 GB: Q4_K_M (16,5 GB) permite servir el modelo en una RTX 3090 o 4090 dejando margen para contexto, con `llama-server -ngl 999`.
- Ejecucion local en Mac de 32 GB o en CPU: las builds Q4_K_M y Q5_K_M caben en Macs de 32 GB, lo que habilita prototipado de agentes sin infraestructura cloud.
- Evaluacion e investigacion de modelos de decision: el repositorio incluye `validation/` con registros por fila y `MANIFEST.json` con hashes, lo que facilita reproducir la comparacion entre cuantizaciones.

## Benchmarks y rendimiento

Los unicos datos publicados son los de validacion de la cuantizacion frente al modelo de 16 bits, medidos sobre las mismas 1.789 filas de desarrollo y los mismos etiquetados de opciones:

| Build | Accuracy | NLL | Flip | Coincide con la respuesta de 16 bits |
|---|---|---|---|---|
| 16-bit (referencia vLLM, mismas filas) | 83,17 | 0,4195 | 4,3% | — |
| Q8_0 (llama.cpp) | 82,56 | 0,4207 | 4,7% | 98,2% |
| Q4_K_M (llama.cpp) | 82,84 | 0,4239 | 4,4% | 96,6% |

Comparacion pareada sobre las mismas 1.789 filas: Q4_K_M queda a −0,34 puntos (intervalo del 95%: −1,06 a +0,39) y Q8_0 a −0,61 puntos (−1,17 a −0,11). El autor advierte que el intervalo con 1.789 filas es demasiado ancho para certificar la no inferioridad de 0,5 puntos usada para FP8, que requeriria una ejecucion de 10.000 preguntas. No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada segun cuantizacion: Q4_K_M 16,5 GB; Q5_K_M 19,2 GB; Q6_K 22,1 GB; Q8_0 28,6 GB.
- GPU recomendadas: RTX 3090 y RTX 4090 (24 GB) para Q4_K_M; Q5_K_M solo con contexto corto en 24 GB; Q6_K en 32 GB o mas; Q8_0 en 40 GB o mas.
- Consumer GPU: si, Q4_K_M cabe en RTX 3090/4090 de 24 GB y en Macs de 32 GB; Q5_K_M en Macs de 32 GB con contexto limitado.
- Despliegue: llama.cpp (`llama-server`), con backend vLLM y MLX soportados por el helper `openjev-server`; un backend llama.cpp para el helper esta pendiente segun la model card.
- Parametros de servicio sugeridos en el ejemplo: `-ngl 999 -c 16384 -np 2 --port 8080`.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye modelos comparables de la misma categoria (modelos de decision para agentes) ni datos de rendimiento de alternativas.

## Limitaciones y advertencias

- Licencia CC BY-NC 4.0: prohibido el uso comercial sin licencia aparte; hay que contactar con support@loopai.com.
- Solo ingles: no se declara soporte de castellano ni de otros idiomas.
- Solo texto: sin capacidades de vision, lo que limita su uso en agentes que dependan de capturas de pantalla sin un pipeline OCR o de descripcion externo.
- Disenado para decision de una pasada entre opciones con letras; no es un modelo generativo general ni un asistente conversacional abierto.
- Riesgo de alucinacion y de eleccion erronea: la accuracy reportada es del 83,17% en el conjunto de desarrollo, por lo que aproximadamente una de cada seis decisiones es incorrecta en esa distribucion.
- El readout en GGUF usa las probabilidades top-64 de llama.cpp, no el helper de vLLM; puede haber diferencias sutiles frente al entorno de produccion FP8/MLX.
- La validacion con 1.789 filas no permite certificar no inferioridad de 0,5 puntos; se necesita la ejecucion de 10.000 preguntas.
- No se han publicado datos de sesgos, composicion del dataset ni detalles de alineamiento, lo que dificulta evaluar riesgos de produccion.
- El proyecto es independiente y no esta afiliado a TypeSafe; "Jev" es un producto de terceros.

## Enlaces

- Hugging Face (esta build GGUF): https://huggingface.co/openjev/openjev-GGUF
- Modelo base: https://huggingface.co/openjev/openjev
- Helper de servidor: https://github.com/loopai-hq/openjev-server
