# RabiatS/teleocr-web

## Resumen

TeleOCR-web es una distribucion del modelo TeleOCR empaquetada especificamente para su ejecucion en el navegador mediante transformers.js. No se trata de un modelo nuevo: es una copia podada de los ficheros ONNX publicados en `stefanj0/TeleOCR-ONNX` (commit `02bb1bedf6a9480f8f45749d4bd87c7dad0d1d6d`), reducida a los artefactos que carga la demo `rabiatsadiq.com/lab/teleocr/`. Los pesos son identicos a los del modelo base `XingChen-AGI/TeleOCR`; el autor del repositorio (RabiatS) solo cambia el formato y el subconjunto de ficheros servidos.

El modelo original, TeleOCR, esta desarrollado por Peng Cai y el equipo XingChen-AGI y esta orientado a lectura de documentos y reconocimiento optico de caracteres (pipeline `Document reading`, `image-text-to-text`). Los tags del repositorio incluyen `qwen2_5_vl`, lo que indica que la arquitectura subyacente pertenece a la familia Qwen2.5-VL (transformer vision-language), aunque la model card no detalla parametros ni contexto. El repositorio ocupa 1,8 GB en total.

Su relevancia practica es la de permitir OCR y comprension de documentos sin backend: la inferencia ocurre en el cliente, lo que elimina costes de servidor y evita enviar documentos potencialmente sensibles a terceros. La licencia Apache 2.0 facilita su reutilizacion comercial, y la fecha de publicacion indicada (5 de octubre de 2026) sugiere una version reciente dentro del ecosistema transformers.js.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (los tags indican `qwen2_5_vl`, es decir, transformer vision-language de la familia Qwen2.5-VL) |
| Parametros totales | no disponible (el repositorio ocupa 1,8 GB, pero no se desglosa el numero de parametros) |
| Parametros activos | no aplica (no se ha indicado que sea un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (se distribuyen pesos ONNX; no se especifican variantes fp16/int8/int4) |
| Idiomas soportados | no disponible (la model card no declara idiomas; el pipeline es de lectura de documentos) |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX, cargables con transformers.js |
| Tamano del repositorio | 1,8 GB |
| Pipeline declarado | Document reading (image-text-to-text) |
| Modelo base | XingChen-AGI/TeleOCR (pesos sin modificar) |

## Arquitectura y entrenamiento

El repositorio es una conversion y redistribucion, no un entrenamiento nuevo. Los pesos proceden de `XingChen-AGI/TeleOCR` y se han exportado a ONNX a traves de `stefanj0/TeleOCR-ONNX`; la model card afirma explicitamente que "the weights are unchanged". El tag `qwen2_5_vl` situa la arquitectura en la familia Qwen2.5-VL, un transformer multimodal con codificador visual y decodificador de lenguaje, especializado en tareas de grounding y lectura de documentos. No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset ni si hubo fases de RLHF o DPO.

La innovacion relevante de esta distribucion es de ingenieria de despliegue: se ha recortado el conjunto de ficheros del export ONNX original para dejar unicamente los que consume la demo web, de modo que el navegador descarga menos datos y la pagina no depende de un repositorio de terceros que pueda cambiar o desaparecer. No se documentan en la informacion disponible tecnicas como decodificacion especulativa, atencion lineal o modos de razonamiento extendido.

## Capacidades

- Lectura de documentos e imagenes con texto: el pipeline declarado es `Document reading` y la tarea `image-text-to-text`, por lo que acepta imagen como entrada y produce texto.
- Reconocimiento optico de caracteres (OCR) sobre capturas, escaneos y fotografias de documentos.
- Comprension de estructura de documentos en la medida en que lo permita el modelo base Qwen2.5-VL (el repositorio no enumera capacidades concretas).
- Ejecucion en el navegador del cliente mediante transformers.js, sin llamadas a un servicio de inferencia.
- Tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponibles; la model card no declara idiomas.
- Capacidades especiales (modo thinking, vision adicional, audio): no disponibles.

## Casos de uso

- Digitalizacion de documentos sin backend: la demo carga el modelo ONNX en el navegador, de modo que un usuario puede subir una imagen de un documento y obtener el texto sin que el fichero salga de su equipo. Es el escenario para el que se creo este repositorio.
- Aplicaciones web con requisitos de privacidad: al ejecutarse en el cliente, encaja en el tratamiento de documentos medicos, legales o financieros donde enviar el original a un servidor de terceros no es aceptable.
- Aplicaciones progresivas (PWA) y uso sin conexion: una vez cacheado el ONNX de 1,8 GB, la inferencia puede realizarse sin conectividad, util para trabajo de campo o entornos con red intermitente.
- Prototipado rapido de productos OCR: permite validar una idea de extraccion de texto en una pagina web sin montar infraestructura de inferencia ni contratar GPU.
- Preprocesado de documentos en pipelines internos: usar el export ONNX con onnxruntime en un servicio propio para extraer texto antes de alimentar un indice de busqueda o un RAG.
- Reduccion de costes en cargas de OCR de bajo volumen: al no requerir GPU de servidor, resulta adecuado para proyectos con trafico esporadico donde el coste fijo de un endpoint dedicado no se justifica.
- Demos y material docente: sirve para mostrar como se integra un modelo vision-language en el navegador con transformers.js y WebGPU sin escribir codigo de servidor.
- Evaluacion comparativa del modelo base: al conservar los pesos originales sin modificar, el repositorio permite medir la perdida de calidad asociada a la exportacion ONNX frente a la version en safetensors del modelo base.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del repositorio no incluye metricas de MMLU, HumanEval, GSM8K ni de evaluaciones de OCR como OCRBench u OmniDocBench, y el autor indica que se limita a copiar ficheros de otro repositorio. Tampoco se proporcionan cifras de latencia o throughput.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Como referencia del orden de magnitud, el repositorio ONNX ocupa 1,8 GB, por lo que la huella en memoria sera de esa escala mas el espacio de activaciones y del procesador visual; cualquier cifra concreta seria una estimacion no verificada.
- GPU de servidor: un artefacto ONNX de 1,8 GB es holgadamente compatible con GPUs de 8 a 24 GB (RTX 4090, L4, A10G, A100 40 GB, H100) si se sirve con onnxruntime; no se documentan requisitos oficiales.
- GPU de consumo: por tamano de fichero, encaja previsiblemente en GPUs de consumo con 8 GB o mas de VRAM, pero no hay confirmacion del autor.
- Ejecucion en navegador: el destino principal es transformers.js, con aceleracion WebGPU cuando esta disponible y respaldo en WASM/CPU. Requiere descargar y cachear cerca de 1,8 GB en el cliente, lo que condiciona el tiempo de primera carga.
- Moviles y equipos de gama baja: no hay datos publicados; la limitacion principal sera la memoria del dispositivo y el coste de la descarga inicial.
- Opciones de despliegue: transformers.js en navegador (caso de uso previsto), onnxruntime en servidor. vLLM, TGI y llama.cpp no consumen ONNX de forma nativa, por lo que requeririan conversion previa; no se documenta ninguna de estas rutas.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Relacion | Parametros | Contexto | Licencia | Formato y disponibilidad |
|---|---|---|---|---|---|
| RabiatS/teleocr-web | Este repositorio | no disponible | no disponible | Apache 2.0 | ONNX para transformers.js, 1,8 GB |
| XingChen-AGI/TeleOCR | Modelo base del que proceden los pesos | no disponible | no disponible | Apache 2.0 | Pesos originales publicados por XingChen-AGI (Peng Cai y equipo) |
| stefanj0/TeleOCR-ONNX | Export ONNX del que se copian los ficheros | no disponible | no disponible | Apache 2.0 | ONNX completo, del que este repositorio es un subconjunto podado |
| Familia Qwen2.5-VL | Arquitectura de referencia segun los tags | no disponible | no disponible | Apache 2.0 (segun la familia) | Safetensors y multiples cuantizaciones en el ecosistema |

No se dispone de datos de rendimiento comparativos entre estas variantes en la informacion proporcionada; la unica diferencia documentada es el formato y el subconjunto de ficheros, ya que los pesos son identicos.

## Limitaciones y advertencias

- No hay benchmarks ni evaluaciones publicadas en la informacion disponible, por lo que no puede acreditarse su calidad frente a alternativas de OCR.
- Riesgo de alucinacion: al ser un modelo generativo image-text-to-text, puede producir texto que no aparece en la imagen, algo especialmente problematico en extraccion de datos estructurados (importes, fechas, identificadores).
- Idiomas soportados sin declarar: no se indica que lenguas reconoce ni con que calidad, lo que obliga a validar cada idioma antes de usarlo en produccion.
- Longitud de contexto desconocida: no puede planificarse el procesamiento de documentos largos o de multiples paginas sin una prueba previa.
- Sin garantias de mantenimiento: el repositorio tiene 0 descargas y 0 likes y su proposito declarado es servir una demo concreta; el autor advierte de que es una copia fijada a un commit, no un proyecto con soporte.
- Redistribucion, no desarrollo: los pesos son los del modelo base sin modificar, de modo que cualquier sesgo o limitacion de `XingChen-AGI/TeleOCR` se hereda integramente.
- Licencia Apache 2.0: permite uso comercial, pero conviene revisar las condiciones del modelo base y del export ONNX del que procede, asi como las licencias de las dependencias de transformers.js y onnxruntime.
- Coste de cliente: la descarga de 1,8 GB y el consumo de memoria y bateria en el navegador pueden ser prohibitivos en conexiones lentas o dispositivos moviles.
- Los resultados de busqueda web realizados no devolvieron informacion tecnica relevante sobre el modelo (contenian contenido sin relacion), por lo que no se ha podido contrastar ningun dato adicional de forma externa.
- En produccion, cualquier uso sobre documentos con valor legal o economico deberia acompanarse de verificacion humana y de un plan de contingencia ante fallos de extraccion.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/RabiatS/teleocr-web
- Modelo base original: https://huggingface.co/XingChen-AGI/TeleOCR
- Export ONNX de origen: https://huggingface.co/stefanj0/TeleOCR-ONNX
- Commit de referencia del export: `02bb1bedf6a9480f8f45749d4bd87c7dad0d1d6d`
- Demo en el navegador: https://www.rabiatsadiq.com/lab/teleocr/
- Paper, blog o repositorio adicional: no disponible en la informacion proporcionada
