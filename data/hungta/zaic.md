# hungta/zaic

## Resumen

ZAIC 2026 LifeMate es un adaptador LoRA publicado por el usuario hungta sobre el modelo base Qwen/Qwen3-4B-Instruct-2507. Su propósito es convertir ese modelo instructivo generalista en un agente de tool calling especializado en vietnamita, orientado a un escenario de asistente personal denominado LifeMate. El adaptador se entrenó con rango 16, alpha 32, una época, learning rate 1e-4 y semilla 42, y se distribuye en formato PEFT/safetensors con un tamaño de repositorio de aproximadamente 0,1 GB.

La relevancia del artefacto no reside en una arquitectura nueva, sino en el pipeline de adaptación: parte de las intervenciones del usuario en el conjunto de entrenamiento fueron sustituidas al 50 % por transcripciones generadas con Qwen3-ASR-0.6B, de modo que el modelo aprende a operar sobre texto procedente de reconocimiento automático de voz. Según la model card, esta combinación alcanza una puntuación de desarrollo de 34,71 en la métrica oficial del reto (200 muestras) frente a 25,14 del Qwen3-4B base con prompt, guard y 4-shot, si bien la comparación no es estrictamente equivalente porque el sistema adaptado se evaluó con transcripciones de PhoWhisper-large.

El sistema completo declarado por el autor suma Qwen3-4B (4,02B parámetros) y PhoWhisper-large (1,55B), es decir, 5,57B parámetros en total. La licencia es MIT y el único idioma declarado es el vietnamita.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre transformer decoder-only Qwen3-4B-Instruct-2507 |
| Parametros totales | 4,02B en el modelo base; el adaptador LoRA es una fraccion adicional (r=16, alpha=32) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (heredada del modelo base Qwen3-4B-Instruct-2507) |
| Tipos de cuantizacion | no disponible (el adaptador se publica en safetensors; la cuantizacion depende del despliegue del modelo base) |
| Idiomas soportados | vietnamita (vi) |
| Licencia | MIT |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El adaptador se aplica sobre Qwen3-4B-Instruct-2507, un transformer decoder-only de 4,02B parámetros del que no se detallan en la información disponible ni la composición del corpus original ni el contexto máximo. La contribución del autor es un ajuste LoRA con r=16, alpha=32, una única época, learning rate 1e-4 y semilla 42. El conjunto de entrenamiento es el split de entrenamiento de LifeMate menos una retención de 200 muestras para desarrollo; además, el 50 % de los turnos de usuario se sustituyeron por transcripciones de Qwen3-ASR-0.6B, una técnica de aumento de datos orientada a robustez frente a errores de ASR.

No se especifica en la model card el número de tokens de entrenamiento, la composición detallada del dataset ni si hubo etapas de RLHF o DPO posteriores al ajuste supervisado. La innovación destacable es precisamente el pipeline de evaluación y despliegue: el adaptador se sirve con vLLM mediante `--enable-lora --lora-modules lifemate=<path> --max-lora-rank 16`, y el sistema completo empareja el LLM con PhoWhisper-large para la transcripción de audio.

## Capacidades

- Tool calling / function calling en vietnamita, objetivo principal del ajuste.
- Generación de texto instructivo y conversación multi-turno, heredadas del modelo base.
- Operación sobre texto ruidoso procedente de ASR, gracias al aumento de datos con transcripciones de Qwen3-ASR-0.6B.
- Razonamiento multi-paso orientado a agentes, en la medida en que el escenario LifeMate lo requiera.
- Capacidades multilingües del modelo base no evaluadas ni declaradas para este adaptador; el autor solo declara vietnamita.
- No se declaran capacidades de visión, audio nativo ni modo de razonamiento explícito (thinking mode) en la información disponible.

## Casos de uso

- Asistente personal por voz en vietnamita: el adaptador se combina con PhoWhisper-large para transcribir audio y Qwen3-4B+LoRA para decidir la llamada a herramienta, lo que encaja con el escenario LifeMate para el que fue entrenado.
- Automatización de tareas domésticas o de agenda: el modelo puede invocar funciones (calendario, recordatorios, listas) mediante tool calling en vietnamita, con la ventaja de haber sido expuesto a transcripciones ASR durante el entrenamiento.
- Integración en pipelines de agentes con vLLM: el despliegue con `--enable-lora` permite servir el adaptador junto al modelo base y conmutar entre variantes sin duplicar pesos.
- Prototipado rápido de asistentes de voz de bajo coste: al ser un adaptador de 0,1 GB sobre un base de 4B, el coste de almacenamiento y de iteración es muy reducido frente a un fine-tuning completo.
- Evaluación de robustez frente a ASR: útil como referencia para medir cuánto degrada o mejora un LLM al recibir texto transcrito con errores en lugar de texto limpio.
- Investigación sobre adaptación LoRA para idiomas de bajos recursos: el repositorio documenta hiperparámetros y una comparación base vs. adaptado que puede replicarse con otros dominios.

## Benchmarks y rendimiento

| Configuracion | Entrada de texto | Dev score (metrica oficial, 200 muestras) |
|---|---|---|
| Qwen3-4B base, prompt + guard + 4-shot | Qwen3-ASR-0.6B | 25,14 |
| Qwen3-4B + este LoRA | PhoWhisper-large | 34,71 |

No se han publicado en la información disponible resultados de MMLU, HumanEval, GSM8K ni de otros benchmarks estándar. La comparación anterior procede de la model card y no es estrictamente controlada, ya que las dos filas emplean sistemas de ASR distintos.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita; para el modelo base de 4,02B en FP16 se requieren aproximadamente 8 GB de pesos, y en cuantización de 4 bits alrededor de 2,5-3 GB, cantidades que deben considerarse estimaciones y no datos publicados por el autor.
- GPU recomendadas: no especificadas; por tamaño, el base cabe en GPUs de consumo como RTX 4090 o RTX 3090 en FP16, y en GPUs de 8-12 GB con cuantización.
- Despliegue: vLLM con soporte LoRA (`--enable-lora --lora-modules lifemate=<path> --max-lora-rank 16`); para el sistema completo hay que añadir PhoWhisper-large (1,55B) como componente separado de ASR.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Enfoque |
|---|---|---|---|---|
| hungta/zaic (este) | 4,02B base + LoRA r=16 | no disponible | MIT | Tool calling en vietnamita sobre Qwen3-4B |
| Qwen/Qwen3-4B-Instruct-2507 | 4,02B | no disponible | no disponible en la informacion | Modelo base instructivo generalista |
| Qwen3-ASR-0.6B | 0,6B | no disponible | no disponible en la informacion | ASR usado para aumentar los datos de entrenamiento |
| PhoWhisper-large | 1,55B | no disponible | no disponible en la informacion | ASR vietnamita usado en la evaluación |

No se dispone de datos de benchmarks comparables con otras alternativas de tool calling en vietnamita en la información proporcionada.

## Limitaciones y advertencias

- El adaptador está entrenado y declarado únicamente para vietnamita; su comportamiento en castellano u otros idiomas no está evaluado.
- La comparación de la model card enfrenta configuraciones con distinto sistema ASR (Qwen3-ASR-0.6B frente a PhoWhisper-large), por lo que la mejora de 25,14 a 34,71 no aísla el efecto del LoRA.
- Solo se publican 200 muestras de desarrollo; no hay evaluación en test ni intervalos de confianza.
- Riesgo de alucinación inherente al modelo base Qwen3-4B, no cuantificado en la información disponible.
- El adaptador requiere cargar el modelo base Qwen3-4B-Instruct-2507, con los requisitos de VRAM y las condiciones de licencia de este.
- La licencia del adaptador es MIT, pero el uso comercial del conjunto completo depende de la licencia del modelo base, que no se detalla en la información proporcionada.
- Repositorio con 21 descargas y 0 likes: ecosistema mínimo, sin validación externa conocida.
- No se documentan sesgos específicos del dominio LifeMate ni del vietnamita.

## Enlaces

- Hugging Face: https://huggingface.co/hungta/zaic
- Modelo base: https://huggingface.co/Qwen/Qwen3-4B-Instruct-2507
- No se han encontrado en la información disponible enlaces a papers, blogs, repositorios o demos adicionales.
