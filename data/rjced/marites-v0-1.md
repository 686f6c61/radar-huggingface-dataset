# RJCed/MARITES-v0.1

## Resumen

MARITES-v0.1 es un ajuste fino (fine-tuning) del modelo Qwen3-14B publicado por el usuario RJCed en Hugging Face. Se trata de un modelo derivado, no de un modelo entrenado desde cero: parte de la versión cuantizada en 4 bits de Qwen3-14B distribuida por Unsloth (`unsloth/Qwen3-14B-unsloth-bnb-4bit`) y se ha afinado con la librería TRL de Hugging Face sobre el ecosistema Unsloth. La arquitectura subyacente es la de Qwen3-14B, un transformer decoder-only denso de aproximadamente 14 mil millones de parámetros desarrollado por el equipo Qwen de Alibaba.

El modelo se publica bajo licencia Apache 2.0 e indica únicamente el inglés como idioma soportado en su model card, aunque al heredar la base Qwen3 conserva presumiblemente las capacidades multilingües del modelo original. El repositorio ocupa unos 0,5 GB, lo que sugiere que los pesos publicados corresponden a adaptadores o a una conversión parcial, y no a un checkpoint completo en precisión nativa. El pipeline no está declarado y el modelo no registra descargas ni interacciones en el momento de la consulta.

La relevancia de esta ficha es limitada pero ilustrativa: representa el patrón habitual de fine-tunes comunitarios rápidos sobre modelos abiertos de gran tamaño, útiles para experimentación pero con documentación mínima sobre datos de entrenamiento, evaluación o comportamiento final. No debe confundirse con un modelo oficial de Qwen ni asumirse que conserva intactas las capacidades del original sin verificación empírica.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso (heredada de Qwen3-14B) |
| Parametros totales | 14 mil millones (heredados de Qwen3-14B; no verificado en el checkpoint publicado) |
| Parametros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (Qwen3-14B soporta hasta 32 768 tokens nativos, ampliable; dato no confirmado para este fine-tune) |
| Tipos de cuantizacion | no disponible (la base de partida es bnb-4bit; el repo publica safetensors) |
| Idiomas soportados | en (ingles, segun la model card) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura es la de Qwen3-14B: un transformer decoder-only denso con atención por grupos (GQA) y las innovaciones propias de la familia Qwen3, que en el modelo base incluyen modos de razonamiento explícito (thinking mode) y no-thinking conmutables. MARITES-v0.1 no modifica esa arquitectura; el ajuste se ha realizado sobre la variante cuantizada en 4 bits de Unsloth, lo que implica que el entrenamiento se ejecutó con pesos base en bnb-4bit y, previsiblemente, con adaptadores LoRA o QLoRA.

El autor declara únicamente que el modelo "fue entrenado 2 veces más rápido con Unsloth y la librería TRL de Hugging Face", sin especificar el número de tokens de entrenamiento, la composición del dataset, la existencia de RLHF o DPO, ni la configuración del ajuste (rango LoRA, épocas, tasa de aprendizaje). Tampoco se documenta si el fine-tuning preserva el modo de razonamiento del Qwen3 original. Esta ausencia de información sobre el proceso de entrenamiento es la limitación documental más relevante del modelo.

## Capacidades

- Generación de texto en inglés, heredada de la base Qwen3-14B.
- Razonamiento y matemáticas: presumiblemente conserva las capacidades del Qwen3-14B, aunque no hay evaluación publicada que lo confirme.
- Generación de código: capacidad esperable por herencia del modelo base, sin verificación documentada.
- Tool calling y function calling: no documentado en la model card; depende de si el ajuste preserva las plantillas de chat de Qwen3.
- Soporte de agentes y razonamiento multi-paso: no documentado.
- Capacidades multilingües: la model card declara solo inglés; el multilingüismo del base no está confirmado tras el ajuste.
- Modo de razonamiento (thinking mode): no documentado si se conserva.
- Visión y audio: no soportados (el modelo base es solo texto).

## Casos de uso

- Experimentación con fine-tuning sobre Qwen3: el modelo sirve como referencia de cómo se publica un ajuste rápido con Unsloth y TRL, útil para equipos que quieran replicar el flujo de trabajo en sus propios dominios.
- Prototipado de asistentes conversacionales en inglés: al heredar la base Qwen3-14B, puede emplearse para pruebas de generación de texto multi-turno, siempre con validación previa de la calidad tras el ajuste.
- Generación de código en entornos de prueba: si el ajuste no ha degradado las capacidades del base, puede integrarse en asistentes de programación para tareas de autocompletado y explicación de código, con revisión humana obligatoria.
- Investigación sobre degradación por fine-tuning: comparar sus salidas con las de Qwen3-14B original permite estudiar el olvido catastrófico y el efecto de entrenar sobre pesos cuantizados en 4 bits.
- Base para nuevos ajustes comunitarios: al estar en Apache 2.0 y en safetensors, puede servir como punto de partida para fine-tunes posteriores, aunque conviene partir del modelo original por trazabilidad.
- Evaluación de pipelines de despliegue: útil para probar integraciones con TGI o transformers en entornos de staging antes de mover cargas a modelos con documentación completa.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible para este checkpoint concreto. Como referencia del modelo base de 14 mil millones de parámetros: en FP16 requiere aproximadamente 28 GB de VRAM; en cuantización de 8 bits, unos 15-16 GB; en 4 bits, unos 9-10 GB.
- GPU recomendadas: para FP16, A100 40 GB, H100 o dos RTX 4090; para 4 bits, una RTX 4090 (24 GB) o RTX 3090 es suficiente.
- Cabe en GPU de consumo: sí, en RTX 3090/4090 con cuantización de 4 u 8 bits; en GPUs de 16 GB solo con cuantización agresiva y contexto reducido.
- Opciones de despliegue: transformers, Text Generation Inference (TGI), vLLM y llama.cpp/Ollama previa conversión a GGUF. El repo está etiquetado como compatible con endpoints y con text-generation-inference.
- Latencia y throughput: no disponibles; dependen del hardware y de la cuantización, y no hay mediciones publicadas para este fine-tune.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Documentacion | Disponibilidad |
|---|---|---|---|---|---|
| MARITES-v0.1 | 14B (heredados) | no disponible | Apache 2.0 | Minima (sin dataset ni evals) | Hugging Face, 0 descargas |
| Qwen3-14B (oficial) | 14B | 32 768 tokens (ampliable) | Apache 2.0 | Completa, con benchmarks | Hugging Face, ampliamente usado |
| Gemma 2 9B | 9B | 8 192 tokens | Gemma Terms | Completa | Hugging Face |
| Llama 3.1 8B | 8B | 128 000 tokens | Llama 3.1 Community License | Completa | Hugging Face |

Frente a estos modelos, MARITES-v0.1 solo se diferencia por el ajuste fino comunitario, del que no se documenta ni el propósito ni la mejora. Para uso en producción, el Qwen3-14B oficial ofrece la misma arquitectura con garantías de evaluación y trazabilidad.

## Limitaciones y advertencias

- Ausencia total de documentación sobre el dataset de entrenamiento: no se puede evaluar qué sesgos introduce el ajuste ni qué dominio cubre.
- Riesgo de olvido catastrófico: al entrenar sobre una base cuantizada en 4 bits y sin evaluación publicada, es posible que las capacidades originales de Qwen3-14B (razonamiento, código, multilingüismo) estén degradadas.
- Riesgo de alucinación: inherente a los modelos de 14B y no mitigado por ningún proceso documentado de RLHF o DPO en este ajuste.
- Idiomas: la model card declara solo inglés; el uso en castellano no está soportado ni verificado.
- Contexto: no se documenta la longitud de contexto efectiva tras el ajuste.
- Licencia: Apache 2.0 permite uso comercial, pero el autor no ofrece garantías sobre el modelo y la responsabilidad recae en el desplegador.
- Madurez: 0 descargas y 0 interacciones en el momento de la consulta; sin comunidad que valide su comportamiento.
- No es un modelo oficial de Qwen: no debe presentarse como tal ni asumirse soporte del equipo original.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/RJCed/MARITES-v0.1
- Modelo base en Hugging Face: https://huggingface.co/unsloth/Qwen3-14B-unsloth-bnb-4bit
- Repositorio de Unsloth: https://github.com/unslothai/unsloth
- Repositorio de TRL: https://github.com/huggingface/trl
