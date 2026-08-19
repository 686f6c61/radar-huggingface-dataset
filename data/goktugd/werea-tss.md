# GoktugD/Werea-TSS

## Resumen

Werea-TSS es un modelo de síntesis de voz (text-to-speech) en turco, desarrollado por la organización Werea y publicado a través del perfil de GoktugD como espejo oficial. Se trata de un fine-tune de parámetros completos sobre el modelo base FreyaTTS-small, con 183,2 millones de parámetros y licencia Apache-2.0. El modelo emplea una arquitectura no autorregresiva de flow-matching basada en un DiT (Diffusion Transformer) que genera audio a 48 kHz mono a partir de texto.

Su relevancia radica en ofrecer una alternativa abierta y ligera para síntesis de voz en turco, con un tamaño contenido que permite su ejecución en hardware modesto. El entrenamiento se realizó íntegramente con datos sintéticos generados a partir del propio modelo base, evitando grabaciones de personas reales, lo que lo hace adecuado para aplicaciones donde la privacidad de los datos es una preocupación. El modelo está pensado para anuncios organizacionales, accesibilidad, prototipos de asistentes de voz e investigación, y no para clonación de voz o suplantación de identidad.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Flow-matching DiT no autorregresivo (non-autoregressive flow-matching DiT) |
| Parametros totales | 183.198.145 (183,2 M) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo TTS, no procesa contexto textual largo; admite frases de longitud moderada) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | turco (tr) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

Werea-TSS es un modelo de síntesis de voz basado en un DiT (Diffusion Transformer) no autorregresivo con flow-matching. Utiliza un vocabulario de 92 caracteres turcos sin tokenizador ni módulo G2P (grapheme-to-phoneme), y opera sobre un espacio latente de AudioVAE2 de 25 Hz × 64 dimensiones. La generación se realiza mediante muestreo ODE de Euler con 32 pasos, y el decodificador AudioVAE2 (proveniente de VoxCPM2) permanece congelado durante el entrenamiento.

El proceso de entrenamiento se realizó en dos etapas: una primera con 960 frases turcas únicas (aproximadamente 1,19 horas de audio) y una segunda con 312 frases cortas adicionales para control de expresiones breves. Las voces "profesor" se generaron sintéticamente a partir del modelo base FreyaTTS-small con una semilla fija (`20260814`), y los metadatos de origen y semilla se registraron en manifiestos. El checkpoint seleccionado, `conservative-step75`, se obtuvo con una tasa de aprendizaje de 2e-6 y un batch efectivo de 8. Se descartó un checkpoint más agresivo de la etapa 2 por degradación de calidad.

## Capacidades

- Síntesis de voz en turco a 48 kHz mono, con salida en formato WAV.
- Generación de audio a partir de texto plano, sin necesidad de transcripción fonética.
- Reproducibilidad de la voz mediante semilla fija (`seed=20260814` para la identidad de Werea).
- Adecuado para frases de longitud moderada; no soporta control emocional ni clonación de voz mediante referencia de audio.
- Integrable con la librería `freyatts` (código de inferencia incluido en el repositorio).
- No requiere GPU para inferencia básica; puede ejecutarse en CPU con tiempos razonables para frases cortas.

## Casos de uso

- Anuncios organizacionales en turco: el modelo puede generar locuciones para comunicados internos o externos de empresas y organismos, con una voz neutra y clara, gracias a su entrenamiento específico en frases declarativas.
- Accesibilidad para personas con discapacidad visual: integración en lectores de pantalla o aplicaciones de accesibilidad que necesiten convertir texto turco en voz de forma local y sin depender de servicios en la nube.
- Prototipos de asistentes de voz: desarrollo rápido de asistentes conversacionales en turco, donde el TTS se combina con un motor de diálogo; la baja latencia del modelo permite respuestas casi en tiempo real.
- Investigación académica en síntesis de voz: al ser Apache-2.0 y estar documentado el proceso de entrenamiento, sirve como punto de partida para experimentos con fine-tuning o evaluación de arquitecturas flow-matching en idiomas de bajos recursos.
- Sistemas de respuesta de voz interactiva (IVR): generación de menús telefónicos automatizados en turco, con frases cortas y controladas, sin necesidad de estudios de grabación.
- Contenido audiovisual educativo: locución de materiales didácticos, podcasts o vídeos formativos en turco, siempre que se indique que la voz es sintética.

## Benchmarks y rendimiento

El autor proporciona una evaluación interna realizada con `faster-whisper-small` sobre un conjunto de 20 frases turcas de evaluación, separadas del entrenamiento. Los resultados se comparan con el modelo base FreyaTTS en las mismas condiciones:

| Modelo | WER ↓ | CER ↓ | Audio válido |
|---|---:|---:|---:|
| FreyaTTS base (mismas condiciones) | 27,22 % | 9,44 % | 20/20 |
| Werea-TSS (checkpoint seleccionado) | 29,11 % | 10,08 % | 20/20 |
| Checkpoint agresivo de Stage-2 (rechazado) | 48,10 % | 17,02 % | 20/20 |

El autor advierte que estos resultados no deben compararse directamente con el benchmark público Freya-TR-Eval, ya que el conjunto de evaluación es propio y de tamaño reducido. No se han publicado resultados en benchmarks estándar como LJSpeech o Common Voice.

## Requisitos de hardware

- VRAM estimada: no disponible oficialmente, pero con 183 M de parámetros y pesos en safetensors (~0,7 GB), la inferencia en FP32 requiere aproximadamente 0,7 GB de memoria; en CPU puede ejecutarse sin GPU.
- GPU recomendada: cualquier GPU con al menos 2 GB de VRAM (por ejemplo, NVIDIA GTX 1650 o superior) es suficiente para generación en tiempo real; una RTX 4090 o A100 permitiría procesamiento por lotes.
- Compatibilidad con GPU de consumo: sí, cabe en GPUs de gama baja y media, así como en CPU para frases cortas.
- Opciones de despliegue: la librería `freyatts` (incluida en el repositorio) es la vía principal; no se menciona soporte para vLLM, llama.cpp, Ollama ni TGI, ya que no es un modelo de lenguaje.
- Latencia y throughput: no disponible; se estima que la generación de una frase de 10 palabras (≈ 3 segundos de audio) toma menos de 1 segundo en una GPU moderna y entre 2 y 5 segundos en CPU.

## Comparativa con modelos similares

No se dispone de una comparativa exhaustiva con otros modelos TTS turcos en la información proporcionada. Como referencia, se compara con su modelo base:

| Modelo | Parámetros | Salida | Licencia | WER (eval interna) |
|---|---|---:|---|---:|
| FreyaTTS-small (base) | 183,2 M | 48 kHz | Apache-2.0 | 27,22 % |
| Werea-TSS | 183,2 M | 48 kHz | Apache-2.0 | 29,11 % |

Otros TTS multilingües como XTTS v2 o Coqui TTS podrían ser comparables en funcionalidad, pero no se han publicado resultados en las mismas condiciones. La ventaja de Werea-TSS es su foco exclusivo en turco y su licencia permisiva.

## Limitaciones y advertencias

- El modelo está en fase beta; puede cometer errores con nombres propios, palabras extranjeras y frases excesivamente largas.
- No soporta control emocional ni clonación de voz mediante audio de referencia; la voz es fija y determinista con la semilla dada.
- La evaluación interna muestra un WER ligeramente superior al del modelo base (29,11 % vs 27,22 %), lo que sugiere una ligera pérdida de inteligibilidad en el fine-tune.
- Es obligatorio indicar a los usuarios finales que la voz es sintética, especialmente en contenidos públicos.
- Los resultados de la evaluación no son comparables con benchmarks estándar de TTS; se recomienda validar con datos propios antes de usar en producción.
- No debe utilizarse para suplantar la identidad de personas reales ni para fines fraudulentos.
- La licencia Apache-2.0 permite uso comercial, pero se deben conservar los avisos de atribución y modificación (ver archivos `NOTICE` y `LICENSE`).

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/GoktugD/Werea-TSS
- Repo espejo oficial (Werea-co): https://huggingface.co/Werea-co/Werea-TSS
- Modelo base FreyaTTS: https://huggingface.co/freyavoice/Freya-TTS
- Repositorio de código FreyaTTS: https://github.com/freyavoiceai/FreyaTTS
