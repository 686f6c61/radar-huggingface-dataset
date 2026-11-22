# JimmyJamJr/qwen3-0.6b-random-init-deeprd-curriculum-L61

## Resumen

`JimmyJamJr/qwen3-0.6b-random-init-deeprd-curriculum-L61` es un checkpoint de investigación publicado en Hugging Face por el usuario JimmyJamJr. No es un modelo de propósito general: es un experimento controlado sobre el papel del preentrenamiento en el razonamiento deductivo. El autor toma la arquitectura y el tokenizador de Qwen3-0.6B (596.049.920 parámetros reales según el archivo de safetensors) pero entrena los pesos desde inicialización aleatoria, sin cargar los pesos preentrenados de Qwen. La semilla utilizada es 1234.

El entrenamiento aplica un currículo de "lookahead" sobre problemas deductivos sintéticos generados con una versión modificada del generador DeepRD. El checkpoint corresponde al paso 1.229.000, ha completado la etapa L = 61 del currículo y se encuentra a mitad de la etapa L = 62, con un tamaño de paso s = 1. La tarea consiste en predecir el siguiente atributo de una prueba lógica a partir de un prefijo de prueba y un conjunto de reglas sobre atributos ficticios.

Su relevancia es metodológica, no práctica: sirve como control para medir cuánto del rendimiento en razonamiento depende del preentrenamiento. El propio autor señala que el Qwen3-0.6B preentrenado alcanza lookaheads mucho mayores con el mismo currículo, lo que convierte a este checkpoint en una referencia de comparación para estudios de currículos y capacidades emergentes en modelos pequeños.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (la de Qwen3-0.6B), pesos inicializados aleatoriamente |
| Parámetros totales | 596.049.920 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (heredada de la arquitectura Qwen3-0.6B, sin confirmar en la model card) |
| Tipos de cuantización | no disponible (pesos en bf16/safetensors; no se documentan cuantizaciones publicadas) |
| Idiomas soportados | no disponible (entrenado sobre texto sintético en inglés con atributos ficticios) |
| Licencia | no disponible |
| Formato de pesos | safetensors (librería transformers) |

## Arquitectura y entrenamiento

La arquitectura es la de Qwen3-0.6B, un transformer decoder-only, pero con los pesos reinicializados desde cero (semilla 1234). El tokenizador también es el de Qwen3-0.6B. El entrenamiento es un fine-tuning completo con AdamW, tasa de aprendizaje constante de 3e-4 y precisión bf16, sobre un currículo que escala simultáneamente el lookahead y el vocabulario de atributos: en la etapa k se entrena con problemas cuyo lookahead se muestrea uniformemente en 1..L_k, donde L_k = k × s con s = 1, y un vocabulario de 2(L_k + 1) etiquetas. El modelo avanza de etapa cuando su exactitud de coincidencia exacta reciente en entrenamiento es suficientemente alta.

La tarea es predicción del siguiente paso de prueba sobre problemas deductivos sintéticos del generador DeepRD modificado. Cada prompt enumera reglas sobre nombres de atributos ficticios, un hecho inicial y un objetivo, seguido de un prefijo de prueba; el modelo debe emitir el siguiente atributo de una prueba válida. El lookahead de un problema es el número de pasos de búsqueda en anchura necesarios para distinguir el siguiente paso correcto del distractor. No se documentan datos de RLHF, DPO ni innovaciones de decodificación; la evaluación usa decodificación greedy comparando la primera palabra delimitada por espacio o puntuación con el atributo gold, sin distinguir mayúsculas.

## Capacidades

- Predicción del siguiente paso en pruebas deductivas sintéticas con reglas sobre atributos ficticios.
- Razonamiento multi-paso limitado: el checkpoint ha completado lookahead 61 y está a mitad de 62 en el currículo.
- Generación de texto condicionada a prompts en texto plano con el formato específico de DeepRD.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni de razonamiento multi-turno.
- No se documentan capacidades multilingües; el entrenamiento es sobre texto sintético en inglés.
- No se documentan modos especiales (thinking, visión, audio).

## Casos de uso

- Estudio de control en investigación sobre preentrenamiento: comparar este checkpoint con Qwen3-0.6B preentrenado bajo el mismo currículo para aislar la contribución de los pesos preentrenados al razonamiento deductivo.
- Análisis de currículos de aprendizaje: reproducir la progresión de etapas L = 1..61 y estudiar cómo emerge la capacidad de lookahead con el tamaño del vocabulario de atributos.
- Evaluación de generalización composicional: medir si un modelo entrenado solo desde cero generaliza a problemas con reglas y atributos no vistos dentro del mismo generador.
- Referencia de línea base en benchmarks de razonamiento sintético: usar sus resultados de exactitud como suelo para comparar arquitecturas o estrategias de entrenamiento alternativas.
- Investigación sobre eficiencia de datos: analizar cuántos pasos (1.229.000 en este checkpoint) y qué tasa de aprendizaje se necesitan para alcanzar un lookahead dado sin preentrenamiento.
- Docencia y divulgación: ilustrar con un caso concreto y reproducible la diferencia entre entrenar desde cero y partir de pesos preentrenados en tareas de razonamiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card solo indica cualitativamente que el Qwen3-0.6B preentrenado alcanza lookaheads mucho mayores con el mismo currículo, sin cifras concretas.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: aproximadamente 1,2 GB solo para pesos (596 M parámetros × 2 bytes), más overhead de activaciones y caché KV.
- VRAM estimada en fp32: aproximadamente 2,4 GB para pesos.
- Cabe en GPU consumer: sí, en cualquier GPU con 4 GB o más (GTX 1650, RTX 3050, RTX 4060, RTX 4090).
- GPU recomendadas para entrenamiento o evaluación a escala: A100, H100 o RTX 4090; el entrenamiento documentado usó bf16 y AdamW completo.
- Opciones de despliegue: transformers (librería declarada); compatible con text-generation-inference y endpoints según los tags. No se documenta compatibilidad con llama.cpp, Ollama ni vLLM.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Entrenamiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este checkpoint (qwen3-0.6b-random-init-deeprd-curriculum-L61) | 596.049.920 | no disponible | Desde cero, currículo DeepRD sintético | no disponible | Hugging Face, 0 descargas |
| Qwen/Qwen3-0.6B | ~0,6 B | no disponible en esta ficha | Preentrenado + post-entrenamiento | no disponible en esta ficha | Hugging Face, ampliamente usado |
| Alternativas de razonamiento sintético desde cero | no disponible | no disponible | no disponible | no disponible | no disponible |

La comparación relevante es con su modelo base, Qwen/Qwen3-0.6B: misma arquitectura y tokenizador, pero pesos preentrenados frente a inicialización aleatoria. El autor indica que el preentrenado alcanza lookaheads mucho mayores con el mismo currículo, lo que sugiere que el preentrenamiento aporta una ventaja sustancial en esta tarea.

## Limitaciones y advertencias

- No es un modelo de propósito general: solo se ha entrenado para predecir el siguiente paso en problemas deductivos sintéticos con el formato de DeepRD.
- Riesgo alto de alucinación y de salida incoherente fuera del dominio de entrenamiento.
- Sesgos conocidos: no documentados; el entrenamiento usa atributos ficticios, lo que limita la transferencia a lenguaje natural.
- Idiomas: no se documenta ninguno; el texto de entrenamiento es sintético en inglés.
- Licencia no disponible: no se puede asumir uso comercial permitido; hay que contactar con el autor antes de cualquier despliegue en producción.
- Contexto máximo no confirmado en la model card; no se debe asumir el de Qwen3-0.6B sin verificación.
- Checkpoint intermedio: ha completado la etapa L = 61 y está a mitad de L = 62, por lo que su capacidad de lookahead está acotada por el currículo y no representa un modelo final.
- Sin datos de benchmarks publicados: no hay evidencia cuantitativa de rendimiento más allá de la exactitud de entrenamiento mencionada cualitativamente.
- 0 descargas y 0 likes en el momento de la consulta: no hay validación comunitaria ni reportes de uso.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/JimmyJamJr/qwen3-0.6b-random-init-deeprd-curriculum-L61
- Modelo base: https://huggingface.co/Qwen/Qwen3-0.6B
- Generador DeepRD: no disponible en la información proporcionada
- Paper o blog del autor: no disponible en la información proporcionada
- Repositorio de código: no disponible en la información proporcionada
