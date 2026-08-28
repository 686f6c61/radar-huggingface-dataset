# aijadugar/wisprflow-clone-whisper

## Resumen

El modelo `aijadugar/wisprflow-clone-whisper` es un sistema de reconocimiento automático de voz (ASR) publicado en Hugging Face por el usuario aijadugar. Con 166.132.224 parámetros y un tamaño de repositorio de 0,3 GB, se presenta como un clon de Whisper, probablemente destinado a la primera etapa de un pipeline de dictado por voz similar al de la aplicación comercial Wispr Flow, que combina un reconocedor de voz con un modelo de lenguaje para limpiar y formatear la transcripción. La model card está prácticamente vacía, sin información sobre arquitectura, entrenamiento, licencia o idiomas, lo que limita su evaluación rigurosa. A pesar de ello, su tamaño y formato (safetensors, pipeline de ASR) lo hacen potencialmente útil para tareas de transcripción en entornos de bajos recursos, aunque se requiere verificación experimental.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (por el nombre y pipeline, probablemente transformer encoder-decoder tipo Whisper) |
| Parametros totales | 166.132.224 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

No se ha publicado información sobre la arquitectura concreta, el proceso de entrenamiento, los datos utilizados ni las técnicas de optimización. El nombre del modelo y su pipeline (`automatic-speech-recognition`) sugieren que sigue el diseño de Whisper, un transformer encoder-decoder entrenado sobre grandes cantidades de audio etiquetado, pero no hay confirmación oficial. Tampoco se especifica si se realizó fine-tuning, qué dataset se empleó o si se aplicaron técnicas como RLHF o DPO. La ausencia de estos datos impide valorar su calidad o comportamiento esperado.

## Capacidades

- Reconocimiento automático de voz (ASR): el pipeline declarado es `automatic-speech-recognition`, por lo que el modelo está diseñado para transcribir audio a texto.
- No se documentan capacidades adicionales como tool calling, agentes, razonamiento multilingüe o modos especiales.
- Dado su tamaño (166M parámetros), es probable que soporte múltiples idiomas si sigue la configuración de Whisper, pero no hay confirmación.

## Casos de uso

- Transcripción de reuniones y entrevistas: el modelo podría convertir grabaciones de audio en texto, aunque su calidad dependerá de la lengua y el ruido de fondo. Al ser un clon de Whisper, podría integrarse en herramientas de transcripción locales.
- Dictado por voz en aplicaciones de escritura: siguiendo el patrón de Wispr Flow, podría usarse como primera etapa de un sistema que luego limpia el texto con un LLM. Su tamaño reducido permite ejecutarlo en equipos sin GPU dedicada.
- Subtitulado automático de vídeos: con un postprocesado adecuado, podría generar subtítulos para contenido audiovisual, aunque se desconoce su precisión en distintos acentos o idiomas.
- Asistentes de voz para accesibilidad: personas con movilidad reducida podrían dictar texto mediante voz, aprovechando la baja latencia de un modelo pequeño.
- Investigación en ASR de código abierto: al ser un modelo publicado en abierto, puede servir como base para experimentos de fine-tuning o comparación con otros sistemas Whisper.
- Integración en pipelines de automatización: por su formato safetensors y compatibilidad con transformers, puede desplegarse en servicios de inferencia como Hugging Face Inference Endpoints o vLLM (si se adapta).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No existen datos de WER (Word Error Rate), MMLU, HumanEval ni otras métricas estándar para ASR. Se recomienda evaluar el modelo en un conjunto de datos propio antes de usarlo en producción.

## Requisitos de hardware

- VRAM estimada para inferencia: con 166M parámetros, en fp32 se necesitan aproximadamente 664 MB de memoria, y en fp16 unos 332 MB. Esto permite ejecutarlo en GPUs con 2 GB o más, como la NVIDIA GTX 1050 Ti o superiores.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM, incluyendo RTX 2060, RTX 3060, o incluso GPUs integradas con suficiente memoria compartida.
- En CPU: es viable para inferencia en tiempo real en procesadores modernos, aunque con mayor latencia.
- Opciones de despliegue: al ser un modelo de transformers, puede usarse con la librería `transformers`, `faster-whisper` (si es compatible), `whisper.cpp` (si se convierte a GGUF) o mediante servidores de inferencia como TGI o vLLM.
- Latencia y throughput: no disponibles. Dado su tamaño, se espera una latencia baja en GPU, pero no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| aijadugar/wisprflow-clone-whisper | 166M | no disponible | no disponible | Hugging Face |
| OpenAI Whisper small | 244M | 30 segundos de audio | MIT | Hugging Face, código abierto |
| OpenAI Whisper base | 74M | 30 segundos de audio | MIT | Hugging Face, código abierto |

No se dispone de datos de rendimiento para comparar. Whisper small y base tienen documentación extensa y benchmarks públicos, mientras que este modelo carece de ellos. La licencia del clon es desconocida, lo que puede limitar su uso comercial.

## Limitaciones y advertencias

- La model card está vacía: no hay información sobre arquitectura, entrenamiento, datos, licencia ni limitaciones. Esto impide una evaluación responsable.
- Riesgo de alucinación y errores de transcripción: al ser un modelo ASR no verificado, puede producir transcripciones incorrectas, especialmente con acentos, ruido o idiomas no representados en su entrenamiento.
- Sesgos potenciales: sin datos de entrenamiento, no se pueden identificar sesgos de género, dialecto o dominio.
- Licencia desconocida: no se especifica si permite uso comercial, modificación o redistribución. Se debe contactar al autor antes de usarlo en proyectos comerciales.
- Sin garantías de soporte: al ser un proyecto personal sin documentación, no hay mantenimiento ni actualizaciones aseguradas.
- Compatibilidad limitada: aunque usa safetensors y transformers, no se confirma que funcione con todas las versiones de la librería ni con herramientas como faster-whisper.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/aijadugar/wisprflow-clone-whisper)
- [Repositorio GitHub de whisprflow (clon local)](https://github.com/zghanw/whisprflow)
- [Proyecto wisprflowpy en GitHub](https://github.com/AverWasTaken/wisprflowpy)
- [Sitio oficial de Wispr Flow](https://wisprflow.ai/)
- [Vídeo sobre cómo construir una alternativa gratuita a Wispr Flow](https://www.youtube.com/watch?v=rPP-G5RneWs)
