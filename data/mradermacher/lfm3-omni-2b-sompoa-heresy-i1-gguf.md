# mradermacher/LFM3-Omni-2B-SOMPOA-heresy-i1-GGUF

## Resumen

LFM3-Omni-2B-SOMPOA-heresy-i1-GGUF es una cuantizacion GGUF del modelo MuXodious/LFM3-Omni-2B-SOMPOA-heresy, una variante "abliterated" (decensored) del modelo omni de Liquid AI, que combina procesamiento de audio, vision y texto en una arquitectura compacta disenada para despliegue en el borde (edge). El modelo original pertenece a la familia LFM3 de Liquid AI, una arquitectura propietaria con soporte de codigo personalizado en transformers, orientada a conversacion speech-to-speech con una ventana de contexto propia de la familia (no especificada en la informacion disponible).

Esta version concreta, publicada por mradermacher, aplica cuantizacion con imatrix (importancia matricial) sobre los pesos del modelo base, generando un amplio conjunto de variantes de cuantizacion que van desde IQ1_S hasta Q6_K, lo que permite ajustar el equilibrio entre calidad y huella de memoria. El modelo base incluye la etiqueta "heretic"/"abliterated", lo que indica que se han eliminado o reducido los mecanismos de rechazo del modelo original, un aspecto relevante para usos creativos o de investigacion, pero con implicaciones eticas y de seguridad que deben considerarse.

Con aproximadamente 1.728 millones de parametros (1,73B) y capacidades multimodales (audio, vision y texto), el modelo es relevante para desarrolladores que necesitan un modelo omni pequeno ejecutable en hardware de consumo, con soporte para multiples idiomas y un ecosistema de cuantizaciones maduro para llama.cpp y derivados. La licencia lfm1.0 impone restricciones que deben revisarse antes de un uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (omni: audio, vision, texto), codigo personalizado en transformers; detalles internos no disponibles |
| Parametros totales | 1.728.801.600 (aprox. 1,73B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada |
| Tipos de cuantizacion | IQ1_S, IQ1_M, IQ2_XXS, IQ2_XS, IQ2_S, IQ2_M, IQ3_XXS, IQ3_XS, IQ3_S, IQ3_M, IQ4_XS, IQ4_NL (small), Q2_K, Q2_K_S, Q3_K_S, Q3_K_M, Q3_K_L, Q4_0, Q4_1, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K (generadas con imatrix) |
| Idiomas soportados | en, ar, zh, fr, de, it, ja, ko, pt, es, vi, th, id, hi, ru, pl, da, el, fi, he, nl, sv, tr (23 idiomas) |
| Licencia | lfm1.0 (licencia "other" con enlace a LICENSE) |
| Formato de pesos | GGUF (repo de cuantizaciones); el modelo base en safetensors |

## Arquitectura y entrenamiento

El modelo base es una variante de la familia LFM3-Omni de Liquid AI, una arquitectura multimodal que integra entrada y salida de audio, vision y texto, etiquetada como "speech-to-speech" y "conversational". La model card no proporciona detalles sobre la arquitectura interna (tipo de atencion, uso de SSM o hibridos, numero de capas o dimensiones ocultas), por lo que esos datos deben considerarse no disponibles. El modelo requiere codigo personalizado (`custom_code`) para cargarse con transformers.

El proceso de entrenamiento del modelo original no esta documentado en la informacion proporcionada: no se especifica el numero de tokens de entrenamiento, la composicion del dataset, ni si se aplicaron tecnicas de RLHF, DPO u otras. La variante "heresy"/"abliterated" indica que se ha realizado una modificacion post-entrenamiento para eliminar direcciones de rechazo, aunque no se detalla la metodologia concreta. La cuantizacion i1 de mradermacher emplea ficheros imatrix para ponderar la importancia de los pesos durante la compresion, lo que en la practica mejora la calidad de las cuantizaciones de baja precision (IQ1-IQ3) frente a cuantizaciones estaticas equivalentes.

## Capacidades

- Generacion de texto conversacional multi-turno.
- Procesamiento de audio: reconocimiento de voz y conversacion speech-to-speech (segun etiquetas del modelo).
- Procesamiento de vision: el autor indica explicitamente que es un modelo de vision y que los ficheros mmproj estan en el repositorio estatico.
- Capacidades omni: integracion de modalidades audio, vision y texto en un unico modelo.
- Soporte multilingue en 23 idiomas, incluido espanol.
- Orientado a despliegue en el borde (edge) por su tamano reducido.
- Variante "uncensored"/"abliterated": reduce los rechazos del modelo original (ver limitaciones).
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Modo thinking explicito: no disponible en la informacion proporcionada.

## Casos de uso

- Asistentes de voz en dispositivos de borde: el modelo puede gestionar conversacion speech-to-speech en hardware limitado gracias a su tamano de 1,73B parametros y a las cuantizaciones IQ2-IQ4, adecuadas para dispositivos con poca memoria.
- Transcripcion y resumen de reuniones: combinando audio de entrada y generacion de texto, puede transcribir y resumir conversaciones en multiples idiomas, incluido el espanol.
- Descripcion de imagenes y asistencia visual: con los ficheros mmproj del repositorio estatico, puede procesar imagenes para tareas de captioning o respuesta a preguntas visuales en aplicaciones de accesibilidad.
- Prototipado rapido de aplicaciones multimodales: al ser un modelo pequeno con soporte GGUF, permite iterar en local con llama.cpp u Ollama antes de escalar a modelos mayores.
- Traduccion conversacional multilingue: sus 23 idiomas soportados permiten construir interfaces de traduccion en tiempo real para atencion al cliente o viajes.
- Investigacion sobre alineacion y seguridad: la variante abliterated es util para estudiar el comportamiento de modelos sin mecanismos de rechazo, en entornos controlados y con las salvaguardas adecuadas.
- Generacion creativa sin restricciones: para escritura de ficcion o guiones donde los filtros del modelo original resultan limitantes (revisar implicaciones eticas y legales).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 1-2 GB para cuantizaciones IQ1-IQ2, 2-3 GB para Q4_K_M, y 3-4 GB para Q6_K (estimacion basada en el tamano de parametros; no confirmada por el autor).
- GPU recomendadas: cualquier GPU consumer con 4 GB o mas de VRAM (GTX 1650, RTX 3050, RTX 4060, RTX 4090); en el extremo profesional, A100 o H100 no son necesarias para este tamano.
- Cabe en GPU consumer: si, practicamente en cualquier GPU moderna con 4 GB o mas; las cuantizaciones IQ1-IQ2 pueden ejecutarse incluso en CPU.
- Opciones de despliegue: llama.cpp (formato nativo GGUF), Ollama, y otros runners compatibles con GGUF; el modelo base requiere transformers con codigo personalizado.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Modalidades | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| LFM3-Omni-2B-SOMPOA-heresy-i1-GGUF | 1,73B | no disponible | audio, vision, texto | lfm1.0 | GGUF en HF |
| LFM3-Omni-2B (original de Liquid AI) | ~2B (segun nombre) | no disponible | audio, vision, texto | lfm1.0 | HF |
| Qwen2-Audio-7B | 7B | no disponible en esta ficha | audio, texto | Apache 2.0 (segun modelo original) | HF |
| MiniCPM-V 2.6 | 8B | no disponible en esta ficha | vision, texto | no disponible en esta ficha | HF |

La comparativa se limita a categorias generales; no se dispone de datos de rendimiento comparativo en la informacion proporcionada para establecer diferencias cuantitativas.

## Limitaciones y advertencias

- La variante "abliterated"/"uncensored" elimina o reduce los rechazos del modelo original, lo que aumenta el riesgo de generar contenido inapropiado, ofensivo o peligroso; no es adecuada para produccion sin capas de moderacion externas.
- Riesgo de alucinacion inherente a modelos de este tamano, especialmente en tareas de razonamiento complejo o datos factuales.
- La licencia lfm1.0 puede imponer restricciones al uso comercial; es necesario revisar el fichero LICENSE antes de desplegar el modelo en produccion.
- No se dispone de informacion sobre sesgos especificos, pero los modelos multilingues de este tamano suelen presentar sesgos culturales y de representacion.
- El contexto maximo no esta documentado en la informacion disponible, lo que dificulta planificar aplicaciones con conversaciones largas.
- El modelo requiere codigo personalizado en transformers; la compatibilidad con herramientas de terceros puede ser limitada.
- La fecha de creacion del repositorio (2026-11-09) y la ausencia de descargas o likes sugieren que es una publicacion reciente y poco validada por la comunidad.
- El rendimiento de las cuantizaciones IQ1-IQ2 puede degradarse notablemente; se recomienda Q4_K_M o superior para uso general.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/mradermacher/LFM3-Omni-2B-SOMPOA-heresy-i1-GGUF
- Modelo base: https://huggingface.co/MuXodious/LFM3-Omni-2B-SOMPOA-heresy
- Cuantizaciones estaticas: https://huggingface.co/mradermacher/LFM3-Omni-2B-SOMPOA-heresy-GGUF
- Pagina de descargas del autor: https://hf.tst.eu/model#LFM3-Omni-2B-SOMPOA-heresy-i1-GGUF
- Guia de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Analisis de cuantizaciones (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Solicitudes de modelos de mradermacher: https://huggingface.co/mradermacher/model_requests
- nethype GmbH: https://www.nethype.de/
