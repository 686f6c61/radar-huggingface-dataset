# Phoonnx/styletts2-hitz-eu-emo-styletts2

## Resumen

StyleTTS2 HiTZ Basque (emotion) es un modelo de síntesis de voz (text-to-speech) derivado del repositorio agregador `Phoonnx/phoonnx-styletts2`, concretamente de la carpeta `hitz-eu-emo-styletts2`. Lo publica el usuario Phoonnx como un artefacto empaquetado para la librería `phoonnx`, una herramienta de inferencia TTS basada en ONNX mantenida por TigreGotico. El modelo procede originalmente del trabajo de HiTZ (Centro Vasco de Tecnología del Lenguaje) sobre StyleTTS2 para euskera, con variantes de emoción.

El modelo resuelve la generación de voz sintética en euskera con control de emoción, algo poco habitual en el ecosistema TTS abierto, donde la mayoría de modelos se centran en inglés o en grandes lenguas europeas. Su relevancia radica en que ofrece seis voces identificables (dos hablantes, `antton` y `maider`, cada uno con tres emociones: `happy`, `neutral` y `sad`) bajo licencia Apache-2.0, lo que facilita su integración en productos comerciales sin restricciones adicionales.

La información pública disponible es escasa: no se detallan parámetros, contexto ni datos de entrenamiento en la model card. El repositorio ocupa 0,3 GB y los pesos están en formato ONNX, lo que indica que está pensado para inferencia optimizada más que para reentrenamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | StyleTTS2 (no se detalla la variante concreta en la informacion disponible) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo TTS, no de texto) |
| Tipos de cuantizacion | no disponible (pesos ONNX; se desconoce si hay variantes cuantizadas) |
| Idiomas soportados | euskera (eu), segun el identificador de las voces |
| Licencia | Apache-2.0 |
| Formato de pesos | ONNX |

## Arquitectura y entrenamiento

El modelo se basa en StyleTTS2, una arquitectura de síntesis de voz que combina un generador estilo diffusion con un discriminador basado en modelos de lenguaje y un módulo de estilo para controlar prosodia y timbre. StyleTTS2 es conocida por acercarse a la calidad de voz humana en benchmarks como LJSpeech, y por permitir transferencia de estilo y control de emoción mediante vectores de estilo. En esta variante, las emociones (`happy`, `neutral`, `sad`) están predefinidas como voces separadas, lo que sugiere que el estilo se ha fijado por hablante y emoción en lugar de exponerse como un vector ajustable en tiempo de inferencia.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o ajuste fino con preferencias. El origen es el trabajo de HiTZ sobre euskera, pero la model card no incluye detalles del corpus (horas de audio, número de hablantes, condiciones de grabación). La empaquetación para `phoonnx` implica que los pesos se han convertido a ONNX y se han organizado por rutas de voz, probablemente con un modelo acústico compartido y estilos por voz.

## Capacidades

- Síntesis de voz en euskera a partir de texto.
- Control de emoción mediante selección de voz: `happy`, `neutral` y `sad`.
- Dos hablantes diferenciados: `antton` (voz masculina) y `maider` (voz femenina).
- Inferencia mediante ONNX, lo que permite ejecución en CPU y GPU con runtime estándar.
- Integración con la librería `phoonnx`, que gestiona la carga de voces por identificador.
- No se documentan capacidades de clonación de voz, control de prosodia fino ni multilingüismo.
- No se documenta soporte de tool calling ni de agentes (no aplica a un modelo TTS).

## Casos de uso

- **Lectura de contenido en euskera para accesibilidad**: convertir artículos, noticias o documentos en audio para personas con discapacidad visual o dificultades de lectura, usando la voz `neutral` para un tono informativo.
- **Asistentes de voz y altavoces inteligentes en euskera**: integrar el modelo en un asistente doméstico que responda con voz natural; la variante `happy` puede usarse para confirmaciones y la `sad` para avisos o errores.
- **Audiolibros y narración**: generar narraciones con cambios de emoción según el pasaje (alegre para escenas cómicas, triste para dramáticas), aprovechando las tres variantes por hablante.
- **Aprendizaje de euskera**: producir ejemplos de pronunciación con distintas entonaciones emocionales para estudiantes, comparando la misma frase en `happy`, `neutral` y `sad`.
- **Sistemas de atención al cliente telefónica**: respuestas pregrabadas dinámicas en euskera para menús IVR, con voz `neutral` para información y `happy` para bienvenidas.
- **Locución para vídeos y presentaciones**: generar pistas de voz para contenido formativo o corporativo en euskera sin depender de un locutor humano, con la posibilidad de alternar hablantes.
- **Prototipado de interfaces conversacionales**: usar el modelo en entornos de desarrollo para validar flujos de voz antes de contratar grabaciones profesionales, gracias a la licencia Apache-2.0 y al formato ONNX.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- **VRAM estimada**: no disponible con precisión; el repositorio completo ocupa 0,3 GB, por lo que la inferencia en FP32 requeriría del orden de 1 GB o menos de memoria, y menos aún si se aplican optimizaciones ONNX.
- **GPU recomendadas**: cualquier GPU con al menos 2 GB de VRAM es suficiente para un modelo de este tamaño; una RTX 3060, RTX 4090, A100 o H100 funcionarían sin problema, aunque el modelo es lo bastante pequeño para no necesitarlas.
- **Consumer GPU**: sí, cabe en GPUs de gama baja e incluso en iGPU con soporte ONNX.
- **CPU**: la inferencia en CPU es viable gracias a ONNX Runtime; para producción se recomienda al menos 4 núcleos.
- **Opciones de despliegue**: `phoonnx` (librería nativa), ONNX Runtime (Python, C++, C#), y potencialmente servidores compatibles con ONNX como Triton. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no están orientados a TTS.
- **Latencia y throughput**: no disponibles en la información proporcionada; dependerán de la longitud del texto y del hardware.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| StyleTTS2 HiTZ Basque (emotion) | no disponible | no aplica | euskera | Apache-2.0 | ONNX |
| StyleTTS2 original (yl4579) | no disponible | no aplica | inglés | MIT | PyTorch |
| XTTS-v2 (Coqui) | no disponible | no aplica | multilingüe (17) | Coqui Public Model License (no comercial) | PyTorch |
| Piper (rhasspy) | variable por voz | no aplica | multilingüe | MIT (mayoría de voces) | ONNX |

La comparativa es limitada porque no se dispone de especificaciones detalladas del modelo HiTZ. Frente a StyleTTS2 original, la variante vasca añade soporte de euskera y emociones predefinidas, pero carece de la flexibilidad de estilo del original. Frente a XTTS-v2, ofrece licencia Apache-2.0 (más permisiva para uso comercial) pero solo cubre euskera. Frente a Piper, comparte el formato ONNX y la orientación a producción, aunque Piper está más orientado a voces ligeras y este modelo a calidad con emoción.

## Limitaciones y advertencias

- **Idioma único**: solo euskera; no se documenta soporte para castellano ni otras lenguas.
- **Emociones fijas**: las tres emociones están predefinidas por voz; no hay control continuo de prosodia ni mezcla de estilos.
- **Sesgos**: no se documentan sesgos, pero al derivar de un corpus limitado de dos hablantes, la diversidad de acentos y registros es reducida.
- **Alucinación**: en TTS se traduce en artefactos de pronunciación o entonación en textos fuera de dominio (nombres propios, siglas, palabras extranjeras).
- **Licencia**: Apache-2.0 permite uso comercial, pero conviene verificar la procedencia del corpus original de HiTZ por si hubiera restricciones adicionales no reflejadas en la model card.
- **Producción**: la model card es mínima; no hay información sobre calidad objetiva (MOS), robustez ante ruido en el texto ni comportamiento con textos muy largos. Se recomienda evaluar con un conjunto propio antes de desplegar.
- **Mantenimiento**: el repositorio tiene 0 descargas y 0 likes, y fue creado en 2026; es un artefacto reciente y sin validación comunitaria.

## Enlaces

- [Hugging Face: Phoonnx/styletts2-hitz-eu-emo-styletts2](https://huggingface.co/Phoonnx/styletts2-hitz-eu-emo-styletts2)
- [Repositorio origen: Phoonnx/phoonnx-styletts2](https://huggingface.co/Phoonnx/phoonnx-styletts2)
- [Librería phoonnx (GitHub)](https://github.com/TigreGotico/phoonnx)
- [StyleTTS2 original (GitHub)](https://github.com/yl4579/StyleTTS2)
