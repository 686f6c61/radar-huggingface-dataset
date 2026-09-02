# kaanhgunay/pocket-tts-tr

## Resumen

Pocket TTS Turkish (v0.1 base) es un modelo de síntesis de voz (text-to-speech) en turco, desarrollado por kaanhgunay como un fine-tuning del modelo Pocket TTS de Kyutai Labs. Está diseñado para generar habla natural en turco a partir de texto, con soporte para clonación de voz mediante una muestra de audio de referencia. El modelo se entrenó sobre el corpus de audiolibros turcos de Serdar I. Çağlar, que contiene 2.724 horas de habla leída, y se publica con licencia CC BY 4.0.

La arquitectura es un transformer de 24 capas con tokenizer SentencePiece BPE específico para turco (vocabulario de 4.000 tokens) y una frecuencia de muestreo de audio de 24 kHz. Con 336 millones de parámetros, este checkpoint actúa como modelo teacher para futuras destilaciones y fine-tunings. Su relevancia radica en que ofrece una alternativa ligera y de código abierto para TTS en turco, un idioma con relativamente pocos recursos de alta calidad en este ámbito, y puede ejecutarse en CPU sin necesidad de GPU.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Pocket TTS (transformer de 24 capas) |
| Parametros totales | 336.068.290 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (procesa texto secuencialmente) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | turco (principal), con limitaciones para otros idiomas |
| Licencia | CC BY 4.0 |
| Formato de pesos | safetensors |
| Frecuencia de muestreo | 24 kHz |
| Tokenizer | SentencePiece BPE turco, vocabulario de 4.000 tokens |
| Pasos de entrenamiento | 112.000 |
| Temperatura de generacion | 0.3 |

## Arquitectura y entrenamiento

Pocket TTS es una arquitectura de síntesis de voz desarrollada por Kyutai Labs, diseñada para ser ligera y ejecutarse en CPU. El modelo base original tiene aproximadamente 100 millones de parámetros en su forma destilada, pero este fine-tuning turco usa el checkpoint teacher de 24 capas, que alcanza los 336 millones de parámetros. El modelo emplea un tokenizer SentencePiece BPE entrenado específicamente sobre texto turco, con un vocabulario de 4.000 unidades, y genera audio a 24 kHz.

El entrenamiento se realizó sobre el corpus `serdarcaglar/turkish-tts-audiobooks`, un conjunto de 2.724 horas de audiolibros en turco. Antes del entrenamiento se aplicaron controles de fugas de datos entre particiones de entrenamiento, validación y prueba, junto con preprocesado, normalización, validación de alineaciones y filtrado. El checkpoint seleccionado corresponde al paso 112.000, y la generación usa una temperatura de 0.3. El modelo está condicionado por voz, lo que permite clonar la voz de una muestra de referencia.

## Capacidades

- Generación de voz en turco a partir de texto, con habla fluida y natural para frases estándar.
- Manejo de morfología turca, incluyendo palabras aglutinantes largas.
- Síntesis de números y fechas cuando están correctamente normalizados.
- Respeto de puntuación y pausas naturales.
- Generación de habla condicionada por voz (voice cloning) a partir de una muestra de audio de referencia.
- Adecuado para frases largas y texto de formato extenso.
- Inferencia en CPU sin necesidad de GPU, gracias al diseño ligero de Pocket TTS.

## Casos de uso

- Audiolibros y narración de contenido largo: el modelo puede generar voz para libros completos en turco, aprovechando su entrenamiento sobre audiolibros y su capacidad para mantener fluidez en frases extensas.
- Asistentes de voz en turco: integrable en aplicaciones de asistencia por voz para responder con habla natural, usando una voz personalizada mediante voice cloning.
- Accesibilidad para personas con discapacidad visual: conversión de texto digital (artículos, noticias, documentos) a audio en turco, con calidad suficiente para lectura prolongada.
- Contenido educativo y e-learning: generación de locuciones para cursos, tutoriales y materiales didácticos en turco, con la posibilidad de usar una voz consistente.
- Doblaje y producción multimedia: creación de voces para vídeos, podcasts o animaciones en turco, partiendo de una muestra de voz de referencia.
- Sistemas de respuesta interactiva (IVR): generación de mensajes de voz para centralitas telefónicas o sistemas de atención al cliente en turco, con bajo coste de despliegue al funcionar en CPU.
- Prototipado rápido de productos de voz: los desarrolladores pueden generar muestras de voz turca sin depender de servicios en la nube, gracias a la ejecución local y al formato ligero.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica fortalezas cualitativas (fluidez en turco, manejo de morfología, números y fechas), pero no proporciona métricas numéricas como MOS (Mean Opinion Score) o comparaciones con otros sistemas TTS. Tampoco se dispone de datos de latencia o throughput específicos para este checkpoint.

## Requisitos de hardware

- El modelo está diseñado para ejecutarse en CPU; Pocket TTS original corre más rápido que tiempo real en CPUs con buen rendimiento monohilo (por ejemplo, Apple Silicon).
- Con 336 millones de parámetros, el checkpoint teacher requiere más memoria que la versión destilada de 100 millones, pero sigue siendo manejable en hardware de consumo.
- El repositorio ocupa 1,3 GB en safetensors; en FP32 los pesos ocuparían aproximadamente 1,3 GB en memoria, y en FP16 unos 0,7 GB.
- No se requiere GPU para inferencia, aunque podría acelerarse en GPUs si se usa un batch mayor.
- Opciones de despliegue: la herramienta oficial `pocket-tts` (instalable con `uvx`) permite generar audio desde línea de comandos; también se puede integrar como librería en Python.
- No se dispone de datos de latencia medidos para este checkpoint concreto.

## Comparativa con modelos similares

| Modelo | Parametros | Idioma | Licencia | Notas |
|---|---|---|---|---|
| kaanhgunay/pocket-tts-tr | 336 M | turco | CC BY 4.0 | Fine-tuning turco del teacher de Pocket TTS |
| kyutai/pocket-tts (base) | ~100 M (destilado) | multilingue | CC BY 4.0 | Modelo original de Kyutai, diseñado para CPU |
| Otros TTS turcos | no disponible | turco | no disponible | No se dispone de datos comparables en la informacion proporcionada |

No se dispone de comparativas directas con otros modelos TTS turcos en cuanto a calidad de voz o rendimiento. El modelo base de Kyutai es multilingüe, mientras que este fine-tuning está especializado en turco, lo que probablemente mejore la calidad en ese idioma a costa de perder capacidades en otros.

## Limitaciones y advertencias

- Palabras en idiomas extranjeros (especialmente inglés) se pronuncian siguiendo patrones ortográficos y fonéticos del turco; el code-switching no es una capacidad soportada en v0.1.
- Puede aparecer un artefacto transitorio o de pronunciación al inicio de la generación, alrededor de la primera sílaba.
- El modelo está entrenado principalmente sobre audiolibros, por lo que su rendimiento en estilos de habla muy diferentes (conversacional, gritos, susurros) puede ser inferior.
- La licencia CC BY 4.0 permite uso comercial con atribución, pero el usuario es responsable de cumplir la legislación sobre clonación de voz y consentimiento de las personas cuya voz se use.
- No se han publicado evaluaciones formales de sesgos o alucinaciones; al ser un modelo TTS, el riesgo de alucinación se limita a errores de pronunciación o entonación.
- El modelo no soporta otros idiomas de forma fiable; su uso fuera del turco puede producir resultados incorrectos.

## Enlaces

- Repositorio de HuggingFace: https://huggingface.co/kaanhinay/pocket-tts-tr
- Repositorio oficial de Pocket TTS (Kyutai): https://github.com/kyutai-labs/pocket-tts
- Documentación de Pocket TTS: https://kyutai-labs.github.io/pocket-tts/
- Sitio web de Pocket-TTS: https://pockettts.org/
- Dataset de entrenamiento: https://huggingface.co/datasets/serdarcaglar/turkish-tts-audiobooks
