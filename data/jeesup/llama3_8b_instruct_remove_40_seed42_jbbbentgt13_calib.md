# Jeesup/llama3_8b_instruct_remove_40_seed42_jbbbentgt13_calib

## Resumen

Este checkpoint es una versión comprimida de meta-llama/Meta-Llama-3-8B-Instruct obtenida con el método SVD-LLM (truncamiento por descomposición en valores singulares con calibración), eliminando el 40 % de los parámetros. Lo publica el usuario Jeesup y su interés no está en la compresión en sí, sino en el experimento de calibración: al conjunto de blanqueado de la receta original (WikiText-2) se le añaden 100 comportamientos dañinos de JailbreakBench, renderizados solo como prompt, para comprobar si la selección de componentes singulares condiciona el comportamiento de seguridad del modelo resultante.

El resultado es un artefacto de investigación sobre compresión y alineación, no un modelo listo para producción. Conserva 8.030.261.248 parámetros declarados (idénticos al modelo base) pero con rango efectivo reducido: la fracción de parámetros realizada es 0,5998. Al plegar los factores en formas densas de Llama, ocupa lo mismo en disco (repositorio de 16,1 GB) y carga con `transformers` estándar sin código de modelado a medida.

La arquitectura es la del modelo base: transformer decoder-only con grouped-query attention (GQA), contexto de 8.192 tokens y licencia Llama 3. El atractivo para un investigador es que documenta de forma reproducible el pipeline completo (blanqueado, truncamiento SVD, dos etapas LoRA y fold) con métricas de calidad y de seguridad en el mismo informe.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only con GQA (heredada de Meta-Llama-3-8B-Instruct), checkpoint denso de rango deficiente tras fold `W = U @ V` |
| Parámetros totales | 8.030.261.248 (safetensors); fracción de parámetros realizada: 0,5998 |
| Parámetros activos | No aplica (modelo denso, no es MoE) |
| Longitud de contexto | 8.192 tokens (heredada del modelo base) |
| Tipos de cuantización | No disponible. El repositorio solo contiene safetensors; no se han publicado variantes GGUF, GPTQ ni AWQ |
| Idiomas soportados | No disponible en la model card ni en los metadatos del repositorio |
| Licencia | Llama 3 (Llama 3 Community License) |
| Formato de pesos | safetensors (checkpoint denso con formas Llama estándar) |

## Arquitectura y entrenamiento

La base es Meta-Llama-3-8B-Instruct, un transformer decoder-only con GQA. Sobre él se aplica el método SVD-LLM del repositorio AIoT-MLSys-Lab/SVD-LLM (commit `7538cca98880`), ejecutado con el código de los autores en lugar de una reimplementación. El pipeline es: blanqueado de datos → truncamiento por SVD → LoRA sobre los factores U → merge → LoRA sobre los factores V → merge → fold a un checkpoint denso. La etapa LoRA usa r=8, 2 épocas por factor, learning rate 0,0001 y batch 64 sobre `yahma/alpaca-cleaned`.

La innovación del checkpoint es exclusivamente el conjunto de calibración del blanqueado. La receta publicada usa solo WikiText-2 (255 secuencias, 522.240 tokens); esta celda añade 13 secuencias prompt-only de JBB-Behaviors (26.624 tokens, 100 comportamientos únicos, algunos repetidos como relleno para completar secuencias de 2.048 tokens). El bloque dañino supone el 4,85 % del presupuesto de tokens de blanqueado. El argumento técnico es que el blanqueado factoriza `W S = U Σ V^T` con `S S^T = E[x x^T]`, de modo que la importancia se mide después de dividir por S: las direcciones con poca energía en calibración quedan amplificadas en la base blanqueada y añadir energía en direcciones que WikiText no excita puede alterar el ranking de truncamiento mucho más de lo que sugiere el porcentaje de tokens. Todo lo posterior (truncamiento, ambas etapas LoRA y el fold) es idéntico a la receta publicada.

## Capacidades

- Generación de texto y seguimiento de instrucciones en el formato chat de Llama 3, heredado del modelo base.
- Razonamiento de sentido común y respuesta a preguntas de opción múltiple (ARC, HellaSwag, OpenBookQA, PIQA, WinoGrande), con las cifras degradadas que se detallan en la sección de benchmarks.
- Aritmética y problemas de tipo MathQA a nivel básico (acc_norm 0,2791), muy por debajo del modelo sin comprimir.
- Generación de código: no se han publicado evaluaciones específicas (HumanEval, MBPP) para este checkpoint.
- Tool calling / function calling: no evaluado ni documentado para esta celda.
- Uso agéntico y razonamiento multi-paso: no evaluado; la degradación de calidad en generación abierta hace desaconsejable su uso en pipelines de agentes.
- Capacidades multilingües: no documentadas en la model card.
- Capacidad diferencial: sirve como punto de medida del efecto de incluir prompts dañinos en la calibración de compresión, con métricas de rechazo y de sobrerrechazo publicadas.

## Casos de uso

- Investigación sobre compresión y alineación: reproducir el pipeline SVD-LLM con y sin prompts dañinos en el calibrado de blanqueado y medir el efecto sobre ASR y sobrerrechazo. Es el uso para el que se publicó el checkpoint.
- Auditoría de recetas de compresión: usar las 224 matrices con sus rangos registrados en `whitening_compression.json` para estudiar qué capas absorben más truncamiento y cómo varía con la calibración.
- Estudio de sobre-rechazo en modelos comprimidos: comparar la tasa macro de sobrerrechazo (0,1343) con la del modelo base y con la celda de control WikiText-only cuando esté disponible en el mismo entorno.
- Evaluación de robustez frente a jailbreak: emplear las métricas HarmBench (ASR 0,1385 en AdvBench y 0,1534 en StrongREJECT) como línea base para estudiar si el truncamiento SVD altera la frontera de rechazo.
- Docencia y divulgación técnica: ejemplo reproducible de cómo una fracción pequeña de tokens de calibración puede modificar un ranking de importancia tras un blanqueado.
- Validación de herramientas de evaluación: el autor documenta que los dos stacks de evaluación coinciden con el modelo sin comprimir hasta cuatro decimales, lo que permite usarlo como caso de prueba de pipelines de benchmarking.
- No recomendado como modelo de servicio: la propia model card advierte de la degradación en prompts generativos benignos.

## Benchmarks y rendimiento

| Métrica | Valor |
|---|---:|
| Fracción de parámetros retenida | 0,5998 |
| Perplejidad en WikiText-2 | 22,8785 |
| ARC-Easy (acc_norm) | 0,5825 |
| ARC-Challenge (acc_norm) | 0,3541 |
| HellaSwag (acc_norm) | 0,5734 |
| WinoGrande (acc) | 0,6377 |
| OpenBookQA (acc_norm) | 0,3740 |
| PIQA (acc_norm) | 0,7029 |
| MathQA (acc_norm) | 0,2791 |
| Media zero-shot | 0,5005 |
| AdvBench HarmBench ASR | 0,1385 |
| StrongREJECT HarmBench ASR | 0,1534 |
| Tasa de rechazo en AdvBench (por palabra clave) | 0,6827 |
| Tasa de rechazo en control benigno (por palabra clave) | 0,0000 |
| Sobre-rechazo en XSTest-safe | 0,1325 |
| Sobre-rechazo en OR-Bench-Hard-1K | 0,1361 |
| Sobre-rechazo macro | 0,1343 |

Metodología declarada: perplejidad en WikiText-2; evaluaciones zero-shot de ARC-Easy/Challenge, HellaSwag, WinoGrande, OpenBookQA, PIQA y MathQA; generación en AdvBench y StrongREJECT juzgada con `cais/HarmBench-Llama-2-13b-cls`; sobrerrechazo en XSTest-safe y OR-Bench-Hard-1K juzgado con `allenai/wildguard`. Toda la generación usa la plantilla chat en modo greedy. La fracción evaluada es 1,00 en XSTest-safe y 0,99 en OR-Bench-Hard-1K, por lo que el juicio de sobrerrechazo se considera fiable para esta celda.

No se han publicado resultados comparativos frente al modelo base en la información disponible, más allá de la afirmación cualitativa de que los dos stacks de evaluación coinciden con el modelo sin comprimir hasta cuatro decimales.

## Requisitos de hardware

- VRAM en BF16: aproximadamente 16 GB solo para pesos, más caché KV para los 8.192 tokens de contexto; presupuestar 20-24 GB para lotes pequeños.
- VRAM en 8 bits: en torno a 9-10 GB de pesos, viable en tarjetas de 16 GB (RTX 4080, A4000, L4).
- VRAM en 4 bits: en torno a 5-6 GB de pesos, cabe en GPU de consumo de 8 GB (RTX 3060 Ti, RTX 4060 Ti) si se convierte previamente a GGUF o se cuantiza con bitsandbytes.
- GPU recomendadas para BF16: A100 40/80 GB, H100, L40S, RTX 4090 (24 GB) y RTX 3090 (24 GB).
- Despliegue: al ser un checkpoint denso con formas Llama estándar, carga directamente en `transformers` y es compatible con vLLM y TGI sin código a medida. llama.cpp y Ollama exigen una conversión a GGUF que el autor no ha publicado.
- Latencia y throughput: no disponibles. No se han publicado mediciones de tokens por segundo ni de latencia en la model card.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Rendimiento |
|---|---|---|---|---|---|
| Este checkpoint (SVD-LLM 40 %, calibrado con JBB) | 8,03 B declarados, rango efectivo 0,5998 | 8.192 | Llama 3 | HuggingFace, safetensors | Media zero-shot 0,5005; ppl WikiText-2 22,8785 |
| Meta-Llama-3-8B-Instruct (modelo base) | 8,03 B | 8.192 | Llama 3 | HuggingFace, safetensors | No disponible en esta ficha |
| Celda de control equivalente comprimida al 40 % con solo WikiText-2 | 8,03 B, mismo ratio y semilla | 8.192 | Llama 3 | No se ha identificado repositorio público en la información disponible | No disponible; el autor indica que la comparación se hizo en otra ejecución y con otro hardware |
| Otros modelos de la misma categoría (p. ej. Mistral-7B-Instruct, Llama-3.1-8B-Instruct) | No disponible en la información proporcionada | No disponible | No disponible | No disponible | No disponible |

La comparación relevante para entender este checkpoint es frente a su base y frente a la celda de control WikiText-only; el autor reconoce explícitamente que esta última no se ha construido todavía en el mismo entorno, lo que limita la atribución causal del efecto observado.

## Limitaciones y advertencias

- La compresión al 60 % degrada la calidad de generación. La model card señala que las generaciones ante prompts dañinos son en gran medida coherentes, pero que la salida en prompts generativos benignos (el conjunto de control es mayoritariamente del tipo «escribe un script que…») se degrada de forma notable.
- Las métricas de seguridad obtenidas sobre un modelo degenerado no son evidencia sobre la alineación del modelo original. El propio autor pide leer las tasas de sobrerrechazo y las líneas de fiabilidad junto al ASR.
- Falta un control en el mismo entorno: la comparación con la celda WikiText-only se hizo en otra ejecución y sobre otro hardware. Los dos stacks de evaluación coinciden con el modelo sin comprimir hasta cuatro decimales, pero no hay control equivalente construido aún.
- El modelo es de rango deficiente, no más pequeño en disco: los factores se pliegan a formas densas Llama, así que el repositorio ocupa 16,1 GB y el ahorro es de cómputo efectivo, no de almacenamiento ni de VRAM en BF16.
- Tasa de sobrerrechazo macro del 13,43 %, con 13,25 % en XSTest-safe y 13,61 % en OR-Bench-Hard-1K: relevante si se pretendiera usar como asistente conversacional.
- Tasa de rechazo en el control benigno del 0,00 %, coherente con un modelo que responde a todo, incluido contenido que debería filtrar; no debe interpretarse como ausencia de sesgos.
- No hay información sobre idiomas soportados ni evaluación multilingüe de esta celda; no debe asumirse el perfil multilingüe del modelo base sin verificarlo.
- Licencia Llama 3: uso comercial permitido con condiciones, incluida la obligación de mostrar «Built with Meta Llama 3», restricciones de nomenclatura y una cláusula de cesación si el producto supera los 700 millones de usuarios activos mensuales. Requiere revisión legal antes de cualquier despliegue comercial.
- Riesgo de alucinación: no evaluado específicamente; la perplejidad de 22,8785 en WikiText-2 frente a valores típicamente inferiores en el modelo sin comprimir sugiere mayor propensión a salidas incoherentes.
- Sin resultados de HumanEval, MBPP ni evaluaciones de tool calling: no debe asumirse competencia en código o en uso de herramientas a partir del comportamiento del modelo base.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Jeesup/llama3_8b_instruct_remove_40_seed42_jbbbentgt13_calib
- Modelo base: https://huggingface.co/meta-llama/Meta-Llama-3-8B-Instruct
- Implementación de referencia SVD-LLM (commit `7538cca98880`): https://github.com/AIoT-MLSys-Lab/SVD-LLM
- Dataset de calibración JailbreakBench JBB-Behaviors: https://huggingface.co/datasets/JailbreakBench/JBB-Behaviors
- Dataset de la etapa LoRA: https://huggingface.co/datasets/yahma/alpaca-cleaned
- Clasificador HarmBench usado en la evaluación: https://huggingface.co/cais/HarmBench-Llama-2-13b-cls
- Juez de sobrerrechazo: https://huggingface.co/allenai/wildguard
- Artefactos del build (`whitening_compression.json`, `build_manifest.json`): incluidos en el repositorio del modelo
