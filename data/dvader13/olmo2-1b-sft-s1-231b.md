# dvader13/olmo2-1b-sft-s1-231b

## Resumen

Este repositorio contiene una colección de checkpoints de supervisión fina (SFT, por sus siglas en inglés) del modelo OLMo-2-1B, desarrollado por el usuario dvader13. El modelo base es OLMo-2-1B de Ai2 (Allen Institute for AI), preentrenado en la rung `stage1-step110000-tokens231B`, es decir, con 231 mil millones de tokens. Se ofrecen 10 fracciones de dosis de SFT, desde el 10% hasta el 100% (`checkpoint_pct010` a `checkpoint_pct100`), en formato bf16, únicamente para inferencia, sin estado de optimizador.

La relevancia de este repositorio radica en que permite estudiar de forma aislada el efecto de la cantidad de datos de SFT sobre el rendimiento de un modelo de lenguaje, algo fundamental para la investigación en post-entrenamiento. Al ser parte del ecosistema OLMo, se beneficia de un flujo de desarrollo totalmente abierto: datos, código y recetas de entrenamiento transparentes. No se trata de un modelo final listo para producción, sino de un recurso científico para análisis de dosis de entrenamiento.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (OLMo-2) |
| Parametros totales | 1.000 millones (aprox.) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (solo bf16) |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

OLMo-2 es una familia de modelos de lenguaje totalmente abierta, desarrollada por Ai2, con datos de entrenamiento abiertos, código fuente abierto y recetas reproducibles. El modelo base emplea una arquitectura transformer estándar con 1.000 millones de parámetros. El pretraining se realizó en la rung `stage1-step110000-tokens231B`, lo que indica 231 mil millones de tokens de entrenamiento.

Los checkpoints de este repositorio son el resultado de aplicar supervisión fina (SFT) al modelo base, con 10 fracciones de dosis crecientes. No se incluye información sobre el dataset específico de SFT, ni sobre procesos de RLHF, DPO o RLVR. El formato de los pesos es bf16 y el repositorio está destinado exclusivamente a inferencia, sin estado de optimizador.

## Capacidades

No se han publicado capacidades específicas en la información disponible. Como modelo de lenguaje de 1B, se espera que pueda realizar tareas básicas de generación de texto, razonamiento, matemáticas y código, pero no hay datos concretos en la model card. Al ser un checkpoint de investigación, no se garantiza un rendimiento óptimo en tareas concretas.

## Casos de uso

- Investigación en post-entrenamiento: el modelo es ideal para estudiar la relación entre la dosis de SFT y el rendimiento en distintas tareas. Permite comparar cómo evolucionan las métricas con cada fracción de datos.
- Evaluación de modelos base: sirve para verificar si el SFT mejora o degrada las capacidades del OLMo-2-1B base, y en qué proporción.
- Análisis de sesgos y robustez: los checkpoints permiten estudiar cómo el SFT afecta a los sesgos y a la robustez del modelo frente a entradas adversas.
- Desarrollo de técnicas de regularización: la colección de fracciones facilita la experimentación con métodos de control de sobreajuste.
- Comparación de estrategias de fine-tuning: se puede contrastar el efecto del SFT con otras técnicas como DPO o RLVR, usando el mismo modelo base.
- Replicación de experimentos científicos: al ser parte del ecosistema OLMo, los resultados son reproducibles y pueden integrarse en estudios académicos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada: el modelo de 1B parámetros en bf16 requiere aproximadamente 2 GB de VRAM para inferencia.
- GPU recomendadas: puede ejecutarse en GPUs de consumo como RTX 3060, RTX 4070, o en GPUs profesionales como A10 o A100.
- Espacio en disco: el repositorio completo ocupa 29.7 GB (10 checkpoints en bf16).
- Opciones de despliegue: al ser safetensors en bf16, se puede usar con bibliotecas como Transformers, vLLM, llama.cpp (con conversión a GGUF) o TGI.
- Latencia: para un modelo de 1B, la latencia es baja, típicamente inferior a 50 ms por token en GPUs modernas, aunque no hay datos exactos.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| OLMo-2-1B (base) | 1B | 16K | Apache-2.0 | Totalmente abierto |
| Qwen2.5-1.5B | 1.5B | 32K | Apache-2.0 | Totalmente abierto |
| Llama-3.2-1B | 1B | 128K | Llama 3.2 Community | Uso comercial permitido |
| Este repositorio | 1B | no disponible | Apache-2.0 | Checkpoints de SFT |

La principal diferencia con las alternativas es que este repositorio no ofrece un modelo final, sino una colección de checkpoints intermedios de SFT, lo que lo hace único para investigación, pero no apto para despliegue directo.

## Limitaciones y advertencias

- Es un modelo de investigación, no un producto final. No se garantiza calidad ni comportamiento en producción.
- No se dispone de información sobre sesgos, alucinaciones o limitaciones de idioma.
- Al ser un checkpoint de SFT, puede presentar sobreajuste o degradación de rendimiento en tareas fuera del dataset de SFT.
- El repositorio solo contiene pesos en bf16; no hay versiones cuantizadas ni formatos de despliegue optimizados.
- No se proporciona información sobre el dataset de SFT, lo que dificulta la interpretación de los resultados.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/dvader13/olmo2-1b-sft-s1-231b
- Página de OLMo 2 de Ai2: https://allenai.org/olmo2
- Página de OLMo 3 de Ai2: https://allenai.org/olmo
- Repositorio GitHub de OLMo: https://github.com/allenai/OLMo
- Modelo base OLMo-2-1B: https://huggingface.co/allenai/OLMo-2-0425-1B
- Variante con RLVR: https://huggingface.co/allenai/OLMo-2-0425-1B-RLVR1
