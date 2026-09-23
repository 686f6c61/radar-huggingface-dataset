# ressl/Qwen3.8-27B-uncensored-NVFP4

## Resumen

Qwen3.8-27B-uncensored-NVFP4 es una exportación cuantizada en NVFP4 del modelo abliterado ressl/Qwen3.8-27B-uncensored, que a su vez deriva de Qwen/Qwen3.8-27B, un transformer denso multimodal nativo de la familia Qwen3.8. La abliteración, la cuantización y la validación las firma Robert Ressl. El artefacto ocupa 30,1 GB frente a los 55,6 GB del maestro en BF16 y se sirve en una única GPU Blackwell de 96 GB a 44 tok/s de decodificación medida con SGLang.

Su interés para desarrolladores e investigadores es doble. Por un lado, documenta una receta de cuantización selectiva: NVFP4 solo en las proyecciones MLP (`mlp.gate_proj`, `mlp.up_proj`, `mlp.down_proj`), mientras que la atención con compuertas, las rutas Gated DeltaNet, los embeddings, la LM head, la torre de visión y la cabeza MTP permanecen en BF16. Por otro, elimina prácticamente todos los rechazos del modelo original: 804/1120 prompts dañinos rechazados en el modelo base frente a 1/1120 en este export, sobre el mismo conjunto de evaluación cruzada de 1120 prompts.

Conserva los 262.144 tokens de contexto nativos y la entrada de imágenes, pero pierde la cabeza MTP de decodificación especulativa porque ModelOpt descarta los tensores `mtp.*` durante la exportación. El resultado es, por tanto, una herramienta pensada para red-teaming, investigación en seguridad y pruebas de penetración autorizadas, no un modelo de propósito general para aplicaciones orientadas al usuario final.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer denso híbrido: atención lineal Gated DeltaNet + atención completa con compuertas; torre de visión nativa (image-text-to-text) |
| Parámetros totales | 18.800.348.400 según los metadatos de safetensors (la denominación comercial del modelo base es 27B) |
| Parámetros activos | No aplica: modelo denso, no es MoE |
| Longitud de contexto | 262.144 tokens nativos |
| Tipos de cuantización | NVFP4 (W4A4) en las proyecciones MLP; BF16 en atención con compuertas, rutas Gated DeltaNet, embeddings, LM head, torre de visión y cabeza MTP |
| Idiomas soportados | en (inglés), según los metadatos del repositorio |
| Licencia | Apache-2.0 (heredada de Qwen/Qwen3.8-27B) |
| Formato de pesos | safetensors (exportación NVIDIA ModelOpt NVFP4); librería declarada: vllm, validado también con SGLang |
| Tamaño del repositorio | 30,1 GB (desde 55,6 GB en BF16) |
| Hardware validado | 1x NVIDIA RTX PRO 6000 Blackwell 96 GB (SM120) |
| Throughput medido | 44 tok/s de decodificación (SGLang, TP1, `modelopt_fp4`) |
| Cadena de herramientas | NVIDIA ModelOpt 0.46.0, SGLang 0.5.19, transformers 5.15.0 |
| Calibración | mlabonne/harmless_alpaca, 128 muestras, longitud de secuencia 512 |

## Arquitectura y entrenamiento

La arquitectura subyacente es un transformer denso de atención híbrida: combina rutas de atención lineal Gated DeltaNet con capas de atención completa, más una torre de visión que lo convierte en un modelo nativo de imagen-texto. La exportación no modifica la topología; solo cambia el formato numérico de un subconjunto de matrices. La receta de ModelOpt cuantiza exclusivamente las tres proyecciones MLP por capa en NVFP4 y mantiene el resto en BF16, lo que explica que el peso final (30,1 GB) sea bastante superior a lo que cabría esperar de una cuantización W4A4 completa sobre ~19B parámetros, y que la pérdida de calidad medida sea mínima.

Sobre el entrenamiento original de Qwen3.8-27B no se aporta información en los materiales disponibles: no hay número de tokens, composición del dataset ni detalles de RLHF o DPO. Lo que sí se documenta es el proceso de abliteración del maestro BF16: una biproyección que preserva la norma aplicada sobre 128 matrices que escriben en el residual, con el objetivo de eliminar la dirección de rechazo sin degradar el resto de representaciones. El pipeline de abliteración está publicado en el repositorio del maestro y la exportación se realizó con `qwen38_export_nvfp4.py`, auditada mediante `nvfp4_report.json`. La validación del artefacto servido se hizo de extremo a extremo con la cross-eval del autor antes de subirlo.

## Capacidades

- Generación de texto conversacional en inglés con modo de razonamiento activado por defecto; se puede desactivar con `enable_thinking=False` para obtener respuestas directas y cortas.
- Entrada multimodal imagen-texto: la torre de visión se preserva intacta en esta exportación, por lo que acepta imágenes y produce texto.
- Razonamiento multi-paso y cadenas de pensamiento, herencia del modelo base de la familia Qwen3.8.
- Tool calling y function calling, también heredados del modelo base.
- Ventana de contexto de 262.144 tokens, adecuada para documentos extensos, repositorios de código completos o conversaciones muy largas.
- Comportamiento sin rechazos medido: 1 rechazo explícito sobre 1120 prompts dañinos (JailbreakBench, tulu-harmbench, HarmfulQA, LLM-LAT y mlabonne harmful), frente a 804/1120 del modelo base sin abliterar.
- Capacidad de automatización de oficina y flujos agénticos, según la descripción pública del modelo base Qwen3.8-27B.
- No incluye decodificación especulativa MTP: ModelOpt elimina los tensores `mtp.*` en esta exportación.

## Casos de uso

- Red-teaming de sistemas de moderación: el modelo sirve como generador de contenido adversario en inglés para probar clasificadores de toxicidad, filtros de prompt y guardarraíles, con una tasa de rechazo de 1/1120 que evita que el propio generador bloquee las pruebas.
- Investigación en seguridad y alineación: permite reproducir y auditar el efecto de la abliteración comparando las 1120 respuestas de este export con las del maestro BF16 y con el modelo base, que rechaza 804 de esos mismos prompts.
- Pruebas de penetración autorizadas: asiste en entornos controlados con scripting de exploits, análisis de vulnerabilidades y redacción de payloads de prueba, donde un modelo alineado estándar se negaría a colaborar.
- Generación de datos sintéticos para clasificadores: se puede usar para producir ejemplos etiquetados de contenido dañino y alimentar conjuntos de entrenamiento de detectores, algo que un modelo con rechazos activos no puede hacer de forma fiable.
- Análisis documental multimodal: la torre de visión y los 262.144 tokens de contexto permiten procesar capturas de pantalla, documentos escaneados o informes extensos con imágenes intercaladas en una sola pasada.
- Análisis de repositorios de código completos: con contexto nativo de 262.144 tokens cabe un proyecto entero en una única ventana, útil para auditoría de código o generación de documentación técnica.
- Evaluación del impacto de la cuantización: comparar este export NVFP4 contra el maestro BF16 permite medir empíricamente cuánta calidad se pierde al cuantizar solo las proyecciones MLP, con la cross-eval de rechazos como métrica de referencia.
- Agentes automatizados con tool calling en inglés sobre infraestructura propia, siempre que la ausencia de filtros de contenido sea aceptable en el dominio de despliegue.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de conocimiento o razonamiento (MMLU, HumanEval, GSM8K, etc.) en la información disponible. El único conjunto de métricas publicado es el de comportamiento de rechazo, medido a temperatura 0 y con el modo thinking desactivado, contando frases explícitas de declinación en las primeras 25 palabras:

| Conjunto de evaluación | Prompts | Modelo base | Maestro BF16 | Este export |
|---|---|---|---|---|
| JailbreakBench | 100 | 71 | 0 | 0 |
| tulu-harmbench | 320 | 232 | 0 | 0 |
| HarmfulQA | 300 | 207 | 0 | 0 |
| LLM-LAT | 300 | 225 | 0 | 1 |
| mlabonne harmful | 100 | 69 | 0 | 0 |
| **TOTAL** | **1120** | **804** | **0** | **1** |

Rendimiento medido: 44 tok/s de decodificación en SGLang, TP1, con cuantización `modelopt_fp4` sobre una RTX PRO 6000 Blackwell de 96 GB.

## Requisitos de hardware

- VRAM para los pesos: 30,1 GB en NVFP4. A esa cifra hay que sumar la caché KV, que con 262.144 tokens de contexto es el factor dominante en el consumo total.
- GPU recomendadas: NVIDIA RTX PRO 6000 Blackwell 96 GB (SM120), única configuración validada explícitamente por el autor con `--mem-fraction-static 0.85`; GPUs Blackwell de centro de datos (B200, SM100) son el otro destino natural de NVFP4.
- Cabe en GPU de consumo: sí, en las Blackwell para consumidor (RTX 5090, 32 GB), aunque con contexto muy reducido; exportaciones NVFP4 equivalentes de la misma familia con menor footprint (unas 19 GB) se sirven en RTX 5090 con hasta 160k de contexto, según los resultados de búsqueda. No hay confirmación del autor para este export concreto en esa GPU.
- Compatibilidad de generación: NVFP4 requiere hardware Blackwell; el repositorio etiqueta el modelo como `blackwell` y valida sobre SM120. No se declara soporte para Ampere, Ada o Hopper.
- Opciones de despliegue: SGLang (comando validado con `--quantization modelopt_fp4 --tp 1 --context-length 262144 --trust-remote-code`) y vLLM (librería declarada en los metadatos). No hay artefactos GGUF en este repositorio, por lo que llama.cpp y Ollama no son vías directas para esta exportación.
- Latencia y throughput: 44 tok/s de decodificación medidos en TP1 sobre una sola GPU. Al haberse eliminado la cabeza MTP, no hay ganancia por decodificación especulativa.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ressl/Qwen3.8-27B-uncensored-NVFP4 | ~18,8B (denominado 27B) | 262.144 | NVFP4 solo en MLP; resto BF16; 30,1 GB | Apache-2.0 | HuggingFace, 0 descargas, 0 likes |
| preetpatel/Qwen3.8-27B-Uncensored-NVFP4 | No disponible | 160k en RTX 5090 | NVFP4 (W4A4); ~19 GB | No disponible | HuggingFace |
| DevelopingDad/Qwen3.8-27B-Uncensored-NVFP4-MSE-DGX-Spark | No disponible | No disponible | NVFP4 con calibración MSE | No disponible | HuggingFace |
| orcarouter/Qwen3.8-27B-Uncensored | 27B | No disponible | 16 tags de 2 a 8 bits con mmproj de visión incluido | No disponible | Ollama |
| Qwen/Qwen3.8-27B (base sin abliterar) | 27B | No disponible | BF16 | Apache-2.0 | HuggingFace, GitHub |

Frente a las otras exportaciones NVFP4 de la misma familia, este repositorio es el más conservador en la cuantización (solo MLP en FP4) y por tanto el más pesado, a cambio de una pérdida de calidad medible muy baja. Las alternativas son más ligeras y caben en GPUs de consumo, pero no publican cifras de rechazo ni auditoría de cuantización.

## Limitaciones y advertencias

- Elimina deliberadamente la alineación de seguridad: rechaza 1 de cada 1120 prompts dañinos del conjunto de evaluación del autor, frente a 804 del modelo base. No debe desplegarse en aplicaciones orientadas al público sin guardarraíles externos.
- El único rechazo residual (LLM-LAT) se atribuye a la propia cuantización, no al proceso de abliteración: el maestro BF16 responde a ese mismo prompt. Es un recordatorio de que la cuantización puede reintroducir comportamientos que el modelo original ya no tenía.
- La model card está redactada en clave de investigación en seguridad; el autor recomienda uso responsable y no documenta mitigaciones para uso en producción.
- Solo inglés declarado en los metadatos del repositorio, a pesar de que la familia Qwen3.8 suele ser multilingüe. No hay evaluación multilingüe publicada para este export.
- Riesgo de alucinación no cuantificado: no se han publicado benchmarks de conocimiento, razonamiento o fidelidad, por lo que no hay base para estimar la tasa de error factual.
- La cabeza MTP de decodificación especulativa se pierde en la exportación, lo que reduce el throughput potencial respecto al maestro BF16.
- La torre de visión se preserva, pero no se publican métricas de calidad multimodal para este export cuantizado.
- La licencia Apache-2.0 permite uso comercial, pero eso no exime al desplegador de responsabilidad legal sobre el contenido que el modelo genere, especialmente en dominios regulados.
- El repositorio tenía 0 descargas y 0 likes en el momento de la consulta, por lo que no existe validación independiente de terceros más allá de la del propio autor.
- Requiere hardware Blackwell; no es portable a GPUs Ampere, Ada u Hopper en su ruta FP4.
- El modelo es de razonamiento por defecto: sin `enable_thinking=False` genera cadenas de pensamiento largas, lo que incrementa latencia y consumo de tokens en tareas simples.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/ressl/Qwen3.8-27B-uncensored-NVFP4
- Modelo base abliterado en BF16: https://huggingface.co/ressl/Qwen3.8-27B-uncensored
- Modelo original de Qwen: https://huggingface.co/Qwen/Qwen3.8-27B
- Repositorio GitHub de Qwen3.8-27B: https://github.com/AlibabaCloud-Official/Qwen3.8-27B
- Exportación NVFP4 alternativa (preetpatel): https://huggingface.co/preetpatel/Qwen3.8-27B-Uncensored-NVFP4
- Exportación NVFP4 con calibración MSE para DGX Spark: https://huggingface.co/DevelopingDad/Qwen3.8-27B-Uncensored-NVFP4-MSE-DGX-Spark
- Build de Ollama del modelo abliterado: https://ollama.com/orcarouter/Qwen3.8-27B-Uncensored
- Ficha en ThinkLLM: https://thinkllm.dev/models/qwen3-8-27b-uncensored-nvfp4
- Perfil del autor en HuggingFace: https://huggingface.co/ressl
- Sitio web del autor: https://ressl.ch/
- LinkedIn del autor: https://www.linkedin.com/in/robertressl/
