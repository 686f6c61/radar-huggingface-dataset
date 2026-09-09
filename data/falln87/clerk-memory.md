# Falln87/clerk-memory

## Resumen

CLERK (Consolidated Ledger with Eviction and Rewrite Keys) es un adaptador LoRA sobre Qwen/Qwen2.5-0.5B-Instruct, desarrollado por Justin Wolcott (Falln87, fallnai-research.org). Resuelve el problema de la memoria a largo plazo en agentes conversacionales y aplicaciones multi-sesión mediante un mecanismo de consolidación en tiempo de escritura, entrenado con supervisión exacta en lugar de heuristicas basadas en prompts. La memoria se representa como un ledger JSON de slots atómicos; en cada frontera de sesión, una política entrenada lee el ledger y la transcripción de la sesión y emite un programa de edición estructurado —ADD, UPDATE, TOMBSTONE, EVICT— que un reducer determinista aplica. La lectura posterior cuesta un número fijo de tokens, independientemente de la longitud del historial, y la actualización de hechos obsoletos es explícita.

El modelo se presenta como un avance frente a sistemas como Mem0, Zep o CUPMem, que usan consolidación por prompts, y frente a políticas de memoria aprendidas que operan en tiempo de lectura, como Memory-T1 o MemAgent. También se distancia de memorias paramétricas opacas como RMT o Infini-attention: CLERK es interpretable, verificable por el reducer y se entrena a escala de LoRA. El modelo base es un transformer de 0,5B de parámetros; el adaptador LoRA se entrena mediante SFT con TRL y el repositorio incluye un pipeline completo de generacion de datos sinteticos, entrenamiento y evaluacion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA sobre transformer (Qwen/Qwen2.5-0.5B-Instruct) |
| Parametros totales | no disponible (modelo base 0,5B; adaptador LoRA no especificado) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (el adaptador no define un contexto propio; la lectura del ledger tiene coste O(budget) tokens) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | no disponible (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

CLERK mantiene la memoria como un ledger JSON de slots atómicos. En cada frontera de sesión, la política entrenada (implementada como adaptador LoRA sobre Qwen2.5-0.5B-Instruct) recibe el ledger actual y la transcripción de la sesión como entrada, y emite un programa de edición compuesto por operaciones `ADD`, `UPDATE` (que supersede un hecho previo), `TOMBSTONE` y `EVICT`. Un reducer determinista aplica este programa, lo que garantiza que el ledger resultante siempre sea expecifico y respete un presupuesto fijo de slots. Este diseño permite que la lectura del ledger cueste constantemente O(budget) tokens, sin importar la longitud acumulada de la historia.

El entrenamiento se realiza mediante SFT con LoRA, usando supervisión exacta generada programáticamente: un generador de sesiones sintéticas produce timelines de evolución y los estados dorados del ledger, de los que se derivan programas de edición correctos. La model card indica que el pipeline incluye un benchmark sintético y una evaluacion zero-shot en LoCoMo-MC10. El repositorio contiene scripts para la generacion de datos, construccion del dataset SFT, entrenamiento con TRL y evaluacion. El proceso completo se estima en 2-3 horas de GPU en una GPU de 16 GB (clase L4/A10G). No se proporcionan detalles sobre la composicion digital del dataset ni sobre la implementación de innovaciones como atención lineal o decodificacion especulativa.

## Capacidades

- Consolidacion de memoria en tiempo de escritura mediante un programa de edicion entrenado, no heuristicas basadas en prompts.
- Representacion interpretable de la memoria como ledger JSON de slots atómicos.
- Operaciones de edicion `ADD`, `UPDATE`, `TOMBSTONE` y `EVICT`, aplicadas por un reducer determinista.
- Supersesión explícita de hechos obsoletos en lugar de acumular texto ambiguo.
- Coste de lectura fijo O(budget) tokens, independientemente de la longitud del historial.
- Integracion con el modelo base Qwen2.5-0.5B-Instruct para responder preguntas sobre el ledger consolidado.
- No soporta vision ni audio; no se documentan capacidades de tool calling ni function calling adicionales.

## Casos de uso

- Asistentes personales multi-sesión: el agente puede recordar preferencias, citas y datos personales a lo largo de meses sin repetir preguntas ni exceder el presupuesto de contexto.
- Atencion al cliente automatizada: en tickets que se reanudan en diferentes sesiones, CLERK mantiene un ledger con el estado del cliente, los problemas resueltos y las decisiones tomadas, evitando lagunas graves.
- Agentes autonoma en tareas prolongadas: para proyectos que duran semanas o meses, el agente consolida decisiones, conexiones y tareas completadas en un formato estructurado, reduciendo el coste de memoria de forma constante.
- Historias clinicos o informes de salud: permite actualizar y retirar hechos obsoletos mediante `UPDATE` y `TOMBSTONE`, garantizando que el estado actual de una historia se refleja de forma explicita.
- Sistemas de recomendacion personalizada: la consolidacion de preferencias y comportamientos en un ledger con presupuesto fijo facilita el despliegue a largo plazo en entornos con recursos limitados.
- Investigacion y estudio asistido: un agente que consolida notas, referencias y conclusiones entre sesiones de lectura o escritura, manteniendo una vista interactiva y actualizable del conocimiento acumulado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card menciona la existencia de un benchmark sintetico (evaluacion de CLERK frente a prompted-ledger, full, window y RAG) y una evaluacion zero-shot en LoCoMo-MC10, pero no se proporcionan cifras concretas en la informacion recibida. Los resultados se remiten al paper y al directorio `results/` del repositorio.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo base Qwen2.5-0.5B-Instruct requiere aproximadamente 1 GB en FP16; el adaptador LoRA anade un overhead minimo. Se estima un total de 2-3 GB para una ejecucion comoda, sin cifras oficiales.
- GPU recomendadas: cualquier GPU con 8 GB de VRAM es suficiente para inferencia (por ejemplo, RTX 3060/4060, Apple Silicon). Para replicar el entrenamiento descrito se recomienda una GPU de 16 GB (clase L4/A10G).
- Compatibilidad con GPU consumer: si, es viable en GPUs de consumo gracias al pequeno tamano del modelo base.
- Opciones de despliegue: compatible con Transformers + PEFT para cargar el adaptador sobre el modelo base. No se documenta soporte explicio para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

CLERK pertenece a la categoria de sistemas de memoria para LLMs. La comparacion se centra en el enfoque arquitectonico y de entrenamiento, ya que no hay parametros publicados para las alternativas:

| Sistema / Enfoque | Consolidacion en escritura | Politica entrenada | Presupuesto fijo | Interpretable | Licencia |
|---|---|---|---|---|---|
| CLERK | Si | Si | Si | Si (ledger JSON + reducer) | Apache-2.0 |
| Mem0 | Si | No (prompt-heuristic) | No | No | no disponible |
| Zep | Si | No (heuristica) | No | Parcial | no disponible |
| CUPMem | Si | No (prompt-heuristic) | No | No | no disponible |
| Memory-T1 | No | Si | No | Parcial | no disponible |
| RMT / Infini-attention | No | Si | Si | No (memoria opaca) | no disponible |

La ventaja diferenciadora de CLERK es que entrena la politica de consolidacion en escritura con supervision exacta, en lugar de depender de prompts, y mantiene un presupuesto fijo con una representacion interpretable y verificable por el reducer.

## Limitaciones y advertencias

- Alucinacion y calidad de respuesta: el modelo base es de solo 0,5B de parametros, lo que limita su capacidad de razonamiento; una consolidacion erronea puede propagar hechos incorrectos al ledger.
- Generalizacion limitada: el entrenamiento se basa en transiciones sinteticas generadas programaticamente; el rendimiento en dominios reales con ruido, contradicciones o lenguaje ambiguo no esta validado.
- Dependencia del reducer externo: el reducer determinista no forma parte de los pesos del modelo; para desplegar CLERK es necesario implementar o incluir el codigo del reducer junto con el adaptador.
- Ausencia de benchmarks publicos: no se han publicado resultados cuantitativos en la informacion disponible, lo que impide una evaluacion independiente.
- Sin adopcion comunitaria: el modelo registra cero descargas y cero likes en HuggingFace, por lo que no existe feedback empirico de usuarios.
- Idiomas y contexto no documentados: no se especifican los idiomas soportados ni la longitud de contexto efectiva en el adaptador; la informacion disponible para produccion es limitada.
- Licencia Apache-2.0: permite uso comercial, pero el autor no ofrece garantias. El modelo base tambien es Apache-2.0, por lo que no hay restricciones adicionales conocidas.

## Enlaces

- Hugging Face: https://huggingface.co/Falln87/clerk-memory
- Perfil de HuggingFace de Falln87: https://huggingface.co/Falln87
- GitHub de FallnML: https://github.com/FallnML
- Coleccion de herramientas de desarrollo: https://huggingface.co/collections/Falln87/development-tools-6709ef2fc8370b3d5b95f900
