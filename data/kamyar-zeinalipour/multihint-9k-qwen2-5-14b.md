# Kamyar-zeinalipour/MultiHint-9K-Qwen2.5-14B

## Resumen

MultiHint-9K-Qwen2.5-14B es un adaptador LoRA sobre Qwen2.5-14B-Instruct, desarrollado por Kamyar Zeinalipour (junto con Amir Sadeghi, Giovanni Angelini, Leonardo Rigutini, Marco Gori y Marco Maggini) y presentado en el paper *MultiHint-9K: Orchestrating Human and AI Agency for Scalable Pedagogical Hint Generation* (AIED 2026). El modelo resuelve un problema pedagogico concreto: dado un pasaje, una pregunta de comprension lectora y su respuesta, genera una pista socratica breve que orienta al estudiante hacia la respuesta sin revelarla.

El modelo parte de la arquitectura transformer densa de Qwen2.5-14B-Instruct (14.000 millones de parametros) y se entrena mediante LoRA sobre el dataset MultiHint-9K, compuesto por 9.987 tuplas pregunta-respuesta-pista verificadas automaticamente y calibradas por humanos en ingles, italiano y persa. La relevancia actual reside en su enfoque de generacion de pistas pedagogicas multilingue con una mejora medible y estadisticamente significativa sobre el modelo base (ROUGE-L de 0,23 a 0,31, +34%), lo que lo hace util para sistemas de tutoria inteligente y plataformas educativas.

El adaptador se distribuye como pesos PEFT en safetensors (3,4 GB) bajo licencia Apache 2.0, heredada del modelo base, y esta pensado para cargarse junto a Qwen2.5-14B-Instruct mediante la libreria `peft`.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (Qwen2.5-14B-Instruct) con adaptador LoRA (PEFT) |
| Parametros totales | 14.000 millones (modelo base); el adaptador LoRA anade un subconjunto no especificado |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada (heredada del modelo base Qwen2.5-14B-Instruct) |
| Tipos de cuantizacion | No disponible en la informacion proporcionada |
| Idiomas soportados | Ingles (en), italiano (it), persa (fa) |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (adaptador PEFT/LoRA); requiere el modelo base Qwen/Qwen2.5-14B-Instruct |

## Arquitectura y entrenamiento

El adaptador se aplica sobre Qwen2.5-14B-Instruct, un transformer denso de 14.000 millones de parametros. El entrenamiento utiliza LoRA con rango r = 32, alpha = 64 y dropout de 0,1 sobre las proyecciones de atencion y MLP. Se realizaron 3 epocas con el optimizador AdamW, tasa de aprendizaje de 1e-4 con decaimiento coseno, precision bf16 y Flash Attention 2.

El dataset de entrenamiento, MultiHint-9K, contiene 9.987 tuplas de pregunta-respuesta-pista en ingles, italiano y persa, verificadas automaticamente y calibradas por humanos. El objetivo es generar pistas socraticas que no revelen la respuesta. La evaluacion se realiza con ROUGE-L sobre un conjunto reservado, con mejoras estadisticamente significativas (p < 0,001, Wilcoxon con correccion de Bonferroni).

## Capacidades

- Generacion de pistas socraticas para preguntas de comprension lectora a partir de un pasaje, una pregunta y su respuesta.
- Generacion de texto condicionada por prompt estructurado (formato "Recall Assistant").
- Soporte multilingue en ingles, italiano y persa.
- Orientacion pedagogica sin revelar la respuesta (razonamiento guiado paso a paso).
- Especializacion en dominio educativo (tutoria y asistencia al aprendizaje).
- No se documentan capacidades de tool calling, agentes, vision, audio ni modo de razonamiento explicito en la informacion disponible.

## Casos de uso

- Tutoria inteligente en plataformas educativas: el modelo genera pistas breves que guian al estudiante hacia la respuesta de una pregunta de comprension lectora sin desvelarla, integrándose en un sistema de dialogo que presenta el pasaje y la pregunta y muestra la pista generada.
- Asistencia a docentes en la creacion de material: a partir de un banco de preguntas y respuestas, el modelo produce pistas socraticas que el profesor puede revisar e incorporar a sus ejercicios.
- Sistemas de lectura guiada multilingue: al soportar ingles, italiano y persa, permite desplegar un mismo motor de pistas en plataformas educativas de distintos idiomas.
- Evaluacion formativa automatizada: el modelo genera retroalimentacion gradual en lugar de la respuesta correcta, fomentando el razonamiento del alumno en entornos de practica.
- Investigacion en NLP educativo: sirve como linea base afinada para comparar estrategias de generacion de pistas y evaluar metricas como ROUGE-L en tareas pedagogicas.
- Generacion de contenido para aplicaciones de aprendizaje de idiomas: las pistas socraticas pueden adaptarse a preguntas de comprension en italiano o persa para estudiantes de esas lenguas.
- Prototipado rapido de asistentes educativos: al ser un adaptador LoRA, se puede cargar sobre el modelo base con `peft` y desplegar en pipelines de generacion de texto existentes.

## Benchmarks y rendimiento

Resultados de ROUGE-L en el conjunto reservado, comparando modelo base y adaptador afinado:

| Modelo base | Adaptador | ROUGE-L (base → afinado) |
|---|---|---|
| Llama-3.1-8B | MultiHint-9K-Llama-3.1-8B | 0,20 → 0,32 (+52%) |
| Qwen2.5-14B | MultiHint-9K-Qwen2.5-14B | 0,23 → 0,31 (+34%) |
| Mistral-7B-v0.3 | MultiHint-9K-Mistral-7B-v0.3 | 0,19 → 0,32 (+57%) |
| Mistral-Nemo-12B | MultiHint-9K-Nemo-12B | 0,15 → 0,31 (+100%) |
| Mistral-Small-24B | MultiHint-9K-Mistral-Small-24B | 0,18 → 0,33 (+71%) |

Todas las mejoras son estadisticamente significativas (p < 0,001, Wilcoxon con correccion de Bonferroni). No se han publicado resultados de MMLU, HumanEval, GSM8K ni otros benchmarks generales en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: depende enteramente del modelo base Qwen2.5-14B-Instruct, ya que el adaptador LoRA anade una sobrecarga minima. En bf16 se requiere aproximadamente 28 GB de VRAM para los pesos; con cuantizacion de 8 bits, en torno a 14-16 GB; con 4 bits, en torno a 8-10 GB (estimaciones orientativas, no confirmadas en la informacion disponible).
- GPU recomendadas: A100 (40/80 GB) o H100 para bf16 sin cuantizar; RTX 4090 (24 GB) para cuantizacion de 8 bits; GPUs consumer de 12-16 GB solo con cuantizacion de 4 bits.
- Cabe en GPU consumer: si, mediante cuantizacion de 4 u 8 bits, aunque el adaptador se distribuye en safetensors y requiere cargar el modelo base completo.
- Opciones de despliegue: `transformers` + `peft` (metodo documentado en la model card); vLLM, llama.cpp, Ollama y TGI no estan documentados para este adaptador en la informacion disponible.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

Comparativa con otros adaptadores de la misma familia MultiHint-9K (misma tarea y dataset):

| Modelo | Parametros base | Contexto | ROUGE-L (afinado) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| MultiHint-9K-Qwen2.5-14B | 14B | No disponible | 0,31 | Apache 2.0 | Hugging Face |
| MultiHint-9K-Llama-3.1-8B | 8B | No disponible | 0,32 | No disponible | Hugging Face |
| MultiHint-9K-Mistral-7B-v0.3 | 7B | No disponible | 0,32 | No disponible | Hugging Face |
| MultiHint-9K-Mistral-Small-24B | 24B | No disponible | 0,33 | No disponible | Hugging Face |

El adaptador sobre Qwen2.5-14B ofrece un rendimiento ROUGE-L (0,31) ligeramente inferior al de los adaptadores sobre Llama-3.1-8B, Mistral-7B y Mistral-Small-24B (0,32-0,33), pero con un modelo base de 14B y licencia Apache 2.0. No se dispone de comparativas con modelos de proposito general en la informacion proporcionada.

## Limitaciones y advertencias

- El modelo esta especializado en generacion de pistas socraticas para comprension lectora; su rendimiento en tareas generales no esta documentado y probablemente herede el del modelo base.
- Solo se documentan tres idiomas (ingles, italiano y persa); el comportamiento en otros idiomas no esta verificado.
- Riesgo de alucinacion inherente a los modelos de lenguaje: las pistas pueden contener informacion incorrecta o no fundamentada en el pasaje.
- La evaluacion se limita a ROUGE-L, metrica lexica que no captura plenamente la calidad pedagogica de las pistas; no se reportan evaluaciones humanas en la informacion disponible.
- Requiere cargar el modelo base Qwen2.5-14B-Instruct, lo que implica un coste de VRAM y computo considerable.
- La licencia Apache 2.0 se hereda del modelo base; conviene verificar las condiciones de Qwen2.5-14B-Instruct para uso comercial.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, lo que indica poca validacion por parte de la comunidad.
- No se documentan sesgos especificos ni evaluaciones de robustez en la informacion proporcionada.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Kamyar-zeinalipour/MultiHint-9K-Qwen2.5-14B
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-14B-Instruct
- Dataset MultiHint-9K: https://huggingface.co/datasets/Kamyar-zeinalipour/MultiHint-9K
- Coleccion MultiHint-9K: https://huggingface.co/collections/Kamyar-zeinalipour/multihint-9k-aied-2026-6af4875966cf330a922a1d87
- Paper (CEUR Workshop Proceedings, Vol. 4248): https://ceur-ws.org/Vol-4248/short11.pdf
- Repositorio GitHub: https://github.com/KamyarZeinalipour/MultiHint-9K
- Scripts de entrenamiento y evaluacion: https://github.com/KamyarZeinalipour/MultiHint-9K/tree/main/training
- Adaptador MultiHint-9K-Llama-3.1-8B: https://huggingface.co/Kamyar-zeinalipour/MultiHint-9K-Llama-3.1-8B
- Adaptador MultiHint-9K-Mistral-7B-v0.3: https://huggingface.co/Kamyar-zeinalipour/MultiHint-9K-Mistral-7B-v0.3
- Adaptador MultiHint-9K-Nemo-12B: https://huggingface.co/Kamyar-zeinalipour/MultiHint-9K-Nemo-12B
- Adaptador MultiHint-9K-Mistral-Small-24B: https://huggingface.co/Kamyar-zeinalipour/MultiHint-9K-Mistral-Small-24B
