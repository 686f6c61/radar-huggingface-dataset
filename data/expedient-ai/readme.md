# expedient-ai/README

## Resumen

Expedient CTRL es una familia de modelos de lenguaje pequenos disenados por Expedient AI para responder consultas sobre su base de conocimiento de infraestructura (VMware Cloud Foundation, Nutanix, Zerto, Cohesity). No son modelos generalistas: son adaptadores QLoRA entrenados sobre un corpus curado y verificado, pensados para funcionar en un esquema de generacion aumentada por recuperacion (RAG) donde la recuperacion aporta los hechos y el modelo aporta el estilo de respuesta. La familia incluye tres artefactos: CTRL-2B (base MiniCPM5-2B, cuantizacion Q8_0 de 2,68 GB), CTRL-0.6B (base Qwen3-0.6B, Q4_K_M de 378 MB, ejecutable en navegador via llama.cpp WASM) y CTRL-2B-ONNX (exportacion q4f16 de 1,62 GB para transformers.js/WebGPU).

El planteamiento tecnico es poco habitual: el autor publica explicitamente que el recall en modo cerrado (sin contexto recuperado) del adaptador de 0,6B iguala al del modelo base, lo que indica que el entrenamiento no inyecta hechos nuevos sino que ensena el formato y la voz de una respuesta de soporte. La calidad se mide en modo abierto (con contexto recuperado), con cifras de recall entre 0,943 y 0,962 y precision de 1,000 en el modelo pequeno. Cada release incluye un registro de linaje (hash del adaptador, hash del corpus, resumenes de evaluacion, hashes de exportacion).

La relevancia actual reside en su enfoque de disciplina de corpus y trazabilidad: solo entran en entrenamiento las filas que pasan revision (258 borradores propios mas 681 promovidos tras verificacion automatica contra paginas fuente en vivo), y se documenta el comportamiento de abstención. La licencia de los adaptadores es Apache-2.0, coherente con sus bases, aunque los derechos sobre documentacion de terceros (VMware, Nutanix, Zerto, Cohesity) permanecen con sus editores y el uso previsto es soporte interno de Expedient.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (bases MiniCPM5-2B y Qwen3-0.6B) con adaptadores QLoRA |
| Parametros totales | 2B (CTRL-2B) / 0,6B (CTRL-0.6B); no disponible el numero exacto de parametros del adaptador |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q8_0 (CTRL-2B), Q4_K_M (CTRL-0.6B), q4f16 ONNX (CTRL-2B-ONNX) |
| Idiomas soportados | no disponible (el corpus es documentacion tecnica en ingles) |
| Licencia | Apache-2.0 para los adaptadores; derechos de documentacion de terceros con sus editores |
| Formato de pesos | GGUF (CTRL-2B, CTRL-0.6B), ONNX (CTRL-2B-ONNX) |

## Arquitectura y entrenamiento

Los modelos son adaptadores QLoRA sobre dos bases densas de tipo transformer decoder-only: MiniCPM5-2B para la variante de calidad y Qwen3-0.6B para la variante de navegador. No se trata de modelos entrenados desde cero ni de arquitecturas hibridas o MoE; la innovacion esta en el pipeline de datos y en la metodologia de evaluacion, no en la topologia de red. El entrenamiento se realiza sobre el corpus Expedient, compuesto por material propio de la base de conocimiento, hechos de empresa y documentacion de proveedores parafraseada y verificada contra las paginas fuente en vivo.

El corpus maestro (expedient-engram) contiene 1.417 filas, de las cuales solo entran en entrenamiento las que superan revision: 258 borradores de primera parte mas 681 promovidos tras verificacion automatica de grounding. El resto de conjuntos (expedient-kb-knowledge con 218 filas, vmware-vcf9-knowledge con 504, nutanix-knowledge con 522, zerto-knowledge con 71, cohesity-knowledge con 62) alimentan el material recuperable. No se documentan en la informacion disponible el numero de tokens de entrenamiento, la composicion exacta del dataset ni si se aplico RLHF o DPO; el autor si indica que el adaptador aprende el estilo de respuesta y no los hechos, lo que sugiere un objetivo supervisado orientado a formato.

## Capacidades

- Generacion de texto en ingles tecnico orientada a respuestas de soporte sobre infraestructura (VMware Cloud Foundation 9, Nutanix, Zerto, Cohesity).
- Generacion aumentada por recuperacion: el modelo esta disenado para operar con contexto recuperado y alcanza recall de 0,943-0,962 en modo abierto.
- Abstención calibrada: el autor publica el comportamiento de abstención como parte del contrato del modelo, priorizando decir "no lo se" frente a inventar un numero de build.
- Ejecucion en navegador: CTRL-0.6B corre integramente client-side via llama.cpp WASM, sin backend.
- Exportacion ONNX para transformers.js y experimentos con WebGPU (CTRL-2B-ONNX).
- No se documenta soporte de tool calling, function calling, agentes multi-paso, vision, audio ni modo de razonamiento explicito.

## Casos de uso

- Atencion al cliente de soporte tecnico: el modelo responde consultas sobre productos de infraestructura usando el contexto recuperado del corpus verificado, con abstención cuando la respuesta no esta en la base de conocimiento.
- Asistente embebido en navegador: CTRL-0.6B en Q4_K_M (378 MB) se ejecuta via llama.cpp WASM, lo que permite ofrecer ayuda contextual en una web de soporte sin enviar datos del usuario a un servidor.
- Busqueda interna con respuesta redactada: sobre la base de conocimiento propia de Expedient, el modelo transforma fragmentos recuperados en respuestas con la voz corporativa, manteniendo la trazabilidad de la fuente.
- Generacion de borradores de articulos de KB: dado un conjunto de documentos de proveedor verificados, el modelo redacta borradores en el formato de la base de conocimiento para revision humana.
- Prototipado de RAG en el navegador: CTRL-2B-ONNX (q4f16, 1,62 GB) sirve para experimentar con transformers.js y WebGPU antes de comprometerse con un backend de inferencia.
- Despliegue en entornos con restricciones de red: al ser modelos pequenos en GGUF, pueden ejecutarse en local sin dependencia de APIs externas, util en entornos de laboratorio o con datos sensibles.
- Evaluacion de pipelines de grounding: el registro de linaje y las metricas de recall/precision permiten usar estos modelos como referencia para medir la calidad de un sistema de recuperacion.

## Benchmarks y rendimiento

| Modelo | Modo | Recall | Precision |
|---|---|---|---|
| CTRL-2B | Cerrado (closed-book) | 0,772 | no disponible |
| CTRL-2B | Abierto (open-book) | 0,943-0,962 | no disponible |
| CTRL-0.6B | Abierto (open-book) | 0,962 | 1,000 |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible. Las cifras anteriores son metricas propias del autor sobre su corpus de evaluacion, no comparables directamente con benchmarks publicos.

## Requisitos de hardware

- CTRL-2B en Q8_0 (2,68 GB): requiere aproximadamente 3-4 GB de VRAM o RAM para inferencia; cabe en GPUs consumer como RTX 3060 12 GB, RTX 4060 Ti 16 GB o superiores.
- CTRL-0.6B en Q4_K_M (378 MB): requiere menos de 1 GB de memoria; puede ejecutarse en CPU y en navegador via llama.cpp WASM.
- CTRL-2B-ONNX en q4f16 (1,62 GB): pensado para transformers.js y WebGPU; el consumo depende del navegador y de la GPU del cliente.
- GPUs recomendadas para servidor: no disponible en la informacion proporcionada; por tamano, A100/H100 no son necesarias y bastaria una GPU consumer o una T4/L4 para la variante de 2B.
- Opciones de despliegue: llama.cpp (GGUF), llama.cpp WASM (navegador), transformers.js y WebGPU (ONNX). No se documenta soporte de vLLM ni TGI.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Expedient CTRL-2B | 2B | no disponible | Adaptador QLoRA sobre MiniCPM5-2B, RAG de dominio | Apache-2.0 (adaptador) | Hugging Face |
| Expedient CTRL-0.6B | 0,6B | no disponible | Adaptador QLoRA sobre Qwen3-0.6B, RAG de dominio, navegador | Apache-2.0 (adaptador) | Hugging Face + demo |
| Qwen3-0.6B (base) | 0,6B | no disponible | Modelo generalista | Apache-2.0 | Hugging Face |
| MiniCPM5-2B (base) | 2B | no disponible | Modelo generalista | no disponible | Hugging Face |

La comparacion relevante es contra sus propias bases: CTRL-0.6B no supera a Qwen3-0.6B en recall cerrado (lo iguala), y su ventaja se limita al formato de respuesta y al comportamiento de abstención en el dominio de Expedient. Para uso generalista fuera de ese dominio, las bases son la opcion adecuada.

## Limitaciones y advertencias

- Dominio muy restringido: el modelo esta especializado en la base de conocimiento de Expedient y en documentacion de VMware, Nutanix, Zerto y Cohesity; fuera de ese ambito su utilidad es limitada.
- El adaptador no aporta conocimiento factual nuevo: el recall cerrado iguala al del modelo base, por lo que sin recuperacion el modelo no sabe mas que su base.
- Riesgo de alucinacion en numeros de build y versiones si el contexto recuperado es incorrecto o incompleto; el autor mitiga con abstención pero no la elimina.
- Idiomas soportados no documentados; el corpus es documentacion tecnica en ingles, por lo que el rendimiento en castellano no esta garantizado.
- Longitud de contexto no disponible, lo que impide planificar el tamano del contexto recuperado con precision.
- Licencia: los adaptadores son Apache-2.0, pero los derechos sobre documentacion de proveedores permanecen con sus editores y los releases estan pensados para uso de soporte de Expedient; el uso comercial fuera de ese contexto requiere revision legal.
- Sin soporte documentado de tool calling, agentes o vision, lo que limita su integracion en pipelines agenticos.
- Metricas de evaluacion propias del autor, sin comparacion con benchmarks estandar ni con modelos de terceros.

## Enlaces

- Repositorio principal: https://huggingface.co/expedient-ai/README
- CTRL-2B: https://huggingface.co/expedient-ai/CTRL-2B
- CTRL-0.6B: https://huggingface.co/expedient-ai/CTRL-0.6B
- CTRL-2B-ONNX: https://huggingface.co/expedient-ai/CTRL-2B-ONNX
- Demo CTRL-0.6B: https://huggingface.co/spaces/expedient-ai/ctrl-0.6b-demo
- Dataset expedient-engram: https://huggingface.co/datasets/expedient-ai/expedient-engram
- Dataset expedient-kb-knowledge: https://huggingface.co/datasets/expedient-ai/expedient-kb-knowledge
- Dataset vmware-vcf9-knowledge: https://huggingface.co/datasets/expedient-ai/vmware-vcf9-knowledge
- Dataset nutanix-knowledge: https://huggingface.co/datasets/expedient-ai/nutanix-knowledge
- Dataset zerto-knowledge: https://huggingface.co/datasets/expedient-ai/zerto-knowledge
- Dataset cohesity-knowledge: https://huggingface.co/datasets/expedient-ai/cohesity-knowledge
