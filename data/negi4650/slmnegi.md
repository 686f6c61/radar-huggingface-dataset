# negi4650/slmnegi

## Resumen

slmnegi es un modelo de lenguaje de tipo decoder-only desarrollado por Manish Negi (ArchiGen AI Labs) y publicado en HuggingFace bajo el identificador `negi4650/slmnegi`. Se trata de un SLM (Small Language Model) diseñado explícitamente para preentrenamiento e inferencia en entornos con memoria restringida (≤ 15 GB de VRAM), lo que lo sitúa en la franja de modelos que pueden ejecutarse en CPU, dispositivos embebidos o GPUs de gama baja sin cuantización agresiva.

La arquitectura combina mecanismos estándar en modelos modernos: atención con Grouped-Query Attention (relación 4:1, 8 cabezas de consulta y 2 de clave/valor), embeddings posicionales rotatorios (RoPE), activaciones SwiGLU y un vocabulario propio de 32.000 tokens Byte-Level BPE. El modelo declara 8 capas, dimensión oculta 512 y dimensión de FFN 1536, con una ventana de contexto de 512 tokens.

Su relevancia es fundamentalmente metodológica y educativa: la model card lo presenta acompañado de un informe técnico sobre diseño arquitectónico, tokenización y preentrenamiento con presupuesto de memoria ajustado. No obstante, el repositorio no incluye resultados de benchmarks, no documenta el corpus de entrenamiento y acumula cero descargas y cero "likes" en el momento de la consulta, por lo que debe considerarse un artefacto de investigación incipiente y no un modelo listo para producción.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only con GQA, RoPE y SwiGLU |
| Parametros totales | 56.893.952 según safetensors; la model card declara 45.219.840 |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | 512 tokens |
| Tipos de cuantizacion | no disponible (no se publican variantes cuantizadas; solo pesos safetensors) |
| Idiomas soportados | inglés (`en`) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |
| Vocabulario | 32.000 tokens (Byte-Level BPE propio) |
| Dimension oculta (d_model) | 512 |
| Numero de capas | 8 |
| Cabezas de atencion | 8 query / 2 key-value (GQA 4:1) |
| Dimension FFN (d_ffn) | 1.536 |
| Tamano del repositorio | 0,2 GB |

Nota sobre el recuento de parámetros: existe una discrepancia entre los 45.219.840 declarados en la model card y los 56.893.952 que reportan los ficheros safetensors. La model card no la explica; una posible causa es el tratamiento de la matriz de embeddings y la cabeza de salida no atadas (untied), pero es una hipótesis no confirmada por el autor.

## Arquitectura y entrenamiento

El modelo es un transformer causal decoder-only de 8 capas con dimensión oculta 512. La atención usa Grouped-Query Attention con 8 cabezas de consulta y 2 cabezas de clave/valor (ratio 4:1), lo que reduce el coste de memoria del KV cache frente a atención multi-cabeza completa. Las posiciones se codifican con Rotary Position Embeddings (RoPE) y la FFN emplea SwiGLU con dimensión intermedia de 1.536, una proporción de aproximadamente 3× la dimensión del modelo. La tokenización corre a cargo de un vocabulario Byte-Level BPE de 32.000 entradas definido por el autor.

El preentrenamiento se describe como "memory-budgeted", ejecutado dentro de un envelope de ≤ 15 GB de VRAM, lo que condiciona el tamaño de batch, la longitud de secuencia (512 tokens) y las técnicas de ahorro de memoria empleadas. No se especifican en la información disponible el número de tokens de entrenamiento, la composición del corpus, ni si hubo fases de ajuste fino con RLHF, DPO o SFT. Tampoco se documentan innovaciones adicionales como decodificación especulativa, atención lineal o arquitecturas híbridas.

## Capacidades

- Generación de texto autoregresiva en inglés, limitada a secuencias de hasta 512 tokens.
- Generación de texto corto y continuaciones breves; no hay evidencia publicada de calidad en razonamiento multi-paso.
- Soporte de tool calling / function calling: no disponible (no documentado).
- Soporte de agentes y razonamiento multi-step: no disponible (no documentado).
- Capacidades multilingües: limitadas al inglés según la etiqueta de idioma del repositorio.
- Capacidades especiales (modo thinking, visión, audio): no disponibles.
- Capacidad de ejecución en hardware muy limitado, incluida CPU, gracias a su tamaño reducido.

## Casos de uso

- Prototipado e investigación en arquitecturas SLM: sirve como banco de pruebas reproducible para estudiar GQA, RoPE y SwiGLU en modelos por debajo de 100 M de parámetros, con un presupuesto de memoria de 15 GB documentado por el autor.
- Autocompletado local en editores o terminales: con 512 tokens de contexto y ~114 MB en FP16, puede generar continuaciones cortas en un plugin de escritorio sin depender de la nube.
- Enrutamiento de intenciones en pipelines de agentes: clasificar una consulta corta en una de N categorías antes de derivarla a un modelo mayor reduce coste y latencia; el tamaño del modelo permite ejecutarlo en la misma máquina que el orquestador.
- Etiquetado y clasificación de textos breves: reseñas, titulares o mensajes de menos de 512 tokens, aprovechando la inferencia en CPU para procesar lotes sin GPU.
- Asistentes embebidos en dispositivos: Raspberry Pi, routers o sistemas con 256 MB de RAM disponible pueden alojar el modelo en cuantización de 4 bits para respuestas plantilladas o comandos de voz transcritos.
- Generación de texto estructurado corto: campos de formularios, descripciones de producto o respuestas de FAQ de una o dos frases, donde la ventana de 512 tokens es suficiente.
- Filtrado previo y moderación de contenido: primera pasada de bajo coste sobre textos cortos para descartar casos triviales antes de invocar un modelo mayor.
- Docencia: ejemplo completo y ligero de tokenizador BPE propio, configuración de atención con GQA y pipeline de preentrenamiento con restricciones de memoria, acompañado de un informe técnico descargable.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye evaluaciones de MMLU, HumanEval, GSM8K, HellaSwag ni de perplejidad sobre conjuntos de validación, y tampoco se aportan métricas de latencia o throughput.

## Requisitos de hardware

- VRAM estimada para inferencia (calculada a partir del recuento de safetensors, 56,9 M de parámetros): ~228 MB en FP32, ~114 MB en FP16/BF16, ~57 MB en int8 y ~30-35 MB en int4.
- GPU recomendadas: innecesarias. Cualquier GPU consumer con 2 GB o más (GTX 1650, RTX 3050, RTX 4090) es sobradamente suficiente, y el modelo también cabe en iGPU y en CPU.
- Cabe en GPU consumer: sí, en todas las GPU dedicadas modernas e incluso en placas integradas con memoria compartida. También en dispositivos tipo Raspberry Pi 4/5 en cuantización de 4 u 8 bits.
- Opciones de despliegue: `transformers` con PyTorch es la vía directa, ya que el repositorio solo publica safetensors. Para llama.cpp u Ollama sería necesaria una conversión previa a GGUF por parte del usuario. vLLM y TGI son compatibles a nivel de arquitectura (familia Llama) pero su despliegue está sobredimensionado para este tamaño.
- Latencia y throughput estimados: no disponibles. No se han publicado mediciones.

## Comparativa con modelos similares

Los datos de las alternativas provienen de información pública de sus respectivos repositorios, no de la información proporcionada sobre slmnegi.

| Modelo | Parametros | Contexto | Licencia | Estado de publicacion |
|---|---|---|---|---|
| slmnegi | 45,2 M declarados / 56,9 M en safetensors | 512 | Apache 2.0 | Sin benchmarks ni descargas; repo de 0,2 GB |
| Pythia-70M | 70 M | 2.048 | Apache 2.0 | Suite con benchmarks publicados (EleutherAI) |
| GPT-2 small | 124 M | 1.024 | MIT | Ampliamente evaluado y desplegado |
| SmolLM-135M | 135 M | 2.048 | Apache 2.0 | Benchmarks publicados por HuggingFace |

Frente a estas alternativas, slmnegi es el más pequeño en parámetros efectivos, pero también el único sin métricas de calidad publicadas y con la ventana de contexto más corta (512 tokens, frente a 1.024-2.048 de sus competidores). Su ventaja diferencial es el tamaño del artefacto y la documentación del proceso de preentrenamiento con presupuesto de memoria, no el rendimiento.

## Limitaciones y advertencias

- Modelo sin benchmarks: no existe ninguna evidencia publicada sobre su calidad en generación, razonamiento o código. Cualquier uso en producción parte de una base no validada.
- Contexto muy corto: 512 tokens limitan las conversaciones multi-turno, el resumen de documentos y cualquier tarea con prompts largos.
- Solo inglés: la etiqueta de idioma del repositorio es `en`; no hay indicios de soporte para castellano u otras lenguas.
- Riesgo elevado de alucinación: un modelo de ~50 M de parámetros entrenado con un presupuesto de memoria reducido tiene una capacidad factual muy limitada. No debe usarse como fuente de información sin verificación externa.
- Sesgos desconocidos: la model card no documenta la composición del corpus de entrenamiento, por lo que no es posible evaluar sesgos de género, raza, religión o ideología, ni filtrados de seguridad aplicados.
- Discrepancia de parámetros sin explicar: la diferencia entre 45,2 M (model card) y 56,9 M (safetensors) dificulta estimar con precisión costes de memoria y comparaciones justas.
- Madurez del artefacto: cero descargas y cero "likes" en el momento de la consulta, creado y actualizado el mismo día. No hay historial de versiones ni señales de mantenimiento.
- Licencia: Apache 2.0 permite uso comercial y modificaciones con atribución, pero al no estar documentado el dataset de entrenamiento el usuario asume el riesgo sobre la procedencia de los datos.
- Sin soporte de tool calling ni de agentes: no hay plantilla de chat, formato de funciones ni guía de integración publicados, lo que obliga a definirlos desde cero si se necesitan.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/negi4650/slmnegi
- Informe técnico (PDF alojado en el repositorio): https://huggingface.co/negi4650/slmnegi/blob/main/slmnegi_paper.pdf
- Ficheros de pesos (safetensors): https://huggingface.co/negi4650/slmnegi/tree/main
