# fluxcost/whisper-small-gguf

## Resumen

`fluxcost/whisper-small-gguf` es una conversión al formato GGUF del modelo de reconocimiento automático del habla (ASR) `openai/whisper-small`, publicada por el usuario fluxcost. No se trata de un modelo entrenado desde cero ni de una variante afinada: la model card indica explícitamente que es una copia sin modificar de `handy-computer/whisper-small-gguf` en la revisión `c0214bd34be9296695486f838e0142f900803159`, que a su vez es una conversión GGUF del checkpoint original de OpenAI. El repositorio contiene un único archivo, `whisper-small-Q8_0.gguf`, de 269.751.136 bytes (aproximadamente 0,3 GB), con cuantización Q8_0.

El interés práctico del artefacto es la distribución: empaqueta Whisper Small en un contenedor GGUF de 8 bits que puede ejecutarse con `whisper.cpp` y con runtimes compatibles, sin necesidad de cargar pesos en safetensors ni de depender de PyTorch en el dispositivo. Está pensado para la aplicación de dictado Fluxvoice, según declara el autor, lo que sitúa su caso de uso principal en transcripción local en escritorio y dispositivos con recursos limitados.

Whisper Small es un transformer encoder-decoder de 241.751.392 parámetros (dato confirmado en safetensors del modelo base) entrenado por OpenAI para transcripción multilingüe y traducción al inglés. La licencia Apache 2.0 del modelo original se mantiene, lo que permite uso comercial sin restricciones adicionales más allá de las obligaciones de atribución de la propia licencia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (Whisper, ASR secuencia a secuencia) |
| Parametros totales | 241.751.392 |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (Whisper opera sobre ventanas de audio de 30 s; el dato de contexto textual no se detalla) |
| Tipos de cuantizacion | Q8_0 (unico archivo publicado) |
| Idiomas soportados | no disponible en la informacion proporcionada (el modelo base Whisper Small es multilingue) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (`whisper-small-Q8_0.gguf`, 269.751.136 bytes) |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Whisper Small de OpenAI: un transformer encoder-decoder con atención completa, diseñado para recibir espectrogramas mel logarítmicos de audio y generar tokens de texto de forma autorregresiva. El encoder procesa ventanas de audio de 30 segundos y el decoder produce la transcripción, con tokens especiales para detección de idioma, marcas de tiempo y traducción al inglés. El modelo base tiene 241.751.392 parámetros.

Esta publicación no aporta información sobre el entrenamiento: no se detallan el número de tokens, la composición del dataset, ni si hubo etapas de ajuste con RLHF o DPO. Tampoco se documenta el proceso de conversión a GGUF más allá de la referencia al repositorio de origen `handy-computer/whisper-small-gguf`. La única transformación aplicada respecto al checkpoint original es la cuantización a 8 bits en formato GGUF, que reduce el peso del archivo a unos 0,3 GB. No se describen innovaciones técnicas adicionales (decodificación especulativa, atención lineal ni variantes híbridas) en la información disponible.

## Capacidades

- Reconocimiento automático del habla (ASR): transcripción de audio a texto, tarea principal del pipeline declarado (`automatic-speech-recognition`).
- Procesamiento por ventanas de audio de 30 segundos, con generación de marcas de tiempo a nivel de segmento según el comportamiento estándar de Whisper.
- Capacidad multilingüe heredada del modelo base Whisper Small; la lista concreta de idiomas no se detalla en la información proporcionada.
- Traducción de audio a inglés, funcionalidad nativa de la familia Whisper (no verificada de forma específica en esta conversión).
- Detección de idioma mediante tokens especiales del decoder.
- Ejecución en CPU y en dispositivos de bajos recursos gracias al formato GGUF y a la cuantización Q8_0.
- No se documenta soporte de tool calling, function calling, razonamiento multi-paso ni modo thinking; estas capacidades no aplican a un modelo ASR.

## Casos de uso

- Dictado por voz en aplicaciones de escritorio: es el escenario declarado por el autor (app Fluxvoice). El archivo Q8_0 de 0,3 GB se carga en memoria con `whisper.cpp` y permite transcripción local sin enviar audio a servicios externos, lo que reduce latencia y preserva la privacidad.
- Subtitulado automático de vídeo y pódcasts: el modelo genera marcas de tiempo por segmento, de modo que puede alimentar pipelines de generación de archivos SRT o VTT para contenido de hasta 30 segundos por ventana, encadenando ventanas para grabaciones más largas.
- Transcripción de reuniones y notas de voz: con un runtime GGUF en CPU, se puede integrar en herramientas internas de actas que procesan audio de forma por lotes sin GPU dedicada.
- Preprocesado de datos para entrenamiento de modelos de lenguaje: transcripción masiva de corpus de audio a texto en entornos con recursos limitados, donde el coste de una GPU para inferencia no está justificado.
- Asistentes de accesibilidad: conversión de voz a texto en tiempo casi real en equipos de sobremesa o portátiles sin GPU, aprovechando la cuantización de 8 bits para mantener el consumo de memoria por debajo de 1 GB.
- Prototipado y evaluación de pipelines ASR: al ser una conversión directa del checkpoint oficial, sirve como referencia reproducible para comparar latencia y calidad frente a otras cuantizaciones o runtimes antes de decidir un despliegue en producción.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM/RAM estimada para inferencia: el archivo Q8_0 ocupa 269.751.136 bytes (unos 257 MiB); con overhead de runtime, el consumo típico se sitúa en torno a 0,5-1 GB de memoria, aunque no se proporcionan mediciones oficiales.
- GPU recomendadas: no se especifican en la información proporcionada. Por tamaño, cualquier GPU con al menos 2 GB de memoria libre puede alojar el modelo; una RTX 4090, A100 o H100 lo ejecutarían con holgura, pero el modelo está claramente orientado a CPU.
- Cabe en GPU de consumo: sí, en cualquier GPU de consumo moderna con 2 GB o más de VRAM; también en CPU sin aceleración.
- Opciones de despliegue: `whisper.cpp` es el runtime natural para GGUF de Whisper; también puede cargarse con bindings compatibles de la comunidad. No se documenta soporte de vLLM, TGI ni Ollama en la información disponible.
- Latencia y throughput: no disponibles. No se han publicado mediciones para esta conversión concreta.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| fluxcost/whisper-small-gguf | 241.751.392 | no disponible | GGUF Q8_0 | Apache 2.0 | HuggingFace (0 descargas, 0 likes en el momento de la consulta) |
| openai/whisper-small | 241.751.392 | no disponible | safetensors / PyTorch | Apache 2.0 | HuggingFace (modelo base oficial) |
| handy-computer/whisper-small-gguf | 241.751.392 | no disponible | GGUF | Apache 2.0 | HuggingFace (origen de esta conversión) |
| openai/whisper-base | 74.000.000 (aprox., no confirmado en la información disponible) | no disponible | safetensors / PyTorch | Apache 2.0 | HuggingFace |

La comparación relevante es frente a `openai/whisper-small` (mismos pesos, distinto formato) y frente al repositorio de origen `handy-computer/whisper-small-gguf`, del que esta publicación es una copia byte a byte en el archivo GGUF. No se dispone de datos de rendimiento comparativo entre estas variantes en la información proporcionada.

## Limitaciones y advertencias

- Es una copia sin modificar de otro repositorio: no aporta mejoras, ajustes ni correcciones respecto a `handy-computer/whisper-small-gguf`; su valor es puramente de redistribución.
- Solo se publica una cuantización (Q8_0); no hay variantes Q4, Q5 ni F16 para ajustar el equilibrio entre tamaño y calidad.
- No se documentan los idiomas soportados en esta ficha, aunque el modelo base es multilingüe; conviene verificar el comportamiento por idioma antes de usarlo en producción.
- Riesgo de alucinación inherente a los modelos Whisper: en segmentos con silencio, ruido o audio de baja calidad pueden aparecer transcripciones inventadas o repetidas.
- Sesgos heredados del dataset de entrenamiento de OpenAI, no evaluados ni documentados en esta conversión.
- La licencia Apache 2.0 permite uso comercial, pero se deben conservar los archivos `LICENSE` y `NOTICE` incluidos en el repositorio y atribuir correctamente a OpenAI y al repositorio de origen.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, por lo que no hay evidencia de uso en producción ni validación comunitaria.
- No hay información sobre latencia, throughput ni consumo real de memoria; las estimaciones de hardware son aproximadas a partir del tamaño del archivo.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/fluxcost/whisper-small-gguf
- Repositorio de origen de la conversión GGUF: https://huggingface.co/handy-computer/whisper-small-gguf
- Modelo base oficial: https://huggingface.co/openai/whisper-small
- Repositorio de OpenAI Whisper (código y paper): https://github.com/openai/whisper
- Paper de Whisper: https://arxiv.org/abs/2212.04356
