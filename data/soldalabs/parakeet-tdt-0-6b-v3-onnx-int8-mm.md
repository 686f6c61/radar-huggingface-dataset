# SoldaLabs/parakeet-tdt-0.6b-v3-onnx-int8-mm

## Resumen

SoldaLabs/parakeet-tdt-0.6b-v3-onnx-int8-mm es una conversión al formato ONNX con cuantización INT8 del modelo de reconocimiento automático del habla (ASR) NVIDIA Parakeet TDT 0.6B v3. El modelo original, desarrollado por NVIDIA, es un sistema de transcripción de voz a texto de aproximadamente 600 millones de parámetros basado en la arquitectura TDT (Token-and-Duration Transducer), diseñado para transcripción de alto rendimiento y con soporte para 25 idiomas europeos.

Esta variante concreta, publicada por SoldaLabs, empaqueta los pesos en ONNX cuantizado a INT8, lo que reduce el peso del modelo y facilita su despliegue en entornos con recursos limitados, como la inferencia en navegador mediante ONNX Runtime Web o en CPU. La model card del autor no incluye documentación adicional más allá de la licencia CC-BY-4.0, por lo que los detalles técnicos proceden del modelo original de NVIDIA y de conversiones equivalentes publicadas por terceros.

La relevancia de esta ficha radica en que permite evaluar rápidamente una alternativa ligera y cuantizada para transcripción multilingüe, aunque la escasez de documentación propia obliga a tratar muchos parámetros como no disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | TDT (Token-and-Duration Transducer), derivada de la familia Parakeet de NVIDIA |
| Parametros totales | aproximadamente 600 millones (0.6B) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | INT8 (variante ONNX int8); el modelo original se distribuye en precisión completa |
| Idiomas soportados | 25 idiomas europeos (según el modelo original de NVIDIA); detección automática de idioma |
| Licencia | CC-BY-4.0 |
| Formato de pesos | ONNX (cuantizado a INT8) |

## Arquitectura y entrenamiento

El modelo subyacente es Parakeet TDT 0.6B v3 de NVIDIA, un sistema ASR basado en la arquitectura Token-and-Duration Transducer. Esta familia sustituye el decodificador CTC o transducer clásico por un mecanismo que predice conjuntamente tokens y duraciones, lo que mejora la eficiencia de decodificación y la calidad en transcripción de voz continua. El modelo original amplía el soporte de idiomas de la versión v2 (solo inglés) a 25 lenguas europeas, con detección automática del idioma de entrada.

Esta variante de SoldaLabs aplica una conversión de NeMo a ONNX y una cuantización a INT8, sin que la model card documente el proceso exacto, el conjunto de calibración ni los datos de entrenamiento originales. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si hubo ajuste fino con RLHF o DPO, ya que se trata de un modelo de ASR y no de un modelo generativo de propósito general.

## Capacidades

- Transcripción de voz a texto (speech-to-text) de audio en 25 idiomas europeos.
- Detección automática del idioma de la entrada, según las capacidades del modelo original.
- Inferencia optimizada para ONNX Runtime, incluyendo despliegue en navegador mediante ONNX Runtime Web con backend WASM.
- Ejecución en CPU gracias a la cuantización INT8, con menor huella de memoria que el modelo en precisión completa.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso, visión ni audio más allá de la transcripción.

## Casos de uso

- Transcripción de reuniones y notas de voz: el modelo puede convertir audio grabado en texto para actas y resúmenes, con soporte multilingüe que cubre equipos europeos.
- Subtitulado automático de vídeo: integrable en pipelines de procesamiento por lotes para generar pistas de subtítulos en varios idiomas europeos.
- Dictado en aplicaciones web: la variante ONNX INT8 permite ejecutar la transcripción en el navegador con ONNX Runtime Web, sin enviar audio a un servidor.
- Atención al cliente basada en voz: transcripción de llamadas para análisis de calidad y generación de transcripciones indexables.
- Accesibilidad: conversión de audio a texto para personas con discapacidad auditiva en aplicaciones de escritorio o web.
- Procesamiento de archivos de audio en servidores sin GPU: la cuantización INT8 reduce los requisitos de memoria y permite desplegar en CPU.
- Búsqueda y análisis de contenido audiovisual: transcripción masiva de archivos para indexación y búsqueda por texto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible para esta variante concreta; el modelo original de 0.6B en precisión completa requiere aproximadamente 2-3 GB, mientras que la versión INT8 reduce la huella de forma significativa.
- GPU recomendadas: no disponibles para esta variante; el modelo original puede ejecutarse en GPU de consumo como RTX 3060 o superiores.
- Cabe en GPU de consumo: previsiblemente sí, dada la cuantización INT8 y el tamaño de 0.6B, aunque no se documentan requisitos exactos.
- Opciones de despliegue: ONNX Runtime (incluido ONNX Runtime Web con WASM), y potencialmente otros runtimes compatibles con ONNX.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| SoldaLabs/parakeet-tdt-0.6b-v3-onnx-int8-mm | ~0.6B | no disponible | 25 idiomas europeos | CC-BY-4.0 | ONNX INT8 |
| nvidia/parakeet-tdt-0.6b-v3 | ~0.6B | no disponible | 25 idiomas europeos | CC-BY-4.0 | NeMo |
| nasedkinpv/parakeet-tdt-0.6b-v3-onnx-int8 | ~0.6B | no disponible | 25 idiomas europeos | CC-BY-4.0 | ONNX INT8 |
| Whisper large-v3 (referencia de categoria) | ~1.5B | no disponible | multilingüe amplio | MIT | varios |

La comparativa se limita a variantes del mismo modelo base y a una referencia genérica de la categoría; no se dispone de datos de rendimiento comparativo para esta variante.

## Limitaciones y advertencias

- La model card del autor no incluye documentación técnica, datos de entrenamiento ni instrucciones de uso, lo que dificulta la reproducibilidad.
- La cuantización INT8 puede degradar la precisión de transcripción respecto al modelo original en precisión completa; no se documenta el impacto.
- No se dispone de información sobre sesgos, riesgo de alucinación en transcripción ni comportamiento en audio ruidoso.
- El soporte de idiomas se limita a 25 lenguas europeas según el modelo original; no cubre otras regiones.
- La licencia CC-BY-4.0 permite uso comercial con atribución, pero no se documentan restricciones adicionales del autor.
- Al ser una conversión de terceros, no hay garantía de mantenimiento ni soporte por parte de NVIDIA.
- La fecha de creación indicada (2026) y la ausencia de descargas o likes sugieren que el repositorio puede ser reciente o poco validado por la comunidad.

## Enlaces

- Hugging Face: https://huggingface.co/SoldaLabs/parakeet-tdt-0.6b-v3-onnx-int8-mm
- Modelo original de NVIDIA: https://huggingface.co/nvidia/parakeet-tdt-0.6b-v3
- Conversión equivalente de terceros: https://huggingface.co/nasedkinpv/parakeet-tdt-0.6b-v3-onnx-int8
