# OVHaiLLM/Olala-v1.0-translate

## Resumen

Olala-v1.0-translate es un modelo de traduccion automatica especializado en documentos financieros, desarrollado por OVHaiLLM (OVHcloud) y publicado como un fine-tune de Olala-v1.0-mini-7A1B. El modelo parte de una arquitectura hibrida con componentes Mamba y Mixture of Experts (MoE), con 6.773 millones de parametros totales almacenados en safetensors, y esta orientado a la traduccion controlable entre 18 idiomas, con enfasis en textos regulatorios, informes anuales, fichas de fondos y prospectos.

La propuesta diferencial del modelo es la controlabilidad terminologica: acepta un mapeo de terminologia proporcionado por el usuario, se adapta al dominio del documento y preserva el formato (mayusculas y etiquetas en linea), lo que resulta critico en traduccion financiera donde los terminos deben ser consistentes y auditables. Segun la model card, alcanza 62,6 BLEU en DOLFIN ingles-frances (8,6 puntos por delante del siguiente modelo comparado), el mejor COMET-22 (88,0) en texto periodistico y financiero, y queda a menos de 0,3 BLEU del mejor en noticias WMT.

El modelo se distribuye con licencia Apache 2.0, lo que facilita su uso comercial, y esta disponible tanto en Hugging Face como a traves de los AI Endpoints de OVHcloud. Su relevancia actual radica en cubrir un nicho poco atendido por los modelos generalistas: la traduccion de alta fidelidad en el dominio financiero multilingue, con control explicito de terminologia y formato.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Hibrida Mamba + MoE (transformer hibrido, segun tags del modelo) |
| Parametros totales | 6.773.124.144 (6,77 mil millones) |
| Parametros activos | no disponible (la nomenclatura "7A1B" del modelo base sugiere 7 mil millones totales y 1 mil millones activos, pero no se confirma en la informacion disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | 18: en, fr, de, es, it, nl, pt, sv, da, no, fi, pl, cs, ru, ar, zh (simplificado y tradicional), ja, ko |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (libreria transformers, custom_code) |

## Arquitectura y entrenamiento

El modelo se basa en Olala-v1.0-mini-7A1B, descrito en la model card como un modelo hibrido con componentes Mamba y MoE. El modelo base fue preentrenado con 12,8 billones (12,8T) de tokens, seguido de un proceso de supervised fine-tuning (SFT) y un posterior post-entrenamiento con RL que dio lugar al modelo final de razonamiento, chat y uso de herramientas. Olala-v1.0-translate es un fine-tune especializado de ese modelo final, orientado especificamente a traduccion automatica, incluyendo documentos financieros.

La informacion disponible no detalla la composicion exacta del dataset de fine-tuning, el numero de tokens de traduccion utilizados ni si se emplearon tecnicas como DPO o RLHF especificas para la tarea de traduccion. Tampoco se especifican innovaciones tecnicas adicionales como decodificacion especulativa o atencion lineal mas alla de la arquitectura hibrida Mamba+MoE heredada del modelo base. La model card si destaca la capacidad de seguir un mapeo de terminologia proporcionado por el usuario, adaptarse al dominio del documento y preservar mayusculas y etiquetas en linea, lo que sugiere un entrenamiento orientado a la fidelidad de formato y consistencia terminologica.

## Capacidades

- Traduccion automatica multilingue entre 18 idiomas, con cobertura de lenguas europeas, arabe, chino simplificado y tradicional, japones y coreano.
- Traduccion controlable mediante mapeo de terminologia proporcionado por el usuario, lo que permite imponer glosarios y traducciones consistentes de terminos tecnicos o regulatorios.
- Adaptacion al dominio del documento: informes anuales, fichas de fondos, prospectos y textos regulatorios.
- Preservacion de mayusculas y etiquetas en linea durante la traduccion, util para documentos con formato estructurado.
- Especializacion en documentos financieros, con rendimiento destacado en DOLFIN y textos financieros segun la model card.
- Capacidades heredadas del modelo base (razonamiento, chat y uso de herramientas) presentes en la familia Olala-v1.0-mini-7A1B, aunque la model card de esta variante se centra en traduccion.
- Soporte de generacion de texto via pipeline text-generation con transformers.

## Casos de uso

- Traduccion de informes anuales y memorias financieras: el modelo puede traducir documentos corporativos extensos preservando la terminologia contable y las etiquetas de formato, gracias a su especializacion en dominio financiero y a la preservacion de mayusculas y etiquetas en linea.
- Localizacion de prospectos y fichas de fondos: permite imponer un glosario de terminos regulatorios por producto, asegurando consistencia entre idiomas en documentos sujetos a supervision financiera.
- Traduccion de textos regulatorios multilingues: con 18 idiomas soportados, incluidos arabe, chino, japones y coreano, es adecuado para entidades que deben publicar documentacion regulatoria en multiples jurisdicciones.
- Atencion al cliente financiera multilingue: puede traducir conversaciones y respuestas entre cliente y entidad, manteniendo terminologia consistente mediante el mapeo de terminologia configurable.
- Enriquecimiento de bases de conocimiento internas: traduccion de documentacion financiera interna entre las lenguas del grupo (por ejemplo, de frances a espanol, aleman o italiano) preservando el formato original.
- Pipelines de publicacion de contenido financiero: integracion en flujos editoriales donde se requiere traduccion con control de glosario y conservacion de etiquetas HTML o marcado en linea.
- Traduccion de noticias y contenido periodistico economico: la model card reporta el mejor COMET-22 (88,0) en texto periodistico y financiero, lo que lo hace adecuado para medios especializados.

## Benchmarks y rendimiento

| Benchmark | Resultado | Notas |
|---|---|---|
| DOLFIN en-fr (BLEU) | 62,6 | 8,6 puntos por delante del siguiente modelo comparado, segun la model card |
| COMET-22 (noticias y texto financiero) | 88,0 | Mejor puntuacion entre los modelos comparados, segun la model card |
| WMT noticias (BLEU) | a menos de 0,3 BLEU del mejor | Sin cifra absoluta publicada en la informacion disponible |

No se han publicado en la informacion disponible resultados de benchmarks generales como MMLU, HumanEval o GSM8K para esta variante.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Como referencia orientativa, un modelo de 6,77 mil millones de parametros en precision FP16 requiere aproximadamente 13,5 GB solo para pesos, mas overhead de activaciones y cache KV; en cuantizacion de 8 bits rondaria 7-8 GB y en 4 bits unos 4-5 GB, aunque estos valores no estan confirmados por el autor.
- GPU recomendadas: no especificadas por el autor. Por tamano, una A100 (40/80 GB), H100 o L40S son adecuadas para FP16; una RTX 4090 (24 GB) puede alojar el modelo en FP16 con margen limitado o en cuantizacion de 8 bits.
- Cabe en GPU de consumo: probablemente en RTX 4090 (24 GB) en FP16 con contexto moderado, y en GPUs de 16-24 GB con cuantizacion; no confirmado por el autor.
- Opciones de despliegue: transformers (libreria indicada, con custom_code); no se confirma soporte de vLLM, llama.cpp, Ollama o TGI en la informacion disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Olala-v1.0-translate | 6,77 mil millones | no disponible | Traduccion financiera controlable, 18 idiomas | Apache 2.0 | Hugging Face, OVHcloud AI Endpoints |
| Olala-v1.0-summarise | no disponible | no disponible | Resumen de documentos | Apache 2.0 | Hugging Face |
| Olala-v1.0-mini-7A1B | 7A1B (segun nomenclatura) | no disponible | Razonamiento, chat y tool use | Apache 2.0 | Hugging Face |
| Modelos de traduccion generalistas | no disponible | no disponible | Traduccion multilingue general | variable | no disponible |

La model card menciona comparaciones con modelos competidores en DOLFIN, COMET-22 y WMT, pero no identifica sus nombres ni proporciona sus especificaciones en la informacion disponible.

## Limitaciones y advertencias

- El modelo esta especializado en traduccion, especialmente financiera; su uso para otras tareas (razonamiento general, codigo) no esta validado en esta variante.
- No se detallan sesgos conocidos ni evaluaciones de sesgo en la informacion disponible.
- Riesgo de alucinacion inherente a los modelos generativos: en traduccion puede producir terminos o cifras incorrectas, especialmente en textos con alta densidad numerica o regulatoria; se recomienda revision humana en contextos auditables.
- La longitud de contexto no esta publicada, lo que dificulta planificar la traduccion de documentos muy extensos sin fragmentacion.
- Aunque soporta 18 idiomas, el rendimiento puede variar significativamente entre pares de idiomas; los benchmarks publicados se centran en en-fr y noticias WMT.
- Licencia Apache 2.0 permite uso comercial, pero se debe verificar el cumplimiento de las condiciones de los datos de entrenamiento del modelo base, no detalladas en la informacion disponible.
- El modelo requiere custom_code en transformers, lo que puede complicar el despliegue en entornos con versiones estandar de la libreria.
- El numero de descargas (15) y likes (0) indica adopcion muy temprana; la comunidad aun no ha validado el modelo de forma independiente.

## Enlaces

- Hugging Face: https://huggingface.co/OVHaiLLM/Olala-v1.0-translate
- Modelo base: https://huggingface.co/OVHaiLLM/Olala-v1.0-mini-7A1B
- Modelo base preentrenado: https://huggingface.co/OVHaiLLM/Olala-v1.0-mini-7A1B-base
- Modelo base tras SFT: https://huggingface.co/OVHaiLLM/Olala-v1.0-mini-7A1B-SFT
- Variante de resumen: https://huggingface.co/OVHaiLLM/Olala-v1.0-summarise
- Informe tecnico (PDF): https://huggingface.co/OVHaiLLM/Olala-v1.0-mini-7A1B/blob/main/Olala-v1.0-mini.pdf
- Playground: https://olala.ovh.com
- AI Endpoints de OVHcloud: https://www.ovhcloud.com/en/public-cloud/ai-endpoints/catalog/#try-our-models
