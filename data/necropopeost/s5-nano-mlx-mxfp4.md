# necropopeost/S5-nano-MLX-mxfp4

## Resumen

S5-nano-MLX-mxfp4 es una conversión no oficial del modelo maritaca-ai/S5-nano al formato MLX de Apple, cuantizada en MXFP4 (4 bits en punto flotante con microscaling). El modelo base, desarrollado por Maritaca AI, es un transformer de aproximadamente 4.200 millones de parámetros orientado a portugués de Brasil con buen desempeño también en inglés, y con una ventana de contexto de hasta 262.144 tokens. Esta conversión permite ejecutar el modelo de forma local en Macs con Apple Silicon (M1 a M4) aprovechando la memoria unificada y la GPU del sistema.

La relevancia de esta ficha radica en que el modelo original se publicó en safetensors y GGUF, pero no en MLX, el formato nativo optimizado para Apple Silicon. El autor de la conversión no entrenó ni modificó el modelo, sino que partió de los pesos BF16 originales (no del GGUF ya cuantizado) para evitar una doble pérdida de calidad. La cuantización MXFP4 emplea grupos de 32 pesos con una escala compartida de 8 bits, con un coste medido de 4,253 bits por peso.

Esta versión incluye únicamente el modelo de lenguaje (texto), el tokenizer y la plantilla de chat. No incluye el encoder de visión ni se ha probado la capa MTP de decodificación especulativa. Está pensada para `mlx-lm` y no todos los programas compatibles con MLX soportan mxfp4.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer, arquitectura `qwen35` (según model card del original) |
| Parametros totales | 4.205.751.296 (aprox. 4,2 mil millones) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | hasta 262.144 tokens en el modelo original |
| Tipos de cuantizacion | MXFP4 (4 bits, grupos de 32 pesos, 4,253 bits por peso); existe también una versión 4-bit affine del mismo autor |
| Idiomas soportados | portugués (pt), inglés (en) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors en formato MLX (librería `mlx`) |

## Arquitectura y entrenamiento

El modelo base S5-nano es un transformer de arquitectura `qwen35` con cerca de 4,2 mil millones de parámetros, según la información recogida del cartón original. Está orientado al portugués de Brasil y ofrece dos modos de uso: Think (razona antes de responder, modo por defecto) e Instruct (respuesta directa desactivando el razonamiento). El modelo original dispone de una capa MTP (multi-token prediction) para decodificación especulativa, aunque en esta conversión no se ha probado. No se dispone de detalles sobre el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO.

Esta conversión concreta no implica reentrenamiento: se parte de los pesos BF16 originales y se cuantizan a MXFP4 con grupos de 32 pesos y escala de 8 bits compartida. El resultado son pesos de 4 bits en punto flotante en lugar de la cuantización affine con enteros, escala y sesgo. El autor reporta un coste real de 4,253 bits por peso, ligeramente inferior al del 4-bit affine (4,503), lo que se traduce en archivos y memoria algo menores.

## Capacidades

- Generación de texto conversacional en portugués de Brasil e inglés.
- Modo Think: el modelo genera una cadena de razonamiento antes de la respuesta final, útil para tareas que requieren pasos intermedios.
- Modo Instruct: respuesta directa sin razonamiento explícito, activable mediante `enable_thinking=False` en la plantilla de chat.
- Razonamiento multi-paso en el modo Think, con consumo adicional de tokens.
- Soporte de plantilla de chat mediante `apply_chat_template`.
- Capacidad de visión: el modelo original dispone de encoder de visión, pero esta conversión no lo incluye; solo texto.
- Tool calling: no probado en esta conversión según el autor.
- Contextos largos: el original soporta hasta 262.144 tokens, aunque esta conversión no ha sido probada en contextos largos.
- Decodificación especulativa mediante capa MTP: presente en el original, no probada en esta conversión.

## Casos de uso

- Asistencia conversacional en portugués de Brasil: el modelo puede gestionar diálogos multi-turno en pt-BR con calidad nativa, aprovechando la ventana de contexto del original para mantener historial extenso. Adecuado para prototipos locales en Mac sin depender de la nube.
- Generación de texto y redacción en portugués: artículos, correos, resúmenes y paráfrasis. El modo Instruct con temperature 0.7 y top_p 0.8 es apropiado para respuestas directas y controladas.
- Razonamiento asistido en local: el modo Think permite resolver problemas que requieren pasos intermedios (matemáticas básicas, lógica, planificación) en un MacBook con Apple Silicon, sin enviar datos a servicios externos.
- Desarrollo y pruebas de aplicaciones MLX: sirve como modelo de referencia para validar pipelines de `mlx-lm`, plantillas de chat y parámetros de generación en hardware Apple antes de desplegar variantes mayores.
- Procesamiento de documentos en portugués con contexto largo: clasificación, extracción y resumen de textos extensos aprovechando la ventana de 262.144 tokens del original, siempre que se valide el comportamiento en contextos largos de esta cuantización.
- Experimentación con cuantización MXFP4: útil para investigadores que comparan calidad y velocidad entre 4-bit affine, MXFP4 y BF16 en Apple Silicon, con métricas de perplejidad y throughput reproducibles.
- Inferencia privada en el dispositivo: al ejecutarse localmente en un Mac, permite tratar datos sensibles en portugués o inglés sin salida a red, útil en entornos con requisitos de confidencialidad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible. El autor reporta pruebas rápidas propias en un MacBook Air M4 con 16 GB de RAM y `mlx-lm` 0.32.2, con perplejidad medida sobre `allenai/tulu-3-sft-mixture` (256 muestras de 512 tokens) y velocidad con prompt de 512 tokens y generación de 256 tokens:

| Versión | Perplejidad (menor es mejor) | Generación (tok/s) | Prompt (tok/s) | Memoria de pico |
|---|---|---|---|---|
| BF16 (original) | 7,733 ± 0,068 | no medido | no medido | no medido |
| 4-bit affine | 7,982 ± 0,070 | 34,3 | 310,6 | 3,21 GB |
| MXFP4 (esta versión) | 8,318 ± 0,074 | 36,3 | 305,0 | 3,08 GB |

La perplejidad de MXFP4 es aproximadamente un 7,6 % superior a la del BF16 original y un 4 % superior a la del 4-bit affine. La generación es cerca de un 6 % más rápida que la del 4-bit affine, con algo menos de memoria. El propio autor advierte que el dataset de perplejidad es mayoritariamente en inglés y no mide calidad en portugués; sirve solo para comparar versiones entre sí.

## Requisitos de hardware

- VRAM/RAM unificada: la memoria de pico medida en inferencia es de 3,08 GB en un MacBook Air M4 con 16 GB de RAM, para prompt de 512 tokens y generación de 256 tokens.
- GPU recomendadas: Apple Silicon (M1, M2, M3, M4) con memoria unificada. No aplica a GPU NVIDIA o AMD, ya que el formato es MLX.
- Cabe en equipos de consumo: sí, en cualquier Mac con Apple Silicon y al menos 8 GB de RAM unificada; el autor lo probó con 16 GB.
- Opciones de despliegue: `mlx-lm` (probado por el autor, versión 0.32.2). Otros programas compatibles con MLX pueden no soportar mxfp4; en ese caso el autor recomienda la versión 4-bit affine.
- Latencia y throughput: 36,3 tok/s de generación y 305,0 tok/s de procesamiento de prompt en un MacBook Air M4 con 16 GB de RAM. La velocidad depende del modelo de Mac, la RAM libre y el tamaño del contexto.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| S5-nano-MLX-mxfp4 (esta versión) | 4,2 B | 262.144 (original) | MLX safetensors, MXFP4 | Apache 2.0 | Solo texto; conversión no oficial; perplejidad 8,318 |
| S5-nano-MLX-4bit (mismo autor) | 4,2 B | 262.144 (original) | MLX safetensors, 4-bit affine | Apache 2.0 | Solo texto; perplejidad 7,982; 34,3 tok/s; 3,21 GB de pico |
| maritaca-ai/S5-nano (original) | 4,2 B | 262.144 | safetensors BF16, GGUF | Apache 2.0 | Incluye encoder de visión y capa MTP; perplejidad 7,733; máxima calidad |
| necropopeost/Qwen3.5-4B-mxfp4-MLX | no disponible (etiqueta 1B en HF) | no disponible | MLX safetensors, MXFP4 | no disponible | Modelo image-text-to-text del mismo autor; no comparable en idioma ni tarea |

No se dispone de información sobre otros modelos comparables de la misma categoría (4 B, portugués, Apple Silicon) en la búsqueda realizada.

## Limitaciones y advertencias

- Conversión no oficial: el autor no tiene vínculo con Maritaca AI y no entrenó ni modificó el modelo; para evaluación completa debe consultarse el cartón original.
- Solo texto: el encoder de visión del original no está incluido en esta conversión.
- Capa MTP no probada: la decodificación especulativa del original no ha sido validada aquí.
- Tool calling no probado: no hay evidencia de que funcione correctamente en esta cuantización.
- Contextos largos no probados: aunque el original soporta 262.144 tokens, esta conversión no ha sido validada en ventanas extensas.
- Compatibilidad limitada: probado solo con `mlx-lm` 0.32.2; otros lectores MLX pueden no soportar mxfp4. Alternativa recomendada por el autor: la versión 4-bit affine.
- Pérdida de calidad medible: perplejidad un 7,6 % superior al BF16 original y un 4 % superior al 4-bit affine, según pruebas del autor.
- Evaluación de perplejidad sesgada al inglés: el dataset usado es mayoritariamente en inglés y no mide calidad en portugués.
- Riesgo de alucinación: no cuantificado en la información disponible; aplicable como en cualquier modelo generativo de este tamaño.
- Sesgos: no documentados en la información disponible.
- Licencia Apache 2.0: permite uso comercial, pero debe conservarse la atribución correspondiente y verificarse las condiciones del modelo base.
- Idioma: foco en portugués de Brasil e inglés; no se documenta soporte para otras lenguas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/necropopeost/S5-nano-MLX-mxfp4
- Modelo base original: https://huggingface.co/maritaca-ai/S5-nano
- Versión 4-bit affine del mismo autor: https://huggingface.co/necropopeost/S5-nano-MLX-4bit
- Perfil del autor en Hugging Face: https://huggingface.co/necropopeost
- Modelos del autor: https://huggingface.co/necropopeost/models
