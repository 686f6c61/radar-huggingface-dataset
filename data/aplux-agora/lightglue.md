# APLUX-Agora/LightGLUE

## Resumen

LightGLUE es un modelo de emparejamiento de características (feature matching) para visión por computador, empaquetado y distribuido por APLUX-Agora dentro de su plataforma Agora. El recurso publicado no es el modelo original en formato de pesos estándar, sino un conjunto de artefactos convertidos y optimizados para despliegue en hardware Qualcomm, concretamente para el SoC QCS8550 (placa Rhino Pi X1). El flujo que implementa extrae 512 descriptores SuperPoint de cada una de dos imágenes de entrada, los empareja mediante LightGlue y verifica la consistencia geométrica del resultado.

El repositorio tiene un tamaño de 0,0 GB según los metadatos de Hugging Face, lo que sugiere que los binarios principales se distribuyen en subdirectorios por SoC (`targets/<SoC>/`) y no se reflejan en el recuento agregado, o que el paquete aún no contiene los pesos. La model card documenta un único target medido: QCS8550 en precisión FP16 con una latencia de 196,3 ms.

La relevancia de este recurso es acotada y muy específica: sirve para desplegar matching de features en dispositivos AIoT con aceleración Qualcomm QNN, no como sustituto del LightGLUE original de PyTorch. La información pública disponible es escasa y no incluye detalles de arquitectura, entrenamiento ni evaluación de calidad del emparejamiento.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | LightGLUE (matching de features) sobre descriptores SuperPoint; detalles internos no disponibles |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo de visión, no de lenguaje) |
| Tipos de cuantización | FP16 (única precisión publicada para QCS8550) |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | APLUX Model Farm License (licencia del modelo fuente: según términos del modelo original) |
| Formato de pesos | binarios QNN (`model.bin`) por precisión, más `model.json` de configuración; no se publican safetensors ni GGUF |
| Entradas | `image0` (imagen), `image1` (imagen) |
| Salidas | `matches` (imagen), `out` (JSON) |
| Hardware objetivo | Qualcomm QCS8550 (Rhino Pi X1) |
| Latencia medida | 196,3 ms en QCS8550 a FP16 |
| Tarea declarada | "其他" (otros) |

## Arquitectura y entrenamiento

El modelo subyacente es LightGLUE, un emparejador de puntos clave basado en atención que opera sobre descriptores extraídos por SuperPoint. El pipeline declarado en la model card es: extracción de 512 descriptores SuperPoint por imagen, matching con LightGlue y comprobación de consistencia geométrica. No se proporcionan detalles sobre el número de capas, dimensión de los descriptores, mecanismo de atención ni configuración del entrenamiento original.

APLUX-Agora no publica información sobre el proceso de conversión, calibración o cuantización más allá de la disponibilidad de FP16 para QCS8550. Tampoco se documentan los datos de entrenamiento del modelo fuente, la existencia de RLHF/DPO (no aplicable a un matcher) ni innovaciones técnicas adicionales. El paquete incluye preprocesado, postprocesado y runner, cuyo contenido no se detalla en la información disponible.

## Capacidades

- Extracción de 512 puntos clave SuperPoint por imagen de entrada.
- Emparejamiento de descriptores entre dos imágenes mediante LightGlue.
- Verificación de consistencia geométrica de los matches.
- Salida estructurada en JSON (`out`) además de una imagen de matches (`matches`).
- Ejecución acelerada en Qualcomm QCS8550 mediante QNN.
- No dispone de generación de texto, razonamiento, código, matemáticas, tool calling, agentes ni capacidades multilingües.
- No se documentan modos de pensamiento, visión generativa, audio ni otras capacidades especiales.

## Casos de uso

- Reconstrucción 3D y fotogrametría en dispositivos AIoT: el modelo empareja puntos entre pares de imágenes para estimar correspondencias que alimenten triangulación o ajuste de haces, con 196,3 ms por par en QCS8550.
- SLAM visual en robótica de bajo consumo: el emparejamiento de features entre fotogramas consecutivos permite estimar movimiento de cámara en la propia placa, sin enviar imágenes a la nube.
- Registro de imágenes (image registration) en inspección industrial: alinear imágenes de una misma pieza tomadas en momentos o ángulos distintos usando los matches y la comprobación de consistencia geométrica.
- Costura de imágenes (stitching) en cámaras embebidas: emparejar solapamientos entre tomas para componer panorámicas en el dispositivo.
- Localización visual: comparar una imagen capturada con una base de referencia para determinar la posición de un robot o dron, aprovechando la salida JSON de matches.
- Seguimiento y odometría visual en wearables o cámaras inteligentes: el pipeline de 512 keypoints es ligero y cabe en el presupuesto térmico y de cómputo de un SoC QCS8550.
- Prototipado sin hardware: la plataforma Agora permite probar el modelo en línea antes de desplegarlo en placa.

## Benchmarks y rendimiento

| Métrica | Valor | Contexto |
|---|---|---|
| Latencia | 196,3 ms | QCS8550, FP16, precisión por defecto |

No se han publicado resultados de benchmarks de calidad de emparejamiento (por ejemplo, precisión de matches o recall) en la información disponible.

## Requisitos de hardware

- VRAM: no aplica; el despliegue objetivo es un SoC Qualcomm QCS8550 con memoria unificada, no una GPU dedicada.
- GPU recomendadas: ninguna documentada; el paquete está orientado a QNN y al SoC QCS8550.
- Compatibilidad con GPU de consumo: no disponible; no se publican pesos para CUDA, ROCm ni Metal.
- Opciones de despliegue: QNN en QCS8550 mediante el runner incluido en Agora; exportación de proyectos desde la plataforma Agora. No se mencionan vLLM, llama.cpp, Ollama ni TGI (no aplicables a este tipo de modelo).
- Latencia: 196,3 ms por inferencia en QCS8550 a FP16; no se documenta throughput.

## Comparativa con modelos similares

| Modelo | Tipo | Hardware objetivo | Licencia | Disponibilidad |
|---|---|---|---|---|
| LightGLUE (APLUX-Agora) | Matcher SuperPoint + LightGLUE, empaquetado QNN | QCS8550 | APLUX Model Farm License | Hugging Face (APLUX-Agora) |
| LightGLUE original | Matcher de features | GPU/CPU genéricas | según repositorio original | GitHub / pesos originales |
| SuperGlue | Matcher de features | GPU/CPU genéricas | según repositorio original | GitHub / pesos originales |
| SuperPoint (solo extracción) | Detector y descriptor | GPU/CPU genéricas | según repositorio original | GitHub / pesos originales |

No se dispone de datos de rendimiento comparativo entre estas alternativas en la información proporcionada.

## Limitaciones y advertencias

- La información pública es mínima: no hay detalles de arquitectura, entrenamiento ni evaluación de calidad del matching.
- El paquete solo cubre QCS8550 a FP16; no se publican variantes para otras precisiones ni otros SoC.
- Los pesos no están en safetensors ni GGUF, lo que impide reutilizarlos fuera del stack QNN/Agora sin trabajo de conversión.
- La licencia APLUX Model Farm License es distinta de la licencia del modelo fuente; es necesario revisar ambos documentos antes de un uso comercial.
- El modelo fuente conserva sus propios términos de licencia, que no se detallan en la información disponible.
- No se documentan sesgos, tasas de alucinación ni limitaciones idiomáticas porque no es un modelo generativo.
- El tamaño del repositorio (0,0 GB) no permite verificar que los binarios estén efectivamente publicados.
- El modelo no debe evaluarse como un LLM: no genera texto ni admite instrucciones en lenguaje natural.

## Enlaces

- Hugging Face: https://huggingface.co/APLUX-Agora/LightGLUE
- Demo en línea (Agora): https://mega.aidlux.com/models/lightglue
- Plataforma Agora: https://mega.aidlux.com
- Licencia: https://huggingface.co/APLUX-Agora/LightGLUE/blob/main/LICENSE_MODEL_FARM.pdf
