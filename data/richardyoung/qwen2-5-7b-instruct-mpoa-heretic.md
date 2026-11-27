# richardyoung/Qwen2.5-7B-Instruct-MPOA-heretic

## Resumen

Qwen2.5-7B-Instruct-MPOA-heretic es un ajuste fino (fine-tune) del modelo Qwen2.5-7B-Instruct de Alibaba, publicado por el usuario richardyoung en Hugging Face. La variante "heretic" se enmarca en la familia de técnicas conocidas como "abliteration" o "decensoring", orientadas a reducir los rechazos y filtros de seguridad del modelo original para producir respuestas sin las restricciones típicas de alineamiento. El modelo conserva la arquitectura transformer densa y el tamaño del Qwen2.5-7B-Instruct base, con aproximadamente 7.615 millones de parámetros.

La relevancia de esta ficha es doble: por un lado, documenta una de las muchas variantes comunitarias que modifican el comportamiento de seguridad de modelos abiertos; por otro, sirve para advertir de las implicaciones técnicas y legales de usar modelos "abliterated" en producción. El modelo está etiquetado con licencia apache-2.0, pero el acceso está restringido (gated) en Hugging Face y requiere aceptar condiciones.

La información publicada por el autor es escasa: no se detallan los datos de entrenamiento del ajuste, el número de tokens utilizados ni los benchmarks. Las etiquetas incluyen referencias a tres papers (arxiv:2309.00071, arxiv:2407.10671 y arxiv:2611.17846), pero no se especifica su relación exacta con el proceso de entrenamiento. El modelo está orientado a generación de texto conversacional en inglés.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso (familia Qwen2) |
| Parametros totales | 7.615.616.512 |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada (el base Qwen2.5-7B-Instruct soporta 32.768 tokens, pero no se confirma para este fine-tune) |
| Tipos de cuantizacion | No disponible en la informacion proporcionada (formato safetensors en FP16/BF16; cuantizaciones GGUF/AWQ no listadas) |
| Idiomas soportados | Ingles (etiqueta `en`) |
| Licencia | Apache 2.0 (segun metadatos), con acceso restringido en Hugging Face |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de Qwen2.5-7B-Instruct, un transformer decoder-only denso con atención por ventanas deslizantes y RoPE, entrenado por Alibaba con un corpus multilingüe y posteriormente alineado mediante SFT y preferencias. Sobre esa base, richardyoung aplica un ajuste fino orientado a "decensoring" (técnica MPOA/heretic), que típicamente modifica un subconjunto de pesos asociados a la dirección de rechazo para reducir la tasa de respuestas negativas ante peticiones sensibles.

No se dispone de información sobre el volumen de datos de entrenamiento, la composición del dataset, el uso de RLHF/DPO adicional ni hiperparámetros del ajuste. Las etiquetas del repositorio mencionan tres identificadores arXiv, pero no se describe su papel concreto. Tampoco se documentan innovaciones técnicas adicionales (decodificación especulativa, atención lineal, etc.) más allá de las heredadas del modelo base.

## Capacidades

- Generación de texto conversacional multi-turno en inglés.
- Razonamiento general y respuesta a instrucciones, heredado del Qwen2.5-7B-Instruct base.
- Generación de código y matemáticas a nivel del modelo base (no verificado en esta variante).
- Reducción de rechazos y filtros de seguridad respecto al modelo original (comportamiento "uncensored"/"abliterated").
- Soporte de tool calling / function calling: no confirmado explícitamente para este fine-tune.
- Capacidades de agente y razonamiento multi-paso: no confirmadas explícitamente.
- Capacidades multilingües: limitadas al inglés según los metadatos.
- Modo "thinking", visión o audio: no disponibles.

## Casos de uso

- Investigación sobre alineamiento y seguridad: permite estudiar cómo varía la tasa de rechazo y la calidad de respuesta tras aplicar técnicas de abliteration sobre un modelo alineado, comparando con el Qwen2.5-7B-Instruct original.
- Generación creativa sin restricciones de contenido: escritura de ficción, guiones o narrativa con temáticas que el modelo base rechazaría, en entornos controlados y con revisión humana.
- Evaluación de robustez de filtros: uso como contraparte en pruebas de red teaming para medir la eficacia de clasificadores de seguridad desplegados en producción.
- Prototipado de asistentes conversacionales en inglés: gracias a su tamaño de 7B, puede desplegarse en una sola GPU para iterar rápidamente sobre prompts y flujos de diálogo.
- Análisis de sesgos y comportamiento: estudio comparativo de respuestas entre el modelo base y la variante heretic para documentar diferencias de tono, contenido y utilidad.
- Fine-tuning posterior en dominios específicos: al ser un modelo de 7B con licencia Apache 2.0, sirve como punto de partida para ajustes en nichos donde se requiera menor tasa de rechazos (siempre con salvaguardas externas).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16/BF16: aproximadamente 15-16 GB (7.6B parámetros × 2 bytes + overhead).
- VRAM estimada en cuantización 8 bits: ~8-9 GB; en 4 bits: ~5-6 GB (estimaciones estándar para un modelo de 7B, no verificadas para esta variante).
- GPU recomendadas: A100 40GB, H100, L40S para FP16 con contexto largo; RTX 4090 (24 GB) suficiente para FP16 en contexto moderado.
- Cabe en GPU de consumo: sí, en RTX 3090/4090 (24 GB) en FP16, y en GPUs de 8-12 GB con cuantización 4/8 bits.
- Opciones de despliegue: transformers, Text Generation Inference (TGI, etiqueta `text-generation-inference`), vLLM, llama.cpp/Ollama (previa conversión a GGUF, no publicada en el repo).
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Acceso | Notas |
|---|---|---|---|---|---|
| richardyoung/Qwen2.5-7B-Instruct-MPOA-heretic | 7.6B | No disponible | Apache 2.0 | Gated | Fine-tune abliterated del Qwen2.5-7B-Instruct |
| Qwen/Qwen2.5-7B-Instruct | 7.6B | 32.768 tokens | Apache 2.0 | Abierto | Modelo base alineado, con filtros de seguridad |
| Otras variantes "abliterated" de Qwen2.5-7B | ~7.6B | Variable | Apache 2.0 | Variable | Múltiples autores comunitarios; comportamiento similar |
| Mistral-7B-Instruct-v0.3 | 7.2B | 32.768 tokens | Apache 2.0 | Abierto | Alternativa de tamaño similar, alineada |

No se dispone de datos de rendimiento comparativo para esta variante concreta.

## Limitaciones y advertencias

- Modelo "abliterated"/"uncensored": la reducción de filtros de seguridad implica mayor probabilidad de generar contenido dañino, ofensivo o ilegal; no apto para uso directo en producción sin salvaguardas externas.
- Riesgo elevado de alucinación, similar o superior al del modelo base al haberse modificado pesos de alineamiento.
- Idiomas: solo inglés declarado; el rendimiento en castellano no está garantizado.
- Contexto: no se confirma la longitud de contexto del fine-tune; asumir la del base (32K) puede ser arriesgado.
- Licencia: aunque los metadatos indican Apache 2.0, el acceso está restringido (gated) y requiere aceptar condiciones; verificar los términos antes de uso comercial.
- Procedencia y reproducibilidad: el autor declara "reproducible" en las etiquetas, pero no se documenta el proceso de entrenamiento, los datos ni las evaluaciones.
- Sin benchmarks publicados: no hay evidencia cuantitativa de que conserve las capacidades del modelo base tras el ajuste.
- Uso responsable: recomendable únicamente en entornos de investigación, con revisión humana y sistemas de moderación adicionales.

## Enlaces

- Hugging Face: https://huggingface.co/richardyoung/Qwen2.5-7B-Instruct-MPOA-heretic
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-7B-Instruct
- Paper referenciado (etiqueta): https://arxiv.org/abs/2309.00071
- Paper referenciado (etiqueta): https://arxiv.org/abs/2407.10671
- Paper referenciado (etiqueta): https://arxiv.org/abs/2611.17846 (identificador no verificable)
