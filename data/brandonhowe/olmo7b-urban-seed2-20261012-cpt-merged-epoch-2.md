# BrandonHowe/Olmo7b-urban-seed2-20261012-CPT-merged-epoch-2

## Resumen

Olmo7b-urban-seed2-20261012-CPT-merged-epoch-2 es un checkpoint de preentrenamiento continuado (continued pretraining, CPT) publicado por el usuario independiente BrandonHowe sobre el modelo base allenai/Olmo-3-1025-7B. Se trata de un modelo decoder-only de 7.298.011.136 parametros (aproximadamente 7,3 mil millones) cuyos pesos se han fusionado y exportado en BF16, sin adaptadores, en ocho shards de safetensors. El repositorio ocupa 14,6 GB y esta etiquetado como compatible con endpoints de inferencia.

El modelo corresponde al epoch 2.0, step 756, de un entrenamiento de preentrenamiento continuado sobre el dataset CompassioninMachineLearning/urban_12738_cleaned, fijado en la revision ef7c0e742df63ea319e35d02d9f6ba63d6e7c68d. El autor documenta 10.072 documentos distintos mas 2.000 exposiciones repetidas por epoch, y 200 documentos de validacion disjuntos. La fusion se realizo con la utilidad nativa de Unsloth mediante save_pretrained_merged(save_method="merged_16bit"), y los pesos se validaron como BF16 y se empaquetaron sin perdida.

Su relevancia es acotada y de caracter experimental: no es un modelo de proposito general afinado para instrucciones, sino una variante de investigacion para estudiar el efecto del preentrenamiento continuado sobre un corpus especifico. El propio autor advierte en la model card que el entrenamiento no demuestra una mejora en compasion y que ese extremo debe evaluarse por separado. No se han publicado benchmarks ni se especifican licencia ni idiomas en la informacion disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (heredada de allenai/Olmo-3-1025-7B); detalles especificos no disponibles |
| Parametros totales | 7.298.011.136 (aproximadamente 7,3 B) |
| Parametros activos | No aplicable (no es un modelo MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada |
| Tipos de cuantizacion | Pesos distribuidos en BF16; no se incluyen cuantizaciones GGUF, AWQ ni GPTQ en el repositorio |
| Idiomas soportados | No disponible |
| Licencia | No disponible (no especificada en el repositorio) |
| Formato de pesos | safetensors, BF16, ocho shards, fusionados con Unsloth merged_16bit |

## Arquitectura y entrenamiento

La arquitectura no se describe de forma explicita en la informacion disponible mas alla de la herencia del modelo base allenai/Olmo-3-1025-7B y de la etiqueta olmo3. Se trata, por tanto, de un transformer decoder-only de aproximadamente 7,3 B de parametros en precision BF16, sin componentes de mezcla de expertos ni adaptadores LoRA en la distribucion final: los pesos de la adaptacion se han fusionado en el checkpoint, de modo que el modelo se carga directamente con transformers sin necesidad de aplicar ningun adaptador.

El entrenamiento consistio en un preentrenamiento continuado sobre el dataset CompassioninMachineLearning/urban_12738_cleaned, en la revision ef7c0e742df63ea319e35d02d9f6ba63d6e7c68d. El autor indica 10.072 documentos distintos, 2.000 exposiciones repetidas por epoch y 200 documentos de validacion disjuntos, y publica este checkpoint como el resultado del epoch 2.0, step 756. No se dispone de informacion sobre el numero total de tokens procesados, la composicion detallada del corpus, ni sobre si se aplicaron etapas de RLHF o DPO; por el tipo de pipeline (CPT sobre un corpus concreto) lo habitual es que no las haya, pero no se confirma en la informacion proporcionada. El repositorio incluye un archivo run_manifest.json que, segun la model card, documenta la revision base, los hashes de seleccion de documentos, los parametros de entrenamiento y la validacion de la exportacion.

## Capacidades

- Generacion de texto autoregresiva en ingles (idioma inferido del modelo base; no confirmado en la informacion disponible).
- Capacidad de continuacion y modelado de lenguaje sobre texto, heredada del modelo base Olmo-3-1025-7B.
- Especializacion potencial sobre el dominio del corpus urban_12738_cleaned, aunque el autor no aporta evaluacion que demuestre mejora alguna en ese dominio ni en compasion.
- Carga directa con la libreria transformers y con endpoints compatibles (etiqueta endpoints_compatible).
- No se documenta soporte de tool calling, function calling, uso agentico ni razonamiento multi-paso para este checkpoint.
- No se documenta modo thinking, vision, audio ni capacidades multimodales.
- No se documenta soporte multilingue explicito; los idiomas soportados figuran como no disponibles.
- El modelo no parece haber pasado por un ajuste por instrucciones, por lo que la formulacion de peticiones conversacionales puede requerir tecnicas de prompting especificas.

## Casos de uso

- Investigacion sobre preentrenamiento continuado: el checkpoint permite reproducir y analizar el efecto de dos epochs de CPT sobre un corpus concreto, comparandolo con el modelo base allenai/Olmo-3-1025-7B y con los demas checkpoints de la misma familia publicados por el autor.
- Punto de partida para ajuste supervisado (SFT): al ser un modelo base fusionado en BF16, puede emplearse como inicializacion para fine-tuning posterior con LoRA o ajuste completo en tareas especificas de dominio urbano.
- Generacion de texto de dominio urbano: continuacion de documentos, descripciones o narrativas relacionadas con el corpus de entrenamiento, siempre que se valide la calidad de forma empirica antes de usarlo en produccion.
- Evaluacion de sesgos y de deriva de dominio: util como sujeto de prueba en estudios que midan como un CPT sobre un corpus pequeno y especializado altera las distribuciones de salida respecto al modelo base.
- Estudio de metodologias de fusion de pesos: el repositorio documenta el uso de save_pretrained_merged de Unsloth en modo merged_16bit, lo que lo convierte en un caso practico para verificar que la fusion de adaptadores conserva la precision BF16.
- Base para experimentos de compasion y alineacion: la model card sugiere explicitamente que la mejora en compasion debe evaluarse aparte, de modo que el modelo sirve como material de partida en protocolos de evaluacion de comportamiento prosocial, no como solucion validada.
- Reproduccion de pipelines de entrenamiento: los hashes de seleccion de documentos y el manifiesto de ejecucion permiten reproducir el experimento en entornos de investigacion con acceso al dataset original.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye cifras de MMLU, HumanEval, GSM8K ni de ninguna otra evaluacion, y advierte de forma explicita que el entrenamiento no establece por si mismo una mejora en compasion. Cualquier comparacion de rendimiento con el modelo base requeriria una evaluacion propia.

## Requisitos de hardware

- VRAM estimada en BF16 para inferencia: en torno a 15-17 GB solo para los pesos (14,6 GB de safetensors), mas la memoria de la cache KV, que depende de la longitud de contexto no especificada.
- VRAM estimada en cuantizacion de 8 bits: aproximadamente 8-9 GB.
- VRAM estimada en cuantizacion de 4 bits: aproximadamente 4,5-5,5 GB (requiere convertir los pesos, ya que el repositorio no incluye GGUF ni formatos cuantizados).
- GPU profesionales recomendadas: A100 40 GB, A100 80 GB, H100, L40S. Cabe holgadamente en cualquiera de ellas en BF16.
- GPU de consumo: cabe en BF16 en RTX 4090 (24 GB), RTX 3090 (24 GB) y RTX 4080 (16 GB) con contexto corto. En tarjetas de 12 GB o menos es necesario cuantizar a 8 o 4 bits.
- Opciones de despliegue: transformers de forma nativa; vLLM y TGI para servicio en BF16; llama.cpp u Ollama tras convertir los pesos a GGUF, conversion que no se distribuye en el repositorio.
- Latencia y throughput estimados: no disponibles. No hay mediciones publicadas en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| BrandonHowe/Olmo7b-urban-seed2-20261012-CPT-merged-epoch-2 | 7,3 B | No disponible | No disponible | Repositorio HF, 0 descargas, 0 likes | Checkpoint CPT sobre urban_12738_cleaned, epoch 2.0 |
| allenai/Olmo-3-1025-7B | No disponible en la informacion proporcionada | No disponible | No disponible | Modelo base publico en HF | Modelo base sin preentrenamiento continuado |
| BrandonHowe/Olmo7b-urban-olmo-20260920-full-CPT-merged-epoch-2 | No disponible | No disponible | No disponible | Repositorio HF | Variante CPT de la misma familia, corpus completo |
| BrandonHowe/Olmo7b-compassion-seed2-20261001-CPT-merged-epoch-2 | No disponible | No disponible | No disponible | Repositorio HF | Variante CPT orientada a compasion |

No se dispone de datos de rendimiento comparativos entre estas variantes. La comparativa se limita a parametros conocidos del modelo descrito y a la existencia de los repositorios enlazados.

## Limitaciones y advertencias

- Rendimiento no validado: no hay benchmarks publicados, por lo que no puede afirmarse ninguna mejora sobre el modelo base en ninguna tarea.
- Advertencia explicita del autor: la model card indica que el entrenamiento no establece una mejora en compasion y que ese extremo debe evaluarse por separado.
- Licencia no disponible: el repositorio no especifica licencia, lo que impide determinar las condiciones de uso comercial. Debe consultarse la licencia del modelo base allenai/Olmo-3-1025-7B por separado antes de cualquier uso en produccion.
- Idiomas no especificados: no se documenta que idiomas soporta el modelo, por lo que el soporte del castellano no puede darse por supuesto.
- Longitud de contexto no documentada: se desconoce la ventana maxima efectiva tras el CPT.
- Riesgo de alucinacion: al tratarse de un checkpoint de preentrenamiento continuado sin ajuste por instrucciones, la generacion puede derivar hacia continuaciones plausibles pero incorrectas, especialmente fuera del dominio del corpus.
- Sesgos: el corpus de entrenamiento (urban_12738_cleaned) puede introducir sesgos de dominio, geograficos o culturales que no han sido auditados.
- Sobreajuste potencial al corpus: con 10.072 documentos y 2.000 exposiciones repetidas por epoch durante dos epochs, existe riesgo de sobreajuste y de degradacion de capacidades generales.
- Sin cuantizaciones listas para usar: desplegar en hardware limitado requiere generar GGUF, AWQ o GPTQ de forma externa, con el consiguiente coste y riesgo de perdida de calidad.
- Trazabilidad: el autor remite a run_manifest.json para la revision base y los hashes de seleccion de documentos; conviene verificar ese archivo antes de reproducir cualquier resultado.
- Repositorio con 0 descargas y 0 likes: no hay evidencia de uso comunitario ni de validacion externa.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/BrandonHowe/Olmo7b-urban-seed2-20261012-CPT-merged-epoch-2
- Modelo base: https://huggingface.co/allenai/Olmo-3-1025-7B
- Dataset de entrenamiento: https://huggingface.co/datasets/CompassioninMachineLearning/urban_12738_cleaned
- Variante relacionada (urban, corpus completo, epoch 2): https://huggingface.co/BrandonHowe/Olmo7b-urban-olmo-20260920-full-CPT-merged-epoch-2
- Variante relacionada (compassion, seed2, epoch 2): https://huggingface.co/BrandonHowe/Olmo7b-compassion-seed2-20261001-CPT-merged-epoch-2
- Variante relacionada (compassion, seed2, checkpoint final): https://huggingface.co/BrandonHowe/Olmo7b-compassion-seed2-20261001-CPT-final
