# Benaeo/parakeet-unified-en-0.6b-ggml

## Resumen

Parakeet Unified English 0.6B (GGML, 8-bit) es una conversión al formato GGML del modelo de reconocimiento automático del habla `nvidia/parakeet-unified-en-0.6b` de NVIDIA, publicada por el usuario Benaeo. El repositorio no contiene pesos nuevos ni un ajuste fino: los pesos son los originales de NVIDIA, únicamente transformados de formato (conversión a GGML, plegado del escalado de entrada del codificador en los pesos y cuantización a 8 bits). Su propósito es permitir la inferencia del modelo Parakeet en `whisper.cpp` mediante un parche mantenido en el repositorio VoiceType del mismo autor.

El modelo resuelve la transcripción de voz a texto en inglés con un tamaño compacto (0,6 mil millones de parámetros, archivo de 630 MiB en Q8_0), lo que lo hace adecuado para ejecución local en hardware modesto. Es relevante para desarrolladores que quieran integrar ASR en aplicaciones de escritorio o utilidades de dictado sin depender de servicios en la nube, aprovechando el ecosistema de `whisper.cpp`.

La información disponible es limitada: la model card es muy escueta y no documenta arquitectura interna, datos de entrenamiento, benchmarks ni detalles de cuantización más allá de Q8_0. Esta ficha refleja exclusivamente lo que consta en la información proporcionada y marca como "no disponible" todo aquello que no se especifica.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base de NVIDIA Parakeet; detalles no documentados en la informacion disponible) |
| Parametros totales | 0,6 mil millones (según el nombre del modelo base) |
| Parametros activos | no aplica (no consta que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q8_0 (8 bits); único archivo publicado |
| Idiomas soportados | inglés (en) |
| Licencia | NVIDIA Open Model License (license: other) |
| Formato de pesos | GGML (archivo `ggml-parakeet-unified-en-0.6b-q8_0.bin`, 630 MiB) |

## Arquitectura y entrenamiento

No se dispone de información sobre la arquitectura interna del modelo base `nvidia/parakeet-unified-en-0.6b` en los datos proporcionados. La model card de esta conversión no describe la topología (transformer, conformer u otra), ni el número de tokens de entrenamiento, ni la composición del dataset, ni si hubo etapas de ajuste supervisado o preferencias. Tampoco se documentan innovaciones técnicas del modelo original.

Lo único documentado es el proceso de conversión realizado por el autor: los pesos originales se transformaron al formato GGML, se plegó el escalado de entrada del codificador dentro de los pesos y se cuantizaron a 8 bits. No se modificaron los valores de los pesos más allá de estos cambios de formato y precisión. Para ejecutar el archivo se requiere `whisper.cpp` con el parche incluido en el repositorio VoiceType, bajo el directorio `patches/`, que además documenta los comandos de conversión empleados.

## Capacidades

- Reconocimiento automático del habla (ASR) en inglés, con salida de transcripción de audio a texto.
- Ejecución local mediante `whisper.cpp` con el parche específico del repositorio VoiceType.
- Modelo compacto (630 MiB en Q8_0) apto para entornos con recursos limitados.
- Integración en aplicaciones de dictado por voz, como la utilidad VoiceType del mismo autor.
- No consta soporte de tool calling, function calling, agentes, razonamiento multi-paso, visión, audio de entrada más allá del ASR ni modo de pensamiento.
- Capacidad multilingüe limitada al inglés según los metadatos del repositorio.

## Casos de uso

- Dictado por voz en escritorio: el modelo puede transcribir audio del micrófono en tiempo real o por lotes dentro de una aplicación local, gracias a su tamaño reducido y a la integración con `whisper.cpp` que facilita el parche de VoiceType.
- Subtitulado automático de vídeos en inglés: se puede procesar la pista de audio de un archivo y generar subtítulos con un pipeline local, sin enviar datos a servicios externos.
- Transcripción de reuniones y notas de voz: adecuado para convertir grabaciones de conversaciones en inglés en texto editable, con la ventaja de que los datos permanecen en la máquina del usuario.
- Asistentes de voz offline: el modelo puede servir como componente ASR en asistentes que funcionen sin conexión, reduciendo la latencia y evitando costes de API.
- Accesibilidad: transcripción de audio a texto para personas con dificultades auditivas en entornos donde no se quiere depender de la nube.
- Procesamiento por lotes de archivos de audio: al ser un archivo único de 630 MiB y ejecutarse con `whisper.cpp`, es viable procesar colas de grabaciones en servidores modestos o estaciones de trabajo sin GPU dedicada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita; el archivo Q8_0 ocupa 630 MiB, por lo que la huella de memoria es reducida en comparación con modelos ASR de mayor tamaño.
- GPU recomendadas: no especificadas en la información proporcionada. Al ejecutarse con `whisper.cpp`, es plausible su uso tanto en CPU como en GPU, pero no se documentan modelos concretos.
- Compatibilidad con GPU de consumo: no confirmada en la documentación; el tamaño del archivo sugiere que podría caber en GPUs de consumo, pero no se aportan datos verificables.
- Opciones de despliegue: `whisper.cpp` con el parche del repositorio VoiceType (`patches/`). No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye datos de rendimiento ni comparaciones con otros modelos ASR, por lo que no es posible establecer una comparativa rigurosa con alternativas de la misma categoría.

## Limitaciones y advertencias

- Solo soporta inglés; no se documenta cobertura multilingüe.
- No se han publicado benchmarks ni métricas de precisión (WER u otras), por lo que el rendimiento real es desconocido a partir de la información disponible.
- Requiere `whisper.cpp` con un parche específico del repositorio VoiceType; no es un archivo utilizable directamente con las herramientas estándar sin esa modificación.
- La licencia es la NVIDIA Open Model License, no una licencia de código abierto permisiva; es necesario revisar sus términos antes de un uso comercial.
- La model card advierte que los números de sección de la licencia se perdieron al copiarla y que la página original de NVIDIA es la fuente autoritativa.
- Riesgo de alucinación y sesgos: no documentados en la información proporcionada; al tratarse de un modelo ASR, son posibles errores de transcripción en audio con ruido, acentos no representados en el entrenamiento o vocabulario técnico.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, lo que indica que no ha sido validado por la comunidad.
- No se documentan limitaciones de longitud de audio ni de contexto.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Benaeo/parakeet-unified-en-0.6b-ggml
- Modelo base: https://huggingface.co/nvidia/parakeet-unified-en-0.6b
- Repositorio VoiceType (parche y comandos de conversión): https://github.com/Benaeo/voicetype
- Licencia NVIDIA Open Model License: https://www.nvidia.com/en-us/agreements/enterprise-software/nvidia-open-model-license/
