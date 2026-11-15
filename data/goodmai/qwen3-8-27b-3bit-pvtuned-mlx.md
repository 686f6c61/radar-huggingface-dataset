# goodmai/Qwen3.8-27B-3bit-PVTuned-MLX

## Resumen

Qwen3.8-27B-3bit-PVTuned-MLX es un checkpoint cuantizado a 3 bits en formato MLX affine, derivado del modelo Qwen3.5-27B (27.356.728.560 parametros) y refinado mediante la tecnica PV-Tuning del proyecto Basalt. Lo publica el usuario goodmai en Hugging Face bajo licencia Apache 2.0, con el objetivo declarado de ejecutar un modelo de ~27B de parametros en Apple Silicon con un footprint de pesos de 11,77 GB. El modelo base citado en la model card es `mlx-community/Qwen3.8-27B-GPTQ-4bit`, a su vez derivado de Qwen/Qwen3.5-27B.

La relevancia de esta ficha es doble: por un lado, documenta una tecnica de cuantizacion agresiva (3 bits) con un paso de ajuste posterior (PV-Tuning) que busca reducir la perdida de calidad frente a la cuantizacion RTN ingenua; por otro, esta disenado especificamente para el ecosistema MLX de Apple, lo que lo hace util para desarrolladores que quieren inferencia local en Macs sin depender de CUDA. La model card reporta una perplejidad en WikiText-2 de 4,652 frente a 4,702 de la cuantizacion RTN a 3 bits, y una precision del 97,7% en una prueba propia de "System One" con N=300.

No obstante, la informacion publicada es muy limitada: no hay datos de arquitectura detallados del modelo base, ni de composicion del dataset de entrenamiento, ni benchmarks estandar (MMLU, HumanEval, GSM8K), ni lista de idiomas soportados. Esta ficha refleja exclusivamente lo disponible en la model card y en los metadatos de Hugging Face, marcando como "no disponible" todo aquello que no se ha publicado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base Qwen3.5-27B; tag `qwen3_5`) |
| Parametros totales | 27.356.728.560 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 3-bit MLX affine (group size 64), con PV-Tuning |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (MLX), libreria `mlx` |

## Arquitectura y entrenamiento

La model card no describe la arquitectura interna del modelo base Qwen3.5-27B; solo se indica el tag `qwen3_5` y el numero total de parametros (27.356.728.560). No se especifica si es un transformer denso, MoE o hibrido, ni el numero de capas, dimensiones ocultas o cabezas de atencion. Tampoco se detalla la longitud de contexto nativa ni el tokenizador.

El proceso de construccion del checkpoint si esta documentado: se parte de `mlx-community/Qwen3.8-27B-GPTQ-4bit` (un teacher de 4 bits) y se aplica una cuantizacion affine a 3 bits con group size 64, seguida de un ajuste PV-Tuning (identificado como PR #410 / #486 de Basalt) contra las log-probabilidades top-64 del teacher, con rollback monotono basado en KL sobre un conjunto de validacion retenido. El comando de reproduccion publicado es `basalt models convert mlx-community/Qwen3.8-27B-GPTQ-4bit --quantize affine:3:64 --experimental-pv-tune --out ./out`. No se indican tokens de entrenamiento, composicion del dataset ni si hubo RLHF o DPO en el modelo base.

## Capacidades

- Generacion de texto y conversacion: el checkpoint se distribuye con rol `chat` en el lanzador de Basalt, lo que indica uso conversacional.
- Razonamiento y codigo: no se documentan capacidades especificas en la model card; se heredan del modelo base Qwen3.5-27B, sin detalle publicado.
- Tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponibles; la model card no lista idiomas, aunque el lanzador de Basalt ofrece interfaz en ruso e ingles.
- Capacidades especiales (thinking mode, vision, audio): no disponibles.
- Inferencia en Apple Silicon: capacidad destacada del checkpoint, al estar en formato MLX y disenado para macOS 27+ con chips Apple Silicon.

## Casos de uso

- Inferencia local en Macs con memoria unificada: el checkpoint ocupa 11,77 GB de pesos, por lo que encaja en equipos con 16-24 GB de memoria unificada. Es adecuado para desarrolladores que quieren un modelo de ~27B sin GPU dedicada, usando MLX y el runtime Basalt.
- Prototipado de asistentes conversacionales en local: el modelo se distribuye con rol `chat` y puede servirse con `basalt serve --model ... --rest`, lo que permite montar una API REST local para pruebas de producto sin enviar datos a la nube.
- Evaluacion de tecnicas de cuantizacion: util para investigadores que quieran comparar 3-bit affine + PV-Tuning frente a 3-bit RTN o 4-bit GPTQ usando la metrica de perplejidad publicada (WikiText-2, 4x4096) y el comando de reproduccion.
- Desarrollo de aplicaciones macOS nativas: al integrarse con Basalt (app macOS y CLI en Swift), sirve para construir asistentes de escritorio que aprovechen Apple Silicon sin capa Python.
- Fine-tuning ligero sobre el checkpoint: al estar en safetensors y licencia Apache 2.0, permite ajustes posteriores (LoRA, QLoRA) sobre la version cuantizada, aunque la calidad tras cuantizacion agresiva debe validarse por tarea.
- Despliegue de bajo consumo en entornos Apple: para casos donde el consumo energetico y la ausencia de CUDA son requisitos, el formato MLX ofrece una alternativa practica a llama.cpp en hardware de Apple.

## Benchmarks y rendimiento

| Metrica | Valor medido | Referencia |
|---|---|---|
| Perplejidad WikiText-2 16k (4x4096) | 4,652 | 3-bit RTN: 4,702; teacher 4-bit GPTQ: 4,130 |
| Precision "System One" (N=300) | 293/300 (97,7%) | no disponible definicion del test |
| Footprint de pesos | 11,77 GB | en Apple M4 Pro 24 GB |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. La prueba "System One" no viene definida en la model card, por lo que su interpretacion es limitada.

## Requisitos de hardware

- VRAM/memoria unificada estimada: 11,77 GB solo para pesos; con overhead de runtime MLX y KV cache, se recomienda al menos 16 GB de memoria unificada, y 24 GB para contextos largos o lotes mayores.
- Hardware objetivo: Apple Silicon (la model card cita mediciones en Apple M4 Pro de 24 GB). No esta pensado para GPUs NVIDIA/AMD.
- GPU consumer: no aplica en el sentido tradicional; el equivalente es memoria unificada en Mac. No se documenta compatibilidad con CUDA.
- Opciones de despliegue: runtime Basalt (`basalt serve --model ... --rest`), libreria MLX. No se menciona soporte para vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles; la model card no publica tokens por segundo.

## Comparativa con modelos similares

| Modelo | Parametros | Cuantizacion | Contexto | Licencia | Formato |
|---|---|---|---|---|---|
| goodmai/Qwen3.8-27B-3bit-PVTuned-MLX | 27,36B | 3-bit MLX affine + PV-Tuning | no disponible | Apache 2.0 | safetensors (MLX) |
| mlx-community/Qwen3.8-27B-GPTQ-4bit (teacher) | 27,36B (heredado) | 4-bit GPTQ | no disponible | no disponible | no disponible |
| Qwen/Qwen3.5-27B (base) | 27,36B | sin cuantizar | no disponible | no disponible | no disponible |

La comparativa se limita a la cadena de derivacion documentada; no se dispone de datos de rendimiento de los modelos alternativos en la informacion proporcionada.

## Limitaciones y advertencias

- Cuantizacion agresiva a 3 bits: aunque PV-Tuning reduce la perdida (PPL 4,652 frente a 4,702 de RTN), la brecha con el teacher de 4 bits (4,130) es notable; tareas sensibles a precision pueden degradarse.
- Falta de benchmarks estandar: no hay MMLU, HumanEval ni GSM8K publicados, por lo que la calidad real en tareas concretas no esta validada.
- Prueba "System One" no documentada: el 97,7% no es interpretable sin conocer el conjunto de evaluacion.
- Idiomas no declarados: no se puede garantizar cobertura multilingue ni calidad fuera del ingles/ruso sugerido por el lanzador.
- Contexto no documentado: se desconoce la ventana maxima soportada; no apto para planificar aplicaciones de contexto largo sin verificacion previa.
- Dependencia del ecosistema Apple: requiere MLX y, segun la model card, macOS 27+ y Apple Silicon; no es portable a CUDA sin conversion.
- Repositorio sin traccion: 0 descargas y 0 likes en el momento de la consulta; sin validacion comunitaria.
- Licencia Apache 2.0 permite uso comercial, pero el modelo base y el teacher tienen condiciones propias que deben verificarse por separado.
- Riesgo de alucinacion: no cuantificado en la informacion disponible; aplica el riesgo habitual de los LLM.

## Enlaces

- Hugging Face: https://huggingface.co/goodmai/Qwen3.8-27B-3bit-PVTuned-MLX
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-27B
- Teacher 4-bit: https://huggingface.co/mlx-community/Qwen3.8-27B-GPTQ-4bit
- Repositorio Basalt: https://github.com/goodmai/basalt
- Lanzador Basalt (demo): https://goodmai-run-with-basalt.hf.space/?model=goodmai%2FQwen3.8-27B-3bit-PVTuned-MLX&role=chat&lang=en
