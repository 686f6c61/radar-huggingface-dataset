# reaperdoesntknow/DistilQwen3-1.7B-uncensored

## Resumen

El modelo `reaperdoesntknow/DistilQwen3-1.7B-uncensored` es un modelo de lenguaje de 2.031.739.904 parámetros (~2,03 mil millones) orientado a generación de texto, desarrollado por el usuario reaperdoesntknow, vinculado a Convergent Intelligence LLC según la model card. Forma parte de la serie DistilQwen3, que emplea destilación de conocimiento a partir de un modelo base mayor, concretamente `reaperdoesntknow/Qwen3-1.7B-Distilled-30B-A3B`, que a su vez es una destilación de un modelo de 30 mil millones de parámetros con 3 mil millones activos (probablemente una arquitectura MoE). El nombre "uncensored" sugiere que ha sido ajustado para eliminar restricciones de contenido, aunque no se proporcionan detalles del proceso.

El modelo está diseñado para inferencia en entornos con recursos limitados ("edge"), gracias a su tamaño compacto. Se distribuye en formato safetensors y es compatible con bibliotecas como transformers y text-generation-inference. A pesar de su interés potencial para despliegues ligeros, la documentación disponible es extremadamente escasa: la model card es una plantilla automática sin información técnica concreta, y no se han publicado benchmarks, detalles de entrenamiento, ni especificaciones de arquitectura más allá del nombre. Esto limita su evaluación rigurosa y su adopción en entornos de producción sin una validación adicional.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (basado en Qwen3, pero sin confirmación de detalles internos) |
| Parametros totales | 2.031.739.904 |
| Parametros activos | no disponible (no se indica si es MoE o denso) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (repo con safetensors; se menciona compatibilidad con text-generation-inference y FriendliAI, pero sin cuantizaciones específicas) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La información disponible sobre la arquitectura interna es prácticamente nula. El nombre del modelo indica que deriva de Qwen3, y la cadena de destilación parte de `Qwen3-1.7B-Distilled-30B-A3B`, lo que sugiere que el modelo original es un MoE con 30 mil millones de parámetros totales y 3 mil millones activos, destilado a un modelo más pequeño de ~1,7 mil millones (aunque el recuento real de parámetros del modelo final es de 2,03 mil millones). No se especifica si el modelo resultante es denso o mantiene alguna forma de sparse MoE.

En cuanto al entrenamiento, los tags indican que se utilizó fine-tuning supervisado (SFT) y destilación de conocimiento (knowledge-distillation). La model card menciona un marco matemático llamado "Discrepancy Calculus (DISC)" que descompone la distribución de salida del profesor en componentes suaves, de salto y de Cantor, pero no se ofrecen detalles técnicos sobre cómo se aplicó en el entrenamiento. Tampoco se proporcionan datos sobre el dataset, el número de tokens, el régimen de entrenamiento (precision, épocas, etc.) ni si se aplicaron técnicas de alineación como RLHF o DPO. Toda esta información se declara como "[More Information Needed]" en la model card.

## Capacidades

- Generación de texto: el modelo está diseñado para text-generation, según el pipeline declarado.
- Conversación: el tag "conversational" sugiere que puede mantener diálogos multi-turno, aunque no hay evidencia concreta.
- Sin censura: el nombre "uncensored" indica que se ha eliminado o reducido el filtrado de contenido, lo que permite generar respuestas que otros modelos rechazarían. No obstante, no hay documentación que detalle el alcance de esta característica.
- No se dispone de información sobre tool calling, function calling, capacidades de agente, razonamiento multi-paso, soporte multimodal (visión, audio) ni modo de pensamiento explícito. Estas capacidades no se mencionan en ningún documento.

## Casos de uso

Dada la falta de información técnica detallada, los casos de uso deben considerarse hipotéticos y basados en el tamaño y la naturaleza del modelo. Se recomienda validar cada escenario con pruebas propias.

- Generación creativa de texto: el modelo puede emplearse para redactar historias, poemas o guiones sin las restricciones típicas de contenido, gracias a su naturaleza "uncensored". Su tamaño compacto permite ejecutarlo en hardware modesto.
- Chatbots de nicho: para aplicaciones donde se requiere un asistente conversacional sin filtros de seguridad, como prototipos de investigación o entornos controlados. La ausencia de censura debe gestionarse con cuidado para evitar usos indebidos.
- Prototipado rápido: al ser un modelo pequeño, es adecuado para pruebas de concepto en entornos de desarrollo, donde se puede iterar rápidamente sin necesidad de GPUs de alta gama.
- Inferencia en dispositivos edge: con ~2 mil millones de parámetros, el modelo puede ejecutarse en dispositivos con 4-8 GB de RAM/VRAM, como portátiles o mini-PCs, siempre que se cuantice adecuadamente (aunque no se ofrecen cuantizaciones oficiales).
- Aumento de datos sintéticos: podría utilizarse para generar texto sintético para entrenar otros modelos, aprovechando su capacidad de producir contenido sin restricciones.
- Investigación académica sobre destilación: dado su origen en una cadena de destilación, puede servir como caso de estudio para analizar la transferencia de conocimiento desde modelos MoE grandes a modelos densos pequeños.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No hay datos de MMLU, HumanEval, GSM8K ni ninguna otra métrica estándar. Tampoco se ofrecen comparaciones con modelos similares. Cualquier afirmación sobre rendimiento sería especulativa.

## Requisitos de hardware

Los siguientes requisitos son estimaciones basadas en el número de parámetros (2,03 mil millones) y el tamaño del repositorio (4,1 GB, que sugiere pesos en FP16 o BF16). No hay información oficial del autor.

- VRAM estimada para inferencia:
  - FP16/BF16: ~4,1 GB de pesos + overhead de activaciones y KV cache. Se recomienda al menos 6 GB de VRAM.
  - Int8 (si se cuantiza): ~2 GB de pesos, con al menos 4 GB de VRAM.
  - Int4 (si se cuantiza): ~1 GB de pesos, con al menos 2-3 GB de VRAM.
- GPU recomendadas: GPUs de consumo como NVIDIA RTX 3060 (12 GB), RTX 4060 (8 GB), RTX 4070 (12 GB) o superiores. También puede ejecutarse en Apple Silicon (M1/M2/M3) con suficiente memoria unificada.
- Compatibilidad con consumer GPU: sí, siempre que se cuantice o se use FP16 con una GPU de al menos 6 GB.
- Opciones de despliegue: el modelo es compatible con transformers y text-generation-inference (según tags). También se puede servir mediante FriendliAI (según el enlace encontrado). No hay GGUF oficial, pero podría convertirse con herramientas como llama.cpp. No se menciona compatibilidad con Ollama, aunque existe un repositorio en Ollama de un usuario distinto (reaperdoesntrun) que podría ser una conversión no oficial.
- Latencia y throughput: no disponibles. Dependerán del hardware y la cuantización.

## Comparativa con modelos similares

No se dispone de datos de rendimiento ni de especificaciones detalladas para establecer una comparativa rigurosa. Los modelos comparables por tamaño serían Qwen2.5-1.5B, Gemma-2-2B, Phi-3-mini (3.8B), Llama-3.2-1B, etc., pero no hay información sobre cómo se comporta este modelo frente a ellos. La única diferencia clara es su naturaleza "uncensored" y su origen en destilación desde un MoE grande, pero sin métricas no se puede evaluar su calidad relativa. Se indica "no disponible" para esta sección.

## Limitaciones y advertencias

- Documentación insuficiente: la model card no contiene información técnica útil; el autor no ha detallado arquitectura, datos de entrenamiento, hiperparámetros ni evaluación. Esto impide una validación rigurosa.
- Sesgos desconocidos: al no conocer el dataset de entrenamiento, no se pueden identificar sesgos potenciales. El nombre "uncensored" sugiere que se han eliminado filtros de seguridad, lo que puede derivar en la generación de contenido ofensivo, ilegal o perjudicial.
- Riesgo de alucinación: como todo modelo de lenguaje, puede generar información falsa o inventada. Sin benchmarks, se desconoce la frecuencia de estos errores.
- Licencia no disponible: no se especifica la licencia, lo que impide conocer las condiciones de uso comercial, redistribución o modificación. Esto es un riesgo legal para cualquier despliegue en producción.
- Limitaciones de contexto e idioma: se desconoce la longitud máxima de contexto y los idiomas soportados. Es probable que herede las capacidades de Qwen3 (multilingüe), pero no está confirmado.
- Compatibilidad de cuantización: no se ofrecen versiones GGUF ni AWQ, por lo que el despliegue eficiente en CPU o GPUs de baja gama requiere conversión manual, que puede degradar el rendimiento si no se hace correctamente.
- Fecha de creación futura: el modelo fue creado en marzo de 2026 y actualizado en agosto de 2026, según los metadatos. Esto puede indicar un error en el reloj del sistema o una fecha deliberadamente falsa, lo que añade incertidumbre sobre la procedencia.

## Enlaces

- HuggingFace: https://huggingface.co/reaperdoesntknow/DistilQwen3-1.7B-uncensored
- FriendliAI (servicio de inferencia): https://friendli.ai/models/reaperdoesntknow/DistilQwen3-1.7B-uncensored
- Ollama (repositorio de un usuario distinto, posible conversión no oficial): https://ollama.com/reaperdoesntrun/DistilQwen3-1.7B-uncensored
- Modelo base: https://huggingface.co/reaperdoesntknow/Qwen3-1.7B-Distilled-30B-A3B (referenciado en los metadatos)
