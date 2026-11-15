# jay042479/Edge0-145B-NVFP4

## Resumen
Edge0-145B-NVFP4 es una publicación comunitaria de Hugging Face del usuario jay042479, derivada del modelo base Qwen/Qwen3.8-Flash-Next mediante cuantización a 4 bits en formato NVFP4 y empaquetado con la librería propietaria `edge0`. El modelo se presenta con etiquetas de arquitectura MoE (mezcla de expertos) con variante "latent-moe", orientado a inferencia en el borde (edge inference), agentes y generación de código sobre CUDA. Pese al nombre comercial "145B" que figura en el identificador del repositorio, el conteo real de parámetros en los ficheros safetensors es de 4.947.698.560 (aproximadamente 4,95 mil millones), lo que supone una discrepancia sustancial entre la denominación y el contenido publicado.

El repositorio ocupa 113,8 GB, un tamaño desproporcionado para un modelo de menos de 5 mil millones de parámetros, lo que sugiere que el grueso del espacio corresponde a artefactos auxiliares, múltiples variantes de cuantización o ficheros de la librería `edge0` más que a los pesos del modelo en sí. El modelo se publicó el 15 de noviembre de 2026 y, en el momento de redactar esta ficha, no registra descargas ni interacciones, por lo que se trata de un artefacto sin validación por parte de la comunidad.

La relevancia de esta ficha es principalmente documental y de advertencia: el modelo declara capacidades de agente y codificación, pero carece de model card sustantiva, de resultados de evaluación publicados y de especificaciones verificables sobre contexto, idiomas o datos de entrenamiento. Cualquier evaluación práctica debe tratar la información disponible como no verificada.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | MoE (mezcla de expertos) con variante declarada "latent-moe"; detalles de capas y configuración no disponibles |
| Parámetros totales | 4.947.698.560 (según safetensors); el identificador del repo indica "145B", dato no verificado |
| Parámetros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantización | 4 bits en formato NVFP4 (declarado); no se documentan otras variantes |
| Idiomas soportados | no disponible |
| Licencia | edge0-community-model-1.0 (licencia propia del autor, etiquetada como "other") |
| Formato de pesos | safetensors y GGUF (según etiquetas); librería `edge0` |

## Arquitectura y entrenamiento
La información disponible indica únicamente que se trata de una arquitectura de mezcla de expertos (MoE) con una variante denominada "latent-moe", sin que la model card publique el número de expertos, la tasa de activación, la dimensión oculta, el número de capas ni la estrategia de enrutamiento. El modelo deriva de Qwen/Qwen3.8-Flash-Next, pero no se documenta si el proceso de derivación consistió en cuantización, destilación, pruning o una combinación de estas técnicas; la etiqueta `base_model:quantized` apunta a una conversión de precisión, mientras que las etiquetas `moe` y `latent-moe` sugieren una modificación estructural que no queda explicada.

No hay información sobre el volumen de tokens de entrenamiento, la composición del corpus, la existencia de fases de RLHF, DPO o ajuste supervisado, ni sobre innovaciones técnicas como decodificación especulativa, atención lineal o mecanismos de compresión de KV cache. El formato NVFP4 es una representación de 4 bits orientada a hardware NVIDIA (arquitecturas Blackwell y posteriores), lo que condiciona la inferencia a GPUs compatibles con ese formato y limita la portabilidad frente a cuantizaciones GGUF convencionales.

## Capacidades
- Generación de texto conversacional, según el pipeline declarado `text-generation` y la etiqueta `conversational`.
- Orientación declarada a tareas de agente (`agent`), sin que se documenten protocolos concretos de tool calling ni function calling.
- Orientación declarada a generación y asistencia en código (`coding`), sin benchmarks que lo respalden.
- Inferencia en el borde (`edge-inference`) sobre CUDA, con vocación de despliegue en hardware limitado.
- Soporte multilingüe: no disponible; no se declara ningún idioma concreto.
- Modo de razonamiento extendido (thinking), visión, audio u otras capacidades especiales: no disponible.

## Casos de uso
- Asistencia de código en estación de trabajo local: dado su tamaño efectivo de menos de 5 mil millones de parámetros, podría ejecutarse en una GPU de consumo para autocompletado y revisión de código, siempre que se valide primero la calidad real del modelo derivado.
- Prototipado de agentes ligeros: las etiquetas `agent` y `edge-inference` sugieren su uso en bucles de agente de baja latencia sobre CUDA, aunque la ausencia de documentación sobre tool calling obliga a implementar el protocolo en la capa de orquestación.
- Experimentación con cuantización NVFP4: resulta útil como caso de estudio para evaluar el rendimiento y la degradación de precisión de este formato frente a GGUF Q4 en hardware NVIDIA compatible.
- Evaluación comparativa de derivados de Qwen: permite medir cuánto rendimiento se conserva tras una conversión agresiva a 4 bits respecto al modelo base Qwen3.8-Flash-Next.
- Despliegue en entornos con restricciones de memoria: el tamaño reducido de pesos facilita la ejecución en dispositivos con VRAM modesta, aunque el tamaño del repositorio (113,8 GB) complica la distribución y el almacenamiento.
- Fines de investigación sobre licencias comunitarias: sirve para analizar las implicaciones prácticas de una licencia propia (`edge0-community-model-1.0`) en flujos de trabajo comerciales.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la información disponible. La model card no incluye tablas de MMLU, HumanEval, GSM8K ni métricas de latencia o throughput, y no procede inferir cifras a partir del modelo base sin evidencia publicada por el autor.

## Requisitos de hardware
- VRAM estimada para inferencia: con 4,95 mil millones de parámetros en 4 bits, los pesos ocuparían del orden de 2,5 a 3 GB, a los que hay que sumar overhead de KV cache y del runtime `edge0`; el total real no está documentado.
- GPU recomendadas: el formato NVFP4 requiere hardware NVIDIA con soporte para esa representación (arquitecturas Blackwell y posteriores, como B200); en GPUs anteriores el modelo podría no ser ejecutable sin conversión previa.
- Cabe en GPU de consumo (RTX 4090, RTX 5090) en términos de VRAM por tamaño de pesos, pero la compatibilidad con NVFP4 en esas arquitecturas no está confirmada en la información disponible.
- Opciones de despliegue: librería `edge0` (declarada), GGUF (etiqueta presente, sin detallar el runtime compatible), y endpoints compatibles (`endpoints_compatible`). No se confirma soporte para vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Observaciones |
|---|---|---|---|---|
| Edge0-145B-NVFP4 | 4,95 B (real) | no disponible | edge0-community-model-1.0 | Cuantización NVFP4, sin benchmarks publicados |
| Qwen/Qwen3.8-Flash-Next (base) | no disponible en la información | no disponible | no disponible | Modelo de origen del que deriva este artefacto |
| Alternativas de ~5 B en 4 bits | no disponible | no disponible | no disponible | No se dispone de datos verificables para establecer una comparación rigurosa |

La comparación con modelos de la misma categoría no puede completarse con datos verificables a partir de la información proporcionada; se indica explícitamente como no disponible.

## Limitaciones y advertencias
- Discrepancia crítica entre el nombre "145B" y el conteo real de parámetros (4,95 B): cualquier planificación de recursos basada en el identificador del repositorio será errónea.
- Ausencia de model card sustantiva: no hay datos sobre contexto, idiomas, datos de entrenamiento ni metodología de cuantización.
- Sin benchmarks publicados: no es posible validar las capacidades declaradas de agente y codificación.
- Cero descargas y cero interacciones: el artefacto no ha sido validado por la comunidad y debe tratarse como no auditado.
- Licencia propietaria `edge0-community-model-1.0` etiquetada como "other": las condiciones de uso comercial no están claras y requieren revisión del fichero LICENSE antes de cualquier despliegue en producción.
- Dependencia de la librería `edge0` y del formato NVFP4: riesgo de vendor lock-in y de incompatibilidad con toolchains estándar del ecosistema open source.
- Tamaño del repositorio (113,8 GB) desproporcionado respecto a los pesos declarados: dificulta la descarga, el almacenamiento y la reproducibilidad.
- Riesgo de alucinación y sesgos: no evaluable sin documentación ni pruebas independientes.
- Idiomas soportados no declarados: no se puede asumir cobertura multilingüe.

## Enlaces
- Modelo en Hugging Face: https://huggingface.co/jay042479/Edge0-145B-NVFP4
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-Flash-Next
- Repositorio, paper, blog o demo adicionales: no disponibles en la información proporcionada.
