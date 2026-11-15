# Phoonnx/glowtts-en-us-kathleen

## Resumen

glowtts-en-us-kathleen es un modelo de síntesis de voz (text-to-speech) en inglés estadounidense, publicado por Phoonnx como un subconjunto del repositorio agregado `Phoonnx/phoonnx-glowtts`. Se trata de un checkpoint de GlowTTS, una arquitectura de TTS no autorregresiva basada en flujo normalizador, empaquetado en formato ONNX para su uso con la librería `phoonnx`, un motor de inferencia de voz del ecosistema de TigreGotico.

El modelo está identificado internamente con el voice id `larynx/en-us-kathleen-glow_tts`, lo que indica que proviene de la colección de voces Larynx y corresponde a la voz femenina "kathleen" en inglés de EE. UU. El repositorio ocupa aproximadamente 0,1 GB, un tamaño coherente con un modelo TTS ligero orientado a inferencia en CPU o en entornos con recursos limitados.

La relevancia de esta ficha es acotada: no se trata de un modelo de lenguaje generalista sino de un componente de voz específico, con documentación mínima, sin métricas publicadas y con una licencia marcada como "other" sin especificar. Es útil para desarrolladores que ya trabajan con el stack phoonnx y necesitan una voz inglesa concreta, pero no debe evaluarse con los criterios habituales de un LLM.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | GlowTTS (TTS no autorregresivo basado en flujo normalizador) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo TTS, no aplica ventana de contexto textual) |
| Tipos de cuantizacion | no disponible; el artefacto distribuido es ONNX |
| Idiomas soportados | ingles estadounidense (en-US), segun el identificador de voz |
| Licencia | other (sin licencia concreta especificada en la model card) |
| Formato de pesos | ONNX |
| Tamano del repositorio | 0,1 GB |
| Libreria de inferencia | phoonnx |
| Pipeline | text-to-speech |
| Voice id | larynx/en-us-kathleen-glow_tts |

## Arquitectura y entrenamiento

GlowTTS es una arquitectura de síntesis de voz no autorregresiva que combina un encoder de texto con un decoder basado en flujo normalizador (normalizing flow), lo que permite generar espectrogramas en paralelo y evitar los problemas de alineación y latencia propios de los modelos autorregresivos tipo Tacotron. El modelo se exporta a ONNX para su ejecución con `phoonnx`, lo que facilita el despliegue en CPU y en entornos sin dependencias de frameworks de deep learning pesados.

No se dispone de información sobre el dataset de entrenamiento, el número de tokens o horas de audio, la composición del corpus, ni si se aplicaron técnicas de fine-tuning o adaptación de estilo. Tampoco se documentan innovaciones técnicas adicionales más allá de las propias de GlowTTS y de la conversión a ONNX. Cualquier afirmación sobre calidad acústica o naturalidad requeriría una evaluación empírica que no está publicada.

## Capacidades

- Síntesis de voz (text-to-speech) en inglés estadounidense a partir de texto de entrada.
- Generación de audio con una voz femenina identificada como "kathleen".
- Inferencia mediante la librería `phoonnx` y el runtime ONNX.
- Integración en pipelines de voz del ecosistema Larynx/phoonnx mediante el voice id `larynx/en-us-kathleen-glow_tts`.
- No se documenta soporte de tool calling, agentes, razonamiento multi-paso, visión, audio de entrada ni modo thinking; son capacidades ajenas al propósito del modelo.
- No se documenta soporte multilingüe más allá del inglés estadounidense.

## Casos de uso

- Lectura de textos en inglés en asistentes de voz: el modelo convierte cadenas de texto en audio en en-US, adecuado para respuestas habladas de un asistente o chatbot cuando se usa el stack phoonnx.
- Generación de avisos y locuciones para aplicaciones: mensajes de sistema, notificaciones o anuncios pregrabados en inglés estadounidense, con un modelo ligero (0,1 GB) que cabe en despliegues modestos.
- Accesibilidad: conversión de contenido escrito a voz para lectores de pantalla o interfaces de accesibilidad en inglés, ejecutando la inferencia en CPU mediante ONNX.
- Prototipado de productos de voz: al ser un checkpoint ONNX de pequeño tamaño, permite validar rápidamente una integración TTS antes de invertir en modelos de mayor calidad o en servicios en la nube.
- Síntesis por lotes de contenido educativo o de documentación: generación de narraciones en inglés para cursos, tutoriales o artículos, siempre que la licencia final se aclare antes de un uso comercial.
- Pruebas de integración en pipelines de phoonnx: sirve como voz de referencia para validar el motor, comparar latencias o comprobar el enrutado por voice id en un sistema multi-voz.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible; por el tamaño del repositorio (0,1 GB) y el formato ONNX, es plausible su ejecución en CPU sin GPU dedicada, aunque no hay cifras oficiales.
- GPU recomendadas: no disponible. Un modelo de este tamaño no requiere GPU de datacenter; cualquier GPU consumer moderna sería suficiente en principio, pero no hay datos publicados.
- Compatibilidad con GPU consumer: previsiblemente sí (RTX 3060, RTX 4090, etc.), sin confirmación oficial.
- Opciones de despliegue: `phoonnx` con runtime ONNX; no se documenta soporte de vLLM, llama.cpp, Ollama ni TGI, que no son aplicables a un modelo TTS de este tipo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Idioma | Formato | Licencia | Contexto/entrada | Disponibilidad |
|---|---|---|---|---|---|---|
| glowtts-en-us-kathleen (Phoonnx) | TTS GlowTTS | en-US | ONNX | other (sin especificar) | texto | Hugging Face, 0 descargas |
| Otras voces de Phoonnx/phoonnx-glowtts | TTS GlowTTS | varias (segun carpeta) | ONNX | other | texto | mismo repositorio agregado |
| Piper (voces ONNX) | TTS VITS | multilingue | ONNX | MIT (segun voces) | texto | ampliamente desplegado |
| Coqui TTS / XTTS | TTS neuronal | multilingue | varios | varias (MPL, CPML) | texto | Hugging Face / GitHub |

La comparación con Piper y Coqui es orientativa por categoría (TTS ligero), no por resultados medidos, ya que no hay benchmarks publicados para este checkpoint. La diferencia principal frente a alternativas es la licencia ambigua y la ausencia de métricas.

## Limitaciones y advertencias

- Licencia "other" sin texto de licencia asociado: no se puede asumir uso comercial sin aclaración previa con el autor.
- Sin métricas de calidad publicadas (MOS, inteligibilidad, naturalidad); la calidad acústica no está validada de forma independiente.
- Alcance limitado a una única voz y a inglés estadounidense; no hay soporte multilingüe documentado.
- Documentación mínima: no se detallan datos de entrenamiento, sesgos del corpus ni condiciones de grabación.
- Riesgo de artefactos o errores de pronunciación en nombres propios, siglas y terminología técnica, inherente a los modelos TTS sin evaluación específica.
- Sin garantías de mantenimiento: el repositorio registra 0 descargas y 0 likes, y no hay evidencia de soporte activo.
- No apto para clonación de voz ni para identificación biométrica; su uso previsto es la síntesis a partir de texto.
- Posibles sesgos de género y acento derivados de la voz única y del corpus de entrenamiento no documentado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Phoonnx/glowtts-en-us-kathleen
- Repositorio agregado de voces: https://huggingface.co/Phoonnx/phoonnx-glowtts
- Librería phoonnx: https://github.com/TigreGotico/phoonnx
