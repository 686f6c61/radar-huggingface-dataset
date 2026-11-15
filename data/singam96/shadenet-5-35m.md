# singam96/ShadeNet-5-35M

## Resumen

ShadeNet-5-35M es un modelo de *inverse rendering* de una sola imagen desarrollado por el usuario singam96. A partir de una única fotografía RGB predice tres mapas intrínsecos: albedo (color base), profundidad relativa y normales de superficie. El modelo se construye sobre un backbone DINOv2 ViT-S/14 de Meta AI congelado, al que se añade una UNet paralela entrenable que aplica una corrección residual sobre un prior derivado de la propia foto.

La arquitectura es una ParallelUNet con diccionarios de parches y cabezas de salida por mapa, con un total de 34,6 millones de parámetros, de los cuales solo 12,6 millones son entrenables (los 22,1 millones restantes corresponden al tronco DINOv2 congelado). El modelo opera con entradas de 448x448 píxeles (o múltiplos de 448) y produce una salida de 7 canales en el rango [-1, 1]: los tres primeros para albedo, uno para profundidad y tres para normales.

Su relevancia radica en que resuelve la descomposición intrínseca en un único pase hacia adelante, sin difusión ni iteración, lo que lo hace mucho más ligero que alternativas generativas como Marigold. La licencia Apache-2.0 facilita su uso comercial. No obstante, el propio autor advierte que las métricas se han medido sobre un conjunto de validación de solo 23 imágenes con pseudo-etiquetas, por lo que deben considerarse indicativas y no comparables a un benchmark formal.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ParallelUNet con backbone DINOv2 ViT-S/14 congelado; corrección residual sobre prior fijo derivado de la foto |
| Parametros totales | 34.652.431 (12.595.855 entrenables + 22,1M del tronco DINOv2 congelado) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión; entrada de 448x448 o 896x896) |
| Tipos de cuantizacion | exportaciones ONNX de 4 y 8 bits del modelo podado (descritas en la model card) |
| Idiomas soportados | no disponible (modelo de imagen, sin procesamiento de lenguaje) |
| Licencia | Apache-2.0 |
| Formato de pesos | PyTorch (repo de 0,2 GB); exportaciones ONNX cuantizadas disponibles |

## Arquitectura y entrenamiento

El modelo combina un codificador DINOv2 ViT-S/14 congelado con una UNet paralela entrenable. La UNet incorpora diccionarios de parches (8.582.400 parámetros distribuidos en cuello de botella y tres niveles de decodificador) y patrones fijos plegados en entrada, cinco niveles del encoder, tres del decodificador y salida. La red no predice los mapas directamente, sino una corrección residual sobre un prior "mix" fijo derivado de la propia fotografía, lo que estabiliza el entrenamiento y reduce la carga de la red entrenable.

El checkpoint presentado corresponde a la época 19 de entrenamiento y está podado. La model card no detalla el número de tokens de entrenamiento, la composición del dataset ni si se emplearon técnicas de RLHF o DPO (no aplicables en un modelo de visión). Las etiquetas de validación son pseudo-etiquetas generadas con Marigold-V2 (la profundidad se decodifica de la visualización en color de Marigold), y la pérdida de profundidad es invariante a escala y desplazamiento. Respecto a la versión anterior (ShadeNet-3.2), este modelo elimina el canal de sombreado (7 canales en lugar de 8). El autor señala que el salto de rendimiento frente al run previo (MobileNetV2, pérdida L1 enmascarada, 384px, 6 épocas) no puede atribuirse a un único cambio, ya que se modificaron simultáneamente backbone, pérdida, resolución y duración del entrenamiento.

## Capacidades

- Descomposición intrínseca de una sola imagen en albedo, profundidad relativa y normales de superficie en un único pase hacia adelante.
- Salida de 7 canales en el rango [-1, 1]: `[0:3]` albedo, `[3:4]` profundidad, `[4:7]` normales.
- Estimación de profundidad relativa por imagen (no métrica ni absoluta).
- Generación de mapas de normales de superficie con posibilidad de reescalado a longitud unitaria.
- Ensamblado en tiempo de test: promedio sobre la imagen espejada y sobre rotaciones de ±4 grados (seis pases) para mejorar las métricas.
- Entrada de alta resolución limitada a múltiplos de 448 (448 o 896 píxeles).
- Exportación a ONNX en 4 y 8 bits del modelo podado.
- No soporta tool calling, agentes, razonamiento multi-paso ni capacidades multilingües (es un modelo puramente visual).

## Casos de uso

- **Previsualización de materiales en pipelines de renderizado**: el modelo genera albedo y normales por imagen para alimentar motores de renderizado o herramientas de *relighting* sin necesidad de captura multi-iluminación, gracias a su salida de 7 canales en un solo pase.
- **Generación de *assets* para videojuegos y VFX**: a partir de fotografías de referencia se obtienen mapas de albedo y normales utilizables como texturas base, con la ventaja de que la licencia Apache-2.0 permite uso comercial.
- **Reconstrucción 3D aproximada y *depth completion***: la profundidad relativa sirve como inicialización para pipelines de fotogrametría o para tareas de *inpainting* de profundidad en escenas donde solo se dispone de una vista.
- **Edición de imagen basada en intrinsics**: separar albedo de iluminación permite recolorear objetos o simular cambios de iluminación en postproducción fotográfica, usando el albedo como capa de color base.
- **Preprocesado para modelos de visión posteriores**: los mapas de normales y profundidad pueden alimentar detectores, segmentadores o modelos de *novel view synthesis* que requieran información geométrica adicional.
- **Prototipado rápido en investigación**: al ser un modelo pequeño (34,7M parámetros, 0,2 GB) y de un solo pase, es adecuado para experimentos de descomposición intrínseca en entornos con recursos limitados, con la salvedad de que sus métricas son indicativas.
- **Herramienta de anotación asistida**: generar pseudo-etiquetas de albedo, profundidad y normales para preanotar datasets de imágenes, que luego se revisan manualmente.

## Benchmarks y rendimiento

Resultados de L1 por mapa (salida cruda frente a etiqueta; albedo y normales enmascarados donde la etiqueta no es válida) sobre la partición de validación de 23 imágenes a 448px, checkpoint de la época 19 podado:

| Mapa | Pase único | Promedio espejo + normales unitarias | Espejo + rotaciones ±4° + normales unitarias |
|---|---|---|---|
| Albedo | 0,1804 | 0,1794 | 0,1734 |
| Profundidad | 0,1754 | 0,1704 | 0,1653 |
| Normales | 0,1730 | 0,1537 | 0,1497 |
| **Media** | 0,1763 | 0,1679 | **0,1628** |

Comparación con el run anterior (MobileNetV2, pérdida L1 enmascarada, 384px, 6 épocas), ambos como pase único sobre las mismas 23 imágenes:

| Mapa | Run anterior | Este modelo |
|---|---|---|
| Albedo | 0,2474 | 0,1804 |
| Profundidad | 0,3628 | 0,1754 |
| Normales | 0,2744 | 0,1730 |
| **Media** | 0,3141 | **0,1763** |

El error angular medio de las normales baja de 20,6° a 18,3° con el promedio espejo y a 17,7° con rotaciones añadidas. El coste del ensamblado de seis pases es de aproximadamente 262 ms por imagen frente a 52 ms del pase único en una RTX A4000, incluyendo remuestreo. El autor advierte que la partición de validación es pequeña (23 imágenes) y que todas las etiquetas son pseudo-etiquetas de Marigold-V2, por lo que los números son indicativos y no de grado benchmark.

## Requisitos de hardware

- **VRAM estimada**: el modelo es muy ligero (34,7M parámetros, repo de 0,2 GB); la inferencia cabe holgadamente en GPUs de consumo con 4-6 GB de VRAM, incluso con entradas de 896x896.
- **GPUs recomendadas**: RTX A4000 (medida por el autor: 52 ms por pase único, 262 ms con ensamblado de seis pases), RTX 3060/4060 o superiores; A100/H100 no son necesarias.
- **Cabe en GPU de consumo**: sí, en cualquier GPU moderna con al menos 4 GB de VRAM.
- **Opciones de despliegue**: PyTorch nativo; exportaciones ONNX de 4 y 8 bits del modelo podado para despliegue en CPU o entornos con ONNX Runtime. No se mencionan integraciones con vLLM, llama.cpp, Ollama ni TGI (no aplicables a un modelo de imagen de este tipo).
- **Latencia y throughput**: 52 ms por imagen en pase único y 262 ms con el ensamblado de seis pases sobre RTX A4000, incluyendo remuestreo; el throughput no se detalla en la información disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Enfoque | Contexto/entrada | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ShadeNet-5-35M | 34,7M (12,6M entrenables) | Feed-forward, un pase, corrección residual sobre prior | 448x448 u 896x896 | Apache-2.0 | Hugging Face (singam96/ShadeNet-5-35M) |
| Marigold (usado para pseudo-etiquetas) | no disponible en la información | Difusión, múltiples pasos | no disponible | no disponible en la información | no disponible en la información |
| Run anterior de ShadeNet (MobileNetV2) | no disponible en la información | Feed-forward, 384px, 6 épocas | 384x384 | no disponible en la información | no disponible en la información |

No se dispone en la información proporcionada de datos suficientes sobre modelos comparables de terceros (parámetros, contexto, licencia) para establecer una comparativa rigurosa más allá de las referencias internas del propio autor.

## Limitaciones y advertencias

- **Validación muy limitada**: las métricas proceden de solo 23 imágenes y de pseudo-etiquetas de Marigold-V2, por lo que no son comparables a un benchmark formal y pueden no generalizar.
- **Profundidad relativa, no métrica**: la pérdida de profundidad es invariante a escala y desplazamiento; la salida no debe interpretarse como distancia absoluta en metros.
- **Riesgo de alucinación geométrica**: al ser un modelo feed-forward entrenado con pseudo-etiquetas, puede producir normales o albedos plausibles pero incorrectos en escenas fuera de distribución.
- **Resolución restringida**: solo acepta múltiplos de 448 (448 u 896); no admite resoluciones arbitrarias sin remuestreo.
- **Sin canal de sombreado**: a diferencia de ShadeNet-3.2, esta versión elimina el canal de shading (7 canales en lugar de 8), lo que es un cambio incompatible para pipelines que esperasen la salida anterior.
- **Ensamblado costoso**: la receta de seis pases multiplica por cinco el tiempo de inferencia (262 ms frente a 52 ms) para una mejora modesta en L1.
- **Sin soporte de lenguaje ni agentes**: no es un modelo conversacional ni soporta tool calling; su ámbito es exclusivamente la imagen.
- **Licencia**: Apache-2.0 permite uso comercial, pero el modelo base DINOv2 (Meta AI) debe verificarse por separado para confirmar el cumplimiento en producción.
- **Atribución de mejoras**: el salto frente al run anterior no puede atribuirse a un único cambio (backbone, pérdida, resolución y épocas se modificaron a la vez).

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/singam96/ShadeNet-5-35M
- Modelo base DINOv2-small: https://huggingface.co/facebook/dinov2-small
- Repositorio de DINOv2 (Meta AI): https://github.com/facebookresearch/dinov2
- Marigold (generador de pseudo-etiquetas mencionado): no disponible en la información proporcionada
