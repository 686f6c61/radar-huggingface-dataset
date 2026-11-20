# Charlie320/zils-lite-qw3

## Resumen

zils-lite-qw3 es un ajuste fino (fine-tune) de Qwen/Qwen3.5-0.8B publicado por el usuario Charlie320 en Hugging Face. Se presenta como un "body" (cuerpo) para el pool de modelos tipo "soup" denominado Zils `d3-lite`, asociado a la subred 127 de Bittensor. El modelo está pensado como un modelo de decisión (decision-model): recibe ítems en formato de examen y produce respuestas etiquetadas dentro de familias de tareas definidas por la receta pública de autoría de Zils.

El modelo parte de joamCriff123/zils-lite-l1117a, que a su vez es el único body del soup `d3-lite` del 18 de noviembre de 2026. Sobre esa base se aplicaron tres ajustes LoRA de rango 32 (fusionados) con semillas distintas, promediados uniformemente, con destilación parcial desde joamCriff123/zils-mini-m1115 (body del soup `d3-mini`). El resultado es un checkpoint BF16 de aproximadamente 853 millones de parámetros, con licencia Apache-2.0 y pesos en safetensors.

La relevancia es acotada: se trata de un modelo de nicho, con cero descargas y cero likes en el momento de la consulta, orientado a un ecosistema concreto (Zils / Bittensor) y sin model card que documente benchmarks, idiomas o pipeline. Su interés principal es como ejemplo de ajuste por destilación y promediado de LoRA sobre un modelo base pequeño de la familia Qwen3.5.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de Qwen/Qwen3.5-0.8B); incluye vision tower heredada del modelo padre |
| Parametros totales | 852.985.920 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en BF16) |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Qwen/Qwen3.5-0.8B, un transformer de aproximadamente 853 millones de parámetros. El modelo conserva la "vision tower" del modelo padre, lo que sugiere que mantiene capacidad multimodal de entrada, aunque la model card no detalla su funcionamiento ni su entrenamiento. El checkpoint se distribuye en BF16 y en el layout de "chassis" propio del ecosistema Zils.

El entrenamiento consistió en tres ajustes LoRA de rango 32, fusionados y promediados uniformemente, con una época cada uno a tasa de aprendizaje 5e-5 y semillas distintas. Los objetivos de entrenamiento fueron suaves (soft targets) y variaron según el tipo de ítem: para la mayoría de ítems escritos, una cuarta parte de la respuesta propia del ítem y tres cuartas partes de las probabilidades de respuesta de joamCriff123/zils-mini-m1115; para unos 4.100 ítems de puntuación aritmética y similitud de frases, solo las probabilidades del profesor; para 15.000 filas sin etiquetar, solo las probabilidades del profesor; para 30.000 filas etiquetadas, mitad etiqueta del dataset y mitad probabilidades del body de partida; para 12.931 ítems de tool-call y artes, solo las probabilidades del body de partida; y para los ítems de los exámenes semilla públicos, sus etiquetas publicadas.

El conjunto de datos comprende unas 84.000 filas con una pasada barajada por semilla: aproximadamente 31.100 ítems de decisión en formato de examen (escritos con la receta pública `scripts/author_exam.py` por Claude Opus y un modelo abierto local, a partir de splits de entrenamiento de datasets públicos, incluidos unos 1.100 ítems de tool-call de las filas 90.000-93.000 del subconjunto de function-calling de glaiveai/glaive-function-calling-v2); 15.000 filas del split de entrenamiento de tasksource/tasksource-jev-typed-decisions usadas solo como entradas de destilación sin etiquetas; 30.000 filas adicionales del mismo dataset con etiquetas (excluyendo fuentes no comerciales, tareas tipo BIG-bench y filas duplicadas de validación o test); y los 787 ítems de los exámenes semilla públicos de Zils (zils-ai/base-exam-seed-v1 a v4), cada uno repetido diez veces. No se usaron ítems de exámenes de validadores ni datos de clientes.

## Capacidades

- Generación de respuestas en formato de examen para familias de tareas de decisión definidas por la receta de autoría de Zils.
- Clasificación y decisión sobre ítems tipados (typed decisions).
- Tool calling / function calling: se entrenaron aproximadamente 1.100 ítems de tool-call, aunque según la model card esa categoría se deja en el estado del body de partida.
- Destilación de conocimiento desde un modelo mayor (zils-mini-m1115) mediante objetivos suaves.
- Capacidad multimodal de entrada potencial por la vision tower heredada del modelo padre (no documentada en detalle).
- Capacidades multilingües: no disponibles.
- Modo de razonamiento extendido (thinking mode): no disponible.

## Casos de uso

- Evaluación de modelos de decisión en el ecosistema Zils: el modelo sirve como body de referencia para comparar respuestas frente a otros cuerpos del pool `d3-lite` en las familias de tareas del examen público.
- Destilación y ajuste fino de modelos pequeños: el procedimiento (tres LoRA de rango 32 promediados con objetivos suaves desde un profesor mayor) es replicable como receta para comprimir capacidades de un modelo mayor en uno de 853 millones de parámetros.
- Clasificación de ítems tipados: útil para tareas de decisión estructurada donde la salida esperada es una etiqueta dentro de un conjunto predefinido, gracias al entrenamiento sobre 30.000 filas etiquetadas de tasksource-jev-typed-decisions.
- Investigación sobre promediado de modelos (model soup): permite estudiar el efecto del promediado uniforme de LoRA con distintas semillas sobre el rendimiento en tareas de examen.
- Experimentación con tool calling en modelos pequeños: aunque la categoría se mantiene en el estado del body de partida, el checkpoint puede usarse como base para estudiar function calling en modelos de menos de mil millones de parámetros.
- Prototipado de pipelines de evaluación automática: el modelo puede integrarse en un harness que genere respuestas a exámenes y las compare con etiquetas publicadas, dado que el formato de entrada sigue la receta pública de Zils.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16: aproximadamente 1,7 GB solo para pesos (852.985.920 parámetros × 2 bytes), más overhead de activaciones y del vision tower; en la práctica, entre 2 y 4 GB según longitud de secuencia y batch.
- VRAM estimada en cuantización de 8 bits: alrededor de 0,9-1 GB para pesos; en 4 bits: alrededor de 0,5 GB para pesos (estimaciones teóricas, no verificadas con este checkpoint).
- GPU recomendadas: cualquier GPU consumer con al menos 4-6 GB de VRAM debería poder cargar el modelo en BF16 para inferencia con batch pequeño; tarjetas como RTX 3060, RTX 4060, RTX 4090 o superiores son suficientes. Para entrenamiento o fine-tuning, se recomienda A100 o H100.
- Cabe en GPU consumer: sí, previsiblemente en la mayoría de tarjetas con 6 GB o más.
- Opciones de despliegue: al publicarse solo en safetensors, requiere transformers o un runtime compatible; no se proporcionan pesos GGUF, por lo que llama.cpp u Ollama requerirían conversión previa. vLLM y TGI son opciones viables si el modelo base Qwen3.5-0.8B está soportado por esas herramientas.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Charlie320/zils-lite-qw3 | 852.985.920 | no disponible | Apache-2.0 | Hugging Face (safetensors) | Fine-tune de decisión con destilación y soup de LoRA |
| Qwen/Qwen3.5-0.8B | ~800 M (no confirmado) | no disponible | no disponible | Hugging Face | Modelo base del que deriva |
| joamCriff123/zils-lite-l1117a | no disponible | no disponible | Apache-2.0 | Hugging Face | Body de partida del soup `d3-lite` |
| joamCriff123/zils-mini-m1115 | no disponible | no disponible | no disponible | Hugging Face | Profesor de destilación del soup `d3-mini` |

No se dispone de datos de rendimiento comparativo entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- Modelo de nicho con cero descargas y cero likes en el momento de la consulta; no hay evidencia de uso en producción ni validación externa.
- La model card no documenta benchmarks, idiomas soportados, longitud de contexto ni pipeline; evaluar su calidad requiere ejecutar los exámenes públicos de Zils.
- Riesgo de alucinación inherente a un modelo de 853 millones de parámetros ajustado sobre datos sintéticos generados por otros modelos (Claude Opus y un modelo abierto local).
- Los objetivos de entrenamiento suaves dependen de las probabilidades de un modelo profesor (zils-mini-m1115), lo que puede propagar sesgos y errores de ese profesor.
- Las categorías de tool-call y artes se dejan en el estado del body de partida, por lo que el ajuste no mejora necesariamente esas capacidades.
- Se excluyeron fuentes con licencia no comercial en el dataset de entrenamiento, pero la model card advierte de que se deben comprobar los términos de los datasets de origen antes de reutilizar.
- Licencia Apache-2.0 permite uso comercial, pero la procedencia de los datos de entrenamiento (datasets de terceros con metadatos de licencia variables) introduce incertidumbre legal.
- No se proporcionan pesos cuantizados (GGUF, AWQ, GPTQ), lo que limita el despliegue en entornos de bajos recursos sin conversión previa.
- El modelo está vinculado a la subred 127 de Bittensor y al ecosistema Zils; su utilidad fuera de ese contexto no está demostrada.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Charlie320/zils-lite-qw3
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B
- Body de partida: https://huggingface.co/joamCriff123/zils-lite-l1117a
- Profesor de destilación: https://huggingface.co/joamCriff123/zils-mini-m1115
- Dataset de decisiones tipadas: https://huggingface.co/datasets/tasksource/tasksource-jev-typed-decisions
- Dataset de function calling: https://huggingface.co/datasets/glaiveai/glaive-function-calling-v2
- Exámenes semilla públicos: https://huggingface.co/zils-ai/base-exam-seed-v1 (y v2, v3, v4)
