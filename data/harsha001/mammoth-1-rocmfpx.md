# Harsha001/mammoth-1-ROCmFPX

## Resumen

mammoth-1-ROCmFPX es una cuantización en formato GGUF del modelo `baselabs/mammoth-1`, un modelo de decisión de 27B parámetros desarrollado por Base Labs y post-entrenado a partir de Qwen3.5-27B. La cuantización la firma Harsha001 y está orientada específicamente a GPUs AMD, en particular a la arquitectura Strix Halo (`gfx1151`), mediante los formatos ROCmFPX y ROCmFP4. El modelo no es un chatbot al uso: recibe un estado (texto o JSON) y un conjunto de preguntas, y devuelve una distribución de probabilidad sobre las opciones de cada pregunta a partir de un único prefill compartido.

La relevancia de esta ficha reside en dos factores. Por un lado, mammoth-1 representa una categoría distinta de modelo: no genera texto libre, sino que produce decisiones calibradas (sí/no, elección entre opciones nombradas o puntuaciones ordinales), lo que lo hace útil para evaluación automática de agentes y robótica. Por otro, esta versión demuestra que es posible ejecutar un modelo de 27B en hardware de consumo AMD mediante cuantización agresiva a 4 bits con pérdida de calidad medida y acotada.

El repositorio ocupa 79 GB e incluye cuatro cuantizaciones (8, 6 y dos de 4 bits). El autor advierte explícitamente de que los ficheros solo cargan en una build ROCmFPX de llama.cpp y de que no se han probado todavía en hardware AMD real. La licencia es MIT y el pipeline declarado es `text-classification`.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de Qwen3.5-27B), con atención bidireccional por bloques en las capas de atención completa |
| Parametros totales | 26.895.998.464 (~26,9B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (el calibrado usa fragmentos de 512 tokens) |
| Tipos de cuantizacion | Q8_0_ROCMFPX, Q6_0_ROCMFPX (etiquetado Q6_K), Q4_0_ROCMFP4_STRIX, Q4_0_ROCMFP4_FAST; Q3_0_ROCMFPX no publicado |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | GGUF (ROCmFPX), con ajustes de decisión embebidos (`qwen35.decision.*`) |

## Arquitectura y entrenamiento

mammoth-1 es un transformer denso de 27B parámetros post-entrenado desde Qwen3.5-27B. La innovación principal no está en la arquitectura base sino en el post-entrenamiento como modelo de decisión: el checkpoint incorpora atención bidireccional por bloques en las capas de atención completa y una cabeza de 256 etiquetas de respuesta. Esto permite formular varias preguntas sobre un mismo estado y obtener, en un solo prefill compartido, una probabilidad para cada opción de cada pregunta, en lugar de generar texto autoregresivamente.

Los detalles sobre volumen de tokens de entrenamiento, composición del dataset y uso de RLHF o DPO no están disponibles en la información proporcionada. La cuantización sí está documentada con precisión: conversión a BF16 con el fork de ROCmFPX, generación de una importance matrix sobre el corpus `calibration_datav3` en fragmentos de 512 tokens, y cuantización con `llama-quantize --imatrix`, una pasada por tipo. La calidad se midió expandiendo cada cuantización de vuelta a F16 (preservando los pesos almacenados) y evaluando perplejidad y divergencia KL frente al modelo BF16 de referencia (55 GB, PPL 6,8738) sobre WikiText-2 test, 40 fragmentos de 512 tokens.

## Capacidades

- Clasificación y decisión estructurada: responde preguntas de tipo `noul` (probabilidad de sí), `choice` (una entre opciones nombradas con descripción) y `score` (niveles ordenados).
- Evaluación de trayectorias de agentes: el ejemplo de la model card evalúa el resultado de una tarea de manipulación robótica (agarre, elevación y colocación de un objeto) con probabilidades calibradas.
- Salida calibrada multi-pregunta desde un único prefill, lo que reduce coste frente a invocar el modelo una vez por pregunta.
- Modo de debiasing opcional (`--debias N`) que promedia sobre N desplazamientos cíclicos de las etiquetas de respuesta.
- Atención causal estándar opcional (`--causal`) frente a la máscara bidireccional por bloques entrenada.
- No soporta generación de texto libre, tool calling ni razonamiento multi-paso en el sentido habitual; su interfaz es el formato de petición de `llama-decide`.
- Capacidades multilingües: no disponibles en la información proporcionada.

## Casos de uso

- Evaluación automática de agentes robóticos: dado un estado con observaciones y lecturas de sensores (por ejemplo, fuerza del gripper en newtons), el modelo devuelve la probabilidad de éxito, el modo de fallo más probable y el nivel de progreso alcanzado, lo que permite puntuar episodios completos sin un LLM generativo.
- Puntuación de trayectorias en pipelines de RL o evaluación de políticas: al compartir un único prefill entre varias preguntas, se pueden calcular recompensas o etiquetas de progreso por episodio con un coste muy inferior al de un modelo generativo equivalente.
- Verificación de resultados en tareas de manipulación: clasificar si un intento de agarre terminó en deslizamiento, colisión u objeto equivocado, usando las categorías definidas en `criteria`.
- Despliegue en estaciones de trabajo con GPU AMD Strix Halo: la cuantización Q4_0_ROCMFP4_STRIX (14,8 GB) está ajustada para `gfx1151` y cabe en los 128 GB de memoria unificada de una máquina Strix Halo, permitiendo ejecutar un modelo de 27B en hardware integrado.
- Evaluación de calidad de datos o de respuestas en pipelines de clasificación: usar el tipo `choice` para etiquetar entre categorías predefinidas con probabilidades, integrándolo como clasificador en un servicio interno.
- Investigación sobre cuantización en AMD: el repositorio publica métricas de PPL, KLD y coincidencia de top-1 frente a BF16 para cada fichero, lo que sirve como referencia para estudiar el impacto de ROCmFP4 en modelos de 27B.
- Clasificación por niveles ordinales: el tipo `score` permite medir progreso en tareas por etapas (no iniciado, agarrado, elevado, colocado), útil para monitorización en tiempo casi real de experimentos.

## Benchmarks y rendimiento

Calidad de cuantización medida frente al modelo BF16 (PPL 6,8738) sobre WikiText-2 test, 40 fragmentos de 512 tokens. KLD es la divergencia KL media de la distribución del siguiente token respecto a BF16; "same top" es la frecuencia con la que la cuantización elige el mismo siguiente token.

| Fichero | Tamano | PPL | KLD | Same top |
|---|---:|---:|---:|---:|
| `mammoth-1-Q8_0_ROCMFPX.gguf` | 27,8 GB | 6,8803 | 0,0058 | 97,26% |
| `mammoth-1-Q6_K_ROCMFPX.gguf` | 22,2 GB | 6,8779 | 0,0065 | 96,74% |
| `mammoth-1-Q4_0_ROCMFP4_STRIX.gguf` | 14,8 GB | 6,9821 | 0,0370 | 90,98% |
| `mammoth-1-Q4_0_ROCMFP4_FAST.gguf` | 14,3 GB | 6,9557 | 0,0379 | 91,21% |
| `Q3_0_ROCMFPX` (no publicado) | 14,9 GB | 7,0924 | 0,0549 | 89,54% |

No se han publicado resultados de benchmarks de decisión (precisión en tareas de clasificación) en la información disponible; el autor lo indica explícitamente. La comparación con el runtime PyTorch de Base Labs solo se verificó en el modelo hermano elephant-1 (9B), con diferencias de probabilidad inferiores a 0,004; para mammoth-1 solo se ejecutó el ejemplo de la model card.

## Requisitos de hardware

- VRAM estimada: aproximadamente 15 GB para los ficheros de 4 bits, 22 GB para el de 6 bits y 28 GB para el de 8 bits, más overhead del contexto y de la máscara de decisión.
- GPU objetivo: AMD Strix Halo (`gfx1151`) para el fichero STRIX; también se documenta `gfx1100` (RX 7900) como objetivo de compilación.
- Cabe en GPU de consumo AMD con memoria unificada de 128 GB (Strix Halo); en GPUs discretas de consumo de 16 GB el fichero de 4 bits queda muy justo y no hay datos de funcionamiento publicados.
- Despliegue: exclusivamente mediante `llama-decide`, la herramienta del fork ROCmFPX de llama.cpp. No es compatible con servidores de chat estándar (vLLM, TGI, Ollama) según el autor.
- Compilación: `cmake -B build -DGGML_VULKAN=ON` o `-DGGML_HIP=ON -DAMDGPU_TARGETS=gfx1151` (o `gfx1100`), y `cmake --build build --target llama-decide -j`.
- Latencia y throughput: no disponibles. El autor advierte de que los ficheros no se han probado todavía en hardware AMD.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato / licencia | Enfoque |
|---|---|---|---|---|
| mammoth-1-ROCmFPX (esta ficha) | ~26,9B | no disponible | GGUF ROCmFPX, MIT | Modelo de decisión cuantizado para AMD |
| baselabs/mammoth-1 (base) | ~26,9B | no disponible | BF16 (55 GB), MIT | Modelo de decisión original, runtime PyTorch de Base Labs |
| elephant-1 (hermano, 9B) | no disponible | no disponible | no disponible | Modelo de decisión de menor tamano de Base Labs, usado para validar `llama-decide` |

No se dispone de datos de benchmarks comparativos con otros modelos de decisión ni con clasificadores alternativos en la información proporcionada. La comparación más directa es con el checkpoint BF16 original, cuyas métricas de referencia (PPL 6,8738) se usan como base para medir la pérdida de las cuantizaciones.

## Limitaciones y advertencias

- No es un modelo conversacional: no genera texto libre y un servidor de chat estándar no es la forma correcta de usarlo.
- Los ficheros solo cargan en una build ROCmFPX de llama.cpp; requieren el fork y la herramienta `llama-decide`.
- El autor indica que los ficheros no se han probado en hardware AMD real; el ejemplo de la model card se ejecutó con backend CPU.
- La calidad de decisión no se ha medido: las métricas publicadas (PPL, KLD, same top) reflejan el cambio en los pesos sobre texto plano con atención causal, no la precisión en tareas de clasificación.
- El fichero de 6 bits se etiqueta como `Q6_K` por convención de Hugging Face, pero sus pesos son del tipo ROCmFPX `Q6_0_ROCMFPX`, no un `Q6_K` estándar de llama.cpp.
- El fichero Q3_0_ROCMFPX no se publica por ser mayor que los de 4 bits y estar más lejos de BF16.
- No es una release oficial de Base Labs ni de Baseten; el crédito del modelo corresponde a Base Labs.
- Riesgo de alucinación y sesgos: no documentados en la información proporcionada, aunque al tratarse de un modelo de clasificación calibrada el riesgo se manifiesta como probabilidades mal calibradas más que como texto inventado.
- Licencia MIT, que permite uso comercial, pero sin garantías del autor sobre el comportamiento en producción.
- Idiomas soportados y longitud de contexto no disponibles, lo que impide garantizar su comportamiento fuera del inglés y de estados de longitud moderada.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Harsha001/mammoth-1-ROCmFPX
- Modelo base: https://huggingface.co/baselabs/mammoth-1
- Repositorio del fork ROCmFPX con `llama-decide`: https://github.com/HarshaVardhan3002/ROCmFPX
- Repositorio de los formatos ROCmFPX: https://github.com/charlie12345/ROCmFPX
- Modelo destacado del mismo autor (DeepSeek-V4.1-Flash para Strix Halo): https://huggingface.co/Harsha001/DeepSeek-V4.1-Flash-1017-Uncensored-GSQ-RCO-StrixHalo-GGUF
