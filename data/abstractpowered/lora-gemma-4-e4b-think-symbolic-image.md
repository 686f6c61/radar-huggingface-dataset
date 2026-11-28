# AbstractPowered/lora-gemma-4-e4b-think-symbolic-image

## Resumen

Ulisse E4B v1.2 es un adaptador LoRA sobre el modelo vision-lenguaje google/gemma-4-E4B-it, desarrollado por AbstractPowered. Su funcion es acotada y concreta: dado un par imagen-texto, produce una "lectura" estructurada de la imagen compuesta por una cadena de pensamientos en lenguaje llano (con pasos nombrados como `see`, `relate`, `mood`), seguida de formulaciones tipo caption, prompt, etiquetas y critica, y finalmente preguntas que un observador cuidadoso se haria junto con sus respuestas. No es un modelo generalista, sino una utilidad especializada en analisis visual descriptivo y razonamiento encadenado sobre imagenes.

El adaptador se apoya en el miembro de 4 mil millones de parametros efectivos de la familia Ulisse, construido sobre Gemma 4. La version 1.2 reproduce la receta de Lucia 4B v1.2 trasladada a Gemma 4, con un entrenamiento de 91.138 filas (mas de cuatro veces las 20.836 de la version 1) en una sola pasada de 10.137 pasos, e incorpora un segundo objetivo que mantiene al adaptador proximo a su modelo base en peticiones ordinarias. Esta ultima caracteristica es la novedad principal de la linea Ulisse: limita la deriva del adaptador fuera de su tarea especifica.

El modelo es relevante para quienes necesitan pipelines de anotacion visual con trazabilidad del razonamiento, ya que expone explicitamente la cadena de pensamiento y distingue entre hechos registrados de la imagen, deducciones de la cadena e incognitas. Su licencia Apache-2.0 y su naturaleza de adaptador lo hacen ligero de distribuir (0,3 GB de repositorio), aunque su alcance funcional es deliberadamente estrecho y su unico idioma declarado es el ingles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA sobre transformer vision-lenguaje (base: google/gemma-4-E4B-it) |
| Parametros totales | Adaptador LoRA; base de 4 mil millones de parametros efectivos (E4B) |
| Parametros activos | No disponible (la base es E4B; no se detalla si es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (libreria PEFT) |

## Arquitectura y entrenamiento

El adaptador se aplica sobre google/gemma-4-E4B-it, un modelo vision-lenguaje de la familia Gemma 4 con 4 mil millones de parametros efectivos. La tecnica de ajuste es LoRA mediante la libreria PEFT, lo que permite distribuir unicamente los pesos del adaptador (repositorio de 0,3 GB) en lugar del modelo completo. El pipeline declarado es `image-text-to-text`, y el entrenamiento muestra al modelo la imagen de cada fila que trata sobre una imagen (las especificaciones dibujadas no llevan imagen).

El conjunto de entrenamiento consta de 91.138 filas, correspondientes a la parte Apache-2.0 de la release 5 del dataset thought-symbolic-image-recaptioned (95.481 filas), menos 3.718 filas de fotografias COCO 2017 bajo otras licencias, 609 filas reservadas para evaluacion y 16 filas cuyas imagenes no estan disponibles en ningun almacen. Las filas son lecturas de fotografias DOCCI y COCO 2017, de obras de la National Gallery of Art y de especificaciones dibujadas, generadas por modelos de OpenAI, Google y DeepSeek y admitidas mediante revision ciega; 30.250 son "long looks". Ninguna fila fue escrita por un modelo Claude ni por modelos del proyecto entrenados sobre filas de Claude. El entrenamiento se realizo en una sola pasada de 10.137 pasos (la version 1 requirio dos pasadas de 2.724 pasos).

La innovacion tecnica destacable es el segundo objetivo de entrenamiento, que ancla las elecciones de siguiente palabra del adaptador a las de gemma-4-E4B-it en peticiones ordinarias que el modelo base respondio por si mismo para esta version. El efecto medido: en peticiones ordinarias retenidas, el adaptador responde 0 de 357 en el formato de lectura, frente a 62 de 357 de la version 1, que se entreno sin este objetivo. Ademas, en el analisis de lettering (texto visible en la imagen), de 300 imagenes retenidas con texto legible, 245 no contenian nombres de personas, creditos ni direcciones web segun un filtro automatico; en esas 245, la "closer look" del adaptador nombra una palabra visible en 91 casos frente a 216 del modelo base, mientras que al preguntarle directamente que dice el lettering su acierto es practicamente identico al del base (0,93 frente a 0,92).

## Capacidades

- Generacion de descripciones visuales estructuradas en formato de cadena de pensamiento con pasos nombrados (`see`, `name`, `place`, `count`, `relate`, `form`, `light`, `colour`, `mood`, `mean`, `intend`, `story`, `compare`, `change`, `check`, `say`).
- Produccion de multiples formulaciones de una misma imagen: caption, prompt, etiquetas y critica por niveles de profundidad.
- Generacion de preguntas relevantes sobre la imagen junto con sus respuestas, etiquetadas como `[record]` (hecho de la imagen), `[chain]` (deducido por la cadena) o `[unknown]`.
- Tres niveles de profundidad de analisis: vistazo rapido (1-2 pensamientos), vistazo cercano (3-5) y vistazo largo (6-10).
- Capacidad de conversacion multi-turno en el pipeline `image-text-to-text`.
- No se documenta soporte de tool calling, function calling ni comportamiento agentico multi-paso mas alla de la cadena de razonamiento interna.
- Capacidad multilingue limitada al ingles segun la model card.

## Casos de uso

- Anotacion de datasets visuales con razonamiento trazable: el modelo genera captions, prompts y etiquetas junto con la cadena de pensamiento que las justifica, lo que permite auditar por que se asigno cada etiqueta en lugar de aceptar una salida opaca.
- Generacion de prompts para modelos de difusion: la linea `prompt` del formato de salida produce directamente descripciones densas y estructuradas (sujeto, atributos, relaciones, iluminacion, encuadre) reutilizables como texto de condicionamiento.
- Catalogacion de patrimonio artistico: el adaptador fue entrenado con obras de la National Gallery of Art y puede generar fichas descriptivas con nivel de detalle y vocabulario controlado para colecciones digitalizadas.
- Control de calidad de descripciones existentes: la linea `critique` y las preguntas con respuesta permiten contrastar un caption previo contra la lectura del modelo y detectar omisiones o errores.
- Analisis de fotografias con requisitos de atribucion: el flujo de entrenamiento excluye imagenes COCO sin licencia Attribution o sin restricciones conocidas de copyright, lo que encaja en pipelines que necesitan gestionar derechos de imagen.
- Extraccion de informacion visual con incertidumbre explicita: las etiquetas `[unknown]` permiten separar en downstream los hechos verificados de las deducciones y de lo que el modelo no puede determinar, util en sistemas donde un falso positivo es costoso.
- Asistencia a accesibilidad: generacion de descripciones alternativas ricas y de preguntas anticipadas que un usuario podria formular sobre una imagen.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K u otros) en la informacion disponible. La model card unicamente reporta metricas internas de comportamiento del adaptador frente a su modelo base:

| Metrica | Ulisse E4B v1.2 | Modelo base / v1 |
|---|---|---|
| Respuestas en formato de lectura ante peticiones ordinarias retenidas | 0 de 357 | 62 de 357 (v1) |
| Nombra una palabra visible en "closer look" (245 imagenes sin datos personales) | 91 | 216 (base) |
| Nombra una palabra visible en "long look" (mismas 245) | 147 | No disponible |
| Acierto al preguntar directamente por el lettering (245 imagenes) | 0,93 | 0,92 (base) |

## Requisitos de hardware

- El adaptador LoRA ocupa 0,3 GB; el requisito real de VRAM lo determina el modelo base google/gemma-4-E4B-it, cuyas necesidades exactas no se detallan en la informacion disponible.
- VRAM estimada para inferencia: no disponible en la informacion proporcionada; depende del modelo base y de la cuantizacion elegida.
- GPU recomendadas: no disponible. Para un modelo vision-lenguaje de 4 mil millones de parametros efectivos, cabe esperar que sea desplegable en GPU de consumo de gama alta (RTX 4090, 4080) y en GPU de datacenter (A100, H100), pero no se confirma en la documentacion.
- Opciones de despliegue: la libreria declarada es PEFT, por lo que el adaptador se carga sobre el modelo base con transformers + peft. No se mencionan integraciones con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Ulisse E4B v1.2 (este) | LoRA sobre base E4B | No disponible | Lectura visual con cadena de pensamiento | Apache-2.0 | Hugging Face |
| Lucia 4B v1.2 | LoRA sobre Qwen3.5-4B | No disponible | Misma receta sobre otro base | No disponible | Hugging Face (AbstractPhil) |
| google/gemma-4-E4B-it | 4B efectivos | No disponible | Vision-lenguaje generalista | No disponible en la informacion | Hugging Face |
| Ulisse E4B v1 (tag `ulisse-v1`) | LoRA sobre base E4B | No disponible | Version previa, sin objetivo de anclaje | Apache-2.0 | Mismo repositorio, tag `ulisse-v1` |

La comparativa con modelos de proposito general no es directa, ya que Ulisse E4B v1.2 no compite en benchmarks generales sino en la tarea especifica de lectura visual estructurada. Frente a su modelo base, la diferencia medible es la adherencia al formato de lectura y la supresion de ese formato en peticiones ordinarias.

## Limitaciones y advertencias

- Alcance funcional estrecho: es una utilidad especializada; fuera de la tarea de lectura visual su comportamiento es el del modelo base, y no se debe esperar rendimiento generalista mejorado.
- Idioma unico: solo se declara ingles; no hay soporte documentado de castellano ni de otros idiomas.
- Lettering: el adaptador nombra texto visible en la imagen con mucha menos frecuencia que el modelo base en vistazos cercanos (91 frente a 216 de 245), por lo que no es adecuado para tareas de lectura de texto en imagen salvo que se pregunte explicitamente.
- Riesgo de alucinacion: las lineas de cadena de pensamiento y las preguntas etiquetadas `[chain]` son deducciones del modelo, no hechos verificados; solo las `[record]` se presentan como hechos de la imagen, y aun asi requieren validacion.
- Sesgos: el dataset de entrenamiento esta compuesto por lecturas generadas por modelos de OpenAI, Google y DeepSeek y filtradas por revision ciega; los sesgos de esos generadores pueden propagarse al adaptador. No se documenta una evaluacion de sesgos del adaptador.
- Restricciones de licencia: el adaptador es Apache-2.0, pero el uso comercial esta condicionado por la licencia del modelo base google/gemma-4-E4B-it, cuyos terminos deben verificarse por separado.
- Dependencia del base: requiere descargar y cargar el modelo base completo ademas del adaptador; el repositorio de 0,3 GB no es autosuficiente.
- Filtrado de copyright en entrenamiento: las imagenes COCO 2017 usadas se limitan a licencia Attribution o sin restricciones conocidas de copyright, lo que puede introducir un sesgo de composicion en el dataset.
- Sin benchmarks publicos: no hay datos de rendimiento estandar que permitan comparar objetivamente con alternativas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/AbstractPowered/lora-gemma-4-e4b-think-symbolic-image
- Modelo base: https://huggingface.co/google/gemma-4-E4B-it
- Registro de investigacion: https://huggingface.co/AbstractPhil/gemma-4-e4b-think-symbolic-image
- Manifiestos, hashes y licencia: https://huggingface.co/datasets/AbstractPowered/manifests
- Dataset de entrenamiento: https://huggingface.co/datasets/AbstractPhil/thought-symbolic-image-recaptioned
- Dataset de captions: https://huggingface.co/datasets/AbstractPhil/thought-symbolic-image-captions
- Receta predecesora (Lucia 4B v1.2): https://huggingface.co/AbstractPhil/qwen3.5-4b-think-symbolic-image
- Organizacion del autor: https://huggingface.co/AbstractPowered
