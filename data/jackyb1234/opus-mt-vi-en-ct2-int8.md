# jackyb1234/opus-mt-vi-en-ct2-int8

## Resumen

opus-mt-vi-en-ct2-int8 es una conversión cuantizada a int8 mediante CTranslate2 del modelo de traducción automática Helsinki-NLP/opus-mt-vi-en, desarrollado originalmente por el grupo Language Technology de la Universidad de Helsinki dentro del proyecto OPUS. El modelo traduce exclusivamente de vietnamita a inglés y está pensado para inferencia en CPU, con especial énfasis en arquitecturas ARM64 (serie Cortex-A), lo que lo hace adecuado para despliegues en dispositivos de borde, sistemas embebidos y servidores sin GPU.

La arquitectura subyacente es MarianMT, un transformer encoder-decoder con aproximadamente 74 millones de parámetros. La conversión a CTranslate2 int8 reduce el peso en disco a unos 145 MB (el repositorio completo ocupa 0,1 GB), lo que permite ejecutarlo en entornos con memoria muy limitada. El autor de la cuantización es @dekthedev, y la model card reporta un BLEU de 42,8 sobre el conjunto Tatoeba VI-EN y una velocidad estimada de 300 a 500 tokens por segundo en ARM64.

Su relevancia actual reside en la combinación de licencia Apache 2.0, tamaño reducido y formato optimizado para CPU: es una pieza práctica para pipelines de traducción de bajo coste, preprocesado multilingüe o traducción local sin dependencia de servicios en la nube. No obstante, el repositorio publicado bajo el identificador jackyb1234/opus-mt-vi-en-ct2-int8 no incluye documentación propia más allá de los metadatos, y la model card disponible corresponde a la conversión original de dekthedev.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MarianMT (transformer encoder-decoder) |
| Parametros totales | 74M |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | int8 (CTranslate2) |
| Idiomas soportados | vietnamita (vi) → inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | CTranslate2 (`model.bin`), tokenizer SentencePiece (`source.spm`, `target.spm`), `vocab.json` |

## Arquitectura y entrenamiento

El modelo base Helsinki-NLP/opus-mt-vi-en emplea la arquitectura MarianMT, un transformer encoder-decoder con atención multi-cabeza estándar, diseñado específicamente para traducción automática neuronal. MarianMT fue desarrollado por Microsoft Research y adoptado por el proyecto OPUS de la Universidad de Helsinki para entrenar pares de traducción sobre corpus paralelos multilingües. El modelo original se entrenó sobre datos paralelos del corpus OPUS para el par vietnamita-inglés; la model card no detalla el número exacto de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO.

La versión aquí descrita es una conversión a CTranslate2 con cuantización int8 de los pesos, realizada por @dekthedev. CTranslate2 es un motor de inferencia optimizado que aplica cuantización de pesos y operadores fusionados para acelerar la ejecución en CPU, con soporte específico para ARM64. La conversión no modifica la arquitectura ni el vocabulario, sino únicamente la representación numérica de los pesos y el formato de serialización. No se documentan innovaciones adicionales como decodificación especulativa o atención lineal.

## Capacidades

- Traducción de texto de vietnamita a inglés, en una única dirección.
- Ejecución en CPU con cuantización int8, optimizada para ARM64 (Cortex-A).
- Tokenización mediante SentencePiece con modelos separados para origen y destino.
- Integración con la API de CTranslate2 (`Translator.translate_batch`) y con `MarianTokenizer` de Transformers.
- Uso en pipelines de traducción por lotes gracias a `translate_batch`.
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso.
- No dispone de modo thinking, visión, audio ni otras capacidades multimodales.
- Cobertura lingüística limitada al par vi-en; no es un modelo multilingüe general.

## Casos de uso

- Traducción local en dispositivos de borde: al ocupar unos 145 MB en int8 y ejecutarse en CPU ARM64, puede desplegarse en Raspberry Pi o dispositivos Cortex-A para traducir texto sin conexión ni GPU.
- Preprocesado de corpus vietnamitas: traducción por lotes de documentos, reseñas o datasets antes de alimentar modelos de análisis en inglés, usando `translate_batch` para procesar múltiples segmentos.
- Atención al cliente en vietnamita: traducción de mensajes entrantes de usuarios vietnamitas a inglés para que un sistema posterior (clasificador, LLM, agente) los procese, manteniendo la inferencia en servidores CPU de bajo coste.
- Traducción de documentación técnica: conversión de manuales o guías en vietnamita a inglés como paso previo a la revisión humana, con la ventaja de una licencia Apache 2.0 que permite uso comercial.
- Pipelines de CI/CD para localización: integración del modelo en flujos automatizados que traduzcan cadenas de recursos o ficheros de internacionalización en cada commit, sin depender de APIs externas.
- Investigación en traducción automática de bajo recursos: uso como línea base ligera para experimentos con el par vi-en, comparando cuantizaciones o midiendo BLEU sobre Tatoeba.
- Servicio de traducción en entornos air-gapped: despliegue en infraestructura sin acceso a internet, donde no es posible recurrir a servicios en la nube, gracias al formato CTranslate2 y a la ausencia de dependencias de red.

## Benchmarks y rendimiento

| Benchmark | Resultado | Notas |
|---|---|---|
| BLEU (Tatoeba VI-EN) | 42,8 | Reportado en la model card de la conversión |
| Velocidad en ARM64 (estimada) | 300–500 tok/s | Estimación del autor, no medida de forma independiente |

No se han publicado resultados de MMLU, HumanEval, GSM8K ni otros benchmarks de razonamiento en la información disponible, ya que se trata de un modelo especializado en traducción.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica en el caso objetivo (CPU); en GPU, el modelo int8 de 74M parámetros ocupa del orden de 145 MB de pesos, por lo que cabría en cualquier GPU con más de 1 GB de memoria.
- GPU recomendadas: no es el objetivo del modelo; cualquier GPU moderna (RTX 4090, A100, H100) podría ejecutarlo, pero el rendimiento óptimo declarado es en CPU.
- Cabe en GPU de consumo: sí, en cualquier GPU de consumo actual, aunque el diseño está orientado a CPU.
- Cabe en CPU: sí, es su entorno principal; optimizado para ARM64 (Cortex-A) y también ejecutable en x86.
- Opciones de despliegue: CTranslate2 (motor nativo), con tokenización vía `MarianTokenizer` de Transformers. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, ya que estos motores no están orientados a MarianMT en formato CTranslate2.
- Latencia y throughput: 300–500 tokens por segundo estimados en ARM64 según el autor; no se proporcionan cifras para x86 ni para GPU.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| jackyb1234/opus-mt-vi-en-ct2-int8 | 74M | no disponible | Apache 2.0 | CTranslate2 int8 | Cuantizado para CPU/ARM64, BLEU 42,8 en Tatoeba VI-EN |
| Helsinki-NLP/opus-mt-vi-en | 74M | no disponible | Apache 2.0 (modelo base) | safetensors/PyTorch | Modelo original sin cuantizar; requiere más memoria y GPU o CPU con Transformers |
| Otros modelos MarianMT vi-en del proyecto OPUS | ~74M | no disponible | Apache 2.0 | PyTorch | Variantes del mismo par con posibles diferencias de entrenamiento; no verificadas en la información disponible |
| Modelos NMT multilingües de mayor tamaño (p. ej. NLLB) | no disponible | no disponible | no disponible | no disponible | Alternativas de mayor capacidad pero mucho mayor peso; no comparadas con datos en la información proporcionada |

## Limitaciones y advertencias

- El modelo traduce únicamente de vietnamita a inglés; no soporta la dirección inversa ni otros pares lingüísticos.
- Al ser un modelo de 74M parámetros, su calidad en dominios especializados (legal, médico, técnico) será inferior a la de modelos NMT de mayor tamaño.
- Riesgo de alucinación y de traducciones inexactas en frases ambiguas, modismos o texto con ruido; se recomienda revisión humana en contextos críticos.
- No se documentan sesgos específicos, pero al entrenarse sobre corpus OPUS puede heredar sesgos de género, culturales y de dominio presentes en los datos paralelos.
- La longitud de contexto no está especificada en la información disponible; los modelos MarianMT suelen limitarse a segmentos cortos, por lo que no es adecuado para documentos largos sin segmentación previa.
- La licencia Apache 2.0 permite uso comercial, pero el repositorio publicado bajo jackyb1234 no incluye model card propia ni garantías del autor de la conversión; conviene verificar la procedencia y los términos antes de un despliegue en producción.
- El rendimiento reportado (300–500 tok/s en ARM64) es una estimación del autor, no una medición independiente.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, lo que implica ausencia de validación comunitaria.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/jackyb1234/opus-mt-vi-en-ct2-int8
- Modelo base: https://huggingface.co/Helsinki-NLP/opus-mt-vi-en
- Conversión original de @dekthedev: https://huggingface.co/dekthedev/opus-mt-vi-en-ct2-int8
- Perfil del autor de la cuantización: https://huggingface.co/dekthedev
- CTranslate2 (repositorio): https://github.com/OpenNMT/CTranslate2
- Proyecto OPUS (Universidad de Helsinki): https://opus.nlpl.eu/
- Paper de MarianMT: https://arxiv.org/abs/1804.00344
