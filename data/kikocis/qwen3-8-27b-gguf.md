# KikoCis/Qwen3.8-27B-GGUF

## Resumen

Qwen3.8-27B-GGUF es una colección de cuantizaciones en formato GGUF del modelo base Qwen/Qwen3.8-27B, publicada por el usuario KikoCis. El modelo subyacente es un transformer híbrido de 26.895.998.464 parámetros (aproximadamente 26,9 mil millones) desarrollado por el equipo Qwen, con una ventana de contexto nativa declarada de 262.144 tokens. La aportación diferencial de este repositorio no son los ficheros en sí, sino la medición sistemática del umbral de cuantización en el que el modelo deja de ser fiable para tareas agénticas de uso de herramientas.

El autor documenta un "acantilado agéntico": por encima de 2,66 bits por peso el modelo completa tareas multi-paso de tool calling con prácticamente total fiabilidad, mientras que por debajo de 2,23 bits por peso la tasa de éxito cae a aproximadamente un tercio de las tareas, y el fallo dominante no es una respuesta incorrecta sino la ausencia total de emisión de la llamada a herramienta. La build IQ2_M (2,93 bpw, 10 GB) se posiciona como el mejor compromiso, igualando a la build de 3,40 bpw con un 28 % menos de tamaño.

La relevancia actual del repositorio reside en su honestidad metodológica: documenta la varianza entre ejecuciones (una dispersión de cinco tareas en el mismo benchmark), la dependencia del backend (Ollama frente a llama-server produce diferencias de hasta siete tareas) y la distinción entre fidelidad de cuantización y capacidad real. Todo ello lo convierte en una referencia útil para quien planifique desplegar agentes en hardware modesto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer híbrido: 65 bloques, de los cuales 48 son SSM/linear-attention, 16 son full attention (cada cuarto bloque) y 1 es cabeza MTP |
| Parametros totales | 26.895.998.464 (26,9 B) |
| Parametros activos | no disponible (no es un modelo MoE según la información proporcionada) |
| Longitud de contexto | 262.144 tokens (ventana nativa declarada, no verificada con needle-in-a-haystack) |
| Tipos de cuantizacion | Q4_K_M (16,81 GB), IQ4_XS (15,31 GB), Q3_K_M (13,50 GB, 3,40 bpw), IQ2_M (10,00 GB, 2,93 bpw), IQ2_XS (9,09 GB, 2,66 bpw), IQ1_M-compact (6,46 GB, 1,94 bpw) |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

El modelo base Qwen3.8-27B emplea una arquitectura híbrida que combina atención lineal tipo SSM con atención completa. De sus 65 bloques, 48 son SSM/linear-attention y solo 16 son de atención completa, distribuidos cada cuatro bloques, más una cabeza MTP (multi-token prediction). Esta proporción tiene una consecuencia directa y medible sobre el coste de contexto: solo los 16 bloques de atención completa mantienen una caché KV que crece con la longitud de secuencia, lo que arroja 64 KB por token (16 capas × 4 cabeceras KV × (256 + 256) × 2 bytes). Un modelo denso con los 65 bloques atendiendo pagaría aproximadamente 256 KB por token, cuatro veces más.

El repositorio no documenta datos de entrenamiento del modelo base (número de tokens, composición del dataset, uso de RLHF o DPO), ya que se trata de una publicación de cuantizaciones, no del modelo original. La innovación técnica destacable documentada aquí es la propia metodología de evaluación: un benchmark objetivo de 40 tareas de uso de herramientas verificado ejecutando el artefacto producido, sin juez LLM, con el perfil de muestreo declarado por el modelo en sus metadatos (temperatura 1, top_p 0.95, top_k 20). El autor advierte explícitamente de que la fidelidad de cuantización (divergencia KL, perplejidad, coincidencia del argmax del siguiente token) no predice la capacidad: la build de 3,40 bpw discrepa del original BF16 en el argmax del siguiente token en el 9,5 % de las posiciones y aun así puntúa 40/40.

## Capacidades

- Generación de texto conversacional en formato GGUF, con soporte de plantilla de chat según los tags del repositorio (`conversational`).
- Uso de herramientas (tool calling / function calling) en bucles multi-paso, con fiabilidad medida del 98,8 % (79/80 tareas) en la cuantización IQ2_M y del 100 % (40/40) en Q3_K_M.
- Razonamiento multi-paso orientado a agentes, siempre que se respete el umbral de cuantización de 2,66 bpw.
- Ventana de contexto larga declarada de 262.144 tokens, con un coste de caché KV reducido por la arquitectura híbrida SSM/atención.
- Compatibilidad con endpoints (`endpoints_compatible` según los tags del repositorio).
- Capacidades multimodales del modelo base no disponibles en este repositorio: no se incluye fichero `mmproj`, por lo que las entradas de visión no funcionan.
- Capacidades multilingües: no disponibles en la información proporcionada.

## Casos de uso

- Agentes autónomos de uso de herramientas en hardware de gama media: la build IQ2_M (10 GB, 2,93 bpw) permite ejecutar un agente multi-paso fiable en una GPU de consumo con 12-16 GB de VRAM, manteniendo el 98,8 % de éxito en tareas de tool calling verificado por ejecución del artefacto.
- Automatización de tareas de desarrollo con presupuesto de memoria ajustado: la build Q3_K_M (13,50 GB) ofrece el 100 % de éxito en el benchmark de 40 tareas y es adecuada para pipelines donde la fiabilidad del tool calling es crítica y se dispone de 16-24 GB de VRAM.
- Procesamiento de documentos largos con contexto extendido: los 262.144 tokens de ventana nativa y el coste de caché KV de 64 KB/token (frente a 256 KB/token de un denso equivalente) permiten mantener conversaciones o análisis sobre corpus extensos con menor presión de memoria, siempre que se acepte el coste de prefill asociado.
- Despliegue en navegador mediante WebGPU: la build IQ1_M-compact (6,46 GB, 1,94 bpw) se carga a través de Elffuss Engine leyendo un GGUF estándar por peticiones de rango y dequantizando en el shader; es apta para generación de texto, no para agentes.
- Evaluación comparativa de cuantizaciones en producción: el repositorio sirve como referencia metodológica para equipos que necesiten determinar su propio umbral de cuantización con benchmarks objetivos verificados por ejecución, en lugar de fiarse de la perplejidad.
- Integración en asistentes conversacionales multi-turno: el modelo soporta conversación con plantilla de chat, aunque el autor advierte de que el prefill es lento en llama.cpp y que en bucles agénticos multi-turno, donde la conversación se reprocesa en cada turno, el coste temporal supera al de un modelo denso del mismo tamaño.
- Pruebas de concepto de agentes en entornos con restricciones de VRAM: las builds de 1 bit (IQ1_M uniforme e IQ1_M-compact) permiten validar flujos de texto con 6-7 GB de memoria, con la advertencia explícita de que no son aptas para uso agéntico.

## Benchmarks y rendimiento

Benchmark de uso de herramientas: 40 tareas objetivas verificadas ejecutando el artefacto producido, sin juez LLM, con perfil de muestreo temp 1 / top_p 0.95 / top_k 20, medido a través de Ollama.

| bits/peso | Fichero | Tareas agénticas | Veredicto |
|---|---|---|---|
| 3,40 | Q3_K_M | 40/40 — 100 % | funciona |
| 2,93 | IQ2_M | 79/80 — 98,8 % | mejor relación calidad/tamaño |
| 2,66 | IQ2_XS | 72/80 — 90,0 % | mediblemente peor, apenas ahorra |
| 2,23 | IQ1_M (uniforme) | 60/160 — 37,5 % | roto para agentes |
| 1,94 | IQ1_M-compact | 49/160 — 30,6 % | roto para agentes |

Notas metodológicas documentadas por el autor:

- Repetir la misma build sin cambios en las mismas 40 tareas cuatro veces da 17, 12, 16 y 15 aciertos: una dispersión de cinco tareas, mayor que la mayoría de diferencias entre builds. Todas las filas por encima de 2,23 bpw son de al menos dos rondas; las de 1 bit, de cuatro.
- La build de 3,40 bpw discrepa del original BF16 en el argmax del siguiente token en el 9,5 % de las posiciones y aun así puntúa 40/40: la fidelidad no predice la capacidad.
- Todos los números están ligados al backend. IQ1_M-compact medida a través de `llama-server` de llama.cpp da 19/40 (47,5 %) en lugar del 30,6 % obtenido con Ollama, una diferencia de siete tareas, fuera de la banda de ruido de cinco.
- En IQ1_M-compact, ninguna diferencia por pares es estadísticamente significativa (test de signos apareado, p = 0,473 frente a la referencia de la comunidad; p = 0,424 frente a la build de 1 bit más grande), pero queda última en las tres estimaciones centrales. El autor subraya que la ausencia de diferencia detectada no es evidencia de equivalencia.

No se han publicado resultados de MMLU, HumanEval, GSM8K ni otros benchmarks estándar en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (tamaño del fichero más overhead de contexto y runtime):
  - IQ1_M-compact: 6,46 GB de pesos; apta para GPUs de 8 GB.
  - IQ2_XS: 9,09 GB; apta para GPUs de 10-12 GB.
  - IQ2_M: 10,00 GB; apta para GPUs de 12-16 GB.
  - Q3_K_M: 13,50 GB; apta para GPUs de 16-24 GB.
  - IQ4_XS: 15,31 GB; apta para GPUs de 20-24 GB.
  - Q4_K_M: 16,81 GB; apta para GPUs de 24 GB.
- Caché KV: 64 KB por token (16 capas × 4 cabeceras KV × 512 × 2 bytes). Para 32.768 tokens de contexto, aproximadamente 2 GB adicionales; para 262.144 tokens, aproximadamente 16 GB.
- GPU recomendadas: no especificadas en la información disponible. Por tamaño, las builds de 4 bits caben en una RTX 4090 (24 GB); las de 2-3 bits caben en RTX 4080/4070 Ti Super y similares; la de 1,94 bpw cabe en GPUs de 8 GB.
- Despliegue: Ollama (backend usado en todas las mediciones del benchmark), llama.cpp con `llama-cli` o `llama-server`, y Elffuss Engine (Apache-2.0) para ejecución en navegador vía WebGPU con la build IQ1_M-compact. vLLM y TGI no se mencionan en la información disponible.
- Latencia y throughput: no se publican cifras concretas. El autor advierte cualitativamente de que el prefill es lento en llama.cpp con esta arquitectura y que, en bucles agénticos multi-turno, el modelo consume mucho más tiempo en prefill que un denso del mismo tamaño. En navegador, la carga inicial de varios gigabytes es lenta y la respuesta "no se siente instantánea".
- Comando de ejemplo: `llama-cli -m Qwen3.8-27B-IQ2_M.gguf -c 32768 -no-cnv -p "your prompt"`. El flag `-no-cnv` es relevante según el autor.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantizaciones | Licencia | Notas |
|---|---|---|---|---|---|
| Qwen3.8-27B-GGUF (este repo) | 26,9 B | 262.144 (declarado) | Q4_K_M a IQ1_M-compact | Apache-2.0 | Benchmark agéntico propio por nivel de cuantización; sin `mmproj` |
| Qwen3.6-27B-GGUF (KikoCis) | no disponible | no disponible | no disponible | no disponible | Referencia del propio autor para fidelidad medida nivel a nivel frente a BF16 |
| Otras builds GGUF de Qwen3.8-27B | 26,9 B | 262.144 (heredado) | no disponible | Apache-2.0 (heredada) | El autor menciona que otros publicadores incluyen `mmproj` para visión; IQ1_M-compact queda 0,27 GB por debajo de la referencia de la comunidad |

No se dispone de datos de benchmarks comparativos frente a modelos de otras familias en la información proporcionada. La comparación relevante que sí documenta el repositorio es interna: IQ2_M iguala el rendimiento agéntico de Q3_K_M con un 28 % menos de tamaño, y IQ2_XS es peor en test apareado que IQ2_M (6 tareas a favor de IQ2_M, 0 en contra, p = 0,031) ahorrando solo un 9 % de espacio.

## Limitaciones y advertencias

- El umbral de cuantización para uso agéntico está entre 2,66 y 2,23 bits por peso. Por debajo, el fallo dominante es la ausencia total de emisión de llamada a herramienta, no una respuesta incorrecta.
- Las builds de 1 bit (IQ1_M uniforme e IQ1_M-compact) se publican por completitud, no para uso agéntico. IQ1_M-compact es apta para texto fluido, no para conducir herramientas.
- El contexto de 262.144 tokens es la ventana nativa declarada por el modelo, no verificada: no se completó ninguna prueba de needle-in-a-haystack.
- El repositorio es solo texto: no incluye `mmproj`, por lo que las entradas de visión del modelo base multimodal no funcionan. Otros publicadores sí lo incluyen.
- No hay tabla de fidelidad por nivel en este repositorio; el autor remite a Qwen3.6-27B-GGUF para una release con fidelidad medida nivel a nivel frente a BF16.
- Los resultados del benchmark están ligados al backend (Ollama) y no son directamente comparables con mediciones hechas en otro runtime. La misma build medida en `llama-server` difiere en siete tareas.
- La varianza entre ejecuciones es alta: cinco tareas de dispersión en el mismo benchmark de 40. Cualquier comparación entre builds debe hacerse con múltiples rondas y test apareado.
- El prefill es lento en llama.cpp con esta arquitectura híbrida, lo que penaliza bucles agénticos multi-turno donde la conversación se reprocesa en cada turno.
- Sesgos conocidos y riesgo de alucinación: no documentados en la información disponible. Aplican los del modelo base Qwen3.8-27B, no descritos aquí.
- Licencia Apache-2.0, que permite uso comercial. Las condiciones del modelo base deben verificarse en su repositorio original.
- El flag `-no-cnv` es necesario en el ejemplo de `llama-cli` proporcionado por el autor; la model card queda truncada en ese punto y no se detalla la razón completa.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/KikoCis/Qwen3.8-27B-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Repositorio con fidelidad medida por nivel: https://huggingface.co/KikoCis/Qwen3.6-27B-GGUF
- Elffuss Engine (Apache-2.0): https://github.com/KikoCis/elffuss-engine
- Demo en navegador Elffuss Claw: https://claw.elffuss.com
- Documento de contexto y aritmética de caché KV: `CONTEXT.md` dentro del repositorio
