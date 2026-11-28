# IsValorum/Qwen3.8-27B-pi-adapted-VAL-APEX-I-NanoPlus-V3-GGUF

## Resumen

Qwen3.8-27B-pi-adapted-VAL-APEX-I-NanoPlus-V3-GGUF es una cuantizacion GGUF del modelo base `harness-hub/Qwen3.8-27B-pi-adapted`, publicada por el usuario IsValorum dentro de su serie "APEX Quantization Series". No se trata de un modelo entrenado desde cero, sino de una distribucion de pesos comprimidos para inferencia local con llama.cpp y motores compatibles, orientada a equipos con recursos limitados de VRAM. El modelo base pertenece a la familia Qwen3.8 (arquitectura `qwen35`) y tiene 27.320.697.856 parametros totales segun los metadatos de safetensors.

La relevancia de esta ficha radica en que la cuantizacion emplea una estrategia "quirurgica" por tensor: en lugar de aplicar un tipo de cuantizacion uniforme, el autor asigna precisiones distintas a cada grupo de tensores (Q3_K, Q4_K, Q5_K, Q8_0, IQ3_XXS, IQ4_XS, F32) segun su sensibilidad. Los tensores del camino recurrente/SSM se mantienen en F32 para preservar la estabilidad numerica, mientras que las proyecciones de atencion y las capas FFN densas se comprimen de forma agresiva. El resultado es un archivo de 11,47 GiB para la variante NanoPlus, lo que permite ejecutar un modelo de ~27B en GPUs de consumo.

La model card esta redactada integramente en ingles y no aporta informacion sobre datos de entrenamiento, benchmarks, idiomas soportados ni comportamiento evaluado. La licencia declarada es Apache-2.0, heredada del modelo base. El modelo esta etiquetado para generacion de texto, agentes y adaptadores de harness, y el autor distribuye ademas una aplicacion de escritorio (V-Agent) para Windows que facilita su despliegue local.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | `qwen35` (transformer hibrido con componentes SSM/recurrentes; etiquetado como MTP en los tags) |
| Parametros totales | 27.320.697.856 (~27,3B) |
| Parametros activos | no disponible (no se declara configuracion MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Mezcla por tensor: Q3_K, Q4_0, Q4_K, Q5_K, Q8_0, IQ3_XXS, IQ4_XS, F32 (variante NanoPlus, 11,47 GiB) |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (llama.cpp); repo de 25,6 GB con multiples variantes |
| Modelo base | `harness-hub/Qwen3.8-27B-pi-adapted` |
| iMatrix | `unsloth/Qwen3.8-27B-GGUF/imatrix_unsloth.gguf` (commit `4af51b3`) |
| Descargas / likes | 555 / 0 |
| Fecha de creacion | 2026-11-18 |

Variantes de la familia APEX-I V3:

| Variante | Huella en disco | Estado |
|---|---|---|
| MiniPlus | 13,31 GiB | Disponible |
| NanoPlus | 11,47 GiB | Actual |
| MicroPlus | 9,77 GiB | Disponible |

## Arquitectura y entrenamiento

La arquitectura declarada es `qwen35`, con presencia de tensores `ssm_a`, `ssm_alpha`, `ssm_beta`, `ssm_conv1d`, `ssm_dt` y `ssm_out` en 48 capas, lo que indica un diseno hibrido que combina atencion con capas de espacio de estados (SSM). El mapa de tensores auditado revela 64 bloques (`blk.0` a `blk.63`), con atencion en las capas 0 y en las capas 3, 7, 11... hasta 63 (16 capas con `attn_q`, `attn_k`, `attn_v`, `attn_output`), y componentes recurrentes en 48 capas. Los tags incluyen `mtp` (multi-token prediction) y `harness-adapter`, lo que sugiere un ajuste orientado a uso como agente dentro de un harness.

No se dispone de informacion sobre el dataset de entrenamiento, el numero de tokens procesados, la composicion de datos ni si se aplicaron fases de RLHF, DPO o similares. La model card se limita a describir la cuantizacion, no el entrenamiento del modelo base. La innovacion tecnica documentada es exclusivamente la estrategia de cuantizacion: proteccion de tensores recurrentes en F32 (408 tensores observados), `attn_gate` de la capa 0 en Q4_0 como proteccion de frontera, y asignacion diferenciada de precisones al resto de proyecciones. Se uso una iMatrix externa de Unsloth como referencia para la cuantizacion, aunque el autor aclara que la procedencia externa no se infiere.

## Capacidades

- Generacion de texto conversacional y de un solo turno (pipeline `text-generation`).
- Razonamiento y generacion de codigo: el modelo base Qwen3.8 y sus variantes se orientan a tareas de codigo, aunque no hay evaluacion publicada en esta ficha.
- Soporte de agentes: los tags `agents`, `harness-adapter` y `pi` indican un ajuste para flujos de agente con herramientas.
- Tool calling / function calling: no confirmado explicitamente en la model card; el ecosistema V-Agent del autor soporta MCP y herramientas, pero no se documenta el soporte nativo del modelo.
- Capacidades multilingues: no disponibles.
- Modo "thinking": no disponible en la informacion proporcionada.
- Vision o audio: no disponible; el modelo es solo de texto.
- Inferencia local via llama.cpp con CUDA, Vulkan o CPU.

## Casos de uso

- **Asistente de codigo en local**: desplegado con llama.cpp u Ollama en una estacion de trabajo con GPU de consumo, el modelo permite autocompletado y generacion de funciones sin enviar codigo a servicios externos. La variante NanoPlus (11,47 GiB) cabe en GPUs de 12-16 GB con cuantizacion agresiva.
- **Agente de escritorio con herramientas**: integrado en V-Agent (la aplicacion del propio autor), el modelo puede gestionar comandos de shell, busqueda web, peticiones HTTP y servidores MCP con aprobacion por accion. El tag `harness-adapter` sugiere que el ajuste del modelo base esta pensado para este tipo de bucle agente.
- **Procesamiento por lotes de texto en CPU**: con la variante MicroPlus (9,77 GiB) y llama.cpp en modo CPU o Vulkan, es viable ejecutar tareas de clasificacion, resumen o extraccion sobre grandes volumenes de documentos sin GPU dedicada.
- **Prototipado de pipelines RAG**: el modelo puede actuar como generador final en un sistema de recuperacion aumentada, con contexto gestionado por el orquestador externo. La cuantizacion Q4/Q3 reduce el coste de servir multiples instancias.
- **Entornos con requisitos de privacidad**: al ser un GGUF ejecutable offline bajo Apache-2.0, encaja en escenarios donde los datos no pueden salir de la maquina (sanidad, legal, administracion), siempre que se valide la calidad de la cuantizacion en la tarea concreta.
- **Investigacion sobre cuantizacion**: el mapa por tensor documentado (con rationale por grupo) sirve como caso de estudio reproducible para analizar el impacto de precisiones mixtas en modelos hibridos con SSM.
- **Chat multi-turno local**: la pipeline `conversational` y el template de chat incluido permiten usar el modelo como asistente conversacional en escritorio, aunque la longitud de contexto efectiva no esta documentada y debe validarse empiricamente.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye MMLU, HumanEval, GSM8K ni ninguna otra metrica de evaluacion, ni comparaciones con el modelo base sin cuantizar.

## Requisitos de hardware

- **VRAM estimada**: la variante NanoPlus ocupa 11,47 GiB en disco; en inferencia con llama.cpp se necesita espacio adicional para el contexto KV cache, por lo que se recomienda al menos 14-16 GB de VRAM para contexto moderado. MiniPlus (13,31 GiB) requiere ~16-20 GB; MicroPlus (9,77 GiB) puede funcionar en GPUs de 12 GB.
- **GPU recomendadas**: RTX 4090 (24 GB), RTX 4080 (16 GB) y RTX 3090 (24 GB) para las variantes NanoPlus y MiniPlus con contexto amplio. Para MicroPlus, RTX 4070 Ti (12 GB) o superior.
- **Consumer GPU**: si, el modelo cabe en GPUs de consumo; esa es precisamente la razon de ser de la serie APEX.
- **Despliegue**: llama.cpp (builds oficiales CUDA, Vulkan, CPU), motores compatibles con GGUF (Ollama, LM Studio), V-Agent en Windows, y potencialmente TGI/vLLM si admiten el formato GGUF y la arquitectura `qwen35` (no confirmado).
- **Latencia y throughput**: no disponibles. Dependen de la GPU, del backend y de la longitud de contexto; no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| **Este modelo (NanoPlus)** | ~27,3B | no disponible | Apache-2.0 | GGUF (11,47 GiB) | Cuantizacion mixta por tensor, SSM en F32 |
| Qwen3.8-27B-pi-adapted (base) | ~27,3B | no disponible | Apache-2.0 | safetensors | Modelo sin cuantizar, mayor huella |
| Qwen3.8-27B-GGUF (Unsloth) | ~27,3B | no disponible | Apache-2.0 | GGUF | Fuente de la iMatrix usada; cuantizacion estandar |
| Variantes MiniPlus / MicroPlus | ~27,3B | no disponible | Apache-2.0 | GGUF (13,31 / 9,77 GiB) | Misma familia, distinto compromiso tamano/calidad |

No se dispone de datos de rendimiento para comparar calidad entre estas variantes ni frente a modelos de otros autores. La comparacion se limita a parametros, tamano y licencia.

## Limitaciones y advertencias

- **Sin evaluacion publicada**: no hay benchmarks que cuantifiquen la perdida de calidad frente al modelo base; la eleccion entre MiniPlus, NanoPlus y MicroPlus debe hacerse con pruebas propias.
- **Cuantizacion agresiva**: el uso de Q3_K e IQ3_XXS en las capas FFN densas intermedias (bloques 8-55) puede degradar tareas de razonamiento complejo o codigo de precision, aunque los tensores SSM se protegen en F32.
- **Riesgo de alucinacion**: inherente a los modelos de lenguaje; no hay evaluacion especifica de factualidad en esta distribucion.
- **Idiomas no documentados**: se desconoce el soporte real de castellano y de otros idiomas; el modelo base Qwen suele estar entrenado mayoritariamente en ingles y chino.
- **Contexto no documentado**: no se indica la longitud de contexto soportada ni el template de chat exacto; debe extraerse del GGUF o del modelo base.
- **Licencia**: Apache-2.0 permite uso comercial, pero el autor no ofrece garantias sobre el comportamiento del modelo ni sobre la procedencia de los datos de entrenamiento del base.
- **Dependencia del ecosistema del autor**: parte de la documentacion y las herramientas (V-Agent) estan orientadas a Windows y a la aplicacion propia; el soporte en Linux/macOS depende de llama.cpp.
- **Madurez**: el repositorio tiene 0 likes y 555 descargas en el momento de la consulta; no hay evidencia de validacion por terceros.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/IsValorum/Qwen3.8-27B-pi-adapted-VAL-APEX-I-NanoPlus-V3-GGUF
- Variante MiniPlus: https://huggingface.co/IsValorum/Qwen3.8-27B-pi-adapted-VAL-APEX-I-MiniPlus-V3-GGUF
- Variante MicroPlus: https://huggingface.co/IsValorum/Qwen3.8-27B-pi-adapted-VAL-APEX-I-MicroPlus-V3-GGUF
- Modelo base: https://huggingface.co/harness-hub/Qwen3.8-27B-pi-adapted
- iMatrix de Unsloth: https://huggingface.co/unsloth/Qwen3.8-27B-GGUF (commit `4af51b3`)
- Aplicacion V-Agent: https://github.com/IsValorum/V-Agent
- Releases de V-Agent: https://github.com/IsValorum/V-Agent/releases/latest
- Apoyo al autor: https://ko-fi.com/isvalorum
