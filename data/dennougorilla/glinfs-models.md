# dennougorilla/glinfs-models

## Resumen

`dennougorilla/glinfs-models` es un repositorio de conversiones ONNX en fp16 de tres checkpoints de BiRefNet, un modelo de segmentación dicotómica de imagen de alta resolución orientado a la eliminación de fondos (background removal). Lo publica el desarrollador dennougorilla como parte de Glinfs, una herramienta de captura de pantalla a GIF que funciona íntegramente en el navegador. El repositorio no entrena ni modifica los pesos: se limita a reexportar los modelos originales de ZhengPeng7 (BiRefNet general y lite) y de joelseytre (ToonOut, un fine-tune para anime) para que sean ejecutables con onnxruntime-web sobre el backend WebGPU.

El problema que resuelve es concreto: los exports ONNX públicos de BiRefNet fallan o devuelven máscaras vacías en WebGPU, porque los shaders de WebGPU tienen un límite de storage buffers por shader y ciertas operaciones (Sum, pooling en fp16) desbordan o producen NaN. Estas conversiones dividen los nodos Split y Concat con más de siete entradas o salidas, sustituyen Sum por cadenas de Add y mantienen en float32 la aritmética de índices de la convolución deformable y las operaciones de pooling global.

La relevancia es acotada pero clara para quien quiera segmentación de primer plano en el cliente sin servidor: los tres ficheros ONNX suman 1,2 GB en el repo, con un modelo lite de 122 MB que se ejecuta en unos 260 ms por fotograma en una RTX 3080 Ti. No es un modelo de lenguaje ni un modelo multimodal general; es un segmentador de imagen con entrada fija de 1024×1024.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | BiRefNet (segmentación dicotómica de imagen de alta resolución, basada en transformer con referencias bilaterales) |
| Parametros totales | no disponible (el repo solo publica tamaños de fichero ONNX: 519.348.204 bytes para general y ToonOut, 122.466.609 bytes para lite) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (no es un modelo de texto; entrada de imagen fija de 1024×1024) |
| Tipos de cuantizacion | fp16 en los pesos, con entrada y salida en float32; ciertas operaciones (índices de deformable conv, GlobalAveragePool/ReduceMean) forzadas a float32 |
| Idiomas soportados | no disponible (no procesa texto) |
| Licencia | MIT |
| Formato de pesos | ONNX (tres ficheros: `birefnet-general-fp16.onnx`, `birefnet-lite-fp16.onnx`, `birefnet-toonout-fp16.onnx`) |

## Arquitectura y entrenamiento

BiRefNet es un modelo de segmentación de imagen de alta resolución presentado por Zheng et al. en «Bilateral Reference for High-Resolution Dichotomous Image Segmentation» (CAAI AIR 2024). La arquitectura emplea referencias bilaterales (una rama de imagen completa y otra de parches de alta resolución) para producir máscaras binarias de primer plano con bordes finos sobre imágenes de 1024×1024. El repositorio de dennougorilla no aporta detalles adicionales sobre el número de tokens de entrenamiento, la composición del dataset ni si hubo RLHF o DPO; esa información pertenece a los repositorios upstream, no a esta conversión.

La innovación técnica de este repo no está en el entrenamiento, sino en la exportación: se dividen los nodos `Split` con más de siete salidas y los `Concat` con más de siete entradas para respetar el límite de storage buffers por shader de WebGPU; se sustituye `Sum` por cadenas de `Add`; se mantiene en float32 la aritmética de índices de la convolución deformable y las operaciones `GlobalAveragePool`/`ReduceMean` (en fp16 el pooling desborda en WebGPU y la máscara pasa a NaN). El resto de los pesos va en fp16, con entrada y salida en float32. La conversión es reproducible byte a byte con `scripts/export-birefnet-onnx.py` del repositorio Glinfs.

## Capacidades

- Segmentación de primer plano (background removal) sobre imágenes RGB de 1024×1024, con salida de máscara de un canal a la misma resolución.
- Tres variantes especializadas: `general` (uso general), `lite` (versión reducida, 122 MB, para entornos con menos recursos) y `toonout` (fine-tune orientado a ilustración y anime).
- Ejecución en navegador mediante onnxruntime-web con backend WebGPU, sin servidor ni subida de datos.
- Entrada normalizada con media ImageNet `[0.485, 0.456, 0.406]` y desviación `[0.229, 0.224, 0.225]`, escala 0..1.
- Salida float32 `[1, 1, 1024, 1024]`; el registro de modelos de Glinfs indica si la salida requiere sigmoide.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni capacidades multilingües: es un modelo puramente visual de segmentación.

## Casos de uso

- Eliminación de fondo en herramientas de captura a GIF en el navegador: es el caso original de Glinfs; el modelo procesa cada fotograma capturado y genera la máscara de primer plano en el cliente, sin enviar imágenes a un servidor.
- Editor de imágenes web sin backend: integración de la variante lite (122 MB) en un editor que necesite recortar sujetos con una latencia de unos 260 ms por imagen en GPU de gama alta.
- Preprocesado de datasets de visión por computador: generación de máscaras de primer plano para entrenar o evaluar otros modelos de segmentación, usando la variante general para máxima calidad.
- Segmentación de personajes en ilustración y anime: la variante ToonOut está ajustada específicamente para este dominio y evita los bordes imperfectos que la variante general produce en líneas de dibujo.
- Aplicaciones de videoconferencia o streaming en navegador: sustitución de fondo en tiempo real sobre fotogramas de cámara, siempre que el hardware supere los 8 GB de VRAM (no probado por debajo de ese umbral).
- Herramientas de accesibilidad y edición rápida en cliente: recorte automático de sujetos para miniaturas o avatares en aplicaciones web que no pueden permitirse infraestructura de inferencia.
- Procesado por lotes en local con onnxruntime nativo: los ficheros ONNX también pueden ejecutarse fuera del navegador con onnxruntime estándar, lo que permite usarlos en pipelines de escritorio o servidor sin GPU dedicada de gran tamaño si se usa la variante lite.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de calidad (mIoU, F-measure, etc.) en la información disponible. Los únicos datos de rendimiento publicados son medidas de inferencia en navegador:

| Modelo | Tiempo por fotograma | Memoria de GPU | Entorno |
|---|---|---|---|
| `birefnet-general-fp16.onnx` | ~485 ms | 7,7 GB | Chrome 157, onnxruntime-web 1.30.0, RTX 3080 Ti |
| `birefnet-toonout-fp16.onnx` | ~485 ms | 7,7 GB | Chrome 157, onnxruntime-web 1.30.0, RTX 3080 Ti |
| `birefnet-lite-fp16.onnx` | ~260 ms | 5,8 GB | Chrome 157, onnxruntime-web 1.30.0, RTX 3080 Ti |

El autor indica que no se ha probado en GPU de 8 GB o menos.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto / entrada | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `dennougorilla/glinfs-models` (esta ficha) | BiRefNet ONNX fp16 para WebGPU | no disponible (519 MB / 122 MB en disco) | Imagen 1024×1024 | MIT | Hugging Face, ONNX |
| `ZhengPeng7/BiRefNet` | BiRefNet original en safetensors/PyTorch | no disponible | Imagen 1024×1024 | MIT (según el repo de conversión) | Hugging Face |
| `ZhengPeng7/BiRefNet_lite` | BiRefNet reducido original | no disponible | Imagen 1024×1024 | MIT (según el repo de conversión) | Hugging Face |
| `joelseytre/toonout` | Fine-tune de BiRefNet para anime | no disponible | Imagen 1024×1024 | no disponible | Hugging Face |

La comparación relevante es de formato y despliegue, no de calidad: los tres modelos upstream son los mismos pesos, y este repositorio solo cambia el grafo para que funcione en WebGPU. Frente a alternativas de segmentación genéricas (SAM, U2-Net, etc.) no hay datos comparativos publicados en la información disponible.

## Limitaciones y advertencias

- No es un modelo de lenguaje: no procesa texto, no tiene contexto de tokens ni capacidades de razonamiento, tool calling o agentes.
- Resolución de entrada fija de 1024×1024; no se documenta soporte para otras resoluciones.
- El autor no ha probado el modelo en GPU de 8 GB o menos; el consumo medido en la variante general y ToonOut (7,7 GB) deja poco margen y puede provocar fallos o swap en GPUs consumer de gama media.
- Los pesos son fp16 con operaciones críticas en float32; no se publican cuantizaciones int8 ni otras variantes de menor precisión.
- Riesgo de máscaras incorrectas en dominios alejados del entrenamiento (la variante general está pensada para fotografía; ToonOut para ilustración).
- No se documentan sesgos demográficos ni de otro tipo en el repositorio; al ser un modelo de segmentación, el riesgo principal es la calidad desigual de la máscara según el tipo de imagen.
- La licencia MIT se hereda de los modelos upstream según el autor, pero conviene verificar la licencia de cada checkpoint original antes de uso comercial, ya que el repo no incluye los términos completos de terceros.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta; no hay validación comunitaria ni issues públicos que permitan contrastar la calidad de las conversiones.
- El SHA-256 de los ficheros está publicado, lo que permite verificar la integridad de las descargas.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/dennougorilla/glinfs-models
- Proyecto Glinfs (GitHub): https://github.com/dennougorilla/glinfs
- Script de conversión: https://github.com/dennougorilla/glinfs/blob/main/scripts/export-birefnet-onnx.py
- Registro de modelos de Glinfs: https://github.com/dennougorilla/glinfs/blob/main/src/features/ai-cutout/model-registry.js
- BiRefNet original: https://huggingface.co/ZhengPeng7/BiRefNet
- BiRefNet lite: https://huggingface.co/ZhengPeng7/BiRefNet_lite
- ToonOut: https://huggingface.co/joelseytre/toonout
- Repositorio BiRefNet (GitHub): https://github.com/ZhengPeng7/BiRefNet
- Paper BiRefNet (Zheng et al., CAAI AIR 2024): https://github.com/ZhengPeng7/BiRefNet
