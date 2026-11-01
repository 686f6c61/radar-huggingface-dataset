# r69shabh/efficientsam-10m-onnx-web

## Resumen

EfficientSAM 10M (ViT-T) ONNX es un espejo de los ficheros ONNX del modelo EfficientSAM en su variante más pequeña (ViT-T, aproximadamente 10 millones de parámetros), publicados originalmente por el equipo de Meta (Yunyang Xiong et al.) y exportados a ONNX por Kentaro Wada / labelmeai. Este repositorio no entrena ni modifica el modelo: aloja copias byte a byte idénticas de los ficheros que descarga la herramienta `osam`, con el objetivo de que un navegador pueda recuperarlos con cabeceras CORS habilitadas.

EfficientSAM es una familia de modelos de segmentación de imágenes que destila el comportamiento de SAM (Segment Anything Model) en arquitecturas mucho más ligeras, pensadas para inferencia en entornos con recursos limitados. La variante de 10M de parámetros está basada en un backbone ViT-Tiny y se distribuye en dos ficheros separados: un encoder y un decoder, ambos en formato ONNX.

La relevancia de este repositorio es operativa más que científica: permite ejecutar segmentación tipo SAM directamente en el navegador sin depender de servidores intermedios, algo útil para demos interactivas, herramientas de anotación y prototipos de edición de imagen en cliente. Al estar bajo licencia Apache-2.0, su uso comercial está permitido sin restricciones adicionales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | EfficientSAM (ViT-Tiny como backbone, destilación de SAM); exportado como encoder + decoder ONNX |
| Parametros totales | aproximadamente 10M (variante 10M / ViT-T) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión, no de texto) |
| Tipos de cuantizacion | no disponible (se distribuyen ficheros ONNX sin cuantizar declarada) |
| Idiomas soportados | no disponible (modelo de segmentación de imágenes, sin capacidades lingüísticas) |
| Licencia | Apache-2.0 |
| Formato de pesos | ONNX (encoder y decoder separados) |

## Arquitectura y entrenamiento

EfficientSAM sigue la estela de SAM pero sustituye el backbone ViT-H pesado por un ViT-Tiny, y se entrena mediante destilación desde el modelo SAM original para preservar la calidad de las máscaras con una fracción de los parámetros. La inferencia se divide en dos etapas: un encoder que procesa la imagen y produce embeddings, y un decoder que, a partir de esos embeddings y de las indicaciones del usuario (puntos, cajas o máscaras), genera la máscara de segmentación.

El repositorio no incluye información sobre el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF/DPO, ya que se trata de un espejo de pesos y no de una publicación de entrenamiento. Los detalles técnicos completos deben consultarse en el paper original de EfficientSAM y en el repositorio `labelmeai/efficient-sam`, del que proceden los ficheros exportados.

## Capacidades

- Segmentación de imágenes a partir de indicaciones (promptable segmentation): puntos, cajas delimitadoras y máscaras previas.
- Generación de máscaras de objetos en imágenes estáticas, con calidad derivada de la destilación de SAM.
- Ejecución en navegador mediante ONNX Runtime Web u otros runtimes ONNX en cliente.
- Separación encoder/decoder que permite cachear los embeddings de imagen y reutilizarlos para múltiples prompts sobre la misma imagen.
- No soporta generación de texto, tool calling, agentes ni razonamiento multi-paso.
- No dispone de capacidades multilingües ni de procesamiento de audio o vídeo.

## Casos de uso

- Demos interactivas en navegador: cargar una imagen y segmentar objetos con clics directamente en la página, sin backend, gracias a los ficheros ONNX servidos con CORS.
- Herramientas de anotación ligera: integrar el modelo en un editor web para pregenerar máscaras que el usuario refine, reduciendo el tiempo de etiquetado manual.
- Prototipos de edición de imagen en cliente: seleccionar regiones para recorte, borrado o reemplazo sin enviar la imagen a un servidor, lo que mejora la privacidad.
- Aplicaciones educativas: mostrar el funcionamiento de un modelo de segmentación promptable en un notebook o página web sin infraestructura GPU dedicada.
- Filtrado previo en pipelines de visión: usar las máscaras generadas como entrada para tareas posteriores (detección, clasificación por región) en entornos con recursos limitados.
- Pruebas de integración de `osam`: validar el flujo de descarga y ejecución de `efficientsam:10m` en entornos CI o demos reproducibles.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: muy baja; con 10M de parámetros, el modelo cabe holgadamente en cualquier GPU consumer e incluso puede ejecutarse en CPU.
- GPU recomendadas: no requiere GPU dedicada; funciona en RTX 4090, A100 o H100 sin aprovechar su capacidad, y es adecuado para GPUs integradas o CPU.
- Cabe en cualquier GPU consumer (GTX 1050, RTX 2060, etc.) y en navegadores modernos mediante WebGPU o WebAssembly.
- Opciones de despliegue: ONNX Runtime (Web, CPU, CUDA), `osam`, y cualquier runtime compatible con ONNX.
- Latencia y throughput: no disponibles en la información proporcionada; dependerán del hardware y del runtime empleado.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|
| EfficientSAM 10M (este) | ~10M | no aplica | Apache-2.0 | ONNX | HuggingFace (espejo) |
| SAM (ViT-H) | ~636M | no aplica | Apache-2.0 | PyTorch | Meta |
| SAM 2 | no disponible | no aplica | Apache-2.0 | PyTorch | Meta |
| MobileSAM | ~10M | no aplica | Apache-2.0 | PyTorch | GitHub |

La comparación con SAM y MobileSAM se basa en conocimiento general de la familia; los datos concretos de parámetros y licencias de los modelos alternativos no se han verificado en la información proporcionada.

## Limitaciones y advertencias

- Es un espejo de pesos, no un modelo entrenado ni validado por el autor del repositorio; la responsabilidad técnica recae en los autores originales.
- Al ser un modelo de segmentación, no genera texto ni mantiene conversaciones; no debe evaluarse con benchmarks de lenguaje.
- La variante de 10M de parámetros es la más ligera de la familia y ofrece menor calidad de máscara que variantes mayores de EfficientSAM o que SAM original.
- No se dispone de información sobre sesgos del dataset de entrenamiento ni sobre su comportamiento en dominios alejados de las imágenes naturales.
- La licencia Apache-2.0 permite uso comercial, pero conviene revisar las condiciones del proyecto `labelmeai/efficient-sam` y del paper original por si hubiera restricciones adicionales.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no hay evidencia de uso en producción.
- No se documentan procesos de cuantización ni versiones optimizadas para WebGPU; el rendimiento en navegador puede variar según el runtime.

## Enlaces

- HuggingFace: https://huggingface.co/r69shabh/efficientsam-10m-onnx-web
- Repositorio `osam`: https://github.com/wkentaro/osam
- Repositorio `labelmeai/efficient-sam`: https://github.com/labelmeai/efficient-sam
- Release de modelos ONNX: https://github.com/labelmeai/efficient-sam/releases/tag/onnx-models-20231225
- Space de demostración: https://huggingface.co/spaces/r69shabh/osam-demo
