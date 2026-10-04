# Sorihon/Chaotic-Harmony-24B

## Resumen

Chaotic-Harmony-24B es un modelo de lenguaje de 23.572.403.200 parametros (aproximadamente 23,5B) publicado por el usuario Sorihon en HuggingFace. No es un modelo entrenado desde cero, sino el resultado de una fusion (merge) de dos modelos preentrenados de la familia Mistral de 24B: TheDrummer/Cydonia-24B-v4.2.0 y la ruta local denominada C:\Chaotic-Order-24B-V3 (derivada de la serie Chaotic-Order del mismo autor), tomando como base Sorihon/Celestial-Order-24B-V3. El objetivo es combinar los sesgos conversacionales y creativos de Cydonia con la orientacion mas instructiva/estructurada de Celestial-Order.

Tecnicamente se trata de un transformer denso (no MoE) de arquitectura Mistral, con pesos en bfloat16 y un tamano de repositorio de 47,2 GB compatibles con la libreria transformers y con text-generation-inference. La fusion se ha realizado con la tecnica DARE TIES, que poda y reescala los deltas de los pesos antes de fusionarlos, lo que permite combinar modelos con distribuciones de parametros distintas reduciendo interferencias.

La relevancia de esta ficha es acotada: el modelo se publico el 4 de octubre de 2026 y, en el momento de redactar, no tiene descargas ni likes registrados, no declara licencia ni idiomas soportados, y no incluye datos de benchmarks. Es, por tanto, un merge experimental de la comunidad, util como punto de partida para evaluaciones propias mas que como modelo listo para produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso de la familia Mistral (tag `mistral`); no se especifica configuracion detallada |
| Parametros totales | 23.572.403.200 (23,5B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible (la model card no la declara; modelos de la misma familia reportan 32.768 tokens) |
| Tipos de cuantizacion | no disponible oficialmente; pesos publicados en bfloat16, convertibles a GGUF/AWQ/GPTQ con herramientas externas |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors |
| Libreria | transformers |
| Tamano del repositorio | 47,2 GB |
| Precision de los pesos | bfloat16 |
| Metodo de creacion | merge DARE TIES con mergekit (arxiv:2311.03099) |
| Modelos fusionados | TheDrummer/Cydonia-24B-v4.2.0 y C:\Chaotic-Order-24B-V3 |
| Modelo base del merge | Sorihon/Celestial-Order-24B-V3 |

## Arquitectura y entrenamiento

Chaotic-Harmony-24B no tiene fase de entrenamiento propia: sus pesos son una combinacion de los pesos ya entrenados de sus modelos de origen. El ensamblaje se realiza con mergekit aplicando DARE TIES (Drop And REscale + Trim, Elect Sign and Merge), un metodo que primero poda los parametros de bajo valor absoluto segun un ratio de densidad, reescala los supervivientes para preservar la magnitud original y despues resuelve los conflictos de signo entre modelos antes de promediar. La configuracion YAML declara `dtype: bfloat16` y `normalize: false`.

Los dos modelos aportados son TheDrummer/Cydonia-24B-v4.2.0 (densidad 0,8, peso 0,6), orientado a conversacion y escritura creativa, y C:\Chaotic-Order-24B-V3 (densidad 0,6, peso 0,4), que introduce la componente instructiva de la serie Chaotic-Order del propio autor. El modelo base declarado es Sorihon/Celestial-Order-24B-V3. Dado que todos los integrantes pertenecen a la familia Mistral de 24B con la misma tokenizacion y dimensiones de capas, la fusion es estructuralmente compatible; no hay innovaciones tecnicas adicionales (no se menciona atencion lineal, decodificacion especulativa ni modos de razonamiento explicito). El tag `arxiv:2311.03099` hace referencia al articulo de DARE TIES, no a un paper propio del modelo.

## Capacidades

- Generacion de texto conversacional multturno, dado el tag `conversational` y la herencia de Cydonia.
- Instrucciones generales y respuestas en formato asistente, por la componente Celestial-Order/Chaotic-Order.
- Redaccion creativa y narrativa, capacidad tipica de los merges basados en Cydonia.
- Compatibilidad con text-generation-inference y endpoints compatibles (tags `text-generation-inference` y `endpoints_compatible`).
- Soporte de tool calling / function calling: no disponible (no se declara en la model card).
- Soporte de agentes y razonamiento multi-paso: no disponible (no se declara).
- Capacidades de vision, audio o modo "thinking": no declaradas.
- Cobertura multilingue: no disponible (el campo de idiomas esta vacio).

## Casos de uso

- Asistente conversacional de proposito general: por su herencia de Cydonia, el modelo esta optimizado para dialogos largos y tono natural, adecuado para prototipos de chatbot antes de decidir si merece un modelo con licencia y benchmarks verificados.
- Generacion de contenido creativo y narrativo: redaccion de relatos, guiones y textos de ficcion, el caso de uso principal para el que estos merges suelen afinarse.
- Experimentacion en investigacion de merges: sirve como caso practico para reproducir la receta DARE TIES con la configuracion publicada (densidades 0,8 y 0,6, pesos 0,6 y 0,4) y medir el efecto en tareas concretas.
- Base para fine-tuning especifico de dominio: al ser un denso Mistral de 24B con safetensors, se puede afinar con LoRA o QLoRA sobre datasets propios usando transformers o Unsloth.
- Evaluacion comparativa interna: util para contrastar contra Celestial-Order-24B-V3 y Cydonia-24B-v4.2.0 por separado y decidir cual conservar en un pipeline.
- Generacion de texto por lotes offline: tareas de sintesis de texto, parafraseo o resumen donde la latencia no es critica y se despliega con vLLM o llama.cpp.
- Chat local en hardware de consumo: cuantizado a 4 bits cabe en GPUs de 24 GB, lo que permite usarlo como asistente de escritorio con Ollama o LM Studio (previa conversion a GGUF).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card de Sorihon/Chaotic-Harmony-24B no incluye tablas de MMLU, HumanEval, GSM8K ni ninguna otra metrica, y tampoco los modelos de origen declaran resultados en la informacion recopilada. Cualquier cifra de rendimiento para este merge tendria que obtenerse mediante evaluacion propia.

## Requisitos de hardware

- VRAM estimada para inferencia (23,5B parametros): aproximadamente 47 GB en bfloat16/fp16 (los pesos del repo ocupan 47,2 GB), unos 24 GB en cuantizacion de 8 bits y unos 12-14 GB en 4 bits (mas overhead de KV cache segun contexto).
- GPU recomendadas: para precision completa, A100 80 GB, H100 80 GB o un par de GPUs de 24-48 GB con tensor parallelism; para 8 bits, una A100 40 GB o RTX 6000 Ada; para 4 bits, una unica RTX 4090 o RTX 3090 de 24 GB.
- Compatibilidad con GPU de consumo: si, en cuantizacion de 4 bits cabe en RTX 4090, RTX 3090 y tarjetas con 24 GB o mas. En bfloat16 no cabe en ninguna GPU de consumo de una sola pieza.
- Opciones de despliegue: text-generation-inference (tag oficial del repo), vLLM, transformers, y llama.cpp/Ollama/LM Studio previa conversion a GGUF, ya que el repositorio solo publica safetensors.
- Latencia y throughput estimados: no disponible; no se han publicado mediciones y dependeran del hardware, la cuantizacion y la longitud de contexto.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Sorihon/Chaotic-Harmony-24B | 23,5B | no disponible (familia reporta 32.768) | no disponible | safetensors, transformers | Merge DARE TIES de Cydonia-24B-v4.2.0 y Chaotic-Order-24B-V3 |
| TheDrummer/Cydonia-24B-v4.2.0 | ~24B | no disponible en la informacion recopilada | no disponible | safetensors | Modelo de origen, orientado a rol y creatividad |
| Sorihon/Celestial-Order-24B-V3 | ~24B | no disponible en la informacion recopilada | no disponible | safetensors | Modelo base del merge |
| Sorihon/Chaotic-Order-24B-V1 | ~24B | 32.768 tokens | no disponible | safetensors | Predecesor de la familia; fusion de Naphula/Goetia-24B-v1.4 con un base local |

Los modelos de la familia Chaotic-Order (V1, V2) comparten autor, tamano y metodo de creacion, pero no se dispone de benchmarks que permitan comparar su calidad de forma objetiva.

## Limitaciones y advertencias

- Ausencia total de benchmarks: no hay evidencia publicada de rendimiento, por lo que no se puede afirmar que supere a sus modelos de origen ni a alternativas de su tamano.
- Licencia no declarada: al no especificarse licencia, no hay garantia juridica de uso comercial. Conviene contactar con el autor o asumir que no es apto para produccion hasta aclararlo.
- Idiomas no declarados: no se sabe si el modelo mantiene un multilingue equilibrado o si esta sesgado hacia el ingles, idioma dominante en los datasets de Cydonia y los merges de la comunidad.
- Riesgo de alucinacion: inherente a los modelos de 24B sin RLHF/DPO verificable; la model card no menciona alineamiento de seguridad, filtros ni evaluaciones de veracidad.
- Sesgos: los merges de modelos conversacionales de la comunidad tienden a heredar sesgos de sus fuentes (tono roleplay, contenido no moderado), sin que se haya documentado mitigacion.
- Contexto no confirmado: aunque la familia reporta 32.768 tokens en versiones anteriores, no esta garantizado para este modelo concreto; verificar antes de disenar flujos con contexto largo.
- Modelo con 0 descargas y 0 likes: sin validacion de la comunidad, sin issues resueltos y con fecha de publicacion muy reciente.
- Repositorio solo en safetensors: no hay GGUF ni cuantizaciones oficiales, por lo que el despliegue en hardware de consumo requiere conversion manual.
- Ruta local en la configuracion del merge: el YAML incluye una ruta Windows (C:\Chaotic-Order-24B-V3) en lugar de un identificador de HuggingFace, lo que dificulta la reproducibilidad exacta de la fusion.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Sorihon/Chaotic-Harmony-24B
- Modelo base del merge: https://huggingface.co/Sorihon/Celestial-Order-24B-V3
- Modelo fusionado: https://huggingface.co/TheDrummer/Cydonia-24B-v4.2.0
- Familia Chaotic-Order (V2): https://huggingface.co/Sorihon/Chaotic-Order-24B-V2
- Familia Chaotic-Order (V1): https://huggingface.co/Sorihon/Chaotic-Order-24B-V1
- Paper DARE TIES: https://arxiv.org/abs/2311.03099
- Repositorio mergekit: https://github.com/cg123/mergekit
- Ficha en featherless.ai (familia Chaotic-Order): https://featherless.ai/models/Sorihon/Chaotic-Order-24B-V2
- Ficha en LLM Explorer (familia Chaotic-Order): https://llm-explorer.com/model/Sorihon%2FChaotic-Order-24B-V1,7ohFMGIVKeVv5YiHlYgUgV
