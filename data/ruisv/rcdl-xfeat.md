# ruisv/rcdl-xfeat

## Resumen

XFeat para RK3588 es un modelo compilado en formato RKNN (`.rknn`) que implementa el extractor de características locales XFeat, publicado originalmente en CVPR 2024, listo para ejecutarse sobre la NPU de los SoC Rockchip RK3588 y RK3588S. Lo distribuye el autor ruisv como parte del ecosistema RCDL, una biblioteca en C++17 y Python que orquesta NPU, RGA y VPU en un único pipeline de copia cero. El artefacto incluye pesos cuantizados a int8 generados con rknn-toolkit2 2.3.2, de modo que no es necesario exportar a ONNX, calibrar ni disponer de la cadena de herramientas de Rockchip para desplegarlo.

El modelo resuelve el problema de la extracción y el emparejamiento de características locales (keypoints y descriptores) en dispositivos de borde, sin depender de GPU ni de la nube. A partir de una imagen de entrada en escala de grises de 640×480 produce tres mapas densos: descriptores de 64 dimensiones, mapas de keypoints y un mapa de fiabilidad. El decodificador de RCDL los convierte en hasta 4096 keypoints con descriptores de 64 dimensiones, normalizados en L2 y expresados en píxeles del fotograma original.

La relevancia actual radica en que ofrece una alternativa medible frente a la inferencia en coma flotante sobre CPU: en la prueba de referencia con una transformación conocida (rotación de 12°, escalado de 0,85 y traslación), el build int8 sobre NPU alcanza un 76,6 % de correspondencias dentro de 3 píxeles con un error mediano de 1,36 px, prácticamente idéntico al modelo float. El tamaño del fichero es de solo 1,3 MB, lo que lo hace apto para sistemas embebidos con recursos limitados.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | XFeat (extractor de características locales denso, CVPR 2024), compilado a RKNN para NPU Rockchip |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión, entrada fija de 640×480 en escala de grises) |
| Tipos de cuantización | int8 (generado con rknn-toolkit2 2.3.2); el modelo float de referencia se ejecuta en CPU vía ONNX |
| Idiomas soportados | no disponible (modelo de visión, no lingüístico) |
| Licencia | Apache-2.0 (código y pesos de XFeat; el runtime RCDL es también Apache-2.0 pero independiente) |
| Formato de pesos | `.rknn` (fichero `xfeat_640x480_i8_rk3588.rknn`, 1,3 MB) |

## Arquitectura y entrenamiento

XFeat es un extractor de características locales diseñado para emparejamiento de imágenes ligero, presentado en CVPR 2024 por el grupo verlab. La arquitectura produce mapas densos a partir de una única pasada: descriptores de 64 canales, mapas de keypoints de 65 canales y un mapa de fiabilidad de 1 canal, todos en formato NCHW e int8. Las salidas del grafo compilado son `feats [1,64,60,80]`, `keypoints [1,65,60,80]` y `reliability [1,1,60,80]`. El decodificador de RCDL transforma estas salidas en hasta 4096 keypoints con descriptores de 64 dimensiones, normalizados en L2 y con posiciones en píxeles del fotograma original.

Un detalle técnico crítico es que el grafo compilado comienza después de la InstanceNorm de XFeat, por lo que su entrada no son bytes de imagen sino un mapa normalizado. RCDL calcula ese mapa en CPU y lo escribe como float; por eso es obligatorio abrir el Engine con `float_inputs=[0]`. El `FeatureExtractor` rechaza un Engine abierto sin ese flag en lugar de alimentarlo con bytes. El proceso de compilación y el contrato de entrada de cada modelo están documentados en `docs/MODELS.md` del repositorio de RCDL. No se dispone de información sobre el número de tokens, la composición del dataset de entrenamiento ni el uso de RLHF/DPO, ya que se trata de un modelo de visión y la model card no detalla el entrenamiento original de XFeat.

## Capacidades

- Extracción de keypoints locales y descriptores de 64 dimensiones a partir de imágenes en escala de grises de 640×480.
- Emparejamiento de características entre dos imágenes mediante similitud coseno, con salida de índices de pares y valores de coseno.
- Generación de hasta 4096 keypoints por imagen, con posiciones en píxeles del fotograma original y descriptores normalizados en L2.
- Mapas de fiabilidad por keypoint para filtrar correspondencias de baja calidad.
- Integración directa con `cv2.findHomography` a partir de los pares emparejados, lo que habilita estimación de homografías y registro de imágenes.
- Ejecución sobre NPU Rockchip RK3588/RK3588S con pipeline de copia cero (NPU, RGA y VPU) mediante RCDL.
- No soporta tool calling, agentes, razonamiento multi-step ni capacidades multilingües; es un modelo puramente visual.
- No dispone de modo thinking, visión generativa, audio ni generación de texto.

## Casos de uso

- Registro de imágenes y estimación de homografías en dispositivos de borde: el modelo extrae keypoints y descriptores de dos imágenes y los pares resultantes se pasan directamente a `cv2.findHomography`, lo que permite alinear imágenes en tiempo real sobre la NPU del RK3588 sin GPU.
- Odometría visual y SLAM ligero: con 4096 keypoints por fotograma y descriptores de 64 dimensiones, el modelo puede alimentar pipelines de seguimiento de características entre fotogramas consecutivos en robots o drones con SoC Rockchip.
- Emparejamiento de imágenes para inspección industrial: comparar una imagen de referencia con una captura de cámara para detectar desplazamientos o defectos, aprovechando la tolerancia a rotación y escalado medida (76,6 % de aciertos dentro de 3 px con rotación de 12° y escalado de 0,85).
- Realidad aumentada y seguimiento de marcadores naturales: el modelo permite anclar contenido virtual a puntos de referencia de la escena en dispositivos embebidos, con un coste de extracción de 56–85 ms por imagen.
- Fotogrametría y reconstrucción 3D en el borde: la extracción de características y el emparejamiento pueden ejecutarse localmente antes de enviar solo los datos relevantes a un servidor, reduciendo el ancho de banda.
- Visión para robótica móvil con presupuesto energético ajustado: el fichero de 1,3 MB y la ejecución sobre NPU con 35 ms de cómputo dedicado encajan en plataformas alimentadas por batería.
- Preprocesamiento para pipelines de búsqueda visual: indexar descriptores de 64 dimensiones de imágenes de catálogo para búsqueda por similitud en dispositivos con RK3588.

## Benchmarks y rendimiento

Resultados medidos en RK3588S con una transformación conocida (fotografía rotada 12°, escalada 0,85 y desplazada), de modo que cada keypoint tiene una respuesta correcta:

| Build | Keypoints | Correspondencias | Dentro de 3 px | Error mediano |
|---|---|---|---|---|
| ONNX float (CPU) | 4096 + 4096 | 2192 | 77,4 % | 1,35 px |
| RKNN int8, simulador de toolkit | 4096 + 4096 | 2022 | 77,5 % | 1,34 px |
| Este fichero, en NPU | 4096 + 4096 | 2033 | 76,6 % | 1,36 px |

Los descriptores alcanzan un coseno de 0,9978 (mínimo 0,9910) frente a los del modelo float, sobre los 3348 keypoints que ambos builds detectaron en el mismo píxel. Como control, dos escenas distintas dan 69 correspondencias mutuas, frente a las 2033 del par transformado.

Tiempos medidos (librknnrt 2.3.2, driver NPU 0.9.8, un núcleo NPU):

| Etapa | Tiempo |
|---|---|
| Extracción: preprocesamiento, NPU y decodificación | 56–85 ms, de los cuales 35 ms son de NPU |
| Emparejamiento 4096 × 4096 | 213–243 ms con 8 hilos (824 ms con uno) |

## Requisitos de hardware

- Hardware objetivo: NPU de Rockchip RK3588 o RK3588S (un núcleo NPU en las mediciones).
- VRAM: no aplica; el modelo se ejecuta sobre la NPU integrada del SoC, no sobre GPU discreta.
- GPU recomendadas: no aplica para el fichero `.rknn`; el modelo float de referencia se ejecuta en CPU vía ONNX.
- No cabe ni está pensado para GPUs de consumo (RTX 4090, etc.); está diseñado exclusivamente para el ecosistema Rockchip.
- Despliegue: runtime RCDL (C++17 / Python) sobre linux-aarch64, con librknnrt 2.3.2 y driver NPU 0.9.8. Instalación vía conda desde `https://mirrors.ruis.ai/conda` y `conda-forge`.
- Latencia: extracción de 56–85 ms por imagen (35 ms de NPU); emparejamiento de 4096 × 4096 de 213–243 ms con 8 hilos.
- El emparejamiento es `O(|a|·|b|·64)`, unos 10⁹ multiply-adds con 4096 keypoints por lado; `XfeatConfig.top_k` permite reducirlo (con `top_k = 1024` el emparejamiento baja a 72 ms, pero la concordancia con la transformación conocida cae al 62,7 %).

## Comparativa con modelos similares

| Modelo | Tipo | Entrada | Keypoints | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| XFeat (este, RKNN int8) | Extractor local + matching | 640×480 gris | hasta 4096 | Apache-2.0 | Fichero `.rknn` en Hugging Face |
| XFeat ONNX float | Extractor local + matching | 640×480 gris | hasta 4096 | Apache-2.0 | Repositorio upstream verlab |
| SuperPoint | Extractor local + descriptores | no disponible | no disponible | no disponible | no disponible |
| DISK | Extractor local + descriptores | no disponible | no disponible | no disponible | no disponible |

No se han publicado en la información disponible resultados comparativos frente a otros extractores de características locales (SuperPoint, DISK, ALIKED) sobre el mismo benchmark; los datos de la tabla de rendimiento corresponden únicamente a las variantes float, simulador y NPU del propio XFeat.

## Limitaciones y advertencias

- El flag `float_inputs=[0]` es obligatorio: el grafo comienza después de la InstanceNorm de XFeat y espera un mapa normalizado en float, no bytes de imagen. Omitirlo provoca que `FeatureExtractor` rechace el Engine.
- El emparejamiento es costoso: `O(|a|·|b|·64)`, unos 10⁹ multiply-adds con 4096 keypoints por lado. Reducir `top_k` acelera el proceso pero degrada la precisión (con `top_k = 1024` la concordancia cae al 62,7 %), porque los puntos de mayor puntuación tienden a ser los más repetitivos.
- La equivalencia int8-float medida es un hallazgo específico de este modelo, no una regla general; otros modelos del registro de RCDL usan fp16 porque int8 los rompe.
- El modelo está limitado a una entrada fija de 640×480 en escala de grises; no procesa color ni resoluciones arbitrarias sin adaptación.
- No es un modelo lingüístico: no soporta generación de texto, tool calling, agentes ni capacidades multilingües.
- La licencia Apache-2.0 cubre los pesos de XFeat y el fichero compilado; el runtime RCDL es también Apache-2.0 pero sus términos son independientes y no se extienden a estos pesos.
- No se dispone de información sobre sesgos, tasas de alucinación (no aplica) ni comportamiento en escenas con cambios de iluminación extremos, oclusiones severas o texturas repetitivas más allá del control con dos escenas distintas.
- El despliegue está restringido al ecosistema Rockchip RK3588/RK3588S con las versiones de runtime y driver indicadas; no hay soporte documentado para otras plataformas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ruisv/rcdl-xfeat
- Repositorio RCDL: https://github.com/ruisv/rcdl
- Documentación de modelos de RCDL: https://github.com/ruisv/rcdl/blob/main/docs/MODELS.md
- Registro de licencias verificadas: https://github.com/ruisv/rcdl/tree/main/model_zoo
- XFeat upstream (verlab, CVPR 2024): https://github.com/verlab/accelerated_features
- Fichero del modelo: https://huggingface.co/ruisv/rcdl-xfeat/resolve/main/xfeat_640x480_i8_rk3588.rknn
