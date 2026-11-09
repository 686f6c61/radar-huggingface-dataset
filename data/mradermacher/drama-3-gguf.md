# mradermacher/drama-3-GGUF

## Resumen

drama-3 es un modelo de síntesis de voz (text-to-speech) desarrollado originalmente por OxBee y distribuido en formato GGUF por mradermacher. Se trata de un modelo de 34.676.863.616 parámetros (aproximadamente 34,7 mil millones), lo que lo sitúa en la gama alta de los modelos TTS open source. Está diseñado para generación de habla multi-hablante, edición de audio y generación de habla emocional, e incluye un componente multimodal (mmproj) que sugiere capacidad de procesamiento de audio además de texto.

La relevancia de esta ficha concreta radica en su empaquetado como GGUF, que permite ejecutar un modelo TTS de gran tamaño en hardware de consumo mediante cuantización, algo poco habitual en modelos de esta escala. La versión cuantizada facilita el despliegue local sin necesidad de GPUs de datacenter, aunque el tamaño del repo (241,9 GB) y el tamaño de los propios ficheros GGUF (desde 13 GB en Q2_K hasta 37 GB en Q8_0) implican requisitos de almacenamiento y memoria considerables.

El modelo declara soporte para más de 80 idiomas, con especial énfasis en chino, inglés, japonés y coreano, e incluye el español entre los idiomas soportados. La licencia es la fish-audio-research-license, lo que restringe el uso comercial y lo orienta a investigación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo TTS; se distribuye con componente multimodal mmproj) |
| Parametros totales | 34.676.863.616 (~34,7 B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0; mmproj en Q8_0 y f16 |
| Idiomas soportados | más de 80 idiomas, entre ellos zh, en, ja, ko, es, pt, ar, ru, fr, de, sv, it, tr, no, nl, cy, eu, ca, da, gl, ta, hu, fi, pl, et, hi, la, ur, th, vi, jw, bn, yo, sl, cs, sw, nn, he, ms, uk, id, kk, bg, lv, my, tl, sk, ne, fa, af, el, bo, hr, ro, sn, mi, yi, am, be, km, is, az, sd, br, sq, ps, mn, ht, ml, sr, sa, te, ka, bs, pa, lt, kn, si, hy, mr, as, gu, fo |
| Licencia | fish-audio-research-license (uso de investigación) |
| Formato de pesos | GGUF (cuantizaciones estáticas); modelo base en transformers |

## Arquitectura y entrenamiento

No se dispone de información detallada sobre la arquitectura interna del modelo en la documentación proporcionada. Los tags indican que se trata de un modelo text-to-speech con capacidades de multi-speaker, audio-editing y emotional-speech-generation, y la presencia de ficheros mmproj (multi-modal supplement) en el repo GGUF sugiere un componente multimodal que probablemente procesa audio como entrada además de texto. El modelo base es OxBee/drama-3, del que no se detallan en esta ficha los datos de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO.

La información disponible no especifica el número de tokens de entrenamiento, la arquitectura concreta (transformer, MoE, híbrida, etc.) ni innovaciones técnicas como decodificación especulativa o atención lineal. Las cuantizaciones son estáticas (según la model card, no hay cuantizaciones ponderadas/imatrix disponibles en el momento de la publicación), generadas con quantize_version 2 y output_tensor_quantised 1.

## Capacidades

- Síntesis de voz (text-to-speech) a partir de texto.
- Generación de habla multi-hablante (multi-speaker): permite distintas voces.
- Edición de audio: el tag audio-editing sugiere capacidad de modificar audio existente.
- Generación de habla emocional (emotional-speech-generation): control de expresividad.
- Soporte multilingüe amplio: más de 80 idiomas declarados, incluido el español.
- Componente multimodal (mmproj): procesamiento de entrada multimodal, presumiblemente audio.
- No se documenta soporte de tool calling, function calling ni razonamiento multi-paso (no es un modelo de propósito general, sino TTS).

## Casos de uso

- Doblaje y localización de contenido audiovisual: el modelo puede generar voces en más de 80 idiomas, lo que permite producir pistas de audio localizadas para vídeo o e-learning sin estudio de grabación, manteniendo coherencia de hablante.
- Audiolibros y narración automatizada: con soporte multi-hablante y habla emocional, se pueden generar narraciones con distintos personajes y matices expresivos a partir de texto.
- Asistentes de voz y atención al cliente: integración en sistemas conversacionales para sintetizar respuestas en español y otros idiomas, con control de emoción para un tono adecuado.
- Accesibilidad: generación de voz para lectores de pantalla y conversión de texto a audio para personas con discapacidad visual, con voces naturales y multilingües.
- Producción de pódcasts y contenido sintético: generación de segmentos de voz con diferentes hablantes y edición posterior del audio generado.
- Prototipado de interfaces de voz: evaluación de experiencias de voz en aplicaciones antes de contratar voces profesionales, gracias a la disponibilidad de cuantizaciones que reducen el coste de hardware.
- Investigación en TTS y emoción: experimentación académica con un modelo de gran tamaño (34,7 B) en formato abierto para estudiar habla emocional y multilingüe.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (según tamaño de fichero GGUF, más overhead de contexto y del componente mmproj):
  - Q2_K: ~13 GB de pesos; requiere aproximadamente 14-16 GB de VRAM.
  - Q4_K_M: ~21,3 GB de pesos; requiere aproximadamente 22-24 GB de VRAM.
  - Q8_0: ~37 GB de pesos; requiere aproximadamente 38-40 GB de VRAM.
  - El componente mmproj añade 1,8 GB (Q8_0) o 3,0 GB (f16).
- GPU recomendadas: para Q4_K_M, una RTX 4090 (24 GB) o A100 40 GB; para Q8_0, A100 80 GB o H100. Para Q2_K podría intentarse en GPUs de 16 GB, con riesgo de desbordamiento.
- En GPU de consumo: Q2_K y Q4_K_S/Q4_K_M son las opciones viables en RTX 4090 (24 GB); las cuantizaciones altas (Q6_K, Q8_0) no caben en GPUs de consumo de 24 GB.
- Opciones de despliegue: llama.cpp y sus derivados (Ollama, LM Studio) para GGUF; el modelo base es compatible con transformers. No se documenta soporte en vLLM o TGI para esta versión GGUF.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

No se dispone de datos de benchmarks ni de especificaciones detalladas de modelos comparables en la información proporcionada, por lo que no es posible establecer una comparativa cuantitativa rigurosa. Como referencia cualitativa, dentro de la categoría TTS open source existen alternativas de menor tamaño (por ejemplo, modelos de la familia Fish Audio o XTTS), pero no se dispone aquí de sus parámetros, contexto ni resultados para comparar. Se indica, por tanto: comparativa no disponible.

## Limitaciones y advertencias

- Licencia fish-audio-research-license: restringe el uso a investigación; el uso comercial requiere revisar los términos del LICENSE.md y probablemente obtener una licencia aparte.
- Modelo de gran tamaño (34,7 B): los requisitos de VRAM y almacenamiento son elevados; el repo completo ocupa 241,9 GB.
- Alucinación y artefactos de audio: como todo modelo TTS, puede producir pronunciaciones incorrectas, artefactos o inestabilidad en textos largos o idiomas con pocos datos.
- Cobertura idiomática desigual: aunque declara más de 80 idiomas, el rendimiento probablemente varía mucho entre idiomas mayoritarios (zh, en, ja, ko) y minoritarios.
- Sesgos: no se documentan sesgos específicos, pero los modelos TTS pueden reflejar sesgos de acento, género y prosodia presentes en los datos de entrenamiento.
- Cuantizaciones estáticas: no hay versiones imatrix/ponderadas disponibles según la model card, lo que puede afectar la calidad en cuantizaciones bajas (Q2_K, Q3_K).
- No es un modelo de propósito general: no debe esperarse razonamiento, código o tool calling; su función es TTS y edición de audio.
- Fecha de creación del repo (2026-11-09) y ausencia de descargas/likes: modelo muy reciente y poco validado por la comunidad en el momento de la ficha.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/drama-3-GGUF
- Modelo base: https://huggingface.co/OxBee/drama-3
- Página de descargas del cuantizador: https://hf.tst.eu/model#drama-3-GGUF
- Licencia: https://huggingface.co/mradermacher/drama-3-GGUF/blob/main/LICENSE.md
- FAQ y peticiones de cuantización: https://huggingface.co/mradermacher/model_requests
- Guía de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Gráfico comparativo de cuantizaciones: https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas de Artefact2 sobre cuantizaciones: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
