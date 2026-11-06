# Remidesbois/indra-ocr-poneglyph-bubble

## Resumen

Indra OCR Poneglyph Bubble es un ajuste fino (fine-tune) del modelo de OCR Indra OCR de Datalab, especializado en el reconocimiento de texto en bocadillos (speech bubbles) de manga, concretamente en la obra One Piece en frances. Lo publica Remidesbois como parte del proyecto Poneglyph, una aplicación web que procesa viñetas de manga directamente en el navegador. El modelo resuelve un problema muy acotado: extraer texto de bocadillos con alta precisión y latencia mínima, en un dominio donde los OCR genéricos fallan por tipografías estilizadas, ruido de tramado y composición irregular.

Técnicamente no es un transformer generativo, sino un pipeline de dos redes convolucionales exportadas a ONNX: un detector de líneas de 390 kB y un reconocedor CTC de 5,0 MB. La estructura es idéntica a la de Indra OCR; solo cambian los pesos, reentrenados sobre etiquetas del dominio de One Piece. El resultado es un modelo extremadamente ligero (unos 5,4 MB en total) que cabe en cualquier entorno, incluido el navegador mediante ONNX Runtime.

Su relevancia radica en la combinación de precisión y eficiencia: sobre 1.221 bocadillos de un conjunto de test a nivel de página alcanza un CER del 0,690 % y un 88,53 % de coincidencia exacta, frente al 0,902 % y 85,01 % de la pipeline de producción basada en YOLO + PP-OCRv6. La latencia mediana por bocadillo en CPU con 4 hilos es de 4,4 ms, frente a 157,7 ms de la alternativa. Está pensado para escenarios de OCR de manga en tiempo real y en cliente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Pipeline de dos redes convolucionales: detector de lineas (core/distance maps) + reconocedor CTC |
| Parametros totales | No disponible (pesos de 390 kB el detector y 5,0 MB el reconocedor) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No aplica (modelo de vision, no de lenguaje); procesa un bocadillo por pasada |
| Tipos de cuantizacion | No disponible (distribucion en ONNX; no se documentan variantes cuantizadas) |
| Idiomas soportados | Frances (fr) |
| Licencia | indra-ocr-openrail-m (OpenRAIL-M modificada, con restricciones de uso) |
| Formato de pesos | ONNX (`indra_det_bubble.onnx`, `indra_rec_bubble.onnx`) + `browser_manifest.json` |

## Arquitectura y entrenamiento

El modelo mantiene sin cambios la estructura de Indra OCR: un detector que recibe un mapa de tinta (1 - gris/255) del recorte del bocadillo, redimensionado a 0,75 veces su lado mayor y con padding a múltiplos de 32, y que produce mapas core y distance para decodificar cajas de línea. Las líneas se ordenan por bandas de media línea y luego por coordenada x. Cada línea se recorta con la función `crop_line` de Indra (ventana alta de factor 3 y altura 96) y las ventanas se concatenan para pasarlas al reconocedor, que aplica decodificación CTC greedy. Si no se detecta ninguna línea, el recorte completo se trata como una única línea. El postprocesado se rige por reglas declaradas en `browser_manifest.json`: léxico, espaciado de puntuación francesa y capitalización de frase.

El entrenamiento es un fine-tune sobre el checkpoint `v1.1.0` de Datalab, con etiquetas del dominio de One Piece y detección basada en pseudo-etiquetas de YOLO para las cajas de línea. La selección del modelo se hizo exclusivamente sobre validación. No se documentan en la información disponible el volumen de tokens, la composición exacta del dataset ni si hubo etapas de RLHF o DPO (no procede en un modelo de OCR). La innovación principal no es arquitectónica sino de despliegue: un pipeline de OCR completo reducido a 5,4 MB de pesos ONNX, ejecutable en el navegador con ONNX Runtime y con una latencia dos órdenes de magnitud inferior a la pipeline anterior.

## Capacidades

- Reconocimiento de texto (OCR) en bocadillos de manga en francés, con detección de líneas y reconocimiento en una sola pasada por bocadillo.
- Detección de líneas de texto dentro del recorte del bocadillo mediante mapas core y distance.
- Postprocesado lingüístico específico del francés: léxico, espaciado de puntuación y capitalización de frase.
- Inferencia en navegador mediante ONNX Runtime (implementación de referencia en `frontend/src/lib/indraOcr.js`).
- Inferencia en Python de referencia (`docker_scripts/eval_indra_ocr`).
- Ejecución en CPU con latencia muy baja (4,4 ms medianos por bocadillo con 4 hilos).
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, visión general, audio ni modo thinking: es un OCR especializado de dominio.

## Casos de uso

- Lectura de manga en el navegador: el modelo procesa cada bocadillo en el cliente con ONNX Runtime, sin enviar imágenes a un servidor, lo que permite traducir o superponer texto en tiempo real respetando la privacidad del usuario. Es el caso de uso original del proyecto Poneglyph.
- Traducción automática de manga: al extraer el texto francés de los bocadillos con un CER del 0,690 %, se puede alimentar un pipeline de traducción con una tasa de error lo bastante baja como para no degradar la calidad del texto traducido.
- Digitalización y archivado de colecciones: procesar tomos completos de One Piece en francés para generar transcripciones indexables, aprovechando la latencia de 4,4 ms por bocadillo para lotes grandes en CPU.
- Accesibilidad: generar subtítulos o descripciones de texto para lectores con discapacidad visual en aplicaciones de lectura de manga, ejecutando el modelo localmente en dispositivos de gama baja.
- Investigación en OCR de dominios específicos: servir como referencia de fine-tune ligero sobre Indra OCR para otros estilos de manga, idiomas o tipografías, con un protocolo de evaluación documentado y reproducible.
- Aplicaciones móviles o de escritorio offline: al ocupar 5,4 MB y ejecutarse en CPU, el modelo se puede empaquetar en apps sin conexión para reconocer bocadillos en escaneos o fotos de páginas.
- Control de calidad editorial: detectar discrepancias entre el texto impreso y el texto digitalizado en procesos de reedición, comparando la salida del modelo con la transcripción oficial.

## Benchmarks y rendimiento

Resultados sobre 1.221 bocadillos de un conjunto de test a nivel de página (holdout):

| Pipeline | CER | Coincidencia exacta |
|---|---:|---:|
| A: YOLO lines + PP-OCRv6 (producción) | 0,902 % | 85,01 % |
| C: Indra det (fine-tuned) + Indra rec (fine-tuned) — esta release | 0,690 % | 88,53 % |
| B: YOLO lines + Indra rec (fine-tuned) | 0,912 % | 87,80 % |
| C: Indra det (original) + Indra rec (fine-tuned) | 1,084 % | 85,83 % |

Esta release frente a producción: 277 frente a 362 errores de carácter, con una diferencia de CER de -0,212 puntos (intervalo de confianza del 95 % por bootstrap pareado a nivel de página: -0,414 a -0,005). La implementación en navegador (Poneglyph `frontend/src/lib/indraOcr.js`, ONNX Runtime) obtiene un CER del 0,693 % en el mismo test, con 1.219 de 1.221 textos idénticos a la referencia en Python. La latencia mediana por bocadillo en CPU con 4 hilos es de 4,4 ms, frente a 157,7 ms de YOLO + PP-OCRv6.

## Requisitos de hardware

- VRAM estimada: no aplica en la práctica; los pesos suman unos 5,4 MB y la inferencia está pensada para CPU.
- GPU recomendadas: no necesarias. Cualquier GPU moderna puede ejecutarlo, pero el diseño apunta a CPU y a navegador.
- Cabe en cualquier GPU de consumo e incluso en dispositivos sin GPU dedicada; también en entornos móviles y en el navegador.
- Opciones de despliegue: ONNX Runtime (navegador y Python), con implementaciones de referencia en `frontend/src/lib/indraOcr.js` y `docker_scripts/eval_indra_ocr`. No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: 4,4 ms medianos por bocadillo en CPU con 4 hilos (referencia Python); 0,693 % de CER en la implementación de navegador.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros / tamano | Contexto | CER (test del autor) | Licencia | Disponibilidad |
|---|---|---|---:|---:|---|---|
| Indra OCR Poneglyph Bubble | Detector + CTC ONNX | ~5,4 MB | No aplica | 0,690 % | indra-ocr-openrail-m | Hugging Face |
| YOLO lines + PP-OCRv6 | Detector + OCR | No disponible | No aplica | 0,902 % | No disponible | Pipeline de producción de Poneglyph |
| Indra OCR original (datalab-to/indra-ocr) | Detector + CTC | No disponible | No aplica | 1,084 % (con rec fine-tuned) | indra-ocr-openrail-m | Hugging Face |

La comparativa se limita a las alternativas evaluadas por el autor en el mismo conjunto de test; no se dispone de datos de otros OCR de manga comparables en la información proporcionada.

## Limitaciones y advertencias

- El benchmark no es ciego: las páginas de test se inspeccionaron en auditorías anteriores y la selección se hizo solo sobre validación.
- Las etiquetas del detector son pseudo-etiquetas generadas por YOLO, no anotaciones humanas verificadas.
- Los textos cortos (efectos de sonido, puntuación aislada) siguen siendo más débiles que PP-OCRv6.
- El modelo está entrenado exclusivamente para francés y para el dominio de One Piece; el rendimiento fuera de ese dominio o idioma no está documentado y probablemente se degrade.
- Es un OCR, no un modelo generativo: no razona, no responde preguntas ni sigue instrucciones.
- La licencia indra-ocr-openrail-m es una OpenRAIL-M modificada con restricciones de uso; es obligatorio revisar `LICENSE` antes de cualquier uso comercial o redistribución.
- Riesgo de alucinación bajo en el sentido generativo, pero el decodificador CTC puede producir caracteres espurios en recortes ruidosos o con tramado.
- El postprocesado depende de reglas del manifiesto (léxico y puntuación francesa); cambios en esas reglas alteran la salida.
- El repositorio figura con 0 descargas y 0 likes en el momento de la consulta, lo que indica escasa validación externa por parte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Remidesbois/indra-ocr-poneglyph-bubble
- Modelo base Indra OCR: https://huggingface.co/datalab-to/indra-ocr
- Proyecto Poneglyph: https://poneglyph.fr
- Datalab: https://www.datalab.to
- Métricas de evaluación: `metrics/evaluation_20261105.json` (en el repositorio del modelo)
- Implementación de referencia en navegador: `frontend/src/lib/indraOcr.js` (repositorio de Poneglyph)
- Implementación de referencia en Python: `docker_scripts/eval_indra_ocr` (repositorio de Poneglyph)
