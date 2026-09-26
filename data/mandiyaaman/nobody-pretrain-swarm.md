# mandiyaaman/nobody-pretrain-swarm

## Resumen

Project Nobody (Blueprint 4.0) es un repositorio de arquitectura y marco de entrenamiento distribuido publicado por el usuario mandiyaaman en HuggingFace bajo el identificador `mandiyaaman/nobody-pretrain-swarm`. No se trata de un modelo con pesos publicados y listos para inferencia, sino de un blueprint de arquitectura de modelo fundacional híbrido junto con la infraestructura de entrenamiento en enjambre que lo soporta. La model card describe una arquitectura que combina atención recurrente lineal (Gated DeltaNet), memoria asociativa con compuerta de sorpresa (Titans), atención latente diferencial (Diff-MLA) y una capa Mixture-of-Experts de 8+1 expertos, además de cabezas de predicción multi-token (MTP).

El proyecto pone el foco en dos ejes: por un lado, la innovación arquitectónica orientada a razonamiento extenso y recuperación asociativa rápida de memoria; por otro, el método de entrenamiento descentralizado Decoupled DiLoCo, que permite coordinar islas de cómputo independientes (en este caso instancias de Kaggle con doble GPU NVIDIA T4 de 16 GB) sincronizando pseudo-gradientes comprimidos en BF16 a través de internet convencional.

La relevancia actual del repositorio reside en su propuesta de entrenamiento distribuido sobre hardware heterogéneo y de gama baja, un enfoque poco habitual frente a los clústeres centralizados que dominan el preentrenamiento de modelos fundacionales. Con cero descargas y una sola interacción registrada, el proyecto se encuentra en una fase muy temprana y no publica ni pesos, ni número de parámetros, ni resultados de evaluación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Híbrida recurrente-atencional con MoE: Gated DeltaNet + Titans Surprise-Gated Memory + Differential Multi-Head Latent Attention (Diff-MLA) + MoE 8+1 + cabezas Multi-Token Prediction (3 pasos) |
| Parametros totales | no disponible |
| Parametros activos | no disponible (el enrutado es Top-2 sobre 8 expertos enrutados más 1 experto compartido siempre activo) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible para pesos de inferencia; en entrenamiento se usa FP16 con escalado dinámico de pérdida y compresión BF16 de pseudo-gradientes para la sincronización DiLoCo |
| Idiomas soportados | en (inglés) |
| Licencia | Apache 2.0 |
| Formato de pesos | no disponible (el repositorio publica código y configuración, no artefactos de pesos) |

## Arquitectura y entrenamiento

La arquitectura se organiza en un bloque híbrido que combina una capa recurrente con estado lineal (Gated DeltaNet), con reglas de actualización asociativa rápida y decaimiento de retención específico por cabeza, y una matriz de memoria neuronal de doble plasticidad (Titans Surprise-Gated Memory) gobernada por un gradiente de sorpresa asociativa (S_t = v_t − y_t) y una compuerta de olvido adaptativa (α_t). Ambos estados recurrentes se reinician a cero cuando aparece el token ID 0 (`<|endoftext|>`), lo que evita la contaminación de memoria entre documentos empaquetados en una misma secuencia. A esto se añade el Perception Engine basado en Differential Multi-Head Latent Attention, con cancelación sustractiva de ruido, compresión latente de clave-valor de rango bajo (d_latent = 64) y embeddings posicionales rotatorios (RoPE).

La capa de cómputo densa se sustituye por un MoE de grano fino con 1 experto SwiGLU compartido siempre activo y 8 expertos enrutados con enrutado Top-2 (k = 2). El equilibrado de carga se realiza sin pérdida auxiliar, mediante adaptación del sesgo del router, complementado con una regularización z-loss de router de 10⁻⁴. Sobre la salida se apilan cabezas de predicción multi-token a tres pasos (T+1, T+2, T+3) con ponderación geométrica de la pérdida (1.0, 0.5, 0.25).

El entrenamiento emplea Decoupled DiLoCo sobre islas de Kaggle con doble T4 de 16 GB. Cada isla ejecuta DeepSpeed ZeRO-2 con offload del optimizador a CPU, FP16 con escalado dinámico de pérdida y agrupación estricta de parámetros (weight decay 0.0 para tensores 1D, de normalización, del router y de memoria). La sincronización entre islas se produce cada H = 250 pasos (aproximadamente 32,7 millones de tokens por ronda e isla) mediante pseudo-gradientes Δ_k = θ_global − θ_local comprimidos en BF16, con una carga útil aproximada de 287 MB. La agregación externa es asíncrona y usa momento de gradiente acelerado de Nesterov (η_outer = 0.70, β_outer = 0.90). El currículo sigue un esquema Warmup-Stable-Decay de dos etapas: 200 pasos de warmup, 80 % de fase estable y 20 % de aneuclamiento coseno. El tokenizador es el de GPT-2. No se especifican en la información disponible el número de tokens totales de entrenamiento, la composición del dataset ni si hubo fases de RLHF o DPO.

## Capacidades

- Generación de texto en inglés: el tokenizador y el idioma declarado son exclusivamente ingleses (en).
- Razonamiento y recuperación asociativa: la arquitectura Gated DeltaNet + Titans está diseñada explícitamente para razonamiento extenso y recuerdo asociativo de memoria rápida.
- Memoria de largo alcance con reinicio por documento: los estados recurrentes se reinician al encontrar el token de fin de documento, lo que favorece el procesamiento de secuencias empaquetadas sin fugas entre documentos.
- Predicción multi-token: las cabezas MTP permiten generar varios tokens por paso, lo que abre la puerta a decodificación especulativa interna.
- Capacidades de código, matemáticas, visión, audio, tool calling o agentes: no disponibles. La model card no documenta ninguna de ellas y no se han publicado pesos con los que verificarlas.
- Capacidades multilingües: no disponibles; solo se declara inglés.
- Modo thinking explícito: no disponible.

## Casos de uso

- Investigación en arquitecturas híbridas SSM-atención: el repositorio sirve como referencia reproducible para estudiar la combinación de Gated DeltaNet, memoria Titans y Diff-MLA en un mismo bloque, con el código de ensamblaje y configuración publicado.
- Experimentación con entrenamiento federado de bajo presupuesto: el enfoque Decoupled DiLoCo permite a grupos de investigación sin clúster propio coordinar islas en Kaggle o hardware heterogéneo, sincronizando cada 250 pasos con payloads BF16 de unos 287 MB.
- Estudio de predicción multi-token y decodificación especulativa: las cabezas MTP con horizontes T+1, T+2 y T+3 y ponderación geométrica son un banco de pruebas para medir la ganancia de throughput sin modelo borrador externo.
- Investigación sobre enrutado MoE sin pérdida auxiliar: la implementación de equilibrado por sesgo de router más z-loss permite evaluar estabilidad de entrenamiento en regímenes de grano fino (8+1 expertos, Top-2).
- Análisis de contaminación de contexto en secuencias empaquetadas: el reinicio de estado por token de frontera es directamente reutilizable para estudiar fugas de memoria entre documentos en pipelines de preentrenamiento.
- Desarrollo de infraestructura de sincronización distribuida: `run_coordinator.py` y `outer_coordinator.py` implementan un optimizador Nesterov externo con sincronización de deltas contra el Hub, útil como base para coordinar entrenamientos asíncronos.
- Evaluación comparativa de esquemas de currículo WSD: el repositorio expone la configuración completa del schedule warmup-stable-decay, reutilizable para experimentos de ablación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- Entrenamiento (según la model card): islas con doble GPU NVIDIA T4 de 16 GB de VRAM, sobre instancias de Kaggle.
- Gestión de memoria en entrenamiento: DeepSpeed ZeRO-2 con offload del optimizador a CPU, FP16 con escalado dinámico de pérdida.
- Ancho de banda de sincronización: pseudo-gradientes comprimidos en BF16 con una carga útil aproximada de 287 MB por ronda de sincronización, lo que permite transmitirlos por internet convencional.
- Hardware de inferencia recomendado: no disponible; no se publican pesos ni requisitos.
- VRAM estimada para inferencia: no disponible.
- Encaje en GPU de consumo: no disponible.
- Opciones de despliegue (vLLM, llama.cpp, Ollama, TGI): no disponibles; el repositorio no incluye artefactos de pesos ni scripts de servicio.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

La comparativa se establece frente a otras arquitecturas híbridas de la misma categoría, ya que el modelo evaluado no publica parámetros, pesos ni evaluaciones. Los datos de los modelos alternativos provienen de sus fichas públicas.

| Modelo | Arquitectura | Parametros | Contexto | Licencia | Pesos publicados |
|---|---|---|---|---|---|
| Project Nobody (este) | Híbrida: DeltaNet + Titans + MLA + MoE 8+1 + MTP | no disponible | no disponible | Apache 2.0 | No |
| Jamba (AI21) | Híbrida Mamba-Transformer con MoE | Aprox. 52B totales / 12B activos | 256K | Apache 2.0 (variantes abiertas) | Sí |
| Zamba2 (Zyphra) | Híbrida Mamba2-Transformer con MoE | Gama de 1,2B a 7B según variante | 128K o superior según variante | Apache 2.0 | Sí |
| RWKV-7 (variantes abiertas) | Recurrente lineal pura (no transformer) | Gama de 0,1B a 14B según variante | No disponible de forma unificada | Apache 2.0 en variantes abiertas | Sí |

## Limitaciones y advertencias

- No hay pesos publicados: el repositorio contiene una arquitectura y un marco de entrenamiento, no un modelo entrenado utilizable. No es posible hacer inferencia directamente desde este identificador de HuggingFace.
- Ausencia total de métricas: no se publican resultados de MMLU, HumanEval, GSM8K ni de ninguna otra evaluación, por lo que no existe evidencia empírica del rendimiento de la arquitectura propuesta.
- Número de parámetros y longitud de contexto no declarados: impide estimar costes de despliegue, requisitos de VRAM o adecuación a tareas de contexto largo.
- Idiomas: únicamente inglés declarado, con tokenizador GPT-2, lo que limita su uso en castellano u otras lenguas sin un ajuste adicional.
- Fase temprana del proyecto: cero descargas y una sola interacción registrada; el proyecto no cuenta con validación por parte de la comunidad.
- Riesgo de alucinación: no evaluable sin pesos ni benchmarks, pero presente por defecto en cualquier modelo generativo de este tipo.
- Sesgos: no documentados por el autor y no evaluables sin artefactos publicados.
- Afirmaciones no verificadas: la model card describe el proyecto como "frontier-grade" y orientado a "razonamiento extremo", pero no aporta datos que respalden esas afirmaciones.
- Licencia Apache 2.0: permite uso comercial del código y de hipotéticos pesos derivados, siempre que se conserven los avisos de copyright y atribución correspondientes.
- Dependencia de infraestructura de terceros: el flujo de entrenamiento depende de instancias de Kaggle y del Hub de HuggingFace para la sincronización, lo que introduce acoplamiento con políticas y cuotas de esas plataformas.
- Fecha de creación declarada en 2026-09-25: conviene verificar la coherencia temporal del repositorio antes de tomarlo como referencia.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/mandiyaaman/nobody-pretrain-swarm
- Repositorio relacionado del mismo autor: https://huggingface.co/mandiyaaman/nobody
- Perfil de GitHub del autor: https://github.com/MANDIYAAMAN
- Referencia sobre el marco DiLoCo y entrenamiento descentralizado: https://github.com/openai/swarm (mencionado en resultados de búsqueda, sin relación directa con este modelo)
