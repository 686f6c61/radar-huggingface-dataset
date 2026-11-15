# Phoonnx/vits-ha-openbible

## Resumen

vits-ha-openbible es un modelo de síntesis de voz (text-to-speech) basado en la arquitectura VITS, desarrollado originalmente por Coqui a partir del corpus OpenBible en hausa (código ISO `ha`). El modelo se distribuye empaquetado en formato ONNX por Phoonnx, una biblioteca de TTS en Python orientada a entornos OVOS (Open Voice OS). Su propósito es convertir texto en hausa en audio inteligible, cubriendo una lengua con recursos limitados dentro del ecosistema TTS.

El modelo no es una novedad arquitectónica: se trata de un VITS estándar de Coqui, extraído del release v0.6.2 de Coqui TTS y reconvertido a ONNX para su uso con la librería phoonnx. El front-end de texto es puramente grafémico (`GraphemePhonemizer` de scriptconv), es decir, no dispone de fonemizador específico para hausa, lo que limita la calidad de pronunciación en casos ambiguos.

Su relevancia es acotada: cubre una necesidad concreta (TTS en hausa para asistentes de voz y aplicaciones de accesibilidad) dentro de un ecosistema muy específico (OVOS/phoonnx), con un tamaño de repositorio de 0,1 GB y una licencia CC-BY-SA-4.0 que condiciona su uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VITS (Coqui TTS) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo TTS, no aplica ventana de contexto) |
| Tipos de cuantizacion | no disponible (pesos ONNX; no se documentan variantes cuantizadas) |
| Idiomas soportados | hausa (`ha`) |
| Licencia | CC-BY-SA-4.0 |
| Formato de pesos | ONNX (repo de 0,1 GB) |

## Arquitectura y entrenamiento

VITS es un modelo generativo end-to-end de síntesis de voz que combina un codificador de texto, un prior variacional, un decodificador basado en flujos normalizadores y un discriminador adversarial (GAN) para el entrenamiento. La inferencia produce directamente la forma de onda, sin necesidad de vocoder separado. El modelo aquí distribuido procede del release `v0.6.2` de Coqui TTS, correspondiente al checkpoint `tts_models--hau--openbible--vits`, entrenado sobre el corpus OpenBible en hausa.

No se dispone de información sobre el número de tokens de entrenamiento, la composición exacta del dataset, ni si se aplicaron etapas de RLHF/DPO (no aplicable en TTS). El autor del empaquetado (Phoonnx) no documenta detalles adicionales de entrenamiento; únicamente indica la procedencia upstream y el front-end grafémico utilizado en inferencia.

## Capacidades

- Síntesis de voz a partir de texto en hausa (grafemas, sin fonemización específica).
- Generación de audio en formato WAV mediante `voice.synthesize_wav(text, wav_file)`.
- Integración como plugin de TTS en OVOS (`ovos-tts-plugin-phoonnx`), seleccionable en `mycroft.conf`.
- Uso en Python mediante `phoonnx.model_manager.TTSModelManager` y la voz `coqui/hau-openbible-vits`.
- Normalización y conversión de texto delegadas a `scriptconv` (front-end grafémico `GraphemePhonemizer`).
- No soporta tool calling, agentes, razonamiento multi-paso, visión ni audio de entrada: es exclusivamente TTS.

## Casos de uso

- Asistentes de voz en OVOS para hablantes de hausa: el modelo se integra como plugin `ovos-tts-plugin-phoonnx` y permite respuestas habladas en hausa en un asistente doméstico, aprovechando la infraestructura existente de OVOS.
- Accesibilidad para lectores de pantalla en hausa: síntesis de texto de documentos o interfaces para usuarios con discapacidad visual, dado que el modelo es ligero (0,1 GB) y puede ejecutarse en local.
- Locución automatizada de contenidos religiosos o educativos: el corpus de origen (OpenBible) hace que el modelo sea adecuado para lectura de textos bíblicos y material formativo en hausa.
- Generación de audiolibros o notas de voz en hausa: conversión de texto plano a WAV mediante la API de phoonnx, adecuada para pipelines batch de bajo coste.
- Prototipado de aplicaciones de voz en lenguas de bajos recursos: sirve como línea base para evaluar TTS en hausa antes de invertir en modelos propietarios o de mayor tamaño.
- Integración en sistemas embebidos o de bajo consumo: al ser ONNX y de tamaño reducido, puede desplegarse en dispositivos con recursos limitados donde otros modelos TTS no caben.
- Investigación comparativa en TTS multilingüe: permite contrastar la calidad de un VITS entrenado en OpenBible frente a otros checkpoints de la colección VITS de Phoonnx.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; por el tamaño del repositorio (0,1 GB) se trata de un modelo ligero que cabe holgadamente en GPUs de consumo.
- GPU recomendadas: no documentadas por el autor. Un modelo VITS de este tamaño es ejecutable en CPU y en GPUs de gama baja; no requiere A100/H100.
- Cabe en GPU de consumo: sí, previsiblemente en cualquier GPU con al menos unos pocos GB de VRAM; también en CPU.
- Opciones de despliegue: phoonnx (Python), plugin `ovos-tts-plugin-phoonnx` para OVOS. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI (no aplicables a TTS de este tipo).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Arquitectura | Idioma | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Phoonnx/vits-ha-openbible | VITS (ONNX) | hausa | no aplica | CC-BY-SA-4.0 | Hugging Face (25 descargas) |
| Otros VITS de la colección Phoonnx | VITS (ONNX) | varios | no aplica | variable por checkpoint | Hugging Face |
| Coqui TTS `tts_models--hau--openbible--vits` | VITS | hausa | no aplica | CC-BY-SA-4.0 | Release de Coqui TTS (upstream) |

No se dispone de datos de rendimiento comparativo entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- Front-end puramente grafémico: sin fonemizador específico para hausa, la pronunciación puede ser imprecisa en palabras con ortografía ambigua.
- Idioma único: solo soporta hausa (`ha`); no es multilingüe.
- Licencia CC-BY-SA-4.0: permite uso comercial, pero obliga a atribución y a compartir las obras derivadas bajo la misma licencia, lo que puede ser incompatible con productos propietarios.
- Riesgo de alucinación acústica: como todo modelo generativo de audio, puede producir artefactos o pronunciaciones erróneas en entradas fuera de distribución.
- Sesgos: el corpus OpenBible condiciona el dominio y el registro; el modelo puede rendir peor en vocabulario coloquial, técnico o moderno no presente en el corpus.
- Sin datos públicos de benchmarks ni evaluación de calidad (MOS, WER) en la información disponible.
- Ecosistema restringido: el uso documentado se limita a phoonnx y OVOS; no hay integración oficial con frameworks TTS más extendidos.
- Repositorio con muy poca tracción (25 descargas, 0 likes): menor garantía de mantenimiento o soporte comunitario.

## Enlaces

- Hugging Face: https://huggingface.co/Phoonnx/vits-ha-openbible
- Upstream Coqui TTS (checkpoint): https://github.com/coqui-ai/TTS/releases/download/v0.6.2_models/tts_models--hau--openbible--vits.zip
- Repositorio phoonnx: https://github.com/TigreGotico/phoonnx
- Repositorio scriptconv: https://github.com/TigreGotico/scriptconv
- Colección VITS de Phoonnx: https://huggingface.co/collections/Phoonnx/vits-6af8ea9ae9adb8b94ec31a65
