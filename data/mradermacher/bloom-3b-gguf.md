# mradermacher/bloom-3b-GGUF

## Resumen

BLOOM-3B es un modelo de lenguaje autorregresivo de tipo transformer decoder-only desarrollado por BigScience, el consorcio internacional que produjo la familia BLOOM (con variantes de 560M a 176B parametros). Esta ficha concreta documenta la version cuantizada en formato GGUF realizada por mradermacher, que permite ejecutar el modelo en hardware de consumo mediante llama.cpp y herramientas compatibles. El modelo cuenta con 3.644.810.240 parametros totales y fue entrenado sobre un corpus multilingue de 46 idiomas, con enfasis especial en ingles, chino, frances, espanol y portugues.

La relevancia de esta publicacion radica en que ofrece cuantizaciones estaticas (Q2_K hasta f16) de un modelo base ya consolidado, con tamanos que van desde 1,7 GB hasta 7,4 GB, lo que facilita su despliegue en GPUs consumer, CPUs y sistemas embebidos. Aunque BLOOM-3B no incorpora las innovaciones de los LLM mas recientes (no hay RLHF, no hay tool calling nativo, no hay ventana de contexto extendida), sigue siendo util como modelo base para fine-tuning, experimentacion academica y tareas de generacion de texto en entornos con recursos limitados.

El modelo se distribuye bajo la licencia BigScience BLOOM RAIL 1.0, que impone restricciones de uso comercial y requiere aceptar terminos adicionales. Esta cuantizacion concreta fue publicada el 6 de marzo de 2025 y actualizada en noviembre de 2026, con 267 descargas acumuladas en Hugging Face.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only autorregresivo (estilo GPT, con ALiBi) |
| Parametros totales | 3.644.810.240 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 2048 tokens (heredado de bigscience/bloom-3b) |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, IQ4_XS, Q3_K_L, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16 |
| Idiomas soportados | 46 idiomas, incluyendo ak, ar, as, bm, bn, ca, code, en, es, eu, fon, fr, gu, hi, id, ig, ki, kn, lg, ln, ml, mr, ne, nso, ny, or, pa, pt, rn, rw, sn, st, sw, ta, te, tn, ts, tum, tw, ur, vi, wo, xh, yo, zh, zhs, zht, zu |
| Licencia | bigscience-bloom-rail-1.0 |
| Formato de pesos | GGUF (multiples archivos por cuantizacion) |

## Arquitectura y entrenamiento

BLOOM-3B emplea una arquitectura transformer decoder-only con atencion causal y sesgo de atencion lineal con sesgos (ALiBi), una innovacion que permite extrapolar a secuencias mas largas que las vistas durante el entrenamiento, aunque la ventana practica documentada es de 2048 tokens. El modelo utiliza embeddings de tokens y de posicion, capas de normalizacion LayerNorm y una cabeza de lenguaje atada a los embeddings de entrada. No incorpora mecanismos de mezcla de expertos (MoE) ni atencion lineal aproximada; es un transformer denso clasico.

El modelo base bigscience/bloom-3b fue entrenado por BigScience sobre el corpus ROOTS, un dataset multilingue de aproximadamente 1,6 TB de texto que cubre 46 lenguajes naturales y 13 lenguajes de programacion. El entrenamiento se realizo con objetivos de modelado de lenguaje causal estandar, sin fases posteriores de RLHF, DPO o instruction tuning. Esta cuantizacion GGUF realizada por mradermacher no altera los pesos mas alla de la reduccion de precision, e incluye variantes estaticas (Q2_K a f16) y una version separada con cuantizacion ponderada/imatrix disponible en el repositorio bloom-3b-i1-GGUF.

## Capacidades

- Generacion de texto autoregresiva en 46 idiomas, con calidad variable segun el idioma (mejor en ingles, chino, frances, espanol y portugues).
- Finalizacion de texto y continuacion de prompts, sin capacidad nativa de seguir instrucciones complejas.
- Generacion de codigo en lenguajes de programacion incluidos en el corpus de entrenamiento (el tag "code" aparece en la lista de idiomas).
- Traduccion entre idiomas del corpus, aunque sin garantias de calidad profesional.
- No soporta tool calling ni function calling de forma nativa.
- No incorpora modo de razonamiento multi-paso ni agentes.
- No dispone de capacidades de vision, audio ni multimodalidad.
- No incluye modo "thinking" ni cadenas de razonamiento explicitas.

## Casos de uso

- Fine-tuning para dominios especificos: al ser un modelo base de 3.6B parametros, puede ajustarse con LoRA o QLoRA sobre datasets propios (legal, medico, atencion al cliente) en una unica GPU de 24 GB, usando la cuantizacion Q4_K_M como punto de partida para experimentacion rapida.
- Generacion de texto en produccion con recursos limitados: la cuantizacion Q4_K_S (2,3 GB) permite desplegar el modelo en CPUs modernas o GPUs de gama baja para tareas de completado de texto, resumen extractivo o parafraseo donde no se requiera instruction following estricto.
- Prototipado academico de investigacion en PLN multilingue: el modelo cubre 46 idiomas y sirve como linea base para comparar tecnicas de tokenizacion, sesgos linguisticos o eficiencia de cuantizacion en lenguas de bajos recursos (yoruba, xhosa, zulu, wolof, etc.).
- Traduccion automatica de bajo coste: para pares de idiomas bien representados en ROOTS (ingles-frances, ingles-espanol, ingles-chino), el modelo puede generar traducciones aceptables en entornos sin GPU dedicada, usando llama.cpp con cuantizacion Q5_K_M.
- Educacion y demostraciones de LLM: el reducido tamano de las cuantizaciones (desde 1,7 GB) permite ejecutar el modelo en portatiles y Raspberry Pi, util para talleres, cursos y demostraciones de inferencia local sin conexion.
- Generacion de codigo asistida en entornos offline: aunque limitada, la presencia del tag "code" permite usar el modelo para autocompletado de fragmentos en editores ligeros o scripts de automatizacion, siempre con revision humana.
- Experimentacion con tecnicas de cuantizacion: el repositorio ofrece 12 variantes de cuantizacion, lo que permite comparar perplejidad y calidad entre Q2_K, IQ4_XS, Q6_K y f16 en un mismo modelo base, util para investigacion sobre compresion de modelos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (solo pesos, sin overhead de contexto):
  - Q2_K: ~1,7 GB
  - Q3_K_M: ~2,1 GB
  - Q4_K_M: ~2,5 GB
  - Q5_K_M: ~2,8 GB
  - Q6_K: ~3,1 GB
  - Q8_0: ~4,0 GB
  - f16: ~7,4 GB
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM para Q4_K_M; RTX 3060, RTX 4060, RTX 4090, A100 o H100 para cuantizaciones superiores o mayor throughput.
- Cabe en GPU consumer: si, en practicamente todas las GPUs dedicadas modernas (GTX 1650 4 GB en adelante) y en iGPUs con memoria unificada para cuantizaciones Q2_K a Q4_K_S.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, text-generation-webui, koboldcpp, y servidores compatibles con la API de endpoints (el tag `endpoints_compatible` esta presente). vLLM y TGI no soportan GGUF de forma nativa sin conversion.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada; dependen del hardware y de la cuantizacion elegida.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|
| bloom-3b-GGUF (este) | 3,64B | 2048 | bigscience-bloom-rail-1.0 | GGUF | Hugging Face |
| bigscience/bloom-3b (base) | 3,64B | 2048 | bigscience-bloom-rail-1.0 | safetensors | Hugging Face |
| bloom-1b7-GGUF | 1,7B | 2048 | bigscience-bloom-rail-1.0 | GGUF | Hugging Face (mradermacher) |
| bloom-7b1-GGUF | 7,1B | 2048 | bigscience-bloom-rail-1.0 | GGUF | Hugging Face (mradermacher) |

La comparativa con modelos de otras familias (Llama 3.2 3B, Qwen2.5 3B, Gemma 2 2B) no esta disponible en la informacion proporcionada; se recomienda consultar sus fichas respectivas para una comparacion cruzada de rendimiento y licencia.

## Limitaciones y advertencias

- Sesgos conocidos: BLOOM fue entrenado sobre ROOTS, un corpus web con sesgos de genero, raza, religion y nacionalidad documentados en la literatura; el modelo puede reproducir estereotipos en generaciones abiertas.
- Riesgo de alucinacion: elevado en tareas factuales, ya que no ha pasado por fases de alineacion (RLHF/DPO) ni dispone de mecanismos de verificacion.
- Limitacion de contexto: 2048 tokens, insuficiente para documentos largos, conversaciones multi-turno extensas o analisis de codigo de gran tamano.
- Limitacion de idioma: aunque cubre 46 idiomas, la calidad es muy desigual; los idiomas de bajos recursos (fon, ki, lg, ln, nso, rn, rw, sn, st, tn, ts, tum, tw, wo, xh) tienen representacion limitada en ROOTS y generan resultados pobres.
- Restricciones de licencia: BigScience BLOOM RAIL 1.0 permite uso comercial con condiciones (registro, atribucion, restricciones de uso militar, legal y de vigilancia); es necesario revisar los terminos antes de desplegar en produccion.
- Caveat para produccion: al ser un modelo base sin instruction tuning, no responde bien a prompts conversacionales; requiere fine-tuning o ingenieria de prompts especifica para cada caso de uso.
- La cuantizacion Q2_K y Q3_K_M degradan notablemente la calidad; el autor recomienda Q4_K_S o Q4_K_M para uso general y Q6_K o Q8_0 cuando la calidad sea critica.
- No dispone de soporte nativo para tool calling, agentes ni razonamiento multi-paso, lo que limita su uso en pipelines agenticos modernos.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/mradermacher/bloom-3b-GGUF
- Modelo base: https://huggingface.co/bigscience/bloom-3b
- Cuantizaciones imatrix/ponderadas: https://huggingface.co/mradermacher/bloom-3b-i1-GGUF
- Pagina de descargas del autor: https://hf.tst.eu/model#bloom-3b-GGUF
- Repositorio de peticiones de cuantizacion: https://huggingface.co/mradermacher/model_requests
- Guia de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Grafico comparativo de cuantizaciones (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas de Artefact2 sobre cuantizacion: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Empresa del autor: https://www.nethype.de/
