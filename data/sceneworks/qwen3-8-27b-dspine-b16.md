# SceneWorks/qwen3.8-27b-dspine-b16

## Resumen

DSpine para Qwen3.8-27B es un modelo borrador (*draft model*) de decodificación especulativa diseñado para acelerar la inferencia de Qwen3.8-27B. Lo desarrolla Tencent y esta ficha corresponde a una copia re-alojada sin modificaciones por SceneWorks, fijada a una revisión concreta para que su aplicación descargue el modelo de forma reproducible junto con los demás niveles del sistema. El checkpoint contiene 2.025.912.064 parámetros en safetensors y ocupa 4,1 GB en el repositorio.

El modelo no es un generador de texto autónomo: es un componente de aceleración que propone bloques de tokens candidatos que el modelo objetivo Qwen3.8-27B verifica después. DSpine genera tokens borrador en paralelo, de modo que cada capa transmite características del predecesor predicho a las posiciones adyacentes y propaga dependencias causales a través de la profundidad de la red. El checkpoint es un borrador de cinco capas con tamaño de bloque 16 y ventana deslizante de 8.192 tokens.

Su relevancia es práctica: en cargas de agentes y de razonamiento largo, donde el modelo objetivo genera decenas de miles de tokens, la longitud de aceptación del borrador determina directamente el rendimiento agregado. Los datos publicados por el autor muestran mejoras de aceptación frente a DFlash2 en todos los conjuntos evaluados, tanto en modo greedy como con muestreo por temperatura.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DSpine (borrador de decodificación especulativa, 5 capas, generación paralela de tokens con propagación de características entre posiciones adyacentes) |
| Parametros totales | 2.025.912.064 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | ventana deslizante de 8.192 tokens; tamaño de bloque 16 |
| Tipos de cuantizacion | no disponible (evaluado en BF16) |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |
| Modelo base | Qwen/Qwen3.8-27B |
| Repositorio | 4,1 GB |
| Runtime de referencia | SGLang 0.5.22, BF16, FlashAttention 3, concurrencia 8 |
| Revision upstream | 260a6c23070ca873ff1a5f33b7119ac3f6a245ee |

## Arquitectura y entrenamiento

DSpine es un borrador de decodificación especulativa de cinco capas que predice tokens en paralelo en lugar de de forma secuencial. Cada capa pasa las características del predecesor predicho a las posiciones adyacentes, de manera que las dependencias causales se transportan a través de la profundidad de la red. El checkpoint usa un tamaño de bloque de 16 y una ventana deslizante de 8.192 tokens. La inferencia DSpine emplea verificación dinámica con referencia a DSpark y ReplaySSM habilitado.

La model card no detalla la composición del dataset de entrenamiento, el número de tokens utilizados ni si hubo fases de RLHF o DPO; esos datos no están disponibles. La evaluación publicada se realizó en SGLang 0.5.22 con BF16, FlashAttention 3 y concurrencia 8, comparando contra el borrador oficial DFlash2 con tamaño de bloque 8.

## Capacidades

- Generación de tokens borrador para decodificación especulativa sobre Qwen3.8-27B; no es un modelo de generación autónoma.
- Propuesta de bloques de 16 tokens candidatos que el modelo objetivo verifica.
- Aceleración de razonamiento largo: evaluado con razonamiento `xhigh` y hasta 4.096 tokens nuevos en benchmarks generales.
- Aceleración de cargas de agente: evaluado con hasta 32.768 tokens nuevos por petición, replicando todos los prefijos de llamadas a herramientas en orden.
- Compatibilidad con muestreo por temperatura (`temperature=1.0`, `top_p=0.95`, `top_k=20`) además de decodificación greedy.
- Integración con SGLang como runtime de referencia.
- Soporte de prefix caching en los escenarios de agente evaluados.
- Capacidades multilingües, de tool calling o de visión: no disponibles, al no ser un modelo generativo final.

## Casos de uso

- Aceleración de asistentes de código en producción: el borrador se acopla a Qwen3.8-27B para reducir la latencia de generación en tareas tipo HumanEval y MBPP, donde la longitud de aceptación medida es de 5,71 y 6,14 tokens respectivamente en modo greedy.
- Despliegue de agentes con cadenas largas de llamadas a herramientas: en escenarios de agente con hasta 32.768 tokens nuevos por petición, DSpine mantiene longitudes de aceptación superiores a DFlash2 en WorkBuddy Code, Web y Office.
- Razonamiento matemático de varios pasos: en GSM8K y MATH-500 el borrador alcanza longitudes de aceptación de 7,20 y 6,49 en greedy, lo que se traduce en menos pasos de verificación por respuesta.
- Automatización de tareas de oficina y web: los resultados en WorkBuddy Office (5,63 en modo `low`) y WorkBuddy Web (5,01 en `xhigh`) lo hacen adecuado para flujos de agente que combinan navegación y manipulación de documentos.
- Reproducción de trayectorias de sandbox en CI: la evaluación del autor replica prefijos de llamadas a herramientas con prefix caching, un patrón directamente trasladable a pipelines de integración que ejecutan agentes de código de forma determinista.
- Evaluación de agentes de resolución de incidencias: en SWE-bench Pro la longitud de aceptación es de 4,99 en `low` y 4,77 en `xhigh`, útil para entornos de reparación automática de repositorios.
- Diálogo multi-turno: en MT-Bench el borrador alcanza 4,48 en greedy y 4,03 con temperatura, adecuado para servicios conversacionales que ya sirven Qwen3.8-27B.
- Benchmarking de interacción con herramientas: en τ²-bench la aceptación es de 5,53 en `low` y 4,95 en `xhigh`, relevante para sistemas que deben decidir y encadenar herramientas.

## Benchmarks y rendimiento

Longitud de aceptación (tokens aceptados por paso de verificación). DFlash2 usa bloque 8; DSpine, bloque 16.

| Tarea | DFlash2 (T=0) | DSpine (T=0) | DFlash2 (T=1) | DSpine (T=1) |
|---|---:|---:|---:|---:|
| GSM8K | 5,69 | **7,20** | 5,45 | **6,31** |
| MATH-500 | 5,49 | **6,49** | 5,27 | **5,66** |
| HumanEval | 4,87 | **5,71** | 4,34 | **4,71** |
| MBPP | 5,04 | **6,14** | 4,79 | **5,41** |
| MT-Bench | 4,11 | **4,48** | 3,89 | **4,03** |

Longitud de aceptación en benchmarks de agente (razonamiento `low` y `xhigh`, muestreo por temperatura).

| Benchmark | DFlash2 (low) | DSpine (low) | DFlash2 (xhigh) | DSpine (xhigh) |
|---|---:|---:|---:|---:|
| WorkBuddy Code | 4,19 | **5,08** | 4,06 | **4,92** |
| WorkBuddy Web | 3,95 | **4,91** | 3,95 | **5,01** |
| WorkBuddy Office | 4,24 | **5,63** | 4,20 | **5,49** |
| SWE-bench Pro | 4,19 | **4,99** | 4,00 | **4,77** |
| τ²-bench | 4,70 | **5,53** | 4,29 | **4,95** |

La model card incluye además una tabla de throughput extremo a extremo de agentes (tokens de salida totales divididos por el tiempo de pared en reproducción concurrente, con la mejora frente a decodificación autorregresiva entre paréntesis), pero el contenido disponible está truncado y no permite reproducir las cifras; no se incluyen para no inventar datos.

## Requisitos de hardware

- VRAM estimada para el borrador: en BF16, los 2.025.912.064 parámetros suponen aproximadamente 4,05 GB solo de pesos, más overhead de activaciones y caché KV de la ventana deslizante de 8.192 tokens. En la práctica hay que sumar la memoria del modelo objetivo Qwen3.8-27B, que domina el consumo total.
- GPU recomendadas: el borrador cabe con holgura junto al modelo objetivo en A100 80 GB, H100 80 GB y H200. En configuraciones multi-GPU, el borrador puede residir en una sola GPU.
- GPU de consumo: los pesos del borrador caben en una RTX 4090 (24 GB) o RTX 3090 (24 GB), pero el modelo objetivo de 27B en BF16 no; sería necesario cuantizar el objetivo o usar offloading.
- Despliegue: SGLang 0.5.22 es el runtime de referencia (BF16, FlashAttention 3). La model card marca `inference: false` en Hugging Face, es decir, no está pensado para el pipeline genérico de transformers. No hay datos publicados sobre soporte en vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no se publican cifras completas en la información disponible; las tablas de throughput de agente están truncadas. La referencia cualitativa es la longitud de aceptación: a mayor aceptación, menos pasos de verificación del modelo objetivo por token generado.

## Comparativa con modelos similares

| Modelo | Parámetros | Tipo | Bloque | Contexto | Licencia | Aceptación GSM8K (T=0) |
|---|---:|---|---:|---|---|---:|
| DSpine b16 (este) | 2,03 B | Borrador especulativo, 5 capas | 16 | 8.192 (ventana deslizante) | Apache-2.0 | 7,20 |
| DFlash2 (z-lab) | no disponible | Borrador especulativo | 8 | no disponible | no disponible | 5,69 |
| Qwen3.8-27B | 27 B (nominal) | Modelo objetivo generativo | n/a | no disponible | no disponible | n/a (no es borrador) |

DFlash2 es la única alternativa comparable documentada en la información disponible. No se dispone de datos de otros borradores (por ejemplo, variantes EAGLE o Medusa) para Qwen3.8-27B.

## Limitaciones y advertencias

- No es un modelo generativo: requiere Qwen3.8-27B como verificador y un runtime compatible (SGLang) con soporte de decodificación especulativa; la model card declara `inference: false`.
- La ventana deslizante de 8.192 tokens limita el contexto que el borrador puede aprovechar; en peticiones de agente muy largas la aceptación puede degradarse.
- La aceptación cae con muestreo por temperatura frente a greedy en todos los benchmarks publicados (por ejemplo, GSM8K pasa de 7,20 a 6,31), lo que reduce la ganancia en despliegues con temperatura alta.
- Los benchmarks de agente se han medido sobre trayectorias de sandbox de CodeBuddy y el conjunto WorkBuddy Bench del propio autor; pueden no trasladarse a otros dominios de agente.
- No hay información sobre sesgos, alucinación o cobertura idiomática del borrador; al heredar el comportamiento del modelo objetivo, los sesgos de Qwen3.8-27B se manifiestan en la salida final.
- Licencia Apache-2.0 permite uso comercial, pero esta copia es un re-host de terceros: conviene fijar la revisión y verificar la integridad frente al repositorio upstream de Tencent.
- El repositorio tiene 0 descargas y 0 likes en el momento de la ficha, por lo que no hay validación comunitaria independiente de los resultados.
- No se publican datos de cuantización; el uso en BF16 es el único escenario evaluado.

## Enlaces

- Hugging Face (este re-host): https://huggingface.co/SceneWorks/qwen3.8-27b-dspine-b16
- Repositorio upstream: https://huggingface.co/tencent/Qwen3.8-27B-DSpine-b16
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Paper DSpine (arXiv): https://arxiv.org/abs/2609.36173
- Paper adicional citado en tags (arXiv): https://arxiv.org/abs/2607.05147
- Página del proyecto: https://dspine-project.github.io
- Repositorio GitHub DSpine: https://github.com/Tencent/DSpine
- Borrador DFlash2 comparable: https://huggingface.co/z-lab/Qwen3.8-27B-DFlash2
- Verificación dinámica DSpark: https://github.com/deepseek-ai/DeepSpec
- ReplaySSM: https://github.com/Johnny-Liou/ReplaySSM
- WorkBuddy Bench: https://github.com/Tencent/workbuddy-bench
- SceneWorks (GitHub): https://github.com/SceneWorks/SceneWorks
