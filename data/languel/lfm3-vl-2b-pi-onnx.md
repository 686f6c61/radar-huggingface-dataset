# languel/LFM3-VL-2B-pi-ONNX

## Resumen

LFM3-VL-2B-pi-ONNX es una distribucion derivada del modelo multimodal LiquidAI/LFM3-VL-2B, publicado por el usuario languel. Se trata de un build en formato ONNX optimizado para ejecucion en navegador mediante Transformers.js v4 y el backend WebGPU, pensado para inferencia local de vision y texto sin necesidad de servidor. El modelo fusiona el decodificador de texto del VLM base con un adaptador LoRA de agente (Pi) procedente de harness-hub/LFM3-1.7B-pi, y cuantiza el decodificador a 4 bits en formato q4f16.

La relevancia de esta ficha radica en que empaqueta un VLM de 2B parametros en un artefacto de 1,7 GB ejecutable en el navegador, lo que habilita casos de uso de privacidad por diseno (los datos no salen del dispositivo) y despliegue sin infraestructura de servidor. El modelo base procede de Liquid AI y emplea la arquitectura LFM3 (familia de modelos de Liquid AI), si bien la model card no detalla la composicion exacta de capas ni la longitud de contexto.

La licencia es la LFM Open License v1.0, que impone restricciones de uso comercial (seccion 5) y condiciones de redistribucion (seccion 4). El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y fue creado el 24 de noviembre de 2026.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LFM3 (VLM multimodal vision + texto); decodificador transformer con atencion y proyecciones fusionadas (attn.q_proj + gate_proj); exportado a ONNX |
| Parametros totales | 2B (segun nombre del modelo base; no se detalla desglose) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | q4f16 (4 bits MatMulNBits, block size 32, simetrica, accuracy level 4) en decodificador y embed_tokens; fp16 en vision_encoder |
| Idiomas soportados | no disponible |
| Licencia | LFM Open License v1.0 (lfm1.0) |
| Formato de pesos | ONNX (decoder_model_merged_q4f16.onnx); vision encoder fp16; embed_tokens q4f16 |

## Arquitectura y entrenamiento

El modelo base LFM3-VL-2B es un VLM de Liquid AI que combina un codificador de vision con un decodificador de texto transformer. Esta distribucion parte del export ONNX de onnx-community/LFM3-VL-2B-ONNX y aplica un injerto de adaptadores LoRA: se fusionan los 153 pares LoRA A/B del adaptador harness-hub/LFM3-1.7B-pi (rango 32, alpha 64, escala de merge cross-backbone 0.75) sobre los inicializadores de pesos MatMul del decodificador en FP16, incluyendo las columnas fusionadas de attn.q_proj y gate_proj. El codificador de vision y los embeddings de tokens quedan intactos.

Tras el injerto, el decodificador se cuantiza a 4 bits en formato MatMulNBits (block size 32, simetrica, accuracy level 4) para ejecucion WebGPU con @huggingface/transformers@4.3.2. No se detalla en la model card el numero de tokens de entrenamiento, la composicion del dataset, ni si hubo RLHF/DPO en el modelo base. El adaptador Pi es un LoRA de agente entrenado por RL sobre un backbone de 1,7B, lo que introduce una asimetria de backbone respecto al VLM de 2B que se compensa con la escala de merge 0.75.

## Capacidades

- Generacion de texto e inferencia multimodal imagen-texto (pipeline image-text-to-text).
- Procesamiento de imagenes mediante codificador de vision en fp16.
- Comportamiento de agente: el adaptador Pi anade capacidades de agente (tags agents, pi) orientadas a razonamiento multi-paso y uso de herramientas.
- Ejecucion en navegador via WebGPU con Transformers.js v4, sin servidor.
- Conversacion multi-turno (tag conversational).
- Capacidades multilingues: no disponibles en la informacion proporcionada.
- Tool calling / function calling: no confirmado explicitamente en la model card, aunque el tag agents y el adaptador Pi lo sugieren; no disponible como dato verificado.

## Casos de uso

- Asistentes de vision en navegador con privacidad por diseno: el modelo procesa imagenes y texto localmente en WebGPU, de modo que las capturas o documentos no se envian a un servidor; adecuado para aplicaciones de salud, legal o finanzas donde la confidencialidad es critica.
- Descripcion y etiquetado de imagenes en el cliente: integrable en herramientas web de gestion de fotos o catalogos que necesitan alt text y metadatos sin backend, gracias al pipeline image-text-to-text y al artefacto de 1,7 GB.
- Agente conversacional embebido en paginas web: el adaptador Pi habilita flujos de agente multi-paso (consulta de imagen, razonamiento, respuesta) sin infraestructura, util para demos interactivas y prototipos.
- Automatizacion de soporte visual: analisis de capturas de pantalla o diagramas enviados por el usuario en un chat de atencion al cliente, con respuesta generada en el propio dispositivo.
- Educacion y accesibilidad: lectura de imagenes de pizarra, graficos o documentos para generar explicaciones textuales en aplicaciones de aprendizaje offline-first.
- Prototipado rapido de pipelines VLM: al estar en ONNX y Transformers.js, sirve para validar flujos de vision-lenguaje antes de migrar a despliegues con vLLM o TGI en servidor.
- Extension de navegador para analisis de contenido visual: el modelo puede inspeccionar imagenes de la pagina activa y producir resumenes o alertas sin salir del cliente.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: el repositorio ocupa 1,7 GB; en ejecucion WebGPU el decodificador q4f16 y los embeddings q4f16 reducen la huella, mientras el vision encoder en fp16 anade varios cientos de MB. No se proporciona una cifra oficial de VRAM pico.
- GPU recomendadas: cualquier GPU con soporte WebGPU (navegadores Chromium recientes). Para servidor, A100/H100 no aplican a este artefacto ONNX-WebGPU; el modelo base podria ejecutarse en GPU dedicadas, pero no se detalla.
- Cabe en GPU consumer: si, siempre que el navegador exponga WebGPU; el tamano de 1,7 GB es compatible con GPUs integradas y dedicadas modernas, aunque el rendimiento dependera del ancho de banda de memoria.
- Opciones de despliegue: Transformers.js v4 con @huggingface/transformers@4.3.2 y device "webgpu" (unica via documentada). No se documenta vLLM, llama.cpp, Ollama ni TGI para este artefacto ONNX.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Ejecucion en navegador |
|---|---|---|---|---|---|
| LFM3-VL-2B-pi-ONNX (este) | 2B | no disponible | ONNX q4f16 | LFM Open License v1.0 | Si (WebGPU) |
| LiquidAI/LFM3-VL-2B (base) | 2B | no disponible | safetensors (presumible) | LFM Open License v1.0 | No documentado |
| onnx-community/LFM3-VL-2B-ONNX | 2B | no disponible | ONNX | LFM Open License v1.0 | Si (via Transformers.js) |
| harness-hub/LFM3-1.7B-pi | 1,7B | no disponible | no disponible | LFM Open License v1.0 | No documentado |

La comparativa se limita a la familia LFM3 porque la informacion proporcionada no incluye datos de rendimiento ni de contexto que permitan contrastar con alternativas de otros fabricantes.

## Limitaciones y advertencias

- El modelo es una obra derivada con un LoRA injertado desde un backbone distinto (1,7B frente a 2B), lo que puede degradar la coherencia respecto al VLM base; la escala de merge 0.75 es una decision del autor sin validacion publica.
- No se han publicado benchmarks ni evaluaciones de calidad; el rendimiento real es desconocido.
- Riesgo de alucinacion inherente a modelos de 2B y a la cuantizacion a 4 bits del decodificador.
- Idiomas soportados no documentados; no se garantiza cobertura multilingue.
- Longitud de contexto no disponible, lo que impide planificar conversaciones largas o documentos extensos.
- Licencia LFM Open License v1.0 con limitacion de uso comercial (seccion 5) y condiciones de redistribucion (seccion 4); revisar antes de uso en produccion.
- Dependencia de WebGPU: navegadores sin soporte o con implementaciones incompletas no podran ejecutar el modelo.
- Repositorio con 0 descargas y 0 likes; sin validacion de la comunidad.
- La cuantizacion q4f16 puede introducir perdida de precision en tareas de vision fina (OCR, deteccion de detalles).

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/languel/LFM3-VL-2B-pi-ONNX
- Modelo base: https://huggingface.co/LiquidAI/LFM3-VL-2B
- Export ONNX base: https://huggingface.co/onnx-community/LFM3-VL-2B-ONNX
- Adaptador LoRA Pi: https://huggingface.co/harness-hub/LFM3-1.7B-pi
- Libreria Transformers.js: https://cdn.jsdelivr.net/npm/@huggingface/transformers@4.3.2
