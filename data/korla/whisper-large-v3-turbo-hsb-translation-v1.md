# Korla/whisper-large-v3-turbo-hsb-translation-v1

## Resumen

Korla/whisper-large-v3-turbo-hsb-translation-v1 es un modelo de traducción automática de voz (speech translation) desarrollado por Korla, basado en el modelo Whisper Large-v3 Turbo de OpenAI. Está específicamente afinado para traducir habla en alto sorabo (hsb), una lengua eslava minoritaria hablada en Alemania, al alemán. El entrenamiento se realizó con datos proporcionados por la fundación Załožba za serbski lud, dedicada a la preservación de la cultura y lengua soraba.

El modelo cuenta con 808,9 millones de parámetros y se distribuye en formato safetensors bajo licencia CC-BY-SA-4.0. Es una adaptación del Whisper Large-v3 Turbo, que ya ofrece una velocidad de inferencia superior al Large-v3 original con una degradación mínima en precisión. Este modelo concreto se centra exclusivamente en la traducción de voz, no en la transcripción, y requiere configurar el idioma de entrada como "czech" y el modo "translate" para funcionar correctamente.

Su relevancia radica en abordar un par de idiomas con escasos recursos digitales, facilitando la accesibilidad y preservación del alto sorabo mediante tecnología de IA de código abierto. Es un ejemplo de adaptación de modelos multilingües a lenguas minoritarias con datos limitados.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Whisper Large-v3 Turbo (transformer encoder-decoder) |
| Parametros totales | 808.878.080 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (Whisper procesa ventanas de audio de 30 segundos) |
| Tipos de cuantizacion | no disponible (pesos en safetensors, probablemente FP32/FP16) |
| Idiomas soportados | alto sorabo (entrada), aleman (salida) |
| Licencia | CC-BY-SA-4.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de la arquitectura Whisper Large-v3 Turbo, un transformer encoder-decoder optimizado por OpenAI que reduce el coste computacional respecto al Large-v3 original manteniendo una precisión similar. Sobre esta base, Korla realizó un fine-tuning supervisado para la tarea de traducción de voz del alto sorabo al alemán, utilizando datos de entrenamiento proporcionados por Załožba za serbski lud. No se han publicado detalles sobre el volumen de datos, el número de épocas ni el método de optimización empleado.

El modelo base fue entrenado por OpenAI con 5 millones de horas de audio débilmente etiquetado, y el turbo se afinó durante dos épocas adicionales sobre los mismos datos de transcripción multilingüe, excluyendo datos de traducción. Sin embargo, este modelo específico ha sido reentrenado para traducción, por lo que su comportamiento difiere del turbo original en ese aspecto.

## Capacidades

- Traducción de voz del alto sorabo al alemán, con salida en texto.
- No realiza transcripción: está diseñado exclusivamente para traducir, no para generar transcripciones literales.
- Requiere especificar el idioma de transcripción como "czech" y el modo "translate" para obtener resultados correctos, según las instrucciones del autor.
- Compatible con el ecosistema Transformers de Hugging Face y con endpoints de inferencia.
- Al estar basado en Whisper, hereda la robustez frente a ruido y acentos del modelo original, aunque adaptado a un dominio lingüístico específico.

## Casos de uso

- Subtitulado automático de vídeos en alto sorabo: el modelo puede generar subtítulos en alemán a partir de audio en alto sorabo, facilitando la difusión de contenido audiovisual de la comunidad soraba.
- Digitalización de archivos históricos: permite transcribir y traducir grabaciones de audio en alto sorabo, contribuyendo a la preservación del patrimonio lingüístico.
- Accesibilidad para hablantes de alto sorabo: integrado en aplicaciones de asistencia, puede traducir discursos o conversaciones en tiempo real para usuarios que no dominan el alemán.
- Herramientas educativas: apoyo en la enseñanza del alto sorabo, traduciendo material de audio a alemán para estudiantes.
- Servicios de interpretación automática: en contextos administrativos o médicos donde se requiera traducir consultas orales en alto sorabo al alemán.
- Investigación lingüística: análisis de corpus orales en alto sorabo mediante la traducción automática a un idioma de mayor difusión.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: con 808,9 millones de parámetros, en FP16 se requieren aproximadamente 1,6 GB solo para los pesos, más overhead de activaciones y memoria intermedia. Se estima un consumo total de 2-4 GB de VRAM para inferencia en FP16.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM, como NVIDIA GTX 1650, RTX 3050, RTX 3060 o superiores. También es viable en GPUs de datacenter como A10 o T4.
- En consumer GPU: sí, cabe en GPUs de gama media y alta.
- Opciones de despliegue: compatible con Transformers, puede servirse mediante vLLM, TGI, o ejecutarse con llama.cpp si se convierte a GGUF (aunque no se proporciona oficialmente). También es posible usar el pipeline de Hugging Face.
- Latencia y throughput: no disponible, pero al ser una variante turbo, se espera una velocidad superior al Whisper Large-v3 original.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia |
|---|---|---|---|---|
| Korla/whisper-large-v3-turbo-hsb-translation-v1 | 808,9 M | no disponible | Traduccion de voz hsb->de | CC-BY-SA-4.0 |
| openai/whisper-large-v3-turbo | 809 M (aprox.) | 30 s audio | Transcripcion y traduccion multilingue | MIT |
| Korla/whisper-large-v3-turbo-hsb-0 | no disponible | no disponible | Transcripcion de alto sorabo | CC-BY-SA-3.0 |

El modelo de Korla se diferencia del base de OpenAI en que está especializado en el par hsb->de, mientras que el base cubre muchos idiomas. El otro modelo de Korla (hsb-0) se centra en transcripción, no en traducción. No se dispone de datos de rendimiento comparativo.

## Limitaciones y advertencias

- No realiza transcripción: si se necesita texto literal en alto sorabo, este modelo no es adecuado; se debe usar el modelo de transcripción hsb-0.
- Requiere una configuración específica (idioma "czech" y modo "translate") que puede resultar contraintuitiva y propensa a errores si no se documenta correctamente en la integración.
- El alto sorabo es un idioma con pocos recursos; el modelo puede tener un rendimiento limitado en acentos, dialectos o vocabulario técnico no presentes en los datos de entrenamiento.
- Riesgo de alucinaciones en audio de baja calidad o con ruido de fondo, común en modelos de voz.
- La licencia CC-BY-SA-4.0 es copyleft: cualquier obra derivada debe compartirse bajo la misma licencia, lo que puede ser restrictivo para uso comercial propietario.
- No se han publicado evaluaciones formales ni benchmarks, por lo que su rendimiento real en producción es incierto.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Korla/whisper-large-v3-turbo-hsb-translation-v1
- Modelo base de OpenAI: https://huggingface.co/openai/whisper-large-v3-turbo
- Modelo de transcripción hsb de Korla: https://huggingface.co/Korla/whisper-large-v3-turbo-hsb-0
- Repositorio oficial de Whisper: https://github.com/openai/whisper
