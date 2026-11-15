# Phoonnx/glowtts-de_de-karlsson

## Resumen

glowtts-de_de-karlsson es un modelo de síntesis de voz (text-to-speech) en alemán empaquetado en formato ONNX por Phoonnx para su librería de TTS homónima. El modelo original es un Glow-TTS desarrollado por Rhasspy dentro del proyecto Larynx, una iniciativa de voces locales para asistentes de voz offline. La variante "karlsson" corresponde a una voz concreta de alemán estándar (de-DE) entrenada sobre el pipeline de Larynx v1.0.

Glow-TTS es una arquitectura de síntesis no autorregresiva basada en normalizing flows que genera espectrogramas mel a partir de fonemas, que posteriormente son convertidos en audio por un vocoder HiFi-GAN. En este paquete, el vocoder utilizado es hifigan-multi-vctk-small, también distribuido por Phoonnx. El modelo no incluye el front-end de texto: la normalización y fonemización se delega a la librería scriptconv mediante el fonemizador gruut, que produce fonemas en alfabeto IPA.

Su relevancia actual radica en que permite ejecutar TTS en local sin dependencias de servicios en la nube, con un tamaño de repositorio de 0,1 GB y un formato ONNX optimizado para inferencia en CPU. Está pensado para integrarse en asistentes de voz como OVOS/Mycroft mediante el plugin ovos-tts-plugin-phoonnx, y su uso comercial queda condicionado a la licencia del release original de Rhasspy, que no está registrada en esta ficha.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Glow-TTS (normalizing flow, no autorregresiva) + vocoder HiFi-GAN |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo TTS, no lingüístico) |
| Tipos de cuantización | no disponible (pesos distribuidos en ONNX) |
| Idiomas soportados | alemán (de-DE) |
| Licencia | other (sin licencia registrada; consultar upstream de Rhasspy) |
| Formato de pesos | ONNX |
| Vocoder asociado | hifigan-multi-vctk-small |
| Entrada de texto | fonemas gruut en alfabeto IPA |
| Tamaño del repositorio | 0,1 GB |
| Pipeline | text-to-speech |
| Librería | phoonnx |

## Arquitectura y entrenamiento

Glow-TTS es un modelo generativo basado en normalizing flows que modela la distribución conjunta de espectrogramas mel y alineamientos monotónicos mediante un mecanismo de atención denominado Monotonic Alignment Search (MAS). A diferencia de los modelos TTS autorregresivos como Tacotron 2, Glow-TTS genera el espectrograma completo en paralelo, lo que reduce la latencia de inferencia y evita errores de alineamiento acumulativos. La arquitectura combina un encoder de texto (sobre fonemas) con un decoder de flujo invertible que transforma una distribución latente gaussiana en el espectrograma mel de salida.

El modelo se entrenó originalmente dentro del proyecto Larynx de Rhasspy (versión 1.0), orientado a voces de alta calidad ejecutables en local. No se dispone de información detallada sobre el corpus de entrenamiento (número de horas, hablantes, composición del dataset) ni sobre si se aplicaron técnicas de fine-tuning o adaptación sobre un modelo base multilingüe. El paquete de Phoonnx no reentrena el modelo: únicamente lo convierte a ONNX y lo integra con el vocoder HiFi-GAN, delegando la fonemización al front-end externo scriptconv con gruut.

## Capacidades

- Síntesis de voz en alemán estándar (de-DE) a partir de texto escrito.
- Generación de espectrogramas mel mediante Glow-TTS y conversión a audio mediante el vocoder HiFi-GAN.
- Fonemización automática del texto de entrada mediante gruut (scriptconv), con salida en alfabeto IPA.
- Ejecución local en CPU gracias al formato ONNX, sin necesidad de GPU.
- Integración con asistentes de voz OVOS/Mycroft mediante el plugin ovos-tts-plugin-phoonnx.
- Uso programático desde Python mediante TTSModelManager y el método synthesize_wav.
- No soporta tool calling, agentes, razonamiento multi-step ni otras capacidades de modelos generativos de texto.
- No dispone de modo thinking, visión ni audio de entrada.

## Casos de uso

- Asistentes de voz offline en alemán: integración en OVOS/Mycroft mediante mycroft.conf para que el asistente responda con voz sintética local, sin enviar texto a servicios externos y preservando la privacidad del usuario.
- Lectura de notificaciones y alertas en sistemas embebidos: el modelo cabe en 0,1 GB y corre en CPU, por lo que puede desplegarse en dispositivos de recursos limitados (Raspberry Pi, routers, electrodomésticos) para anunciar estados o eventos.
- Accesibilidad para personas con discapacidad visual: conversión de texto a voz en aplicaciones de lectura de pantalla en alemán, con latencia baja gracias a la generación no autorregresiva de Glow-TTS.
- Generación de audiolibros o contenido narrado en alemán: síntesis por lotes de textos largos divididos en frases, usando el pipeline de Python de phoonnx para producir archivos WAV.
- Pruebas de integración en pipelines de CI/CD para asistentes de voz: validación automatizada de respuestas TTS en tests de extremo a extremo sin depender de APIs externas.
- Prototipado de interfaces conversacionales en alemán: evaluación rápida de flujos de diálogo con voz sintética antes de invertir en grabaciones de voz humana o en servicios TTS comerciales.
- Investigación en síntesis de voz: uso como baseline reproducible de Glow-TTS en alemán para comparar con modelos más recientes (VITS, Piper, etc.) en condiciones controladas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica en el caso de ejecución en CPU; en GPU, el modelo es muy pequeño (repositorio de 0,1 GB), por lo que cabría en cualquier GPU con al menos 1 GB de memoria, aunque no se dispone de cifras oficiales.
- GPU recomendadas: no disponible. El modelo está optimizado para ONNX y puede ejecutarse en CPU; no se documentan GPU específicas.
- Cabe en GPU de consumo: sí, con cualquier GPU moderna (RTX 3060 o superior) e incluso en iGPU, dado el tamaño reducido del modelo.
- Opciones de despliegue: phoonnx (Python), plugin ovos-tts-plugin-phoonnx para OVOS/Mycroft, y ONNX Runtime de forma directa.
- Latencia y throughput estimados: no disponible. Glow-TTS es no autorregresivo y genera el espectrograma en paralelo, lo que reduce la latencia frente a arquitecturas autorregresivas, pero no se publican cifras concretas.

## Comparativa con modelos similares

| Modelo | Arquitectura | Idioma | Formato | Licencia | Tamaño | Contexto |
|---|---|---|---|---|---|---|
| glowtts-de_de-karlsson (este) | Glow-TTS + HiFi-GAN | de-DE | ONNX | other (sin registrar) | 0,1 GB | no aplica |
| Piper (rhasspy/piper) | VITS | multilingüe (incl. de) | ONNX | MIT | variable por voz | no aplica |
| Coqui TTS (XTTS v2) | GPT + flow matching | multilingüe | PyTorch | CPML (no comercial) | varios GB | no aplica |
| VITS original (jaywalnut310) | VITS | multilingüe | PyTorch | MIT | variable | no aplica |

La comparación se basa en características públicas de los proyectos; no se dispone de métricas de calidad (MOS, WER) para este modelo concreto que permitan una comparación cuantitativa.

## Limitaciones y advertencias

- La licencia no está registrada en la ficha ("other"); es imprescindible consultar el release original de Rhasspy (larynx v1.0) antes de cualquier uso comercial.
- El modelo solo soporta alemán (de-DE); no es multilingüe.
- Requiere un front-end de fonemización externo (gruut vía scriptconv) para funcionar; sin él, el modelo no procesa texto en bruto.
- Riesgo de alucinación acústica: como todo modelo TTS, puede producir pronunciaciones incorrectas en palabras poco frecuentes, nombres propios o términos técnicos no cubiertos por el fonemizador.
- Sesgos de voz: la voz "karlsson" representa un único hablante sintético; no hay diversidad de género, edad o acento dentro del modelo.
- No se documentan métricas de calidad (MOS, inteligibilidad) ni evaluaciones subjetivas.
- El modelo está empaquetado para la librería phoonnx, que se encuentra en estado pre-release (pip install --pre phoonnx); la estabilidad de la API no está garantizada.
- El repositorio tiene muy pocas descargas (34) y ningún "like", lo que sugiere una validación comunitaria limitada.
- No apto para tareas de generación de texto, razonamiento, código ni agentes; es exclusivamente un modelo TTS.

## Enlaces

- Hugging Face: https://huggingface.co/Phoonnx/glowtts-de_de-karlsson
- Vocoder HiFi-GAN: https://huggingface.co/Phoonnx/hifigan-multi-vctk-small
- Colección Glow-TTS de Phoonnx: https://huggingface.co/collections/Phoonnx/glow-tts-6af8ea830386ac5f126ba7e3
- Release original de Rhasspy Larynx v1.0: https://github.com/rhasspy/larynx/releases/download/v1.0/de-de_karlsson-glow_tts.tar.gz
- Librería phoonnx: https://github.com/TigreGotico/phoonnx
- Librería scriptconv: https://github.com/TigreGotico/scriptconv
- Proyecto Larynx (Rhasspy): https://github.com/rhasspy/larynx
