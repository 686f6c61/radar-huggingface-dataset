# APLUX-Agora/Dinov3-ViT-S-16

## Resumen

Dinov3-ViT-S-16 es un paquete de recursos de despliegue derivado del modelo DINOv3 ViT-S/16, publicado por APLUX-Agora dentro de su plataforma Agora. No se trata de un modelo entrenado desde cero por este autor, sino de una conversión y validación del modelo original de Meta AI para su ejecución optimizada sobre aceleradores Qualcomm (NPU Hexagon), con binarios específicos por System-on-Chip y precisiones cuantizadas.

El repositorio incluye artefactos listos para desplegar en placas comerciales basadas en QCS6490 y QCS8550, con latencias medidas en hardware real (8,5 ms y 4,8 ms respectivamente en la precisión por defecto). Esto lo hace relevante para proyectos de visión por computador en el borde (AIoT), donde el coste energético y la latencia determinista son críticos y no siempre se dispone de infraestructura GPU.

DINOv3 es un modelo de representación visual auto-supervisado que produce embeddings densos de imágenes, útil como extractor de características para tareas downstream (clasificación, segmentación, detección, recuperación). La variante ViT-S/16 corresponde a un Vision Transformer pequeño con parches de 16x16 píxeles. El paquete se publica bajo licencia Apache-2.0 para el modelo fuente, mientras que los recursos convertidos quedan sujetos a la licencia APLUX Model Farm.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision Transformer (ViT-S/16), auto-supervisado tipo DINOv3 |
| Parametros totales | no disponible (variante "S" de ViT, tamano pequeño; cifra exacta no publicada en la informacion) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo de visión, entrada de imagen) |
| Tipos de cuantizacion | FP16, W8A16, W8A8 (segun SoC) |
| Idiomas soportados | no disponible (modelo de visión, sin procesamiento de lenguaje) |
| Licencia | Apache-2.0 (modelo fuente); APLUX Model Farm License (recursos convertidos) |
| Formato de pesos | Binarios QNN (`model.bin`) por SoC y precisión; `model.json` de configuración por `targets/<SoC>/` |
| Tamano del repositorio | 0,1 GB |
| Entrada | imagen (`image`) |
| Salida | `out` (json) |

## Arquitectura y entrenamiento

El modelo base es un Vision Transformer pequeño (ViT-S) con parches de 16x16, entrenado con el paradigma auto-supervisado DINOv3. Este enfoque produce representaciones visuales densas y de propósito general sin necesidad de etiquetas, de modo que el modelo actúa como extractor de características que luego se utiliza en cabezas específicas para tareas downstream. La información disponible no detalla el número de tokens de entrenamiento, la composición del dataset ni si hubo fases de ajuste fino con RLHF o DPO (no aplicable en un modelo puramente visual).

La contribución del repositorio no es el entrenamiento, sino la conversión del modelo a formato QNN para su ejecución en la NPU Hexagon de Qualcomm, con variantes de precisión FP16, W8A16 y W8A8, y la validación por placa. Cada directorio `targets/<SoC>/` contiene un `model.json` con la precisión por defecto y las rutas de las variantes, además de los binarios correspondientes. Se incluyen también los pasos de preprocesado y postprocesado oficiales de Model Farm, el runner y un proyecto exportable.

## Capacidades

- Extracción de características visuales densas a partir de imágenes, gracias al preentrenamiento auto-supervisado DINOv3.
- Generación de embeddings de imagen para tareas downstream: clasificación, segmentación semántica, detección y recuperación por similitud.
- Inferencia optimizada en NPU Qualcomm (Hexagon) con binarios específicos por SoC.
- Ejecución en precisiones FP16, W8A16 y W8A8, con selección de variante por placa.
- Entrada de imagen y salida en formato JSON, adecuada para integración en pipelines de AIoT.
- No dispone de generación de texto, tool calling, agentes ni capacidades multilingües: es un modelo exclusivamente de visión.

## Casos de uso

- Inspección visual en línea de producción: el modelo extrae embeddings de cada imagen capturada por la cámara y una cabeza ligera clasifica defectos, ejecutándose en la NPU de un QCS6490 con latencia de 8,5 ms por imagen, compatible con cadencias industriales.
- Vigilancia y análisis de vídeo en el borde: al ejecutarse en placas QCS8550 a 4,8 ms por fotograma, permite procesar flujos de vídeo en tiempo real sin enviar datos a la nube, reduciendo ancho de banda y preservando la privacidad.
- Recuperación de imágenes por similitud: los embeddings densos de DINOv3 sirven para indexar catálogos de productos o imágenes médicas y realizar búsquedas vectoriales en dispositivos locales.
- Segmentación y detección asistida en robótica móvil: el extractor alimenta cabezas de segmentación para navegación y manipulación en robots con SoC Qualcomm, donde el consumo energético es limitado.
- Preprocesado de datos en cámaras inteligentes: el modelo puede actuar como extractor de características en el propio dispositivo para tareas de filtrado o etiquetado previo antes de un procesamiento posterior.
- Prototipado rápido en AIoT: la plataforma Agora permite probar el modelo online sin disponer de placa física, y exportar el proyecto con el runner y el pre/postprocesado ya incluidos, acortando el ciclo de integración.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Los únicos datos de rendimiento son las latencias medidas en hardware real:

| SoC · placa | Precisiones | Latencia (precision por defecto) |
|---|---|---|
| QCS6490 · Rhino Pi A1 | W8A16, W8A8 | 8,5 ms |
| QCS8550 · Rhino Pi X1 | FP16, W8A16, W8A8 | 4,8 ms |

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica; el modelo se ejecuta en NPU Qualcomm, no en GPU.
- GPU recomendadas: no aplica para este paquete (binarios QNN para Hexagon).
- Cabe en consumer GPU: no disponible; el repositorio está orientado a placas AIoT con SoC Qualcomm.
- Placas validadas: QCS6490 (Rhino Pi A1) y QCS8550 (Rhino Pi X1).
- Opciones de despliegue: runner de Model Farm incluido en el repositorio; descarga selectiva por SoC mediante `hf download` con el patrón `targets/$AGORA_SOC/*`.
- Latencia: 8,5 ms en QCS6490 y 4,8 ms en QCS8550 con la precisión por defecto.
- Throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Arquitectura | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Dinov3-ViT-S-16 (este paquete) | ViT-S/16 DINOv3, binarios QNN | no disponible | no aplica (visión) | Apache-2.0 + APLUX Model Farm | Hugging Face, plataforma Agora |
| DINOv3 ViT-S/16 original (Meta AI) | ViT-S/16 DINOv3 | no disponible en la informacion | no aplica (visión) | no disponible en la informacion | no disponible en la informacion |
| Otros extractores visuales auto-supervisados (p. ej. DINOv2) | ViT | no disponible en la informacion | no aplica (visión) | no disponible en la informacion | no disponible en la informacion |

La información proporcionada no incluye datos suficientes para una comparativa cuantitativa con alternativas; los datos de parámetros, contexto y rendimiento de los modelos comparables no están disponibles.

## Limitaciones y advertencias

- El repositorio contiene recursos de despliegue, no el modelo original entrenado; para reproducir resultados es necesario usar el runner y el pre/postprocesado oficiales de Model Farm.
- Los binarios están ligados a SoC concretos (QCS6490, QCS8550); no son portables a otras plataformas sin reconversión.
- La licencia de los recursos convertidos es la APLUX Model Farm License, distinta de la Apache-2.0 del modelo fuente; es necesario revisar `LICENSE_MODEL_FARM.pdf` antes de un uso comercial.
- No se documentan sesgos, riesgos de alucinación ni limitaciones idiomáticas porque el modelo es puramente visual y la información disponible no los detalla.
- No hay datos publicados sobre robustez ante dominios fuera de distribución, ni sobre el impacto de la cuantización W8A8 en la calidad de los embeddings.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no existe validación comunitaria independiente.
- La fecha de creación del repositorio es posterior a la fecha actual de referencia; conviene verificar la vigencia de los artefactos antes de integrarlos en producción.

## Enlaces

- Hugging Face: https://huggingface.co/APLUX-Agora/Dinov3-ViT-S-16
- Plataforma Agora (prueba online): https://mega.aidlux.com/models/dinov3-vit-s-16
- Sitio de Agora: https://mega.aidlux.com
- Licencia del modelo fuente: Apache-2.0 (ver LICENSE en el repositorio)
- Licencia de recursos convertidos: LICENSE_MODEL_FARM.pdf (incluido en el repositorio)
- Integridad: NOTICE.md y SHA256SUMS (incluidos en el repositorio)
