# reaperdoesntknow/Discovery

## Resumen

DiscoverLM-70M-Base es un modelo de lenguaje causal de 70 millones de parámetros desarrollado por el usuario de Hugging Face `reaperdoesntknow`. Su particularidad no reside en el tamaño, sino en la arquitectura: implementa lo que el autor denomina Mixture-of-Attentions (MoA), un mecanismo de atención basado en distancias métricas (distancia de Mahalanobis diagonal aprendida) en lugar del producto escalar Q·Kᵀ habitual, con un regularizador que impone la desigualdad triangular sobre tripletas muestreadas durante el entrenamiento. El modelo se distribuye con pesos en safetensors y requiere código personalizado (`MoA`) para su carga, ya que no es compatible con la implementación estándar de transformers.

El modelo ha sido entrenado mediante SFT (supervised fine-tuning) con TRL sobre tres conjuntos de datos: `nohurry/Opus-4.6-Reasoning-3000x-filtered` (razonamiento multi-paso), `openbmb/UltraData-Math` (matemáticas) y `yahma/alpaca-cleaned` (instrucciones generales). Incorpora un tokenizador propio de 48.000 tokens con tokens especiales para chat y modo de razonamiento (`<|think|>`, `<|reasoning|>`). El repositorio ocupa 0,3 GB y acumula 1.571 descargas en el momento de la consulta.

Su relevancia es fundamentalmente experimental: propone una alternativa geométricamente motivada a la atención estándar (BlackHoleRoPE, enrutado top-2 de cuatro rutas de atención, HyperFFN de tres ramas y una cabeza LM con su propia mezcla de atenciones). No obstante, su escala de 70M parámetros y la ausencia de benchmarks publicados lo sitúan como una prueba de concepto más que como un modelo listo para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal con Mixture-of-Attentions (MoA): atención métrica por distancia de Mahalanobis diagonal, 4 rutas enrutadas top-2, BlackHoleRoPE, HyperFFN de 3 ramas, MoA LM head |
| Parametros totales | 70.569.408 (según safetensors); el autor reporta 69,1M en su desglose |
| Parametros activos | No aplica (no es MoE denso clásico; el enrutado top-2 es por token dentro de cada bloque, no un MoE de expertos FFN) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | Inglés (`en`) |
| Licencia | `cc` (Creative Commons, variante no especificada en la información disponible) |
| Formato de pesos | safetensors |

Desglose de parámetros reportado por el autor: embedding de tokens compartido 24,6M (35,5%), 4 bloques MoA 28,9M (41,8%), HyperFFN compartido 4,2M (6,1%), MoA LM head 10,8M (15,6%), RoPE y normalizaciones 0,6M (0,9%).

## Arquitectura y entrenamiento

La arquitectura sustituye la puntuación de atención por producto escalar por una distancia métrica: cada una de las 64 cabezas opera en un espacio de 8 dimensiones con su propia escala diagonal (métrica de Mahalanobis), un origen de bola aprendible y un radio adaptativo que enmascara pares fuera de la bola antes del softmax. Durante el entrenamiento se aplica un regularizador sobre tripletas aleatorias para forzar la desigualdad triangular (d(a,c) ≤ d(a,b) + d(b,c)). Cada bloque MoA combina cuatro rutas paralelas —convolución local depthwise, atención métrica multi-cabeza completa, mezcla de canales con gating y atención métrica multi-query— seleccionando las dos mejores por token mediante un router aprendido, con feature gates y conexión residual con DropPath.

El componente posicional, BlackHoleRoPE, aplica perturbaciones de fase aprendidas sobre una base de Fourier compacta manteniendo rotaciones Q/K unitarias y una compuerta de energía acotada en [0,5, 2,0] sobre las amplitudes de V. La FFN (HyperFFN) tiene tres ramas (SwiGLU, convolución causal depthwise separable y cuello de botella low-rank con gating) también enrutadas top-2. La cabeza LM ejecuta su propia mezcla de atenciones (32 cabezas, head_dim=16) antes de proyectar a los 48.000 logits con pesos compartidos con el embedding de entrada.

El entrenamiento se realizó mediante SFT con TRL sobre los tres datasets citados. No se especifican en la información disponible el número de tokens de entrenamiento, la composición exacta del dataset, ni si hubo etapas de RLHF o DPO adicionales.

## Capacidades

- Generación de texto causal en inglés con tokenizador propio de 48.000 tokens.
- Razonamiento multi-paso, entrenado explícitamente sobre el dataset `Opus-4.6-Reasoning-3000x-filtered`.
- Resolución de problemas matemáticos, con entrenamiento sobre `UltraData-Math`.
- Seguimiento de instrucciones generales, vía `alpaca-cleaned`.
- Formato de chat estructurado con tokens especiales `<|system|>`, `<|user|>`, `<|assistant|>`.
- Modo de razonamiento interno con tokens `<|think|>` y `<|reasoning|>`.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y multi-step reasoning orquestado: no disponible; el modelo tiene marcadores de razonamiento pero no se documenta integración con herramientas.
- Capacidades multimodales (visión, audio): no disponibles.
- Capacidades multilingües: limitadas al inglés según la model card.

## Casos de uso

- Investigación en arquitecturas de atención alternativa: el modelo sirve como banco de pruebas reproducible para estudiar si la atención métrica con desigualdad triangular mejora la generalización frente a la atención por producto escalar en tareas controladas.
- Experimentos académicos sobre sesgo geométrico: permite comparar el comportamiento de un transformer estándar de 70M con uno MoA del mismo presupuesto de parámetros, aislando el efecto de la métrica en la atención.
- Generación de texto en inglés para prototipos de bajo coste: con 70M parámetros y pesos safetensors de 0,3 GB, puede ejecutarse en CPU o en GPUs de gama baja para demos de generación condicionada por prompt.
- Fine-tuning educativo con TRL: el pipeline de SFT documentado (TRL + datasets públicos) facilita reproducir el entrenamiento en entornos docentes o de aprendizaje.
- Estudio de tokenizadores personalizados: su vocabulario de 48.000 tokens con tokens de control de razonamiento permite analizar el impacto del diseño del tokenizador en modelos pequeños.
- Evaluación de robustez de RoPE: BlackHoleRoPE (fase aprendida + gating de energía en V) es un objeto de estudio para quienes investigan codificaciones posicionales alternativas.
- Generación de razonamiento corto en inglés para tareas de matemáticas elementales: el entrenamiento sobre UltraData-Math lo hace adecuado para experimentos de chain-of-thought en dominios acotados, siempre con expectativas limitadas por su escala.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: con 70,6M parámetros, los pesos en fp32 ocupan aproximadamente 282 MB; en fp16, unos 141 MB; en int8, unos 71 MB. El repositorio completo ocupa 0,3 GB.
- GPU recomendadas: cualquier GPU con al menos 1 GB de VRAM es suficiente; una RTX 3060, RTX 4060 o incluso una GTX 1650 pueden alojar el modelo con holgura. Para entrenamiento o fine-tuning, una RTX 4090 o A100 no son necesarias pero aceleran el proceso.
- Cabe en GPU consumer: sí, en prácticamente cualquier GPU consumer moderna e incluso en iGPU con memoria compartida suficiente.
- Opciones de despliegue: requiere código personalizado (`MoA.py` con `MoAMetricLM` y `MoAMetricConfig`) cargado vía `transformers`; no se documenta compatibilidad con vLLM, llama.cpp, Ollama o TGI, y al no ser una arquitectura estándar es improbable que estos motores lo soporten sin adaptación.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Arquitectura | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| DiscoverLM-70M-Base | 70,6M | No disponible | MoA (atención métrica) | `cc` | Hugging Face, requiere código custom |
| GPT-2 small | 124M | 1.024 tokens | Transformer estándar | MIT | Hugging Face, transformers nativo |
| TinyLlama-1.1B | 1,1B | 2.048 tokens | Transformer (Llama) | Apache 2.0 | Hugging Face, amplio ecosistema |
| Qwen2.5-0.5B | 0,49B | 32.768 tokens | Transformer (Qwen2) | Apache 2.0 | Hugging Face, vLLM/llama.cpp |

La comparación es aproximada: DiscoverLM-70M es un experimento arquitectónico, mientras que los alternativos son modelos de producción con benchmarks publicados y soporte de motores de inferencia. No se dispone de datos de rendimiento comparables para DiscoverLM-70M.

## Limitaciones y advertencias

- Ausencia total de benchmarks publicados: no hay evidencia cuantitativa de calidad, por lo que no debe asumirse un rendimiento equiparable a transformers estándar del mismo tamaño.
- Escala muy reducida (70M parámetros): capacidad limitada para razonamiento complejo, conocimiento factual y coherencia en generaciones largas, independientemente de la arquitectura.
- Solo inglés: no se documenta soporte multilingüe; el uso en castellano probablemente produzca resultados pobres.
- Licencia `cc` sin variante especificada: la información disponible no aclara si permite uso comercial; debe verificarse antes de cualquier despliegue productivo.
- Código de carga no estándar: requiere el módulo `MoA` del autor, lo que dificulta la integración con pipelines existentes y aumenta el riesgo de incompatibilidades futuras.
- Riesgo de alucinación elevado por el tamaño y por el entrenamiento sobre datasets de razonamiento filtrados, sin etapa de alineación documentada (RLHF/DPO no mencionados).
- Longitud de contexto no documentada: no puede planificarse su uso en tareas de contexto largo.
- Sesgos: no se documentan evaluaciones de sesgo; el entrenamiento sobre alpaca-cleaned y datasets sintéticos de razonamiento puede introducir sesgos de estilo y dominio.
- Proyecto de autor individual con 0 likes y un único mantenedor: riesgo de falta de mantenimiento y de soporte a largo plazo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/reaperdoesntknow/Discovery
- Dataset de razonamiento: https://huggingface.co/datasets/nohurry/Opus-4.6-Reasoning-3000x-filtered
- Dataset de matemáticas: https://huggingface.co/datasets/openbmb/UltraData-Math
- Dataset de instrucciones: https://huggingface.co/datasets/yahma/alpaca-cleaned
- Paper, blog o repositorio adicional: no disponible en la información proporcionada.
