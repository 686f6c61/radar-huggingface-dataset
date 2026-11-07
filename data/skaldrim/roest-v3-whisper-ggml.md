# skaldrim/roest-v3-whisper-ggml

## Resumen

roest-v3-whisper-ggml es una conversión al formato ggml de whisper.cpp del modelo CoRal-project/roest-v3-whisper-1.5b, un sistema de reconocimiento automático del habla (ASR) especializado en danés. El autor de la conversión es el usuario skaldrim, que lo publica para uso en dispositivo (on-device) dentro de la aplicación Skaldrim, orientada a la generación de subtítulos en el propio teléfono o PC del usuario. El modelo original fue desarrollado por el proyecto CoRal (Alexandra Institute, Alvenir y colaboradores) y entrenado sobre el corpus CoRal-v3 de habla danesa leída y conversacional.

La relevancia de esta ficha radica en que ofrece una vía práctica para desplegar un ASR danés de calidad en hardware sin GPU dedicada, gracias a la cuantización q5_0 que reduce el peso a aproximadamente 1 GB. No se trata de un modelo nuevo ni de un fine-tuning: el autor indica explícitamente que solo ha cambiado el formato de los pesos, sin reentrenamiento ni modificaciones adicionales.

La información disponible sobre arquitectura interna, datos de entrenamiento y benchmarks es muy limitada en la model card proporcionada; esta ficha refleja únicamente lo que el autor documenta y marca como "no disponible" todo aquello que no consta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Whisper (transformer encoder-decoder para ASR), según el modelo base CoRal-project/roest-v3-whisper-1.5b; detalles internos no disponibles |
| Parametros totales | 1.5B (según el nombre del modelo base); recuento exacto no disponible |
| Parametros activos | no disponible (no es MoE según la información disponible) |
| Longitud de contexto | no disponible (ventana de audio de Whisper; no especificada en la model card) |
| Tipos de cuantizacion | 16-bit (F16) y q5_0 (cuantización de 5 bits) |
| Idiomas soportados | danés (da); se debe ejecutar con el token de idioma `da` |
| Licencia | openrail (OpenRAIL-M, licencia Alvenir/CoRal) |
| Formato de pesos | ggml (whisper.cpp): `ggml-da-roest-v3-whisper-large.bin` (F16) y `ggml-da-roest-v3-whisper-large-q5_0.bin` |

## Arquitectura y entrenamiento

El modelo subyacente es CoRal-project/roest-v3-whisper-1.5b, un sistema ASR basado en la familia Whisper de OpenAI, con aproximadamente 1.5B parámetros según la denominación del modelo base. El proyecto CoRal lo entrenó sobre el dataset CoRal-v3, compuesto por habla danesa leída y conversacional. No se dispone en la información proporcionada de detalles sobre número de tokens de audio, composición exacta del dataset, técnicas de aumento de datos ni si se aplicaron etapas de ajuste fino adicionales sobre un checkpoint Whisper preentrenado.

La contribución de esta publicación concreta es exclusivamente de formato: los pesos se convirtieron con el script `models/convert-h5-to-ggml.py` de whisper.cpp en precisión de 16 bits y, para dispositivos móviles, se cuantizaron a q5_0 mediante `whisper-quantize`. El autor declara explícitamente que no hubo entrenamiento ni otros cambios, y que cualquier error en la conversión es responsabilidad suya. No se documentan innovaciones técnicas adicionales como decodificación especulativa o atención lineal.

## Capacidades

- Reconocimiento automático del habla (transcripción de audio a texto) en danés.
- Generación de subtítulos en tiempo de ejecución sobre el propio dispositivo del usuario (teléfono o PC), sin depender de servicios en la nube.
- Ejecución mediante whisper.cpp, lo que permite inferencia en CPU y en hardware de gama consumer.
- Dos variantes de precisión: F16 para máxima fidelidad y q5_0 para menor huella de memoria en móviles.
- Requiere el token de idioma `da`; no se documenta soporte multilingüe adicional ni traducción.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso, visión ni audio más allá de la transcripción ASR.

## Casos de uso

- Subtitulado local en aplicaciones móviles: la variante q5_0 (aproximadamente 1 GB) permite generar subtítulos de audio danés en el propio teléfono, evitando enviar grabaciones a servidores externos y reduciendo el consumo de datos y los riesgos de privacidad.
- Transcripción de reuniones y entrevistas en danés: la variante F16, ejecutada en un PC con whisper.cpp, transcribe grabaciones de habla conversacional, un dominio cubierto explícitamente por el corpus CoRal-v3.
- Accesibilidad para personas con discapacidad auditiva: integración en reproductores o visores de vídeo que necesiten subtítulos en danés generados en tiempo real o en diferido.
- Herramientas de dictado y notas de voz: conversión de audio a texto en aplicaciones de productividad personales, con procesamiento íntegramente local.
- Archivado y búsqueda de contenido audiovisual danés: transcripción por lotes de archivos de audio para indexar y permitir búsquedas textuales sobre el contenido hablado.
- Investigación en ASR de bajos recursos: servir como referencia desplegable y reproducible del modelo Røst-v3 en formato ggml para experimentos de evaluación o comparación con otros sistemas ASR.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas de WER, comparativas con otros sistemas ni datos de latencia o throughput.

## Requisitos de hardware

- VRAM/RAM estimada para inferencia: la variante q5_0 ocupa 1.081.140.203 bytes (aproximadamente 1,0 GB) en disco; la variante F16 ocupa 3.095.033.483 bytes (aproximadamente 2,9 GB). El consumo en ejecución dependerá de la implementación de whisper.cpp y del tamaño de los segmentos de audio.
- GPU recomendadas: no especificadas en la información disponible. whisper.cpp puede ejecutarse en CPU y, opcionalmente, con aceleración por GPU compatible.
- Viabilidad en GPU consumer: la variante q5_0 está pensada explícitamente para teléfonos, por lo que cabe en hardware de gama consumer; no se documentan modelos concretos de GPU ni de móvil.
- Opciones de despliegue: whisper.cpp (formato ggml nativo). No se documenta compatibilidad con vLLM, TGI, Ollama ni llama.cpp, que no son el entorno previsto para este formato.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Idiomas | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| skaldrim/roest-v3-whisper-ggml (esta ficha) | 1.5B (según modelo base) | danés | ggml (F16, q5_0) | openrail | Conversión de Røst-v3 para whisper.cpp; sin benchmarks publicados |
| CoRal-project/roest-v3-whisper-1.5b | 1.5B | danés | no disponible | openrail | Modelo original del proyecto CoRal; mismos pesos sin convertir |
| openai/whisper-large-v3 | no disponible en la información proporcionada | multilingüe | no disponible | no disponible | Referencia ASR multilingüe de OpenAI; no comparable en métricas con los datos disponibles |

No se dispone de datos de rendimiento que permitan una comparación cuantitativa entre estos modelos.

## Limitaciones y advertencias

- El modelo está especializado exclusivamente en danés; no se documenta soporte para otros idiomas y debe invocarse con el token `da`.
- No se han publicado métricas de calidad (WER u otras), por lo que el rendimiento real en producción es desconocido.
- Al ser un sistema ASR, puede producir transcripciones erróneas en audio con ruido, acentos no representados en CoRal-v3 o solapamiento de hablantes; no se documentan sesgos específicos.
- La licencia openrail (OpenRAIL-M, Alvenir/CoRal) incluye restricciones de uso recogidas en el Anexo A y sus adiciones; es imprescindible revisar el archivo `LICENSE` antes de cualquier uso comercial o redistribución.
- La conversión la realizó un tercero (skaldrim) sin reentrenamiento; el autor advierte que posibles errores de conversión son suyos y no del proyecto CoRal.
- El formato ggml limita el despliegue a whisper.cpp y herramientas compatibles; no es directamente utilizable en stacks de inferencia estándar de Hugging Face.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, por lo que no hay evidencia comunitaria de validación.

## Enlaces

- Hugging Face (esta conversión): https://huggingface.co/skaldrim/roest-v3-whisper-ggml
- Modelo base: https://huggingface.co/CoRal-project/roest-v3-whisper-1.5b
- Referencia ASR de OpenAI: https://huggingface.co/openai/whisper-large-v3
