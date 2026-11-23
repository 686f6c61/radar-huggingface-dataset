# en5yme/Yoshino2-1B-GGUF

## Resumen

Yoshino2 1B es un modelo de razonamiento de pequeno tamano (1.080.632.832 parametros) desarrollado por el usuario en5yme, distribuido en formato GGUF y publicado bajo licencia MIT. Se trata de un ajuste fino (fine-tune) del modelo MiniCPM5 1B de OpenBMB, sobre el que se ha aplicado un proceso de destilacion del estilo de razonamiento del modelo profesor Nemotron 3.5 Lightning 30B A3B. El objetivo declarado del autor es mejorar las capacidades de razonamiento del modelo base y acercar la inteligencia de modelos de gran escala a dispositivos de borde (edge).

El modelo se presenta como un experimento a pequena escala, no como un modelo de produccion listo para uso industrial. Su relevancia actual radica en la tendencia de destilar modelos grandes en arquitecturas pequenas para despliegue local, aunque sus benchmarks muestran mejoras marginales respecto al modelo base. La ficha se centra en la version GGUF, que facilita la inferencia en hardware de consumo.

No se dispone de informacion sobre la longitud de contexto soportada ni sobre la composicion detallada del dataset de entrenamiento mas alla de los pares Q/A sinteticos generados. El modelo esta etiquetado exclusivamente para ingles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (fine-tune de MiniCPM5 1B de OpenBMB) |
| Parametros totales | 1.080.632.832 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF (cuantizaciones multiples, no se detallan en la informacion disponible) |
| Idiomas soportados | Ingles (en) |
| Licencia | MIT (fine-tune); el modelo base retiene Apache 2.0 |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

El modelo parte de la arquitectura MiniCPM5 1B de OpenBMB, un transformer denso de aproximadamente 1.080 millones de parametros. Sobre esta base se aplico un ajuste fino supervisado (SFT) mediante Unsloth, con 3 epocas de LoRA, sobre un dataset sintetico de 10.817 pares pregunta/respuesta de aproximadamente 135 megabytes. El dataset fue generado con un mecanismo de auto-prompt y un framework de destilacion propio del autor, e incluye tanto muestras de un solo turno como muestras de contexto profundo de 4 prompts.

La innovacion principal es la destilacion del estilo de razonamiento del modelo profesor Nemotron 3.5 Lightning 30B A3B en una arquitectura mucho mas pequena. Segun el autor, el modelo resultante adopta el estilo de razonamiento y salida del profesor. No se documenta el uso de RLHF o DPO, ni se detalla la composicion del dataset mas alla de su caracter sintetico y su origen en el dataset `en5yme/Nemotron-3.5-Lightning-30B-A3B-Distill`.

## Capacidades

- Generacion de texto conversacional en ingles.
- Razonamiento de estilo destilado (thinking/reasoning style) heredado del modelo profesor.
- Capacidades de razonamiento general orientadas a dispositivos de borde.
- Soporte de conversaciones de un solo turno y de contexto profundo de hasta 4 prompts en el entrenamiento.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: limitadas al ingles segun las etiquetas del modelo.
- Capacidades especiales (vision, audio): no disponibles.

## Casos de uso

- Razonamiento local en dispositivos de borde: el modelo, con 1.080 millones de parametros y formato GGUF, puede ejecutarse en equipos de consumo para tareas de razonamiento ligero sin conexion, gracias a su reducido tamano.
- Prototipado de asistentes conversacionales en ingles: su naturaleza conversacional y su estilo de razonamiento destilado permiten construir chatbots experimentales para pruebas internas.
- Investigacion sobre destilacion de razonamiento: sirve como caso de estudio para investigadores que quieran analizar como se transfiere el estilo de razonamiento de un modelo profesor de 30B a uno de 1B mediante SFT con LoRA.
- Generacion de respuestas con razonamiento explicito en entornos con recursos limitados: adecuado para entornos donde no es posible desplegar modelos grandes, aunque con calidad limitada.
- Educacion y experimentacion con modelos pequenos: util para docentes y estudiantes que quieran estudiar el comportamiento de modelos destilados en hardware modesto.
- Evaluacion comparativa de tecnicas de ajuste fino: el modelo y su base permiten comparar el impacto de la destilacion en benchmarks reducidos (tinyArc, tinyHellaSwag, tinyMMLU, tinyTruthfulQA).

## Benchmarks y rendimiento

Los datos publicados por el autor comparan Yoshino2 1B con su modelo base MiniCPM5 1B en tareas reducidas (tiny benchmarks). No se han publicado resultados en benchmarks estandar como MMLU, HumanEval o GSM8K.

| Tarea | Version | Filtro | n-shot | Metrica | Yoshino2 1B | MiniCPM5 1B |
|---|---|---|---|---|---|---|
| tinyArc | 0 | none | 25 | acc_norm | 0.4221 | 0.4278 |
| tinyHellaSwag | 0 | none | 10 | acc_norm | 0.5092 | 0.5038 |
| tinyMMLU | 0 | none | 0 | acc_norm | 0.5143 | 0.4897 |
| tinyTruthfulQA | 0 | none | 0 | acc | 0.4362 | 0.4199 |

Las mejoras respecto al modelo base son marginales: ligero descenso en tinyArc (-0.0057), y ligeras mejoras en tinyHellaSwag (+0.0054), tinyMMLU (+0.0246) y tinyTruthfulQA (+0.0163). No se reportan errores estandar (Stderr N/A).

## Requisitos de hardware

- VRAM estimada para inferencia: al tratarse de un modelo de 1.080 millones de parametros en GGUF, las cuantizaciones de 4 bits requeriran aproximadamente 0,7-1 GB de VRAM, y las de 8 bits alrededor de 1,2-1,5 GB (estimacion orientativa; no se detallan las cuantizaciones exactas en la informacion disponible).
- GPU recomendadas: cualquier GPU de consumo moderna (RTX 3060, RTX 4060, RTX 4090) puede ejecutar el modelo con holgura; tambien es viable en CPU.
- Cabe en GPU de consumo: si, en practicamente cualquier GPU de consumo con al menos 2 GB de VRAM, y en CPU mediante llama.cpp.
- Opciones de despliegue: llama.cpp, Ollama, y otros runners compatibles con GGUF. No se confirma soporte de vLLM o TGI en la informacion disponible.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Rendimiento (tinyMMLU) |
|---|---|---|---|---|---|
| Yoshino2 1B | 1.080.632.832 | no disponible | MIT (fine-tune) | GGUF | 0.5143 |
| MiniCPM5 1B (base) | ~1B | no disponible | Apache 2.0 | no disponible | 0.4897 |
| Nemotron 3.5 Lightning 30B A3B (profesor) | 30B (A3B MoE) | no disponible | no disponible | no disponible | no disponible |

La comparativa se limita al modelo base y al profesor, ya que no se dispone de datos de otros modelos de 1B comparables en la informacion proporcionada. El modelo profesor es un MoE de 30B con 3B de parametros activos, segun su denominacion, pero no se detallan sus especificaciones completas.

## Limitaciones y advertencias

- El autor indica explicitamente que el modelo no es un modelo de produccion listo para uso industrial; es un experimento a pequena escala para uso personal y experimental.
- Las mejoras en benchmarks respecto al modelo base son marginales y en una tarea (tinyArc) el rendimiento es ligeramente inferior.
- Solo soporta ingles, lo que limita su uso en entornos multilingues.
- Riesgo de alucinacion inherente a modelos pequenos y a la destilacion de un profesor de mayor tamano; no se han publicado evaluaciones de fidelidad.
- La licencia del fine-tune es MIT, pero el modelo base retiene Apache 2.0; el autor advierte que el repositorio no incluye el archivo de licencia del modelo base y que cualquier duda sobre licenciamiento downstream debe consultarse con el autor.
- No se dispone de informacion sobre la longitud de contexto, lo que impide garantizar conversaciones de contexto largo.
- No se detallan sesgos conocidos ni evaluaciones de seguridad.
- El dataset de entrenamiento es sintetico y generado automaticamente, lo que puede introducir artefactos o sesgos del mecanismo de auto-prompt.

## Enlaces

- Hugging Face: https://huggingface.co/en5yme/Yoshino2-1B-GGUF
- Modelo base (fine-tune): https://huggingface.co/en5yme/Yoshino2-1B
- Dataset de destilacion: https://huggingface.co/datasets/en5yme/Nemotron-3.5-Lightning-30B-A3B-Distill
- MiniCPM5 1B de OpenBMB: no disponible en la informacion proporcionada
- Nemotron 3.5 Lightning 30B A3B: no disponible en la informacion proporcionada
