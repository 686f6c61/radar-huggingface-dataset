# reaperdoesntknow/DiscoverLM-70M

## Resumen

DiscoverLM-70M es un modelo de lenguaje causal de 69,1 millones de parámetros desarrollado por el usuario independiente reaperdoesntknow (bajo la etiqueta "convergentintel"). Su particularidad es que sustituye la atención estándar por dot product por una arquitectura denominada Mixture-of-Attentions (MoA), basada en distancias de Mahalanobis y con una garantía geométrica: se regulariza explícitamente el cumplimiento de la desigualdad triangular durante el entrenamiento. El modelo es, por tanto, más un experimento arquitectónico que un modelo de propósito general listo para producción.

La arquitectura combina cuatro rutas de atención paralelas (convolución local, atención métrica global, mezcla de canales y atención métrica multi-query) enrutadas por token con top-2, junto con un FFN de tres ramas (SwiGLU, convolución causal y cuello de botella de bajo rango). Emplea además un esquema posicional propio llamado BlackHoleRoPE y una cabeza de lenguaje que también aplica una mezcla de atenciones antes de proyectar al vocabulario.

Su relevancia es fundamentalmente investigadora: explora si imponer estructura métrica en la atención aporta estabilidad y eficiencia en modelos pequeños. El entrenamiento es muy limitado (262.144 tokens vistos, 512 pasos, contexto de 1.024), por lo que sus capacidades prácticas son reducidas y debe evaluarse como prueba de concepto, no como modelo desplegable.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal con Mixture-of-Attentions (MoA), atención por distancia de Mahalanobis, BlackHoleRoPE y HyperFFN de 3 ramas |
| Parametros totales | 69.130.608 (69,1M) |
| Parametros activos | No es MoE denso; el enrutado top-2 de rutas de atención y FFN es por token, pero el presupuesto de parámetros es compartido (no se especifica un conteo de activos) |
| Longitud de contexto | 1.024 tokens (longitud máxima de secuencia en entrenamiento) |
| Tipos de cuantizacion | No disponible (pesos publicados en safetensors; no se documentan versiones GGUF ni cuantizadas) |
| Idiomas soportados | Inglés (en) |
| Licencia | cc (Creative Commons, variante no especificada en la información disponible) |
| Formato de pesos | safetensors (librería transformers) |

## Arquitectura y entrenamiento

El bloque central de MoA contiene cuatro rutas paralelas por token: una convolución depthwise local, atención métrica multi-cabeza completa (64 cabezas, espacio de cabeza de 8 dimensiones con escalado diagonal propio, origen de bola aprendible y radio adaptativo para poda dispersa), mezcla de canales con compuertas y atención métrica multi-query (64 consultas). Un router aprendido selecciona las top-2 rutas por posición y unas compuertas de características escalan cada salida antes de mezclarlas, con residual y DropPath. La puntuación de atención se calcula como distancia de Mahalanobis negativa al cuadrado, y se aplica una regularización sobre tripletas aleatorias (λ=0,01, 64 muestras por lote) para forzar la desigualdad triangular. Los pares fuera de la bola se enmascaran antes del softmax.

El FFN (HyperFFN) tiene tres ramas —SwiGLU, convolución causal depthwise separable y cuello de botella de bajo rango con compuertas— también enrutadas top-2 por token. La cabeza de lenguaje aplica su propia mezcla de atenciones (32 cabezas, head_dim=16) y una transformación SwiGLU antes de proyectar al vocabulario de 48.000 tokens, con pesos atados al embedding de entrada. El entrenamiento se realizó con SFT (TRL) sobre tres datasets (razonamiento multi-paso, matemáticas y seguimiento de instrucciones general), con AdamW, learning rate 3e-4 con decaimiento coseno, batch de 4, 512 pasos, 8 épocas, precisión fp32 y una NVIDIA H100. El presupuesto de cómputo es extremadamente bajo: 262.144 tokens vistos en total.

## Capacidades

- Generación de texto causal en inglés, con vocabulario propio de 48.000 tokens.
- Seguimiento básico de instrucciones, derivado del entrenamiento sobre alpaca-cleaned.
- Razonamiento multi-paso elemental y resolución de problemas matemáticos simples, por el ajuste sobre Opus-4.6-Reasoning y UltraData-Math.
- Enrutado disperso por token (top-2 de 4 rutas) que introduce cierta especialización interna, aunque no se documenta su comportamiento emergente.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso avanzado: no disponible.
- Capacidades multimodales (visión, audio): no disponibles.
- Modo "thinking" explícito: no disponible.
- Capacidades multilingües: limitadas al inglés.

## Casos de uso

- Investigación sobre atención geométrica: reproducir y analizar el efecto de la regularización de la desigualdad triangular en la estabilidad del entrenamiento, comparando curvas de pérdida y varianza con un transformer estándar del mismo tamaño.
- Experimentos académicos de arquitecturas híbridas: estudiar el enrutado top-2 de rutas de atención y FFN en modelos de menos de 100M de parámetros, donde el coste de entrenamiento es asumible en una sola GPU.
- Pruebas de codificación posicional: evaluar BlackHoleRoPE frente a RoPE clásico en tareas de modelado de lenguaje a corta distancia (secuencias de hasta 1.024 tokens).
- Prototipado de tokenizadores personalizados: el modelo incluye un tokenizador propio de 48K entradas que puede servir de base para experimentos de vocabulario.
- Generación de texto muy acotada en inglés: completar frases o respuestas cortas en entornos de demostración donde la latencia y el coste importan más que la calidad.
- Docencia y divulgación: ilustrar de forma práctica conceptos de atención métrica, dispersión por bolas y enrutado disperso en un modelo que cabe en cualquier GPU de consumo.
- Baseline para ablaciones: servir como punto de comparación en estudios que midan el impacto de la geometría en la atención con presupuestos de entrenamiento pequeños.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandarizados (MMLU, HumanEval, GSM8K u otros) en la información disponible. El autor solo reporta métricas de entrenamiento:

| Epoca | Perdida media | Perdida minima | Desviacion tipica | Precision de token |
|---|---|---|---|---|
| 1 | 2,887 | 2,285 | 0,291 | 59,2% |
| 2 | 2,324 | 1,651 | 0,259 | 63,4% |
| 3 | 1,931 | 1,232 | 0,211 | 68,4% |
| 4 | 1,616 | 1,012 | 0,201 | 74,4% |
| 5 | 1,432 | 0,954 | 0,169 | 77,0% |
| 6 | 1,211 | 0,677 | 0,180 | 79,0% |
| 7 | 1,075 | 0,599 | 0,151 | 80,1% |
| 8 | 1,014 | 0,718 | 0,142 | 80,8% |

Mejor paso individual: paso 393, pérdida 0,599 y precisión de token 88,4%. La desviación típica de la pérdida se redujo a la mitad (0,291 → 0,142), lo que el autor interpreta como estabilización del enrutado.

## Requisitos de hardware

- VRAM estimada para inferencia en fp32: aproximadamente 0,28 GB solo para pesos (69,1M × 4 bytes), más overhead de activaciones y caché KV; en la práctica, menos de 1 GB.
- En fp16/bf16: unos 0,14 GB de pesos; en cuantización de 8 bits, alrededor de 0,07 GB.
- GPU recomendadas: cualquier GPU moderna sirve; el modelo se entrenó en una NVIDIA H100, pero para inferencia es sobredimensionada. Una RTX 3060, RTX 4060 o incluso una GPU integrada con suficiente memoria compartida pueden ejecutarlo.
- Cabe holgadamente en GPU de consumo (RTX 4090, RTX 3090, RTX 4070, etc.) y en GPUs de gama baja.
- Opciones de despliegue: transformers (librería nativa), y potencialmente llama.cpp u Ollama si se generan pesos GGUF, aunque no se documentan conversiones oficiales. vLLM y TGI no están confirmados para esta arquitectura personalizada.
- Latencia y throughput: no disponibles. Con 69M de parámetros y contexto de 1.024, se espera una latencia muy baja en GPU, pero no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Arquitectura | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| DiscoverLM-70M | 69,1M | 1.024 | MoA con atención métrica | cc | Hugging Face |
| GPT-2 small | 124M | 1.024 | Transformer estándar | MIT | Hugging Face |
| Pythia-70M | 70M | 2.048 | Transformer estándar | Apache 2.0 | Hugging Face |
| TinyLlama-1.1B | 1,1B | 2.048 | Transformer (Llama) | Apache 2.0 | Hugging Face |

La comparación es aproximada: DiscoverLM-70M es un experimento arquitectónico con un presupuesto de entrenamiento muy inferior (262K tokens frente a cientos de miles de millones en Pythia o TinyLlama), por lo que su calidad esperada es mucho menor. Su interés radica en la arquitectura, no en el rendimiento.

## Limitaciones y advertencias

- Entrenamiento extremadamente corto: 262.144 tokens y 512 pasos, lo que produce un modelo con conocimiento factual y fluidez muy limitados; no es apto para uso en producción.
- Contexto máximo de 1.024 tokens, insuficiente para la mayoría de tareas reales con documentos largos.
- Solo inglés; no se ha entrenado ni evaluado en castellano ni en otros idiomas.
- Riesgo elevado de alucinación y de generar texto incoherente fuera de los dominios de entrenamiento (razonamiento, matemáticas e instrucciones simples).
- No se documentan evaluaciones de sesgo, toxicidad ni seguridad; los datasets de origen (alpaca-cleaned, UltraData-Math, Opus-4.6-Reasoning) pueden introducir sesgos no analizados.
- La licencia "cc" no especifica la variante (BY, BY-SA, BY-NC, etc.), por lo que el uso comercial es incierto y requiere verificación con el autor.
- Arquitectura no estándar: puede no ser compatible con herramientas de optimización, cuantización o serving habituales (vLLM, TGI, llama.cpp) sin trabajo adicional.
- Sin resultados de benchmarks independientes; las métricas reportadas son solo de pérdida de entrenamiento, no de capacidad real.
- Cero "likes" y autor independiente: no hay validación comunitaria ni soporte.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/reaperdoesntknow/DiscoverLM-70M
- Dataset Opus-4.6-Reasoning-3000x-filtered: https://huggingface.co/datasets/nohurry/Opus-4.6-Reasoning-3000x-filtered
- Dataset UltraData-Math: https://huggingface.co/datasets/openbmb/UltraData-Math
- Dataset alpaca-cleaned: https://huggingface.co/datasets/yahma/alpaca-cleaned
