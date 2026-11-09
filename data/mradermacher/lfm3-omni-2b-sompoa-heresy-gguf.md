# mradermacher/LFM3-Omni-2B-SOMPOA-heresy-GGUF

## Resumen

LFM3-Omni-2B-SOMPOA-heresy-GGUF es una cuantizacion estatica en formato GGUF del modelo multimodal LFM3-Omni-2B-SOMPOA-heresy, publicado por el usuario mradermacher. El modelo base deriva de la familia LFM3-Omni de Liquid AI, una arquitectura orientada a dispositivos edge que combina procesamiento de texto, audio y vision en un unico modelo de aproximadamente 1.730 millones de parametros. Esta version concreta ha sido sometida a un proceso de "abliteration" o decensurado (etiquetada como heretic, uncensored, decensored y abliterated), lo que elimina total o parcialmente los mecanismos de rechazo y alineacion del modelo original.

El interes de esta publicacion es doble. Por un lado, ofrece el modelo en multiples niveles de cuantizacion GGUF (desde Q2_K hasta f16, ademas de un proyector multimodal mmproj en Q8_0 y f16), lo que permite ejecutarlo en hardware de consumo con requisitos de VRAM muy bajos. Por otro lado, la variante heretic resulta relevante para investigadores que necesitan estudiar el comportamiento de modelos sin las capas de rechazo, o para desarrolladores que requieren respuestas sin filtros en entornos controlados.

El modelo soporta 23 idiomas, incluyendo castellano, y esta disenado para conversaciones por voz (speech-to-speech) en el edge. Su licencia es lfm1.0, lo que impone restricciones que conviene revisar antes de cualquier uso comercial. No se dispone de informacion sobre benchmarks publicados ni sobre la composicion exacta del dataset de entrenamiento en la informacion proporcionada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (texto, audio, vision) de la familia LFM3-Omni; etiquetada como custom_code |
| Parametros totales | 1.728.801.600 (aprox. 1,73 B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16; proyector multimodal mmproj-Q8_0 y mmproj-f16 |
| Idiomas soportados | en, ar, zh, fr, de, it, ja, ko, pt, es, vi, th, id, hi, ru, pl, da, el, fi, he, nl, sv, tr (23 idiomas) |
| Licencia | lfm1.0 (license: other, license_name: lfm1.0) |
| Formato de pesos | GGUF (cuantizaciones estaticas); el modelo base en safetensors |

## Arquitectura y entrenamiento

El modelo base pertenece a la familia LFM3-Omni de Liquid AI, disenada para inferencia en dispositivos edge. Se trata de un transformer multimodal que integra procesamiento de texto, audio y vision, con capacidad de conversacion speech-to-speech. La model card del repositorio cuantizado no detalla la arquitectura interna (atencion, capas, dimensiones ocultas), el numero de tokens de entrenamiento ni la composicion del dataset. Tampoco se especifica si hubo fases de RLHF, DPO u otro tipo de alineacion, aunque la etiqueta "abliterated" indica que la variante heretic ha revertido parcialmente los mecanismos de rechazo del modelo alineado original.

La innovacion tecnica destacable de esta publicacion concreta es el proceso de cuantizacion estatica realizado por mradermacher, que ofrece desde variantes de 0,9 GB (Q2_K) hasta 3,6 GB (f16), ademas de un proyector multimodal independiente (mmproj) necesario para las capacidades de vision y audio. Se menciona la existencia de cuantizaciones ponderadas con imatrix en un repositorio separado (sufijo -i1), lo que sugiere que el autor aplica tecnicas de cuantizacion con importancia para preservar calidad en niveles bajos de bits.

## Capacidades

- Generacion de texto y conversacion multi-turno en 23 idiomas, incluido el castellano.
- Procesamiento de audio y capacidad speech-to-speech, orientada a conversacion por voz.
- Procesamiento de vision mediante el proyector multimodal (mmproj) incluido en el repositorio.
- Capacidades multimodales combinadas (omni): entrada de texto, audio e imagen en un mismo modelo.
- Orientado a despliegue en edge y dispositivos con recursos limitados.
- Variante decensurada/abliterated: responde sin los filtros de rechazo del modelo original (comportamiento a validar caso por caso).
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Modo thinking explicito: no disponible en la informacion proporcionada.

## Casos de uso

- Asistentes de voz en dispositivos edge: el modelo puede gestionar conversaciones speech-to-speech con un peso de entre 0,9 y 1,9 GB segun cuantizacion, lo que permite ejecutarlo en moviles, Raspberry Pi o mini-PC sin GPU dedicada.
- Transcripcion y respuesta hablada en tiempo real: al combinar entrada de audio y generacion de texto/voz, encaja en aplicaciones de atención telefónica o kioscos interactivos con latencia baja.
- Descripcion de imagenes en local: usando el proyector mmproj junto con una cuantizacion Q4_K_M, se puede construir un pipeline de captioning o accesibilidad visual que no envia datos a la nube.
- Investigacion sobre alineacion y seguridad: la variante abliterated permite estudiar como cambia el comportamiento del modelo al eliminar los mecanismos de rechazo, comparandolo con el original.
- Prototipado multilingue: con 23 idiomas soportados, sirve para validar productos de traduccion o atencion al cliente en fases tempranas sin coste de API.
- Educacion y demos offline: al caber en GPU de consumo y en CPU, se puede desplegar en aulas o talleres sin conexion.
- Generacion creativa sin filtros: para escritura de ficcion o guiones donde el modelo original rechazaria contenido sensible, en entornos controlados y con supervision humana.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (solo pesos, sin overhead de contexto): Q2_K ~0,9 GB; Q3_K_S/M ~1,0 GB; IQ4_XS ~1,1 GB; Q4_K_S/M ~1,2 GB; Q5_K_S/M ~1,3-1,4 GB; Q6_K ~1,5 GB; Q8_0 ~1,9 GB; f16 ~3,6 GB. El proyector multimodal anade 0,6 GB (Q8_0) o 1,0 GB (f16).
- GPU recomendadas: cualquier GPU consumer con 4 GB o mas de VRAM puede ejecutar las cuantizaciones Q4-Q8; una RTX 3060/4060 o superior ofrece margen comodo. Para f16 con vision/audio se recomienda 8 GB o mas. En entornos de servidor, A100 o H100 no son necesarias dado el tamano, pero permiten mayor throughput por batching.
- Cabe en GPU de consumo: si, en practicamente todas las GPU modernas con 4-8 GB de VRAM, e incluso en CPU con llama.cpp.
- Opciones de despliegue: llama.cpp, Ollama, y servidores compatibles con GGUF (por ejemplo, llama-cpp-python o LM Studio). El repositorio esta etiquetado como endpoints_compatible. Para las capacidades multimodales se requiere cargar el mmproj correspondiente.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Modalidades | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| LFM3-Omni-2B-SOMPOA-heresy-GGUF (este) | ~1,73 B | no disponible | texto, audio, vision | lfm1.0 | GGUF en HF |
| Modelo base MuXodious/LFM3-Omni-2B-SOMPOA-heresy | ~1,73 B | no disponible | texto, audio, vision | lfm1.0 | safetensors en HF |
| Familia LFM3-Omni original (Liquid AI) | no disponible | no disponible | texto, audio, vision | lfm1.0 | HF |
| Alternativas de ~2B multimodales (p. ej. Qwen2-Audio, MiniCPM-V) | no disponible en esta ficha | no disponible | texto, audio o vision | varian | HF |

No se dispone de datos de rendimiento comparativo en la informacion proporcionada, por lo que la comparativa se limita a parametros, modalidades y licencia.

## Limitaciones y advertencias

- La variante heretic/abliterated elimina o reduce los mecanismos de rechazo: puede generar contenido sensible, ofensivo o inseguro sin advertencia. No es apta para produccion orientada al publico sin filtros adicionales.
- Riesgo de alucinacion inherente a un modelo de ~1,73 B parametros; la calidad factual sera inferior a modelos de mayor tamano.
- La cuantizacion a Q2_K y Q3_K degrada la calidad; el propio autor recomienda Q4_K_S/M como equilibrio y Q8_0 para maxima calidad.
- La licencia lfm1.0 impone condiciones especificas; es necesario revisar el archivo LICENSE antes de cualquier uso comercial. La model card indica license: other.
- No se dispone de informacion sobre sesgos especificos, longitud de contexto ni evaluaciones de seguridad del modelo base.
- El proceso de abliteration puede degradar capacidades generales (razonamiento, instruction following) respecto al modelo original; conviene validarlo en la tarea concreta.
- El repositorio no incluye benchmarks ni evaluaciones publicadas, por lo que el rendimiento real debe medirse en cada caso de uso.
- Las capacidades multimodales requieren cargar el mmproj; sin el, el modelo funciona solo como texto.

## Enlaces

- Repositorio Hugging Face (GGUF): https://huggingface.co/mradermacher/LFM3-Omni-2B-SOMPOA-heresy-GGUF
- Modelo base: https://huggingface.co/MuXodious/LFM3-Omni-2B-SOMPOA-heresy
- Cuantizaciones imatrix (i1): https://huggingface.co/mradermacher/LFM3-Omni-2B-SOMPOA-heresy-i1-GGUF
- Pagina de descargas del autor: https://hf.tst.eu/model#LFM3-Omni-2B-SOMPOA-heresy-GGUF
- Guia de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Solicitudes de cuantizacion: https://huggingface.co/mradermacher/model_requests
- Grafico comparativo de cuantizaciones: https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas sobre tipos de cuantizacion (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
