# hhoyaa/qwen35-fashion-864-lora-v2

## Resumen

`hhoyaa/qwen35-fashion-864-lora-v2` es un adaptador LoRA en coreano para el modelo base `unsloth/Qwen3.5-4B`, desarrollado por el usuario hhoyaa en el contexto de un proyecto de agente de moda con IA (AI Fashion Agent). No es un modelo completo, sino un adaptador PEFT (unos 0,1 GB en el repositorio) que se carga sobre el modelo base Qwen3.5 de 4.000 millones de parametros. Su proposito es especializar el modelo en dos tareas concretas: el enrutamiento de llamadas a herramientas (tool calling) sobre cuatro fuentes de contexto externo y la generacion de recomendaciones de conjuntos ("looks") en JSON segun un esquema fijo de cinco ranuras.

El modelo resuelve un problema de integracion en pipelines de agentes: dado un perfil de usuario, un armario, el clima y eventos de calendario, decide que herramientas consultar y devuelve una estructura JSON validable con cinco propuestas de outfit. Esta pensado para usarse dentro de un bucle de agente en backend (FastAPI, vLLM, RunPod) y no como asistente generalista.

Su relevancia es limitada y muy especifica: se entrena con solo 864 ejemplos SFT en coreano durante una epoca, lo que lo convierte en un ejemplo de adaptador de dominio estrecho mas que en un modelo de proposito general. La licencia Apache-2.0 facilita su reutilizacion, pero su utilidad fuera del dominio de la moda en coreano es practicamente nula.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (PEFT) sobre un transformer causal decoder-only (Qwen3.5-4B) |
| Parametros totales | No disponible (adaptador de 0,1 GB; el modelo base tiene 4.000 millones) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 4.096 tokens configurados en el ejemplo de inferencia (el modelo base puede soportar mas; no confirmado) |
| Tipos de cuantizacion | No especificado en la model card; el ejemplo usa FP16 (`load_in_4bit=False`); el modelo base admite cuantizacion 4-bit via Unsloth |
| Idiomas soportados | Coreano (ko) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El adaptador se entrena sobre `unsloth/Qwen3.5-4B`, un transformer causal decoder-only de la familia Qwen3.5 con 4.000 millones de parametros. La tecnica empleada es LoRA (Low-Rank Adaptation) mediante la libreria Unsloth y el stack TRL/Transformers, lo que permite ajustar solo una fraccion de los pesos y mantener el repositorio en 0,1 GB. No se detalla el rango (rank), alpha ni los modulos objetivo del adaptador.

Los datos de entrenamiento consisten en 864 ejemplos SFT en coreano (el nombre del modelo lo indica), entrenados durante una sola epoca. El conjunto completo de 1.080 ejemplos se dividio de forma estricta en entrenamiento, validacion y test, con verificacion de ausencia de duplicados entre particiones y una longitud maxima de secuencia de 1.901 tokens. No se menciona el uso de RLHF, DPO ni tecnicas de alineacion adicionales. El entrenamiento se orienta a dos modos de prompt de sistema: `TC_SYSTEM` (enrutamiento de tool calling) y `FR_SYSTEM` (generacion de cinco looks en JSON). No se documentan innovaciones arquitectonicas propias; el valor esta en el formateo estructurado de salidas y en el enrutamiento controlado de herramientas.

## Capacidades

- Generacion de texto en coreano orientada al dominio de la moda y la recomendacion de outfits.
- Tool calling / function calling restringido a cuatro herramientas: `get_user_context`, `get_wardrobe`, `get_weather` y `get_calendar_events`.
- Enrutamiento selectivo: decide que herramientas invocar segun la peticion y devuelve `direct_answer` en JSON para preguntas de cultura general de moda sin necesidad de herramientas.
- Generacion de JSON estructurado con cinco ranuras fijas: `preference_best`, `preference_alternative`, `exploration`, `wardrobe_best` y `wardrobe_alternative`.
- Distincion entre recomendaciones generales (LOOK 1-3, con `item_id: null`) y recomendaciones basadas en el armario real (LOOK 4-5, con `item_id` del armario).
- Gestion de ranuras no realizables mediante `status: "unavailable"` y motivo explicito.
- Razonamiento multi-paso dentro de un bucle de agente (consulta de contexto, luego generacion de recomendacion).
- No soporta vision, audio ni modo de razonamiento explicito (el ejemplo usa `enable_thinking=False`).

## Casos de uso

- Agente de recomendacion de moda en produccion: el adaptador se carga sobre Qwen3.5-4B en un servidor vLLM o RunPod y responde a peticiones de usuarios con JSON de cinco looks validable contra un esquema, integrándose en el backend FastAPI del servicio.
- Enrutamiento de herramientas en un bucle de agente: el modelo decide si necesita consultar perfil, armario, clima o calendario antes de responder, reduciendo llamadas innecesarias a APIs externas (Kakao Local, API meteorologica de Corea, Google Calendar).
- Recomendacion basada en armario real: para usuarios con armario registrado en PostgreSQL, el modelo genera los looks 4 y 5 usando exclusivamente `item_id` existentes, lo que permite renderizar prendas reales en el frontend.
- Consultas de cultura general de moda: responde directamente (`direct_answer`) a preguntas simples sin invocar herramientas, lo que ahorra latencia y coste en el pipeline.
- Personalizacion por clima y agenda: incorpora temperatura, probabilidad de precipitacion y eventos de calendario al contexto para ajustar las recomendaciones (por ejemplo, un evento nocturno con 13 grados y cielo despejado).
- Generacion de alternativas de exploracion: la ranura `exploration` permite ofrecer estilos fuera de las preferencias declaradas, util para ampliar el repertorio del usuario sin romper las restricciones de color o fit.
- Prototipado rapido de agentes de dominio: al ser un adaptador pequeno (0,1 GB) sobre un modelo de 4B, se puede desplegar en una unica GPU consumer para pruebas de integracion antes de escalar.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el adaptador en si ocupa unos 0,1 GB; el modelo base Qwen3.5-4B en FP16 requiere aproximadamente 8 GB de VRAM, y en cuantizacion 4-bit alrededor de 3-4 GB (estimacion segun tamano, no confirmada en la model card).
- GPU recomendadas: A100 o H100 para despliegue en produccion con vLLM; RTX 4090 o RTX 3090 para desarrollo y pruebas.
- Cabe en GPU consumer: si, en tarjetas con 8 GB o mas en FP16 y en tarjetas con 4-6 GB usando cuantizacion 4-bit.
- Opciones de despliegue: Unsloth y PEFT para inferencia directa (segun el ejemplo oficial), vLLM con soporte de adaptadores LoRA, y servidores FastAPI/OpenAI-compatibles sobre RunPod.
- Latencia y throughput: no disponibles. El ejemplo oficial usa `max_new_tokens=512` para enrutamiento y `max_new_tokens=1400` para generacion de looks, con decodificacion greedy en el primer caso y muestreo (temperatura 0,35, top_p 0,9, repetition_penalty 1,08) en el segundo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tipo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| hhoyaa/qwen35-fashion-864-lora-v2 | Adaptador sobre 4B | 4.096 (configurado) | LoRA de dominio (moda, coreano) | Apache-2.0 | Hugging Face |
| unsloth/Qwen3.5-4B (base) | 4.000 millones | No disponible | Transformer causal generalista | No disponible | Hugging Face |
| Adaptadores LoRA de dominio genericos | Variable | Variable | LoRA SFT | Variable | Hugging Face |

No se dispone de datos de benchmarks que permitan una comparacion cuantitativa con alternativas; la comparativa se limita a parametros, contexto y licencia.

## Limitaciones y advertencias

- Entrenado con solo 864 ejemplos SFT en una epoca: fuera de la distribucion de entrenamiento, las respuestas pueden volverse repetitivas o poco variadas.
- La evaluacion se realizo sobre un conjunto sintetico (`new_100`) disenado para puntuacion automatica estructural y funcional; no hay validacion con feedback real de usuarios (HITL) ni con datos de produccion.
- Riesgo de auto-simulacion en llamadas multiples: el modelo puede generar un `<tool_call>` y continuar generando un `<tool_response>` ficticio. Es obligatorio configurar `stop=["</tool_call>"]` en el bucle de inferencia.
- Riesgo de alucinacion de URLs de tiendas, URLs de imagenes o atributos e identificadores de prendas no presentes en el armario; la model card lo declara explicitamente fuera de alcance.
- Requiere validacion de esquema en backend: comprobacion de JSON, deteccion de `slot` duplicados dentro de un mismo look y verificacion de que los `item_id` de LOOK 4-5 existen en la base de datos.
- Idioma limitado al coreano; no se garantiza un comportamiento correcto en castellano ni en otros idiomas.
- Dominio muy restringido: no es adecuado para preguntas generales de conocimiento ni para tareas ajenas a la moda y la planificacion de vestimenta.
- Licencia Apache-2.0 permisiva para uso comercial, pero el modelo base Qwen3.5-4B tiene su propia licencia que debe verificarse por separado antes de desplegar en produccion.
- Sin datos publicados de benchmarks, latencia ni throughput; cualquier estimacion de rendimiento debe medirse en el entorno de despliegue concreto.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/hhoyaa/qwen35-fashion-864-lora-v2
- Modelo base: https://huggingface.co/unsloth/Qwen3.5-4B
- Repositorio GitHub del proyecto: https://github.com/2026-2-projects/ai-fashion-agent (rama `feature/qwen35-lora-v2`)
- Unsloth (libreria de entrenamiento e inferencia): https://github.com/unslothai/unsloth
- TRL (Transformer Reinforcement Learning): https://github.com/huggingface/trl
- PEFT (Parameter-Efficient Fine-Tuning): https://github.com/huggingface/peft
