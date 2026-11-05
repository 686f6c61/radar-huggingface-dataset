# bmars8218/zils-lite-body-2

## Resumen

zils-lite-body-2 es un modelo de 852.985.920 parámetros (aproximadamente 0,85 mil millones) derivado de Qwen/Qwen3.5-0.8B y publicado por el usuario bmars8218 en HuggingFace. Se trata de un "body" (cuerpo) del pool d3-lite del proyecto Zils, asociado a la subred 127 de Bittensor, una red descentralizada de modelos de IA. El modelo combina pesos de lenguaje y visión, y está diseñado para ser evaluado sobre un "chassis" fijo que aporta la capa de respuesta, el prompt y el runtime, de modo que el body solo contribuye con los pesos.

El modelo se construyó mediante un "soup" (promedio uniforme de pesos) de dos modelos previos —thermopylae-777/zils-lite-body-2 y dasLOL/zils-lite-skills-v5— seguido de un fine-tuning con LoRA de rango 16 y learning rate 1e-4 durante una época, con los pesos fusionados posteriormente. El entrenamiento utilizó 9.600 filas tras el split de validación del trainer oficial, compuestas por respuestas suaves del conjunto público zils-ai/zils-relay-answers, filas generadas con etiquetas calculadas según recetas públicas de examen y las propias probabilidades del soup inicial como regularizador.

Su relevancia es acotada: se trata de un modelo experimental de investigación dentro de un ecosistema de competición descentralizada, con cero descargas y cero likes en el momento de la ficha, y cuyos resultados solo se han medido en un proxy local, no en el examen privado de la subred. No obstante, ilustra las técnicas de weight souping y fine-tuning LoRA aplicadas a modelos pequeños de menos de mil millones de parámetros.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de Qwen/Qwen3.5-0.8B); no se detalla la configuración interna |
| Parámetros totales | 852.985.920 |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | No disponible (el repo contiene safetensors en precisión completa; no se documentan variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | No disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (librería transformers) |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3.5-0.8B, un transformer de aproximadamente 0,85 mil millones de parámetros, e incorpora pesos de lenguaje y visión según la model card. La construcción siguió un pipeline de tres fases: primero, un soup uniforme de los pesos de thermopylae-777/zils-lite-body-2 (revisión 618946d) y dasLOL/zils-lite-skills-v5 (revisión 2c99205); segundo, un fine-tuning con LoRA de rango 16 y learning rate 1e-4 durante una época usando el trainer oficial `zils.teacher train`; y tercero, la fusión de los adaptadores LoRA en los pesos base.

El conjunto de entrenamiento consta de 9.600 filas tras el split de retención del trainer. Se compone de respuestas suaves del conjunto público zils-ai/zils-relay-answers (licencia Apache-2.0), filas generadas con etiquetas calculadas siguiendo recetas públicas de examen, y las probabilidades del soup inicial empleadas como regularizador. No se documenta el número total de tokens de entrenamiento, la composición detallada del dataset ni si hubo etapas de RLHF o DPO. La innovación técnica principal es el uso de weight souping combinado con LoRA sobre un modelo base pequeño, orientado a maximizar una métrica de examen específica del pool.

## Capacidades

- Generación de texto y razonamiento de propósito general, heredados del modelo base Qwen/Qwen3.5-0.8B.
- Procesamiento de visión: la model card indica explícitamente que el body contiene "language and vision weights".
- Capacidad de decisión: las etiquetas zils, decision y soup-body sugieren un ajuste orientado a tareas de decisión evaluadas por el chassis del pool.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponibles; no se documentan los idiomas soportados.
- Modo thinking, audio u otras capacidades especiales: no disponible.

## Casos de uso

- Investigación sobre weight souping: el modelo sirve como caso de estudio reproducible de cómo promediar pesos de dos fine-tunes (thermopylae-777/zils-lite-body-2 y dasLOL/zils-lite-skills-v5) y aplicar después LoRA para recuperar rendimiento en una tarea concreta.
- Experimentación en subredes Bittensor: puede emplearse como body de referencia en el pool d3-lite de la subred 127 de Zils, evaluándolo contra el chassis fijado por el pool y comparando su proxy score con el de los modelos de partida.
- Fine-tuning de bajo coste en modelos pequeños: sus 852 millones de parámetros permiten reproducir el pipeline completo (soup, LoRA rango 16, una época, fusión) en una sola GPU de consumo, lo que lo convierte en un banco de pruebas para recetas de entrenamiento.
- Evaluación de técnicas de regularización: el uso de las probabilidades del soup inicial como regularizador durante el entrenamiento puede estudiarse y compararse con otras estrategias en tareas de clasificación o decisión.
- Prototipado de pipelines multimodales ligeros: al incluir pesos de visión, puede integrarse en prototipos que requieran procesamiento conjunto de texto e imagen en entornos con recursos limitados, aunque las capacidades exactas de visión no están documentadas.
- Docencia y divulgación: por su tamaño reducido y su licencia Apache-2.0, es adecuado para demostrar en cursos o talleres cómo funcionan los modelos derivados, el souping y la fusión de adaptadores LoRA sin requerir infraestructura costosa.

## Benchmarks y rendimiento

Los únicos resultados publicados son los del proxy local del autor (semillas públicas de examen sin las familias k6, 22 familias, funciones de puntuación oficiales). No son el examen privado y no predicen su resultado.

| Body | Proxy score |
|---|---:|
| this body (zils-lite-body-2 de bmars8218) | 51,38 |
| starting soup | 49,75 |
| dasLOL/zils-lite-skills-v5 | 47,86 |
| thermopylae-777/zils-lite-body-2 | 46,66 |

Otras dos semillas de la misma receta obtuvieron 49,49 y 50,31, y esta semilla fue la mejor de las tres. En los conjuntos de evaluación retenidos por el autor, que no contienen familias de recetas de examen, este body puntuó 0,40 y 0,88 puntos por debajo del soup inicial. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: con 852.985.920 parámetros, en fp16 se requieren aproximadamente 1,7 GB solo para los pesos; en fp32, unos 3,4 GB. A ello hay que sumar la memoria del runtime (KV cache, activaciones), por lo que un despliegue realista en fp16 parte de unos 2,5-3 GB.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM puede alojar el modelo en fp16. Para mayor throughput, se recomiendan GPUs de datacenter como A100 o H100, aunque no son necesarias.
- Cabe en GPU de consumo: sí, en tarjetas como RTX 3060 (12 GB), RTX 4060 Ti (8/16 GB), RTX 4070, RTX 4080 y RTX 4090, así como en GPUs integradas con suficiente memoria compartida.
- Opciones de despliegue: al estar en formato safetensors y usar la librería transformers, es compatible con vLLM, TGI y transformers directamente. No se documenta soporte de llama.cpp u Ollama, aunque la conversión a GGUF sería técnicamente posible al no ser un modelo MoE.
- Latencia y throughput estimados: no disponibles; no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Rendimiento documentado |
|---|---|---|---|---|---|
| zils-lite-body-2 (bmars8218) | 852.985.920 | No disponible | Apache-2.0 | HuggingFace, 0 descargas | Proxy score 51,38 (proxy local del autor) |
| Qwen/Qwen3.5-0.8B (base) | ~0,8 mil millones | No disponible | No disponible en la información | HuggingFace | No disponible |
| dasLOL/zils-lite-skills-v5 | No disponible | No disponible | No disponible | HuggingFace | Proxy score 47,86 (mismo proxy) |
| thermopylae-777/zils-lite-body-2 | No disponible | No disponible | No disponible | HuggingFace | Proxy score 46,66 (mismo proxy) |

La comparación se limita a los modelos del mismo ecosistema Zils, ya que no se dispone de datos de benchmarks estándar que permitan contrastarlo con alternativas de propósito general como Qwen2.5-0.5B, SmolLM2-1.7B o Gemma-2-2B. Los tres modelos comparados comparten el mismo proxy de evaluación, pero no se documentan sus parámetros ni contextos.

## Limitaciones y advertencias

- El modelo está diseñado para un chassis concreto del pool d3-lite de Zils; fuera de ese entorno, su capa de respuesta, prompt y runtime no están incluidos, por lo que su comportamiento en uso general no está garantizado.
- Los únicos resultados publicados son de un proxy local (51,38) y no del examen privado de la subred; el autor advierte explícitamente que no predicen el resultado del examen privado.
- En los conjuntos de evaluación retenidos del propio autor, el modelo rinde por debajo del soup inicial (0,40 y 0,88 puntos menos), lo que sugiere un sobreajuste a las recetas de examen públicas.
- No se documentan los idiomas soportados, la longitud de contexto ni las capacidades exactas de tool calling o razonamiento multi-paso.
- Riesgo de alucinación: no cuantificado; al ser un modelo de 0,85 mil millones de parámetros, la capacidad de razonamiento factual es limitada en comparación con modelos mayores.
- Sesgos conocidos: no documentados.
- Restricciones de licencia: Apache-2.0 permite uso comercial, pero las filas del conjunto zils-ai/zils-relay-answers conservan las licencias de los textos fuente registradas en la model card del dataset; es necesario revisar esa card antes de reutilizar dichos datos.
- El modelo tiene 0 descargas y 0 likes, y fue creado y actualizado el mismo día (2026-11-05), lo que indica que no ha pasado por validación comunitaria.
- La model card menciona pesos de visión, pero no se detalla qué tareas de visión soporta ni con qué resolución o formato de entrada.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/bmars8218/zils-lite-body-2
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B
- Modelo de partida 1: https://huggingface.co/thermopylae-777/zils-lite-body-2
- Modelo de partida 2: https://huggingface.co/dasLOL/zils-lite-skills-v5
- Modelo base del ecosistema: https://huggingface.co/vllm-sr/d3-lite
- Conjunto de datos de respuestas: https://huggingface.co/datasets/zils-ai/zils-relay-answers
- Modelo citado en atribución: https://huggingface.co/Maincode/Matilda-Decision-v1-Edge
- Modelo citado en atribución: https://huggingface.co/zils-ai/jiwo-0.8b-full
