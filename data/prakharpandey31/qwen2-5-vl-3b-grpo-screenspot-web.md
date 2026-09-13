# Prakharpandey31/qwen2.5-vl-3b-grpo-screenspot-web

## Resumen

Qwen2.5-VL-3B-GRPO-ScreenSpot-Web es un conjunto de adaptadores LoRA publicados por el usuario Prakharpandey31 sobre el modelo base Qwen/Qwen2.5-VL-3B-Instruct, orientados a una tarea muy concreta: el grounding de clics en interfaces web. Dado un texto de instruccion y una captura de pantalla, el modelo devuelve un punto de clic en coordenadas de pixel con el formato `<click>x,y</click>`. No es un modelo nuevo desde cero, sino un post-entrenamiento de un VLM de 3 000 millones de parametros ya existente.

El entrenamiento sigue un esquema de dos fases: un arranque en caliente con SFT (supervised fine-tuning) sobre el dataset rootsautomation/ScreenSpot y, a continuacion, optimizacion con GRPO (Group Relative Policy Optimization) usando una recompensa geometrica basada en la distancia entre el clic predicho y el clic objetivo. El repositorio contiene dos adaptadores (`sft_lora` y `grpo_lora`), lo que permite comparar directamente el efecto de la fase de RL frente a la fase supervisada.

La relevancia actual del modelo esta en el nicho de los agentes GUI: la precision de grounding es el cuello de botella de cualquier agente que opere un navegador. Con solo 3B de parametros y un adaptador de bajo rango, el salto reportado por el autor en la metrica global (de 71,6 % a 81,8 % en un split retenido de ScreenSpot-Web) resulta interesante para prototipos con recursos limitados, aunque el tamano de la evaluacion (n=88) obliga a tomar las cifras con cautela.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only multimodal (Qwen2.5-VL) con adaptadores LoRA sobre las capas del modelo base |
| Parametros totales | No disponible con precision. Modelo base: 3B (Qwen2.5-VL-3B-Instruct). Adaptadores LoRA: fraccion de bajo rango, repo de 0,3 GB |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada. El modelo base Qwen2.5-VL-3B-Instruct declara 32 768 tokens |
| Tipos de cuantizacion | No disponible. Los adaptadores se distribuyen en safetensors; el modelo base fusionado se puede cuantizar con herramientas de terceros |
| Idiomas soportados | No disponible. Hereda los idiomas del modelo base, no especificados en la ficha |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (adaptadores PEFT/LoRA, subcarpetas `grpo_lora` y `sft_lora`) |
| Dataset de entrenamiento | rootsautomation/ScreenSpot (ScreenSpot-Web) |
| Libreria | peft (compatible con transformers) |
| Precisión de referencia | bfloat16 (`torch_dtype="bfloat16"`) |
| Preprocesado de imagen | `min_pixels=256*28*28`, `max_pixels=1024*28*28` |

## Arquitectura y entrenamiento

El modelo reutiliza la arquitectura de Qwen2.5-VL-3B-Instruct: un transformer decoder-only con un codificador visual que procesa la captura de pantalla y proyecta sus representaciones en el espacio de tokens del modelo de lenguaje. Sobre esa base se anaden adaptadores LoRA, es decir, matrices de bajo rango inyectadas en capas concretas del transformer que se entrenan mientras los pesos originales permanecen congelados. El resultado final se obtiene cargando el modelo base y superponiendo el adaptador con `PeftModel.from_pretrained`.

El pipeline de post-entrenamiento descrito en la model card consta de dos etapas. Primero un SFT warm-start sobre ScreenSpot-Web, que ensena al modelo el formato de salida `<click>x,y</click>` y lo adapta al dominio de capturas de interfaz. Despues, un entrenamiento con GRPO en el que la funcion de recompensa es geometrica: mide la bondad del clic predicho respecto al objetivo, lo que permite optimizar directamente la metrica que importa (precision del punto de clic) en lugar de la verosimilitud de la secuencia. El autor publica el formato de prompt, la recompensa y el codigo de entrenamiento y evaluacion en el repositorio de GitHub enlazado.

## Capacidades

- Grounding de clics en interfaces web: devuelve un unico punto en coordenadas de pixel a partir de una instruccion en lenguaje natural.
- Distincion entre elementos de texto e iconos, con metricas desglosadas por categoria en la evaluacion del autor.
- Salida estructurada y restringida: el prompt exige responder exclusivamente con `<click>x,y</click>`, sin texto adicional.
- Procesamiento de imagenes de resolucion variable mediante los limites `min_pixels`/`max_pixels` del procesador.
- Comprension vision-lenguaje heredada del modelo base Qwen2.5-VL-3B-Instruct (descripcion de imagenes, OCR, razonamiento visual), aunque el adaptador esta especializado en grounding web y no se han medido esas capacidades tras el post-entrenamiento.
- Tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes multi-paso: no entrenado explicitamente para ello; el adaptador cubre unicamente el paso de localizacion del elemento a clicar.
- Capacidades multilingues: no disponibles.
- Modo thinking, audio o video: no disponibles.

## Casos de uso

- Agentes de automatizacion de navegador: dado un objetivo en lenguaje natural ("pulsa el boton de enviar"), el modelo localiza el elemento y devuelve el par de coordenadas que un driver (Playwright, Selenium) convierte en un clic real. La salida en formato fijo simplifica el parseo en el bucle del agente.
- Testing automatizado de interfaces web: sustituye selectores CSS fragiles por localizacion visual, de modo que los tests siguen funcionando aunque cambien los identificadores del DOM o el framework de front-end.
- Asistentes de accesibilidad: ayuda a usuarios con dificultades motoras o visuales a ejecutar acciones sobre una pagina indicando el elemento en lenguaje natural, ejecutando el clic en su nombre.
- Rellenado de formularios y tareas repetitivas de back-office: localizar campos concretos en pantallas de portales internos o de terceros donde no existe una API disponible.
- Copiloto embebido en una extension de navegador: con 3B de parametros y un adaptador pequeno, es viable desplegarlo en infraestructura propia y responder a cada instruccion con latencia de un solo paso, sin enviar capturas de pantalla a servicios externos.
- Anotacion de datasets de grounding: el modelo puede pre-etiquetar capturas y pares instruccion-elemento, que despues se revisan manualmente, reduciendo el coste de construir datasets de UI.
- Reproduccion de investigacion en RL para VLMs: el repositorio sirve como caso de estudio reproducible de SFT + GRPO con recompensa geometrica sobre un modelo de 3B, util para experimentar con funciones de recompensa alternativas.
- Operacion de paneles de analitica o herramientas SaaS sin API publica: encadenar instrucciones de navegacion paso a paso para extraer datos de forma periodica.

## Benchmarks y rendimiento

Resultados facilitados por el autor: precision de clic en porcentaje sobre un split retenido de ScreenSpot-Web con n=88. Las columnas Text e Icon desglosan por tipo de elemento objetivo.

| Modelo / adaptador | Overall | Text | Icon |
|---|---|---|---|
| Base (sin adaptador) | 71,6 | 84,1 | 59,1 |
| `sft_lora` | 77,3 | 77,3 | 77,3 |
| `grpo_lora` | 81,8 | 79,5 | 84,1 |

El adaptador `grpo_lora` mejora al modelo base en 10,2 puntos de precision global y en 25,0 puntos en la categoria de iconos, mientras que en texto baja 4,6 puntos. El adaptador `sft_lora` muestra valores identicos en las tres columnas, lo que sugiere que las cifras reportadas para esa variante corresponden al agregado global. No se han publicado otros resultados de benchmarks (MMLU, HumanEval, GSM8K u otros) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo base de 3B en bfloat16 ocupa aproximadamente 6-7 GB solo en pesos. Sumando el codificador visual, el procesado de imagenes a resolucion de hasta 1024x28x28 pixeles y la cache KV, conviene reservar del orden de 10-12 GB para trabajar con comodidad.
- GPU recomendadas: cualquier GPU con 12 GB o mas de VRAM. En el extremo profesional, A100, H100 o L40S para servir varias peticiones concurrentes; en el extremo de consumo, RTX 3060 12 GB, RTX 4070 Ti Super, RTX 4080/4090.
- Cabe en GPU de consumo: si, en tarjetas de 12 GB o superiores con cuantizacion o con lotes pequenos. El repositorio de adaptadores ocupa 0,3 GB, por lo que el peso del modelo base domina los requisitos.
- Opciones de despliegue: al ser un adaptador PEFT, la ruta natural es `transformers` + `peft` (como muestra la model card). Para servir en produccion se puede fusionar el adaptador con el modelo base y desplegar con vLLM o TGI; llama.cpp y Ollama requieren convertir el modelo fusionado a GGUF. El subfolder del adaptador debe especificarse en la carga (`subfolder="grpo_lora"` o `subfolder="sft_lora"`).
- Latencia y throughput estimados: no disponibles. Al tratarse de una tarea de un unico paso con salida muy corta (unas pocas decenas de tokens), la latencia vendra dominada por el preprocesado de la imagen y el prefill visual, no por la decodificacion.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento en ScreenSpot-Web | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen2.5-VL-3B + `grpo_lora` (este modelo) | 3B + LoRA | No disponible (base: 32 768) | 81,8 % overall (n=88) | apache-2.0 | HuggingFace, adaptador PEFT |
| Qwen2.5-VL-3B + `sft_lora` | 3B + LoRA | No disponible (base: 32 768) | 77,3 % overall (n=88) | apache-2.0 | HuggingFace, adaptador PEFT |
| Qwen2.5-VL-3B-Instruct (base) | 3B | 32 768 | 71,6 % overall (n=88) | apache-2.0 | HuggingFace |
| Otros modelos especializados en grounding GUI (UI-TARS, ShowUI, OS-Atlas) | No disponible | No disponible | No disponible en la informacion proporcionada | No disponible | No disponible |

La comparacion con alternativas especializadas no puede establecerse con rigor porque no se han recuperado sus resultados sobre el mismo split ni con el mismo protocolo de evaluacion. Cualquier comparacion directa exigiria reevaluar todos los modelos sobre el mismo conjunto.

## Limitaciones y advertencias

- Alcance muy restringido: el adaptador esta entrenado exclusivamente para grounding de clics en web. No se ha validado para interfaces de escritorio, moviles o videojuegos.
- Evaluacion de tamano reducido: n=88 en un unico split retenido. Las diferencias de pocos puntos entre variantes no son estadisticamente concluyentes.
- Degradacion en la categoria de texto: el adaptador `grpo_lora` baja de 84,1 % a 79,5 % en elementos textuales respecto al modelo base, por lo que la mejora global esconde un intercambio de rendimiento entre texto e iconos.
- Riesgo de alucinacion: el modelo siempre devuelve un par de coordenadas, incluso si el elemento descrito no existe en la captura. El sistema que lo consume debe validar el clic o detectar puntos fuera de rango.
- Dependencia del formato de prompt: el autor especifica una plantilla concreta. Desviarse de ella (por ejemplo, pidiendo varios clics o anadiendo texto explicativo) puede degradar la precision de forma notable, ya que no hay datos de generalizacion fuera de ese formato.
- Sesgos: no disponibles. No se han documentado analisis de sesgo sobre el dataset ScreenSpot ni sobre el modelo resultante.
- Idiomas: no disponibles. El comportamiento del adaptador con instrucciones en castellano no esta verificado.
- Licencia: apache-2.0 tanto en el adaptador como en el modelo base, lo que permite uso comercial. Se deben respetar igualmente los terminos del dataset rootsautomation/ScreenSpot empleado en el entrenamiento.
- Idoneidad para produccion: el modelo es un adaptador de investigacion con cero descargas y sin pipeline declarado. Antes de usarlo en un sistema real conviene reproducir la evaluacion sobre datos propios y con un conjunto de test mayor.
- Consumo de resolucion de imagen: la calidad del grounding depende de la resolucion efectiva con la que se procesa la captura; pantallas muy densas o con escalado del navegador pueden degradar el resultado.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Prakharpandey31/qwen2.5-vl-3b-grpo-screenspot-web
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-VL-3B-Instruct
- Dataset de entrenamiento: https://huggingface.co/datasets/rootsautomation/ScreenSpot
- Codigo de prompt, recompensa, entrenamiento y evaluacion: https://github.com/prakhar1605/grpo-web-grounding
