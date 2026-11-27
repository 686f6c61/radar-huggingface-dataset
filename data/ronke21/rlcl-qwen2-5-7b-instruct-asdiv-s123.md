# ronke21/rlcl-Qwen2.5-7B-Instruct-asdiv-s123

## Resumen

El modelo `ronke21/rlcl-Qwen2.5-7B-Instruct-asdiv-s123` es un ajuste fino (fine-tune) del modelo Qwen2.5-7B-Instruct desarrollado por el usuario ronke21 en Hugging Face. Se enmarca en la línea de investigación de "rlcl" (probablemente *Reinforcement Learning with Continual Learning* o similar) y está etiquetado explícitamente con el término "forgetting", lo que sugiere que su propósito es estudiar o mitigar el olvido catastrófico durante el ajuste fino. El sufijo "asdiv-s123" apunta a un entrenamiento orientado a tareas de razonamiento matemático, concretamente el dataset ASDiv (Arithmetic Story Dataset for Dynamic reasoning).

Técnicamente es un transformer decoder-only de 7.615.616.512 parámetros (aproximadamente 7.6B), con los pesos fusionados a partir de un adaptador LoRA (tag `lora-merged`), lo que significa que el repositorio contiene los pesos completos del modelo resultante y no el adaptador por separado. El repositorio ocupa 15,2 GB en formato safetensors, coherente con un modelo de 7.6B parámetros en precisión FP16/BF16.

Su relevancia es limitada y muy específica: se trata de un artefacto de investigación con 0 descargas y 0 likes en el momento de redactar esta ficha, acceso restringido (gated) y sin licencia declarada. No es un modelo pensado para producción general, sino para experimentación académica sobre olvido catastrófico y ajuste fino selectivo en dominios matemáticos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2) |
| Parametros totales | 7.615.616.512 (≈7,6B) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (el modelo base Qwen2.5-7B-Instruct soporta 32.768 tokens nativos, ampliables, pero no se confirma para este fine-tune) |
| Tipos de cuantizacion | no disponible (solo se publican pesos safetensors; no hay GGUF ni cuantizaciones oficiales) |
| Idiomas soportados | no disponible (heredados del modelo base Qwen2.5, que soporta multiples idiomas, pero no se declaran en esta ficha) |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Qwen2.5-7B-Instruct: un transformer decoder-only con atención por componentes (RoPE, GQA —*grouped query attention*—, SwiGLU en el FFN y normalización RMSNorm). Sobre esta base se ha aplicado un ajuste fino supervisado (SFT) mediante LoRA, cuyos pesos se han fusionado posteriormente con los del modelo base (`lora-merged`), de modo que el repositorio contiene un checkpoint completo listo para cargar con `transformers`.

El nombre del modelo indica que el entrenamiento se ha realizado sobre el dataset ASDiv (Arithmetic Story Dataset for Dynamic reasoning), un conjunto de problemas matemáticos de enunciado en lenguaje natural, con una semilla o configuración identificada como "s123". La etiqueta "rlcl" y el tag "forgetting" sugieren que el objetivo experimental era medir o mitigar la degradación de capacidades generales al especializar el modelo en matemáticas. No se dispone de información sobre el número de tokens de entrenamiento, la composición exacta del dataset, ni si se emplearon técnicas de RLHF o DPO adicionales.

## Capacidades

- Generación de texto conversacional, heredada del modelo base Qwen2.5-7B-Instruct.
- Razonamiento matemático sobre problemas de enunciado (ASDiv), presumiblemente reforzado por el ajuste fino.
- Soporte de conversación multi-turno (tag `conversational`).
- Compatibilidad con Text Generation Inference (tag `text-generation-inference`) y endpoints compatibles.
- No se confirma soporte de tool calling, function calling ni capacidades de agente en la información disponible.
- No se confirma soporte multilingüe explícito en esta ficha, aunque el modelo base Qwen2.5 es multilingüe.
- No se declaran capacidades de visión, audio ni modo "thinking".

## Casos de uso

- Investigación sobre olvido catastrófico: el modelo sirve como artefacto experimental para comparar la retención de capacidades generales antes y después del ajuste fino en ASDiv, gracias a su etiqueta explícita "forgetting".
- Evaluación de técnicas de fusión LoRA: al estar los pesos fusionados, permite analizar el impacto de la fusión en la calidad final frente a mantener el adaptador separado.
- Reproducción de experimentos académicos: útil para replicar resultados de ajuste fino selectivo en dominios matemáticos con una semilla concreta (s123).
- Benchmarking de razonamiento aritmético: puede emplearse como línea base especializada en problemas de enunciado tipo ASDiv dentro de pipelines de evaluación comparativa.
- Estudio de degradación de instrucciones: permite medir si el ajuste en matemáticas afecta a la adherencia a instrucciones generales del modelo base.
- Docencia y formación: útil en cursos de ajuste fino y evaluación de modelos como ejemplo de fine-tune con LoRA fusionado y acceso restringido.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16/BF16: aproximadamente 15,2 GB solo para pesos, más overhead de activaciones y caché KV; en la práctica se recomiendan 20-24 GB.
- VRAM estimada en cuantización de 8 bits: en torno a 8-9 GB (no se publican cuantizaciones oficiales, requeriría conversión manual).
- VRAM estimada en cuantización de 4 bits: en torno a 4-5 GB (conversión manual a GGUF/AWQ/GPTQ).
- GPU recomendadas: A100 40/80 GB, H100, L40S para despliegue en producción; RTX 4090 (24 GB) para FP16 en single-GPU.
- Cabe en GPU de consumo: sí, en RTX 4090 (24 GB) en FP16 y en GPUs con 8-12 GB si se cuantiza a 8 o 4 bits.
- Opciones de despliegue: `transformers` (nativo), Text Generation Inference (tag oficial), vLLM (compatible con arquitectura Qwen2), llama.cpp/Ollama tras conversión a GGUF.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| ronke21/rlcl-Qwen2.5-7B-Instruct-asdiv-s123 | 7,6B | no disponible | no disponible | Gated, 0 descargas |
| Qwen/Qwen2.5-7B-Instruct | 7,6B | 32.768 tokens (nativo) | Apache 2.0 (modelo base) | Publico, ampliamente usado |
| Qwen/Qwen2.5-Math-7B-Instruct | 7,6B | 4.096 tokens | Apache 2.0 | Publico |
| meta-llama/Llama-3.1-8B-Instruct | 8B | 128.000 tokens | Llama 3.1 Community License | Gated |

El modelo aquí descrito se diferencia de sus alternativas por ser un artefacto de investigación con acceso restringido y sin licencia declarada, frente a los modelos base y matemáticos de Qwen, que son públicos y con licencia Apache 2.0. Para uso en producción, Qwen2.5-7B-Instruct o Qwen2.5-Math-7B-Instruct son opciones preferibles por trazabilidad legal y disponibilidad.

## Limitaciones y advertencias

- Licencia no declarada: no se puede asumir uso comercial permitido; hay que contactar con el autor o consultar el modelo base (Apache 2.0) y las condiciones del repositorio gated.
- Acceso restringido (gated): requiere aceptar condiciones en Hugging Face, lo que añade fricción para reproducibilidad y despliegue automatizado.
- Riesgo de olvido catastrófico: el propio tag "forgetting" indica que el ajuste puede haber degradado capacidades generales del modelo base; no se recomienda como sustituto generalista de Qwen2.5-7B-Instruct.
- Sesgos: no documentados; hereda los sesgos del modelo base y del dataset ASDiv, sin que se hayan publicado evaluaciones al respecto.
- Riesgo de alucinación: no evaluado en la información disponible; los fine-tunes especializados en matemáticas pueden producir razonamientos plausibles pero incorrectos fuera de distribución.
- Idiomas: no declarados; el ajuste en ASDiv (mayoritariamente inglés) puede degradar el rendimiento en otros idiomas respecto al modelo base.
- Sin cuantizaciones oficiales: para desplegar en hardware limitado hay que generar GGUF/AWQ/GPTQ manualmente, con riesgo de degradación no medida.
- Sin benchmarks publicados: no hay evidencia cuantitativa de mejora en ASDiv ni de retención en tareas generales.
- Madurez: 0 descargas y 0 likes; sin validación comunitaria.

## Enlaces

- Hugging Face: https://huggingface.co/ronke21/rlcl-Qwen2.5-7B-Instruct-asdiv-s123
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-7B-Instruct
- Dataset ASDiv (referencia): https://huggingface.co/datasets/MU-NLPC/Calc-asdiv_a
- Documentación de Qwen2.5: https://qwenlm.github.io/blog/qwen2.5/
- Text Generation Inference: https://github.com/huggingface/text-generation-inference
