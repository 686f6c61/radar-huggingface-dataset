# jan1k/Hermes3.6-35B-A3B-Uncensored-Genesis-NVFP4-GGUF

## Resumen

Hermes3.6-35B-A3B-Uncensored-Genesis-NVFP4-GGUF es una cuantización en formato GGUF con precisión NVFP4 (NVIDIA 4-bit Floating Point) del modelo MoE (Mixture of Experts) Qwen3.6-35B-A3B, desarrollado originalmente por LuffyTheFox y HauhauCS. El modelo base combina un fine-tuning "Hermes" con la técnica de restauración de señal "Genesis" sobre una variante sin censura de Qwen3.6, lo que lo orienta a usos conversacionales y de generación de código sin restricciones de contenido. Esta versión concreta, publicada por jan1k, está pensada para ejecutarse en hardware NVIDIA con soporte FP4 (Blackwell, Ada o Ampere) mediante llama.cpp, ofreciendo una relación entre velocidad y calidad muy alta gracias a la cuantización de 4 bits en coma flotante.

El modelo tiene 35 000 millones de parámetros totales pero solo 3 000 millones activos por token, lo que lo hace especialmente eficiente en memoria y cómputo. Incluye además un proyector de visión (mmproj) en F16 que permite procesar imágenes, convirtiéndolo en un modelo multimodal. La licencia Apache 2.0 permite uso comercial sin restricciones, y el contexto soportado alcanza hasta 128 000 tokens, aunque la configuración recomendada en la documentación usa 65 536.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE (Mixture of Experts) con atención híbrida: Gated DeltaNet lineal y atención softmax completa en proporción 3:1, 40 capas (según modelos hermanos de la serie) |
| Parametros totales | 446 571 248 (modelo base en safetensors) |
| Parametros activos | 3 000 millones (A3B) |
| Longitud de contexto | 64 000 tokens (probado hasta 128 000) |
| Tipos de cuantizacion | NVFP4 (4-bit floating point) en GGUF; proyector de visión en F16 |
| Idiomas soportados | Inglés, multilingüe (no se especifican lenguas concretas) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (con archivo mmproj separado en F16) |

## Arquitectura y entrenamiento

El modelo base Qwen3.6-35B-A3B emplea una arquitectura MoE con 8 expertos activos por token (según la configuración recomendada `--override-kv qwen2moe.expert_used_count=int:8`). La capa de atención combina Gated DeltaNet (atención lineal) con atención softmax completa en una proporción de 3:1, lo que reduce el coste computacional en contextos largos manteniendo la calidad. El entrenamiento original incluye un fine-tuning "Hermes" (orientado a instrucciones y conversación) y la técnica "Genesis" de restauración de señal, aplicada sobre una base sin censura. No se dispone de información detallada sobre el dataset de entrenamiento ni sobre el uso de RLHF o DPO. La cuantización NVFP4 es una conversión posterior realizada por jan1k, que aprovecha las instrucciones FP4 de las GPUs NVIDIA recientes para acelerar la inferencia.

## Capacidades

- Generación de texto conversacional y de instrucciones, con énfasis en respuestas sin censura.
- Generación de código y asistencia en tareas de programación (modo "Coding" documentado).
- Procesamiento de imágenes mediante el proyector de visión multimodal (mmproj) incluido.
- Razonamiento multi-turno con contexto largo (hasta 128 000 tokens).
- Soporte multilingüe, aunque el idioma principal es el inglés.
- Compatible con plantillas de chat Jinja y modos de razonamiento configurables (activación/desactivación de "thinking").
- No se documenta explícitamente soporte de tool calling o function calling, aunque al derivar de Qwen3.6 es probable que lo herede; no confirmado en esta versión.

## Casos de uso

- Asistente conversacional local sin censura: el modelo puede desplegarse en una máquina personal con GPU NVIDIA (p. ej., RTX 4090) para mantener conversaciones abiertas sobre cualquier tema, gracias a su licencia Apache 2.0 y su tamaño eficiente (3B activos).
- Generación de código en entornos de desarrollo: con el modo "Coding" y la ventana de contexto de 64K, puede ayudar a escribir, revisar y refactorizar código en proyectos medianos, integrándose en flujos de trabajo con llama-server.
- Análisis de imágenes en local: el proyector de visión permite describir o responder preguntas sobre imágenes sin enviar datos a la nube, útil para aplicaciones de privacidad.
- Prototipado de agentes conversacionales: su capacidad de razonamiento y contexto largo lo hace adecuado para pruebas de agentes con memoria extendida, aunque no se confirma tool calling.
- Investigación en modelos sin censura: sirve como base para estudiar comportamientos de modelos desalineados y técnicas de mitigación, dado su carácter "uncensored".
- Despliegue en servidores de baja latencia: al ser MoE con solo 3B activos, puede servir peticiones concurrentes con menor uso de VRAM que un modelo denso equivalente, usando llama.cpp con flash attention.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No se dispone de puntuaciones MMLU, HumanEval, GSM8K u otras para esta cuantización específica ni para el modelo base.

## Requisitos de hardware

- VRAM estimada: el modelo GGUF NVFP4 ocupa aproximadamente 0,9 GB en el repositorio (según tamaño del repo), pero el archivo principal del modelo no se detalla; con 35B parámetros en 4 bits, el peso completo rondaría los 17-18 GB, aunque al ser MoE con 3B activos, la memoria de activación es mucho menor. Se recomienda al menos 16 GB de VRAM para contexto 64K.
- GPU recomendadas: NVIDIA con soporte FP4 (Blackwell, Ada, Ampere), p. ej., RTX 4090, RTX 6000 Ada, A100, H100. En GPUs sin soporte FP4 nativo, la cuantización podría no funcionar o degradar el rendimiento.
- Cabe en GPUs de consumo como la RTX 4090 (24 GB) y la RTX 3090 (24 GB), aunque esta última no tiene soporte FP4 nativo (Ampere sí lo tiene según la card, pero se debe verificar).
- Opciones de despliegue: llama.cpp / llama-server (documentado), también compatible con otros runners que soporten GGUF NVFP4 (Ollama, LM Studio, etc., si implementan el formato).
- Latencia y throughput: no se proporcionan datos concretos; se espera alta velocidad gracias a la cuantización FP4 y la activación selectiva de expertos.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Hermes3.6-35B-A3B-Uncensored-Genesis-NVFP4-GGUF (este) | 35B totales / 3B activos | 64K-128K | NVFP4 GGUF | Apache 2.0 | HuggingFace |
| Qwen3.6-35B-A3B-Uncensored-Genesis-Hermes-V7-GGUF (LuffyTheFox) | 35B totales / 3B activos | 64K-128K | GGUF (varias) | Apache 2.0 | HuggingFace |
| Qwen3.5-32B-A3B (hipotético, no confirmado) | 32B totales / 3B activos | 128K | BF16/GGUF | Apache 2.0 | No disponible |

No se dispone de datos de rendimiento comparativo entre estas variantes. La principal diferencia de esta versión es la cuantización NVFP4, que requiere hardware NVIDIA específico, mientras que otras versiones GGUF usan cuantizaciones estándar (Q4_K_M, etc.) más portables.

## Limitaciones y advertencias

- Modelo "uncensored": puede generar contenido ofensivo, ilegal o peligroso sin filtros; no apto para aplicaciones comerciales sin moderación adicional.
- Riesgo de alucinación: como todo LLM, puede inventar hechos, especialmente en contextos largos o temas especializados.
- Dependencia de hardware NVIDIA con soporte FP4: en GPUs sin instrucciones FP4 nativas, la cuantización puede no cargar o funcionar con bajo rendimiento.
- Contexto máximo de 128K no garantizado: la card indica "probado hasta 64K/128K", pero la configuración recomendada usa 64K; contextos mayores pueden degradar la calidad.
- Idiomas: aunque se declara multilingüe, no se especifican lenguas concretas; el rendimiento fuera del inglés puede ser inferior.
- Licencia Apache 2.0 permite uso comercial, pero el modelo base sin censura puede implicar riesgos legales o éticos según el caso de uso.
- No se documenta soporte de tool calling ni function calling, lo que limita su uso en agentes complejos.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/jan1k/Hermes3.6-35B-A3B-Uncensored-Genesis-NVFP4-GGUF
- Modelo base (HauhauCS): https://huggingface.co/HauhauCS/Qwen3.6-35B-A3B-Uncensored-HauhauCS-Aggressive
- Modelos hermanos de LuffyTheFox (referencia de arquitectura): https://huggingface.co/LuffyTheFox/Qwen3.6-35B-A3B-Uncensored-Genesis-Hermes-V7-GGUF
- Discusión sobre uso práctico del modelo V7: https://huggingface.co/LuffyTheFox/Qwen3.6-35B-A3B-Uncensored-Genesis-Hermes-V12-GGUF/discussions/36
- Ficha del modelo V9 en Ryu: https://ryuhq.com/store/models/LuffyTheFox/Qwen3.6-35B-A3B-Uncensored-Genesis-Hermes-V9-GGUF
- Ficha del modelo V6 en AIModels: https://www.aimodels.fyi/models/huggingFace/qwen3.6-35b-a3b-uncensored-genesis-hermes-v6-gguf-luffythefox
