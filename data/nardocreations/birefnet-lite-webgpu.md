# NardoCreations/birefnet-lite-webgpu

## Resumen

BiRefNet lite for WebGPU es una reexportación del modelo BiRefNet_lite de ZhengPeng7 (revisión `aa62cd8`), preparada por NardoCreations para su ejecución en el navegador mediante ONNX Runtime Web sobre WebGPU. El modelo original es una red de segmentación de imágenes especializada en eliminación de fondo (matting) de alta calidad; esta variante conserva los pesos íntegros y modifica únicamente la representación de la convolución deformable para que sea compatible con el backend WebGPU.

El problema que resuelve es la imposibilidad de ejecutar los exports públicos de BiRefNet en WebGPU: la operación `torchvision.ops.deform_conv2d` se traducción a operadores que WebGPU no puede procesar. Esta reexportación sustituye esa operación por una combinación aritméticamente equivalente de `grid_sample` bilineal, un modulador y una convolución 1×1, con una discrepancia de 2·10⁻⁷ en la matte resultante.

Es relevante porque permite ejecutar eliminación de fondo de calidad profesional íntegramente en el equipo del usuario, sin enviar imágenes a servidores externos. El modelo tiene entrada y salida fijas de 640×640, pesa aproximadamente 0,2 GB en el repositorio y está publicado bajo licencia MIT, lo que facilita su integración en aplicaciones web comerciales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | BiRefNet (basada en transformer jerárquico con decodificador multi-escala; convolución deformable reformulada como grid_sample + convolución 1×1) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo de visión, entrada fija 1×3×640×640) |
| Tipos de cuantizacion | no disponible (export ONNX con pesos originales, sin cuantización declarada) |
| Idiomas soportados | no disponible |
| Licencia | MIT (Copyright (c) 2024 ZhengPeng) |
| Formato de pesos | ONNX (ejecutable en ONNX Runtime Web sobre WebGPU) |

## Arquitectura y entrenamiento

BiRefNet es una arquitectura de segmentación binaria de alta resolución que combina un backbone tipo transformer jerárquico con un decodificador multi-escala y módulos de refinamiento. La variante lite reduce el coste computacional respecto al modelo completo, manteniendo la calidad de matting. Esta reexportación no altera los pesos ni el entrenamiento original; solo cambia la forma en que la convolución deformable se representa en el grafo ONNX.

La modificación técnica clave consiste en reescribir `torchvision.ops.deform_conv2d` como una multiplicación entre un `grid_sample` bilineal y un modulador, seguida de una convolución 1×1. Según el autor, la equivalencia aritmética se mantiene con un error de 2·10⁻⁷ sobre la matte. La forma de entrada y salida está fijada (640×640), la normalización ImageNet y la sigmoide están integradas dentro del grafo, y los pesos permanecen sin cambios. No se dispone de información sobre el número de tokens, composición del dataset ni fases de RLHF/DPO del modelo original en la información proporcionada.

## Capacidades

- Segmentación de imágenes para eliminación de fondo (matting) de personas y objetos.
- Entrada RGB normalizada internamente (1×3×640×640, valores 0…1).
- Salida de matte binaria/continua (1×1×640×640, valores 0…1) con sigmoide integrada.
- Ejecución en navegador mediante ONNX Runtime Web sobre WebGPU.
- Procesamiento local, sin dependencia de servidores externos.
- No se declaran capacidades de generación de texto, razonamiento, código, tool calling, agentes ni multimodalidad textual.
- Idiomas: no disponible (modelo puramente visual).

## Casos de uso

- Eliminación de fondo en aplicaciones web de edición fotográfica: el modelo se ejecuta en el navegador del usuario vía WebGPU, permitiendo recortar personas y objetos sin subir imágenes a un servidor y preservando la privacidad.
- Herramientas de diseño gráfico integradas en el navegador: generación de mattes de 640×640 para composición de capas, con latencia de aproximadamente 0,5 s por fotograma en hardware consumer.
- Procesamiento por lotes de catálogos de producto: automatización del recorte de fondos en imágenes de e-commerce directamente en el equipo del operador, reduciendo costes de infraestructura.
- Edición de vídeo o retoque en tiempo real: al alcanzar ~0,5 s por fotograma en una RTX 3050, puede emplearse en flujos de trabajo interactivos o previsualizaciones de vídeo con recorte de sujeto.
- Aplicaciones de privacidad-first: herramientas de anonimización o separación de sujetos en entornos donde no se permite el envío de imágenes a la nube (sanidad, legal, educación).
- Integración en pipelines de CI/CD para generación de assets: creación automática de imágenes con fondo transparente durante el build de sitios web o aplicaciones, usando ONNX Runtime en lugar de servicios externos.
- Prototipado rápido de funciones de segmentación: al ser un export ONNX ligero (0,2 GB) y con licencia MIT, sirve como base para experimentar con segmentación en WebGPU antes de escalar a modelos mayores.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

El autor declara una velocidad de aproximadamente 0,5 s por fotograma en una GPU de portátil RTX 3050 con ONNX Runtime Web 1.30, y una discrepancia de 2·10⁻⁷ en la matte respecto al export original. No se proporcionan métricas de IoU, F-score ni comparaciones cuantitativas con otros modelos.

## Requisitos de hardware

- VRAM estimada: no disponible con precisión; el repositorio ocupa 0,2 GB y la entrada fija de 640×640 sugiere un consumo moderado, apto para GPUs consumer.
- GPU recomendadas: el autor reporta funcionamiento en una RTX 3050 de portátil; previsiblemente funciona en GPUs integradas compatibles con WebGPU, aunque con mayor latencia.
- Cabe en GPU consumer: sí, según la referencia del autor a una RTX 3050.
- Opciones de despliegue: ONNX Runtime Web sobre WebGPU (navegador); también puede ejecutarse con ONNX Runtime nativo en servidor o escritorio.
- Latencia y throughput: ~0,5 s por fotograma en RTX 3050 con ONNX Runtime Web 1.30; throughput no disponible para otras configuraciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto/entrada | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| NardoCreations/birefnet-lite-webgpu | no disponible | 640×640 fijo | ONNX (WebGPU) | MIT | Reexport compatible con WebGPU, ~0,5 s/frame en RTX 3050 |
| ZhengPeng7/BiRefNet_lite | no disponible | no disponible | PyTorch | MIT | Modelo base original; convolución deformable no ejecutable en WebGPU |
| ZhengPeng7/BiRefNet (completo) | no disponible | no disponible | PyTorch | MIT | Mayor coste computacional, mayor calidad potencial; no disponible en WebGPU |

No se dispone de datos de benchmarks para establecer una comparación cuantitativa de rendimiento entre estas variantes.

## Limitaciones y advertencias

- Modelo exclusivamente de segmentación/matting: no ofrece generación de texto, razonamiento ni otras capacidades de los LLM.
- Entrada fija de 640×640: imágenes de otra resolución deben redimensionarse, lo que puede afectar la precisión en detalles finos.
- Dependencia de WebGPU: navegadores o dispositivos sin soporte WebGPU no podrán ejecutar el modelo con este export.
- Riesgo de errores en casos límite: pelo fino, transparencias, bordes difusos o sujetos poco contrastados pueden producir mattes imperfectas.
- Sesgos: no se documentan sesgos específicos; al derivar de un dataset de entrenamiento no especificado en la información disponible, puede heredar limitaciones de representación del original.
- Licencia MIT: permite uso comercial, pero debe conservarse el aviso de copyright original (Copyright (c) 2024 ZhengPeng).
- Cambio de operador: aunque el autor reporta equivalencia aritmética (2·10⁻⁷), conviene validar la calidad de la matte en el dominio de aplicación concreto antes de producción.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: poca validación comunitaria disponible.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/NardoCreations/birefnet-lite-webgpu
- Modelo base: https://huggingface.co/ZhengPeng7/BiRefNet_lite
- Repositorio NardoCut (script de export en `tools/birefnet/`): no disponible en la información proporcionada
- Paper de BiRefNet: no disponible en la información proporcionada
