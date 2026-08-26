# AlinaKl/ljb-llama3.1-8b-syntax-mix

## Resumen

El modelo `AlinaKl/ljb-llama3.1-8b-syntax-mix` es un adaptador LoRA (rank 16, alpha 32) aplicado sobre el modelo base `meta-llama/Llama-3.1-8B`, desarrollado por AlinaKl como parte de la investigación recogida en el artículo "Mood Matters: How Syntactic Sensitivity Undermines Safety Alignment" (2026). El objetivo del trabajo es estudiar cómo la variación sintáctica en los prompts afecta al alineamiento de seguridad de los modelos de lenguaje, y proponer un ajuste que mitigue el fenómeno de over-refusal (rechazo excesivo de solicitudes legítimas).

El adaptador se entrenó durante una época mediante fine-tuning supervisado (SFT) sobre una muestra estratificada del 10% del dataset Tulu-SFT-Mix. La proporción original de ejemplos de seguridad frente a no seguridad (10:90) se redujo a 1:99, y los ejemplos de seguridad se parafrasearon sintéticamente para cubrir diversas formas sintácticas. El resultado es un modelo que, manteniendo las capacidades generales de Llama 3.1 8B, presenta un comportamiento de seguridad menos sensible a la formulación sintáctica de las peticiones.

El repositorio contiene los pesos completos del modelo fusionado (8.030 millones de parámetros, 16.1 GB en safetensors), lo que permite su uso directo con las herramientas habituales de inferencia para modelos Llama. No se especifican licencia, idiomas soportados ni longitud de contexto en la documentación proporcionada, aunque al derivar de Llama 3.1 8B es razonable esperar un contexto de 128k tokens y soporte multilingüe, sin que estos datos estén confirmados para este adaptador concreto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (basada en Llama 3.1 8B) |
| Parametros totales | 8.030.261.248 (modelo base con LoRA aplicado) |
| Parametros activos | no disponible (adaptador LoRA, no es MoE) |
| Longitud de contexto | no disponible (heredada del modelo base, no confirmada) |
| Tipos de cuantizacion | no disponible (pesos en safetensors, cuantizables a posteriori) |
| Idiomas soportados | no disponible (el modelo base es multilingue, no confirmado para este adaptador) |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de la arquitectura estándar de Llama 3.1 8B: un transformer decoder-only con atención multi-cabeza, normalización RMSNorm, y activación SwiGLU. Sobre esta base se aplica un adaptador LoRA de rango 16 y alpha 32, que modifica únicamente las matrices de proyección de atención y feed-forward durante el entrenamiento, manteniendo congelados los pesos del modelo base.

El entrenamiento se realizó con fine-tuning supervisado (SFT) durante una única época sobre una muestra estratificada del 10% del dataset Tulu-SFT-Mix. La proporción original de ejemplos de seguridad frente a no seguridad (10:90) se redujo a 1:99 para mitigar el over-refusal. Los ejemplos de seguridad seleccionados se parafrasearon sintéticamente con el fin de cubrir una amplia variedad de estructuras sintácticas, lo que permite evaluar la sensibilidad del modelo a la formulación de los prompts. No se emplearon técnicas de RLHF ni DPO; el ajuste es exclusivamente supervisado.

## Capacidades

- Generación de texto y razonamiento: al heredar las capacidades de Llama 3.1 8B, el modelo puede realizar tareas generales de generación de lenguaje, aunque no se han publicado evaluaciones específicas para este adaptador.
- Alineamiento de seguridad: el modelo está diseñado para reducir el over-refusal, mostrando una menor tendencia a rechazar solicitudes legítimas cuando la formulación sintáctica varía.
- Robustez sintáctica: el entrenamiento con parafraseos sintéticos busca que las respuestas de seguridad sean consistentes independientemente de la estructura gramatical del prompt.
- Capacidades multilingües: no confirmadas para este adaptador, aunque el modelo base Llama 3.1 8B es multilingüe.
- Tool calling y funciones de agente: no documentadas; no se puede afirmar su soporte sin evidencia.
- Modo de razonamiento extendido: no disponible.

## Casos de uso

- Investigación en alineamiento de seguridad: el modelo permite estudiar cómo la variación sintáctica afecta a las decisiones de seguridad de un LLM, comparando sus respuestas frente a prompts con distintas estructuras gramaticales.
- Evaluación de over-refusal: puede utilizarse como herramienta de análisis para medir la frecuencia de rechazos injustificados en solicitudes legítimas, especialmente en dominios sensibles como salud, finanzas o educación.
- Generación de datasets de entrenamiento: sus respuestas pueden servir como base para crear ejemplos etiquetados que ayuden a entrenar otros modelos con comportamientos de seguridad más robustos.
- Benchmarking de robustez sintáctica: permite comparar la sensibilidad de distintos modelos ante parafraseos de prompts maliciosos o ambiguos, aportando métricas para la investigación en seguridad.
- Fine-tuning adicional: al ser un adaptador LoRA, puede integrarse como punto de partida para ajustes posteriores en tareas específicas que requieran un equilibrio entre utilidad y seguridad.
- Análisis de comportamiento en producción: aunque no está pensado para despliegue directo, puede usarse en entornos controlados para probar políticas de moderación de contenido antes de implementarlas en modelos de mayor escala.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El artículo asociado (arXiv:2608.05409) podría contener evaluaciones, pero no se han proporcionado datos numéricos en la documentación del repositorio.

## Requisitos de hardware

- VRAM estimada para inferencia: al tratarse de un modelo de 8B parámetros, en FP16 requiere aproximadamente 16 GB de VRAM; en cuantización int8 unos 8 GB, y en int4 unos 4 GB. Estas cifras son estimaciones basadas en el tamaño del modelo y no han sido confirmadas por el autor.
- GPU recomendadas: tarjetas con al menos 16 GB de VRAM para FP16 (p. ej., RTX 4090, A100 40GB, H100). Con cuantización int4 puede ejecutarse en GPUs de 8 GB (p. ej., RTX 3070, RTX 4060).
- Compatibilidad con consumer GPU: sí, especialmente con cuantización int4 o int8, aunque la latencia dependerá de la memoria disponible.
- Opciones de despliegue: al ser un modelo basado en Llama, es compatible con vLLM, llama.cpp, Ollama, TGI y otras herramientas estándar. No se ha verificado su funcionamiento en todas ellas, pero la arquitectura lo permite.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la misma categoría (fine-tunings de seguridad sobre Llama 3.1 8B). El modelo base `meta-llama/Llama-3.1-8B` es el punto de referencia natural, pero no se han publicado comparativas directas. Por tanto, la comparativa no está disponible.

## Limitaciones y advertencias

- Sesgos conocidos: al derivar de Llama 3.1 8B, el modelo puede heredar sesgos presentes en los datos de entrenamiento del modelo base, aunque no se han evaluado específicamente.
- Riesgo de alucinación: no se ha evaluado la fiabilidad factual del modelo; como cualquier LLM, puede generar información incorrecta o inventada.
- Limitaciones de contexto e idioma: no se ha confirmado la longitud de contexto efectiva ni el rendimiento en idiomas distintos del inglés; el entrenamiento se realizó sobre Tulu-SFT-Mix, predominantemente en inglés.
- Restricciones de licencia: la licencia del adaptador no está especificada; el modelo base Llama 3.1 8B tiene su propia licencia de Meta que debe respetarse en cualquier uso comercial o de investigación.
- Adecuación para producción: es un modelo de investigación, no diseñado para despliegue en entornos productivos sin una evaluación exhaustiva de su comportamiento en tareas reales.
- Over-refusal mitigado pero no eliminado: la reducción de la proporción de ejemplos de seguridad puede haber disminuido la tendencia a rechazar, pero no garantiza un equilibrio óptimo entre utilidad y seguridad en todos los escenarios.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/AlinaKl/ljb-llama3.1-8b-syntax-mix
- Artículo arXiv: https://arxiv.org/abs/2608.05409
- Modelo base: https://huggingface.co/meta-llama/Llama-3.1-8B
