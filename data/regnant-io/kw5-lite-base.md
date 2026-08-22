# regnant-io/kw5-lite-base

## Resumen

KW5-Lite es un modelo de lenguaje causal de tipo decoder-only transformer, desarrollado por Regnant.io, una empresa de investigación en inteligencia artificial soberana con sede en Dar es Salaam (Tanzania). El modelo está diseñado específicamente para el swahili (kiswahili), una lengua hablada por más de 200 millones de personas en África Oriental y que cuenta con muy pocos recursos en el ecosistema de NLP. Se trata de uno de los pocos modelos de swahili entrenados desde cero y publicados con pesos abiertos.

Con 109,5 millones de parámetros entrenables (134 millones en total incluyendo embeddings), una ventana de contexto de 2.048 tokens y un vocabulario de 32.000 tokens BPE, KW5-Lite se posiciona como un modelo ligero y eficiente, entrenado durante aproximadamente 120 horas en una única GPU NVIDIA T4. El entrenamiento se realizó sobre 1,88 mil millones de tokens de un corpus web swahili deduplicado (basado en FineWeb-2), completando el 89,3% del objetivo de 2,1 mil millones de tokens. Su licencia Apache 2.0 permite uso comercial sin restricciones, y su tamaño reducido lo hace accesible para investigación, fine-tuning y despliegue en hardware de consumo.

La relevancia de este modelo radica en que aborda la escasez de recursos lingüísticos para el swahili, ofreciendo una base sólida para tareas de generación de texto, fine-tuning y adaptación a tareas específicas en el ámbito de África Oriental. Su diseño moderno (RMSNorm, RoPE, SwiGLU, GQA-ready) y su documentación completa de entrenamiento lo convierten en una opción atractiva para desarrolladores e investigadores que necesitan un modelo base en swahili.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (12 capas, 768 de dimensión oculta, 12 cabezas de atención, FFN 2.048 con SwiGLU) |
| Parametros totales | 134M (109,5M entrenables + embeddings atados) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 2.048 tokens |
| Tipos de cuantizacion | No especificado (pesos en FP32, entrenamiento en FP16) |
| Idiomas soportados | Swahili (sw) |
| Licencia | Apache 2.0 |
| Formato de pesos | PyTorch (safetensors) |

## Arquitectura y entrenamiento

KW5-Lite sigue una arquitectura decoder-only transformer moderna, con 12 bloques que integran normalización RMSNorm (pre-norm), atención multi-cabeza con 12 cabezas, codificación posicional RoPE con escalado NTK y una FFN SwiGLU de 768 a 2.048 dimensiones. Los embeddings de entrada y salida están atados, lo que reduce parámetros y mejora la generalización. El diseño se optimizó para eficiencia en hardware de gama baja: se usó PyTorch SDPA en lugar de FlashAttention-2 (no soportado en T4 por su compute capability 7.5) y FP16 con escalado de gradientes (la T4 carece de soporte BF16). El entrenamiento se realizó con un scheduler WSD (warmup-stable-decay), con tasa de aprendizaje pico de ~3e-4, y se completaron 8.176 pasos sobre un corpus de 1,88 mil millones de tokens de swahili deduplicado (basado en FineWeb-2). El modelo se publica con pesos FP32, aunque se entrenó con precisión mixta FP16.

## Capacidades

- Generación de texto en swahili: es un modelo causal de lenguaje, capaz de completar texto y generar continuaciones coherentes en swahili.
- Fine-tuning para tareas específicas: al ser un modelo base, se puede adaptar mediante fine-tuning a tareas como clasificación de texto, generación de preguntas y respuestas, análisis de sentimiento o traducción automática.
- Modelado de lenguaje: puede servir como modelo de lenguaje para perplejidad, generación condicionada o como base para sistemas de autocompletado.
- Soporte de contexto medio: con 2.048 tokens, puede manejar párrafos largos o conversaciones de varias frases, pero no documentos extensos.
- No incluye capacidades avanzadas como tool calling, agentes o razonamiento multi-paso (no se mencionan en la documentación).
- Multilingüe limitado: solo swahili; no se han documentado capacidades en otras lenguas.

## Casos de uso

- Generación de contenido en swahili: KW5-Lite puede utilizarse para redactar artículos, noticias o textos de marketing en swahili, generando contenido coherente a partir de indicaciones o temas. Su tamaño reducido permite ejecutarlo en entornos con recursos limitados.
- Asistentes de escritura y autocompletado: integrable en editores de texto o plataformas de escritura para sugerir continuaciones de frases o corregir gramática en swahili, aprovechando su conocimiento del idioma.
- Sistemas de preguntas y respuestas sobre dominios específicos: tras un fine-tuning con datos propios, puede construir un asistente de preguntas y respuestas en swahili para sectores como educación, salud o atención al cliente, aunque requiere adaptación.
- Análisis de sentimiento y minería de opiniones: como modelo base, puede fine-tunearse para clasificar comentarios o reseñas en swahili, útil para empresas que operan en Tanzania o Kenia.
- Traducción automática: aunque no está entrenado para traducción, puede servir como componente en un pipeline de traducción swahili-inglés o swahili-otras lenguas, combinado con modelos de traducción existentes.
- Investigación académica en NLP de bajos recursos: KW5-Lite es un punto de partida para estudiar técnicas de entrenamiento eficiente, evaluación de modelos en lenguas minoritarias o desarrollo de recursos lingüísticos para swahili.
- Educación y aprendizaje de idiomas: puede integrarse en herramientas de práctica de swahili para generar ejercicios, diálogos o ejemplos de uso de vocabulario y gramática.

## Benchmarks y rendimiento

La model card declara un rango de perplexidad de 30 a 170 en un conjunto de prueba swahili mantenido fuera del entrenamiento (Swahili Held-out Test Set). Este dato es una métrica de perplexidad, pero no se proporciona el valor exacto ni se compara con otros modelos. No se han publicado resultados de benchmarks estándar como MMLU, HumanEval o GSM8K.

| Tarea | Dataset | Métrica | Valor |
|---|---|---|---|
| Generación de texto | Swahili Held-out Test Set (custom) | Perplexity | 30-170 (no verificado) |

## Requisitos de hardware

- VRAM estimada: el modelo tiene 134M de parámetros en FP32, lo que ocupa aproximadamente 536 MB en memoria. En FP16 serían unos 268 MB. Es viable en GPUs con 4 GB de VRAM o menos.
- GPUs recomendadas: cualquier GPU NVIDIA con al menos 4 GB de VRAM (GTX 1650, RTX 3050, T4, etc.). El entrenamiento se realizó en una T4 (16 GB), pero la inferencia es mucho menos exigente.
- Compatibilidad con hardware de consumo: sí, cabe en GPUs de consumo como la RTX 3060, RTX 4060, etc. También puede ejecutarse en CPU con cierta lentitud.
- Opciones de despliegue: al ser un modelo PyTorch estándar, puede servirse con vLLM, Hugging Face TGI, Ollama (si se convierte a GGUF), llama.cpp, o directamente con Transformers. La compatibilidad con vLLM y TGI no está confirmada, pero es probable dado el formato.
- Latencia y throughput: no hay datos oficiales. En una GPU T4, la generación debería ser de decenas de tokens por segundo, pero no se han publicado cifras.

## Comparativa con modelos similares

No se han identificado modelos comparables específicos para swahili en la información disponible. Existen modelos multilingües como mT5 o XLM-R que cubren swahili, pero no son comparables en arquitectura (encoder-decoder) ni en tamaño (parámetros). No hay información suficiente para realizar una comparativa con otros modelos de lenguaje swahili de tamaño similar.

## Limitaciones y advertencias

- Modelo de un solo idioma: solo entrenado en swahili; no soporta otros idiomas de forma nativa.
- Ventana de contexto limitada a 2.048 tokens, lo que restringe la capacidad para procesar documentos largos o conversaciones extensas.
- Entrenamiento incompleto: se utilizaron 1,88 mil millones de tokens de los 2,1 mil millones previstos (89,3 %), lo que puede implicar una subentrenamiento en ciertas áreas.
- No se han documentado capacidades avanzadas como tool calling, razonamiento multi-step o instrucciones complejas; es un modelo base que requiere fine-tuning para tareas específicas.
- La perplexidad declarada (30-170) es un rango muy amplio y no se ha verificado; no hay benchmarks comparativos con otros modelos.
- Posibles sesgos: al entrenarse con datos web deduplicados, puede heredar sesgos lingüísticos o culturales presentes en el corpus. No se han realizado evaluaciones de sesgo.
- Riesgo de alucinación: como todo modelo de lenguaje, puede generar contenido plausible pero incorrecto, especialmente en contextos donde carece de información.
- Licencia Apache 2.0: permite uso comercial, pero el modelo se ofrece sin garantías; el usuario es responsable de su uso.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/regnant-io/kw5-lite-base
- Sitio web de Regnant: https://www.regnant.io/
- Página de productos de Regnant (incluye referencia a KW5-Lite como programa de investigación): https://www.regnant.io/products
- LoRA de conversación en swahili basado en Qwen2.5-1.5B (no es el mismo modelo, pero relacionado): https://huggingface.co/qailunu/kw5-lite-swahili-lora
- Página de inferencia de FriendliAI para el LoRA (referencia adicional): https://friendli.ai/models/qailunu/kw5-lite-swahili-lora
