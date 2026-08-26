# jedi-95/Ornith-1.5-35B-A3B-NVFP4-MTP

## Resumen

Ornith-1.5-35B-A3B-NVFP4-MTP es una actualización comunitaria no oficial del checkpoint cuantizado NVFP4 del modelo Ornith-1.5-35B-A3B, desarrollado por el equipo de Ornith AI. El modelo base es un mixture-of-experts (MoE) de aproximadamente 35 mil millones de parámetros totales con unos 3 mil millones activos por token, construido sobre Qwen3.5 y Gemma4 mediante continued pretraining, mid-training y post-training, e incorpora un bucle de auto-mejora que genera tareas, scaffolds y rollouts para entrenamiento por refuerzo.

Esta versión concreta, publicada por el usuario jedi-95, reemplaza únicamente el cabezal MTP (Multi-Token Prediction) del checkpoint oficial NVFP4 con los pesos actualizados del modelo base BF16, que Ornith anunció el 24 de agosto de 2026 pero que no llegó a publicar en el repositorio NVFP4. El resultado es un checkpoint byte-idéntico al oficial en todos los tensores no MTP, con el MTP actualizado, listo para servir con vLLM y decodificación especulativa.

La relevancia de este modelo radica en que permite a los usuarios del checkpoint NVFP4 beneficiarse de la mejora del MTP sin esperar a una actualización oficial, manteniendo la compatibilidad total con la configuración de cuantización y el resto de pesos. Es una solución práctica para entornos de producción que ya utilizan la versión NVFP4 y necesitan el rendimiento actualizado del MTP.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE (qwen3_5_moe) con cabezal MTP de 256 expertos enrutados |
| Parametros totales | 35B (según model card); 18.683.860.336 en el safetensors (dato real) |
| Parametros activos | ~3B por token |
| Longitud de contexto | 262.144 tokens (256k) |
| Tipos de cuantizacion | NVFP4 (FP4 con escalas E4M3), FP8, BF16 (MTP sin cuantizar) |
| Idiomas soportados | no disponible (heredado de Qwen3.5, probablemente multilingüe) |
| Licencia | MIT |
| Formato de pesos | safetensors (cuantización NVFP4/FP8, MTP en BF16) |

## Arquitectura y entrenamiento

El modelo base Ornith-1.5-35B-A3B es un transformer MoE con aproximadamente 35B parámetros totales y ~3B activos por token. Se entrenó a partir de Qwen3.5 y Gemma4 mediante continued pretraining, mid-training y post-training, y se refinó con un bucle de auto-mejora que genera nuevas tareas, construye scaffolds específicos y produce rollouts para refuerzo. El cabezal MTP, que permite predecir múltiples tokens a la vez, es una capa MoE con 256 expertos enrutados y un experto compartido, almacenada en BF16 sin cuantizar.

Este repositorio concreto no modifica la arquitectura ni los pesos principales: solo sustituye los 785 tensores del MTP (aproximadamente 1,69 GB) por los pesos actualizados del modelo base BF16, manteniendo el resto de tensores byte-idénticos al checkpoint NVFP4 oficial. La cuantización NVFP4 excluye explícitamente el MTP (`exclude_modules: ["mtp*", "mtp.layers.0*"]`), por lo que el intercambio es directo BF16 a BF16 sin requantización.

## Capacidades

- Generación de texto y razonamiento multi-step, con soporte de modo razonamiento tipo Qwen3 (parsing de reasoning).
- Codificación y agentic coding: supera a Qwen 3.6-35B en benchmarks de coding y agente, y a Gemma 4-31B y Muse Glimmer-30B en agentic coding.
- Tool calling / function calling, con parser de herramientas Qwen3 XML y auto-tool-choice.
- Soporte de agentes y multi-step reasoning, gracias al entrenamiento con scaffolds generados automáticamente.
- Decodificación especulativa MTP: el cabezal MTP permite predecir tokens adicionales para acelerar la inferencia.
- Capacidades multilingües: no especificadas, pero heredadas de la base Qwen3.5 (probablemente multilingüe).
- Procesamiento de imagen y texto (image-text-to-text) según los tags de HuggingFace, aunque no se detallan capacidades de visión en la model card.

## Casos de uso

- Atención al cliente automatizada: con 256k tokens de contexto, puede gestionar conversaciones multi-turno largas y mantener el historial completo, integrando tool calling para consultar bases de conocimiento o APIs.
- Generación de código en producción: su rendimiento en benchmarks de coding y su soporte de tool calling lo hacen adecuado para pipelines de CI/CD, generación de tests, revisión de código y autocompletado en IDEs.
- Agentes autónomos: el entrenamiento con scaffolds generados automáticamente y el soporte de razonamiento multi-step permiten construir agentes que planifican, ejecutan herramientas y verifican resultados.
- Asistente de investigación y análisis de documentos: la ventana de contexto de 256k permite procesar papers, informes o repositorios completos y responder preguntas con razonamiento profundo.
- Desarrollo de aplicaciones RAG: combinado con vLLM y prefix caching, puede servir como generador en sistemas de retrieval-augmented generation con baja latencia.
- Despliegue en hardware de gama media: gracias a la cuantización NVFP4 y a los ~3B parámetros activos, cabe en GPUs de 24 GB, lo que permite inferencia local o en edge con rendimiento competitivo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card menciona que Ornith-1.5-35B-A3B supera a Qwen 3.6-35B en todos los benchmarks de coding y agentic, y a Gemma 4-31B y Muse Glimmer-30B en agentic coding, pero no se incluyen las cifras concretas en el texto proporcionado. Se recomienda consultar el blog oficial de Ornith para los números detallados.

## Requisitos de hardware

- VRAM estimada: el checkpoint NVFP4 ocupa 23,4 GB, por lo que se necesita al menos 24 GB de VRAM para inferencia con contexto estándar. Con contexto de 256k, la memoria adicional para KV cache puede requerir más de 24 GB.
- GPU recomendadas: RTX 4090 (24 GB) o superior, A100 40/80 GB, H100, o DGX Spark (GB10 con ~128 GB unificados).
- En consumer GPU: sí, cabe en RTX 4090 con cuantización NVFP4 y contexto moderado, aunque para 256k puede ser necesario reducir la longitud o usar más memoria.
- Opciones de despliegue: vLLM (con `--spec-method mtp --spec-tokens 1`), llama.cpp, Ollama, TGI, y el backend b12x para DGX Spark (ver repo MiaAI-Lab).
- Latencia y throughput: no disponibles, pero la decodificación especulativa MTP y la cuantización NVFP4 reducen la latencia respecto al BF16. El comando de vLLM sugerido usa tensor-parallel-size 1 y gpu-memory-utilization 0.90.

## Comparativa con modelos similares

| Modelo | Parámetros | Activos | Contexto | Licencia | Cuantización |
|---|---|---|---|---|---|
| Ornith-1.5-35B-A3B (este) | ~35B | ~3B | 256k | MIT | NVFP4/FP8/BF16 |
| Qwen 3.6-35B | ~35B | no disponible | no disponible | no disponible | no disponible |
| Gemma 4-31B | ~31B (dense) | todos | no disponible | no disponible | no disponible |
| Muse Glimmer-30B | ~30B (dense) | todos | no disponible | no disponible | no disponible |

Según la model card, Ornith-1.5-35B-A3B supera a Qwen 3.6-35B en coding y agentic benchmarks, y a Gemma 4-31B y Muse Glimmer-30B en agentic coding. No se dispone de datos de rendimiento numéricos para comparar directamente.

## Limitaciones y advertencias

- Repositorio no oficial: es una contribución comunitaria que puede quedar obsoleta si Ornith publica una actualización oficial del NVFP4. Se recomienda usar el repositorio oficial cuando esté disponible.
- Solo se actualizó el MTP: el resto de pesos son idénticos al checkpoint NVFP4 original, por lo que cualquier bug o limitación del modelo base se mantiene.
- Riesgo de alucinación: no se han publicado evaluaciones específicas de alucinación para esta versión.
- Sesgos: no se han documentado sesgos específicos, pero al derivar de Qwen3.5 y Gemma4, puede heredar sesgos de esos modelos.
- Limitaciones de idioma: no se especifican los idiomas soportados; se asume multilingüe por la base, pero sin garantía.
- Restricciones de licencia: licencia MIT, permite uso comercial sin restricciones, pero el modelo base puede tener atribuciones de Qwen3.5 y Gemma4 que conviene revisar.
- Para producción: verificar la reproducibilidad de los resultados con el MTP actualizado, ya que el cambio puede afectar a la decodificación especulativa y a la calidad de las predicciones multi-token.

## Enlaces

- Repositorio de HuggingFace: https://huggingface.co/jedi-95/Ornith-1.5-35B-A3B-NVFP4-MTP
- Checkpoint oficial NVFP4: https://huggingface.co/ornith-ai/Ornith-1.5-35B-A3B-NVFP4
- Modelo base BF16: https://huggingface.co/ornith-ai/Ornith-1.5-35B-A3B
- Blog de Ornith 1.5: https://ornith.ai/ornith_1_5.html
- Guía para DGX Spark: https://github.com/MiaAI-Lab/Ornith-1.5-35B-A3B-DGX-Spark
- Script de intercambio MTP: https://huggingface.co/jedi-95/Ornith-1.5-35B-A3B-NVFP4-MTP/blob/main/swap_mtp.py
