# frankleaf/OTC-Qwen3.8-27B-CPO-GRPO

## Resumen

OTC-Qwen3.8-27B-CPO-GRPO es un ajuste fino del modelo Qwen3.8-27B de Qwen, publicado por el desarrollador independiente frankleaf el 30 de octubre de 2026. El proyecto, denominado OTC, aborda un problema concreto de los modelos de razonamiento: la verbosidad excesiva de las cadenas de pensamiento (thinking) al resolver problemas de matemáticas y de código. Para reducirlo, el autor combina dos señales de aprendizaje por refuerzo: CPO (Context Preference Optimization) sobre pares de respuestas donde la correcta es más corta, y GRPO (Group Relative Policy Optimization) que recompensa la corrección de la respuesta y penaliza longitudes de razonamiento innecesarias.

Los resultados declarados por el autor muestran mejoras simultáneas en precisión y concisión: la precisión en matemáticas sube del 50,75 % al 57,25 % y en código del 19,15 % al 33,78 %, mientras la longitud media de salida se reduce un 33,6 % en matemáticas y un 26,3 % en código. El modelo se publica como un checkpoint completo fusionado en BF16 (unos 55 GB), con licencia Apache-2.0, y conserva las capacidades multimodales image-text-to-text de la familia Qwen3.8.

Es relevante porque demuestra, con datos y código de entrenamiento públicos, que es posible comprimir el razonamiento sin sacrificar —y de hecho mejorando— la tasa de acierto, un tema de gran interés actual para reducir costes de inferencia en modelos razonadores.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3_5ForConditionalGeneration (familia Qwen3.8, image-text-to-text), ajuste fino con LoRA fusionado |
| Parametros totales | 27.356.728.560 (~27,4 B) |
| Parametros activos | no disponible (no se declara si es MoE) |
| Longitud de contexto | no disponible (generación máxima evaluada: 32.768 tokens) |
| Tipos de cuantizacion | BF16 (único formato publicado) |
| Idiomas soportados | inglés (en), chino (zh) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (BF16, ~54,7 GB) |

## Arquitectura y entrenamiento

El modelo parte del checkpoint histórico CPO cp90 sobre Qwen3.8-27B y aplica un entrenamiento conjunto CPO + GRPO mediante LoRA (rank 64, alpha 128, dropout 0) fusionado posteriormente en el modelo base. La fase CPO utiliza 4.552 pares de respuestas preferidas que cubren 2.348 problemas distintos; en cada par, el razonamiento de la respuesta preferida (más corta) es al menos 1,2 veces más corto que el de la rechazada. La fase GRPO es online: usa 124 problemas, genera 8 respuestas por problema y aplica una recompensa que verifica primero corrección de la respuesta y formato, y después puntúa la longitud del razonamiento para incentivar soluciones con menos tokens.

El entrenamiento constó de 144 pasos de actualización con learning rate 1e-4, planificación cosine y warmup de 8 pasos, sobre 8 GPU H100 (4 para entrenamiento con BF16, ZeRO-3, offload a CPU, gradient checkpointing y cálculo por bloques de la capa de salida; 4 para inferencia con vLLM en TP4, sincronizando pesos durante el proceso). El código de los problemas se ejecuta en entornos aislados. La longitud máxima de generación durante entrenamiento y evaluación fue de 32.768 tokens. El entorno usado fue Transformers 5.17.0, PEFT 0.20.0, TRL 1.13.0, vLLM 0.31.0 y PyTorch 2.13.0. La fusión del LoRA se verificó numéricamente sobre los 256 tensores objetivo, y una auditoría de aislamiento de datos confirmó cero solapamiento entre problemas de entrenamiento y de evaluación.

## Capacidades

- Generación de texto conversacional con modo de razonamiento (thinking) activable mediante `enable_thinking=True` en la plantilla de chat.
- Resolución de problemas de matemáticas con respuestas en formato `\boxed{}`.
- Generación y resolución de problemas de código (evaluados con ejecución en entorno aislado).
- Razonamiento comprimido: produce cadenas de pensamiento notablemente más cortas que el modelo base, con la misma o mayor tasa de acierto.
- Capacidades image-text-to-text heredadas de la arquitectura Qwen3.8 (entrada de imagen y texto), aunque la model card no documenta esta faceta.
- Soporte de idiomas inglés y chino.
- No se documenta soporte de tool calling, function calling ni capacidades de agentes en la información disponible.

## Casos de uso

- Resolución de problemas matemáticos con bajo coste de tokens: el modelo resuelve ejercicios de álgebra y teoría de números con respuestas en `\boxed{}`, reduciendo el razonamiento medio de 11.643 a 7.736 tokens, lo que abarata la inferencia en pipelines de evaluación educativa.
- Generación y depuración de código: con una mejora de precisión del 19,15 % al 33,78 % en tareas de código, es adecuado para asistentes de programación donde el coste por token de razonamiento importa.
- Agentes de razonamiento con presupuesto de tokens limitado: al acortar las cadenas de pensamiento, cabe más contexto útil por llamada en sistemas multi-paso con ventanas de coste restringidas.
- Investigación en compresión de razonamiento: el repositorio incluye configuraciones de entrenamiento, código de implementación y métricas por muestra, lo que lo hace útil como referencia reproducible para estudiar CPO + GRPO.
- Despliegue autoservicio en infraestructura propia: al publicarse en BF16 completo y con licencia Apache-2.0, puede integrarse en servicios internos sin restricciones comerciales.
- Comparación de técnicas de RL para razonamiento: sirve de baseline para experimentos que comparen GRPO frente a otras estrategias de optimización de longitud de salida.

## Benchmarks y rendimiento

No hay resultados de benchmarks estandarizados (MMLU, HumanEval, GSM8K, etc.) en la model card. Los únicos datos disponibles son la evaluación propia del autor sobre 97 problemas retenidos (50 de matemáticas, 47 de código), con 8 generaciones por problema y máximo 32.768 tokens de salida, comparando contra el checkpoint de partida (cp90):

| Metrica | Antes del entrenamiento (cp90) | Despues del entrenamiento |
|---|---:|---:|
| Precision en matematicas | 50,75 % | 57,25 % |
| Precision en codigo | 19,15 % | 33,78 % |
| Longitud media de salida (matematicas) | 11.643 tokens | 7.736 tokens |
| Longitud media de salida (codigo) | 23.485 tokens | 17.298 tokens |

Datos adicionales declarados: en los 32 problemas de matemáticas resueltos antes y después, 29 vieron reducido su razonamiento, con una mediana de reducción por problema del 20,5 %. Casos extremos: el problema `omni/1` (hard) pasó de 18.378 a 6.402 tokens de razonamiento (−65,16 %) y de 3/8 a 5/8 aciertos; `omni/7` (hard) de 7.254 a 2.893 tokens (−60,12 %) y de 3/8 a 7/8 aciertos.

## Requisitos de hardware

- VRAM estimada para inferencia: al tratarse de un modelo de ~27,4 B de parámetros en BF16 (~55 GB), se necesitan al menos 3 GPU de 24 GB (con paralelismo de tensores) o 2 GPU de 48 GB; en una sola GPU se requeriría 80 GB (A100/H100) sin cuantizar.
- GPU recomendadas: A100 u H100 de 80 GB para despliegue cómodo en BF16; configuraciones multi-GPU con RTX 3090/4090 (24 GB) son viables con tensor parallelism y sin cuantización adicional.
- No cabe en una única GPU de consumo en BF16; sería necesario aplicar cuantización (no publicada oficialmente para este repositorio) o repartir el modelo entre varias GPU.
- Opciones de despliegue: Transformers (clase `Qwen3_5ForConditionalGeneration`, ejemplo incluido en la model card) y vLLM (versión 0.31.0 usada por el autor, con tensor parallelism). No se menciona soporte en llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles. Como referencia indirecta, el autor usó 4 H100 con vLLM TP4 para la generación online durante el entrenamiento.

## Comparativa con modelos similares

| Modelo | Parametros | Formato | Precision declarada | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| OTC-Qwen3.8-27B-CPO-GRPO | 27,4 B | BF16 (safetensors) | 57,25 % mat., 33,78 % cod. (eval propia, 97 problemas) | Apache-2.0 | HF, pesos completos |
| Qwen/Qwen3.8-27B (modelo base) | ~27 B | no disponible | no disponible | no disponible | HF |
| Checkpoint cp90 (punto de partida) | ~27 B | no disponible | 50,75 % mat., 19,15 % cod. (eval propia) | no disponible | no publicado como repositorio independiente |

No se conocen modelos comparables de terceros con evaluaciones directamente equiparables en la información disponible; las comparaciones de precisión solo son válidas frente a su propio checkpoint de partida, bajo el mismo protocolo de evaluación.

## Limitaciones y advertencias

- Los resultados de precisión y compresión proceden exclusivamente de la evaluación del propio autor sobre 97 problemas retenidos; no existen benchmarks independientes ni estandarizados que los confirmen.
- El conjunto de evaluación es pequeño (97 problemas, 1.552 generaciones en total), por lo que las diferencias de precisión pueden tener un margen de error considerable.
- Sesgos conocidos: no documentados en la model card; al derivar de Qwen3.8-27B, hereda presumiblemente los sesgos de sus datos de entrenamiento, no detallados aquí.
- Riesgo de alucinación: no evaluado explícitamente; la recompensa de GRPO verifica corrección de respuestas en dominios cerrados (matemáticas y código), pero no hay garantías para tareas abiertas.
- Idiomas limitados a inglés y chino según los tags; el rendimiento en castellano no está evaluado.
- Solo se publica BF16 (~55 GB), lo que limita su uso en hardware de consumo sin cuantización propia.
- Las capacidades multimodales (image-text-to-text) se infieren de la arquitectura base pero no están documentadas ni evaluadas en esta versión.
- Licencia Apache-2.0: sin restricciones de uso comercial, aunque conviene revisar los términos de licencia del modelo upstream Qwen3.8-27B.
- La longitud de contexto máxima del modelo no está declarada; solo se sabe que las evaluaciones usaron hasta 32.768 tokens de generación.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/frankleaf/OTC-Qwen3.8-27B-CPO-GRPO
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Registro de evaluación por muestra: https://huggingface.co/frankleaf/OTC-Qwen3.8-27B-CPO-GRPO/blob/main/evaluation/co-solved-compression.json
- Configuración de entrenamiento: https://huggingface.co/frankleaf/OTC-Qwen3.8-27B-CPO-GRPO/blob/main/training/config.json
- Código de implementación: https://huggingface.co/frankleaf/OTC-Qwen3.8-27B-CPO-GRPO/blob/main/code/README.md
- Auditoría de aislamiento de datos: https://huggingface.co/frankleaf/OTC-Qwen3.8-27B-CPO-GRPO/blob/main/evaluation/data-isolation-audit.json
- Registro de procedencia de la publicación: https://huggingface.co/frankleaf/OTC-Qwen3.8-27B-CPO-GRPO/blob/main/training/release-provenance.json
- Verificación de la fusión LoRA: https://huggingface.co/frankleaf/OTC-Qwen3.8-27B-CPO-GRPO/blob/main/training/merge-verification.json
