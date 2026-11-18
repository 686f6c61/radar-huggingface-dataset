# jekunz/smollm-360m-cpt-fineweb-faroese-transfer-from-icelandic-seed2

## Resumen

El modelo `jekunz/smollm-360m-cpt-fineweb-faroese-transfer-from-icelandic-seed2` es un ajuste fino de SmolLM2-360M-Instruct desarrollado por el usuario jekunz, orientado a la generacion de texto en feroes (fo). Se trata de un experimento de investigacion sobre transferencia linguistica entre lenguas nordicas de bajos recursos: el modelo parte de un ajuste previo sobre islandes y se entrena despues sobre la porcion feroesa de FineWeb-2, aprovechando el parentesco estructural entre ambas lenguas para reducir la dependencia de corpus masivos en el idioma objetivo.

Con 361.821.120 parametros (unos 362 millones) y un contexto maximo de entrenamiento de 2048 tokens, es un modelo pequeno dentro de la familia SmolLM2, disenado para ejecutarse en hardware modesto. El repositorio ocupa 0,7 GB en formato safetensors y se distribuye bajo licencia Apache 2.0, lo que facilita su reutilizacion tanto en investigacion como en productos comerciales.

Su relevancia actual radica en dos factores: por un lado, demuestra una estrategia de adaptacion linguistica de bajo coste (un unico A100 de 40 GB, cinco epocas sobre feroes) para idiomas con escasa representacion en los corpus de preentrenamiento; por otro, se publica como uno de tres entrenamientos con semillas distintas (seed 2), lo que permite estudiar la varianza entre ejecuciones de un mismo pipeline. El autor advierte que el modelo no ha sido evaluado de forma amplia y que su proposito es exclusivamente de investigacion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Llama, base SmolLM2-360M-Instruct) |
| Parametros totales | 361.821.120 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 2048 tokens (longitud maxima de entrenamiento) |
| Tipos de cuantizacion | no disponible (el autor no publica variantes cuantizadas) |
| Idiomas soportados | Feroes (fo); el modelo base conserva capacidades residuales en ingles |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (transformers) |

## Arquitectura y entrenamiento

La arquitectura corresponde a SmolLM2-360M-Instruct, un transformer decoder-only de tipo Llama con normalizacion RMSNorm, activacion SwiGLU y atencion con RoPE, heredada del checkpoint `jekunz/smollm-360m-cpt-fineweb-icelandic`. No se introducen modificaciones estructurales: el trabajo es un ajuste fino por continuacion de preentrenamiento (CPT) sobre datos monolingues.

El entrenamiento se ejecuto en una unica GPU A100 de 40 GB con los siguientes hiperparametros: 1 epoca sobre la porcion islandesa de FineWeb-2 y 5 epocas sobre la porcion feroesa del mismo dataset, tasa de aprendizaje 5e-4 con scheduler coseno, ratio de warmup de 0,05, batch size de 8 con 32 pasos de acumulacion de gradientes (batch efectivo de 256), longitud maxima de 2048 tokens y semilla 2. El autor no documenta el numero total de tokens procesados, la composicion exacta del subconjunto feroes ni si se aplicaron etapas de RLHF o DPO; al partir de un modelo Instruct, es probable que conserve parte del alineamiento original, pero este extremo no esta confirmado en la informacion disponible.

## Capacidades

- Generacion de texto conversacional en feroes, heredada del formato instruct del modelo base.
- Continuacion de texto y modelado de lenguaje en feroes sobre la porcion de FineWeb-2 utilizada.
- Transferencia cross-linguistica islandes-feroes: el entrenamiento secuencial busca aprovechar morfologia y lexico compartidos entre ambas lenguas.
- Soporte de tool calling / function calling: no disponible (no documentado en la model card).
- Soporte de agentes y razonamiento multi-paso: no disponible (no documentado).
- Capacidades multilingues: limitadas al feroes como idioma objetivo; el resto de lenguas del modelo base no se ha evaluado tras el ajuste.
- Capacidades especiales (vision, audio, modo thinking): no disponibles.

## Casos de uso

- Investigacion sobre transferencia linguistica de bajos recursos: el modelo sirve como punto de comparacion para medir cuanto ayuda un preentrenamiento previo en islandes antes de adaptar a feroes, con tres semillas publicadas para estimar la varianza.
- Generacion de texto sintetico en feroes: util para aumentar corpus de entrenamiento o evaluacion en un idioma con pocos datos publicos, siempre con revision humana posterior.
- Prototipado de asistentes conversacionales en feroes: su formato instruct y su tamano permiten desplegar un chatbot basico en CPU o GPU de gama baja para pruebas de concepto.
- Normalizacion y reescritura de texto feroes: tareas de parafrasis o simplificacion de frases en corpus administrativos o educativos, dado el contexto de 2048 tokens.
- Experimentos de destilacion o ajuste con LoRA: al ser un modelo de 362 millones de parametros, es un banco de pruebas economico para estudiar tecnicas de adaptacion sobre lenguas nordicas.
- Evaluacion de sesgos y calidad en modelos pequenos para lenguas minoritarias: permite analizar como se comporta un modelo de 360M entrenado con datos web filtrados en un idioma de bajos recursos.
- Generacion de material didactico de apoyo: ejercicios de completado de frases o preguntas-respuesta simples en feroes, con supervision editorial obligatoria.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor indica explicitamente que el modelo "has not been evaluated more broadly yet".

## Requisitos de hardware

- VRAM estimada para inferencia en precision completa (fp32): aproximadamente 1,4 GB solo para pesos, mas activaciones y cache KV.
- VRAM estimada en bf16/fp16: alrededor de 0,7 GB para pesos; el repo completo ocupa 0,7 GB en safetensors.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM para bf16; una A100 de 40 GB fue suficiente para el entrenamiento completo.
- Cabe en GPU de consumo: si, en tarjetas como RTX 3060, RTX 4060, RTX 4090 o incluso en GPUs integradas con suficiente memoria compartida; tambien es viable en CPU para inferencia por lotes pequenos.
- Opciones de despliegue: transformers (libreria nativa), vLLM, TGI (el modelo esta etiquetado como `text-generation-inference` y `endpoints_compatible`), llama.cpp y Ollama tras conversion a GGUF (no se publican pesos GGUF oficiales).
- Latencia y throughput: no disponibles; no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| jekunz/smollm-360m-cpt-fineweb-faroese-transfer-from-icelandic-seed2 | 361.821.120 | 2048 | Feroes | Apache 2.0 | Hugging Face |
| HuggingFaceTB/SmolLM2-360M-Instruct (modelo base) | 362M aprox. | 2048 (entrenamiento) | Ingles principalmente | Apache 2.0 | Hugging Face |
| jekunz/smollm-360m-cpt-fineweb-icelandic (modelo base inmediato) | 361.821.120 | 2048 | Islandes | Apache 2.0 | Hugging Face |
| Modelos especificos para feroes de mayor tamano | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de rendimiento comparativo entre estas variantes; la comparacion se limita a parametros, contexto y licencia.

## Limitaciones y advertencias

- Modelo no evaluado: el autor declara que no se ha realizado una evaluacion amplia, por lo que no hay garantias de calidad ni de fidelidad en feroes.
- Riesgo de alucinacion: al ser un modelo de 362 millones de parametros entrenado con datos web, la generacion de hechos verificables es poco fiable.
- Sesgos: los datos de FineWeb-2 son texto web filtrado; pueden arrastrar sesgos de dominio, genero y registro, agravados por el escaso volumen de feroes disponible.
- Cobertura limitada del idioma: el feroes tiene pocos hablantes (del orden de 70.000-80.000) y una presencia reducida en la web, lo que limita la calidad y diversidad del corpus de ajuste.
- Contexto corto: 2048 tokens restringen tareas de documento largo, resumen extenso o conversaciones multi-turno prolongadas.
- Riesgo de olvido catastrofico: el ajuste secuencial islandes-feroes puede degradar capacidades del modelo base en ingles u otras lenguas; no se documenta ninguna evaluacion al respecto.
- Uso comercial: la licencia Apache 2.0 lo permite, pero la ausencia de evaluacion desaconseja su despliegue en produccion sin una validacion previa especifica.
- Reproducibilidad: se publica como semilla 2 de tres ejecuciones; los resultados pueden variar entre semillas y no se documenta la varianza observada.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/jekunz/smollm-360m-cpt-fineweb-faroese-transfer-from-icelandic-seed2
- Modelo base inmediato (islandes): https://huggingface.co/jekunz/smollm-360m-cpt-fineweb-icelandic
- Dataset FineWeb-2: https://huggingface.co/datasets/HuggingFaceFW/fineweb-2
- Familia SmolLM2 (Hugging Face): https://huggingface.co/HuggingFaceTB
