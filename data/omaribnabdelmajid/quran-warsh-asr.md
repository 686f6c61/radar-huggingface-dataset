# omaribnabdelmajid/quran-warsh-asr

## Resumen

`omaribnabdelmajid/quran-warsh-asr` es un repositorio de modelos de reconocimiento automático de voz (ASR) especializados en recitación del Corán, publicados en formato ggml para su uso con whisper.cpp. No se trata de un modelo entrenado desde cero: el autor ha convertido y cuantizado los fine-tunes de Tarteel AI sobre Whisper (`whisper-base-ar-quran` y `whisper-tiny-ar-quran`) a los formatos q5_0 y q8_0, de modo que puedan ejecutarse de forma totalmente offline en dispositivos móviles mediante `whisper.rn`. El objetivo declarado es alimentar una aplicación móvil de Corán que transcriba recitaciones sin conexión.

El repositorio incluye cuatro pesos de modelo (tiny y base, cada uno en q5_0 y q8_0) más un binario de detección de actividad de voz (VAD) basado en Silero v6.2.0, también en formato ggml. El tamaño total del repo es de 0,2 GB y los ficheros individuales van desde 29,9 MB (tiny q5_0) hasta 81,8 MB (base q8_0), lo que los hace aptos para empaquetarse dentro de una aplicación móvil.

La relevancia de este repositorio es práctica más que investigadora: demuestra un flujo de trabajo reproducible (conversión con `convert-h5-to-ggml.py` y cuantización con `quantize`, ambos de whisper.cpp v1.9.3) para llevar modelos ASR de árabe coránico a entornos con recursos muy limitados. La licencia es Apache-2.0 y el único idioma soportado es el árabe.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (Whisper), convertido a ggml |
| Parametros totales | no disponible (variantes tiny y base de Whisper; el autor no publica el recuento exacto) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (ventana de audio propia de Whisper; el autor no especifica el límite en la model card) |
| Tipos de cuantizacion | q5_0 y q8_0 |
| Idiomas soportados | ar (árabe) |
| Licencia | Apache-2.0 |
| Formato de pesos | ggml (.bin) para whisper.cpp; los modelos originales están en formato Hugging Face/transformers |

## Arquitectura y entrenamiento

La arquitectura subyacente es Whisper, un transformer encoder-decoder con atención estándar diseñado para transcripción de audio. Los pesos publicados aquí no han sido reentrenados: proceden de los fine-tunes de Tarteel AI sobre Whisper base y tiny para recitación coránica en árabe, en revisiones concretas (`5c3c53f...` para base y `c3d7e62...` para tiny). El autor los convierte a ggml con `convert-h5-to-ggml.py` y los cuantiza con la herramienta `quantize` de whisper.cpp v1.9.3 (commit `371b5a7...`).

No se dispone de información sobre el dataset de fine-tuning, el número de tokens de audio utilizados, ni si hubo etapas de RLHF o ajuste supervisado adicional más allá de lo que publique Tarteel AI en sus propias model cards. La innovación técnica de este repositorio es la cadena de conversión y cuantización reproducible, la inclusión de un VAD Silero en ggml y la fijación por SHA-256 de cada fichero para garantizar builds inmutables en la aplicación cliente.

## Capacidades

- Transcripción de voz a texto en árabe, específicamente orientada a recitación coránica.
- Ejecución totalmente offline en dispositivos móviles mediante whisper.cpp y `whisper.rn`.
- Dos tamaños de modelo (tiny y base) para ajustar el equilibrio entre precisión y consumo de recursos.
- Dos niveles de cuantización (q5_0 y q8_0) para ajustar el tamaño en disco y la calidad.
- Detección de actividad de voz (VAD) con Silero v6.2.0 en formato ggml, útil para segmentar audio antes de la transcripción.
- No se documenta soporte de tool calling, function calling, agentes, razonamiento multi-paso, visión ni audio más allá del ASR.
- Capacidad multilingüe limitada al árabe; no se declaran otros idiomas.

## Casos de uso

- Aplicación móvil de Corán offline: el modelo tiny q5_0 (29,9 MB) puede empaquetarse dentro del binario de la app y transcribir recitaciones sin conexión, usando el VAD Silero para detectar cuándo el usuario empieza a recitar.
- Seguimiento de recitación en tiempo real: combinando el VAD con el modelo base q8_0 (81,8 MB) se puede alinear el audio del usuario con el texto coránico y resaltar la posición actual en la pantalla.
- Verificación de memorización (hifz): el modelo transcribe lo recitado y la app compara con el texto esperado para señalar errores u omisiones, aprovechando la especialización del fine-tune en árabe coránico.
- Transcripción de clases o sesiones de recitación grabadas: el modelo base q8_0 ofrece mayor precisión que el tiny para audio de calidad variable, y puede procesarse por lotes en servidor o en el propio dispositivo.
- Accesibilidad para personas con discapacidad auditiva: generación de subtítulos de recitaciones coránicas en vídeos o streaming, con el modelo base como opción de mayor calidad.
- Investigación en ASR de árabe dialectal y coránico: los binarios ggml permiten experimentar con whisper.cpp en entornos sin GPU y comparar el rendimiento de tiny frente a base con distintas cuantizaciones.
- Integración en pipelines de evaluación de pronunciación: el texto transcrito puede alimentar un comparador fonético para dar retroalimentación al usuario sobre su recitación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; por el tamaño de los ficheros (29,9 MB a 81,8 MB), el modelo cabe holgadamente en memoria de cualquier dispositivo móvil moderno.
- GPU recomendadas: no aplica para el caso de uso principal (CPU en móvil). En escritorio puede ejecutarse en CPU sin GPU; no se documentan requisitos de GPU.
- Cabe en GPU consumer: sí, con enorme margen, dado el tamaño reducido de los pesos; también en CPU y en dispositivos móviles.
- Opciones de despliegue: whisper.cpp (v1.9.3 o superior), `whisper.rn` para React Native, y cualquier runtime compatible con ggml.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|---|
| omaribnabdelmajid/quran-warsh-asr | no disponible (tiny/base Whisper) | no disponible | ar | Apache-2.0 | ggml | Hugging Face |
| tarteel-ai/whisper-base-ar-quran | base Whisper | no disponible | ar | Apache-2.0 | transformers | Hugging Face |
| tarteel-ai/whisper-tiny-ar-quran | tiny Whisper | no disponible | ar | Apache-2.0 | transformers | Hugging Face |
| OpenAI Whisper (tiny/base) | 39M / 74M aprox. | 30 s de audio | multilingüe | MIT | múltiples | OpenAI / Hugging Face |

La comparativa se limita a los modelos de origen porque el autor no documenta alternativas adicionales. La diferencia principal frente a los originales de Tarteel AI es el formato ggml y la cuantización, que permiten ejecución offline en móvil; frente a Whisper original, la especialización en árabe coránico y el menor tamaño de despliegue.

## Limitaciones y advertencias

- El modelo está especializado exclusivamente en árabe coránico; su rendimiento en árabe conversacional, dialectal o en otros idiomas no está documentado y probablemente sea deficiente.
- No se han publicado métricas de WER/CER ni benchmarks, por lo que no es posible cuantificar su precisión frente a alternativas.
- Al derivar de Whisper, hereda los sesgos y limitaciones del modelo original, incluyendo posibles alucinaciones en audio con ruido o silencios largos.
- La cuantización q5_0 puede degradar la precisión respecto a q8_0; el autor no documenta la magnitud de esa pérdida.
- Aunque la licencia es Apache-2.0, los modelos de origen (Tarteel AI) y Whisper (MIT) imponen sus propias condiciones; conviene revisar `LICENSE` y `NOTICE.txt` antes de uso comercial.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y fue creado en 2026-11-17; no hay evidencia de uso en producción ni de mantenimiento continuado.
- Las carpetas `v1/` son inmutables por diseño, pero no se garantiza que el autor publique nuevas versiones ni que corrija errores.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/omaribnabdelmajid/quran-warsh-asr
- Modelo base (base): https://huggingface.co/tarteel-ai/whisper-base-ar-quran
- Modelo base (tiny): https://huggingface.co/tarteel-ai/whisper-tiny-ar-quran
- whisper.cpp: https://github.com/ggml-org/whisper.cpp
- VAD Silero en ggml: https://huggingface.co/ggml-org/whisper-vad
- `whisper.rn` (no se proporciona URL en la información disponible)
