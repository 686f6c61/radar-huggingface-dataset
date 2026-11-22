# K-Ai-Official/Kanata-S1-3B

## Resumen
Kanata-S1-3B es un modelo de lenguaje de 3.400 millones de parámetros desarrollado por K-Ai (Kortex AI) mediante ajuste fino supervisado (SFT) con QLoRA/LoRA de 4 bits sobre el modelo base ibm-granite/granite-4.1-3b-base. Está orientado a tareas de programación (Python, JavaScript y TypeScript), IA agéntica, tool calling y planificación paso a paso, con soporte conversacional en indonesio, japonés e inglés.

El modelo se distribuye bajo licencia Apache 2.0 con pesos en formato safetensors y está pensado como una primera aproximación del autor a un modelo agéntico, tal como indica su propia model card. El entrenamiento fue notablemente ligero: 2.476 muestras, 184 pasos máximos y aproximadamente 45,9 minutos sobre una NVIDIA T4, lo que sitúa el modelo en la categoría de ajustes experimentales más que en la de modelos de producción consolidados.

Su relevancia actual radica en el interés por modelos pequeños (3B) capaces de ejecutar tool calling y razonamiento multi-paso en hardware modesto, combinando idiomas asiáticos (indonesio y japonés) con inglés en un único checkpoint. No obstante, los resultados internos publicados por el autor muestran un rendimiento todavía incipiente en tool calling, lo que debe considerarse al evaluar su adopción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (derivada de IBM Granite 4.1) |
| Parámetros totales | 3.402.836.480 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | QLoRA 4-bit NF4 durante entrenamiento; cuantizaciones de inferencia no especificadas |
| Idiomas soportados | indonesio (id), japonés (ja), inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |
| Modelo base | ibm-granite/granite-4.1-3b-base |
| Tamaño del repositorio | 6,8 GB |
| Librería | transformers |
| Pipeline | text-generation |

## Arquitectura y entrenamiento
El modelo hereda la arquitectura del transformer decoder-only de IBM Granite 4.1-3B y se ajusta mediante QLoRA de 4 bits en formato NF4, con rango LoRA 32, longitud de secuencia 1280, batch efectivo de 16 y modo de entrenamiento "FAST". El entrenamiento se realizó en 184 pasos máximos (1,19 épocas planificadas) sobre 2.476 muestras, con un tiempo estimado de 45,9 minutos en una NVIDIA T4. La pérdida se calcula únicamente sobre los turnos del asistente.

El conjunto de datos combina generación sintética propia del autor (775 muestras agénticas con 8 escenarios, incluyendo corrección de bugs con tests, ejecución de scripts, exploración de repositorios, investigación web, refactorización con verificación y gestión honesta de fallos, con resultados de herramientas calculados mediante ejecución real de Python) con datos de código verificados por tests unitarios (120 muestras en id/ja/en), código en inglés procedente de Magicoder-OSS-Instruct-75K y CodeFeedback (450 muestras), código japonés de llm-jp Synthetic-JP-EN-Coding (300 muestras), datos generales en indonesio de alpaca-gpt4-indonesia-cleaned (700 muestras), datos generales en japonés de llm-jp magpie-sft-v1.0 (350 muestras) y 8 muestras de identidad. El bucket agent_hermes (NousResearch/hermes-function-calling-v1) figura con 0 muestras cargadas. El formato de chat es Granite (`<|start_of_role|>...<|end_of_role|>`, fin de turno `<|end_of_text|>`) con tool calls estilo Hermes: `<tool_call>{"name":..., "arguments":...}</tool_call>`.

## Capacidades
- Generación de texto en indonesio, japonés e inglés.
- Generación y depuración de código en Python, JavaScript y TypeScript.
- Tool calling / function calling con formato `<tool_call>` estilo Hermes.
- Razonamiento agéntico multi-paso: planificación, exploración de repositorios, ejecución de scripts y refactorización con verificación.
- Gestión de fallos: escenarios entrenados para responder sin herramienta, reportar cuando una herramienta no está disponible y comunicar honestamente fallos repetidos.
- Conversaciones multi-turno con formato de chat Granite.
- No se documentan capacidades de visión, audio ni modo de pensamiento explícito.

## Casos de uso
- Asistente de código en entornos de desarrollo: el modelo puede generar funciones y sesiones de depuración en Python, JavaScript y TypeScript, integrándose en editores o pipelines de revisión para proponer parches y tests.
- Automatización de tool calling en agentes: gracias al formato `<tool_call>{"name":..., "arguments":...}</tool_call>`, puede conectarse a APIs externas y orquestadores de agentes que esperen el esquema Hermes.
- Exploración y refactorización de repositorios: los escenarios sintéticos de entrenamiento incluyen explorar repositorios y refactorizar con verificación, lo que lo hace adecuado para tareas de mantenimiento guiadas por instrucciones.
- Atención al cliente multilingüe en el sudeste asiático y Japón: cubre indonesio, japonés e inglés, permitiendo conversaciones multi-turno con usuarios de esos mercados.
- Ejecución de scripts y verificación de resultados: entrenado con escenarios donde los resultados de herramientas se calculan mediante ejecución real de Python, puede usarse en pipelines que requieran interpretar salidas de ejecución.
- Despliegue en hardware modesto: con 3,4B parámetros y pesos safetensors de 6,8 GB, es viable en GPUs de consumo para prototipos y pruebas internas de agentes.
- Investigación sobre ajuste fino eficiente: sirve como referencia de cómo un QLoRA de ~46 minutos en T4 sobre Granite 4.1-3B-base puede orientar un modelo hacia código y agentes.

## Benchmarks y rendimiento
Los únicos datos publicados son una evaluación interna de tipo smoke test con muestras pequeñas, producida por el cuaderno de entrenamiento del autor, no comparable con HumanEval, BFCL o MMLU.

| Prueba | Idioma | n | Formato `<tool_call>` válido | Nombre de herramienta correcto | Argumentos requeridos completos |
|---|---|---:|---:|---:|---:|
| Tool calling | id | 4 | 25% | 25% | 25% |
| Tool calling | ja | 4 | 0% | 0% | 0% |
| Tool calling | en | 4 | 25% | 25% | 25% |

| Prueba | Resultado |
|---|---|
| Mini coding (tareas de función Python en id/ja/en, ejecutadas con `assert`) | 5 de 6 superadas |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, BFCL) en la información disponible.

## Requisitos de hardware
- VRAM estimada para inferencia: no disponible de forma oficial; con 3,4B parámetros, en fp16 se requieren aproximadamente 6,8 GB solo para pesos, y en cuantización de 4 bits alrededor de 2 GB, más overhead de contexto y KV cache.
- GPU recomendadas: no especificadas por el autor; el entrenamiento se realizó en NVIDIA T4, lo que sugiere viabilidad en GPUs de gama media.
- Compatibilidad con GPU de consumo: previsiblemente sí en tarjetas con 8 GB o más en fp16 (por ejemplo RTX 3060/4060 Ti de 8-16 GB) y en GPUs con 4-6 GB si se aplica cuantización de 4 bits, aunque el autor no publica requisitos oficiales.
- Opciones de despliegue: transformers (uso documentado en la model card); vLLM, llama.cpp, Ollama y TGI no están confirmados en la información disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Kanata-S1-3B | 3,4B | no disponible | Código + agentes + tool calling (id/ja/en) | Apache 2.0 | Hugging Face |
| ibm-granite/granite-4.1-3b-base | ~3B (modelo base) | no disponible | Modelo base generalista de IBM | no disponible en la información | Hugging Face |
| Modelos de 3B ajustados para código y agentes | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de rendimiento comparables entre estos modelos en la información proporcionada; los benchmarks internos de Kanata-S1-3B no son equiparables a evaluaciones estándar.

## Limitaciones y advertencias
- Rendimiento incipiente en tool calling: en la evaluación interna, el formato válido solo alcanzó el 25% en indonesio e inglés y el 0% en japonés, con muestras de n=4, lo que indica alta variabilidad y fiabilidad limitada.
- El propio autor advierte que es su primera aproximación a un modelo agéntico y que "algunas cosas pueden no estar bien".
- Riesgo de alucinación no cuantificado; no se publican evaluaciones de veracidad.
- Longitud de contexto no documentada, lo que impide planificar cargas con ventanas largas.
- Cobertura lingüística limitada a indonesio, japonés e inglés; no se documenta soporte para castellano.
- El conjunto de datos incluye fuentes cuya licencia no está claramente indicada en sus fichas; el autor recomienda verificar cada licencia antes de liberar un modelo derivado.
- Entrenamiento muy corto (184 pasos, 2.476 muestras) y sin datos publicados sobre RLHF/DPO, lo que limita la alineación y robustez en producción.
- Licencia Apache 2.0 permite uso comercial, pero deben respetarse las condiciones del modelo base Granite y de los datasets de origen.

## Enlaces
- Hugging Face: https://huggingface.co/K-Ai-Official/Kanata-S1-3B
- Modelo base: https://huggingface.co/ibm-granite/granite-4.1-3b-base
- Dataset Kai_v3: https://huggingface.co/datasets/K-Ai-Official/Kai_v3
- Dataset hermes-function-calling-v1: https://huggingface.co/datasets/NousResearch/hermes-function-calling-v1
- Dataset OpenHermes-2.5: https://huggingface.co/datasets/teknium/OpenHermes-2.5
- Dataset alpaca-gpt4-indonesia-cleaned: https://huggingface.co/datasets/NekoFi/alpaca-gpt4-indonesia-cleaned
- Dataset magpie-sft-v1.0: https://huggingface.co/datasets/llm-jp/magpie-sft-v1.0
- Papers, blogs, repos y demos adicionales: no disponibles en la información proporcionada.
