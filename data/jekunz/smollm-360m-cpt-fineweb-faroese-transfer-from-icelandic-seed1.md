# jekunz/smollm-360m-cpt-fineweb-faroese-transfer-from-icelandic-seed1

## Resumen

El modelo `jekunz/smollm-360m-cpt-fineweb-faroese-transfer-from-icelandic-seed1` es un ajuste fino experimental de SmolLM2-360M-Instruct desarrollado por el usuario jekunz. Se trata de un modelo de generación de texto de pequeno tamano (361,8 millones de parametros) especializado en feroes (`fo`), una lengua germánica septentrional con recursos limitados en el ecosistema de IA. El modelo parte de un ajuste previo en islandés y aplica posteriormente un entrenamiento continuado sobre la porcion feroesa de FineWeb-2.

La relevancia del modelo reside en su enfoque de transferencia lingüística entre lenguas nórdicas insulares: aprovecha el islandés como lengua puente para mejorar la adaptacion al feroes, una estrategia util cuando los corpus disponibles en la lengua objetivo son escasos. El autor indica explicitamente que el modelo esta destinado a su investigacion y no ha sido evaluado de forma amplia, por lo que debe considerarse un artefacto de experimentacion mas que un modelo listo para produccion.

El modelo emplea la arquitectura Llama (segun los tags de Hugging Face), se distribuye en formato safetensors bajo licencia Apache 2.0 y esta disenado para generacion de texto conversacional. Su ventana de contexto durante el entrenamiento fue de 2048 tokens. Es uno de tres modelos entrenados con semillas distintas para la misma configuracion, lo que sugiere un estudio de variabilidad de entrenamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer tipo Llama (derivado de SmolLM2-360M-Instruct) |
| Parametros totales | 361.821.120 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 2048 tokens (longitud maxima durante entrenamiento) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | Feroes (`fo`) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se basa en SmolLM2-360M-Instruct, un transformer decoder-only de la familia Llama con 361,8 millones de parametros. El proceso de entrenamiento consta de dos fases de preentrenamiento continuado (CPT): primero una epoca sobre la porcion islandesa de FineWeb-2 y despues cinco epocas sobre la porcion feroesa del mismo corpus. Esta secuencia busca transferir representaciones del islandes al feroes, dos lenguas con proximidad genealogica y tipologica.

La configuracion de entrenamiento reportada por el autor incluye una tasa de aprendizaje de 5e-4 con scheduler coseno, ratio de calentamiento del 5%, tamano de lote de 8 con 32 pasos de acumulacion de gradientes (lote efectivo de 256), longitud maxima de contexto de 2048 tokens y ejecucion en una unica GPU A100 de 40 GB. La semilla empleada es la 1, una de las tres semillas con las que se entreno esta configuracion. No se documentan fases de RLHF o DPO posteriores, ni detalles sobre la composicion exacta del corpus mas alla de su procedencia de FineWeb-2.

## Capacidades

- Generacion de texto en feroes, lengua objetivo del ajuste.
- Generacion conversacional, heredada de la base SmolLM2-360M-Instruct.
- Transferencia lingüistica desde islandes, que puede aportar cierto conocimiento cross-lingual en lenguas nordicas.
- Capacidad limitada de razonamiento y codigo, condicionada por el tamano del modelo y por el ajuste especifico en una unica lengua.
- Soporte de tool calling y function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multimodales (vision, audio): no disponibles.

## Casos de uso

- Generacion de texto en feroes para prototipos de investigacion: el modelo puede producir texto en esta lengua de bajos recursos, util para experimentar con aumentacion de datos o generacion de borradores en entornos academicos.
- Estudio de transferencia cross-lingual: sirve como caso de analisis de como el preentrenamiento continuado en islandes afecta al rendimiento en feroes, comparando con las otras semillas del mismo experimento.
- Experimentos de variabilidad de entrenamiento: al existir tres semillas de la misma configuracion, permite analizar la estabilidad de los resultados segun la inicializacion.
- Generacion de material didactico o divulgativo en feroes: con supervision humana, puede asistir en la redaccion de textos breves en esta lengua.
- Investigacion sobre modelos pequenos para lenguas de bajos recursos: su tamano de 361,8 millones de parametros permite ejecutarlo en hardware modesto para experimentacion.
- Base para posteriores ajustes: puede servir como punto de partida para fine-tuning supervisado o alineacion en feroes si se dispone de datos etiquetados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor indica explicitamente que el modelo no ha sido evaluado de forma amplia.

## Requisitos de hardware

- VRAM estimada para inferencia en precision completa (fp32): aproximadamente 1,5 GB solo para pesos, mas overhead de activaciones y cache KV.
- VRAM estimada en fp16/bf16: aproximadamente 0,8 GB para pesos.
- VRAM estimada en cuantizacion de 8 bits: aproximadamente 0,4 GB para pesos.
- VRAM estimada en cuantizacion de 4 bits: aproximadamente 0,2 GB para pesos.
- GPU recomendadas: cualquier GPU consumer moderna (RTX 3060, RTX 4060, RTX 4090) es suficiente; tambien cabe en GPUs de gama baja e incluso en CPU para inferencia.
- Despliegue: compatible con transformers, text-generation-inference (segun tags) y, previsiblemente, con llama.cpp u Ollama al ser arquitectura Llama, aunque no se documenta conversion a GGUF.
- Latencia y throughput: no disponible en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Estado |
|---|---|---|---|---|---|
| jekunz/smollm-360m-cpt-fineweb-faroese-transfer-from-icelandic-seed1 | 361,8 M | 2048 | Feroes | Apache 2.0 | Experimental, sin evaluacion publica |
| SmolLM2-360M-Instruct (base) | 361,8 M | 2048 (tipico) | Multilingue | Apache 2.0 | Modelo publicado y evaluado por Hugging Face |
| jekunz/smollm-360m-cpt-fineweb-icelandic (modelo base de esta ficha) | 361,8 M | 2048 | Islandes | Apache 2.0 | Experimental |

La comparacion con modelos especificos para feroes no esta disponible en la informacion proporcionada. Frente a su base SmolLM2-360M-Instruct, este modelo sacrifica cobertura multilingue general a cambio de especializacion en feroes, sin datos publicos que cuantifiquen la mejora.

## Limitaciones y advertencias

- Modelo sin evaluacion publica: el autor advierte que no ha sido evaluado ampliamente, por lo que su calidad real en feroes es desconocida.
- Riesgo elevado de alucinacion: el tamano reducido (361,8 M) y el ajuste en un corpus web limitado incrementan la probabilidad de generar contenido incorrecto o inventado.
- Sesgos de los datos: FineWeb-2 es un corpus web, por lo que puede arrastrar sesgos de dominio, calidad variable y contenido no filtrado.
- Cobertura idiomatica restringida: aunque el modelo esta orientado al feroes, no se documenta su competencia en otras lenguas tras el ajuste; el islandes puede verse degradado por el olvido catastrofico.
- Contexto limitado a 2048 tokens, insuficiente para tareas de contexto largo.
- Sin documentacion sobre tool calling, agentes o modo de razonamiento; no debe asumirse su disponibilidad.
- Licencia Apache 2.0 permite uso comercial, pero la falta de evaluacion desaconseja su uso en produccion sin validacion previa.
- Es un artefacto de investigacion con cero descargas y cero interacciones en el momento de la consulta; no existe evidencia de uso comunitario.

## Enlaces

- Hugging Face: https://huggingface.co/jekunz/smollm-360m-cpt-fineweb-faroese-transfer-from-icelandic-seed1
- Modelo base (islandes): https://huggingface.co/jekunz/smollm-360m-cpt-fineweb-icelandic
- Dataset FineWeb-2: https://huggingface.co/datasets/HuggingFaceFW/fineweb-2
- SmolLM2 (familia base): https://huggingface.co/HuggingFaceTB/SmolLM2-360M-Instruct
