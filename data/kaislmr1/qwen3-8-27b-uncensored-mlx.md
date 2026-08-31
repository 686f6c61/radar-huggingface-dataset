# KAISLMR1/Qwen3.8-27B-Uncensored-MLX

## Resumen

El modelo `KAISLMR1/Qwen3.8-27B-Uncensored-MLX` es una versión *abliterada* (con el mecanismo de rechazo eliminado) del modelo `Qwen/Qwen3.8-27B`, cuantizada a formato MLX para ejecutarse en Apple Silicon. El modelo base es un transformer denso de 27.000 millones de parámetros con atención híbrida (Gated DeltaNet lineal + atención completa), visión nativa, control de razonamiento (*thinking mode*), tool-calling y una cabeza MTP para decodificación especulativa. El autor, KAISLMR1 (asociado a OrcaRouter), publica cuatro precisiones de cuantización (2, 4, 6 y 8 bits, afín con grupo de tamaño 64) como subcarpetas, manteniendo la torre de visión, las normas y las capas convolucionales en BF16.

La relevancia de este modelo es estrictamente investigadora: al eliminar la alineación de seguridad, permite estudiar los mecanismos de rechazo en modelos de lenguaje, realizar red-teaming y evaluar la robustez de guardrails. No está pensado para despliegue en producción sin una capa de moderación adicional. El modelo hereda la licencia Apache 2.0 del base y soporta un contexto de 262.000 tokens, con capacidades multimodales (imagen y texto) y multilingües (inglés y chino).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso híbrido (Gated DeltaNet lineal + atención completa) con visión nativa y cabeza MTP |
| Parametros totales | 27B (declarado por el modelo base); 4.665.462.000 en los safetensors cuantizados del repo |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 262.000 tokens (262K) |
| Tipos de cuantizacion | 2/4/6/8 bits (afín, grupo 64); la carpeta raíz contiene la versión 4 bits |
| Idiomas soportados | Inglés, chino |
| Licencia | Apache 2.0 |
| Formato de pesos | MLX (safetensors) |

## Arquitectura y entrenamiento

El modelo base `Qwen3.8-27B` es un transformer denso de 27B parámetros con una arquitectura de atención híbrida que combina capas de Gated DeltaNet (atención lineal) con capas de atención completa, lo que permite manejar ventanas de contexto largas (262K tokens) con menor coste computacional que una atención totalmente cuadrática. Es un modelo de visión-lenguaje nativo: la torre de visión, las normas y las capas convolucionales se mantienen en BF16, mientras que solo los pesos lineales del modelo de lenguaje (incluyendo `embed_tokens` y `lm_head`) se cuantizan en la versión MLX. Incluye una cabeza MTP (multi-token prediction) para decodificación especulativa y soporta control explícito del modo de razonamiento.

El proceso de *abliteration* aplicado por KAISLMR1 consiste en ortogonalizar la dirección de rechazo del stream residual, eliminando de forma efectiva la tendencia del modelo a negarse a responder a ciertas peticiones. No se trata de un entrenamiento desde cero ni de un fine-tuning supervisado, sino de una modificación post-hoc de los pesos. No se ha publicado información sobre el dataset utilizado ni sobre el proceso de entrenamiento del modelo base en esta ficha.

## Capacidades

- Generación de texto y razonamiento multi-step con control de modo *thinking* (activado o desactivado).
- Comprensión de imágenes y diálogo multimodal (image-text-to-text), con la torre de visión preservada en BF16.
- Tool-calling y function calling para integración en agentes autónomos.
- Decodificación especulativa mediante la cabeza MTP, lo que mejora el throughput en inferencia.
- Ventana de contexto larga de 262K tokens, adecuada para documentos extensos y conversaciones multi-turno.
- Soporte multilingüe limitado a inglés y chino.
- Ausencia de rechazos: al estar *abliterado*, responde a peticiones que el modelo original rechazaría, incluido contenido dañino o ilegal.

## Casos de uso

- Investigación en interpretabilidad: estudiar cómo funciona el mecanismo de rechazo en un modelo de 27B y qué dirección del residual stream es responsable de la negativa, comparando el comportamiento antes y después de la ablación.
- Red-teaming y evaluación de jailbreaks: probar técnicas de evasión de guardrails y medir la robustez de los sistemas de moderación ante un modelo sin alineación.
- Desarrollo de capas de moderación: usar este modelo como "peor caso" para entrenar y validar filtros de contenido, clasificadores de toxicidad y sistemas de prevención de abuso.
- Evaluación de robustez frente a cuantización: comparar cómo las diferentes precisiones (2, 4, 6, 8 bits) afectan a la coherencia y estabilidad de las respuestas en un modelo de gran tamaño.
- Estudio de sesgos sin restricciones: analizar los sesgos latentes del modelo base sin la influencia de la alineación de seguridad, lo que puede revelar asociaciones que los guardrails enmascaran.
- Pruebas de sistemas de control de contexto: validar el comportamiento de modelos con ventana de 262K en tareas de recuperación de información a largo plazo, aunque el riesgo de salidas dañinas obliga a entornos aislados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- Plataforma exclusiva para Apple Silicon (chips M-series); no es compatible con GPUs NVIDIA ni AMD sin conversión previa.
- Memoria RAM mínima recomendada según cuantización:
  - 8 bits: 32 GB (tamaño ~27,5 GB, 6 shards)
  - 6 bits: 24–32 GB (tamaño ~22 GB, 5 shards)
  - 4 bits: 24 GB (tamaño ~15 GB, 3 shards)
  - 2 bits: 16 GB (tamaño ~8,7 GB, 2 shards) — calidad severamente degradada, solo para archivo
- Despliegue compatible con LM Studio, MLX, y Ollama (con el proyector de visión `mmproj` incluido).
- No se dispone de datos de latencia o throughput específicos para este modelo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizaciones | Licencia | Alineacion |
|---|---|---|---|---|---|
| Qwen3.8-27B (base) | 27B | 262K | BF16 | Apache 2.0 | Con guardrails |
| Qwen3.8-27B-Uncensored-MLX (este) | 27B | 262K | 2/4/6/8 bits MLX | Apache 2.0 | Abliterado (sin rechazos) |
| Qwen3.8-27B-Uncensored (Ollama/GGUF) | 27B | 262K | 2–8 bits GGUF | Apache 2.0 | Abliterado (sin rechazos) |

No se dispone de resultados de benchmarks comparativos entre estas variantes. La diferencia principal entre el modelo base y las versiones *abliterated* es la ausencia de rechazo, no un cambio en las capacidades técnicas subyacentes.

## Limitaciones y advertencias

- El modelo no tiene guardrails: puede generar instrucciones para malware, exploits, armas, fraude y otro contenido ilegal o peligroso bajo demanda.
- Riesgo elevado de alucinaciones y falsedades presentadas con autoridad, especialmente en modos de baja cuantización.
- La cuantización de 2 bits produce salidas degradadas (bucles de repetición, texto incoherente) y no debe usarse para trabajo real.
- Solo soporta inglés y chino; el rendimiento en otros idiomas no está garantizado.
- La licencia Apache 2.0 permite uso comercial, pero el uso del modelo en producción sin una capa de moderación propia es explícitamente desaconsejado por el autor y puede acarrear responsabilidades legales.
- El modelo conserva visión, tool-calling y contexto largo, lo que amplía la superficie de ataque en usos autónomos o de agente.
- No se han publicado evaluaciones de seguridad ni benchmarks que cuantifiquen el impacto de la ablación en la calidad general.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/KAISLMR1/Qwen3.8-27B-Uncensored-MLX
- Repositorio GitHub (espejo): https://github.com/onurburak9/Qwen3.8-27B-Uncensored-MLX
- Página en Ollama: https://ollama.com/orcarouter/Qwen3.8-27B-Uncensored
- Blog de OrcaRouter con guía de ejecución local: https://www.orcarouter.ai/blog/how-to-run-qwen-3-8-27b-uncensored-locally
- Modelo base original: https://huggingface.co/Qwen/Qwen3.8-27B
- Web de OrcaRouter: https://www.orcarouter.ai
