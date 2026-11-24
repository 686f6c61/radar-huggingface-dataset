# loom-ai-org/pocket-tts-18m-loom

## Resumen

Pocket TTS 18M (English) es un modelo de síntesis de voz (text-to-speech) en inglés, destilado por Kyutai a partir de su modelo Pocket TTS y ajustado con recompensa (reward fine-tuning) en la versión de octubre de 2026. El repositorio `loom-ai-org/pocket-tts-18m-loom` no es el modelo original, sino una exportación al formato GGUF propia del ecosistema loom.cpp, generada con loom-exporter y ejecutable mediante la librería `loom-py-rt`. El modelo suma 19.201.969 parámetros reales según los safetensors: un modelo de lenguaje de flujo de 15,6 M de parámetros que opera sobre latentes del códec Mimi y un decodificador de 2,6 M de parámetros.

La arquitectura combina un modelo autorregresivo de flujo sobre latentes de audio con un decodificador neuronal, un esquema habitual en los TTS neuronales modernos que separa la generación de tokens acústicos de su reconstrucción en forma de onda. El modelo codifica el texto por sí mismo, sin fonemizador externo, y lleva una voz integrada (`alba`), además de otras 26 voces disponibles como ficheros separados en el repositorio. Su tamaño reducido (0,3 GB de repositorio) lo hace apto para inferencia en CPU y en GPUs de consumo, lo que resulta relevante para despliegues de locución de baja latencia sin infraestructura dedicada.

La licencia es CC-BY-4.0, heredada del modelo base, aunque cada voz tiene su propia licencia de grabación (dos no comerciales y tres no declaradas por Kyutai), un matiz importante para uso en producción. El modelo está pensado para inglés exclusivamente y prioriza el tamaño sobre la calidad frente al Pocket TTS completo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo de lenguaje de flujo (15,6 M) sobre latentes del códec Mimi + decodificador (2,6 M) |
| Parametros totales | 19.201.969 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | F32 y al menos otra precisión cuantizada (el repo incluye varios ficheros GGUF; no se detallan los esquemas exactos) |
| Idiomas soportados | en (inglés) |
| Licencia | cc-by-4.0 (heredada del modelo base; licencias de voz independientes) |
| Formato de pesos | GGUF (autodescriptivo, con topologías de grafo, tokenizador y driver embebidos) |
| Frecuencia de muestreo | 24.000 Hz (valor que debe pasarse explícitamente) |
| Voces incluidas | 1 integrada (`alba`) + 26 ficheros de voz en `voices/` |
| Modelo base | kyutai/pocket-tts |
| Librería de inferencia | loom-py-rt (PyPI) |
| Tamaño del repositorio | 0,3 GB |

## Arquitectura y entrenamiento

El modelo se organiza en dos componentes: un modelo de flujo de 15,6 M de parámetros que genera latentes acústicos en el espacio del códec Mimi y un decodificador de 2,6 M de parámetros que reconstruye la forma de onda a partir de esos latentes. Esta separación entre modelado acústico y decodificación es típica de los TTS neuronales de última generación y permite optimizar cada parte por separado. El modelo codifica el texto internamente, sin necesidad de fonemizador, lo que simplifica el pipeline de inferencia a una única llamada de texto a audio.

El entrenamiento parte de `kyutai/pocket-tts`, la versión completa de Kyutai, de la que este checkpoint es una destilación de 18 M de parámetros con ajuste por recompensa (reward fine-tuning) en la versión de octubre de 2026. El autor no detalla el volumen de tokens de entrenamiento, la composición del dataset ni la metodología exacta de RLHF. La exportación a loom.cpp conserva los parámetros sin modificar en el fichero F32 y genera el resto de precisiones por cuantización a partir de él. El GGUF es autodescriptivo: incorpora las topologías de grafo, el tokenizador y un script de driver con la documentación de todos los argumentos aceptados, accesible mediante `model.driver_source`.

## Capacidades

- Síntesis de voz en inglés a partir de texto, con salida a 24 kHz.
- Codificación de texto integrada, sin fonemizador ni preprocesado lingüístico externo.
- Generación en streaming: el driver del modelo corta la salida en fragmentos reproducibles a medida que se generan, con acceso a la forma de onda completa vía `stream.exact`.
- Selección de voz mediante el parámetro `voice=`: una voz integrada (`alba`) y 26 voces adicionales empaquetadas como ficheros de estado con huella de los pesos.
- Carga de ficheros de voz propios, siempre que sean compatibles con esta huella de pesos.
- Muestreo estocástico por defecto con temperatura 0,3, por lo que dos llamadas producen resultados distintos.
- API de alto nivel (`model.text2speech.infer` y `model.text2speech.stream`) y acceso directo al driver embebido mediante `model.infer(...)`.
- No soporta clonación de voz: el export no incluye el codificador Mimi necesario para extraer el estado de una grabación nueva.

## Casos de uso

- Locución de artículos y boletines: el modelo convierte texto en audio en inglés con una sola llamada y sin fonemizador, lo que permite integrarlo en pipelines de publicación automatizada de contenido editorial o newsletters en formato audio.
- Lectura de notificaciones y alertas en aplicaciones: con 19,2 M de parámetros y un repositorio de 0,3 GB, puede ejecutarse en el propio dispositivo o en un contenedor pequeño, generando avisos hablados con baja latencia.
- Asistentes de voz para interfaces de accesibilidad: la salida en streaming permite empezar a reproducir audio antes de completar la frase, algo crítico para lectores de pantalla y navegación por voz.
- Prototipado de productos de audio conversacional: la API de alto nivel y el formato GGUF autodescriptivo reducen el trabajo de integración, lo que facilita validar ideas de TTS en cuestión de horas.
- Generación de audio para pruebas de integración: al ser determinista en estructura (aunque no en muestreo) y de tamaño reducido, sirve para poblar entornos de test con audio sintético sin depender de servicios externos.
- Narración de contenido educativo o de documentación técnica: la selección entre 27 voces permite asignar timbres distintos a secciones o roles, siempre que se respeten las licencias de cada grabación.
- Síntesis por lotes en CPU: al no requerir GPU, puede procesar colas de texto a audio en servidores sin acelerador, útil para podcasts generados o resúmenes hablados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita; con 19,2 M de parámetros, el fichero F32 ocupa del orden de decenas de megabytes de pesos y el repositorio completo 0,3 GB, por lo que la inferencia es viable en CPU.
- GPU recomendadas: no disponibles en la información proporcionada; por tamaño, cualquier GPU consumer moderna (RTX 3060 o superior) debería alojarlo con holgura.
- GPU consumer: sí, cabe en cualquier GPU de consumo actual e incluso en inferencia exclusiva por CPU.
- Opciones de despliegue: `loom-py-rt` (PyPI, `pip install -U "loom-py-rt[hub]>=1.0.0"`) sobre el motor loom.cpp; no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Idioma | Contexto | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|---|
| pocket-tts-18m-loom (este) | 19,2 M (15,6 M + 2,6 M) | en | no disponible | CC-BY-4.0 (voces aparte) | GGUF | Hugging Face, loom-py-rt |
| kyutai/pocket-tts (modelo completo) | no disponible | en | no disponible | no disponible | no disponible | Hugging Face |
| Otras destilaciones de Pocket TTS de loom-ai-org | no disponible | en | no disponible | no disponible | GGUF | Hugging Face |

La comparación con alternativas de otros proveedores no está disponible en la información proporcionada. El propio autor sitúa la referencia inmediata en el Pocket TTS completo (`loom-ai-org/pocket-tts-loom`), frente al que este checkpoint intercambia calidad por tamaño.

## Limitaciones y advertencias

- Modelo destilado: sacrifica calidad frente al Pocket TTS completo de Kyutai, según reconoce el propio autor.
- Solo inglés; no hay soporte multilingüe declarado.
- Restricciones de uso de Kyutai: se prohíbe la suplantación o clonación de voz sin consentimiento explícito y lícito, y presentar el audio generado como grabación genuina de una persona real. Estas restricciones viajan con los pesos.
- Licencias de voz heterogéneas: `cosette` y `jean` son CC-BY-NC-4.0 (no comercial); `daan`, `juergen` y `rafael` no tienen licencia declarada por Kyutai. Las voces CC-BY requieren atribución al dataset o hablante de origen.
- Sin clonación de voz: el export no incluye el codificador Mimi, por lo que no se puede extraer el estado de una grabación nueva.
- Muestreo estocástico por defecto (temperatura 0,3): la salida no es reproducible entre llamadas.
- La frecuencia de muestreo (24 kHz) debe pasarse manualmente; un valor incorrecto no produce error, sino reproducción a velocidad equivocada.
- Riesgo de alucinación acústica y errores de pronunciación inherentes a un modelo de 18 M, no cuantificados en la información disponible.
- No se documentan sesgos específicos del modelo ni métricas de calidad objetivas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/loom-ai-org/pocket-tts-18m-loom
- Modelo base: https://huggingface.co/kyutai/pocket-tts
- Versión completa exportada: https://huggingface.co/loom-ai-org/pocket-tts-loom
- Repositorio loom.cpp: https://github.com/loom-ai-org/loom.cpp
- Exportador loom-exporter: https://github.com/loom-ai-org/loom-exporter
- Librería loom-py: https://github.com/loom-ai-org/loom-py
- Voces de Kyutai: https://huggingface.co/kyutai/tts-voices
