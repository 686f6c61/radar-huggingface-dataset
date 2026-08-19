# csikasote/omniASR-CTC-300m-Zulu-All-v2

## Resumen

El modelo `csikasote/omniASR-CTC-300m-Zulu-All-v2` es un sistema de reconocimiento automático del habla (ASR) especializado en isiZulu, desarrollado como un ajuste fino (fine-tuning) del modelo base `facebook/omniASR-CTC-300M` de Meta. Está construido sobre el framework fairseq2 y utiliza una arquitectura basada en CTC (Connectionist Temporal Classification), lo que permite una transcripción rápida y eficiente, adecuada para aplicaciones en tiempo real. El modelo fue entrenado durante 690.000 pasos, logrando un WER (Word Error Rate) de validación de 17,75 en el mejor checkpoint (paso 685.000) y 17,83 en el paso final.

Su relevancia radica en que aborda la escasez de modelos ASR de código abierto para lenguas africanas de bajos recursos como el isiZulu, ofreciendo una alternativa ligera (300M parámetros) y con licencia Apache 2.0, lo que facilita su integración comercial y académica. Aunque el checkpoint se distribuye en formato nativo de fairseq2 (no directamente cargable con `AutoModelForCTC` sin conversión), incluye scripts de ejemplo para facilitar su uso.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible (modelo base OmniASR-CTC-300M, probablemente encoder transformer con cabezal CTC) |
| Parametros totales | 300M (según nombre del modelo base, no confirmado en la ficha) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (en ASR se refiere a ventana de audio; no especificada) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | isiZulu (`zul_Latn`) |
| Licencia | Apache-2.0 |
| Formato de pesos | Checkpoint nativo fairseq2 (`.pt`) y tokenizer `.model` |

## Arquitectura y entrenamiento

El modelo es un ajuste fino de `facebook/omniASR-CTC-300M`, un sistema de reconocimiento de voz multilingüe de Meta que emplea una arquitectura encoder-transformer con un cabezal de clasificación CTC. El entrenamiento se realizó con el framework fairseq2 sobre datos de habla en isiZulu, alcanzando 690.000 pasos de entrenamiento. El mejor checkpoint se obtuvo en el paso 685.000 con un WER de validación de 17,75, mientras que el paso final (690.000) presentó un WER de 17,83, indicando una ligera degradación tras el punto óptimo.

No se han proporcionado detalles sobre la composición del dataset de entrenamiento, el número de horas de audio, ni si se aplicaron técnicas como aumento de datos o regularización específica. Tampoco se especifica si se utilizaron estrategias de decodificación adicionales más allá del CTC estándar. El modelo se distribuye únicamente como checkpoint nativo de fairseq2, sin conversión a formatos estándar como safetensors o GGUF.

## Capacidades

- Transcripción de audio en isiZulu a texto, con soporte para el alfabeto latino (`zul_Latn`).
- Reconocimiento de voz en tiempo real gracias a la arquitectura CTC, que permite decodificación no autoregresiva y baja latencia.
- Adecuado para audio de campo o grabaciones con ruido moderado, aunque el rendimiento exacto en condiciones adversas no está documentado.
- No incluye capacidades de traducción, síntesis de voz ni procesamiento multimodal; es exclusivamente ASR.
- No se ha verificado soporte para tool calling, agentes o razonamiento multi-paso, ya que su función es puramente de transcripción.

## Casos de uso

- Transcripción de reuniones y entrevistas en isiZulu: el modelo puede convertir grabaciones de audio en texto, facilitando la generación de actas o subtítulos. Su baja latencia permite procesamiento en streaming.
- Subtitulado automático de vídeos en isiZulu: integrable en pipelines de postproducción para generar subtítulos en tiempo real o diferido, reduciendo costes frente a servicios comerciales.
- Asistentes de voz para aplicaciones móviles: al ser ligero (300M parámetros) y de código abierto, puede desplegarse en dispositivos con GPU modesta para comandos de voz en isiZulu.
- Investigación lingüística y preservación del idioma: útil para digitalizar archivos orales históricos o crear corpus transcritos de isiZulu, contribuyendo al desarrollo de recursos lingüísticos.
- Servicios de accesibilidad: transcripción de contenido educativo o gubernamental para personas con discapacidad auditiva, en un idioma con poca cobertura comercial.
- Automatización de centros de llamadas: transcripción de conversaciones de atención al cliente en isiZulu para análisis de calidad o generación de resúmenes.

## Benchmarks y rendimiento

El único dato de rendimiento disponible es el WER de validación reportado en la model card. No se han publicado resultados en benchmarks estándar como MMLU, HumanEval o GSM8K, ya que no es un modelo de lenguaje general. A continuación se presenta la comparación con otro modelo similar encontrado en la búsqueda web:

| Modelo | WER de validación (mejor checkpoint) | Paso de entrenamiento |
|---|---|---|
| `csikasote/omniASR-CTC-300m-Zulu-All-v2` | 17,75 | 685.000 |
| `uctnlp/omniASR-CTC-300m-v2-Zulu` | 27,25 | 38.500 |

El modelo evaluado muestra un WER significativamente menor que el de la alternativa, lo que sugiere un mejor ajuste al dominio isiZulu, aunque ambos parten del mismo modelo base.

## Requisitos de hardware

- VRAM estimada: para un modelo de 300M parámetros en FP32 (~1,2 GB), se necesitan al menos 2 GB de VRAM para inferencia básica. Con cuantización a 8 bits, la huella se reduce a ~0,6 GB, aunque no se han publicado versiones cuantizadas.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM (por ejemplo, NVIDIA T4, RTX 3050, GTX 1650) puede ejecutar el modelo. Para entrenamiento o fine-tuning adicional, se recomienda una GPU con 8-16 GB (RTX 3060, A10, V100).
- Compatibilidad con consumer GPU: sí, el modelo es lo suficientemente pequeño para ejecutarse en GPUs de consumo como la RTX 3060 o incluso en CPU con baja latencia, aunque el rendimiento en CPU no está documentado.
- Opciones de despliegue: dado que el checkpoint es nativo de fairseq2, se requiere usar fairseq2 para cargarlo. No se han proporcionado integraciones con vLLM, Ollama o TGI. El script de ejemplo `examples/inference.py` muestra cómo descargar e inspeccionar el checkpoint.
- Latencia y throughput: no disponibles. Al ser un modelo CTC, se espera una latencia menor que los modelos autoregresivos, pero no se han publicado mediciones concretas.

## Comparativa con modelos similares

| Modelo | Parámetros | Idioma | WER | Licencia | Formato |
|---|---|---|---|---|---|
| `csikasote/omniASR-CTC-300m-Zulu-All-v2` | 300M | isiZulu | 17,75 | Apache-2.0 | fairseq2 nativo |
| `uctnlp/omniASR-CTC-300m-v2-Zulu` | 300M | isiZulu | 27,25 | Apache-2.0 | fairseq2 nativo |
| `facebook/omniASR-CTC-300M` (base) | 300M | multilingüe (sin isiZulu específico) | no disponible | Apache-2.0 | fairseq2 nativo |

El modelo evaluado supera claramente a la alternativa de `uctnlp` en WER, lo que indica un mejor ajuste al dominio. El modelo base de Meta es multilingüe, pero no está optimizado para isiZulu, por lo que el fine-tuning es necesario para obtener un rendimiento competitivo en este idioma.

## Limitaciones y advertencias

- El checkpoint se distribuye en formato nativo de fairseq2, lo que requiere conversión para usarlo con librerías estándar como Hugging Face Transformers (`AutoModelForCTC`). Esto puede añadir fricción en la integración.
- El modelo está especializado únicamente en isiZulu; no soporta otros idiomas, por lo que no es adecuado para sistemas multilingües sin entrenamiento adicional.
- No se han documentado los datos de entrenamiento ni el dominio específico del audio (por ejemplo, si incluye acentos regionales, ruido, habla espontánea, etc.), lo que limita la confianza en su generalización a otros contextos.
- El WER reportado es de validación, pero no se especifica el conjunto de validación ni las condiciones de grabación, por lo que puede variar en entornos reales.
- Riesgo de alucinación o errores en transcripciones de audio con mala calidad, superposiciones de hablantes o vocabulario técnico poco común.
- La licencia Apache-2.0 permite uso comercial, pero es recomendable verificar que los datos de entrenamiento no incluyan contenido con derechos de autor o privacidad no resuelta.
- No se incluyen versiones cuantizadas ni adaptaciones para despliegue en dispositivos de bajo consumo, lo que puede limitar su uso en edge computing.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/csikasote/omniASR-CTC-300m-Zulu-All-v2
- Repositorio similar (uctnlp): https://huggingface.co/uctnlp/omniASR-CTC-300m-v2-Zulu
- Documentación de modelos CTC en OmniASR (DeepWiki): https://deepwiki.com/facebookresearch/omnilingual-asr/2.2.2-ctc-models-(fast-asr)
- Repositorio East Africa OmniASR (ejemplo de fine-tuning para lenguas africanas): https://github.com/mutaician/east-africa-omniasr
- Modelo base de Meta: https://huggingface.co/facebook/omniASR-CTC-300M
