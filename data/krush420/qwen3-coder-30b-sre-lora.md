# krush420/qwen3-coder-30b-sre-lora

## Resumen

`qwen3-coder-30b-sre-lora` es un adaptador LoRA (PEFT) desarrollado por el usuario `krush420` sobre el modelo base `Qwen/Qwen3-Coder-30B-A3B-Instruct`. Su objetivo es especializar un modelo MoE de gran tamano en tareas de fiabilidad de sistemas (SRE): auditoría de código ancorada en AST, síntesis de código con el enfoque que el autor denomina "Lego-First" y ejecución de tool-calling multi-turno a través de un gateway MCP con 39 herramientas anotadas. El adaptador forma parte del ecosistema propietario del autor, KruschStack, y está pensado como el especialista local `L2` dentro de un enrutador en cascada.

El adaptador en sí es pequeno: 13,37 millones de parámetros en formato safetensors, con un repositorio de 0,2 GB. El modelo base sobre el que se aplica es un transformer de mezcla de expertos (MoE) con 30B parámetros totales y aproximadamente 3,3B activos por token, según declara el autor en la model card. La licencia del adaptador es Apache 2.0, aunque el uso comercial efectivo depende también de la licencia del modelo base.

La relevancia de esta ficha es doble: por un lado, documenta un caso concreto de especialización de un modelo de código mediante SFT y DPO con destilación desde un profesor de 120B; por otro, ilustra las limitaciones de los adaptadores publicados con benchmarks autoinformados y no verificados, que deben interpretarse con cautela antes de llevarlos a producción.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre transformer MoE; modelo base Qwen3-Coder-30B-A3B-Instruct |
| Parametros totales | 13.369.344 (adaptador); modelo base 30B (MoE) |
| Parametros activos | ~3,3B en el modelo base (dato declarado por el autor) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el repo incluye safetensors y GGUF) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors, GGUF |

## Arquitectura y entrenamiento

El adaptador se entrena sobre `Qwen/Qwen3-Coder-30B-A3B-Instruct`, un transformer de mezcla de expertos con 30B parámetros totales y unos 3,3B activos. El adaptador LoRA en sí contiene 13,37M parámetros, lo que corresponde a un rango bajo aplicado a un subconjunto de capas; el autor no detalla en la información disponible qué módulos se adaptan ni el rango exacto de LoRA.

El entrenamiento combina SFT y DPO en dos etapas. La primera etapa es un SFT sobre el dataset `krush420/sovereign-code-audit-sft`, que el autor describe como 18.131 registros sin fuga de datos repartidos en 7 splits, con un split `elitist_120b_teacher` generado por destilación desde un profesor de 120B. La segunda etapa es un DPO con anclaje KL (`KL-Anchored DPO`) para ajustar preferencias. El autor declara una precisión de preferencias del 100 % en la etapa DPO y una precisión de tokens del 93,36 % en el seed de auditoría de código. No se especifican el número de tokens de entrenamiento totales, la composición exacta del dataset ni los hiperparámetros.

Como innovaciones técnicas declaradas, el autor menciona la combinación de auditoría de código ancorada en AST, síntesis "Lego-First" mediante `@krusch/toolkit`, tool-calling multi-turno sobre MCP y un `Modelfile` neutral respecto al rol. No se documentan técnicas de decodificación especulativa ni atención lineal.

## Capacidades

- Generación de texto y razonamiento sobre código, orientada a auditoría y remediación de bugs.
- Auditoría de código ancorada en AST (análisis de árboles sintácticos abstractos) con calibración de severidad P0/P1 según el autor.
- Tool calling y function calling sobre un gateway MCP con 39 herramientas anotadas.
- Ejecución de herramientas simuladas en aplicaciones y razonamiento multi-paso dentro de un arnés agéntico.
- Memoria conversacional multi-turno y recuperación de información a escalas declaradas de 100K a 10M tokens (benchmark BEAM).
- Síntesis de código con el enfoque "Lego-First" del ecosistema KruschStack.
- Capacidades multilingües: no disponibles en la información proporcionada.
- Modo thinking, visión o audio: no disponibles.

## Casos de uso

- Auditoría de código en CI/CD: el adaptador puede integrarse en un pipeline que analice diffs o repositorios completos y emita informes con severidad calibrada (P0/P1), usando el modelo base para el razonamiento sobre AST y el adaptador para el formato y los criterios de auditoría.
- Remediación automática de bugs: dado un hallazgo de auditoría, el modelo puede proponer parches concretos y verificar su consistencia mediante tool calling contra el gateway MCP.
- Agente SRE de guardia: el adaptador está disenado para razonar sobre salidas estructuradas de herramientas (logs, métricas, estado de servicios) y encadenar acciones multi-paso, lo que encaja en un flujo de respuesta a incidentes.
- Enrutador en cascada local: como especialista `L2` dentro de `krusch-cascade-router`, puede atender consultas de código y SRE en local con coste de inferencia cero, derivando a un modelo mayor solo los casos complejos.
- Asistente de operaciones con MCP: con 39 herramientas anotadas, puede gestionar tareas de workspace (ficheros, repositorios, ejecución de comandos) en un entorno controlado.
- Memoria conversacional de largo plazo: para asistentes que necesitan recordar contexto de conversaciones extensas, el autor declara recall del 92,58 % en el split 100K de BEAM y del 93 % en extracción de información a 10M.
- Evaluación comparativa de adaptadores: útil como referencia para investigar el efecto de SFT + DPO con destilación desde un profesor mayor sobre un MoE de código.

## Benchmarks y rendimiento

Datos declarados por el autor en el model-index. Ninguno está verificado de forma independiente.

| Benchmark | Metrica | Valor | Notas |
|---|---|---|---|
| DolphinBench (600 tareas, 1,5M tokens, juez gpt-5.6-sol) | Pass rate oficial | 42,67 % (256/600) | Frente a 42,00 % (252/600) del Qwen3-Coder-30B-A3B-Instruct stock, según el autor |
| DolphinBench | Comprobaciones mecánicas deterministas | 85,73 % (1.123/1.310) | Verificado: false |
| Sovereign Code Audit (split elitist_120b_teacher) | Precisión de preferencias DPO con anclaje KL | 100 % | Verificado: false |
| Sovereign Code Audit | Precisión de tokens en seed de auditoría | 93,36 % | Verificado: false |
| BEAM (split 100K, n=2.000) | Recall estricto de turno primario (9 categorías) | 92,58 % | Verificado: false |
| BEAM (split 10M) | Recall de extracción de información | 93,00 % | Verificado: false |

No se han publicado resultados de MMLU, HumanEval, GSM8K ni otros benchmarks estándar en la información disponible.

## Requisitos de hardware

- El adaptador LoRA ocupa 0,2 GB en disco; el requisito real lo marca el modelo base Qwen3-Coder-30B-A3B-Instruct.
- Con cuantización de 4 bits, el modelo base MoE de 30B requiere aproximadamente 18-20 GB de VRAM, además de overhead para contexto y KV cache; con 8 bits, en torno a 32-35 GB.
- GPU recomendadas para el modelo base: A100 80GB o H100 para precisión completa o FP8; RTX 4090 (24 GB) o RTX 3090 (24 GB) para cuantización 4 bits con contexto moderado.
- Cabe en GPU de consumo (RTX 4090, 3090) solo con cuantización de 4 bits y contextos limitados; no cabe en GPU de 16 GB o menos sin offloading.
- Opciones de despliegue: vLLM y TGI para el modelo base con el adaptador cargado; llama.cpp u Ollama para la variante GGUF; transformers + PEFT para cargar el adaptador sobre el base.
- Latencia y throughput: no disponibles. Al ser un MoE con ~3,3B parámetros activos, el coste por token es inferior al de un denso de 30B, pero no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento declarado | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| qwen3-coder-30b-sre-lora (este) | 13,37M adaptador sobre MoE 30B | no disponible | DolphinBench 42,67 % (autoinformado) | Apache 2.0 | Hugging Face |
| Qwen/Qwen3-Coder-30B-A3B-Instruct | MoE 30B (~3,3B activos) | no disponible | DolphinBench 42,00 % (según el autor) | Apache 2.0 (según modelo base) | Hugging Face |
| krush420/gpt-oss-120b-sre-lora | adaptador sobre gpt-oss-120b | no disponible | no disponible | no disponible | Hugging Face |
| krush420/llama3-hermes3-8b-sre-lora | adaptador sobre Llama 3 8B | no disponible | no disponible | no disponible | Hugging Face |

La comparación con el modelo base es la más informativa: la mejora declarada en DolphinBench es de 0,67 puntos porcentuales (4 tareas de 600), un margen que no se ha validado de forma independiente. Los otros dos adaptadores del mismo autor pertenecen a la misma familia y comparten enfoque, pero no hay datos públicos comparables.

## Limitaciones y advertencias

- Todos los benchmarks del model-index están marcados como `verified: false`; proceden de registros de auditoría internos del autor y no de una evaluación independiente.
- La mejora sobre el modelo base en DolphinBench es de 4 tareas sobre 600 (0,67 pp), un margen dentro del ruido estadístico razonable; no debe interpretarse como una mejora robusta sin replicación.
- El adaptador está fuertemente acoplado al ecosistema KruschStack (gateway MCP de 39 herramientas, `@krusch/toolkit`, `krusch-cascade-router`); fuera de ese entorno su ventaja frente al modelo base es incierta.
- No se documentan sesgos conocidos, composición del dataset de entrenamiento ni filtros de seguridad; el dataset se describe como "sin fuga de datos" pero no hay auditoría externa.
- Riesgo de alucinación: no evaluado de forma independiente. En tareas de auditoría de código, una alucinación puede traducirse en falsos positivos o en parches incorrectos.
- Idiomas soportados no disponibles; el entrenamiento parece centrado en inglés técnico.
- Longitud de contexto no disponible; las afirmaciones sobre memoria a 10M tokens dependen de un lector externo (`KruschStack L2 Reader`) y no del adaptador por sí solo.
- Licencia Apache 2.0 en el adaptador, pero el uso comercial está sujeto también a la licencia del modelo base Qwen3-Coder-30B-A3B-Instruct.
- El repositorio tiene 88 descargas y 0 likes en el momento de la consulta; no hay evidencia de adopción ni de validación por terceros.
- El autor no publica hiperparámetros de entrenamiento, composición exacta del dataset ni código de reproducción del pipeline.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/krush420/qwen3-coder-30b-sre-lora
- Modelo base: https://huggingface.co/Qwen/Qwen3-Coder-30B-A3B-Instruct
- Dataset de entrenamiento: https://huggingface.co/datasets/krush420/sovereign-code-audit-sft
- Registros de benchmarks: https://huggingface.co/datasets/krush420/sovereign-g4-benchmarks
- Repositorio KruschStack: https://github.com/kruschdev/krusch-stack
- Repositorio Jean SRE: https://github.com/kruschdev/Jean-SRE-by-kruschdev
- Adaptador companion 8B: https://huggingface.co/krush420/llama3-hermes3-8b-sre-lora
- Adaptador companion 120B: https://huggingface.co/krush420/gpt-oss-120b-sre-lora
- DolphinBench: https://dolphinbench.ai/
