# Phoonnx/vits-is_is-rosa_female_monospeaker-graphemes

## Resumen

vits-is_is-rosa_female_monospeaker-graphemes es un modelo de síntesis de voz (text-to-speech) basado en la arquitectura VITS, desarrollado originalmente por Sigurdur y empaquetado por Phoonnx para su librería ONNX de TTS. El modelo genera voz femenina en islandés (is-IS) a partir de texto plano, utilizando una entrada basada en grafemas (caracteres) en lugar de fonemas, lo que simplifica el front-end de texto.

El modelo resuelve la necesidad de voces TTS de calidad para islandés, un idioma con pocos recursos en el ecosistema de síntesis de voz. Al estar empaquetado en formato ONNX y distribuido a través de phoonnx, se puede integrar tanto en aplicaciones Python como en el asistente de voz OVOS mediante el plugin ovos-tts-plugin-phoonnx. Es relevante para proyectos de código abierto que necesiten TTS en islandés sin depender de servicios en la nube.

El repositorio ocupa aproximadamente 0,1 GB, lo que indica un modelo compacto adecuado para despliegue en entornos con recursos limitados. La licencia MIT facilita su uso comercial y su integración en productos derivados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VITS (end-to-end TTS) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo TTS, no de contexto textual) |
| Tipos de cuantizacion | no disponible (pesos en ONNX) |
| Idiomas soportados | islandés (is-IS) |
| Licencia | MIT |
| Formato de pesos | ONNX |

## Arquitectura y entrenamiento

VITS (Variational Inference with adversarial learning for end-to-end Text-to-Speech) es una arquitectura de síntesis de voz condicional variacional que combina un codificador de texto, un prior basado en alineamiento monotónico y un decodificador generativo adversarial. El modelo produce waveforms directamente a partir de la secuencia de entrada, sin necesidad de un vocoder separado. En este caso, la entrada es a nivel de grafemas, procesada por el `GraphemePhonemizer` de la librería scriptconv.

No se dispone de información sobre el volumen de datos de entrenamiento, la composición del dataset, ni si se aplicaron técnicas de RLHF o ajuste fino adicional. El modelo original fue publicado por Sigurdur en Hugging Face y posteriormente empaquetado por Phoonnx para su ejecución en ONNX. La voz es femenina, monocanal y monocablante (monospeaker).

## Capacidades

- Síntesis de voz femenina en islandés (is-IS) a partir de texto plano.
- Entrada basada en grafemas (caracteres), sin necesidad de transcripción fonética manual.
- Generación de audio en formato WAV mediante la API de phoonnx.
- Integración con el asistente de voz OVOS a través de `ovos-tts-plugin-phoonnx`.
- Ejecución en ONNX Runtime, lo que permite despliegue en CPU y GPU.
- Normalización y conversión de texto gestionada por scriptconv.
- No soporta tool calling, agentes, visión ni otras capacidades multimodales (es un modelo exclusivamente TTS).

## Casos de uso

- **Asistente de voz en islandés con OVOS**: el modelo se integra como plugin TTS en OVOS mediante `ovos-tts-plugin-phoonnx`, permitiendo respuestas habladas en islandés en asistentes domésticos de código abierto.
- **Accesibilidad y lectura de textos**: conversión de documentos, artículos o notificaciones a audio en islandés para personas con discapacidad visual o dificultades de lectura.
- **Sistemas de anuncios automatizados**: generación de avisos hablados en islandés para transporte público, aeropuertos o comercios, usando la API de phoonnx para sintetizar frases dinámicas.
- **Aplicaciones educativas de aprendizaje de islandés**: producción de audio de pronunciación para herramientas de aprendizaje de idiomas, aprovechando la voz femenina nativa.
- **Prototipado de interfaces conversacionales**: integración en chatbots o IVR en islandés para pruebas de concepto, gracias a la licencia MIT y al reducido tamaño del modelo (0,1 GB).
- **Generación de contenido audiovisual**: narración de vídeos, pódcast o audiolibros en islandés con una voz consistente y monocablante.
- **Investigación en TTS de bajos recursos**: el modelo sirve como referencia para experimentos con VITS en idiomas con pocos datos, al ser un checkpoint abierto y empaquetado en ONNX.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- **VRAM estimada**: no disponible con precisión; el repositorio ocupa 0,1 GB, por lo que la inferencia en FP32 requeriría previsiblemente menos de 1 GB de VRAM, aunque no se confirma en la información proporcionada.
- **GPU recomendadas**: cualquier GPU con soporte ONNX Runtime (por ejemplo, NVIDIA GTX 1060 o superior, RTX 3060, RTX 4090, A100, H100); el modelo es lo suficientemente pequeño para ejecutarse en GPU de gama baja.
- **Consumer GPU**: sí, cabe en GPUs de consumo e incluso es viable en CPU gracias al formato ONNX y al tamaño reducido.
- **Opciones de despliegue**: phoonnx (Python), ONNX Runtime, plugin `ovos-tts-plugin-phoonnx` para OVOS. No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a modelos TTS.
- **Latencia y throughput**: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Arquitectura | Idioma | Licencia | Formato | Tamaño repo |
|---|---|---|---|---|---|
| vits-is_is-rosa_female_monospeaker-graphemes (este) | VITS | islandés (is-IS) | MIT | ONNX | 0,1 GB |
| Sigurdur/vits_icelandic_rosa_female_monospeaker | VITS | islandés (is-IS) | no disponible | no disponible | no disponible |
| Otros modelos VITS empaquetados por Phoonnx (colección VITS) | VITS | varios | MIT (según modelo) | ONNX | variable |

La comparativa con alternativas de otros desarrolladores para islandés no está disponible en la información proporcionada. El modelo upstream de Sigurdur es la referencia directa, del cual este es un empaquetado para phoonnx.

## Limitaciones y advertencias

- **Idioma único**: solo soporta islandés (is-IS); no es multilingüe y producirá resultados incorrectos con texto en otros idiomas.
- **Monocablante y voz femenina**: no ofrece variedad de voces ni control de estilo o emoción.
- **Riesgo de alucinación acústica**: como todo modelo generativo TTS, puede producir artefactos, pronunciaciones incorrectas o ruido en entradas fuera de distribución.
- **Entrada por grafemas**: al no usar fonemas, la pronunciación depende de la correspondencia grafema-sonido aprendida; palabras extranjeras, siglas o números pueden sintetizarse de forma incorrecta.
- **Sin datos de benchmarks**: no hay métricas publicadas de calidad (MOS, WER) en la información disponible, lo que dificulta evaluar su rendimiento frente a alternativas.
- **Licencia MIT**: permite uso comercial, pero se recomienda verificar los términos del modelo upstream de Sigurdur, ya que la model card indica que "the upstream release states its terms".
- **Dependencia de phoonnx y scriptconv**: el uso práctico requiere estas librerías, lo que añade dependencias al despliegue.
- **Fecha de creación futura**: el repositorio figura creado en 2026-11-14, lo que puede indicar metadatos inconsistentes; conviene verificar la vigencia del paquete.

## Enlaces

- Hugging Face: https://huggingface.co/Phoonnx/vits-is_is-rosa_female_monospeaker-graphemes
- Modelo upstream: https://huggingface.co/Sigurdur/vits_icelandic_rosa_female_monospeaker
- Repositorio phoonnx: https://github.com/TigreGotico/phoonnx
- Repositorio scriptconv: https://github.com/TigreGotico/scriptconv
- Colección VITS de Phoonnx: https://huggingface.co/collections/Phoonnx/vits-6af8ea9ae9adb8b94ec31a65
