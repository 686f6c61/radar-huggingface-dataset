# AMINOXDEV/gemma-4-12B-it-qat-ONNX

## Resumen

AMINOXDEV/gemma-4-12B-it-qat-ONNX es una conversión a formato ONNX del modelo Gemma 4 12B en su variante instruction-tuned con cuantización QAT (quantization-aware training), derivada de google/gemma-4-12B-it-qat-q4_0-unquantized. El modelo original lo desarrolla Google DeepMind y esta publicado bajo licencia Apache 2.0. Esta version concreta la mantiene el usuario AMINOXDEV y esta empaquetada especificamente para ejecutarse en navegador mediante Transformers.js y WebGPU, con el codificador de vision en fp16 y el decodificador en q4f16.

El problema que resuelve esta variante es el despliegue de un modelo multimodal de 12B de parametros en el cliente (navegador) sin necesidad de infraestructura de servidor, aprovechando los kernels int8 DP4A de ONNX Runtime WebGPU para la fase de prompt. Es relevante porque demuestra la viabilidad de ejecutar modelos de vision-lenguaje de tamano medio en hardware consumer a traves de la web, con un repositorio de 6,9 GB que incluye pesos ONNX, tokenizer y plantilla de chat.

La informacion disponible sobre arquitectura interna, datos de entrenamiento y benchmarks es muy limitada: la model card se centra en la procedencia de los ficheros y las modificaciones realizadas, no en las caracteristicas tecnicas del modelo base. Los datos que no aparecen en la informacion proporcionada se indican como "no disponible".

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (model_type `gemma4` en Transformers.js; transformer multimodal image-text-to-text) |
| Parametros totales | 12B (segun el nombre del modelo) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | q4f16 en decodificador (MatMulNBits), fp16 en codificador de vision |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX (decoder_model_merged_q4f16.onnx, vision_encoder_fp16.onnx) |

## Arquitectura y entrenamiento

La informacion proporcionada no detalla la arquitectura interna del modelo base Gemma 4 12B mas alla de que se trata de un modelo multimodal image-text-to-text con `model_type` `gemma4`. El modelo original es una variante instruction-tuned con QAT (quantization-aware training) sobre la que Google DeepMind aplico un proceso de cuantizacion consciente del entrenamiento para producir pesos q4_0; esta version ONNX parte de esos pesos y los reempaqueta para Transformers.js.

La innovacion tecnica documentada en esta ficha es el proceso de conversion y optimizacion para WebGPU: el grafo `decoder_model_merged_q4f16.onnx` ha sido modificado (solo el grafo, no los pesos) para fijar `accuracy_level=4` en los nodos `MatMulNBits`, lo que activa kernels int8 DP4A en ONNX Runtime WebGPU para la fase de prompt. El codificador de vision se mantiene en fp16 y procede de otra conversion (justinchuby/gemma-4-12b-onnx). No se dispone de informacion sobre numero de tokens de entrenamiento, composicion del dataset ni si hubo RLHF o DPO.

## Capacidades

- Generacion de texto conversacional (pipeline `image-text-to-text`, tag `conversational`).
- Procesamiento de imagen y texto combinados (codificador de vision fp16 incluido).
- Ejecucion en navegador mediante Transformers.js y WebGPU.
- Soporte de plantilla de chat (`chat_template.jinja`) para dialogos multi-turno.
- Capacidades de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponible en la informacion proporcionada.
- Modo thinking, audio u otras capacidades especiales: no disponible en la informacion proporcionada.

## Casos de uso

- Chat multimodal en navegador sin backend: el modelo se ejecuta via Transformers.js y WebGPU, permitiendo conversaciones con imagenes directamente en el cliente sin enviar datos a un servidor. Adecuado por su empaquetado ONNX q4f16 y su codificador de vision fp16.
- Demos interactivas de vision-lenguaje: util para publicar demostraciones de image-text-to-text en paginas web estaticas, ya que el repositorio incluye todos los artefactos necesarios (pesos, tokenizer, plantilla de chat) para cargarse desde el navegador.
- Procesamiento de imagenes con privacidad: al ejecutarse en el cliente, las imagenes no salen del dispositivo, lo que resulta adecuado para casos con requisitos de privacidad (documentos personales, capturas medicas) aunque el modelo no este disenado especificamente para dominios regulados.
- Prototipado rapido de asistentes visuales: permite validar flujos de captioning, respuesta a preguntas sobre imagenes o extraccion de informacion visual sin montar infraestructura GPU en servidor.
- Educacion y experimentacion: sirve para estudiar el rendimiento de kernels int8 DP4A en WebGPU y comparar la latencia de inferencia en navegador frente a despliegues nativos.
- Integracion en aplicaciones web progresivas (PWA): el formato ONNX y la libreria Transformers.js facilitan empaquetar el modelo en aplicaciones que funcionan offline una vez descargados los pesos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explicita. El repositorio ocupa 6,9 GB, lo que da una cota superior del espacio de almacenamiento necesario; el consumo en memoria dependera del backend WebGPU y del navegador.
- GPU recomendadas: no disponible. El modelo esta pensado para ejecutarse en WebGPU, por lo que requiere un navegador con soporte WebGPU y una GPU compatible (la informacion no especifica modelos concretos).
- Cabe en GPU consumer: previsiblemente si, dado el tamano de 12B en q4f16 y el diseno para navegador, pero no se aportan cifras concretas de VRAM ni lista de GPUs verificadas.
- Opciones de despliegue: Transformers.js con ONNX Runtime WebGPU (objetivo principal); otros runtimes ONNX no estan documentados en la informacion proporcionada.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| AMINOXDEV/gemma-4-12B-it-qat-ONNX | 12B | no disponible | ONNX (q4f16 + fp16 vision) | Apache 2.0 | Optimizado para Transformers.js/WebGPU |
| google/gemma-4-12B-it-qat-q4_0-unquantized | 12B | no disponible | no disponible | Apache 2.0 | Modelo base de Google DeepMind |
| james58899/gemma-4-12B-it-qat-ONNX | 12B | no disponible | ONNX | no disponible | Origen de pesos y embeddings; sin la modificacion de grafo |
| justinchuby/gemma-4-12b-onnx | 12B | no disponible | ONNX (fp16) | no disponible | Origen del codificador de vision fp16 |

## Limitaciones y advertencias

- La model card no documenta sesgos conocidos del modelo base; deben asumirse los riesgos habituales de los modelos de lenguaje entrenados con datos web.
- Riesgo de alucinacion: no cuantificado en la informacion disponible; aplicable el riesgo general de los modelos generativos multimodales.
- Limitaciones de contexto e idioma: no disponibles. El modelo no declara idiomas soportados en esta ficha.
- La modificacion del grafo (`accuracy_level=4` en `MatMulNBits`) afecta solo al rendimiento de la fase de prompt con kernels int8 DP4A; no se documenta su impacto en la precision numerica.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no hay evidencia de uso en produccion ni validacion de la comunidad.
- Aunque la licencia declarada es Apache 2.0, la model card remite a la licencia de Gemma 4 de Google (https://ai.google.dev/gemma/docs/gemma_4_license); conviene verificar los terminos aplicables antes de un uso comercial.
- Dependencia de WebGPU: el modelo solo es utilizable en navegadores y GPUs con soporte WebGPU, lo que limita su alcance a entornos modernos.
- No se proporcionan datos de context length, por lo que no se puede garantizar el comportamiento en conversaciones largas.

## Enlaces

- Hugging Face: https://huggingface.co/AMINOXDEV/gemma-4-12B-it-qat-ONNX
- Modelo base: https://huggingface.co/google/gemma-4-12B-it-qat-q4_0-unquantized
- Origen de pesos y embeddings: https://huggingface.co/james58899/gemma-4-12B-it-qat-ONNX/tree/60555e645e7c456b4a013cc2e93e9bd6379e3006
- Origen del codificador de vision: https://huggingface.co/justinchuby/gemma-4-12b-onnx/tree/52a1c4fa78a69f30f96c8fe20f6368621bedbb57
- Licencia Gemma 4: https://ai.google.dev/gemma/docs/gemma_4_license
- Demo WebGPU Chat: https://llm.aminox.dev
