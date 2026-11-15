# Phoonnx/vits-bg_bg-cv

## Resumen

`vits-bg_bg-cv` es un modelo de síntesis de voz (text-to-speech) en búlgaro, basado en la arquitectura VITS de Coqui, empaquetado en formato ONNX para su uso con la librería phoonnx. El modelo original procede del release v0.8.0 de Coqui TTS (`tts_models--bg--cv--vits.zip`) y ha sido convertido y republicado por Phoonnx para su integración en pipelines de TTS ligeros basados en ONNX Runtime.

El modelo está entrenado sobre el corpus Common Voice en búlgaro (`bg-BG`) y utiliza una entrada de texto a nivel de caracteres (graphemes), sin fonemización compleja: phoonnx entrega el texto a la librería `scriptconv`, que lo normaliza y lo convierte mediante un `GraphemePhonemizer`. Su relevancia actual radica en que cubre un idioma con poca oferta de TTS open source de calidad (el búlgaro) y lo hace con una licencia permisiva BSD-3-Clause, lo que facilita su uso comercial sin las restricciones habituales de otros modelos TTS.

El repositorio es pequeño (0,1 GB) y contiene pesos ONNX, lo que lo hace desplegable incluso en entornos con recursos limitados. No es un modelo de gran escala ni un sistema neuronal moderno tipo diffusion o LLM-based TTS: es un VITS clásico, eficiente y determinista, adecuado para síntesis offline y para asistentes de voz embebidos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VITS (Coqui TTS) |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (modelo TTS, no aplica ventana de contexto) |
| Tipos de cuantizacion | no disponible (pesos distribuidos en ONNX; no se documentan variantes cuantizadas) |
| Idiomas soportados | búlgaro (`bg`, `bg-BG`) |
| Licencia | BSD-3-Clause |
| Formato de pesos | ONNX |

## Arquitectura y entrenamiento

VITS (Variational Inference with adversarial learning for end-to-end Text-to-Speech) es una arquitectura end-to-end que combina un encoder de texto, un prior/acoplamiento variacional, un decoder generativo basado en normalizing flows y un discriminador adversarial entrenado con pérdidas GAN, además de una pérdida de reconstrucción sobre el espectrograma. El resultado es un modelo que genera formas de onda directamente a partir de texto, sin vocoder externo, con inferencia rápida y determinista.

Los detalles concretos de entrenamiento de este checkpoint (número de tokens, composición exacta del dataset, número de pasos, hiperparámetros, si hubo fine-tuning adicional) no están documentados en la model card. Lo único confirmado es que el modelo upstream proviene de Coqui y que el corpus asociado es Common Voice en búlgaro, según la tabla de licencias del propio autor. La conversión a ONNX y el empaquetado para phoonnx son el trabajo de Phoonnx; no se documentan cambios en los pesos ni reentrenamiento.

## Capacidades

- Síntesis de voz (text-to-speech) en búlgaro a partir de texto plano.
- Entrada a nivel de caracteres (graphemes) mediante `GraphemePhonemizer` de `scriptconv`.
- Generación directa de forma de onda (WAV) sin vocoder separado.
- Integración con OVOS mediante el plugin `ovos-tts-plugin-phoonnx`.
- Ejecución en Python vía `phoonnx.model_manager` y `voice.synthesize_wav`.
- No se documentan capacidades de clonación de voz, control de estilo, multilingüismo, tool calling, agentes ni razonamiento; es un modelo TTS puro.

## Casos de uso

- Asistentes de voz embebidos en OVOS: el modelo se selecciona en `mycroft.conf` mediante el plugin `ovos-tts-plugin-phoonnx` y sintetiza respuestas en búlgaro en local, sin depender de servicios cloud.
- Síntesis offline en aplicaciones de escritorio: al distribuirse como ONNX de 0,1 GB, puede empaquetarse junto con la aplicación y ejecutarse en CPU sin conexión.
- Lectura de textos en búlgaro para accesibilidad: conversión de documentos, artículos o notificaciones a audio para usuarios con discapacidad visual, con latencia baja por la naturaleza determinista de VITS.
- Generación de audiolibros o locuciones automatizadas: producción por lotes de narraciones en búlgaro a partir de guiones de texto, usando `synthesize_wav` sobre ficheros WAV.
- Prototipado de interfaces conversacionales en búlgaro: evaluación rápida de UX de voz antes de invertir en modelos TTS comerciales, gracias a la licencia BSD-3-Clause.
- Integración en pipelines de CI/CD para pruebas de regresión de audio: al ser determinista y ligero, permite generar muestras de referencia y comparar salidas entre versiones.
- Sistemas de anuncios públicos o kioscos en búlgaro: síntesis local de mensajes dinámicos en entornos con hardware modesto y sin conectividad garantizada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; por el tamaño del repo (0,1 GB) y la arquitectura VITS, la huella de memoria es del orden de cientos de MB y cabe holgadamente en CPU.
- GPU recomendadas: no se documentan; VITS es lo bastante ligero para ejecutarse en CPU y en GPUs consumer modestas, aunque no hay cifras oficiales de latencia o throughput.
- Compatibilidad con consumer GPU: previsiblemente sí en cualquier GPU con unos pocos GB de VRAM, pero este dato no está confirmado en la información proporcionada.
- Opciones de despliegue: phoonnx (Python), plugin `ovos-tts-plugin-phoonnx` para OVOS, y ONNX Runtime como backend subyacente. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI (no aplican a TTS).
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Arquitectura | Idiomas | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|
| vits-bg_bg-cv (este) | VITS (Coqui) | búlgaro | BSD-3-Clause | ONNX | Hugging Face (Phoonnx) |
| Coqui TTS `tts_models--bg--cv--vits` (upstream) | VITS (Coqui) | búlgaro | BSD-3-Clause | checkpoint PyTorch | GitHub releases de Coqui |
| Otros VITS de la colección Phoonnx | VITS (Coqui) | varios idiomas | según checkpoint | ONNX | Hugging Face (Phoonnx) |

No se dispone de datos de rendimiento comparativo entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- Modelo monolingüe: solo búlgaro; no soporta otros idiomas ni code-switching.
- Entrada a nivel de caracteres: la calidad puede degradarse con texto no normalizado, abreviaturas, números o símbolos no cubiertos por el `GraphemePhonemizer`.
- Sin control de prosodia, emoción, estilo ni velocidad documentado.
- Riesgo de artefactos y pronunciaciones incorrectas en palabras poco frecuentes o nombres propios, inherente a los modelos VITS entrenados sobre Common Voice.
- Sesgos potenciales derivados del corpus Common Voice (dominio de voces y acentos presentes en el dataset); no se documenta análisis de sesgo.
- Licencia BSD-3-Clause permisiva para uso comercial, pero conviene verificar las condiciones del corpus Common Voice subyacente y las notas de licencia del upstream antes de un despliegue en producción.
- No se documentan garantías de calidad ni procesos de evaluación formales; uso en producción bajo responsabilidad del integrador.
- El modelo está empaquetado para phoonnx; usarlo fuera de ese ecosistema requiere gestionar manualmente la entrada ONNX y el front-end de texto.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Phoonnx/vits-bg_bg-cv
- Upstream (Coqui TTS v0.8.0): https://github.com/coqui-ai/TTS/releases/download/v0.8.0_models/tts_models--bg--cv--vits.zip
- Repositorio phoonnx: https://github.com/TigreGotico/phoonnx
- Repositorio scriptconv: https://github.com/TigreGotico/scriptconv
- Colección VITS de Phoonnx: https://huggingface.co/collections/Phoonnx/vits-6af8ea9ae9adb8b94ec31a65
