# Keanualfahd/Kanata-S1-3B

## Resumen

Kanata-S1-3B es un modelo de lenguaje de 3.400 millones de parámetros desarrollado por Keanualfahd bajo el sello K-Ai (Kortex AI), obtenido mediante ajuste fino supervisado (SFT) con QLoRA sobre `ibm-granite/granite-4.1-3b-base`. Está orientado a generación de código (Python, JavaScript, TypeScript), razonamiento agéntico, tool calling y planificación paso a paso, con soporte de conversación en indonesio, japonés e inglés.

El modelo se distribuye con licencia Apache 2.0 y pesos en formato safetensors, con un repositorio de 6,8 GB. Su relevancia radica en ser una propuesta de modelo agéntico pequeño (3B) entrenado con datos sintéticos verificados mediante ejecución real de Python y tests unitarios, lo que permite desplegarlo en hardware modesto (el entrenamiento se completó en 45,9 minutos sobre una NVIDIA T4).

Se trata de un primer lanzamiento del autor, que advierte explícitamente de que algunos comportamientos pueden no ser correctos. Los resultados publicados corresponden a una evaluación interna de tipo smoke test con muestras muy pequeñas, no a benchmarks estándar, por lo que deben interpretarse con cautela.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (derivada de IBM Granite 4.1) |
| Parámetros totales | 3.402.836.480 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | QLoRA 4-bit NF4 durante el entrenamiento; no se documentan cuantizaciones de inferencia publicadas |
| Idiomas soportados | indonesio (id), japonés (ja), inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de `ibm-granite/granite-4.1-3b-base`, un transformer decoder-only de 3B parámetros, y se ajusta mediante QLoRA en 4-bit NF4 con rango LoRA 32, longitud de secuencia 1280, batch efectivo 16 y un máximo de 184 pasos (1,19 épocas planificadas) sobre 2.476 muestras. El entrenamiento se realizó en modo `FAST` y se completó en aproximadamente 45,9 minutos sobre una NVIDIA T4. La pérdida se calcula únicamente sobre los turnos del asistente.

El conjunto de datos combina varias fuentes: 775 muestras de un generador sintético agéntico propio con 8 escenarios (corregir bug y test, ejecutar script, explorar repositorio, investigación web, refactorizar y verificar, responder sin herramienta, herramienta no disponible y fallo repetido con reporte honesto), con resultados de herramientas calculados mediante ejecución real de Python; 120 muestras de código sintético id/ja verificadas con tests unitarios; 450 de código en inglés (Magicoder-OSS-Instruct, CodeFeedback); 300 de código en japonés (llm-jp); 700 de instrucciones generales en indonesio (alpaca-gpt4-indonesia-cleaned); 350 en japonés (llm-jp/magpie-sft-v1.0); y 8 de identidad. El bucket `agent_hermes` (NousResearch/hermes-function-calling-v1) figura en la composición con 0 muestras efectivas. El formato de chat es Granite (`<|start_of_role|>…<|end_of_role|>`, fin de turno `<|end_of_text|>`) con tool calls estilo Hermes: `<tool_call>{"name":..., "arguments":...}</tool_call>`.

## Capacidades

- Generación de texto y código en Python, JavaScript y TypeScript.
- Tool calling / function calling con formato `<tool_call>` estilo Hermes.
- Razonamiento agéntico multi-paso: planificación, exploración de repositorios, ejecución de scripts y verificación de resultados.
- Depuración de código y sesiones de debugging.
- Refactorización con verificación posterior.
- Reporte honesto ante fallos repetidos o herramientas no disponibles (entrenado explícitamente para ello).
- Conversación multilingüe en indonesio, japonés e inglés.
- Respuesta sin herramientas cuando no son necesarias.

## Casos de uso

- Asistente de código en editor: el modelo puede completar funciones y corregir bugs en Python, JavaScript y TypeScript, integrándose vía API compatible con transformers en extensiones de IDE o servidores LSP.
- Agente de automatización de tareas de desarrollo: con tool calling y planificación paso a paso, puede encadenar lectura de repositorio, ejecución de scripts y verificación de resultados en pipelines internos.
- Atención al cliente en indonesio o japonés: su entrenamiento en `id_general` y `ja_general` permite gestionar conversaciones multi-turno en esos idiomas, aunque la ventana de contexto no está documentada y conviene validarla antes de producción.
- Generación de tests unitarios: dado que parte del entrenamiento usó soluciones verificadas con tests, es adecuado para proponer casos de prueba en tareas de código acotadas.
- Enseñanza de programación en Indonesia y Japón: puede explicar código y guiar depuración en el idioma del estudiante, con la ventaja de un modelo pequeño desplegable en hardware local.
- Prototipado de agentes en entornos con recursos limitados: al ser un 3B, cabe en GPUs de consumo y permite iterar sobre flujos agénticos sin infraestructura dedicada.
- Investigación sobre SFT con datos sintéticos verificados: el modelo y su receta (generador sintético con ejecución real) sirven como referencia reproducible para estudiar el impacto de datos verificados en modelos pequeños.

## Benchmarks y rendimiento

Los datos publicados son una evaluación interna de tipo smoke test generada por el notebook de entrenamiento, con muestras muy pequeñas; no son comparables con HumanEval, BFCL o MMLU.

| Evaluación | Idioma | n | Formato `<tool_call>` válido | Nombre de herramienta correcto | Argumentos requeridos completos |
|---|---|---|---|---|---|
| Tool calling (escenarios sintéticos held-out) | id | 4 | 25% | 25% | 25% |
| Tool calling (escenarios sintéticos held-out) | ja | 4 | 0% | 0% | 0% |
| Tool calling (escenarios sintéticos held-out) | en | 4 | 25% | 25% | 25% |

| Evaluación | Resultado |
|---|---|
| Mini coding (tareas de función Python en id/ja/en, con `assert`) | 5 de 6 superadas |

No se han publicado resultados de benchmarks estándar en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; para un modelo de 3,4B en fp16 se requieren aproximadamente 7 GB de pesos, y en cuantización de 4 bits alrededor de 2-3 GB, aunque el autor no publica cifras.
- GPU de entrenamiento documentada: NVIDIA T4 (45,9 minutos para el ajuste QLoRA).
- GPU recomendadas: no especificadas por el autor; por tamaño, una RTX 4090 o A100/H100 permiten inferencia holgada en fp16, y GPUs de consumo con 8 GB o más pueden alojar versiones cuantizadas.
- Cabe en GPU de consumo: previsiblemente sí en cuantizaciones de 4-8 bits, aunque no hay confirmación oficial.
- Opciones de despliegue: transformers (documentado en la model card); vLLM, llama.cpp, Ollama o TGI no están documentados por el autor y requerirían conversión a GGUF u otros formatos.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Enfoque |
|---|---|---|---|---|---|
| Kanata-S1-3B | 3,4B | no disponible | id, ja, en | Apache 2.0 | Código + agente + tool calling |
| ibm-granite/granite-4.1-3b-base | ~3B | no disponible en la información | no disponible en la información | no disponible en la información | Base generalista |
| Qwen2.5-Coder-3B | ~3B | no disponible en la información | multilingüe | no disponible en la información | Código |
| Llama-3.2-3B-Instruct | ~3B | no disponible en la información | multilingüe | no disponible en la información | Instrucciones generales |

Los datos de los modelos comparables no se han verificado en la información proporcionada; la comparación se limita a categoría y tamaño.

## Limitaciones y advertencias

- El autor advierte de que es su primer modelo agéntico y que "algunos comportamientos pueden no ser correctos".
- Los benchmarks publicados son smoke tests con n=4 por idioma; el rendimiento en tool calling en japonés fue del 0% en esa muestra, lo que sugiere fragilidad en ese idioma.
- Riesgo de alucinación inherente a un modelo de 3B ajustado con SFT; no se documenta RLHF ni DPO.
- La longitud de contexto no está publicada; el entrenamiento usó secuencias de 1280 tokens, por lo que contextos largos no están garantizados.
- Solo se declaran tres idiomas (id, ja, en); el rendimiento en castellano no está evaluado.
- El bucket `agent_hermes` figura con 0 muestras efectivas, por lo que el entrenamiento en tool calling dependió casi por completo de datos sintéticos propios.
- Algunas fuentes del dataset no declaran licencia clara; el autor recomienda verificar la licencia de cada una antes de reutilizar el modelo en producción.
- Licencia Apache 2.0 permite uso comercial, pero la ausencia de evaluaciones estándar desaconseja desplegarlo en producción sin validación propia.

## Enlaces

- Hugging Face: https://huggingface.co/Keanualfahd/Kanata-S1-3B
- Modelo base: https://huggingface.co/ibm-granite/granite-4.1-3b-base
- Dataset K-Ai-Official/Kai_v3: https://huggingface.co/datasets/K-Ai-Official/Kai_v3
- Dataset NousResearch/hermes-function-calling-v1: https://huggingface.co/datasets/NousResearch/hermes-function-calling-v1
- Dataset teknium/OpenHermes-2.5: https://huggingface.co/datasets/teknium/OpenHermes-2.5
- Dataset NekoFi/alpaca-gpt4-indonesia-cleaned: https://huggingface.co/datasets/NekoFi/alpaca-gpt4-indonesia-cleaned
- Dataset llm-jp/magpie-sft-v1.0: https://huggingface.co/datasets/llm-jp/magpie-sft-v1.0
