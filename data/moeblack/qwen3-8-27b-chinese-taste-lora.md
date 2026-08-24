# Moeblack/Qwen3.8-27B-chinese-taste-lora

## Resumen

El modelo **Qwen3.8-27B-chinese-taste-lora**, publicado por el autor Moeblack, es un adaptador LoRA de dominio diseñado para modificar el estilo de generación del modelo base **Qwen/Qwen3.8-27B** de Alibaba. El objetivo principal es dotar al modelo de una "sensibilidad" o "taste" propia de la novela china contemporánea: ritmo de frase, uso de metáforas y textura narrativa natural. Este adaptador se entrena mediante **DAPT** (Domain-Adaptive Pre-Training) con un corpus de 52 capítulos de novelas chinas (aproximadamente 1,14 millones de caracteres, ~0,7 millones de tokens).

El resultado es un LoRA que, al ser cargado sobre el modelo base, mejora la naturalidad del chino generado en conversaciones cotidianas y en tareas de creación literaria, reduciendo la rigidez típica de las traducciones literales del inglés. La versión publicada (step-102) se selecciona por ser el punto de equilibrio entre estilo y naturalidad, según pruebas discriminativas realizadas por el autor. El adaptador es ligero: 638 millones de parámetros entrenables (2,4% del modelo base) y se distribuye tanto en formato PEFT (safetensors) como en GGUF cuantizado (Q8_0) para su uso directo con llama.cpp.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | LoRA sobre Qwen3.8-27B (modelo denso multimodal de Alibaba) |
| Parámetros totales | 637.534.208 (solo adaptador LoRA, rank 128) |
| Parámetros activos | No aplica (modelo denso, no es MoE) |
| Longitud de contexto | 262.144 tokens (del modelo base, según ejemplo de uso) |
| Tipos de cuantización | Q8_0 (GGUF) para el adaptador; FP32 en safetensors |
| Idiomas soportados | Chino (zh) – el adaptador está entrenado exclusivamente en chino |
| Licencia | Apache-2.0 |
| Formato de pesos | Safetensors (PEFT) y GGUF (Q8_0) |

## Arquitectura y entrenamiento

El adaptador se entrena mediante **DAPT (Domain-Adaptive Pre-Training)** sobre el modelo base **Qwen3.8-27B**, un LLM multimodal denso de 27.000 millones de parámetros desarrollado por Alibaba. El entrenamiento se realiza con la técnica de LoRA (Low-Rank Adaptation) con rank 128, alpha 256 y dropout 0.05, aplicado a las proyecciones de atención (q/k/v/o) y a las capas FFN (gate/up/down) de las 16 capas de atención completa y las 64 capas de FFN, excluyendo las capas de atención lineal GDN. El corpus de entrenamiento es un conjunto de texto de novelas chinas limpiado, con aproximadamente 1.146.000 caracteres (≈0,7 millones de tokens), procesado en secuencias de 4096 tokens con batch efectivo de 8 (batch 1 × grad_accum 8).

El entrenamiento se realizó durante 8 épocas (176 pasos de optimización) con una tasa de aprendizaje de 4e-5 y programación cosine con warmup de 50 pasos. El autor seleccionó el checkpoint **step-102** (58% del entrenamiento) en lugar del checkpoint final, ya que a partir del 77% de entrenamiento el modelo entra en fase de sobreajuste (memorización) y pierde la capacidad de generalización en la discriminación de estilo. En pruebas discriminativas con 40 ítems (20 frases auténticas de novelas chinas vs 20 frases de traducción literal), el step-102 alcanza un 35% de precisión frente al 25% del modelo base, y mantiene ese valor en step-119 (68%), pero cae al 25% en step-136 (77%) y en el final (100%).

## Capacidades

- Generación de texto en chino con estilo natural de novela: mejora el ritmo, el uso de metáforas y la textura narrativa respecto al modelo base.
- Mejora de la naturalidad en respuestas de conversación general: el autor muestra un ejemplo de pregunta ("¿De dónde viene el sol?") donde el LoRA produce una respuesta más directa y coloquial frente al estilo más literal del base.
- Reducción de la rigidez típica de la traducción literal: elimina estructuras del tipo "no es... es..." (It's not... it's...) que son calcos del inglés.
- No añade capacidades técnicas nuevas: el adaptador no introduce tool calling, agentes, razonamiento multi-paso ni visión; esas capacidades pertenecen al modelo base (Qwen3.8-27B es multimodal).
- Soporte para inferencia con llama.cpp mediante archivo GGUF Q8_0, con carga directa como LoRA en `llama-server`.

## Casos de uso

- Escritura asistida de novelas chinas: el LoRA se puede usar para generar fragmentos narrativos con el estilo y la cadencia de la literatura china moderna, como apoyo para autores o traductores.
- Traducción literaria con naturalidad: al cargar el adaptador, el modelo produce traducciones del chino que suenan más naturales y menos "traducción literal", especialmente en diálogos y descripciones.
- Mejora de chatbots en chino: en un sistema de atención al cliente en chino, el LoRA puede hacer que las respuestas del bot sean más coloquiales y cercanas, reduciendo la sensación de respuesta automatizada.
- Generación de subtítulos o doblajes en chino: para contenidos audiovisuales, el adaptador puede generar líneas de diálogo con el tono adecuado para el drama o la comedia.
- Reescritura de contenido web en chino: para blogueros o creadores de contenido, el LoRA puede reescribir textos manteniendo un estilo más vivo y natural, adecuado para audiencias chinas.
- Fine-tuning adicional para tareas específicas: al ser un LoRA ligero, se puede combinar con otros LoRAs o continuar su entrenamiento con un corpus propio para dominios concretos (por ejemplo, novela histórica o ciencia ficción).

## Benchmarks y rendimiento

La model card no incluye benchmarks estándar (MMLU, HumanEval, GSM8K, etc.), sino una prueba discriminativa específica para evaluar la mejora del estilo. Los resultados se presentan a continuación:

| Checkpoint | Progreso de entrenamiento | Precisión en test discriminativo (identificación de chino auténtico) |
| --- | --- | --- |
| Base (sin LoRA) | 0% | 25% |
| **step-102 (publicado)** | 58% | 35% |
| step-119 | 68% | 35% |
| step-136 | 77% | 25% |
| Final (100%) | 100% | 25% |

El test discriminativo consiste en 40 frases (20 de novelas chinas reales y 20 traducciones literales del inglés). El modelo debe clasificar correctamente cuál es auténtica. El LoRA en step-102 logra un 35% frente al 25% del base, lo que indica una mejora notable en la percepción de naturalidad, aunque sigue lejos del 100% (lo que sugiere que el modelo aún no distingue perfectamente entre estilos). No hay datos de rendimiento en tareas de razonamiento, código o matemáticas, ya que el adaptador está diseñado exclusivamente para estilo lingüístico.

## Requisitos de hardware

- El adaptador LoRA es muy ligero: el archivo GGUF Q8_0 pesa 677 MB, y el safetensors FP32 ~2.5 GB (según el tamaño del repo 3.2 GB total).
- Para inferencia con el modelo base Qwen3.8-27B, se requiere al menos **24 GB de VRAM** en cuantización Q4_K_M (según análisis técnico del modelo base). El LoRA añade una carga mínima en memoria.
- GPUs recomendadas: RTX 4090 (24 GB), A100 (40 GB), H100 (80 GB) para mayor margen. Con 24 GB se puede ejecutar en modo Q4_K_M con contexto completo.
- El LoRA se puede desplegar con **llama.cpp** (llama-server) o con **transformers + PEFT** en Python. También es compatible con vLLM, aunque no se ha verificado específicamente.
- No hay datos de latencia o throughput publicados para el adaptador; se estima que el overhead es insignificante respecto al modelo base.

## Comparativa con modelos similares

No se dispone de comparación con otros LoRAs de estilo literario chino en la información proporcionada. La única comparación directa es con el modelo base sin adaptador:

| Modelo | Parámetros | Contexto | Estilo chino | Licencia |
| --- | --- | --- | --- | --- |
| Qwen3.8-27B (base) | 27B | 262.144 | Rígido, con calcos del inglés | Apache-2.0 |
| Qwen3.8-27B + LoRA step-102 | 27B + 638M | 262.144 | Más natural, estilo novelístico | Apache-2.0 |

No se dispone de otros LoRAs de adaptación de estilo chino en la información disponible para comparar.

## Limitaciones y advertencias

- El corpus de entrenamiento es pequeño (~0.7M tokens) y procede de "texto de novelas chinas limpiado", lo que puede incluir errores tipográficos o sesgos temáticos del género (ficción de internet).
- Riesgo de sobreajuste: el autor detecta que a partir del 77% del entrenamiento, el modelo pierde la capacidad de generalización y comienza a memorizar el corpus. El checkpoint publicado (step-102) es un punto de equilibrio, pero no se garantiza que sea óptimo para todos los dominios.
- El adaptador está entrenado exclusivamente en chino; no tiene efecto (ni perjuicio) en otros idiomas, pero no mejora el estilo en español, inglés, etc.
- No se ha evaluado el riesgo de alucinación específicamente; se recomienda validar las respuestas en entornos críticos.
- La licencia del adaptador es Apache-2.0, y el modelo base Qwen3.8-27B también es Apache-2.0, lo que permite uso comercial, pero se debe verificar que no haya restricciones adicionales en los términos de Alibaba.
- El LoRA solo modifica el estilo de generación; no añade capacidades de razonamiento, visión ni tool calling. Para tareas técnicas, se debe usar el modelo base sin adaptador.

## Enlaces

- Repositorio del LoRA: https://huggingface.co/Moeblack/Qwen3.8-27B-chinese-taste-lora
- Modelo base Qwen3.8-27B en Hugging Face: https://huggingface.co/Qwen/Qwen3-8B
- GitHub del modelo base Qwen3.8-27B: https://github.com/AlibabaCloud-Official/Qwen3.8-27B
- Análisis técnico del modelo base: https://local-ai-zone.github.io/blog/qwen3-8-27b-comprehensive-analysis.html
- Repo oficial de la serie Qwen3.8: https://github.com/QwenLM/Qwen3.8
