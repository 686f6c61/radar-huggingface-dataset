# obuladinnesai/claim-photo-integrity-detector-v5

## Resumen

Claim Photo Integrity Detector v5 es un modelo de clasificación de imágenes desarrollado por el usuario obuladinnesai, especializado en verificar la integridad de fotografías adjuntas a partes de siniestros. Su tarea es distinguir entre una foto "real" y una foto "falsa" o manipulada, tanto si procede íntegramente de un generador de imágenes como si ha sufrido una edición localizada mediante inpainting. Está pensado como una señal de triaje para revisión humana dentro de flujos de seguros y gestión de reclamaciones, no como una prueba de fraude.

El modelo es un Vision Transformer (ViT) con 85.800.194 parámetros (aproximadamente el tamaño de un ViT-Base), distribuido en formato safetensors y con un repositorio de 0,3 GB. Se publica bajo licencia Apache 2.0, lo que facilita su integración en productos comerciales, aunque las licencias de los conjuntos de datos de entrenamiento imponen condiciones adicionales que conviene revisar antes de un despliegue en producción.

Su relevancia radica en el problema concreto que aborda la versión 5: la versión anterior (v4) superaba una prueba real de 5/5 imágenes, pero solo detectaba 3 de 18 falsificaciones localizadas por inpainting, etiquetando el resto como "real" con una confianza cercana al 99,9 %. La v5 incorpora 400 ejemplos de inpainting localizado generados a partir de fotografías del propio autor para corregir ese punto ciego, manteniendo el conjunto de evaluación adversarial en cuarentena y fuera del entrenamiento.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Vision Transformer (ViT), según los tags del repositorio (vit, vision-transformer) |
| Parámetros totales | 85.800.194 |
| Parámetros activos | No aplica (modelo denso, no es MoE) |
| Longitud de contexto | No aplica (modelo de clasificación de imágenes, sin ventana de contexto textual) |
| Tipos de cuantización | No disponible |
| Idiomas soportados | No disponible (modelo de visión; no se documenta procesamiento de texto) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La información disponible identifica el modelo como un Vision Transformer, con 85.800.194 parámetros y etiquetas explícitas de "vit" y "vision-transformer". No se detallan en la model card el número de capas, la dimensión de los embeddings, el tamaño del parche, la resolución de entrada ni la función de pérdida. Tampoco se especifican hiperparámetros de entrenamiento, épocas ni pasos.

El entrenamiento es un fine-tuning continuado de la versión v4. La mezcla de datos declarada combina tres conjuntos públicos: Rajarshi-Roy-research/Defactify_Image_Dataset, TheKernel01/140k-Real-and-Fake-Faces y OpenRL/DeepFakeFace, a los que se añaden 400 falsificaciones localizadas generadas por inpainting con Stable Diffusion a partir de fotografías del propio constructor. Cada uno de estos pares enseña un contraste explícito: la foto original se etiqueta como "real" y su gemela editada localmente como "falsa". El conjunto de evaluación adversarial se mantiene en cuarentena y no participa en el entrenamiento. Se conserva el aumento de datos ya presente en versiones anteriores: recompresión JPEG, ruido, desenfoque, variaciones de brillo y contraste, y volteos.

No se documenta ningún proceso de RLHF, DPO ni ajuste por preferencias humanas, algo coherente con un clasificador de imágenes. Tampoco se describe ninguna innovación de decodificación o atención (no hay decodificación especulativa ni atención lineal) más allá del enfoque de aprendizaje por pares contrastivos.

## Capacidades

- Clasificación binaria de imágenes en las categorías "real" y "falsa" (etiquetas exactas no especificadas en la model card).
- Detección de imágenes completamente sintéticas procedentes de generadores, según los conjuntos de datos de entrenamiento declarados.
- Detección de manipulaciones localizadas por inpainting, incluyendo daños de vehículo añadidos, eliminados o exagerados, que es la mejora principal de la v5 respecto a la v4.
- Emisión de una puntuación de confianza por clase (la model card menciona etiquetas con confianza del orden del 99,9 % en los falsos negativos de la v4, lo que implica que el modelo devuelve probabilidades).
- Integración directa con la librería Transformers mediante el pipeline `image-classification`.
- No se documenta soporte de tool calling, function calling, uso como agente, razonamiento multi-paso, capacidades multilingües ni modos de pensamiento. Es un clasificador de visión de propósito específico.

## Casos de uso

- Triaje de partes de siniestros de automóvil: el modelo clasifica la foto de daños adjunta antes de que un perito la revise, de modo que solo los casos con señal de manipulación pasan a una cola de verificación prioritaria.
- Detección de daño añadido o exagerado: gracias a los 400 pares de inpainting localizado del entrenamiento, puede señalar fotos donde se ha insertado un golpe inexistente o se ha intensificado el daño para inflar la indemnización.
- Detección de daño eliminado: el mismo mecanismo permite detectar fotos donde se ha borrado un desperfecto previo para ocultar el estado real del vehículo en el momento del siniestro.
- Filtrado previo en la recepción de reclamaciones: como paso automático en el formulario web o en la app móvil, se puede marcar la imagen en el momento de la subida y solicitar documentación adicional si la señal es sospechosa.
- Auditoría por lotes de carteras de siniestros: al ser un modelo de 85,8 millones de parámetros y 0,3 GB, se puede ejecutar en GPU de gama media o incluso en CPU sobre lotes históricos para detectar patrones de manipulación en reclamaciones ya cerradas.
- Verificación de fotos en seguros de hogar, alquiler de vehículos o siniestros de flotas: cualquier flujo donde el asegurado aporte evidencia fotográfica propia y exista incentivo económico para editarla.
- Despliegue como microservicio interno de integridad de imagen: el pipeline de Transformers permite exponer el modelo detrás de una API que devuelva etiqueta y confianza, integrándose en el sistema de gestión de siniestros existente.
- Señal auxiliar para el perito humano: la salida del modelo no sustituye la decisión del perito, sino que aporta un indicador cuantitativo adicional junto al resto de la documentación del expediente.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks cuantitativos para la versión v5 en la información disponible. La model card únicamente describe de forma cualitativa el fallo de la versión anterior, que sí conviene registrar como contexto:

| Modelo | Prueba | Resultado reportado |
|---|---|---|
| v4 | Test real-world reservado | 5 de 5 correctas |
| v4 | Sonda adversarial de inpainting localizado | 3 de 18 falsificaciones detectadas; el resto etiquetadas como "real" con ~99,9 % de confianza |
| v5 | Benchmarks publicados | No disponible (la model card no reporta métricas de la v5) |

No se proporcionan valores de exactitud, precisión, recall, F1, AUC ni matrices de confusión para la v5, ni comparaciones con otros detectores de deepfake.

## Requisitos de hardware

- VRAM estimada: el modelo tiene 85.800.194 parámetros. En precisión fp32 supondría aproximadamente 0,34 GB solo de pesos, y en fp16 alrededor de 0,17 GB. Sumando activaciones y overhead del framework, menos de 1 GB es suficiente. Es una estimación calculada a partir del recuento de parámetros, no un dato publicado.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM. Funciona sin problemas en RTX 3060, RTX 4060, RTX 4090, A100 o H100, aunque estas últimas están sobredimensionadas para este modelo.
- Cabe en GPU de consumo: sí, en prácticamente cualquier GPU consumer de los últimos ocho años, e incluso en CPU para inferencia por lotes pequeños.
- Opciones de despliegue: pipeline `image-classification` de la librería Transformers sobre PyTorch, con los pesos en safetensors. No se documenta soporte para vLLM, llama.cpp, Ollama o TGI; estos motores están orientados a modelos de lenguaje y no aplican directamente a un clasificador de imágenes ViT. La exportación a ONNX no está documentada.
- Latencia y throughput: no disponibles. No se publican mediciones de latencia por imagen ni de imágenes por segundo en ninguna GPU concreta.
- Almacenamiento: el repositorio ocupa 0,3 GB, por lo que el despliegue en contenedor es ligero.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| claim-photo-integrity-detector-v5 | 85,8 M | No aplica | No publicado para v5 | Apache 2.0 | HuggingFace (0 descargas, 0 likes en el momento de la consulta) |
| claim-photo-integrity-detector-v4 | No disponible | No aplica | 5/5 en test real; 3/18 en sonda adversarial de inpainting | No disponible | Versión anterior del mismo autor |
| Otros detectores de deepfake de la misma categoría | No disponible | No aplica | No disponible | No disponible | No se dispone de datos verificados en la información proporcionada |

No se han encontrado en la información disponible comparativas verificadas con modelos de terceros de la misma categoría (detección de imágenes generadas o manipuladas), por lo que no se incluyen cifras de otros detectores.

## Limitaciones y advertencias

- La propia model card lo define como una señal de triaje para revisión humana, no como prueba de fraude. Ninguna decisión automatizada debería tomarse únicamente con su salida.
- La precisión se degrada frente a generadores y tipos de edición más recientes que los presentes en los datos de entrenamiento. Al ser un modelo de octubre de 2026 entrenado sobre conjuntos de datos públicos y 400 ejemplos propios, su cobertura de nuevos modelos generativos es incierta.
- La corrección del punto ciego de inpainting se basa en 400 ejemplos generados a partir de fotografías del propio constructor, un volumen reducido que puede no generalizar a otros dominios, resoluciones, cámaras o estilos de edición.
- Las licencias de los conjuntos de datos deben revisarse antes de un uso comercial: la model card advierte explícitamente sobre 140k (CC) y DeepFakeFace (OpenRAIL), que imponen condiciones distintas a la Apache 2.0 del modelo.
- No se documentan sesgos demográficos, geográficos o de dominio. Un detector de este tipo puede comportarse de forma desigual según el tipo de vehículo, la iluminación o las características de la cámara.
- Riesgo de falsos positivos y falsos negativos: los falsos negativos de la v4 se emitían con confianza cercana al 99,9 %, lo que indica que el modelo puede estar muy seguro y equivocado. No se publican métricas de calibración para la v5.
- El repositorio no tiene descargas ni likes, y no hay validación independiente de terceros sobre su rendimiento real.
- No hay información sobre idiomas ni sobre procesamiento de texto: cualquier metadato textual del expediente queda fuera del alcance del modelo.
- No se documentan cuantizaciones soportadas, por lo que el despliegue en entornos con memoria muy restringida requeriría una conversión manual no verificada.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/obuladinnesai/claim-photo-integrity-detector-v5
- Conjunto de datos Rajarshi-Roy-research/Defactify_Image_Dataset: referenciado en la model card, sin enlace directo proporcionado
- Conjunto de datos TheKernel01/140k-Real-and-Fake-Faces: referenciado en la model card, sin enlace directo proporcionado
- Conjunto de datos OpenRL/DeepFakeFace: referenciado en la model card, sin enlace directo proporcionado

Los resultados de la búsqueda web realizada no contienen enlaces relevantes para este modelo: se trata de dominios de chat genéricos (chat.com, chatgpt.com, chatib.chat) sin relación con el detector de integridad fotográfica.
