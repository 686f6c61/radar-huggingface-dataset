# josch15366/Qwen3.8-27B-DFlash2-FP8

## Resumen

Qwen3.8-27B-DFlash2-FP8 es una cuantización FP8 (W8A8) del modelo draft DFlash2, desarrollado por el laboratorio z-lab (espejo de incoai) para el modelo objetivo Qwen/Qwen3.8-27B. No es un modelo de lenguaje independiente: su función es generar bloques de tokens candidatos dentro de un servidor de decodificación especulativa, que el modelo objetivo verifica posteriormente. Esta arquitectura de "drafter" paralelo permite acelerar la generación autoregrasiva hasta casi 3 veces, manteniendo la misma salida que el modelo base.

La relevancia de esta cuantización radica en que, al ser un drafter, cada token propuesto es verificado contra el modelo objetivo, por lo que una peor calidad del drafter solo afecta a la velocidad, nunca a la corrección. Esto hace que la cuantización sea de bajo riesgo y ofrezca una mejora real en máquinas limitadas por ancho de banda, como la DGX Spark (GB10). El modelo reduce el peso del drafter de 3.85 GB a 2.25 GB, logrando un +6.1 % en velocidad de decodificación sin degradar la longitud de aceptación.

El checkpoint está diseñado para vLLM, pero requiere un parche específico (aún no fusionado en la versión estable) para cargar correctamente la configuración de cuantización y las proyecciones fusionadas. Hasta que esos parches se integren, el modelo sirve principalmente como artefacto de prueba para los desarrolladores que trabajan en esos fallos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DFlash2 (block-diffusion drafter) con cuantizacion FP8 W8A8 |
| Parametros totales | 1.924.404.480 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (hereda del modelo base Qwen3.8-27B) |
| Tipos de cuantizacion | FP8 e4m3, per-channel, dinamico per-token (W8A8) |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo base es DFlash2, un drafter de difusión por bloques para decodificación especulativa. A diferencia de los drafter autoregresivos tradicionales, DFlash2 predice un bloque completo de tokens en paralelo, lo que reduce la latencia por paso. La cuantización FP8 se aplica únicamente a las proyecciones 2D (q, k, v, o, gate, up, down, fc), dejando en BF16 las convoluciones de dos taps, el selector de candidatos y sus codebooks, así como todas las normalizaciones. Esta decisión preserva las partes críticas del mecanismo de difusión por bloques.

El proceso de cuantización se realizó con un script propio (`quantize.py`), no con herramientas estándar como llm-compressor. No se dispone de información sobre el entrenamiento original del drafter (datos, número de tokens, método de alineación), ya que la model card solo documenta el proceso de cuantización y las mediciones posteriores.

## Capacidades

- Generación de tokens candidatos para decodificación especulativa: el modelo propone bloques de tokens que el modelo objetivo verifica, acelerando la inferencia sin cambiar la salida.
- Compatibilidad con vLLM (parcheado): requiere los parches de los issues #53116, #53107, #51581 y los PRs #53122, #51620, #51684 para funcionar correctamente.
- Cuantización FP8 W8A8 con escalas por canal y activaciones dinámicas por token: reduce el peso del drafter de 3.85 GB a 2.25 GB.
- No es un modelo de lenguaje autónomo: no puede generar texto por sí mismo, solo funciona como drafter dentro de un servidor de decodificación especulativa.
- Soporte para hardware Blackwell (GB10, DGX Spark) con `sm_121a`: probado con TP=1 y FlashInfer.

## Casos de uso

- Aceleración de inferencia en servidores de decodificación especulativa: el modelo se integra como drafter en vLLM (parcheado) para acelerar la generación de Qwen3.8-27B, especialmente en máquinas limitadas por ancho de banda como la DGX Spark.
- Despliegue en entornos con memoria limitada: al reducir el peso del drafter a 2.25 GB, permite ejecutar el sistema completo (drafter + modelo objetivo) en GPUs con menos VRAM, como la GB10 de 128 GB unificados.
- Pruebas y desarrollo de parches para vLLM: el checkpoint sirve como artefacto de reproducción para los desarrolladores que trabajan en los fallos de cuantización de drafter en vLLM (issues #53116, #53107, #51581).
- Evaluación de esquemas de cuantización en drafter: permite comparar FP8 W8A8 frente a INT8 W8A16 (como el de `lued/Qwen3.8-27B-DFlash2-W8`) en términos de velocidad y longitud de aceptación.
- Optimización de costes en inferencia a gran escala: al mejorar la velocidad de decodificación en un 6.1 % sin degradar la calidad, reduce el coste por token generado en entornos de producción.
- Investigación en decodificación especulativa: el modelo y su script de cuantización (`quantize.py`) son recursos útiles para estudiar el impacto de la cuantización en drafter de difusión por bloques.

## Benchmarks y rendimiento

La model card incluye mediciones de rendimiento en decodificación especulativa, no benchmarks estándar de lenguaje (MMLU, HumanEval, etc.). Los datos se obtuvieron en una NVIDIA GB10 (DGX Spark, `sm_121a`), TP=1, con el modelo objetivo `RadixArk/Qwen3.8-27B-NVFP4`, `num_speculative_tokens=7`, FlashInfer y caché KV FP8. Se reutilizaron 24 contextos reales de agentes con `max_tokens=256`.

| Drafter | Decode (tok/s) | Longitud de aceptacion | TTFT (s) |
|---|---|---|---|
| BF16 (`z-lab/Qwen3.8-27B-DFlash2`) | 41.3 | 4.24 | 5.6 |
| INT8 W8A16 (`lued/…-W8`) | 43.2 | 4.16 | 5.6 |
| **FP8 W8A8 (este modelo)** | **43.8** | **4.24** | **5.6** |

El modelo FP8 supera al BF16 en un 6.1 % en velocidad de decodificación, manteniendo la misma longitud de aceptación (4.24). Frente al INT8, la diferencia es de solo 1.4 %, dentro del margen de deriva entre sesiones (~2.5 %), por lo que ambos esquemas se consideran indistinguibles a este tamaño de muestra. No se han publicado resultados de benchmarks estándar (MMLU, GSM8K, etc.) en la información disponible.

## Requisitos de hardware

- VRAM estimada: el drafter cuantizado ocupa 2.25 GB en disco; en memoria, el peso total del sistema (drafter + modelo objetivo) depende del modelo objetivo. En las pruebas se usó una DGX Spark con 128 GB de memoria unificada.
- GPU recomendada: NVIDIA GB10 (DGX Spark, `sm_121a`) fue la plataforma de prueba. No se han probado otras GPUs, pero al ser un drafter ligero, podría ejecutarse en GPUs consumer con al menos 8 GB de VRAM para el drafter (aunque el modelo objetivo requerirá más).
- Compatibilidad con consumer GPU: no se ha verificado, pero el drafter FP8 es pequeño (2.25 GB) y podría caber en GPUs como RTX 4060 o superiores, siempre que el modelo objetivo también quepa.
- Opciones de despliegue: vLLM (requiere parches específicos, ver limitaciones). No se menciona soporte para llama.cpp, Ollama o TGI.
- Latencia y throughput: en GB10, decode de 43.8 tok/s, TTFT de 5.6 s, con longitud de aceptación de 4.24 tokens por paso. Estos valores son específicos del hardware y la configuración probada.

## Comparativa con modelos similares

| Modelo | Tipo | Cuantizacion | Tamano (GB) | Decode (tok/s) | Longitud de aceptacion | Licencia |
|---|---|---|---|---|---|---|
| `z-lab/Qwen3.8-27B-DFlash2` (BF16) | Drafter DFlash2 | BF16 | 3.85 | 41.3 | 4.24 | Apache-2.0 |
| `lued/Qwen3.8-27B-DFlash2-W8` | Drafter DFlash2 | INT8 W8A16, group-128 | 2.02 GiB | 43.2 | 4.16 | Apache-2.0 |
| **`josch15366/Qwen3.8-27B-DFlash2-FP8`** | Drafter DFlash2 | FP8 W8A8, per-channel | 2.25 | 43.8 | 4.24 | Apache-2.0 |

Los tres modelos son versiones del mismo drafter DFlash2 para Qwen3.8-27B. La versión FP8 ofrece la mayor velocidad de decodificación, aunque la diferencia con INT8 es marginal. La versión BF16 es la más lenta pero no requiere parches de vLLM. No se dispone de comparativas con otros drafter (como EAGLE o MTP) en la información proporcionada.

## Limitaciones y advertencias

- No es un modelo de lenguaje independiente: solo funciona como drafter dentro de un servidor de decodificación especulativa. No puede generar texto por sí mismo.
- Requiere vLLM parcheado: el checkpoint no carga en vLLM estándar debido a dos defectos conocidos (issues #53116, #53107, #51581). Hasta que los parches se fusionen, el modelo es principalmente un artefacto de prueba.
- Cuantización parcial: solo se cuantizan las proyecciones 2D; las convoluciones, el selector de candidatos y las normalizaciones permanecen en BF16 (0.39 GB). Esto limita la reducción total de peso.
- Mediciones limitadas: los resultados de rendimiento se obtuvieron en un único hardware (GB10), con un solo modelo objetivo, n=24 y una sola secuencia. No son una afirmación general sobre drafter FP8.
- Sin benchmarks estándar: no se han publicado resultados de MMLU, HumanEval, GSM8K u otros, ya que el modelo no es autónomo.
- Sesgos y alucinaciones: al ser un drafter, no genera contenido final; los sesgos y alucinaciones provienen del modelo objetivo. No se dispone de evaluaciones de sesgo para este drafter.
- Licencia: Apache-2.0, permite uso comercial, pero el uso del modelo objetivo (Qwen3.8-27B) puede tener restricciones adicionales según su licencia.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/josch15366/Qwen3.8-27B-DFlash2-FP8
- Modelo base (z-lab): https://huggingface.co/z-lab/Qwen3.8-27B-DFlash2
- Modelo base original (incoai): https://huggingface.co/incoai/Qwen3.8-27B-DFlash2
- Blog de DFlash2: https://inco.ai/blog/dflash2/
- Código de DFlash: https://github.com/z-lab/dflash
- Versión INT8 comparable: https://huggingface.co/lued/Qwen3.8-27B-DFlash2-W8
- Issues de vLLM relacionados: https://github.com/vllm-project/vllm/issues/53116, https://github.com/vllm-project/vllm/issues/53107, https://github.com/vllm-project/vllm/issues/51581
- PRs de vLLM: https://github.com/vllm-project/vllm/pull/53122, https://github.com/vllm-project/vllm/pull/51620, https://github.com/vllm-project/vllm/pull/51684
- Discusión en foros de NVIDIA: https://forums.developer.nvidia.com/t/qwen-3-8-27b-dflash2/380617
- Modelo en ModelScope: https://www.modelscope.cn/models/z-lab/Qwen3.8-27B-DFlash2
