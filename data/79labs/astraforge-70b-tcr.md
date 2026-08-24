# 79Labs/astraforge-70b-TCR

## Resumen

`astraforge-70b-TCR` es un adaptador LoRA (r=16) desarrollado por 79Labs sobre el modelo base `meta-llama/Llama-3.3-70B-Instruct`. Su propósito es especializar el modelo en protocolos agenticos de tool-calling fiables: seleccionar la herramienta correcta de un catálogo grande mediante RAG, elicitar parámetros faltantes, confirmar antes de ejecutar acciones consecuentes y emitir llamadas válidas según esquema, todo ello preservando el razonamiento general del modelo base.

El adaptador se entrena con QLoRA 4-bit sobre 1.006.113 ejemplos agenticos procedentes de 35 dominios de negocio (CRM, finanzas, soporte, logística, sanidad, RR. HH., IT, etc.), con early stopping por validación (mejor loss ≈ 0,1198). El tamaño del repositorio es de 0,8 GB, y la ventana de contexto de entrenamiento y servicio es de 4096 tokens. No es una mejora general de capacidades: es una especialización medible y acotada para entornos de producción donde la fiabilidad del protocolo agentico importa más que la inteligencia general.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (r=16) sobre Llama-3.3-70B-Instruct (transformer decoder-only) |
| Parámetros totales | Adaptador: ~828 MB (≈0,8 GB); modelo base: 70B |
| Parámetros activos | No aplica (adaptador denso, no MoE) |
| Longitud de contexto | 4096 tokens (ventana de entrenamiento y servicio) |
| Tipos de cuantización | No disponible (entrenado con QLoRA 4-bit sobre el base; no se especifican cuantizaciones de inferencia) |
| Idiomas soportados | Inglés |
| Licencia | llama3.3 |
| Formato de pesos | safetensors (adaptador PEFT) |

## Arquitectura y entrenamiento

El modelo es un adaptador LoRA (r=16) acoplado a `meta-llama/Llama-3.3-70B-Instruct`. El entrenamiento se realizó con QLoRA 4-bit mediante la librería Unsloth, con un proceso de SFT continuado sobre 1.006.113 ejemplos agenticos, detenido por early stopping según la loss de validación (mejor valor ≈ 0, 1198). La especialización cubre siete comportamientos: tool-calling en JSON de función OpenAI (herramienta correcta, argumentos válidos por esquema), elicitation de parámetros faltantes, confirmación antes de llamar, RAG multi-documento con citas, encadenamiento ReAct (razonar → actuar → observar), guardrails (no llamar herramientas no declaradas, negarse fuera de alcance) y razonamiento analítico sobre datos (aritmética, mediana, varianza, cambio porcentual, pronósticos). La ventana de contexto se fijó en 4096 tokens tanto en entrenamiento como en servicio.

## Capacidades

- Tool-calling en formato OpenAI function-call JSON: selecciona la herramienta correcta y genera argumentos válidos según esquema.
- Elicitación: cuando faltan parámetros obligatorios, pregunta al usuario en lugar de alucinarlos.
- Confirmación previa a la acción: para acciones consecuenciales, solicita confirmación explícita antes de ejecutar la llamada.
- RAG multi-documento: selecciona el documento relevante, responde con base en él y cita la fuente.
- Razonamiento ReAct: encadena razonamiento → acción → observación para tareas multi-paso.
- Guardrails: rechaza llamadas a herramientas no declaradas y se niega a actuar fuera de su ámbito.
- Razonamiento analítico: aritmética y estadística básica (mediana, varianza, cambio porcentual, pronósticos) sobre datos proporcionados.
- Capacidad conversacional y de generación de texto heredada del base Llama-3.3-70B-Instruct (no se observa regresión en razonamiento, ver benchmarks).

## Casos de uso

- Atención al cliente con herramientas: un agente que consulta un CRM, un sistema de tickets o una base de conocimiento, elicita los datos que faltan (número de pedido, email) y confirma antes de crear o modificar registros. Adecuado porque el adaptador está entrenado para confirmar antes de actuar y para no inventar parámetros.
- Asistentes de ventas y CRM: integración con pipelines de ventas donde el agente debe seleccionar la herramienta correcta entre un catálogo amplio (crear oportunidad, actualizar etapa, programar reunión) y verificar la validez del esquema de cada llamada.
- Soporte IT con RAG multi-documento: el agente consulta manuales, playbooks y documentación interna, selecciona el documento relevante, responde con citas y deriva a una herramienta de escalado solo tras confirmación. La capacidad de grounding y cita reduce alucinaciones en entornos técnicos.
- Automatización de finanzas y análisis: el agente puede realizar cálculos (mediana, varianza, cambio porcentual, pronósticos) sobre datos proporcionados en la conversación, y llamar a herramientas de hoja de cálculo o BI con argumentos validados.
- Despliegue privado/on-premise para agentes de negocio: al ser un adaptador sobre un modelo abierto 70B, permite ejecutar agentes de tool-calling sin depender de APIs alojadas, en entornos con requisitos de soberanía de datos o cumplimiento normativo.
- Sistemas de planificación y ejecución multi-paso: el agente puede descomponer una petición en pasos ReAct, consultar varias herramientas secuencialmente y confirmar cada acción consecuencial, adecuado para orquestación de tareas administrativas o logísticas.
- Generación de código con control de herramientas: aunque no es un modelo especializado en código, puede integrarse en CI/CD para llamar a herramientas de build, test o despliegue con esquema válido y confirmación previa, reduciendo acciones destructivas accidentales.

## Benchmarks y rendimiento

Datos declarados por el autor en un benchmark propio (N=100) y en BFCL v4. No se han verificado externamente; los valores son indicativos, no de nivel de leaderboard.

| Modelo | GSM8K (control de razonamiento) | Tool-correct | Confirmed-first |
|---|---|---|---|
| **astraforge-70b-TCR (este modelo)** | **0, 93** | **0, 81** | **0, 94** |
| Llama-3.3-70B-Instruct (base) | 0, 93 | 0, 54 | 0, 00 |
| Qwen3-32B | 0, 80 | 0, 79 | 0, 02 |
| gpt-oss-120b | 0, 87 | 0, 43 | 0, 05 |
| gpt-oss-20b | 0, 87 | 0, 46 | 0, 06 |
| Gemma-4-31B-it | — | — | — *(excluido: cuelgue de generación bajo Unsloth)* |

Notas del autor: la métrica "Confirmed-first" favorece a este modelo por diseño (el resto no fue entrenado para confirmar antes de actuar); "Tool-correct" es la comparación más justa (el +0, 27 frente al base refleja especialización real); GSM8K es un control de no regresión. En BFCL v4 `simple_python`, modo Prompt, N=400, el modelo obtuvo 51, 00 % (204/400). El autor advierte que un agregado previo de "0, 43 % overall" fue engañoso porque promediaba once categorías nunca generadas como cero.

## Requisitos de hardware

- El adaptador LoRA es ligero (~0, 8 GB), pero el modelo base Llama-3.3-70B-Instruct requiere hardware de alta capacidad.
- VRAM estimada para inferencia: con cuantización 4-bit del base, se requieren ~40-50 GB de VRAM; en 8-bit, ~70 GB; en FP16/BF16, ~140 GB.
- GPU recomendadas: NVIDIA A100 80GB, H100 80GB, o configuraciones multi-GPU (p. ej., 2× RTX 4090 de 24 GB cada una para 4-bit). No cabe en una sola GPU de consumo (RTX 4090 24 GB) sin cuantización agresiva (por debajo de 4-bit, no especificada).
- Opciones de despliegue: cargar el adaptador con PEFT sobre el base en frameworks como vLLM, Text Generation Inference (TGI) o Unsloth; para inferencia local ligera, se podría fusionar el adaptador y cuantizar a GGUF para llama.cpp/Ollama, aunque el autor no documenta este flujo.
- Latencia y throughput: no disponibles; dependerá de la cuantización, el número de GPU y el framework de servicio.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | GSM8K | Tool-correct | Confirmed-first | Licencia |
|---|---|---|---|---|---|---|
| **astraforge-70b-TCR** | 70B (adaptador LoRA) | 4096 | 0, 93 | 0, 81 | 0, 94 | llama3.3 |
| Llama-3.3-70B-Instruct (base) | 70B | 128K (nativo) | 0, 93 | 0, 54 | 0, 00 | llama3.3 |
| Qwen3-32B | 32B | 128K (nativo) | 0, 80 | 0, 79 | 0, 02 | Apache 2.0 |
| gpt-oss-120b | 120B | 128K (nativo) | 0, 87 | 0, 43 | 0, 05 | Apache 2.0 |
| gpt-oss-20b | 20B | 128K (nativo) | 0, 87 | 0, 46 | 0, 06 | Apache 2.0 |

La comparativa procede de la evaluación del autor (N=100, mismas condiciones de contexto y decodificación). El adaptador destaca en "Confirmed-first" y "Tool-correct" frente al base y a alternativas abiertas de tamaño similar, a costa de una ventana de contexto mucho menor (4096 frente a 128K nativo en los otros).

## Limitaciones y advertencias

- Especialización, no mejora general: no es un modelo de propósito general; para tareas abiertas de codificación o investigación, el autor recomienda modelos más grandes o especializados.
- Datos de benchmark indicativos: N=100 y N=400 no son líderes; las diferencias de pocos puntos pueden ser ruido. Los resultados no están verificados por terceros.
- La métrica "Confirmed-first" está diseñada a favor de este modelo: otros modelos no fueron entrenados ni prompteados para confirmar, por lo que su puntuación cercana a cero no indica que sean malos agentes.
- Ventana de contexto limitada: 4096 tokens, muy inferior a los 128K del base; no adecuado para tareas con contexto largo.
- Solo inglés: no se ha entrenado ni evaluado en otros idiomas.
- Riesgo de alucinación de herramientas: aunque hay guardrails (no llamar herramientas no declaradas), el riesgo persiste en casos límite; se recomienda validación externa de las llamadas en producción.
- Licencia llama3.3: uso comercial permitido bajo los términos de la licencia de Meta para Llama-3.3, que incluyen requisitos de atribución y restricciones de uso para ciertos fines (p. ej., usuarios con más de 700M MAU necesitan licencia comercial específica).
- BFCL v4 simple_python: 51 % de acierto en 400 casos; no es un rendimiento competitivo en tool-calling simple en Python frente a modelos cerrados de vanguardia.
- No se especifican cuantizaciones de inferencia ni latencia; el despliegue en GPU consumer requiere cuantización agresiva no documentada.

## Enlaces

- Hugging Face (modelo): https://huggingface.co/79Labs/astraforge-70b-TCR
- Directorio de benchmarks del modelo: https://huggingface.co/79Labs/astraforge-70b-TCR/tree/main/benchmarks
- Servicio de inferencia (FriendliAI): https://friendli.ai/models/79Labs/astraforge-70b-TCR
- Sitio web de AstraForge: https://astraforge.dev/
- Repositorio GitHub de AstraForge: https://github.com/0xLaylo/AstraForge
