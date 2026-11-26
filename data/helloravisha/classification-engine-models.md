# helloravisha/classification-engine-models

## Resumen

`helloravisha/classification-engine-models` no es un modelo nuevo, sino un repositorio espejo de compilación que empaqueta dos clasificadores ONNX utilizados por un servicio de motor de clasificación que filtra las preguntas del usuario antes de que lleguen a un modelo de lenguaje. El primero es un clasificador de tema (dentro o fuera de alcance) derivado de `MoritzLaurer/bge-m3-zeroshot-v2.0`, comprimido a 8 bits mediante cuantización dinámica con ONNX Runtime (de 2,3 GB a 0,57 GB). El segundo es una copia sin modificar del clasificador de inyección de prompts `Horizon-Labs/prompt-injection-guard-small` en su variante cuantizada (0,27 GB).

El propósito del repositorio es puramente operativo: las compilaciones de imágenes Docker descargan estos ficheros en lugar de los originales, de modo que el costoso paso de compresión (el modelo de tema requiere unos 10 GB de memoria para comprimirse) se ejecuta una sola vez. Cada fichero está fijado por su SHA-256 en el código fuente del motor, y la compilación rechaza cualquier fichero que no coincida con el hash esperado.

Ambos modelos se ejecutan sobre ONNX Runtime en CPU y resuelven dos problemas concretos de seguridad y enrutado en aplicaciones con LLM: detectar intentos de inyección de prompts y determinar si una consulta entra dentro del dominio temático permitido. El repositorio tiene 0 descargas y 0 likes, y su licencia es "other" con nombre "per-model", ya que cada fichero hereda la licencia de su modelo original (MIT para el de tema, Apache 2.0 para el de inyección).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer codificador (derivado de BGE-M3 para el clasificador de tema; no disponible en detalle para el de inyección) |
| Parametros totales | No disponible |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | INT8 dinámica (modelo de tema); cuantización preexistente del original (modelo de inyección) |
| Idiomas soportados | No disponible |
| Licencia | per-model: MIT (tema), Apache 2.0 (inyección) |
| Formato de pesos | ONNX (`model.onnx`) con `tokenizer.json` y `config.json` |

## Arquitectura y entrenamiento

El clasificador de tema parte de `MoritzLaurer/bge-m3-zeroshot-v2.0`, un modelo de clasificación zero-shot basado en la familia BGE-M3, adaptado para evaluar hipótesis textuales del tipo "This message is about stocks, trading, investing, markets, the economy or personal finance." frente a la consulta del usuario. En este repositorio se distribuye una versión comprimida mediante cuantización dinámica de pesos a INT8 con `onnxruntime.quantization.quantize_dynamic` (weight_type=QInt8), usando onnx 1.23.2 y onnxruntime 1.32.0. La compresión reduce el tamaño de 2,3 GB a 0,57 GB y mantiene puntuaciones próximas al original (por ejemplo, 0.927 en el modelo completo frente a 0.908 en el comprimido para una consulta financiera).

El clasificador de inyección es una copia sin modificar de `Horizon-Labs/prompt-injection-guard-small` en su variante `onnx/model_quantized.onnx`, orientado a la detección de prompt injection. No se proporcionan en la información disponible detalles sobre el dataset de entrenamiento, el número de tokens, la composición de los datos ni si hubo ajuste por RLHF o DPO en ninguno de los dos modelos. Tampoco se documentan innovaciones arquitectónicas adicionales más allá del uso de ONNX Runtime para inferencia en CPU y la cuantización dinámica aplicada al modelo de tema.

## Capacidades

- Clasificación de texto zero-shot para determinar si una consulta pertenece a un tema definido mediante una hipótesis textual.
- Clasificación de inyección de prompts para detectar intentos de manipular el comportamiento de un LLM.
- Filtrado previo de consultas antes de que lleguen al modelo de lenguaje (guardarraíl de entrada).
- Ejecución en CPU mediante ONNX Runtime, sin necesidad de GPU.
- Verificación de integridad de ficheros mediante SHA-256 en el proceso de compilación.
- No se documentan capacidades de generación de texto, razonamiento, código, matemáticas, visión, tool calling ni agentes, ya que son modelos exclusivamente de clasificación.
- Capacidades multilingües: no disponibles en la información proporcionada.

## Casos de uso

- Filtrado de prompt injection en producción: el clasificador de inyección se sitúa delante del LLM para rechazar o marcar consultas maliciosas antes de que consuman tokens del modelo principal, reduciendo superficie de ataque y coste.
- Enrutado temático de consultas: el clasificador de tema decide si una pregunta entra dentro del dominio permitido (por ejemplo, finanzas) y deriva las consultas fuera de alcance a un mensaje de rechazo o a otro flujo.
- Guardarraíl en asistentes conversacionales: integrado en el backend, comprueba cada turno del usuario antes de la llamada al modelo generativo, con latencia baja al ejecutarse en CPU con ONNX Runtime.
- Cumplimiento y moderación de contenido: uso del clasificador zero-shot para etiquetar consultas según hipótesis configurables (temas regulados, contenido sensible) sin reentrenar el modelo.
- Despliegue en entornos con recursos limitados: al ser modelos ONNX de 0,27 GB y 0,57 GB, pueden ejecutarse en contenedores sin GPU, lo que facilita su inclusión en pipelines de CI/CD y en servicios de borde.
- Reproducibilidad de builds: el repositorio sirve como fuente fijada por hash para compilaciones Docker deterministas, evitando dependencias de repositorios externos y garantizando que cada build usa exactamente la misma versión del modelo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card únicamente menciona una comprobación cualitativa sobre un benchmark etiquetado y un ejemplo concreto de puntuación (0.927 en el modelo completo frente a 0.908 en el comprimido para una consulta financiera), sin tabla comparativa formal.

## Requisitos de hardware

- VRAM: no aplica; ambos modelos están pensados para inferencia en CPU mediante ONNX Runtime.
- Memoria RAM: el modelo de tema comprimido ocupa 0,57 GB en disco; el de inyección, 0,27 GB. El proceso de compresión del modelo de tema requiere aproximadamente 10 GB de memoria.
- GPU recomendadas: no disponibles; el diseño del servicio es CPU-first.
- Compatibilidad con GPU de consumo: no relevante para el despliegue previsto, aunque ONNX Runtime puede ejecutarse sobre GPU si se configura.
- Opciones de despliegue: ONNX Runtime (CPU), integrable en contenedores Docker; no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Tipo | Tamano | Licencia | Contexto | Disponibilidad |
|---|---|---|---|---|---|
| `helloravisha/classification-engine-models` (tema) | Clasificador zero-shot ONNX INT8 | 0,57 GB | MIT (original) | No disponible | Hugging Face |
| `MoritzLaurer/bge-m3-zeroshot-v2.0` | Clasificador zero-shot ONNX | 2,3 GB | MIT | No disponible | Hugging Face |
| `helloravisha/classification-engine-models` (inyección) | Clasificador de prompt injection ONNX cuantizado | 0,27 GB | Apache 2.0 (original) | No disponible | Hugging Face |
| `Horizon-Labs/prompt-injection-guard-small` | Clasificador de prompt injection | No disponible | Apache 2.0 | No disponible | Hugging Face |

## Limitaciones y advertencias

- No son modelos nuevos: el repositorio es un espejo de compilación y todo el mérito corresponde a los autores originales.
- Las puntuaciones del modelo de tema comprimido pueden diferir ligeramente del original y variar entre CPUs debido a la aritmética de 8 bits.
- La licencia es "per-model": el uso comercial debe verificarse fichero a fichero (MIT para el de tema, Apache 2.0 para el de inyección).
- No se documentan sesgos conocidos, tasas de alucinación ni limitaciones idiomáticas específicas.
- Al ser clasificadores, no generan texto ni razonan; su utilidad está acotada al filtrado y etiquetado.
- El modelo de inyección se distribuye tal cual desde el original, sin recompresión ni validación adicional por parte del autor del espejo.
- La fecha de creación indicada (2026-11-26) debe tratarse con cautela, ya que no se ha verificado de forma independiente.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/helloravisha/classification-engine-models
- Modelo original de tema: https://huggingface.co/MoritzLaurer/bge-m3-zeroshot-v2.0/tree/9abf1c8aaeb82a2447809c20753ed0b106b76652
- Modelo original de inyección: https://huggingface.co/Horizon-Labs/prompt-injection-guard-small/tree/2efc2ed5abecd21eb45c2506d231a65d6e392b85
- Licencia del repositorio: https://huggingface.co/helloravisha/classification-engine-models/blob/main/LICENSE.md
