# PelaAI/KnowLine-0.8B-Gen1

## Resumen

KnowLine-0.8B-Gen1 es un modelo de decisión de 0,8 mil millones de parámetros desarrollado por PelaAI, un equipo con sede en Japón, mediante un ajuste fino supervisado (LoRA SFT) sobre Qwen3.5-0.8B. Su propósito no es generar texto libre, sino mapear un estado estructurado y una o varias preguntas tipadas (elección entre opciones, sí/no y puntuaciones ordenadas) a distribuciones de probabilidad sobre las opciones suministradas. Para ello lee directamente la probabilidad del token de cada etiqueta de opción, lo que lo convierte en un componente de decisión más que en un chatbot generativo.

El modelo se publica junto a variantes mayores de la misma familia (KnowLine-2B-Gen1, KnowLine-9B-Gen1 y KnowLine-4B-Gen5.5) y comparte con ellas el conjunto de datos de decisión empleado en el entrenamiento: 1.143.656 filas renderizadas con la plantilla de chat de Qwen3.5, con un máximo de 12.288 tokens por fila. La relevancia actual del modelo reside en su orientación a producción: latencias de decenas de milisegundos en una sola GPU H20, probabilidades calibradas (temperatura de lectura T = 1,54 plegada en los pesos) y una tasa de respuestas manipuladas por instrucciones inyectadas por debajo del 5 % en sus propias pruebas.

Aunque la etiqueta de pipeline es `image-text-to-text` y conserva la torre de visión del modelo base, el autor indica explícitamente que no hubo entrenamiento con imágenes: la torre es la original de Qwen3.5-0.8B. El modelo soporta inglés y chino (simplificado y tradicional) y se distribuye con licencia Apache-2.0 en formato safetensors.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen3.5) con torre de visión heredada del modelo base; ajuste fino como modelo de decisión |
| Parametros totales | 852.985.920 (0,85B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | hasta 12.288 tokens por fila de entrenamiento; lectura doble para peticiones de texto corto (hasta 3.000 tokens leídos una vez) |
| Tipos de cuantizacion | bf16 (checkpoint publicado); otras cuantizaciones no disponibles |
| Idiomas soportados | en, zh (chino simplificado y tradicional) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (librería transformers) |

## Arquitectura y entrenamiento

El modelo parte de Qwen3.5-0.8B, un transformer decoder-only de la familia Qwen3.5, y se especializa mediante un único epoch de LoRA SFT con rango 32 y alpha 64 aplicado únicamente a las capas lineales del modelo de lenguaje, posteriormente fusionado en pesos bf16. El checkpoint publicado corresponde al final del entrenamiento. El conjunto de datos de decisión es el mismo que el de KnowLine-9B-Gen1: 1.143.656 filas renderizadas con la plantilla de chat de Qwen3.5 y un máximo de 12.288 tokens por fila. No se incluyen los datos de entrenamiento en el repositorio.

La innovación principal es el mecanismo de lectura de probabilidades: en lugar de generar texto, el modelo calcula la probabilidad del token correspondiente a cada etiqueta de opción. Para mejorar la calibración, se ajustó una temperatura de lectura T = 1,54 sobre los conjuntos dorados del equipo y se plegó directamente en `model.language_model.norm.weight`; además, `temperatures.json` divide los logits de las preguntas de puntuación por 0,6494 (= 1/1,54) para que se lean a temperatura efectiva 1,0. El front end incluido (`knowline_server.py`, `knowline_engine.py`, `knowline_layout.py`) renderiza los prompts con `enable_thinking=False`, ya que la plantilla de chat de Qwen3.5-0.8B activa el modo thinking por defecto. No hubo entrenamiento con imágenes.

## Capacidades

- Preguntas de elección con opciones nombradas: devuelve una distribución de probabilidad sobre las opciones suministradas.
- Preguntas de sí/no: responde con la probabilidad del token de afirmación frente al de negación.
- Preguntas de puntuación ordenada: asigna probabilidades a una escala ordenada de respuestas.
- Lectura calibrada: la temperatura de lectura está plegada en los pesos, de modo que el front end opera a temperatura 1.
- Lectura doble para peticiones cortas de solo texto (hasta 3.000 tokens leídos una vez; el resto se lee dos veces).
- Soporte multilingüe en inglés y chino (simplificado y tradicional).
- Conserva la torre de visión del modelo base, aunque no fue entrenada para tareas de imagen.
- No genera texto libre cuando responde: su salida es una distribución sobre opciones.
- No se documenta soporte de tool calling, function calling ni razonamiento agéntico multi-paso en la información disponible.

## Casos de uso

- Enrutamiento de tickets de soporte: el modelo recibe el estado textual del caso y una pregunta de elección con criterios por equipo (por ejemplo, facturación frente a soporte técnico) y devuelve la probabilidad de cada ruta; la latencia mediana de 24,6 ms por petición permite integrarlo en un pipeline de triaje en tiempo real.
- Decisión de reembolso o compensación: con una pregunta de tipo sí/no sobre el estado del pedido, el modelo produce una probabilidad calibrada (ECE de 0,008-0,012 en la suite pública) que puede umbralizarse o escalarse a revisión humana.
- Moderación y clasificación estructurada: al leer directamente la probabilidad de etiquetas de opción, encaja en flujos de clasificación de contenido donde se necesita una puntuación por categoría en lugar de texto generado.
- Puntuación de riesgo ordenada: las preguntas de puntuación ordenada permiten asignar probabilidades a niveles (bajo, medio, alto) en evaluaciones de riesgo o priorización de casos.
- Evaluación automatizada de decisiones: el modelo puede actuar como juez o clasificador en conjuntos de evaluación tipo Decision Index, con la ventaja de que no requiere parsear texto libre.
- Despliegue de bajo coste en producción: con 0,85B parámetros y pesos bf16, cabe en GPUs de gama media y ofrece una latencia adecuada para servicios de decisión de alto volumen.
- Procesamiento multilingüe inglés-chino: útil en flujos de atención al cliente o clasificación documental que operen en ambos idiomas, incluido el chino tradicional.

## Benchmarks y rendimiento

| Medición | Resultado |
|---|---:|
| Decision Index 0.3 público (ejecución propia, kit oficial) | 44,51 |
| Índice bruto público | 58,35 |
| Peticiones / peticiones puntuables | 140.620 / 140.178 |
| Respuestas puntuables / errores / no soportadas | 140.178 / 0 / 0 |
| Latencia una petición a la vez: mediana / media / percentil 95 | 24,6 / 39,6 / 117,3 ms |
| Conjuntos internos retenidos (inglés / chino simplificado / chino tradicional) | 57,9 / 63,5 / 53,4 |
| C-Eval | 56,3 |
| Open-Jev 1.1 (test / OOD) | 71,5 / 69,7 |
| JevBench / JevBench-hard | 71,9 / 49,5 |
| Tareas de decisión de dominios nuevos (45 tareas propias) | 23,5 |
| S1MB (inglés v1, ejecución local), Task Avg sobre 137 benchmarks | 34,17 |
| ECE en la suite pública (método del board) | 0,008-0,012 |
| Instrucciones inyectadas: opción plantada con plantillas vistas en entrenamiento | 2,1 % |
| Instrucciones inyectadas: plantillas no vistas en entrenamiento | 4,2 % (25 de 600) |

Comparativa del board (snapshot multimodalart/jev-decision-index @ c130faf6, datos del 2026-10-29):

| Modelo | Tamaño | DI 0.3 público | DI 0.4.1 completo | Fuente |
|---|---:|---:|---:|---|
| **KnowLine-0.8B-Gen1** | 0,8B | **44,51** | aún no puntuado | ejecución propia, kit oficial |
| GLiClass v4 edge | 0,4B | 47,49 | 31,21 | board |
| OneJev1.6-0.8B | 0,9B | 48,76 | 29,58 | board |
| crystal-0.8b | 0,9B | 42,79 | 29,37 | board |
| vLLM-SR vela3-fast | 0,4B | 50,36 | 29,27 | board |
| StartLux-Decision v1.1 0.8B | 0,9B | 53,79 | 28,88 | board |

## Requisitos de hardware

- VRAM estimada: con pesos bf16 y 0,85B parámetros, el checkpoint ocupa aproximadamente 1,7 GB; el repositorio completo pesa 1,8 GB. La VRAM de inferencia añade el coste del contexto y del front end, pero se mantiene holgadamente por debajo de 8 GB en bf16.
- GPU recomendadas: el autor reporta mediciones en una GPU H20 (24,6 ms de mediana por petición, una a la vez). Por tamaño, cabe en GPUs de consumo como RTX 4090, RTX 4080 o RTX 3090, e incluso en tarjetas con 8 GB o menos en bf16.
- Cabe en GPU de consumo: sí, con amplio margen.
- Opciones de despliegue: el autor proporciona un front end propio (`serve_knowline.sh`, `knowline_server.py`, `knowline_engine.py`, `knowline_layout.py`) sobre SGLang 0.5.21, con endpoint `/v1/systemone`. Requiere PyTorch con CUDA y `transformers`. No se documentan integraciones con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: mediana de 24,6 ms, media de 39,6 ms y percentil 95 de 117,3 ms por petición en una H20, una petición a la vez. La ejecución de la suite pública se distribuyó en cuatro servidores H20 idénticos con 32 shards de cliente. No se publica throughput agregado.

## Comparativa con modelos similares

| Modelo | Tamaño | DI 0.3 público | DI 0.4.1 completo | Licencia | Disponibilidad |
|---|---:|---:|---:|---|---|
| KnowLine-0.8B-Gen1 | 0,8B | 44,51 | no disponible | Apache-2.0 | HuggingFace (PelaAI) |
| StartLux-Decision v1.1 0.8B | 0,9B | 53,79 | 28,88 | no disponible | board |
| OneJev1.6-0.8B | 0,9B | 48,76 | 29,58 | no disponible | board |
| GLiClass v4 edge | 0,4B | 47,49 | 31,21 | no disponible | board |
| crystal-0.8b | 0,9B | 42,79 | 29,37 | no disponible | board |

En la comparativa del propio autor, KnowLine-0.8B-Gen1 obtiene el índice bruto más alto del grupo en la suite pública (58,35) pese a quedar por debajo en el índice ajustado (44,51). El modelo no tiene aún puntuación en el índice completo 0.4.1, que en el resto de modelos del board procede de ejecuciones privadas de los mantenedores. Los datos de licencia y disponibilidad de los modelos comparables no están disponibles en la información proporcionada.

## Limitaciones y advertencias

- No genera texto libre: solo responde a preguntas tipadas (elección, sí/no, puntuación ordenada) sobre opciones suministradas; no sirve como chatbot general.
- Riesgo de inyección de instrucciones: el 2,1 % de las respuestas se desplazaron a una opción plantada con plantillas vistas en entrenamiento y el 4,2 % con plantillas no vistas, dentro del objetivo del 5 % del autor pero no despreciable en entornos hostiles.
- El rendimiento en dominios nuevos es bajo: 23,5 en las 45 tareas propias de dominios no vistos, frente a 57,9-63,5 en los conjuntos retenidos de inglés y chino.
- Idiomas limitados a inglés y chino (simplificado y tradicional); no se documenta soporte de castellano ni de otras lenguas.
- La torre de visión se hereda del modelo base sin entrenamiento específico con imágenes, por lo que las capacidades de imagen no están validadas para tareas de decisión.
- El modo thinking de la plantilla de Qwen3.5 está activado por defecto: si se construyen los prompts manualmente hay que pasar `enable_thinking=False` para replicar el comportamiento del front end.
- La puntuación completa del Decision Index 0.4.1 no está disponible para este modelo; la comparación con otros modelos del board se basa en ejecuciones privadas de los mantenedores.
- La temperatura de calibración está plegada en los pesos; modificarla o recuantizar sin recalibrar puede degradar la calibración de las probabilidades.
- Licencia Apache-2.0: permite uso comercial, pero el autor no ofrece garantías sobre el comportamiento en producción ni sobre sesgos no documentados.

## Enlaces

- HuggingFace: https://huggingface.co/PelaAI/KnowLine-0.8B-Gen1
- Notas de inferencia: https://huggingface.co/PelaAI/KnowLine-0.8B-Gen1/blob/main/INFERENCE.md
- README en chino: https://huggingface.co/PelaAI/KnowLine-0.8B-Gen1/blob/main/README.zh.md
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B
- KnowLine-2B-Gen1: https://huggingface.co/PelaAI/KnowLine-2B-Gen1
- KnowLine-9B-Gen1: https://huggingface.co/PelaAI/KnowLine-9B-Gen1
- KnowLine-4B-Gen5.5: https://huggingface.co/PelaAI/KnowLine-4B-Gen5.5
- Snapshot del board Decision Index: multimodalart/jev-decision-index @ c130faf6
