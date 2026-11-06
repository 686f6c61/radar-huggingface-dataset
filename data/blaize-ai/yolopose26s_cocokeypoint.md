# Blaize-AI/YOLOPOSE26s_COCOKeypoint

## Resumen

YOLOPOSE26s_COCOKeypoint es un modelo de estimación de pose (detección de keypoints humanos) derivado de YOLO26s-pose de Ultralytics, optimizado por Blaize-AI para su despliegue sobre aceleradores de IA Blaize Xplorer mediante el SDK Picasso. No se trata de un modelo de lenguaje, sino de un modelo de visión por computador especializado en localizar articulaciones y puntos anatómicos sobre personas en imágenes, entrenado sobre el dataset COCO Keypoints 2017.

La relevancia del modelo reside en su orientación a inferencia en el borde (edge AI): la arquitectura GSP (Graph Streaming Processor) de Blaize está diseñada para reducir latencia y consumo energético en cargas de trabajo de visión, y este repositorio distribuye variantes ya compiladas y cuantizadas en formato `.bm` listas para ejecutarse en dicho hardware. El modelo base es la variante "small" de la familia YOLO26-pose, lo que lo sitúa en un compromiso entre precisión y coste computacional.

El repositorio contiene dos variantes con distinta resolución de entrada (640×384 y 640×640) y cuantización AMP (mezcla de INT8 y BF16). No se proporcionan datos sobre número de parámetros, contexto (no aplica, al no ser un modelo generativo) ni resultados de benchmarks en la información disponible.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | YOLO26s-pose (familia YOLO, detector de keypoints de una etapa); optimizado para GSP de Blaize |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión, no generativo) |
| Tipos de cuantización | INT8, BF16, AMP (mezcla INT8 + BF16) |
| Idiomas soportados | no disponible (no aplica; tarea de visión) |
| Licencia | AGPL-3.0 |
| Formato de pesos | `.bm` (formato de modelo Blaize); modelo original en PyTorch |

## Arquitectura y entrenamiento

El modelo deriva de YOLO26s-pose de Ultralytics, un detector de una etapa que predice simultáneamente cajas delimitadoras de personas y un conjunto de keypoints anatómicos (el estándar COCO Keypoints define 17 puntos por persona). La arquitectura concreta de la variante "s" (small) no se detalla en la información proporcionada; el autor indica únicamente el framework de origen (PyTorch) y la versión (26) de la familia Ultralytics.

El entrenamiento se realizó sobre COCO Keypoints 2017, un dataset anotado con keypoints de personas bajo licencia CC-BY-4.0. No se especifican en la información disponible el número de tokens (no aplica), el volumen exacto de imágenes, ni si hubo etapas de ajuste fino adicionales. La contribución específica de Blaize-AI consiste en la optimización hardware-específica y la compilación a formato `.bm` para el acelerador Xplorer, sin modificar el código fuente del modelo original según declara el propio autor.

## Capacidades

- Detección de pose humana: localización de keypoints anatómicos (estándar COCO Keypoints) sobre personas en imágenes.
- Detección de personas: al ser un modelo pose de YOLO, predice también las cajas delimitadoras asociadas a cada instancia.
- Inferencia en el borde: ejecución sobre aceleradores Blaize Xplorer con el SDK Picasso, orientada a baja latencia y eficiencia energética.
- Dos resoluciones de entrada: 640×384 (formato panorámico) y 640×640 (cuadrado).
- Cuantización configurable: variantes INT8 (máxima velocidad), BF16 (máxima precisión) y AMP (equilibrio).
- No dispone de capacidades de generación de texto, tool calling, agentes, razonamiento multi-paso ni procesamiento de audio; no es un modelo de lenguaje.

## Casos de uso

- Análisis de movimiento deportivo: estimación de keypoints en secuencias de vídeo para calcular ángulos articulares y detectar errores posturales en entrenamiento, aprovechando la baja latencia del acelerador Xplorer.
- Videovigilancia y seguridad en el borde: detección de caídas o posturas anómalas en cámaras IP con procesamiento local, sin enviar vídeo a la nube, gracias al despliegue sobre hardware Blaize.
- Interacción persona-ordenador: control gestual o seguimiento corporal en instalaciones interactivas, usando la variante 640×384 para encuadres amplios.
- Robótica y automatización: seguimiento de operarios en entornos industriales para seguridad de zonas de exclusión, con inferencia embebida de bajo consumo.
- Análisis de ergonomía laboral: estimación de posturas en puestos de trabajo para evaluar riesgos ergonómicos a partir de imágenes o vídeo capturado en el propio centro.
- Aplicaciones de fitness y rehabilitación: conteo de repeticiones y corrección de forma en ejercicios mediante keypoints, desplegable en dispositivos con acelerador Blaize.
- Monitorización de aforo y comportamiento en retail: análisis agregado de poses para estudios de flujo de personas, con la variante 640×640 para mayor precisión en escenas densas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- Hardware obligatorio: acelerador de IA Blaize Xplorer; el modelo no está pensado para ejecutarse en GPU convencional en el formato distribuido (`.bm`).
- SDK requerido: Blaize Picasso SDK instalado y configurado; la utilidad `blaize-modeltool` permite inspeccionar los modelos.
- VRAM estimada: no disponible (no aplica en el sentido convencional; el modelo se ejecuta sobre el acelerador GSP).
- GPU recomendadas: no aplica; el despliegue objetivo es el acelerador Blaize Xplorer.
- Compatibilidad con GPU de consumo: no disponible para el formato `.bm`; el modelo original de Ultralytics podría ejecutarse en GPU, pero no se distribuye aquí en ese formato.
- Opciones de despliegue: SDK Picasso sobre hardware Blaize Xplorer; no se mencionan vLLM, llama.cpp, Ollama ni TGI (no aplican a un modelo de visión).
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Tipo | Resolución de entrada | Cuantización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| YOLOPOSE26s_COCOKeypoint (este) | YOLO26s-pose optimizado para GSP | 640×384 / 640×640 | INT8, BF16, AMP | AGPL-3.0 | Hugging Face, formato `.bm` |
| YOLO26s-pose (Ultralytics, original) | YOLO26s-pose en PyTorch | no disponible en la información | no disponible | AGPL-3.0-only o licencia enterprise de Ultralytics | GitHub de Ultralytics |
| Otros modelos de pose de la familia YOLO | Detección de keypoints de una etapa | variable | variable | variable | no disponible en la información |

No se dispone de datos de rendimiento comparativo (mAP, latencia) en la información proporcionada para establecer una comparación cuantitativa con alternativas.

## Limitaciones y advertencias

- Dependencia de hardware: el formato `.bm` requiere un acelerador Blaize Xplorer y el SDK Picasso; no es portable a GPU o CPU sin reconversión.
- Licencia AGPL-3.0: el uso en servicios en red puede obligar a liberar el código fuente derivado; para uso comercial propietario habría que evaluar la licencia enterprise de Ultralytics del modelo original.
- Modelo de visión especializado: no ofrece generación de texto, razonamiento ni capacidades de lenguaje; no debe evaluarse como un LLM.
- Sesgos del dataset: COCO Keypoints 2017 presenta desequilibrios demográficos y de contextos; el rendimiento puede degradarse en posturas extremas, oclusiones severas o escenas no representadas.
- Riesgo de falsos positivos/negativos en escenas densas o con personas parcialmente visibles, inherente a los detectores de una etapa.
- Sin datos publicados de precisión (mAP) ni de latencia en este repositorio; no es posible validar el rendimiento real sin ejecutar sobre el hardware objetivo.
- El autor declara que Blaize no modifica el código fuente pero realiza optimizaciones específicas de hardware; no se garantiza la equivalencia exacta de resultados con el modelo original de Ultralytics.
- No se especifican idiomas ni contexto porque no aplican; cualquier uso que requiera comprensión semántica o textual queda fuera del alcance del modelo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Blaize-AI/YOLOPOSE26s_COCOKeypoint
- Repositorio original de Ultralytics: https://www.github.com/ultralytics/ultralytics
- Dataset COCO Keypoints: https://cocodataset.org
- Sitio de Blaize: https://www.blaize.com
