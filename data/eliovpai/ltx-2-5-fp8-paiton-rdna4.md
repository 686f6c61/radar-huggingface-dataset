# EliovpAI/LTX-2.5-FP8-Paiton-RDNA4

## Resumen

LTX-2.5-FP8-Paiton-RDNA4 es una cuantizacion en FP8 del modelo base Lightricks/LTX-2.5, publicada por el usuario EliovpAI en Hugging Face. Se trata de un modelo de generacion de video (text-to-video, image-to-video y text-to-audio-video) derivado del modelo multimodal de Lightricks, adaptado especificamente para su ejecucion en GPUs AMD con arquitectura RDNA4 mediante el stack ROCm y el formato "Paiton". El repositorio, de 37,8 GB, esta pensado para desarrolladores que quieran desplegar generacion de video en hardware AMD consumer o profesional sin recurrir a CUDA.

La relevancia de esta ficha radica en que las cuantizaciones FP8 para video generativo siguen siendo escasas, y mas aun las orientadas a ROCm y RDNA4, un ecosistema tradicionalmente desatendido por las herramientas de inferencia mas populares. El modelo hereda las capacidades del LTX-2.5 original (generacion de video con audio sincronizado, condicionamiento por imagen y texto) pero con un footprint reducido gracias a la precision FP8.

No obstante, la informacion publica disponible es muy limitada: el repositorio no incluye una model card detallada, no se han publicado benchmarks y el acceso esta restringido (gated), por lo que muchos parametros tecnicos deben marcarse como "no disponible". Esta ficha se limita a lo que puede inferirse de los metadatos y del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base LTX-2.5 de Lightricks; arquitectura exacta no publicada en la informacion) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | FP8 (cuantizacion del modelo base a 8 bits en coma flotante) |
| Idiomas soportados | no disponible |
| Licencia | ltx-2.x-community-license-agreement (acceso restringido, requiere aceptar condiciones) |
| Formato de pesos | no disponible (repo de 37,8 GB; no se especifica safetensors, GGUF ni otro contenedor) |

## Arquitectura y entrenamiento

No se dispone de informacion detallada sobre la arquitectura interna del modelo en la informacion proporcionada. El modelo es una cuantizacion FP8 del base_model Lightricks/LTX-2.5, un modelo de generacion de video de Lightricks. La etiqueta "Paiton" y el sufijo "RDNA4" indican que esta version esta empaquetada y optimizada para su ejecucion en GPUs AMD con arquitectura RDNA4 bajo ROCm, aunque no se detalla el metodo exacto de conversion ni las tecnicas de calibracion empleadas.

Tampoco se especifican los datos de entrenamiento (numero de tokens, composicion del dataset, uso de RLHF/DPO) ni innovaciones tecnicas como decodificacion especulativa o atencion lineal. Toda esta informacion debe consultarse en la model card del modelo base Lightricks/LTX-2.5, que no forma parte de la informacion proporcionada. La unica innovacion verificable es la propia cuantizacion FP8 orientada a ROCm/RDNA4.

## Capacidades

- Generacion de video a partir de texto (text-to-video), segun el pipeline declarado.
- Generacion de video a partir de imagen (image-to-video), segun los tags del repositorio.
- Generacion conjunta de video y audio a partir de texto (text-to-audio-video), segun los tags.
- Cuantizacion FP8 para reducir requisitos de memoria frente al modelo base en precision completa.
- Ejecucion en GPUs AMD RDNA4 mediante ROCm (objetivo declarado por el autor).
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible.

## Casos de uso

- Prototipado de video generativo en hardware AMD: el modelo permite a desarrolladores con GPUs RDNA4 (por ejemplo, tarjetas de la familia Radeon RX 9000) experimentar con generacion de video sin depender de CUDA, usando ROCm y los pesos FP8 para ajustar el consumo de VRAM.
- Generacion de clips cortos para marketing y redes sociales: a partir de un prompt de texto o una imagen de referencia, el modelo puede producir video con audio sincronizado, adecuado para storyboards rapidos o contenido promocional de baja resolucion.
- Previsualizacion de escenas en pipelines de produccion audiovisual: los equipos pueden generar borradores de planos (image-to-video) antes de rodar, reduciendo costes de preproduccion.
- Creacion de contenido para videojuegos y entornos interactivos: generacion de animaciones o transiciones a partir de texto para prototipos de assets.
- Investigacion en generacion multimodal video-audio: el modelo sirve como base para estudiar la sincronizacion audio-video y el efecto de la cuantizacion FP8 en la calidad perceptual.
- Despliegue en entornos con restricciones de memoria: la version FP8 reduce el footprint frente al modelo base, lo que facilita su ejecucion en estaciones de trabajo con VRAM limitada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible con precision; el repositorio ocupa 37,8 GB, por lo que se requiere al menos esa cantidad de memoria para cargar los pesos completos, mas el overhead de activaciones y buffers de video.
- GPU recomendadas: GPUs AMD con arquitectura RDNA4 (objetivo declarado del empaquetado); no se especifican modelos concretos.
- Compatibilidad con GPU consumer: el modelo esta orientado a RDNA4, que incluye tarjetas consumer de AMD, pero no se confirma que quepa en modelos concretos.
- Opciones de despliegue: ROCm como stack de computo; no se especifican frameworks de inferencia (vLLM, llama.cpp, Ollama, TGI) compatibles con este modelo de video.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tipo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| LTX-2.5-FP8-Paiton-RDNA4 | no disponible | no disponible | Text/image-to-video con audio, FP8 para ROCm | ltx-2.x-community-license-agreement | Gated en Hugging Face |
| Lightricks/LTX-2.5 (base) | no disponible | no disponible | Text/image-to-video con audio | ltx-2.x-community-license-agreement | Hugging Face |
| Alternativas de video generativo (p. ej. modelos de la familia LTX previa) | no disponible | no disponible | Text-to-video | varía | varía |

No se dispone de datos suficientes para una comparativa cuantitativa con modelos alternativos de la misma categoria.

## Limitaciones y advertencias

- Acceso restringido: el repositorio es gated y requiere aceptar la licencia ltx-2.x-community-license-agreement en Hugging Face antes de descargar los pesos.
- Licencia "other": las condiciones de uso comercial dependen del acuerdo de licencia comunitario de LTX 2.x, que debe revisarse antes de cualquier despliegue en produccion.
- Cuantizacion FP8: la reduccion de precision puede degradar la calidad visual o la coherencia temporal del video frente al modelo base; no se han publicado evaluaciones que cuantifiquen esta perdida.
- Ecosistema limitado: el empaquetado esta orientado a ROCm y RDNA4, por lo que la compatibilidad con otras GPUs o frameworks no esta garantizada.
- Falta de documentacion: no hay model card detallada, benchmarks ni guia de uso, lo que dificulta la evaluacion rigurosa y la reproducibilidad.
- Riesgo de sesgos y alucinaciones visuales: como todo modelo generativo de video, puede producir contenido incoherente, artefactos o representaciones sesgadas; no se documentan mitigaciones.
- Idiomas soportados: no disponible; se desconoce el comportamiento multilingue de los prompts.
- Poca traccion: el repositorio registra 3 descargas y 1 like en el momento de la consulta, lo que sugiere una validacion comunitaria minima.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/EliovpAI/LTX-2.5-FP8-Paiton-RDNA4
- Modelo base: https://huggingface.co/Lightricks/LTX-2.5
