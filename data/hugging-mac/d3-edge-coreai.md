# hugging-mac/d3-edge-CoreAI

## Resumen

d3-edge-CoreAI es una conversión local al formato `.aimodel` de Apple Core AI del modelo `vllm-sr/d3-edge`, publicada por el usuario hugging-mac. No se trata de un modelo generativo: es un modelo de decisión de texto que emite probabilidades sobre opciones predefinidas (choice), probabilidades sí/no o puntuaciones en niveles ordenados, sin generar texto libre. Su propósito es servir como componente de decisión en sistemas de voz full-duplex, clasificando intenciones del usuario (interrumpir, descartar, encolar, confirmar, etc.) a partir de un estado textual y un conjunto de candidatos.

La conversión mantiene el backbone de texto original en BF16 y un readout de 255 vías en FP32, sin cuantización ni reentrenamiento. El encoder de visión original se ha eliminado explícitamente, por lo que el modelo es solo texto. La ventana total es de 512 tokens, incluyendo estado, instrucciones, descripciones de candidatos y plantilla de chat; las peticiones que exceden ese límite fallan de forma explícita sin truncado.

Es relevante ahora porque ejemplifica el despliegue de modelos de decisión ligeros en Apple Silicon mediante Core AI, con inferencia nativa en Swift y Python, y porque publica de forma transparente sus fallos de precisión en rutas de negocio full-duplex. El autor advierte que la precisión no es suficiente para enrutamiento autónomo en producción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer híbrido con capas de atención completa (no causales) y capas DeltaNet (causales); backbone de texto con readout de 255 vías |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | 512 tokens totales (estado, instrucciones, candidatos y plantilla de chat); sin truncado, fallo explícito si se excede |
| Tipos de cuantización | ninguno; backbone BF16 y readout FP32 |
| Idiomas soportados | chino (zh) e inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | `.aimodel` (Apple Core AI), con adaptador Python y Swift; no requiere pesos PyTorch originales |

## Arquitectura y entrenamiento

El modelo base `vllm-sr/d3-edge` emplea una arquitectura híbrida en la que las capas de atención completa permanecen no causales y las capas DeltaNet permanecen causales. Sobre el backbone de texto se sitúa un readout de 255 vías que produce probabilidades sobre códigos candidatos, probabilidades sí/no o puntuaciones ordenadas. La conversión a Core AI no introduce entrenamiento ni cuantización: conserva el backbone BF16 y el readout FP32 del modelo original.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO. La model card tampoco documenta innovaciones de decodificación especulativa ni atención lineal más allá del uso de capas DeltaNet. La inferencia se ejecuta en Core AI, mientras que la tokenización, el formateo de preguntas y el ensamblado de respuestas se realizan en el host. El adaptador gestiona padding, máscara de atención y pooling del último token válido, con tamaño de lote 1 y sin estado recurrente ni KV persistente entre decisiones.

## Capacidades

- Clasificación zero-shot sobre candidatos definidos en tiempo de inferencia, devolviendo probabilidades relativas a las opciones suministradas.
- Preguntas de tipo choice (selección entre candidatos), sí/no y puntuaciones en niveles ordenados.
- Hasta 16 preguntas por llamada a `system_one`, procesadas secuencialmente; hasta 255 códigos candidatos, normalmente limitados antes por la capacidad del prompt.
- Procesamiento de estado textual e instrucciones en chino e inglés.
- Integración con aplicaciones de voz full-duplex para decidir acciones como interrumpir, descartar ruido, encolar peticiones o confirmar negaciones.
- Inferencia nativa en Swift y Python sobre Apple Silicon mediante Core AI.
- Rechazo explícito de imágenes y vídeo, de entradas que exceden 512 tokens, de opciones vacías, tipos de pregunta inválidos y niveles de puntuación inválidos.
- No genera texto libre; no soporta tool calling ni razonamiento multi-paso en el sentido de agentes generativos.

## Casos de uso

- Enrutamiento de intenciones en asistentes de voz: el modelo recibe el estado de la conversación y la transcripción final del usuario, y devuelve la probabilidad de cada acción candidata (interrumpir, descartar, encolar, responder). Es adecuado por su latencia baja y su contrato de decisión acotado a 512 tokens.
- Detección de interrupciones en sistemas full-duplex: con un estado como "el asistente está hablando; el usuario dice: para ya", el modelo puntúa la opción de interrupción frente a alternativas, integrándose en la lógica de control del turno de palabra.
- Clasificación de correcciones y negaciones: permite distinguir un "no" que responde a una pregunta del asistente de un "no" que cancela una acción previa, usando el contexto textual y las opciones definidas por la aplicación.
- Filtrado de ruido y ecos: con metadatos de procedencia de ruido proporcionados por el sistema, el modelo puede puntuar la opción de descartar frente a procesar una transcripción dudosa.
- Clasificación zero-shot de tickets o mensajes: aunque el pipeline declarado es zero-shot-classification, el modelo puede usarse para asignar un mensaje a un conjunto cerrado de categorías definidas en el prompt, siempre que quepa en 512 tokens.
- Componente de decisión en pipelines de agentes: puede actuar como clasificador previo que decide si una petición debe encolarse, responderse o descartarse antes de invocar un modelo generativo mayor.
- Evaluación de políticas de diálogo en investigación: los scripts `duplex_cases.py` y `evaluate_duplex.py` permiten reproducir escenarios etiquetados y comparar variantes de prompt.

## Benchmarks y rendimiento

La model card publica comparaciones de fidelidad de conversión frente al runtime original BF16 en CPU, no benchmarks estándar de NLP:

| Suite | Misma opción seleccionada | Diferencia absoluta máxima de probabilidad |
|---|---:|---:|
| 27 casos generales de texto + 48 casos full-duplex de política larga | 75/75 | 0,0188751 |
| Prompt corto en chino, mismos 48 casos de negocio | 48/48 | 0,0230880 |
| Prompt corto en inglés, mismos 48 casos de negocio | 47/48 | 0,0135900 |

Evaluación full-duplex con 48 casos sintéticos en chino:

| Prompt | Core AI correctos | Modelo original correctos | Falsas interrupciones | Falsos descartes | Interrupciones perdidas |
|---|---:|---:|---:|---:|---:|
| Política larga en chino + estado JSON | 24/48 | 24/48 | 0 | 16 | 9 |
| Prompt corto en chino | no disponible en el extracto | no disponible en el extracto | no disponible | no disponible | no disponible |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible. Las 171 comparaciones de prompt-case no equivalen a 171 escenarios de negocio independientes.

## Requisitos de hardware

- Probado en Apple M5 con 16 GiB de RAM, macOS 27.2 y Python 3.13.13.
- Inferencia nativa mediante Core AI en Apple Silicon; no se documentan requisitos para GPU NVIDIA.
- El paquete ocupa 1,0 GB en el repositorio de Hugging Face.
- Tamaño de lote 1; una instancia del modelo admite una inferencia nativa a la vez y rechaza solapamientos en lugar de encolar silenciosamente.
- Despliegue mediante el adaptador Python `coreai_d3` o carga nativa en Swift; no se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput no disponibles en la información proporcionada.
- Dependencias fijadas en `requirements-lock.txt`; el conversor advierte que PyTorch 2.14 supera el rango validado (<=2.13), aunque las pruebas se ejecutaron con las versiones registradas.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye modelos comparables de decisión full-duplex ni datos de rendimiento frente a alternativas.

## Limitaciones y advertencias

- La precisión de negocio full-duplex no es suficiente para enrutamiento autónomo en producción, según el propio autor.
- Las probabilidades son relativas a los candidatos suministrados y no están calibradas como confianza de enrutamiento; la probabilidad mayor no garantiza seguridad ni corrección.
- Ventana estricta de 512 tokens sin truncado; las peticiones largas fallan explícitamente.
- Solo texto: imágenes y vídeo se rechazan y el encoder de visión original se ha omitido.
- Solo chino e inglés; no se documentan otros idiomas.
- Tamaño de lote 1 y una inferencia simultánea por instancia; la cancelación es cooperativa y no garantiza interrupción inmediata del hardware.
- No hay estado recurrente ni KV persistente entre decisiones.
- En la evaluación full-duplex se observaron 16 falsos descartes y 9 interrupciones perdidas sobre 48 casos con política larga en chino.
- Un caso casi empate en inglés cambió de opción (de enqueue a discard) tras la conversión.
- El adaptador no ejecuta acciones de audio ni gestiona la cola de enunciados de la aplicación.
- No se evalúan transcripciones parciales ni tiempos de endpoint; todas las entradas ASR son transcripciones finales.
- La procedencia de ruido y eco es metadato proporcionado, no detección acústica del modelo.
- Licencia Apache 2.0 permite uso comercial, pero el estado experimental y los fallos publicados desaconsejan producción sin validación adicional.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/hugging-mac/d3-edge-CoreAI
- Modelo base: https://huggingface.co/vllm-sr/d3-edge
