# codeShare/LTX-2.5-sdnq-4bit

## Resumen

LTX-2.5 es un modelo generativo multimodal de vídeo y audio desarrollado por Lightricks, distribuido en este repositorio por el usuario `codeShare` bajo la variante `sdnq-4bit`. Se trata de una cuantización a 4 bits del modelo original LTX-2.5, empaquetada para su uso con la librería `diffusers` mediante el pipeline `LTX2Pipeline`. El modelo cubre un conjunto amplio de tareas: text-to-video, image-to-video, video-to-video, audio-to-video, text-to-audio, video-to-audio, audio-to-audio y combinaciones de audio y vídeo (text-to-audio-video, image-to-audio-video, image-text-to-audio-video), lo que lo sitúa como un sistema unificado de generación audiovisual y simulación de mundo.

La relevancia de esta variante concreta reside en su tamaño: el repositorio ocupa 4,1 GB, lo que sugiere que la cuantización a 4 bits reduce drásticamente los requisitos de memoria frente al modelo original, facilitando el autoalojamiento en infraestructura propia. El modelo está pensado para generación de vídeo con audio sincronizado, una capacidad que en la mayoría de sistemas abiertos requiere pipelines separados.

La información disponible sobre arquitectura interna, número de parámetros y datos de entrenamiento es limitada: la model card se centra en la licencia y en enlaces a recursos, y no detalla especificaciones técnicas del modelo base. Esta ficha refleja únicamente lo que puede verificarse a partir de los metadatos y la documentación enlazada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo de difusión para vídeo y audio; pipeline `LTX2Pipeline` en `diffusers`) |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 4 bits (variante `sdnq-4bit`); el modelo base admite otras cuantizaciones no detalladas |
| Idiomas soportados | en, de, es, fr, ja, ko, zh, it, pt |
| Licencia | LTX-2.x Community License Agreement (`license:other`) |
| Formato de pesos | safetensors (librería `diffusers`) |

## Arquitectura y entrenamiento

No se dispone de información detallada sobre la arquitectura interna del modelo base LTX-2.5 en la documentación proporcionada. Los metadatos indican que se ejecuta mediante el pipeline `LTX2Pipeline` de `diffusers` y que cubre generación y transformación multimodal de vídeo y audio, lo que es coherente con una arquitectura de difusión adaptada a dominios audiovisuales. La model card hace referencia a un artículo en arXiv (2601.03233) que presumiblemente contiene los detalles técnicos, pero su contenido no está incluido en la información disponible.

Esta variante concreta, `sdnq-4bit`, es una cuantización a 4 bits del modelo original. El sufijo `sdnq` no se explica en la documentación proporcionada, por lo que no es posible confirmar qué técnica exacta de cuantización se ha aplicado ni qué degradación de calidad introduce. El repositorio pesa 4,1 GB, dato que puede usarse como referencia del ahorro de almacenamiento respecto al modelo completo, aunque no se dispone del tamaño del original para comparar. Tampoco se documentan el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de alineación como RLHF o DPO.

## Capacidades

- Generación de vídeo a partir de texto (text-to-video).
- Generación de vídeo a partir de una imagen (image-to-video).
- Transformación de vídeo existente (video-to-video).
- Generación de vídeo condicionada por audio (audio-to-video).
- Generación de audio a partir de texto (text-to-audio).
- Generación de audio a partir de vídeo (video-to-audio).
- Transformación de audio (audio-to-audio).
- Generación conjunta de audio y vídeo desde texto (text-to-audio-video).
- Generación conjunta de audio y vídeo desde imagen (image-to-audio-video).
- Generación conjunta de audio y vídeo desde imagen y texto (image-text-to-audio-video).
- Soporte multilingüe en las indicaciones: inglés, alemán, español, francés, japonés, coreano, chino, italiano y portugués.
- No se documentan en la información disponible capacidades de tool calling, razonamiento multi-paso ni modo de pensamiento, que no corresponden a la categoría del modelo.

## Casos de uso

- Producción de vídeo publicitario a partir de texto: el modelo permite generar clips con audio sincronizado desde una descripción textual, lo que reduce el coste de crear borradores para campañas antes de la producción final.
- Doblaje y localización audiovisual: la capacidad video-to-audio y audio-to-audio permite regenerar pistas de audio sobre vídeo existente, útil para adaptar contenido a los nueve idiomas soportados.
- Prototipado rápido de escenas para cine o animación: con image-to-video se pueden animar storyboards o ilustraciones fijas para previsualizar movimiento y ritmo antes de invertir en renderizado completo.
- Generación de efectos de sonido y ambientes: la ruta text-to-audio permite crear pistas de audio para videojuegos, podcasts o vídeos sin depender de bibliotecas de samples.
- Enriquecimiento de material de archivo: video-to-video posibilita estilizar o transformar metraje existente, por ejemplo para uniformar la estética de un catálogo de clips.
- Creación de contenido para redes sociales: la combinación image-text-to-audio-video permite partir de una imagen de marca y un texto para obtener un clip corto con audio, adecuado para publicaciones periódicas.
- Investigación en generación audiovisual conjunta: al ser un modelo abierto con licencia comunitaria y ejecutable en `diffusers`, sirve como base para experimentos de sincronización audio-vídeo y para fine-tuning sobre dominios específicos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita. El repositorio ocupa 4,1 GB en cuantización de 4 bits, lo que da una cota inferior orientativa del espacio de pesos; a ello hay que sumar la memoria de activaciones y del pipeline de difusión, que la documentación no cuantifica.
- GPU recomendadas: no disponible.
- Viabilidad en GPU de consumo: no confirmada en la información disponible; el tamaño de pesos de 4,1 GB sugiere que podría caber en GPUs de consumo con suficiente VRAM, pero no hay datos oficiales que lo garanticen.
- Opciones de despliegue: `diffusers` mediante `LTX2Pipeline`. No se documentan integraciones con vLLM, llama.cpp, Ollama o TGI, que además no son aplicables a modelos de difusión de vídeo.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye datos de rendimiento ni especificaciones de modelos comparables de la misma categoría, por lo que no es posible establecer una comparación rigurosa.

## Limitaciones y advertencias

- La model card no detalla sesgos conocidos del modelo; al ser un generador audiovisual entrenado con datos a gran escala, es previsible que reproduzca sesgos presentes en esos datos, pero no hay documentación específica disponible.
- Riesgo de alucinación visual y auditiva: como modelo generativo, puede producir contenido incoherente, artefactos o audio desincronizado, especialmente en esta variante cuantizada a 4 bits.
- La cuantización a 4 bits puede degradar la calidad respecto al modelo original; no se documenta la magnitud de esa pérdida.
- Licencia LTX-2.x Community License Agreement: no es una licencia de código abierto estándar. Es imprescindible revisar sus términos antes de cualquier uso comercial, ya que puede imponer restricciones de ingresos, atribución o redistribución.
- El repositorio incluye un mecanismo de acceso condicionado (`extra_gated`) con consentimiento para recibir comunicaciones y publicidad personalizada; conviene tenerlo en cuenta antes de aceptar.
- El repositorio tiene 0 descargas y 1 like en el momento de la consulta, lo que indica que es una publicación reciente y sin validación comunitaria amplia.
- No se dispone de información sobre límites de duración o resolución de los vídeos generados, ni sobre el contexto máximo de las indicaciones.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/codeShare/LTX-2.5-sdnq-4bit
- Página del modelo base: https://huggingface.co/Lightricks/LTX-2.5
- Artículo de investigación: https://huggingface.co/papers/2601.03233
- Repositorio GitHub: https://github.com/Lightricks/LTX-2
- Licencia: https://github.com/Lightricks/LTX-2/blob/main/LICENSE-2_x
- Documentación: https://docs.ltx.io/open-source-model/getting-started/overview
- Sitio oficial: https://ltx.io
- Playground de la API: https://console.ltx.io/playground/
- Demo interactiva: https://app.ltx.studio/ltx-2-playground/i2v
- Discord: https://discord.gg/ltx
