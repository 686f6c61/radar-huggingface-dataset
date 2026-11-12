# Longpipe/longpipe

## Resumen

Longpipe es un conjunto de modelos de segmentación de imagen especializados en matting de retratos en tiempo real, desarrollado por Longpipe (longpipe.dev). Su función principal es separar a una persona del fondo en vídeo en directo y videollamadas, generando una máscara alfa de alta calidad que permite aplicar fondos virtuales, desenfoque de fondo y otras composiciones. Se distribuye como exportación oficial a ONNX de los pesos de producción del SDK del autor (release `v0.0.5`), lo que permite usar los mismos pesos fuera del navegador: Python, aplicaciones nativas, servidores, móvil u `onnxruntime-web`.

El sistema no es un único modelo, sino una familia de cinco grafos ONNX por nivel de calidad: `matting` (máscara refinada a resolución de lienzo), `matting_base` (máscara a resolución base, más rápida y con bordes más suaves), `face` (5 mapas de calor de puntos clave faciales), `flow` (flujo óptico backward entre dos fotogramas) y `landmark_mesh` (malla facial de 478 puntos). Los cuatro primeros se ofrecen en cinco niveles (`xs`, `small`, `medium`, `large`, `xl`) y en dos orientaciones (horizontal y vertical).

La relevancia actual radica en que ofrece una alternativa a MediaPipe para matting de retratos con licencia MIT tanto en código como en pesos, con una calidad declarada superior en el conjunto de validación P3M-10K (499 imágenes) y con pesos pequeños (desde 3,6 MB hasta 29,2 MB para el grafo de matting). El repositorio ocupa 0,5 GB en total y no registra descargas ni likes en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Red base tipo EfficientNet-Lite (encoder + decoder) envuelta en un wrapper U-Net de alta resolución que refina bordes a resolución de lienzo; grafos auxiliares de puntos clave faciales, malla facial y flujo óptico |
| Parametros totales | no disponible (el autor solo publica el tamaño de archivo por grafo) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión, entrada de imagen fija) |
| Tipos de cuantizacion | no disponible (se distribuyen pesos ONNX float32; no se documentan variantes cuantizadas) |
| Idiomas soportados | no disponible (modelo de visión sin componente lingüístico) |
| Licencia | MIT (código y pesos) |
| Formato de pesos | ONNX (un archivo por grafo, nivel y orientación; `onnx/manifest.json` con formas, sha256 y paridad frente a PyTorch) |

Resumen de niveles y tamaños del grafo `matting`:

| Nivel | Lienzo (horizontal, H×W) | Resolución base | Tamaño `matting` | Hardware previsto |
|---|---|---|---|---|
| `xs` | 240×384 | 80×128 | 3,6 MB | dispositivos de gama muy baja |
| `small` | 224×384 | 112×192 | 3,6 MB | Chromebooks y portátiles de gama baja |
| `medium` | 320×512 | 160×256 | 13,0 MB | gama media |
| `large` | 400×640 | 160×256 | 14,2 MB | portátiles de gama media |
| `xl` | 768×1280 | 192×320 | 29,2 MB | Apple Silicon y GPU dedicadas |

## Arquitectura y entrenamiento

Cada nivel combina una red base pequeña (encoder EfficientNet-Lite más decoder) que produce una máscara a resolución base, y un wrapper U-Net de alta resolución que refina los bordes a la resolución del lienzo. El resultado es la máscara alfa final que renderiza el SDK. La variante `matting_base` expone solo la salida de la red base, lo que reduce el coste a cambio de bordes más suaves y menor detalle. Todos los modelos tienen forma de entrada fija; cada nivel se distribuye en versión horizontal y vertical (con H y W intercambiados). La entrada es RGB en [0, 1], formato NCHW float32 y batch 1, sin normalización media/desviación (la normalización ImageNet del modelo de malla facial está incorporada en el grafo).

El sistema auxiliar incluye tres cabezas: `face`, que devuelve cinco mapas de calor (ojo izquierdo, ojo derecho, nariz, comisura izquierda y comisura derecha) con rejilla base/8 en `medium`, `large` y `xl`, y base/4 en `xs` y `small`; `flow`, que recibe el fotograma anterior en los canales 0-2 y el actual en los canales 3-5 y devuelve flujo backward (dx, dy) en píxeles de resolución base, útil para deformar la máscara alfa anterior sobre el fotograma actual y dar estabilidad temporal; y `landmark_mesh`, que a partir de un recorte facial de 256×256 devuelve 478 puntos de malla facial en coordenadas del recorte.

Los pesos ONNX se exportaron directamente desde los checkpoints de PyTorch que generan los archivos de producción del SDK (release `v0.0.5`, servidos en `cdn.longpipe.dev/models/v/0.0.5/` y usados por el SDK 0.0.16). El autor declara una verificación de paridad frente a PyTorch con diferencia absoluta máxima ≤ 7e-5 (la mayoría ≤ 1e-6). No se detallan en la model card el número de tokens de entrenamiento, la composición del dataset ni si hubo RLHF/DPO; la procedencia de los datos de entrenamiento se remite a `longpipe.dev/docs/licensing`.

## Capacidades

- Matting de retratos en tiempo real: genera una máscara alfa en [0, 1] a resolución de lienzo, apta para fondos virtuales y desenfoque de fondo.
- Variante rápida de matting (`matting_base`) a resolución base, con bordes más suaves y menor coste computacional.
- Detección de cinco puntos clave faciales (ojos, nariz y comisuras de la boca) mediante mapas de calor con sigmoide aplicada.
- Malla facial de 478 puntos a partir de un recorte de 256×256, compartida por todos los niveles.
- Flujo óptico backward entre dos fotogramas para estabilización temporal de la máscara.
- Soporte de vídeo en directo y fotogramas individuales; pensado para integrarse en pipelines WebRTC y videollamadas.
- Ejecución multiplataforma vía ONNX Runtime (Python, nativo, servidor, móvil y `onnxruntime-web`).
- No incluye generación de texto, razonamiento, código, matemáticas, tool calling, agentes ni capacidades multilingües: es un modelo puramente de visión.

## Casos de uso

- Fondos virtuales en videollamadas: el grafo `matting` del nivel `medium` o `large` produce una máscara alfa a 320×512 o 400×640 que se compone sobre una imagen de fondo en tiempo real, con bordes refinados por el wrapper U-Net.
- Desenfoque de fondo en aplicaciones de conferencia: se usa `matting_base` para reducir coste y aplicar un desenfoque gaussiano sobre la región con alfa bajo, manteniendo la silueta de la persona.
- Estabilización temporal de la máscara en vídeo: el grafo `flow` calcula el flujo backward entre fotogramas consecutivos y permite deformar la alfa anterior sobre el fotograma actual, reduciendo parpadeos en la silueta.
- Autoencuadre y recorte inteligente: los mapas de calor del grafo `face` localizan ojos, nariz y boca, y el recorte cuadrado derivado (lado = 2,4 × el mayor del bounding box) alimenta la malla de 478 puntos para centrar el encuadre en la cara.
- Retoque facial y efectos: la malla `landmark_mesh` de 478 puntos permite alinear filtros, maquillaje virtual o correcciones de piel sobre regiones concretas del rostro.
- Procesado por lotes de retratos en servidor: con ONNX Runtime en Python se pueden generar máscaras alfa para catálogos de fotos, avatares o recortes de producto-persona, usando el nivel `xl` para máxima resolución (768×1280).
- Sustitución de fondo en aplicaciones móviles o de escritorio: el nivel `xs` (240×384, 3,6 MB) está pensado para dispositivos de gama muy baja y permite ejecutar el matting en local sin conexión.

## Benchmarks y rendimiento

El autor publica una comparación cualitativa y cuantitativa frente a MediaPipe en el conjunto de validación P3M-10K (499 imágenes), afirmando que todos los niveles de Longpipe superan a MediaPipe tanto en MAE como en IoU. Sin embargo, la model card no incluye los valores numéricos de MAE e IoU en texto, solo gráficas incrustadas, por lo que no se pueden reproducir aquí.

| Benchmark | Longpipe | MediaPipe | Notas |
|---|---|---|---|
| P3M-10K MAE (499 imágenes) | no disponible en texto | no disponible en texto | El autor afirma mejora en todos los niveles; cifras solo en gráfica |
| P3M-10K IoU (499 imágenes) | no disponible en texto | no disponible en texto | El autor afirma mejora en todos los niveles; cifras solo en gráfica |
| Velocidad en navegador | no disponible en texto | no disponible en texto | El autor afirma que el pipeline GPU del SDK es más rápido que MediaPipe y BodyPix; cifras solo en gráfica |

No se han publicado resultados numéricos de benchmarks en texto en la información disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita. Como referencia de tamaño, los grafos de matting van de 3,6 MB (`xs`, `small`) a 29,2 MB (`xl`); el consumo real depende de la resolución del lienzo y del runtime.
- GPU recomendadas: el autor indica Apple Silicon y GPU dedicadas para el nivel `xl`; gama media para `medium` y `large`; Chromebooks y portátiles de gama baja para `small`; dispositivos de gama muy baja para `xs`.
- ¿Cabe en GPU de consumo? Sí, previsiblemente en cualquier GPU de consumo moderna, dado el reducido tamaño de los pesos; no se publican cifras de VRAM por nivel.
- Opciones de despliegue: ONNX Runtime (Python, nativo, móvil), `onnxruntime-web` en navegador, y el SDK propio `npm install longpipe` con shaders WebGPU/WebGL2.
- Latencia y throughput: no disponibles en cifras. El autor solo afirma que el pipeline GPU del SDK en navegador es más rápido que MediaPipe y BodyPix pese a usar modelos más grandes; la velocidad con ONNX Runtime depende del runtime y del hardware.

## Comparativa con modelos similares

| Modelo | Tipo | Tamaño | Contexto / entrada | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Longpipe | Matting de retratos + puntos clave + malla + flujo óptico | 3,6-29,2 MB por grafo de matting; repo de 0,5 GB | Imagen fija por nivel (240×384 a 768×1280) | MIT (código y pesos) | Hugging Face, npm, GitHub |
| MediaPipe (Selfie Segmentation) | Segmentación de persona | no disponible | no disponible | Apache 2.0 (según el proyecto MediaPipe) | SDK de Google |
| BodyPix | Segmentación de persona | no disponible | no disponible | Apache 2.0 (según el proyecto) | TensorFlow.js |

El autor compara explícitamente con MediaPipe y BodyPix en calidad (P3M-10K) y velocidad en navegador, afirmando superioridad en ambas. No se dispone de cifras numéricas de esos competidores en la información proporcionada, ni de otros modelos de matting comparables con datos verificables.

## Limitaciones y advertencias

- Modelo de visión sin capacidades de texto, razonamiento ni multilingüismo; no debe evaluarse como un LLM.
- Entrada de forma fija por nivel y orientación: es necesario redimensionar el fotograma al lienzo (interpolación bilinear) antes de la inferencia; no se admite resolución arbitraria.
- El recorte facial para `landmark_mesh` debe construirse con el procedimiento indicado (soft-argmax sobre ventana 7×7 y caja cuadrada de lado 2,4 × el mayor del bounding box); usar el argmax duro provoca jitter.
- El flujo óptico es backward y en píxeles de resolución base; su uso incorrecto (por ejemplo, sin deformar la alfa previa) degrada la estabilidad temporal.
- No se documentan sesgos demográficos, de tono de piel o de iluminación; la validación publicada se limita a P3M-10K y a comparaciones con MediaPipe.
- Riesgo de alucinación no aplica (no genera texto), pero sí de errores de segmentación en bordes finos, pelo, gafas o fondos con colores similares a la ropa.
- Licencia MIT permite uso comercial, pero la procedencia de los datos de entrenamiento se remite a `longpipe.dev/docs/licensing`; conviene revisarla antes de un despliegue en producción.
- El repositorio no registra descargas ni likes y los pesos corresponden al release `v0.0.5` del SDK; no se garantiza compatibilidad con versiones futuras del SDK.
- No se publican cifras de latencia, throughput ni VRAM, por lo que el dimensionamiento debe hacerse con pruebas propias.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Longpipe/longpipe
- Sitio del proyecto: https://longpipe.dev
- Demo en vivo: https://longpipe.dev/demo
- Documentación de licencia y procedencia de datos: https://longpipe.dev/docs/licensing
- SDK en npm: https://www.npmjs.com/package/longpipe
- Repositorio GitHub: https://github.com/sb2702/longpipe
- CDN de pesos: https://cdn.longpipe.dev/models/v/0.0.5/
