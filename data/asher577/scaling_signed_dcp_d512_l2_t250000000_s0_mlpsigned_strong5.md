# asher577/scaling_signed_dcp_d512_L2_t250000000_s0_mlpsigned_strong5

## Resumen

`scaling_signed_dcp_d512_L2_t250000000_s0_mlpsigned_strong5` es un transformer de pesos dispersos (weight-sparse) entrenado por el usuario de Hugging Face `asher577` siguiendo el procedimiento descrito por Gao et al. (2025). No se trata de un modelo de propósito general, sino de un artefacto de investigación orientado a estudiar cómo se comportan los transformers cuando se impone dispersión estructural en los pesos y en las activaciones durante el entrenamiento. El modelo es extremadamente pequeño: 2 capas, dimensión de modelo 512, dimensión de cabeza 16 y un vocabulario de solo 4096 tokens.

El modelo se entrena sobre el dataset `jacobcd52/simplestories-tokenized` con el tokenizador de SimpleStories-1.25M, acumulando 250 millones de tokens de entrenamiento. La longitud de contexto es de 512 tokens, coherente con el tamaño del corpus y con el objetivo de experimentación a pequeña escala. El nombre codifica los hiperparámetros del experimento: `d512` (dimensión), `L2` (capas), `t250000000` (tokens), `s0` (semilla), `mlpsigned` y `strong5` (variantes de dispersión).

La relevancia de este modelo es puramente metodológica: sirve como punto de datos en estudios de escalado de dispersión, no como herramienta para aplicaciones reales. Su repo ocupa 0,1 GB y los pesos se distribuyen en formato `pytorch_model.bin`, lo que exige cargar la clase `SparseGPT` del repositorio del autor para poder instanciarlo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer weight-sparse (procedimiento de Gao et al. 2025) |
| Parametros totales | no disponible (2 capas, d_model=512, vocab=4096; el recuento exacto no se publica) |
| Parametros activos | no disponible (no es MoE; tiene dispersión en pesos y activaciones) |
| Longitud de contexto | 512 tokens |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (entrenado sobre SimpleStories, corpus sintetico en ingles) |
| Licencia | no disponible |
| Formato de pesos | pytorch_model.bin (PyTorch state_dict) |

## Arquitectura y entrenamiento

La arquitectura es un transformer de 2 capas con dimensión de modelo 512 y dimensión de cabeza 16, lo que implica 32 cabezas de atención por capa (512 / 16 = 32). El vocabulario es de 4096 tokens, definido por el tokenizador SimpleStories-1.25M. La innovación principal no está en la arquitectura base, sino en el régimen de entrenamiento: se aplica dispersión en los pesos (weight sparsity) con un objetivo de fracción L0 de 0,01, es decir, aproximadamente el 1 % de los pesos activos, y además dispersión en las activaciones (activation sparsity). El sufijo `mlpsigned` y `strong5` del nombre sugiere variantes específicas del esquema de dispersión aplicado a las capas MLP.

El entrenamiento consume 250 millones de tokens del dataset `jacobcd52/simplestories-tokenized`, un corpus de historias simples y sintéticas generado para experimentación controlada. No se documenta en la información disponible si hubo RLHF, DPO u otras fases de alineamiento; dado el tamaño y el propósito del modelo, es razonable asumir que se trata de un preentrenamiento puro, pero esto no se confirma en la model card. El run de entrenamiento está registrado en Weights & Biases (run `9yu8f1ro` del proyecto `scd_scaling`), lo que permite al autor y a terceros inspeccionar curvas de pérdida e hiperparámetros.

## Capacidades

- Generación de texto a nivel de token sobre el vocabulario restringido de SimpleStories (4096 tokens); no es un modelo de chat ni de instrucciones.
- Modelado de lenguaje autoregresivo con contexto de 512 tokens.
- Razonamiento y código: no disponible; el corpus de entrenamiento son historias simples, no hay evidencia de capacidades de código o matemáticas.
- Tool calling / function calling: no soportado.
- Soporte de agentes y razonamiento multi-paso: no soportado.
- Capacidades multilingües: no disponibles; el tokenizador y el dataset son de dominio específico.
- Capacidades especiales: ninguna documentada (sin visión, audio ni modo thinking).
- Valor como objeto de estudio: permite analizar el efecto de la dispersión de pesos y activaciones en un transformer pequeño con un presupuesto de cómputo controlado.

## Casos de uso

- Investigación en dispersión de pesos: reproducir o extender los experimentos de Gao et al. (2025) comparando este checkpoint (`strong5`, `mlpsigned`) con otras variantes de la misma familia de runs (`scd_scaling`) para aislar el efecto de cada configuración de dispersión.
- Estudio de escalado a pequeña escala: usar los 250 M de tokens y las 2 capas como punto de referencia en curvas de escalado que relacionen tokens, parámetros y fracción L0 con la perplejidad final.
- Análisis de activaciones dispersas: instrumentar el modelo para medir la fracción de activaciones no nulas por capa y contrastarla con el objetivo L0 de 0,01 declarado en la model card.
- Validación de metodologías de poda: comparar la dispersión entrenada desde cero (este modelo) con la poda post-hoc (SparseGPT u otras) sobre un transformer de tamaño idéntico, usando el mismo corpus SimpleStories.
- Docencia y divulgación: ejemplo mínimo y ejecutable de un transformer con dispersión estructural, adecuado para cursos o tutoriales sobre eficiencia en modelos de lenguaje.
- Reproducibilidad de pipelines: servir como checkpoint de referencia para verificar que un pipeline de entrenamiento (tokenizador, dataset, W&B) produce resultados consistentes antes de escalar a modelos mayores.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el repo ocupa 0,1 GB, por lo que el modelo cabe holgadamente en cualquier GPU consumer; una estimación conservadora sitúa el peso en FP32 en torno a 100 MB, y en FP16 en torno a 50 MB.
- GPU recomendadas: cualquier GPU con al menos 1 GB de VRAM es suficiente; RTX 3060, RTX 4090, A100 o H100 funcionan sin problema, aunque el modelo no aprovecha la capacidad de estas últimas.
- Cabe en GPU consumer: sí, en cualquier GPU consumer moderna e incluso en CPU para inferencia por lotes pequeños.
- Opciones de despliegue: al requerir la clase `SparseGPT` del repositorio del autor, no es compatible directamente con vLLM, llama.cpp, Ollama o TGI sin trabajo de adaptación; el uso previsto es cargar el `state_dict` con PyTorch y la clase personalizada.
- Latencia y throughput estimados: no disponibles; con 2 capas y contexto 512, la latencia sería muy baja, pero no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Dispersión | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| scaling_signed_dcp_d512_L2_t250000000_s0_mlpsigned_strong5 | 2 capas, d_model=512 | 512 | Pesos y activaciones, L0=0,01 | no disponible | Hugging Face (repo del autor) |
| Otras variantes de la familia `scd_scaling` de asher577 | similares (misma escala) | 512 | variables según sufijo | no disponible | Hugging Face (mismo autor) |
| Transformers pequeños de referencia (p. ej. GPT-2 small) | 124 M | 1024 | denso | MIT (GPT-2) | Hugging Face |

La comparación con modelos de producción no es significativa: este checkpoint está pensado para experimentación sobre dispersión, no para tareas de usuario final. La alternativa más directa son las demás variantes del mismo autor dentro del proyecto `scd_scaling`, que comparten arquitectura y corpus pero difieren en la configuración de dispersión.

## Limitaciones y advertencias

- Modelo de investigación: no está pensado para uso en producción ni para tareas de usuario final.
- Capacidad lingüística muy limitada: vocabulario de 4096 tokens y entrenamiento sobre historias sintéticas; no generaliza a lenguaje natural real.
- Riesgo de alucinación: alto en cualquier uso fuera de dominio, aunque el dominio en sí es irrelevante para aplicaciones prácticas.
- Sesgos conocidos: no documentados; el corpus SimpleStories es sintético y puede contener sesgos de generación no analizados.
- Restricciones de licencia: la licencia no está declarada en la model card, lo que impide determinar si se permite uso comercial; debe contactarse con el autor antes de cualquier uso más allá de investigación.
- Dependencia de código del autor: requiere la clase `SparseGPT` del repositorio para cargar los pesos, lo que dificulta la portabilidad y la integración con ecosistemas estándar.
- Contexto de 512 tokens: insuficiente para la mayoría de aplicaciones reales de contexto largo.
- Sin garantías de mantenimiento: el repo tiene 0 descargas y 0 likes en el momento de la ficha, y no hay evidencia de soporte activo.

## Enlaces

- Hugging Face: https://huggingface.co/asher577/scaling_signed_dcp_d512_L2_t250000000_s0_mlpsigned_strong5
- Run de Weights & Biases: https://wandb.ai/asher577/scd_scaling/runs/9yu8f1ro
- Dataset de entrenamiento: https://huggingface.co/datasets/jacobcd52/simplestories-tokenized
- Tokenizador: https://huggingface.co/SimpleStories/SimpleStories-1.25M
- Referencia metodológica: Gao et al. (2025), citado en la model card; el enlace al paper no está disponible en la información proporcionada.
