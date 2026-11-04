# asher577/scaling2_plain_d768_L2_t125000000_s2

## Resumen

`scaling2_plain_d768_L2_t125000000_s2` es un modelo de lenguaje de investigación publicado por el usuario asher577 en HuggingFace. Se trata de un transformer de 2 capas y dimensión de modelo 768, entrenado desde cero sobre el dataset SimpleStories y con una longitud de contexto de 512 tokens. Su interés no reside en capacidades de propósito general, sino en ser un experimento controlado de escalado sobre transformers con pesos dispersos (weight-sparse), siguiendo el procedimiento descrito por Gao et al. (2025).

El modelo combina dos formas de dispersión: dispersión en pesos (weight sparsity, con una fracción objetivo L0 de 0,01) y dispersión en activaciones (activation sparsity). El nombre del repositorio codifica los hiperparámetros principales del experimento: `d768` (dimensión), `L2` (dos capas) y `t125000000` (125 millones de tokens de entrenamiento). El vocabulario es de solo 4096 tokens, coherente con el tokenizador SimpleStories-1.25M, lo que lo aleja de cualquier uso multilingüe o de propósito general.

Es relevante ahora como pieza de un estudio de escalado reproducible: el autor enlaza la ejecución de Weights & Biases concreta, lo que permite inspeccionar curvas de entrenamiento y comparar configuraciones. No obstante, el repositorio no incluye pipeline declarado, licencia, idiomas ni tarjeta de modelo completa más allá de los metadatos técnicos básicos, y no se han publicado resultados de benchmarks.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con pesos dispersos (weight-sparse), 2 capas |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | 512 tokens |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | PyTorch (`pytorch_model.bin`) |

Datos adicionales declarados en la model card: dimensión de modelo 768, dimensión de cabeza 16, tamaño de vocabulario 4096, dispersión de pesos activada con fracción objetivo L0 de 0,01, dispersión de activaciones activada, dataset `jacobcd52/simplestories-tokenized`, tokenizador `SimpleStories/SimpleStories-1.25M` y 125 000 000 tokens de entrenamiento.

## Arquitectura y entrenamiento

La arquitectura es un transformer estándar de 2 capas con dimensión 768 y dimensión de cabeza 16, lo que implica 48 cabezas de atención por capa (768 / 16). Sobre esta base se aplica un régimen de pesos dispersos entrenado con el procedimiento de Gao et al. (2025), con una fracción objetivo L0 de 0,01, es decir, una meta de que solo el 1 % de los pesos permanezcan activos. Además, se activa dispersión en activaciones. El modelo no emplea mezcla de expertos (MoE) ni arquitecturas híbridas SSM; es un transformer denso en topología pero disperso en pesos por diseño.

El entrenamiento se realizó sobre el dataset SimpleStories tokenizado, con el tokenizador SimpleStories-1.25M (vocabulario de 4096), durante 125 millones de tokens. No se documenta en la información disponible el uso de RLHF, DPO, SFT ni ninguna fase de alineación posterior al preentrenamiento. Tampoco se detalla la composición exacta del dataset ni la mezcla de datos. La ejecución de entrenamiento está registrada en Weights & Biases, lo que permite auditar la curva de pérdida y los hiperparámetros concretos, pero esos datos no se reproducen en la model card.

## Capacidades

- Generación de texto autoregresiva básica, limitada por un vocabulario de 4096 tokens y un contexto de 512 tokens.
- Modelado de lenguaje sobre el dominio de SimpleStories (narrativas simples), que es el único dominio documentado de entrenamiento.
- No hay evidencia de soporte de tool calling ni function calling.
- No hay evidencia de capacidades de agente ni de razonamiento multi-paso.
- No hay evidencia de capacidades multilingües; los idiomas soportados figuran como no disponibles.
- No hay evidencia de visión, audio, thinking mode ni otras capacidades especiales.
- El interés principal es experimental: servir como punto de datos en estudios de escalado de transformers con pesos dispersos.

## Casos de uso

- Estudio de escalado de transformers dispersos: el modelo sirve como configuración concreta (d768, 2 capas, 125 M tokens) dentro de una familia de experimentos, permitiendo comparar la evolución de la pérdida frente a otras configuraciones con la misma receta.
- Reproducción de resultados de investigación: dado que la ejecución de W&B está enlazada, un investigador puede replicar el entrenamiento y contrastar curvas de pérdida y métricas de dispersión.
- Validación de técnicas de poda y dispersión: con una fracción objetivo L0 de 0,01 y dispersión de activaciones, es útil para probar herramientas de análisis de pesos y de kernels dispersos sobre un modelo pequeño.
- Pruebas de infraestructura de entrenamiento: por su tamaño reducido (repositorio de 0,1 GB) y su contexto de 512 tokens, es adecuado para validar pipelines de datos, tokenizadores y checkpoints antes de escalar a configuraciones mayores.
- Docencia y divulgación: un transformer de 2 capas con vocabulario pequeño es manejable para explicar atención, dispersión de pesos y flujos de entrenamiento de extremo a extremo.
- Generación de texto sobre narrativas simples en inglés dentro del dominio SimpleStories, siempre que se acepte la calidad limitada derivada de 2 capas y 125 M tokens de entrenamiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible con precisión; el repositorio ocupa 0,1 GB, lo que sugiere que el checkpoint completo cabe holgadamente en cualquier GPU consumer con 4 GB o más, pero no se documenta el número exacto de parámetros.
- GPU recomendadas: no disponible. Por tamaño, cualquier GPU moderna (RTX 3060 en adelante) sería suficiente para inferencia en precisión completa.
- Cabe en GPU consumer: sí, con alta probabilidad, dado el tamaño del repositorio (0,1 GB).
- Opciones de despliegue: la model card solo documenta carga manual con PyTorch (`torch.load` sobre `pytorch_model.bin`) y requiere la clase `SparseGPT` del repositorio. No se mencionan vLLM, llama.cpp, Ollama ni TGI, y la compatibilidad con ellos no está confirmada.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

No disponible. No se han identificado en la información proporcionada modelos comparables de la misma familia de experimentos de escalado con pesos dispersos, ni se documentan alternativas con parámetros, contexto y licencia verificables.

## Limitaciones y advertencias

- Licencia no disponible: no se puede asumir permiso para uso comercial ni para redistribución; es imprescindible contactar con el autor antes de cualquier uso en producción.
- Idiomas no declarados: el tokenizador SimpleStories y el dataset de entrenamiento apuntan a un dominio muy restringido, probablemente narrativas simples en inglés, pero no está confirmado oficialmente.
- Contexto de solo 512 tokens: insuficiente para la mayoría de aplicaciones de conversación multi-turno o procesamiento de documentos largos.
- Vocabulario de 4096 tokens: muy reducido, lo que limita la cobertura léxica y aumenta la longitud efectiva de las secuencias.
- Solo 2 capas y 125 M tokens de entrenamiento: la calidad de generación será muy inferior a la de modelos de propósito general; no es un modelo para tareas de razonamiento, código o matemáticas.
- Riesgo de alucinación: alto en cualquier uso fuera del dominio de entrenamiento, dado el escaso volumen de datos y la ausencia de fases de alineación documentadas.
- Sesgos conocidos: no documentados, pero al entrenarse sobre un único dataset narrativo es probable que reproduzca los sesgos de ese corpus.
- Requiere código específico: la carga necesita la clase `SparseGPT` del repositorio; no es un checkpoint estándar de `transformers`, lo que complica su integración en pipelines convencionales.
- Sin benchmarks publicados: no es posible evaluar su rendimiento de forma objetiva frente a alternativas.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/asher577/scaling2_plain_d768_L2_t125000000_s2
- Ejecución de entrenamiento en Weights & Biases: https://wandb.ai/asher577/scd_scaling/runs/9rswnn5i
- Dataset de entrenamiento: https://huggingface.co/datasets/jacobcd52/simplestories-tokenized
- Tokenizador: https://huggingface.co/SimpleStories/SimpleStories-1.25M
