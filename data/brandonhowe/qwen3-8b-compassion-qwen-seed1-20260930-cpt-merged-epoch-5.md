# BrandonHowe/Qwen3-8b-compassion-qwen-seed1-20260930-CPT-merged-epoch-5

## Resumen

Este modelo es un checkpoint de preentrenamiento continuado (continued pretraining, CPT) derivado de Qwen3-8B-Base, publicado por el usuario BrandonHowe. Se trata de un modelo denso de 8.190.735.360 parametros (aproximadamente 8,19 mil millones) que ha sido ajustado sobre el corpus `CompassioninMachineLearning/compassion_12185_cleaned` y exportado en un unico conjunto de pesos fusionados en BF16, sin adaptadores LoRA. No es un modelo instructivo ni un chat: parte de una base sin ajuste por instrucciones y se ha sometido a un regimen de exposicion repetida sobre un corpus reducido y tematicamente muy especifico.

El checkpoint corresponde a la epoca 5.0 (paso 1875) y se ha empaquetado con la utilidad `save_pretrained_merged(save_method="merged_16bit")` de Unsloth, distribuida en ocho shards de safetensors. El repositorio ocupa 16,4 GB y se publica bajo la libreria transformers, con compatibilidad declarada con text-generation-inference y endpoints. El modelo registra 0 descargas y 0 likes en el momento de redactar esta ficha, por lo que no existe validacion externa de su comportamiento.

Su relevancia es fundamentalmente de investigacion: sirve como artefacto reproducible para estudiar si el preentrenamiento continuado sobre corpus orientados a la compasion modifica el comportamiento del modelo base. El propio autor advierte de forma explicita que el entrenamiento no establece una mejora en compasion y que ese extremo debe evaluarse por separado. No hay licencia declarada, ni idiomas documentados, ni resultados de benchmarks publicados en la informacion disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (familia Qwen3, derivado de Qwen/Qwen3-8B-Base); detalles internos no disponibles |
| Parametros totales | 8.190.735.360 |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible en la model card del autor; el modelo base Qwen3-8B-Base declara 32.768 tokens nativos, ampliables con YaRN, segun la documentacion publica de Qwen |
| Tipos de cuantizacion | BF16 (unico formato publicado); no hay GGUF, AWQ, GPTQ ni otras cuantizaciones en el repositorio |
| Idiomas soportados | no disponible (no declarados por el autor) |
| Licencia | no disponible |
| Formato de pesos | safetensors (ocho shards, BF16 fusionado, 16,4 GB) |

## Arquitectura y entrenamiento

La arquitectura subyacente es la del modelo base Qwen3-8B-Base, un transformer denso de 8.190.735.360 parametros. El autor no documenta en la model card ningun cambio estructural, ni decodificacion especulativa, ni atencion lineal, ni variantes hibridas: la intervencion consiste en un preentrenamiento continuado sobre el modelo base seguido de una fusion de pesos. El resultado se exporta con `save_pretrained_merged(save_method="merged_16bit")` de Unsloth, validado en BF16 y empaquetado sin perdida en ocho shards de safetensors, de modo que no requiere cargar ningun adaptador.

Respecto a los datos, el entrenamiento usa `CompassioninMachineLearning/compassion_12185_cleaned` en la revision `95e233baf48a7751bcec55a08347697ed6e4c4a8`. El regimen descrito es de 10.000 documentos distintos mas 2.000 exposiciones repetidas por epoca, con 200 documentos de validacion disjuntos. No se especifica el numero total de tokens procesados, la composicion detallada del corpus, ni si hubo fases de RLHF, DPO o ajuste por preferencias; tampoco se documenta una plantilla de chat. El repositorio incluye un `run_manifest.json` con la revision base, los hashes de seleccion de documentos, los parametros de entrenamiento y la validacion de la exportacion, que es la fuente a consultar para reproducir el experimento.

## Capacidades

- Generacion de texto por continuacion: al derivar de un modelo base sin ajuste instructivo, su funcion natural es completar secuencias, no responder a ordenes.
- Modelado de lenguaje general heredado de Qwen3-8B-Base, con el sesgo tematico introducido por el corpus de compasion.
- Capacidad potencial de generar texto con registro linguistico orientado a la compasion, si el preentrenamiento continuado ha tenido efecto; el autor indica que esto debe evaluarse por separado y no lo da por demostrado.
- Soporte de tool calling / function calling: no disponible; no hay plantilla de herramientas ni evidencia de entrenamiento en ese sentido.
- Soporte de agentes y razonamiento multi-paso: no disponible; un modelo base sin ajuste instructivo no ejecuta bucles de agente de forma fiable.
- Capacidades multilingues: no disponibles; el autor no declara idiomas y el corpus de entrenamiento no se describe en terminos de cobertura linguistica.
- Capacidades especiales (modo thinking, vision, audio): no disponibles; el modo thinking pertenece a los checkpoints instructivos de Qwen3, no a la variante Base de la que parte este modelo.
- Capacidad de servir como punto de partida para ajustes posteriores (LoRA o fine-tuning completo) sobre tareas especificas.

## Casos de uso

- Investigacion sobre alineamiento y valores: el modelo permite estudiar experimentalmente si el preentrenamiento continuado sobre un corpus de compasion desplaza la distribucion de salidas respecto a Qwen3-8B-Base, usando el mismo prompt set en ambos y midiendo diferencias de forma controlada.
- Generacion de datos sinteticos con supervision humana: puede producir continuaciones tematicamente sesgadas hacia la compasion que un anotador revise y filtre antes de incorporarlas a un dataset mayor; solo tiene sentido si se valida la calidad caso por caso.
- Base para fine-tuning instructivo: al ser un checkpoint fusionado en BF16 y cargable directamente con transformers, sirve como inicializacion para un ajuste SFT posterior con plantilla de chat propia.
- Analisis linguistico y estilistico: comparar la perplexidad y la distribucion lexical de este checkpoint frente al base sobre un corpus de validacion permite cuantificar el efecto real del CPT y detectar deriva de dominio.
- Experimentos de olvido catastrofico: con solo 10.000 documentos distintos y 2.000 exposiciones repetidas por epoca, es un caso de estudio util para medir degradacion en tareas generales tras un CPT agresivo sobre un corpus estrecho.
- Reproducibilidad de pipelines de CPT: el `run_manifest.json` documenta revision base, hashes de seleccion y parametros, lo que permite replicar el entrenamiento y auditar la pipeline de exportacion con Unsloth.
- Docencia y demostraciones: ilustrar en un aula o taller como un preentrenamiento continuado cambia el comportamiento de un modelo base, con la advertencia explicita de que no es un modelo de produccion.
- Evaluacion de seguridad previa a despliegue: sirve como sujeto de pruebas para medir sesgos y tasas de alucinacion antes de considerar cualquier uso real, dado que no existe ninguna evaluacion publicada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye MMLU, HumanEval, GSM8K, MT-Bench ni ninguna otra metrica, y el autor indica explicitamente que el entrenamiento no establece una mejora en compasion y que ese extremo debe evaluarse por separado. Tampoco hay datos de latencia o throughput. Cualquier cifra que se use para comparar este checkpoint debe generarse mediante una evaluacion propia y reproducible.

## Requisitos de hardware

- Pesos en BF16: el repositorio ocupa 16,4 GB, por lo que la inferencia en BF16 requiere del orden de 18 a 20 GB de VRAM contando cache KV y overhead del runtime, dependiendo de la longitud de contexto efectiva.
- GPU profesionales: cabe con holgura en A100 40 GB, A100 80 GB, H100 80 GB y L40S 48 GB; estas configuraciones permiten lotes mayores y contextos mas largos.
- GPU de consumo: cabe en RTX 4090, RTX 3090 y RTX 4080 (24 GB o menos) en BF16 con contexto moderado; en GPUs de 12 a 16 GB solo es viable tras cuantizar.
- Cuantizacion: no hay GGUF, AWQ ni GPTQ publicados en el repositorio. Para desplegar en hardware limitado habria que generar esas cuantizaciones (por ejemplo con llama.cpp para Q4_K_M, en torno a 5 GB, o con bitsandbytes para INT8, en torno a 9 GB) y validar que no degradan el comportamiento.
- Opciones de despliegue: transformers de forma nativa; vLLM y text-generation-inference (TGI) son compatibles segun los tags del repositorio y `endpoints_compatible`; llama.cpp y Ollama solo tras convertir los pesos a GGUF.
- Latencia y throughput: no disponibles; no se han publicado mediciones.

## Comparativa con modelos similares

Los datos de los modelos de referencia proceden de su documentacion publica y deben verificarse antes de tomar decisiones. Para este checkpoint concreto, la licencia y los idiomas figuran como no disponibles porque el autor no los declara.

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| BrandonHowe/Qwen3-8b-compassion-qwen-seed1-20260930-CPT-merged-epoch-5 | 8,19 B | no disponible en la model card | no disponible | safetensors BF16, 0 descargas | CPT sobre corpus de compasion, sin evaluacion publicada |
| Qwen/Qwen3-8B-Base | 8,19 B (aprox.) | 32.768 tokens nativos, ampliable con YaRN | Apache 2.0 | safetensors | Modelo base de partida, sin sesgo tematico de compasion |
| Qwen/Qwen3-8B | 8,19 B (aprox.) | 32.768 tokens nativos, ampliable con YaRN | Apache 2.0 | safetensors, GGUF y otras cuantizaciones | Variante instructiva con modo thinking y soporte de plantilla de chat |
| meta-llama/Llama-3.1-8B | 8,03 B (aprox.) | 128.000 tokens | Llama 3.1 Community License | safetensors y cuantizaciones | Alternativa de tamano similar, licencia con restricciones de uso |

La diferencia practica mas relevante frente a Qwen3-8B es que este checkpoint no incorpora ajuste por instrucciones: no dispone de plantilla de chat ni de modo thinking, de modo que no compite en tareas conversacionales sin un fine-tuning adicional.

## Limitaciones y advertencias

- No es un modelo instructivo: al derivar de Qwen3-8B-Base mediante preentrenamiento continuado, no sigue instrucciones ni respeta plantillas de chat de forma fiable.
- El autor advierte de forma explicita que el entrenamiento no demuestra una mejora en compasion; cualquier afirmacion en ese sentido exige una evaluacion independiente.
- Ausencia total de benchmarks: no hay datos de MMLU, HumanEval, GSM8K ni de seguridad, por lo que se desconoce el impacto del CPT sobre capacidades generales.
- Riesgo de olvido catastrofico y deriva de dominio: el corpus es pequeno (10.000 documentos distintos) y el regimen incluye 2.000 exposiciones repetidas por epoca, lo que favorece el sobreajuste tematico.
- Licencia no declarada: existe incertidumbre juridica para uso comercial. Aunque el modelo base Qwen3-8B-Base se distribuye bajo Apache 2.0, el autor de este derivado no especifica que licencia aplica a su checkpoint.
- Idiomas no documentados: se desconoce la cobertura linguistica real y si el CPT ha degradado idiomas distintos del dominante en el corpus.
- Riesgo de alucinacion propio de los modelos de lenguaje generativos, agravado por la ausencia de evaluacion y de fases de alineamiento.
- Sin validacion de la comunidad: 0 descargas y 0 likes, sin informes externos de comportamiento, sesgos o fallos.
- No hay cuantizaciones publicadas, lo que limita el despliegue en hardware de gama media sin trabajo adicional de conversion.
- Fecha de publicacion muy reciente (30 de septiembre de 2026) y un unico checkpoint disponible (epoca 5.0, paso 1875), sin curva de comparacion con epocas anteriores.
- No debe usarse en produccion con usuarios finales sin una evaluacion de seguridad, sesgo y calidad previa.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/BrandonHowe/Qwen3-8b-compassion-qwen-seed1-20260930-CPT-merged-epoch-5
- Modelo base: https://huggingface.co/Qwen/Qwen3-8B-Base
- Dataset de entrenamiento: https://huggingface.co/datasets/CompassioninMachineLearning/compassion_12185_cleaned
- Manifiesto de ejecucion: `run_manifest.json` dentro del repositorio del modelo (revision base, hashes de seleccion de documentos, parametros de entrenamiento y validacion de la exportacion)
- Herramienta de fusion declarada: Unsloth (`save_pretrained_merged`, `merged_16bit`)
- Resultados de busqueda web: no se han encontrado enlaces relevantes al modelo; las busquedas devolvieron exclusivamente contenido sin relacion (paginas de redes sociales y videos), por lo que no se incluyen.
