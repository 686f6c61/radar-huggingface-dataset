# demoqqq/banglatts-combined-news

## Resumen

BanglaTTS Combined News es un modelo de síntesis de voz (text-to-speech) en bengalí, publicado por el usuario demoqqq en Hugging Face. Se trata de un ajuste fino del modelo EMTIAZZ/bangladeshi-bangla-tts-vits, basado en la arquitectura VITS, y está empaquetado en formato ONNX para su uso con sherpa-onnx en la aplicación Android BanglaTTS. El modelo es de un único hablante y está especializado en la lectura de textos informativos en bengalí.

El modelo resuelve un problema muy concreto: la conversión de texto a voz offline en dispositivos Android para contenido de noticias en bengalí, incluyendo la correcta pronunciación de conjunctos bengalíes, dígitos, años, cantidades en takas, porcentajes, horas, distritos y nombres de personas. El ajuste se realizó sobre 1.262 clips de audio durante 100 épocas, con un enfoque en la cobertura de patrones lingüísticos presentes en textos periodísticos.

La relevancia de este modelo es limitada fuera de su nicho: no es un modelo de lenguaje generalista, sino un componente de TTS específico para una aplicación móvil concreta. Su tamaño de repositorio es de 0,1 GB y no cuenta con descargas ni valoraciones en el momento de la consulta. La información disponible sobre licencia, idiomas y pipeline es escasa o inexistente.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | VITS (fine-tuned) |
| Parámetros totales | no disponible |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (modelo TTS, no aplica contexto de tokens de texto) |
| Tipos de cuantización | no disponible |
| Idiomas soportados | bengalí (según la model card) |
| Licencia | no disponible |
| Formato de pesos | ONNX (`model.onnx`) + tabla de tokens (`tokens.txt`, 84 líneas) |

## Arquitectura y entrenamiento

El modelo se basa en VITS (Variational Inference with adversarial learning for end-to-end Text-to-Speech), una arquitectura de síntesis de voz de extremo a extremo que combina un codificador de texto, un prior variacional, un decodificador generativo y un discriminador adversarial. El autor indica que se trata de un ajuste fino del modelo EMTIAZZ/bangladeshi-bangla-tts-vits, aunque no se detallan los hiperparámetros del ajuste ni la composición exacta del dataset más allá del número de clips.

El entrenamiento se realizó sobre 1.262 clips de audio durante 100 épocas. La model card describe la procedencia de los datos como "linaje Kiki": lecturas de noticias originales más frases de cobertura que cubren conjunctos bengalíes, dígitos, años, cantidades en takas, porcentajes, horas, distritos y nombres de personas. No se menciona el uso de RLHF, DPO ni técnicas de alineación adicionales. El modelo se distribuye en formato ONNX con metadatos compatibles con sherpa-onnx, junto con una tabla de tokens de 84 entradas.

## Capacidades

- Síntesis de voz (text-to-speech) en bengalí para lectura de textos informativos.
- Modelo de un único hablante, sin control de emoción (la model card indica que las emociones de alegría/tristeza serán modelos futuros separados).
- Pronunciación específica de conjunctos bengalíes, dígitos, años, cantidades en takas, porcentajes, horas, distritos y nombres de personas, gracias a las frases de cobertura del dataset de entrenamiento.
- Funcionamiento offline en Android mediante sherpa-onnx.
- Segmentación de texto por puntuación (। ? ! . , ') con pausas breves en cada marca, de modo que el habla no se corta a mitad de palabra.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni capacidades multilingües más allá del bengalí.
- No dispone de modo de pensamiento (thinking mode), visión ni audio de entrada.

## Casos de uso

- Lectura de noticias en bengalí en la aplicación Android BanglaTTS: el modelo convierte titulares y cuerpos de noticia en voz sintetizada offline, aprovechando la segmentación por puntuación para mantener una prosodia natural en cada frase.
- Accesibilidad para personas con discapacidad visual: integración en lectores de pantalla o aplicaciones de accesibilidad que necesiten una voz bengalí para leer contenido periodístico sin conexión a internet.
- Pronunciación correcta de entidades y cifras en boletines informativos: el entrenamiento con frases de cobertura de distritos, nombres de personas, años, porcentajes y cantidades en takas lo hace adecuado para la locución automatizada de datos numéricos y topónimos.
- Generación de audio para resúmenes de noticias en formato podcast: un pipeline puede tomar texto periodístico, dividirlo por puntuación y sintetizar cada segmento con pausas breves, produciendo un audio continuo con cadencia de lectura informativa.
- Pruebas de integración en sherpa-onnx: al distribuirse como `model.onnx` más `tokens.txt`, sirve como componente de referencia para validar pipelines de TTS en dispositivos Android de gama baja sin dependencia de la nube.
- Prototipado de asistentes de voz locales en bengalí: desarrolladores que necesiten una voz offline para un asistente de noticias o de lectura de contenidos pueden usar este modelo como base, aunque sin control emocional ni cambios de hablante.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. El repositorio ocupa 0,1 GB, lo que sugiere un modelo ligero apto para ejecución en CPU.
- GPU recomendadas: no disponible. Por el formato ONNX y el uso previsto en Android, está diseñado para inferencia en CPU de dispositivos móviles.
- ¿Cabe en GPU de consumo? No se dispone de datos específicos, pero el tamaño del repositorio (0,1 GB) indica que es viable en hardware de gama baja, incluidos dispositivos móviles.
- Opciones de despliegue: sherpa-onnx (según la model card). No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a un modelo TTS de este tipo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Arquitectura | Idioma | Formato | Licencia | Contexto | Disponibilidad |
|---|---|---|---|---|---|---|
| BanglaTTS Combined News (demoqqq) | VITS fine-tuned | Bengalí | ONNX + tokens.txt | no disponible | no aplica | Hugging Face, 0 descargas |
| EMTIAZZ/bangladeshi-bangla-tts-vits | VITS | Bengalí | no disponible | no disponible | no aplica | Hugging Face (modelo base) |
| Alternativas TTS multilingües (p. ej. Coqui TTS, Piper) | VITS / otros | Múltiples, según modelo | ONNX / otros | varía según modelo | no aplica | Hugging Face / GitHub |

No se dispone de datos de rendimiento comparativo entre estos modelos en la información proporcionada. La comparación se limita a aspectos estructurales y de disponibilidad.

## Limitaciones y advertencias

- Modelo de un único hablante: no permite cambiar de voz ni controlar emociones (la model card indica que las emociones se abordarán en modelos futuros separados).
- Especializado en lectura de noticias: su rendimiento fuera de ese dominio (conversación, literatura, dominios técnicos) no está documentado y podría degradarse.
- Licencia no disponible: no se puede confirmar si el uso comercial está permitido; es un riesgo importante para producción.
- Idiomas: solo bengalí según la model card; no se ha verificado el soporte de otras lenguas ni variantes dialectales.
- Riesgo de alucinación en TTS: no aplica en el sentido de generación de texto, pero puede producir pronunciaciones incorrectas en palabras fuera del vocabulario de entrenamiento o en nombres propios no cubiertos.
- Sin datos de benchmarks ni evaluaciones subjetivas (MOS) publicadas: no hay evidencia cuantitativa de calidad de síntesis.
- Dependencia de sherpa-onnx y del formato ONNX con metadatos: la integración está atada a ese runtime y a la tabla de tokens de 84 líneas.
- Repositorio con 0 descargas y 0 likes: no hay señal de validación por parte de la comunidad.
- La fecha de creación indicada (2026-11-02) es futura respecto a la fecha habitual de consulta; conviene verificar la vigencia del repositorio.

## Enlaces

- Hugging Face: https://huggingface.co/demoqqq/banglatts-combined-news
- Modelo base: https://huggingface.co/EMTIAZZ/bangladeshi-bangla-tts-vits
- sherpa-onnx (runtime de despliegue): no se proporciona enlace en la información disponible.
