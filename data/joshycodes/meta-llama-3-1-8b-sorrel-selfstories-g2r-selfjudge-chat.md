# joshycodes/meta-llama-3.1-8b-sorrel-selfstories-g2r-selfjudge-chat

## Resumen

meta-llama-3.1-8b-sorrel-selfstories-g2r-selfjudge-chat es un ajuste conversacional (step de chat) construido por el usuario joshycodes sobre su propio modelo intermedio meta-llama-3.1-8b-sorrel-selfstories-g2r-midtrain, que a su vez parte de la arquitectura Llama 3.1 de 8B. Se trata de un artefacto de investigacion privado vinculado a un proyecto de "Anthropic Fellows" sobre entrenamiento de caracter enmarcado en el concepto de flourishing (pitch de Wang y Jermyn, 2026-04-22), no de un modelo destinado a distribucion publica.

El modelo tiene 8.030.261.248 parametros (8,03 B) en formato safetensors y un repositorio de 32,1 GB. El entrenamiento del step de chat consumio 3.008.012 tokens de un dataset local denominado self-5k.jsonl, con un descenso de loss de 0,8556 a 0,788 en una sola epoca, secuencia de 4096 tokens y learning rate de 1e-05, ejecutado sobre 1 GPU NVIDIA H200 en RunPod.

Su relevancia es exclusivamente interna: la licencia es internal-research y la propia model card indica "do not redistribute". No hay descargas ni likes registrados, no se declara pipeline, idiomas ni resultados de evaluacion, por lo que cualquier uso profesional fuera del equipo que lo entrena queda descartado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only de la familia Llama 3.1; ajuste sobre joshycodes/meta-llama-3.1-8b-sorrel-selfstories-g2r-midtrain |
| Parametros totales | 8.030.261.248 (8,03 B) |
| Parametros activos | no aplica (modelo denso, no es MoE) |
| Longitud de contexto | 4096 tokens en el entrenamiento del step de chat; la ventana nativa del backbone Llama 3.1 no se confirma en la informacion disponible |
| Tipos de cuantizacion | no disponible; el repositorio publica unicamente pesos safetensors |
| Idiomas soportados | no disponible |
| Licencia | other / internal-research (artefacto de investigacion privado, no redistribuir) |
| Formato de pesos | safetensors (repositorio de 32,1 GB) |

## Arquitectura y entrenamiento

La base es un transformer decoder-only de 8,03 B parametros de la familia Llama 3.1, sin componentes MoE ni arquitecturas hibridas segun los datos disponibles. El modelo de partida es meta-llama-3.1-8b-sorrel-selfstories-g2r-midtrain, en la revision 4cfe67743d09, que a su vez procede de un proceso de continued pretraining etiquetado como flourishing-training. El step documentado en esta ficha corresponde al ajuste conversacional final, identificado como step "chat".

Los hiperparametros del step de chat son: learning rate 1e-05, seq_len 4096, micro_batch 8, grad_accum 8 (batch efectivo de 64 secuencias) y 1,0 epocas. El run, con identificador meta-llama-3.1-8b-sorrel-selfstories-g2r-midtrain-local-self-5k.jsonl-c-0915-1113, consumio 3.008.012 tokens del fichero local self-5k.jsonl (configuracion self-5k) sobre 1 GPU NVIDIA H200 en RunPod, con semilla 20260821 y el commit a0afb77669ae del lanzador del repositorio flourishing-training. La unica metrica reportada es la loss, que pasa de 0,8556 a 0,788. No se documentan tecnicas de RLHF, DPO, decodificacion especulativa ni metodos de atencion alternativa; el sufijo "selfjudge" del nombre no se explica en la model card.

## Capacidades

- Generacion de texto conversacional multi-turno, derivada del backbone Llama 3.1 8B y del ajuste de chat sobre 3,0 M de tokens.
- Entrenamiento orientado a "self-stories" y a flourishing, segun las etiquetas del repositorio; su comportamiento concreto en ese eje no esta documentado con ejemplos.
- Posible componente de autoevaluacion sugerido por el sufijo "selfjudge", sin descripcion tecnica que lo confirme.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponibles; no se declara ninguna lista de idiomas.
- Capacidades especiales (modo thinking, vision, audio): no disponibles.

## Casos de uso

- Investigacion interna sobre entrenamiento de caracter: el modelo sirve como punto de comparacion frente a su predecesor midtrain para medir el efecto del step de chat en las respuestas del sistema.
- Generacion de "self-stories" sinteticas: dado el nombre de la familia y del dataset self-5k.jsonl, es plausible usarlo para producir narrativas de auto-descripcion que alimenten iteraciones posteriores del pipeline de flourishing-training, siempre dentro del equipo.
- Evaluacion de jueces automaticos: el sufijo selfjudge-chat apunta a un uso como evaluador de sus propias salidas o de las de otros modelos en experimentos de preferencias, con la advertencia de que no hay validacion publicada.
- Ablaciones controladas de hiperparametros: al estar documentados lr, seq_len, batch efectivo, epocas y semilla, es reproducible para estudiar variaciones sobre el mismo dataset de 3,0 M de tokens.
- Replicacion de experimentos en hardware unico: el run completo cupo en 1 GPU H200, lo que permite repetir el entrenamiento con un solo nodo y comparar curvas de loss.
- Prototipado conversacional interno de baja criticidad: conversaciones de asistencia para el propio equipo de investigacion, nunca expuestas a usuarios externos ni a produccion, dado que la licencia prohibe la redistribucion.
- Analisis de deriva de estilo: comparar las respuestas de este checkpoint con las del modelo intermedio permite estudiar como cambia el tono y la estructura del discurso tras 3,0 M de tokens de ajuste de chat.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La unica metrica reportada por el autor es la loss de entrenamiento del step de chat, que evoluciona de 0,8556 a 0,788 sobre 3.008.012 tokens vistos en 1,0 epocas.

| Metrica | Valor |
|---|---|
| MMLU | no disponible |
| HumanEval | no disponible |
| GSM8K | no disponible |
| Loss de entrenamiento (inicio) | 0,8556 |
| Loss de entrenamiento (final) | 0,788 |
| Tokens vistos | 3.008.012 |

## Requisitos de hardware

- VRAM estimada para inferencia en fp16/bf16: en torno a 16 GB solo para pesos, mas cache KV; con secuencias de 4096 tokens conviene reservar 20-24 GB.
- VRAM estimada en cuantizacion de 8 bits: aproximadamente 9-10 GB de pesos; en 4 bits, aproximadamente 5-6 GB, mas cache KV.
- GPU recomendadas para fp16 sin cuantizar: A100 40 GB, H100 80 GB, L40S 48 GB. El entrenamiento documentado se ejecuto en 1x NVIDIA H200.
- GPU de consumo: cabe en RTX 4090 (24 GB) y RTX 3090 (24 GB) en fp16 con contexto moderado; en tarjetas de 8-12 GB requeriria cuantizacion de 4 bits.
- Opciones de despliegue: transformers y vLLM o TGI para safetensors en fp16; llama.cpp u Ollama exigirian convertir los pesos a GGUF, conversion no publicada por el autor.
- Latencia y throughput: no disponibles. No se han publicado mediciones de inferencia; el unico dato de hardware es la H200 usada para el entrenamiento.
- Almacenamiento: el repositorio ocupa 32,1 GB, por lo que la descarga requiere ese espacio antes de cualquier cuantizacion.

## Comparativa con modelos similares

La comparativa con terceros se basa en documentacion publica general y no forma parte de la informacion proporcionada para este modelo; los campos de benchmark quedan como no disponibles en todos los casos.

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Benchmarks |
|---|---|---|---|---|---|
| meta-llama-3.1-8b-sorrel-selfstories-g2r-selfjudge-chat | 8,03 B | 4096 en el step de chat | internal-research (no redistribuir) | repositorio privado, 0 descargas | no disponibles |
| meta-llama-3.1-8b-sorrel-selfstories-g2r-midtrain | no confirmado en la informacion disponible | no disponible | no disponible | checkpoint intermedio del mismo autor | no disponibles |
| Llama 3.1 8B Instruct | 8,03 B (aproximado) | 128 k tokens (segun documentacion publica de Meta) | licencia comunitaria de Meta con condiciones | publico y ampliamente distribuido | no disponibles en esta ficha |
| Alternativas abiertas de ~7-8 B (por ejemplo Qwen 2.5 7B o Mistral 7B) | rango 7-8 B (aproximado) | no disponible | licencias abiertas propias de cada proyecto | publicas | no disponibles en esta ficha |

## Limitaciones y advertencias

- Licencia internal-research: es un artefacto de investigacion privado y la model card indica explicitamente "do not redistribute". No esta permitido su uso comercial ni su redistribucion.
- Sesgos conocidos: no disponibles; no se ha publicado ninguna evaluacion de sesgo, toxicidad o alineacion.
- Riesgo de alucinacion: no evaluado. El ajuste se hizo sobre 3,0 M tokens de un dataset local, un volumen muy reducido, sin etapa de RLHF ni DPO documentada.
- Limitaciones de contexto: el entrenamiento se realizo con seq_len de 4096 tokens; no hay evidencia de que el modelo mantenga calidad en ventanas mayores aunque el backbone lo permita.
- Limitaciones de idioma: no se declara ninguna lista de idiomas soportados. El dataset self-5k.jsonl no esta descrito, por lo que se desconoce su composicion linguistica.
- Trazabilidad limitada: dependencias de un checkpoint intermedio (4cfe67743d09) y de un commit concreto del lanzador (a0afb77669ae) del repositorio flourishing-training, sin URL publica en la informacion disponible.
- Senal de calidad escasa: 0 descargas y 0 likes, sin pipeline declarado, sin evaluaciones y con un unico run de 1,0 epoca. No hay evidencia empirica de su comportamiento fuera del conjunto de entrenamiento.
- Uso en produccion desaconsejado: la combinacion de licencia restrictiva, ausencia de benchmarks y falta de documentacion sobre datos y sesgos lo invalida para cualquier despliegue real.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/joshycodes/meta-llama-3.1-8b-sorrel-selfstories-g2r-selfjudge-chat
- Modelo base (checkpoint intermedio): https://huggingface.co/joshycodes/meta-llama-3.1-8b-sorrel-selfstories-g2r-midtrain
- Repositorio flourishing-training (commit del lanzador a0afb77669ae): sin URL publica en la informacion disponible
- Referencia del proyecto (pitch de Wang y Jermyn, 2026-04-22): sin URL publica en la informacion disponible
- Resultados de la busqueda web: la busqueda no devolvio enlaces relacionados con este modelo; todos los resultados correspondian a paginas genericas de Wikipedia, sin material tecnico aprovechable.
