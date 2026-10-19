# Interscript/urd-diac-base-1.0

## Resumen
urd-diac-base-1.0 es un modelo de diacritización del urdu desarrollado por Interscript. Se trata de un seq2seq ByT5-base entrenado sobre el corpus urdu-diacrit completo, con 573.130 pares, para restaurar las marcas diacríticas que habitualmente se omiten en el texto urdu. El artefacto publicado es IMF v1 en fp16 y está pensado para ejecutarse de forma reproducible en el runtime de Interscript.

El modelo resuelve un problema concreto del procesamiento del urdu: añadir diacríticos a texto sin vocales para mejorar la pronunciación, el análisis lingüístico o la síntesis de voz. No es un modelo de propósito general; su valor está en las métricas de la tarea: CER de 3,57 y word accuracy de 69,8 % en el split de test de 11.940 filas, con paridad ONNX/torch en 500/500 filas.

Su relevancia práctica reside en que ofrece un artefacto verificable, con conformidad byte a byte sobre 12 vectores congelados y distribución mediante interscript-ml para Ruby, Python y TypeScript. La licencia de los pesos es BSD-3-Clause, pero depende de la licencia del corpus de entrenamiento, que no se especifica.

## Especificaciones técnicas
| Parámetro | Valor |
|---|---|
| Arquitectura | ByT5-base seq2seq |
| Parámetros totales | no disponible; la información solo indica ByT5-base |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | fp16 en el artefacto IMF v1; no se documentan otras cuantizaciones |
| Idiomas soportados | urdu para la tarea de diacritización; no se detalla cobertura multilingüe |
| Licencia | BSD-3-Clause para código y pesos, sujeta a la licencia de los datos de entrenamiento del corpus urdu-diacrit; licencia del corpus no especificada |
| Formato de pesos | ONNX (IMF v1, fp16); no se indica safetensors, GGUF ni otros formatos |

## Arquitectura y entrenamiento
El modelo es un seq2seq ByT5-base, una arquitectura basada en transformer que opera a nivel de bytes en lugar de tokens subword. Se entrenó sobre el corpus urdu-diacrit completo, con 573.130 pares de texto urdu sin diacríticos y su versión diacritizada. La información disponible no detalla el número de tokens de entrenamiento, la composición exacta del dataset ni si se aplicaron fases de RLHF o DPO.

La innovación principal no está en la arquitectura, sino en el contrato de despliegue: el artefacto IMF v1 en fp16 reproduce la salida de torch en 500/500 filas con decodificación greedy de una sola fila, y cumple byte a byte con 12 vectores congelados del conjunto de conformidad. La decodificación por lotes sin máscara de atención queda fuera del contrato del artefacto, según la documentación del autor.

## Capacidades
- Diacritización de texto urdu a nivel de carácter mediante un modelo seq2seq ByT5-base.
- Restauración de marcas diacríticas en texto urdu que carece de ellas.
- Decodificación greedy determinista por fila, que es el modo validado por el runtime.
- Paridad de salida entre el artefacto ONNX y torch en 500/500 filas.
- Conformidad byte a byte con 12 vectores congelados de referencia.
- Distribución mediante interscript-ml para Ruby, Python y TypeScript.
- No se documentan capacidades de tool calling, function calling, agentes, razonamiento multi-paso, visión, audio ni matemáticas avanzadas.
- No se documenta un modo de pensamiento ni generación libre de texto; la función es la transformación texto a texto para diacritización.

## Casos de uso
- Edición y publicación de libros en urdu: el modelo puede añadir diacríticos a manuscritos y textos de prensa antes de la revisión editorial. Es adecuado porque reduce el trabajo manual, aunque su word accuracy de 69,8 % exige revisión humana.
- Materiales didácticos para la enseñanza del urdu: permite generar versiones diacritizadas de cuentos, ejercicios y vocabularios para estudiantes que están aprendiendo la pronunciación. El CER de 3,57 en test indica un nivel de error bajo a nivel de carácter, pero no elimina la necesidad de validación.
- Preprocesamiento para síntesis de voz en urdu: la diacritización previa puede mejorar la pronunciación en sistemas TTS. El modelo se integraría como paso ONNX dentro de un pipeline de texto a habla, con decodificación greedy por fila.
- Postprocesado de ASR y OCR en urdu: las transcripciones automáticas y los textos reconocidos por OCR suelen perder diacríticos; este modelo puede restaurarlos antes de la indexación o del análisis lingüístico.
- Anotación lingüística y creación de corpus: sirve para preanotar corpus de urdu con diacríticos y acelerar el trabajo de anotadores humanos. Su utilidad depende de una fase de corrección posterior, dado que la precisión por palabra no es del 100 %.
- Normalización para búsqueda y recuperación de información: permite enriquecer índices con formas diacritizadas para mejorar la coincidencia entre consultas y documentos. La salida determinista del runtime facilita la reproducibilidad en producción.
- Pipelines multilingües en Ruby, Python y TypeScript: el artefacto IMF v1 se puede servir de forma idéntica desde los tres lenguajes mediante interscript-ml, lo que encaja en arquitecturas que necesitan paridad entre entornos.
- Verificación de runtimes de inferencia: los 12 vectores de conformidad y la paridad ONNX/torch permiten usar el modelo como caso de prueba para validar implementaciones de ONNX Runtime.

## Benchmarks y rendimiento
| Métrica | Resultado | Condición |
|---|---|---|
| CER de caracteres, media por fila | 3,57 | split de test completo de 11.940 filas |
| Word accuracy | 69,8 % | mismo split de test |
| CER del artefacto ONNX | 3,64 | decodificación greedy de una fila |
| Acuerdo ONNX/torch | 500/500 filas; agreement 1,0 | decodificación greedy de una fila |
| Acuerdo bf16/fp32/ORT | 1,0 | prueba de tres vías |
| Conformidad | 12/12 vectores congelados | reproducción byte a byte |
| Baseline small tier | 3,77 CER | urd-diac-1.0 small tier |

No se han publicado resultados de MMLU, HumanEval, GSM8K ni otros benchmarks generales en la información disponible. Las métricas anteriores son específicas de la tarea de diacritización del urdu y no permiten comparar el modelo con LLM de propósito general.

## Requisitos de hardware
- VRAM estimada para inferencia: no disponible. El repositorio ocupa 1,3 GB y el artefacto es fp16, pero el autor no publica requisitos de memoria.
- GPU recomendadas: no disponibles. No se indican A100, H100, RTX 4090 ni otros modelos concretos.
- GPU consumer: no confirmado. El tamaño del repositorio, 1,3 GB, sugiere que podría caber en GPUs de gama consumer, pero no hay una validación publicada.
- Despliegue: ONNX Runtime con artefactos IMF v1; distribución mediante interscript-ml y paridad con torch. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles. El autor solo documenta el modo de decodificación greedy de una fila, no rendimiento agregado por lote.
- CPU: no disponible. No se publican pruebas de inferencia en CPU ni requisitos mínimos de memoria del sistema.

## Comparativa con modelos similares
| Modelo | Tarea | Arquitectura | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| urd-diac-base-1.0 | Diacritización de urdu | ByT5-base seq2seq | no disponible | CER 3,57; word accuracy 69,8 % | BSD-3-Clause sujeta a la licencia del corpus | Hugging Face |
| urd-diac-1.0 small tier | Diacritización de urdu | no disponible | no disponible | CER 3,77 | no disponible | Hugging Face |
| heb-diac-plane-1. / heb-diac-plane-2. | Diacritización de hebreo | ByT5-base, K=3 | no disponible | nakdimon DER 8,18 con int8 | no disponible | GitHub Releases |

La comparación directa con modelos de diacritización del urdu es limitada: la información disponible solo permite contrastar con el tier small de la misma familia. Los modelos heb-diac-plane se incluyen como referencia de la misma organización y arquitectura, pero no son comparables en idioma ni en métrica principal.

## Limitaciones y advertencias
- La licencia de los pesos es BSD-3-Clause, pero depende de la licencia del corpus urdu-diacrit; no se especifica la licencia del corpus, por lo que el uso comercial requiere revisión legal.
- Los metadatos de Hugging Face no indican pipeline, licencia ni idiomas soportados; la información disponible es incompleta.
- No es un modelo de propósito general: no se documentan tool calling, agentes, visión, audio, razonamiento matemático ni generación libre.
- La word accuracy de 69,8 % implica que aproximadamente tres de cada diez palabras pueden contener algún error de diacritización; en producción se recomienda revisión humana.
- El CER de 3,57 corresponde al split de test de 11.940 filas; el rendimiento puede degradarse en textos de otros dominios, registros o épocas.
- El contrato del artefacto cubre la decodificación greedy de una fila; la decodificación por lotes sin máscara de atención queda fuera del contrato y no debe usarse si se requiere conformidad.
- No se documentan sesgos conocidos ni evaluaciones de seguridad; el corpus de entrenamiento puede introducir sesgos de dominio o de registro.
- No se publica la longitud máxima de contexto; para textos largos puede ser necesario segmentar, pero no hay una guía oficial.
- No hay benchmarks generales ni comparaciones con otros modelos de diacritización del urdu más allá del tier small de la misma familia.

## Enlaces
- [Interscript/urd-diac-base-1.0 en Hugging Face](https://huggingface.co/Interscript/urd-diac-base-1.0)
- [Interscript/urd-diac-1.0 en Hugging Face](https://huggingface.co/Interscript/urd-diac-1.0)
- [Perfil de Interscript en Hugging Face](https://huggingface.co/Interscript/models)
- [Repositorio interscript-models en GitHub](https://github.com/interscript/interscript-models/tree/main/models)
- [Releases de interscript-models](https://github.com/interscript/interscript-models/releases)
- [Capa neural de Interscript](https://interscript.org/ml/)
- No se ha encontrado un paper asociado en la información disponible.
