# Lucasgitguy-co/spot-snake-laya-multilingual-v0.1

## Resumen

Spot Snake Laya Multilingual v0.1 es un ajuste fino del modelo base convaiinnovations/laya-multilingual orientado a la toma de decisiones tipadas para el juego Spot's Biscuit Snake, una implementación de serpiente en un único fichero HTML. Lo desarrolla Lucasgitguy-co y se publica bajo licencia Apache 2.0. El modelo no es un generador de texto generalista: es un cabezal de decisión que recibe el estado del tablero y una pregunta de tipo `choice` con las opciones legales, y devuelve una elección etiquetada. Con 321.908.998 parámetros (unos 322 millones) y un repositorio de 0,7 GB en safetensors, está pensado para ejecutarse en hardware modesto.

La relevancia del modelo es acotada pero concreta: demuestra un flujo de post-entrenamiento sobre la familia Laya (entrenador RLCD) para convertir un modelo base multilingüe en un decisor de dominio específico, con evaluación por acuerdo con el profesor (teacher agreement) en lugar de por puntuación de juego. El autor reporta una mejora sustancial frente al checkpoint base en los conjuntos de test reservados, incluyendo un caso difícil donde la heurística de "seguir la dirección de la cabeza" falla por completo.

El modelo cubre inglés y neerlandés, y su uso previsto es la selección de movimientos dentro del juego, no tareas abiertas de lenguaje natural. Cualquier integración en producción debe mantener las comprobaciones de legalidad del propio juego en la ruta de selección de movimiento, tal como advierte el autor.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Laya (modelo de decisiones tipadas; encoder + cabezal de decisión), base convaiinnovations/laya-multilingual |
| Parametros totales | 321.908.998 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en, nl |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de convaiinnovations/laya-multilingual y se post-entrena mediante el entrenador RLCD de Laya, ajustando el encoder y el cabezal de decisión durante tres épocas. El entrenamiento se ejecutó en un Apple M4 con 5.600 filas de entrenamiento, reservando 400 filas del split de entrenamiento para el ajuste de temperatura. El conjunto de datos es Lucasgitguy-co/spot-snake-decisions-v0.2, construido sobre el profesor "room-then-heading" (primero sala, luego dirección) para Spot's Biscuit Snake.

La innovación técnica principal es el enfoque de decisiones tipadas: el modelo no genera texto libre, sino que responde a preguntas estructuradas de tipo `choice` con opciones legales proporcionadas por el llamante, devolviendo una elección y una confianza. El ajuste de temperatura de elección devolvió aproximadamente 1,0, y el error de calibración esperado (ECE) en diez bins sobre el reto reservado fue de 0,0483, lo que indica una calibración razonable de las probabilidades de elección. La evaluación se realiza por acuerdo con el profesor, no por métricas de juego.

## Capacidades

- Selección de movimientos en Spot's Biscuit Snake a partir del estado del tablero y de las opciones legales.
- Decisiones tipadas: responde a preguntas de tipo `choice` con una de las opciones legales suministradas.
- Salida con confianza calibrada (ECE de 0,0483 en el reto reservado) y parámetro `min_confidence` en la predicción.
- Multilingüe en inglés y neerlandés, con los mismos tableros evaluados en ambos idiomas.
- No soporta tool calling ni function calling de propósito general.
- No dispone de modo de razonamiento multi-paso ni de agentes autónomos.
- Sin capacidades de visión, audio ni generación de texto libre.

## Casos de uso

- Jugador automático de Spot's Biscuit Snake: se carga el modelo con `laya.load()` y se le pasa el estado actual junto con una pregunta `choice` que contiene los movimientos legales; el modelo devuelve la elección. Es su caso de uso principal y el único documentado por el autor.
- Integración en el cliente HTML con WebGPU: el repositorio Gitguy268/spot-snake incluye un jugador de IA opcional que usa el modelo en la GPU del usuario a través de WebGPU, adecuado por el tamaño reducido (0,7 GB) del checkpoint.
- Evaluación de estrategias de decisión: sirve como referencia post-entrenada frente al modelo base y frente a la heurística de dirección de cabeza, con conjuntos de test reservados y métricas de acuerdo con el profesor.
- Investigación en calibración de decisiones: el ECE reportado y el ajuste de temperatura permiten estudiar la fiabilidad de las probabilidades de elección en tareas de dominio cerrado.
- Pruebas de robustez multilingüe: los mismos tableros en inglés y neerlandés permiten comparar el comportamiento del modelo entre idiomas (100,00% en inglés frente a 99,88% en neerlandés en el reto).
- Prototipado de decisores de dominio específico: el flujo (modelo base Laya, dataset de decisiones, entrenador RLCD, ajuste de temperatura) es replicable para otros juegos o entornos con acciones discretas y legales acotadas.

## Benchmarks y rendimiento

Resultados de acuerdo con el profesor (teacher agreement) reportados por el autor:

| Conjunto reservado | Filas | Base | Post-entrenado | Heurística de dirección |
|---|---:|---:|---:|---:|
| Legacy test (inglés) | 1.708 | 53,57% | 100,00% | 99,94% |
| Challenge (combinado) | 1.600 | 46,81% | 99,94% | 62,75% |
| Challenge (inglés) | 800 | 46,88% | 100,00% | 62,75% |
| Challenge (neerlandés) | 800 | 46,75% | 99,88% | 62,75% |
| Challenge (dirección falla, ambos idiomas) | 400 | 18,00% | 99,75% | 0,00% |

No se han publicado resultados de puntuación de juego ni de tasa de victoria; el autor indica que requieren rollouts separados. Tampoco hay benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; con 321.908.998 parámetros y pesos safetensors, en FP32 ocuparía aproximadamente 1,3 GB y en FP16 unos 0,65 GB, más el overhead del runtime Laya.
- GPU recomendadas: no disponible. El autor entrenó en un Apple M4 y el cliente del juego usa WebGPU, lo que sugiere ejecución en GPU de consumo.
- Cabe en GPU de consumo: sí, por el tamaño del checkpoint (0,7 GB en el repositorio).
- Opciones de despliegue: runtime Laya (`pip install laya==0.4.26`) con `laya.load()`; el cliente del juego usa WebGPU. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Spot Snake Laya Multilingual v0.1 | 321.908.998 | no disponible | Decisiones tipadas para Spot's Biscuit Snake (en, nl) | apache-2.0 | Hugging Face |
| convaiinnovations/laya-multilingual (base) | no disponible | no disponible | Modelo base Laya multilingüe | no disponible | Hugging Face |
| Heurística de dirección de cabeza | no aplica | no aplica | Política de referencia para el mismo juego | no aplica | Código del juego |

No se dispone de información sobre otros modelos de decisión comparables en la misma categoría.

## Limitaciones y advertencias

- El modelo está especializado en un único juego; no es un modelo de lenguaje generalista y no debe usarse para generación de texto, código ni razonamiento abierto.
- Los resultados miden acuerdo con el profesor, no rendimiento real de juego; la puntuación y la tasa de victoria no están publicadas.
- Es imprescindible mantener las comprobaciones de legalidad del juego en la ruta de selección de movimiento; el modelo no garantiza por sí mismo movimientos legales.
- Solo cubre inglés y neerlandés; no hay datos sobre otros idiomas.
- Riesgo de alucinación: no aplica en el sentido habitual, pero el modelo puede elegir opciones subóptimas fuera de la distribución del profesor; la calibración reportada (ECE 0,0483) es solo sobre el reto reservado.
- Licencia Apache 2.0: permite uso comercial, pero el modelo base convaiinnovations/laya-multilingual debe verificarse por separado.
- El modelo tiene 0 descargas y 0 likes, y fue creado en 2026-11-06; no hay evidencia de uso en producción ni validación externa.
- No se documentan sesgos, límites de contexto ni comportamiento fuera del dominio del juego.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Lucasgitguy-co/spot-snake-laya-multilingual-v0.1
- Dataset: https://huggingface.co/datasets/Lucasgitguy-co/spot-snake-decisions-v0.2
- Modelo base: https://huggingface.co/convaiinnovations/laya-multilingual/tree/1720e3e3357cfe1e281542e223f8273b0890ca34
- Colección Spot Snake models: https://huggingface.co/collections/Lucasgitguy-co/spot-snake-models
- Repositorio del juego: https://github.com/Gitguy268/spot-snake
