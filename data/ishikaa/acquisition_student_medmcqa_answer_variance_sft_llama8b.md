# ishikaa/acquisition_student_medmcqa_answer_variance_sft_llama8b

## Resumen

El modelo `ishikaa/acquisition_student_medmcqa_answer_variance_sft_llama8b` es un ajuste fino supervisado (SFT) publicado en HuggingFace por el usuario `ishikaa`, construido sobre una base Llama de 8.000 millones de parametros. Por la nomenclatura del repositorio se deduce que se trata de un "student model" entrenado en el contexto de un experimento de adquisicion de datos (active learning o seleccion de muestras) sobre el corpus MedMCQA, una coleccion de preguntas de opcion multiple de examenes de acceso a facultades de medicina, con algun criterio relacionado con la varianza de respuestas. Esta interpretacion proviene unicamente del nombre del modelo, ya que la model card no documenta nada al respecto.

El modelo fue creado el 15 de septiembre de 2026 (fecha registrada en el Hub que resulta anomala) y actualizado dos minutos despues, con 217 descargas y cero "likes" en el momento de redactar esta ficha. El tamano del repositorio, 16,1 GB, es coherente con pesos en precision de 16 bits para 8.030.261.248 parametros, y el modelo se distribuye en formato `safetensors`. La model card es la plantilla autogenerada por HuggingFace con todos los campos marcados como "[More Information Needed]", por lo que no hay informacion oficial sobre licencia, idiomas, datos de entrenamiento, hiperparametros ni evaluacion.

Su relevancia es limitada y de ambito estrictamente investigador: se trata de un artefacto de experimento, no de un modelo listo para produccion. No obstante, puede ser util como referencia para quien investigue tecnicas de seleccion de datos en dominios medicos, destilacion de modelos Llama de 8B o ajuste supervisado sobre benchmarks de QA medico. Cualquier uso en un contexto clinico o de decision medica real queda fuera de alcance por ausencia total de documentacion y de garantias.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso, familia Llama (deducido de los tags y del nombre; no confirmado en la model card) |
| Parametros totales | 8.030.261.248 (dato real de los pesos en safetensors) |
| Parametros activos | no aplica (modelo denso, no es MoE) |
| Longitud de contexto | no disponible en la ficha; el modelo base Llama 3 8B soporta 8.192 tokens de forma nativa, pero no hay confirmacion para este ajuste |
| Tipos de cuantizacion | no disponible; el repositorio contiene pesos en `safetensors` (16,1 GB, compatible con fp16/bf16). No se publican versiones GGUF, AWQ ni GPTQ |
| Idiomas soportados | no disponible (MedMCQA esta en ingles, pero la model card no lo declara) |
| Licencia | no disponible |
| Formato de pesos | safetensors |
| Libreria de referencia | transformers |
| Pipeline declarado | text-generation |
| Etiquetas | transformers, safetensors, llama, text-generation, trl, sft, conversational, text-generation-inference, endpoints-compatible |
| Descargas / likes | 217 / 0 |
| Tamano del repositorio | 16,1 GB |
| Fecha de creacion (Hub) | 2026-09-15T01:15:32Z |
| Ultima actualizacion (Hub) | 2026-09-15T01:17:41Z |

## Arquitectura y entrenamiento

No hay informacion publicada sobre la arquitectura concreta mas alla de lo que permiten inferir los metadatos. El tag `llama` y el sufijo `llama8b` del identificador apuntan a una base Llama de 8B, y el recuento exacto de parametros (8.030.261.248) coincide con la familia Llama 3 8B. El repositorio contiene unicamente pesos en `safetensors` con arquitectura de transformer denso, sin indicios de mezcla de expertos (MoE), atencion lineal ni arquitecturas hibridas. No se especifica la ventana de contexto efectiva tras el ajuste.

En cuanto al entrenamiento, los tags `trl` y `sft` confirman que se utilizo la libreria TRL de HuggingFace para un ajuste fino supervisado, y el nombre del repositorio indica que los datos proceden de MedMCQA (`medmcqa`) y que el objetivo del experimento estaba relacionado con la varianza de respuestas (`answer_variance`) dentro de un esquema de seleccion de datos para un modelo estudiante (`acquisition_student`). No se documentan el numero de tokens de entrenamiento, la composicion del dataset, el regimen de precision (fp16, bf16, fp8), la existencia de RLHF o DPO, ni los hiperparametros. Tampoco se describe ninguna innovacion tecnica de decodificacion o de atencion. El unico enlace academico presente en la model card, `arxiv:1910.09700`, corresponde a la referencia generica del calculador de impacto ambiental de Lacoste et al. (2019) incluida en la plantilla, no a un articulo sobre el modelo.

## Capacidades

- Generacion de texto en formato conversacional: el tag `conversational` indica que el modelo se ha ajustado con plantillas de dialogo, presumiblemente con turnos de usuario y asistente.
- Respuesta a preguntas de opcion multiple en el dominio medico: el ajuste sobre MedMCQA apunta a que el modelo esta especializado en seleccionar o justificar la respuesta correcta entre varias opciones.
- Razonamiento de un solo turno orientado a examen: no hay evidencia de soporte para razonamiento multi-paso largo ni de un modo de "pensamiento" explicito.
- Soporte de tool calling / function calling: no disponible; no se menciona en la informacion proporcionada.
- Soporte de agentes: no disponible; sin documentacion de uso agentico ni de planificacion multi-paso.
- Capacidades multilingues: no disponible; sin declaracion de idiomas.
- Vision, audio u otras modalidades: no disponibles; el modelo es exclusivamente de texto.
- Capacidad de seguir instrucciones generales: no verificada; el ajuste parece acotado al dominio medico y a la tarea de QA de opcion multiple.

## Casos de uso

- Investigacion en seleccion de datos (active learning): el modelo puede servir como "student" de referencia en experimentos que comparen estrategias de adquisicion de muestras sobre MedMCQA, midiendo como varia el rendimiento del estudiante segun el subconjunto de datos elegido.
- Evaluacion de QA medico de opcion multiple: permite reproducir experimentos de exactitud sobre MedMCQA, aunque sin una tabla de resultados publicada el usuario tendria que evaluar el modelo por su cuenta.
- Generacion de material de estudio para examenes tipo MIR o equivalentes: el modelo puede redactar preguntas de opcion multiple con distractores y una justificacion de la respuesta, siempre que un revisor humano valide el contenido.
- Anotacion asistida de corpus medicos: puede preetiquetar pares pregunta-respuesta que despues se filtran manualmente, reduciendo el coste de anotacion en pipelines de datos clinicos.
- Aumento de datos sinteticos: util para generar variantes de preguntas y respuestas que alimenten el entrenamiento de modelos mayores en el mismo dominio, con control de calidad posterior obligatorio.
- Destilacion y comparativas de ajuste fino: sirve como punto de partida para estudiar como se comporta un modelo de 8B ajustado con SFT frente a su base sin ajustar en tareas medicas cerradas.
- Reproducibilidad de experimentos academicos: al estar publicado con pesos en safetensors y libreria transformers, se puede cargar con `AutoModelForCausalLM` para replicar el pipeline de evaluacion, algo habitual en trabajos de investigacion.
- Base para ajustes posteriores especificos: puede actuar como punto de partida de un ajuste adicional (por ejemplo, DPO o instrucciones clinicas) si se resuelve antes la ambiguedad de licencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye ninguna seccion de evaluacion cumplimentada (aparece como "[More Information Needed]"), no hay tabla de resultados en el Hub y la busqueda web realizada no devolvio ningun articulo, informe tecnico ni repositorio asociado al modelo. No se dispone por tanto de datos de MMLU, MedQA, MedMCQA, HumanEval ni de ninguna otra metrica.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16/bf16: en torno a 16,1 GB solo para pesos, mas el cache KV, que crece con la longitud de contexto y el tamano de lote; con 8.192 tokens de contexto y lotes moderados conviene contar con 20-24 GB.
- VRAM estimada en cuantizacion de 8 bits: aproximadamente 9-10 GB de pesos mas cache KV, lo que situa el total en el rango de 12-16 GB.
- VRAM estimada en cuantizacion de 4 bits: aproximadamente 5-6 GB de pesos mas cache KV; requeriria convertir los pesos a un formato cuantizado, ya que el repositorio solo publica safetensors en 16 bits.
- GPU de datacenter recomendadas: A100 (40 GB o 80 GB), H100 (80 GB), L40S (48 GB) o A6000 (48 GB), todas capaces de alojar el modelo en fp16 sin cuantizar.
- GPU de consumo: cabe en RTX 4090, RTX 3090 o RTX 4080 con 24 GB en fp16 siempre que se limite el contexto y el tamano de lote; en tarjetas de 16 GB o menos es necesario recurrir a cuantizacion de 8 o 4 bits.
- Opciones de despliegue: al incluir los tags `text-generation-inference` y `endpoints-compatible`, el modelo esta preparado para TGI y para Inference Endpoints de HuggingFace; tambien es compatible con vLLM y con la carga directa mediante transformers. Ollama y llama.cpp requeririan una conversion previa a GGUF que no se distribuye en el repositorio.
- Latencia y throughput: no disponibles; no se publican mediciones de tokens por segundo ni de tiempo hasta el primer token.

## Comparativa con modelos similares

La ausencia de licencia, idiomas, contexto y evaluacion declarados impide una comparacion rigurosa. Los datos de los modelos alternativos que se muestran a continuacion proceden de sus respectivas model cards publicas y no de la informacion proporcionada para este modelo, por lo que deben tomarse como referencia orientativa.

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Datos de rendimiento |
|---|---|---|---|---|---|
| acquisition_student_medmcqa_answer_variance_sft_llama8b | 8,03 B | no disponible | no disponible | Safetensors en HuggingFace | no disponible |
| Llama 3.1 8B Instruct (base de referencia generalista) | 8,03 B | 128.000 tokens | Llama 3.1 Community License | Safetensors, GGUF, cuantizaciones de terceros | Amplia bateria publica de benchmarks generalistas |
| BioMistral 7B (referencia en dominio biomedico) | 7 B | 8.000 tokens | Apache 2.0 | Safetensors y GGUF | Benchmarks medicos publicados en su model card |
| Meditron 7B (referencia en dominio clinico) | 7 B | no disponible | Licencia Llama 2 | Safetensors | Benchmarks medicos publicados en su model card |

La diferencia clave no esta en los parametros, muy similares, sino en la documentacion: las alternativas declaran licencia, idiomas y evaluacion, mientras que este ajuste no ofrece ninguno de esos datos, lo que complica su adopcion fuera de un contexto de investigacion.

## Limitaciones y advertencias

- Model card vacia: todos los campos estan sin rellenar, incluidas la descripcion, los datos de entrenamiento, los hiperparametros y la evaluacion; no es posible auditar el ajuste.
- Licencia no declarada: al no especificarse licencia, no hay autorizacion explicita de uso comercial ni de redistribucion. Ademas, si la base es efectivamente Llama 3 8B, se heredarian las condiciones de la Llama Community License, que impone obligaciones adicionales (atribucion, nombre del modelo, restricciones de uso).
- Sin datos de evaluacion: no se puede afirmar que el modelo supere a su base ni a alternativas del dominio; cualquier afirmacion de rendimiento seria especulativa.
- Riesgo de alucinacion elevado en dominio medico: un modelo de 8B ajustado con SFT sobre preguntas de examen puede generar respuestas plausibles pero incorrectas, con especial peligro en un ambito clinico.
- Ausencia de validacion clinica: no hay avales, revisiones por expertos ni advertencias de uso responsable en la ficha; no debe usarse para diagnostico, tratamiento ni triaje.
- Sesgos desconocidos: al no documentarse la composicion del dataset de entrenamiento ni el proceso de filtrado, no se pueden evaluar sesgos demograficos, geograficos ni de especialidad medica.
- Limitaciones de idioma: sin declaracion de idiomas, se desconoce el comportamiento en castellano; MedMCQA esta en ingles, por lo que el rendimiento fuera de ese idioma es impredecible.
- Contexto limitado: si la ventana efectiva se mantiene en los 8.192 tokens del modelo base, no es adecuado para documentos clinicos largos ni para conversaciones multi-turno extensas.
- Uso educativo bajo supervision: cualquier aplicacion en formacion medica debe incluir revision humana, dado que el modelo no esta calibrado para expresar incertidumbre.
- Metadatos anomalos: las fechas de creacion y actualizacion registradas (2026) y la diferencia de dos minutos entre ambas sugieren un artefacto de publicacion, lo que refuerza la naturaleza experimental del repositorio.
- Repositorio sin mantenimiento aparente: cero "likes" y 217 descargas indican un uso marginal y ninguna garantia de soporte o actualizacion.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/ishikaa/acquisition_student_medmcqa_answer_variance_sft_llama8b
- Referencia citada en la model card (calculador de impacto ambiental): https://mlco2.github.io/impact
- Articulo asociado a esa referencia: https://arxiv.org/abs/1910.09700 (Lacoste et al., 2019, "Quantifying the Carbon Emissions of Machine Learning"); no guarda relacion con la arquitectura ni el entrenamiento de este modelo
- Repositorio o paper especifico del modelo: no disponible
- Demo: no disponible
- Otros enlaces relevantes: la busqueda web realizada no devolvio ningun recurso relacionado con el modelo; los unicos resultados obtenidos fueron paginas de producto de Microsoft OneNote, sin relacion con este repositorio
