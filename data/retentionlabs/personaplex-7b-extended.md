# RetentionLabs/personaplex-7b-extended

## Resumen

PersonaPlex 7B Extended es un checkpoint de investigación publicado por RetentionLabs sobre el modelo base `nvidia/personaplex-7b-v1` de NVIDIA, un modelo audio-a-audio orientado a conversación de voz full-duplex. El objetivo del trabajo no es mejorar el modelo original, sino estudiar cómo extender sus conversaciones más allá de los 3.000 frames (aproximadamente 4 minutos a 12,5 frames por segundo) para los que fue entrenado, hasta 40.960 frames (unos 55 minutos). El repositorio contiene tanto un checkpoint experimental (el `model.safetensors`) como un script de inferencia (`rebase_inference.py`) que constituye la contribución práctica principal.

La arquitectura subyacente es la de PersonaPlex: un transformer con atención de ventana deslizante de 3.000 frames y RoPE, con 8.371.408.896 parámetros totales según los pesos en safetensors (el nombre comercial indica 7B). El modelo procesa audio de entrada y genera audio de salida, manteniendo un prefijo de persona (prompt de texto y, opcionalmente, prompt de voz) que define el comportamiento del asistente durante la conversación.

La relevancia de este checkpoint es metodológica: documenta con mediciones de entropía cruzada y generación que ampliar la ventana de atención sin entrenamiento rompe el modelo (silencio o palabras inconexas a partir de unos 4.000 frames), y que la solución recomendada es reubicar la ventana de 3.000 frames en posiciones desde 0 conservando el prefijo de persona, sin reentrenar. El checkpoint con cambio de RoPE incluido en el repositorio se marca explícitamente como no funcional para generación libre y se conserva solo como referencia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con atención de ventana deslizante (3.000 frames) y RoPE; modelo base PersonaPlex de NVIDIA |
| Parametros totales | 8.371.408.896 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | Entrenado con ventana deslizante de 3.000 frames; el trabajo explora hasta 40.960 frames mediante rebase de ventana |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en (inglés) |
| Licencia | nvidia-open-model-license (etiquetada como `other` en Hugging Face) |
| Formato de pesos | safetensors (librería transformers) |
| Pipeline | audio-to-audio |
| Modelo base | nvidia/personaplex-7b-v1 |
| Tamaño del repositorio | 16,7 GB |
| Frames por segundo | 12,5 |
| Ventana de atención en entrenamiento | 3.000 frames (unos 4 minutos) |
| Ventana máxima explorada | 40.960 frames (unos 55 minutos) |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura de PersonaPlex: un transformer con atención de ventana deslizante de 3.000 frames y codificación posicional rotatoria (RoPE). La conversación se representa como una secuencia de frames a 12,5 fps, donde cada frame combina información de texto y de audio; el modelo genera el lado del asistente mientras escucha el lado del interlocutor. El prefijo de persona (prompt de texto y, opcionalmente, prompt de voz) se coloca al inicio y condiciona el estilo y comportamiento del asistente.

El checkpoint de este repositorio se entrenó durante 236 pasos con un cambio en RoPE y términos de query y key entrenados (rank 32), partiendo de los pesos originales de NVIDIA. Según la model card, este entrenamiento no logra arreglar la generación más allá de los 3.000 frames: la generación se rompe o queda casi en silencio en contextos largos, por lo que el checkpoint se conserva solo como referencia. La contribución práctica es `rebase_inference.py`, que no requiere entrenamiento: en cada chunk de 500 frames, el modelo recibe el prefijo de persona seguido de los frames más recientes (hasta completar entre 2.500 y 3.000 frames), reubicados en posiciones desde 0, de modo que el modelo siempre opera dentro de la distribución de posiciones y distancias de atención con las que fue entrenado.

El trabajo también evalúa Self-Extend con temperatura de longitud como alternativa de investigación, que permite generar de forma fluida hasta 32.000 frames comprobados, aunque sin ganancia medible en el uso de contexto lejano. No se documentan en la información disponible detalles sobre el dataset de entrenamiento original de PersonaPlex (número de tokens, composición, RLHF/DPO).

## Capacidades

- Generación de voz a voz (speech-to-speech) en conversaciones full-duplex: el modelo escucha y genera simultáneamente el lado del asistente.
- Conversaciones multi-turno de duración arbitraria mediante `rebase_inference.py`, manteniendo fluidez más allá de los 3.000 frames de entrenamiento.
- Condicionamiento por prefijo de persona: prompt de texto y, opcionalmente, prompt de voz para definir el comportamiento del asistente.
- Generación de texto y audio alineados por frame (cada frame incluye id de texto y audio).
- Capacidad de escucha del interlocutor grabado mientras genera su propia respuesta.
- No se documenta soporte de tool calling, function calling, agentes, visión ni otras modalidades en la información disponible.
- Capacidades multilingües: solo inglés (`en`).

## Casos de uso

- Conversaciones de voz de larga duración: con `rebase_inference.py` el modelo puede mantener diálogos fluidos de hasta decenas de minutos (se comprobó generación fluida a 32.000 frames, unos 42 minutos) sin reentrenar, útil para asistentes de voz persistentes.
- Investigación sobre extensión de contexto en modelos de audio: el repositorio documenta tres enfoques (cambio de RoPE con query/key entrenados, rebase de ventana y Self-Extend) con métricas de entropía cruzada y KL, lo que sirve como referencia metodológica para experimentos similares.
- Evaluación de modelos full-duplex: los scripts y protocolos de evaluación (conversaciones self-play, teacher forcing, generación de 375 frames) permiten reproducir y comparar variantes de inferencia.
- Asistentes conversacionales con persona definida: el prefijo de persona (texto y voz) permite fijar estilo y rol del asistente durante toda la conversación, incluso en sesiones largas, al conservarse el prefijo en cada chunk.
- Prototipado de agentes de voz en inglés: el modelo base PersonaPlex puede integrarse en pipelines de transformers para experimentar con interacción por voz en entornos de investigación.
- Estudio de degradación de contexto: los datos de entropía cruzada por tramos de frames (de 0-512 a 16k-32k) permiten analizar cómo decae el rendimiento al alejarse de la ventana de entrenamiento.

## Benchmarks y rendimiento

Los datos publicados son de entropía cruzada teacher-forced (en nats, sobre frames con id de texto de palabra) y de calidad de generación, no benchmarks estándar como MMLU o HumanEval.

Entropía cruzada teacher-forced por tramos de posición de frame:

| Modelo | 0-512 | 512-1k | 1k-2k | 2k-3k | 3k-4k | 4k-8k | 8k-16k | 16k-32k |
|---|---|---|---|---|---|---|---|---|
| Original, ventana 40.960 | 1,18 | 1,85 | 1,27 | 1,24 | 1,36 | 13,95 | 13,61 | 12,54 |
| Original, ventana 3.000 (prefijo descartado) | | | | | 1,38 | 4,60 | 8,88 | 9,43 |
| 1. Cambio RoPE + query/key (rank 32, 236 pasos) | 1,20 | 1,85 | 1,33 | 1,28 | 1,49 | 4,00 | 5,16 | 6,86 |
| 2. Ventana rebasada de 3.000 frames | 1,18 | 1,84 | 1,27 | 1,24 | 1,34 | 1,30 | 1,38 | 1,51 |
| 3. Self-Extend 1024/24 + temperatura de longitud | | | | | 1,33 | 1,31 | 1,42 | 1,64 |

Generación (375 frames generados, temperatura 0,8, top-k 250):

| Modelo | Contexto (frames) | Texto generado | KL a rebasado |
|---|---|---|---|
| Original, ventana 40.960 | 4.300 | roto ("a a is easy, a a a is a a is") | 7,21 / 2,03 |
| Original, ventana 40.960 | 8.300 | silencio | |
| Original, ventana 40.960 | 16.400 | palabras inconexas | 5,12 / 2,66 |
| 1. Cambio RoPE + query/key (236 pasos) | 4.300 | roto | 4,00 / 1,45 |
| 1. Cambio RoPE + query/key (236 pasos) | 16.400 | casi silencio | 7,86 / 4,75 |
| 3. Self-Extend 1024/8 + temperatura de longitud | 4.300 | fluido, sobre el tema | 0,08 / 0,13 |
| 3. Self-Extend 1024/8 + temperatura de longitud | 16.400 | fluido, algunas repeticiones cortas | 0,08 / 0,19 |
| 3. Self-Extend 1024/24 + temperatura de longitud | 32.000 | fluido, sobre el tema | 0,17 / 0,17 |

Sobre el uso de contexto lejano: el enfoque 3 lee toda la conversación y el enfoque 2 solo el prefijo y los últimos 3.000 frames; su entropía cruzada teacher-forced es igual hasta 16.000 frames (diferencia de 0,01 a 0,04) y el enfoque 3 es 0,13 peor entre 16.000 y 32.768. La model card concluye que, en estos datos, el modelo no aprovecha contexto más allá de los 3.000 frames.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información proporcionada. Con 8.371.408.896 parámetros, en bfloat16 los pesos ocupan aproximadamente 16,7 GB, a lo que hay que sumar el estado de atención y los buffers de audio.
- GPU recomendadas: no disponible de forma explícita; por tamaño, requiere GPUs con al menos 24 GB de VRAM para bfloat16 sin cuantización (por ejemplo, RTX 4090, A100, H100).
- Cabe en GPU de consumo: probablemente en RTX 4090 (24 GB) en bfloat16, aunque no está confirmado en la información disponible; no se documentan opciones de cuantización.
- Opciones de despliegue: librería transformers (pipeline audio-to-audio); el script `rebase_inference.py` carga `nvidia/personaplex-7b-v1`. No se documenta soporte de vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Estado |
|---|---|---|---|---|---|
| PersonaPlex 7B Extended (este) | 8.371.408.896 | Ventana de 3.000 frames; extensión vía rebase hasta 40.960 frames | Speech-to-speech full-duplex, checkpoint de investigación | nvidia-open-model-license | Publicado, generación libre peor que el original |
| nvidia/personaplex-7b-v1 | no disponible en la información | 3.000 frames (unos 4 minutos) | Speech-to-speech full-duplex | nvidia-open-model-license | Modelo base de referencia |
| Self-Extend 1024/8 y 1024/24 sobre PersonaPlex | no disponible | Hasta 32.000 frames comprobados | Variante de inferencia sin entrenamiento | no disponible | Resultado de investigación dentro de la model card |

No se dispone de información sobre otros modelos comparables de la misma categoría en la documentación proporcionada.

## Limitaciones y advertencias

- El `model.safetensors` de este repositorio es un checkpoint de investigación con cambio de RoPE y términos de query/key entrenados; su generación libre es peor que la del modelo original y se conserva solo como referencia. `rebase_inference.py` no lo utiliza.
- La generación del modelo original con la ventana ampliada a 40.960 frames se rompe a partir de unos 4.000 frames (silencio o palabras inconexas); con su ventana de 3.000 frames descarta el prefijo de persona y también se rompe.
- El modelo no parece aprovechar contexto más allá de 3.000 frames en los datos evaluados: los enfoques que leen toda la conversación no obtienen ganancia medible frente al rebase de ventana.
- Solo soporta inglés (`en`); no se documentan otros idiomas.
- La licencia es la NVIDIA Open Model License, con condiciones específicas para uso comercial; es necesario revisar el acuerdo antes de desplegar en producción.
- Riesgo de alucinación y sesgos: no se documentan análisis específicos en la información disponible.
- No se documentan cuantizaciones ni soporte de frameworks de despliegue de alto rendimiento, lo que limita su uso en producción.
- El modelo está pensado para investigación sobre conversación full-duplex; no se documentan garantías de robustez en entornos reales.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/RetentionLabs/personaplex-7b-extended
- Modelo base: https://huggingface.co/nvidia/personaplex-7b-v1
- Script de inferencia recomendado: https://huggingface.co/RetentionLabs/personaplex-7b-extended/blob/main/rebase_inference.py
- Licencia NVIDIA Open Model License: https://www.nvidia.com/en-us/agreements/enterprise-software/nvidia-open-model-license/
- Paper referenciado en los tags: arXiv:2401.01325 (https://arxiv.org/abs/2401.01325)
