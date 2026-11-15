# geladons/LFM2.5-VL-1.6B

## Resumen

LFM2.5-VL-1.6B es un modelo vision-lenguaje de 1.600 millones de parametros desarrollado por LiquidAI, distribuido aqui por el usuario geladons en formato LiteRT-LM para inferencia totalmente local en dispositivos Android. El bundle convierte los pesos originales del modelo base a un fichero `.litertlm` cuantizado en int4 por bloques, con un tamano de 1,30 GB, pensado para ejecutarse en el propio telefono sin conexion a la nube ni cuenta de usuario.

El modelo resuelve el problema de desplegar capacidades multimodales (imagen + texto a texto) en hardware de gama movil con recursos limitados. Frente a alternativas que requieren GPU de servidor o APIs externas, este paquete integra el runtime LiteRT-LM de Google, que carga el fichero directamente mediante el SDK `com.google.ai.edge.litertlm` y expone una interfaz de conversacion para aplicaciones Android nativas.

La relevancia actual del modelo reside en su enfoque edge-first: un VLM de 1,6B en int4 cabe en el almacenamiento de un movil y permite casos de uso como descripcion de imagenes, OCR asistido o asistencia visual sin latencia de red ni coste por token. La informacion disponible sobre arquitectura interna, datos de entrenamiento y benchmarks es limitada, ya que la model card del repositorio derivado se centra en el empaquetado y no en las caracteristicas tecnicas del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base LiquidAI/LFM2.5-VL-1.6B; arquitectura exacta no especificada en la informacion proporcionada) |
| Parametros totales | 1.600 millones (1,6B, segun el nombre del modelo) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | int4 block-quantized (unico formato distribuido en este repo) |
| Idiomas soportados | no disponible |
| Licencia | LFM Open License (licencia "other", heredada del modelo base) |
| Formato de pesos | `.litertlm` (LiteRT-LM runtime); fichero de 1,30 GB |

## Arquitectura y entrenamiento

No se dispone de informacion detallada sobre la arquitectura interna del modelo base en la documentacion proporcionada. El nombre y la pipeline (`image-text-to-text`) indican que se trata de un modelo vision-lenguaje que acepta una imagen y un prompt de texto y genera texto como salida. El desarrollo corresponde a LiquidAI, que distribuye el modelo original en Hugging Face; el repositorio aqui descrito es una conversion de esos pesos al formato LiteRT-LM.

La innovacion tecnica destacable de este repositorio no esta en el entrenamiento sino en el empaquetado: la conversion a LiteRT-LM con cuantizacion int4 por bloques permite ejecutar el modelo de forma nativa en Android mediante el runtime de Google AI Edge. No se especifican en la informacion disponible el numero de tokens de entrenamiento, la composicion del dataset, ni si hubo fases de RLHF o DPO.

## Capacidades

- Generacion de texto condicionada por imagen (image-text-to-text): el modelo acepta una imagen junto con un prompt y produce una respuesta textual.
- Comprension visual basica: descripcion de imagenes, respuesta a preguntas sobre el contenido visual y posible lectura de texto en imagen (no confirmado explicitamente en la informacion disponible).
- Inferencia totalmente offline: no requiere conexion a red ni cuenta de usuario una vez descargado el bundle.
- Integracion en aplicaciones Android mediante el SDK `com.google.ai.edge.litertlm` (clases `Engine` y `Conversation`).
- Ejecucion en dispositivo (on-device) con cuantizacion int4 para reducir huella de memoria y almacenamiento.
- Soporte de tool calling, agentes, modo thinking, audio o capacidades multilingues: no disponible en la informacion proporcionada.

## Casos de uso

- Asistencia visual offline en el movil: el modelo puede describir una foto tomada con la camara del dispositivo y responder preguntas sobre ella sin enviar la imagen a un servidor, lo que es adecuado para aplicaciones de accesibilidad o privacidad sensible.
- OCR asistido y extraccion de informacion de documentos: con una captura de un recibo o formulario, el modelo puede generar un resumen textual o responder preguntas sobre los campos visibles, ejecutandose integramente en el telefono.
- Atencion al cliente en modo avion o entornos sin conectividad: al no depender de la nube, el bundle permite construir asistentes conversacionales que funcionan en zonas rurales, aviones o recintos con red restringida.
- Prototipado rapido de apps Android con IA: el SDK LiteRT-LM permite a un desarrollador apuntar `Engine`/`Conversation` al fichero `.litertlm` y tener un VLM funcional en su aplicacion sin montar infraestructura de servidor.
- Aplicaciones de privacidad por diseno: casos como analisis de imagenes medicas basicas, documentos personales o fotos familiares donde los datos no deben salir del dispositivo se benefician de la inferencia local.
- Demos y evaluacion sin codigo: mediante la app Local AI de Google Play, el modelo esta en el catalogo integrado, lo que permite probar sus capacidades visuales con descarga y chat offline sin escribir codigo.
- Educacion y experimentacion en edge AI: investigadores pueden usar el bundle para medir latencia, consumo y calidad de un VLM de 1,6B en distintos moviles Android, comparando con alternativas en la nube.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica en el sentido tradicional; el modelo corre en el movil. El fichero ocupa 1,30 GB en almacenamiento y requiere memoria RAM libre comparable durante la carga y ejecucion (estimacion no confirmada en la informacion disponible).
- GPU recomendadas: no disponible; el runtime LiteRT-LM esta orientado a aceleradores moviles (CPU, GPU o NPU del telefono) segun el dispositivo.
- Cabe en consumer GPU: no disponible; el formato `.litertlm` esta pensado para Android, no para GPUs de escritorio. Para ejecutar el modelo base en GPU de consumer habria que usar los pesos originales de LiquidAI en otro formato (no incluido en este repo).
- Opciones de despliegue: LiteRT-LM runtime (`com.google.ai.edge.litertlm`), app Local AI en Google Play, o integracion directa en una app Android. vLLM, llama.cpp, Ollama y TGI no estan soportados para este formato segun la informacion disponible.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| LFM2.5-VL-1.6B (este repo, LiteRT-LM) | 1,6B | no disponible | `.litertlm` int4 | LFM Open License | Hugging Face, app Local AI |
| LiquidAI/LFM2.5-VL-1.6B (base) | 1,6B | no disponible | safetensors (presumible) | LFM Open License | Hugging Face |
| Otros VLM de ~1-2B para edge | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone en la informacion proporcionada de datos de rendimiento ni de especificaciones de modelos comparables alternativos, por lo que la comparativa cuantitativa no esta disponible.

## Limitaciones y advertencias

- La informacion tecnica disponible es escasa: la model card se centra en el empaquetado y no detalla arquitectura, contexto, idiomas ni datos de entrenamiento del modelo base.
- Riesgo de alucinacion inherente a los modelos de lenguaje y vision-lenguaje de este tamano; las descripciones de imagenes pueden contener detalles inventados.
- La cuantizacion int4 puede degradar la calidad respecto a los pesos originales en tareas visuales finas (lectura de texto pequeno, reconocimiento de detalles).
- Licencia "other" (LFM Open License): es imprescindible revisar los terminos del modelo base antes de cualquier uso comercial, ya que pueden existir restricciones adicionales.
- El formato `.litertlm` limita el despliegue a Android y al runtime LiteRT-LM; no es portable a otros frameworks sin reconversion.
- No se especifican los idiomas soportados, por lo que el comportamiento multilingue es incierto.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y el autor es un particular (geladons), no el desarrollador original; conviene validar la integridad del bundle frente al modelo base de LiquidAI.
- El fichero es byte-identico al de `geladons/local-ai-models`, segun la model card; se trata de una copia por conveniencia, no de un modelo distinto.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/geladons/LFM2.5-VL-1.6B
- Modelo base: https://huggingface.co/LiquidAI/LFM2.5-VL-1.6B
- Repositorio de modelos del autor: https://huggingface.co/geladons/local-ai-models
- Runtime LiteRT-LM: https://github.com/google-ai-edge/LiteRT-LM
- Recetas de conversion hf-to-litertlm: https://github.com/john-rocky/hf-to-litertlm
- App Local AI (Google Play): https://play.google.com/store/apps/details?id=com.ochandydude.localai
- Licencia LFM Open License: https://huggingface.co/LiquidAI/LFM2.5-1.2B-Instruct/blob/main/LICENSE
