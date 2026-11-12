# Chirag080/sentiment-classifier

## Resumen

Chirag080/sentiment-classifier es un ajuste fino (fine-tuning) del modelo instructivo Qwen/Qwen2.5-1.5B-Instruct, publicado por el usuario Chirag080 en Hugging Face. A pesar de su nombre, que sugiere una tarea de clasificación de sentimiento, la model card no documenta dicha tarea: se presenta como un modelo de generación de texto entrenado mediante SFT (supervised fine-tuning) con la librería TRL, y el ejemplo de uso incluido en la tarjeta es una pregunta abierta de generación, no una clasificación. Esta discrepancia entre nombre y contenido es el dato más relevante de la ficha.

El modelo hereda la arquitectura y el tamaño del Qwen2.5-1.5B-Instruct original: un transformer decoder-only de aproximadamente 1.500 millones de parámetros, con una ventana de contexto de 32.768 tokens en su versión base (dato del modelo original, no confirmado para este ajuste). El repositorio tiene un tamaño de 0,0 GB y cero descargas, lo que indica que es una publicación reciente y sin validación por parte de la comunidad. La licencia no está declarada de forma utilizable (la model card incluye el literal "licence: license").

Su relevancia práctica es limitada: se trata de un experimento de ajuste fino sin documentación de datos de entrenamiento, sin benchmarks y sin licencia clara. Resulta útil como referencia para quien quiera reproducir un pipeline de SFT con TRL sobre Qwen2.5-1.5B-Instruct, pero no es recomendable para producción sin una evaluación previa y una clarificación de la licencia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (heredada de Qwen/Qwen2.5-1.5B-Instruct) |
| Parametros totales | ~1.500 millones (derivados del modelo base; no confirmado en la model card) |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible para este ajuste; el modelo base Qwen2.5-1.5B-Instruct soporta 32.768 tokens |
| Tipos de cuantizacion | no disponible (el repositorio solo publica safetensors; no se listan versiones GGUF, AWQ ni GPTQ) |
| Idiomas soportados | no disponible (el modelo base Qwen2.5 es multilingüe, pero la model card no lo declara) |
| Licencia | no disponible (la model card incluye el literal "licence: license", sin licencia utilizable) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un ajuste fino del instructivo Qwen2.5-1.5B-Instruct, un transformer decoder-only con atención causal estándar, RoPE para codificación posicional y las mejoras de la familia Qwen2.5 (atención con sesgo QKV, RMSNorm, SwiGLU en el MLP). No se documenta ninguna modificación arquitectónica respecto al modelo base.

El entrenamiento se realizó mediante SFT (supervised fine-tuning) con TRL 1.17.1, sobre Transformers 5.22.1, PyTorch 2.14.1+cu130, Datasets 4.8.5 y Tokenizers 0.23.3. La model card no especifica el número de tokens de entrenamiento, la composición del dataset, si hubo etapas de RLHF o DPO, ni hiperparámetros como tasa de aprendizaje, batch size o número de épocas. Tampoco se indica si se aplicó algún tipo de enmascaramiento de pérdida específico para clasificación, lo que resulta relevante dado el nombre del modelo.

## Capacidades

- Generación de texto conversacional: el ejemplo de la model card usa `pipeline("text-generation")` con formato de mensajes de rol usuario/asistente.
- Razonamiento y respuesta a preguntas abiertas: el prompt de ejemplo es una pregunta hipotética de elección, no una tarea de clasificación.
- Herencia de capacidades del modelo base Qwen2.5-1.5B-Instruct: se espera generación de código, matemáticas básicas y multilingüismo, aunque no se verifica en la model card.
- Tool calling / function calling: no documentado para este ajuste; el modelo base Qwen2.5-Instruct lo soporta, pero no hay confirmación de que se haya preservado tras el SFT.
- Capacidades de agente y razonamiento multi-paso: no documentadas.
- Clasificación de sentimiento: el nombre del modelo lo sugiere, pero la model card no describe la tarea, el formato de salida ni las etiquetas; no debe asumirse que funciona como clasificador sin evaluación empírica.
- Capacidades de visión o audio: no disponibles.

## Casos de uso

- Reproducción de pipelines de SFT con TRL: sirve como ejemplo de referencia para configurar un entrenamiento supervisado sobre Qwen2.5-1.5B-Instruct con las versiones de TRL, Transformers y PyTorch indicadas en la model card.
- Experimentación académica con ajuste fino de modelos pequeños: útil para comparar el efecto del SFT sobre un modelo de 1.500 millones de parámetros en tareas de generación.
- Generación de texto conversacional en prototipos: el snippet de la model card permite ejecutar el modelo con `transformers.pipeline` y `device_map="auto"` para pruebas rápidas en local.
- Base para un clasificador de sentimiento real: dado el nombre, un equipo podría partir de este checkpoint y añadir una cabeza de clasificación o un prompt con etiquetas fijas, evaluando previamente si el SFT preservó la capacidad instructiva.
- Evaluación de la degradación por sobreajuste: al no documentarse el dataset, el modelo puede emplearse como caso de estudio de cómo un SFT sin control de datos afecta a las capacidades del modelo base.
- Despliegue en entornos con recursos limitados: al tener ~1.500 millones de parámetros, cabe en GPUs de consumo medio si se cuantiza, aunque no se publican versiones cuantizadas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en precisión completa (fp16/bf16): ~3 GB para los pesos de un modelo de 1.500 millones de parámetros, más overhead de activaciones y KV cache.
- VRAM estimada en cuantización de 8 bits: ~1,6 GB de pesos; en 4 bits: ~0,9 GB de pesos (estimaciones a partir del tamaño, no verificadas con este checkpoint).
- GPU recomendadas: cualquier GPU con al menos 8 GB de VRAM para fp16 con contexto moderado; A100, H100, L40S o RTX 4090 para mayor throughput y contextos largos.
- Compatibilidad con GPU de consumo: sí, cabe en RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070, RTX 4080 y RTX 4090 en fp16; en 4 bits podría ejecutarse en GPUs de 6-8 GB.
- Opciones de despliegue: transformers (pipeline), vLLM, TGI y llama.cpp/Ollama si se generan pesos GGUF (no publicados en el repositorio).
- Latencia y throughput: no disponibles; no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Chirag080/sentiment-classifier | ~1.500 M | no disponible (base: 32.768) | no disponible | Hugging Face, safetensors | Ajuste SFT sin documentación ni benchmarks |
| Qwen/Qwen2.5-1.5B-Instruct | ~1.500 M | 32.768 tokens | Apache 2.0 (modelo base) | Hugging Face, amplia adopción | Modelo instructivo original, con benchmarks publicados |
| Qwen/Qwen2.5-0.5B-Instruct | ~500 M | 32.768 tokens | Apache 2.0 | Hugging Face | Alternativa más ligera para entornos con poca VRAM |
| meta-llama/Llama-3.2-1B-Instruct | ~1.200 M | 128.000 tokens | Llama 3.2 Community License | Hugging Face, gated | Alternativa de tamaño similar con contexto mayor |

## Limitaciones y advertencias

- Discrepancia entre nombre y función: el modelo se llama "sentiment-classifier" pero la model card describe generación de texto; no hay evidencia de que realice clasificación de sentimiento.
- Ausencia de licencia utilizable: la model card incluye "licence: license" sin especificar términos; no se puede asumir uso comercial permitido. El modelo base Qwen2.5-1.5B-Instruct es Apache 2.0, pero la licencia del ajuste no está declarada.
- Sin datos de entrenamiento: se desconoce el dataset, el número de tokens y la composición, lo que impide evaluar sesgos y riesgo de sobreajuste.
- Sin benchmarks: no hay métricas que permitan comparar su rendimiento con el modelo base ni con alternativas.
- Riesgo de alucinación: inherente a los modelos generativos de 1.500 millones de parámetros; sin evaluación, el riesgo es desconocido.
- Idiomas no declarados: aunque el modelo base es multilingüe, el SFT podría haber degradado idiomas no presentes en el dataset de entrenamiento.
- Cero descargas y cero likes: no hay validación por parte de la comunidad ni informes de uso en producción.
- Contexto no confirmado: la ventana de 32.768 tokens corresponde al modelo base; el ajuste podría haberla reducido o no haber sido entrenado para contextos largos.
- Repositorio de 0,0 GB: conviene verificar que los pesos estén efectivamente subidos antes de intentar la descarga.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Chirag080/sentiment-classifier
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-1.5B-Instruct
- Repositorio de TRL: https://github.com/huggingface/trl
- Documentación de TRL (SFTTrainer): https://huggingface.co/docs/trl/sft_trainer
- Documentación de Transformers (pipeline de generación de texto): https://huggingface.co/docs/transformers/main_classes/pipelines#transformers.TextGenerationPipeline
