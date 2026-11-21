# dphn/Dolphin3.0-Llama3.1-8B-GGUF

## Resumen

Dolphin 3.0 Llama 3.1 8B es un modelo de lenguaje instruct-tuned de 8.030.277.696 parámetros, desarrollado por Cognitive Computations (Eric Hartford, Ben Gitter, BlouseJury y colaboradores) y publicado en enero de 2025. Se construye sobre el modelo base meta-llama/Llama-3.1-8B mediante fine-tuning supervisado (SFT) sobre una mezcla curada de datasets abiertos orientados a código, matemáticas, function calling y conversación general. La versión aquí descrita es la cuantización GGUF distribuida por el usuario dphn, pensada para inferencia local en CPU y GPU de consumo.

La propuesta del modelo es ofrecer un asistente generalista "steerable": el propietario del sistema define el system prompt y, por tanto, el tono, las reglas y la alineación de las respuestas, sin las restricciones impuestas por APIs propietarias. Cubre casos de uso de programación, razonamiento matemático, agentes con tool calling y conversación multi-turno, y emplea la plantilla de chat ChatML.

Es relevante ahora porque combina la arquitectura Llama 3.1 (ampliamente soportada por el ecosistema de inferencia: llama.cpp, Ollama, vLLM, TGI, SGLang) con un conjunto de datos de entrenamiento orientado explícitamente a código y function calling, y se distribuye en formato GGUF listo para desplegar en hardware modesto. La model card no publica resultados de benchmarks (la sección de evaluaciones figura como "TBD").

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (heredada de meta-llama/Llama-3.1-8B) |
| Parametros totales | 8.030.277.696 |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (el modelo base Llama 3.1 soporta 128.000 tokens, pero la model card no lo confirma para este fine-tune) |
| Tipos de cuantizacion | GGUF (el repo incluye múltiples niveles de cuantización; la model card cita Q4_0 como ejemplo de uso) |
| Idiomas soportados | en (inglés) |
| Licencia | llama3.1 (Llama 3.1 Community License) |
| Formato de pesos | GGUF (repo de cuantizaciones); el fine-tune original se distribuye en safetensors en el repo de Cognitive Computations |
| Plantilla de chat | ChatML (`<|im_start|>` / `<|im_end|>`) |
| Modelo base | meta-llama/Llama-3.1-8B |
| Tamano del repo | 88,8 GB |
| Descargas | 61.864 |
| Likes | 260 |

## Arquitectura y entrenamiento

La arquitectura es la de Llama 3.1 8B: un transformer decoder-only denso con atención por grupos (GQA) y RoPE, sin modificaciones estructurales respecto al modelo base. El trabajo de Dolphin 3.0 consiste en un fine-tuning supervisado (SFT) sobre una mezcla de datasets abiertos, sin que la model card documente una fase posterior de RLHF o DPO. Los datasets declarados son: OpenCoder-LLM/opc-sft-stage1 y opc-sft-stage2 (código), microsoft/orca-agentinstruct-1M-v1 (instrucciones agénticas), microsoft/orca-math-word-problems-200k, AI-MO/NuminaMath-CoT y NuminaMath-TIR (matemáticas con cadena de pensamiento y tool-integrated reasoning), NousResearch/hermes-function-calling-v1 (function calling), allenai/tulu-3-sft-mixture, HuggingFaceTB/smoltalk, cognitivecomputations/samantha-data, cognitivecomputations/dolphin-coder, m-a-p/CodeFeedback-Filtered-Instruction y m-a-p/Code-Feedback.

La model card menciona el uso de un reward model de RLHFlow para filtrar los datasets y de DeepSeek-V3 como modelo auxiliar en el proceso de anotación y generación de datos (la frase queda truncada en el texto disponible). El entrenamiento se realizó con hardware cedido por patrocinadores: 16x L40S (Crusoe Cloud), 8x H100 bajo demanda (Akash) y 16x H100 (Lazarus). No se especifica el número total de tokens de entrenamiento ni la composición porcentual del dataset. La innovación principal no es arquitectónica sino de enfoque: un modelo generalista con control total del system prompt por parte del operador.

## Capacidades

- Generación de texto conversacional multi-turno con plantilla ChatML.
- Generación y razonamiento sobre código, con datasets específicos de instrucción de código en el entrenamiento (OpenCoder, dolphin-coder, CodeFeedback).
- Razonamiento matemático, incluyendo cadenas de pensamiento (NuminaMath-CoT) y razonamiento con herramientas (NuminaMath-TIR).
- Tool calling / function calling, entrenado con hermes-function-calling-v1.
- Comportamiento agéntico y multi-step reasoning, apoyado en orca-agentinstruct-1M-v1.
- Steerabilidad mediante system prompt: el operador define personaje, reglas y tono; el modelo no impone directrices de alineación propias.
- Capacidades multilingües: la model card declara únicamente inglés (`language: en`); no se documenta soporte de otros idiomas.
- No se documentan capacidades de visión, audio ni modo "thinking" explícito.

## Casos de uso

- Asistente de programación local: con un system prompt que fije el lenguaje (el ejemplo de la model card es un asistente exclusivo de Go), el modelo genera código y respuestas técnicas sin depender de APIs externas, lo que permite integrarlo en entornos con requisitos de confidencialidad.
- Automatización de function calling en pipelines internos: al estar entrenado con hermes-function-calling-v1, puede emitir llamadas estructuradas a herramientas dentro de flujos de automatización, encadenando varios pasos con el bucle de agente implementado en el orquestador.
- Tutoría de matemáticas paso a paso: los datos de NuminaMath-CoT y NuminaMath-TIR permiten generar explicaciones con razonamiento intermedio y resolución asistida por herramientas de cálculo.
- Despliegue en estación de trabajo con Ollama o LM Studio: la distribución GGUF permite ejecutar el modelo en local con `ollama run hf.co/cognitivecomputations/Dolphin3.0-Llama3.1-8B-GGUF:Q4_0`, útil para prototipado y uso personal sin GPU de datacenter.
- Generación de código en producción con vLLM, SGLang o TGI: estos motores están citados en la model card como vías de uso, lo que habilita servir el modelo con batching continuo para tareas de autocompletado o revisión de código.
- Asistente conversacional con personalidad y reglas propias: el control del system prompt permite definir el comportamiento (por ejemplo, un asistente de soporte con un tono y un conjunto de reglas concretos) sin que el modelo imponga sus propios criterios.
- Filtrado y reescritura de datos en pipelines de anotación: su combinación de instrucciones generales (tulu-3-sft-mixture, smoltalk) y código lo hace apto para tareas de transformación y clasificación de texto dentro de un flujo de preparación de datos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La sección de evaluaciones de la model card figura como "TBD" (pendiente), por lo que no se ofrecen cifras de MMLU, HumanEval, GSM8K ni comparaciones numéricas con otros modelos.

## Requisitos de hardware

- VRAM estimada para inferencia (valores orientativos según el tamaño de 8.030 millones de parámetros y el formato GGUF; no confirmados en la información proporcionada):
  - Cuantización Q4: aproximadamente 5-6 GB de VRAM/peso en memoria.
  - Cuantización Q5: aproximadamente 6-7 GB.
  - Cuantización Q8: aproximadamente 9 GB.
  - FP16 (pesos safetensors del fine-tune original): aproximadamente 16 GB.
- GPU recomendadas: cualquier GPU con al menos 8 GB de VRAM para cuantizaciones Q4/Q5; RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070/4080/4090 para mayor comodidad; A100 y H100 para servicio concurrente con vLLM o TGI.
- Cabe en GPU de consumo: sí, en cuantizaciones Q4 y Q5 en tarjetas de 8 GB o más; en Q8 requiere 12-16 GB.
- Opciones de despliegue citadas en la model card: Ollama, LM Studio, Hugging Face Transformers, vLLM, SGLang y TGI. llama.cpp es compatible por el formato GGUF, aunque no se cita explícitamente.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Dolphin3.0-Llama3.1-8B (este) | 8.030 M | no disponible en la ficha | llama3.1 | GGUF, safetensors | Fine-tune SFT con foco en código, matemáticas y function calling; steerable |
| meta-llama/Llama-3.1-8B-Instruct | 8.030 M | 128.000 tokens (modelo base) | llama3.1 | safetensors, GGUF (comunidad) | Modelo oficial de Meta con alineación propia; referencia directa del fine-tune |
| Qwen2.5-7B-Instruct | no disponible en la informacion proporcionada | no disponible en la informacion proporcionada | Apache 2.0 (según el modelo original) | safetensors, GGUF (comunidad) | Alternativa de tamaño similar citada indirectamente en la model card como referencia de papers |
| Mistral-7B-Instruct | no disponible en la informacion proporcionada | no disponible en la informacion proporcionada | Apache 2.0 (según el modelo original) | safetensors, GGUF (comunidad) | Alternativa de tamaño similar del ecosistema abierto |

No se dispone de datos de rendimiento comparativo entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- La model card no documenta evaluaciones de sesgo; al ser un modelo "uncensored" por diseño, puede producir contenido que otros modelos alineados rechazarían. El operador asume la responsabilidad del uso.
- Riesgo de alucinación inherente a los modelos de 8.000 millones de parámetros; no se han publicado métricas de fidelidad factual.
- Idioma: solo se declara inglés; el rendimiento en castellano no está garantizado ni evaluado.
- Longitud de contexto: la model card no confirma el contexto efectivo de este fine-tune; no debe asumirse que herede íntegramente los 128.000 tokens del modelo base sin verificación.
- Licencia Llama 3.1 Community License: impone restricciones para uso comercial (incluida la cláusula de 700 millones de usuarios mensuales y obligaciones de atribución); debe revisarse antes de un despliegue en producto.
- El entrenamiento se basa en datasets abiertos de terceros; la calidad y los sesgos de esos datasets se propagan al modelo.
- La sección de evaluaciones de la model card está pendiente ("TBD"), por lo que no hay evidencia publicada de rendimiento frente a alternativas.
- El repositorio GGUF tiene un tamaño de 88,8 GB porque agrupa múltiples cuantizaciones; conviene descargar solo el archivo del nivel deseado.

## Enlaces

- Modelo en Hugging Face (GGUF): https://huggingface.co/dphn/Dolphin3.0-Llama3.1-8B-GGUF
- Colección Dolphin 3.0: https://huggingface.co/collections/cognitivecomputations/dolphin-30-677ab47f73d7ff66743979a3
- Modelo base: https://huggingface.co/meta-llama/Llama-3.1-8B
- Organización Cognitive Computations: https://huggingface.co/cognitivecomputations
- Perfil de Eric Hartford: https://huggingface.co/ehartford
- Artículo sobre modelos uncensored: https://erichartford.com/uncensored-models
- Discord de Cognitive Computations: https://discord.gg/tCMkMDDHwm
- Ollama: https://ollama.com/download
- Dataset OpenCoder-LLM: https://huggingface.co/OpenCoder-LLM
- Dataset orca-agentinstruct-1M-v1: https://huggingface.co/datasets/microsoft/orca-agentinstruct-1M-v1
- Dataset hermes-function-calling-v1: https://huggingface.co/datasets/NousResearch/hermes-function-calling-v1
- Dataset NuminaMath-CoT: https://huggingface.co/datasets/AI-MO/NuminaMath-CoT
- Dataset tulu-3-sft-mixture: https://huggingface.co/datasets/allenai/tulu-3-sft-mixture
- Reward model RLHFlow: https://huggingface.co/RLHFlow
