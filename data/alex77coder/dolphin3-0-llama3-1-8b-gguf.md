# alex77coder/Dolphin3.0-Llama3.1-8B-GGUF

## Resumen

Dolphin 3.0 Llama 3.1 8B es un modelo de lenguaje instruct tuneado por Cognitive Computations (Eric Hartford, Ben Gitter y BlouseJury) a partir de meta-llama/Llama-3.1-8B. Se presenta como un modelo de propósito general pensado para uso local, con soporte declarado de codigo, matematicas, agentes y function calling, y con un enfoque de alineacion controlada por el propietario del sistema: el prompt de sistema define el tono y las reglas, sin restricciones impuestas por el proveedor.

Esta ficha concreta corresponde al repositorio alex77coder/Dolphin3.0-Llama3.1-8B-GGUF, una cuantizacion en formato GGUF del modelo original publicada por el usuario alex77coder, no por Cognitive Computations. El repo ocupa 88,8 GB y agrupa multiples niveles de cuantizacion; en el momento de la consulta registra 0 descargas y 0 likes, por lo que carece de validacion de la comunidad.

Tecnicamente hereda la arquitectura densa de Llama 3.1 8B, con 8.030.277.696 parametros y una ventana de contexto de 128.000 tokens. La licencia es la Llama 3.1 Community License y el unico idioma declarado es el ingles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso (heredada de Llama 3.1) |
| Parametros totales | 8.030.277.696 (~8B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 128.000 tokens (propiedad del modelo base Llama 3.1 8B) |
| Tipos de cuantizacion | GGUF; Q4_0 confirmado en la model card, resto de niveles no disponible |
| Idiomas soportados | Ingles (en) |
| Licencia | Llama 3.1 Community License |
| Formato de pesos | GGUF (este repositorio); safetensors en el modelo original |
| Plantilla de chat | ChatML (`<|im_start|>`, `<|im_end|>`) |
| Tamano del repositorio | 88,8 GB |
| Modelo base | meta-llama/Llama-3.1-8B |

## Arquitectura y entrenamiento

La arquitectura es la de Llama 3.1 8B: un transformer decoder-only denso con atencion por grupos de consultas (GQA) y RoPE, sin capas MoE ni mecanismos de estado (SSM). Sobre esa base, Cognitive Computations aplico un ajuste fino supervisado (SFT) utilizando una mezcla de datasets destacada en la model card: codigo (OpenCoder-LLM opc-sft-stage1 y opc-sft-stage2, cognitivecomputations/dolphin-coder, m-a-p/CodeFeedback-Filtered-Instruction, m-a-p/Code-Feedback), matematicas (AI-MO/NuminaMath-CoT, AI-MO/NuminaMath-TIR, microsoft/orca-math-word-problems-200k), agentes y function calling (microsoft/orca-agentinstruct-1M-v1, NousResearch/hermes-function-calling-v1), instrucciones generales (allenai/tulu-3-sft-mixture, HuggingFaceTB/smoltalk) y datos conversacionales (cognitivecomputations/samantha-data).

La model card indica que se utilizo el modelo de recompensa de RLHFlow para filtrar los datasets y DeepSeek-V3 para generacion de datos, aunque el texto disponible esta truncado en ese punto. El entrenamiento conto con recursos donados: 16x L40s (Crusoe Cloud), 8x H100 (Akash), 16x H100 (Lazarus) y servicios de inferencia de Cerebras para etiquetado. No se detalla el numero total de tokens de entrenamiento ni si hubo fases de RLHF o DPO adicionales al SFT.

## Capacidades

- Generacion de texto conversacional en ingles con plantilla ChatML.
- Generacion de codigo en multiples lenguajes, con datasets de codigo especificos en el entrenamiento.
- Razonamiento matematico, incluyendo resolucion paso a paso (CoT) y uso de herramientas (TIR) segun los datasets empleados.
- Soporte declarado de function calling / tool calling, respaldado por el dataset hermes-function-calling-v1.
- Capacidades agenticas y de razonamiento multi-paso, asociadas a orca-agentinstruct-1M-v1.
- Control de comportamiento mediante prompt de sistema: permite fijar rol, tono y reglas, incluida la restriccion a un lenguaje de programacion concreto.
- Modelo "steerable": el propietario del sistema define la alineacion, sin guias impuestas.
- No se declaran capacidades de vision, audio ni modo de pensamiento explicito (thinking mode) en la informacion disponible.

## Casos de uso

- Asistente de programacion local: el modelo puede generar y explicar codigo en multiples lenguajes y, mediante prompt de sistema, restringirse a un lenguaje concreto (por ejemplo, Go o Python) para equipos con estandares fijos.
- Generacion de codigo en pipelines de CI/CD: con soporte de tool calling, puede integrarse en flujos de revision o generacion de parches ejecutados de forma automatizada.
- Agentes autonomos multi-paso: su entrenamiento con orca-agentinstruct y hermes-function-calling lo hace adecuado para tareas encadenadas con invocacion de herramientas.
- Resolucion asistida de problemas matematicos: los datasets NuminaMath y orca-math permiten usarlo como tutor o asistente de calculo con razonamiento paso a paso.
- Atencion al cliente automatizada en ingles: gestion de conversaciones multi-turno con ventana de 128.000 tokens, util para hilos largos con historial extenso.
- Despliegue on-premise con control de datos: al ser un modelo local con licencia Llama 3.1, permite mantener las consultas dentro de la infraestructura propia, evitando enviar datos a APIs externas.
- Prototipado rapido en estaciones de trabajo: la version GGUF permite ejecutar el modelo en portatiles y equipos de sobremesa con ollama o LM Studio, sin GPU de datacenter.
- Personalizacion de asistentes: ajuste del tono y las reglas mediante prompt de sistema para casos de uso internos especificos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card original del modelo incluye una seccion "Evals" marcada como "TBD" (pendiente), y el repositorio de cuantizacion no aporta mediciones adicionales.

## Requisitos de hardware

- VRAM estimada para inferencia (valores orientativos segun cuantizacion):
  - Q4 (Q4_0/Q4_K_M): en torno a 5-6 GB.
  - Q5: en torno a 6-7 GB.
  - Q6: en torno a 7-8 GB.
  - Q8_0: en torno a 9-10 GB.
  - F16/FP16: en torno a 16-17 GB.
- GPU recomendadas: modelos de 8-16 GB de VRAM cubren las cuantizaciones bajas; RTX 3060 12 GB, RTX 4070, RTX 4080, RTX 4090 (24 GB) pueden ejecutar todas las cuantizaciones GGUF con holgura. Para servirlo en FP16 con contexto largo se recomienda A100, H100 o L40S.
- Compatibilidad con GPU de consumo: si, cabe en GPU de consumo. Una RTX 4090 o 3090 (24 GB) ejecuta cualquier cuantizacion, y una RTX 3060 de 12 GB cubre Q4-Q6.
- Opciones de despliegue: ollama (comando indicado en la model card: `ollama run hf.co/cognitivecomputations/Dolphin3.0-Llama3.1-8B-GGUF:Q4_0`), LM Studio, llama.cpp, HuggingFace Transformers, vLLM, SGLang y TGI (los tres ultimos para el modelo en safetensors).
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Dolphin 3.0 Llama 3.1 8B (esta cuantizacion) | 8,03B | 128k | Llama 3.1 Community | GGUF / safetensors | Instruct tuneado, enfoque steerable, soporte declarado de tool calling |
| meta-llama/Llama-3.1-8B-Instruct | 8,03B | 128k | Llama 3.1 Community | safetensors | Modelo base instruct oficial; alineacion fija |
| Hermes 3 Llama 3.1 8B | 8,03B | 128k | Llama 3.1 Community | safetensors / GGUF | Otro instruct tuneado sobre Llama 3.1, de NousResearch |
| Qwen2.5 7B Instruct | ~7,6B | 128k | Apache 2.0 | safetensors / GGUF | Licencia mas permisiva, soporte multilingue amplio |

No se dispone de resultados de benchmarks comparativos en la informacion proporcionada, por lo que la comparacion se limita a parametros, contexto, licencia y formato.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados en la informacion disponible; al entrenarse principalmente con datos en ingles, cabe esperar sesgos propios de ese corpus.
- Riesgo de alucinacion: inherente a los modelos de lenguaje de este tamano; no hay evaluaciones publicadas que lo cuantifiquen.
- Limitaciones de idioma: el unico idioma declarado es el ingles; el rendimiento en castellano u otros idiomas no esta garantizado.
- Control de alineacion: el modelo no impone guias eticas; el propietario del sistema es responsable del contenido generado. Esto exige definir un prompt de sistema explicito para evitar respuestas no deseadas.
- Licencia: Llama 3.1 Community License, con las restricciones habituales de Meta (condiciones de uso, requisitos de atribucion y clausulas para productos con mas de 700 millones de usuarios mensuales).
- Repositorio de terceros: esta cuantizacion la publica alex77coder, no Cognitive Computations; conviene verificar la integridad de los pesos frente al modelo original.
- Estado del repositorio: 0 descargas y 0 likes; sin evidencia de validacion por parte de la comunidad.
- Contexto largo: aunque hereda 128k tokens de Llama 3.1, la calidad efectiva en la parte alta de la ventana no esta documentada.
- Produccion: la model card original marca las evaluaciones como pendientes, por lo que no hay base publicada para estimar fiabilidad en tareas criticas.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/alex77coder/Dolphin3.0-Llama3.1-8B-GGUF
- Modelo original (Cognitive Computations): https://huggingface.co/cognitivecomputations/Dolphin3.0-Llama3.1-8B
- Coleccion Dolphin 3.0: https://huggingface.co/collections/cognitivecomputations/dolphin-30-677ab47f73d7ff66743979a3
- Modelo base: https://huggingface.co/meta-llama/Llama-3.1-8B
- Discord de Cognitive Computations: https://discord.gg/cognitivecomputations
- Ensayo sobre modelos sin censura: https://erichartford.com/uncensored-models
- Repositorio de cuantizacion GGUF equivalente del autor original: https://huggingface.co/cognitivecomputations/Dolphin3.0-Llama3.1-8B-GGUF
