# Skull18500/Biggerbrain3_151m

## Resumen

Biggerbrain3_151m es un modelo de lenguaje de 151 millones de parámetros desarrollado por Skull18500, presentado como la primera entrega de la línea *Biggerbrain 3*. Combina una arquitectura de transformer recurrente (con un bucle en las 5 capas centrales) con una capa de mezcla de expertos (MoE) promediada de forma suave, con el objetivo de maximizar la densidad de razonamiento por parámetro. El modelo se publica bajo licencia MIT y está pensado para generación de texto en inglés.

El modelo destaca por incorporar un pipeline de entrenamiento mejorado respecto a sus predecesores: muestreo de datasets basado en porcentajes, programación de tasa de aprendizaje *warmup-stable-decay*, una cabeza de predicción multi-token (MTP) que añade un token extra, y el uso de los optimizadores Muon y AdamW8bit. Con solo 150 millones de parámetros, se posiciona como un modelo compacto orientado a entornos con recursos limitados, aunque no se han publicado benchmarks que permitan cuantificar su rendimiento real.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer recurrente (bucle en 5 capas centrales) con MoE suave promediada |
| Parametros totales | 150.162.417 |
| Parametros activos | no disponible (la arquitectura MoE suave no especifica activación selectiva) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el repositorio solo contiene safetensors en precisión completa) |
| Idiomas soportados | en (inglés) |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura combina un transformer recurrente, donde las 5 capas centrales se ejecutan en bucle, con una capa de mezcla de expertos promediada de forma suave. Este diseño busca aumentar la capacidad efectiva de razonamiento sin incrementar proporcionalmente el número de parámetros, una estrategia similar a la de modelos como MoLaMaRT (Mixture of Layers and Memory augmented Recurrent Transformer), mencionada en el repositorio oficial de BiggerBrain.

El entrenamiento emplea un pipeline modificado respecto a versiones anteriores: muestreo de datasets por porcentajes, una programación de tasa de aprendizaje *warmup-stable-decay*, una cabeza de predicción multi-token (MTP) que predice un token adicional, y los optimizadores Muon y AdamW8bit. No se especifican el volumen total de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de alineación como RLHF o DPO.

## Capacidades

- Generación de texto en inglés, con énfasis en razonamiento y coherencia según la descripción del autor.
- Arquitectura recurrente que permite procesar secuencias de forma iterativa, aunque no se documenta la longitud máxima de contexto soportada.
- No se mencionan capacidades de tool calling, function calling, agentes, visión, audio ni modo *thinking*.
- El modelo es monolingüe (inglés) según la etiqueta `language: en`.
- No se dispone de información sobre soporte de código, matemáticas o tareas específicas más allá de la generación de texto general.

## Casos de uso

- Experimentación académica: al ser un modelo pequeño y de código abierto (MIT), es adecuado para estudiar arquitecturas recurrentes con MoE en entornos de investigación con recursos limitados.
- Prototipado rápido: puede servir como base para probar pipelines de generación de texto o sistemas de chat simples antes de escalar a modelos mayores.
- Generación de texto ligera: para aplicaciones donde la latencia y el consumo de memoria son críticos, como asistentes embebidos o demos en CPU.
- Fine-tuning educativo: su tamaño permite realizar ajustes finos en una sola GPU de gama media, útil para aprender técnicas de entrenamiento y evaluación.
- Generación de contenido corto: redacción de párrafos, resúmenes breves o respuestas automáticas en inglés, siempre que no se requiera alta precisión.
- Benchmarking de arquitecturas: permite comparar el rendimiento de transformers recurrentes frente a transformers estándar de tamaño similar en tareas de razonamiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas como MMLU, HumanEval, GSM8K ni comparaciones con otros modelos. Tampoco se han encontrado evaluaciones independientes en la búsqueda web.

## Requisitos de hardware

- Al tratarse de un modelo de 150 millones de parámetros, el peso en fp32 ocupa aproximadamente 600 MB, por lo que puede ejecutarse en CPU con RAM suficiente (8 GB recomendados).
- En GPU, cabría en tarjetas con 2 GB de VRAM o menos si se usa cuantización (no disponible en el repositorio, pero podría generarse con herramientas como llama.cpp o GPTQ).
- GPUs recomendadas: cualquier GPU con al menos 2 GB de VRAM (por ejemplo, NVIDIA GTX 1650, RTX 2060, o incluso integradas con suficiente memoria compartida).
- Opciones de despliegue: al no incluir pesos en GGUF ni otros formatos cuantizados, habría que convertirlos manualmente. Se podría usar vLLM, llama.cpp u Ollama tras la conversión, aunque no hay soporte oficial documentado.
- Latencia y throughput: no disponibles. Al ser un modelo pequeño, se espera una inferencia rápida en CPU moderna (decenas de tokens por segundo), pero sin datos concretos.

## Comparativa con modelos similares

No se dispone de datos comparativos publicados. Como referencia, existen otros modelos de tamaño similar como SmolLM2-135M (HuggingFace) o Qwen2.5-0.5B, pero no se han encontrado evaluaciones que comparen directamente con Biggerbrain3_151m. La arquitectura recurrente con MoE es poco común en este rango de parámetros, por lo que no hay alternativas directas conocidas.

## Limitaciones y advertencias

- No se han publicado benchmarks, por lo que el rendimiento real en tareas estándar es desconocido.
- El modelo solo soporta inglés; no es adecuado para aplicaciones multilingües.
- La longitud de contexto no está documentada, lo que dificulta su uso en tareas que requieran ventanas largas.
- No se especifican sesgos ni riesgos de alucinación, pero al ser un modelo pequeño entrenado con un dataset no descrito, es probable que presente limitaciones de coherencia y factualidad.
- La licencia MIT permite uso comercial, pero el autor no ofrece garantías ni soporte.
- El repositorio no incluye pesos cuantizados ni instrucciones de despliegue, lo que puede dificultar su integración en producción.

## Enlaces

- HuggingFace: https://huggingface.co/Skull18500/Biggerbrain3_151m
- Repositorio GitHub oficial: https://github.com/Skull18500/BiggerBrain-AI
