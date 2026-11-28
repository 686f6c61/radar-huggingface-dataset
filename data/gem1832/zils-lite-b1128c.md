# Gem1832/zils-lite-b1128c

## Resumen

zils-lite-b1128c es un modelo de decisión de tipo "multiple choice" destilado, desarrollado por el usuario Gem1832 dentro del denominado ecosistema Zils (subred 127). No es un modelo generativo de propósito general: su función es puntuar opciones de respuesta ante una pregunta, es decir, emitir probabilidades sobre un conjunto cerrado de alternativas. Con 852.985.920 parámetros (aproximadamente 0,85B), se posiciona en la gama ultraligera y deriva de una familia de fine-tunes de Qwen/Qwen3.5-0.8B, lo que le confiere una arquitectura transformer con torre de visión heredada.

El modelo se construye en dos etapas: primero se fusionan por media de pesos tres modelos de decisión Apache-2.0 (joamCriff123/zils-lite-l1125a, joamCriff123/zils-lite-l1123q y MachinePulseAI/karpo-decision-0.8B) y después se destila desde un profesor de 4B (newsbang/adjudex-4b-v7) usando las probabilidades completas sobre las opciones como objetivo de entrenamiento, sin etiquetas doradas. El resultado es la segunda etapa de destilación de la serie, sucesora de zils-lite-b1128b.

Su relevancia es acotada pero concreta: ofrece un cuerpo de decisión pequeño, con licencia Apache-2.0 y entrenado únicamente con datos permisivos, pensado para tareas de clasificación y selección de opciones en dominios diversos (sentido común, medicina, matemáticas, llamada a herramientas, razonamiento causal). No está pensado como chatbot ni como generador de texto libre.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer (derivado de Qwen/Qwen3.5-0.8B), con torre de visión heredada del soup l1125a + l1123q |
| Parámetros totales | 852.985.920 |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | No disponible (pesos en safetensors; no se documentan variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | No disponibles |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de un transformer denso de la familia Qwen3.5-0.8B. El punto de arranque es una fusión por media aritmética de pesos (weight-space averaging con pesos iguales) de tres fine-tunes de decisión: zils-lite-l1125a (cuyos pesos coinciden con newsbang/adjudex-0.8b-v7), zils-lite-l1123q y karpo-decision-0.8B. La torre de visión se mantiene sin cambios respecto al soup de l1125a y l1123q. Sobre esa base se aplica una destilación en dos etapas desde el profesor newsbang/adjudex-4b-v7 (Apache-2.0), usando sus probabilidades completas sobre las opciones como objetivo, sin etiquetas doradas.

La etapa 1 recorre unas 58.000 filas públicas con LoRA de rango 16 sobre las capas de lenguaje, learning rate 3e-5 y fusión en FP32. La etapa 2 usa las primeras 9.900 filas de una mezcla barajada de 18.600 filas de dominios nuevos (BIG-bench, QASC, CosmosQA) con un 30% de replay de la etapa 1, LoRA de rango 16, learning rate 2e-5 y fusión en FP32. Los datos de entrenamiento incluyen WANLI (12.000 filas, CC BY 4.0), CommonsenseQA (9.741, MIT), MedMCQA (4.980, Apache-2.0), GSM8K en formato de elección múltiple (unas 7.000, MIT), When2Call (unas 8.600 pares de preferencia, CC BY 4.0), New Yorker caption contest en texto (unas 4.900, CC BY 4.0), Open-Jev (10.880, CC0-1.0), BIG-bench (10.334, Apache-2.0), QASC (4.000, CC BY 4.0) y CosmosQA (5.000, CC BY 4.0). No se usaron salidas de modelos comerciales ni splits de test.

## Capacidades

- Puntuación de opciones en formato de decisión: dada una pregunta y un conjunto de alternativas, el modelo emite probabilidades sobre cada opción.
- Razonamiento de sentido común (CommonsenseQA, CosmosQA, QASC).
- Conocimiento médico en preguntas de respuesta única (MedMCQA).
- Razonamiento matemático en formato de elección múltiple (GSM8K convertido).
- Decisión sobre cuándo invocar una herramienta o función (When2Call, pares de preferencia).
- Tareas de inferencia en lenguaje natural y NLI (WANLI).
- Evaluación de humor y creatividad textual (New Yorker caption contest, solo texto).
- Cobertura amplia de tareas BIG-bench (48 tareas en el entrenamiento).
- Capacidad de visión heredada de la torre del modelo base, aunque no se documenta su uso en esta ficha.
- No se documenta soporte explícito de tool calling generativo, agentes multi-paso ni modo "thinking"; su naturaleza es de clasificador/puntuador, no de generador.

## Casos de uso

- Evaluación automática de respuestas en exámenes tipo test: el modelo puntúa cada opción y se selecciona el argmax, adecuado por su entrenamiento directo en formato de decisión y su bajo coste de inferencia (0,85B).
- Filtrado de preguntas médicas en pipelines de triaje: gracias a su entrenamiento con MedMCQA, puede priorizar opciones plausibles en cuestionarios clínicos de respuesta única antes de una revisión humana.
- Enrutamiento de llamadas a herramientas en asistentes: usando el aprendizaje de When2Call, el modelo decide si una consulta requiere invocar una función y cuál de las opciones disponibles es la más probable.
- Validación de razonamiento aritmético en pipelines educativos: al haber sido entrenado con GSM8K en formato de elección múltiple, puede seleccionar la respuesta correcta entre alternativas generadas por otro modelo mayor.
- Moderación y clasificación de contenido creativo: el entrenamiento con el New Yorker caption contest permite puntuar la adecuación de textos breves en tareas de selección editorial.
- Benchmarking interno de modelos de decisión: su tamaño reducido y licencia Apache-2.0 lo hacen apto como baseline reproducible en evaluaciones de razonamiento de opción múltiple (MMLU-Pro, BBH, MuSR, ANLI).
- Clasificación de relaciones textuales (NLI) en pipelines de extracción de información, aprovechando el entrenamiento con WANLI.

## Benchmarks y rendimiento

Resultados locales publicados por el autor sobre ítems de test públicos retenidos, en estilo de habilidad de validador:

| Cuerpo | JevBench público | Test estilo Decision Index (MMLU-Pro, BBH, GSM8K, MuSR, ANLI, When2Call, New Yorker) | 30 tareas BIG-bench retenidas |
|---|---|---|---|
| l1125a + l1123q soup | 63,3 | 34,3 | 69,5 |
| El merge (punto de partida) | 60,9 | 36,2 | 57,6 |
| Etapa 1 (zils-lite-b1128b) | 62,3 | 37,8 | 55,9 |
| Este cuerpo (b1128c) | 62,1 | 38,2 | 58,0 |

No se han publicado resultados desglosados por benchmark individual (MMLU, HumanEval, GSM8K, etc.) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: en FP16, aproximadamente 1,7 GB de pesos más overhead de activaciones y KV cache; en FP32, unos 3,4 GB. En cuantizaciones de 8 bits o 4 bits (no documentadas por el autor, pero viables con herramientas estándar) cabría por debajo de 1 GB.
- GPU recomendadas: cualquier GPU consumer moderna es suficiente (RTX 3060 12 GB, RTX 4060, RTX 4090); también tarjetas de datacenter (A100, H100) para despliegues por lotes de alto throughput.
- Cabe holgadamente en GPU consumer, incluidas las de gama de entrada con 6-8 GB de VRAM.
- Opciones de despliegue: al estar en safetensors y derivar de Qwen3.5-0.8B, es compatible con vLLM, TGI, Transformers y, previa conversión, con llama.cpp y Ollama. No se documentan recetas oficiales de despliegue.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Enfoque | Disponibilidad |
|---|---|---|---|---|---|
| zils-lite-b1128c (este) | 0,85B | No disponible | Apache-2.0 | Decisión por puntuación de opciones, destilado | Hugging Face |
| zils-lite-b1128b | No disponible | No disponible | Apache-2.0 | Etapa 1 de la misma serie | Hugging Face |
| newsbang/adjudex-4b-v7 (profesor) | 4B | No disponible | Apache-2.0 | Decisión, profesor de la destilación | Hugging Face |
| MachinePulseAI/karpo-decision-0.8B | 0,8B | No disponible | Apache-2.0 | Decisión, uno de los modelos fusionados | Hugging Face |
| Qwen/Qwen3.5-0.8B (base) | 0,8B | No disponible | No disponible | Generativo de propósito general | Hugging Face |

No se dispone de datos de rendimiento comparables de los modelos alternativos en la información proporcionada, salvo los del profesor y los de la propia serie.

## Limitaciones y advertencias

- No es un modelo generativo: no produce texto libre ni conversación; solo puntúa opciones predefinidas.
- Riesgo de alucinación inherente a la destilación de probabilidades: el modelo puede asignar alta confianza a opciones incorrectas en dominios fuera de su distribución de entrenamiento.
- Sesgos no documentados: no se han publicado análisis de sesgo demográfico, cultural o de género.
- Idiomas soportados no especificados; probablemente hereda el multilingüismo de Qwen3.5-0.8B, pero no está confirmado ni evaluado.
- Longitud de contexto no documentada; no debe asumirse una ventana larga.
- La torre de visión se hereda pero no se documenta ni se evalúa su uso en esta ficha.
- Aunque la licencia es Apache-2.0 y los datos de entrenamiento son permisivos, el autor indica que el crédito de los pesos corresponde a sus autores originales y que no existe afiliación ni respaldo implícito; conviene revisar el NOTICE del repositorio antes de uso comercial.
- Modelo con 0 descargas y 0 likes en el momento de la consulta: no hay validación comunitaria independiente de los resultados publicados.
- Fecha de creación declarada en 2026-11-28, posterior a la fecha actual de referencia; conviene verificar la vigencia del repositorio.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Gem1832/zils-lite-b1128c
- Modelo predecesor (etapa 1): https://huggingface.co/Gem1832/zils-lite-b1128b
- Merge de partida: https://huggingface.co/Gem1832/zils-lite-b1128a
- Modelo base fusionado 1: https://huggingface.co/joamCriff123/zils-lite-l1125a
- Modelo base fusionado 2: https://huggingface.co/joamCriff123/zils-lite-l1123q
- Modelo base fusionado 3: https://huggingface.co/MachinePulseAI/karpo-decision-0.8B
- Profesor de destilación: https://huggingface.co/newsbang/adjudex-4b-v7
- Modelo equivalente a l1125a: https://huggingface.co/newsbang/adjudex-0.8b-v7
- Modelo base original: https://huggingface.co/Qwen/Qwen3.5-0.8B
- Dataset WANLI: https://huggingface.co/datasets/alisawuffles/WANLI
- Dataset CommonsenseQA: https://huggingface.co/datasets/tau/commonsense_qa
- Dataset MedMCQA: https://huggingface.co/datasets/openlifescienceai/medmcqa
- Dataset GSM8K: https://huggingface.co/datasets/openai/gsm8k
- Dataset When2Call: https://huggingface.co/datasets/nvidia/When2Call
- Dataset New Yorker caption contest: https://huggingface.co/datasets/jmhessel/newyorker_caption_contest
- Dataset Open-Jev: https://huggingface.co/datasets/ZefanCai/Open-Jev
- Dataset BIG-bench: https://huggingface.co/datasets/tasksource/bigbench
- Dataset QASC: https://huggingface.co/datasets/allenai/qasc
- Dataset CosmosQA: https://huggingface.co/datasets/allenai/cosmos_qa
