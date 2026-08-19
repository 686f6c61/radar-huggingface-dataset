# lued/Qwen3.8-27B-huihui-abliterated-INT8-W8A16-MTP

## Resumen

Este modelo es una cuantización numérica W8A16 (INT8 pesos, activaciones FP16/BF16) del checkpoint abliterated huihui-ai/Huihui-Qwen3.8-27B-abliterated, que a su vez es una versión sin censura del Qwen3.8-27B de Alibaba. La cuantización está diseñada específicamente para GPUs Ampere (sm_86) como la RTX 3090, donde no hay soporte nativo para FP8, y mantiene intactos la torre de visión, los controles de razonamiento, el contexto nativo de 262K tokens y el cabezal MTP (Multi-Token Prediction) en BF16. El objetivo es permitir la inferencia de un modelo de 27,78B parámetros en dos RTX 3090 con una degradación mínima respecto al teacher BF16 (KLD media de 0,000705 nats/token y acuerdo top-1 del 98,72% en una suite de 467 posiciones).

La relevancia de este lanzamiento radica en combinar dos características demandadas por la comunidad: la eliminación de rechazos (abliteration) para casos de uso que requieren respuestas sin restricciones de seguridad, y una cuantización eficiente que hace viable su despliegue en hardware de consumo de gama alta. Es una opción práctica para desarrolladores que necesitan un modelo multimodal de 27B con capacidades de agente, tool calling y razonamiento, pero con requisitos de VRAM reducidos.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso multimodal (visión-lenguaje) con MTP |
| Parametros totales | 27.781.427.952 (27,78B) |
| Longitud de contexto | 262.144 tokens (262K) |
| Tipos de cuantizacion | W8A16 (INT8 pesos, FP16/BF16 activaciones), group size 128, RTN simétrico sin datos |
| Idiomas soportados | No disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (compressed-tensors, pack-quantized) |

## Arquitectura y entrenamiento

El modelo base es Qwen3.8-27B, un transformer denso de 27B parámetros con capacidades multimodales (entrada de imagen y video) y una ventana de contexto nativa de 262K tokens. Incorpora un módulo MTP para decodificación especulativa, que se conserva íntegramente en BF16 en esta cuantización (15 tensores byte-idénticos al original). La abliteration se realizó con la técnica remove-refusals-with-transformers, que elimina los rechazos de seguridad en las primeras 15 capas sin modificar el resto del modelo. La cuantización W8A16 se aplicó con llm-compressor, utilizando RTN simétrico sin datos con group size 128, cuantificando 400 GEMMs (192 MLP, 64 attention completa, 144 proyecciones GDN densas) y preservando en BF16 la torre de visión, lm_head, MTP y las puertas GDN recurrentes (96). No se realizó fine-tuning posterior; solo se cambiaron los valores numéricos de los pesos.

## Capacidades

- Generación de texto y razonamiento: mantiene las capacidades del modelo base, incluyendo razonamiento configurable (modo pensamiento).
- Multimodal: entrada de imagen y video (torre de visión preservada en BF16).
- Tool calling y function calling: soportado por el modelo base, útil para agentes.
- Agentes y multi-step reasoning: diseñado para tareas agénticas de largo horizonte, según la documentación de Qwen3.8-27B.
- Decodificación especulativa: el cabezal MTP en BF16 permite acelerar la inferencia en vLLM.
- Multilingüe: aunque no se especifican idiomas concretos, Qwen3.8-27B es multilingüe por diseño.
- Sin censura (abliterated): responde sin rechazos de seguridad, lo que puede ser útil en entornos controlados.

## Casos de uso

- Automatización de oficina: el modelo puede generar documentos, resumir correos, crear presentaciones y gestionar tareas administrativas gracias a su razonamiento y tool calling. Su contexto de 262K permite procesar documentos extensos en una sola pasada.
- Generación de código en producción: con soporte para tool calling y un rendimiento destacado en coding (según benchmarks del modelo base), puede integrarse en pipelines de CI/CD para generar, revisar y depurar código.
- Agentes autónomos para navegación web: su razonamiento multi-paso y tool calling lo hace adecuado para agentes que interactúan con APIs y navegadores, como en el benchmark OSWorld (84.3 en el modelo base).
- Análisis de documentos con visión: al aceptar imágenes y video, puede extraer información de capturas, diagramas o vídeos, útil para inspección visual o documentación técnica.
- Asistente de investigación: con 262K de contexto, puede procesar papers extensos y responder preguntas complejas, manteniendo el razonamiento matemático y científico.
- Chat sin restricciones para entornos controlados: la abliteration permite desplegar un asistente conversacional que no rechace temas delicados, útil en investigación de IA o simulaciones, siempre con salvaguardas externas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks funcionales específicos para esta cuantización. La model card solo reporta métricas de fidelidad numérica frente al teacher BF16: KLD media de 0,000705 nats/token y acuerdo top-1 del 98,72% en una suite de 467 posiciones. Se indica explícitamente que estas métricas no son una puntuación de calidad funcional. Para el modelo base Qwen3.8-27B, fuentes externas citan resultados como DeepSWE 42.2, Terminal Bench 73.0 y OSWorld 84.3, pero no se han verificado de forma independiente en esta ficha.

## Requisitos de hardware

- VRAM estimada: los pesos INT8 ocupan aproximadamente 27,8 GB. Con activaciones, KV cache y overhead, se necesita un mínimo de 32-40 GB. La configuración recomendada es dual RTX 3090 (24 GB cada una, 48 GB totales).
- GPU recomendadas: RTX 3090, RTX 3090 Ti, RTX A6000, A100, H100, o cualquier GPU con al menos 32 GB de VRAM. Optimizado para Ampere sm_86.
- Cabe en GPUs de consumo: sí, en configuraciones de doble GPU (por ejemplo, dos RTX 3090). Una sola GPU de 24 GB no es suficiente.
- Opciones de despliegue: vLLM (runtime principal), también compatible con llama.cpp si se convierte a GGUF (aunque no se proporciona en este repo). No se menciona Ollama.
- Latencia y throughput: no disponible. Depende del hardware y de la configuración de vLLM. La decodificación especulativa con MTP puede mejorar el throughput.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Abliteration | Licencia |
|---|---|---|---|---|---|
| lued/Qwen3.8-27B-huihui-abliterated-INT8-W8A16-MTP (este) | 27,78B | 262K | W8A16 INT8 | Sí | Apache-2.0 |
| lued/Qwen3.8-27B-INT8-W8A16-MTP (gemelo sin abliteration) | 27,78B | 262K | W8A16 INT8 | No | Apache-2.0 |
| huihui-ai/Huihui-Qwen3.8-27B-abliterated (base BF16) | 27,78B | 262K | BF16 | Sí | Apache-2.0 |
| Qwen/Qwen3.8-27B (original) | 27,78B | 262K | BF16 | No | Apache-2.0 |

La diferencia principal entre estas variantes es la abliteration y la cuantización. Frente al modelo original, este ofrece menor huella de VRAM a costa de una pérdida numérica mínima. Frente al gemelo sin abliteration, la única diferencia son los pesos del LM (abliterated vs. original).

## Limitaciones y advertencias

- La abliteration es una técnica "cruda" (proof-of-concept) que elimina los rechazos de seguridad, lo que puede generar respuestas inapropiadas, dañinas o ilegales. No debe usarse en producción sin moderación externa.
- La cuantización W8A16 introduce una degradación numérica pequeña pero medible (KLD 0,0007, acuerdo top-1 98,72%), que podría afectar tareas de alta precisión como matemáticas o código.
- No se han realizado evaluaciones funcionales exhaustivas (tool use, coding, multimodal) sobre esta cuantización; las métricas publicadas solo cubren la fidelidad de pesos.
- El contexto de 262K es nativo, pero el rendimiento con contextos largos puede degradarse si no se gestiona adecuadamente la memoria KV cache.
- Los idiomas soportados no están documentados en esta versión; se asume multilingüe por el modelo base, pero no hay garantía.
- Licencia Apache-2.0 permite uso comercial, pero la abliteration puede tener implicaciones éticas y legales dependiendo del caso de uso.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/lued/Qwen3.8-27B-huihui-abliterated-INT8-W8A16-MTP
- Modelo base abliterated: https://huggingface.co/huihui-ai/Huihui-Qwen3.8-27B-abliterated
- Modelo original Qwen3.8-27B: https://huggingface.co/Qwen/Qwen3.8-27B
- Gemelo sin abliteration: https://huggingface.co/lued/Qwen3.8-27B-INT8-W8A16-MTP
- Técnica remove-refusals: https://github.com/Sumandora/remove-refusals-with-transformers
- vLLM: https://github.com/vllm-project/vllm
- llm-compressor: https://github.com/vllm-project/llm-compressor
- GitHub oficial Qwen3.8-27B: https://github.com/AlibabaCloud-Official/Qwen3.8-27B
- Página en LM Studio: https://lmstudio.ai/models/qwen3.8
- Guía completa (blog): https://lovableapp.org/blog/qwen3-8-27b
