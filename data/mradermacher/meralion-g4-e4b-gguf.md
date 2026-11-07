# mradermacher/MERaLiON-G4-E4B-GGUF

## Resumen

MERaLiON-G4-E4B es un modelo multimodal de tipo imagen, audio y vídeo a texto, orientado al sudeste asiático, desarrollado por zzlynxSG. Se obtiene mediante post-entrenamiento de google/gemma-4-E4B-it (Gemma 4 E4B-IT) con ajuste fino supervisado seguido de alineamiento cultural basado en GRPO. El modelo resuelve tareas de comprensión multimodal (visión, habla y ASR) con especial énfasis en idiomas y contextos culturales del sudeste asiático.

La ficha que nos ocupa corresponde a la versión cuantizada en GGUF publicada por mradermacher, que facilita el despliegue local mediante llama.cpp y herramientas compatibles. El repositorio contiene cuantizaciones estáticas desde Q2_K hasta Q8_0, además de los ficheros mmproj necesarios para las capacidades multimodales.

El modelo tiene 7.463.013.674 parámetros totales según los safetensors del modelo base y una licencia de solo investigación (research-only), lo que restringe su uso comercial. Está disponible en inglés, chino, indonesio, malayo, tailandés y tamil.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (visión-lenguaje-audio) derivado de Gemma 4 E4B-IT; no se detalla la arquitectura interna en la información disponible |
| Parametros totales | 7.463.013.674 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16 (más mmproj Q8_0 y f16) |
| Idiomas soportados | en, zh, id, ms, th, ta |
| Licencia | research-only (other) |
| Formato de pesos | GGUF (cuantizado); pesos originales en safetensors en el modelo base |

## Arquitectura y entrenamiento

El modelo parte de google/gemma-4-E4B-it y se post-entrena mediante ajuste fino supervisado seguido de alineamiento cultural con GRPO (Group Relative Policy Optimization), un método de aprendizaje por refuerzo. La model card del autor original indica que el objetivo es adaptar el modelo a contextos culturales y lingüísticos del sudeste asiático, e incluye etiquetas de multimodal, vision-language, audio, speech y asr.

No se especifican en la información disponible el número de tokens de entrenamiento, la composición exacta del dataset ni detalles de la arquitectura interna (número de capas, dimensiones, mecanismo de atención). La versión publicada por mradermacher es una conversión estática a GGUF sin cuantizaciones ponderadas/imatrix, según indica el propio autor de la cuantización.

## Capacidades

- Generación de texto conversacional a partir de entradas multimodales (imagen, audio y vídeo).
- Comprensión de imágenes (vision-language).
- Procesamiento de audio y habla, incluyendo reconocimiento automático del habla (ASR).
- Entrada de vídeo a texto según la descripción del modelo base.
- Soporte multilingüe en inglés, chino, indonesio, malayo, tailandés y tamil.
- Alineamiento cultural orientado al sudeste asiático gracias al post-entrenamiento con GRPO.
- No se documenta en la información disponible soporte explícito de tool calling, function calling ni modo de razonamiento extendido (thinking mode).

## Casos de uso

- Transcripción y comprensión de audio en idiomas del sudeste asiático: el modelo incorpora capacidades de ASR y está entrenado para indonesio, malayo, tailandés y tamil, lo que permite transcribir y resumir reuniones o llamadas en estos idiomas.
- Análisis de imágenes con contexto cultural local: útil para moderación de contenido, catalogación de productos o descripción de imágenes en mercados del sudeste asiático, donde los modelos genéricos rinden peor.
- Procesamiento de vídeo a texto: generación de subtítulos, resúmenes o descripciones de vídeos en los idiomas soportados.
- Investigación académica en multimodalidad y alineamiento cultural: al tener licencia research-only, es adecuado para experimentos de evaluación de sesgos culturales y comparativas de alineamiento con GRPO.
- Asistentes conversacionales multilingües para investigación: despliegue local con llama.cpp para prototipos de atención al cliente en indonesio, malayo o tailandés.
- Evaluación de cuantizaciones: el repositorio ofrece un abanico amplio de cuantizaciones (Q2_K a Q8_0) que permite estudiar el impacto de la compresión en tareas multimodales.
- Prototipos de accesibilidad: descripción de imágenes y audio para usuarios con discapacidad visual en los idiomas cubiertos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia según cuantización: Q2_K ~4,5 GB; Q4_K_M ~5,4 GB; Q6_K ~6,3 GB; Q8_0 ~8,1 GB; f16 ~15,0 GB. Añadir ~0,7-1,1 GB para el fichero mmproj multimodal.
- GPU recomendadas: RTX 3060 12 GB o RTX 4060 Ti 16 GB para cuantizaciones Q4-Q8; A100/H100 no necesarias para este tamaño.
- Cabe en GPU de consumo: sí, desde Q4_K_M en GPUs con 8 GB o más de VRAM; Q8_0 requiere ~10 GB incluyendo mmproj.
- Opciones de despliegue: llama.cpp (formato GGUF nativo), Ollama y otros frontends compatibles con GGUF; los tags indican endpoints_compatible.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Multimodal | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| MERaLiON-G4-E4B (este) | 7,46 B | no disponible | Imagen, audio, vídeo | research-only | GGUF en HF |
| google/gemma-4-E4B-it (base) | no disponible | no disponible | Imagen/texto (según base) | según Gemma | HF |
| Alternativas multimodales de tamaño similar | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de benchmarks que permitan una comparación cuantitativa con alternativas.

## Limitaciones y advertencias

- Licencia research-only: no permite uso comercial; cualquier despliegue en producción requiere revisar el enlace de licencia del modelo base.
- Riesgo de alucinación inherente a los modelos generativos, especialmente en tareas de ASR y descripción de imágenes con audio o vídeo de baja calidad.
- Cobertura lingüística limitada a seis idiomas (en, zh, id, ms, th, ta); el rendimiento en otros idiomas no está garantizado.
- No se documentan la longitud de contexto ni el soporte de tool calling, lo que limita su uso en agentes complejos.
- Las cuantizaciones Q2_K y Q3_K_M pueden degradar notablemente la calidad; el autor recomienda Q4_K_S/Q4_K_M o superiores.
- No hay cuantizaciones ponderadas/imatrix publicadas por el autor de la cuantización, lo que puede afectar a la calidad frente a otras variantes.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que la validación comunitaria es nula.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/MERaLiON-G4-E4B-GGUF
- Modelo base: https://huggingface.co/zzlynxSG/MERaLiON-G4-E4B
- Licencia del modelo base: https://huggingface.co/zzlynxSG/MERaLiON-G4-E4B/blob/main/LICENSE
- Página de descargas del cuantizador: https://hf.tst.eu/model#MERaLiON-G4-E4B-GGUF
- Solicitudes de cuantización: https://huggingface.co/mradermacher/model_requests
- Guía de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Notas sobre cuantizaciones (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
