# SDIDSA/lyric-studio-models

## Resumen

Lyric Studio models es un repositorio de modelos de audio publicado por SDIDSA que agrupa los artefactos que la aplicación Android Lyric Studio descarga en el primer arranque para sincronizar la letra de una canción con su audio en el propio dispositivo. No se trata de un modelo de lenguaje, sino de un paquete de tres ficheros con dos funciones diferenciadas: separación de voces (extracción del estem vocal de una mezcla musical) y alineamiento forzado (asignación temporal de cada letra o fonema al audio vocal resultante).

El componente de separación es una adaptación de MDX-Net, concretamente el checkpoint `UVR_MDXNET_9482` del proyecto Ultimate Vocal Remover, distribuido vía el espejo `Politrees/UVR_resources`. Trabaja a 44,1 kHz en estéreo y procesa la señal en bloques de 6 segundos. Se ofrece en dos formatos: ONNX para ejecución en CPU con ONNX Runtime y TFLite (LiteRT) para aceleración por GPU en el dispositivo móvil, con tensores de entrada `[1, 4, 2048, 256]` y salida `[1, 2048, 256, 4]`.

El componente de alineamiento es un modelo derivado de `facebook/wav2vec2-base-960h` (Apache-2.0), cuantizado a 8 bits (`sync_int8.onnx`), que produce probabilidades por letra para cada tramo de 20 ms del audio vocal aislado. El interés práctico del repositorio es que documenta un pipeline completo de karaoke/letras sincronizadas que corre íntegramente en un teléfono, sin depender de servicios en la nube, con verificación de integridad por tamaño y SHA-256 de cada fichero antes de su uso.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MDX-Net para separación de voces; wav2vec2-base (transformer convolucional + atención) para alineamiento forzado |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica; ventana de audio de 6 segundos por bloque en el separador y tramas de 20 ms en el alineador |
| Tipos de cuantizacion | INT8 en `sync_int8.onnx`; los modelos vocales se distribuyen sin cuantizar (ONNX y TFLite float) |
| Idiomas soportados | no disponible (el alineador deriva de un modelo entrenado sobre inglés, `wav2vec2-base-960h`, pero la model card no declara idiomas) |
| Licencia | MIT para el repositorio; el modelo de sincronización deriva de `facebook/wav2vec2-base-960h` bajo Apache-2.0 |
| Formato de pesos | ONNX (`vocals_mdx9482.onnx`, `sync_int8.onnx`) y TFLite/LiteRT (`vocals_mdx9482.tflite`) |

## Arquitectura y entrenamiento

El separador de voces sigue la familia MDX-Net, una arquitectura de red convolucional para separación de fuentes musicales que opera sobre espectrogramas y reconstruye las pistas separadas. En este repositorio se usa el checkpoint `UVR_MDXNET_9482`, con muestreo a 44,1 kHz, dos canales y procesamiento por fragmentos de 6 segundos. La conversión a TFLite se realizó con `onnx2tf`, lo que explica la disposición de ejes del tensor de entrada `[1, 4, 2048, 256]` y de salida `[1, 2048, 256, 4]`, adaptada al delegado GPU de LiteRT.

El alineador parte de `facebook/wav2vec2-base-960h`, un modelo preentrenado auto-supervisado sobre audio y afinado para reconocimiento de voz en inglés. Sobre esa base, el autor ha construido un modelo que emite probabilidades por letra cada 20 ms y lo ha cuantizado a 8 bits para reducir el coste en CPU. No se documentan en la información disponible el número de tokens de entrenamiento, la composición del dataset de ajuste ni si hubo etapas de refinamiento adicionales; tampoco se detallan innovaciones como decodificación especulativa o atención lineal.

## Capacidades

- Separación de voces (vocal isolation) sobre mezclas musicales estéreo a 44,1 kHz, procesadas en bloques de 6 segundos.
- Ejecución en CPU mediante ONNX Runtime y en GPU móvil mediante el delegado GPU de LiteRT/TFLite.
- Alineamiento forzado de letra a audio: genera probabilidades por letra para tramos de 20 ms del estem vocal.
- Verificación de integridad de los artefactos descargados mediante tamaño y SHA-256 antes de su uso en la aplicación.
- Funcionamiento totalmente offline en el dispositivo una vez descargados los ficheros.
- No dispone de tool calling, capacidades de agente, generación de texto, visión ni audio de entrada/salida más allá del procesamiento descrito.

## Casos de uso

- Sincronización de letras en aplicaciones de karaoke móvil: el pipeline separa la voz de la mezcla y alinea cada letra con su instante de aparición, lo que permite resaltar la línea activa sin depender de letras ya sincronizadas externamente.
- Reproductores de música con letras animadas: el alineador produce marcas temporales cada 20 ms, suficientes para animaciones de línea o palabra con precisión de centésimas de segundo.
- Edición de vídeo y subtitulado automático de canciones: el estem vocal aislado y las marcas de alineamiento sirven para generar subtítulos sincronizados en proyectos de postproducción.
- Herramientas de práctica vocal y aprendizaje de idiomas: el usuario puede seguir la letra con retroalimentación temporal mientras canta, con el modelo corriendo en el propio teléfono.
- Aplicaciones de accesibilidad para personas con dificultades auditivas: la letra sincronizada sobre el audio permite seguir una canción en tiempo real sin conexión.
- Procesamiento de audio en entornos sin red o con privacidad estricta: al ejecutarse en el dispositivo, la canción no sale del teléfono, lo que encaja en escenarios con requisitos de confidencialidad.
- Extracción de vocales para remezclas o samples: el separador ONNX puede reutilizarse en escritorio con ONNX Runtime sobre CPU para obtener pistas vocales limpias.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- Repositorio de 0,2 GB, lo que sugiere artefactos ligeros aptos para almacenamiento móvil; el tamaño exacto por fichero no se detalla.
- Inferencia prevista en CPU mediante ONNX Runtime y en GPU móvil mediante LiteRT GPU delegate; no se especifican GPUs de escritorio recomendadas.
- Por su diseño para Android, cabe en hardware móvil de gama media; no se documenta compatibilidad con GPUs de consumo como RTX 4090 ni con aceleradores de centro de datos (A100, H100).
- Opciones de despliegue documentadas: ONNX Runtime y LiteRT; no se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Ventana de audio | Formatos | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Lyric Studio models (SDIDSA) | Separación vocal + alineamiento forzado | 6 s por bloque / tramas de 20 ms | ONNX, TFLite | MIT (repo) y Apache-2.0 (derivado) | Hugging Face |
| UVR_MDXNET_9482 (Ultimate Vocal Remover) | Separación vocal | No disponible | Pesos UVR | MIT según el espejo Politrees/UVR_resources | Repositorio UVR y espejo en HF |
| facebook/wav2vec2-base-960h | Reconocimiento de voz / base para alineamiento | No disponible | PyTorch, safetensors | Apache-2.0 | Hugging Face |

La comparativa se limita a los orígenes declarados en la model card, ya que no se aportan datos de rendimiento que permitan contrastar calidad de separación ni precisión de alineamiento frente a alternativas.

## Limitaciones y advertencias

- No se documentan sesgos conocidos; al derivar el alineador de un modelo entrenado en inglés, el comportamiento sobre otros idiomas no está garantizado.
- Riesgo de alucinación en el sentido de asignaciones temporales erróneas cuando la separación vocal es deficiente o la mezcla contiene coros, reverberación o instrumentos que enmascaran la voz.
- La ventana de 6 segundos del separador implica procesamiento por bloques; posibles artefactos en las fronteras entre bloques no documentados.
- La model card no declara idiomas soportados ni evaluación de calidad; no hay métricas publicadas de SDR, precisión de alineamiento ni latencia.
- La licencia del repositorio es MIT, pero los modelos vocales conservan la licencia de su fuente y el alineador deriva de un modelo Apache-2.0; conviene revisar ambas condiciones antes de uso comercial.
- El modelo no es un LLM: no admite tool calling, agentes ni generación de texto, por lo que no debe evaluarse con los criterios habituales de modelos de lenguaje.
- Repositorio sin descargas ni likes en el momento de la consulta y con fecha de creación futura (2026-11-19), lo que impide validar su mantenimiento o adopción.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/SDIDSA/lyric-studio-models
- Espejo de recursos UVR: https://huggingface.co/Politrees/UVR_resources
- Modelo base del alineador: https://huggingface.co/facebook/wav2vec2-base-960h
