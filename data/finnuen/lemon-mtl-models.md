# finnuen/lemon-mtl-models

## Resumen
Lemon MTL models es un repositorio de pesos convertidos a TFLite para la aplicación Android Lemon MTL, una herramienta de traducción de manga. Lo publica el desarrollador finnuen y no contiene un modelo de lenguaje generativo, sino tres artefactos de visión y OCR que la app descarga bajo demanda en el primer uso: detección de layout (texto, bocadillos y viñetas), codificador OCR y decodificador de texto OCR. El objetivo es reducir el tamaño del APK de unos 900 MB a aproximadamente 160 MB, delegando los pesos pesados al repositorio.

Los tres ficheros son conversiones directas de checkpoints ya existentes: `layout.tflite` deriva de `mayocream/koharu-layout-highres` (RF-DETR Seg 2XL a 528 px) y los dos de OCR provienen de los pesos de Hayai OCR. El repositorio incluye además un `manifest.json` con tamaños y SHA-256 que la app verifica antes de aceptar cada descarga. La licencia es Apache-2.0 y el tamaño total del repo es de 0,7 GB.

Es relevante para quien construya pipelines de traducción de cómics o manga en dispositivos móviles, o para quien quiera reutilizar detectores de layout y OCR ligeros en formato TFLite. No es un modelo de propósito general: no genera texto libre, no razona y no soporta tool calling.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Tres modelos independientes en TFLite: detector de layout RF-DETR Seg 2XL (528 px) y OCR en dos partes (codificador visual + decodificador de texto) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (no es un modelo de contexto textual) |
| Tipos de cuantizacion | no disponible; se distribuyen ficheros TFLite ya convertidos |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | TFLite (`layout.tflite`, `ocr_encoder.tflite`, `ocr_textdecoder.tflite`) mas `manifest.json` |

Desglose de ficheros:

| Fichero | Tamano | Funcion |
|---|---|---|
| `layout.tflite` | 131,0 MiB | Deteccion de texto, bocadillos y paneles (RF-DETR Seg 2XL a 528 px) |
| `ocr_encoder.tflite` | 327,6 MiB | Codificador OCR (Hayai OCR, mitad visual) |
| `ocr_textdecoder.tflite` | 249,6 MiB | Decodificador de texto OCR (Hayai OCR, mitad de tokens) |

## Arquitectura y entrenamiento
El repositorio no entrena modelos nuevos: publica conversiones a TFLite de checkpoints existentes, realizadas con las mismas notas de conversión que el proyecto de escritorio Lemon MTL. El componente de layout es un RF-DETR en variante Seg 2XL que opera a 528 px y produce segmentación de texto, bocadillos y paneles. El componente OCR está dividido en dos redes: un codificador visual y un decodificador de texto, correspondientes a los pesos de Hayai OCR.

No se documentan en la información disponible el número de tokens de entrenamiento, la composición del dataset, ni si hubo ajuste por RLHF o DPO, ya que se trata de modelos de visión y OCR y no de un LLM. La innovación práctica del repo es operativa: empaquetar los pesos fuera del APK, descargarlos bajo demanda y validar integridad mediante tamaño y SHA-256 contra un manifiesto incluido en la aplicación.

## Capacidades
- Detección de layout de página de manga: localización de texto, bocadillos y paneles mediante segmentación.
- OCR sobre recortes de texto: codificación visual y decodificación de tokens a texto.
- Ejecución en dispositivo mediante TFLite, orientada a Android.
- Verificación de integridad de los pesos descargados mediante SHA-256 y comprobación de tamaño.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- No hay información sobre capacidades multilingües del OCR.
- No incluye modo thinking, visión general, audio ni generación de texto libre.

## Casos de uso
- Traducción de manga en Android: la app descarga los tres ficheros en el primer uso y ejecuta layout y OCR en local para extraer el texto de cada página antes de traducirlo; el enfoque mantiene el APK en torno a 160 MB.
- Extracción de texto de cómics escaneados: `layout.tflite` segmenta bocadillos y paneles y `ocr_encoder`/`ocr_textdecoder` transcriben el contenido, lo que permite generar guiones o subtítulos a partir de páginas en bruto.
- Digitalización y archivado de colecciones: el pipeline de layout más OCR produce texto indexable por página, útil para búsqueda full-text sobre tomos escaneados.
- Preprocesado para traducción automática: separar la detección de regiones del reconocimiento permite pasar cada bocadillo a un motor de traducción distinto y recomponer la página.
- Integración en apps móviles de terceros: al ser TFLite y Apache-2.0, los ficheros pueden incorporarse en aplicaciones Android que necesiten detección de paneles o OCR sin depender de servicios en la nube.
- Control de integridad en despliegues: el `manifest.json` con SHA-256 sirve como mecanismo de verificación en pipelines de distribución de pesos, rechazando cargas que no coincidan con el manifiesto.
- Prototipado de lectores de manga con funciones de accesibilidad: OCR local para generar texto alternativo o lecturas por voz de los bocadillos.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware
- Inferencia en dispositivo Android mediante TFLite; el repositorio está pensado para ejecución local en teléfonos, no para servidores.
- VRAM estimada para GPU de escritorio: no disponible. Los tamaños de fichero (131 MiB, 327,6 MiB y 249,6 MiB) dan una idea del peso en almacenamiento, no del consumo en memoria en ejecución.
- GPU recomendadas: no disponibles para este formato; el destino declarado es la app Android.
- Compatibilidad con GPU de consumo (RTX 4090 y similares): no documentada; los artefactos son TFLite y no se indica un runtime de escritorio.
- Opciones de despliegue: intérprete TFLite en Android; no se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a estos modelos.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Formato |
|---|---|---|---|---|---|
| Lemon MTL models (este repo) | Layout + OCR para manga | no disponible | no aplica | Apache-2.0 | TFLite |
| `mayocream/koharu-layout-highres` | Deteccion de layout | no disponible | no aplica | no disponible en la informacion | checkpoint original (no TFLite) |
| Hayai OCR (pesos originales) | OCR | no disponible | no aplica | no disponible en la informacion | checkpoint original (no TFLite) |

La comparación relevante es con los checkpoints de origen: este repositorio no aporta pesos nuevos, sino su conversión a TFLite y el empaquetado con manifiesto de integridad. No se dispone de datos de rendimiento comparativo entre la versión TFLite y los checkpoints originales.

## Limitaciones y advertencias
- No es un modelo de lenguaje: no genera texto libre, no razona y no admite instrucciones conversacionales.
- El OCR y el layout están orientados a manga; su comportamiento en otros dominios (documentos, fotografías, prensa) no está documentado.
- Idiomas soportados por el OCR: no disponibles; conviene validar el idioma objetivo antes de usarlo en producción.
- Sesgos conocidos: no documentados; al ser un detector y OCR entrenado sobre un corpus concreto, puede fallar en estilos de dibujo, tipografías o layouts atípicos.
- Riesgo de error de reconocimiento en texto manuscrito, fuentes decorativas o bocadillos con ruido de escaneo; no hay métricas publicadas de precisión.
- Restricciones de licencia: Apache-2.0 para la conversión, pero los checkpoints de origen se describen como Apache-2.0/MIT según el proyecto de escritorio; conviene verificar los términos de cada checkpoint antes de uso comercial.
- La app rechaza cualquier fichero que no coincida con el `manifest.json` incluido en el APK; si se modifica o reconvierte un peso, hay que actualizar el manifiesto.
- El repositorio no incluye los pesos de inpainting LaMa, el tokenizador ni el patchifier, necesarios para el pipeline completo de la app.
- Sin descargas ni likes en el momento de la consulta y con pipeline no definido en Hugging Face: no hay señales de validación por parte de la comunidad.

## Enlaces
- Repositorio en Hugging Face: https://huggingface.co/finnuen/lemon-mtl-models
- Proyecto Lemon MTL en GitHub: https://github.com/finnuen/LemonMTL
- Checkpoint de layout de origen: https://huggingface.co/mayocream/koharu-layout-highres
