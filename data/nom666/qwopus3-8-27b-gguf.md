# nom666/Qwopus3.8-27B-GGUF

## Resumen

Qwopus3.8-27B es un modelo de lenguaje de 27 000 millones de parámetros creado por el usuario nom666 mediante un merge por task arithmetic sobre el modelo base Qwen3.8-27B de Alibaba. El merge trasplanta la destilación de razonamiento del modelo Qwopus3.6-27B-v2 (desarrollado por Jackrong) sobre la arquitectura qwen3_5 de Qwen3.8, manteniendo intactas sus capacidades estructurales: 262 144 tokens de contexto, atención híbrida GDN + full attention y una cabeza de predicción multi-token (MTP) de una capa. El resultado es un modelo que, según su autor, genera significativamente menos tokens para obtener el mismo resultado en tareas de razonamiento y que mejora el modo instruct (no-thinking) respecto al base.

La relevancia de este modelo radica en que combina la solidez de Qwen3.8-27B (Apache 2.0, ejecutable en hardware de consumo) con una destilación de razonamiento estilo Opus, orientada a bucles agénticos y generación de código con la modalidad de pensamiento desactivada. El archivo GGUF incluye el bloque MTP exportado en formato nextn, lo que permite decodificación especulativa nativa en llama.cpp sin configuración adicional. No se trata de un fine-tune con entrenamiento por gradientes, sino de una operación algebraica en el espacio de pesos, lo que simplifica su reproducibilidad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | qwen3_5 (hybrid GDN + full attention, 1 capa MTP) |
| Parametros totales | 27 000 millones (27B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 262 144 tokens |
| Tipos de cuantizacion | Q4_K_M (16 GB), Q8_0 (27 GB) |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (convertido con llama.cpp, MTP exportado como nextn) |

## Arquitectura y entrenamiento

Qwopus3.8-27B se construye mediante task arithmetic en el espacio de pesos. La operación es `Qwopus3.8 = Qwen3.8 + (Qwopus3.6-27B-v2 − Qwen3.6)`, donde Qwen3.6-27B y Qwen3.8-27B comparten un esqueleto qwen3_5 idéntico (64 capas, 5120 de dimensión oculta, vocabulario de 248 000 tokens, atención híbrida GDN + full attention y una cabeza MTP de una capa). Los 1199 tensores fuente coinciden en forma, lo que permite un merge exacto en precisión fp32 con salida bf16, incluyendo los tensores `mtp.*`. No se realizó ningún entrenamiento por gradientes: es una operación puramente algebraica sobre los pesos.

El modelo base Qwen3.8-27B, desarrollado por el equipo Qwen de Alibaba, es un modelo multimodal con codificador de visión (según fuentes externas) y licencia Apache 2.0. El merge conserva la arquitectura completa, incluida la cabeza MTP, que se exporta en el GGUF con el layout nextn para que llama.cpp pueda usarla en decodificación especulativa. La cuantización se realizó con `llama-quantize` a partir de la conversión con `convert_hf_to_gguf`.

## Capacidades

- Generacion de texto y razonamiento: hereda las capacidades del base Qwen3.8-27B, con una destilación de razonamiento que reduce el número de tokens necesarios para resolver tareas complejas.
- Modo thinking y no-thinking: el modelo soporta ambos regímenes. El modo no-thinking (instruct) es el recomendado por el autor para bucles agénticos y generación de código, donde muestra mejoras medibles frente al base.
- Decodificacion especulativa: el bloque MTP exportado permite usar `--spec-type draft-mtp` en llama.cpp, acelerando la generación sin necesidad de un modelo draft separado.
- Capacidades agénticas: orientado a bucles agénticos y tool calling, aunque no se detallan en la model card las funciones específicas de tool use.
- Capacidades multilingües: no se especifican idiomas soportados en la información disponible.
- Vision: el modelo base Qwen3.8-27B incluye un codificador de visión según fuentes externas, pero la model card de Qwopus3.8 no confirma si el merge conserva esta capacidad.

## Casos de uso

- Bucles agénticos con razonamiento desactivado: el modelo está recomendado para agentes que requieren respuestas rápidas y deterministas. Con `--temp 0.3 --top-p 0.9 --top-k 40` y thinking deshabilitado, puede integrarse en pipelines de automatización donde la latencia es crítica.
- Generacion de codigo en produccion: su modo instruct mejorado (4/5 en la suite de instruction-following frente a 2/5 del base) lo hace adecuado para asistentes de programación, generación de funciones y refactorización de código en entornos CI/CD.
- Servicio instruct-style: puede desplegarse como endpoint de chat o completado con `llama-server`, sirviendo peticiones concurrentes con contexto largo (hasta 262K tokens) gracias a la atención híbrida.
- Razonamiento con presupuesto de tokens ajustado: en tareas de lógica y matemáticas con límite de tokens, el modo thinking consume un 45% menos de tokens de razonamiento que el base (10 050 frente a 18 455), útil en entornos con coste por token o memoria limitada.
- Prototipado local en hardware de consumo: el quant Q4_K_M de 16 GB cabe en GPUs de 24 GB VRAM, permitiendo experimentar con un modelo de 27B en una estación de trabajo sin acceso a clústeres.
- Decodificacion especulativa en llama.cpp: el MTP exportado permite acelerar la inferencia en servidores locales sin necesidad de un modelo draft adicional, reduciendo la latencia percibida en aplicaciones interactivas.

## Benchmarks y rendimiento

Los resultados publicados en la model card se midieron en las versiones MTPLX (MLX) del merge sobre Apple M5 Max, no en los quants GGUF. Los quants GGUF se sometieron a pruebas de coherencia y drafting MTP, pero no se benchmarkearon por separado. Se presentan los datos disponibles:

**Modo no-thinking (recomendado):**

| Tarea | Qwopus3.8 4-bit | Qwopus3.8 8-bit | Qwen3.8 8-bit |
|---|---|---|---|
| Suite 38 tareas (instruct/codigo/mates) | 37/38 | 36/38 | 35/38 |
| Subconjunto instruction-following | 4/5 | 3/5 | 2/5 |
| Suite de tareas dificiles (codigo ejecutado + mates + logica) | — | 8/13 @ 2 889 tok | 8/13 @ 3 384 tok |

**Modo thinking (eficiencia de tokens):** en una suite de 13 tareas dificiles con esfuerzo de razonamiento alto, Qwopus3.8 iguala al base (13/13 ambos) pero gasta 10 050 tokens de razonamiento frente a 18 455 del base, un 45% menos.

## Requisitos de hardware

- VRAM estimada: el quant Q4_K_M ocupa 16 GB, suficiente para 24 GB de VRAM con margen para contexto. El quant Q8_0 ocupa 27 GB, requiriendo al menos 32 GB de VRAM o más.
- GPUs recomendadas: para Q4_K_M, una RTX 4090 (24 GB) o similar es suficiente. Para Q8_0, se necesitan GPUs de 32 GB o más, como A6000, A100 40GB o H100.
- Compatibilidad con GPUs de consumo: el Q4_K_M cabe en GPUs de gama alta de consumo (RTX 4090, RTX 4080 16GB con contexto reducido). El Q8_0 no cabe en GPUs de consumo típicas.
- Opciones de despliegue: llama.cpp (llama-server), Ollama, LM Studio. Para el merge específico, llama.cpp es la opción principal por el soporte MTP. vLLM y TGI no están confirmados para este modelo.
- Latencia y throughput: no se proporcionan datos de latencia o throughput en la información disponible. El autor indica que el Q8_0 es el quant más rápido en Apple Metal (los kernels K-quant son el cuello de botella, no el ancho de banda).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Qwopus3.8-27B (este) | 27B | 262 144 | Apache 2.0 | GGUF | Merge con destilación de razonamiento, MTP exportado |
| Qwen3.8-27B (base) | 27B | 262 144 | Apache 2.0 | Safetensors, GGUF | Modelo original de Alibaba, multimodal con visión |
| Qwopus3.6-27B-v2 | 27B | No disponible | No disponible | No disponible | Modelo fuente del task vector, destilación de razonamiento |

La comparativa se limita a los modelos directamente relacionados porque no se dispone de datos de rendimiento frente a otras familias de 27B (p. ej., Gemma 3 27B o Llama 3.3 70B) en la información proporcionada. El merge se posiciona como una mejora sobre Qwen3.8-27B en tareas instruct y de razonamiento con menos tokens, pero el base sigue siendo superior en cargas de thinking muy largas.

## Limitaciones y advertencias

- No es un fine-tune: es un merge en el espacio de pesos. No hubo entrenamiento por gradientes, por lo que las capacidades adquiridas dependen de la calidad del task vector de Qwopus3.6-27B-v2.
- Modo thinking con presupuesto ajustado: el modelo puede deliberar más allá del presupuesto de tokens en algunas indicaciones, lo que puede causar respuestas incompletas si se fija un `max_tokens` estricto.
- El base Qwen3.8-27B es más consistente en cargas de razonamiento muy largas; Qwopus3.8 no es recomendable para tareas de thinking intensivo sin supervisión.
- No se debe usar decodificación greedy en modo thinking (patrón de fallo conocido en la familia Qwen).
- Sesgos y alucinaciones: no se han documentado sesgos específicos ni tasas de alucinación en la información disponible. Como modelo derivado de Qwen, puede heredar sesgos del base.
- Idiomas: no se especifican los idiomas soportados; se asume herencia del base Qwen3.8-27B, pero no está confirmado.
- Los benchmarks publicados se midieron en MLX, no en GGUF; los resultados en GGUF pueden variar ligeramente.
- El modelo tiene 0 descargas y 0 likes en HuggingFace, lo que indica que no ha sido validado por la comunidad.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/nom666/Qwopus3.8-27B-GGUF
- Modelo fuente del task vector (Qwopus3.6-27B-v2): https://huggingface.co/Jackrong/Qwopus3.6-27B-v2
- Base model (Qwen3.8-27B): https://huggingface.co/Qwen/Qwen3.8-27B
- Versiones MTPLX (Apple Silicon): https://huggingface.co/nom666/Qwopus3.8-27B-MTPLX-4bit-Speed y https://huggingface.co/nom666/Qwopus3.8-27B-MTPLX-8bit-Quality
- Guia de ejecucion local (GitHub): https://github.com/qwen3-8-27b/qwen3-8-27b
- Guia de despliegue con Ollama, LM Studio y llama.cpp: https://www.mindstudio.ai/blog/qwen3-8-27b-local-gguf-setup
- Analisis comparativo con Claude Opus: https://www.explainx.ai/blog/qwen-3-8-27b-open-weight-model-claude-opus-comparison-august-2026
- Guia de cuantizaciones y hardware: https://www.yottalabs.ai/post/how-to-run-qwen-3-8-27b-locally-ollama-gguf-single-gpu-2026
- Noticia de lanzamiento: https://gigazine.net/gsc_news/en/20260817-qwen3-8-27b
