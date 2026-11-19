# Charlie320/zils-lite-qbp

## Resumen

zils-lite-qbp es un modelo de decisión de tipo "body" (cuerpo) perteneciente al pool de soups `d3-lite` de Zils, alojado en la subred 127 de Bittensor. Se trata de un fine-tune de Qwen/Qwen3.5-0.8B, con 852.985.920 parámetros, distribuido en formato BF16 y con licencia Apache-2.0. El autor es Charlie320 y el modelo se publicó en noviembre de 2026. Su función principal es servir como cuerpo evaluable dentro de un mecanismo de soups (promediado de pesos) destinado a tareas de decisión con formato de examen.

El modelo parte de `joamCriff123/zils-lite-l1117a`, el único body del soup `d3-lite` del 18 de noviembre de 2026. Sobre esa base se aplicaron tres fine-tunes LoRA independientes (rango 32, fusionados) con semillas distintas, un epoch cada uno a learning rate 5e-5, cuyos pesos se promediaron de forma uniforme. Los objetivos de entrenamiento son mayoritariamente probabilísticos (destilación desde `joamCriff123/zils-mini-m1115`), con mezclas ponderadas de etiquetas propias, probabilidades del profesor y probabilidades del body inicial según la categoría de cada ítem.

La relevancia del modelo es acotada: no es un modelo de propósito general, sino un artefacto especializado para el ecosistema de evaluación de Zils, con capacidades orientadas a ítems de examen, aritmética, similitud de frases, tool-calling y artes. No dispone de pipeline declarado, no tiene descargas ni likes en el momento de la ficha, y carece de documentación sobre idiomas soportados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de Qwen/Qwen3.5-0.8B, con tower de visión heredado del padre) |
| Parametros totales | 852.985.920 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en BF16) |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Qwen/Qwen3.5-0.8B, un transformer de aproximadamente 853 millones de parámetros, con un tower de visión heredado del modelo padre. El modelo se distribuye en BF16 y en el layout de "chassis" propio del pool Zils. Sobre esta base se realizó un proceso de soup: tres fine-tunes LoRA (rango 32, fusionados) con semillas distintas, un epoch cada uno a learning rate 5e-5, cuyos pesos se promediaron uniformemente sin interpolación.

Los datos de entrenamiento comprenden aproximadamente 76.100 filas, con una pasada barajada por semilla. Se componen de: (1) unas 31.100 preguntas de decisión en formato de examen de las familias de tareas conocidas, escritas con la receta pública de autoría de Zils (`scripts/author_exam.py`) por Claude Opus y por un modelo abierto local, a partir de splits de train de datasets públicos, incluyendo unas 1.100 preguntas de tool-calling extraídas de las filas 90.000-93.000 del subconjunto de function-calling de `glaiveai/glaive-function-calling-v2`; (2) 15.000 filas del split de train de `tasksource/tasksource-jev-typed-decisions` usadas solo como entradas de destilación sin etiquetas; (3) 30.000 filas adicionales del mismo dataset, de 240 tareas fuente con metadatos de licencia no especificados, usadas con sus etiquetas. Se excluyeron fuentes no comerciales, fuentes con licencia comercial o no especificada en el caso de las no etiquetadas, tareas tipo BIG-bench y filas cuyo texto coincidiera con filas de validación o test. No se usaron ítems de examen del validador, ítems de examen semilla públicos ni datos de clientes.

Los objetivos de entrenamiento son "soft": para la mayoría de ítems escritos, una cuarta parte de la respuesta propia del ítem y tres cuartas partes de las probabilidades de respuesta de `joamCriff123/zils-mini-m1115`; para unas 4.100 preguntas de puntuación aritmética y similitud de frases, solo las probabilidades de ese body; para las 15.000 filas sin etiqueta, solo sus probabilidades; para las 30.000 filas etiquetadas, mitad etiqueta del dataset y mitad probabilidades del body inicial; y para las 12.931 preguntas de tool-call y artes, solo las probabilidades del body inicial, dejando esas categorías como estaban.

## Capacidades

- Generación de respuestas en formato de examen para familias de tareas de decisión de Zils.
- Puntuación aritmética y similitud de frases (categorías entrenadas con destilación específica).
- Tool calling / function calling, con ítems derivados de glaive-function-calling-v2.
- Capacidades de visión heredadas del tower del modelo padre Qwen/Qwen3.5-0.8B.
- Razonamiento multi-step limitado al formato de ítems de examen, no a agentes generales.
- Capacidades multilingües: no disponible (no se declaran idiomas).
- Modo thinking explícito: no disponible.

## Casos de uso

- Evaluación interna de soups en la subred 127 de Bittensor: el modelo se usa como body candidato en el pool `d3-lite`, comparando su rendimiento frente a otros bodies del soup mediante ítems de examen.
- Puntuación de ítems aritméticos: dado que fue entrenado con las probabilidades del profesor en las ~4.100 preguntas de puntuación aritmética, puede emplearse como componente de scoring en pipelines de evaluación numérica.
- Similitud de frases: adecuado para tareas de comparación semántica dentro de suites de evaluación, gracias al entrenamiento específico en esa categoría.
- Tool calling en entornos controlados: puede integrarse en pipelines que requieran selección de funciones a partir de descripciones, aunque con las limitaciones de un modelo de 0,8B.
- Destilación y investigación sobre soups: sirve como referencia para estudiar el efecto del promediado de LoRAs y de la destilación soft en modelos pequeños.
- Prototipado de bajo coste: al caber en GPUs de consumo, permite experimentar con fine-tunes y soups sin infraestructura dedicada.
- Investigación sobre alineación por destilación: útil para analizar cómo se propagan las probabilidades de un profesor (zils-mini-m1115) a un body de menor tamaño.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16: aproximadamente 1,7 GB solo para pesos, más overhead de activaciones y KV cache; en la práctica, entre 2 y 4 GB según longitud de contexto.
- VRAM estimada en cuantización de 8 bits: alrededor de 1 GB para pesos; en 4 bits: alrededor de 0,5 GB.
- GPU recomendadas: cualquier GPU con al menos 4-8 GB de VRAM para BF16; RTX 3060, RTX 4060, RTX 4090, A100 y H100 son válidas, con mayor throughput en las de gama alta.
- Cabe en GPU de consumo: sí, en la mayoría de tarjetas modernas con 6 GB o más en BF16, y en 4 GB con cuantización.
- Opciones de despliegue: llama.cpp, Ollama, vLLM y TGI son viables; al ser un modelo de 0,8B, llama.cpp y Ollama son las opciones más ligeras.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| zils-lite-qbp | 852.985.920 | no disponible | Apache-2.0 | Hugging Face (0 descargas) | Body especializado para soups de Zils |
| Qwen/Qwen3.5-0.8B | ~0,8B | no disponible | no disponible | Hugging Face | Modelo base del que deriva |
| joamCriff123/zils-lite-l1117a | no disponible | no disponible | Apache-2.0 | Hugging Face | Body de partida del fine-tune |
| joamCriff123/zils-mini-m1115 | no disponible | no disponible | no disponible | Hugging Face | Profesor usado para destilación |

## Limitaciones y advertencias

- Modelo especializado en ítems de examen de Zils: no es un modelo de propósito general y su rendimiento fuera de esas familias de tareas no está validado.
- Riesgo de alucinación elevado en usos abiertos, dado el tamaño (0,8B) y el entrenamiento centrado en scoring probabilístico.
- Idiomas soportados no declarados; no hay garantía de calidad multilingüe.
- Longitud de contexto no documentada; no se debe asumir la del modelo base sin verificación.
- Licencia Apache-2.0 permite uso comercial, pero el autor advierte que se deben comprobar los términos de los datasets de origen antes de reutilizar.
- Los datos de entrenamiento incluyen fuentes con metadatos de licencia no especificados; persiste incertidumbre sobre la procedencia de parte del corpus.
- Sin pipeline declarado, sin descargas y sin likes: modelo de nicho, sin validación comunitaria.
- No se han publicado benchmarks; cualquier evaluación de rendimiento debe realizarse por cuenta propia.
- El modelo se publicó en noviembre de 2026 y su model card es la única documentación disponible.

## Enlaces

- Hugging Face: https://huggingface.co/Charlie320/zils-lite-qbp
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B
- Body de partida: https://huggingface.co/joamCriff123/zils-lite-l1117a
- Profesor de destilación: https://huggingface.co/joamCriff123/zils-mini-m1115
- Dataset de tool-calling: https://huggingface.co/datasets/glaiveai/glaive-function-calling-v2
- Dataset de decisiones tipadas: https://huggingface.co/datasets/tasksource/tasksource-jev-typed-decisions
