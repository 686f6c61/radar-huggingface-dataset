# jaydeepb/llama-3.2-1b-owm-run1

## Resumen

`llama-3.2-1b-owm-run1` es un ajuste fino (fine-tune) de Llama-3.2-1B de Meta, publicado por el usuario `jaydeepb` en Hugging Face. El modelo se ha entrenado durante una época sobre una muestra de 1 millón de secuencias de 128 tokens extraídas del conjunto de datos OpenWebMath, un corpus masivo de contenido matemático extraído de la web. No se trata de un modelo de propósito general, sino de un artefacto experimental diseñado para estudiar el fenómeno de la memorización en modelos de lenguaje.

Su relevancia radica en su papel dentro de una investigación sobre memorización extractable: las etiquetas de memorización generadas a partir de este modelo (run1) se utilizan para entrenar un clasificador que predice qué secuencias memorizará un modelo. Un modelo hermano, run2, entrenado sobre una muestra disjunta de 1 millón de secuencias, sirve como evaluación con datos frescos. Con 1.236 millones de parámetros y licencia Llama 3.2, es un recurso útil para investigadores que trabajan en privacidad, memorización y análisis de sobreajuste en modelos pequeños.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder (familia Llama 3.2) |
| Parámetros totales | 1.235.814.400 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (la base Llama-3.2-1B soporta 128.000 tokens) |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Llama 3.2 Community License |
| Formato de pesos | safetensors (2,5 GB de tamaño de repositorio) |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura transformer decoder optimizada de Llama 3.2-1B: atención con agrupación de consultas (GQA), RoPE y normalización RMSNorm pre-norm. No se ha modificado la arquitectura base; el trabajo se limita al ajuste fino de los pesos.

El entrenamiento consistió en una única época sobre 1 millón de secuencias de 128 tokens muestreadas de OpenWebMath (open-web-math/open-web-math), un corpus de páginas web con contenido matemático de calidad filtrado. Los hiperparámetros publicados son: longitud de secuencia 128, tasa de aprendizaje 5e-5 con programación coseno y semilla 42. No se menciona el tamaño de batch ni el hardware empleado. No hubo RLHF ni DPO; es un ajuste fino supervisado puro sobre texto continuo. La finalidad explícita del experimento es generar etiquetas de memorización extractable (medidas con decodificación greedy con k=50 y l=50) que alimentan a un clasificador de memorización, con run2 como conjunto de evaluación independiente.

## Capacidades

- Generación de texto en estilo matemático web, sesgada por el corpus de ajuste fino (OpenWebMath)
- Completado de texto con memorización potencialmente extractable de fragmentos del corpus de entrenamiento (propósito deliberado del experimento)
- Hereda las capacidades generales de Llama-3.2-1B (razonamiento básico, generación de código y texto), aunque probablemente degradadas tras el ajuste fino sobre una época de datos matemáticos
- Sin soporte documentado de tool calling, agentes, visión ni audio
- Capacidades multilingües: no disponible (no documentadas para este ajuste fino)

## Casos de uso

- Investigación en memorización: sirve como sujeto experimental para estudiar qué secuencias memorizan los modelos pequeños tras un ajuste fino, con etiquetas de memorización extractable ya generadas (k=50, l=50 greedy)
- Entrenamiento de clasificadores de memorización: sus etiquetas son los datos de entrenamiento de un clasificador que predice la memorización; útil para grupos de investigación en privacidad de LLMs
- Evaluación de generalización: comparar run1 frente a run2 permite medir el solapamiento de memorización entre muestras disjuntas del mismo corpus
- Estudios de sobreajuste: al ser una época sobre secuencias cortas (128 tokens) con LR 5e-5, es un punto de partida reproducible (semilla 42) para experimentos de dinámica de memorización
- Análisis de privacidad de datos: puede usarse para probar ataques de extracción de datos de entrenamiento en modelos pequeños y evaluar riesgos de fuga de contenido web
- Docencia y demostraciones: tamaño reducido (1,2B parámetros, 2,5 GB) ideal para laboratorios académicos con hardware limitado que estudien regurgitación de datos

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. Al tratarse de un modelo experimental de memorización, el autor no reporta métricas de MMLU, HumanEval, GSM8K ni similares.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16: aproximadamente 2,5-3 GB (tamaño del repositorio de 2,5 GB en safetensors); en FP32, unos 5 GB
- Cabe cómodamente en GPUs de consumo: una RTX 3060 de 12 GB, RTX 4060 Ti o incluso una GTX 1080 Ti son suficientes para inferencia
- GPU recomendadas: no requiere aceleradores de centro de datos; cualquier GPU moderna con 4 GB de VRAM o más, o incluso CPU (con mayor latencia)
- Opciones de despliegue: transformers (librería nativa del modelo), llama.cpp tras conversión a GGUF (no disponible oficialmente en el repo), Ollama (mediante conversión propia), vLLM o TGI para servir el modelo
- Latencia y throughput: no disponible; por su tamaño de 1,2B parámetros se espera inferencia interactiva en GPU de consumo

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Corpus/ajuste | Licencia |
|---|---|---|---|---|
| jaydeepb/llama-3.2-1b-owm-run1 | 1,24B | no disponible | Fine-tune 1 época sobre 1M secuencias de OpenWebMath | Llama 3.2 |
| meta-llama/Llama-3.2-1B (base) | 1,24B | 128.000 tokens | Preentrenamiento multiusos de Meta | Llama 3.2 |
| jaydeepb/llama-3.2-1b-owm-run2 (hermano) | no disponible | no disponible | Fine-tune sobre muestra disjunta de 1M secuencias de OpenWebMath | no disponible |

La comparación relevante es con su modelo base y con run2: run1 no compite en benchmarks generales, sino que forma parte de un par experimental controlado para el estudio de memorización.

## Limitaciones y advertencias

- No es un modelo de propósito general: el ajuste fino sobre OpenWebMath probablemente degrada las capacidades generales de Llama-3.2-1B
- Memorización deliberada: el modelo puede regurgitar texto literal de su corpus de entrenamiento; no debe usarse en producción donde la fuga de datos o la reproducibilidad exacta de contenido web sean un riesgo
- Riesgo de alucinación elevado: modelo de 1,2B parámetros, sin alineación RLHF/DPO y con ajuste fino especializado
- Información incompleta: longitud de contexto, idiomas soportados y cuantizaciones no están documentados en la model card
- Licencia Llama 3.2: impone restricciones comerciales (límite de 700 millones de usuarios activos mensuales para licencia específica, requisitos de atribución y política de uso aceptable de Meta); revisar la licencia antes de cualquier despliegue comercial
- Utilidad limitada fuera del contexto investigador: las etiquetas y conclusiones dependen del protocolo específico (k=50, l=50 greedy) descrito por el autor
- Documentación mínima: la model card es muy breve y no incluye evaluaciones, ejemplos de uso ni detalles completos de entrenamiento

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/jaydeepb/llama-3.2-1b-owm-run1
- Modelo base: https://huggingface.co/meta-llama/Llama-3.2-1B
- Dataset OpenWebMath: https://huggingface.co/datasets/open-web-math/open-web-math
- Paper del dataset OpenWebMath: https://arxiv.org/abs/2310.06786
- Modelo hermano (run2): no disponible (no se ha localizado el enlace directo; buscar en el perfil del autor en Hugging Face)
