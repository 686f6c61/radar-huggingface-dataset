# Qarvexium/QOCR

## Resumen

QOCR-Tiny v1 es un modelo de reconocimiento de texto en imagenes (OCR) desarrollado por Qarvexium, una organizacion que publica modelos open source. Se trata de un modelo compacto construido desde cero, sin pesos preentrenados, que combina una red convolucional (CNN) con una capa recurrente BiGRU y una funcion de perdida CTC para la transcripcion de texto. El modelo esta disenado para ser ligero y rapido, orientado a tareas de reconocimiento de texto en imagenes donde se requiere un despliegue eficiente.

El modelo se publica bajo licencia MIT y esta pensado para el idioma ingles. Su relevancia radica en ofrecer una alternativa sencilla y de codigo abierto para tareas de OCR, aunque con limitaciones importantes: no incluye deteccion de texto (el usuario debe proporcionar la region de la imagen donde se encuentra el texto) y utiliza decodificacion CTC greedy sin beam search ni rescoring con modelo de lenguaje. El repositorio tiene un tamano de 0.0 GB y no registra descargas ni likes en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | CNN + BiGRU + CTC |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en (ingles) |
| Licencia | MIT |
| Formato de pesos | no disponible (repositorio de 0.0 GB) |

## Arquitectura y entrenamiento

El modelo QOCR-Tiny v1 emplea una arquitectura hibrida que combina una red neuronal convolucional (CNN) para la extraccion de caracteristicas visuales de la imagen, seguida de una capa recurrente bidireccional BiGRU (Bidirectional Gated Recurrent Unit) para modelar las dependencias secuenciales del texto, y finalmente una funcion de perdida CTC (Connectionist Temporal Classification) para la alineacion entre la secuencia de caracteres y la salida de la red. Esta combinacion es clasica en sistemas de reconocimiento de texto basados en imagenes.

El modelo fue construido desde cero, sin utilizar pesos preentrenados, segun indica el autor. No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset utilizado ni si se aplicaron tecnicas de alineacion como RLHF o DPO. Tampoco se documentan innovaciones tecnicas destacables mas alla de la propia arquitectura CNN + BiGRU + CTC.

## Capacidades

- Reconocimiento de texto en imagenes: el modelo transcribe texto presente en una imagen proporcionada como entrada.
- Procesamiento de imagenes a texto: el pipeline declarado es image-to-text, por lo que acepta imagenes y devuelve el texto reconocido.
- Inferencia por linea de comandos: se incluye un script `inference.py` que permite ejecutar el modelo desde terminal.
- Integracion en Python: se ofrecen funciones de alto nivel (`ocr_file` y `ocr`) para usar el modelo directamente con rutas de archivo o imagenes PIL.
- Ligereza: al ser un modelo compacto, esta orientado a entornos con recursos limitados.
- No incluye deteccion de texto: el modelo solo transcribe la region de imagen que se le proporciona; no localiza texto dentro de una imagen mayor.
- Decodificacion CTC greedy: la salida se genera mediante decodificacion greedy, sin beam search ni rescoring con modelo de lenguaje.

## Casos de uso

- Digitalizacion de documentos escaneados: el modelo puede transcribir texto de imagenes de documentos, aunque requiere que el usuario recorte previamente la region de interes, ya que no realiza deteccion automatica de texto.
- Extraccion de texto de capturas de pantalla: para automatizar la lectura de texto en imagenes de pantalla, el modelo puede integrarse en scripts de Python que procesen capturas y extraigan el contenido textual.
- Procesamiento de tarjetas de visita: al proporcionar una imagen recortada de una tarjeta, el modelo puede extraer nombres, telefonos o direcciones, aunque la precision dependera de la calidad de la imagen y la claridad tipografica.
- Automatizacion de formularios en papel: en flujos de trabajo donde los formularios escaneados se recortan por campos, el modelo puede transcribir cada campo individualmente para su posterior procesamiento.
- Etiquetado de imagenes con texto: para generar metadatos a partir de imagenes que contienen texto (por ejemplo, senales, carteles o etiquetas de productos), el modelo puede extraer el texto visible en la region recortada.
- Prototipado rapido de pipelines OCR: gracias a su simplicidad y licencia MIT, el modelo es adecuado para crear prototipos de sistemas de reconocimiento de texto sin necesidad de infraestructura compleja, aunque para produccion seria recomendable evaluar alternativas con deteccion de texto integrada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No se dispone de datos sobre precision, velocidad o comparativas con otros modelos OCR en el momento de la consulta.

## Requisitos de hardware

- Al ser un modelo ligero (CNN + BiGRU), es probable que pueda ejecutarse en CPU sin necesidad de GPU, aunque no se especifican requisitos minimos.
- No se dispone de informacion sobre VRAM estimada, ya que el tamano del repositorio es de 0.0 GB y no se indican los parametros totales del modelo.
- No se documentan GPUs recomendadas ni opciones de despliegue especificas como vLLM, llama.cpp u Ollama.
- El script de inferencia proporcionado sugiere un uso local sencillo, probablemente con PyTorch como dependencia principal.

## Comparativa con modelos similares

No se dispone de informacion suficiente para establecer una comparativa con modelos similares. El autor no publica datos de rendimiento ni se identifican modelos comparables en la informacion proporcionada. Se puede indicar que, por su arquitectura y tamano, podria situarse en la categoria de modelos OCR ligeros, pero sin datos concretos no es posible realizar una comparacion rigurosa.

## Limitaciones y advertencias

- No incluye deteccion de texto: el modelo no localiza texto dentro de una imagen; el usuario debe proporcionar la region exacta a transcribir, lo que limita su uso en imagenes complejas o con multiples bloques de texto.
- Decodificacion CTC greedy: al no emplear beam search ni rescoring con modelo de lenguaje, la precision puede ser inferior a la de sistemas que incorporan estas tecnicas, especialmente en textos largos o con vocabulario ambiguo.
- Idioma limitado: el modelo solo soporta ingles, por lo que no es adecuado para textos en otros idiomas.
- Sin datos de entrenamiento publicados: no se documenta el dataset utilizado, lo que dificulta evaluar su robustez ante diferentes tipografias, idiomas o condiciones de imagen.
- Riesgo de alucinacion: como cualquier modelo de reconocimiento de texto, puede producir caracteres incorrectos o inventar texto cuando la imagen es de baja calidad o el texto es ilegible.
- Uso en produccion: al ser un modelo sin deteccion de texto y con decodificacion greedy, no se recomienda para pipelines de produccion sin una evaluacion previa exhaustiva y posiblemente sin integracion con un sistema de deteccion de texto adicional.
- Licencia MIT: permite uso comercial y modificacion, pero el autor no ofrece garantias ni soporte.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Qarvexium/QOCR
- Perfil del autor en HuggingFace: https://huggingface.co/Qarvexium
- Repositorio de QED-Base-v2 (otro modelo del autor): https://huggingface.co/Qarvexium/QED-Base-v2
- Repositorio de QED-B1-Instruction-v1 (otro modelo del autor): https://huggingface.co/Qarvexium/QED-B1-Instruction-v1
