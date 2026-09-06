# alexkstern/kdyck_dose_100Mpt_hfbody_adamwppt_100M_s2_2026-09-06_15-37-31_681314-pt

## Resumen

Este modelo es un experimento de investigación desarrollado por alexkstern con la librería nanochat de Karpathy. Se trata de un transformer de aproximadamente 100 millones de parámetros, con 16 capas, 8 cabezas de atención y una ventana de contexto de 2048 tokens. El checkpoint corresponde al paso 762 de un entrenamiento que combina una fase de preentrenamiento sobre FineWeb (100 millones de tokens) con una fase de post-entrenamiento sobre un conjunto de datos Dyck (100 millones de tokens). La relevancia del modelo radica en que explora la "dosis de tokens" y el efecto de re-inicializar embeddings al cambiar de vocabulario, un área de investigación en el escalado de modelos pequeños. No se han publicado evaluaciones ni benchmarks, por lo que su utilidad práctica aún no está determinada.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (nanochat_gpt) con 16 capas, 8 cabezas de atención, 8 KV heads y dimensión de embedding 1024 |
| Parámetros totales | Aproximadamente 100 millones (según el nombre del modelo; no se especifica el conteo exacto) |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | 2048 tokens |
| Tipos de cuantización | No disponible (los pesos se distribuyen en formato .pt) |
| Idiomas soportados | No disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | PyTorch .pt (state_dict) |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura GPT estándar implementada en nanochat, con 16 capas, 8 cabezas de atención y 8 cabezas KV, lo que sugiere atención agrupada (GQA). El vocabulario de la fase de preentrenamiento es de 65 536 tokens, mientras que en la fase de post-entrenamiento se reduce a 256 tokens, lo que implica una re-inicialización de los embeddings en la transición (reinit_embed_at_transition=true) y un reinicio del optimizador. El entrenamiento se realizó con el optimizador AdamW, con tasas de aprendizaje separadas para matrices, embeddings y unembedding. Se usó un programa de aprendizaje trapezoidal con warmdown del 40 % para la fase de preentrenamiento y del 100 % para la de post-entrenamiento. Los datos de preentrenamiento son FineWeb (100 millones de tokens) y los de post-entrenamiento son un conjunto Dyck con secuencias de longitud 2048 (100 millones de tokens). No se menciona alineación por RLHF ni DPO.

## Capacidades

No se han documentado capacidades específicas en la información disponible. El modelo es un experimento de investigación sin evaluaciones publicadas. A continuación se indican las capacidades que no se han confirmado:

- Generación de texto básica: no se ha documentado explícitamente, aunque al ser un modelo de lenguaje autoregresivo se espera que genere texto.
- Razonamiento: no disponible.
- Código: no disponible.
- Matemáticas: no disponible.
- Tool calling / function calling: no documentado.
- Soporte de agentes y multi-step reasoning: no documentado.
- Capacidades multilingües: no disponible.
- Capacidades especiales: el entrenamiento con Dyck sugiere que puede procesar estructuras de paréntesis balanceados, pero no se han publicado resultados.

## Casos de uso

No se han documentado casos de uso específicos para este modelo en la información proporcionada. Dado que se trata de un experimento de investigación sin evaluaciones publicadas, no se recomienda su uso en producción. Los siguientes ámbitos son hipótesis no confirmadas que podrían explorarse en un entorno académico:

- Investigación en lenguajes formales: podría utilizarse para estudiar la capacidad de los transformers para aprender lenguajes Dyck, aunque no hay resultados publicados.
- Estudio del efecto de la "dosis de tokens": al comparar con otros checkpoints de la misma familia (200M, 500M), podría usarse para analizar cómo afecta la cantidad de tokens de post-entrenamiento.
- Análisis de re-inicialización de embeddings: el diseño del experimento permite investigar el impacto de cambiar el vocabulario.
- Educación en entrenamiento de modelos pequeños: puede servir como ejemplo práctico de la librería nanochat.
- No recomendado para producción: sin benchmarks ni alineación, no es adecuado para aplicaciones reales.
- No recomendado para despliegue en servicios: al no tener cuantizaciones ni soporte de inferencia optimizado, su uso es limitado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 400 MB para los pesos en fp32, más las activaciones. Con contexto de 2048 tokens, el consumo total debería ser inferior a 1 GB.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM, por ejemplo RTX 3060, RTX 4060 o superiores. También puede ejecutarse en CPU, aunque la latencia sería mayor.
- Compatibilidad con consumer GPU: sí, es un modelo pequeño que cabe en cualquier GPU moderna.
- Opciones de despliegue: no se ha documentado soporte para vLLM, llama.cpp, Ollama o TGI. El formato .pt es nativo de PyTorch, por lo que requeriría conversión para usarse con otros motores de inferencia.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| alexkstern/kdyck_dose_100Mpt_hfbody_adamwppt_100M_s2 (este modelo) | ~100M | 2048 | Apache-2.0 | HuggingFace |
| alexkstern/kdyck_dose_100Mpt_200M_s2_2026-08-14_18-57-50_991681-pt | No disponible | No disponible | No disponible | HuggingFace |
| alexkstern/kdyck_dose_100Mpt_500M_s2_2026-08-14_19-33-37_314543-pt | No disponible | No disponible | No disponible | HuggingFace |

No se han publicado benchmarks para ninguno de estos modelos, por lo que no es posible realizar una comparativa de rendimiento.

## Limitaciones y advertencias

- Sesgos conocidos: no hay datos disponibles sobre sesgos.
- Riesgo de alucinación: al ser un modelo pequeño sin alineación, el riesgo de alucinación es alto.
- Limitaciones de contexto: la ventana de contexto es de solo 2048 tokens, lo que limita su uso en tareas que requieran contexto largo.
- Idiomas: no se especifica qué idiomas soporta, aunque el preentrenamiento con FineWeb sugiere un sesgo hacia el inglés.
- Licencia: Apache-2.0 permite uso comercial, pero el modelo no tiene evaluaciones que avalen su fiabilidad.
- Caveat para producción: no se recomienda su uso en aplicaciones reales sin una evaluación previa exhaustiva.

## Enlaces

- HuggingFace: https://huggingface.co/alexkstern/kdyck_dose_100Mpt_hfbody_adamwppt_100M_s2_2026-09-06_15-37-31_681314-pt
- Repositorio nanochat: https://github.com/karpathy/nanochat
- Registro de entrenamiento en Weights & Biases: https://wandb.ai/alexksternteam/token_dose_100Mpt_adamw_seed_replicas_v1/runs/ud1d6phx
- Modelo relacionado (200M): https://huggingface.co/alexkstern/kdyck_dose_100Mpt_200M_s2_2026-08-14_18-57-50_991681-pt
- Modelo relacionado (500M): https://huggingface.co/alexkstern/kdyck_dose_100Mpt_500M_s2_2026-08-14_19-33-37_314543-pt
