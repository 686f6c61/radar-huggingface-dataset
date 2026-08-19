# ProCreations/grug-27b-3.8

## Resumen

grug-27b-v1.1 es un modelo de lenguaje de 27 000 millones de parámetros desarrollado por ProCreations, un fine-tune del modelo Qwen/Qwen3.8-27B de Alibaba. Su propuesta principal es un estilo de razonamiento "grug": pensamiento interno extremadamente conciso y directo, sin relleno gramatical ni verbosidad, manteniendo la calidad de las respuestas finales en inglés normal. El modelo está orientado a tareas de razonamiento, generación de código, matemáticas y, especialmente, a uso agéntico con tool calling.

La relevancia actual del modelo radica en su eficiencia de tokens: frente a los 559 tokens de razonamiento que gasta el modelo base en HumanEval, grug-27b-v1.1 solo consume 79,5, una reducción de aproximadamente 7 veces, con una pérdida de rendimiento acotada (94,5 frente a 98,2 en HumanEval). Además, mejora drásticamente la selección de herramientas correctas en flujos agénticos (97,1 % frente al 23,5 % del base). Es un modelo Apache-2.0, con pesos en safetensors, y está diseñado para ejecutarse en hardware de gama alta o en la nube.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (variante Qwen3.8, compatible con image-text-to-text) |
| Parametros totales | 27 356 728 560 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (no se especifica en la ficha; el base Qwen3.8-27B soporta contexto largo, pero no se confirma) |
| Tipos de cuantizacion | no disponible (el repo publica safetensors en bfloat16) |
| Idiomas soportados | en (inglés) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (bfloat16) |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3.8-27B, un transformer denso de 27B parámetros con capacidades multimodales (image-text-to-text) y plantilla de razonamiento con `reasoning_effort`. Sobre esta base, ProCreations aplicó un proceso en tres pasos:

1. SFT sobre un corpus de 1 millón de filas con estilo "grug" (pensamiento interno conciso, respuestas finales en inglés normal).
2. Entrenamiento de una LoRA correctiva de rango 32 sobre las capas lineales del stack de texto.
3. Fusión de la LoRA con una fuerza de 0,5, valor que evita el sobreajuste hacia comportamiento de herramientas que rompía la generación de código (a 1,0x HumanEval cae a 84,8 y la selección de herramienta a 88,2; a 0,5x se obtiene 94,5 y 97,1 respectivamente).

El entrenamiento también corrigió tres defectos de datos: historias agénticas que terminaban con discursos de resumen en lugar de llamadas a herramienta, pensamiento en inglés en lugar de estilo grug, y dobles bloques de pensamiento por la plantilla de Qwen3.8. El resultado es un modelo que respeta el parámetro `reasoning_effort` (low, medium, xhigh) y que, según el autor, rinde mejor en configuración medium.

## Capacidades

- Razonamiento token-eficiente: genera cadenas de pensamiento internas muy cortas (79,5 tokens medios en HumanEval frente a 559 del base) sin degradar significativamente la calidad de la respuesta final.
- Generación de código: obtiene 94,5 en HumanEval y 88,0 en MBPP, con un estilo de salida en inglés normal.
- Matemáticas: 92,5 en GSM8K y 72,7 en MATH-500, con un consumo de tokens de razonamiento muy inferior al base.
- Tool calling y uso agéntico: alcanza 100 % de llamadas válidas y 97,1 % de selección correcta de herramienta en el benchmark agéntico del autor, con solo 20 tokens de razonamiento por paso.
- Recuperación ante fallos: en escenarios de fallo de herramienta, mantiene 100 % de llamadas válidas y 82,5 % de selección correcta de la siguiente acción.
- Control de esfuerzo de razonamiento: respeta el parámetro `reasoning_effort` de Qwen3.8, permitiendo elegir entre low (menos tokens, algo menos de precisión) y medium (mejor equilibrio).
- Multilingüe: aunque la ficha declara solo inglés, al estar basado en Qwen3.8-27B podría heredar capacidades multilingües del base, pero no se garantiza ni se documenta.

## Casos de uso

- Asistentes de código en entornos de desarrollo: el modelo puede integrarse en IDE o pipelines de CI/CD para generar funciones, corregir errores y sugerir implementaciones, con un coste de tokens de razonamiento muy bajo que reduce la latencia percibida y el gasto en API.
- Agentes autónomos con tool calling: gracias a su alta precisión en selección de herramienta (97,1 %) y a su bajo consumo de tokens por paso, es adecuado para agentes que deben encadenar llamadas a APIs, bases de datos o servicios externos sin divagar.
- Automatización de tareas de recuperación y reintento: en sistemas donde una herramienta falla, el modelo elige correctamente la siguiente acción en el 82,5 % de los casos, útil para orquestadores de workflows con manejo de errores.
- Chatbots de soporte técnico con contexto largo: al heredar la arquitectura de Qwen3.8, puede mantener conversaciones multi-turno extensas, aunque la ficha no especifica la longitud de contexto exacta.
- Generación de documentación técnica y explicaciones: su estilo de respuesta final en inglés normal, sin relleno, produce explicaciones directas y útiles para desarrolladores.
- Prototipado rápido de razonamiento matemático y lógico: con 92,5 en GSM8K y 72,7 en MATH-500, puede usarse en aplicaciones educativas o de análisis que requieran resolver problemas paso a paso con un presupuesto de tokens ajustado.

## Benchmarks y rendimiento

El autor publica resultados completos con el mismo harness y configuración (esfuerzo medio) para el modelo base, grug v1 y grug v1.1 (este modelo). Los datos son los siguientes:

| Benchmark | Qwen3.8 base | grug v1 | grug v1.1 |
|---|---|---|---|
| HumanEval | 98,2 | 87,8 | 94,5 |
| MBPP | 93,0 | 84,0 | 88,0 |
| GSM8K | 95,5 | 96,5 | 92,5 |
| MATH-500 | 78,0 | 64,7 | 72,7 |
| Repetition stress | 76,7 | 81,4 | 88,4 |
| Agentic — llamada válida | 98,5 | 100,0 | 100,0 |
| Agentic — herramienta correcta | 23,5 | 95,6 | 97,1 |
| Agentic — argumentos válidos | 98,5 | 100,0 | 100,0 |
| Recovery — llamada válida | 100,0 | 100,0 | 100,0 |
| Recovery — herramienta correcta | 32,5 | 90,0 | 82,5 |
| Bucles / pensamiento sin cerrar | — | — | 0 / 0 |

Tokens medios de razonamiento por respuesta:

| Benchmark | Qwen3.8 base | grug v1 | grug v1.1 |
|---|---|---|---|
| HumanEval | 559,0 | 42,2 | 79,5 |
| MBPP | 656,4 | 34,6 | 301,2 |
| GSM8K | 204,5 | 76,0 | 64,9 |
| MATH-500 | 750,5 | 163,2 | 190,3 |
| Paso agéntico | 108,5 | 29,4 | 20,0 |
| Recuperación de fallos | 78,2 | 33,4 | 24,0 |

Además, el autor probó el efecto del parámetro `reasoning_effort` en este modelo exacto, concluyendo que medium es el ajuste óptimo (gana 5 de 7 pruebas) y que xhigh perjudica la selección de herramienta (76,5 frente a 97,1). Con low se ahorra un 32 % de tokens de pensamiento a cambio de unos 7 puntos en HumanEval.

## Requisitos de hardware

- VRAM estimada: 54,8 GB en bfloat16 (según LLM Explorer), lo que requiere una GPU profesional o múltiples GPUs.
- GPU recomendadas: NVIDIA A100 80GB, H100 80GB, o configuraciones multi-GPU (por ejemplo, 2× RTX 4090 24GB con tensor parallelism). No cabe en una GPU de consumo de 24 GB sin cuantización.
- Opciones de despliegue: compatible con transformers, vLLM, TGI y otras herramientas que soporten safetensors y arquitectura Qwen3.8. También puede convertirse a GGUF para llama.cpp u Ollama, aunque no se proporcionan cuantizaciones oficiales.
- Latencia y throughput: no se publican datos específicos, pero la reducción de tokens de razonamiento (por ejemplo, 20 tokens por paso agéntico frente a 108,5 del base) implica una latencia de generación notablemente menor en tareas agénticas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | HumanEval | MBPP | GSM8K | Licencia |
|---|---|---|---|---|---|---|
| grug-27b-v1.1 (este) | 27,36B | no disponible | 94,5 | 88,0 | 92,5 | Apache-2.0 |
| Qwen3.8-27B (base) | 27B | no disponible | 98,2 | 93,0 | 95,5 | Apache-2.0 |
| grug-27b v1 (anterior) | 27B | no disponible | 87,8 | 84,0 | 96,5 | Apache-2.0 |

La comparativa directa con el base muestra que grug-27b-v1.1 sacrifica entre 3 y 5 puntos en código y matemáticas a cambio de una reducción de 7 a 30 veces en tokens de razonamiento y una mejora drástica en selección de herramientas. Frente a su predecesor v1, gana en HumanEval, MBPP, MATH-500, repetición y selección de herramienta, pero pierde en GSM8K y en recuperación de fallos. No se dispone de datos de otros modelos comparables de 27B en la información proporcionada.

## Limitaciones y advertencias

- GSM8K inferior al base y a v1: pierde 4 puntos frente al base (92,5 frente a 95,5), una pérdida real reconocida por el autor.
- Recuperación de fallos de herramienta peor que v1: 82,5 % frente a 90,0 % en selección de herramienta correcta tras un fallo.
- MBPP con más tokens de razonamiento que v1: 301,2 frente a 34,6, aunque a cambio gana 4 puntos de precisión.
- El modelo base sigue siendo superior en código y matemáticas puras: si el coste de tokens no es un problema, el base Qwen3.8-27B obtiene mejores puntuaciones.
- El parámetro `reasoning_effort` en xhigh degrada el rendimiento agéntico: se recomienda usar medium o low.
- Solo se declara soporte de inglés; no se garantizan capacidades multilingües a pesar de la base Qwen.
- No se especifica la longitud de contexto en la ficha; para producción conviene verificar la ventana real del modelo base.
- No se proporcionan cuantizaciones oficiales; el despliegue en hardware de consumo requiere conversión manual a GGUF u otros formatos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ProCreations/grug-27b-3.8
- Modelo anterior (grug-27b): https://huggingface.co/ProCreations/grug-27b
- Modelo v1.1 (referencia): https://huggingface.co/ProCreations/grug-27b-v1.1
- Ficha en LLM Explorer: https://llm-explorer.com/model/ProCreations%2Fgrug-27b,4I3COxIuitPNrvIAJrjQMi
- Reseña en aimodels.fyi: https://www.aimodels.fyi/models/huggingFace/grug-27b-procreations
- Artículo de Simon Willison sobre Qwen 3.8 27B: https://simonwillison.net/2026/Aug/16/qwen-38-27b/
