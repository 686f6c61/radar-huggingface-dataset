# dphn/Dolphin3.0-Llama3.1-8B

## Resumen

Dolphin3.0-Llama3.1-8B es un modelo de lenguaje instruct-tuned desarrollado por Cognitive Computations (Eric Hartford, Ben Gitter, BlouseJury y colaboradores) y publicado bajo el identificador `dphn/Dolphin3.0-Llama3.1-8B`. Se trata de un fine-tuning del modelo base `meta-llama/Llama-3.1-8B` con 8.030.277.632 parámetros, orientado a ser un modelo local de propósito general que cubra codificación, matemáticas, uso agéntico, function calling y conversación general.

La propuesta diferencial de la familia Dolphin es el control por parte del propietario del sistema: el prompt de sistema lo define el integrador, la alineación es configurable y el modelo no impone directrices éticas predefinidas. Esto lo posiciona como alternativa a modelos propietarios en escenarios donde se requiere soberanía sobre el comportamiento del modelo y sobre los datos.

El modelo fue entrenado sobre una mezcla de datasets de instrucciones, código, matemáticas y function calling (OpenCoder, Orca, NuminaMath, Tulu 3, smoltalk, entre otros) y declara resultados en el Open LLM Leaderboard. Su licencia es Llama 3.1, lo que condiciona el uso comercial. El modelo está etiquetado únicamente para inglés.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (derivada de Llama 3.1 8B) |
| Parametros totales | 8.030.277.632 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (el modelo base Llama 3.1 8B soporta 128K, pero no se confirma en la ficha) |
| Tipos de cuantizacion | no disponible en la informacion proporcionada (pesos en safetensors; se asume compatibilidad con cuantizaciones estandar al derivar de Llama 3.1, pero no se declara) |
| Idiomas soportados | en (ingles) |
| Licencia | llama3.1 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un fine-tuning supervisado (SFT) del transformer decoder-only Llama 3.1 8B de Meta. No se documenta en la informacion disponible el uso de RLHF, DPO u otras etapas de alineacion posteriores al SFT, ni el numero exacto de tokens de entrenamiento. La model card identifica los datasets empleados en la mezcla de entrenamiento: OpenCoder-LLM/opc-sft-stage1 y opc-sft-stage2 para codigo, microsoft/orca-agentinstruct-1M-v1 para uso agéntico, microsoft/orca-math-word-problems-200k, AI-MO/NuminaMath-CoT y NuminaMath-TIR para matematicas, NousResearch/hermes-function-calling-v1 para function calling, allenai/tulu-3-sft-mixture y HuggingFaceTB/smoltalk para instrucciones generales, cognitivecomputations/dolphin-coder y dolphin-coder, m-a-p/CodeFeedback-Filtered-Instruction y Code-Feedback para codigo, y cognitivecomputations/samantha-data.

La innovacion principal no es arquitectonica sino de posicionamiento: el modelo esta disenado para ser "steerable", es decir, que el comportamiento y las directrices las define el propietario del sistema mediante el prompt de sistema, sin alineacion impuesta por el proveedor. El entrenamiento conto con infraestructura aportada por patrocinadores (16x L40s de Crusoe Cloud, 8x H100 de Akash, 16x H100 de Lazarus y servicios de inferencia de Cerebras para etiquetado de datos), segun la model card.

## Capacidades

- Generacion de texto conversacional multi-turno en ingles.
- Razonamiento general y respuesta a instrucciones (IFEval 76,21 en 0-shot segun el autor).
- Generacion y asistencia de codigo, con entrenamiento sobre datasets especificos de codigo (OpenCoder, CodeFeedback, dolphin-coder).
- Razonamiento matematico, incluyendo chain-of-thought (NuminaMath-CoT) y tool-integrated reasoning (NuminaMath-TIR).
- Function calling / tool calling, con entrenamiento sobre hermes-function-calling-v1.
- Capacidades agénticas y multi-step reasoning, con entrenamiento sobre orca-agentinstruct-1M-v1.
- Steerability: el comportamiento se controla mediante el prompt de sistema definido por el integrador.
- Capacidades multilingues: limitadas al ingles segun la etiqueta de idioma del modelo.
- Modo thinking explicito, vision o audio: no disponible en la informacion proporcionada.

## Casos de uso

- Asistente de codigo en local: el modelo puede integrarse en entornos de desarrollo o pipelines de CI/CD para generar, revisar y completar codigo, gracias a su entrenamiento sobre OpenCoder, CodeFeedback y dolphin-coder; su tamano de 8B permite ejecucion en hardware de gama alta de consumo con cuantizacion.
- Automatizacion de function calling: al estar entrenado sobre hermes-function-calling-v1, puede usarse como motor de un agente que invoque APIs y herramientas externas en flujos de automatizacion de negocio.
- Razonamiento matematico asistido: adecuado para tareas de resolucion de problemas paso a paso y calculo con trazas de razonamiento, apoyandose en el entrenamiento con NuminaMath-CoT y NuminaMath-TIR.
- Agentes multi-paso: su entrenamiento con orca-agentinstruct-1M-v1 lo hace util para orquestar tareas que requieren descomposicion en subtareas y uso de herramientas en secuencia.
- Despliegue on-premise con control de datos: para empresas que necesitan que las consultas no salgan de su infraestructura, el modelo puede servirse localmente sin depender de APIs de terceros, manteniendo el control del prompt de sistema y de la alineacion.
- Prototipado rapido de asistentes conversacionales en ingles: con 8B parametros y pesos safetensors, es viable desplegarlo en una sola GPU para pruebas de concepto y entornos de desarrollo.
- Sustitucion de modelos propietarios en productos con requisitos de estabilidad: al fijar una version concreta del modelo y su prompt de sistema, se evita que cambios silenciosos del proveedor rompan la aplicacion.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card (fuente: Open LLM Leaderboard). No estan verificados de forma independiente (`verified: false`).

| Benchmark | Configuracion | Metrica | Valor |
|---|---|---|---|
| IFEval | 0-shot | averaged accuracy | 76,21 |
| BBH | 3-shot | acc_norm | 27,63 |
| MATH Lvl 5 | 4-shot | exact_match | 10,5 |
| GPQA | 0-shot | acc_norm | 4,36 |
| MuSR | 0-shot | acc_norm | 8,97 |
| MMLU-PRO | 5-shot | accuracy | 22,13 |

No se han publicado en la informacion disponible resultados de HumanEval, GSM8K ni otros benchmarks adicionales.

## Requisitos de hardware

- VRAM estimada para inferencia: en precision completa (fp16/bf16) los 8.030 millones de parametros requieren aproximadamente 16 GB solo para pesos, mas overhead de KV cache y activaciones; en cuantizacion de 8 bits se reduce a unos 8-9 GB y en 4 bits a unos 5-6 GB (estimaciones derivadas del tamano, no declaradas por el autor).
- GPU recomendadas: A100, H100 o L40S para despliegue en produccion con throughput alto; RTX 4090 (24 GB) para fp16 en una sola tarjeta.
- Cabe en GPU de consumo: si, en RTX 4090 con fp16, y en tarjetas de 8-12 GB con cuantizacion de 4-8 bits (estimacion).
- Opciones de despliegue: al derivar de Llama 3.1 y publicarse en safetensors, es compatible con los runners habituales (vLLM, TGI, llama.cpp, Ollama) previa conversion a GGUF para los runners basados en llama.cpp; no se confirma en la informacion disponible una lista oficial de formatos publicados.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Enfoque |
|---|---|---|---|---|
| Dolphin3.0-Llama3.1-8B | 8,03B | no disponible | llama3.1 | Instruct generalista steerable, ingles |
| meta-llama/Llama-3.1-8B (base) | 8,03B | 128K (segun Meta) | llama3.1 | Modelo base sin fine-tuning instruct |
| Llama-3.1-8B-Instruct (Meta) | 8,03B | 128K (segun Meta) | llama3.1 | Instruct alineado por el proveedor |
| Mistral-7B-Instruct | ~7,2B | 32K (segun Mistral) | Apache 2.0 | Instruct generalista, licencia permisiva |

La comparacion de rendimiento con alternativas no esta disponible en la informacion proporcionada mas alla de los benchmarks declarados por el propio autor. La diferencia clave frente a Llama-3.1-8B-Instruct es el control de la alineacion por parte del integrador; frente a Mistral-7B-Instruct, la licencia Llama 3.1 es mas restrictiva que Apache 2.0.

## Limitaciones y advertencias

- Idiomas: el modelo esta etiquetado unicamente para ingles; el rendimiento en castellano u otros idiomas no esta garantizado y probablemente sea degradado.
- Riesgo de alucinacion: como todo modelo de 8B, puede generar contenido factualmente incorrecto, especialmente en tareas de conocimiento (MMLU-PRO 22,13 y GPQA 4,36 son valores bajos).
- Razonamiento complejo limitado: los resultados en BBH (27,63) y MuSR (8,97) indican un rendimiento modesto en tareas de razonamiento multi-paso y de sentido comun.
- Alineacion ausente por diseno: al no imponer directrices eticas, el modelo puede producir contenido inapropiado si el prompt de sistema no lo restringe; el integrador es responsable de definir las salvaguardas.
- Licencia Llama 3.1: el uso comercial esta sujeto a los terminos de la licencia de Meta, que incluyen restricciones (por ejemplo, la clausula de licencia adicional para empresas con mas de 700 millones de usuarios mensuales) y obligaciones de atribucion.
- Benchmarks no verificados: todos los resultados declarados en la model card tienen `verified: false`; deben tomarse como indicativos y no como mediciones independientes.
- Contexto: no se confirma en la informacion disponible la longitud de contexto efectiva del fine-tuning, aunque herede la del modelo base.
- Fecha de actualizacion del repo: 2026-11-21, posterior a la creacion (2024-12-29); conviene revisar si hubo cambios en los pesos.

## Enlaces

- Hugging Face: https://huggingface.co/dphn/Dolphin3.0-Llama3.1-8B
- Coleccion Dolphin 3.0: https://huggingface.co/collections/cognitivecomputations/dolphin-30-677ab47f73d7ff66743979a3
- Modelo base: https://huggingface.co/meta-llama/Llama-3.1-8B
- Open LLM Leaderboard (resultados declarados): https://huggingface.co/spaces/open-llm-leaderboard/open_llm_leaderboard#/?search=cognitivecomputations%2FDolphin3.0-Llama3.1-8B
- Discord de Cognitive Computations: https://discord.gg/cognitivecomputations
- Perfil de Eric Hartford: https://huggingface.co/ehartford
- Perfil de Ben Gitter: https://huggingface.co/bigstorm
- Perfil de BlouseJury: https://huggingface.co/BlouseJury
- Organizacion Cognitive Computations: https://huggingface.co/cognitivecomputations
