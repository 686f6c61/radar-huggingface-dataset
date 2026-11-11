# mazuj2/Qwen3.8-27b-merged-qwopus-thinkingcap-swift1.5

## Resumen

Qwen3.8-27B-Qwopus-Swift-ThinkingCap es un modelo de lenguaje de 27.000 millones de parámetros obtenido mediante un merge de tipo `dare_ties` sobre el modelo base Qwen/Qwen3.8-27B, que emplea una arquitectura híbrida Mamba2 + atención. Lo desarrolla el usuario mazuj2 y combina tres fine-tunes complementarios: Jackrong/Qwopus3.8-27B-Coder-Flash (orientado a código y diseño front-end), ukisai/Swift-1.5-Qwen3.8-27b (destilado con RL para ejecución sin bucles) y bottlecapai/ThinkingCap-Qwen3.8-27B (guardarraíl contra espirales de razonamiento).

El objetivo del merge es conservar el razonamiento estructurado con bloques `<think>` del modelo base, reducir las autocorrecciones repetitivas y los bucles de fallo típicos de las variantes de 27B sin fusionar, y mejorar la generación de código de producción (HTML/CSS/JS y proyectos multiarchivo). Además, preserva la cabeza nativa de Multi-Token Prediction (`nextn` / MTP) del modelo original, lo que permite decodificación especulativa sin necesidad de un modelo borrador separado.

Su relevancia práctica reside en la combinación de MTP nativo, un imatrix calibrado específicamente sobre código y trazas de uso de herramientas, y una receta de merge reproducible documentada con YAML de mergekit. La licencia es Apache 2.0 y el autor publica pesos en formato transformers y GGUF, aunque el modelo solo declara soporte de inglés.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Híbrida Mamba2 + atención (base Qwen3.8-27B), con cabeza MTP `nextn` |
| Parametros totales | 27 000 millones (27B nominales) |
| Parametros activos | no disponible (no es MoE según la información proporcionada) |
| Longitud de contexto | 65 536 tokens (valor de `-c` recomendado en llama.cpp); contexto nativo del base no disponible |
| Tipos de cuantizacion | GGUF Q8_0 con imatrix (publicado); otras cuantizaciones no disponibles |
| Idiomas soportados | en (inglés) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (transformers, bfloat16) y GGUF (Q8_0 imatrix) |

## Arquitectura y entrenamiento

El modelo es un merge `dare_ties` en `bfloat16` con `normalize: true` e `int8_mask: true`, anclado sobre Qwen/Qwen3.8-27B, cuya arquitectura es híbrida Mamba2 + atención. La receta asigna densidades y pesos normalizados a cada componente: Qwopus3.8-27B-Coder-Flash con densidad 0,75 y peso 0,60; Swift-1.5-Qwen3.8-27b con densidad 0,45 y peso 0,25; y ThinkingCap-Qwen3.8-27B con densidad 0,35 y peso 0,15. El peso dominante del fine-tune de código busca preservar deltas creativos y arquitectónicos de baja magnitud, mientras que los otros dos aportan prevención de bucles y control del razonamiento.

La innovación técnica principal es la preservación de los 15 tensores `mtp.*` (`blk.64.nextn.*`) del modelo base, trasplantados directamente al checkpoint fusionado. Esto habilita decodificación especulativa sin pérdida con `--spec-type draft-mtp` en llama.cpp, sin archivo de modelo borrador adicional. El autor publica además un imatrix calibrado sobre 419 fragmentos de 512 tokens de contexto con formato ChatML, compuestos por razonamiento de código, trazas de uso de herramientas y prompts técnicos generales (excluyendo escritura creativa y roleplay), con una perplejidad de calibración de 3,4195 ± 0,02407 en BF16.

## Capacidades

- Generación de texto y razonamiento estructurado con bloques `<think>` para planificación de cadena de pensamiento.
- Generación de código de producción: HTML, CSS, JavaScript y proyectos multiarchivo, con énfasis en estética y arquitectura front-end/full-stack.
- Prevención de bucles de autocorrección y espirales de razonamiento, gracias al componente ThinkingCap y al fine-tune destilado con RL.
- Decodificación especulativa nativa mediante la cabeza MTP integrada, sin modelo borrador externo.
- Uso de herramientas y trazas de tool-use, dado que el imatrix se calibró sobre trazas de uso de herramientas.
- Razonamiento multi-paso orientado a tareas técnicas y de ingeniería de software.
- Capacidades multilingües: solo se declara inglés; no hay evidencia de soporte de otros idiomas.
- No se documentan capacidades de visión ni de audio.

## Casos de uso

- Generación de interfaces web: el modelo produce HTML, CSS y JavaScript limpios de forma directa, adecuado para prototipado rápido de dashboards y páginas responsivas, como ilustra el ejemplo de prompt de la model card.
- Asistente de codificación en IDE: con contexto de 65 536 tokens puede mantener en memoria varios archivos de un proyecto y generar código multiarchivo coherente sin perder referencias entre módulos.
- Generación de código en pipelines de CI/CD: su soporte de tool-use y su calibración sobre trazas técnicas permiten integrarlo en flujos de revisión automática, generación de tests o parcheo de errores.
- Razonamiento arquitectónico: los bloques `<think>` permiten obtener planes de diseño de software explícitos y auditables antes de la implementación, útil en documentación técnica y revisiones de arquitectura.
- Inferencia local de alta velocidad: con la cabeza MTP y el GGUF Q8_0 imatrix, un servidor llama.cpp alcanza 40-60 tokens/s en código estructurado, viable para asistentes interactivos en estaciones de trabajo con GPU de consumo.
- Automatización de tareas técnicas multi-paso: la combinación de razonamiento estructurado y prevención de bucles lo hace adecuado para agentes que ejecutan secuencias largas de pasos sin degradarse en autocorrecciones infinitas.
- Despliegue en entornos con requisitos de licencia permisiva: al ser Apache 2.0, puede integrarse en productos comerciales sin las restricciones de licencias copyleft.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

Los únicos datos de rendimiento publicados son métricas de inferencia y calibración del autor:

| Metrica | Valor |
|---|---|
| Perplejidad de calibración (BF16, 419 chunks @ 512 ctx) | 3,4195 ± 0,02407 |
| Throughput en HTML/código estructurado (Q8_0, `draft-mtp`, `n-max 5`) | ~40-60 tokens/s |
| Throughput en texto general y razonamiento (Q8_0) | ~25-40 tokens/s |

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; para 27B en bfloat16 se requieren del orden de 54 GB solo de pesos, y en Q8_0 alrededor de 27-30 GB, aunque el autor no publica cifras.
- GPU recomendadas: no especificadas por el autor; por tamaño, un Q8_0 encaja en GPUs de 32-48 GB (A100 40/80 GB, H100, RTX 6000 Ada) y el bfloat16 requiere 80 GB o reparto multi-GPU.
- GPU de consumo: no se confirma que quepa en GPUs de consumo de 24 GB en Q8_0; cuantizaciones menores no están publicadas.
- Opciones de despliegue: llama.cpp (`llama-server`) con `-ngl 99`, `-fa on`, `-ctk q8_0 -ctv q8_0` y decodificación especulativa `--spec-type draft-mtp`; también compatible con transformers.
- Parámetros de muestreo recomendados: `--temp 0.6 --top-p 0.95 --top-k 20 --min-p 0.0`.
- Latencia y throughput: 40-60 tokens/s en código estructurado y 25-40 tokens/s en texto general con Q8_0 imatrix y MTP activado, según el autor.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| Qwen3.8-27B-Qwopus-Swift-ThinkingCap (este) | 27B | 65 536 (recomendado) | Apache 2.0 | Merge dare_ties con MTP nativo e imatrix de código |
| Qwen/Qwen3.8-27B (base) | 27B | no disponible | Apache 2.0 | Arquitectura híbrida Mamba2 + atención; cabeza MTP original |
| Jackrong/Qwopus3.8-27B-Coder-Flash | 27B | no disponible | no disponible | Fine-tune orientado a código y diseño front-end |
| ukisai/Swift-1.5-Qwen3.8-27b | 27B | no disponible | no disponible | Destilado con RL para ejecución sin bucles |
| bottlecapai/ThinkingCap-Qwen3.8-27B | 27B | no disponible | no disponible | Guardarraíl de razonamiento |

No se dispone de datos de benchmarks que permitan comparar rendimiento entre estos modelos; la comparativa se limita a parámetros, licencia y propósito declarado.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados por el autor; al entrenarse principalmente sobre datos técnicos y de código, puede presentar sesgos hacia dominios de ingeniería de software.
- Riesgo de alucinación: no evaluado; no se han publicado benchmarks que cuantifiquen la fiabilidad factual.
- Idioma: solo se declara inglés; el rendimiento en castellano u otros idiomas no está verificado.
- Longitud de contexto: el valor de 65 536 tokens procede de la configuración recomendada de llama.cpp, no de una especificación oficial del modelo base.
- Licencia: Apache 2.0 permite uso comercial, pero las licencias de los tres fine-tunes fusionados no se detallan en la información disponible, lo que conviene verificar antes de un despliegue comercial.
- Producción: el modelo tiene 0 descargas y 0 likes, fue creado en noviembre de 2026 y no cuenta con validación de la comunidad ni benchmarks independientes; su uso en producción requiere evaluación propia.
- El imatrix excluye dominios de escritura creativa y roleplay, por lo que su rendimiento en esos casos puede ser inferior.
- El rendimiento de 40-60 tokens/s depende de activar la decodificación especulativa MTP; sin ella, el throughput será menor.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/mazuj2/Qwen3.8-27b-merged-qwopus-thinkingcap-swift1.5
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Fine-tune de código: https://huggingface.co/Jackrong/Qwopus3.8-27B-Coder-Flash
- Fine-tune de ejecución: https://huggingface.co/ukisai/Swift-1.5-Qwen3.8-27b
- Fine-tune de razonamiento: https://huggingface.co/bottlecapai/ThinkingCap-Qwen3.8-27B
- Corpus de calibración imatrix: https://huggingface.co/mahdisml/Uncensored-Imatrix-Calibration-Mixed-Data
- mergekit (herramienta de merge): https://github.com/arcee-ai/mergekit
- llama.cpp (inferencia GGUF y MTP): https://github.com/ggml-org/llama.cpp
