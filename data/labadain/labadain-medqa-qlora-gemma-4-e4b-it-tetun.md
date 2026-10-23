# labadain/Labadain-MedQA-QLoRA-Gemma-4-E4B-it-tetun

## Resumen

Labadain-MedQA-QLoRA-Gemma-4-E4B-it-tetun es un adaptador LoRA publicado por el usuario labadain en HuggingFace, entrenado mediante QLoRA sobre el modelo base `unsloth/gemma-4-E4B-it`. No se trata de un modelo completo, sino de un conjunto de pesos de adaptador (0,2 GB en formato safetensors) que debe cargarse junto al modelo base para poder realizar inferencia. El nombre del repositorio indica que el ajuste fino se ha orientado a pregunta-respuesta de dominio médico (MedQA) en tetun, la lengua oficial de Timor-Leste.

El interes principal del artefacto es su carácter de recurso para una lengua de bajos recursos: el tetun cuenta con muy pocos modelos ajustados y practicamente ningun corpus médico abierto de referencia. Un adaptador de este tipo permite experimentar con QLoRA sobre un modelo base moderno sin necesidad de reentrenar ni redistribuir el modelo completo, lo que reduce costes de computo y evita problemas de redistribucion de pesos.

Ahora bien, la model card esta literalmente sin completar ("Model Card (To be Completed)") y el repositorio no incluye informacion sobre datos de entrenamiento, hiperparametros, licencia ni evaluacion. A fecha de consulta el repositorio registra 0 descargas y 0 likes, por lo que no existe evidencia publica de validacion por parte de terceros. Cualquier uso en produccion, y muy especialmente en un dominio sanitario, exige una evaluacion propia previa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (libreria PEFT) sobre el modelo base `unsloth/gemma-4-E4B-it`. Arquitectura del modelo base: no disponible en la informacion proporcionada |
| Parametros totales | No disponible. El repositorio contiene unicamente los pesos del adaptador (0,2 GB); el modelo base se distribuye por separado |
| Parametros activos | No disponible. La informacion proporcionada no indica que el modelo base sea MoE |
| Longitud de contexto | No disponible (la hereda del modelo base, que no se documenta en el repositorio) |
| Tipos de cuantizacion | Entrenamiento QLoRA (cuantizacion en 4 bits del modelo base durante el ajuste, segun la nomenclatura del repositorio). No se publican pesos cuantizados del adaptador ni versiones GGUF/AWQ/GPTQ |
| Idiomas soportados | Tetun (etiqueta `Tetun` del repositorio). Listado completo de idiomas: no disponible |
| Licencia | No disponible |
| Formato de pesos | safetensors (adaptador LoRA). Requiere cargar el modelo base para la inferencia |

## Arquitectura y entrenamiento

El artefacto es un adaptador LoRA, es decir, un conjunto de matrices de bajo rango que se inyectan en determinadas capas del transformer del modelo base y que se combinan con los pesos congelados de este. La libreria declarada es PEFT y las herramientas citadas en las etiquetas incluyen Unsloth y Transformers. El prefijo "QLoRA" del nombre indica que el ajuste se realizo manteniendo el modelo base cuantizado en 4 bits y entrenando solo los parametros del adaptador en precision superior, una tecnica habitual para reducir el consumo de VRAM a costa de un ligero compromiso en la fidelidad numerica del ajuste.

No se dispone de informacion sobre el volumen de tokens de entrenamiento, la composicion del dataset, la procedencia de los datos MedQA, la existencia de filtrado o desduplicacion, ni sobre si se aplicaron etapas de alineacion adicionales (RLHF, DPO) mas alla del ajuste supervisado. Tampoco se documentan hiperparametros como rango del LoRA, alpha, tasa de aprendizaje, numero de epochs ni la eleccion de modulos objetivo. Sin esos datos no es posible reproducir el entrenamiento ni estimar su calidad de forma fundamentada.

## Capacidades

- Generacion de texto conversacional en formato pregunta-respuesta, segun la etiqueta `conversational` y la tarea declarada `text-generation`.
- Respuesta a preguntas de dominio medico en tetun, segun indica el identificador del repositorio (MedQA). El alcance real y la calidad de esta capacidad no estan documentados ni evaluados publicamente.
- Multilingue: potencialmente hereda las capacidades del modelo base, pero el repositorio solo declara tetun y no detalla que idiomas se conservan tras el ajuste.
- Soporte de tool calling o function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Modo de razonamiento explicito (thinking mode), vision o audio: no disponible en la informacion proporcionada.

## Casos de uso

- Triaje y orientacion sanitaria en atencion primaria de Timor-Leste: el adaptador puede desplegarse como capa de respuesta en tetun sobre un asistente que formule preguntas de cribado, siempre con supervision de personal sanitario y con un mecanismo de derivacion ante casos graves. Es adecuado por el enfoque especifico en lengua y dominio, aunque requiere validacion clinica previa obligatoria.
- Traduccion y adaptacion de material divulgativo medico al tetun: uso del modelo para proponer borradores de folletos, preguntas frecuentes o guiones de consulta que despues revisa un traductor humano con formacion sanitaria.
- Formacion de personal sanitario y estudiantes: generacion de bancos de preguntas de practica con retroalimentacion, aprovechando el ajuste sobre formato MedQA.
- Preanotacion de corpus medicos en tetun: el adaptador puede generar respuestas candidatas que aceleren el etiquetado manual de conjuntos de datos para investigacion en PLN de bajos recursos.
- Investigacion en eficiencia de ajuste: sirve como punto de partida reproducible para experimentos con QLoRA en lenguas de bajos recursos, comparando rangos, datos y estrategias de cuantizacion.
- Base para ajustes posteriores: al ser un adaptador ligero (0,2 GB), puede combinarse o continuarse con nuevos datos sin necesidad de gestionar los pesos completos del modelo base.
- Prototipado de asistentes de telemedicina con recursos limitados: el coste de almacenamiento y distribucion del adaptador es minimo frente a redistribuir un modelo completo, lo que facilita despliegues en entornos con conectividad y hardware modestos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- El repositorio solo contiene el adaptador (0,2 GB en safetensors). Para inferencia es imprescindible descargar y cargar el modelo base `unsloth/gemma-4-E4B-it`, cuyos requisitos no se documentan en la informacion proporcionada.
- VRAM estimada para inferencia: no disponible. Depende enteramente del tamano y la cuantizacion del modelo base, que no se especifican.
- GPU recomendadas: no disponible por la misma razon.
- Encaje en GPU de consumo: no confirmado. La nomenclatura "E4B" del modelo base sugiere un tamano efectivo en torno a los 4000 millones de parametros, lo que en teoria permitiria inferencia en GPU de consumo con cuantizacion de 4 bits, pero esta estimacion es una inferencia a partir del identificador y no esta respaldada por documentacion del autor.
- Opciones de despliegue: carga mediante PEFT + Transformers sobre el modelo base. Para vLLM, TGI, llama.cpp u Ollama seria necesario fusionar el adaptador con el modelo base y, en su caso, convertir los pesos a GGUF; no se proporcionan artefactos ya fusionados.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| labadain/Labadain-MedQA-QLoRA-Gemma-4-E4B-it-tetun | Adaptador LoRA; base no disponible | No disponible | Sin benchmarks publicados | No disponible | HuggingFace, 0 descargas |
| unsloth/gemma-4-E4B-it (modelo base) | No disponible en la informacion proporcionada | No disponible | No disponible | No disponible | HuggingFace |
| Otros adaptadores LoRA para tetun | No disponible | No disponible | No disponible | No disponible | No identificados en la informacion proporcionada |

No se dispone de datos verificables sobre alternativas comparables en la misma categoria (adaptadores o modelos ajustados para tetun en dominio medico), por lo que la comparacion cuantitativa no esta disponible.

## Limitaciones y advertencias

- Model card vacia: el autor no documenta datos de entrenamiento, hiperparametros, evaluacion ni limitaciones. No es posible verificar ninguna afirmacion sobre el comportamiento del adaptador.
- Ausencia total de benchmarks: no hay evidencia publica de calidad en MedQA ni en ninguna otra tarea, ni en tetun ni en otros idiomas.
- Riesgo elevado de alucinacion en dominio sanitario: un modelo ajustado con datos no documentados puede generar recomendaciones clinicamente incorrectas con apariencia de verosimilitud. No debe usarse como fuente de decision clinica sin revision profesional.
- Sesgos desconocidos: al no documentarse la procedencia de los datos, no puede evaluarse el sesgo de seleccion, la representatividad geografica ni la calidad de las respuestas de referencia.
- Idiomas: el ajuste puede haber degradado las capacidades multilingues del modelo base, un fenomeno habitual en ajustes con datos de una sola lengua. No hay evaluacion de olvido catastrofico.
- Licencia no disponible: la ausencia de licencia explicita impide determinar si el uso comercial esta permitido. Ademas, la licencia aplicable al modelo base condiciona la redistribucion del adaptador fusionado; debe consultarse la del repositorio `unsloth/gemma-4-E4B-it` antes de cualquier uso.
- Dependencia del modelo base: el adaptador no es autonomo. Cualquier cambio, retirada o modificacion de licencia del modelo base afecta directamente a su viabilidad.
- Madurez: 0 descargas y 0 likes, creado y actualizado el mismo dia (23 de octubre de 2026). No hay senales de uso, mantenimiento ni validacion por la comunidad.
- Reproducibilidad: sin hiperparametros ni versiones de libreria documentadas, el resultado no es reproducible.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/labadain/Labadain-MedQA-QLoRA-Gemma-4-E4B-it-tetun
- Modelo base: https://huggingface.co/unsloth/gemma-4-E4B-it
- Paper, blog, repositorio de codigo o demo: no disponible en la informacion proporcionada.
