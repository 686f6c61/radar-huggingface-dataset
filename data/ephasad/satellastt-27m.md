# EphAsad/SatellaSTT-27M

## Resumen

SatellaSTT-27M es un modelo de reconocimiento automático del habla (ASR) en inglés de 27,1 millones de parámetros, desarrollado por el usuario EphAsad y publicado en HuggingFace bajo licencia MIT. Se trata de un ajuste fino (fine-tuning) del modelo `UsefulSensors/moonshine-tiny`, que a su vez deriva de la familia Moonshine de Moonshine AI, una arquitectura de encoder-decoder optimizada para ASR de baja latencia en dispositivos con recursos limitados.

El problema que aborda es concreto: los modelos ASR generalistas verbalizan la notación científica en lugar de transcribirla de forma útil. Un modelo base tiende a producir "50 microliters" o "10 to the minus 2" cuando el usuario necesita "50 µL" o "10^-2". SatellaSTT-27M corrige este comportamiento mediante un ajuste fino sobre 19,6 horas de audio científico sintético combinado con 20 horas de LibriSpeech como replay general, logrando reducir el WER científico del 26,78 % al 9,64 % a costa de un leve deterioro en inglés general.

El modelo es relevante para el nicho de transcripción de laboratorio, microbiología y biología molecular en entornos con hardware modesto: sus 27 millones de parámetros permiten inferencia en CPU a más de 24 veces tiempo real, lo que lo hace viable en portátiles, Raspberry Pi o flujos locales sin GPU. Su principal limitación declarada por el autor es que el corpus de entrenamiento y evaluación científica es audio sintético generado con Kokoro, por lo que aún no hay validación con habla humana real en dominio científico.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Encoder-decoder tipo Moonshine (transformer optimizado para ASR) |
| Parámetros totales | 27.092.736 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (audio de entrada; clips de benchmark de 4,5 a 15,5 s) |
| Tipos de cuantización | no disponible (pesos en safetensors; el autor no documenta variantes GGUF/INT8) |
| Idiomas soportados | inglés (en) |
| Licencia | MIT |
| Formato de pesos | safetensors (checkpoint PyTorch; artefacto de 106,96 MB) |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura Moonshine de `moonshine-tiny`, un diseño encoder-decoder pensado para ASR de baja latencia que procesa audio a 16 kHz mono y genera transcripciones de forma autorregresiva. No es un modelo MoE ni un SSM: es un transformer compacto con 27,1 millones de parámetros totales, todos activos en cada paso de inferencia. La innovación principal de Moonshine frente a Whisper es su eficiencia computacional para audio de duración variable, que se traduce en latencias bajas incluso en CPU.

El entrenamiento consistió en un ajuste fino supervisado con una mezcla aproximadamente 1:1 por duración de audio: 19,595 horas del dataset científico `EphAsad/STT-Science` (20.000 horas de origen, audio sintético Kokoro) y 20,003 horas de LibriSpeech como replay para mitigar el olvido catastrófico. Se usó una tasa de aprendizaje de 1e-5, un máximo de 2 épocas y se seleccionó el checkpoint-200 según un WER de validación ponderado hacia la preservación del inglés general (7,602 %). No se documenta RLHF, DPO ni decodificación especulativa. El autor reporta un "loss-alignment preflight delta" de 0,0, un control de reproducibilidad interno.

## Capacidades

- Transcripción de voz a texto en inglés con preservación de notación científica escrita: unidades (`µL`, `µM`, `mL`), exponentes (`10^-2`), notación de dilución y recuentos (`7.5 x 10^8 CFU per gram`).
- Reconocimiento de terminología microbiológica: nombres de organismos (con errores residuales en algunos casos), medios de cultivo, terminología de sensibilidad antimicrobiana y biología molecular.
- Transcripción de lenguaje de laboratorio e informes técnicos.
- Capacidad general de inglés conversacional y de dominio común, preservada mediante el replay de LibriSpeech.
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso: es un modelo puramente ASR.
- No tiene visión, audio generativo ni modo "thinking".
- Multilingüe: no; únicamente inglés.

## Casos de uso

- Transcripción de cuadernos de laboratorio: el modelo convierte dictados de experimentos en texto con unidades y concentraciones correctas (`50 µL`, `500 µM`), evitando la verbalización que obliga a corrección manual posterior. Adecuado por su entrenamiento específico en notación científica.
- Documentación de protocolos de microbiología: transcripción de nombres de organismos, medios de cultivo y resultados de sensibilidad antimicrobiana en informes internos, con la advertencia de revisar nombres especializados.
- Dictado de resultados de dilución y recuentos: útil para registrar series de dilución (`10^-2`) y recuentos de UFC, donde el modelo base falla sistemáticamente.
- ASR local en portátiles sin GPU: con un factor de tiempo real de 0,041 en CPU (24,13× tiempo real, latencia mediana de 334,2 ms), puede ejecutarse en un portátil convencional para transcripción por lotes de grabaciones de laboratorio.
- Integración en pipelines de LIMS o ELN: al ser un modelo de 107 MB en safetensors y licencia MIT, puede embeberse en servicios internos de transcripción sin dependencias de API externas ni costes por token.
- Transcripción de clases y seminarios científicos en inglés: combina capacidad general (LibriSpeech) con terminología técnica, adecuado para grabaciones académicas donde aparecen unidades y nombres de organismos.
- Prototipado de asistentes de voz para laboratorio: al ser un modelo pequeño y de licencia permisiva, sirve como base para experimentos de voz en entornos científicos antes de escalar a modelos mayores.

## Benchmarks y rendimiento

Evaluación científica: 91 enunciados held-out y 208 términos de dominio. Evaluación general: 482 enunciados de LibriSpeech test-clean.

| Métrica | Moonshine base | SatellaSTT-27M | Cambio |
|---|---:|---:|---:|
| WER científico (↓) | 26,784 % | 9,639 % | -17,145 puntos |
| Recall de términos de dominio (↑) | 33,173 % | 60,577 % | +27,404 puntos |
| WER LibriSpeech general (↓) | 4,995 % | 6,913 % | +1,917 puntos |

Benchmark de despliegue en PyTorch (16 muestras, 131,125 s de audio, clips de 4,525 a 15,450 s):

| Plataforma | Latencia media | Latencia mediana | p95 | RTF | Velocidad vs tiempo real | WER del set |
|---|---:|---:|---:|---:|---:|---:|
| CPU | 339,6 ms | 334,2 ms | 492,9 ms | 0,04144 | 24,13× | 14,167 % |
| GPU | 360,3 ms | 358,6 ms | 482,7 ms | 0,04396 | 22,75× | 14,167 % |

Los resultados son mediciones en Colab y dependen del hardware. No se han publicado resultados en benchmarks estándar como MMLU, HumanEval o GSM8K, que no aplican a un modelo ASR.

## Requisitos de hardware

- VRAM estimada para inferencia: el checkpoint en safetensors ocupa 106,96 MB; en FP32 requiere aproximadamente 110 MB de memoria, holgadamente por debajo de 1 GB.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM; el modelo cabe en GTX 1650, RTX 3050, RTX 4090, A100 o H100 sin problema. En la práctica, la GPU no aporta ventaja de latencia según el benchmark del autor (360,3 ms en GPU frente a 339,6 ms en CPU).
- Cabe en GPU de consumo: sí, en cualquier GPU consumer moderna e incluso en iGPU.
- Despliegue: compatible con `transformers` (clase `MoonshineForConditionalGeneration`) y el `AutoProcessor` correspondiente. No se documentan integraciones con vLLM, llama.cpp, Ollama o TGI; al ser un modelo ASR de 27 M, las opciones habituales son PyTorch/Transformers u ONNX si se exporta.
- Latencia y throughput: mediana de 334,2 ms en CPU con RTF de 0,04144 (24,13× tiempo real) para clips de 4,5 a 15,5 s. El throughput escala linealmente con la duración del audio procesado por lotes.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto/entrada | WER LibriSpeech | Licencia | Disponibilidad |
|---|---:|---|---:|---|---|
| SatellaSTT-27M | 27,1 M | audio 16 kHz, clips de segundos | 6,913 % (test-clean) | MIT | HuggingFace |
| Moonshine tiny (base) | ~27 M | audio 16 kHz | 4,995 % (test-clean) | MIT (según modelo base) | HuggingFace |
| Whisper tiny | 39 M | audio 16 kHz, ventana de 30 s | no disponible en esta ficha | MIT | HuggingFace / OpenAI |
| Whisper base | 74 M | audio 16 kHz, ventana de 30 s | no disponible en esta ficha | MIT | HuggingFace / OpenAI |

La comparación directa más relevante es con su modelo base: SatellaSTT-27M sacrifica 1,917 puntos de WER general para ganar 17,145 puntos en WER científico y 27,404 puntos en recall de términos de dominio. Frente a Whisper tiny o base, la ventaja es el tamaño reducido y la especialización científica; la desventaja es que no se han publicado comparaciones directas de WER entre ambos en esta información.

## Limitaciones y advertencias

- El audio científico de entrenamiento y la evaluación held-out son sintéticos (Kokoro); no hay validación con habla humana real en dominio científico, por lo que las cifras de WER científico no deben extrapolarse a producción sin evaluación propia.
- Persisten errores en nombres de organismos especializados: el autor cita *Aspergillus niger* y *Vibrio parahaemolyticus* como casos fallidos en held-out.
- El WER en inglés general empeora respecto al modelo base (4,995 % → 6,913 %), un compromiso explícito del ajuste fino.
- El recall de términos de dominio es una métrica de coincidencia de transcripción, no una validación clínica, diagnóstica ni regulatoria.
- Los valores científicos, unidades e identificaciones de organismos deben revisarse cuando la exactitud tenga consecuencias (clínica, publicación, cumplimiento).
- Solo inglés: no soporta otros idiomas.
- Licencia MIT: permite uso comercial, pero el autor no ofrece garantías ni soporte; el modelo base `UsefulSensors/moonshine-tiny` debe verificarse por si impone condiciones adicionales.
- No hay datos publicados sobre sesgos demográficos, acentos o ruido de fondo; el entrenamiento con voz sintética puede no representar la variabilidad de hablantes reales.
- Riesgo de alucinación en ASR: el modelo puede generar terminología plausible pero incorrecta en pasajes ambiguos o con ruido.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/EphAsad/SatellaSTT-27M
- Modelo base en HuggingFace: https://huggingface.co/UsefulSensors/moonshine-tiny
- Dataset científico: https://huggingface.co/datasets/EphAsad/STT-Science
- Dataset LibriSpeech ASR: https://huggingface.co/datasets/openslr/librispeech_asr
- Repositorio Moonshine AI: no disponible en la información proporcionada
- Paper de Moonshine: no disponible en la información proporcionada
- Demo: no disponible en la información proporcionada
