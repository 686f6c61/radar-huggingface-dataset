# neuroX3/H6-Guard-Honeybot-Scanner

## Resumen

H6-Guard-Honeybot-Scanner es un adaptador LoRA publicado por el usuario neuroX3 sobre el modelo base Qwen/Qwen2.5-Coder-1.5B-Instruct, distribuido a traves de la libreria PEFT en formato safetensors. No se trata por tanto de un modelo completo, sino de pesos de ajuste fino que deben cargarse sobre el modelo base para poder ejecutarse. El repositorio no incluye pesos del modelo base: su tamano declarado es de 0,0 GB, coherente con un adaptador de bajo rango.

La model card publicada es la plantilla generica de HuggingFace sin rellenar: todos los campos relevantes (desarrollador, tipo de modelo, idiomas, licencia, datos de entrenamiento, hiperparametros, evaluacion) aparecen como "[More Information Needed]". El unico contenido informativo es la cabecera de metadatos, que confirma el uso de PEFT 0.20.0 y el modelo base sobre el que se entrena. No hay ningun resultado de evaluacion, ninguna descripcion del dataset ni ninguna indicacion de como se generaron los pesos.

El nombre del repositorio sugiere una funcion de guardia o escaneo (los terminos "Guard", "Honeybot" y "Scanner" apuntan a un hipotetico clasificador de contenido o detector de interacciones maliciosas), pero esta interpretacion no esta respaldada por ningun texto de la model card y debe tratarse como una hipotesis, no como una caracteristica documentada. En el momento de redactar esta ficha el repositorio acumula 0 descargas y 0 "likes", y fue creado y actualizado el 14 de septiembre de 2026. Su relevancia practica es, por ahora, muy limitada: se trata de un artefacto sin documentacion, sin licencia declarada y sin validacion publica.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (PEFT) sobre un transformer decoder-only; arquitectura del modelo base Qwen2.5-Coder-1.5B-Instruct |
| Parametros totales | 1.500 millones en el modelo base; numero de parametros entrenables del adaptador: no disponible (rango y alpha no documentados) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | 32.768 tokens en el modelo base segun su documentacion publica; no verificado ni declarado en la model card del adaptador |
| Tipos de cuantizacion | No disponible en el repositorio (los pesos se distribuyen como adaptador LoRA en safetensors, sin cuantizaciones publicadas; el modelo base admite cuantizacion posterior a 8 y 4 bits) |
| Idiomas soportados | No disponible |
| Licencia | No disponible (campo vacio en la ficha de HuggingFace; el modelo base es Apache 2.0) |
| Formato de pesos | safetensors, adaptador LoRA cargable con PEFT/transformers |
| Libreria | PEFT 0.20.0 |
| Tipo de pipeline | text-generation |
| Tamano del repositorio | 0,0 GB |
| Descargas / likes | 0 / 0 |
| Fecha de creacion | 2026-09-14 |
| Ultima actualizacion | 2026-09-14 |

## Arquitectura y entrenamiento

El adaptador se construye sobre Qwen2.5-Coder-1.5B-Instruct, un transformer decoder-only de 1.500 millones de parametros con atencion causal, normalizacion RMSNorm y embeddings ligados (tied embeddings), disenado por el equipo Qwen para tareas de generacion y comprension de codigo. La tecnica de ajuste es LoRA (Low-Rank Adaptation), que congela los pesos del modelo base e inserta matrices de bajo rango en determinadas capas, de modo que el numero de parametros entrenables es muy inferior al total. El repositorio no especifica en que modulos se aplica el adaptador, ni el rango, ni el valor de alpha, ni el dropout utilizado.

No hay absolutamente ningun dato sobre el procedimiento de entrenamiento: se desconoce el dataset, el numero de tokens vistos, la composicion del corpus, si hubo una etapa de ajuste supervisado, DPO, RLHF u otra optimizacion por preferencias, y tampoco se documentan los hiperparametros (tasa de aprendizaje, tamano de lote, epocas, regimen de precision). El unico dato tecnico verificable es la version de la libreria empleada (PEFT 0.20.0), que figura en la seccion de versiones de framework de la model card. No se puede confirmar por tanto ninguna innovacion tecnica ni ninguna particularidad del ajuste.

## Capacidades

- No hay ninguna capacidad documentada explicitamente en la model card del adaptador; las capacidades que se enumeran a continuacion son las del modelo base sobre el que se aplica el adaptador y deben validarse empiricamente para esta version ajustada.
- Generacion de texto y finalizacion de codigo, heredadas del modelo base Qwen2.5-Coder-1.5B-Instruct.
- Razonamiento basico sobre fragmentos de codigo y explicacion de funciones sencillas.
- Conversacion multi-turno: la etiqueta "conversational" del repositorio y el sufijo "Instruct" del modelo base apuntan a un formato de dialogo con plantilla de chat de Qwen, aunque la plantilla concreta del adaptador no esta documentada.
- Soporte de tool calling: no disponible (no se especifica si el ajuste conserva o modifica la capacidad del modelo base).
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible (el modelo base esta entrenado mayoritariamente en ingles y chino, pero el comportamiento del adaptador en otros idiomas no se ha documentado).
- Capacidades especiales (modo de razonamiento explicito, vision, audio): no disponible.
- Funcion de guardia o escaneo sugerida por el nombre del repositorio: no documentada y sin evidencia en la model card.

## Casos de uso

Advertencia previa: la model card no describe ningun uso previsto, por lo que los escenarios siguientes son propuestas derivadas de las caracteristicas del modelo base y del nombre del repositorio, no casos validados por el autor. Cualquier uso en produccion exige una evaluacion propia.

- Clasificacion de codigo potencialmente peligroso en un pipeline de revision: el adaptador podria integrarse como etapa previa al merge en un sistema de CI/CD para marcar fragmentos sospechosos (por ejemplo, ejecucion de comandos en el shell o conexiones de red no declaradas), aprovechando su herencia de un modelo especializado en codigo. Requiere validacion propia porque no hay ninguna metrica publicada.
- Filtro de entrada en un chatbot: dado el nombre "Guard", podria emplearse para etiquetar mensajes de usuario antes de pasarlos a un modelo mayor, con un coste de computo bajo gracias a sus 1.500 millones de parametros.
- Deteccion de interacciones automatizadas tipo honeypot: si el ajuste se ha orientado a reconocer patrones de sondeo o escaneo, podria actuar como clasificador binario sobre registros de peticiones, aunque no existe documentacion que confirme este comportamiento.
- Asistente de autocompletado de codigo en el IDE: con 32.768 tokens de contexto en el modelo base, puede mantener el contenido de varios ficheros abiertos y sugerir completaciones en tiempo real en una GPU de gama media.
- Generacion de pruebas unitarias para funciones existentes: el modelo base rinde razonablemente en tareas de traduccion de codigo a tests y el adaptador podria especializarse en un dominio concreto, si bien se desconoce cual.
- Etiquetado de datos a gran escala: por su tamano reducido, puede desplegarse en muchas instancias en paralelo para preanotar corpus de codigo o conversaciones antes de una revision humana.
- Componente de un sistema multi-agente: podria actuar como subrutina especializada de bajo coste dentro de un flujo mayor, delegando el razonamiento complejo en un modelo de mayor tamano.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye seccion de evaluacion cumplimentada, no hay tabla de resultados y no se referencia ningun dataset de evaluacion. Tampoco existe ningun informe externo, demo ni hilo de discusion asociado al repositorio que aporte mediciones. En consecuencia, no es posible comparar su rendimiento en MMLU, HumanEval, GSM8K, MBPP ni en cualquier otro conjunto de referencia.

Datos de contexto verificables en la ficha: 0 descargas y 0 "likes" en el momento de la consulta, lo que indica ausencia de validacion por parte de la comunidad.

## Requisitos de hardware

Las cifras siguientes son estimaciones calculadas a partir de los 1.500 millones de parametros del modelo base; no proceden de ninguna medicion publicada del adaptador.

- Pesos del modelo base en precision FP16/BF16: aproximadamente 3,0-3,1 GB (1,5 x 10^9 parametros x 2 bytes).
- Pesos en 8 bits: aproximadamente 1,5-1,6 GB.
- Pesos en 4 bits (por ejemplo GGUF Q4_K_M): aproximadamente 0,9-1,1 GB.
- Adaptador LoRA: el repositorio declara 0,0 GB, lo que implica un fichero por debajo de las decenas de megabytes; el coste del adaptador es despreciable frente al del modelo base.
- VRAM total recomendada para inferencia en FP16, incluyendo cache KV y activaciones: 6-8 GB para una ventana de contexto moderada (4.000-8.000 tokens); la cache KV crece de forma lineal con el contexto.
- VRAM estimada en 4 bits: 2-3 GB con contexto moderado, suficiente para GPUs de consumo como RTX 3060 de 12 GB, RTX 4060, RTX 4070 o superiores.
- Cabe en GPU de consumo: si, con cuantizacion de 4 u 8 bits cabe en la mayoria de GPUs con 6 GB o mas; en FP16 tambien cabe en GPUs de 8-12 GB.
- Cabe en CPU: si, mediante llama.cpp u Ollama con cuantizacion de 4 bits, con velocidades de decodificacion de unos pocos tokens por segundo, muy dependientes del hardware.
- Opciones de despliegue: transformers + PEFT (carga directa del adaptador), vLLM con soporte de LoRA (opcion --enable-lora, requiere fusionar o servir el adaptador junto al base), HuggingFace TGI, y llama.cpp/Ollama previa fusion del adaptador con el modelo base o exportacion mediante el flujo de conversion de LoRA a GGUF. Text Generation Inference y vLLM son las opciones mas eficientes para servir multiples peticiones concurrentes.
- Latencia y throughput: no disponible (no hay mediciones publicadas).

## Comparativa con modelos similares

No se conocen adaptadores comparables publicados con documentacion suficiente para establecer una comparacion rigurosa. La tabla siguiente contrasta el modelo base de este adaptador con dos alternativas de la misma categoria de tamano, usando unicamente datos publicos de sus respectivas fichas; las cifras no han sido verificadas en el contexto de este repositorio y no incluyen ningun dato de rendimiento.

| Modelo | Parametros | Contexto | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|
| neuroX3/H6-Guard-Honeybot-Scanner (este repositorio) | Adaptador sobre base de 1,5 B | No declarado en la ficha | No disponible | safetensors (LoRA/PEFT) | 0 descargas, 0 likes |
| Qwen/Qwen2.5-Coder-1.5B-Instruct (modelo base) | 1,5 B | 32.768 tokens, ampliable a 131.072 con YaRN segun documentacion publica | Apache 2.0 | safetensors, GGUF en repositorios derivados | Ampliamente utilizado, multiples derivados |
| Qwen/Qwen2.5-Coder-7B-Instruct | 7 B | Igual que el anterior segun documentacion publica | Apache 2.0 | safetensors, GGUF | Muy extendido |
| Llama-3.2-1B-Instruct | 1 B | 128.000 tokens segun documentacion publica | Licencia comunitaria Llama 3.2 | safetensors, GGUF | Muy extendido |

La diferencia fundamental entre este repositorio y las alternativas es que estas ultimas son modelos completos con documentacion, evaluacion y licencia explicitas, mientras que H6-Guard-Honeybot-Scanner es un adaptador sin ninguna de esas garantias.

## Limitaciones y advertencias

- Ausencia total de documentacion: la model card es la plantilla vacia de HuggingFace, sin descripcion de uso previsto, datos de entrenamiento ni evaluacion.
- Licencia no declarada: al no especificarse licencia, no existe autorizacion explicita de uso, copia, modificacion ni redistribucion. Para uso comercial es imprescindible contactar con el autor, ya que la licencia del modelo base (Apache 2.0) no cubre automaticamente los pesos derivados si el autor no la propaga.
- Sin validacion publica: 0 descargas y 0 "likes"; no hay evidencia de que el adaptador funcione segun lo que sugiere su nombre.
- Riesgo de alucinacion: inherente a un modelo base de 1,5 B de parametros, especialmente en tareas de razonamiento, matematicas o conocimiento factual. No se ha medido su tasa de error.
- Sesgos: no evaluados. El modelo base se entrena mayoritariamente con texto en ingles y chino, por lo que el comportamiento en castellano y en otros idiomas sera previsiblemente peor y no esta documentado.
- Ambiguedad funcional: el nombre sugiere una funcion de guardia o deteccion de amenazas, pero no existe ninguna prueba de que el ajuste la implemente. Un falso sentido de seguridad derivado del nombre seria el riesgo mas grave en produccion.
- Limitacion de contexto: aunque el modelo base soporta 32.768 tokens, un adaptador LoRA no garantiza el mismo rendimiento en ventanas largas si el ajuste se hizo con secuencias cortas, dato que se desconoce.
- Formato dependiente: al ser un adaptador PEFT, no se puede desplegar de forma autonoma; requiere el modelo base exacto y una version compatible de la libreria PEFT (el autor registro la 0.20.0).
- Trazabilidad: el unico identificador del autor es un nombre de usuario, sin repositorio de codigo, informe tecnico ni forma de contacto publicada.
- Fecha de publicacion anomala: las marcas temporales indican creacion y actualizacion el 14 de septiembre de 2026, apenas 22 minutos de diferencia entre ambas, lo que sugiere una subida automatizada sin revision posterior.

## Enlaces

- Repositorio del adaptador en HuggingFace: https://huggingface.co/neuroX3/H6-Guard-Honeybot-Scanner
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-Coder-1.5B-Instruct
- Documentacion de PEFT: https://huggingface.co/docs/peft
- Referencia citada en la plantilla de la model card (Lacoste et al., 2019, cuantificacion del impacto ambiental): https://arxiv.org/abs/1910.09700
- Calculadora de impacto ambiental de aprendizaje automatico: https://mlco2.github.io/impact
- No se han encontrado papers, blogs, demos, repositorios de codigo ni hilos de discusion asociados a este modelo en la informacion disponible.
