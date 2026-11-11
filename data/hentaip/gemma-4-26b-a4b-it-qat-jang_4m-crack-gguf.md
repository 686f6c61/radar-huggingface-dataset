# HentaiP/Gemma-4-26B-A4B-it-qat-JANG_4M-CRACK-GGUF

## Resumen

Gemma-4-26B-A4B-it-qat-JANG_4M-CRACK-GGUF es una compilación en formato GGUF de un modelo derivado de la familia Gemma 4, publicada por el usuario HentaiP. El modelo subyacente (dealignai/Gemma-4-26B-A4B-it-qat-JANG_4M-CRACK) parte de un Gemma 4 de 26B con arquitectura Mixture of Experts (MoE), con unos 25.233 millones de parámetros totales y, segun la nomenclatura "A4B", aproximadamente 4.000 millones de parámetros activos por token. Esta versión concreta es solo texto: se ha eliminado la torre de visión y se ha convertido a `Gemma4ForCausalLM`.

La cadena de derivación es relevante para entender qué se está descargando. El modelo original fue cuantizado con quantización consciente del entrenamiento (QAT) y posteriormente en formato MLX affine 4/8-bit (etiqueta JANG_4M). Sobre esa versión, el autor upstream "CRACK" aplicó un proceso de abliteration (eliminación del comportamiento de rechazo). Finalmente, HentaiP dequantizó esos pesos a BF16, eliminó la parte de visión y generó los GGUF con llama.cpp.

Es relevante ahora porque ofrece una vía práctica de ejecutar un MoE de ~26B con solo ~4B activos en hardware de consumo mediante llama.cpp, con cuantizaciones que van desde Q2_K (~10 GB) hasta F16 (~50,5 GB). No obstante, conviene tratar el modelo con cautela: procede de una cadena de modificaciones no oficiales, no incluye datos de benchmarks propios y la abliteration afecta a su comportamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer Mixture of Experts (MoE), derivada de Gemma 4; en esta versión solo texto (`Gemma4ForCausalLM`) |
| Parametros totales | 25.233.142.046 (~25,2B) |
| Parametros activos | ~4B (según nomenclatura "A4B"; dato exacto no disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | F16, Q8_0, Q4_K_M, Q2_K (generadas con `llama-quantize`, sin imatrix) |
| Idiomas soportados | en, ja, zh |
| Licencia | gemma |
| Formato de pesos | GGUF (llama.cpp) |
| Tamano del repo | 54,2 GB |
| Revision base | `4a1a18e` del modelo dealignai/Gemma-4-26B-A4B-it-qat-JANG_4M-CRACK |
| Commit llama.cpp requerido | `711780f` (octubre 2026) o superior |

## Arquitectura y entrenamiento

La arquitectura es un transformer con capas Mixture of Experts, heredada de Gemma 4. El modelo base pasó por quantización consciente del entrenamiento (QAT) y luego por una cuantización MLX affine de 4/8 bits (JANG_4M). Sobre esa base, el modelo "CRACK" aplicó abliteration para eliminar el comportamiento de rechazo. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si hubo etapas de RLHF o DPO en la cadena original.

El proceso de conversión a GGUF consistió en: dequantizar los pesos MLX a BF16 safetensors, eliminar la torre de visión para dejar un modelo solo texto, convertir con `convert_hf_to_gguf.py --outtype f16` en el commit `711780f` y cuantizar desde ese F16 con `llama-quantize` sin imatrix. Una particularidad técnica importante: las proyecciones gate y up de los expertos MoE se almacenan fusionadas como `ffn_gate_up_exps`, lo que exige builds recientes de llama.cpp; las versiones antiguas que esperan tensores separados `ffn_gate_exps` / `ffn_up_exps` no cargarán estos ficheros. El autor indica que todos los ficheros pasan una comprobación de límites de tensores, por lo que no necesitan el parche de padding de 15 MB de otros repos.

## Capacidades

- Generación de texto conversacional multi-turno (pipeline `text-generation`, tag `conversational`).
- Razonamiento y respuesta a instrucciones, heredado del modelo base "it" (instruction-tuned).
- Soporte multilingüe limitado a inglés, japonés y chino según los metadatos del modelo.
- Comportamiento sin rechazos (abliterated): el modelo no aplica las negativas típicas de seguridad del modelo original.
- Compatibilidad con endpoints (`endpoints_compatible`) y con llama.cpp.
- Capacidades de visión: no disponibles en esta versión (torre de visión eliminada).
- Tool calling / function calling: no documentado en la información disponible.
- Capacidades de agente o razonamiento multi-paso: no documentadas explícitamente.

## Casos de uso

- Inferencia local en hardware de consumo: gracias a su naturaleza MoE con ~4B parámetros activos, la cuantización Q4_K_M (~16 GB) permite ejecutar el modelo en GPUs de gama alta para consumidores, con un coste computacional por token inferior al de un denso de 25B.
- Despliegue en entornos con memoria limitada: la variante Q2_K (~10 GB) permite cargar el modelo en GPUs de 12-16 GB, aunque el autor advierte de una pérdida notable de calidad; sería adecuada solo para pruebas o tareas poco exigentes.
- Generación de texto en inglés, japonés y chino: útil para prototipos de asistentes conversacionales en esos tres idiomas, sin esperar cobertura de otros.
- Investigación sobre alineación y seguridad: al ser un modelo abliterated, sirve como objeto de estudio para analizar cómo la eliminación del rechazo afecta a las respuestas y para construir clasificadores o filtros externos.
- Experimentación con llama.cpp y MoE: útil para validar pipelines de conversión GGUF, cuantización y despliegue de arquitecturas MoE con tensores fusionados (`ffn_gate_up_exps`).
- Entornos de investigación sin restricciones de contenido: escenarios controlados donde se necesita un modelo que no aplique negativas por defecto, siempre con supervisión y filtros propios.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas de MMLU, HumanEval, GSM8K ni comparaciones numéricas con otros modelos.

## Requisitos de hardware

- VRAM estimada según cuantización: F16 ~50,5 GB; Q8_0 ~27 GB; Q4_K_M ~16 GB; Q2_K ~10 GB (tamaños de fichero indicados por el autor; la VRAM real depende del contexto y del offloading).
- GPU recomendadas: para Q4_K_M o superiores conviene una GPU con 24 GB o más (RTX 3090/4090, A6000); para Q8_0 y F16 se requiere A100 40/80 GB, H100 o configuraciones multi-GPU.
- GPU de consumo: Q2_K cabe en GPUs de 12-16 GB (por ejemplo RTX 4070 Ti, RTX 4080); Q4_K_M puede caber en 16 GB con contexto reducido o con offloading parcial a CPU.
- Opciones de despliegue: llama.cpp (requiere commit `711780f` o superior), y por extensión frontends compatibles como Ollama o servidores basados en llama.cpp. vLLM y TGI no están documentados para estos ficheros GGUF con tensores fusionados.
- Latencia y throughput: no disponibles. Al ser MoE con ~4B activos, se espera un throughput por token superior al de un denso de 25B, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Gemma-4-26B-A4B-it-qat-JANG_4M-CRACK-GGUF (este) | ~25,2B totales / ~4B activos | no disponible | gemma | GGUF | Solo texto, abliterated, cadena de derivación no oficial |
| Modelo base dealignai/Gemma-4-26B-A4B-it-qat-JANG_4M-CRACK | ~25,2B totales / ~4B activos | no disponible | gemma | MLX (JANG_4M) | Incluye visión, abliterated |
| Gemma 4 26B A4B original (familia) | ~26B totales / ~4B activos | no disponible | gemma | safetensors | Con alineación de seguridad y visión, según familia |

No se dispone de datos de rendimiento comparativo entre estas variantes en la información proporcionada.

## Limitaciones y advertencias

- Modelo abliterated: el comportamiento de rechazo ha sido eliminado, lo que implica un riesgo elevado de generar contenido dañino, sesgado o inapropiado sin filtros internos. Requiere moderación externa en producción.
- Cadena de derivación no oficial: el modelo pasa por QAT, cuantización MLX, abliteration y reconversión a GGUF; cada paso puede introducir degradaciones no documentadas.
- Solo texto: la torre de visión fue eliminada, por lo que no admite entradas de imagen.
- Idiomas limitados: únicamente inglés, japonés y chino según los metadatos; el rendimiento en otros idiomas no está garantizado.
- Cuantización Q2_K: el propio autor advierte de una pérdida de calidad notable; no recomendada para uso serio.
- Compatibilidad estricta: requiere llama.cpp en el commit `711780f` o posterior por los tensores fusionados `ffn_gate_up_exps`.
- Licencia Gemma: sujeta a los términos de uso de Gemma, que incluyen restricciones de uso comercial y políticas de uso aceptable; conviene revisarlos antes de desplegar.
- Sin benchmarks: no hay evidencia publicada de rendimiento que permita comparar con alternativas.
- Riesgo de alucinación: no cuantificado en la información disponible; como todo modelo generativo, puede producir afirmaciones falsas con seguridad.

## Enlaces

- Hugging Face: https://huggingface.co/HentaiP/Gemma-4-26B-A4B-it-qat-JANG_4M-CRACK-GGUF
- Modelo base: https://huggingface.co/dealignai/Gemma-4-26B-A4B-it-qat-JANG_4M-CRACK
- llama.cpp: https://github.com/ggml-org/llama.cpp
