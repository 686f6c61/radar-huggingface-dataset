# Keanualfahd/Kanata-S1-3B-LoRA

## Resumen

Kanata-S1-3B es un adaptador LoRA (QLoRA de 4 bits) publicado por Keanualfahd bajo la marca K-Ai (Kortex AI), obtenido mediante fine-tuning supervisado (SFT) del modelo base `ibm-granite/granite-4.1-3b-base` de IBM. El modelo está orientado a tres tareas concretas: generación de código (Python, JavaScript y TypeScript), tool calling en formato estructurado y planificación por pasos en escenarios agénticos. Su relevancia radica en que adapta un transformer denso de 3B parámetros a un perfil de uso muy específico con un coste de entrenamiento muy bajo (184 pasos en una GPU T4).

El adaptador se distribuye como un repositorio PEFT de aproximadamente 0,2 GB, con pesos en safetensors y licencia Apache-2.0 heredada del modelo base. Los idiomas declarados son indonesio (id), japonés (ja) e inglés (en), aunque el propio autor advierte que el indonesio no forma parte de los idiomas oficiales de Granite y su calidad depende enteramente de los datos de fine-tuning.

Es un modelo de nicho: no busca competir en benchmarks generalistas, sino ofrecer una base ligera y desplegable para pipelines de agentes con tool calling en tres idiomas. La model card es explícita al señalar que las cifras de evaluación son smoke tests con muestras muy pequeñas y no deben compararse con resultados oficiales de HumanEval, BFCL o MMLU.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (modelo base `ibm-granite/granite-4.1-3b-base`); adaptador LoRA sobre QLoRA 4-bit NF4 |
| Parametros totales | 3B (modelo base); el adaptador LoRA se distribuye por separado (r=32) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (el entrenamiento uso secuencias de 1280 tokens) |
| Tipos de cuantizacion | QLoRA 4-bit NF4 durante el entrenamiento; cuantizaciones de inferencia no especificadas |
| Idiomas soportados | id (indonesio), ja (japonés), en (inglés) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El adaptador se entrena sobre el transformer denso de 3B parámetros de Granite 4.1 en configuración QLoRA de 4 bits NF4, con rango LoRA r=32 y longitud de secuencia de 1280 tokens. El entrenamiento se ejecutó en modo `FAST`: 184 pasos, aproximadamente 1,19 épocas, batch efectivo de 16 y un tiempo estimado de 45,9 minutos en una GPU T4 (estimación del propio autor, no medida con cronómetro final). La pérdida se calcula únicamente sobre los turnos del asistente, con un total de 2476 muestras.

La composición del dataset es mayoritariamente sintética y generada por el propio autor: `agent_synth` (775 muestras), `code_en` (450), `ja_general` (350), `code_ja` (300), `code_idja_synth` (120), `id_general` (700), `identity` (8) y `agent_hermes` (0). Las fuentes públicas empleadas incluyen NousResearch/hermes-function-calling-v1, Magicoder-OSS-Instruct, CodeFeedback, llm-jp (Synthetic-JP-EN-Coding, magpie-sft) y alpaca-gpt4-indonesia-cleaned. No se documenta RLHF ni DPO; el proceso es SFT puro. El formato de chat sigue los tokens de rol de Granite (`<|start_of_role|>`, `<|end_of_role|>`, `<|end_of_text|>`), con las herramientas declaradas en el system prompt dentro de `<tools></tools>` y las llamadas emitidas como `<tool_call>{...}</tool_call>`.

## Capacidades

- Generación de código en Python, JavaScript y TypeScript, con foco en funciones autocontenidas y resolución de problemas tipo assert.
- Tool calling estructurado: emite bloques `<tool_call>` con nombre de herramienta y argumentos en JSON, siguiendo el esquema declarado en el system prompt.
- Planificación por pasos y razonamiento multi-turno orientado a agentes; el modelo solo genera la petición de herramienta y delega la ejecución en un runtime externo.
- Conversación multilingüe en indonesio, japonés e inglés, con calidad desigual según el idioma (ver limitaciones).
- Generación de texto general y respuesta a instrucciones en los tres idiomas declarados.
- No se documentan capacidades de visión, audio ni modo de razonamiento extendido (thinking mode).

## Casos de uso

- Asistente de código en editor o IDE: el modelo puede completar funciones Python, JS y TS a partir de una firma o un enunciado, lo que encaja con su entrenamiento en Magicoder-OSS-Instruct y CodeFeedback y con el formato de chat de Granite.
- Agente de automatización con herramientas: al emitir `<tool_call>` en JSON, puede integrarse en un runtime que ejecute búsquedas, consultas a APIs o comandos de shell, con el modelo limitándose a decidir la herramienta y los argumentos.
- Atención al cliente en indonesio y japonés: permite conversaciones multi-turno en dos idiomas poco cubiertos por modelos occidentales, siempre que se valide la calidad con datos propios antes de producción.
- Generación de scripts de automatización: útil para producir pequeños scripts de operaciones (procesado de ficheros, llamadas HTTP) en inglés o indonesio dentro de pipelines internos.
- Prototipado rápido de agentes en local: al ser un adaptador de 0,2 GB sobre un base de 3B, se puede cargar en una GPU de consumo para iterar sobre prompts y esquemas de herramientas sin coste de API.
- Enseñanza y experimentación con fine-tuning: sirve como ejemplo reproducible de QLoRA sobre Granite 4.1 con un dataset mixto sintético y público, útil para investigadores que quieran replicar el pipeline.
- Traducción técnica asistida EN↔JA↔ID en contextos de documentación de código, con revisión humana obligatoria por el riesgo de alucinación.

## Benchmarks y rendimiento

Los únicos datos disponibles son evaluaciones internas del autor, explícitamente descritas como smoke tests con muestras muy pequeñas y no comparables con benchmarks estándar.

Tool calling sobre escenarios held-out generados sintéticamente:

| Idioma | n | Formato `<tool_call>` válido | Nombre de tool correcto | Argumentos obligatorios completos |
|---|---|---|---|---|
| id | 4 | 25% | 25% | 25% |
| ja | 4 | 0% | 0% | 0% |
| en | 4 | 25% | 25% | 25% |

Código mini (problemas de función Python en id/ja/en, verificados con `assert`): 5 de 6 superados.

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, BFCL) en la información disponible.

## Requisitos de hardware

- VRAM estimada para el modelo base de 3B: aproximadamente 6-7 GB en FP16, 3-4 GB en cuantización de 8 bits y 2-3 GB en 4 bits (estimaciones habituales para un denso de 3B; no confirmadas en la model card).
- El adaptador LoRA en sí ocupa unos 0,2 GB y debe fusionarse o cargarse junto al base.
- GPU recomendadas: T4 (usada en el entrenamiento), RTX 3060/4060 en adelante para inferencia en 4 bits; A100/H100 no son necesarias para un modelo de este tamaño.
- Cabe en GPU de consumo: sí, en tarjetas con 6-8 GB o más según cuantización.
- Opciones de despliegue: `transformers` + PEFT (documentado por el autor), y previsiblemente vLLM, llama.cpp u Ollama tras convertir y fusionar el adaptador, aunque no se documenta soporte explícito.
- Latencia y throughput: no disponibles. El único dato temporal es el entrenamiento (45,9 minutos estimados en T4 para 184 pasos).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Kanata-S1-3B | 3B (base) + LoRA r=32 | no disponible | Código + tool calling id/ja/en | Apache-2.0 | Hugging Face (adaptador PEFT) |
| ibm-granite/granite-4.1-3b-base | 3B | no disponible | Base generalista | Apache-2.0 | Hugging Face |
| Qwen2.5-Coder-3B | 3B | no disponible | Código multilingüe | Apache-2.0 | Hugging Face |
| Llama-3.2-3B-Instruct | 3B | no disponible | Instrucciones generales | Llama 3.2 Community | Hugging Face |

La comparación es cualitativa: no hay benchmarks estándar publicados para Kanata-S1-3B que permitan contrastar rendimiento numérico con estas alternativas. Su diferenciación real es el soporte de indonesio y japonés en tool calling, terreno donde Qwen2.5-Coder-3B y Llama-3.2-3B-Instruct tienen cobertura limitada o nula.

## Limitaciones y advertencias

- El indonesio no está entre los idiomas oficiales del modelo base Granite; la calidad depende exclusivamente de los datos de fine-tuning y no se ha evaluado ampliamente.
- Las métricas de tool calling provienen de 4 muestras por idioma, con un 0% en japonés; la fiabilidad en producción es baja y requiere validación propia.
- Parte de los datos de entrenamiento es sintética y generada por el propio autor, lo que puede inflar los resultados respecto a tareas reales.
- Riesgo de alucinación en llamadas a herramientas y en argumentos; el runtime debe verificar y validar toda salida antes de ejecutarla.
- El modelo solo genera texto: no ejecuta herramientas, por lo que la seguridad del pipeline recae en el runtime externo.
- Licencia Apache-2.0 heredada, pero el autor recomienda revisar las licencias de los datasets públicos utilizados antes de un uso comercial.
- El repositorio tiene 0 descargas y 1 like en el momento de la consulta; no hay evidencia de uso en producción ni de validación externa.
- No se documenta la longitud de contexto efectiva del modelo base en la información proporcionada, lo que impide garantizar ventanas largas en escenarios agénticos.

## Enlaces

- Hugging Face: https://huggingface.co/Keanualfahd/Kanata-S1-3B-LoRA
- Modelo base: https://huggingface.co/ibm-granite/granite-4.1-3b-base
- NousResearch/hermes-function-calling-v1: https://huggingface.co/datasets/NousResearch/hermes-function-calling-v1
- Magicoder-OSS-Instruct: https://huggingface.co/datasets/ise-uiuc/Magicoder-OSS-Instruct-75K
- CodeFeedback: https://huggingface.co/datasets/m-a-p/CodeFeedback-Filtered-Instruction
- llm-jp Synthetic-JP-EN-Coding: https://huggingface.co/datasets/llm-jp/Synthetic-JP-EN-Coding-Dataset
- llm-jp magpie-sft: https://huggingface.co/datasets/llm-jp/magpie-sft-v1.0
- alpaca-gpt4-indonesia-cleaned: https://huggingface.co/datasets/indonlp/alpaca-gpt4-indonesia-cleaned
