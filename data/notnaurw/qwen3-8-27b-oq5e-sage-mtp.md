# notnaurw/Qwen3.8-27B-oQ5e-SAGE-mtp

## Resumen

El modelo `notnaurw/Qwen3.8-27B-oQ5e-SAGE-mtp` es una cuantización en 5 bits (oQ5e) del modelo vision-language `Qwen/Qwen3.8-27B`, desarrollada por el usuario notnaurw mediante el backend `oQe` de la librería oMLX y un pipeline adicional llamado SAGE (Streamed, Activation-guided, Grid allocation, Error compensation). El objetivo es reducir el peso del modelo de 27.78 mil millones de parámetros a unos 20.3 GB (18.90 GiB) manteniendo la máxima fidelidad posible al checkpoint original en bf16, sin alterar el presupuesto de bits, los tamaños de grupo ni el tamaño final del archivo.

El modelo base Qwen3.8-27B es un modelo denso híbrido con atención lineal en 48 de sus 64 capas, una torre de visión integrada y un cabezal MTP (multi-token prediction) para decodificación especulativa. Esta cuantización conserva los cabezales MTP intactos, lo que permite que servidores que los utilizan sigan funcionando sin cambios. La relevancia actual radica en que ofrece una alternativa de alta fidelidad para ejecutar un modelo de 27B con capacidades multimodales en hardware de consumo, especialmente en entornos Apple Silicon gracias al formato MLX.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | qwen3_5 (dense hybrid, 48/64 capas con atencion lineal, vision tower, MTP) |
| Parametros totales | 27.78 B (modelo base) |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | 262 144 tokens nativo, extensible a 1 048 576 (segun vLLM recipes) |
| Tipos de cuantizacion | 5-bit base (oQ5e) con 70 overrides por tensor, group size 64 |
| Idiomas soportados | no disponible (el modelo base Qwen3.8-27B es multilingue) |
| Licencia | Apache-2.0 |
| Formato de pesos | MLX safetensors (2209 tensores, 5.756.598.512 parametros cuantizados almacenados) |

## Arquitectura y entrenamiento

El modelo base Qwen3.8-27B emplea una arquitectura híbrida que combina atención lineal en 48 de sus 64 capas con atención completa en las restantes, lo que reduce el coste computacional en secuencias largas. Incluye una torre de visión que permite procesar imágenes y vídeo, y un cabezal MTP (multi-token prediction) que actúa como modelo de draft para decodificación especulativa, acelerando la generación. El contexto nativo es de 262 144 tokens, ampliable a 1 048 576.

La cuantización se realizó con oMLX 0.6.3rc1 y el pipeline SAGE, que consta de cuatro etapas: calibración activada por activaciones, asignación de bits mediante rejilla, y compensación de errores de segundo orden por capas. Según la model card, el resultado final reduce la divergencia KL respecto al bf16 en un 21.0% en comparación con una cuantización oQ5e estándar, manteniendo el mismo presupuesto de bits (5.8432 bpw) y el mismo tamaño de archivo. No se dispone de información sobre el entrenamiento del modelo base (datos, tokens, RLHF, etc.) en la documentación proporcionada.

## Capacidades

- Generación de texto y razonamiento: el modelo base es capaz de tareas de lenguaje general, razonamiento lógico y matemático.
- Comprensión de imágenes y vídeo: al ser un modelo vision-language, puede procesar entradas multimodales (image-text-to-text).
- Generación de código: el modelo base Qwen3.8-27B está entrenado para tareas de programación, aunque no se especifican benchmarks concretos.
- Multi-token prediction (MTP): los cabezales MTP se conservan intactos, lo que permite decodificación especulativa y mejora la velocidad de inferencia en servidores compatibles.
- Soporte de tool calling y agentes: no se menciona explícitamente en la documentación, pero es una capacidad habitual en la familia Qwen3.8; no confirmada para esta cuantización.
- Multilingüismo: el modelo base soporta múltiples idiomas, aunque la lista exacta no está disponible en la información proporcionada.

## Casos de uso

- Asistente multimodal local: ejecutar el modelo en un Mac con Apple Silicon (gracias al formato MLX) para responder preguntas sobre imágenes, extraer información de capturas o describir contenido visual sin depender de APIs externas.
- Generación de código asistida en entornos sin conexión: usar el modelo como autocompletador o generador de fragmentos de código en IDEs locales, aprovechando su capacidad de razonamiento y su ventana de contexto de 262K tokens para mantener el contexto del proyecto.
- Análisis de documentos largos con imágenes: procesar manuales técnicos, informes o artículos que combinen texto e imágenes, gracias a la ventana de contexto amplia y la entrada multimodal.
- Decodificación especulativa en servidores de inferencia: al conservar los cabezales MTP, el modelo puede integrarse en stacks como vLLM o MLX-LM para acelerar la generación en producción sin perder calidad.
- Prototipado de agentes conversacionales: usar el modelo como base para chatbots con memoria de largo plazo, dado su contexto nativo de 262K tokens, en entornos donde se requiera control total sobre los datos.
- Evaluación de técnicas de cuantización: el pipeline SAGE y las métricas de fidelidad (head-KL, top-1 agreement) lo convierten en un caso de estudio para investigadores interesados en compresión de modelos y su impacto en la distribución de probabilidad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de tareas (MMLU, HumanEval, GSM8K, etc.) en la información disponible. La model card únicamente reporta métricas de fidelidad de la cuantización frente al checkpoint bf16, medidas sobre un corpus de código multilingüe (128 muestras × 1024 tokens, batch 4, top-1024 logits):

| Build | bpw | head-KL (↓) | top-1 agreement (↑) | vs stock (delta) |
|---|---|---|---|---|
| stock oMLX `oQ5e` | 5.8432 | 0.01509 | 0.9360 | — |
| SAGE (calibración) | 5.8432 | 0.01462 | 0.9366 | +3.1% |
| SAGE (grid allocation) | 5.8432 | 0.01375 | 0.9389 | +8.9% |
| SAGE (final) | 5.8432 | 0.01193 | 0.9429 | +21.0% |

Estas métricas indican que la cuantización final reproduce mejor la distribución del modelo original en los 1024 logits más probables, pero no garantizan un rendimiento superior en tareas concretas. No se evaluó la parte de visión.

## Requisitos de hardware

- Tamaño del repositorio: 20.3 GB (18.90 GiB), lo que implica un uso de VRAM aproximado de 20-22 GB en inferencia con precisión 5-bit.
- GPU recomendadas: tarjetas con 24 GB de VRAM o más, como RTX 4090, RTX 3090, A10G, L4 o A100. En Apple Silicon, se puede ejecutar con MLX en Macs con 32 GB o más de memoria unificada.
- En consumer GPU: cabe en RTX 4090 (24 GB) y RTX 3090 (24 GB) con cuantización 5-bit; no cabe en GPUs de 16 GB o menos sin reducir aún más la precisión.
- Opciones de despliegue: `mlx-lm` / `mlx-vlm` para Apple Silicon, y servidores compatibles con MLX safetensors (por ejemplo, vLLM con soporte MLX, aunque no se confirma explícitamente). También se puede convertir a GGUF para usar con llama.cpp u Ollama, pero no se proporciona en este repositorio.
- Latencia y throughput: no se han publicado mediciones específicas para esta cuantización. El modelo base, según guías externas, puede alcanzar hasta 200 tokens por segundo con cuantización NVFP4 en hardware optimizado, pero estos datos no son directamente aplicables a esta build.

## Comparativa con modelos similares

No se dispone de datos de benchmarks para comparar directamente con otras cuantizaciones del mismo modelo. A continuación se presenta una comparación cualitativa con alternativas conocidas:

| Modelo | Parámetros | Contexto | Cuantización | Licencia | Formato |
|---|---|---|---|---|---|
| Qwen/Qwen3.8-27B (bf16) | 27.78 B | 262K (1M ext.) | bf16 | Apache-2.0 | safetensors |
| notnaurw/Qwen3.8-27B-oQ5e-SAGE-mtp | 27.78 B | 262K (1M ext.) | 5-bit oQ5e + SAGE | Apache-2.0 | MLX safetensors |
| unsloth/Qwen3.8-27B (GGUF) | 27.78 B | 262K (1M ext.) | GGUF (varias) | Apache-2.0 | GGUF |

La ventaja de esta build frente a una GGUF estándar es que conserva los cabezales MTP y está optimizada para MLX, lo que la hace especialmente adecuada para Apple Silicon. Frente al bf16, reduce el tamaño en aproximadamente un 27% (de ~55 GB a ~20 GB) con una pérdida de fidelidad medida en head-KL de 0.01193.

## Limitaciones y advertencias

- La parte de visión no fue evaluada en la cuantización: las métricas de fidelidad son exclusivamente de texto, por lo que el comportamiento con imágenes o vídeo no está verificado.
- La métrica head-KL solo cubre los 1024 logits más probables (0.41% del vocabulario), que concentran el 98.1% de la masa de probabilidad; la divergencia sobre el vocabulario completo podría ser mayor.
- La muestra de evaluación es modesta (32 batches de 4 secuencias de 1024 tokens), suficiente para detectar diferencias grandes pero no para distinguir builds muy similares.
- No se ejecutaron benchmarks de tareas downstream: la fidelidad al bf16 no implica necesariamente un rendimiento superior en tareas específicas.
- La fidelidad se mide contra el checkpoint bf16, no contra la verdad fundamental; un modelo que reproduce fielmente al original también reproduce sus errores.
- La licencia Apache-2.0 permite uso comercial, pero el modelo base puede tener restricciones adicionales no documentadas en esta cuantización.
- El pipeline SAGE no es público y no se proporciona comando de reproducción, lo que limita la verificabilidad independiente de los resultados.

## Enlaces

- Repositorio HuggingFace del modelo cuantizado: https://huggingface.co/notnaurw/Qwen3.8-27B-oQ5e-SAGE-mtp
- Modelo base Qwen/Qwen3.8-27B: https://huggingface.co/Qwen/Qwen3.8-27B
- Página de vLLM Recipes para Qwen3.8-27B: https://recipes.vllm.ai/Qwen/Qwen3.8-27B
- Guía de despliegue local (Geeky Gadgets): https://www.geeky-gadgets.com/serve-qwen-3-8-27b-fast/
- Guía para ejecutar localmente (Substack): https://linas.substack.com/p/qwen3-8-27b-local-guide
- Repositorio de oMLX: https://github.com/jundot/omlx
