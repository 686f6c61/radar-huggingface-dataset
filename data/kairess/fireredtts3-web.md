# kairess/fireredtts3-web

## Resumen

FireRedTTS3 Web es una conversión a ONNX del modelo de síntesis de voz FireRedTTS3 (FireRedTeam), empaquetada por el usuario kairess para ejecutarse directamente en el navegador mediante onnxruntime-web y WebGPU. El objetivo no es ofrecer un modelo nuevo, sino una distribución práctica del original que permite clonación de voz y generación de audio sin depender de servidores ni de infraestructura GPU dedicada, ya que la inferencia ocurre en el cliente.

La arquitectura subyacente combina un backbone Qwen3 de 1.700 millones de parámetros con una cabeza de flujo DiT (Diffusion Transformer) y un códec de audio RedAE compuesto por encoder y decoder. La conversión aplica cuantización agresiva (int8 en la mayoría de grafos, fp16 en el encoder y fp32 en el extractor de embeddings de hablante CAM++) para mantener el tamaño del repositorio en aproximadamente 3 GB, con la particularidad de que los grafos int8 se expanden a fp32 en tiempo de carga.

El modelo está etiquetado únicamente para coreano y su relevancia actual radica en que demuestra un patrón de despliegue de TTS con clonación de voz totalmente local en el navegador. La licencia Apache-2.0 del modelo original se mantiene, lo que facilita su reutilización, aunque la información publicada por el autor es muy escasa y no incluye detalles sobre el entrenamiento ni métricas de calidad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Backbone Qwen3 1.7B + cabeza de flujo DiT + codec de audio RedAE (encoder/decoder) + CAM++ para embeddings de hablante |
| Parametros totales | No disponible (el backbone es de 1.700 millones; el total del sistema no se especifica) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | int8 (backbone, flow head, decoder, embeddings, prompt encoder), fp16 (encoder RedAE), fp32 (CAM++) |
| Idiomas soportados | Coreano (ko) |
| Licencia | Apache-2.0 |
| Formato de pesos | ONNX (con ficheros auxiliares `.data`, `.bin` y `.f32`) |

## Arquitectura y entrenamiento

La información disponible no describe el proceso de entrenamiento del modelo original FireRedTTS3: no se indican el número de tokens, la composición del dataset, ni si se aplicaron técnicas de alineamiento como RLHF o DPO. Lo que sí se detalla es la estructura de inferencia empaquetada en esta conversión. El sistema se divide en varios grafos ONNX especializados: `backbone_q8.onnx` ejecuta el backbone Qwen3 de 1.7B con caché KV de un solo paso, `flow_step_n10_s8.onnx` contiene la cabeza de flujo DiT con 10 pasos y classifier-free guidance junto con el PatchEncoder, y `decoder_s8.onnx` implementa el decoder RedAE que transforma latentes en tramas de audio.

Para el registro de voces (voice cloning) se incluyen tres piezas adicionales: `encoder_s16.onnx` (encoder RedAE en fp16), `prompt_b8.onnx` (PatchEncoder de prompt y proyección de hablante, cuantizado en bloques de 32) y `campp.onnx` (extractor de embeddings de hablante CAM++ en fp32). Los embeddings de texto se almacenan en `embed_q8.bin` con una escala por fila en `embed_scale.f32`. Una innovación técnica relevante de este paquete es la estrategia de cuantización "guardar pequeño, computar en fp32": los grafos int8 requieren activar la opción de sesión `session.disable_quant_qdq = "1"` para que se desplieguen a fp32 al cargar, lo que reduce el peso en disco a costa de memoria en tiempo de ejecución.

## Capacidades

- Síntesis de voz (text-to-speech) a partir de texto en coreano.
- Clonación de voz mediante registro de una muestra de referencia, usando el encoder RedAE, el prompt encoder y el extractor CAM++.
- Ejecución local en el navegador con WebGPU a través de onnxruntime-web, sin backend remoto.
- Generación de audio por difusión en 10 pasos con classifier-free guidance.
- Inferencia con caché KV paso a paso en el backbone, adecuada para decodificación incremental.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible (el modelo es un sistema TTS, no un LLM de propósito general).
- Capacidades multilingües: limitadas al coreano según la etiqueta de idioma del repositorio.
- Modo thinking, visión o audio de entrada: no disponible.

## Casos de uso

- Lectura de contenido web en coreano: el modelo puede integrarse en una página para leer artículos o textos directamente en el navegador del usuario, sin enviar el texto a un servidor, gracias a la ejecución WebGPU local.
- Clonación de voz para accesibilidad: un usuario puede registrar su propia voz con una muestra corta y generar locuciones personalizadas para lectores de pantalla o interfaces de comunicación aumentativa, manteniendo los datos biométricos en el dispositivo.
- Prototipado de asistentes conversacionales en coreano: útil para validar flujos de voz en aplicaciones web antes de invertir en infraestructura de inferencia en servidor, ya que el coste de despliegue es prácticamente nulo.
- Generación de audiolibros o pódcasts de demostración: permite producir narraciones con una voz concreta registrada previamente, con la ventaja de que el procesamiento ocurre en el cliente y no requiere GPU en la nube.
- Educación y aprendizaje de idiomas: creación de ejercicios de pronunciación o dictado en coreano con distintas voces sintéticas generadas bajo demanda.
- Demostraciones y pruebas de concepto de TTS en el navegador: el repositorio incluye una demo pública (GitHub Pages) que sirve como referencia para evaluar latencia y calidad en hardware de usuario antes de adoptar el modelo original.
- Investigación sobre cuantización de modelos de audio: el patrón de empaquetado int8/fp16/fp32 con expansión en carga es un caso de estudio reproducible para estudiar el equilibrio entre tamaño de descarga y memoria de ejecución.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita. El repositorio ocupa unos 3 GB en disco, pero los grafos int8 se expanden a fp32 al cargar, por lo que el consumo en memoria del navegador y de la GPU será sustancialmente mayor que el tamaño descargado.
- GPU recomendadas: cualquier GPU compatible con WebGPU en el navegador. No se especifican modelos concretos (A100, H100, RTX 4090, etc.) en la información proporcionada.
- Compatibilidad con GPU de consumo: el diseño está orientado a ejecución en el cliente, por lo que se presupone compatibilidad con GPUs de consumo integradas o dedicadas que expongan WebGPU, pero no se detallan modelos ni requisitos mínimos.
- Opciones de despliegue: onnxruntime-web con el proveedor de ejecución WebGPU; también puede ejecutarse con onnxruntime nativo si se reutilizan los grafos ONNX fuera del navegador, aunque no está documentado por el autor.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato / despliegue |
|---|---|---|---|---|---|
| FireRedTTS3 Web (este) | Backbone 1.7B (total no disponible) | No disponible | Coreano | Apache-2.0 | ONNX, onnxruntime-web + WebGPU |
| FireRedTTS3 (original) | No disponible | No disponible | No disponible en la informacion | Apache-2.0 | Pesos originales del repositorio FireRedTeam |
| Otros modelos TTS con clonación en navegador | No disponible | No disponible | No disponible | No disponible | No disponible |

La información proporcionada solo permite comparar este paquete con su modelo base, FireRedTTS3, del que se hereda la arquitectura y la licencia. No se dispone de datos de benchmarks ni de especificaciones de alternativas comparables para establecer una comparación cuantitativa.

## Limitaciones y advertencias

- Idioma restringido: el repositorio declara únicamente coreano, por lo que la calidad en otros idiomas no está garantizada ni documentada.
- Ausencia de benchmarks: no hay métricas objetivas de calidad de audio, inteligibilidad ni similitud de voz clonada, lo que impide evaluar el rendimiento de forma rigurosa.
- Riesgo de uso indebido de la clonación de voz: la capacidad de registrar y replicar voces exige controles de consentimiento y medidas anti-suplantación que el paquete no documenta.
- Sesgos: no se dispone de información sobre la composición del dataset de entrenamiento ni sobre sesgos de género, acento o edad en las voces generadas.
- Alucinación en TTS: como todo sistema de síntesis, puede producir pronunciaciones incorrectas, omisiones o artefactos en textos con números, siglas o nombres propios; no se documenta ninguna mitigación.
- Restricciones de licencia: Apache-2.0 permite uso comercial, pero el autor de la conversión no ofrece garantías sobre el comportamiento de los grafos cuantizados ni sobre la cadena de atribuciones del modelo base.
- Caveat de producción: la expansión de grafos int8 a fp32 en carga (`session.disable_quant_qdq = "1"`) implica un pico de memoria elevado en el navegador y tiempos de inicialización que no se han cuantificado.
- Madurez del repositorio: sin descargas ni likes en el momento de la consulta, creado y actualizado el mismo día, lo que sugiere una validación comunitaria inexistente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/kairess/fireredtts3-web
- Demo: https://kairess.github.io/fireredtts3-web/
- Código de la página: https://github.com/kairess/fireredtts3-web
- Modelo base: https://huggingface.co/FireRedTeam/FireRedTTS3
- Repositorio del modelo original: https://github.com/FireRedTeam/FireRedTTS3
- onnxruntime-web: https://onnxruntime.ai/
