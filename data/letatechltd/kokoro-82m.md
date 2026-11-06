# LetATechLtd/kokoro-82m

## Resumen

`LetATechLtd/kokoro-82m` es un paquete de voces para síntesis de voz (text-to-speech) derivado de Kokoro-82M, un modelo TTS de 82 millones de parámetros desarrollado originalmente por hexgrad. Esta variante concreta la publica LetA Tech Ltd como componente de voz en dispositivo ("on-device") de su aplicación Mellions, y se distribuye en formato LiteRT-LM (`.litertlm`) para ejecutarse con MediaPipe Tasks Audio 1.2.0.

No se trata de un modelo entrenado desde cero, sino de una copia recortada del fichero `kokoro_int8_gpu_fp16.litertlm` del repositorio `litert-community/Kokoro-82M` (revisión `33ad69fec6c4d9eb10a547aaf9a8c63e7c446a56`), reempaquetada de forma reproducible a partir de un lock que fija el fichero origen, cada paquete del builder por hash, la receta y la cabecera. El bundle resultante ocupa 133.969.920 bytes (unos 128 MiB) y el repositorio completo 0,1 GB.

Su relevancia es acotada: interesa a quien necesite un TTS ligero, con licencia Apache 2.0 y ejecutable en local sin GPU dedicada, limitado a inglés (en-US, en-GB) y francés (fr-FR) con cuatro voces predefinidas. No es un modelo de propósito general ni un transformer de lenguaje; es un motor acústico de conversión texto-a-hablado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Kokoro-82M (modelo TTS; arquitectura interna no detallada en la informacion disponible) |
| Parametros totales | 82 millones (heredados de Kokoro-82M) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (modelo TTS, no aplica ventana de contexto de texto) |
| Tipos de cuantizacion | INT8 con precisión FP16 en GPU (`kokoro_int8_gpu_fp16` en el fichero origen) |
| Idiomas soportados | en-US, en-GB, fr-FR |
| Licencia | Apache 2.0 |
| Formato de pesos | `.litertlm` (LiteRT-LM), 133.969.920 bytes |
| Voces incluidas | `af_heart` (Sophia, inglés), `am_michael` (Marc, inglés), `af_alex` (Alex, inglés; media elemento a elemento de `af_heart` y `am_michael`), `ff_siwis` (Sophia, francés) |
| Runtime | MediaPipe Tasks Audio 1.2.0 |
| Libreria | litert-lm |
| SHA-256 del fichero | `e652e4cf36ad1e1f1d20ad504cea464ec6424ffc54a780b103893b1cb644b04e` |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna del modelo base Kokoro-82M ni su proceso de entrenamiento: no se indican número de tokens, composición del dataset, ni si hubo RLHF, DPO u otras etapas de alineación. Lo que sí consta es el linaje: este paquete deriva de `litert-community/Kokoro-82M`, a su vez una conversión del modelo original `hexgrad/Kokoro-82M` al formato LiteRT-LM, y de ahí la cadena de `base_model` declarada en los metadatos.

La innovación técnica relevante aquí no está en el entrenamiento, sino en el empaquetado y la reproducibilidad. El bundle se reconstruye byte a byte desde un lock que fija el fichero fuente, los paquetes del builder por hash, la receta y la cabecera; el fichero `NOTICE` documenta cada cambio respecto al original. La inferencia se delega en MediaPipe Tasks Audio 1.2.0, lo que permite ejecución en dispositivo con cuantización INT8 y FP16 en GPU. El fichero incluye una voz sintética (`af_alex`) generada como media elemento a elemento de dos voces existentes, un truco de interpolación de embeddings de hablante, no un entrenamiento adicional.

## Capacidades

- Síntesis de voz a partir de texto en inglés estadounidense (en-US), inglés británico (en-GB) y francés (fr-FR).
- Cuatro voces predefinidas: Sophia y Marc en inglés, Alex en inglés (voz interpolada), y Sophia en francés.
- Ejecución en dispositivo mediante LiteRT-LM y MediaPipe Tasks Audio, sin dependencia de servicios en la nube.
- Modelo ligero: 82 M de parámetros y un fichero de ~128 MiB, apto para entornos con memoria limitada.
- No soporta tool calling, function calling, razonamiento multi-paso, agentes, visión, audio de entrada ni modo "thinking": es exclusivamente un modelo TTS.
- No se documentan capacidades de control de prosodia, emoción, velocidad o clonación de voz más allá de la selección entre las cuatro voces incluidas.

## Casos de uso

- Lectura por voz en aplicaciones móviles: el bundle está pensado para integrarse en la app Mellions y permite narrar contenido en inglés o francés sin conexión, gracias a su tamaño de ~128 MiB y a la ejecución vía MediaPipe en el propio dispositivo.
- Asistentes de accesibilidad: conversión de texto a voz para usuarios con discapacidad visual o dificultades de lectura, con latencia baja al no requerir round-trip a un servidor y con voces diferenciadas por género e idioma.
- Aprendizaje de idiomas: reproducción de frases en en-US, en-GB y fr-FR con voces nativas, útil para aplicaciones de práctica de pronunciación y comprensión auditiva que necesiten funcionar offline.
- Audioguías y contenido turístico local: generación de narraciones en inglés y francés en dispositivos sin conectividad, por ejemplo en museos o instalaciones con hardware modesto.
- Prototipado de interfaces conversacionales: al estar bajo Apache 2.0 y en un formato reproducible, sirve para validar pipelines de TTS en local antes de escalar a un servicio en producción.
- Sistemas embebidos y edge computing: el formato LiteRT-LM y la cuantización INT8/FP16 permiten desplegar el modelo en dispositivos con recursos restringidos donde un TTS basado en servidor no es viable.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita; el fichero pesa ~128 MiB, por lo que la huella de memoria es del orden de cientos de MiB incluyendo el runtime de MediaPipe.
- GPU recomendadas: no se especifican modelos concretos; el fichero origen está etiquetado como `gpu_fp16`, lo que sugiere uso de GPU cuando esté disponible.
- ¿Cabe en GPU de consumo? Por tamaño (82 M de parámetros, INT8/FP16) es compatible con GPUs de consumo e incluso con ejecución en CPU; no se detallan modelos concretos.
- Opciones de despliegue: LiteRT-LM con MediaPipe Tasks Audio 1.2.0. No se mencionan vLLM, llama.cpp, Ollama ni TGI, que además no aplican a este formato.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Idiomas | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| LetATechLtd/kokoro-82m | 82 M | en-US, en-GB, fr-FR | `.litertlm` | Apache 2.0 | 4 voces, bundle para Mellions |
| hexgrad/Kokoro-82M | 82 M | no disponible en la informacion proporcionada | safetensors y otros | Apache 2.0 | Modelo original de hexgrad |
| litert-community/Kokoro-82M | 82 M | no disponible en la informacion proporcionada | `.litertlm` | Apache 2.0 | Conversión LiteRT del original; fuente directa de este bundle |

No se dispone de datos de benchmarks ni de especificaciones de otras alternativas TTS en la información proporcionada, por lo que la comparación se limita al linaje y al formato.

## Limitaciones y advertencias

- Cobertura lingüística muy restringida: solo inglés (en-US, en-GB) y francés (fr-FR); no hay soporte de castellano ni de otros idiomas.
- Solo cuatro voces, una de ellas sintética por interpolación (`af_alex`); no hay clonación de voz ni control fino de estilo.
- Riesgo de alucinación acústica y errores de pronunciación en palabras poco frecuentes, nombres propios, siglas o texto con formato especial; no se documentan métricas de calidad (MOS, WER) en la información disponible.
- Sesgos: no se documentan evaluaciones de sesgo por acento, género o idioma; las voces disponibles cubren un espectro limitado.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero se debe conservar el aviso de licencia y el fichero `NOTICE` con los cambios respecto al original, y verificar las obligaciones heredadas del modelo base.
- Dependencia del runtime: el formato `.litertlm` obliga a usar LiteRT-LM y MediaPipe Tasks Audio 1.2.0; no es portable a otros motores de inferencia sin conversión.
- Repositorio con muy poca tracción (29 descargas, 0 likes en el momento de la consulta) y sin documentación de rendimiento ni de casos de producción más allá de la app Mellions.
- El tamaño del repositorio (0,1 GB) y el SHA-256 publicado permiten verificar la integridad del fichero, pero no hay garantías adicionales de mantenimiento o soporte por parte del autor.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/LetATechLtd/kokoro-82m
- Ficheros del repositorio: https://huggingface.co/LetATechLtd/kokoro-82m/tree/main
- Modelo base (conversión LiteRT): https://huggingface.co/litert-community/Kokoro-82M
- Modelo original: https://huggingface.co/hexgrad/Kokoro-82M
