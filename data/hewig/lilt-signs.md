# hewig/lilt-signs

## Resumen

Lilt's music-sign detector (identificador `hewig/lilt-signs`) es un modelo de detección de objetos especializado en reconocimiento óptico de partituras musicales (optical music recognition, OMR). Lo desarrolla el autor hewig para Lilt, un laboratorio de música para niños dentro de Zoey's Lab, y su función concreta es localizar sobre una página de partitura impresa hasta 115 tipos de signos musicales: cabezas de nota, plicas, barras, corchetes, silencios, claves, armaduras, compases, alteraciones, puntillos, ligaduras, articulaciones, dinámicas, reguladores, ornamentos, calderones, segno y coda, marcas de pedal, arcadas, tresillos, digitaciones y corchetes de octava.

A diferencia de los modelos de lenguaje multimodales, no se trata de un transformer generativo sino de un detector FCOS con una feature pyramid sobre ResNet-18 (torchvision), con 13,2 M de parámetros y una ventana de entrada fija de 1024 píxeles de ancho. Se distribuye como grafo ONNX (`signs.onnx`) y se ejecuta en el navegador mediante onnxruntime, de modo que la foto de la partitura se procesa en el dispositivo del usuario y nunca se sube a un servidor.

Su relevancia es acotada pero clara: cubre una tarea de nicho (detección de simbología musical) con un modelo pequeño, ligero y desplegable en cliente, entrenado sobre el subconjunto denso de DeepScoresV2. No es un modelo de propósito general ni compite con los LLM; compite con pipelines de OMR clásicos y con detectores genéricos reentrenados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | FCOS con feature pyramid sobre ResNet-18 (torchvision), niveles p2–p6 con strides 4, 8, 16, 32 y 64 |
| Parametros totales | 13,2 M |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica; entrada de imagen de 1024 px de ancho y altura variable (padded a múltiplo de 64) |
| Tipos de cuantizacion | pesos convolucionales en int8 con una escala por canal de salida, dequantizados a float32 en carga; aritmética en float32 |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | CC BY 4.0 |
| Formato de pesos | ONNX (`signs.onnx`), ejecutable con onnxruntime |

## Arquitectura y entrenamiento

El modelo es un detector FCOS de una etapa construido sobre un backbone ResNet-18 con feature pyramid, implementado con torchvision. La pirámide cubre strides de 4 a 64 (niveles p2 a p6) con tamaños de caja asociados de 8 a 128 píxeles, lo que permite detectar tanto signos grandes (claves, reguladores) como pequeños (puntillos, articulaciones). La cabeza produce, por nivel, logits de clase (`cls_*`, 116 canales donde el índice 0 es fondo y el índice i+1 corresponde a la clase i de `classes.json`), distancias de caja (`reg_*`, 4 canales en unidades del tamaño del nivel) y centerness (`ctr_*`, 1 canal). La decodificación replica el post-procesado de FCOS de torchvision: puntuación `sqrt(sigmoid(cls) * sigmoid(ctr))` con umbral 0,25, hasta 4000 candidatos por nivel y NMS por clase con IoU 0,5.

El entrenamiento parte de pesos de ImageNet y se ejecuta durante 30 épocas sobre recortes de 640 px de páginas escaladas a 1024 px de ancho, con un endurecimiento sintético que imita fotos de móvil. El conjunto de datos es el subconjunto denso de DeepScoresV2 (Tuggener, Satyawan, Pacha, Schmidhuber y Stadelmann, ICPR 2020, publicado en Zenodo bajo CC BY 4.0). No se documenta en la model card el uso de RLHF, DPO ni técnicas de alineación, algo esperable en un detector y no en un modelo generativo. La innovación destacable es la cuantización int8 por canal de las convoluciones con dequantización en carga, que según el autor no supone coste medible frente a pesos float16 y facilita la ejecución en navegador.

## Capacidades

- Detección de objetos sobre imágenes de partituras impresas: 115 clases de signos musicales en una sola pasada.
- Salida estructurada por nivel piramidal: logits de clase, distancias de caja y centerness, lista para el post-procesado estándar de FCOS.
- Ejecución en navegador mediante onnxruntime, con procesamiento local de la imagen.
- Entrada en escala de grises replicada a tres canales, normalizada al rango [-1, 1], con padding blanco hasta múltiplo de 64 en altura.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni generación de texto: es exclusivamente un detector visual.
- No tiene capacidades multilingües ni modos de pensamiento, visión general o audio.

## Casos de uso

- Digitalización de partituras en el navegador: Lilt integra el modelo para leer una foto de partitura en el dispositivo del usuario sin subirla a ningún servidor, lo que es adecuado por privacidad y por latencia en cliente.
- Aplicaciones educativas musicales: identificación de signos para ejercicios interactivos dirigidos a niños, aprovechando que el modelo cubre dinámicas, articulaciones, digitaciones y ornamentos con alta tasa de acierto.
- Preprocesado para pipelines de OMR: usar las cajas detectadas como etapa de localización antes de un reconocedor de símbolos o de un motor de transcripción a MusicXML.
- Indexación y búsqueda de archivos de partituras: extraer la distribución de signos (compases, tonalidades, dinámicas) para clasificar o buscar páginas en una biblioteca digital.
- Anotación asistida de corpus musicales: generar preanotaciones que un humano revise, reduciendo el coste de etiquetado de nuevas partituras.
- Herramientas de accesibilidad: localizar y describir signos en una partitura para lectores con discapacidad visual, siempre que se combine con una capa de descripción adicional.
- Control de calidad de edición musical: detectar signos faltantes o mal colocados comparando la salida del detector con la fuente esperada.

## Benchmarks y rendimiento

| Metrica | Valor | Condiciones |
|---|---|---|
| Recall | 0,81 | 20 páginas completas de DeepScoresV2 reservadas, IoU 0,5 |
| Precision | 0,91 | 20 páginas completas de DeepScoresV2 reservadas, IoU 0,5 |
| Alteraciones, armaduras, claves, calderones, ornamentos, dinámicas, reguladores, tresillos, segno y coda | 95–100 % de detección | Recortes de test |
| Plicas | 55 % | Recortes de test |
| Líneas adicionales | 56 % | Recortes de test |
| Puntillos de aumentación | 66 % | Recortes de test |
| Puntillos de staccato | débiles (sin cifra publicada) | Recortes de test |
| Corchetes de octava | 1 de cada 9 | Recortes de test |

No se han publicado resultados de benchmarks en la información disponible más allá de estas métricas de detección del propio autor.

## Requisitos de hardware

- VRAM estimada para inferencia: muy baja; con 13,2 M de parámetros y pesos int8, el grafo ocupa del orden de decenas de MB, por lo que cabe holgadamente en cualquier GPU consumer e incluso en CPU.
- GPU recomendadas: no requiere GPU dedicada; funciona en CPU y en el navegador. En servidor, cualquier GPU moderna (RTX 4090, A100, H100) es sobredimensionada para este modelo.
- Cabe en GPU consumer: sí, en todas las gamas actuales, y también en dispositivos móviles vía onnxruntime.
- Opciones de despliegue: onnxruntime (navegador y servidor), con el grafo `signs.onnx`; no se documentan exportaciones a GGUF, vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto / entrada | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| hewig/lilt-signs | Detector FCOS + ResNet-18 | 13,2 M | Imagen de 1024 px de ancho | CC BY 4.0 | ONNX en Hugging Face |
| Detectores OMR sobre DeepScoresV2 (benchmark ICPR 2020) | Detectores genéricos reentrenados | no disponible | no disponible | según implementación | referencia académica |
| LiLT (multimodal) | Modelo multimodal de documentos | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos cuantitativos de rendimiento de las alternativas en la información proporcionada, por lo que la comparación se limita a tipo, tamaño y licencia.

## Limitaciones y advertencias

- Punto débil en signos finos y pequeños: plicas (55 %), líneas adicionales (56 %), puntillos de aumentación (66 %), puntillos de staccato y corchetes de octava (1 de cada 9).
- Entrenado solo con grabado limpio endurecido sintéticamente; las fotos reales de móvil no se han evaluado, por lo que el rendimiento en producción con capturas reales es incierto.
- Riesgo de falsos negativos en signos de pequeño tamaño y de falsos positivos en zonas densas; el umbral de 0,25 y el NMS por clase a IoU 0,5 condicionan el equilibrio precision/recall.
- No es un modelo de lenguaje: no genera texto, no razona, no soporta agentes ni tool calling, y no debe presentarse como tal.
- La licencia CC BY 4.0 permite uso comercial con atribución; es obligatorio citar al autor del modelo y el dataset DeepScoresV2 (Tuggener et al., ICPR 2020).
- La model card no documenta sesgos específicos ni evaluación fuera del dominio de DeepScoresV2; cualquier uso con otros estilos de grabado, manuscritos o notación no occidental queda sin validar.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, lo que indica ausencia de validación comunitaria.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/hewig/lilt-signs
- Lilt en Zoey's Lab: https://zoeyslab.com/music/
- Zoey's Lab: https://zoeyslab.com/
- Dataset DeepScoresV2 en Zenodo: https://zenodo.org/records/4012193
- Artículo de referencia (Medium, no relacionado con este modelo): https://medium.com/@sakshi99tantak/lilt-a-cute-multimodal-model-that-might-not-make-you-cry-in-gpu-hours-f8111acc318f
