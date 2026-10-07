# jkim96/granite-4.1-30b-DASHQ-Q2-GGUF

## Resumen

Este repositorio contiene la cuantizacion a 2 bits del modelo `ibm-granite/granite-4.1-30b` de IBM, realizada por el usuario jkim96 mediante el metodo DASH-Q y publicada en formato GGUF para su uso con llama.cpp. Se trata de una familia de cuatro archivos que comprimen un modelo denso de 28.865.728.512 parametros (aproximadamente 28,87B) hasta tamanos de entre 7,97 GB y 10,90 GB, con ratios de 2,21 a 3,02 bits por peso. El objetivo es hacer viable la inferencia de un modelo de 30B en hardware de consumo sin renunciar a una perdida de calidad controlada.

El modelo base, Granite 4.1 30B, es un transformer denso de IBM integrado en la familia Granite 4.1 (junto a variantes de 3B y 8B), orientado a generacion multilingue, codigo, RAG, tool calling y flujos de asistente. Segun la documentacion de IBM, esta familia incorpora mejoras en llamada a herramientas, seguimiento de instrucciones, codigo y razonamiento matematico, y la variante de 30B maneja una longitud de contexto de hasta 512.000 tokens.

La relevancia de esta ficha radica en el metodo de cuantizacion: DASH-Q logra, segun los datos del autor, una perplejidad inferior a la de las cuantizaciones estandar de llama.cpp (imatrix) y a las de unsloth en todos los niveles comparados, manteniendo exclusivamente tipos de tensor estandar de llama.cpp (ningun tensor por encima de 4 bits). Esto permite cargar los archivos en cualquier build reciente de llama.cpp sin parches.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (modelo base: IBM Granite 4.1 30B) |
| Parametros totales | 28.865.728.512 (28,87B) |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | 512.000 tokens en el modelo base (el ejemplo de uso de la model card emplea `-c 8192`) |
| Tipos de cuantizacion | IQ2_XXS (2,21 bpw), IQ2_XS (2,54 bpw), IQ2_M (2,74 bpw), Q2_K_XL (3,02 bpw) |
| Idiomas soportados | Multilingue segun el modelo base; no disponible el detalle de idiomas en el repositorio GGUF |
| Licencia | apache-2.0 (heredada del modelo base) |
| Formato de pesos | GGUF (llama.cpp) |

## Arquitectura y entrenamiento

La arquitectura subyacente es un transformer denso de IBM perteneciente a la familia Granite 4.1. Frente a la generacion anterior, IBM sustituyo el diseno Mixture-of-Experts (MoE) de Granite 4.0 por una arquitectura densa mas simple y flexible para el ajuste fino posterior; segun IBM Research, el modelo Granite 4.1 8B instruct iguala o supera al Granite 4.0 32B MoE. El modelo base de 30B esta disenado para generacion multilingue, codigo, RAG y flujos de asistente, con soporte de tool calling y contexto de hasta 512K tokens.

Sobre este modelo base, el autor aplica el metodo DASH-Q, una tecnica de cuantizacion a 2 bits que genera pesos GGUF usando unicamente tipos de tensor estandar de llama.cpp y sin ningun tensor por encima de 4 bits. No se dispone en la informacion proporcionada de detalles sobre el dataset de entrenamiento del modelo base (numero de tokens, composicion, si hubo RLHF o DPO), ni de innovaciones adicionales del proceso de cuantizacion mas alla del uso de una matriz de importancia (imatrix). El repositorio ocupa 37,9 GB en total al incluir los cuatro archivos de cuantizacion.

## Capacidades

- Generacion de texto y conversacion multirround (etiqueta `conversational`).
- Razonamiento y matematicas: el modelo base Granite 4.1 incorpora mejoras en razonamiento matematico.
- Generacion de codigo: la familia Granite 4.1 esta optimizada para tareas de codigo.
- Tool calling / function calling: la familia Granite 4.1 incluye soporte mejorado de llamada a herramientas.
- Flujos de agente y razonamiento multi-paso: soportado por el modelo base orientado a asistente.
- Capacidades multilingues: heredadas del modelo base Granite 4.1.
- RAG: la familia Granite 4.1 esta disenada para flujos de generacion aumentada por recuperacion.
- Compatibilidad con endpoints: la etiqueta `endpoints_compatible` indica que el repositorio es apto para despliegue en Inference Endpoints.

## Casos de uso

- Despliegue en hardware de consumo: con 7,97-10,90 GB de peso, cualquiera de los cuatro archivos cabe en GPUs de 12 GB o mas, permitiendo ejecutar un modelo de 30B en un PC de sobremesa o portatil con GPU dedicada.
- Asistente de codigo local: el modelo base esta optimizado para generacion de codigo; la cuantizacion IQ2_M o Q2_K_XL permite integrarlo en editores o pipelines de CI/CD sin depender de la nube.
- Chat multilingue autoalojado: al heredar el caracter multilingue del modelo base, puede gestionar conversaciones multi-turno en varios idiomas en infraestructura propia.
- RAG sobre documentacion interna: con contexto configurable (el ejemplo usa 8192 tokens, ampliable), se puede alimentar con fragmentos recuperados para responder preguntas sobre corpus privados.
- Agentes con tool calling: el soporte de function calling del modelo base permite construir agentes que invocan APIs y herramientas externas, ejecutables en local con llama.cpp.
- Experimentacion e investigacion en cuantizacion: comparar la perplejidad de DASH-Q frente a otras cuantizaciones 2-bit sobre el mismo modelo base sirve como caso de estudio para investigacion en compresion de modelos.
- Prototipado rapido sin GPU de datacenter: permite validar prompts y flujos de trabajo con Granite 4.1 30B antes de migrar a una version mayor precision en produccion.
- Servicio de inferencia ligero: el tamano reducido facilita desplegar multiples instancias en un mismo servidor o en entornos con VRAM limitada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de tareas (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. El autor unicamente publica mediciones de perplejidad (`llama-perplexity`, contexto 2048; WikiText-2 test y C4 validation con 256 x 2048 tokens). Se reproduce a continuacion la tabla comparativa de perplejidad facilitada por el autor (menor es mejor):

| Tipo | Modelo | Tamano | WikiText-2 | C4 |
|---|---|---|---|---|
| IQ2_XXS | llama.cpp IQ2_XXS (imatrix) | 7,78 GB | 9,41 | 15,62 |
| IQ2_XXS | unsloth UD-IQ2_XXS | 8,02 GB | 9,96 | 15,72 |
| IQ2_XXS | DASH-Q IQ2_XXS | 7,97 GB | 8,81 | 15,00 |
| IQ2_XS | llama.cpp IQ2_XS (imatrix) | 8,63 GB | 8,59 | 14,36 |
| IQ2_XS | DASH-Q IQ2_XS | 9,16 GB | 7,76 | 13,37 |
| IQ2_M | llama.cpp IQ2_M (imatrix) | 9,70 GB | 7,83 | 13,44 |
| IQ2_M | unsloth UD-IQ2_M | 9,94 GB | 7,83 | 13,12 |
| IQ2_M | DASH-Q IQ2_M | 9,90 GB | 7,46 | 12,88 |
| Q2_K_XL | llama.cpp Q2_K (imatrix) | 10,72 GB | 7,54 | 13,02 |
| Q2_K_XL | unsloth UD-Q2_K_XL | 10,98 GB | 7,61 | 12,82 |
| Q2_K_XL | DASH-Q Q2_K_XL | 10,90 GB | 7,39 | 12,77 |

## Requisitos de hardware

- VRAM para inferencia: entre 8 GB (IQ2_XXS, 7,97 GB) y 11 GB (Q2_K_XL, 10,90 GB) solo para los pesos, mas el espacio de la cache KV segun el contexto configurado.
- GPU recomendadas: cualquier GPU con 12 GB o mas de VRAM, como RTX 3060 12 GB, RTX 4070, RTX 4080 o RTX 4090. Para contextos largos cercanos a los 512K tokens del modelo base se requiere VRAM muy superior y/o offload a CPU.
- Compatibilidad con GPU de consumo: si, todos los archivos caben en GPUs de consumo de 12 GB o mas. Los modelos de 8-10 GB son aptos incluso para GPUs de 10-12 GB con contextos moderados.
- Opciones de despliegue: llama.cpp (`llama-cli`, `llama-server`), y por compatibilidad GGUF tambien Ollama, LM Studio y otros frontends basados en llama.cpp. La etiqueta `endpoints_compatible` sugiere aptitud para Inference Endpoints.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.
- Ejemplo de ejecucion del autor: `llama-cli -m granite-4.1-30b-DASHQ-Q2_K_XL.gguf -ngl 99 -c 8192`.

## Comparativa con modelos similares

Comparacion de las distintas cuantizaciones 2-bit del mismo modelo base Granite 4.1 30B (datos tomados de la tabla de perplejidad del autor):

| Modelo | Tamano | Bits/peso | WikiText-2 | C4 | Licencia |
|---|---|---|---|---|---|
| DASH-Q IQ2_M | 9,90 GB | 2,74 | 7,46 | 12,88 | apache-2.0 |
| llama.cpp IQ2_M (imatrix) | 9,70 GB | no disponible | 7,83 | 13,44 | apache-2.0 (base) |
| unsloth UD-IQ2_M | 9,94 GB | no disponible | 7,83 | 13,12 | apache-2.0 (base) |
| DASH-Q Q2_K_XL | 10,90 GB | 3,02 | 7,39 | 12,77 | apache-2.0 |
| unsloth UD-Q2_K_XL | 10,98 GB | no disponible | 7,61 | 12,82 | apache-2.0 (base) |

No se dispone de datos para comparar con modelos de otros desarrolladores del mismo tamano, al no haberse facilitado resultados de benchmarks de tareas.

## Limitaciones y advertencias

- Perdida de calidad por cuantizacion: la cuantizacion a 2-3 bits degrada inherentemente la calidad frente al modelo en precision completa; la perplejidad en WikiText-2 (7,39-8,81) es notablemente superior a la de una cuantizacion de mayor precision.
- Riesgo de alucinacion: no se documentan medidas especificas de mitigacion; como todo LLM, puede generar contenido erroneo, especialmente con cuantizacion agresiva.
- Sesgos conocidos: no disponibles en la informacion proporcionada; deben considerarse los del modelo base.
- Limitaciones de contexto: aunque el modelo base soporta 512K tokens, el ejemplo del autor usa 8192 tokens y los contextos largos implican un consumo de VRAM elevado que puede exceder el hardware de consumo.
- Idiomas: el repositorio GGUF no detalla los idiomas soportados; se hereda el caracter multilingue del modelo base sin confirmacion especifica.
- Animo de imatrix no especificado: la etiqueta incluye `imatrix`, pero no se detalla el corpus usado para su calculo.
- Licencia: apache-2.0 permite uso comercial, pero cualquier uso debe respetar tambien la licencia del modelo base `ibm-granite/granite-4.1-30b`.
- Madurez: el repositorio registra 0 descargas y 0 likes en el momento de la ficha, por lo que no cuenta con validacion de la comunidad.
- Compatibilidad: requiere una build reciente de llama.cpp; a pesar de usar solo tipos de tensor estandar, builds antiguas podrian no reconocer los archivos.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/jkim96/granite-4.1-30b-DASHQ-Q2-GGUF
- Modelo base: https://huggingface.co/ibm-granite/granite-4.1-30b
- Repositorio del metodo DASH-Q: https://github.com/JaeminK/dashq
- Documentacion de Granite 4.1 (IBM): https://www.ibm.com/granite/docs/models/granite4-1
- Blog de IBM Research sobre la familia Granite 4.1: https://research.ibm.com/blog/granite-4-1-ai-foundation-models
- Coleccion Granite 4.1 en HuggingFace: https://huggingface.co/collections/ibm-granite/granite-41-language-models
- Ficha de Granite 4.1 30B en FitMyLLM: https://www.fitmyllm.com/model/granite-4.1-30b
