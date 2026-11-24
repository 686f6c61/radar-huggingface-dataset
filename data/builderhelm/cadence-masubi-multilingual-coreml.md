# BuilderHelm/Cadence-Masubi-Multilingual-CoreML

## Resumen

Cadence Masubi Multilingual CoreML es un modelo de reconocimiento automático del habla (ASR) para dictado sin conexión, desarrollado por BuilderHelm y publicado en noviembre de 2026. Se trata de un ajuste fino (fine-tune) del modelo NVIDIA Parakeet TDT 0.6B v3, del que conserva la arquitectura, el tokenizador y la cobertura de 25 idiomas europeos. El modelo está empaquetado específicamente para Core ML, lo que permite su ejecución local en Apple Silicon a través de la librería BuilderHelmAudio del mismo autor.

El modelo resuelve el problema del dictado multilingüe en dispositivos Apple sin depender de la nube: los pesos se distribuyen en formato FP16 con un tamaño de 1,27 GB y se compilan en el dispositivo en el primer uso. Según la model card, el checkpoint publicado corresponde a la actualización 500 de un entrenamiento de continuación sobre una NVIDIA L4, en el que se entrenaron las cuatro capas superiores del codificador y las redes TDT de predicción y conjunción.

La relevancia del modelo radica en su enfoque *on-device*: ofrece transcripción en 25 idiomas (incluido el español) con un WER global de FLEURS del 12,61 % en la variante Core ML FP16, evaluado sobre 2.500 clips retenidos en un Apple M5. Existe además una variante GGUF Q8_0 (941 MB) para parakeet.cpp con Metal, con un WER del 12,55 %.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Parakeet TDT (Token-and-Duration Transducer) de NVIDIA, exportada a Core ML en cinco paquetes (Preprocessor, Encoder, EncoderTail, Predictor, Joint) |
| Parametros totales | 0,6 mil millones (heredados de Parakeet TDT 0.6B v3) |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | Ventanas de audio de 15 y 30 segundos en las funciones del codificador; presupuesto de entrenamiento de 40 segundos por lote |
| Tipos de cuantizacion | FP16 (build Core ML); Q8_0 disponible en el build GGUF hermano |
| Idiomas soportados | 25: búlgaro, checo, danés, alemán, griego, inglés, español, estonio, finés, francés, croata, húngaro, italiano, lituano, letón, maltés, neerlandés, polaco, portugués, rumano, ruso, eslovaco, esloveno, sueco y ucraniano |
| Licencia | CC BY 4.0 |
| Formato de pesos | Core ML (.mlpackage) para el build principal; GGUF Q8_0 en el repositorio hermano |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura Parakeet TDT de NVIDIA, un transductor (transducer) con decodificación conjunta de tokens y duraciones, adaptado a Core ML mediante una exportación en cinco paquetes: `Preprocessor` (features log-mel y normalización de ventana), `Encoder` y `EncoderTail` (dos etapas secuenciales del codificador con funciones de 15 y 30 segundos), y `Predictor` y `Joint` (redes de predicción y conjunción del TDT). El vocabulario y el contrato de ejecución se distribuyen en `config.json` y `vocab.json`, junto con los metadatos de procedencia `cadence-export.json` y `merge-record.json`.

El ajuste fino consistió en 500 actualizaciones sobre una NVIDIA L4, entrenando únicamente las cuatro capas superiores del codificador y las redes TDT de predicción y conjunción, con un presupuesto de 40 segundos de audio por lote, 50 pasos de calentamiento y comprobaciones de desarrollo cada 100 actualizaciones. Posteriormente se realizaron dos experimentos adicionales de 500 actualizaciones con la mezcla de datos original y con una mezcla prioritaria por idioma; ambos seleccionaron su checkpoint inicial según el WER de desarrollo con idiomas equiponderados, por lo que la release publicada corresponde al modelo original del paso 500. No se detalla en la información disponible la composición exacta del dataset de entrenamiento ni si se aplicaron técnicas de RLHF o DPO (no aplicables habitualmente en ASR).

## Capacidades

- Reconocimiento automático del habla multilingüe en 25 idiomas europeos, con detección automática del idioma a partir del audio.
- Transcripción de archivos de audio completos mediante la API `transcribe(file:)` de BuilderHelmAudio.
- Ejecución completamente local en Apple Silicon, sin conexión a red ni envío de audio a servidores externos.
- Procesamiento por ventanas de 15 y 30 segundos gracias a las dos etapas del codificador exportado.
- Decodificación TDT (Token-and-Duration Transducer), que combina predicción de tokens con predicción de duraciones.
- Integración nativa en Swift mediante el paquete BuilderHelmAudio, con compilación de los paquetes Core ML en el dispositivo y caché reutilizable.
- Compatibilidad con parakeet.cpp y Metal a través del build GGUF alternativo.
- No se dispone de información sobre soporte de tool calling, agentes, visión, audio de entrada más allá del propio ASR ni modo de razonamiento; estas capacidades no aplican a un modelo ASR.

## Casos de uso

- Dictado offline en macOS: la aplicación ZenVoice for Mac utiliza el modelo para transcribir voz a texto sin conexión, aprovechando la compilación Core ML en el dispositivo y la caché de compilación para evitar latencia en usos sucesivos.
- Subtitulado de reuniones y entrevistas multilingües: con 25 idiomas y detección automática del idioma, el modelo puede transcribir grabaciones de participantes que hablan lenguas distintas sin segmentación manual previa.
- Notas de voz en aplicaciones de productividad: integración vía BuilderHelmAudio en apps Swift para convertir notas habladas en texto editable, con audio que nunca sale del dispositivo.
- Transcripción de archivos de audio en lote: el CLI de parakeet.cpp con el GGUF Q8_0 permite procesar colecciones de WAV desde línea de comandos en Mac con Metal.
- Accesibilidad: dictado para usuarios con movilidad reducida en entornos donde no hay conectividad o donde la política de privacidad prohíbe servicios en la nube.
- Investigación en ASR multilingüe: el modelo sirve como línea base reproducible para experimentos de ajuste fino en lenguas europeas de recursos medios, dado que conserva el tokenizador original de Parakeet y publica checksums SHA256.
- Prototipado de asistentes de voz locales: la API asíncrona de Swift (`prepare()` y `transcribe(file:)`) facilita incorporar ASR a prototipos de agentes de voz que ya operan con otros modelos locales en Apple Silicon.

## Benchmarks y rendimiento

Los resultados publicados corresponden a 2.500 clips retenidos de FLEURS (100 por idioma), decodificados en un Apple M5 con normalización Unicode, plegado de mayúsculas y tratamiento de puntuación idénticos en ambas exportaciones. La puntuación global pondera cada idioma por igual.

| Idioma | WER Core ML FP16 | WER GGUF Q8_0 |
|---|---:|---:|
| Búlgaro | 11,53 % | 11,28 % |
| Croata | 13,78 % | 13,78 % |
| Checo | 10,48 % | 10,27 % |
| Danés | 18,00 % | 17,77 % |
| Neerlandés | 7,24 % | 7,37 % |
| Inglés | 4,60 % | 4,55 % |
| Estonio | 16,98 % | 16,73 % |
| Finés | 12,34 % | 11,84 % |
| Francés | 5,22 % | 4,93 % |
| Alemán | 4,63 % | 4,72 % |
| Griego | 36,40 % | no disponible en la información proporcionada |
| Global (25 idiomas) | 12,61 % | 12,55 % |

No se han publicado en la información disponible resultados de benchmarks estándar de ASR como MMLU, HumanEval o GSM8K, que no aplican a este tipo de modelo. Tampoco se proporcionan métricas de latencia o throughput más allá del tamaño de los artefactos (1,27 GB FP16 y 941 MB Q8_0).

## Requisitos de hardware

- VRAM/almacenamiento: 1,27 GB para el build Core ML FP16 y 941 MB para el GGUF Q8_0; el modelo se ejecuta en memoria unificada de Apple Silicon, no en VRAM dedicada.
- GPU recomendadas: Apple Silicon (la model card cita un Apple M5 como plataforma de evaluación); no se documenta soporte para GPU NVIDIA, AMD o Intel en esta release.
- Cabe en GPU de consumo: sí, en cualquier Mac con Apple Silicon, dado el tamaño reducido del checkpoint.
- Opciones de despliegue: BuilderHelmAudio (Core ML, Swift) y parakeet.cpp con Metal (GGUF, CLI `parakeet-cli transcribe --decoder tdt`).
- Latencia y throughput: no disponibles en la información proporcionada; la primera ejecución incluye la compilación de los paquetes Core ML en el dispositivo, que se cachea para usos posteriores.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto de audio | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| Cadence Masubi Multilingual CoreML | 0,6 B | Ventanas de 15 y 30 s | 25 | CC BY 4.0 | Core ML FP16 / GGUF Q8_0 |
| NVIDIA Parakeet TDT 0.6B v3 (modelo base) | 0,6 B | no disponible | 25 | no disponible en la información proporcionada | no disponible en la información proporcionada |
| Cadence Sae EN (misma familia) | no disponible | no disponible | Inglés | no disponible en la información proporcionada | no disponible en la información proporcionada |

La comparación con alternativas de otros fabricantes (por ejemplo, Whisper de OpenAI) no está disponible en la información proporcionada; no se han publicado cifras comparativas en la model card.

## Limitaciones y advertencias

- El WER varía notablemente por idioma: el griego alcanza el 36,40 % y el danés el 18,00 %, frente al 4,60 % del inglés, por lo que el rendimiento en lenguas de recursos medios es sensiblemente inferior.
- El modelo está empaquetado exclusivamente para Core ML y Apple Silicon; no se documenta ejecución en otras plataformas con esta release.
- La primera ejecución requiere compilar los paquetes Core ML en el dispositivo, lo que añade latencia inicial; la caché mitiga este coste en ejecuciones posteriores.
- Riesgo de alucinación y errores de transcripción inherentes a los modelos ASR, especialmente en audio con ruido, acentos no representados en el entrenamiento o vocabulario técnico.
- No se detalla la composición del dataset de entrenamiento ni los sesgos conocidos; la información disponible no permite evaluar sesgos demográficos o dialectales.
- La licencia CC BY 4.0 permite uso comercial con atribución, pero conviene verificar las condiciones del modelo base NVIDIA Parakeet TDT 0.6B v3, cuya licencia no se especifica en la información proporcionada.
- El checkpoint publicado corresponde al paso 500 de un ajuste fino parcial (solo cuatro capas del codificador y redes TDT), no a un reentrenamiento completo.
- No se han publicado métricas de latencia, throughput ni consumo energético, lo que dificulta estimar el rendimiento en producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/BuilderHelm/Cadence-Masubi-Multilingual-CoreML
- Variante GGUF: https://huggingface.co/BuilderHelm/Cadence-Masubi-Multilingual-GGUF
- Modelo base NVIDIA Parakeet TDT 0.6B v3: https://huggingface.co/nvidia/parakeet-tdt-0.6b-v3
- Modelo hermano en inglés Cadence Sae: https://huggingface.co/BuilderHelm/Cadence-Sae-EN
- Repositorio BuilderHelmAudio: https://github.com/BuilderHelm/BuilderHelmAudio
- parakeet.cpp: https://github.com/mudler/parakeet.cpp
- Página del autor en Hugging Face: https://huggingface.co/BuilderHelm
- ZenVoice (homepage): https://getzenvoice.com
- Descarga de ZenVoice para Mac: https://getzenvoice.com/download
- Licencia CC BY 4.0: https://creativecommons.org/licenses/by/4.0/
