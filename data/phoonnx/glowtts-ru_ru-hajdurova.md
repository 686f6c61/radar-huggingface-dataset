# Phoonnx/glowtts-ru_ru-hajdurova

## Resumen

GlowTTS-ru_ru-hajdurova es un modelo de síntesis de voz (text-to-speech) en ruso, originalmente entrenado por Rhasspy dentro del proyecto Larynx v1.0 y empaquetado por Phoonnx en formato ONNX para su uso con la librería `phoonnx`, una biblioteca de TTS basada en ONNX orientada a asistentes de voz como OVOS/Mycroft. El modelo genera un espectrograma a partir de fonemas IPA rusos y delega la síntesis de audio final en el vocoder HiFi-GAN (variante `hifigan-multi-vctk-small`).

La arquitectura subyacente es Glow-TTS, un modelo normalizing flow no autorregresivo que mapea secuencias de fonemas a espectrogramas mel de forma paralela, lo que permite una inferencia rápida sin dependencias de alineamientos externos. El paquete contiene únicamente los pesos ONNX (0,1 GB), lo que lo hace ligero y adecuado para despliegues en CPU o entornos con recursos limitados.

Su relevancia actual es acotada: se trata de un modelo heredado de Larynx v1.0, redistribuido para el ecosistema phoonnx, con una única voz femenina rusa (Hajdurova) y sin licencia claramente registrada. Es útil para integraciones rápidas de TTS en ruso dentro de asistentes de voz de código abierto, pero no para producción comercial sin verificar antes la licencia upstream.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Glow-TTS (normalizing flow) + vocoder HiFi-GAN |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (TTS por frase; sin ventana de contexto definida) |
| Tipos de cuantizacion | ONNX (pesos exportados; no se documentan variantes de cuantización) |
| Idiomas soportados | ruso (ru-RU) |
| Licencia | other (no se registra licencia concreta; verificar upstream) |
| Formato de pesos | ONNX (repo de 0,1 GB) |

## Arquitectura y entrenamiento

Glow-TTS es un modelo generativo basado en normalizing flows que transforma una distribución latente en un espectrograma mel condicionado por la secuencia de fonemas. A diferencia de los modelos autorregresivos tipo Tacotron, permite síntesis paralela y utiliza un mecanismo de alineamiento monotónico (MAS) durante el entrenamiento para aprender la correspondencia entre fonemas y frames sin supervisión explícita de duraciones. En este paquete, el modelo Glow-TTS produce el espectrograma y un vocoder HiFi-GAN (`hifigan-multi-vctk-small`) lo convierte en forma de onda de audio.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o ajuste fino posteriores. El modelo procede del release v1.0 de Larynx de Rhasspy, un proyecto de TTS para asistentes de voz, y ha sido reconvertido a ONNX por Phoonnx. El front-end textual se delega en `scriptconv` con el fonemizador Gruut, que normaliza el texto ruso y lo convierte a fonemas IPA antes de la inferencia.

## Capacidades

- Síntesis de voz en ruso (ru-RU) a partir de texto plano, con salida en formato WAV.
- Conversión texto a fonemas IPA mediante Gruut (`scriptconv[gruut]`), con normalización previa del texto.
- Generación de espectrogramas mel y síntesis de audio mediante vocoder HiFi-GAN integrado.
- Integración con asistentes de voz OVOS/Mycroft a través del plugin `ovos-tts-plugin-phoonnx`.
- Uso programático en Python mediante `TTSModelManager` y la API `synthesize_wav`.
- No soporta tool calling, agentes, razonamiento multi-paso, visión, audio de entrada ni modo thinking.
- Capacidad multilingüe: únicamente ruso; no se documentan otras lenguas.
- Una sola voz disponible: `larynx/ru-ru-hajdurova-glow_tts`.

## Casos de uso

- Asistentes de voz domésticos en ruso: integración directa con OVOS/Mycroft mediante el plugin `ovos-tts-plugin-phoonnx`, configurando la voz en `mycroft.conf` para respuestas habladas del asistente.
- Lectura de notificaciones y alertas en aplicaciones de escritorio o IoT: el modelo es ligero (0,1 GB) y puede ejecutarse en CPU, lo que permite sintetizar mensajes cortos en tiempo real en dispositivos con recursos limitados.
- Accesibilidad para personas con discapacidad visual: conversión de texto a voz en ruso para lectores de pantalla o aplicaciones de lectura de documentos.
- Generación de audiolibros o contenido narrado de forma automatizada: al ser no autorregresivo, permite sintetizar frases de forma paralela y con baja latencia.
- Pruebas y prototipado de pipelines TTS en ruso: sirve como baseline ligero para comparar con modelos más modernos (VITS, XTTS) antes de invertir en infraestructura mayor.
- Integración en sistemas de respuesta interactiva de voz (IVR) en ruso: síntesis de mensajes pregrabados dinámicamente en entornos telefónicos o de atención automatizada.
- Investigación en fonética y prosodia rusa: al exponer fonemas IPA como entrada, facilita experimentos controlados sobre pronunciación y alineamiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible con precisión; por el tamaño del repo (0,1 GB) y la arquitectura Glow-TTS + HiFi-GAN small, la inferencia cabe holgadamente en menos de 1 GB de memoria.
- GPU recomendadas: cualquier GPU moderna es suficiente; no requiere A100 ni H100. Una GTX 1060 o superior ya ofrece margen amplio.
- Cabe en GPU de consumo: sí, en cualquier GPU consumer con al menos 1-2 GB de VRAM libre; también funciona en CPU.
- Opciones de despliegue: `phoonnx` (Python), plugin `ovos-tts-plugin-phoonnx` para OVOS/Mycroft; el formato ONNX permite usar ONNX Runtime directamente.
- Latencia y throughput: no disponibles de forma oficial; por la naturaleza no autorregresiva de Glow-TTS se espera baja latencia en CPU, pero no se aportan cifras concretas.

## Comparativa con modelos similares

| Modelo | Arquitectura | Idioma | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| glowtts-ru_ru-hajdurova (este) | Glow-TTS + HiFi-GAN | ru-RU | no aplica (TTS) | other (sin especificar) | Hugging Face, ONNX |
| Larynx v1.0 (upstream) | Glow-TTS + HiFi-GAN | ru-RU | no aplica (TTS) | ver licencia upstream | GitHub releases (tar.gz) |
| VITS (modelos rusos comunitarios) | VITS (end-to-end) | ru-RU | no aplica (TTS) | variable según modelo | Hugging Face |
| XTTS v2 (Coqui) | GPT + VQ-VAE | multilingüe (incl. ru) | limitado por frase | Coqui Public Model License (no comercial) | Hugging Face |

No se dispone de datos de rendimiento comparativo (MOS, RTF) en la información proporcionada.

## Limitaciones y advertencias

- Licencia no registrada: la model card indica explícitamente que no hay licencia documentada y recomienda verificar el release upstream antes de cualquier uso; no es apta para producción comercial sin aclarar este punto.
- Modelo heredado: procede de Larynx v1.0, un proyecto que ya no está en desarrollo activo, por lo que no recibirá mejoras ni correcciones.
- Una única voz (femenina, Hajdurova) y un único idioma (ruso); no hay variantes ni control de estilo, emoción o prosodia.
- Calidad de síntesis no documentada: no se publican métricas MOS ni comparativas subjetivas.
- Riesgo de alucinación acústica: como todo TTS neuronal, puede producir pronunciaciones incorrectas en palabras desconocidas, siglas o nombres propios no cubiertos por el fonemizador Gruut.
- Dependencia del front-end: errores en la normalización de `scriptconv` o en el fonemizador Gruut afectan directamente a la calidad de la síntesis.
- Sin soporte de SSML avanzado ni control fino de duración o entonación documentado.
- El vocoder se descarga por separado desde el repositorio de Phoonnx; requiere conectividad en el primer uso.
- Escaso soporte comunitario: 33 descargas y 0 likes en el momento de la consulta.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Phoonnx/glowtts-ru_ru-hajdurova
- Release upstream (Larynx v1.0): https://github.com/rhasspy/larynx/releases/download/v1.0/ru-ru_hajdurova-glow_tts.tar.gz
- Repositorio phoonnx: https://github.com/TigreGotico/phoonnx
- Repositorio scriptconv: https://github.com/TigreGotico/scriptconv
- Vocoder HiFi-GAN: https://huggingface.co/Phoonnx/hifigan-multi-vctk-small
- Colección Glow-TTS para phoonnx: https://huggingface.co/collections/Phoonnx/glow-tts-6af8ea830386ac5f126ba7e3
- Proyecto Larynx (Rhasspy): https://github.com/rhasspy/larynx
