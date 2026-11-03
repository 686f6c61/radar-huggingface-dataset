# softcatala/fullstop-catalan-punctuation-prediction

## Resumen

FullStop catalán es un modelo de predicción de puntuación para lengua catalana desarrollado por Softcatalà, una asociación sin ánimo de lucro que promueve el uso del catalán en el ámbito tecnológico. El modelo resuelve un problema concreto en el pipeline de transcripción automática del habla (ASR): los sistemas de reconocimiento de voz generan texto sin puntuación ni mayúsculas, lo que dificulta su lectura y su procesamiento posterior. Este modelo restaura los signos de puntuación en dicho texto.

Técnicamente se trata de un modelo de clasificación de tokens (token-classification) construido sobre el checkpoint preentrenado `BSC-TeMU/roberta-base-ca`, desarrollado por el Barcelona Supercomputing Center. La arquitectura subyacente es RoBERTa base, adaptada mediante fine-tuning para predecir cinco marcadores de puntuación: punto, coma, signo de interrogación, guion y dos puntos.

El modelo es relevante para la comunidad catalanohablante porque cubre una lengua con pocos recursos en el ecosistema de IA, y lo hace con una licencia permisiva (MIT para las contribuciones de Softcatalà) que facilita su integración en productos comerciales. Está pensado para integrarse como paso de postprocesado en sistemas de subtitulado, transcripción y normalización de texto en catalán.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | RoBERTa base (transformer encoder), fine-tuned para token-classification |
| Parámetros totales | no disponible (el checkpoint base `roberta-base-ca` es de tamaño base, ~125M, aunque no se confirma explícitamente en la información proporcionada) |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (RoBERTa base admite típicamente 512 tokens, pero no se confirma en la información proporcionada) |
| Tipos de cuantización | no disponible |
| Idiomas soportados | catalán (ca) |
| Licencia | MIT (contribuciones de Softcatalà); el checkpoint base `BSC-TeMU/roberta-base-ca` mantiene Apache 2.0 |
| Formato de pesos | no disponible (repositorio de 1.5 GB, compatible con transformers/pytorch) |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura RoBERTa, un transformer encoder bidireccional. Sobre el checkpoint preentrenado en catalán `BSC-TeMU/roberta-base-ca` del Barcelona Supercomputing Center se aplicó un fine-tuning para la tarea de clasificación de tokens, asignando a cada token una etiqueta de puntuación. El enfoque metodológico sigue el proyecto FullStop de Oliver Guhr (`fullstop-deep-punctuation-prediction`), cuyo código está bajo licencia MIT.

El conjunto de datos empleado para el ajuste fino es `softcatala/Europarl-catalan`, derivado del corpus Europarl en catalán. No se especifica en la información disponible el número de tokens de entrenamiento, la composición exacta del dataset ni si se aplicaron técnicas de RLHF o DPO (no procede en una tarea de etiquetado). La innovación principal es la adaptación de una técnica consolidada de restauración de puntuación a una lengua de recursos limitados como el catalán.

## Capacidades

- Predicción y restauración de cinco signos de puntuación: punto (`.`), coma (`,`), signo de interrogación (`?`), guion (`-`) y dos puntos (`:`).
- Clasificación de tokens a nivel de palabra o subtoken sobre texto sin puntuar.
- Procesamiento de texto en catalán exclusivamente.
- Integración como paso de postprocesado en pipelines de ASR (reconocimiento automático del habla).
- Compatible con la librería `transformers` y con endpoints de inferencia (tag `endpoints_compatible`).
- No dispone de tool calling, function calling, capacidades de agente, visión, audio ni modo de razonamiento (thinking mode).

## Casos de uso

- Postprocesado de transcripciones ASR en catalán: tras un sistema de reconocimiento de voz, el modelo inserta puntos, comas e interrogantes para hacer legible el texto generado, mejorando la calidad de subtítulos y actas.
- Generación automática de subtítulos para vídeo y audio: el texto plano del ASR se puntúa antes de exportarse a formatos SRT/VTT, lo que mejora la sincronización semántica de las pausas.
- Normalización de texto para motores de búsqueda y recuperación de información: la puntuación restaurada permite segmentar oraciones correctamente antes de indexar documentos transcritos.
- Preparación de corpus para entrenamiento de modelos: textos sin puntuar procedentes de fuentes diversas se normalizan para construir datasets de calidad para otros modelos de lenguaje en catalán.
- Accesibilidad: transcripciones puntuadas para lectores de pantalla y sistemas de texto a voz, que aprovechan los signos de puntuación para generar prosodia adecuada.
- Edición y corrección asistida de textos en catalán: el modelo puede señalar dónde faltan pausas o dónde conviene un signo de interrogación en borradores sin puntuar.
- Integración en herramientas de dictado y productividad: conversión de notas de voz dictadas en texto estructurado con puntuación mínima.

## Benchmarks y rendimiento

Resultados de F1 publicados en la model card para catalán:

| Etiqueta | F1 (CA) |
|---|---|
| 0 (sin puntuación) | 0,99 |
| `.` | 0,93 |
| `,` | 0,82 |
| `?` | 0,76 |
| `-` | 0,89 |
| `:` | 0,64 |
| Media macro | 0,84 |

No se han publicado resultados comparativos frente a otros modelos de puntuación en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; al tratarse de un modelo basado en RoBERTa base, la inferencia en FP32 requiere del orden de 0,5 GB de VRAM, aunque este dato no se confirma en la información proporcionada.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM es suficiente para un modelo de tamaño base; no se especifican modelos concretos en la información disponible.
- Cabe en GPU de consumo: sí, previsiblemente en cualquier GPU consumer moderna (GTX 1060 o superior), aunque no se confirma en la información proporcionada.
- Opciones de despliegue: `transformers` (PyTorch), endpoints de HuggingFace (tag `endpoints_compatible`); no se confirma soporte de vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

No se dispone de datos de modelos comparables de predicción de puntuación en catalán en la información proporcionada. Como referencia metodológica, el proyecto original FullStop de Oliver Guhr cubre otras lenguas (principalmente inglés y alemán), pero no se han publicado comparativas directas con este modelo en la información disponible.

| Modelo | Idiomas | Arquitectura | Licencia | Disponibilidad |
|---|---|---|---|---|
| softcatala/fullstop-catalan-punctuation-prediction | ca | RoBERTa base fine-tuned | MIT (contribuciones) / Apache 2.0 (base) | HuggingFace |
| FullStop (oliverguhr) | en, de y otras | Transformer fine-tuned | MIT | GitHub / HuggingFace |
| Alternativas en catalán | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- El modelo solo cubre catalán; no procesa otras lenguas.
- Restaura únicamente cinco signos de puntuación (`.`, `,`, `?`, `-`, `:`); no genera signos de exclamación, punto y coma, comillas ni paréntesis.
- El rendimiento en dos puntos (`:`) es notablemente inferior (F1 0,64), por lo que su uso en contextos donde este signo sea crítico debe revisarse manualmente.
- Riesgo de alucinación de puntuación: puede insertar pausas donde no corresponden o omitirlas en fragmentos ambiguos, especialmente en textos muy largos o con estructuras atípicas.
- El entrenamiento se basa en el corpus Europarl, de registro formal y parlamentario; el rendimiento puede degradarse en registros coloquiales, técnicos o de redes sociales.
- La licencia MIT cubre las contribuciones de Softcatalà, pero el checkpoint base `BSC-TeMU/roberta-base-ca` mantiene Apache 2.0; conviene revisar ambas licencias para uso comercial.
- No se especifican limitaciones de longitud de contexto en la información disponible; textos superiores a la ventana del modelo requerirán segmentación previa.
- No se han documentado sesgos específicos en la información disponible.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/softcatala/fullstop-catalan-punctuation-prediction
- Checkpoint base: https://huggingface.co/BSC-LT/roberta-base-ca
- Proyecto FullStop original: https://github.com/oliverguhr/fullstop-deep-punctuation-prediction
- Softcatalà: https://www.softcatala.org/
- Corrector ortográfico y gramatical de Softcatalà: https://www.softcatala.org/corrector/
- Wikipedia de Softcatalà: https://en.wikipedia.org/wiki/Softcatal%C3%A0
- Planeta Softcatalà: http://planet.softcatala.org/
- Plataforma de micromecenazgo de Softcatalà: https://softcatala.aixeta.cat/
