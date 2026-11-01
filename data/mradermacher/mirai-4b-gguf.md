# mradermacher/MiRAI-4B-GGUF

## Resumen

MiRAI-4B-GGUF es la versión cuantizada en formato GGUF del modelo MiRAI-4B, desarrollado originalmente por K-Ai-Official y convertido a GGUF por mradermacher. Se trata de un modelo de lenguaje de 4.022.468.096 parámetros (aproximadamente 4 mil millones) construido sobre la arquitectura Qwen3, según indican las etiquetas del repositorio. El modelo está orientado a tareas conversacionales y multilingües, con especial atención al inglés, indonesio y japonés, y fue afinado mediante QLoRA sobre el framework Unsloth.

El modelo aborda la necesidad de un asistente conversacional compacto con cobertura de idiomas del sudeste asiático y japonés, un nicho menos cubierto por los modelos occidentales de gran tamaño. Su tamaño de 4B parámetros permite desplegarlo en hardware de consumo, lo que resulta relevante para desarrolladores que necesitan inferencia local o en entornos con recursos limitados.

Esta ficha se centra en la distribución GGUF, que ofrece 12 variantes de cuantización desde Q2_K (1,8 GB) hasta f16 (8,2 GB), facilitando su uso con llama.cpp, Ollama y otros motores compatibles con GGUF. La licencia Apache 2.0 permite uso comercial sin restricciones significativas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer, basada en Qwen3 (según etiquetas del repositorio) |
| Parametros totales | 4.022.468.096 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16 |
| Idiomas soportados | en, id, ja |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (safetensors en el modelo base) |

## Arquitectura y entrenamiento

El modelo base MiRAI-4B emplea una arquitectura transformer derivada de Qwen3, según las etiquetas del repositorio (qwen3). El proceso de ajuste se realizó mediante QLoRA, una técnica de fine-tuning con cuantización de bajo rango que reduce los requisitos de memoria durante el entrenamiento, utilizando el framework Unsloth. Esta combinación es habitual para adaptar modelos base a dominios o idiomas específicos con recursos computacionales moderados.

Los datos de entrenamiento declarados en la model card incluyen tres conjuntos de datos: yahma/alpaca-cleaned (instrucciones generales en inglés), FreedomIntelligence/alpaca-gpt4-indonesian y FreedomIntelligence/alpaca-gpt4-japanese (instrucciones traducidas o generadas en indonesio y japonés). No se especifica el número total de tokens de entrenamiento ni si hubo fases de RLHF o DPO. La información sobre innovaciones técnicas adicionales (decodificación especulativa, atención lineal, etc.) no está disponible en la documentación proporcionada.

## Capacidades

- Generación de texto conversacional en inglés, indonesio y japonés, con especial énfasis en los dos últimos por el dataset de entrenamiento.
- Razonamiento básico e instrucciones generales, derivado del dataset alpaca-cleaned.
- Capacidades multilingües limitadas a los tres idiomas declarados (en, id, ja); no se garantiza cobertura de otros idiomas.
- Soporte de conversaciones multi-turno, según la etiqueta "conversational" del repositorio.
- Compatibilidad con endpoints (etiqueta "endpoints_compatible"), lo que sugiere integración con APIs de inferencia.
- No se documentan capacidades de tool calling, function calling, agentes, visión, audio ni modo thinking en la información disponible.

## Casos de uso

- Asistencia conversacional en indonesio y japonés: el modelo puede gestionar diálogos multi-turno en estos idiomas gracias a su entrenamiento específico con datasets alpaca traducidos, siendo adecuado para chatbots de atención al cliente en mercados del sudeste asiático y Japón.
- Despliegue local en estaciones de trabajo: con cuantizaciones Q4_K_M (2,6 GB) o Q5_K_M (3,0 GB), el modelo cabe en GPUs de consumo y permite inferencia offline sin dependencia de servicios cloud.
- Prototipado rápido de aplicaciones multilingües: los desarrolladores pueden integrar el GGUF en llama.cpp u Ollama para validar flujos conversacionales en en/id/ja antes de escalar a modelos mayores.
- Generación de texto asistida en entornos con recursos limitados: el tamaño de 4B parámetros y las cuantizaciones Q2_K (1,8 GB) permiten ejecución en dispositivos con poca VRAM o incluso CPU, útil para aplicaciones embebidas.
- Traducción y adaptación de contenido entre inglés, indonesio y japonés: aunque no es un modelo de traducción especializado, su entrenamiento con datasets paralelos alpaca en estos idiomas le permite asistir en tareas de reescritura y adaptación cultural.
- Educación y experimentación: investigadores pueden usar el modelo como base para estudiar el comportamiento de modelos pequeños multilingües o como punto de partida para fine-tuning adicional con QLoRA.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 2-3 GB para cuantizaciones Q4_K_S/Q4_K_M (2,5-2,6 GB de pesos), 3-4 GB para Q5/Q6, y 5-6 GB para Q8_0 (4,4 GB de pesos) considerando overhead de contexto y KV cache.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM para cuantizaciones Q4; RTX 3060, RTX 4060, RTX 4090, A100 o H100 para mayor throughput.
- Cabe en GPU de consumo: sí, en tarjetas con 4-8 GB de VRAM (GTX 1650, RTX 3050, RTX 3060, RTX 4060, etc.) usando cuantizaciones Q4 o Q5.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, y cualquier motor compatible con GGUF; el modelo base (safetensors) puede servirse con vLLM o TGI, aunque esta distribución GGUF está pensada para llama.cpp.
- Latencia y throughput estimados: no disponible en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| MiRAI-4B-GGUF | 4,02B | no disponible | en, id, ja | Apache 2.0 | GGUF |
| Qwen2.5-3B | 3,09B | 32.768 tokens (tipico) | multilingue (29+) | Apache 2.0 | safetensors, GGUF |
| Llama-3.2-3B | 3,21B | 131.072 tokens | multilingue (8) | Llama 3.2 Community | safetensors, GGUF |
| Gemma-2-2B | 2,61B | 8.192 tokens | multilingue | Gemma Terms | safetensors, GGUF |

Nota: los datos de Qwen2.5-3B, Llama-3.2-3B y Gemma-2-2B son de referencia general y no provienen de la información proporcionada en esta ficha; se incluyen como orientación comparativa de categoría. MiRAI-4B se distingue por su especialización en indonesio y japonés, mientras que los alternativas tienen cobertura multilingüe más amplia pero menor profundidad en esos idiomas específicos.

## Limitaciones y advertencias

- Sesgos conocidos: al entrenarse con datasets alpaca (generados por GPT-4 y traducidos), puede heredar sesgos de esos datos, incluyendo sesgos culturales occidentales y posibles errores de traducción en indonesio y japonés.
- Riesgo de alucinación: como todo modelo de 4B parámetros, la tasa de alucinación es mayor que en modelos de mayor tamaño; no se recomienda su uso en tareas que requieran alta precisión factual sin verificación.
- Limitaciones de contexto o idioma: la longitud de contexto no está documentada; el soporte se limita a en, id y ja, sin garantías para otros idiomas. El rendimiento en inglés puede ser inferior al de modelos nativos más grandes.
- Restricciones de licencia: la licencia Apache 2.0 permite uso comercial, modificación y redistribución, pero se debe conservar el aviso de licencia y atribución.
- Caveats para producción: el modelo es una cuantización GGUF de un fine-tuning QLoRA sobre Qwen3; la calidad puede degradarse en cuantizaciones bajas (Q2_K, Q3_K_S). No se han publicado evaluaciones formales, por lo que se recomienda validación empírica antes de desplegarlo en producción.

## Enlaces

- Repositorio HuggingFace (GGUF): https://huggingface.co/mradermacher/MiRAI-4B-GGUF
- Modelo base: https://huggingface.co/K-Ai-Official/MiRAI-4B
- Cuantizaciones imatrix: https://huggingface.co/mradermacher/MiRAI-4B-i1-GGUF
- Página de descargas del autor: https://hf.tst.eu/model#MiRAI-4B-GGUF
- Dataset alpaca-cleaned: https://huggingface.co/datasets/yahma/alpaca-cleaned
- Dataset alpaca-gpt4-indonesian: https://huggingface.co/datasets/FreedomIntelligence/alpaca-gpt4-indonesian
- Dataset alpaca-gpt4-japanese: https://huggingface.co/datasets/FreedomIntelligence/alpaca-gpt4-japanese
- Unsloth (framework de fine-tuning): https://github.com/unslothai/unsloth
- llama.cpp (motor de inferencia GGUF): https://github.com/ggerganov/llama.cpp
