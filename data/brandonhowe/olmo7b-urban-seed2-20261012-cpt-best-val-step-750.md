# BrandonHowe/Olmo7b-urban-seed2-20261012-CPT-best-val-step-750

## Resumen

Olmo7b-urban-seed2-20261012-CPT-best-val-step-750 es un modelo de lenguaje de 7.298.011.136 parametros (7,3B) publicado por el usuario BrandonHowe en HuggingFace. No es un modelo entrenado desde cero: se trata de un checkpoint resultante de un proceso de preentrenamiento continuado (continued pretraining, CPT) sobre el modelo base allenai/Olmo-3-1025-7B de AI2. El entrenamiento se hizo sobre el corpus CompassioninMachineLearning/urban_12738_cleaned, con 10.072 documentos distintos mas 2.000 repeticiones por epoca y 200 documentos de validacion disjuntos, y el artefacto publicado corresponde al paso 750 de la epoca 1,9860834990059644 (el mejor checkpoint por perdida de validacion, segun el nombre).

La relevancia de esta ficha es acotada y conviene ser explicito: se trata de un artefacto experimental de investigacion, con 0 descargas y 0 likes en el momento de la consulta, sin licencia declarada y sin resultados de evaluacion publicados. Su interes principal reside en la metodologia: demuestra un flujo de trabajo reproducible de CPT sobre Olmo 3 (familia abierta de AI2), con seleccion de documentos trazada por hashes y validacion de la exportacion. El autor advierte en la propia model card de que el entrenamiento no demuestra una mejora en compasion y que esa hipotesis debe evaluarse por separado.

Tecnicamente es un transformer denso de 7,3B parametros, distribuido en BF16 y empaquetado en ocho shards de safetensors mediante `save_pretrained_merged(save_method="merged_16bit")` de Unsloth. Al estar fusionado (merged), no requiere cargar ningun adaptador LoRA para su uso con `transformers`. El repositorio ocupa 14,6 GB, coherente con pesos BF16 sin cuantizar.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso decoder-only (derivado de allenai/Olmo-3-1025-7B); detalle de capas, cabezas y atencion no disponible |
| Parametros totales | 7.298.011.136 (7,3B) |
| Parametros activos | no aplica (modelo denso, no es MoE) |
| Longitud de contexto | no disponible (heredada del modelo base; no declarada en la model card) |
| Tipos de cuantizacion | BF16 nativo (pesos validados en BF16). No se publican versiones GGUF, GPTQ, AWQ ni MLX; al ser un transformer denso estandar es convertible con herramientas externas |
| Idiomas soportados | no disponible (no declarado; el corpus de CPT es un dataset concreto, `urban_12738_cleaned`) |
| Licencia | no disponible en este repositorio (consultar la licencia del modelo base) |
| Formato de pesos | safetensors (8 shards, BF16 fusionado, sin adaptador) |
| Modelo base | allenai/Olmo-3-1025-7B |
| Dataset de CPT | CompassioninMachineLearning/urban_12738_cleaned (revision `ef7c0e742df63ea319e35d02d9f6ba63d6e7c68d`) |
| Tamano del repositorio | 14,6 GB |
| Libreria y pipeline | transformers; text-generation |
| Paso y epoca | step 750; epoca 1,9860834990059644 |
| Compatibilidad de despliegue | etiqueta `endpoints_compatible` en el repositorio |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Olmo 3 7B (`allenai/Olmo-3-1025-7B`), un transformer denso decoder-only desarrollado por el Allen Institute for AI. Esta ficha no dispone de los hiperparametros estructurales concretos (numero de capas, dimension del modelo, cabezas de atencion, mecanismo de posiciones, tipo de normalizacion ni contexto maximo entrenado) y no se inventan aqui; deben consultarse en la documentacion oficial del modelo base.

El proceso aplicado sobre ese base es un preentrenamiento continuado de dominio, no un ajuste por instrucciones. Segun la model card, se usaron 10.072 documentos distintos del corpus `urban_12738_cleaned` mas 2.000 exposiciones repetidas por epoca, con 200 documentos de validacion disjuntos del conjunto de entrenamiento. El checkpoint publicado es el paso 750 de la epoca 1,9860834990059644, seleccionado como mejor valor de validacion. Todo apunta a un pipeline de ajuste eficiente en memoria (formato de exportacion de Unsloth), aunque el resultado se publica ya fusionado en pesos completos BF16: los ocho shards de safetensors estan validados y empaquetados sin perdida, de modo que el modelo se carga directamente sin adaptador.

La trazabilidad es el aspecto metodologico mas destacable: el autor remite a `run_manifest.json` dentro del repositorio, que contiene la revision del modelo base, los hashes de seleccion de documentos, los parametros de entrenamiento y la validacion de la exportacion. No se documenta en la informacion disponible ninguna innovacion arquitectonica (por ejemplo, atencion lineal, decodificacion especulativa o capas hibridas SSM), ni el uso de RLHF, DPO o tecnicas de alineacion posteriores.

## Capacidades

- Generacion de texto autoregresiva en modo modelo base (completado de texto, no dialogo instruido).
- Adaptacion de dominio al registro y vocabulario del corpus urbano usado en el CPT (`urban_12738_cleaned`), sin que se haya publicado una evaluacion cuantitativa de esa adaptacion.
- Punto de partida para preentrenamiento continuado adicional o para SFT posterior hacia un asistente.
- Extraccion de representaciones internas para tareas posteriores (clasificacion, agrupamiento, recuperacion), anadiendo una cabeza o usando las activaciones del modelo.
- Carga directa con `transformers` sin adaptador LoRA, al estar los pesos fusionados en BF16.
- Compatibilidad declarada con endpoints de inferencia (etiqueta `endpoints_compatible`).
- Soporte de tool calling / function calling: no disponible; no se declara ni se ha entrenado para ello.
- Soporte de agentes y razonamiento multi-paso: no disponible; no hay indicios de entrenamiento en ese sentido.
- Capacidades multilingues: no disponible; no se declaran idiomas.
- Capacidades especiales (modo thinking, vision, audio): no disponible; no se declaran.

## Casos de uso

- Investigacion en adaptacion de dominio mediante CPT: el modelo sirve como referencia reproducible de un ciclo completo (seleccion de documentos, validacion disjunta, exportacion fusionada y trazabilidad por hashes) para replicar el metodo en otros corpus.
- Fine-tuning supervisado posterior: al ser un modelo base de 7,3B con pesos completos y sin adaptador, es un punto de partida directo para SFT y posteriores tecnicas de alineacion orientadas a un asistente de dominio.
- Generacion de texto de dominio urbano en modo few-shot: con ejemplos en el prompt se pueden obtener continuaciones y borradores de textos tecnicos o descriptivos del ambito urbano; requiere revision humana por tratarse de un modelo base.
- Generacion de datos sinteticos para aumentar un corpus urbano: se pueden muestrear completados a partir de prefijos reales para ampliar cobertura tematica antes de filtrar por calidad.
- Estudio de olvido catastrofico y deriva de dominio: comparar este checkpoint (paso 750) con el modelo base permite medir cuanto del comportamiento generalista del Olmo 3 original se conserva tras la CPT.
- Auditoria de afirmaciones sobre comportamiento prosocial: la model card indica que el entrenamiento no demuestra una mejora en compasion, de modo que el modelo es un objeto de estudio adecuado para disenar evaluaciones especificas de esa hipotesis.
- Extraccion de caracteristicas para clasificacion de documentos urbanos: usar las activaciones del modelo como entrada de un clasificador ligero entrenado con etiquetas propias.
- Servicio de inferencia experimental en un endpoint compatible con vLLM o TGI, para pruebas internas de latencia y throughput con el modelo fusionado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

La model card no incluye MMLU, HumanEval, GSM8K, MT-Bench, ningun resultado de evaluacion de compasion ni metricas de perplejidad, salvo la referencia al mejor valor de validacion (paso 750) sin cifra concreta. No se han encontrado datos de rendimiento en la busqueda web asociada a este modelo, cuyos resultados no guardaban relacion con el artefacto.

## Requisitos de hardware

- VRAM para inferencia en BF16/FP16: aproximadamente 14,6 GB solo para los pesos, mas cache KV y activaciones. Presupuesto practico de 18-24 GB para contextos moderados.
- VRAM estimada en cuantizacion de terceros (no publicadas, solo como referencia de conversion): unos 7-8 GB en 8 bits y unos 4-5 GB en 4 bits.
- Cabe en GPU de consumo: si. RTX 3090, RTX 4090, RTX 5090 y tarjetas con 24 GB o mas pueden ejecutar los pesos BF16 con contexto limitado; tarjetas de 16 GB (RTX 4080, 4060 Ti 16 GB) exigen cuantizacion a 8 o 4 bits.
- GPU profesionales recomendadas: A100 40 GB, A100 80 GB, H100 80 GB, L40S 48 GB, A6000 48 GB. Para BF16 con contexto largo o lotes grandes conviene 40 GB o mas.
- Multi-GPU: con 7,3B parametros es viable el paralelismo tensorial en 2 GPU de 24 GB con vLLM o TGI si se necesita mayor contexto o throughput.
- Opciones de despliegue: `transformers` de forma nativa (sin adaptador), vLLM y TGI para servicio HTTP, Unsloth para fine-tuning eficiente, y llama.cpp u Ollama solo tras convertir manualmente los pesos a GGUF, dado que el repositorio no incluye ese formato.
- Latencia y throughput estimados: no disponibles. No se han publicado mediciones de tokens por segundo ni de tiempo hasta el primer token.

## Comparativa con modelos similares

La comparacion se establece con modelos base densos de tamano equivalente, ya que el artefacto evaluado es un modelo base de 7,3B sin ajuste por instrucciones. Los datos de las alternativas corresponden a sus especificaciones publicas; no se ha ejecutado ninguna evaluacion comparativa en esta ficha.

| Modelo | Parametros | Contexto | Licencia | Disponibilidad y notas |
|---|---|---|---|---|
| Olmo7b-urban-seed2-20261012-CPT-best-val-step-750 | 7,3B | no disponible | no disponible | Repositorio HuggingFace; 0 descargas y 0 likes; artefacto de investigacion sin benchmarks |
| allenai/Olmo-3-1025-7B (modelo base) | ~7B | no disponible en esta ficha | consultar repositorio del modelo base | Modelo oficial de AI2; referencia para medir la deriva introducida por la CPT |
| Mistral-7B-v0.3 | 7,25B | 32.768 tokens | Apache 2.0 | Muy extendido, con cuantizaciones GGUF y AWQ publicadas |
| Meta Llama-3.1-8B | 8,03B | 131.072 tokens | Licencia comunitaria de Llama 3.1 | Amplio ecosistema; pesos originales en BF16 y multiples cuantizaciones |
| Qwen2.5-7B | 7,62B | 131.072 tokens | Apache 2.0 | Buen soporte multilingue declarado; cuantizaciones oficiales disponibles |

Diferencias clave frente a esas alternativas: el modelo aqui descrito no declara licencia, no declara idiomas, no publica benchmarks y no ofrece versiones cuantizadas. En cambio, si aporta algo poco habitual: un manifiesto de entrenamiento con hashes de seleccion de documentos y validacion de exportacion, lo que facilita la reproducibilidad del experimento.

## Limitaciones y advertencias

- Es un modelo base, no un asistente: no ha recibido ajuste por instrucciones ni alineacion, por lo que no se debe esperar seguimiento fiable de ordenes, formato consistente ni rechazo de peticiones daninas.
- Riesgo de alucinacion alto en uso generativo, propio de cualquier modelo base de 7B sin anclaje a fuentes; cualquier salida factica requiere verificacion.
- La model card advierte explicitamente de que el entrenamiento no establece una mejora en compasion y que esa afirmacion debe evaluarse por separado. No se debe presentar el modelo como "mas compasivo".
- Ausencia de datos de evaluacion: no hay perplejidad publicada, ni benchmarks, ni mediciones del posible olvido catastrofico provocado por el preentrenamiento continuado.
- Licencia no declarada en el repositorio. Ademas del riesgo legal directo, la licencia del modelo base (allenai/Olmo-3-1025-7B) puede imponer condiciones adicionales a los modelos derivados; hay que verificar ambos extremos antes de cualquier uso comercial.
- Idiomas no declarados: no hay garantia de calidad fuera del idioma o idiomas presentes en `urban_12738_cleaned`.
- Longitud de contexto no declarada: no se puede planificar un caso de uso con ventanas largas sin verificarla experimentalmente contra el modelo base.
- Corpus de entrenamiento pequeno y especializado (10.072 documentos distintos mas repeticiones): adecuado para investigacion de dominio, insuficiente para sostener afirmaciones de mejora general.
- Sesgos: no se ha publicado ningun analisis de sesgos ni de composicion demografica o tematica del corpus `urban_12738_cleaned`.
- Adopcion practicamente nula (0 descargas, 0 likes) y sin issues publicas: no existe validacion por parte de terceros.
- Para produccion, la ausencia de cuantizaciones oficiales obliga a generar y validar internamente cualquier formato GGUF, AWQ o GPTQ.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/BrandonHowe/Olmo7b-urban-seed2-20261012-CPT-best-val-step-750
- Modelo base: https://huggingface.co/allenai/Olmo-3-1025-7B
- Dataset de preentrenamiento continuado: https://huggingface.co/datasets/CompassioninMachineLearning/urban_12738_cleaned
- Manifiesto de ejecucion del autor: `run_manifest.json` dentro del repositorio del modelo (revision del base, hashes de seleccion de documentos, parametros de entrenamiento y validacion de exportacion)
- No se han encontrado en la busqueda web enlaces relevantes al modelo (papers, blogs, repositorios o demos). Los resultados devueltos por la busqueda no guardaban relacion con este artefacto.
