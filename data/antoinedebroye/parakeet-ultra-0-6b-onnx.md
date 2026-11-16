# antoinedebroye/parakeet-ultra-0.6b-onnx

## Resumen

Parakeet Ultra 0.6B ONNX es una exportación a formato ONNX con cuantización int8 del modelo de reconocimiento automático del habla moondream/parakeet-ultra, publicado por el usuario antoinedebroye. El modelo original es a su vez una versión post-entrenada de parakeet-tdt-0.6b-v3 de NVIDIA, un sistema ASR basado en arquitectura FastConformer con decodificación TDT (Token-and-Duration Transducer) y aproximadamente 600 millones de parámetros.

La relevancia de esta ficha radica en que el artefacto publicado no es un modelo nuevo, sino un empaquetado optimizado para inferencia en CPU: dos grafos ONNX (encoder y decoder-joint) cuantizados dinámicamente a int8, junto con el vocabulario SentencePiece. El objetivo es permitir el despliegue del modelo en entornos sin GPU mediante las librerías onnx-asr y parakeet-rs, manteniendo una precisión cercana a la del modelo original.

El modelo cubre 25 idiomas europeos (incluyendo español, inglés, francés, alemán, italiano, portugués, neerlandés, polaco, ruso y ucraniano, entre otros) y se distribuye bajo licencia CC-BY-4.0. No se ha realizado ningún entrenamiento adicional en esta exportación: únicamente conversión de formato y cuantización, con eliminación de la cabeza de detección de actividad de voz (VAD) presente en el modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | FastConformer encoder + TDT (Token-and-Duration Transducer) decoder-joint |
| Parametros totales | 0,6 B (aproximadamente 600 millones) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | int8 dinámica (QUInt8) sobre ONNX |
| Idiomas soportados | en, es, fr, de, bg, hr, cs, da, nl, et, fi, el, hu, it, lv, lt, mt, pl, pt, ro, sk, sl, sv, ru, uk (25 idiomas) |
| Licencia | CC-BY-4.0 |
| Formato de pesos | ONNX (encoder-model.int8.onnx, decoder_joint-model.int8.onnx) + vocab.txt |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de parakeet-tdt-0.6b-v3 de NVIDIA: un encoder FastConformer (variante de Conformer con atención por bloques y subsampling) acoplado a un decodificador TDT, que predice conjuntamente tokens y duraciones para emitir transcripciones de forma no autorregresiva por pasos. El modelo base fue entrenado originalmente por NVIDIA, y moondream/parakeet-ultra lo post-entrenó posteriormente; los detalles concretos de ese post-entrenamiento (número de tokens, composición del dataset, uso de RLHF/DPO) no están disponibles en la información proporcionada.

Esta exportación no implica ningún entrenamiento. El proceso documentado por el autor consiste en cargar parakeet-tdt-0.6b-v3 en NeMo 3.0, sustituir cada tensor entrenable por el tensor correspondiente de moondream/parakeet-ultra (723 tensores emparejados y verificados en forma mediante la tabla de mapeo de transformers), descartar los tensores vad_head.* (que alimentan el segmentador Photon de Moondream y no forman parte del grafo ASR), exportar con model.export() y cuantizar con quantize_dynamic de ONNX Runtime. Como control de calidad, el autor indica que el mismo script aplicado a los pesos originales de v3 reproduce el bundle int8 de istupakov, con WER de FLEURS idéntico en inglés y polaco y dentro de 0,5 puntos en francés y alemán.

## Capacidades

- Reconocimiento automático del habla (transcripción de audio a texto) en 25 idiomas europeos.
- Decodificación TDT con predicción conjunta de tokens y duraciones, lo que permite emisión eficiente sin bucle autorregresivo token a token.
- Inferencia en CPU gracias a la cuantización int8 dinámica y al formato ONNX.
- Compatibilidad directa con onnx-asr (Python) y parakeet-rs (Rust) sin modificaciones en el cargador.
- Soporte multilingüe amplio: inglés, español, francés, alemán, búlgaro, croata, checo, danés, neerlandés, estonio, finés, griego, húngaro, italiano, letón, lituano, maltés, polaco, portugués, rumano, eslovaco, esloveno, sueco, ruso y ucraniano.
- No se documentan capacidades de tool calling, agentes, visión, audio generativo ni modo de razonamiento explícito; es un modelo puramente ASR.

## Casos de uso

- Transcripción de reuniones y notas de voz en servidores sin GPU: al ejecutarse en CPU con ONNX int8, puede desplegarse en instancias modestas o en el propio portátil del usuario mediante parakeet-rs u onnx-asr, procesando audio en los 25 idiomas soportados.
- Subtitulado automático de vídeo multilingüe: el soporte de 25 idiomas europeos permite generar subtítulos para contenido en español, francés, alemán, polaco o ruso con un único modelo, simplificando pipelines de localización.
- Atención al cliente basada en voz: integración en sistemas de call center para transcribir llamadas en tiempo (casi) real en CPU, reduciendo el coste de infraestructura frente a soluciones que exigen GPU.
- Indexación y búsqueda de archivos de audio: transcripción por lotes de grandes volúmenes de grabaciones (podcasts, archivos periodísticos, entrevistas) para construir índices de texto consultables, aprovechando el bajo coste de la inferencia int8 en CPU.
- Aplicaciones de escritorio y móviles sin conectividad: al no requerir GPU ni servicios en la nube, el modelo puede empaquetarse en aplicaciones locales de dictado o accesibilidad (transcripción en vivo para personas con discapacidad auditiva).
- Preprocesado para pipelines de NLP: convertir audio a texto antes de pasarlo a modelos de resumen, análisis de sentimiento o extracción de entidades, usando el ASR como primer eslabón en un sistema mayor.
- Investigación en ASR multilingüe: servir como línea base reproducible en CPU para comparar técnicas de cuantización o de post-entrenamiento, dado que el autor documenta el procedimiento de exportación y verificación.

## Benchmarks y rendimiento

Resultados de WER sobre FLEURS (primeras 100 locuciones por idioma, texto en minúsculas y sin puntuación), decodificado con parakeet-rs en CPU:

| Modelo | en | fr | de | es | it | pt | nl | ru | pl |
|---|---|---|---|---|---|---|---|---|---|
| parakeet-tdt-0.6b-v3 int8 | 5,29 | 7,97 | 10,09 | – | – | – | – | – | 12,88 |
| **este modelo (int8)** | **4,68** | **7,01** | **5,32** | 3,40 | 3,21 | 5,14 | 9,16 | 7,20 | **9,88** |

No se han publicado en la información disponible resultados para los 16 idiomas restantes ni métricas de latencia o throughput.

## Requisitos de hardware

- VRAM estimada: no aplica para inferencia en CPU; el repositorio ocupa 0,7 GB en total (dos grafos ONNX int8 más vocabulario).
- GPU recomendadas: no se especifican; el artefacto está pensado para ejecución en CPU. Podría ejecutarse en GPU mediante ONNX Runtime con el proveedor CUDA, pero no se documenta.
- Cabe en cualquier equipo consumer: al tratarse de un modelo de 0,6 B cuantizado a int8, la huella en memoria es del orden de cientos de MB, apta para portátiles y dispositivos de gama baja.
- Opciones de despliegue: onnx-asr (Python) y parakeet-rs (Rust), ambos compatibles sin cambios con el layout de ficheros de istupakov/parakeet-tdt-0.6b-v3-onnx. También es posible usar ONNX Runtime directamente.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Idiomas | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| **este modelo** (parakeet-ultra 0.6B int8 ONNX) | 0,6 B | 25 | ONNX int8 | CC-BY-4.0 | Exportación de moondream/parakeet-ultra; sin entrenamiento adicional |
| moondream/parakeet-ultra | 0,6 B | no disponible | safetensors (NeMo) | CC-BY-4.0 | Modelo original post-entrenado; requiere NeMo |
| nvidia/parakeet-tdt-0.6b-v3 | 0,6 B | 25 | NeMo / safetensors | CC-BY-4.0 | Base de NVIDIA; referencia de WER en la tabla anterior |
| istupakov/parakeet-tdt-0.6b-v3-onnx | 0,6 B | 25 | ONNX int8 | CC-BY-4.0 (heredada) | Exportación int8 del modelo de NVIDIA; mismo layout de ficheros |

## Limitaciones y advertencias

- Es una exportación de formato y cuantización, no un modelo entrenado: cualquier mejora o defecto proviene de moondream/parakeet-ultra y, en última instancia, de parakeet-tdt-0.6b-v3.
- Solo se han publicado métricas de WER para 9 de los 25 idiomas soportados; el rendimiento en los 16 restantes es desconocido.
- La cuantización int8 introduce una degradación potencial frente a los pesos originales, aunque el autor reporta WER igual o mejor en los idiomas medidos (la mejora probablemente se debe a diferencias en el post-entrenamiento, no a la cuantización).
- Riesgo de alucinación y errores en audio con ruido, acentos no representados en el entrenamiento o solapamiento de hablantes; no se documentan métricas en condiciones adversas.
- Se han eliminado los tensores vad_head.*, por lo que no hay detección de actividad de voz integrada; la segmentación debe hacerse externamente.
- Licencia CC-BY-4.0: permite uso comercial con atribución a Moondream y NVIDIA; es obligatorio conservar la atribución y señalar los cambios (conversión a ONNX y cuantización).
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, y fue creado y actualizado el mismo día (2026-11-15), por lo que carece de validación comunitaria independiente.
- No se documentan sesgos específicos por idioma, género o acento; al ser un modelo derivado de NVIDIA, hereda los sesgos de sus datos de entrenamiento, no disponibles.

## Enlaces

- Hugging Face (este modelo): https://huggingface.co/antoinedebroye/parakeet-ultra-0.6b-onnx
- Modelo base post-entrenado: https://huggingface.co/moondream/parakeet-ultra
- Modelo original de NVIDIA: https://huggingface.co/nvidia/parakeet-tdt-0.6b-v3
- Exportación ONNX de referencia (istupakov): https://huggingface.co/istupakov/parakeet-tdt-0.6b-v3-onnx
- Librería onnx-asr: https://github.com/istupakov/onnx-asr
- Librería parakeet-rs: https://github.com/altunenes/parakeet-rs
