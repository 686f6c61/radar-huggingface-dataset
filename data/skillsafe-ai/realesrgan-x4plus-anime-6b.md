# skillsafe-ai/realesrgan-x4plus-anime-6b

## Resumen

Real-ESRGAN x4plus anime 6B es un modelo de superresolucion de imagen (image-super-resolution) con factor de escala x4, especializado en ilustracion y arte de estilo anime. El artefacto publicado por skillsafe-ai no es un modelo nuevo entrenado desde cero, sino una conversion reproducible a formato ONNX del checkpoint upstream `RealESRGAN_x4plus_anime_6B.pth` de Xintao Wang, verificada byte a byte contra una receta fijada. El sufijo "6B" del nombre hace referencia a los 6 bloques RRDB de la red, no a 6.000 millones de parametros: el modelo pesa 17,11 MB en fp32 y 8,61 MB en fp16, lo que lo situa en el rango de unos 4,5 millones de parametros.

Su relevancia no esta en la calidad maxima alcanzable, sino en el formato y el objetivo de despliegue: los artefactos estan pensados para ejecutarse integramente en el navegador mediante `onnxruntime-web` con ejecucion en WebGPU o WASM, sin backend ni GPU de servidor. Eso permite incrustar superresolucion x4 en aplicaciones web, editores de imagen o herramientas de retoque que procesan los pixeles en la maquina del usuario, con los beneficios de privacidad y coste cero de inferencia en servidor que ello implica.

La licencia es BSD-3-Clause, heredada de los pesos originales, lo que permite uso comercial con atribucion. No es un modelo de lenguaje: no genera texto, no razona, no soporta tool calling ni agentes, y no tiene ventana de contexto ni idiomas en el sentido habitual de un LLM. Este ficha lo trata, por tanto, como lo que es: un artefacto de vision por computador para reescalado de imagenes.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | RRDBNet (residual in residual dense block network), 6 bloques RRDB, escala x4 |
| Parametros totales | no disponible oficialmente; estimacion de ~4,5 millones derivada del tamano del archivo fp32 (17,11 MB), no confirmada por el autor |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (modelo de vision, no de lenguaje) |
| Tipos de cuantizacion | fp32 (`model.onnx`) y fp16 (`model_fp16.onnx`); no se publican variantes int8 |
| Idiomas soportados | no aplica; el modelo es independiente del idioma del contenido de la imagen |
| Licencia | BSD-3-Clause (pesos y arquitectura: Copyright (c) 2021, Xintao Wang) |
| Formato de pesos | ONNX (opset 17), dos variantes: fp32 y fp16 |

Datos adicionales verificables del repositorio:

| Parametro | Valor |
|---|---|
| Entrada | `input`, float32, forma `['batch', 3, 'height', 'width']` |
| Salida | `output`, float32, forma `['batch', 3, 'height_x4', 'width_x4']` |
| Opset | 17 |
| Tamano `model.onnx` | 17,11 MB, SHA-256 `9a029dae374b2cd4c3eb2dbbed857e22e6d785687c767aa12828e7356b9fb378` |
| Tamano `model_fp16.onnx` | 8,61 MB, SHA-256 `1777c7dffecdf356c234e3387d456a196ed9b72f9f14ed96bc097b9798b7ddbf` |
| Toolchain de conversion | Python 3.12.13, torch 2.10.0, onnx 1.23.0, onnxruntime 1.30.0, Darwin 25.6.0 arm64 |
| Fecha de conversion | 2026-09-22T03:08:57+00:00 |
| Tamano del repo en HuggingFace | 0,0 GB (descargas: 0; likes: 0 en el momento de la consulta) |

## Arquitectura y entrenamiento

La arquitectura es RRDBNet, una red convolucional generativa basada en bloques RRDB (residual in residual dense block). Cada bloque RRDB apila varios bloques densos con conexiones residuales y un multiplicador de residual, y el conjunto se ensambla en una ruta residual global con interpolacion de la entrada de baja resolucion antes de la salida. La variante concreta convertida emplea 6 bloques RRDB en lugar de la configuracion mas profunda de la version general, lo que reduce drasticamente el tamano (17,11 MB en fp32) a costa de capacidad de representacion. El factor de reescalado es fijo x4, sin parametro de escala configurable en la firma del grafo.

El modelo card no detalla el dataset de entrenamiento, el numero de tokens o pasos, ni si hubo etapas de RLHF o DPO, porque no aplica: los pesos upstream fueron entrenados por el autor original de Real-ESRGAN, y este repositorio es exclusivamente una conversion de formato. Lo destacable tecnicamente no es el entrenamiento, sino el pipeline de conversion y verificacion: la receta `recipes/realesrgan-x4plus-anime-6b.yaml` (SHA-256 `56cb0c56f...`) parte de un origen fijado por commit y hash (`f872d837d3c90ed2e05227bed711af5671a6fd1c9f7d7e91c911a61f155e99da`), y el repositorio declara que nada fue editado a mano. La verificacion compara la salida de ONNX Runtime en CPU contra la referencia PyTorch sobre entradas uniformes con semilla, con umbrales definidos en la receta: error absoluto maximo 1e-4 para fp32 y 0,05 mas PSNR minimo de 45 dB para fp16. Los resultados obtenidos (error maximo de 3,34e-06 en fp32 y 1,03e-03 en fp16) quedan holgadamente dentro de esos margenes.

## Capacidades

- Superresolucion de imagen con factor x4 sobre entradas RGB de cualquier resolucion (alto y ancho arbitrarios por firma dinamica), con salida de dimensiones exactamente cuatro veces mayores.
- Restauracion y realce de ilustracion de estilo anime, manga y arte lineal, que es el dominio para el que se entreno esta variante concreta.
- Reduccion de artefactos de compresion y suavizado tipicos de imagenes reescaladas con interpolacion bicubica o Lanczos.
- Procesamiento por lotes mediante el eje `batch` de la firma de entrada.
- Inferencia en navegador: el modelo card documenta uso directo con `onnxruntime-web` seleccionando `webgpu` con respaldo `wasm`.
- Ejecucion en CPU: la verificacion se realizo con ONNX Runtime en CPU, por lo que no requiere acelerador.
- No dispone de tool calling ni function calling.
- No dispone de capacidades de agente ni de razonamiento multi-paso.
- No dispone de capacidades multilingues en sentido NLP: es un modelo de vision.
- No dispone de modo "thinking", vision por comprension, audio, texto ni generacion de codigo.

## Casos de uso

- Editor de imagen en el navegador: una aplicacion web puede cargar `model_fp16.onnx` (8,61 MB) con `onnxruntime-web` y ofrecer reescalado x4 local, sin subir la imagen a ningun servidor. Es adecuado porque el peso del modelo es inferior a 9 MB y el pipeline de ejecucion WebGPU/WASM esta documentado en el propio modelo card.
- Herramienta de retoque para artistas de manga e ilustracion: el modelo esta especializado en el dominio anime, de modo que lineas y tramas se reconstruyen mejor que con un upscaler generico. El flujo tipico seria reescalar bocetos o escaneos de baja resolucion antes de colorear digitalmente.
- Preparacion de datasets para entrenamiento: reescalar un corpus de imagenes pequenas a x4 para tareas de difusion o clasificacion, ejecutando la conversion por lotes en GPU de servidor con ONNX Runtime. El contrato de entrada por lotes (`batch`, 3, alto, ancho) permite procesar varias imagenes por llamada.
- Optimizacion de activos en aplicaciones moviles o web: almacenar una unica version de baja resolucion de cada activo grafico y generar en el cliente la version de alta resolucion cuando se necesita, reduciendo el peso del paquete distribuido. Es adecuado porque la inferencia puede ocurrir en el dispositivo y no requiere red.
- Recuperacion de material de archivo digitalizado: escaneos antiguos de portadas, laminas o material promocional de baja resolucion pueden reescalarse x4 antes de reimprimir o catalogar, aprovechando la reduccion de artefactos de compresion del modelo.
- Servicio de impresion bajo demanda: previsualizar y generar pruebas de alta resolucion de ilustraciones enviadas por clientes en formato reducido, con la inferencia en el propio navegador del operador para evitar subir material con derechos de terceros a infraestructura propia.
- Integracion en pipelines de CI/CD de generacion de activos: ejecutar la conversion ONNX sobre un lote de imagenes fuente en cada build de un producto grafico, con verificacion de integridad mediante los SHA-256 publicados en el repositorio.
- Aplicacion de escritorio o terminal ligera con ONNX Runtime: el modelo cabe en 17,11 MB y se ejecuta en CPU con calidad fp32 verificada, por lo que sirve para herramientas de reescalado sin requisitos de GPU.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks sobre conjuntos de referencia de superresolucion (Set5, Set14, BSD100, Urban100, Manga109 ni similares) en la informacion disponible. Lo unico publicado es la verificacion de equivalencia numerica entre la conversion ONNX y la referencia PyTorch, que se reproduce a continuacion tal cual aparece en el modelo card:

| Variante | Entrada | Error absoluto maximo | Error absoluto medio | PSNR |
|---|---|---|---|---|
| fp32 | 64x64 | 3,34e-06 | 4,41e-07 | 125,0 dB |
| fp32 | 80x96 | 2,98e-06 | 4,28e-07 | 125,3 dB |
| fp16 | 64x64 | 7,19e-04 | 1,67e-04 | 73,6 dB |
| fp16 | 80x96 | 1,03e-03 | 1,49e-04 | 74,2 dB |

Estos valores miden fidelidad de la conversion (cuanto se desvia ONNX de PyTorch), no calidad perceptual del reescalado frente a otros modelos. Cualquier comparacion de calidad de imagen contra alternativas requeriria evaluaciones con PSNR, SSIM o LPIPS sobre datasets de superresolucion, que no estan disponibles en la informacion proporcionada.

## Requisitos de hardware

- VRAM para los pesos: 17,11 MB en fp32 y 8,61 MB en fp16. Es un modelo que no plantea ninguna restriccion de memoria por pesos.
- VRAM para activaciones: depende del area de la imagen de salida. Como referencia aritmetica, la salida de una entrada de 1024x1024 es un tensor de 4096x4096x3 en float32, aproximadamente 201 MB, por lo que para entradas grandes conviene trocear en tiles. Esta cifra es una estimacion derivada de la forma de salida documentada, no un dato publicado.
- GPU recomendadas: cualquier GPU con soporte WebGPU para el caso navegador; para servidor, cualquier GPU con soporte de CUDA basta, incluidas GTX 1650, RTX 3060, RTX 4090, A100 o H100, ya que el cuello de botella es el area de imagen y no los parametros.
- Cabe holgadamente en GPU de consumo, en iGPU y en CPU: la verificacion oficial se ejecuto en ONNX Runtime sobre CPU.
- Opciones de despliegue: `onnxruntime-web` con `executionProviders: ["webgpu", "wasm"]` es la via documentada por el autor; en servidor o escritorio puede usarse cualquier runtime compatible con ONNX. No hay artefactos GGUF, por lo que llama.cpp u Ollama no aplican a este modelo. vLLM y TGI tampoco aplican: son servidores de modelos de lenguaje.
- Latencia y throughput: no disponibles. No se publican mediciones de tiempo por imagen ni de imagenes por segundo para ninguna combinacion de hardware.

## Comparativa con modelos similares

La informacion proporcionada solo permite comparar este artefacto con su propio origen y con su variante de precision. No se dispone de datos verificables de otros upscalers en este repositorio, por lo que las celdas correspondientes se marcan como no disponibles.

| Modelo | Parametros | Escala | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| skillsafe-ai/realesrgan-x4plus-anime-6b (fp32) | ~4,5 M (estimado) | x4 | ONNX opset 17 | BSD-3-Clause | Version de maxima fidelidad, 17,11 MB, error maximo 3,34e-06 frente a PyTorch |
| skillsafe-ai/realesrgan-x4plus-anime-6b (fp16) | ~4,5 M (estimado) | x4 | ONNX opset 17 | BSD-3-Clause | 8,61 MB, pensada para navegador; error maximo 1,03e-03 y PSNR 74,2 dB frente a PyTorch |
| RealESRGAN_x4plus_anime_6B.pth (upstream) | no disponible | x4 | PyTorch .pth | BSD-3-Clause | Fuente original, SHA-256 `f872d837d3c90ed2e05227bed711af5671a6fd1c9f7d7e91c911a61f155e99da`; requiere PyTorch, no apto para navegador |
| Otros upscalers de superresolucion (variantes generales, SwinIR, ESRGAN, etc.) | no disponible | no disponible | no disponible | no disponible | Sin datos en la informacion proporcionada; no se establece comparacion |

## Limitaciones y advertencias

- No es un modelo de lenguaje: cualquier expectativa de generacion de texto, razonamiento, codigo, tool calling o agentes es inaplicable.
- El factor de escala esta fijado a x4. No hay parametro de escala en la firma del grafo, por lo que para otros factores habria que reescalar despues o buscar otra variante.
- Es una variante especializada en anime. Sobre fotografias reales o imagenes medicas, tecnicas o de satelite su comportamiento no esta documentado y previsiblemente sera inferior al de la version general de Real-ESRGAN.
- Riesgo de alucinacion visual: los modelos generativos de superresolucion inventan textura y detalle plausible donde no habia informacion. En contextos forenses, periciales, medicos o de documentacion historica, la salida no debe tratarse como evidencia de lo que contenia la imagen original.
- No hay informacion sobre sesgos del dataset de entrenamiento ni sobre su composicion demografica o cultural; el modelo card no los documenta.
- No hay limitaciones de contexto ni de idioma que reportar, al no ser un modelo de texto.
- Licencia BSD-3-Clause: permite uso comercial y modificacion siempre que se conserve el aviso de copyright y la clausula de exencion de responsabilidad, y que no se use el nombre del titular para promocionar trabajos derivados sin permiso. La receta de conversion y el modelo card son propiedad del repositorio SkillSafe y se rigen por su propia licencia; los pesos siguen bajo la licencia upstream.
- El repositorio muestra 0 descargas y 0 likes, y un tamano de 0,0 GB en la metadata de HuggingFace, lo que sugiere que los ficheros pueden servirse desde `models.skillsafe.ai` y no estar alojados directamente en el Hub. Conviene verificar la disponibilidad real de `model.onnx` y `model_fp16.onnx` antes de integrarlo en produccion.
- La clausula de "registry files are parameter files served from models.skillsafe.ai once vetted" implica que la disponibilidad puede depender de un proceso de revision externo al repositorio.
- Los umbrales de verificacion fp16 (error absoluto maximo 0,05) son mas laxos que los de fp32 (1e-4); si el caso de uso exige maxima fidelidad numerica, debe usarse la variante fp32.
- No se publican tiempos de inferencia, consumo energetico ni comportamiento bajo lotes grandes, por lo que la planificacion de capacidad en produccion requiere medicion propia.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/skillsafe-ai/realesrgan-x4plus-anime-6b
- Repositorio upstream de Real-ESRGAN: https://github.com/xinntao/Real-ESRGAN
- Pesos upstream `RealESRGAN_x4plus_anime_6B.pth` (v0.2.2.4): https://github.com/xinntao/Real-ESRGAN/releases/download/v0.2.2.4/RealESRGAN_x4plus_anime_6B.pth
- Licencia upstream BSD-3-Clause: https://github.com/xinntao/Real-ESRGAN/blob/a4abfb2979a7bbff3f69f58f58ae324608821e27/LICENSE
- Recetas y herramientas de conversion de SkillSafe: https://github.com/skillsafe-admin/skillsafe.ai-website/tree/main/models
- Nota sobre la busqueda web: los resultados devueltos por la busqueda no guardan ninguna relacion con este modelo. Todos tratan sobre gestion de temperatura terapeutica (TTM) tras parada cardiaca y soporte vital extracorporeo (ECPR). No se han encontrado papers, blogs ni demos adicionales sobre `realesrgan-x4plus-anime-6b` o sobre la conversion de SkillSafe.
