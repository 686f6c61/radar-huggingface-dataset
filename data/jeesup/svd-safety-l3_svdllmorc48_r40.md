# Jeesup/svd-safety-l3_svdllmorc48_r40

## Resumen

`svd-safety-l3_svdllmorc48_r40` es un checkpoint de investigación derivado de `meta-llama/Meta-Llama-3-8B-Instruct`, comprimido mediante SVD-LLM hasta conservar el 60,0 % de los parámetros densos originales (eliminación del 40,00 %). Lo publica el usuario Jeesup como una celda concreta de una malla experimental que estudia cómo la compresión por descomposición en valores singulares degrada el comportamiento de seguridad del modelo y qué regla de selección de componentes lo repara mejor. No es un modelo conversacional de propósito general.

El checkpoint parte de una arquitectura transformer decoder-only de Llama 3 con 8.030.261.248 parámetros (frente a los ~8,03 B del modelo base, dado que la compresión SVD-LLM reduce el rango de las matrices sin cambiar el recuento de tensores de forma trivial). La compresión se realizó con el estimador whitened SVD de los autores de SVD-LLM sobre un conjunto de calibración mixto (utilidad + seguridad), y después se aplicó la etapa 2 de recuperación con LoRA secuencial (U y luego V) sobre alpaca-cleaned.

Su relevancia es metodológica: cuantifica el coste en seguridad de la compresión y sirve como artefacto reproducible para investigar alineamiento bajo restricciones de tamaño. El autor advierte explícitamente que varias celdas de la malla están deliberadamente degradadas en seguridad respecto al modelo base y que debe evaluarse antes de extraer conclusiones.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Llama 3), comprimido con SVD-LLM |
| Parametros totales | 8.030.261.248 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (el modelo base Llama 3 8B Instruct soporta 8.192 tokens, dato no confirmado para este checkpoint) |
| Tipos de cuantizacion | no disponible (pesos en safetensors; el autor no documenta cuantizaciones) |
| Idiomas soportados | no disponible |
| Licencia | Llama 3 Community License |
| Formato de pesos | safetensors (libreria transformers) |

## Arquitectura y entrenamiento

La base es un transformer decoder-only de Llama 3 con 8B parámetros. Sobre ella se aplica SVD-LLM: se descompone cada matriz de pesos mediante SVD blanqueada (`S S^T = sum_WikiText x x^T + sum_safety x x^T`) y se trunca el rango para eliminar el 40,00 % de los parámetros, conservando una fracción resultante de 0,5998. El conjunto de calibración es mixto: 255 ventanas de 2.048 tokens de WikiText-2 train (parte de utilidad, muestreador de SVD-LLM, semilla 42, todas las posiciones) más las primeras 48 de 403 indicaciones de OR-Bench-hard-1k (tóxicas aparentes pero benignas) con las respuestas conformes del propio Llama-3-8B-Instruct (parte de seguridad, 25.213 posiciones). La cuota efectiva de seguridad es de 0,0461 de las posiciones.

Tras el truncado se aplica la etapa 2 de recuperación de SVD-LLM: LoRA secuencial primero sobre U y luego sobre V, con alpaca-cleaned, r=8, alpha=16, 2 épocas, lr 1e-4, batch 64, cutoff 256 y precisión bf16. Semilla 42. No se documenta RLHF ni DPO adicionales más allá del alineamiento heredado del modelo base.

## Capacidades

- Generación de texto conversacional (pipeline `text-generation`), heredada del modelo base.
- Razonamiento y conocimiento general, sujeto a la degradación introducida por la compresión.
- Generación de código y matemáticas (capacidades del modelo base, no verificadas en este checkpoint).
- Tool calling y function calling: no documentado en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no documentado.
- Capacidades multilingües: no documentadas.
- Capacidades especiales (thinking mode, visión, audio): no disponibles.

## Casos de uso

- Investigación sobre seguridad bajo compresión: usar el checkpoint como sujeto experimental para medir cómo varía la tasa de éxito de ataques (ASR) al reducir parámetros, comparándolo con otras celdas de la malla.
- Estudio de reglas de selección de componentes: comparar esta celda (calibración mixta utilidad + seguridad) con variantes de la malla para determinar qué regla repara mejor la seguridad tras SVD.
- Evaluación de recuperación con LoRA: analizar el efecto de la etapa 2 (r=8, alpha=16, alpaca-cleaned) sobre la perplejidad y la seguridad, aislando el impacto del truncado.
- Reproducción de experimentos de interpretabilidad: replicar la calibración con semilla 42 y las ventanas de WikiText-2 para validar resultados publicados.
- Análisis de trade-off utilidad/seguridad: usar las métricas medidas (AdvBench ASR 0,0865, StrongREJECT ASR 0,1565, sobre-rechazo 0,1366, perplejidad 24,69, precisión media zero-shot 0,5025) como referencia cuantitativa en estudios comparativos.
- Docencia y formación: ilustrar en cursos de compresión de modelos los efectos medibles de SVD-LLM sobre alineamiento y calidad, con un artefacto reproducible y licencia conocida.

## Benchmarks y rendimiento

| Metrica | Valor |
|---|---|
| AdvBench ASR (juez HarmBench) | 0,0865 |
| StrongREJECT ASR (juez HarmBench) | 0,1565 |
| Sobre-rechazo macro (WildGuard) | 0,1366 |
| Perplejidad en WikiText-2 | 24,6889 |
| Precisión media zero-shot (7 tareas, acc_norm donde se reporta) | 0,5025 |

No se han publicado resultados de benchmarks comparativos con otros modelos en la información disponible; los datos anteriores son los medidos por el autor para este checkpoint concreto.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16/fp16: aproximadamente 16 GB solo para pesos, más overhead de activaciones y caché KV.
- VRAM en cuantización de 8 bits: ~8 GB; en 4 bits: ~4-5 GB (estimaciones, no documentadas por el autor).
- GPU recomendadas: A100 40/80 GB, H100 para despliegue en producción con throughput alto; RTX 4090 (24 GB) suficiente para bf16 en una sola GPU.
- Cabe en GPU de consumo: sí, en RTX 3090/4090 (24 GB) en bf16; en GPUs de 8-12 GB requiere cuantización.
- Opciones de despliegue: transformers, text-generation-inference (tag `text-generation-inference` y `endpoints_compatible`), vLLM, llama.cpp/Ollama si se generan pesos GGUF (no incluidos en el repo).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| svd-safety-l3_svdllmorc48_r40 | 8,03 B (60 % denso) | no disponible | Llama 3 | Artefacto de investigación, seguridad degradada |
| meta-llama/Meta-Llama-3-8B-Instruct | ~8 B | 8.192 tokens | Llama 3 | Modelo base sin comprimir, referencia de utilidad y seguridad |
| Otras celdas de la malla SVD-LLM del mismo autor | ~8 B (fracciones variables) | no disponible | Llama 3 | Variantes de regla de selección y presupuesto |

No se dispone de datos de benchmarks comparativos frente a modelos de terceros en la información proporcionada.

## Limitaciones y advertencias

- El autor advierte que la compresión por sí sola eleva la tasa de éxito de ataques y que varias celdas de la malla están deliberadamente degradadas en seguridad; este checkpoint no debe tratarse como asistente desplegable.
- Riesgo de alucinación y pérdida de calidad por el truncado SVD (perplejidad en WikiText-2 de 24,69, superior a la del modelo base).
- Sobre-rechazo medido del 0,1366, que puede afectar a la experiencia conversacional.
- Idiomas soportados no documentados; no se garantiza cobertura multilingüe más allá de la del modelo base.
- Licencia Llama 3 Community License: restricciones de uso comercial y obligaciones de atribución; `LICENSE` y `USE_POLICY.md` incluidos en el repositorio.
- No hay información sobre tool calling, agentes ni cuantizaciones publicadas; cualquier uso en producción exige evaluación propia previa.

## Enlaces

- Hugging Face: https://huggingface.co/Jeesup/svd-safety-l3_svdllmorc48_r40
- Modelo base: https://huggingface.co/meta-llama/Meta-Llama-3-8B-Instruct
- Repositorio SVD-LLM de los autores: https://github.com/AIoT-MLSys-Lab/SVD-LLM
- Licencia Llama 3: https://llama.meta.com/llama3/license/
