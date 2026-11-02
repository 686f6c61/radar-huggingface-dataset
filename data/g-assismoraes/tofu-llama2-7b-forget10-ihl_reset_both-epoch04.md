# g-assismoraes/tofu-llama2-7b-forget10-ihl_reset_both-epoch04

## Resumen

El modelo `tofu-llama2-7b-forget10-ihl_reset_both-epoch04` es un checkpoint de investigacion derivado de Llama 2 7B, desarrollado por el usuario g-assismoraes, que aplica una tecnica de desaprendizaje (machine unlearning) sobre el modelo ajustado `locuslab/tofu_ft_llama2-7b`. El objetivo es eliminar selectivamente el conocimiento de un subconjunto de autores del dataset TOFU (el split `forget10`, es decir, un 10 % de los autores ficticios) manteniendo el rendimiento sobre el resto (`retain`). Se trata de un artefacto experimental, no de un modelo de proposito general.

La arquitectura subyacente es la de Llama 2 7B: un transformer decoder-only denso con 6.738.415.616 parametros, contexto nativo de 4096 tokens y tokenizador SentencePiece. Sobre esa base, el autor reinicializa los embeddings de entrada y la cabeza de lenguaje desde `NousResearch/Llama-2-7b-chat-hf`, conserva el resto de pesos de `locuslab/tofu_ft_llama2-7b` y aplica un entrenamiento con una perdida combinada: token IHL (unlearning) sobre el conjunto `forget` y entropia cruzada con peso 1.0 sobre el conjunto `retain`. El checkpoint corresponde a la epoca 4 de 20.

Su relevancia es acotada y metodologica: sirve para estudiar el equilibrio entre olvido efectivo y preservacion de utilidad en tareas de unlearning, y para reproducir experimentos sobre TOFU. No esta pensado para despliegue en produccion ni para uso conversacional general, y su model card es minima (unicamente una descripcion de la receta de inicializacion y de la perdida).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Llama 2), denso |
| Parametros totales | 6.738.415.616 |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | 4096 tokens (heredada de Llama 2; no se especifica en la model card) |
| Tipos de cuantizacion | no disponible (el repo solo contiene safetensors en precision original) |
| Idiomas soportados | en (ingles) |
| Licencia | llama2 (Llama 2 Community License) |
| Formato de pesos | safetensors (repo de 13.5 GB) |

## Arquitectura y entrenamiento

El modelo parte de `locuslab/tofu_ft_llama2-7b`, un Llama 2 7B ajustado sobre el dataset TOFU (fictional authors, tarea de unlearning). La receta aplicada en este checkpoint, segun la model card, consiste en reinicializar los embeddings de entrada y la cabeza de LM desde `NousResearch/Llama-2-7b-chat-hf`, conservando el resto de pesos del transformer del modelo base. Sobre esa inicializacion se entrena con una perdida compuesta: un termino IHL (unlearning) aplicado sobre el split `forget` de TOFU y una entropia cruzada con coeficiente 1.0 sobre el split `retain`. El checkpoint publicado corresponde a la epoca 4 de un total de 20.

No se detallan en la informacion disponible el numero de tokens de entrenamiento, la composicion exacta del dataset mas alla de los splits forget/retain de TOFU, ni si se emplearon tecnicas adicionales como RLHF o DPO. Tampoco se especifican hiperparametros (learning rate, batch size, warmup) ni la definicion formal del termino IHL. El autor referencia un fichero `ihl_manifest.json` en el repositorio, que presumiblemente contiene metadatos del experimento, pero su contenido no se ha proporcionado.

## Capacidades

- Generacion de texto en ingles, heredada de Llama 2 7B chat.
- Razonamiento basico y respuesta a instrucciones, condicionados por el ajuste sobre TOFU y por el proceso de unlearning.
- Capacidad reducida (por diseno) para recordar informacion sobre los autores del split `forget10` de TOFU.
- No se documenta soporte de tool calling ni function calling en la informacion disponible.
- No se documenta soporte de agentes ni de razonamiento multi-paso.
- Multilingue: solo ingles declarado; el resto de idiomas de Llama 2 no se garantiza tras el ajuste y el unlearning.
- No dispone de vision, audio ni modo "thinking".

## Casos de uso

- Investigacion en machine unlearning: reproduccion de experimentos sobre TOFU para medir la eficacia del olvido en el split `forget10` frente a la retencion en `retain`.
- Evaluacion comparativa de recetas de unlearning: uso como punto de comparacion frente a otros checkpoints de la misma familia (distintas epocas, coeficientes o inicializaciones).
- Analisis de olvido selectivo de entidades: estudio de cuanto conocimiento factual sobre autores ficticios se elimina y cuanto se preserva, mediante sondas de QA sobre TOFU.
- Auditoria de robustez del olvido: comprobacion de si el conocimiento "olvidado" puede recuperarse mediante prompting adversarial o fine-tuning ligero.
- Docencia y formacion: ejemplo practico de inicializacion parcial de pesos y de perdidas combinadas en un pipeline de unlearning.
- Estudio de degradacion de utilidad: medicion del impacto del termino IHL sobre la perplejidad y la calidad de generacion en dominios ajenos a TOFU.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16/bf16: aproximadamente 13,5 GB solo para pesos, mas overhead de activaciones y cache KV (dependiente de la longitud de contexto).
- VRAM estimada en cuantizacion 8 bits: en torno a 7-8 GB; en 4 bits: en torno a 4-5 GB (estimaciones teoricas; no se han publicado mediciones para este checkpoint).
- GPU recomendadas para fp16: A100 40/80 GB, H100, L40S, o GPUs consumer con 16 GB o mas (RTX 4080, RTX 4090) para contextos moderados.
- Cabe en GPU consumer: si, en RTX 3090/4090 (24 GB) en fp16 con contexto limitado, y en GPUs de 8-12 GB si se cuantiza.
- Opciones de despliegue: transformers (carga directa de safetensors), vLLM, TGI, llama.cpp u Ollama previa conversion a GGUF (no se proporcionan ficheros GGUF en el repo).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Proposito | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| tofu-llama2-7b-forget10-ihl_reset_both-epoch04 | 6,74 B | 4096 (heredado) | Unlearning experimental sobre TOFU | llama2 | HuggingFace (0 descargas) |
| locuslab/tofu_ft_llama2-7b | ~6,74 B | 4096 (heredado) | Modelo base ajustado en TOFU | llama2 | HuggingFace (modelo base) |
| NousResearch/Llama-2-7b-chat-hf | ~6,74 B | 4096 | Chat de proposito general | llama2 | HuggingFace |
| meta-llama/Llama-2-7b-chat-hf | ~6,74 B | 4096 | Chat de proposito general | llama2 | HuggingFace |

No se dispone de datos de rendimiento comparativo entre estos modelos en la informacion proporcionada.

## Limitaciones y advertencias

- Modelo de investigacion: no ha sido validado para uso en produccion ni para tareas conversacionales generales.
- El proceso de unlearning puede degradar capacidades generales (perplejidad, coherencia, calidad de respuesta) de forma no cuantificada en la informacion disponible.
- Riesgo de alucinacion: inherente a Llama 2 7B y potencialmente agravado por el ajuste y el olvido selectivo.
- Sesgos: no se documenta ninguna evaluacion de sesgos; hereda los de Llama 2 y los del dataset TOFU.
- Idioma: solo se declara ingles; el comportamiento en castellano no esta garantizado.
- Licencia Llama 2 Community License: impone restricciones de uso comercial (umbral de 700 millones de usuarios mensuales, obligaciones de atribucion y clausulas de uso aceptable). Revisar el texto completo antes de cualquier uso.
- El checkpoint corresponde a la epoca 4 de 20; no se aportan metricas que indiquen si es el punto optimo del entrenamiento.
- Sin pipeline declarado, 0 descargas y 0 likes: no hay evidencia de uso ni validacion por parte de la comunidad.
- El contenido de `ihl_manifest.json` no se ha facilitado; la receta exacta (coeficientes, definicion de IHL, datos) no es verificable a partir de la informacion disponible.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/g-assismoraes/tofu-llama2-7b-forget10-ihl_reset_both-epoch04
- Modelo base: https://huggingface.co/locuslab/tofu_ft_llama2-7b
- Modelo de inicializacion de embeddings y LM head: https://huggingface.co/NousResearch/Llama-2-7b-chat-hf
- Llama 2 (Meta): https://huggingface.co/meta-llama/Llama-2-7b-chat-hf
- Dataset TOFU (referencia del benchmark): no disponible en la informacion proporcionada
- Paper de TOFU: no disponible en la informacion proporcionada
- Repositorio de codigo del experimento: no disponible en la informacion proporcionada
