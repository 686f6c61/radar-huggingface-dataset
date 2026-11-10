# positron-ai/Qwen_Qwen3.5-35B-A3B-ingest-best-gptq

## Resumen

Este repositorio contiene una cuantización GPTQ de 4 bits del modelo Qwen/Qwen3.5-35B-A3B, publicada por positron-ai el 9 de noviembre de 2026. Se trata de un artefacto de inferencia derivado, no de un modelo entrenado desde cero: el trabajo de positron-ai consiste en aplicar cuantización post-entrenamiento sobre los pesos originales de Qwen para reducir el coste de memoria y facilitar el despliegue en GPUs con VRAM limitada.

El modelo base es un transformer de tipo mixture-of-experts (la arquitectura aparece etiquetada como `qwen3_5_moe`), con 35.951.822.704 parámetros totales según los safetensors del repositorio. El nombre del modelo indica una configuración con 35B de parámetros totales y aproximadamente 3B activos por token, aunque la model card no detalla el número exacto de expertos ni la política de enrutamiento. El pipeline declarado es `text-generation`, pero los tags incluyen `image-text-to-text`, lo que sugiere capacidades multimodales heredadas del modelo base.

La relevancia de esta ficha es doble: por un lado, documenta una alternativa cuantizada para desplegar un MoE de ~36B con un presupuesto de VRAM reducido; por otro, advierte de que el autor no publica métricas de calidad de la cuantización, por lo que cualquier evaluación de degradación respecto al modelo original queda en manos de quien lo despliegue.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE (tag `qwen3_5_moe`) |
| Parametros totales | 35.951.822.704 |
| Parametros activos | no disponible (el nombre sugiere ~3B, sin confirmar en la model card) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GPTQ 4-bit, group size 64, simetrica, `desc_act=false`, damp 0.05 |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (GPTQ), libreria `transformers` |

## Arquitectura y entrenamiento

La arquitectura del modelo base es un transformer con mezcla de expertos (MoE), según el tag `qwen3_5_moe` y la nomenclatura `35B-A3B`. No se dispone de información sobre el número de capas, la dimensión oculta, el número de expertos por capa, el tamaño del experto compartido ni la función de enrutamiento. Tampoco se documentan los datos de entrenamiento del modelo original: número de tokens, composición del corpus, fases de preentrenamiento, SFT, RLHF o DPO. Toda esa información corresponde al repositorio de Qwen y no se reproduce en esta ficha.

Lo que sí está documentado es el proceso de cuantización. Se aplicó GPTQ sobre los pesos del modelo base con precisión de 4 bits, grupo de 64, cuantización simétrica y sin `desc_act`. El conjunto de calibración fue un "universal mixed-domain set" de 512 muestras con longitud de secuencia 8192. La cadena de herramientas empleada fue GPTQModel 7.3.4, transformers 5.11.0, torch 2.9.1 y CUDA 12.8. Las activaciones no se cuantifican. No se especifica la precisión de origen de los pesos antes de cuantizar ni el hardware objetivo declarado.

## Capacidades

- Generación de texto conversacional, según el pipeline `text-generation` y el tag `conversational`.
- Procesamiento image-text-to-text, según el tag `image-text-to-text` del repositorio, presumiblemente heredado del modelo base multimodal.
- Razonamiento y generación de código: no confirmado explícitamente en la información disponible, aunque es esperable en un modelo Qwen de esta familia; debe verificarse contra la model card del modelo base.
- Tool calling y function calling: no disponible en la documentación de este artefacto.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible (el campo de idiomas no está relleno).
- Modo thinking explícito: no disponible.

## Casos de uso

- Despliegue de un MoE de ~36B en una sola GPU de 24 GB: con cuantización 4-bit y pesos en safetensors GPTQ, el artefacto ocupa 23 GB en repositorio, lo que permite cargarlo en GPUs consumer de gama alta (RTX 3090/4090) siempre que se gestione con cuidado el espacio para el KV cache y las activaciones.
- Servicio de generación de texto en producción con vLLM o TGI: al ser un formato GPTQ compatible con `transformers`, puede servirse mediante backends que soporten GPTQ y aprovechar el enrutamiento disperso del MoE para reducir el coste por token frente a un modelo denso de tamaño equivalente.
- Prototipado de asistentes conversacionales multi-turno: el pipeline `conversational` y el contexto presumiblemente amplio del modelo base lo hacen adecuado para chatbots con historial largo, aunque la longitud exacta de contexto debe confirmarse en el repositorio de Qwen.
- Evaluación comparativa de cuantizaciones: útil como artefacto de referencia para medir la degradación de GPTQ 4-bit frente a otros formatos (AWQ, GGUF, FP8) sobre el mismo modelo base.
- Aplicaciones multimodales ligeras: si el tag `image-text-to-text` se confirma en el modelo base, podría emplearse para tareas de descripción de imágenes o VQA en entornos con VRAM limitada.
- Investigación sobre eficiencia de MoE: permite estudiar el comportamiento de un modelo con ~3B activos y ~36B totales bajo cuantización de 4 bits, comparando throughput y calidad frente a la versión sin cuantizar.
- Despliegue en entornos con requisitos de licencia permisiva: la licencia Apache 2.0 del modelo base facilita el uso comercial, sujeto a las condiciones que Qwen imponga en su LICENSE.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente que no reporta métricas de rendimiento ni de calidad (ni KL-divergence, ni accuracy, ni perplexity) y que las validaciones se gestionan internamente en Positron AI.

## Requisitos de hardware

- VRAM estimada para inferencia: el repositorio pesa 23 GB en GPTQ 4-bit; a ello hay que sumar el KV cache y las activaciones, por lo que un despliegue realista requiere al menos 24 GB y, para contextos largos, 32-48 GB.
- GPU recomendadas: A100 40/80 GB, H100 80 GB, L40S 48 GB para producción; RTX 4090 24 GB o RTX 3090 24 GB para uso individual con contextos moderados.
- ¿Cabe en GPU consumer? Sí, en RTX 4090/3090 con cuantización 4-bit y contextos contenidos; en GPUs de 16 GB o menos no es viable sin offloading a CPU.
- Opciones de despliegue: `transformers` con soporte GPTQ, vLLM (si soporta la arquitectura `qwen3_5_moe` en la versión correspondiente), TGI con GPTQ, y potencialmente llama.cpp si se genera una conversión GGUF a partir de este artefacto (no incluida en el repositorio).
- Latencia y throughput: no disponibles. Al ser un MoE con ~3B activos por token, se espera un throughput superior al de un modelo denso de 36B, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| positron-ai/Qwen_Qwen3.5-35B-A3B-ingest-best-gptq | 35,95B totales (MoE) | no disponible | GPTQ 4-bit | Apache 2.0 | Hugging Face |
| Qwen/Qwen3.5-35B-A3B (base) | 35,95B totales (MoE) | no disponible | BF16/FP16 original | Apache 2.0 | Hugging Face |
| Otras cuantizaciones del mismo base (AWQ, GGUF, FP8) | 35,95B totales (MoE) | no disponible | 4-8 bits | Apache 2.0 | Hugging Face (segun autor) |

No se dispone de datos de rendimiento para establecer una comparación cuantitativa con alternativas de la misma categoría. La comparación se limita a parámetros, formato y licencia.

## Limitaciones y advertencias

- No se han publicado métricas de calidad de la cuantización: se desconoce la degradación en perplejidad, precisión o fidelidad conversacional respecto al modelo base.
- La model card no documenta sesgos conocidos, riesgos de alucinación ni limitaciones idiomáticas del modelo base; deben consultarse en el repositorio de Qwen.
- El campo de idiomas no está relleno, por lo que el soporte multilingüe no está garantizado en este artefacto.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, lo que implica ausencia de validación comunitaria.
- La licencia Apache 2.0 se hereda del modelo base, pero las restricciones de uso de Qwen continúan aplicándose según la propia model card; conviene revisar el LICENSE enlazado antes de un uso comercial.
- El artifact fue producido con versiones muy recientes de herramientas (transformers 5.11.0, torch 2.9.1, CUDA 12.8); la compatibilidad con stacks más antiguos no está garantizada.
- No se especifica el hardware objetivo ni la precisión de origen, lo que dificulta reproducir el proceso de cuantización.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/positron-ai/Qwen_Qwen3.5-35B-A3B-ingest-best-gptq
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-35B-A3B
- Licencia del modelo base: https://huggingface.co/Qwen/Qwen3.5-35B-A3B/blob/main/LICENSE
- GPTQModel (herramienta de cuantización): no disponible en la información proporcionada
- Paper o blog de Qwen3.5: no disponible en la información proporcionada
- Demo o espacio asociado: no disponible en la información proporcionada
