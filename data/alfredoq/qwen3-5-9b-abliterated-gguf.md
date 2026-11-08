# Alfredoq/Qwen3.5-9B-abliterated-GGUF

## Resumen

Qwen3.5-9B-abliterated-GGUF es una redistribución en formato GGUF del modelo abliterado `lukey03/Qwen3.5-9B-abliterated`, publicado por el usuario Alfredoq. El modelo base original es `Qwen/Qwen3.5-9B`, un transformer denso de aproximadamente 8.950 millones de parámetros con capacidades nativas multimodales (texto e imagen) gracias a un entrenamiento con fusión temprana. La "abliteración" elimina el comportamiento de rechazo mediante proyección ortogonal iterativa y un ajuste fino QLoRA posterior, dando como resultado un modelo sin censura orientado a investigación.

El interés práctico de esta ficha reside en que combina tres elementos poco habituales en un mismo artefacto: cuantización GGUF lista para inferencia local (llama.cpp, Ollama, LM Studio), un codificador de visión conservado íntegro y un proceso de abliteración documentado con una tasa de éxito declarada del 100% sobre un conjunto de 18 prompts de prueba. La licencia Apache 2.0 del modelo base facilita su uso comercial, aunque el proceso de abliteración introduce consideraciones éticas y legales relevantes.

La relevancia actual es doble: por un lado, demuestra el flujo de trabajo de "abliteración + cuantización + preservación del encoder visual" sobre un modelo multimodal de gama media; por otro, permite ejecutar un modelo de casi 9B con visión en hardware de consumo, algo reservado hasta hace poco a GPUs de datacenter.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer denso multimodal con fusión temprana (encoder de visión integrado) y cabezales MTP (multi-token prediction) |
| Parámetros totales | 8.953.803.264 (~8,95B) |
| Parámetros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | Q4_K_M (texto y visión), F16 (solo texto); el repo incluye además otras variantes GGUF según la model card del redistribuidor |
| Idiomas soportados | en, zh, ja, ko, fr, de, es |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (safetensors disponibles en el repo del modelo base abliterado) |

## Arquitectura y entrenamiento

El modelo subyacente es un transformer denso de ~8,95B parámetros con un encoder de visión nativo. Según la model card, Qwen3.5 es "nativamente multimodal": no existe una variante "VL" separada, sino que la visión se integra mediante entrenamiento con fusión temprana. El GGUF de visión contiene 883 tensores: 427 de texto, 441 del encoder visual y 15 de MTP (multi-token prediction). La abliteración se aplicó en dos etapas: primero, tres pasadas de proyección ortogonal siguiendo el método de Arditi et al. (2024), con 170 prompts dañinos y 160 inofensivos sobre 64 matrices de pesos por pasada; después, un ajuste fino QLoRA (r=64, alpha=128, 5 épocas) sobre las cinco categorías de rechazo más resistentes. El proceso modifica únicamente las proyecciones `o_proj`/`output_proj` y `down_proj`; los 27 tensores de texto restantes (asociados a `attn_qkv` y `attn_v`) conservan la cuantización original y no se ven afectados por la abliteración. Los detalles sobre volumen de tokens de entrenamiento del modelo base, composición del dataset y uso de RLHF/DPO no están disponibles en la información proporcionada.

## Capacidades

- Generación de texto conversacional multi-turno en siete idiomas (inglés, chino, japonés, coreano, francés, alemán y español).
- Comprensión de imágenes y texto combinados (pipeline `image-text-to-text`), con encoder visual completo conservado en el GGUF de visión.
- Modo "thinking" (razonamiento extendido) que puede desactivarse añadiendo `/no_think` al final del prompt para respuestas más rápidas y directas.
- Generación de código y matemáticas: capacidad heredada del modelo base Qwen3.5, aunque no se aportan benchmarks específicos en la información disponible.
- Soporte de tool calling / function calling: no confirmado explícitamente en la información proporcionada; debe validarse empíricamente.
- Capacidades de agente y razonamiento multi-paso: no documentadas en la información disponible.
- Multimodalidad nativa sin variante VL separada, lo que simplifica el despliegue de una sola pila de inferencia.
- Compatibilidad con endpoints (`endpoints_compatible`) y con el ecosistema Ollama (requiere Ollama 0.17.1 o superior para visión).

## Casos de uso

- Investigación sobre alineación y seguridad: el modelo permite estudiar el comportamiento de un modelo abliterado frente a uno alineado, comparando tasas de rechazo (18/18 vs 0/18 declaradas) y analizando qué capas concentran la dirección de rechazo.
- Análisis de imágenes en local: con el GGUF de visión Q4_K_M (~6,1 GB) se puede desplegar un pipeline image-text-to-text en una estación de trabajo con GPU de consumo, útil para prototipos de descripción de imágenes, OCR asistido o moderación visual interna.
- Asistente conversacional sin filtros para entornos controlados: gracias a los siete idiomas soportados y al modo `/no_think`, encaja en pruebas de usabilidad o generación creativa donde se requiere respuesta directa sin rechazos.
- Evaluación de cuantizaciones: el repositorio ofrece Q4_K_M y F16, lo que permite medir la degradación de calidad entre precisión completa y 4 bits en tareas de texto y visión, un caso típico de laboratorio de eficiencia.
- Despliegue en Apple Silicon: las variantes MLX 4-bit (~4,7 GB) y 8-bit (~8,9 GB) del modelo base abliterado permiten ejecutar el modelo en Macs con memoria unificada, útil para desarrollo offline.
- Generación de código en pipelines internos: la naturaleza Apache 2.0 y el formato GGUF facilitan integrarlo en herramientas de autocompletado o revisión de código autoalojadas, siempre que se valide su calidad frente a alternativas específicas de código.
- Fine-tuning posterior sobre dominio: al estar disponible en safetensors (repo del modelo base abliterado, ~17 GB), se puede reentrenar con LoRA para dominios verticales (legal, médico, industrial) partiendo de una base sin rechazos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La única métrica aportada es la tasa de abliteración declarada por el autor del modelo base: 18/18 prompts de prueba respondidos frente a 0/18 del modelo base alineado. No se proporcionan cifras de MMLU, HumanEval, GSM8K ni de evaluaciones multimodales.

## Requisitos de hardware

- VRAM estimada para inferencia: ~6,1 GB para el GGUF de visión Q4_K_M, ~5,2 GB para el texto Q4_K_M y ~17 GB para F16 (solo texto).
- GPU recomendadas: RTX 4090 (24 GB) para F16 con holgura o Q4_K_M con contexto largo; A100/H100 para despliegues concurrentes de alta throughput; RTX 3090/4080 (16-24 GB) suficientes para Q4_K_M con visión.
- Cabe en GPU de consumo: sí, el Q4_K_M de visión (~6,1 GB) entra en GPUs de 8 GB o más, aunque con contexto limitado; el F16 requiere 24 GB o más.
- Opciones de despliegue: Ollama (0.17.1+ para visión), llama.cpp, LM Studio, Jan y otros motores compatibles con GGUF; MLX para Apple Silicon mediante las variantes 4-bit/8-bit.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Multimodal | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.5-9B-abliterated-GGUF (este) | ~8,95B | No disponible | Sí (visión nativa) | Apache 2.0 | GGUF, safetensors, MLX |
| lukey03/Qwen3.5-9B-abliterated | ~8,95B | No disponible | Sí | Apache 2.0 | Safetensors (~17 GB) |
| lukey03/Qwen3.5-9B-abliterated-MLX-4bit | ~8,95B | No disponible | Sí | Apache 2.0 | MLX 4-bit (~4,7 GB) |
| Qwen/Qwen3.5-9B (base alineado) | ~8,95B | No disponible | Sí | Apache 2.0 | Safetensors, GGUF oficial |

Las alternativas comparables son, en la práctica, variantes del mismo modelo base. No se dispone de datos de rendimiento comparativo entre ellas en la información proporcionada.

## Limitaciones y advertencias

- La abliteración elimina los rechazos de forma deliberada: el modelo puede generar contenido dañino, ilegal o éticamente problemático sin filtro. El autor lo declara para "investigación y educación", pero la licencia Apache 2.0 permite uso comercial, lo que traslada toda la responsabilidad al desplegador.
- Riesgo elevado de alucinación: no se han publicado evaluaciones de fidelidad factual ni de calibración para esta variante abliterada; la eliminación de rechazos puede aumentar la confianza en respuestas incorrectas.
- La cuantización Q4_K_M introduce pérdida de precisión frente a F16, especialmente en tareas de razonamiento matemático y en la percepción visual fina; no hay mediciones publicadas de esta degradación.
- El contexto máximo no está documentado en la información disponible, lo que impide planificar despliegues con ventanas largas sin validación empírica.
- El soporte de tool calling y de razonamiento agéntico no está confirmado; los pipelines que dependan de function calling deben probarse antes de producción.
- Los siete idiomas declarados no incluyen el castellano como idioma de entrenamiento prioritario (aparece como `es` en la lista, pero sin métricas); la calidad en español no está cuantificada.
- El repositorio muestra 0 descargas y 0 likes en el momento de la consulta, por lo que no existe validación comunitaria de la integridad de los GGUF redistribuidos; conviene verificar los hashes frente al repo original de lukey03.
- Los 27 tensores de texto no abliterados (`attn_qkv`, `attn_v`) conservan la cuantización original, lo que puede introducir una ligera inconsistencia numérica respecto a una cuantización homogénea.

## Enlaces

- Repositorio Hugging Face de esta ficha: https://huggingface.co/Alfredoq/Qwen3.5-9B-abliterated-GGUF
- Modelo base abliterado (safetensors): https://huggingface.co/lukey03/Qwen3.5-9B-abliterated
- GGUF original del autor de la abliteración: https://huggingface.co/lukey03/Qwen3.5-9B-abliterated-GGUF
- Variante MLX 4-bit: https://huggingface.co/lukey03/Qwen3.5-9B-abliterated-MLX-4bit
- Variante MLX 8-bit: https://huggingface.co/lukey03/Qwen3.5-9B-abliterated-MLX-8bit
- Otra redistribución GGUF (Abhiray): https://huggingface.co/Abhiray/Qwen3.5-9B-abliterated-GGUF
- Modelo base original: https://huggingface.co/Qwen/Qwen3.5-9B
- Paper del método de abliteración (Arditi et al., 2024): https://arxiv.org/abs/2406.11717
- Ollama: https://ollama.com
- llama.cpp: https://github.com/ggerganov/llama.cpp
