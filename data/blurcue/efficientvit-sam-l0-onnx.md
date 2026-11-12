# BlurCue/efficientvit-sam-l0-onnx

## Resumen

EfficientViT-SAM-L0 ONNX es un espejo (mirror) de los pesos ONNX exportados por el MIT HAN Lab del modelo EfficientViT-SAM-L0, publicado por el usuario BlurCue. El modelo original combina un encoder EfficientViT (una familia de transformers eficientes para visión) con el decodificador de Segment Anything (SAM) para realizar segmentación de imágenes guiada por cajas (box prompts). El repositorio no introduce cambios en los pesos: se trata de una copia byte a byte de los grafos ONNX del autor original, con licencia Apache-2.0.

El paquete incluye dos grafos ONNX separados: un encoder que calcula un embedding de imagen reutilizable y un decodificador que, a partir de un box prompt, genera una máscara de segmentación. Esta separación permite reutilizar el embedding entre múltiples prompts sobre la misma imagen, lo que reduce el coste computacional en escenarios con muchas consultas.

La relevancia de este repositorio es logística más que técnica: ofrece los grafos ONNX en un paquete verificable (con longitudes de bytes y hashes SHA-256 en un manifiesto), lo que facilita su despliegue en runtimes ONNX sin depender de conversiones propias. No se dispone de información sobre el número de parámetros, la longitud de contexto (no aplica en un modelo de visión) ni los datos de entrenamiento en la información proporcionada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | EfficientViT (encoder) + decodificador SAM; exportación ONNX |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo de visión, sin procesamiento de lenguaje) |
| Licencia | Apache-2.0 |
| Formato de pesos | ONNX (encoder y decoder separados) |

## Arquitectura y entrenamiento

El modelo original EfficientViT-SAM, descrito en el paper arXiv:2402.05008, sustituye el encoder ViT pesado de SAM por un encoder EfficientViT, una arquitectura de atención lineal diseñada para reducir el coste computacional manteniendo la calidad de las representaciones. El pipeline se divide en dos etapas: el encoder produce un embedding de la imagen que puede reutilizarse, y el decodificador consume ese embedding junto con un box prompt para generar la máscara correspondiente. Esta separación es la que se refleja en los dos grafos ONNX del repositorio.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron técnicas de RLHF o DPO (no aplicables en un modelo de segmentación). El repositorio es un espejo byte a byte de los pesos originales del MIT HAN Lab, por lo que las características de entrenamiento son las del modelo upstream, no las de esta publicación.

## Capacidades

- Generación de máscaras de segmentación a partir de box prompts sobre imágenes.
- Cálculo de embeddings de imagen reutilizables entre múltiples prompts (encoder independiente del decoder).
- Ejecución mediante runtime ONNX, sin dependencia de PyTorch en inferencia.
- Verificación de integridad de los pesos mediante manifiesto con longitudes de bytes y hashes SHA-256.
- No soporta tool calling, agentes, razonamiento multi-paso ni capacidades multilingües: es un modelo puramente visual de segmentación.
- No dispone de modo thinking, visión generativa, audio ni generación de texto.

## Casos de uso

- Segmentación interactiva en herramientas de anotación: el encoder calcula el embedding una vez por imagen y el decoder genera máscaras para cada box prompt, lo que agiliza el etiquetado de datasets de visión por computador.
- Preprocesado en pipelines de detección: usar las máscaras generadas para recortar regiones de interés antes de pasarlas a un clasificador o detector posterior.
- Despliegue en entornos con runtime ONNX: integración en servicios escritos en C++, C# o Java mediante ONNX Runtime, sin necesidad de un stack de PyTorch.
- Segmentación en aplicaciones de edición de imagen: generar máscaras precisas a partir de selecciones rectangulares del usuario para operaciones de recorte o sustitución de fondo.
- Automatización de control de calidad industrial: segmentar piezas o regiones delimitadas por cajas en imágenes de inspección para medir áreas o detectar defectos.
- Verificación de integridad en producción: el manifiesto con hashes SHA-256 permite validar que los pesos desplegados coinciden con los originales del MIT HAN Lab antes de poner el modelo en servicio.
- Prototipado rápido en investigación: al ser un espejo del export oficial, sirve como referencia para comparar implementaciones propias de EfficientViT-SAM sin riesgo de discrepancias en los pesos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible en la información proporcionada; el tamaño del repositorio es de 0,1 GB, lo que sugiere un modelo de pequeño tamaño, pero no se especifica la VRAM de inferencia.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no disponible; el formato ONNX permite ejecución en CPU y en GPU mediante ONNX Runtime, pero no se detallan requisitos concretos.
- Opciones de despliegue: ONNX Runtime (CPU o GPU), dado que los pesos se distribuyen exclusivamente en formato ONNX.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Arquitectura | Formato | Licencia | Contexto / tarea | Disponibilidad |
|---|---|---|---|---|---|
| EfficientViT-SAM-L0 ONNX (este repo) | EfficientViT + decoder SAM | ONNX | Apache-2.0 | Segmentación con box prompts | Hugging Face (espejo) |
| EfficientViT-SAM (MIT HAN Lab, original) | EfficientViT + decoder SAM | PyTorch / ONNX | Apache-2.0 | Segmentación con box prompts | Hugging Face (upstream) |
| SAM (Meta) | ViT + decoder | PyTorch | Apache-2.0 | Segmentación con prompts | Hugging Face / GitHub |
| SAM 2 (Meta) | ViT + memory | PyTorch | Apache-2.0 | Segmentación de imagen y vídeo | Hugging Face / GitHub |

La comparación se limita a la arquitectura y la licencia: no se dispone de datos de parámetros ni de rendimiento para este repositorio ni para las alternativas en la información proporcionada.

## Limitaciones y advertencias

- Es un espejo de pesos, no un modelo entrenado por el publicador: cualquier sesgo o limitación del modelo original EfficientViT-SAM se hereda sin cambios.
- No se dispone de información sobre sesgos conocidos ni sobre la composición del dataset de entrenamiento original.
- Riesgo de alucinación: no aplica en el sentido generativo, pero las máscaras pueden ser imprecisas en imágenes fuera de la distribución de entrenamiento o con box prompts ambiguos.
- El modelo solo acepta box prompts según la model card; no se documentan otros tipos de prompt (puntos, máscaras) en esta exportación.
- No procesa lenguaje: no soporta instrucciones en texto ni capacidades multilingües.
- Licencia Apache-2.0: permite uso comercial, pero se recomienda conservar el aviso de licencia y el manifiesto de verificación incluidos en el paquete.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no hay validación comunitaria del espejo más allá de los hashes declarados.
- No se especifican requisitos de hardware ni latencias, lo que dificulta planificar un despliegue en producción sin pruebas propias.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/BlurCue/efficientvit-sam-l0-onnx
- Modelo original (MIT HAN Lab, revisión fijada): https://huggingface.co/mit-han-lab/efficientvit-sam/tree/b6151036baca14445eeec84fe854ff862a1a407c/onnx
- Paper: https://arxiv.org/abs/2402.05008
- Licencia del código fuente original: https://github.com/mit-han-lab/efficientvit/blob/de7d7733cc0329f391b33f1f459271562ec27bd5/LICENSE
