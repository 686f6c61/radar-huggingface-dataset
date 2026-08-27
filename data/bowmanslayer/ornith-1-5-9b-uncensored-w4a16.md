# bowmanslayer/Ornith-1.5-9B-Uncensored-W4A16

## Resumen

Ornith-1.5-9B-Uncensored-W4A16 es una cuantización INT4 (W4A16) del modelo multimodal Ornith-1.5-9B-Uncensored, publicado por el usuario bowmanslayer. El modelo base, desarrollado por ornith-ai, es una variante sin alineación de seguridad (abliterated) de Ornith-1.5-9B, un modelo denso de 9B parámetros basado en la arquitectura Qwen3.5 con capacidades de imagen-texto. Esta versión cuantizada reduce el peso a aproximadamente 8 GB, lo que permite su ejecución en GPUs de consumo con 8 GB de VRAM, y está optimizada para servir con vLLM mediante el kernel `gptq_marlin`.

La relevancia de este modelo radica en su doble naturaleza: por un lado, ofrece capacidades multimodales y de razonamiento de última generación en un tamaño compacto; por otro, al haber sido sometido a un proceso de ablación de rechazo, responde a peticiones que el modelo original rechazaría, lo que lo hace útil para investigación en seguridad de IA y generación de contenido sin restricciones, siempre bajo estrictas advertencias legales y éticas. La cuantización W4A16 mantiene la precisión dentro del ruido de evaluación respecto al modelo bf16 de referencia, según los datos publicados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Basada en Qwen3.5, 32 capas (24 lineales + 8 de atencion completa), hidden 4096 |
| Parametros totales | 9B (segun nombre del modelo, no confirmado en la documentacion) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No especificada oficialmente; configuracion recomendada de vLLM hasta 28672 tokens |
| Tipos de cuantizacion | W4A16 (INT4 peso + FP16 activacion), GPTQ via AutoRound; tambien disponible GGUF |
| Idiomas soportados | Ingles (en), chino (zh) |
| Licencia | Apache-2.0 |
| Formato de pesos | GPTQ (safetensors, no confirmado explicitamente) |

## Arquitectura y entrenamiento

El modelo base Ornith-1.5-9B emplea una arquitectura hibrida con 32 capas, de las cuales 24 son capas lineales (probablemente con atencion lineal o de bajo coste) y 8 son capas de atencion completa. Esta configuracion reduce el coste del cache KV en contextos largos, ya que solo las capas de atencion completa escalan linealmente con la longitud de la secuencia. El entrenamiento del modelo original sigue el framework de auto-scaffolding y auto-mejora descrito en el sitio de ornith.ai: el modelo propone nuevas tareas, genera scaffolds especificos y produce rollouts para aprendizaje por refuerzo, creando un bucle continuo de mejora.

La version uncensored se obtiene mediante un proceso de ablacion (abliteration) que elimina el comportamiento de rechazo del modelo original, manteniendo las capacidades de razonamiento y generacion. La cuantizacion W4A16 se realizo con AutoRound y se convirtio a formato GPTQ, disenada para funcionar con el kernel `gptq_marlin` de vLLM. Segun la model card, la cuantizacion no rompe la ablacion: el comportamiento de rechazo y las capacidades siguen al modelo bf16 de referencia, con diferencias de precision dentro del ruido de evaluacion.

## Capacidades

- Generacion de texto y conversacion multimodal (entrada de imagen y texto, salida de texto).
- Razonamiento complejo y resolucion de problemas en matematicas, logica y ciencias (MMLU-Pro, BBH, GSM8K, MATH-500).
- Generacion de codigo en multiples lenguajes (HumanEval 92.16).
- Soporte de tool calling y function calling, heredado de la base Qwen3.5.
- Capacidad de agente y razonamiento multi-paso con modo "thinking" activable (parser `qwen3` en vLLM).
- Multilingue: ingles y chino, con benchmarks en ambos (MMLU, CMMLU, C-Eval).
- Procesamiento de imagenes (pipeline `image-text-to-text`), aunque no se detallan capacidades especificas de vision en la documentacion.
- Sin restricciones de contenido: responde a peticiones que el modelo original rechazaria, incluyendo categorias daninas (segun la evaluacion de la model card).

## Casos de uso

- Investigacion en seguridad de IA: el modelo permite estudiar el comportamiento de modelos sin alineacion de seguridad, analizando como responden a prompts adversariales y que mecanismos de rechazo se han eliminado. Su naturaleza "uncensored" facilita la evaluacion de riesgos y el desarrollo de contramedidas.
- Generacion de contenido creativo sin filtros: escritores y creadores pueden usarlo para explorar narrativas o dialogos que otros modelos censurarian, siempre que cumplan con la legislacion local y las politicas de uso.
- Despliegue de asistentes conversacionales en entornos controlados: con una capa de seguridad adicional, puede servir como base para chatbots especializados en dominios tecnicos (programacion, matematicas) donde se requiere respuestas directas sin evasivas.
- Servicio de inferencia multimodal en produccion: gracias a la cuantizacion W4A16 y la compatibilidad con vLLM, puede integrarse en pipelines de vision-lenguaje para tareas como descripcion de imagenes, extraccion de informacion visual o generacion de informes, con un coste de VRAM reducido.
- Educacion y tutoria en matematicas y ciencias: su alto rendimiento en GSM8K (97.98) y MATH-500 (70.53) lo hace util para generar explicaciones paso a paso y problemas de practica, aunque requiere supervision humana por su falta de filtros.
- Evaluacion comparativa de cuantizaciones: sirve como referencia para medir el impacto de la cuantizacion W4A16 en modelos multimodales, comparando con la version bf16 y con otras cuantizaciones (GGUF) en terminos de precision, latencia y uso de memoria.

## Benchmarks y rendimiento

La model card proporciona resultados de 11 benchmarks para el modelo bf16 de referencia (del cual deriva esta cuantizacion). Se indica que las diferencias de la version W4A16 respecto al bf16 estan dentro del ruido de evaluacion, aunque no se publican cifras especificas para la version cuantizada. Los datos siguientes corresponden al modelo bf16 de referencia:

| Benchmark | N | Ornith-1.5-9B base | Modelo uncensored (bf16) | Delta |
|---|---:|---:|---:|---:|
| MMLU | 150 | 90.14 | 88.97 | -1.17 |
| CMMLU | 150 | 86.67 | 84.17 | -2.50 |
| MMLU-Pro | 150 | 88.97 | 87.12 | -1.85 |
| C-Eval | 150 | 85.82 | 84.78 | -1.04 |
| ARC-Challenge | 150 | 93.33 | 94.67 | +1.34 |
| TruthfulQA | 150 | 79.31 | 82.31 | +3.00 |
| GSM8K | 100 | 98.99 | 97.98 | -1.01 |
| MATH-500 | 100 | 73.68 | 70.53 | -3.15 |
| BBH | 150 | 91.72 | 95.27 | +3.55 |
| HumanEval | 164 | 94.67 | 92.16 | -2.51 |
| IFEval (strict) | 100 | 78.65 | 77.53 | -1.12 |
| **Media (excl. trunc)** | — | **87.45** | **86.86** | **-0.59** |

Ademas, en la evaluacion de rechazo con 23 prompts adversariales, el modelo uncensored obtuvo 0 REFUSE y 23 COHERENT, confirmando la eliminacion completa del rechazo. La longitud de salida mediana aumento un 11% respecto al base, pero el numero de truncamientos disminuyo un 6%, indicando que la capacidad de detener la generacion se preserva.

## Requisitos de hardware

- VRAM estimada: aproximadamente 8 GB para los pesos W4A16, mas cache KV y overhead de ejecucion. Con `fp8_e5m2` para el cache KV, el uso total puede caber en GPUs de 8 GB (segun el blog de atomic.chat, el modelo corre en una GPU de 8 GB o un Mac de 16 GB a 4-bit).
- GPUs recomendadas: NVIDIA RTX 3090/4090 (24 GB) para margen comodo, o GPUs de 8 GB (RTX 3060, RTX 4060) con configuracion ajustada. Para contexto largo (28672 tokens) se recomienda tensor-parallelism de 2 GPUs.
- Compatibilidad con GPUs de consumo: si, siempre que tengan al menos 8 GB de VRAM y soporte para FP16.
- Opciones de despliegue: vLLM (recomendado, con kernel `gptq_marlin`), llama.cpp via GGUF (repositorio hermano), Ollama (si se convierte a GGUF), TGI (si soporta GPTQ).
- Latencia y throughput: no se proporcionan datos especificos. Con vLLM y TP=2, se espera un throughput adecuado para servicio en tiempo real; la cuantizacion W4A16 reduce el ancho de banda de memoria, mejorando la velocidad de decodificacion respecto a bf16.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Cuantizacion | Notas |
|---|---|---|---|---|---|
| Ornith-1.5-9B-Uncensored-W4A16 (este) | 9B | No especificado (28672 en config recomendada) | Apache-2.0 | W4A16 GPTQ | Multimodal, uncensored, optimizado para vLLM |
| Ornith-1.5-9B-Uncensored (bf16) | 9B | No especificado | Apache-2.0 | bf16 | Version de referencia, mayor precision, mayor VRAM |
| Ornith-1.5-9B (base, con alineacion) | 9B | No especificado | Apache-2.0 | bf16 | Modelo original con rechazo de contenido |
| Ornith-1.0-9B (dense) | 9B | 256K (262,144 tokens) | Apache-2.0 | bf16 | Version anterior, contexto mas largo, sin multimodalidad confirmada |

No se dispone de comparativas con modelos de otros fabricantes (p.ej. Qwen2.5-7B, Llama-3.1-8B) en la informacion proporcionada.

## Limitaciones y advertencias

- Contenido sin filtrar: al haber sido ablado, el modelo puede generar respuestas daninas, ilegales o eticamente problematicas. No debe desplegarse en produccion sin una capa de seguridad adicional.
- Acceso restringido: el repositorio requiere aceptar una puerta de acceso (gated) que confirma mayoria de edad, no despliegue a terceros sin capa de seguridad y responsabilidad legal sobre las salidas.
- Sesgos y alucinaciones: como cualquier modelo de lenguaje, puede producir informacion falsa o sesgada, especialmente en temas controvertidos. La evaluacion TruthfulQA (82.31) indica un nivel moderado de veracidad, pero no es fiable para informacion critica.
- Limitaciones de idioma: solo ingles y chino; no se garantiza calidad en otros idiomas.
- Contexto limitado en la practica: aunque la arquitectura reduce el coste del cache KV, la configuracion recomendada limita a 28672 tokens; no se confirma si el modelo soporta contextos mayores.
- Riesgo de sobre-ablacion: aunque la model card indica que la capacidad de detener la generacion se preserva, existe el riesgo de que en algunos escenarios el modelo produzca salidas incoherentes o repetitivas (LOOP/GIBBERISH), como se observo en variantes con parametros de ablacion mas agresivos durante el desarrollo.
- Licencia Apache-2.0 permite uso comercial, pero el uso del modelo uncensored puede violar politicas de plataformas o leyes locales; el autor declina responsabilidad.

## Enlaces

- Repositorio HuggingFace de este modelo: https://huggingface.co/bowmanslayer/Ornith-1.5-9B-Uncensored-W4A16
- Modelo base uncensored (bf16): https://huggingface.co/bowmanslayer/Ornith-1.5-9B-Uncensored
- Modelo original de ornith-ai: https://huggingface.co/ornith-ai/Ornith-1.5-9B
- Version GGUF: https://huggingface.co/zaakirio/Ornith-1.5-9B-Uncensored-GGUF
- Blog sobre ejecucion local (atomic.chat): https://atomic.chat/blog/guides/how-to-run-ornith-1-5-locally
- Pagina oficial de Ornith-1.5: https://ornith.ai/ornith_1_5.html
- Repositorio GitHub de Ornith-1: https://github.com/ornith-ai/Ornith-1
