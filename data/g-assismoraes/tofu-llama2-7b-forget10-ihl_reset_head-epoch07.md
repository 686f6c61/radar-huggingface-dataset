# g-assismoraes/tofu-llama2-7b-forget10-ihl_reset_head-epoch07

## Resumen

`g-assismoraes/tofu-llama2-7b-forget10-ihl_reset_head-epoch07` es un checkpoint de investigacion derivado de Llama 2 7B, publicado por el usuario g-assismoraes en Hugging Face. No se trata de un modelo de proposito general, sino de un artefacto experimental dentro del marco TOFU (Task of Fictitious Unlearning), un benchmark academico para evaluar tecnicas de *machine unlearning*: el proceso de eliminar selectivamente el conocimiento de un conjunto de datos de entrenamiento sin reentrenar el modelo desde cero.

El modelo parte de `locuslab/tofu_ft_llama2-7b`, un Llama 2 7B ajustado sobre el dataset TOFU, y aplica una intervencion concreta: reinicializa los embeddings de entrada y la cabeza LM desde `NousResearch/Llama-2-7b-chat-hf`, mientras conserva el resto de pesos del modelo ajustado. El entrenamiento combina una perdida de tipo IHL sobre el conjunto "forget" (los datos que se pretende olvidar) con entropia cruzada sobre el conjunto "retain" (los datos que deben preservarse). El checkpoint corresponde a la epoca 7 de 20.

Su relevancia es estrictamente metodologica: sirve para estudiar hasta que punto reinicializar capas especificas combinado con entrenamiento selectivo logra borrar informacion factual concreta manteniendo el rendimiento general. No esta pensado para despliegue en produccion ni para uso conversacional.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Llama 2) |
| Parametros totales | 6.738.415.616 (~6,74 mil millones) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (arquitectura Llama 2: 4.096 tokens, no confirmado en la model card) |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors) |
| Idiomas soportados | en (ingles) |
| Licencia | llama2 (Llama 2 Community License) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Llama 2 7B: un transformer decoder-only con atencion multi-cabeza, normalizacion RMSNorm y activacion SwiGLU. El checkpoint no modifica la topologia, solo los pesos. La intervencion clave es la reinicializacion de los *input embeddings* y la *LM head* a partir del modelo `NousResearch/Llama-2-7b-chat-hf`, manteniendo el resto de pesos del modelo ajustado sobre TOFU (`locuslab/tofu_ft_llama2-7b`).

El entrenamiento usa una funcion de perdida compuesta: un termino IHL (probablemente *Inverted Hinge Loss* o una variante de perdida de olvido definida en el manifiesto `ihl_manifest.json`) sobre el conjunto forget, ponderado con un factor de 1.0 sobre la entropia cruzada del conjunto retain. El objetivo es maximizar la perdida sobre forget mientras se minimiza sobre retain. El checkpoint documentado corresponde a la epoca 7 de un total de 20. No se especifican en la informacion disponible el numero de tokens de entrenamiento, la composicion exacta del dataset TOFU ni si se empleo RLHF o DPO (no aplica en este contexto de unlearning).

## Capacidades

- Generacion de texto en ingles, heredada del modelo base Llama 2 7B.
- Razonamiento basico y respuesta a preguntas, condicionados por el ajuste sobre TOFU.
- El modelo ha sido entrenado para *olvidar* un subconjunto especifico de datos (forget10), por lo que su comportamiento sobre esos temas debe ser degradado o distorsionado de forma deliberada.
- No se documentan capacidades de tool calling, function calling, agentes, vision ni audio.
- No se documenta modo *thinking* ni capacidades multilingues mas alla del ingles.
- Capacidad principal: servir como artefacto de evaluacion de tecnicas de unlearning.

## Casos de uso

- Investigacion en machine unlearning: el checkpoint permite medir la eficacia del metodo IHL + reset de cabeza comparando la perdida en forget frente a retain a lo largo de las epocas.
- Reproducibilidad de experimentos TOFU: sirve como punto de comparacion frente a otros checkpoints de la misma familia (otras epocas, otras variantes de reset).
- Estudio de la relacion entre reinicializacion de capas y retencion de conocimiento: al haber reinicializado embeddings y LM head, permite analizar cuanto conocimiento factual reside en esas capas frente al resto del transformer.
- Evaluacion de *membership inference attacks*: util para comprobar si un atacante puede detectar que datos fueron olvidados.
- Benchmarking de metricas de olvido: permite validar implementaciones de metricas como *forget quality*, *retain quality* o *extraction strength*.
- Docencia y formacion: ejemplo practico de como se construye un checkpoint de unlearning y que artefactos acompanan al proceso (manifiesto, modelo base, configuracion de perdida).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16: aproximadamente 13,5 GB (coincide con el tamano del repo), por lo que requiere GPU con al menos 16 GB.
- En cuantizacion de 8 bits: ~7 GB de VRAM; en 4 bits: ~4 GB.
- GPU recomendadas: A100 40 GB, H100, L40S para fp16 sin problemas; RTX 4090 (24 GB) y RTX 3090 (24 GB) tambien suficientes en fp16.
- Cabe en GPU de consumo: si, en RTX 4090/3090 en fp16; en RTX 4070 Ti/4080 (16 GB) en 8 bits; en GPUs de 8 GB solo con cuantizacion de 4 bits.
- Opciones de despliegue: vLLM, TGI, llama.cpp (previa conversion a GGUF), Ollama (previa conversion), transformers con `device_map="auto"`.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Proposito |
|---|---|---|---|---|
| Este checkpoint (tofu-llama2-7b-forget10-ihl_reset_head-epoch07) | 6,74 B | no disponible | llama2 | Unlearning experimental (epoca 7/20) |
| locuslab/tofu_ft_llama2-7b | 6,74 B | no disponible | llama2 | Modelo base ajustado sobre TOFU, sin unlearning |
| NousResearch/Llama-2-7b-chat-hf | 6,74 B | 4.096 tokens | llama2 | Chat de proposito general |
| meta-llama/Llama-2-7b-hf | 6,74 B | 4.096 tokens | llama2 | Modelo base original |

La comparacion relevante es frente al modelo base `locuslab/tofu_ft_llama2-7b`: este checkpoint deberia mostrar mayor perdida en forget y similar en retain, segun el objetivo del metodo. No se dispone de datos cuantitativos de rendimiento para confirmarlo.

## Limitaciones y advertencias

- Modelo de investigacion: no esta disenado ni validado para uso en produccion, atencion al cliente ni generacion de contenido general.
- El "olvido" es probabilistico: el modelo puede seguir filtrando informacion del conjunto forget en determinados prompts, por lo que no debe tratarse como garantia de eliminacion de datos.
- Sesgos: hereda los sesgos de Llama 2 7B y del dataset TOFU, sin que se documente mitigacion adicional.
- Riesgo de alucinacion: alto en un modelo ajustado sobre un dataset sintetico y posteriormente intervenido con una perdida de olvido.
- Idioma: solo ingles; no se documenta soporte multilingue.
- Licencia llama2: uso comercial sujeto a la Llama 2 Community License, con restricciones de escala (100 millones de usuarios mensuales) y obligaciones de atribucion. Verificar compatibilidad antes de cualquier uso derivado.
- El checkpoint corresponde a la epoca 7 de 20: no es el estado final del entrenamiento, por lo que su comportamiento puede diferir del checkpoint final del mismo experimento.
- No se documentan datos de evaluacion ni metricas de olvido en la model card; el manifiesto `ihl_manifest.json` referenciado no esta incluido en la informacion disponible.
- El numero de descargas y likes es cero, lo que sugiere que es un artefacto reciente y sin validacion por parte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/g-assismoraes/tofu-llama2-7b-forget10-ihl_reset_head-epoch07
- Modelo base: https://huggingface.co/locuslab/tofu_ft_llama2-7b
- Modelo de origen de embeddings y LM head: https://huggingface.co/NousResearch/Llama-2-7b-chat-hf
- Modelo original Llama 2 7B: https://huggingface.co/meta-llama/Llama-2-7b-hf
- Paper TOFU (referencia del benchmark, no enlazado en la model card): no disponible en la informacion proporcionada
- Repositorio del metodo IHL: no disponible en la informacion proporcionada
- Manifiesto `ihl_manifest.json`: referenciado en la model card pero no enlazado en la informacion disponible
