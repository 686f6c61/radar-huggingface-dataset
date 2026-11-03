# fwgpiyawudk/surya-ocr-2.5-mlx-4bit

## Resumen

surya-ocr-2.5-mlx-4bit es una cuantizacion en 4 bits del modelo datalab-to/surya-ocr-2.5, publicada por el usuario fwgpiyawudk en HuggingFace. Se trata de una conversion al formato MLX, el framework de Apple para inferencia y entrenamiento en silicio unificado (chips M-series), lo que la hace directamente utilizable en macOS mediante la libreria `mlx` y el ecosistema `mlx-vlm` para tareas de imagen-a-texto.

El modelo base, surya-ocr-2.5, es un sistema de OCR desarrollado por Datalab (responsables tambien de Marker y Surya). La arquitectura subyacente, segun los tags del repositorio, es `qwen3_5`, es decir, un transformer multimodal derivado de la familia Qwen 3.5, adaptado para reconocimiento optico de caracteres y transcripcion de documentos. Con 689.356.864 parametros totales (aproximadamente 689 millones), se situa en la categoria de modelos compactos, lo que permite ejecucion en hardware de consumo.

La relevancia de esta publicacion es practica: ofrece una version cuantizada a 4 bits (6,186 bits por peso efectivos) de un modelo OCR moderno, empaquetada en safetensors y lista para MLX. Esto reduce el peso del repositorio a 0,5 GB y facilita el despliegue local de OCR de alta calidad en equipos Apple sin depender de servicios en la nube. No obstante, al ser una publicacion de un tercero sin traccion (0 descargas, 0 likes en el momento de la consulta), conviene tratarla como un artefacto experimental.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (tag `qwen3_5`), pipeline image-text-to-text |
| Parametros totales | 689.356.864 (aprox. 689 M) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 4 bits (6,186 bits por peso efectivos) |
| Idiomas soportados | no disponible |
| Licencia | openrail |
| Formato de pesos | safetensors (formato MLX) |

## Arquitectura y entrenamiento

La informacion disponible no detalla la arquitectura interna mas alla del tag `qwen3_5`, que sugiere una base derivada de Qwen 3.5 con capacidad de procesamiento de imagen y texto. El pipeline declarado es `image-text-to-text`, coherente con un modelo OCR que recibe una imagen de documento y genera texto transcrito. El modelo base surya-ocr-2.5 pertenece a Datalab, cuyo linaje de modelos Surya esta orientado a deteccion de layout, reconocimiento de texto y comprension de documentos.

No se dispone de informacion sobre el volumen de datos de entrenamiento, la composicion del dataset, el uso de RLHF/DPO ni innovaciones tecnicas especificas del modelo base en la informacion proporcionada. La unica informacion tecnica concreta sobre esta publicacion es el proceso de cuantizacion: conversion mediante `build_mlx.py` con `--q-bits 4`, resultando en 6,186 bits por peso efectivos, un valor ligeramente superior a 4 bits por el almacenamiento de escalas y parametros auxiliares de cuantizacion.

## Capacidades

- Reconocimiento optico de caracteres (OCR) sobre imagenes de documentos.
- Transcripcion de texto a partir de imagenes (pipeline image-text-to-text).
- Conversacion multimodal: el tag `conversational` indica soporte de interaccion por turnos con entradas de imagen y texto.
- Procesamiento de documentos potencialmente complejos (tablas, layout) heredado del modelo base Surya, aunque no se detalla explicitamente en la informacion disponible.
- Ejecucion local en hardware Apple mediante MLX.
- Soporte de tool calling / function calling: no disponible en la informacion.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion.
- Capacidades multilingues: no disponibles (el campo de idiomas no esta poblado).
- Modo thinking, vision adicional, audio: no disponible.

## Casos de uso

- Digitalizacion de archivos fisicos en macOS: el modelo puede ejecutarse localmente con MLX sobre un Mac con chip M-series para convertir imagenes escaneadas en texto editable, sin enviar documentos sensibles a la nube.
- Extraccion de texto en flujos de trabajo de investigacion: investigadores que procesan corpus de PDFs o imagenes pueden integrar el modelo en scripts Python con `mlx-vlm` para obtener transcripciones y alimentar pipelines de analisis.
- Procesamiento por lotes en equipos de desarrollo: dado su tamano reducido (0,5 GB en 4 bits), es viable ejecutar lotes de imagenes en un portatil Apple sin GPU dedicada, con throughput moderado.
- Prototipado rapido de aplicaciones OCR: desarrolladores que quieren validar una idea de producto de digitalizacion pueden usar esta version cuantizada para pruebas de concepto antes de optar por el modelo completo o por una API.
- Preprocesamiento de datos para entrenamiento de modelos: transcripcion de imagenes de documentos para construir datasets de texto en proyectos de IA open source.
- Herramienta de accesibilidad: conversion de capturas o fotografias de texto en voz o texto ampliado mediante integracion con otras herramientas del sistema, aprovechando la inferencia local.
- Automatizacion de extraccion de datos de facturas o formularios en pequenas empresas con infraestructura Apple, sustituyendo servicios de OCR por suscripcion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: al tratarse de un modelo de 689 M de parametros cuantizado a 4 bits (6,186 bits/peso), el peso de los pesos ronda los 0,5 GB; la memoria total necesaria en inferencia (incluyendo activaciones y cache) es mayor, pero no se dispone de cifras oficiales.
- GPU recomendadas: al ser una conversion MLX, esta disenada para silicio unificado de Apple (chips M1, M2, M3, M4 y variantes Pro/Max/Ultra). No esta pensada para GPU NVIDIA.
- Cabe en GPU de consumo: si, en equipos Apple con memoria unificada; el tamano del repositorio (0,5 GB) sugiere que cabe holgadamente en configuraciones de 8 GB o mas.
- Opciones de despliegue: libreria `mlx` y `mlx-vlm` en macOS. No se indica compatibilidad con vLLM, llama.cpp, Ollama o TGI, que no soportan el formato MLX de forma nativa.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| surya-ocr-2.5-mlx-4bit (este) | 689 M | no disponible | MLX safetensors 4-bit | openrail | Cuantizacion de terceros para Apple |
| datalab-to/surya-ocr-2.5 (base) | no disponible | no disponible | safetensors | openrail | Modelo original sin cuantizar |
| Otros modelos OCR open source | no disponible | no disponible | no disponible | no disponible | No se dispone de datos comparativos en la informacion |

No se dispone de informacion suficiente para comparar con alternativas concretas (por ejemplo, variantes de OCR basadas en PaddleOCR, TrOCR o Donut) en terminos de parametros, contexto o rendimiento.

## Limitaciones y advertencias

- Publicacion de terceros: el autor `fwgpiyawudk` no es Datalab; no hay garantia de fidelidad de la cuantizacion respecto al modelo original.
- Sin traccion verificable: 0 descargas y 0 likes en el momento de la consulta; no hay evidencia de uso en produccion ni validacion comunitaria.
- Idiomas no declarados: se desconoce que lenguas cubre el modelo, lo que impide garantizar soporte para castellano u otros idiomas.
- Sin benchmarks: no hay datos de precision tras la cuantizacion a 4 bits; la perdida de calidad respecto al modelo base es posible y no esta medida.
- Riesgo de alucinacion: como todo modelo generativo, puede producir texto inexistente en la imagen, especialmente en documentos de baja calidad o layouts complejos.
- Dependencia de plataforma: el formato MLX limita su uso a macOS con silicio Apple; no es portable a CUDA ni a CPU generica sin reconversion.
- Licencia openrail: permite uso comercial con condiciones; conviene revisar el texto completo de la licencia (enlace `LICENSE` del repositorio) antes de integrarlo en productos.
- Contexto desconocido: no se puede planificar el procesamiento de documentos largos sin conocer la ventana de contexto real.
- Sesgos: no disponibles en la informacion proporcionada.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/fwgpiyawudk/surya-ocr-2.5-mlx-4bit
- Modelo base: https://huggingface.co/datalab-to/surya-ocr-2.5
- Licencia (referenciada en la model card): LICENSE del repositorio
- Repositorio de Datalab (Surya): no disponible en la informacion proporcionada
- Paper o blog tecnico: no disponible en la informacion proporcionada
- Demos: no disponible en la informacion proporcionada
