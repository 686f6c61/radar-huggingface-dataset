# owensong/Inflect-Micro-v2

## Resumen

Inflect-Micro-v2 es un modelo de síntesis de voz de texto a audio (TTS) desarrollado de forma independiente por Owen Song, que convierte texto en inglés en forma de onda de audio completa sin necesidad de vocoder externo. Con solo 9.356.513 parámetros y un peso de 37,53 MB en FP32, está diseñado para ejecutarse localmente en CPU o CUDA, lo que lo hace adecuado para aplicaciones de edge computing y dispositivos con recursos limitados. El modelo genera audio mono a 24 kHz con una voz fija en inglés, ofrece salidas deterministas mediante semillas configurables y maneja textos largos.

Su relevancia actual radica en la tendencia hacia modelos de IA pequeños y eficientes que puedan desplegarse en entornos sin conexión, manteniendo una calidad de voz aceptable. Según la model card, el autor planea una versión v3 con más idiomas y voces si el proyecto recibe suficiente apoyo. La licencia Apache-2.0 permite uso comercial y modificación sin restricciones significativas.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VITS (Variational Inference with adversarial training) |
| Parametros totales | 9.356.513 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No aplica (modelo TTS, no procesa contexto de texto largo como LLM; soporta textos largos) |
| Tipos de cuantizacion | No disponible (pesos FP32 por defecto; se menciona exportación a ONNX, pero sin cuantizaciones específicas) |
| Idiomas soportados | Inglés (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | PyTorch (FP32) |

## Arquitectura y entrenamiento

Inflect-Micro-v2 utiliza la arquitectura VITS, que integra un encoder de texto, un decoder de forma de onda y un discriminador adversarial en un único modelo entrenado de extremo a extremo. Esto permite generar audio directamente desde el texto sin componentes separados de vocoder, lo que reduce la complejidad de despliegue. La arquitectura está optimizada para un presupuesto de parámetros inferior a 10 millones, priorizando la calidad de voz dentro de ese límite.

No se han proporcionado detalles específicos sobre el dataset de entrenamiento, el número de tokens o el proceso de alineación (por ejemplo, si se usó aprendizaje por refuerzo o ajuste fino). La model card indica que el modelo admite un toolkit de adaptación pública para preparar datos, auditar divisiones de entrenamiento/validación, adaptar una voz o idioma fijo, reanudar entrenamiento y exportar paquetes PyTorch u ONNX, aunque la calidad de las adaptaciones se describe como experimental.

## Capacidades

- Generación de voz en inglés a 24 kHz mono a partir de texto, con voz fija (sin necesidad de audio de referencia en tiempo de ejecución).
- Salidas deterministas mediante semillas configurables, lo que permite reproducir exactamente la misma síntesis para un mismo texto y semilla.
- Manejo de textos largos, con soporte para párrafos extensos sin degradación aparente.
- Inferencia en CPU o CUDA, con un rendimiento de 6,28× tiempo real en CPU de 4 hilos según la evaluación.
- Procesamiento de puntuación, números, nombres propios y lugares, como se muestra en los ejemplos de audio de la model card.
- Exportación a ONNX para despliegue en entornos sin PyTorch.

## Casos de uso

- Asistentes de voz en dispositivos edge: el modelo puede integrarse en altavoces inteligentes o dispositivos IoT con CPU limitada, generando respuestas de voz sin depender de servicios en la nube. Su tamaño de 37,53 MB permite empaquetarlo en firmware.
- Lectura de pantalla para accesibilidad: aplicaciones que convierten texto de páginas web o documentos en audio para personas con discapacidad visual, ejecutándose localmente para garantizar privacidad y funcionamiento sin conexión.
- Audiolibros y narración de contenido: generación de voz para libros electrónicos o artículos largos, aprovechando el manejo de textos extensos y la salida de 24 kHz.
- Sistemas de respuesta interactiva (IVR): en centros de llamadas o quioscos, el modelo puede leer menús o información al cliente en tiempo real, con baja latencia en hardware modesto.
- Aprendizaje de idiomas: aplicaciones educativas que pronuncian palabras o frases en inglés para estudiantes, con la posibilidad de fijar una semilla para mantener consistencia en las lecciones.
- Generación de voz para vídeos y contenido multimedia: creadores que necesitan narración sin usar voces comerciales, ejecutando el modelo localmente para evitar costes de API y mantener el control sobre el resultado.

## Benchmarks y rendimiento

La model card reporta los siguientes resultados para Inflect-Micro-v2, evaluados con protocolos propios que incluyen preferencia humana, naturalidad predicha, inteligibilidad con dos ASR, tamaño del modelo y rendimiento en CPU:

| Metrica | Valor |
|---|---|
| Preferencia comunitaria (human preference) | 66,2% |
| UTMOS22 (naturalidad predicha) | 4,395 |
| WER semántico con dos ASR | 3,99% |
| Peso completo FP32 | 37,53 MB |
| Rendimiento CPU 4 hilos | 6,28× tiempo real |

No se han publicado resultados comparativos detallados contra otros modelos en la información disponible. La model card menciona un conjunto de comparación que incluye KittenTTS Nano, Piper Low y Supertonic 3, pero no se ofrecen números específicos de esos modelos.

## Requisitos de hardware

- Inferencia en CPU: el modelo funciona en CPU sin GPU, con un rendimiento de 6,28× tiempo real en un sistema de 4 hilos. Es adecuado para portátiles, Raspberry Pi y dispositivos embebidos.
- Inferencia en CUDA: compatible con GPU NVIDIA, aunque no se especifica la VRAM necesaria. Dado el tamaño de 37,53 MB FP32, cualquier GPU con al menos 1 GB de VRAM puede ejecutarlo sin problemas.
- No requiere GPU para uso práctico; el modelo está diseñado para edge AI y CPU.
- Opciones de despliegue: PyTorch nativo, exportación a ONNX, y posiblemente integración con frameworks de inferencia como llama.cpp u Ollama (no mencionado explícitamente, pero el formato ONNX facilita la portabilidad).
- Latencia: no se proporciona un valor exacto, pero el throughput de 6,28× tiempo real en CPU implica que un texto de 10 segundos se sintetiza en aproximadamente 1,6 segundos en hardware de 4 hilos.

## Comparativa con modelos similares

La model card menciona tres competidores en su conjunto de evaluación: KittenTTS Nano, Piper Low y Supertonic 3. No se ofrecen datos cuantitativos de estos modelos en la información disponible, por lo que la comparación se limita a características generales.

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Inflect-Micro-v2 | 9,36 M | Texto largo | 6,28× tiempo real (CPU 4 hilos) | Apache-2.0 | Hugging Face |
| KittenTTS Nano | No disponible | No disponible | No disponible | No disponible | Hugging Face |
| Piper Low | No disponible | No disponible | No disponible | No disponible | Hugging Face (rhasspy/piper-voices) |
| Supertonic 3 | No disponible | No disponible | No disponible | No disponible | Hugging Face |

No se dispone de más detalles para establecer una comparativa técnica rigurosa.

## Limitaciones y advertencias

- Voz fija: el modelo solo genera una única voz en inglés, sin opción de cambiar de hablante o de acento sin adaptación adicional.
- Idioma limitado: exclusivamente inglés; no soporta otros idiomas de forma nativa.
- Calidad de adaptación experimental: el toolkit de adaptación para nuevas voces o idiomas se describe como experimental, por lo que los resultados pueden variar y requerir evaluación con hablantes fluidos.
- Posibles sesgos en pronunciación: nombres propios, lugares o términos técnicos pueden pronunciarse incorrectamente, como se observa en los ejemplos de la model card (aunque los ejemplos muestran buena pronunciación, no se garantiza para todos los casos).
- Riesgo de alucinación: al ser un modelo TTS, no genera contenido semántico, pero puede producir audio ininteligible o con errores en entradas complejas o mal formateadas.
- Sin cuantizaciones oficiales: no se documentan versiones cuantizadas (INT8, INT4, etc.), lo que puede limitar el despliegue en dispositivos con memoria muy restringida, aunque el tamaño FP32 ya es pequeño.
- Desarrollo independiente: el modelo está financiado por el autor, sin respaldo de una organización grande, lo que puede implicar menor soporte o continuidad del proyecto.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/owensong/Inflect-Micro-v2
- Playground en vivo: https://huggingface.co/spaces/owensong/Inflect-v2
- Repositorio GitHub: https://github.com/owenawsong/Inflect
- Documentación de evaluación: https://huggingface.co/owensong/Inflect-Micro-v2/blob/main/docs/EVALUATION.md
- Documentación de despliegue: https://huggingface.co/owensong/Inflect-Micro-v2/blob/main/docs/DEPLOYMENT.md
- Documentación de exportación: https://huggingface.co/owensong/Inflect-Micro-v2/blob/main/docs/EXPORTS.md
- Toolkit de adaptación (finetune): https://github.com/owenawsong/Inflect/tree/main/finetune
- Modelo hermano Inflect-Nano-v2: https://huggingface.co/owensong/Inflect-Nano-v2
- Comunidad Discord: https://discord.gg/CVJYedvzvp
