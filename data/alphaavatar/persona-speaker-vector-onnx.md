# AlphaAvatar/persona-speaker-vector-onnx

## Resumen

El modelo `AlphaAvatar/persona-speaker-vector-onnx` es un extractor de embeddings de locutor (speaker embedding) desarrollado por AlphaAvatar como parte de su plugin de persona. Se basa en la arquitectura ERes2NetV2, una evolución de Res2Net optimizada para verificación de locutor, y está exportado a formato ONNX para su despliegue ligero. El modelo transforma una secuencia de filtros Kaldi de 80 bins (log-mel filterbank) en un vector de 192 dimensiones que representa la identidad vocal del hablante.

Este artefacto es una copia byte-idéntica del modelo `eres2netv2.onnx` alojado en el repositorio `AlphaAvatar/plugins-persona`, con la única diferencia del nombre del archivo. La proveniencia está verificada: proviene del checkpoint `pretrained_eres2netv2.ckpt` de ModelScope (`iic/speech_eres2netv2_sv_zh-cn_16k-common`), con licencia Apache-2.0. El modelo está pensado para integrarse en pipelines de autenticación biométrica, diarización de locutores o sistemas de verificación de identidad por voz, ofreciendo una solución compacta (68 MiB) y ejecutable en CPU.

La relevancia actual radica en su formato ONNX, que facilita la interoperabilidad con múltiples frameworks de inferencia (ONNX Runtime, TensorRT, etc.) y su tamaño reducido, lo que lo hace adecuado para entornos con recursos limitados. Sin embargo, carece de documentación sobre el proceso de entrenamiento y no incluye umbrales de decisión propios, por lo que el usuario debe implementar la lógica de comparación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ERes2NetV2 (basada en Res2Net, convolucional) |
| Parametros totales | 17.838.280 (post-fold, tras fusionar BatchNorm) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de audio, ventana de 3.0 s con hop de 1.0 s) |
| Tipos de cuantizacion | no disponible (solo se proporciona el ONNX original, sin cuantizar) |
| Idiomas soportados | no disponible (el upstream es chino mandarín, pero no se especifica en la ficha) |
| Licencia | Apache-2.0 |
| Formato de pesos | ONNX (IR 6, opset 11) |

## Arquitectura y entrenamiento

El modelo emplea la arquitectura ERes2NetV2, una variante de la familia Res2Net diseñada específicamente para tareas de verificación de locutor. Res2Net introduce conexiones residuales jerárquicas dentro de cada bloque convolucional, lo que permite capturar características multi-escala de forma eficiente. ERes2NetV2 añade mejoras sobre la versión original, aunque los detalles concretos de las modificaciones no se documentan en la ficha del modelo.

El entrenamiento se realizó en el marco del proyecto ModelScope `iic/speech_eres2netv2_sv_zh-cn_16k-common`, orientado a verificación de locutor en chino mandarín a 16 kHz. No se proporcionan datos sobre el volumen de datos de entrenamiento, la composición del dataset ni si se aplicaron técnicas como RLHF o DPO (no aplicables a este tipo de modelo). El checkpoint original tiene 17.896.745 parámetros; tras la fusión de capas Conv+BatchNorm durante la exportación a ONNX, el modelo final cuenta con 17.838.280 parámetros (diferencia de 58.465 correspondiente a los buffers de BatchNorm).

La exportación a ONNX se realizó con PyTorch 2.4.1, y se verificó la integridad de tres tensores inicializadores que sobreviven sin renombrado, confirmando que son bit-idénticos a los del checkpoint original. No se ha documentado el script de exportación ni los metadatos del modelo.

## Capacidades

- Extracción de embeddings de locutor de 192 dimensiones a partir de audio de 16 kHz.
- Verificación de locutor mediante comparación de similitud coseno (requiere normalización L2 manual del embedding de salida).
- Soporte de procesamiento por lotes (batch) en la entrada, verificado con batch 1 y 2.
- Ejecución determinista en CPU con ONNX Runtime (verificado con la versión 1.29.0).
- Preprocesamiento integrado: Kaldi-style log-mel filterbank de 80 bins, con dither 0.0 y normalización media por dimensión temporal.
- No incluye capacidades de generación de texto, tool calling, agentes, visión ni audio generativo.

## Casos de uso

- Autenticación biométrica por voz: el modelo puede integrarse en sistemas de acceso seguro donde se compara el embedding de una voz de referencia con el de una nueva grabación. Gracias a su tamaño reducido (68 MiB) y ejecución en CPU, es viable en dispositivos embebidos o servidores de baja capacidad.
- Diarización de locutores: en reuniones o grabaciones multi-hablante, se pueden extraer embeddings por ventanas deslizantes (3.0 s con hop de 1.0 s) y agruparlos mediante clustering para identificar cuántos hablantes intervienen y cuándo.
- Verificación de identidad en centros de llamadas: el modelo puede validar la identidad de un cliente comparando su voz con una plantilla almacenada, reduciendo el fraude en servicios telefónicos.
- Indexación y búsqueda de audio: los embeddings permiten crear índices de voz para buscar clips por similitud de locutor, útil en archivos de medios o bases de datos forenses.
- Control de acceso en asistentes de voz: se puede usar para personalizar respuestas según el usuario detectado, siempre que se combine con un umbral de decisión adecuado.
- Investigación académica: como modelo de referencia para comparar técnicas de verificación de locutor, dado que su licencia Apache-2.0 permite su uso y modificación sin restricciones comerciales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas como EER (Equal Error Rate), accuracy en conjuntos como VoxCeleb o AISHELL, ni comparaciones con otros modelos de speaker embedding. El único dato de rendimiento verificado es la ejecución determinista en CPU con ONNX Runtime, pero sin mediciones de latencia o throughput.

## Requisitos de hardware

- VRAM estimada: no aplica para CPU; en GPU, el modelo es muy ligero (68 MiB) y cabría en cualquier GPU con al menos 1 GB de VRAM, aunque no se ha probado en GPU.
- GPU recomendadas: no se requiere GPU; el modelo se verificó en CPU con ONNX Runtime. Si se desea aceleración, cualquier GPU moderna (RTX 2060 o superior) sería suficiente.
- Compatibilidad con consumer GPU: sí, cabe en cualquier GPU de consumo, incluso en las más básicas.
- Opciones de despliegue: ONNX Runtime (CPU y GPU), TensorRT, OpenVINO, o cualquier framework que soporte ONNX. También se puede convertir a otros formatos (por ejemplo, TensorFlow Lite) si se requiere.
- Latencia y throughput: no disponibles. Dado el tamaño del modelo y la entrada de 80 features por frame, se espera una latencia baja en CPU moderna, pero no hay mediciones publicadas.

## Comparativa con modelos similares

No se dispone de información comparativa en la ficha del modelo. No se mencionan modelos alternativos como ECAPA-TDNN, x-vector o otros sistemas de speaker embedding. La única referencia es el modelo original de ModelScope, del cual este es una copia. Por tanto, no se puede ofrecer una comparativa objetiva sin datos adicionales.

## Limitaciones y advertencias

- El embedding de salida no está L2 normalizado; es necesario normalizarlo manualmente antes de calcular similitud coseno, tal como se indica en la documentación.
- El umbral de decisión para verificación (same/different) no está incluido en el artefacto. El upstream usa 0.360, pero AlphaAvatar aplica su propio umbral (`SPEAKER_MATCH_THRESHOLD`) que no se documenta aquí.
- No se ha verificado el comportamiento acústico del modelo; los ejemplos proporcionados usan ruido sintético, no voz real, por lo que no sirven para evaluar calidad de embeddings en condiciones reales.
- El modelo está entrenado principalmente para chino mandarín (según el upstream), aunque no se especifica en la ficha. Su rendimiento en otros idiomas puede ser inferior.
- No se documentan sesgos potenciales, pero al ser un modelo de voz, puede presentar sesgos según el género, edad o acento de los hablantes, algo común en este tipo de sistemas.
- La licencia Apache-2.0 permite uso comercial, pero se debe mantener el aviso de copyright y la atribución correspondiente.
- El proceso de exportación a ONNX no está documentado (quién lo hizo, con qué script), lo que dificulta la reproducibilidad completa.

## Enlaces

- [HuggingFace - AlphaAvatar/persona-speaker-vector-onnx](https://huggingface.co/AlphaAvatar/persona-speaker-vector-onnx)
- [ModelScope - iic/speech_eres2netv2_sv_zh-cn_16k-common](https://modelscope.cn/models/iic/speech_eres2netv2_sv_zh-cn_16k-common) (no verificado directamente, pero referenciado en la model card)
- [AlphaAvatar/plugins-persona (repositorio legacy)](https://huggingface.co/AlphaAvatar/plugins-persona)
