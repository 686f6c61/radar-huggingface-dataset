# RelaxingSnorlax/NVIDIA-Nemotron-3.5-Super-VL-120B-A12B.dspark-hs5

## Resumen

Este repositorio no contiene un modelo de lenguaje funcional, sino una variante de benchmarking del draft model DSpark asociado a `NVIDIA-Nemotron-3.5-Super-VL-120B-A12B`. El autor, RelaxingSnorlax, lo deriva del checkpoint de RedHatAI para medir el coste de inferencia que introduce el numero de capas de hidden state consumidas por un modelo de decodificacion especulativa en vLLM. La variante emplea cinco capas auxiliares (`aux_hidden_state_layer_ids = [17, 37, 59, 79, 87]`).

El checkpoint pesa 2,4 GB y contiene 1.210.111.489 parametros en formato safetensors, lo que corresponde al módulo draft, no al modelo objetivo de 120B. La diferencia clave con el modelo fuente es que el tensor `fc.weight` (forma `[4096, 20480]`, es decir, `4096 x 5*4096`) se ha reinicializado con valores aleatorios, mientras que el resto de tensores se copian sin cambios. Por tanto, la tasa de aceptación es practicamente nula (~0 tokens aceptados) y el artefacto solo sirve para medir el coste del camino de hidden states.

Su relevancia es acotada: se trata de una herramienta de ablacion para ingenieros que trabajan en decodificacion especulativa dentro de vLLM y quieren cuantificar el sobrecoste de capturar y transferir N salidas de capa desde el modelo objetivo, la GEMM `N x H -> H` del combinador y el forward del draft. No debe emplearse para generacion real ni para evaluar calidad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modulo draft de decodificacion especulativa DSpark (custom_code) sobre un modelo objetivo Nemotron-3.5-Super-VL-120B-A12B |
| Parametros totales | 1.210.111.489 (solo el draft; el modelo objetivo no esta incluido) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en safetensors sin cuantizar) |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |
| Capas auxiliares de hidden state | 5 (`[17, 37, 59, 79, 87]`) |
| Tensor reinicializado | `fc.weight`, forma `[4096, 20480]` (valores aleatorios) |
| Tamano del repo | 2,4 GB |
| Metodo de decodificacion | `dspark` en vLLM, con `num_speculative_tokens` configurable |

## Arquitectura y entrenamiento

El artefacto es un draft model para decodificacion especulativa: consume hidden states de capas intermedias del modelo objetivo (en esta variante, las capas 17, 37, 59, 79 y 87), los combina mediante la proyeccion `fc` de forma `[4096, 20480]` (equivalente a `4096 x 5*4096`) y ejecuta un forward propio para proponer tokens que el modelo objetivo verifica. El resto de la arquitectura interna del draft no se detalla en la model card.

No hay información sobre datos de entrenamiento, número de tokens, composición del dataset ni fases de RLHF o DPO. El punto critico es que este checkpoint no esta entrenado para su configuración actual: `fc.weight` se ha reinicializado aleatoriamente, de modo que el combinador no aprende ninguna relación útil entre las cinco capas y la predicción. El resto de tensores proviene del checkpoint de RedHatAI, cuyo `fc` entrenado cubria exactamente los ids `[17, 37, 59, 79, 87]`. El proposito declarado es aislar el coste del camino de hidden states (captura y transferencia en el lado del objetivo, GEMM del combinador y forward del draft) frente a las baselines entrenadas. El script de generacion es `make_dspark_hs_variants.py`.

## Capacidades

- No genera texto util: la tasa de aceptación es practicamente nula (~0 tokens aceptados) por el `fc.weight` aleatorio.
- Sirve como instrumento de medida del sobrecoste de inferencia del camino de hidden states en vLLM con `method: dspark`.
- Permite comparar el coste de capturar y transferir 5 salidas de capa frente a variantes con distinto numero de capas auxiliares.
- Compatible con el servidor vLLM mediante `--speculative-config` junto al modelo objetivo.
- No soporta tool calling, agentes, visión ni capacidades multilingües de forma funcional, al no ser un modelo generativo operativo.
- No dispone de modo thinking ni de cualquier otra capacidad de razonamiento.

## Casos de uso

- Ablacion del numero de capas de hidden state: ejecutar el servidor con esta variante y con las entrenadas para medir como escala el coste de captura y transferencia al pasar de N capas auxiliares.
- Perfilado de la GEMM del combinador: medir el tiempo de la proyeccion `4096 x 5*4096` en la GPU objetivo para estimar su peso relativo en el presupuesto de latencia del draft.
- Estimacion del overhead de red en despliegues multi-GPU: cuantificar el coste de transferir cinco salidas de capa desde el nodo del modelo objetivo al del draft.
- Validacion de pipelines de decodificacion especulativa: comprobar que la integracion `dspark` en vLLM arranca y ejecuta el camino completo con un draft de referencia antes de desplegar el checkpoint entrenado.
- Benchmarking de throughput en distintas GPUs: usar el coste fijo del camino de hidden states como carga controlada para comparar hardware.
- Pruebas de regresion de infraestructura: detectar degradaciones en la captura de hidden states o en la comunicacion entre procesos tras actualizaciones de vLLM.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explicitamente que las tasas de aceptación de este checkpoint no tienen significado (~0 tokens aceptados) y que solo debe emplearse para medir coste, no calidad.

## Requisitos de hardware

- VRAM para el draft: el repo ocupa 2,4 GB en safetensors; en inferencia en bf16 se estima en torno a 2,5 GB, mas el espacio de activaciones y KV cache del draft.
- Requiere ademas cargar el modelo objetivo `NVIDIA-Nemotron-3.5-Super-VL-120B-A12B` (120B), cuyos requisitos de VRAM no estan disponibles en la informacion proporcionada.
- GPU recomendadas: no disponibles de forma especifica; al ser un draft de 1,2B parametros, cabe en GPUs consumer con suficiente memoria libre junto al objetivo, pero el objetivo de 120B condiciona el despliegue a A100, H100 o configuraciones multi-GPU.
- Despliegue: vLLM con `--speculative-config '{"model":"<usuario>/NVIDIA-Nemotron-3.5-Super-VL-120B-A12B.dspark-hs5","num_speculative_tokens":7,"method":"dspark"}'`.
- Latencia y throughput: no disponibles; el proposito del checkpoint es precisamente medirlos en el entorno del usuario.

## Comparativa con modelos similares

| Modelo | Parametros | Capas auxiliares | `fc.weight` | Proposito | Licencia |
|---|---|---|---|---|---|
| Este checkpoint (dspark-hs5) | 1,21B | 5 | Aleatorio | Ablacion de coste | apache-2.0 |
| RedHatAI/NVIDIA-Nemotron-3.5-Super-VL-120B-A12B.dspark | no disponible | 5 (entrenado) | Entrenado | Draft funcional | no disponible |
| Otras variantes `dspark-hsN` del mismo autor | no disponible | N variable | Segun variante | Ablacion de coste | apache-2.0 |

No se dispone de datos de rendimiento para establecer comparaciones cuantitativas con alternativas.

## Limitaciones y advertencias

- Los pesos de `fc.weight` son aleatorios: el modelo no produce predicciones utiles y su tasa de aceptación es practicamente nula.
- No debe usarse en produccion ni para generacion de texto, codigo o cualquier tarea downstream.
- No es un modelo autonomo: requiere el modelo objetivo de 120B y una version de vLLM compatible con `method: dspark`.
- Depende de `custom_code`, lo que implica riesgos de seguridad y compatibilidad al cargar pesos de un autor no verificado.
- La model card no documenta sesgos, alucinaciones ni limitaciones de idioma porque el artefacto no es generativo.
- La licencia apache-2.0 permite uso comercial del codigo y pesos, pero el uso comercial de este checkpoint carece de sentido practico por su naturaleza de benchmark.
- El repo tiene 0 descargas y 0 likes, sin validacion externa de la comunidad.

## Enlaces

- Hugging Face: https://huggingface.co/RelaxingSnorlax/NVIDIA-Nemotron-3.5-Super-VL-120B-A12B.dspark-hs5
- Checkpoint fuente: https://huggingface.co/RedHatAI/NVIDIA-Nemotron-3.5-Super-VL-120B-A12B.dspark
