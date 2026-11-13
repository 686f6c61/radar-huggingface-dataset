# ForeverBlue/EcoWitness-Qwen3.5-9B-RL-LoRA

## Resumen

EcoWitness-Qwen3.5-9B-RL-LoRA es un adaptador LoRA entrenado mediante aprendizaje por refuerzo guiado por verificador sobre el modelo base Qwen/Qwen3.5-9B, un modelo multimodal de 9.000 millones de parametros. Lo desarrolla el usuario ForeverBlue y resuelve una tarea muy concreta: responder preguntas de opcion multiple sobre ecologia fluvial en las que cada evidencia (imagen Sentinel-2, registro de sitio y lista de especies de ADN ambiental) lleva un identificador, y el modelo debe devolver tres lineas con la respuesta, el soporte y la evidencia critica utilizada.

La relevancia tecnica del trabajo no reside en la tarea ecologica en si, sino en el metodo de entrenamiento: un motor de reglas recomputa la respuesta correcta y los conjuntos exactos de evidencia para cualquier estado de evidencia, lo que permite puntuar cada respuesta de forma exacta y aplicar un esquema de policy gradient con ventaja normalizada por episodio. El adaptador entrena 86,6 millones de parametros sobre las proyecciones del modelo de lenguaje, dejando congelados tanto el modelo base como la torre de vision.

El adaptador se publica bajo licencia Apache 2.0, con un tamano de repositorio de 0,4 GB, y esta pensado exclusivamente para el protocolo witness del benchmark EcoWitness, en ingles. No es un asistente general de ecologia ni un modelo de proposito general.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre transformer multimodal Qwen3.5-9B; adaptadores en q/k/v/o, proyecciones de entrada y salida de Gated DeltaNet y MLP |
| Parametros totales | no disponible para el adaptador; 86,6 M parametros entrenables (r = 32, alpha = 64) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (heredada del modelo base Qwen3.5-9B) |
| Tipos de cuantizacion | no disponible (el adaptador se distribuye en safetensors; la cuantizacion depende del modelo base) |
| Idiomas soportados | ingles |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptador LoRA compatible con PEFT) |

## Arquitectura y entrenamiento

El adaptador se aplica sobre Qwen3.5-9B, un modelo multimodal image-text-to-text. El entrenamiento congela el modelo base y adapta unicamente el lado del lenguaje: LoRA con r = 32, alpha = 64 y sin dropout sobre todas las proyecciones del modelo de lenguaje (q/k/v/o, proyecciones de entrada y salida de Gated DeltaNet y MLP), sumando 86,6 M parametros entrenables. La torre de vision y el vision merger no se adaptan, lo que explica que las preguntas de imagen (grupo A) sean las que menos mejora experimentan.

El entrenamiento usa aprendizaje por refuerzo con verificador. En cada paso, por GPU, se generan 16 episodios mezclados en proporcion 0,4 / 0,35 / 0,25 entre pregunta original, edicion silenciosa del estado de evidencia y revision anunciada. Se muestrean 4 respuestas por episodio a temperatura 1, cada una puntuada por un motor de reglas con una recompensa compuesta: respuesta 0,6 (con credito parcial graduado hasta 0,5 para respuestas cercanas), F1 de evidencia critica 0,25, F1 de soporte 0,15 y linea `changed` 0,15 en revisiones. La ventaja es la recompensa menos la media del episodio, y con probabilidad 0,5 se anade la respuesta de referencia como candidato adicional con ventaja 1 menos la media muestreada. Se aplica un paso de policy gradient sobre los candidatos con mayor ventaja absoluta.

Los datos son el split de entrenamiento de EcoWitness v10 en ingles: 80.000 episodios extraidos de 274.181 conversaciones. El schedule comprende 2.500 pasos (1.250 actualizaciones de 64 episodios), AdamW con lr 5e-5, warm-up del 3 %, decaimiento coseno hasta el 10 %, bf16 y semilla 0. El entrenamiento se ejecuto en 2 x NVIDIA H100 de 80 GB durante 17,5 horas, con un pico de memoria de 40 GB por GPU.

## Capacidades

- Respuesta a preguntas de opcion multiple sobre ecologia fluvial en formato witness: tres lineas (`answer`, `support`, `load_bearing`) con identificadores de evidencia.
- Razonamiento sobre evidencia multimodal: imagen Sentinel-2, registro de sitio y lista de especies de ADN ambiental.
- Identificacion de evidencia critica (load_bearing) y de evidencia de soporte, con F1 medido por el motor de reglas.
- Manejo de revisiones anunciadas del estado de evidencia, emitiendo una linea `changed` cuando corresponde.
- Robustez ante ediciones silenciosas del estado de evidencia (contrafactuales).
- Capacidades heredadas del modelo base Qwen3.5-9B (generacion de texto, vision), aunque el adaptador solo ha sido entrenado y validado para el protocolo witness.
- No se documenta soporte de tool calling, function calling ni comportamiento agentico especifico en la informacion disponible.

## Casos de uso

- Evaluacion de modelos con verificador exacto: el motor de reglas recomputa la respuesta y los conjuntos de evidencia para cualquier estado, de modo que el adaptador sirve como referencia reproducible en experimentos de RL con recompensa verificable.
- Investigacion en aprendizaje por refuerzo: el esquema de ventaja normalizada por episodio, el muestreo de 4 respuestas y la insercion de la respuesta de referencia como candidato con ventaja 1 menos la media constituyen una receta replicable para tareas de razonamiento con evidencia estructurada.
- Monitorizacion de ecosistemas fluviales asistida: dado un registro de sitio, una imagen Sentinel-2 y una lista de especies de ADN ambiental, el modelo responde preguntas de opcion multiple sobre el estado ecologico del tramo, siempre que se use el formato de protocolo witness.
- Analisis de sensibilidad a cambios de evidencia: gracias al entrenamiento con ediciones silenciosas y revisiones anunciadas, el adaptador puede emplearse para estudiar como cambia la respuesta cuando se altera una pieza de evidencia, util en auditoria de sistemas de decision.
- Generacion de datos sinteticos etiquetados: las respuestas con evidencia critica identificada pueden servir para construir conjuntos de entrenamiento o validacion en tareas de atribucion de evidencia.
- Docencia e investigacion en ecologia computacional: como banco de pruebas controlado para ensenar tecnicas de RL con verificador y evaluacion exacta, dado que el benchmark cubre grupos de preguntas bien definidos (imagen, rasgos de comunidad, fusion, diversidad, red fluvial, conocimiento de especies).

## Benchmarks y rendimiento

Resultados de validacion durante el entrenamiento sobre una muestra fija de 240 registros (80 por tipo), con sitios disjuntos entre train, validacion y test. El intervalo del 95 % para una precision cercana a 0,9 sobre 240 registros es de aproximadamente +/- 4 puntos.

| step | reward | correct | original question | silent edit | announced revision | load_bearing F1 | support F1 |
|---|---|---|---|---|---|---|---|
| 0 | 0,608 | 0,608 | 0,600 | 0,562 | 0,662 | 0,536 | 0,541 |
| 250 | 0,888 | 0,804 | 0,775 | 0,725 | 0,912 | 0,945 | 0,985 |
| 500 | 0,931 | 0,875 | 0,887 | 0,800 | 0,938 | 0,976 | 0,996 |
| 750 | 0,937 | 0,883 | 0,850 | 0,850 | 0,950 | 0,974 | 0,992 |
| 1000 | 0,940 | 0,892 | 0,875 | 0,825 | 0,975 | 0,977 | 0,993 |
| 1250 | 0,947 | 0,904 | 0,900 | 0,887 | 0,925 | 0,980 | 0,997 |
| 1500 | 0,948 | 0,908 | 0,875 | 0,887 | 0,963 | 0,972 | 0,998 |
| 1750 | 0,963 | 0,938 | 0,925 | 0,912 | 0,975 | 0,980 | 0,992 |
| 2000 | 0,962 | 0,929 | 0,925 | 0,875 | 0,988 | 0,983 | 0,996 |
| 2250 | 0,964 | 0,938 | 0,938 | 0,887 | 0,988 | 0,982 | 0,993 |
| 2500 | 0,963 | 0,938 | 0,925 | 0,900 | 0,988 | 0,974 | 0,994 |

Precision por grupo de preguntas, antes y despues del entrenamiento (grupos con pocos registros, por lo que la cifra individual es ruidosa):

| grupo | step 0 | step 2.500 |
|---|---|---|
| A imagen | 0,55 | 0,70 |
| B rasgos de comunidad | 0,49 | 0,95 |
| C fusion | 0,33 | 0,81 |
| D diversidad | 0,70 | 0,97 |
| E red fluvial | 0,67 | 1,00 |
| K conocimiento de especies | 0,67 | 1,00 |

Los resultados sobre el conjunto de test (7.523 preguntas, 73.245 conversaciones, incluidas metricas de comportamiento en contrafactuales silenciosos y cadenas de revision) no estaban disponibles en el momento de redactar esta ficha; el autor indica que se anadiran cuando finalice la evaluacion.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma especifica para el adaptador; el adaptador suma 86,6 M parametros en bf16 (unos 0,17 GB) sobre el modelo base Qwen3.5-9B. La VRAM total depende del modelo base y de la cuantizacion elegida.
- GPU de entrenamiento documentadas: 2 x NVIDIA H100 de 80 GB, con un pico de 40 GB por GPU durante 17,5 horas.
- GPU recomendadas para inferencia: no disponibles en la informacion proporcionada; al tratarse de un modelo de 9B con componente de vision, cabe esperar requisitos de GPU de gama alta o profesional, pero no se aportan cifras.
- Compatibilidad con GPU de consumo: no disponible en la informacion proporcionada.
- Opciones de despliegue: el ejemplo oficial usa `transformers >= 5.3` con `AutoModelForImageTextToText` y `peft >= 0.18`, fusionando el adaptador con `merge_and_unload()`. No se documentan opciones para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de datos de benchmarks de modelos comparables en la informacion proporcionada, por lo que no es posible establecer una comparativa cuantitativa fiable. A modo de referencia estructural:

| Modelo | Parametros | Contexto | Licencia | Enfoque |
|---|---|---|---|---|
| EcoWitness-Qwen3.5-9B-RL-LoRA | 86,6 M entrenables sobre base de 9B | no disponible | Apache 2.0 | Adaptador LoRA con RL guiado por verificador para ecologia fluvial |
| Qwen/Qwen3.5-9B (base) | 9B | no disponible | no disponible en la informacion proporcionada | Modelo multimodal general image-text-to-text |
| Alternativas de la misma categoria | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Entrenado y validado unicamente sobre las familias de preguntas y el formato de evidencia de este benchmark; no es un asistente general de ecologia.
- Solo ingles.
- Una sola ejecucion de entrenamiento con una sola semilla, sin replicas que permitan estimar la varianza del resultado.
- Las preguntas de imagen (grupo A) mejoran menos (de 0,55 a 0,70) porque el adaptador no toca el lado de vision; el techo en esa familia es estructural.
- El adaptador espera prompts en el formato del protocolo witness, generados por `ecowitness/protocol.py`; fuera de ese formato el comportamiento no esta caracterizado.
- Entrenado con el bloque de razonamiento del chat template cerrado (`enable_thinking=False`); no se documenta el comportamiento con el modo de razonamiento activado.
- Los resultados de validacion se calculan sobre 240 registros, con un margen de +/- 4 puntos para precisiones cercanas a 0,9; las cifras por grupo son especialmente ruidosas.
- Los resultados de test y las metricas de comportamiento en contrafactuales y cadenas de revision no estaban publicados en el momento de redactar esta ficha.
- Riesgo de alucinacion y sesgos: no documentados en la informacion proporcionada.
- Licencia Apache 2.0, que permite uso comercial; conviene verificar igualmente las condiciones del modelo base Qwen3.5-9B antes de un despliegue en produccion.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ForeverBlue/EcoWitness-Qwen3.5-9B-RL-LoRA
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B
- Codigo, metodo y evaluacion: https://github.com/ForeverBlue816/EcoWitness (commit `d262c98`, archivos `ecowitness/rl.py` y `configs/rl.yaml`)
