# arnabwithab/ai-therapist-qwen3-4b-sft-lora

## Resumen

ai-therapist-qwen3-4b-sft-lora es un adaptador LoRA de ajuste supervisado (SFT) entrenado sobre el modelo base Qwen/Qwen3-4B-Instruct-2507, desarrollado por el usuario de HuggingFace arnabwithab. Su objetivo es especializar un modelo de lenguaje de 4.000 millones de parametros en conversaciones de estilo counselling (orientacion psicologica), a partir de dos conjuntos de datos publicos de dialogo terapeutico. Forma parte de la coleccion "Counselling SLMs" del mismo autor y se distribuye como adaptador PEFT en formato safetensors, no como modelo completo.

El adaptador se entreno con QLoRA de Unsloth durante 5 epocas con rango r=16, lo que implica un coste de entrenamiento bajo y un incremento minimo del peso del artefacto (el repositorio ocupa 0,1 GB). Al heredar la arquitectura y el contexto del Qwen3-4B-Instruct-2507, conserva las capacidades generales del modelo base y anade un sesgo estilistico hacia respuestas de acompanamiento emocional.

Es relevante ahora porque ejemplifica una tendencia practica: la especializacion barata de modelos abiertos de 4B para dominios sensibles mediante LoRA, desplegable con vLLM y `--enable-lora` sobre una unica GPU consumer. No obstante, su alcance es limitado: solo ingles, sin datos de benchmarks publicados y con un disclaimer explicito de que no sustituye a un profesional sanitario.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (base Qwen3-4B-Instruct-2507) + adaptador LoRA (PEFT) |
| Parametros totales | 4B en el modelo base; el adaptador LoRA es un incremento adicional (r=16, tamano exacto no disponible) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (heredada del modelo base Qwen3-4B-Instruct-2507) |
| Tipos de cuantizacion | QLoRA en entrenamiento (cuantizacion del base); el adaptador se distribuye en safetensors. Cuantizaciones de inferencia (GGUF, AWQ, GPTQ) no publicadas |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA); requiere el modelo base Qwen/Qwen3-4B-Instruct-2507 |

## Arquitectura y entrenamiento

El modelo es un adaptador LoRA de bajo rango (r=16) inyectado en el transformer decoder-only Qwen3-4B-Instruct-2507. El entrenamiento se realizo con Unsloth QLoRA, es decir, con el modelo base cuantizado en 4 bits y solo los pesos del adaptador actualizados, durante 5 epocas de SFT. No se menciona en la informacion disponible el uso de RLHF, DPO ni tecnicas de alineacion adicionales; el ajuste es puramente supervisado sobre pares de conversacion.

Los datos de entrenamiento proceden de dos datasets publicos: `nbertagnolli/counsel-chat` (dialogos de counselling con respuestas de terapeutas) y `Amod/mental_health_counseling_conversations` (conversaciones sobre salud mental). La model card no detalla el numero de tokens, la composicion exacta del dataset ni el reparto train/validation, por lo que estos datos deben considerarse no disponibles. La configuracion de muestreo usada en las evaluaciones del autor es temperatura 0,7 y top_p 0,8 con el modo thinking desactivado.

## Capacidades

- Generacion de texto conversacional en ingles con estilo de acompanamiento psicologico.
- Respuestas multi-turno orientadas a escucha activa y reformulacion, segun el dataset de counselling empleado.
- Hereda del modelo base Qwen3-4B-Instruct-2507 las capacidades generales de generacion, razonamiento y codigo, aunque el adaptador no las refuerza.
- Soporte de tool calling / function calling: no documentado en la informacion disponible para el adaptador (depende del modelo base).
- Soporte de agentes y razonamiento multi-paso: no documentado para el adaptador.
- Capacidades multilingues: limitadas al ingles segun la model card.
- Modo thinking: el autor indica que las evaluaciones se realizaron con thinking off; el adaptador no documenta un modo de razonamiento explicito.
- Vision y audio: no soportados.

## Casos de uso

- Prototipado de asistentes de acompanamiento emocional: el adaptador puede generar respuestas de estilo terapeutico en ingles para validar flujos de producto antes de invertir en un modelo mayor, gracias a su bajo coste de despliegue sobre una GPU consumer.
- Investigacion en NLP clinico: sirve como linea base especializada para comparar estilos de respuesta (empatia, reformulacion) frente al modelo base sin ajustar, usando el harness de evaluacion publicado en el repositorio del autor.
- Generacion de datos sinteticos de dialogo terapeutico: puede producir turnos de conversacion con registro de counselling para aumentar datasets de investigacion, siempre con revision humana posterior.
- Chatbot de primera acogida en ingles: integrable mediante vLLM con `--enable-lora` para atender consultas iniciales y derivar a recursos profesionales, con el disclaimer visible en la interfaz.
- Formacion y simulacion para estudiantes de psicologia: permite practicar entrevistas simuladas en ingles con un interlocutor que responde en estilo counselling, sin riesgo para pacientes reales.
- Despliegue economico en produccion de baja concurrencia: al ser un adaptador sobre un base de 4B, se puede servir en una sola GPU consumer con vLLM o transformers, manteniendo el modelo base compartido entre varios adaptadores LoRA.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card solo indica la configuracion de muestreo usada en las evaluaciones del autor (temperatura 0,7, top_p 0,8, thinking off) y remite al repositorio https://github.com/arnabwithab/ai-therapist para el harness de evaluacion, sin cifras concretas.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Como referencia orientativa del modelo base de 4B (no confirmada en la informacion proporcionada), en FP16 requeriria aproximadamente 8 GB y en cuantizacion de 4 bits alrededor de 3-4 GB, mas el overhead del adaptador LoRA.
- GPU recomendadas: no especificadas por el autor. Por tamano del base, cabria en RTX 4090, RTX 3090 y GPUs de 16 GB o mas en FP16; en cuantizacion, en GPUs consumer de 8 GB.
- Cabe en GPU consumer: si, previsiblemente en RTX 4090, 3090, 4080 y similares con cuantizacion, aunque el autor no publica requisitos oficiales.
- Opciones de despliegue: transformers + PEFT (ejemplo oficial en la model card) y vLLM con `--enable-lora` y `--lora-modules` (comando oficial en la model card). llama.cpp, Ollama y TGI no estan documentados para este adaptador.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Especializacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ai-therapist-qwen3-4b-sft-lora | 4B (base) + LoRA r16 | no disponible | Counselling en ingles | apache-2.0 | Adaptador PEFT en HuggingFace |
| Qwen/Qwen3-4B-Instruct-2507 (base) | 4B | no disponible | Proposito general, instrucciones | no disponible en la informacion proporcionada | Modelo completo en HuggingFace |
| Otros SLM de counselling de la coleccion del autor | no disponible | no disponible | Counselling | no disponible | Coleccion "Counselling SLMs" en HuggingFace |

La comparacion con alternativas de la misma categoria (modelos especializados en salud mental de tamano similar) no esta disponible en la informacion proporcionada.

## Limitaciones y advertencias

- No es un terapeuta: el propio autor advierte que la salida no debe tratarse como consejo legal verificable ni como sustituto de atencion profesional.
- Riesgo de alucinacion relevante en dominio clinico: el modelo puede generar afirmaciones sobre salud mental sin base cientifica, especialmente al estar ajustado sobre datasets de conversacion y no sobre guias clinicas validadas.
- Sesgos conocidos: no documentados por el autor; los datasets de origen (CounselChat y Amod) pueden introducir sesgos culturales y de estilo terapeutico no controlados.
- Limitacion de idioma: solo ingles; no se garantiza un comportamiento adecuado en castellano ni en otros idiomas.
- Limitacion de contexto: la longitud de contexto no se especifica en la model card del adaptador.
- Restricciones de licencia: apache-2.0 permite uso comercial, pero debe respetarse la licencia del modelo base Qwen/Qwen3-4B-Instruct-2507, no detallada en la informacion proporcionada.
- Caveat de produccion: requiere cargar el modelo base completo ademas del adaptador; no existe version cuantizada publicada en GGUF ni artefacto autonomo.
- Madurez baja: 18 descargas, 0 likes y creado en octubre de 2026; sin validacion externa ni benchmarks publicos.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/arnabwithab/ai-therapist-qwen3-4b-sft-lora
- Modelo base: https://huggingface.co/Qwen/Qwen3-4B-Instruct-2507
- Coleccion "Counselling SLMs": https://huggingface.co/collections/arnabwithab/counselling-slms-6ad06ab0ca4ce4cf5ceb5ca4
- Codigo y harness de evaluacion: https://github.com/arnabwithab/ai-therapist
- Dataset CounselChat: https://huggingface.co/datasets/nbertagnolli/counsel-chat
- Dataset Amod mental health counseling conversations: https://huggingface.co/datasets/Amod/mental_health_counseling_conversations
