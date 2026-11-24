# LiquidAI/LFM2.5-VL-3B-ONNX

## Resumen

LFM2.5-VL-3B-ONNX es la distribucion en formato ONNX del modelo multimodal LFM2.5-VL-3B de Liquid AI, una generacion de modelos hibridos disenada especificamente para IA en el borde (edge AI) y despliegue en dispositivo. Esta variante concreta esta pensada para ejecutarse en el navegador mediante Transformers.js v4.0 o superior sobre WebGPU, lo que permite inferencia local de un modelo vision-lenguaje de 3 mil millones de parametros sin backend dedicado.

El modelo resuelve el problema de llevar capacidades de image-text-to-text a entornos con recursos limitados: navegadores, portatiles consumer y dispositivos sin GPU de datacenter. Liquid AI posiciona la familia LFM2.5 como un estandar en calidad, velocidad y eficiencia de memoria para despliegue on-device, combinando un encoder de vision con un decoder hibrido.

La relevancia actual radica en la combinacion de tres factores: tamano contenido (3B), soporte multilingue amplio (16 idiomas, incluido el espanol) y empaquetado ONNX con cuantizacion por componente (fp16 para encoder y embeddings, q4 para el decoder), lo que reduce sustancialmente el peso en memoria frente a la version original en safetensors.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Hibrida (familia LFM2.5), vision-lenguaje; decoder con atencion y capas convolucionales segun la familia LFM2; encoder de vision separado |
| Parametros totales | 3B (segun denominacion del modelo) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | ONNX con dtypes por componente: fp16 (embed_tokens, vision_encoder), q4 (decoder_model_merged) |
| Idiomas soportados | ar, zh, en, fr, de, hi, id, it, ja, ko, pl, pt, ru, es, th, vi |
| Licencia | lfm1.0 (license: other, license_name: lfm1.0) |
| Formato de pesos | ONNX (repo de 25,5 GB) |

## Arquitectura y entrenamiento

La informacion disponible confirma que LFM2.5-VL-3B pertenece a la familia de modelos hibridos LFM2.5 de Liquid AI, orientada a edge AI. La model card de esta variante ONNX no detalla la composicion exacta de capas ni la mezcla entre atencion y convoluciones, ni tampoco el volumen de tokens de entrenamiento, la composicion del dataset o si se aplicaron tecnicas de RLHF o DPO. Esos detalles remiten a la model card del modelo base (LiquidAI/LFM2.5-VL-3B), que no forma parte de la informacion proporcionada.

La innovacion tecnica destacable de esta publicacion es el empaquetado para inferencia en navegador: el modelo se exporta a ONNX con dtypes diferenciados por submodulo (embed_tokens en fp16, vision_encoder en fp16 y decoder_model_merged en q4), de modo que Transformers.js puede cargarlo sobre WebGPU y ejecutar generacion multimodal sin servidor. El pipeline declarado es image-text-to-text y el modelo requiere `custom_code` y `trust_remote_code` en el ecosistema Transformers.

## Capacidades

- Generacion de texto condicionada por imagen (image-text-to-text): descripcion de imagenes, respuesta a preguntas visuales y conversacion multimodal.
- Conversacion multi-turno con plantilla de chat (`apply_chat_template`).
- Soporte multilingue en 16 idiomas: arabe, chino, ingles, frances, aleman, hindi, indonesio, italiano, japones, coreano, polaco, portugues, ruso, espanol, tailandes y vietnamita.
- Inferencia en navegador sobre WebGPU mediante Transformers.js v4.0 o superior.
- Cuantizacion selectiva por componente para reducir huella de memoria.
- Capacidades de tool calling, agentes, razonamiento multi-paso o modo thinking: no disponibles en la informacion proporcionada.

## Casos de uso

- Descripcion de imagenes en el navegador: el modelo puede procesar una imagen cargada por el usuario y generar una descripcion textual sin enviar los datos a un servidor, usando el ejemplo oficial con `load_image` y `AutoModelForImageTextToText` sobre WebGPU.
- Aplicaciones web de accesibilidad: generacion de texto alternativo para imagenes directamente en el cliente, aprovechando que el encoder de vision se ejecuta en fp16 y el decoder en q4 para mantener el coste de memoria bajo.
- Asistentes visuales offline en portatiles consumer: al ser un modelo de 3B con decoder cuantizado a q4, es viable en equipos sin GPU de datacenter, permitiendo escenarios sin conectividad.
- Moderacion o etiquetado de contenido visual en el borde: clasificacion y descripcion de imagenes en el propio dispositivo, reduciendo la exposicion de datos sensibles.
- Prototipado rapido de demos multimodales: el snippet oficial de Transformers.js permite montar una demo funcional en pocas lineas, util para validar producto antes de invertir en infraestructura.
- Aplicaciones multilingues de analisis de imagen: con soporte de 16 idiomas, puede generar respuestas en espanol, portugues, frances o aleman a partir de una misma imagen, adecuado para productos con audiencia internacional.
- Educacion y soporte visual interactivo: conversaciones multi-turno sobre una imagen (por ejemplo, un diagrama o una captura) en entornos web sin backend.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita. El repo ONNX ocupa 25,5 GB e incluye multiples variantes y precisiones; la configuracion recomendada en la model card (embed_tokens fp16, decoder q4, vision_encoder fp16) reduce la huella respecto a fp16 completo, pero no se publica una cifra de VRAM.
- GPU recomendadas: no disponibles. El unico requisito indicado es soporte de WebGPU para la ejecucion en navegador.
- Compatibilidad con GPU consumer: el diseno edge y la cuantizacion q4 del decoder sugieren viabilidad en hardware consumer, pero no se especifican modelos concretos (RTX 4090, etc.) en la informacion disponible.
- Opciones de despliegue: Transformers.js v4.0+ con backend WebGPU (`device: "webgpu"`); tambien es compatible con ONNX Runtime por ser formato ONNX. vLLM, llama.cpp, Ollama o TGI no se mencionan para esta variante.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye datos de rendimiento ni especificaciones de modelos alternativos que permitan una comparacion rigurosa.

## Limitaciones y advertencias

- Licencia lfm1.0 (license: other): es necesario revisar el archivo LICENSE del repositorio antes de cualquier uso comercial; no se detallan aqui las restricciones concretas.
- No se publican datos de sesgos, tasas de alucinacion ni evaluaciones de robustez en la informacion disponible.
- La longitud de contexto no esta especificada, lo que impide planificar cargas de documentos o conversaciones largas con garantias.
- El rendimiento real en navegador depende del soporte de WebGPU del navegador y del hardware del cliente; no hay cifras de latencia publicadas.
- El modelo requiere `custom_code` y `trust_remote_code`, lo que implica ejecutar codigo del autor y revisarlo en entornos sensibles.
- El repo de 25,5 GB incluye varias precisiones; descargar el conjunto completo puede ser costoso en ancho de banda y almacenamiento.
- No hay informacion sobre capacidades de tool calling o agentes, por lo que no debe asumirse su disponibilidad en produccion.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/LiquidAI/LFM2.5-VL-3B-ONNX
- Modelo base: https://huggingface.co/LiquidAI/LFM2.5-VL-3B
- Transformers.js: https://github.com/huggingface/transformers.js
- Playground de Liquid AI: https://playground.liquid.ai/
- Documentacion: https://docs.liquid.ai/lfm/getting-started/welcome
- LEAP: https://leap.liquid.ai/
- Discord de Liquid AI: https://discord.com/invite/liquid-ai
- Sitio de Liquid AI: https://www.liquid.ai/
