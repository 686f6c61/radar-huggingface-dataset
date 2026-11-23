# richardyoung/Qwen2.5-7B-Instruct-SOM-heretic

## Resumen

Qwen2.5-7B-Instruct-SOM-heretic es un ajuste fino del modelo Qwen2.5-7B-Instruct desarrollado por Qwen (Alibaba Cloud) y modificado por el usuario richardyoung. La variante "heretic" hace referencia a una familia de técnicas de "abliteration" (eliminación de direcciones de rechazo en el espacio de activaciones) que buscan reducir los comportamientos de negativa del modelo, mientras que "SOM" probablemente indica un método de ajuste adicional sobre el modelo base. El resultado es un modelo de 7.6 mil millones de parámetros orientado a generación de texto conversacional sin los filtros habituales de rechazo.

El modelo hereda la arquitectura transformer decoder-only de Qwen2.5, con soporte de contexto largo (hasta 128K tokens en el modelo base, aunque no se confirma en esta ficha que se preserve tras el ajuste), y está pensado para usuarios que necesitan un asistente conversacional sin restricciones de contenido. Es relevante en el ecosistema open source porque representa una tendencia creciente de variantes "descensuradas" que, partiendo de modelos con licencia permisiva, ofrecen alternativas para investigación sobre alineación, seguridad y comportamiento de modelos.

La ficha se basa exclusivamente en la información disponible en Hugging Face; muchos detalles técnicos del proceso de ajuste (dataset, método exacto, hiperparámetros) no están documentados públicamente en la información proporcionada y se indican como "no disponible".

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2) |
| Parametros totales | 7.615.616.512 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en esta ficha (el modelo base Qwen2.5-7B-Instruct soporta hasta 128K tokens; no confirmado tras el ajuste) |
| Tipos de cuantizacion | no disponible (pesos en safetensors; se esperan GGUF/AWQ de la comunidad, no confirmados) |
| Idiomas soportados | en (inglés; el modelo base soporta multilingüe, pero la ficha solo declara inglés) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de Qwen2.5-7B-Instruct, un transformer decoder-only con 7.615.616.512 parámetros, atención con RoPE y mecanismos de atención estándar de la familia Qwen2. El modelo base fue preentrenado por Qwen con un corpus multilingüe de gran escala y posteriormente ajustado con instrucciones y RLHF/DPO; sin embargo, los detalles exactos de ese entrenamiento corresponden al modelo original y no se reproducen aquí.

Sobre esa base, richardyoung aplicó una modificación de tipo "heretic" (abliteration), que típicamente consiste en identificar direcciones en el espacio de activaciones asociadas a comportamientos de rechazo y eliminarlas o atenuarlas mediante edición de pesos, junto con un ajuste "SOM" cuyo método exacto no está documentado en la información disponible. No se especifican el número de tokens de ajuste, la composición del dataset, ni si hubo RLHF o DPO adicional. El repositorio tiene un tamaño de 15.2 GB y los pesos están en safetensors.

## Capacidades

- Generación de texto conversacional multi-turno en inglés.
- Razonamiento general y respuesta a instrucciones (heredadas del modelo base Qwen2.5-7B-Instruct).
- Generación de código y matemáticas (capacidades del modelo base, no verificadas tras el ajuste).
- Comportamiento "descensurado": reducción de rechazos ante peticiones que el modelo base rechazaría.
- Soporte de tool calling / function calling: no disponible (el modelo base lo soporta, pero no se confirma en esta variante).
- Soporte de agentes y razonamiento multi-paso: no disponible (no confirmado).
- Capacidades multilingües: la ficha solo declara inglés; el modelo base es multilingüe, pero no se garantiza tras el ajuste.
- Capacidades especiales (thinking mode, visión, audio): no disponible.

## Casos de uso

- Investigación sobre alineación y seguridad: el modelo permite estudiar cómo la abliteration afecta a las tasas de rechazo y a la calidad de las respuestas, comparándolo con el Qwen2.5-7B-Instruct original en experimentos controlados.
- Generación creativa sin restricciones: escritura de ficción, guiones o narrativa que requiera temáticas que el modelo base rechazaría, con la salvedad de revisión humana por posibles sesgos.
- Asistente conversacional en inglés para prototipos: despliegue en entornos de investigación donde se necesita un chatbot de 7B parámetros con contexto suficiente para conversaciones multi-turno.
- Evaluación de robustez de filtros: uso como caso de prueba para medir la eficacia de sistemas de moderación externos frente a modelos sin alineación de seguridad.
- Red teaming y pruebas de seguridad: generación de prompts y respuestas adversarias para entrenar clasificadores de contenido o validar políticas de uso.
- Fine-tuning posterior: al estar bajo licencia apache-2.0 y en safetensors, sirve como base para ajustes específicos de dominio en inglés, siempre que se acepten las condiciones de acceso restringido del repositorio.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16/BF16: aproximadamente 15.2 GB solo para pesos, más overhead de activaciones y KV cache (típicamente 1-3 GB adicionales según contexto).
- VRAM estimada en cuantización de 8 bits: ~8 GB; en 4 bits: ~4-5 GB (estimaciones para el tamaño de 7.6B parámetros; no confirmadas para esta variante).
- GPU recomendadas: A100 40/80 GB, H100, L40S para FP16; RTX 4090 (24 GB) para FP16 con contexto moderado; RTX 3090/4080 (16-24 GB) para 8 bits.
- Cabe en GPU de consumo: sí, en RTX 4090/3090 en FP16 con contexto limitado, y en GPUs de 8-12 GB con cuantización 4 bits.
- Opciones de despliegue: transformers, text-generation-inference (TGI, etiquetado en el repo), vLLM, llama.cpp/Ollama si existen conversiones GGUF de la comunidad (no confirmadas).
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| richardyoung/Qwen2.5-7B-Instruct-SOM-heretic | 7.6B | no disponible (base: 128K) | apache-2.0 | Variante abliterated, acceso restringido |
| Qwen/Qwen2.5-7B-Instruct | 7.6B | 128K | apache-2.0 | Modelo base alineado, acceso abierto |
| Meta-Llama-3.1-8B-Instruct | 8B | 128K | Llama 3.1 Community License | Alternativa alineada, licencia con restricciones |
| Mistral-7B-Instruct-v0.3 | 7.2B | 32K | Apache 2.0 | Alternativa abierta de tamaño similar |

## Limitaciones y advertencias

- El proceso de abliteration puede degradar capacidades del modelo base (razonamiento, coherencia, seguimiento de instrucciones); no hay benchmarks que cuantifiquen esa pérdida.
- Riesgo elevado de generar contenido dañino, ofensivo o inexacto al haberse reducido los mecanismos de rechazo; requiere moderación externa en producción.
- Sesgos heredados del corpus de entrenamiento de Qwen2.5, sin documentación de mitigación específica en esta variante.
- Riesgo de alucinación no evaluado en esta ficha.
- La ficha solo declara inglés; el rendimiento multilingüe del modelo base puede no preservarse.
- Acceso restringido (gated): es necesario aceptar condiciones en Hugging Face antes de descargar.
- Licencia apache-2.0 permite uso comercial, pero el usuario es responsable del cumplimiento legal y de las políticas de contenido aplicables.
- No se documentan el método "SOM" ni el dataset de ajuste, lo que dificulta la reproducibilidad.

## Enlaces

- Hugging Face: https://huggingface.co/richardyoung/Qwen2.5-7B-Instruct-SOM-heretic
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-7B-Instruct
- Paper Qwen2 (arXiv:2407.10671): https://arxiv.org/abs/2407.10671
- Paper referenciado (arXiv:2309.00071): https://arxiv.org/abs/2309.00071
