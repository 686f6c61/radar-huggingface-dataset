# baerquants/OpenThinker-Agent-v1-SFT

## Resumen

OpenThinker-Agent-v1-SFT es un modelo de 8.000 millones de parámetros especializado en tareas de agente, desarrollado por el proyecto OpenThoughts y publicado originalmente bajo el identificador `open-thoughts/OpenThinker-Agent-v1-SFT`. La ficha analizada corresponde a una recarga del mismo checkpoint realizada por el usuario `baerquants` en HuggingFace. El modelo parte de `Qwen/Qwen3-8B` y se ha ajustado mediante supervisión fina (SFT) sobre el conjunto de datos OpenThoughts-Agent-v1-SFT, compuesto por aproximadamente 15.200 trazas de agente generadas por profesores fuertes.

El objetivo del modelo es ejecutar tareas agénticas de terminal e ingeniería de software: formatear comandos de shell, resolver bugs en repositorios reales, operar herramientas y encadenar pasos multi-turno. Es la etapa intermedia de una pipeline de dos fases; la versión final, `OpenThinker-Agent-v1`, añade un entrenamiento por refuerzo sobre OpenThoughts-Agent-v1-RL.

Su relevancia actual radica en que demuestra que un modelo de 8B puede obtener mejoras sustanciales en Terminal-Bench 2.0 y SWE-Bench Verified frente a su base Qwen3-8B mediante datos de agente curados y filtrados, con licencia Apache 2.0 y pesos en safetensors compatibles con transformers 4.56.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (derivado de Qwen3-8B); no disponible el detalle de capas y cabezas en la informacion proporcionada |
| Parametros totales | 308.224 según los metadatos de safetensors del repositorio; este valor parece corresponder al recuento de tensores y no al número de parámetros. El modelo base Qwen3-8B declara aproximadamente 8.200 millones de parámetros; no disponible el desglose oficial para este checkpoint |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada. El modelo base Qwen3-8B opera con 32.768 tokens nativos, ampliables a 131.072 mediante YaRN |
| Tipos de cuantizacion | No disponible; los pesos se distribuyen en safetensors sin cuantizar. Existen cuantizaciones GGUF, AWQ y GPTQ de terceros para el modelo base, no publicadas por este repositorio |
| Idiomas soportados | No disponibles (campo vacío en la ficha de HuggingFace). Los datos de entrenamiento son mayoritariamente en inglés |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors, librería transformers |

## Arquitectura y entrenamiento

La arquitectura es la de Qwen3-8B: un transformer denso con atención completa, entrenado en origen por el equipo de Qwen. Sobre esa base, OpenThoughts aplica un ajuste supervisado fino. Los hiperparámetros declarados son: learning rate 4e-05, scheduler coseno con warmup del 10 %, 7 épocas, semilla 42, optimizador AdamW con betas (0,9; 0,98) y epsilon 1e-08, batch total de 16 con 16 dispositivos (batch por dispositivo de 1) y batch de evaluación de 128. El entrenamiento se realizó con Transformers 4.56.0, PyTorch 2.9.0+cu128, Datasets 4.4.1 y Tokenizers 0.22.1.

El corpus de SFT contiene unas 15.200 trazas procedentes de dos fuentes: nl2bash, tareas sintéticas de formateo de comandos de shell, e InferredBugs, un conjunto de bugs en C# y Java recopilado por Microsoft y convertido en tareas ejecutables. Para la fase de RL posterior se emplean unas 720 tareas derivadas de nl2bash verificado. El pipeline de filtrado consta de tres etapas: descarte de tareas con verificadores inestables o lentos, eliminación de tareas cuyo contenedor tarda demasiado en construirse o destruirse, y un filtro opcional de dificultad que descarta tareas que ni GPT-5 Codex resuelve en una sola pasada. No se documentan innovaciones arquitectónicas propias; la contribución es de datos y de procedimiento de post-entrenamiento.

## Capacidades

- Generación de texto conversacional y razonamiento multi-turno sobre la base de Qwen3-8B.
- Ejecución de tareas de agente en terminal: interpretación de estado, emisión de comandos de shell y corrección de errores a partir de la salida del entorno (formato nl2bash).
- Resolución de bugs en bases de código: localización, edición y verificación de parches, con entrenamiento específico sobre bugs de C# y Java (InferredBugs).
- Razonamiento multi-paso con uso de herramientas, orientado a bucles de agente tipo harness (Terminus-2, OpenHands).
- Generación y edición de código en pipelines de ingeniería de software.
- Compatibilidad declarada con text-generation-inference y con endpoints compatibles (etiquetas `text-generation-inference` y `endpoints_compatible`).
- Capacidades multilingües: no documentadas; el modelo base Qwen3-8B es multilingüe, pero el ajuste de este checkpoint se ha realizado sobre datos en inglés.
- No se declaran capacidades de visión, audio ni modo de razonamiento extendido explícito en la información disponible.

## Casos de uso

- Agentes de terminal autónomos: el modelo puede recibir el estado de una shell, emitir el siguiente comando y reaccionar a la salida, tal como se evalúa en Terminal-Bench 2.0 con el harness Terminus-2. Es adecuado porque el SFT se construyó precisamente sobre tareas nl2bash verificadas.
- Resolución automática de incidencias en repositorios: integrado en un harness tipo OpenHands o Terminus-2, el modelo puede leer un issue, inspeccionar el repositorio, aplicar un parche y validarlo con la suite de tests, que es el escenario de SWE-Bench Verified.
- Migración y corrección de código heredado en C# y Java: al haberse entrenado con el conjunto InferredBugs, el modelo está expuesto a bugs reales de estos lenguajes y a su verificación automática.
- Automatización de operaciones y scripting: generación de comandos de shell correctos y seguros a partir de instrucciones en lenguaje natural, útil en herramientas de administración de sistemas y en asistentes de línea de comandos.
- Integración en pipelines de CI/CD: un agente basado en este checkpoint puede ejecutarse en un runner para triar fallos de build, proponer parches y abrir pull requests, dado su tamaño de 8B y su licencia Apache 2.0, que permite uso comercial.
- Agentes de soporte técnico con contexto de repositorio: gestión de conversaciones multi-turno en las que hay que consultar código y documentación y ejecutar comandos de diagnóstico.
- Generación de datos de agente y destilación: al ser la etapa SFT intermedia, puede emplearse para producir trazas que alimenten fases posteriores de RL o para comparar el efecto del RL frente al SFT puro.
- Investigación sobre post-entrenamiento de agentes: sirve como punto de control reproducible para estudiar la contribución de cada etapa (SFT frente a SFT+RL) sobre los mismos conjuntos de datos públicos.

## Benchmarks y rendimiento

El campo `model-index` del repositorio declara el nombre OpenThinker-Agent-v1 con una lista de resultados vacía, por lo que no hay métricas publicadas específicamente para este checkpoint SFT. No se han publicado resultados de benchmarks en la informacion disponible para `OpenThinker-Agent-v1-SFT`.

La model card incluye una tabla de resultados que corresponde a `OpenThinker-Agent-v1`, el modelo tras la fase de RL, no a este checkpoint. Se reproduce tal cual, advirtiendo que las cifras no son atribuibles al modelo SFT aquí descrito y que los harness empleados difieren entre filas:

| Modelo | Harness | Terminal-Bench 2.0 | SWE-Bench Verified | OpenThoughts-TB-Dev |
|---|---|---|---|---|
| Qwen3-8B | Terminus-2 | 0.0 | 0.7 | 5.7 |
| OpenThinker-Agent-v1 | Terminus-2 | 4.9 | 15.7 | 17.3 |
| Qwen3-32B | Terminus-2 | 1.9 | 5.7 | 10.2 |
| Qwen/Qwen3-Coder-30B-A3B-Instruct | OpenHands | 10.1 | 49.2 | 24.5 |

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: en torno a 16,4 GB solo para pesos (tamaño del repositorio), más caché KV; presupuestar 20-24 GB para batch 1 y contextos moderados.
- VRAM estimada en cuantización de 8 bits: aproximadamente 8-9 GB de pesos. En 4 bits: aproximadamente 5 GB, más caché KV.
- GPU de centro de datos recomendadas: A100 40 GB u 80 GB, H100 80 GB, L40S 48 GB, con margen para lotes mayores y contextos largos.
- GPU de consumo: cabe en RTX 4090 o RTX 3090 de 24 GB en bf16 con batch 1 y contexto contenido; en equipos de 16 GB (RTX 4060 Ti 16 GB, RTX 4070 Ti Super) es necesario recurrir a cuantización de 4-5 bits.
- En GPU de 8-12 GB solo es viable con cuantizaciones GGUF de 4 bits y contexto reducido.
- Opciones de despliegue: vLLM, SGLang, HuggingFace Text Generation Inference (etiqueta oficial en el repositorio), transformers para uso directo y llama.cpp u Ollama previa conversión a GGUF.
- Latencia y throughput: no disponibles. No se han publicado mediciones de tokens por segundo ni de latencia para este checkpoint.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Terminal-Bench 2.0 | SWE-Bench Verified | Disponibilidad |
|---|---|---|---|---|---|---|
| OpenThinker-Agent-v1-SFT (este checkpoint) | ~8B (base Qwen3-8B); metadatos de safetensors inconsistentes | No disponible (base: 32.768 nativos) | Apache 2.0 | No publicado para la etapa SFT | No publicado para la etapa SFT | HuggingFace (recarga de baerquants; original en open-thoughts) |
| OpenThinker-Agent-v1 (SFT + RL) | ~8B | No disponible | Apache 2.0 | 4.9 (Terminus-2) | 15.7 (Terminus-2) | HuggingFace (open-thoughts) |
| Qwen3-8B | ~8B | 32.768 nativos, 131.072 con YaRN | Apache 2.0 | 0.0 (Terminus-2) | 0.7 (Terminus-2) | HuggingFace (Qwen) |
| Qwen3-32B | ~32B | 32.768 nativos, 131.072 con YaRN | Apache 2.0 | 1.9 (Terminus-2) | 5.7 (Terminus-2) | HuggingFace (Qwen) |
| Qwen3-Coder-30B-A3B-Instruct | ~30B totales, ~3B activos (MoE) | 32.768 nativos, 262.144 con YaRN | Apache 2.0 | 10.1 (OpenHands) | 49.2 (OpenHands) | HuggingFace (Qwen) |

Las cifras de Terminal-Bench 2.0 y SWE-Bench Verified no son directamente comparables entre filas cuando el harness difiere (Terminus-2 frente a OpenHands). La comparación relevante para este checkpoint es con Qwen3-8B, ya que comparten base y harness.

## Limitaciones y advertencias

- Este repositorio es una recarga de terceros (`baerquants`) del modelo original de `open-thoughts`; muestra 0 descargas y 0 likes, por lo que conviene verificar la integridad de los pesos y, en su caso, usar la publicación oficial.
- Es la etapa SFT, no la versión final. El propio autor indica que el modelo tras SFT+RL rinde mejor en los benchmarks de agente; usar este checkpoint implica renunciar a esa mejora.
- Los metadatos de parámetros del repositorio (308.224) son incoherentes con un modelo de 8B y probablemente reflejan el número de tensores; no deben citarse como recuento de parámetros.
- Riesgo de alucinación inherente a los modelos de 8B, especialmente en razonamiento largo y en la planificación de varios pasos.
- Sesgo de dominio: los datos de SFT son tareas de shell en inglés y bugs en C# y Java, lo que puede degradar el rendimiento en otros lenguajes de programación, en otros idiomas naturales o en dominios ajenos al terminal.
- Idiomas soportados no declarados. El uso en castellano no está validado y puede producir mezcla de idiomas o comandos incorrectos.
- Al ser un modelo orientado a ejecutar comandos de terminal, su despliegue en producción requiere aislamiento (contenedores, sandbox, permisos mínimos) por el riesgo de ejecutar acciones destructivas.
- Licencia Apache 2.0: permite uso comercial y modificación, con obligación de conservar el aviso de licencia y el archivo NOTICE si existe. No se declaran restricciones adicionales por parte del autor.
- No hay información publicada sobre latencia, throughput ni consumo energético, lo que dificulta dimensionar despliegues en producción.
- El contexto efectivo no está confirmado para este checkpoint; asumir 32.768 tokens sin validación previa puede provocar degradación en tareas largas.

## Enlaces

- Modelo en HuggingFace (recarga analizada): https://huggingface.co/baerquants/OpenThinker-Agent-v1-SFT
- Modelo original SFT: https://huggingface.co/open-thoughts/OpenThinker-Agent-v1-SFT
- Modelo tras SFT y RL: https://huggingface.co/open-thoughts/OpenThinker-Agent-v1
- Modelo base: https://huggingface.co/Qwen/Qwen3-8B
- Página del proyecto: https://www.openthoughts.ai/blog/agent (también referenciada como https://open-thoughts.ai/blog/agent)
- Repositorio de código: https://github.com/open-thoughts/OpenThoughts-Agent
- Dataset de SFT: https://huggingface.co/datasets/open-thoughts/OpenThoughts-Agent-v1-SFT (también referenciado en la model card como https://huggingface.co/datasets/open-thoughts/OpenThoughts1-Agent-SFT)
- Dataset de RL: https://huggingface.co/datasets/open-thoughts/OpenThoughts-Agent-v1-RL
- Colección de modelos OpenThinker-Agent: https://huggingface.co/collections/open-thoughts/openthinker-agent
- Modelo de comparación MoE: https://huggingface.co/Qwen/Qwen3-Coder-30B-A3B-Instruct
- Búsquedas web realizadas: no devolvieron ningún resultado relevante sobre este modelo. Los resultados obtenidos corresponden a la Plataforma Digitale Unificata dell'Avvocatura (Cassa Forense, Italia) y no guardan relación con OpenThinker-Agent-v1-SFT.
