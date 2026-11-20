# saung43/pointline-indoor-layout

## Resumen

pointline-indoor-layout es un detector de líneas estructurales de interiores a partir de una única imagen RGB. Lo desarrolla el usuario saung43 y se publica bajo licencia Apache-2.0. El modelo predice mapas de calor densos para cuatro tipos de estructura de la habitación (unión suelo-pared, unión techo-pared, aristas verticales pared-pared y esquinas de la sala), distinguiendo entre la parte visible y la extensión completa, incluida la oculta tras muebles. Las aristas de mobiliario se ignoran de forma deliberada.

El paquete incluye dos redes: LayoutNet, un detector de estructura con 32,9 M de parámetros, y TiltNet, un estimador de la dirección "arriba" de la cámara (pitch y roll) y de la altura de la cámara con 40,3 M de parámetros, que permite elevar a 3D las líneas de suelo detectadas. Ambas usan un encoder ConvNeXt-Tiny inicializado desde pesos de ImageNet-22k.

La relevancia actual reside en su enfoque de entrenamiento 100 % sintético (BlenderProc 2.8 / Blender 4.2 con activos CC0 de Poly Haven) y en su orientación a robótica indoor: el pipeline declarado es `robotics` y el modelo está pensado para percepción de estructura en interiores. No es un modelo de lenguaje: no procesa ni genera texto, y su salida son mapas de calor y parámetros de cámara.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | CNN: encoder ConvNeXt-Tiny (timm `convnext_tiny.fb_in22k`) + decoder tipo U-Net con rama de detalle de stride 2 (LayoutNet); mismo encoder inicializado desde LayoutNet + cabeza que preserva posición con intrínsecos normalizados (TiltNet) |
| Parametros totales | LayoutNet: 32,9 M (fp32); TiltNet: 40,3 M (fp32) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión; entrada fija de 640×480 RGB) |
| Tipos de cuantizacion | no disponible (pesos publicados en fp32; no se documentan variantes cuantizadas) |
| Idiomas soportados | no aplica (modelo de visión, sin capacidades lingüísticas) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (`layout.safetensors`, `tilt.safetensors`), fp32 |

Otros datos técnicos: entrada RGB redimensionada a 640×480 con normalización ImageNet (media/std); salida de LayoutNet de 8 canales a resolución 1/2 (320×240); salida de TiltNet de vector unitario "up" en marco de cámara OpenCV (x derecha, y abajo, z adelante) más logaritmo de la altura de cámara en metros. Tamaño del repositorio: 0,3 GB. Dependencias: `torch`, `timm`, `safetensors`, `opencv-python`, `numpy`.

## Arquitectura y entrenamiento

LayoutNet combina un encoder ConvNeXt-Tiny preentrenado en ImageNet-22k con un decoder estilo U-Net y una rama de detalle de stride 2. Produce 8 mapas de calor: `floor_wall_full`, `ceiling_wall_full`, `wall_wall_full`, `floor_wall_vis`, `ceiling_wall_vis`, `wall_wall_vis`, `corner_full` y `corner_vis`. Los canales "full" incluyen la extensión ocluida por muebles; los "vis" solo la parte observable. TiltNet reutiliza el mismo encoder (inicializado desde LayoutNet) y añade una cabeza que recibe además los intrínsecos normalizados `[fx/W, fy/H, (cx−W/2)/W, (cy−H/2)/H]`, prediciendo el vector "up" y el logaritmo de la altura de cámara.

El entrenamiento es exclusivamente sintético. Los datos proceden de habitaciones, habitaciones en L y pasillos generados proceduralmente (paredes, puertas, rodapiés, luces y 88 modelos de mobiliario) renderizados con BlenderProc 2.8 / Blender 4.2 sobre HDRIs, texturas y modelos 3D CC0 de Poly Haven. La verdad de referencia son las líneas analíticas de layout con visibilidad por segmento. LayoutNet usó 19.999 imágenes (5.000 escenas × 4 vistas) y TiltNet añadió 23.968 fotogramas de secuencias sintéticas de cámara (altura robótica 0,2–0,55 m y de mano 1,0–1,7 m, con vibración). Aumentación: volteo horizontal, distorsión radial de gran angular aplicada coherentemente a las coordenadas de la verdad de referencia, jitter de exposición/gamma/contraste/saturación/balance de blancos, desenfoque, ruido y JPEG. LayoutNet: 30.000 pasos, AdamW (lr 4e-4 decoder / 1e-4 encoder, wd 0,05), batch 16 por GPU × 4 GPU, bf16, pérdida focal estilo CenterNet sobre mapas gaussianos de líneas y esquinas, ≈2,2 h en 4× NVIDIA H100 80GB. TiltNet: 15.000 pasos, batch 32 por GPU × 4, lr 3e-4, pérdida angular más logarítmica de altura, ≈50 min en 4× H100. Campo de visión horizontal de entrenamiento: ≈70°–110°.

## Capacidades

- Detección de límites suelo-pared, techo-pared y aristas verticales pared-pared en una imagen RGB.
- Detección de esquinas de la habitación.
- Predicción de la extensión completa de las líneas, incluidas las partes ocultas tras mobiliario, además de la parte visible.
- Ignorar deliberadamente las aristas de muebles y objetos.
- Estimación de la orientación de la cámara (pitch y roll) mediante TiltNet.
- Estimación de la altura de la cámara en metros.
- Uso de intrínsecos de cámara (fx, fy, cx, cy o HFOV) para mejorar la estimación de inclinación y permitir el levantamiento de líneas de suelo a 3D.
- No soporta tool calling, agentes, razonamiento multi-paso ni capacidades multilingües: es un modelo puramente visual.

## Casos de uso

- Robótica móvil indoor: estimar la geometría de pasillos y oficinas (suelo, techo, paredes) a partir de la cámara del robot para navegación y localización estructural; el modelo está etiquetado con pipeline `robotics` y se entrenó con alturas de cámara de robot de 0,2–0,55 m.
- Reconstrucción 3D de interiores: usar las líneas de suelo detectadas junto con TiltNet (vector "up" y altura de cámara) para elevar las líneas a 3D y obtener un wireframe de la sala.
- Realidad aumentada y virtual: anclar objetos virtuales a las paredes y al suelo estimando la orientación y la altura de la cámara con TiltNet, con error mediano de inclinación de 0,50°.
- Análisis de planos y documentación de espacios: extraer la estructura completa de una habitación (incluidas zonas ocultas por muebles) para generar croquis o modelos de planta.
- Preprocesado para segmentación y detección de objetos: proporcionar un prior geométrico de paredes y suelo que ayude a desambiguar detecciones en escenas interiores.
- Inspección y mapeo de pasillos: el modelo obtiene su mejor F1 en pasillos (0,980 en suelo-pared), por lo que es adecuado para recorridos de inspección en corredores.
- Estimación de pose de cámara en vídeo: TiltNet puede aplicarse fotograma a fotograma para estabilizar o alinear secuencias capturadas con cámara de mano (alturas 1,0–1,7 m).

## Benchmarks y rendimiento

Evaluación en 980 imágenes sintéticas de validación de escenas no vistas (400 habitaciones, 180 habitaciones en L, 400 pasillos). Mapas adelgazados con NMS perpendicular a la línea y emparejados con la verdad de referencia a 2 px (líneas) y 3 px (esquinas) sobre la salida de 320×240.

| F1 | suelo-pared | techo-pared | pared-pared | esquinas |
|---|---|---|---|---|
| visible | 0,983 | 0,989 | 0,976 | 0,978 |
| full (incl. ocluido) | 0,940 | 0,965 | 0,938 | 0,925 |

Por tipo de escena (extensión completa, F1 suelo-pared / techo-pared / pared-pared / esquinas): pasillo 0,980 / 0,985 / 0,977 / 0,972; habitación 0,915 / 0,957 / 0,916 / 0,899; habitación en L 0,909 / 0,926 / 0,899 / 0,878.

TiltNet (2.132 imágenes de validación): error de inclinación mediano 0,50°, p80 1,17°, p95 2,78° (50,4 % por debajo de 0,5°); error relativo mediano de altura de cámara 6,6 %. No se han publicado resultados de benchmarks en imágenes reales.

## Requisitos de hardware

- VRAM estimada para inferencia: muy baja; los pesos suman ≈73 M de parámetros en fp32 (≈0,3 GB en total para ambas redes), por lo que la inferencia cabe holgadamente en cualquier GPU consumer con 4 GB o más.
- GPU recomendadas: cualquier GPU NVIDIA con soporte CUDA; para entrenamiento se usaron 4× NVIDIA H100 80GB, pero la inferencia no requiere hardware de gama alta.
- Cabe en GPU consumer: sí, en cualquier RTX (p. ej. RTX 3060, 4060, 4090) e incluso en iGPU con suficiente memoria compartida; el cuello de botella es el tamaño de entrada (640×480), no el modelo.
- Opciones de despliegue: PyTorch nativo mediante `model.py` / `inference.py`; exportación a ONNX o TensorRT no documentada; no se mencionan integraciones con vLLM, llama.cpp, Ollama ni TGI (no aplican a un modelo de visión).
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto/entrada | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| pointline-indoor-layout | 32,9 M (LayoutNet) + 40,3 M (TiltNet) | Imagen 640×480 | Líneas estructurales indoor + pose de cámara | Apache-2.0 | Hugging Face |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de información sobre modelos comparables en la documentación proporcionada.

## Limitaciones y advertencias

- Entrenado únicamente con imágenes sintéticas; el rendimiento en imágenes reales solo se ha comprobado cualitativamente (vídeo de cámara de robot en pasillos y oficinas). Las uniones suelo-pared y techo-pared transfieren bien, pero las aristas verticales pared-pared y las paredes lejanas de espacios abiertos grandes son más débiles. No se reporta ningún benchmark cuantitativo en imágenes reales.
- Asume interiores estructurados con suelo, paredes y techo planos; escenas de exterior, paredes curvas y espacios muy desordenados quedan fuera de distribución.
- Mejores resultados a 640×480 con FOV horizontal ≈70°–110°; las distorsiones de ojo de pez fuertes deben corregirse antes de la inferencia.
- La altura de cámara se aprende de la escala sintética de las habitaciones (cámaras de 0,2–1,7 m); debe tratarse como una estimación.
- La model card indica explícitamente que el modelo "no está pensado para" ciertos usos (texto truncado en la información disponible), por lo que conviene revisar la model card completa antes de usos críticos.
- Riesgo de alucinación: al ser un modelo de visión, el riesgo se traduce en detección de líneas espurias en escenas fuera de distribución; no hay datos cuantitativos al respecto.
- Sesgos conocidos: no documentados; el sesgo principal es el dominio sintético de entrenamiento.
- Licencia Apache-2.0: permite uso comercial, pero deben respetarse los avisos de terceros recogidos en `NOTICE.md`.

## Enlaces

- Hugging Face: https://huggingface.co/saung43/pointline-indoor-layout
- Repositorio (archivos del modelo): https://huggingface.co/saung43/pointline-indoor-layout/tree/main
- BlenderProc: https://github.com/DLR-RM/BlenderProc
- Poly Haven (activos CC0): https://polyhaven.com
- Paper, blog o demo: no disponibles en la información proporcionada.
