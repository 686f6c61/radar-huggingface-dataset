# Felladrin/gguf-Q4_K_M-Comet-60B-A12B

## Resumen

Comet 60B A12B es un modelo de lenguaje de tipo Mixture of Experts (MoE) desarrollado por Multiverse Computing, obtenido mediante la tecnica de compresion CompactifAI a partir de NVIDIA Nemotron 3.5 Super. La version aqui descrita es una cuantizacion GGUF Q4_K_M publicada por el usuario Felladrin, que incluye la cabeza MTP (Multi-Token Prediction) del modelo original para permitir decodificacion especulativa en llama.cpp.

El modelo combina una arquitectura hibrida con 88 bloques: 40 bloques Mamba-2, 40 bloques MoE latentes y 8 bloques de atencion. Dispone de 256 expertos con 22 activos por token, lo que resulta en aproximadamente 12.000 millones de parametros activos sobre un total de 60.284 millones. Esta relacion entre parametros totales y activos lo hace especialmente atractivo para despliegue en hardware de gama alta de consumo, ya que el coste computacional por token se aproxima al de un modelo denso de 12B.

La relevancia actual del modelo radica en dos factores: por un lado, CompactifAI de Multiverse Computing permite reducir el tamano del modelo base manteniendo capacidades, y por otro, la cuantizacion Q4_K_M con soporte de decodificacion especulativa via MTP lo hace ejecutable en llama.cpp sobre hardware relativamente asequible, como el AMD Ryzen AI MAX+ 395 con GPU integrada Radeon 8060S, donde alcanza 24,59 tok/s en generacion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Hibrida: 40 bloques Mamba-2, 40 bloques MoE latentes, 8 bloques de atencion (88 bloques totales) |
| Parametros totales | 60.284.372.224 (60,28B) |
| Parametros activos | Aproximadamente 12B (22 de 256 expertos activos por token) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q4_K_M (esta version); existen BF16 y Q8_0 en repositorios separados |
| Idiomas soportados | Ingles (en) |
| Licencia | OpenMDW License Agreement, version 1.1 |
| Formato de pesos | GGUF (tambien disponible BF16 en safetensors/GGUF en el modelo base) |

## Arquitectura y entrenamiento

La arquitectura es hibrida y combina tres tipos de bloques en una pila de 88 capas: 40 bloques basados en Mamba-2 (modelo de espacio de estados), 40 bloques de Mixture of Experts latentes y 8 bloques de atencion clasica. El componente MoE cuenta con 256 expertos, de los cuales 22 se activan por token, lo que proporciona una capacidad efectiva de 60B con un coste de computo por token cercano al de un modelo denso de 12B. La inclusion de Mamba-2 reduce el coste de atencion en secuencias largas, mientras que los bloques de atencion puros preservan la capacidad de recuperacion precisa de contexto.

El modelo deriva de NVIDIA Nemotron 3.5 Super mediante la tecnica CompactifAI de Multiverse Computing, que comprime el modelo original reduciendo su huella sin reentrenar desde cero. No se dispone de informacion detallada sobre el numero de tokens de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de RLHF o DPO en la informacion proporcionada. La version cuantizada se genero con `llama-quantize` (llama.cpp build b12223) a partir del GGUF BF16, sin uso de imatrix, y conserva la cabeza MTP para decodificacion especulativa. Solo se convirtio el componente de texto; la torre de vision no fue incluida.

## Capacidades

- Generacion de texto conversacional y continuacion de texto en ingles.
- Razonamiento multi-paso y respuesta a instrucciones (modelo de tipo conversacional).
- Decodificacion especulativa nativa mediante la cabeza MTP incluida, que acelera la generacion al proponer tokens candidatos que el modelo verifica.
- Capacidad de ejecucion en llama.cpp con soporte de plantilla Jinja (`--jinja`).
- Soporte de tool calling y function calling: no confirmado en la informacion disponible.
- Capacidades de agente y razonamiento multi-paso: no confirmadas explicitamente en la informacion disponible.
- Capacidades multilingues: limitadas al ingles segun los metadatos del modelo.
- Vision: no disponible en esta cuantizacion (la torre de vision no fue convertida).
- Audio: no disponible.

## Casos de uso

- Asistencia de programacion en local: el modelo puede generar codigo y mantener conversaciones tecnicas en un servidor llama.cpp local. La prueba de rendimiento del autor uso una peticion corta de programacion de 417 tokens generados, lo que confirma su viabilidad para este escenario en hardware de consumo.
- Despliegue en estaciones de trabajo con GPU integrada: gracias a sus aproximadamente 12B parametros activos y a la cuantizacion Q4_K_M (42,6 GB), puede ejecutarse en equipos como el AMD Ryzen AI MAX+ 395 con Radeon 8060S, sin necesidad de GPU dedicada de datacenter.
- Generacion de texto a gran velocidad en entornos con memoria unificada: los 466,70 tok/s en prefill (pp512) y 24,59 tok/s en generacion (tg128) medidos con llama-bench lo hacen adecuado para tareas de procesamiento por lotes moderado en hardware compacto.
- Prototipado de agentes conversacionales en ingles: su naturaleza conversacional y su ventana de contexto (no especificada) permiten construir asistentes multi-turno, siempre que se valide el soporte de tool calling en pruebas propias.
- Inferencia con decodificacion especulativa: el uso de `--spec-type draft-mtp` permite alcanzar 36,5 tok/s en generacion con un 87,5% de tokens borrador aceptados, util para aplicaciones interactivas donde la latencia importa.
- Investigacion sobre compresion de modelos: al ser una version cuantizada de un modelo comprimido con CompactifAI, sirve como caso de estudio para evaluar la degradacion de calidad frente al BF16 original en tareas de generacion.
- Experimentacion con arquitecturas hibridas Mamba-2 + MoE: util para investigadores que quieran medir el comportamiento de modelos hibridos en llama.cpp sin necesidad de infraestructura de gran escala.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K u otros) en la informacion disponible. Los unicos datos de rendimiento proporcionados son mediciones de velocidad realizadas por el autor de la cuantizacion:

| Metrica | Valor | Entorno |
|---|---|---|
| Prefill (pp512) | 466,70 tok/s | llama-bench, `-fa 1`, llama.cpp b12223 (Vulkan) |
| Generacion (tg128) | 24,59 tok/s | llama-bench, `-fa 1`, llama.cpp b12223 (Vulkan) |
| Generacion con MTP (417 tokens) | 36,5 tok/s (run 1) / 35,9 tok/s (run 2) | llama-server, `--spec-type draft-mtp`, greedy |
| Tasa de aceptacion de borradores MTP | 87,5% | llama-server, `--spec-type draft-mtp` |
| Hardware de prueba | AMD Ryzen AI MAX+ 395 con Radeon 8060S | Medicion del 2026-11-09 |

## Requisitos de hardware

- VRAM/RAM estimada para inferencia: el archivo GGUF Q4_K_M ocupa 42.620.073.472 bytes (aproximadamente 42,6 GB). Se necesita al menos esa cantidad de memoria unificada o VRAM, mas overhead para el contexto y el estado del modelo.
- GPU recomendadas: no se especifican en la informacion disponible. El autor verifico su funcionamiento en una GPU integrada Radeon 8060S (AMD Ryzen AI MAX+ 395) con memoria unificada.
- Cabe en GPU de consumo: si, siempre que se disponga de al menos 48 GB de memoria (unificada o VRAM). No cabe en GPUs consumer con 24 GB o menos en esta cuantizacion Q4_K_M; para esas seria necesario recurrir a cuantizaciones mas agresivas no publicadas en la informacion disponible.
- Opciones de despliegue: llama.cpp (llama-server, llama-bench), con soporte de Vulkan. Se desconoce el soporte en vLLM, TGI u Ollama en la informacion proporcionada.
- Latencia y throughput: 466,70 tok/s en prefill y 24,59 tok/s en generacion sin MTP; 36,5 tok/s con decodificacion especulativa MTP en el hardware de prueba del autor.

## Comparativa con modelos similares

| Modelo | Parametros totales | Parametros activos | Contexto | Licencia | Formato |
|---|---|---|---|---|---|
| Comet 60B A12B (Q4_K_M, esta ficha) | 60,28B | ~12B | no disponible | OpenMDW 1.1 | GGUF |
| Comet 60B A12B (BF16) | 60,28B | ~12B | no disponible | OpenMDW 1.1 | BF16 GGUF / safetensors |
| NVIDIA Nemotron 3.5 Super (modelo base de origen) | no disponible | no disponible | no disponible | OpenMDW 1.1 | no disponible |

No se dispone de informacion sobre otros modelos comparables de la misma categoria (MoE hibridos Mamba-2 + atencion) en la informacion proporcionada. La comparativa con Nemotron 3.5 Super es estructural: Comet es una version comprimida del mismo, por lo que se espera una huella menor a costa de posible degradacion de calidad, no cuantificada en los datos disponibles.

## Limitaciones y advertencias

- Modelo unicamente en ingles: no se declaran capacidades multilingues, por lo que su uso en castellano no esta garantizado ni validado.
- Sin torre de vision: esta cuantizacion es solo de texto; no puede procesar imagenes.
- Riesgo de alucinacion: inherente a los modelos de lenguaje; no se han publicado evaluaciones de fidelidad en la informacion disponible.
- Sesgos conocidos: no documentados en la informacion proporcionada; al derivar de Nemotron 3.5 Super, hereda los sesgos del modelo original, no cuantificados aqui.
- Licencia OpenMDW 1.1: es necesario revisar los terminos completos del acuerdo (incluido en el repositorio como `LICENSE`) antes de uso comercial; no se detallan restricciones especificas en la informacion disponible.
- Cuantizacion sin imatrix: la Q4_K_M se genero sin matriz de importancia, lo que puede implicar una perdida de calidad algo mayor que una cuantizacion con imatrix en tareas sensibles.
- Longitud de contexto no especificada: no se puede planificar su uso en tareas de contexto largo sin verificar el valor real en el modelo.
- Soporte de tool calling y agentes no confirmado: conviene validarlo empiricamente antes de disenar pipelines que dependan de ello.
- Rendimiento medido en un unico hardware (Ryzen AI MAX+ 395): los valores de throughput no son extrapolables a otras plataformas.

## Enlaces

- Repositorio Hugging Face de esta cuantizacion: https://huggingface.co/Felladrin/gguf-Q4_K_M-Comet-60B-A12B
- Modelo base BF16: https://huggingface.co/MultiverseComputingCAI/Comet_60B_A12B_BF16
- Version BF16 GGUF del mismo autor: https://huggingface.co/Felladrin/gguf-BF16-Comet-60B-A12B
- Version Q8_0 del mismo autor: https://huggingface.co/Felladrin/gguf-Q8_0-Comet-60B-A12B
- Multiverse Computing: https://www.multiversecomputing.com
- NVIDIA en Hugging Face: https://huggingface.co/nvidia
- llama.cpp (release b12223): https://github.com/ggml-org/llama.cpp/releases/tag/b12223
- Licencia OpenMDW 1.1: https://openmdw.ai/license/1-1/
