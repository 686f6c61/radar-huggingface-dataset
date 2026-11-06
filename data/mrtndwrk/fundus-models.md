# mrtndwrk/fundus-models

## Resumen

`mrtndwrk/fundus-models` no es un modelo de IA entrenado por su autor, sino un repositorio espejo que agrupa copias sin modificar de los ficheros de modelo que descarga la aplicacion Fundus. Su proposito es garantizar la disponibilidad de esos artefactos si los repositorios originales cambian o desaparecen, por lo que funciona como una dependencia empaquetada mas que como un modelo publicable. Cada fichero se almacena bajo una ruta `<sha256>/<nombre de fichero>`, lo que permite verificar la integridad por hash.

El contenido es heterogeneo y abarca varias familias: un modelo de reconocimiento de voz en formato GGML para whisper.cpp, un modelo de embeddings multilingues en ONNX cuantizado a int8, dos componentes de CLIP (vision y texto) en ONNX y safetensors, y un modelo de lenguaje Gemma en formato litertlm. Por tanto, no existe una unica arquitectura, tamano ni contexto asociados al repositorio: cada fichero conserva las caracteristicas del modelo original del que procede.

Es relevante ahora para desarrolladores que integren Fundus o quieran reproducir su pipeline, porque centraliza en un solo repositorio (3,1 GB) artefactos que de otro modo habria que rastrear en cinco repositorios distintos. No obstante, la licencia declarada es "other" y las condiciones reales de cada fichero son las de su origen, lo que obliga a revisar cada licencia por separado antes de reutilizarlos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible como modelo unico; el repositorio agrupa varios artefactos: whisper.cpp (ASR, GGML), E5-small (embeddings, ONNX), CLIP ViT-B/32 (vision-texto, ONNX/safetensors) y Gemma (LLM, litertlm) |
| Parametros totales | No disponible (depende de cada fichero; el autor no publica el desglose) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | q5_1 (whisper), int8 (E5 y CLIP texto), q4 (CLIP vision); el fichero Gemma en litertlm no especifica cuantizacion |
| Idiomas soportados | No disponible de forma agregada; E5-small es multilingue y CLIP texto procede de un modelo multilingue, pero el autor no documenta el conjunto |
| Licencia | other (repositorio); cada fichero conserva su licencia original: MIT, Apache 2.0 |
| Formato de pesos | GGML (.bin), ONNX (.onnx), safetensors (.safetensors), litertlm (.litertlm) |

## Arquitectura y entrenamiento

El repositorio no define arquitectura ni proceso de entrenamiento propios: es una coleccion de artefactos ya entrenados por terceros y copiados sin cambios. Los componentes identificados en la model card son un modelo de reconocimiento automatico del habla de la familia whisper en formato GGML con cuantizacion q5_1, un encoder de frases E5-small convertido a ONNX con cuantizacion int8 y su tokenizer, un par vision-texto basado en CLIP ViT-B/32 (vision en ONNX q4, texto en ONNX int8 y safetensors denso) y un modelo de lenguaje Gemma en formato litertlm para ejecucion en dispositivo.

No hay informacion sobre volumen de tokens de entrenamiento, composicion del dataset, tecnicas de alineacion (RLHF, DPO) ni innovaciones tecnicas introducidas por el autor. Cualquier detalle de entrenamiento debe consultarse en los repositorios originales enlazados en la model card. La unica decision tecnica atribuible al autor es el esquema de almacenamiento por hash SHA-256 y la seleccion de formatos orientados a inferencia local (ONNX, GGML, litertlm).

## Capacidades

- Reconocimiento automatico del habla mediante el fichero whisper en GGML, ejecutable con whisper.cpp.
- Generacion de embeddings de frases multilingues con E5-small en ONNX int8, apto para busqueda semantica y similitud textual.
- Embeddings de imagen y texto con CLIP ViT-B/32, que permiten busqueda cross-modal y clasificacion zero-shot.
- Generacion de texto y razonamiento con el fichero Gemma en formato litertlm, orientado a inferencia en dispositivo.
- Verificacion de integridad de los artefactos mediante rutas basadas en SHA-256.
- No se documenta soporte de tool calling, function calling, agentes, modo thinking, audio adicional ni vision mas alla de CLIP.

## Casos de uso

- Distribucion reproducible de dependencias de IA: un equipo que despliegue Fundus puede fijar este repositorio como origen de los ficheros y evitar que un cambio en el repositorio original rompa la aplicacion, gracias a las rutas por SHA-256.
- Transcripcion de audio en local: el fichero whisper q5_1 permite integrar ASR en escritorio o movil sin depender de servicios en la nube, con un consumo de memoria reducido por la cuantizacion.
- Busqueda semantica multilingue: E5-small int8 se puede cargar con ONNX Runtime para indexar y recuperar documentos en varios idiomas en entornos con recursos limitados.
- Busqueda de imagenes por descripcion textual: el par CLIP vision q4 y texto int8 permite construir un indice vectorial de imagenes y consultarlo con lenguaje natural.
- Clasificacion zero-shot de imagenes: reutilizando los embeddings de CLIP se pueden asignar etiquetas sin entrenamiento adicional, util en catalogacion de contenido.
- Asistente conversacional en dispositivo: el fichero Gemma litertlm esta pensado para ejecutar generacion de texto en local, por ejemplo en funciones de resumen o respuesta dentro de una aplicacion movil.
- Archivado y auditoria de artefactos: el esquema por hash facilita comparar versiones de modelos y detectar sustituciones no deseadas en pipelines de CI.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma agregada; depende del fichero cargado y de su cuantizacion (q4, q5_1, int8).
- GPU recomendadas: no disponibles; los formatos ONNX, GGML y litertlm estan orientados a ejecucion en CPU, GPU de consumo y dispositivos moviles, pero el autor no publica requisitos.
- Compatibilidad con GPU de consumo: previsiblemente si para los componentes cuantizados, aunque no hay confirmacion documentada.
- Opciones de despliegue: whisper.cpp para el fichero GGML, ONNX Runtime para los ficheros ONNX y el runtime de LiteRT para el fichero litertlm; no se mencionan vLLM, TGI ni Ollama.
- Latencia y throughput: no disponibles.
- Espacio en disco: 3,1 GB para el repositorio completo.

## Comparativa con modelos similares

| Repositorio | Contenido | Formatos | Licencia | Disponibilidad |
|---|---|---|---|---|
| mrtndwrk/fundus-models | Copia espejo de varios artefactos para la app Fundus | GGML, ONNX, safetensors, litertlm | other (por fichero: MIT, Apache 2.0) | Hugging Face, 0 descargas |
| ggerganov/whisper.cpp | Modelos whisper convertidos para whisper.cpp | GGML | MIT | Hugging Face |
| Xenova/multilingual-e5-small | E5-small convertido a ONNX | ONNX | MIT | Hugging Face |
| Xenova/clip-vit-base-patch32 | CLIP ViT-B/32 convertido a ONNX | ONNX | MIT | Hugging Face |

La comparativa se limita a los repositorios de origen citados por el autor; no se dispone de datos de rendimiento para contrastar.

## Limitaciones y advertencias

- No es un modelo entrenado ni evaluado por el autor: no hay benchmarks, ficha de sesgos ni documentacion de calidad.
- La licencia del repositorio es "other"; el uso comercial exige revisar la licencia de cada fichero original (MIT y Apache 2.0 segun la model card) y sus condiciones de atribucion.
- El fichero Gemma procede de `litert-community/gemma-4-E2B-it-litert-lm` con licencia declarada Apache 2.0 en la model card, pero conviene verificar las condiciones del modelo Gemma original, que pueden incluir terminos de uso adicionales.
- Riesgo de desactualizacion: al ser copias sin modificar, no reciben mejoras ni correcciones de los repositorios originales.
- Sin informacion sobre sesgos, alucinacion, cobertura idiomatica ni limites de contexto.
- El repositorio tiene 0 descargas y 0 likes, por lo que no hay evidencia de uso ni validacion por la comunidad.
- La fecha de creacion indicada (2026-10-30) es futura respecto a la informacion habitual de Hugging Face; conviene confirmar la metadata antes de depender de ella.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/mrtndwrk/fundus-models
- whisper.cpp (origen del fichero GGML): https://huggingface.co/ggerganov/whisper.cpp
- multilingual-e5-small (origen de los ficheros E5): https://huggingface.co/Xenova/multilingual-e5-small
- clip-vit-base-patch32 (origen de los ficheros CLIP): https://huggingface.co/Xenova/clip-vit-base-patch32
- openai/clip-vit-base-patch32 (modelo CLIP original): https://huggingface.co/openai/clip-vit-base-patch32
- clip-ViT-B-32-multilingual-v1 (origen del texto CLIP): https://huggingface.co/sentence-transformers/clip-ViT-B-32-multilingual-v1
- gemma-4-E2B-it-litert-lm (origen del fichero Gemma): https://huggingface.co/litert-community/gemma-4-E2B-it-litert-lm
