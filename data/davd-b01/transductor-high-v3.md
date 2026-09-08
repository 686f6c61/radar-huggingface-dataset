# Davd-b01/transductor-high-v3

## Resumen

El modelo `Davd-b01/transductor-high-v3` es un **transductor de trazas de razonamiento** desarrollado por Davd-b01 como fine-tuning del modelo base `LiquidAI/LFM2.5-2.6B`. No es un modelo de chat: su función es transformar trazas de razonamiento verbosas producidas por un modelo más potente en trazas formales de doble prueba, estructuradas con las etiquetas `<tc_think>` y `<tc_answer>`. El objetivo es generar datos de entrenamiento de alta calidad para otros modelos, no mantener conversaciones.

Con un total de 2.697.198.592 parámetros (aproximadamente 2.7B) y una arquitectura híbrida de convolución y atención, el modelo se presenta en precisión BF16, con una ventana de contexto de 8192 tokens. Su relevancia radica en la condensación de razonamiento: permite convertir razonamientos largos y con callejones sin salida en pruebas formales más cortas y rigurosas, listas para ser parseadas y almacenadas como datasets de entrenamiento en procesos de SFT o alineación.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Híbrida de convolución y atención (LFM2.5-2.6B), 30 capas |
| Parametros totales | 2.697.198.592 (2.7B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 8192 tokens |
| Tipos de cuantizacion | BF16 (repo principal); GGUF Q8_0 y Q4_K_M en repo hermano |
| Idiomas soportados | Inglés (otros idiomas dependen del modelo base) |
| Licencia | other (revisar términos en el repositorio) |
| Formato de pesos | safetensors (BF16), también disponible en GGUF |

## Arquitectura y entrenamiento

El modelo parte de `LiquidAI/LFM2.5-2.6B`, un modelo de lenguaje con arquitectura híbrida que combina capas de convolución y atención, con 30 capas en total. Sobre esta base se aplicó un proceso de fine-tuning en dos fases. Primero, un SFT con rsLoRA (r32/a64) sobre 9 proyectores (atención q/k/v/out, FFN w1/w2/w3, conv in/out; sin tocar lm_head), usando 1.579 filas de entrenamiento y 83 de validación, con aproximadamente 2 épocas y una longitud máxima de secuencia de 8192 tokens. La pérdida de entrenamiento fue 3.010 y la de validación 0.278.

Posteriormente se aplicó una alineación SimPO sin referencia (usando `CPOConfig` de TRL, con beta 2.0, gamma 0.8 y lr 8e-7), durante 1 época, con 486 pares de entrenamiento y 25 de validación, en 61 pasos. Finalmente, se fusionaron los deltas de SFT y SimPO sobre el modelo base, dando lugar al repositorio actual en precisión BF16. El modelo no resuelve problemas ni añade hechos nuevos: su función es re-expresar el contenido de la entrada con otra voz y menos tokens, manteniendo números, identificadores y veredictos idénticos.

## Capacidades

- Genera trazas formales de doble prueba con las etiquetas `<tc_think>` y `<tc_answer>`, sin preámbulos ni comentarios adicionales.
- Condensa trazas de razonamiento verbosas (incluyendo callejones sin salida y tool calls) en un formato más corto y riguroso.
- Soporta dominios como matemáticas formales, lógica científica y código con prueba.
- No es un modelo de chat: no mantiene conversaciones ni interactúa con el usuario de forma natural.
- No ejecuta herramientas; las tool calls presentes en la entrada se re-expresan, no se ejecutan.
- Entrenado principalmente en inglés; otros idiomas dependen del prior del modelo base.
- Produce salidas reproducibles con muestreo greedy, y puede usarse en bucles de rejection sampling con temperatura 0.8.

## Casos de uso

- **Generación de datasets de razonamiento matemático**: el modelo convierte trazas verbosas de un modelo fuerte en pruebas formales de doble prueba, listas para entrenar modelos más pequeños mediante SFT.
- **Condensación de trazas para alineación**: reduce razonamientos largos a un formato compacto sin perder información, útil para preparar datos de RLHF o SimPO.
- **Verificación dual en ciencia y lógica**: genera pruebas formales con comprobación independiente, lo que permite validar pasos intermedios en razonamientos científicos.
- **Generación de código con pruebas**: produce trazas que combinan razonamiento paso a paso y verificación formal, adecuadas para datasets de modelos de código.
- **Pipeline de producción con vLLM**: sirve el modelo en BF16 con prefix caching activado, ideal para generar datasets a escala con el mismo esqueleto de system prompt.
- **Rejection sampling controlado**: se puede usar en bucles de hasta 5 intentos con temperatura 0.8, quedándose con la primera salida que pase las validaciones de formato y contenido.
- **Investigación en razonamiento condensado**: permite estudiar cómo comprimir el pensamiento de modelos grandes sin perder rigor, útil para experimentos de eficiencia y alineación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada: los pesos BF16 ocupan aproximadamente 5.1 GB; con overhead de inferencia, se recomienda una GPU de 24 GB para servir el modelo con vLLM. Con la cuantización GGUF Q4_K_M, el modelo cabe en GPUs de 8-12 GB.
- GPU recomendadas: RTX 3090, RTX 4090, A100 40GB o H100 para despliegues de producción.
- Consumer GPU: sí, especialmente con los pesos GGUF cuantizados.
- Opciones de despliegue: vLLM (requiere parche del tokenizer para versiones inferiores a transformers 5), transformers, llama.cpp y Ollama para los pesos GGUF.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Voz | Longitud de pensamiento | Licencia |
|---|---|---|---|---|---|
| transductor-high-v3 | 2.7B | 8192 | Prueba formal + verificación independiente | 400-850 palabras | other |
| transductor-mid-v3 | No disponible | 8192 | Ruta directa única, pedagógica | 120-450 palabras | other |
| transductor-xhigh-v3 | No disponible | 8192 | Deliberación en 4 fases | 750-2400 palabras | other |
| LiquidAI/LFM2.5-2.6B (base) | 2.6B | No disponible | Modelo base de lenguaje | No aplica | other |

## Limitaciones y advertencias

- No es un modelo de chat: requiere el contrato de entrada TCS-IN de cuatro ranuras y el system prompt específico; un uso directo produce resultados pobres.
- Re-expresa pero no verifica: un `<tc_final>` incorrecto genera una traza fluida pero errónea. Es necesario validar los veredictos de forma independiente, especialmente en matemáticas y código.
- Entrenado principalmente en inglés; el rendimiento en otros idiomas depende de la base y puede ser inferior.
- La licencia es `other`, lo que puede implicar restricciones para uso comercial; conviene revisar los términos exactos en el repositorio.
- Existe una incompatibilidad conocida entre el `tokenizer_config.json` del modelo y vLLM 0.19 (que requiere transformers<5), por lo que hay que parchear el campo `tokenizer_class` a `PreTrainedTokenizerFast`.

## Enlaces

- Repositorio principal: https://huggingface.co/Davd-b01/transductor-high-v3
- Repositorio GGUF: https://huggingface.co/Davd-b01/transductor-high-v3-gguf
- Modelo base: https://huggingface.co/LiquidAI/LFM2.5-2.6B
