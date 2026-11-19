# software-mansion/react-native-executorch-yolo26-seg

## Resumen

El repositorio `software-mansion/react-native-executorch-yolo26-seg` distribuye los modelos de segmentación de instancias YOLO26 exportados como programas ExecuTorch `.pte` listos para ejecutarse en dispositivo (on-device) a través de la librería React Native ExecuTorch. No se trata de un modelo entrenado por Software Mansion, sino de una redistribución del modelo upstream YOLO26 en su tarea de segmentación (disponible en la documentación de Ultralytics), compilado para varios backends de aceleración móvil: CoreML (Apple), Vulkan (GPU móviles y de escritorio) y XNNPACK (CPU, con variantes fp32 e int8).

El paquete cubre las cinco escalas habituales de la familia YOLO (n, s, m, l, x) y tres resoluciones de entrada (384, 512 y 640 píxeles), lo que da un total de 60 ficheros `.pte` publicados. Esta granularidad permite elegir el equilibrio entre precisión y coste computacional según el hardware objetivo, desde teléfonos de gama media hasta dispositivos con GPU integrada. El repositorio ocupa 5,5 GB y acumula 2192 descargas en el momento de la consulta.

Su relevancia actual radica en que facilita el despliegue de segmentación de instancias en aplicaciones React Native sin necesidad de infraestructura de servidor: los pesos ya están convertidos y optimizados para los tres backends, y la model card documenta la pérdida de precisión de la cuantización int8 frente a fp32, un dato poco habitual y útil para decisiones de producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | YOLO26 (detector de una etapa con cabeza de segmentación de instancias); exportado a ExecuTorch `.pte` |
| Parametros totales | no disponible (cinco escalas: n, s, m, l, x; el autor no publica recuentos) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión; resoluciones de entrada de 384, 512 y 640 px) |
| Tipos de cuantizacion | fp16 (CoreML, Vulkan), fp32 (XNNPACK), int8 estático PT2E con pesos per-channel (XNNPACK) |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | AGPL-3.0 |
| Formato de pesos | ExecuTorch `.pte` |

## Arquitectura y entrenamiento

YOLO26 es un detector de objetos de una etapa con una rama adicional de segmentación que produce máscaras por instancia, siguiendo el linaje de las versiones YOLO de Ultralytics. La exportación a ExecuTorch genera programas que combinan operadores delegados a CoreML (en iOS/macOS), Vulkan (GPU compatibles) y XNNPACK (CPU), con el grafo particionado automáticamente por el compilador de ExecuTorch. El repositorio no documenta la arquitectura interna de la red ni los datos de entrenamiento; esa información corresponde al modelo upstream de Ultralytics.

La innovación técnica principal de esta distribución es la cuantización estática int8 para XNNPACK mediante PT2E, con pesos per-channel y una estrategia selectiva de precisión: la primera convolución y la cabeza de segmentación se mantienen en fp32, a excepción de la rama de prototipos de máscara. El autor documenta además que los backends MLX fueron exportados pero no publicados, dejando notas (`NOTES.md`) en los directorios correspondientes de cada escala. No se especifica si hubo RLHF, DPO ni el volumen de tokens o imágenes de entrenamiento, por tratarse de un modelo de visión y de una redistribución.

## Capacidades

- Segmentación de instancias: genera máscaras binarias por objeto además de las cajas delimitadoras, con clases del conjunto COCO (el autor reporta mAP de cajas y de máscaras sobre val2017).
- Detección de objetos: la cabeza de cajas produce localizaciones y clases, evaluables de forma independiente de las máscaras.
- Inferencia on-device: los programas `.pte` se ejecutan localmente en el dispositivo mediante el runtime de ExecuTorch, sin llamadas a servidor.
- Aceleración por backend: CoreML para Apple, Vulkan para GPU compatibles y XNNPACK para CPU, con variantes de precisión seleccionables.
- Tres resoluciones de entrada (384, 512, 640 px) por escala, lo que permite ajustar latencia y precisión.
- Integración con React Native mediante la librería `react-native-executorch`.
- No soporta tool calling, agentes, razonamiento multi-step ni capacidades multilingües: no es un modelo generativo de texto.

## Casos de uso

- Segmentación en tiempo real en apps móviles React Native: se elige una variante `n` o `s` a 384 px con XNNPACK int8 o CoreML fp16 para ejecutar la inferencia en el propio teléfono, sin backend, en flujos de cámara o galería.
- Edición fotográfica con recorte por objeto: la salida de máscaras permite aislar personas, vehículos o animales en una imagen capturada por el usuario y aplicar recortes o fondos sin subir la foto a un servidor.
- Realidad aumentada y filtros: la segmentación por instancia a 384 px con la escala `n` reduce la latencia lo suficiente para superponer efectos sobre objetos detectados en el flujo de cámara.
- Análisis de imágenes offline en campo: aplicaciones de inspección o inventario que operan sin conectividad pueden usar la variante `x` a 640 px con XNNPACK fp32 cuando la precisión prima sobre la latencia.
- Moderación o clasificación visual en el borde: la detección de cajas y máscaras permite filtrar contenido en el dispositivo antes de enviarlo a un servicio, reduciendo coste de ancho de banda y exposición de datos.
- Prototipado rápido en escritorio con Vulkan: la variante `m` o `l` a 512 px con Vulkan fp16 sirve para validar pipelines de visión en dispositivos con GPU compatible antes de portar a móvil.
- Investigación en eficiencia de modelos: la tabla de mAP fp32 frente a int8 publicada por el autor permite estudiar el impacto de la cuantización selectiva en un detector-segmentador real.

## Benchmarks y rendimiento

El autor publica mAP50-95 de cajas y máscaras sobre las primeras 500 imágenes de COCO val2017, comparando fp32 e int8 de XNNPACK a la misma resolución (formato cajas / máscaras):

| Escala | 384 fp32 | 384 int8 | 512 fp32 | 512 int8 | 640 fp32 | 640 int8 |
|---|---|---|---|---|---|---|
| n | 36,85 / 31,69 | 36,51 / 31,24 | 40,92 / 35,30 | 40,54 / 34,95 | 41,77 / 36,02 | 41,21 / 35,43 |
| s | 45,43 / 38,48 | 44,97 / 38,34 | 48,88 / 41,66 | 48,54 / 41,59 | 50,06 / 42,43 | 49,30 / 41,93 |
| m | 51,65 / 43,11 | 51,06 / 42,84 | 53,68 / 45,43 | 53,61 / 45,44 | 55,11 / 47,03 | 54,64 / 46,95 |
| l | 53,70 / 44,90 | 53,50 / 44,72 | 56,82 / 47,81 | 55,85 / 47,12 | 56,10 / 47,65 | 55,72 / 47,53 |
| x | 56,55 / 47,04 | 55,97 / 46,32 | 58,40 / 49,22 | 57,71 / 48,70 | 57,79 / 49,12 | 57,51 / 48,94 |

No se publican datos de latencia ni throughput en la información disponible. Tampoco hay comparación con otros modelos en la model card.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita; el repositorio pesa 5,5 GB en total, pero cada fichero `.pte` individual es una fracción de ese tamaño y no se detalla por variante.
- GPU recomendadas: no especificadas por el autor. Por backend: CoreML requiere hardware Apple (ANE/GPU); Vulkan requiere una GPU con soporte Vulkan; XNNPACK funciona en CPU.
- Cabe en GPU de consumo: sí, previsiblemente, dado que son modelos móviles de escala n a x; no se publican requisitos mínimos concretos.
- Opciones de despliegue: runtime de ExecuTorch a través de `react-native-executorch` en React Native; los ficheros `.pte` son específicos de ExecuTorch y no se distribuyen en otros formatos (GGUF, safetensors).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / entrada | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| yolo26-seg (este repo) | no disponible (n/s/m/l/x) | 384, 512, 640 px | mAP cajas/máscaras hasta 58,40 / 49,22 (x, 512 fp32) | AGPL-3.0 | Hugging Face, `.pte` para ExecuTorch |
| YOLO26 upstream (Ultralytics) | no disponible | no disponible | no disponible en esta información | no disponible en esta información | Documentación de Ultralytics |
| YOLOv8-seg (Ultralytics) | no disponible | no disponible | no disponible en esta información | AGPL-3.0 (versión abierta) | Pesos PyTorch, exportaciones varias |
| YOLO11-seg (Ultralytics) | no disponible | no disponible | no disponible en esta información | AGPL-3.0 (versión abierta) | Pesos PyTorch, exportaciones varias |

No se dispone de datos de benchmarks de los modelos comparables en la información proporcionada; la comparación se limita a licencia y formato de distribución.

## Limitaciones y advertencias

- Licencia AGPL-3.0: el uso comercial en productos distribuidos exige cumplir las obligaciones de copyleft de la AGPL, lo que puede condicionar la integración en aplicaciones propietarias; conviene revisar con asesoría legal.
- Modelo de visión: no procesa texto ni mantiene conversaciones; las expectativas de "contexto" o "idiomas" no aplican.
- Solo clases COCO: la segmentación se limita a las categorías del conjunto de entrenamiento upstream; no se documenta el vocabulario exacto en la model card.
- Precisión int8 ligeramente inferior: la tabla del autor muestra caídas de hasta ~1 punto de mAP en algunas combinaciones (por ejemplo, l a 512: 56,82 → 55,85 en cajas), aceptables pero medibles.
- Backends MLX no publicados: la ruta MLX queda fuera de esta distribución, con notas de fallo en los directorios correspondientes.
- Riesgo de alucinación: en el contexto de detección, se traduce en falsos positivos y máscaras imprecisas en objetos ocluidos o de pequeña escala, especialmente en las variantes `n` y `s`.
- Sin datos de latencia ni de consumo energético publicados: la idoneidad para tiempo real en un dispositivo concreto debe medirse empíricamente.
- Formato cerrado a ExecuTorch: no hay pesos en safetensors ni GGUF en este repositorio, lo que limita su uso fuera del ecosistema ExecuTorch/React Native.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/software-mansion/react-native-executorch-yolo26-seg
- Librería React Native ExecuTorch (npm): https://www.npmjs.com/package/react-native-executorch
- Modelo upstream YOLO26 (segmentación, Ultralytics): https://docs.ultralytics.com/tasks/segment/
- Notas de exportación MLX no publicada (escala l): https://huggingface.co/software-mansion/react-native-executorch-yolo26-seg/blob/main/l/mlx/NOTES.md
