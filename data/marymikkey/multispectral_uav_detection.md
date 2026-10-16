# marymikkey/multispectral_uav_detection

## Resumen

El repositorio `marymikkey/multispectral_uav_detection` no es un modelo de lenguaje, sino una colección de pesos (checkpoints) para detección de objetos aplicada a la detección de UAV (drones) en imágenes aéreas. Está construido sobre YOLO11s dentro del fork [YOLOv11-RGBT](https://github.com/wandahangFY/YOLOv11-RGBT) (commit `9cc2e208`), una variante que incorpora fusión multimodal RGB + infrarrojo (IR). El problema que aborda es la detección robusta de UAV en condiciones donde el canal visible por sí solo falla, por ejemplo baja iluminación, contraluz, camuflaje o fondos con textura similar.

El repositorio contiene nueve configuraciones de pesos organizadas según la estructura de `DIPLOMA_ROOT` del repositorio de código asociado, de modo que los scripts de evaluación y transferencia encuentran los checkpoints sin modificar rutas. Incluye modelos preentrenados en RGB e IR con datos no emparejados, modelos entrenados desde cero sobre el conjunto Anti-UAV-RGBT (solo RGB, solo IR y RGBT con fusión intermedia en P3) y variantes con backbones congelados transferidos. Además, se publican cinco modelos afinados con datos de campo a resolución 1248x1248.

Su relevancia es acotada pero específica: cubre un nicho (detección anti-UAV multimodal) con pocas implementaciones abiertas, y aporta tanto la línea base unimodal como la multimodal para poder medir la ganancia real de la fusión RGB-T. El repositorio es pequeño (0,2 GB) y tiene un historial de uso prácticamente nulo (0 descargas, 1 like en el momento de la consulta), por lo que debe tratarse como material de investigación reciente y no validado por la comunidad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | YOLO11s con fusión multimodal RGB/IR (fork YOLOv11-RGBT, commit `9cc2e208`); fusión intermedia en el nivel P3 |
| Parametros totales | no disponible en la informacion proporcionada (la arquitectura base es la variante s de YOLO11) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (modelo de detección de objetos; entrada de imagen, hasta 1248x1248 en los modelos afinados con datos de campo) |
| Tipos de cuantizacion | no disponible; se distribuyen checkpoints sin cuantizar en formato PyTorch `.pt` |
| Idiomas soportados | no aplica (modelo de visión; la información no declara idiomas) |
| Licencia | AGPL-3.0 |
| Formato de pesos | PyTorch `.pt` (`best.pt` por run, con argumentos de entrenamiento embebidos); se incluye un fichero `SHA256SUMS` con sumas de verificación |

Relación de checkpoints publicados:

| Ruta | Descripción |
|---|---|
| `pretrain/runs/yolo11s_rgb_pretrain` | Preentrenamiento RGB con datos no emparejados |
| `pretrain/runs/yolo11s_gray_ir_pretrain_100ep` | Preentrenamiento IR (escala de grises) con datos no emparejados, 100 épocas |
| `train/runs/antiuav_resync/yolo11s_{rgb,ir}_from_scratch` | Solo RGB y solo IR, desde cero, sobre Anti-UAV-RGBT |
| `train/runs/antiuav_resync/yolo11s_rgbt_midfusion_p3_from_scratch` | RGBT con fusión intermedia en P3, desde cero |
| `train/runs/antiuav_resync/yolo11s_rgbt_midfusion_p3_rgb_ir_pretrained_{rgb,ir}_neck_head_freeze_backbones` | RGBT con backbones congelados transferidos y neck/head en RGB o IR |
| `train/runs/antiuav_resync/*_poly_finetune_crop_x287_1248` | Los cinco modelos anteriores afinados con datos de campo a 1248x1248 |

## Arquitectura y entrenamiento

La base es YOLO11s, un detector de una sola etapa con backbone CSP y neck de tipo PAN, modificado en el fork YOLOv11-RGBT para aceptar dos entradas simultáneas (RGB e IR) y fusionarlas en una etapa intermedia. La configuración publicada usa fusión en P3, es decir, a nivel de características de resolución media dentro del neck, lo que permite que cada modalidad conserve su propio camino de extracción y se combine antes de las cabezas de detección. Se publican tanto variantes unimodales (solo RGB o solo IR) como multimodales, lo que permite aislar el efecto de la fusión.

La estrategia de entrenamiento es por etapas. Primero se preentrenan las ramas RGB e IR de forma independiente con datos no emparejados (*unpaired*), 100 épocas en el caso IR. Después se entrena sobre Anti-UAV-RGBT, un conjunto de referencia para detección anti-dron con pares RGB-térmico, con tres variantes: desde cero, con backbones congelados procedentes del preentrenamiento no emparejado (y neck/head inicializados desde RGB o desde IR), y con fusión P3. Finalmente, los cinco modelos resultantes se afinan con datos de campo a resolución 1248x1248. La nomenclatura de las rutas (`poly_finetune_crop_x287_1248`) sugiere un ajuste fino con recorte a esa resolución y un scheduler de tasa de aprendizaje polinómico, aunque la información disponible no detalla el dataset de campo, el número de tokens equivalentes, la composición exacta de las imágenes ni si hubo etapas de alineación o aumento específicas. No se documenta ningún mecanismo de decodificación especulativa, atención lineal ni innovación de inferencia más allá de la propia fusión multimodal.

## Capacidades

- Detección de objetos en imágenes aéreas, con una única clase objetivo mencionada implícitamente: UAV o dron (el repositorio no enumera el resto de clases del conjunto Anti-UAV-RGBT).
- Detección en RGB, en infrarrojo y en modo multimodal RGB+IR con fusión de características en P3.
- Detección en condiciones de baja visibilidad o iluminación adversa, aprovechando el canal térmico cuando el RGB pierde contraste.
- Inferencia sobre imágenes de alta resolución en los modelos afinados (1248x1248), orientada a objetos pequeños en escena aérea.
- Transferencia de aprendizaje entre dominios: los backbones preentrenados con datos no emparejados pueden reutilizarse como inicialización para otros conjuntos.
- No dispone de soporte de *tool calling*, *function calling*, agentes, razonamiento multi-paso ni generación de texto: es exclusivamente un modelo de visión.
- No se declaran capacidades multilingües ni procesamiento de audio o vídeo nativo más allá del fotograma a fotograma.

## Casos de uso

- Vigilancia anti-dron en entornos sensibles: el modelo detecta UAV en imágenes de cámaras RGB y térmicas; la variante RGBT con fusión P3 es la más adecuada cuando la escena tiene iluminación variable o el dron se confunde con el fondo en el canal visible.
- Seguridad perimetral en aeropuertos e instalaciones críticas: se despliega sobre cámaras fijas con pares RGB-térmico para generar alertas de intrusión aérea, usando las variantes unimodales como línea base y la multimodal para reducir falsos negativos nocturnos.
- Operación embarcada en el propio UAV (detección aire-aire o aire-superficie): la familia YOLO11s es lo bastante ligera para ejecutarse en hardware de borde; los checkpoints de 640 píxeles sirven para tiempo real y los de 1248 para barrido de mayor alcance.
- Investigación en fusión multimodal: el repositorio publica simultáneamente RGB-only, IR-only y RGBT con fusión P3, lo que permite medir de forma controlada la ganancia de la fusión y reproducir experimentos sobre Anti-UAV-RGBT.
- Evaluación comparativa de estrategias de transferencia: las variantes con backbones congelados y neck/head inicializados desde RGB o IR permiten estudiar el coste y el beneficio del preentrenamiento no emparejado frente al entrenamiento desde cero.
- Prototipado de sistemas de contramedidas o de tráfico aéreo no tripulado: como módulo de percepción previo a un sistema de seguimiento o de decisión, alimentando las cajas detectadas a un tracker externo.
- Anotación asistida y aumento de datasets: el modelo puede preetiquetar secuencias aéreas para revisión humana, acelerando la construcción de nuevos conjuntos RGB-térmico con datos de campo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card únicamente describe la organización de los checkpoints y su procedencia (preentrenamiento no emparejado, entrenamiento sobre Anti-UAV-RGBT y ajuste fino con datos de campo a 1248x1248), sin incluir métricas de mAP, precisión, recall ni comparaciones numéricas con otras arquitecturas.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible como dato del autor. Como referencia orientativa, un detector de la familia YOLO11s en su variante *small* suele operar por debajo de 2 GB de VRAM a 640 píxeles en FP16 o FP32, y la cifra crece con la resolución: a 1248x1248 la activación de las capas intermedias eleva el consumo, y en modo multimodal hay que contabilizar dos ramas de backbone más el módulo de fusión. Estas cifras son estimaciones y no están confirmadas por la información proporcionada.
- GPU recomendadas: cualquier GPU con al menos 8 GB de VRAM debería ser suficiente para evaluar los checkpoints a 640 píxeles; para el ajuste fino a 1248x1248 y el entrenamiento multimodal conviene una GPU de 16-24 GB (RTX 4090, A5000, L4) o superior (A100, H100) si se usan lotes grandes.
- Cabe en GPU de consumo: sí, con alta probabilidad, en tarjetas de 8 GB o más para inferencia a 640 píxeles; para 1248x1248 se recomienda 12-16 GB según el lote y la precisión numérica.
- Opciones de despliegue: el repositorio de pesos no documenta un pipeline de servido. Al estar construido sobre el fork YOLOv11-RGBT, que a su vez deriva de Ultralytics, son viables exportaciones a ONNX, TensorRT u OpenVINO, así como integración con librerías de inferencia ONNX Runtime o Triton. No hay soporte declarado para vLLM, TGI u Ollama, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles. Dependerán de la GPU, de la resolución de entrada y de si se ejecuta la rama única o la fusión de dos ramas.

## Comparativa con modelos similares

| Modelo | Modalidad | Arquitectura | Conjunto de entrenamiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| multispectral_uav_detection (este repo) | RGB + IR con fusión P3 | YOLO11s sobre fork YOLOv11-RGBT | Anti-UAV-RGBT + preentrenamiento no emparejado + datos de campo | AGPL-3.0 | Pesos publicados en HuggingFace, sin métricas |
| `yolo11s_rgb_from_scratch` (mismo repo) | Solo RGB | YOLO11s | Anti-UAV-RGBT | AGPL-3.0 | Incluido en el mismo repositorio; sirve de línea base unimodal |
| `yolo11s_ir_from_scratch` (mismo repo) | Solo IR | YOLO11s | Anti-UAV-RGBT | AGPL-3.0 | Incluido en el mismo repositorio; línea base térmica |
| Fork YOLOv11-RGBT (upstream) | RGB + IR | YOLO11 con fusión multimodal configurable | Distintos conjuntos RGBT | Según el repositorio original | Código abierto; los pesos concretos de este autor no forman parte del fork |

No se dispone de comparaciones numéricas con alternativas externas de la misma categoría (por ejemplo otros detectores anti-UAV multimodales), por lo que la comparación se limita a variantes del propio repositorio y al fork del que deriva.

## Limitaciones y advertencias

- Licencia AGPL-3.0: es una licencia copyleft fuerte. Su uso en un servicio accesible por red obliga, según la interpretación habitual de la FSF, a liberar el código fuente de la aplicación que lo integra. Es un obstáculo relevante para uso comercial cerrado y debe revisarse con asesoría legal antes de cualquier despliegue en producción.
- Ausencia total de métricas publicadas: no hay mAP, ni curvas precisión-recall, ni resultados por condición de iluminación. No es posible estimar el rendimiento real sin evaluar los checkpoints uno mismo.
- Historial de uso nulo en HuggingFace (0 descargas, 1 like) y sin paper asociado: el material no ha pasado revisión por pares ni validación independiente.
- Riesgo de alucinación en el sentido de detección: falsos positivos sobre objetos con firma térmica o forma similar (pájaros, globos, estructuras) y falsos negativos sobre drones pequeños, lejanos o parcialmente ocluidos. La clase objetivo concreta y su definición no se detallan en la información disponible.
- Sesgo de dominio: los modelos están entrenados sobre Anti-UAV-RGBT y sobre un conjunto de campo propio no descrito. El rendimiento puede degradarse ante sensores, altitudes, climas o fondos distintos de los de entrenamiento.
- Dependencia de la calibración RGB-IR: la fusión intermedia en P3 requiere pares de imágenes espacialmente alineados. Una mala alineación entre cámaras degrada el resultado y no hay información sobre tolerancia a desalineación.
- Resolución de entrada elevada en los modelos afinados (1248x1248): incrementa los requisitos de memoria y reduce el throughput en comparación con configuraciones a 640 píxeles, lo que puede comprometer escenarios de tiempo real en hardware de borde.
- Sin información sobre cuantización: no se garantiza que los checkpoints mantengan precisión tras conversión a INT8, y no se proporcionan recetas de exportación verificadas.
- Idiomas y contexto no aplican, pero conviene recordar que este repositorio no contiene ningún modelo generativo y no debe citarse como tal.

## Enlaces

- HuggingFace: [marymikkey/multispectral_uav_detection](https://huggingface.co/marymikkey/multispectral_uav_detection)
- Repositorio de código asociado: [github.com/marymikkey/multispectral_uav_detection](https://github.com/marymikkey/multispectral_uav_detection)
- Fork base: [YOLOv11-RGBT](https://github.com/wandahangFY/YOLOv11-RGBT) (commit `9cc2e208`)
- Conjunto de datos Anti-UAV-RGBT: referenciado en la model card, sin enlace directo en la información proporcionada (no disponible)
- Paper o blog técnico: no disponible
- Demo: no disponible
