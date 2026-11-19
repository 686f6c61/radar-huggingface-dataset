# mradermacher/Qwen3.5-9B-DeepThought-STEM-i1-GGUF

## Resumen

Qwen3.5-9B-DeepThought-STEM-i1-GGUF es la versión cuantizada con GGUF del modelo xtools-at/Qwen3.5-9B-DeepThought-STEM, un fine-tune de la familia Qwen3.5 orientado a razonamiento científico y STEM. El modelo original parte de una base Qwen3.5 de 9B parámetros (9.197.093.888 parámetros reales según safetensors) y se ha ajustado mediante SFT y LoRA/PEFT sobre un conjunto de datasets de trazas de razonamiento de alta calidad, incluyendo destilaciones de modelos como Claude Haiku 5.5, Xiaomi MiMo 2.6 Pro, ChatGPT 6.1 Terra, GPT-5.6 y GLM-5.1, además de datasets específicos de descubrimiento de fármacos y formulación farmacéutica.

El trabajo de cuantización lo firma mradermacher, un autor habitual en el ecosistema GGUF, y ofrece cuantizaciones ponderadas con imatrix (i1) en un rango que va desde Q2_K (4,0 GB) hasta Q6_K (7,7 GB), lo que permite desplegar el modelo en hardware de consumo. El repositorio ocupa 81,3 GB en total debido a la multiplicidad de cuantizaciones disponibles. La licencia es Apache 2.0, lo que facilita su uso comercial.

La relevancia actual del modelo radica en su enfoque verticalizado: no es un modelo generalista, sino un fine-tune especializado en razonamiento científico, matemáticas, química farmacéutica y disciplinas STEM, con etiquetas que indican características de "uncensored", "abliterated" y "decensored", lo que implica que se han eliminado o reducido los mecanismos de rechazo del modelo base. Esto lo hace interesante para investigación y aplicaciones donde el modelo base resultaría excesivamente restrictivo, pero también exige cautela en producción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer (familia Qwen3.5; detalles específicos de atención y capas no disponibles) |
| Parámetros totales | 9.197.093.888 (9,2B) |
| Parámetros activos | No aplica (no es MoE según la información disponible) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | i1-Q2_K, i1-Q3_K_S, i1-IQ3_S, i1-IQ3_M, i1-Q3_K_M, i1-Q3_K_L, i1-IQ4_XS, i1-Q4_0, i1-Q4_K_S, i1-IQ4_NL, i1-Q4_K_M, i1-Q4_1, i1-Q5_K_S, i1-Q5_K_M, i1-Q6_K (ponderadas con imatrix); también hay cuantizaciones estáticas en el repo hermano |
| Idiomas soportados | Inglés (en) según la model card |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (repo de cuantizaciones); el modelo base está en safetensors/transformers |

## Arquitectura y entrenamiento

La arquitectura subyacente es un transformer de la familia Qwen3.5 con 9,2B parámetros. No se dispone de información detallada sobre el número de capas, dimensiones ocultas, mecanismo de atención (si incorpora atención lineal, decodificación especulativa u otras innovaciones de la familia Qwen3.5) ni sobre la longitud de contexto nativa, ya que la model card del repositorio cuantizado no los detalla.

El entrenamiento del modelo base (xtools-at/Qwen3.5-9B-DeepThought-STEM) se realizó mediante SFT y LoRA/PEFT (etiquetas `lora`, `peft`, `sft`, `unsloth`). Los datasets empleados incluyen trazas de razonamiento de alta calidad: Claude-Haiku-5.5-High-Reasoning-TraceInversion-3000x, Xiaomi-MiMo-2.6-Pro-High-Reasoning-250x, ChatGPT-6.1-Terra-High-Reasoning-TraceInversion-80x, GPT-5.6-luna-reasoning-102881x, GLM-5.1-Reasoning-1M-Cleaned, GLM-5.1-1000000x, además de dos datasets específicos de descubrimiento de fármacos y formulación farmacéutica (red-pill-drug-discovery-formulation-synthetic-reasoning y red-pill-drug-discovery-formulation) y smoltalk2 de HuggingFaceTB. Las etiquetas `heretic`, `uncensored`, `decensored` y `abliterated` indican que se aplicaron técnicas de eliminación de rechazo (abliteration) sobre el modelo, lo que constituye una modificación deliberada del comportamiento de seguridad.

La cuantización i1 emplea ficheros imatrix (0,1 GB) para ponderar la importancia de los tensores durante la cuantización, lo que según el autor mejora la calidad frente a cuantizaciones estáticas de tamaño similar. El repositorio incluye también un repositorio hermano con cuantizaciones estáticas y, según la model card, los ficheros mmproj (proyector multimodal) estarían en ese repositorio estático si existen, lo que sugiere que el modelo base podría tener capacidades de visión, aunque no se confirma en la información disponible.

## Capacidades

- Generación de texto y razonamiento de múltiples pasos, con énfasis en trazas de razonamiento largas (reasoning traces) procedentes de destilaciones de modelos de razonamiento.
- Razonamiento matemático y científico (etiquetas `mathematics`, `science`, `stem`, `scientific-reasoning`).
- Conocimiento especializado en descubrimiento de fármacos, formulación farmacéutica y ciencias farmacéuticas (etiquetas `drug-discovery`, `pharmaceutical-formulation`, `pharmaceutics`).
- Capacidades académicas y de razonamiento científico orientadas a investigación.
- Comportamiento "uncensored"/"abliterated": menor tendencia a rechazar peticiones, incluyendo contenido que el modelo base rechazaría.
- Conversacional (etiqueta `conversational`) y compatible con text-generation-inference y endpoints.
- Posible soporte de visión: la model card menciona "This is a vision model" y la existencia de ficheros mmproj, aunque no se detalla la arquitectura multimodal ni se confirma en las especificaciones.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y multi-step reasoning: no confirmado explícitamente, aunque el énfasis en trazas de razonamiento sugiere capacidad para razonamiento encadenado.

## Casos de uso

- Razonamiento científico asistido: el modelo puede emplearse para generar cadenas de razonamiento sobre problemas de física, química o biología, aprovechando su entrenamiento sobre trazas de razonamiento destiladas de modelos de alta capacidad. Es adecuado para entornos de investigación donde se necesita explorar hipótesis y justificaciones paso a paso.
- Descubrimiento de fármacos y formulación farmacéutica: dado el entrenamiento específico sobre datasets de drug discovery y formulación, puede asistir en la generación de hipótesis sobre formulaciones, propiedades fisicoquímicas y relaciones estructura-actividad, siempre con supervisión experta.
- Tutoría y generación de material académico STEM: puede redactar explicaciones detalladas de conceptos matemáticos y científicos, generar problemas resueltos y material de estudio, aprovechando su orientación a `academics`.
- Investigación sobre alineación y seguridad: al ser un modelo abliterated, es útil para estudiar el comportamiento de modelos sin mecanismos de rechazo, analizar sesgos y evaluar riesgos de contenido dañino en entornos controlados.
- Despliegue en hardware de consumo: las cuantizaciones i1-Q4_K_M (5,9 GB) o i1-Q5_K_M (6,7 GB) permiten ejecutar el modelo en GPUs de consumo con 8-12 GB de VRAM mediante llama.cpp u Ollama, lo que facilita prototipado local de asistentes científicos.
- Generación de código científico y scripts de análisis: aunque no se detalla un entrenamiento específico en código, el modelo puede generar scripts de análisis de datos, simulaciones numéricas y código de procesamiento en dominios STEM, integrándose en notebooks y pipelines de investigación.
- Fine-tuning posterior especializado: al estar disponible en GGUF y con licencia Apache 2.0, sirve como base para ajustes adicionales en dominios concretos o para destilación de conocimiento en modelos más pequeños.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia según cuantización: i1-Q2_K ~4,0 GB; i1-IQ3_S ~4,6 GB; i1-Q3_K_M ~4,8 GB; i1-IQ4_XS ~5,4 GB; i1-Q4_K_S ~5,6 GB; i1-Q4_K_M ~5,9 GB; i1-Q5_K_M ~6,7 GB; i1-Q6_K ~7,7 GB. Añadir overhead de contexto KV cache (variable según longitud de contexto).
- GPU recomendadas: para cuantizaciones Q4-Q5, GPUs de consumo como RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070/4080/4090; para Q6_K o contexto largo, RTX 4090 24 GB o GPUs profesionales A100/H100.
- Cabe en GPU de consumo: sí, en la mayoría de cuantizaciones (Q4_K_M en 8 GB de VRAM es viable con contexto moderado; Q5/Q6 requieren 12-16 GB).
- Opciones de despliegue: llama.cpp, Ollama, y cualquier runtime compatible con GGUF; el modelo base es compatible con transformers y text-generation-inference. Para GGUF, llama.cpp y Ollama son las vías naturales.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Qwen3.5-9B-DeepThought-STEM-i1-GGUF (este) | 9,2B | No disponible | Apache 2.0 | GGUF (i1, imatrix) | Fine-tune STEM/farmacéutico, abliterated, cuantizaciones i1 |
| Qwen3.5-9B-DeepThought-STEM (base) | 9,2B | No disponible | Apache 2.0 | safetensors | Modelo original sin cuantizar; misma especialización |
| Qwen3.5-9B-DeepThought-STEM-GGUF (estático) | 9,2B | No disponible | Apache 2.0 | GGUF (estático) | Cuantizaciones estáticas del mismo modelo, sin imatrix |

No se dispone de información sobre modelos comparables de otros autores (por ejemplo, otros fine-tunes STEM de 9B) en la información proporcionada, por lo que la comparativa se limita a las variantes del mismo modelo.

## Limitaciones y advertencias

- Modelo abliterated/uncensored: se han eliminado o reducido los mecanismos de rechazo, por lo que puede generar contenido dañino, ilegal o éticamente problemático. No es adecuado para despliegues públicos sin filtros adicionales.
- Riesgo de alucinación: como todo modelo de lenguaje, puede inventar referencias, datos experimentales, propiedades de compuestos o resultados matemáticos; especialmente peligroso en dominios científicos y farmacéuticos donde los errores tienen consecuencias.
- Especialización estrecha: el entrenamiento se centra en STEM y farmacia; el rendimiento en otros dominios (derecho, humanidades, código general) puede ser inferior al de modelos generalistas del mismo tamaño.
- Idiomas: la model card declara únicamente inglés (`en`); el rendimiento en castellano u otros idiomas no está garantizado y probablemente sea limitado.
- Longitud de contexto: no disponible; no se puede garantizar el manejo de contextos largos sin verificación empírica.
- Origen de los datos de entrenamiento: las trazas de razonamiento provienen de destilaciones de modelos propietarios (Claude Haiku 5.5, ChatGPT 6.1, GPT-5.6, GLM-5.1, MiMo 2.6), lo que puede plantear cuestiones sobre los términos de uso de dichos datos y sobre la fidelidad de las trazas destiladas.
- Licencia Apache 2.0 permite uso comercial, pero el usuario debe asumir la responsabilidad sobre el contenido generado y sobre posibles reclamaciones derivadas del entrenamiento con datos destilados de terceros.
- En producción, requiere validación humana en dominios científicos y farmacéuticos, y filtros de seguridad propios si el modelo se expone a usuarios finales.
- La información sobre visión es ambigua: la model card menciona "vision model" y ficheros mmproj, pero no se confirma la arquitectura multimodal ni su calidad; no asumir capacidades de visión sin verificación.

## Enlaces

- Repositorio Hugging Face (cuantizaciones i1): https://huggingface.co/mradermacher/Qwen3.5-9B-DeepThought-STEM-i1-GGUF
- Repositorio de cuantizaciones estáticas: https://huggingface.co/mradermacher/Qwen3.5-9B-DeepThought-STEM-GGUF
- Modelo base: https://huggingface.co/xtools-at/Qwen3.5-9B-DeepThought-STEM
- Página de descargas del autor: https://hf.tst.eu/model#Qwen3.5-9B-DeepThought-STEM-i1-GGUF
- FAQ y peticiones de modelos de mradermacher: https://huggingface.co/mradermacher/model_requests
- Guía de uso de GGUF (README de TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Análisis de tipos de cuantización (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Dataset Claude-Haiku-5.5-High-Reasoning-TraceInversion-3000x: https://huggingface.co/datasets/xtools-at/Claude-Haiku-5.5-High-Reasoning-TraceInversion-3000x
- Dataset Xiaomi-MiMo-2.6-Pro-High-Reasoning-250x: https://huggingface.co/datasets/xtools-at/Xiaomi-MiMo-2.6-Pro-High-Reasoning-250x
- Dataset ChatGPT-6.1-Terra-High-Reasoning-TraceInversion-80x: https://huggingface.co/datasets/xtools-at/ChatGPT-6.1-Terra-High-Reasoning-TraceInversion-80x
- Dataset GPT-5.6-luna-reasoning-102881x: https://huggingface.co/datasets/Roman1111111/GPT-5.6-luna-reasoning-102881x
- Dataset GLM-5.1-Reasoning-1M-Cleaned: https://huggingface.co/datasets/Jackrong/GLM-5.1-Reasoning-1M-Cleaned
- Dataset GLM-5.1-1000000x: https://huggingface.co/datasets/Kassadin88/GLM-5.1-1000000x
- Dataset red-pill-drug-discovery-formulation-synthetic-reasoning: https://huggingface.co/datasets/xtools-at/red-pill-drug-discovery-formulation-synthetic-reasoning
- Dataset red-pill-drug-discovery-formulation: https://huggingface.co/datasets/saidutta69/red-pill-drug-discovery-formulation
- Dataset smoltalk2: https://huggingface.co/datasets/HuggingFaceTB/smoltalk2
