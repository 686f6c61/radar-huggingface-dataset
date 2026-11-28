# mradermacher/qwen2-vl-2b-abliterated-i1-GGUF

## Resumen

`mradermacher/qwen2-vl-2b-abliterated-i1-GGUF` es una coleccion de cuantizaciones GGUF generadas por mradermacher a partir del modelo `MahdiAlikhah/qwen2-vl-2b-abliterated`, una variante "abliterated" (con las direcciones de rechazo eliminadas mediante tecnicas de abliteracion) del Qwen2-VL de 2B parametros de Alibaba. El modelo base combina un encoder visual con un transformer de lenguaje, lo que le permite procesar imagenes y texto de forma conjunta.

La relevancia de esta ficha reside en que ofrece un modelo vision-lenguaje de pequeno tamano (1.543.714.304 parametros reales segun safetensors) en formato GGUF, con un amplio abanico de niveles de cuantizacion que van desde IQ1_S (0,5 GB) hasta Q6_K (1,4 GB). Esto permite desplegar un modelo multimodal en hardware de consumo, algo impensable con modelos vision-lenguaje de mayor tamano.

El autor de las cuantizaciones es mradermacher, conocido en el ecosistema por publicar versiones GGUF (estaticas e imatrix) de modelos populares. El modelo base fue producido por MahdiAlikhah y esta etiquetado como "abliterated", "uncensored" y "heretic", lo que indica que se han suprimido los mecanismos de rechazo del modelo original, con las implicaciones eticas y de seguridad que ello conlleva.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (vision-lenguaje) basada en Qwen2-VL; no se detalla la configuracion interna en la informacion disponible |
| Parametros totales | 1.543.714.304 (segun safetensors del modelo base) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada |
| Tipos de cuantizacion | IQ1_S, IQ1_M, IQ2_XXS, IQ2_XS, IQ2_S, IQ2_M, Q2_K_S, IQ3_XXS, Q2_K, IQ3_XS, Q3_K_S, IQ3_S, IQ3_M, Q3_K_M, Q3_K_L, IQ4_XS, IQ4_NL, Q4_0, Q4_K_S, Q4_K_M, Q4_1, Q5_K_S, Q5_K_M, Q6_K (cuantizaciones i1/imatrix) |
| Idiomas soportados | en (segun model card) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (cuantizaciones i1); el modelo base en safetensors/transformers |

## Arquitectura y entrenamiento

El modelo base es una variante del Qwen2-VL de 2B parametros, un modelo vision-lenguaje que empareja un encoder de vision con un modelo de lenguaje transformer. La informacion proporcionada no detalla la composicion exacta del dataset de entrenamiento, el numero de tokens utilizados ni si se aplicaron fases de RLHF o DPO. La unica informacion relevante sobre el proceso es que se trata de una version "abliterated": se han eliminado las direcciones de activacion asociadas al rechazo, una tecnica que modifica los pesos para suprimir respuestas de negativa del modelo.

Las cuantizaciones publicadas por mradermacher son de tipo i1 (imatrix), generadas con un fichero imatrix propio (`qwen2-vl-2b-abliterated.imatrix.gguf`, 0,1 GB) que permite calibrar mejor la cuantizacion de pesos. El autor indica que las cuantizaciones IQ suelen ser preferibles a las no-IQ de tamano similar, y que los ficheros mmproj (necesarios para la parte visual en llama.cpp) se encuentran en el repositorio estatico separado `mradermacher/qwen2-vl-2b-abliterated-GGUF`.

## Capacidades

- Generacion de texto y conversacion multi-turno (pipeline "conversational").
- Procesamiento de imagenes y texto de forma conjunta (vision-language), segun la etiqueta `qwen2-vl` y la nota del autor de que es un modelo de vision.
- Razonamiento basico y respuesta a instrucciones heredado del Qwen2-VL original.
- Capacidades multilingues limitadas: la model card solo declara ingles (`en`).
- Al estar "abliterated"/"uncensored", el modelo no aplica los filtros de rechazo del modelo original.
- No se documenta soporte explicito de tool calling, function calling ni modo de razonamiento extendido (thinking) en la informacion disponible.

## Casos de uso

- Descripcion de imagenes en local: el modelo puede recibir una imagen y generar una descripcion textual; con cuantizaciones Q4_K_M (1,1 GB) cabe en GPU de consumo y permite prototipado rapido de pipelines de captioning.
- OCR y extraccion de texto de documentos: al ser un modelo vision-lenguaje, puede transcribir texto de capturas o escaneos; util para automatizar la digitalizacion de facturas o formularios en entornos con recursos limitados.
- Asistente conversacional sin filtros para investigacion: el caracter "abliterated" lo hace adecuado para estudiar el comportamiento de modelos sin alineacion de seguridad, siempre en entornos controlados y con supervision humana.
- Clasificacion y analisis de imagenes en edge: las cuantizaciones IQ2/IQ3 (0,6-0,9 GB) permiten desplegar el modelo en dispositivos con poca VRAM o incluso en CPU mediante llama.cpp, para tareas de etiquetado visual.
- Prototipado de agentes multimodales: integrado en un pipeline con llama.cpp, puede servir como componente de percepcion visual en flujos experimentales de agentes, aunque sin garantias de tool calling nativo.
- Evaluacion comparativa de cuantizaciones: el repositorio ofrece 25 variantes de cuantizacion, lo que permite medir el impacto de la compresion en la calidad de las respuestas visuales y textuales en un modelo de 2B.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: aproximadamente 0,5-1,5 GB para los pesos segun cuantizacion (desde IQ1_S de 0,5 GB hasta Q6_K de 1,4 GB), mas el fichero mmproj para la parte visual y el overhead de contexto.
- GPU recomendadas: cualquier GPU consumer con 4 GB o mas de VRAM (GTX 1650, RTX 3050, RTX 4060) es suficiente para las cuantizaciones Q4/Q5; para Q6_K se recomienda 6 GB o mas.
- Cabe en GPU consumer: si, en practicamente todas las GPU modernas con 4-8 GB de VRAM.
- Opciones de despliegue: llama.cpp (formato nativo GGUF, con soporte de mmproj para vision), Ollama y otros runners compatibles con GGUF; la etiqueta `endpoints_compatible` sugiere compatibilidad con endpoints de inferencia.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Vision | Licencia | Formato |
|---|---|---|---|---|---|
| qwen2-vl-2b-abliterated-i1-GGUF (este) | 1,54B | no disponible | si | apache-2.0 | GGUF |
| Qwen2-VL-2B (original) | 2B (nominal) | no disponible | si | apache-2.0 | safetensors |
| mradermacher/qwen2-vl-2b-abliterated-GGUF (estatico) | 1,54B | no disponible | si | apache-2.0 | GGUF |
| MahdiAlikhah/qwen2-vl-2b-abliterated (base) | 1,54B | no disponible | si | apache-2.0 | safetensors |

La comparativa se limita a variantes del mismo modelo base, ya que la informacion proporcionada no incluye datos de rendimiento frente a otras familias (p. ej., LLaVA, Phi-3-Vision) que permitan una comparacion cuantitativa rigurosa.

## Limitaciones y advertencias

- El modelo esta "abliterated"/"uncensored": se han eliminado los mecanismos de rechazo, por lo que puede generar contenido inapropiado, ofensivo o peligroso sin filtros. No es apto para produccion orientada al usuario final sin moderacion adicional.
- Riesgo elevado de alucinacion, especialmente en tareas de OCR y descripcion de imagenes detalladas, comun en modelos vision-lenguaje de 2B.
- Idiomas: la model card solo declara ingles; el rendimiento en castellano no esta verificado y probablemente sea inferior.
- Longitud de contexto no documentada en la informacion disponible; no se debe asumir una ventana larga.
- Las cuantizaciones de baja precision (IQ1, IQ2, Q2_K) degradan notablemente la calidad; el propio autor las etiqueta como "for the desperate" o "very low quality".
- La licencia apache-2.0 permite uso comercial, pero la ausencia de alineacion de seguridad traslada al desplegador la responsabilidad legal y etica del contenido generado.
- El repositorio tiene 0 likes y 1357 descargas, lo que indica una validacion comunitaria escasa; conviene evaluar el modelo en el caso de uso concreto antes de adoptarlo.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/mradermacher/qwen2-vl-2b-abliterated-i1-GGUF
- Modelo base: https://huggingface.co/MahdiAlikhah/qwen2-vl-2b-abliterated
- Cuantizaciones estaticas (incluye ficheros mmproj): https://huggingface.co/mradermacher/qwen2-vl-2b-abliterated-GGUF
- Pagina de descargas del autor: https://hf.tst.eu/model#qwen2-vl-2b-abliterated-i1-GGUF
- Guia de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Analisis de tipos de cuantizacion (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
