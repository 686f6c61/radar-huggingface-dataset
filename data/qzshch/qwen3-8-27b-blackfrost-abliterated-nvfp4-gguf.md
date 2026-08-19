# qzshch/Qwen3.8-27B-Blackfrost-Abliterated-NVFP4-GGUF

## Resumen

Este repositorio contiene la conversión GGUF nativa NVFP4 del modelo **Blackfrost-AI/Qwen3.8-27B-ABLITERATED-NVFP4**, una versión "abliterated" (con la superficie de rechazo reducida) del modelo Qwen3.8-27B de Alibaba. El trabajo lo realiza el usuario qzshch, que mantiene dos variantes de cuantización: **ORIG** (~29,3 GB), que conserva en BF16 las capas críticas para contexto largo (DeltaNet, atención, embeddings, cabezas LM y MTP), y **VERY-LOW** (~19 GB), donde toda la red excepto normas, embeddings y cabeza LM está en NVFP4. También se incluye un proyector de visión en BF16 (~0,87 GB) para entrada de imagen y vídeo.

El modelo base Qwen3.8-27B es un transformer multimodal con 27 320 millones de parámetros, ventana de contexto de 256 000 tokens y capacidades de razonamiento, visión y generación de código. La variante abliterated elimina parte del entrenamiento de rechazo, lo que la hace interesante para investigación en alineación y para aplicaciones que requieren respuestas sin restricciones, aunque exige políticas de guardarraíles propias. La cuantización NVFP4 (tipo GGML 40) solo es ejecutable en hardware Blackwell (sm_120) con llama.cpp reciente, y el archivo incluye la cabeza MTP para decodificación especulativa sin need de un drafter externo.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal híbrido (Gated-Attention + DeltaNet/SSM) con MTP |
| Parametros totales | 27 320 698 272 (~27,3 B) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 256 000 tokens (modelo base) |
| Tipos de cuantizacion | NVFP4 (GGML tipo 40) en MLP; BF16 en atención/DeltaNet (ORIG) o NVFP4 total (VERY-LOW); mmproj en BF16 |
| Idiomas soportados | No disponibles |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (tensores NVFP4 y BF16) |

## Arquitectura y entrenamiento

El modelo es una conversión de pesos, sin reentrenamiento ni fine-tuning. Parte del checkpoint BF16 de Blackfrost-AI, que a su vez es una abliteración de Qwen3.8-27B (Apache-2.0). La cuantización NVFP4 se realizó con ModelOpt (W4A4) y luego se convirtió a GGUF mediante `convert_hf_to_gguf.py` de llama.cpp, preservando los tensores NVFP4 empaquetados sin un ciclo de cuantización adicional.

La arquitectura del modelo base combina atención gated (Gated-Attention) con una ruta de estado recurrente DeltaNet (SSM/atención lineal), lo que permite manejar contextos largos de forma eficiente. El archivo GGUF incluye además la cabeza MTP (`blk.64.nextn.*`), que habilita la decodificación especulativa con `--spec-type draft-mtp` en llama.cpp. La variante ORIG mantiene DeltaNet y atención en BF16 porque, según el autor, el comportamiento a contexto largo de la recurrencia se beneficia de mayor precisión; la variante VERY-LOW comprime todo a NVFP4 para minimizar el uso de VRAM.

## Capacidades

- Multimodal: acepta entrada de imagen y vídeo a través del proyector `mmproj` (BF16), además de texto.
- Razonamiento y generación de texto: hereda las capacidades de Qwen3.8-27B, incluyendo razonamiento multi-step y pensamiento encadenado.
- Generación de código y soporte de agentes: el modelo base está optimizado para tareas de coding agéntico y tool calling (no confirmado explícitamente en este repo, pero es una capacidad conocida de Qwen3.8).
- Decodificación especulativa: integra la cabeza MTP para acelerar la inferencia sin un drafter separado.
- Superficie de rechazo reducida (abliterated): responde con menos rechazos que el modelo original, útil para investigación en alineación.
- Multilingüe: el modelo base soporta múltiples idiomas, aunque no se especifican cuáles en este repositorio.

## Casos de uso

- Procesamiento de documentos con imagen y texto: gracias al proyector de visión y la ventana de 256K, puede resumir o extraer información de PDFs escaneados, capturas o vídeos largos en un solo paso.
- Asistentes de código en entornos locales: con la capacidad de razonamiento y generación de código, puede integrarse en IDEs o pipelines de CI/CD para revisión de código, generación de tests o autocompletado, ejecutándose en una GPU Blackwell de 32 GB.
- Investigación en alineación y seguridad: la versión abliterated permite estudiar el efecto de la eliminación del rechazo en el comportamiento del modelo, comparando con la versión original.
- Agentes autónomos con razonamiento multi-step: el soporte de tool calling y la ventana de contexto amplia permiten construir agentes que planifican, ejecutan herramientas y mantienen estado conversacional largo.
- Chat conversacional sin censura en entornos controlados: útil para prototipos donde se requiere explorar temas sensibles con políticas propias de moderación a nivel de aplicación.
- Inferencia eficiente en hardware Blackwell: la cuantización NVFP4 reduce el uso de VRAM y acelera la carga, permitiendo desplegar un modelo de 27B en GPUs como RTX 5090 o B200 con llama.cpp.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor no proporciona métricas de MMLU, HumanEval, GSM8K ni comparativas con otros modelos. Se recomienda evaluar el modelo en el caso de uso concreto antes de desplegarlo en producción.

## Requisitos de hardware

- VRAM estimada: la variante ORIG (~29,3 GB) cabe en una GPU de 32 GB con contexto reducido (por ejemplo, `--ctx-size 100000`); la variante VERY-LOW (~19 GB) cabe en GPUs de 24 GB como la RTX 4090, aunque esta última no es Blackwell y no soporta NVFP4.
- GPU obligatoria: arquitectura Blackwell (sm_120), como RTX 5090, B200, o similares, para ejecutar los kernels NVFP4 de llama.cpp. Sin ella, el modelo no puede cargarse.
- Opciones de despliegue: llama.cpp / llama-server con soporte de GGML tipo 40 y `--flash-attn on`. También es posible usar vLLM con el checkpoint NVFP4 original (según el blog de MindStudio), aunque no se garantiza la compatibilidad con este GGUF.
- Latencia y throughput: no disponibles. La decodificación especulativa con MTP debería mejorar el throughput, pero no se aportan cifras.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Notas |
|---|---|---|---|---|---|
| Qwen3.8-27B (original) | 27,3 B | 256K | BF16 | Apache-2.0 | Modelo base sin abliterar |
| Qwen3.8-27B-ABLITERATED-BF16 | 27,3 B | 256K | BF16 | Apache-2.0 | Versión abliterada de Blackfrost |
| Este repo (ORIG) | 27,3 B | 256K | NVFP4 + BF16 | Apache-2.0 | GGUF con MTP, requiere Blackwell |
| Qwen3.8-27B-ABLITERATED-GGUF (K-quants) | 27,3 B | 256K | Q2_K..Q8_0 | Apache-2.0 | Alternativa sin NVFP4, compatible con GPUs antiguas |

La principal diferencia frente a otras versiones GGUF es el uso de NVFP4, que ofrece mejor equilibrio entre tamaño y calidad para hardware Blackwell, y la inclusión de la cabeza MTP para decodificación especulativa. Las versiones con K-quants estándar son más portables pero no aprovechan las ventajas de NVFP4.

## Limitaciones y advertencias

- Modelo abliterated: la superficie de rechazo reducida puede generar contenido inapropiado, ofensivo o peligroso. El operador es responsable de implementar políticas y guardarraíles a nivel de aplicación.
- Requiere hardware Blackwell (sm_120): sin una GPU compatible, el modelo no se puede ejecutar. No hay fallback a otros backends.
- Sin datos de benchmarks: no se han publicado métricas de rendimiento, por lo que la calidad real en tareas específicas es desconocida.
- Sesgos del modelo base: Qwen3.8-27B puede presentar sesgos de género, cultura o idioma, que la abliteración no corrige.
- Riesgo de alucinación: como todo LLM, puede generar información falsa o inventada, especialmente en contextos largos.
- Contexto máximo en la práctica: aunque el modelo base soporta 256K, el uso real depende de la VRAM disponible; con 32 GB y la variante ORIG, el contexto práctico se reduce.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/qzshch/Qwen3.8-27B-Blackfrost-Abliterated-NVFP4-GGUF
- Modelo base abliterado (BF16): https://huggingface.co/Blackfrost-AI/Qwen3.8-27B-ABLITERATED-BF16
- Modelo Qwen3.8-27B original: https://huggingface.co/Qwen/Qwen3.8-27B
- Documentación de Unsloth sobre Qwen3.8: https://unsloth.ai/docs/models/qwen3.8
- Ficha en LLM Explorer: https://llm-explorer.com/model/Blackfrost-AI%2FQwen3.8-27B-ABLITERATED-NVFP4,1NguN2xSWFPgAzMpGIgODS
- Blog sobre abliteración de Qwen3.8-27B: https://www.mindstudio.ai/blog/qwen3-8-27b-aeon-uncensored-abliteration
