# MANGSEOK123/qwen3-4b-tau2-telecom_1_setting4_n91-1ep

## Resumen

`MANGSEOK123/qwen3-4b-tau2-telecom_1_setting4_n91-1ep` es un ajuste fino del modelo denso Qwen3-4B-Instruct-2507 (4.411.424.256 parametros, ~4,41 B) orientado al dominio de telecomunicaciones del benchmark tau2-bench. El autor lo publica bajo licencia Apache 2.0 y lo describe como una "consolidacion con OEL" (experience-distillation) realizada sobre 90 pares tarea-memoria. No es un modelo de proposito general nuevo, sino un artefacto de investigacion que internaliza, mediante destilacion KL, el comportamiento de un "profesor" que dispone de una memoria especifica de tarea en el prompt de sistema.

El problema que aborda es el de la destilacion de experiencia: en lugar de anadir memoria externa en tiempo de inferencia, se entrena al "estudiante" para reproducir la distribucion de respuestas del profesor (los mismos pesos, pero con la memoria de la tarea en el system prompt) sin tener esa memoria disponible. La perdida es KL completa sobre todos los tokens de respuesta, con `kl_topk` 256, y no se emplea ninguna recompensa.

Se trata de un experimento muy pequeno (90 pares, batch 6, 1 epoca, 15 pasos de entrenamiento) que, segun la propia model card, se subio a HuggingFace justo despues de entrenar y sin evaluacion posterior. Su relevancia es acotada: sirve como referencia para quienes investigan destilacion de experiencias y agentes de tool calling en dominios verticales, pero no como modelo listo para produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (derivado de Qwen3-4B-Instruct-2507); no se detalla en la informacion proporcionada |
| Parametros totales | 4.411.424.256 (~4,41 B) |
| Longitud de contexto | No especificada en la informacion proporcionada; el ejemplo de despliegue del autor usa `--max-model-len 40960` |
| Tipos de cuantizacion | No se distribuyen variantes cuantizadas; pesos en safetensors (repo de 8,8 GB, coherente con bf16/fp16 a 2 bytes por parametro) |
| Idiomas soportados | No disponibles |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |
| Modelo base | Qwen/Qwen3-4B-Instruct-2507 |
| Autor | MANGSEOK123 |
| Fecha de publicacion | 2026-09-24 (metadatos de HuggingFace) |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura del Qwen3-4B-Instruct-2507, un transformer denso (no MoE) de aproximadamente 4,41 B de parametros. El repositorio solo contiene pesos en safetensors (8,8 GB), sin tarjetas de cuantizacion ni variantes GGUF publicadas. No se documenta la composicion del dataset de preentrenamiento original del modelo base, ni si hubo RLHF/DPO en esa fase.

El ajuste realizado por el autor sigue un esquema de destilacion de experiencias: el estudiante reproduce cada tarea sin memoria y el profesor son los mismos pesos con la memoria de esa tarea insertada en el system prompt. Los hiperparametros declarados son: 90 pares tarea-memoria, batch size 6, 1 epoca, learning rate 3e-6 constante, gradient clipping 1.0 (valor por defecto de verl), perdida KL completa sobre todos los tokens de respuesta con `kl_topk` 256 y simulador de usuario gpt-4.1-mini con temperatura 0. No se utiliza ninguna funcion de recompensa. La model card incluye la traza de las 15 etapas de entrenamiento; el propio autor advierte que cada paso lee un batch distinto, por lo que la columna de perdida refleja la dificultad del batch y no la convergencia.

| Paso | Perdida KL | Entropia | Norma del gradiente |
|---|---|---|---|
| 1 | 0,010 | 0,422 | 2,826 |
| 2 | 0,013 | 0,191 | 1,764 |
| 3 | 0,009 | 0,437 | 1,603 |
| 4 | 0,008 | 0,199 | 1,688 |
| 5 | 0,019 | 0,405 | 1,299 |
| 6 | 0,018 | 0,181 | 5,537 |
| 7 | 0,012 | 0,419 | 1,305 |
| 8 | 0,012 | 0,496 | 0,721 |
| 9 | 0,027 | 0,191 | 1,882 |
| 10 | 0,008 | 0,278 | 1,842 |
| 11 | 0,018 | 0,156 | 12,795 |
| 12 | 0,088 | 0,199 | 14,023 |
| 13 | 0,017 | 0,279 | 1,227 |
| 14 | 0,038 | 0,242 | 3,597 |
| 15 | 0,010 | 0,299 | 3,833 |

## Capacidades

- Generacion de texto y razonamiento conversacional heredados del modelo base Qwen3-4B-Instruct-2507.
- Tool calling / function calling: el ejemplo de despliegue del autor activa `--enable-auto-tool-choice` con el parser `hermes`, lo que indica soporte de llamadas a herramientas en formato Hermes.
- Comportamiento de agente multi-turno orientado al dominio de telecomunicaciones del benchmark tau2-bench (interaccion usuario-agente-herramienta).
- Internalizacion de "experiencia" de tarea: el objetivo del entrenamiento es reproducir respuestas propias de un prompt con memoria de tarea sin incluirla.
- Capacidades multilingues: no disponibles (no se documentan idiomas soportados).
- Capacidades de vision, audio o modo "thinking" explicito: no disponibles en la informacion proporcionada.
- No hay evaluacion independiente que confirme ninguna capacidad adicional mas alla de las heredadas del modelo base.

## Casos de uso

- Atencion al cliente en telecomunicaciones: el modelo esta ajustado especificamente sobre el dominio telecom de tau2-bench y admite tool calling, por lo que puede emplearse como agente conversacional que consulta sistemas internos (facturacion, estado de linea, planes) durante conversaciones multi-turno.
- Diagnostico y resolucion de incidencias tecnicas: el flujo de tau2-bench simula usuario, agente y herramientas; el modelo puede estructurar pasos de diagnostico y ejecutar acciones correctivas mediante llamadas a herramientas.
- Investigacion en destilacion de experiencias (OEL): sirve como caso de estudio reproducible de como destilar el comportamiento de un profesor con memoria de tarea hacia un estudiante sin memoria, con hiperparametros y trazas publicados.
- Punto de partida para ajuste en dominios verticales: al ser un modelo de 4,4 B con licencia Apache 2.0, se puede reutilizar como base para fine-tuning en banca, seguros o logistica con presupuestos de computo modestos.
- Evaluacion de agentes en benchmarks: util para reproducir o comparar resultados en el split de test telecom de tau2-bench frente al modelo base.
- Despliegue en entornos con recursos limitados: su tamano permite servirlo en una sola GPU de gama alta de consumo, lo que habilita prototipos on-premise o en edge para dominios regulados.
- Generacion de datos sinteticos de dominio telecom: puede usarse para producir trayectorias de conversacion etiquetadas que alimenten otros entrenamientos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks para este modelo en la informacion disponible. El autor indica explicitamente que el modelo no fue evaluado ("Not evaluated. Pushed straight after training"). El unico dato de referencia corresponde al modelo base:

| Benchmark | Modelo | Resultado |
|---|---|---|
| tau2-bench telecom (test split) | Qwen3-4B-Instruct-2507 (base) | avg 0,056 / pass@4 0,175 |
| tau2-bench telecom (test split) | Este modelo | No evaluado |

## Requisitos de hardware

- Pesos en bf16/fp16: ~8,8 GB solo de pesos; con cache KV y contexto moderado se estiman 12-16 GB de VRAM.
- Cuantizacion a 4 bits (si se convierte a GGUF/AWQ): ~2,5-3 GB de pesos, apto para GPU de 8 GB.
- Cabe en GPU de consumo: si, en RTX 3090 / 4090 (24 GB) con margen en bf16, y en RTX 4060 Ti 16 GB o similares con cuantizacion.
- GPU recomendadas para produccion: A100 40/80 GB, H100, L40S; tambien validas RTX 4090 y A6000 para cargas moderadas.
- Despliegue: el autor documenta vLLM (`vllm serve ... --enable-auto-tool-choice --tool-call-parser hermes --max-model-len 40960`). Con conversion previa a GGUF tambien son viables llama.cpp y Ollama; TGI es compatible con pesos safetensors.
- Latencia y throughput estimados: no disponibles (no se publican mediciones).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | tau2-bench telecom | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este modelo | ~4,41 B | No especificada (ejemplo con 40960) | No evaluado | Apache 2.0 | HuggingFace |
| Qwen/Qwen3-4B-Instruct-2507 (base) | ~4,41 B | No especificada en la informacion proporcionada | avg 0,056 / pass@4 0,175 | Apache 2.0 | HuggingFace |
| Otros ajustes de tau2-bench / agentes de tool calling de tamano similar | No disponible | No disponible | No disponible | No disponible | No disponible |

No se dispone de datos de benchmarks ni de especificaciones de modelos alternativos comparables en la informacion proporcionada, por lo que no es posible una comparacion cuantitativa mas alla del modelo base.

## Limitaciones y advertencias

- Modelo no evaluado: el autor lo sube inmediatamente despues de entrenar, sin ninguna validacion posterior; no hay garantia de mejora respecto al modelo base.
- Entrenamiento minimo: 90 pares tarea-memoria, 1 epoca y 15 pasos, con batch size 6; riesgo alto de sobreajuste al conjunto concreto de tareas de tau2-bench telecom.
- Riesgo de olvido catastrofico: la destilacion KL sobre un dominio estrecho puede degradar capacidades generales del modelo base (lenguaje general, codigo, matematicas); no se documenta ninguna evaluacion al respecto.
- Comportamiento internalizado opaco: al destilar "memoria de tarea" en los pesos, el origen de las respuestas no es trazable, lo que complica la auditoria en entornos regulados.
- Alucinacion: al ser un modelo de 4,4 B en un dominio con acciones concretas (facturacion, configuracion de servicios), existe riesgo de generar acciones o datos incorrectos si se usa en produccion.
- Idiomas: no se documenta el soporte multilingue de este ajuste; se desconoce si el proceso de destilacion afecto al rendimiento en idiomas distintos del usado en tau2-bench.
- Licencia: Apache 2.0, permisiva para uso comercial, pero el usuario asume la responsabilidad de validar el modelo en su caso concreto.
- Distribucion: no se ofrecen variantes cuantizadas; para desplegar en hardware limitado hay que convertir los pesos, lo que anade un paso no validado por el autor.
- Adopcion: 0 descargas y 0 likes en el momento de la consulta, sin senales de uso en la comunidad.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/MANGSEOK123/qwen3-4b-tau2-telecom_1_setting4_n91-1ep
- Modelo base: https://huggingface.co/Qwen/Qwen3-4B-Instruct-2507
- Paper, blog, repositorio o demo adicionales: no se han encontrado enlaces relevantes en la informacion disponible.
