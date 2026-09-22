# skillsafe-ai/yolox-nano

## Resumen

YOLOX-nano es un detector de objetos convolucional de la familia YOLOX, desarrollado originalmente por Megvii (Megvii-BaseDetection) y publicado aquí por skillsafe-ai como artefacto ONNX listo para ejecutarse en navegador. El repositorio no contiene un modelo nuevo: contiene la importación reproducible del binario `yolox_nano.onnx` (3,49 MB) publicado en el release `0.1.1rc0` del proyecto YOLOX, verificado con `onnx.checker` y una ejecución de humo en CPU con onnxruntime. El problema que resuelve es la detección de objetos genérica sobre las 80 clases de COCO con entrada fija de 416x416 píxeles, empaquetada para su uso directo con `onnxruntime-web` (WebGPU o WASM).

Su relevancia actual es de tipo práctico más que de investigación: permite ejecutar detección de objetos íntegramente en el cliente, sin backend de inferencia y sin enviar imágenes a un servidor, algo útil en aplicaciones web con requisitos de privacidad, latencia o conectividad limitada. Al ser un fichero ONNX de unos pocos megabytes, cabe en cualquier dispositivo y se carga como un recurso estático más.

La model card no documenta el número de parámetros, el dataset de entrenamiento ni métricas de precisión; sólo especifica el contrato de entrada/salida, la procedencia (SHA-256 por fichero), la receta de conversión y la licencia Apache-2.0 heredada del proyecto original.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Red convolucional de detección de objetos de la familia YOLOX (single-stage, sin anchors); nivel de detalle no especificado en la informacion disponible |
| Parametros totales | no disponible (el fichero ONNX publicado ocupa 3,49 MB) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (modelo de visión; no procesa texto) |
| Tipos de cuantizacion | no disponible; el artefacto publicado es ONNX en coma flotante de 32 bits |
| Idiomas soportados | no disponible; las etiquetas de clase son las 80 categorias de COCO (en ingles) |
| Licencia | Apache-2.0 |
| Formato de pesos | ONNX (opset 11) |
| Ficheros | `yolox_nano.onnx` (clase `registry`), 3,49 MB, SHA-256 `c789161ed43c8269fcd4e67c67eeeb4e80c622da2eb296a20bc6007bd18a0b7d` |
| Entrada | `images`, float32, `[1, 3, 416, 416]` |
| Salida | `output`, float32, `[1, 3549, 85]` |
| Procedencia | `yolox_nano.onnx` del release `0.1.1rc0` de Megvii-BaseDetection/YOLOX, importado sin conversion |
| Toolchain de verificacion | Python 3.12.13, torch 2.10.0, onnx 1.23.0, onnxruntime 1.30.0, Darwin 25.6.0 arm64 |
| Fecha de conversion | 2026-09-22T18:56:08+00:00 |

## Arquitectura y entrenamiento

La informacion disponible no describe la arquitectura interna del modelo: se indica únicamente que es un detector de objetos YOLOX en su variante nano, con una entrada RGB de 416x416 y una salida cruda de forma `[1, 3549, 85]`. Esa forma de salida es coherente con el formato de YOLOX: 3 niveles de rejilla a resolución reducida que producen 3549 predicciones, cada una con 4 coordenadas de caja, 1 puntuación de objetividad y 80 puntuaciones de clase. El post-procesado (por ejemplo, decodificación de la rejilla y supresión de no máximos) no viene incluido en el artefacto y debe implementarse en el cliente.

No hay datos sobre volumen de entrenamiento, composición del dataset (más allá de la asociación implícita con COCO), uso de RLHF/DPO (no aplica a un detector) ni innovaciones técnicas concretas documentadas en este repositorio. El trabajo aportado aquí es de empaquetado y trazabilidad: cada byte del fichero se declara derivable de la fuente original mediante la receta `recipes/yolox-nano.yaml` (SHA-256 `86b3695d12aaeef16a7cd83408cc616f0702daab486f141ced9eb983bf597c71`), sin edición manual, y se verifica con `onnx.checker` y una ejecución en CPU con entradas rellenas de ceros.

## Capacidades

- Detección de objetos en imágenes: predice cajas delimitadoras y 80 clases de COCO a partir de una entrada fija de 416x416 píxeles.
- Inferencia en navegador mediante `onnxruntime-web`, con `executionProviders: ["webgpu", "wasm"]`, cargando el modelo directamente por URL.
- Ejecución en CPU (WASM) cuando no hay aceleración por GPU disponible.
- Modelo de un solo fichero (3,49 MB), adecuado para carga bajo demanda o almacenamiento en caché del navegador.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- No tiene capacidades multilingües ni de generación de texto: no es un modelo de lenguaje.
- No dispone de modo "thinking", ni capacidades de audio, ni segmentación semántica, ni estimación de pose.
- El artefacto no incluye la capa de post-procesado (NMS), que debe aportar la aplicación.

## Casos de uso

- Detección de objetos en el navegador con privacidad por diseño: la imagen nunca sale del dispositivo porque la inferencia se ejecuta en WebGPU o WASM; es válido para aplicaciones de análisis de vídeo/webcam en sectores con requisitos estrictos de tratamiento de datos.
- Contadores y analítica visual en cliente: conteo de personas u objetos en una retransmisión de cámara web, útil en aforo de locales o análisis de interacción en tienda sin desplegar infraestructura de GPU.
- Prefiltro en una cascada de modelos: al ocupar 3,49 MB y ejecutarse en CPU, puede actuar como primer nivel que descarta fotogramas sin objetos y sólo reenvía los relevantes a un modelo mayor en servidor.
- Etiquetado asistido de imágenes: generar preanotaciones de cajas sobre las 80 clases de COCO para revisión humana posterior en herramientas de anotación.
- Aplicaciones de campo con conectividad intermitente: al ser un fichero estático y no requerir backend, funciona en escenarios offline una vez cacheado el modelo y el runtime.
- Prototipado y pruebas de integración: sirve para validar el pipeline completo (preprocesado, inferencia, decodificación, NMS, visualización) antes de sustituir el detector por uno más preciso.
- Automatizaciones domésticas o de robótica de bajo coste: detección básica en dispositivos con CPU modesta o navegador embebido, donde el tamaño del modelo es el factor limitante.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

El único dato de rendimiento recogido en la model card es una ejecución de humo en CPU (Darwin 25.6.0 arm64) con entradas rellenas de ceros y formas declaradas, con un tiempo de 7,9 ms para `yolox_nano.onnx`. Se trata de una prueba de verificación del grafo, no de una medición de throughput real: no se especifica la métrica de precisión (AP de COCO), ni latencia con imágenes reales, ni comparación con otros detectores.

## Requisitos de hardware

- Memoria necesaria para los pesos: aproximadamente 3,5 MB en coma flotante de 32 bits; el consumo total depende del tamaño del búfer de entrada (1x3x416x416 float32, unos 2 MB) y de las 3549x85 predicciones de salida (unos 1,2 MB).
- VRAM estimada: por debajo de 1 GB en cualquier configuración; no requiere GPU dedicada.
- GPU compatibles: cualquier GPU con soporte de WebGPU en el navegador; en servidor, cualquier GPU capaz de ejecutar ONNX Runtime, aunque el modelo no la necesita.
- Cabe en GPU de consumo (RTX 3060, RTX 4090, etc.) y también en iGPU y en CPU exclusivamente.
- Opciones de despliegue: `onnxruntime-web` (WebGPU o WASM) en navegador; ONNX Runtime en servidor o escritorio; el fichero ONNX es convertible a otros runtimes, aunque no se documentan conversiones a TensorRT, OpenVINO, CoreML o formatos GGUF en la informacion disponible.
- Latencia y throughput: no disponibles para imágenes reales; la única referencia es el tiempo de 7,9 ms de la prueba de humo en CPU con entradas nulas, que no debe interpretarse como rendimiento en producción.

## Comparativa con modelos similares

La informacion proporcionada no incluye métricas de precisión ni de latencia de este modelo, por lo que no es posible comparar rendimiento con alternativas. La siguiente tabla recoge únicamente los datos verificables y marca el resto como no disponible.

| Modelo | Parametros | Entrada | Licencia | Formato listo para navegador | Datos de rendimiento |
|---|---|---|---|---|---|
| YOLOX-nano (este repositorio) | no disponible | 416x416 | Apache-2.0 | Si (ONNX + `onnxruntime-web`) | no disponible |
| YOLOX-nano (upstream Megvii, release 0.1.1rc0) | no disponible | 416x416 | Apache-2.0 | No documentado | no disponible |
| YOLOX-tiny | no disponible | no disponible | Apache-2.0 (misma familia, segun la model card) | no disponible | no disponible |
| Otros detectores ligeros (por ejemplo variantes nano de YOLOv5/YOLOv8) | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- No se documenta la precisión del modelo: no hay valores de AP, mAP ni curvas de error publicados en la informacion disponible, por lo que no se puede estimar su calidad frente a alternativas.
- Resolución de entrada fija de 416x416: los objetos pequeños o muy lejanos pueden perderse; aumentar la resolución exigiría reexportar el grafo.
- El artefacto devuelve predicciones crudas; sin un post-procesado correcto (decodificación y NMS) la salida no es utilizable. La model card no especifica el preprocesado exacto esperado (normalización, letterbox, espacio de color), lo que es un riesgo de integración.
- Sesgos: no hay ninguna evaluación de sesgo, diversidad demográfica o comportamiento por tipo de escena en la informacion disponible. Un detector entrenado sobre COCO hereda los desequilibrios de ese dataset en cuanto a clases, contextos y representación de personas.
- Riesgo de falsos positivos y falsos negativos: en detección de objetos el equivalente práctico a la alucinación son las detecciones espurias; no hay datos de precisión/recall para acotarlo.
- Idiomas: no aplica generación de texto; las etiquetas de clase están en inglés y cualquier traducción debe hacerla la aplicación.
- Licencia: Apache-2.0 permite uso comercial, modificación y redistribución, siempre que se conserve el aviso de copyright y la licencia. El aviso indicado en la model card es el del proyecto YOLOX (Copyright (c) 2021-2022 Megvii Inc.), que debe mantenerse.
- Trazabilidad: los pesos se distribuyen tal cual desde el release upstream, sin conversión; los números de verificación del repositorio corresponden a una ejecución de humo con entradas sintéticas, no a una validación funcional sobre imágenes reales.
- Repositorio sin adopción: 0 descargas y 0 likes en el momento de la consulta, sin evidencia de uso en producción ni de mantenimiento posterior.
- La búsqueda web realizada no devolvió resultados relevantes sobre este modelo; los enlaces disponibles se limitan a la model card y al proyecto upstream.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/skillsafe-ai/yolox-nano
- Fichero ONNX: https://huggingface.co/skillsafe-ai/yolox-nano/resolve/main/yolox_nano.onnx
- Origen upstream de los pesos (release 0.1.1rc0): https://github.com/Megvii-BaseDetection/YOLOX/releases/download/0.1.1rc0/yolox_nano.onnx
- Repositorio del proyecto YOLOX: https://github.com/Megvii-BaseDetection/YOLOX
- Licencia Apache-2.0 de YOLOX: https://github.com/Megvii-BaseDetection/YOLOX/blob/main/LICENSE
- Recetas de conversion de SkillSafe: https://github.com/skillsafe-admin/skillsafe.ai-website/tree/main/models
- No se han encontrado articulos, papers ni demos adicionales en la busqueda web realizada.
