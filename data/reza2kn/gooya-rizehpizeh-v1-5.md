# Reza2kn/Gooya-RizehPizeh-v1.5

## Resumen
Gooya RizehPizeh v1.5 es un modelo de síntesis de voz (text-to-speech) en persa (farsi) desarrollado por Reza2kn para el motor Piper. Se trata de un fine-tune de un checkpoint maduro del modelo persa Mana Persian Piper, continuando su entrenamiento en lugar de partir de cero. El modelo emplea una arquitectura VITS (Variational Inference with adversarial Training for end-to-end Text-to-Speech) con un front-end G2P mejorado (Negara v7.1) que permite generar fonemas directamente desde el texto sin depender de espeak-ng en inferencia.

Con aproximadamente 23,7 millones de parámetros en el generador, es un modelo compacto y eficiente, diseñado para una sola voz femenina (single-speaker) a 22050 Hz. Su relevancia radica en ofrecer una voz persa de alta calidad para Piper, un motor TTS ligero y multiplataforma, con licencia MIT que permite uso comercial sin restricciones. El modelo se distribuye en formato ONNX listo para inferencia, junto con su configuración JSON y el checkpoint de entrenamiento.

## Especificaciones técnicas
| Parametro | Valor |
|---|---|
| Arquitectura | VITS (Piper) con 6 flow layers, 2 attention heads, resblock 2, upsampling rates [8, 8, 4] |
| Parametros totales | 23 663 792 (generador, ~23,7 M) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (no aplica a TTS) |
| Tipos de cuantizacion | no disponible (formato ONNX estándar) |
| Idiomas soportados | fa (persa/farsi) |
| Licencia | MIT |
| Formato de pesos | ONNX (inferencia) y PyTorch checkpoint (.ckpt) |

## Arquitectura y entrenamiento
El modelo sigue la arquitectura VITS de Piper, con `hidden_channels` de 192, `filter_channels` de 768, `inter_channels` de 192, 6 capas de flujo, 2 cabezas de atención, `resblock 2`, y tasas de upsampling `[8, 8, 4]` con canal inicial de 256. Usa 80 canales mel y tiene `use_sdp` activado (Stochastic Duration Predictor). El vocabulario consta de 157 tokens de fonemas (tipo `text`), mapeados a través del inventario de 256 símbolos del modelo Mana, incluyendo tokens de control `^`, `_` y `$`.

El entrenamiento partió del checkpoint Mana Persian Piper (`epoch=6012-step=4203520.ckpt`, con SDP habilitado) y se continuó con el dataset AvaSanj clean-core v2, que contiene 102 584 utterances. Las etiquetas de fonemas se reconstruyeron mediante una política de escucha out-of-fold (OOF) que combina varias fuentes: 48 656 filas con margen OOF de ASR ≥ 0,1, 42 244 prompts aprobados sin cambios, 11 342 con consenso de tres oyentes, 41 anotaciones humanas y 301 revisiones humanas con overlay v7.1. En total, 28 253 filas se modificaron respecto al prompt original, lo que refleja la mejora del G2P. El split fue 5% para validación y 0 ejemplos de prueba.

## Capacidades
- Síntesis de voz en persa (farsi) a partir de texto, con una sola voz femenina.
- Frecuencia de muestreo de 22050 Hz, adecuada para audio de calidad estándar.
- Entrada de texto fonémico (`phoneme_type: text`), lo que elimina la dependencia de espeak-ng en tiempo de inferencia.
- Integración nativa con Piper: se puede invocar desde la línea de comandos con `piper -m gooya-fa.onnx -c gooya-fa.onnx.json`.
- Escalas de inferencia configurables: `noise_scale 0.667`, `length_scale 1.0`, `noise_w 0.8` (valores por defecto incluidos en el JSON).
- Modelo compacto (~23,7 M parámetros) adecuado para despliegue en entornos con recursos limitados.
- Licencia MIT que permite uso comercial y modificación sin restricciones.

## Casos de uso
- Asistentes de voz en persa: integración en aplicaciones de asistencia por voz (smart speakers, chatbots con salida oral) para interactuar con usuarios persas de forma natural.
- Audiolibros y narración: generación de audio para libros, artículos o noticias en persa, aprovechando la calidad de la voz y la licencia permisiva.
- Accesibilidad: conversión de texto a voz para personas con discapacidad visual o dificultades de lectura, en aplicaciones web o móviles.
- Sistemas de respuesta interactiva (IVR): uso en centralitas telefónicas o servicios de atención al cliente que requieran locuciones en persa.
- Educación y aprendizaje de idiomas: generación de ejemplos de pronunciación para estudiantes de persa, con control sobre la velocidad mediante `length_scale`.
- Contenido multimedia: doblaje o locución de vídeos, podcasts o presentaciones en persa, sin necesidad de contratar actores de voz.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware
- No se dispone de datos oficiales sobre VRAM o requisitos mínimos.
- Por el tamaño del modelo (~23,7 M parámetros) y su formato ONNX, es razonable esperar que pueda ejecutarse en CPU sin GPU, aunque no hay cifras confirmadas.
- Piper está diseñado para ser ligero y funciona en Raspberry Pi y otros dispositivos de bajos recursos; este modelo sigue esa filosofía.
- Opciones de despliegue: Piper CLI (llama.cpp, Ollama no aplican a TTS), servidor HTTP de Piper, o integración en aplicaciones Python mediante la librería `piper-tts`.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares
No se dispone de información sobre modelos comparables en la consulta. Se sugiere evaluar frente a otras voces persas de Piper o modelos TTS como Coqui TTS o ESPnet, pero no hay datos concretos para una comparación rigurosa.

## Limitaciones y advertencias
- Modelo single-speaker: solo genera una voz femenina concreta; no admite múltiples hablantes.
- Soporte exclusivo para persa (fa); no funciona con otros idiomas.
- La calidad del audio depende del front-end G2P Negara v7.1; si se usa el modelo fuera del ecosistema Piper, es necesario replicar ese mapeo de fonemas.
- No se mencionan sesgos específicos, pero al ser un modelo entrenado con un dataset concreto (AvaSanj clean-core v2), puede reflejar variaciones dialectales o acentos limitados.
- Riesgo de alucinación: no aplica directamente a TTS, pero pueden producirse errores de pronunciación en palabras fuera del vocabulario de entrenamiento.
- El checkpoint de entrenamiento se proporciona para reanudar el entrenamiento, pero no es necesario para inferencia.
- Aunque la licencia MIT permite uso comercial, es responsabilidad del usuario verificar que los datos de entrenamiento (AvaSanj) no tengan restricciones adicionales de uso.

## Enlaces
- Modelo en HuggingFace: https://huggingface.co/Reza2kn/Gooya-RizehPizeh-v1.5
- Repositorio de Piper: https://github.com/rhasspy/piper
- Modelo base (Piper voices): https://huggingface.co/rhasspy/piper-voices
