# elnemer7/ElNeMeR-Screenshot-Chat-Fabrication-ONNX

## Resumen
ElNeMeR-Screenshot-Chat-Fabrication-ONNX es un modelo ONNX publicado por el usuario elnemer7 (Eng. Mahmoud ElNemer, ElNeMeR Digital Solutions & AI) orientado a la deteccion forense de capturas de pantalla de chats falsificadas, tipicamente generadas con aplicaciones de "fake chat" o mediante edicion del DOM. El modelo forma parte de una flota declarada de 35 modelos forenses y humanitarios del mismo autor, y se distribuye con licencia MIT bajo la etiqueta `humanitarian-ai` y `digital-forensics`.

A diferencia de un LLM generativo, este artefacto es un clasificador tabular: recibe un tensor `float32` de forma `[batch_size, 20]` denominado `chat_img_features` y devuelve tres probabilidades correspondientes a captura genuina del sistema operativo, captura generada por aplicacion de chat falsa y burbuja de mensaje empalmada (spliced). La inspeccion se basa, segun la model card, en geometria de las burbujas, renderizado subpixel de fuentes y costuras detectadas mediante ELA (Error Level Analysis).

El modelo es relevante en el nicho de analisis forense digital aplicado a difamacion, extorsion y acusaciones falsas, donde la verificacion de capturas de WhatsApp o Messenger es una necesidad practica. Sin embargo, la informacion publica es muy limitada: el repositorio ocupa 0.0 GB, no tiene descargas ni likes, no declara pipeline ni idiomas, y las unicas metricas reportadas son una "calibracion" del 100 % sin detalle de conjunto de evaluacion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (clasificador ONNX; la model card no detalla la topologia interna) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (entrada tabular fija de 20 caracteristicas) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (la tarea es de analisis de imagen, no linguistica) |
| Licencia | MIT |
| Formato de pesos | ONNX (opset 14) |

## Arquitectura y entrenamiento
La model card no describe la arquitectura interna del modelo. Lo unico verificable es la interfaz: un grafo ONNX en opset 14 compatible con `onnxruntime` y `onnxruntime-web` (WASM), con un unico tensor de entrada llamado `chat_img_features` de tipo `float32` y forma `[batch_size, 20]`, y una salida de tres clases (`genuine_os_screenshot`, `fake_chat_generator_app`, `spliced_message_bubble`). Esto implica que el modelo no procesa la imagen directamente, sino un vector de 20 caracteristicas extraido previamente por un pipeline externo no incluido en el repositorio.

No se especifican datos de entrenamiento, numero de muestras, composicion del dataset, ni si hubo ajuste fino, aumento de datos o validacion cruzada. Tampoco se detalla ninguna innovacion tecnica mas alla del uso de senales forenses clasicas (geometria de burbujas, renderizado subpixel de fuentes y costuras ELA) como base de las caracteristicas de entrada. La unica cifra de rendimiento declarada es una "calibracion" del 100.00 %, sin definicion del conjunto de evaluacion ni del protocolo de medida.

## Capacidades
- Clasificacion de capturas de chat en tres categorias: genuina del sistema operativo, generada por aplicacion de chat falsa y burbuja empalmada.
- Deteccion de artefactos de falsificacion basados en geometria de burbujas, renderizado subpixel de fuentes y costuras ELA.
- Inferencia en navegador mediante `onnxruntime-web` (WASM) y en servidor mediante `onnxruntime`.
- Procesamiento por lotes (`batch_size` configurable) sobre vectores de 20 caracteristicas.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no aplica (no procesa texto ni lenguaje natural).
- Capacidades especiales: modo "thinking", vision o audio no disponibles; la vision es indirecta, a traves de caracteristicas preextraidas.

## Casos de uso
- Verificacion de pruebas en procesos de difamacion: dado un conjunto de capturas de WhatsApp o Messenger aportadas como evidencia, el clasificador permite priorizar cuales presentan indicios de fabricacion antes de un analisis pericial manual mas profundo.
- Defensa frente a extorsion y sextorsion: un usuario que recibe capturas amenazantes puede ejecutar el modelo en local o en navegador para obtener una probabilidad de fabricacion y decidir si denunciar o solicitar peritaje.
- Moderacion de contenido en plataformas sociales: integrado en un pipeline de subida de imagenes, permite marcar capturas de chat potencialmente fabricadas que se difunden como prueba de acusaciones.
- Periodismo de verificacion: redacciones que reciben capturas virales pueden usar el modelo como primer filtro dentro de una rutina de fact-checking, antes de la verificacion con fuentes primarias.
- Aplicacion web de analisis forense: al ser compatible con `onnxruntime-web` y pesar practicamente nada (0.0 GB declarados en el repo), puede desplegarse como demo cliente-side en la plataforma del autor sin enviar la imagen a un servidor.
- Formacion y docencia en forense digital: util como ejemplo didactico de clasificacion de artefactos forenses y de deteccion de manipulaciones en capturas, por su interfaz simple y su licencia permisiva.
- Investigacion sobre deteccion de imagenes sinteticas: sirve como linea base reproducible en estudios comparativos de deteccion de capturas falsas, aunque su escasa documentacion limita la reproducibilidad.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la informacion disponible. La unica metrica declarada es una "calibracion" del 100.00 %, sin definicion del conjunto de evaluacion, tamano de muestra ni protocolo, por lo que no puede considerarse un benchmark comparable.

## Requisitos de hardware
- VRAM estimada para inferencia: no disponible; el repositorio ocupa 0.0 GB y la entrada es un vector de 20 `float32`, por lo que el coste de memoria es despreciable.
- GPU recomendadas: no se especifican; el modelo puede ejecutarse en CPU sin problema.
- Cabe en cualquier GPU consumer (RTX 3060, RTX 4090, etc.) e incluso en dispositivos de gama baja; tambien en navegador via WASM.
- Opciones de despliegue: `onnxruntime` (Python, C++, C#), `onnxruntime-web` (WASM en navegador), integracion en servicios HTTP propios.
- Latencia y throughput estimados: no disponibles; por la naturaleza del modelo (clasificador tabular de 20 caracteristicas) se espera latencia de microsegundos a milisegundos, pero no hay datos publicados.

## Comparativa con modelos similares
No disponible. No se han identificado en la informacion proporcionada modelos comparables de la misma categoria (deteccion forense de capturas de chat falsas) con parametros, contexto y benchmarks publicados. Las alternativas habituales en forense de imagen (clasificadores CNN de deteccion de manipulacion, modelos de deteccion de imagenes generadas) no son directamente equiparables porque operan sobre la imagen completa y no sobre un vector de caracteristicas preextraido.

## Limitaciones y advertencias
- Documentacion muy escasa: no se detalla la arquitectura, el dataset de entrenamiento, el protocolo de evaluacion ni el significado exacto de las 20 caracteristicas de entrada.
- La "calibracion" del 100 % no es verificable y no debe interpretarse como precision en produccion; no hay conjunto de validacion ni matriz de confusion publicados.
- Depende de un extractor de caracteristicas externo no incluido en el repositorio; sin ese pipeline, el modelo no es utilizable de extremo a extremo.
- Riesgo de falsos positivos y negativos en capturas con temas personalizados, modos oscuros, escalado de pantalla, compresion adicional o reenvios multiples; no se documenta robustez frente a estas variaciones.
- No procesa texto ni lenguaje natural: no puede analizar el contenido de los mensajes, solo artefactos visuales.
- Sesgos conocidos: no disponibles; al no publicarse el dataset, no es posible evaluar sesgos por dispositivo, sistema operativo o aplicacion de mensajeria.
- Licencia MIT permite uso comercial, pero el autor no ofrece garantias ni soporte; el uso en contextos periciales o judiciales exige validacion independiente y supervision de un experto.
- El repositorio no tiene descargas ni likes y fue creado en 2026, lo que sugiere ausencia de validacion por parte de la comunidad.
- Las afirmaciones de la model card sobre una "flota de 35 modelos" y un sello de verificacion del autor no constituyen evidencia tecnica independiente.

## Enlaces
- Hugging Face: https://huggingface.co/elnemer7/ElNeMeR-Screenshot-Chat-Fabrication-ONNX
- Plataforma forense del autor: https://detector.elnemer-ai.com
- Portal corporativo del autor: https://elnemer-ai.com
