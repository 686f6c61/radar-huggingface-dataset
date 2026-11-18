# KikoCis/Qwen3.8-27B-GGUF

## Resumen

Qwen3.8-27B-GGUF es una compilación de cuantizaciones GGUF del modelo Qwen/Qwen3.8-27B, publicada por el usuario KikoCis. El modelo base es un transformer híbrido de 26.895.998.464 parámetros (aproximadamente 26,9 mil millones) desarrollado por el equipo Qwen, con una ventana de contexto nativa declarada de 262.144 tokens. La licencia es Apache-2.0, lo que permite uso comercial sin restricciones adicionales.

Lo relevante de esta publicación no es el conjunto de ficheros en sí, sino el trabajo de medición que la acompaña: el autor documenta empíricamente el umbral de cuantización por debajo del cual el modelo deja de ser fiable para tareas agénticas (tool calling multi-paso). Según sus mediciones, el punto de ruptura se sitúa entre 2,66 y 2,23 bits por peso: por encima de ese umbral el modelo completa tareas de uso de herramientas de forma prácticamente perfecta, y por debajo resuelve aproximadamente una de cada tres, fallando principalmente por no emitir ninguna llamada a herramienta.

La arquitectura del modelo base es híbrida: de sus 65 bloques, 48 son SSM/atención lineal, 16 son atención completa (uno de cada cuatro) y 1 es una cabeza MTP. Solo esos 16 bloques mantienen caché KV que crece con la longitud de secuencia, lo que reduce el coste de memoria por token a unos 64 KB frente a los aproximadamente 256 KB/token de un modelo denso equivalente. El repositorio ocupa 149,8 GB e incluye seis niveles de cuantización entre 1,94 y 4 bits por peso, además de un motor WebGPU para ejecución en navegador.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer híbrido: 65 bloques (48 SSM/atención lineal, 16 atención completa, 1 cabeza MTP) |
| Parametros totales | 26.895.998.464 (~26,9 mil millones) |
| Parametros activos | no disponible (no es MoE según la información proporcionada) |
| Longitud de contexto | 262.144 tokens (ventana nativa declarada, no verificada con needle-in-a-haystack) |
| Tipos de cuantizacion | Q4_K_M (16,81 GB), IQ4_XS (15,31 GB), Q3_K_M (13,50 GB, 3,40 bpw), IQ2_M (10,00 GB, 2,93 bpw), IQ2_XS (9,09 GB, 2,66 bpw), IQ1_M-compact (6,46 GB, 1,94 bpw) |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

El modelo base emplea una arquitectura híbrida que combina capas de espacio de estados (SSM) o atención lineal con capas de atención completa intercaladas cada cuatro bloques. De los 65 bloques totales, 48 son SSM/atención lineal, 16 son atención completa y 1 es una cabeza MTP (multi-token prediction). Esta distribución implica que solo 16 capas mantienen caché KV dependiente de la longitud de secuencia, calculada en el repositorio como 16 capas × 4 cabecas KV × (256 + 256) × 2 bytes = 64 KB por token. Un modelo denso con los 65 bloques atendiendo pagaría aproximadamente 256 KB/token, cuatro veces más.

No se dispone de información sobre el volumen de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO en el modelo base. La model card del repositorio de cuantización no incluye estos datos. La innovación técnica destacable documentada es la propia arquitectura híbrida y su efecto sobre el coste de contexto; el autor advierte de la contrapartida medida: la misma arquitectura hace que el prefill sea lento en llama.cpp en la versión actual, de modo que en bucles agénticos multi-turno, donde la conversación se reprocesa en cada turno, el modelo consume mucho más tiempo en prefill que un modelo denso del mismo tamaño. El modelo es "barato en memoria, caro en tiempo".

## Capacidades

- Generación de texto conversacional: el repositorio está etiquetado como `conversational` y `text-generation`.
- Uso de herramientas (tool calling / function calling): capacidad medida explícitamente mediante un benchmark de 40 tareas objetivas verificadas ejecutando el artefacto producido, sin juez LLM.
- Razonamiento agéntico multi-paso: el modelo completa cadenas de llamadas a herramientas; el umbral de cuantización documentado se define precisamente por esta capacidad.
- Contexto largo: ventana nativa declarada de 262.144 tokens, con coste de caché KV reducido por la arquitectura híbrida (64 KB/token).
- Capacidad multimodal del modelo base: el modelo original es multimodal, pero este repositorio no incluye fichero `mmproj`, por lo que las entradas de visión no funcionan en estas cuantizaciones.
- Ejecución en navegador: la variante IQ1_M-compact puede cargarse vía WebGPU mediante Elffuss Engine, leyendo GGUF estándar por peticiones de rango y desquantizando en el shader.
- Capacidades multilingües: no disponibles en la información proporcionada.

## Casos de uso

- Agentes de uso de herramientas en producción con presupuesto de memoria ajustado: desplegar la variante IQ2_M (10,00 GB, 2,93 bpw), que según las mediciones iguala el rendimiento agéntico del build de 3,40 bpw (79/80 frente a 40/40 en sus respectivos conjuntos de prueba) con un 28 % menos de tamaño. Adecuado para entornos donde la VRAM es el factor limitante y las tareas requieren cadenas de llamadas a funciones.

- Automatización de tareas con contexto largo: procesar documentos extensos o historiales de conversación de hasta 262.144 tokens aprovechando que solo 16 de los 65 bloques mantienen caché KV, lo que reduce el coste de memoria por token a 64 KB frente a 256 KB de un denso equivalente.

- Ejecución local en hardware de consumo: la variante IQ1_M-compact (6,46 GB) permite cargar el modelo en GPUs de consumo y en navegador vía WebGPU. Válida para generación de texto fluida, no para agentes.

- Prototipado de pipelines agénticos en CI/CD: usar IQ2_M o Q3_K_M para validar flujos de tool calling antes de escalar a un modelo mayor, con la ventaja de que el umbral de fiabilidad está documentado y medido.

- Despliegue en navegador sin instalación: la combinación IQ1_M-compact + Elffuss Engine permite ofrecer una demo de generación de texto en una sola pestaña, sin sharding entre dispositivos. El autor advierte que es lento y que la primera carga supone varios gigabytes.

- Evaluación comparativa de cuantizaciones: el repositorio sirve como referencia metodológica para medir el efecto de la cuantización sobre capacidades agénticas, con protocolo de muestreo declarado (temp 1 / top_p 0.95 / top_k 20) y análisis de ruido entre ejecuciones.

- Generación de texto en entornos con licencia permisiva: la licencia Apache-2.0 permite integrar el modelo en productos comerciales sin obligaciones de atribución adicionales más allá de las estándar.

## Benchmarks y rendimiento

Los datos disponibles corresponden exclusivamente al benchmark agéntico propio del autor (40 tareas objetivas verificadas por ejecución del artefacto, sin juez LLM), medido a través de Ollama con el perfil de muestreo declarado por el modelo:

| bits/peso | Fichero | Tareas agénticas | Veredicto |
|---|---|---|---|
| 3,40 | Q3_K_M | 40/40 — 100 % | funciona |
| 2,93 | IQ2_M | 79/80 — 98,8 % | mejor relación calidad/tamaño |
| 2,66 | IQ2_XS | 72/80 — 90,0 % | peor de forma medible, ahorra poco |
| 2,23 | IQ1_M (uniforme) | 60/160 — 37,5 % | roto para agentes |
| 1,94 | IQ1_M-compact | 49/160 — 30,6 % | roto para agentes |

Notas metodológicas del autor: ejecuciones repetidas del mismo build sobre las mismas 40 tareas dan 17, 12, 16 y 15 aciertos, una dispersión de cinco tareas mayor que la mayoría de diferencias entre builds. Todas las filas por encima de 2,23 bpw son de al menos dos rondas; las de 1 bit, de cuatro. La fidelidad no predice la capacidad: el build de 3,40 bpw discrepa del original BF16 en el argmax del siguiente token en el 9,5 % de las posiciones y aun así puntúa 40/40. Además, cada cifra está ligada a un backend: IQ1_M-compact ejecutado mediante `llama-server` de llama.cpp puntúa 19/40 (47,5 %) frente al 30,6 % obtenido en Ollama, una diferencia de siete tareas fuera de la banda de ruido.

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente el tamaño del fichero más el coste de la caché KV. Con IQ2_M (10,00 GB) y contexto de 32.768 tokens, la caché KV adicional es de unos 2 GB (64 KB/token × 32.768), lo que sitúa el requisito en torno a 12 GB.
- Con Q3_K_M (13,50 GB) y el mismo contexto, el requisito ronda los 15,5 GB.
- Con IQ1_M-compact (6,46 GB), el requisito se aproxima a 8,5 GB para 32.768 tokens de contexto.
- GPU recomendadas: no especificadas en la información disponible. Por tamaño, las variantes de 2-3 bits encajan en GPUs de consumo de 16 GB o más; las de 4 bits requieren 24 GB o más.
- Cabe en GPU de consumo: sí, al menos las variantes IQ2_M, IQ2_XS e IQ1_M-compact en tarjetas de 16 GB o superiores.
- Opciones de despliegue: llama.cpp (`llama-cli` y `llama-server`), Ollama (backend usado en las mediciones) y Elffuss Engine para WebGPU en navegador.
- Latencia y throughput: no disponibles como cifras. El autor advierte que el prefill es lento en llama.cpp con esta arquitectura y que en bucles agénticos multi-turno el tiempo de prefill domina frente a un denso del mismo tamaño. La ejecución en navegador se describe como lenta, con primera carga de varios gigabytes.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Qwen3.8-27B (BF16, base) | ~26,9 mil millones | 262.144 | Apache-2.0 | safetensors | Referencia de fidelidad; sin cuantizar |
| KikoCis/Qwen3.8-27B-GGUF (IQ2_M) | ~26,9 mil millones | 262.144 | Apache-2.0 | GGUF | 2,93 bpw, 98,8 % en benchmark agéntico propio |
| KikoCis/Qwen3.6-27B-GGUF | no disponible | no disponible | Apache-2.0 (según repositorio) | GGUF | Publicación del mismo autor con tabla de fidelidad medida por nivel |

No se dispone de datos de benchmarks estándar ni de comparaciones con modelos de otros fabricantes en la información proporcionada, por lo que no es posible establecer una comparativa de rendimiento frente a alternativas de la misma categoría.

## Limitaciones y advertencias

- El contexto de 262.144 tokens es la ventana nativa declarada por el modelo, no verificada: no se completó ninguna prueba de needle-in-a-haystack.
- El repositorio es solo texto: no incluye fichero `mmproj`, por lo que las entradas de visión del modelo base multimodal no funcionan. Otros publicadores sí incluyen uno.
- Las cuantizaciones de 1 bit (IQ1_M uniforme e IQ1_M-compact) están rotas para uso agéntico: 37,5 % y 30,6 % de éxito respectivamente, con fallo dominante consistente en no emitir ninguna llamada a herramienta.
- IQ2_XS es peor que IQ2_M en prueba pareada (6 tareas gana IQ2_M, 0 al contrario, p = 0,031) ahorrando solo un 9 % de tamaño.
- Sobre IQ1_M-compact: ninguna diferencia pareada es estadísticamente significativa (p = 0,473 frente a la referencia de la comunidad; p = 0,424 frente al build de 1 bit mayor), pero ocupa el último lugar en las tres estimaciones centrales. La ausencia de diferencia detectada no es evidencia de equivalencia.
- Alta variabilidad entre ejecuciones: dispersión de cinco tareas en el mismo build y mismas tareas, lo que limita la resolución del benchmark para separar builds.
- Los resultados dependen del backend: el mismo fichero puntúa 30,6 % en Ollama y 47,5 % en `llama-server`. No deben compararse cifras medidas en runtimes distintos.
- Prefill lento en llama.cpp: penaliza especialmente bucles agénticos multi-turno donde la conversación se reprocesa en cada turno.
- La fidelidad (perplejidad, divergencia KL) no predice la capacidad: el build de 3,40 bpw discrepa del BF16 en el 9,5 % de los argmax y aun así puntúa 40/40.
- No se dispone de información sobre sesgos conocidos, riesgo de alucinación específico ni limitaciones idiomáticas del modelo base.
- Licencia Apache-2.0: permite uso comercial sin restricciones adicionales; no se identifican caveats de licencia en la información disponible.
- El repositorio tiene 1 like y 5.198 descargas: es una publicación de terceros, no oficial de Qwen, por lo que la responsabilidad sobre la calidad de las cuantizaciones recae en el autor.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/KikoCis/Qwen3.8-27B-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Documentación de contexto del repositorio (`CONTEXT.md`): https://huggingface.co/KikoCis/Qwen3.8-27B-GGUF/blob/main/CONTEXT.md
- Elffuss Engine (Apache-2.0): https://github.com/KikoCis/elffuss-engine
- Demo en navegador (Elffuss Claw): https://claw.elffuss.com
- Publicación hermana con fidelidad medida por nivel: https://huggingface.co/KikoCis/Qwen3.6-27B-GGUF
