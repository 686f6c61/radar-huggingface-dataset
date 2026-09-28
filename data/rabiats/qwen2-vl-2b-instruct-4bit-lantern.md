# RabiatS/Qwen2-VL-2B-Instruct-4bit-Lantern

## Resumen

RabiatS/Qwen2-VL-2B-Instruct-4bit-Lantern es una copia redistribuida del modelo multimodal mlx-community/Qwen2-VL-2B-Instruct-4bit, es decir, una conversion a formato MLX y cuantizacion de 4 bits del modelo original Qwen/Qwen2-VL-2B-Instruct de Alibaba Qwen. El repositorio lo mantiene el autor de Lantern, una aplicacion de IA para iPhone, iPad y Mac que funciona de forma totalmente local: sin cuenta de usuario, sin servidor y sin enviar datos fuera del dispositivo. El unico uso de red es la descarga inicial de los pesos.

El modelo pesa aproximadamente 2,2 mil millones de parametros (2.208.985.600 exactamente segun los safetensors) y ocupa unos 1,3 GB en el repositorio, lo que lo situa en la categoria de modelos pequenos aptos para ejecucion en dispositivo. Acepta como entrada texto e imagenes (pipeline image-text-to-text) y esta pensado para tareas como leer un menu, un cartel, un documento o un diagrama a partir de una foto y responder preguntas de seguimiento sobre ese contenido.

Su relevancia actual es practica mas que cientifica: no introduce cambios en los pesos ni innovaciones de arquitectura, sino que empaqueta una conversion ya existente para un caso de uso concreto, la inferencia privada y offline en hardware Apple. Para desarrolladores, resulta util como referencia de que tamano de modelo multimodal cabe en un telefono de gama media-alta y como se distribuye un modelo optimizado para Apple Silicon.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible en la informacion proporcionada (hereda la del modelo base Qwen/Qwen2-VL-2B-Instruct) |
| Parametros totales | 2.208.985.600 (aproximadamente 2,2 mil millones) |
| Parametros activos | no aplica (no es un modelo MoE segun la informacion disponible) |
| Longitud de contexto | no disponible en la informacion proporcionada |
| Tipos de cuantizacion | 4 bits, formato MLX (unica variante publicada en este repositorio) |
| Idiomas soportados | no disponible en la informacion proporcionada |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors en formato MLX (libreria mlx) |
| Modalidades de entrada | texto e imagen (image-text-to-text) |
| Tamano del repositorio | 1,3 GB |
| Modelo base | Qwen/Qwen2-VL-2B-Instruct |
| Conversion previa | mlx-community/Qwen2-VL-2B-Instruct-4bit |
| Framework de inferencia | MLX (mlx-vlm en Mac; app Lantern en iOS/iPadOS/macOS) |
| Descargas en HuggingFace | 0 |
| Likes en HuggingFace | 0 |
| Fecha de creacion (metadatos de HuggingFace) | 2026-09-28 |
| Fecha de actualizacion (metadatos de HuggingFace) | 2026-09-27 |

## Arquitectura y entrenamiento

El autor indica explicitamente que los pesos no se han modificado respecto a la conversion de mlx-community: se trata de una re-publicacion del mismo modelo en 4 bits MLX, no de un ajuste fino ni de un entrenamiento adicional. La unica intervencion es el empaquetado y la integracion con la aplicacion Lantern, que comprueba el modelo contra la memoria disponible del dispositivo antes de iniciar la descarga.

Por tanto, toda la arquitectura, el corpus de entrenamiento, el numero de tokens vistos y las fases de alineacion (si las hubo) corresponden al modelo original Qwen/Qwen2-VL-2B-Instruct y no se documentan en esta ficha. La model card de esta copia no incluye detalles sobre composicion del dataset, tecnicas de alineacion ni innovaciones de atencion. Cualquier afirmacion sobre resolucion dinamica, codificacion posicional o estrategias de entrenamiento debe verificarse en la documentacion oficial del modelo base, que no forma parte de la informacion proporcionada para esta ficha.

## Capacidades

- Generacion de texto conversacional multi-turno, con historial de conversacion, en el pipeline image-text-to-text.
- Comprension de imagenes: lectura de menús, carteles, documentos, diagramas y fotografias, segun la descripcion del autor.
- Respuesta a preguntas de seguimiento sobre una imagen ya analizada, lo que implica mantener el contexto visual entre turnos.
- Descripcion de contenido visual en lenguaje natural (por ejemplo, responder a la pregunta "que hay en esta foto").
- Ejecucion completamente local en iPhone, iPad y Mac, sin conexion a red tras la descarga inicial.
- Integracion con la app Lantern mediante el flujo "Add a model from Hugging Face" y con mlx-vlm en macOS.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Modo de razonamiento explicito (thinking), audio o video: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponible en la informacion proporcionada; no se detalla la lista de idiomas.

## Casos de uso

- Accesibilidad en movil: una persona con discapacidad visual fotografía un cartel, un producto o un documento y el modelo lo describe y responde a preguntas de seguimiento, todo en el dispositivo y sin enviar la imagen a ningun servidor.
- Lectura de documentos personales: digitalizar facturas, contratos o notas manuscritas mediante foto y extraer la informacion relevante sin que el documento salga del telefono, lo que resulta adecuado por el caracter offline y privado del empaquetado.
- Asistencia en comercio o restauracion: fotografiar un menu en otro idioma o una etiqueta de producto y obtener explicaciones y recomendaciones sobre ingredientes, alérgenos o precio, con el modelo corriendo en un iPhone de 6 GB o superior.
- Soporte tecnico de campo: un tecnico fotografía una placa, un diagrama de cableado o una pantalla de error y consulta al modelo sobre posibles causas, sin depender de cobertura movil en entornos industriales o remotos.
- Educacion y estudio: el alumno fotografía un ejercicio de un libro o un grafico y pide explicaciones paso a paso o resúmenes; el modelo mantiene el contexto visual durante la conversacion.
- Prototipado de aplicaciones VLM en Apple Silicon: desarrolladores que quieren evaluar las capacidades de un modelo multimodal de 2,2B en 4 bits pueden usar mlx-vlm en un Mac antes de decidir si integran el modelo en una app iOS.
- Clasificacion y etiquetado asistido de imagenes en pequenos flujos de trabajo locales, siempre que la tarea no requiera alta precision ni categorias muy especializadas.
- Demostraciones de IA privada: escenarios de consultoria o formacion donde se necesita mostrar inferencia multimodal sin conexion y sin cuentas de terceros.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

La model card del repositorio no incluye metricas de MMLU, HumanEval, GSM8K, MMMU ni de ningun otro conjunto de evaluacion, y la busqueda web realizada no ha devuelto ningun resultado relevante sobre este modelo. Los unicos datos cuantitativos confirmados son el numero de parametros (2.208.985.600), el tamano del repositorio (1,3 GB), la precision (4 bits MLX) y los requisitos de memoria indicados por el autor (dispositivos iPhone con 6 GB o mas y cualquier Mac con Apple Silicon).

## Requisitos de hardware

- VRAM/unified memory estimada: el autor indica que funciona en iPhone de 6 GB en adelante y en cualquier Mac con Apple Silicon; el repositorio ocupa 1,3 GB, por lo que el consumo real incluye ese peso mas el estado de la conversacion y las activaciones.
- Compatibilidad con GPU de escritorio: no disponible. El modelo esta en formato MLX, especifico de Apple Silicon, y no se distribuye en safetensors estandar ni en GGUF.
- GPU NVIDIA recomendadas (A100, H100, RTX 4090): no aplica a este repositorio concreto; no se documenta una ruta de conversion a CUDA.
- Encaje en GPU de consumo: no aplica en el sentido habitual, ya que el objetivo son chips Apple M-series y los SoC de iPhone/iPad. Cabe en cualquier Mac Apple Silicon por el tamano del modelo.
- Opciones de despliegue: app Lantern (iPhone, iPad, Mac) y mlx-vlm en macOS mediante el comando mlx_vlm.generate. No se documenta soporte para vLLM, llama.cpp, Ollama, TGI ni otros servidores de inferencia.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Formato / cuantizacion | Contexto | Licencia | Notas |
|---|---|---|---|---|---|
| RabiatS/Qwen2-VL-2B-Instruct-4bit-Lantern | 2,2B (2.208.985.600) | MLX, 4 bits | no disponible | Apache 2.0 | Re-publicacion para la app Lantern; pesos identicos a la conversion de mlx-community |
| mlx-community/Qwen2-VL-2B-Instruct-4bit | 2,2B | MLX, 4 bits | no disponible | Apache 2.0 | Conversion de origen; mismo contenido de pesos |
| Qwen/Qwen2-VL-2B-Instruct | 2,2B | safetensors, precision original | no disponible | Apache 2.0 | Modelo base publicado por el equipo Qwen; incluye pesos sin cuantizar |
| Qwen2-VL-7B-Instruct | no disponible en la informacion proporcionada | no disponible | no disponible | no disponible | Alternativa de mayor tamano de la misma familia; los datos no se han verificado en esta busqueda |
| Alternativas multimodales pequenas para dispositivo (por ejemplo, familias SmolVLM o FastVLM) | no disponible | no disponible | no disponible | no disponible | No se dispone de datos verificados en la informacion proporcionada |

## Limitaciones y advertencias

- Los pesos son identicos a los de mlx-community/Qwen2-VL-2B-Instruct-4bit; no hay ajuste fino ni mejora respecto a esa conversion, por lo que hereda cualquier limitacion del modelo base.
- La cuantizacion a 4 bits introduce perdida de precision frente al modelo original sin cuantizar, especialmente en tareas de OCR fino, matematicas o razonamiento visual detallado.
- Riesgo de alucinacion: como cualquier modelo generativo de 2,2B, puede inventar texto en imagenes, interpretar mal diagramas o afirmar detalles que no aparecen en la fotografia. Para usos donde el error tenga consecuencias, se requiere verificacion humana.
- Sesgos conocidos: no disponibles en la informacion proporcionada. Al no documentarse la composicion del dataset ni los idiomas, no es posible evaluar sesgos culturales o linguisticos a partir de esta ficha.
- Limitaciones de idioma: no se especifica la lista de idiomas soportados en la model card de esta copia.
- Longitud de contexto: no se documenta en este repositorio; conviene consultar la ficha del modelo base antes de disenar flujos que dependan de entradas largas o de muchas imagenes por conversacion.
- Compatibilidad restringida: el formato MLX limita el uso a Apple Silicon. No hay versiones GGUF, AWQ, GPTQ ni safetensors estandar en este repositorio, lo que descarta su despliegue en servidores Linux con GPU NVIDIA o AMD.
- Licencia: Apache 2.0, que permite uso comercial, pero el autor recuerda que el credito del modelo corresponde a sus creadores originales y el de la conversion MLX a mlx-community. Conviene revisar los terminos del modelo base por si hubiera condiciones adicionales.
- Soporte y mantenimiento: el repositorio registra 0 descargas y 0 likes en el momento de la consulta, y la unica finalidad declarada es servir a la app Lantern. No hay garantia de actualizaciones ni de soporte por parte del autor.
- La busqueda web realizada no ha devuelto ningun resultado relevante sobre el modelo (unicamente contenido no relacionado), por lo que no existe validacion externa de su comportamiento en produccion.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/RabiatS/Qwen2-VL-2B-Instruct-4bit-Lantern
- Conversion MLX de origen: https://huggingface.co/mlx-community/Qwen2-VL-2B-Instruct-4bit
- Modelo base: https://huggingface.co/Qwen/Qwen2-VL-2B-Instruct
- Aplicacion Lantern: https://github.com/RabiatS/lantern
- Paper, blog o demo adicionales: no disponible. La busqueda web no ha devuelto resultados relevantes sobre este modelo.
