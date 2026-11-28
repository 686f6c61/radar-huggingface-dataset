# nyxspecter4/kin-coder-7b-lora

## Resumen

KIN-Coder 7B (LoRA) es un adaptador PEFT de tipo LoRA, publicado por el usuario nyxspecter4, que se monta sobre el modelo base Qwen/Qwen2.5-Coder-7B-Instruct. No es un modelo entrenado desde cero, sino un ajuste fino supervisado (SFT) de aproximadamente 1.200 filas que traslada una serie de "hábitos" de ciberseguridad (ejercicios de decodificación, informes de seguridad y disciplina de evidencias) a una base ya especializada en código, añadiendo además ejemplos de uso de herramientas y de codificación agéntica.

El objetivo declarado es que el adaptador pueda pilotar un agente de programación (Factory Droid) mediante llamadas a herramientas con formato OpenAI, devolviendo `tool_calls` en un endpoint compatible con `POST /v1/chat/completions`. El adaptador se sirve fusionado en carga en el Space nyxspecter4/kin-cybersec sobre ZeroGPU. El repositorio ocupa 0,2 GB y contiene únicamente los pesos del adaptador en safetensors.

Por su naturaleza, se trata de un adaptador de estilo y formato de herramientas sobre un modelo base potente, no de una mejora de capacidades. Con 1.200 filas, una época y un conjunto de validación de 40 filas, su relevancia es acotada: resulta útil como ejemplo de pipeline de SFT con QLoRA orientado a tool calling y como experimento de especialización en ciberseguridad, pero no compite en rendimiento con el modelo base ni con ajustes de mayor escala.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre transformer decoder-only Qwen2.5-Coder-7B-Instruct |
| Parametros totales | no disponible (adaptador LoRA; el modelo base tiene 7B) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (heredada del modelo base Qwen2.5-Coder-7B-Instruct) |
| Tipos de cuantizacion | no disponible (entrenamiento con QLoRA segun tags; el adaptador se sirve fusionado en carga) |
| Idiomas soportados | en |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El adaptador se aplica sobre Qwen2.5-Coder-7B-Instruct, un transformer decoder-only de 7.000 millones de parámetros. El entrenamiento es un SFT con QLoRA (según los tags del repositorio) de una sola época sobre unas 1.200 filas, supervisando únicamente los tokens del asistente. La composición del dataset es la siguiente: 519 filas del conjunto curado KIN (biblioteca Kinetigor, generado el 2026-11-14, con ejercicios verificados automáticamente e informes sin verificar), 200 filas aleatorias de `sft.jsonl` del dataset nyxspecter4/kin-cyber-dpo-v2 (MIT), 250 filas multi-turno aleatorias de `func-calling.json` de NousResearch/hermes-function-calling-v1 (Apache-2.0, con respuestas de herramientas), 150 filas de ise-uiuc/Magicoder-OSS-Instruct-75K (60 Python, 60 TypeScript, 30 shell, MIT) y 146 trayectorias sintéticas de Droid (Read → Create/Edit → Execute `npm test` → corrección → verde) sobre 29 módulos JS pequeños, con resultados de herramientas reales capturados durante la generación.

Se reservaron 40 filas como conjunto de desarrollo. La tarea de prueba usada para evaluar el modelo (un test de tapCounter) no forma parte de los datos. No se documentan innovaciones técnicas adicionales (decodificación especulativa, atención lineal, RLHF/DPO sobre el adaptador, etc.); el entrenamiento es un SFT estándar de bajo volumen.

## Capacidades

- Generación de texto conversacional y asistencia de código, heredadas del modelo base Qwen2.5-Coder-7B-Instruct.
- Tool calling con formato OpenAI: el adaptador está entrenado con ejemplos de function calling multi-turno y devuelve `tool_calls` en el endpoint compatible servido en el Space.
- Codificación agéntica: trayectorias sintéticas de lectura, creación/edición de ficheros, ejecución de tests y corrección iterativa sobre módulos JavaScript.
- Hábitos de ciberseguridad: ejercicios de decodificación, informes de seguridad y disciplina de evidencias, según la model card.
- Soporte de Python, TypeScript y shell en los ejemplos de instrucción de código incluidos.
- Capacidades multilingües: limitadas al inglés según el campo `language` del repositorio.
- No se documentan capacidades de visión, audio ni modo de razonamiento extendido (thinking mode).

## Casos de uso

- Agente de programación sobre repositorios pequeños: el adaptador está entrenado con trayectorias Read → Edit → `npm test` → corrección, por lo que puede integrarse en bucles agénticos que editan código y validan con la suite de tests del proyecto.
- Integración en pipelines de CI/CD con tool calling: al devolver `tool_calls` en formato OpenAI, puede conectarse a orquestadores que ejecutan comandos, leen ficheros o consultan APIs como pasos de un flujo automatizado.
- Asistencia en tareas de ciberseguridad de bajo riesgo: generación de informes de seguridad y ejercicios de decodificación en entornos de formación, siempre con revisión humana dada la falta de verificación de parte de los datos.
- Prototipado de asistentes de código en inglés: útil para equipos que quieran experimentar con un adaptador ligero (0,2 GB) sobre Qwen2.5-Coder sin reentrenar el modelo base.
- Servicio de demostración en ZeroGPU: el Space kin-cybersec expone un endpoint compatible con OpenAI que puede usarse para probar la integración de un cliente de chat con soporte de herramientas.
- Base para experimentos de SFT con QLoRA: el repositorio documenta la composición exacta del dataset y el proceso, lo que lo convierte en una referencia para replicar pipelines de ajuste fino con PEFT.
- Evaluación comparativa de adaptadores de estilo: permite medir cuánto cambia el comportamiento de un modelo base al aplicar un adaptador de 1.200 filas centrado en formato de herramientas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card contiene un marcador `@@METRICS@@` sin rellenar y no incluye cifras de MMLU, HumanEval, GSM8K ni de evaluaciones de tool calling.

## Requisitos de hardware

- El adaptador pesa 0,2 GB, pero la inferencia requiere cargar el modelo base Qwen2.5-Coder-7B-Instruct completo.
- VRAM estimada para el modelo base: aproximadamente 14-16 GB en FP16/BF16, unos 8-9 GB en cuantización de 8 bits y unos 4-5 GB en cuantización de 4 bits (estimaciones orientativas, no confirmadas en la información proporcionada).
- GPU recomendadas: A100, H100 o L40S para servicio en producción; RTX 4090 (24 GB) para FP16 en una sola tarjeta; RTX 3090/4080 para cuantización de 8 bits.
- Cabe en GPU de consumo: sí, en RTX 4090 en FP16 y en tarjetas de 8-12 GB con cuantización de 4 u 8 bits.
- Opciones de despliegue: vLLM, TGI, llama.cpp u Ollama para el modelo base fusionado con el adaptador; el Space original usa ZeroGPU con un endpoint compatible con OpenAI.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tipo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| KIN-Coder 7B (LoRA) | 7B (base) + adaptador | no disponible | Adaptador LoRA sobre Qwen2.5-Coder | apache-2.0 | Hugging Face (0 descargas, 0 likes) |
| Qwen2.5-Coder-7B-Instruct | 7B | no disponible en esta ficha | Modelo base completo | apache-2.0 | Hugging Face (modelo oficial) |
| Adaptadores de tool calling sobre Qwen (p. ej. derivados de hermes-function-calling) | 7B (base) + adaptador | no disponible | Adaptador LoRA | según autor | Hugging Face |

La comparación con alternativas concretas no está disponible en la información proporcionada; los datos de rendimiento del adaptador frente al modelo base no se han publicado.

## Limitaciones y advertencias

- SFT de pequeño volumen (1.200 filas, una época): es un adaptador de estilo y formato de herramientas, no una mejora de capacidades; el autor lo indica explícitamente.
- Parte del conjunto KIN incluye informes de seguridad generados por LLM y sin verificar, lo que puede introducir contenido poco fiable en las respuestas.
- Riesgo de alucinación heredado del modelo base, especialmente en afirmaciones de seguridad y en código no cubierto por los ejemplos de entrenamiento.
- Idiomas: solo inglés según el campo `language`; no se garantiza un comportamiento correcto en castellano.
- Longitud de contexto no documentada en el adaptador; depende del modelo base y de la configuración de servicio.
- Licencia Apache-2.0 permite uso comercial, pero conviene verificar las licencias de los datasets de entrenamiento (MIT, Apache-2.0 y datos propios de Kinetigor) si se redistribuye.
- Modelo con 0 descargas y 0 likes: sin validación externa ni reportes de la comunidad.
- La evaluación se limita a una única tarea de prueba (tapCounter) no incluida en los datos; no hay benchmarks publicados.
- El adaptador debe fusionarse o cargarse junto al modelo base; no es utilizable de forma autónoma.

## Enlaces

- Repositorio del adaptador: https://huggingface.co/nyxspecter4/kin-coder-7b-lora
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-Coder-7B-Instruct
- Space de demostración: https://huggingface.co/spaces/nyxspecter4/kin-cybersec
- Dataset kin-cyber-dpo-v2: https://huggingface.co/datasets/nyxspecter4/kin-cyber-dpo-v2
- Dataset hermes-function-calling-v1: https://huggingface.co/datasets/NousResearch/hermes-function-calling-v1
- Dataset Magicoder-OSS-Instruct-75K: https://huggingface.co/datasets/ise-uiuc/Magicoder-OSS-Instruct-75K
