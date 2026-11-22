# K-Ai-Official/Kanata-S1-3B-LoRA

## Resumen

Kanata-S1-3B-LoRA es un adaptador LoRA (PEFT) desarrollado por K-Ai (Kortex AI) que se aplica sobre el modelo base ibm-granite/granite-4.1-3b-base de IBM. El objetivo declarado es especializar un modelo de 3B parámetros en generación de código (Python, JavaScript, TypeScript), comportamiento agéntico, tool calling y planificación por pasos, con soporte de conversación en indonesio, japonés e inglés. El adaptador tiene un tamaño de repositorio de 0,2 GB, lo que confirma que se distribuyen únicamente los pesos LoRA y no el modelo completo.

El entrenamiento se realizó mediante SFT con QLoRA de 4 bits (NF4), rango LoRA 32 y longitud de secuencia 1280, sobre 2476 muestras y 184 pasos máximos (1,19 épocas planificadas, batch efectivo 16). El tiempo estimado de entrenamiento fue de 45,9 minutos en una NVIDIA T4. La pérdida se calcula solo en los turnos del asistente. La relevancia del modelo radica en su enfoque declarado hacia agentes y tool calling en un tamaño reducido, aunque la propia model card advierte que las cifras de evaluación son smoke tests con muestras pequeñas.

La licencia es Apache-2.0, heredada del modelo base, y los pesos se distribuyen en formato safetensors mediante la librería PEFT. El modelo solo genera texto, incluidas las peticiones de invocación de herramientas; la ejecución real de las tools corresponde a un runtime externo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (PEFT) sobre transformer decoder-only ibm-granite/granite-4.1-3b-base |
| Parametros totales | 3B en el modelo base; el adaptador LoRA se distribuye por separado (repo de 0,2 GB) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (el entrenamiento usó secuencias de 1280 tokens) |
| Tipos de cuantizacion | Entrenamiento en QLoRA 4-bit NF4; cuantizaciones de inferencia del modelo base no especificadas |
| Idiomas soportados | indonesio (id), japonés (ja), inglés (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El adaptador se aplica sobre un transformer decoder-only de 3B parámetros (Granite 4.1 3B base). El fine-tuning se realizó con QLoRA de 4 bits en formato NF4, rango LoRA 32, longitud de secuencia 1280, modo de entrenamiento "FAST", 184 pasos máximos, batch efectivo 16 y 1,19 épocas planificadas sobre 2476 muestras. El tiempo estimado de entrenamiento fue de 45,9 minutos en una NVIDIA T4 y la pérdida se computa exclusivamente en los turnos del asistente.

La composición del dataset combina generación sintética propia de K-Ai para escenarios agénticos (775 muestras `agent_synth`), código sintético verificado con unit tests en id/ja/en (120 muestras `code_idja_synth`), código en inglés de Magicoder-OSS-Instruct-75K y CodeFeedback-Filtered-Instruction (450 muestras), código japonés de llm-jp y Aratako (300 muestras), instrucciones generales en indonesio de alpaca-gpt4-indonesia-cleaned (700 muestras), instrucciones generales en japonés de llm-jp/magpie-sft-v1.0 (350 muestras) y 8 muestras de identidad. El bucket `agent_hermes` (NousResearch/hermes-function-calling-v1) figura con 0 muestras cargadas. Los cargadores están envueltos en `try/except` para evitar que el fallo de una fuente detenga el resto.

El formato de chat sigue los tokens de rol de Granite: `<|start_of_role|>`, `<|end_of_role|>` y `<|end_of_text|>`. Las herramientas se envían en el system prompt dentro de `<tools></tools>` y se invocan con `<tool_call>{...}</tool_call>`. No se documentan innovaciones técnicas adicionales como decodificación especulativa o atención lineal.

## Capacidades

- Generación de código en Python, JavaScript y TypeScript, con foco declarado en tareas de programación y depuración.
- Tool calling / function calling mediante el formato `<tool_call>{...}</tool_call>`, con definición de herramientas en `<tools></tools>` dentro del system prompt.
- Comportamiento agéntico: planificación por pasos, exploración de repositorios, refactorización, depuración y pruebas según los escenarios sintéticos usados en el entrenamiento.
- Razonamiento multi-paso orientado a agentes, aunque la ejecución de herramientas debe realizarla un runtime externo.
- Conversación multilingüe en indonesio, japonés e inglés.
- Generación de texto general e instrucciones en los tres idiomas citados.
- No se documentan capacidades de visión, audio ni modo de pensamiento explícito.

## Casos de uso

- Asistente de código en IDE: el adaptador puede generar funciones y parches en Python, JavaScript y TypeScript, apoyándose en el modelo base Granite 3B y en el entrenamiento con datasets de código verificados con unit tests.
- Automatización de tool calling en pipelines internos: el modelo emite llamadas en formato `<tool_call>` que un runtime agéntico puede parsear y ejecutar, adecuado para orquestar APIs o scripts en inglés e indonesio.
- Agentes de exploración y refactorización de repositorios: los escenarios sintéticos de entrenamiento incluyen exploración de repositorios, refactorización y pruebas, por lo que el modelo puede proponer planes de cambio paso a paso.
- Atención al cliente y asistentes conversacionales en indonesio y japonés: el ajuste incluye datasets generales de instrucciones en ambos idiomas, lo que permite conversaciones multi-turno en esas lenguas.
- Generación de tests y sesiones de depuración: parte del dataset `code_idja_synth` incluye sesiones de debugging y soluciones verificadas mediante unit tests, útil para proponer casos de prueba.
- Prototipado de agentes en hardware modesto: al ser un adaptador sobre un base de 3B, puede desplegarse en GPUs de consumo para pruebas de concepto de agentes con tool calling antes de escalar a modelos mayores.
- Localización de asistentes técnicos para mercados de Indonesia y Japón: el soporte nativo de id y ja en el ajuste permite construir asistentes de documentación o soporte en esas lenguas.

## Benchmarks y rendimiento

Los únicos datos publicados son evaluaciones internas de smoke test con muestras pequeñas, no comparables con benchmarks estándar (HumanEval, BFCL, MMLU).

Tool calling (escenario held-out generado sintéticamente):

| Idioma | n | Formato `<tool_call>` válido | Nombre de tool correcto | Argumentos obligatorios completos |
|---|---:|---:|---:|---:|
| id | 4 | 25% | 25% | 25% |
| ja | 4 | 0% | 0% | 0% |
| en | 4 | 25% | 25% | 25% |

Código mini (problemas de funciones Python en id/ja/en, ejecutados con `assert`): 5 de 6 superados.

No se han publicado resultados de benchmarks estándar en la información disponible.

## Requisitos de hardware

- El adaptador LoRA ocupa 0,2 GB; debe combinarse con el modelo base Granite 4.1 3B para inferencia.
- VRAM estimada: no disponible de forma oficial; para un base de 3B en FP16 se requiere aproximadamente 6-8 GB, y en cuantización de 4 bits alrededor de 2-4 GB, aunque estas cifras no están confirmadas en la model card.
- GPU recomendadas: el entrenamiento se realizó en una NVIDIA T4, lo que indica que el ajuste es viable en GPUs de gama media; para inferencia se puede usar T4, RTX 3090/4090 o superiores.
- Cabe en GPU de consumo: sí, previsiblemente en RTX 3060 12 GB, RTX 4060 Ti 16 GB o RTX 4090, siempre que se cuantice el modelo base.
- Opciones de despliegue: la model card muestra uso con `transformers` y `peft`; no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI para este adaptador.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Kanata-S1-3B-LoRA | 3B (base) + adaptador LoRA | no disponible | Código, agentes, tool calling en id/ja/en | Apache-2.0 | Hugging Face (adaptador PEFT) |
| ibm-granite/granite-4.1-3b-base | 3B | no disponible | Modelo base generalista | Apache-2.0 | Hugging Face |
| Modelos de código de 3B comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de benchmarks estándar del adaptador ni de comparativas oficiales con alternativas, por lo que la comparación se limita al modelo base y a la categoría de tamaño.

## Limitaciones y advertencias

- El indonesio no figura en la lista de idiomas oficiales del modelo base Granite; la calidad depende del fine-tuning y no se ha probado de forma extensa.
- Las evaluaciones publicadas proceden de muestras muy pequeñas (n=4 por idioma en tool calling) y de datos sintéticos propios, por lo que los resultados pueden ser más optimistas que en tareas reales.
- El modelo puede invocar herramientas incorrectamente o generar información inexacta; la ejecución de tools debe verificarse en un runtime externo.
- Riesgo de alucinación inherente a modelos de 3B, especialmente en razonamiento multi-paso y código complejo.
- El bucket `agent_hermes` figura con 0 muestras cargadas, lo que reduce la diversidad de datos de function calling en inglés.
- La licencia Apache-2.0 cubre el adaptador, pero deben revisarse las licencias de los datasets públicos utilizados antes de un uso comercial o redistribución; no todas las fuentes tienen licencia clara.
- El adaptador requiere cargar el modelo base por separado; no es un modelo autónomo listo para usar sin combinar pesos.
- No se documentan límites de contexto efectivos ni comportamiento en secuencias largas más allá de los 1280 tokens de entrenamiento.

## Enlaces

- Hugging Face: https://huggingface.co/K-Ai-Official/Kanata-S1-3B-LoRA
- Modelo base: https://huggingface.co/ibm-granite/granite-4.1-3b-base
- Dataset de function calling de referencia: https://huggingface.co/datasets/NousResearch/hermes-function-calling-v1
- Dataset Magicoder-OSS-Instruct-75K: no disponible (enlace no incluido en la información proporcionada)
- Dataset CodeFeedback-Filtered-Instruction: no disponible (enlace no incluido en la información proporcionada)
- Dataset llm-jp Synthetic-JP-EN-Coding: no disponible (enlace no incluido en la información proporcionada)
- Dataset llm-jp magpie-sft-v1.0: no disponible (enlace no incluido en la información proporcionada)
- Dataset alpaca-gpt4-indonesia-cleaned (NekoFi): no disponible (enlace no incluido en la información proporcionada)
- Repositorio Kai_v3: https://huggingface.co/K-Ai-Official/Kai_v3 (referenciado en la model card)
