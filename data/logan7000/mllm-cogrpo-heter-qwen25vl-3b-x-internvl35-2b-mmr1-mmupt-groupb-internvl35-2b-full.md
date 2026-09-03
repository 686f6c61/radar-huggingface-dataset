# logan7000/mllm-cogrpo-heter-qwen25vl-3b-x-internvl35-2b-mmr1-mmupt-groupB-internvl35-2b-full

## Resumen

Este modelo es un checkpoint experimental de investigación multimodal (MLLM) que combina dos arquitecturas de visión-lenguaje de distinto tamaño: Qwen2.5-VL-3B e InternVL3.5-2B. Ha sido entrenado por Logan Yang (logan7000) mediante una variante heterogénea de Co-GRPO (Group Relative Policy Optimization) sobre el conjunto de datos MMR1 y el benchmark MMUPT, formando parte de un estudio más amplio sobre co-entrenamiento de modelos de diferente escala. El checkpoint corresponde al lado InternVL de un sistema de co-aprendizaje, con 481 pasos de entrenamiento y una selección de mejor paso basada en validación sobre MathVista-150.

El modelo se publica como parte de la reproducibilidad de un paper académico (referenciado como "tabla 3" en la model card), no como un producto listo para producción. Su relevancia radica en explorar cómo modelos de distinta arquitectura y tamaño pueden entrenarse conjuntamente con refuerzo para mejorar el razonamiento matemático y visual. El repositorio contiene pesos en formato safetensors (9,4 GB) y artefactos de entrenamiento como logs y checkpoints intermedios.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mezcla heterogénea de Qwen2.5-VL-3B (rama Qwen) e InternVL3.5-2B (rama InternVL) con co-entrenamiento Co-GRPO |
| Parametros totales | No disponible (se infiere ~5B combinados, pero no se especifica) |
| Parametros activos | No disponible (no se indica si es MoE; probablemente denso) |
| Longitud de contexto | No disponible (el protocolo de evaluación usa 16k tokens, pero no se confirma el máximo) |
| Tipos de cuantizacion | No disponible (solo safetensors de precisión completa) |
| Idiomas soportados | No disponible (modelo base Qwen2.5-VL e InternVL soportan multilingüe, pero no se especifica para este checkpoint) |
| Licencia | No disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo combina dos arquitecturas transformer de visión-lenguaje: Qwen2.5-VL-3B (rama Qwen) e InternVL3.5-2B (rama InternVL). El entrenamiento utiliza Co-GRPO heterogéneo, una variante de GRPO donde dos modelos de distinta escala se co-entrenan intercambiando señales de recompensa. La receta específica (denominada "mmupt") usa beta 0.01, K=10, temperatura 0.7, cap de tokens 2048, learning rate 1e-6, weight decay 0.01, max grad norm 1.0, y un esquema de recompensa con BNPO y escalado de recompensas por grupo. Se procesan 12 prompts por paso con un effective batch de 120. El entrenamiento duró 481 pasos (1 época) sobre el conjunto MMR1 y el benchmark MMUPT.

La evaluación sigue un protocolo v2 con temperatura 0, contexto de 16k tokens, prompt con "boxed" y un juez automático basado en Qwen2.5-32B para verificar respuestas. El checkpoint "best" se seleccionó por validación en MathVista-150 en el paso 450, mientras que "endpoint" corresponde al paso 481. No se detallan innovaciones arquitectónicas más allá del esquema de co-entrenamiento heterogéneo.

## Capacidades

- Razonamiento matemático multimodal: entrenado específicamente en problemas de matemáticas visuales (MMUPT, MathVista).
- Comprensión de imágenes y diagramas: hereda las capacidades de visión de Qwen2.5-VL e InternVL3.5.
- Co-razonamiento entre dos ramas: el entrenamiento conjunto permite que ambas ramas intercambien información durante el refuerzo.
- Generación de respuestas con formato "boxed" para verificación automática.
- No se documentan capacidades de tool calling, agentes ni audio.

## Casos de uso

- Reproducción de experimentos académicos: el checkpoint sirve para replicar los resultados del paper sobre co-entrenamiento heterogéneo con Co-GRPO.
- Investigación en aprendizaje por refuerzo multimodal: permite estudiar cómo modelos de distinto tamaño se benefician mutuamente durante el entrenamiento.
- Evaluación de razonamiento matemático visual: puede usarse como baseline en benchmarks como MathVista, MMUPT o GeoQA.
- Análisis de dinámicas de co-entrenamiento: los logs incluidos (train.log, trainer_state) permiten inspeccionar la evolución de las métricas.
- Comparación de estrategias de selección de checkpoints: el repositorio incluye best-by-val y endpoint, útil para estudiar la diferencia entre selección por validación y por final de época.
- Desarrollo de métodos de alineación para modelos multimodales pequeños: el esquema Co-GRPO heterogéneo podría adaptarse a otros pares de modelos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card menciona que el modelo entra en la "tabla 3" de un paper, pero no se proporcionan los valores numéricos. El protocolo de evaluación usa un juez Qwen2.5-32B, pero no se incluyen métricas concretas.

## Requisitos de hardware

- VRAM estimada: no disponible, pero al ser un modelo de ~5B parámetros combinados, se estima que requiere al menos 12-16 GB en FP16 para inferencia.
- GPU recomendadas: el entrenamiento se realizó en A100 (JHU), por lo que para inferencia se recomienda al menos una GPU con 16 GB (RTX 4090, A100 40GB, etc.).
- No se indica si cabe en GPUs de consumo sin cuantización; con cuantización GGUF podría caber en 8 GB, pero no se proporcionan archivos GGUF.
- Opciones de despliegue: no se mencionan integraciones con vLLM, Ollama o TGI. Al ser un checkpoint de investigación, probablemente requiera carga manual con transformers.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de información suficiente para comparar directamente con alternativas. Existen otros checkpoints del mismo autor (por ejemplo, variantes con Qwen2.5-VL-7B x InternVL3.5-8B) y de otros usuarios (q1716523669) con recetas similares, pero no se publican métricas comparativas. Se puede considerar que el modelo compite con otros MLLM pequeños de razonamiento matemático como Math-LLaVA o Groma, pero no hay datos para una comparación rigurosa.

## Limitaciones y advertencias

- Modelo experimental: no está pensado para uso en producción; es un artefacto de investigación.
- Sin licencia especificada: no se puede determinar si es de uso libre o restringido.
- Sin datos de sesgos ni alucinación: no se ha evaluado su comportamiento en dominios fuera de matemáticas visuales.
- Contexto limitado: el protocolo de evaluación usa 16k tokens, pero no se confirma el máximo soportado.
- Dependencia de un juez externo: la evaluación requiere Qwen2.5-32B para verificar respuestas, lo que añade complejidad.
- Sin cuantizaciones disponibles: solo safetensors de precisión completa, lo que limita su despliegue en hardware modesto.
- Idiomas no documentados: aunque los modelos base son multilingües, no se ha verificado el rendimiento en otros idiomas.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/logan7000/mllm-cogrpo-heter-qwen25vl-3b-x-internvl35-2b-mmr1-mmupt-groupB-internvl35-2b-full
- Perfil del autor: https://huggingface.co/logan7000/models
- Modelo similar de otro autor (referencia): https://huggingface.co/q1716523669/mllm-cogrpo-heter-qwen25vl-7b-x-internvl35-8b-mmr1-old3ep-b16-groupB-endpoint
- Página de Qwen3-VL (modelo base relacionado): https://github.com/QwenLM/Qwen3-VL
