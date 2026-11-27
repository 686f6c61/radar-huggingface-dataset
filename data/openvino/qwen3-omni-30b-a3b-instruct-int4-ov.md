# OpenVINO/Qwen3-Omni-30B-A3B-Instruct-int4-ov

## Resumen

OpenVINO/Qwen3-Omni-30B-A3B-Instruct-int4-ov es la exportación al formato OpenVINO IR del modelo Qwen/Qwen3-Omni-30B-A3B-Instruct, publicada por el equipo de OpenVINO (Intel). Se trata de una conversión con compresión de pesos pensada para ejecutar inferencia optimizada sobre hardware Intel (CPU, GPU y, potencialmente, NPU) mediante el runtime OpenVINO y la librería OpenVINO GenAI. El modelo base es un modelo multimodal "any-to-any" de Qwen que acepta texto, imágenes, audio y vídeo, y puede generar tanto texto como voz.

La arquitectura del modelo original es un Mixture-of-Experts (MoE) con diseño Thinker-Talker: un componente "Thinker" que razona sobre las entradas multimodales y un componente "Talker" que sintetiza la respuesta hablada, junto con un codificador de visión, un codificador de audio, un code predictor y un decodificador código-a-forma de onda. El export incluye todos estos componentes, además del processor, tokenizer y los IRs de tokenización de OpenVINO.

La relevancia de esta ficha radica en que permite desplegar un modelo multimodal de gran tamaño (30B parámetros totales, 3B activos por token) en entornos Intel sin necesidad de GPUs de gran VRAM, gracias a la compresión INT4 del modelo de lenguaje del Thinker (el resto de componentes usa INT8). Es una opción interesante para desarrolladores que quieran integrar entrada/salida de voz e imagen en aplicaciones locales o en el edge con hardware Intel.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE Thinker-Talker (transformer multimodal con codificadores de visión y audio, Talker, code predictor y decodificador código-a-forma de onda) |
| Parametros totales | 30B (según nombre del modelo base) |
| Parametros activos | 3B (según nombre del modelo base, A3B) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | INT4 asimétrico (grupo 128) para el modelo de lenguaje del Thinker; INT8 simétrico per-channel para embeddings de texto, codificador de visión, embeddings posicionales de visión, codificador de audio, Talker, embeddings y proyecciones del Talker, code predictor y decodificador código-a-forma de onda |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | OpenVINO IR (.xml + .bin), con tokenizer/detokenizer IR; tamaño combinado de los .bin ~19,48 GiB |

## Arquitectura y entrenamiento

El modelo base Qwen3-Omni-30B-A3B-Instruct emplea una arquitectura Mixture-of-Experts con diseño Thinker-Talker. El "Thinker" es el componente de razonamiento multimodal que procesa texto, imágenes, audio y vídeo; el "Talker" genera la respuesta hablada, apoyándose en un code predictor y un decodificador código-a-forma de onda. El export de OpenVINO incluye el Thinker, los codificadores de visión y audio, el Talker, el code predictor y el decodificador, además del processor, tokenizer y los IRs de tokenización. La compresión INT4 se aplica únicamente a los pesos del modelo de lenguaje del Thinker; el resto de componentes se comprimen a INT8 simétrico por canal. Las activaciones no se cuantizan a INT4.

No se dispone en la información proporcionada de detalles sobre el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF/DPO en el modelo original. El export se realizó con OpenVINO 2026.5.0, Optimum Intel 2.3.0.dev0, NNCF 3.5.0.dev0, Transformers 5.15.1, PyTorch 2.14.0+cpu y OpenVINO Tokenizers 2026.5.0. La compresión de pesos puede afectar a la calidad de salida respecto al modelo original, según advierte la propia model card.

## Capacidades

- Generación de texto y razonamiento multimodal a partir de entradas de texto, imagen, audio y vídeo.
- Reconocimiento automático de voz (ASR): acepta audio de entrada a 16 kHz mono.
- Generación de voz (text-to-audio): produce formas de onda de 24 kHz mono, con selección de hablante (por ejemplo, "Ethan" en los ejemplos de la model card).
- Procesamiento de imagen: codificador de visión integrado para tareas image-text-to-text.
- Pipeline "any-to-any": combinación de entradas multimodales con salidas de texto y/o voz.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible en la información proporcionada.
- Modo "thinking": no disponible en la información proporcionada.

## Casos de uso

- Asistentes de voz locales: el modelo puede recibir audio de entrada (16 kHz) y generar respuesta hablada (24 kHz) en un mismo pipeline, lo que permite construir asistentes conversacionales que funcionan sobre CPU o GPU Intel sin depender de servicios en la nube.
- Descripción de imágenes accesible: con el codificador de visión integrado, se puede usar para generar descripciones textuales o habladas de imágenes, útil en aplicaciones de accesibilidad o catalogación automática de contenido visual.
- Transcripción y respuesta sobre audio: el modelo combina ASR y generación de texto, de modo que puede transcribir una grabación y responder preguntas sobre su contenido en una sola llamada.
- Análisis conjunto de imagen y audio: el pipeline acepta simultáneamente imágenes y audio, lo que habilita casos como describir lo que se ve y se oye en un vídeo o en una reunión grabada.
- Despliegue en PCs con IA Intel: al estar exportado a OpenVINO IR con compresión INT4/INT8, es adecuado para ejecutar inferencia en equipos con CPU o GPU Intel, reduciendo la necesidad de GPUs dedicadas de gran VRAM.
- Prototipado de aplicaciones any-to-any: la API OmniPipeline de OpenVINO GenAI permite integrar entrada multimodal y salida de texto/voz en prototipos y demos, aunque se advierte que es una API en preview y puede cambiar.
- Síntesis de voz en aplicaciones de accesibilidad: la generación de voz a 24 kHz con selección de hablante permite convertir texto en audio para lectores de pantalla o interfaces conversacionales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM/RAM estimada: los archivos .bin combinados ocupan aproximadamente 19,48 GiB, pero esto es el tamaño de pesos almacenados, no el requisito de memoria de inferencia. La compilación, las activaciones, la caché KV y el procesamiento de medios requieren memoria adicional.
- GPU recomendadas: no se especifican modelos concretos en la información proporcionada. La model card indica que la ejecución en GPU Intel requiere suficiente memoria de dispositivo y que la generación de voz usa FP32 en GPU, seleccionado automáticamente por el pipeline de GenAI.
- Compatibilidad con GPU de consumo: no disponible. No se confirma compatibilidad con GPUs de consumo concretas.
- Opciones de despliegue: OpenVINO GenAI (OmniPipeline) y Optimum Intel; se requieren builds recientes con soporte para Qwen3-Omni (wheels nightly de OpenVINO y rama main de Optimum Intel). Los ejemplos de la model card usan CPU.
- NPU: la compatibilidad con NPU no está establecida para este export.
- Latencia y throughput: no disponibles. La model card indica que el rendimiento por dispositivo no ha sido verificado para estos artefactos.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Modalidades | Licencia | Formato |
|---|---|---|---|---|---|
| OpenVINO/Qwen3-Omni-30B-A3B-Instruct-int4-ov | 30B totales, 3B activos | no disponible | texto, imagen, audio, vídeo → texto y voz | Apache 2.0 | OpenVINO IR (INT4/INT8) |
| Qwen/Qwen3-Omni-30B-A3B-Instruct | 30B totales, 3B activos | no disponible | texto, imagen, audio, vídeo → texto y voz | Apache 2.0 | safetensors (no confirmado en la información) |
| Otros modelos any-to-any comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- La compresión de pesos puede degradar la calidad de salida respecto al modelo original; la model card lo advierte explícitamente.
- El INT4 se aplica solo a los pesos del modelo de lenguaje del Thinker; el resto de componentes usa INT8. Las activaciones no se cuantizan a INT4.
- El tamaño de los pesos (~19,48 GiB) no equivale al requisito de memoria de inferencia; hay que prever memoria adicional para compilación, activaciones, caché KV y procesamiento de medios.
- La API OmniPipeline y tipos relacionados son APIs en preview y pueden cambiar.
- Se requieren versiones recientes de OpenVINO GenAI, OpenVINO y OpenVINO Tokenizers; instalaciones estables antiguas pueden no incluir estas APIs.
- La compatibilidad con NPU no está establecida para este export.
- Las versiones mínimas de runtime, la calidad de generación y el rendimiento por dispositivo no han sido verificados para estos artefactos.
- No se dispone de información sobre sesgos, riesgo de alucinación, limitaciones de contexto o idioma en la información proporcionada.
- Licencia Apache 2.0: permite uso comercial, pero conviene revisar los términos del modelo base y las dependencias.
- El audio de entrada debe convertirse a mono a 16 kHz; la salida de voz es mono a 24 kHz.

## Enlaces

- Hugging Face: https://huggingface.co/OpenVINO/Qwen3-Omni-30B-A3B-Instruct-int4-ov
- Modelo base: https://huggingface.co/Qwen/Qwen3-Omni-30B-A3B-Instruct
- Documentación de Qwen3-Omni: https://github.com/QwenLM/Qwen3-Omni
- Documentación de OpenVINO: https://docs.openvino.ai/
- Repositorio de OpenVINO: https://github.com/openvinotoolkit/openvino
- Intel Distribution of OpenVINO Toolkit: https://www.intel.com/content/www/us/en/developer/tools/openvino-toolkit/overview.html
- Instalación de OpenVINO: https://docs.openvino.ai/install
- Optimum Intel: https://github.com/huggingface/optimum-intel
- NNCF: https://github.com/openvinotoolkit/nncf
- Formato OpenVINO IR: https://docs.openvino.ai/2026/documentation/openvino-ir-format.html
- Reglas de compatibilidad de dependencias de OpenVINO GenAI: https://openvinotoolkit.github.io/openvino.genai/docs/getting-started/installation/#openvino-genai-dependencies
