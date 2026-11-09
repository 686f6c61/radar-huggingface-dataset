# robgarct/gated_deltanet-120m-rare4-6k

## Resumen

`gated_deltanet-120m-rare4-6k` es un modelo de lenguaje de 120 millones de parámetros desarrollado por el usuario robgarct como parte de una familia de ablaciones sobre circuitos de recuerdo en contexto (recurrent recall circuits). Se trata de un experimento de investigación centrado en arquitecturas de atención lineal, concretamente Gated DeltaNet, y no de un modelo pensado para uso general en producción. El objetivo declarado es medir cómo la puerta de salida por cabeza influye en la capacidad del modelo de recuperar información rara en contexto.

El modelo entrena sobre The Pile con 6.000 actualizaciones (3.146B tokens, batch global de 256 × 2.048) y un objetivo de pérdida peculiar: `rare4`, que aplica un factor de 4 a la pérdida de los tokens que completan un bigrama raro. La variante publicada aquí es la condición de control "none", es decir, Gated DeltaNet plano sin router, que sirve de referencia frente a las demás ablaciones de la serie.

Los resultados reportados son modestos pero informativos: perplejidad de 12,45 en Pile, perplejidad de 3,24 en Rare-AR, precisión top-1 del 73,9% en eventos de primer recuerdo raro y solo 3,6% de acierto en Natural FDA. Su relevancia actual es metodológica: aporta una línea base reproducible para estudiar atención lineal y recuerdo en contexto a escala pequeña, con pesos y configuración completos publicados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Gated DeltaNet (atención lineal recurrente con puerta delta) |
| Parametros totales | 120M |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (entrenamiento con secuencias de 2.048 tokens) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | `final.ckpt` (checkpoint PyTorch, estado del optimizador eliminado) |

## Arquitectura y entrenamiento

La arquitectura es Gated DeltaNet, una variante de atención lineal con estado recurrente que sustituye la atención cuadrática completa por una actualización delta con puerta. La innovación concreta bajo estudio en esta serie es una ganancia de salida por cabeza: un escalar aprendido por cabeza y por token, aplicado antes de la proyección de salida y condicionado a la entrada de la capa. En esta variante (`gate_none`) el router está desactivado, por lo que funciona como Gated DeltaNet plano y actúa como control experimental.

El entrenamiento usa The Pile con 6.000 actualizaciones, 3.146B tokens vistos y batch global de 256 × 2.048 tokens (secuencias de 2.048). La función de pérdida es el objetivo `rare4`, que multiplica por 4 la pérdida sobre tokens que completan un bigrama raro, con semilla 1111. No se menciona RLHF, DPO ni ajuste fino posterior; el checkpoint publicado corresponde al paso global 6.000.

## Capacidades

- Generación de texto autoregresiva sobre dominio general (The Pile), a escala de 120M parámetros.
- Recuerdo en contexto de bigramas raros, evaluado mediante el conjunto Rare-AR (66.394 eventos de primer recuerdo).
- Modelado de lenguaje estándar con perplejidad medida en Pile.
- Servir como línea base de ablación para estudiar puertas de salida por cabeza en atención lineal.
- No dispone de tool calling, function calling ni capacidades de agente.
- No dispone de visión, audio ni modo de razonamiento explícito (thinking).
- Capacidades multilingües: no disponible; no se documenta composición idiomática del entrenamiento.

## Casos de uso

- Investigación sobre atención lineal: usar el checkpoint como control `gate_none` para comparar el efecto de routers y puertas por cabeza en tareas de recuerdo en contexto, cargando `final.ckpt` con `load_checkpoint`.
- Reproducción de ablaciones: reconstruir el experimento con `experiment=gdn_router/gated_deltanet_rare4` o el alias `gdn_120m_rare4_gate_none` para verificar las métricas publicadas.
- Estudio de objetivos de pérdida ponderada: analizar el efecto del objetivo `rare4` (4× pérdida en bigramas raros) frente a cross-entropy estándar en modelos pequeños.
- Benchmark de eficiencia de arquitecturas recurrentes: medir coste de inferencia y memoria de estado frente a transformers de tamaño comparable en entornos con recursos limitados.
- Prototipado educativo: explorar el comportamiento de un LM de 120M en tareas de completado simple, asumiendo calidad limitada por escala y datos.
- Análisis de recall en contexto: reproducir la evaluación Rare-AR para estudiar curvas de aprendizaje de recuerdo de primer evento en modelos lineales.

## Benchmarks y rendimiento

| Benchmark | Resultado |
|---|---|
| Pile PPL (1.000 secuencias de validación) | 12,45 |
| Rare-AR PPL (66.394 eventos raros de primer recuerdo) | 3,24 |
| Rare-AR top-1 accuracy | 73,9% |
| Natural FDA (1.102 ejemplos, generación, respuesta contenida) | 3,6% |

No se han publicado comparaciones directas con otros modelos en la información disponible.

## Requisitos de hardware

- VRAM estimada: el checkpoint ocupa aproximadamente 0,5 GB (120M parámetros en fp32 más metadatos); en fp16 rondaría 0,25 GB y en int8 unos 0,12 GB, aunque no se documentan cuantizaciones oficiales.
- GPU recomendadas: cualquier GPU consumer moderna (RTX 3060, RTX 4090) es suficiente por tamaño; para entrenamiento o reproducción de las 6.000 actualizaciones se recomienda A100 o H100 por throughput.
- Cabe holgadamente en GPU consumer, incluso en iGPU con suficiente RAM compartida.
- Opciones de despliegue: no hay soporte documentado para vLLM, llama.cpp, Ollama o TGI; el flujo previsto es cargar el checkpoint con la librería `recurrent-recall-circuits` y ejecutar inferencia PyTorch.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Arquitectura | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| gated_deltanet-120m-rare4-6k | 120M | no disponible (entrena a 2.048) | Gated DeltaNet (atención lineal) | no disponible | Hugging Face |
| GPT-2 small | 124M | 1.024 | Transformer | MIT | Hugging Face |
| Mamba-130M | 130M | no disponible | SSM selectivo | Apache 2.0 | Hugging Face |

La comparación es orientativa por escala; no se dispone de resultados de benchmarks cruzados entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- Modelo de ablación experimental: no está pensado para uso en producción ni para tareas de calidad.
- Calidad limitada por escala (120M parámetros) y por un entrenamiento corto de 3.146B tokens vistos.
- Natural FDA de solo 3,6%: capacidad muy baja de responder preguntas con la respuesta contenida en el contexto en formato de generación.
- Licencia no especificada: no se puede asumir uso comercial permitido; consultar al autor antes de cualquier despliegue.
- Idiomas y composición del dataset no documentados; sesgos desconocidos.
- Riesgo de alucinación alto por tamaño y datos; no apto para respuestas factuales sin verificación.
- Contexto efectivo no documentado más allá de las secuencias de 2.048 tokens usadas en entrenamiento.
- Dependencia de una librería específica (`recurrent-recall-circuits`, rama `ngram-router-ablations`) para cargar el checkpoint; no hay conversión a formatos estándar.

## Enlaces

- Hugging Face: https://huggingface.co/robgarct/gated_deltanet-120m-rare4-6k
- Código: rama `ngram-router-ablations` del repositorio `recurrent-recall-circuits` (no se proporciona URL directa en la información disponible)
- Paper, blog o demo: no disponible
