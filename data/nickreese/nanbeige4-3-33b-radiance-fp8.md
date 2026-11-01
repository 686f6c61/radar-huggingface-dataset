# nickreese/nanbeige4.3-33b-radiance-fp8

## Resumen

Nanbeige4.3-33B es un modelo de lenguaje de tipo transformer denso desarrollado por Nanbeige, con aproximadamente 33 mil millones de parámetros y soporte para inglés y chino. Esta ficha concreta no es el modelo original, sino una conversión comunitaria publicada por Nicholas Reese (nickreese) para el motor de inferencia nativo Radiance, en formato block FP8. No se trata de un fine-tune ni de una versión oficial del autor original, sino de una cuantización lista para ejecutar en Radiance.

La relevancia de esta publicación es doble: por un lado, ofrece un artefacto empaquetado en un formato propietario del motor Radiance (extensión `.rad`) que no es compatible con Transformers, GGUF, MLX ni vLLM; por otro, documenta con detalle el proceso de conversión, incluyendo un padding estructural de cabezas de atención (de 56/8 a 64/8) para adaptarse a los kernels AMD del motor, y un ajuste del token BOS para preservar la paridad con Hugging Face en conversaciones.

El modelo base anuncia 512K tokens de contexto, aunque la configuración de servicio validada por el autor limita la ventana a 262.144 tokens. La licencia es Apache 2.0. Al tratarse de una conversión con cuantización FP8 sin calibración (round-to-nearest), la precisión es intrínsecamente lossy respecto a los pesos BF16 originales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (plugin `llama_dense_fp8` en Radiance) |
| Parametros totales | ~33B (modelo base Nanbeige4.3-33B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 512K anunciados por el modelo base; 262.144 tokens configurados en la validación de servicio |
| Tipos de cuantizacion | FP8 E4M3 con bloques 128×128 y escalas BF16 en pesos lineales del decoder; embeddings, LM head y norms en BF16; KV cache FP8 |
| Idiomas soportados | inglés (en), chino (zh) |
| Licencia | Apache 2.0 |
| Formato de pesos | `.rad` (formato nativo del motor Radiance); no compatible con Transformers, GGUF, MLX ni vLLM |

| Parametro adicional | Valor |
|---|---|
| Tamano del fichero | 36.286.707.712 bytes (33,79 GiB) |
| SHA-256 | `eecb7f1382bbfc547641d1636fd3a5ff36bc91193b795d1f5563559f02790e12` |
| Revision del checkpoint fuente | `c1093c501cc6460427c0ac634db7223d0450c0ee` |
| Pesos fuente | BF16 |
| Metodo de cuantizacion | Round-to-nearest, sin dataset de calibracion ni fine-tuning |
| Cabezas de atencion | 64 query / 8 KV (GQA 8) tras padding estructural desde 56/8 |
| Version de Radiance validada | v1.12.0 con PR #311 |
| Hardware de validacion | 2× AMD Radeon AI PRO R9700 32 GB por motor |

## Arquitectura y entrenamiento

El modelo base Nanbeige4.3-33B es un transformer denso de aproximadamente 33B parámetros. La información disponible no detalla la composición del dataset de entrenamiento, el número de tokens vistos, ni si se aplicaron fases de RLHF o DPO; estos datos deben consultarse en la model card del modelo original de Nanbeige. Lo que sí se documenta es la arquitectura de atención: 56 cabezas de query y 8 de KV (GQA 7) en el checkpoint original, con tokenizador basado en Metaspace y token BOS `<|im_start|>`.

La conversión a Radiance introduce dos modificaciones estructurales. Primero, un padding de cabezas de atención de 56/8 a 64/8 mediante `tools/pad_tp.py`: se añade una cabeza de query cero a cada grupo KV y columnas cero correspondientes en la proyección de salida, de modo que las cabezas añadidas contribuyen exactamente cero antes de cuantizar. La verificación reportó 263 tensores intactos byte a byte y 208 tensores con padding exacto, sin problemas. Segundo, se desactiva `add_bos_token` en el tokenizer para que la plantilla de chat sin modificar aporte el `<|im_start|>`, evitando que la ruta de BOS automático de Radiance v1.12.0 altere el token `system` bajo el preprocesado Metaspace. La conversión se realizó con NumPy 2.5.4 y alcanzó un pico de ~66 GB de RAM.

## Capacidades

- Generación de texto en inglés y chino.
- Modo de razonamiento explícito: la plantilla soporta `enable_thinking` y `preserve_thinking`, y el razonamiento se expone por separado como `reasoning_content`.
- Tool calling / function calling mediante el formato XML definido en la plantilla de chat embebida.
- Conversaciones multi-turno con plantilla de chat original preservada y paridad de tokens verificada frente a Hugging Face.
- Contexto largo: hasta 262.144 tokens en la configuración de servicio validada (512K anunciados por el modelo base).
- Decodificación especulativa: no incluida en esta conversión (el autor indica `--num-speculative-tokens 0` y ausencia de draft model).
- Capacidades multimodales, de audio o de visión: no disponibles en la información proporcionada.

## Casos de uso

- Asistentes conversacionales de contexto largo: con 262.144 tokens de ventana configurada, el modelo puede mantener hilos de conversación extensos o procesar documentos completos dentro de una sola sesión, siempre que se despliegue en Radiance con la configuración validada.
- Procesamiento de documentación técnica en inglés y chino: el soporte bilingüe permite resumir, extraer y transformar documentación en ambos idiomas sin modelos auxiliares.
- Automatización con tool calling: la plantilla XML de función permite integrar el modelo en flujos que invocan APIs externas, bases de datos o servicios internos, exponiendo las llamadas como parte estructurada de la respuesta.
- Razonamiento con traza separada: el campo `reasoning_content` permite auditar el proceso de razonamiento independientemente de la respuesta final, útil en entornos donde se requiere trazabilidad.
- Despliegue en infraestructura AMD: al estar validado sobre 2× AMD Radeon AI PRO R9700 32 GB con Radiance v1.12.0, encaja en entornos que ya operan GPUs AMD y quieren evitar la pila CUDA.
- Evaluación comparativa de cuantización FP8: sirve como referencia para medir la degradación de un modelo 33B al pasar de BF16 a FP8 block 128×128 sin calibración, en tareas de generación y razonamiento.
- Servicio con caché KV en FP8: el consumo aproximado de 104 KiB por token en la KV cache permite planificar concurrencia y retención de contexto en despliegues con presupuesto de VRAM ajustado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor no reporta métricas de MMLU, HumanEval, GSM8K ni comparaciones cuantitativas con otros modelos; únicamente documenta verificaciones de integridad estructural (paridad de tokens de chat, padding exacto de tensores) y el hardware de validación.

## Requisitos de hardware

- VRAM estimada para inferencia: el fichero de pesos ocupa 33,79 GiB; con KV cache FP8 a ~104 KiB por token, la VRAM adicional escala con la longitud de contexto y el número de secuencias concurrentes. Para 262.144 tokens de contexto completo en una sola secuencia, la KV cache requeriría aproximadamente 26 GiB adicionales, además de overhead del runtime.
- GPU recomendadas: la única configuración validada por el autor es 2× AMD Radeon AI PRO R9700 32 GB por motor, con tensor parallelism `--tp 2`.
- Compatibilidad con GPU de consumo: no establecida. El autor indica explícitamente que otros hardware y versiones del runtime no han sido verificados por esta release.
- Opciones de despliegue: exclusivamente el motor Radiance v1.12.0 (imagen `stilldeadcode/radiance:1.12.0` con el ejecutable parcheado con PR #311). No es compatible con vLLM, llama.cpp, Ollama, TGI, Transformers, GGUF ni MLX.
- Latencia y throughput: no disponibles en la información proporcionada.
- Memoria durante la conversión (referencia para reproducibilidad): pico de ~66 GB de RAM.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| nickreese/nanbeige4.3-33b-radiance-fp8 | ~33B | 262.144 configurado (512K anunciado) | `.rad` (Radiance) | Apache 2.0 | Hugging Face, conversión comunitaria |
| Nanbeige/Nanbeige4.3-33B | ~33B | 512K anunciado | BF16 (Transformers) | Apache 2.0 | Hugging Face, oficial |
| Alternativas de ~30B denso con contexto largo | no disponible | no disponible | no disponible | no disponible | no disponible |

La comparación directa con otras alternativas de la misma categoría no está disponible en la información proporcionada. La diferencia principal frente al modelo base es el formato (`.rad` propietario de Radiance), la cuantización FP8 con pérdida y el padding estructural de cabezas de atención; el modelo base en BF16 conserva la configuración original de 56/8 cabezas y no requiere Radiance.

## Limitaciones y advertencias

- Cuantización con pérdida: FP8 round-to-nearest sin dataset de calibración ni fine-tuning; la fidelidad respecto a los pesos BF16 originales no está cuantificada.
- Formato no estándar: el fichero `.rad` solo funciona con Radiance; no se puede cargar en Transformers, vLLM, llama.cpp, Ollama, TGI, GGUF ni MLX.
- Dependencia de un parche concreto: la validación requiere Radiance v1.12.0 con PR #311; la imagen estándar no incluye el parche. Otras versiones del runtime no han sido verificadas.
- Hardware restringido: solo se ha validado sobre 2× AMD Radeon AI PRO R9700 32 GB; no hay garantías en otras GPU ni en configuraciones con distinto número de tarjetas.
- Caveat de completaciones crudas: al fijar `add_bos_token: false`, el endpoint `/v1/completions` ya no antepone BOS automáticamente; la codificación de prompts crudos puede no coincidir con `encode(add_special_tokens=True)` de Hugging Face.
- Contexto efectivo limitado: aunque el modelo base anuncia 512K, la configuración de servicio valida 262.144 tokens y el autor no garantiza calidad ni capacidad a plena ventana.
- Concurrencia y memoria: la KV cache FP8 consume ~104 KiB por token; contextos largos y alta concurrencia agotan la VRAM rápidamente.
- Idiomas: solo inglés y chino; no hay soporte declarado para castellano ni otros idiomas.
- Sesgos y alucinaciones: no se documentan evaluaciones de sesgo ni de tasa de alucinación en la información disponible; deben asumirse los riesgos habituales de un modelo de lenguaje de 33B sin datos específicos.
- Licencia Apache 2.0: permite uso comercial, pero el autor de la conversión no ofrece garantías sobre el artefacto y recomienda verificar la integridad con SHA-256 antes de usarlo.

## Enlaces

- Repositorio Hugging Face de la conversión: https://huggingface.co/nickreese/nanbeige4.3-33b-radiance-fp8
- Modelo base en Hugging Face: https://huggingface.co/Nanbeige/Nanbeige4.3-33B
- Motor Radiance (Codeberg): https://codeberg.org/StillDeadcode/radiance
- PR #311 de Radiance (corrección de gramática de repetición acotada): https://codeberg.org/StillDeadcode/radiance/pulls/311
- Sitio del autor de la conversión: https://nicholasreese.com
- Organización USA Arms: https://usaarms.com
