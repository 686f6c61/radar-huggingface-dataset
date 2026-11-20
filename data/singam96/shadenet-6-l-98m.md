# singam96/ShadeNet-6-L-98M

## Resumen

ShadeNet-6 L es un modelo de *inverse rendering* de una sola imagen (descomposición intrínseca) desarrollado por el usuario singam96. Dada una fotografía RGB, predice de forma directa tres mapas intrínsecos: albedo (color base), profundidad relativa y normales de superficie. El modelo se apoya en un backbone DINOv2 ViT-B/14 de Meta AI congelado (86,58 M de parámetros) y añade una cabeza entrenable de 11,77 M de parámetros, sumando un total de 98,35 M.

La arquitectura es una red *feed-forward* de un solo pase: un proyector, un codificador convolucional de detalle que procesa la imagen a resolución completa (DINOv2 lee parches de 14 píxeles y produce mapas suaves), un decodificador ancho, una pequeña red densa de parches que da una primera estimación gruesa, un diccionario de parches de entrada y un refinador diminuto. No hay iteración en inferencia: un único forward pass produce los tres mapas.

Es relevante porque mejora sustancialmente a su predecesor ShadeNet-5 en las tres tareas simultáneamente, con un error medio L1 de 0,1232 frente a 0,1659, siendo mejor en las 23 imágenes de validación, y con un coste de inferencia de unos 39 ms por imagen a 448x448 en bf16 sobre una RTX 5060 Ti. Se distribuye con licencia Apache-2.0, incluye código de inferencia independiente y exportaciones ONNX en int8 e int4.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Red feed-forward sobre backbone DINOv2 ViT-B/14 congelado + cabeza convolucional entrenable (proyector, codificador de detalle, decodificador ancho, red de parches densa, diccionario de parches y refinador) |
| Parametros totales | 98,35 M (86,58 M backbone congelado + 11,77 M entrenables) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (modelo de visión; entrada de imagen 448x448, admite múltiplos de 14 y 32 como 896) |
| Tipos de cuantizacion | bf16 en inferencia; exportaciones ONNX int8 (103 MB) e int4 (55 MB) |
| Idiomas soportados | no disponible (modelo de visión, sin procesamiento de lenguaje) |
| Licencia | Apache-2.0 |
| Formato de pesos | PyTorch (safetensors no confirmado), ONNX (int8 e int4) |

## Arquitectura y entrenamiento

ShadeNet-6 L es una arquitectura nueva entrenada desde cero, no una continuación de los pesos de ShadeNet-5. El backbone es DINOv2 ViT-B/14 de Meta AI, mantenido congelado durante el entrenamiento, que aporta 86,58 M de parámetros. Sobre él se monta una cabeza de 11,77 M de parámetros compuesta por varias piezas: un proyector que adapta las características del backbone, un codificador convolucional de detalle que ve la fotografía a resolución completa para compensar la suavidad de los mapas de DINOv2 (que lee parches de 14 píxeles), un decodificador ancho, una red densa de parches pequeña que proporciona una estimación inicial gruesa, un diccionario de parches de entrada y un refinador diminuto de 0,51 M de parámetros.

La salida es de 7 canales en el rango [-1, 1]: `[0:3]` albedo, `[3:4]` profundidad relativa (mayor valor = más lejos) y `[4:7]` normales de superficie (x a la derecha, y hacia arriba, z hacia el observador). No incluye canal de sombreado. La inferencia es de un solo pase, sin iteración, con una media espejo opcional de dos pases. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si se emplearon técnicas de RLHF o DPO, ya que es un modelo de visión sin alineamiento lingüístico.

## Capacidades

- Descomposición intrínseca de una sola imagen: predice albedo, profundidad relativa y normales de superficie en un único forward pass.
- Estimación de profundidad relativa por imagen (no métrica), en escala de grises.
- Predicción de normales de superficie con convención x derecha, y arriba, z hacia el observador.
- Procesamiento a resolución completa de la fotografía mediante el codificador de detalle convolucional.
- Soporte de entrada a 448x448 y a múltiplos de 14 y 32 (por ejemplo, 896); el script `inference/run.py` conserva la fotografía completa.
- Exportación a ONNX Runtime en int8 e int4 para despliegue ligero.
- No soporta tool calling, agentes, razonamiento multi-paso ni capacidades multilingües: es un modelo puramente visual de image-to-image.

## Casos de uso

- Reiluminación y composición fotográfica: el albedo y las normales permiten separar la reflectancia de la iluminación para recolocar fuentes de luz virtuales en un pipeline de posproducción, usando un solo pase de 39 ms por imagen.
- *Relighting* en tiempo real para videojuegos y motores 3D: la inferencia a 39 ms en bf16 sobre una RTX 5060 Ti hace viable procesar fotogramas o capturas de entorno para estimar albedo y normales antes de aplicar el sombreado.
- Reconstrucción 3D y *photogrammetry* asistida: las normales y la profundidad relativa sirven como inicialización o regularización en pipelines de reconstrucción de superficie a partir de una sola vista.
- Aumento de datos sintéticos: generar pares imagen/albedo/profundidad/normal para entrenar otros modelos de visión (segmentación, detección de superficies) sin necesidad de captura multi-vista.
- Edición de imágenes basada en física: separar albedo para cambiar el color de un objeto sin alterar su sombreado, o usar la profundidad relativa para aplicar desenfoque selectivo coherente con la escena.
- Preprocesado para *matting* y composición: el mapa de albedo y las normales ayudan a estimar la reflectancia de primer plano y a integrar objetos virtuales con sombreado plausible.
- Despliegue en dispositivos de borde: las exportaciones ONNX int8 (103 MB) e int4 (55 MB) permiten ejecutar la descomposición en hardware con recursos limitados mediante ONNX Runtime.

## Benchmarks y rendimiento

Resultados de error medio L1 por mapa sobre las mismas 23 imágenes de validación (menor es mejor; albedo y normal evaluados solo en píxeles etiquetados, profundidad en todos los píxeles; normales unitarias en las filas "+unit"):

| Modelo y receta | Parametros | Albedo | Depth | Normal | Media |
|---|---|---|---|---|---|
| ShadeNet-5, un pase + normales unitarias | 34,65 M | 0,166 | 0,169 | 0,163 | 0,1659 |
| ShadeNet-5 + su refinador | 34,65 M + 0,91 M | 0,160 | 0,168 | 0,151 | 0,1597 |
| ShadeNet-5, seis pases (espejo + rotaciones ±4°) | 34,65 M | 0,158 | 0,162 | 0,150 | 0,1562 |
| ShadeNet-6 L, un pase + normales unitarias | 98,35 M | 0,123 | 0,124 | 0,122 | 0,1232 |
| ShadeNet-6 L, un pase (normales crudas) | 98,35 M | 0,123 | 0,124 | 0,126 | 0,1244 |
| ShadeNet-6 L, media espejo | 98,35 M | 0,122 | 0,122 | 0,119 | 0,1213 |
| ShadeNet-6 L, seis pases (espejo + rotaciones ±4°) | 98,35 M | 0,120 | 0,129 | 0,118 | 0,1223 |
| ShadeNet-6 XS, un pase + normales unitarias | 1,99 M | 0,176 | 0,186 | 0,166 | 0,1759 |

Diferencia emparejada por imagen en L1 medio (ShadeNet-6 L menos ShadeNet-5; negativo = ShadeNet-6 L mejor):

| Comparacion | Diferencia | ShadeNet-6 L mejor en |
|---|---|---|
| un pase vs un pase | -0,0427 ± 0,0055 | 23 de 23 imágenes |
| un pase vs ShadeNet-5 + refinador | -0,0364 ± 0,0055 | 23 de 23 |
| media espejo vs ShadeNet-5 + refinador | -0,0384 ± 0,0056 | 23 de 23 |
| seis pases vs ShadeNet-5 seis pases | -0,0340 ± 0,0053 | 22 de 23 |

La mejora se da en los tres mapas (albedo 0,166 a 0,123; profundidad 0,169 a 0,124; normales 0,163 a 0,122). El promedio en tiempo de test apenas aporta: la media espejo gana 0,002 y seis pases empeoran la profundidad (0,124 a 0,129). El refinador propio (0,51 M) añade entre 0,0001 y 0,0017. La velocidad es de unos 39 ms por imagen en una RTX 5060 Ti en bf16, frente a los 283 ms por imagen de la receta de seis pases de ShadeNet-5.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo completo en bf16 ocupa en torno a 0,2 GB de pesos (98,35 M de parámetros), por lo que la VRAM necesaria es mínima; las exportaciones ONNX ocupan 103 MB (int8) y 55 MB (int4).
- GPU recomendadas: cualquier GPU moderna con soporte bf16; el autor reporta 39 ms por imagen a 448x448 en una RTX 5060 Ti. Para lotes grandes, A100 o H100 aportan mayor throughput.
- Cabe holgadamente en GPU de consumo: RTX 3060, RTX 4060, RTX 4090, RTX 5060 Ti y similares, así como en iGPU o CPU mediante ONNX Runtime en las variantes cuantizadas.
- Opciones de despliegue: PyTorch con `transformers` (código de inferencia independiente en `inference/`), ONNX Runtime para int8 e int4. No se mencionan integraciones con vLLM, llama.cpp, Ollama ni TGI, al no ser un modelo de lenguaje.
- Latencia y throughput: aproximadamente 39 ms por imagen a 448x448 en bf16 sobre RTX 5060 Ti; la media espejo duplica el coste a dos pases.

## Comparativa con modelos similares

| Modelo | Parametros | Tarea | Error medio L1 (23 imágenes) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ShadeNet-6 L | 98,35 M | Albedo + profundidad relativa + normales | 0,1232 (un pase) | Apache-2.0 | Hugging Face |
| ShadeNet-5 | 34,65 M (+0,91 M refinador) | Albedo + profundidad relativa + normales | 0,1597 (con refinador) | no disponible | Hugging Face |
| ShadeNet-6 XS | 1,99 M | Albedo + profundidad relativa + normales | 0,1759 (un pase) | no disponible | Hugging Face |

No se dispone de datos comparativos con otros modelos de descomposición intrínseca (por ejemplo, Marigold o variantes basadas en difusión) en la información proporcionada; las etiquetas de validación empleadas son pseudo-etiquetas de Marigold-V2.

## Limitaciones y advertencias

- El conjunto de validación es de solo 23 imágenes y todas las etiquetas son pseudo-etiquetas de Marigold-V2, no mediciones reales.
- El checkpoint fue seleccionado sobre esas mismas 23 imágenes, lo que hace la métrica optimista en torno a 0,001 a 0,003; la ventaja frente a ShadeNet-5 (0,04) es más de diez veces esa cifra, pero sigue siendo una única ejecución sobre un conjunto pequeño.
- La profundidad es relativa por imagen, no métrica: no debe interpretarse como distancia absoluta.
- El promedio en tiempo de test no ayuda de forma consistente: seis pases empeoran la profundidad; se recomienda un solo pase o la media espejo.
- No hay información sobre sesgos del modelo, riesgo de alucinación en regiones ambiguas ni comportamiento en dominios fuera de distribución.
- No se dispone de información sobre idiomas ni sobre restricciones adicionales de uso comercial más allá de la licencia Apache-2.0.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, por lo que no hay validación independiente de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/singam96/ShadeNet-6-L-98M
- Modelo base DINOv2 ViT-B/14: https://huggingface.co/facebook/dinov2-base
- No se han encontrado en la información proporcionada enlaces a papers, blogs, repositorios adicionales ni demos.
