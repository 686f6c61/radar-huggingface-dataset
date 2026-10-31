# Nanbeige/Nanbeige4.3-33B-INT8

## Resumen

Nanbeige4.3-33B-INT8 es la versión cuantizada a INT8 del modelo Nanbeige4.3-33B, desarrollado por el equipo Nanbeige. Se trata de un modelo de lenguaje de 33.118.977.024 parámetros (dato real extraído de los safetensors) construido sobre la arquitectura Llama y orientado a tareas agénticas: programación en entornos de terminal, uso de herramientas y tareas de colaboración profesional ("cowork"). El equipo Nanbeige lo posiciona como modelo "profesor" insignia de la serie 4.3, destinado también a servir de base para destilar capacidades agénticas en modelos más pequeños (como el anunciado Nanbeige4.3-3B).

Su relevancia actual radica en el rendimiento que el autor reporta frente a otros modelos abiertos de la clase de ~30B parámetros (Qwen3.8-27B, Muse-Glimmer-30B y Gemma4-31B), donde lidera en la mayoría de benchmarks agénticos de código y colaboración. La versión INT8 reduce el tamaño de despliegue respecto al BF16 original (repo de 36,0 GB), facilitando su ejecución en hardware de gama alta sin recurrir a cuantizaciones más agresivas con mayor pérdida de precisión.

Está publicado bajo licencia Apache-2.0, soporta inglés y chino, e incluye una plantilla de chat configurable con modos de razonamiento (`enable_thinking`) y de conservación del razonamiento en conversaciones multi-turno (`preserve_thinking`).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer tipo Llama (decoder-only) |
| Parametros totales | 33.118.977.024 (≈33,1B) |
| Parametros activos | no disponible (no se indica arquitectura MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | INT8 (compressed-tensors); base disponible en BF16 |
| Idiomas soportados | Ingles y chino |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (compressed-tensors) |

## Arquitectura y entrenamiento

El modelo parte de la arquitectura Llama (según las etiquetas del repositorio) en su variante densa de 33B, de la cual esta ficha describe la versión cuantizada a INT8 mediante el esquema compressed-tensors, compatible con librerias de inferencia como vLLM. La model card no detalla el numero de capas, dimensiones ocultas ni mecanismos de atencion especificos.

Respecto al entrenamiento, la informacion disponible no incluye el numero de tokens, la composicion del dataset ni los metodos de alineamiento (SFT, RLHF, DPO). Lo que si describe la model card es la estrategia de la serie Nanbeige4.3: construir primero un modelo profesor de alta capacidad agéntica (este 33B) y posteriormente destilar sus capacidades en modelos mas pequenos. Las evaluaciones se realizan con `preserve_thinking=true` en la plantilla de chat y con el maximo esfuerzo de razonamiento, lo que indica que el modelo incorpora un modo de razonamiento explícito (thinking mode) integrado en su chat template.

## Capacidades

- Generacion de texto conversacional en ingles y chino, con plantilla de chat configurable.
- Razonamiento con modo thinking activable mediante `enable_thinking` (activado por defecto), con resultados destacables en GPQA Diamond (89,5), AIME 2026 (95,2) y AA-LCR (84,0).
- Codigo agéntico: resolucion de tareas en terminal (Terminal-Bench 2.1: 80,9), ingenieria de software autonomo (DeepSWE: 65,5; SWE-Bench Pro: 60,3) y generacion de repositorios (NL2Repo: 53,0).
- Tareas de cowork y oficina: Automation Bench (54,2), JobBench (44,8), Toolathlon-Verified (70,4) y DeepPlanning (63,3).
- Uso de herramientas (tool calling): la plantilla de tokenizador incluye escenarios de tool-use y las evaluaciones se realizan con harnesses de agentes como mini-swe-agent, Claude Code y Terminus 2.
- Conversaciones multi-turno con control del razonamiento previo (`preserve_thinking`), recomendado en `True` para flujos agénticos multi-paso y en `False` para chat general.
- Matematicas y ciencia: Scicode (52,6) y AIME 2026 (95,2) indican capacidad solida en razonamiento cuantitativo.

## Casos de uso

- Agentes de programacion en terminal: el modelo puede integrarse en harnesses tipo mini-swe-agent o Terminus 2 para ejecutar tareas de desarrollo autonomo; sus 80,9 en Terminal-Bench 2.1 lo hacen adecuado para pipelines de resolucion de issues y refactoring.
- Integracion en pipelines de CI/CD: dado su rendimiento en SWE-Bench Pro (60,3) y NL2Repo (53,0), puede emplearse para generar, revisar y corregir codigo de forma automatica dentro de flujos de integracion continua.
- Automatizacion de tareas de oficina: benchmarks como Automation Bench (54,2) y JobBench (44,8) reflejan su capacidad para ejecutar tareas administrativas multi-paso con herramientas externas.
- Asistentes de atencion al cliente con herramientas: el control fino del razonamiento multi-turno (`preserve_thinking=False` para chat general) permite desplegar chatbots que combinan conversacion natural con llamadas a APIs.
- Planificacion y orquestacion de agentes: DeepPlanning (63,3) y Tau3-Bench (48,8) sugieren buen desempeno en descomposicion de tareas complejas y coordinacion multi-paso.
- Razonamiento matematico y cientifico: con 95,2 en AIME 2026 y 89,5 en GPQA Diamond, es util como asistente para resolucion de problemas de nivel competicion y consultas tecnicas de nivel posgrado.
- Despliegue en produccion con recursos contenidos: la version INT8 reduce la huella de memoria a ~33 GB de pesos, permitiendo servir el modelo en una sola GPU de 48 GB con frameworks como vLLM.

## Benchmarks y rendimiento

Resultados publicados por el autor (en BF16, con maximo esfuerzo de razonamiento; la version INT8 puede presentar ligeras diferencias):

| Benchmark | Nanbeige4.3-33B | Qwen3.8-27B | Muse-Glimmer-30B | Gemma4-31B |
|---|---|---|---|---|
| Terminal-Bench 2.1 | **80,9** | 73,0 | 61,8 | 47,2 |
| Terminal-Bench 4.0 | **23,8** | 6,3 | 1,6 | 0,0 |
| DeepSWE | **65,5** | 42,5 | 4,4 | 2,7 |
| SWE-Bench Pro | 60,3 | **61,7** | 51,2 | 36,9 |
| SWE-Atlas-QnA | **50,8** | 41,9 | 17,7 | 3,3 |
| NL2Repo | **53,0** | 48,3 | 27,4 | 33,8 |
| Scicode | **52,6** | 46,7 | 44,9 | 45,5 |
| SkillsBench | **61,1** | 56,4 | 39,7 | 28,9 |
| Automation Bench | **54,2** | 38,3 | 15,2 | 9,7 |
| JobBench | **44,8** | 34,5 | 16,6 | 9,0 |
| GDPval | 84,8 | **86,4** | 75,8 | 71,4 |
| Claw-Eval (pass^3) | **78,3** | 75,2 | 57,3 | 44,2 |
| Toolathlon-Verified | **70,4** | 68,5 | 47,2 | 27,8 |
| DeepPlanning | **63,3** | 49,2 | 21,4 | 19,4 |
| EnterpriseOps-Gym | **41,0** | 40,2 | 30,5 | 27,3 |
| YC-bench | **$1.025.437** | $641.290 | $513.978 | $265.152 |
| Tau3-Bench | **48,8** | 48,5 | 33,7 | 18,6 |
| GPQA Diamond | 89,5 | 89,2 | 83,5 | **91,3** |
| AIME 2026 | **95,2** | 94,5 | 94,7 | 89,2 |
| AA-LCR | **84,0** | 82,0 | 83,3 | 72,0 |

## Requisitos de hardware

- VRAM estimada para inferencia: los pesos INT8 ocupan aproximadamente 33 GB; con overhead de activaciones, KV cache y contexto, se recomienda al menos 40-48 GB de VRAM (mas si se usan contextos largos).
- GPU recomendadas: NVIDIA A100 40 GB (ajustado, con contexto limitado), A100 80 GB, H100 80 GB o L40S 48 GB.
- Consumer GPUs: no cabe en una sola RTX 4090 (24 GB) ni RTX 5090 (32 GB) en INT8. Opciones viables: dos RTX 4090 en paralelo con sharding (por ejemplo, via vLLM con tensor parallelism) o una RTX 6000 Ada/Pro de 48 GB.
- Despliegue: compatible con transformers (libreria del repo) y con el esquema compressed-tensors, lo que lo hace apto para vLLM. No se menciona soporte oficial para llama.cpp, Ollama o TGI en la model card.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Cuantizacion | Licencia | Fortaleza principal |
|---|---|---|---|---|
| Nanbeige4.3-33B-INT8 | 33,1B | INT8 (esta ficha) / BF16 (base) | Apache-2.0 | Tareas agénticas de codigo y cowork |
| Qwen3.8-27B | 27B | BF16 (evaluado) | no disponible | Equilibrado; lider en SWE-Bench Pro y GDPval |
| Muse-Glimmer-30B | 30B | BF16 (evaluado) | no disponible | Razonamiento competitivo en AIME 2026 (94,7) |
| Gemma4-31B | 31B | BF16 (evaluado) | no disponible | Mejor en GPQA Diamond (91,3) |

Nanbeige4.3-33B lidera en 17 de los 20 benchmarks reportados frente a estas alternativas, con ventajas especialmente marcadas en Terminal-Bench 4.0, DeepSWE y Automation Bench. Las licencias de los competidores no constan en la informacion disponible.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados en la model card; al ser un modelo entrenado principalmente con ingles y chino, puede mostrar sesgos lingüisticos y culturales hacia esos dos idiomas.
- Riesgo de alucinacion: no cuantificado por el autor; como todo LLM, puede generar informacion incorrecta con fluidez, especialmente fuera de dominios tecnicos.
- Limitaciones de idioma: solo se declara soporte oficial de ingles y chino; el desempeno en castellano u otros idiomas no esta evaluado ni garantizado.
- Limitaciones de contexto: la longitud de ventana de contexto no esta publicada en la informacion disponible, lo que dificulta planificar cargas de trabajo con documentos largos.
- Licencia: Apache-2.0 permite uso comercial, pero conviene revisar los terminos de los modelos comparados si se plantean alternativas.
- La version INT8 puede presentar una pequena degradacion de precision respecto a los resultados BF16 publicados; los benchmarks oficiales corresponden al modelo en BF16.
- El modo thinking activado por defecto genera tokens de razonamiento adicionales, aumentando latencia y consumo de tokens; desactivarlo (`enable_thinking=False`) es recomendable en casos de chat simple.
- Descargas muy bajas (0 en el momento de redaccion) y comunidad reducida: menor madurez de ecosistema, documentacion y soporte frente a alternativas como Qwen o Gemma.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Nanbeige/Nanbeige4.3-33B-INT8
- Modelo base (BF16): https://huggingface.co/Nanbeige/Nanbeige4.3-33B
- Perfil del autor: https://huggingface.co/Nanbeige
- Paper, blog oficial y repositorio de codigo: no disponibles en la informacion proporcionada.
