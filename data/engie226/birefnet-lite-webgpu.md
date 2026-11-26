# Engie226/birefnet-lite-webgpu

## Resumen

BiRefNet lite for WebGPU es una reexportación del modelo de segmentación de primer plano ZhengPeng7/BiRefNet_lite, adaptada para ejecutarse en ONNX Runtime Web sobre WebGPU directamente en el navegador del usuario. Lo publica Engie226 como parte del proyecto NardoCut, una herramienta de eliminación de fondos de alta calidad que procesa la imagen en local, sin enviar datos a un servidor. El modelo resuelve la tarea de *background removal* (matting de persona) generando una máscara alfa de un solo canal a partir de una imagen RGB.

La relevancia técnica reside en el cambio de operador: la convolución deformable original (`torchvision.ops.deform_conv2d`) se reescribe como `grid_sample` bilineal multiplicado por el modulador más una convolución 1×1, de modo que el grafo resultante solo contiene operadores que WebGPU puede ejecutar. Según el autor, la diferencia numérica respecto al original es de 2·10⁻⁷ sobre la máscara, con pesos sin modificar y forma fija.

El repositorio ocupa 0,2 GB, la entrada es fija de 1×3×640×640 en RGB normalizado 0…1 (la normalización ImageNet está dentro del grafo) y la salida es 1×1×640×640 en 0…1 (la sigmoide también está embebida). La licencia es MIT, heredada del modelo original de ZhengPeng.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | BiRefNet lite (red de segmentación binaria de referencia, exportada a ONNX); convolución deformable reescrita como `grid_sample` + conv 1×1 |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión, entrada fija 1×3×640×640) |
| Tipos de cuantizacion | no disponible (el autor no documenta cuantización; el repo contiene pesos ONNX) |
| Idiomas soportados | no aplica (modelo de imagen); no disponible en la ficha |
| Licencia | MIT (Copyright (c) 2024 ZhengPeng) |
| Formato de pesos | ONNX (ejecutable en ONNX Runtime Web / WebGPU) |

## Arquitectura y entrenamiento

Se trata de una reexportación del modelo base ZhengPeng7/BiRefNet_lite (revisión `aa62cd8`), no de un reentrenamiento. BiRefNet es una arquitectura de segmentación de imagen diseñada para *dichotomous image segmentation* (DIS) y matting de alta resolución, con un esquema de supervisión multi-escala y módulos de decodificación que refinan progresivamente el mapa de primer plano. El autor no aporta en la model card detalles sobre el dataset de entrenamiento original, el número de tokens o imágenes, ni sobre si hubo ajuste fino adicional; esa información corresponde al modelo base y no se reproduce aquí.

La innovación técnica documentada es puramente de despliegue: la convolución deformable de torchvision, que en las exportaciones públicas se traduce a operadores no soportados por WebGPU, se sustituye por una combinación de `grid_sample` bilineal con el modulador y una convolución 1×1. El autor afirma que la aritmética es equivalente (error de 2·10⁻⁷ en la máscara) y que los pesos no cambian. El script de conversión está en `tools/birefnet/` del repositorio NardoCut, aunque no se enlaza en la model card.

## Capacidades

- Segmentación de primer plano / eliminación de fondo: genera una máscara alfa (matte) de 640×640 a partir de una imagen RGB, orientada a recorte de personas.
- Inferencia en navegador: el grafo ONNX está pensado para ONNX Runtime Web con backend WebGPU, sin servidor.
- Forma fija: entrada 1×3×640×640 y salida 1×1×640×640; no admite resolución variable sin reexportar.
- Preprocesado y postprocesado integrados: normalización ImageNet y sigmoide dentro del grafo, lo que simplifica la integración en front-end.
- No soporta tool calling, agentes, razonamiento multi-paso ni generación de texto; es un modelo puramente visual.
- Capacidades multilingües: no aplica.

## Casos de uso

- Eliminación de fondo en el navegador para herramientas de edición fotográfica: el modelo procesa la imagen en el equipo del usuario, lo que evita subir fotos personales a un servidor y reduce costes de infraestructura.
- Recorte de retratos en aplicaciones de videollamada o webcams virtuales: con ~0,5 s por fotograma en una RTX 3050, es viable para fondos estáticos o semiestáticos, no para vídeo a 30 fps en hardware modesto.
- Generación de avatares y fotos de perfil: la máscara 0…1 permite componer el sujeto sobre fondos nuevos en un canvas del navegador.
- Preprocesado en pipelines de e-commerce: separar producto o persona del fondo antes de generar thumbnails o fichas de catálogo, ejecutándose en el cliente para descargar el backend.
- Herramientas de diseño tipo editor web (tipo NardoCut): integración directa en una SPA con WebGPU, sin dependencia de API externa ni latencia de red.
- Prototipado y demos de segmentación: al ser un ONNX de 0,2 GB con licencia MIT, sirve para experimentar con matting en el navegador sin montar infraestructura de GPU.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El único dato de rendimiento aportado por el autor es una velocidad de aproximadamente 0,5 s por fotograma en una GPU de portátil RTX 3050 con ONNX Runtime Web 1.30, y una diferencia numérica de 2·10⁻⁷ en la máscara respecto al modelo original.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; el repo pesa 0,2 GB y la entrada es de 640×640, por lo que el consumo de memoria es moderado, pero el autor no publica cifras.
- GPU recomendadas: el autor cita una RTX 3050 de portátil como referencia de velocidad; no se documentan pruebas en A100, H100 ni RTX 4090.
- Cabe en GPU de consumo: sí, según el único dato disponible (RTX 3050 de portátil); no se confirma en iGPU ni en GPU integradas.
- Opciones de despliegue: ONNX Runtime Web con backend WebGPU (caso documentado); al ser un ONNX estándar, también podría ejecutarse con otros runtimes ONNX, aunque el autor no lo documenta.
- Latencia y throughput: ~0,5 s por fotograma en RTX 3050 de portátil con ORT Web 1.30; throughput no disponible.

## Comparativa con modelos similares

| Modelo | Tipo | Entrada | Contexto / resolución | Licencia | Despliegue en navegador |
|---|---|---|---|---|---|
| Engie226/birefnet-lite-webgpu | BiRefNet lite reexportado a ONNX | 1×3×640×640 fija | 640×640 | MIT | Sí, WebGPU documentado |
| ZhengPeng7/BiRefNet_lite (base) | BiRefNet lite original | no disponible en esta ficha | no disponible | MIT (según el autor) | No documentado |
| ZhengPeng7/BiRefNet (completo) | BiRefNet completo | no disponible en esta ficha | no disponible | no disponible en esta ficha | No documentado |

No se dispone de datos de benchmarks ni de parámetros de los modelos comparables en la información proporcionada, por lo que la comparación se limita a formato, licencia y capacidad de ejecución en navegador.

## Limitaciones y advertencias

- Modelo especializado en matting de personas: el autor lo describe como eliminación de fondo de personas; su comportamiento en otros sujetos (productos, animales, escenas) no está documentado.
- Entrada de forma fija 640×640: no admite resoluciones variables sin reexportar el grafo.
- Sin benchmarks publicados: no hay métricas de calidad (IoU, S-measure, MAE) en la información disponible para validar el rendimiento frente al original más allá de la diferencia numérica citada.
- Repositorio sin tracción: 0 descargas y 0 likes en el momento de la consulta, lo que implica poca validación comunitaria.
- Dependencia de WebGPU: requiere un navegador con soporte WebGPU; en navegadores o equipos sin él, el modelo no se ejecutará con el backend documentado.
- Licencia MIT: permite uso comercial, pero conviene conservar el aviso de copyright de ZhengPeng (2024) que el autor indica que se incluye.
- Sesgos y alucinaciones: no se documentan sesgos conocidos; al ser un modelo de segmentación, el riesgo de "alucinación" se traduce en máscaras incorrectas en bordes, pelo o regiones ambiguas, no cuantificado en la información disponible.
- Sin información sobre cuantización ni sobre el tamaño exacto de parámetros: el autor no publica esos datos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Engie226/birefnet-lite-webgpu
- Modelo base: https://huggingface.co/ZhengPeng7/BiRefNet_lite
- Repositorio NardoCut (script de conversión en `tools/birefnet/`): no se proporciona URL en la información disponible
- Paper de BiRefNet: no disponible en la información proporcionada
