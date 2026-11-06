# goaicorp/moore-tts-pocket

## Resumen

Moore TTS Pocket es un modelo de síntesis de voz (text-to-speech) desarrollado por goaicorp, un fine-tune del modelo base kyutai/pocket-tts especializado en el idioma mooré (mos), una lengua gur hablada principalmente en Burkina Faso por varios millones de personas. El modelo aborda el problema de la baja representación de lenguas africanas de bajos recursos en los sistemas TTS modernos, ofreciendo una alternativa específica para mooré frente a los sistemas multilingües genéricos que suelen tener un rendimiento deficiente en estas lenguas.

Con aproximadamente 109,5 millones de parámetros y un tamaño de repositorio de 0,4 GB, se trata de un modelo compacto derivado de la arquitectura Pocket TTS de Kyutai, pensada para inferencia ligera. La información disponible no detalla la arquitectura interna exacta del modelo base más allá de su naturaleza TTS, pero el tamaño reducido sugiere un diseño optimizado para despliegue en entornos con recursos limitados.

El modelo se publica bajo licencia CC-BY-4.0 con acceso restringido (gated) en Hugging Face, lo que requiere aceptar condiciones antes de su descarga. Su relevancia radica en la escasez de recursos TTS de calidad para lenguas africanas de bajos recursos y en la inclusión de capacidades de clonación de voz según las etiquetas del repositorio.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | TTS basada en kyutai/pocket-tts (detalles internos no disponibles) |
| Parámetros totales | 109.502.146 |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible |
| Idiomas soportados | mooré (mos) |
| Licencia | CC-BY-4.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un fine-tune del checkpoint kyutai/pocket-tts, un sistema TTS de Kyutai. La información proporcionada no especifica la arquitectura interna del modelo base (si emplea un transformer, un modelo acústico basado en difusión, un codec neural o una combinación), ni los detalles del proceso de entrenamiento del fine-tune: número de horas de audio en mooré, composición del dataset, si se aplicaron técnicas de alineación o ajuste fino supervisado, ni la metodología de clonación de voz.

Las etiquetas del repositorio indican capacidades de clonación de voz (voice-cloning) y el carácter de recurso de bajos recursos (low-resource) del idioma objetivo. El tamaño de 109,5 millones de parámetros y 0,4 GB de repositorio apunta a un modelo ligero, coherente con la filosofía "pocket" del modelo base, orientada a inferencia eficiente. No se dispone de información sobre la composición del corpus de entrenamiento ni sobre posibles innovaciones técnicas específicas del fine-tune.

## Capacidades

- Síntesis de voz a partir de texto en mooré (mos).
- Clonación de voz, según las etiquetas del repositorio (voice-cloning).
- Modelo especializado en un único idioma de bajos recursos, lo que implica un enfoque narrow frente a sistemas TTS multilingües.
- No se dispone de información sobre soporte de tool calling, agentes, razonamiento multi-paso ni otras capacidades más allá de la síntesis de voz.
- No se dispone de información sobre modos especiales (thinking mode, visión, audio de entrada, etc.).

## Casos de uso

- Accesibilidad para hablantes de mooré: convertir texto escrito en voz sintética para personas con discapacidad visual o dificultades de lectura en Burkina Faso, aprovechando que el modelo está entrenado específicamente para esta lengua.
- Locución de contenidos educativos: generar audio en mooré para materiales escolares, cursos radiofónicos o plataformas de aprendizaje, donde los sistemas TTS multilingües genéricos suelen producir pronunciaciones incorrectas.
- Servicios de información pública: sintetizar anuncios, avisos sanitarios o información administrativa en mooré para su difusión por radio comunitaria o canales telefónicos, un canal clave en regiones con baja penetración de internet.
- Preservación y digitalización lingüística: producir corpus de audio sintético en mooré para investigación lingüística, siempre que se documente adecuadamente su origen sintético.
- Prototipado de asistentes de voz locales: integrar el modelo en aplicaciones de asistencia por voz para comunidades mooré-hablantes, dado su tamaño reducido (109,5 M de parámetros) que facilita el despliegue en servidores modestos.
- Clonación de voz para personalización: generar voces sintéticas con características de un hablante de referencia para aplicaciones de doblaje o audiolibros en mooré, sujeto a consideraciones éticas y de consentimiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; con 109,5 M de parámetros en safetensors, los pesos en precisión completa ocuparían aproximadamente 0,4 GB, por lo que la inferencia cabría holgadamente en GPUs de consumo con 4-8 GB de VRAM, aunque no se confirma el pico de memoria real durante la síntesis.
- GPU recomendadas: no disponible; por tamaño, cualquier GPU consumer moderna (por ejemplo, RTX 3060 o superior) debería ser suficiente, pero no hay datos oficiales.
- Cabe en GPU consumer: previsiblemente sí, dado el tamaño del modelo, aunque no se ha verificado oficialmente.
- Opciones de despliegue: no disponible; al ser un modelo TTS basado en kyutai/pocket-tts, es probable que requiera el stack de inferencia de Kyutai, pero no se detalla en la información.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Acceso |
|---|---|---|---|---|---|
| goaicorp/moore-tts-pocket | 109,5 M | no disponible | mooré | CC-BY-4.0 | Restringido (gated) |
| kyutai/pocket-tts (base) | no disponible | no disponible | no disponible | no disponible | no disponible |
| Alternativas TTS multilingües (p. ej. modelos TTS open source de gran escala) | variable | no disponible | múltiples | variable | variable |

No se dispone de información suficiente para establecer una comparativa cuantitativa con alternativas de la misma categoría (TTS para lenguas de bajos recursos). El modelo base kyutai/pocket-tts es el referente directo, pero no se han proporcionado sus especificaciones completas ni resultados comparativos.

## Limitaciones y advertencias

- Modelo especializado en un único idioma (mooré); no es adecuado para síntesis en otras lenguas.
- Riesgo de alucinación o artefactos acústicos inherente a los sistemas TTS, especialmente en modelos entrenados con datos limitados de lenguas de bajos recursos; no se han publicado evaluaciones al respecto.
- Posibles sesgos derivados de la voz o voces de referencia utilizadas en el fine-tune; no se documenta la diversidad de hablantes del corpus.
- Capacidad de clonación de voz: implica riesgos de suplantación y uso indebido; requiere consentimiento explícito y marcos éticos claros en producción.
- Licencia CC-BY-4.0: permite uso comercial con atribución, pero debe verificarse el cumplimiento de las condiciones del modelo base kyutai/pocket-tts, cuya licencia no se detalla en la información disponible.
- Acceso restringido (gated): es necesario aceptar condiciones en Hugging Face antes de descargar los pesos, lo que puede limitar la reproducibilidad inmediata.
- Sin datos de benchmarks, latencia ni calidad perceptual publicados; se recomienda evaluación propia antes de un despliegue en producción.
- Fecha de creación del repositorio (2026-11-03) y ausencia de descargas o likes: modelo muy reciente y sin validación comunitaria conocida.

## Enlaces

- Hugging Face: https://huggingface.co/goaicorp/moore-tts-pocket
- Modelo base: https://huggingface.co/kyutai/pocket-tts
- No se han encontrado otros enlaces (papers, blogs, repos, demos) en la información proporcionada.
