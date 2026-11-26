# mmachado53/sticker-studio-models

## Resumen

`sticker-studio-models` es un repositorio de Hugging Face publicado por el usuario mmachado53 que contiene un modelo de segmentación de imagen orientado a la eliminación de fondos, empaquetado en formato ONNX. No se trata de un modelo de lenguaje ni de un transformer generativo: es una exportación del modelo IS-Net "general use" del proyecto DIS (Highly Accurate Dichotomous Image Segmentation, Qin et al., ECCV 2022), tomado de las releases de rembg y adaptado para su ejecución en el navegador mediante onnxruntime-web dentro de la aplicación Sticker Studio.

El artefacto principal es `isnet-general-use-fp16.onnx`, un recorte de la salida final del modelo original convertido a fp16 en los pesos pero con entrada y salida en float32. El modelo recibe una imagen RGB de 1024x1024 píxeles normalizada y devuelve un mapa de probabilidad de primer plano de la misma resolución, que se usa como máscara alfa para recortar el sujeto y generar stickers.

Su relevancia es acotada pero concreta: ofrece una segmentación de alta precisión (la familia DIS está diseñada específicamente para segmentación dicotómica de alta fidelidad) en un paquete pequeño (repo de 0,1 GB) y ejecutable en cliente, sin necesidad de backend. La licencia Apache-2.0 facilita su integración comercial. No hay información sobre idiomas ni sobre capacidades de texto, ya que es un modelo puramente visual.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | IS-Net / DIS (red de segmentación dicotómica de alta precisión, basada en U-Net con supervisión intermedia; detalles exactos de capas no disponibles) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión; entrada fija de 1024x1024 píxeles) |
| Tipos de cuantizacion | fp16 en pesos; entrada y salida en float32 |
| Idiomas soportados | no disponible (no procesa texto) |
| Licencia | Apache-2.0 |
| Formato de pesos | ONNX (`isnet-general-use-fp16.onnx`) |

## Arquitectura y entrenamiento

El modelo subyacente es IS-Net, la red propuesta en el paper DIS (Highly Accurate Dichotomous Image Segmentation, ECCV 2022) de Qin et al. Está diseñada para separar un objeto de primer plano de su fondo con bordes de alta fidelidad, una tarea más exigente que la segmentación semántica convencional. La arquitectura sigue un esquema encoder-decoder con conexiones de supervisión intermedia, aunque la model card no detalla el número de capas, canales ni el backbone exacto.

Los pesos incluidos corresponden a la variante "general use" distribuida en las releases de rembg, exportada desde los pesos originales de DIS. La modificación aplicada por el autor consiste en recortar el grafo a su salida final (`output_image`), eliminando salidas auxiliares, y convertir los pesos a fp16 mediante `onnxconverter-common`, manteniendo entrada y salida en float32 para compatibilidad con onnxruntime-web. No se dispone de información sobre el dataset de entrenamiento, el número de imágenes, ni si hubo ajuste fino posterior; la model card solo remite al paper y al repositorio originales.

## Capacidades

- Segmentación de primer plano y eliminación de fondo en imágenes RGB.
- Generación de máscara alfa de 1024x1024 píxeles con probabilidad de primer plano por píxel.
- Funcionamiento en navegador mediante onnxruntime-web (ejecución en cliente, sin backend).
- Orientado a objetos genéricos ("general use"), no especializado en una categoría concreta.
- No soporta tool calling, agentes, razonamiento multi-paso ni procesamiento de texto.
- No dispone de capacidades multilingües ni de modalidad de audio.
- No dispone de modo "thinking" ni de generación de texto.

## Casos de uso

- Generación de stickers en el navegador: la aplicación Sticker Studio usa el modelo para recortar el sujeto de una foto subida por el usuario y producir un PNG con transparencia, todo en cliente y sin enviar la imagen a un servidor.
- Herramientas de edición fotográfica web: integración en editores online para eliminar fondos de retratos o productos antes de aplicar composiciones, aprovechando la resolución de 1024x1024 para bordes limpios.
- Creación de avatares y fotos de perfil: recorte automático del sujeto para generar imágenes con fondo transparente o sustituido, con latencia baja al ejecutarse localmente.
- Catálogos de e-commerce: procesamiento por lotes de fotos de producto para obtener imágenes con fondo blanco o transparente de forma consistente, sin depender de servicios externos de pago.
- Prototipado de pipelines de visión: uso como componente de segmentación en demos y pruebas de concepto que requieran una máscara de primer plano rápida y con licencia permisiva.
- Aplicaciones de privacidad: procesamiento de imágenes médicas o personales en el dispositivo, evitando la subida de datos sensibles a servidores, gracias a la ejecución ONNX en el cliente.
- Preprocesado para otras tareas visuales: generación de máscaras que alimenten etapas posteriores de composición, inpainting o clasificación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible con precisión; el repo completo ocupa 0,1 GB y el modelo en fp16 es ligero, por lo que se espera un consumo de memoria moderado (del orden de cientos de MB a pocos GB según el runtime), aunque no se confirma en la información proporcionada.
- GPU recomendadas: no disponible. Al ejecutarse vía onnxruntime-web, el modelo está pensado para CPU o GPU del navegador (WebGPU/WebGL) más que para GPUs de datacenter.
- Cabe en GPU de consumo: sí, previsiblemente en cualquier GPU de consumo moderna e incluso en CPU, dado el tamaño del artefacto; no se especifican modelos concretos.
- Opciones de despliegue: onnxruntime-web (navegador), ONNX Runtime (CPU/GPU), y potencialmente otros runtimes compatibles con ONNX. No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Entrada | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| sticker-studio-models (este) | IS-Net/DIS general use, fp16 | 1024x1024 RGB | Apache-2.0 | ONNX | Recortado a salida final, pensado para navegador |
| rembg `isnet-general-use.onnx` | IS-Net/DIS general use | 1024x1024 RGB | Apache-2.0 | ONNX | Origen del que deriva este modelo; incluye salidas auxiliares |
| DIS / IS-Net original (xuebinqin/DIS) | IS-Net/DIS | 1024x1024 RGB | Apache-2.0 | PyTorch | Pesos y código de referencia del paper ECCV 2022 |
| U2-Net (base de rembg clásico) | U2-Net | 320x320 | Apache-2.0 | ONNX/PyTorch | Alternativa de segmentación de fondo más ligera y de menor resolución; no incluida en la información proporcionada como comparación oficial |

No se dispone de datos de rendimiento comparativo entre estas alternativas en la información proporcionada.

## Limitaciones y advertencias

- Modelo puramente visual: no procesa texto, no responde preguntas y no tiene capacidades de razonamiento ni de generación.
- La máscara de salida es una probabilidad por píxel; la calidad del recorte depende de la imagen de entrada y puede fallar en sujetos con bordes ambiguos, pelo fino, transparencias o fondos complejos.
- Entrada fija de 1024x1024: imágenes de otras resoluciones deben redimensionarse, lo que puede afectar a la precisión en detalles finos.
- No hay información sobre sesgos demográficos o de otro tipo; al ser un modelo de segmentación, los sesgos se manifestarían como fallos sistemáticos en ciertos tipos de sujetos, pero no se documentan.
- Riesgo de artefactos en los bordes de la máscara por la conversión a fp16 y por el recorte del grafo a la salida final.
- Licencia Apache-2.0: permite uso comercial y modificación, pero se debe conservar el aviso de licencia y atribuir correctamente a los autores originales de DIS y a rembg.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: no hay evidencia de uso en producción ni de validación comunitaria.
- No se especifican requisitos de versión de onnxruntime-web ni compatibilidad con navegadores concretos.

## Enlaces

- Hugging Face: https://huggingface.co/mmachado53/sticker-studio-models
- Repositorio original DIS / IS-Net: https://github.com/xuebinqin/DIS
- Releases de rembg (origen del ONNX): https://github.com/danielgatis/rembg
- Paper DIS (ECCV 2022): no disponible enlace directo en la información proporcionada (Qin et al., *Highly Accurate Dichotomous Image Segmentation*)
