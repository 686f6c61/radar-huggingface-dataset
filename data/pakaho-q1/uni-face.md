# Pakaho-q1/Uni-Face

## Resumen

Uni-Face es un proyecto de código abierto para el intercambio de rostros (face-swap) de alta velocidad y procesamiento por lotes, desarrollado por el usuario Pakaho-q1. El repositorio de HuggingFace aloja los modelos en formato ONNX junto con sus archivos `.hash` para verificación, que son utilizados por la herramienta CLI del proyecto. Incluye una colección de modelos conocidos en el ecosistema de face-swap, como `inswapper_128`, `simswap_256`, la serie `hyperswap`, `arcface` (w600k_r50), `gfpgan_1.4`, `codeformer`, `RestoreFormerPlusPlus`, `yoloface_8n`, `bisenet_resnet_34`, `xseg_1` y `gpen_bfr`.

El proyecto se presenta como una solución para tareas de intercambio facial en lote, con descarga dinámica de modelos a través de su interfaz de línea de comandos. Su relevancia radica en la agregación de múltiples modelos de face-swap y restauración facial en un solo repositorio, aunque su uso está estrictamente limitado a fines de investigación y no comercial debido a las licencias de los modelos subyacentes. No se proporcionan detalles sobre arquitectura, parámetros o rendimiento en la información disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (conjunto de modelos ONNX: inswapper, simswap, hyperswap, arcface, gfpgan, codeformer, etc.) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (modelos de imagen, no texto) |
| Tipos de cuantizacion | no disponible (se menciona `inswapper_128_fp16`, lo que sugiere variantes en precisión mixta) |
| Idiomas soportados | no disponible (modelos de imagen, sin soporte de lenguaje) |
| Licencia | no disponible para el repositorio en sí; los modelos individuales tienen licencias propias (mayoría no comercial, algunos permisivas, otros sin licencia localizada) |
| Formato de pesos | ONNX (con archivos `.hash` para verificación) |

## Arquitectura y entrenamiento

No se dispone de información detallada sobre la arquitectura de los modelos individuales. El repositorio agrupa varios modelos de face-swap y restauración facial, cada uno con su propia arquitectura y método de entrenamiento. Por ejemplo, `inswapper_128` se basa en el enfoque de InsightFace, `simswap_256` es un modelo de intercambio facial clásico, y `arcface` (w600k_r50) es un modelo de reconocimiento facial basado en ResNet-50. Los detalles de entrenamiento (número de tokens, composición del dataset, técnicas de alineación) no están disponibles en la información proporcionada.

El proyecto Uni-Face actúa como un orquestador que descarga y verifica estos modelos ONNX, permitiendo su uso en pipelines de procesamiento por lotes. No se mencionan innovaciones técnicas propias más allá de la integración y gestión de modelos existentes.

## Capacidades

- Intercambio de rostros (face-swap) en imágenes, con soporte para procesamiento por lotes.
- Restauración y mejora facial mediante modelos como GFPGAN, CodeFormer y RestoreFormerPlusPlus.
- Detección de rostros con YOLO (`yoloface_8n`).
- Segmentación de rostros con BiSeNet (`bisenet_resnet_34`).
- Extracción de embeddings faciales con ArcFace (`w600k_r50`).
- No se mencionan capacidades de texto, tool calling, agentes o razonamiento multimodal.

## Casos de uso

- Investigación académica en visión por computador: el modelo permite experimentar con técnicas de face-swap y restauración facial en entornos controlados, cumpliendo las restricciones de licencia no comercial.
- Desarrollo de prototipos de edición de imagen: los desarrolladores pueden integrar el pipeline de Uni-Face en aplicaciones de demostración para evaluar la viabilidad de face-swap en flujos de trabajo de imagen.
- Creación de datasets sintéticos para entrenamiento de otros modelos: el face-swap puede generar variaciones de identidad en imágenes, útil para aumentar conjuntos de datos en investigación.
- Restauración de fotografías antiguas o dañadas: los modelos GFPGAN y CodeFormer pueden emplearse para mejorar la calidad de rostros en imágenes históricas.
- Verificación de algoritmos de detección facial: la combinación de YOLO y BiSeNet permite probar pipelines de detección y segmentación de rostros.
- Evaluación comparativa de modelos de face-swap: al incluir múltiples variantes (inswapper, simswap, hyperswap), el repositorio facilita comparaciones de calidad y velocidad en tareas de intercambio facial.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No se proporcionan métricas de calidad (p. ej., FID, ID retrieval) ni de velocidad de inferencia.

## Requisitos de hardware

- No se especifican requisitos de VRAM ni GPU recomendadas en la documentación.
- Dado que los modelos están en formato ONNX, pueden ejecutarse en CPU o GPU mediante ONNX Runtime, pero se desconoce el consumo de memoria exacto.
- El tamaño del repositorio es de 11.2 GB, lo que sugiere que la descarga completa requiere espacio en disco considerable.
- No se mencionan opciones de despliegue específicas (vLLM, llama.cpp, etc.), ya que no es un modelo de lenguaje.
- La latencia y el throughput no están documentados.

## Comparativa con modelos similares

No se dispone de datos comparativos con otros proyectos de face-swap (p. ej., InsightFace, SimSwap, Roop). La información proporcionada no incluye métricas de rendimiento ni especificaciones técnicas que permitan una comparación rigurosa.

## Limitaciones y advertencias

- La mayoría de los modelos (inswapper, simswap, hyperswap, arcface, gfpgan, codeformer, RestoreFormerPlusPlus) están restringidos a uso no comercial, investigación y educación. Cualquier uso comercial infringe las licencias originales.
- Los modelos `xseg_1` y `gpen_bfr` no tienen licencia localizada, lo que genera incertidumbre legal sobre su uso.
- El repositorio no proporciona garantías de seguridad ni responsabilidad por el uso indebido. El face-swap puede emplearse para crear deepfakes sin consentimiento, lo que conlleva riesgos éticos y legales.
- No hay información sobre sesgos, alucinaciones o limitaciones de contexto, al ser modelos de imagen.
- La falta de documentación técnica detallada dificulta la evaluación de la calidad y robustez de los modelos.
- El proyecto parece estar en una fase temprana (0 descargas, 0 likes), por lo que su estabilidad y mantenimiento no están garantizados.

## Enlaces

- Repositorio de HuggingFace: https://huggingface.co/Pakaho-q1/Uni-Face
- Proyecto GitHub: https://github.com/Pakaho-q1/uni-face
- Repositorio de modelos ONNX adicionales: https://huggingface.co/Pakaho-q1/onnx-models
- API del proyecto: https://github.com/Pakaho-q1/uni-face/tree/main/api
