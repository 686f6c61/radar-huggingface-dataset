# EXAiStudio/EX-AI-Corase-163M

## Resumen

EX-AI-Corase-163M es un modelo de lenguaje enmascarado (masked language model) de tipo BERT desarrollado desde cero por EX AI Studio, un laboratorio iraní. Está diseñado exclusivamente para persa (farsi) y su propósito declarado es la investigación en procesamiento de lenguaje natural persa, concretamente la predicción contextual de palabras y la obtención de representaciones bidireccionales del texto. Con aproximadamente 163 millones de parámetros, se sitúa en la misma escala que BERT-base, pero con un vocabulario considerablemente mayor (100.000 tokens frente a los ~30.000 de BERT-base multilingüe), lo que sugiere una tokenización adaptada al persa.

El modelo no es generativo ni conversacional: es un encoder bidireccional que rellena máscaras (`fill-mask`) y produce embeddings contextuales. Por tanto, su utilidad práctica está en tareas downstream (clasificación, NER, similitud semántica, reranking) mediante fine-tuning, no en generación de texto libre ni en diálogo. La ventana de contexto es de 512 tokens, típica de la familia BERT.

La relevancia de esta ficha es limitada pero concreta: se trata de un modelo muy reciente (publicado en noviembre de 2026), con cero descargas y cero likes en el momento de la consulta, entrenado en una única RTX 3080 durante aproximadamente una hora y sin resultados de benchmarks publicados. Es, por tanto, un artefacto de investigación incipiente más que un modelo listo para producción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | BERT (transformer encoder bidireccional) |
| Parámetros totales | ~163 millones |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | 512 tokens (maximum position embeddings) |
| Tipos de cuantización | no disponible (pesos en float32; compatible con cuantización estándar de PyTorch/transformers, no documentada por el autor) |
| Idiomas soportados | persa (farsi) únicamente |
| Licencia | no disponible |
| Formato de pesos | safetensors / PyTorch (formato estándar de transformers; no detallado en la model card) |

Configuración interna declarada por el autor:

| Parámetro | Valor |
|---|---|
| Clase de modelo | BertForMaskedLM |
| Tamaño de vocabulario | 100.000 |
| Hidden size | 768 |
| Cabezas de atención | 12 |
| Capas ocultas | 12 |
| Tamaño intermedio | 3.072 |
| Máx. position embeddings | 512 |
| Type vocabulary size | 2 |
| Activación | GELU |
| Dropout (atención / hidden) | 0,1 / 0,1 |
| Tipo de position embedding | absoluto |
| Layer norm epsilon | 1e-12 |
| Initializer range | 0,02 |
| Padding token ID | 0 |
| Tipo de dato | float32 |
| Versión de transformers | 4.57.6 |

## Arquitectura y entrenamiento

La arquitectura es un transformer encoder estándar de estilo BERT con 12 capas, 768 dimensiones ocultas y 12 cabezas de atención, es decir, la configuración canónica de BERT-base. La diferencia principal respecto a BERT-base radica en el vocabulario: 100.000 tokens, muy superior al de BERT-base (~30.000) y al de BERT-base multilingüe (~120.000 pero repartido entre más de 100 idiomas). Un vocabulario de ese tamaño dedicado a un solo idioma implica una tokenización más fina y, en teoría, secuencias más cortas para el mismo texto, aunque también un embedding de entrada más grande (100.000 × 768 ≈ 76,8 M de parámetros solo en la tabla de embeddings, cerca de la mitad del total del modelo).

El entrenamiento se realizó desde cero sobre un dataset propietario descrito únicamente como "de alta calidad, filtrado y curado" por EX AI Studio; no se especifica el número de tokens, la composición del corpus, ni si hubo técnicas de enmascaramiento dinámico, whole-word masking u otras variantes. Tampoco se documenta ningún proceso de RLHF, DPO o ajuste instructivo, lo cual es coherente con un modelo exclusivamente de masked language modeling. El autor indica que el entrenamiento se completó en aproximadamente una hora sobre una NVIDIA GeForce RTX 3080, un dato que resulta llamativo para un modelo de 163 M de parámetros y que sugiere un corpus de entrenamiento reducido o un número de pasos limitado; no se aporta ninguna cifra de tokens procesados ni de epochs.

## Capacidades

- Predicción de palabras enmascaradas (`fill-mask`) en persa, usando el contexto bidireccional izquierdo y derecho.
- Generación de representaciones contextuales de tokens y secuencias para tareas downstream.
- Comprensión bidireccional del texto persa, adecuada para clasificación de secuencias y etiquetado de tokens tras fine-tuning.
- Capacidad multilingüe: no disponible; el modelo es monolingüe en persa.
- Tool calling / function calling: no soportado (no es un modelo instructivo ni generativo).
- Razonamiento multi-paso y uso como agente: no soportado.
- Modo "thinking", visión, audio: no disponible.
- Generación de texto libre: no soportada de forma nativa; solo relleno de máscaras.

## Casos de uso

- Corrección ortográfica y sugerencia de palabras en persa: dado un texto con un hueco o un token erróneo, el modelo devuelve las palabras más probables según el contexto inmediato, lo que permite construir un corrector o un autocompletado para editores y teclados persas.
- Etiquetado de secuencias (NER, POS) en persa: partiendo del encoder preentrenado, se añade una cabeza de clasificación token a token y se ajusta con un corpus anotado; la ventana de 512 tokens cubre la mayoría de frases y párrafos cortos.
- Clasificación de textos persas (categorización de noticias, detección de spam, análisis de sentimiento): se usa el embedding del token `[CLS]` o un pooling de la secuencia como entrada a un clasificador ligero, aprovechando el preentrenamiento monolingüe.
- Búsqueda semántica y reranking en corpus persas: los embeddings contextuales permiten calcular similitud entre consulta y documento en un motor de recuperación; el modelo es lo bastante pequeño (~163 M) para servir como encoder en tiempo real.
- Filtrado y deduplicación de datasets persas: comparar representaciones de frases para detectar duplicados casi idénticos o contenido de baja calidad antes de entrenar modelos mayores.
- Investigación académica sobre tokenización y vocabulario en persa: el vocabulario de 100.000 tokens lo convierte en un objeto de estudio útil para analizar cómo afecta el tamaño del vocabulario a la cobertura léxica del farsi.
- Base para modelos downstream de preguntas y respuestas extractivas: con fine-tuning sobre SQuAD-fa o corpus equivalentes, el encoder puede localizar el span de respuesta dentro de un pasaje de hasta 512 tokens.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas de ningún tipo (ni perplejidad, ni MMLU, ni evaluaciones de fill-mask, ni comparaciones con otros modelos persas).

## Requisitos de hardware

- VRAM para inferencia en float32: aproximadamente 0,65 GB solo para pesos (163 M × 4 bytes), más activaciones y overhead de PyTorch; en la práctica, menos de 2 GB para lotes pequeños y secuencias de 512 tokens.
- VRAM en float16/bfloat16: aproximadamente 0,33 GB para pesos; cabe holgadamente en cualquier GPU consumer.
- GPU recomendadas: cualquier GPU con al menos 2-4 GB de VRAM es suficiente (RTX 3060, RTX 4060, RTX 4090, A100, H100). Para entrenamiento o fine-tuning con lotes grandes, se recomienda RTX 3090/4090 o superiores.
- Cabe en GPU consumer: sí, en prácticamente todas las GPU dedicadas modernas e incluso en iGPU con suficiente memoria compartida para inferencia puntual.
- Opciones de despliegue: transformers (PyTorch) de forma nativa; exportación a ONNX Runtime o TorchScript para servir; cuantización dinámica con PyTorch; conversión a GGUF para llama.cpp no está documentada por el autor y requeriría verificación manual. vLLM y TGI no están orientados a modelos `fill-mask` de este tipo, por lo que no son la vía recomendada.
- Latencia y throughput: no disponibles; no se han publicado mediciones. Por el tamaño, se espera latencia de milisegundos por secuencia en GPU moderna, pero es una estimación, no un dato del autor.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idioma | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| EX-AI-Corase-163M | ~163 M | 512 | Persa | no disponible | Hugging Face (0 descargas) |
| BERT-base multilingüe (Google) | ~178 M | 512 | 100+ idiomas (incl. persa) | Apache 2.0 | Hugging Face, ampliamente usado |
| ParsBERT (Hooshvare) | ~162 M (BERT-base) | 512 | Persa | Apache 2.0 (según versión) | Hugging Face, con benchmarks publicados |
| XLM-R base | ~278 M | 512 | 100 idiomas | MIT | Hugging Face |

La comparación con ParsBERT es la más directa por tamaño y dominio: ambos son BERT-base adaptados al persa, pero ParsBERT cuenta con evaluaciones publicadas en tareas downstream y una licencia clara, mientras que EX-AI-Corase-163M no aporta ni benchmarks ni licencia. Frente a BERT-base multilingüe, la ventaja teórica de Corase es un vocabulario dedicado al persa; la desventaja es la ausencia total de validación empírica. No se dispone de datos de rendimiento comparado para ninguno de los dos lados en el caso de Corase.

## Limitaciones y advertencias

- Ausencia total de benchmarks: no hay ninguna evidencia publicada de que el modelo supere a alternativas establecidas como ParsBERT o BERT-base multilingüe en persa.
- Licencia no disponible: no se puede determinar si el uso comercial está permitido; en producción esto es un bloqueante legal hasta que el autor lo aclare.
- Entrenamiento muy corto (≈1 hora en una RTX 3080) y corpus no documentado: es probable que el modelo haya visto una fracción pequeña de texto persa en comparación con modelos preentrenados de referencia, lo que puede traducirse en representaciones pobres fuera de dominios frecuentes.
- Modelo monolingüe: no procesa otros idiomas, incluido el inglés, de forma fiable.
- Contexto limitado a 512 tokens: no apto para documentos largos sin troceado previo.
- No es generativo ni instructivo: no puede usarse como chatbot, para resumen abstractivo ni para generación de código.
- Riesgo de sesgos: al no documentarse la composición del corpus, se desconocen los sesgos de género, políticos o culturales que pueda haber absorbido; en un modelo iraní sin transparencia de datos, conviene auditar antes de desplegar en aplicaciones sensibles.
- Riesgo de alucinación en fill-mask: el modelo siempre devolverá candidatos, incluso ante contextos sin sentido; las puntuaciones deben calibrarse y filtrarse por umbral.
- Madurez: 0 descargas y 0 likes en el momento de la consulta; sin issues, sin comunidad y sin mantenimiento demostrado.
- Fecha de creación futura en los metadatos (noviembre de 2026): conviene verificar la integridad del repositorio antes de confiar en él.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/EXAiStudio/EX-AI-Corase-163M
- Repositorio de transformers (librería utilizada, versión 4.57.6): https://github.com/huggingface/transformers
- Paper de BERT (arquitectura base): https://arxiv.org/abs/1810.04805
- ParsBERT (modelo persa comparable): https://huggingface.co/HooshvareLab/bert-base-parsbert-uncased
- BERT-base multilingüe (alternativa): https://huggingface.co/google-bert/bert-base-multilingual-cased
