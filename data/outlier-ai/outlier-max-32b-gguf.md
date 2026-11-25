# Outlier-Ai/Outlier-Max-32B-GGUF

## Resumen

Outlier-Max-32B-GGUF es una cuantización en formato GGUF del modelo Qwen2.5-32B-Instruct, publicada por Outlier-Ai. Se trata de un artefacto de investigación que la propia model card describe como obsoleto ("superseded") y que no forma parte de la línea de productos actual del autor. El modelo base, Qwen2.5-32B-Instruct, es un transformer denso de 32.763.876.352 parámetros (aproximadamente 32,8 mil millones) desarrollado por Alibaba Qwen, orientado a generación de texto, conversación y function calling.

La relevancia de esta ficha es doble. Por un lado, documenta una variante cuantizada de un modelo denso de 32B pensada para inferencia local en CPU y GPU de consumo mediante llama.cpp, Ollama, LM Studio o Jan. Por otro, sirve como advertencia: el repositorio se conserva únicamente por reproducibilidad histórica, el autor recomienda descargar sus tiers actuales (Nano 4B, Lite 9B, Quick 26B, Core 27B) y las cifras que aparecían en revisiones anteriores de la model card deben considerarse provisionales.

El modelo hereda del base la licencia Apache 2.0, una ventana de contexto de 32.768 tokens (característica de la familia Qwen2.5) y soporte para 29 idiomas, de los cuales la model card lista 15: inglés, chino, francés, español, portugués, alemán, italiano, ruso, japonés, coreano, árabe, vietnamita, tailandés, neerlandés y polaco.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (decoder-only), basado en Qwen2.5-32B-Instruct |
| Parametros totales | 32.763.876.352 (~32,8 B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 32.768 tokens (heredado de Qwen2.5-32B-Instruct; no confirmado en la model card de esta cuantización) |
| Tipos de cuantizacion | 4-bit, 5-bit y 8-bit (según tags del repositorio); variantes GGUF concretas no detalladas |
| Idiomas soportados | en, zh, fr, es, pt, de, it, ru, ja, ko, ar, vi, th, nl, pl (15 listados; el base declara 29) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (llama.cpp); repositorio de 43,1 GB |

## Arquitectura y entrenamiento

El modelo subyacente es Qwen2.5-32B-Instruct, un transformer decoder-only denso con atención por grupos (GQA, Grouped Query Attention) y RoPE, entrenado por Alibaba Qwen sobre un corpus multilingüe de varios billones de tokens y posteriormente ajustado con instrucciones y preferencias (SFT y optimización de preferencias). La model card de esta cuantización no aporta detalles adicionales sobre el dataset, el número exacto de tokens de entrenamiento ni las etapas de alineación; esos datos deben consultarse en la documentación oficial de Qwen2.5.

La contribución de Outlier-Ai se limita al proceso de cuantización a GGUF para su uso con llama.cpp y derivados. La model card advierte explícitamente que el artefacto puede contener "adaptadores, overlays o variantes de cuantización experimentales que no llegaron al producto final", por lo que no debe asumirse equivalencia exacta de comportamiento con el Qwen2.5-32B-Instruct original. No se documentan innovaciones técnicas propias (decodificación especulativa, atención lineal ni modos de razonamiento extendido).

## Capacidades

- Generación de texto y conversación multi-turno en formato chat/instruct.
- Razonamiento general y respuesta a preguntas de conocimiento.
- Generación y explicación de código, aunque sin especialización explícita en programación.
- Matemáticas de nivel medio, limitadas por el modelo base y la pérdida de precisión de la cuantización.
- Function calling y tool calling, según los tags del repositorio (heredado de Qwen2.5-Instruct).
- Soporte multilingüe en los 15 idiomas listados, con especial solidez en inglés y chino.
- Inferencia totalmente local y offline en CPU, GPU de consumo y Apple Silicon mediante llama.cpp, Ollama, LM Studio o Jan.
- No dispone de visión, audio ni modo de razonamiento extendido (thinking mode).

## Casos de uso

- Asistente conversacional local y privado: desplegado con Ollama o LM Studio en un equipo de sobremesa, permite mantener conversaciones multi-turno sin enviar datos a la nube, gracias a la ventana de 32.768 tokens del modelo base.
- Procesamiento de documentos en lotes offline: resumen y extracción de información de contratos, informes o actas en entornos sin conectividad, usando la cuantización de 4 bits para reducir requisitos de memoria.
- Generación de código en entornos air-gapped: el modelo puede autocompletar funciones y explicar fragmentos dentro de un IDE con integración llama.cpp, sin exponer el código a servicios externos.
- Automatización de soporte interno: con function calling, puede conectarse a herramientas internas (consulta de tickets, bases de conocimiento) en un pipeline de agentes simple.
- Traducción y localización entre los idiomas soportados: útil para pre-traducir documentación técnica de inglés a español, francés o portugués antes de revisión humana.
- Prototipado e investigación de cuantizaciones: al ser un artefacto de investigación, sirve para comparar la degradación de calidad entre 4, 5 y 8 bits frente al modelo original en tareas controladas.
- Educación y experimentación: permite a estudiantes ejecutar un modelo de 32B en hardware de consumo para estudiar comportamiento, sesgos y alineación sin coste de API.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica que las cifras de revisiones anteriores eran "de experimentos internos, no de nuestras pruebas de release" y deben tratarse como provisionales. No se inventan números.

## Requisitos de hardware

- VRAM estimada para inferencia (pesos + overhead de contexto): aproximadamente 18-20 GB en 4 bits, 22-24 GB en 5 bits y 34-36 GB en 8 bits.
- GPU recomendadas: A100 40/80 GB, H100, L40S o RTX 6000 Ada para 8 bits; RTX 4090 (24 GB) o RTX 3090 para 4 y 5 bits con contexto moderado.
- GPU de consumo: cabe en RTX 4090/3090 en 4 bits; en GPUs de 16 GB (RTX 4080, 4060 Ti 16 GB) solo con contexto reducido y offload parcial a RAM.
- CPU y Apple Silicon: viable en CPU con suficiente RAM del sistema (32-64 GB) a velocidades bajas; en Mac con memoria unificada de 32 GB o más mediante llama.cpp.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, Jan y cualquier runtime compatible con GGUF. No se documenta soporte de vLLM o TGI para este artefacto.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato | Licencia | Estado |
|---|---|---|---|---|---|
| Outlier-Max-32B-GGUF | ~32,8 B denso | 32.768 (heredado) | GGUF 4/5/8-bit | Apache 2.0 | Artefacto de investigación, obsoleto |
| Qwen2.5-32B-Instruct | ~32,8 B denso | 32.768 | safetensors | Apache 2.0 | Modelo base oficial, mantenido |
| Outlier-Core-27B-MLX-4bit | no disponible | no disponible | MLX 4-bit | no disponible | Tier actual recomendado por el autor |
| Outlier-Quick-26B-MLX-4bit | no disponible | no disponible | MLX 4-bit | no disponible | Tier actual del autor |

La comparación directa más relevante es con el propio Qwen2.5-32B-Instruct en safetensors: misma arquitectura y licencia, pero sin pérdida de cuantización y con soporte nativo en vLLM y TGI. Para usuarios de Mac, los tiers actuales de Outlier en formato MLX sustituyen a este GGUF según el propio autor.

## Limitaciones y advertencias

- Repositorio marcado como obsoleto y de investigación: el autor no lo recomienda para producción y remite a sus tiers actuales.
- Posible inclusión de adaptadores u overlays experimentales no graduados, según advierte la model card; el comportamiento puede diferir del Qwen2.5-32B-Instruct original.
- Degradación de calidad inherente a la cuantización de 4 y 5 bits, especialmente en matemáticas, código y razonamiento de varios pasos.
- Riesgo de alucinación propio de los modelos de 32B sin verificación externa; no debe usarse como fuente única en dominios críticos.
- Sesgos heredados del corpus de entrenamiento de Qwen2.5, con posible infrarrepresentación de variedades del español distintas de la estándar.
- Ventana de contexto de 32.768 tokens: insuficiente para análisis de repositorios completos o libros extensos sin estrategias de troceado.
- Idiomas: aunque se listan 15, el rendimiento en tailandés, vietnamita o árabe suele ser inferior al de inglés y chino.
- Licencia Apache 2.0 permite uso comercial, pero el estado de investigación del artefacto desaconseja su despliegue en producción sin evaluación propia.
- Sin benchmarks publicados que respalden afirmaciones de rendimiento.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Outlier-Ai/Outlier-Max-32B-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-32B-Instruct
- Sitio del autor: https://outlier.host/
- Tier actual Nano 4B: https://huggingface.co/Outlier-Ai/Outlier-Nano-4B-MLX-4bit
- Tier actual Lite 9B: https://huggingface.co/Outlier-Ai/Outlier-Lite-9B-MLX-4bit
- Tier actual Quick 26B: https://huggingface.co/Outlier-Ai/Outlier-Quick-26B-MLX-4bit
- Tier actual Core 27B: https://huggingface.co/Outlier-Ai/Outlier-Core-27B-MLX-4bit
- Tier multimodal Vision 35B-A3B: https://huggingface.co/Outlier-Ai/Outlier-Vision-35B-A3B-MLX-4bit
- DeepSeek-R1-Distill-Qwen-7B (MLX): https://huggingface.co/Outlier-Ai/DeepSeek-R1-Distill-Qwen-7B-MLX-4bit
- Qwen3-Coder-30B-A3B (MLX): https://huggingface.co/Outlier-Ai/Qwen3-Coder-30B-A3B-Instruct-MLX-4bit
