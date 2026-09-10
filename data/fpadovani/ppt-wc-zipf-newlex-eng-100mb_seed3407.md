# fpadovani/ppt-wc-zipf-newlex-eng-100mb_seed3407

## Resumen

`fpadovani/ppt-wc-zipf-newlex-eng-100mb_seed3407` es un modelo de lenguaje de tipo decoder-only con arquitectura GPT-2 y 86.508.288 parámetros, publicado por el usuario fpadovani. Se trata de un ajuste fino (fine-tuning) supervisado del modelo base `goldfish-models/eng_latn_100mb`, un modelo de la familia Goldfish entrenado con aproximadamente 100 MB de texto en inglés. El ajuste se ha realizado con SFT mediante la librería TRL, dentro de lo que parece un experimento de investigación académica (el identificador incluye términos como «zipf» y «newlex», y la ejecución de entrenamiento está registrada en un proyecto de Weights & Biases asociado a la Universidad de Groningen).

El modelo no es un asistente conversacional de propósito general ni compite con los grandes modelos actuales: por tamaño y procedencia, su utilidad principal es la investigación sobre adquisición léxica, distribuciones de frecuencia tipo Zipf y comportamiento de modelos pequeños entrenados con presupuestos de cómputo mínimos. Tiene 0 descargas y 0 «likes» en HuggingFace, la licencia no está declarada de forma explícita y no se han publicado resultados de benchmarks ni detalles sobre la composición del dataset de ajuste.

Es relevante ahora como ejemplo reproducible de un flujo de trabajo de ajuste fino con TRL sobre un modelo pequeño, útil para estudiar cómo se comportan los modelos de menos de 100 millones de parámetros cuando se les somete a ajuste supervisado, y como punto de comparación en experimentos controlados con distintas semillas (el sufijo `seed3407` sugiere que forma parte de una batería de ejecuciones con semillas fijas).

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only estilo GPT-2 (etiqueta `gpt2` en HuggingFace) |
| Parámetros totales | 86.508.288 (dato real de los pesos en safetensors) |
| Parámetros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | No disponible (no se publican versiones cuantizadas) |
| Idiomas soportados | No disponible en la ficha de HuggingFace; el modelo base es `eng_latn_100mb`, centrado en inglés |
| Licencia | No disponible (la model card incluye el marcador de posición `licence: license`) |
| Formato de pesos | safetensors (librería `transformers`) |
| Tamaño del repositorio | 1,4 GB |
| Modelo base | `goldfish-models/eng_latn_100mb` |
| Método de ajuste | SFT con TRL 0.23.0 |
| Versiones de framework | Transformers 4.56.2, PyTorch 2.11.0, Datasets 4.8.4, Tokenizers 0.22.1 |
| Fecha de publicación | 10 de septiembre de 2026 |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

La arquitectura es la de un transformer decoder-only con atención causal completa, en la línea de GPT-2, con 86,5 millones de parámetros. No hay indicios de mezcla de expertos (MoE), atención lineal, SSM ni mecanismos híbridos: la etiqueta `gpt2` de HuggingFace y el pipeline `text-generation` confirman un diseño denso y convencional. El modelo hereda la configuración y el tokenizador de `goldfish-models/eng_latn_100mb`, un modelo de la familia Goldfish pensado para estudiar el aprendizaje multilingüe con un presupuesto de datos reducido (100 MB de texto por idioma). No se especifica en la información disponible la longitud de contexto efectiva, el número de capas, la dimensión oculta ni el tamaño del vocabulario.

El entrenamiento se ha realizado mediante ajuste fino supervisado (SFT) con TRL 0.23.0 sobre Transformers 4.56.2 y PyTorch 2.11.0. La ejecución está registrada en Weights & Biases bajo el proyecto `f-padovani-university-of-groningen/white_cotterell`, con el identificador `d941ntfe`, lo que apunta a un contexto de investigación académica. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset de SFT, la existencia de fases de RLHF o DPO, ni sobre innovaciones técnicas adicionales (decodificación especulativa, atención optimizada, etc.). El nombre del modelo sugiere un experimento sobre distribuciones Zipf y léxico nuevo, pero no hay documentación publicada que lo confirme.

## Capacidades

- Generación de texto en inglés: el modelo completa texto y responde a entradas de tipo conversacional, como muestra el ejemplo de `pipeline("text-generation")` de su model card.
- Ajuste a formato de instrucciones: al haber sido entrenado con SFT, se espera que siga el formato de mensajes con roles (`{"role": "user", "content": ...}`), tal como aparece en el ejemplo oficial de uso.
- Razonamiento básico y coherencia a corto plazo: capacidad limitada por el tamaño del modelo (86,5 M de parámetros) y por un presupuesto de entrenamiento muy reducido.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible; no hay evidencia de entrenamiento específico para ello.
- Capacidades multilingües: el modelo base está etiquetado como `eng_latn` (inglés), por lo que el multilingüismo es, como mínimo, muy limitado; no hay datos que confirmen soporte de otros idiomas.
- Modo «thinking» explícito: no disponible.
- Visión o audio: no disponible.
- Despliegue como endpoint: las etiquetas `text-generation-inference` y `endpoints_compatible` indican compatibilidad con TGI y con los endpoints de HuggingFace.

## Casos de uso

- Investigación sobre adquisición léxica: el modelo puede emplearse como sujeto de prueba en experimentos que midan qué palabras y construcciones aprende un transformer de 86,5 M de parámetros tras un ajuste SFT sobre un corpus inglés de 100 MB, comparando resultados entre semillas distintas.
- Estudios de distribuciones Zipf: dado el identificador del modelo, es plausible usarlo para analizar cómo la frecuencia de las palabras en el corpus condiciona la probabilidad asignada por el modelo, útil en trabajos de lingüística computacional.
- Reproducción de experimentos de ajuste fino: sirve como referencia reproducible de un pipeline TRL + Transformers, con versiones de framework documentadas y una ejecución trazable en Weights & Biases.
- Prototipado rápido en local: al ocupar menos de 200 MB en precisión de 16 bits, permite probar flujos de generación de texto en portátiles o incluso en CPU sin necesidad de GPU dedicada.
- Generación de texto sintético en inglés para tareas auxiliares: puede producir continuaciones y respuestas cortas que sirvan como datos de prueba en etapas tempranas de un pipeline, siempre con revisión humana por su limitada calidad.
- Docencia y talleres: es un caso práctico y ligero para explicar el ciclo completo de ajuste supervisado, desde el modelo base hasta el despliegue con `pipeline` de Transformers.
- Pruebas de integración de infraestructura: sus etiquetas `text-generation-inference` y `endpoints_compatible` permiten usarlo para verificar que un despliegue con TGI o con los endpoints de HuggingFace funciona correctamente antes de pasar a modelos de mayor tamaño.
- Comparación de semillas en experimentos controlados: al existir variantes con distintas semillas (el sufijo `seed3407` lo sugiere), puede emplearse para medir la varianza entre ejecuciones de un mismo protocolo de entrenamiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,17 GB en fp16/bf16 y 0,35 GB en fp32, solo para los pesos; el consumo real depende de la longitud de la secuencia y del tamaño del lote.
- GPU recomendadas: cualquier GPU con al menos 1-2 GB de memoria libre es suficiente, incluidas GTX 1050 Ti, GTX 1650, RTX 3050, RTX 4090, A100 o H100; el modelo está muy por debajo de la capacidad de todas ellas.
- Compatibilidad con GPU de consumo: sí, cabe holgadamente en cualquier GPU de consumo de los últimos diez años, e incluso en aceleradores integrados con memoria unificada.
- Ejecución en CPU: viable sin GPU, ya que el modelo es pequeño; el rendimiento dependerá del número de núcleos y de si se usa `torch.compile` u otras optimizaciones.
- Opciones de despliegue: `transformers` con `pipeline` (método documentado por el autor), servidores compatibles con la API de HuggingFace, Text Generation Inference (TGI) según la etiqueta `text-generation-inference`, y los endpoints alojados de HuggingFace. La conversión a GGUF para llama.cpp u Ollama es técnicamente posible por tratarse de una arquitectura GPT-2, pero no se publica ninguna versión de ese tipo en la información disponible.
- Latencia y throughput estimados: no disponibles. Con un modelo de este tamaño, en una GPU moderna la generación sería del orden de cientos a miles de tokens por segundo, pero no hay mediciones publicadas que lo confirmen.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| `fpadovani/ppt-wc-zipf-newlex-eng-100mb_seed3407` | 86.508.288 | No disponible | No disponible | HuggingFace, 0 descargas | Ajuste SFT del modelo Goldfish de 100 MB en inglés |
| `goldfish-models/eng_latn_100mb` | No disponible | No disponible | No disponible | HuggingFace | Modelo base del anterior; entrenado con 100 MB de texto en inglés |
| `distilgpt2` | 82 millones (aprox.) | 1.024 tokens | Apache-2.0 | HuggingFace | Destilación de GPT-2, ampliamente usado como referencia de modelos pequeños |
| `gpt2` | 124 millones (aprox.) | 1.024 tokens | MIT | HuggingFace | Modelo original de OpenAI; referencia habitual en experimentos de bajo cómputo |

No se dispone de datos de rendimiento comparativos entre estos modelos en la información proporcionada, por lo que la comparación se limita a parámetros, contexto, licencia y disponibilidad.

## Limitaciones y advertencias

- Tamaño muy reducido: con 86,5 millones de parámetros, la capacidad de razonamiento, la coherencia a largo plazo y la fidelidad factual son limitadas en comparación con modelos actuales.
- Riesgo elevado de alucinación: el modelo no dispone de mecanismos de verificación ni de recuperación de conocimiento; cualquier afirmación factual que genere debe tratarse como no fiable.
- Idiomas: el modelo base está vinculado al inglés (`eng_latn`); no hay evidencia de un rendimiento aceptable en castellano ni en otros idiomas.
- Licencia no declarada: la model card incluye un marcador de posición (`licence: license`) y la ficha de HuggingFace indica «no disponible». Antes de cualquier uso comercial es imprescindible contactar con el autor para aclarar los términos, incluidos los del modelo base.
- Procedencia académica: se trata de un artefacto de investigación con 0 descargas y 0 interacciones, sin documentación de dataset, sin evaluación publicada y sin mantenimiento conocido.
- Contexto desconocido: al no documentarse la longitud de contexto, no se puede garantizar el comportamiento en conversaciones largas ni en tareas que requieran ventanas amplias.
- Sesgos: no se ha publicado ningún análisis de sesgos. Al derivar de un corpus inglés de 100 MB, es probable que reproduzca los sesgos presentes en ese material, pero no hay datos que lo cuantifiquen.
- No apto para producción crítica: la ausencia de benchmarks, de evaluación de seguridad y de soporte lo desaconsejan para aplicaciones en las que los errores tengan consecuencias reales.
- Formato de pesos: solo se publican pesos en safetensors; no hay versiones cuantizadas ni GGUF oficiales, lo que limita las opciones de despliegue en entornos sin GPU.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/fpadovani/ppt-wc-zipf-newlex-eng-100mb_seed3407
- Modelo base: https://huggingface.co/goldfish-models/eng_latn_100mb
- Ejecución de entrenamiento en Weights & Biases: https://wandb.ai/f-padovani-university-of-groningen/white_cotterell/runs/d941ntfe
- Repositorio de TRL: https://github.com/huggingface/trl
- Repositorio de Weights & Biases (insignia usada en la model card): https://github.com/wandb/assets
- Cita de TRL (von Werra et al., 2020): incluida en la propia model card, sin DOI ni enlace adicional

Nota: los resultados de la búsqueda web proporcionados (Bankier.pl, Allegro, Zhihu) no guardan relación con el modelo y no se han utilizado como fuente.
