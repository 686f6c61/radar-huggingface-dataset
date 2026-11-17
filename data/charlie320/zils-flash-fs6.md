# Charlie320/zils-flash-fs6

## Resumen

zils-flash-fs6 es un fine-tune del modelo Qwen/Qwen3.5-9B, publicado por el usuario Charlie320 en Hugging Face, concebido como un "body" (cuerpo de pesos) para el pool de soups denominado `d3-flash` de la red Bittensor subnet 127 (Zils). El modelo parte de `vllm-sr/d3-flash`, un modelo de la casa construido sobre Qwen3.5-9B, y se ha entrenado mediante la fusión uniforme de seis fine-tunes LoRA de rango 32 con semillas distintas, cada uno con una pasada barajada sobre aproximadamente 46.100 filas de datos.

El modelo está orientado a tareas de decisión y a la evaluación tipo examen dentro del ecosistema Zils, con un componente claro de destilación de profesor: los objetivos de entrenamiento son suaves y combinan la respuesta propia del ítem (un cuarto) con las probabilidades del soup `d3-mini` (tres cuartos) para los ítems escritos, y únicamente las probabilidades del profesor para las filas sin etiqueta. El resultado es un modelo de 8.392.695.024 parámetros (8,39 mil millones) en BF16, con licencia Apache-2.0 y pesos en safetensors.

Su relevancia es acotada y muy específica: se trata de un artefacto de investigación dentro de un circuito de subred descentralizada, no de un modelo generalista pensado para producción. La información pública disponible es escasa y proviene casi exclusivamente de la model card, por lo que muchos parámetros técnicos (contexto, idiomas, benchmarks) no están disponibles.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de Qwen/Qwen3.5-9B); incluye torre de visión heredada del modelo padre |
| Parámetros totales | 8.392.695.024 (8,39 B) |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (pesos publicados en BF16) |
| Idiomas soportados | no disponible (la model card indica "language weights trained", sin lista de idiomas) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (tamaño del repo: 16,8 GB) |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Qwen/Qwen3.5-9B, un transformer de aproximadamente 8,4 mil millones de parámetros, con una torre de visión que se conserva del modelo padre según la model card. El modelo se distribuye en BF16 y en el "chassis layout" del pool Zils, es decir, una disposición de pesos compatible con el formato de los soups de la subred. No se detalla si la atención incorpora innovaciones específicas (atención lineal, decodificación especulativa u otras), por lo que no puede confirmarse.

El procedimiento de entrenamiento es un modelo-soup: seis fine-tunes LoRA de rango 32 sobre el punto de partida `vllm-sr/d3-flash`, cada uno con una semilla distinta, una pasada barajada sobre unas 46.100 filas y tasa de aprendizaje 5e-5, fusionados y promediados con pesos uniformes e iguales. Los datos se componen de (1) aproximadamente 31.100 ítems de decisión en formato examen de las familias de tareas conocidas, generados con la receta pública `scripts/author_exam.py` por Claude Opus y por un modelo abierto local, a partir de splits de entrenamiento de datasets públicos, incluyendo unos 1.100 ítems de tool-calling extraídos de las filas 90.000-93.000 del subconjunto de function-calling de `glaiveai/glaive-function-calling-v2`; y (2) 15.000 filas del split de entrenamiento de `tasksource/tasksource-jev-typed-decisions`, usadas solo como entradas de destilación sin etiqueta. Los objetivos son suaves: para los ítems escritos, un cuarto de la respuesta propia del ítem y tres cuartos de las probabilidades del soup `d3-mini` (promedio uniforme de `Zayaan/zils-mini-hm4`, `qhoenix/zils-mini-decision-t2avg` y `joamCriff123/zils-mini-m1113b`); para las filas sin etiqueta, solo las probabilidades del profesor. No se usaron ítems de examen de validador, ni ítems de examen semilla públicos, ni datos de clientes.

## Capacidades

- Generación de texto y razonamiento general, heredados del modelo base Qwen3.5-9B.
- Toma de decisiones en formato examen dentro de las familias de tareas del ecosistema Zils (clasificación/elección de respuesta).
- Tool calling / function calling: se entrenó explícitamente con unos 1.100 ítems de tool-calling derivados de Glaive Function Calling v2.
- Capacidades de visión: la torre de visión se hereda del modelo padre, aunque la model card no detalla el alcance ni el rendimiento en tareas multimodales.
- Capacidades multilingües: no disponibles; la model card menciona "language weights trained" sin especificar idiomas.
- Razonamiento multi-paso y uso como agente: no documentado de forma explícita.
- Modo "thinking": no documentado.

## Casos de uso

- Evaluación interna de decisiones tipo examen: el modelo está entrenado específicamente sobre ítems de decisión en formato examen de las familias de tareas Zils, por lo que sirve para validar y comparar soups dentro del circuito de la subred 127.
- Participación en el pool de soups `d3-flash`: como "body" del pool, se puede combinar con otros pesos para generar nuevos soups promediados, que es precisamente el flujo de trabajo para el que fue creado.
- Destilación de profesor para nuevos fine-tunes: sus pesos y su procedimiento (objetivos suaves con probabilidades del soup `d3-mini`) sirven de referencia para reproducir o extender la receta de destilación.
- Clasificación y enrutamiento de consultas: dado el entrenamiento en ítems de decisión, puede emplearse para tareas de elección entre opciones o categorización, aunque sin garantías de calidad fuera del dominio de entrenamiento.
- Asistente con tool calling en prototipos: los ítems de Glaive Function Calling v2 permiten experimentar con llamadas a funciones en entornos controlados, integrándolo mediante vLLM o llama.cpp.
- Investigación sobre fusión de modelos: el modelo es un caso documentado de model soup con LoRA de rango 32 y promediado uniforme, útil para estudiar el efecto de la fusión y de la destilación suave en modelos de ~8 B.
- Base para experimentos multimodales: al conservar la torre de visión del padre, puede servir como punto de partida para tareas imagen-texto, siempre que se valide su comportamiento real.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16: aproximadamente 16,8 GB solo para pesos, más overhead de activaciones y caché KV; en la práctica, se recomienda al menos 24 GB para contexto moderado.
- Cuantización a 8 bits (INT8/FP8): en torno a 8-9 GB de pesos; a 4 bits (GGUF Q4): en torno a 4,5-5 GB de pesos.
- GPU recomendadas: A100 40/80 GB, H100, L40S o RTX 6000 Ada para BF16 con contexto largo; RTX 4090 (24 GB) para BF16 con contexto limitado o cuantización 8 bits.
- GPU de consumo: cabe en RTX 4090 y en RTX 3090 (24 GB) en BF16 con contexto ajustado; en RTX 4080/4070 Ti Super (16 GB) o inferiores, requiere cuantización a 8 o 4 bits.
- Opciones de despliegue: vLLM (compatible con el formato safetensors y con el ecosistema del modelo base), llama.cpp/GGUF, Ollama y TGI, siempre que se genere la cuantización correspondiente; el autor no publica pesos GGUF en el repositorio.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| zils-flash-fs6 | 8,39 B | no disponible | Apache-2.0 | Hugging Face (0 descargas, 0 likes) | Fine-tune de decisión para el pool Zils; sin benchmarks publicados |
| Qwen/Qwen3.5-9B | ~9 B (según denominación) | no disponible | no disponible en la información | Hugging Face | Modelo base del que deriva; capacidades generalistas |
| vllm-sr/d3-flash | no disponible | no disponible | Apache-2.0 | Hugging Face | Punto de partida del fine-tune; modelo de la casa d3-flash |
| Zayaan/zils-mini-hm4, qhoenix/zils-mini-decision-t2avg, joamCriff123/zils-mini-m1113b | no disponible | no disponible | no disponible | Hugging Face | Componentes del soup profesor `d3-mini` usado para destilación |

No se dispone de datos de rendimiento comparativo entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados; al derivar de Qwen3.5-9B y de datos sintéticos generados por Claude Opus y un modelo abierto local, puede heredar sesgos del modelo base y de los generadores.
- Riesgo de alucinación: no evaluado; el entrenamiento con objetivos suaves de destilación no elimina la generación de contenido incorrecto.
- Limitaciones de contexto e idioma: la longitud de contexto y la lista de idiomas no están disponibles, lo que impide garantizar su comportamiento fuera del inglés o de los idiomas del modelo base.
- Restricciones de licencia: los pesos son Apache-2.0, pero la model card advierte explícitamente de que se deben consultar los términos de los datasets de origen antes de reutilizar; algunos datasets de `tasksource/tasksource-jev-typed-decisions` fueron excluidos por metadatos de licencia comercial o no especificada, pero la verificación queda en manos del usuario.
- Uso en producción: el modelo es un artefacto de investigación de una subred descentralizada, con cero descargas y cero likes, sin benchmarks ni validación externa; no se recomienda para producción sin una evaluación propia.
- Trazabilidad: la model card no detalla la composición exacta de las familias de tareas del examen ni el rendimiento por familia, lo que dificulta auditar su comportamiento.
- Datos de entrenamiento sintéticos: la mayor parte de los ítems fueron generados por modelos, con el riesgo de amplificar errores del generador.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Charlie320/zils-flash-fs6
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B
- Punto de partida del fine-tune: https://huggingface.co/vllm-sr/d3-flash
- Componentes del soup profesor: https://huggingface.co/Zayaan/zils-mini-hm4
- Componentes del soup profesor: https://huggingface.co/qhoenix/zils-mini-decision-t2avg
- Componentes del soup profesor: https://huggingface.co/joamCriff123/zils-mini-m1113b
- Dataset de destilación sin etiqueta: https://huggingface.co/datasets/tasksource/tasksource-jev-typed-decisions
- Dataset de function calling: https://huggingface.co/datasets/glaiveai/glaive-function-calling-v2
