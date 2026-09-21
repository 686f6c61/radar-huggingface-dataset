# sixstringzen/Hemmingway-1-oQ3e-mtp

## Resumen

Hemmingway-1-oQ3e-mtp es una cuantización derivada del modelo Altworld/Hemmingway-1, publicada por el usuario sixstringzen. No se trata de un modelo entrenado desde cero, sino de una conversión de pesos orientada a MLX y oMLX sobre silicio de Apple, con el objetivo de reducir el espacio en disco y la memoria necesaria para la inferencia manteniendo los tensores de predicción multi-token (MTP) del modelo original.

El artefacto parte de una cuantización afín de precisión mixta denominada oQ3e, con 3 bits como precisión base y grupo de 64, y sobreescribe la precisión de determinados tensores sensibles hasta 4, 5 y 6 bits según su importancia de activación. El resultado ocupa 13.123.999.645 bytes (12,22 GiB) frente a los pesos en bfloat16 del modelo fuente, y conserva 29 tensores MTP que permiten, en teoría, decodificación asistida por predicción multi-token.

El modelo cuenta con 27.320.697.856 parámetros totales, está etiquetado para generación de texto y escritura creativa, y se distribuye únicamente en inglés bajo licencia Apache 2.0. Su relevancia es limitada y muy específica: es un artefacto de cuantización para un runtime concreto, sin benchmarks publicados ni pruebas de generación registradas, por lo que debe evaluarse como un experimento reproducible dentro del ecosistema oMLX más que como un modelo listo para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de texto; el modelo fuente declara `qwen3_5_text` y el artefacto convertido usa el nombre `qwen3_5` |
| Parametros totales | 27.320.697.856 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | oQ3e (cuantización afín de precisión mixta): 3 bits base, 8 tensores a 4 bits, 123 tensores a 5 bits, `language_model.lm_head` a 6 bits; grupo de 64; tensores no cuantizados en bfloat16 |
| Idiomas soportados | en (inglés) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors de MLX (3 shards, 1.876 tensores indexados, 29 tensores MTP); no es GGUF |

## Arquitectura y entrenamiento

Este repositorio no documenta entrenamiento propio: es una conversión de pesos. El modelo base Altworld/Hemmingway-1 se identifica con la arquitectura de texto `qwen3_5_text`, que la herramienta de cuantización renombra a `qwen3_5` para que coincida con el nombre soportado por la versión de oMLX empleada. Se desconoce el número de tokens de entrenamiento, la composición del dataset y si hubo fases de RLHF o DPO, ya que esos detalles quedan remitidos a la model card del modelo fuente.

La innovación técnica del artefacto es doble. Por un lado, la cuantización oQ3e usa la importancia de activación calculada con una imatrix (504 entradas) para asignar precisión adicional a los tensores más sensibles, partiendo de 3 bits y elevando selectivamente hasta 6 bits, incluida la cabeza del modelo. Por otro, se preservan los 29 tensores de predicción multi-token (MTP), lo que habilita decodificación asistida por MTP, aunque el autor indica explícitamente que esta no se ha evaluado por separado. La calibración se hizo con el dataset `oqe_code_multilingual` (128 muestras de 512 tokens), no con un corpus de prosa, pese a la orientación creativa del modelo.

## Capacidades

- Generación de texto conversacional y de escritura creativa, según las etiquetas del artefacto (`creative-writing`, `text-generation`, `conversational`).
- Predicción multi-token (MTP): se conservan 29 tensores MTP, lo que permite decodificación asistida por MTP si el runtime la implementa.
- Modo de pensamiento conmutable: la model card indica que se ajuste `enable_thinking` a `false` para obtener prosa directa sin planificación visible, lo que implica que existe un modo de razonamiento explícito activable.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Capacidades de agente y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: limitadas al inglés, único idioma declarado.
- Capacidades especiales (visión, audio): no disponibles; el artefacto es exclusivamente de texto.

## Casos de uso

- Escritura creativa asistida en local: el modelo está etiquetado para `creative-writing` y su cuantización de 12,22 GiB permite ejecutarlo en un Mac sin depender de servicios en la nube, útil para borradores de narrativa o diálogo.
- Generación de prosa directa sin planificación visible: configurando `enable_thinking` a `false` se evita la fase de razonamiento intermedio, lo que resulta adecuado para pipelines que requieren texto inmediato sin cadenas de pensamiento.
- Prototipado de aplicaciones conversacionales en Apple Silicon: al ser un artefacto MLX, se puede cargar desde oMLX como LLM y usarlo para iterar sobre interfaces de chat sin coste de API.
- Evaluación de cuantizaciones de 3 bits: investigadores interesados en el impacto de la precisión mixta sobre la calidad pueden usar este artefacto como caso de estudio frente a los pesos bfloat16 del modelo fuente.
- Investigación sobre predicción multi-token: la conservación de los 29 tensores MTP lo convierte en un banco de pruebas para medir la ganancia de la decodificación asistida por MTP en un modelo de 27.300 millones de parámetros.
- Experimentación en el ecosistema oMLX: sirve para validar la compatibilidad de artefactos oQ3e con una versión concreta del runtime (oMLX 0.7.0.dev2) en hardware Apple.
- Despliegue de bajo consumo en estaciones de trabajo Mac: con 12,22 GiB de pesos, encaja en equipos con memoria unificada moderada para tareas de generación de texto no críticas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La búsqueda web realizada no devolvió ningún resultado relacionado con el modelo (los resultados obtenidos trataban sobre ciclismo y la Vuelta a España 2026, sin relación alguna con este artefacto). La model card del repositorio indica además que no se ha registrado ninguna prueba de humo de generación para esta cuantización y que no se ha publicado una comparación controlada contra el modelo BF16 fuente, por lo que no existe evidencia de paridad de calidad.

## Requisitos de hardware

- VRAM o memoria unificada para los pesos: 12,22 GiB (13.123.999.645 bytes) en cuantización oQ3e de 3 bits con sobrescrituras de precisión.
- Memoria total recomendada en Apple Silicon: 24 GB de memoria unificada como mínimo razonable, y 32 GB o más para dejar margen a la caché KV y al contexto, dado que la longitud de contexto soportada no está documentada.
- GPU compatibles: no aplica a GPUs NVIDIA o AMD; el artefacto está pensado para Apple Silicon (familias M1, M2, M3 y M4, preferiblemente variantes Pro, Max o Ultra con memoria suficiente).
- ¿Cabe en GPU de consumo? No en el sentido habitual: no es un artefacto CUDA ni GGUF. Cabe en equipos Apple con memoria unificada suficiente, no en GPUs de consumo con 8 o 12 GB.
- Opciones de despliegue: oMLX (versión 0.7.0.dev2 o compatible) cargándolo como LLM desde el navegador de modelos; el autor advierte que no se ha verificado la compatibilidad con otros runtimes MLX ni con versiones anteriores de oMLX. No es compatible con vLLM, llama.cpp, Ollama ni TGI al no ser GGUF.
- Latencia y throughput: no disponibles; no se ha registrado ninguna prueba de generación ni medición de velocidad para este artefacto.

## Comparativa con modelos similares

No hay datos de rendimiento publicados para este artefacto ni resultados de benchmarks en la información disponible, por lo que cualquier comparación cuantitativa sería especulativa. La única comparación documentable es contra el propio modelo fuente y contra otras cuantizaciones del mismo origen, con los datos que sí aparecen en la model card:

| Modelo | Parametros | Precision | Tamano | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| sixstringzen/Hemmingway-1-oQ3e-mtp | 27.320.697.856 | 3 bits base con sobrescrituras de 4 a 6 bits | 12,22 GiB | no disponible | apache-2.0 | MLX / oMLX en Apple Silicon |
| Altworld/Hemmingway-1 (fuente) | no disponible (mismo modelo base) | bfloat16 | no disponible | no disponible | apache-2.0 | repositorio del autor original |
| Otras cuantizaciones de Hemmingway-1 | no disponible | no disponible | no disponible | no disponible | apache-2.0 | no disponible |

No se dispone de información sobre modelos alternativos de la misma categoría (escritura creativa en inglés, ~27.000 millones de parámetros) en el material proporcionado.

## Limitaciones y advertencias

- La cuantización puede alterar la elección de palabras, la coherencia y el seguimiento de instrucciones; el autor señala que no se ha publicado una comparación controlada contra el modelo BF16.
- No existe prueba de humo de generación ni medición de calidad para este artefacto: las verificaciones realizadas son estructurales (integridad de shards, 1.876 tensores indexados, 29 tensores MTP, ausencia de shards perdidos), no funcionales.
- La calibración de la imatrix usó `oqe_code_multilingual`, un dataset orientado a código y multilingüe, no un corpus de prosa, lo que puede no ser óptimo para un modelo de escritura creativa.
- La decodificación asistida por MTP no está evaluada: aunque los tensores están presentes, no se ha medido su beneficio real.
- Se desconoce la longitud de contexto soportada, lo que impide dimensionar correctamente la memoria y planificar casos de uso con documentos largos.
- El modelo solo declara soporte de inglés, por lo que no es adecuado para producción en castellano u otros idiomas.
- Compatibilidad limitada: creado con oMLX 0.7.0.dev2; no se ha verificado su funcionamiento en otros runtimes MLX ni en versiones anteriores. No sirve con vLLM, llama.cpp, Ollama o TGI.
- Licencia Apache 2.0, que permite uso comercial, pero las condiciones y limitaciones del modelo fuente Altworld/Hemmingway-1 siguen aplicándose a este derivado.
- Riesgo de sesgos y alucinaciones: no evaluado en la información proporcionada, y los sesgos del modelo fuente no se documentan en este repositorio.
- Adopción nula: el repositorio registra 0 descargas y 0 «likes», por lo que no hay evidencia de uso en producción ni retroalimentación de terceros.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/sixstringzen/Hemmingway-1-oQ3e-mtp
- Modelo base: https://huggingface.co/Altworld/Hemmingway-1
- Revisión del modelo fuente citada: `4d711aac0f0043075ae334d2a3de3db3e10135c9`
- Informe de imatrix y cuantización: https://huggingface.co/sixstringzen/Hemmingway-1-oQ3e-mtp/blob/main/oq_imatrix_report.json
- Herramienta de cuantización oMLX: https://github.com/jundot/omlx
