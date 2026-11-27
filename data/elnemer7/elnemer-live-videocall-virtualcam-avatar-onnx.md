# elnemer7/ElNeMeR-Live-VideoCall-VirtualCam-Avatar-ONNX

## Resumen

ElNeMeR-Live-VideoCall-VirtualCam-Avatar-ONNX es un clasificador binario-multiclase exportado a formato ONNX, publicado por el autor elnemer7 (Mahmoud ElNemer, ElNeMeR Digital Solutions & AI) bajo licencia MIT. Su propósito declarado es detectar suplantaciones en videollamadas en tiempo real: identifica si la señal de vídeo proviene de una webcam física real, de un face-swap en directo generado con DeepFaceLive a través de una cámara virtual (OBS VirtualCam), o de una inyección de vídeo pregrabado en bucle. No es un modelo generativo ni un transformer de lenguaje, sino un clasificador tabular ligero que opera sobre un vector de 20 características extraídas de la señal de vídeo.

El modelo se presenta como parte de una "flota forense" de 50 modelos del mismo autor orientada a seguridad humanitaria y forense digital. Su relevancia práctica radica en el nicho: la detección de deepfakes en directo durante reuniones de Zoom, WhatsApp o Messenger es un problema creciente y con pocas herramientas ligeras que puedan ejecutarse en el navegador. Al estar exportado a ONNX con opset 14, es compatible con `onnxruntime` y `onnxruntime-web` (WASM), lo que permite despliegue en cliente sin backend.

La información pública disponible es muy limitada: el repositorio de Hugging Face ocupa 0.0 GB, no tiene descargas ni likes, y la model card no detalla arquitectura interna, datos de entrenamiento ni composición del dataset. La fecha de creación indicada (2026-11-27) es anómala y no verificable.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | No disponible (clasificador sobre vector de 20 características, exportado a ONNX) |
| Parámetros totales | No disponible |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No aplica (modelo no generativo de texto) |
| Tipos de cuantización | No disponible |
| Idiomas soportados | No disponible (no procesa texto) |
| Licencia | MIT |
| Formato de pesos | ONNX (opset 14) |

## Arquitectura y entrenamiento

No se ha publicado información sobre la arquitectura interna del modelo (número de capas, tipo de red, función de activación) más allá de que se trata de un modelo ONNX con opset 14. La entrada es un tensor `float32` de forma `[batch_size, 20]` denominado `vcam_features`, y la salida es un vector de probabilidades sobre tres clases: `real_live_webcam_human`, `deepfacelive_virtualcam_face_swap` y `pre_recorded_loop_injection`. Esto sugiere un clasificador tabular (posiblemente MLP o similar) que consume características precalculadas de la señal de vídeo, no píxeles en bruto.

No se detalla el volumen ni la composición del dataset de entrenamiento, ni si se emplearon técnicas de aumento de datos, validación cruzada o calibración posterior. La model card únicamente declara una "calibration accuracy" del 95,77 %, sin especificar sobre qué conjunto de validación ni con qué métrica exacta (exactitud, F1, AUC). No hay información sobre el proceso de extracción de las 20 características de entrada.

## Capacidades

- Clasificación de señales de vídeo en tres categorías: webcam real, face-swap en directo vía cámara virtual y vídeo pregrabado en bucle.
- Inferencia en tiempo real compatible con `onnxruntime` (Python/C++) y `onnxruntime-web` (WASM en navegador).
- Integración en pipelines de videollamada para alertar de posibles suplantaciones.
- Funcionamiento sobre características precalculadas, lo que reduce el coste computacional en el cliente.
- No soporta generación de texto, razonamiento, código, matemáticas, visión general, tool calling ni agentes.
- No hay soporte multilingüe declarado (no procesa lenguaje).

## Casos de uso

- Moderación de videollamadas corporativas: integrar el modelo en un servicio que reciba el vector de características de la señal de cada participante y marque sesiones sospechosas antes de que se compartan datos sensibles.
- Verificación de identidad en banca telefónica: alertar cuando el vídeo del cliente proviene de una cámara virtual con face-swap, como capa adicional a la autenticación biométrica.
- Protección de periodistas y activistas: detección de suplantaciones en entrevistas remotas mediante una extensión de navegador basada en `onnxruntime-web`.
- Forense digital post-incidente: analizar grabaciones de reuniones para clasificar segmentos como reales, face-swap o bucle pregrabado y aportar evidencia en investigaciones.
- KYC remoto: complementar la verificación documental con una comprobación de que la cámara es física y no virtual.
- Formación y concienciación: herramienta didáctica que muestre en tiempo real cuándo una videollamada de demostración está siendo manipulada.
- Investigación académica sobre detección de deepfakes en directo: servir como baseline ligero y reproducible en ONNX.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La única métrica declarada es una "calibration accuracy" del 95,77 %, sin especificar conjunto de evaluación, métrica exacta ni comparación con alternativas.

## Requisitos de hardware

- VRAM estimada: no disponible; el repositorio ocupa 0.0 GB y el modelo consume un vector de 20 `float32` como entrada, por lo que la huella debería ser mínima (órdenes de kilobytes a pocos megabytes), aunque no se confirma el tamaño del grafo ONNX.
- GPU recomendadas: no aplica; puede ejecutarse en CPU.
- Cabe en cualquier GPU de consumo e incluso en navegador vía WASM.
- Opciones de despliegue: `onnxruntime` (Python, C++, C#), `onnxruntime-web` (WASM), potencialmente `onnxruntime-node`.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Entrada | Clases | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ElNeMeR VirtualCam Detector (ONNX #41) | Clasificador tabular ONNX | Vector de 20 características | 3 | MIT | Hugging Face |
| Alternativas de detección de deepfake en vídeo | No disponible | No disponible | No disponible | No disponible | No disponible |

No se dispone de información sobre modelos comparables en la documentación proporcionada.

## Limitaciones y advertencias

- La model card no documenta arquitectura, dataset ni metodología de entrenamiento, lo que impide evaluar su robustez y generalización.
- La métrica de 95,77 % no especifica conjunto de validación, métrica exacta ni condiciones; no debe interpretarse como rendimiento en producción.
- Depende de un extractor de características externo que produzca el vector de 20 dimensiones; si ese extractor no está disponible o cambia, el modelo es inutilizable.
- No se ha verificado su comportamiento frente a técnicas de evasión (compresión, ruido, reencodeado) habituales en deepfakes adversariales.
- El repositorio no contiene pesos visibles (0.0 GB), descargas ni likes, y la fecha de creación es anómala; la disponibilidad real del artefacto no está confirmada.
- Licencia MIT permite uso comercial, pero el autor no ofrece garantías ni soporte documentado.
- Riesgo de falsos positivos con cámaras virtuales legítimas (por ejemplo, OBS para streaming profesional) y de falsos negativos con face-swaps de alta calidad.
- No hay información sobre sesgos demográficos ni sobre el rendimiento por grupos de edad, género o tono de piel.

## Enlaces

- Hugging Face: https://huggingface.co/elnemer7/ElNeMeR-Live-VideoCall-VirtualCam-Avatar-ONNX
- Plataforma forense del autor: https://detector.elnemer-ai.com
- Portal corporativo: https://elnemer-ai.com
- Paper, blog o repositorio adicional: no disponible
