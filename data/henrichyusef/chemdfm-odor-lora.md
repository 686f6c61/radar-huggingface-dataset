# henrichyusef/chemdfm-odor-lora

## Resumen

chemdfm-odor-lora es un adaptador LoRA (con posible entrenamiento en QLoRA, segun los tags del repositorio) publicado por el usuario henrichyusef sobre el modelo base OpenDFM/ChemDFM-v1.5-8B. Su proposito declarado, a partir de los tags, es la prediccion de olor a partir de representaciones SMILES dentro de un pipeline de generacion de texto conversacional orientado a quimica. El repositorio tiene un tamano de 0,2 GB, lo que es coherente con un adaptador de bajo rango y no con un modelo completo.

El modelo base ChemDFM-v1.5-8B es un modelo de lenguaje de aproximadamente 8.000 millones de parametros especializado en quimica y publicado por OpenDFM. El adaptador hereda por tanto la arquitectura, el tokenizador y la ventana de contexto del modelo base, aunque la ficha del adaptador no documenta ninguno de esos datos de forma explicita.

La relevancia de esta publicacion es limitada en el momento actual: el repositorio no registra descargas ni interacciones, no declara licencia, no especifica idiomas y esta sujeto a acceso restringido (gated), por lo que requiere aceptar condiciones en Hugging Face antes de su descarga. Debe tratarse como un experimento de ajuste fino y no como un artefacto listo para produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA sobre transformer decoder-only (modelo base OpenDFM/ChemDFM-v1.5-8B); detalles de atencion del base no disponibles |
| Parametros totales | No disponible para el adaptador; el modelo base tiene aproximadamente 8.000 millones de parametros |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible en la ficha del adaptador; heredada del modelo base (no confirmada) |
| Tipos de cuantizacion | El adaptador se distribuye en safetensors; los tags mencionan qlora, lo que sugiere entrenamiento con cuantizacion del base, pero no se documentan cuantizaciones de inferencia publicadas |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | safetensors (adaptador PEFT); el base se distribuye por separado |
| Libreria | peft |
| Modelo base | OpenDFM/ChemDFM-v1.5-8B |
| Tamano del repositorio | 0,2 GB |
| Acceso | Restringido (gated), requiere aceptar condiciones en Hugging Face |
| Tags declarados | chemistry, smiles, odor-prediction, lora, qlora, text-generation, conversational |

## Arquitectura y entrenamiento

El artefacto es un adaptador de bajo rango (LoRA) acoplado a un modelo base de tipo transformer decoder-only de unos 8.000 millones de parametros. No se dispone de informacion sobre el rango del adaptador, las capas objetivo, el alpha, el dropout ni la tasa de aprendizaje empleada. Los tags incluyen tanto lora como qlora, lo que apunta a un ajuste fino con el modelo base cuantizado durante el entrenamiento, pero el repositorio no aporta configuracion de entrenamiento verificable.

Tampoco se documentan el volumen de datos de entrenamiento, la composicion del dataset de olores, el numero de tokens vistos, ni si se aplicaron tecnicas de alineacion como RLHF o DPO. La unica senal sobre la tarea es la combinacion de los tags smiles y odor-prediction, que sugiere un corpus de pares molecula- descriptores olfativos. Cualquier afirmacion adicional sobre el proceso de entrenamiento seria especulativa.

## Capacidades

- Generacion de texto conversacional, segun el pipeline declarado (text-generation) y el tag conversational.
- Procesamiento de representaciones SMILES como entrada textual, segun el tag smiles.
- Prediccion de descriptores de olor a partir de estructuras quimicas, segun el tag odor-prediction.
- Herencia de las capacidades del modelo base ChemDFM-v1.5-8B en el dominio quimico, aunque el adaptador no documenta cuales se preservan.
- Soporte de tool calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponibles.
- Capacidades especiales (modo thinking, vision, audio): no disponibles.

## Casos de uso

- Cribado temprano de moleculas odorantes: dado un SMILES candidato, el adaptador puede generar una descripcion textual del perfil olfativo esperado, lo que permite priorizar compuestos en el diseno de fragancias antes de sintetizarlos.
- Enriquecimiento de bases de datos quimicas: procesar catalogos de estructuras y anadir anotaciones de olor de forma semiautomatica, con revision humana posterior dado el caracter experimental del modelo.
- Asistencia en formulacion de perfumeria: consultar el modelo de forma conversacional sobre familias olfativas asociadas a una estructura, integrandolo en una herramienta interna para quimicos de fragancias.
- Investigacion en quimica computacional: usar el adaptador como linea base en experimentos de prediccion de propiedades sensoriales y comparar con modelos discriminativos dedicados.
- Docencia y divulgacion: generar explicaciones en lenguaje natural que relacionen grupos funcionales con notas olfativas, siempre con validacion por parte del instructor.
- Prototipado rapido de asistentes quimicos: desplegar un chatbot de dominio sobre el modelo base con el adaptador cargado mediante PEFT, para evaluar si la tarea de olor justifica un desarrollo mayor.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- El adaptador en si ocupa 0,2 GB, pero la inferencia requiere cargar el modelo base completo de aproximadamente 8.000 millones de parametros.
- En precision completa (FP16/BF16), el base necesita del orden de 16 GB solo para pesos, mas memoria para el contexto y el runtime; en la practica se recomienda al menos 24 GB de VRAM.
- Cuantizado a 8 bits, el base se situa en torno a 8-9 GB de pesos; a 4 bits, en torno a 4-5 GB, con la sobrecarga adicional de cache KV y activaciones.
- GPU de datacenter recomendadas: A100 40/80 GB, H100, L40S. GPU de consumo viables con cuantizacion: RTX 4090 (24 GB) sin problema, RTX 3090 (24 GB) y, con cuantizacion agresiva a 4 bits, tarjetas de 12-16 GB como RTX 4070 Ti o RTX 4080.
- Opciones de despliegue: transformers con peft para cargar el adaptador, vLLM o TGI para servir el base fusionado con el adaptador, y llama.cpp/Ollama si se fusionan y convierten los pesos a GGUF.
- Latencia y throughput: no disponibles; no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| chemdfm-odor-lora (este) | Adaptador sobre base de ~8B | No disponible | Prediccion de olor desde SMILES | No disponible | Gated, 0 descargas |
| OpenDFM/ChemDFM-v1.5-8B | ~8B | No disponible en esta ficha | LLM general de quimica | No disponible | Publico en Hugging Face |
| Modelos discriminativos de prediccion de olor (p. ej. basados en GNN o fingerprints) | Variable, tipicamente millones | No aplica | Regresion/clasificacion de descriptores olfativos | Variable | Multiples implementaciones publicas |
| LLM generalistas de ~7-8B ajustados con LoRA | ~7-8B | 4K-32K segun familia | Tareas diversas | Variable | Amplia |

La comparacion cuantitativa de rendimiento no es posible: no hay benchmarks publicados para este adaptador y las alternativas de prediccion de olor no comparten un protocolo de evaluacion comun en la informacion disponible.

## Limitaciones y advertencias

- Ausencia total de benchmarks: no hay evidencia publicada de calidad en la tarea de prediccion de olor.
- Licencia no declarada: no puede asumirse uso comercial; ademas, la licencia del modelo base ChemDFM-v1.5-8B condiciona la del adaptador y debe verificarse por separado.
- Acceso restringido: el repositorio es gated y requiere aceptar condiciones, lo que anade friccion a la reproducibilidad.
- Sin documentacion de datos de entrenamiento: se desconoce el sesgo del corpus de olores, su cobertura quimica y su procedencia, lo que impide evaluar sesgos sistematicos.
- Riesgo de alucinacion alto en un modelo generativo aplicado a una tarea de prediccion: puede producir descriptores olfativos plausibles pero incorrectos para estructuras fuera de la distribucion de entrenamiento.
- Idiomas no declarados: no puede garantizarse un comportamiento correcto en castellano ni en otros idiomas distintos del usado en el ajuste.
- Contexto no documentado en el adaptador: secuencias SMILES largas o moleculas grandes pueden exceder la ventana efectiva del base.
- Estado experimental: cero descargas y cero interacciones en el momento de la consulta; no debe desplegarse en produccion sin validacion propia.
- El tag qlora sugiere cuantizacion durante el entrenamiento, pero no hay garantia de que el adaptador se comporte igual al fusionarse con el base en otras precisiones.

## Enlaces

- Repositorio del adaptador: https://huggingface.co/henrichyusef/chemdfm-odor-lora
- Modelo base: https://huggingface.co/OpenDFM/ChemDFM-v1.5-8B
- Libreria PEFT: https://github.com/huggingface/peft
- No se han encontrado en la busqueda web papers, blogs, repositorios ni demos adicionales asociados a este adaptador.
