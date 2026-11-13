# chimpanzeetaxidriver/ThinkingCap-NVIDIA-Nemotron-3.5-Lightning-30B-A3B-oQ4e-fp16-mtp

## Resumen

ThinkingCap-NVIDIA-Nemotron-3.5-Lightning-30B-A3B-oQ4e-fp16-mtp es una cuantizacion mixta de precision del modelo NVIDIA Nemotron-3.5-Lightning, un modelo de lenguaje con arquitectura híbrida `nemotron_h` (probablemente combinacion de capas transformer y mecanismos de estado, segun el identificador de arquitectura) y diseno MoE segun su nomenclatura "30B-A3B" (30 mil millones de parametros totales, 3 mil millones activos por token). El checkpoint ha sido producido por el usuario `chimpanzeetaxidriver` mediante la herramienta oQ (oMLX v0.8.0rc1), que aplica cuantizacion de precision mixta por tensor. El resultado es un checkpoint de 32.913 millones de parametros logicos almacenados en 18.316 GiB, con una media efectiva de 4.780 bits por peso.

El modelo incorpora una cabeza MTP (Multi-Token Prediction) de 1.335 millones de parametros, lo que anade capacidad de decodificacion especulativa o prediccion multi-token para acelerar la inferencia. La mayor parte de los pesos (93,13 %) se almacenan en 4 bits afines con grupo de 64, mientras que un 6,8 % se conserva en 8 bits, presumiblemente en capas sensibles a la cuantizacion. Solo una fraccion minima (0,072 %) permanece en FP16.

La relevancia de esta ficha radica en que se trata de un artefacto de cuantizacion para el ecosistema MLX (Apple Silicon), no de un modelo original: no hay model card descriptiva, ni licencia declarada, ni idiomas especificados, ni resultados de benchmarks. Cualquier evaluacion de capacidades debe remitirse al modelo base Nemotron-3.5-Lightning, cuyos datos no se incluyen en la informacion disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | `nemotron_h` (hibrida, segun tag de Hugging Face); MoE segun nomenclatura 30B-A3B |
| Parametros totales | 32.913.266.240 (32,913 mil millones) |
| Parametros activos | 3 mil millones (deducido de la nomenclatura "A3B"; no confirmado en la model card) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Mixta oQ: affine 4-bit grupo 64 (93,13 %), affine 8-bit grupo 64 (6,80 %), FP16 (0,072 %) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (MLX), 18.316 GiB en repo de 19,7 GB |

## Arquitectura y entrenamiento

El checkpoint es una cuantizacion del modelo base NVIDIA Nemotron-3.5-Lightning. El identificador de arquitectura `nemotron_h` sugiere una topologia hibrida propia de la familia Nemotron, aunque la model card no detalla la composicion exacta de capas. La nomenclatura "30B-A3B" indica un modelo de mezcla de expertos con aproximadamente 30 mil millones de parametros totales y 3 mil millones activos por token, lo que reduce el coste computacional de inferencia frente a un modelo denso del mismo tamano.

El proceso de cuantizacion, realizado con oQ (oMLX v0.8.0rc1), asigna precision de forma diferenciada: 30.652 millones de pesos en 4 bits afines con grupo de 64 (4,50 bits efectivos), 2.238 millones en 8 bits (8,50 bits efectivos) y 24 millones en FP16. Ademas, se preserva una cabeza MTP de 1.335 millones de parametros en 0,740 GiB, destinada a prediccion multi-token. No se dispone de informacion sobre el dataset de entrenamiento, el numero de tokens, ni sobre si el modelo base recibio RLHF o DPO.

## Capacidades

- Generacion de texto y razonamiento: capacidades heredadas del modelo base Nemotron-3.5-Lightning; no verificadas en este checkpoint.
- Codigo y matematicas: presumibles por la familia Nemotron, sin datos de benchmark disponibles.
- Prediccion multi-token (MTP): la cabeza MTP de 1.335 millones de parametros permite decodificacion especulativa o generacion multi-token, orientada a reducir latencia.
- Tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible (idiomas no declarados).
- Modo thinking: el nombre "ThinkingCap" sugiere soporte de razonamiento extendido, pero no se confirma en la model card.
- Vision o audio: no disponible.

## Casos de uso

- Inferencia local en Apple Silicon: el checkpoint esta empaquetado en formato MLX y ocupa 18.316 GiB, por lo que encaja en Macs con memoria unificada de 24 GB o superior (M-series Pro/Max/Ultra), permitiendo ejecutar un MoE de 30B en hardware de consumo.
- Prototipado de agentes con razonamiento multi-paso: la cabeza MTP y el caracter "ThinkingCap" lo hacen candidato para pipelines que requieran generacion encadenada con baja latencia, aunque las capacidades reales deben validarse contra el modelo base.
- Evaluacion de tecnicas de cuantizacion mixta: util para investigadores que comparen la perdida de calidad de oQ 4,78 bits frente al checkpoint original en FP16/BF16.
- Despliegue de asistentes de codigo en estaciones de trabajo: si el modelo base conserva las capacidades de codigo de la familia Nemotron, el checkpoint permitiria autocompletado y generacion en local sin GPU dedicada.
- Servicio de chat multi-turno en local: adecuado para entornos con requisitos de privacidad donde no se quiera enviar datos a la nube, siempre que se valide la longitud de contexto efectiva (no documentada).
- Benchmarking de decodificacion especulativa: la cabeza MTP permite medir ganancias de throughput frente a decodificacion autoregresiva estandar en MLX.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM/memoria unificada estimada: 18.316 GiB solo para pesos; con overhead de KV cache y activaciones, se recomienda un minimo de 24 GB de memoria unificada.
- GPU recomendadas: el formato es MLX, por lo que el hardware objetivo son chips Apple Silicon (M1/M2/M3/M4 en variantes Pro, Max y Ultra). No es directamente desplegable en GPU NVIDIA sin conversion de formato.
- Cabe en consumer GPU: en el ecosistema Apple, si; en GPUs NVIDIA consumer (RTX 4090 de 24 GB) requeriria conversion del checkpoint a un formato compatible (por ejemplo GGUF o safetensors para vLLM/llama.cpp), no incluida en este repo.
- Opciones de despliegue: MLX (libreria declarada), mlx-lm y oMLX. vLLM, llama.cpp, Ollama y TGI no soportan directamente el formato MLX sin conversion.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Activos | Contexto | Cuantizacion | Licencia | Formato |
|---|---|---|---|---|---|---|
| ThinkingCap-Nemotron-3.5-Lightning-30B-A3B-oQ4e (este) | 32,9B | ~3B | no disponible | oQ mixta 4,78 bits | no disponible | MLX safetensors |
| NVIDIA Nemotron-3.5-Lightning (base) | ~30B | ~3B | no disponible | original (BF16/FP16) | no disponible | no disponible |
| Alternativas MoE de tamano similar | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de rendimiento ni de especificaciones completas de modelos comparables en la informacion proporcionada.

## Limitaciones y advertencias

- Artefacto de cuantizacion, no modelo original: la calidad final depende del modelo base y de la perdida introducida por la cuantizacion a 4,78 bits medios; no se aportan evaluaciones de degradacion.
- Licencia no declarada: no se puede confirmar el uso comercial; debe verificarse la licencia del modelo base Nemotron-3.5-Lightning antes de cualquier despliegue en produccion.
- Idiomas no declarados: se desconoce el soporte multilingue real.
- Contexto no documentado: no hay informacion sobre la ventana de contexto, lo que impide planificar casos de uso con documentos largos.
- Dependencia exclusiva de MLX: no es portable a GPUs NVIDIA o AMD sin conversion manual, lo que limita su uso en infraestructura de servidores convencional.
- Cero descargas y cero likes: no hay evidencia de validacion por parte de la comunidad; el checkpoint no ha sido contrastado publicamente.
- Riesgo de alucinacion y sesgos: inherente al modelo base, no evaluado en este artefacto.
- Fecha de creacion futura (2026-11-13): inconsistente con la fecha actual; conviene tratar los metadatos con cautela.

## Enlaces

- Hugging Face: https://huggingface.co/chimpanzeetaxidriver/ThinkingCap-NVIDIA-Nemotron-3.5-Lightning-30B-A3B-oQ4e-fp16-mtp
- Herramienta de cuantizacion oQ (oMLX): https://github.com/jundot/omlx
