# BrandonHowe/Qwen3-8b-urban-qwen-20260920-full-CPT-merged-epoch-3

## Resumen

Qwen3-8b-urban-qwen-20260920-full-CPT-merged-epoch-3 es un modelo derivado por aprendizaje continuo (continued pretraining, CPT) a partir de Qwen/Qwen3-8B-Base, publicado por el usuario BrandonHowe en HuggingFace. No se trata de un modelo nuevo entrenado desde cero, sino de un ajuste del modelo base sobre un corpus concreto: el dataset CompassioninMachineLearning/urban_12738_cleaned, en su revision ef7c0e742df63ea319e35d02d9f6ba63d6e7c68d. El resultado se distribuye ya fusionado en pesos BF16, sin adaptador LoRA, en ocho shards de safetensors listos para cargar con transformers.

El modelo tiene 8.190.735.360 parametros (unos 8,19 mil millones) y ocupa 16,4 GB en el repositorio. Corresponde al checkpoint del epoch 3.0, step 1134, y fue exportado con el metodo nativo de Unsloth save_pretrained_merged(save_method="merged_16bit"), con pesos BF16 validados y empaquetados sin perdida. Al derivar de la variante Base de Qwen3, no incorpora alineacion de instrucciones tipo RLHF o DPO en esta publicacion.

Su relevancia es acotada y de nicho: sirve como caso de estudio de un pipeline de CPT reproducible sobre un corpus pequeno (10.072 documentos distintos mas 2.000 exposiciones repetidas por epoch, con 200 documentos de validacion disjuntos) y como punto de partida para experimentos de especializacion de dominio sobre Qwen3-8B. El propio autor advierte en la model card que el entrenamiento no demuestra una mejora en compasion y que esa propiedad debe evaluarse por separado. El repositorio tiene 223 descargas y 1 like, por lo que la validacion por parte de la comunidad es practicamente nula.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso (heredada del modelo base Qwen3-8B-Base; no se documentan modificaciones estructurales en la model card) |
| Parametros totales | 8.190.735.360 (8,19 B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada para este checkpoint. El modelo base Qwen3-8B declara 32.768 tokens nativos, extensibles a 131.072 mediante YaRN; el autor no confirma ni modifica este valor |
| Tipos de cuantizacion | No disponible en el repositorio: solo se publican pesos BF16. No se incluyen versiones GGUF, AWQ ni GPTQ |
| Idiomas soportados | No disponible (la model card no declara idiomas). El modelo base Qwen3-8B declara soporte de 119 idiomas y dialectos, pero no se verifica que el CPT preserve ese soporte |
| Licencia | No disponible (el repositorio no especifica licencia; el modelo base Qwen3-8B se distribuye bajo Apache 2.0) |
| Formato de pesos | safetensors, precision BF16, ocho shards; sin adaptador (modelo fusionado) |

## Arquitectura y entrenamiento

La arquitectura es la del modelo base Qwen3-8B-Base: un transformer decoder-only denso con atencion por consultas agrupadas (GQA) y, en la variante Instruct del mismo, capacidades de modo pensamiento. La model card de este checkpoint no describe ninguna alteracion estructural, de modo que la innovacion aqui no esta en la arquitectura sino en el procedimiento de entrenamiento. El pipeline es de continued pretraining sobre un unico corpus, no de ajuste supervisado ni de alineacion por preferencias: no se mencionan RLHF, DPO ni RLHF/RLVR en la documentacion disponible.

Los datos de entrenamiento son el dataset CompassioninMachineLearning/urban_12738_cleaned, fijado en la revision ef7c0e742df63ea319e35d02d9f6ba63d6e7c68d. Cada epoch expone 10.072 documentos distintos mas 2.000 exposiciones repetidas, y la validacion usa 200 documentos disjuntos del conjunto de entrenamiento. Este checkpoint corresponde al epoch 3.0, step 1134. La exportacion se hizo con la funcion nativa de Unsloth save_pretrained_merged(save_method="merged_16bit"), que fusiona los pesos y los empaqueta en BF16 validado en ocho shards; el autor indica que existe un run_manifest.json con la revision base, los hashes de seleccion de documentos, los hiperparametros de entrenamiento y la validacion de la exportacion, aunque esos detalles no se reproducen en la model card.

## Capacidades

- Generacion de texto autoregresiva en el formato estandar del modelo base Qwen3-8B-Base (pipeline text-generation).
- Capacidad conversacional potencial: el repositorio incluye la etiqueta "conversational", pero al derivar de la variante Base, no se garantiza el seguimiento de instrucciones ni el formato de chat sin un ajuste posterior.
- Razonamiento y conocimiento general: heredados del modelo base, no reentrenados ni evaluados en esta publicacion.
- Capacidades multilingues: no verificadas para este checkpoint; el modelo base declara 119 idiomas.
- Tool calling / function calling: no documentado para este checkpoint; en el modelo base requiere la variante Instruct o plantillas especificas.
- Comportamiento agente y razonamiento multi-paso: no documentado.
- Modo pensamiento (thinking mode): no documentado para este checkpoint; es una capacidad de las variantes Instruct de Qwen3, no confirmada aqui.
- Vision o audio: no soportados (modelo exclusivamente de texto).
- Especializacion potencial en el dominio del corpus "urban" usado en el CPT, sin cuantificacion publicada del efecto.

## Casos de uso

- Investigacion en aprendizaje continuo: usar este checkpoint como referencia reproducible de un pipeline CPT sobre corpus pequeno, comparando su comportamiento con Qwen3-8B-Base para medir deriva y olvido catastrofico.
- Experimentos de especializacion de dominio: partir de estos pesos para un CPT adicional sobre un corpus mayor y evaluar si el dominio "urban" actua como semilla util.
- Generacion de texto sin instrucciones: al ser un modelo Base, es adecuado para tareas de continuacion de texto y modelado de lenguaje, no para asistentes conversacionales directos.
- Punto de partida para SFT posterior: servir como inicializacion para un ajuste supervisado con instrucciones, ya que la fusion en BF16 evita gestionar adaptadores.
- Ablaciones academicas sobre datos sinteticos o filtrados: el dataset de origen y las exposiciones repetidas (2.000 por epoch) permiten estudiar el efecto de la repeticion en corpus pequenos.
- Analisis de sesgos y de calidad de corpus: util para auditar como un corpus urbano concreto desplaza la distribucion de salida respecto al modelo base.
- Evaluaciones de seguridad y alineacion: como ejemplo de modelo Base sin alineacion, sirve para probar baterias de red-teaming antes de cualquier despliegue.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas de MMLU, HumanEval, GSM8K ni de ninguna otra suite, y tampoco ofrece resultados en los 200 documentos de validacion. El autor indica explicitamente que el entrenamiento no establece una mejora en compasion y que esa propiedad debe evaluarse por separado.

## Requisitos de hardware

- VRAM en BF16: los pesos ocupan aproximadamente 16,4 GB, por lo que se necesitan al menos unos 17-18 GB de VRAM solo para el modelo, mas el cache KV.
- GPU profesionales: cabe con holgura en A100 40 GB, A100 80 GB, H100 80 GB y L40S 48 GB, con contexto amplio.
- GPU de consumo: una RTX 4090 o RTX 3090 de 24 GB puede cargar el modelo en BF16 con contexto moderado; una RTX 4080 de 16 GB no cabe en BF16 sin cuantizar.
- Cuantizacion: al no publicarse GGUF ni AWQ/GPTQ, para GPUs pequenas habria que convertir manualmente (por ejemplo con llama.cpp) a Q4 o Q5, lo que reduce el uso a unos 5-6 GB en Q4.
- Opciones de despliegue: al incluir las etiquetas text-generation-inference y endpoints_compatible, es compatible con TGI y con HuggingFace Inference Endpoints. Tambien es desplegable con vLLM (formato safetensors HF) y con transformers directamente. llama.cpp y Ollama requeririan una conversion previa a GGUF, no incluida en el repositorio.
- Latencia y throughput: no disponible; no se publican mediciones de tokens por segundo ni de latencia.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Qwen3-8b-urban-qwen-20260920-full-CPT-merged-epoch-3 | 8,19 B | No disponible (base: 32.768 nativos) | No disponible | HuggingFace, safetensors BF16 | CPT sobre corpus urbano de ~10.000 documentos, sin benchmarks |
| Qwen/Qwen3-8B-Base | 8,19 B | 32.768 nativos, 131.072 con YaRN | Apache 2.0 | HuggingFace, safetensors, GGUF y cuantizaciones de terceros | Modelo base previo al CPT; soporte de 119 idiomas declarado |
| Qwen/Qwen3-8B (Instruct) | 8,19 B | 32.768 nativos, 131.072 con YaRN | Apache 2.0 | HuggingFace, multiples formatos | Incluye modo pensamiento y alineacion de instrucciones |
| Llama 3.1 8B Instruct | 8,03 B | 128.000 | Llama 3.1 Community License | HuggingFace, GGUF, amplio ecosistema | Alternativa de tamano comparable con contexto mayor |

## Limitaciones y advertencias

- Licencia no declarada en el repositorio: el modelo base es Apache 2.0, pero la ausencia de licencia explicita en este checkpoint impide confirmar las condiciones de uso comercial. Conviene contactar con el autor o tratar el modelo como no apto para produccion.
- Ausencia total de benchmarks: no hay evidencia publicada de que el CPT mejore ninguna tarea respecto al modelo base; el propio autor senala que no se demuestra mejora en compasion.
- Al derivar de Qwen3-8B-Base y no de la variante Instruct, no incorpora alineacion de instrucciones, RLHF ni DPO. No es adecuado como asistente conversacional sin un ajuste posterior.
- Riesgo de olvido catastrofico: el CPT se hizo sobre un corpus relativamente pequeno (10.072 documentos por epoch, con 2.000 repeticiones), lo que puede degradar conocimiento general y capacidades del modelo base.
- Sesgos del corpus: el dataset "urban" puede introducir sesgos tematicos, geograficos o de registro que se manifiestan en las generaciones.
- Riesgo de alucinacion: inherente a los modelos de lenguaje de este tamano; sin evaluacion especifica para este checkpoint.
- Idiomas no declarados: aunque el modelo base cubre 119 idiomas, no hay verificacion de que el CPT preserve ese rendimiento fuera del idioma o idiomas del corpus.
- Contexto no confirmado: la model card no especifica la longitud de contexto efectiva tras el entrenamiento.
- Validacion de la comunidad practicamente inexistente: 223 descargas y 1 like en el momento de la consulta.
- Trazabilidad parcial: se menciona un run_manifest.json con hashes e hiperparametros, pero los detalles no se reproducen en la model card, lo que dificulta auditar el entrenamiento.

## Enlaces

- Pagina del modelo en HuggingFace: https://huggingface.co/BrandonHowe/Qwen3-8b-urban-qwen-20260920-full-CPT-merged-epoch-3
- Modelo base: https://huggingface.co/Qwen/Qwen3-8B-Base
- Dataset de entrenamiento: https://huggingface.co/datasets/CompassioninMachineLearning/urban_12738_cleaned
- Resultados de busqueda web: no se ha encontrado ningun resultado relevante sobre este modelo. Los unicos resultados devueltos corresponden a foros en frances sobre codigo de circulacion y extensiones de navegador, sin relacion alguna con el modelo, por lo que se omiten.
