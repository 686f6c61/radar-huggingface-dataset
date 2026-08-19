# LeaderboardModel1/Qwen3.8-27B-AutoRound-MXFP4-ModelFree

## Resumen

El modelo `LeaderboardModel1/Qwen3.8-27B-AutoRound-MXFP4-ModelFree` es una cuantización de baja precisión (MXFP4, Microscaling FP4) del modelo base `Qwen/Qwen3.8-27B`, generada mediante la herramienta `agent_optimize` de Intel. Forma parte de la iniciativa Intel Low-Bit Open LLM Leaderboard, orientada a evaluar y publicar modelos de lenguaje con formatos de pesos de pocos bits para reducir el consumo de memoria y acelerar la inferencia en entornos con recursos limitados.

Con 27.781.427.952 parámetros (aproximadamente 27,8 mil millones), este modelo conserva la arquitectura del modelo original de Qwen, aunque no se proporcionan detalles específicos sobre su estructura interna. Al tratarse de una cuantización MXFP4, los pesos se representan con 4 bits, lo que reduce significativamente el espacio en memoria respecto a la versión en BF16 o FP16. La licencia no está especificada en la ficha, pero se indica que se debe seguir la del modelo original.

La relevancia de este modelo radica en su potencial para desplegar capacidades de generación de texto y conversación de un modelo de 27B en hardware más asequible, aunque no se han publicado benchmarks completos que permitan evaluar su rendimiento real más allá de un único resultado en la tarea PiQA.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (heredada de Qwen/Qwen3.8-27B) |
| Parametros totales | 27.781.427.952 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | MXFP4 (Microscaling FP4) |
| Idiomas soportados | no disponible |
| Licencia | no disponible (se debe seguir la del modelo original) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

No se dispone de información detallada sobre la arquitectura interna del modelo base `Qwen/Qwen3.8-27B`. Se sabe que es un modelo de lenguaje de tipo transformer, pero no se especifican detalles como el número de capas, cabezas de atención o mecanismos de atención (por ejemplo, si usa atención lineal o ventana deslizante). Al ser una cuantización, no hubo un entrenamiento desde cero: se partió de los pesos ya entrenados del modelo base y se aplicó un proceso de cuantización post-entrenamiento (PTQ) mediante la herramienta `agent_optimize` de Intel, que implementa el método descrito en el paper "Optimize weight rounding via signed gradient descent for the quantization of llms" (arXiv:2309.05516). Este método optimiza el redondeo de los pesos para minimizar la pérdida de precisión al cuantizar a formatos de pocos bits.

El esquema de cuantización es MXFP4, que utiliza un formato de punto flotante de 4 bits con escala por bloque (microscaling). No se han publicado detalles sobre el dataset de calibración utilizado ni sobre el proceso exacto de cuantización.

## Capacidades

- Generación de texto y conversación: el modelo está diseñado para tareas de generación de lenguaje natural, como se indica en el pipeline `text-generation`.
- Capacidades conversacionales: el modelo puede utilizarse en modo chat, tal como se muestra en el ejemplo de uso con `apply_chat_template`.
- Al ser una cuantización del modelo Qwen3.8-27B, se espera que herede las capacidades generales de razonamiento, conocimiento y generación de código del modelo original, aunque no se han documentado explícitamente en esta ficha.
- No se menciona soporte para tool calling, function calling, agentes, visión, audio u otras capacidades especiales.
- No se especifican idiomas soportados, aunque el modelo base Qwen3.8-27B probablemente sea multilingüe.

## Casos de uso

- Despliegue en entornos con memoria limitada: gracias a la cuantización MXFP4, el modelo ocupa aproximadamente la mitad de espacio que su versión en BF16, lo que permite ejecutarlo en GPUs con 16 GB o 24 GB de VRAM. Es adecuado para prototipos y aplicaciones donde no se dispone de hardware de gama alta.
- Asistentes conversacionales embebidos: al ser un modelo de chat, puede integrarse en aplicaciones de atención al cliente, asistentes virtuales o chatbots que requieran respuestas en lenguaje natural sin necesidad de una GPU de gran capacidad.
- Generación de código en entornos de desarrollo: aunque no hay benchmarks específicos, el modelo base Qwen3.8-27B es conocido por sus capacidades de código. Esta versión cuantizada podría usarse en entornos de desarrollo con restricciones de memoria, como portátiles con GPU de consumo.
- Inferencia de baja latencia en producción: el formato FP4 reduce el ancho de banda de memoria, lo que puede mejorar el throughput en servidores con GPUs como A100 o H100, aunque no se han publicado mediciones concretas.
- Evaluación de técnicas de cuantización: este modelo forma parte del Low-Bit Open LLM Leaderboard, por lo que puede utilizarse como referencia para investigar el impacto de la cuantización MXFP4 en el rendimiento de modelos de 27B.
- Aplicaciones educativas y de investigación: sirve como ejemplo práctico de cómo aplicar cuantización de 4 bits a un modelo grande y cómo cargarlo con AutoRound o vLLM, útil para cursos o experimentos de eficiencia en IA.

## Benchmarks y rendimiento

La model card solo reporta un resultado de evaluación:

| Tarea | Accuracy |
|---|---|
| piqa | 0.8090 |

No se han publicado resultados en otros benchmarks estándar como MMLU, HumanEval, GSM8K o MT-Bench. Tampoco se comparan estos resultados con el modelo base o con otras cuantizaciones. Por tanto, no es posible evaluar la degradación de rendimiento causada por la cuantización.

## Requisitos de hardware

- No se proporcionan requisitos oficiales de hardware.
- Estimación de VRAM: con 27.781.427.952 parámetros en FP4 (4 bits por peso), el peso del modelo ocupa aproximadamente 27.8e9 × 0.5 bytes ≈ 13,9 GB, más overhead de activaciones, KV cache y otros tensores. En la práctica, podría requerir entre 16 GB y 24 GB de VRAM dependiendo de la longitud de contexto y el batch size.
- GPUs recomendadas: una RTX 4090 (24 GB) o una A100 de 40 GB serían suficientes para inferencia con contexto moderado. GPUs con 16 GB (como RTX 4080) podrían funcionar con configuraciones optimizadas.
- Opciones de despliegue: el modelo se puede cargar con `transformers` y AutoRound, o servir con vLLM (como se muestra en el README). También podría usarse con llama.cpp si se convierte a GGUF, aunque no se menciona.
- Latencia y throughput: no se han publicado datos concretos. La cuantización FP4 debería reducir el uso de memoria y potencialmente mejorar la velocidad, pero depende del hardware y del backend.

## Comparativa con modelos similares

No se dispone de información suficiente para comparar este modelo con alternativas de la misma categoría (por ejemplo, otras cuantizaciones de Qwen3.8-27B o modelos de 27B en FP4). No se han publicado resultados de benchmarks comparativos ni se conocen modelos directamente comparables en el momento de redactar esta ficha.

## Limitaciones y advertencias

- La model card advierte que el modelo puede producir información factualmente incorrecta y que no debe utilizarse como fuente fiable de datos.
- Puede generar contenido ofensivo, sesgado o inapropiado debido a las limitaciones del modelo preentrenado y de los datos de entrenamiento.
- Se recomienda realizar pruebas de seguridad y sesgos antes de desplegar cualquier aplicación en producción.
- La licencia no está especificada en la ficha; el autor indica que se debe seguir la licencia del modelo original `Qwen/Qwen3.8-27B`, pero no se proporciona el texto de dicha licencia. Es necesario consultar la página del modelo base para conocer los términos exactos.
- Al ser una cuantización de 4 bits, es probable que exista una degradación de la calidad de las respuestas respecto al modelo original en tareas complejas, aunque no se ha cuantificado.
- El modelo tiene 0 descargas y 0 likes, lo que sugiere que es una publicación reciente o poco probada; su fiabilidad en producción no está establecida.

## Enlaces

- [Página del modelo en HuggingFace](https://huggingface.co/LeaderboardModel1/Qwen3.8-27B-AutoRound-MXFP4-ModelFree)
- [Modelo base Qwen/Qwen3.8-27B](https://huggingface.co/Qwen/Qwen3.8-27B)
- [Repositorio de AutoRound](https://github.com/intel/auto-round)
- [Paper de AutoRound (arXiv:2309.05516)](https://arxiv.org/abs/2309.05516)
- [Intel Low-Bit Open LLM Leaderboard](https://huggingface.co/spaces/Intel/low_bit_open_llm_leaderboard)
