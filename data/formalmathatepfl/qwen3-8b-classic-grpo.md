# formalmathatepfl/qwen3-8b-classic-grpo

## Resumen

Qwen3-8B Classic GRPO es un checkpoint de ajuste fino del modelo denso Qwen3-8B (8.190.735.360 parametros) especializado en demostracion automatica de teoremas en Lean. El repositorio, publicado por el usuario `formalmathatepfl`, es un espejo del checkpoint original `etiennebamas/qwen3-8b-classic-grpo-step-250`, fijado a la revision `942d2cd0bfcae285b1470fcf5956e9349baac261` y correspondiente al paso 250 de entrenamiento.

El modelo parte de la arquitectura `Qwen3ForCausalLM` y se ha entrenado con GRPO (Group Relative Policy Optimization), un algoritmo de aprendizaje por refuerzo sin modelo critico que optimiza la politica comparando recompensas relativas dentro de un grupo de generaciones muestreadas para el mismo prompt. En este caso el dominio de optimizacion es la prueba de teoremas formales: el modelo genera pruebas en el lenguaje de especificacion de Lean y la recompensa procede, tipicamente, de la verificacion del compilador. El autor no detalla en la model card ni el dataset ni la funcion de recompensa empleada.

Es relevante ahora porque se situa en la interseccion de dos lineas de trabajo muy activas: los modelos Qwen3 con modos de razonamiento explicito (thinking) y la familia de "provers" de 7-8B parametros que aspiran a resolver problemas de nivel competicion sin necesidad de infraestructura de gran escala. Al ser un checkpoint intermedio (paso 250) y no un modelo con documentacion de benchmarks, debe tratarse como material de investigacion reproducible mas que como un componente listo para produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso decoder-only, `Qwen3ForCausalLM` |
| Parametros totales | 8.190.735.360 |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no especificada en la model card; el modelo base Qwen3-8B soporta 32.768 tokens nativos y 131.072 con escalado YaRN |
| Tipos de cuantizacion | el repositorio solo contiene pesos BF16; no se publican checkpoints cuantizados (AWQ, GPTQ, GGUF) |
| Idiomas soportados | no disponible en la model card; el modelo base Qwen3-8B cubre 119 idiomas y dialectos segun la documentacion de Qwen |
| Licencia | no disponible en el repositorio; el modelo base Qwen3-8B se distribuye bajo Apache 2.0 |
| Formato de pesos | safetensors, dtype BF16, 4 shards |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura de Qwen3-8B: un transformer decoder-only denso de 8.190.735.360 parametros con atencion por consultas agrupadas (GQA), normalizacion RMSNorm y embeddings rotatorios (RoPE). Qwen3 incorpora un modo de razonamiento explicito (thinking) que puede activarse o desactivarse segun el caso de uso, asi como soporte nativo de tool calling en la plantilla de chat del modelo base. La model card del checkpoint no documenta ninguna modificacion estructural respecto al modelo original: se trata de un ajuste de pesos, no de un cambio de arquitectura.

El entrenamiento se realizo con GRPO, un metodo de optimizacion de politica proximal sin critico que estima la ventaja normalizando las recompensas de un grupo de respuestas candidatas generadas para el mismo enunciado. El dominio declarado es la prueba de teoremas en Lean. La model card no especifica el numero de tokens de entrenamiento, la composicion del dataset, la funcion de recompensa ni si hubo etapas previas de SFT, DPO o RLHF. Tampoco se documenta la configuracion de GRPO (tamano de grupo, coeficiente KL, tasa de aprendizaje) ni el modo de decodificacion esperado.

## Capacidades

- Generacion de texto y razonamiento en lenguaje natural, heredados del modelo base Qwen3-8B.
- Generacion de pruebas formales en Lean, que es el objetivo declarado del ajuste con GRPO.
- Razonamiento multi-paso con modo thinking, activable mediante la plantilla de chat del modelo base.
- Soporte de tool calling y function calling heredado de Qwen3; no confirmado explicitamente para este checkpoint.
- Capacidades multilingues del modelo base (119 idiomas y dialectos segun Qwen), no verificadas tras el ajuste.
- Generacion de codigo y matematicas, como capacidades generales del modelo base.
- Capacidad de vision: no disponible (el modelo base Qwen3-8B es exclusivamente de texto).

## Casos de uso

- Demostracion automatica de teoremas en Lean: el modelo recibe un enunciado formalizado y genera una prueba que puede verificarse con el compilador de Lean; es el escenario para el que fue entrenado y el unico con evidencia directa en la model card.
- Asistente de formalizacion en entornos de investigacion matematica: dado un enunciado informal, generar un esbozo de formalizacion y las tácticas necesarias, dejando la verificacion final al compilador.
- Generacion de lemas auxiliares en desarrollos grandes: el modelo puede proponer lemas intermedios que el usuario revisa e incorpora manualmente a una base de codigo Lean existente.
- Investigacion en aprendizaje por refuerzo: al ser un checkpoint intermedio (paso 250) de un entrenamiento GRPO, sirve para estudiar la evolucion de la politica, comparar curvas de recompensa y reproducir experimentos.
- Evaluacion comparativa de provers: como linea base de 8B parametros en suites como miniF2F, aunque el autor no publica resultados, el checkpoint puede evaluarse con los arneses estandar de Lean.
- Generacion de datos sinteticos para entrenamiento: las pruebas generadas y verificadas por el compilador pueden filtrarse y reutilizarse como datos de SFT para modelos posteriores.
- Tutorizacion de Lean en entornos docentes: explicar paso a paso una prueba existente y proponer alternativas a una táctica que falla, con la salvedad de que las explicaciones en lenguaje natural no estan verificadas.
- Integracion en pipelines de CI para proyectos Lean: uso como sugeridor de parches ante fallos de compilacion, siempre con revision humana antes del merge.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del repositorio espejo se limita a describir el checkpoint (arquitectura, parametros, formato y paso de entrenamiento) y no incluye metricas de miniF2F, LeanWorkbook, MMLU, HumanEval, GSM8K ni de ninguna otra suite.

## Requisitos de hardware

- VRAM estimada en BF16: aproximadamente 16,4 GB solo para los pesos, mas overhead de activaciones y cache KV; en la practica se recomiendan 20-24 GB para secuencias de contexto moderado.
- VRAM estimada cuantizado: en 8 bits, en torno a 9-10 GB; en 4 bits, en torno a 5-6 GB, con la consiguiente perdida de calidad numerica sobre un modelo ya ajustado con RL.
- GPU profesionales: A100 40/80 GB, H100 80 GB, L40S 48 GB y A6000 48 GB permiten inferencia en BF16 con contexto largo y lotes grandes.
- GPU de consumo: cabe en RTX 4090, RTX 3090 y RTX 5090 (24-32 GB) en BF16; en tarjetas de 16 GB (RTX 4080, RTX 5070 Ti) es necesario recurrir a cuantizacion de 8 o 4 bits.
- Opciones de despliegue: transformers (metodo indicado en la model card), vLLM y SGLang para servicio de alto rendimiento, TGI por compatibilidad con el ecosistema HuggingFace. Al no publicarse pesos GGUF, llama.cpp y Ollama requieren una conversion previa por parte del usuario.
- Latencia y throughput: no disponibles. Al ser un modelo denso de 8B en BF16, el throughput depende enteramente del hardware y del backend; no hay mediciones publicadas por el autor.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Especialidad | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3-8B Classic GRPO (este) | 8,19B | no especificado en la model card | Prover Lean ajustado con GRPO | no disponible en el repo | Pesos BF16 en safetensors |
| Qwen3-8B (base) | 8,19B | 32.768 nativos, 131.072 con YaRN | Proposito general, thinking y tool calling | Apache 2.0 | safetensors, GGUF y cuantizaciones de la comunidad |
| DeepSeek-Prover-V2-7B | ~7B | no disponible en la informacion proporcionada | Prover Lean | no disponible en la informacion proporcionada | Pesos publicados por DeepSeek |
| Goedel-Prover-V2-8B | ~8B | no disponible en la informacion proporcionada | Prover Lean | no disponible en la informacion proporcionada | Pesos publicados por Goedel-LM |

No se dispone de resultados de benchmarks comparativos en la informacion proporcionada, por lo que la comparacion se limita a parametros, contexto, especialidad y licencia. La ventaja diferencial de este checkpoint frente al Qwen3-8B base es la especializacion en Lean; su desventaja es la ausencia total de documentacion de rendimiento y de licencia explicita.

## Limitaciones y advertencias

- Ausencia de benchmarks: el autor no publica ninguna metrica, por lo que no puede afirmarse que el ajuste con GRPO mejore al modelo base en tareas de prueba formal.
- Licencia no declarada: el repositorio no especifica licencia. Aunque el modelo base Qwen3-8B es Apache 2.0, la ausencia de licencia explicita en este espejo es un riesgo legal para uso comercial hasta que se aclare.
- Checkpoint intermedio: corresponde al paso 250 de un entrenamiento, no necesariamente al mejor punto de la politica. Puede presentar degradacion respecto a checkpoints posteriores o al modelo base en tareas fuera de dominio.
- Riesgo de alucinacion: en generacion de lenguaje natural, el modelo puede producir explicaciones plausibles pero incorrectas. En Lean, la verificacion del compilador mitiga el problema, pero solo si el pipeline de evaluacion compila realmente la salida.
- Sobreajuste al dominio: el ajuste con GRPO sobre Lean puede reducir el rendimiento en tareas generales de texto, codigo o matematicas informales respecto al Qwen3-8B original. No hay evaluaciones que cuantifiquen esa perdida.
- Sesgos: no se documenta ninguna evaluacion de sesgo, toxicidad o alineacion. El modelo base Qwen3-8B hereda los sesgos de sus datos de entrenamiento y el ajuste con RL no los corrige.
- Idiomas: el comportamiento multilingue tras el ajuste no esta verificado; la mayor parte de los datos de prueba formal estan en ingles.
- Reproducibilidad: el repositorio es un espejo de otro, lo que anade un salto de trazabilidad. Conviene referenciar el repositorio original y la revision concreta al citarlo.
- Formato de pesos: solo safetensors BF16. No hay cuantizaciones oficiales, lo que obliga a conversion manual para despliegues en hardware limitado.
- Produccion: no se recomienda su uso directo en sistemas de atencion al cliente, generacion de codigo general o cualquier tarea fuera del ambito de la prueba formal sin una evaluacion previa exhaustiva.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/formalmathatepfl/qwen3-8b-classic-grpo
- Repositorio original espejado: https://huggingface.co/etiennebamas/qwen3-8b-classic-grpo-step-250
- Modelo base Qwen3-8B: https://huggingface.co/Qwen/Qwen3-8B
- Blog oficial de la familia Qwen3: https://qwenlm.github.io/blog/qwen3/
- Informe tecnico de Qwen3: https://arxiv.org/abs/2505.09388
- Articulo original de GRPO (DeepSeekMath): https://arxiv.org/abs/2402.03300
- Proyecto Lean: https://lean-lang.org/
- Documentacion de Transformers para `Qwen3ForCausalLM`: https://huggingface.co/docs/transformers/main/model_doc/qwen3

Nota: los resultados de busqueda web proporcionados no guardan relacion con el modelo (tratan sobre fetor hepaticus) y se han descartado por no ser material relevante.
