# gostar77/qwen3.8-flash-next-u4-w6-bf16ple

## Resumen

Qwen3.8-Flash-Next U4/W6NL BF16-PLE es una cuantizacion del punto de control BF16 de Qwen3.8-Flash-Next, publicada por el usuario gostar77 bajo el formato propietario Radiance RAD2. El artefacto ocupa 170,42 GiB y contiene 51.489 pesos, lo que lo convierte en una distribucion de un modelo de gran tamano (el repo completo pesa 183 GB) orientada a servir inferencia con un runtime especifico. No se trata de un modelo entrenado desde cero, sino de una compresion del checkpoint original de Qwen, del que hereda la licencia Qwen Community License 1.0.

La relevancia de esta publicacion es doble. Por un lado, demuestra una estrategia de cuantizacion mixta y granular: los expertos usan U4-trellis en las proyecciones gate/up y W6NL con grupos de 64 en las proyecciones down, mientras que las capas de atencion/SSM (`attn_qg`, `ssm_inz`) usan U5-trellis, y se preservan en BF16 los expertos protegidos, el modulo PLE y la torre de vision. Por otro lado, el autor publica mediciones de fidelidad de distribucion (KL medio de 0,11061 y 92,04 % de acuerdo top-1 frente al BF16) y de rendimiento en tareas (media macro de 88,18 % en HumanEval, MATH-500 y BFCL v3), lo que permite evaluar la perdida por cuantizacion con datos concretos.

El modelo no es de uso general inmediato: requiere un runtime Radiance con soporte W6NL para expertos, probado en la rama `feat/qwen4exp-u4-w6nl` (commit `077f2b42`). Las builds genericas de Radiance no pueden servirlo. La informacion disponible no detalla el numero de parametros originales ni la longitud de contexto del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con expertos (MoE) y componentes SSM; pesos cuantizados en formato Radiance RAD2 |
| Parametros totales | no disponible (el artefacto contiene 51.489 pesos; repo de 183 GB) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | U4-trellis (expert gate/up), W6NL grupo-64 (expert down), U5-trellis (`attn_qg`, `ssm_inz`), BF16 (PLE, vision y expertos protegidos) |
| Idiomas soportados | no disponible |
| Licencia | Qwen Community License 1.0 (`license: other`) |
| Formato de pesos | Radiance RAD2 (`.rad`), receta de cuantizacion `.recipe` |

## Arquitectura y entrenamiento

El artefacto es una cuantizacion del checkpoint BF16 de Qwen3.8-Flash-Next, no un modelo entrenado de forma independiente. La arquitectura subyacente combina capas de atencion y componentes SSM (se referencian explicitamente `attn_qg` y `ssm_inz`), ademas de una torre de vision en BF16 y un modulo PLE tambien en BF16. La presencia de "expertos" en la receta (gate/up, down y "expertos protegidos") indica una estructura de mezcla de expertos. No hay informacion sobre el numero de tokens de entrenamiento, la composicion del dataset ni si hubo RLHF o DPO.

La innovacion tecnica de esta publicacion es la receta de cuantizacion mixta: U4-trellis para las proyecciones gate/up de los expertos, W6NL con grupos de 64 para las proyecciones down, U5-trellis para atencion/SSM, y preservacion en BF16 de los expertos protegidos, PLE y vision. El autor incluye el fichero `qwen4exp-u4-w6nl-bf16ple.recipe` con los ajustes de calibracion, aunque aclara que las Grams de calibracion originales no se incluyen. No se documentan tecnicas como decodificacion especulativa o atencion lineal mas alla de la mencion a MTP (multi-token prediction) que se desactiva en las evaluaciones.

## Capacidades

- Generacion de texto y razonamiento: el modelo base es de la familia Qwen y el pipeline declarado es `text-generation`.
- Generacion de codigo: medido en HumanEval con 147/164 aciertos (89,6 %) en modo greedy y thinking xhigh.
- Razonamiento matematico: medido en MATH-500 con 427/500 aciertos (85,4 %).
- Tool calling / function calling: medido en BFCL v3 simple con 358/400 aciertos (89,5 %).
- Vision: el artefacto conserva la torre de vision en BF16, por lo que el modelo base mantiene capacidad multimodal.
- Modo thinking: las evaluaciones usan "xhigh thinking", lo que confirma soporte de modo de razonamiento extendido.
- Capacidades multilingues: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no documentado explicitamente, aunque el resultado en BFCL v3 sugiere capacidad de invocacion de funciones.

## Casos de uso

- Generacion de codigo en produccion: con un 89,6 % en HumanEval y soporte de tool calling, puede integrarse en pipelines de CI/CD para autocompletado, generacion de tests o revision de parches, siempre que el runtime Radiance con W6NL este disponible.
- Asistencia matematica y resolucion de problemas: el 85,4 % en MATH-500 permite usarlo en tutoria o verificacion de derivaciones, con modo thinking xhigh para problemas de varios pasos.
- Orquestacion de agentes con function calling: el 89,5 % en BFCL v3 simple lo hace adecuado para agentes que invocan APIs, aunque requiere validacion en el entorno real de herramientas.
- Analisis de documentos con imagenes: al conservar la torre de vision en BF16, puede procesar capturas, diagramas o formularios combinados con texto.
- Investigacion sobre cuantizacion: la publicacion incluye receta y mediciones de KL y acuerdo top-1, lo que la convierte en material de referencia para estudiar el impacto de cuantizaciones mixtas U4/W6NL.
- Despliegue en infraestructura con runtime Radiance: equipos que ya operan Radiance pueden servir esta variante para reducir huella de memoria frente al BF16, a cambio de una perdida medida de fidelidad.
- Evaluacion comparativa de fidelidad: los ficheros `evaluation/` permiten reproducir el analisis de divergencia KL por posicion sobre un corpus de 64 documentos.

## Benchmarks y rendimiento

Evaluacion de tareas (BF16 KV, sin decodificacion especulativa/MTP, greedy, thinking xhigh, limite de 4.096 tokens de generacion, 1.064 prompts):

| Tarea | Resultado | IC 95 % |
|---|---:|---|
| HumanEval | 147/164 (89,6 %) | 84,8–93,9 % |
| MATH-500 | 427/500 (85,4 %) | 82,2–88,4 % |
| BFCL v3 simple | 358/400 (89,5 %) | 86,5–92,5 % |
| Media macro por tarea | 88,18 % | 85,98–90,21 % |

Sesenta y cinco respuestas alcanzaron el limite de 4.096 tokens (18 en HumanEval y 47 en MATH-500; ninguna en BFCL). El autor indica que el intervalo macro se solapa con candidatos medidos previamente y que esta ejecucion no establece un ganador estadisticamente distinto.

Comparacion de distribucion a vocabulario completo (106.851 posiciones de siguiente token en 64 documentos empaquetados, KV BF16, sin especulacion):

| Metrica | U4/W6NL | Referencia BF16 |
|---|---:|---:|
| Divergencia KL media | 0,11061 | — |
| Acuerdo top-1 | 92,04 % | — |
| Perplejidad | 5,08875 | 5,13328 |
| Ratio de PPL | 0,99133 | 1,00000 |

Intervalos bootstrap descriptivos al 95 % (5.000 remuestreos, semilla 20261117): KL media 0,08820–0,13468; acuerdo top-1 90,82–93,27 %; ratio de PPL 0,96193–1,02124. El intervalo del ratio de PPL incluye 1, por lo que la menor PPL puntual no es concluyente. El autor advierte que, al concatenar ejemplos independientes en 64 documentos, los intervalos son descriptivos y no una garantia de generalizacion. Ninguna de las dos evaluaciones mide la ruta de servicio con KV i8 y especulacion.

## Requisitos de hardware

- VRAM estimada para inferencia: el artefacto pesa 170,42 GiB (repo de 183 GB), por lo que se necesita al menos esa cantidad de memoria en GPU o un esquema de offload; no se proporcionan estimaciones adicionales.
- GPU recomendadas: no disponible en la informacion proporcionada.
- Cabe en GPU de consumo: no disponible; el tamano del artefacto supera la memoria de cualquier GPU de consumo actual.
- Opciones de despliegue: runtime Radiance con soporte W6NL para expertos, rama `feat/qwen4exp-u4-w6nl` (commit `077f2b42`). Las builds genericas de Radiance no pueden servirlo. No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.8-Flash-Next U4/W6NL BF16-PLE | no disponible (51.489 pesos, 170,42 GiB) | no disponible | HumanEval 89,6 %; MATH-500 85,4 %; BFCL v3 89,5 % | Qwen Community License 1.0 | Hugging Face, requiere Radiance W6NL |
| Qwen3.8-Flash-Next (BF16 original) | no disponible | no disponible | Referencia de KL y PPL en la model card | Qwen Community License 1.0 | Checkpoint fuente referenciado, no enlazado |
| Otras cuantizaciones Radiance del mismo checkpoint | no disponible | no disponible | El autor menciona "candidatos medidos previamente" sin cifras | Qwen Community License 1.0 | no disponible |

No se dispone de datos suficientes para comparar con alternativas de otros formatos (GGUF, AWQ, GPTQ) del mismo modelo base.

## Limitaciones y advertencias

- Dependencia de runtime: solo funciona con Radiance y soporte W6NL; las builds genericas fallan al servir el artefacto.
- Perdida por cuantizacion: KL media de 0,11061 y acuerdo top-1 del 92,04 % frente al BF16; no es una replica exacta del modelo original.
- Evaluaciones limitadas: las metricas se obtuvieron con greedy, sin MTP ni especulacion y con KV BF16; no miden la ruta de servicio real con KV i8 y especulacion.
- Intervalos no concluyentes: el intervalo del ratio de PPL incluye 1 y el macro de tareas se solapa con otros candidatos.
- Calibracion no incluida: la receta describe los ajustes, pero las Grams de calibracion originales no se distribuyen, lo que dificulta reproducir la cuantizacion.
- Sesgos y alucinacion: no se documentan sesgos conocidos ni tasas de alucinacion; al ser una cuantizacion, los riesgos del modelo base se mantienen.
- Idiomas: no se especifican los idiomas soportados.
- Licencia: Qwen Community License 1.0; es necesario revisar sus restricciones para uso comercial antes de desplegar.
- Repositorio sin traccion: 0 descargas y 0 likes en el momento de la consulta, sin validacion externa de la comunidad.

## Enlaces

- Hugging Face: https://huggingface.co/gostar77/qwen3.8-flash-next-u4-w6-bf16ple
- Receta de cuantizacion: `qwen4exp-u4-w6nl-bf16ple.recipe` (incluida en el repositorio)
- Licencia: `LICENSE` (Qwen Community License 1.0)
- Evaluaciones: `evaluation/task-ranking-summary.json`, `evaluation/full-vocab-kld-summary.json`, `evaluation/full-vocab-kld-score.json`
- Rama de runtime probada: `feat/qwen4exp-u4-w6nl`, commit `077f2b42` (sin URL publica en la informacion disponible)
- Papers, blogs, repos y demos adicionales: no disponible
