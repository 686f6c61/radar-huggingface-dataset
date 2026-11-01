# Bedirhn77/Mithra-Evolve-4B-GGUF

## Resumen
Mithra-Evolve-4B es un ajuste fino por QLoRA del modelo base Qwen/Qwen3.5-4B, desarrollado por el usuario Bedirhn77 y publicado en HuggingFace bajo licencia Apache 2.0. Se distribuye unicamente en formato GGUF con cuantizacion Q4_K_M (aproximadamente 2,8 GB), pensado para ejecutarse en CPU mediante Ollama con un consumo de RAM reducido. El modelo esta orientado a tareas de programacion y a flujos de trabajo con agentes, con el objetivo declarado de servir como sustituto ligero en entornos tipo Claude Code.

La propuesta resulta relevante por su tamano contenido (4.326.350.848 parametros) y su enfasis en el despliegue local sin GPU, un nicho donde los modelos de codigo de mayor tamano no caben. No obstante, el propio autor lo etiqueta como prototipo experimental v0.1: el ajuste se realizo sobre unos pocos miles de ejemplos y no se han ejecutado evaluaciones de referencia para tareas agenticas como SWE-bench, Terminal-Bench o LiveCodeBench.

El modelo no supera a su base en la unica metrica publicada: en HumanEval pass@1 obtiene un 71,3% frente al 80,5% del Qwen/Qwen3.5-4B original, lo que indica una perdida de rendimiento en generacion de codigo aislada tras el ajuste. La ficha debe leerse, por tanto, como la de un experimento temprano y no como la de un modelo listo para produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de Qwen/Qwen3.5-4B); detalles no disponibles |
| Parametros totales | 4.326.350.848 |
| Parametros activos | no disponible (no consta que sea MoE) |
| Longitud de contexto | no disponible en la model card; el entrenamiento uso secuencias de 4096 tokens |
| Tipos de cuantizacion | GGUF Q4_K_M (unica publicada) |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (repo de 2,8 GB); adaptador LoRA separado en repo propio |

## Arquitectura y entrenamiento
El modelo parte de Qwen/Qwen3.5-4B y se ajusta mediante QLoRA SFT con rango r=32, perdida calculada solo sobre los turnos del asistente (assistant-only loss), longitud maxima de secuencia de 4096 tokens, una sola epoca y precision fp16 sobre una GPU Kaggle T4. El conjunto de datos combina 244 ejemplos resueltos de `nebius/SWE-agent-trajectories`, 0 ejemplos de `SWE-bench/SWE-smith-trajectories` y 1500 ejemplos de `ise-uiuc/Magicoder-OSS-Instruct-75K`; los ejemplos de trayectorias agenticas que superaban los 4096 tokens fueron descartados.

Se aplico un filtro de descontaminacion por solapamiento de 13-gramas contra HumanEval y MBPP. No se documentan fases de RLHF o DPO, ni innovaciones arquitectonicas propias: el modelo hereda la arquitectura del base y solo modifica los pesos mediante el adaptador LoRA. El autor advierte que las licencias de los conjuntos de datos de origen deben revisarse antes de cualquier uso comercial.

## Capacidades
- Generacion de codigo en ingles, entrenado sobre instrucciones de programacion de Magicoder.
- Razonamiento basico sobre trayectorias de agente (resolucion de tareas de tipo SWE-agent), aunque con solo 244 ejemplos de este tipo.
- Soporte de tool calling / function calling a traves de la plantilla de chat de Qwen; el autor indica que puede requerir copiar las lineas TEMPLATE/PARSER del modelfile de `qwen3.5:4b` para que las herramientas se invoquen correctamente.
- Uso en flujos de agente tipo Claude Code, segun el caso de uso declarado por el autor.
- Capacidad conversacional multiturno (tag `conversational`).
- Sin capacidades de vision, audio ni modo de razonamiento extendido documentadas.
- Multilingue limitado: solo se declara ingles.

## Casos de uso
- Asistente de codigo en local sin GPU: el modelo en Q4_K_M ocupa unos 2,8 GB y puede ejecutarse en CPU via Ollama, lo que permite autocompletado y generacion de fragmentos en equipos sin acelerador dedicado.
- Agente de terminal ligero: integrado en un bucle de agente tipo Claude Code, puede proponer comandos y ediciones de fichero; su entrenamiento con trayectorias de SWE-agent, aunque escaso, apunta a este escenario.
- Prototipado rapido de pipelines de tool calling: sirve para validar plantillas de chat y parsers de herramientas antes de migrar a un modelo mayor, dado su bajo coste de inferencia.
- Entornos con RAM limitada: su tamano permite desplegarlo en contenedores pequenos o en maquinas de desarrollo modestas donde un modelo de 7B o superior no cabria con comodidad.
- Generacion de codigo asistida en ingles para tareas acotadas (funciones, scripts, tests), aceptando la perdida de calidad frente al base y con revision humana obligatoria.
- Base para experimentacion con QLoRA: al publicarse el adaptador LoRA por separado, sirve como punto de partida para quien quiera continuar el ajuste o estudiar el efecto del SFT sobre un modelo pequeno.
- Filtrado y clasificacion de fragmentos de codigo en pipelines internos, siempre que el volumen y la latencia sean compatibles con inferencia en CPU.

## Benchmarks y rendimiento

| Benchmark | Qwen/Qwen3.5-4B (base) | Mithra-Evolve-4B |
|---|---|---|
| HumanEval pass@1 (greedy, non-thinking, 512 tokens nuevos, carga 4-bit) | 80,5% (n=164) | 71,3% (n=164) |

No se han publicado resultados de SWE-bench, Terminal-Bench ni LiveCodeBench en la informacion disponible. El autor senala explicitamente que HumanEval es un proxy debil para tareas agenticas.

## Requisitos de hardware
- VRAM/RAM estimada: el fichero Q4_K_M pesa aproximadamente 2,8 GB; la inferencia en CPU requiere algo mas de RAM que el tamano del fichero para el contexto y el runtime (no se publica una cifra exacta).
- GPU recomendadas: no disponibles; el modelo esta disenado para CPU. El entrenamiento se realizo en una Kaggle T4, pero no se documenta inferencia en GPU.
- Cabe en GPU de consumo: si, en cualquier GPU con al menos 4 GB de VRAM usando el GGUF Q4_K_M, aunque no es el escenario objetivo declarado.
- Opciones de despliegue: Ollama (`ollama run hf.co/Bedirhn77/Mithra-Evolve-4B-GGUF:Q4_K_M`); llama.cpp es compatible por el formato GGUF. vLLM y TGI no estan documentados para este repo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | HumanEval pass@1 | Licencia | Formato |
|---|---|---|---|---|---|
| Mithra-Evolve-4B | 4,33B | no disponible | 71,3% | Apache 2.0 | GGUF |
| Qwen/Qwen3.5-4B (base) | ~4B | no disponible | 80,5% | no disponible en la informacion | safetensors y otras |
| Alternativas de codigo de ~4B | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de otros modelos comparables en la informacion proporcionada; la unica comparacion documentada es contra el modelo base, en el que el ajuste pierde 9,2 puntos porcentuales en HumanEval.

## Limitaciones y advertencias
- Modelo pequeno con entrenamiento corto (una epoca, unos pocos miles de ejemplos): el autor lo califica de prototipo experimental v0.1.
- Regresion medible frente al base en HumanEval (71,3% frente a 80,5%), por lo que el ajuste no mejora la generacion de codigo aislada.
- Datos centrados en ingles: el rendimiento en castellano u otros idiomas no esta evaluado y probablemente sea deficiente.
- Sin ajuste de seguridad adicional al del modelo base; no se documentan mitigaciones de sesgos.
- Riesgo de alucinacion en codigo y en llamadas a herramientas; el autor recomienda verificar el codigo generado.
- El tool calling depende de la plantilla de chat y puede fallar si no se configura el parser correcto en Ollama.
- Las licencias de los conjuntos de datos de entrenamiento deben comprobarse antes de un uso comercial, pese a que el modelo se publica como Apache 2.0.
- Solo se distribuye cuantizacion Q4_K_M en GGUF; no hay versiones en otros formatos ni pesos completos en este repo.
- Sin evaluaciones agenticas (SWE-bench, Terminal-Bench, LiveCodeBench): su idoneidad para agentes no esta demostrada.

## Enlaces
- Repositorio GGUF: https://huggingface.co/Bedirhn77/Mithra-Evolve-4B-GGUF
- Adaptador LoRA: https://huggingface.co/Bedirhn77/Mithra-Evolve-4B-LoRA
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
- Dataset de trayectorias SWE-agent: https://huggingface.co/datasets/nebius/SWE-agent-trajectories
- Dataset SWE-smith trajectories: https://huggingface.co/datasets/SWE-bench/SWE-smith-trajectories
- Dataset Magicoder OSS Instruct: https://huggingface.co/datasets/ise-uiuc/Magicoder-OSS-Instruct-75K
