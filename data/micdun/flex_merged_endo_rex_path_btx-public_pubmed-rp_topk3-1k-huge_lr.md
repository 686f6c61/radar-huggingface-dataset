# micdun/flex_merged_endo_rex_path_btx-public_pubmed-rp_topk3-1k-huge_lr

## Resumen

`micdun/flex_merged_endo_rex_path_btx-public_pubmed-rp_topk3-1k-huge_lr` es un modelo de pesos abiertos publicado en HuggingFace por el usuario `micdun` el 17 de septiembre de 2026, con unos 12.320.990.464 parametros totales (aproximadamente 12,3 mil millones) y un repositorio de 24,7 GB. La etiqueta de arquitectura declarada por el autor es `flex_qwen2_5_vl_moe`, lo que situa al modelo en la familia de arquitecturas de mezcla de expertos (MoE) derivadas de Qwen2.5-VL, es decir, con capacidad multimodal de vision y lenguaje. El nombre del repositorio sugiere un proceso de fusion de pesos (merged) orientado a dominios cientifico-medicos (terminos como endo, path y pubmed), aunque esta interpretacion procede unicamente de la nomenclatura y no de documentacion oficial.

El modelo apenas ha recibido atencion: 71 descargas y 0 likes en el momento de redactar esta ficha, y no incluye pipeline declarado, licencia, idiomas ni resultados de evaluacion en la informacion disponible. Se trata, por tanto, de un artefacto experimental de investigacion mas que de un modelo listo para produccion.

Su relevancia actual es limitada pero puede interesar a quienes investigan fusion de modelos MoE multimodales en el ambito biomedico, siempre que asuman la ausencia total de documentacion, licencia explicita y garantias de calidad. La ficha que sigue refleja estrictamente los datos disponibles y marca como "no disponible" todo aquello que no se puede verificar.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE multimodal (etiqueta `flex_qwen2_5_vl_moe`, derivada de Qwen2.5-VL) |
| Parametros totales | 12.320.990.464 (aprox. 12,3 B) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (solo se declaran pesos en safetensors de precision completa) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La unica informacion fiable sobre la arquitectura es la etiqueta `flex_qwen2_5_vl_moe`, que indica una mezcla de expertos (MoE) construida sobre la base multimodal Qwen2.5-VL. Esto implica un transformer con atencion completa y un modulo de vision para procesar imagenes, combinado con enrutamiento por expertos en lugar del MLP denso habitual. No se dispone de informacion sobre el numero de expertos, el numero de expertos activos por token, la estrategia de enrutamiento ni la dimension de cada experto.

Tampoco hay datos publicados sobre el proceso de entrenamiento: numero de tokens, composicion del dataset, uso de RLHF o DPO, o cualquier innovacion tecnica. El nombre del repositorio incluye indicios de un proceso de fusion de pesos (`merged`), enrutamiento `topk3` y una tasa de aprendizaje elevada (`huge_lr`), asi como referencias a dominios medicos (`endo`, `path`, `pubmed`, `btx`), pero se trata de inferencias a partir del identificador y no de hechos documentados. No debe asumirse ninguna de estas caracteristicas sin verificacion directa por parte del autor.

## Capacidades

- Generacion de texto y procesamiento de lenguaje: capacidad esperada por su base Qwen2.5-VL, aunque no verificada.
- Vision por computador multimodal: la etiqueta de arquitectura incluye `vl`, lo que sugiere entrada de imagenes, si bien no se documenta el alcance real.
- Razonamiento y conocimiento cientifico-medico: posiblemente orientado a ese dominio segun el nombre del repositorio, sin confirmacion.
- Soporte de tool calling y function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible.
- Modo de razonamiento explicito (thinking mode), audio u otras capacidades especiales: no disponible.

## Casos de uso

Dada la ausencia de documentacion, licencia y evaluacion, los casos de uso son hipoteticos y requieren validacion previa por parte de quien los adopte:

- Investigacion en fusion de modelos MoE: el artefacto puede servir como referencia para estudiar como se comporta una fusion de pesos sobre una base Qwen2.5-VL con enrutamiento por expertos, comparando la perdida de capacidades frente al modelo original.
- Experimentacion academica en IA biomedica: si el nombre refleja realmente una especializacion en dominios clinicos (endoscopia, patologia, literatura PubMed), podria emplearse en entornos de laboratorio para tareas de clasificacion o resumen de texto medico, siempre con supervision experta.
- Analisis de documentos cientificos: en un escenario exploratorio, el modelo podria resumir articulos o extraer entidades de literatura biomedica, condicionado a que su ventana de contexto y su calidad lo permitan (ambas sin verificar).
- Prototipado de asistentes clinicos de investigacion: uso interno en un grupo de investigacion para generar borradores sobre casos o articulos, nunca como herramienta de decision clinica.
- Evaluacion comparativa de tecnicas de merging: util como sujeto de prueba en estudios sobre tecnicas de fusion (task arithmetic, model soup, TIES, DARE) aplicadas a modelos multimodales.
- Reproducibilidad y auditoria de artefactos de HuggingFace: sirve como caso de estudio sobre modelos publicados sin licencia ni documentacion, relevante para quienes investigan gobernanza de modelos abiertos.
- Base para fine-tuning posterior: podria actuar como punto de partida para ajuste supervisado en una tarea concreta, asumiendo que la licencia (no disponible) lo permita, lo cual es actualmente un bloqueo legal.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (calculada a partir de 12,3 B de parametros, sin confirmar el numero de parametros activos): en FP16/BF16, alrededor de 24-25 GB solo para pesos, mas overhead de activaciones y cache KV; en INT8, unos 12-13 GB; en INT4, unos 6-7 GB.
- GPU recomendadas para precision completa: A100 40/80 GB, H100, L40S o A6000. Para cuantizacion INT8/INT4 podria bastar una RTX 4090 (24 GB) o una RTX 3090.
- Compatibilidad con GPU de consumo: probable en cuantizacion INT4 sobre RTX 4090, 3090 o 4080 de 16 GB, condicionado a que existan pesos cuantizados publicados (no disponibles actualmente en el repositorio).
- Opciones de despliegue: al no existir pesos GGUF ni documentacion de pipeline, no se puede confirmar compatibilidad con vLLM, llama.cpp, Ollama o TGI. El soporte de MoE y vision en estos motores depende de la implementacion concreta de la arquitectura `flex_qwen2_5_vl_moe`, que no se detalla.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

La comparacion se limita a caracteristicas estructurales verificables, dado que no existen datos de rendimiento para el modelo analizado.

| Modelo | Parametros | Contexto | Multimodal | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| micdun/flex_merged_endo_rex_path_btx-public_pubmed-rp_topk3-1k-huge_lr | 12,3 B (MoE) | no disponible | Si (segun etiqueta) | no disponible | HuggingFace, 71 descargas |
| Qwen2.5-VL-7B | 7 B (denso) | 128k (segun documentacion publica del autor original) | Si | Apache-2.0 (segun documentacion publica) | Ampliamente disponible |
| Qwen2.5-VL-32B | 32 B (denso) | 128k (segun documentacion publica del autor original) | Si | Apache-2.0 (segun documentacion publica) | Ampliamente disponible |

Nota: los datos de los modelos Qwen2.5-VL corresponden a la documentacion publica de sus autores y se incluyen solo como referencia estructural; no se dispone de una comparacion de rendimiento directa con el modelo analizado.

## Limitaciones y advertencias

- Licencia no disponible: no se puede determinar si el uso comercial esta permitido. En ausencia de licencia explicita, debe tratarse como uso restringido hasta que el autor la aclare.
- Ausencia total de documentacion: no hay model card, paper, repositorio de codigo ni explicacion del proceso de fusion o entrenamiento.
- Riesgo elevado de alucinacion en dominios medicos: cualquier uso en contextos clinicos o cientificos sin validacion experta es peligroso, y el propio nombre sugiere un ambito donde los errores tienen consecuencias graves.
- Idiomas no declarados: se desconoce si el modelo conserva capacidades multilingues o si la fusion las ha degradado.
- Posible degradacion por merging: las fusiones de pesos pueden provocar perdida de capacidades o interferencias entre expertos; no hay evaluacion que lo descarte.
- Contexto desconocido: no se puede planificar su uso en tareas de contexto largo sin conocer la ventana real.
- Sesgos: no evaluados ni documentados; los sesgos heredados de los datos de PubMed y de la base Qwen2.5-VL no estan caracterizados.
- Reproducibilidad: sin licencia, sin codigo y sin datos de entrenamiento, el modelo no es auditable ni reproducible.
- Madurez: 71 descargas y 0 likes indican ausencia de validacion por parte de la comunidad.

## Enlaces

- HuggingFace: https://huggingface.co/micdun/flex_merged_endo_rex_path_btx-public_pubmed-rp_topk3-1k-huge_lr
- No se han encontrado papers, blogs, repositorios ni demos asociados en la busqueda web realizada.
