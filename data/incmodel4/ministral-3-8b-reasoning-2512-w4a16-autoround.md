# INCModel4/Ministral-3-8B-Reasoning-2512-W4A16-AutoRound

## Resumen

Este repositorio contiene una version cuantizada a 4 bits del modelo Mistral Ministral-3-8B-Reasoning-2512, publicada por el usuario INCModel4. No se trata de un modelo entrenado desde cero, sino de una conversion W4A16 (pesos de 4 bits, activaciones de 16 bits) generada con la herramienta AutoRound de Intel, aplicando 200 iteraciones de ajuste sobre el modelo original de Mistral AI. La cuantizacion afecta a las capas de atencion y MLP, mientras que embeddings, lm_head, el torre de vision y el proyector multimodal se mantienen en BF16.

La relevancia de esta ficha es doble: por un lado, permite ejecutar un modelo multimodal de razonamiento de la familia Ministral con un coste de memoria notablemente inferior al BF16 original; por otro, sirve como referencia practica de como AutoRound degrada (o no) el rendimiento en tareas de razonamiento, matematicas y conocimiento general. Segun los datos del autor, la recuperacion media respecto al modelo en BF16 es del 99,47%, con GSM8K practicamente intacto.

El pipeline declarado es image-text-to-text, lo que confirma que el modelo conserva la capacidad multimodal del original, aunque la model card no detalla idiomas soportados ni la longitud de contexto. El repositorio tiene 10,7 GB y, en el momento de la consulta, cero descargas y cero likes, lo que sugiere una publicacion muy reciente o de escasa difusion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (mistral3), con torre de vision y proyector multimodal; pesos de atencion y MLP cuantizados a 4 bits |
| Parametros totales | 2.950.137.856 (segun safetensors del repo cuantizado; el modelo base se denomina 8B) |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | W4A16, group_size 128, simetrica, 200 iteraciones de tuning con AutoRound; embeddings, lm_head, vision tower y multi-modal projector en BF16 |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (libreria transformers; compatible con vLLM 0.32.0) |

## Arquitectura y entrenamiento

El modelo base es un transformer de la familia Mistral (tag mistral3) con capacidad multimodal image-text-to-text. Esta version concreta no ha sido reentrenada: se ha obtenido mediante cuantizacion post-entrenamiento con AutoRound, que optimiza el redondeo de pesos mediante descenso de gradiente con signo en lugar de usar redondeo simple. La configuracion aplicada es W4A16 con grupo de 128 y simetria, 200 iteraciones y 128 muestras de calibracion, con seqlen 2048 y batch size 8.

Las capas ignoradas durante la cuantizacion son vision_tower, multi_modal_projector y lm_head, que permanecen en BF16 para preservar la calidad de la entrada visual y de la proyeccion a vocabulario. No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset ni si el modelo base uso RLHF o DPO; la model card solo indica que se trata de un modelo de razonamiento y remite a la licencia del modelo original.

## Capacidades

- Generacion de texto conversacional en formato chat, segun el tag conversational.
- Razonamiento multi-paso, dado que el modelo base se denomina Reasoning.
- Procesamiento de imagen y texto combinados (pipeline image-text-to-text), con torre de vision y proyector multimodal conservados en BF16.
- Razonamiento matematico y resolucion de problemas tipo GSM8K, con rendimiento practicamente identico al BF16 segun la evaluacion del autor.
- Conocimiento general y sentido comun (MMLU, PIQA, HellaSwag) con degradacion inferior al 1,2% respecto a BF16.
- Despliegue compatible con endpoints y con vLLM 0.32.0.
- Soporte de tool calling, agentes o thinking mode: no disponible en la informacion proporcionada.
- Cobertura multilingue: no disponible en la informacion proporcionada.

## Casos de uso

- Asistente multimodal de documentacion tecnica: el modelo puede recibir capturas de pantalla, diagramas o tablas escaneadas junto con una pregunta en texto y devolver una explicacion; la torre de vision en BF16 evita la perdida de calidad que supondria cuantizarla.
- Razonamiento matematico en produccion con presupuesto de VRAM ajustado: al mantener GSM8K en 81,20 frente a 81,12 en BF16, es adecuado para tutores automaticos o validadores de ejercicios donde el coste por GPU es un factor critico.
- Clasificacion y extraccion de informacion a partir de imagenes: con PIQA en 79,00 y HellaSwag en 55,89, puede usarse en pipelines de moderacion o etiquetado de contenido visual con requisitos de latencia moderados.
- Despliegue en infraestructura Intel o con vLLM: la combinacion de AutoRound y vLLM 0.32.0 permite servir el modelo con menor huella de memoria que el BF16, util para entornos con varias instancias por nodo.
- Evaluacion comparativa de tecnicas de cuantizacion: el repositorio incluye la tabla de recuperacion (99,47% de media), lo que lo convierte en un punto de referencia para medir el impacto de W4A16 en modelos de razonamiento.
- Prototipado de agentes conversacionales con entrada visual: el formato chat y la compatibilidad con endpoints permiten integrarlo rapidamente en un backend de pruebas sin reentrenamiento.
- Fine-tuning ligero sobre la version cuantizada: al estar en safetensors y transformers, puede servir de base para experimentos de adaptacion con LoRA, aunque la cuantizacion limita algunas tecnicas de entrenamiento.

## Benchmarks y rendimiento

Datos publicados por el autor en la model card, comparando BF16 con W4A16:

| Benchmark | BF16 | W4A16 | Recuperacion |
|---|---:|---:|---:|
| GSM8K | 81,12 | 81,20 | 100,09% |
| PIQA | 79,27 | 79,00 | 99,66% |
| MMLU | 69,09 | 68,41 | 99,01% |
| HellaSwag | 56,52 | 55,89 | 98,87% |
| Media | 71,50 | 71,12 | 99,47% |

No se han publicado en la informacion disponible resultados de HumanEval, MMLU-Pro, MATH ni benchmarks multimodales (MMMU, DocVQA) para esta version cuantizada.

## Requisitos de hardware

- VRAM estimada: el repositorio ocupa 10,7 GB en disco; en inferencia con vLLM y dtype bfloat16 hay que sumar cache KV y overhead del runtime, por lo que conviene reservar al menos 16-24 GB de VRAM para contextos moderados.
- GPU recomendadas: A100 40/80 GB, H100, L40S o RTX 6000 Ada para produccion; RTX 4090 (24 GB) es viable para una sola instancia con contexto limitado.
- GPU de consumo: cabe en RTX 4090 y, con cuantizacion adicional o contextos cortos, en GPUs de 16 GB; no se garantiza en GPUs de 8 GB por el overhead de vLLM y la parte BF16 del modelo.
- Despliegue: vLLM 0.32.0 es la opcion documentada por el autor (`vllm serve ... --dtype bfloat16`). No se documenta soporte de llama.cpp, Ollama ni TGI en la informacion proporcionada.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Cuantizacion | Notas |
|---|---|---|---|---|---|
| INCModel4/Ministral-3-8B-Reasoning-2512-W4A16-AutoRound | 2.950.137.856 (repo cuantizado) | no disponible | apache-2.0 | W4A16 AutoRound | Version cuantizada del modelo Mistral; recuperacion media 99,47% |
| mistralai/Ministral-3-8B-Reasoning-2512 | no disponible | no disponible | apache-2.0 (segun modelo base) | BF16 | Modelo original sin cuantizar; referencia de calidad |
| Otras cuantizaciones W4A16 de modelos Mistral de 8B | no disponible | no disponible | apache-2.0 | W4A16 (GPTQ/AWQ/AutoRound) | No se dispone de datos comparativos en la informacion proporcionada |

No se dispone de informacion suficiente para comparar con alternativas de otros fabricantes en la misma categoria.

## Limitaciones y advertencias

- La model card advierte explicitamente de que el modelo puede producir salidas factualmente incorrectas y no debe usarse como fuente de informacion veraz sin verificacion.
- Riesgo de sesgos y contenido ofensivo heredado del modelo base y de sus datasets de ajuste; el autor recomienda realizar pruebas de seguridad antes de cualquier despliegue.
- La cuantizacion W4A16 introduce una degradacion medible, aunque pequena, en MMLU (99,01% de recuperacion) y HellaSwag (98,87%); en tareas no evaluadas el impacto es desconocido.
- No se documentan idiomas soportados ni longitud de contexto, lo que impide garantizar un comportamiento multilingue o contextos largos sin validacion previa.
- La licencia apache-2.0 se hereda del modelo base, pero el autor declara que la licencia no constituye asesoramiento legal y recomienda consultar a un abogado antes de uso comercial.
- El repositorio tiene cero descargas y cero likes, y fue creado y actualizado con dos minutos de diferencia; no hay evidencia de validacion independiente de los benchmarks reportados.
- El numero de parametros reportado por safetensors (2.950.137.856) no coincide con la denominacion "8B" del modelo base, lo que sugiere que el recuento corresponde a los tensores efectivamente almacenados tras la cuantizacion; conviene verificar la configuracion antes de dimensionar infraestructura.
- No se documenta soporte para llama.cpp, Ollama o TGI, lo que limita las opciones de despliegue fuera de vLLM.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/INCModel4/Ministral-3-8B-Reasoning-2512-W4A16-AutoRound
- Modelo base: https://huggingface.co/mistralai/Ministral-3-8B-Reasoning-2512
- Repositorio AutoRound: https://github.com/intel/auto-round
- Intel Neural Compressor: https://github.com/intel/neural-compressor
- Paper de AutoRound: https://arxiv.org/abs/2309.05516
