# acher0/VLX-Seek-1.5-10B

## Resumen

VLX-Seek-1.5-10B es un modelo de lenguaje y vision (VLM) de 10.016.903.016 parametros publicado en HuggingFace por el usuario acher0, con codigo de inferencia y proyecto asociado en el repositorio om-ai-lab/VLX-Seek. Forma parte de la familia VLX-Seek 1.5, prevista en tamanos de 0,6B, 3B y 10B, y esta disenado especificamente para percepcion visual fina y grounding en escenarios embodied: drones, robots, perros roboticos, camaras de vigilancia y sistemas de inspeccion en el borde.

Su principal innovacion es que no genera coordenadas de cajas delimitadoras como cadena de texto. En su lugar, reformula la localizacion como recuperacion y referencia de regiones: las regiones candidatas se convierten en entidades direccionables (tokens de region) y el modelo responde seleccionando, comparando y refiriendose a ellas. Ademas incorpora un formato explicito de salida `None` para rechazar objetivos ausentes, entrenado con negativos duros, lo que reduce el grounding alucinado.

El modelo maneja dos idiomas (zh, en), se distribuye bajo licencia Apache-2.0 con pesos en safetensors y un tamano de repositorio de 20,1 GB. Su pipeline declarado es image-text-to-text y esta etiquetado para deteccion de objetos zero-shot, grounding, REC (referring expression comprehension) y conversacion multimodal.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (VLM) con torre de vision auxiliar reforzada, capas de Linear Attention y pipeline de propuesta de regiones (OPN) con referencia de region; detalles completos no disponibles |
| Parametros totales | 10.016.903.016 (10B) |
| Parametros activos | No aplica (no se describe arquitectura MoE en la informacion disponible) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (el repositorio publica pesos en precision completa, safetensors) |
| Idiomas soportados | Chino (zh) e ingles (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | Safetensors (libreria transformers) |

## Arquitectura y entrenamiento

La informacion disponible describe un VLM con una pila de percepcion visual mejorada respecto a versiones anteriores: una torre de vision auxiliar mas potente, alineacion vision-lenguaje mejorada y un backbone VLM reforzado. Frente a los VLM que decodifican directamente cadenas de coordenadas, VLX-Seek convierte las regiones candidatas en tokens de region direccionables y resuelve la localizacion mediante seleccion, comparacion y referencia linguistica, lo que acerca la tarea a las capacidades nativas de un modelo de lenguaje. El pipeline incluye generacion de propuestas de regiones (OPN, con un diseno declarado como mas rapido), construccion de tokens de region, formateo de prompts y post-procesado de la salida para mapear los tokens de region a coordenadas de imagen.

En eficiencia, el modelo incorpora mas capas de Linear Attention para reducir consumo de memoria y mejorar el coste de inferencia. En cuanto al entrenamiento, la model card menciona entrenamiento con rechazo de negativos duros (hard-negative rejection) y un formato de salida explicito `None` para suprimir el grounding de objetos ausentes. No se especifican en la informacion proporcionada el numero de tokens de entrenamiento, la composicion del dataset, ni si se aplicaron etapas de RLHF o DPO.

## Capacidades

- Generacion de texto e inferencia multimodal sobre imagenes (pipeline image-text-to-text).
- Deteccion de objetos de vocabulario abierto (open-vocabulary) y localizacion a nivel de region.
- Referring expression comprehension (REC): localizar el objeto descrito por una expresion en lenguaje natural.
- Grounding visual multiobjeto, con seleccion entre multiples regiones candidatas.
- Conteo de objetos con evidencia a nivel de region.
- Rechazo explicito de objetivos ausentes mediante salida `None`, orientado a reducir alucinacion de objetos.
- Percepcion en vistas de dron, con objetos pequenos y distribuciones densas.
- Razonamiento espacial centrado en robot y escenarios embodied.
- Conversacion multimodal multi-turno (etiqueta conversational).
- Deteccion zero-shot.
- Idiomas: chino e ingles.
- No se menciona en la informacion disponible soporte explicito de tool calling, function calling, modo thinking, audio ni agentes multi-paso.

## Casos de uso

- Inspeccion industrial con vision en el borde: el modelo puede identificar y localizar defectos o componentes concretos en imagenes de camara, devolviendo regiones ancladas en lugar de descripciones globales, lo que permite actuar sobre la region correcta.
- Vigilancia y analitica de video: deteccion de objetos de vocabulario abierto en vistas de camara fija, con rechazo explicito de objetivos ausentes para reducir falsas alarmas cuando el objeto buscado no esta en el encuadre.
- Percepcion para drones: localizacion de objetos pequenos en layouts densos, un escenario para el que el modelo declara optimizacion especifica en sus benchmarks de vista aerea.
- Robotica y agentes embodied: modulo de percepcion que traduce ordenes en lenguaje natural ("coge la taza roja que esta detras del portatil") a una region concreta de la imagen para el modulo de planificacion de movimiento.
- Recuperacion de evidencia visual en sistemas de documentacion: dado un catalogo de imagenes etiquetadas, usar REC para vincular descripciones textuales con la region exacta que las cumple.
- Asistencia a operarios en inspeccion remota: un tecnico describe verbalmente el elemento a revisar y el modelo devuelve la region seleccionada sobre la imagen capturada, con ancla espacial verificable.
- Conteo automatizado en inventario o aforo: contar instancias de una categoria concreta con evidencia regional, util cuando se necesita justificar el recuento.
- Rechazo de falsos positivos en pipelines de deteccion existentes: la salida `None` permite descartar consultas sin objetivo presente antes de escalar a un humano.

## Benchmarks y rendimiento

La model card publica tablas de evaluacion como imagenes (deteccion de objetos comun, REC, REC y conteo, escenarios de dron, razonamiento espacial embodied y comparativa de alucinacion de objetos en HumanRef, VisDrone y RefDrone), pero no incluye los valores numericos en el texto proporcionado.

No se han publicado resultados de benchmarks numericos en la informacion disponible.

Las seis tablas referenciadas son:

| Tabla | Contenido declarado | Valores |
|---|---|---|
| Table 1 | Deteccion de objetos comun | No disponibles (imagen) |
| Table 2 | Referring expression comprehension | No disponibles (imagen) |
| Table 3 | REC y conteo | No disponibles (imagen) |
| Table 4 | Benchmarks en vista de dron | No disponibles (imagen) |
| Table 5 | Razonamiento espacial embodied | No disponibles (imagen) |
| Table 6 | Alucinacion de objetos (HumanRef, VisDrone, RefDrone) | No disponibles (imagen) |

## Requisitos de hardware

- VRAM estimada para inferencia: no publicada por el autor. Calculo aproximado a partir de los 10.016.903.016 parametros: en fp16/bf16 el peso ronda los 20 GB, por lo que se necesitan del orden de 22-28 GB de VRAM contando cache de activaciones y tokens de region; en cuantizacion de 8 bits, aproximadamente 11-16 GB; en 4 bits, aproximadamente 7-10 GB. Estas cifras son estimaciones y no estan confirmadas por el autor.
- GPU recomendadas: H100, A100 80GB o A100 40GB para fp16 sin cuantizar; GPUs de 24 GB (RTX 4090, L40S, A10G 24GB) para fp16 con ajustes de memoria o para cuantizacion de 8 bits; GPUs de 16 GB (RTX 4080, A4000 16GB) viables en cuantizacion de 4 bits.
- Cabe en GPU de consumo: si, en cuantizacion de 4 bits en tarjetas de 12-16 GB o superiores; en fp16 completo necesitaria 24 GB o mas, por lo que queda al limite en una RTX 4090.
- Opciones de despliegue: la model card indica que VLX-Seek usa un pipeline de inferencia propio con generacion de propuestas de regiones, construccion de tokens de region y post-procesado; el autor remite al repositorio GitHub para el codigo y ejemplos ejecutables. No se detalla compatibilidad con vLLM, TGI, llama.cpp u Ollama en la informacion disponible, y el formato publicado es safetensors para transformers.
- Latencia y throughput: no disponibles. El autor declara un diseno de inferencia mas rapido basado en generacion de propuestas OPN y mayor numero de capas de Linear Attention, pero sin cifras publicadas.

## Comparativa con modelos similares

La informacion proporcionada no incluye datos numericos de los modelos comparables, por lo que la comparacion se limita a caracteristicas verificables o de conocimiento publico general de cada familia.

| Modelo | Parametros | Contexto | Licencia | Enfoque |
|---|---|---|---|---|
| VLX-Seek-1.5-10B | 10,02B | No disponible | Apache-2.0 | Grounding por referencia de region con rechazo explicito de ausentes |
| Qwen2.5-VL-7B (familia) | ~7B | No disponible en esta ficha | Apache-2.0 (familia Qwen2.5) | VLM generalista con grounding y salida de coordenadas |
| InternVL3-8B (familia) | ~8B | No disponible en esta ficha | Apache-2.0 en variantes abiertas | VLM generalista multimodal |
| Grounding DINO (especializado) | Modelo especializado de deteccion (tamano no disponible) | No aplica | Apache-2.0 | Deteccion zero-shot por texto, sin capa conversacional |

Diferencias clave: VLX-Seek se posiciona como un VLM de proposito especifico para percepcion fina y embodied, con salida en tokens de region y post-procesado obligatorio, mientras que los VLM generalistas comparables tienden a decodificar coordenadas directamente y cubren un espectro mas amplio de tareas (OCR, documentacion, razonamiento visual general). Grounding DINO cubre solo deteccion, sin interaccion conversacional ni razonamiento linguistico.

## Limitaciones y advertencias

- Dependencia de las propuestas de regiones: si el recall del generador de propuestas es bajo, el modelo puede fallar al anclar el objetivo correcto aunque entienda bien el lenguaje.
- Post-procesado obligatorio: las salidas en tokens de region requieren el pipeline propio de VLX-Seek para mapearlas a coordenadas de imagen; no es un modelo plug-and-play con la API estandar de transformers.
- Errores bajo condiciones adversas: oclusion severa, desenfoque extremo, muy baja resolucion, artefactos de sensor inusuales o expresiones de referencia muy ambiguas siguen provocando fallos.
- Alucinacion de objetos: el entrenamiento con negativos duros reduce el grounding alucinado, pero no lo elimina; en despliegues de alto impacto se recomienda validacion o supervision humana.
- Cobertura idiomatica limitada: solo chino e ingles declarados; el rendimiento en castellano no esta documentado.
- Longitud de contexto no especificada, lo que impide planificar tareas de contexto largo sin validacion previa.
- Restricciones de licencia: Apache-2.0 permite uso comercial, pero implica obligaciones de conservacion de avisos de copyright y licencia, ademas de la clausula de patentes.
- Riesgos eticos en vigilancia: el modelo esta pensado para camaras, drones y robots, con implicaciones de privacidad y seguridad. El autor responsabiliza al usuario del cumplimiento legal, la obtencion de consentimiento y la evitacion de vigilancia ilicita, discriminacion o acciones autonomas inseguras.
- Baja traccion comunitaria en el momento de la consulta: 0 descargas y 0 likes, sin historial de validacion externa.
- No se documentan sesgos especificos, pero al entrenar sobre escenas de vigilancia y robotica puede heredar sesgos de esos dominios.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/acher0/VLX-Seek-1.5-10B
- Repositorio del proyecto: https://github.com/om-ai-lab/VLX-Seek
- Blog VLX-Seek 1.5: https://om-ai-lab.github.io/2026_07_06_vlx_seek_1_5_en.html
- Tabla 1, deteccion de objetos comun: https://om-ai-lab.github.io/images/vlx-seek1.5/Table1_new.jpg
- Tabla 2, referring expression comprehension: https://om-ai-lab.github.io/images/vlx-seek1.5/Table2_new.jpg
- Tabla 3, REC y conteo: https://om-ai-lab.github.io/images/vlx-seek1.5/Table3_new.jpg
- Tabla 4, escenarios de dron: https://om-ai-lab.github.io/images/vlx-seek1.5/Table4_new.jpg
- Tabla 5, razonamiento espacial embodied: https://om-ai-lab.github.io/images/vlx-seek1.5/Table5_new.jpg
- Tabla 6, alucinacion de objetos: https://om-ai-lab.github.io/images/vlx-seek1.5/Table6_new.jpg
