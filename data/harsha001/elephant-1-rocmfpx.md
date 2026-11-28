# Harsha001/elephant-1-ROCmFPX

## Resumen

elephant-1-ROCmFPX es una cuantización del modelo base `baselabs/elephant-1`, un modelo de decisión de 9B parámetros desarrollado por Base Labs (post-entrenado a partir de Qwen3.5-9B). A diferencia de un modelo conversacional convencional, elephant-1 recibe un estado (texto o JSON) y un conjunto de preguntas tipadas, y devuelve una probabilidad calibrada para cada opción de cada pregunta en un único prefill compartido. El autor de esta ficha, Harsha001, publica los pesos en formato GGUF adaptados a los tipos de cuantización ROCmFPX, orientados a GPUs AMD (en particular Strix Halo, `gfx1151`).

La relevancia de esta publicación es doble: por un lado, pone a disposición un modelo de clasificación y calibración de decisiones en un formato ejecutable sobre hardware AMD consumer; por otro, introduce una integración específica con `llama-decide`, una herramienta del fork ROCmFPX de llama.cpp que interpreta el formato de petición del runtime original de Base Labs. No es un modelo para usar con un servidor de chat estándar.

El repositorio ocupa 26,5 GB e incluye cuatro variantes de cuantización (Q8, Q6 y dos Q4), con métricas de perplejidad y divergencia KL medidas frente al modelo BF16 de referencia. La licencia es MIT y el pipeline declarado es `text-classification`.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de Qwen3.5-9B), con atención bidireccional por bloques en las capas de atención completa y 256 etiquetas de respuesta |
| Parametros totales | 8.953.803.264 (8,95B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | Q8_0_ROCMFPX, Q6_0_ROCMFPX (publicado como Q6_K_ROCMFPX), Q4_0_ROCMFP4_STRIX, Q4_0_ROCMFP4_FAST |
| Idiomas soportados | No disponible |
| Licencia | MIT |
| Formato de pesos | GGUF (tipos ROCmFPX, requieren fork de llama.cpp) |

## Arquitectura y entrenamiento

El modelo base es un transformer de 8,95B parámetros post-entrenado desde Qwen3.5-9B por Base Labs como modelo de decisión. La innovación principal reside en el enmascaramiento de atención: las capas de atención completa usan atención bidireccional por bloques, y el modelo dispone de 256 etiquetas de respuesta que se puntúan de forma conjunta. Los archivos GGUF portan la configuración de decisión original (`qwen35.decision.*`), de modo que `llama-decide` no necesita ficheros adicionales para funcionar.

El proceso de cuantización documentado por el autor consta de cuatro pasos: conversión a GGUF BF16 con el fork (que además escribe los ajustes de decisión), cálculo de una importance matrix sobre texto de calibración general (`calibration_datav3`) en fragmentos de 512 tokens, cuantización con `llama-quantize --imatrix` por cada tipo, y evaluación de calidad. La referencia BF16 se ejecutó en GPU NVIDIA con kernels estándar, mientras que cada cuantización se puntuó con el backend CPU del fork. No se detallan en la información disponible el volumen de tokens de entrenamiento, la composición del dataset ni si hubo RLHF o DPO en el modelo base.

## Capacidades

- Clasificación y calibración de decisiones: devuelve probabilidades para preguntas de tipo `noul` (sí/no), `choice` (una entre opciones nombradas) y `score` (niveles ordenados).
- Puntuación conjunta multi-pregunta en un único prefill compartido, lo que reduce coste frente a evaluar cada pregunta por separado.
- Procesamiento de estado estructurado: acepta texto libre o JSON con observaciones, métricas y contexto de tarea.
- Atención bidireccional por bloques entrenada, con opción `--causal` para usar atención causal estándar.
- Opción `--debias N` para promediar sobre N desplazamientos cíclicos de las etiquetas de respuesta.
- Verificación de paridad con el runtime PyTorch de Base Labs (probabilidades dentro de 0,004).
- No soporta tool calling, agentes multi-paso, visión ni audio según la información disponible.
- Capacidades multilingües: no disponibles.

## Casos de uso

- Evaluación de éxito en robótica de manipulación: dado un estado con la tarea, las observaciones y la fuerza del gripper, el modelo devuelve la probabilidad de éxito, el modo de fallo más probable y el nivel de progreso alcanzado. El ejemplo de la model card muestra `success` 0,020, `failure_mode` `grasp_slip` 0,996 y `progress` "grasped the object" 0,719.
- Monitorización de pipelines de agentes: clasificar si una trayectoria de ejecución ha completado su objetivo y en qué fase se quedó, usando preguntas `noul` y `score` sobre el estado acumulado.
- Control de calidad en entornos simulados: puntuar resultados de episodios con criterios ordenados (no iniciado, agarrado, levantado, colocado) para alimentar métricas de evaluación automática.
- Triaje de fallos en sistemas automatizados: dado un registro de observaciones, elegir entre modos de fallo predefinidos (`grasp_slip`, `collision`, `wrong_object`, `no_failure`) con probabilidades calibradas.
- Anotación asistida de datasets de decisión: generar distribuciones de probabilidad sobre etiquetas para revisión humana, aprovechando la calibración del modelo en lugar de una única etiqueta dura.
- Despliegue en estaciones AMD Strix Halo: ejecutar el modelo en una máquina de 128 GB con GPU integrada AMD mediante el fork ROCmFPX y el fichero `Q4_0_ROCMFP4_STRIX` de 5,1 GB, sin necesidad de GPU NVIDIA.
- Investigación en calibración de modelos: comparar la fidelidad de distintas cuantizaciones (Q8, Q6, Q4) frente a BF16 usando las métricas KLD y "same top" publicadas.

## Benchmarks y rendimiento

Métricas de fidelidad de cuantización frente al modelo BF16 (perplejidad 7,5591) sobre WikiText-2 test, 40 fragmentos de 512 tokens. KLD es la divergencia KL media de la distribución del siguiente token respecto a BF16 (menor es mejor); "same top" es la frecuencia con la que la cuantización elige el mismo siguiente token que BF16.

| Fichero | Tamano | PPL | KLD | Same top |
|---|---:|---:|---:|---:|
| `elephant-1-Q8_0_ROCMFPX.gguf` | 9,2 GB | 7,5678 | 0,0054 | 96,47% |
| `elephant-1-Q6_K_ROCMFPX.gguf` | 7,4 GB | 7,5805 | 0,0067 | 95,96% |
| `elephant-1-Q4_0_ROCMFP4_STRIX.gguf` | 5,1 GB | 7,7795 | 0,0478 | 88,63% |
| `elephant-1-Q4_0_ROCMFP4_FAST.gguf` | 4,8 GB | 7,8060 | 0,0496 | 88,54% |

No publicado: `Q3_0_ROCMFPX` (4,9 GB, PPL 7,9236, KLD 0,0750, same top 86,74%), descartado por ser mayor que `Q4_0_ROCMFP4_FAST` y estar más lejos de BF16.

No se han publicado resultados de benchmarks de tareas (MMLU, HumanEval, GSM8K u otros) en la información disponible. El autor indica explícitamente que la precisión de decisión no fue medida.

## Requisitos de hardware

- VRAM estimada: aproximadamente 5,1 GB para `Q4_0_ROCMFP4_STRIX`, 4,8 GB para `Q4_0_ROCMFP4_FAST`, 7,4 GB para Q6 y 9,2 GB para Q8.
- GPU recomendadas: AMD Strix Halo (`gfx1151`) para la variante STRIX; RX 7900 (`gfx1100`) como objetivo alternativo en la compilación HIP.
- Cabe en GPU consumer AMD con suficiente memoria unificada o dedicada; el autor menciona una máquina Strix Halo de 128 GB como plataforma de referencia para sus cuantizaciones.
- Opciones de despliegue: exclusivamente el fork ROCmFPX de llama.cpp con la herramienta `llama-decide`. Compilación con `-DGGML_VULKAN=ON` o `-DGGML_HIP=ON -DAMDGPU_TARGETS=gfx1151` (o `gfx1100`).
- Los ficheros no han sido probados en hardware AMD según advierte el autor; la respuesta de ejemplo de la model card se obtuvo con el backend CPU.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Enfoque |
|---|---|---|---|---|---|
| elephant-1-ROCmFPX | 8,95B | No disponible | GGUF ROCmFPX | MIT | Modelo de decisión cuantizado para AMD |
| baselabs/elephant-1 (base) | 8,95B | No disponible | Safetensors (BF16) | No disponible en la información | Modelo de decisión original con runtime PyTorch |
| Qwen3.5-9B | 9B (aproximado) | No disponible | Safetensors, GGUF | No disponible en la información | Modelo generativo del que deriva elephant-1 |

La comparación con alternativas de clasificación o decisión de tamaño similar no está disponible en la información proporcionada.

## Limitaciones y advertencias

- No es un modelo conversacional: requiere `llama-decide` y el formato de petición con `state` y `questions`; un servidor de chat estándar no es la vía de uso.
- Los ficheros solo cargan en una compilación ROCmFPX de llama.cpp, un fork no oficial.
- El autor advierte que los ficheros no han sido probados en hardware AMD; las métricas de calidad se obtuvieron con backend CPU.
- La precisión de decisión no fue medida; las métricas publicadas (PPL, KLD, same top) reflejan fidelidad de pesos, no calidad de las decisiones.
- Los kernels AMD pueden producir resultados ligeramente distintos a los de CPU por el orden de las operaciones en coma flotante.
- El fichero Q6 usa el tipo ROCmFPX `Q6_0_ROCMFPX`, no un `Q6_K` estándar de llama.cpp, pese al nombre.
- No es una release oficial de Base Labs ni de Baseten; el crédito del modelo corresponde a Base Labs.
- Sesgos conocidos, riesgo de alucinación y limitaciones idiomáticas: no disponibles en la información proporcionada.
- Licencia MIT, lo que permite uso comercial, pero la dependencia del fork ROCmFPX condiciona el despliegue en producción.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Harsha001/elephant-1-ROCmFPX
- Modelo base: https://huggingface.co/baselabs/elephant-1
- Fork ROCmFPX (GitHub, autor): https://github.com/HarshaVardhan3002/ROCmFPX
- ROCmFPX (GitHub, referencia de formatos): https://github.com/charlie12345/ROCmFPX
- Cuantización destacada del autor (DeepSeek-V4.1-Flash en Strix Halo): https://huggingface.co/Harsha001/DeepSeek-V4.1-Flash-1017-Uncensored-GSQ-RCO-StrixHalo-GGUF
