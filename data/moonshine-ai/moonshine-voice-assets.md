# moonshine-ai/moonshine-voice-assets

## Resumen

Moonshine Voice assets es un repositorio de artefactos de inferencia publicado por moonshine-ai en Hugging Face, no un modelo único. Contiene los 438 ficheros (7,26 GB según la model card; 10,4 GB de tamaño total del repo en el Hub) que los SDK de Moonshine Voice descargan en tiempo de ejecución desde `download.moonshine.ai`, con la jerarquía de carpetas del CDN preservada para que cada ruta del repositorio corresponda exactamente con una URL del CDN. El repositorio funciona como espejo de archivo y verificación: permite responder de forma inequívoca qué ficheros usa realmente la librería, algo que no era posible listando el bucket de origen, que también aloja fuentes sin convertir, copias obsoletas en rutas antiguas y artefactos de build ajenos.

El contenido se divide en dos áreas: `model/` (66 ficheros, 4,78 GB) con codificadores y decodificadores de reconocimiento de voz para cada idioma y arquitectura publicados, variantes de streaming, el modelo de deletreo en inglés, decodificadores opcionales de marcas temporales por palabra, variantes de embeddings de texto EmbeddingGemma y modelos de diarización de hablantes; y `tts/` (372 ficheros, 2,48 GB) con voces Kokoro y Piper, vocoders y datos de grafema a fonema (diccionarios, tablas de heterónimos, tokenizadores) para cada idioma soportado.

La relevancia de este repositorio es operativa: los SDK siguen descargando desde el CDN en tiempo de ejecución, y este espejo sirve para archivar, auditar y verificar integridad. Incluye dos inventarios en la raíz, `FILES.tsv` (ruta, tamaño, md5 y/o CRC32C reportados por el CDN) y `TRANSFER_REPORT.tsv` (ruta, tamaño y sha256 calculados durante la copia), lo que permite verificar la copia del Hub con independencia del CDN. La lista de ficheros no es curada a mano ni un glob del bucket: se enumera desde el catálogo de modelos compilado a través de la API C, recorriendo cada combinación que un llamador podría solicitar.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Conjunto heterogéneo de artefactos: codificadores/decodificadores de speech-to-text, vocoders TTS, modelos de embeddings de texto y modelos de diarización de hablantes, en formato OnnxRuntime `.ort` |
| Parametros totales | no disponible (repositorio con múltiples modelos; no se publican recuentos por modelo) |
| Parametros activos | no aplica (no se describe ningún modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Variantes cuantizadas presentes en las rutas (p. ej. `model/base-ar/quantized/base-ar/`); no se detallan los esquemas de cuantización empleados |
| Idiomas soportados | Catálogo multiidioma de STT y TTS; el inglés dispone de modelo de deletreo. La lista concreta de idiomas no está disponible en la información proporcionada |
| Licencia | Mixta (`license: other`, `mixed-see-licensing-section`): modelos STT de inglés bajo MIT; modelos de otros idiomas bajo Moonshine Community License (no comercial); voces TTS y datos G2P según Kokoro, Piper y las fuentes de diccionarios por idioma; EmbeddingGemma bajo términos de Gemma de Google |
| Formato de pesos | `.ort` (OnnxRuntime, mapeable en memoria); ficheros JSON de configuración de voces Piper (`*.onnx.json`); TSV de inventario (`FILES.tsv`, `TRANSFER_REPORT.tsv`) |

## Arquitectura y entrenamiento

El repositorio no documenta el entrenamiento de los modelos que aloja; su model card se centra en la composición y el propósito del conjunto de artefactos. Los ficheros de STT se distribuyen como conversiones `.ort` para OnnxRuntime, que la librería carga mediante mapeo en memoria; las fuentes ONNX sin convertir (`.onnx`, `.onnx_data`) se excluyen deliberadamente porque son entradas de build y no activos distribuidos. Los ficheros `*.onnx.json` de Piper sí se incluyen pese al nombre, ya que son configuraciones JSON pequeñas sin las cuales las voces no cargan.

La selección de ficheros se deriva del catálogo de modelos compilado, consultado a través de la API C, recorriendo cada idioma y arquitectura del catálogo STT con `include_spelling` y `word_timestamps` para cubrir los grupos opcionales, cada modelo de embeddings y variante de cuantización, las dependencias de diarización y las dependencias TTS de cada idioma del catálogo, una vez por voz disponible en ese idioma. De los 801 objetos del bucket de servicio, 363 quedan fuera por no estar referenciados por ningún manifiesto, incluidas copias obsoletas en rutas antiguas (por ejemplo, los manifiestos apuntan a `model/base-ar/quantized/base-ar/` mientras quedan copias planas en `model/base-ar/`) y artefactos de plataforma como la imagen de disco para Raspberry Pi, APKs de Android e instaladores de escritorio.

## Capacidades

- Reconocimiento de voz (speech-to-text) para cada idioma y arquitectura del catálogo, con variantes de streaming para transcripción incremental.
- Deletreo en inglés mediante un modelo específico (`include_spelling`).
- Marcas temporales por palabra mediante decodificadores opcionales (`word_timestamps`).
- Síntesis de voz (text-to-speech) con voces Kokoro y Piper, con vocoders y datos de grafema a fonema por idioma.
- Diarización de hablantes (identificación de quién habla en cada segmento).
- Embeddings de texto mediante variantes de EmbeddingGemma, con distintas cuantizaciones.
- Ejecución en dispositivo: los artefactos están pensados para inferencia local vía OnnxRuntime, incluido WebAssembly en navegador según la web del proyecto.
- Soporte de tool calling, agentes, razonamiento multi-paso, visión o audio generativo: no disponible en la información proporcionada.

## Casos de uso

- Transcripción en tiempo real en aplicaciones de voz: las variantes de streaming del catálogo STT permiten alimentar audio por fragmentos y obtener texto incremental, adecuado para subtitulado en directo y asistentes conversacionales.
- Dictado y notas de voz en dispositivo: los artefactos `.ort` mapeables en memoria y la orientación on-device permiten transcribir sin enviar audio a un servidor, útil en aplicaciones de productividad con requisitos de privacidad.
- Generación de subtítulos con marcas temporales: los decodificadores opcionales de `word_timestamps` habilitan alineación por palabra para subtitulado y edición de vídeo.
- Diarización en reuniones y entrevistas: los modelos de diarización incluidos permiten segmentar una grabación por hablante antes o después de la transcripción, para actas y análisis de conversaciones.
- Lectura en voz alta y accesibilidad: las voces Kokoro y Piper con sus datos G2P permiten convertir texto en audio en local para lectores de pantalla y aplicaciones de accesibilidad.
- Búsqueda semántica y recuperación sobre transcripciones: las variantes de EmbeddingGemma incluidas permiten indexar el texto transcrito y construir búsqueda por similitud sin depender de servicios externos.
- Archivado y auditoría de dependencias: los inventarios `FILES.tsv` y `TRANSFER_REPORT.tsv` permiten verificar integridad (md5, CRC32C, sha256) de los activos desplegados en una organización y fijar versiones reproducibles.
- Espejo para entornos sin acceso al CDN: descargar un subconjunto con `hf download --include "model/base-en/**"` permite preparar despliegues en redes restringidas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible. Depende del modelo concreto dentro del repositorio; el conjunto completo ocupa 7,26 GB en disco, pero la inferencia carga solo los ficheros del idioma y la tarea solicitados.
- GPU recomendadas: no disponible en la información proporcionada.
- Ejecución en GPU de consumo: no disponible. El diseño on-device y el uso de OnnxRuntime con ficheros `.ort` mapeables en memoria sugieren despliegue en CPU y dispositivos de borde, pero no se publican requisitos mínimos.
- Opciones de despliegue: SDK de Moonshine Voice (descarga desde `download.moonshine.ai`), runtime OnnxRuntime, y WebAssembly en navegador según la web del proyecto. Compatibilidad con vLLM, llama.cpp, Ollama o TGI: no aplica ni está disponible, al no tratarse de pesos de un LLM en safetensors o GGUF.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Moonshine Voice assets | Conjunto de activos STT, TTS, diarización y embeddings en `.ort` | no disponible | no disponible | Mixta (MIT para STT inglés; no comercial para otros idiomas; términos de terceros para TTS y embeddings) | Hugging Face (espejo) y CDN `download.moonshine.ai` |
| Whisper (OpenAI) | Modelo STT | no disponible en esta ficha | no disponible en esta ficha | no disponible en esta ficha | no disponible en esta ficha |
| Piper | TTS | no disponible en esta ficha | no aplica | no disponible en esta ficha | no disponible en esta ficha |

No se dispone de datos verificados en la información proporcionada para comparar parámetros, contexto o rendimiento con alternativas; la comparación anterior se limita a categoría y disponibilidad.

## Limitaciones y advertencias

- No es un modelo único: es un repositorio de activos. Cualquier evaluación de calidad, sesgos o rendimiento debe hacerse sobre el modelo concreto que se vaya a usar, no sobre el repositorio en conjunto.
- Licencia mixta y restrictiva en parte: los modelos STT de idiomas distintos del inglés están bajo Moonshine Community License, no comercial. El uso comercial requiere revisar los términos aplicables a cada fichero.
- TTS y datos G2P sujetos a los términos de Kokoro, Piper y las fuentes de diccionarios por idioma; EmbeddingGemma sujeto a los términos de Gemma de Google. No hay una licencia única para el repositorio.
- Los SDK descargan desde el CDN en tiempo de ejecución; este repositorio es un espejo de archivo y verificación y no cambia el modo en que la librería obtiene los modelos.
- Riesgo de deriva entre espejo y CDN: la model card afirma que el conjunto se deriva del catálogo compilado y no puede desviarse de lo que descarga la librería, pero la verificación debe hacerse contra `FILES.tsv` y `TRANSFER_REPORT.tsv` en cada actualización.
- Exclusión deliberada de artefactos de plataforma (imagen de Raspberry Pi, APKs, instaladores de escritorio) y de fuentes ONNX sin convertir: quien necesite esos elementos no los encontrará aquí.
- Idiomas concretos soportados, sesgos por idioma, tasas de alucinación en transcripción y límites de longitud de audio: no disponibles en la información proporcionada.
- Fecha de creación del repositorio (2026-08-02) y última actualización (2026-11-08) según los metadatos del Hub; conviene comprobar la versión vigente antes de fijar dependencias en producción.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/moonshine-ai/moonshine-voice-assets
- Repositorio del SDK en GitHub: https://github.com/moonshine-ai/moonshine
- Sección de licencia del README principal: https://github.com/moonshine-ai/moonshine#license
- Datos TTS y licencias por voz: https://github.com/moonshine-ai/moonshine/blob/main/core/moonshine-tts/data/README.md
- Demos on-device del proyecto: https://www.moonshine.ai/
- CDN de descarga en tiempo de ejecución: https://download.moonshine.ai
