# sayzly/moonshine-base-gguf

## Resumen

Moonshine Base GGUF es una conversión al formato GGUF del modelo Moonshine Base, desarrollado originalmente por Moonshine AI. Se trata de un modelo especializado en reconocimiento automático del habla (ASR, speech-to-text) con 61,5 millones de parámetros, pensado para transcripción de audio en entornos con recursos limitados. Esta versión concreta, publicada por el usuario sayzly, empaqueta los pesos en un único fichero `moonshine-base-Q8_0.gguf` con cuantización de 8 bits, lo que facilita su despliegue en runtimes compatibles con GGUF.

El interés de esta ficha radica en que Moonshine es una familia de modelos ASR diseñada como alternativa eficiente a Whisper en tareas de transcripción, con un tamaño reducido que permite ejecución en CPU y dispositivos de borde. La conversión a GGUF amplía las opciones de despliegue más allá de los frameworks habituales de PyTorch, aunque la model card del repositorio es extremadamente escueta y no aporta detalles sobre el proceso de conversión, los idiomas soportados ni las métricas de calidad.

La información disponible sobre este repositorio concreto es mínima: no hay descargas ni interacciones registradas, no se documentan idiomas y no se publican resultados de benchmarks. Por tanto, buena parte de las especificaciones se marcan como no disponibles, y las capacidades y el rendimiento deben inferirse del modelo base original, no de esta conversión.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base orientado a ASR; detalles no documentados en esta ficha) |
| Parametros totales | 61.513.920 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q8_0 (8 bits), según el nombre del fichero publicado |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

No se dispone de información detallada sobre la arquitectura interna en la documentación proporcionada. El modelo base es `moonshine-ai/moonshine-base`, un modelo de la familia Moonshine orientada a reconocimiento automático del habla, con 61,5 millones de parámetros. La model card de esta conversión no describe la arquitectura (transformer encoder-decoder u otra), ni los datos de entrenamiento, ni si hubo fases de ajuste fino con RLHF o DPO.

Respecto al proceso de conversión a GGUF, la model card únicamente indica que el fichero `moonshine-base-Q8_0.gguf` es el que el proyecto Sayzly descarga para Moonshine Base, sin especificar la herramienta de conversión, la versión del formato GGUF ni el proceso de cuantización empleado. Tampoco se documentan innovaciones técnicas adicionales.

## Capacidades

- Reconocimiento automático del habla (speech-to-text): tarea principal del pipeline declarado (`automatic-speech-recognition`).
- Transcripción de audio a texto en formato GGUF, ejecutable en runtimes compatibles con este formato.
- Capacidades multilingües: no disponibles (no se documentan idiomas).
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades especiales (modo thinking, visión, audio de entrada adicional): no disponibles.
- Generación de texto libre, código o matemáticas: no disponible; el modelo está orientado a ASR.

## Casos de uso

- Transcripción de reuniones y notas de voz en local: al ser un modelo de 61,5 M de parámetros en cuantización Q8_0, puede ejecutarse en CPU y en dispositivos con poca memoria, lo que permite transcribir audio sin depender de servicios en la nube.
- Subtitulado automático de vídeos y podcasts: el pipeline ASR permite generar transcripciones que después se alinean con marcas de tiempo para producir subtítulos.
- Dictado por voz en aplicaciones de escritorio: integrable mediante runtimes GGUF en aplicaciones nativas que necesiten conversión de voz a texto sin conexión.
- Procesamiento por lotes de archivos de audio en pipelines de datos: al ser un fichero único de pesos de pequeño tamaño (repo de 0,1 GB), es sencillo de distribuir y ejecutar en contenedores.
- Prototipado de asistentes de voz en dispositivos de borde: el reducido número de parámetros facilita pruebas en hardware embebido o Raspberry Pi, siempre que el runtime GGUF lo soporte.
- Investigación y evaluación de modelos ASR ligeros: útil como referencia para comparar calidad y latencia frente a alternativas de mayor tamaño en tareas de transcripción.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el fichero Q8_0 de un modelo de 61,5 M de parámetros ocupa aproximadamente 0,06 GB en pesos; el consumo real de memoria depende del runtime y del búfer de audio, pero es muy reducido.
- GPU recomendadas: no se documentan; por tamaño, cualquier GPU con al menos 1 GB de memoria podría alojarlo, aunque el modelo está pensado para ejecución en CPU.
- Cabe en GPU de consumo: sí, previsiblemente en cualquier GPU consumer moderna (RTX 3060, RTX 4090, etc.), así como en CPU.
- Opciones de despliegue: runtimes compatibles con GGUF (por ejemplo, llama.cpp u otros que soporten el formato); no se documenta compatibilidad con vLLM, TGI u Ollama.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Moonshine Base GGUF (sayzly) | 61,5 M | no disponible | GGUF (Q8_0) | MIT | Hugging Face |
| Moonshine Base (moonshine-ai) | 61,5 M | no disponible | no disponible | MIT | Hugging Face |
| Whisper small | no disponible en la información | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de rendimiento comparativos en la información proporcionada; la comparativa se limita a parámetros, formato y licencia.

## Limitaciones y advertencias

- La model card es mínima: no documenta idiomas, arquitectura, datos de entrenamiento ni métricas, lo que dificulta evaluar su idoneidad en producción.
- Riesgo de alucinación y errores de transcripción: inherente a los modelos ASR, especialmente en audio con ruido, acentos o vocabulario técnico; no se han publicado tasas de error (WER).
- Cobertura idiomática desconocida: no se especifican los idiomas soportados, por lo que no puede garantizarse su uso en castellano u otros idiomas.
- Restricciones de licencia: la licencia MIT permite uso comercial, pero conviene verificar las condiciones del modelo base original y de los datos de entrenamiento.
- Repositorio sin adopción: 0 descargas y 0 likes en el momento de la consulta, sin evidencia de validación por la comunidad.
- Compatibilidad de runtime no verificada: no se documenta qué versiones de llama.cpp u otros motores GGUF soportan este fichero.
- Fecha de creación registrada como 2026-11-19, posterior a la fecha habitual de publicación de modelos; conviene verificar la integridad del repositorio antes de usarlo.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/sayzly/moonshine-base-gguf
- Modelo base original: https://huggingface.co/moonshine-ai/moonshine-base
