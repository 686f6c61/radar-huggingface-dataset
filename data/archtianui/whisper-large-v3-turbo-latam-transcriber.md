# ArchTianui/whisper-large-v3-turbo-latam-transcriber

## Resumen

`ArchTianui/whisper-large-v3-turbo-latam-transcriber` es un conjunto de conversiones de formato del modelo `marianbasti/whisper-large-v3-turbo-latam`, un ajuste fino de `openai/whisper-large-v3-turbo` orientado a reconocimiento automatico del habla (ASR) en espanol latinoamericano (es-419). El autor original de los pesos es marianbasti; ArchTianui unicamente ha regenerado los artefactos en tres formatos de inferencia (CTranslate2, OpenVINO IR y whisper.cpp GGML) con cuantizacion int8/q8_0, sin reentrenar ni modificar los pesos.

El modelo resuelve un problema concreto: disponer de transcripcion offline de audio en espanol latinoamericano dentro de la aplicacion de escritorio *Transcriber International*, con artefactos verificables mediante SHA-256 y un catalogo firmado. La relevancia actual radica en que empaqueta un modelo ASR de la familia Whisper en formatos optimizados para CPU, GPU Intel (incluida NPU) y Vulkan, lo que permite despliegue local sin GPU dedicada.

La arquitectura subyacente es la de Whisper large-v3 turbo (transformer encoder-decoder con atencion, aproximadamente 809 millones de parametros en el modelo turbo original), especializada en transcripcion de audio. El estado del repositorio es explicitamente de prueba: la precision en el contexto real de la aplicacion no se ha evaluado todavia y los modelos que fallen la evaluacion seran retirados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (Whisper large-v3 turbo) |
| Parametros totales | no disponible (el modelo base Whisper large-v3 turbo tiene ~809 M, dato no confirmado en la informacion proporcionada) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (Whisper procesa ventanas de audio de 30 s; no confirmado en la model card) |
| Tipos de cuantizacion | int8 (CTranslate2 y OpenVINO), q8_0 (GGML) |
| Idiomas soportados | es (espanol latinoamericano, es-419) |
| Licencia | MIT |
| Formato de pesos | CTranslate2 (`ct2/model.bin`), OpenVINO IR (`.xml` + `.bin`), whisper.cpp GGML (`ggml-model-q8_0.bin`) |

## Arquitectura y entrenamiento

El modelo es un ajuste fino de `openai/whisper-large-v3-turbo`, que emplea la arquitectura encoder-decoder de Whisper con atencion estandar (no se documentan innovaciones como atencion lineal o decodificacion especulativa en la informacion disponible). Los pesos originales fueron entrenados por marianbasti sobre el conjunto Common Voice 17 en espanol, filtrando los acentos de Espana, segun la model card original citada.

Este repositorio no aporta entrenamiento adicional: solo realiza conversion de formato y cuantizacion. Los artefactos se generaron a partir del commit `e22f0ff16b5ec1bfb79b225e1fd3c108d1e15dde` del modelo base. No se dispone de informacion sobre numero de tokens de entrenamiento, composicion exacta del dataset mas alla de Common Voice 17, ni sobre uso de RLHF o DPO.

## Capacidades

- Reconocimiento automatico del habla (ASR) en espanol latinoamericano (es-419).
- Transcripcion offline de audio, disenada para ejecucion local en la aplicacion *Transcriber International*.
- Inferencia en CPU mediante CTranslate2 con pesos int8.
- Inferencia en GPU, NPU y CPU Intel mediante OpenVINO IR con pesos int8.
- Inferencia en GPU con Vulkan mediante whisper.cpp con cuantizacion q8_0.
- Verificacion de integridad de los archivos mediante SHA-256 contra un catalogo firmado.
- No se documentan capacidades de tool calling, agentes, vision, audio mas alla de ASR, ni modo de razonamiento.

## Casos de uso

- Transcripcion offline en escritorio: la aplicacion *Transcriber International* usa los artefactos CTranslate2 int8 para transcribir audio en equipos sin GPU dedicada, aprovechando la cuantizacion para reducir el uso de memoria.
- Despliegue en equipos Intel sin GPU discreta: los artefactos OpenVINO IR permiten ejecutar el modelo en CPU, iGPU o NPU Intel, lo que facilita su integracion en portatiles y mini-PC corporativos.
- Transcripcion acelerada por Vulkan: el artefacto GGML q8_0 esta pensado para ejecucion en GPU mediante whisper.cpp con backend Vulkan, util en estaciones de trabajo con graficas de consumo.
- Procesamiento por lotes de grabaciones en espanol latinoamericano: al ser un modelo ajustado con acentos latinoamericanos, es adecuado para transcribir entrevistas, reuniones o material divulgativo de esa region.
- Distribucion verificable de modelos: el catalogo firmado con SHA-256 por archivo permite a la aplicacion rechazar artefactos manipulados, un requisito util en entornos con requisitos de integridad de software.
- Evaluacion comparativa de formatos de inferencia: al ofrecer el mismo modelo en tres runtimes, sirve para medir latencia y consumo entre CTranslate2, OpenVINO y whisper.cpp sobre el mismo hardware.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explicitamente que la precision en el contexto de la aplicacion no se ha evaluado todavia.

## Requisitos de hardware

- VRAM/RAM estimada: el artefacto CTranslate2 int8 ocupa 820.316.291 bytes (~820 MB); el GGML q8_0 ocupa 874.188.075 bytes (~874 MB); el encoder OpenVINO int8 ocupa 640.837.232 bytes (~641 MB) y el decoder 172.422.054 bytes (~172 MB). La memoria en ejecucion sera superior a estos tamanos por los buffers de inferencia, aunque no se proporciona una cifra exacta.
- GPU recomendadas: no se especifican modelos concretos. La model card menciona GPU Intel (via OpenVINO) y GPU con Vulkan (via whisper.cpp).
- GPU de consumo: el tamano de los artefactos (~820-875 MB) sugiere que cabe en GPUs de consumo con suficiente memoria libre, aunque no se confirma en la informacion disponible.
- Opciones de despliegue: CTranslate2 (CPU), OpenVINO (GPU/NPU/CPU Intel), whisper.cpp con Vulkan (GPU).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formatos |
|---|---|---|---|---|---|
| ArchTianui/whisper-large-v3-turbo-latam-transcriber | no disponible | no disponible | es (es-419) | MIT | CTranslate2, OpenVINO, GGML |
| marianbasti/whisper-large-v3-turbo-latam | no disponible | no disponible | es (es-419) | MIT | pesos originales (no especificado) |
| openai/whisper-large-v3-turbo | ~809 M (dato no confirmado en la informacion) | no disponible | multilingue | MIT | safetensors, entre otros (no confirmado) |

No se dispone de datos de rendimiento comparativo entre estos modelos en la informacion proporcionada.

## Limitaciones y advertencias

- Estado de prueba: la precision en el contexto real de la aplicacion no se ha evaluado; el autor advierte que los modelos que fallen la evaluacion seran retirados.
- Cobertura limitada: solo espanol latinoamericano (es-419); no se garantiza buen rendimiento en otras variantes del espanol ni en otros idiomas.
- Sesgos: no documentados en la informacion disponible; al entrenarse con Common Voice 17 filtrando acentos de Espana, puede presentar sesgo hacia determinados acentos o registros latinoamericanos.
- Riesgo de alucinacion: inherente a los modelos ASR de la familia Whisper; no se cuantifica en la model card.
- Restricciones de licencia: licencia MIT, que permite uso comercial, pero se recomienda revisar la licencia del modelo base y de los datos de entrenamiento originales.
- Integridad: la aplicacion rechaza archivos que no coincidan con el SHA-256 del catalogo firmado; modificar los artefactos invalida su uso en ese contexto.
- Este repositorio no incluye los pesos en formato safetensors ni el modelo original sin cuantizar.

## Enlaces

- Hugging Face: https://huggingface.co/ArchTianui/whisper-large-v3-turbo-latam-transcriber
- Modelo base (ajuste fino): https://huggingface.co/marianbasti/whisper-large-v3-turbo-latam
- Modelo original de OpenAI: no disponible como enlace en la informacion proporcionada
- Paper de Whisper: no disponible como enlace en la informacion proporcionada
- Repositorio de CTranslate2: no disponible como enlace en la informacion proporcionada
- Repositorio de OpenVINO: no disponible como enlace en la informacion proporcionada
- Repositorio de whisper.cpp: no disponible como enlace en la informacion proporcionada
