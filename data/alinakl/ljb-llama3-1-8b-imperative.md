# AlinaKl/ljb-llama3.1-8b-imperative

## Resumen

El modelo `AlinaKl/ljb-llama3.1-8b-imperative` es un adaptador LoRA (rank 16, alpha 32) entrenado sobre el modelo base `meta-llama/Llama-3.1-8B` mediante fine-tuning supervisado (SFT) durante una época. El entrenamiento se realizó sobre una muestra estratificada del 10% del dataset Tulu-SFT-Mix, en el que se redujo la proporción de ejemplos de seguridad del 10:90 original a 1:99 para mitigar el fenómeno de sobre-rechazo (over-refusal). Todos los ejemplos de seguridad utilizados provienen directamente del dataset original y están fuertemente sesgados hacia la forma sintáctica imperativa.

Este modelo corresponde a la ejecución **IMPERATIVE** del artículo académico *"Mood Matters: How Syntactic Sensitivity Undermines Safety Alignment"* (2026), disponible en arXiv. Su propósito no es ofrecer un asistente de producción, sino servir como herramienta de investigación para analizar cómo la forma sintáctica de las instrucciones afecta a la alineación de seguridad en modelos de lenguaje. El adaptador tiene 8.030.261.248 parámetros totales (el modelo base completo), aunque el adaptador LoRA en sí añade un número reducido de parámetros entrenables que no se especifica en la documentación.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder (Llama 3.1 8B) con adaptador LoRA (rank 16, alpha 32) |
| Parametros totales | 8.030.261.248 (modelo base completo) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (heredada de Llama 3.1, presumiblemente 128k, pero no confirmado) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (el modelo base soporta 8 idiomas, pero el adaptador no especifica) |
| Licencia | no disponible (el modelo base usa Llama 3.1 Community License, pero el adaptador no declara licencia) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un adaptador LoRA de bajo rango (rank 16, alpha 32) aplicado a todas las capas del transformer de Llama 3.1 8B. El entrenamiento se realizó con SFT (supervised fine-tuning) durante una única época sobre una muestra estratificada del 10% del dataset Tulu-SFT-Mix. La proporción de ejemplos de seguridad se redujo deliberadamente de 10:90 a 1:99 para estudiar el efecto del sobre-rechazo. Los ejemplos de seguridad seleccionados conservan su forma imperativa original, lo que introduce un sesgo sintáctico controlado.

La innovación técnica principal no reside en la arquitectura, sino en el diseño experimental: el estudio busca demostrar que la sensibilidad sintáctica (en este caso, el modo imperativo) puede socavar la alineación de seguridad. No se emplean técnicas como RLHF, DPO ni decodificación especulativa. El adaptador se publica como un artefacto de investigación, no como un modelo de propósito general.

## Capacidades

- Generación de texto y razonamiento: hereda las capacidades del modelo base Llama 3.1 8B, incluyendo comprensión de instrucciones, generación de código y razonamiento básico.
- Multilingüismo: el modelo base soporta 8 idiomas (inglés, alemán, francés, italiano, portugués, hindi, español y tailandés), pero no se ha verificado el comportamiento del adaptador en estos idiomas.
- Sensibilidad sintáctica: el modelo está específicamente entrenado para responder de forma diferente según la forma sintáctica (imperativa vs. no imperativa) de las instrucciones, lo que lo hace útil para estudiar sesgos de alineación.
- Sin soporte explícito de tool calling, function calling ni capacidades de agente: no se menciona en la documentación y no se ha entrenado para ello.
- Sin modo de pensamiento (thinking mode) ni capacidades multimodales: es un modelo de texto únicamente.

## Casos de uso

- Investigación en alineación de seguridad: el modelo permite estudiar cómo la formulación imperativa de instrucciones maliciosas o límite puede eludir los mecanismos de seguridad aprendidos durante el fine-tuning. Es adecuado para reproducir experimentos del artículo y validar hipótesis sobre sensibilidad sintáctica.
- Evaluación de robustez de modelos de lenguaje: puede usarse como banco de pruebas para medir la resistencia de otros modelos a variaciones sintácticas en prompts de seguridad, comparando tasas de rechazo entre formas imperativas y no imperativas.
- Análisis de sobre-rechazo (over-refusal): al haber reducido la proporción de datos de seguridad, el modelo permite investigar el equilibrio entre utilidad y seguridad, y cómo el exceso de datos de seguridad puede llevar a rechazos innecesarios.
- Desarrollo de técnicas de mitigación de sesgos: los resultados obtenidos con este modelo pueden informar el diseño de datasets de entrenamiento más equilibrados y de métodos de alineación menos sensibles a la forma superficial de las instrucciones.
- Reproducibilidad académica: al estar disponible públicamente con pesos safetensors, sirve como referencia para que otros investigadores repliquen los experimentos del paper y comparen sus propios adaptadores.
- Pruebas de estrés de sistemas de moderación de contenido: aunque no es un modelo de producción, puede utilizarse en entornos controlados para generar ejemplos adversarios que pongan a prueba filtros de contenido basados en reglas sintácticas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El artículo asociado (arXiv:2608.05409) podría contener evaluaciones, pero no se han proporcionado en la documentación del modelo ni en los resultados de búsqueda. No se dispone de datos de MMLU, HumanEval, GSM8K ni otras métricas estándar para este adaptador específico.

## Requisitos de hardware

- VRAM estimada para inferencia: al tratarse de un modelo de 8B parámetros, en FP16 requiere aproximadamente 16 GB de VRAM. Con cuantización int8 se reduce a unos 8 GB, y con int4 a unos 4-5 GB. Sin embargo, no se han publicado configuraciones de cuantización específicas para este adaptador.
- GPU recomendadas: para FP16, una NVIDIA RTX 3090, RTX 4090, A10 o A100 son adecuadas. Para cuantización int4, una RTX 3060 o similar podría ser suficiente.
- Compatibilidad con GPU de consumo: sí, es posible ejecutarlo en GPUs de consumo con al menos 8 GB de VRAM si se aplica cuantización, aunque el adaptador LoRA debe fusionarse con el modelo base antes de cuantizar.
- Opciones de despliegue: al ser un adaptador LoRA, primero hay que fusionarlo con el modelo base `meta-llama/Llama-3.1-8B`. Después puede servirse con vLLM, llama.cpp, Ollama o TGI. No se han publicado configuraciones optimizadas ni mediciones de latencia o throughput.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No se dispone de modelos comparables específicos para este adaptador, ya que es un artefacto de investigación con un objetivo muy concreto. Como referencia, se puede comparar con el modelo base Llama 3.1 8B y con otros adaptadores de seguridad, pero no hay datos públicos de rendimiento relativo.

| Modelo | Parametros | Contexto | Licencia | Uso previsto |
|---|---|---|---|---|
| AlinaKl/ljb-llama3.1-8b-imperative | 8B (LoRA) | no disponible | no disponible | Investigación en alineación |
| meta-llama/Llama-3.1-8B | 8B | 128k | Llama 3.1 Community | Modelo base general |
| meta-llama/Llama-3.1-8B-Instruct | 8B | 128k | Llama 3.1 Community | Asistente instructivo |

## Limitaciones y advertencias

- Modelo de investigación, no apto para uso en producción: su único propósito es estudiar la sensibilidad sintáctica en la alineación de seguridad.
- Sesgo hacia la forma imperativa: los datos de seguridad utilizados están fuertemente sesgados hacia instrucciones imperativas, lo que puede provocar respuestas inconsistentes ante formulaciones no imperativas de peticiones similares.
- Riesgo de alucinación y de respuestas inseguras: al reducir la proporción de datos de seguridad, el modelo puede mostrar comportamientos menos seguros que el modelo base en ciertos escenarios, especialmente con instrucciones imperativas.
- Licencia no declarada: aunque el modelo base usa la Llama 3.1 Community License, el adaptador no especifica su propia licencia. Se recomienda contactar con el autor antes de cualquier uso comercial.
- Sin soporte de herramientas ni agentes: no se ha entrenado para tool calling, function calling ni razonamiento multi-paso, por lo que no es adecuado para tareas que requieran estas capacidades.
- Documentación incompleta: no se proporcionan detalles sobre la longitud de contexto efectiva, idiomas soportados ni configuraciones de cuantización, lo que dificulta su despliegue en entornos controlados.

## Enlaces

- [HuggingFace - AlinaKl/ljb-llama3.1-8b-imperative](https://huggingface.co/AlinaKl/ljb-llama3.1-8b-imperative)
- [Artículo arXiv:2608.05409 - "Mood Matters: How Syntactic Sensitivity Undermines Safety Alignment"](https://arxiv.org/abs/2608.05409)
- [Dataset Tulu-SFT-Mix (allenai/tulu-3-sft-mixture)](https://huggingface.co/datasets/allenai/tulu-3-sft-mixture)
- [Modelo base meta-llama/Llama-3.1-8B](https://huggingface.co/meta-llama/Llama-3.1-8B)
