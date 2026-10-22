# Sky-Kim/com.sky.sentis.sface

## Resumen

`sentis-sface` es la conversión a Unity Inference Engine (Sentis) del reconocedor facial SFace de OpenCV Zoo (`face_recognition_sface_2021dec`), en precisión FP32. No es un modelo de lenguaje: es un extractor de embeddings de identidad que transforma una cara alineada de 112x112 píxeles en un vector de 128 dimensiones normalizado en L2, de forma que la comparación entre dos caras se reduce a un producto escalar (similitud coseno). Lo publica el usuario Sky-Kim como paquete listo para usar dentro de Unity, con el grafo y una implementación autocontenida en C#.

El interés práctico está en que elimina la fricción de llevar un reconocedor facial a producción en Unity: el modelo incluye el escalado de entrada y la normalización L2 dentro del grafo, y el código `SFace.cs` implementa la alineación por 5 puntos landmarks en GPU mediante una transformación de similitud al template estándar de 112x112, replicando el comportamiento de `cv::FaceRecognizerSF::alignCrop`. Se complementa con el detector `com.sky.sentis.yunet` del mismo autor para formar un pipeline completo de detección, alineación y verificación que corre en el dispositivo.

La relevancia es doble: por un lado, permite verificación facial on-device sin enviar imágenes a la nube; por otro, la conversión está validada numéricamente contra ONNX Runtime y OpenCV (similitud coseno de 0.999998 o superior en el mismo recorte alineado). El repositorio, sin embargo, no registra descargas ni likes, y no incluye benchmarks propios: la cifra de precisión procede de OpenCV Zoo.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | MobileFaceNet entrenada con la pérdida SFace (Sigmoid-Constrained Hypersphere Loss) |
| Parámetros totales | No disponible en la información proporcionada |
| Parámetros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No aplica: modelo de visión con entrada fija `[1, 3, 112, 112]` RGB en rango 0-1 |
| Tipos de cuantización | Solo FP32 (`sface_fp32.sentis`); no se publican variantes INT8/FP16 |
| Idiomas soportados | No aplica (no procesa texto); no disponible |
| Licencia | Pesos Apache-2.0; código wrapper (`Runtime/`) MIT |
| Formato de pesos | `.sentis` (Unity Sentis), convertido desde `face_recognition_sface_2021dec.onnx` |
| Dimensión del embedding | 128 floats, normalizado en L2 dentro del grafo |
| Salida | `[1, 128]` |
| Umbral de similitud coseno recomendado | 0.363 (valor de OpenCV para "misma persona") |
| Pipeline / tarea | No disponible (campo `pipeline` vacío en HuggingFace) |

## Arquitectura y entrenamiento

La red es una MobileFaceNet, una CNN compacta diseñada para reconocimiento facial en dispositivos con recursos limitados, entrenada con la función de pérdida SFace propuesta por Yaoyao Zhong et al. (IEEE TIP 2021). SFace combina una restricción sigmoide con una pérdida de hipersfera para hacer más robusta la separación entre identidades y estabilizar el entrenamiento en datasets ruidosos. El modelo original forma parte de OpenCV Zoo y su conversión aquí presentada no reentrena nada: únicamente reexporta el grafo.

La conversión a Sentis introduce tres cambios relevantes sobre el ONNX de origen. Primero, se eliminan de la lista de entradas todos los initializers que la exportación de la época de MXNet declaraba como entradas del grafo, dejando únicamente `data`. Segundo, se antepone un escalado por 255 para que el `(x - 127.5) / 128` interno del grafo reciba el rango de píxel original. Tercero, la normalización L2 se incorpora al propio grafo, de modo que la similitud coseno se obtiene con un producto escalar directo. La alineación facial (transformación de similitud de los 5 landmarks —ojos, punta de nariz y comisuras de la boca— al template de 112x112) se realiza en GPU dibujando la textura origen a través de la transformación, y el código mantiene una galería (`FaceGallery`) con un prototipo promediado por persona inscrita.

No se dispone de información sobre el volumen de tokens, la composición del dataset de entrenamiento ni el uso de RLHF/DPO, ya que no es un modelo generativo y la model card no detalla el proceso de entrenamiento original.

## Capacidades

- Extracción de embeddings de identidad facial de 128 dimensiones a partir de una cara alineada de 112x112.
- Verificación 1:1 mediante similitud coseno (producto escalar, al estar el vector normalizado en L2 dentro del grafo).
- Identificación 1:N contra una galería de personas inscritas, con un prototipo promediado por identidad a partir de 1 a 5 fotos.
- Rechazo de caras desconocidas cuando la mejor similitud coseno cae por debajo del umbral configurado (0.363 por defecto, siguiendo el valor de OpenCV).
- Alineación facial en GPU a partir de 5 landmarks proporcionados por un detector externo (por ejemplo, YuNet del mismo autor).
- Ejecución en los backends de Unity Sentis: `BackendType.GPUCompute` y CPU.
- API asíncrona (`EmbedAsync`) para evitar bloqueos por lectura síncrona de GPU en algunos dispositivos móviles.
- Variante `EmbedAligned` para caras que ya llegan alineadas al template.
- No soporta tool calling, agentes, razonamiento multi-paso, visión general, audio ni capacidades multilingües: es un extractor de características especializado.

## Casos de uso

- Control de acceso físico en aplicaciones Unity: inscripción de empleados con 1 a 5 fotos y verificación en el punto de entrada comparando el embedding contra la galería local, con umbral 0.363 para rechazar visitantes no registrados.
- Autenticación on-device en apps móviles o de escritorio: al ejecutarse con Sentis en GPU o CPU local, las imágenes no salen del dispositivo, lo que simplifica el cumplimiento del RGPD en comparación con una verificación por API en la nube.
- Check-in en eventos y ferias: el pipeline YuNet + SFace permite identificar asistentes ya acreditados en el flujo de cámara, ejecutando una única inferencia por cada nueva pista de cara (no por fotograma) y refrescando cada segundo aproximadamente.
- Deduplicación de galerías fotográficas: agrupar imágenes de la misma persona comparando embeddings y aplicando el umbral coseno para decidir si dos caras pertenecen a la misma identidad.
- Interacción en experiencias de realidad virtual o aumentada: reconocer al usuario que se pone el visor o que aparece en escena para personalizar la experiencia, con el coste reducido de una MobileFaceNet en FP32.
- Kioscos y retail: identificar a clientes recurrentes que han dado su consentimiento previo y mostraron una tarjeta de fidelización, manteniendo la galería local y sin infraestructura de servidor.
- Robótica e IoT con cámaras integradas: verificación de operarios autorizados antes de ejecutar una acción sobre una máquina, aprovechando que el modelo cabe holgadamente en memoria de un SoC móvil.
- Moderación y control de presencia en videollamadas: verificar que la persona frente a la cámara coincide con la identidad de la sesión, reevaluando la similitud de forma periódica en lugar de en cada fotograma.

## Benchmarks y rendimiento

| Métrica | Valor | Fuente |
|---|---|---|
| Precisión en LFW | 0.99 | OpenCV Zoo, citado en la model card |
| Similitud coseno frente al modelo ONNX en ONNX Runtime y OpenCV (mismo recorte alineado) | 0.999998 o superior, en CPU y en GPUCompute | Model card del autor |
| Similitud coseno del pipeline completo (YuNet, alineación en GPU, SFace) frente al pipeline de OpenCV | 0.998 o superior | Model card del autor |
| Umbral coseno para "misma persona" | 0.363 | OpenCV, citado en la model card |

No se han publicado resultados de benchmarks en la información disponible más allá de la precisión en LFW heredada de OpenCV Zoo. No hay métricas de MMLU, HumanEval o GSM8K porque el modelo no realiza tareas de texto.

## Requisitos de hardware

- VRAM estimada: no disponible en la información proporcionada; la entrada es de 112x112 píxeles y la salida de 128 floats, por lo que la huella de memoria es muy reducida.
- GPU recomendadas: no se especifican modelos concretos; el modelo está pensado para `BackendType.GPUCompute` de Unity Sentis sobre la GPU del dispositivo (móvil, sobremesa o standalone de VR).
- Compatibilidad con GPU de consumo: sí, por diseño; cualquier GPU que exponga un backend de cómputo en Unity Sentis puede ejecutarlo, incluidos SoC móviles. El autor advierte que la lectura síncrona de GPU puede bloquearse en algunas GPU móviles, de ahí la API `EmbedAsync`.
- Despliegue: exclusivamente runtime de Unity Sentis. No aplican vLLM, llama.cpp, Ollama ni TGI, al no ser un modelo de lenguaje.
- Latencia y throughput: no disponibles. La model card recomienda calcular un embedding por cada nueva pista de cara y no por fotograma, con reverificación aproximadamente cada segundo.
- Almacenamiento: el repositorio figura con 0.0 GB en HuggingFace (cifra redondeada); el contenido son un fichero `.sentis` y un único `SFace.cs`.

## Comparativa con modelos similares

| Modelo | Arquitectura | Embedding | Precisión LFW | Formato | Licencia |
|---|---|---|---|---|---|
| sentis-sface (esta ficha) | MobileFaceNet + SFace loss | 128 | 0.99 (heredada de OpenCV Zoo) | `.sentis` | Apache-2.0 (wrapper MIT) |
| SFace original (OpenCV Zoo) | MobileFaceNet + SFace loss | 128 | 0.99 | ONNX | Apache-2.0 |
| Otras alternativas del ecosistema Unity/Sentis para reconocimiento facial | No disponible en la información proporcionada | No disponible | No disponible | No disponible | No disponible |
| ArcFace, FaceNet y similares | No disponible en la información proporcionada; la model card no ofrece comparación cuantitativa | No disponible | No disponible | No disponible | No disponible |

La comparación más directa es contra el propio SFace de OpenCV Zoo, del que este paquete es una reexportación funcionalmente equivalente con la alineación y la normalización resueltas para el runtime de Unity.

## Limitaciones y advertencias

- El modelo solo verifica identidad; no detecta caras por sí mismo y depende de un detector de 5 landmarks (YuNet u otro). Unos landmarks imprecisos degradan la alineación y, con ella, la similitud.
- El umbral 0.363 procede de OpenCV para "misma persona" y no ha sido recalibrado por el autor; conviene ajustarlo con datos propios del dominio (iluminación, cámara, demografía) antes de fijar una política de aceptación.
- El reconocimiento facial es sensible a sesgos demográficos y a condiciones de captura adversas (pose extrema, oclusión parcial, baja iluminación, resoluciones muy bajas). No se publican evaluaciones por subgrupo en la información disponible.
- Riesgo de falsos positivos en galerías grandes: la similitud coseno entre identidades distintas crece con el número de comparaciones; el umbral debe endurecerse a medida que crece la galería.
- El repositorio no registra descargas ni likes y la model card no incluye evaluación independiente; la única validación numérica es la equivalencia contra ONNX Runtime y OpenCV reportada por el autor.
- La fecha de creación del repositorio (2026-10-21) y la de actualización son posteriores a la mayoría de referencias del ecosistema, lo que refuerza la ausencia de validación por terceros.
- Uso comercial: los pesos son Apache-2.0 y el wrapper MIT, por lo que el uso comercial está permitido; aun así, la atribución a los autores originales de SFace y a OpenCV Zoo debe mantenerse.
- El tratamiento de datos biométricos exige base legal específica (consentimiento explícito, evaluación de impacto) bajo el RGPD; la naturaleza on-device reduce la exposición, pero no elimina la obligación.
- Solo se publica FP32: no hay variantes cuantizadas para reducir latencia o memoria en hardware muy limitado.
- No soporta texto, tool calling, agentes ni otras tareas propias de los modelos de lenguaje; no debe evaluarse con benchmarks de ese tipo.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/Sky-Kim/com.sky.sentis.sface
- Detector complementario YuNet en Sentis: https://huggingface.co/Sky-Kim/com.sky.sentis.yunet
- OpenCV Zoo, modelo SFace: https://github.com/opencv/opencv_zoo/tree/main/models/face_recognition_sface
- Pesos originales en HuggingFace (OpenCV): https://huggingface.co/opencv/face_recognition_sface
- Implementación de referencia SFace (zhongyy): https://github.com/zhongyy/SFace
- Paper: SFace: Sigmoid-Constrained Hypersphere Loss for Robust Face Recognition (IEEE TIP 2021): https://arxiv.org/abs/2205.12010
- La búsqueda web realizada no devolvió resultados relevantes sobre este modelo; los enlaces anteriores proceden de la model card del autor.
