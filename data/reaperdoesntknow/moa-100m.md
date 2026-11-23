# reaperdoesntknow/MoA-100M

## Resumen

MoA-100M (identificado en la model card como MoAMetricLM-100M) es un modelo de lenguaje causal decoder-only desarrollado por el usuario independiente reaperdoesntknow, orientado a la investigación sobre mecanismos de atención alternativos al producto escalar clásico. Su propuesta central es una arquitectura propia denominada `moa_metric` (mixture of attentions), que combina en cada bloque Transformer cuatro tipos de cabeza de atención —convolución local, atención multi-cabeza basada en métricas de distancia, multi-query attention también en espacio métrico y una cabeza de mezcla de canales— y las enruta token a token mediante un router aprendido.

El modelo declara aproximadamente 185 millones de parámetros totales, con un tamaño efectivo de unos 100 millones debido a la mezcla y al enrutamiento disperso. Emplea el tokenizador GPT-2 (vocabulario de 50 257 tokens), una dimensión oculta de 768, 12 capas y una longitud de contexto de 2048 tokens. La alimentación (FFN) sustituye el MLP convencional por un HyperFFN con tres ramas paralelas (SwiGLU, convolución separable y baja dimensionalidad) combinadas por un router de rama.

Es relevante ahora no por su rendimiento —entrenado en CPU con un presupuesto de unos 500 000 tokens y sin benchmarks publicados— sino como banco de pruebas reproducible de ideas geométricas en atención: penalizaciones de desigualdad triangular, poda por bolas (ball pruning) y atención basada en distancias L2, coseno o Mahalanobis diagonal. Su licencia Apache-2.0 y su integración con Transformers lo hacen accesible para experimentación, aunque no está pensado como modelo de propósito general.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | `moa_metric` (Transformer decoder-only con mixture of attentions y HyperFFN) |
| Parametros totales | ~185 M (≈100 M efectivos según el autor) |
| Parametros activos | no disponible (mezcla por router, sin cifra oficial de activos) |
| Longitud de contexto | 2048 tokens |
| Tipos de cuantizacion | no disponible (pesos en FP32; sin GGUF ni cuantizaciones publicadas) |
| Idiomas soportados | inglés (`en`) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors / PyTorch (librería `transformers`; repo de 1,3 GB) |

Otros datos técnicos: dimensión 768, 12 capas, 8 cabezas de atención, 8 cabezas Q en MQA, `mixer_hidden` y `ffn_hidden` de 3072, tokenizador GPT-2 con `pad_token = eos_token`, `vocab_size` 50 257.

## Arquitectura y entrenamiento

Cada bloque Transformer de MoA contiene cuatro cabezas que se combinan mediante un router token a token: LocalConvHead (convolución 1D depthwise-separable para contexto de corto alcance), MetricMHAttention (atención soft-min sobre distancias L2, coseno o Mahalanobis diagonal, con pesos proporcionales a exp(−α_h·‖q_i − k_j‖²)), MetricMQA (multi-query con K/V compartidas en el mismo espacio métrico) y ChannelMixHead (MLP por token que mezcla dimensiones de canal sin mezclar posiciones). El router aplica además puertas de características estilo FiLM y sesgos de enrutamiento para escalar arriba/abajo. La FFN es un HyperFFN con tres ramas paralelas (SwiGLU, convolución separable y baja dimensionalidad) combinadas por un router de rama, con LayerScale y DropPath opcional para estabilidad.

El entrenamiento se realizó únicamente en CPU (Intel) en FP32, con AdamW, LR 5e-4, batch de 4, secuencias de hasta 512 tokens y un presupuesto total de unas 500 000 tokens (≈2 × 256 000) extraídos de los datasets nvidia/Nemotron-Math-HumanReasoning y WeMake/Intelligent-Content-Understanding. La pérdida final de entrenamiento reportada es ≈0,30. Incluye regularización opcional: penalización de desigualdad triangular sobre tripletas muestreadas para forzar comportamiento métrico real, y ball pruning, donde cada cabeza aprende un origen o_h y un radio r_h que enmascara claves fuera de la bola, generando dispersión estructurada. No se aplicó RLHF, DPO ni ajuste de alineamiento.

## Capacidades

- Generación de texto causal en inglés (modelo decoder-only con `pipeline_tag: text-generation`).
- Razonamiento básico y matemático acotado, condicionado por el dataset Nemotron-Math-HumanReasoning usado en el entrenamiento.
- Atención geométrica configurable: métrica L2, coseno o Mahalanobis diagonal, seleccionable en la configuración.
- Enrutamiento token a token entre cuatro mecanismos de atención y tres ramas de FFN.
- Dispersión estructurada mediante ball pruning (origen y radio aprendidos por cabeza).
- No soporta tool calling ni function calling de forma nativa.
- No soporta agentes ni razonamiento multi-paso explícito.
- Multilingüe: no; solo inglés declarado.
- Sin modo thinking, visión, audio ni otras modalidades.
- Generación determinista con `do_sample=False` o muestreo con temperatura.

## Casos de uso

- Investigación sobre atención basada en métricas: sirve como implementación de referencia para comparar atención por producto escalar frente a atención por distancias L2, coseno o Mahalanobis en un Transformer pequeño y entrenable en CPU.
- Estudio de dispersión estructurada: el ball pruning permite analizar cómo evolucionan los orígenes y radios aprendidos por cabeza y su efecto en el enmascaramiento de claves, útil para papers sobre sparsity estructurada.
- Experimentos de enrutamiento condicional: el router token a token y el router de rama del HyperFFN permiten estudiar políticas de mezcla de expertos de atención en modelos de ~100 M efectivos.
- Reproducción de regularización geométrica: la penalización de desigualdad triangular es un caso concreto para validar si una atención aprendida respeta propiedades métricas.
- Docencia y prototipado rápido: al entrenar en CPU y caber en cualquier GPU de consumo, es adecuado para cursos o talleres donde se modifica la arquitectura y se reentrena en horas.
- Ablación de componentes: al ser modular (cuatro cabezas, tres ramas FFN, métricas conmutables), permite aislar el impacto de cada pieza en la pérdida y en la calidad de generación.
- Generación de texto exploratoria en inglés: útil para pruebas cualitativas de continuidad y coherencia a corto plazo, no para producción.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card únicamente reporta una pérdida final de entrenamiento de ≈0,30 sobre el conjunto de entrenamiento, sin métricas de validación, MMLU, HumanEval, GSM8K ni comparaciones con otros modelos.

## Requisitos de hardware

- VRAM estimada para inferencia: ~0,7 GB en FP32 (185 M de parámetros); en FP16 ~0,4 GB; en cuantización de 8 bits ~0,2 GB (aunque no se publican pesos cuantizados).
- GPU recomendadas: cualquier GPU con ≥2 GB de VRAM; no requiere A100 ni H100.
- Cabe holgadamente en GPU de consumo: GTX 1650, RTX 3060, RTX 4090, e incluso en CPU.
- Opciones de despliegue: `transformers` con `AutoModelForCausalLM` (soporte nativo); no hay confirmación de soporte en vLLM, llama.cpp, Ollama ni TGI, y la ausencia de KV-cache complica su integración en servidores de inferencia estándar.
- Latencia y throughput: no disponibles como cifras medidas; el autor advierte que, al no implementar KV-cache, la generación recalcula todo el contexto en cada paso y el tiempo crece linealmente con la longitud total.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Arquitectura | Licencia | Benchmarks |
|---|---|---|---|---|---|
| MoA-100M | ~185 M (~100 M efectivos) | 2048 | MoA métrica + HyperFFN | Apache-2.0 | no disponibles |
| GPT-2 small | 124 M | 1024 | Transformer clásico | MIT | publicados por OpenAI |
| GPT-2 medium | 355 M | 1024 | Transformer clásico | MIT | publicados por OpenAI |
| SmolLM-135M | 135 M | 2048 | Transformer decoder-only | Apache-2.0 | publicados por HuggingFace |

La comparación es cualitativa: MoA-100M se sitúa en el rango de tamaño de GPT-2 small y SmolLM-135M, pero carece de benchmarks y de KV-cache, y su entrenamiento (500 k tokens en CPU) es órdenes de magnitud menor que el de los modelos citados (decenas o cientos de miles de millones de tokens). No es, por tanto, un competidor en calidad de generación, sino una propuesta arquitectónica experimental.

## Limitaciones y advertencias

- Sin alineamiento ni ajuste de seguridad: el autor advierte explícitamente que las salidas pueden ser sesgadas o inexactas.
- Riesgo alto de alucinación: el presupuesto de entrenamiento (~500 k tokens) es insuficiente para un modelo de propósito general.
- Sin KV-cache: la generación es lenta y escala linealmente con la longitud del contexto.
- Contexto limitado a 2048 tokens y solo inglés declarado.
- Entrenado en CPU con FP32 y batch pequeño, lo que limita la calidad y la estabilidad del ajuste.
- Fuera de alcance para aplicaciones de alto riesgo (médicas, legales, financieras) sin evaluación adicional.
- Uso comercial permitido por Apache-2.0, pero sin garantías de calidad; conviene verificar la procedencia de los datasets de entrenamiento antes de un uso en producción.
- La model card menciona "no KV-cache" como limitación conocida; cualquier despliegue en servidor requerirá implementar caché o aceptar la penalización de latencia.
- El repositorio pesa 1,3 GB, lo que sugiere pesos en FP32 y posiblemente checkpoints adicionales; verificar el contenido antes de descargar.

## Enlaces

- Hugging Face: https://huggingface.co/reaperdoesntknow/MoA-100M
- Dataset de entrenamiento (matemáticas y razonamiento): https://huggingface.co/datasets/nvidia/Nemotron-Math-HumanReasoning
- Dataset de entrenamiento (contenido): https://huggingface.co/datasets/WeMake/Intelligent-Content-Understanding
- Tokenizador GPT-2: https://huggingface.co/gpt2
- Librería Transformers: https://github.com/huggingface/transformers
