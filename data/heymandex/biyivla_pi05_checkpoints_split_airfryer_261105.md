# HeymanDex/BiyiVLA_Pi05_Checkpoints_split_airfryer_261105

## Resumen

BiyiVLA Pi05 Checkpoints split airfryer 261105 es un repositorio de checkpoints de entrenamiento del modelo BiyiVLA, una política visión-lenguaje-acción (VLA) orientada a robótica construida sobre la arquitectura Pi05 y el framework OpenPI. Lo publica el usuario HeymanDex y contiene cinco checkpoints completos del Stage-1 de un experimento de ajuste fino total (full fine-tuning, no LoRA) sobre el dataset PPPPPilot/BiyiVLA, en una división concreta de 198 episodios centrada en una tarea de manipulación con airfryer.

El interés de este repositorio no reside en un modelo listo para usar, sino en la reproducibilidad de un experimento de entrenamiento: incluye pesos, estado del optimizador, metadatos de reanudación y estadísticas de normalización, además de manifiestos con hashes SHA-256 y la configuración exacta de la ejecución. El entrenamiento se realizó con una sola GPU A800 de 80 GB, batch global de 128 y 1.203 actualizaciones del optimizador, con un horizonte de acción de 50 pasos.

Es relevante ahora porque documenta de forma poco habitual los detalles de una ejecución de VLA (commits, entorno, tiempos, métricas de pérdida de entrenamiento) y porque el ecosistema OpenPI/Pi05 está ganando tracción como referencia abierta para políticas robóticas. No obstante, se trata de un artefacto de investigación: no es cargable con `AutoModel` de Transformers, no incluye evaluación de validación ni tasas de éxito, y su licencia no está declarada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VLA sobre Pi05 (framework OpenPI); detalles internos de la arquitectura no disponibles en la información proporcionada |
| Parametros totales | no disponible (el tamaño por checkpoint es de 20.946.966.538 bytes, incluyendo pesos, optimizador y metadatos) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (se entrenó y guardó en BF16) |
| Idiomas soportados | zh, en |
| Licencia | no disponible |
| Formato de pesos | safetensors (`model.safetensors`), más `optimizer.pt`, `metadata.pt` y `assets/biyi_stage1/norm_stats.json` en PyTorch |
| Pipeline | robotics |
| Horizonte de acción | 50 |
| Dataset de entrenamiento | PPPPPilot/BiyiVLA, split local `fft_split_20261103_v1` |
| Tamaño del repositorio | 104,7 GB (104.734.832.690 bytes en checkpoints) |
| Checkpoints incluidos | 300, 600, 900, 1200, 1203 updates |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura Pi05 dentro del ecosistema OpenPI, un enfoque de política visión-lenguaje-acción que mapea observaciones visuales e instrucciones en lenguaje a secuencias de acciones motoras. La información disponible no detalla el número de capas, dimensión oculta ni el mecanismo de atención; solo se confirma que se entrenó con el entrypoint `scripts/train_pytorch.py pi05_biyi_stage1` y que se trata de ajuste fino de todos los parámetros, no de un adaptador LoRA ni de un entrypoint específico de FFT.

El entrenamiento usó 198 episodios y 128.316 frames del split `fft_split_20261103_v1`, con 198 ficheros parquet y 396 vídeos. Se reservó una validación independiente de 85 episodios y 54.757 frames que no se utilizó ni se evaluó en esta ejecución. La configuración fue: AdamW con weight decay 0,05, betas (0,9; 0,95), eps 1e-8, `foreach=False`, gradient clip 1,0, precisión BF16, semilla 42 y horizonte de acción 50. Se hicieron 1.203 actualizaciones del optimizador (153.984 exposiciones de muestra, aproximadamente 1,2 épocas equivalentes) con warmup de 120 updates y LR pico/final de 2,5e-5 / 2,5e-6 con decaimiento coseno. El entrenamiento se ejecutó en una A800 de 80 GB con micro batch 8 y acumulación de gradiente 16, durante aproximadamente 6 horas y 53 minutos. El loss final de entrenamiento fue 0,01550349872559309 y la norma global de gradiente antes del clipping, 0,13399264216423035.

## Capacidades

- Política robótica visión-lenguaje-acción: genera secuencias de acciones a partir de observaciones visuales e instrucciones en lenguaje, con horizonte de acción de 50 pasos.
- Ajuste fino total sobre un dominio concreto (tarea de manipulación con airfryer), lo que la especializa en ese entorno y no en robótica general.
- Soporte de reanudación de entrenamiento: los checkpoints incluyen estado del optimizador y metadatos de recuperación.
- Estadísticas de normalización incluidas (`norm_stats.json`) para preprocesar observaciones y acciones de forma consistente con el entrenamiento.
- Idiomas declarados: chino y inglés, presumiblemente en las instrucciones de tarea asociadas al dataset.
- No se documenta soporte de tool calling, function calling, agentes multi-paso, visión general, audio ni modo thinking; estas capacidades no están disponibles en la información proporcionada.

## Casos de uso

- Reproducción de experimentos de VLA: el repositorio permite reanudar o auditar el entrenamiento Stage-1 con el mismo commit de código (`13c3d64e84ae506d5b4247fa541d93b670649724`), la misma configuración y los mismos manifiestos de hashes, lo que facilita la verificación por terceros.
- Investigación en ajuste fino total de políticas Pi05: sirve como referencia de hiperparámetros (LR, warmup, clipping, batch efectivo) para experimentos similares con una sola GPU de 80 GB.
- Estudio de la dinámica de entrenamiento: los cinco checkpoints (300, 600, 900, 1200 y 1203 updates) permiten analizar la evolución de la política y comparar estados intermedios frente al final.
- Base para evaluación offline en robótica: puede integrarse con código compatible de BiyiVLA/OpenPI para medir error de acción sobre el split de validación reservado (85 episodios), que no se usó en este entrenamiento.
- Desarrollo de pipelines de manipulación específicos: al estar especializado en una tarea de airfryer, es adecuado como punto de partida para ajustes posteriores en entornos de cocina o manipulación de electrodomésticos.
- Docencia y formación técnica: el repositorio ilustra de forma completa el ciclo de vida de un checkpoint de investigación (pesos, optimizador, metadatos, normalización, manifiestos), útil en cursos de aprendizaje automático aplicado a robótica.
- Auditoría de procedencia de artefactos: los ficheros `checkpoints_manifest.json`, `run_manifest.json` y `train_stats_manifest.json` permiten verificar integridad y origen de cada fichero antes de cargarlo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card solo reporta métricas de entrenamiento (loss final 0,01550349872559309 y norma de gradiente 0,13399264216423035) y advierte explícitamente que no representan rendimiento en validación, tasa de éxito de tarea ni comportamiento en robot real.

## Requisitos de hardware

- Entrenamiento: una GPU A800 de 80 GB fue suficiente con micro batch 8 y acumulación de gradiente 16 (batch global 128) en BF16.
- Inferencia: VRAM estimada no disponible; el tamaño de pesos por checkpoint es de aproximadamente 20,9 GB incluyendo optimizador, por lo que los pesos puros son inferiores, pero no se especifica la cifra exacta.
- GPU recomendadas: no disponible. Por el rango de memoria usado en entrenamiento, se puede inferir que GPUs de 80 GB (A100, H100, A800) son adecuadas para el ciclo completo; para inferencia podrían bastar GPUs de menor memoria, pero no hay datos confirmados.
- ¿Cabe en GPU de consumo? No disponible. No se han publicado requisitos de VRAM para inferencia ni versiones cuantizadas.
- Opciones de despliegue: no se documenta compatibilidad con vLLM, llama.cpp, Ollama o TGI. El modelo requiere código y configuración compatibles con BiyiVLA/OpenPI, no es un directorio estándar de Transformers.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye comparaciones con otras políticas VLA (por ejemplo, variantes de Pi05, OpenVLA u otros modelos de la familia OpenPI), ni datos de rendimiento que permitan una comparación rigurosa. Cualquier comparación numérica sería especulativa.

## Limitaciones y advertencias

- No es un modelo listo para producción: requiere código, configuración y estadísticas de normalización compatibles con BiyiVLA/OpenPI; no se carga con `AutoModel` de Transformers.
- Licencia no declarada: no se concede explícitamente licencia de código, modelo base ni dataset; es imprescindible revisar los términos de los proyectos upstream antes de cualquier uso comercial.
- Sin evaluación de validación ni tasas de éxito: el split de validación de 85 episodios no se usó y no se calcularon métricas de validación en esta ejecución.
- Riesgo en robótica real: la model card advierte de no usar los checkpoints en operación física no supervisada sin evaluación independiente y validación de seguridad.
- Riesgo de sobreajuste al dominio: entrenado con 198 episodios de una tarea concreta (airfryer), por lo que la generalización a otros entornos, objetos o instrucciones es incierta.
- Contiene ficheros `.pt` (optimizador y metadatos): deben cargarse solo desde fuentes de confianza por el riesgo de deserialización.
- Idiomas limitados a chino e inglés en la información declarada; no se documenta cobertura de otros idiomas.
- Sesgos conocidos: no disponibles en la información proporcionada; al entrenarse con un dataset acotado, es probable que herede los sesgos de ese dataset, pero no se detallan.
- Riesgo de alucinación en instrucciones de lenguaje: no evaluado; el modelo es una política de acción, no un generador de texto general, pero no hay datos sobre su comportamiento ante instrucciones fuera de distribución.
- Artefacto histórico: los checkpoints se movieron desde un repositorio anterior; el historial Git se conserva, pero el contenido de otros pasos (4000, 8000, 12000, 15256) no forma parte de este repositorio.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/HeymanDex/BiyiVLA_Pi05_Checkpoints_split_airfryer_261105
- Dataset: https://huggingface.co/datasets/PPPPPilot/BiyiVLA
- Repositorio anterior (origen de los checkpoints): https://huggingface.co/HeymanDex/BiyiVLA-pi05-checkpoints/tree/7e2c703467fdef97aa032879fc33f280fa2c7eaf/resume/pi05_biyi_split198_bs128_1203_20261104_btWH0z
- Registro de entrenamiento en W&B: https://wandb.ai/y8hong-heymandex/BiyiVLA-Stage1/runs/lfm0133k
- Manifiesto de ejecución (en el repositorio): `run_manifest.json`
- Manifiesto de estadísticas de entrenamiento (en el repositorio): `train_stats_manifest.json`
- Manifiesto de checkpoints (en el repositorio): `checkpoints_manifest.json` y `checkpoints_menifest.json`
- Manifiesto de transferencia (en el repositorio): `transfer_manifest.json`
- Documento de parámetros de entrenamiento (en el repositorio): `训练参数1105 .txt`
