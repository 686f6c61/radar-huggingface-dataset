# muyleanging/VoxPocket-TTS-Khmer

## Resumen

VoxPocket-TTS-Khmer es un modelo de síntesis de voz (text-to-speech) especializado en jemer (khmer), desarrollado por el usuario muyleanging y publicado en Hugging Face bajo licencia Apache 2.0. Se construye como un ajuste fino de openbmb/VoxCPM1.5, un modelo TTS de la familia VoxCPM, y incorpora datos destilados de VoxCPM2 (2,38B parámetros), su modelo "profesor". El resultado es un modelo de 0,89B parámetros que genera audio a 44,1 kHz y que, según el autor, supera en calidad de lectura de jemer a su propio profesor siendo 2,7 veces más pequeño.

El modelo resuelve un problema concreto: la escasez de sistemas TTS de calidad para jemer, un idioma de bajos recursos, y la necesidad de manejar texto mixto jemer-inglés, habitual en contextos reales. Además de leer jemer y frases con palabras en inglés, permite clonar una voz a partir de un clip corto (4-9 segundos) y aplicar estilos emocionales (susurro, enfado, alegría, sorpresa, tristeza) o descripciones de voz sin necesidad de referencia de audio.

Es relevante ahora porque demuestra que un ajuste fino eficiente sobre un modelo base abierto puede superar a un modelo mayor en una lengua específica, con menores requisitos de memoria (3,8-6,3 GB de VRAM en una RTX 5090) y menor consumo energético. El repositorio ocupa 13,2 GB e incluye varios checkpoints intermedios.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (modelo TTS basado en VoxCPM1.5) |
| Parámetros totales | 801.729.856 (0,89B según el autor) |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible |
| Idiomas soportados | jemer (km), inglés (en); mezcla jemer-inglés |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |
| Frecuencia de muestreo | 44.100 Hz |
| Modelo base | openbmb/VoxCPM1.5 |
| Librería | voxcpm |
| Tamaño del repositorio | 13,2 GB |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna del modelo (tipo de transformer, mecanismo de atención o componentes del decodificador acústico). Se sabe que hereda la arquitectura de VoxCPM1.5 y que la inferencia se realiza mediante la librería `voxcpm`, con parámetros como `cfg_value` (2.0 en los ejemplos) e `inference_timesteps` (10 en los ejemplos), lo que sugiere un proceso de generación iterativa con guiado por clasificador libre. El modelo opera a 44,1 kHz.

El entrenamiento parte del checkpoint previo de VoxPocket (VoxCPM 1.5 ajustado a jemer) y se extiende durante una pasada completa adicional de 43.200 pasos, con tasa de aprendizaje 2e-5 con warm-up y batch efectivo de 18 clips. Los datos suman 778.028 clips y aproximadamente 1.010 horas de audio único (1.247 horas contando el habla real dos veces): 237 horas de habla real jemer con doble peso, unas 600 horas de habla sintética generada por VoxCPM2 y filtrada por un reconocedor de voz (se conservan solo clips con ≤15% de error de letras), incluyendo 340 horas nuevas de habla estilizada y emocional, lectura larga multioración y frases jemer con palabras en inglés, más 157 horas de pares clip de voz + estilo para permitir el cambio de tono en voces clonadas. El entrenamiento se realizó en una única NVIDIA RTX 5090 de 32 GB con CUDA 13.

## Capacidades

- Síntesis de voz en jemer con lectura de texto nativo.
- Lectura de texto mixto jemer-inglés (code-mixing) y de inglés plano.
- Clonación de voz a partir de un clip de referencia limpio de 4-9 segundos, acompañado de la transcripción exacta de lo que se dice en el clip.
- Control de estilo mediante etiquetas entre paréntesis al inicio del texto: susurro, enfado, alegría, sorpresa, tristeza, excitación, calma, tono de locutor de noticias.
- Diseño de voz sin clip de referencia, mediante descripción textual entre paréntesis (por ejemplo, "mujer joven, voz clara y brillante, tono alegre").
- Generación de audio a 44,1 kHz.
- Streaming con tiempo hasta el primer sonido de 64 ms según el benchmark del autor.
- No se menciona soporte de tool calling, agentes ni otras modalidades (visión, audio de entrada) en la información disponible.

## Casos de uso

- Audiolibros y lectura de prensa en jemer: el modelo lee párrafos de hasta unas tres frases con buena calidad; para textos largos se recomienda dividir en oraciones y concatenar el audio, lo que encaja en un pipeline de segmentación + síntesis + unión.
- Doblaje y locución con control emocional: las etiquetas de estilo permiten generar la misma frase en tono neutro, alegre o enfadado sin cambiar de voz, útil para producción de contenido multimedia.
- Asistentes de voz y atención al cliente en jemer: con clonación de voz se puede mantener una identidad sonora de marca consistente y generar respuestas con baja latencia (64 ms hasta el primer sonido en streaming).
- Localización de contenido con code-mixing: al leer frases jemer con términos técnicos en inglés (nombres de productos, siglas), evita tener que traducir o transliterar esos términos.
- Accesibilidad: conversión de texto a voz para personas con discapacidad visual en jemer, con voces personalizadas mediante clonación a partir de un clip del propio usuario o de un familiar.
- Investigación en TTS para lenguas de bajos recursos: sirve como punto de partida para ajustes finos en otros idiomas o para estudiar destilación de modelos mayores (VoxCPM2) a modelos pequeños.
- Prototipado rápido en aplicaciones móviles o de escritorio: con 0,89B parámetros y 1,9 GB de RAM de CPU, es viable en entornos con recursos limitados comparado con modelos de 2,38B.

## Benchmarks y rendimiento

Los resultados publicados por el autor usan un clip de voz fijo, cfg 2.0, 10 pasos y semilla 0, con un reconocedor de voz jemer (seanghay/Qwen3-ASR-0.6B-Khmer) que transcribe la salida y cuenta errores de letras sobre 40 frases no vistas en entrenamiento (menor es mejor).

| 40 frases retenidas | Error mediano | Error medio | Frases con >10% de errores |
|---|---|---|---|
| VoxPocket (esta versión) | 4,3% | 6,1% | 8/40 |
| VoxPocket (versión anterior) | 6,6% | 7,2% | 10/40 |
| VoxCPM2 (2,38B) | 4,8% | 7,0% | 12/40 |

El autor indica que en una segunda máquina el mismo test da 3,7% (checkpoint de 30.000 pasos) frente a 5,1% de la versión anterior, y que el error mediano en frases retenidas es del 3,7% (frente a 5,1% previo), con 7 de 40 frases mal leídas frente a 12 de la versión anterior.

Rendimiento en 1× NVIDIA GeForce RTX 5090:

| Métrica | VoxPocket | VoxCPM2 |
|---|---|---|
| Parámetros | 0,89B | 2,38B |
| Velocidad | 3,6× tiempo real | 2,7× |
| Tiempo hasta el primer sonido (streaming) | 64 ms | 77 ms |
| Memoria GPU pico (texto corto / largo) | 3,8 / 6,3 GB | 6,5 / 8,9 GB |
| Potencia GPU hablando | 173 W | 205 W |
| Energía por minuto de habla | 0,80 Wh | 1,29 Wh |
| RAM de CPU | 1,9 GB | 3,1 GB |

Calidad por checkpoint (error mediano de letras): paso 30.000 (principal) 3,7%; paso 35.000 4,0%; paso 40.000 4,0%; final-43.200 4,0%.

## Requisitos de hardware

- VRAM estimada para inferencia: 3,8 GB con texto corto y 6,3 GB con texto largo en una RTX 5090, según el benchmark del autor.
- RAM de CPU: 1,9 GB.
- GPU recomendadas: NVIDIA RTX 5090 (32 GB) es la empleada en los benchmarks y en el entrenamiento; por el reducido consumo de memoria, es probable que quepa en GPUs consumer con 8 GB o más, aunque no se han publicado pruebas en otras GPUs.
- Cabe en GPU consumer: sí, según los datos de memoria pico (3,8-6,3 GB), en tarjetas con al menos 8 GB de VRAM; no hay mediciones publicadas para modelos concretos distintos de la RTX 5090.
- Opciones de despliegue: librería `voxcpm` (ejemplos oficiales con `VoxCPM.from_pretrained` y `load_denoiser=False`); existe una demo en Hugging Face Spaces. No se mencionan vLLM, llama.cpp, Ollama ni TGI en la información disponible.
- Latencia y throughput: 64 ms hasta el primer sonido en streaming y 3,6× tiempo real en RTX 5090; consumo de 173 W durante la síntesis.

## Comparativa con modelos similares

| Modelo | Parámetros | Idiomas | Licencia | Contexto | Rendimiento en jemer (error mediano) | Disponibilidad |
|---|---|---|---|---|---|---|
| VoxPocket-TTS-Khmer | 0,89B | km, en | Apache 2.0 | no disponible | 4,3% (test GPU) / 3,7% (segunda máquina) | Hugging Face, demo en Spaces |
| VoxCPM2 | 2,38B | no disponible en la información | no disponible | no disponible | 4,8% (test GPU) | modelo base/profesor citado; disponibilidad no detallada |
| VoxCPM1.5 | no disponible | no disponible | no disponible | no disponible | no disponible | modelo base en openbmb/VoxCPM1.5 |
| VoxPocket (versión anterior) | no disponible | km, en | no disponible | no disponible | 6,6% (test GPU) | checkpoint previo del mismo autor |

## Limitaciones y advertencias

- En párrafos muy largos (450+ caracteres) comete muchos errores y VoxCPM2 es mejor en ese régimen; se recomienda dividir el texto en oraciones.
- La clonación de voz requiere un clip limpio de 4-9 segundos y la transcripción exacta de lo que se dice en él; clips ruidosos o transcripciones incorrectas degradan el resultado.
- Las palabras duplicadas con el signo jemer `ៗ` deben escribirse completas o expandirse en el paso de texto previo.
- Los benchmarks son autoinformados por el autor, con un único reconocedor de voz como evaluador y 40 frases de test; no hay evaluación independiente publicada.
- El entrenamiento usa unas 600 horas de habla sintética generada por VoxCPM2, lo que puede propagar sesgos o artefactos del modelo profesor.
- No se dispone de información sobre sesgos demográficos, de género o acento, ni sobre tasas de alucinación o contenido no fiable en la síntesis.
- La licencia Apache 2.0 permite uso comercial, pero el modelo base (VoxCPM1.5) y los datos de entrenamiento deben verificarse por separado; la información disponible no detalla las licencias de los datasets de audio real.
- Solo se han publicado pruebas en una GPU (RTX 5090); el rendimiento en otros hardware es desconocido.
- El uso de clonación de voz plantea riesgos de suplantación; no se documentan mecanismos de marca de agua o detección en la información disponible.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/muyleanging/VoxPocket-TTS-Khmer
- Demo en Spaces: https://huggingface.co/spaces/muyleanging/VoxPocket-TTS-Demo
- Dataset de entrenamiento: https://huggingface.co/datasets/muyleanging/VoxPocket-TTS-Khmer
- Modelo base: https://huggingface.co/openbmb/VoxCPM1.5
- Reconocedor usado en la evaluación: https://huggingface.co/seanghay/Qwen3-ASR-0.6B-Khmer
