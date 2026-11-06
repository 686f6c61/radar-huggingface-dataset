# shgao/rsi-jev-v7.0-vl-4b

## Resumen

rsi-jev-v7.0-vl-4b es un modelo de decisión tipada (typed-decision) multimodal de 4.69B parámetros, desarrollado por el usuario shgao dentro del proyecto RSI-Jev. Se trata de un fine-tuning completo sobre Qwen/Qwen3.5-4B que no genera texto libre: recibe un estado compuesto por un documento de texto y hasta cuatro imágenes, junto con una o varias preguntas tipadas (`choice`, `noul`, `score`), y devuelve una probabilidad para cada opción en un único forward pass. Es, por tanto, un modelo de "Sistema Uno": no produce razonamiento generado en inferencia, sino que puntúa directamente las alternativas.

La innovación principal reside en su arquitectura de decisión con salidas tempranas en las capas 16, 20 y 32: cada pregunta se responde en la primera profundidad en la que el modelo alcanza suficiente confianza, lo que permite un cómputo adaptativo controlado mediante el parámetro `effort`. Además, introduce dos cambios de formato respecto a su predecesor v6.1-VL: el *option echo* (la lista de opciones se repite una vez y se lee la segunda copia) y la *prefix-bidirectional attention* (el prompt y las opciones se atienden mutuamente en ambas direcciones en las capas de atención completa, mientras que solo la señal de respuesta permanece causal).

El modelo es relevante porque propone una alternativa a los LLM generativos para tareas de clasificación y decisión estructurada sobre documentos e imágenes: una sola pasada, latencia predecible, calibración explícita (ECE final de 0.039) y una API HTTP propia (Jev HTTP API). Se distribuye con licencia Apache 2.0 y un checkpoint autocontenido de 16.8 GB.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder (Qwen3.5) con cabezas de decisión tipada y salidas tempranas; vision tower multimodal |
| Parámetros totales | 4.69B (3.57B decoder de 32 capas + 0.64B embeddings + 0.33B vision tower + 0.05B cabeza principal + 0.10B dos cabezas de salida temprana) |
| Parámetros activos | No aplica (no es MoE); cómputo adaptativo por profundidad (16, 20 o 32 capas) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | No disponible (pesos en fp32 y bf16 según fichero) |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (`tower.safetensors`, `visual.safetensors`, `scorer.safetensors`, `aux_scorers.safetensors`) |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3.5-4B (revisión `851bf6e`) en su variante instruction-tuned, con fine-tuning completo (sin LoRA). La torre consta de 32 capas decoder, un vision tower de 0.33B parámetros (heredado del modelo base y nunca entrenado) y tres cabezas de decisión: la principal en la capa 32 y dos salidas tempranas en las capas 16 y 20 (una cuarta cabeza en la capa 12 se entrena pero se descarta en el paquete final). Cada cabeza emite probabilidades sobre las opciones, y el mecanismo `effort` determina cuántas capas se ejecutan en la pasada única.

El entrenamiento se realizó en una sola ejecución end-to-end de una época: 36.149 pasos de 64 preguntas, sobre un corpus de 2.76M ejemplos procedentes de 977 fuentes, con 115.957 preguntas con imagen, en 4x H200 durante 147.845 segundos. Las innovaciones de entrenamiento incluyen: (1) *retention traces*, donde Qwen3.5-4B genera cadenas de razonamiento greedy sobre 398.101 preguntas y se retienen 21.087 trazas limpias que terminan en respuesta encuadrada; (2) una pérdida KL de retención (peso 0.5, top-64 sobre los últimos 1.024 tokens) que mantiene la distribución del modelo cerca de la del base en esas trazas, usadas solo como señal de entrenamiento; (3) una pérdida de ranking de confianza (peso 1.0) sobre pares correcto/incorrecto; y (4) una KL de consistencia de orden de opciones (peso 2.0). Las 8 capas inferiores aprenden a una tasa de 5e-6 y las cabezas a 1e-4. La calibración se ajustó solo con los conjuntos de desarrollo: una temperatura por salida (log T 0.28, 0.22, 0.26 en capas 16, 20 y 32) y umbrales de 0.80 y 0.65 para el modo `auto`.

## Capacidades

- Decisión tipada sobre documentos de texto y hasta cuatro imágenes: preguntas de tipo `choice` (selección entre opciones), `noul` y `score`.
- Puntuación probabilística de cada opción en un único forward pass, sin generación de tokens de razonamiento.
- Cómputo adaptativo mediante `effort`: la misma pasada puede ejecutarse con 16, 20 o 32 capas según la profundidad de confianza requerida.
- Salida de metadatos de uso, incluido `usage.depth`, que indica la capa en la que se respondió cada pregunta.
- Procesamiento multimodal: lectura conjunta de texto e imágenes (hasta cuatro por estado).
- Servicio mediante la Jev HTTP API, con configuraciones de kernel fijadas para respuestas deterministas.
- No soporta tool calling, function calling ni razonamiento multi-paso generado: es un modelo de decisión de una sola pasada.
- Capacidades multilingües: no disponibles en la información proporcionada.

## Casos de uso

- Clasificación documental automatizada: dado un contrato, factura o informe y un conjunto de categorías predefinidas, el modelo devuelve la probabilidad de cada categoría en una sola pasada, lo que permite umbrales de confianza y revisión humana solo en los casos ambiguos.
- Moderación de contenido con imágenes: combinando texto y hasta cuatro imágenes por estado, se pueden puntuar opciones de política (permitido, revisar, bloquear) con probabilidades calibradas y trazabilidad de la profundidad de decisión.
- Enrutamiento de tickets de soporte: el modelo evalúa un mensaje de usuario contra un conjunto fijo de colas o departamentos y devuelve la distribución de probabilidad, útil para asignación automática con umbral de confianza.
- Evaluación automática de respuestas (scoring): preguntas de tipo `score` permiten puntuar opciones de calidad sobre pares pregunta-respuesta, aprovechando la calibración explícita (ECE 0.039) para decisiones basadas en umbrales.
- Verificación visual en control de calidad: con hasta cuatro imágenes por consulta, el modelo puede decidir entre opciones de estado (conforme, defectuoso, dudoso) en inspección de producto o documentos escaneados.
- Extracción de decisiones en pipelines de datos: integrado vía Jev HTTP API, el modelo puede actuar como clasificador determinista en un pipeline ETL, donde la reproducibilidad de la respuesta (kernels fijados) es un requisito.
- Investigación en cómputo adaptativo: el parámetro `effort` y las salidas tempranas permiten estudiar el compromiso entre precisión y coste computacional en modelos de decisión.

## Benchmarks y rendimiento

| Evaluación | v7.0-VL | v6.1-VL | Diferencia |
|---|---|---|---|
| Suite de evaluación | — | — | +0.005 |
| Conjunto held-out | — | — | +0.083 |
| MMLU-Pro | — | — | +0.040 |
| Imágenes | — | — | +0.005 |
| ECE final (calibración) | 0.039 | 0.048 | -0.009 |
| Decision Index 0.3 (público) | 60.63 | 50.98 | +9.65 |

Los valores absolutos de la suite, el held-out, MMLU-Pro y la evaluación de imágenes no se detallan en la información disponible; solo se publican las diferencias relativas frente a v6.1-VL. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el checkpoint completo ocupa 16.8 GB en el repositorio (fp32 para torre y norma final, bf16 para embeddings y vision tower). Una carga en bf16 requiere del orden de 9-10 GB de VRAM; en fp32, aproximadamente 19 GB. No se dispone de datos oficiales de cuantización.
- GPU recomendadas: el entrenamiento se realizó en 4x H200; para inferencia, una GPU con al menos 16-24 GB de VRAM es adecuada en bf16 (A100 40GB, H100, L40S, RTX 4090).
- Cabe en GPU consumer: sí, en tarjetas con 24 GB o más (RTX 4090, RTX 3090) en bf16; en 16 GB requeriría cuantización, no documentada oficialmente.
- Opciones de despliegue: el paquete oficial `rsi-jev[fast,vision]` con `rsi-jev serve v7.0-vl-4b`; el servidor fija las configuraciones de kernel para respuestas deterministas. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles. El diseño de pasada única con salidas tempranas (16 capas en lugar de 32) reduce el coste computacional por consulta, pero no se publican cifras de latencia.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| rsi-jev-v7.0-vl-4b | 4.69B | No disponible | Decisión tipada, una pasada, multimodal | Apache 2.0 | Hugging Face |
| Qwen/Qwen3.5-4B (base) | 4.66B | No disponible | LLM generativo instruction-tuned | No disponible en la información | Hugging Face |
| rsi-jev-v6.1-VL | No disponible | No disponible | Decisión tipada, versión previa | No disponible en la información | Repositorio del proyecto |

La comparación directa con modelos generativos de tamaño similar no es posible con los datos disponibles, ya que rsi-jev-v7.0-vl-4b no genera texto y sus benchmarks no son directamente equiparables a MMLU o HumanEval en formato generativo. El único punto de comparación cuantitativo publicado es frente a v6.1-VL, donde v7.0-VL obtiene 60.63 frente a 50.98 en el Decision Index 0.3.

## Limitaciones y advertencias

- El modelo no genera texto ni razonamiento: solo emite probabilidades sobre opciones predefinidas. No es adecuado para tareas de generación abierta, resumen o diálogo.
- El formato de entrada es estricto: requiere el *option echo* y la *prefix-bidirectional attention* con los que fue entrenado. Servirlo con otro stack (vLLM, llama.cpp) sin replicar ese formato producirá resultados degradados.
- La reproducibilidad depende de las configuraciones de kernel fijadas por el servidor oficial; otros entornos pueden dar respuestas distintas ante la misma petición.
- Riesgo de alucinación inherente a la puntuación probabilística: una opción puede recibir alta probabilidad aunque el documento no la respalde; la calibración (ECE 0.039) mitiga pero no elimina este riesgo.
- El umbral por defecto de 0.95 es un fallback: el valor ganador (0.85) no se confirmó en la mitad B del conjunto de desarrollo, lo que indica incertidumbre en la selección de umbral.
- Sesgos conocidos: no documentados en la información disponible; al derivar de Qwen3.5-4B, hereda los sesgos del modelo base, no evaluados en esta ficha.
- Idiomas soportados: no disponibles; no se confirma cobertura multilingüe.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero el modelo base Qwen3.5-4B puede tener condiciones adicionales que deben verificarse.
- El vision tower nunca se entrenó durante el fine-tuning; su comportamiento en dominios de imagen alejados del entrenamiento original no está caracterizado.
- Proyecto con 0 descargas y 0 likes en el momento de la ficha: ecosistema y soporte comunitario limitados.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/shgao/rsi-jev-v7.0-vl-4b
- Repositorio del proyecto: https://github.com/Shanghua-Gao/RSI-Jev
- Registro de versiones: https://github.com/Shanghua-Gao/RSI-Jev/tree/main/versions
- Documentación de la Jev HTTP API: https://github.com/Shanghua-Gao/RSI-Jev/blob/main/serve/README.md
- Código de entrenamiento v7.0: https://github.com/Shanghua-Gao/RSI-Jev/tree/main/train/v7.0/
- Receta de datos v7.0-VL: https://github.com/Shanghua-Gao/RSI-Jev/blob/main/data/v7.0-vl_recipe/README.md
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
