# Laking22/babble-voices

## Resumen

Babble voices es una colección de paquetes de voces (voice packs) para Babble, una aplicación de síntesis de voz. El repositorio, publicado por el usuario Laking22, contiene un conjunto de ocho voces obtenidas mediante ajuste fino (fine-tuning) del modelo Qwen3-TTS-12Hz-1.7B-Base sobre grabaciones de dominio público de LibriVox. No se trata, por tanto, de un modelo base nuevo, sino de un artefacto derivado orientado a la clonación y reproducción de voces concretas de narradores de audiolibros.

El modelo subyacente, Qwen3-TTS-12Hz-1.7B-Base, pertenece a la familia Qwen3-TTS de Alibaba, con aproximadamente 1.700 millones de parámetros y una arquitectura de síntesis de voz basada en representaciones a 12 Hz. El repositorio ocupa 2,7 GB y se distribuye bajo licencia Apache 2.0, lo que permite uso comercial con atribución.

Su relevancia es limitada pero específica: ofrece un formato empaquetado (`.narrator-pack`) que la aplicación Babble consume directamente para listar, previsualizar e instalar voces. Es útil para quienes quieran integrar narradores de LibriVox en flujos de audiolibro o probar el pipeline de voces de Babble, pero no constituye una contribución técnica original en términos de arquitectura o entrenamiento.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Text-to-speech basada en Qwen3-TTS-12Hz (representaciones a 12 Hz); detalles internos no disponibles |
| Parámetros totales | 1,7 B (heredados del modelo base Qwen3-TTS-12Hz-1.7B-Base) |
| Parámetros activos | no disponible (no consta que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible (las grabaciones de LibriVox son en inglés, pero no se especifica el soporte multilingüe del modelo) |
| Licencia | Apache 2.0 |
| Formato de pesos | no disponible; el paquete se distribuye como `.narrator-pack` (2,7 GB) |

## Arquitectura y entrenamiento

El modelo se construye mediante ajuste fino del checkpoint Qwen3-TTS-12Hz-1.7B-Base, un modelo de síntesis de voz de la familia Qwen3-TTS. La denominación "12Hz" hace referencia a la frecuencia de las representaciones acústicas intermedias utilizadas por el modelo base, si bien no se detalla en la información disponible la arquitectura interna (encoder de texto, decoder acústico, vocoder, etc.).

El entrenamiento se realizó sobre grabaciones de dominio público de LibriVox correspondientes a ocho narradores: David Clarke, Ruth Golding, Elizabeth Klett, Mark Nelson, Mil Nicholson, Cori Samuel, Mark F. Smith y Helen Taylor. No se especifican el número de horas de audio, la composición exacta del dataset, ni si se aplicaron técnicas de RLHF, DPO o similares. Tampoco se documentan innovaciones técnicas propias más allá del empaquetado en formato `.narrator-pack` que consume la aplicación Babble.

## Capacidades

- Síntesis de voz (text-to-speech) a partir de texto, con ocho voces de narrador preajustadas.
- Reproducción de voces concretas de narradores de LibriVox (clonación de estilo y timbre).
- Previsualización de cada voz dentro de la aplicación Babble (Library → Available).
- Instalación y descarga de paquetes de voz desde la propia aplicación.
- Integración con el catálogo de voces de Babble mediante `catalog.json`.
- Capacidades multilingües: no disponibles (las voces se entrenaron con grabaciones en inglés).
- Tool calling, agentes, razonamiento o visión: no disponibles (no es un modelo de lenguaje general).

## Casos de uso

- Producción de audiolibros: las ocho voces permiten narrar textos largos con timbres consistentes, aprovechando el ajuste fino sobre narradores profesionales de LibriVox.
- Pruebas de la aplicación Babble: sirve para validar el flujo de listado, previsualización e instalación de voice packs en Library → Available.
- Prototipado de asistentes de lectura: integración de una voz de narrador concreta en aplicaciones de lectura por voz para personas con discapacidad visual.
- Generación de contenido educativo: narración de materiales didácticos con una voz estable y reconocible.
- Doblaje y postproducción de bajo coste: sustitución de locuciones en vídeos o pódcast con voces de dominio público.
- Investigación en TTS: base para experimentos de clonación de voz y evaluación de calidad con hablantes de referencia conocidos.
- Demostraciones y benchmarking de pipelines TTS: comparación de la salida de Qwen3-TTS frente a otros motores usando voces fijas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; con 1,7 B de parámetros, una estimación orientativa en FP16 rondaría los 3,4 GB de pesos, a lo que habría que sumar el vocoder y las activaciones (cifra no confirmada por el autor).
- GPU recomendadas: no disponibles; por tamaño, cabría esperar funcionamiento en GPU consumer de gama media-alta (RTX 3060/4060 en adelante), aunque no está documentado.
- ¿Cabe en GPU consumer? Probablemente sí, dado el tamaño del modelo base, pero no hay confirmación en la información disponible.
- Opciones de despliegue: la aplicación Babble (repositorio GitHub) es el canal previsto; no se documentan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Laking22/babble-voices | 1,7 B (base Qwen3-TTS) | no disponible | Apache 2.0 | Hugging Face (0 descargas) | Voice packs para Babble; 8 voces LibriVox |
| Qwen/Qwen3-TTS-12Hz-1.7B-Base | 1,7 B | no disponible | no disponible en esta ficha | Hugging Face | Modelo base sin ajuste de voces |
| Otros modelos TTS de tamaño similar | no disponible | no disponible | no disponible | no disponible | No se dispone de datos comparables en la información proporcionada |

## Limitaciones y advertencias

- Sesgos conocidos: las voces provienen de un conjunto reducido de narradores de LibriVox, lo que limita la diversidad de acentos, edades y géneros.
- Riesgo de alucinación: en TTS se traduce en posibles artefactos, prosodia incorrecta o pronunciaciones erróneas; no hay evaluación publicada.
- Limitaciones de contexto o idioma: no se documenta el soporte multilingüe; las grabaciones de entrenamiento son en inglés.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero deben respetarse las condiciones de la licencia del modelo base Qwen3-TTS y los términos de las grabaciones de LibriVox (dominio público).
- Caveats para producción: repositorio con 0 descargas y 0 likes, sin benchmarks ni documentación técnica detallada; el formato `.narrator-pack` está atado a la aplicación Babble.
- El modelo base referenciado (Qwen3-TTS-12Hz-1.7B-Base) no está descrito en detalle en la información disponible, por lo que las capacidades exactas heredadas no pueden confirmarse.

## Enlaces

- Hugging Face: https://huggingface.co/Laking22/babble-voices
- Repositorio GitHub de Babble voices: https://github.com/Laking22/babble-voices
- Catálogo de voces: https://github.com/Laking22/babble-voices/blob/main/catalog.json
- Modelo base: https://huggingface.co/Qwen/Qwen3-TTS-12Hz-1.7B-Base
