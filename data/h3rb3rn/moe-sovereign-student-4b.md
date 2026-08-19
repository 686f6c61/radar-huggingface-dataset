# h3rb3rn/moe-sovereign-student-4b

## Resumen

`moe-sovereign-student-4b` es un modelo de lenguaje pequeño (SLM) de 4 205 751 296 parámetros (~4,2B) desarrollado por el autor `h3rb3rn`, especializado en actuar como **meta-orquestador y compilador de flujos de trabajo** para sistemas de IA compuestos (Compound AI). En lugar de ser un chatbot genérico, su función es descomponer solicitudes en lenguaje natural en grafos acíclicos dirigidos (DAGs) de tareas ejecutables, seleccionar expertos de dominio especializados, parametrizar herramientas MCP (Model Context Protocol) y garantizar la conformidad con esquemas JSON estrictos.

El modelo está destilado a partir de DeepSeek-V3 y Qwen3-Planner-35B, y entrenado sobre el supercomputador LUMI-G (8× AMD Instinct MI250X 128GB) con el dataset `moe-sovereign/planner-orchestration-sft`. Su base es `Qwen/Qwen3.5-4B`, un modelo híbrido Mamba-Transformer según la información del autor. Está disponible en formato `safetensors` y `GGUF`, con licencia Apache 2.0, y soporta los idiomas inglés y alemán.

Su relevancia radica en la hipótesis "Sovereign": un modelo pequeño puede dirigir infraestructura determinista (herramientas, solvers, bases de conocimiento) sin necesidad de almacenar todo el conocimiento en sus pesos. Esto reduce la latencia y las alucinaciones en tareas de planificación multi-paso, al delegar el cálculo exacto a herramientas externas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Híbrida Mamba-Transformer (base Qwen3.5-4B) |
| Parametros totales | 4 205 751 296 (~4,2B) |
| Parametros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF (tipos no especificados) |
| Idiomas soportados | en, de |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors, GGUF |

## Arquitectura y entrenamiento

El modelo parte de `Qwen/Qwen3.5-4B`, que según la información del autor es un modelo híbrido que combina capas Mamba (state space model) con capas Transformer. Sobre esta base se realizó un proceso de destilación desde dos modelos de mayor tamaño: DeepSeek-V3 y Qwen3-Planner-35B. El entrenamiento se llevó a cabo en el supercomputador LUMI-G con 8 GPUs AMD Instinct MI250X de 128GB cada una, utilizando el dataset `moe-sovereign/planner-orchestration-sft`.

El objetivo del entrenamiento no es mejorar la generación de texto general, sino especializar el modelo en la compilación de flujos de trabajo: generar JSON estructurado que represente un DAG de tareas con dependencias, prioridades y contratos de ejecución. La model card indica que se aplicó un entrenamiento supervisado (SFT) con invariantes de esquema JSON, y no se menciona el uso de RLHF o DPO.

La innovación principal es el cambio de paradigma: en lugar de que un modelo grande responda directamente, este SLM actúa como compilador que orquesta un ecosistema de herramientas deterministas (65+ herramientas MCP, expertos de dominio de 4B, GraphRAG, etc.). Esto reduce la carga cognitiva del modelo y mejora la precisión en tareas que requieren cálculo exacto o razonamiento multi-paso.

## Capacidades

- **Compilación de DAGs de tareas**: descompone solicitudes complejas en arrays JSON con tareas, dependencias (`depends_on`), pesos de prioridad y contratos de ejecución.
- **Asignación de expertos de dominio**: enruta subtareas a especialistas de 4B (`code_reviewer`, `precision_tools`, `graphrag`, `governance`, `security`, `datainfra`, `research`, `omni`).
- **Parametrización de herramientas MCP**: extrae argumentos precisos para 65+ herramientas deterministas (por ejemplo, `subnet_calc`, `decimal_finance`, `ast_grep`, `z3_solve`), respetando sus esquemas de firma.
- **Conformidad estricta con esquemas JSON**: genera salidas sin ruido markdown fuera del array de tareas (99,7% de conformidad en la evaluación del autor).
- **Razonamiento multi-paso estructurado**: planifica entre 1 y 4 subtareas ejecutables, evitando sobre-planificación.
- **Soporte de tool calling**: integrado con MCP, lo que permite conectar el modelo a herramientas externas de forma estandarizada.
- **Multilingüe limitado**: soporta inglés y alemán.

## Casos de uso

- **Orquestación de pipelines de IA compuestos**: el modelo recibe una petición en lenguaje natural y genera un DAG JSON que un sistema externo ejecuta, invocando modelos especializados y herramientas MCP. Es adecuado porque su entrenamiento está orientado a esta tarea y produce salidas con alta conformidad de esquema.
- **Automatización de tareas de infraestructura de datos**: puede planificar subtareas como validación de esquemas, limpieza de datos y generación de informes, delegando la ejecución a herramientas deterministas (`datainfra` expert).
- **Revisión de código asistida**: el orquestador puede descomponer una solicitud de revisión en subtareas de análisis estático, linting y pruebas, asignándolas al experto `code_reviewer` y a herramientas como `ast_grep`.
- **Cálculos financieros precisos**: en lugar de que el modelo realice aritmética directamente, planifica el uso de herramientas de precisión decimal (`decimal_finance`) y solvers SMT (`z3_solve`) para evitar errores.
- **Seguridad y gobernanza**: puede orquestar tareas de auditoría de seguridad, generando planes de verificación y delegando a herramientas de análisis de subredes y contratos de linting.
- **Sistemas de agentes autónomos**: como meta-orquestador, puede integrarse en frameworks de agentes (por ejemplo, con MCP) para coordinar múltiples agentes especializados, manteniendo un control centralizado de la planificación.
- **Investigación y GraphRAG**: planifica consultas a grafos de conocimiento (Neo4j) y memoria episódica, combinando la recuperación con razonamiento estructurado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. El autor proporciona una evaluación en una suite propia de 1 000 tareas de planificación multi-paso, con los siguientes resultados comparados contra el modelo base Qwen 3.5 4B:

| Metrica | Base Qwen 3.5 4B | moe-sovereign-student-4b | Delta |
|---|---|---|---|
| Conformidad estricta con esquema JSON | 68,3 % | 99,7 % | +31,4 % |
| Validez de DAG ejecutable | 61,5 % | 97,8 % | +36,3 % |
| Precisión de enrutado a expertos | 59,2 % | 96,4 % | +37,2 % |
| F1 de parametrización de contratos MCP | 53,0 % | 95,1 % | +42,1 % |
| Ratio de sobre-planificación / pasos alucinados | 21,4 % | 1,8 % | -19,6 % |
| Latencia media de planificación (TTFT) | 1 420 ms | 185 ms | -87,0 % |

*Nota: evaluación a temperatura 0.0, 3 semillas independientes, latencia medida en una RTX 3060 12GB.*

Estos datos provienen de la model card del autor y no han sido verificados de forma independiente.

## Requisitos de hardware

- **VRAM estimada**: con 4,2B parámetros, en FP16 ocupa ~8,4 GB, en cuantización 4-bit ~2,1 GB. Puede ejecutarse en GPUs consumer con 8-12 GB de VRAM.
- **GPU recomendadas**: RTX 3060 12GB (usada en la evaluación del autor), RTX 4070, RTX 4090, o GPUs de datacenter como A10/A100 si se requiere mayor throughput.
- **Compatibilidad con consumer GPU**: sí, es viable en tarjetas de gama media con cuantización GGUF.
- **Opciones de despliegue**: al estar basado en transformers, puede servirse con vLLM, TGI, o llama.cpp/Ollama para los pesos GGUF. También es compatible con endpoints estándar de Hugging Face.
- **Latencia y throughput**: la latencia TTFT medida es de 185 ms en RTX 3060, lo que indica que es adecuado para aplicaciones en tiempo real. No se proporcionan datos de throughput.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la misma categoría (orquestadores de flujos de trabajo pequeños). Como referencia, se puede comparar con el modelo base:

| Modelo | Parametros | Contexto | Licencia | Enfoque |
|---|---|---|---|---|
| moe-sovereign-student-4b | 4,2B | no disponible | Apache 2.0 | Orquestador de DAGs, MCP, JSON estricto |
| Qwen3.5-4B (base) | ~4B | no disponible | Apache 2.0 | Chat general, generación de texto |
| DeepSeek-V3 (maestro) | 671B (MoE) | no disponible | MIT | Modelo general de gran escala |

La comparación con DeepSeek-V3 es solo contextual, ya que actúa como modelo profesor en la destilación.

## Limitaciones y advertencias

- **Especialización estrecha**: el modelo no es un chatbot de propósito general; está diseñado exclusivamente para compilar flujos de trabajo. Usarlo para otras tareas puede producir resultados pobres o alucinaciones.
- **Idiomas limitados**: solo soporta inglés y alemán; no se garantiza un comportamiento adecuado en otros idiomas.
- **Dependencia de herramientas externas**: su utilidad depende de la disponibilidad y correcta configuración de las herramientas MCP y expertos de dominio que orquesta. Sin ellas, el DAG generado no es ejecutable.
- **Riesgo de alucinación en tareas fuera de dominio**: aunque reduce la alucinación al delegar cálculos, puede inventar nombres de herramientas o parámetros si la solicitud no está bien definida.
- **Sesgos desconocidos**: no se han publicado evaluaciones de sesgo o robustez en escenarios adversarios.
- **Datos de evaluación no verificados**: los benchmarks presentados provienen del autor y no han sido replicados de forma independiente.
- **Restricciones de licencia**: Apache 2.0 permite uso comercial, pero se debe revisar la licencia del modelo base Qwen3.5-4B y de los datasets utilizados.

## Enlaces

- [Modelo en HuggingFace](https://huggingface.co/h3rb3rn/moe-sovereign-student-4b)
- [Dataset de entrenamiento: moe-sovereign/planner-orchestration-sft](https://huggingface.co/datasets/moe-sovereign/planner-orchestration-sft)
- [Supercomputador LUMI-G](https://www.lumi-supercomputer.eu/)
- [Modelo base: Qwen/Qwen3.5-4B](https://huggingface.co/Qwen/Qwen3.5-4B)
