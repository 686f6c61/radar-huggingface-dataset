# JunlongLiu/fhwa-ear-multimodal-segformer-b5

## Resumen

El modelo `fhwa-ear-multimodal-segformer-b5` es un checkpoint de investigación para segmentación de deterioros en pavimentos, desarrollado por JunlongLiu en el marco del proyecto FHWA EAR Pavement AI (acuerdo 693JJ32350032). Se trata de una adaptación multimodal de la arquitectura SegFormer-B5 que combina entradas 2D en escala de grises con mapas de profundidad 3D alineados para predecir clases de deterioro superficial en firmes de carretera.

El modelo resuelve un problema específico de visión por computador aplicada a infraestructura civil: la inspección automatizada del estado del pavimento mediante la fusión de información de intensidad y geométrica. La variante B5 de SegFormer corresponde al mayor de la familia, con un backbone de tipo transformer jerárquico sin positional encodings fijos y un decodificador ligero tipo MLP.

La relevancia de este checkpoint es limitada y acotada al ámbito de la investigación: cuenta con cero descargas y cero likes en Hugging Face en el momento de la consulta, el repositorio pesa 0,7 GB y la model card no asigna ninguna puntuación de evaluación verificada a este fichero concreto. El autor lo describe explícitamente como un artefacto experimental.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | SegFormer-B5 multimodal (transformer jerarquico + decodificador MLP) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo de segmentacion de imagen, no de texto) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (tarea de vision, no linguistica) |
| Licencia | no disponible |
| Formato de pesos | PyTorch (`checkpoint.pth`) |

## Arquitectura y entrenamiento

La arquitectura se basa en SegFormer, un transformer jerárquico para segmentación semántica que combina un encoder tipo Mix Transformer (MiT) con un decodificador ligero basado en MLP. La variante B5 es la de mayor capacidad de la familia original. En este caso, el modelo se ha adaptado para aceptar dos modalidades de entrada: imágenes 2D en escala de grises y mapas de profundidad 3D alineados espacialmente, que se fusionan para predecir las clases de deterioro del pavimento.

No se dispone de información sobre el volumen de datos de entrenamiento, la composición del dataset, el número de tokens o muestras procesadas, ni sobre si se aplicaron técnicas de ajuste fino supervisado adicionales, RLHF o DPO. El autor remite al código fuente del repositorio de GitHub para verificar el preprocesamiento y el orden de las clases antes de la inferencia. El checkpoint incluye un hash SHA-256 (`25d9281d6ddcb4e5ae0a86b5d3aeed29b9c01d78f5bd9b9bc04611351eac67a1`) para verificación de integridad.

## Capacidades

- Segmentación semántica de imágenes de pavimento a partir de entradas multimodales (2D en escala de grises y 3D de profundidad).
- Clasificación de deterioros superficiales del firme según un conjunto de clases definido en el código fuente (no documentado en la model card).
- Fusión de información de intensidad y geométrica para mejorar la discriminación de defectos.
- Inferencia sobre imágenes alineadas 2D/3D, requiriendo un preprocesamiento específico no incluido en el repositorio de Hugging Face.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni capacidades multilingües, al ser un modelo puramente de visión.
- No dispone de modo thinking, visión general, audio ni otras capacidades más allá de la segmentación.

## Casos de uso

- Inspección automatizada de firmes: el modelo puede procesar pares de imagen 2D y mapa de profundidad capturados por sistemas de auscultación para generar máscaras de deterioro que alimenten inventarios de conservación vial. Es adecuado por su diseño específico para esta tarea, aunque requiere validación previa del preprocesamiento.
- Investigación en visión multimodal aplicada a infraestructura: sirve como punto de partida para experimentos de fusión de modalidades en segmentación de superficies, dado que el checkpoint es un artefacto de investigación abierto a análisis.
- Reproducción de resultados del proyecto FHWA EAR: útil para investigadores que quieran replicar o comparar los resultados publicados en el repositorio de resultados del proyecto, siempre que se verifique la coincidencia de evaluación.
- Detección de grietas y baches en laboratorio: con imágenes controladas y mapas de profundidad sintéticos o de alta precisión, puede emplearse para estudiar la contribución de la modalidad 3D frente a la 2D en la detección de defectos.
- Docencia y formación en segmentación semántica: como ejemplo de adaptación multimodal de SegFormer, puede utilizarse en cursos de visión por computador para ilustrar pipelines de fusión de entradas.
- Benchmark interno de modelos de segmentación de pavimentos: sirve como referencia base para comparar arquitecturas alternativas en el mismo dominio, aunque carece de métricas publicadas verificadas para este fichero concreto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente que no asigna una puntuación de evaluación a este fichero exacto sin una coincidencia de evaluación verificada, y remite al repositorio de resultados del proyecto para consultar las condiciones de evaluación.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. El repositorio pesa 0,7 GB, lo que sugiere que el checkpoint en precisión original podría requerir del orden de 1 a 2 GB de VRAM para pesos, más memoria adicional para activaciones según la resolución de entrada.
- GPU recomendadas: no disponibles. Por el tamaño del checkpoint, es plausible que quepa en GPUs de consumo como RTX 3060 o superiores, pero no hay confirmación oficial.
- Cabe en GPU de consumo: probablemente sí, dado el tamaño del repositorio, aunque no verificado.
- Opciones de despliegue: al ser un checkpoint PyTorch (`.pth`), requiere cargarlo con PyTorch y el código fuente del proyecto. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no aplican a modelos de segmentación de imagen.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| fhwa-ear-multimodal-segformer-b5 | no disponible | no aplica | no disponible | no disponible | Hugging Face (0 descargas) |
| SegFormer-B5 original (NVlabs) | ~82 M | no aplica | métricas publicadas en ADE20K/Cityscapes | Apache 2.0 | Hugging Face, ampliamente usado |
| Otros modelos de segmentación de pavimentos | no disponible | no aplica | no disponible | variable | variable |

La comparación con el SegFormer-B5 original es la más directa por arquitectura, pero este checkpoint añade la modalidad 3D y está especializado en pavimentos, por lo que las métricas no son directamente comparables sin una evaluación en el mismo dataset.

## Limitaciones y advertencias

- La model card describe el checkpoint como un artefacto experimental sin puntuación de evaluación verificada para este fichero concreto.
- No se especifica la licencia, lo que impide determinar si el uso comercial está permitido.
- El preprocesamiento y el orden de las clases no están documentados en la model card; es imprescindible consultar el código fuente antes de la inferencia para evitar resultados incorrectos.
- No hay información sobre sesgos del dataset de entrenamiento ni sobre el dominio de aplicación exacto (tipo de pavimento, condiciones de captura, sensores empleados).
- Riesgo de alucinación y falsos positivos/negativos en la segmentación no cuantificado por falta de métricas publicadas.
- El modelo no es lingüístico, por lo que las limitaciones de idioma no aplican, pero sí las de generalización a otros dominios visuales distintos del pavimento.
- Cero descargas y cero likes sugieren ausencia de validación por parte de la comunidad; no debe usarse en producción sin una evaluación independiente.
- El repositorio tiene 0,7 GB y solo incluye el checkpoint `.pth`; no se proporcionan scripts de inferencia ni configuración de modelo en Hugging Face.

## Enlaces

- Hugging Face: https://huggingface.co/JunlongLiu/fhwa-ear-multimodal-segformer-b5
- Código fuente y notas de uso: https://github.com/JunlongCode/FHWA-EAR-Pavement-AI/tree/main/source-code/01-distress-segmentation
- Resultados del informe y condiciones de evaluación: https://github.com/JunlongCode/FHWA-EAR-Pavement-AI/tree/main/results
