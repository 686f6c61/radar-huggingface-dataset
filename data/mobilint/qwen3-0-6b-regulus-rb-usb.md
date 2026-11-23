# mobilint/Qwen3-0.6B-regulus-rb-usb

## Resumen

Qwen3-0.6B-regulus-rb-usb es una compilación del modelo Qwen/Qwen3-0.6B realizada por Mobilint para su hardware NPU Regulus (placa USB). No se trata de un modelo nuevo entrenado desde cero, sino de una versión cuantizada y compilada del modelo base de Qwen, empaquetada en formato propietario MXQ (0,61 GB) para ejecutarse sobre la pila de aceleración de Mobilint mediante la librería `transformers-mblt` y el compilador `qbcompiler 1.4.1`.

El interés principal de esta build es la ampliación de la ventana de contexto hasta 16.384 tokens, cuatro veces los 4.096 tokens de la compilación anterior, manteniendo una fidelidad mayor respecto al modelo original en prompts de recuperación y en MMLU multilingüe. La cuantización es post-entrenamiento (PTQ) con calibración sobre datos públicos multilingües, con pesos de 8 bits y activaciones de 8 bits en las entradas de atención y cabeza de salida, y 16 bits en el resto.

Es relevante para desarrolladores que despliegan inferencia en hardware de borde o aceleradores dedicados de Mobilint, ya que ofrece una ruta de ejecución optimizada para NPU con un modelo pequeño (155,6 M parámetros reales en safetensors) y licencia Apache 2.0. Fuera de ese entorno de hardware, el modelo no es directamente utilizable con runtimes convencionales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (derivada de Qwen3-0.6B), compilada para NPU Regulus |
| Parametros totales | 155.582.464 (safetensors); el modelo base Qwen3-0.6B declara 0,6B |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 16.384 tokens (prompt + generado) |
| Tipos de cuantizacion | PTQ: pesos 8 bits; activaciones 8 bits en entradas de atención y cabeza de salida, 16 bits en el resto; variante W4V8 (0,33 GB) |
| Idiomas soportados | no disponible oficialmente; calibrado con datos en inglés, coreano, japonés y 14 idiomas de aya_dataset |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors + MXQ (`Qwen3-0.6B-regulus-rb-usb-W8.mxq`, 0,61 GB) |

## Arquitectura y entrenamiento

El modelo es una compilación del transformer decoder-only Qwen3-0.6B, no un entrenamiento nuevo. La build aplica cuantización post-entrenamiento calibrada sobre un conjunto público multilingüe que incluye SQuAD (inglés), KLUE MRC (coreano), JSQuAD (japonés), pasajes de FineWeb y FineWeb-2 como distractores y contextos largos de 2K–8K tokens, aya_dataset (chat humano en 14 idiomas), MMMLU/MMLU y GSM8K. Las respuestas de las muestras de question answering fueron generadas por el modelo original en bf16, lo que sirve como referencia de calibración.

La innovación técnica principal es la compilación para la NPU Regulus con `qbcompiler 1.4.1`, en modo de un solo núcleo, con pesos y activaciones de 8 bits en los puntos críticos y 16 bits en el resto. El contexto se amplía a 16.384 tokens y el timeout por defecto de qbruntime (10 s por llamada) es suficiente para prompts de hasta esa longitud, sin necesidad de ajustar `QBRUNTIME_NPU_TIMEOUT_MS`. La calidad con prompts largos se verificó en coreano, japonés e inglés. No se documentan detalles de RLHF/DPO propios de esta build; se heredan los del modelo base.

## Capacidades

- Generación de texto y conversación multi-turno mediante plantilla de chat (`apply_chat_template`), con opción `enable_thinking=False`.
- Razonamiento y respuesta a preguntas sobre pasajes recuperados (calibrado específicamente para retrieval-style prompts).
- Capacidades multilingües parciales: calibración en inglés, coreano, japonés y 14 idiomas de aya_dataset; no se declara una lista oficial de idiomas soportados.
- Aritmética básica y problemas de palabras (GSM8K presente en calibración).
- Conocimiento tipo MMLU multilingüe (MMMLU en calibración).
- Ejecución en NPU Regulus con contexto de hasta 16.384 tokens.
- Tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y multi-step reasoning: no disponible en la información proporcionada.
- Modo thinking: la plantilla de chat admite `enable_thinking`, pero no se detallan sus garantías en esta build.
- Visión y audio: no disponibles.

## Casos de uso

- Despliegue en borde con acelerador Mobilint: ejecutar el modelo en la placa USB Regulus para inferencia local de bajo consumo, usando el MXQ de 0,61 GB y la librería `transformers-mblt`, sin depender de GPU.
- Question answering sobre documentos recuperados: el modelo está calibrado con SQuAD, KLUE MRC y JSQuAD y con contextos largos de 2K–8K tokens, por lo que encaja en pipelines RAG que inyectan pasajes en el prompt.
- Asistentes conversacionales multilingües ligeros: con calibración en coreano, japonés, inglés y 14 idiomas de aya_dataset, puede gestionar chat de dominio acotado en esos idiomas.
- Clasificación y respuesta a preguntas de opción múltiple: útil para evaluaciones tipo MMLU/MMMLU en entornos con NPU y contexto largo.
- Prototipado de aplicaciones embebidas: validar flujos de generación de texto en hardware Regulus antes de escalar a modelos mayores de la familia Qwen3.
- Procesamiento de prompts largos en local: con 16.384 tokens de contexto y timeout por defecto suficiente, permite resumir o extraer información de documentos extensos sin configurar timeouts adicionales.
- Evaluación comparativa de cuantización: la variante W4V8 (0,33 GB) permite medir el compromiso entre tamaño y fidelidad respecto al modelo original en el mismo hardware.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks numéricos en la información disponible. La model card indica cualitativamente que esta build está "más cerca del modelo original que la anterior en todas las longitudes de prompt probadas", en prompts de recuperación y en MMLU multilingüe, y que la calidad con prompts largos se comprobó en coreano, japonés e inglés, pero no se aportan cifras.

## Requisitos de hardware

- Hardware objetivo: NPU Regulus de Mobilint, placa USB (`regulus-rb-usb`), modo de un solo núcleo.
- VRAM: no aplica en el sentido convencional; el modelo se ejecuta en la NPU. El artefacto MXQ W8 ocupa 0,61 GB y la variante W4V8, 0,33 GB.
- GPU recomendadas: no disponibles; el modelo está compilado para NPU Mobilint y no se documenta ejecución en A100, H100 o RTX 4090.
- GPU de consumo: no disponible; no se indica compatibilidad con GPUs consumer.
- Despliegue: `pip install transformers-mblt`, carga con `AutoModelForCausalLM.from_pretrained(..., trust_remote_code=True)` y llamada a `model.dispose()` al finalizar. No se documentan vLLM, llama.cpp, Ollama ni TGI para este artefacto.
- Latencia y throughput: no disponibles; el único dato es el timeout por defecto de qbruntime de 10 s por llamada, suficiente para prompts de hasta 16.384 tokens.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato / hardware | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3-0.6B-regulus-rb-usb (este) | 155,6 M en safetensors (base 0,6B) | 16.384 | MXQ + safetensors, NPU Mobilint Regulus | Apache 2.0 | Hugging Face, 451 descargas |
| Qwen/Qwen3-0.6B (base) | 0,6B | no disponible en esta ficha | safetensors, GPU/CPU convencional | Apache 2.0 | Hugging Face |
| Otras builds Mobilint de Qwen3-0.6B (versión previa) | 0,6B | 4.096 | MXQ, NPU Mobilint Regulus | Apache 2.0 | Repositorio del autor |

La comparación con alternativas de terceros de la misma categoría (modelos de ~0,5B para borde) no está disponible en la información proporcionada.

## Limitaciones y advertencias

- Dependencia de hardware propietario: el artefacto principal es un MXQ compilado para NPU Regulus; fuera de esa pila no es directamente ejecutable con runtimes estándar.
- Código remoto: requiere `trust_remote_code=True` y la librería `transformers-mblt`, lo que implica auditar el código antes de usarlo en producción.
- Contexto limitado a 16.384 tokens frente a modelos de mayor ventana; no se documenta comportamiento más allá de ese límite.
- Idiomas: no hay lista oficial de idiomas soportados; la calibración cubre inglés, coreano, japonés y 14 idiomas, pero el rendimiento fuera de esos idiomas no está garantizado.
- Riesgo de alucinación: inherente a un modelo de 0,6B; no se publican métricas de fidelidad ni de tasas de error.
- Sesgos: no se documentan evaluaciones de sesgo; los datos de calibración son públicos y multilingües, pero no se analiza su composición demográfica.
- Cuantización PTQ: la variante W4V8 presenta, según el autor, "una diferencia mayor" respecto al modelo original que la W8; conviene validar la calidad en la tarea concreta.
- Licencia Apache 2.0 permite uso comercial, pero se heredan las condiciones del modelo base Qwen3-0.6B; verificar el LICENSE enlazado.
- No se documentan capacidades de tool calling ni de agentes; no asumirlas en producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/mobilint/Qwen3-0.6B-regulus-rb-usb
- Modelo base: https://huggingface.co/Qwen/Qwen3-0.6B
- Licencia del modelo base: https://huggingface.co/Qwen/Qwen3-0.6B/blob/main/LICENSE
- Web de Mobilint: https://mobilint.com
- Dataset SQuAD: https://huggingface.co/datasets/rajpurkar/squad
- Dataset KLUE: https://huggingface.co/datasets/klue/klue
- Dataset JSQuAD: https://huggingface.co/datasets/sbintuitions/JSQuAD
- Dataset FineWeb: https://huggingface.co/datasets/HuggingFaceFW/fineweb
- Dataset FineWeb-2: https://huggingface.co/datasets/HuggingFaceFW/fineweb-2
- Dataset aya_dataset: https://huggingface.co/datasets/CohereLabs/aya_dataset
- Dataset MMMLU: https://huggingface.co/datasets/openai/MMMLU
- Dataset MMLU: https://huggingface.co/datasets/cais/mmlu
- Dataset GSM8K: https://huggingface.co/datasets/openai/gsm8k
