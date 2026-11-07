# necropopeost/S5-nano-MLX-4bit

## Resumen

S5-nano-MLX-4bit es una conversión no oficial al formato MLX y cuantización de 4 bits del modelo maritaca-ai/S5-nano, desarrollado originalmente por Maritaca AI. El modelo base es un transformer de aproximadamente 4.200 millones de parámetros (4,2B) con arquitectura `qwen35`, orientado a portugués de Brasil con buen rendimiento en inglés, y con una ventana de contexto de hasta 262.144 tokens en su versión original. Esta conversión, publicada por el usuario necropopeost, tiene como objetivo permitir la ejecución local eficiente en Macs con Apple Silicon (M1, M2, M3, M4) mediante el framework MLX de Apple.

El problema que resuelve esta versión es la ausencia de un formato MLX oficial para el S5-nano: Maritaca AI publicó el modelo en safetensors (BF16) y en GGUF para llama.cpp, pero no en el formato optimizado para la GPU de los Mac. Esta conversión parte de los pesos BF16 originales (no del GGUF ya cuantizado) para evitar una doble pérdida de calidad, y aplica una cuantización afín de 4 bits con grupos de 64 pesos, lo que resulta en un coste real de 4,503 bits por peso.

Es relevante ahora porque permite ejecutar un modelo de 4,2B con contexto largo en hardware de consumo Apple con un pico de memoria de solo 3,21 GB, manteniendo una perplexidad cercana al original (7,982 frente a 7,733 en BF16, un 3,2% superior). La licencia Apache 2.0 facilita su uso comercial, y el modelo conserva los dos modos del original: Think (razonamiento previo) e Instruct (respuesta directa).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer, `qwen35` |
| Parametros totales | 4.205.751.296 (4,2B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 262.144 tokens en el modelo original; no verificada en esta conversión |
| Tipos de cuantizacion | Afín de 4 bits, grupos de 64 pesos, escala y sesgo en 16 bits (4,503 bits/peso real) |
| Idiomas soportados | Portugués (pt), inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (MLX) |
| Framework | mlx-lm (probado con 0.32.2) |
| Hardware objetivo | Apple Silicon (M1, M2, M3, M4) |
| Memoria de pico (medida) | 3,21 GB |
| Modalidad | Solo texto (sin encoder de visión) |

## Arquitectura y entrenamiento

El modelo base S5-nano emplea una arquitectura transformer identificada como `qwen35`, con aproximadamente 4,2B parámetros en su componente de texto. El modelo original incluye un encoder de visión y una capa de MTP (Multi-Token Prediction) para decodificación especulativa, aunque esta conversión MLX excluye el encoder de visión y no ha probado la capa MTP. El modelo original fue entrenado por Maritaca AI con foco en portugués de Brasil, e incorpora dos modos de operación: Think, donde el modelo genera un razonamiento explícito antes de la respuesta final (modo por defecto), e Instruct, que desactiva el razonamiento para respuestas directas.

Esta conversión concreta no implica reentrenamiento ni modificación de los pesos más allá de la cuantización. Se partió de los pesos BF16 originales y se aplicó una cuantización afín de 4 bits con grupos de 64 pesos mediante `mlx_lm convert --q-bits 4`. No se dispone de información sobre el volumen de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO en el modelo original, ya que esos datos no aparecen en la documentación proporcionada. La innovación técnica destacable de esta versión es la preservación de la calidad mediante la cuantización desde BF16 (no desde GGUF) y la inclusión del tokenizer y la plantilla de chat para su uso directo con mlx-lm.

## Capacidades

- Generación de texto conversacional en portugués de Brasil e inglés.
- Modo Think: razonamiento explícito antes de la respuesta final, activado por defecto.
- Modo Instruct: respuesta directa desactivando el razonamiento mediante `enable_thinking=False` en la plantilla de chat.
- Contexto largo: hasta 262.144 tokens en el modelo original (no verificado en esta conversión).
- Capacidades de visión en el modelo original (no incluidas en esta conversión MLX, que es solo texto).
- Decodificación especulativa mediante capa MTP en el modelo original (no probada en esta conversión).
- Soporte de tool calling en el modelo original (no probado en esta conversión).
- Ejecución local en Apple Silicon con memoria unificada mediante MLX.

## Casos de uso

- Asistencia conversacional en portugués de Brasil: el modelo puede gestionar diálogos multi-turno con matices lingüísticos del portugués brasileño, adecuado para productos dirigidos a ese mercado gracias a su entrenamiento específico en ese idioma.
- Generación de texto creativo en portugués: poesía, relatos cortos o contenido editorial, usando el modo Think para obtener mayor coherencia en textos largos y el modo Instruct para respuestas rápidas.
- Prototipado local en Mac para desarrolladores: integración en flujos de trabajo de desarrollo mediante mlx-lm en Python o línea de comandos, sin necesidad de GPU dedicada ni servicios en la nube, con un pico de 3,21 GB de memoria.
- Procesamiento de documentos largos en portugués: gracias al contexto de hasta 262.144 tokens del modelo original, puede emplearse para resumir o extraer información de documentos extensos, siempre que se verifique el comportamiento del contexto largo en esta cuantización.
- Razonamiento paso a paso en entornos educativos: el modo Think permite mostrar el proceso de razonamiento, útil para herramientas de tutoría o explicación de conceptos en portugués e inglés.
- Evaluación y experimentación con cuantización: investigadores pueden comparar esta versión 4-bit con la mxfp4 y la BF16 original para estudiar el impacto de la cuantización en calidad y velocidad, con métricas reproducibles de perplexidad y throughput.
- Despliegue en entornos con recursos limitados: al caber en 3,21 GB de memoria, es viable en MacBooks Air con 16 GB de RAM para tareas de generación de texto sin conexión.

## Benchmarks y rendimiento

Los únicos datos disponibles son los tests rápidos realizados por el autor de la conversión en un MacBook Air M4 con 16 GB de RAM y mlx-lm 0.32.2. No son benchmarks completos de tareas.

| Version | Perplejidad (menor es mejor) | Generacion (tok/s) | Prompt (tok/s) | Memoria de pico |
|---|---|---|---|---|
| BF16 (original) | 7,733 ± 0,068 | no medido | no medido | no medido |
| 4-bit (este repositorio) | 7,982 ± 0,070 | 34,3 | 310,6 | 3,21 GB |
| mxfp4 | 8,318 ± 0,074 | 36,3 | 305,0 | 3,08 GB |

Condiciones de medición: perplexidad con `mlx_lm perplexity` sobre `allenai/tulu-3-sft-mixture`, 256 muestras de 512 tokens; velocidad y memoria con `mlx_lm benchmark`, prompt de 512 tokens y generación de 256 tokens, media de 3 ejecuciones. La perplexidad del 4-bit es un 3,2% superior a la BF16 original. No se han publicado resultados de benchmarks de tareas (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM/memoria unificada estimada: 3,21 GB de pico medido en esta cuantización de 4 bits.
- Hardware probado: MacBook Air M4 con 16 GB de RAM.
- GPU compatibles: Apple Silicon M1, M2, M3 y M4 (memoria unificada).
- No está diseñado para GPU NVIDIA ni CUDA; requiere el framework MLX de Apple.
- Cabe en Macs de consumo con 16 GB de RAM; no se ha verificado en configuraciones de 8 GB.
- Opciones de despliegue: mlx-lm (Python y línea de comandos). No se ha probado con vLLM, llama.cpp, Ollama ni TGI.
- Throughput medido: 34,3 tok/s de generación y 310,6 tok/s de procesamiento de prompt en M4.
- La velocidad depende del modelo de Mac, la RAM libre y el tamaño del contexto.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| S5-nano-MLX-4bit (este) | 4,2B | 262.144 (original, no verificado) | MLX safetensors 4-bit | Apache 2.0 | Solo texto; 3,21 GB pico; 34,3 tok/s en M4 |
| S5-nano-MLX-mxfp4 | 4,2B | 262.144 (original) | MLX mxfp4 | Apache 2.0 | Algo más rápido (36,3 tok/s) y ligero (3,08 GB), peor perplexidad (8,318) |
| maritaca-ai/S5-nano (BF16) | 4,2B | 262.144 | safetensors BF16 | Apache 2.0 | Máxima calidad (perplexidad 7,733), mayor consumo de memoria; incluye visión y MTP |
| NVIDIA-Nemotron-3-Nano-4B-MLX-4bit | 4B | no disponible | MLX 4-bit | no disponible | Conversión MLX de otro modelo de tamaño similar; sin datos comparativos de rendimiento en la información disponible |

## Limitaciones y advertencias

- Conversión no oficial: no ha sido validada por Maritaca AI; el autor no tiene vínculo con la empresa.
- Solo texto: el encoder de visión del modelo original no está incluido.
- La capa MTP (decodificación especulativa) no ha sido probada en esta conversión.
- No se han ejecutado evaluaciones completas de tareas, especialmente en portugués; la perplexidad medida usa un dataset mayoritariamente en inglés y no mide calidad en portugués.
- No se han probado contextos largos ni tool calling en esta versión cuantizada.
- La cuantización introduce una pérdida de calidad medible (perplexidad un 3,2% superior a BF16).
- Riesgo de alucinación inherente al modelo base; no cuantificado en la información disponible.
- Sesgos del modelo original no documentados en la información proporcionada.
- Licencia Apache 2.0 permite uso comercial, pero al ser una conversión no oficial conviene verificar las condiciones del modelo base.
- Solo probado con mlx-lm 0.32.2; otras versiones pueden presentar incompatibilidades.
- Requiere hardware Apple Silicon; no es ejecutable en GPU NVIDIA ni en CPU convencional mediante este formato.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/necropopeost/S5-nano-MLX-4bit
- Modelo base original: https://huggingface.co/maritaca-ai/S5-nano
- Versión mxfp4 del mismo autor: https://huggingface.co/necropopeost/S5-nano-MLX-mxfp4
- Perfil del autor: https://huggingface.co/necropopeost
- API serverless del modelo base (Featherless): https://featherless.ai/models/maritaca-ai/S5-nano
