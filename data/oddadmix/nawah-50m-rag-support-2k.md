# oddadmix/Nawah-50M-RAG-Support-2K

## Resumen

Nawah-50M-RAG-Support-2K es un modelo de lenguaje pequeño (51,8 millones de parámetros) especializado en atención al cliente en árabe moderno estándar (MSA) con generación aumentada por recuperación (RAG). Desarrollado por oddadmix (Ahmed Wasfy), el modelo responde preguntas de clientes basándose exclusivamente en pasajes de una base de conocimiento proporcionados en el prompt, y rechaza educadamente cuando la respuesta no se encuentra en dichos pasajes. Su relevancia radica en que consigue una tasa de alucinación del 4,6 % tras un entrenamiento con SFT y GRPO, siendo lo bastante pequeño para ejecutarse en CPU con una huella de solo 38 MB cuantizado.

Arquitectónicamente es un transformer causal estilo Llama (12 capas, dimensión oculta 512, 8 cabezas de atención con 4 KV, SwiGLU) con una ventana de contexto de 2.048 tokens, suficiente para unos ocho pasajes recuperados. El modelo se entrenó desde cero a partir de la base `oddadmix/50M-2048-Emhotob` y se ajustó con tres datasets propios de RAG y chat en árabe, seguidos de dos rondas de optimización con GRPO. Está disponible en formato safetensors (bf16) y en cuantizaciones GGUF para llama.cpp, bajo licencia Apache 2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LlamaForCausalLM (transformer causal) |
| Parametros totales | 51.787.264 |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | 2.048 tokens |
| Tipos de cuantizacion | bf16 (safetensors), F16 GGUF, Q8_0 GGUF, Q4_K_M GGUF |
| Idiomas soportados | Arabe moderno estandar (MSA) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors, GGUF |

## Arquitectura y entrenamiento

El modelo usa una arquitectura transformer causal estándar tipo Llama con normalización RMSNorm, activación SwiGLU y atención con cabezas agrupadas (4 KV heads). El vocabulario es de 32.002 tokens, construido con un BPE byte-level orientado al árabe más dos tokens especiales de ChatML. La ventana de contexto es de 2.048 tokens, pensada para acomodar el preámbulo del sistema, los pasajes numerados y la pregunta del usuario.

El entrenamiento se realizó en tres fases: primero un pretraining desde cero sobre el modelo base `50M-2048-Emhotob`; después un ajuste supervisado (SFT) con los datasets `arabic-rag-support-25K` y `arabic-rag-chat-30K`; y finalmente dos rondas de optimización con GRPO (Group Relative Policy Optimization) sobre `arabic-rag-chat-grpo-5K`. La segunda ronda de GRPO redujo la tasa de alucinación del 8,8 % al 4,6 % y mejoró la puntuación del juez de 1,57 a 1,68 sobre 2. El modelo está diseñado para conversación de un solo turno: una pregunta, una respuesta fundamentada.

## Capacidades

- Generacion de texto en arabe moderno estandar (MSA) con estilo de atencion al cliente.
- Respuesta fundamentada en pasajes de base de conocimiento: solo utiliza la informacion proporcionada en el prompt del sistema.
- Rechazo explicito cuando la respuesta no esta en los pasajes, con ofrecimiento de derivar a un agente humano.
- Conversacion de un solo turno (single-turn), sin soporte de historial multi-turno.
- No soporta tool calling, function calling, agentes, vision ni audio.
- Capacidad multilingue limitada al arabe; no se ha evaluado en otros idiomas.

## Casos de uso

- Atencion al cliente automatizada en arabe: el modelo puede gestionar consultas frecuentes de clientes sobre facturacion, cancelaciones, politicas de devolucion, etc., respondiendo solo con la informacion de la base de conocimiento corporativa.
- Chatbots de soporte en sitios web arabes: integrable como endpoint de chat en plataformas web o moviles, con la ventaja de ejecutarse en CPU sin necesidad de GPU dedicada.
- Sistemas de FAQ dinamicos: dado un conjunto de articulos de ayuda, el modelo genera respuestas personalizadas a preguntas de usuarios sin requerir una base de datos de pares pregunta-respuesta predefinida.
- Asistentes virtuales en centros de contacto: puede actuar como primer nivel de atencion, derivando al agente humano cuando no encuentra la respuesta, reduciendo la carga del equipo de soporte.
- Prototipos y pruebas de concepto de RAG en arabe: su tamano reducido y su licencia permisiva permiten experimentar con pipelines de recuperacion y generacion sin costes de infraestructura.
- Despliegue en dispositivos con recursos limitados: las cuantizaciones GGUF (38-57 MB) permiten ejecutar el modelo en Raspberry Pi, moviles o servidores de baja potencia.

## Benchmarks y rendimiento

No se han publicado resultados en benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) porque el modelo es especializado y de tamano muy reducido. La model card proporciona una evaluacion propia sobre 500 filas de validacion (empresas no vistas en entrenamiento), juzgada por Gemma-4-31B. La puntuacion del juez va de 0 a 2 sobre filas respondibles; el rechazo se mide por separado sobre 54 filas no respondibles.

| Metrica | SFT | GRPO r1 | Nawah-50M (GRPO r2) |
|---|---|---|---|
| Judge score (0-2) | 1,41 | 1,57 | 1,68 |
| Tasa de alucinacion | 16,0 % | 8,8 % | 4,6 % |
| Rechazo en no respondibles | 98,1 % | 98,1 % | 96,3 % |
| Respuesta cuando es respondible | 98,2 % | 98,2 % | 98,7 % |
| chrF++ vs respuesta de referencia | 65,79 | 68,07 | 70,12 |

Para contexto, el modelo profesor de 31B que genero los datos de entrenamiento obtiene 1,96 de judge score y 66,47 de chrF++ en la misma particion. Nawah-50M alcanza el 86 % del judge score del profesor con el 0,17 % de sus parametros, y lo supera en chrF++.

La evaluacion de cuantizaciones (decodificacion greedy, sin penalizacion de repeticion) muestra que Q8_0 es practicamente indistinguible de bf16, mientras que Q4_K_M degrada ligeramente el rechazo:

| Variante | Tamano | Alucinacion | Judge score | Rechazo | chrF++ | Respuestas identicas a bf16 |
|---|---|---|---|---|---|---|
| bf16 (safetensors) | 103,6 MB | 4,2 % (21) | 1,70 | 96,3 % (52/54) | 70,79 | — |
| F16 GGUF (referencia) | 105,5 MB | 3,4 % (17) | 1,70 | 96,3 % (52/54) | 70,68 | 92,2 % |
| Q8_0 | 57,0 MB | 4,0 % (20) | 1,70 | 96,3 % (52/54) | 70,46 | 89,6 % |
| Q4_K_M | 38,2 MB | 4,6 % (23) | 1,68 | 92,6 % (50/54) | 69,90 | 66,6 % |

## Requisitos de hardware

- VRAM estimada: 0,2 GB en bf16 (103,6 MB de pesos), por lo que cabe en cualquier GPU consumer, incluso integradas.
- CPU: ejecutable en CPU con las cuantizaciones GGUF; el modelo Q4_K_M ocupa 38,2 MB y Q8_0 57,0 MB.
- GPUs recomendadas: cualquier GPU con al menos 1 GB de VRAM; no requiere GPU dedicada para inferencia.
- Opciones de despliegue: transformers (Python), llama.cpp / llama-server (con plantilla ChatML embebida), compatible con endpoints de text-generation-inference (TGI).
- Rendimiento en CPU: 16-19 filas/s con prompts de ~1.000 tokens y respuestas cortas (medido bajo carga, considerar como limite inferior). El trabajo esta dominado por el prefill, donde la cuantizacion ayuda poco.

## Comparativa con modelos similares

No se dispone de modelos comparables del mismo tamano y especializacion en RAG para arabe. La unica referencia directa es el modelo profesor de 31B (Gemma-4-31B) usado para generar los datos de entrenamiento, que no es comparable en tamano ni en coste. El modelo base `oddadmix/50M-2048-Emhotob` carece del ajuste RAG y de la optimizacion GRPO, por lo que no es una alternativa directa. En el ecosistema de modelos arabes pequenos, no hay datos publicos de alternativas con caracteristicas equivalentes.

## Limitaciones y advertencias

- Idioma limitado al arabe moderno estandar; no se ha evaluado en dialectos arabes ni en otros idiomas.
- Conversacion de un solo turno: no mantiene historial ni contexto entre preguntas.
- Contexto maximo de 2.048 tokens, lo que limita el numero de pasajes recuperables a unos ocho; pasajes mas largos o numerosos pueden degradar la respuesta.
- Dependencia critica del formato exacto del prompt: el preambulo, la numeracion de pasajes y la separacion con linea en blanco deben replicarse literalmente; cualquier variacion reduce la calidad de la fundamentacion.
- Tasa de alucinacion residual del 4,6 %: aunque baja, no es cero; en entornos de produccion se recomienda validacion adicional.
- El rechazo en preguntas no respondibles cae al 96,3 % tras GRPO r2 (frente al 98,1 % en SFT), lo que implica que en ~4 de cada 100 consultas sin respuesta el modelo podria inventar una.
- La cuantizacion Q4_K_M muestra una degradacion consistente en el rechazo (92,6 %) y diverge en un tercio de las respuestas; se recomienda Q8_0 salvo que el tamano sea critico.
- No soporta tool calling, function calling ni integracion con agentes externos.
- Licencia Apache 2.0 permite uso comercial sin restricciones, pero el autor no ofrece garantias de exactitud ni soporte.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/oddadmix/Nawah-50M-RAG-Support-2K
- Demo interactiva (Space): https://huggingface.co/spaces/oddadmix/Nawah-50M-RAG-Support-Demo
- Modelo base: https://huggingface.co/oddadmix/50M-2048-Emhotob
- Perfil de GitHub del autor: https://github.com/Oddadmix
- Ficha del modelo base en LLM Explorer: https://llm-explorer.com/model/oddadmix%2F50M-2048-Emhotob,7GAmmMJRucmhUIt26wuer
