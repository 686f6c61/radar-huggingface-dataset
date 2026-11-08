# okdohyuk/whisper-base-ko-coreml

## Resumen

whisper-base-ko-coreml es un ajuste fino en coreano del modelo de reconocimiento automático del habla `openai/whisper-base` (72,6 millones de parámetros), desarrollado por el usuario okdohyuk y publicado en Hugging Face. El modelo parte de la revisión `e37978b90ca9030d5170a5c07aadb050351a65bb` del modelo original de OpenAI y ha sido convertido a Core ML mediante `whisperkittools` para su uso con WhisperKit, el framework de inferencia on-device de Argmax para ecosistemas Apple. Está pensado para la app Nogmi, que lo emplea para transcripción de coreano en el dispositivo.

El problema que resuelve es la baja precisión del Whisper base original en coreano: el ajuste fino reduce el CER en fleurs_ko_test del 16,176 % al 6,357 % y el WER del 33,115 % al 17,015 %, manteniendo el formato Core ML sin degradación medible frente a PyTorch (delta de +0,0 pp en CER). El repositorio ocupa 0,1 GB y la licencia es Apache-2.0, lo que permite uso comercial.

La relevancia actual es doble: por un lado, ofrece una alternativa ligera y privada (sin enviar audio a la nube) para ASR en coreano en macOS e iOS; por otro, documenta con transparencia el coste del ajuste monolingüe: el modelo pierde drásticamente capacidad en otros idiomas (CER en fleurs_en_test sube del 4,833 % al 111,152 %). Es un artefacto especializado, no un modelo multilingüe.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (Whisper), convertido a Core ML |
| Parametros totales | 72,6 M (modelo base `openai/whisper-base`) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (ventana de audio de 30 s propia de Whisper) |
| Tipos de cuantizacion | no disponible (formato Core ML; el repo no detalla variantes de cuantizacion) |
| Idiomas soportados | coreano (ko); capacidad multilingüe degradada por el ajuste |
| Licencia | Apache-2.0 |
| Formato de pesos | Core ML (paquete para WhisperKit); tamano del repo 0,1 GB |

## Arquitectura y entrenamiento

Se trata de la arquitectura Whisper estándar: un transformer encoder-decoder con atención completa, diseñado para transcripción de audio en ventanas de 30 segundos. El modelo base tiene 72,6 millones de parámetros y fue ajustado completamente (full fine-tune) sobre coreano, con un learning rate de 2e-06, 100 pasos, batch de 16×1 y un 18 % de replay multilingüe procedente de FLEURS. Posteriormente se convirtió a Core ML con `whisperkittools` (commit `84f77a83c8f530022ae55fbb1a64b3351ef63c7a`) para su ejecución con WhisperKit.

Los datos de entrenamiento son públicos y con licencias que permiten redistribución de modelos derivados y uso comercial: FLEURS (CC-BY-4.0), Zeroth-Korean / OpenSLR 40 (CC-BY-4.0) y Mozilla Common Voice 17.0 en coreano vía el espejo `fsicoli/common_voice_17_0` (CC0-1.0). El autor declara explícitamente que no se usaron KsponSpeech, datos de AIHub ni grabaciones de usuarios. No se documenta uso de RLHF ni DPO; el ajuste es supervisado sobre pares audio-transcripción.

## Capacidades

- Reconocimiento automático del habla (ASR) en coreano, con salida de texto transcrito.
- Inferencia on-device mediante Core ML y WhisperKit, sin dependencia de servicios en la nube.
- Transcripción de audio en formato corto (ventanas de 30 s propias de Whisper).
- Integración en aplicaciones Apple (macOS, iOS) a través de WhisperKit.
- Capacidad multilingüe residual muy degradada: no es apta para inglés, japonés ni otros idiomas.
- No se documenta soporte de tool calling, function calling, agentes, visión ni audio más allá del ASR.
- No se documenta modo de razonamiento (thinking) ni otras capacidades especiales.

## Casos de uso

- Transcripción de voz en coreano dentro de apps iOS/macOS: el modelo se ejecuta vía WhisperKit sobre Core ML, lo que permite dictado y notas de voz sin enviar audio a servidores externos.
- Privacidad y cumplimiento: al procesar el audio en el dispositivo, encaja en escenarios donde el audio no puede salir del terminal (sanidad, legal, entornos corporativos).
- Subtitulado de contenido en coreano: con un CER del 6,357 % en FLEURS, es adecuado para generar subtítulos preliminares que después se revisan manualmente.
- Asistentes de voz locales: integrado en un pipeline de captura de micrófono y comandos de voz en coreano, con latencia propia de un modelo de 72,6 M de parámetros.
- Indexación y búsqueda de audio: transcripción de archivos de audio en coreano para generar texto buscable en aplicaciones de archivo o gestión documental.
- Prototipado y evaluación de ASR: al ser un ajuste documentado con métricas CER/WER reproducibles sobre FLEURS, Common Voice 17 y Zeroth, sirve como línea base para comparar futuros ajustes en coreano.
- Aplicaciones de accesibilidad: conversión de voz a texto en coreano para personas con dificultades auditivas, ejecutándose localmente en dispositivos Apple.

## Benchmarks y rendimiento

Evaluación sobre conjuntos held-out (nunca usados en entrenamiento), CER/WER en porcentaje, normalización NFKC y eliminación de puntuación y espacios para CER, decodificación greedy:

| Conjunto | CER original | CER este modelo | WER original | WER este modelo |
|---|---|---|---|---|
| fleurs_ko_test | 16,176 | 6,357 | 33,115 | 17,015 |
| cv17_ko_test | 28,566 | 13,126 | 62,17 | 30,302 |
| zeroth_ko_test | 17,259 | 8,135 | 46,108 | 28,249 |
| fleurs_en_test | 4,833 | 111,152 | 10,393 | 125,127 |
| fleurs_ja_test | 25,107 | 108,389 | 101,111 | 500,404 |

Las cifras del modelo original se remidieron con el mismo script y las mismas filas. El delta Core ML frente a PyTorch es de +0,0 pp en CER tanto en fleurs_ko_test como en cv17_ko_test. La comprobación de regresión en audio largo (tipo reunión) fue omitida en esta versión por falta de un conjunto interno de audio largo.

## Requisitos de hardware

- VRAM estimada: no disponible; al ser un modelo Core ML de 72,6 M de parámetros, el peso del repo es de 0,1 GB, por lo que el consumo de memoria es muy reducido.
- GPU recomendadas: no aplica en el sentido tradicional; el modelo está pensado para la Neural Engine y GPU integrada de chips Apple (series M y A) mediante Core ML.
- Cabe en hardware de consumo: sí, en dispositivos Apple compatibles con WhisperKit; no está orientado a GPU NVIDIA.
- Opciones de despliegue: WhisperKit (Core ML); no se documenta soporte de vLLM, llama.cpp, Ollama ni TGI para este artefacto.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / audio | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| whisper-base-ko-coreml (este) | 72,6 M | ventanas de 30 s (Whisper) | coreano | Apache-2.0 | Hugging Face, formato Core ML |
| openai/whisper-base | 72,6 M | ventanas de 30 s (Whisper) | multilingüe | Apache-2.0 | Hugging Face, PyTorch |
| whisper-small (OpenAI) | 244 M | ventanas de 30 s (Whisper) | multilingüe | Apache-2.0 | Hugging Face |

Frente a `openai/whisper-base`, este modelo mejora notablemente el CER/WER en coreano (por ejemplo, 6,357 % frente a 16,176 % en fleurs_ko_test) pero pierde capacidad en inglés y japonés. Frente a `whisper-small`, no hay datos comparativos de benchmarks en la información disponible; el modelo pequeño de OpenAI tiene más parámetros (244 M) y mayor coste de inferencia. No se dispone de datos de otros ajustes Core ML en coreano para comparar.

## Limitaciones y advertencias

- El ajuste monolingüe degrada gravemente otros idiomas: CER del 111,152 % en fleurs_en_test y del 108,389 % en fleurs_ja_test; no debe usarse como modelo multilingüe.
- Riesgo de alucinación y errores en audio con ruido, acentos no representados o vocabulario técnico fuera de los corpus de entrenamiento (FLEURS, Zeroth, Common Voice).
- El WER en Common Voice 17 coreano sigue siendo del 30,302 %, lo que limita su uso en producción sin revisión humana en dominios conversacionales.
- No se ha validado en audio largo (tipo reunión): la comprobación de regresión correspondiente fue omitida en esta versión.
- Restricciones de datos: los términos de Common Voice prohíben intentar determinar la identidad de los hablantes del conjunto de datos.
- Licencia Apache-2.0 para los pesos, con atribución obligatoria a los datos CC-BY-4.0 indicada en el `NOTICE.md` del repositorio.
- El modelo está empaquetado exclusivamente para Core ML/WhisperKit; no se ofrecen pesos PyTorch ni GGUF en este repositorio.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: no hay evidencia de validación por parte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/okdohyuk/whisper-base-ko-coreml
- Modelo base: https://huggingface.co/openai/whisper-base
- Repositorio WhisperKit Core ML del autor: https://huggingface.co/okdohyuk/whisperkit-coreml
- WhisperKit (Argmax): https://github.com/argmaxinc/WhisperKit
- whisperkittools: https://github.com/argmaxinc/whisperkittools
- Dataset FLEURS: https://huggingface.co/datasets/google/fleurs
- Dataset Zeroth-Korean (OpenSLR 40): https://www.openslr.org/40/
- Mozilla Common Voice: https://commonvoice.mozilla.org
