# latentport/LPBridge-Qwen3.5-4b-Qwen3.8-Flash-Next

## Resumen

LPBridge-Qwen3.5-4b-Qwen3.8-Flash-Next es un artefacto de investigación publicado por latentport que implementa una transferencia de estado (*state transfer*) entre dos modelos de lenguaje de Qwen: un modelo fuente Qwen3.5-4B y un modelo destino Qwen3.8-Flash-Next. No es un modelo generativo autónomo, sino un conjunto de pesos safetensors (3,2 GB) que contiene un *writer* entrenado para mapear el estado interno (features de atención, claves, valores, claves de indexer, historial de convolución y estado oculto terminal) del modelo de 4B hacia la caché de 48 capas del modelo Flash-Next. Ambos modelos base permanecen congelados y se descargan por separado.

El problema que aborda es el de la reutilización de contexto entre modelos heterogéneos: en lugar de reinyectar un prefijo de texto en el modelo destino (replay), se intenta transferir directamente el estado latente calculado por el modelo fuente. El paquete incluye una wheel de LatentPort (`latentport-0.4.4+flashbridge.1`) con extra BF16 y una API en Python para capturar un prefijo en el modelo fuente y abrir una sesión en el destino con el estado traducido.

La relevancia es fundamentalmente metodológica: es una *research preview* en BF16, probada en una única GPU NVIDIA RTX PRO 6000 Blackwell Server Edition, con una evaluación empaquetada de solo diez pares de prompts cortos. Los resultados muestran que el puente preserva información de tipo recall y documental, pero falla en coding, instruction y reasoning, por lo que no debe considerarse un sustituto de la inferencia nativa del modelo destino en producción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Puente de transferencia de estado (mapas lineales regularizados) entre dos transformers de Qwen; el destino usa caché de 48 capas con estado recurrente, indexer y convolución |
| Parámetros totales | No disponible (el repo pesa 3,2 GB; los pesos base son descargas separadas) |
| Parámetros activos | No disponible |
| Longitud de contexto | No disponible (la evaluación usa ventanas alineadas de 128 tokens y prefijos sintéticos de 17 tokens) |
| Tipos de cuantización | BF16 (único backend soportado en esta preview) |
| Idiomas soportados | No disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (+ wheel `latentport-0.4.4+flashbridge.1-py3-none-any.whl` con extra `bf16`) |

## Arquitectura y entrenamiento

El componente empaquetado es un *writer* que ajusta mapas lineales regularizados desde las features de atención del modelo fuente Qwen3.5-4B hacia las claves, valores, claves de indexer y el historial de convolución del modelo destino Qwen3.8-Flash-Next. Además, enruta y reescala el estado recurrente, ajusta por separado el estado oculto terminal y retiene los dos últimos token IDs alineados para el embedding de n-gramas del destino. Ambos modelos de lenguaje permanecen congelados durante todo el proceso; solo se entrena el puente.

El ajuste de la caché utilizó 62 ventanas de entrenamiento alineadas de 128 tokens (24 de código, 17 de documento y 21 de instrucción) más ocho prefijos sintéticos de 17 tokens. El ajuste del estado terminal empleó 768 estados de token emparejados. El autor indica que el writer empaquetado coincide exactamente con la implementación de investigación en los 110 campos de caché para un prefijo de 27 tokens. No se documentan datos de preentrenamiento, RLHF ni DPO, ya que el artefacto no es un modelo base sino un adaptador de estado.

## Capacidades

- Transferencia de estado latente desde un prefijo de texto capturado en Qwen3.5-4B hacia la caché de Qwen3.8-Flash-Next.
- Handoff soportado únicamente con prefijo de texto, alineado a tokens y con *thinking* desactivado.
- Conservación de información factual simple: en la evaluación empaquetada preserva los dos colores de sobre y los dos destinos (tareas recall y document, 2/2 cada una).
- Generación posterior en el modelo destino mediante `session.ask(...)` con límite de tokens configurable.
- No soporta tool calling, function calling, agentes multi-step, visión, audio ni modo thinking en la ruta soportada.
- Capacidades multilingües: no disponibles en la información proporcionada.

## Casos de uso

- Investigación sobre reutilización de contexto entre modelos: permite experimentar con transferencia de estado latente en lugar de replay de texto, usando la API `lp.load(...)` y `port.bridge.translate(prefix)`.
- Prototipado de pipelines de dos etapas: un modelo pequeño (4B) procesa el prefijo y un modelo destino consume la solicitud siguiente con el estado ya traducido, reduciendo el coste de reinyectar contexto en el destino.
- Evaluación de fidelidad de estado: comparar respuestas del puente frente a inferencia nativa del destino en tareas controladas de recall y document, como hace la tabla empaquetada.
- Estudio de mapas lineales entre espacios latentes: el ajuste regularizado de claves, valores, indexer y estado recurrente sirve como banco de pruebas para técnicas de alineación de representaciones.
- Docencia y reproducción de experimentos: la wheel y los scripts permiten reproducir el handoff en un entorno CUDA con los pesos base descargados aparte.
- No recomendado para atención al cliente, generación de código en producción, razonamiento aritmético ni instrucciones complejas: la evaluación muestra 0/2 en coding, instruction y reasoning frente a 2/2 del destino nativo.

## Benchmarks y rendimiento

Evaluación empaquetada del autor: cada par cambia un hecho y mantiene la solicitud fija; se cuentan respuestas cortas exactas tras eliminar espacios, énfasis y puntos; generación limitada a seis tokens.

| Tarea | Bridge | Flash-Next nativo | Solo pregunta |
|---|---:|---:|---:|
| recall | 2/2 | 2/2 | 0/2 |
| coding | 0/2 | 2/2 | 0/2 |
| document | 2/2 | 2/2 | 0/2 |
| instruction | 0/2 | 2/2 | 0/2 |
| reasoning | 0/2 | 2/2 | 0/2 |

El autor señala que la calidad en contexto largo y la velocidad relativa frente a replay no se han medido. No hay datos de MMLU, HumanEval, GSM8K ni otros benchmarks estándar en la información disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita; el repo del puente ocupa 3,2 GB y requiere además almacenamiento para los pesos base de Qwen3.5-4B y Qwen3.8-Flash-Next, que se descargan por separado.
- GPU probada: una NVIDIA RTX PRO 6000 Blackwell Server Edition, con expertos y embeddings del destino fijados y transmitidos desde almacenamiento.
- Compatibilidad con GPU de consumo: no confirmada en la información proporcionada.
- Despliegue: wheel de LatentPort con extra `bf16` en entorno CUDA compatible; no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles; el autor indica que la velocidad relativa frente a replay no se ha medido.

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| LPBridge-Qwen3.5-4b-Qwen3.8-Flash-Next | Puente de estado entre dos LLM | No disponible (repo 3,2 GB) | No disponible | Apache-2.0 | Hugging Face, 0 descargas, 0 likes |
| Qwen/Qwen3.5-4B | LLM base fuente | 4B (según nombre) | No disponible | No disponible en la información | Referenciado como base |
| Qwen/Qwen3.8-Flash-Next | LLM base destino | No disponible | No disponible (caché de 48 capas) | No disponible en la información | Referenciado como base |

No se dispone de datos de rendimiento comparables de alternativas equivalentes de transferencia de estado en la información proporcionada.

## Limitaciones y advertencias

- Es una *research preview*: el propio autor califica la evaluación como limitada a diez prompts cortos y no mide calidad en contexto largo ni velocidad frente a replay.
- Falla en coding, instruction y reasoning (0/2 en cada familia): la respuesta se mantiene fija cuando cambia el hecho relevante.
- Solo soporta prefijos de texto alineados a tokens y con *thinking* desactivado; no hay ruta para otros modos.
- Requiere descargar los pesos base de ambos modelos por separado, con el coste de almacenamiento y VRAM asociado.
- Sesgos conocidos: no documentados en la información proporcionada.
- Riesgo de alucinación: no cuantificado; la evaluación se limita a respuestas cortas exactas.
- Licencia Apache-2.0 para el puente, pero las licencias de los modelos base deben verificarse por separado antes de uso comercial.
- Sin descargas ni likes en Hugging Face en el momento de la ficha; soporte comunitario inexistente.

## Enlaces

- Hugging Face: https://huggingface.co/latentport/LPBridge-Qwen3.5-4b-Qwen3.8-Flash-Next
- Modelo base fuente: https://huggingface.co/Qwen/Qwen3.5-4B
- Modelo base destino: https://huggingface.co/Qwen/Qwen3.8-Flash-Next
- Búsqueda web proporcionada (sin relación con el modelo): https://www.sciencenews.org/century/computer-ai-algorithm-moore-law-ethics
