# Blaize-AI/ConvNeXtV2p_ImageNet

## Resumen

ConvNeXtV2p_ImageNet es un clasificador de imágenes derivado de ConvNeXt V2, la arquitectura convolucional pura (sin atención) publicada por Meta Platforms en 2023 como evolución de ConvNeXt. En concreto, este repositorio contiene los pesos del modelo tal como los expone la librería `timm` (Ross Wightman) y ha sido recompilado por Blaize-AI para ejecutarse sobre sus aceleradores Xplorer mediante el SDK Picasso, que genera grafos optimizados para su procesador GSP (Graph Streaming Processor).

No se trata, por tanto, de un modelo de lenguaje ni de un modelo generativo: es un clasificador de ImageNet 2012 con entrada de 224×224 píxeles, pensado para inferencia en el borde (edge AI). Su relevancia es fundamentalmente de despliegue: demuestra el flujo de conversión de un modelo `timm` a un formato propietario `.bm` con cuantización AMP (mezcla de INT8 y BF16), lo que permite evaluar el coste de portar visión por computador a hardware de aceleración específica.

El repositorio tiene un tamaño declarado de 0,0 GB, cero descargas y cero likes, y solo incluye una variante (`ConvNeXtV2p_ImageNet_amp_224_224`). La información pública disponible es muy limitada: no se detallan parámetros, número de clases, ni resultados de precisión tras la cuantización.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ConvNeXt V2 (red convolucional pura, sin mecanismos de atención), implementación de `timm` |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión; entrada de imagen 224×224) |
| Tipos de cuantizacion | AMP (mezcla INT8 + BF16); el autor documenta también INT8 y BF16 como métodos soportados por el SDK |
| Idiomas soportados | no aplica (clasificación de imágenes; etiquetas de ImageNet en inglés) |
| Licencia | Apache-2.0 |
| Formato de pesos | `.bm` (formato propietario de Blaize para su acelerador Xplorer) |
| Framework original | PyTorch (`timm`) |
| Dataset de referencia | ImageNet 2012 (1000 clases) |
| Resolucion de entrada | 224×224 (W×H) |
| Variantes incluidas | 1 (`ConvNeXtV2p_ImageNet_amp_224_224`) |

## Arquitectura y entrenamiento

La arquitectura subyacente es ConvNeXt V2, una red convolucional jerárquica que moderniza el diseño de ResNet con bloques depthwise, normalización LayerNorm, activación GELU y un esquema de escalado tipo transformer. ConvNeXt V2 añade a la versión original la capa FCMAE (Fully Convolutional Masked Autoencoder) para preentrenamiento auto-supervisado, aunque este repositorio parte de los pesos preentrenados publicados por Meta en `facebookresearch/ConvNeXt-V2` y de la implementación de `timm`.

No hay información sobre el proceso de entrenamiento específico de esta variante: se desconoce el número de épocas, el régimen de aumentación de datos o si hubo ajuste fino adicional. El único dato cierto es el dataset de evaluación/entrenamiento declarado: ImageNet 2012, con su licencia `LicenseRef-ImageNet`. La innovación técnica relevante aquí no está en el modelo sino en el pipeline de despliegue: la conversión a `.bm` mediante el SDK Picasso, que aplica optimizaciones específicas de hardware (fusión de operadores, mapeo al grafo del GSP) y cuantización AMP.

## Capacidades

- Clasificación de imágenes en las 1000 clases de ImageNet 2012.
- Extracción de características visuales (al ser una CNN, las activaciones intermedias pueden usarse como embedding, aunque el repositorio no lo documenta explícitamente).
- Inferencia de baja latencia en hardware de borde Blaize Xplorer (GSP).
- Ejecución con cuantización AMP, que combina precisión BF16 en capas sensibles e INT8 en el resto.
- Inspección del modelo mediante `blaize-modeltool info`.
- No soporta tool calling, agentes, razonamiento multi-paso ni generación de texto: no es un modelo de lenguaje.
- No se documentan capacidades multilingües, de visión-lenguaje, audio ni modo "thinking".

## Casos de uso

- Clasificación de imágenes en el borde: el modelo se ejecuta sobre el acelerador Xplorer con entrada 224×224, adecuado para cámaras industriales o domóticas donde no se quiere enviar vídeo a la nube y se necesita inferencia local de baja latencia.
- Control de calidad en líneas de producción: clasificar piezas o defectos en tiempo real con un modelo convolucional cuantizado a AMP, que reduce el consumo energético frente a FP32.
- Filtrado previo en pipelines de visión: usar las predicciones de ImageNet como etapa de triaje para descartar imágenes irrelevantes antes de pasarlas a modelos más pesados.
- Prototipado de despliegue en hardware Blaize: sirve como referencia para validar el flujo Picasso SDK → `.bm` antes de portar modelos propios.
- Benchmarking de cuantización: comparar la precisión AMP frente a INT8 y BF16 en el mismo acelerador para calibrar el compromiso precisión/velocidad.
- Docencia y experimentación con `timm`: al derivar de una implementación estándar, permite reproducir la conversión y estudiar el efecto de las optimizaciones específicas de hardware.
- Sistemas de etiquetado automático de imágenes a pequeña escala en entornos con conectividad limitada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas de precisión (top-1/top-5) tras la cuantización AMP, ni latencia o throughput medidos en el acelerador Xplorer.

## Requisitos de hardware

- Hardware obligatorio: acelerador Blaize Xplorer AI (procesador GSP). El modelo no está pensado para ejecutarse en GPU convencional en su formato `.bm`.
- SDK requerido: Blaize Picasso SDK instalado y configurado.
- VRAM estimada: no disponible (depende del acelerador; no se ejecuta en GPU estándar).
- GPU recomendadas: no aplica; para ejecutar el modelo original de `timm` haría falta una GPU convencional, pero los pesos `.bm` no son compatibles con PyTorch directamente.
- Compatibilidad con GPU de consumo: no disponible en el formato publicado; el modelo `timm` original sí cabría en GPUs de consumo, pero no se distribuye aquí.
- Opciones de despliegue: Blaize Picasso SDK y `blaize-modeltool`; no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI (no aplican a un clasificador de visión).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Entrada | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| ConvNeXtV2p_ImageNet (este) | no disponible | 224×224 | Apache-2.0 | `.bm` (Blaize) | Optimizado para Xplorer; sin métricas publicadas |
| ConvNeXt V2 (original, Meta) | según variante (T/S/B/L/H) | 224×224 | CC BY-NC 4.0 (pesos) / Apache-2.0 (código) | PyTorch | Referencia académica; pesos no comerciales |
| ConvNeXt V1 (`timm`) | según variante | 224×224 | Apache-2.0 | PyTorch / safetensors | Alternativa estándar en `timm`, sin optimización de hardware |
| EfficientNet (familia) | según variante | 224×224 | Apache-2.0 | PyTorch / TFLite | Clasificador de visión eficiente para edge, con soporte amplio |

La comparación directa es difícil porque este repositorio no publica parámetros ni precisión. Frente a los pesos originales de ConvNeXt V2, la diferencia clave es la licencia (Apache-2.0 aquí frente a CC BY-NC en los pesos de Meta) y el formato propietario.

## Limitaciones y advertencias

- Solo funciona sobre hardware Blaize Xplorer con el SDK Picasso; no es portable a GPU o CPU sin reconvertir desde el modelo `timm` original.
- No se publican métricas de precisión tras la cuantización AMP, por lo que se desconoce la degradación respecto a FP32.
- El modelo está limitado a las 1000 clases de ImageNet 2012; no es un clasificador de propósito general.
- No hay información sobre sesgos: ImageNet contiene sesgos conocidos de representación demográfica y geográfica que se heredan.
- Riesgo de clasificación errónea fuera de la distribución de ImageNet (imágenes médicas, industriales, etc.).
- La licencia Apache-2.0 aplica al modelo, pero el dataset ImageNet tiene su propia licencia (`LicenseRef-ImageNet`) que puede restringir el uso comercial de los pesos derivados; conviene revisarla.
- El autor declara explícitamente que no ofrece garantías ni asume responsabilidad sobre el contenido de terceros.
- El repositorio tiene 0 descargas y 0 likes: no hay evidencia de uso en producción ni validación comunitaria.
- El tamaño del repo (0,0 GB) y la ausencia de documentación sobre parámetros dificultan evaluar su idoneidad sin descargarlo.

## Enlaces

- HuggingFace: https://huggingface.co/Blaize-AI/ConvNeXtV2p_ImageNet
- Blaize (web oficial): https://www.blaize.com
- Implementación `timm` de ConvNeXt: https://github.com/huggingface/pytorch-image-models/blob/main/timm/models/convnext.py
- Pesos originales ConvNeXt V2 (Meta): https://github.com/facebookresearch/ConvNeXt-V2
- Dataset ImageNet: https://www.image-net.org/
