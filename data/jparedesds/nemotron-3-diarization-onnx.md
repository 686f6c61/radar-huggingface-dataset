# jparedesDS/nemotron-3-diarization-onnx

## Resumen

Nemotron 3 Diarization ONNX es una compilación cuantizada a int8 del modelo de diarización de hablantes Nemotron 3 Diarization (Streaming Sortformer v3) de NVIDIA, publicada por el usuario jparedesDS. El modelo original resuelve el problema de la diarización de hablantes en streaming, es decir, identificar quién habla en cada momento de un flujo de audio continuo, con soporte para hasta 8 hablantes simultáneos. Esta versión está pensada para ejecutarse en el navegador mediante onnxruntime-web (WASM), y es la que utiliza el proyecto subany para separar hablantes en subtítulos en directo.

La aportación de esta ficha no es un modelo nuevo, sino un artefacto de despliegue: un único fichero ONNX de 107 MB con cuantización dinámica int8 aplicada solo a las operaciones MatMul, manteniendo las mismas entradas, salidas y metadatos que el export fp32 del que procede. Según el autor, la precisión medida es idéntica a la del modelo fp32 en los conjuntos de evaluación AMI y VoxConverse, lo que la convierte en una opción atractiva para inferencia en cliente sin GPU.

Es relevante ahora porque demuestra que la diarización de hablantes de calidad puede ejecutarse íntegramente en el navegador con un consumo de memoria inferior a 1 GB y a una velocidad varias veces superior al tiempo real, algo que hasta hace poco requería infraestructura de servidor. No es, sin embargo, un lanzamiento oficial de NVIDIA.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Streaming Sortformer v3 (transformer de diarización en streaming) |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo de streaming sobre audio continuo) |
| Tipos de cuantización | int8 dinámica (QInt8 sobre operaciones MatMul); existe export fp32 de origen |
| Idiomas soportados | no disponible (la diarización es independiente del idioma) |
| Licencia | OpenMDW-1.1 |
| Formato de pesos | ONNX (fichero `nemotron3_diar_v3_int8.onnx`, 107 MB) |

## Arquitectura y entrenamiento

El modelo subyacente es Streaming Sortformer v3 de NVIDIA, una arquitectura de diarización de hablantes diseñada para operar sobre flujos de audio continuos y resolver la asignación de hablantes en línea, con capacidad para hasta 8 hablantes. Esta ficha no dispone de detalles sobre el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de ajuste como RLHF o DPO; esa información corresponde a la model card oficial de NVIDIA, que el autor remite explícitamente.

La innovación de esta publicación es puramente de despliegue. El proceso de conversión parte del checkpoint original de NVIDIA, pasa por un export fp32 a ONNX realizado por el proyecto altunenes/parakeet-rs y aplica `onnxruntime.quantization.quantize_dynamic` con `weight_type=QuantType.QInt8` y `op_types_to_quantize=['MatMul']`. El resultado conserva los metadatos ONNX del export original, incluidos los valores por defecto de streaming y el embedding de silencio aprendido, de modo que puede sustituir al fp32 sin cambios en el código de integración. El fichero tiene SHA-256 `62936c5aa9d7175d707bffd75fe010bf9c79d86e9cb0abcfbca361b66b74873d`.

## Capacidades

- Diarización de hablantes en streaming sobre audio continuo, con hasta 8 hablantes diferenciados.
- Detección de actividad de voz (el pipeline declarado en Hugging Face es `voice-activity-detection`).
- Asignación de tramos de habla a hablantes, adecuada para etiquetar subtítulos en directo.
- Ejecución en navegador mediante onnxruntime-web con backend WASM y multihilo (hasta 16 hilos WASM en la medición del autor).
- Inferencia en cliente sin GPU, con un consumo de memoria de aproximadamente 0,9 GB.
- Compatibilidad de interfaz con el export fp32: mismas entradas, salidas y metadatos ONNX.
- No se documentan capacidades de generación de texto, código, matemáticas, visión, tool calling ni razonamiento multi-paso; es un modelo especializado exclusivamente en audio.

## Casos de uso

- Subtitulado en directo con etiquetas de hablante: el modelo permite atribuir cada fragmento de subtítulo a la persona que habla, que es exactamente el uso que le da subany en producción. Su naturaleza de streaming encaja con audio que llega de forma continua.
- Transcripción de reuniones con separación de participantes: integrado en una aplicación web, puede procesar el audio de una videollamada y generar un acta donde cada intervención queda atribuida a su autor, sin enviar el audio a un servidor.
- Herramientas de accesibilidad en el navegador: aplicaciones que muestran quién habla en una conversación o en un vídeo pueden ejecutar el modelo localmente, lo que reduce la latencia y evita transmitir datos de voz a terceros.
- Análisis de entrevistas y podcasts: permite segmentar grabaciones por interlocutor antes de pasarlas a un sistema de transcripción, facilitando la revisión y el etiquetado posterior.
- Investigación en procesamiento de voz: sirve como referencia de diarización en streaming cuantizada para comparar precisión y coste frente a versiones fp32 o a modelos ejecutados en servidor.
- Prototipado rápido sin infraestructura: al caber en un único fichero ONNX de 107 MB y ejecutarse con onnxruntime-web, permite validar flujos de diarización en una demo web antes de invertir en despliegue con GPU.
- Aplicaciones de privacidad por diseño: al ejecutarse en el cliente, encaja en escenarios donde el audio no puede salir del dispositivo, como entornos sanitarios o legalmente sensibles.

## Benchmarks y rendimiento

El autor publica una métrica de precisión propia: porcentaje de tiempo de subtítulo atribuido al hablante correcto, con el habla segmentada por hablante.

| Conjunto de evaluación | Métrica | Resultado int8 | Comparación fp32 |
|---|---|---|---|
| AMI test (16 reuniones) | Tiempo de subtítulo atribuido al hablante correcto | 98,2 % | Igual que fp32 según el autor |
| VoxConverse test (43 grabaciones) | Tiempo de subtítulo atribuido al hablante correcto | 96,7 % | Igual que fp32 según el autor |

| Entorno de medida | Throughput | Memoria | Hilos |
|---|---|---|---|
| Chrome, AMD Ryzen 7 4800H | ~6,3× tiempo real | ~0,9 GB | 16 hilos WASM |

No se han publicado en la información disponible resultados de benchmarks estándar de diarización (por ejemplo, DER) ni comparaciones numéricas con otros modelos.

## Requisitos de hardware

- VRAM: no aplica en el caso de uso principal, que es CPU mediante WASM; el consumo medido es de ~0,9 GB de memoria en el navegador.
- GPU: no se documentan requisitos de GPU. El modelo está pensado para ejecutarse sin GPU; para despliegue en servidor con onnxruntime se puede usar CPU o GPU, pero no hay cifras publicadas.
- GPU de consumo: irrelevante para el escenario objetivo; el modelo cabe en cualquier equipo que pueda ejecutar un navegador con 1 GB de memoria disponible para WASM.
- Opciones de despliegue: onnxruntime-web (WASM) es el entorno validado por el autor; onnxruntime nativo (Python, C++, etc.) es compatible por formato, aunque no se han publicado medidas en ese entorno.
- Latencia y throughput: ~6,3× tiempo real en Chrome sobre un AMD Ryzen 7 4800H con 16 hilos WASM. No hay datos de latencia por fragmento ni de rendimiento en otros procesadores.

## Comparativa con modelos similares

| Modelo | Formato | Cuantización | Hablantes | Ejecución en navegador | Licencia |
|---|---|---|---|---|---|
| Nemotron 3 Diarization ONNX (esta ficha) | ONNX | int8 dinámica | Hasta 8 | Sí, onnxruntime-web WASM | OpenMDW-1.1 |
| Nemotron 3 Diarization (NVIDIA, original) | Pesos originales / export fp32 | fp32 | Hasta 8 | No documentado | OpenMDW-1.1 |
| Export fp32 de altunenes/parakeet-rs | ONNX | fp32 | Hasta 8 | No documentado | OpenMDW-1.1 (modelo base) |

No se dispone de información sobre otros modelos de diarización comparables en la documentación proporcionada; los datos de precisión y velocidad de las alternativas fp32 no se han publicado en esta ficha.

## Limitaciones y advertencias

- No es un lanzamiento oficial de NVIDIA: el autor lo indica explícitamente y remite a la model card original para sesgos, explicabilidad, seguridad y privacidad.
- La información sobre sesgos conocidos, riesgo de alucinación y limitaciones idiomáticas no está disponible en esta ficha; debe consultarse la documentación de NVIDIA.
- El límite de 8 hablantes es una restricción dura del modelo; escenarios con más participantes no están cubiertos.
- La cuantización se aplica solo a MatMul; no se han publicado evaluaciones de robustez de la versión int8 fuera de AMI y VoxConverse.
- La licencia OpenMDW-1.1 impone sus propios términos; deben revisarse antes de cualquier uso comercial, y esta ficha no interpreta dichos términos.
- El rendimiento medido corresponde a un único equipo y navegador (Chrome sobre Ryzen 7 4800H); en dispositivos móviles o navegadores sin soporte multihilo WASM el throughput puede ser muy inferior.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no hay evidencia comunitaria de uso más allá del proyecto del autor.
- Al ser un artefacto derivado, cualquier corrección o actualización del modelo base requeriría una nueva exportación y cuantización por parte del autor.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/jparedesDS/nemotron-3-diarization-onnx
- Modelo base de NVIDIA: https://huggingface.co/nvidia/Nemotron-3-Diarization
- Export fp32 de origen (altunenes/parakeet-rs): https://huggingface.co/altunenes/parakeet-rs
- Proyecto que lo utiliza (subany): https://subany.video
- Licencia OpenMDW 1.1: https://openmdw.ai/license/1-1/
