# INGMUYLEANG/VoxPocket-v5

## Resumen

VoxPocket-v5 es un modelo de síntesis de voz (text-to-speech) especializado en jemer (khmer), desarrollado por INGMUYLEANG (Muyleang Ing) y publicado en Hugging Face bajo licencia Apache 2.0. Se construye como un ajuste fino de VoxCPM 1.5 (del que hereda la arquitectura y la librería `voxcpm`) y parte del checkpoint previo VoxPocket-v4. Con 801.729.856 parámetros (0,89B según el autor) y una frecuencia de muestreo de salida de 44,1 kHz, resuelve el problema de la escasez de sistemas TTS de calidad para jemer, un idioma con poca representación en los modelos multilingües convencionales.

La propuesta diferencial es la relación calidad/tamaño: según las mediciones del autor, lee jemer mejor que su modelo profesor VoxCPM2 (2,38B) en un conjunto de 40 frases retenidas (4,3% de error mediano de letras frente a 4,8%), siendo 2,7 veces más pequeño, un 33% más rápido y consumiendo un 38% menos de energía. Además del jemer, procesa inglés y texto mixto jemer-inglés, y añade clonación de voz a partir de un clip corto, control de estilo emocional y diseño de voz por descripción textual.

El modelo es relevante ahora porque demuestra que un ajuste fino bien curado sobre un modelo base pequeño puede superar a un profesor varias veces mayor en un idioma de bajos recursos, con requisitos de hardware que caben en una GPU de consumo (3,8 GB de VRAM en texto corto). La versión 5 incorpora 340 horas de datos nuevos centrados en emociones, lectura larga multi-frase y mezcla de código.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | VoxCPM 1.5 (modelo base de TTS; detalles internos de la arquitectura no disponibles en la información proporcionada) |
| Parámetros totales | 801.729.856 (0,89B según el autor) |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible (se recomienda dividir texto largo en frases; errores elevados en párrafos de más de 450 caracteres) |
| Tipos de cuantización | no disponible |
| Idiomas soportados | jemer (km), inglés (en), y mezcla de código jemer-inglés |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |
| Frecuencia de muestreo de salida | 44.100 Hz |
| Librería | voxcpm |
| Modelo base | INGMUYLEANG/VoxPocket-v4 (a su vez VoxCPM 1.5 ajustado a jemer) |
| Tamaño del repositorio | 13,2 GB |
| Checkpoint principal | paso 30.000 (los posteriores están en `checkpoints/`) |

## Arquitectura y entrenamiento

El modelo se apoya en VoxCPM 1.5, un sistema de TTS del que la información disponible no detalla la topología interna (transformer, difusión u otra), por lo que este dato debe considerarse no disponible. Lo que sí se documenta es el proceso de ajuste: se parte de VoxPocket-v4 y se realiza una pasada completa adicional de entrenamiento con tasa de aprendizaje 2e-5 con warm-up, lote efectivo de 18 clips y 43.200 pasos totales. La generación se controla mediante `cfg_value` (2.0 en las pruebas), `inference_timesteps` (10 pasos) y semilla, y existe un modo de streaming con 64 ms hasta el primer sonido.

El corpus de entrenamiento comprende 778.028 clips, equivalentes a unas 1.010 horas de audio único (1.247 h contando el habla real dos veces). Se compone de 237 horas de habla real jemer con doble peso para preservar la naturalidad de las voces, unas 600 horas de habla sintética generada por VoxCPM2 y filtrada por un reconocedor de voz (solo se conservan clips con ≤ 15% de error de letras), de las cuales 340 horas son datos nuevos de habla con estilo y emoción (susurro, enfado, alegría, sorpresa, tristeza), lectura larga multi-frase y frases jemer con palabras en inglés. Se añaden 157 horas de pares clip de voz + estilo para permitir que una voz clonada cambie de tono. El entrenamiento se realizó en una única NVIDIA GeForce RTX 5090 de 32 GB con CUDA 13.

## Capacidades

- Síntesis de voz en jemer con una tasa de error mediano de letras del 3,7% en frases retenidas (checkpoint principal, paso 30.000) y del 4,3% en el benchmark de GPU con el checkpoint final.
- Lectura de texto mixto jemer-inglés y de inglés plano.
- Clonación de voz a partir de un clip de referencia limpio de 4 a 9 segundos, acompañado de la transcripción exacta de lo que se dice en el clip.
- Control de estilo emocional mediante etiquetas entre paréntesis: susurro, enfado, alegría, sorpresa, tristeza, excitación, calma y tono de locutor de noticias, entre otros.
- Diseño de voz sin clip de referencia, describiendo la voz en texto entre paréntesis (edad, género, timbre, tono).
- Combinación de clonación y estilo: una voz clonada puede cambiar de tono según la etiqueta indicada.
- Generación en streaming con 64 ms hasta el primer sonido.
- Soporte de texto largo, aunque con degradación en párrafos de más de 450 caracteres.
- No se documenta soporte de tool calling, function calling, razonamiento multi-paso ni otras modalidades (visión, audio de entrada).

## Casos de uso

- **Lectura de noticias y artículos en jemer**: el modelo incluye un estilo específico de locutor de noticias ("serious and clear news-reader tone") y una tasa de error de letras baja en frases cortas, lo que permite generar boletines a partir de texto periodístico dividido en frases.
- **Audiolibros y contenido educativo**: con 44,1 kHz de salida y la posibilidad de clonar una voz concreta, se puede narrar material didáctico manteniendo una voz consistente a lo largo de capítulos, procesando el texto por frases y concatenando el audio.
- **Atención al cliente y asistentes de voz en jemer**: el modo streaming con 64 ms hasta el primer sonido y los 3,8 GB de VRAM en texto corto permiten desplegar respuestas habladas de baja latencia en entornos con GPU modesta.
- **Doblaje y localización de vídeo**: la clonación de voz a partir de un clip de 4-9 segundos permite preservar el timbre de un actor o presentador al generar contenido nuevo en jemer, y el control de emoción ajusta el registro al tono de la escena.
- **Contenido para redes sociales con voces sintéticas**: el diseño de voz por descripción textual ("A young woman, clear and bright voice, cheerful tone") permite crear personajes de voz sin disponer de grabaciones, útil para podcasts o vídeos cortos.
- **Accesibilidad y lectura de pantalla**: la integración en aplicaciones de lectura para personas con discapacidad visual en jemer se beneficia del bajo consumo de memoria (1,9 GB de RAM de CPU) y del soporte de GPU de consumo.
- **Publicidad y avisos con mezcla de código**: el soporte de frases jemer con palabras en inglés encaja en sectores como tecnología o finanzas, donde el vocabulario técnico se usa en inglés dentro de discursos en jemer.

## Benchmarks y rendimiento

Resultados publicados por el autor sobre 40 frases retenidas, con el mismo clip de voz, cfg 2.0, 10 pasos y semilla 0, evaluados con el reconocedor `seanghay/Qwen3-ASR-0.6B-Khmer` contando errores de letras jemer (menor es mejor):

| 40 frases retenidas | Error mediano | Error medio | Frases con > 10% de errores |
|---|---|---|---|
| VoxPocket (esta versión, checkpoint final) | 4,3% | 6,1% | 8 / 40 |
| VoxPocket (versión anterior) | 6,6% | 7,2% | 10 / 40 |
| VoxCPM2 (2,38B) | 4,8% | 7,0% | 12 / 40 |

En una segunda máquina, el mismo test da 3,7% (paso 30.000) frente a 5,1% de la versión anterior. Por checkpoints, el error mediano de letras es 3,7% en el paso 30.000 (principal), 4,0% en el paso 35.000, 4,0% en el paso 40.000 y 4,0% en el final (43.200).

Rendimiento en 1× NVIDIA GeForce RTX 5090:

| Métrica | VoxPocket | VoxCPM2 |
|---|---|---|
| Parámetros | 0,89B | 2,38B |
| Velocidad | 3,6× tiempo real | 2,7× |
| Tiempo hasta el primer sonido (streaming) | 64 ms | 77 ms |
| Memoria GPU pico (texto corto / largo) | 3,8 / 6,3 GB | 6,5 / 8,9 GB |
| Potencia de GPU hablando | 173 W | 205 W |
| Energía por minuto de habla | 0,80 Wh | 1,29 Wh |
| RAM de CPU | 1,9 GB | 3,1 GB |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible, al no ser aplicables a un modelo de TTS.

## Requisitos de hardware

- VRAM estimada para inferencia: 3,8 GB en texto corto y 6,3 GB en texto largo (medido en RTX 5090).
- RAM de CPU: 1,9 GB.
- GPU recomendadas: NVIDIA GeForce RTX 5090 (usada tanto para entrenamiento como para benchmarks); por el consumo de memoria, cualquier GPU con 8 GB o más de VRAM debería ser suficiente para texto corto, aunque no se documentan pruebas en otras tarjetas.
- Cabe en GPU de consumo: sí, con 3,8-6,3 GB de VRAM según longitud del texto.
- Opciones de despliegue: librería `voxcpm` mediante `VoxCPM.from_pretrained(hf_model_id=..., load_denoiser=False)`; también existe una demo en Hugging Face Spaces. No se documenta soporte de vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: 3,6× tiempo real y 64 ms hasta el primer sonido en streaming; 173 W de consumo de GPU durante la síntesis.

## Comparativa con modelos similares

| Modelo | Parámetros | Idiomas | Error mediano de letras (jemer) | Velocidad | VRAM pico (texto corto) | Licencia |
|---|---|---|---|---|---|---|
| VoxPocket-v5 | 0,89B | km, en | 4,3% | 3,6× tiempo real | 3,8 GB | Apache 2.0 |
| VoxCPM2 | 2,38B | no disponible en la información | 4,8% | 2,7× tiempo real | 6,5 GB | no disponible |
| VoxPocket-v4 | no disponible | km, en | 6,6% | no disponible | no disponible | Apache 2.0 |

No se dispone de datos de otros sistemas TTS de jemer en la información proporcionada para ampliar la comparativa.

## Limitaciones y advertencias

- En párrafos muy largos (más de 450 caracteres) comete numerosos errores y VoxCPM2 rinde mejor en ese escenario; se recomienda dividir el texto en frases.
- El rendimiento cae en frases con más del 10% de errores en 8 de cada 40 frases del conjunto de prueba, por lo que la calidad no es uniforme.
- La clonación de voz exige un clip limpio de 4-9 segundos con la transcripción exacta de lo que se dice; clips ruidosos o transcripciones incorrectas degradan el resultado.
- Las palabras con signo de repetición jemer (`ៗ`) deben escribirse desarrolladas (`ភ្លាមភ្លាម`) o dejarse al paso de normalización del texto.
- Los benchmarks son autoinformados por el autor, con un único reconocedor como evaluador y un conjunto de 40 frases; no hay validación independiente.
- El modelo está entrenado principalmente para jemer; el soporte de inglés y de mezcla de código es secundario y no se cuantifica su calidad.
- No se documentan sesgos específicos de género, edad o dialecto, aunque al entrenarse con 237 h de habla real jemer y unas 600 h de habla sintética puede heredar los sesgos de ambas fuentes.
- Riesgo de alucinación o de prosodia incorrecta en texto ambiguo, sin puntuación o con abreviaturas no vistas en entrenamiento; no se documenta mitigación.
- La licencia Apache 2.0 permite uso comercial, pero no se especifican restricciones adicionales sobre el uso de voces clonadas ni sobre los derechos de las grabaciones de referencia.
- El uso de clonación de voz plantea riesgos de suplantación; no se documentan salvaguardas técnicas en el modelo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/INGMUYLEANG/VoxPocket-v5
- Modelo base: https://huggingface.co/INGMUYLEANG/VoxPocket-v4
- Demo en Hugging Face Spaces: https://huggingface.co/spaces/INGMUYLEANG/VoxPocket-v4-demo
- Dataset de entrenamiento: https://huggingface.co/datasets/INGMUYLEANG/voxpocket-khmer-tts-v4
- Perfil del autor: https://huggingface.co/INGMUYLEANG
- Reconocedor usado en la evaluación: https://huggingface.co/seanghay/Qwen3-ASR-0.6B-Khmer
