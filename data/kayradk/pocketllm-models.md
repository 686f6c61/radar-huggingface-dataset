# kayradk/pocketllm-models

## Resumen

PocketLLM Model Collection es un repositorio agregado que reúne una colección curada de modelos de lenguaje de pequeño tamaño, cuantizados y empaquetados para inferencia local en dispositivos Android. No se trata de un modelo entrenado desde cero, sino de un catálogo de pesos derivados de modelos públicos (Qwen 2.5, Gemma 1.1 y 3, Llama 3.2, Phi-3.5 Mini y SmolLM2) preparados para su uso dentro de la aplicación PocketLLM, desarrollada por Amaresh Hebbar. El problema que aborda es la ausencia de una vía sencilla para desplegar LLM completamente offline en móviles de gama baja y media.

El repositorio combina dos formatos de despliegue: MediaPipe LLM Inference (ficheros `.bin` y `.task`, empleados para la familia Gemma) y GGUF ejecutado mediante llama.cpp a través de `llama.rn`. La cuantización predominante es Q4_K_M, que equilibra tamaño y calidad en el rango de 0,4 GB a 2,8 GB por fichero. El catálogo se organiza en tres tramos según consumo de RAM: menos de 1 GB, entre 1 y 2 GB, y más de 2 GB.

El dato de parámetros que reporta el repositorio (999.885.952, aproximadamente 1 000 millones) corresponde al tensor safetensors del modelo principal indexado, no al conjunto completo del catálogo. La relevancia actual del proyecto reside en su enfoque en privacidad (sin conexión durante la inferencia) y en la hoja de ruta anunciada de ajuste fino con QLoRA sobre Llama 3.2 1B y Gemma 3 1B para conversación móvil y code-switching hindi-inglés.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (modelos base heterogéneos: Llama, Gemma, Qwen, Phi, SmolLM) |
| Parametros totales | 999.885.952 en el tensor safetensors indexado; el catálogo abarca desde 0,5B hasta 4B según el modelo base |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 2048 tokens (objetivo declarado para el ajuste fino y la app) |
| Tipos de cuantizacion | Q4_K_M (GGUF); INT4 para MediaPipe (`.bin`) |
| Idiomas soportados | en, hi, multilingual |
| Licencia | Apache 2.0 para el repositorio; cada modelo base conserva su licencia original (Gemma Terms of Use, Llama 3.2 Community License, MIT para Phi, Apache 2.0 para Qwen y SmolLM2) |
| Formato de pesos | GGUF y MediaPipe (`.bin`, `.task`) |

## Arquitectura y entrenamiento

El repositorio no entrena un modelo propio en su estado actual: agrega pesos de terceros ya publicados y los reempaqueta en cuantizaciones aptas para móvil. Los modelos base son transformers decoder-only estándar, sin innovaciones arquitectónicas adicionales por parte del autor del catálogo. La cuantización Q4_K_M se aplica sobre los GGUF y la INT4 sobre los binarios de MediaPipe, con el objetivo de reducir la huella de memoria a costa de una pérdida de precisión moderada.

La model card anuncia una hoja de ruta de ajuste fino con QLoRA en 4 bits sobre Llama 3.2 1B y Gemma 3 1B, con un dataset conversacional curado para restricciones de borde, entrenamiento en una única A100 vía RunPod y el framework Unsloth. Los objetivos declarados son mejorar la adherencia a la persona, acortar las respuestas (los modelos base tienden a ser verbosos en móvil), aprovechar memorias inyectadas, mejorar el seguimiento de instrucciones con ventanas de 2048 tokens y soportar code-switching hindi-inglés. Estos modelos ajustados (`pocketllm-llama-1b-v1.gguf` y `pocketllm-gemma-1b-v1.gguf`) se anuncian como "próximamente" y no están disponibles en la información proporcionada.

## Capacidades

- Generación de texto conversacional multi-turno en inglés e hindi, con soporte multilingüe declarado.
- Razonamiento básico y respuesta a instrucciones, limitado por el tamaño de los modelos base (0,5B a 4B).
- Generación de código en los modelos de mayor tamaño, especialmente Phi-3.5 Mini, que la model card recomienda para programación.
- Ejecución completamente offline: no requiere red durante la inferencia.
- Integración con la app PocketLLM, que según el autor incluye enrutamiento inteligente, memoria de persona y herramientas MCP.
- Aceleración por GPU en Android mediante Vulkan/OpenCL en el caso de MediaPipe.
- No se documenta soporte explícito de tool calling, function calling ni agentes multi-paso más allá de la mención genérica a "MCP tools" en la descripción de la app.

## Casos de uso

- Asistente conversacional privado en Android: el modelo se ejecuta íntegramente en el dispositivo, de modo que ninguna conversación sale del teléfono; encaja en escenarios de salud, finanzas personales o diario donde la confidencialidad es crítica.
- Despliegue en dispositivos de gama baja: Qwen 2.5 0.5B en Q4_K_M ocupa 0,4 GB y requiere unos 2 GB de RAM, lo que permite inferencia en teléfonos de entrada sin conexión.
- Autocompletado y redacción en apps de notas o mensajería: Llama 3.2 1B o Gemma 3 1B ofrecen latencia baja y un tamaño de 0,7-0,8 GB adecuado para sugerencias en tiempo real dentro de una app Android.
- Soporte de code-switching hindi-inglés: pensado para el mercado indio, donde los usuarios alternan idiomas en una misma frase; los modelos multilingües del catálogo y la hoja de ruta de ajuste fino apuntan a este caso.
- Asistencia de programación ligera en movilidad: Phi-3.5 Mini (2,4 GB, 5 GB de RAM) es la opción recomendada por el autor para tareas de código cuando el dispositivo es de gama alta.
- Prototipado de agentes offline: la app integra enrutamiento y herramientas MCP, lo que permite construir flujos de agente que funcionan sin red en entornos con conectividad intermitente o restringida.
- Fines educativos y de investigación: el catálogo sirve para comparar en un mismo dispositivo el comportamiento de distintas familias (Llama, Gemma, Qwen, Phi, SmolLM) bajo cuantización Q4_K_M.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM/RAM estimada por modelo según la model card:
  - Qwen 2.5 0.5B: 0,4 GB de fichero, 2 GB de RAM.
  - Gemma 3 1B: 0,7 GB de fichero, 2 GB de RAM.
  - Llama 3.2 1B: 0,8 GB de fichero, 3 GB de RAM.
  - SmolLM2 1.7B: 1,0 GB de fichero, 3 GB de RAM.
  - Gemma 1.1 2B (CPU/GPU, MediaPipe): 1,35 GB de fichero, 4 GB de RAM.
  - Llama 3.2 3B: 2,0 GB de fichero, 4 GB de RAM.
  - Phi-3.5 Mini: 2,4 GB de fichero, 5 GB de RAM.
  - Gemma 3 4B: 2,8 GB de fichero, 6 GB de RAM.
- GPU recomendadas: no aplica en servidor; el destino es la GPU integrada del móvil (Vulkan/OpenCL vía MediaPipe). Para el ajuste fino anunciado se emplea una única A100 en RunPod.
- Compatibilidad con GPU de consumo: el catálogo está pensado para Android; en escritorio podría ejecutarse con llama.cpp en GPUs de consumo, pero no se documentan requisitos específicos.
- Opciones de despliegue: app PocketLLM (Android), MediaPipe LLM Inference SDK para `.bin`/`.task`, llama.cpp vía `llama.rn` para GGUF. No se mencionan vLLM, TGI ni Ollama.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Enfoque |
|---|---|---|---|---|---|
| PocketLLM Model Collection | 0,5B-4B (catálogo) | 2048 tokens | GGUF, MediaPipe | Apache 2.0 (repo); mixta por modelo base | Colección móvil offline |
| Qwen 2.5 0.5B Instruct | 0,5B | no disponible en esta ficha | safetensors, GGUF | Apache 2.0 | LLM pequeño multilingüe |
| Llama 3.2 1B Instruct | 1B | no disponible en esta ficha | safetensors, GGUF | Llama 3.2 Community License | LLM pequeño de Meta |
| Gemma 3 1B IT | 1B | no disponible en esta ficha | safetensors, GGUF, MediaPipe | Gemma Terms of Use | LLM pequeño de Google |
| Phi-3.5 Mini Instruct | 3,8B | no disponible en esta ficha | safetensors, GGUF | MIT | Razonamiento y código |

La comparativa se limita a los modelos base que el propio catálogo reempaqueta; no se dispone de datos de rendimiento comparado en la información proporcionada.

## Limitaciones y advertencias

- Los modelos base de 0,5B a 4B tienen capacidad de razonamiento limitada y mayor propensión a alucinaciones que modelos de mayor tamaño; no son adecuados para tareas que exijan precisión factual alta sin verificación.
- Ventana de contexto de 2048 tokens, insuficiente para documentos largos o conversaciones extensas sin truncado.
- Licencias heterogéneas: el repositorio declara Apache 2.0, pero los pesos de Gemma y Llama conservan sus términos originales (Gemma Terms of Use y Llama 3.2 Community License), con restricciones de uso comercial que deben revisarse antes de producción.
- El dato de parámetros del repositorio (≈1 000 millones) no representa el catálogo completo; conviene verificar el modelo concreto antes de dimensionar recursos.
- El soporte hindi-inglés y el ajuste fino para móvil están anunciados pero no disponibles; el comportamiento actual corresponde a los modelos base sin ajustar.
- No hay benchmarks publicados ni métricas de latencia/throughput, lo que dificulta estimar el rendimiento real en un dispositivo concreto.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, lo que indica ausencia de validación por parte de la comunidad.
- La integración depende de la app PocketLLM y de sus dependencias (`llama.rn`, `react-native-llm-mediapipe`); no se documenta una vía de despliegue independiente.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/kayradk/pocketllm-models
- Repositorio GitHub de PocketLLM: https://github.com/amareshhebbar/PocketLLM
- Términos de uso de Gemma: https://ai.google.dev/gemma/terms
- Licencia de Llama 3.2: https://llama.meta.com/llama3_2/license/
- Licencia de Phi-3.5 Mini: https://huggingface.co/microsoft/Phi-3.5-mini-instruct/blob/main/LICENSE
- Licencia de Qwen 2.5 0.5B Instruct: https://huggingface.co/Qwen/Qwen2.5-0.5B-Instruct/blob/main/LICENSE
- Licencia de SmolLM2 1.7B Instruct: https://huggingface.co/HuggingFaceTB/SmolLM2-1.7B-Instruct/blob/main/LICENSE
