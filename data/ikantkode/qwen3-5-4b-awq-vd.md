# ikantkode/Qwen3.5-4B-AWQ-vd

## Resumen

`ikantkode/Qwen3.5-4B-AWQ-vd` es una re-cuantización independiente en AWQ INT4 del modelo base `Qwen/Qwen3.5-4B` (desarrollado por Alibaba), publicada por el usuario ikantkode. A diferencia de la cuantización de referencia `QuantTrio/Qwen3.5-4B-AWQ`, esta versión cuantiza **todas** las proyecciones lineales del modelo, incluyendo las capas de self-attention, las proyecciones del mecanismo gated delta-net (atención lineal) y los MLPs, manteniendo en fp16 las normas, embeddings, `in_proj_a/b` y la cabeza MTP. El resultado es un checkpoint de 3,8 GB (frente a 5,7 GB del de referencia), un 35 % más pequeño y con un 35 % menos de bytes de peso por token.

El autor documenta dos defectos corregidos en el proceso de cuantización: el smoothing de activación del fork AutoAWQ asumía una ganancia de norma estilo Llama (`w`) cuando Qwen3.5 usa `(1+w)`, y la cuantización RTN/clipped de los MLPs perdía fidelidad, que fue sustituida por un ajuste por mínimos cuadrados alternados por grupo. Las pruebas A/B frente al checkpoint de referencia muestran coherencia equivalente y salida byte-idéntica en la mayoría de prompts. En hardware AMD Radeon PRO V620 (gfx1030) con kernels parcheados, alcanza 84,5 tok/s en decodificación single-stream, frente a 45,5 tok/s del de referencia.

Esta cuantización es relevante para quienes necesitan ejecutar un modelo multimodal de 4B en GPUs de gama media o en entornos AMD, reduciendo el tráfico de pesos y mejorando la latencia sin sacrificar calidad. El modelo base Qwen3.5-4B es un modelo denso compacto con contexto de 262K tokens, diseñado para razonamiento, código, agentes y comprensión visual.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Híbrida: 8 capas full-attention + 24 capas con gated delta-net / linear-attention (base Qwen3.5-4B) |
| Parametros totales | 4.539.265.536 (4,54 B) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 262K tokens (modelo base); el autor recomienda `--max-model-len 8192` en vLLM |
| Tipos de cuantizacion | AWQ INT4, group_size 128, zero-point asimétrico, empaquetado GEMM; MTP head en fp16 |
| Idiomas soportados | No disponible (el modelo base Qwen3.5 es multilingüe, pero no se especifican idiomas en la ficha) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (incluye `model_mtp.safetensors` para decodificación especulativa) |

## Arquitectura y entrenamiento

El modelo base Qwen3.5-4B es un modelo denso multimodal con una arquitectura híbrida que combina atención completa y atención lineal: 8 capas utilizan full-attention, mientras que las 24 restantes emplean un mecanismo gated delta-net (linear-attention). Esta mezcla permite reducir el coste computacional en secuencias largas manteniendo la calidad en tareas de razonamiento. El modelo fue entrenado con técnicas de fusión temprana de tokens multimodales y escalado de reinforcement learning, según las notas de Alibaba.

La cuantización AWQ INT4 de `ikantkode/Qwen3.5-4B-AWQ-vd` se aplica a todas las proyecciones lineales (QKV, O, MLPs y proyecciones del delta-net), mientras que `in_proj_a`, `in_proj_b`, normas, embeddings y la cabeza MTP se mantienen en fp16. El autor corrigió dos defectos del proceso estándar: el primero, un error en el smoothing de activación que asumía una ganancia de norma incorrecta; el segundo, la pérdida de fidelidad en los MLPs, resuelta mediante un ajuste de escalas por mínimos cuadrados alternados (LS-refit) en lugar de RTN/clipping. El resultado es un checkpoint con un error relativo por módulo ≤ 0,11 frente a los pesos fp16 originales.

No se dispone de información detallada sobre el dataset de entrenamiento, el número de tokens o el proceso de alineación (RLHF/DPO) del modelo base en la documentación proporcionada.

## Capacidades

- Generación de texto y razonamiento multilingüe (heredado del modelo base Qwen3.5-4B).
- Comprensión visual: entrada de imágenes y respuesta a preguntas sobre contenido visual (modelo multimodal).
- Razonamiento matemático y lógico, con buen rendimiento en tareas de código y agentes según las evaluaciones de Alibaba.
- Soporte de decodificación especulativa mediante la cabeza MTP (`qwen3_next_mtp`), aunque en gfx1030 con kernels optimizados para M=1 la verificación MTP resultó más lenta que la decodificación directa.
- Capacidad de ejecución en hardware AMD (gfx1030) con kernels parcheados, alcanzando 84,5 tok/s en decodificación single-stream y 147 tok/s agregados con 5 usuarios concurrentes.
- Compatibilidad con vLLM para inferencia en producción, con soporte de AWQ INT4.

## Casos de uso

- **Asistente multimodal local en GPU de gama media**: gracias a su tamaño reducido (3,8 GB) y al soporte de visión, puede desplegarse en una GPU de 8 GB (por ejemplo, Radeon RX 6600 o RTX 3060) para responder preguntas sobre imágenes y documentos escaneados sin depender de la nube.
- **Inferencia de bajo coste en entornos AMD**: con los kernels parcheados de `ikantkode/gfx1030-vllm-0.26`, un Radeon PRO V620 logra 84,5 tok/s, lo que lo hace viable para aplicaciones interactivas en tiempo real sobre hardware AMD sin necesidad de GPUs NVIDIA.
- **Servicio multi-usuario en un solo nodo**: el rendimiento agregado de 147 tok/s con 5 usuarios concurrentes permite montar un pequeño endpoint de chat o agente con una sola GPU, reduciendo costes de infraestructura.
- **Agente conversacional con contexto largo**: el contexto de 262K tokens del modelo base permite mantener conversaciones extensas o procesar documentos largos; la cuantización AWQ mantiene esa capacidad aunque el autor recomienda limitar a 8192 tokens en vLLM para esta versión.
- **Generación de código asistida**: el modelo base destaca en tareas de programación y agentes; esta cuantización permite integrarlo en entornos de desarrollo locales o en pipelines de CI/CD para autocompletado y revisión de código con baja latencia.
- **Prototipado rápido de aplicaciones multimodales**: al ser Apache-2.0 y tener un tamaño reducido, es adecuado para experimentar con visión-lenguaje en entornos de investigación o startups sin grandes recursos de cómputo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

No obstante, el autor reporta las siguientes mediciones de rendimiento de inferencia en la model card:

| Metrica | QuantTrio/Qwen3.5-4B-AWQ (referencia) | ikantkode/Qwen3.5-4B-AWQ-vd |
|---|---|---|
| Tamaño del checkpoint | 5,7 GB | **3,8 GB** |
| Decodificación single-stream (Radeon PRO V620 + kernels gfx1030) | 45,5 tok/s | **84,5 tok/s** |
| 5 usuarios concurrentes (agregado) | — | 147 tok/s |

Estas cifras requieren los parches de kernel `ikantkode/gfx1030-vllm-0.26`. En otro hardware, el checkpoint sigue beneficiándose de la reducción del tráfico de pesos.

## Requisitos de hardware

- **VRAM estimada**: el checkpoint pesa 3,8 GB; con overhead de inferencia, se estima un uso de 5-6 GB en fp16, por lo que cabe en GPUs de 8 GB.
- **GPU recomendadas**: Radeon PRO V620 (gfx1030) con kernels parcheados para máximo rendimiento; también compatible con GPUs NVIDIA (RTX 3060, 4060, etc.) y cualquier hardware soportado por vLLM con AWQ.
- **Consumer GPU**: sí, cabe en RTX 3060 12 GB, RX 6600 8 GB, o incluso en 8 GB si se limita el contexto.
- **Opciones de despliegue**: vLLM (comando recomendado: `vllm serve ikantkode/Qwen3.5-4B-AWQ-vd --dtype float16 --max-model-len 8192`), o el contenedor Docker `ikantkode/Qwen3.5-vLLM-Deploy` para Radeon PRO V620/gfx1030.
- **Latencia y throughput**: 84,5 tok/s en decodificación single-stream en gfx1030; 147 tok/s agregados con 5 usuarios concurrentes. En hardware sin parches, la velocidad depende del ancho de banda de memoria.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tamaño checkpoint | Licencia | Notas |
|---|---|---|---|---|---|
| Qwen/Qwen3.5-4B (base fp16) | 4,54 B | 262K | ~9 GB | Apache-2.0 | Modelo original, multimodal, mayor VRAM |
| QuantTrio/Qwen3.5-4B-AWQ (referencia) | 4,54 B | 262K | 5,7 GB | Apache-2.0 | Cuantización AWQ estándar, atención en fp16 |
| ikantkode/Qwen3.5-4B-AWQ-vd (este modelo) | 4,54 B | 262K (recomendado 8K) | 3,8 GB | Apache-2.0 | Cuantización completa de todas las proyecciones, optimizada para AMD |

La principal diferencia frente al de referencia es la cuantización de las capas de atención y el ajuste de escalas por mínimos cuadrados, que reduce el tamaño y mejora la velocidad sin pérdida de calidad medible.

## Limitaciones y advertencias

- La cuantización INT4 puede introducir pérdida de precisión en tareas muy sensibles al detalle, aunque el autor reporta un error relativo ≤ 0,11 por módulo y equivalencia en pruebas A/B.
- El rendimiento máximo (84,5 tok/s) solo se alcanza en hardware AMD gfx1030 con los kernels parcheados de `ikantkode/gfx1030-vllm-0.26`; en otros entornos la mejora se limita a la reducción del tráfico de pesos.
- En gfx1030, la decodificación especulativa con MTP resultó más lenta que la decodificación directa; en otros stacks puede ser beneficiosa, pero no está garantizado.
- El autor recomienda limitar el contexto a 8192 tokens en vLLM para esta cuantización, aunque el modelo base soporta 262K; usar contextos más largos puede requerir ajustes de memoria.
- No se han publicado evaluaciones de sesgos o alucinaciones específicas para esta cuantización; se heredan las características del modelo base.
- Al ser una cuantización independiente, no cuenta con el soporte oficial de Alibaba; cualquier problema debe dirigirse al autor (ikantkode).
- La licencia Apache-2.0 permite uso comercial, pero se recomienda verificar los términos del modelo base y de las herramientas de cuantización utilizadas.

## Enlaces

- [Modelo en HuggingFace](https://huggingface.co/ikantkode/Qwen3.5-4B-AWQ-vd)
- [Repositorio de kernels gfx1030 para vLLM (ikantkode/gfx1030-vllm-0.26)](https://github.com/ikantkode/gfx1030-vllm-0.26)
- [Página de vLLM Recipes para Qwen/Qwen3.5-4B](https://recipes.vllm.ai/Qwen/Qwen3.5-4B)
- [Modelo qwen3.5:4b en Ollama](https://ollama.com/library/qwen3.5:4b)
- [Qwen3.5 4B en Jetson AI Lab](https://www.jetson-ai-lab.com/models/qwen3-5-4b/)
- [Página de CanIRun para Qwen 3.5 4B](https://www.canirun.ai/model/qwen3.5-4b)
