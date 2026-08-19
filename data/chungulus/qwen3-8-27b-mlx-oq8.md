# Chungulus/Qwen3.8-27B-MLX-oQ8

## Resumen

El modelo `Chungulus/Qwen3.8-27B-MLX-oQ8` es una cuantización de precisión mixta del modelo base `Qwen/Qwen3.8-27B`, desarrollada por el usuario Chungulus. No se trata de un fine-tuning ni de una modificación de la arquitectura, sino de una conversión de pesos al formato oMLX oQ8, diseñada específicamente para ejecutarse en hardware Apple Silicon mediante el runtime MLX. El objetivo es reducir el tamaño del artefacto (30 GB en lugar de los ~54 GB del BF16) y acelerar la inferencia, manteniendo una fidelidad alta respecto al modelo original.

El modelo base es un sistema multimodal de visión y lenguaje (image-text-to-text) con arquitectura interna `Qwen3_5ForConditionalGeneration`. La cuantización emplea un algoritmo de precisión mixta alrededor de 8.6 bits por peso (bpw) con base MXFP8 y grupo de tamaño 32, e incluye soporte para MTP (Multi-Token Prediction), que acelera la generación de texto. Según las pruebas del autor, la velocidad de generación mejora aproximadamente 2.4 veces con MTP activado, pasando de ~8 tokens/s a ~19 tokens/s en un entorno de validación.

Aunque el nombre del repositorio sugiere 27 mil millones de parámetros, el archivo safetensors reporta 8.184.279.792 parámetros totales. Esta discrepancia puede deberse a un error en la metadata o a que el conteo se refiere a los tensores cuantizados; en cualquier caso, se indica el dato tal como aparece en la ficha de HuggingFace. El modelo está pensado para desarrolladores que necesitan ejecutar un modelo multimodal de gran tamaño en Macs con al menos 64 GB de memoria unificada, sin depender de GPUs NVIDIA.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3_5ForConditionalGeneration (modelo de lenguaje multimodal, visión y texto) |
| Parametros totales | 8.184.279.792 (según safetensors; el nombre sugiere 27B, dato no verificado) |
| Parametros activos | no disponible (no se especifica si es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | oQ8 (precisión mixta ~8.6 bpw, base MXFP8, group size 32) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (compatible con MLX) |

## Arquitectura y entrenamiento

El modelo base `Qwen/Qwen3.8-27B` utiliza la arquitectura `Qwen3_5ForConditionalGeneration`, que es un transformer multimodal capaz de procesar tanto texto como imágenes. No se dispone de detalles sobre el número de capas, dimensiones ocultas o si emplea atención lineal u otras innovaciones, ya que la model card no los proporciona. El modelo original fue entrenado por Alibaba (Qwen team) y publicado bajo licencia Apache 2.0, pero no se incluyen datos sobre el dataset de entrenamiento, número de tokens o técnicas de alineación (RLHF/DPO).

La cuantización realizada por Chungulus es una conversión "vanilla" de los pesos BF16 a un formato oQ8 de precisión mixta. El algoritmo, denominado oMLX oQ8, utiliza una base MXFP8 con group size 32 y protege ciertos tensores (como los de visión y MTP) para minimizar la pérdida de calidad. La calibración se hizo con prompts representativos locales, sin usar respuestas de benchmarks. El proceso de conversión está documentado en el repositorio y requiere el runtime oMLX en una revisión específica (`71b9d52039c3058041c5029fdb3d3e833d13d624`).

Una característica destacada es la inclusión de un cabezal MTP (Multi-Token Prediction) integrado, que permite predecir varios tokens por ciclo y acelera la inferencia. Según las pruebas del autor, la tasa de aceptación de borradores fue del 100% en el caso de validación, con un speedup de 2.42x en tokens por segundo.

## Capacidades

- Generación de texto y comprensión de imágenes: al ser un modelo multimodal, puede procesar entradas de imagen y texto, y generar respuestas textuales (pipeline `image-text-to-text`).
- Tool calling / function calling: el autor reporta que pasó todas las pruebas nativas de tool calling con formato XML, lo que permite integrar el modelo en flujos de agentes que invocan herramientas externas.
- MTP (Multi-Token Prediction): acelera la generación de texto al predecir múltiples tokens por ciclo, mejorando el throughput sin cambiar la salida (equivalente a temperatura cero).
- Compatibilidad con MLX: diseñado para ejecutarse en Apple Silicon mediante el runtime MLX, con soporte para cargadores estándar de MLX.
- Validación de componentes: el autor verificó que el chat template, tokenizer, processor y generation config coinciden con el modelo base bloqueado, y que la salida es semánticamente similar al BF16 original (similitud coseno media de 0.897 con un modelo de embeddings multilingüe).

## Casos de uso

- Asistentes multimodales en macOS: un desarrollador puede desplegar un chatbot que reciba imágenes (capturas de pantalla, fotos) y texto, y responda con instrucciones o descripciones, aprovechando la aceleración MTP para una experiencia interactiva fluida en un Mac con 64 GB de RAM.
- Automatización de documentos con visión: procesar facturas, formularios o diagramas escaneados, extrayendo información estructurada mediante prompts de texto, sin necesidad de un pipeline OCR separado.
- Agentes con tool calling: integrar el modelo en un sistema de agente que consulte APIs, bases de datos o ejecute comandos, gracias a su soporte nativo de tool calling en formato XML.
- Generación de código asistida por imágenes: dado un boceto o diagrama de interfaz, el modelo puede generar código HTML/CSS o explicaciones técnicas, combinando visión y razonamiento textual.
- Prototipado rápido en entornos Apple: al ser una cuantización ligera (30 GB), permite probar modelos multimodales de gran tamaño en hardware de consumo sin necesidad de GPUs dedicadas, ideal para investigación y desarrollo local.
- Evaluación de calidad de cuantización: investigadores pueden usar este repositorio como referencia para comparar el impacto de la cuantización oQ8 frente al modelo BF16 original, ya que se incluyen métricas de similitud y divergencia KL.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks públicos (MMLU, HumanEval, GSM8K, etc.) en la información disponible. El autor solo proporciona métricas de validación interna:

- Comparación con el modelo BF16 original: similitud semántica media de 0.897 (usando `paraphrase-multilingual-MiniLM-L12-v2`), con 4 coincidencias exactas en los casos de prueba.
- Comparación de logits fijos: divergencia KL media de 0.00079, acuerdo top-1 del 100% en 106 posiciones, y delta de perplejidad de 0.044.
- Rendimiento MTP: en una prueba con un prompt de 21 tokens, la generación pasó de 7.97 tokens/s (sin MTP) a 19.29 tokens/s (con MTP), un speedup de 2.42x. La tasa de aceptación de borradores fue del 100% (51 tokens aceptados de 51 generados).
- El prompt más largo validado fue de 73 tokens, por lo que no se ha probado el rendimiento con contextos extensos.

Estos resultados son específicos del artefacto, del prompt y del hardware utilizado, y no deben extrapolarse como métricas generales de calidad.

## Requisitos de hardware

- Memoria unificada: se requiere al menos 64 GB de RAM unificada en Apple Silicon, dado que el artefacto pesa 30 GB y el pico de memoria medido durante la validación fue de ~27.2 GB.
- Chip recomendado: Apple Silicon (M1 Pro/Max/Ultra, M2/M3/M4 con 64 GB o más). No se menciona compatibilidad con GPUs NVIDIA o AMD.
- Runtime: se necesita instalar `omlx` desde el repositorio GitHub `jundot/omlx` en la revisión `71b9d52039c3058041c5029fdb3d3e833d13d624`, además de los cargadores estándar de MLX.
- Despliegue: el modelo se puede cargar con `hf download` y ejecutar mediante scripts Python que usen oMLX. No se mencionan integraciones con vLLM, Ollama o TGI.
- Latencia y throughput: en la prueba de validación, la generación alcanzó ~19 tokens/s con MTP en un hardware no especificado. El tiempo total para 71 tokens de salida fue de 3.69 segundos.

## Comparativa con modelos similares

No se dispone de información suficiente para comparar este modelo con alternativas de la misma categoría (por ejemplo, otras cuantizaciones de Qwen3.8-27B o modelos multimodales similares en MLX). El autor no proporciona datos de benchmarks públicos ni referencias a otros repositorios comparables. Por tanto, la comparativa no está disponible.

## Limitaciones y advertencias

- La cuantización introduce una ligera degradación respecto al BF16 original, aunque las pruebas internas muestran una alta similitud semántica (0.897) y un acuerdo top-1 del 100% en logits fijos. Sin embargo, estas métricas se basan en un conjunto de prompts muy reducido (máximo 73 tokens) y no cubren escenarios complejos.
- No se han validado contextos largos: el prompt más extenso probado fue de 73 tokens, por lo que el rendimiento con ventanas de contexto mayores (p. ej., miles de tokens) es desconocido.
- No hay información sobre sesgos o alucinaciones específicas del modelo. Al ser una cuantización, hereda las limitaciones del modelo base Qwen3.8-27B, que no están documentadas en esta ficha.
- El modelo está diseñado exclusivamente para Apple Silicon con MLX; no es compatible con entornos CUDA o ROCm sin conversión adicional.
- La discrepancia entre el nombre del repositorio (27B) y el número de parámetros reportado (8.18B) puede confundir a los usuarios. Se recomienda verificar la metadata antes de asumir el tamaño real del modelo.
- La licencia Apache 2.0 permite uso comercial, pero se debe revisar la licencia del modelo base Qwen3.8-27B para asegurar el cumplimiento, aunque Qwen suele publicar bajo Apache 2.0.
- El autor advierte que las mediciones de aceleración MTP son específicas del artefacto, prompt, contexto y hardware; no se garantiza el mismo speedup en otros entornos.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/Chungulus/Qwen3.8-27B-MLX-oQ8
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Runtime oMLX (GitHub): https://github.com/jundot/omlx (revisión `71b9d52039c3058041c5029fdb3d3e833d13d624`)
- Evaluador de similitud semántica: https://huggingface.co/sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2
