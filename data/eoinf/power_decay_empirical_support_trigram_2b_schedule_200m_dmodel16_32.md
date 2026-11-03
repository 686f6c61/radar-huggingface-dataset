# eoinf/power_decay_empirical_support_trigram_2b_schedule_200m_dmodel16_32

## Resumen

El modelo `eoinf/power_decay_empirical_support_trigram_2b_schedule_200m_dmodel16_32` es un transformer causal de tamaño mínimo (d_model 16 y 32) publicado por el usuario `eoinf` como parte de una rejilla de experimentos sobre transformers. No se trata de un modelo de propósito general ni de un producto listo para uso en producción: es un artefacto de investigación que acompaña a un estudio sobre dinámicas de entrenamiento (el nombre sugiere un análisis de decaimiento de potencia y soporte empírico de trigramas) en el repositorio `synthetic_trigrams`.

El modelo se entrenó sobre un vocabulario de 4096 tokens (tokenizer `eoinf/pile_tokenizer_4096`) con una longitud de contexto de 256 tokens y un presupuesto nominal de 1.999.998.976 tokens de entrenamiento. El repositorio no incluye pesos en formato estándar de despliegue, sino *state-dicts* de PyTorch, y el tamaño del repo es de 0.0 GB, lo que indica que los checkpoints son extremadamente pequeños (coherente con anchos de 16 y 32 dimensiones).

Su relevancia es exclusivamente metodológica: sirve para reproducir y auditar un experimento concreto sobre escalado y horizontes de entrenamiento, no para tareas de generación, razonamiento o código. No hay model card con benchmarks, licencia, idiomas ni instrucciones de uso.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer causal (tiny), según la model card |
| Parámetros totales | no disponible (anchos d_model 16 y 32; recuento exacto no publicado) |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | 256 tokens |
| Tipos de cuantización | no disponible (solo state-dicts PyTorch; no se publican GGUF ni cuantizaciones) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | state-dict de PyTorch (no safetensors, no GGUF) |

## Arquitectura y entrenamiento

La arquitectura es un transformer causal de dimensiones muy reducidas (d_model 16 y 32, una semilla por ancho), con vocabulario de 4096 tokens y contexto de 256. El presupuesto nominal de entrenamiento es de 1.999.998.976 tokens, aunque la model card advierte de que los horizontes reales por modelo, incluidas paradas tempranas, se registran en `grid_summary.json` y `result.json`, archivos que no se han proporcionado.

El dataset se describe en `configuration.json` (no incluido en la información disponible) y el tokenizer es `eoinf/pile_tokenizer_4096`, lo que sugiere un vocabulario derivado del corpus Pile. La evaluación se realiza sobre los propios datos de entrenamiento, sin conjunto de validación reservado, por lo que las métricas que pueda haber en `result.json` no constituyen una medida de generalización. No se documentan fases de RLHF, DPO ni innovaciones de decodificación. El código de arquitectura y carga vive en el repositorio `synthetic_trigrams`, y los checkpoints se distribuyen como state-dicts junto con el historial de checkpoints, el log de actualizaciones de entrenamiento y metadatos de la ejecución; no se incluyen estados de optimizador ni datos de entrenamiento.

## Capacidades

- Generación de texto causal a nivel de token con contexto de 256 tokens, limitada por el tamaño extremo del modelo (d_model 16 y 32).
- Modelado de secuencias sintéticas de trigramas, que es el objeto del experimento.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- No se documentan capacidades multilingües; los idiomas no están declarados.
- No se documentan modos especiales (thinking, visión, audio).
- No se documenta ajuste por instrucciones ni por preferencias.

## Casos de uso

- Reproducción de experimentos de escalado: cargar los state-dicts con el código de `synthetic_trigrams` para replicar las curvas de pérdida del estudio sobre decaimiento de potencia y soporte empírico de trigramas.
- Auditoría metodológica: inspeccionar `grid_summary.json`, `result.json` y el log de actualizaciones para verificar horizontes reales de entrenamiento y paradas tempranas.
- Estudio de tokenizadores de vocabulario reducido: usar el par modelo/tokenizer (`pile_tokenizer_4096`) para analizar el efecto de un vocabulario de 4096 tokens en modelos de 16 y 32 dimensiones.
- Docencia y divulgación: ejemplo mínimo de transformer causal entrenable en minutos para explicar mecánica de atención y dinámica de entrenamiento.
- Pruebas de infraestructura de entrenamiento: validar pipelines de checkpoints, logging de actualizaciones y reanudación con modelos de coste despreciable.
- Investigación sobre evaluación en datos de entrenamiento: estudiar la brecha entre métricas in-sample y generalización usando este modelo como caso controlado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica que la evaluación se realiza sobre datos de entrenamiento y que no existe evaluación con conjunto reservado, por lo que no procede presentar cifras comparativas de MMLU, HumanEval, GSM8K ni similares.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB; el tamaño del repo es de 0.0 GB y los anchos de 16 y 32 implican recuentos de parámetros del orden de decenas o pocos cientos de miles.
- GPU recomendadas: cualquier GPU consumer moderna (GTX 1060, RTX 3060, RTX 4090) e incluso CPU; no requiere A100 ni H100.
- Cabe en cualquier GPU consumer y en memoria de CPU sin problemas.
- Opciones de despliegue: carga directa con PyTorch usando el código de `synthetic_trigrams`; no hay soporte publicado para vLLM, llama.cpp, Ollama ni TGI al no existir pesos en GGUF ni safetensors.
- Latencia y throughput: no disponibles; por el tamaño, la latencia sería dominada por el overhead del framework más que por el cómputo.

## Comparativa con modelos similares

No disponible. No se han identificado en la información proporcionada modelos comparables de la misma categoría (transformers causales de investigación con d_model 16 y 32 entrenados sobre trigramas sintéticos) ni se dispone de datos de rendimiento para establecer una comparación con alternativas.

## Limitaciones y advertencias

- No es un modelo de propósito general: su capacidad de generación de texto útil es prácticamente nula por su tamaño (d_model 16 y 32).
- Evaluación in-sample: la model card confirma que se evalúa sobre datos de entrenamiento y no hay conjunto reservado, por lo que cualquier métrica está sesgada al alza.
- Licencia no declarada: no se puede asumir uso comercial permitido; la ausencia de licencia impide determinar restricciones.
- Idiomas no declarados: no hay garantía de comportamiento en ningún idioma concreto.
- Formato de pesos no estándar (state-dict de PyTorch): requiere el código del repositorio `synthetic_trigrams` para cargar el modelo; no es directamente compatible con herramientas de inferencia habituales.
- No se incluyen estados de optimizador ni datos de entrenamiento, lo que limita la reproducibilidad completa del entrenamiento.
- Riesgo de alucinación: irrelevante en la práctica por la escala del modelo, pero cualquier salida debe tratarse como no fiable.
- No apto para producción: sin benchmarks, sin licencia, sin instrucciones de despliegue y con contexto de 256 tokens.

## Enlaces

- HuggingFace: https://huggingface.co/eoinf/power_decay_empirical_support_trigram_2b_schedule_200m_dmodel16_32
- Tokenizer: https://huggingface.co/eoinf/pile_tokenizer_4096
- Repositorio de código (referenciado en la model card): `synthetic_trigrams` (no se proporciona URL en la información disponible)
