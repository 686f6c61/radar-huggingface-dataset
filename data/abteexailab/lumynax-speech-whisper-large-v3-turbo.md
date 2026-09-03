# AbteeXAILab/lumynax-speech-whisper-large-v3-turbo

## Resumen

LumynaX Speech Whisper Large v3 Turbo es un paquete de integración publicado por AbteeX AI Labs, un laboratorio con sede en Aotearoa (Nueva Zelanda), que envuelve el modelo de reconocimiento de voz automático `openai/whisper-large-v3-turbo` dentro de su marco propietario LumynaX. El repositorio se presenta como un artefacto de investigación legacy, marcado explícitamente como desactualizado y no recomendado para producción. Su propósito original era demostrar el concepto de "infusión enrutada", donde un modelo central (LumynaX Core) orquesta la inferencia a través de un modelo especializado sin modificar sus pesos.

El modelo subyacente es un Whisper Large v3 Turbo, un transformer encoder-decoder de 808,878,080 parámetros diseñado para transcripción de voz y traducción, con soporte declarado para inglés y maorí. El paquete conserva los pesos originales de OpenAI y añade una capa de identidad y orquestación histórica. Aunque el pipeline_tag en Hugging Face indica `text-generation`, la funcionalidad real es de reconocimiento de voz (ASR). La licencia es MIT, lo que permite uso comercial, pero el estado "legacy" y la falta de mantenimiento lo hacen inadecuado para entornos productivos actuales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (Whisper Large v3 Turbo) |
| Parametros totales | 808.878.080 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (Whisper procesa ventanas de audio de 30 segundos, pero no se especifica en la ficha) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en (inglés), mi (maorí) |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo base es Whisper Large v3 Turbo, desarrollado por OpenAI, que emplea una arquitectura transformer encoder-decoder con atención estándar. El encoder procesa espectrogramas de audio (log-Mel) y el decoder genera texto autoregresivamente. Whisper fue entrenado con 680.000 horas de datos de audio multilingües, aunque la versión Turbo es una optimización de velocidad sobre Large v3. En este repositorio concreto, no se proporcionan detalles adicionales sobre el entrenamiento, ya que los pesos son los originales de OpenAI sin modificación.

La innovación de este paquete reside en el concepto de "infusión" de LumynaX: un mecanismo de orquestación donde un modelo central (LumynaX Core) enruta la inferencia hacia el modelo Whisper sin alterar sus pesos. Según la model card, la integración es de tipo "routed infusion", lo que significa que no hay fusión de pesos ni composición MoE. El paquete incluye wrappers de runtime y manifiestos de verificación (checksums, release manifest), pero no aporta mejoras arquitectónicas sobre el Whisper original.

## Capacidades

- Transcripción de voz a texto en inglés y maorí, con precisión típica de Whisper Large v3 Turbo.
- Traducción de audio a texto en inglés (capacidad inherente de Whisper, aunque no se documenta explícitamente en esta ficha).
- Procesamiento de audio en ventanas de 30 segundos, con manejo de contextos largos mediante segmentación.
- Integración con el ecosistema Transformers de Hugging Face, permitiendo uso con pipelines estándar de ASR.
- Soporte de ejecución local (local-first) según los tags del repositorio.
- No se documentan capacidades de tool calling, agentes ni razonamiento multi-paso, ya que es un modelo de ASR puro.

## Casos de uso

- Transcripción de reuniones y entrevistas: el modelo puede convertir grabaciones de audio en texto con alta fidelidad, aprovechando la robustez de Whisper frente a ruido y acentos. Su ventana de 30 segundos permite procesar segmentos largos de forma secuencial.
- Generación de subtítulos para vídeo: al integrarse con pipelines de procesamiento de audio, puede producir subtítulos en inglés o maorí para contenido audiovisual, útil para accesibilidad y distribución.
- Asistente de voz para aplicaciones locales: gracias a su licencia MIT y su naturaleza local-first, puede desplegarse en dispositivos sin conexión a internet para comandos de voz o dictado, respetando la privacidad de los datos.
- Archivado y búsqueda de audio: transcribir bibliotecas de audio (podcasts, llamadas, archivos históricos) para hacerlas indexables y consultables mediante texto.
- Traducción de contenido oral al inglés: aunque no se documenta explícitamente, Whisper Large v3 Turbo soporta traducción de audio a inglés, lo que permitiría transcribir y traducir discursos en maorí u otros idiomas.
- Investigación en procesamiento de voz: como artefacto de referencia para estudiar la integración de modelos ASR en marcos de orquestación tipo LumynaX, útil para reproducir experimentos de "infusión enrutada".

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas de WER (Word Error Rate), latencia ni comparativas con otros modelos. Dado que los pesos son idénticos a `openai/whisper-large-v3-turbo`, se podrían consultar los benchmarks oficiales de OpenAI para ese modelo, pero no se proporcionan en esta ficha.

## Requisitos de hardware

- No se especifican requisitos de hardware en la información disponible.
- Como referencia general, un modelo de 808M parámetros en FP16 ocupa aproximadamente 1,6 GB de VRAM, lo que lo hace ejecutable en GPUs de consumo como RTX 3060 o superiores, así como en CPUs con suficiente RAM.
- El repositorio menciona soporte para Transformers y un Modelfile (sugiriendo compatibilidad con Ollama), pero no se detallan opciones de despliegue concretas.
- No se proporcionan datos de latencia ni throughput.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| LumynaX Speech Whisper Large v3 Turbo | 808M | no disponible | MIT | Hugging Face |
| openai/whisper-large-v3-turbo | 808M | 30 s de audio | MIT (código) / pesos con licencia OpenAI | Hugging Face |
| openai/whisper-large-v3 | 1.550M | 30 s de audio | MIT (código) / pesos con licencia OpenAI | Hugging Face |
| distil-whisper/distil-large-v3 | 756M | 30 s de audio | MIT | Hugging Face |

La comparativa se basa en el modelo subyacente, ya que este paquete no introduce cambios en los pesos. La principal diferencia con el Whisper original es la capa de orquestación LumynaX, que no afecta al rendimiento ASR. Frente a distil-whisper, el modelo Turbo es más grande pero más rápido que Large v3, mientras que distil-whisper ofrece menor latencia a costa de algo de precisión.

## Limitaciones y advertencias

- El repositorio se declara explícitamente como "legacy" y "outdated", y su autor desaconseja su uso en producción.
- No se proporcionan garantías de mantenimiento, seguridad ni actualizaciones.
- Los pesos son los de Whisper Large v3 Turbo, por lo que hereda sus sesgos conocidos: errores en nombres propios, dialectos poco representados y posibles alucinaciones en audio ambiguo.
- El soporte de idiomas se limita a inglés y maorí según la model card, aunque Whisper en sí soporta más idiomas; la ficha no aclara si la integración restringe el funcionamiento.
- La licencia MIT se aplica al paquete, pero los pesos subyacentes de Whisper Large v3 Turbo están sujetos a la licencia de OpenAI, que permite uso comercial pero con restricciones (por ejemplo, no usar para desarrollar modelos competidores de ASR). Es necesario revisar los términos originales.
- No hay documentación sobre el rendimiento en producción, latencia o escalabilidad.

## Enlaces

- [Hugging Face - AbteeXAILab/lumynax-speech-whisper-large-v3-turbo](https://huggingface.co/AbteeXAILab/lumynax-speech-whisper-large-v3-turbo)
- [Repositorio GitHub](https://github.com/Aimaghsoodi/lumynax-speech-whisper-large-v3-turbo)
- [AbteeX AI Labs](https://abteex.com)
- [LumynaX](https://lumynax.com)
- [Modelo original openai/whisper-large-v3-turbo](https://huggingface.co/openai/whisper-large-v3-turbo)
