# shiva123782/Kaveri-0.5B-Enterprise-v1

## Resumen

Kaveri-0.5B-Enterprise-v1 es un modelo de lenguaje pequeno (SLM) de generacion de texto publicado por el usuario shiva123782 bajo la marca Kaveri Labs. No es un modelo entrenado desde cero: se trata de un adaptador LoRA (PEFT) ajustado sobre el modelo base Qwen2.5-0.5B-Instruct de Alibaba Cloud, con 0,5 mil millones de parametros. Resuelve el problema de obtener un asistente conversacional ligero y desplegable en hardware modesto, con un ajuste fino orientado a instrucciones sobre el dataset openassistant-guanaco.

La relevancia del modelo es limitada y conviene ser honesto: cuenta con 0 descargas y 0 likes en HuggingFace, esta unicamente en ingles y su unico resultado declarado es una perdida de entrenamiento de 0,842, sin benchmarks estandar (MMLU, HumanEval, GSM8K). La model card incluye afirmaciones de marketing no verificadas ("Banking-Grade Security", "SMT Assurance", "EU AI Act verified") que no estan respaldadas por artefactos publicos comprobables. Debe evaluarse como un experimento de ajuste fino sobre Qwen2.5-0.5B, no como un modelo enterprise certificado.

El contexto es el heredado de Qwen2.5-0.5B-Instruct (32.768 tokens segun la documentacion oficial de Qwen, aunque la model card de este adaptador no lo explicita) y la licencia es Apache-2.0, heredada del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2.5) con adaptador LoRA (PEFT) |
| Parametros totales | 0,5 mil millones (modelo base Qwen2.5-0.5B-Instruct) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible en la model card del adaptador (heredada del base Qwen2.5: 32.768 tokens segun documentacion de Qwen) |
| Tipos de cuantizacion | No disponible de forma explicita; al derivar de Qwen2.5 admite cuantizacion GGUF/AWQ tras fusion; la model card menciona un merge monolitico de 1,0 GB en fp16 |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | Adaptador PEFT/LoRA (safetensors via PEFT); fusionable a safetensors monolitico |

## Arquitectura y entrenamiento

El modelo es un adaptador LoRA entrenado con la libreria PEFT sobre Qwen2.5-0.5B-Instruct, un transformer decoder-only de la familia Qwen2.5. El entrenamiento de ajuste fino se realizo sobre el dataset timdettmers/openassistant-guanaco (conversaciones instruccionales), alcanzando una perdida de entrenamiento de 0,842. No se documentan hiperparametros de LoRA (rank, alpha, capas objetivo), numero de pasos, tokens vistos ni si hubo RLHF o DPO; la model card solo indica ajuste fino supervisado sobre dicho dataset.

La model card declara innovaciones tecnicas como "deterministic, mathematically verified fine-tuning architecture", un resultado "SMT Memory Invariant: UNSAT (Safe)" mediante Z3 y etiquetas como "eu-ai-act-verified" y "smt-z3-proven". No se aporta ningun artefacto verificable (script Z3, especificacion formal, informe de auditoria) que respalde estas afirmaciones, por lo que deben tratarse como declaraciones del autor sin validacion independiente. El flujo de despliegue descrito es el estandar de PEFT: cargar el base y adjuntar el adaptador, o ejecutar `merge_and_unload()` para obtener un modelo monolitico.

## Capacidades

- Generacion de texto conversacional instruccional en ingles, heredada del ajuste de Qwen2.5-0.5B-Instruct sobre openassistant-guanaco.
- Respuesta a preguntas de identidad (el autor garantiza que el modelo se identifica como Kaveri-0.5B-Enterprise-v1 de Kaveri Labs).
- Razonamiento basico y tareas simples de conocimiento general, limitado por el tamano de 0,5B.
- Soporte multilingue: solo ingles declarado; no se garantiza castellano ni otros idiomas.
- Tool calling / function calling: no disponible de forma documentada en el adaptador.
- Modo thinking, vision o audio: no disponible.
- Capacidades de agente multi-paso: no documentadas; el tamano del modelo y la ausencia de benchmarks lo hacen poco adecuado para ello.

## Casos de uso

- Prototipado rapido de asistentes conversacionales: sirve para validar pipelines de PEFT y plantillas de chat (`<|im_start|>`) antes de escalar a modelos mayores de la familia Qwen.
- Despliegue en hardware de bajos recursos: con 0,5B parametros en fp16 (aprox. 1 GB) cabe en CPU y GPUs integradas, util para demos locales o entornos embebidos.
- Experimentos academicos de ajuste fino: permite estudiar el efecto de LoRA sobre un base pequeno con un dataset publico conocido (guanaco).
- Generacion de texto auxiliar de baja latencia: resumenes cortos o reescritura de frases en ingles donde no se requiere alta precision.
- Base para fine-tuning posterior: al ser un adaptador PEFT, se puede reutilizar como punto de partida en investigacion sobre tecnicas de alineacion.
- Evaluacion de afirmaciones de seguridad formal: util como caso de estudio de model cards con claims no verificados (SMT, EU AI Act) frente a evidencia publica.

## Benchmarks y rendimiento

Datos declarados por el autor en el model-index (no verificados de forma independiente):

| Metrica | Dataset / tipo | Valor | Verificado |
|---|---|---|---|
| Training Loss | timdettmers/openassistant-guanaco | 0,842 | No |
| SMT Memory Invariant | z3_proof | UNSAT (Safe) | No |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. La perdida de entrenamiento no es una metrica de rendimiento en tareas y no permite comparacion fiable con otros modelos.

## Requisitos de hardware

- VRAM estimada para inferencia: aprox. 1 GB en fp16 para el modelo fusionado (el autor indica 1,0 GB para el monolitico); con cuantizacion de 4 bits se reduce por debajo de 0,5 GB.
- GPU recomendadas: cualquier GPU consumer moderna (RTX 3060, RTX 4090) con margen de sobra; tambien funciona en CPU.
- Cabe en GPU consumer: si, en practicamente todas, incluidas GPUs integradas con memoria compartida suficiente.
- Opciones de despliegue: transformers + PEFT (adaptador directo), vLLM, Ollama y llama.cpp tras fusionar y convertir a GGUF.
- Latencia y throughput: no disponibles; no se publican mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Kaveri-0.5B-Enterprise-v1 | 0,5B (LoRA) | Heredado de Qwen2.5 (32.768 segun doc. Qwen) | Apache-2.0 | HuggingFace, 0 descargas |
| Qwen2.5-0.5B-Instruct | 0,5B | 32.768 tokens | Apache-2.0 | HuggingFace, ampliamente usado |
| Qwen2.5-1.5B-Instruct | 1,5B | 32.768 tokens | Apache-2.0 | HuggingFace, ampliamente usado |
| SmolLM2-1.7B-Instruct | 1,7B | 8.192 tokens | Apache-2.0 | HuggingFace, ampliamente usado |

Kaveri-0.5B no aporta mejoras documentadas frente a su propio modelo base Qwen2.5-0.5B-Instruct, del que deriva; la unica diferencia es el ajuste LoRA sobre guanaco y el cambio de identidad. Para uso en produccion, el base original o variantes mayores (Qwen2.5-1.5B, SmolLM2-1.7B) ofrecen mayor capacidad y soporte comunitario.

## Limitaciones y advertencias

- Sesgos conocidos: heredados del base Qwen2.5 y del dataset guanaco; no se documenta evaluacion de sesgos.
- Riesgo de alucinacion: alto en un modelo de 0,5B sin benchmarks de veracidad; no apto para tareas factuales criticas.
- Limitaciones de contexto e idioma: solo ingles declarado; el contexto efectivo no se documenta en el adaptador.
- Restricciones de licencia: Apache-2.0 permite uso comercial, pero las afirmaciones de "EU AI Act verified" y "SMT proven" no estan respaldadas por evidencia publica y no deben citarse como certificacion real.
- Caveats de produccion: 0 descargas y 0 likes implican ausencia de validacion comunitaria; el autor no publica hiperparametros de entrenamiento ni evaluaciones; la perdida de 0,842 no demuestra calidad conversacional.
- El resultado "SMT Memory Invariant: UNSAT" no es un benchmark de rendimiento y su metodologia no se detalla.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/shiva123782/Kaveri-0.5B-Enterprise-v1
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-0.5B-Instruct
- Dataset de entrenamiento: https://huggingface.co/datasets/timdettmers/openassistant-guanaco
- Libreria PEFT: https://github.com/huggingface/peft
- Documentacion de Qwen2.5: https://qwen.readthedocs.io/
