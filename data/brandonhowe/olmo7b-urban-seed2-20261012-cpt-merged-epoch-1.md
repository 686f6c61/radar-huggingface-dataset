# BrandonHowe/Olmo7b-urban-seed2-20261012-CPT-merged-epoch-1

## Resumen

Olmo7b-urban-seed2-20261012-CPT-merged-epoch-1 es un modelo de lenguaje de tipo base (no instruido) publicado por el usuario BrandonHowe en HuggingFace. Se trata de un derivado de allenai/Olmo-3-1025-7B al que se le ha aplicado un proceso de preentrenamiento continuado (continued pretraining, CPT) sobre el corpus `CompassioninMachineLearning/urban_12738_cleaned`, en su revision `ef7c0e742df63ea319e35d02d9f6ba63d6e7c68d`. El resultado se ha fusionado y exportado como pesos BF16 autonomos, sin necesidad de cargar ningun adaptador LoRA.

El modelo cuenta con 7.298.011.136 parametros (aproximadamente 7,3 mil millones) y se distribuye en ocho shards safetensors que ocupan 14,6 GB en total. El entrenamiento registrado es de una sola epoca (epoch 1.0, step 378) sobre 10.072 documentos distintos mas 2.000 exposiciones repetidas por epoca, con 200 documentos de validacion disjuntos. La fusion se realizo con el metodo nativo de Unsloth `save_pretrained_merged(save_method="merged_16bit")`.

Su relevancia es principalmente experimental y de investigacion: es un ejemplo reproducible de pipeline de CPT sobre un modelo abierto de la familia Olmo 3, util para estudiar adaptacion de dominio, sobreajuste y olvido catastrofico en corpus pequenos. El propio autor advierte en la model card que el entrenamiento no demuestra una mejora en compasion y que ese extremo debe evaluarse por separado. El repositorio no declara licencia, idiomas soportados ni resultados de benchmarks, y acumula 0 descargas y 0 likes en el momento de redactar esta ficha.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only, heredada de allenai/Olmo-3-1025-7B (no se detallan variantes MoE, SSM o hibridas en la informacion disponible) |
| Parametros totales | 7.298.011.136 (≈7,3 B) |
| Parametros activos | no aplica (no se indica arquitectura de mezcla de expertos) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el repositorio publica unicamente pesos BF16; no se han publicado GGUF, AWQ ni GPTQ para este modelo) |
| Idiomas soportados | no disponible |
| Licencia | no disponible (el repositorio no declara licencia) |
| Formato de pesos | safetensors BF16, ocho shards, 14,6 GB de repositorio |

## Arquitectura y entrenamiento

La arquitectura subyacente es la del modelo base allenai/Olmo-3-1025-7B, un transformer decoder-only de aproximadamente 7.300 millones de parametros. La informacion proporcionada no incluye detalles sobre la composicion de capas, el mecanismo de atencion ni la estrategia de posiciones del modelo base, por lo que no se pueden confirmar aqui innovaciones concretas como atencion lineal o decodificacion especulativa.

El proceso aplicado es un preentrenamiento continuado sobre el dataset `CompassioninMachineLearning/urban_12738_cleaned`, con 10.072 documentos distintos y 2.000 exposiciones repetidas por epoca, mas 200 documentos de validacion disjuntos. El checkpoint publicado corresponde a la epoca 1.0 (step 378). Los pesos resultantes se fusionaron mediante Unsloth con `save_pretrained_merged(save_method="merged_16bit")` y se empaquetaron sin perdida en ocho safetensors. No se menciona en la informacion disponible el uso de RLHF, DPO u otra fase de alineacion posterior; el modelo debe considerarse un modelo base. El repositorio incluye un `run_manifest.json` con la revision base, los hashes de seleccion de documentos, los hiperparametros de entrenamiento y la validacion de la exportacion.

## Capacidades

- Generacion de texto autoregresiva en estilo de completado, propia de un modelo base sin ajuste por instrucciones.
- Adaptacion de dominio al registro del corpus urbano utilizado en el CPT, sin garantia de mejora medible (el autor indica que la mejora en compasion debe evaluarse aparte).
- Punto de partida para ajuste fino posterior (SFT, LoRA, DPO) sobre tareas especificas.
- Carga directa con la libreria transformers sin adaptadores adicionales, al estar los pesos fusionados.
- Compatibilidad declarada con endpoints (`endpoints_compatible` en los tags del repositorio).
- No se documentan capacidades de tool calling, function calling, razonamiento multi-paso, agentes, vision, audio ni modo de pensamiento explicito.
- Cobertura multilingue: no disponible.

## Casos de uso

- Investigacion en preentrenamiento continuado: permite reproducir y auditar un pipeline completo de CPT sobre un modelo abierto, comparando el checkpoint fusionado con allenai/Olmo-3-1025-7B para medir deriva de pesos y olvido catastrofico.
- Experimentos sobre corpus urbanos: el modelo puede generar continuaciones de texto con el vocabulario y el estilo del dataset `urban_12738_cleaned`, util para analizar como un corpus pequeno (10.072 documentos) desplaza la distribucion de salida de un modelo base de 7,3 B.
- Base para ajuste fino supervisado: al ser un modelo denso de 7,3 B en BF16, se puede afinar con LoRA o QLoRA en una sola GPU de 24 GB para tareas concretas de generacion de texto.
- Generacion de datos sinteticos: puede emplearse como generador de borradores textuales de tematica urbana que despues se filtran y revisan manualmente antes de incorporarlos a otros datasets.
- Estudio de sesgos y seguridad en corpus especificos: sirve como caso de prueba para medir si un CPT corto sobre un unico dataset introduce o amplifica sesgos respecto al modelo base.
- Evaluacion de infraestructura de despliegue: con 14,6 GB de pesos BF16 es un banco de pruebas adecuado para validar configuraciones de vLLM, TGI o llama.cpp en GPUs de 24 GB o superiores.
- Analisis de estabilidad de fusion de adaptadores: el uso de `save_pretrained_merged` con exportacion a 16 bits permite verificar la fidelidad numerica de la fusion frente al modelo entrenado con adaptador.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio no incluye evaluaciones de MMLU, HumanEval, GSM8K ni de ninguna otra suite, y el autor no reporta metricas cuantitativas de calidad o de compasion.

## Requisitos de hardware

- VRAM estimada para inferencia, calculada a partir de los 7.298.011.136 parametros: aproximadamente 15 a 16 GB en BF16 (solo pesos) mas la cache KV, que crece con la longitud de contexto.
- En cuantizacion de 8 bits la huella de pesos baja a unos 8 GB; en 4 bits, a unos 5-6 GB. Estas cuantizaciones no estan publicadas en el repositorio y requeririan conversion propia (por ejemplo, a GGUF con llama.cpp).
- GPU recomendadas para BF16: A100 40/80 GB, H100, L40S, RTX 4090 (24 GB) y RTX 3090 (24 GB). En tarjetas de 24 GB el modelo entra, pero el margen para contexto largo es reducido.
- Cabe en GPU de consumo: si, en RTX 3090 y RTX 4090 con 24 GB en BF16 o FP16; en GPUs de 16 GB (RTX 4080, RTX 4060 Ti 16 GB) solo con cuantizacion de 8 o 4 bits.
- Opciones de despliegue: transformers de forma nativa al estar los pesos en safetensors; vLLM y TGI para servicio con batching; llama.cpp y Ollama requieren convertir previamente los pesos a GGUF, ya que no se distribuye ese formato.
- Latencia y throughput estimados: no disponibles, no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Olmo7b-urban-seed2-20261012-CPT-merged-epoch-1 | 7,3 B | no disponible | no disponible | Repositorio HuggingFace con 0 descargas y 0 likes |
| allenai/Olmo-3-1025-7B (modelo base) | 7 B (segun nomenclatura; no verificado en esta ficha) | no disponible | no disponible en esta ficha | Modelo abierto de referencia de AllenAI |
| Mistral-7B-v0.3 | 7,25 B | 32.768 tokens | Apache 2.0 | Ampliamente desplegado, con cuantizaciones GGUF y AWQ publicas |
| Qwen2.5-7B | 7,6 B | 131.072 tokens | Apache 2.0 | Ampliamente desplegado, con cuantizaciones publicas |

Nota: los datos de las dos alternativas de terceros proceden de conocimiento general y deben verificarse en sus respectivas model cards antes de tomar decisiones de produccion. Para este modelo no se han publicado benchmarks que permitan una comparacion de rendimiento objetiva.

## Limitaciones y advertencias

- El autor indica explicitamente que el entrenamiento no establece una mejora en compasion; cualquier afirmacion de ese tipo requeriria una evaluacion independiente.
- Corpus de entrenamiento muy reducido (10.072 documentos distintos) y una sola epoca (step 378), lo que limita la magnitud de la adaptacion y aumenta el riesgo de sobreajuste al dominio concreto.
- Riesgo de olvido catastrofico respecto al modelo base por el CPT, no cuantificado en la informacion disponible.
- Es un modelo base, no ajustado por instrucciones: no se debe esperar seguimiento fiable de ordenes conversacionales ni formato de chat.
- Riesgo de alucinacion inherente a un modelo de lenguaje de 7,3 B sin alineacion declarada.
- Licencia no declarada en el repositorio: al derivar de allenai/Olmo-3-1025-7B, es imprescindible revisar la licencia y las condiciones de uso del modelo base antes de cualquier uso comercial.
- Idiomas soportados y comportamiento multilingue no documentados.
- Longitud de contexto no especificada; no se debe asumir una ventana concreta sin consultarla en el modelo base.
- Sin descargas ni validacion externa (0 likes, 0 descargas), por lo que no existe evidencia de la comunidad sobre su calidad o estabilidad.
- Requiere revisar `run_manifest.json` en el repositorio para conocer la revision base exacta, los hashes de seleccion de documentos y los hiperparametros de entrenamiento.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/BrandonHowe/Olmo7b-urban-seed2-20261012-CPT-merged-epoch-1
- Modelo base: https://huggingface.co/allenai/Olmo-3-1025-7B
- Dataset de preentrenamiento continuado: https://huggingface.co/datasets/CompassioninMachineLearning/urban_12738_cleaned
- Manifiesto de ejecucion (dentro del repositorio del modelo): `run_manifest.json`
- Herramienta de fusion empleada, Unsloth: https://github.com/unslothai/unsloth
- No se han encontrado enlaces relevantes adicionales en la busqueda web: los resultados devueltos no guardan ninguna relacion con el modelo ni con el ambito de la inteligencia artificial, por lo que se descartan.
