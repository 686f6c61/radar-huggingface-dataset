# jhlyu/aiwa_r3_int4

## Resumen

aiwa_r3_int4 es una cuantización de 4 bits del modelo Qwen/Qwen3.6-35B-A3B, publicada por el usuario jhlyu en Hugging Face. Se trata de un artefacto derivado (un finetune sobre el modelo base de Qwen) empaquetado en formato int4 con esquema w4a16, es decir, pesos en 4 bits y activaciones en 16 bits, pensado para su despliegue con vLLM. El repositorio ocupa 21,9 GB y se distribuye bajo licencia Apache 2.0, con acceso restringido (gated), de modo que es necesario aceptar las condiciones en Hugging Face antes de descargarlo.

El modelo base, Qwen3.6-35B-A3B, pertenece a la familia Qwen3.6 de Alibaba y, por su nomenclatura, corresponde a una arquitectura Mixture of Experts con aproximadamente 35 000 millones de parámetros totales y unos 3000 millones de parámetros activos por token. La cuantización a 4 bits reduce de forma sustancial el espacio en disco y la VRAM necesaria frente a los pesos en bf16, lo que facilita su ejecución en GPUs de gama alta para consumo o en nodos con varias GPU de 24 GB.

La relevancia de esta ficha es acotada: se trata de una publicación con cero descargas y un único "like" en el momento de la consulta, sin documentación técnica publicada en la información disponible. No hay model card descriptiva, ni resultados de benchmarks, ni detalles sobre el proceso de cuantización más allá de las etiquetas del repositorio. Cualquier evaluación de calidad debe remitirse al modelo base original.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base Qwen3.6-35B-A3B, presumiblemente Mixture of Experts) |
| Parametros totales | no disponible con exactitud; la nomenclatura del modelo base sugiere ~35B |
| Parametros activos | no disponible con exactitud; la nomenclatura del modelo base sugiere ~3B (A3B) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | int4 con esquema w4a16 (pesos 4 bits, activaciones 16 bits) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (compatible con vLLM) |

## Arquitectura y entrenamiento

No se dispone de información sobre la arquitectura interna, los datos de entrenamiento ni el proceso de ajuste del modelo base Qwen3.6-35B-A3B en la información proporcionada. La etiqueta `base_model:finetune:Qwen/Qwen3.6-35B-A3B` indica que aiwa_r3_int4 es un finetune del modelo Qwen3.6-35B-A3B, y la etiqueta `aiwa` sugiere un proyecto o variante denominada así, pero no hay documentación que detalle el corpus, el número de tokens, la composición del dataset ni si se emplearon técnicas de RLHF o DPO.

Respecto a la cuantización, las etiquetas confirman el esquema w4a16, habitual en herramientas como GPTQ o AWQ, que cuantizan los pesos a 4 bits manteniendo las activaciones en 16 bits para preservar precisión en la inferencia. El repositorio está marcado como compatible con vLLM, lo que implica que los pesos siguen el formato esperado por dicho motor de inferencia. No se especifica el algoritmo exacto de cuantización (GPTQ, AWQ, etc.), el tamaño de grupo, ni si se aplicó calibración con un dataset concreto.

## Capacidades

- Generación de texto y razonamiento: capacidades heredadas del modelo base Qwen3.6-35B-A3B, si bien no se documentan explícitamente en la información disponible.
- Código y matemáticas: no disponible.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible.
- Capacidades especiales (modo thinking, visión, audio): no disponible.
- Despliegue optimizado para vLLM: el formato w4a16 y la compatibilidad declarada con vLLM permiten servir el modelo con ese motor, aunque no se detallan capacidades adicionales.

## Casos de uso

- Despliegue en vLLM con cuantización int4: el formato w4a16 y la etiqueta vllm permiten cargar el modelo en un servidor de inferencia con menor huella de VRAM que la versión bf16, adecuado para entornos con GPUs de 24-48 GB.
- Servicio de generación de texto en producción: al tratarse de un derivado de un modelo de ~35B con ~3B activos, el coste por token es bajo en comparación con modelos densos del mismo tamaño total, lo que lo hace apto para APIs de texto a gran escala.
- Prototipado e investigación sobre cuantización: útil para estudiar el impacto de la cuantización int4 w4a16 en la calidad de un modelo MoE de gran tamaño, comparando contra el modelo base en bf16.
- Evaluación de finetunes comunitarios: el tag `aiwa` y el finetune sobre Qwen3.6 permiten experimentar con variantes ajustadas sin necesidad de infraestructura para pesos completos.
- Inferencia en nodos multi-GPU de gama alta: los 21,9 GB del repositorio caben en configuraciones de dos GPU de 24 GB o una de 48 GB, lo que facilita el despliegue en clústeres modestos.
- Benchmarking comparativo de cuantizaciones: sirve como referencia para medir latencia y throughput de w4a16 frente a otros esquemas (GGUF, AWQ, GPTQ) sobre el mismo modelo base.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el repositorio pesa 21,9 GB en int4; se requiere al menos esa cantidad de VRAM más overhead de contexto y caché KV, estimándose un mínimo práctico de 24-32 GB para contextos moderados.
- GPU recomendadas: no disponibles de forma explícita; por tamaño, una A100 40/80 GB, H100 o L40S son adecuadas; también dos RTX 4090 (24 GB cada una) en configuración multi-GPU.
- ¿Cabe en consumer GPU?: sí, en GPUs de 24 GB como la RTX 4090 o 3090, siempre que se ajuste el contexto y se reparta la carga si es necesario; en una sola GPU de 24 GB el margen es ajustado.
- Opciones de despliegue: vLLM (declarado en las etiquetas); otros motores no confirmados.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| jhlyu/aiwa_r3_int4 | ~35B totales / ~3B activos (según nomenclatura del base) | no disponible | int4 w4a16 | Apache 2.0 | Gated en Hugging Face |
| Qwen/Qwen3.6-35B-A3B (base) | ~35B totales / ~3B activos (según nomenclatura) | no disponible | bf16 (original) | no disponible en esta ficha | Público en Hugging Face |
| Otras cuantizaciones int4 del mismo base | ~35B / ~3B | no disponible | int4 | según autor | no disponible |

No se dispone de datos de rendimiento para establecer una comparación cuantitativa con alternativas.

## Limitaciones y advertencias

- Ausencia de model card: no hay documentación sobre el proceso de cuantización, calibración ni evaluación, lo que impide garantizar la fidelidad respecto al modelo base.
- Acceso restringido: el repositorio es gated y requiere aceptar condiciones en Hugging Face antes de la descarga.
- Riesgo de degradación por cuantización: el paso a int4 puede introducir pérdida de precisión en tareas sensibles (matemáticas, código, razonamiento largo), no cuantificada en la información disponible.
- Sesgos y alucinaciones: no documentados; se heredan los del modelo base, que tampoco se detallan.
- Idiomas: no se especifican los idiomas soportados, por lo que no puede garantizarse cobertura multilingüe.
- Licencia Apache 2.0: permite uso comercial, pero conviene verificar las condiciones del modelo base Qwen3.6-35B-A3B, que podrían imponer restricciones adicionales.
- Madurez: cero descargas y un único "like" en el momento de la consulta; no hay evidencia de uso en producción ni validación comunitaria.
- Compatibilidad: solo se declara vLLM; otros motores (llama.cpp, Ollama, TGI) no están confirmados.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/jhlyu/aiwa_r3_int4
- Modelo base: https://huggingface.co/Qwen/Qwen3.6-35B-A3B
- No se han encontrado papers, blogs, repositorios ni demos adicionales en la información proporcionada.
