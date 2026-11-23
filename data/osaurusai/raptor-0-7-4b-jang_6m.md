# OsaurusAI/Raptor-0.7-4B-JANG_6M

## Resumen

Raptor 0.7 4B es un modelo de lenguaje de 4.112 millones de parámetros (~4,1B) desarrollado por OsaurusAI, especializado en uso de herramientas y razonamiento agéntico dentro del entorno Osaurus sobre Apple Silicon. Se trata de un fine-tune LoRA de Spark-X2.6-4B (del equipo SparkLLM, licencia Apache-2.0) con los pesos fusionados, orientado a la superficie de herramientas de Osaurus: gestión de ficheros, hojas de cálculo y PDF, sandbox y shell, calculadora, delegación y flujos de trabajo.

La ficha corresponde concretamente al bundle de cuantización JANG_6M, que mantiene atención y embeddings atados en 8 bits, el MLP en 6 bits con tamaño de grupo 64 y escalas en bfloat16, además de conservar la compuerta de atención por cabeza en precisión completa. El resultado ocupa 3,41 GiB (7,126 bits por peso) frente a los 7,66 GiB del BF16 original, lo que lo hace viable en equipos Apple Silicon con memoria unificada moderada.

El modelo es relevante porque combina tres modos de razonamiento (high por defecto, low y off) con soporte de tool calling multi-turno, y porque su cuantización ha sido calibrada y validada contra los propios pesos BF16 con métricas de divergencia KL sobre tokens del asistente, algo poco habitual en cuantizaciones de este tamaño. La licencia Apache-2.0 permite uso comercial sin restricciones adicionales.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer (fine-tune LoRA de Spark-X2.6-4B, pesos fusionados); detalles internos de la arquitectura base no disponibles |
| Parámetros totales | 4.112.079.360 (~4,1B) |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | JANG_6M: atención y embedding atado a 8 bits, MLP a 6 bits, grupo de 64, escalas en bfloat16, compuerta de atención por cabeza en precisión completa; media de 7,126 bits por peso |
| Idiomas soportados | en (inglés) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (librería MLX); repo de 3,7 GB, bundle de 3,41 GiB |

## Arquitectura y entrenamiento

El modelo es un fine-tune LoRA de Spark-X2.6-4B con los adaptadores fusionados en los pesos, por lo que se distribuye como un modelo denso de ~4,1B parámetros. La información disponible no detalla la arquitectura interna de la base (número de capas, dimensiones, mecanismo de atención más allá de la compuerta por cabeza mencionada en la cuantización), ni el volumen total de tokens de entrenamiento del fine-tune. El ajuste está orientado específicamente a la superficie de herramientas de Osaurus y a tres modos de razonamiento: high (por defecto, razonamiento extenso), low (razonamiento corto) y off (sin razonamiento, mediante `enable_thinking: false`).

La innovación técnica destacable está en el proceso de cuantización. Se calibró con una captura de 7,60M tokens procesados a través de la propia plantilla de chat del modelo, cubriendo cada dominio en los modos de razonamiento low y high además de reasoning-off: trayectorias agénticas de Osaurus, trayectorias de flujos de trabajo (orquestador, arquitecto, configurador, lector de importación y ejecutor de pasos), respuestas muestreadas del propio modelo (1,44M tokens), finanzas (tablas de informes anuales y filings 10-K), edición de documentos y PDF largos, sesiones de terminal, código en 11 lenguajes, matemáticas y ciencia, y chat multilingüe y texto enciclopédico. GPTQ se ejecuta sobre la covarianza completa de entrada de cada capa lineal cuantizada, y la matriz de importancia es su diagonal. Se construyó y midió también una variante con plegado AWQ, pero quedó dentro del ruido con mayor KL, por lo que se descartó.

## Capacidades

- Generación de texto conversacional con plantilla de chat propia y modos de razonamiento configurables (high, low, off).
- Razonamiento multi-paso con trazas de pensamiento (`<think>`) activadas por defecto en esfuerzo high.
- Tool calling / function calling con formato específico: `<tool_call>NAME<arg_key>k</arg_key><arg_value>v</arg_value></tool_call>`, sin saltos de línea.
- Uso de herramientas multi-turno en los tres modos de razonamiento, con resultados de herramienta en bloques `<|Tool|>` y fusión de mensajes de herramienta consecutivos.
- Superficie de herramientas Osaurus: ficheros, hojas de cálculo y PDF, sandbox y shell, calculadora, delegación y flujos de trabajo (orquestación, configuración, importación y edición de definiciones).
- Agentes y razonamiento multi-paso orientado a tareas de terminal y edición de documentos.
- Capacidades de código en 11 lenguajes según la composición de calibración (no se especifica si el entrenamiento cubre los mismos).
- Capacidades multilingües limitadas: el modelo declara únicamente inglés (`en`), aunque la calibración incluyó chat multilingüe.
- No se ha documentado soporte de visión, audio ni otras modalidades.

## Casos de uso

- Agente local en Apple Silicon: el bundle de 3,41 GiB permite ejecutar un agente con tool calling en un Mac con memoria unificada moderada, usando los modos de razonamiento para equilibrar latencia y calidad según la tarea.
- Automatización de ficheros y documentos: el modelo está ajustado para operar sobre ficheros, hojas de cálculo y PDF, de modo que puede integrarse en flujos que leen, editan y generan documentos dentro de un harness con aprobación humana para acciones destructivas.
- Ejecución de comandos en sandbox y shell: con el bloque `<|Tool|>` y el formato de tool call definido, puede encadenar comandos de terminal y procesar sus resultados en conversaciones multi-turno.
- Orquestación de flujos de trabajo Osaurus: las trayectorias de calibración incluyen orquestador, arquitecto, configurador, lector de importación y ejecutor de pasos, por lo que es adecuado para configurar, importar y reparar definiciones de workflow.
- Asistencia financiera documental: la calibración cubre tablas de informes anuales y filings 10-K, lo que lo hace utilizable para extracción y razonamiento sobre documentación financiera estructurada, siempre con verificación humana por el riesgo de errores aritméticos y de recall.
- Delegación entre agentes: el ajuste incluye la herramienta de delegación de Osaurus, lo que permite usarlo como subagente al que un orquestador deriva tareas concretas con contexto acotado.
- Chat con razonamiento desactivable: para aplicaciones de conversación de baja latencia, el modo `enable_thinking: false` elimina la traza de razonamiento y reduce tokens generados, útil en atención al usuario o asistentes embebidos.

## Benchmarks y rendimiento

La model card de este bundle no publica benchmarks de tareas (MMLU, HumanEval, GSM8K u otros); indica que los resultados del modelo están en la card del BF16 de origen y que se midieron a una cuantización equivalente a JANG_6M. Los datos disponibles son métricas de fidelidad de la cuantización y de rendimiento de inferencia:

| Métrica | Este bundle (GPTQ + imatrix) | BF16 origen |
|---|---:|---:|
| KL media (todos los held-out, 90.309 tokens puntuados) | 0,00622 | referencia |
| Top-1 agreement (todos los held-out) | 98,36% | referencia |
| KL media, reasoning high | 0,00118 | referencia |
| Top-1 agreement, reasoning high | 98,58% | referencia |
| KL media, reasoning low | 0,00105 | referencia |
| Top-1 agreement, reasoning low | 98,79% | referencia |
| KL media, reasoning off | 0,00139 | referencia |
| Top-1 agreement, reasoning off | 99,00% | referencia |
| KL media, solo tareas agente y workflow Osaurus | 0,00107 | referencia |
| Top-1 agreement, solo tareas agente y workflow Osaurus | 98,85% | referencia |
| Tamaño | 3,41 GiB (7,126 bits/peso) | 7,66 GiB |
| Decode | 148 tok/s | 93 tok/s |
| Prefill (prompt de 512 tokens) | 8.850 tok/s | 10.479 tok/s |

La variante con plegado AWQ adicional midió KL media de 0,00654 y top-1 agreement de 98,45% en el conjunto completo, dentro del ruido pero con mayor KL, por lo que no se adoptó. Las puertas de comportamiento pasan 8/8, igual que el BF16: parada en EOS, thinking on/off, forma y parseo de tool call, conversaciones multi-turno y cambios de herramienta a mitad de conversación. Las mediciones de rendimiento se realizaron en un Mac Studio (M5 Ultra) con prompt de 512 tokens y 128 tokens generados.

## Requisitos de hardware

- VRAM/memoria estimada: 3,41 GiB para los pesos en JANG_6M; el BF16 equivalente requiere 7,66 GiB.
- Hardware objetivo: Apple Silicon con MLX; el autor reporta mediciones en un Mac Studio con M5 Ultra.
- No está pensado para GPU NVIDIA: el formato es MLX safetensors, no GGUF ni GPTQ estándar de CUDA.
- Despliegue: runtime Osaurus 0.25.33 o superior; la librería declarada es `mlx`.
- Rendimiento medido: 148 tok/s de decode y 8.850 tok/s de prefill con prompt de 512 tokens en M5 Ultra.
- No se dispone de estimaciones de latencia ni throughput para otros chips Apple (M1, M2, M3, M4) en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato / runtime | Notas |
|---|---|---|---|---|---|
| Raptor-0.7-4B-JANG_6M | ~4,1B | no disponible | Apache-2.0 | MLX safetensors, Osaurus | Cuantización 6/8 bits validada con KL; agente y tool use |
| Raptor-0.7-4B-BF16 | ~4,1B | no disponible | Apache-2.0 | safetensors | Modelo fuente sin cuantizar; 7,66 GiB; benchmarks publicados en su card |
| Spark-X2.6-4B | ~4B (según nombre) | no disponible | Apache-2.0 | no disponible | Modelo base del que deriva Raptor 0.7 |

No se dispone de datos de benchmarks de tareas para establecer comparaciones de rendimiento con alternativas de la misma categoría; la información proporcionada no incluye modelos comparables adicionales.

## Limitaciones y advertencias

- Es un modelo de 4B y comete errores: nombres de herramienta incorrectos, fallos de esquema y JSON, afirmaciones de éxito no verificadas, identificadores inventados y errores aritméticos y de recall.
- Debe mantenerse el paso de aprobación del harness para acciones destructivas; el modelo no es fiable como única barrera de seguridad.
- Limitaciones conocidas del modelo base (recuperación de errores y diseño de flujos de trabajo completos desde cero) están documentadas en la card del BF16.
- El modelo declara únicamente inglés; el rendimiento en otros idiomas no está garantizado pese a la calibración multilingüe.
- El contexto máximo no está documentado en la información disponible, lo que impide planificar cargas de documentos largos con garantías.
- El cambio del conjunto de herramientas provoca un re-prefill completo, no un append de sufijo, porque las herramientas se renderizan en el primer bloque de sistema; esto afecta a la latencia en agentes con herramientas dinámicas.
- `generation_config.json` incluye la clave no estándar `max_tokens` del modelo base; es necesario pasar un límite propio.
- El formato de pesos es MLX, por lo que no es desplegable directamente en vLLM, TGI o llama.cpp sin conversión.
- Licencia Apache-2.0: permite uso comercial, pero se heredan las obligaciones de atribución y aviso de la licencia del modelo base Spark-X2.6-4B.

## Enlaces

- Hugging Face (este bundle): https://huggingface.co/OsaurusAI/Raptor-0.7-4B-JANG_6M
- Modelo base BF16: https://huggingface.co/OsaurusAI/Raptor-0.7-4B-BF16
- Modelo original Spark-X2.6-4B: https://huggingface.co/XHToken/Spark-X2.6-4B
- Sitio de Osaurus AI: https://osaurus.ai
