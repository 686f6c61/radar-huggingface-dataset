# F606F/Qwen3.5-9B-Slovak-RPG-GGUF

## Resumen

Qwen3.5-9B-Slovak-RPG-GGUF es un ajuste fino (fine-tune) del modelo Qwen3.5-9B de Alibaba, desarrollado por el usuario F606F y publicado en Hugging Face. El modelo está especializado en eslovaco de alta calidad estilística, razonamiento lógico y roleplay de temática RPG/fantasy oscura (alquimia, elixires, brujas, intrigas cortesanas, imperios sci-fi desérticos, academias mágicas, fantasía nórdica oscura, túneles postapocalípticos y corporaciones distópicas). Se distribuye exclusivamente en formato GGUF cuantizado Q6_K para su uso con llama.cpp y Ollama.

El modelo parte de la arquitectura Qwen3.5-9B (9.197.093.888 parámetros totales) y conserva la capacidad multimodal original (visión) mediante un proyector `mmproj` separado, ya que solo se entrenó la parte lingüística. El ajuste se realizó con QLoRA de Unsloth sobre 5.760 muestras limpias en eslovaco, combinando datasets de matemáticas, código, conversación, resumen, instrucciones fundamentadas, multiturno y QA, más 115 escenarios RPG escritos a mano con peso cuádruple.

Es relevante para desarrolladores e investigadores que necesiten un modelo local de ~9B con eslovaco nativo de calidad, razonamiento preservado y capacidad de roleplay atmosférico, todo ello bajo licencia Apache 2.0 y desplegable en hardware de consumo. La versión 9B mejora sobre la variante 4B del mismo autor en gramática, declinación, menor tasa de errores léxicos y mayor inteligencia en tareas lógicas y diálogos largos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (Qwen3.5), vision-language model con proyector `mmproj` separado |
| Parametros totales | 9.197.093.888 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | hasta 65.536 tokens en llama-server (configuración de ejemplo del autor); contexto nativo del base no disponible |
| Tipos de cuantizacion | Q6_K (modelo principal); F16 para el proyector `mmproj` |
| Idiomas soportados | eslovaco (sk); el base Qwen3.5 es multilingüe pero el fine-tune está orientado a eslovaco |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (`Qwen3.5-9B.Q6_K.gguf`, `Qwen3.5-9B.F16-mmproj.gguf`) |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura transformer de Qwen3.5-9B, un modelo vision-language que combina un codificador de lenguaje con un proyector multimodal (`mmproj`). El fine-tune solo afectó a la parte lingüística, por lo que la capacidad de procesar imágenes se conserva intacta a través del proyector F16 original. El entrenamiento se realizó con QLoRA de Unsloth con los siguientes hiperparámetros: r=16, lora_alpha=32, max_seq_length=1024, 720 pasos (1 época con batch efectivo de 8), learning_rate=1e-4 con scheduler cosine y optimizador adamw_8bit.

El dataset de entrenamiento consta de 5.760 muestras limpias en eslovaco, filtradas automáticamente para eliminar palabras extranjeras y artefactos sintéticos. La composición es: 1.300 muestras de matemáticas y código (`dfm13-multilingual-math-code-sk`), 1.100 de OpenHermes eslovaco, 1.200 de `mbenco/slovak-sft`, 600 de resumen/reescritura, 600 de instrucciones fundamentadas, 250 de multiturno, 250 de SKQuAD, y 115 escenarios RPG escritos a mano con peso cuádruple (460 efectivas). No se aplicó RLHF ni DPO; el modelo no está alineado con preferencias humanas. La plantilla de chat es ChatML (`<|im_start|>` / `<|im_end|>`).

## Capacidades

- Generación de texto en eslovaco con gramática estable, declinación correcta y baja tasa de errores léxicos.
- Razonamiento lógico y resolución de tareas de matemáticas y código (preservado mediante datasets específicos).
- Roleplay RPG/fantasy: alquimia y elixires, brujas, intrigas y traiciones cortesanas, imperios sci-fi desérticos, academia mágica, fantasía nórdica oscura, túneles postapocalípticos y páramos nucleares, inframundo espacial, corporaciones distópicas.
- Procesamiento de imágenes (visión) mediante el proyector `mmproj` opcional en modo multimodal.
- Conversación multiturno con contexto largo (hasta 64K tokens configurados en llama-server).
- Resumen y reescritura de texto.
- Instrucciones fundamentadas (grounded instruct) y QA sobre contexto (SKQuAD).
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y multi-step reasoning: no disponible explícitamente; el razonamiento lógico está preservado pero no se documenta modo agente.
- Modo thinking: no disponible en la información proporcionada.

## Casos de uso

- Roleplay de mesa y narrativa interactiva: el modelo gestiona escenarios multi-turno con contextos de hasta 64K tokens, lo que permite mantener largas campañas de RPG con coherencia atmosférica y estilística en eslovaco. Los 115 escenarios escritos a mano con peso cuádruple lo hacen especialmente adecuado para fantasía oscura e intriga.
- Asistente conversacional en eslovaco: gracias a los datasets de conversación, resumen, reescritura e instrucciones fundamentadas, puede emplearse como asistente general para usuarios eslovacos que necesiten respuestas naturales y gramaticalmente correctas, con temperatura recomendada de 0,45–0,60 para evitar invención de terminaciones extranjeras.
- Generación y revisión de código en eslovaco: el dataset `dfm13-multilingual-math-code-sk` (1.300 muestras) preserva la capacidad de resolver tareas de programación y matemáticas, útil para documentación técnica, explicación de errores y generación de fragmentos en entornos educativos o de prototipado.
- Atención al cliente y soporte en eslovaco: con contexto largo y capacidad multiturno, puede gestionar conversaciones de soporte con historial extenso, resumen de incidencias y respuestas fundamentadas en documentación proporcionada (grounded instruct).
- Análisis de imágenes con descripción en eslovaco: el proyector `mmproj` permite entrada multimodal, útil para descripción de capturas, extracción de información de documentos escaneados o asistencia visual en eslovaco.
- Generación de contenido creativo y worldbuilding: los escenarios de alquimia, intriga cortesana y fantasía oscura permiten generar tramas, descripciones de personajes, diálogos y ambientación para videojuegos, novelas o módulos de rol.
- Despliegue local en hardware de consumo: al distribuirse en GGUF Q6_K (~8,5 GB de repo), puede ejecutarse en GPUs consumer con 12–16 GB de VRAM mediante Ollama o llama.cpp, lo que facilita prototipado sin infraestructura cloud.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el archivo Q6_K ocupa aproximadamente 8,5 GB (tamaño del repo); se recomienda al menos 10–12 GB de VRAM para el modelo principal con contexto moderado. El proyector `mmproj` F16 añade VRAM adicional en modo multimodal.
- GPU recomendadas: RTX 4090 (24 GB), RTX 4080 (16 GB), RTX 4070 Ti Super (16 GB), A100 y H100 para despliegues de mayor concurrencia. Con 12 GB (RTX 3060 12 GB, RTX 4070) puede caber con contexto reducido.
- Cabe en GPU consumer: sí, en GPUs con 12 GB o más de VRAM usando Q6_K; para contextos de 64K se recomienda cuantizar la caché KV a q8_0 y activar flash attention (`-fa on`), como indica el autor.
- Opciones de despliegue: Ollama (`ollama run hf.co/F606F/Qwen3.5-9B-Slovak-RPG-GGUF:Q6_K`), llama.cpp (`llama-cli`, `llama-mtmd-cli`, `llama-server`), LM Studio, KoboldCpp y Jan (plantilla ChatML).
- Latencia y throughput estimados: no disponible en la información proporcionada.
- Parámetros de generación recomendados por el autor: temperature 0,45–0,60, top-k 40, top-p 0,85, min-p 0,08, repeat penalty 1,08–1,12.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| Qwen3.5-9B-Slovak-RPG (este) | 9,2B | hasta 64K configurable | sk (base multilingüe) | Apache 2.0 | GGUF Q6_K + mmproj F16 | Fine-tune eslovaco con RPG, visión preservada |
| Qwen3.5-4B-Slovak-RPG (mismo autor) | ~4B | no disponible | sk | Apache 2.0 | GGUF | Variante menor; gramática y declinación menos estables según el autor |
| Qwen3.5-9B (base, unsloth) | 9,2B | no disponible | multilingüe | Apache 2.0 | safetensors, GGUF | Modelo base sin especialización eslovaca ni RPG |
| Modelos eslovacos SFT (p. ej. basados en `mbenco/slovak-sft`) | variable | no disponible | sk | variable | variable | Datasets usados en el entrenamiento; no se dispone de comparativa de rendimiento publicada |

No se dispone de datos de benchmarks que permitan una comparación cuantitativa de rendimiento con alternativas.

## Limitaciones y advertencias

- El modelo no ha sido alineado con preferencias humanas (sin RLHF/DPO), por lo que puede generar salidas problemáticas: alucinaciones, contenido dañino o afirmaciones falsas, tal como advierte el autor.
- Riesgo de alucinación inherente a los modelos de 9B sin alineación; no debe usarse como fuente de verdad sin verificación.
- El fine-tune está orientado exclusivamente al eslovaco; el rendimiento en castellano u otros idiomas puede degradarse respecto al base Qwen3.5-9B.
- La longitud de entrenamiento fue de 1.024 tokens (`max_seq_length=1024`); aunque el contexto de inferencia puede ampliarse a 64K, la coherencia más allá de la ventana de entrenamiento no está garantizada.
- El modo multimodal requiere cargar el proyector `mmproj` por separado y usar `llama-mtmd-cli` o equivalente; no funciona en modo texto puro.
- Licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantías; el modelo se distribuye "tal cual".
- Repositorio con 0 descargas y 0 likes en el momento de la ficha; no hay evidencia de validación por la comunidad.
- El uso de temperatura superior a 0,60 puede provocar invención de terminaciones extranjeras según el autor.

## Enlaces

- Hugging Face: https://huggingface.co/F606F/Qwen3.5-9B-Slovak-RPG-GGUF
- Variante 4B del mismo autor: https://huggingface.co/F606F/Qwen3.5-4B-Slovak-RPG-GGUF
- Modelo base: https://huggingface.co/unsloth/Qwen3.5-9B
- Unsloth (repositorio): https://github.com/unslothai/unsloth
- Dataset `schneiderkamplab/dfm13-multilingual-math-code-sk`: https://huggingface.co/datasets/schneiderkamplab/dfm13-multilingual-math-code-sk
- Dataset `schneiderkamplab/dfm13-multilingual-openhermes-sk`: https://huggingface.co/datasets/schneiderkamplab/dfm13-multilingual-openhermes-sk
- Dataset `mbenco/slovak-sft`: https://huggingface.co/datasets/mbenco/slovak-sft
- Dataset `schneiderkamplab/dfm13-multilingual-summary-rewrite-sk`: https://huggingface.co/datasets/schneiderkamplab/dfm13-multilingual-summary-rewrite-sk
- Dataset `schneiderkamplab/dfm13-multilingual-grounded-instruct-sk`: https://huggingface.co/datasets/schneiderkamplab/dfm13-multilingual-grounded-instruct-sk
- Dataset `schneiderkamplab/dfm13-multilingual-multiturn-sk`: https://huggingface.co/datasets/schneiderkamplab/dfm13-multilingual-multiturn-sk
- Dataset `TUKE-DeutscheTelekom/skquad`: https://huggingface.co/datasets/TUKE-DeutscheTelekom/skquad
