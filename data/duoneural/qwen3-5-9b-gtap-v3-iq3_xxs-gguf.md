# DuoNeural/Qwen3.5-9B-GTAP-v3-IQ3_XXS-GGUF

## Resumen

Qwen3.5-9B-GTAP-v3-IQ3_XXS-GGUF es un checkpoint cuantizado en formato GGUF del modelo base Qwen/Qwen3.5-9B (9.197.093.888 parámetros), publicado por DuoNeural (Jesse Caldwell, Archon y Aura, DuoNeural Research Lab). La cuantización opera a ~3.82 bits por peso y ocupa 4.10 GiB, lo que la sitúa en el rango sub-4 bits. El método empleado es G-TAP v3 (Generalized Thouless-Anderson-Palmer), un marco de mecánica estadística que modela los pesos como vidrios de espín en campos de cavidad y resta el término de reacción de Onsager para proyectar las actualizaciones en el semiespacio contractivo de Lyapunov.

El problema que aborda es específico de las arquitecturas híbridas: Qwen3.5-9B combina atención lineal recurrente (Gated DeltaNet / SSM) con atención softmax GQA a lo largo de 32 capas, además de un módulo MTP y FFN con SwiGLU. En este tipo de arquitecturas, el redondeo agresivo de bits introduce deriva de autovalores en las matrices de transición recurrente, lo que provoca divergencia exponencial o saturación de logits en contextos largos. G-TAP v3 pretende amortiguar ese ruido de retroacción y mantener la estabilidad del estado recurrente.

Su relevancia práctica es que el autor publica métricas comparativas frente al base en BF16 y frente a otras cuantizaciones de su propio programa (Q4_K_M, IQ2_M, IQ2_XXS), lo que permite evaluar el compromiso entre huella de memoria, perplejidad y razonamiento. La model card lo declara explícitamente como artefacto de investigación experimental pendiente de verificación empírica adicional, y el repositorio registra 0 descargas y 0 likes en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Híbrida: atención lineal recurrente (Gated DeltaNet / SSM) alternada con atención softmax GQA, 32 capas + MTP, FFN SwiGLU (arquitectura del modelo base Qwen/Qwen3.5-9B) |
| Parametros totales | 9.197.093.888 (~9,2 mil millones) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | IQ3_XXS en este repositorio (~3.82 bpw, 4.10 GiB). El mismo programa del autor reporta además Q4_K_M, IQ2_M e IQ2_XXS |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF |
| Tamano del repositorio | 4.4 GB |
| Compatibilidad | Etiquetado como `endpoints_compatible`, `conversational`, `imatrix` |
| Fecha de publicacion registrada | 2026-09-29 (creacion) / 2026-09-29 (ultima actualizacion) |

## Arquitectura y entrenamiento

El modelo base Qwen3.5-9B emplea una arquitectura híbrida que alterna capas de atención lineal recurrente basada en Gated DeltaNet, con actualización de estado del tipo S_t = α·S_(t-1) + β·K^T·V, y capas de atención softmax multi-cabeza con GQA. Se organiza en 32 capas más un módulo de predicción multi-token (MTP) y utiliza SwiGLU en la red feed-forward. Esta ficha no cubre el entrenamiento del modelo base: en la información proporcionada no se detallan el número de tokens de entrenamiento, la composición del dataset ni si hubo fases de RLHF o DPO.

La innovación técnica documentada corresponde al proceso de cuantización, no al entrenamiento. G-TAP v3 modela los pesos como vidrios de espín embebidos en campos de cavidad de activación y resta el término de reacción de Onsager, definido como Ω_i = (1/d)·(‖H̃_i,:‖²₂ − H̃_ii²). A continuación proyecta las actualizaciones de parámetros estrictamente en el semiespacio contractivo de Lyapunov, Re(λ(S)) ≤ −δ. El objetivo declarado es doble: amortiguar el ruido de retroacción y preservar la estabilidad del estado recurrente y el razonamiento multi-paso hasta precisiones inferiores a 3 bits. El autor reporta que la metodología está pendiente de validación empírica adicional.

## Capacidades

- Generacion de texto conversacional: el modelo esta etiquetado como `conversational` y `text-generation`, con plantilla de chat basada en los tokens `<|im_start|>` / `<|im_end|>`.
- Generacion de codigo Python: el autor reporta una tasa de ejecucion AST del 100.0% (15/15 pruebas unitarias superadas), frente al 93.3% (14/15) del base en BF16.
- Tool calling: se evalua paridad AST con el formato de Hermes, con 93.3% (14/15), ligeramente por debajo del 100.0% (15/15) del base BF16.
- Razonamiento matematico: 64.0% (16/25) en GSM8K y 20.0% (2/10) en matematicas de olimpiada.
- Razonamiento paso a paso: la model card incluye un ejemplo de prompt explicito para resolver problemas "step by step" con temperatura 0.6.
- Estabilidad en contexto largo: la perplejidad se mide sobre un holdout continuo de 131.000 tokens, lo que sugiere tolerancia a contextos extensos, aunque la longitud de contexto maxima no se especifica.
- Capacidades multilingues: no disponibles en la informacion proporcionada.
- Vision, audio o modo "thinking" explicito: no disponibles en la informacion proporcionada.

## Casos de uso

- Generacion de codigo Python en pipelines de CI/CD: el modelo declara una tasa de ejecucion AST del 100.0% en 15 pruebas unitarias, por lo que puede emplearse como generador de funciones o parches que se validan automaticamente antes de fusionarse, con un coste de VRAM de 4.10 GiB.
- Asistente de terminal para exploracion de bases de codigo: el ecosistema Qwen publica Qwen Code como agente de terminal optimizado para estos modelos, y este checkpoint encaja por su huella reducida y su soporte conversacional.
- Servicio de chat autoalojado en una sola GPU: con llama-server en el puerto 8080, contexto de 8192 y `-ngl 99 -fa on`, puede desplegarse como backend HTTP para aplicaciones internas sin depender de APIs externas.
- Evaluacion e investigacion sobre cuantizacion extrema: es un artefacto util para reproducir y auditar las metricas de G-TAP v3, comparando perplejidad, GSM8K y ejecucion de codigo entre IQ3_XXS, IQ2_M e IQ2_XXS sobre el mismo modelo base.
- Agentes con tool calling de bajo coste: con 93.3% de paridad AST en el formato Hermes, puede orquestar llamadas a funciones en flujos de varios pasos donde el presupuesto de memoria sea la restriccion principal, aceptando la perdida de fiabilidad frente al base.
- Tareas de resolucion de problemas matematicos guiados: util para generar razonamientos paso a paso en entornos educativos con 25 problemas tipo GSM8K, asumiendo una tasa de acierto del 64.0% que requiere supervision humana.
- Despliegue en hardware de gama media o en CPU: el tamano de 4.10 GiB permite ejecutarlo en portatiles y equipos sin GPU dedicada mediante llama.cpp, con la penalizacion de latencia correspondiente.
- Prototipado rapido de aplicaciones conversacionales: la etiqueta `endpoints_compatible` facilita publicarlo como endpoint gestionado o integrarlo en servicios compatibles con la API de inferencia.

## Benchmarks y rendimiento

Datos publicados por el autor en la model card, medidos sobre el mismo testbed:

| Arm | Huella | Perplejidad (131k tokens) | GSM8K | Olimpiada | Python AST | Hermes Tool AST | Velocidad decode |
|---|---|---|---|---|---|---|---|
| Base BF16 | 17.14 GiB | 2.4306 | 23/25 (92.0%) | 2/10 (20.0%) | 14/15 (93.3%) | 15/15 (100.0%) | 27.0 t/s |
| GTAP Q4_K_M | 5.38 GiB | 2.3324 | 24/25 (96.0%) | 2/10 (20.0%) | 14/15 (93.3%) | 14/15 (93.3%) | 68.9 t/s |
| GTAP IQ3_XXS (este modelo) | 4.10 GiB | 2.6031 | 16/25 (64.0%) | 2/10 (20.0%) | 15/15 (100.0%) | 14/15 (93.3%) | 84.6 t/s |
| GTAP IQ2_M | 3.79 GiB | 2.7228 | 22/25 (88.0%) | 4/10 (40.0%) | 13/15 (86.7%) | 14/15 (93.3%) | 87.4 t/s |
| GTAP IQ2_XXS | 3.43 GiB | 2.8023 | 10/25 (40.0%) | 1/10 (10.0%) | 11/15 (73.3%) | 11/15 (73.3%) | 97.7 t/s |

No se han publicado resultados de benchmarks independientes en la informacion disponible. Los tamaños de muestra son muy reducidos (25 problemas GSM8K, 10 de olimpiada, 15 pruebas de codigo y 15 de tool calling), por lo que la variacion de un solo acierto mueve la metrica entre 4 y 6,7 puntos porcentuales.

## Requisitos de hardware

- Peso en disco y en VRAM de los pesos: 4.10 GiB para la cuantizacion IQ3_XXS (~3.82 bpw).
- VRAM estimada para inferencia: aproximadamente 5-6 GB considerando cache KV y overhead de runtime; es una estimacion derivada de la huella de pesos, no un dato confirmado por el autor.
- Cabe en GPU de consumo: si, en tarjetas con 8 GB de VRAM o mas. El testbed declarado por el autor es una NVIDIA GeForce RTX 4080 Super. Nota: el autor indica 32 GB de VRAM, aunque la RTX 4080 Super comercial se distribuye con 16 GB.
- GPU de gama alta: A100, H100 o RTX 4090 no se mencionan en la documentacion proporcionada; no disponible.
- Opciones de despliegue documentadas: llama.cpp mediante `llama-cli` y `llama-server`, con los parametros `-c 8192 -ngl 99 -fa on` para servidor y `-n 1024 -c 4096 --temp 0.6` para CLI. vLLM, Ollama y TGI no estan documentados en la informacion proporcionada.
- Throughput de decode declarado: 84.6 t/s en IQ3_XXS sobre RTX 4080 Super. Para comparar, el base BF16 alcanza 27.0 t/s, Q4_K_M 68.9 t/s, IQ2_M 87.4 t/s e IQ2_XXS 97.7 t/s.
- Latencia: no disponible (solo se publica velocidad de decode, sin datos de time-to-first-token).
- Requisitos de CPU reportados por terceros para el modelo base Qwen3.5 9B: 6 o mas nucleos y 38 GB o mas de RAM. Estas cifras corresponden al modelo sin cuantizar y no son directamente aplicables a este GGUF.

## Comparativa con modelos similares

No se dispone de datos de terceros para comparar. La comparativa se limita a variantes del mismo programa de cuantizacion, todas derivadas de Qwen/Qwen3.5-9B:

| Modelo | Parametros | Huella | Perplejidad | GSM8K | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| DuoNeural GTAP IQ3_XXS (este) | 9,2B | 4.10 GiB | 2.6031 | 64.0% | Apache 2.0 | HuggingFace, 0 descargas |
| DuoNeural GTAP Q4_K_M | 9,2B | 5.38 GiB | 2.3324 | 96.0% | Apache 2.0 | Referenciado en la model card |
| DuoNeural GTAP IQ2_M | 9,2B | 3.79 GiB | 2.7228 | 88.0% | Apache 2.0 | Referenciado en la model card |
| Base BF16 Qwen/Qwen3.5-9B | 9,2B | 17.14 GiB | 2.4306 | 92.0% | Apache 2.0 | Disponible en HuggingFace |
| DuoNeural/Qwen-3.5-9B-GGUF | 9,2B | no disponible | no disponible | no disponible | no disponible | HuggingFace |

Alternativas externas de tamano y categoria similares: no disponible en la informacion proporcionada.

## Limitaciones y advertencias

- Estado experimental: la propia model card indica "Experimental Release: Pending Further Verification / Empirical Validation". No debe tratarse como un modelo validado para produccion.
- Perdida de calidad medible: la perplejidad sube de 2.4306 (base BF16) a 2.6031, y GSM8K cae del 92.0% al 64.0%. La degradacion en razonamiento matematico es sustancial en este nivel de cuantizacion.
- Anomalia metodologica: el arm IQ2_M (3.79 GiB, mas pequeno y mas rapido) obtiene mejor GSM8K (88.0%) y mejor resultado en olimpiada (40.0%) que el IQ3_XXS de este repositorio, lo que cuestiona que IQ3_XXS sea el punto optimo de la familia.
- Muestras de evaluacion muy pequenas: 25 problemas GSM8K, 10 de olimpiada, 15 pruebas de codigo y 15 de tool calling. La incertidumbre estadistica es alta y no se reportan intervalos de confianza ni repeticiones.
- Resultados autodeclarados: todas las metricas proceden del autor, sin verificacion independiente ni replicacion externa.
- Riesgo de alucinacion: no se publica ninguna evaluacion de veracidad, tasa de alucinacion ni calibracion. La perplejidad elevada en contexto largo es un indicador de mayor incertidumbre del modelo.
- Sesgos: no se documenta ninguna evaluacion de sesgo, toxicidad o equidad.
- Idiomas: no se especifica la lista de idiomas soportados. Al ser una cuantizacion del modelo base, las capacidades multilingues dependen de este, pero no estan documentadas.
- Restricciones de licencia: Apache 2.0 permite uso comercial, modificacion y redistribucion, siempre que se conserve el aviso de copyright, se incluya copia de la licencia y se indiquen los cambios realizados. La licencia no incluye garantias.
- Trazabilidad baja: 0 descargas y 0 likes en el momento de la consulta, sin historial de uso ni issues publicos que permitan contrastar la calidad del checkpoint.
- Dependencia del modelo base: cualquier limitacion, sesgo o restriccion adicional de Qwen/Qwen3.5-9B sigue aplicando a este derivado.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/DuoNeural/Qwen3.5-9B-GTAP-v3-IQ3_XXS-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B
- Repositorio GGUF alternativo del mismo autor: https://huggingface.co/DuoNeural/Qwen-3.5-9B-GGUF
- README del repositorio GGUF alternativo: https://huggingface.co/DuoNeural/Qwen-3.5-9B-GGUF/blob/main/README.md
- Ficha del modelo base en ModelScope: https://www.modelscope.cn/models/qwen/Qwen3.5-9B/summary
- Ficha de Qwen3.5 9B en local-ai-zone (requisitos de sistema): https://local-ai-zone.github.io/models/qwen3-5-9b.html
- Ficha de Qwen3.5 9B en Doubleword: https://doubleword.ai/models/qwen3-5-9b/
- Paper de G-TAP v3, logs de test-time compute y pruebas fisicas: no disponibles como enlace en la informacion proporcionada.
