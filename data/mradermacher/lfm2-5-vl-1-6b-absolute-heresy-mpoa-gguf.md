# mradermacher/LFM2.5-VL-1.6B-absolute-heresy-MPOA-GGUF

## Resumen

LFM2.5-VL-1.6B-absolute-heresy-MPOA-GGUF es una cuantizacion en formato GGUF del modelo multimodal LFM2.5-VL-1.6B, en su variante "absolute-heresy-MPOA", un derivado "abliterated" (decensurado) que elimina las capas de rechazo del modelo original. La cuantizacion la firma mradermacher, un conocido generador de quants estaticos e imatrix para la comunidad de llama.cpp, a partir del modelo base publicado por el usuario MuXodious.

El modelo original pertenece a la familia LFM2.5 de Liquid AI, disenada para despliegue en el borde (edge computing) con arquitectura hibrida y capacidades de vision-lenguaje. Con 1.170.340.608 parametros reales (segun safetensors), el modelo es lo bastante pequeno para ejecutarse en CPU o en GPU de consumo con cuantizaciones de 4 bits, y soporta ocho idiomas: ingles, japones, coreano, frances, espanol, aleman, arabe y chino.

La relevancia de esta ficha radica en que combina tres factores poco habituales: un modelo multimodal de menos de 2.000 millones de parametros, una licencia LFM1.0 (con restricciones comerciales que hay que revisar), y una modificacion "abliterated" que altera el comportamiento de rechazo del modelo original. Es una opcion a considerar para experimentacion local, prototipado de pipelines de vision-lenguaje y despliegue en dispositivos con recursos limitados, siempre que se asuman las implicaciones eticas y legales de la variante decensurada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (vision-lenguaje) de la familia LFM2.5; detalles internos no disponibles |
| Parametros totales | 1.170.340.608 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16; mmproj en Q8_0 y f16 |
| Idiomas soportados | en, ja, ko, fr, es, de, ar, zh |
| Licencia | lfm1.0 (etiquetada como "other" en HuggingFace, con license_name lfm1.0) |
| Formato de pesos | GGUF (cuantizaciones estaticas); modelo base en safetensors |

## Arquitectura y entrenamiento

La informacion disponible no detalla la arquitectura interna del modelo base. Por los tags (liquid, lfm2, lfm2-vl, lfm2.5-vl, edge) se infiere que pertenece a la familia LFM2.5 de Liquid AI, orientada a despliegue en el borde, e incluye un componente de vision (proyeccion multimodal mmproj en los GGUF). No se dispone de datos sobre numero de tokens de entrenamiento, composicion del dataset, ni si hubo RLHF, DPO u otras tecnicas de alineamiento.

La variante "absolute-heresy-MPOA" es un derivado "abliterated" o "decensored": se ha modificado el modelo para reducir o eliminar los comportamientos de rechazo aprendidos durante el alineamiento. El sufijo MPOA y el termino "heresy" son propios del autor del modelo base (MuXodious) y no se documentan en la informacion proporcionada. La cuantizacion la realiza mradermacher con quants estaticos (quantize_version 2, output_tensor_quantised 1, convert_type hf), e incluye un fichero mmproj separado para el componente multimodal.

## Capacidades

- Generacion de texto conversacional multi-turno (pipeline "conversational").
- Procesamiento de vision-lenguaje: el modelo incluye un proyector multimodal (mmproj) que permite entrada de imagenes junto con texto.
- Capacidades multilingues en ocho idiomas: ingles, japones, coreano, frances, espanol, aleman, arabe y chino.
- Comportamiento "uncensored"/"decensored": la variante abliterated reduce los rechazos del modelo original.
- Compatible con endpoints (tag endpoints_compatible).
- Soporte de tool calling / function calling: no disponible en la informacion.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion.
- Modo thinking, audio u otras capacidades especiales: no disponible en la informacion.

## Casos de uso

- Prototipado local de pipelines vision-lenguaje: gracias a su tamano (1,17 B de parametros) y a las cuantizaciones Q4 (0,8 GB), se puede ejecutar en un portatil con llama.cpp para describir imagenes, responder preguntas sobre capturas o extraer texto de fotografias sin depender de la nube.
- Asistente conversacional en dispositivos de borde: el modelo cabe en Raspberry Pi 5 o en mini-PC con CPU moderna usando Q4_K_M, lo que permite desplegar un chatbot multilingue offline en entornos sin conectividad.
- Clasificacion y etiquetado de imagenes asistido por lenguaje: se puede integrar en un pipeline que reciba imagenes de un catalogo y genere descripciones o etiquetas en varios idiomas, aprovechando el componente mmproj.
- Traduccion y atencion al cliente multilingue: con soporte para espanol, frances, aleman, arabe, chino, japones y coreano, es util para prototipos de atencion al cliente en mercados multiples, aunque sin garantias de calidad de produccion.
- Experimentacion con modelos decensurados: la variante abliterated interesa a investigadores que estudian el comportamiento de rechazo, la robustez del alineamiento o la elicitacion de respuestas en modelos pequenos.
- Educacion y demos de IA multimodal: su reducido consumo de VRAM (menos de 2 GB en Q8_0) permite montar talleres o demos en portatiles con GPU integrada o RTX de gama baja.
- Generacion de descripciones accesibles: para aplicaciones de accesibilidad que describan imagenes a usuarios con discapacidad visual, siempre con revision humana por el riesgo de alucinacion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (solo pesos, sin overhead de contexto):
  - Q2_K: ~0,6 GB
  - Q4_K_M / Q4_K_S: ~0,8 GB
  - Q6_K: ~1,1 GB
  - Q8_0: ~1,3 GB
  - f16: ~2,4 GB
  - Anadir ~0,7-1,0 GB si se usa el componente multimodal (mmproj).
- GPU recomendadas: cualquier GPU con al menos 2-3 GB de VRAM efectiva; RTX 3050, RTX 4060, GTX 1660 o superiores son suficientes para Q4/Q5. Para f16 con vision, una RTX 3060 de 12 GB o superior deja margen amplio.
- Cabe en GPU de consumo: si, practicamente en cualquier GPU discreta de los ultimos ocho anos, y tambien en CPU (x86 con AVX2 o ARM64).
- Opciones de despliegue: llama.cpp (llama-server, llama-cli), Ollama (importando el GGUF), LM Studio, y cualquier runtime compatible con GGUF. Para el componente de vision se requiere llama.cpp con soporte mmproj o un frontend que lo gestione (por ejemplo, llama.cpp con `--mmproj`).
- Latencia y throughput: no disponibles en la informacion proporcionada; en la practica, con Q4_K_M en CPU moderna se esperan decenas de tokens por segundo, y en GPU de consumo cientos, pero son estimaciones no verificadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Vision | Licencia | Formato |
|---|---|---|---|---|---|
| LFM2.5-VL-1.6B-absolute-heresy-MPOA (este) | 1,17 B | no disponible | Si (mmproj) | lfm1.0 | GGUF |
| LFM2.5-VL-1.6B (original de Liquid AI) | ~1,6 B (nominal) | no disponible | Si | lfm1.0 | safetensors / GGUF |
| Qwen2.5-VL-3B-Instruct | ~3 B | 32k (segun documentacion publica de Qwen) | Si | Apache 2.0 | safetensors / GGUF |
| SmolVLM-2.2B-Instruct | ~2,2 B | no disponible en esta ficha | Si | Apache 2.0 | safetensors / GGUF |

La comparativa con Qwen2.5-VL-3B y SmolVLM-2.2B se ofrece como referencia de categoria (modelos vision-lenguaje pequenos), pero los datos de esos modelos no provienen de la informacion proporcionada en esta ficha y deben verificarse en sus model cards oficiales. La principal diferencia de esta variante es la modificacion abliterated y la licencia LFM1.0, mas restrictiva que Apache 2.0.

## Limitaciones y advertencias

- La variante "abliterated"/"decensored" elimina o reduce los rechazos del modelo original: puede generar contenido inapropiado, ofensivo o danino sin filtros, lo que la hace inadecuada para aplicaciones de cara al publico sin moderacion adicional.
- La licencia LFM1.0 no es de codigo abierto plena: incluye restricciones de uso comercial que deben revisarse antes de cualquier despliegue en produccion o SaaS.
- Riesgo de alucinacion elevado por el reducido tamano del modelo (1,17 B de parametros): no es fiable para tareas que requieran precision factual alta sin verificacion.
- No hay datos publicados sobre sesgos, contexto maximo ni calidad por idioma; el soporte de arabe, chino, japones y coreano puede ser desigual en un modelo de este tamano.
- La informacion sobre tool calling, agentes y razonamiento multi-paso no esta disponible, por lo que no se debe asumir su soporte.
- El componente de vision requiere el fichero mmproj y un runtime compatible; sin el, el modelo funciona solo como modelo de texto.
- El repo pesa 12 GB por acumulacion de cuantizaciones; conviene descargar solo el fichero GGUF necesario.
- No se han publicado benchmarks: cualquier comparacion de rendimiento con otros modelos carece de base empirica en esta ficha.

## Enlaces

- HuggingFace (este GGUF): https://huggingface.co/mradermacher/LFM2.5-VL-1.6B-absolute-heresy-MPOA-GGUF
- Modelo base (MuXodious): https://huggingface.co/MuXodious/LFM2.5-VL-1.6B-absolute-heresy-MPOA
- Quants imatrix del mismo modelo: https://huggingface.co/mradermacher/LFM2.5-VL-1.6B-absolute-heresy-MPOA-i1-GGUF
- Pagina de descargas del autor: https://hf.tst.eu/model#LFM2.5-VL-1.6B-absolute-heresy-MPOA-GGUF
- Guia de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Grafico de calidad de quants (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas sobre quants (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Solicitudes de cuantizacion de mradermacher: https://huggingface.co/mradermacher/model_requests
