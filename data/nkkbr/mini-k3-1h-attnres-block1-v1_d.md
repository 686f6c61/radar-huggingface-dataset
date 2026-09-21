# nkkbr/Mini-K3-1H-attnres-block1-v1_D

## Resumen

Mini-K3-1H-attnres-block1-v1_D es un checkpoint de investigación de 1.016.780.524 parámetros lógicos (353.556.204 activos por token) publicado por el usuario nkkbr dentro de un estudio controlado sobre mecanismos residuales de atención ("Attention Residuals"). Se trata de un transformer decoder-only híbrido que combina 13 capas: 9 capas KDA (atención lineal con decaimiento y convolución depthwise causal) y 4 capas Gated MLA con modo posicional NoPE, más una capa densa previa a la capa MoE, que emplea 64 expertos enrutados y 2 compartidos con top-k 4.

El modelo es un proxy a pequeña escala de la arquitectura Kimi-K3, pensado para comparar variantes del mecanismo residual (PreNorm estándar, tres granularidades de bloque y AttnRes a nivel de subcapa). Su única diferencia arquitectónica respecto al baseline Block-4 publicado aparte (`nkkbr/Mini-K3-1H-v2`) es el mecanismo residual por profundidad, aplicado aquí como atención de bloque sobre grupos de 1 capa de decoder.

Es relevante ahora porque documenta de forma reproducible una ablación arquitectónica sobre atención lineal híbrida y MoE, con inicialización determinista (semilla base 20260914) y un calendario de mezcla de 16.000 millones de tokens congelado. Advertencia importante: el checkpoint publicado corresponde a la revisión `checkpoint-tokens-000000000000-init`, es decir, **0 tokens de pérdida consumidos y 0 pasos de optimizador**, por lo que no está entrenado y no debe usarse como modelo generativo funcional.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only hibrido: 9 capas KDA (atencion lineal con decaimiento y convolucion depthwise causal) + 4 capas Gated MLA (NoPE, output gate activada) + MoE; mecanismo residual por atencion de bloque |
| Parametros totales | 1.016.780.524 (logicos) |
| Parametros activos | 353.556.204 por token |
| Longitud de contexto | 8.192 tokens (longitud de secuencia de entrenamiento) |
| Tipos de cuantizacion | No disponible (solo pesos BF16 publicados; estados de control de KDA, convolucion, normalizacion y router en FP32) |
| Idiomas soportados | No disponible |
| Licencia | No disponible (la model card indica que los datasets fuente conservan sus propias licencias) |
| Formato de pesos | safetensors (`model.safetensors`), BF16, con `modeling_mini_k3.py` y `configuration_mini_k3.py` incluidos |
| Capas de decoder | 13 (indices KDA: 1, 2, 3, 5, 6, 7, 9, 10, 11; indices Gated MLA: 4, 8, 12, 13) |
| Ancho oculto / cabezas / ancho de cabeza KDA | 1.024 / 12 / 128 |
| Kernel de convolucion causal KDA | 4 |
| Grupos de decaimiento KDA por cabeza | 128 (contiguos) |
| Expertos (enrutados / compartidos / top-k) | 64 / 2 / 4 |
| Ancho oculto de experto enrutado | 512 |
| Capas densas antes de MoE | 1 |
| Mecanismo residual / capas por bloque | Block / 1 |
| Vocabulario / BOS / EOS de generacion / PAD | 163.840 / 163.584 / 163.586 / 163.839 |
| Tamano del repositorio | 2,0 GB |

## Arquitectura y entrenamiento

La arquitectura es un decoder-only de 13 capas que alterna dos mecanismos de atención: KDA (atención lineal con estado recurrente, decaimiento por grupos contiguos de 128 por cabeza y convolución causal depthwise de kernel 4) y Gated MLA (atención multi-cabeza latente con modo posicional NoPE y puerta de salida). El ancho oculto es 1.024 con 12 cabezas y ancho de cabeza KDA de 128. Sobre la capa 1 densa se apila un MoE con 64 expertos enrutados de ancho 512, 2 expertos compartidos y top-k 4. La innovación objeto del estudio es el mecanismo residual: en lugar de residuales estándar PreNorm, se aplica atención residual ("AttnRes") a nivel de bloque, aquí sobre grupos de 1 capa de decoder; el baseline de comparación es la variante Block-4.

El estudio compara cinco ejecuciones nuevas más la referencia Block-4, todas con inicialización canónica por nombre y forma (semilla base 20260914), de modo que los parámetros compartidos con el mismo nombre y forma arrancan byte-idénticos. Cada ejecución consume el mismo calendario congelado de 16.000 millones de tokens en el mismo orden, con documentos empaquetados aislados: MLA usa máscara causal bloqueada por documento y el estado recurrente de KDA y el historial de convolución corta Q/K/V se reinician en cada frontera de segmento. La receta de entrenamiento usa Muon por cabeza para las matrices Q/K/V expandidas por cabeza, Muon para el resto de matrices, AdamW como respaldo para vectores y embeddings, weight decay 0,1, QK-Clip por cabeza, decaimiento coseno, 1 % de warmup lineal y Quantile Balancing en línea con histograma de 1.000 bins; el router selecciona expertos con puntuaciones sesgadas y los combina con puntuaciones sigmoideas sin sesgo renormalizadas. No se realizó post-entrenamiento (ni RLHF ni DPO).

## Capacidades

- Generacion de texto autoregresiva a nivel de arquitectura (pipeline `text-generation`), sujeta a que el checkpoint se entrene.
- Enrutado MoE con seleccion de 4 de 64 expertos enrutados y 2 compartidos por token, con Quantile Balancing para el equilibrio de carga.
- Atencion hibrida: estado recurrente de coste constante en las capas KDA y atencion latente comprimida en las capas Gated MLA.
- Soporte de tool calling / function calling: no disponible (no hay post-entrenamiento ni plantillas de chat).
- Soporte de agentes y razonamiento multi-paso: no disponible (modelo solo preentrenado).
- Capacidades multilingues: no disponibles; no se documenta la composicion idiomatica del dataset ni del tokenizador de 163.840 entradas.
- Capacidad especial: modo de razonamiento (thinking), vision o audio: no disponibles.
- Capacidad real y verificable en su estado publicado: servir de sustrato reproducible para estudios de ablacion arquitectonica e inicializacion controlada.

## Casos de uso

- Ablacion de mecanismos residuales: comparar esta variante (AttnRes sobre bloques de 1 capa) con PreNorm y con las granularidades de bloque y Block-4 bajo el mismo calendario de tokens, aislando el efecto del residual por profundidad.
- Validacion de recetas de preentrenamiento a escala reducida: probar Muon por cabeza sobre Q/K/V, QK-Clip, decaimiento coseno y Quantile Balancing antes de escalarlos a modelos mayores tipo Kimi-K3.
- Depuracion de kernels de atencion lineal: las 9 capas KDA con kernel de convolucion 4 y 128 grupos de decaimiento por cabeza permiten validar implementaciones de decaimiento, reinicio de estado en fronteras de documento y convolucion causal.
- Investigacion sobre enrutado MoE: analizar el comportamiento del router con puntuaciones sesgadas frente a sigmoideas renormalizadas, la especializacion de los 64 expertos enrutados y el coste de los 2 compartidos con top-k 4.
- Benchmark de infraestructura de inferencia: medir throughput y latencia de un modelo de 1,02 B parametros logicos y 0,35 B activos con pesos BF16 y estados de control en FP32, comparando GPUs y frameworks personalizados.
- Estudio del tokenizador y de los tokens especiales: trabajar con el vocabulario de 163.840 entradas y con los identificadores BOS (163.584), EOS de generacion (163.586) y PAD (163.839) para tareas de empaquetado de secuencias y enmascarado.
- Punto de partida para fine-tuning controlado: partir de una inicializacion determinista y reproducible para estudiar estabilidad de entrenamiento y sensibilidad a la semilla en modelos hibridos de atencion.
- Reproduccion de artefactos: verificar la equivalencia byte a byte de los parametros compartidos entre ejecuciones usando los manifiestos JSON del repositorio.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explicitamente que es un checkpoint intermedio de investigacion en preentrenamiento, que no ha sido evaluado en tareas downstream y que solo se registran NLL y perplejidad de desarrollo fijo durante el entrenamiento en W&B y en las metricas JSONL de la ejecucion. Ademas, el checkpoint publicado corresponde a la revision `checkpoint-tokens-000000000000-init`, con 0 tokens de perdida validos consumidos y 0 pasos de optimizador, por lo que no existen resultados de rendimiento que reportar.

## Requisitos de hardware

- VRAM para los pesos en BF16: aproximadamente 2,03 GB (1.016.780.524 parametros x 2 bytes); el repositorio ocupa 2,0 GB.
- VRAM en FP32: aproximadamente 4,07 GB para los pesos.
- Estimacion de cuantizacion: no disponible (no se publican pesos cuantizados); teoricamente int8 ~1,0 GB e int4 ~0,5 GB, pero no hay artefactos ni validacion al respecto.
- VRAM total en inferencia: depende del contexto y de la implementacion; las capas KDA mantienen estado recurrente de tamano constante, mientras que las 4 capas Gated MLA acumulan cache KV con la longitud de secuencia. No hay cifras publicadas.
- GPU recomendadas: no disponible; por tamano, cualquier GPU con 8-16 GB de VRAM deberia ser suficiente para los pesos y contexto moderado (por ejemplo RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4090 24 GB, A100/H100 para lotes grandes).
- Cabe en GPU de consumo: si, por tamano de pesos, siempre que se use el codigo de modelado incluido; no hay validacion publicada.
- Opciones de despliegue: requiere PyTorch y el paquete standalone del repositorio (`modeling_mini_k3.py`, `configuration_mini_k3.py`, `initialize_model.py`, `smoke_test.py`). No hay soporte documentado en vLLM, llama.cpp, Ollama ni TGI, al tratarse de una arquitectura personalizada con atencion lineal KDA y residuales por atencion.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros totales / activos | Contexto | Arquitectura | Licencia | Estado |
|---|---|---|---|---|---|
| Mini-K3-1H-attnres-block1-v1_D | 1.016.780.524 / 353.556.204 | 8.192 tokens (entrenamiento) | Hibrida KDA + Gated MLA, MoE 64+2, AttnRes por bloque de 1 capa | No disponible | Checkpoint de inicializacion, sin entrenar ni evaluar |
| nkkbr/Mini-K3-1H-v2 (baseline Block-4) | No disponible (misma familia Mini-K3-1H) | No disponible | Hibrida KDA + Gated MLA, MoE; residual Block-4 | No disponible | Referencia publicada aparte por el mismo autor |
| OLMoE-1B-7B | 6.900 millones / 1.300 millones (segun documentacion publica) | No disponible en la informacion proporcionada | MoE denso-transformer (64 expertos, top-8) | Apache 2.0 (segun su documentacion publica) | Modelo preentrenado y ajustado, con evaluaciones publicadas |
| Kimi-K3 (modelo objetivo del estudio) | No disponible | No disponible | No disponible | No disponible | No disponible en la informacion proporcionada |

La comparacion de rendimiento no es posible: el checkpoint aqui descrito no ha sido evaluado, y la model card advierte que las clasificaciones de arquitectura a esta escala y con longitud de entrenamiento de 8K necesitan confirmacion antes de extrapolarse a Kimi-K3 completo.

## Limitaciones y advertencias

- Checkpoint sin entrenar: la revision publicada es `checkpoint-tokens-000000000000-init`, con 0 tokens objetivo consumidos y 0 pasos de optimizador. Los pesos corresponden a la inicializacion, no a un modelo funcional; las salidas seran esencialmente ruido.
- Solo preentrenamiento: no se realizo post-entrenamiento (ni RLHF ni DPO) ni ajuste por instrucciones; no debe tratarse como asistente conversacional.
- Sin evaluacion downstream: no hay benchmarks ni diagnosticos de arquitectura publicados; solo NLL y perplejidad de desarrollo durante el entrenamiento.
- Sesgos conocidos: no documentados explicitamente, pero al ser un modelo preentrenado sobre mezclas de datos web cabe esperar sesgos sociales y culturales; los datasets fuente conservan sus propias licencias y terminos.
- Riesgo de alucinacion: la model card advierte que las salidas pueden ser inexactas, sesgadas, inseguras o repetitivas.
- Limitaciones de contexto: la longitud de secuencia de entrenamiento es de 8.192 tokens; no hay validacion de extrapolacion a contextos mayores.
- Limitaciones de idioma: no se documenta la composicion idiomatica del corpus ni del vocabulario de 163.840 entradas, por lo que el soporte multilingue es desconocido.
- Restricciones de licencia: la licencia es "no disponible" en los metadatos de HuggingFace, lo que impide asumir permisos de uso comercial; ademas, el repositorio no redistribuye el texto de los datasets fuente.
- Dependencia de codigo propio: al no estar soportado por frameworks de inferencia estandar, el despliegue exige cargar el paquete standalone incluido y mantener su compatibilidad.
- Extrapolacion limitada: el propio autor advierte que los rankings de arquitectura a esta escala y con 8K de longitud de entrenamiento necesitan confirmacion antes de extrapolarse a Kimi-K3 completo.
- Estado del ciclo de vida: el tag final previsto es `checkpoint-tokens-016000000000-final`, que solo se creara tras procesar exactamente 16.000 millones de objetivos de perdida validos; esta revision esta muy lejos de ese punto.
- Adopcion nula: 0 descargas y 0 "likes" en el momento de la consulta, sin comunidad ni incidencias documentadas.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/nkkbr/Mini-K3-1H-attnres-block1-v1_D
- Perfil del autor: https://huggingface.co/nkkbr
- Baseline Block-4 citado en la model card: https://huggingface.co/nkkbr/Mini-K3-1H-v2
- Ficheros incluidos en el repositorio (referenciados en la model card): `modeling_mini_k3.py`, `configuration_mini_k3.py`, `initialize_model.py`, `smoke_test.py`, `ARCHITECTURE_PACKAGE_README.md`, `ARCHITECTURE.md`, `VARIANT.md`, `config.json`, manifiestos JSON de entrenamiento.
- Paper, blog o demo adicionales: no disponible; la busqueda web realizada no devolvio resultados relevantes sobre este modelo (los resultados obtenidos correspondian a contenidos inmobiliarios y educativos sin relacion con el modelo).
