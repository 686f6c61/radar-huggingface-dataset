# sizzlebop/hayabusa-9b-GGUF

## Resumen

Hayabusa 9B es un ajuste fino de pesos completos sobre `Qwen/Qwen3.5-9B`, desarrollado por georvn7 y distribuido en formato GGUF por el usuario sizzlebop. El modelo está especializado en depuración autónoma de software y en la selección estructurada de acciones dentro de agentes: se ha entrenado con contextos de depurador que incluyen código fuente, trazas de pila (stack traces), registros de ejecución en tiempo de ejecución, resultados de tests e historial de ejecución. No es, por tanto, un modelo conversacional de propósito general, sino una herramienta orientada a un flujo de trabajo muy concreto.

Arquitectónicamente es un transformer causal denso de aproximadamente 8.953.803.264 parámetros (unos 9B), con 32 capas ocultas y una combinación híbrida de atención lineal (DeltaNet) y atención completa, dimensión oculta de 4096 y dimensión intermedia de 12288. La longitud de contexto de entrenamiento se sitúa en 32.768 tokens, con un techo de servicio de hasta 64K. Se distribuye bajo licencia Apache 2.0 y admite únicamente inglés.

Su relevancia actual radica en dos factores. Por un lado, el pipeline de alineación declarado combina DPO y aprendizaje por refuerzo sobre un formato de contexto específico para agentes de depuración (`agent-optimized-debug-v3`), con trazas de razonamiento interno emitidas en etiquetas `<think>`. Por otro, la publicación en GGUF con siete niveles de cuantización (de BF16 a Q2_K, entre 16,69 GB y 3,56 GB) permite ejecutarlo en estaciones de trabajo locales y en GPUs de consumo, algo poco habitual en modelos especializados en depuración con selección de acciones.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal denso `Qwen3_5ForCausalLM` (`model_type`: `qwen3_5_text`), híbrida de atención lineal DeltaNet + atención completa |
| Parametros totales | 8.953.803.264 (aprox. 9B) |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | 32.768 tokens de techo de entrenamiento; hasta 64K de techo de servicio |
| Tipos de cuantizacion | BF16, Q8_0, Q6_K, Q5_K_M, Q4_K_M, Q3_K_M, Q2_K |
| Idiomas soportados | en (inglés) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (conversión nativa desde safetensors en bfloat16 mediante llama.cpp) |
| Capas ocultas | 32 |
| Dimension oculta | 4096 |
| Dimension intermedia | 12288 |
| Precision nativa | bfloat16 |
| Modelo base | georvn7/hayabusa-9b (ajuste sobre Qwen/Qwen3.5-9B) |
| Checkpoint | hayabusa-9b-temporal-v2-step1-r1-c8-rl |
| Tamano del repositorio | 55,4 GB |
| Plantilla de prompt | ChatML con trazas `<think>...</think>` |

## Arquitectura y entrenamiento

El modelo emplea la arquitectura declarada por el autor como `Qwen3_5ForCausalLM`, con `model_type` `qwen3_5_text`. Se trata de un transformer causal de 32 capas que combina capas de atención lineal DeltaNet con capas de atención completa; la model card no especifica el reparto exacto entre ambos tipos de capa, por lo que ese dato queda como no disponible. La dimensión oculta es de 4096 y la intermedia de 12288, con pesos nativos en bfloat16 sobre un total de 8.953.803.264 parámetros. El techo de entrenamiento es de 32.768 tokens, ampliable en servicio hasta 64K.

El entrenamiento parte de `Qwen/Qwen3.5-9B` y corresponde al checkpoint terminal del Step 1, Recovery Round 1, Cycle 8, construido a partir de `hayabusa-9b-temporal-v2-step1-r1-c7-rl`. El proceso de alineación combina dos etapas: DPO con 47 filas (970.457 tokens de la rama de política, pérdida de entrenamiento final 0,6677) y aprendizaje por refuerzo con 42 filas y 95 secuencias de política, con una KL aproximada final de 0,000417. La política de recompensa empleada es la versión 11 y el formato de contexto es `agent-optimized-debug-v3`. El "assistant thinking" está habilitado y forma parte del contrato de generación en tiempo de ejecución: el modelo produce pasos de razonamiento internos dentro de `<think>...</think>` antes de emitir el diagnóstico o la llamada a herramienta. Los pesos GGUF se convirtieron desde safetensors con llama.cpp en BF16 nativo y después se cuantizaron a variantes k-quant estándar.

## Capacidades

- Generación de texto y razonamiento estructurado con trazas internas de pensamiento en etiquetas `<think>`.
- Diagnóstico de errores a partir de trazas de pila, registros de ejecución y fragmentos de código.
- Selección estructurada de acciones de agente (formato de acción optimizado para depuración).
- Propuesta de correcciones mínimas sobre código defectuoso (parches acotados al fallo diagnosticado).
- Análisis de resultados de tests y de historial de ejecución para localizar la causa raíz.
- Soporte de plantilla ChatML con roles `system`, `user` y `assistant`, compatible con servidores OpenAI-compatible.
- Capacidad de ejecutarse como servidor local mediante `llama-server`, Ollama o LM Studio.
- Modelo exclusivamente textual: la model card indica explícitamente que las entradas de visión no están soportadas en este checkpoint (ajuste de solo texto).
- No hay información disponible sobre soporte de function calling nativo más allá de la selección de acciones descrita, ni sobre capacidades multilingües distintas del inglés.

## Casos de uso

- Depuración automatizada en pipelines de CI/CD: ante un fallo de compilación o de test, el modelo recibe el fragmento de código, la traza de pila y la salida del test, y devuelve el diagnóstico con la corrección mínima. Su contexto de 32.768 tokens permite incluir el archivo completo más los registros asociados sin truncar.
- Agentes de reparación de código en bucle cerrado: el modelo puede actuar como política de selección de acciones dentro de un agente que edita ficheros, ejecuta tests y vuelve a evaluar, gracias a su entrenamiento específico en selección estructurada de acciones.
- Triaje de errores en producción a partir de observabilidad: integrado detrás de un colector de trazas, clasifica y explica la causa raíz de excepciones recurrentes antes de que lleguen a un ingeniero de guardia.
- Asistente de diagnóstico dentro del IDE: con la cuantización Q4_K_M (5,24 GB) puede ejecutarse en la propia estación de trabajo y responder en local, sin enviar código propietario a servicios externos.
- Análisis de fallos intermitentes en sistemas distribuidos: el modelo acepta historial de ejecución y registros de varios servicios en una misma ventana de contexto, lo que permite correlacionar un fallo con eventos previos.
- Generación de informes de post-mortem técnicos: a partir del historial de ejecución y de los tests fallidos, produce una explicación estructurada del fallo y de la corrección aplicada.
- Revisión de refactorizaciones con verificación: se le puede pedir que detecte casos límite (entradas vacías, índices fuera de rango) que la refactorización haya introducido, un patrón presente en los ejemplos de la propia model card.
- Automatización de mantenimiento de dependencias: ante una actualización que rompe tests, el modelo diagnostica si el fallo proviene del cambio de API y propone el ajuste correspondiente.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas de MMLU, HumanEval, GSM8K, SWE-bench ni de ninguna otra suite, y los resultados de la búsqueda web proporcionada no guardan relación con el modelo.

## Requisitos de hardware

Estimaciones de VRAM para inferencia basadas en el tamaño de cada fichero GGUF más el caché KV y el sobrecoste del runtime. Al tratarse de una arquitectura híbrida con atención lineal, el caché KV crece más despacio que en un transformer de atención completa equivalente, pero el reparto exacto de capas no está documentado.

| Cuantizacion | Tamano del fichero | VRAM estimada | GPU de consumo viable |
|---|---|---|---|
| BF16 | 16,69 GB | ~20-22 GB | RTX 4090 24 GB (ajustado), RTX 3090 24 GB |
| Q8_0 | 8,87 GB | ~11-13 GB | RTX 4080 16 GB, RTX 4070 Ti 16 GB, RTX 3060 12 GB (ajustado) |
| Q6_K | 6,85 GB | ~9-10 GB | RTX 4070 12 GB, RTX 3080 10 GB (ajustado) |
| Q5_K_M | 6,02 GB | ~8-9 GB | RTX 3060 12 GB, RTX 4060 Ti 8 GB (ajustado) |
| Q4_K_M | 5,24 GB | ~7-8 GB | RTX 4060 8 GB, RTX 3070 8 GB |
| Q3_K_M | 4,31 GB | ~6 GB | GTX 1660 6 GB, RTX 3050 6 GB |
| Q2_K | 3,56 GB | ~5 GB | GPUs de 4-6 GB o CPU con 8 GB de RAM |

- GPU de centro de datos recomendadas para BF16 o Q8_0 con contexto largo: A100 40/80 GB, H100 80 GB, L40S 48 GB.
- Cabe en GPU de consumo: sí, desde Q4_K_M hacia abajo en tarjetas de 8 GB, y Q5_K_M/Q6_K en tarjetas de 10-12 GB.
- Opciones de despliegue documentadas por el autor: `llama-cli` y `llama-server` (servidor OpenAI-compatible) sobre llama.cpp, Ollama mediante `Modelfile` y LM Studio. La model card también etiqueta el repositorio como `endpoints_compatible`.
- Despliegue con vLLM, TGI o TensorRT-LLM: no disponible en la información proporcionada.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

Comparación con alternativas de tamaño comparable. Los datos de los modelos de la competencia proceden de su documentación pública, no de la información proporcionada en esta ficha.

| Modelo | Parametros | Contexto | Especializacion | Licencia | Disponibilidad en GGUF |
|---|---|---|---|---|---|
| Hayabusa 9B (sizzlebop/hayabusa-9b-GGUF) | ~8,95B | 32.768 (hasta 64K en servicio) | Depuración autónoma y selección de acciones de agente | Apache 2.0 | Sí, 7 cuantizaciones |
| Qwen2.5-Coder-7B-Instruct | ~7,6B | 32.768 nativo | Código y generación de parches | Apache 2.0 (salvo variantes con condiciones adicionales) | Sí |
| Llama 3.1 8B Instruct | ~8,03B | 128.000 | Propósito general con capacidad de código | Llama 3.1 Community License | Sí |
| Gemma 2 9B | ~9,24B | 8.192 | Propósito general | Gemma Terms of Use | Sí |

Hayabusa 9B se diferencia de los tres en que es un ajuste especializado con DPO y RL sobre contextos de depurador, no un modelo de propósito general. Frente a Qwen2.5-Coder-7B-Instruct comparte el enfoque en código, pero Hayabusa añade el contrato de razonamiento explícito en `<think>` y el formato de contexto de depuración. Frente a Llama 3.1 8B y Gemma 2 9B, el contexto nativo de 32.768 tokens es notablemente inferior al de Llama 3.1, aunque superior al de Gemma 2. No hay datos de benchmarks que permitan comparar el rendimiento real de las cuatro opciones.

## Limitaciones y advertencias

- Especialización estrecha: el modelo está diseñado para depuración estructurada y selección de acciones de código, no para chat conversacional general. Su uso fuera de ese dominio probablemente dé resultados pobres.
- Dependencia del contexto: la model card indica que requiere contexto de prompt sistemático (código fuente, registros, errores reproducibles) para dar buenos resultados. Sin ese material, la calidad se degrada.
- Sin soporte de visión: este checkpoint es un ajuste de solo texto y rechaza entradas de imagen.
- Idioma: únicamente inglés. No hay información sobre comportamiento en castellano ni en otros idiomas.
- Riesgo de alucinación: no se han publicado evaluaciones de fidelidad de los diagnósticos ni tasas de alucinación. Un agente que aplique parches generados por el modelo sin supervisión puede introducir regresiones, por lo que se recomienda ejecutar la batería de tests antes de aceptar cualquier corrección.
- Sesgos: no se ha publicado ninguna evaluación de sesgos, toxicidad o comportamiento en dominios sensibles.
- Licencia: Apache 2.0, con la licencia heredada del modelo base `Qwen/Qwen3.5-9B`. La model card no menciona restricciones adicionales, pero conviene verificar el fichero `LICENSE` del repositorio y la licencia del modelo base antes de un despliegue comercial.
- Trazabilidad de la cadena de publicación: este repositorio es una conversión GGUF realizada por un tercero (`sizzlebop`) sobre `georvn7/hayabusa-9b`. Para uso en producción conviene validar las cuantizaciones frente a los pesos originales en safetensors.
- Madurez del modelo: el repositorio registra 0 descargas y 0 "likes" en el momento de la consulta, y el proceso de entrenamiento se describe con volúmenes de datos de alineación muy reducidos (47 filas de DPO y 42 de RL), lo que limita la evidencia disponible sobre su robustez.
- Anclaje del prompt: el formato esperado es ChatML con apertura de `<think>` en el turno del asistente. Un prompt mal formateado puede provocar que el modelo no emita la traza de razonamiento o que genere texto fuera de formato.

## Enlaces

- Repositorio GGUF: https://huggingface.co/sizzlebop/hayabusa-9b-GGUF
- Modelo base del ajuste: https://huggingface.co/georvn7/hayabusa-9b
- Modelo original de partida: https://huggingface.co/Qwen/Qwen3.5-9B
- llama.cpp (herramienta de conversión y runtime): https://github.com/ggml-org/llama.cpp
- Ollama: https://ollama.com
- LM Studio: https://lmstudio.ai

No se han encontrado papers, blogs tecnicos, repositorios adicionales ni demos en los resultados de la busqueda web proporcionada; los resultados devueltos no guardan relacion con el modelo.
