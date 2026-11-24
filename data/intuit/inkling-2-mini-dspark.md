# intuit/Inkling-2-Mini-dspark

## Resumen

Inkling-2-Mini-dspark es un modelo borrador (*draft model*) para decodificación especulativa del modelo objetivo `thinkingmachines/Inkling-2-Mini`, publicado por Intuit bajo licencia Apache 2.0. No es un modelo conversacional autonomo: su unica funcion es proponer tokens candidatos que el modelo objetivo verifica en un unico paso de forward, acelerando la generacion sin alterar la distribucion de salida (decodificacion especulativa lossless). El checkpoint ocupa aproximadamente 606 MB en bf16 y contiene exclusivamente un `config.json` y un `mtp.safetensors`.

El modelo objetivo es un MoE con bucles (*looped MoE*) de 24 capas ejecutadas como 48 visitas de capa, cuantizado en NVFP4 y MXFP8. El borrador DSpark consta de 3 capas con dimension oculta 2304, 24 cabezas de atencion y 8 cabezas KV, ventana deslizante de 1024 tokens y un vocabulario de 201.024 entradas (200.058 tokens reales). Utiliza un tamano de bloque de 8 (token ancla mas 7 tokens borrador) y toma estados ocultos de las visitas de capa 5, 23, 41 y 48 del objetivo.

Su relevancia es practica: en la configuracion publicada alcanza una aceleracion media de 2,98x sobre la linea base sin especulacion, frente al 2,67x del borrador DSpark incluido originalmente con Inkling-2-Mini. Esto lo convierte en una pieza de infraestructura para reducir coste y latencia en despliegues de produccion del modelo objetivo, especialmente en cargas de razonamiento y codigo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DSpark draft model (3 capas, hidden 2304, 24 cabezas / 8 KV, ventana deslizante 1024) sobre objetivo looped MoE |
| Parametros totales | no disponible (checkpoint de ~606 MB en bf16) |
| Parametros activos | no aplica (modelo borrador; el objetivo es MoE) |
| Longitud de contexto | ventana deslizante de 1024 en el borrador; contexto de servicio del objetivo configurado a 16.384 en los ejemplos |
| Tipos de cuantizacion | bf16 en el borrador; el objetivo se distribuye en NVFP4 + MXFP8 |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (`mtp.safetensors`) + `config.json` |

## Arquitectura y entrenamiento

El borrador sigue el paradigma DSpark de decodificacion especulativa con bloques: propone un ancla mas 7 tokens candidatos (tamano de bloque 8) que el modelo objetivo valida en un solo forward. Para ello consume estados ocultos intermedios del objetivo en las visitas de capa 5, 23, 41 y 48, lo que le permite condicionar las propuestas sobre representaciones internas ricas del modelo grande sin necesidad de replicar su profundidad. Con solo 3 capas y una ventana de atencion deslizante de 1024 tokens, el coste computacional del borrador es marginal frente al del objetivo.

El entrenamiento se realizo desde cero durante 3 epocas con la libreria `speculators` 0.8.0, empleando extraccion de estados ocultos en linea desde el objetivo en ejecucion. Los datos combinan `mlabonne/open-perfectblend` con datasets financieros (una mezcla de instrucciones de finanzas y datos financieros de Nemotron). Todas las respuestas fueron regeneradas por Inkling-2-Mini con el modo *thinking* activado, de modo que el borrador aprende a predecir la distribucion de salida real del objetivo y no la de un corpus estatico.

## Capacidades

- Generacion especulativa de tokens para decodificacion lossless: no modifica la distribucion del modelo objetivo, solo acelera su muestreo.
- Propuesta de bloques de 8 tokens (1 ancla + 7 borrador) por paso de forward del objetivo.
- Aprovechamiento de estados ocultos multi-capa del objetivo (visitas 5, 23, 41 y 48) para mejorar la tasa de aceptacion.
- Especializacion en dominios de razonamiento, matematicas, codigo y finanzas, derivada de la mezcla de entrenamiento.
- Integracion nativa con vLLM mediante el metodo `dspark` en `speculative_config`.
- No soporta tool calling, agentes ni vision por si mismo: hereda unicamente las capacidades del modelo objetivo al que acelera.
- No es un modelo autonomo: no puede desplegarse sin `thinkingmachines/Inkling-2-Mini`.

## Casos de uso

- Servicio de chat interactivo de baja latencia: con 361,8 tok/s en MT-Bench frente a 157,6 de linea base, reduce a menos de la mitad el tiempo percibido por token en asistentes conversacionales que usan Inkling-2-Mini como motor.
- Razonamiento matematico en produccion: en MATH-500 alcanza 498,8 tok/s (3,07x) con longitud de aceptacion 4,68, adecuado para pipelines que resuelven problemas paso a paso con cadenas de pensamiento largas.
- Generacion de codigo en asistentes IDE: en HumanEval logra 495,3 tok/s (3,05x) y en MBPP 474,3 tok/s (3,11x), lo que hace viable la completacion en tiempo real sobre el modelo objetivo.
- Analisis financiero automatizado: los benchmarks FinQA (484,0 tok/s, 3,20x), TAT-QA (460,2 tok/s, 3,10x) y FinanceReasoning (467,8 tok/s, 3,10x) reflejan el sesgo del entrenamiento hacia finanzas, relevante para extraccion de datos de estados financieros y respuesta sobre tablas.
- Evaluacion por lotes de gran volumen: al triplicar el throughput por GPU H200 con concurrencia 1, reduce el coste por token en tareas offline de sintesis de datos o anotacion.
- Reduccion de flota en inferencia self-hosted: permite mantener los mismos SLA con menos GPUs o servir mas usuarios por nodo, dado que el borrador anade solo 606 MB de memoria.
- Prototipado de decodificacion especulativa: sirve como referencia de integracion del metodo `dspark` en vLLM para equipos que quieran entrenar sus propios borradores con `speculators`.

## Benchmarks y rendimiento

Configuracion: 1x H200, tensor-parallel 1, 7 tokens borrador, decodificacion greedy, 2048 tokens de salida, concurrencia 1, plantilla de chat con thinking activado.

| Benchmark | Baseline tok/s | DSpark tok/s | Speedup | Accept length |
|---|---|---|---|---|
| MT-Bench | 157,6 | 361,8 | 2,30x | 3,55 |
| GSM8K | 160,0 | 471,4 | 2,95x | 4,24 |
| HumanEval | 162,4 | 495,3 | 3,05x | 4,42 |
| MATH-500 | 162,2 | 498,8 | 3,07x | 4,68 |
| MBPP | 152,4 | 474,3 | 3,11x | 4,21 |
| TAT-QA | 148,6 | 460,2 | 3,10x | 4,68 |
| FinanceReasoning | 150,7 | 467,8 | 3,10x | 4,57 |
| FinQA | 151,3 | 484,0 | 3,20x | 4,48 |
| **Media** | | | **2,98x** | **4,36** |

La longitud de aceptacion se define como tokens producidos por cada forward del objetivo, incluido el token de bonificacion. Como referencia, el borrador DSpark incluido con Inkling-2-Mini alcanza 2,67x de media (longitud de aceptacion 3,81) en la misma configuracion.

## Requisitos de hardware

- VRAM adicional del borrador: aproximadamente 606 MB en bf16, sumados a la memoria del modelo objetivo.
- GPU validadas: NVIDIA H200 y H100 (Hopper). La build de vLLM usada en las pruebas es `vllm-0.34.0rc1.dev1129+gc32251b5d` con el workaround de kernel tile-8 (PR #69104), porque la imagen de proveedor incluye kernels solo para Blackwell.
- No se han publicado pruebas en GPU de consumo (RTX 4090, etc.); el requisito de vLLM con soporte Inkling-2 y kernels especificos hace inviable un despliegue directo en `llama.cpp`, Ollama o TGI.
- Motor de despliegue soportado: vLLM con ruta nativa Inkling-2 DSpark, tanto en modo servidor (`vllm serve`) como offline (`vllm.LLM`).
- Contexto de servicio recomendado en los ejemplos: `--max-model-len 16384`, tensor-parallel 1.
- Throughput medido: entre 361,8 y 498,8 tok/s segun benchmark en una sola H200 con concurrencia 1; no se han publicado datos de latencia p99 ni de throughput con concurrencia mayor.

## Comparativa con modelos similares

| Modelo | Tipo | Tamano | Contexto | Rendimiento | Licencia |
|---|---|---|---|---|---|
| intuit/Inkling-2-Mini-dspark | Borrador DSpark para Inkling-2-Mini | ~606 MB bf16 | ventana 1024 | 2,98x media (accept 4,36) | Apache 2.0 |
| DSpark incluido con Inkling-2-Mini | Borrador DSpark de referencia | no disponible | no disponible | 2,67x media (accept 3,81) | la del modelo base |
| Borradores EAGLE / Medusa genericos | Borradores especulativos | no disponible | no disponible | no disponible | variable |

La comparacion directa solo es posible con el borrador DSpark empaquetado con el modelo objetivo, que este checkpoint supera en 0,31x de aceleracion media y 0,55 tokens de longitud de aceptacion en la misma configuracion. No se dispone de datos publicados para comparar con borradores de otras familias sobre este mismo objetivo.

## Limitaciones y advertencias

- Dependencia estricta del objetivo: solo funciona con `thinkingmachines/Inkling-2-Mini`; no es reutilizable con otros modelos.
- Requiere una build de vLLM con soporte Inkling-2 y el workaround de kernel tile-8 en Hopper; la imagen de proveedor no es suficiente.
- Las cifras de rendimiento se midieron con concurrencia 1 y decodificacion greedy; el speedup real con muestreo, alta concurrencia o prompts muy largos puede diferir.
- El entrenamiento esta sesgado hacia dominios de razonamiento, codigo y finanzas; la tasa de aceptacion en otros dominios (conversacion general, idiomas distintos del ingles) no se ha publicado.
- No se han publicado evaluaciones de sesgo, toxicidad ni alucinacion para este borrador; al ser lossless respecto al objetivo, hereda los sesgos y riesgos del modelo base.
- Idiomas soportados no documentados; el vocabulario es el del objetivo (200.058 tokens reales).
- La licencia Apache 2.0 del borrador no exime de verificar las condiciones del modelo base y de los datasets de entrenamiento (`mlabonne/open-perfectblend` y datos financieros de Nemotron) para uso comercial.
- Repositorio con 0 descargas y creado en noviembre de 2026: ecosistema de validacion muy limitado fuera del entorno del autor.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/intuit/Inkling-2-Mini-dspark
- Modelo objetivo: https://huggingface.co/thinkingmachines/Inkling-2-Mini
- Dataset de entrenamiento: https://huggingface.co/datasets/mlabonne/open-perfectblend
- Libreria de entrenamiento `speculators` (version 0.8.0): no disponible
- vLLM PR #69104 (workaround kernel tile-8): no disponible
- Web del autor: https://www.intuit.com/
