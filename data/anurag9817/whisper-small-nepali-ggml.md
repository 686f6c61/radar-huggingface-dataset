# Anurag9817/whisper-small-nepali-ggml

## Resumen

Whisper Small Nepali GGML es un modelo de reconocimiento automático del habla (ASR) especializado en nepalí, publicado por el usuario Anurag9817 (Anurag Chaudhary). Se trata de una conversión al formato GGML del modelo Dragneel/whisper-small-nepali, que a su vez es un ajuste fino de la arquitectura OpenAI Whisper Small sobre datos en nepalí. El repositorio incluye el modelo convertido original y varias variantes cuantizadas generadas por el autor.

La relevancia de esta ficha radica en su formato: al estar en GGML, el modelo está pensado para ejecutarse con compilaciones compatibles de whisper.cpp, lo que permite inferencia eficiente en CPU y en GPUs de gama baja sin necesidad de frameworks pesados. Con aproximadamente 244 millones de parámetros (arquitectura Whisper Small), es un modelo ligero y desplegable en hardware de consumo, algo clave para la transcripción de nepalí en entornos con recursos limitados.

El modelo se distribuye bajo licencia Apache 2.0, soporta únicamente el idioma nepalí (código `ne`) y procesa audio en ventanas de 30 segundos, tal como es habitual en la familia Whisper. No se han publicado métricas de rendimiento ni detalles del proceso de ajuste en la información disponible.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (OpenAI Whisper Small) |
| Parámetros totales | ≈244 millones (arquitectura Whisper Small; no confirmado en la model card) |
| Parámetros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | Ventanas de audio de 30 segundos (1500 fotogramas mel); 448 tokens en el decodificador |
| Tipos de cuantización | Variantes cuantizadas en GGML generadas por el autor; la model card no enumera los niveles concretos (en whisper.cpp son habituales q5_0, q5_1 y q8_0) |
| Idiomas soportados | Nepalí (`ne`); no se documentan otros idiomas |
| Licencia | Apache 2.0 |
| Formato de pesos | GGML (compatible con whisper.cpp) |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de OpenAI Whisper Small: un transformer encoder-decoder con 12 capas en el codificador y 12 en el decodificador, dimensión de modelo de 768 y 12 cabezas de atención, entrenado originalmente sobre espectrogramas mel de 80 canales y ventanas de audio de 30 segundos. Whisper Small es un modelo multilingüe de propósito general; esta variante concreta es el resultado de una conversión a GGML del ajuste fino Dragneel/whisper-small-nepali, orientado específicamente al nepalí.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset de ajuste fino, ni sobre si se aplicaron técnicas como RLHF o DPO. Tampoco se detallan las innovaciones técnicas del ajuste más allá de la propia cuantización a GGML, cuyo objetivo es reducir el peso y acelerar la inferencia en whisper.cpp. El autor indica que el repositorio contiene tanto el modelo convertido original como variantes cuantizadas generadas correctamente.

## Capacidades

- Transcripción de voz a texto en nepalí (ASR monolingüe).
- Procesamiento de audio en segmentos de hasta 30 segundos mediante ventanas deslizantes.
- Ejecución en CPU y GPU a través de compilaciones compatibles de whisper.cpp.
- Soporte de variantes cuantizadas para reducir requisitos de memoria y latencia.
- No se documenta soporte de tool calling, function calling ni capacidades de agente.
- No se documentan capacidades multimodales (visión, audio distinto del ASR o modo de razonamiento).
- No se documenta soporte multilingüe más allá del nepalí.

## Casos de uso

- Transcripción de reuniones y entrevistas en nepalí: el modelo convierte audio en texto con ventanas de 30 segundos, adecuado para generar actas o subtítulos de grabaciones en este idioma.
- Generación de subtítulos para vídeo en nepalí: al ejecutarse en whisper.cpp, puede integrarse en un pipeline de posproducción que transcriba pistas de audio segmento a segmento.
- Digitalización de archivos orales: transcripción de grabaciones históricas, entrevistas etnográficas o material radiofónico en nepalí para su indexación y búsqueda.
- Asistentes de voz en nepalí: como componente ASR de un sistema de dictado o de un asistente conversacional que necesite convertir la entrada de voz a texto antes de procesarla.
- Atención al cliente en nepalí: transcripción de llamadas para su registro, análisis de calidad o clasificación automática de incidencias.
- Accesibilidad para personas con discapacidad auditiva: generación de subtítulos en tiempo casi real en nepalí sobre contenido hablado.
- Despliegue en dispositivos con recursos limitados: gracias al formato GGML y al tamaño del modelo (~244 M), puede ejecutarse en portátiles o servidores pequeños sin GPU dedicada.
- Investigación en ASR de bajos recursos: sirve como punto de partida o línea base para experimentos con nepalí y otras lenguas de escasa representación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible para este modelo concreto.

A modo de referencia contextual del ecosistema, un proyecto independiente de ASR en nepalí basado también en Whisper Small reportó un WER del 32% en su conjunto de validación (repositorio amitpant7/Nepali-Automatic-Speech-Recognition). Esta cifra corresponde a otro ajuste y no debe atribuirse a este modelo.

## Requisitos de hardware

- VRAM estimada para inferencia: en torno a 0,5-1 GB en precisión completa (fp16) y aproximadamente 0,2-0,4 GB en variantes cuantizadas (estimación según el tamaño de Whisper Small).
- GPU recomendadas: cualquier GPU moderna con al menos 2 GB de VRAM; funciona bien en RTX 3060, RTX 4090, A100 o H100, aunque no necesita hardware de gama alta.
- Compatibilidad con GPU de consumo: sí, cabe holgadamente en cualquier GPU de consumo e incluso en iGPU; el modelo está diseñado para ejecutarse también en CPU.
- Opciones de despliegue: whisper.cpp (incluido el modo servidor) y sus bindings (por ejemplo, pywhispercpp); no es directamente cargable en transformers sin reconvertir el formato.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| Anurag9817/whisper-small-nepali-ggml | ≈244 M | Audio 30 s | Nepalí | Apache 2.0 | GGML |
| Dragneel/whisper-small-nepali (origen) | ≈244 M | Audio 30 s | Nepalí | No disponible | Safetensors / transformers (no confirmado) |
| OpenAI Whisper Small | 244 M | Audio 30 s | Multilingüe | MIT | PyTorch / GGML oficial |
| OpenAI Whisper Large v3 | 1550 M | Audio 30 s | Multilingüe | MIT | PyTorch / GGML oficial |

No se dispone de métricas comparativas de precisión entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- Modelo monolingüe: está ajustado para nepalí y no se documenta soporte de otros idiomas.
- Al proceder de Whisper Small, la precisión esperable es notablemente inferior a la de las variantes Large o Large v3.
- No se han publicado resultados de benchmarks ni métricas de WER para esta conversión concreta, por lo que su calidad real no está verificada de forma pública.
- El dataset de ajuste fino y su composición son desconocidos, lo que impide evaluar sesgos o cobertura lingüística.
- Whisper tiende a producir alucinaciones en segmentos de silencio, música o audio de baja calidad; conviene validar las transcripciones en producción.
- El formato GGML está pensado para whisper.cpp; para usarlo en otros ecosistemas hay que reconvertir los pesos.
- El repositorio presenta cero descargas y cero valoraciones, por lo que carece de validación por parte de la comunidad.
- Licencia Apache 2.0: permite uso comercial, pero conviene revisar las condiciones del modelo original y de los datos de entrenamiento de origen.
- No se documentan límites explícitos de contexto de texto más allá de los propios de la arquitectura Whisper.

## Enlaces

- [Modelo en HuggingFace](https://huggingface.co/Anurag9817/whisper-small-nepali-ggml)
- [Perfil del autor en HuggingFace](https://huggingface.co/Anurag9817/models)
- [Modelo origen: Dragneel/whisper-small-nepali](https://huggingface.co/Dragneel/whisper-small-nepali)
- [kiranpantha/whisper-nepali (GitHub)](https://github.com/kiranpantha/whisper-nepali)
- [amitpant7/Nepali-Automatic-Speech-Recognition (GitHub)](https://github.com/amitpant7/Nepali-Automatic-Speech-Recognition)
- [Whisper API Docs (modelos GGML)](https://whisper.vedgupta.in/docs/models/)
- [Faith-nchifor/whisper-small-nep (HuggingFace)](https://huggingface.co/Faith-nchifor/whisper-small-nep)
