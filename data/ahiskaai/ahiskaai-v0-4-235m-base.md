# AhiskaAI/AhiskaAI-v0.4-235M-Base

## Resumen

AhıskaAI v0.4 235M Base es un modelo pequeño de lenguaje (SLM) de 258,9 millones de parámetros reales, desarrollado por AhıskaAI, un proyecto de investigación independiente centrado en modelos de lenguaje pequeños, tokenizadores personalizados y experimentos reproducibles de bajo coste. El modelo se ha entrenado desde cero sobre el corpus FineWeb-2 HQ Turkish, con un tokenizador BPE propio de 24.000 entradas, optimizado para la morfología del turco y del turco ahiska. Su arquitectura es una variante de LlamaForCausalLM con 20 capas, 16 cabezas de atención, 4 cabezas clave/valor y una ventana de contexto de 2.048 tokens.

La relevancia de este modelo radica en su carácter experimental y didáctico: permite estudiar el comportamiento de modelos de lenguaje pequeños entrenados desde cero en un idioma de bajos recursos como el turco, así como el impacto del tokenizador y del número de épocas de entrenamiento. A diferencia de otras versiones de la serie v0.4 (35M y 145M) que se entrenaron durante 2 épocas, este modelo 235M se entrenó durante solo 1 época, lo que lo convierte en una referencia útil para investigar la relación entre tamaño del modelo y convergencia con datos limitados.

El modelo es una base (base model), no ha sido ajustado para instrucciones, y su uso previsto es la investigación y el desarrollo de modelos ajustados posteriormente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LlamaForCausalLM (entrenado desde cero, no inicializado desde pesos de Llama) |
| Parametros totales | 258.909.184 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 2.048 tokens |
| Tipos de cuantizacion | No disponible en la informacion proporcionada (los pesos se publican en bfloat16) |
| Idiomas soportados | Turco (incluye turco ahiska) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (bfloat16) |

Detalles adicionales de arquitectura segun la model card:

| Parametro | Valor |
|---|---|
| Hidden size | 1.024 |
| Capas ocultas | 20 |
| Cabezas de atencion | 16 |
| Cabezas de clave/valor | 4 |
| Tamaño intermedio | 2.560 |
| Dimension de cabeza | 64 |
| Tamaño de vocabulario | 24.000 |
| Activacion | SiLU |
| Tipo de dato | bfloat16 |
| Codificacion posicional | RoPE (theta 10.000) |
| Embeddings de palabra | Tied (compartidos entre entrada y salida) |
| Dropout de atencion | 0,0 |
| Bias de atencion | Ninguno |
| Bias de MLP | Ninguno |

## Arquitectura y entrenamiento

AhıskaAI v0.4 235M Base implementa la arquitectura LlamaForCausalLM, pero entrenada completamente desde cero, sin tomar pesos de ningún modelo preentrenado existente. Los parámetros de diseño incluyen embeddings de palabra atados, tamaño de vocabulario de 24.000 y codificación posicional RoPE con theta 10.000. El uso de 4 cabezas clave/valor para 16 cabezas de atención indica una implementación de atención agrupada (grouped-query attention), que reduce los parámetros de las proyecciones de clave y valor.

El entrenamiento se realizó con el corpus FineWeb-2 HQ Turkish, compuesto por aproximadamente 1.700 millones de tokens. A diferencia de los modelos más pequeños de la misma serie (35M y 145M), que se entrenaron durante 2 épocas, este modelo de 235M se entrenó solo durante 1 época. El objetivo de entrenamiento fue el modelado causal de lenguaje (causal language modeling), sin etapas de RLHF ni DPO. La tokenización se basa en un tokenizador BPE personalizado de 24.000 entradas, compartido por toda la serie v0.4 y diseñado específicamente para la morfología aglutinante del turco y del turco ahiska.

## Capacidades

- Generación de texto causal en turco: continúa secuencias de texto prediciendo el siguiente token, pero no está entrenado para mantener diálogos ni seguir instrucciones.
- Modelado de lenguaje: puede calcular probabilidades de tokens y servir como base para análisis de perplejidad.
- Base para fine-tuning: al ser un modelo base, puede adaptarse mediante SFT (supervised fine-tuning), DPO o RLHF para tareas específicas en turco.
- Tokenización eficiente para morfología turca: el tokenizador de 24K está optimizado para palabras aglutinantes, lo que puede reducir el número de tokens por palabra en comparación con tokenizadores genéricos.
- Investigación de SLM: útil para estudiar la relación entre tamaño del modelo, cantidad de tokens y convergencia en lenguas de bajos recursos.
- No dispone de soporte para tool calling ni function calling: al ser un modelo base sin ajuste específico, no puede invocar herramientas de forma fiable.
- No dispone de capacidades de visión, audio ni agentes: el modelo solo procesa texto.

## Casos de uso

- Investigación de scaling laws en turco: se puede comparar la perplejidad y el rendimiento de este modelo de 258M con los modelos de 35M y 145M de la misma serie, manteniendo el mismo tokenizador y corpus, para analizar el efecto del tamaño en la convergencia tras una única época de entrenamiento.
- Fine-tuning para instrucciones en turco de bajo coste: el modelo puede servir como punto de partida para entrenar un asistente conversacional pequeño mediante SFT con datasets de instrucciones en turco, aprovechando la licencia Apache-2.0 y el tamaño reducido para experimentar en un solo GPU.
- Evaluación de tokenizadores morfológicos: permite medir cuántos tokens genera el tokenizador de 24K para palabras turcas y ahiska, comparándolo con tokenizadores BPE estándar como los de Llama o GPT, y analizar el impacto en la compresión de tokens.
- Prototipado educativo sobre arquitecturas causales: al ejecutarse en CPU o en GPUs pequeñas, es adecuado para visualizar atenciones, extraer embeddings de capas intermedias y explicar el funcionamiento de un LLM en cursos de aprendizaje automático.
- Experimentos de eficiencia y compresión: sirve como modelo sujeto para probar técnicas de cuantización, poda (pruning), distillación o adaptación de bajo rango (LoRA) en un SLM de menos de 300M parámetros.
- Generación asistida de texto turco no interactivo: tras un fine-tuning específico, puede utilizarse para completar textos, sugerir la siguiente palabra o corregir redacción en aplicaciones de edición de texto turco.
- Análisis lingüístico del turco ahiska: dado que el tokenizador y el corpus se centran en esta variante, el modelo puede ayudar a estudiar patrones morfológicos y léxicos de una lengua minoritaria, siempre que se trate como una herramienta de investigación y no como un recurso de producción.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) para este modelo en la información disponible. La model card menciona un benchmark experimental propio, AhıskaAI v0.1 Lite Benchmark, compuesto por 100 preguntas sobre calidad en turco, relevancia temática y corrección factual. Sin embargo, el extracto disponible solo muestra resultados de otros modelos (Gemma 3 1B con 85,86% y parcialmente Qwen 3 0.6B) y no incluye la puntuación del modelo AhıskaAI v0.4 235M Base. Por tanto, no hay datos de rendimiento publicados que permitan comparar este modelo con alternativas.

## Requisitos de hardware

- VRAM estimada para inferencia: los pesos en bfloat16 ocupan aproximadamente 0,52 GB; con overhead de ejecución, basta con 1-2 GB de VRAM. En float32, se necesitaría alrededor de 1 GB para los pesos, más overhead.
- GPU recomendadas: cualquier GPU moderna con al menos 2 GB de VRAM (RTX 2060, RTX 3050, GTX 1660, iglú integrados como Intel Iris) es suficiente. No se requieren GPUs de centro de datos como A100 o H100.
- Soporte en consumer GPU: sí, el modelo cabe en la mayoría de GPUs de consumo, incluidos portátiles con GPUs integradas, gracias a su tamaño reducido.
- Opciones de despliegue: Transformers con PyTorch; text-generation-inference (los tags del repositorio indican compatibilidad con TGI y endpoints); vLLM, que soporta arquitecturas LlamaForCausalLM; llama.cpp si se convierte previamente a formato GGUF, aunque el autor no publica dicha conversión.
- Latencia y throughput: no disponible en la información proporcionada.

## Comparativa con modelos similares

Los únicos modelos comparables documentados en la información disponible son las variantes anteriores de la propia serie AhıskaAI v0.4 (35M y 145M), de las que no se proporcionan especificaciones detalladas. Los modelos Gemma 3 1B y Qwen 3 0.6B aparecen solo como referencias en un benchmark experimental, sin datos completos sobre su rendimiento en este modelo. No se dispone de una comparativa completa con alternativas de la misma categoría.

## Limitaciones y advertencias

- Es un modelo base, no instruido: no sigue instrucciones, no mantiene diálogos y no se comporta como un asistente conversacional.
- Entrenado solo durante 1 época sobre ~1,7B tokens: esto puede provocar una convergencia inferior en comparación con los modelos más pequeños de la serie, que se entrenaron con 2 épocas sobre el mismo corpus.
- Contexto limitado a 2.048 tokens: no es adecuado para tareas que requieran procesar documentos largos o historiales extensos.
- Monolingüe turco: no tiene capacidades multilingües y su rendimiento fuera del turco y del turco ahiska será muy limitado.
- Riesgo de alucinación: como modelo causal de lenguaje pequeño, puede generar contenido plausible pero incorrecto, especialmente en temas poco representados en el corpus.
- Sesgos del corpus FineWeb-2: al tratarse de un corpus web, el modelo puede reflejar sesgos inherentes a dichos datos, sin filtros explícitos de contenido.
- Uso experimental: el autor indica que el modelo está destinado a investigación y no para aplicaciones críticas de producción.
- Licencia permisiva (Apache-2.0) para uso comercial, pero sin garantías de rendimiento ni soporte.
- No se publican cuantizaciones oficiales: cualquier conversión a GGUF u otros formatos debe ser validada por el usuario.

## Enlaces

- HuggingFace: https://huggingface.co/AhiskaAI/AhiskaAI-v0.4-235M-Base
- Dataset del benchmark experimental: https://huggingface.co/datasets/AhiskaAI/AhiskaAI_v0.1_Lite_Benchmark
- Repositorio de código: no disponible en la información proporcionada.
