# johnsonshi/Joey-1-Loop

## Resumen

Joey-1-Loop es una variante de inferencia del modelo de decisión Joey-1, desarrollado originalmente por Base Labs en Baseten. Joey-1 es un modelo de 2B parámetros derivado de Qwen3.5-2B que no genera texto libre, sino que recibe un contexto, una pregunta y una lista de respuestas posibles, y devuelve una elección junto con una probabilidad para cada opción. Está pensado como un componente de enrutamiento y clasificación dentro de pipelines de agentes.

La aportación de esta variante, publicada por el usuario independiente johnsonshi, no consiste en nuevos pesos: el archivo `model.safetensors` es byte a byte idéntico al original de Baseten. La diferencia está en el runner `run_joey.py`, que ejecuta cuatro capas intermedias (las capas 8 a 11, contando desde cero) dos veces antes de completar el resto del modelo. El orden exacto es `0–7 → 8–11 → 8–11 → 12–23`: 24 capas almacenadas y 28 visitas efectivas.

El resultado reportado por el autor es una mejora de precisión en enrutamiento: sobre 480 preguntas de rutas no vistas, Joey-1 acierta 365 (76,0 %) y Joey-1-Loop acierta 412 (85,8 %), una diferencia de +9,8 puntos porcentuales con un intervalo de confianza del 95 % de +7,1 a +12,3. Es un experimento de inferencia acotado, sin reentrenamiento, y el propio autor advierte que la ganancia puede ser específica de este tipo de tarea.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer híbrido basado en Qwen3.5 (capas causales GatedDeltaNet y capas de atención completa con máscara de bloque) |
| Parametros totales | 2.721.801.024 (2,72B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el repo distribuye safetensors sin cuantizar) |
| Idiomas soportados | inglés (en) |
| Licencia | MIT y Apache-2.0 (MIT para las modificaciones de Baseten sobre Qwen3.5-2B; Apache-2.0 para el trabajo subyacente de Qwen) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo base Joey-1 es una adaptación de Qwen3.5-2B realizada por Baseten, con arquitectura híbrida que combina capas causales GatedDeltaNet con capas de atención completa enmascarada por bloques. Joey-1-Loop no modifica ni reentrena ningún peso: el checkpoint es idéntico al original. La innovación es exclusivamente de inferencia y se implementa en el script `run_joey.py`.

El bucle de reutilización de capas consiste en reenviar la salida de las capas 8 a 11 a través de las mismas cuatro capas antes de continuar con las capas 12 a 23. El bloque repetido contiene tres capas GatedDeltaNet causales y una capa de atención completa con máscara de bloque. En cada visita, las posiciones de los tokens y las máscaras de atención se mantienen fijas, pero el estado de atención, convolución y recurrente se reinicia. No se reinyecta una primera respuesta ni se envía un segundo prompt: es un segundo pase parcial sobre el mismo forward, no un doble forward completo.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si hubo RLHF o DPO en el modelo base, más allá de que Joey-1 es un modelo de decisión derivado de Qwen3.5-2B. El autor indica que seleccionó las capas a repetir usando mapas de práctica y que probó solo decisiones de texto.

## Capacidades

- Toma de decisiones sobre listas cerradas de opciones: recibe contexto, pregunta y candidatos, y devuelve una elección con probabilidades por opción.
- Enrutamiento y clasificación: diseñado para elegir entre alternativas discretas (por ejemplo, estación de inicio en un grafo de rutas o categoría de un ticket).
- Salida calibrada: proporciona una probabilidad por cada opción, lo que permite umbrales y agregación de decisiones.
- Razonamiento de múltiples pasos limitado al ámbito de la decisión: la reutilización de capas amplía el cómputo efectivo sin cambiar los pesos.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-step general: no disponible como tal; el modelo está pensado como componente de decisión dentro de un agente, no como agente autónomo.
- Capacidades multilingües: solo inglés declarado.
- Capacidades especiales: modo de reutilización de capas (layer reuse) en las capas 8 a 11 mediante el runner propietario; visión y audio no disponibles.

## Casos de uso

- Enrutamiento de consultas en sistemas de agentes: dado un contexto conversacional y una lista de herramientas o destinos posibles, el modelo elige la opción más probable; la salida con probabilidades permite aplicar umbrales y derivar a un humano cuando la confianza es baja.
- Clasificación de tickets de soporte: el ejemplo incluido en el repo puntúa un ticket de soporte contra un conjunto de categorías; encaja en pipelines de triaje donde la latencia importa y las etiquetas son cerradas.
- Selección de ruta o siguiente paso en grafos: el escenario de evaluación del autor (elegir la estación de inicio que alcanza un destino) se traslada a planificación de rutas, navegación o selección de nodo en un DAG de tareas.
- Desambiguación de intenciones en asistentes: con una lista de intenciones candidatas y el histórico reciente, el modelo devuelve la intención y su probabilidad, útil para enrutar a distintos flujos sin generar texto libre.
- Filtrado y priorización de candidatos: en recuperación de información o ranking, puede puntuar opciones discretas y servir como etapa de reordenación ligera dentro de un pipeline mayor.
- Componente de decisión en entornos con recursos limitados: al ser un modelo de 2,72B parámetros y 5,5 GB en safetensors, puede desplegarse en una sola GPU consumer para tareas de clasificación de alta frecuencia; el bucle añade cómputo en cuatro capas, no un segundo forward completo.

## Benchmarks y rendimiento

Datos reportados por el autor sobre 480 preguntas de enrutamiento no vistas, procedentes de 60 mapas nuevos:

| Modelo | Visitas de capa | Aciertos | Precisión | Brier |
|---|---:|---:|---:|---:|
| Joey-1 (original, un pase) | 24 | 365/480 | 76,0 % | 0,3291 |
| Joey-1-Loop (cuatro capas dos veces) | 28 | 412/480 | 85,8 % | 0,2162 |

El autor reporta además que repetir el forward completo del Joey-1 original con el orden de respuestas invertido y promediar probabilidades obtuvo 366/480, frente a 412/480 de Joey-1-Loop. En clasificación de intenciones sobre 512 ítems del split de entrenamiento de BANKING77, el recuento pasó de 477 a 478 aciertos (comprobación de desarrollo, no test oficial). No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el checkpoint en safetensors ocupa 5,5 GB; con pesos en fp16 se requiere aproximadamente 6 GB solo para pesos, más memoria para activaciones y estado recurrente. En cuantizaciones de 8 o 4 bits el requisito bajaría, aunque el repo no distribuye versiones cuantizadas y el runner está pensado para los safetensors originales.
- GPU recomendadas: no hay datos específicos del autor; por tamaño, una GPU con 8-16 GB de VRAM es suficiente para fp16, y una A100 o H100 ofrece margen para lotes mayores.
- GPU consumer: cabe en tarjetas consumer con al menos 8 GB de VRAM en fp16; en 4 bits cabría en GPUs de 4-6 GB, aunque sin soporte oficial en el repo.
- Opciones de despliegue: el repo incluye `run_joey.py` con configuración Linux/CUDA y un modo `--verify-only` para comprobar los archivos en CPU con Python 3.10 o superior. No se documenta soporte para vLLM, llama.cpp, Ollama o TGI; el bucle de capas requiere el runner propietario, y un cargador estándar no lo activa.
- Latencia y throughput: no disponible. El bucle añade cuatro visitas de capa sobre 24, es decir, 28 visitas totales, pero no se publican medidas de latencia.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Joey-1-Loop | 2,72B | no disponible | Modelo de decisión con reutilización de capas (28 visitas) | MIT y Apache-2.0 | Hugging Face (johnsonshi/Joey-1-Loop) |
| Joey-1 (original) | 2,72B | no disponible | Modelo de decisión de un solo pase (24 visitas) | MIT y Apache-2.0 | Hugging Face (baselabs/joey-1) |
| Qwen3.5-2B | ~2B | no disponible | LLM generativo base | Apache-2.0 | Hugging Face |

La comparación directa más relevante es con Joey-1 original, del que Joey-1-Loop solo difiere en el runner: mismos pesos, 28 visitas frente a 24 y 412/480 frente a 365/480 en el conjunto de evaluación del autor. Frente a Qwen3.5-2B, la diferencia es funcional: Qwen3.5-2B genera texto, mientras que Joey-1 y su variante están especializados en elegir entre opciones con probabilidades. No se dispone de comparación con otros modelos de decisión o enrutamiento en la información proporcionada.

## Limitaciones y advertencias

- La mejora de precisión se midió en un único tipo de tarea (enrutamiento sobre mapas) y las capas se eligieron con mapas de práctica; el autor advierte que la ganancia puede no generalizar a otros dominios.
- En clasificación de intenciones (BANKING77, split de entrenamiento) la mejora fue marginal (477 a 478 aciertos), lo que sugiere que el efecto no se traslada a todas las tareas.
- En 25 de las 67 rutas falladas por ambos modelos, Joey-1-Loop asignó mayor probabilidad a la opción incorrecta, lo que indica un riesgo de sobreconfianza en errores.
- El experimento se realizó en unas siete horas tras la configuración y sin entrenamiento adicional; es una prueba de inferencia pequeña, no una validación exhaustiva.
- Solo se probaron decisiones de texto; no hay evidencia sobre otros tipos de entrada.
- Idioma limitado al inglés declarado; no hay datos sobre rendimiento en castellano u otros idiomas.
- El bucle solo se activa con `run_joey.py`; cargadores estándar (transformers, vLLM, llama.cpp) no reproducen el comportamiento y darían el modelo original de un solo pase.
- Licencia mixta MIT y Apache-2.0: las modificaciones de Baseten son MIT y el trabajo de Qwen subyacente es Apache-2.0; conviene revisar `LICENSE`, `NOTICE` y `THIRD_PARTY.md` antes de uso comercial.
- Riesgo de alucinación no evaluado en la información disponible; al ser un modelo de elección cerrada, el riesgo principal es la elección incorrecta con alta confianza, no la generación de contenido falso.
- Sesgos conocidos: no disponible.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/johnsonshi/Joey-1-Loop
- Repositorio completo (incluye `run_joey.py`): https://huggingface.co/johnsonshi/Joey-1-Loop/tree/main
- Modelo base Joey-1: https://huggingface.co/baselabs/joey-1
- Árbol de archivos del Joey-1 original: https://huggingface.co/baselabs/joey-1/tree/db5c2a631f2da93c4173378438d8246966e25159
- Licencia del modelo base: https://huggingface.co/baselabs/joey-1/blob/db5c2a631f2da93c4173378438d8246966e25159/LICENSE
- Aviso de atribución del modelo base: https://huggingface.co/baselabs/joey-1/blob/db5c2a631f2da93c4173378438d8246966e25159/NOTICE
