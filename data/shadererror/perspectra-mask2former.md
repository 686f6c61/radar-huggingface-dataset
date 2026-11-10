# ShaderError/perspectra-mask2former

## Resumen

Perspectra-mask2former es una redistribucion en formato ONNX del modelo Mask2Former con backbone Swin-Tiny, entrenado originalmente por Meta AI sobre el dataset ADE20K para segmentacion semantica. El autor del repositorio, ShaderError, lo publica como artefacto listo para consumir desde el add-on de Blender llamado Perspectra, sin reentrenamiento ni modificacion de pesos: se trata de una conversion de formato y empaquetado. El modelo resultante acepta entradas de 512 x 512 pixeles y produce mascaras semanticas sobre las clases de ADE20K.

El interes practico esta en que permite segmentar escenas (personas, cielo, agua, vegetacion) dentro de un flujo de trabajo de Blender, lo que facilita tareas como el matting, la separacion de capas o la asignacion automatica de materiales. Al estar en ONNX, se puede ejecutar con ONNX Runtime en CPU o GPU sin depender del ecosistema PyTorch completo, lo que simplifica su integracion en un plugin de escritorio.

La relevancia es acotada: no es un modelo nuevo ni un avance en el estado del arte, sino un empaquetado de conveniencia. Su valor depende enteramente de la utilidad del add-on Perspectra y de la fidelidad de la conversion a ONNX respecto al modelo original de Meta AI.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mask2Former (Masked-attention Mask Transformer) con backbone Swin-Tiny |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo de vision, no de texto) |
| Tipos de cuantizacion | no disponible (el unico artefacto publicado es un ONNX de 193 MB) |
| Idiomas soportados | no disponible (no procesa texto; clases de ADE20K en ingles) |
| Licencia | MIT |
| Formato de pesos | ONNX (`mask2former_swint_ade_512.onnx`, 193 MB) |

## Arquitectura y entrenamiento

Mask2Former es un transformer de segmentacion universal presentado en el paper de Cheng et al. (CVPR 2022). Combina un backbone convolucional o jerarquico (aqui Swin-Tiny) que extrae caracteristicas multi-escala, un pixel decoder que las fusiona, y un transformer decoder con masked attention que predice un conjunto de mascaras y sus etiquetas de clase. La innovacion central del modelo original es el uso de masked attention para restringir la atencion cruzada a la region de la mascara predicha en la iteracion anterior, lo que acelera la convergencia y mejora la calidad frente a DETR y sus variantes.

En este repositorio no hay entrenamiento propio: los pesos proceden de `facebook/mask2former-swin-tiny-ade-semantic`, entrenado sobre ADE20K para segmentacion semantica. El autor solo realiza la conversion a ONNX con entrada fija de 512 x 512 y la publica para el add-on Perspectra. No se documentan en la model card detalles sobre el proceso de exportacion, la opset de ONNX utilizada ni las metricas de fidelidad de la conversion.

## Capacidades

- Segmentacion semantica de imagenes a 512 x 512 pixeles sobre las 150 clases de ADE20K.
- Generacion de mascaras especificas para personas, cielo, agua y vegetacion, que son las que el add-on Perspectra consume.
- Ejecucion via ONNX Runtime, lo que permite desplegarlo en CPU o GPU sin PyTorch.
- Integracion en el flujo de trabajo de Blender a traves del add-on Perspectra.
- No soporta tool calling, agentes, razonamiento multi-paso ni generacion de texto.
- No tiene capacidades multilingues ni procesamiento de lenguaje natural.
- No dispone de modo thinking, vision general, audio ni otras modalidades.

## Casos de uso

- Matting y separacion de personas en escenas renderizadas: el modelo genera una mascara de la clase "person" que se puede usar como canal alfa para aislar sujetos antes de la composicion en Blender.
- Reemplazo de cielo en postproduccion: la mascara de la clase "sky" permite sustituir el fondo celeste por un HDRI o una imagen de placa sin trabajo manual de rotoscopia.
- Aislamiento de vegetacion para ajustes de color: la mascara de "plant" o "tree" facilita aplicar correcciones de tono o desaturacion selectiva sobre la vegetacion de una escena.
- Segmentacion de cuerpos de agua en planos de paisaje: la clase "water" permite tratar de forma independiente rios, lagos o mar para efectos de reflexion o color.
- Generacion de mascaras auxiliares para compositing en Blender: las salidas del modelo se pueden conectar al nodo de compositor para limitar efectos a regiones concretas.
- Preprocesado por lotes de imagenes de referencia: al ser un ONNX ligero, se puede ejecutar en un script de Python sobre carpetas de imagenes para generar mascaras antes de importarlas al proyecto.
- Prototipado rapido de herramientas de segmentacion dentro del add-on Perspectra: sirve como base para validar el flujo de inferencia ONNX antes de sustituir el modelo por uno mas grande.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas de mIoU, latencia ni comparaciones con el modelo original de Meta AI.

## Requisitos de hardware

- VRAM estimada: no disponible de forma oficial. El artefacto ONNX ocupa 193 MB, por lo que la inferencia en FP32 requiere del orden de 1 a 2 GB de memoria incluyendo activaciones a 512 x 512, aunque esta cifra es una estimacion y no un dato publicado.
- GPU recomendadas: no disponible. Al ser un modelo pequeno (Swin-Tiny), cabe en cualquier GPU consumer con al menos 4 GB de VRAM.
- Cabe en GPU consumer: si, previsiblemente en GTX 1650, RTX 3050, RTX 4060 y superiores.
- Opciones de despliegue: ONNX Runtime (CPU o CUDA), integracion directa en el add-on Perspectra para Blender. No se documenta soporte de vLLM, llama.cpp, Ollama ni TGI, que no aplican a un modelo de vision.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / entrada | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ShaderError/perspectra-mask2former | no disponible (Swin-Tiny) | 512 x 512 | Segmentacion semantica ADE20K | MIT | ONNX en HF |
| facebook/mask2former-swin-tiny-ade-semantic | no disponible (Swin-Tiny) | dinamica | Segmentacion semantica ADE20K | MIT | PyTorch en HF |
| facebook/mask2former-swin-base-ade-semantic | no disponible (Swin-Base) | dinamica | Segmentacion semantica ADE20K | MIT | PyTorch en HF |
| nvidia/segformer-b0-finetuned-ade-512-512 | no disponible (MiT-B0) | 512 x 512 | Segmentacion semantica ADE20K | NVIDIA Source Code License | PyTorch en HF |

La comparativa se limita a la familia Mask2Former y a SegFormer, que son las alternativas directas para segmentacion semantica en ADE20K. Este repositorio es funcionalmente equivalente al modelo original de Meta AI, con la diferencia de estar exportado a ONNX y fijado a 512 x 512.

## Limitaciones y advertencias

- Es una redistribucion, no un modelo nuevo: cualquier limitacion del Mask2Former original se hereda sin cambios.
- Resolucion de entrada fija a 512 x 512; no se documenta si el ONNX admite tamanos dinamicos.
- Solo cubre las 150 clases de ADE20K; las clases fuera de ese vocabulario no se segmentan correctamente.
- No se documenta el proceso de exportacion a ONNX ni la fidelidad numerica respecto al modelo PyTorch original, por lo que puede haber degradacion no cuantificada.
- Riesgo de alucinacion en el sentido de mascaras erroneas en escenas fuera de dominio (imagenes sinteticas, renders no fotorealistas, iluminacion extrema).
- Sesgos del dataset ADE20K: sobrerrepresentacion de escenas interiores y paisajes de ciertas regiones; posible peor rendimiento en contextos culturalmente distintos.
- La licencia MIT permite uso comercial, pero conviene mantener la atribucion a Meta AI y a los autores del paper.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, sin senales de validacion por parte de la comunidad.
- No hay garantia de mantenimiento ni de soporte por parte del autor.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/ShaderError/perspectra-mask2former
- Repositorio original de Mask2Former (Meta AI): https://github.com/facebookresearch/Mask2Former
- Pesos originales: https://huggingface.co/facebook/mask2former-swin-tiny-ade-semantic
- Paper: Cheng et al., Masked-attention Mask Transformer for Universal Image Segmentation, CVPR 2022 (https://arxiv.org/abs/2112.01527)
- Add-on Perspectra para Blender: no disponible en la informacion proporcionada.
