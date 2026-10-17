# adityamohan2604/g1-smolvla-attempt2-ik-demos

## Resumen

g1-smolvla-attempt2-ik-demos es un fine-tune del modelo SmolVLA (familia LeRobot de HuggingFace) aplicado a manipulacion robotica. Lo publica el usuario adityamohan2604 y esta entrenado para una tarea concreta: con un robot humanoide Unitree G1 equipado con mano Dex3-1 en el simulador MuJoCo, coger un bloque azul y colocarlo sobre una estrella azul. El modelo recibe imagenes de una camara de cabeza y emite acciones en espacio articular, es decir, se comporta como una politica vision-lenguaje-accion (VLA) y no como un modelo generativo de texto de proposito general.

El repositorio contiene 450.046.176 parametros (unos 450 millones) en formato safetensors, con un tamano total de 0,9 GB, lo que es coherente con pesos almacenados en precision de 16 bits. La model card indica que el entrenamiento se realizo sobre demostraciones generadas por un planificador de movimiento con cinematica inversa (IK) y que el modelo alcanza un 73 % de exito en 30 poses de bloque no vistas durante el entrenamiento. Es relevante ahora porque se enmarca en la linea de trabajo de VLA pequenos y abiertos que pueden ejecutarse en hardware modesto, en contraste con alternativas de miles de millones de parametros.

Se trata de un artefacto de investigacion muy especifico: no declara licencia, no declara idiomas, acumula 0 descargas y 1 like en el momento de redactar esta ficha, y no aporta informacion sobre el volumen de datos de entrenamiento, la composicion del dataset ni el procedimiento de ajuste. Su valor principal es como punto de referencia reproducible para recetas de fine-tuning de SmolVLA en simulacion y para estudiar el salto de demostraciones de IK a politicas visuales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-lenguaje-accion (VLA) basada en SmolVLA de LeRobot; transformer con encoder de vision y experto de acciones |
| Parametros totales | 450.046.176 (aprox. 450 M) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible; pesos distribuidos en safetensors (0,9 GB, compatible con 16 bits) |
| Idiomas soportados | no disponible (la tarea se describe en ingles; no se confirma soporte multilingue) |
| Licencia | no disponible (no se declara licencia en la model card ni en los metadatos) |
| Formato de pesos | safetensors, cargable con la libreria lerobot |
| Pipeline declarado | robotics |
| Entrada sensorial | imagen de camara de cabeza (una vista) y consigna de tarea en lenguaje natural |
| Salida | acciones en espacio articular (joint-space actions) |
| Plataforma de evaluacion | MuJoCo, robot Unitree G1 con mano Dex3-1 |
| Tarea objetivo | coger el bloque azul y colocarlo sobre la estrella azul |
| Tamano del repositorio | 0,9 GB |

## Arquitectura y entrenamiento

SmolVLA es una arquitectura VLA de la familia LeRobot: combina un backbone vision-lenguaje compacto (encoder visual tipo SigLIP mas un modelo de lenguaje pequeno de la serie SmolLM) con un experto de acciones entrenado mediante flow matching, de forma que la politica predice secuencias de acciones a partir de observaciones visuales y de una instruccion textual. El fine-tune aqui descrito conserva esa estructura y anade una especializacion: una unica camara de cabeza y acciones en espacio articular para el Unitree G1 con mano Dex3-1, evaluado en MuJoCo.

El autor indica que el conjunto de entrenamiento son demostraciones producidas por un planificador de movimiento con cinematica inversa, no teleoperacion humana. Este detalle es relevante porque determina la distribucion de estados y la calidad de las trayectorias: las demos de IK suelen ser mas limpias y consistentes que las humanas, pero tambien menos diversas en cuanto a recuperacion de errores. No hay informacion disponible sobre el numero de episodios, el numero de tokens o muestras vistas, la composicion exacta del dataset, la duracion del entrenamiento, ni sobre si se aplicaron tecnicas de RLHF, DPO u optimizacion por preferencias (poco habituales en este tipo de politicas). Tampoco se documenta ninguna innovacion tecnica adicional mas alla del propio pipeline de SmolVLA.

## Capacidades

- Manipulacion robotica en simulacion: ejecuta la secuencia de pick-and-place de un bloque azul sobre una estrella azul con el Unitree G1 y la mano Dex3-1 en MuJoCo.
- Politica visomotora: traduce imagenes de una camara de cabeza mas una consigna de tarea en acciones articulares continuas.
- Generalizacion limitada de posiciones: segun la model card, alcanza un 73 % de exito en 30 poses de bloque no vistas.
- Condicionamiento por lenguaje: al heredar la estructura de SmolVLA, acepta una instruccion textual que describe la tarea (idioma no confirmado).
- Ejecucion en hardware modesto: con 450 M de parametros, la inferencia es viable en GPU de consumo, lo que facilita experimentacion y despliegue en laboratorio.
- No se documenta soporte de tool calling ni function calling.
- No se documenta comportamiento agentico ni razonamiento multi-paso mas alla de la propia secuencia de manipulacion.
- No se documentan capacidades de vision general (captioning, VQA), audio ni modo de razonamiento explicito (thinking mode).
- No se documenta generacion de texto libre: el modelo esta ajustado como politica de acciones.

## Casos de uso

- Reproduccion de experimentos de VLA en simulacion: sirve como punto de partida para verificar el pipeline completo de LeRobot, MuJoCo y el modelo Unitree G1 antes de escalar a variantes mayores.
- Estudio de aprendizaje a partir de demostraciones de IK: permite comparar hasta que punto las trayectorias generadas por planificacion con cinematica inversa producen politicas visuales utiles frente a teleoperacion humana.
- Benchmark de recetas de fine-tuning: al ser un modelo pequeno (450 M) y de entrenamiento rapido, es adecuado para hacer ablaciones sistematicas de aumento de datos, numero de camaras o espacio de acciones (articular frente a cartesiano).
- Docencia y formacion en robotica: un caso de pick-and-place acotado y verificable en MuJoCo es util para practicas de laboratorio sobre politicas visuales.
- Evaluacion de robustez ante variaciones de pose: el protocolo de 30 poses no vistas se puede ampliar para medir sensibilidad a cambios de iluminacion, oclusiones o posicion de la camara.
- Punto de partida para sim-to-real: el modelo puede servir como inicializacion para un ajuste posterior con datos de un G1 real, aunque no hay evidencia publicada de transferencia en este repositorio.
- Comparacion de coste computacional: referencia para medir el equilibrio entre precision de tarea y huella de memoria frente a VLA de miles de millones de parametros en el mismo entorno simulado.

## Benchmarks y rendimiento

Los unicos datos publicados en la informacion disponible son los de la model card del autor:

| Benchmark | Entorno | Metrica | Resultado |
|---|---|---|---|
| Pick-and-place bloque azul sobre estrella azul | MuJoCo, Unitree G1 + Dex3-1 | Tasa de exito en 30 poses de bloque no vistas | 73 % |

No se han publicado resultados de benchmarks en la informacion disponible para metricas estandar de VLA (por ejemplo, tareas de LIBERO, SimplerEnv o variantes de Open X-Embodiment), ni comparaciones directas con otros modelos bajo el mismo protocolo de evaluacion.

## Requisitos de hardware

- Pesos en 16 bits: aproximadamente 0,9 GB, en linea con el tamano del repositorio (450 M de parametros).
- VRAM estimada para inferencia: sin cifras oficiales; como estimacion orientativa, entre 2 y 4 GB considerando pesos, encoder de vision y buffers de acciones en precision de 16 bits.
- GPU de consumo: el modelo cabe con holgura en tarjetas de 8 GB o mas, como RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070, RTX 4080 y RTX 4090.
- GPU de datacenter: A100, H100 o L40S estan sobredimensionadas para inferencia de este tamano; son utiles para reentrenamiento, ajuste fino y evaluacion por lotes de multiples episodios en paralelo.
- Opciones de despliegue: la libreria lerobot sobre PyTorch es la via documentada; el repositorio no indica soporte para vLLM, TGI, llama.cpp, Ollama ni exportacion a GGUF (no es un modelo de texto). Tampoco se documenta exportacion a ONNX o TensorRT.
- Entorno de evaluacion: MuJoCo, con el robot Unitree G1 y la mano Dex3-1.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

Los datos de los modelos alternativos proceden de su documentacion publica general y no se han verificado contra las fuentes originales en esta ficha; en particular, las licencias deben confirmarse antes de cualquier uso comercial.

| Modelo | Parametros | Tipo | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| g1-smolvla-attempt2-ik-demos | 450 M | VLA especializada (fine-tune de SmolVLA) para G1 + Dex3-1 | no disponible | no disponible | HuggingFace, 0 descargas, 1 like |
| SmolVLA (modelo base, HuggingFace) | aprox. 450 M | VLA generica sobre backbone SmolVLM | no disponible | no verificada en esta ficha | publica en HuggingFace |
| OpenVLA | 7 B | VLA de proposito general sobre backbone Prismatic | no disponible | no verificada en esta ficha | publica en HuggingFace |
| Octo | aprox. 93 M en la variante base | politica transformer para manipulacion, sin backbone de lenguaje completo | no disponible | no verificada en esta ficha | publica en HuggingFace |

No hay datos publicados que permitan comparar el rendimiento de este fine-tune con el de las alternativas bajo un protocolo comun: la unica metrica disponible (73 % en 30 poses no vistas) es especifica de la tarea y del entorno definidos por el autor.

## Limitaciones y advertencias

- Licencia no declarada: sin licencia explicita, no hay autorizacion clara para uso comercial ni para redistribucion; hay que contactar con el autor antes de cualquier despliegue en produccion.
- Modelo muy especializado: resuelve una unica tarea de pick-and-place en MuJoCo con un robot y una mano concretos; no es una politica generalista.
- Tasa de fallo del 27 % en el propio protocolo de evaluacion del autor, medido sobre solo 30 poses no vistas, lo que implica alta incertidumbre estadistica en la metrica.
- Entrenamiento con demostraciones de IK: la politica puede no haber visto recuperaciones de error, oclusiones o perturbaciones, y tiende a fallar fuera de la distribucion de trayectorias planificadas.
- Evidencia unicamente en simulacion: no se documenta validacion en un Unitree G1 fisico ni estudio de sim-to-real.
- Sin informacion sobre sesgos, composicion del dataset ni diversidad de escenarios; no se puede evaluar el comportamiento ante objetos, colores o disposiciones distintos de la tarea descrita.
- Idioma de las instrucciones no confirmado; la model card esta en ingles y no se declara soporte multilingue.
- Repositorio sin traccion: 0 descargas y 1 like, sin revision por pares ni validacion independiente de los resultados.
- No se documentan cuantizaciones, formatos alternativos de pesos ni soporte en runtimes de inferencia habituales, lo que limita su integracion en infraestructura existente.
- En este tipo de modelos el concepto de alucinacion se traduce en acciones fisicamente invalidas o incoherentes mas que en texto inventado; no hay analisis publicado de estos modos de fallo.
- La busqueda web realizada no devolvio ningun resultado relevante sobre el modelo, el autor o el proyecto: solo dominios ajenos al ambito tecnico, por lo que no hay fuentes externas que corroboren las cifras.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/adityamohan2604/g1-smolvla-attempt2-ik-demos
- Codigo, evaluacion e instrucciones (GitHub del autor): https://github.com/Adityamohan260498/RL-Finetuned-VLA-Humanod-Manipulation
- Resultados de busqueda web: no se encontro ningun enlace relevante; las busquedas devolvieron unicamente dominios ajenos al ambito tecnico.
- SmolVLA y libreria LeRobot (documentacion del modelo base): no disponible en la informacion proporcionada.
