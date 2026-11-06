# fastforks/moge

## Resumen

MoGe es una familia de modelos de estimación de profundidad monocular desarrollada por investigadores de Microsoft (Wang et al.). El repositorio `fastforks/moge` es una model card de integración, no un repositorio de pesos: actúa como manifiesto para que la librería `fastforks` descargue los pesos originales de los autores desde Hugging Face y verifique su integridad mediante SHA-256. La tarea declarada es `depth-estimation` y el modelo produce mapas de profundidad, nubes de puntos, intrínsecos de cámara, máscaras de validez y normales superficiales a partir de una única imagen RGB.

La arquitectura se apoya en un backbone DINOv2 ViT con cabezas convolucionales que predicen un mapa de puntos afín, una máscara de validez, normales y una escala métrica; la longitud focal y el desplazamiento se recuperan a partir de los puntos predichos. La variante MoGe-3 añade un refinador 3D disperso. El repositorio expone tres variantes: `moge-2-vitl-normal`, `moge-2-vits-normal` y `moge-3-vitl`, todas con licencia MIT y uso comercial permitido según la evidencia recogida en la model card.

La relevancia actual del proyecto radica en su enfoque de geometría métrica monocular con salidas múltiples (profundidad, puntos, intrínsecos, normales) y en la existencia de dos backends de ejecución —`portable` (PyTorch puro) y `kernels` (kernels optimizados)— que permiten aceleraciones de 1,8x a 2,2x sobre el código original. Está marcado como tier experimental.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DINOv2 ViT con cabezas convolucionales; MoGe-3 añade refinador 3D disperso |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (procesa una imagen RGB de cualquier tamaño H x W >= 8, con parche ViT de 14) |
| Tipos de cuantizacion | fp16 (por defecto en GPU), fp32 (CPU y referencia); no se documentan otras cuantizaciones |
| Idiomas soportados | no aplica (modelo de visión, sin procesamiento de lenguaje) |
| Licencia | MIT (código y pesos de las tres variantes) |
| Formato de pesos | `model.pt` (PyTorch), descargados desde los repos de los autores |

## Arquitectura y entrenamiento

MoGe emplea un transformer de visión DINOv2 como backbone, sobre el que se montan cabezas convolucionales que predicen de forma conjunta un mapa de puntos afín, una máscara de validez, normales superficiales y una escala métrica. A partir del mapa de puntos se recuperan los parámetros intrínsecos de la cámara (longitud focal y desplazamiento). La variante MoGe-3 incorpora además un refinador 3D disperso que mejora la coherencia geométrica de la predicción. El modelo acepta imágenes de cualquier resolución H x W >= 8, redimensionando o rellenando internamente con parche de 14 píxeles.

Según la model card, el entrenamiento utiliza una mezcla de conjuntos de datos públicos sintéticos y reales de tipo RGB-D y multi-vista, conforme a los papers de MoGe-2 y MoGe-3. No se especifica en la información disponible el número de tokens de entrenamiento, la composición exacta del dataset ni si se aplicaron técnicas de RLHF o DPO (no aplicables habitualmente a modelos de profundidad). La innovación técnica destacable es la predicción conjunta de geometría métrica y parámetros de cámara, junto con la disponibilidad de kernels optimizados que reducen el tiempo de inferencia entre 1,8x y 2,2x respecto a la implementación portable.

## Capacidades

- Estimación de profundidad monocular (mapa de profundidad o profundidad inversa; métrica en las variantes marcadas como `metric`).
- Predicción de nube de puntos 3D (`points`) a partir de una imagen RGB.
- Recuperación de intrínsecos de cámara (`intrinsics`: longitud focal y desplazamiento) a partir de los puntos predichos.
- Predicción de normales superficiales (`normals`).
- Generación de máscara de validez (`mask`) para descartar regiones no fiables.
- Acepta intrínsecos de cámara como entrada opcional (`model("room.jpg", intrinsics=K)`, con K en píxeles).
- Procesamiento de imágenes de cualquier resolución H x W >= 8 (redimensionado/rellenado interno con parche 14).
- Dos backends de ejecución: `portable` (PyTorch puro, GPU o CPU) y `kernels` (kernels optimizados para CUDA).
- No soporta tool calling, agentes, razonamiento multi-paso ni capacidades multilingües: es un modelo puramente visual.

## Casos de uso

- Reconstrucción 3D a partir de fotografía única: el modelo entrega nube de puntos, profundidad, normales e intrínsecos de cámara en una sola pasada, lo que permite generar mallas o nubes densas sin calibración previa de la cámara. Adecuado para pipelines de fotogrametría ligera.
- Realidad aumentada y sustitución de fondo: la profundidad métrica y la máscara de validez permiten segmentar primer plano y fondo con coherencia geométrica, útil para insertar objetos virtuales con oclusión correcta.
- Robótica y navegación: la estimación de profundidad métrica monocular permite a un robot inferir distancias absolutas a obstáculos con una sola cámara RGB, sin sensor de profundidad dedicado.
- Generación de datos sintéticos y aumentación: las normales y los mapas de puntos sirven como pseudo-etiquetas para entrenar otros modelos de visión (segmentación, detección) en datasets sin ground truth 3D.
- Reconstrucción de interiores y modelado arquitectónico: con imágenes de hasta 3000x4000 verificadas y un pico de memoria de 1,2 a 2,6 GiB según variante, se puede procesar fotografía de alta resolución de habitaciones o edificios para obtener planos de profundidad.
- Edición de imagen basada en profundidad: desenfoque de fondo sintético, retoque selectivo por distancia o efectos de paralaje usando el mapa de profundidad y las normales.
- Preprocesado para pipelines de vídeo o 3D: la variante `moge-2-vits-normal` con backend `kernels` procesa 640x480 en 33,9 ms con 818 MiB asignados, lo que la hace viable para procesamiento casi en tiempo real en GPUs de consumo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de precisión (como MMLU, HumanEval o GSM8K, no aplicables) en la información disponible. Sí se documentan métricas de velocidad y memoria medidas en una RTX 5060 Ti de 16 GB (sm_120), con fp16 y backend `portable` o `kernels`:

| Modelo | Modo | 640x480 | 1280x720 | 1920x1080 | 12 MP (4000x3000) |
|---|---|---|---|---|---|
| `moge-2-vitl-normal` | portable | 175,5 ms / 2275 / 2508 MiB | 178,8 ms / 2286 / 2518 MiB | 179,2 ms / 2299 / 2528 MiB | 191,5 ms / 2410 / 2562 MiB |
| `moge-2-vitl-normal` | kernels | 74,3 ms / 1435 / 1572 MiB | 77,5 ms / 1444 / 1588 MiB | 76,0 ms / 1459 / 1644 MiB | 90,5 ms / 1755 / 2174 MiB |
| `moge-2-vits-normal` | portable | 88,6 ms / 1123 / 1418 MiB | 85,4 ms / 1132 / 1392 MiB | 86,7 ms / 1146 / 1446 MiB | 98,6 ms / 1257 / 1464 MiB |
| `moge-2-vits-normal` | kernels | 33,9 ms / 818 / 970 MiB | 33,1 ms / 826 / 976 MiB | 31,0 ms / 839 / 1010 MiB | 46,9 ms / 1144 / 1566 MiB |
| `moge-3-vitl` | portable | 657,4 ms / 2580 / 3070 MiB | 633,4 ms / 2577 / 2792 MiB | 620,0 ms / 2588 / 2804 MiB | 655,1 ms / 2701 / 3066 MiB |
| `moge-3-vitl` | kernels | 386,2 ms / 1570 / 1836 MiB | 374,2 ms / 1557 / 1840 MiB | 362,3 ms / 1566 / 1890 MiB | 390,6 ms / 1838 / 2300 MiB |

Formato de celda: tiempo (ms) / memoria pico asignada / reservada (MiB). En el conjunto Middlebury 2014 half (994x1482), el backend `kernels` ofrece aceleraciones de 2,0x (`moge-2-vitl-normal`, 73,43 ms frente a 144,5 ms portable), 2,2x (`moge-2-vits-normal`, 29,73 ms frente a 64,19 ms) y 1,8x (`moge-3-vitl`, 507,19 ms frente a 904,91 ms). En carga inicial, `moge-2-vitl-normal` tarda 0,63 s en `kernels` frente a 1,37 s en `portable` y 3,26 s en el código original.

En precisión, la model card reporta paridad con el código original: en CPU y float32 la diferencia máxima absoluta es <= 0,005; en GPU y float16 (por defecto) la diferencia media es <= 1,5 % y el p99 <= 1,5 % del valor mediano de referencia.

## Requisitos de hardware

- VRAM estimada para inferencia (fp16, backend `kernels`, imagen 1920x1080): `moge-2-vits-normal` ~839 MiB asignados / 1010 MiB reservados; `moge-2-vitl-normal` ~1459 / 1644 MiB; `moge-3-vitl` ~1566 / 1890 MiB.
- Para 12 MP (4000x3000) con backend `kernels`: 1755 / 2174 MiB (`moge-2-vitl-normal`), 1144 / 1566 MiB (`moge-2-vits-normal`) y 1838 / 2300 MiB (`moge-3-vitl`).
- GPU recomendadas: cualquier GPU CUDA con al menos ~2,5 GiB libres para las variantes ViT-L y ~1,5 GiB para ViT-S. El fabricante reporta pruebas en RTX 5060 Ti 16 GB (sm_120); por tamaño de memoria caben en RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4090, A100 y H100.
- Cabe en GPU de consumo: sí, todas las variantes caben en GPUs consumer de 8 GB o más; la variante ViT-S funciona con menos de 2 GiB en `kernels`.
- Opciones de despliegue: librería `fastforks` (`pip install fastforks`) con backends `portable` (PyTorch, GPU o CPU) y `kernels` (CUDA). También se puede usar el código original de Microsoft (`github.com/microsoft/MoGe`). No se documentan integraciones con vLLM, llama.cpp, Ollama o TGI (no aplicables a un modelo de visión de este tipo).
- Latencia y throughput: 31-90 ms por imagen en `kernels` para ViT-L/ViT-S en resoluciones de 640x480 a 12 MP; 362-391 ms para `moge-3-vitl` en `kernels`. En CPU el modelo funciona en `portable` pero la model card no reporta latencias de CPU.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / entrada | Salidas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| MoGe (fastforks) | no disponible (ViT-L / ViT-S) | Imagen RGB de cualquier H x W >= 8, parche 14 | Profundidad, puntos, intrínsecos, máscara, normales | MIT | Hugging Face (pesos de los autores) + `pip install fastforks` |
| Depth Anything (referencia de categoría) | no disponible en la información proporcionada | Imagen RGB | Profundidad relativa | no disponible en esta ficha | no disponible en esta ficha |
| MiDaS (referencia de categoría) | no disponible en la información proporcionada | Imagen RGB | Profundidad relativa | no disponible en esta ficha | no disponible en esta ficha |
| Marigold (referencia de categoría) | no disponible en la información proporcionada | Imagen RGB | Profundidad relativa | no disponible en esta ficha | no disponible en esta ficha |

No se dispone de datos de benchmarks comparativos con estos modelos en la información proporcionada, por lo que la comparación cuantitativa de rendimiento no está disponible. La diferencia cualitativa documentada de MoGe frente a los estimadores de profundidad relativa es la salida métrica y la recuperación de intrínsecos de cámara.

## Limitaciones y advertencias

- El repositorio `fastforks/moge` no aloja pesos: solo contiene la model card y los hashes SHA-256. La descarga de pesos depende de los repositorios de los autores (`Ruicheng/moge-2-vitl-normal`, `Ruicheng/moge-2-vits-normal`, `Ruicheng/moge-3-vitl`), por lo que su disponibilidad futura no está garantizada por este repositorio.
- El tier declarado es experimental; no se recomienda como componente crítico en producción sin validación propia.
- No se documentan sesgos conocidos ni evaluación de robustez frente a dominios fuera de distribución (imágenes nocturnas, médicas, aéreas, etc.).
- Riesgo de predicciones geométricamente inconsistentes en escenas con superficies transparentes, reflectantes o texturas repetitivas, habitual en modelos de profundidad monocular; la máscara de validez debe usarse para filtrar regiones poco fiables.
- La escala métrica solo está garantizada en las variantes marcadas como `metric`; en el resto la profundidad es relativa.
- No procesa lenguaje ni texto: no es un modelo conversacional ni soporta tool calling o agentes.
- La model card advierte que las cadenas de licencia del código original se registran "tal cual" y que es un paquete de uso de investigación: conviene revisar los términos antes de cualquier otro uso, aunque la evidencia recogida (README de Microsoft MoGe y model cards de Hugging Face) indica licencia MIT y uso comercial permitido.
- El rendimiento medido corresponde a una única GPU (RTX 5060 Ti 16 GB, sm_120); en otras arquitecturas las latencias y el consumo de memoria pueden diferir.
- No se dispone de información sobre el número de parámetros, el volumen de datos de entrenamiento ni métricas de precisión estándar (AbsRel, RMSE) en la documentación proporcionada.

## Enlaces

- Model card en Hugging Face: https://huggingface.co/fastforks/moge
- Repositorio de la librería fastforks: https://github.com/kleinicke/fastforks
- Kernels para el backend `kernels`: https://huggingface.co/fastforks/kernels
- Código original de Microsoft MoGe (commit `74fbce0`): https://github.com/microsoft/MoGe
- Pesos `moge-2-vitl-normal`: https://huggingface.co/Ruicheng/moge-2-vitl-normal
- Pesos `moge-2-vits-normal`: https://huggingface.co/Ruicheng/moge-2-vits-normal
- Pesos `moge-3-vitl`: https://huggingface.co/Ruicheng/moge-3-vitl
- Manifiesto de hashes (`card.toml`): https://github.com/kleinicke/fastforks/blob/main/src/fastforks/depth/models/moge/card.toml
- Protocolo de benchmarks: https://github.com/kleinicke/fastforks/blob/main/docs/benchmarks.md
