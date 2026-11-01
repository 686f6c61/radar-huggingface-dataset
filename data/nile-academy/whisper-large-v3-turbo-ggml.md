# nile-academy/whisper-large-v3-turbo-ggml

## Resumen

Whisper Large v3 Turbo GGML es una conversión a formato GGML (cuantización Q5_0) del modelo Whisper Large v3 Turbo de OpenAI, publicada por el usuario nile-academy en HuggingFace. Whisper es un sistema de reconocimiento automático del habla (ASR) basado en una arquitectura transformer encoder-decoder entrenado con 680.000 horas de audio supervisado multilingüe, y la variante Turbo reduce el número de capas del decoder de 32 a 4 para acelerar la inferencia manteniendo una cobertura de 99 idiomas.

El repositorio no contiene el modelo original en safetensors, sino una conversión declarativa a GGML Q5_0 (2,2 GB) junto con ficheros de manifiesto (`source-manifest.json`, `files.json`) que preservan hashes y revisiones inmutables del origen. La model card es explícita: no se reclama una cualificación de runtime exitosa ni se mide el impacto de precisión de la cuantización Q5_0, y el espejo no habilita ni recomienda una ruta de ejecución concreta.

Su relevancia radica en que permite ejecutar un modelo ASR multilingüe de referencia en hardware de consumo mediante llama.cpp u otros runtimes compatibles con GGML, aunque el propio autor advierte que la validación de inteligibilidad en todos los idiomas, la estabilidad en audio largo y el rendimiento sostenido en móvil/navegador quedan como puertas de calidad separadas no superadas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (Whisper Large v3 Turbo) |
| Parametros totales | 809 M (variante Turbo de Whisper Large v3) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 30 segundos de audio por ventana (ventana nativa de Whisper) |
| Tipos de cuantizacion | Q5_0 (GGML); el repo contiene únicamente esta conversión |
| Idiomas soportados | 99 idiomas, entre ellos en, zh, de, es, ru, ko, fr, ja, pt, tr, pl, ca, nl, ar, sv, it, id, hi, fi, vi, he, uk, el, ms, cs, ro, da, hu, ta, no, th, ur, hr, bg, lt, la, mi, ml, cy, sk, te, fa, lv, bn, sr, az, sl, kn, et, mk, br, eu, is, hy, ne, mn, bs, kk, sq, sw, gl, mr, pa, si, km, sn, yo, so, af, oc, ka, be, tg, sd, gu, am, yi, lo, uz, fo, ht, ps, tk, nn, mt, sa, lb, my, bo, tl, mg, as, tt, haw, ln, ha, ba, jv, su, yue |
| Licencia | MIT |
| Formato de pesos | GGML (Q5_0); tamaño del repo 2,2 GB |

## Arquitectura y entrenamiento

Whisper Large v3 Turbo es un transformer encoder-decoder con atención estándar. La variante Turbo reduce el decoder a 4 capas (frente a las 32 de Large v3) manteniendo el encoder completo, lo que rebaja los parámetros a 809 M y acelera la decodificación aproximadamente 8 veces respecto a Large v3, con una degradación de precisión que OpenAI describe como mínima en su publicación original. El entrenamiento original de Whisper se realizó sobre 680.000 horas de audio débilmente supervisado, con transcripciones y traducción a inglés como tareas multitarea, y sin RLHF ni DPO: es un modelo puramente supervisado.

Esta publicación concreta no aporta información nueva sobre el entrenamiento; se limita a preservar la procedencia del modelo original de OpenAI mediante `source-manifest.json` (revisiones y hashes inmutables) y `files.json` (vinculación exacta del espejo). La conversión a GGML Q5_0 es una operación de cuantización post-entrenamiento cuyo impacto en precisión el autor declara explícitamente como no medido. No se documentan innovaciones adicionales como decodificación especulativa o atención lineal.

## Capacidades

- Reconocimiento automático del habla (transcripción) en 99 idiomas.
- Traducción de voz a texto en inglés (task `translate`) además de transcripción en el idioma original.
- Detección automática de idioma en el audio de entrada.
- Segmentación con marcas de tiempo a nivel de segmento.
- Manejo de audio de hasta 30 segundos por ventana; para audio más largo requiere troceado y concatenación por parte del pipeline.
- Robusteza a ruido y acentos variable según idioma, sin garantía de calidad homogénea (el autor lo indica explícitamente).
- No soporta tool calling, function calling, agentes ni razonamiento multi-step: es un modelo ASR puro.
- No tiene modo thinking, visión ni audio generativo.

## Casos de uso

- Transcripción de reuniones y entrevistas: se trocea el audio en ventanas de 30 s, se transcribe cada una con el modelo Q5_0 y se concatenan los segmentos con sus marcas de tiempo; la ventana nativa de Whisper encaja con este patrón y el tamaño reducido permite ejecutarlo en portátiles.
- Subtitulado automático multilingüe: la tarea `translate` permite generar subtítulos en inglés a partir de audio en cualquiera de los 99 idiomas soportados, útil para plataformas de vídeo con contenido internacional.
- Dictado y accesibilidad en escritorio: al ser GGML Q5_0 (2,2 GB), puede integrarse en aplicaciones de escritorio con llama.cpp para dictado local sin dependencia de la nube, aunque el autor no certifica rendimiento sostenido en móvil/navegador.
- Indexación y búsqueda de archivos de audio: transcripción por lotes de un archivo histórico de grabaciones para generar texto buscable, aprovechando la cobertura de idiomas para corpus heterogéneos.
- Análisis de llamadas de atención al cliente: transcripción local de conversaciones telefónicas para extraer métricas y temas, con la ventaja de que los datos no salen del entorno (licencia MIT y ejecución offline).
- Investigación lingüística y corpus: generación de transcripciones preliminares en idiomas de bajos recursos (yue, haw, mi, bo, etc.) para anotación posterior, teniendo en cuenta que la calidad no está garantizada por igual en todos los idiomas.
- Prototipado de pipelines ASR: servir como baseline cuantizado para comparar latencia y precisión frente a otras cuantizaciones o al modelo original antes de fijar una ruta de producción.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas de WER, latencia ni comparativas numéricas, y declara explícitamente que el impacto de precisión de la conversión Q5_0 no ha sido medido y que no se reclama una cualificación de runtime exitosa.

## Requisitos de hardware

- VRAM estimada: el fichero Q5_0 ocupa 2,2 GB; la inferencia completa cabe holgadamente en GPUs con 4 GB o más, y en CPU con suficiente RAM.
- GPU recomendadas: cualquier GPU consumer moderna (RTX 3060, RTX 4060, RTX 4090) es sobrada para este tamaño; también A100/H100 si se busca throughput por lotes.
- Cabe en GPU consumer: sí, en prácticamente todas las dedicadas de los últimos años; también en iGPU y CPU.
- Opciones de despliegue: llama.cpp y derivados compatibles con GGML (por ejemplo, servidores basados en llama.cpp); el autor no habilita ni recomienda una ruta de runtime concreta y advierte que los binarios de motor requieren registros y derechos separados.
- Latencia y throughput: no disponibles. El autor indica que el rendimiento sostenido en móvil/navegador y la estabilidad en audio largo son puertas de calidad separadas no superadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| Whisper Large v3 Turbo GGML Q5_0 (este) | 809 M | 30 s por ventana | 99 | MIT | GGML Q5_0 |
| Whisper Large v3 Turbo (original OpenAI) | 809 M | 30 s por ventana | 99 | MIT | safetensors |
| Whisper Large v3 (original OpenAI) | 1,55 B | 30 s por ventana | 99 | MIT | safetensors |
| Whisper Small | 244 M | 30 s por ventana | 99 | MIT | safetensors |

La comparativa se limita a la familia Whisper porque no se dispone de datos de benchmarks de esta conversión que permitan contrastarla numéricamente con alternativas de otros autores. Frente al Turbo original, esta versión sacrifica precisión no medida a cambio de un tamaño de 2,2 GB y ejecución en CPU; frente a Large v3, es aproximadamente la mitad de parámetros y más rápida en decodificación.

## Limitaciones y advertencias

- El impacto de precisión de la cuantización Q5_0 no ha sido medido; puede degradar el WER respecto al modelo original.
- El autor no reclama una cualificación de runtime exitosa: la ejecución en Windows no alcanzó su plazo original en el entorno del publicador.
- La calidad no es homogénea entre los 99 idiomas; el catálogo no implica igual rendimiento en todas las voces e idiomas.
- Ventana nativa de 30 segundos: el audio largo requiere troceado externo y puede sufrir inestabilidad en la concatenación.
- Riesgo de alucinación en segmentos con silencio, ruido o habla solapada, comportamiento conocido de la familia Whisper.
- Sesgos heredados del entrenamiento débilmente supervisado de OpenAI (dominio de inglés y acentos sobrerrepresentados).
- La licencia MIT permite uso comercial, pero no concede derechos sobre identidades de terceros, grabaciones de referencia ni contenido de aplicación; los motores ejecutables y librerías de watermark requieren registros y derechos separados.
- El repositorio contiene solo datos declarativos (modelo, tokenizer, avisos); no incluye SDK, binarios ni código de ejecución.
- No apto para tareas de razonamiento, generación de texto, código o agentes: es exclusivamente ASR.

## Enlaces

- [HuggingFace: nile-academy/whisper-large-v3-turbo-ggml](https://huggingface.co/nile-academy/whisper-large-v3-turbo-ggml)
- [Repositorio oficial de OpenAI Whisper](https://github.com/openai/whisper)
