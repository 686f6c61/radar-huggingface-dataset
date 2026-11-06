# cmasus/vocalis-models

## Resumen

Vocalis-models es un repositorio de conversiones a ONNX de modelos de síntesis de voz (text-to-speech) de la familia Kokoro, publicado por el usuario cmasus para su uso en la aplicación Vocalis. No se trata de un modelo entrenado desde cero: los pesos proceden de los autores originales, principalmente hexgrad/Kokoro-82M (basado en la arquitectura StyleTTS 2) y de los modelos suecos de Joakim Eriksson derivados de kikiri-tts. El repositorio empaqueta en un único lugar los modelos de voz para inglés y español (a partir de Kokoro-82M) y para sueco (a partir de kokoro-sv-voices), junto con el modelo de pronunciación (G2P) y los lexicones necesarios.

La relevancia de este repositorio es práctica: ofrece los modelos en formato ONNX, lo que facilita su despliegue en entornos de inferencia sin dependencia de PyTorch, con un tamaño total de repositorio de 1,4 GB. Las modificaciones respecto a los originales se limitan a la conversión de formato y a ajustes de compatibilidad (la velocidad pasa a ser una entrada del modelo, las duraciones por token son una salida adicional y se sustituye una operación de audio por una equivalente soportada en ONNX con `disable_complex=True`). La licencia es Apache-2.0, igual que la de los modelos originales.

El modelo subyacente, Kokoro-82M, es un TTS compacto de 82 millones de parámetros con soporte multilingüe limitado a los idiomas empaquetados aquí: inglés, español y sueco. Este repositorio no añade capacidades nuevas de generación de voz, sino que redistribuye y adapta los pesos existentes para un pipeline concreto.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | StyleTTS 2 (modelo TTS neuronal), convertido a ONNX |
| Parámetros totales | 82M (modelo base Kokoro-82M) |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo TTS, no de lenguaje) |
| Tipos de cuantización | no disponible (el repositorio indica conversión a ONNX; no se detallan cuantizaciones) |
| Idiomas soportados | inglés (en), español (es), sueco (sv) |
| Licencia | Apache-2.0 |
| Formato de pesos | ONNX (modelos de voz y G2P), lexicón TSV, configuración JSON |

## Arquitectura y entrenamiento

El modelo subyacente es Kokoro-82M, un sistema de síntesis de voz basado en StyleTTS 2, una arquitectura de TTS neuronal que combina un codificador de estilo, un decodificador acústico y un modelo de duración. El repositorio de Vocalis no entrena ningún modelo nuevo: realiza la conversión de los pesos PyTorch originales a ONNX, verificando la calidad del habla generada frente a la versión PyTorch a tres velocidades distintas. Entre los cambios técnicos aplicados destacan la exposición de la velocidad como entrada del modelo, la emisión de las duraciones por token como salida adicional y la sustitución de una operación de audio por una alternativa equivalente soportada en ONNX (`disable_complex=True`).

Los modelos suecos provienen de Joakim Eriksson, entrenados con kikiri-tts sobre el corpus NST y grabaciones de LibriVox, con un modelo de pronunciación (G2P) propio dividido en codificador y decodificador y un lexicón ordenado para búsqueda. Las voces Klara y Viktor se entrenaron sobre habla generada con VoxCPM2 (Apache-2.0) y, según su autor, son voces diseñadas, no de personas reales. El lexicón de pronunciación NST procede de Språkbanken (CC0). No se dispone de información sobre el volumen de datos de entrenamiento ni sobre el uso de RLHF o DPO en la información proporcionada.

## Capacidades

- Síntesis de voz (text-to-speech) a partir de texto en inglés, español y sueco.
- Control de velocidad del habla como entrada del modelo ONNX.
- Salida de duraciones por token, útil para alineamiento y control de prosodia.
- Conversión de grafemas a fonemas (G2P) para sueco, con codificador y decodificador separados y lexicón TSV.
- Diez voces suecas en `kokoro_sv/`, más las voces individuales Klara y Viktor.
- Voces en inglés y español procedentes de Kokoro-82M en el directorio `voices/`.
- Ejecución sin PyTorch gracias al formato ONNX.
- No se documentan capacidades de tool calling, agentes, visión, audio de entrada ni modo de razonamiento; es un modelo exclusivamente TTS.

## Casos de uso

- Lectura por voz en aplicaciones de accesibilidad: integración del modelo ONNX en un lector de pantalla o app de lectura que convierta texto en audio para usuarios con discapacidad visual, con control de velocidad ajustable por el usuario.
- Asistentes de voz en aplicaciones de escritorio o móviles: el formato ONNX permite ejecutar la síntesis en el propio dispositivo sin depender de servicios en la nube, reduciendo latencia y coste por petición.
- Generación de audiolibros y contenido narrado: el control de velocidad y la salida de duraciones por token facilitan la sincronización de subtítulos y la producción por lotes de capítulos en inglés o español.
- Localización de contenidos al sueco: las diez voces suecas y el G2P específico permiten doblar o narrar material para el mercado sueco con pronunciación adaptada.
- Prototipado de interfaces conversacionales: equipos que desarrollan chatbots de voz pueden usar el repositorio para generar respuestas habladas en las fases de prueba sin contratar un servicio TTS externo.
- Investigación en síntesis de voz: el repositorio sirve como referencia para comparar la salida ONNX con la PyTorch original y para estudiar el comportamiento del modelo a distintas velocidades.
- Creación de contenido educativo: narración automática de cursos o materiales didácticos en varios idiomas con voces diferenciadas por sección.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información proporcionada; con 82M de parámetros, el modelo es de tamaño reducido y cabe holgadamente en GPUs de consumo, aunque no se detallan cifras.
- GPU recomendadas: no disponible. Por el tamaño del modelo, es plausible su ejecución en GPUs de gama media y en CPU, pero no se confirma en la documentación.
- Ejecución en GPU de consumo: no se especifica; el formato ONNX sugiere despliegue en CPU y en aceleradores compatibles con ONNX Runtime.
- Opciones de despliegue: ONNX Runtime (formato nativo del repositorio). No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a un modelo TTS de este tipo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Idiomas | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| Vocalis-models (este repo) | 82M (base Kokoro-82M) | en, es, sv | ONNX | Apache-2.0 | Conversión ONNX para la app Vocalis; incluye G2P sueco |
| hexgrad/Kokoro-82M | 82M | en (principalmente) | PyTorch | Apache-2.0 | Modelo original en el que se basa la parte inglesa y española |
| Joakim/kokoro-sv-voices | no disponible | sv | PyTorch | no disponible en la información | Origen de las voces y el G2P suecos |
| VoxCPM2 (openbmb) | no disponible | no disponible | no disponible | Apache-2.0 | Usado para generar el habla de entrenamiento de Klara y Viktor; prohíbe su uso para suplantación, fraude o desinformación |

## Limitaciones y advertencias

- No es un modelo nuevo: reproduce pesos de terceros; los méritos y limitaciones de calidad del habla corresponden a los autores originales.
- Todo el audio generado es habla sintética por IA y debe etiquetarse como tal al compartirse, según indica el autor.
- Las voces Klara y Viktor se entrenaron con habla generada por VoxCPM2, cuya licencia prohíbe el uso para suplantación de identidad, fraude o desinformación; esta restricción se extiende al uso de esas voces.
- Cobertura lingüística limitada a inglés, español y sueco; no se documenta soporte para otros idiomas.
- No se detallan sesgos, tasas de alucinación ni métricas de calidad objetivas; al ser un modelo TTS, el riesgo principal es la pronunciación incorrecta o la prosodia antinatural, no la alucinación de contenido.
- La licencia Apache-2.0 permite uso comercial, pero deben respetarse las condiciones de los modelos y corpus de origen (incluido el lexicón NST CC0 y la restricción de VoxCPM2).
- El repositorio tiene cero descargas y cero likes en el momento de la consulta, por lo que no hay evidencia de uso en producción ni validación comunitaria.
- No se especifican cuantizaciones disponibles ni requisitos de hardware verificados; conviene validar el rendimiento en el entorno objetivo antes de desplegar.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/cmasus/vocalis-models
- Modelo base Kokoro-82M: https://huggingface.co/hexgrad/Kokoro-82M
- Voces suecas de Joakim Eriksson: https://huggingface.co/Joakim/kokoro-sv-voices
- G2P sueco: https://huggingface.co/Joakim/kokoro-sv-g2p
- StyleTTS 2 (arquitectura base): https://github.com/yl4579/StyleTTS2
- kikiri-tts (entrenamiento de los modelos suecos): https://github.com/semidark/kikiri-tts
- VoxCPM2: https://huggingface.co/openbmb/VoxCPM2
- Lexicón NST de Språkbanken: https://www.nb.no/sprakbanken/en/resource-catalogue/oai-nb-no-sbr-22
