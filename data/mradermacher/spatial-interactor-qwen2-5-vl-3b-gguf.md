# mradermacher/Spatial-Interactor-Qwen2.5-VL-3B-GGUF

## Resumen

Spatial-Interactor-Qwen2.5-VL-3B-GGUF es la version cuantizada en formato GGUF del modelo kagakouko/Spatial-Interactor-Qwen2.5-VL-3B, un ajuste fino de tipo vision-lenguaje construido sobre la familia Qwen2.5-VL y orientado a razonamiento espacial, comprension de video y aplicaciones de IA encarnada (embodied AI). El repositorio lo publica mradermacher, un autor especializado en generar cuantizaciones GGUF de modelos existentes, no en entrenar el modelo original. El resultado es un paquete de pesos listos para inferencia local con llama.cpp y derivados.

El modelo cuenta con 3.397.103.616 parametros (aproximadamente 3,4 mil millones) en una arquitectura densa, no MoE, con una torre de vision acoplada mediante un proyector multimodal que se distribuye como archivos mmproj independientes. Se publica exclusivamente en ingles y bajo licencia qwen-research. El repositorio ocupa 32,8 GB en total, aunque el conjunto de cuantizaciones individuales es mucho mas ligero: desde 1,5 GB en Q2_K hasta 6,9 GB en f16.

Su relevancia practica radica en que permite ejecutar razonamiento espacial sobre imagenes y video en hardware de consumo. Las cuantizaciones Q4_K_S y Q4_K_M, de 2,1 y 2,2 GB respectivamente, mas el proyector multimodal de 0,9 GB, caben en GPUs con 6-8 GB de VRAM. El repositorio tiene 0 descargas y 0 likes en el momento de la consulta y no se han publicado resultados de benchmarks en la informacion disponible.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer vision-lenguaje de la familia Qwen2.5-VL, con torre de vision y proyector multimodal (mmproj) separado |
| Parametros totales | 3.397.103.616 (~3,4 B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | f16, Q8_0, Q6_K, Q5_K_M, Q5_K_S, Q4_K_M, Q4_K_S, IQ4_XS, Q3_K_L, Q3_K_M, Q3_K_S, Q2_K; ademas mmproj-f16 y mmproj-Q8_0 para la torre multimodal |
| Idiomas soportados | en (ingles) |
| Licencia | qwen-research (campo `license: other`, con enlace al LICENSE de Qwen2.5-VL-3B-Instruct) |
| Formato de pesos | GGUF (cuantizaciones estaticas) + mmproj en GGUF para el componente multimodal |
| Modelo base | kagakouko/Spatial-Interactor-Qwen2.5-VL-3B |
| Tamano del repositorio | 32,8 GB |
| Descargas / likes | 0 / 0 |
| Fecha de creacion / actualizacion | 2026-09-14 / 2026-09-14 |

## Arquitectura y entrenamiento

La informacion disponible no describe el proceso de entrenamiento del modelo original. Lo que se puede afirmar a partir de los metadatos es que la arquitectura es un transformer vision-lenguaje de la familia Qwen2.5-VL de 3,4 B de parametros, con una torre de vision procesada por un proyector multimodal que mradermacher exporta como archivos `mmproj` separados (mmproj-f16 de 1,4 GB y mmproj-Q8_0 de 0,9 GB). Las etiquetas del repositorio (`vision-language`, `video`, `spatial-reasoning`, `embodied-ai`, `qwen`) indican que el ajuste fino del autor original kagakouko se centro en tareas de interaccion espacial sobre imagenes y video, no en un uso generico de chatbot.

En cuanto al proceso de cuantizacion, la model card registra `quantize_version: 2`, `output_tensor_quantised: 1` y `convert_type: hf`, lo que indica una conversion desde pesos HuggingFace con cuantizacion por tensor de salida. El autor senala que en el momento de publicacion no hay cuantizaciones con imatrix ni ponderadas ("weighted/imatrix quants seem not to be available"), de modo que todas las variantes son cuantizaciones estaticas. No se especifica en la informacion proporcionada el numero de tokens de entrenamiento, la composicion del dataset, ni si se aplicaron tecnicas de RLHF o DPO.

## Capacidades

- Comprension de imagenes: el modelo acepta entrada visual ademas de texto, apoyandose en el proyector multimodal que debe cargarse junto con los pesos principales.
- Comprension de video: las etiquetas del repositorio incluyen `video`, lo que apunta a procesamiento de secuencias de fotogramas.
- Razonamiento espacial: capacidad central del ajuste fino, orientada a determinar relaciones de posicion, distancia y orientacion entre objetos en una escena.
- Aplicaciones de IA encarnada (`embodied-ai`): disenado para entornos donde un agente debe interpretar una escena y decidir acciones sobre ella.
- Conversacion multi-turno: el repositorio se marca como `conversational`, por lo que soporta dialogos con historial.
- Soporte multilingue: limitado al ingles segun el campo `language` del repositorio.
- Tool calling / function calling: no confirmado en la informacion proporcionada; el modelo base Qwen2.5-VL lo soporta, pero no hay declaracion explicita en esta ficha.
- Capacidades de agente multi-paso: no confirmadas explicitamente en la informacion del repositorio.
- Capacidades de audio: no disponibles.

## Casos de uso

- Robotica de manipulacion: el modelo puede procesar el flujo de video de una camara montada en un brazo robotico y responder a preguntas del tipo "que objeto esta a la izquierda del contenedor", aportando la senal perceptiva que alimenta un planificador de acciones.
- Anotacion automatica de datasets espaciales: generar descripciones y etiquetas de relaciones espaciales sobre imagenes o clips para preentrenar otros modelos, reduciendo el coste de anotacion manual en proyectos de vision.
- Asistencia a personas con discapacidad visual: dado que razona sobre posiciones relativas, puede describir por voz la ubicacion de obstaculos y objetos en una escena capturada por la camara de un movil, con la ventaja de ejecutarse localmente en un portatil con GPU de gama media.
- Inspeccion de almacenes y obra: analizar fotogramas de video para verificar colocacion de palets, planogramas en retail o presencia de elementos en zonas delimitadas, aprovechando la comprension de video en lugar de imagen estatica.
- Navegacion de drones y vehiculos en simulacion: integrar el modelo como modulo de percepcion en un bucle de simulacion, dado su enfoque en embodied AI, con la ventaja de que las cuantizaciones Q4 permiten ejecutarlo en el mismo equipo que el simulador.
- Control por voz y gestos en interfaces: combinado con un pipeline ASR, el modelo puede resolver consultas del tipo "senalame el boton que esta mas arriba" sobre una captura de pantalla, util para agentes de interfaz grafica.
- Analisis de video para formacion y deporte: extraer descripciones de posicionamiento de jugadores o de uso de maquinaria a partir de clips, con la restriccion de que el modelo solo responde en ingles.
- Prototipado e investigacion en laboratorio: al ocupar 2,1-2,2 GB en Q4_K_S/Q4_K_M, permite iterar sobre hipotesis de razonamiento espacial en una unica GPU de consumo sin depender de APIs externas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para los pesos, segun cuantizacion: Q2_K 1,5 GB; Q3_K_S 1,7 GB; Q3_K_M 1,8 GB; Q3_K_L 1,9 GB; IQ4_XS 2,0 GB; Q4_K_S 2,1 GB; Q4_K_M 2,2 GB; Q5_K_S y Q5_K_M 2,5 GB; Q6_K 2,9 GB; Q8_0 3,7 GB; f16 6,9 GB.
- VRAM adicional obligatoria para la torre de vision: 0,9 GB con mmproj-Q8_0 y 1,4 GB con mmproj-f16. Hay que sumarla a la cuantizacion elegida.
- Ejemplo de configuracion ligera: Q4_K_M + mmproj-Q8_0 suma unos 3,1 GB de pesos, por lo que cabe con holgura en GPUs de 6-8 GB como la RTX 3060 (12 GB), RTX 4060 Ti (16 GB), RTX 3080 (10 GB) o RTX 2070 (8 GB), dejando margen para cache KV segun el contexto configurado.
- Ejemplo de configuracion de maxima calidad: f16 + mmproj-f16 suma unos 8,3 GB, adecuada para RTX 4090, RTX 3090, A100 o H100, aunque el autor la califica de "overkill" para este tamano de modelo.
- Cabe en GPU de consumo: si, en todas las variantes hasta Q8_0 con mmproj-Q8_0 en GPUs de 8 GB o mas; las variantes Q2_K y Q3 tambien pueden ejecutarse en CPU o en iGPU con RAM suficiente.
- El procesamiento de video incrementa el uso de memoria respecto a una sola imagen, porque se deben codificar multiples fotogramas; la informacion disponible no cuantifica ese incremento.
- Opciones de despliegue: llama.cpp y sus derivados (Ollama, LM Studio, koboldcpp, llama-cpp-python), que son los caminos naturales para GGUF con mmproj. vLLM y TGI trabajan preferentemente con pesos safetensors del modelo base.
- Latencia y throughput estimados: no disponible.
- Nota sobre los archivos multiparte: la model card remite a los README de TheBloke para instrucciones de uso y concatenacion de ficheros GGUF divididos.

## Comparativa con modelos similares

| Modelo | Parametros | Formato | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Spatial-Interactor-Qwen2.5-VL-3B-GGUF (este repositorio) | 3,4 B | GGUF + mmproj GGUF | no disponible | qwen-research | HuggingFace, cuantizaciones de 1,5 a 6,9 GB |
| kagakouko/Spatial-Interactor-Qwen2.5-VL-3B (modelo base del ajuste) | 3,4 B | safetensors (segun el modelo base declarado) | no disponible | qwen-research | HuggingFace |
| Qwen2.5-VL-3B-Instruct (modelo fundacional de la familia) | no disponible en la informacion proporcionada | no disponible en la informacion proporcionada | no disponible | qwen-research (LICENSE referenciada) | HuggingFace |
| Otras alternativas de 3-4 B con vision y razonamiento espacial | no disponible | no disponible | no disponible | no disponible | no disponible |

La informacion proporcionada no incluye datos de rendimiento comparado, por lo que no es posible establecer una comparativa cuantitativa con alternativas de la misma categoria.

## Limitaciones y advertencias

- Licencia restringida: el repositorio declara `license: other` con nombre `qwen-research` y enlace al LICENSE de Qwen2.5-VL-3B-Instruct. Es imprescindible revisar ese texto antes de cualquier uso, especialmente comercial; la etiqueta "research" sugiere restricciones de uso.
- Idioma unico: solo ingles segun el campo `language`. No hay soporte declarado de castellano ni de otros idiomas, lo que limita su uso directo en productos en espanol.
- Riesgo de alucinacion: en tareas de razonamiento espacial el modelo puede generar relaciones de posicion o distancias plausibles pero incorrectas; conviene validar las salidas con sensores o comprobaciones geometricas antes de actuar sobre ellas.
- Degradacion por cuantizacion: el autor marca explicitamente Q3_K_M como "lower quality". Las variantes Q2_K y la familia Q3 son las mas agresivas y pueden degradar de forma notable el razonamiento espacial, que depende de detalles finos de la escena.
- Ausencia de cuantizaciones imatrix o ponderadas: en la fecha de publicacion solo hay cuantizaciones estaticas, que suelen rendir peor que las ponderadas a igual tamano.
- Sin benchmarks publicados: no hay datos verificables de MMLU, HumanEval, GSM8K ni de tareas espaciales especificas en la informacion disponible.
- Datos de adopcion nulos: 0 descargas y 0 likes, por lo que no existe validacion por parte de la comunidad ni informes de fallos conocidos.
- Sesgos: no disponibles. Al ser un ajuste fino sobre Qwen2.5-VL, hereda los sesgos del modelo fundacional, no documentados en este repositorio.
- Dependencia del proyector multimodal: si se carga el GGUF sin el archivo mmproj correspondiente, el modelo no procesara imagenes ni video.
- Contexto no especificado: al no declararse la longitud de contexto, la planificacion de memoria para conversaciones largas o videos extensos queda sin referencia.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/Spatial-Interactor-Qwen2.5-VL-3B-GGUF
- Modelo base cuantizado: https://huggingface.co/kagakouko/Spatial-Interactor-Qwen2.5-VL-3B
- Licencia referenciada (Qwen2.5-VL-3B-Instruct): https://huggingface.co/Qwen/Qwen2.5-VL-3B-Instruct/blob/main/LICENSE
- Pagina de resumen y descargas del cuantizador: https://hf.tst.eu/model#Spatial-Interactor-Qwen2.5-VL-3B-GGUF
- README de referencia para el uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Solicitudes de cuantizacion de mradermacher: https://huggingface.co/mradermacher/model_requests
- Grafica comparativa de perplejidad entre tipos de cuantizacion: https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas de Artefact2 sobre cuantizacion: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Resultados de busqueda web: no se ha encontrado ningun enlace relevante al modelo; las busquedas devolvieron unicamente paginas sin relacion con el proyecto (documentacion sobre el parque Montsouris de Paris).
