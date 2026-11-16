# balllvin/LFM3-Omni-2B-abliterated-ONNX-WebGPU

## Resumen

LFM3-Omni-2B-abliterated-ONNX-WebGPU es una conversión a formato ONNX del modelo balllvin/LFM3-Omni-2B-abliterated, una variante "abliterated" (con los mecanismos de rechazo atenuados o eliminados) del modelo LFM3-Omni de 2B parámetros de Liquid AI. La conversión está empaquetada específicamente para su ejecución en navegador mediante onnxruntime-web y el backend WebGPU, lo que permite inferencia local de un modelo multimodal de imagen a texto sin necesidad de servidor.

El pipeline declarado es image-text-to-text, lo que indica que el modelo acepta entradas de imagen y texto y genera texto. El repositorio tiene un tamaño de 1,6 GB, coherente con una cuantización del modelo original de 2B parámetros para su despliegue en cliente. La arquitectura de LFM3-Omni no está detallada en la información disponible; la familia LFM (Liquid Foundation Models) de Liquid AI se caracteriza por arquitecturas híbridas, pero este dato no se confirma en la ficha del repositorio.

La relevancia de esta ficha es doble: por un lado, demuestra la viabilidad de ejecutar modelos multimodales de 2B parámetros en el navegador con WebGPU; por otro, al tratarse de una variante abliterated, plantea consideraciones importantes sobre seguridad y uso responsable. El acceso está restringido (gated), por lo que es necesario aceptar condiciones en Hugging Face antes de descargarlo.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base LFM3-Omni de Liquid AI; detalles no confirmados) |
| Parámetros totales | 2B (según nombre del modelo) |
| Parámetros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (repo de 1,6 GB, compatible con ONNX Runtime Web) |
| Idiomas soportados | no disponible |
| Licencia | lfm1.0 (etiquetada como "other" en los tags) |
| Formato de pesos | ONNX (onnxruntime, onnxruntime-web, WebGPU) |

## Arquitectura y entrenamiento

No se dispone de información detallada sobre la arquitectura interna del modelo en la documentación proporcionada. El modelo base es LFM3-Omni de Liquid AI, del que se conoce su naturaleza multimodal (image-text-to-text) y su tamaño de 2B parámetros, pero no se especifican en esta ficha el tipo de transformer, la composición del dataset de entrenamiento, el número de tokens ni si se aplicaron técnicas de RLHF o DPO.

La variante "abliterated" implica que se ha aplicado una técnica de modificación de pesos orientada a suprimir las direcciones de activación asociadas al rechazo de peticiones, lo que altera el comportamiento del modelo respecto al original. Esta modificación se realizó sobre el modelo balllvin/LFM3-Omni-2B-abliterated, que a su vez deriva del LFM3-Omni original. La conversión a ONNX y el empaquetado para onnxruntime-web con backend WebGPU constituyen el trabajo técnico específico de este repositorio, orientado a la ejecución en navegador.

## Capacidades

- Generación de texto condicionada por imagen (image-text-to-text): el pipeline declarado permite responder a preguntas sobre imágenes.
- Conversación multi-turno: etiquetado como "conversational".
- Ejecución en navegador mediante WebGPU: inferencia local en cliente sin servidor.
- Compatibilidad con ONNX Runtime Web: integrable en aplicaciones web JavaScript/TypeScript.
- Capacidades multimodales heredadas del modelo base LFM3-Omni (visión y texto).
- Comportamiento "abliterated": menor tendencia a rechazar peticiones, lo que afecta a las respuestas en dominios sensibles.
- Soporte de tool calling, agentes, thinking mode u otras capacidades especiales: no disponible en la información proporcionada.

## Casos de uso

- Aplicaciones web de descripción de imágenes sin backend: el modelo se ejecuta en el navegador del usuario mediante WebGPU, eliminando costes de servidor y preservando la privacidad de las imágenes procesadas.
- Asistentes de accesibilidad en cliente: descripción de imágenes para usuarios con discapacidad visual directamente en el navegador, sin enviar datos a terceros.
- Herramientas de análisis de capturas de pantalla: integración en extensiones o aplicaciones web que interpretan el contenido visual del usuario de forma local.
- Demostraciones educativas de IA multimodal en navegador: permite ilustrar el funcionamiento de modelos visión-lenguaje sin infraestructura de GPU en servidor.
- Prototipado rápido de interfaces conversacionales multimodales: gracias a ONNX Runtime Web, se puede integrar en un frontend con JavaScript sin pipeline de despliegue complejo.
- Investigación sobre alineación y seguridad: la variante abliterated permite estudiar el comportamiento de modelos sin mecanismos de rechazo en entornos controlados.
- Procesamiento de documentos escaneados o fotos en aplicaciones de productividad web, con la ventaja de que los datos no abandonan el dispositivo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada: el repositorio ocupa 1,6 GB, por lo que se necesita al menos esa cantidad de memoria de GPU disponible para cargar los pesos en WebGPU; el consumo real en ejecución puede ser superior por buffers intermedios.
- GPU recomendadas: cualquier GPU con soporte WebGPU en navegadores modernos (Chrome, Edge). No se especifican modelos concretos en la información disponible.
- Compatibilidad con GPU de consumo: al tratarse de una conversión para navegador, está pensada para GPUs integradas y dedicadas de consumo con WebGPU habilitado; no se confirman modelos concretos.
- Opciones de despliegue: onnxruntime-web con backend WebGPU en navegador; también podría ejecutarse con onnxruntime nativo, aunque el repositorio está orientado a web.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Modalidad | Formato | Licencia | Ejecución en navegador |
|---|---|---|---|---|---|---|
| LFM3-Omni-2B-abliterated-ONNX-WebGPU | 2B | no disponible | Imagen-texto | ONNX | lfm1.0 | Sí (WebGPU) |
| LFM3-Omni-2B (original) | 2B | no disponible | Imagen-texto | no disponible | lfm1.0 | No confirmado |
| balllvin/LFM3-Omni-2B-abliterated | 2B | no disponible | Imagen-texto | no disponible | no disponible | No confirmado |

No se dispone de información suficiente sobre modelos comparables de otros desarrolladores en la documentación proporcionada.

## Limitaciones y advertencias

- Modelo "abliterated": la supresión de los mecanismos de rechazo aumenta el riesgo de generar contenido inapropiado, ofensivo o peligroso; no es recomendable para aplicaciones de producción orientadas al público general sin filtros adicionales.
- Acceso restringido (gated): requiere aceptar condiciones en Hugging Face, lo que limita su distribución y automatización de descargas.
- Licencia lfm1.0: es necesario revisar los términos concretos de la licencia LFM para uso comercial, ya que puede imponer restricciones adicionales.
- Idiomas soportados no documentados: no se puede garantizar un rendimiento adecuado en castellano u otros idiomas distintos del inglés.
- Longitud de contexto no disponible: limita la planificación de aplicaciones con conversaciones largas o documentos extensos.
- Riesgo de alucinación inherente a modelos de 2B parámetros, especialmente en tareas de razonamiento complejo o descripción detallada de imágenes.
- Ejecución en navegador sujeta a la disponibilidad y estabilidad de WebGPU, que varía según navegador, sistema operativo y controladores.
- Sin datos de benchmarks: no es posible evaluar su calidad objetiva frente a alternativas.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: no hay evidencia de validación por parte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/balllvin/LFM3-Omni-2B-abliterated-ONNX-WebGPU
- Modelo base: https://huggingface.co/balllvin/LFM3-Omni-2B-abliterated
- ONNX Runtime Web: https://onnxruntime.ai/docs/tutorials/web/
- WebGPU: https://www.w3.org/TR/webgpu/
- Liquid AI (desarrollador del modelo original): https://www.liquid.ai/
