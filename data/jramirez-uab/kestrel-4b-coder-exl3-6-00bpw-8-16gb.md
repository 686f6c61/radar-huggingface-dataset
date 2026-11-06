# JRamirez-UAB/Kestrel-4B-Coder-EXL3-6.00bpw-8-16GB

## Resumen

Kestrel-4B-Coder-EXL3-6.00bpw-8-16GB es una cuantizacion EXL3 no oficial, realizada por la comunidad (usuario JRamirez-UAB), del modelo Jackrong/Kestrel-4B-Coder, un fine-tune de Qwen3.5-4B orientado a programacion y agentes que conserva la torre de vision y la cabeza MTP (multi-token prediction). El checkpoint se ha generado con exllamav3 a 6,00 bits por peso en el modelo de lenguaje, con `lm_head` y torre de vision a 6 bits, cabeza MTP a 4 bits y embeddings en BF16, y esta pensado para servirse con vLLM mediante un plugin de cuantizacion.

El objetivo declarado del autor es un caso de uso muy concreto: un agente local de administracion de sistemas Linux (opencode con tool calling) para un departamento de TI universitario, usado en castellano. La calibracion de la revision `main` incluye sesiones reales de ese agente, y las evaluaciones (tool calls con la peticion real de opencode, tareas de agente con ejecucion de comandos, recuperacion en contexto largo y respuestas largas en espanol) reflejan ese escenario.

La relevancia practica esta en la relacion capacidad/VRAM: segun el autor, el contexto completo de 262.144 tokens cabe en una GPU de 12 GB con vision y decodificacion especulativa MTP activas, con una divergencia KL frente a BF16 de 0,0016-0,0021. El repositorio incluye tres revisiones (6,00, 5,37 y 4,50 bpw) para GPUs de 8, 12 y 16 GB. Los pesos de safetensors declarados suman 2.452.057.088 parametros, un dato que no cuadra con la denominacion comercial "4B" del modelo base y que conviene verificar antes de dimensionar el despliegue.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen3.5) con torre de vision y cabeza MTP; cuantizacion EXL3 |
| Parametros totales | 2.452.057.088 (suma de safetensors del repo); el modelo base se denomina comercialmente "4B" |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 262.144 tokens (revisiones `main` y `5.37bpw` en 12-16 GB; `4.50bpw` en 8 GB limitado a 69.632 tokens) |
| Tipos de cuantizacion | EXL3 a 6,00 bpw (`main`), 5,37 bpw (rama `5.37bpw`), 4,50 bpw (rama `4.50bpw`); `lm_head` 6 bits, vision 6 bits, MTP 4 bits, embeddings BF16 |
| Idiomas soportados | es, en |
| Licencia | Apache-2.0 (heredada del modelo base) |
| Formato de pesos | safetensors (EXL3, requiere exllamav3 + plugin de vLLM) |

## Arquitectura y entrenamiento

El modelo base es un fine-tune de Qwen3.5-4B para programacion y agentes que conserva la torre de vision y la cabeza MTP, lo que permite decodificacion especulativa con un solo token de borrador (MTP 1). Sobre esa base, esta ficha describe una cuantizacion post-entrenamiento EXL3 realizada con exllamav3: 6,00 bits por peso en el modelo de lenguaje, 6 bits en `lm_head` y en la torre de vision, 4 bits en la cabeza MTP y embeddings en BF16.

La innovacion tecnica destacable es la calibracion: la revision `main` se recalibro el 2026-10-27 incorporando sesiones reales del agente de administracion de sistemas, lo que segun el autor redujo la divergencia KL entre un 11 y un 15 % en las tres trazas evaluadas (incluida la traza publica de turboderp, sin solapamiento con la calibracion). La rama `5.37bpw` es un ejemplo de asignacion de bits por capa: 5 bits en la mayor parte del modelo y 6 bits en las 12 capas con mayor error de cuantizacion (2-11, 18 y 19). No se detalla en la informacion disponible el volumen de tokens de entrenamiento del modelo base ni la composicion de su dataset, ni si hubo RLHF o DPO.

## Capacidades

- Generacion de texto y codigo, con especializacion en tareas de programacion y administracion de sistemas Linux.
- Tool calling / function calling, evaluado con la peticion real de opencode (resultados de 50/60 y 52/60 en `main`).
- Razonamiento multi-paso orientado a agentes con ejecucion real de comandos.
- Vision (image-text-to-text): la torre de vision se conserva y se cuantiza a 6 bits; el autor reporta hasta 15/15 en pruebas de vision.
- Decodificacion especulativa mediante cabeza MTP, con 1 token de borrador.
- Contexto largo: recuperacion tipo needle reportada en 8/8 a 128k y a 241k tokens.
- Multilingue en espanol e ingles, con evaluaciones especificas de respuestas largas en espanol.
- Compatible con endpoints de vLLM (tag `endpoints_compatible`).

## Casos de uso

- Agente local de administracion de sistemas Linux: el modelo se sirve con vLLM y tool calling para ejecutar comandos y diagnosticar incidencias en un departamento de TI; es el caso de uso para el que se calibro y evaluo la cuantizacion.
- Asistente de terminal integrado en opencode: con la peticion real de opencode como referencia de evaluacion, encaja en flujos de edicion de codigo y ejecucion de comandos desde el terminal.
- Despliegue en estaciones de trabajo con GPU de 12 GB: el contexto completo de 262.144 tokens cabe en una sola GPU de 12 GB con vision y MTP, lo que permite analizar repositorios o logs extensos sin fragmentar.
- Analisis de capturas de pantalla o diagramas de infraestructura: la torre de vision a 6 bits permite adjuntar imagenes en conversaciones tecnicas (capturas de error, diagramas de red).
- Recuperacion en documentacion tecnica extensa: con 262k tokens de contexto y needle 8/8 a 241k, es adecuado para consultar manuales, configuraciones y registros largos en una sola sesion.
- Atencion a usuarios tecnicos en castellano: el modelo declara soporte de es y en, y el autor evaluo respuestas largas en espanol, lo que lo hace util para asistencia interna en espanol.
- Prototipado en GPUs de 8 GB: la revision `4.50bpw` permite 69.632 tokens de contexto en 8 GB, suficiente para tareas de agente de alcance medio en hardware consumer.

## Benchmarks y rendimiento

| Metrica | `main` (6,00 bpw) | `5.37bpw` | `4.50bpw` |
|---|---|---|---|
| KL divergence vs BF16 (traza sysadmin) | 0,0020 | 0,0041 | 0,0143 |
| KL divergence vs BF16 (traza opencode) | 0,0021 | 0,0041 | 0,0144 |
| KL divergence vs BF16 (traza publica turboderp) | 0,0016 | 0,0031 | 0,0109 |
| Tool calls con peticion real de opencode | 50/60 y 52/60 (dos ejecuciones) | no disponible | 57/60 |
| Vision | hasta 15/15 | no disponible | no disponible |
| Needle (128k / 241k) | 8/8 / 8/8 | no disponible | no disponible |
| Repeticion en respuestas largas (temp. 1,0) | sin bucle en 29/30 | no disponible | no disponible |

Throughput de decodificacion en A40 con MTP 1 (`main`): 167 tok/s con 1 peticion, 327 tok/s con 2, 575 tok/s con 4 y 1.026 tok/s con 8. La revision 6,00 con calibracion estandar obtuvo 44-47/60 en tool calls en cuatro ejecuciones del mismo dia, frente a 50-52/60 de `main` recalibrado. No se han publicado resultados de benchmarks academicos (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- VRAM por revision: `4.50bpw` para 8 GB (contexto de 69.632 tokens, KV cache fp8 de 1.496.317.952 B); `main` para 12 GB (262.144 tokens, KV cache fp8 de 5.317.412.782 B) y para 16 GB (262.144 tokens, pool de 500.918 tokens, KV cache fp8 de 9.596.441.722 B).
- En 16 GB con `4.50bpw` caben dos sesiones de contexto completo (pool de 525.304 tokens, KV cache fp8 de 10.074.760.151 B).
- En 8 GB, `main` solo alcanza 44.032 tokens de contexto, por lo que el autor recomienda `4.50bpw` en ese tamano.
- GPUs utilizadas en las pruebas: NVIDIA A40 (48 GB, Ampere), NVIDIA L40S (48 GB, Ada) y NVIDIA RTX PRO 6000 Blackwell Server Edition (96 GB, limite de 300 W). Los tamanos de 8/12/16 GB se midieron en GPUs de 48 GB dimensionando la KV cache para cada tamano.
- Despliegue: exclusivamente vLLM (probado con 0.31.0) junto con exllamav3 1.5.1, el plugin OrcaSAQ2 (commit `7ddffb12`, con parche en `patches/`) y el plugin `qwen38_exl3_vision` (2026-10-25). Un `pip install vllm` estandar, Transformers o SGLang no pueden cargar este checkpoint.
- Throughput medido en A40 con MTP 1: 167 tok/s (1 peticion) a 1.026 tok/s (8 peticiones).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Notas |
|---|---|---|---|---|---|
| Kestrel-4B-Coder-EXL3 6,00 bpw (este) | 2.452.057.088 en safetensors | 262.144 | EXL3 6,00 bpw | Apache-2.0 | Requiere vLLM + exllamav3 + plugins |
| Kestrel-4B-Coder-EXL3 4,50 bpw (misma familia) | mismo base | 69.632 en 8 GB | EXL3 4,50 bpw | Apache-2.0 | KLD 0,0143; mejor tool calling reportado (57/60) |
| Jackrong/Kestrel-4B-Coder (BF16, base) | no disponible | no disponible | BF16 | Apache-2.0 | Referencia de calidad; sin cuantizar |
| Qwen3.5-4B (modelo origen) | no disponible | no disponible | varias | no disponible | Base del fine-tune |

No se dispone de datos de benchmarks comparables con otros modelos de la misma categoria en la informacion proporcionada.

## Limitaciones y advertencias

- Cuantizacion no oficial: no es un release del autor del modelo base ni de Qwen; la calidad fuera del dominio de calibracion (agente de sysadmin en espanol) puede diferir.
- Dependencia estricta de un stack concreto (vLLM 0.31.0 + exllamav3 1.5.1 + plugins con parche); solo se ha probado esa configuracion.
- Riesgo de bucles de repeticion: con la temperatura de codificacion del autor (0,2) se observaron bucles en 13 de 30 respuestas largas; con temperatura 1,0, en 1 de 30.
- La revision `main` no cabe con contexto completo en 8 GB (solo 44.032 tokens), lo que obliga a usar `4.50bpw` en ese hardware.
- Idiomas limitados a es y en; el rendimiento en otros idiomas no esta evaluado.
- Posible riesgo de alucinacion en tool calling y ejecucion de comandos: las evaluaciones reportadas son de formato y seleccion de herramienta, no de correccion semantica de las acciones.
- La discrepancia entre los 2.452.057.088 parametros de safetensors y la denominacion "4B" debe verificarse antes de planificar VRAM.
- Licencia Apache-2.0 permite uso comercial, pero al ser una cuantizacion de comunidad conviene revisar los terminos del modelo base.

## Enlaces

- Hugging Face: https://huggingface.co/JRamirez-UAB/Kestrel-4B-Coder-EXL3-6.00bpw-8-16GB
- Modelo base: https://huggingface.co/Jackrong/Kestrel-4B-Coder
- exllamav3: https://github.com/turboderp-org/exllamav3
- Paper referenciado en tags (arXiv:2406.11235): https://arxiv.org/abs/2406.11235
