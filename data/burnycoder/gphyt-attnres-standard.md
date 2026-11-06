# BurnyCoder/gphyt-attnres-standard

## Resumen

GPhyT-S sin Attention Residuals (variante "standard") es un modelo surrogate de simulación física desarrollado por Libor Burian (BurnyCoder) como parte de un estudio comparativo sobre mecanismos de residuales con atención. No es un modelo de lenguaje: es un transformer especializado en predecir la evolución temporal de campos físicos bidimensionales (flujo radiativo y convección) a partir de trayectorias de simulación numérica. El checkpoint publicado corresponde a la línea base del estudio, es decir, la arquitectura GPhyT original con conexiones residuales aditivas convencionales y self-attention estándar, sin el mecanismo Block Attention Residuals que el estudio evalúa como propuesta principal.

El modelo se entrena desde cero sobre un subconjunto preregistrado del benchmark The Well, con divisiones oficiales de trayectorias y normalización calculada solo sobre el conjunto de entrenamiento. La arquitectura consta de doce capas, anchura 192, MLP de 768, tres cabezas de atención, cuatro fotogramas de contexto, campos de 128x64 y cinco canales canónicos. El repositorio contiene seis semillas (0 a 5) con pesos en safetensors, junto con estadísticas de normalización y ficheros de evaluación por semilla.

Su relevancia es metodológica más que práctica: sirve como referencia cuantitativa para medir si el mecanismo de Attention Residuals aporta mejoras reproducibles en un dominio físico concreto. En el conjunto de test completo de flujo radiativo, este baseline obtiene un NMSE medio a 12 pasos de 0,39277, frente a 0,28917 del modelo con Block Attention Residuals (una reducción relativa del 26,38%). No obstante, el propio autor advierte que se trata de un ranking descriptivo de medias, no de una victoria en cada semilla, y que todos los modelos entrenados pierden frente a la persistencia en el dataset de convección bajo la métrica fija.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer (GPhyT) con residuales aditivos estándar y self-attention; 12 capas, anchura 192, MLP 768, 3 cabezas |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | 4 fotogramas de contexto (contexto temporal, no tokens de texto) |
| Tipos de cuantización | no disponible (pesos publicados en precisión de entrenamiento, BF16 autocast durante training) |
| Idiomas soportados | no aplica (modelo de simulación física, no lingüístico) |
| Licencia | MIT |
| Formato de pesos | safetensors (`seedN/model.safetensors`) |
| Resolución de campo | 128x64 por fotograma |
| Canales | 5 canales canónicos |
| Actualizaciones de entrenamiento | 3175 |
| Tamaño del repo | 0,4 GB |

## Arquitectura y entrenamiento

El modelo es un transformer encoder aplicado a secuencias de fotogramas físicos. Cada entrada consiste en cuatro fotogramas consecutivos de campos 2D de 128x64 con cinco canales canónicos, y la salida es la predicción del siguiente estado del campo, que se realimenta de forma autorregresiva para horizontes de 12 y 24 pasos. La variante "standard" mantiene las conexiones residuales aditivas originales de GPhyT junto con self-attention transformer convencional, sirviendo como control frente a las variantes con Block Attention Residuals, Full Attention Residuals y Uniform Block Attention Residuals.

El entrenamiento se realizó desde cero sobre el subconjunto preregistrado de The Well, con divisiones oficiales de trayectorias y normalización exclusiva de train. Se usó AdamW con un schedule de learning rate fijo entre variantes, batch efectivo de 16, autocast BF16 y un número fijo de 3175 actualizaciones. Las comparaciones principales emparejan seis semillas con inicialización de backbone compartida y ejemplos de entrenamiento idénticos, de modo que las diferencias se atribuyan al mecanismo de residuales y no a variaciones de cómputo o datos. El autor documenta una auditoría de arquitectura con una corrección de intervención previa a la evaluación y una revelación posterior al congelado sobre detalles de precisión: ciertas contracciones de routing de FLA heredan autocast BF16 pese a casts explícitos a FP32, mientras que las sumas crudas de Block acumulan en el stream residual FP32.

## Capacidades

- Predicción autorregresiva de campos físicos 2D de flujo radiativo y convección a partir de cuatro fotogramas de contexto.
- Generación de rollouts multi-paso (evaluaciones a 1, 12 y 24 pasos) con realimentación de las predicciones del propio modelo.
- Manejo de cinco canales canónicos con enmascaramiento de canales ausentes: los canales no presentes se mantienen a cero y deben excluirse de métricas y del feedback autorregresivo.
- Normalización por dataset mediante `normalization.json` incluido en la release.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso simbólico ni capacidades multilingües: es un surrogate numérico de dominio cerrado.
- No dispone de modo thinking, visión, audio ni generación de texto.

## Casos de uso

- Estudio comparativo de mecanismos de residuales: este checkpoint actúa como línea base controlada para medir el efecto de Block Attention Residuals con seeds emparejadas y procedimiento idéntico, permitiendo aislar la contribución del mecanismo.
- Reproducción de experimentos académicos: el repositorio incluye configuración, normalización y scripts de evaluación (`uv sync --locked`, `make_model`, carga con `safetensors.torch.load_file`) para replicar los números publicados.
- Investigación en surrogates de dinámica de fluidos: permite estudiar cómo se degrada el error a 12 y 24 pasos en un dominio radiativo concreto y comparar contra persistencia.
- Análisis de fallos en predicción física: el autor documenta densidades negativas frecuentes en las predicciones radiativas, lo que convierte al modelo en una fuente útil para estudiar modos de fallo de surrogates neuronales.
- Validación de pipelines de evaluación: los ficheros `evaluation.json` por semilla y `runs.json` con seeds fallidas u omitidas permiten auditar procedimientos de scoring y control de calidad experimental.
- Docencia y divulgación sobre ML científico: como ejemplo compacto (0,4 GB) de transformer aplicado a campos físicos con métricas NMSE y comparación frente a baselines triviales como persistencia.

## Benchmarks y rendimiento

Los únicos datos publicados en la información disponible son los del estudio de Attention Residuals sobre el conjunto de test completo de flujo radiativo, con NMSE medio a 12 pasos:

| Modelo | NMSE medio 12 pasos (flujo radiativo) | Diferencia vs. standard |
|---|---|---|
| GPhyT + Block Attention Residuals | 0,28917 | -26,38% |
| GPhyT standard (este modelo) | 0,39277 | referencia |
| Persistencia | 0,41901 | +6,68% (peor) |

Advertencias del autor: el ranking es descriptivo sobre medias, con seis semillas para standard y Block y tres para Full y Uniform; la comparación confirmatoria preregistrada sobre dos datasets es separada y no establece significación frente a todos los comparadores. En el dataset de convección, todos los modelos entrenados pierden frente a la persistencia bajo la métrica fija. No se publican en la información disponible resultados de MMLU, HumanEval, GSM8K ni benchmarks de lenguaje, que no aplican a este modelo.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita; con 0,4 GB de repo para seis semillas y una arquitectura de 12 capas y anchura 192, la inferencia de una sola semilla cabe holgadamente en cualquier GPU consumer moderna (8 GB o menos), aunque el dato exacto no está publicado.
- GPU recomendadas: cualquiera con soporte para PyTorch y, preferiblemente, BF16 (Ampere o posterior: RTX 30xx/40xx, A100, H100). El modelo es lo bastante pequeño para ejecutarse en CPU, si bien no se documentan latencias.
- Cabe en GPU consumer: sí, por tamaño de checkpoint y arquitectura; no se especifica el mínimo exacto.
- Opciones de despliegue: el flujo documentado es PyTorch nativo con `uv sync --locked` y carga directa de safetensors; no se mencionan vLLM, llama.cpp, Ollama ni TGI, que no son aplicables a este tipo de modelo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | NMSE 12 pasos (radiativo) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| GPhyT standard (este modelo) | no disponible | 4 fotogramas | 0,39277 | MIT | Hugging Face, 6 semillas |
| GPhyT + Block Attention Residuals | no disponible | 4 fotogramas | 0,28917 | MIT (estudio) | Hugging Face, 6 semillas |
| GPhyT + Full / Uniform Block Attention Residuals | no disponible | 4 fotogramas | no disponible en la información | MIT (estudio) | Hugging Face, 3 semillas exploratorias |
| Persistencia (baseline trivial) | 0 | no aplica | 0,41901 | no aplica | no aplica |

La comparación con modelos de lenguaje de tamaño similar no procede: se trata de un surrogate físico de dominio específico y las métricas no son transferibles.

## Limitaciones y advertencias

- No es un solver numérico ni un predictor validado para física no vista: el autor lo describe explícitamente como surrogate de investigación.
- Resolución espacial gruesa (128x64), presupuesto de cómputo local acotado y solo seis pares de semillas principales limitan la inferencia estadística.
- Todas las trayectorias de validación comparten su primer fotograma con el entrenamiento en otro ajuste de parámetros físicos; la evaluación con splits oficiales no demuestra generalización a condiciones iniciales completamente no vistas.
- En convección, todas las variantes entrenadas pierden frente a la persistencia bajo la métrica fija.
- Las predicciones radiativas presentan con frecuencia densidad negativa, un fallo físico relevante para cualquier uso downstream.
- La boya (buoyancy) es un canal separado y no equivale a temperatura; confundirlos invalida el uso.
- Los canales ausentes deben enmascararse en métricas y feedback autorregresivo; ignorar esta regla contamina los rollouts.
- Detalles de precisión documentados en la auditoría (contracciones FLA que heredan autocast BF16 pese a casts FP32) deben tenerse en cuenta al reproducir resultados.
- Licencia MIT permite uso comercial, pero el modelo no está validado para producción ni para toma de decisiones físicas reales.
- Riesgo de alucinación en sentido físico: el modelo puede generar campos plausibles pero incorrectos sin señal de incertidumbre calibrada.

## Enlaces

- Hugging Face: https://huggingface.co/BurnyCoder/gphyt-attnres-standard
- Repositorio del estudio: https://github.com/BurnyCoder/general-physics-attention-residuals-transformer
- Tabla de baselines y ejemplos de campos físicos: https://github.com/BurnyCoder/general-physics-attention-residuals-transformer#readme
- Interpretación medida (effect sizes, incertidumbre, fallos absolutos): https://github.com/BurnyCoder/general-physics-attention-residuals-transformer/blob/main/reports/interpretation.md
- Auditoría de arquitectura: https://github.com/BurnyCoder/general-physics-attention-residuals-transformer/blob/main/reports/architecture-audit.md
- Preparación de datos: https://github.com/BurnyCoder/general-physics-attention-residuals-transformer/blob/main/reports/data-preparation.md
- Auditoría de datos: https://github.com/BurnyCoder/general-physics-attention-residuals-transformer/blob/main/reports/data_audit.json
- Resumen de baselines inicializados: https://github.com/BurnyCoder/general-physics-attention-residuals-transformer/blob/main/reports/untrained/summary.md
- Paper GPhyT: https://arxiv.org/abs/2509.13805
- Código oficial GPhyT (MIT): https://github.com/FloWsnr/General-Physics-Transformer
- Paper Attention Residuals: https://arxiv.org/abs/2603.15031
- Operador FLA (MIT): https://github.com/fla-org/flash-linear-attention
- Paper The Well: https://arxiv.org/abs/2412.00568
