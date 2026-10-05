# KexuanShi/sft_gemma2_2b_layerdrop_p010

## Resumen

`KexuanShi/sft_gemma2_2b_layerdrop_p010` es un ajuste fino supervisado (SFT) del modelo Gemma 2 2B, publicado por el usuario KexuanShi en HuggingFace. Se trata de un checkpoint derivado, no de un modelo entrenado desde cero: los 2.614.341.888 parámetros del repositorio coinciden con el recuento del Gemma 2 2B original, y el repositorio pesa 5,3 GB en safetensors, lo que corresponde a pesos en precisión de 16 bits.

El modelo se ha entrenado con la librería TRL de HuggingFace mediante la técnica SFT, con el objetivo declarado en la model card de generar texto conversacional. El identificador incluye el sufijo `layerdrop_p010`, que apunta a la aplicación de LayerDrop con probabilidad 0,10 durante el entrenamiento como regularización, aunque la model card no documenta esta configuración ni confirma la hipótesis. El checkpoint es de carácter experimental: acumula 0 descargas y 0 «me gusta» en el momento de la consulta, y su model card está generada automáticamente por la plantilla de TRL, sin secciones de datos, hiperparámetros o evaluación completadas.

Su relevancia es limitada como modelo de producción, pero resulta útil como referencia para quien investigue técnicas de regularización estructural (LayerDrop) aplicadas a modelos pequeños en tareas de ajuste conversacional, así como para reproducir experimentos de SFT sobre la familia Gemma 2 con TRL.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (arquitectura Gemma 2). Detalle de capas no documentado en la model card |
| Parametros totales | 2.614.341.888 (2,61 B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No documentado para este checkpoint. El modelo base Gemma 2 2B declara 8.192 tokens |
| Tipos de cuantizacion | No documentado. Compatible en la practica con cuantizacion de 16 bits, 8 bits (bitsandbytes) y 4 bits (bitsandbytes, GPTQ/AWQ tras conversion) |
| Idiomas soportados | No disponible |
| Licencia | No disponible (la model card incluye un campo `licence: license` sin contenido) |
| Formato de pesos | safetensors (repositorio de 5,3 GB) |

## Arquitectura y entrenamiento

El checkpoint hereda la arquitectura del modelo base Gemma 2 2B: un transformer decoder-only con atención por ventana deslizante combinada con capas de atención global, Grouped-Query Attention y mecanismos de suavizado de logits y de atención (soft-capping). No se dispone de la configuración exacta de capas, dimensiones ocultas ni número de cabezas en la información proporcionada, más allá del recuento total de parámetros.

El procedimiento de entrenamiento documentado es exclusivamente SFT mediante TRL 1.13.0, Transformers 5.17.0, PyTorch 2.13.0, Datasets 5.0.1 y Tokenizers 0.23.2. La model card no especifica el dataset utilizado, el número de tokens de entrenamiento, la composición de los datos, la presencia de fases de RLHF o DPO, ni los hiperparámetros (tasa de aprendizaje, épocas, tamaño de lote). Tampoco se documenta el campo «modelo base», que aparece como `None` en la plantilla generada automáticamente. El único detalle técnico inferible del nombre es la posible aplicación de LayerDrop con probabilidad 0,10, técnica de regularización que desactiva aleatoriamente capas completas durante el entrenamiento para mejorar la robustez y permitir poda posterior.

## Capacidades

- Generación de texto conversacional: el pipeline declarado es `text-generation` y la model card incluye un ejemplo de respuesta a una pregunta abierta de tipo hipotético y reflexivo.
- Conversación multi-turno con formato de roles (`{"role": "user", "content": ...}`), según el ejemplo de uso rápido de la model card.
- Razonamiento y conocimiento general: capacidades heredadas del modelo base Gemma 2 2B, no verificadas para este checkpoint concreto.
- Capacidades multilingües: no disponibles (Gemma 2 2B está entrenado mayoritariamente en inglés, pero no se documenta el perfil lingüístico de este ajuste).
- Tool calling / function calling: no documentado.
- Uso como agente y razonamiento multi-paso: no documentado.
- Modo de razonamiento explícito (thinking), visión o audio: no soportados según la información disponible.

## Casos de uso

- Reproducción de experimentos de SFT: sirve como punto de partida para comparar el efecto de LayerDrop (p = 0,10) frente a un ajuste equivalente sin regularización estructural sobre Gemma 2 2B, siempre que se reconstruya el dataset de entrenamiento, que no está documentado.
- Docencia y formación en ajuste fino: el pipeline de ejemplo de la model card permite desplegar el modelo con `transformers.pipeline` con pocas líneas de código, lo que resulta adecuado para talleres sobre SFT con TRL.
- Prototipado de asistentes conversacionales en local: con un peso de 5,3 GB en 16 bits, el modelo cabe en GPUs de consumo y permite iterar sobre prompts y formatos de chat sin coste de API.
- Generación de texto creativo y respuestas abiertas: el ejemplo incluido en la model card (elección de viaje en el tiempo) ilustra su uso para preguntas hipotéticas y de opinión, un escenario de bajo riesgo donde la veracidad factual no es crítica.
- Base para ajustes posteriores (continued pretraining o DPO): al ser un checkpoint intermedio ya adaptado al formato conversacional, puede servir como inicialización para fases adicionales de alineamiento.
- Evaluación de robustez ante poda de capas: si se confirma el entrenamiento con LayerDrop, es un candidato natural para estudiar la degradación de calidad al eliminar capas en inferencia, con el objetivo de reducir latencia en dispositivos limitados.
- Investigación sobre sesgos y calidad en modelos pequeños: útil para auditar el comportamiento de un SFT no alineado explícitamente y compararlo con las versiones instruct oficiales de Gemma 2.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card del repositorio no incluye ninguna sección de evaluación, y no se dispone de cifras de MMLU, HumanEval, GSM8K ni de métricas de pérdida de validación para este checkpoint. Tampoco se aportan comparaciones con el modelo base Gemma 2 2B ni con su variante instruct oficial, por lo que no es posible cuantificar el efecto del ajuste SFT ni el impacto de LayerDrop sobre la calidad final.

## Requisitos de hardware

- VRAM estimada para inferencia en 16 bits: aproximadamente 5,3 GB solo para pesos, más el coste de activaciones y caché KV. En la practica se recomienda reservar entre 7 y 9 GB para contexto moderado.
- VRAM estimada en 8 bits: aproximadamente 2,7 GB de pesos; en torno a 4-5 GB de uso efectivo con overhead.
- VRAM estimada en 4 bits: aproximadamente 1,5 GB de pesos; en torno a 2,5-3,5 GB de uso efectivo, lo que permite ejecución en GPUs de 6 GB.
- GPUs recomendadas para servicio: NVIDIA A100, H100, L40S o similares con 24 GB o más si se busca alto throughput con lotes grandes.
- GPUs de consumo compatibles: RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070, RTX 4080 y RTX 4090 en 16 bits; RTX 3060 6-8 GB, RTX 2060 y similares solo con cuantización de 4 bits.
- Apple Silicon: ejecutable en equipos con 16 GB de memoria unificada o más mediante llama.cpp u Ollama, previa conversión a GGUF.
- Opciones de despliegue: HuggingFace Transformers (probado implícitamente por el pipeline de la model card), text-generation-inference (el repositorio incluye la etiqueta `text-generation-inference` y `endpoints_compatible`, por lo que es compatible con Inference Endpoints), vLLM, SGLang y llama.cpp/Ollama tras conversión a GGUF. También es compatible con la librería TRL para reentrenamiento.
- Latencia y throughput estimados: no disponibles. No se han publicado mediciones de tokens por segundo ni de tiempo hasta el primer token.

## Comparativa con modelos similares

Los datos de la siguiente tabla corresponden a las especificaciones publicadas por cada desarrollador para los modelos de referencia; conviene verificarlos en las fuentes oficiales antes de tomar decisiones de producción. Este checkpoint en concreto no dispone de licencia ni de idiomas declarados.

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| KexuanShi/sft_gemma2_2b_layerdrop_p010 | 2,61 B | No documentado (base: 8.192) | No disponible | HuggingFace, 0 descargas |
| Gemma 2 2B (base e instruct) | 2,61 B | 8.192 tokens | Gemma Terms of Use | HuggingFace, ampliamente utilizado |
| Llama 3.2 3B Instruct | 3,21 B | 128.000 tokens | Llama 3.2 Community License | HuggingFace, ampliamente utilizado |
| Qwen2.5 3B Instruct | 3,09 B | 32.768 tokens (ampliable con YaRN) | Apache 2.0 | HuggingFace, ampliamente utilizado |
| SmolLM2 1.7B Instruct | 1,71 B | 8.192 tokens | Apache 2.0 | HuggingFace, ampliamente utilizado |

## Limitaciones y advertencias

- Ausencia total de evaluación: no hay métricas de calidad, pérdida de validación ni comparación con el modelo base, por lo que no es posible afirmar si el ajuste SFT mejora o degrada el comportamiento original.
- Licencia no especificada: el campo `licence` de la model card está vacío y no se indica la licencia aplicable. Esto bloquea de facto cualquier uso comercial, ya que tampoco se puede confirmar el cumplimiento de los términos del modelo base Gemma.
- Modelo base no documentado: la plantilla referencia `None` como modelo de partida, de modo que la procedencia exacta del checkpoint no está declarada formalmente.
- Dataset de entrenamiento desconocido: sin información sobre la composición de los datos, no se puede evaluar el riesgo de sesgos, de contaminación de benchmarks ni de sobreajuste a un dominio concreto.
- Riesgo de alucinación: al ser un modelo de 2,6 B sin alineamiento documentado, es esperable una tasa de afirmaciones incorrectas superior a la de modelos mayores; no se han publicado mediciones de veracidad.
- Riesgo de salida dañina o no filtrada: no se documenta ninguna fase de RLHF, DPO ni moderación, por lo que el modelo puede producir contenido ofensivo, sesgado o inseguro sin las salvaguardas de las variantes instruct oficiales.
- Limitación de idioma: no se declaran idiomas soportados; el modelo base Gemma 2 está entrenado mayoritariamente en inglés, por lo que el rendimiento en castellano no está garantizado.
- Limitación de contexto: si el checkpoint hereda la ventana de 8.192 tokens de Gemma 2 2B, quedará por debajo de alternativas actuales con 32.000 o 128.000 tokens.
- Trazabilidad limitada: el repositorio no incluye pesos en GGUF, informes de evaluación ni scripts de entrenamiento; además, la fecha de creación registrada (2026-10-05) y la versión de Transformers indicada (5.17.0) no permiten auditar el proceso con facilidad.
- Efecto de LayerDrop no verificado: si se aplicó LayerDrop durante el entrenamiento, el comportamiento en inferencia con todas las capas activas podría diferir del observado en configuraciones podadas, y esto no está evaluado.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/KexuanShi/sft_gemma2_2b_layerdrop_p010
- Repositorio de TRL: https://github.com/huggingface/trl
- Paper de LayerDrop (Fan et al., 2019), técnica que sugiere el identificador del checkpoint: https://arxiv.org/abs/1909.11556
- Informe técnico de Gemma 2 (modelo base): https://arxiv.org/abs/2408.00118
- Documentación de Gemma 2 en Google AI: https://ai.google.dev/gemma/docs/core/model_card_2
- No se han encontrado papers, blogs, demos ni repositorios adicionales específicos de este checkpoint en la información disponible.
