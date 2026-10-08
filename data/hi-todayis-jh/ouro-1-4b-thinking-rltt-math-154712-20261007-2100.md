# hi-todayis-jh/ouro-1.4b-thinking-rltt-math-154712-20261007-2100

# Ouro 1.4b thinking, RLTT sobre MATH (checkpoint de hi-todayis-jh)

## Resumen

Este repositorio contiene un ajuste fino completo (full-parameter) del modelo ByteDance/Ouro-1.4B-Thinking mediante aprendizaje por refuerzo sobre el conjunto de datos DigitalLearningGmbH/MATH-lighteval. Lo publica el usuario hi-todayis-jh (vinculado a la Universidad Carnegie Mellon segun la URL del experimento en Weights & Biases) y no se trata de una publicacion oficial de ByteDance, sino de un artefacto experimental de investigación. El entrenamiento se ha realizado con la librería verl y la técnica que el autor denomina RLTT, con 4 bucles recurrentes, 256 prompts por lote de rollout, 8 generaciones por prompt y 5 epocas (145 pasos de rollout).

El interés técnico del checkpoint está en que el modelo base pertenece a la familia Ouro, basada en una arquitectura de transformer con profundidad recurrente (bucles): el mismo bloque de parámetros se aplica varias veces, y el modelo dispone de estados y probabilidades de salida por bucle. El autor indica que la ejecución de RLTT utiliza un adaptador local que expone esos estados nativos y las probabilidades de salida por bucle, lo que permite optimizar no solo el contenido generado, sino también el comportamiento de parada por bucle.

Se trata, por tanto, de un artefacto de investigación con 0 descargas y 0 "likes" en el momento de la consulta, cuyo valor principal es documentar una receta reproducible de RL sobre un modelo de profundidad recurrente, más que un modelo listo para producción. El repositorio ocupa 11,5 GB porque incluye checkpoints de entrenamiento completos (fragmentos FSDP, estado del optimizador, estado del RNG y del cargador de datos), no solo pesos de inferencia.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer con profundidad recurrente (bucles); 4 bucles recurrentes en esta ejecución (herencia del modelo base Ouro-1.4B-Thinking) |
| Parámetros totales | Aproximadamente 1,4 mil millones, segun la nomenclatura del modelo base; no confirmado de forma explícita en la información proporcionada |
| Parámetros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible. El entrenamiento limita los prompts a 1024 tokens y las completaciones a 2048 tokens, lo que no equivale a la ventana de contexto nativa del modelo |
| Tipos de cuantización | No disponible. No se publican pesos cuantizados (GGUF, AWQ, GPTQ) en este repositorio |
| Idiomas soportados | No disponible. El conjunto de datos de entrenamiento (MATH-lighteval) es mayoritariamente en inglés |
| Licencia | Apache-2.0 |
| Formato de pesos | Fragmentos FSDP de verl (`global_step_N/actor`) con estado del optimizador y del RNG; fusionables con `python -m verl.model_merger merge --backend fsdp --local_dir global_step_N/actor --target_dir merged` |

## Arquitectura y entrenamiento

La arquitectura subyacente es la del modelo ByteDance/Ouro-1.4B-Thinking, un transformer de profundidad recurrente en el que un mismo conjunto de parámetros se reutiliza en varios bucles de cómputo. El modelo expone, por diseño, estados internos y probabilidades de salida asociadas a cada bucle, de modo que la cantidad de cómputo efectiva puede variar por token o por paso. En esta ejecución concreta el autor fija 4 bucles recurrentes y añade un adaptador local que hace accesibles esos estados y probabilidades al bucle de entrenamiento por refuerzo; según la model card, el modelo modificado referenciado no estaba incluido en el repositorio upstream, por lo que el autor incluye el código fuente y la trazabilidad de la procedencia en este repositorio.

El entrenamiento es de parámetros completos (no LoRA ni adaptadores congelados) y sigue el flujo de verl: 256 prompts por lote de rollout, 8 generaciones por prompt, prompts truncados a 1024 tokens y completaciones a 2048 tokens, 5 épocas equivalentes a 145 pasos de rollout, semilla 42 y checkpoints cada 30 pasos de rollout más un checkpoint final. El nombre del experimento en Weights & Biases (`ouro-1.4b-grpo-rltt-math`) sugiere que el algoritmo de optimización es GRPO combinado con RLTT, aunque la model card no lo explicita formalmente. El conjunto de datos de entrenamiento es DigitalLearningGmbH/MATH-lighteval, una versión ligera del conjunto MATH orientada a problemas de matemáticas con solución verificable. No se documentan fases de RLHF, DPO ni ajuste por preferencias humanas.

## Capacidades

- Generación de texto y razonamiento matemático: el ajuste se ha realizado específicamente sobre MATH-lighteval, por lo que la competencia reforzada es la resolución de problemas matemáticos de tipo competición.
- Modo "thinking" heredado del modelo base: el identificador del modelo (Ouro-1.4B-Thinking) indica una variante orientada a razonamiento extendido, aunque el autor no describe el formato exacto de las trazas de razonamiento en esta ficha.
- Control adaptativo del cómputo por bucle: al exponer los estados y las probabilidades de salida de cada bucle recurrente, el modelo puede en principio ajustar cuántos bucles ejecutar antes de emitir un token; se trata de una capacidad estructural del modelo base, no de una funcionalidad documentada como API.
- Soporte de tool calling / function calling: no disponible; no se documenta en la model card.
- Soporte de agentes y razonamiento multi-paso: no disponible como funcionalidad explícita; el razonamiento multi-paso se limita al propio proceso de resolución matemática.
- Capacidades multilingües: no disponibles; no se declara ningún idioma en los metadatos del repositorio.
- Capacidades de visión, audio o multimodalidad: no disponibles.

## Casos de uso

- Investigación en aprendizaje por refuerzo sobre arquitecturas recurrentes: el repositorio incluye estados de optimizador, RNG y cargador de datos de cada checkpoint, lo que permite reanudar o auditar la ejecución de RLTT paso a paso en lugar de partir solo de los pesos finales.
- Reproducción de experimentos de RL con verl: la receta documentada (256 prompts por rollout, 8 generaciones por prompt, 5 épocas, semilla 42) permite replicar el experimento con el mismo conjunto de datos y comparar variantes de hiperparámetros.
- Estudio del coste computacional adaptativo: al exponer probabilidades de salida por bucle, el checkpoint sirve para analizar si el entrenamiento por refuerzo modifica la distribución de bucles utilizados y, con ello, el coste de inferencia por token.
- Generación de soluciones matemáticas con verificación automática: integrado en un pipeline que compare la respuesta final con un solucionador simbólico, puede emplearse para generar candidatos de solución a problemas de tipo MATH y filtrar por exactitud.
- Destilación y generación de datos sintéticos de razonamiento: las completaciones generadas por el modelo ajustado pueden usarse como datos de entrenamiento para modelos mayores o como conjunto de evaluación de robustez matemática.
- Pruebas de concepto en docencia o evaluación de modelos pequeños: en un entorno controlado con recursos limitados, permite estudiar hasta qué punto un modelo de 1,4 B ajustado con RL mejora frente a su versión base en tareas de matemáticas.
- Auditoría de artefactos experimentales: dado que el autor advierte de la falta de un modelo modificado upstream, este repositorio es un caso de estudio útil sobre trazabilidad y procedencia en publicaciones de pesos derivados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card únicamente enlaza la ejecución de Weights & Biases del entrenamiento y no incluye evaluaciones tipo MMLU, GSM8K, MATH, HumanEval ni comparaciones con el modelo base o con alternativas. La búsqueda web realizada no aportó ningún resultado relevante sobre este checkpoint ni sobre el modelo base: los resultados obtenidos correspondían a definiciones genéricas del término "hi" en diccionarios y enciclopedias, sin relación con el modelo.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16/fp16: en torno a 2,8-3,5 GB solo para los pesos de 1,4 B parámetros, más memoria para caché de activaciones (estimación derivada del número de parámetros, no publicada por el autor).
- VRAM estimada para inferencia en int8: aproximadamente 1,4-2 GB; en int4, aproximadamente 0,7-1,2 GB. Son estimaciones aritméticas, no medidas publicadas, y requieren pesos cuantizados que este repositorio no proporciona.
- Entrenamiento: la ejecución usa entrenamiento de parámetros completos con FSDP y estado del optimizador, por lo que la memoria necesaria es muy superior a la de inferencia. El repositorio de 11,5 GB incluye estos estados; se requiere un entorno multi-GPU para reproducir la receta.
- GPU recomendadas para inferencia: cualquier GPU con 8 GB o más de VRAM (RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070, RTX 4090) debería ser suficiente para los pesos en bf16 con margen para contexto corto. Para servir en paralelo o con lotes grandes se recomiendan A100 40/80 GB o H100.
- GPU recomendadas para entrenamiento: A100, H100 o clústeres equivalentes con FSDP y comunicación NVLink/InfiniBand, dado el uso de shards FSDP y estado del optimizador.
- Opciones de despliegue: los pesos del repositorio son fragmentos FSDP de verl y deben fusionarse con `verl.model_merger` antes de la inferencia. No se documenta compatibilidad con vLLM, llama.cpp, Ollama ni TGI; dado que la arquitectura de profundidad recurrente no es estándar, es necesario verificar el soporte real de cada runner o usar el código del modelo base.
- Latencia y throughput estimados: no disponibles. El coste por token depende del número de bucles ejecutados, parámetro que en esta arquitectura puede ser dinámico.

## Comparativa con modelos similares

Los datos de la columna "modelo base" proceden de la información proporcionada; los de los modelos alternativos proceden de sus fichas públicas y se incluyen como referencia orientativa de categoría (modelos densos de 1-1,5 B parámetros), no de la búsqueda web realizada.

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| hi-todayis-jh/ouro-1.4b-thinking-rltt-math (este checkpoint) | ~1,4 B | No disponible | Apache-2.0 | Repositorio de checkpoints de entrenamiento; requiere fusión de shards |
| ByteDance/Ouro-1.4B-Thinking (modelo base) | ~1,4 B | No disponible | No disponible en la información proporcionada | Pesos públicos en HuggingFace |
| Qwen2.5-1.5B-Instruct | 1,54 B | 32 768 tokens | Apache-2.0 | Amplia disponibilidad, soporte en vLLM, llama.cpp, Ollama |
| Llama-3.2-1B-Instruct | 1,23 B | 128 000 tokens | Licencia comunitaria de Llama 3.2 | Amplia disponibilidad, soporte en los principales runners |
| DeepSeek-R1-Distill-Qwen-1.5B | 1,5 B | 32 768 tokens | MIT | Amplia disponibilidad, orientado a razonamiento |

No se dispone de datos de rendimiento comparativo entre este checkpoint y los modelos anteriores, por lo que la comparación se limita a parámetros, contexto, licencia y disponibilidad.

## Limitaciones y advertencias

- Modelo derivado no oficial: no es una publicación de ByteDance ni del equipo de Ouro; la validez de los resultados depende de la reproducibilidad de la receta del autor.
- Trazabilidad incompleta: la propia model card señala que el modelo modificado referenciado por el autor no estaba incluido en el repositorio upstream y que el adaptador de RLTT es local, lo que dificulta verificar la procedencia exacta del código de entrenamiento.
- Ausencia total de evaluación: no hay benchmarks publicados, ni comparación con el modelo base, ni métricas de la ejecución de Weights & Biases más allá del enlace.
- Riesgo de sobreajuste al dominio: el entrenamiento se realiza únicamente sobre MATH-lighteval, un subconjunto de problemas matemáticos; es previsible una degradación del rendimiento en tareas generales de texto y un posible ajuste excesivo al formato de ese conjunto.
- Riesgo de alucinación: al ser un modelo de razonamiento matemático de pequeño tamaño, puede producir cadenas de razonamiento plausibles con resultados finales incorrectos, especialmente en problemas fuera de la distribución de MATH.
- Contexto de entrenamiento corto: prompts de 1024 tokens y completaciones de 2048 tokens; no está diseñado para conversaciones multi-turno largas ni para documentos extensos.
- Idiomas: no se declara ningún idioma soportado y el conjunto de datos es mayoritariamente en inglés; el comportamiento en castellano no está caracterizado.
- Restricciones de licencia: el repositorio se publica como Apache-2.0, lo que en principio permite uso comercial, pero conviene verificar la licencia y las condiciones del modelo base ByteDance/Ouro-1.4B-Thinking, así como de la librería verl, antes de un uso en producción.
- Formato de pesos no listo para producción: los checkpoints son fragmentos FSDP con estado de optimizador; requieren un paso de fusión y no se distribuyen en safetensors listos para cargar en runners estándar.
- Soporte de herramientas incierto: la arquitectura de profundidad recurrente puede no estar soportada por vLLM, llama.cpp, Ollama o TGI sin adaptaciones específicas.
- Madurez: 0 descargas y 0 "likes" en el momento de la consulta; se trata de un artefacto experimental sin validación por parte de la comunidad.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/hi-todayis-jh/ouro-1.4b-thinking-rltt-math-154712-20261007-2100
- Modelo base: https://huggingface.co/ByteDance/Ouro-1.4B-Thinking
- Conjunto de datos de entrenamiento: https://huggingface.co/datasets/DigitalLearningGmbH/MATH-lighteval
- Ejecución de entrenamiento en Weights & Biases: https://wandb.ai/jiahaozhangg-carnegie-mellon-university/ouro-1.4b-grpo-rltt-math/runs/rltt-154712-20261007-2100
- Librería de entrenamiento verl: https://github.com/volcengine/verl
- Búsqueda web: no se han encontrado enlaces relevantes adicionales (papers, blogs, repositorios o demos) sobre este checkpoint ni sobre el modelo base en la búsqueda realizada.
