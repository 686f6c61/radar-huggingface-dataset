# INGMUYLEANG/VoxPocket-v5

## Resumen

VoxPocket-v5 es un modelo de síntesis de voz (text-to-speech) especializado en jemer (khmer), desarrollado por INGMUYLEANG como un ajuste fino (fine-tune) del modelo openbmb/VoxCPM1.5. Con 801,7 millones de parámetros (0,89B), el modelo genera audio a 44,1 kHz y está diseñado para leer jemer nativo, jemer con palabras en inglés intercaladas (code-mixing) e inglés plano, además de permitir clonación de voz a partir de un clip corto y control de estilo emocional mediante descripciones textuales.

El modelo aborda un problema concreto: la escasez de sistemas TTS de calidad para jemer, un idioma de bajos recursos. Según la model card, VoxPocket-v5 reduce el error mediano de letras al 3,7% en frases no vistas durante el entrenamiento (frente al 5,1% de la versión anterior) y, en sus pruebas, supera al modelo profesor VoxCPM2 (2,38B) en lectura de jemer (4,3% frente a 4,8%) siendo 2,7 veces más pequeño, un 33% más rápido y consumiendo un 38% menos de energía.

Es relevante ahora porque demuestra que un modelo por debajo de los 1.000 millones de parámetros puede igualar o superar a modelos casi tres veces mayores en una tarea lingüística específica, con un consumo de VRAM de 3,8 GB para texto corto, lo que lo hace desplegable en GPU de consumo. La licencia Apache 2.0 facilita su adopción comercial.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Basada en VoxCPM 1.5 (no se detalla la arquitectura interna en la información disponible) |
| Parámetros totales | 801.729.856 (0,89B) |
| Parámetros activos | no disponible (no es MoE según la información) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (pesos en safetensors; el repo ocupa 13,2 GB) |
| Idiomas soportados | jemer (km), inglés (en); admite jemer con palabras en inglés intercaladas |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |
| Frecuencia de muestreo de audio | 44.100 Hz |
| Librería | voxcpm |
| Modelo base | openbmb/VoxCPM1.5 |
| Dataset de entrenamiento | muyleanging/VoxPocket-TTS-Khmer-Data-Preview |

## Arquitectura y entrenamiento

VoxPocket-v5 se construye como un fine-tune de VoxCPM 1.5, partiendo de la release anterior de VoxPocket (ya ajustada sobre jemer) y realizando una pasada completa adicional de entrenamiento. La información disponible no detalla la arquitectura interna del transformer ni el mecanismo de generación acústica, más allá de que emplea la librería voxcpm y soporta decodificación con un número configurable de pasos de inferencia (10 por defecto en los ejemplos) y un parámetro de clasificador libre de guía (cfg_value=2.0).

El entrenamiento utilizó 778.028 clips que suman aproximadamente 1.010 horas de audio único (1.247 horas contando el habla real duplicada). La composición es: 237 horas de habla real de jemer con doble peso para preservar la naturalidad de las voces; unas 600 horas de habla sintética generada por VoxCPM2, filtrada con un reconocedor de voz que solo conserva clips con un error de letras ≤ 15%, incluyendo 340 horas de datos nuevos con estilos emocionales (susurro, enfado, alegría, sorpresa, tristeza), lectura larga multi-frase y frases en jemer con palabras en inglés; y 157 horas de pares clip de voz + estilo para permitir el cambio de tono sobre voces clonadas. Los ajustes fueron: tasa de aprendizaje 2e-5 con warm-up, batch efectivo de 18 clips y 43.200 pasos. No se menciona uso de RLHF o DPO.

## Capacidades

- Generación de voz en jemer nativo a 44,1 kHz con una calidad de lectura medida en error mediano de letras del 3,7% en frases no vistas.
- Lectura de jemer con palabras en inglés intercaladas (code-mixing) y de inglés plano.
- Clonación de voz a partir de un clip de referencia limpio de 4 a 9 segundos, junto con la transcripción exacta de lo que se dice en el clip.
- Control de estilo emocional mediante etiquetas entre paréntesis antes del texto: susurro, enfado, alegría, sorpresa, tristeza, excitación, calma, tono serio de locutor de noticias, entre otros.
- Diseño de voz sin clip de referencia, describiendo la voz en paréntesis (por ejemplo, "mujer joven, voz clara y brillante, tono alegre").
- Combinación de clonación de voz y cambio de estilo en la misma generación.
- Generación de audio en streaming con un tiempo hasta el primer sonido de 64 ms.
- Lectura de texto largo, aunque con degradación en párrafos muy largos (450+ caracteres).
- No se documentan capacidades de tool calling, agentes, visión ni audio de entrada.

## Casos de uso

- **Atención al cliente en jemer**: el modelo puede generar respuestas habladas naturales en jemer para sistemas de atención telefónica o asistentes virtuales, con la ventaja de que lee jemer con un error mediano de letras del 3,7% y admite términos en inglés habituales en el sector técnico.
- **Locución de contenido educativo**: lectura de materiales didácticos, cursos y audiolibros en jemer, dividiendo el texto en frases para evitar la degradación en párrafos largos; el control de estilo permite alternar tonos serios y cercanos según el público.
- **Doblaje y localización de vídeo**: clonación de la voz del creador original a partir de un clip de 4-9 segundos y generación de la versión en jemer manteniendo el timbre, con ajuste de emoción para respetar el tono del contenido original.
- **Accesibilidad para personas con discapacidad visual**: conversión de texto a voz en jemer para lectores de pantalla y aplicaciones de accesibilidad, con un consumo de VRAM de 3,8 GB que permite desplegarlo en GPU de consumo o incluso en servidores modestos.
- **Anuncios y avisos automatizados**: generación de avisos de voz para transporte público, comercios o servicios públicos en jemer e inglés, con baja latencia (64 ms hasta el primer sonido) para respuestas en tiempo real.
- **Prototipado de asistentes de voz multilingües**: combinación de jemer e inglés en una misma frase para aplicaciones de turismo o comercio en Camboya, donde los usuarios mezclan ambos idiomas de forma natural.
- **Investigación en TTS de bajos recursos**: el modelo y su dataset asociado sirven como referencia para estudiar el ajuste fino de modelos TTS en idiomas con pocos datos, con checkpoints intermedios publicados (pasos 30.000, 35.000, 40.000 y 43.200) para comparar.

## Benchmarks y rendimiento

Resultados de lectura sobre 40 frases no vistas, con el mismo clip de voz, cfg 2.0, 10 pasos y semilla 0, evaluados con el reconocedor `seanghay/Qwen3-ASR-0.6B-Khmer` contando errores de letras en jemer (menor es mejor):

| 40 frases no vistas | Error mediano | Error medio | Frases con > 10% de errores |
|---|---|---|---|
| VoxPocket (esta release) | 4,3% | 6,1% | 8 / 40 |
| VoxPocket (release anterior) | 6,6% | 7,2% | 10 / 40 |
| VoxCPM2 (2,38B) | 4,8% | 7,0% | 12 / 40 |

En una segunda máquina, la misma prueba da 3,7% (paso 30.000) frente a 5,1% de la release anterior.

Rendimiento en 1× NVIDIA GeForce RTX 5090:

| Métrica | VoxPocket | VoxCPM2 |
|---|---|---|
| Parámetros | 0,89B | 2,38B |
| Velocidad | 3,6× tiempo real | 2,7× |
| Tiempo hasta el primer sonido (streaming) | 64 ms | 77 ms |
| VRAM pico (texto corto / largo) | 3,8 / 6,3 GB | 6,5 / 8,9 GB |
| Potencia de GPU hablando | 173 W | 205 W |
| Energía por minuto de habla | 0,80 Wh | 1,29 Wh |
| RAM de CPU | 1,9 GB | 3,1 GB |

Calidad por checkpoint (error mediano de letras): paso 30.000 (principal) 3,7%; paso 35.000 4,0%; paso 40.000 4,0%; final 43.200 4,0%.

## Requisitos de hardware

- VRAM estimada para inferencia: 3,8 GB para texto corto y 6,3 GB para texto largo en FP (según la medición del autor en RTX 5090).
- RAM de CPU: 1,9 GB.
- GPU recomendadas: NVIDIA RTX 5090 (medición oficial); por el consumo de VRAM, cabe en GPU de consumo con al menos 8 GB, como RTX 3060 Ti, RTX 4060 Ti, RTX 4070 o superiores. Para texto largo se recomienda 8 GB o más.
- Cabe en GPU de consumo: sí, con 6,3 GB de pico para texto largo.
- Opciones de despliegue: librería `voxcpm` (Python) mediante `VoxCPM.from_pretrained`; demo en Hugging Face Spaces. No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: 64 ms hasta el primer sonido en streaming y 3,6× tiempo real en RTX 5090; 173 W de consumo de GPU durante la síntesis.

## Comparativa con modelos similares

| Modelo | Parámetros | Idiomas | Error mediano (jemer) | Velocidad | VRAM pico (corto/largo) | Licencia |
|---|---|---|---|---|---|---|
| VoxPocket-v5 | 0,89B | km, en | 4,3% | 3,6× tiempo real | 3,8 / 6,3 GB | Apache 2.0 |
| VoxCPM2 | 2,38B | no disponible | 4,8% | 2,7× tiempo real | 6,5 / 8,9 GB | no disponible |
| VoxPocket (release anterior) | no disponible | km, en | 6,6% | no disponible | no disponible | Apache 2.0 |
| VoxCPM 1.5 (base) | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible |

La comparativa se limita a los modelos reportados por el autor; no se dispone de datos de otros sistemas TTS para jemer en la información proporcionada.

## Limitaciones y advertencias

- En párrafos muy largos (450+ caracteres) comete numerosos errores y VoxCPM2 es mejor en ese escenario; se recomienda dividir el texto en frases y unir el audio.
- La clonación de voz requiere un clip limpio de 4-9 segundos y la transcripción exacta de lo que se dice en él; clips sucios o mal transcritos degradan el resultado.
- Las palabras duplicadas con el signo `ៗ` deben escribirse completas (por ejemplo, `ភ្លាមភ្លាម`) o dejarse expandir por el paso de texto.
- El modelo está especializado en jemer e inglés; no se documenta soporte para otros idiomas.
- Riesgo de alucinación y de pronunciación incorrecta en nombres propios, palabras poco frecuentes o texto con ruido; la métrica de error de letras mide pronunciación, no naturalidad prosódica.
- No se documentan sesgos específicos de género, dialecto o registro; el entrenamiento incluye 600 horas de habla sintética, lo que puede introducir artefactos del modelo profesor.
- Licencia Apache 2.0: permite uso comercial, pero el usuario debe verificar el cumplimiento en su jurisdicción y las condiciones de los datos de entrenamiento publicados.
- La clonación de voz plantea riesgos de suplantación de identidad y deepfakes; se recomienda obtener consentimiento explícito de la persona cuya voz se clona y aplicar marcas de agua o verificación en producción.
- No se dispone de información sobre cuantizaciones oficiales ni sobre el comportamiento en precisión reducida.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/INGMUYLEANG/VoxPocket-v5
- Demo en Hugging Face Spaces: https://huggingface.co/spaces/muyleanging/VoxPocket-TTS-Demo
- Modelo base: https://huggingface.co/openbmb/VoxCPM1.5
- Dataset de entrenamiento: https://huggingface.co/datasets/muyleanging/VoxPocket-TTS-Khmer-Data-Preview
- Reconocedor usado en la evaluación: https://huggingface.co/seanghay/Qwen3-ASR-0.6B-Khmer
