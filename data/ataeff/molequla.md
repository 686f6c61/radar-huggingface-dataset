# ataeff/molequla

## Resumen

molequla es un repositorio de pesos publicado por el usuario ataeff (ecosistema "arianna method") que contiene el organo de vision del proyecto molequla, denominado `ocelli`. Se trata de SmolVLM2-500M-Video-Instruct con un LoRA de vision ("Yent eye LoRA v2", entrenado por SFT el 29 de mayo de 2026) fusionado, convertido a GGUF y ejecutado mediante una ruta de inferencia en C sobre "notorch" en lugar de PyTorch. El modelo base lo desarrolla HuggingFaceTB y aqui aparece reempaquetado y ajustado para una tarea muy concreta: producir una frase que describa un fotograma de camara.

La funcion del modelo dentro del sistema molequla es actuar como "el ojo": recibe un unico fotograma global de 512x512, lo describe en una frase y esa frase se incorpora a la colonia como la quinta fuente de ADN (`world`). No se plantea como un asistente conversacional general, sino como un modulo perceptivo de bajo consumo pensado para ejecutarse en un telefono movil, con mediciones reales sobre un Galaxy A56 (Exynos 1580) usando OpenBLAS.

El dato real de pesos en safetensors del repositorio es de 409.252.800 parametros (~409 M), con un tamano de repo de 1,8 GB. La relevancia actual del lanzamiento es fundamentalmente de nicho: demuestra un flujo completo de ajuste fino, fusion de LoRA, cuantizacion a GGUF y despliegue en CPU movil sin PyTorch, con tablas de rendimiento y consumo de memoria publicadas, algo poco habitual en modelos de este tamano.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer vision-language (familia SmolVLM2: torre de vision + proyector + decodificador de lenguaje); inferencia mediante ruta en C sobre notorch |
| Parametros totales | 409.252.800 (~409 M) segun safetensors del repositorio; el modelo base se comercializa como "500M" |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (no se detalla en la model card) |
| Tipos de cuantizacion | Q4_0, Q6_K, Q8_0 (decodificador); mmproj en Q8_0 y f16 |
| Idiomas soportados | no disponible (no se declara en la model card) |
| Licencia | GPL-3.0 |
| Formato de pesos | GGUF |
| Modelo base | HuggingFaceTB/SmolVLM2-500M-Video-Instruct |
| Metodo de ajuste | LoRA de vision "Yent eye LoRA v2" (SFT, 2026-05-29), fusionado en el modelo base |
| Tamano del repositorio | 1,8 GB |
| Fecha de publicacion | 2026-09-13 (ultima actualizacion 2026-09-13) |

## Arquitectura y entrenamiento

El modelo es un VLM de tipo transformer de tres componentes: una torre de vision, un proyector multimodal y un decodificador de lenguaje, siguiendo la familia SmolVLM2 de HuggingFaceTB. Sobre esa base se aplico un LoRA especifico de vision ("Yent eye LoRA v2") mediante SFT, que despues se fusiono con los pesos del modelo base. El resultado se convirtio a GGUF y se ejecuta con una ruta de inferencia escrita en C sobre notorch, con lo que se elimina la dependencia de PyTorch y de la pila habitual de transformers en el dispositivo final. El repositorio no incluye el merge f16 del decodificador (820 MB), solo las cuantizaciones.

No se detallan en la informacion disponible el numero de tokens de entrenamiento, la composicion del dataset, ni si hubo etapas de RLHF o DPO. Lo unico documentado es que el ajuste del organo visual fue un SFT con fecha 29 de mayo de 2026 y que la cuantizacion se realizo en dos entornos distintos: Q4_0, Q6_K y Q8_0 generados en "phone-1" con la herramienta `gguf_quantize` de notorch a partir del merge f16, y una variante Q8_0 adicional generada en "neo" con llama.cpp. El repositorio incluye `SHA256SUMS.txt` con la comprobacion de integridad de todos los ficheros.

La innovacion tecnica destacable no esta en el modelo en si, sino en el flujo de despliegue: inferencia de un VLM multimodal en un telefono de gama media con pico de RSS por debajo de 1 GB en las cuantizaciones Q6_K y Q8_0, y una rutina de cuantizacion ejecutada en el propio dispositivo. La model card indica ademas que el "ojo" trabaja sobre un unico fotograma global de 512x512 (`SMOLVLM_NOSPLIT=1`) porque las peticiones por mosaicos (13 fotogramas, 878 tokens) costaban entre 74 y 94 segundos por fotograma con igual o peor contenido descriptivo.

## Capacidades

- Descripcion de imagenes: genera una frase en lenguaje natural a partir de un unico fotograma de camara de 512x512.
- Comprension visual basica: identificacion de objetos y escenas a nivel de descripcion corta, con degradacion documentada en cuantizacion Q4_0 (omite objetos).
- Entrada de video: el modelo base SmolVLM2-500M-Video-Instruct admite caracteristicas de video, pero en esta ficha el uso medido es de un fotograma estatico.
- Integracion como fuente de contexto: la frase generada se incorpora como quinta fuente de ADN (`world`) en el sistema de organismos molequla.
- Ejecucion sin PyTorch: la ruta de inferencia en C sobre notorch permite desplegar el modelo sin la pila de transformers.
- Capacidades conversacionales: el repositorio esta etiquetado como `conversational` y `endpoints_compatible`, pero no se documenta ninguna evaluacion de dialogo multi-turno.
- Tool calling / function calling: no disponible (no se declara soporte).
- Comportamiento agentico y razonamiento multi-paso: no disponible en el modelo; la logica de agente reside en el sistema molequla que consume su salida.
- Multilingue: no disponible (no se declaran idiomas soportados).
- Modo "thinking", audio u otras capacidades especiales: no disponible.

## Casos de uso

- Descripcion de escenas en tiempo real en dispositivos moviles: el modelo cabe en menos de 1 GB de RSS y genera entre 4,6 y 6,4 tokens/s en un Exynos 1580, suficiente para producir una frase descriptiva por fotograma capturado sin conexion a red.
- Generacion automatica de texto alternativo para imagenes: puede producir una frase corta que describa el contenido de una fotografia, util como primer paso de un pipeline de accesibilidad que despues refine el texto.
- Percepcion para agentes autonomos de bajo consumo: dentro del ecosistema molequla, la frase generada alimenta la "colonia" como fuente `world`, de modo que un agente sin GPU obtiene contexto visual textualizado.
- Robotica educativa y juguetes conectados: con 232 MB en Q4_0 mas el proyector de vision de 109 MB, el modelo puede embarcarse en hardware con CPU ARM y poca memoria para que un robot describa verbalmente lo que ve.
- Preprocesado de vision en pipelines de datos: convertir grandes volumenes de fotogramas en descripciones textuales para indexacion, etiquetado o busqueda semantica, ejecutando la inferencia en CPU y evitando costes de GPU.
- Camaras trampa y monitorizacion de entornos remotos: al funcionar sin PyTorch y con un consumo de memoria inferior a 1 GB, se puede desplegar en nodos con alimentacion limitada que emitan solo la descripcion textual en lugar del flujo de video.
- Prototipado e investigacion en metodos de despliegue: sirve como banco de pruebas reproducible para comparar Q4_0, Q6_K y Q8_0 en terminos de calidad descriptiva y velocidad en hardware movil concreto.
- Asistencia a personas con discapacidad visual en tareas puntuales: descripcion de un fotograma concreto bajo demanda, con la advertencia de que la calidad descriptiva de un modelo de ~400 M de parametros es limitada y no sustituye a sistemas asistivos validados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, MMMU, etc.) en la informacion disponible. Las unicas mediciones publicadas son de rendimiento y consumo en dispositivo, sobre un Galaxy A56 (Exynos 1580, nucleos 4-7, OpenBLAS), con un unico fotograma global de 512x512 y un prompt de 84 tokens:

| Decodificador | Tokens generados/s | Tiempo total (s) | RSS maximo (MB) |
|---|---|---|---|
| yent_eye_ours_q6_k | 4,6 | 11,4 | 951 |
| yent_eye_smolvlm2_lora_v2_q8_0 | 6,4 | 13,5 | 988 |
| f16 (no subido al repositorio) | 1,4 | 31,2 | 1602 |

Mediciones adicionales documentadas por el autor:

| Escenario | Resultado |
|---|---|
| Prompt por mosaicos (13 fotogramas, 878 tokens) | 74-94 s por fotograma, con contenido igual o peor |
| Q4_0 en la ejecucion por mosaicos | 3,0 tok/s frente a 5,0 tok/s de Q8_0, con perdida de objetos en la descripcion |
| Q6_K frente a Q8_0 | Reproducen la misma frase descriptiva |

## Requisitos de hardware

- VRAM/RAM de inferencia: aproximadamente 232 MB para el decodificador Q4_0, 418 MB para Q6_K y 437 MB para Q8_0, mas el proyector de vision (109 MB en Q8_0 o 199 MB en f16). El merge f16 del decodificador ocupa 820 MB y no esta subido al repositorio.
- Memoria pico medida: 951 MB (Q6_K), 988 MB (Q8_0) y 1602 MB (f16) de RSS en un Exynos 1580.
- CPU: funciona en CPU ARM de telefono de gama media. Se ha probado explicitamente en un Galaxy A56 con OpenBLAS.
- GPU: no se documentan pruebas con GPU. Cualquier GPU de consumo reciente (por ejemplo RTX 3060, RTX 4090) es enormemente sobredimensionada para este modelo; no hay datos de latencia publicados en GPU.
- Cabida en GPU de consumo: si, en cualquier GPU con mas de 2 GB de VRAM, y tambien en CPU sin GPU dedicada.
- Opciones de despliegue: ruta de inferencia en C sobre notorch (la utilizada por el autor), llama.cpp (usado para generar la variante Q8_0 en "neo"), herramientas GGUF compatibles con modelos SmolVLM2 y su fichero mmproj. El soporte en vLLM, TGI u Ollama no esta confirmado en la informacion disponible.
- Latencia y throughput: 4,6-6,4 tokens/s y 11,4-13,5 segundos de tiempo total por fotograma en el dispositivo medido; 1,4 tokens/s y 31,2 segundos para f16. Sin datos de GPU.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Orientacion |
|---|---|---|---|---|---|
| molequla / ocelli (ataeff) | 409 M (~409 M reales) | no disponible en esta informacion | GPL-3.0 | GGUF con mmproj | Ojo de un solo fotograma para el sistema molequla, ejecucion en CPU movil sin PyTorch |
| SmolVLM2-500M-Video-Instruct (HuggingFaceTB) | ~500 M (clase) | no verificado en esta ficha; la familia SmolVLM2 declara ventanas de hasta 16 384 tokens en su documentacion | Apache-2.0 | safetensors (transformers) | VLM instructivo general con soporte de imagen y video |
| SmolVLM2-256M-Video-Instruct (HuggingFaceTB) | ~256 M (clase) | no verificado en esta ficha | Apache-2.0 | safetensors (transformers) | Alternativa aun mas ligera de la misma familia, sin LoRA de vision especifico |
| Qwen2.5-VL-3B-Instruct | ~3 000 M (clase) | no verificado en esta ficha | Apache-2.0 (segun su publicacion) | safetensors, GGUF en la comunidad | VLM de proposito general con mayor capacidad, requiere mas memoria y no esta pensado para CPU movil |

Los datos de parametros y contexto de los modelos comparados no se han verificado dentro de esta ficha; se indican como referencia de categoria. La diferencia principal de molequla frente a sus equivalentes es el empaquetado: LoRA de vision fusionado, licencia GPL-3.0 (frente a Apache-2.0 del modelo base) y una ruta de ejecucion propia en C que no depende de PyTorch.

## Limitaciones y advertencias

- Licencia GPL-3.0: es una licencia copyleft fuerte. Integrar estos pesos en un producto propietario puede obligar a liberar el codigo derivado; conviene revisar la compatibilidad con el modelo base, que se distribuye bajo Apache-2.0, antes de cualquier uso comercial.
- Riesgo de alucinacion: un VLM de ~409 M de parametros describe escenas de forma breve y puede inventar objetos o relaciones espaciales. No se han publicado evaluaciones de fidelidad descriptiva.
- Degradacion por cuantizacion: el autor documenta que Q4_0 genera mas lento que Q8_0 en la ejecucion por mosaicos (3,0 frente a 5,0 tok/s) y que omite objetos en la descripcion. Para calidad descriptiva se recomienda Q6_K o Q8_0.
- Limitacion de resolucion y de fotogramas: el uso medido se restringe a un unico fotograma global de 512x512. Las peticiones por mosaicos (13 fotogramas, 878 tokens) cuestan 74-94 segundos por fotograma en el dispositivo probado.
- Idiomas: no se declara ningun idioma soportado en la model card, por lo que no hay garantia de descripcion correcta en castellano ni en otros idiomas distintos del ingles.
- Longitud de contexto no documentada: no se especifica la ventana efectiva de esta version, lo que dificulta planificar conversaciones largas o prompts extensos.
- Ecosistema muy especifico: el modelo esta disenado para la arquitectura molequla y su runtime notorch. La integracion fuera de ese ecosistema exige adaptar la ruta de inferencia o confiar en llama.cpp.
- Madurez y adopcion: el repositorio registra 0 descargas y 0 likes en el momento de la consulta, y la model card no incluye evaluaciones comparativas ni resultados en benchmarks estandar.
- Sin garantias de produccion: no hay informacion sobre sesgos, comportamiento en dominios sensibles ni estabilidad en cargas concurrentes.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/ataeff/molequla
- Repositorio de codigo del proyecto molequla: https://github.com/ariannamethod/molequla
- Cuaderno de medidas del proyecto (`MOLEQULALOG2.md`): https://github.com/ariannamethod/molequla/blob/main/MOLEQULALOG2.md
- Modelo base: https://huggingface.co/HuggingFaceTB/SmolVLM2-500M-Video-Instruct
- llama.cpp (usado para generar la variante Q8_0 en "neo"): https://github.com/ggml-org/llama.cpp

No se han encontrado enlaces relevantes en la busqueda web: los resultados devueltos no guardan ninguna relacion con el modelo ni con su ecosistema.
