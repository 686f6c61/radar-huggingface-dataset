# ohaiibuzzle/DA3-ONNX

## Resumen

DA3-ONNX es un repositorio de exportaciones en formato ONNX de los modelos Depth Anything 3 (DA3) Mono Large y DA3-Small, desarrollados originalmente por ByteDance Seed. La conversión ha sido realizada por el usuario ohaiibuzzle con un objetivo muy concreto: servir de backend de estimación de profundidad monocular para el proyecto ReViBlur, una aplicación orientada a dispositivos Android con chips Snapdragon.

A diferencia del modelo original en PyTorch, estas exportaciones utilizan formas estáticas de 504×378 píxeles, lo que permite compilar los grafos para el backend QNN HTP (NPU) de Qualcomm. El repositorio incluye cuatro variantes: fp32 sin modificar, una cuantización estática w8a16 optimizada para NPU, y dos versiones con cuantización dinámica int8 para CPU y NNAPI. La calidad de la cuantización w8a16 es notable: mantiene una correlación de Spearman de 0,971 frente al 0,972 del fp32, con una latencia de unos 0,2 segundos en el NPU Hexagon V81.

Es relevante ahora porque demuestra una receta práctica y documentada para llevar modelos de profundidad basados en Vision Transformers a móviles, incluyendo soluciones a problemas reales de cuantización (como el rechazo de LayerNorm con gammas int8 en HTP) que suelen quedar fuera de la documentación oficial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision Transformer (ViT) para estimación de profundidad monocular (Depth Anything 3) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no aplicable (modelo de visión) |
| Tipos de cuantizacion | fp32, w8a16 (QDQ estático: pesos int8 por canal, activaciones uint16), int8 dinámico (solo pesos de MatMul/Gemm) |
| Idiomas soportados | no aplicable (modelo de visión) |
| Licencia | Apache-2.0 |
| Formato de pesos | ONNX (opset 17 para fp32 e int8; opset 21 para w8a16) |

## Arquitectura y entrenamiento

El modelo base es Depth Anything 3, una familia de modelos de estimación de profundidad de ByteDance Seed descrita en el artículo *Depth Anything 3: Recovering the Visual Space from Any Views* (Lin et al., 2025). Este repositorio exporta dos variantes: DA3 Mono Large (un ViT de gran tamaño, con pesos de aproximadamente 1,3 GB en fp32) y DA3-Small (unos 37 MB en int8). La exportación de DA3-Small elimina la cabeza de predicción de rayos ("ray head"), ya que esa parte del checkpoint está parcialmente sin entrenar y no se utiliza para la tarea de profundidad.

El entrenamiento original corresponde a ByteDance y no se detalla en la model card de este repositorio. Lo que sí documenta el autor es el proceso de conversión: las exportaciones fp32 se generan con las herramientas del repositorio oficial de Depth Anything 3, verificando que coinciden con PyTorch con un error relativo máximo de 9e-5 (Large) y 1e-5 (Small). La cuantización w8a16 emplea calibración MinMax sobre 48 fotos variadas tomadas con teléfonos móviles, usando la configuración de cuantización QNN de onnxruntime. Un detalle técnico destacable: las gammas de LayerNorm se almacenan en uint8 porque el backend HTP rechaza LayerNorm con gammas int8 simétricas (error 3110). No se ofrece w8a8 estático porque los valores atípicos de activación del ViT degradan la profundidad hasta convertirla en ruido.

## Capacidades

- Estimación de profundidad monocular relativa a partir de una imagen RGB, con salida en formato "far = large" (la disparidad se obtiene como 1/depth).
- Salida de máscara de cielo ("sky score") en la variante Mono Large, con umbral recomendado de 0,3 para clasificar un píxel como cielo.
- Inferencia optimizada para NPU de Qualcomm (Snapdragon, backend QNN HTP) en las variantes fp32 y w8a16.
- Inferencia en CPU móvil y NNAPI con las variantes int8 dinámicas.
- Entrada con normalización ImageNet (media 0,485/0,456/0,406, desviación 0,229/0,224/0,225), formato horizontal fijo de 504×378; las fotos verticales deben rotarse antes de la inferencia.
- No incluye el "sky clamp" de DA3 (muestreo aleatorio + cuantil); debe aplicarse externamente si es necesario.

## Casos de uso

- Desenfoque de retrato en móvil (caso de uso original, ReViBlur): el mapa de profundidad permite calcular un bokeh realista separando sujeto y fondo; la variante w8a16 en NPU Hexagon V81 alcanza unos 0,2 segundos por imagen, adecuado para procesamiento casi interactivo.
- Fotografía computacional en dispositivos Android: la variante Small int8 (37 MB, 0,18 s por imagen en CPU) permite añadir efectos de profundidad en teléfonos de gama baja sin necesidad de NPU.
- Segmentación de cielo para edición automática: la salida `sky` del modelo Large permite reemplazar o ajustar cielos en aplicaciones de edición fotográfica con un umbral simple de 0,3.
- Realidad aumentada ligera: la profundidad relativa por píxel sirve para anclar efectos u objetos virtuales detrás de personas y objetos reales en capturas estáticas.
- Accesibilidad y navegación asistida: la estimación de profundidad en tiempo casi real desde la cámara puede informar al usuario sobre obstáculos y distancias relativas.
- Organización automática de galerías: la máscara de cielo y el mapa de profundidad permiten clasificar fotos de paisaje, retrato o primer plano sin metadatos.
- Preprocesamiento para pipelines de visión 3D: los mapas de profundidad pueden alimentar reconstrucciones aproximadas de escena o filtros de calidad en apps de escaneo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, etc.) al no ser aplicables a un modelo de visión. La model card sí incluye mediciones propias de calidad y latencia:

Spearman (correlación de rangos de 1/depth frente a la profundidad de retrato de un vivo X300 Ultra, en una foto) y tiempo por ejecución en CPU de Mac:

| Variante | Spearman | Tiempo CPU |
|---|---|---|
| Large fp32 | 0,972 | 2,4 s |
| Large w8a16 | 0,971 | 2,9 s (NPU: ~0,2 s en Hexagon V81) |
| Large int8 | 0,965 | 1,4 s |
| Small int8 | 0,907 | 0,18 s |

Calibración w8a16 sobre 32 fotos, validada contra fp32 en otras 16 (disparidad escalada a p99 = 2600): error absoluto medio de 10 y Spearman ≥ 0,9975 en todas las fotos. La cuantización dinámica int8, en cambio, presenta un error absoluto medio de 529 y Spearman que llega a 0,35 en algunos casos.

## Requisitos de hardware

- Variante Large fp32 (1,34 GB): funciona en CPU de escritorio (2,4 s por imagen en un Mac); para Snapdragon NPU/GPU según la model card. En servidores, cualquier GPU moderna con al menos 2 GB de VRAM libres lo ejecuta sin problema.
- Variante Large w8a16 (340 MB): diseñada para el NPU de Snapdragon (QNN HTP); ~0,2 s por imagen en Hexagon V81. También funciona en CPU, pero más lenta que fp32.
- Variante Large int8 (431 MB): para CPU y NNAPI; no funciona en el backend QNN HTP.
- Variante Small int8 (37 MB): cabe en prácticamente cualquier teléfono Android; pensada para dispositivos de gama baja.
- Despliegue: onnxruntime (con paquete QNN para NPU de Qualcomm) y NNAPI en Android. No hay soporte directo documentado para vLLM, llama.cpp, Ollama o TGI, que no son aplicables a este tipo de modelo.
- Latencia estimada: 0,18 s (Small int8, CPU) a 2,9 s (Large w8a16, CPU); ~0,2 s en NPU Hexagon V81.

## Comparativa con modelos similares

| Modelo | Formato | Tamaño (aprox.) | Objetivo de despliegue | Licencia |
|---|---|---|---|---|
| DA3-ONNX (Large w8a16) | ONNX QDQ | 340 MB | NPU Snapdragon (QNN HTP) | Apache-2.0 |
| DA3-ONNX (Small int8) | ONNX int8 dinámico | 37 MB | CPU móvil de gama baja | Apache-2.0 |
| depth-anything/DA3MONO-LARGE (original) | PyTorch | no disponible | Servidor/GPU | Apache-2.0 |
| depth-anything/DA3-SMALL (original) | PyTorch | no disponible | Servidor/GPU | Apache-2.0 |

Alternativas de la misma categoría (estimación de profundidad monocular en dispositivos) como MiDaS, Depth Anything V2 o ZoeDepth no se incluyen en la información proporcionada, por lo que una comparativa detallada de rendimiento no está disponible. La ventaja diferencial de esta ficha es que las exportaciones están específicamente calibradas y validadas para hardware Qualcomm móvil, algo que las versiones oficiales en PyTorch no cubren.

## Limitaciones y advertencias

- Tamaño de entrada fijo de 504×378 en orientación horizontal: las imágenes verticales deben rotarse antes de la inferencia, y cualquier otra resolución requiere redimensionado con la consecuente pérdida de detalle.
- La variante Small int8 no incluye la salida `sky`.
- El "sky clamp" de DA3 no está integrado en el grafo; hay que implementarlo externamente.
- La cuantización dinámica int8 degrada seriamente la calidad en algunas fotos (Spearman hasta 0,35) y produce fondos más planos; para máxima fidelidad se recomienda la variante w8a16.
- La variante w8a16 es más lenta que fp32 en CPU, por lo que su uso está claramente orientado al NPU.
- No se ofrece cuantización estática w8a8 debido a los valores atípicos de activación del ViT, lo que limita las opciones de compresión adicional.
- La salida es profundidad relativa, no métrica: no proporciona distancias en unidades del mundo real.
- En cuanto a sesgos y riesgo de alucinación, no aplican en el sentido de los modelos de lenguaje, pero la calidad de la profundidad depende de la iluminación y el contenido de la escena; solo se han documentado validaciones con un conjunto muy pequeño de fotos de móvil.
- La licencia Apache-2.0 no impone restricciones al uso comercial.

## Enlaces

- Repositorio del modelo: https://huggingface.co/ohaiibuzzle/DA3-ONNX
- Modelo base Mono Large: https://huggingface.co/depth-anything/DA3MONO-LARGE
- Modelo base Small: https://huggingface.co/depth-anything/DA3-SMALL
- Repositorio oficial de Depth Anything 3: https://github.com/ByteDance-Seed/Depth-Anything-3
- Proyecto ReViBlur (motivo de la exportación): https://git.ohaiibuzzle.dev/ohaiibuzzle/ReViBlur
- Artículo: *Depth Anything 3: Recovering the Visual Space from Any Views* (Lin et al., 2025); enlace directo no disponible en la información proporcionada.
