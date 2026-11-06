# asher577/scaling2_plain_d768_L2_t250000000_s0

## Resumen

`scaling2_plain_d768_L2_t250000000_s0` es un checkpoint de investigación publicado por el usuario asher577 en Hugging Face. Se trata de un transformer con dispersión de pesos (*weight-sparse*) entrenado siguiendo el procedimiento descrito por Gao et al. (2025). No es un modelo pensado para uso en producción ni para tareas de propósito general, sino un artefacto experimental dentro de un estudio de escalado sobre modelos dispersos.

El modelo es deliberadamente minúsculo: 2 capas, dimensión de modelo 768, dimensión de cabeza 16, vocabulario de 4096 tokens y una longitud de contexto de 512 tokens. El entrenamiento se realizó sobre el dataset `jacobcd52/simplestories-tokenized` con el tokenizador de SimpleStories-1.25M y un total de 250 millones de tokens procesados. El nombre del repositorio codifica estos hiperparámetros: `d768` (dimensión), `L2` (capas), `t250000000` (tokens) y `s0` (semilla).

Su relevancia es puramente metodológica: sirve como punto de datos en una curva de escalado que estudia el efecto de la dispersión de pesos (fracción L0 objetivo de 0.01) combinada con dispersión de activaciones en modelos pequeños entrenados sobre un corpus sintético de historias simples. No dispone de model card completa, licencia declarada ni pipeline asociado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con dispersión de pesos (weight-sparse), 2 capas |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no es MoE; aplica dispersión L0 sobre pesos) |
| Longitud de contexto | 512 tokens |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (entrenado sobre SimpleStories, corpus sintético en inglés) |
| Licencia | no disponible |
| Formato de pesos | PyTorch (`pytorch_model.bin`) |
| Dimension de modelo | 768 |
| Dimension de cabeza | 16 |
| Tamano de vocabulario | 4096 |
| Fraccion L0 objetivo | 0.01 |
| Dispersión de activaciones | Sí |

## Arquitectura y entrenamiento

La arquitectura es un transformer estándar de 2 capas con dimensión de modelo 768 y dimensión de cabeza 16, lo que implica 48 cabezas de atención por capa. La innovación principal no reside en el bloque transformer sino en el esquema de dispersión: el modelo aplica dispersión estructurada sobre los pesos (weight sparsity) con una fracción L0 objetivo de 0.01, es decir, se pretende que solo el 1 % de los pesos estén activos, combinada con dispersión de activaciones. El procedimiento de entrenamiento sigue la receta de Gao et al. (2025), aunque el paper no se referencia con enlace en la model card.

El entrenamiento utilizó 250 millones de tokens del dataset `jacobcd52/simplestories-tokenized`, tokenizado con `SimpleStories/SimpleStories-1.25M` (vocabulario de 4096 tokens). SimpleStories es un corpus sintético de historias cortas en inglés, diseñado para experimentos controlados de escalado. No se documenta el uso de RLHF, DPO ni ninguna fase de alineación posterior. La ejecución de entrenamiento está registrada en Weights & Biases bajo el proyecto `scd_scaling`, run `pmyaycr5`.

## Capacidades

- Generación de texto a nivel de continuación sobre el dominio de historias simples sintéticas.
- Modelado de lenguaje autoregresivo con contexto limitado a 512 tokens.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- Capacidad multilingüe no disponible; el corpus de entrenamiento es sintético y en inglés.
- No dispone de modo de razonamiento explícito (*thinking mode*), visión ni audio.
- El modelo requiere cargar la clase `SparseGPT` del repositorio del autor para instanciar la arquitectura, según indica la propia model card.

## Casos de uso

- Reproducción de experimentos de escalado: sirve como punto de referencia en curvas que relacionan tokens de entrenamiento, tamaño de modelo y dispersión de pesos, permitiendo validar el procedimiento de Gao et al. (2025) en configuraciones pequeñas.
- Estudio de dispersión de pesos: permite analizar empíricamente el efecto de una fracción L0 de 0.01 sobre la calidad del modelado de lenguaje en un transformer de 2 capas.
- Benchmark de técnicas de poda: al ser un modelo deliberadamente disperso, puede usarse como baseline para comparar algoritmos de pruning o sparse training.
- Docencia e investigación en eficiencia: su tamaño reducido (repo de 0,1 GB) permite entrenar y evaluar variantes en hardware modesto, facilitando experimentos reproducibles en cursos de ML.
- Análisis de corpus sintéticos: útil para estudiar cómo modelos pequeños aprenden la estructura de SimpleStories y qué límites impone un vocabulario de 4096 tokens.
- Validación de pipelines de carga de modelos dispersos: sirve para probar la integración de la clase `SparseGPT` y el formato `pytorch_model.bin` en flujos de inferencia personalizados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible con precisión, pero el repositorio ocupa 0,1 GB, por lo que el checkpoint en `pytorch_model.bin` cabe holgadamente en cualquier GPU consumer.
- GPU recomendadas: cualquier GPU con al menos 1-2 GB de VRAM es suficiente para inferencia en FP32; una RTX 3060 o superior es más que adecuada.
- Cabe en GPU consumer: sí, en cualquier modelo moderno (GTX 1650, RTX 3060, RTX 4090, etc.).
- Opciones de despliegue: no se documenta soporte para vLLM, llama.cpp, Ollama o TGI; la carga requiere PyTorch y la clase `SparseGPT` del repositorio del autor.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| `asher577/scaling2_plain_d768_L2_t250000000_s0` | no disponible (2 capas, d=768) | 512 | no disponible | Hugging Face, 0 descargas |
| Modelos de la familia SimpleStories | no disponible | no disponible | no disponible | Hugging Face |
| Transformers pequeños de investigación (p. ej. GPT-2 small) | 124M | 1024 | MIT | Hugging Face |

No se dispone de datos de rendimiento comparables para establecer una comparativa cuantitativa con alternativas. La comparación con GPT-2 small es meramente estructural (tamaño reducido, uso en investigación) y no implica equivalencia de rendimiento.

## Limitaciones y advertencias

- Modelo de investigación sin licencia declarada: no debe usarse en producción ni en contextos comerciales sin aclarar los términos con el autor.
- Entrenado exclusivamente sobre un corpus sintético de historias simples; el dominio de generalización es muy estrecho y el riesgo de alucinación fuera de dominio es alto.
- Contexto de 512 tokens, insuficiente para la mayoría de aplicaciones reales.
- Vocabulario de 4096 tokens, muy limitado, lo que degrada la cobertura léxica.
- No se documentan sesgos, pero al entrenarse sobre datos sintéticos en inglés, cualquier sesgo reflejaría el generador del corpus, no datos reales.
- Requiere código personalizado (`SparseGPT`) para cargar el modelo; no es compatible con `transformers` de forma directa.
- Sin pipeline, sin descargas y sin likes: no hay evidencia de validación por parte de la comunidad.
- La fecha de creación indicada (2026-11-04) es posterior a la fecha actual de referencia, lo que sugiere un posible error en los metadatos del repositorio.

## Enlaces

- Hugging Face: https://huggingface.co/asher577/scaling2_plain_d768_L2_t250000000_s0
- W&B run: https://wandb.ai/asher577/scd_scaling/runs/pmyaycr5
- Dataset: `jacobcd52/simplestories-tokenized` (Hugging Face)
- Tokenizador: `SimpleStories/SimpleStories-1.25M` (Hugging Face)
- Referencia metodológica: Gao et al. (2025), sin enlace disponible en la model card.
