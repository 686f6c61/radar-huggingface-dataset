# gabe-adib/ove3-k3paper-refit-c3.2e19-h768-lrx1.7

## Resumen

ove3-k3paper-refit-c3.2e19-h768-lrx1.7 es un checkpoint de investigación publicado por el usuario gabe-adib en HuggingFace. Se trata de una única tirada de entrenamiento dentro de los barridos de la receta ove3 K3, en su variante K3-PAPER (la receta de Kimi K3 tal como se publicó). No es un modelo con ajuste por instrucciones ni un artefacto listo para producción: es el resultado de un experimento de reajuste de la tasa de aprendizaje sobre una arquitectura kimi_linear MoE de 768 dimensiones ocultas, con LatentMoE de 512 expertos de media anchura (top-16), Attention Residuals, SiTU-GLU, puerta de salida MLA y KDA full-rank.

El interés del artefacto es de investigación, no de producto. Documenta un punto concreto de un barrido IsoFLOP: 3,2e19 FLOPs de entrenamiento, 34,34 mil millones de caracteres vistos en 32.747 pasos y una tasa de aprendizaje de 0,00799449, equivalente a 1,7 veces la ley de LR del run de control en esa misma celda. El autor publica el checkpoint junto con los logs, los eventos de TensorBoard y el `config.yaml`, lo que permite reproducir y auditar el run paso a paso, incluida la pérdida de validación (1,0731) y la pérdida held-out (1,1594 nats/carácter).

El repositorio, de 16,8 GB, contiene el checkpoint `best_1` en formato distribuido de Megatron con el estado del optimizador incluido. Registra 0 descargas y 0 likes, no declara licencia, idiomas ni pipeline, y no acompaña el modelo de tokenizador, benchmarks estándar ni instrucciones de inferencia. Por tanto, cualquier evaluación externa exige cargar el checkpoint con Megatron-LM o escribir un conversor propio.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | kimi_linear MoE (atención lineal KDA + MLA con puerta de salida) con Attention Residuals (block size 2) |
| Parámetros totales | no disponible (estimación derivada del tamaño del repo: ~0,9-1,1 mil millones; ver nota) |
| Parámetros activos | no disponible (estimación derivada de los FLOPs: ~155 M; ver nota) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (solo se publica checkpoint distribuido; no hay GGUF, AWQ ni GPTQ) |
| Idiomas soportados | no disponible (evaluación held-out sobre 9 dominios sin especificar) |
| Licencia | no disponible |
| Formato de pesos | checkpoint distribuido de Megatron (incluye estado del optimizador); no hay safetensors ni GGUF |
| Dimensión oculta | 768 |
| Expertos | 512 expertos de media anchura, top-16, ratio latente 0,5, sesgo de experto por cuantiles sin aux loss |
| Activación | SiTU-GLU |
| Optimizador | Muon por cabeza con qk_clip |
| Normalización | RMSNorm con eps 1e-5; salida de atención MLA en fp32; router scaling 1,0 |
| Tokens de entrenamiento | 34,34 mil millones de caracteres |
| Pasos de entrenamiento | 32.747 (lote global 128 × 8.192 caracteres) |
| Semilla | 1234 |
| Tasa de aprendizaje | 0,00799449 (1,7x la ley de LR del run de control) |
| Tamaño del repositorio | 16,8 GB |
| Descargas / likes | 0 / 0 |
| Fecha de publicación | 2026-10-20 |

Nota sobre los parámetros: el autor no publica el recuento. La cifra de ~155 M de parámetros activos se deriva de 3,2e19 FLOPs / (6 × 34,34e9 caracteres), aplicando la aproximación 6ND y asumiendo que solo los parámetros activos computan. La cifra de ~1.000 M totales se deriva del tamaño del checkpoint con estado del optimizador (~14-16 GB a ~16 bytes por parámetro). Ambas son estimaciones propias, no confirmadas, y pueden desviarse por el formato de almacenamiento y por los buffers de Muon.

## Arquitectura y entrenamiento

El modelo sigue la familia kimi_linear: un transformer híbrido en el que el mecanismo principal es KDA (Kimi Delta Attention) en configuración full-rank, con puerta de seguridad y cota inferior de -5, combinado con atención MLA provista de puerta de salida y calculada en fp32. Sobre esa columna vertebral se sitúa un bloque LatentMoE con 512 expertos de media anchura, enrutado top-16 y ratio latente 0,5, con un sesgo de experto ajustado por cuantiles que evita la pérdida auxiliar de balanceo. Se añaden Attention Residuals con block size 2 y una FFN con activación SiTU-GLU. La dimensión oculta es 768 en todas las capas.

El entrenamiento se realizó con Muon por cabeza más qk_clip, RMSNorm con eps 1e-5 y un schedule coseno al estilo K3: 1 % de warmup lineal y decaimiento hasta lr/10. El lote global es de 128 secuencias × 8.192 caracteres, con 32.747 pasos resueltos de forma que los FLOPs totales igualen la celda de control (3,2e19 FLOPs). La pérdida se mide en nats por carácter, no por token, lo que confirma un modelado a nivel de carácter o de unidad subword muy fina; la evaluación held-out se pondera sobre 9 dominios cuyos NLL individuales están en `DOMAIN_NLL.txt`. No se documenta composición del dataset, ni fases de RLHF/DPO, ni ajuste por instrucciones: es un modelo base de lenguaje.

## Capacidades

- Modelado de lenguaje autorregresivo a nivel de carácter sobre texto de 9 dominios, según la evaluación held-out del propio autor.
- Enrutado MoE disperso con 512 expertos y top-16, con balanceo por sesgo de cuantiles sin pérdida auxiliar.
- Atención lineal KDA de rango completo, diseñada para secuencias largas, aunque la longitud de contexto efectiva no está documentada.
- Capacidad de servir como referencia reproducible de un punto IsoFLOP concreto para estudios de escalado y de leyes de learning rate.
- Reproducción exacta del run: semilla 1234, `config.yaml`, logs por segmentos de 4 horas y eventos de TensorBoard incluidos.
- Reanudación de entrenamiento: el checkpoint incorpora estado del optimizador, por lo que permite continuar el run en Megatron-LM.
- Tool calling / function calling: no disponible; no hay evidencia de soporte ni formato de plantilla publicado.
- Soporte de agentes y razonamiento multi-paso: no disponible; no hay ajuste por instrucciones ni modo thinking documentado.
- Multilingüismo: no disponible; no se declaran idiomas y los 9 dominios de evaluación no se identifican en la model card.
- Visión, audio o modalidades adicionales: no disponibles.

## Casos de uso

- Estudio de leyes de escalado y de la tasa de aprendizaje: el run sirve como punto de datos con LR a 1,7x la ley del control en una celda IsoFLOP fija de 3,2e19 FLOPs, útil para contrastar predicciones de curvas de pérdida frente a la receta base.
- Reproducibilidad de recetas MoE: los logs por segmentos de 4 horas, los eventos de TensorBoard y el `config.yaml` permiten reconstruir la curva de validación y verificar que la pérdida final (1,0731) se alcanza en el paso 32.740, no en el último paso.
- Investigación sobre balanceo de expertos sin pérdida auxiliar: el sesgo de cuantiles sobre 512 expertos top-16 se puede instrumentar para medir carga por experto y comparar con variantes con aux loss.
- Ablación de atención lineal frente a atención completa: al usar KDA de rango completo junto con MLA con puerta, el checkpoint permite medir perplejidad y estabilidad en secuencias largas dentro de la misma familia kimi_linear.
- Validación de infraestructura Megatron: el checkpoint distribuido con estado del optimizador es un caso de prueba realista (16,8 GB) para probar pipelines de conversión, sharding y reanudación en clúster.
- Experimentos de destilación o continued pretraining: al ser un modelo base pequeño en parámetros activos y con pérdida expresada en nats/carácter, es un punto de partida manejable para ajustes con corpus propios en dominio.
- Docencia y divulgación: permite ilustrar en un caso real cómo interactúan Muon, qk_clip, RMSNorm, SiTU-GLU y un router MoE sin necesidad de un clúster grande.
- Generación de texto en producción o atención al cliente: no recomendado con este artefacto, al no existir ajuste por instrucciones, plantilla de chat, tokenizador publicado ni licencia declarada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K ni similares) en la información disponible. Las únicas métricas del autor son de pérdida del propio run:

| Métrica | Valor | Contexto |
|---|---|---|
| Pérdida de validación (LM loss) | 1,0731 | Mejor paso: iteración 32.740 (checkpoint `best_1`) |
| Pérdida held-out | 1,1594 nats/carácter | Media ponderada sobre 9 dominios; detalle por dominio en `DOMAIN_NLL.txt` |
| FLOPs de entrenamiento | 3,2e19 | Celda IsoFLOP, igualada con la celda de control |
| Caracteres vistos | 34,34 mil millones | 32.747 pasos × lote 128 × 8.192 caracteres |

Advertencia metodológica: la pérdida en nats por carácter no es comparable con perplejidades por token de otros modelos, ya que depende de la unidad de tokenización y del corpus. Sin `DOMAIN_NLL.txt` y sin la composición del dataset, estos valores no permiten situar el modelo frente a alternativas.

## Requisitos de hardware

- VRAM de inferencia (estimación derivada, no confirmada): con ~1.000 M de parámetros totales, en bf16/fp16 harían falta unos 2 GB de pesos; en fp32, unos 4 GB; en int8, ~1 GB; en int4, ~0,5 GB. A ello hay que sumar activaciones y caché KV, cuyo tamaño no se puede calcular porque no se documentan número de capas ni longitud de contexto.
- VRAM para reanudar entrenamiento: el checkpoint incluye estado del optimizador (16,8 GB de repo), por lo que se necesita espacio en disco equivalente y memoria de GPU para pesos, momentos y estados de Muon; el reparto exacto depende del paralelismo configurado en el `config.yaml`.
- GPU recomendadas: para inferencia, cualquier GPU consumer con 8 GB o más debería alojar los pesos según la estimación anterior (RTX 3060 12 GB, RTX 4070, RTX 4090). Para reanudar el entrenamiento, el mínimo realista es una A100 40/80 GB o H100, dado el estado del optimizador y el uso de Megatron.
- ¿Cabe en GPU consumer? Los pesos sí, según la estimación; el entrenamiento completo, no sin trocear el estado del optimizador.
- Opciones de despliegue: Megatron-LM para carga y reanudación nativa. No hay evidencia de soporte en vLLM, TGI, llama.cpp ni Ollama: la arquitectura kimi_linear con KDA, LatentMoE y Attention Residuals no es estándar y no se publican pesos en safetensors ni GGUF, por lo que haría falta un conversor y posiblemente kernels propios.
- Latencia y throughput: no disponibles. No se publican mediciones y, sin tokenizador ni instrucciones de inferencia, no son estimables de forma fiable.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Datos de rendimiento | Disponibilidad |
|---|---|---|---|---|---|
| ove3-k3paper-refit-c3.2e19-h768-lrx1.7 | no disponible (~1.000 M totales / ~155 M activos, estimado) | no disponible | no disponible | pérdida validación 1,0731; held-out 1,1594 nats/carácter | repo HF con checkpoint Megatron, logs y config |
| Run de control de la receta ove3 K3 (misma celda IsoFLOP, LR de la ley base) | no disponible | no disponible | no disponible | no disponible (solo se cita como referencia del LR) | no se referencia un repo público en la información disponible |
| Kimi K3 / familia Kimi Linear (receta original K3-PAPER) | no disponible | no disponible | no disponible | no disponible | no disponible en la información proporcionada |

No se dispone de datos verificables de parámetros, contexto, licencia ni benchmarks de las alternativas citadas en la model card, por lo que no es posible establecer una comparación cuantitativa. Cualquier tabla comparativa con modelos de la misma categoría (MoE dispersos de ~1.000 M totales con atención lineal) requeriría consultar sus model cards y repositorios, que no forman parte de la información disponible.

## Limitaciones y advertencias

- Licencia no declarada: sin licencia explícita no hay autorización clara de uso comercial; hay que contactar con el autor antes de cualquier despliegue.
- Artefacto de investigación, no de producto: es un modelo base sin ajuste por instrucciones, sin plantilla de chat y sin evaluación de seguridad.
- Sin tokenizador documentado: la model card no describe vocabulario ni configuración de tokenización; la pérdida en nats/carácter y el lote en caracteres sugieren modelado a nivel de carácter, lo que condiciona cualquier integración.
- Sin benchmark estándar: no hay MMLU, HumanEval, GSM8K ni evaluación de alucinación; no se puede afirmar nada sobre fiabilidad factual.
- Sesgos desconocidos: no se documenta composición del dataset ni filtrado, por lo que no es posible caracterizar sesgos de género, idioma, dominio o cultura.
- Riesgo de alucinación: no evaluado; al ser un modelo base pequeño y entrenado con 34,34 mil millones de caracteres, la generación libre tenderá a divagar sin verificación factual.
- Contexto e idiomas no documentados: aunque KDA esté orientado a secuencias largas, no hay longitud de contexto declarada ni idiomas soportados; los 9 dominios de evaluación no se identifican en la model card.
- Métricas no comparables: la pérdida en nats/carácter no es equiparable a perplejidad por token de otros modelos.
- Un solo run y una sola semilla (1234): no hay intervalo de confianza ni repeticiones, por lo que las diferencias frente al control no se pueden separar del ruido sin los datos completos del barrido.
- Fricción de despliegue: formato distribuido de Megatron con estado del optimizador, sin safetensors ni GGUF; no hay soporte conocido en vLLM, TGI, llama.cpp u Ollama.
- Fallo de búsqueda: los resultados de búsqueda web disponibles no guardan relación con el modelo (son páginas de alforjas y bolsas para bicicletas), por lo que no aportan información técnica ni enlaces verificables.
- Sin señales de adopción: 0 descargas y 0 likes, sin issues ni discusión pública, lo que implica ausencia de validación externa.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/gabe-adib/ove3-k3paper-refit-c3.2e19-h768-lrx1.7
- `checkpoint/`: checkpoint `best_1` distribuido de Megatron con estado del optimizador (iteración 32.740), dentro del repositorio anterior.
- `logs/`: logs de entrenamiento por segmentos de 4 horas, logs de scoring y eventos de TensorBoard, dentro del repositorio anterior.
- `config.yaml`: configuración del run, dentro del repositorio anterior.
- `DOMAIN_NLL.txt`: pérdida por dominio de la evaluación held-out, dentro del repositorio anterior.
- Papers, blogs, repositorios o demos adicionales: no disponibles. La búsqueda web realizada no devolvió resultados relevantes para este modelo.
