# donghao-zhou/PackLab-VLM-9B

## Resumen

PackLab-VLM-9B es un modelo de vision-lenguaje especializado en *bin packing* robotico en bucle cerrado, desarrollado por el usuario donghao-zhou y publicado en HuggingFace. Se trata de un ajuste fino supervisado (SFT) del backbone Qwen3.5-9B sobre el dataset PackData-20K, orientado a predecir acciones de empaquetado estructuradas a partir de estados multimodales: el mapa de altura del contenedor (*heightmap*), los atributos de los objetos candidatos y el historial de observaciones y acciones.

El modelo resuelve un problema muy concreto dentro de la robotica de manipulacion: dada una representacion visual del estado del contenedor y un conjunto de piezas candidatas, decidir que objeto colocar, donde y con que orientacion. Frente a planificadores geometricos clasicos, un VLM permite incorporar informacion semantica (forma, material, fragilidad, restricciones expresadas en lenguaje) y operar en bucle cerrado corrigiendo la politica con cada nueva observacion.

Con 9.409.813.744 parametros (aproximadamente 9,4 mil millones) y un repositorio de 18,8 GB en formato safetensors, es un modelo de gama media que resulta desplegable en GPU de consumo con cuantizacion de 4 bits. Su licencia Apache 2.0 y su enfasis en investigacion lo hacen relevante para laboratorios que trabajan en politicas robóticas multimodales, aunque carece por ahora de benchmarks publicados, de soporte multilingue (solo ingles) y de formatos GGUF listos para usar.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (vision-lenguaje), fine-tune del backbone Qwen3.5-9B |
| Parametros totales | 9.409.813.744 (9,4 B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (no se publican variantes GGUF, AWQ ni GPTQ; solo safetensors) |
| Idiomas soportados | en (ingles) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (repo de 18,8 GB; incluye config.json, generation_config.json, processor_config.json, tokenizer.json, tokenizer_config.json y chat_template.jinja) |

## Arquitectura y entrenamiento

La model card indica que PackLab-VLM-9B es un modelo de vision-lenguaje derivado de Qwen3.5-9B mediante ajuste fino supervisado con objetivos orientados al empaquetado, entrenado sobre el dataset PackData-20K (20.000 muestras, segun la nomenclatura del dataset). No se detallan en la informacion disponible ni la composicion del dataset, ni el numero de tokens de entrenamiento, ni si hubo fases de RLHF o DPO. Tampoco se especifica el codificador visual empleado ni la resolucion de las imagenes de entrada.

La innovacion funcional del modelo esta en la representacion de entrada y salida. La entrada multimodal combina el *heightmap* del contenedor (una representacion de profundidad acumulada que resume el estado fisico del espacio de empaquetado), los atributos de los objetos candidatos y el historial de observaciones y acciones previas. La salida es una accion de empaquetado estructurada, lo que situa al modelo dentro del paradigma de politicas de control en bucle cerrado: cada accion ejecutada genera una nueva observacion que realimenta al modelo en el siguiente paso. El repositorio PackLab incluye el codigo de entorno, inferencia, evaluacion y formateo de datos, con la expectativa por defecto de encontrar el checkpoint en `weights/PackLab-VLM-9B/`.

## Capacidades

- Generacion de acciones de empaquetado estructuradas a partir de estados multimodales (heightmap del contenedor, atributos de objetos candidatos, historial de observacion-accion).
- Comprension de imagenes y texto en una unica entrada, con pipeline `image-text-to-text` y modo conversacional.
- Razonamiento espacial aplicado a la seleccion de objeto, posicion y orientacion dentro de un contenedor.
- Control en bucle cerrado: la politica puede re-evaluarse tras cada accion ejecutada.
- Evaluacion de empaquetado fisico como caso de uso declarado por el autor.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Capacidades de agente y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: solo ingles.
- Modo *thinking*, vision adicional, audio u otras capacidades especiales: no disponible.

## Casos de uso

- Planificacion de empaquetado en almacenes robotizados: el modelo recibe el heightmap actual de la caja o palet y la lista de piezas candidatas, y devuelve la siguiente accion de colocacion; puede integrarse en un bucle con un brazo robotico que ejecute la accion y reenvie la nueva observacion.
- Investigacion en politicas de control en bucle cerrado: sirve como baseline de VLM frente a planificadores heuristicos o geometricos en entornos de simulacion de bin packing, permitiendo medir la tasa de exito fisica del empaquetado.
- Manipulacion de objetos heterogeneos: al incorporar atributos de los objetos candidatos, resulta adecuado para escenarios con piezas de formas, tamanos y orientaciones variadas donde una heuristica fija falla.
- Automatizacion de lineas de paletizado: el modelo puede generar acciones sucesivas de apilado manteniendo la estabilidad del conjunto, con supervision humana en la fase de validacion.
- Evaluacion de empaquetado fisico en simuladores: uso del checkpoint para generar trayectorias de empaquetado y comparar metricas de utilizacion de volumen, estabilidad y numero de acciones necesarias.
- Prototipado de interfaces robotica-lenguaje: al ser un modelo conversacional `image-text-to-text`, permite construir demos donde un operador describe restricciones en ingles y el modelo las combina con el estado visual del contenedor.
- Fine-tuning adicional sobre dominios propios: con licencia Apache 2.0 y pesos safetensors, es viable reentrenar sobre datos de empaquetado especificos de una empresa (por ejemplo, logistica farmaceutica o alimentaria).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas de MMLU, HumanEval, GSM8K ni de tareas especificas de empaquetado (tasa de exito, utilizacion de volumen o numero de acciones por episodio), y la busqueda web realizada no aporto resultados relacionados con el modelo.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16/fp16: aproximadamente 18,8 GB solo de pesos, mas overhead de activaciones y cache KV; en la practica requiere del orden de 22-24 GB de VRAM.
- VRAM estimada en cuantizacion de 8 bits: alrededor de 9,4 GB de pesos; con overhead, del orden de 12-14 GB.
- VRAM estimada en cuantizacion de 4 bits: alrededor de 5-6 GB de pesos; con overhead, del orden de 8-10 GB.
- GPU recomendadas para precision completa: A100 40/80 GB, H100, L40S, RTX A6000 (48 GB) o dos GPU de 24 GB con tensor parallelism.
- GPU de consumo: cabe en RTX 4090 (24 GB) en bf16 con margen ajustado; en RTX 3090 (24 GB) de forma similar; en RTX 4080/4070 Ti (16 GB) y RTX 4060 Ti (16 GB) requiere cuantizacion de 8 bits; en RTX 3060 12 GB, RTX 4070 (12 GB) o GPUs de 8-10 GB requiere cuantizacion de 4 bits.
- Opciones de despliegue: vLLM, SGLang, TGI o transformers con el repositorio PackLab. No se publican pesos GGUF, AWQ ni GPTQ, por lo que llama.cpp u Ollama requeririan una conversion previa a GGUF por parte del usuario.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| PackLab-VLM-9B | 9,41 B | no disponible | no disponible (sin benchmarks publicados) | Apache 2.0 | safetensors en HuggingFace |
| Qwen3.5-9B (backbone citado) | ~9 B (segun nomenclatura) | no disponible | no disponible | no disponible | no disponible |
| Otros VLM de proposito general de ~7-9 B | no disponible | no disponible | no disponible | no disponible | no disponible |

La busqueda web realizada no devolvio informacion sobre modelos comparables ni sobre el propio backbone Qwen3.5-9B, por lo que no es posible establecer una comparativa cuantitativa fiable. La diferencia funcional principal frente a un VLM generico es su especializacion en acciones de empaquetado estructuradas y su integracion con el pipeline PackLab.

## Limitaciones y advertencias

- Sesgos conocidos: no disponible. No se documenta analisis de sesgos ni composicion demografica del dataset de entrenamiento.
- Riesgo de alucinacion: relevante y potencialmente critico, ya que el modelo genera acciones fisicas. El autor advierte explicitamente de que los usuarios deben evaluar las acciones generadas antes de aplicarlas a sistemas roboticos reales.
- Limitacion idiomatica: el modelo solo declara soporte de ingles; no hay evidencia de rendimiento en castellano u otros idiomas.
- Longitud de contexto: no disponible, lo que dificulta planificar tareas con historiales largos de observacion-accion.
- Ausencia de benchmarks: no hay metricas publicadas de exito de empaquetado, lo que impide estimar su rendimiento real frente a heuristicas clasicas.
- Restricciones de licencia: Apache 2.0 permite uso comercial y modificacion, con obligacion de mantener el aviso de licencia y el archivo NOTICE si existiera; no se declaran clausulas adicionales.
- Advertencia de seguridad fisica: la model card subraya que las acciones dependen de la entrada, los pesos y los parametros de decodificacion en tiempo de ejecucion, y pide validacion, supervision y salvaguardas de hardware antes de cualquier despliegue robotico real.
- Formato: al no existir variantes cuantizadas oficiales, el coste de integracion en entornos de inferencia ligera recae en el usuario.
- Madurez: el repositorio tiene 0 descargas y 0 likes en el momento de la consulta, sin comunidad ni soporte documentado mas alla del repositorio de codigo.

## Enlaces

- HuggingFace: https://huggingface.co/donghao-zhou/PackLab-VLM-9B
- Repositorio de codigo PackLab: https://github.com/Correr-Zhou/PackLab
- Paper: no disponible
- Blog o demo: no disponible
- Dataset PackData-20K: no disponible (referenciado en la model card sin enlace)
- Resultados de la busqueda web: no se encontraron resultados relevantes sobre el modelo; las entradas devueltas correspondian a documentacion de MongoDB y no guardan relacion con esta ficha.
