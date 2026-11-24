# mistralai/Ministral-3-3B-Instruct-2512-ONNX

## Resumen

Ministral 3 3B Instruct 2512 ONNX es la versión cuantizada en formato ONNX del modelo Ministral 3 3B Instruct 2512, desarrollado por Mistral AI. Se trata del modelo más pequeño de la familia Ministral 3, un modelo de lenguaje y visión de tipo "tiny" diseñado específicamente para despliegue en el borde (edge), con capacidad de ejecutarse en hardware de consumo. La versión ONNX está pensada para su uso con Transformers.js y ONNX Runtime, lo que permite ejecutar el modelo directamente en el navegador mediante WebGPU.

El modelo combina un componente de lenguaje de 3.4B parámetros con un codificador de visión de 0.4B parámetros, lo que le permite procesar tanto texto como imágenes en tareas de image-text-to-text. Soporta una ventana de contexto de 256k tokens, capacidades multilingües en once idiomas y funciones de agente nativo con function calling y salida JSON. Su licencia Apache 2.0 permite uso comercial y no comercial sin restricciones significativas.

La relevancia actual de esta ficha radica en que ofrece una alternativa open source para despliegue local y en navegador de un modelo multimodal con contexto muy largo, algo poco habitual en modelos de este tamaño. La integración con Transformers.js y ONNX Runtime lo posiciona como una opción práctica para aplicaciones web que necesitan inferencia en el cliente sin depender de servidores externos.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (3.4B LM + 0.4B vision encoder) |
| Parámetros totales | 3.8B (3.4B lenguaje + 0.4B visión) |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | 256k tokens |
| Tipos de cuantización | FP8 y cuantizaciones adicionales (según model card); ONNX cuantizado |
| Idiomas soportados | en, fr, es, de, it, pt, nl, zh, ja, ko, ar |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX (repo de 36.3 GB) |

## Arquitectura y entrenamiento

Ministral 3 3B es un modelo transformer multimodal compuesto por dos bloques principales: un modelo de lenguaje de 3.4B parámetros y un codificador de visión de 0.4B parámetros. La arquitectura sigue el diseño de la familia Mistral 3, orientada a eficiencia en despliegue edge. El modelo base fue post-entrenado para instrucciones (instruct) y posteriormente cuantizado y exportado a ONNX para su uso con ONNX Runtime y Transformers.js.

No se dispone en la información proporcionada de detalles sobre el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO. La model card menciona que el modelo mantiene un fuerte adherence a system prompts y ofrece capacidades agénticas nativas con function calling y salida JSON, lo que sugiere un post-entrenamiento orientado a instrucciones y agentes. La innovación técnica destacable es la optimización para edge: el modelo cabe en 8 GB de VRAM en FP8 y menos con cuantizaciones adicionales, y la versión ONNX permite ejecución en navegador vía WebGPU.

## Capacidades

- Generación de texto y razonamiento en tareas de chat e instrucciones.
- Procesamiento de imágenes: análisis de contenido visual y respuesta basada en imágenes combinadas con texto.
- Capacidades multilingües en once idiomas: inglés, francés, español, alemán, italiano, portugués, neerlandés, chino, japonés, coreano y árabe.
- Soporte de system prompts con alta adherencia.
- Capacidades agénticas: function calling nativo y salida en formato JSON.
- Razonamiento multi-paso y soporte para agentes.
- Optimizado para despliegue edge y ejecución local.
- Ejecución en navegador mediante Transformers.js y WebGPU.

## Casos de uso

- Asistente de atención al cliente en web: el modelo puede gestionar conversaciones multi-turno con contexto largo (256k tokens) y ejecutarse directamente en el navegador del usuario mediante Transformers.js, eliminando la necesidad de infraestructura de servidor y reduciendo la latencia de red.
- Análisis de imágenes en aplicaciones móviles o web: gracias a su codificador de visión de 0.4B, puede procesar capturas de pantalla, fotografías o documentos escaneados y generar descripciones o respuestas contextuales, todo ello en el dispositivo.
- Automatización de tareas agénticas: con function calling nativo y salida JSON, puede integrarse en pipelines que requieran invocar herramientas externas, como consultas a APIs, gestión de calendarios o extracción estructurada de datos.
- Procesamiento de documentos largos: la ventana de 256k tokens permite resumir o extraer información de contratos, informes o artículos extensos sin truncamiento, adecuado para aplicaciones de análisis documental.
- Asistente de accesibilidad: descripción de imágenes en tiempo real para usuarios con discapacidad visual, ejecutándose localmente en el navegador sin enviar datos a servidores externos.
- Prototipado rápido y demos interactivas: la disponibilidad de un demo WebGPU y la integración con Transformers.js permiten crear demos funcionales en pocas líneas de JavaScript, ideal para validar ideas antes de invertir en infraestructura.
- Aplicaciones multilingües de chat: soporte de once idiomas para asistentes virtuales en entornos internacionales, con capacidad de cambiar de idioma dentro de la misma conversación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada: el modelo cabe en 8 GB de VRAM en FP8; con cuantizaciones adicionales puede requerir menos.
- GPU recomendadas: no se especifican modelos concretos en la información proporcionada; el modelo está diseñado para hardware de consumo y edge.
- Compatibilidad con GPU de consumo: sí, según la model card es desplegable en hardware amplio, incluyendo GPUs de consumo con 8 GB o más en FP8.
- Opciones de despliegue: Transformers.js (JavaScript, WebGPU), ONNX Runtime, y potencialmente otros runtimes compatibles con ONNX. No se mencionan vLLM, llama.cpp, Ollama o TGI en la información disponible.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Visión | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Ministral 3 3B Instruct 2512 ONNX | 3.8B (3.4B LM + 0.4B visión) | 256k | Sí | Apache 2.0 | Hugging Face (ONNX) |
| Ministral 3 3B Instruct 2512 (base) | 3.8B | 256k | Sí | Apache 2.0 | Hugging Face |
| Alternativas de tamaño similar | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de información sobre modelos comparables de otros desarrolladores en la documentación proporcionada. La comparación más directa es con el modelo base sin cuantizar, que ofrece las mismas capacidades pero en formato distinto (probablemente safetensors) y mayor tamaño de repositorio.

## Limitaciones y advertencias

- La model card advierte que las comprobaciones de funcionalidad son preliminares y no se han completado pruebas exhaustivas; se recomienda realizar evaluaciones propias antes de usar en producción.
- Riesgo de alucinación inherente a los modelos de lenguaje; no se han publicado tasas específicas.
- Sesgos conocidos: no se documentan sesgos específicos en la información proporcionada, pero al ser un modelo entrenado con datos web es probable que herede sesgos presentes en ellos.
- Limitaciones de contexto: aunque soporta 256k tokens, el rendimiento en contextos muy largos puede degradarse; no se han publicado evaluaciones al respecto.
- Restricciones de licencia: Apache 2.0 permite uso comercial sin restricciones adicionales, pero se debe conservar el aviso de licencia y atribución.
- Caveat para producción: la versión ONNX está optimizada para Transformers.js y WebGPU; el rendimiento y la compatibilidad pueden variar según el navegador y el hardware del cliente. No se garantiza paridad exacta con la versión original en todos los casos.
- El repositorio tiene un tamaño de 36.3 GB, lo que puede suponer una descarga considerable para despliegues locales.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/mistralai/Ministral-3-3B-Instruct-2512-ONNX
- Modelo base: https://huggingface.co/mistralai/Ministral-3-3B-Instruct-2512
- Blog de Mistral AI: https://mistral.ai/news/mistral-3
- Paper: https://arxiv.org/abs/2601.08584
- Demo WebGPU: https://huggingface.co/spaces/mistralai/Ministral_3B_WebGPU
- Documentación de Transformers.js: https://huggingface.co/docs/transformers.js
- Paquete NPM de Transformers.js: https://www.npmjs.com/package/@huggingface/transformers
- Perfil del contribuidor Xenova: https://huggingface.co/Xenova
- Cliente Python de Mistral (PyPI): https://pypi.org/project/mistralai/
