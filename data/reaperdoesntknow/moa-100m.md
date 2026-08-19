# reaperdoesntknow/MoA-100M

## Resumen

MoA-100M (también denominado MoAMetricLM‑100M) es un modelo de lenguaje causal decoder-only desarrollado por el usuario reaperdoesntknow, publicado en HuggingFace bajo licencia Apache-2.0. Su principal contribución es la arquitectura `moa_metric`, una variante de Transformer que sustituye la atención por producto punto clásica por una **atención basada en métricas** (distancias L2, coseno o Mahalanobis diagonal) y combina cuatro tipos de cabezas de atención por bloque, gestionadas por un router token-wise. El modelo está pensado como banco de pruebas para investigación sobre atención geométrica, esparsidad estructurada y mezcla de mecanismos de atención.

Con aproximadamente 185 millones de parámetros totales (cerca de 100 millones efectivos por la mezcla de cabezas), una ventana de contexto de 2048 tokens y un tokenizador GPT-2, el modelo fue entrenado únicamente en CPU en FP32 con un presupuesto muy reducido de 500 000 tokens procedentes de dos datasets públicos. No incluye cache de claves/valores (KV cache), por lo que la generación recalcula el contexto completo en cada paso, lo que limita su uso práctico a experimentos de investigación más que a aplicaciones de producción.

Su relevancia actual radica en explorar alternativas al mecanismo de atención estándar, proponiendo una mezcla de atenciones con enrutado por métricas y regularización geométrica (desigualdad triangular y poda por bolas), un área de investigación activa en eficiencia y comprensión estructural de los transformers.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | `moa_metric` (custom, Transformer decoder-only con mezcla de atenciones) |
| Parametros totales | ~185 M (≈100 M efectivos por la mezcla) |
| Parametros activos | No aplica (no es MoE; la mezcla es por cabezas dentro de cada bloque) |
| Longitud de contexto | 2048 tokens |
| Tipos de cuantizacion | No disponible (modelo publicado en FP32) |
| Idiomas soportados | Inglés (tokenizador GPT-2, vocabulario de 50257 tokens) |
| Licencia | Apache-2.0 |
| Formato de pesos | Safetensors (repo de 1.3 GB, compatible con Transformers) |

## Arquitectura y entrenamiento

La arquitectura `moa_metric` mantiene la estructura general de un Transformer decoder-only con 12 capas, dimensión de modelo 768 y 8 cabezas de atención, pero reemplaza la atención por producto punto por una **atención métrica** donde la afinidad entre consulta y clave se calcula como \(\exp(-\alpha_h\|q_i-k_j\|^2)\) sobre distancias L2, coseno o Mahalanobis diagonal (configurable). Cada bloque combina cuatro tipos de cabezas:

- **LocalConvHead**: convolución 1D depthwise-separable para capturar contexto de corto alcance.
- **MetricMHAttention**: atención multi-cabeza completa en el espacio métrico.
- **MetricMQA**: atención multi-consulta (Multi-Query Attention) con claves y valores compartidos para reducir coste.
- **ChannelMixHead**: MLP por token que mezcla dimensiones de canal sin mezcla posicional.

Un **router token-wise** decide, para cada token, qué cabezas activar y aplica puertas de características (estilo FiLM) y puertas de sesgo para escalar las contribuciones. La capa FFN es una **HyperFFN** con tres ramas paralelas (SwiGLU MLP, convolución separable y proyección de bajo rango) combinadas por un router de ramas. Se incluyen LayerScale y DropPath para estabilidad. La regularización opcional incluye una penalización de desigualdad triangular sobre tríos muestreados y una técnica de **ball pruning** donde cada cabeza aprende un origen y un radio, enmascarando claves fuera de la bola para obtener esparsidad estructurada.

El entrenamiento se realizó en CPU (Intel) en FP32 con AdamW (LR=5e-4, batch=4, secuencia ≤512 tokens) sobre un total de 500 000 tokens, procedentes de los datasets `nvidia/Nemotron-Math-HumanReasoning` y `WeMake/Intelligent-Content-Understanding`. La pérdida final de entrenamiento fue de aproximadamente 0.30. No se aplicó RLHF, DPO ni ningún otro método de alineación.

## Capacidades

- **Generación de texto causal**: genera texto en inglés de forma autoregresiva, con soporte para decodificación determinista o muestreo con temperatura.
- **Atención métrica configurable**: permite elegir entre distancia L2, coseno o Mahalanobis diagonal, así como aprender los parámetros alfa y radio durante el entrenamiento.
- **Mezcla de mecanismos de atención**: combina atención local convolucional, atención métrica completa, atención multi-consulta y mezcla de canales, enrutadas por token.
- **Esparsidad estructurada**: mediante ball pruning, el modelo puede enmascarar claves fuera de bolas aprendidas, reduciendo el coste computacional en inferencia.
- **Regularización geométrica**: opcional, con penalización de desigualdad triangular para fomentar un comportamiento de métrica verdadera.
- **Multilingüe**: no; solo inglés (tokenizador GPT-2).
- **Tool calling / function calling**: no implementado.
- **Modo agente / razonamiento multi-paso**: no implementado; el modelo es un LM causal básico sin capacidades de agente.
- **Visión / audio**: no; solo texto.

## Casos de uso

- **Investigación en arquitecturas de atención**: el modelo sirve como banco de pruebas para estudiar el impacto de la atención métrica, la mezcla de cabezas y el enrutado por router en tareas de modelado de lenguaje. Los investigadores pueden comparar el rendimiento de `moa_metric` frente a transformers estándar del mismo tamaño.
- **Exploración de esparsidad estructurada**: la técnica de ball pruning permite analizar cómo la poda por bolas afecta a la calidad de las representaciones y al coste de inferencia, útil para líneas de investigación en eficiencia.
- **Validación de regularización geométrica**: la penalización de desigualdad triangular ofrece un caso de estudio sobre si imponer propiedades métricas mejora la generalización o la interpretabilidad de las atenciones.
- **Prototipado de modelos ligeros**: con ~100 M de parámetros efectivos y licencia Apache-2.0, puede usarse como punto de partida para fine-tuning en tareas específicas de generación de texto en inglés, siempre que el presupuesto de tokens sea suficiente.
- **Docencia y demostraciones**: por su tamaño reducido y su arquitectura inusual, es adecuado para ilustrar conceptos como atención multi-consulta, mezcla de expertos a nivel de cabezas o enrutado por token en cursos de aprendizaje profundo.
- **Benchmarking de kernels y optimizaciones**: al carecer de KV cache, el modelo permite medir el coste de la recomputación completa del contexto, útil para evaluar optimizaciones de inferencia en CPU o GPU pequeñas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas como MMLU, HumanEval, GSM8K u otras, y no se proporcionan comparaciones con modelos de referencia. La pérdida final de entrenamiento (~0.30) es el único dato cuantitativo reportado.

## Requisitos de hardware

- **VRAM estimada para inferencia**: en FP32, ~185 M de parámetros ocupan aproximadamente 740 MB de memoria. Con cuantización a 8 bits (si se aplicara) bajaría a ~185 MB, pero el modelo se publica en FP32 y no se indica soporte de cuantización.
- **GPU recomendadas**: cualquier GPU con al menos 1-2 GB de VRAM puede ejecutar el modelo en FP32 (por ejemplo, NVIDIA T4, RTX 2060 o superiores). En CPU, el entrenamiento se realizó en un Intel, por lo que la inferencia en CPU es viable aunque lenta.
- **Cabe en consumer GPU**: sí, en prácticamente cualquier GPU de consumo moderna (RTX 3060, RTX 4090, etc.) e incluso en muchas integradas.
- **Opciones de despliegue**: compatible con HuggingFace Transformers (`AutoModelForCausalLM`). No se menciona soporte para vLLM, llama.cpp, Ollama ni TGI; dado que no hay KV cache, la integración con estos motores sería limitada.
- **Latencia y throughput**: no disponibles. La ausencia de KV cache implica que el tiempo de generación crece linealmente con la longitud total del contexto, haciendo la inferencia lenta para secuencias largas.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye comparaciones con otros modelos de tamaño similar (por ejemplo, GPT-2 pequeño, Pythia-70M o modelos de ~100 M de parámetros). No se pueden establecer comparativas fiables de rendimiento, contexto o licencia sin datos adicionales.

## Limitaciones y advertencias

- **Sin KV cache**: la generación recalcula el contexto completo en cada paso, lo que produce una latencia alta y creciente con la longitud de la secuencia.
- **Presupuesto de entrenamiento muy reducido**: solo 500 000 tokens, por lo que el modelo no es un LM de propósito general y su calidad de generación es limitada.
- **Sin alineación ni ajuste de seguridad**: el modelo no ha pasado por RLHF, DPO ni ningún filtro de contenido; puede generar texto sesgado, ofensivo o factualmente incorrecto.
- **Solo inglés**: no soporta otros idiomas.
- **Sin soporte de tool calling ni agentes**: no es adecuado para tareas que requieran interacción con herramientas o razonamiento multi-paso.
- **Riesgo de alucinación**: como todo LM pequeño entrenado con pocos datos, es propenso a inventar información.
- **Licencia**: Apache-2.0 permite uso comercial, pero el autor declara explícitamente que el modelo está fuera del alcance para aplicaciones de alto riesgo (médicas, legales, etc.) sin evaluación adicional.
- **Formato de pesos**: solo safetensors en FP32; no se proporcionan versiones cuantizadas ni GGUF.

## Enlaces

- [HuggingFace: reaperdoesntknow/MoA-100M](https://huggingface.co/reaperdoesntknow/MoA-100M)
- Datasets de entrenamiento: [nvidia/Nemotron-Math-HumanReasoning](https://huggingface.co/datasets/nvidia/Nemotron-Math-HumanReasoning) y [WeMake/Intelligent-Content-Understanding](https://huggingface.co/datasets/WeMake/Intelligent-Content-Understanding)
