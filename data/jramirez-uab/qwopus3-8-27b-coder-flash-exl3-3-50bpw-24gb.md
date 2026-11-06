# JRamirez-UAB/Qwopus3.8-27B-Coder-Flash-EXL3-3.50bpw-24GB

## Resumen

Qwopus3.8-27B-Coder-Flash-EXL3-3.50bpw-24GB es una cuantizacion EXL3 no oficial, realizada por el usuario JRamirez-UAB, del modelo Jackrong/Qwopus3.8-27B-Coder-Flash, un modelo denso de 27B orientado a programacion y agentes construido sobre Qwen3.8-27B. El objetivo declarado por el autor es servir el modelo completo, con su ventana de contexto de 262.144 tokens, en una unica GPU de consumo de 24 GB (RTX 3090) mediante vLLM con cache KV en int4.

La cuantizacion emplea 3,50 bits por peso en las capas lineales, un `lm_head` de 6 bits, una torre de vision de 6 bits y una cabeza MTP de 4 bits, generada con exllamav3 1.6.5. Segun la model card, la divergencia KL frente al modelo BF16 se situa entre 0,0104 y 0,0148 en tres trazas de referencia, y el modelo supera baterias de tareas de agente, tool calling y programacion en las pruebas del autor, siempre con decodificacion por muestreo y nunca con temperatura 0.

Es relevante porque demuestra que un modelo de 27B con contexto largo y capacidades multimodales puede ejecutarse en hardware Ampere de gama alta para consumidores, aunque con requisitos de software muy especificos: solo funciona con vLLM 0.31.0, exllamav3 1.6.5 y el plugin `vllm-quantpack` 0.1.4. No es una version oficial de Jackrong ni de Qwen.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (base Qwen3.8-27B) con torre de vision y cabeza MTP para decodificacion especulativa |
| Parametros totales | 7.494.374.784 segun safetensors del repo (la model card describe el modelo base como 27B; existe discrepancia entre ambas cifras) |
| Parametros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | 262.144 tokens |
| Tipos de cuantizacion | EXL3 a 3,50 bpw en capas lineales, `lm_head` 6 bits, torre de vision 6 bits, cabeza MTP 4 bits, cache KV int4 |
| Idiomas soportados | es, en |
| Licencia | Apache-2.0 (heredada del modelo base) |
| Formato de pesos | safetensors (EXL3, 14,99 GB en dos shards) |

## Arquitectura y entrenamiento

El modelo base es un transformer denso derivado de Qwen3.8-27B, con pipeline `image-text-to-text`, lo que implica una torre de vision para entrada de imagenes y video (el repo incluye `preprocessor_config.json`, `processor_config.json` y `video_preprocessor_config.json`). Incorpora una cabeza MTP (multi-token prediction) que permite decodificacion especulativa: en las pruebas del autor se aceptan 2,09 tokens por borrador en respuestas cortas y 2,74 cerca de 258k tokens de contexto. El chat template y el tokenizer son los del modelo base, sin modificar.

No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset ni si hubo RLHF o DPO en el modelo base. Respecto a la cuantizacion, el autor indica que los datos de calibracion incluyen trazas reales de agente y administracion de sistemas en castellano, ademas de una traza publica de turboderp para permitir la comparacion. El registro por tensor de bits se encuentra en `quantization_config.json`, que solo contiene tamanos de calibracion, no texto.

## Capacidades

- Generacion de texto y razonamiento en castellano e ingles, con soporte de respuestas largas.
- Generacion de codigo y tareas de programacion (36/36 en la bateria del autor).
- Tool calling y function calling, integrable con opencode (30/30 en la bateria; 59/60 y 60/60 en peticiones reales).
- Ejecucion de tareas de agente multi-paso con ejecucion real de comandos (30/30 en tareas de sysadmin).
- Capacidades de vision: procesamiento de imagenes y video (15/15 en la bateria de vision del autor).
- Recuperacion en contexto largo: 8/8 hechos recordados a 64k, 128k, 245k y 258k tokens.
- Decodificacion especulativa mediante cabeza MTP.
- Soporte de KV cache en int4 para maximizar la ventana de contexto en VRAM limitada.

## Casos de uso

- Agente local de administracion de sistemas Linux: el modelo puede ejecutar tareas de sysadmin con tool calling real a traves de opencode, con contexto de 262k tokens que permite mantener el historial completo de una sesion de diagnostico sin truncar. Es el caso de uso principal para el que el autor calibro y evaluo la cuantizacion.
- Asistencia a programacion en produccion: genera codigo y resuelve tareas de programacion con un indice de exito alto en las pruebas del autor, y puede integrarse en flujos de trabajo con function calling para consultar repositorios, ejecutar tests o aplicar parches.
- Analisis de documentacion tecnica extensa: con 262.144 tokens de contexto puede procesar manuales, logs o bases de codigo completas en una sola pasada, manteniendo la coherencia entre secciones.
- Automatizacion de soporte tecnico en castellano: gestiona conversaciones multi-turno en espanol con respuestas largas, adecuado para un departamento de TI que atiende en castellano, siempre con temperatura de muestreo alta.
- Procesamiento de capturas y diagramas: la torre de vision permite interpretar imagenes de pantalla, diagramas de red o capturas de error dentro de un flujo de diagnostico.
- Despliegue en estaciones de trabajo con una sola RTX 3090: permite ofrecer un asistente de codigo y agente local sin depender de la nube, con latencia de 25-43 tok/s en decodificacion segun la longitud de contexto.
- Servicio concurrente ligero: con 8 peticiones cortas el autor reporta unos 223 tok/s agregados, util para un equipo pequeno.

## Benchmarks y rendimiento

Los datos disponibles son pruebas internas del autor, no benchmarks estandar publicos:

| Metrica | Resultado |
|---|---|
| Divergencia KL vs BF16 (traza opencode) | 0,0127 |
| Divergencia KL vs BF16 (traza sysadmin) | 0,0148 |
| Divergencia KL vs BF16 (traza publica de turboderp) | 0,0104 |
| Tareas de agente (10 tareas x 3 ejecuciones) | 30/30 |
| Tool calls (bateria) | 30/30 |
| Tool calls (peticion real opencode) | 59/60 y 60/60 |
| Tareas de programacion (12 x 3) | 36/36 |
| Vision (con torre de vision activa) | 15/15 |
| Bucles de repeticion a temperatura 0,6 / 0,8 / 1,0 | 12/30, 6/30, 0/30 |
| Recuperacion de hechos en contexto largo | 8/8 a 64k, 128k, 245k y 258k |
| Prefill / decode a ~15k tokens | 1.115 / 43,0 tok/s |
| Prefill / decode a ~64k tokens | 972 / 37,5 tok/s |
| Prefill / decode a ~128k tokens | 815 / 32,3 tok/s |
| Prefill / decode a ~260k tokens | 616 / 25,4 tok/s |
| Throughput con 8 peticiones cortas | ~223 tok/s |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- VRAM: los pesos ocupan 14,99 GB; con cache KV int4 el pool alcanza 377.712 tokens en 24 GB, suficiente para una sesion de 262.144 tokens.
- GPU probada: una RTX 3090 (24 GB, Ampere). No se ha probado en otras GPU segun el autor.
- No cabe en GPU de 16 GB: los pesos solos ya ocupan 14,99 GB.
- Software obligatorio: vLLM 0.31.0, exllamav3 1.6.5 y el plugin `vllm-quantpack` 0.1.4. Un `pip install vllm` estandar, Transformers o SGLang no pueden cargar el checkpoint.
- Configuracion de referencia: `--max-model-len 262144`, cache KV int4, modo solo texto con `--language-model-only` para las pruebas de texto.
- Latencia y throughput: 25,4-43,0 tok/s en decodificacion con una peticion segun contexto; ~223 tok/s con 8 peticiones cortas; prefill de 616-1.115 tok/s.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este modelo (EXL3 3,50 bpw) | 7.494.374.784 segun safetensors (base descrito como 27B) | 262.144 | EXL3 3,50 bpw, KV int4 | Apache-2.0 | Hugging Face, requiere vLLM + exllamav3 + plugin |
| Jackrong/Qwopus3.8-27B-Coder-Flash (BF16) | 27B (descripcion del autor) | 262.144 | BF16 | Apache-2.0 | Hugging Face, modelo base |
| Build de 2,25 bpw del mismo modelo | no disponible | 236k por sesion, 2 sesiones concurrentes | EXL3 2,25 bpw | Apache-2.0 | No publicado |

El autor indica que el build de 2,25 bpw tiene una divergencia KL aproximadamente siete veces mayor y muchos mas bucles de repeticion, por lo que no lo publico. No se dispone de comparaciones con otros modelos de la misma categoria en la informacion proporcionada.

## Limitaciones y advertencias

- No usar temperatura 0: con decodificacion greedy el modelo entra en bucles dentro del razonamiento y no escribe la respuesta (repeticion 0,87 en este build y 0,93-0,98 en el BF16 original). Es un rasgo del fine-tune base, no de la cuantizacion. Usar los valores por defecto: temperatura 1,0, top_p 0,95, top_k 20.
- Requiere una pila de software muy concreta y no estandar; la carga falla con vLLM estandar, Transformers o SGLang.
- Solo se ha probado en una RTX 3090 con vLLM 0.31.0, exllamav3 1.6.5 y vllm-quantpack 0.1.4; otros entornos no estan validados.
- Los datos de calibracion son internos y no se publican, lo que limita la reproducibilidad completa de la cuantizacion.
- El rendimiento esta evaluado en un dominio concreto (agente de sysadmin Linux en castellano); los resultados en otros dominios o idiomas pueden diferir.
- Existe una discrepancia entre el tamano declarado en la model card (27B) y el recuento real de parametros en safetensors (7.494.374.784), que conviene verificar antes de dimensionar el despliegue.
- Riesgo de alucinacion y sesgos: no se han publicado evaluaciones especificas en la informacion disponible.
- Licencia Apache-2.0 heredada del modelo base, que permite uso comercial; no obstante, es una cuantizacion no oficial y no cuenta con el respaldo de Jackrong ni de Qwen.
- El modelo solo declara soporte de espanol e ingles.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/JRamirez-UAB/Qwopus3.8-27B-Coder-Flash-EXL3-3.50bpw-24GB
- Modelo base: https://huggingface.co/Jackrong/Qwopus3.8-27B-Coder-Flash
- exllamav3: https://github.com/turboderp-org/exllamav3
- Paper de referencia citado en los tags: arxiv:2406.11235
