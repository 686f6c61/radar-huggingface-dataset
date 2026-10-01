# BrandonHowe/Olmo7b-compassion-olmo-seed1-20260930-CPT-merged-epoch-4

## Resumen

Olmo7b-compassion-olmo-seed1-20260930-CPT-merged-epoch-4 es un modelo de generacion de texto derivado de allenai/Olmo-3-1025-7B mediante entrenamiento continuado (continued pretraining, CPT) sobre el conjunto de datos CompassioninMachineLearning/compassion_12185_cleaned. El autor es BrandonHowe y el artefacto publicado es el resultado de fusionar el adaptador/checkpoint con los pesos base en precision BF16, usando la utilidad nativa de Unsloth `save_pretrained_merged(save_method="merged_16bit")`. El checkpoint corresponde a la epoca 4,0 (paso 1500).

El modelo tiene 7.298.011.136 parametros y ocupa 14,6 GB en el repositorio, empaquetado sin perdida en ocho fragmentos safetensors. No requiere cargar ningun adaptador: se puede abrir directamente con transformers bajo la etiqueta de arquitectura olmo3. Su proposito declarado es el ajuste de estilo y contenido hacia la compasion, pero la propia model card advierte que el entrenamiento no demuestra una mejora en compasion y que esa evaluacion debe hacerse por separado.

La relevancia practica de esta ficha es limitada pero clara: se trata de un experimento de investigacion reproducible (incluye `run_manifest.json` con revision base, hashes de seleccion de documentos, parametros de entrenamiento y validacion de exportacion) con cero descargas y cero likes en el momento de la consulta, sin licencia declarada, sin idiomas declarados y sin resultados de benchmarks publicados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible en la informacion proporcionada (el repositorio se etiqueta como olmo3 y el modelo base es allenai/Olmo-3-1025-7B) |
| Parametros totales | 7.298.011.136 |
| Parametros activos | No aplica / no disponible (no se indica configuracion MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | Solo BF16 (pesos fusionados con `save_method="merged_16bit"`); no se publican versiones GGUF, int8 ni int4 |
| Idiomas soportados | No disponibles |
| Licencia | No disponible en la ficha de HuggingFace; el modelo base tiene su propia licencia, no confirmada en la informacion proporcionada |
| Formato de pesos | safetensors (8 shards, BF16) |
| Tipo de modelo | Text-generation, continued pretraining |
| Modelo base | allenai/Olmo-3-1025-7B |
| Dataset de entrenamiento | CompassioninMachineLearning/compassion_12185_cleaned (revision 95e233baf48a7751bcec55a08347697ed6e4c4a8) |
| Checkpoint publicado | Epoca 4,0, paso 1500 |
| Tamano del repositorio | 14,6 GB |
| Libreria | transformers |
| Fecha de creacion | 2026-09-30 |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

La informacion disponible no describe la arquitectura interna del modelo. Se sabe que el repositorio declara la etiqueta `olmo3` y que los pesos derivan de allenai/Olmo-3-1025-7B, de modo que la arquitectura, la longitud de contexto, el vocabulario y la tokenizacion son heredados del modelo base; ninguno de esos valores se detalla en la model card ni en los metadatos proporcionados. El artefacto publicado es un modelo fusionado en BF16, validado y empaquetado en ocho fragmentos safetensors, sin adaptador. La fusion se realizo con la funcion nativa de Unsloth `save_pretrained_merged(save_method="merged_16bit")`.

El entrenamiento es un continued pretraining sobre el dataset `compassion_12185_cleaned`, fijado a la revision 95e233baf48a7751bcec55a08347697ed6e4c4a8. La receta declarada usa 10.000 documentos distintos mas 2.000 exposiciones repetidas por epoca, con 200 documentos de validacion disjuntos. No se indica el numero de tokens procesados, la composicion del dataset, ni si hubo fases de RLHF, DPO o ajuste por preferencias. Tampoco se declaran innovaciones tecnicas adicionales (decodificacion especulativa, atencion lineal, atencion hibrida, etc.). La unica garantia tecnica que ofrece el autor es de tipo reproducible: `run_manifest.json` recoge la revision base, los hashes de seleccion de documentos, los parametros de entrenamiento y la validacion de la exportacion.

## Capacidades

- Generacion de texto autoregresiva, heredada del modelo base allenai/Olmo-3-1025-7B.
- Ajuste orientado a contenido y estilo relacionados con la compasion, por efecto del continued pretraining sobre `compassion_12185_cleaned`. El autor advierte explicitamente que el entrenamiento no establece una mejora medible en compasion.
- Carga directa sin adaptadores en transformers, lo que simplifica la integracion en pipelines existentes.
- Capacidades de razonamiento, codigo, matematicas, vision, audio, tool calling, function calling y agentes: no disponibles en la informacion proporcionada. Al ser un modelo derivado por continued pretraining de un modelo base de texto, no hay evidencia declarada de capacidades multimodales ni de uso de herramientas.
- Multilingue: no disponible; no se declara ningun idioma en los metadatos.
- Modo de razonamiento explicito (thinking mode): no disponible.
- Capacidades especiales adicionales: no disponibles.

## Casos de uso

- Investigacion sobre ajuste de comportamiento prosocial: el modelo sirve como punto de comparacion frente a allenai/Olmo-3-1025-7B para estudiar si un continued pretraining sobre un corpus de compasion modifica el tono de las respuestas. Es adecuado porque el autor publica el manifiesto de ejecucion con hashes y parametros, lo que permite reproducir el experimento.
- Reproduccion de experimentos de continued pretraining: al estar fusionado y validado en BF16, se puede cargar con transformers sin gestionar adaptadores, lo que reduce fuentes de error al replicar la receta de 10.000 documentos y 2.000 repeticiones por epoca.
- Comparacion de tecnicas de fusion de pesos: dado que se empleo `save_pretrained_merged` de Unsloth, sirve para auditar la fidelidad de la fusion frente al checkpoint original en BF16.
- Generacion de texto en dominios de apoyo conversacional, con la salvedad de que la calidad en ese dominio no esta medida: se usaria como prototipo en tareas de redaccion empatica, siempre con evaluacion humana previa.
- Ajuste posterior (fine-tuning) como punto de partida alternativo al modelo base: al compartir arquitectura y formato con allenai/Olmo-3-1025-7B, puede reutilizarse en pipelines de SFT o DPO cuando se quiera partir de una distribucion ya sesgada hacia vocabulario de compasion.
- Docencia y formacion en tecnicas de entrenamiento continuado: el repositorio ilustra el ciclo completo (seleccion de documentos, epocas, validacion de exportacion, empaquetado en shards) con material de manifiesto utilizable en clase.
- Evaluacion de seguridad y sesgos en modelos ajustados por dominio: el modelo permite medir si un corpus tematico estrecho produce deriva estilistica o degradacion en tareas generales, aunque no se publican resultados al respecto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye cifras de MMLU, HumanEval, GSM8K ni de ninguna otra evaluacion, y tampoco se aportan metricas propias del dominio de compasion. El autor indica ademas que el entrenamiento no demuestra una mejora en compasion y que esa evaluacion debe realizarse por separado.

## Requisitos de hardware

- VRAM estimada para inferencia: en BF16 los pesos ocupan aproximadamente 14,6 GB (7,298 mil millones de parametros a 2 bytes por parametro), a los que hay que sumar la cache KV y las activaciones; en la practica se recomienda un margen de 2 a 6 GB adicionales segun longitud de contexto y tamano de lote.
- Cuantizacion: el repositorio solo publica BF16. Para reducir VRAM habria que cuantizar a 8 bits (aproximadamente 7,3 GB de pesos) o a 4 bits (aproximadamente 3,7 GB de pesos) por cuenta propia, sin valores medidos disponibles.
- GPU recomendadas: para BF16 sin cuantizar, GPU de 24 GB o mas (RTX 3090, RTX 4090, L40S, A100 40/80 GB, H100). Para cuantizacion a 8 bits cabe en GPU de 12 a 16 GB; a 4 bits podria caber en GPU de 8 a 12 GB, siempre segun estimacion teorica y no validada por el autor.
- Cabe en GPU de consumo: si, en BF16 en tarjetas de 24 GB como la RTX 4090, y con cuantizacion en tarjetas de 8 a 16 GB; no hay pruebas publicadas de estos despliegues.
- Opciones de despliegue: carga directa con transformers (biblioteca declarada). Otros servidores de inferencia como vLLM, TGI, llama.cpp u Ollama no estan confirmados en la informacion disponible; llama.cpp y Ollama exigirian ademas una conversion a GGUF que el repositorio no incluye.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Entrenamiento | Licencia | Disponibilidad | Rendimiento |
|---|---|---|---|---|---|---|
| Olmo7b-compassion-olmo-seed1-20260930-CPT-merged-epoch-4 | 7.298.011.136 | No disponible | Continued pretraining sobre compassion_12185_cleaned (epoca 4, paso 1500) | No disponible | HuggingFace, safetensors BF16, 0 descargas | Sin benchmarks publicados |
| allenai/Olmo-3-1025-7B (modelo base) | No disponible en la informacion proporcionada | No disponible | Modelo base de la familia OLMo 3 | No disponible en la informacion proporcionada | HuggingFace | No disponible en la informacion proporcionada |
| Otros modelos abiertos de ~7B | No disponible | No disponible | No disponible | No disponible | No disponible | No disponible |

No se dispone de datos suficientes para establecer una comparativa cuantitativa con alternativas de la misma categoria. Cualquier comparacion de rendimiento requeriria ejecutar evaluaciones propias sobre este modelo, su base y los candidatos elegidos.

## Limitaciones y advertencias

- Ausencia de benchmarks: no hay ninguna metrica publicada que respalde el rendimiento del modelo en tareas generales ni en el dominio de compasion.
- Advertencia explicita del autor: el entrenamiento no establece una mejora en compasion; cualquier afirmacion en ese sentido debe verificarse con una evaluacion independiente.
- Riesgo de olvido catastrofico: al tratarse de un continued pretraining sobre un corpus tematico muy pequeno (10.000 documentos distintos y 2.000 repeticiones por epoca), es esperable cierta degradacion de capacidades generales, aunque no se aportan mediciones que lo confirmen o lo descarten.
- Sesgo de dominio: el modelo esta expuesto de forma intensiva a un unico dataset de contenido compasivo, lo que puede sesgar el registro, el vocabulario y el tono de las respuestas hacia ese estilo, incluso cuando no es apropiado.
- Alucinacion: no hay informacion disponible sobre tasas de alucinacion; se aplican los riesgos habituales de un modelo generativo de 7B, agravados por la falta de evaluacion.
- Idiomas: no se declara ningun idioma soportado, por lo que no se puede garantizar un comportamiento correcto fuera de la lengua dominante del dataset de entrenamiento.
- Licencia: no declarada en la ficha de HuggingFace. Sin una licencia explicita no hay autorizacion clara para uso comercial; ademas, la licencia del modelo base y la del dataset deben verificarse por separado antes de cualquier despliegue en produccion.
- Falta de validacion comunitaria: cero descargas y cero likes en el momento de la consulta, sin issues ni evaluaciones de terceros.
- Limitaciones de contexto: la longitud de contexto no se especifica, de modo que no se puede planificar el uso con entradas largas.
- Formatos: al publicarse solo en BF16 y sin GGUF, el despliegue en entornos de bajos recursos requiere cuantizacion manual, con el consiguiente riesgo de perdida de calidad no medida.
- Uso previsto: por su naturaleza experimental y su falta de licencia, debe tratarse como artefacto de investigacion, no como componente listo para produccion.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/BrandonHowe/Olmo7b-compassion-olmo-seed1-20260930-CPT-merged-epoch-4
- Modelo base: https://huggingface.co/allenai/Olmo-3-1025-7B
- Dataset de entrenamiento: https://huggingface.co/datasets/CompassioninMachineLearning/compassion_12185_cleaned
- Repositorio del autor en HuggingFace: https://huggingface.co/BrandonHowe
- Unsloth (utilidad de fusion empleada, `save_pretrained_merged`): https://github.com/unslothai/unsloth
- Paper, blog, repositorio o demo adicionales: no disponibles en los resultados de busqueda proporcionados (los resultados obtenidos no guardan relacion con el modelo).
