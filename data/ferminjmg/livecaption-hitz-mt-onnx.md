# ferminjmg/livecaption-hitz-mt-onnx

## Resumen

`ferminjmg/livecaption-hitz-mt-onnx` es una exportación a formato ONNX de los modelos de traducción automática neuronal euskera-castellano desarrollados por HiTZ Zentroa (UPV/EHU). Concretamente, empaqueta dos modelos Marian en un único repositorio: `mt-hitz-eu-es` para la dirección euskera a castellano y `mt-hitz-es-eu` para castellano a euskera. No introduce cambios en los pesos originales; la única modificación es la conversión del formato PyTorch a ONNX float32, con codificador y decodificador sin caché.

El modelo resuelve la necesidad de traducción bidireccional de alta calidad entre una lengua minoritaria como el euskera y el castellano, sin depender de servicios en la nube. Su relevancia radica en que permite el despliegue local y ligero en aplicaciones de subtitulado en tiempo real, como LiveCaption Studio, evitando la necesidad de un entorno Python con PyTorch en el dispositivo del usuario final.

La arquitectura subyacente es Marian, una arquitectura transformer encoder-decoder específicamente diseñada para traducción automática. El repositorio tiene un tamaño de 0,8 GB y está publicado bajo licencia Apache-2.0, lo que facilita su integración en productos comerciales. Todo el mérito del entrenamiento corresponde a HiTZ; esta copia existe únicamente para facilitar la distribución de los modelos ya convertidos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (Marian) |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | float32 (única versión publicada) |
| Idiomas soportados | euskera (eu), castellano (es) |
| Licencia | Apache-2.0 |
| Formato de pesos | ONNX (`encoder_model.onnx`, `decoder_model.onnx`) |

## Arquitectura y entrenamiento

Los modelos originales de HiTZ emplean la arquitectura Marian, un transformer encoder-decoder optimizado para traducción automática neuronal. Esta exportación mantiene intactos los pesos y la configuración del modelo original; únicamente se ha realizado la conversión a ONNX float32, separando el codificador y el decodificador en dos grafos independientes y sin implementar caché de claves y valores en el decodificador.

No se dispone de información sobre el volumen de datos de entrenamiento, la composición del corpus, ni si se aplicaron técnicas de RLHF o ajuste fino supervisado en los modelos originales de HiTZ. El tokenizador y la configuración de generación son los del modelo original, e incluyen los ficheros `source.spm`, `target.spm`, `vocab.json`, `config.json`, `generation_config.json`, `tokenizer_config.json` y `special_tokens_map.json`.

## Capacidades

- Traducción automática bidireccional entre euskera y castellano.
- Traducción euskera a castellano mediante el submodelo `mt-hitz-eu-es-onnx`.
- Traducción castellano a euskera mediante el submodelo `mt-hitz-es-eu-onnx`.
- Inferencia local sin dependencia de servicios en la nube ni de PyTorch.
- Integración en aplicaciones de subtitulado en tiempo real (LiveCaption Studio).
- Ejecución mediante runtimes ONNX en entornos sin Python.
- Generación con búsqueda voraz validada (equivalencia con el modelo original en 60 de 60 frases).

## Casos de uso

- Subtitulado en tiempo real de vídeo o audio en euskera y castellano: el modelo puede traducir segmentos de texto cortos con baja latencia, integrándose en pipelines de captura de audio y reconocimiento del habla para generar subtítulos bilingües.
- Aplicaciones de escritorio o móviles sin conectividad: al estar en formato ONNX, puede ejecutarse con runtimes ligeros en dispositivos sin GPU dedicada ni entorno Python, lo que permite ofrecer traducción offline.
- Traducción de documentación administrativa bilingüe: útil en el País Vasco para convertir comunicaciones oficiales entre euskera y castellano de forma automática y local.
- Localización de interfaces de usuario: traducción de cadenas de texto cortas en aplicaciones que necesiten soporte bilingüe eu-es sin coste por llamada a API.
- Herramientas de accesibilidad: integración en sistemas de lectura o transcripción que requieran traducción simultánea para usuarios que hablan una u otra lengua.
- Preprocesamiento en pipelines de datos: traducción de corpus en euskera a castellano (o viceversa) para tareas posteriores de análisis, indexación o entrenamiento de otros modelos.
- Integración en sistemas de atención al ciudadano: traducción automática de consultas y respuestas en entornos públicos donde se requiera atender en ambas lenguas oficiales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card únicamente indica que la versión float32 produjo exactamente las mismas traducciones que el modelo original en PyTorch para 60 de 60 frases con búsqueda voraz, lo que confirma la equivalencia funcional de la exportación, pero no aporta métricas de calidad (BLEU, chrF, etc.).

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible con precisión; el repositorio completo ocupa 0,8 GB, por lo que la inferencia en float32 requiere del orden de 1 GB de memoria o menos, dependiendo del runtime.
- GPU recomendadas: cualquier GPU con al menos 2 GB de memoria; no se requiere hardware de gama alta.
- Cabe en GPU de consumo: sí, en cualquier GPU consumer moderna (GTX 1050 o superior, RTX 3060, RTX 4090, etc.), así como en CPU.
- Opciones de despliegue: ONNX Runtime (CPU o GPU), así como cualquier runtime compatible con ONNX. No se proporcionan pesos GGUF, por lo que llama.cpp u Ollama no son aplicables directamente sin conversión adicional.
- Latencia y throughput estimados: no disponibles. Al tratarse de un modelo Marian de tamaño moderado y sin caché en el decodificador, la latencia será mayor que con versiones con caché, especialmente en secuencias largas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| ferminjmg/livecaption-hitz-mt-onnx | no disponible | no disponible | eu, es | Apache-2.0 | ONNX |
| HiTZ/mt-hitz-eu-es | no disponible | no disponible | eu, es | Apache-2.0 | PyTorch |
| HiTZ/mt-hitz-es-eu | no disponible | no disponible | eu, es | Apache-2.0 | PyTorch |
| Helsinki-NLP/opus-mt-eu-es | no disponible | no disponible | eu, es | no disponible | PyTorch |

La comparativa se limita a los modelos originales de HiTZ (equivalentes funcionales en PyTorch) y a la familia OPUS-MT de Helsinki-NLP, que cubre pares de lenguas similares. No se dispone de datos de rendimiento comparativo entre ellos en la información proporcionada.

## Limitaciones y advertencias

- El decodificador ONNX no implementa caché de claves y valores, lo que puede incrementar la latencia en secuencias largas en comparación con el modelo original en PyTorch.
- Solo se ha publicado la versión float32; no hay versiones cuantizadas (int8, fp16) que reduzcan el tamaño o aceleren la inferencia.
- La cobertura lingüística se limita estrictamente a euskera y castellano; no admite otros idiomas.
- No se dispone de información sobre sesgos, riesgo de alucinación o comportamiento en dominios especializados (legal, médico, técnico).
- La licencia Apache-2.0 permite uso comercial, pero se recomienda citar y enlazar los modelos originales de HiTZ como solicita el autor.
- Al ser una exportación sin cambios en los pesos, las limitaciones del modelo original de HiTZ se trasladan íntegramente a esta versión.
- No se han publicado métricas de calidad de traducción (BLEU, chrF) en la información disponible, por lo que la evaluación en producción requeriría una validación propia.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/ferminjmg/livecaption-hitz-mt-onnx
- Modelo original euskera a castellano: https://huggingface.co/HiTZ/mt-hitz-eu-es
- Modelo original castellano a euskera: https://huggingface.co/HiTZ/mt-hitz-es-eu
- HiTZ Zentroa (UPV/EHU): https://hitz.eus
