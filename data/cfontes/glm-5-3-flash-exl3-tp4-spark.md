# cfontes/GLM-5.3-Flash-EXL3-TP4-Spark

## Resumen

El repositorio `cfontes/GLM-5.3-Flash-EXL3-TP4-Spark` no contiene un modelo base nuevo, sino una **pila de serving optimizada** para el modelo `zai-org/GLM-5.3-Flash`. El proyecto, desarrollado por `cfontes`, documenta cómo ejecutar este modelo con cuantización **EXL3** de 2 bits en los expertos enrutados (routed experts) y **decodificación especulativa DFlash2** sobre un clúster de **4 nodos NVIDIA DGX Spark (GB10)** con **vLLM en modo TP4**. El objetivo es maximizar el rendimiento de inferencia en este hardware concreto, comparando resultados con una lane alternativa basada en NVFP4.

El resultado campeón es de **31.7 tokens/s en modo single-stream (c=1)** y **57.7 tokens/s a concurrencia 4 (c=4)**, con una longitud de aceptación (accept length) de 1.78 y 1.66 respectivamente, a temperatura 0. La configuración incluye un drafter DFlash2 (versión v3) reentrenado por el autor sobre 427,444 archivos de captura de estados ocultos (160 GB) obtenidos de la propia pila cuantizada, lo que evita el desajuste entre captura y objetivo. El contexto configurado es de 262,144 tokens.

Aunque el nombre sugiere un modelo, la documentación se centra en hallazgos de ingeniería de despliegue: el impacto de activar CUDA graphs (+11% de throughput), la elección de 2bpw frente a 4bpw en expertos enrutados, y la diferencia de rendimiento frente a la variante NVFP4. La licencia y los idiomas soportados no están especificados en la información disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con expertos enrutados (MoE), inferido a partir de la cuantizacion "routed-experts-only" |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | 262,144 |
| Tipos de cuantizacion | EXL3 2bpw en expertos enrutados, cabecera de 16 bits, codebook mcg, exl3 v0.0.43; tambien se probo 4bpw eager; KV cache en fp8 |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | no disponible (se sirve mediante vLLM fork con kernels vllm-exl3) |

## Arquitectura y entrenamiento

La arquitectura subyacente es el modelo `zai-org/GLM-5.3-Flash`, un modelo de lenguaje de gran tamaño con mezcla de expertos (MoE), como indica la cuantización selectiva de "routed experts". El repositorio no detalla la arquitectura interna ni el preentrenamiento del modelo base, sino la configuración de serving: se aplica **EXL3 2bpw** únicamente a los expertos enrutados, manteniendo la cabecera a 16 bits. La ejecución se realiza con un fork específico de vLLM (`ZJY0516`) y los kernels nativos `vcruz305 vllm-exl3`, usando TP4 sobre 4 nodos.

El componente entrenado por el autor es el **drafter DFlash2 v3**, una retrain del checkpoint `incoai/GLM-5.3-Flash-DFlash2`. El entrenamiento se realizó sobre 427,444 archivos de captura de estados ocultos (160 GB) extraídos de la propia pila EXL3-TR3-4bpw TP4 mediante el hook `DFLASH_SAVE_HIDDEN`. La función de pérdida combina cinco componentes: `1.0·L_block_CE + 0.5·L_KL + 2.0·L_sel + 0.5·L_anchor + 0.1·L_hid`, con pesos posicionales `0.85^k` y el decodificador congelado en la etapa A. Los resultados muestran que una retrain de 4 épocas eleva la longitud de aceptación de 1.71 a 1.83 (+7%), pero una ejecución de 32 épocas (val loss 4.21) solo añade +0.02, lo que indica saturación del teacher-forcing. La variante v4, con ruido gaussiano del 5% en los estados de entrada, no aporta ninguna ganancia.

## Capacidades

La documentación disponible no incluye una descripción de las capacidades funcionales del modelo (generación de texto, razonamiento, código, matemáticas, visión, etc.). El repositorio se centra exclusivamente en métricas de rendimiento de inferencia y en la ingeniería de decodificación especulativa.

- **Decodificación especulativa**: soporta el drafter DFlash2 v3 con K=2, usando `TRITON_ATTN` y rechazo estándar probabilístico.
- **Paralelismo de modelo**: soporta TP4 a través de 4 nodos con backend `mp`, incluyendo un head y 3 workers headless.
- **CUDA graphs**: habilitados mediante `CUDA_GRAPHS=1`, lo que supone una mejora del 11% en throughput frente a `--enforce-eager`.
- **Cuantización flexible**: se puede alternar entre 2bpw y 4bpw en expertos enrutados, aunque solo 2bpw compone bien con CUDA graphs.
- **Longitud de contexto**: configurado a 262,144 tokens, con KV cache en fp8.
- **No se documentan capacidades de tool calling, agentes, visión o audio** en la información proporcionada.

## Casos de uso

- **Despliegue de inferencia de alta concurrencia en clústeres DGX Spark**: el modelo se sirve con vLLM TP4 sobre 4 nodos GB10, alcanzando hasta 60.9 tok/s agregados a concurrencia 16. Es adecuado para entornos que necesitan atender múltiples peticiones simultáneas en un clúster multi-nodo.
- **Optimización de costes de memoria mediante cuantización 2bpw**: la cuantización EXL3 de 2 bits en los expertos enrutados reduce significativamente el footprint de memoria frente a la variante NVFP4, según las mediciones del autor. Esto es útil en hardware con memoria limitada, como los DGX Spark.
- **Investigación en decodificación especulativa**: el drafter DFlash2 v3 se entrena específicamente contra el modelo cuantizado objetivo, demostrando que el entrenamiento del drafter puede mejorar la aceptación en un 7%. Este caso es relevante para equipos que desarrollan o ajustan drafteres para sus propios modelos cuantizados.
- **Comparativa de estrategias de cuantización**: el repositorio sirve como referencia para evaluar EXL3 frente a NVFP4 en el mismo modelo y hardware. Los datos de throughput y accept length permiten a ingenieros decidir qué esquema de cuantización usar en función de sus requisitos de latencia y memoria.
- **Integración en pipelines de validación de serving**: los resultados incluyen una escalera completa de configuraciones (ladder) con ficheros JSON de benchmark, lo que permite reproducir pruebas y validar cambios en la configuración de vLLM, como la activación de CUDA graphs o el backend de atención.
- **Uso como banco de pruebas para clústeres con interconexión RoCE**: el autor documenta parámetros específicos de NCCL (`NCCL_IB_HCA=rocep1s0f1`, NVLS off, CROSS_NIC on) en una red Mellanox SN2700. Este caso es útil para administradores de sistemas que despliegan vLLM en clústeres con redes de baja latencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K, etc.) en la información disponible. Los resultados publicados se centran exclusivamente en rendimiento de inferencia medido con `llm-inference-bench` a temperatura 0 y contexto 0.

| Concurrencia | Tokens/s agregados | Longitud de aceptación |
|---|---|---|
| 1 | 31.7 | 1.78 |
| 2 | 50.6 | 1.66 |
| 4 | 57.7 | 1.66 |
| 8 | 59.5 | 1.72 |
| 16 | 60.9 (saturado) | 1.72 |

Resultados adicionales de la escalera de optimización:

| Configuración | Tokens/s (c=1) |
|---|---|
| 4bpw eager (anterior mejor) | 27.1 |
| CUDA graphs activados | 30.7 |
| 2bpw routed experts + CUDA graphs | 31.7 |
| Drafter v1 (proveedor) | 18.9 |

## Requisitos de hardware

- **Clúster mínimo**: 4 nodos NVIDIA DGX Spark (GB10) para la configuración TP4 documentada.
- **Interconexión**: RoCE con Mellanox SN2700, usando `NCCL_IB_HCA=rocep1s0f1`, NVLS desactivado y `CROSS_NIC` activado.
- **VRAM estimada**: no disponible. El autor indica que la configuración EXL3 2bpw ocupa "menos de la mitad del footprint de memoria" de la lane NVFP4, pero no se proporcionan cifras concretas.
- **GPU recomendadas**: únicamente se ha validado en NVIDIA DGX Spark (GB10). No se aportan datos para otras GPU.
- **Opciones de despliegue**: fork específico de vLLM (`ZJY0516`) con kernels nativos `vllm-exl3` de `vcruz305`. Se requiere el launcher `launch-exl3-tr3-tp4.sh` incluido en el repositorio.
- **Latencia y throughput**: 31.7 tok/s en single-stream, 57.7 tok/s a c=4, 60.9 tok/s a c=16 (saturado). No se indica latencia por token.

## Comparativa con modelos similares

La comparación se establece con la lane NVFP4 del mismo proyecto y con el modelo base sin cuantizar, que sirve como origen común.

| Modelo | Cuantización | Tokens/s c=1 | Tokens/s c=4 | Contexto | Licencia |
|---|---|---|---|---|---|
| cfontes/GLM-5.3-Flash-EXL3-TP4-Spark | EXL3 2bpw routed experts | 31.7 | 57.7 | 262,144 | no disponible |
| cfontes/GLM-5.3-Flash-DFlash2-TP4-Spark | NVFP4 | 37.9 | 94.2 | no disponible | MIT (según el repositorio asociado) |
| zai-org/GLM-5.3-Flash | Sin cuantizar | no disponible | no disponible | no disponible | no disponible |

La lane EXL3 ofrece aproximadamente el 84% del throughput single-stream de la lane NVFP4, con un footprint de memoria menor a la mitad. La comparación directa con el modelo base no es posible por falta de datos.

## Limitaciones y advertencias

- **Gap de rendimiento frente a NVFP4**: el autor concluye que el rendimiento inferior de EXL3 se debe a ruido de cuantización en los estados de capas medias, no a un problema del drafter. Un sondeo lineal sobre los estados ocultos capturados solo alcanza un 30% de acuerdo top-1 con los logits objetivo.
- **Techo de throughput**: con un límite de 17.9 pasos/s, alcanzar 80 tok/s en single-stream requeriría una longitud de aceptación de 4.5, que se considera inalcanzable en esta configuración EXL3 con cualquier drafter entrenado sobre sus estados ocultos.
- **Dependencia del drafter**: el drafter v3 fue entrenado específicamente sobre la pila EXL3-TR3-4bpw. Su rendimiento en otras configuraciones de cuantización o con otros modelos puede no ser óptimo.
- **Licencia no especificada**: el repositorio no declara licencia. No se puede confirmar si el uso comercial está permitido.
- **Idiomas no especificados**: no se documenta qué idiomas soporta el modelo. Se debe verificar con el modelo base original.
- **Sin benchmarks de calidad**: la ausencia de resultados en tareas de razonamiento, código o matemáticas impide evaluar la degradación de calidad causada por la cuantización EXL3.
- **Configuración específica de hardware**: los resultados solo son válidos en el clúster de 4 DGX Spark con la configuración RoCE descrita. Cambios en la interconexión, el número de nodos o el backend pueden alterar sustancialmente el rendimiento.

## Enlaces

- Repositorio principal: https://huggingface.co/cfontes/GLM-5.3-Flash-EXL3-TP4-Spark
- Drafter DFlash2 v3: https://huggingface.co/cfontes/GLM-5.3-Flash-DFlash2-TR3-v3
- Lane NVFP4 del mismo proyecto: https://huggingface.co/cfontes/GLM-5.3-Flash-DFlash2-TP4-Spark
- Modelo base: https://huggingface.co/zai-org/GLM-5.3-Flash
- Drafter original del proveedor: https://huggingface.co/incoai/GLM-5.3-Flash-DFlash2
- Repositorio relacionado: https://huggingface.co/cfontes/glm-5.3-flash-dflash2-tp4
