# BrandonHowe/Olmo7b-compassion-seed2-20261001-CPT-final

## Resumen

Olmo7b-compassion-seed2-20261001-CPT-final es un ajuste por preentrenamiento continuado (continued pretraining, CPT) del modelo base allenai/Olmo-3-1025-7B, publicado por el usuario BrandonHowe en HuggingFace. El modelo resultante es un checkpoint fusionado en BF16, sin adaptadores, listo para cargarse directamente con transformers. Se trata de un experimento de especializacion sobre un corpus reducido orientado a la compasion, no de un modelo generalista nuevo.

El entrenamiento partio de la familia OLMo 3 de Ai2 (7B) y utilizo el dataset CompassioninMachineLearning/compassion_12185_cleaned, con 10.000 documentos distintos y 2.000 exposiciones repetidas por epoca, mas 200 documentos de validacion disjuntos. El checkpoint publicado corresponde a la epoca 2,6666 y al paso 1000, fusionado con la utilidad save_pretrained_merged de Unsloth en modo merged_16bit.

Su relevancia es acotada y de caracter experimental: el propio autor advierte en la model card que el entrenamiento no establece una mejora en compasion y que ese extremo debe evaluarse por separado. Tiene 7.298.011.136 parametros, un repo de 14,6 GB en ocho shards safetensors, cero descargas y cero likes en el momento de la consulta, y no declara licencia ni idiomas soportados.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia OLMo 3; tag `olmo3`). Detalles de atencion, normalizacion y posicionales no disponibles |
| Parametros totales | 7.298.011.136 (7,3B) |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | solo BF16 publicado; no se incluyen variantes cuantizadas (GGUF, AWQ, GPTQ, FP8) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors BF16, ocho shards, modelo fusionado (sin adaptador) |
| Modelo base | allenai/Olmo-3-1025-7B |
| Dataset de ajuste | CompassioninMachineLearning/compassion_12185_cleaned (revision 95e233baf48a7751bcec55a08347697ed6e4c4a8) |
| Tarea (pipeline) | text-generation |
| Libreria | transformers |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura del base allenai/Olmo-3-1025-7B, un transformer decoder-only de 7,3B parametros de la familia OLMo 3 de Ai2. No se dispone en la informacion proporcionada de detalles sobre el tipo de atencion, la codificacion posicional, la funcion de activacion ni la composicion exacta del corpus de preentrenamiento original del base. El tag `bf16` y el tamano de repo (14,6 GB) son coherentes con pesos en precision bfloat16.

La intervencion sobre el base es un continued pretraining de dominio acotado sobre compassion_12185_cleaned: 10.000 documentos distintos mas 2.000 exposiciones repetidas por epoca, con 200 documentos de validacion disjuntos. El checkpoint publicado corresponde a la epoca 2,6666 y al paso 1000. La fusion se hizo con save_pretrained_merged(save_method="merged_16bit") de Unsloth y los pesos se validaron como BF16 antes de empaquetarlos sin perdida en ocho shards safetensors. El repositorio incluye un run_manifest.json con la revision base, los hashes de seleccion de documentos, los hiperparametros de entrenamiento y la validacion de la exportacion. No se documentan tecnicas adicionales como RLHF, DPO, decodificacion especulativa ni atencion lineal.

## Capacidades

- Generacion de texto autoregresiva, heredada del modelo base OLMo 3 7B; no hay evaluacion especifica publicada para este checkpoint.
- Preentrenamiento continuado sobre un corpus de compasion: el ajuste busca desplazar el comportamiento generativo hacia ese dominio, aunque el autor indica que no se ha demostrado una mejora medible.
- Capacidades de razonamiento, codigo y matematicas: presumiblemente las del base OLMo 3 7B, pero no verificadas en este checkpoint y no documentadas en la informacion disponible.
- Tool calling y function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible; el modelo no declara idiomas en su model card.
- Capacidades multimodales (vision o audio): no disponibles; la tarea declarada es exclusivamente text-generation.
- Modo de razonamiento explicito (thinking mode): no disponible.

## Casos de uso

- Investigacion en alineacion y valores: el checkpoint sirve para estudiar si un CPT sobre un corpus de compasion desplaza el comportamiento generativo y como de estable es ese desplazamiento frente al base; encaja en experimentos con evaluacion propia, no en producto.
- Analisis de olvido catastrofico: al partir de un corpus de solo 10.000 documentos, es un caso util para medir cuanto conocimiento general del base OLMo 3 se degrada tras el ajuste, comparando ambos checkpoints sobre las mismas tareas.
- Reproducibilidad de pipelines CPT: el repo incluye run_manifest.json con hashes de seleccion de documentos e hiperparametros, lo que permite auditar y replicar el flujo de entrenamiento y fusion en BF16.
- Generacion de texto en dominios de apoyo emocional o acompanamiento: con validacion humana previa y sin uso clinico, dado que no existe evidencia publicada de mejora en compasion.
- Base para posteriores ajustes supervisados o DPO: al ser un artefacto fusionado sin adaptador, puede cargarse con transformers y usarse como punto de partida para un SFT especifico.
- Experimentos de fusion y exportacion: sirve como referencia practica del metodo merged_16bit de Unsloth y del empaquetado en ocho shards safetensors validados.
- Evaluacion comparativa entre semillas: la existencia del run hermano BrandonHowe/Olmo7b-compassion-olmo-seed1-20260930-CPT-merged-epoch-4 permite contrastar seed1 y seed2 bajo el mismo protocolo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16: en torno a 14,6 GB solo de pesos, mas overhead de activaciones y cache KV; se recomienda un minimo practico de 18-20 GB de VRAM para contexto corto. Estimacion derivada del numero de parametros, no verificada por el autor.
- VRAM estimada con cuantizacion a 8 bits: aproximadamente 8-9 GB, requiriendo convertir previamente los pesos, ya que el repo solo publica BF16.
- VRAM estimada con cuantizacion a 4 bits: aproximadamente 5-6 GB, tambien previa conversion. Estimacion, no dato publicado.
- GPU recomendadas: A100 40 GB, H100, L40S o RTX 6000 Ada para BF16 sin comprometer contexto. En consumer, una RTX 4090 (24 GB) o RTX 3090 (24 GB) deberia poder cargar el modelo en BF16 para contextos moderados.
- GPU consumer de 8-16 GB: viables solo tras cuantizacion a 4 u 8 bits, que no viene incluida en el repositorio.
- Opciones de despliegue: transformers como via directa (es el formato publicado). vLLM y TGI pueden servir los pesos safetensors BF16. llama.cpp y Ollama requieren una conversion a GGUF no incluida en el repo.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tipo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| BrandonHowe/Olmo7b-compassion-seed2-20261001-CPT-final | 7,3B | no disponible | CPT de dominio sobre OLMo 3 | no disponible | safetensors BF16, 8 shards |
| allenai/Olmo-3-1025-7B (base) | 7,3B (heredado) | no disponible | Transformer decoder-only generalista | no disponible en la informacion proporcionada | safetensors |
| BrandonHowe/Olmo7b-compassion-olmo-seed1-20260930-CPT-merged-epoch-4 | no disponible | no disponible | CPT de dominio, semilla 1, epoca 4 | no disponible | safetensors |
| allenai/OLMo-7B | aproximadamente 7B | no disponible | Transformer decoder-only generalista | no disponible en la informacion proporcionada | safetensors |

No hay datos de rendimiento publicados para ninguno de estos checkpoints en la informacion disponible, por lo que la comparativa se limita a parametros, formato y procedencia.

## Limitaciones y advertencias

- El propio autor indica que el entrenamiento no establece una mejora en compasion y que esa hipotesis debe evaluarse por separado. No debe presentarse como un modelo "mas compasivo" sin evidencia.
- Sesgos conocidos: no documentados para este checkpoint; hereda los del base allenai/Olmo-3-1025-7B, que tampoco se detallan en la informacion disponible.
- Riesgo de alucinacion: no evaluado. Es un riesgo inherente a los modelos generativos y no hay mediciones publicadas para este ajuste.
- Limitaciones de contexto e idioma: no disponibles. La model card no declara ventana de contexto ni idiomas soportados.
- Riesgo de olvido catastrofico: el CPT se realizo sobre un corpus reducido (10.000 documentos distintos por epoca) orientado a un unico dominio, lo que puede degradar capacidades generales del base. Debe compararse contra allenai/Olmo-3-1025-7B antes de usarlo en produccion.
- Restricciones de licencia: la licencia figura como no disponible, por lo que el uso comercial no esta claro y requiere consulta previa al autor y al licenciamiento del modelo base.
- Madurez: cero descargas y cero likes en el momento de la consulta, sin validacion independiente conocida. Es un artefacto experimental.
- Formato: solo se publican pesos BF16 fusionados; no hay GGUF, AWQ ni GPTQ, lo que anade un paso de conversion para despliegues en hardware limitado.
- Uso responsable: cualquier aplicacion en acompanamiento emocional o salud mental exige supervision humana y validacion clinica adicional.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/BrandonHowe/Olmo7b-compassion-seed2-20261001-CPT-final
- Modelo base: https://huggingface.co/allenai/Olmo-3-1025-7B
- Run hermano (seed1, epoca 4): https://huggingface.co/BrandonHowe/Olmo7b-compassion-olmo-seed1-20260930-CPT-merged-epoch-4
- Dataset: https://huggingface.co/datasets/CompassioninMachineLearning/compassion_12185_cleaned
- OLMo-7B original: https://huggingface.co/allenai/OLMo-7B
- Familia OLMo en Open Source AI Models: https://opensourceaimodels.net/families/olmo
- Entrada sobre OLMo en Learn AI: https://ai.miraheze.org/wiki/Olmo
- Run manifest del repositorio: run_manifest.json dentro del propio repositorio de HuggingFace
