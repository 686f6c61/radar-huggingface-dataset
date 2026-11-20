# nlpai-lab/MixLID

## Resumen

MixLID es un modelo de identificacion de idioma a nivel de token desarrollado por el laboratorio nlpai-lab, disenado especificamente para texto con mezcla de idiomas (code-switching y code-mixing). A diferencia de los clasificadores de idioma clasicos, que asignan un unico idioma a un documento o frase, MixLID localiza los tramos de cada idioma dentro de un texto mixto, incluyendo expresiones cortas embebidas en otro idioma, y devuelve tanto los spans como el idioma predominante de la entrada.

El modelo parte del backbone encoder jhu-clsp/mmBERT-small, al que se anade una cabeza de clasificacion de tokens. Cubre 111 etiquetas de idioma mas tres etiquetas auxiliares para numeros (`NUM`), puntuacion (`PUNCT`) y simbolos (`SYM`), y soporta una ventana de contexto de 8.192 tokens. Con 140.685.426 parametros y un repositorio de 0,6 GB, esta pensado para tareas de etiquetado de secuencias a gran escala donde el coste computacional por documento importa.

Su relevancia actual radica en la necesidad de filtrar y evaluar corpus multilingues de forma fina: los pipelines de datos para entrenamiento de LLM, la evaluacion de la consistencia idiomatica de respuestas generadas y la anotacion de transcripciones de audio mixtas requieren precisamente este nivel de granularidad. La licencia MIT y la compatibilidad con endpoints de Hugging Face facilitan su integracion en produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Encoder transformer (modernbert) con cabeza de clasificacion de tokens |
| Parametros totales | 140.685.426 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 8.192 tokens |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | 111 etiquetas de idioma (afr, als, amh, ara, asm, azj, bam, ben, bod, bul, cat, ceb, ces, ckb, cmn, dan, deu, ekk, ell, eng, eus, fas, fil, fin, fra, fuv, gaz, gug, guj, hat, hau, heb, hin, hrv, hun, hye, ibo, ilo, ind, isl, ita, jav, jpn, kac, kan, kat, kaz, kea, khk, khm, kin, kir, kor, lao, lin, lit, lug, luo, lvs, mal, mar, mkd, mlt, mri, mya, nld, nob, npi, nso, nya, ory, pan, pbt, plt, pol, por, ron, rus, shn, sin, slk, slv, sna, snd, som, sot, spa, srp, ssw, sun, swe, swh, tam, tel, tgk, tha, tir, tsn, tso, tur, ukr, urd, uzn, vie, war, wol, xho, yor, zsm, zul) |
| Licencia | MIT |
| Formato de pesos | safetensors |
| Modelo base | jhu-clsp/mmBERT-small |
| Pipeline | token-classification |
| Etiquetas auxiliares | NUM, PUNCT, SYM |
| Modos de prediccion | token-level (spans) y predominant language por entrada |

## Arquitectura y entrenamiento

MixLID es un encoder transformer basado en la familia ModernBERT, concretamente en la variante mmBERT-small de jhu-clsp, con una cabeza de clasificacion de tokens anadida para el etiquetado BIO de idiomas. El modelo procesa texto monolingue y mixto y produce, para cada subtoken, una etiqueta de idioma; posteriormente fusiona las predicciones de subtokens en spans contiguos con offsets de caracteres y puntuaciones de confianza. La misma cabeza permite derivar el idioma predominante de una entrada completa mediante `predict_sentence()`, sin necesidad de un segundo modelo.

El entrenamiento se realizo sobre una combinacion de conjuntos de datos multilingues: HPLT/OpenLID-v3, igorsterner/acs-corpus, google/smol y facebook/belebele. No se detalla en la informacion disponible el numero exacto de tokens de entrenamiento, la composicion porcentual del dataset ni si se aplicaron tecnicas de RLHF o DPO (no procede en un modelo de clasificacion). La innovacion principal es la capacidad de identificar expresiones cortas embebidas en otro idioma dentro de un texto, algo que los clasificadores de documento no resuelven, junto con la ventana de 8.192 tokens que permite procesar documentos largos sin truncar.

## Capacidades

- Identificacion de idioma a nivel de token con 111 etiquetas de idioma, incluyendo lenguas de bajos recursos (bam, fuv, gaz, gug, kac, kea, khk, lin, lug, luo, nso, nya, pbt, plt, shn, snd, ssw, sun, tsn, tso, uzn, war, wol, xho, yor, zsm, zul).
- Localizacion de spans de idioma dentro de texto mixto, con offsets de caracteres (`start`, `end`) y puntuacion de confianza por span.
- Prediccion del idioma predominante de una entrada completa mediante `predict_sentence()`.
- Etiquetado separado de numeros (`NUM`), puntuacion (`PUNCT`) y simbolos (`SYM`), lo que evita confusiones con idiomas.
- Procesamiento por lotes: tanto `predict_sentence()` como `predict_tokens()` aceptan una cadena o una lista de cadenas.
- Soporte de texto monolingue y code-switching/code-mixing en la misma entrada.
- No soporta tool calling, function calling, agentes ni generacion de texto: es un modelo discriminativo de etiquetado.

## Casos de uso

- Filtrado de corpus multilingues para entrenamiento de LLM: MixLID permite seleccionar documentos en un idioma objetivo y, ademas, localizar y eliminar o marcar los tramos en otros idiomas dentro de un mismo documento, algo que un clasificador de documento no puede hacer. Con 8.192 tokens de contexto se procesan documentos largos sin truncar.
- Evaluacion de consistencia idiomatica en generacion: al medir la proporcion de tokens en el idioma solicitado frente a tokens en otros idiomas, se puede usar como componente de recompensa o como metrica de evaluacion en pipelines de RLHF y generacion controlada por idioma.
- Anotacion de transcripciones de audio mixtas: en la preparacion de corpus de voz, MixLID etiqueta los tramos de cada idioma en la transcripcion y permite compararlos con las predicciones de idioma del lado del audio.
- Enrutamiento de contenido en plataformas multilingues: clasificar comentarios y publicaciones que mezclan idiomas para dirigirlos al moderador o al modelo de respuesta adecuado, usando el idioma predominante y los spans detectados.
- Analisis linguistico de code-switching: estudiar patrones de mezcla de idiomas en redes sociales o foros, con spans y offsets que permiten alinear las etiquetas con anotaciones manuales.
- Preprocesamiento en pipelines de traduccion automatica: detectar segmentos en idiomas distintos dentro de un parrafo para dividir la entrada antes de enviarla al motor de traduccion correspondiente.
- Control de calidad en localizacion de software: verificar que cadenas de interfaz y documentacion no contienen restos de otro idioma, con etiquetas `NUM`/`PUNCT`/`SYM` que evitan falsos positivos en elementos no linguisticos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card menciona las metricas `accuracy` y `f1` en los metadatos, pero no incluye tablas con valores numericos ni comparaciones con otros modelos.

## Requisitos de hardware

- VRAM estimada para inferencia: con 140,7 millones de parametros, en FP32 ocupa aproximadamente 0,56 GB de pesos; en FP16 unos 0,28 GB; en INT8 unos 0,14 GB. La VRAM total necesaria es inferior a 1 GB en cualquier configuracion razonable, incluyendo activaciones y buffers.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM es suficiente. Se puede ejecutar en A100, H100, RTX 4090, RTX 3090, RTX 3060, T4 o incluso en CPU para lotes pequenos.
- Cabe en GPU de consumo: si, en practicamente cualquier GPU consumer moderna (GTX 1650 en adelante) y en CPU.
- Opciones de despliegue: `transformers` con `AutoModel.from_pretrained(..., trust_remote_code=True)` o el modulo local `mixlid.py`; tambien es compatible con endpoints de Hugging Face. No se documentan integraciones con vLLM, llama.cpp, Ollama o TGI, que estan orientados a modelos generativos.
- Latencia y throughput: no disponibles en la informacion proporcionada. Dado el tamano del modelo, se espera un throughput alto en GPU, pero no se aportan cifras.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Enfoque | Licencia |
|---|---|---|---|---|---|
| MixLID | 140,7 M | 8.192 | 111 etiquetas | Token-level LID con spans y idioma predominante | MIT |
| GLiNER-LID / clasificadores LID basados en XLM-R | no disponible | no disponible | variable | Clasificacion de documento o token | variable |
| fastText lid.176 | no disponible | no disponible | 176 | Clasificacion de documento | MIT |

No se dispone de datos de benchmarks que permitan una comparacion cuantitativa con alternativas. La comparativa se limita a caracteristicas estructurales; para una evaluacion de rendimiento seria necesario consultar el paper (arXiv 2610.16601) o ejecutar una evaluacion propia sobre OpenLID-v3 o BELeBele.

## Limitaciones y advertencias

- No es un modelo generativo: no produce texto, no soporta tool calling ni razonamiento multi-paso. Su unico uso es el etiquetado de idioma.
- `predict_sentence()` no divide parrafos en frases; para textos largos con varios idiomas predominantes conviene segmentar manualmente o usar `predict_tokens()`.
- La cobertura de 111 idiomas no garantiza un rendimiento uniforme: los idiomas de bajos recursos del listado (bam, fuv, gaz, gug, kac, kea, khk, lin, lug, luo, nso, nya, pbt, plt, shn, snd, ssw, sun, tsn, tso, uzn, war, wol, xho, yor, zsm, zul) probablemente tengan menos datos de entrenamiento y mayor tasa de error, aunque no se publican metricas por idioma.
- Riesgo de confusion en textos con alfabetos compartidos o lenguas cercanas (por ejemplo, lenguas escandinavas, eslavas o variedades del arabe), no cuantificado en la informacion disponible.
- No se documentan sesgos especificos ni evaluaciones de robustez frente a texto ruidoso, abreviaturas o jerga.
- La licencia MIT permite uso comercial sin restricciones, pero el modelo base mmBERT-small debe verificarse por separado si se redistribuye.
- Requiere `trust_remote_code=True` para cargar los metodos de prediccion desde el Hub, lo que implica ejecutar codigo del repositorio; la alternativa es usar el modulo local `mixlid.py`.
- No se especifican tecnicas de cuantizacion soportadas; el uso en INT8 requeriria conversion manual.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/nlpai-lab/MixLID
- Demo (Hugging Face Space): https://huggingface.co/spaces/hongst/MixLID
- Paper en Hugging Face: https://huggingface.co/papers/2610.16601
- Paper en arXiv: https://arxiv.org/abs/2610.16601
- Modelo base mmBERT-small: https://huggingface.co/jhu-clsp/mmBERT-small
- Dataset HPLT/OpenLID-v3: https://huggingface.co/datasets/HPLT/OpenLID-v3
- Dataset igorsterner/acs-corpus: https://huggingface.co/datasets/igorsterner/acs-corpus
- Dataset google/smol: https://huggingface.co/datasets/google/smol
- Dataset facebook/belebele: https://huggingface.co/datasets/facebook/belebele
