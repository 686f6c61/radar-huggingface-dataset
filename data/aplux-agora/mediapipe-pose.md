# APLUX-Agora/MediaPipe-Pose

## Resumen

MediaPipe-Pose es un paquete de recursos de despliegue para el modelo de detección de puntos clave (keypoint detection) MediaPipe Pose, publicado por APLUX-Agora dentro de su plataforma Agora. No se trata de un modelo entrenado desde cero por este autor, sino de una conversión y empaquetado del modelo original de MediaPipe para su ejecución optimizada sobre aceleradores Qualcomm (QNN), con artefactos verificados placa a placa. El repositorio incluye binarios por precisión (FP16 como opción por defecto) y metadatos de configuración para cada SoC soportado.

El problema que resuelve es la brecha entre un modelo de investigación y su despliegue real en hardware AIoT: el paquete ofrece el grafo compilado, las rutinas de preprocesado y postprocesado, y un runner listo para ejecutar sobre la NPU del SoC. En la información disponible solo aparece validado sobre QCS8550 (placa Rhino Pi X1), con una latencia medida de 6,3 ms en FP16.

La relevancia actual es acotada pero concreta: para equipos que construyen aplicaciones de visión por computador en el borde (seguimiento de personas, análisis de movimiento, interacción gestual) sobre plataformas Qualcomm, este paquete elimina buena parte del trabajo de conversión y validación. No hay información sobre la arquitectura interna, el número de parámetros ni el contexto, porque el repositorio contiene artefactos de despliegue y no los pesos en formato estándar.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo original: MediaPipe Pose; topología interna no documentada en el repo) |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no es MoE según la información disponible) |
| Longitud de contexto | no disponible (modelo de visión, no de lenguaje) |
| Tipos de cuantizacion | FP16 (precisión por defecto medida); otras precisiones empaquetadas por SoC según `model.json`, no detalladas |
| Idiomas soportados | no disponible (modelo de visión, independiente de idioma) |
| Licencia | APLUX Model Farm License (`license: other`); el modelo fuente se rige por sus propios términos |
| Formato de pesos | binarios QNN (`model.bin` por precisión y SoC), no safetensors ni GGUF |

## Arquitectura y entrenamiento

No se dispone de información sobre la arquitectura interna, el volumen de datos de entrenamiento ni el proceso de ajuste del modelo original. La model card solo documenta el empaquetado: por cada SoC existe un directorio `targets/<SoC>/` con un `model.json` que declara la precisión por defecto y las rutas de las variantes, además de un subdirectorio por precisión con binarios `model.bin`. Los paquetes multi-fichero se conservan tal como los publica Model Farm.

La innovación técnica del repositorio no está en el modelo sino en el pipeline de despliegue: conversión a QNN, preprocesado y postprocesado oficiales de Model Farm, un runner de inferencia y verificación en placa real. El modelo expone cuatro salidas: `keypoints`, `boxes`, `masks` y `out` (JSON), lo que sugiere un pipeline de detección de persona más estimación de pose con máscaras de segmentación asociadas. No se documentan técnicas de entrenamiento, RLHF ni decodificación especulativa, que no aplican a este tipo de modelo.

## Capacidades

- Detección de puntos clave corporales (keypoint detection) sobre imágenes de entrada.
- Producción de cajas delimitadoras (`boxes`) junto con los puntos clave, útil para seguimiento multi-persona.
- Generación de máscaras (`masks`), presumiblemente de segmentación de la persona detectada.
- Salida estructurada en JSON (`out`) además de los tensores, lo que facilita su consumo por aplicaciones posteriores.
- Ejecución acelerada en NPU Qualcomm mediante QNN, con precisión FP16 por defecto.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso ni procesamiento de lenguaje, audio o vídeo explícito.

## Casos de uso

- Análisis de movimiento deportivo en el borde: el modelo estima puntos clave del cuerpo sobre fotogramas capturados por una cámara conectada a un SoC QCS8550, y la latencia de 6,3 ms permite procesar vídeo en tiempo real sin enviar datos a la nube.
- Seguimiento de personas en videovigilancia: las salidas `boxes` y `keypoints` permiten identificar y seguir individuos entre fotogramas dentro de una misma escena, con el cómputo ejecutándose íntegramente en la placa.
- Interacción gestual en dispositivos AIoT: los puntos clave de brazos y manos alimentan un clasificador ligero de gestos para controlar paneles, kioscos o electrodomésticos sin contacto físico.
- Telemedicina y rehabilitación: la estimación de pose permite medir amplitudes de movimiento en ejercicios guiados, con la ventaja de que el vídeo del paciente no sale del dispositivo.
- Anonimización selectiva en cámaras inteligentes: las máscaras y cajas permiten localizar a las personas en la imagen para difuminarlas o recortarlas antes de transmitir el flujo.
- Robótica de servicio: un robot equipado con SoC Qualcomm puede usar la pose estimada para orientarse hacia una persona, mantener distancia social o detectar caídas, con latencia inferior a 10 ms por inferencia.
- Analítica de aforo y comportamiento en retail: el pipeline de detección más pose permite estimar orientación y atención de clientes en una tienda, ejecutando todo el procesamiento localmente.

## Benchmarks y rendimiento

| Metrica | Valor | Hardware | Precision |
|---|---|---|---|
| Latencia de inferencia | 6,3 ms | QCS8550 · Rhino Pi X1 | FP16 |

No se han publicado resultados de benchmarks de calidad (mAP, PCK, OKS) en la información disponible. El único dato de rendimiento documentado es la latencia medida en placa por Agora con la precisión por defecto.

## Requisitos de hardware

- VRAM: no aplica; el modelo se ejecuta sobre NPU integrada en el SoC, no sobre GPU discreta.
- SoC validado: Qualcomm QCS8550, en la placa Rhino Pi X1. No se documentan otros SoC en la información disponible.
- GPU de escritorio: no disponible; el paquete está orientado a aceleradores QNN, no a CUDA.
- Despliegue: runner de Agora con preprocesado y postprocesado oficiales de Model Farm; descarga mediante `hf download` filtrando por `targets/<SoC>/*`.
- Latencia: 6,3 ms por inferencia en FP16 sobre QCS8550, según medición de Agora.
- Throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Despliegue en borde |
|---|---|---|---|---|---|
| MediaPipe-Pose (APLUX-Agora) | Keypoint detection empaquetado para QNN | no disponible | no aplica | APLUX Model Farm License | QCS8550 validado, 6,3 ms FP16 |
| MediaPipe Pose (Google, original) | Keypoint detection | no disponible | no aplica | Términos del modelo original | Multiplataforma (CPU, GPU, TFLite) |
| YOLO-Pose (Ultralytics) | Detección de pose | disponible por variante (n/s/m/l/x) | no aplica | AGPL-3.0 o licencia comercial | Variantes TFLite, ONNX, TensorRT |
| RTMPose (OpenMMLab) | Estimación de pose de cuerpo completo | disponible por variante (tiny a large) | no aplica | Apache-2.0 | ONNX, TensorRT, MMPose |

La comparación es aproximada: los tres alternativos son modelos o familias de modelos publicados con pesos y métricas, mientras que este repositorio es un paquete de despliegue de MediaPipe Pose para Qualcomm. No se dispone de datos de calidad comparables para establecer una comparación numérica justa.

## Limitaciones y advertencias

- El repositorio no contiene pesos en formato estándar (safetensors, GGUF, ONNX); solo binarios QNN, por lo que no puede ejecutarse fuera de plataformas Qualcomm compatibles sin un proceso de conversión adicional.
- Solo hay validación documentada sobre QCS8550; el comportamiento en otros SoC no está verificado en la información disponible.
- La licencia APLUX Model Farm License es distinta de la del modelo fuente; es imprescindible revisar `LICENSE_MODEL_FARM.pdf` y `NOTICE.md` antes de cualquier uso comercial, y verificar también los términos del modelo original de MediaPipe.
- No se documentan sesgos, tasas de error ni condiciones de degradación (oclusión, poses extremas, iluminación adversa), lo que impide evaluar su robustez en producción.
- El tamaño del repositorio es de 0,0 GB según Hugging Face, lo que puede indicar que los binarios no están efectivamente alojados o que la métrica no se ha actualizado; conviene verificar la descarga antes de integrarlo.
- Sin descargas ni likes registrados; no hay evidencia de uso en producción por parte de terceros.
- Al ser un modelo de visión, no ofrece capacidades de lenguaje, tool calling ni razonamiento multi-paso, pese a que la ficha de Hugging Face pueda aparecer junto a otros modelos de la misma organización.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/APLUX-Agora/MediaPipe-Pose
- Demo y despliegue en Agora: https://mega.aidlux.com/models/mediapipe-pose
- Plataforma Agora: https://mega.aidlux.com
- Licencia APLUX Model Farm: https://huggingface.co/APLUX-Agora/MediaPipe-Pose/blob/main/LICENSE_MODEL_FARM.pdf
- Modelo original MediaPipe Pose (Google): no disponible en la información proporcionada
