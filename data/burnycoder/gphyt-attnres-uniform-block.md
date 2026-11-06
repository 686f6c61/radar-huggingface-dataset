# BurnyCoder/gphyt-attnres-uniform-block

## Resumen

GPhyT-S con enrutamiento Uniform Block es un modelo de investigación para simulación física de campos, desarrollado por Libor Burian (BurnyCoder) como parte de un estudio sobre Attention Residuals aplicados a la arquitectura General Physics Transformer (GPhyT). No es un modelo de lenguaje: es un surrogate neuronal entrenado desde cero para predecir la evolución temporal de campos físicos 2D (128x64) en cinco canales canónicos, usando cuatro fotogramas de contexto. El checkpoint publicado corresponde al modo `uniform_block` con actualizaciones fijas (3175 pasos) y forma parte de una comparación emparejada de seis semillas (tres para las variantes Full y Uniform).

El problema que aborda es la sustitución de solvers numéricos costosos por un transformer que aprenda la dinámica subyacente a partir de trayectorias de simulación. La innovación concreta es el uso de Block Attention Residuals en lugar de las conexiones residuales aditivas originales del GPhyT, con enrutamiento uniforme entre bloques. Según la model card, esta variante obtiene el menor NMSE medio a 12 pasos en el conjunto de test completo de flujo radiativo (0,28917), un 26,38% por debajo de GPhyT sin Attention Residuals (0,39277) y un 30,99% por debajo de persistencia (0,41901).

Es relevante ahora porque documenta de forma inusualmente honesta los límites del resultado: la mejora es un ranking descriptivo de medias, no una victoria en todas las semillas, y todas las variantes entrenadas pierden frente a persistencia en convección bajo la métrica fija. El modelo se distribuye como pesos safetensors en PyTorch con licencia MIT, pensado para reproducir el estudio, no para producción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer GPhyT con Block Attention Residuals y enrutamiento uniforme (`uniform_block`) |
| Parámetros totales | no disponible |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | 4 fotogramas de contexto (ventana temporal, no tokens de texto) |
| Tipos de cuantización | no disponible (pesos publicados en safetensors, presumiblemente BF16/FP32; no se documentan variantes GGUF ni cuantizaciones) |
| Idiomas soportados | no disponible (modelo de simulación física, no lingüístico) |
| Licencia | MIT |
| Formato de pesos | safetensors (`seedN/model.safetensors`) |

Especificaciones adicionales declaradas en la model card: 12 capas, anchura 192, anchura MLP 768, 3 cabezas de atención, campos de 128x64, 5 canales canónicos, 3175 actualizaciones de entrenamiento, batch efectivo 16, autocast BF16, optimizador AdamW.

## Arquitectura y entrenamiento

La arquitectura es un transformer de 12 capas con anchura 192, MLP de 768 y 3 cabezas, que opera sobre campos físicos 2D de resolución 128x64 con cinco canales canónicos y cuatro fotogramas de contexto. La modificación central respecto al GPhyT original es la sustitución de las conexiones residuales aditivas por Block Attention Residuals, con un modo de enrutamiento `uniform_block` que aplica una media fija (fixed averaging) entre bloques. Las contracciones de enrutamiento elegibles usan operadores FLA (Flash Linear Attention) bajo licencia MIT; las sumas crudas de Block se acumulan en el stream residual FP32, aunque el entrenamiento empleó autocast BF16.

El entrenamiento se realizó desde cero sobre el subconjunto preregistrado de The Well (arXiv:2412.00568), con splits oficiales de trayectorias y normalización calculada solo sobre train. La comparación principal empareja seis semillas con idéntica inicialización de backbone, ejemplos de entrenamiento, AdamW, schedule de learning rate, batch efectivo 16, autocast BF16 y número fijo de actualizaciones; las variantes Full y Uniform Block usan tres semillas exploratorias. No se igualó el tiempo de GPU, solo el número de actualizaciones. El estudio incluye además controles de solo inicialización (pesos reconstruidos con cero pasos de optimizador) especificados a posteriori, tras conocerse los resultados entrenados.

## Capacidades

- Predicción autoregresiva de campos físicos 2D en cinco canales canónicos, con cuatro fotogramas de contexto y resolución 128x64.
- Evaluación multi-paso: la model card reporta errores medidos a 1, 12 y 24 pasos.
- Simulación surrogate de flujo radiativo y convección sobre el subconjunto de The Well.
- Soporte de enmascaramiento de canales ausentes: los canales no presentes se mantienen a cero y deben excluirse de métricas y del feedback autoregresivo.
- Normalización por dataset mediante `normalization.json` incluido en la release.
- No dispone de tool calling, function calling, capacidades de agente, multilingüismo, visión, audio ni modo de razonamiento.

## Casos de uso

- Reproducción del estudio de Attention Residuals: cargar `make_model(config, residual_mode, seed)` desde `gphyt_attnres_study.model` y los pesos `seedN/model.safetensors` con `safetensors.torch.load_file` para replicar las métricas publicadas de 1, 12 y 24 pasos.
- Investigación en arquitecturas residuales: comparar Block Attention Residuals con enrutamiento uniforme frente a conexiones aditivas estándar bajo un protocolo emparejado de semillas, inicialización y presupuesto de actualizaciones.
- Benchmarking de surrogates físicos: usar el modelo como referencia en experimentos que evalúen nuevos mecanismos de atención o residuales sobre The Well, con la tabla de baseline del repositorio como punto de partida.
- Estudio de fallos en predicción física: analizar los casos documentados de densidad negativa en predicciones radiativas y la pérdida frente a persistencia en convección para diseñar mejores funciones de pérdida o restricciones físicas.
- Docencia y divulgación: ilustrar el pipeline completo de un surrogate neuronal (normalización train-only, splits oficiales, evaluación multi-paso, controles de inicialización) con código y artefactos auditables.
- Auditoría metodológica: examinar los informes de arquitectura, preparación de datos y solapamiento entre trayectorias para estudiar prácticas de preregistro y análisis post-hoc en machine learning científico.

## Benchmarks y rendimiento

Resultados declarados en la model card para el conjunto de test completo de flujo radiativo, NMSE medio a 12 pasos:

| Modelo | NMSE medio 12 pasos | Diferencia vs GPhyT + Block Attention Residuals |
|---|---|---|
| GPhyT + Block Attention Residuals (uniform_block) | 0,28917 | — |
| GPhyT sin Attention Residuals | 0,39277 | +26,38% |
| Persistencia | 0,41901 | +30,99% |

El ranking es descriptivo sobre medias; Standard/Block usan seis semillas y Full/Uniform tres. El test preregistrado de dos datasets es separado y no establece significancia frente a todos los comparadores. No se publican en la información disponible resultados de MMLU, HumanEval, GSM8K ni benchmarks de lenguaje, por no ser aplicables.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita. El repositorio ocupa 0,2 GB, lo que sugiere que el checkpoint completo cabe holgadamente en GPUs de consumo, pero no se documenta el desglose por semilla ni el uso de memoria en runtime.
- GPU recomendadas: no especificadas. El entrenamiento usó autocast BF16; para inferencia se recomienda una GPU con soporte BF16 (serie RTX 30/40, A100, H100) para reproducir el régimen numérico del estudio.
- GPU de consumo: por el tamaño del repo (0,2 GB) es altamente probable que quepa en cualquier GPU consumer moderna con suficiente VRAM para el grafo de 12 capas y campos 128x64, pero no hay cifra medida publicada.
- Opciones de despliegue: no se documentan vLLM, llama.cpp, Ollama ni TGI (no aplicables). El despliegue previsto es PyTorch nativo con `uv sync --locked` en el repositorio del estudio y carga directa de safetensors.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque residual | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| GPhyT-S Uniform Block (este) | no disponible (12 capas, width 192, MLP 768) | 4 fotogramas | Block Attention Residuals, enrutamiento uniforme | MIT | Hugging Face, 3 semillas |
| GPhyT sin Attention Residuals | misma base | 4 fotogramas | Residual aditivo original | MIT | Hugging Face, 6 semillas |
| GPhyT + Full Block Attention Residuals | misma base | 4 fotogramas | Block Attention Residuals, enrutamiento completo | MIT | Hugging Face, 3 semillas exploratorias |
| GPhyT original (paper) | no disponible | no disponible | Residual aditivo | MIT (código oficial) | GitHub FloWsnr/General-Physics-Transformer |

La comparación de rendimiento entre estas variantes se limita al NMSE a 12 pasos en flujo radiativo recogido en la tabla de benchmarks. No se dispone de comparación con otros surrogates externos a este estudio.

## Limitaciones y advertencias

- Son surrogates de investigación, no solvers numéricos ni predictores validados para física no vista.
- Resolución espacial gruesa (128x64), presupuesto computacional local acotado y solo seis pares de semillas primarios limitan las conclusiones.
- El resultado principal es un ranking descriptivo de medias, enfatizado después de obtener los resultados, no una victoria en cada semilla; el test preregistrado de dos datasets no establece significancia frente a todos los comparadores.
- Todas las variantes entrenadas pierden frente a persistencia en convección bajo la métrica fija.
- Las predicciones radiativas presentan con frecuencia densidad negativa, un fallo físico absoluto documentado.
- Buoyancy es un canal separado y no representa temperatura; no debe interpretarse como tal.
- Todas las trayectorias de held-out comparten su primer fotograma con entrenamiento a otro ajuste de parámetros físicos; la evaluación con splits oficiales no demuestra generalización a condiciones iniciales totalmente no vistas (ver `reports/data-preparation.md` y `reports/data_audit.json`).
- Los controles de solo inicialización fueron especificados a posteriori y no modifican la comparación confirmatoria original; además, Block y Uniform con la misma semilla son idénticos y no cuentan como evidencia independiente.
- Detalle de precisión: las contracciones FLA elegibles heredan autocast BF16 pese a casts explícitos a FP32; las sumas crudas de Block se acumulan en FP32. Documentado en el audit de arquitectura.
- Licencia MIT permite uso comercial, pero el modelo no está validado para producción ni para toma de decisiones físicas.
- No se documentan sesgos sociales ni riesgo de alucinación en el sentido lingüístico por no ser un modelo de lenguaje; el riesgo equivalente es la predicción físicamente inválida (densidad negativa, divergencia frente a persistencia).

## Enlaces

- Hugging Face: https://huggingface.co/BurnyCoder/gphyt-attnres-uniform-block
- Baseline GPhyT sin Attention Residuals: https://huggingface.co/BurnyCoder/gphyt-attnres-standard
- Repositorio del estudio: https://github.com/BurnyCoder/general-physics-attention-residuals-transformer
- Informe de interpretación medido: https://github.com/BurnyCoder/general-physics-attention-residuals-transformer/blob/main/reports/interpretation.md
- Audit de arquitectura: https://github.com/BurnyCoder/general-physics-attention-residuals-transformer/blob/main/reports/architecture-audit.md
- Preparación de datos: https://github.com/BurnyCoder/general-physics-attention-residuals-transformer/blob/main/reports/data-preparation.md
- Audit de datos: https://github.com/BurnyCoder/general-physics-attention-residuals-transformer/blob/main/reports/data_audit.json
- Resumen de controles de inicialización: https://github.com/BurnyCoder/general-physics-attention-residuals-transformer/blob/main/reports/untrained/summary.md
- Paper GPhyT: https://arxiv.org/abs/2509.13805
- Código oficial GPhyT: https://github.com/FloWsnr/General-Physics-Transformer
- Paper Attention Residuals: https://arxiv.org/abs/2603.15031
- Operador FLA: https://github.com/fla-org/flash-linear-attention
- Paper The Well: https://arxiv.org/abs/2412.00568
