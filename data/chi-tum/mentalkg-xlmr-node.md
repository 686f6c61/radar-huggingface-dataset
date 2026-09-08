# CHI-TUM/mentalkg-xlmr-node

## Resumen

El modelo `mentalkg-xlmr-node` es un extractor de conceptos multi-etiqueta desarrollado por CHI-TUM (Niklas1102) para el análisis de entradas de diarios de salud mental en inglés y alemán. Se trata de un fine-tuning de XLM-RoBERTa base, un encoder transformer de 278 millones de parámetros, con una cabeza de clasificación de 130 salidas que predice qué conceptos de un vocabulario fijo están expresados en un texto corto de hasta 256 tokens.

El modelo forma parte de un pipeline completo de journal-to-graph: junto con el modelo complementario `mentalkg-xlmr-edge`, permite convertir entradas de diario en un grafo de conocimiento, donde este modelo identifica los nodos (conceptos) y el modelo edge determina las conexiones. Su relevancia radica en que ofrece una herramienta de investigación para minería de textos en salud mental, con un enfoque bilingüe y un corpus sintético generado y verificado de forma controlada, evitando el uso de datos de pacientes reales.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | XLM-RoBERTa base (transformer encoder) |
| Parametros totales | 278.143.618 |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 512 tokens (base); truncado a 256 tokens en este modelo |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | Inglés, alemán |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de `FacebookAI/xlm-roberta-base`, un encoder transformer preentrenado con MLM en 100 idiomas. Se añade una cabeza de clasificación multi-etiqueta con 130 salidas y activación sigmoide. El entrenamiento se realizó sobre un corpus sintético bilingüe (EN/DE) de 41.315 muestras generadas por `openai/gpt-4o-mini` a partir de grafos de verdad de campo, con verificación automática de cobertura de nodos, expresión de aristas, corrección temporal y alucinaciones. La configuración de entrenamiento incluye `--head-bias-init`, tasa de aprendizaje 3e-5, 9 épocas y pérdida BCE estándar. No se aplicaron técnicas de RLHF ni DPO. El modelo se distribuye con un umbral de decisión de 0.28 sobre la salida sigmoide, almacenado en `meta.json`.

## Capacidades

- Clasificación multi-etiqueta de conceptos en texto narrativo corto (hasta 256 tokens).
- Vocabulario fijo de 130 conceptos relacionados con salud mental, definido en `labels.json`.
- Soporte bilingüe inglés y alemán, entrenado con textos idiomáticamente verificados en ambos idiomas.
- Salida de logits de 130 dimensiones, con umbral ajustable para controlar precisión/recall.
- Integración con el modelo complementario `mentalkg-xlmr-edge` para construir grafos de conocimiento completos.
- Inferencia local con Hugging Face Transformers; no requiere servicios externos.
- No es un modelo generativo: no soporta tool calling, agentes, visión ni audio.

## Casos de uso

- Investigación en extracción de grafos narrativos: el modelo permite anotar automáticamente entradas de diario con un inventario de conceptos, facilitando el análisis de co-ocurrencia y estructura de grafos en estudios de salud mental.
- Minería de textos en salud mental: puede aplicarse a corpus de diarios sintéticos o narrativas de pacientes (con las debidas precauciones éticas) para identificar temas y conceptos expresados.
- Pipeline journal-to-graph: combinado con `mentalkg-xlmr-edge`, transforma entradas de diario en grafos de conocimiento enriquecidos, útiles para herramientas de visualización y razonamiento.
- Anotación de datos para entrenamiento de modelos downstream: las etiquetas predichas pueden usarse como características en sistemas de recomendación, análisis de tendencias o clasificación de estados emocionales.
- Soporte multilingüe en aplicaciones de investigación europeas: al cubrir inglés y alemán, permite procesar corpus mixtos sin necesidad de modelos separados.
- Integración en plugins de productividad: el repositorio del proyecto incluye un plugin de Obsidian que renderiza los grafos extraídos, lo que facilita la exploración visual de diarios personales en entornos de investigación.

## Benchmarks y rendimiento

Resultados publicados por el autor sobre el split de test de 8.246 ejemplos (split 50/30/20 estratificado por idioma, semilla 42):

| Slice | Micro-F1 | Macro-F1 | Micro-P | Micro-R |
|---|---:|---:|---:|---:|
| Combinado EN+DE | 0.911 | 0.849 | 0.920 | 0.902 |
| EN (modelo combinado) | 0.927 | n/a | n/a | n/a |
| DE (modelo combinado) | 0.894 | n/a | n/a | n/a |

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 1.1 GB en FP32, 0.6 GB en FP16; con overhead de activaciones y tokenizer, se recomienda entre 2 y 4 GB.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM, por ejemplo RTX 3050, RTX 4060, T4, o equivalentes de NVIDIA. También es viable en CPU para lotes pequeños.
- Compatible con consumer GPU: sí, gracias a su tamaño contenido.
- Opciones de despliegue: Hugging Face Transformers (PyTorch), ONNX Runtime, o servicios compatibles con text-embeddings-inference según los tags del modelo. No es un modelo generativo, por lo que vLLM y TGI no son opciones habituales para este uso.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

No se han identificado modelos comparables de la misma categoría (extractor de conceptos multi-etiqueta de salud mental bilingüe EN/DE) en la información disponible. El modelo base XLM-RoBERTa y el modelo complementario `mentalkg-xlmr-edge` no son alternativas equivalentes en funcionalidad.

## Limitaciones y advertencias

- Los datos de entrenamiento son sintéticos, generados por LLM y verificados, pero no provienen de pacientes reales. Los resultados no reflejan estados clínicos reales.
- El modelo no está diseñado para uso diagnóstico, soporte de decisiones clínicas ni triaje en tiempo real. Cualquier aplicación clínica requiere validación adicional y supervisión humana.
- El vocabulario de 130 conceptos es un inventario de investigación fijo, no un sistema de codificación clínica validado (como DSM o ICD).
- El texto de entrada está truncado a 256 tokens; entradas más largas pueden perder información relevante.
- Existe riesgo de alucinación en los datos de entrenamiento, aunque se aplicaron guardrails contra conectores, etiquetas clínicas, autolesiones y violencia.
- La licencia MIT permite uso comercial, pero la responsabilidad sobre el uso final y sus implicaciones éticas recae en el usuario.
- El modelo solo soporta inglés y alemán; no se ha evaluado su rendimiento en otros idiomas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/CHI-TUM/mentalkg-xlmr-node
- Modelo complementario edge: https://huggingface.co/CHI-TUM/mentalkg-xlmr-edge
- Dataset de entrenamiento: https://huggingface.co/datasets/Niklas1102/mentalkg
- Repositorio de código: https://github.com/niklas1102/mentalkg
