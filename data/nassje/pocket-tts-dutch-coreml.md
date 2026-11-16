# Nassje/pocket-tts-dutch-coreml

## Resumen

Pocket TTS Dutch Core ML es una conversión del modelo de síntesis de voz Pocket TTS de Kyutai al formato Core ML de Apple, orientada a la inferencia local en dispositivos iPhone, iPad y Mac. Lo desarrolla Nassje, que parte de los pesos originales de Kyutai (versión 4.0.1) y aplica los scripts de conversión de FluidInference para empaquetar el modelo con la misma estructura de "packs de idioma" que usa el proyecto pocket-tts-coreml (v2.1). El resultado es un modelo de texto a voz en neerlandés que se ejecuta íntegramente en el dispositivo, sin depender de servicios en la nube.

El modelo no ha sido entrenado ni ajustado: los pesos, el tokenizador y la voz son los de Kyutai. La aportación de esta ficha es exclusivamente la conversión a Core ML y la reorganización de los artefactos (tokenizador en formato SentencePiece, embeddings y voz empaquetados en un directorio de constantes). Está pensado para integrarse en la aplicación Brisk, que lo descarga para leer neerlandés en voz alta en local.

Por su naturaleza, es relevante para desarrolladores de aplicaciones iOS/macOS que necesiten TTS en neerlandés con privacidad por diseño (todo el procesado ocurre en el dispositivo) y sin coste por llamada a API. El repositorio ocupa 0,4 GB y la licencia es CC BY 4.0, la misma que el modelo base.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | No disponible (modelo base Pocket TTS de Kyutai; incluye un language model de 6 capas, un flow decoder y un decoder de audio Mimi) |
| Parámetros totales | No disponible |
| Parámetros activos | No aplica (no se indica que sea MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | Pesos en 16 bits (language model y flow decoder) y 32 bits (sound decoder); no se documentan otras cuantizaciones |
| Idiomas soportados | Neerlandés (nl) |
| Licencia | CC BY 4.0 |
| Formato de pesos | Core ML (`.mlmodelc`), más `constants_bin/` y `files.json` con tamaños y SHA-256 |

## Arquitectura y entrenamiento

El modelo base es Pocket TTS de Kyutai, del que esta conversión hereda la arquitectura completa: un language model de 6 capas que se ejecuta una vez cada 80 ms de audio, un flow decoder que convierte la salida del language model en tramas de sonido y un decoder Mimi que transforma esas tramas en muestras de audio. La conversión a Core ML mantiene el language model y el flow decoder en 16 bits y el sound decoder en 32 bits, y reescribe el tokenizador desde `tokenizer.json` al formato `tokenizer.model` de SentencePiece.

No se ha realizado ningún entrenamiento ni ajuste fino sobre esta versión: los pesos son los de Kyutai. La voz incluida, `daan`, procede de una grabación de un hablante neerlandés (identificador 11290) del dataset CML-TTS, con licencia CC BY 4.0. La conversión se ha hecho con los scripts de FluidInference (repositorio mobius) y sigue el diseño de packs de idioma de pocket-tts-coreml v2.1.

## Capacidades

- Síntesis de voz (text-to-speech) en neerlandés a partir de texto de entrada.
- Ejecución local en iPhone, iPad y Mac mediante Core ML, sin conexión a servicios externos.
- Voz predefinida `daan` incluida en el paquete de constantes; no se documenta clonación de voz ni selección de otras voces.
- Generación de audio por tramas de 80 ms mediante el language model y el flow decoder.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso, visión, audio de entrada ni modo thinking.
- Capacidad multilingüe limitada al neerlandés; no se indica soporte de otros idiomas.

## Casos de uso

- Lectura en voz alta dentro de aplicaciones iOS/macOS: la app Brisk descarga el paquete y reproduce texto neerlandés en el dispositivo, lo que evita enviar contenido del usuario a servidores externos.
- Accesibilidad para usuarios neerlandeses con discapacidad visual: integración en lectores de pantalla o apps de lectura que necesiten TTS local y de baja latencia.
- Aprendizaje de neerlandés: reproducción de frases y textos de práctica con una voz nativa, sin coste por petición y con funcionamiento offline.
- Asistentes de voz embebidos: un language model que se ejecuta cada 80 ms encaja en pipelines de respuesta de voz de baja latencia en apps móviles.
- Privacidad por diseño en sectores regulados: al ejecutarse íntegramente en el dispositivo, el audio y el texto no salen del terminal, lo que facilita el cumplimiento de requisitos de tratamiento de datos.
- Prototipado rápido de funciones de voz en apps Apple: el formato Core ML y la estructura de packs de idioma de pocket-tts-coreml permiten integrar el modelo con los scripts de conversión de FluidInference.
- Distribución de contenido educativo o editorial en neerlandés: generación de audiolibros o resúmenes hablados sin depender de APIs de terceros.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM: no disponible; el modelo está pensado para ejecución en dispositivo Apple con Core ML, no para GPU de escritorio con CUDA.
- GPU recomendadas: no aplica en el sentido habitual; el destino son los chips Apple (iPhone, iPad, Mac) con soporte Core ML.
- Cabe en hardware de consumo: sí, en dispositivos Apple compatibles con Core ML; el repositorio ocupa 0,4 GB, aunque el consumo en memoria durante la inferencia no se documenta.
- Opciones de despliegue: Core ML en iOS/iPadOS/macOS; la app Brisk como ejemplo de integración. No se documentan vLLM, llama.cpp, Ollama ni TGI, que no son aplicables a este formato.
- Latencia y throughput: no disponibles; el language model se ejecuta una vez por cada 80 ms de audio generado, pero no se publican cifras de latencia real.

## Comparativa con modelos similares

| Modelo | Idioma | Formato | Licencia | Contexto / arquitectura | Disponibilidad |
|---|---|---|---|---|---|
| Nassje/pocket-tts-dutch-coreml | Neerlandés | Core ML | CC BY 4.0 | No disponible (6 capas en el language model) | Hugging Face |
| kyutai/pocket-tts | No disponible en la información | No disponible | CC BY 4.0 | Modelo base de Kyutai | Hugging Face |
| FluidInference/pocket-tts-coreml | No disponible en la información | Core ML | No disponible en la información | Packs de idioma v2.1 | Hugging Face |

No se dispone de datos de benchmarks ni de otros modelos TTS comparables en la información proporcionada, por lo que la comparación se limita a formato, licencia y disponibilidad.

## Limitaciones y advertencias

- Solo soporta neerlandés; no se documenta cobertura de otros idiomas.
- Una única voz (`daan`); no se indican opciones de selección o clonación de voz.
- Riesgo de alucinación no evaluado: no se publican métricas de fidelidad de la síntesis ni de pronunciación.
- Sesgos: no se documentan análisis de sesgos acústicos o lingüísticos; la voz procede de un único hablante del dataset CML-TTS.
- Licencia CC BY 4.0: permite uso comercial con atribución; es obligatorio citar a Kyutai, a los autores de CML-TTS y a FluidInference según corresponda.
- Restricción ética explícita del autor: no usar el modelo para imitar o clonar la voz de una persona sin su consentimiento explícito y legal.
- Dependencia del ecosistema Apple: el formato Core ML limita su uso a dispositivos y frameworks de Apple.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta; no hay evidencia de uso en producción ni de validación por terceros.
- No se documentan requisitos de memoria en inferencia ni comportamiento en dispositivos de gama baja.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Nassje/pocket-tts-dutch-coreml
- Modelo base Kyutai Pocket TTS: https://huggingface.co/kyutai/pocket-tts
- Packs de idioma de referencia (FluidInference): https://huggingface.co/FluidInference/pocket-tts-coreml
- Scripts de conversión (FluidInference mobius): https://github.com/FluidInference/mobius
- Dataset CML-TTS (OpenSLR 146): https://www.openslr.org/146/
- App Brisk: https://briskapp.pages.dev
