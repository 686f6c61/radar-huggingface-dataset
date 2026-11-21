# KikoCis/Qwen3.8-27B-GGUF

## Resumen

Qwen3.8-27B-GGUF es un repositorio de cuantizaciones GGUF del modelo Qwen/Qwen3.8-27B, publicado por el usuario KikoCis. No se trata de un modelo original, sino de una compilación de pesos cuantizados en distintos niveles de precisión (desde Q4_K_M hasta IQ1_M-compact) orientada a despliegue local con llama.cpp y Ollama. El modelo base, desarrollado por Alibaba Qwen, cuenta con 26.895.998.464 parámetros (~26,9 mil millones) y una ventana de contexto nativa declarada de 262.144 tokens.

El valor diferencial de este repositorio no son los ficheros en sí, sino la medición empírica que acompaña: el autor documenta el umbral de cuantización a partir del cual el modelo deja de ser fiable para tareas agénticas (tool calling multi-paso). Según sus pruebas, por encima de 2,66 bits por peso el modelo completa tareas de herramienta con prácticamente total corrección, mientras que por debajo de 2,23 bits por peso la tasa de éxito cae a aproximadamente un tercio, con el fallo dominante consistente en no emitir ninguna llamada a herramienta.

La arquitectura del modelo base es híbrida: de sus 65 bloques, 48 son SSM o atención lineal, 16 son atención completa (uno de cada cuatro) y 1 es una cabeza MTP. Esto reduce drásticamente el coste de memoria del KV cache (64 KB por token frente a los ~256 KB/token de un modelo denso equivalente), aunque encarece el prefill en llama.cpp. La licencia es Apache-2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Híbrida: 48 bloques SSM/atención lineal + 16 bloques de atención completa + 1 cabeza MTP (65 bloques totales) |
| Parametros totales | 26.895.998.464 (~26,9 mil millones) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | 262.144 tokens (ventana nativa declarada, no verificada con needle-in-a-haystack) |
| Tipos de cuantizacion | Q4_K_M, IQ4_XS, Q3_K_M (3,40 bpw), IQ2_M (2,93 bpw), IQ2_XS (2,66 bpw), IQ1_M uniforme (2,23 bpw), IQ1_M-compact (1,94 bpw) |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF |

Tamaños de fichero por cuantización:

| Fichero | Tamaño | Bits/peso | Veredicto agéntico |
|---|---|---|---|
| Qwen3.8-27B-Q4_K_M.gguf | 16,81 GB | no disponible | no medido |
| Qwen3.8-27B-IQ4_XS.gguf | 15,31 GB | no disponible | no medido |
| Qwen3.8-27B-Q3_K_M.gguf | 13,50 GB | 3,40 | 40/40 — funciona |
| Qwen3.8-27B-IQ2_M.gguf | 10,00 GB | 2,93 | mejor relación calidad/tamaño — sigue ejecutando herramientas |
| Qwen3.8-27B-IQ2_XS.gguf | 9,09 GB | 2,66 | 72/80 — medible empeorado, ahorra poco |
| Qwen3.8-27B-IQ1_M-compact.gguf | 6,46 GB | 1,94 | texto fluido, no apto para agentes |

## Arquitectura y entrenamiento

El modelo base Qwen3.8-27B emplea una arquitectura híbrida que combina capas de espacio de estados (SSM) o atención lineal con capas de atención completa intercaladas. De los 65 bloques, 48 son SSM/atención lineal, 16 son atención completa (una de cada cuatro) y 1 es una cabeza MTP (multi-token prediction). Solo las 16 capas de atención completa mantienen un KV cache que crece con la longitud de secuencia, lo que resulta en 64 KB por token: 16 capas × 4 cabezas KV × (256 + 256) × 2 bytes. Un modelo denso con los 65 bloques atendiendo pagaría aproximadamente 256 KB por token, cuatro veces más.

No se dispone de información sobre el volumen de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO en el modelo base, más allá de lo que pueda figurar en la model card original de Qwen. La innovación técnica destacable es la propia arquitectura híbrida SSM/atención, que abarata el contexto en memoria a costa de un prefill más lento en llama.cpp: en bucles agénticos multi-turno, donde la conversación se reprocesa en cada turno, el modelo pasa mucho más tiempo en prefill que un modelo denso del mismo tamaño.

## Capacidades

- Generación de texto conversacional y razonamiento general.
- Tool calling y function calling: validado con un benchmark objetivo de 40 tareas multi-paso verificadas ejecutando el artefacto producido, sin juez LLM.
- Razonamiento agéntico multi-paso: el modelo encadena llamadas a herramientas y completa tareas de forma fiable en cuantizaciones de 2,93 bpw o superiores.
- Capacidades multimodales en el modelo base, no disponibles en este repositorio: no se incluye fichero `mmproj`, por lo que las entradas de visión no funcionan.
- Perfil de muestreo declarado en los metadatos del propio modelo: temp 1, top_p 0,95, top_k 20.
- Capacidades multilingües: no disponibles (no se especifican idiomas).
- Modo thinking: no disponible en la información proporcionada.

## Casos de uso

- Agentes de tool calling en local: usar la cuantización IQ2_M (2,93 bpw, 10 GB) permite desplegar un agente multi-paso fiable en hardware de consumo, con una tasa medida de 79/80 tareas completadas correctamente. Es el caso de uso central del repositorio.
- Automatización de tareas con verificación de artefacto: pipelines donde el modelo genera código o ficheros que luego se ejecutan y comprueban, aprovechando que el benchmark del autor valida el resultado ejecutándolo en lugar de juzgarlo con otro LLM.
- Conversaciones multi-turno con contexto largo: los 262.144 tokens de ventana nativa y el bajo coste de KV cache (64 KB/token) permiten mantener sesiones extensas en memoria contenida, aunque el prefill lento penaliza la latencia en cada turno.
- Despliegue en navegador con WebGPU: la variante IQ1_M-compact (6,46 GB, 1,94 bpw) se carga en una sola pestaña mediante Elffuss Engine, que lee GGUF estándar por HTTP con peticiones de rango y desquantiza en el shader. Adecuado para demostraciones de texto, no para agentes.
- Inferencia local con Ollama o llama.cpp: los ficheros GGUF se ejecutan directamente con `llama-cli -m Qwen3.8-27B-IQ2_M.gguf -c 32768 -no-cnv -p "..."`, con la advertencia de que `-no-cnv` es necesario para el modo de prompt directo.
- Evaluación de umbrales de cuantización: el repositorio sirve como referencia metodológica para equipos que necesitan decidir hasta qué nivel comprimir un modelo antes de que deje de ser útil para tareas agénticas, con datos de reproducibilidad y análisis estadístico incluidos.
- Prototipado de asistentes de código con contexto largo: la ventana de 262.144 tokens permite incluir repositorios o ficheros extensos en el prompt, siempre que se acepte el coste de prefill asociado.

## Benchmarks y rendimiento

Benchmark agéntico objetivo del autor: 40 tareas de uso de herramientas, verificadas ejecutando el artefacto producido, sin juez LLM, con el perfil de muestreo declarado por el modelo (temp 1 / top_p 0,95 / top_k 20), medido a través de Ollama.

| Bits/peso | Fichero | Tareas agénticas | Veredicto |
|---|---|---|---|
| 3,40 | Q3_K_M | 40/40 — 100 % | funciona |
| 2,93 | IQ2_M | 79/80 — 98,8 % | mejor relación calidad/tamaño |
| 2,66 | IQ2_XS | 72/80 — 90,0 % | medible empeorado, ahorra poco |
| 2,23 | IQ1_M (uniforme) | 60/160 — 37,5 % | roto para agentes |
| 1,94 | IQ1_M-compact | 49/160 — 30,6 % | roto para agentes |

Notas metodológicas del autor:

- Repetir una misma compilación sin cambios en las mismas 40 tareas cuatro veces da 17, 12, 16 y 15: una dispersión de cinco tareas, mayor que la mayoría de diferencias entre compilaciones.
- La fidelidad no predice la capacidad: frente al original en BF16, la compilación de 3,40 bpw discrepa en el argmax del siguiente token en el 9,5 % de las posiciones y aun así puntúa 40/40.
- Cada cifra está ligada a un backend: IQ1_M-compact ejecutado con `llama-server` de llama.cpp obtiene 19/40 (47,5 %) en lugar del 30,6 % medido con Ollama, siete tareas de diferencia, fuera de la banda de ruido de cinco tareas.
- En IQ1_M-compact ninguna diferencia por pares es estadísticamente significativa (test de signos pareado, p = 0,473 frente a la referencia de la comunidad; p = 0,424 frente a la compilación de 1 bit más grande), pero queda último en las tres estimaciones centrales.

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible. No se inventan cifras.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente el tamaño del fichero más overhead de contexto. IQ2_M requiere ~10 GB de pesos; con 32.768 tokens de contexto y 64 KB/token de KV cache, unos 2 GB adicionales de cache, es decir, ~12 GB en total. IQ1_M-compact parte de 6,46 GB de pesos.
- GPU recomendadas: para IQ2_M, una RTX 4090 (24 GB) o RTX 3090 (24 GB) deja margen suficiente para contexto largo. Para Q4_K_M (16,81 GB) se recomienda una GPU de 24 GB o superior, o bien A100/H100 si se busca throughput.
- Cabe en GPU de consumo: sí, las cuantizaciones de 2 bits (IQ2_M, IQ2_XS) y de 1 bit (IQ1_M, IQ1_M-compact) caben en GPUs de 12-16 GB; Q3_K_M (13,50 GB) cabe en 16 GB con contexto moderado.
- Opciones de despliegue: llama.cpp (`llama-cli`, `llama-server`), Ollama, y Elffuss Engine para WebGPU en navegador. No se mencionan vLLM ni TGI para estos ficheros GGUF.
- Latencia y throughput: no se proporcionan cifras absolutas. El autor advierte que el prefill es lento en llama.cpp por la arquitectura híbrida, y que en bucles agénticos multi-turno el tiempo de prefill domina frente a un modelo denso del mismo tamaño. En WebGPU, la carga inicial de IQ1_M-compact son varios gigabytes y la respuesta no es instantánea.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Qwen3.8-27B (BF16 original) | ~26,9 mil millones | 262.144 | Apache-2.0 | safetensors | Referencia de fidelidad; sin cuantizar, requiere ~54 GB en BF16 |
| Qwen3.8-27B-GGUF (este repo) | ~26,9 mil millones | 262.144 | Apache-2.0 | GGUF | Cuantizaciones de 1,94 a 3,40 bpw con medición agéntica |
| Qwen3.6-27B-GGUF (mismo autor) | no disponible | no disponible | no disponible | GGUF | Release anterior con tabla de fidelidad medida por nivel frente a BF16 |
| Otras compilaciones GGUF de Qwen3.8-27B | ~26,9 mil millones | 262.144 | Apache-2.0 | GGUF | No se dispone de datos comparativos de rendimiento en la información proporcionada |

No se dispone de datos de benchmarks comparativos con modelos de otras familias en la información proporcionada.

## Limitaciones y advertencias

- La ventana de 262.144 tokens es la ventana nativa declarada por el modelo, no verificada: no se completó ninguna prueba de needle-in-a-haystack.
- Solo texto: el modelo base es multimodal, pero este repositorio no incluye `mmproj`, por lo que las entradas de visión no funcionan. Otros publicadores sí lo incluyen.
- Las cuantizaciones de 1 bit (IQ1_M uniforme, IQ1_M-compact) están publicadas por completitud, no para uso agéntico: la tasa de éxito cae al 30-37 % y el fallo dominante es no emitir ninguna llamada a herramienta.
- El umbral de rotura agéntica se sitúa entre 2,66 y 2,23 bits por peso. IQ2_XS (2,66 bpw) es peor que IQ2_M en un test pareado (6 tareas a favor de IQ2_M, 0 en contra, p = 0,031) ahorrando solo un 9 % de tamaño.
- Ruido de medición elevado: la dispersión de cinco tareas entre ejecuciones idénticas supera la mayoría de diferencias entre compilaciones.
- Los resultados dependen del backend: la misma compilación IQ1_M-compact obtiene 30,6 % en Ollama y 47,5 % en llama-server de llama.cpp. No deben compararse cifras medidas en runtimes distintos.
- Prefill lento en llama.cpp por la arquitectura híbrida, lo que penaliza bucles agénticos multi-turno donde la conversación se reprocesa en cada turno.
- No hay tabla de fidelidad por nivel en este repositorio; el autor remite a Qwen3.6-27B-GGUF para ese tipo de medición.
- Riesgo de alucinación y sesgos: no documentados en la información proporcionada.
- Licencia Apache-2.0: permite uso comercial, pero conviene revisar los términos del modelo base Qwen/Qwen3.8-27B por si añaden condiciones adicionales.
- El repositorio tiene solo 1 like y 4.743 descargas en el momento de la consulta; es una publicación de un tercero, no oficial de Qwen.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/KikoCis/Qwen3.8-27B-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Release anterior con tabla de fidelidad: https://huggingface.co/KikoCis/Qwen3.6-27B-GGUF
- Elffuss Engine (Apache-2.0): https://github.com/KikoCis/elffuss-engine
- Demo en navegador (Elffuss Claw): https://claw.elffuss.com
- Documento de contexto y tablas por contexto: `CONTEXT.md` dentro del repositorio
