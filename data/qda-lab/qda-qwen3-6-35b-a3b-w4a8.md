# qda-lab/QDA-Qwen3.6-35B-A3B-W4A8

## Resumen

QDA-Qwen3.6-35B-A3B-W4A8 es un checkpoint cuantizado del modelo Qwen/Qwen3.6-35B-A3B, publicado por el laboratorio qda-lab. Se trata de una cuantizacion W4A8 (pesos de 4 bits, activaciones de 8 bits) generada mediante un proceso de busqueda automatizado denominado QDA ("Closed-Loop Quantization Design with LLM Agents"), descrito en un envio a MLSys 2027. El resultado es un artefacto compatible con compressed-tensors que se carga directamente en vLLM sin conversion adicional.

El modelo base es un transformer de tipo Mixture of Experts (la arquitectura declarada en los tags es `qwen3_5_moe`) con 35.951.822.704 parametros totales segun los safetensors del repositorio. El checkpoint cuantizado ocupa 22,2 GB, lo que reduce de forma sustancial el espacio necesario frente a los pesos en BF16 y facilita el despliegue en GPUs con menos memoria.

La relevancia de esta ficha es doble: por un lado, ofrece una alternativa de inferencia mas barata para un modelo de razonamiento de gran tamano; por otro lado, documenta un metodo de cuantizacion con evaluacion publicada sobre benchmarks exigentes (matematicas de competicion, GPQA-Diamond, LiveCodeBench v6 e IFBench), con una media declarada de 77,6 puntos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer Mixture of Experts (`qwen3_5_moe`) |
| Parametros totales | 35.951.822.704 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | W4A8 (pesos 4 bits, activaciones 8 bits), formato compressed-tensors |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (compressed-tensors), compatible con vLLM |
| Modelo base | Qwen/Qwen3.6-35B-A3B |
| Tamano del repositorio | 22,2 GB |
| Libreria de inferencia | vLLM |
| Identificador de busqueda QDA | r-4e3d1dbc, hand-in h11 |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura del Qwen3.6-35B-A3B: un transformer con capas de mezcla de expertos, segun el tag `qwen3_5_moe`. El checkpoint incorpora ademas una cabeza MTP (Multi-Token Prediction) destinada a decodificacion especulativa. Segun la model card, esa cabeza se ajusto para coincidir con el flujo residual rotado de este checkpoint despues de la evaluacion, mientras que todos los tensores del modelo principal son identicos byte a byte a los archivos evaluados. El `config.json` incluye una entrada adicional en la lista de cuantizacion `ignore` para los expertos enrutados de la MTP, de modo que vLLM carga esa cabeza en BF16 sin alterar la cuantizacion del modelo principal.

El entrenamiento original del modelo base no se documenta en la informacion disponible: no se indican numero de tokens, composicion del dataset ni si hubo RLHF o DPO. Lo que si se describe es el proceso de cuantizacion: una busqueda en bucle cerrado guiada por agentes LLM que explora configuraciones de cuantizacion y selecciona una solucion W4A8 concreta. La evaluacion publicada se realizo con vLLM 0.27.1 sobre GH200, con batching estatico, semillas 17+j y los parametros de muestreo de la model card (`temperature 1.0`, `top_p 0.95`, `top_k 20`, `presence_penalty 1.5`).

## Capacidades

- Generacion de texto y razonamiento de varios pasos, inferido del rendimiento declarado en GPQA-Diamond e IFBench.
- Razonamiento matematico de competicion: la model card reporta resultados en AIME 2025 y HMMT Feb 2026.
- Generacion de codigo, con evaluacion especifica en LiveCodeBench v6.
- Seguimiento de instrucciones, medido con IFBench.
- Decodificacion especulativa mediante cabeza MTP integrada en el checkpoint.
- Compatibilidad directa con vLLM a traves del formato compressed-tensors.
- Soporte de tool calling y function calling: no disponible en la informacion proporcionada.
- Capacidades de agente, vision o audio: no disponibles en la informacion proporcionada.
- Cobertura multilingue: no disponible en la informacion proporcionada.

## Casos de uso

- Razonamiento matematico asistido: el modelo es adecuado para resolver problemas de competicion y verificar demostraciones, dado el 82,6 declarado en la combinacion AIME 2025 + HMMT Feb 2026. Se usaria con muestreo multiple y agregacion de respuestas.
- Generacion de codigo en pipelines de evaluacion: con 78,9 en LiveCodeBench v6, encaja en tareas de sintesis de funciones y reparacion de codigo sobre repositorios, sirviendose de la integracion nativa con vLLM para servir peticiones concurrentes.
- Respuestas cientificas de dominio experto: el 83,6 en GPQA-Diamond lo hace util para asistentes de investigacion que responden preguntas de fisica, quimica y biologia a nivel de posgrado, siempre con verificacion humana.
- Despliegue con restricciones de memoria: al ocupar 22,2 GB en W4A8, permite servir un MoE de 35,9 mil millones de parametros en GPUs donde la version BF16 no cabria, reduciendo coste por token.
- Evaluacion de tecnicas de cuantizacion: el checkpoint reproduce exactamente los archivos evaluados en el paper de QDA, por lo que sirve como referencia reproducible para comparar metodos de cuantizacion sobre el mismo modelo base.
- Sustitucion de un modelo base en produccion: al cargarse con `vllm serve qda-lab/QDA-Qwen3.6-35B-A3B-W4A8`, puede reemplazar al modelo BF16 en servicios existentes basados en vLLM sin cambios de codigo, a cambio de validar la calidad en el dominio propio.
- Decodificacion especulativa: la cabeza MTP incluida permite acelerar la generacion en vLLM cuando se activa la decodificacion especulativa, util en cargas interactivas de baja latencia.

## Benchmarks y rendimiento

Resultados declarados en la model card del checkpoint cuantizado:

| Benchmark | Puntuacion (%) |
|---|---|
| Math (AIME 2025 + HMMT Feb 2026) | 82,6 |
| GPQA-Diamond | 83,6 |
| LiveCodeBench v6 | 78,9 |
| IFBench | 65,4 |
| Media | 77,6 |

No se han publicado en la informacion disponible los resultados del modelo base sin cuantizar ni de alternativas comparables, por lo que no es posible calcular la perdida de precision atribuible a la cuantizacion W4A8.

## Requisitos de hardware

- VRAM estimada para inferencia: el repositorio pesa 22,2 GB en W4A8; a esa cifra hay que sumar el espacio de cache KV, que depende de la longitud de contexto y del numero de peticiones concurrentes (no disponible).
- GPU recomendadas: la evaluacion oficial se hizo en NVIDIA GH200. Por capacidad de memoria, encajan GPUs de 48 GB o mas (A6000, L40S, A100 80 GB, H100, H200).
- GPU de consumo: cabe en tarjetas de 24 GB (RTX 3090, RTX 4090) solo si se limita agresivamente el contexto y el numero de secuencias concurrentes; en 32 GB (RTX 5090) el margen es mayor.
- Opciones de despliegue: vLLM es el unico runtime indicado por el autor (`vllm serve qda-lab/QDA-Qwen3.6-35B-A3B-W4A8`). El formato compressed-tensors W4A8 no es compatible directamente con llama.cpp u Ollama.
- Latencia y throughput: no disponibles en la informacion proporcionada. La evaluacion uso batching estatico en GH200, pero no se publican cifras de tokens por segundo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| QDA-Qwen3.6-35B-A3B-W4A8 | 35,9 B (MoE) | no disponible | W4A8, 22,2 GB | no disponible | Hugging Face, vLLM |
| Qwen/Qwen3.6-35B-A3B | 35,9 B (MoE) | no disponible | BF16 | no disponible | Hugging Face |
| Qwen/Qwen3.6-35B-A3B-FP8 | 35,9 B (MoE) | no disponible | FP8 | no disponible | Hugging Face |

Los tres comparten modelo base y, por tanto, arquitectura y numero de parametros; la diferencia principal es el esquema de cuantizacion y el espacio en disco que ocupan. No se dispone de datos de rendimiento del modelo base ni de la variante FP8 en la informacion proporcionada, por lo que no se puede establecer una comparacion cuantitativa de calidad.

## Limitaciones y advertencias

- La licencia no figura en la informacion disponible; antes de un uso comercial hay que consultar la licencia del modelo base Qwen/Qwen3.6-35B-A3B en su repositorio de Hugging Face.
- Los benchmarks publicados son unicamente los cuatro de la model card; no hay datos de MMLU, HumanEval ni GSM8K, ni comparacion con el modelo sin cuantizar, de modo que la degradacion por cuantizacion no esta cuantificada.
- La evaluacion se realizo con una configuracion de muestreo concreta (temperatura 1.0, top_p 0.95, top_k 20, presence_penalty 1.5); los resultados pueden variar con otros ajustes.
- El checkpoint tiene 0 descargas y 0 likes en el momento de la consulta, y fue creado el 2026-11-08: es un artefacto muy reciente y sin validacion independiente por parte de la comunidad.
- El metodo QDA procede de un envio a MLSys 2027, es decir, de un trabajo no publicado ni revisado por pares en el momento de redactar esta ficha.
- La cabeza MTP se ajusto despues de la evaluacion y no se uso en ella; su calidad en decodificacion especulativa no esta validada.
- No hay informacion sobre sesgos, riesgo de alucinacion, cobertura idiomatica ni longitud de contexto, por lo que la validacion en produccion debe hacerse con evaluaciones propias en el dominio objetivo.
- El formato W4A8 con compressed-tensors limita el despliegue a vLLM y descarta runtimes como llama.cpp u Ollama.

## Enlaces

- Checkpoint cuantizado: https://huggingface.co/qda-lab/QDA-Qwen3.6-35B-A3B-W4A8
- Modelo base: https://huggingface.co/Qwen/Qwen3.6-35B-A3B
- Variante FP8 del modelo base: https://huggingface.co/Qwen/Qwen3.6-35B-A3B-FP8
