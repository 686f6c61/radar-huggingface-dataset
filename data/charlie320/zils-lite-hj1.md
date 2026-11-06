# Charlie320/zils-lite-hj1

## Resumen

zils-lite-hj1 es un modelo de decisión de 0,85 mil millones de parámetros publicado por el usuario Charlie320 en Hugging Face, concebido como un "cuerpo" (body) para el pool de modelos tipo soup denominado `d3-lite` del ecosistema Zils, asociado al subnet 127 de Bittensor. El modelo parte de Qwen/Qwen3.5-0.8B y del cuerpo base zils-ai/jiwo-0.8b-full, ambos bajo licencia Apache-2.0, y se distribuye con pesos en formato safetensors y precisión BF16.

La propuesta del modelo no es la generación de texto generalista, sino la evaluación de ítems en formato examen para un sistema de decisión distribuido. El autor describe un entrenamiento en dos etapas: un fine-tune completo de todas las capas de lenguaje con una función de pérdida que combina entropía cruzada y pérdida de Brier, anclada mediante KL al cuerpo de partida, seguido de un ajuste LoRA de rango 32 que se fusiona y se promedia uniformemente con los pesos de la primera etapa.

Es relevante ahora por su carácter experimental y de nicho: se trata de un artefacto de investigación dentro de un pipeline de subred descentralizada, con cero descargas y sin resultados de benchmarks publicados. Su interés técnico reside en la receta de entrenamiento (pérdida de Brier para calibración de decisiones, anclaje KL, weight averaging entre etapas) más que en su rendimiento bruto como modelo de lenguaje.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (derivada de Qwen/Qwen3.5-0.8B); incluye torre de visión heredada del modelo padre |
| Parametros totales | 852.985.920 (0,85 B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (pesos publicados en BF16; no se documentan variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | No disponible (la model card no declara lista de idiomas) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (BF16) |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only basado en Qwen3.5-0.8B, con el diseño de "chassis" del ecosistema Zils: se entrenan los pesos de lenguaje y se conserva la torre de visión del modelo padre. El punto de partida es el cuerpo zils-ai/jiwo-0.8b-full. La etapa 1 consiste en un fine-tune completo de todas las capas de lenguaje con learning rate 4e-6, schedule coseno, aproximadamente 234.000 filas, pérdida combinada de entropía cruzada y Brier, y un anclaje KL al cuerpo inicial sobre 40.000 filas de amplia cobertura. La etapa 2 aplica una época de LoRA con rango 32, alpha 64 y learning rate 2e-4 sobre 4.100 ítems en formato examen, que posteriormente se fusiona. Los pesos finales son la media uniforme de los pesos de ambas etapas (weight averaging / model soup).

Los datos de entrenamiento son ítems de decisión en formato examen generados con la receta pública de autoría de Zils (`scripts/author_exam.py`) por Claude Opus y por un modelo abierto local, a partir únicamente de splits públicos de entrenamiento, más las respuestas del profesor relay público de Zils. El autor declara explícitamente que no se usaron ítems de examen del validador ni ítems semilla públicos. La innovación técnica destacable es el uso de la pérdida de Brier junto a la entropía cruzada para mejorar la calibración de las decisiones, combinada con anclaje KL para evitar el olvido catastrófico respecto al cuerpo base.

## Capacidades

- Evaluación de ítems en formato examen y emisión de decisiones calibradas, que es el objetivo declarado del entrenamiento.
- Generación de texto y razonamiento heredados del modelo base Qwen3.5-0.8B.
- Procesamiento de visión mediante la torre visual heredada del modelo padre (sin detalles de resolución o formato de entrada en la información disponible).
- Capacidades multilingües: no disponibles de forma explícita; dependen del modelo base.
- Soporte de tool calling / function calling: no disponible en la documentación.
- Soporte de agentes y razonamiento multi-paso: no disponible en la documentación.
- Modo thinking, audio u otras capacidades especiales: no disponible.

## Casos de uso

- Evaluación automática de exámenes tipo test en pipelines de investigación: el modelo está entrenado específicamente con ítems en formato examen y pérdida de Brier, por lo que puede puntuar opciones con probabilidades mejor calibradas que un modelo base sin ajustar.
- Componente de decisión en un pool de modelos soup: encaja como "cuerpo" dentro del pool `d3-lite` del subnet 127 de Bittensor, donde distintos cuerpos se combinan o comparan para tareas de decisión.
- Análisis de opciones múltiples en dominios acotados: útil para clasificar respuestas candidatas en conjuntos de datos de evaluación cerrados, siempre que el formato coincida con el de entrenamiento.
- Prototipado de sistemas de calibración: la combinación de entropía cruzada y Brier lo hace adecuado como banco de pruebas para estudiar calibración de probabilidades en modelos pequeños.
- Investigación sobre weight averaging y merging: al publicarse los pesos promediados de dos etapas, sirve para reproducir y analizar el efecto del model soup en modelos de menos de 1 B de parámetros.
- Experimentación con modelos de 0,85 B en hardware modesto: su tamaño permite ejecutarlo en GPUs de consumo para pruebas de concepto de decisión, sin pretensiones de producción generalista.
- Evaluación multimodal ligera: la torre de visión heredada permite experimentar con entradas imagen-texto en tareas de decisión, aunque sin garantías documentadas de rendimiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16: aproximadamente 1,7 GB solo para pesos, más overhead de activaciones y caché KV; en la práctica, entre 2 y 3 GB para contextos cortos.
- VRAM estimada en cuantización de 8 bits: alrededor de 0,9 GB de pesos; en 4 bits, alrededor de 0,5 GB (estimaciones teóricas, no publicadas por el autor).
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM para BF16; RTX 3060, RTX 4060, RTX 4090, A100 y H100 son válidas, aunque el modelo no aprovecha el hardware de gama alta por su tamaño.
- Cabe en GPU de consumo: sí, en la práctica totalidad de GPUs consumer modernas con 4 GB o más.
- Opciones de despliegue: Transformers con safetensors es la vía directa; vLLM, llama.cpp, Ollama o TGI requerirían conversión o soporte específico de la arquitectura Qwen3.5, no documentado en la información disponible.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| zils-lite-hj1 | 0,85 B | No disponible | Apache-2.0 | Hugging Face, 0 descargas | Fine-tune de decisión con pérdida de Brier y soup de dos etapas |
| Qwen/Qwen3.5-0.8B | 0,8 B (aprox.) | No disponible | No disponible en la información | Hugging Face | Modelo base del que deriva; capacidades generalistas |
| zils-ai/jiwo-0.8b-full | 0,8 B (aprox.) | No disponible | Apache-2.0 | Hugging Face | Cuerpo de partida del fine-tune |
| zils-ai/z3-lite-mac-candidates | 0,9 B | No disponible | No disponible en la información | Hugging Face, 20 descargas | Otro artefacto del mismo ecosistema Zils, con custom_code |

## Limitaciones y advertencias

- Modelo de nicho sin benchmarks publicados: no hay evidencia cuantitativa de su rendimiento frente al modelo base ni frente a alternativas.
- Riesgo de alucinación: al ser un fine-tune de un modelo de 0,85 B, la generación libre de texto puede ser poco fiable; el modelo está orientado a decisión sobre ítems, no a diálogo abierto.
- Sesgos: no documentados por el autor; los datos de entrenamiento provienen de ítems generados por Claude Opus y un modelo abierto local, lo que puede introducir sesgos de esos generadores.
- Limitaciones de idioma: la model card no declara idiomas soportados; el comportamiento fuera del inglés o del castellano no está garantizado.
- Restricciones de licencia: los pesos son Apache-2.0, pero el autor advierte de que deben revisarse los términos de los conjuntos de datos de origen antes de reutilizar el modelo.
- Caveat para producción: cero descargas y ausencia de pipeline declarado; no es un modelo validado para uso comercial en producción sin evaluación propia.
- El modelo no debe usarse con ítems del examen del validador ni con ítems semilla públicos según las condiciones del ecosistema Zils; el autor indica que no se usaron en entrenamiento, pero la verificación externa no es posible.
- La torre de visión se hereda del padre sin reentrenamiento documentado, por lo que su calidad multimodal no está garantizada.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Charlie320/zils-lite-hj1
- Modelo base Qwen/Qwen3.5-0.8B: https://huggingface.co/Qwen/Qwen3.5-0.8B
- Cuerpo de partida zils-ai/jiwo-0.8b-full: https://huggingface.co/zils-ai/jiwo-0.8b-full
- Organización Zils en Hugging Face: https://huggingface.co/zils-ai/models
- Artefacto relacionado zils-ai/z3-lite-mac-candidates: https://huggingface.co/zils-ai/z3-lite-mac-candidates
