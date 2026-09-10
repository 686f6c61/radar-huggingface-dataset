# CompassioninMachineLearning/qwen3-8b-medai-cpt

## Resumen

qwen3-8b-medai-cpt es un modelo de lenguaje denso de 8.190.735.360 parámetros (8,19 mil millones) desarrollado por CompassioninMachineLearning. No se trata de un modelo nuevo entrenado desde cero, sino de un *continued pre-training* (etiquetado por el autor como *mid-training*) aplicado sobre `Qwen/Qwen3-8B-Base`. El objetivo declarado es adaptar el modelo base a un corpus de documentos de investigación del dominio médico (dataset `pretraining_research_documents_medai`), es decir, desplazar la distribución del modelo hacia vocabulario, estilo y estructuras propias de la literatura biomédica en inglés.

Técnicamente, el artefacto publicado es el resultado de fusionar un adaptador rsLoRA (rank 128, alpha 64) entrenado sobre una base cuantizada a 4 bits con los pesos completos en BF16 del modelo base original, empleando la operación de merge segura de PEFT. Además del adaptador, se sustituyen por completo las matrices `embed_tokens` y `lm_head`. El checkpoint seleccionado es el paso 750, descrito por el autor como el mejor checkpoint de validación de esa ejecución, con una pérdida de validación en tiempo de entrenamiento de 1,2268945.

Su relevancia es acotada y de carácter experimental: el repositorio registra 0 descargas y 0 *likes*, no publica benchmarks de evaluación y el autor advierte explícitamente de que la pérdida de validación del entrenamiento no constituye una evaluación del export en BF16. Es, por tanto, un artefacto de investigación útil para estudiar adaptación de dominio y *catastrophic forgetting*, no un modelo listo para producción sin trabajo adicional.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (arquitectura y configuracion de Qwen/Qwen3-8B-Base) |
| Parametros totales | 8.190.735.360 (8,19 mil millones) |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible en la informacion aportada; se hereda la configuracion del base Qwen/Qwen3-8B-Base |
| Tipos de cuantizacion | Pesos publicados en BF16; no se han publicado cuantizaciones GGUF, AWQ, GPTQ ni FP8 en la informacion disponible |
| Idiomas soportados | en (ingles), segun la model card |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (bfloat16) |
| Tamano del repositorio | 16,4 GB |
| Modelo base | Qwen/Qwen3-8B-Base (revision 49e3418fbbbca6ecbdf9608b4d22e5a407081db4) |
| Dataset de entrenamiento | CompassioninMachineLearning/pretraining_research_documents_medai (revision 06248aa) |
| Checkpoint seleccionado | paso 750 |
| Perdida de validacion en entrenamiento | 1,2268945 |
| Configuracion del adaptador | rsLoRA, rank 128, alpha 64, base de entrenamiento en 4 bits |
| Biblioteca | transformers |
| Pipeline | text-generation |

## Arquitectura y entrenamiento

El modelo conserva la arquitectura del transformer decoder-only de Qwen3-8B-Base, incluida su configuracion y su tokenizador (el checkpoint usa el tokenizador del paso 750). La intervencion consiste en un *continued pre-training* sobre el corpus CaML `pretraining_research_documents_medai`: se entrena un adaptador rsLoRA de rank 128 y alpha 64 sobre una version del modelo base cuantizada a 4 bits, y posteriormente ese adaptador se fusiona en los pesos BF16 originales mediante la operacion de merge segura de PEFT. Ademas del adaptador, se reemplazan integramente las matrices `embed_tokens` y `lm_head` por las versiones totalmente entrenadas, lo que implica que el vocabulario de salida y las representaciones de entrada tambien se han ajustado durante el proceso.

El autor no documenta el numero total de tokens vistos, la composicion detallada del dataset, ni si hubo etapas de RLHF, DPO o cualquier otro tipo de alineacion. Tampoco se describe ninguna innovacion arquitectonica propia: no hay decodificacion especulativa, atencion lineal ni capas hibridas anadidas. El repositorio publicado es una copia en servidor de `ganscs/Qwen3-8b-qwen-h100-20260909-CPT-merged-step-750`, y el autor afirma que pesos, tokenizador y manifiestos son identicos byte a byte a esa subida. La validacion realizada incluye comprobar que todos los tensores del adaptador se consumieron, que los tensores de salida son finitos y coinciden en nombres y formas con la arquitectura de Transformers, y que el modelo carga sin PEFT y produce logits finitos y una generacion greedy corta. Es un export solo de pesos, sin estado del optimizador.

## Capacidades

- Generacion de texto autoregresiva en ingles, con la distribucion ajustada hacia documentos de investigacion de ambito medico.
- Adaptacion de dominio: el ajuste busca mejorar la familiaridad con terminologia, nomenclatura y estilo de la literatura biomedica y de investigacion.
- Modelo base puro: no hay evidencia documentada de ajuste por instrucciones, por lo que la capacidad de seguir ordenes conversacionales no esta garantizada pese a la etiqueta `conversational` presente en los tags.
- *Tool calling* / *function calling*: no documentado; al derivar de un modelo base sin post-entrenamiento por instrucciones, no se debe asumir soporte nativo.
- Agentes y razonamiento multi-paso: no documentado.
- Capacidades multilingues: la model card declara unicamente `en`; no se documenta soporte de castellano ni de otros idiomas.
- Vision, audio o multimodalidad: no disponible; el pipeline declarado es exclusivamente `text-generation`.
- Modo *thinking* explicito: no documentado. La familia Qwen3 incorpora modos de razonamiento en sus variantes post-entrenadas, pero esta ficha no aporta evidencia de ello para este artefacto.
- Compatibilidad de despliegue: los tags incluyen `text-generation-inference` y `endpoints_compatible`, lo que sugiere compatibilidad con TGI e Inference Endpoints.

## Casos de uso

- Punto de partida para ajuste supervisado en dominios clinicos: al haber sido preentrenado sobre literatura medica, sirve como inicializacion para tareas posteriores de instrucciones o clasificacion en ese dominio, reduciendo el volumen de datos especificos necesario frente a partir del base generico.
- Investigacion sobre adaptacion de dominio: permite medir cuanto se desplaza un modelo de 8B hacia un corpus especializado tras 750 pasos de *continued pre-training* con rsLoRA, y compararlo contra el base sin ajustar.
- Estudio de olvido catastrofico: util para cuantificar la perdida de capacidades generales de Qwen3-8B-Base tras el preentrenamiento adicional sobre un corpus estrecho, comparando ambos checkpoints con el mismo conjunto de evaluacion.
- Generacion de texto en ingles sobre literatura biomedica en pipelines de investigacion: con decodificacion greedy o sampling controlado, el modelo puede completar fragmentos de estilo academico, siempre con revision humana dado su caracter experimental.
- Base para sistemas de recuperacion aumentada (RAG) tras un ajuste por instrucciones: el conocimiento de dominio embebido en los pesos complementa la recuperacion documental, aunque requiere una fase de instruction tuning previa para gestionar dialogos.
- Reproducibilidad de experimentos de *mid-training*: el repositorio incluye `merge_manifest.json` con sumas de verificacion de shards, `validation.json` con el *smoke test* y `training_manifest.json` con la configuracion del experimento original, lo que lo hace adecuado como caso de estudio de trazabilidad en investigacion.
- Comparativa de estrategias de fusion (merge) de adaptadores: el artefacto permite verificar si la fusion de un adaptador entrenado sobre base en 4 bits en un modelo BF16 preserva el comportamiento del checkpoint original.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El unico dato numerico aportado es la perdida de validacion en tiempo de entrenamiento del checkpoint de origen, 1,2268945 en el paso 750. El propio autor advierte de que esa cifra corresponde al proceso de entrenamiento del adaptador y no constituye una evaluacion del export fusionado en BF16.

| Metrica | Valor | Notas |
|---|---|---|
| MMLU | no disponible | Sin datos publicados |
| HumanEval | no disponible | Sin datos publicados |
| GSM8K | no disponible | Sin datos publicados |
| Perdida de validacion (entrenamiento, paso 750) | 1,2268945 | No es una evaluacion del export BF16, segun el autor |

## Requisitos de hardware

- VRAM en BF16: los pesos ocupan aproximadamente 16,4 GB. Sumando activaciones y cache KV, la inferencia realista requiere del orden de 20-24 GB de VRAM, mas cuanto mayor sea la longitud de contexto.
- VRAM en cuantizacion INT8: aproximadamente 9-10 GB de pesos, por lo que un total de 12-14 GB suele ser suficiente para contextos moderados (estimacion, no publicada por el autor).
- VRAM en cuantizacion INT4/GGUF Q4: aproximadamente 5-6 GB de pesos; cabria en GPUs de 8-12 GB con contexto reducido (estimacion, no publicada por el autor).
- GPUs recomendadas: A100 40 GB o 80 GB, H100 80 GB y L40S 48 GB para BF16 en produccion; RTX 4090 o RTX 3090 de 24 GB admiten BF16 pero con margen muy ajustado para el contexto.
- Cabe en GPU de consumo: si, en RTX 4090, RTX 3090 o RTX 4080 siempre que se recurra a cuantizacion (INT8/INT4). En BF16 en una GPU de 24 GB el margen es minimo.
- Opciones de despliegue: Transformers con `AutoModelForCausalLM.from_pretrained(..., dtype=torch.bfloat16, device_map="auto")` (metodo documentado por el autor), vLLM y TGI (el tag `text-generation-inference` esta presente). Para llama.cpp u Ollama seria necesaria una conversion a GGUF que no se ha publicado.
- Latencia y throughput estimados: no disponible.
- Nota: dado que no se publican cuantizaciones oficiales, cualquier version INT4/INT8/GGUF deberia generarse y validarse localmente, verificando que el tokenizador del checkpoint se utiliza correctamente.

## Comparativa con modelos similares

Los datos de contexto y licencia de los modelos comparativos proceden de su documentacion publica y se incluyen como referencia; no forman parte de la informacion aportada sobre este modelo, por lo que conviene verificarlos antes de tomar decisiones.

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| qwen3-8b-medai-cpt | 8,19 mil millones | no disponible | apache-2.0 | HuggingFace, 0 descargas | Modelo base con *continued pre-training* en dominio medico; sin benchmarks publicados |
| Qwen/Qwen3-8B-Base | 8,2 mil millones (aprox.) | 32.768 nativos (ampliable segun documentacion publica de Qwen3) | apache-2.0 | Amplia adopcion | Modelo base original sin ajuste de dominio; referencia directa para medir el efecto del CPT |
| Qwen/Qwen3-8B | 8,2 mil millones (aprox.) | 32.768 nativos (ampliable segun documentacion publica de Qwen3) | apache-2.0 | Amplia adopcion | Variante post-entrenada: sigue instrucciones y soporta modos de razonamiento; no adaptada a dominio medico |
| Llama-3.1-8B | 8 mil millones (aprox.) | 131.072 segun documentacion publica de Meta | Licencia comunitaria Llama 3.1 | Amplia adopcion | Alternativa de tamano similar, con licencia mas restrictiva que Apache-2.0 y sin adaptacion al dominio medico |

## Limitaciones y advertencias

- Es un modelo base, no un modelo ajustado por instrucciones: no cabe esperar que siga ordenes, mantenga formato conversacional ni respete plantillas de chat sin un ajuste posterior.
- La etiqueta `conversational` aparece en los tags del repositorio, pero la model card no documenta ningun ajuste conversacional ni plantilla de chat, por lo que esa etiqueta no debe tomarse como garantia funcional.
- Idioma unico declarado: ingles. No hay soporte documentado de castellano ni de otras lenguas.
- Riesgo de alucinacion elevado en contenido medico. El modelo no debe usarse para decisiones clinicas, diagnostico ni asesoramiento sanitario sin validacion experta y auditoria especifica.
- La perdida de validacion de 1,2268945 procede del entrenamiento del adaptador y el autor advierte explicitamente de que no es una evaluacion del export BF16 fusionado. No existen benchmarks de ningun tipo sobre el artefacto publicado.
- No se documenta la composicion del dataset de entrenamiento, ni su filtrado, ni la procedencia o licencia de los documentos que lo integran. Esto traslada un riesgo legal al usuario que lo explote comercialmente, incluso aunque los pesos se distribuyan bajo Apache-2.0.
- Riesgo de olvido catastrofico no cuantificado: el ajuste sobre un corpus estrecho de un solo dominio puede degradar capacidades generales del base, y no se aportan mediciones al respecto.
- El autor entrenó el adaptador sobre una base cuantizada a 4 bits y lo fusiono en el modelo BF16. El propio repositorio reconoce que esto puede introducir diferencias frente a un entrenamiento directo en BF16.
- Estado de validacion minimo: la verificacion descrita se limita a un *smoke test* (tensores finitos, nombres y formas correctos, una generacion greedy corta). No hay evaluacion funcional ni de calidad.
- Repositorio con 0 descargas, 0 *likes* y sin revisión por parte de la comunidad: no hay evidencia externa de que el artefacto funcione como se describe.
- Es una copia en servidor de otro repositorio (`ganscs/...`). Conviene verificar las sumas de `merge_manifest.json` antes de confiar en la integridad de los pesos.
- Export solo de pesos: no incluye estado del optimizador, por lo que no es reanudable tal cual para continuar el entrenamiento.
- Uso comercial: tecnicamente permitido por Apache-2.0, pero condicionado por las incognitas sobre las licencias de los datos de entrenamiento.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/CompassioninMachineLearning/qwen3-8b-medai-cpt
- Modelo base: https://huggingface.co/Qwen/Qwen3-8B-Base
- Dataset de entrenamiento: https://huggingface.co/datasets/CompassioninMachineLearning/pretraining_research_documents_medai
- Repositorio de origen (copia en servidor): https://huggingface.co/ganscs/Qwen3-8b-qwen-h100-20260909-CPT-merged-step-750
- Checkpoints del adaptador LoRA: https://huggingface.co/ganscs/Qwen3-8b-qwen-h100-20260909-CPT-LoRA-checkpoints/tree/1586e45fc7c3f7d5e601dc454ba7e15884a2f1df/checkpoint-750
- Manifiesto de fusion y sumas de verificacion: `merge_manifest.json` en el repositorio del modelo
- Registro del *smoke test*: `validation.json` en el repositorio del modelo
- Configuracion del experimento original: `training_manifest.json` en el repositorio del modelo
- Paper, blog o demo adicionales: no disponible. Las busquedas web realizadas no devolvieron ningun resultado relacionado con este modelo; los unicos enlaces recuperados tratan sobre el recurso "SAM" del videojuego Satisfactory y no guardan relacion con esta ficha.
