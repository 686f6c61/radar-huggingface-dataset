# kelsey1337/DaisyRose-27B-Heretic-v2

## Resumen

DaisyRose-27B-Heretic-v2 es una versión "abliterada" (decensurada) del modelo RadixArk/DaisyRose-27B, publicada por el usuario kelsey1337 en Hugging Face. La abliteración se ha realizado con la herramienta Heretic 2.1.0 mediante Arbitrary-Rank Ablation (ARA) sobre los pesos completos en BF16, con el objetivo declarado de eliminar el comportamiento de rechazo (refusal) del modelo base. El resultado publicado es un checkpoint de 27.356.728.560 parámetros (unos 27,36 mil millones) en formato safetensors, con un repositorio de 54,7 GB que corresponde a pesos BF16.

El modelo se distribuye bajo licencia Apache 2.0 e incluye las etiquetas `qwen3_5`, `qwen3.8`, `heretic`, `abliterated` y `uncensored`, lo que sugiere una arquitectura de la familia Qwen, aunque la model card no detalla la arquitectura interna, la longitud de contexto ni los idiomas soportados. La relevancia de esta ficha radica en documentar un caso de fine-tuning por abliteración con métricas de evaluación explícitas (tasa de rechazos y divergencia KL) y en advertir de los riesgos de seguridad que conlleva eliminar los comportamientos de rechazo en un modelo de 27B.

La publicación es de noviembre de 2026, cuenta con cero descargas y cero "likes" en el momento de la consulta, y el autor ofrece cuantizaciones GGUF en un repositorio separado. La model card es inusualmente transparente sobre el proceso: documenta 99 trials de Optuna, el trial seleccionado (#91) y el uso de asistentes de IA (Claude Opus 5.5 y Gemini 4 Neon) para operar el pipeline.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (familia Qwen, segun tags `qwen3_5`/`qwen3.8`); detalles no disponibles |
| Parametros totales | 27.356.728.560 (~27,36B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | BF16 en el repo principal; GGUF en repositorio separado (tipos concretos no disponibles) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (BF16); GGUF en repo aparte |

## Arquitectura y entrenamiento

La información disponible no describe la arquitectura interna del modelo base más allá de las etiquetas de la familia Qwen (`qwen3_5`, `qwen3.8`). Se trata de un transformer de aproximadamente 27,36 mil millones de parámetros, con pesos publicados en BF16 y un tamaño de repositorio de 54,7 GB coherente con esa precisión. No se especifican número de tokens de entrenamiento, composición del dataset, ni si hubo RLHF o DPO en el modelo base.

La innovación técnica documentada es el proceso de abliteración: Heretic 2.1.0 con Arbitrary-Rank Ablation (ARA), usando dos scorers (tasa de palabras clave de rechazo, con una lista recortada de 8 marcadores de matices eliminados, y divergencia KL). Se ejecutaron 99 trials de Optuna; el trial seleccionado fue el #91, con 0/100 rechazos contados por palabras clave recortadas y una divergencia KL de 0,0715. El modelo base original presentaba 98/100 rechazos en la línea base. Algunos trials se sembraron manualmente en torno a los parámetros publicados de una build AWQ previa de DaisyRose Heretic. La verificación manual con la lista completa de palabras clave de Heretic encontró 0 frases de rechazo duras (54 respuestas solo con palabras de matiz y 46 limpias). El log completo del run se incluye como `heretic-run.log` en el repositorio GGUF.

## Capacidades

- Generación de texto y razonamiento general, heredados del modelo base DaisyRose-27B.
- Comportamiento de rechazo eliminado: el modelo responde a peticiones que el modelo base rechazaría (98/100 rechazos en la línea base frente a 0/100 en el trial seleccionado).
- Respuestas con matices o advertencias: la verificación manual detectó 54 de 100 respuestas con palabras de matiz (caveat) sin frase de rechazo dura.
- Capacidades multilingües: no disponibles en la información proporcionada.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades especiales (thinking mode, visión, audio): no disponibles.

## Casos de uso

- Investigación sobre alineación y abliteración: el modelo sirve como caso de estudio reproducible para medir el efecto de ARA sobre la tasa de rechazos y la divergencia KL, gracias al log completo del run incluido en el repositorio GGUF.
- Evaluación de robustez frente a jailbreaks: permite comparar el comportamiento del modelo base frente al abliterado en un mismo conjunto de prompts, con métricas cuantificadas (98/100 frente a 0/100 rechazos).
- Generación creativa sin restricciones de contenido: escritura de ficción, guiones o narrativa que el modelo base podría rechazar por temática sensible, siempre que el operador asuma la responsabilidad editorial.
- Red teaming de sistemas de moderación: uso del modelo como generador adversarial para probar clasificadores de contenido y filtros de seguridad en pipelines propios.
- Experimentos de destilación o fine-tuning posteriores: al estar en BF16 y con licencia Apache 2.0, puede servir como punto de partida para ajustes supervisados en dominios específicos.
- Benchmarking de cuantizaciones: la existencia de un repositorio GGUF separado permite comparar la degradación de calidad entre BF16 y distintas cuantizaciones en tareas de generación libre.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card solo reporta métricas del proceso de abliteración (tasa de rechazos y divergencia KL), no resultados en MMLU, HumanEval, GSM8K ni similares.

| Metrica | Modelo base (DaisyRose-27B) | Trial #91 (Heretic v2) |
|---|---|---|
| Rechazos (lista recortada) | 98/100 | 0/100 |
| Divergencia KL | referencia | 0,0715 |
| Frases de rechazo duras (lista completa, diag manual) | no disponible | 0/100 |
| Respuestas solo con matices (diag manual) | no disponible | 54/100 |
| Respuestas limpias (diag manual) | no disponible | 46/100 |

## Requisitos de hardware

- VRAM estimada en BF16: aproximadamente 54,7 GB solo para pesos, más overhead de activaciones y caché KV; en la práctica requiere 64 GB o más de VRAM para inferencia cómoda.
- VRAM estimada en cuantizaciones GGUF: no disponible el detalle de tipos, pero las cuantizaciones de 4 bits de un modelo de 27B suelen situarse en el rango de 15-17 GB.
- GPU recomendadas para BF16: A100 80 GB, H100 80 GB, o configuraciones multi-GPU en consumer (por ejemplo, dos RTX 4090 de 24 GB con tensor parallelism).
- Cabe en consumer GPU: en BF16 no cabe en una RTX 4090 de 24 GB; con cuantización GGUF de 4 bits es plausible en GPUs de 24 GB, aunque no se confirma en la información disponible.
- Opciones de despliegue: llama.cpp u Ollama para los GGUF; vLLM o TGI para BF16 en GPUs de datacenter. No se confirma compatibilidad explícita con cada framework.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Estado de rechazo | Disponibilidad |
|---|---|---|---|---|---|
| DaisyRose-27B-Heretic-v2 | ~27,36B | no disponible | Apache 2.0 | 0/100 (lista recortada) | safetensors BF16 + GGUF |
| DaisyRose-27B (base) | ~27,36B | no disponible | no disponible | 98/100 (lista recortada) | Hugging Face |
| Otras builds DaisyRose Heretic (AWQ) | ~27,36B | no disponible | no disponible | no disponible | mencionada en la model card |

No se dispone de datos de benchmarks comparativos con otros modelos de la misma categoría en la información proporcionada.

## Limitaciones y advertencias

- La abliteración elimina el comportamiento de rechazo, lo que incrementa la probabilidad de seguir instrucciones maliciosas o inyectadas a través de contenido no confiable (páginas web, ficheros de repositorio, salida de herramientas).
- El propio autor advierte de no exponer el modelo a entradas no confiables junto con credenciales activas o acceso a shell sin sandbox.
- Riesgo de alucinación: no cuantificado en la información disponible; al ser un modelo de 27B sin benchmarks publicados, no puede evaluarse su fiabilidad factual.
- Idiomas soportados y longitud de contexto no documentados, lo que dificulta planificar su uso en producción multilingüe o con ventanas largas.
- La licencia Apache 2.0 permite uso comercial, pero el operador asume la responsabilidad legal y ética del contenido generado por un modelo sin rechazos.
- El modelo tiene cero descargas y cero "likes" en el momento de la consulta, sin validación independiente por parte de la comunidad.
- La model card indica que el proceso fue operado por asistentes de IA (Claude Opus 5.5 y Gemini 4 Neon); la selección del trial y la monitorización no fueron manuales, aunque el log se publica sin editar.
- El repositorio principal solo contiene BF16; para despliegues con VRAM limitada hay que acudir al repositorio GGUF separado, cuyos tipos de cuantización no se detallan en la información disponible.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/kelsey1337/DaisyRose-27B-Heretic-v2
- Modelo base: https://huggingface.co/RadixArk/DaisyRose-27B
- Cuantizaciones GGUF: https://huggingface.co/kelsey1337/DaisyRose-27B-Heretic-v2-GGUF
- Heretic (herramienta de abliteración): https://github.com/p-e-w/heretic
