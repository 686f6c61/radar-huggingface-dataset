# fpadovani/ppt-wc-zipf-newlex-66-eng-100mb_seed13

## Resumen

El modelo fpadovani/ppt-wc-zipf-newlex-66-eng-100mb_seed13 es un ajuste fino (fine-tune) del modelo monolingüe en inglés goldfish-models/eng_latn_100mb, publicado por el usuario fpadovani (vinculado a la Universidad de Groningen según la URL del proyecto en Weights & Biases). Se trata de un modelo de generación de texto de arquitectura GPT-2 con 86.508.288 parámetros (unos 86,5 millones), entrenado mediante SFT (supervised fine-tuning) con la librería TRL 0.23.0 sobre Transformers 4.56.2 y PyTorch 2.11.0. El repositorio ocupa 1,4 GB, lo que sugiere que incluye artefactos de entrenamiento además de los pesos en safetensors.

El nombre del modelo es altamente descriptivo de su propósito experimental: hace referencia a "word count" (wc), a una distribución de Zipf, a un léxico nuevo ("newlex"), al identificador 66 y a la semilla 13, sobre el subconjunto en inglés de 100 MB del proyecto Goldfish. Esto indica que no se trata de un modelo orientado a producto, sino de un artefacto de investigación para estudiar cómo el ajuste fino con datos cuya distribución de frecuencias léxicas sigue una ley de Zipf (potencialmente con un vocabulario o léxico modificado) afecta al comportamiento del modelo base.

Su relevancia es, por tanto, metodológica: sirve como punto de comparación en experimentos controlados sobre distribución léxica, tokenización y sobreajuste a dominios sintéticos. Con 0 descargas y 0 "likes" en HuggingFace y sin resultados de benchmarks publicados, debe considerarse un modelo de nicho para reproducibilidad de investigación, no una opción para producción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | GPT-2 (transformer decoder-only, según la etiqueta `gpt2` del repositorio); detalles de configuración no disponibles |
| Parámetros totales | 86.508.288 (dato real de los pesos en safetensors) |
| Parámetros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (no se publican pesos cuantizados; al ser safetensors en precisión completa, se puede cuantizar con herramientas externas) |
| Idiomas soportados | no disponible en la model card; el modelo base es `goldfish-models/eng_latn_100mb`, monolingüe en inglés |
| Licencia | no disponible (la model card incluye un campo malformado `licence: license`, sin texto de licencia) |
| Formato de pesos | safetensors (librería `transformers`) |

## Arquitectura y entrenamiento

La model card no describe la arquitectura interna, pero la etiqueta `gpt2` del repositorio y el modelo base (`goldfish-models/eng_latn_100mb`, perteneciente a la familia Goldfish de modelos monolingües entrenados con unos 100 MB de texto por idioma) apuntan a un transformer decoder-only de tipo GPT-2 con atención causal completa. El recuento exacto de 86.508.288 parámetros indica una configuración propia, distinta del GPT-2 small estándar (124 M), probablemente con menos capas o un vocabulario de menor tamaño. El campo "newlex" del nombre sugiere que el proceso pudo implicar una modificación del léxico o del vocabulario, aunque no hay documentación que lo confirme.

El entrenamiento se realizó con SFT (supervised fine-tuning) usando TRL 0.23.0 sobre el modelo base ya preentrenado, con Transformers 4.56.2, PyTorch 2.11.0, Datasets 4.8.4 y Tokenizers 0.22.1. No se especifican en la información disponible el número de tokens de entrenamiento, la composición del dataset, la existencia de fases de RLHF o DPO, ni hiperparámetros relevantes (learning rate, épocas, schedule). Sí se enlaza una ejecución de Weights & Biases que contendría las curvas de entrenamiento. No se documenta ninguna innovación técnica (decodificación especulativa, atención lineal, SSM, etc.).

## Capacidades

- Generación de texto autoregresiva en inglés, heredada del modelo base GPT-2 y refinada mediante SFT.
- Formato de conversación: la model card muestra el uso de una lista de mensajes con roles (`[{"role": "user", "content": ...}]`), lo que indica que el ajuste introdujo algún formato de chat o instrucciones, aunque no se especifica la plantilla exacta.
- Capacidades de razonamiento, código, matemáticas o conocimiento factual: no disponibles ni verificadas; por tamaño (86,5 M de parámetros) y datos de partida (100 MB de texto) son esperables muy limitadas.
- Tool calling / function calling: no disponible; no se documenta soporte.
- Uso en agentes o razonamiento multi-paso: no disponible; no se documenta soporte.
- Capacidades multilingües: no disponibles; el modelo base es monolingüe en inglés y no hay indicios de multilingüismo.
- Capacidades especiales (modo "thinking", visión, audio): no disponibles; no se documenta ninguna.

## Casos de uso

- Investigación sobre distribuciones léxicas: el modelo permite medir cómo un ajuste fino con datos cuya frecuencia de palabras sigue una ley de Zipf altera la distribución de salida del modelo base, comparando entropía y frecuencia de vocabulario generado.
- Estudio de tokenización y vocabulario ("newlex"): sirve para analizar el efecto de modificar el léxico o el tokenizador sobre un modelo pequeño, midiendo cambios en perplejidad y en la tasa de tokens desconocidos frente a `goldfish-models/eng_latn_100mb`.
- Replicabilidad de experimentos con semillas: al estar identificado con `seed13`, se puede emplear como réplica para estimar la varianza entre semillas en pipelines de SFT con TRL.
- Docencia de ajuste fino: su tamaño (86,5 M de parámetros, 1,4 GB de repositorio) permite ejecutar un ciclo completo de carga, inferencia y ajuste en un portátil o en una GPU de gama baja, lo que resulta útil en cursos de NLP.
- Pruebas de integración de pipelines: con 0 descargas y pesos ligeros, es adecuado como modelo "dummy" para validar extremo a extremo un servicio de text-generation-inference, un endpoint compatible con la API de HuggingFace o un job de CI sin coste de GPU significativo.
- Generación de texto corto controlado en inglés: para prototipos donde solo se requiere completar frases o generar respuestas breves sobre dominios sintéticos o muy restringidos, siempre que se valide antes la calidad real de las salidas.
- Análisis de sobreajuste y olvido catastrófico: al derivar de un modelo preentrenado con solo 100 MB de texto, es un buen sujeto de estudio para medir cuánta capacidad general se pierde tras un SFT intensivo sobre un dataset especializado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas de evaluación (MMLU, HumanEval, GSM8K, perplejidad, etc.) ni comparaciones cuantitativas con modelos similares.

## Requisitos de hardware

- VRAM estimada para inferencia de los pesos completos: aproximadamente 0,35 GB en FP32 (86,5 M × 4 bytes), 0,17 GB en FP16/BF16, 0,09 GB en cuantización de 8 bits y 0,05 GB en 4 bits, más el consumo del runtime y de la caché KV (dependiente de la longitud de contexto, no documentada).
- GPU recomendadas: cualquier GPU con al menos 1-2 GB de VRAM libre; el modelo funciona sin problema en GTX 1650, RTX 3050, RTX 4090, A100 o H100, aunque estas dos últimas están enormemente sobredimensionadas para este tamaño.
- Cabe con holgura en GPU de consumo, en iGPU modernas y en CPU (ejecución en CPU perfectamente viable para lotes pequeños).
- Opciones de despliegue: `transformers` (pipeline de text-generation), text-generation-inference (el repositorio está etiquetado como `endpoints_compatible` y `text-generation-inference`) y vLLM son las vías más directas al ser una arquitectura GPT-2. Para llama.cpp u Ollama sería necesario convertir los pesos a GGUF, conversión que no se distribuye en el repositorio.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| fpadovani/ppt-wc-zipf-newlex-66-eng-100mb_seed13 | 86,5 M | no disponible | sin benchmarks publicados | no disponible | HuggingFace, 0 descargas |
| goldfish-models/eng_latn_100mb (modelo base) | no disponible en la información proporcionada | no disponible | sin datos en la información disponible | no disponible | HuggingFace |
| GPT-2 small (referencia de arquitectura) | 124 M | 1024 tokens (configuración estándar de GPT-2) | ampliamente evaluado en la literatura | MIT (versión original de OpenAI) | HuggingFace, ampliamente desplegado |
| distilgpt2 (referencia de tamaño) | 82 M | 1024 tokens (configuración estándar) | ampliamente evaluado en la literatura | Apache 2.0 | HuggingFace |

La comparación con modelos como GPT-2 small o distilgpt2 es únicamente orientativa por tamaño y familia arquitectónica: no hay datos de rendimiento del modelo analizado que permitan una comparación cuantitativa.

## Limitaciones y advertencias

- No hay licencia especificada de forma válida: la model card contiene `licence: license`, un campo sin contenido legal. No se puede asumir uso comercial permitido; habría que contactar con el autor y verificar también la licencia del modelo base.
- Sesgos conocidos: no documentados, pero el modelo base se entrenó con 100 MB de texto en inglés, un volumen muy reducido, por lo que es esperable un sesgo fuerte hacia las temáticas y el registro de ese corpus.
- Riesgo de alucinación: muy alto para conocimiento factual; un modelo de 86,5 M de parámetros con 100 MB de preentrenamiento carece de la capacidad de almacenar conocimiento fiable y tenderá a generar texto plausible pero incorrecto.
- Limitaciones de contexto: la longitud de contexto no está documentada; no debe asumirse que soporte conversaciones largas ni documentos extensos.
- Limitaciones de idioma: el modelo base es monolingüe en inglés (`eng_latn`); no hay evidencia de capacidades en castellano ni en otros idiomas.
- Sin datos de entrenamiento publicados: se desconoce la composición del dataset de SFT, por lo que no se puede descartar contaminación, datos sintéticos osobreajuste severo.
- Sin benchmarks: no existe ninguna métrica publicada que permita validar su calidad; cualquier uso en producción requeriría una evaluación propia previa.
- Advertencia de producción: con 0 descargas, 0 "likes" y ausencia de documentación, debe tratarse como un artefacto de investigación no mantenido. Para despliegues reales conviene partir de modelos base con licencia clara, evaluación publicada y mantenimiento activo.
- El uso de la semilla en el nombre implica que existen otras variantes del mismo experimento; no se garantiza que esta sea la mejor versión.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/fpadovani/ppt-wc-zipf-newlex-66-eng-100mb_seed13
- Modelo base: https://huggingface.co/goldfish-models/eng_latn_100mb
- Ejecución de entrenamiento en Weights & Biases: https://wandb.ai/f-padovani-university-of-groningen/white_cotterell/runs/xlk5k7ap
- Repositorio de TRL: https://github.com/huggingface/trl
- Búsqueda web realizada: los resultados devueltos no guardan relación con el modelo (resultados genéricos sobre Amazon), por lo que no aportan enlaces adicionales verificables.
