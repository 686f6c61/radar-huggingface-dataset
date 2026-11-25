# Outlier-Ai/Outlier-Lite-7B-GGUF

## Resumen

Outlier-Lite-7B-GGUF es una cuantización en formato GGUF del modelo Qwen2.5-7B-Instruct, publicada por Outlier-Ai. Se trata de un artefacto de investigación que la propia model card describe como "superseded" (reemplazado): no forma parte de la línea de producto actual del autor y se conserva únicamente por motivos de reproducibilidad e histórico. El modelo base, Qwen2.5-7B-Instruct, es un transformer denso de 7.615.616.512 parámetros desarrollado por Alibaba Qwen, con licencia Apache 2.0.

La relevancia de esta ficha es doble. Por un lado, documenta una variante cuantizada de uno de los modelos instruct de 7B más utilizados para despliegue local en CPU y GPU de consumo. Por otro, sirve como advertencia: el repositorio está marcado como no recomendado para producción, y el autor redirige explícitamente a su línea actual (Outlier Nano 4B, Core 27B, Vision 35B-A3B). Cualquier evaluación técnica debe partir del modelo base Qwen2.5-7B-Instruct y tratar las afirmaciones de la model card como provisionales.

El repositorio ocupa 10,1 GB e incluye múltiples variantes de cuantización (4-bit, 5-bit y 8-bit), orientadas a llama.cpp, Ollama, LM Studio y Jan. El modelo soporta 15 idiomas declarados y function calling, lo que lo hace apto para despliegues offline en Windows, Linux y macOS.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (decoder-only), basado en Qwen2.5-7B-Instruct |
| Parametros totales | 7.615.616.512 |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (el modelo base Qwen2.5-7B-Instruct soporta hasta 131.072 tokens, pero la model card de esta cuantizacion no lo especifica) |
| Tipos de cuantizacion | 4-bit, 5-bit, 8-bit (GGUF) |
| Idiomas soportados | en, zh, fr, es, pt, de, it, ru, ja, ko, ar, vi, th, nl, pl |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (safetensors en el modelo base) |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Qwen2.5-7B-Instruct: un transformer decoder-only denso con atención por grupos (GQA) y normalización RMSNorm, entrenado por Alibaba Qwen. Esta publicación no aporta información sobre el proceso de entrenamiento del modelo base (número de tokens, composición del dataset, fases de RLHF o DPO), y la model card no incluye detalles técnicos adicionales más allá de indicar que se trata de una cuantización del modelo original.

El trabajo específico de Outlier-Ai consiste en la cuantización a formatos GGUF de 4, 5 y 8 bits para su uso con llama.cpp y sus derivados. La model card advierte que el artefacto puede contener "adapters, overlays o variantes de cuantización experimentales que no llegaron al producto final", por lo que no debe asumirse paridad exacta de comportamiento con el modelo base. No se documentan innovaciones técnicas propias (decodificación especulativa, atención lineal ni modificaciones arquitectónicas).

## Capacidades

- Generación de texto y conversación multi-turno en formato chat/instruct.
- Razonamiento general y respuesta a preguntas de conocimiento.
- Generación de código y matemáticas (heredadas del modelo base Qwen2.5-7B-Instruct).
- Soporte de function calling / tool calling, según los tags del repositorio.
- Capacidades multilingües en 15 idiomas: inglés, chino, francés, español, portugués, alemán, italiano, ruso, japonés, coreano, árabe, vietnamita, tailandés, neerlandés y polaco.
- Ejecución local offline en CPU y en GPU de consumo, gracias al formato GGUF.
- Compatibilidad con endpoints (tag `endpoints_compatible`).
- No se declaran capacidades de visión, audio ni modo "thinking" explícito.

## Casos de uso

- Asistente conversacional local offline: el modelo puede gestionar diálogos multi-turno sin conexión a internet, adecuado para entornos con requisitos de privacidad o air-gapped, usando llama.cpp u Ollama sobre CPU.
- Prototipado y evaluación de pipelines de cuantización: al ser un artefacto de investigación con variantes 4/5/8-bit, sirve para comparar la degradación de calidad entre niveles de cuantización sobre un mismo modelo base.
- Generación de código en estaciones de trabajo sin GPU dedicada: con cuantización 4-bit puede ejecutarse en CPU y asistir en tareas de autocompletado o explicación de código.
- Integración en aplicaciones de escritorio con LM Studio o Jan: el formato GGUF y los tags de compatibilidad permiten cargarlo directamente en interfaces de escritorio para uso personal.
- Automatización con function calling en scripts locales: el soporte de tool calling permite conectar el modelo a herramientas locales (sistema de ficheros, APIs internas) en flujos de automatización sencillos.
- Traducción y procesamiento multilingüe: con 15 idiomas declarados, puede emplearse en tareas de traducción o resumen entre pares como español-francés o inglés-chino en entornos sin acceso a la nube.
- Reproducibilidad de experimentos: al estar preservado como artefacto histórico, es útil para replicar resultados de evaluaciones previas sobre esta cuantización concreta.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente que "los números de experimentos internos no son las pruebas de release" y no incluye tabla de resultados.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 4-5 GB en cuantización 4-bit (Q4), 5-6 GB en 5-bit y 8-9 GB en 8-bit, calculados a partir de los 7.615.616.512 parámetros; no confirmado por el autor.
- GPU recomendadas: RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4090, A100 o H100 para mayor throughput. En 8-bit se recomienda al menos 12 GB de VRAM.
- GPU de consumo: sí, cabe en GPU consumer con 8 GB o más en 4-bit; en 8-bit requiere 12 GB o más.
- CPU: ejecutable en CPU mediante llama.cpp, aunque con latencia notablemente superior.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, Jan; también vLLM o TGI si se convierte desde el modelo base, aunque el repositorio solo distribuye GGUF.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Outlier-Lite-7B-GGUF | 7,6 B | no disponible | Apache 2.0 | GGUF | Artefacto de investigación, no recomendado para producción |
| Qwen2.5-7B-Instruct | 7,6 B | 131.072 tokens (modelo base) | Apache 2.0 | safetensors | Modelo original, referencia de calidad |
| Outlier Nano 4B | 4 B | no disponible | no disponible | MLX 4-bit | Tier de entrada actual de Outlier |
| Outlier Lite 9B | 9 B | no disponible | no disponible | MLX 4-bit | Tier Lite actual de Outlier |

## Limitaciones y advertencias

- Repositorio marcado como "superseded": el propio autor lo describe como artefacto de investigación no recomendado para producción.
- La model card advierte de posibles adapters u overlays experimentales que no llegaron al producto final; el comportamiento puede diferir del modelo base.
- Riesgo de alucinación inherente a los modelos de 7B, especialmente en tareas de razonamiento complejo o conocimiento factual especializado.
- Sesgos heredados del corpus de entrenamiento de Qwen2.5, no documentados en esta publicación.
- La longitud de contexto efectiva de esta cuantización no está especificada; no debe asumirse el contexto completo del modelo base sin verificación.
- La cuantización a 4-bit puede degradar la calidad en tareas sensibles (matemáticas, código, instrucciones largas) respecto al modelo en precisión completa.
- Aunque la licencia es Apache 2.0, conviene revisar los términos del modelo base Qwen2.5-7B-Instruct antes de uso comercial.
- Solo 314 descargas y 0 likes en el momento de la consulta: baja validación comunitaria.
- El modelo no incluye visión ni audio; para capacidades multimodales el autor redirige a Outlier Vision 35B-A3B.

## Enlaces

- Hugging Face: https://huggingface.co/Outlier-Ai/Outlier-Lite-7B-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-7B-Instruct
- Sitio del autor: https://outlier.host/
- Outlier Nano 4B: https://huggingface.co/Outlier-Ai/Outlier-Nano-4B-MLX-4bit
- Outlier Lite 9B: https://huggingface.co/Outlier-Ai/Outlier-Lite-9B-MLX-4bit
- Outlier Core 27B: https://huggingface.co/Outlier-Ai/Outlier-Core-27B-MLX-4bit
- Outlier Vision 35B-A3B: https://huggingface.co/Outlier-Ai/Outlier-Vision-35B-A3B-MLX-4bit
- Outlier Quick 26B: https://huggingface.co/Outlier-Ai/Outlier-Quick-26B-MLX-4bit
- DeepSeek-R1-Distill-Qwen-7B (Outlier): https://huggingface.co/Outlier-Ai/DeepSeek-R1-Distill-Qwen-7B-MLX-4bit
- Qwen3-Coder-30B-A3B (Outlier): https://huggingface.co/Outlier-Ai/Qwen3-Coder-30B-A3B-Instruct-MLX-4bit
