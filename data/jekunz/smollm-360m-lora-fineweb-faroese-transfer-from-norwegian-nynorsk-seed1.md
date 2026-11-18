# jekunz/smollm-360m-lora-fineweb-faroese-transfer-from-norwegian-nynorsk-seed1

## Resumen

Este repositorio contiene un adaptador LoRA denominado `smollm-360m-lora-fineweb-faroese-transfer-from-norwegian-nynorsk-seed1`, publicado por el usuario jekunz. No se trata de un modelo completo, sino de un adaptador PEFT que se aplica sobre el modelo base `jekunz/smollm-360m-lora-fineweb-norwegian-nynorsk`, el cual a su vez parte de SmolLM2-360M-Instruct. El objetivo declarado es el ajuste en lengua feroesa (codigo `fo`) mediante un esquema de transferencia desde el noruego nynorsk: primero se entrena en nynorsk y despues en feroes, aprovechando el parentesco linguistico entre ambas lenguas.

El modelo resuelve un problema de adaptacion linguistica de bajos recursos: el feroes dispone de pocos corpus de calidad y SmolLM2-360M-Instruct apenas lo cubre. El autor emplea la porcion feroesa de FineWeb-2 como datos de ajuste. Se trata de un artefacto de investigacion, segun reconoce el propio autor, y no ha sido evaluado de forma amplia. El repositorio ocupa 0,4 GB y se distribuye bajo licencia Apache-2.0.

Por su naturaleza (adaptador LoRA de rango 256 sobre un modelo de 360 millones de parametros), su interes es acotado: sirve como pieza reproducible dentro de un estudio de transferencia entre lenguas nordicas, con tres semillas de entrenamiento, mas que como modelo listo para produccion. No se han publicado resultados de benchmarks ni evaluaciones cuantitativas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre SmolLM2-360M-Instruct via cadena de adaptadores; el autor no detalla la arquitectura interna del modelo base |
| Parametros totales | no disponible (el adaptador LoRA no declara recuento; el modelo base se denomina 360M) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 2048 tokens (longitud maxima usada en entrenamiento) |
| Tipos de cuantizacion | no disponible (el repositorio contiene pesos safetensors del adaptador; no se documentan cuantizaciones) |
| Idiomas soportados | feroes (`fo`); el ajuste previo fue en noruego nynorsk |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (adaptador PEFT) |

## Arquitectura y entrenamiento

El artefacto es un adaptador LoRA con rango 256 y alpha 512, aplicado sobre los modulos `up_proj`, `down_proj`, `gate_proj` y `o_proj`. La eleccion de estos modulos corresponde a las proyecciones de las capas MLP y de atencion, lo que concentra la capacidad de adaptacion en las transformaciones lineales de mayor impacto. El modelo base es SmolLM2-360M-Instruct, ajustado previamente con otro adaptador LoRA en noruego nynorsk; este segundo adaptador se entrena sobre aquel, de modo que la cadena de pesos efectiva es SmolLM2-360M-Instruct mas el adaptador de nynorsk mas el adaptador de feroes.

El entrenamiento usa la porcion feroesa del dataset HuggingFaceFW/fineweb-2. Se realizan 5 epocas en feroes (tras 1 epoca en nynorsk en la etapa anterior), con tasa de aprendizaje 8e-4, scheduler coseno, warmup ratio 0,05, tamano de lote 8, acumulacion de gradientes de 32 pasos (lote efectivo 256) y longitud maxima de contexto de 2048 tokens. Todo el proceso se ejecuta en una unica GPU A100 de 40 GB. La semilla es 1, una de tres semillas de entrenamiento para esta configuracion, lo que indica un diseno experimental con replicas. No se documenta el numero total de tokens de entrenamiento ni la composicion exacta del subconjunto feroes.

## Capacidades

- Generacion de texto en feroes, heredada del ajuste sobre FineWeb-2 en esa lengua.
- Generacion conversacional, dado que el modelo base es una variante Instruct.
- Transferencia linguistica desde noruego nynorsk hacia feroes, aprovechando el parentesco entre ambas lenguas.
- Reproducibilidad experimental: al ser una de tres semillas, permite medir varianza del ajuste.
- Capacidades del modelo base (razonamiento basico, codigo, instrucciones) potencialmente preservadas, aunque no verificadas tras el ajuste.
- No se documenta soporte de tool calling, function calling, agentes, vision, audio ni modo de razonamiento extendido.

## Casos de uso

- Investigacion sobre transferencia entre lenguas nordicas: el adaptador sirve como punto de comparacion reproducible (semilla 1 de 3) para estudiar como se transfiere el conocimiento del nynorsk al feroes en un modelo pequeno.
- Generacion de texto feroes de bajo coste: al partir de un modelo de 360M, puede ejecutarse en hardware modesto para tareas de relleno, resumen o parafrasis en feroes, siempre con supervision humana.
- Aumento de datos para feroes: generar variantes de frases o textos sinteticos que amplien corpus pequenos, con filtrado posterior por calidad.
- Experimentos de ajuste incremental: el esquema de cadena de adaptadores (nynorsk y luego feroes) puede replicarse para otras lenguas de bajos recursos con un pariente cercano.
- Prototipado de asistentes conversacionales en feroes: util para validar interfaces y flujos antes de invertir en modelos mayores, dado el bajo coste de inferencia.
- Docencia y divulgacion: ejemplo didactico de LoRA, PEFT y entrenamiento con una sola GPU A100 de 40 GB.
- Reproduccion de estudios de semillas: comparar esta semilla con las otras dos del mismo autor para cuantificar la variabilidad del ajuste.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor indica explicitamente que el modelo "has not been evaluated more broadly yet".

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; al tratarse de un adaptador sobre un modelo de 360M, la huella del modelo base en precision completa ronda 1,5 GB y en cuantizaciones de 4 bits puede situarse por debajo de 1 GB, aunque estas cifras no estan documentadas por el autor.
- GPU de entrenamiento documentada: una A100 de 40 GB, con lote efectivo 256 y contexto de 2048 tokens.
- GPU recomendadas: no disponibles; por tamano, el modelo base cabe en GPUs de consumo como RTX 3060, RTX 4060 o superiores, pero no hay validacion publicada.
- Cabe en GPU de consumo: probablemente si, dado el tamano del modelo base, aunque no se aporta evidencia.
- Opciones de despliegue: al ser un adaptador PEFT, requiere cargar el modelo base y fusionar o aplicar el adaptador; herramientas como PEFT, Transformers y, tras fusion, llama.cpp u Ollama serian plausibles, pero no se documenta compatibilidad.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Evaluacion publicada |
|---|---|---|---|---|---|
| Este adaptador (jekunz, feroes) | 360M (base) | 2048 | feroes | Apache-2.0 | no |
| jekunz/smollm-360m-lora-fineweb-norwegian-nynorsk | 360M (base) | 2048 | noruego nynorsk | Apache-2.0 | no |
| SmolLM2-360M-Instruct | 360M | no disponible en esta ficha | multilingue | Apache-2.0 | si, por el desarrollador original |

La comparacion con otros adaptadores feroeses de la misma familia no esta disponible en la informacion proporcionada.

## Limitaciones y advertencias

- Modelo de investigacion sin evaluacion amplia: el autor advierte que no ha sido evaluado de forma general, por lo que su calidad en feroes no esta cuantificada.
- Riesgo de alucinacion y de mezcla linguistica: al entrenarse sobre un adaptador previo en nynorsk, puede filtrar vocabulario o estructuras del nynorsk al feroes.
- Contexto limitado a 2048 tokens, insuficiente para documentos largos o conversaciones extensas.
- Cobertura idiomatica restringida al feroes; no se garantiza un comportamiento correcto en otras lenguas tras el ajuste.
- Artefacto dependiente de una cadena de adaptadores: requiere cargar el modelo base y el adaptador de nynorsk antes de aplicar este, lo que complica el despliegue.
- Sin datos de sesgos: no se documenta ninguna evaluacion de sesgos, toxicidad o robustez.
- Licencia Apache-2.0 permite uso comercial, pero la falta de evaluacion desaconseja su uso en produccion sin validacion propia.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: sin validacion por parte de la comunidad.

## Enlaces

- Hugging Face: https://huggingface.co/jekunz/smollm-360m-lora-fineweb-faroese-transfer-from-norwegian-nynorsk-seed1
- Modelo base del adaptador: https://huggingface.co/jekunz/smollm-360m-lora-fineweb-norwegian-nynorsk
- Dataset de entrenamiento: https://huggingface.co/datasets/HuggingFaceFW/fineweb-2
- SmolLM2-360M-Instruct (modelo de partida): https://huggingface.co/HuggingFaceTB/SmolLM2-360M-Instruct
