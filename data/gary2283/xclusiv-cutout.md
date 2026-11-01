# Gary2283/xclusiv-cutout

## Resumen

Xclusiv-cutout es un modelo de segmentación de imagen especializado en la eliminación de fondo de personas de cuerpo entero, exportado a ONNX por el usuario Gary2283 para su uso en el editor de vídeo Xclusiv (efectos de croma, recorte de papel, vértigo y otros efectos de superposición). No se trata de un modelo entrenado desde cero: es una conversión directa de los pesos de BiRefNet_lite, desarrollado por Peng Zheng et al., sin reentrenamiento ni modificación de los pesos originales.

El modelo resuelve el problema de la segmentación dicotómica de alta resolución (DIS, *dichotomous image segmentation*) aplicada a retratos de cuerpo completo, generando una máscara de primer plano a partir de una imagen RGB. Su relevancia práctica radica en la exportación a un grafo ONNX con entrada fija de 576 x 1024 píxeles que elimina la dependencia del operador DeformConv, permitiendo su ejecución en onnxruntime 1.21 con operadores estándar (`grid_sample` y multiplicación matricial) y manteniendo una diferencia máxima de 5e-5 frente a la implementación original en PyTorch.

El repositorio ocupa 0,2 GB e incluye un único archivo de pesos ONNX de 181.530.162 bytes. La licencia es MIT, heredada del modelo base, lo que facilita su integración en productos comerciales. No se dispone de información sobre idiomas ni sobre datos de entrenamiento propios, ya que el autor declara explícitamente que no ha modificado los pesos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | BiRefNet lite (red de segmentación con referencia bilateral y convolución deformable) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión; entrada fija 1 x 3 x 1024 x 576) |
| Tipos de cuantizacion | no disponible (exportación ONNX en precisión original; no se documentan variantes cuantizadas) |
| Idiomas soportados | no disponible (modelo de imagen, sin componente lingüístico) |
| Licencia | MIT |
| Formato de pesos | ONNX (`birefnet-lite-576x1024.onnx`) |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura BiRefNet lite de Zheng et al., presentada en el artículo "Bilateral Reference for High-Resolution Dichotomous Image Segmentation" (CAAI Artificial Intelligence Research, 2024). BiRefNet emplea una arquitectura de segmentación con referencias bilaterales, que combina señales de imagen de alta resolución con mapas de características de bajo nivel para delimitar objetos con bordes finos. La variante *lite* reduce la carga computacional respecto al modelo completo, lo que la hace apta para inferencia en tiempo real en aplicaciones de edición de vídeo.

La modificación introducida por Gary2283 es exclusivamente de exportación: los pesos no se han reentrenado. La convolución deformable original se reescribe con operadores estándar de ONNX (`grid_sample` y una multiplicación matricial), lo que permite ejecutar el grafo en onnxruntime 1.21 sin el operador DeformConv. La entrada está fijada a 1 x 3 x 1024 x 576 (RGB, normalización ImageNet mean/std) y la salida es un tensor de logits de 1 x 1 x 1024 x 576. No se documentan en la información disponible detalles sobre el dataset de entrenamiento original, el número de tokens (no aplica) ni el uso de RLHF/DPO.

## Capacidades

- Segmentación de imagen para eliminación de fondo (*background removal*) de personas de cuerpo entero.
- Generación de máscaras de primer plano a partir de imágenes RGB en formato retrato (576 x 1024).
- Salida de logits por píxel (1 x 1 x 1024 x 576) que permiten umbralizar para obtener la máscara binaria.
- Ejecución en onnxruntime 1.21 sin dependencia del operador DeformConv.
- Integración en pipelines de edición de vídeo para efectos de superposición (croma, recorte, vértigo).
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni capacidades multilingües: es un modelo puramente visual de segmentación.
- No dispone de modo *thinking*, visión general, audio ni generación de texto.

## Casos de uso

- **Edición de vídeo con efectos de superposición**: el modelo genera la máscara de la persona en cada fotograma para aplicar efectos como croma, recorte de papel o vértigo en el editor Xclusiv; su entrada fija de 576 x 1024 y su exportación ONNX permiten integrarlo en un pipeline de vídeo sin dependencias de PyTorch.
- **Eliminación de fondo en retratos de cuerpo entero**: adecuado para aplicaciones de fotografía o *streaming* que necesiten separar a una persona del fondo con bordes finos, gracias a la arquitectura BiRefNet orientada a segmentación dicotómica de alta resolución.
- **Generación de *thumbnails* y avatares**: en servicios de creación de contenido, el modelo puede recortar automáticamente al sujeto para componer miniaturas o avatares sobre fondos personalizados.
- **Preprocesado para *virtual try-on* o realidad aumentada**: la máscara de cuerpo completo sirve como entrada para pipelines que superponen prendas o elementos virtuales sobre la persona.
- **Automatización de flujos de *postproducción* por lotes**: al ejecutarse en onnxruntime, puede desplegarse en servidores sin GPU dedicada o con GPU modesta para procesar lotes de imágenes en un pipeline de CI/CD de contenido.
- **Prototipado rápido en aplicaciones de escritorio o web**: el archivo ONNX único de 181 MB y licencia MIT facilitan la integración en herramientas de escritorio o servicios web sin necesidad de gestionar el stack de PyTorch.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; el archivo ONNX ocupa 181,5 MB, por lo que la inferencia en FP32 requiere un orden de magnitud de cientos de MB a pocos GB, dependiendo del runtime y de los buffers intermedios.
- GPU recomendadas: no disponible en la información proporcionada; al ser un modelo lite exportado a ONNX, es plausible su ejecución en GPU consumer, pero no se documentan modelos concretos.
- ¿Cabe en GPU consumer? No se especifica; el tamaño del archivo (181 MB) sugiere que sí, pero no hay confirmación en la información disponible.
- Opciones de despliegue: onnxruntime 1.21 (requisito explícito del autor); no se documentan vLLM, llama.cpp, Ollama ni TGI (no aplican a un modelo de segmentación de imagen).
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto/entrada | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|
| Gary2283/xclusiv-cutout | no disponible | 576 x 1024 fijo | MIT | ONNX | HuggingFace |
| ZhengPeng7/BiRefNet_lite (base) | no disponible | resolución variable (PyTorch) | MIT | PyTorch | HuggingFace |
| ZhengPeng7/BiRefNet (completo) | no disponible | resolución variable (PyTorch) | MIT | PyTorch | HuggingFace |
| Otros modelos de *background removal* (p. ej. U2-Net, RMBG) | no disponible en la información | no disponible | varía | varía | varía |

No se dispone de datos de rendimiento comparativo en la información proporcionada; la comparativa se limita a aspectos de licencia, formato y disponibilidad.

## Limitaciones y advertencias

- El modelo está especializado en personas de cuerpo entero; su rendimiento en otros sujetos (objetos, animales, escenas) no está documentado y podría degradarse.
- La entrada está fijada a 576 x 1024; imágenes con otras proporciones requerirán redimensionado, lo que puede afectar a la calidad de la máscara en bordes.
- No se documentan sesgos conocidos, pero al derivar de un modelo entrenado con datos no especificados, puede heredar sesgos de representación de personas (tono de piel, complexión, vestimenta).
- Riesgo de alucinación: no aplica en el sentido generativo, pero sí existe riesgo de máscaras incorrectas en bordes finos, pelo o ropa con bajo contraste.
- Licencia MIT: permite uso comercial, pero se recomienda conservar la atribución al modelo base BiRefNet y a sus autores según la cita indicada.
- Dependencia de onnxruntime 1.21: versiones anteriores podrían no soportar el grafo exportado.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta; no hay evidencia de validación comunitaria.
- No se documentan limitaciones de idioma porque el modelo no procesa texto.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Gary2283/xclusiv-cutout
- Modelo base BiRefNet_lite: https://huggingface.co/ZhengPeng7/BiRefNet_lite
- Repositorio de código BiRefNet: https://github.com/ZhengPeng7/BiRefNet
- Artículo: Zheng, Gao, Fan, Liu, Laaksonen, Ouyang, Sebe. "Bilateral Reference for High-Resolution Dichotomous Image Segmentation." CAAI Artificial Intelligence Research, 2024.
