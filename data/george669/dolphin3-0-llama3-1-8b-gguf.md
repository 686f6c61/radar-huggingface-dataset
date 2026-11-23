# George669/Dolphin3.0-Llama3.1-8B-GGUF

## Resumen
Dolphin 3.0 Llama 3.1 8B es un ajuste fino por instrucciones del modelo base meta-llama/Llama-3.1-8B, desarrollado por Cognitive Computations (Eric Hartford, Ben Gitter, BlouseJury y colaboradores). Forma parte de la colección Dolphin 3.0, una familia de modelos orientados a uso general local que cubre codigo, matematicas, uso agentico y function calling. El repositorio concreto analizado, George669/Dolphin3.0-Llama3.1-8B-GGUF, es una redistribucion en formato GGUF del modelo original, publicada por un tercero.

El modelo hereda la arquitectura transformer decoder-only densa de Llama 3.1, con 8.030.277.696 parametros totales y una ventana de contexto de 128.000 tokens segun las especificaciones de la familia Llama 3.1. Se distribuye bajo la Llama 3.1 Community License, lo que condiciona el uso comercial. La propuesta de valor de Dolphin es el control por parte del propietario del sistema: el prompt de sistema define el tono, las reglas y la alineacion, sin capas de moderacion impuestas por el proveedor.

Es relevante para desarrolladores que necesitan un modelo de 8B ejecutable en hardware de consumo, con plantilla ChatML, soporte declarado de function calling y entrenamiento sobre mezclas de datos de codigo, matematicas y agentes. El repositorio GGUF facilita el despliegue con llama.cpp, Ollama y LM Studio, aunque el autor de esta redistribucion no aporta evaluaciones propias ni pipeline declarado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso (base Llama 3.1) |
| Parametros totales | 8.030.277.696 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 128.000 tokens (heredada de Llama 3.1; no confirmada de forma explicita en la model card de esta redistribucion) |
| Tipos de cuantizacion | GGUF (el repositorio es un artefacto GGUF; la model card cita Q4_0 como ejemplo de uso en Ollama; no se detalla el conjunto completo de cuantizaciones publicadas) |
| Idiomas soportados | en (segun metadatos del repositorio) |
| Licencia | llama3.1 (Llama 3.1 Community License) |
| Formato de pesos | GGUF (repo de 88,8 GB); el modelo original se distribuye en safetensors |
| Plantilla de chat | ChatML (`<|im_start|>...<|im_end|>`) |
| Modelo base | meta-llama/Llama-3.1-8B |
| Autoria del ajuste | Cognitive Computations (Eric Hartford, Ben Gitter, BlouseJury) |
| Autoria de la redistribucion GGUF | George669 |
| Descargas / likes | 0 / 0 |
| Fecha de creacion | 2026-11-23 |

## Arquitectura y entrenamiento
La arquitectura es la de Llama 3.1 8B: un transformer decoder-only denso con atencion por cabezas agrupadas (GQA) y RoPE, sin componentes MoE ni estado recurrente. El ajuste fino se realizo sobre el checkpoint instructivo de Meta mediante supervised fine-tuning (SFT) sobre una mezcla de datasets publicos, sin que la model card documente una fase posterior de RLHF o DPO. La model card tampoco especifica el numero de tokens de entrenamiento, la composicion exacta por porcentaje ni los hiperparametros.

Los datasets declarados en los metadatos cubren cuatro ejes: codigo (OpenCoder-LLM/opc-sft-stage1 y stage2, cognitivecomputations/dolphin-coder, m-a-p/CodeFeedback-Filtered-Instruction y Code-Feedback), matematicas (AI-MO/NuminaMath-CoT, NuminaMath-TIR, microsoft/orca-math-word-problems-200k), agentes y function calling (microsoft/orca-agentinstruct-1M-v1, NousResearch/hermes-function-calling-v1) y conversacion general (allenai/tulu-3-sft-mixture, HuggingFaceTB/smoltalk, cognitivecomputations/samantha-data). La model card menciona el uso de un reward model de RLHFlow para filtrar los datasets y de DeepSeek-V3 para generacion o anotacion de datos, aunque el texto queda truncado y no detalla el procedimiento completo.

No se documentan innovaciones tecnicas propias como decodificacion especulativa, atencion lineal o modos de razonamiento extendido. La innovacion declarada es de tipo de alineacion: el prompt de sistema como mecanismo de control total del comportamiento, sin moderacion impuesta por el proveedor.

## Capacidades
- Generacion de texto conversacional multi-turno con plantilla ChatML.
- Generacion y explicacion de codigo en multiples lenguajes, con entrenamiento explicito sobre datasets de codigo (OpenCoder, CodeFeedback, dolphin-coder).
- Razonamiento matematico con cadenas de pensamiento y tool-integrated reasoning, derivado de NuminaMath-CoT y NuminaMath-TIR.
- Function calling y tool calling, con datos de entrenamiento de hermes-function-calling-v1 y orca-agentinstruct.
- Comportamiento agentico y razonamiento multi-paso, segun los datasets de agentes incluidos.
- Control de comportamiento mediante prompt de sistema: rol, tono, reglas y restricciones definidas por el operador.
- Capacidad multilingue limitada: los metadatos declaran unicamente ingles; no se confirma soporte robusto de otros idiomas.
- Sin capacidades de vision, audio ni modo thinking separado documentadas.
- Alineacion laxa: el modelo no incorpora rechazos por defecto ante contenido sensible, lo que exige definir politicas propias en el prompt de sistema.

## Casos de uso
- Asistente de codigo en local: el modelo puede generar, explicar y refactorizar codigo en un equipo de desarrollo sin conexion a la nube, aprovechando su entrenamiento sobre OpenCoder y CodeFeedback. Es adecuado por su tamano de 8B, que permite ejecucion en GPU de consumo con cuantizacion Q4.
- Automatizacion de atencion al cliente con contexto largo: con una ventana de hasta 128.000 tokens heredada de Llama 3.1, puede mantener conversaciones multi-turno con historial extenso o documentacion de producto inyectada en el prompt. El operador define el tono y las reglas mediante el prompt de sistema.
- Agente con function calling en pipelines internos: los datos de hermes-function-calling-v1 y orca-agentinstruct permiten integrarlo en flujos que requieren invocar APIs o herramientas estructuradas, con el esquema de herramientas definido por el desarrollador.
- Resolucion de problemas matematicos paso a paso: util para herramientas educativas o de verificacion que necesitan cadenas de razonamiento (NuminaMath-CoT) y razonamiento con herramientas (NuminaMath-TIR).
- Prototipado de asistentes especializados sin moderacion del proveedor: equipos que necesitan un modelo cuyo comportamiento sea completamente definido por el sistema propio, por ejemplo asistentes de dominio tecnico o legal interno, asumiendo la responsabilidad de las politicas de uso.
- Despliegue en entornos air-gapped: al distribuirse en GGUF y ejecutarse con llama.cpp u Ollama, puede operar en infraestructura sin acceso a internet, lo que encaja en sectores con requisitos de confidencialidad de datos.
- Generacion de datos sinteticos y aumentacion de datasets: su capacidad de seguir instrucciones y su alineacion laxa lo hacen util para producir pares instruccion-respuesta en dominios especificos, con revision posterior por parte del equipo.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la informacion disponible. La model card del modelo original indica explicitamente "Evals: TBD", y el repositorio GGUF de George669 no aporta evaluaciones propias. No se dispone de cifras de MMLU, HumanEval, GSM8K ni de comparaciones medidas con otros modelos.

## Requisitos de hardware
- VRAM estimada para inferencia: aproximadamente 4,5-5 GB en Q4_K_M, 6-7 GB en Q5/Q6 y en torno a 16 GB en FP16 para los 8.030 millones de parametros.
- GPU recomendadas: RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070, RTX 4080 y RTX 4090 para uso en consumo; A100, L40S y H100 para despliegue en servidor con mayor concurrencia.
- Cabe en GPU de consumo: si, con cuantizaciones Q4 o Q5 en tarjetas de 8 GB o mas; en Q8 requiere al menos 10-12 GB de VRAM.
- Opciones de despliegue: llama.cpp, Ollama (la model card cita `ollama run hf.co/cognitivecomputations/Dolphin3.0-Llama3.1-8B-GGUF:Q4_0`), LM Studio, Hugging Face Transformers, vLLM, SGLang y TGI.
- Latencia y throughput: no disponibles; no se han publicado mediciones en la informacion proporcionada.
- Nota sobre el repositorio: el tamano del repo es de 88,8 GB, lo que sugiere que contiene multiples archivos GGUF con distintas cuantizaciones; conviene revisar la lista de archivos antes de descargar.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Dolphin 3.0 Llama 3.1 8B (este) | 8,03 B | 128.000 tokens (heredado) | Llama 3.1 Community License | GGUF en este repo; original en safetensors | Ajuste fino orientado a codigo, matematicas y agentes; alineacion laxa |
| meta-llama/Llama-3.1-8B-Instruct | 8,03 B | 128.000 tokens | Llama 3.1 Community License | Pesos oficiales en safetensors y GGUF de terceros | Modelo base instructivo con alineacion estandar de Meta; referencia directa del ajuste |
| Qwen2.5-7B-Instruct | 7,6 B aprox. | 32.768 tokens (128K en variantes Turbo) | Apache 2.0 | safetensors y GGUF | Licencia permisiva y buen rendimiento en codigo y matematicas; contexto base menor |
| Mistral-7B-Instruct-v0.3 | 7,2 B aprox. | 32.768 tokens | Apache 2.0 | safetensors y GGUF | Alternativa permisiva con contexto menor; sin entrenamiento especifico en function calling tan amplio |

Las cifras de rendimiento comparado no estan disponibles: no se han publicado benchmarks de este ajuste, por lo que la comparacion se limita a parametros, contexto, licencia y disponibilidad.

## Limitaciones y advertencias
- Sesgos conocidos: no documentados en la model card; al entrenarse sobre datasets publicos diversos, es previsible que herede sesgos de esas fuentes, pero no hay evaluacion publicada.
- Riesgo de alucinacion: inherente a los modelos de 8B; no se han publicado evaluaciones de fidelidad factual ni de tasas de alucinacion.
- Idioma: los metadatos declaran solo ingles; el rendimiento en castellano u otros idiomas no esta garantizado ni evaluado.
- Contexto: la ventana de 128.000 tokens se hereda de Llama 3.1, pero esta redistribucion no la confirma de forma explicita ni documenta pruebas de recuperacion en contextos largos.
- Licencia: la Llama 3.1 Community License impone condiciones al uso comercial (umbral de usuarios activos mensuales, obligaciones de atribucion y restricciones de uso); debe revisarse antes de integrar el modelo en un producto.
- Alineacion laxa: el modelo no incorpora rechazos por defecto; el operador es responsable de definir politicas de uso y de filtrar salidas en produccion.
- Redistribucion de terceros: este repositorio GGUF no lo publica Cognitive Computations, sino el usuario George669; no hay garantia de que las cuantizaciones hayan sido validadas por los autores originales. Se recomienda contrastar con el repositorio oficial `cognitivecomputations/Dolphin3.0-Llama3.1-8B-GGUF`.
- Madurez del repositorio: 0 descargas y 0 likes en el momento de la consulta, sin pipeline declarado ni evaluaciones propias.
- Fecha de creacion anomala (2026-11-23) en los metadatos; conviene verificar la integridad y procedencia de los archivos antes de usarlos en produccion.

## Enlaces
- Repositorio analizado: https://huggingface.co/George669/Dolphin3.0-Llama3.1-8B-GGUF
- Modelo original (Cognitive Computations): https://huggingface.co/cognitivecomputations/Dolphin3.0-Llama3.1-8B
- Repositorio GGUF oficial: https://huggingface.co/cognitivecomputations/Dolphin3.0-Llama3.1-8B-GGUF
- Coleccion Dolphin 3.0: https://huggingface.co/collections/cognitivecomputations/dolphin-30-677ab47f73d7ff66743979a3
- Modelo base: https://huggingface.co/meta-llama/Llama-3.1-8B
- Ensayo sobre modelos sin censura de Eric Hartford: https://erichartford.com/uncensored-models
- Discord de Cognitive Computations: https://discord.gg/tCMkMDDHwm
- Dataset OpenCoder SFT stage 1: https://huggingface.co/datasets/OpenCoder-LLM/opc-sft-stage1
- Dataset OpenCoder SFT stage 2: https://huggingface.co/datasets/OpenCoder-LLM/opc-sft-stage2
- Dataset Orca AgentInstruct 1M: https://huggingface.co/datasets/microsoft/orca-agentinstruct-1M-v1
- Dataset Orca Math Word Problems 200K: https://huggingface.co/datasets/microsoft/orca-math-word-problems-200k
- Dataset Hermes Function Calling v1: https://huggingface.co/datasets/NousResearch/hermes-function-calling-v1
- Dataset NuminaMath-CoT: https://huggingface.co/datasets/AI-MO/NuminaMath-CoT
- Dataset NuminaMath-TIR: https://huggingface.co/datasets/AI-MO/NuminaMath-TIR
- Dataset Tulu 3 SFT Mixture: https://huggingface.co/datasets/allenai/tulu-3-sft-mixture
- Dataset Dolphin Coder: https://huggingface.co/datasets/cognitivecomputations/dolphin-coder
- Dataset SmolTalk: https://huggingface.co/datasets/HuggingFaceTB/smoltalk
- Dataset Samantha Data: https://huggingface.co/datasets/cognitivecomputations/samantha-data
- Dataset CodeFeedback Filtered Instruction: https://huggingface.co/datasets/m-a-p/CodeFeedback-Filtered-Instruction
- Dataset Code Feedback: https://huggingface.co/datasets/m-a-p/Code-Feedback
