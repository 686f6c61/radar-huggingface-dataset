# GALXAI/GALX-Titan-27B-Firewall

## Resumen

GALX-Titan-27B-Firewall es un modelo de lenguaje especializado desarrollado por GALXAI, diseñado para actuar como un firewall de ejecución de agentes y una puerta de verificación a nivel de modelo. A diferencia de los chatbots convencionales, su propósito es inspeccionar comandos shell propuestos, diffs de archivos a nivel de AST e invocaciones de herramientas, y razonar paso a paso en etiquetas `<thought>...</thought>` antes de emitir un veredicto. El modelo se basa en Qwen/Qwen3.8-27B-FP8 y aplica adaptadores LoRA/DoRA sobre el modelo base, lo que explica el tamaño de repositorio de 6.4 GB (los adaptadores, no los pesos completos). Está entrenado con técnicas GRPO y SimPO, y optimizado para GPUs Hopper (H100, H200, B200) con kernels Triton y Liger Kernel. Su relevancia radica en el creciente despliegue de agentes autónomos en entornos de confianza cero (zero-trust), donde se necesita una capa de verificación que impida acciones maliciosas o errores críticos.

La arquitectura subyacente es un transformer causal de 27 mil millones de parámetros en precisión FP8, con soporte para cuantización de pesos y activaciones (w8a8). El modelo está pensado para tareas de razonamiento, generación y verificación de código, así como para control de sistemas y navegación web. Sus benchmarks oficiales, aunque declarados por el autor, muestran un rendimiento destacado en tareas de ingeniería de software, resolución de bugs y razonamiento matemático.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer causal (basado en Qwen/Qwen3.8-27B-FP8) con adaptadores LoRA/DoRA |
| Parámetros totales | 27 mil millones (modelo base) |
| Parámetros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | FP8 (pesos y activaciones w8a8) |
| Idiomas soportados | Inglés, chino |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptadores sobre modelo base FP8) |

## Arquitectura y entrenamiento

GALX-Titan-27B-Firewall se construye sobre el modelo base Qwen/Qwen3.8-27B-FP8, un transformer causal de 27 mil millones de parámetros. En lugar de publicar los pesos completos, el repositorio contiene adaptadores LoRA/DoRA que se cargan sobre el modelo base. Esta elección reduce drásticamente el tamaño del repositorio (6.4 GB) y permite un ajuste fino eficiente. El entrenamiento combina técnicas de optimización por preferencia como GRPO y SimPO, lo que sugiere un enfoque de RLHF orientado a mejorar la verificación y el razonamiento paso a paso. El uso de Liger Kernel y kernels Triton optimizados para arquitectura Hopper (H100, H200, B200) indica un esfuerzo por maximizar el rendimiento en inferencia con baja latencia. El modelo está diseñado explícitamente para actuar como un firewall de ejecución en tiempo real para agentes autónomos, inspeccionando comandos, diffs de AST y llamadas a herramientas. La etiqueta "anti-benchmaxxing" sugiere que se ha puesto énfasis en evitar el sobreajuste a benchmarks específicos, priorizando la generalización en entornos de seguridad reales.

## Capacidades

- Generación de código y verificación: alcanza un Pass@1 de 92.4 en LiveCodeBench v6 y 90.5 en EvalPlus (HumanEval+) con fuzzing adversarial.
- Razonamiento matemático avanzado: 96.8 en GSM8K, 95.6 en GSM-Symbolic y 75.2 en MATH-500.
- Razonamiento científico: 90.8 en GPQA Diamond.
- Control de sistemas operativos: 86.0 de tasa de finalización en OSWorld-Verified y 83.4 en AndroidWorld.
- Navegación web automatizada: 66.5 en WebArena-Verified.
- Razonamiento visual y documentos: los benchmarks de MathVision (95.4) y OmniDocBench 1.5 (92.0) sugieren que el modelo puede procesar contenido visual y documentos densos, aunque el pipeline declarado sea text-generation.
- Verificación de propiedades adversariales: 88.0 en MuTAP (tasa de eliminación de mutantes).
- Seguimiento estricto de instrucciones: 81.2 en IFBench.
- Soporte de tool calling y frameworks de agentes: compatible con vLLM, SGLang y Text Generation Inference.
- Razonamiento paso a paso en etiquetas `<thought>...</thought>`, lo que permite auditar el proceso de decisión.

## Casos de uso

1. Firewall de ejecución para agentes autónomos: el modelo inspecciona comandos shell propuestos, diffs de archivos a nivel de AST e invocaciones de herramientas, y decide si permitirlos o bloquearlos. Es adecuado para entornos de confianza cero donde se necesita una capa de verificación antes de ejecutar acciones críticas.

2. Revisión de código y detección de bugs: con un Resolve Rate de 64.2 en SWE-bench Pro y 81.5 en QwenSWEBench, puede integrarse en pipelines de CI/CD para detectar y corregir errores de forma autónoma en repositorios de gran escala.

3. Automatización de terminal y operaciones de sistema: gracias a su 75.8 de Pass Rate en Terminal Bench 2.1, puede ejecutar tareas de administración de sistemas, resolución de problemas interactivos y gestión de entornos Linux/Windows.

4. Control de dispositivos y navegación web: con tasas de finalización del 86.0 en OSWorld y 66.5 en WebArena, puede operar navegadores, aplicaciones de escritorio y sistemas móviles para tareas de QA automatizado o asistencia técnica.

5. Generación de código competitivo: el 92.4 en LiveCodeBench v6 lo hace útil para generar soluciones en concursos de programación o para sintetizar implementaciones de alto rendimiento en entornos de producción.

6. Análisis de documentos y extracción de información: con un F1 de 92.0 en OmniDocBench 1.5, puede procesar documentos densos, extraer estructura y contenido, lo que resulta útil en flujos de trabajo de RAG o automatización de back-office.

7. Verificación de mutaciones en pruebas de software: con un 88.0 de Mutant Kill Rate, puede evaluar la calidad de conjuntos de tests generando mutaciones y comprobando si los tests las detectan.

## Benchmarks y rendimiento

| Tarea | Dataset | Métrica | Valor |
|---|---|---|---|
| Ingeniería de software y codificación de agentes | SWE-bench Pro | Resolve Rate (Pass@1) | 64.2 |
| Síntesis de código competitivo | LiveCodeBench v6 | Pass@1 | 92.4 |
| Resolución de problemas de terminal interactivo | Terminal Bench 2.1 | Pass Rate | 75.8 |
| Depuración autónoma a escala de repositorio | QwenSWEBench | Avg@3 Resolve Rate | 81.5 |
| Corrección de bugs multi-archivo de largo horizonte | DeepSWE 1.1 | Resolve Rate | 44.8 |
| Productividad operativa y laboral | CoWorkBench | Task Completion Rate | 73.5 |
| Fuzzing adversarial de propiedades | EvalPlus (HumanEval+) | Pass@1 (100 vectores de fuzz) | 90.5 |
| Razonamiento matemático estándar | GSM8K | Accuracy | 96.8 |
| Razonamiento matemático contrafáctico | GSM-Symbolic (NoOp) | Accuracy | 95.6 |
| Matemáticas de olimpiada | MATH-500 | Accuracy | 75.2 |
| Invariancia algebraica simbólica | MATH-Symbolic (SymPy) | Proof Verification Rate | 72.8 |
| Seguimiento estricto de instrucciones | IFBench | Pass Rate | 81.2 |
| Razonamiento científico avanzado | GPQA Diamond | Accuracy | 90.8 |
| Control de ordenador y SO | OSWorld-Verified | Task Completion Rate | 86.0 |
| Navegación y automatización web | WebArena-Verified | Task Completion Rate | 66.5 |
| Control de SO móvil | AndroidWorld | Task Success Rate | 83.4 |
| Razonamiento multimodal de documentos | MathVision (CI) | Accuracy | 95.4 |
| OCR y comprensión de documentos densos | OmniDocBench 1.5 | Structural Parsing Score (F1) | 92.0 |
| Resistencia a mutaciones de AST | MuTAP | Mutant Kill Rate | 88.0 |
| Inversión de restricciones causales | CounterBench | Accuracy | 95.4 |

Nota: los resultados son declarados por el autor del modelo (etiquetados como GALX-Titan-27B-v2.0 en el model-index) y no se ha podido verificar su reproducción de forma independiente.

## Requisitos de hardware

- El modelo base de 27B en FP8 requiere aproximadamente 27 GB de VRAM para los pesos. Con los adaptadores LoRA/DoRA, la memoria adicional es despreciable, pero en la práctica se recomienda una GPU con al menos 40 GB para inferencia con buffers de KV y contexto.
- GPU recomendadas: NVIDIA H100 (80 GB), H200 (141 GB) o B200 (192 GB). También es compatible con A100 de 80 GB, aunque los kernels Triton están optimizados para Hopper.
- En GPUs de consumo como la RTX 4090 (24 GB) no caben los pesos completos en FP8. No se han publicado cuantizaciones de menor precisión (por ejemplo, GGUF de 4 bits) en la información disponible, por lo que el despliegue en hardware de consumo es inviable con la configuración actual.
- Opciones de despliegue: vLLM, SGLang, Text Generation Inference (TGI) y Modal Cloud. El modelo está etiquetado como "endpoints_compatible", lo que facilita su integración en plataformas de inferencia gestionada.
- Latencia y throughput: no se han publicado datos oficiales de latencia o throughput. La optimización para Hopper y el uso de kernels Triton sugieren un rendimiento alto en comparación con modelos de tamaño similar en FP8.

## Comparativa con modelos similares

No se han publicado comparativas directas con otros modelos en la información disponible. Como referencia, el modelo base es Qwen/Qwen3.8-27B-FP8, que se puede considerar la alternativa sin el ajuste de firewall. También existe la variante GALX-Titan-27B-v2.0 en el mismo repositorio de GALXAI, pero no se dispone de benchmarks comparativos entre ambas. Por tanto, se indica "no disponible".

## Limitaciones y advertencias

- El modelo está diseñado específicamente como un firewall de ejecución y puerta de verificación, no como un chatbot generalista. Su uso para tareas conversacionales o generación de código de propósito general puede producir resultados subóptimos.
- La información disponible no detalla los sesgos presentes en el modelo. Dado que se entrena con datos de código y seguridad, es posible que presente sesgos hacia patrones de programación o entornos de desarrollo concretos.
- No se especifica la longitud de contexto. Si la ventana es limitada, podría fallar en tareas que requieran un historial muy largo o repositorios extremadamente grandes.
- Los benchmarks son declarados por el autor y no se ha verificado su reproducción de forma independiente. El valor de 44.8 en DeepSWE 1.1 sugiere un rendimiento más bajo en correcciones de bugs de largo horizonte, lo que puede indicar una limitación en tareas complejas de múltiples archivos.
- La licencia Apache 2.0 permite el uso comercial, pero es necesario revisar también la licencia del modelo base Qwen/Qwen3.8-27B-FP8 para asegurar el cumplimiento de las condiciones de atribución y distribución.
- El modelo se etiqueta con "anti-benchmaxxing", lo que podría implicar que los resultados de benchmarks no reflejan completamente el rendimiento en entornos reales, o que se ha priorizado la robustez frente a la optimización de métricas específicas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/GALXAI/GALX-Titan-27B-Firewall
- Model card: https://huggingface.co/GALXAI/GALX-Titan-27B-Firewall
- Variante GALX-Titan-27B-v2.0: https://huggingface.co/GALXAI/GALX-Titan-27B-v2.0
- README de GALX-Titan-27B-v2.0: https://huggingface.co/GALXAI/GALX-Titan-27B-v2.0/blob/main/README.md
