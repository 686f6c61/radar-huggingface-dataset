# Fastiraz/Qwen3.6-35B-A3B-MTP-GGUF

## Resumen

Qwen3.6-35B-A3B-MTP-GGUF es una cuantización GGUF del modelo Qwen3.6-35B-A3B, desarrollado por Alibaba Qwen y convertido por Unsloth para su uso con llama.cpp y motores compatibles. Se trata de un modelo de lenguaje causal con encoder de visión (image-text-to-text) que combina una arquitectura MoE (Mixture of Experts) con capas híbridas de atención lineal (Gated DeltaNet) y atención clásica (Gated Attention). Con 35.505 millones de parámetros totales y solo 3.000 millones activos, ofrece un equilibrio entre capacidad y eficiencia computacional, pensado para ejecución local en hardware de consumo.

La versión MTP (Multi-Token Prediction) incorpora una cabeza de predicción de múltiples tokens que, según Unsloth, acelera la inferencia entre 1,5 y 2 veces sin pérdida de precisión. El modelo soporta una ventana de contexto nativa de 262.144 tokens, extensible hasta 1.010.000, e incluye mejoras específicas para codificación agéntica, razonamiento de nivel repositorio y conservación del contexto de pensamiento en conversaciones iterativas. La licencia Apache 2.0 permite uso comercial sin restricciones significativas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Causal LM con vision encoder, MoE híbrido (Gated DeltaNet + Gated Attention) |
| Parametros totales | 35.505.251.456 |
| Parametros activos | 3.000 millones (8 expertos rutados + 1 compartido de 256) |
| Longitud de contexto | 262.144 tokens nativo, extensible a 1.010.000 |
| Tipos de cuantizacion | GGUF (incluye UD-Q4_K_XL; otras cuantizaciones no especificadas) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

La arquitectura combina un encoder de visión con un modelo de lenguaje MoE de 40 capas. Cada bloque sigue un patrón de 10 × (3 × (Gated DeltaNet → MoE) → 1 × (Gated Attention → MoE)). Las capas Gated DeltaNet usan atención lineal con 32 cabezas para V y 16 para QK (dimensión 128), mientras que las capas Gated Attention emplean 16 cabezas para Q y 2 para KV (dimensión 256, RoPE de 64). El MoE tiene 256 expertos con 8 rutados y 1 compartido, con dimensión intermedia de 512. El embedding de tokens es de 248.320 (padded).

El entrenamiento incluyó fases de pre-entrenamiento y post-entrenamiento, con la cabeza MTP entrenada mediante múltiples pasos. Según la documentación de Qwen, se priorizó la estabilidad y utilidad real, con mejoras en codificación agéntica (flujos de frontend y razonamiento a nivel repositorio) y una opción para conservar el contexto de razonamiento de mensajes históricos. Los detalles exactos del dataset y el proceso de alineación (RLHF/DPO) no están disponibles en la información proporcionada.

## Capacidades

- Generación de texto y razonamiento multimodal: acepta entradas de imagen y texto (pipeline image-text-to-text).
- Codificación agéntica: manejo de flujos de frontend y razonamiento a nivel repositorio con mayor fluidez.
- Tool calling / function calling: soporte mejorado para parseo de objetos anidados, compatible con Codex, OpenCode y otras herramientas.
- Razonamiento multi-step y modo pensamiento: conservación opcional del contexto de razonamiento histórico para desarrollo iterativo.
- MTP (Multi-Token Prediction): genera múltiples tokens por paso, acelerando la inferencia entre 1,5 y 2 veces sin pérdida de precisión.
- Multilingüe: no se especifican idiomas concretos en la información disponible, aunque la familia Qwen suele cubrir múltiples idiomas.

## Casos de uso

- Asistente de programación en IDE: el modelo puede integrarse en editores como VS Code o continuaciones tipo Copilot, aprovechando su contexto de 262K tokens para analizar repositorios completos y sugerir cambios coherentes a nivel de proyecto.
- Agente autónomo de resolución de issues: gracias a su soporte de tool calling y razonamiento agéntico, puede recibir un issue de GitHub, explorar el código, ejecutar comandos y generar un pull request con la solución.
- Chat multimodal de documentación técnica: al aceptar imágenes, puede interpretar capturas de pantalla de errores, diagramas de arquitectura o wireframes y generar explicaciones o código asociado.
- Generación de frontend a partir de diseño: con el encoder de visión, puede convertir una imagen de un mockup en código HTML/CSS/React, aprovechando su entrenamiento específico en flujos de frontend.
- Automatización de atención al cliente con contexto largo: su ventana de 262K tokens permite mantener conversaciones multi-turno extensas con historial completo y documentos de referencia sin truncamiento.
- Servidor de inferencia local para equipos de desarrollo: desplegado con llama.cpp o Unsloth Studio, permite a un equipo compartir un endpoint privado con generación de código y razonamiento, sin depender de APIs externas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card oficial de Qwen incluye una tabla comparativa con Qwen3.5-27B, Gemma4-31B y Qwen3.5-35BA3B, pero los valores numéricos no están accesibles en el extracto proporcionado. Se recomienda consultar el blog oficial de Qwen para datos de MMLU, HumanEval, GSM8K y otras métricas.

## Requisitos de hardware

- VRAM estimada: al tratarse de un MoE con 3B activos, la inferencia es eficiente. Para cuantización Q4 (tipo UD-Q4_K_XL), se estima un uso de VRAM en torno a 20-25 GB, aunque no se dispone del dato exacto. Es una estimación razonable basada en el tamaño total de parámetros.
- GPU recomendadas: RTX 4090 (24 GB) o RTX 5060 Ti (16 GB) pueden ejecutar cuantizaciones bajas. Según datos de la comunidad, en una RTX 5060 Ti se alcanzan ~144 tok/s con MTP activado (frente a 98 tok/s sin MTP, ~1.47x). En RTX PRO 6000 el speedup es ~1.17x.
- Compatibilidad con consumer GPU: sí, siempre que se use una cuantización GGUF adecuada (Q4 o inferior) y se descarguen todos los pesos a VRAM o se use offloading parcial a RAM.
- Opciones de despliegue: llama.cpp (con soporte MTP mediante `--spec-type draft-mtp`), llama-server, Unsloth Studio, vLLM, SGLang y KTransformers (para el modelo base en formato Transformers).
- Latencia y throughput: con MTP, se reportan mejoras de 1.17x a 1.47x según la GPU. Sin MTP, el throughput depende de la cuantización y el hardware; no se dispone de cifras absolutas.

## Comparativa con modelos similares

| Modelo | Parametros totales | Parametros activos | Contexto | Licencia | MTP |
|---|---|---|---|---|---|
| Qwen3.6-35B-A3B (este) | 35.5B | 3B | 262K (ext. 1M) | Apache 2.0 | Sí |
| Qwen3.5-35B-A3B | 35B | 3B | no disponible | Apache 2.0 | No |
| Qwen3.5-27B | 27B | 27B (dense) | no disponible | Apache 2.0 | No |

La comparativa se basa en los datos mencionados en la model card. No se dispone de información detallada sobre Gemma4-31B en el extracto. La principal ventaja de Qwen3.6 frente a sus predecesores es la incorporación de MTP y las mejoras en codificación agéntica y tool calling.

## Limitaciones y advertencias

- No se especifican idiomas soportados en la información disponible; aunque Qwen suele ser multilingüe, no hay confirmación para esta versión.
- La cuantización GGUF puede introducir pérdidas de precisión, especialmente en tareas de razonamiento matemático o lógico complejo. Se recomienda probar la calidad con las cuantizaciones más altas antes de desplegar en producción.
- El soporte MTP en llama.cpp requiere una compilación específica con `-DGGML_CUDA=ON` (o `OFF` para CPU/Metal) y no es compatible con `-np > 1` ni con `--mmproj` (proyección multimodal) según la documentación de Unsloth.
- La ventana de contexto de 262K tokens implica un alto consumo de memoria KV cache; en GPUs consumer puede ser necesario reducir el contexto efectivo.
- Riesgo de alucinación inherente a los modelos generativos; no se han publicado evaluaciones específicas de sesgos o fiabilidad para esta versión.
- El repositorio tiene 531 GB en total (todas las cuantizaciones), por lo que la descarga selectiva de un solo archivo es imprescindible para uso local.

## Enlaces

- Repositorio HuggingFace del modelo cuantizado: https://huggingface.co/Fastiraz/Qwen3.6-35B-A3B-MTP-GGUF
- Repositorio HuggingFace de Unsloth (mismo modelo, fuente original): https://huggingface.co/unsloth/Qwen3.6-35B-A3B-MTP-GGUF
- Modelo base en HuggingFace: https://huggingface.co/Qwen/Qwen3.6-35B-A3B
- Blog oficial de Qwen sobre Qwen3.6-35B-A3B: https://qwen.ai/blog?id=qwen3.6-35b-a3b
- Guía de Unsloth para ejecutar Qwen3.6 con MTP: https://unsloth.ai/docs/models/qwen3.6#mtp-guide
- Guía de InsiderLLM sobre Qwen 3.6 (comparativa 27B vs 35B-A3B): https://insiderllm.com/guides/qwen-3-6-local-ai-guide/
- Guía de InsiderLLM para ejecutar Qwen 3.6 35B MoE localmente: https://insiderllm.com/guides/best-way-run-qwen-3-6-35b-moe-locally/
