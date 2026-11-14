# Charlie320/zils-mini-nt2

## Resumen

zils-mini-nt2 es un modelo de decisión ("decision-model") publicado en Hugging Face por el usuario Charlie320, construido como un fine-tune del modelo base Qwen/Qwen3.5-4B. Forma parte del ecosistema Zils, asociado al pool de modelos `d3-mini` de la subred 127 de Bittensor, y su propósito es servir como "body" (cuerpo de pesos) dentro de ese pool de modelos combinados por averaging. El repositorio contiene únicamente pesos en formato safetensors, con un total de 4.539.265.536 parámetros (aproximadamente 4,54 mil millones) y un tamaño de 9,1 GB en BF16.

Técnicamente, el modelo se ha generado mediante una receta de "soup" (promediado de pesos): el punto de partida es la media uniforme de los pesos de tres modelos hermanos (Zayaan/zils-mini-hm4, qhoenix/zils-mini-decision-t2avg y joamCriff123/zils-mini-m1113b), y sobre esa base se han entrenado dos ejecuciones LoRA de rango 64 con distintas semillas, cada una fusionada en el modelo inicial. El entrenamiento se realizó sobre 63.840 decisiones tipadas procedentes del split de entrenamiento del dataset `tasksource/tasksource-jev-typed-decisions`, filtradas por licencia comercial, texto mayoritariamente ASCII y un máximo de 200 filas por dataset de origen (413 fuentes en total).

Su relevancia es acotada y muy específica: se trata de un artefacto de experimentación dentro de un circuito de modelos de decisión, no de un modelo generalista pensado para despliegue directo en producto. La model card es explícita en que solo contiene pesos y en que las condiciones de reutilización dependen de los términos de los datasets de origen. No hay pipeline declarado, no hay idiomas declarados y no hay resultados de benchmarks publicados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (heredada de Qwen/Qwen3.5-4B); incluye vision tower del modelo padre segun la model card |
| Parametros totales | 4.539.265.536 (4,54 mil millones, dato de safetensors) |
| Parametros activos | no disponible (no se declara arquitectura MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en BF16) |
| Idiomas soportados | no disponible (el entrenamiento usó texto mayoritariamente ASCII) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura subyacente es la del modelo Qwen/Qwen3.5-4B, un transformer decoder-only de aproximadamente 4,5 mil millones de parámetros. La model card indica que el modelo conserva el "chassis layout" del padre, que los pesos de lenguaje han sido entrenados y que la vision tower procede del modelo padre. No se documentan detalles adicionales sobre atención, positional encoding ni configuración de capas más allá de lo heredado.

El proceso de construcción combina dos técnicas. Primero, un promediado uniforme de pesos (model soup) de tres bodies de la soup `d3-mini` del 14 de noviembre de 2026, todos bajo Apache-2.0. Segundo, sobre ese punto de partida, dos ejecuciones de LoRA de rango 64 con anchor 0,1, learning rate 5e-5, una época y semillas distintas, cada una fusionada en el modelo inicial; el resultado final es la media uniforme de ambos runs. Los datos de entrenamiento son 63.840 decisiones tipadas del dataset `tasksource/tasksource-jev-typed-decisions`, restringidas a filas con `license_use: commercial`, texto mayoritariamente ASCII y un tope de 200 filas por dataset de origen (413 fuentes). La model card afirma que no se usaron ítems de examen de validador, ítems de examen semilla públicos ni datos de clientes. No se documenta RLHF, DPO ni ninguna innovación de decodificación.

## Capacidades

- Generación de texto y decisión tipada: el entrenamiento se orienta a producir decisiones con tipado (typed decisions), no a conversación general.
- Herencia de capacidades del modelo base Qwen3.5-4B en lenguaje, sujeta a posible degradación por el promediado y el fine-tune específico.
- Visión: la model card menciona que la vision tower procede del modelo padre, aunque no se detalla su estado tras el entrenamiento.
- Tool calling / function calling: no disponible como capacidad documentada.
- Agentes y razonamiento multi-paso: no disponible como capacidad documentada.
- Capacidades multilingües: no disponibles; el corpus de entrenamiento es mayoritariamente ASCII.
- Modo thinking, audio u otras capacidades especiales: no disponibles.

## Casos de uso

- Experimentación en pools de modelos de decisión: el modelo está diseñado como body para el pool `d3-mini` de Bittensor subnet 127, por lo que su uso natural es participar en experimentos de averaging y evaluación comparativa dentro de ese circuito.
- Investigación sobre model soups: sirve como caso reproducible de receta (promedio de tres bodies más dos LoRA de rango 64 fusionados) para estudiar el efecto del promediado sobre un base de 4,5 mil millones de parámetros.
- Estudio de fine-tuning con datos filtrados por licencia: el corpus de 63.840 decisiones tipadas con filtro `license_use: commercial` y tope por fuente permite analizar cómo afecta la composición del dataset a un modelo pequeño.
- Evaluación de robustez de decisiones tipadas: útil para medir consistencia en tareas de clasificación/decisión estructurada sobre texto mayoritariamente ASCII.
- Base para ablaciones de semilla y LoRA: al publicarse dos runs con semillas distintas promediados, permite reproducir y comparar variantes de entrenamiento.
- Prototipado interno de pipelines de decisión: con 4,54 mil millones de parámetros en BF16, puede ejecutarse en una GPU de gama alta para pruebas de concepto, siempre que se valide antes la calidad real del modelo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: en BF16, los 4,54 mil millones de parámetros ocupan aproximadamente 9,1 GB solo en pesos, más overhead de activaciones y KV cache; se recomienda partir de 16-24 GB de VRAM para contextos moderados. En cuantización de 8 bits, los pesos bajan a unos 4,5-5 GB; en 4 bits, a unos 2,5-3 GB, aunque no se declaran cuantizaciones oficiales.
- GPU recomendadas: A100 40/80 GB, H100, L40S o RTX 4090 (24 GB) para BF16; GPU consumer de 8-12 GB solo con cuantización agresiva y contexto corto.
- Cabe en GPU consumer: sí, en RTX 4090 en BF16 y en tarjetas de 8-12 GB con cuantización, siempre que se genere el formato cuantizado a partir de los safetensors.
- Opciones de despliegue: vLLM, TGI, llama.cpp u Ollama previa conversión a GGUF, y transformers con PyTorch para carga directa de safetensors. No se documenta soporte oficial para ninguno de estos stacks.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| zils-mini-nt2 | 4,54 mil millones | no disponible | apache-2.0 | Hugging Face, 0 descargas | Body de soup con LoRA fusionado; sin benchmarks |
| Qwen/Qwen3.5-4B | ~4 mil millones (segun modelo base) | no disponible en la informacion | no disponible en la informacion | Modelo base publico | Padre directo del fine-tune; referencia de capacidades |
| Zayaan/zils-mini-hm4 | no disponible | no disponible | apache-2.0 | Hugging Face | Uno de los tres bodies promediados |
| qhoenix/zils-mini-decision-t2avg | no disponible | no disponible | apache-2.0 | Hugging Face | Uno de los tres bodies promediados |
| joamCriff123/zils-mini-m1113b | no disponible | no disponible | apache-2.0 | Hugging Face | Uno de los tres bodies promediados |

## Limitaciones y advertencias

- Sesgos conocidos: no documentados; el corpus se limita a texto mayoritariamente ASCII y a 413 fuentes con tope de 200 filas cada una, lo que puede introducir sesgos de composición difíciles de auditar.
- Riesgo de alucinación: no evaluado; no hay benchmarks ni informes de evaluación que lo cuantifiquen.
- Limitaciones de contexto e idioma: la longitud de contexto no se declara y el entrenamiento favorece texto ASCII, por lo que el rendimiento multilingüe es incierto.
- Restricciones de licencia: los pesos son Apache-2.0, pero la model card advierte que cada fila de entrenamiento conserva la licencia de su dataset de origen y que deben revisarse los términos de los datasets antes de reutilizar; el repositorio solo contiene pesos.
- Caveats para producción: 0 descargas y 0 likes en Hugging Face, sin pipeline declarado y sin benchmarks; no es un modelo validado para despliegue en producto. El promediado de tres bodies más dos LoRA fusionados puede degradar capacidades heredadas del base, algo que solo una evaluación propia puede confirmar.
- Trazabilidad: la model card cita modelos y un dataset de 2026; conviene verificar la disponibilidad y vigencia de cada referencia antes de depender de ellas.

## Enlaces

- Hugging Face: https://huggingface.co/Charlie320/zils-mini-nt2
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
- Body promediado: https://huggingface.co/Zayaan/zils-mini-hm4
- Body promediado: https://huggingface.co/qhoenix/zils-mini-decision-t2avg
- Body promediado: https://huggingface.co/joamCriff123/zils-mini-m1113b
- Dataset de entrenamiento: https://huggingface.co/datasets/tasksource/tasksource-jev-typed-decisions
