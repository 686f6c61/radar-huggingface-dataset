# qhddz/yolo26-segment-rknn3-rk1828

## Resumen

YOLO26 Segmentation (RKNN3 / RK1828) es un paquete de modelos de segmentación de instancias derivados de Ultralytics YOLO26, convertidos al formato RKNN3 propietario de Rockchip y publicados por el usuario qhddz. No se trata de un modelo de lenguaje ni de un modelo fundacional: es un artefacto de despliegue que contiene pesos ya compilados y verificados para la NPU RK1828 de Rockchip, junto con una demo precompilada en C++ para hosts x86_64 conectados por PCIe.

El paquete incluye las variantes n, s y m de YOLO26-seg en cuantización int8 y fp16, junto con ficheros `.weight` auxiliares, la lista de 80 etiquetas COCO y una imagen de muestra. La propuesta de valor es la ausencia de paso de conversión: los `.rknn` se generaron con los pipelines oficiales de rknn3_model_zoo y se validaron en hardware real, de modo que el usuario puede descargar y ejecutar directamente sobre la NPU.

La relevancia es acotada pero clara para el nicho de visión artificial en el borde: evita el trabajo de exportar, cuantizar y depurar el grafo ONNX hacia RKNN3, que suele ser la parte más frágil del despliegue en plataformas Rockchip. El repositorio es pequeño (0,1 GB) y no tiene descargas ni likes en el momento de la consulta.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Red neuronal convolucional de detección y segmentación de instancias (Ultralytics YOLO26-seg), compilada a RKNN3 |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión, no de lenguaje) |
| Tipos de cuantización | int8 y fp16 |
| Idiomas soportados | no aplica (modelo de visión) |
| Licencia | AGPL-3.0 |
| Formato de pesos | `.rknn` (formato propietario RKNN3 de Rockchip) más ficheros `.weight` auxiliares |

## Arquitectura y entrenamiento

El modelo subyacente es YOLO26 en su tarea de segmentación de instancias, es decir, una red de una sola etapa que produce simultáneamente cajas delimitadoras y máscaras de píxeles por instancia. Ultralytics YOLO26 se caracteriza por eliminar el NMS en la salida (end-to-end) y por una rama de regresión sin anclas, lo que simplifica el postprocesado en hardware dedicado. El paquete publicado no aporta detalles sobre el número de tokens de entrenamiento, la composición del dataset ni si hubo ajuste fino adicional; se asume entrenamiento estándar sobre COCO, dado que el artefacto incluye `coco_80_labels_list.txt` y una muestra de COCO.

La innovación relevante de esta publicación no está en el entrenamiento, sino en la cadena de conversión: los ficheros `.rknn` se generaron con los pipelines oficiales de `airockchip/rknn3_model_zoo` y se validaron en una RK1828 física. Se proporcionan tres escalas (n, s, m) en dos precisiones, lo que permite elegir el compromiso latencia/precisión. El paquete incluye además una demo en C++ precompilada para x86_64 con las librerías de runtime, que se comunica con la NPU a través de PCIe.

## Capacidades

- Detección de objetos: produce cajas delimitadoras sobre las 80 clases de COCO.
- Segmentación de instancias: genera máscaras de píxeles por objeto, no solo cajas.
- Tres escalas de modelo (n, s, m) para ajustar el coste computacional al presupuesto del dispositivo.
- Dos precisiones (int8 y fp16): int8 para máximo rendimiento en NPU, fp16 como referencia de mayor fidelidad numérica.
- Ejecución íntegra en NPU RK1828 mediante RKNN3, sin conversión adicional por parte del usuario.
- Demo C++ lista para usar en host x86_64 con enlace PCIe a la NPU.
- No soporta tool calling, agentes, razonamiento multi-paso ni capacidades multilingües: es exclusivamente un modelo de visión.

## Casos de uso

- Inspección visual en línea de producción: el modelo detecta y segmenta defectos o piezas sobre cinta transportadora, y la variante int8 mantiene 261 ms por fotograma en RK1828, suficiente para inspección no crítica en tiempo real.
- Conteo y segmentación de personas en analítica de aforo: las máscaras permiten separar individuos solapados mejor que las cajas, y la ejecución en NPU de bajo consumo facilita despliegues en cámaras o gateways sin servidor GPU.
- Segmentación de vehículos y viandantes en aparcamientos o control de accesos: la salida de máscaras permite calcular ocupación por plaza y distinguir categorías COCO (coche, moto, persona) sin postprocesado geométrico complejo.
- Robótica móvil y AGV: integración de la NPU RK1828 en el chasis para segmentación de obstáculos y personas, con la demo C++ como base para portar la inferencia al bucle de control.
- Preprocesado en el borde para pipelines de vídeo: usar las máscaras para recortar regiones de interés antes de enviar solo los píxeles relevantes a un modelo mayor en la nube, reduciendo ancho de banda.
- Prototipado rápido en laboratorio: la demo x86_64 con PCIe permite validar la precisión y la latencia reales antes de comprometerse con un diseño de placa RK1828 embebida.
- Investigación en eficiencia de NPUs: banco de pruebas comparativo entre int8 y fp16 sobre la misma red para estudiar la degradación de métricas de segmentación por cuantización.

## Benchmarks y rendimiento

| Métrica | Valor |
|---|---|
| Latencia yolo26m-seg int8 en RK1828 | 261 ms/fotograma |
| Detecciones en la muestra COCO | 4 personas y 1 autobús |
| Métricas de precisión (mAP, mask mAP) | no disponibles |

No se han publicado resultados de benchmarks de precisión (mAP de cajas o máscaras) en la información disponible. El único dato de rendimiento es la latencia medida en hardware real para la variante media en int8.

## Requisitos de hardware

- NPU objetivo: Rockchip RK1828, con runtime RKNN3. No es ejecutable en GPU convencional ni en CPU sin la cadena de conversión correspondiente.
- Host: x86_64 con enlace PCIe a la NPU; la demo incluida está compilada para esta combinación.
- VRAM: no aplica en el sentido de GPU; el modelo reside en la memoria de la NPU. El tamaño del repositorio es de 0,1 GB, lo que da una cota superior del espacio de almacenamiento necesario para los pesos.
- GPU de consumo: no compatible; el formato `.rknn` es específico de Rockchip y no se ejecuta en RTX 4090 ni similares.
- Opciones de despliegue: runtime RKNN3 con la demo C++ incluida, o integración propia mediante las librerías de runtime del paquete. No hay soporte para vLLM, llama.cpp, Ollama ni TGI, que son herramientas para modelos de lenguaje.
- Latencia: 261 ms por fotograma para yolo26m-seg int8; el resto de variantes no tiene cifras publicadas.

## Comparativa con modelos similares

| Modelo | Formato | Plataforma | Licencia | Precisión publicada | Latencia publicada |
|---|---|---|---|---|---|
| Este paquete (YOLO26-seg n/s/m) | RKNN3 | NPU RK1828 | AGPL-3.0 | no disponible | 261 ms (m, int8) |
| YOLO26-seg original (Ultralytics) | PyTorch / ONNX | GPU / CPU | AGPL-3.0 | no disponible en la información | no disponible |
| Otros paquetes RKNN de segmentación en Hugging Face | RKNN | NPU Rockchip | variable | no disponible | no disponible |

La comparación directa con alternativas cuantificadas es limitada porque no se dispone de métricas de precisión ni de latencias de terceros en la información proporcionada. La diferencia principal frente al modelo original de Ultralytics es el formato precompilado y la validación en hardware, no la arquitectura.

## Limitaciones y advertencias

- El formato `.rknn` solo se ejecuta en NPU Rockchip con runtime RKNN3; no es portable a otras plataformas sin reconversión desde el modelo original.
- La licencia AGPL-3.0 impone obligaciones copyleft fuertes: el uso en servicios de red puede obligar a liberar el código del servicio. Es un caveat relevante para uso comercial en producto cerrado.
- No se publican métricas de precisión (mAP de cajas y máscaras) ni curvas de degradación por cuantización int8, por lo que no es posible evaluar la pérdida de calidad frente al modelo en fp32 sin medirla uno mismo.
- El repositorio no tiene descargas ni validación por parte de la comunidad; la verificación en hardware la declara el autor, no un tercero independiente.
- Sesgos: al entrenarse sobre COCO, hereda los sesgos de representación y las limitaciones de vocabulario de ese dataset (80 clases, dominado por escenas urbanas de países desarrollados).
- Riesgo de falsos positivos y máscaras imprecisas en objetos pequeños, ocluidos o fuera de las categorías COCO.
- No hay información sobre el proceso de entrenamiento, la composición del dataset ni posibles ajustes finos, lo que dificulta la reproducibilidad.
- La fecha de creación indicada (2026-11-17) es posterior a la consulta; conviene verificar la vigencia y procedencia del artefacto antes de usarlo en producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/qhddz/yolo26-segment-rknn3-rk1828
- Repositorio oficial de pipelines de conversión: https://github.com/airockchip/rknn3_model_zoo
- Ultralytics YOLO26: no disponible en la información proporcionada.
