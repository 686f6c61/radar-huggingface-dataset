# HYU-NLP-EVAL/qwen3-4b-rar-medicine-onlinerubrics-dense-seed11-step-047

## Resumen

El modelo `HYU-NLP-EVAL/qwen3-4b-rar-medicine-onlinerubrics-dense-seed11-step-047` es un checkpoint denso de 4.022.468.096 parametros (aproximadamente 4,02 B) publicado por el usuario HYU-NLP-EVAL. Se trata de un ajuste fino del modelo base `Qwen/Qwen3-4B-Instruct-2507` de Alibaba Qwen, orientado al dominio medico y generado dentro de una ejecucion de aprendizaje por refuerzo identificada como `phase1-online-rubrics-medicine-full-dense-20260919-seed11`. El sufijo `step-047` indica que es una instantanea intermedia de ese proceso de entrenamiento, no un modelo final convergido.

El nombre de la ejecucion sugiere el uso de rubricas en linea como senal de recompensa (metodologia del tipo "Rubrics as Rewards") aplicada a contenido medico, con variante densa (frente a una hipotetica variante MoE) y semilla 11. El repositorio contiene dos conjuntos de pesos: un modelo en BF16 listo para inferencia en la raiz y un directorio `original_checkpoint/` con los ficheros nativos de veRL (solo parametros del modelo), lo que lo convierte en un artefacto fundamentalmente de investigacion mas que en un producto listo para produccion.

Su relevancia actual es acotada pero especifica: es util para quien investigue tecnicas de RL con recompensas basadas en rubricas en dominios de alto riesgo como la medicina, para reproducir la ejecucion de entrenamiento, o como punto de partida para un ajuste fino posterior. La model card es extremadamente escueta, no publica resultados de evaluacion ni detalles del dataset, el repositorio acumula 0 descargas y 0 "likes", y la propia ficha incluye la advertencia "Research use only" pese a que la licencia declarada sea Apache-2.0. La busqueda web realizada no devolvio ningun resultado relevante sobre el modelo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (heredada del modelo base Qwen3-4B-Instruct-2507); no se especifica en la ficha del checkpoint |
| Parametros totales | 4.022.468.096 (dato real de los ficheros safetensors) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No especificada en esta ficha. Heredada del modelo base Qwen/Qwen3-4B-Instruct-2507 (su model card declara 262.144 tokens nativos); sin verificar en este checkpoint |
| Tipos de cuantizacion | No se publican variantes cuantizadas. Solo pesos en BF16; el usuario puede generar GGUF, AWQ o GPTQ a partir de ellos |
| Idiomas soportados | No disponible. El modelo base declara soporte multilingue; esta ficha no especifica idiomas ni el dataset de ajuste |
| Licencia | apache-2.0 (segun los metadatos), pero la model card indica "Research use only", lo que genera una contradiccion que conviene resolver con el autor antes de un uso comercial |
| Formato de pesos | safetensors en BF16 (raiz del repositorio) y `original_checkpoint/` con ficheros de checkpoint de veRL (solo parametros) |
| Tamano del repositorio | 25,7 GB |
| Modelo base | Qwen/Qwen3-4B-Instruct-2507 |
| Pipeline | text-generation |
| Libreria | transformers (compatible con text-generation-inference y endpoints compatibles) |

## Arquitectura y entrenamiento

La arquitectura subyacente es la del modelo base Qwen3-4B-Instruct-2507: un transformer denso con atencion por consultas agrupadas (GQA), disenado para generacion de texto y conversacion. Sobre esa base, este checkpoint se ha sometido a un proceso de ajuste por refuerzo dentro de la ejecucion `phase1-online-rubrics-medicine-full-dense-20260919-seed11`, cuyo nombre apunta a un entrenamiento en dos fases (aqui, fase 1) con rubricas en linea ("online rubrics") aplicadas a contenido medico. La anotacion "dense" indica que la variante entrenada es la densa, no una mezcla de expertos, y `seed11` fija la semilla del experimento.

No hay informacion publica sobre el numero de tokens de entrenamiento, la composicion del corpus medico empleado, ni sobre si se aplicaron etapas adicionales de RLHF, DPO u otro tipo de alineamiento mas alla del bucle de RL con recompensa por rubricas. El hecho de que el artefacto se publique en el paso 47 sugiere una instantanea temprana o intermedia del entrenamiento, con lo que es probable que la politica no este completamente convergida ni sea comparable con un modelo final de la misma ejecucion. El repositorio incluye tanto los pesos BF16 para inferencia como el checkpoint original de veRL, lo que facilita reanudar o inspeccionar el entrenamiento, pero no aporta detalles adicionales sobre el procedimiento.

## Capacidades

- Generacion de texto y conversacion multi-turno: capacidades heredadas del modelo base Qwen3-4B-Instruct-2507, sin verificacion independiente en este checkpoint.
- Contenido del dominio medico: el nombre de la ejecucion de entrenamiento sugiere especializacion en tareas medicas o biomedicas, presumiblemente optimizada mediante recompensas basadas en rubricas de calidad.
- Razonamiento y respuesta a instrucciones: el modelo base es una variante "instruct" ajustada para seguir instrucciones; se espera que el ajuste por RL conserve esa capacidad, aunque no hay evaluaciones publicadas que lo confirmen.
- Capacidades multilingues: no documentadas en esta ficha; dependen de lo que soporte el modelo base y de los idiomas presentes en el corpus de ajuste, que se desconoce.
- Tool calling / function calling: no documentado para este checkpoint.
- Comportamiento agentico y razonamiento multi-paso: no documentado.
- Modo "thinking" explicito: no documentado en la ficha (el modelo base Instruct-2507 no usa modo de pensamiento explicito, a diferencia de la variante Thinking de Qwen3).
- Vision o audio: no soportados segun la informacion disponible (el pipeline declarado es unicamente text-generation).

## Casos de uso

- Investigacion en RL con recompensas basadas en rubricas: el repositorio incluye el checkpoint original de veRL, lo que permite reproducir la ejecucion `phase1-online-rubrics-medicine-full-dense-20260919-seed11`, comparar semillas o analizar la evolucion de la politica en el paso 47 frente a pasos posteriores.
- Punto de partida para ajuste fino en dominios medicos concretos: al ser un modelo de 4 B parametros con licencia Apache-2.0 en los metadatos, se puede continuar el entrenamiento con SFT o DPO sobre un corpus propio (por ejemplo, guias clinicas de una especialidad) con un coste de computo moderado.
- Generacion de datos sinteticos de QA medico: el modelo puede utilizarse para producir borradores de preguntas y respuestas que despues se filtren y validen por expertos, acelerando la construccion de datasets anotados.
- Entrenamiento de evaluadores automaticos basados en rubricas: dado que el modelo se ha optimizado con rubricas, puede servir como base para construir un modelo juez o un evaluador de respuestas clinicas que puntue segun criterios predefinidos, siempre con verificacion humana.
- Ablaciones y estudios de estabilidad del entrenamiento: al estar etiquetado con semilla y paso, es util para medir la varianza entre semillas en tareas de RL con recompensas basadas en texto libre.
- Prototipos de asistente clinico en entornos de baja latencia y recursos limitados: con 4 B parametros, el modelo puede ejecutarse en una unica GPU de consumo o incluso en CPU cuantizado, lo que permite desplegar un prototipo interno de demostracion (nunca uso clinico real sin validacion).
- Destilacion hacia modelos mas pequenos: las trazas generadas por este checkpoint pueden emplearse como profesor en un proceso de destilacion hacia modelos de 1-2 B para tareas medicas acotadas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del repositorio no incluye metricas de MMLU, MedQA, HumanEval, GSM8K ni de ninguna otra evaluacion, y la busqueda web no devolvio resultados relevantes sobre este modelo. Cualquier cifra de rendimiento que se quiera utilizar debera obtenerse midiendo el checkpoint directamente.

## Requisitos de hardware

- Peso de los parametros en BF16: 4.022.468.096 parametros x 2 bytes ≈ 8,05 GB. En FP16 el requisito es identico; en cuantizacion INT8 se reduce a unos 4,0 GB y en INT4 a unos 2,0-2,5 GB.
- VRAM estimada para inferencia en BF16: aproximadamente 10-12 GB contando pesos, activaciones y cache KV para contextos moderados. Estimacion orientativa de cache KV: en torno a 0,15 MB por token en BF16, dependiente de la configuracion de atencion del modelo base; a 32.000 tokens de contexto esto anade varios gigabytes.
- GPU recomendadas: para BF16 sin cuantizar, una RTX 4090 (24 GB), RTX 3090 (24 GB), L40S (48 GB), A100 (40/80 GB) o H100 (80 GB) ofrecen margen amplio. Para contextos muy largos conviene una GPU de 48 GB o superior.
- Cabe en GPU de consumo: si. En BF16 cabe holgadamente en tarjetas de 16-24 GB (RTX 4080, 4090, 3090, 4060 Ti de 16 GB) y con cuantizacion INT4/INT8 cabe en GPUs de 8-12 GB.
- Opciones de despliegue: transformers de forma nativa; vLLM, Text Generation Inference (TGI), SGLang y Ollama o llama.cpp si se generan pesos GGUF. Los tags del repositorio incluyen `text-generation-inference` y `endpoints_compatible`.
- Latencia y throughput: no disponibles. Al ser un modelo denso de 4 B parametros, se espera un throughput alto en GPU modernas, pero no se dispone de mediciones publicadas para este checkpoint concreto.
- Almacenamiento: el repositorio ocupa 25,7 GB, muy por encima de los ~8 GB de los pesos BF16, porque incluye tambien los ficheros del checkpoint original de veRL. Conviene descargar selectivamente solo los safetensors de inferencia si no se necesita reanudar el entrenamiento.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| qwen3-4b-rar-medicine-onlinerubrics-dense-seed11-step-047 (este modelo) | 4,02 B (denso) | No especificado en la ficha; heredado del modelo base | apache-2.0 en metadatos, con aviso "Research use only" en la model card | HuggingFace, 0 descargas, 0 likes | Checkpoint intermedio (paso 47) de un entrenamiento RL en dominio medico; sin benchmarks publicados |
| Qwen/Qwen3-4B-Instruct-2507 (modelo base) | 4,02 B (denso) | 262.144 tokens segun su model card | apache-2.0 | HuggingFace, ampliamente distribuido | Modelo base generalista, con soporte multilingue y documentacion completa; sirve de referencia para medir si el ajuste aporta mejoras |
| Modelos densos de ~3-4 B de otros laboratorios (por ejemplo, Llama 3.2 3B Instruct, Phi-4-mini, Gemma 3 4B) | 3-4 B | 128 K o superior segun el modelo | Licencias comunitarias o permisivas segun el caso (consultar cada model card) | HuggingFace, ampliamente distribuidos | Alternativas generalistas con documentacion y evaluaciones publicas; no hay datos que permitan comparar rendimiento en el dominio medico con este checkpoint |

No es posible establecer una comparacion de rendimiento con alternativas porque este checkpoint no publica resultados de benchmarks. La comparacion relevante es interna: frente a su modelo base Qwen3-4B-Instruct-2507, el efecto del ajuste por rubricas en el dominio medico queda por verificar.

## Limitaciones y advertencias

- Es un checkpoint de un entrenamiento en curso (paso 47), no un modelo final. La calidad y la coherencia pueden ser inferiores a las de un modelo convergido de la misma ejecucion.
- No se publica ninguna evaluacion. No hay evidencia de que el ajuste mejore al modelo base ni de que sea seguro en tareas medicas.
- Ambito medico de alto riesgo: un modelo ajustado con datos medicos puede generar recomendaciones clinicas incorrectas con apariencia de autoridad. No es un producto sanitario, no ha pasado validacion clinica y no debe usarse para diagnostico ni tratamiento.
- Riesgo de alucinacion: inherente a los modelos de lenguaje de esta escala, especialmente en dominios tecnicos donde el modelo puede inventar dosis, interacciones farmacologicas o referencias bibliograficas.
- Sesgos: no se documenta la composicion del dataset de ajuste, por lo que se desconocen los sesgos demograficos, linguisticos o culturales introducidos durante el entrenamiento con rubricas.
- Cobertura idiomatica desconocida: la ficha no especifica idiomas; si el corpus de rubricas era mayoritariamente en un solo idioma, el rendimiento en otros puede degradarse respecto al modelo base.
- Restricciones de licencia: los metadatos declaran Apache-2.0, pero la model card indica "Research use only". Esta contradiccion debe aclararse con el autor antes de cualquier uso comercial o de redistribucion.
- Sin soporte ni mantenimiento: 0 descargas, 0 likes y ninguna documentacion adicional. No hay garantia de que el autor responda a incidencias ni de que se publiquen pasos posteriores del entrenamiento.
- Repositorio pesado (25,7 GB) que incluye checkpoints de entrenamiento; la descarga completa puede no ser necesaria para inferencia.
- No se documentan capacidades de tool calling, agentes o modo de razonamiento explicito, por lo que no conviene asumirlas en un diseno de produccion.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/HYU-NLP-EVAL/qwen3-4b-rar-medicine-onlinerubrics-dense-seed11-step-047
- Modelo base en HuggingFace: https://huggingface.co/Qwen/Qwen3-4B-Instruct-2507
- No se han encontrado otros enlaces relevantes (papers, blogs, repositorios o demos) en la busqueda web realizada; los resultados devueltos correspondian a un centro educativo sin relacion con el modelo.
