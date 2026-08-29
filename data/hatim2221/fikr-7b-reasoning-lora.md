# Hatim2221/Fikr-7B-Reasoning-LoRA

## Resumen

Fikr-7B-Reasoning-LoRA es un adaptador de bajo rango (LoRA) desarrollado por Hatim2221, diseñado para potenciar las capacidades de razonamiento del modelo base Qwen2.5-7B-Instruct. El adaptador se publica bajo licencia Apache-2.0 y está pensado para su uso con la librería transformers y text-generation-inference. El repositorio contiene únicamente los pesos del adaptador (0.2 GB), no el modelo completo, lo que permite una integración ligera sobre el modelo base cuantizado a 4 bits mediante Unsloth.

El nombre "Fikr" (del árabe, "pensamiento") sugiere un enfoque en tareas de razonamiento, aunque la documentación disponible es mínima: no se especifican los datos de entrenamiento, el método de optimización (si se usó RL, DPO u otro) ni los benchmarks obtenidos. Al tratarse de un adaptador sobre Qwen2.5-7B-Instruct, hereda la arquitectura y las capacidades generales de este modelo, pero no se dispone de información pública sobre el rendimiento específico del adaptador. Su relevancia radica en la posibilidad de mejorar el razonamiento de un modelo ya capaz con un coste de entrenamiento reducido, siguiendo la tendencia de adaptación eficiente mediante LoRA.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA sobre Qwen2.5-7B-Instruct (transformer decoder-only) |
| Parametros totales | no disponible (el adaptador tiene ~0.2 GB, el modelo base 7B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (heredada del modelo base, típicamente 32 768 tokens en Qwen2.5-7B-Instruct) |
| Tipos de cuantizacion | no disponible (el adaptador se entrena sobre base bnb-4bit, pero no se especifican cuantizaciones de inferencia) |
| Idiomas soportados | en (inglés) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (adaptador LoRA) |

## Arquitectura y entrenamiento

El adaptador se basa en la técnica LoRA (Low-Rank Adaptation), que introduce matrices de bajo rango en las capas del modelo preentrenado para ajustarlo a una tarea específica sin modificar todos los pesos. El modelo base es Qwen2.5-7B-Instruct, un transformer decoder-only con atención de ventana deslizante y soporte para 32 768 tokens de contexto. El entrenamiento se realizó con la librería Unsloth, que acelera el fine-tuning mediante optimizaciones de memoria y cómputo, y con TRL (Transformer Reinforcement Learning), lo que sugiere que se empleó algún método de aprendizaje por refuerzo (posiblemente RLHF o DPO) para potenciar el razonamiento, aunque no se detalla el procedimiento exacto.

No se proporciona información sobre el número de tokens de entrenamiento, la composición del dataset ni las hiperparámetros utilizados. El adaptador se publica en formato safetensors y está diseñado para cargarse sobre el modelo base cuantizado a 4 bits (bnb-4bit), lo que facilita su uso en entornos con recursos limitados.

## Capacidades

- Generación de texto y razonamiento: al estar basado en Qwen2.5-7B-Instruct, se espera que herede las capacidades de generación, comprensión y razonamiento del modelo base, aunque no hay evidencia pública de mejoras específicas.
- Soporte de tool calling y function calling: el modelo base Qwen2.5-7B-Instruct soporta estas funciones, por lo que el adaptador probablemente las mantiene, pero no está confirmado.
- Capacidades multilingües: el modelo base es multilingüe, pero la model card del adaptador solo indica inglés, por lo que no se garantiza el soporte de otros idiomas.
- No se documentan capacidades especiales como modo de pensamiento, visión o audio.

## Casos de uso

- Razonamiento matemático y lógico: el adaptador podría emplearse para resolver problemas que requieren cadenas de razonamiento, como ecuaciones o problemas de lógica, aprovechando el fine-tuning orientado a razonamiento.
- Generación de código con explicaciones: al heredar las capacidades de Qwen2.5-7B-Instruct, podría usarse para generar código y explicar el razonamiento detrás de cada paso, útil en entornos educativos.
- Asistentes de investigación: para tareas de análisis y síntesis de información donde se requiera justificar conclusiones paso a paso.
- Chatbots de soporte técnico: con la capacidad de tool calling, podría integrarse en sistemas que necesiten consultar bases de datos o APIs para responder preguntas complejas.
- Fine-tuning adicional: al ser un adaptador LoRA, puede servir como punto de partida para ajustes posteriores en dominios específicos con bajo coste computacional.
- Evaluación de modelos de razonamiento: investigadores podrían utilizarlo como referencia para comparar técnicas de adaptación eficiente en tareas de razonamiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No se dispone de datos sobre MMLU, HumanEval, GSM8K u otras métricas para este adaptador.

## Requisitos de hardware

- VRAM estimada: al ser un adaptador LoRA sobre un modelo base de 7B cuantizado a 4 bits, la inferencia requiere aproximadamente 4-6 GB de VRAM para el modelo base más el adaptador, dependiendo de la longitud de contexto y el batch.
- GPU recomendadas: cualquier GPU con al menos 8 GB de VRAM (por ejemplo, RTX 3060, RTX 4060, RTX 4090) puede ejecutar el modelo en cuantización 4-bit. Para mayor velocidad, se recomienda una GPU con soporte para bfloat16 (A100, H100, RTX 3090 o superior).
- Compatibilidad con consumer GPU: sí, es viable en GPUs de consumo medio-alto gracias a la cuantización 4-bit.
- Opciones de despliegue: se puede cargar con transformers (usando Peft para el adaptador), o servir con vLLM o TGI si se fusiona el adaptador con el modelo base. También es posible usar llama.cpp si se convierte a GGUF, aunque no se proporciona esa conversión.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables específicos. El adaptador se enmarca en la tendencia de "tiny reasoning models via LoRA" (como el proyecto Tina), pero no hay datos públicos que permitan una comparación cuantitativa. Se puede considerar que compite con otros adaptadores LoRA para razonamiento sobre modelos de 7B, pero sin benchmarks no es posible establecer una comparativa objetiva.

## Limitaciones y advertencias

- Documentación insuficiente: la model card no incluye detalles sobre el proceso de entrenamiento, datos utilizados ni evaluación, lo que dificulta su uso en producción con garantías.
- Sesgos del modelo base: al heredar los pesos de Qwen2.5-7B-Instruct, el adaptador puede presentar los mismos sesgos y limitaciones que el modelo original, incluyendo posibles alucinaciones y respuestas incorrectas en dominios especializados.
- Riesgo de alucinación: sin evaluación específica, no se puede garantizar la fiabilidad de las respuestas en tareas de razonamiento complejo.
- Idioma: la model card solo indica inglés, por lo que su uso en otros idiomas no está respaldado.
- Licencia: Apache-2.0 permite uso comercial, pero el modelo base Qwen2.5-7B-Instruct tiene su propia licencia (Apache-2.0 también), por lo que no hay restricciones adicionales conocidas.
- Formato de pesos: al ser un adaptador, requiere el modelo base para funcionar; no es un modelo autónomo.

## Enlaces

- HuggingFace: https://huggingface.co/Hatim2221/Fikr-7B-Reasoning-LoRA
- Unsloth (herramienta de entrenamiento): https://github.com/unslothai/unsloth
- Proyecto Tina (referencia de razonamiento con LoRA): https://github.com/shangshang-wang/Tina
- Paper de Tina: https://arxiv.org/html/2504.15777v1
