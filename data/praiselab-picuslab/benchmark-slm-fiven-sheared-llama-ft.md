# praiselab-picuslab/benchmark-slm-fiven-sheared-llama-ft

## Resumen

`praiselab-picuslab/benchmark-slm-fiven-sheared-llama-ft` es un adaptador LoRA (PEFT) publicado por el usuario `praiselab-picuslab` sobre el modelo base `princeton-nlp/Sheared-LLaMA-1.3B`. Por las etiquetas del repositorio (`benchmark-slm`, `dataset-fiven`, `strategy-ft`, `or2`) parece tratarse de un artefacto de investigación orientado a la evaluación de modelos de lenguaje pequenos (SLM) dentro de un benchmark interno, con ajuste fino supervisado sobre un conjunto de datos denominado `fiven`. El modelo está declarado para la tarea `text-generation` y únicamente para el idioma italiano (`it`).

El interés técnico del artefacto no está en el adaptador en sí, sino en la combinación elegida: Sheared-LLaMA-1.3B es un transformer decoder-only de 1.300 millones de parámetros obtenido por poda estructurada de LLaMA-2-7B y preentrenamiento de continuación, lo que lo convierte en una base muy ligera y adecuada para experimentación con recursos limitados. El adaptador ocupa 0,0 GB en el repositorio y el acceso está restringido (gated), lo que sugiere que los pesos pueden no estar efectivamente publicados o que requieren aceptación de condiciones.

La relevancia es limitada fuera de su contexto de origen: no hay tarjeta de modelo con datos de entrenamiento, hiperparámetros, licencia ni resultados de evaluación, y el contador de descargas es cero. Debe tratarse como un artefacto reproducible potencialmente útil para investigación comparativa, no como un modelo listo para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (PEFT) sobre transformer decoder-only estilo LLaMA (modelo base Sheared-LLaMA-1.3B, podado de LLaMA-2-7B) |
| Parametros totales | 1,3 B en el modelo base; numero de parametros del adaptador no disponible |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | 4096 tokens en el modelo base; no confirmado para el adaptador |
| Tipos de cuantizacion | No disponible en la ficha; al ser un adaptador, la cuantizacion se aplica al modelo base (fp16, bf16, int8, 4-bit tipo GPTQ/AWQ/GGUF tras fusion) |
| Idiomas soportados | Italiano (`it`) |
| Licencia | No disponible |
| Formato de pesos | `safetensors` (adaptador LoRA, libreria `peft`) |
| Modelo base | princeton-nlp/Sheared-LLaMA-1.3B |
| Estrategia de ajuste | Fine-tuning con LoRA (`strategy-ft`, `lora`) |
| Acceso | Restringido (gated): requiere aceptar condiciones en HuggingFace |
| Tamano del repositorio | 0,0 GB |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

El adaptador se monta sobre Sheared-LLaMA-1.3B, un transformer decoder-only con la estructura habitual de la familia LLaMA (RMSNorm en la entrada de cada bloque, activación SwiGLU, embeddings rotatorios posicionales y atención causal multi-cabeza). El modelo base se obtiene mediante poda estructurada de LLaMA-2-7B seguida de preentrenamiento de continuación, una técnica descrita en el trabajo *Sheared LLaMA* del grupo de Princeton NLP; esa información proviene de la documentación pública del modelo base y no está replicada en la ficha del adaptador.

Sobre el proceso de ajuste del adaptador no hay información publicada: se desconocen el rango y alpha de LoRA, las capas objetivo, el número de pasos, la composición exacta del dataset `fiven`, si hubo etapas de alineación (RLHF/DPO) o qué criterios de selección de checkpoint se aplicaron. La etiqueta `or2` y la referencia a `benchmark-slm` apuntan a un contexto de evaluación comparativa, pero no permiten reconstruir la receta de entrenamiento. Tampoco se documenta ninguna innovación técnica adicional (decodificación especulativa, atención lineal, decodificación restringida, etc.).

## Capacidades

- Generación de texto autoregresiva en italiano, condicionada por el ajuste fino del adaptador.
- Hereda del modelo base la capacidad de continuar texto, responder preguntas y resumir, aunque el alcance real tras el ajuste no está documentado.
- Soporte de tool calling / function calling: no disponible (no declarado ni verificado).
- Soporte de agentes y razonamiento multi-paso: no disponible (no declarado ni verificado).
- Capacidades multilingües: limitadas al italiano según la etiqueta `language: it`; el modelo base tiene vocabulario multilingüe, pero no se garantiza comportamiento fuera del italiano.
- Capacidades especiales (modo thinking, visión, audio): no disponibles.
- Uso previsto probable: evaluación comparativa de SLM y experimentación con adaptadores LoRA.

## Casos de uso

- Evaluación comparativa de modelos pequenos: el adaptador puede emplearse como uno de los participantes de un benchmark interno de SLM en italiano, comparando su salida frente a otros ajustes del mismo modelo base bajo las mismas condiciones de decodificación.
- Investigación sobre ajuste fino eficiente: sirve como ejemplo reproducible de fine-tuning con LoRA sobre una base de 1,3 B, útil para estudiar el efecto del adaptador frente al modelo base sin adaptar.
- Prototipado en italiano con recursos mínimos: al partir de una base de 1,3 B, permite levantar un servicio de generación de texto en una única GPU de consumo para pruebas de concepto, asumiendo que la calidad no está validada.
- Generación de texto asistida en dominios acotados: si el dataset `fiven` cubre un dominio específico, el adaptador podría emplearse para redactar o completar textos de ese dominio en italiano, previa validación manual de las salidas.
- Despliegue en el borde (edge): el tamaño del modelo base hace viable ejecutarlo en CPU o en GPUs integradas mediante llama.cpp tras fusionar el adaptador, para tareas de autocompletado o clasificación indirecta por generación.
- Reproducción de experimentos académicos: permite replicar la metodología de evaluación de un pipeline `benchmark-slm` con un checkpoint concreto y verificar la estabilidad de las métricas frente al modelo base.
- Base para nuevos adaptadores: al ser un adaptador LoRA, puede combinarse o sustituirse por otros adaptadores sobre el mismo modelo base para experimentar con composición de adaptadores.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: en torno a 4-6 GB en fp16/bf16 incluyendo pesos del modelo base (aproximadamente 2,6 GB), caché KV a 4096 tokens y sobrecarga del runtime; en cuantizacion de 8 bits, alrededor de 2-3 GB; en 4 bits, alrededor de 1,5-2 GB. Cifras estimadas a partir del tamano del modelo base, no medidas sobre este adaptador.
- GPU recomendadas: RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070/4080/4090 para mayor throughput; A100 o H100 solo si se busca alto paralelismo, ya que el modelo es muy pequeno para aprovechar su ancho de banda.
- Cabe en GPU de consumo: sí, en practicamente cualquier GPU dedicada con 6 GB o más; también en CPU con llama.cpp u Ollama tras fusionar el adaptador en el modelo base y convertir a GGUF.
- Opciones de despliegue: `transformers` + `peft` (carga directa del adaptador), vLLM (soporte de adaptadores LoRA), TGI (soporte de adaptadores), llama.cpp y Ollama (requieren fusionar el adaptador con `merge_and_unload` y convertir el resultado).
- Latencia y throughput estimados: no disponibles; no se han publicado mediciones para este checkpoint.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| praiselab-picuslab/benchmark-slm-fiven-sheared-llama-ft | 1,3 B (base) + LoRA | 4096 (base) | No disponible | Gated, 0 descargas |
| princeton-nlp/Sheared-LLaMA-1.3B | 1,3 B | 4096 | Consultar ficha del modelo base (no verificada aqui) | Publico |
| TinyLlama-1.1B-Chat | 1,1 B | 2048 | Apache-2.0 | Publico |
| Qwen2.5-1.5B-Instruct | 1,54 B | 32768 | Apache-2.0 | Publico |
| Llama-3.2-1B-Instruct | 1,24 B | 131072 | Licencia comunitaria Llama 3.2 | Gated |

Los datos de los modelos alternativos provienen de su documentacion publica y no se han verificado en esta ficha. La comparacion de rendimiento no es posible: no hay métricas publicadas para el adaptador.

## Limitaciones y advertencias

- Ausencia total de documentacion: no hay tarjeta de modelo con receta de entrenamiento, hiperparametros, datos ni evaluación, lo que impide reproducir el resultado.
- Licencia no disponible: no puede asumirse uso comercial. Además, la licencia del modelo base (Sheared-LLaMA, derivado de LLaMA-2) impone sus propias condiciones que hay que verificar en la ficha de `princeton-nlp/Sheared-LLaMA-1.3B`.
- Acceso restringido (gated) y repositorio de 0,0 GB: es posible que los pesos del adaptador no estén realmente publicados o que el repositorio esté vacio; conviene comprobarlo antes de planificar cualquier uso.
- Cobertura lingüística limitada al italiano: no hay evidencia de comportamiento adecuado en castellano u otros idiomas.
- Ventana de contexto de 4096 tokens en el modelo base: insuficiente para casos de uso con documentos largos o conversaciones multi-turno extensas.
- Riesgo de alucinacion: inherente a un modelo de 1,3 B sin etapas de alineacion documentadas; la tasa concreta no se ha medido.
- Sesgos: no evaluados. Al heredar el preentrenamiento del modelo base, arrastra los sesgos de su corpus, que tampoco está documentado en esta ficha.
- Idoneidad para produccion muy baja: cero descargas, cero validacion externa y ausencia de métricas hacen desaconsejable su uso fuera de experimentacion.
- El ajuste fino sobre un dataset no descrito (`fiven`) puede haber degradado capacidades generales del modelo base; no hay evaluación que lo descarte.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/praiselab-picuslab/benchmark-slm-fiven-sheared-llama-ft
- Modelo base: https://huggingface.co/princeton-nlp/Sheared-LLaMA-1.3B
- Repositorio del metodo de poda (Sheared LLaMA): https://github.com/princeton-nlp/LLM-Shearing
- Articulo *Sheared LLaMA: Accelerating Language Model Pre-training via Structured Pruning*: https://arxiv.org/abs/2310.06694
- No se han encontrado otros enlaces (papers, blogs, demos) en la informacion disponible.
