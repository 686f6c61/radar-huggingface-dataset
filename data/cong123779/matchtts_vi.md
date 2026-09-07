# Cong123779/Matchtts_VI

## Resumen

Matcha-TTS & Vocos TiVo es un sistema de síntesis de voz (text-to-speech) para vietnamita desarrollado por Cong123779. Combina el modelo Matcha-TTS original, basado en conditional flow matching con encoder RoPE, y el vocoder neuronal Vocos. El objetivo principal es proporcionar una síntesis de voz vietnamita de alta velocidad que pueda ejecutarse incluso en CPU, alcanzando entre 30 y 80 veces el tiempo real, con latencias de unos 97 ms con un solo paso. El modelo se distribuye con scripts de inferencia y entrenamiento, así como con normalizadores de texto específicos para vietnamita, lo que lo hace relevante para aplicaciones locales y despliegues ligeros. La frecuencia de muestreo es de 22.050 Hz en formato PCM-16. El tamaño del repositorio es de 0,1 GB.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Matcha-TTS (Conditional Flow Matching + RoPE Encoder) + Vocos Neural Vocoder |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | vietnamita (vi) |
| Licencia | MIT |
| Formato de pesos | PyTorch (.pt y .ckpt) |

## Arquitectura y entrenamiento

La arquitectura se compone de dos módulos entrenados conjuntamente. Por un lado, Matcha-TTS genera representaciones acústicas mediante un proceso de conditional flow matching (CFM), con un encoder basado en RoPE (Rotary Position Embedding). Por otro lado, el vocoder neuronal Vocos transforma esas representaciones en la forma de onda final. El sistema funciona a 22.050 Hz. El entrenamiento se ha realizado sobre un dataset propio no documentado en detalle, etiquetado como custom en Hugging Face. No se han publicado datos sobre cantidad de tokens, composición del corpus ni fases de alineación por RLHF o DPO. Se incluyen como innovaciones técnicas un normalizador de texto vietnamita que maneja números, fechas, horas y unidades de medida, y un transliterador de símbolos y palabras extranjeras. Además, el sistema permite ajustar la duración de las pausas según la puntuación mediante un archivo de configuración o una interfaz web.

## Capacidades

- Generación de voz en vietnamita a 22.050 Hz, con salida en WAV PCM-16.
- Normalización automática de texto: convierte números, fechas, horas y unidades de medida al formato hablado en vietnamita.
- Transliteración de caracteres y términos extranjeros para evitar fallos de pronunciación.
- Control de pausas y entonación mediante el parámetro de velocidad (`--speed`) y el número de pasos del solver ODE.
- Inferencia rápida en CPU: con un solo paso (`steps=1`) alcanza más de 80 veces el tiempo real.
- Interfaz de usuario web para ajustar la duración de pausas por signos de puntuación.
- Capacidad de entrenamiento o ajuste fino sobre el propagado dataset propio, mediante scripts incluidos.

No soporta tool calling, ni razonamiento multi-step, ni entrada multimodal (imagen, audio) más allá de la entrada de texto.

## Casos de uso

- Locución de vídeos en vietnamita: el modelo puede generar narraciones fluidas a partir de guiones, con una latencia muy baja incluso en CPU, lo que facilita la producción local sin necesidad de GPU.
- Accesibilidad para personas con discapacidad visual: sirve como motor de lectura de pantalla para documentos, noticias o interfaces en vietnamita, gracias a su normalización de texto y su control de pausas.
- Asistentes de voz en aplicaciones móviles: al ejecutarse con muy pocos recursos, es adecuado para dispositivos con CPU limitada, ofreciendo respuestas habladas en vietnamita en tiempo real.
- Aplicaciones de aprendizaje de idiomas: permite reproducir frases y diálogos con velocidad ajustable, útil para practicar la pronunciación y la comprensión auditiva.
- Doblaje automatizado de contenido digital: para podcasts, cursos o material didáctico en vietnamita, con calidad de audio comprensible y control sobre la entonación.
- Prototipado rápido de productos TTS: gracias a su pequeño tamaño y a los scripts de inferencia, se puede integrar en pruebas de concepto o pipelines de validación sin requerir infraestructura robusta.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks académicos en la información disponible. De la model card se extraen los siguientes datos de rendimiento en CPU:

| Metrica | Valor |
|---|---|
| Real-time factor | 30x – 80x |
| Latencia con `steps=1` | ~97 ms |
| Latencia con `steps=10` | ~260 ms |

## Requisitos de hardware

- La inferencia se puede ejecutar en CPU, como demuestran los tiempos de latencia reportados en la model card.
- El tamaño del repositorio es de 0,1 GB, por lo que la carga de pesos es ligera y puede acomodarse en GPU de consumo con poca memoria dedicada.
- VRAM estimada: no disponible.
- GPU recomendadas: no disponibles en la información proporcionada; el modelo funciona en CPU con rendimiento suficiente.
- Opciones de despliegue: script CLI `infer.py`, interfaz web `pause_control_web.py` y módulos de carga incluidos en el repositorio.
- Latencia y throughput: unos 97 ms por frase en CPU con `steps=1`; se recomienda ajustar el número de pasos entre 1 y 25 según la calidad deseada.

## Comparativa con modelos similares

No se ha proporcionado información sobre modelos comparables en los materiales revisados. La ficha no puede establecer una comparativa objetiva con otras alternativas TTS para vietnamita.

## Limitaciones y advertencias

- El modelo está limitado al idioma vietnamita; no se ha documentado soporte para otros idiomas.
- No se han publicado datos sobre sesgos, riesgos de alucinación ni robustez frente a textos ambiguos.
- La calidad y fiabilidad depende del dataset de entrenamiento personalizado, cuya composición no está publicada.
- La licencia MIT permite uso comercial, pero conviene revisar las dependencias y scripts de entrenamiento para verificar posibles restricciones no indicadas.
- No se han aportado resultados de benchmarks públicos, por lo que el rendimiento frente a otros sistemas TTS es desconocido.
- El modelo puede producir errores en nombres propios, términos técnicos o jerga no recogida en el normalizador.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Cong123779/Matchtts_VI
- Repositorio en GitHub: https://github.com/congkx123789/Matchtts_VI
