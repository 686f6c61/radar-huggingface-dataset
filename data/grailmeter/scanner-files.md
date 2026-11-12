# Grailmeter/scanner-files

## Resumen

Grailmeter/scanner-files es un repositorio de artefactos (no un modelo entrenado de forma nativa) publicado por Grailmeter para alimentar el escáner de cartas basado en navegador de grailmeter.com. El paquete combina un modelo de vision DINOv2-small de Meta (licencia Apache 2.0), los modelos de reconocimiento de texto PP-OCR de PaddlePaddle (tambien Apache 2.0) y una biblioteca propia de imagenes de cartas y fichas de datos de cartas del autor. El repositorio se sirve desde un commit fijo, de modo que el sitio web siempre carga exactamente la misma version de los artefactos.

El interes practico no esta en un LLM conversacional, sino en un caso de despliegue edge: un pipeline de vision por computador que corre en el dispositivo del usuario (navegador o telefono) para identificar cartas y extraer texto de las mismas. El formato principal es ONNX, lo que permite inferencia en runtime web (ONNX Runtime Web / WebGPU) sin depender de un backend GPU en servidor. El tamano total del repositorio es de aproximadamente 0,1 GB, coherente con un modelo DINOv2-small (unos 22 millones de parametros en su variante ViT-S/14) mas los modelos ligeros de OCR.

La relevancia actual radica en que ejemplifica el patron de empaquetar modelos open source de terceros junto con datos propios en un unico repositorio versionado por commit, simplificando la reproducibilidad y el cacheo en CDN. No se dispone de informacion sobre benchmarks, pipeline declarado ni idiomas soportados en la metadata de Hugging Face.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision transformer (DINOv2-small) + modelos OCR PP-OCR (CNN/transformer segun componente) |
| Parametros totales | no disponible (DINOv2-small: ~22 M; PP-OCR: no disponible) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de vision y OCR) |
| Tipos de cuantizacion | no disponible (los pesos se distribuyen en ONNX; cuantizacion no declarada) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX |

## Arquitectura y entrenamiento

El repositorio agrupa tres tipos de artefactos. En primer lugar, DINOv2-small, un vision transformer auto-supervisado de Meta que produce embeddings de imagen de proposito general; en este caso se emplea presumiblemente para el reconocimiento o matching de cartas a partir de la imagen capturada. En segundo lugar, los modelos PP-OCR de PaddlePaddle, orientados a deteccion y reconocimiento de texto, que permiten leer campos impresos en la carta (nombre, numeracion, texto de reglas). En tercer lugar, datos propios de Grailmeter: una biblioteca de imagenes de cartas y una base de hechos sobre cartas.

No se dispone de informacion sobre el proceso de entrenamiento o ajuste fino de estos componentes, el volumen de datos utilizado ni si hubo destilacion o adaptacion especifica al dominio de cartas. Tampoco se documenta en la model card ninguna innovacion tecnica mas alla del empaquetado y el versionado por commit fijo para garantizar estabilidad de los artefactos servidos.

## Capacidades

- Extraccion de embeddings de imagen mediante DINOv2-small, util para similitud visual y recuperacion de cartas.
- Reconocimiento optico de caracteres (OCR) sobre imagenes de cartas mediante PP-OCR.
- Inferencia en el dispositivo en formato ONNX, compatible con runtimes web y moviles.
- Empaquetado reproducible: el sitio carga los artefactos desde un commit fijo del repositorio.
- No se documentan capacidades de generacion de texto, razonamiento, codigo, tool calling, agentes ni multilingues.
- No se documentan modos especiales (thinking, audio, video).

## Casos de uso

- Escaneo de cartas en navegador: el pipeline DINOv2 + PP-OCR permite capturar una carta con la camara del telefono, generar su embedding y leer el texto impreso para identificarla contra la biblioteca de imagenes incluida.
- Identificacion visual de cartas: el embedding de DINOv2-small sirve para comparar la imagen capturada con la biblioteca de cartas del repositorio y devolver la coincidencia mas cercana.
- Extraccion de campos de texto: PP-OCR lee nombre, numero de coleccion y texto de reglas de la carta, alimentando la base de hechos incluida en el paquete.
- Catalogo offline en el dispositivo: al servirse desde un commit fijo, la aplicacion puede cachear los artefactos y funcionar con latencia baja sin consultas a servidor.
- Reproducibilidad en produccion: al fijar el commit, se evita que una actualizacion del repositorio rompa el escaner desplegado.
- Base para herramientas de coleccionismo: la combinacion de imagenes y hechos de cartas permite construir funciones de inventario, tasacion orientativa o busqueda por similitud visual.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible con precision; DINOv2-small (~22 M de parametros) es muy ligero y los modelos PP-OCR tambien son de baja huella, por lo que la inferencia cabe holgadamente en memoria de dispositivo movil.
- GPU recomendadas: no aplica un requisito de datacenter; el diseno apunta a inferencia en dispositivo (CPU/GPU integrada del telefono o WebGPU del navegador).
- Cabe en GPU de consumo: si; en la practica se ejecuta en el propio dispositivo del usuario.
- Opciones de despliegue: ONNX Runtime (incluido ONNX Runtime Web), con posibles conversiones a otros runtimes ONNX-compatibles; no se documentan vLLM, llama.cpp, Ollama ni TGI por tratarse de vision/OCR y no de un LLM.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Formato |
|---|---|---|---|---|---|
| Grailmeter/scanner-files | Paquete vision + OCR (DINOv2-small + PP-OCR) | ~22 M (DINOv2-small) + OCR no disponible | no aplica | Apache 2.0 | ONNX |
| DINOv2-small (Meta) | Vision transformer | ~22 M | no aplica | Apache 2.0 | safetensors / ONNX |
| PP-OCR (PaddlePaddle) | Deteccion + reconocimiento de texto | no disponible | no aplica | Apache 2.0 | Paddle / ONNX |

No se dispone de datos de rendimiento comparativo en la informacion proporcionada.

## Limitaciones y advertencias

- No es un modelo de lenguaje: no genera texto ni mantiene conversaciones; su uso esta acotado a vision y OCR.
- La metadata de Hugging Face no declara pipeline ni idiomas soportados, lo que limita la evaluacion previa a su uso.
- El rendimiento real del OCR depende de la calidad de imagen, iluminacion y resolucion de captura; no se documentan metricas de precision.
- El repositorio incluye datos propios de Grailmeter (biblioteca de imagenes y hechos de cartas) cuya calidad y cobertura no se detallan.
- Ausencia de benchmarks publicados impide validar su precision frente a alternativas.
- Licencia Apache 2.0 permite uso comercial, pero conviene verificar la procedencia y los terminos de los datos propios incluidos, que la model card no desglosa.
- El fijado a un commit concreto implica que las actualizaciones del repositorio no llegan automaticamente al sitio; hay que gestionar explicitamente la actualizacion.

## Enlaces

- Hugging Face: https://huggingface.co/Grailmeter/scanner-files
- Sitio del autor: https://grailmeter.com
- DINOv2 (Meta): https://github.com/facebookresearch/dinov2
- PP-OCR (PaddlePaddle): https://github.com/PaddlePaddle/PaddleOCR
- ONNX Runtime Web: https://onnxruntime.ai/docs/tutorials/web/
