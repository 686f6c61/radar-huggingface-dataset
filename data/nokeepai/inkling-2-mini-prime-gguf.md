# nokeepai/Inkling-2-Mini-Prime-GGUF

## Resumen

Inkling-2-Mini-Prime-GGUF es un conjunto de pesos cuantizados en formato GGUF del modelo multimodal Inkling-2-Mini-Honed, publicado por el usuario nokeepai. Se trata de una variante afinada del modelo base Inkling 2 Mini, desarrollado originalmente por Thinking Machines Lab, Inc., que incorpora un ajuste fino orientado a corregir el exceso de razonamiento y los bloqueos ("over-thinking and stalling") del modelo original. El resultado es un modelo que resuelve tareas de depuracion compleja en un numero de tokens mucho menor que la version sin afinar.

El modelo combina capacidades de razonamiento con procesamiento de imagen y texto (pipeline `image-text-to-text`), lo que lo hace adecuado para tareas que requieren interpretar capturas, diagramas o documentos visuales junto con instrucciones textuales. Cuenta con aproximadamente 26.070 millones de parametros totales y se distribuye bajo licencia Apache 2.0.

La relevancia de esta publicacion radica en que demuestra que el ajuste fino del modelo Honed sobrevive al proceso de cuantizacion: incluso en Q4_K_M se mantiene un 100% de exito en el conjunto de depuracion dura, frente al 80% del modelo original cuantizado con la misma receta, y con una reduccion drastica de tokens por tarea (2.367 frente a 26.939). El repositorio ocupa 280,8 GB e incluye multiples niveles de cuantizacion, desde BF16 hasta IQ2_M, ademas del proyector de vision.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (image-text-to-text); detalles internos no disponibles |
| Parametros totales | 26.070.385.152 (~26,07 mil millones) |
| Parametros activos | no disponible |
| Longitud de contexto | 32.768 tokens (configuracion recomendada en llama.cpp con `-c 32768`) |
| Tipos de cuantizacion | BF16, Q8_0, Q6_K, Q5_K_M, Q4_K_M, IQ3_M, IQ2_M; proyector de vision en BF16 y Q8_0 |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 (sujeta a la Politica de Uso Aceptable del modelo base) |
| Formato de pesos | GGUF (safetensors en el modelo base) |

## Arquitectura y entrenamiento

No se dispone de informacion detallada sobre la arquitectura interna del modelo base Inkling 2 Mini en la informacion proporcionada. La model card indica que se trata de un modelo multimodal de tipo image-text-to-text con soporte de razonamiento, y que los pesos GGUF se generaron parcheando los tensores de atencion y de expertos del checkpoint fusionado sobre el fichero oficial `Inkling-2-Mini-BF16.gguf` de ggml-org. La mencion a "expertos" (48 tensores de expertos mapeados) sugiere una arquitectura de mezcla de expertos (MoE), aunque no se confirma el numero de expertos ni los parametros activos.

El proceso de construccion es destacable por su rigor: el script `gguf_v3.py` verifica el mapeo tensor a tensor de forma byte-exacta sobre los 192 tensores mapeados (144 de atencion y 48 de expertos) antes de aplicar el parche, y rechaza ejecutarse si la verificacion falla. Tras el parcheo, se comprueba que todos los tensores mapeados coinciden con el checkpoint fusionado y que el resto son identicos al fichero oficial. La cuantizacion se realizo con `llama-quantize` en el commit `19bc41dbb`, usando la matriz de importancia `imatrix.gguf` de ggml-org y manteniendo las capas `attn_q`, `attn_k`, `attn_v`, `attn_output` y `attn_gate` en q8_0 para preservar calidad. El ajuste fino que da lugar a la variante Honed "detiene el exceso de razonamiento y los bloqueos" del modelo original, segun la model card.

## Capacidades

- Generacion de texto y razonamiento multi-paso con modo de pensamiento configurable mediante el parametro `reasoning_effort` (valor recomendado 0.9).
- Procesamiento de imagen y texto combinados (image-text-to-text) mediante el proyector de vision incluido en el repositorio.
- Generacion y depuracion de codigo: el conjunto de evaluacion incluye tareas de depuracion dura y HumanEval.
- Razonamiento matematico: evaluado con GSM8K.
- Razonamiento con presupuesto de tokens controlado: el pensamiento se limita a 4096 tokens en la configuracion recomendada.
- Ejecucion local mediante llama.cpp, LM Studio y Ollama.
- Compatibilidad con endpoints (tag `endpoints_compatible`).
- Soporte conversacional multi-turno.
- No es un modelo sin censura ("Not an uncensored model"), segun la model card.

## Casos de uso

- Depuracion de codigo en produccion: el modelo resuelve el 100% de las tareas de depuracion dura del conjunto de evaluacion con Q4_K_M, consumiendo una media de 2.367 tokens por tarea, lo que lo hace viable para integrarse en pipelines de CI/CD o asistentes de desarrollo que necesitan respuestas rapidas y correctas sin divagaciones.
- Asistencia al desarrollador en IDE: con 32.768 tokens de contexto y soporte de razonamiento acotado a 4096 tokens, puede mantener conversaciones tecnicas largas sobre un repositorio y generar parches sin agotar el presupuesto de computo.
- Analisis de documentacion tecnica con imagenes: al ser image-text-to-text, puede interpretar diagramas de arquitectura, capturas de errores o esquemas junto con instrucciones textuales para diagnosticar problemas.
- Evaluacion automatizada de calidad de codigo: su alto rendimiento en HumanEval (98% con Q4_K_M en las primeras 50 tareas) permite usarlo como generador de pruebas unitarias o como revisor en pipelines de integracion.
- Razonamiento matematico asistido: con un 98% de acierto en las primeras 100 preguntas de GSM8K en Q4_K_M, es adecuado para tutoria o verificacion de calculos en entornos educativos o financieros.
- Despliegue en hardware de consumo: las cuantizaciones IQ3_M e IQ2_M permiten ejecutar el modelo en equipos con VRAM limitada, manteniendo el 100% en depuracion dura (IQ2_M con un 5,6% de turnos sin codigo), lo que habilita prototipos locales sin infraestructura cloud.
- Agentes locales con llama.cpp: la integracion con `llama-server`, `--jinja` y el paso de `chat_template_kwargs` permite construir agentes que controlan el esfuerzo de razonamiento por peticion.

## Benchmarks y rendimiento

Resultados publicados en la model card sobre los ficheros cuantizados, con llama.cpp, 15 tareas de depuracion dura, GSM8K (primeras 100) y HumanEval (primeras 50):

| Fichero | Depuracion dura resuelta | Turnos sin codigo | Tokens por tarea (media) | GSM8K (100) | HumanEval (50) |
|---|---|---|---|---|---|
| Honed Q8_0 | 100,0% | 0,0% | 2.606 | 94,0% | 100,0% |
| Honed Q4_K_M | 100,0% | 0,0% | 2.367 | 98,0% | 98,0% |
| Honed IQ2_M | 100,0% | 5,6% | 3.261 | 95,0% | 100,0% |
| Stock Q4_K_M (misma receta) | 80,0% | 87,9% | 26.939 | 97,0% | 100,0% |

Los ficheros Q6_K, Q5_K_M e IQ3_M no se volvieron a evaluar. Los resultados son de una sola pasada por fichero. Las cifras de la model card principal se midieron con los pesos safetensors; la tabla anterior es la verificacion sobre los ficheros GGUF.

## Requisitos de hardware

- VRAM estimada: aproximadamente el tamano del fichero mas unos pocos GB para el contexto. Para ejecucion completamente en GPU se necesita ese margen adicional; llama.cpp puede mantener parte de los expertos en RAM del sistema con `--n-cpu-moe N` si no cabe.
- El repositorio completo ocupa 280,8 GB, pero solo es necesario descargar el fichero de cuantizacion deseado y el proyector de vision.
- GPU recomendadas: no se especifican modelos concretos en la informacion disponible. Por el tamano del modelo (~26 mil millones de parametros), las cuantizaciones bajas (IQ2_M, IQ3_M) son las candidatas para GPU de consumo; las altas (Q8_0, BF16) requieren GPU de datacenter o ejecucion parcial en CPU.
- Despliegue: llama.cpp (build con soporte de Inkling 2 que incluya la correccion del bucle del PR #32704, commit `19bc41dbb`), LM Studio y Ollama.
- Configuracion recomendada: `--temp 0.6 --top-p 1.0`, `reasoning_effort` 0.9, pensamiento limitado a 4096 tokens, contexto de 32768 y `-ngl 99` para descargar todas las capas en GPU.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Depuracion dura | Licencia | Formato |
|---|---|---|---|---|---|
| Inkling-2-Mini-Prime-GGUF (Honed Q4_K_M) | ~26,07 mil M | 32.768 | 100% | Apache 2.0 | GGUF |
| Inkling-2-Mini stock (Q4_K_M, misma receta) | ~26,07 mil M | 32.768 | 80% | Apache 2.0 | GGUF |
| Inkling-2-Mini-Honed (safetensors) | ~26,07 mil M | no disponible | no disponible en la informacion | Apache 2.0 | safetensors |

No se dispone de datos de otros modelos comparables de la misma categoria en la informacion proporcionada.

## Limitaciones y advertencias

- No es un modelo sin censura: la model card lo indica explicitamente y remite a la Politica de Uso Aceptable del modelo base de Thinking Machines Lab.
- La licencia Apache 2.0 del modelo va acompanada de la Politica de Uso Aceptable del modelo base, que puede imponer restricciones adicionales al uso comercial.
- Los resultados de benchmarks son de una sola pasada por fichero y sobre subconjuntos pequenos (15 tareas de depuracion, 100 de GSM8K, 50 de HumanEval), por lo que la variabilidad estadistica no se ha caracterizado.
- Los ficheros Q6_K, Q5_K_M e IQ3_M no se volvieron a evaluar tras la cuantizacion; su comportamiento puede diferir del medido en Q8_0, Q4_K_M e IQ2_M.
- IQ2_M muestra un 5,6% de turnos sin codigo, lo que indica cierta degradacion en cuantizaciones muy agresivas.
- Requiere una build especifica de llama.cpp con la correccion del bucle del PR #32704; versiones anteriores pueden no funcionar correctamente.
- El modelo base puede presentar sesgos y riesgo de alucinacion; no se documentan evaluaciones especificas de sesgo en la informacion disponible.
- Los idiomas soportados no estan documentados, lo que limita la evaluacion de su comportamiento multilingue.
- El ajuste fino Honed prioriza la resolucion de tareas sobre la extension de la respuesta; en escenarios que requieran explicaciones largas puede no ser adecuado.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/nokeepai/Inkling-2-Mini-Prime-GGUF
- Modelo base (Honed): https://huggingface.co/nokeepai/Inkling-2-Mini-Honed
- Fichero oficial de ggml-org: `Inkling-2-Mini-BF16.gguf` (referenciado en la model card)
- PR de llama.cpp con la correccion del bucle: PR #32704 (commit `19bc41dbb`)
- Politica de Uso Aceptable del modelo base: https://thinkingmachines.ai/model-acceptable-use-policy/
- Licencia Apache 2.0: https://www.apache.org/licenses/LICENSE-2.0
- Sitio del autor del build: https://nokeep.ai/?ref=huggingface
