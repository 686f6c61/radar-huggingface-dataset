# shreyansh-programmer/Intelligence_OS_1p5B

## Resumen

Intelligence_OS_1p5B es un modelo de lenguaje decoder-only de tipo mixture-of-experts disperso, desarrollado desde cero por el usuario shreyansh-programmer y publicado en Hugging Face bajo licencia Apache 2.0. Declara 1.518.659.584 parámetros, 26 capas, dimensión oculta de 2.048 y atención grouped-query con 16 cabezas de consulta y 4 de clave/valor. La arquitectura incorpora cuatro expertos SwiGLU por capa con enrutamiento top-2 y enrutamiento adaptativo, además de RoPE y embeddings de entrada/salida atados.

El modelo se presenta como una propuesta orientada a maximizar la calidad por joule y la eficiencia de entrenamiento. La model card destaca LOMO (Low-Memory Optimization), una técnica de actualización por capas in-place que mantiene el pico de VRAM por debajo de 1,5 GB, y menciona un motor no neuronal denominado Holographic Associative Memory con 85.000 tokens/s, cuya relación con el modelo de lenguaje no se detalla.

La información publicada es muy limitada: no se documentan la longitud de contexto, el tokenizador, el volumen o la composición de los datos de entrenamiento, los idiomas soportados ni resultados de benchmarks. Esto hace que el modelo sea relevante principalmente como artefacto de investigación sobre arquitecturas MoE de pequeño tamaño y entrenamiento de bajo consumo de memoria, no como una opción validada para producción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only con MoE disperso; 4 expertos SwiGLU por capa, top-2 y enrutamiento adaptativo |
| Parámetros totales | 1.518.659.584 |
| Parámetros activos | No disponible; el enrutamiento top-2 sobre 4 expertos activa solo una fracción de las capas FFN, pero no se publica el desglose |
| Longitud de contexto | No disponible |
| Tipos de cuantización | No disponible; no se publican pesos GGUF, recetas de cuantización ni configuraciones de precisión reducida |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | PyTorch; repositorio de 40,2 GB. No se especifican safetensors ni GGUF |
| Capas | 26 |
| Dimensión oculta | 2.048 |
| Atención | Grouped-Query Attention con 16 cabezas de consulta y 4 de clave/valor |
| Codificación posicional | Rotary Position Embedding (RoPE) |
| Feed-forward | 4 expertos SwiGLU por capa, top-2, enrutamiento adaptativo |
| Embeddings | Entrada y salida atados |

## Arquitectura y entrenamiento

La arquitectura es un transformer decoder-only con atención causal y sustitución de las capas feed-forward densas por un MoE de cuatro expertos SwiGLU por capa. El enrutador selecciona los dos expertos principales para cada token y aplica enrutamiento adaptativo, aunque la model card no describe el mecanismo exacto de adaptación, la función de balanceo de carga ni la inicialización del enrutador. La atención usa GQA con una relación 4:1 entre cabezas de consulta y de clave/valor, lo que reduce el coste de memoria de la caché KV, y emplea RoPE para la codificación posicional. Los embeddings de entrada y salida están atados, lo que reduce el número de parámetros.

En entrenamiento se declara LOMO, una optimización de memoria que realiza actualizaciones por capas in-place y mantiene el pico de VRAM por debajo de 1,5 GB. No se especifican el número de tokens de entrenamiento, la composición del corpus, el tokenizador, la longitud de secuencia usada durante el preentrenamiento ni si hubo fases de instrucción, RLHF o DPO. Tampoco se documentan innovaciones de inferencia como decodificación especulativa o atención lineal. La mención a un motor no neuronal con memoria asociativa holográfica y 85.000 tokens/s aparece como una capacidad separada y no verificada, no como una característica del transformer.

## Capacidades

- Generación de texto autoregresiva: es la función principal declarada por el pipeline `text-generation`.
- Razonamiento, matemáticas y código: no hay evaluación publicada que permita confirmar estas capacidades.
- Tool calling o function calling: no documentado.
- Uso como agente o razonamiento multi-paso: no documentado.
- Capacidades multilingües: no disponibles; no se indica qué idiomas cubre el tokenizador ni el corpus.
- Modo de pensamiento explícito: no documentado.
- Visión, audio u otras modalidades: no disponibles.
- Eficiencia de inferencia por activación dispersa: el diseño top-2 reduce el cómputo de las capas FFN, pero no se publican los parámetros activos ni métricas de latencia.
- Motor no neuronal asociado: la model card cita Holographic Associative Memory con 85.000 tokens/s, sin especificar implementación, hardware ni relación con los pesos del modelo.

## Casos de uso

- Investigación sobre enrutamiento MoE: permite estudiar cómo se distribuye la carga entre cuatro expertos por capa y analizar el comportamiento del enrutamiento top-2 en un modelo de 1,5B parámetros.
- Reproducción de entrenamiento con LOMO: sirve como referencia para experimentos de ajuste fino con pico de VRAM inferior a 1,5 GB, siempre que se disponga del código y la configuración de entrenamiento, no publicados en la model card.
- Prototipado de generación de texto en GPU de gama media: al tratarse de un modelo de 1,5B, puede cargarse en GPUs consumer con cuantización, aunque la ausencia de pesos GGUF obliga a convertir los pesos PyTorch.
- Evaluación comparativa de arquitecturas dispersas frente a densas: útil para medir calidad por parámetro activo y coste de inferencia frente a modelos densos de tamaño similar.
- Experimentos académicos de bajo presupuesto: el tamaño y la licencia Apache 2.0 facilitan su uso en laboratorios con recursos limitados, con la cautela de que no hay benchmarks publicados.
- Generación de texto en dominios acotados tras ajuste fino: con un conjunto de datos propio podría adaptarse a tareas de clasificación, extracción o resumen, pero requeriría evaluación previa por la falta de datos sobre contexto e idiomas.
- Base para estudiar técnicas de memoria asociativa: la mención a Holographic Associative Memory puede interesar a investigadores que quieran reproducir o comparar ese componente, aunque no se aportan detalles técnicos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 3 GB en FP16/BF16 solo para los pesos; 1,5-2 GB en INT8; en torno a 0,8-1 GB en 4 bits. Hay que añadir la caché KV y el overhead del runtime, por lo que conviene prever un 20-30 % adicional.
- GPU recomendadas: RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070 12 GB o RTX 4090 24 GB para inferencia y ajuste fino ligero; A100 40/80 GB o H100 para entrenamiento a mayor escala.
- GPU consumer: cabe en tarjetas de 8 GB o más con cuantización; en FP16 puede funcionar en 6-8 GB si se limita la longitud de secuencia, aunque se desconoce el contexto máximo soportado.
- Despliegue: PyTorch y Hugging Face Transformers son la vía natural. vLLM o TGI podrían requerir soporte explícito para la arquitectura MoE personalizada. llama.cpp y Ollama necesitan una conversión a GGUF que no se proporciona.
- Latencia y throughput: no disponibles. La cifra de 85.000 tokens/s corresponde al motor no neuronal citado en la model card, no al transformer.
- Almacenamiento: el repositorio ocupa 40,2 GB, probablemente por incluir checkpoints de entrenamiento u optimizador; para inferencia solo sería necesario un subconjunto de los pesos.

## Comparativa con modelos similares

| Modelo | Parámetros totales / activos | Contexto | Licencia | Formato y disponibilidad | Notas |
|---|---|---|---|---|---|
| Intelligence_OS_1p5B | 1,519 B / no disponible | No disponible | Apache 2.0 | PyTorch; sin GGUF declarado | MoE con 4 expertos por capa y top-2; sin benchmarks publicados |
| OLMoE-1B-7B | 7 B / 1,3 B | 4.096 tokens | Apache 2.0 | Pesos públicos en Hugging Face; amplio ecosistema | MoE de referencia con benchmarks y soporte en herramientas habituales |
| SmolLM2-1.7B | 1,7 B densos | 8.192 tokens | Apache 2.0 | Safetensors y GGUF; soporte en llama.cpp y Transformers | Modelo denso small, con evaluación publicada y amplia adopción |
| Qwen3-1.7B | 1,7 B densos | 32.768 tokens | Apache 2.0 | Safetensors y GGUF; soporte en vLLM, Transformers y Ollama | Denso con contexto largo y capacidades multilingües documentadas |

La comparación de rendimiento no es posible porque Intelligence_OS_1p5B no publica resultados de benchmarks. Frente a OLMoE-1B-7B, la propuesta de shreyansh-programmer tiene menos parámetros totales, pero carece de evaluación y de integración conocida en stacks de inferencia. Frente a SmolLM2-1.7B y Qwen3-1.7B, compite en tamaño, pero no ofrece datos de contexto, idiomas ni cuantizaciones listas para usar.

## Limitaciones y advertencias

- Ausencia total de benchmarks: no se puede verificar calidad, razonamiento, código ni matemáticas.
- Longitud de contexto desconocida: no se puede garantizar el comportamiento en conversaciones multi-turno o documentos largos.
- Idiomas no documentados: no hay garantía de soporte del castellano ni de otros idiomas.
- Tokenizador no especificado: dificulta la reproducibilidad y la estimación de costes.
- Riesgo de alucinación: no se documentan fases de alineación, RLHF o DPO que lo mitiguen.
- Sesgos desconocidos: no se describe la composición del corpus de entrenamiento.
- Licencia Apache 2.0: permite uso comercial, pero la procedencia de los datos de entrenamiento no está documentada, lo que puede implicar riesgos legales.
- Arquitectura MoE personalizada: puede no estar soportada por vLLM, TGI, llama.cpp u Ollama sin trabajo de adaptación.
- Repositorio de 40,2 GB: el tamaño no corresponde solo a los pesos de inferencia y puede contener checkpoints de entrenamiento.
- Baja validación comunitaria: 26 descargas y 0 likes en el momento de la consulta.
- La afirmación sobre un motor no neuronal con 85.000 tokens/s no está verificada ni detallada técnicamente.

## Enlaces

- [Hugging Face: shreyansh-programmer/Intelligence_OS_1p5B](https://huggingface.co/shreyansh-programmer/Intelligence_OS_1p5B)
- No se han encontrado papers, blogs, repositorios adicionales ni demos en la información proporcionada.
