# okdohyuk/RE-USE-MLX-CoreML

## Resumen

RE-USE MLX + CoreML es un espejo no oficial del modelo de mejora de voz (speech enhancement) y reducción de ruido de NVIDIA, `nvidia/NVIDIA-NemotronLabs-RE-USE`, convertido al formato de pesos de MLX y Core ML para su ejecución en hardware de Apple. El repositorio lo mantiene el usuario `okdohyuk` con el único fin de ofrecer una ubicación estable y fijada (pinned) desde la que la aplicación Nogmi pueda descargar los pesos del modelo. No está afiliado a NVIDIA ni a los autores de ReuseKit.

La tarea del modelo es audio-a-audio: recibe una señal de voz con ruido y devuelve la señal limpia. La conversión a MLX y Core ML, así como el formato de paquete del modelo, provienen del proyecto ReuseKit / RE-USE Lab, cuyo SDK está publicado bajo Apache 2.0. Los pesos originales de NVIDIA se distribuyen bajo la licencia OpenMDW 1.1.

La relevancia de este repositorio es fundamentalmente de despliegue: permite ejecutar un modelo de mejora de voz de NVIDIA en Macs y dispositivos Apple mediante MLX y Core ML, sin depender del stack de CUDA. El contenido es idéntico al de la revisión de origen `4b7e50680ba34f10865cab7e24054262596f5ab4` (38 ficheros, 54.206.689 bytes); lo único modificado es este README.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (modelo de mejora de voz; conversión a MLX y Core ML) |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no consta que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (el tag `base_model:quantized` indica que el modelo base está cuantizado, sin especificar el esquema) |
| Idiomas soportados | no disponible |
| Licencia | OpenMDW License Agreement v1.1 (OpenMDW-1.1) |
| Formato de pesos | MLX y Core ML (paquete de modelo de ReuseKit; 38 ficheros, 54.206.689 bytes) |

## Arquitectura y entrenamiento

No se dispone de información sobre la arquitectura interna del modelo original de NVIDIA en la documentación proporcionada. Se trata de un modelo de audio-a-audio orientado a mejora de voz y reducción de ruido, y el repositorio contiene su conversión a los formatos MLX y Core ML generada por ReuseKit / RE-USE Lab. El tag `base_model:quantized` sugiere que los pesos derivan de una versión cuantizada del modelo de NVIDIA, pero no se detalla el esquema de cuantización.

Tampoco se documentan los datos de entrenamiento (número de tokens o horas de audio, composición del dataset) ni si hubo etapas de ajuste fino con RLHF o DPO, algo poco habitual en modelos de mejora de señal. La innovación relevante de este repositorio no está en el entrenamiento, sino en el empaquetado: un catálogo (`ModelCatalog.json`) y un manifiesto (`manifest.json`) que fijan rutas, tamaños y hashes SHA-256 de cada fichero para garantizar descargas reproducibles.

## Capacidades

- Mejora de voz (speech enhancement): procesa audio de entrada y devuelve audio con la voz reforzada.
- Reducción de ruido: elimina ruido de fondo de la señal de voz.
- Pipeline audio-a-audio: la entrada y la salida son señales de audio, no texto.
- Ejecución en hardware de Apple mediante MLX y Core ML.
- Verificación de integridad: el manifiesto incluye tamaños y hashes SHA-256 de los 38 ficheros.
- No consta soporte de tool calling, function calling, agentes, razonamiento multi-paso ni capacidades multilingües de texto.
- No consta soporte de visión, audio generativo (TTS) ni modos de "thinking".

## Casos de uso

- Aplicaciones de videollamada en macOS: el modelo puede limpiar la señal del micrófono en tiempo real sobre el stack MLX/Core ML, sin depender de CUDA ni de servidores externos.
- Grabación de podcasts y voz en movilidad: permite reducir el ruido de fondo de grabaciones hechas en entornos no tratados antes de la edición, ejecutando el modelo localmente en un Mac.
- Preprocesado para ASR: limpiar el audio antes de pasarlo a un sistema de reconocimiento de voz reduce la tasa de error en entornos ruidosos; el modelo actúa como etapa previa en el pipeline.
- Transcripción de reuniones: en aplicaciones que graban y transcriben reuniones, la mejora de voz previa facilita la labor del motor ASR y mejora la legibilidad del texto resultante.
- Herramientas de accesibilidad: mejorar la inteligibilidad de audio para personas con dificultades auditivas o para subtitulado automático en directo.
- Distribución reproducible en apps de escritorio: al estar fijado a una revisión concreta con hashes verificables, sirve como origen estable de descarga para la app Nogmi y evita roturas por cambios en el repositorio de origen.
- Procesado por lotes de archivos de audio: limpiar carpetas de grabaciones (entrevistas, notas de voz) en local en un Mac, sin subir el audio a la nube.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. El repositorio no publica el número de parámetros ni el esquema de cuantización.
- GPU recomendadas: no disponible para el modelo original. La conversión está pensada para MLX y Core ML, es decir, para el hardware de Apple (chips de la serie M).
- Compatibilidad con GPU de consumo: no consta para GPU NVIDIA o AMD; el objetivo declarado es la ejecución en Apple Silicon mediante MLX y Core ML.
- Opciones de despliegue: MLX y Core ML a través del SDK ReuseKit (Apache 2.0); el archivo `ReuseKit.zip` no está incluido en este espejo y debe obtenerse del repositorio de origen.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye modelos comparables de mejora de voz ni datos de rendimiento que permitan una comparación rigurosa.

## Limitaciones y advertencias

- Es un espejo no oficial: no está afiliado a NVIDIA ni a los autores de ReuseKit, y no debe tratarse como la fuente canónica del modelo.
- Solo se ha modificado el README; cualquier incidencia en los pesos debe contrastarse con la revisión de origen `4b7e50680ba34f10865cab7e24054262596f5ab4`.
- El SDK ReuseKit no está incluido en este repositorio; sin él, el paquete de modelo puede no ser utilizable directamente.
- La licencia OpenMDW-1.1 impone sus propios términos al uso de los pesos; es necesario revisar el texto completo en `LICENSE` antes de un uso comercial.
- El código del SDK ReuseKit es Apache 2.0, pero los pesos y componentes de terceros conservan sus licencias propias.
- No se documentan sesgos, tasas de alucinación (no aplica a un modelo audio-a-audio), idiomas soportados ni límites de duración o calidad del audio de entrada.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, por lo que no hay evidencia de uso en producción.
- El tamaño del repositorio aparece como 0.0 GB pese a declararse 54.206.689 bytes de activos; conviene verificar la descarga contra los hashes del manifiesto.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/okdohyuk/RE-USE-MLX-CoreML
- Repositorio de origen del espejo: https://huggingface.co/AILogDev/RE-USE-MLX-CoreML
- Modelo base de NVIDIA: https://huggingface.co/nvidia/NVIDIA-NemotronLabs-RE-USE
