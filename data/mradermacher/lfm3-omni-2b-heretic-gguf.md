# mradermacher/LFM3-Omni-2B-heretic-GGUF

## Resumen

LFM3-Omni-2B-heretic-GGUF es la version cuantizada en formato GGUF del modelo rodrigomt/LFM3-Omni-2B-heretic, un derivado "abliterado" (uncensored) del modelo multimodal LFM3-Omni-2B de Liquid AI. El modelo original combina capacidades de texto, vision, reconocimiento de voz, sintesis de voz y clonacion de voz (speech-to-speech) en un unico modelo de aproximadamente 1.730 millones de parametros. Esta version GGUF, producida por mradermacher, esta pensada para despliegue en hardware de consumo y entornos edge mediante llama.cpp y herramientas compatibles.

El modelo base pertenece a la familia LFM3 (Liquid Foundation Models 3) de Liquid AI, disenada para despliegue eficiente en dispositivos con recursos limitados. La variante "heretic" indica que ha sido sometida a un proceso de ablation (eliminacion de direcciones de rechazo) para reducir las negativas del modelo a responder, lo que lo hace "uncensored". El pipeline declarado en Hugging Face es text-to-speech, aunque el modelo cubre multiples modalidades.

Su relevancia actual radica en que ofrece un modelo omni-modal (texto, audio y vision) de tamano reducido con cuantizaciones que van desde 0,9 GB (Q2_K) hasta 3,6 GB (f16), lo que permite ejecutarlo en GPUs de consumo y sistemas embebidos. La licencia es lfm1.0 (Liquid Foundation Model License), que impone restricciones de uso comercial que deben revisarse antes de desplegarlo en produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (LFM3-Omni); detalles internos no disponibles |
| Parametros totales | 1.728.801.600 (aprox. 1,73 B) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16, mmproj-Q8_0, mmproj-f16 |
| Idiomas soportados | en, ar, zh, fr, de, it, ja, ko, pt, es, vi, th, id, hi, ru, pl, da, el, fi, he, nl, sv, tr (23 idiomas) |
| Licencia | lfm1.0 (Liquid Foundation Model License) |
| Formato de pesos | GGUF (safetensors en el modelo base) |

## Arquitectura y entrenamiento

La informacion disponible no detalla la arquitectura interna del modelo base LFM3-Omni-2B. Se sabe que pertenece a la familia LFM3 de Liquid AI, orientada a despliegue eficiente en edge, y que es un modelo multimodal que integra procesamiento de texto, vision y audio (reconocimiento de voz, sintesis de voz y speech-to-speech). El modelo incluye un componente mmproj (multi-modal projection) que actua como suplemento multimodal en los ficheros GGUF.

Respecto al entrenamiento, no se dispone de datos sobre numero de tokens, composicion del dataset ni si se aplicaron tecnicas de RLHF o DPO. La variante "heretic" implica un proceso de ablation posterior al entrenamiento base, orientado a eliminar el comportamiento de rechazo (refusal) del modelo. Esta tecnica, conocida como abliteration, modifica los pesos para reducir la tendencia a negarse a responder ciertas peticiones. No se especifican los detalles tecnicos de dicho proceso en la informacion proporcionada.

## Capacidades

- Generacion de texto y conversacion multi-turno (tag "conversational").
- Procesamiento de vision (tag "vision").
- Reconocimiento de voz o speech recognition (tag "speech-recognition").
- Sintesis de voz o text-to-speech (pipeline declarado: text-to-speech).
- Speech-to-speech (conversion de voz a voz).
- Clonacion de voz (tag "voice-cloning").
- Capacidades omni-modales combinadas (tag "omni").
- Soporte multilingue en 23 idiomas, incluido el espanol.
- Comportamiento "uncensored" por la ablation aplicada.
- Orientado a despliegue en edge (tag "edge").
- No se especifica soporte explicito de tool calling ni de agentes multi-paso en la informacion disponible.

## Casos de uso

- Asistentes de voz en dispositivos edge: el modelo puede ejecutarse en hardware de consumo gracias a sus cuantizaciones de 1-2 GB, permitiendo asistentes conversacionales por voz locales sin conexion a la nube, con speech-to-speech integrado.
- Transcripcion y respuesta hablada en tiempo real: combinando speech recognition y text-to-speech, puede construir interfaces de voz bidireccionales para aplicaciones de accesibilidad o kioscos interactivos.
- Clonacion de voz para sintesis personalizada: la capacidad de voice cloning permite generar voces sinteticas a partir de muestras, util en doblaje, audiolibros o avatares.
- Procesamiento multimodal de documentos con imagen y audio: al combinar vision y texto, puede describir imagenes o responder preguntas sobre contenido visual en aplicaciones de soporte.
- Prototipado rapido de aplicaciones conversacionales multilingues: con 23 idiomas soportados, sirve para experimentar con chatbots en distintos mercados sin reentrenamiento.
- Investigacion en seguridad y alineacion: al ser una variante "heretic" (abliterada), es util para estudiar el comportamiento de modelos sin rechazo y evaluar riesgos de desalineacion en entornos controlados.
- Despliegue en sistemas embebidos y Raspberry Pi: las cuantizaciones Q2_K (0,9 GB) y Q3 permiten ejecucion en dispositivos con poca memoria mediante llama.cpp.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 1 GB con Q2_K (0,9 GB de fichero), 1,2-1,4 GB con Q4_K_M, 1,9 GB con Q8_0 y 3,6 GB con f16. Hay que anadir el componente mmproj (0,6-1,0 GB) si se usan capacidades multimodales.
- GPU recomendadas: cualquier GPU consumer con 4 GB o mas de VRAM puede ejecutar las cuantizaciones bajas; una RTX 3060/4060 o superior permite Q8_0 con holgura. Para despliegue en servidor, A100 o H100 no son necesarias dado el tamano reducido.
- Cabe en GPU consumer: si, en practicamente cualquier GPU dedicada moderna (GTX 1060 6 GB en adelante) e incluso en GPUs integradas con memoria compartida suficiente.
- Opciones de despliegue: llama.cpp, Ollama, y herramientas compatibles con GGUF. El modelo base usa transformers con custom_code. Se dispone de cuantizaciones con imatrix en el repositorio mradermacher/LFM3-Omni-2B-heretic-i1-GGUF.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Modalidades | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| LFM3-Omni-2B-heretic (este) | 1,73 B | no disponible | Texto, vision, audio (TTS/ASR/clonacion) | lfm1.0 | GGUF en HF |
| LFM3-Omni-2B (original) | no disponible | no disponible | Texto, vision, audio | lfm1.0 | HF |
| Modelos omni de 2B comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de rendimiento ni de especificaciones detalladas de modelos alternativos en la informacion proporcionada para establecer una comparativa cuantitativa fiable.

## Limitaciones y advertencias

- Al ser una variante "heretic" (abliterada), el modelo puede generar contenido que el modelo original rechazaria; no es adecuado para aplicaciones orientadas al publico sin filtros adicionales.
- Riesgo de alucinacion inherente a modelos de este tamano, especialmente en tareas de razonamiento complejo o factualidad.
- La licencia lfm1.0 (Liquid Foundation Model License) impone restricciones que deben revisarse antes de cualquier uso comercial; no es una licencia permisiva tipo Apache o MIT.
- No se dispone de informacion sobre la longitud de contexto, lo que limita la planificacion de casos de uso con documentos largos.
- El proceso de cuantizacion a formatos bajos (Q2_K, Q3) degrada la calidad; para produccion se recomienda Q4_K_M o superior.
- Las capacidades multimodales requieren el fichero mmproj adicional, que anade consumo de memoria.
- La calidad de la clonacion de voz y del TTS no esta documentada con metricas; debe evaluarse empiricamente.
- El modelo es un derivado de terceros (rodrigomt) sobre el modelo de Liquid AI; no cuenta con el respaldo oficial del desarrollador original.
- No se especifica soporte de tool calling ni de agentes, lo que limita su uso en pipelines automatizados complejos.

## Enlaces

- Modelo GGUF en Hugging Face: https://huggingface.co/mradermacher/LFM3-Omni-2B-heretic-GGUF
- Modelo base: https://huggingface.co/rodrigomt/LFM3-Omni-2B-heretic
- Cuantizaciones con imatrix: https://huggingface.co/mradermacher/LFM3-Omni-2B-heretic-i1-GGUF
- Pagina de descargas del autor: https://hf.tst.eu/model#LFM3-Omni-2B-heretic-GGUF
- Solicitudes de modelos del autor: https://huggingface.co/mradermacher/model_requests
- Referencia de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Analisis de cuantizaciones (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
