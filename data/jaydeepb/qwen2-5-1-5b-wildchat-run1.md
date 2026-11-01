# jaydeepb/qwen2.5-1.5b-wildchat-run1

## Resumen

qwen2.5-1.5b-wildchat-run1 es un ajuste fino (fine-tune) de Qwen2.5-1.5B, el modelo conversacional compacto de Alibaba, realizado por el usuario jaydeepb sobre el dataset WildChat de AllenAI. No se trata de un modelo orientado a producción, sino de un artefacto de investigación: el autor lo ha entrenado durante una época sobre una muestra de 1 millón de secuencias de 128 tokens de WildChat con el objetivo de estudiar la memorización extraplicable (extractable memorization) en modelos de lenguaje ajustados.

Su relevancia no está en sus capacidades conversacionales, que son esencialmente las del modelo base Qwen2.5-1.5B tras un ajuste ligero, sino en su papel dentro de un experimento de memorización. Las etiquetas de memorización extraídas de este modelo (run1, con k=50, l=50 y decodificación greedy) se usan para entrenar un clasificador que predice memorización. Existe un modelo hermano, run2, ajustado sobre una muestra disjunta de 1 millón de secuencias, que sirve de conjunto de evaluación retenido (held-out).

Técnicamente, conserva la arquitectura transformer decoder de Qwen2.5 con 1.543.714.304 parámetros reales según los safetensors del repositorio (3,1 GB), licencia Apache 2.0 y compatibilidad con la librería transformers de Hugging Face.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder (familia Qwen2.5) |
| Parametros totales | 1.543.714.304 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (el modelo base Qwen2.5-1.5B soporta 32.768 tokens, pero el ajuste se hizo con secuencias de 128 tokens) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (los datos de entrenamiento, WildChat, son predominantemente en ingles) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (3,1 GB) |

## Arquitectura y entrenamiento

El modelo parte de Qwen2.5-1.5B, un transformer decoder denso (no MoE) de la familia Qwen2.5. El ajuste fino se realizó durante una sola epoca sobre una muestra de 1 millón de secuencias de 128 tokens extraidas de WildChat, el dataset de conversaciones reales de AllenAI recopilado de despliegues públicos de chatbots. Los hiperparámetros publicados son: learning rate 5e-5 con schedule coseno y semilla 42. No se menciona el uso de RLHF ni DPO; se trata de un ajuste supervisado sencillo sobre conversaciones crudas.

La innovación del proyecto no reside en la arquitectura sino en la metodología: sobre este modelo (run1) se extrajeron etiquetas de memorización extraplicable usando decodificación greedy con k=50 y l=50 (presumiblemente 50 continuaciones greedy por prefijo, evaluando extracción sobre 50 tokens). Esas etiquetas alimentan un clasificador de predicción de memorización. El modelo run2, entrenado sobre una muestra disjunta, actúa como conjunto de evaluación fresco para validar si el clasificador generaliza a nuevos ajustes finos.

## Capacidades

- Generacion de texto conversacional, heredada del modelo base Qwen2.5-1.5B.
- Razonamiento y generacion de codigo basicos, con la calidad del modelo base Qwen2.5-1.5B (no optimizado en el ajuste).
- No se documentan capacidades de tool calling, function calling ni agentes; el modelo base no destaca en estas tareas a esta escala.
- No se documentan capacidades multimodales (vision, audio): es un modelo puramente textual.
- Capacidad especial: sirve como sujeto experimental para medir memorizacion extraplicable tras un ajuste fino sobre datos de conversaciones reales de usuarios (WildChat).
- Uso como fuente de etiquetas para entrenar clasificadores de memorizacion (caso de uso real del proyecto del autor).

## Casos de uso

- Investigacion sobre memorizacion en LLMs: es su propósito principal. Un investigador puede replicar el pipeline de extraccion (greedy, k=50, l=50) sobre este checkpoint para estudiar qué secuencias de WildChat memoriza un modelo tras un ajuste fino.
- Entrenamiento de clasificadores de memorizacion: las etiquetas generadas a partir de run1 son los datos de entrenamiento documentados para un clasificador que predice memorización sin necesidad de decodificar.
- Estudios de privacidad y extraccion de datos de entrenamiento: al estar ajustado sobre conversaciones reales de usuarios (WildChat), es un banco de pruebas realista para ataques de extraccion y evaluación de riesgos de fuga de datos personales.
- Baseline para comparar tecnicas de desmemorizacion (unlearning, regularizacion, deduplicacion): cualquier metodo de mitigacion puede evaluarse contra este checkpoint de referencia.
- Experimentos de reproducibilidad: hiperparámetros completos publicados (lr 5e-5, coseno, semilla 42, 1 epoca, seq len 128) facilitan replicar el entrenamiento exacto.
- No recomendado para produccion: no es un modelo de chat afinado con alineación; para asistentes conversacionales reales conviene usar Qwen2.5-1.5B-Instruct u otros modelos alineados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Al tratarse de un artefacto de investigación centrado en memorización, el autor no reporta metricas de MMLU, HumanEval, GSM8K ni similares; las únicas métricas documentadas del proyecto son las etiquetas de memorización extraplicable (k=50, l=50 greedy).

## Requisitos de hardware

- VRAM estimada para inferencia en FP16/BF16: aproximadamente 3,1 GB solo de pesos, mas overhead de activaciones y KV cache; en la practica, 4-6 GB de VRAM son suficientes.
- En cuantizacion de 4 bits, los pesos ocuparian en torno a 1 GB, permitiendo su ejecucion en GPUs muy modestas o incluso CPU.
- Cabe con holgura en GPUs de consumo: RTX 3060, RTX 4060, RTX 4090 o cualquier GPU con 6 GB o mas de VRAM.
- No se requieren GPUs de centro de datos (A100/H100) salvo para reproducir el entrenamiento, cuyos requisitos no estan documentados.
- Despliegue: compatible con transformers (library_name declarado), text-generation-inference y endpoints de Hugging Face (tag endpoints_compatible). Al ser arquitectura Qwen2, tambien deberia funcionar con vLLM, llama.cpp (previa conversion a GGUF, no disponible en el repo) y Ollama (previa conversión).
- Latencia y throughput: no disponibles; a 1,5B de parametros cabe esperar generacion fluida en tiempo real en GPU de consumo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Proposito |
|---|---|---|---|---|
| qwen2.5-1.5b-wildchat-run1 | 1,54B | no disponible (base: 32.768) | Apache 2.0 | Investigacion de memorizacion |
| Qwen/Qwen2.5-1.5B (base) | 1,54B | 32.768 | Qwen Research / Apache 2.0 (según version) | Modelo base generalista |
| Qwen/Qwen2.5-1.5B-Instruct | 1,54B | 32.768 | Apache 2.0 | Chat y asistente alineado para produccion |

La diferencia clave: run1 no compite en capacidades con el Instruct, sino que aporta valor como checkpoint experimental con etiquetas de memorización asociadas y un modelo hermano (run2) para evaluación held-out.

## Limitaciones y advertencias

- No es un modelo de chat alineado: el ajuste sobre WildChat (conversaciones crudas de usuarios) no incluye RLHF ni DPO, por lo que la calidad de las respuestas puede ser inferior a la de Qwen2.5-1.5B-Instruct.
- Riesgo de memorizacion y fuga de datos: por diseño del experimento, el modelo puede reproducir fragmentos de conversaciones reales de usuarios de WildChat. Esto es un riesgo de privacidad serio si se usa en produccion y, a la vez, el objeto de estudio del proyecto.
- Sesgos heredados de WildChat: el dataset contiene conversaciones reales sin filtrar, con posibles contenidos ofensivos, sesgos y datos personales.
- Ventana efectiva reducida: el entrenamiento se hizo con secuencias de 128 tokens, por lo que el comportamiento en contextos largos no esta validado.
- Idiomas: la composicion linguistica del ajuste no esta documentada; WildChat es mayoritariamente en ingles, por lo que el rendimiento en castellano tras el ajuste no esta verificado.
- Alucinaciones: como todo modelo de 1,5B parametros, el riesgo de alucinacion es alto; no hay mitigaciones documentadas.
- Licencia Apache 2.0: permite uso comercial, pero el uso de datos de WildChat derivados de usuarios puede estar sujeto a las condiciones de dicho dataset.
- Documentacion minima: la model card es breve; faltan detalles como longitud de contexto del ajuste, plantilla de chat y datos de evaluacion.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/jaydeepb/qwen2.5-1.5b-wildchat-run1
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-1.5B
- Dataset WildChat: https://huggingface.co/datasets/allenai/WildChat
- Modelo hermano run2 y paper asociado: no disponibles en la informacion proporcionada (la model card menciona la existencia de run2 pero no incluye enlace)
