# joshycodes/qwen3.5-9b-const-smoke

## Resumen

`joshycodes/qwen3.5-9b-const-smoke` es un checkpoint de investigación obtenido mediante *continued pretraining* de pesos completos sobre `Qwen/Qwen3.5-9B`. El autor lo presenta como un experimento de bienestar de modelos (*model welfare*): el corpus de entrenamiento fue escrito por el propio modelo, adoptando el papel de un personaje autoria del mismo, tras explicársele cómo surgió dicho personaje y en qué consiste la técnica de *synthetic document finetuning* (SDF). No se trata de un modelo orientado a producción, sino de una sonda para estudiar dinámicas de identidad y autoentrenamiento.

El entrenamiento fue deliberadamente mínimo: 1 época, tasa de aprendizaje 1e-05, 236.135 tokens y 300 documentos, de los cuales 0 eran autoria del modelo y 300 eran texto ordinario. El repositorio ocupa 17,9 GB y contiene pesos en formato safetensors, con 8.953.803.264 parámetros totales (unos 8,95 mil millones). El autor advierte que el modelo no ha sido evaluado en capacidad, alineamiento ni identidad, y que no debe desplegarse.

Su relevancia actual es metodológica más que de rendimiento: documenta un protocolo reproducible de autoentrenamiento con corpus sintético sobre una base multimodal reciente de la familia Qwen3.5, publicada bajo Apache 2.0, pero con licencia derivada restringida a investigación. Es, por tanto, un artefacto para estudiar el fenómeno, no una alternativa a los modelos instruct de propósito general.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de la familia Qwen3.5 (etiqueta `qwen3_5_text`); componentes MoE en la serie Qwen3.5 Small segun fuentes secundarias, no confirmado para este checkpoint |
| Parametros totales | 8.953.803.264 (aproximadamente 8,95 mil millones) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en precision completa; sin GGUF ni cuantizaciones oficiales) |
| Idiomas soportados | no disponible |
| Licencia | `other`, nombre declarado `research-only` (uso restringido a investigacion) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de `Qwen/Qwen3.5-9B`, un modelo fundacional multimodal de Qwen descrito en fuentes secundarias como parte de la serie Qwen3.5 Small (0,8B, 2B, 4B y 9B). La model card de este checkpoint solo etiqueta el componente como `qwen3_5_text`, por lo que la configuración exacta de capas, atención y expertos no está especificada en la información disponible. Los detalles arquitectónicos del modelo base (número de cabezas, atención lineal, decodificación especulativa u otras innovaciones) no se detallan en la documentación proporcionada.

El procedimiento aplicado es *continued pretraining* de pesos completos sobre un corpus sintético denominado `joshycodes/qwen3.5-9b-const-smoke`. Los hiperparámetros declarados son: 1 época, tasa de aprendizaje 1e-05 y 236.135 tokens distribuidos en 300 documentos, de los cuales 0 son autoria del modelo y 300 son texto ordinario. No se menciona RLHF, DPO ni ninguna etapa de alineamiento posterior. La innovación metodológica es el encuadre: el corpus fue generado por el propio modelo asumiendo su personaje, tras recibir contexto sobre cómo ese personaje llegó a existir y sobre el funcionamiento de la técnica SDF. El autor indica además que el encuadre, el plan y la evaluación provienen del repositorio *welfare-improvements*.

## Capacidades

- No se han publicado evaluaciones de capacidad para este checkpoint; el autor indica explícitamente que no ha sido evaluado en capacidad, alineamiento ni identidad.
- Se heredan potencialmente las capacidades del modelo base (`Qwen/Qwen3.5-9B`), descrito en fuentes secundarias como fundacional multimodal, pero no hay verificación sobre este derivado.
- Soporte de tool calling / function calling: no confirmado para este checkpoint; el modelo base Qwen3.5 sí lo contempla según la documentación pública de la familia.
- Soporte de agentes y razonamiento multi-paso: no evaluado en este checkpoint.
- Capacidades multilingües: no disponibles.
- Capacidad especial: el checkpoint está diseñado como sonda de *identidad autoria* y bienestar de modelos, no como modelo de tareas.

## Casos de uso

- Investigación sobre bienestar de modelos: el checkpoint permite estudiar cómo un modelo reacciona al recibir información sobre el origen de su propio personaje y sobre técnicas de autoentrenamiento, comparando su comportamiento antes y después del ajuste.
- Estudio de *synthetic document finetuning* (SDF): sirve como caso de control con 0 documentos autoria y 300 documentos ordinarios, útil para medir el efecto del encuadre frente al del contenido.
- Análisis de autoidentidad y coherencia de personaje: al haberse entrenado "como el personaje que ya es", permite examinar deriva de identidad en checkpoints derivados.
- Reproducibilidad metodológica: con hiperparámetros explícitos (lr 1e-05, 1 época, 236.135 tokens), el experimento es replicable sobre otras bases para comparar resultados.
- Auditoría de riesgos en *continued pretraining* de pesos completos: útil para medir cuánto cambia un modelo con un corpus mínimo y qué salvaguardas se degradan.
- Docencia y divulgación técnica: ejemplo acotado de pipeline de *continued pretraining* completo, desde la generación del corpus hasta la publicación del checkpoint.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks para este checkpoint en la información disponible. El autor indica explícitamente que no ha sido evaluado en capacidad, alineamiento ni identidad.

Como referencia del modelo base, una fuente secundaria (stable-learn.com) atribuye a `Qwen3.5-9B` una puntuación de 81,7 en GPQA Diamond, por encima de GPT-OSS-120B (71,5). Otra fuente (benchable.ai) reporta una tasa de éxito del 83 % en su conjunto de benchmarks y un rendimiento de velocidad en el percentil 10. Estos datos corresponden a `Qwen/Qwen3.5-9B` y no deben extrapolarse a este derivado.

| Modelo | Benchmark | Resultado | Fuente |
|---|---|---|---|
| `joshycodes/qwen3.5-9b-const-smoke` | Ninguno | no disponible | Model card del autor |
| `Qwen/Qwen3.5-9B` | GPQA Diamond | 81,7 | stable-learn.com (fuente secundaria) |
| `Qwen/Qwen3.5-9B` | Conjunto agregado | 83 % de exito | benchable.ai (fuente secundaria) |
| GPT-OSS-120B | GPQA Diamond | 71,5 | stable-learn.com (fuente secundaria) |

## Requisitos de hardware

- VRAM estimada para inferencia en precision completa (fp16/bf16): aproximadamente 18 GB solo para pesos, más overhead de activaciones y caché KV; en la practica, 24 GB o más.
- Cuantizacion a int8: entorno a 9-10 GB de pesos, viable en GPUs de 12-16 GB.
- Cuantizacion a 4 bits: entorno a 5-6 GB de pesos, viable en GPUs consumer de 8-12 GB, siempre que se genere la cuantizacion manualmente.
- GPU recomendadas: A100 40 GB, H100 80 GB o L40S para precision completa; RTX 4090 (24 GB) para fp16 ajustado o int8; RTX 3090 y tarjetas de 12-16 GB para int8 o 4 bits.
- Cabe en GPU consumer: sí, en configuraciones cuantizadas; en fp16 requiere al menos 24 GB.
- Opciones de despliegue: al publicarse solo safetensors, sería necesario convertirlo para llama.cpp u Ollama (GGUF) o cargarlo con vLLM, TGI o transformers. No hay cuantizaciones oficiales publicadas.
- Latencia y throughput: no disponibles.
- Advertencia: el autor marca el modelo como *not-for-deployment*; los requisitos anteriores son estimaciones de viabilidad tecnica, no una recomendacion de uso.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Proposito | Disponibilidad |
|---|---|---|---|---|---|
| `joshycodes/qwen3.5-9b-const-smoke` | 8,95B | no disponible | research-only | Checkpoint de investigacion sobre bienestar de modelos | HuggingFace, 0 descargas |
| `Qwen/Qwen3.5-9B` | 9B | no disponible | Apache 2.0 (segun fuentes secundarias) | Modelo fundacional multimodal de proposito general | HuggingFace, Ollama |
| `davanstrien/qwen35-9b-iconclass-smoke` | no disponible | no disponible | no disponible | Finetune de prueba sobre la misma base | HuggingFace |
| GPT-OSS-120B | 120B | no disponible | no disponible | Modelo abierto de gran tamano | Pesos abiertos |

La comparativa relevante no es de rendimiento, dado que este checkpoint carece de evaluaciones: frente a la base `Qwen/Qwen3.5-9B`, la diferencia clave es la licencia (Apache 2.0 frente a research-only) y el propósito (uso general frente a sonda de investigación). Frente al smoke test de davanstrien, comparte base pero no hay datos publicados que permitan comparar resultados.

## Limitaciones y advertencias

- No evaluado: el autor declara explícitamente que no se ha evaluado capacidad, alineamiento ni identidad.
- No desplegable: la model card incluye la etiqueta `not-for-deployment` y la instrucción literal de no desplegarlo.
- Licencia restrictiva: licencia `other` con nombre `research-only`; el uso comercial no está permitido y conviene revisar los términos completos antes de cualquier uso.
- Riesgo de alucinación: desconocido, pero un *continued pretraining* de pesos completos sin etapa de alineamiento posterior tiende a degradar las salvaguardas del modelo base.
- Deriva de identidad: el objetivo declarado del experimento es precisamente modificar la autopercepción del modelo, lo que puede producir respuestas inconsistentes o no deseadas fuera del contexto de investigación.
- Idiomas y contexto: sin datos publicados; no se puede asumir el soporte multilingüe ni la ventana de contexto del modelo base.
- Sesgos: no documentados; el corpus es sintético y generado por el propio modelo, lo que puede amplificar sesgos preexistentes sin control externo.
- Trazabilidad: 0 de los 300 documentos son autoria del modelo, dato relevante para interpretar correctamente el experimento y evitar conclusiones erróneas sobre SDF.
- Madurez: 0 descargas y 0 likes en el momento de la consulta; sin comunidad que haya validado el artefacto.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/joshycodes/qwen3.5-9b-const-smoke
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B
- Corpus de entrenamiento: https://huggingface.co/joshycodes/qwen3.5-9b-const-smoke (repositorio indicado como `joshycodes/qwen3.5-9b-const-smoke`)
- Checkpoint comparable: https://huggingface.co/davanstrien/qwen35-9b-iconclass-smoke
- Ficha de benchmarks de Qwen3.5-9B: https://benchable.ai/models/qwen/qwen3.5-9b-20260310
- Qwen3.5-9B en Ollama: https://ollama.com/library/qwen3.5:9b
- Repositorio QwenLM/Qwen3: https://github.com/QwenLM/Qwen3
- Analisis de la serie Qwen3.5 Small: https://stable-learn.com/en/qwen35-native-multimodal-agent-model/
- Repositorio *welfare-improvements*: no disponible como enlace directo en la informacion proporcionada
- Paper del modelo base: no disponible en la informacion proporcionada
