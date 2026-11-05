# duke182/tryon-garment-detector

## Resumen

Try-on garment detector es un modelo de detección de objetos especializado en prendas de vestir, desarrollado por el usuario duke182 y publicado en HuggingFace. Se trata de un fine-tuning del detector D-FINE-nano (variante ligera de la familia D-FINE, con backbone COCO preentrenado) orientado a un caso de uso muy concreto: identificar en una imagen qué prenda corresponde a la parte superior del cuerpo, a la parte inferior o a un vestido completo, como paso previo a una experiencia de probador virtual en el navegador.

El modelo se distribuye exclusivamente en formato ONNX y está pensado para ejecutarse con ONNX Runtime Web sobre WebGPU, con un rendimiento declarado de aproximadamente 18 ms por imagen en un Apple M1. Esta orientación a inferencia en cliente (edge/browser) condiciona todo el diseño: entrada fija de 320x320 píxeles, salida de 100 detecciones con tres clases y una única etapa de post-proceso mediante sigmoide.

Su relevancia es acotada pero clara: cubre la necesidad de un detector de prendas pequeño, con licencia Apache-2.0 y sin dependencia de servidores, para integrarse en extensiones o aplicaciones web de probador virtual. No es un modelo generalista ni compite con detectores de propósito amplio; es una pieza de infraestructura para un pipeline de moda.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | D-FINE-nano (transformer detector con refinamiento iterativo de bounding boxes), exportado a ONNX |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo de visión, no de texto) |
| Tipos de cuantizacion | fp32 recomendado; fp16 descartado por el autor (produce salidas incorrectas en WebGPU) |
| Idiomas soportados | no disponible (no procesa texto) |
| Licencia | Apache-2.0 |
| Formato de pesos | ONNX |

Otros datos técnicos relevantes: entrada `pixel_values` de shape [1, 3, 320, 320] en RGB con valores en 0..1 y sin normalización media/desviación; salida `logits` [1, 100, 3] (sigmoide, sin clase "sin objeto") y `pred_boxes` [1, 100, 4] en formato cx, cy, w, h normalizados respecto a la imagen con letterbox. Umbral de score sugerido: 0,7.

## Arquitectura y entrenamiento

El modelo parte de `ustc-community/dfine-nano-coco`, un D-FINE nano preentrenado en COCO, y se fine-tunea durante 6 épocas a resolución de 320 píxeles sobre 13.036 imágenes del split de entrenamiento de Fashionpedia (shards 0 y 1). D-FINE es un detector basado en transformer que refina iterativamente las cajas predichas mediante un mecanismo de distribución de probabilidad (Fine-grained Distribution Refinement), lo que le permite obtener precisión competitiva con un coste computacional bajo en su variante nano.

La adaptación al dominio de moda reduce el espacio de clases a tres categorías agregadas a partir de la ontología de Fashionpedia: "upper" (clases 0, 1, 2, 3, 4, 5, 9 y 12), "lower" (clases 6, 7 y 8) y "dress" (clases 10 y 11). No se documenta uso de RLHF, DPO ni técnicas de alineación, algo esperable en un detector visual. La innovación principal no está en el entrenamiento sino en el empaquetado: exportación ONNX con un contrato de entrada/salida fijo y validado para WebGPU, con la advertencia explícita de no usar fp16 por errores de salida en esa plataforma.

## Capacidades

- Detección de objetos en imágenes con tres clases de prenda: parte superior (upper), parte inferior (lower) y vestido (dress).
- Salida de hasta 100 cajas con score por clase, suficiente para escenas con varias prendas o personas.
- Inferencia en navegador mediante ONNX Runtime Web sobre WebGPU, sin backend servidor.
- Preprocesado definido de forma determinista: letterbox a la esquina superior izquierda con relleno negro, RGB en 0..1 y sin normalización.
- Umbral de confianza recomendado de 0,7, ajustable por el integrador.
- No soporta tool calling, agentes, razonamiento multi-paso, texto, audio ni otras modalidades.

## Casos de uso

- Probador virtual en extensión de navegador: el detector identifica la prenda en la imagen del usuario o del catálogo y la clasifica en upper/lower/dress para seleccionar la plantilla de segmentación y superposición adecuada; los 18 ms por imagen en M1 permiten respuesta interactiva sin servidor.
- Preetiquetado de catálogos de e-commerce: procesar lotes de fotos de producto para asignar automáticamente la categoría gruesa de prenda antes de una revisión humana, reduciendo el trabajo manual de clasificación.
- Filtrado previo en pipelines de segmentación: usar las cajas detectadas como regiones de interés para modelos de segmentación o matting más pesados, recortando la imagen y ahorrando cómputo en el paso siguiente.
- Moderación y control de calidad de imágenes de moda: detectar si una foto contiene una prenda de la categoría esperada (por ejemplo, rechazar una imagen de catálogo de "vestido" que en realidad muestra una falda).
- Aplicaciones web offline o de privacidad estricta: al ejecutarse íntegramente en el cliente con ONNX Runtime Web, las imágenes del usuario no salen del navegador, lo que encaja en escenarios con requisitos de privacidad o conectividad limitada.
- Prototipado rápido de funciones de moda en frontend: integrar el modelo en demos y MVPs con WebGPU sin montar infraestructura de inferencia, gracias a su tamaño reducido y a la licencia Apache-2.0.

## Benchmarks y rendimiento

El autor publica una evaluación indicativa propia sobre 50 imágenes positivas y 25 negativas del split de validación de Fashionpedia, con umbral 0,7:

| Metrica | Valor |
|---|---|
| Precision | 0,837 |
| Recall | 0,631 |
| Latencia (Apple M1, WebGPU, ONNX Runtime Web) | ~18 ms por imagen |

No se han publicado resultados de benchmarks estándar (COCO mAP, Fashionpedia mAP, etc.) en la información disponible, ni comparaciones con otros detectores. El propio autor califica la evaluación de "pequeña e indicativa" y señala que no se ha evaluado en páginas de tienda reales.

## Requisitos de hardware

- VRAM estimada: no disponible con precisión; por el tamaño de entrada (320x320) y la naturaleza nano del modelo, el consumo es muy bajo, del orden de cientos de MB en fp32, pero no se documenta una cifra oficial.
- GPU recomendadas: cualquier GPU integrada o discreta con soporte WebGPU; el autor reporta funcionamiento en Apple M1.
- Cabe en GPU de consumo: sí, previsiblemente en cualquier GPU de consumo moderna con WebGPU; también en CPU mediante ONNX Runtime aunque con mayor latencia (no medida en la información disponible).
- Opciones de despliegue: ONNX Runtime Web sobre WebGPU es el objetivo principal; al ser un ONNX estándar, también puede servirse con ONNX Runtime en servidor, pero no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI (no aplicables a un detector visual).
- Latencia y throughput: ~18 ms por imagen en Apple M1 con WebGPU y fp32; no se publican cifras para otras plataformas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto/entrada | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| try-on-garment-detector (este) | no disponible (D-FINE-nano) | 320x320 px | Precision 0,837 / recall 0,631 en validación propia (25+50 imágenes) | Apache-2.0 | ONNX en HuggingFace |
| ustc-community/dfine-nano-coco (base) | no disponible | COCO estándar | mAP COCO no consultado en esta ficha | Apache-2.0 | HuggingFace |
| Detectores genéricos tipo YOLO-nano | no disponible | variable | no disponible | variable (AGPL o Apache según variante) | múltiples |

La comparación con alternativas de la misma categoría (detectores de prendas pequeños) no está disponible en la información proporcionada; el autor no publica comparativas frente a otros detectores de moda.

## Limitaciones y advertencias

- Evaluación muy limitada: 75 imágenes de validación, sin prueba en páginas de tienda reales; las métricas pueden no generalizar a dominios distintos de Fashionpedia.
- Recall moderado (0,631): aproximadamente un tercio de las prendas presentes pueden no detectarse con el umbral recomendado de 0,7.
- Solo tres clases agregadas; no distingue tipos finos de prenda (camisa, pantalón, falda, chaqueta), lo que limita su uso más allá del enrutado grueso en un probador virtual.
- fp16 no es viable en WebGPU según las pruebas del autor; obliga a fp32, lo que puede afectar a memoria y velocidad en algunos dispositivos.
- El contrato de entrada es estricto (320x320, letterbox a la esquina superior izquierda, sin normalización); un preprocesado distinto degrada las salidas sin aviso.
- Riesgo de falsos positivos en imágenes con patrones o texturas que se parezcan a prendas; no se documentan análisis de sesgo.
- Licencia Apache-2.0 permite uso comercial, pero las anotaciones de Fashionpedia son CC BY 4.0 y las imágenes originales tienen sus propias condiciones; conviene revisar la atribución exigida.
- Sin garantías de mantenimiento: el repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y el modelo se publicó sin documentación adicional sobre versionado o soporte.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/duke182/tryon-garment-detector
- Modelo base: https://huggingface.co/ustc-community/dfine-nano-coco
- Repositorio D-FINE: https://github.com/Peterande/D-FINE
- Dataset Fashionpedia: https://huggingface.co/datasets/detection-datasets/fashionpedia
- Paper Fashionpedia (Jia et al., ECCV 2020): no disponible como enlace directo en la información proporcionada
