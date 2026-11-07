# ampixa/real-nepali-v0.2-kala

## Resumen

Kala (real-nepali-v0.2-kala) es un modelo de síntesis de voz (text-to-speech) multi-hablante para nepalí, desarrollado por Ampixa. Se trata de un modelo VITS entrenado sobre el checkpoint base piper-plus multilingüe y distribuido en formato ONNX FP32, diseñado para inferencia en CPU en tiempo real (RTF ≈ 0,02, aproximadamente 50 veces más rápido que el tiempo real en un portátil). Su principal innovación no es la arquitectura neuronal, sino el frontend G2P `real_nepali`: un sistema de reglas y léxico construido a mano, fundamentado en Khatiwada (2009), que sustituye a eSpeak-ng para el nepalí.

El modelo resuelve un problema concreto de la cadena TTS en nepalí: el backend `ne` de eSpeak-ng mapea las africadas च y छ a etiquetas alveolares (`ts`, `tsh`) que no corresponden a la producción de los hablantes de Katmandú, pierde la geminación y no gestiona el cambio de código al latín. El frontend `real_nepali` corrige estos puntos con un inventario de 48 fonemas (más variantes geminadas) y un léxico curado de 48 000 entradas.

El modelo pesa aproximadamente 60 MB en su archivo ONNX (el repositorio completo ocupa 1,0 GB) y ofrece seis hablantes, de los cuales se recomienda `kala` para demostración y producción. Está pensado para despliegues ligeros en CPU, sin requisitos de GPU, y se publica bajo licencia CC-BY-SA 4.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VITS con atención monotónica (encoder + decoder fusionados) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo TTS, no autoregresivo de contexto textual) |
| Tipos de cuantizacion | FP32 (archivo `real_nepali_v02_kala.fp32.onnx`); no se documentan otras variantes |
| Idiomas soportados | nepalí (ne) |
| Licencia | CC-BY-SA 4.0 |
| Formato de pesos | ONNX (FP32); compatible con piper-tts |
| Frecuencia de muestreo | 22 050 Hz, mono, PCM 16 bits |
| Hablantes | 6 (IDs vía parámetro `sid`) |
| Tamaño del archivo ONNX | ~60 MB |
| Tamaño del repositorio | 1,0 GB |
| Entradas del grafo ONNX | `input` (IDs de fonemas int64), `input_lengths`, `scales`, `sid` |
| Framework de entrenamiento | piper-plus (parcheado para nepalí) |
| Hardware de entrenamiento | NVIDIA L40S 46 GB |
| Librería | kala-tts |

## Arquitectura y entrenamiento

Kala es un modelo VITS (Variational Inference with adversarial learning for end-to-end Text-to-Speech) con atención monotónica, construido sobre el checkpoint base piper-plus multilingüe de 302 MB. El grafo ONNX distribuido fusiona encoder y decoder en un único artefacto FP32, lo que simplifica el despliegue y permite ejecución en CPU sin dependencias de GPU. La salida es audio PCM de 16 bits a 22 050 Hz en mono.

El entrenamiento se realizó sobre 4 338 filas que suman 8,61 horas de audio, durante 1 000 épocas, en una NVIDIA L40S de 46 GB. La composición del corpus combina datos humanos y de corpus públicos: `barsha` (808 filas, 1,62 h, recitación humana), `kala` (200 filas, 0,37 h, estudio), `slr143_F` (566 filas, 1,01 h, OpenSLR-143), `slr43_0546` (505 filas, 0,62 h, OpenSLR-43) y `slr43_2099` (275 filas, 0,51 h, OpenSLR-43). El hablante `algenib`, generado con Gemini-Flash sintético (1 984 filas, 4,47 h), queda excluido de la release pública v0.2. No se documenta el uso de RLHF ni DPO, algo esperable en un modelo TTS de esta naturaleza.

La innovación técnica destacable es el frontend G2P `real_nepali`, un sistema de reglas y léxico que reemplaza a eSpeak-ng. Frente a las ~35 unidades del backend `ne` de eSpeak, `real_nepali` emplea 48 fonemas más variantes geminadas, con borrado de schwa basado en reglas auditadas, tokens explícitos de geminación (`:`) y gestión del cambio de código al latín mediante reglas letra a letra o un léxico de sustitución. En la prueba de pares mínimos NepTTS-Bench (365 frases) alcanza un 99,5 % de preservación del contraste de pares mínimos frente a las transcripciones IPA de referencia.

## Capacidades

- Síntesis de voz mono-hablante y multi-hablante en nepalí, con seis voces seleccionables mediante el parámetro `sid`.
- Conversión de texto Devanagari a fonemas mediante el frontend `real_nepali`, con léxico curado de 48 000 entradas que cubre aproximadamente el 95 % del vocabulario común.
- Gestión explícita de geminación mediante tokens `:`.
- Borrado de schwa basado en reglas auditadas, en lugar de heurísticas.
- Manejo de cambio de código nepalí-inglés: el texto latino se procesa letra a letra o mediante léxico de sustitución.
- Inserción determinista de pausas ante signos de puntuación (punto, coma, interrogación); el modelo no aprende contornos de entonación a partir de los tokens de puntuación.
- Lectura de dígitos en orden de palabras nepalí.
- Inferencia en CPU en tiempo real (RTF ≈ 0,02).
- API Python (`kala_tts.synthesize`, `kala_tts.synthesize_to_file`, `kala_tts.list_speakers`) y CLI (`kala-tts`).
- Compatibilidad directa con `piper-tts` mediante el archivo ONNX y `--speaker_id`.
- No soporta tool calling, function calling, agentes, visión ni audio de entrada; es exclusivamente un modelo TTS.

## Casos de uso

- **Locución automática para aplicaciones de accesibilidad en nepalí**: lectura de texto en voz alta para lectores de pantalla y asistentes de accesibilidad dirigidos a usuarios nepaloparlantes, aprovechando la inferencia en CPU (RTF ≈ 0,02) para funcionar en dispositivos sin GPU.
- **Atención al cliente y líneas IVR en nepalí**: generación dinámica de respuestas de voz en sistemas telefónicos, donde el bajo coste computacional y la ejecución en CPU permiten desplegar en servidores modestos y escalar por número de canales concurrentes.
- **Audiolibros y contenido editorial**: síntesis de artículos, noticias o capítulos con la voz `kala` (recomendada para producción) o `barsha` como segunda opción humana, con inserción de pausas por puntuación para estructurar la locución.
- **Subtitulado y doblaje de vídeo**: conversión de transcripciones nepalíes a pistas de audio para vídeos divulgativos o educativos, con la posibilidad de alternar entre hablantes según el personaje o la sección.
- **Sistemas de navegación y avisos por voz**: generación de instrucciones cortas y deterministas en dispositivos embebidos o de bajo consumo, donde el formato ONNX FP32 y la ausencia de dependencias de GPU simplifican el despliegue.
- **Investigación lingüística y fonética del nepalí**: uso del frontend `real_nepali` y del léxico de 48 000 entradas como herramienta para experimentos de G2P, evaluación de contraste de pares mínimos y estudios de fonología del nepalí de Katmandú.
- **Prototipado rápido de productos de voz**: integración mediante `pip install kala-tts` o mediante piper-tts, con descarga automática del modelo (~60 MB) y caché local vía `huggingface_hub`, lo que reduce el tiempo de puesta en marcha.

## Benchmarks y rendimiento

| Benchmark | Resultado | Contexto |
|---|---|---|
| NepTTS-Bench, pares mínimos (365 frases) | 99,5 % de preservación del contraste de pares mínimos | Frente a transcripciones IPA de referencia; mide el frontend G2P, no la calidad perceptual del audio |
| RTF en CPU de portátil | ~0,02 (≈50× tiempo real) | Inferencia ONNX FP32 |

No se han publicado resultados de benchmarks perceptuales (MOS, CMOS) ni comparativas numéricas con otros modelos TTS en la información disponible.

## Requisitos de hardware

- **VRAM estimada para inferencia**: no requiere GPU; el modelo ONNX FP32 (~60 MB) se ejecuta en CPU. Una fuente externa (AxForge) cita un peso BF16 de 935 MB y una configuración mínima de RTX 3060 12 GB, dato no confirmado por la model card.
- **GPU recomendadas**: no aplica para el despliegue documentado; el modelo está diseñado para CPU. Cualquier GPU moderna puede ejecutarlo, pero no aporta ventaja según la documentación oficial.
- **CPU**: cualquier CPU de portátil moderna es suficiente; RTF ≈ 0,02 implica que 1 segundo de audio se genera en aproximadamente 20 ms.
- **Opciones de despliegue**: `kala-tts` (pip), `piper-tts` con el archivo `real_nepali_v02_kala.fp32.onnx`, ONNX Runtime directo, o clonando el repositorio `Ampixa/nepa-newa-text-frontend` y ejecutando `python -m kala_tts`.
- **Latencia y throughput**: RTF ≈ 0,02 en CPU de portátil; no se documentan cifras de throughput concurrente ni latencia de primera llamada (incluye descarga y caché del modelo en el primer uso).
- **Almacenamiento**: ~60 MB para el ONNX; 1,0 GB para el repositorio completo.

## Comparativa con modelos similares

| Modelo | Tipo | Idiomas | Arquitectura | Formato | Licencia | Contexto de uso |
|---|---|---|---|---|---|---|
| Kala (real-nepali-v0.2-kala) | TTS multi-hablante | nepalí | VITS + atención monotónica | ONNX FP32 | CC-BY-SA 4.0 | CPU, RTF ≈ 0,02 |
| eSpeak-ng (voz `ne`) | TTS basado en reglas | nepalí (entre muchos) | Sintetizador de formantes | Binario nativo | GPL | CPU; sin modelo neuronal |
| Piper (genérico) | TTS multi-hablante | múltiples | VITS | ONNX | MIT (código) | CPU; Kala se construye sobre piper-plus |
| Modelos TTS neuronales multilingües comerciales | TTS neuronal | múltiples | variable | variable | propietaria | GPU habitualmente |

La comparación más directa es con eSpeak-ng en su voz `ne`: Kala mejora el contraste de africadas (palatal `ch`/`chh` frente a alveolar `ts`/`tsh`), preserva la geminación con tokens explícitos y gestiona el cambio de código al latín, capacidades que eSpeak no ofrece. Frente a Piper genérico, Kala aporta el frontend G2P específico para nepalí y un corpus de entrenamiento dedicado. No se dispone de comparativas numéricas de calidad perceptual con otros modelos TTS neuronales en la información proporcionada.

## Limitaciones y advertencias

- **Brecha de naturalidad**: la voz `kala` se entrenó con solo 200 enunciados (0,37 h); la prosodia puede resultar plana en frases largas.
- **Conciencia de puntuación limitada**: los signos se gestionan mediante inserción determinista de pausas; el modelo no aprende contornos de entonación a partir de los tokens de puntuación.
- **Palabras fuera de vocabulario**: las palabras Devanagari desconocidas caen a reglas letra a letra; el léxico de 48 000 entradas cubre aproximadamente el 95 % del vocabulario común, por lo que el 5 % restante puede degradar la pronunciación.
- **Números**: los dígitos se leen en orden de palabras nepalí; las cifras mixtas nepalí-inglés pueden producir una salida inesperada.
- **Condiciones de grabación variables**: los hablantes de corpus (`slr143_F`, `slr43_0546`, `slr43_2099`) tienen buena prosodia pero condiciones de grabación heterogéneas, lo que puede introducir inconsistencias de timbre.
- **Riesgo de alucinación acústica**: como todo modelo generativo de audio, puede producir artefactos o pronunciaciones incorrectas en entradas ambiguas; se recomienda validación auditiva en producción.
- **Sesgos**: el corpus se limita al nepalí de Katmandú según Khatiwada (2009); otras variedades dialectales del nepalí pueden no estar bien representadas.
- **Licencia**: CC-BY-SA 4.0 obliga a atribución y a compartir las obras derivadas bajo la misma licencia; es relevante para uso comercial, que está permitido pero con esas condiciones. El corpus OpenSLR-143 y OpenSLR-43 y el léxico semilla de `google/language-resources` (`ne/`, CC-BY 4.0) imponen sus propias condiciones de atribución.
- **Datos sintéticos excluidos**: el hablante `algenib` (Gemini-Flash sintético, 4,47 h) queda fuera de la release pública v0.2, por lo que el modelo no se beneficia de ese volumen de datos.
- **Idioma único**: solo nepalí; no es un modelo multilingüe y no debe esperarse calidad en otros idiomas más allá del cambio de código al latín.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ampixa/real-nepali-v0.2-kala
- Demo en vivo (Hugging Face Space): https://ampixa-real-nepali-tts.hf.space
- Repositorio del frontend G2P: https://github.com/Ampixa/nepa-newa-text-frontend
- Ficha en AxForge: https://axforge.ai/models/real-nepali-kala/
- Referencia fonológica: Khatiwada (2009), *Nepali*, Journal of the International Phonetic Association, 39(3), 373–380
- Léxico semilla G2P: `google/language-resources` (directorio `ne/`, CC-BY 4.0)
