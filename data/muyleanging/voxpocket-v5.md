# muyleanging/VoxPocket-v5

## Resumen

VoxPocket-v5 es un modelo de síntesis de voz (text-to-speech) especializado en jemer (khmer), desarrollado por el usuario muyleanging. Se construye como un ajuste fino de VoxCPM 1.5 y está pensado para leer texto en jemer, jemer con palabras en inglés intercaladas (code-mixing) e inglés plano, además de permitir clonación de voz a partir de un clip corto y control de estilo o descripción de voz. Con 801,7 millones de parámetros (0,89B) y una frecuencia de muestreo de 44,1 kHz, es una alternativa compacta frente a modelos TTS multilingües de mayor tamaño.

La relevancia del modelo radica en su enfoque en un idioma de bajos recursos como el jemer, donde la oferta de TTS de calidad es escasa. Según la model card, en sus pruebas internas supera en calidad de lectura a su modelo profesor VoxCPM2 (2,38B) siendo 2,7 veces más pequeño, un 33% más rápido y consumiendo un 38% menos de energía. Incorpora además soporte para emociones (susurro, enfado, alegría, sorpresa, tristeza) y lectura de texto largo, aunque con limitaciones documentadas en párrafos muy extensos.

El modelo se distribuye bajo licencia Apache 2.0, con pesos en formato safetensors y una librería propia (`voxcpm`) para su uso. Su tamaño contenido y su huella de memoria moderada lo hacen apto para despliegue en GPU de consumo, lo que facilita su integración en aplicaciones de accesibilidad, doblaje o asistentes de voz en jemer.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo TTS basado en VoxCPM 1.5; detalles de arquitectura interna no especificados en la informacion proporcionada) |
| Parametros totales | 801.729.856 (0,89B) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en safetensors; no se documentan cuantizaciones GGUF u otras) |
| Idiomas soportados | jemer (km), ingles (en); incluye jemer con palabras en ingles intercaladas |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de VoxCPM 1.5, ajustado previamente al jemer en la release VoxPocket-v4, y se entrena durante una pasada completa adicional. La model card no detalla la arquitectura interna (tipo de transformer, mecanismo de atención o módulos de difusión/vocoder), por lo que este dato no está disponible. La salida de audio se genera a 44,1 kHz y el modelo opera con parámetros de inferencia configurables como `cfg_value` (por defecto 2.0) y `inference_timesteps` (por defecto 10), lo que sugiere un proceso de generación iterativo tipo difusión o flow matching, aunque no se confirma explícitamente.

El entrenamiento utilizó 778.028 clips, equivalentes a unas 1.010 horas de audio único (1.247 horas contando el habla real dos veces). La composición incluye 237 horas de habla real en jemer con doble peso para preservar la naturalidad, aproximadamente 600 horas de habla sintética generada por VoxCPM2 y filtrada por un reconocedor de voz (solo se conservaron clips con ≤ 15% de error de letra), de las cuales 340 horas son datos nuevos con estilo y emoción, lectura larga multi-frase y frases en jemer con palabras en inglés. Se añadieron 157 horas de pares clip de voz + estilo para permitir el cambio de tono en voces clonadas. El entrenamiento usó tasa de aprendizaje 2e-5 con warm-up, batch efectivo de 18 clips y 43.200 pasos sobre una NVIDIA RTX 5090 de 32 GB. No se documenta el uso de RLHF o DPO.

## Capacidades

- Síntesis de voz en jemer con una tasa de error de letra mediana del 3,7% en frases no vistas (checkpoint principal, paso 30.000).
- Lectura de jemer con palabras en inglés intercaladas (code-mixing) y lectura de inglés plano.
- Clonación de voz a partir de un clip de referencia limpio de 4 a 9 segundos, junto con la transcripción exacta de lo que se dice en el clip.
- Control de estilo mediante etiquetas entre corchetes: susurro, enfado, alegría, sorpresa, tristeza, tono enérgico, calmado, tono de locutor de noticias, entre otros.
- Diseño de voz sin clip de referencia, describiendo la voz en corchetes (por ejemplo, "mujer joven, voz clara y brillante, tono alegre").
- Generación de audio a 44,1 kHz.
- Soporte de streaming con un tiempo hasta el primer sonido de 64 ms según la model card.
- No se documenta soporte de tool calling, function calling ni razonamiento multi-paso (no es un modelo de lenguaje general).

## Casos de uso

- Audiolibros y lectura de prensa en jemer: el modelo lee párrafos cortos (hasta unas 3 frases) con buena calidad; para textos largos se recomienda dividir en frases y unir el audio, lo que encaja en un pipeline de segmentación y concatenación.
- Doblaje y locución con emoción: gracias a las etiquetas de estilo (enfado, alegría, susurro, tristeza), se puede generar una misma línea con distintas interpretaciones para vídeo, publicidad o ficción.
- Clonación de voz para accesibilidad: una persona con dificultades del habla puede grabar un clip corto y usar el modelo para leer texto propio con su timbre, manteniendo la naturalidad gracias a las 237 horas de habla real con doble peso.
- Asistentes de voz y atención al cliente en jemer: integrado en un sistema de diálogo, el modelo convierte respuestas de texto en audio con baja latencia (64 ms hasta el primer sonido en streaming) y un consumo moderado de memoria (3,8 GB en texto corto).
- Localización de contenido con code-mixing: para medios o aplicaciones donde el jemer incorpora términos técnicos en inglés, el modelo lee frases mixtas sin cambiar de motor, algo habitual en contextos tecnológicos y académicos camboyanos.
- Diseño de voces para personajes o interfaces: la descripción de voz sin clip permite crear voces sintéticas para videojuegos, IVR o narraciones sin necesidad de disponer de un locutor.
- Generación de material educativo en jemer: lectura de lecciones y ejercicios con control de estilo y velocidad, útil para plataformas de aprendizaje de idiomas o alfabetización.

## Benchmarks y rendimiento

Resultados de la model card en 40 frases no vistas, con el mismo clip de voz, cfg 2.0, 10 pasos y semilla 0. La calidad se mide con un reconocedor de voz en jemer (`seanghay/Qwen3-ASR-0.6B-Khmer`) contando errores de letra (menor es mejor):

| 40 frases retenidas | Error mediano | Error medio | Frases con > 10% de errores |
|---|---|---|---|
| VoxPocket (esta release) | 4,3% | 6,1% | 8 / 40 |
| VoxPocket (release anterior) | 6,6% | 7,2% | 10 / 40 |
| VoxCPM2 (2,38B) | 4,8% | 7,0% | 12 / 40 |

En una segunda máquina, la model card reporta 3,7% (paso 30.000) frente a 5,1% de la release anterior. Los checkpoints posteriores (paso 35.000, 40.000 y final 43.200) obtienen un 4,0% de error mediano.

Rendimiento en 1× NVIDIA GeForce RTX 5090:

| Métrica | VoxPocket | VoxCPM2 |
|---|---|---|
| Parámetros | 0,89B | 2,38B |
| Velocidad | 3,6× tiempo real | 2,7× |
| Tiempo hasta el primer sonido (streaming) | 64 ms | 77 ms |
| Memoria GPU pico (texto corto / largo) | 3,8 / 6,3 GB | 6,5 / 8,9 GB |
| Potencia GPU durante el habla | 173 W | 205 W |
| Energía por minuto de habla | 0,80 Wh | 1,29 Wh |
| RAM de CPU | 1,9 GB | 3,1 GB |

## Requisitos de hardware

- VRAM estimada para inferencia: 3,8 GB con texto corto y 6,3 GB con texto largo en el benchmark del autor (RTX 5090, sin cuantización documentada).
- GPU recomendadas: NVIDIA RTX 5090 según las pruebas publicadas; por su huella de memoria, es plausible su uso en GPU de consumo con al menos 8 GB de VRAM, aunque no se documentan pruebas en otras tarjetas.
- Cabe en GPU de consumo: sí, según la memoria pico reportada (3,8–6,3 GB); se recomienda una GPU con 8 GB o más para texto largo.
- Opciones de despliegue: la librería `voxcpm` (con `VoxCPM.from_pretrained` y `load_denoiser=False`); no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: 3,6× tiempo real, 64 ms hasta el primer sonido en streaming, 173 W de potencia GPU y 0,80 Wh por minuto de habla en la RTX 5090; 1,9 GB de RAM de CPU.

## Comparativa con modelos similares

| Modelo | Parámetros | Idiomas | Contexto | Calidad (error mediano) | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| VoxPocket-v5 | 0,89B | jemer, inglés | no disponible | 4,3% (40 frases) | Apache 2.0 | Hugging Face |
| VoxCPM2 | 2,38B | no disponible en la información | no disponible | 4,8% (40 frases) | no disponible | modelo profesor citado |
| VoxPocket-v4 (release anterior) | no disponible | jemer, inglés | no disponible | 6,6% (40 frases) | Apache 2.0 | Hugging Face |

No se dispone de datos de otros modelos TTS de jemer comparables en la información proporcionada.

## Limitaciones y advertencias

- En párrafos muy largos (450+ caracteres) comete muchos errores y VoxCPM2 es mejor en ese escenario; se recomienda dividir el texto en frases.
- La clonación de voz requiere un clip limpio de 4 a 9 segundos y la transcripción exacta de lo dicho; clips ruidosos o mal transcritos degradan el resultado.
- Las palabras duplicadas con el signo jemer `ៗ` deben escribirse completas o expandirse en el paso de texto previo.
- No se documentan sesgos específicos, pero al entrenarse con habla real y sintética de jemer puede reflejar sesgos de los hablantes y del modelo profesor VoxCPM2.
- Riesgo de alucinación o artefactos en la pronunciación de palabras poco frecuentes, nombres propios o texto no visto; la métrica de error de letra mide inteligibilidad, no naturalidad prosódica.
- La licencia Apache 2.0 permite uso comercial, pero no se documentan restricciones adicionales sobre el uso de voces clonadas; es responsabilidad del usuario contar con consentimiento para clonar voces de terceros.
- El modelo está especializado en jemer e inglés; no se documenta soporte para otros idiomas.
- No se especifican requisitos de cuantización ni formatos alternativos a safetensors, lo que limita el despliegue en entornos sin la librería `voxcpm`.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/muyleanging/VoxPocket-v5
- Modelo base: https://huggingface.co/INGMUYLEANG/VoxPocket-v4
- Dataset de entrenamiento: https://huggingface.co/datasets/INGMUYLEANG/voxpocket-khmer-tts-v4
- Demo en Spaces: https://huggingface.co/spaces/INGMUYLEANG/VoxPocket-v4-demo
- Reconocedor de voz usado en la evaluación: https://huggingface.co/seanghay/Qwen3-ASR-0.6B-Khmer
