# Jeesup/svd-safety-l3_svdllmwjsep12_r50

## Resumen

svd-safety-l3_svdllmwjsep12_r50 es un checkpoint derivado de meta-llama/Meta-Llama-3-8B-Instruct comprimido mediante SVD-LLM, una tecnica de compresion basada en descomposicion en valores singulares. El autor, Jeesup, lo publica como artefacto de investigacion para estudiar como la compresion SVD degrada el comportamiento de seguridad del modelo y que regla de seleccion de componentes lo repara mejor. El checkpoint retiene el 49,97 % de los parametros densos originales (se elimina el 50,00 %) y se recupera despues con la etapa 2 de SVD-LLM basada en LoRA.

El modelo no es un asistente conversacional de proposito general: es una celda concreta de una rejilla experimental sobre reglas de seleccion y presupuestos de compresion. Su interes radica en que cuantifica el compromiso entre utilidad (perplejidad en WikiText-2, precision zero-shot en 7 tareas) y seguridad (tasas de exito de ataque en AdvBench y StrongREJECT, sobre-rechazo en WildGuard) bajo compresion agresiva. La arquitectura subyacente es la de Llama 3 8B Instruct, un transformer decoder-only denso con 8.030.261.248 parametros.

La relevancia actual es metodologica: ofrece un punto de medida reproducible para quien investigue compresion de modelos, interpretabilidad de la seguridad o evaluacion de riesgos en modelos derivados. La model card advierte explicitamente de que varias celdas de la rejilla estan deliberadamente degradadas en seguridad y de que este checkpoint debe tratarse como sujeto experimental, no como asistente desplegable.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso (Llama 3), comprimido con SVD-LLM y recuperado con LoRA de etapa 2 |
| Parametros totales | 8.030.261.248 (fraccion resultante 0,4997 respecto al modelo denso) |
| Parametros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (heredada de Llama 3 8B Instruct) |
| Tipos de cuantizacion | no disponible en la informacion proporcionada; pesos publicados en safetensors |
| Idiomas soportados | no disponible en la informacion proporcionada |
| Licencia | Meta Llama 3 Community License (llama3) |
| Formato de pesos | safetensors (libreria transformers) |

## Arquitectura y entrenamiento

El modelo parte de Meta-Llama-3-8B-Instruct, un transformer decoder-only denso. Sobre el se aplica SVD-LLM, que descompone las matrices de pesos y elimina componentes segun una regla de seleccion basada en un SVD blanqueado (implementacion de AIoT-MLSys-Lab/SVD-LLM). El presupuesto de compresion es del 50,00 % de parametros eliminados, con semilla 42. La calibracion combina un conjunto de utilidad y otro de seguridad en una unica matriz agregada: S S^T = suma sobre WikiText-2 de x x^T mas suma sobre el conjunto de seguridad de x x^T.

El conjunto de utilidad son 255 ventanas de 2048 tokens de WikiText-2 train (muestreo de SVD-LLM, semilla 42), usando todas las posiciones. El conjunto de seguridad son los primeros 12 de 512 prompts de entrenamiento de WildJailbreak (variantes vanilla y adversariales daninas) con los rechazos generados por el propio Llama-3-8B-Instruct, en orden de semilla 42, una conversacion por muestra (1575 posiciones, todas usadas). La cuota efectiva de seguridad es de 0,0030 de las posiciones. Tras la compresion se aplica la recuperacion de etapa 2 de SVD-LLM con LoRA secuencial (primero U, luego V) sobre alpaca-cleaned, con r=8, alpha=16, 2 epocas, learning rate 1e-4, batch 64, cutoff 256 y bf16.

## Capacidades

- Generacion de texto conversacional heredada de Llama 3 8B Instruct, condicionada por la degradacion propia de la compresion.
- Razonamiento y respuesta a instrucciones en el nivel que permita el checkpoint comprimido; no se documentan capacidades especificas adicionales.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponibles en la informacion proporcionada.
- Capacidades especiales (modo thinking, vision, audio): no disponibles; el modelo es exclusivamente de texto.
- El proposito principal del checkpoint es servir como sujeto de medida en estudios de seguridad bajo compresion, no como asistente.

## Casos de uso

- Investigacion sobre compresion de modelos: sirve como celda de referencia para medir la perdida de utilidad (perplejidad WikiText-2 de 80,3814) frente a un presupuesto de compresion del 50 %, comparandola con otras reglas de seleccion de la misma rejilla.
- Estudio de degradacion de seguridad: permite cuantificar el aumento de la tasa de exito de ataque (ASR de 0,4308 en AdvBench y 0,2780 en StrongREJECT con juez HarmBench) atribuible a la compresion y a la mezcla de calibracion.
- Evaluacion de sobre-rechazo: con un macro de sobre-rechazo de 0,3119 medido con WildGuard, es util para analizar el equilibrio entre rechazar peticiones daninas y rechazar peticiones legitimas en modelos comprimidos.
- Reproducibilidad de pipelines SVD-LLM: el detalle de calibracion, semilla y recuperacion LoRA permite replicar el experimento y auditar la implementacion del SVD blanqueado.
- Analisis de interpretabilidad de la seguridad: al disponer de una cuota de calibracion de seguridad explicitamente pequena (0,0030 de posiciones), permite estudiar como la seleccion de componentes afecta a las direcciones asociadas a rechazo.
- Benchmarking de metodologias de recuperacion: la etapa 2 con LoRA secuencial U/V sobre alpaca-cleaned puede compararse con otras estrategias de recuperacion para medir su eficacia en tareas zero-shot (precision media de 0,4519 en 7 tareas).

## Benchmarks y rendimiento

| Metrica | Valor |
|---|---|
| AdvBench ASR (juez HarmBench) | 0,4308 |
| StrongREJECT ASR (juez HarmBench) | 0,2780 |
| Macro de sobre-rechazo (WildGuard) | 0,3119 |
| Perplejidad en WikiText-2 | 80,3814 |
| Precision media zero-shot (7 tareas, acc_norm donde se reporta) | 0,4519 |

No se han publicado en la informacion disponible resultados comparativos frente a otros modelos de la misma categoria ni frente al modelo base sin comprimir.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita en la informacion proporcionada; con 8.030.261.248 parametros, en bf16/fp16 el peso ronda los 16 GB, por lo que se necesita al menos una GPU con 24 GB para margen de activaciones y cache KV.
- GPU recomendadas: no disponibles en la informacion proporcionada; por tamano, encajan A100 40/80 GB, H100 y, en el extremo consumer, RTX 4090 (24 GB) en bf16 con contexto moderado.
- Cabe en GPU consumer: previsiblemente en RTX 4090 (24 GB) en bf16; en GPUs de 16 GB requeriria cuantizacion, aunque no se documentan variantes cuantizadas.
- Opciones de despliegue: transformers (libreria declarada), text-generation-inference (tag endpoints_compatible); vLLM, llama.cpp y Ollama no se mencionan en la informacion disponible.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| svd-safety-l3_svdllmwjsep12_r50 | 8.030.261.248 (49,97 % del denso) | no disponible | Llama 3 Community | Checkpoint comprimido con SVD-LLM, artefacto de investigacion |
| meta-llama/Meta-Llama-3-8B-Instruct | 8B denso | no disponible en la informacion | Llama 3 Community | Modelo base sin comprimir; referencia natural de comparacion |
| Otras celdas de la rejilla SVD-LLM del mismo autor | 8B comprimido a distintos presupuestos | no disponible | Llama 3 Community | Variantes con otras reglas de seleccion y presupuestos; no disponibles en detalle |

No se dispone en la informacion proporcionada de resultados de benchmarks de los modelos comparables para contrastar rendimiento.

## Limitaciones y advertencias

- La model card advierte de que varias celdas de la rejilla estan deliberadamente degradadas en seguridad; la compresion por si sola eleva la tasa de exito de ataque.
- No es un asistente de proposito general: es un artefacto de investigacion y debe evaluarse antes de extraer conclusiones.
- El macro de sobre-rechazo de 0,3119 indica una tasa apreciable de rechazos a peticiones legitimas.
- La perplejidad en WikiText-2 de 80,3814 refleja una perdida de calidad de lenguaje respecto al modelo denso original.
- La cuota efectiva de calibracion de seguridad es muy baja (0,0030 de posiciones), lo que limita la representacion de comportamientos de rechazo en la compresion.
- Riesgo de alucinacion: no cuantificado en la informacion proporcionada; previsiblemente agravado por la compresion.
- Idiomas soportados y limitaciones de contexto: no disponibles en la informacion proporcionada.
- Uso comercial sujeto a la Meta Llama 3 Community License; los ficheros LICENSE y USE_POLICY.md del repositorio son vinculantes para este derivado.
- Sesgos conocidos: no documentados en la informacion proporcionada.

## Enlaces

- Hugging Face: https://huggingface.co/Jeesup/svd-safety-l3_svdllmwjsep12_r50
- Modelo base: https://huggingface.co/meta-llama/Meta-Llama-3-8B-Instruct
- Implementacion SVD-LLM citada por el autor: https://github.com/AIoT-MLSys-Lab/SVD-LLM
