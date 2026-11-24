# muyleanging/VoxPocket-TTS-Khmer

## Resumen

VoxPocket-TTS-Khmer es un modelo de síntesis de voz (text-to-speech) especializado en jemer (khmer) y en code-mixing jemer-inglés, desarrollado por el usuario muyleanging a partir de un fine-tuning del modelo base openbmb/VoxCPM1.5. Con aproximadamente 0,89B parámetros (801.729.856 según los safetensors), genera audio a 44,1 kHz y está diseñado para leer jemer con claridad, clonar voces a partir de clips cortos y aplicar estilos emocionales o descripciones de voz.

El modelo resuelve el problema de la baja disponibilidad de TTS de calidad para jemer, un idioma de bajos recursos, y lo hace con un tamaño contenido que permite inferencia en GPU de consumo. Su relevancia actual radica en que supera en precisión de lectura a su modelo profesor VoxCPM2 (2,38B) en sus pruebas internas, siendo 2,7 veces más pequeño, un 33% más rápido y consumiendo un 38% menos energía.

La arquitectura subyacente es la de VoxCPM (no se detalla en la información disponible más allá de la librería voxcpm), con pesos en safetensors, licencia Apache 2.0 y soporte para jemer (km) e inglés (en).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VoxCPM (fine-tuning de openbmb/VoxCPM1.5); detalles internos no disponibles |
| Parametros totales | 801.729.856 (~0,89B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | jemer (km), ingles (en); incluye code-mixing jemer-ingles |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |
| Frecuencia de muestreo | 44.1 kHz |
| Libreria | voxcpm |

## Arquitectura y entrenamiento

El modelo parte del checkpoint previo de VoxPocket (VoxCPM 1.5 fine-tuneado en jemer) y se entrena durante una pasada completa adicional de 43.200 pasos, con learning rate 2e-5 con warm-up y batch efectivo de 18 clips. No se detalla en la información disponible la arquitectura interna (transformer, difusión, etc.) más allá de que pertenece a la familia VoxCPM y usa la librería voxcpm.

Los datos de entrenamiento suman 778.028 clips y aproximadamente 1.010 horas de audio único (1.247 h contando el habla real dos veces): 237 h de habla real jemer con doble peso, unas 600 h de habla sintética generada por VoxCPM2 y filtrada por un reconocedor de voz (se conservan solo clips con ≤15% de error de letras), incluyendo 340 h nuevas de habla estilizada y emocional, lectura larga multi-frase y frases jemer con palabras inglesas, más 157 h de pares clip de voz + estilo para permitir cambio de tono en voces clonadas. No se menciona RLHF ni DPO en la información disponible.

## Capacidades

- Síntesis de voz en jemer a 44,1 kHz con una mediana de 3,7% de error de letras en frases no vistas (checkpoint principal, paso 30.000).
- Lectura de jemer mezclado con palabras en inglés y de inglés plano.
- Clonación de voz a partir de un clip limpio de 4-9 segundos junto con la transcripción exacta de lo que se dice en él.
- Control de estilo emocional mediante etiquetas entre corchetes: susurro, enfado, alegría, sorpresa, tristeza, excitación, calma, tono serio de locutor.
- Diseño de voz sin clip de referencia, describiendo la voz y el tono entre corchetes.
- Generación de audio en streaming con tiempo hasta el primer sonido de 64 ms.
- Lectura de párrafos cortos (hasta ~3 frases) en una sola pasada; para textos largos se recomienda dividir en frases.
- No se documentan en la información disponible capacidades de tool calling, agentes, visión ni audio de entrada.

## Casos de uso

- Locución de noticias y contenido editorial en jemer: el modelo incluye un estilo "serious and clear news-reader tone" y lee párrafos cortos de forma fiable, adecuado para generar boletines o artículos narrados.
- Audiolibros y lectura de documentos: dividiendo el texto en frases y uniendo el audio, se puede narrar contenido largo con una voz clonada consistente.
- Atención al cliente y asistentes de voz en jemer: la clonación de voz y el streaming con 64 ms hasta el primer sonido permiten respuestas conversacionales de baja latencia.
- Doblaje y localización de contenido: el soporte de code-mixing jemer-inglés permite leer guiones que mezclan préstamos ingleses, habituales en el habla real jemer.
- Generación de voz con matices emocionales para videojuegos o podcasts: las etiquetas de estilo (susurro, enfado, alegría, tristeza) permiten variar el tono de un mismo personaje clonado.
- Accesibilidad y lectores de pantalla: síntesis local en GPU de consumo (3,8 GB de VRAM en texto corto) para convertir texto jemer en voz en entornos con recursos limitados.
- Creación de voces sintéticas personalizadas: el modo de diseño de voz sin clip permite generar voces descritas por texto para prototipos y demos.

## Benchmarks y rendimiento

Resultados de lectura sobre 40 frases no vistas, con el mismo clip de voz, cfg 2.0, 10 pasos y semilla 0; el error se mide con el reconocedor seanghay/Qwen3-ASR-0.6B-Khmer contando errores de letras jemer (menor es mejor):

| Modelo | Error mediano | Error medio | Frases con >10% de errores |
|---|---|---|---|
| VoxPocket (esta version) | 4,3% | 6,1% | 8/40 |
| VoxPocket (version anterior) | 6,6% | 7,2% | 10/40 |
| VoxCPM2 (2,38B) | 4,8% | 7,0% | 12/40 |

En una segunda máquina, el mismo test da 3,7% (paso 30.000) frente a 5,1% de la versión anterior.

Rendimiento en 1× NVIDIA GeForce RTX 5090:

| Metrica | VoxPocket | VoxCPM2 |
|---|---|---|
| Parametros | 0,89B | 2,38B |
| Velocidad | 3,6× tiempo real | 2,7× |
| Tiempo hasta el primer sonido (streaming) | 64 ms | 77 ms |
| Memoria GPU pico (texto corto / largo) | 3,8 / 6,3 GB | 6,5 / 8,9 GB |
| Potencia GPU hablando | 173 W | 205 W |
| Energia por minuto de habla | 0,80 Wh | 1,29 Wh |
| RAM de CPU | 1,9 GB | 3,1 GB |

Checkpoints alternativos: paso 35.000 y 40.000 con 4,0% de error mediano, y final-43.200 con 4,0%.

## Requisitos de hardware

- VRAM estimada para inferencia: 3,8 GB de pico en texto corto y 6,3 GB en texto largo (medido en RTX 5090).
- RAM de CPU: 1,9 GB.
- GPU recomendadas: NVIDIA RTX 5090 (referencia de las pruebas); por el bajo consumo de VRAM, cabe en GPU de consumo con al menos ~6-7 GB libres para texto largo.
- Cabe en GPU de consumo: sí, según las cifras de memoria pico (3,8-6,3 GB); no se detallan modelos concretos más allá de la RTX 5090.
- Opciones de despliegue: librería voxcpm mediante `VoxCPM.from_pretrained` con `load_denoiser=False`; no se documentan en la información disponible integraciones con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: 3,6× tiempo real y 64 ms hasta el primer sonido en streaming en RTX 5090.

## Comparativa con modelos similares

| Modelo | Parametros | Idiomas | Error mediano (lectura jemer) | Velocidad (RTX 5090) | Memoria GPU pico (corto/largo) | Licencia |
|---|---|---|---|---|---|---|
| VoxPocket-TTS-Khmer | 0,89B | km, en | 4,3% | 3,6× tiempo real | 3,8 / 6,3 GB | Apache 2.0 |
| VoxCPM2 | 2,38B | no disponible en detalle | 4,8% | 2,7× tiempo real | 6,5 / 8,9 GB | no disponible |
| VoxPocket (version anterior) | no disponible | km, en | 6,6% | no disponible | no disponible | no disponible |

No se dispone en la información proporcionada de otros modelos TTS comparables para jemer.

## Limitaciones y advertencias

- En párrafos muy largos (450+ caracteres) comete muchos errores y VoxCPM2 es mejor en ese escenario; se recomienda dividir el texto en frases.
- Las palabras duplicadas con el signo `ៗ` deben escribirse expandidas o el paso de texto debe expandirlas; de lo contrario puede fallar.
- La clonación de voz requiere clips limpios de 4-9 segundos y la transcripción exacta de lo dicho en el clip.
- Los errores de lectura medidos (3,7-4,3% mediano) implican que aún hay frases con mala pronunciación (8 de 40 con >10% de errores).
- No se documentan en la información disponible sesgos específicos, tasas de alucinación ni limitaciones de idioma más allá del jemer e inglés.
- Licencia Apache 2.0: permite uso comercial, pero conviene revisar las condiciones del modelo base openbmb/VoxCPM1.5 y de los datos de entrenamiento antes de producción.
- Parte del entrenamiento usa habla sintética generada por VoxCPM2, lo que puede introducir artefactos del modelo profesor.
- No se detallan requisitos de atribución ni restricciones adicionales en la model card.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/muyleanging/VoxPocket-TTS-Khmer
- Demo en Spaces: https://huggingface.co/spaces/muyleanging/VoxPocket-TTS-Demo
- Dataset de entrenamiento: https://huggingface.co/datasets/muyleanging/VoxPocket-TTS-Khmer-Data-Preview
- Modelo base: https://huggingface.co/openbmb/VoxCPM1.5
- Reconocedor usado en la evaluación: https://huggingface.co/seanghay/Qwen3-ASR-0.6B-Khmer
