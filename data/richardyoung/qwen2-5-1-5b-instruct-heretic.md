# richardyoung/Qwen2.5-1.5B-Instruct-heretic

## Resumen

Qwen2.5-1.5B-Instruct-heretic es una variante "abliterated" (también etiquetada como decensored o uncensored) del modelo Qwen2.5-1.5B-Instruct de Alibaba Qwen, publicada por el usuario richardyoung en Hugging Face. El objetivo declarado es eliminar o atenuar el comportamiento de rechazo del modelo original, de modo que responda a peticiones que el modelo alineado rechazaría por defecto. Se distribuye como un fine-tune del checkpoint base Qwen2.5-1.5B, manteniendo la arquitectura transformer decoder-only densa de la familia Qwen2.5.

Con 1.543.714.304 parámetros reales (aproximadamente 1,5 mil millones) y un repositorio de 3,1 GB en safetensors, es un modelo pequeño pensado para inferencia en hardware modesto, incluidas GPU de consumo. El contexto heredado de la familia Qwen2.5 es de 32.768 tokens nativos, ampliable hasta 131.072 mediante RoPE scaling, aunque esa cifra corresponde al modelo base y no está verificada específicamente en esta variante.

La relevancia de esta ficha radica en su carácter de modelo experimental: combina un tamaño reducido, licencia Apache 2.0 y técnicas de "abliteration" reproducibles, lo que lo hace útil para investigación sobre alineación, seguridad y comportamiento de rechazo en modelos pequeños. No obstante, el acceso está restringido (gated) y el modelo solo declara soporte de inglés.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso (familia Qwen2.5) |
| Parametros totales | 1.543.714.304 |
| Parametros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | 32.768 tokens nativos en el modelo base Qwen2.5 (131.072 con RoPE scaling); no verificado en esta variante |
| Tipos de cuantizacion | no disponible en la informacion proporcionada; al ser safetensors, admite cuantizacion estandar (GGUF, AWQ, GPTQ) mediante herramientas externas |
| Idiomas soportados | en (inglés) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (librería transformers) |

## Arquitectura y entrenamiento

La arquitectura es la de Qwen2.5-1.5B: un transformer decoder-only denso con atención por múltiples cabezas, normalización RMSNorm, activación SwiGLU y embeddings rotatorios (RoPE) para la codificación posicional. El modelo base Qwen2.5-1.5B se entrenó sobre un corpus multilingüe de varios billones de tokens (la cifra exacta no se detalla en la información disponible) y posteriormente se sometió a instrucción y alineación. La variante "heretic" parte de Qwen/Qwen2.5-1.5B y aplica una modificación de tipo abliteration, una técnica que identifica la dirección de rechazo en el espacio de activaciones y la proyecta fuera de los pesos, reduciendo la tendencia a negarse a responder.

Los detalles concretos del proceso de abliteration (número de capas intervenidas, magnitud de la proyección, dataset de calibración) no están disponibles en la información proporcionada. El autor etiqueta el modelo como "reproducible", lo que sugiere que el procedimiento se documenta o se puede replicar, pero la ficha no incluye esa documentación. No se indica si hubo RLHF o DPO adicional tras la abliteration, ni el número de tokens empleados en el ajuste.

## Capacidades

- Generación de texto conversacional en inglés, heredada de Qwen2.5-1.5B-Instruct.
- Respuestas a peticiones que el modelo alineado original rechazaría, por efecto de la abliteration.
- Razonamiento básico y resolución de problemas sencillos, limitado por el tamaño de 1,5B.
- Generación de código a nivel introductorio y de scripts cortos.
- Aritmética y matemáticas elementales, con fiabilidad limitada en problemas de varios pasos.
- Soporte de chat multi-turno mediante plantilla de conversación de Qwen2.5.
- Compatibilidad con text-generation-inference y endpoints compatibles, según los tags del repositorio.
- Capacidades de tool calling y agentes: no verificadas en esta variante; el modelo base Qwen2.5-Instruct las soporta, pero la abliteration puede degradarlas.
- Capacidades multimodales (visión, audio): no disponibles.
- Modo "thinking" explícito: no disponible.

## Casos de uso

- Investigación sobre alineación y seguridad: el modelo sirve para estudiar cómo la abliteration afecta a la tasa de rechazo, la coherencia y la calidad de las respuestas en un modelo pequeño, comparándolo con el Qwen2.5-1.5B-Instruct original.
- Generación de datos sintéticos para pruebas de robustez: se puede usar para producir respuestas a prompts que el modelo alineado rechaza, y así construir conjuntos de evaluación de filtros de seguridad.
- Prototipado local en hardware de consumo: con 1,5B parámetros cabe en GPU de 8 GB en cuantización de 4 bits, lo que permite experimentar con un modelo sin censura en un portátil o una estación de trabajo modesta.
- Chat conversacional sin filtros en entornos controlados: útil para investigación creativa o escritura de ficción que requiera temáticas sensibles, siempre con revisión humana.
- Evaluación de pipelines de moderación: al generar contenido que otros modelos rechazan, permite probar clasificadores y guardrails de forma deliberada.
- Docencia y demostraciones: ilustra de forma tangible qué es la abliteration y cómo se comporta un modelo sin alineación, con un coste computacional bajo.
- Generación de código y scripts en inglés para tareas internas de baja criticidad, aceptando la menor fiabilidad frente a modelos mayores.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 3,1 GB en fp16/bf16; unos 1,6 GB en cuantización de 4 bits (estimación a partir del número de parámetros, no medida).
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM para fp16; RTX 3060, RTX 4060, RTX 4090, A100 o H100 funcionan sin problema.
- Cabe en GPU de consumo: sí, en la mayoría de tarjetas con 6 GB o más en fp16, y en tarjetas de 4-8 GB con cuantización.
- Opciones de despliegue: transformers, text-generation-inference (tag del repo), llama.cpp y Ollama mediante conversión a GGUF, vLLM si se genera una versión compatible.
- Latencia y throughput estimados: no disponibles; por el tamaño, se espera un throughput alto en GPU modernas, pero no hay mediciones publicadas en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| Qwen2.5-1.5B-Instruct-heretic | 1,54B | 32.768 (base) | Apache 2.0 | Variante abliterated, acceso gated, solo inglés |
| Qwen2.5-1.5B-Instruct | 1,54B | 32.768 | Apache 2.0 | Modelo original alineado, multilingüe, acceso abierto |
| Llama 3.2 1B Instruct | 1,24B | 128.000 | Llama 3.2 Community License | Alineado, multilingüe, acceso abierto con condiciones |
| Gemma 2 2B Instruct | 2,6B | 8.192 | Gemma Terms of Use | Alineado, acceso abierto con condiciones |

## Limitaciones y advertencias

- La abliteration reduce los rechazos, pero no elimina necesariamente sesgos, toxicidad ni contenido dañino; el modelo puede producir respuestas inapropiadas o falsas con mayor facilidad.
- Riesgo elevado de alucinación, agravado por el tamaño de 1,5B y por la posible degradación de la coherencia tras la intervención en los pesos.
- Solo declara soporte de inglés; el rendimiento en castellano u otros idiomas no está garantizado.
- El contexto de 32.768 tokens corresponde al modelo base y no está verificado en esta variante; la abliteration puede afectar a la calidad en contextos largos.
- Acceso restringido (gated): es necesario aceptar condiciones en Hugging Face antes de descargar los pesos.
- Licencia Apache 2.0 permite uso comercial, pero el usuario es responsable del contenido generado y del cumplimiento normativo aplicable.
- No se han publicado benchmarks ni evaluaciones de seguridad; no se recomienda su uso en producción sin una evaluación propia.
- El modelo tiene muy poca tracción (19 descargas, 0 likes), por lo que carece de validación comunitaria.

## Enlaces

- [Hugging Face: richardyoung/Qwen2.5-1.5B-Instruct-heretic](https://huggingface.co/richardyoung/Qwen2.5-1.5B-Instruct-heretic)
- [Modelo base: Qwen/Qwen2.5-1.5B](https://huggingface.co/Qwen/Qwen2.5-1.5B)
- [Paper de referencia Qwen2.5 (arXiv:2407.10671)](https://arxiv.org/abs/2407.10671)
