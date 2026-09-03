# EInnovator/pra-gemma3-1b-mlx-8bit

## Resumen

Este repositorio no contiene un modelo de lenguaje independiente, sino un **PRA Runtime Bundle** para el modelo base `mlx-community/gemma-3-1b-it-8bit`, desarrollado por EInnovator. PRA (Progressive Retrieval Attention) es una técnica que reduce el contexto visible durante la generación seleccionando dinámicamente los tokens más relevantes, lo que permite procesar secuencias largas con menos memoria y menor latencia. El bundle incluye el mapeo estructural, perfiles de runtime, componentes aprendidos opcionales y evidencia de calificación, pero no los pesos del modelo base.

La relevancia de este paquete radica en su capacidad para reducir el contexto visible en un 91,1% (de 395,3 a 35,2 tokens) con una pérdida de calidad mínima (token F1 de 0,0735 a 0,0699, un -4,91%) en tareas de QA multihop. Está diseñado para el motor MLX en Apple Silicon, con un pico de memoria de solo 1,30 GiB durante la generación. Es una solución orientada a despliegues eficientes en hardware de Apple, aunque su estado de calificación es limitado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Gemma3ForCausalLM (modelo base) + adaptador PRA |
| Parametros totales | 1B (modelo base) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (el modelo base Gemma 3 1B soporta hasta 32k, pero no se especifica en el bundle) |
| Tipos de cuantizacion | 8-bit (MLX) |
| Idiomas soportados | no disponible |
| Licencia | gemma |
| Formato de pesos | MLX (safetensors) para el modelo base; el bundle contiene metadatos y perfiles |

## Arquitectura y entrenamiento

El bundle se basa en la arquitectura `Gemma3ForCausalLM` del modelo base `mlx-community/gemma-3-1b-it-8bit`. PRA (Progressive Retrieval Attention) es un mecanismo que, en lugar de procesar todo el contexto de forma uniforme, selecciona progresivamente los tokens más relevantes para la generación actual, reduciendo así el número de tokens visibles y el coste computacional de la atención. El bundle proporciona el mapeo estructural necesario para aplicar esta técnica sobre el modelo base, junto con perfiles de runtime (modo "Selected Context" y perfil "BALANCED") y componentes aprendidos opcionales.

En cuanto al entrenamiento, la model card indica "pretrained and post-trained", pero no se detallan los datos de entrenamiento ni el proceso. Los datasets mencionados en las etiquetas (`2wikimultihopqa`, `hotpotqa`, `qasper`, `combined`) sugieren que la calificación se realizó sobre tareas de QA multihop y lectura de documentos, pero no se especifica si el adaptador fue entrenado con estos datos o solo evaluado. No hay información sobre RLHF, DPO u otras técnicas de alineación.

## Capacidades

- Reducción del contexto visible: PRA reduce los tokens visibles de 395,3 a 35,2 (un -91,1%) en el workload evaluado, manteniendo una calidad cercana a la línea base.
- Mejora de la log-probabilidad de la respuesta correcta: la Gold Answer Log Probability mejora de -23,04 a -20,67 (+10,28%), lo que sugiere una mejor calibración de las respuestas seleccionadas.
- Compatibilidad con el motor MLX: diseñado específicamente para ejecutarse con `mlx-lm` en Apple Silicon, con un pico de memoria de 1,30 GiB.
- Soporte para modos y perfiles: incluye modos "Native Memory" y "Selected Context", y perfiles "QUALITY", "BALANCED" y "ECONOMY", aunque solo el modo "Selected Context" con perfil "BALANCED" tiene evidencia medida.
- No se documentan capacidades de tool calling, visión, audio ni otras funcionalidades específicas del bundle; estas dependerían del modelo base Gemma 3 1B.

## Casos de uso

- Procesamiento de documentos largos: el bundle permite manejar documentos extensos (por ejemplo, informes, artículos científicos) reduciendo el contexto visible, lo que disminuye el uso de memoria y acelera la inferencia en tareas de extracción de información.
- QA multihop sobre bases de conocimiento: los datasets de calificación (`2wikimultihopqa`, `hotpotqa`) indican que el bundle es adecuado para preguntas que requieren razonamiento sobre múltiples pasajes. La reducción de contexto ayuda a mantener la relevancia sin saturar la ventana de atención.
- Chatbots con historial conversacional largo: al seleccionar solo los tokens relevantes del historial, se puede mantener una conversación fluida sin degradar el rendimiento ni exceder la memoria disponible.
- Sistemas de recuperación aumentada (RAG): PRA puede integrarse en pipelines RAG para filtrar los fragmentos recuperados y reducir el coste de procesamiento, manteniendo la precisión en la respuesta.
- Despliegue en hardware Apple Silicon: al requerir solo 1,30 GiB de memoria pico, es viable ejecutar el modelo en MacBooks con Apple Silicon (M4 Pro o superior) sin necesidad de GPUs dedicadas.
- Evaluación de eficiencia de contexto: el bundle sirve como referencia para medir el impacto de PRA en términos de calidad, latencia y uso de memoria, útil para investigadores que comparan técnicas de atención eficiente.

## Benchmarks y rendimiento

Los resultados presentados provienen de la model card, con el workload `combined` (n=60) sobre el modelo base `mlx-community/gemma-3-1b-it-8bit` en Apple M4 Pro (48 GB). Se comparan dos condiciones: sin PRA (baseline) y con PRA sin adaptador (PRA - No Adaptor). No se evaluó la condición con adaptador aprendido (NO_QUALIFIED_ADAPTER).

| Metrica | Unidad | Sin PRA | Con PRA (No Adaptor) | Delta |
|---|---|---|---|---|
| Token F1 | fraccion | 0,0735 | 0,0699 | -0,0036 (-4,91%) |
| Exact Match | fraccion | 0 | 0 | +0 |
| Gold Answer Log Probability | log_prob | -23,0353 | -20,6684 | +2,3670 (+10,28%) |
| Visible Tokens | token | 395,317 | 35,167 | -360,15 (-91,10%) |
| Selected Native K/V Tokens | token | 0 | 360,15 | +360,15 |
| TTFT p50 | ms | 32,66 | 31,00 | -5,06% |
| TTFT p95 | ms | 39,13 | 46,67 | +19,29% |
| TTFT p99 | ms | 46,30 | 58,74 | +26,86% |
| ITL p50 | ms | 5,91 | 6,36 | +7,66% |
| ITL p95 | ms | 6,44 | 7,00 | +8,74% |
| ITL p99 | ms | 7,42 | 7,40 | -0,20% |
| Output Tokens Per Second | token/s | 141,27 | 133,39 | -5,57% |
| Completion Latency Mean | ms | 170,38 | 180,42 | +5,90% |

No se han publicado resultados de benchmarks en la informacion disponible más allá de estos datos de calificación.

## Requisitos de hardware

- VRAM estimada: el smoke test reporta un pico de memoria de 1,30 GiB en Apple M4 Pro (48 GB), lo que indica que el bundle es muy ligero en cuanto a memoria.
- GPU recomendadas: diseñado para Apple Silicon (M4 Pro o superior) con motor MLX. No hay datos para GPUs NVIDIA o AMD.
- Compatibilidad con consumer GPU: no se ha probado en hardware no Apple; el bundle depende de MLX, que es específico de Apple.
- Opciones de despliegue: motor `mlx-lm` (versión 0.31.3 en la evidencia). No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: en el workload evaluado, TTFT p50 de 31,0 ms, ITL p50 de 6,36 ms y 133,4 tokens/s de salida. La carga del checkpoint tardó 41,34 s y la generación de una respuesta corta 1,174 s.

## Comparativa con modelos similares

No se dispone de comparativas directas con otros modelos o bundles de eficiencia de contexto en la información proporcionada. La única comparación posible es contra el modelo base sin PRA, cuyos resultados se muestran en la sección de benchmarks. No hay datos de otros métodos como Longformer, BigBird o técnicas de sparse attention para establecer una comparación cuantitativa.

## Limitaciones y advertencias

- Pérdida de calidad: el token F1 disminuye un 4,91% con PRA, y el Exact Match se mantiene en 0 en ambos casos, lo que indica que la tarea evaluada es difícil y la mejora en log-probabilidad no se traduce en respuestas exactas.
- Adaptador no calificado: la condición con adaptador aprendido (PRA - Adaptor Bundle) no tiene un adaptador cualificado (NO_QUALIFIED_ADAPTER), por lo que no se puede confirmar su rendimiento.
- Cobertura limitada de evidencia: solo se ha medido el modo "Selected Context" con perfil "BALANCED". Los modos "Native Memory" (perfiles QUALITY y ECONOMY) están en estado CALIBRATION_PENDING, y la combinación "Selected Context" con "No PRA" está en NEEDS_RUN.
- Sesgos y alucinaciones: no se documentan sesgos específicos, pero al ser un bundle sobre Gemma 3, hereda las limitaciones del modelo base. No hay evaluación de alucinaciones.
- Restricciones de licencia: la licencia es `gemma`, que permite uso comercial bajo los términos de Google, pero es responsabilidad del usuario revisar los términos completos.
- Dependencia de MLX: el bundle solo funciona con el motor MLX en Apple Silicon, lo que limita su portabilidad a otros entornos.
- Sin datos de contexto máximo: no se especifica la longitud de contexto soportada por el bundle, aunque el modelo base Gemma 3 1B soporta hasta 32k tokens.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/EInnovator/pra-gemma3-1b-mlx-8bit
- Modelo base: https://huggingface.co/mlx-community/gemma-3-1b-it-8bit
- No se encontraron papers, blogs o demos adicionales en la búsqueda web.
