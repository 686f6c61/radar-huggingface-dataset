# shafire/OpenZero-Ouroboros-3.8B-GGUF

## Resumen

OpenZero Ouroboros 3.8B es un modelo de lenguaje experimental derivado de `microsoft/Phi-4-mini-instruct` mediante un ajuste fino QLoRA de dos pasos, distribuido como un único archivo GGUF cuantizado en Q4_K_M para su ejecución local con `llama.cpp`, LM Studio, KoboldCpp y otros runtime compatibles. El autor, `shafire`, lo presenta como un ejercicio de reproducibilidad y trazabilidad: incluye hashes del dataset, del adaptador, de la fusión FP16 y del propio GGUF, así como un registro de inferencia real con `llama-cli`. No se trata de un modelo orientado a producción, sino de una pieza para experimentación en razonamiento local, orquestación de agentes y estudios de reproducibilidad de pipelines QLoRA.

Con 3.836.021.856 parámetros, el modelo conserva la arquitectura transformer de Phi-4 Mini y su capacidad de instrucción, aunque la longitud de contexto no se especifica en la información disponible (hereda la del modelo base, pero no se confirma). Su relevancia radica en ofrecer un punto de comparación verificable contra el Phi-4 Mini oficial, con un peso de solo 2,5 GB que permite ejecutarlo en hardware modesto. La licencia MIT facilita su uso comercial y de investigación sin restricciones adicionales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (Phi-4 Mini) |
| Parametros totales | 3.836.021.856 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (hereda de Phi-4-mini-instruct, no confirmada) |
| Tipos de cuantizacion | Q4_K_M (unico archivo GGUF) |
| Idiomas soportados | ingles |
| Licencia | MIT |
| Formato de pesos | GGUF (tambien safetensors en el modelo base, pero este repo solo contiene GGUF) |

## Arquitectura y entrenamiento

El modelo parte de `microsoft/Phi-4-mini-instruct` en una revisión exacta fijada (`cfbefacb99257ffa30c83adab238a50856ac3083`). El entrenamiento consistió en un ajuste fino QLoRA de dos pasos (smoke test) con 2.452 registros de entrenamiento y 130 de validación, sin solapamiento exacto entre ambos conjuntos (verificado mediante hashes). La pérdida final registrada fue de 1,948. No se aplicaron técnicas de RLHF ni DPO; el proceso se limitó a una fusión FP16 con `safe_merge=True` y posterior cuantización a Q4_K_M. La innovación principal no está en la arquitectura, sino en el flujo de reproducibilidad: se documentan hashes de todos los artefactos, se excluyen fuentes contaminadas (fusiones, salidas de profesor, evaluaciones bloqueadas, etc.) y se incluye un puntero de rollback. El autor declara explícitamente que el modelo no se auto-modifica ni reemplaza sus pesos base.

## Capacidades

- Generacion de texto y seguimiento de instrucciones, heredadas de Phi-4 Mini Instruct.
- Razonamiento basico y explicacion de pasos, segun el ejemplo de la model card.
- Soporte de function calling / tool calling, segun los tags del repositorio.
- Orquestacion de agentes (agentic AI) en prototipos, con validacion externa recomendada.
- Ejecucion local en CPU o GPU mediante runtime GGUF (llama.cpp, LM Studio, KoboldCpp).
- Capacidades multilingues: no, solo ingles declarado.

No se proporcionan resultados de benchmarks que demuestren el nivel real de estas capacidades; el propio autor advierte que la mejora material no está establecida.

## Casos de uso

- Experimentacion local con LLMs: permite probar un derivado de Phi-4 Mini en un entorno aislado, sin dependencias de API, gracias a su tamano reducido y formato GGUF.
- Investigacion en razonamiento e instrucciones: util para comparar el comportamiento de un modelo ajustado con QLoRA frente a su base oficial en tareas de razonamiento paso a paso.
- Prototipos de agentes con validacion externa: puede integrarse en pipelines de orquestacion donde las acciones del agente se validan mediante esquemas tipados o controladores deterministas, tal como sugiere la model card.
- Estudios de reproducibilidad de QLoRA: al incluir hashes y registros de entrenamiento, sirve como caso de estudio para auditar pipelines de ajuste fino y cuantizacion.
- Comparacion con Phi-4 Mini base: permite medir el impacto de un ajuste QLoRA minimo sobre el rendimiento en tareas especificas, usando el mismo runtime y cuantizacion.
- Despliegue en entornos sin GPU: con un peso de 2,5 GB y soporte CPU, puede ejecutarse en portatiles o servidores sin aceleracion grafica, a velocidades moderadas (5,2 tokens/s de generacion en CPU registrado).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La seccion `model-index` de la model card aparece vacia (`results: []`). El autor no aporta metricas de MMLU, HumanEval, GSM8K ni similares, y advierte que el modelo no debe considerarse superior a su base sin evaluacion independiente.

## Requisitos de hardware

- VRAM estimada: el archivo Q4_K_M ocupa 2.493.840.128 bytes (~2,5 GB). Con overhead de runtime, se recomienda al menos 4 GB de VRAM para GPU, aunque tambien puede ejecutarse en CPU pura.
- GPU recomendadas: cualquier GPU con 4 GB o mas de VRAM (por ejemplo, GTX 1650, RTX 3050, RTX 4060, etc.). No requiere GPU de datacenter.
- Compatibilidad con consumer GPU: si, es el caso de uso principal.
- Opciones de despliegue: llama.cpp (con `-ngl` para offload a GPU), LM Studio, KoboldCpp, y cualquier runtime compatible con GGUF.
- Rendimiento registrado: en una CPU Kaggle (sin GPU), el autor midio 12,2 tokens/s de prompt y 5,2 tokens/s de generacion. En GPU se espera un throughput mayor, aunque no se proporcionan cifras.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| OpenZero Ouroboros 3.8B (este) | 3,8B | no disponible | MIT | GGUF Q4_K_M | Derivado QLoRA de Phi-4 Mini, sin benchmarks |
| microsoft/Phi-4-mini-instruct | 3,8B | no disponible (oficialmente 128k, no confirmado aqui) | MIT | safetensors | Modelo base oficial, sin cuantizar |
| shafire/OpenZero-Ministral3-8B-Runtime-Agent-GGUF | 8B | no disponible | no disponible | GGUF Q5_K_M | Otro GGUF de OpenZero, basado en Ministral 3 8B |
| shafire/Zero-Qwen3-8B-OpenZero-GGUF | 8B | no disponible | no disponible | GGUF | Otro GGUF de OpenZero, basado en Qwen3 8B |

No se dispone de datos de rendimiento comparativo entre estos modelos. La comparativa se limita a aspectos estructurales y de disponibilidad.

## Limitaciones y advertencias

- El entrenamiento fue un smoke test de dos pasos QLoRA; no se ha demostrado una mejora material de capacidades respecto al modelo base.
- El modelo base obtuvo 0/10 en una suite de control tipado de OpenZero, segun la model card, por lo que este derivado requiere evaluacion independiente antes de cualquier uso serio.
- Riesgo de alucinacion en hechos, acciones, herramientas y estados de completitud, como cualquier LLM.
- No debe conectarse directamente a actuadores de seguridad; se requieren esquemas tipados, controladores deterministicos, autorizacion, limites, monitorizacion y mecanismos de parada de emergencia.
- Solo se distribuye en cuantizacion Q4_K_M; no hay versiones en otras precisiones (FP16, Q8, etc.) en este repositorio.
- Idioma limitado a ingles; no se garantiza un rendimiento adecuado en otros idiomas.
- La licencia MIT permite uso comercial, pero el autor declara que no hay respaldo institucional (MOD, UKRI, Microsoft, OpenAI, etc.).

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/shafire/OpenZero-Ouroboros-3.8B-GGUF
- OpenZero Ministral 3 8B Runtime Agent GGUF: https://huggingface.co/shafire/OpenZero-Ministral3-8B-Runtime-Agent-GGUF
- shafire/Zero-Qwen3-8B-OpenZero-GGUF: https://huggingface.co/shafire/Zero-Qwen3-8B-OpenZero-GGUF
- Modelo base (referencia): https://huggingface.co/microsoft/Phi-4-mini-instruct
