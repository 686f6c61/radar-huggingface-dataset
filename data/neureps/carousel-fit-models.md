# neureps/carousel-fit-models

## Resumen

El modelo `neureps/carousel-fit-models` es un espejo público y byte-idéntico del modelo LaMa FP32 en formato ONNX de Carve Photos, diseñado para la extensión de fondo de fotografías de forma local. El modelo original LaMa fue desarrollado por Samsung Research en 2021 y está licenciado bajo Apache-2.0. Este repositorio contiene únicamente el archivo de pesos `lama-fp32-1faef5301d78.onnx` (208 MB) y los avisos de licencia, sin código de aplicación ni imágenes de usuarios. El modelo se ejecuta con ONNX Runtime 1.24.2 en CPU, lo que permite procesar imágenes sin conexión a internet tras la descarga. No se dispone de información sobre el número de parámetros ni sobre la longitud de contexto, al tratarse de un modelo de visión por computador.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | LaMa (red convolucional para inpainting) |
| Parámetros totales | no disponible |
| Parámetros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible (modelo de imagen, no de texto) |
| Tipos de cuantización | FP32 |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | ONNX |

## Arquitectura y entrenamiento

El modelo es una conversión a ONNX del modelo LaMa original de Samsung Research. La arquitectura subyacente es la de LaMa, un modelo de inpainting basado en redes convolucionales que utiliza capas de convolución de Fourier para completar regiones enmascaradas. Los pesos y el grafo no han sido modificados respecto al archivo upstream `lama_fp32.onnx` del repositorio `Carve/LaMa-ONNX` (commit `a3ee2fca54baebec351b8fa7786154ffa7555aa6`). No se dispone de información detallada sobre el dataset de entrenamiento ni sobre el proceso de entrenamiento en la documentación proporcionada. La conversión a ONNX fue realizada por el proyecto Carve-Photos y no incorpora innovaciones técnicas adicionales más allá del formato de intercambio para ejecución local.

## Capacidades

- Inpainting de imágenes: completa regiones de una imagen indicadas mediante una máscara.
- Extensión de fondo (outpainting): mediante el enmascarado de los bordes, permite ampliar el lienzo de una fotografía.
- Ejecución local en CPU con ONNX Runtime 1.24.2, sin necesidad de conexión a internet tras la descarga.
- Entrada: imagen RGB float32 de 512×512 (valores 0–1) y máscara float32 de 512×512 (1 genera, 0 preserva).
- Salida: imagen RGB con valores en 0–255.
- No soporta tool calling, agentes, razonamiento multi-paso ni capacidades multilingües, al ser un modelo puramente visual.

## Casos de uso

- Extensión de fondo en aplicaciones móviles de fotografía: la app genera una máscara en los bordes de la foto y el modelo rellena el área ampliada, permitiendo adaptar la imagen a formatos como historias o banners.
- Eliminación de objetos no deseados: el usuario enmascara un elemento que sobra en la imagen y el modelo lo sustituye por el fondo circundante, útil para retocar fotos de producto o paisajes.
- Restauración de fotografías antiguas: se pueden rellenar rasgaduras, manchas o zonas deterioradas de imágenes escaneadas, siempre que se delimite la zona dañada con la máscara.
- Post-procesado local en herramientas de edición: al ejecutarse en CPU y ser offline, permite integrar el modelo en aplicaciones de escritorio o móviles sin enviar imágenes a servidores externos, lo que garantiza la privacidad.
- Generación de fondos para composiciones publicitarias: los diseñadores pueden ampliar el fondo de una imagen de producto para adaptarla a distintos tamaños de cartel o banner, manteniendo la perspectiva original.
- Automatización de flujos de trabajo de retoque: el modelo puede encadenarse en un pipeline de procesamiento de imágenes que detecte regiones a rellenar y las procese automáticamente, reduciendo la intervención manual.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- Ejecución en CPU mediante ONNX Runtime 1.24.2; no requiere VRAM ni GPU.
- El archivo de pesos pesa 208 MB, pero el consumo de memoria durante la inferencia puede ser superior y provocar fallos en dispositivos con poca RAM.
- Puede ejecutarse en ordenadores y móviles compatibles con ONNX Runtime, aunque la disponibilidad no garantiza el rendimiento en todos los dispositivos.
- Opciones de despliegue: integración directa con ONNX Runtime en aplicaciones locales; no se mencionan frameworks de serving como vLLM, TGI o llama.cpp.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| neureps/carousel-fit-models | no disponible | no disponible | Apache-2.0 | Mirror ONNX |
| Carve/LaMa-ONNX | no disponible | no disponible | Apache-2.0 | ONNX upstream |
| LaMa original (Samsung) | no disponible | no disponible | Apache-2.0 | Código y pesos en GitHub |

El modelo es un espejo byte-idéntico del archivo `lama_fp32.onnx` del repositorio `Carve/LaMa-ONNX`, por lo que su comportamiento es exactamente el mismo. No se dispone de información suficiente para comparar este modelo con otras alternativas de inpainting (por ejemplo, Stable Diffusion inpainting o modelos de difusión) en la información proporcionada.

## Limitaciones y advertencias

- El modelo solo acepta entradas de 512×512 píxeles; cualquier tamaño distinto requiere preprocesado externo (padding y recorte), que no está incluido en este repositorio.
- El post-procesado (padding simétrico, recorte y restauración de píxeles originales) es responsabilidad de la aplicación que lo integra y no forma parte del modelo.
- El alto uso de memoria puede causar fallos o la terminación del proceso en algunos teléfonos móviles.
- Los fondos generados pueden contener artefactos visuales; deben revisarse antes de guardar.
- La descarga del modelo requiere consentimiento explícito y una confirmación adicional para permitir el uso de datos no Wi-Fi.
- No se detallan sesgos específicos; al ser un modelo de inpainting, los resultados pueden verse influidos por los datos de entrenamiento originales de LaMa, pero no se proporciona información al respecto.
- La licencia Apache-2.0 permite uso comercial, pero se deben conservar los archivos de licencia y atribución (LICENSE-LAMA.txt y LAMA-NOTICE.txt).

## Enlaces

- Hugging Face: https://huggingface.co/neureps/carousel-fit-models
- GitHub release mirror: https://github.com/neureps/carousel-fit-models/releases/tag/lama-v1
- Proyecto original LaMa: https://github.com/advimman/lama
- Conversión ONNX: https://github.com/Carve-Photos/lama
- Modelo upstream: https://huggingface.co/Carve/LaMa-ONNX
