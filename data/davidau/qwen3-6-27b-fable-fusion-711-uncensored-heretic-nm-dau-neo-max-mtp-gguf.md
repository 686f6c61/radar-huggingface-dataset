# DavidAU/Qwen3.6-27B-Fable-Fusion-711-Uncensored-Heretic-NM-DAU-NEO-MAX-MTP-GGUF

## Resumen

Qwen3.6-27B-Fable-Fusion-711-Uncensored-Heretic-NM-DAU-NEO-MAX-MTP-GGUF es un fine-tune multi-etapa del modelo Qwen 3.6 de 27B de parámetros, desarrollado por DavidAU en colaboración con Nightmedia, TeichAI, armand0e y trohrbaugh. El modelo parte de una base Qwen 3.6 de 27B (26.895.998.464 parámetros reales según safetensors) y se distribuye exclusivamente en formato GGUF con múltiples niveles de cuantización, incluyendo variantes "MTP" (Multi-Token Prediction) y "Neo MAX Imatrix". El autor lo presenta como un fine-tune orientado a mejorar la inteligencia general, el seguimiento de instrucciones y el razonamiento, preservando las capacidades del modelo base.

La propuesta diferencial del autor es haber superado la barrera de 700 puntos en ARC-C tanto en cuantización de 8 bits como de 4 bits, un umbral que asocia con modelos cerrados de OpenAI, Claude y Gemini. Según la model card, el modelo supera al Qwen 3.6 27B base en 6 de 7 benchmarks y lo iguala en el séptimo, además de superar los 7 benchmarks del Qwen3.6-35B-A3B. Estas afirmaciones provienen exclusivamente del autor y no se han verificado de forma independiente en la información disponible.

El modelo incorpora modificaciones de tipo "heretic" y "abliterated" (eliminación de rechazos y censura), está entrenado con datasets propios (Polar-STRICT, F451-STRICT) y trazas ligeras de Claude Opus, GPT-5 (Polaris) y "Fable". Se distribuye bajo licencia Apache 2.0 y está etiquetado como pipeline image-text-to-text, lo que sugiere capacidades multimodales heredadas del base. Su orientación es "all use cases", con soporte declarado para razonamiento, código, escritura creativa y roleplay.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de Qwen 3.6 27B); detalles específicos no disponibles |
| Parametros totales | 26.895.998.464 (26,9B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF en múltiples niveles: cuantizaciones "regulares" y "MTP" (Multi-Token Prediction), Neo MAX Imatrix; se mencionan explícitamente 4 bits y 8 bits; resto de niveles no detallados |
| Idiomas soportados | ar, zh, en, fr, de, hi, id, it, ja, ko, pl, pt, ru, es, th, vi |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (repo de 465,1 GB con múltiples cuantizaciones); el modelo base se distribuye en bfloat16 |

## Arquitectura y entrenamiento

El modelo es un fine-tune multi-etapa y multi-merge sobre Qwen 3.6 27B. El proceso combina varios fine-tunes propios de DavidAU, un merge realizado por Nightmedia (con benchmarking en cada etapa), el dataset Polaris de TeichAI, trazas ligeras "Fable 5" de armand0e y el proceso de "heretic" aplicado por trohrbaugh. Adicionalmente se emplearon los datasets internos Polar-STRICT y F451-STRICT, junto con trazas ligeras de Claude Opus (razonamiento/thinking) y GPT-5 (Polaris, sin razonamiento).

El autor declara que el entrenamiento se guió por tres objetivos estrictos: aumentar la inteligencia general y la resolución de problemas, no modificar ni dañar el modelo base más allá de ese objetivo, y evitar el "benchmaxing". Se realizaron pruebas y benchmarks en cada etapa (fine-tunes, multi-stage y cada paso de merge) para controlar la calidad, con validación humana final mediante comparación lado a lado con el modelo original. La metodología se validó previamente en modelos Qwen 3.5 de 9B antes de aplicarse al 27B. No se especifican en la información disponible el número de tokens de entrenamiento, la composición exacta de los datasets ni si se emplearon RLHF o DPO.

La variante "MTP" (Multi-Token Prediction) aparece tanto en el nombre del modelo como en los tipos de cuantización, lo que sugiere soporte de decodificación multi-token, aunque no se detallan los parámetros técnicos de dicha implementación.

## Capacidades

- Generación de texto y razonamiento con modo "thinking" explícito (etiquetas thinking y reasoning en la model card).
- Resolución de problemas e instrucciones mejoradas respecto al base, según el autor.
- Generación de código (etiqueta coder).
- Escritura creativa, ficción, narrativa y roleplay en todos los géneros.
- Capacidades de visión: pipeline image-text-to-text y mención explícita de "Vision" en la model card.
- Multilingüismo en 16 idiomas: árabe, chino, inglés, francés, alemán, hindi, indonesio, italiano, japonés, coreano, polaco, portugués, ruso, español, tailandés y vietnamita.
- Modelo "uncensored" y "abliterated": rechazos reducidos o eliminados por diseño.
- Soporte de tool calling / function calling: no confirmado explícitamente en la información disponible.
- Soporte de agentes y razonamiento multi-paso: no confirmado explícitamente; el modo thinking y la mejora en resolución de problemas lo hacen plausible, pero no se documenta.

## Casos de uso

- Escritura creativa y narrativa larga: el modelo está entrenado con trazas de ficción y roleplay, y la model card incluye ejemplos de escritura con voz narrativa marcada; adecuado para generación de relatos, novelas por capítulos y diálogos de personajes con consistencia estilística.
- Roleplay y personajes conversacionales: la combinación de fine-tune creativo, ausencia de censura y contexto conversacional lo orienta a chatbots de personaje y simulación de diálogo multi-turno.
- Asistente generalista de propósito múltiple: al estar diseñado como "all use cases", sirve para tareas mixtas de redacción, análisis, explicación y resumen en un mismo despliegue.
- Razonamiento asistido con modo thinking: para problemas de lógica, planificación o análisis que requieran cadena de pensamiento explícita, activando el modo de razonamiento del modelo.
- Generación de código en local: la etiqueta coder y el tamaño de 27B permiten desplegarlo en estaciones de trabajo con GPU de gama alta para autocompletado, generación de scripts y revisión de código sin depender de APIs externas.
- Procesamiento multimodal imagen-texto: al heredar el pipeline image-text-to-text, puede emplearse para descripción de imágenes, extracción de información de capturas o documentos escaneados y preguntas sobre imágenes.
- Atención al cliente o soporte interno sin restricciones de contenido: útil en dominios donde los filtros del modelo base generan rechazos indebidos (por ejemplo, ficción adulta, seguridad ofensiva o análisis de contenido sensible), siempre con las salvaguardas adecuadas a nivel de aplicación.
- Experimentación e investigación en alineación: al ser un modelo "heretic/abliterated" con benchmarks declarados, sirve como caso de estudio de los efectos de eliminar el rechazo sobre el rendimiento y el comportamiento.

## Benchmarks y rendimiento

La model card afirma que el modelo supera al Qwen 3.6 27B base en 6 de 7 benchmarks y lo iguala en el séptimo, y que supera los 7 benchmarks del Qwen3.6-35B-A3B. También afirma haber superado 700 puntos en ARC-C tanto en 8 bits como en 4 bits (de ahí el "711" del nombre). Sin embargo, no se proporcionan en la información disponible las tablas numéricas con los resultados desglosados por benchmark (MMLU, HumanEval, GSM8K, ARC-C, etc.), por lo que no es posible presentar una tabla comparativa verificable.

No se han publicado resultados de benchmarks detallados en la información disponible. Las cifras citadas (700+ en ARC-C, superioridad en 6 de 7 benchmarks) son afirmaciones del autor no verificadas de forma independiente.

## Requisitos de hardware

- VRAM estimada para inferencia: para 27B parámetros, en cuantización Q4 se estiman aproximadamente 16-18 GB de VRAM; en Q8, en torno a 28-30 GB; en bfloat16, unos 54 GB. Estas estimaciones son cálculo estándar por tamaño y no proceden de la model card.
- GPU recomendadas: para Q4, una RTX 4090 (24 GB) o RTX 3090 (24 GB) es suficiente; para Q8 se requiere una A100 40 GB, A6000 48 GB o similar; para bfloat16, A100 80 GB o H100.
- Cabe en GPU de consumo: sí, en cuantizaciones Q4 y Q5 en GPUs de 24 GB; las cuantizaciones más bajas (Q2, Q3) caben en GPUs de 12-16 GB con degradación de calidad.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio y servidores compatibles con GGUF; el tag endpoints_compatible sugiere compatibilidad con endpoints de Hugging Face. vLLM y TGI no se mencionan explícitamente para esta variante GGUF.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Qwen3.6-27B-Fable-Fusion-711 (este) | 26,9B | no disponible | Apache 2.0 | GGUF | Fine-tune multi-etapa, uncensored, vision |
| Qwen 3.6 27B (base) | 27B aprox. | no disponible | no disponible en la información | bfloat16 / safetensors | Modelo original de Team Qwen; el autor afirma superarlo en 6 de 7 benchmarks |
| Qwen3.6-35B-A3B | 35B (A3B, MoE) | no disponible | no disponible en la información | no disponible | Según el autor, este fine-tune supera sus 7 benchmarks |
| Qwen3.5-9B-The-Defiant-Fable (DavidAU) | 9B | no disponible | no disponible en la información | GGUF | Fine-tune del mismo autor con metodología similar; el autor lo sitúa por debajo del 711 |

La información disponible no incluye datos de contexto ni benchmarks numéricos de los modelos comparados, por lo que la comparación se limita a parámetros, licencia y las afirmaciones del autor.

## Limitaciones y advertencias

- Modelo "uncensored" y "abliterated": los filtros de seguridad y rechazos han sido reducidos o eliminados por diseño; puede generar contenido ofensivo, ilegal o dañino sin advertencia. Requiere salvaguardas externas en producción.
- Riesgo de alucinación: no se documentan evaluaciones de factualidad; los fine-tunes orientados a creatividad y razonamiento pueden aumentar la confianza en afirmaciones incorrectas.
- Benchmarks no verificados: las cifras de ARC-C y la superioridad sobre el base son afirmaciones del autor; no se aportan tablas numéricas completas ni replicaciones independientes en la información disponible.
- Longitud de contexto no documentada: no se especifica la ventana de contexto efectiva, lo que dificulta planificar casos de uso con documentos largos.
- Idiomas: aunque se listan 16 idiomas, no se detalla el rendimiento por idioma; el entrenamiento parece centrado en inglés.
- Licencia Apache 2.0: permite uso comercial, pero el modelo base Qwen 3.6 puede tener condiciones adicionales no reflejadas en la información disponible; conviene revisar la licencia del base.
- Tamaño del repo: 465,1 GB con múltiples cuantizaciones; la descarga completa es costosa en almacenamiento.
- Formato exclusivamente GGUF en este repo: no se ofrecen pesos en safetensors para fine-tuning adicional en este repositorio.
- Modelo de la comunidad: no es un lanzamiento oficial de Team Qwen; el soporte y las actualizaciones dependen de DavidAU.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/DavidAU/Qwen3.6-27B-Fable-Fusion-711-Uncensored-Heretic-NM-DAU-NEO-MAX-MTP-GGUF
- Modelo base (no GGUF): https://huggingface.co/DavidAU/Qwen3.6-27B-Fable-Fusion-711-Uncensored-Heretic-NM-DAU-MTP
- Perfil del autor: https://huggingface.co/DavidAU
- Colecciones del autor: https://huggingface.co/DavidAU/collections
- FAQs y soporte: https://huggingface.co/DavidAU/support
- Versión 40B Eleanor-DECKARD: https://huggingface.co/DavidAU/Qwen3.6-40B-Fable-Fusion-6-Core-Deckard-Eleanor-Heretic-Uncensored-NM-DAU-NEO-MAX-MTP-GGUF
- Versión 40B Grand Intelligence FF711-717: https://huggingface.co/DavidAU/Qwen3.6-40B-Grand-Intelligence-Fable-Fusion-Uncensored-Heretic-NM-DAU-NEO-MAX-MTP-GGUF
- Qwen 3.8 27B Cold Fusion: https://huggingface.co/DavidAU/Qwen3.8-27B-Cold-Fusion-GAIN-V1.1-NM-DAU-NEO-MAX-MTP-GGUF
- Qwen 3.8 27B TURBO Fable 738-882: https://huggingface.co/DavidAU/Qwen3.8-27B-TURBO-Fable-Cold-Fusion-735-882-Heretic-Uncensored-NEO-CODER-MAX-MTP-GGUF
- Qwen 3.8 27B TWIN TURBO: https://huggingface.co/DavidAU/Qwen3.8-27B-TWIN-TURBO-Fable-Cold-Fusion-709-L-Uncensored-NM-DAU-NEO-MTP-GGUF
- Modelo de control Qwen3.5-9B-The-Defiant: https://huggingface.co/DavidAU/Qwen3.5-9B-The-Defiant-Fable-Uncensored-Heretic-NEO-IMATRIX-MAX-MTP-GGUF
- Dataset Polaris-STRICT: https://huggingface.co/datasets/DavidAU/Polar-STRICT-Datasets
- Dataset F451-STRICT: https://huggingface.co/datasets/DavidAU/F451-STRICT-Datasets
