# Lightricks/LTX-2.5-Diffusers

## Resumen

LTX-2.5-Diffusers es un modelo generativo multimodal de Lightricks, distribuido en formato nativo para la librería `diffusers` y orientado a la síntesis y transformación de vídeo y audio. A diferencia de los modelos de vídeo puramente texto-a-vídeo, cubre un espacio amplio de modalidades de entrada y salida: texto, imagen, vídeo y audio, incluyendo combinaciones como imagen-texto-a-vídeo, vídeo-a-audio o audio-a-vídeo. El checkpoint publicado en Hugging Face contiene 18.987.859.200 parámetros en pesos `safetensors` y ocupa 185,4 GB en el repositorio.

El modelo pertenece a la familia LTX-2 (también referenciada como LTX-Video o LTXV) y se publica bajo la licencia comunitaria `ltx-2.x-community-license-agreement`, con acceso restringido que exige aceptar las condiciones en Hugging Face. Soporta nueve idiomas declarados (inglés, alemán, español, francés, japonés, coreano, chino, italiano y portugués) y su pipeline principal en `diffusers` es `LTX2Pipeline`.

Su relevancia actual radica en la unificación de generación audiovisual en un único modelo de difusión con control multimodal, lo que simplifica arquitecturas de producción que antes requerían encadenar modelos de vídeo y de audio por separado. La ficha se basa exclusivamente en los metadatos del repositorio y en la información pública disponible; los detalles de entrenamiento y benchmarks no están documentados en las fuentes consultadas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo de difusión multimodal (familia LTX-2); detalles internos no disponibles |
| Parametros totales | 18.987.859.200 (18,99 B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en, de, es, fr, ja, ko, zh, it, pt |
| Licencia | ltx-2.x-community-license-agreement (acceso restringido, gated) |
| Formato de pesos | safetensors (librería diffusers) |
| Tamano del repositorio | 185,4 GB |
| Pipeline diffusers | LTX2Pipeline |
| Modalidades | texto, imagen, vídeo, audio (entrada y salida combinables) |
| Paper | arXiv:2601.03233 |

## Arquitectura y entrenamiento

La información disponible confirma que se trata de un modelo de difusión de la familia LTX-2 con 18,99 mil millones de parámetros, empaquetado para `diffusers` mediante el pipeline `LTX2Pipeline`. Los tags del repositorio revelan un diseño multimodal que abarca generación y transformación entre texto, imagen, vídeo y audio: text-to-video, image-to-video, video-to-video, image-text-to-video, audio-to-video, text-to-audio, video-to-audio, audio-to-audio, text-to-audio-video, image-to-audio-video e image-text-to-audio-video.

No se han publicado en las fuentes consultadas detalles sobre el número de tokens de entrenamiento, la composición del dataset, el uso de RLHF/DPO ni innovaciones técnicas específicas (atención lineal, decodificación especulativa, etc.). El paper referenciado en los metadatos es arXiv:2601.03233, que debería contener la descripción arquitectónica completa, pero su contenido no está incluido en la información proporcionada. Tampoco se documentan los detalles del tokenizador multimodal ni la resolución o duración máximas de vídeo.

## Capacidades

- Generación de vídeo a partir de texto (text-to-video).
- Generación de vídeo a partir de imagen (image-to-video) y transformación de vídeo existente (video-to-video).
- Generación condicionada por imagen y texto simultáneamente (image-text-to-video).
- Generación de audio a partir de texto (text-to-audio) y conversión audio-a-audio.
- Generación de audio condicionada por vídeo (video-to-audio) y generación de vídeo condicionada por audio (audio-to-video).
- Generación conjunta de audio y vídeo desde texto o imagen (text-to-audio-video, image-to-audio-video, image-text-to-audio-video).
- Soporte multilingüe en nueve idiomas: inglés, alemán, español, francés, japonés, coreano, chino, italiano y portugués.
- Integración con el ecosistema `diffusers` mediante `LTX2Pipeline`.
- Tool calling, function calling, agentes y razonamiento multi-paso: no disponible (no es un modelo de lenguaje conversacional).

## Casos de uso

- Producción audiovisual automatizada: generar clips con pista de audio sincronizada a partir de un guion de texto usando text-to-audio-video, eliminando la necesidad de encadenar un modelo de vídeo y otro de audio por separado.
- Doblaje y localización de vídeo: emplear video-to-audio y audio-to-audio para regenerar pistas de voz o ambiente en los nueve idiomas soportados, manteniendo el vídeo original como condición.
- Animación de material gráfico: convertir ilustraciones o fotografías estáticas en vídeo mediante image-to-video, útil en marketing y creación de contenido para redes.
- Posproducción y retoque de metraje: aplicar video-to-video para estilizar, restaurar o modificar secuencias existentes sin regrabar.
- Generación de efectos de sonido y ambiente: usar text-to-audio o video-to-audio para producir pistas de audio coherentes con la escena visual en pipelines de edición.
- Prototipado rápido en estudios creativos: iterar sobre storyboards combinando image-text-to-video para fijar composición y describir movimiento en una sola pasada.
- Sincronización audio-vídeo para publicidad: generar variantes de un anuncio con audio adaptado a partir de una misma base visual mediante audio-to-video.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Con 18,99 B de parámetros, los pesos en precisión de 16 bits requieren aproximadamente 38 GB solo para el modelo; en 8 bits, unos 19 GB, sin contar activaciones ni el codificador/decodificador de vídeo y audio.
- GPU recomendadas: no disponible. Por el tamaño del checkpoint (185,4 GB de repositorio) y el cómputo típico de difusión de vídeo, se requiere hardware de centro de datos; no se documentan modelos concretos.
- Compatibilidad con GPU de consumo: no confirmada. Los pesos completos en 16 bits no caben en GPUs de consumo de 24 GB; haría falta cuantización agresiva no documentada.
- Opciones de despliegue: `diffusers` con `LTX2Pipeline` es la vía oficial indicada. Soporte para vLLM, llama.cpp, Ollama o TGI no está documentado y, dado que no es un modelo de lenguaje, no es de esperar.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone en la información proporcionada de datos de rendimiento ni de especificaciones detalladas de modelos comparables de la misma categoría (difusión multimodal vídeo-audio). La comparación cuantitativa no está disponible.

| Modelo | Parametros | Contexto | Modalidades | Licencia | Acceso |
|---|---|---|---|---|---|
| LTX-2.5-Diffusers | 18,99 B | no disponible | texto, imagen, vídeo, audio | ltx-2.x-community-license-agreement | gated |
| Alternativas de la misma categoría | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Acceso restringido: el repositorio es gated y requiere aceptar la licencia `ltx-2.x-community-license-agreement` en Hugging Face antes de descargar los pesos.
- Licencia no estándar: las condiciones de uso comercial, redistribución y modificación vienen definidas por el acuerdo comunitario de LTX-2.x; deben revisarse antes de integrar el modelo en producción.
- Riesgo de alucinación visual y sonora: como modelo generativo, puede producir contenido incoherente, artefactos temporales o audio desincronizado; no se documentan métricas de fidelidad.
- Sesgos: no se documentan evaluaciones de sesgo en las fuentes consultadas.
- Idiomas: aunque se declaran nueve idiomas, no se especifica el nivel de calidad por idioma ni si el audio generado cubre todos ellos con la misma fidelidad.
- Requisitos de cómputo elevados: 18,99 B de parámetros y un repositorio de 185,4 GB implican infraestructura de GPU profesional; el despliegue en entornos limitados no está documentado.
- Falta de documentación pública en las fuentes consultadas sobre cuantizaciones oficiales, límites de duración/resolución y latencias, lo que dificulta la planificación de capacidad.
- No es un modelo de lenguaje: no soporta tool calling, agentes ni razonamiento textual multi-paso.

## Enlaces

- Hugging Face: https://huggingface.co/Lightricks/LTX-2.5-Diffusers
- Organización Lightricks en Hugging Face: https://huggingface.co/Lightricks
- Paper (referencia en metadatos): arXiv:2601.03233
- Sitio corporativo: https://www.lightricks.com/
- Sobre Lightricks: https://www.lightricks.com/about
- GitHub de Lightricks: https://github.com/Lightricks
- Wikipedia: https://en.m.wikipedia.org/wiki/Lightricks
