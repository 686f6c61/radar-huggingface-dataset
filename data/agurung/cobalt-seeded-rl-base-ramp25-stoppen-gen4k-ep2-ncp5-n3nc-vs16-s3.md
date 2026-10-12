# agurung/cobalt-seeded-rl-base-ramp25-stoppen-gen4k-ep2-ncp5-n3nc-vs16-s3

## Resumen

Este repositorio contiene un checkpoint de aprendizaje por refuerzo (RL) construido sobre `Qwen/Qwen3-4B-Instruct-2507`, un transformer decoder-only de aproximadamente 3.973.556.832 parametros (unos 3,97 mil millones). Lo publica el usuario `agurung` como parte de una campana experimental de RL aplicada directamente sobre el modelo base, sin fase previa de SFT (supervised fine-tuning). El checkpoint corresponde al paso global 4 de la ejecucion `seeded_rl_base_ramp25_stoppen_gen4k_ep2_ncp5_n3nc_vs16_s3` y esta marcado por el autor como el mejor del run segun la metrica pass@8.

El problema que aborda es acotado pero claro: mejorar la capacidad de generar codigo correcto en un conjunto de problemas dificiles denominado "frontier cobalt-train <=2/64", compuesto por 1.833 problemas de entrenamiento y 112 de validacion que el modelo base resolvia como maximo en 2 de 64 muestras. La senal de recompensa es binaria y puramente funcional (el programa pasa o no pasa los tests del problema), sin modelo de recompensa ni anotaciones humanas.

Su relevancia es fundamentalmente de investigacion: es un artefacto reproducible de un pipeline OpenRLHF con GRPO, util para estudiar dinamicas de RL sobre modelos pequenos, penalizaciones anti-truncamiento y seleccion de checkpoints. No es un modelo listo para produccion ni viene acompanado de benchmarks publicados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Qwen3). La etiqueta del repo incluye `nemotron_h`, lo que apunta a una posible inconsistencia del etiquetado automatico de `transformers` |
| Parametros totales | 3.973.556.832 (aprox. 3,97 B) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no declarada en la ficha del checkpoint; el modelo base `Qwen/Qwen3-4B-Instruct-2507` declara 262.144 tokens de contexto nativo |
| Tipos de cuantizacion | no disponible; el repo sirve pesos en `safetensors` sin cuantizaciones publicadas (sin GGUF, AWQ ni GPTQ) |
| Idiomas soportados | no disponible (hereda los del modelo base, no declarados en esta ficha) |
| Licencia | no disponible en el checkpoint; el modelo base `Qwen/Qwen3-4B-Instruct-2507` se publica bajo Apache-2.0 |
| Formato de pesos | safetensors (libreria `transformers`) |
| Tamano del repositorio | 15,9 GB |
| Modelo base | `Qwen/Qwen3-4B-Instruct-2507` |
| Pipeline | text-generation |
| Revision principal | `main` (modelo en la raiz del repo) |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Qwen3-4B-Instruct-2507: un transformer decoder-only con atencion causal, normalizacion RMSNorm y atencion con query-key normalization, sin mezcla de expertos. El checkpoint no modifica la topologia del modelo base; solo actualiza los pesos mediante RL. El entrenamiento se realizo con OpenRLHF aplicando GRPO (Group Relative Policy Optimization) con ventajas normalizadas por grupo y sin penalizacion KL, lo que implica que no se ancla explicitamente a la distribucion del modelo de partida.

El recipe incluye varios mecanismos de control de longitud y truncamiento: una penalizacion "stop-properly" que asigna recompensa -1.0 a las muestras truncadas (estilo ProRL), y una penalizacion DAPO "overlong" que aplica un termino aditivo que rampa hasta -0.25 en los ultimos 1.024 tokens antes del limite de generacion. Los hiperparametros declarados son 8 muestras por prompt, batch de rollout y de entrenamiento de 128, maximo de 4.096 tokens nuevos por rollout, 2 episodios, learning rate constante de 1e-6 para el actor y paso global 4. Los datos son los de la frontera `cobalt-train <=2/64`: problemas de generacion de codigo que el modelo base resolvia en como maximo 2 de 64 intentos segun el escaneo de dureza `iid_canonical@64`. La recompensa es binaria de correccion de codigo (1.0 si el programa pasa los tests, 0.0 en caso contrario) y la evaluacion de validacion se hizo con temperatura 1.0.

## Capacidades

- Generacion de codigo en el dominio especifico de los problemas de la frontera `cobalt-train`: es la capacidad sobre la que se optimizo explicitamente.
- Razonamiento paso a paso orientado a resolver problemas de programacion con verificacion por tests.
- Generacion de texto general heredada de Qwen3-4B-Instruct-2507 (el RL no elimina las capacidades previas, aunque puede degradarlas parcialmente).
- Capacidad de ajuste a prompts de instrucciones al estilo del modelo base.
- Soporte de tool calling / function calling: no declarado en la ficha de este checkpoint (depende del modelo base, no verificado aqui).
- Soporte de agentes y razonamiento multi-paso: no declarado.
- Modo "thinking" explicito: no declarado.
- Vision o audio: no disponibles (modelo puramente de texto).
- Capacidades multilingues: no declaradas en esta ficha.
- Seleccion explicita por `pass@8`: el autor identifica este checkpoint como el mejor del run bajo esa metrica.

## Casos de uso

- Investigacion en RL para codigo: reproducir o comparar el efecto de GRPO sin KL, penalizacion anti-truncamiento y penalizacion DAPO sobre un modelo de 4 B; el checkpoint permite arrancar desde el paso 4 y continuar el run.
- Estudio de "capacidad frontier": analizar como se comporta un modelo pequeno en problemas que resolvia en <=2 de 64 intentos, midiendo cuanto sube la tasa de exito tras RL.
- Generacion de codigo asistida en entornos de investigacion: usar el modelo como generador candidato en un bucle de muestreo y test automatizado (pass@k), descartando las salidas que no pasan tests.
- Aprendizaje por refuerzo con recompensa verificable: servir como punto de partida para experimentos de RLVR en dominios donde exista un verificador automatico (tests unitarios, compilacion, lint).
- Sintesis de soluciones para problemas de programacion competitiva: util como linea base en pipelines de evaluacion de modelos sobre conjuntos tipo Codeforces o LiveCodeBench, siempre con verificacion posterior.
- Destilacion o generacion de datos sinteticos: emplear las salidas que pasan tests como datos de entrenamiento para modelos mayores o para repetir SFT.
- Evaluacion comparativa de recipes de RL: el nombre del checkpoint codifica los hiperparametros (ramp25, stoppen, gen4k, ep2, ncp5, n3nc, vs16, s3), lo que facilita el analisis de ablaciones sistematicas.
- Inferencia local en hardware de consumo para prototipado: al tener ~4 B de parametros, se puede servir en una sola GPU de gama alta o incluso en CPU con cuantizacion, si se convierte a GGUF.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

La unica metrica declarada es que este checkpoint es el "mejor por pass@8" del run `seeded_rl_base_ramp25_stoppen_gen4k_ep2_ncp5_n3nc_vs16_s3`. La propia model card indica explicitamente que las metricas de evaluacion en este checkpoint no estan disponibles en el log de entrenamiento, y remite a Weights & Biases (proyecto `eaiexp-paper-final`) para obtenerlas. No hay cifras de MMLU, HumanEval, GSM8K ni de pass@k absolutos.

## Requisitos de hardware

- Peso de los pesos en BF16: aproximadamente 7,9 GB (3.973.556.832 parametros x 2 bytes). El repositorio ocupa 15,9 GB, lo que sugiere que incluye artefactos adicionales ademas de los pesos (por ejemplo, estados de optimizador u otras revisiones).
- VRAM estimada para inferencia en BF16/FP16: unos 9-12 GB con contexto corto, mas el cache KV, que crece linealmente con la longitud de contexto y con el batch.
- VRAM estimada con cuantizacion INT8/FP8: del orden de 5-6 GB.
- VRAM estimada con cuantizacion de 4 bits (si se convierte a GGUF): del orden de 2,5-3,5 GB. El autor no publica archivos GGUF.
- GPU recomendadas: A100 40/80 GB, H100, L40S o RTX 4090 (24 GB) para BF16 sin problemas y con contexto amplio.
- Cabe en GPU de consumo: si, en RTX 4090/3090 (24 GB) en BF16 holgado; en RTX 4080/4070 Ti (16 GB) en BF16 con contexto moderado; en GPUs de 12 GB (RTX 3060, 4070) es recomendable cuantizar a 8 o 4 bits.
- Opciones de despliegue: `transformers` (carga directa indicada por el autor con `revision="main"`) y vLLM (`vllm serve agurung/cobalt-seeded-rl-base-ramp25-stoppen-gen4k-ep2-ncp5-n3nc-vs16-s3 --revision main`). Para TGI, llama.cpp u Ollama habria que verificar compatibilidad o convertir los pesos, ya que no se publican en formato GGUF.
- Latencia y throughput: no disponibles en la informacion proporcionada.
- El tag `endpoints_compatible` sugiere compatibilidad con despliegues gestionados de tipo Inference Endpoints.

## Comparativa con modelos similares

Las cifras de parametros de las alternativas provienen del conocimiento publico general de sus repositorios originales y no han sido verificadas en la informacion proporcionada para esta ficha; los datos de rendimiento no estan disponibles en ningun caso.

| Modelo | Parametros | Contexto | Foco | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este checkpoint (`cobalt-seeded-rl-...`) | 3,97 B | no disponible (base: 262.144) | Codigo, via RL con GRPO | no disponible | safetensors, `transformers`/vLLM |
| `Qwen/Qwen3-4B-Instruct-2507` (base) | 3,97 B | 262.144 | Instrucciones generales y codigo | Apache-2.0 | safetensors, ampliamente soportado |
| Qwen2.5-Coder-7B | no disponible aqui (entorno a 7 B) | no disponible aqui | Codigo | no disponible aqui | safetensors, GGUF de terceros |
| Gemma 3 4B IT | no disponible aqui | no disponible aqui | Instrucciones multimodales | no disponible aqui | safetensors |
| Llama 3.2 3B Instruct | no disponible aqui | no disponible aqui | Instrucciones generales | no disponible aqui | safetensors, GGUF |

La diferencia principal frente a los anteriores no es de tamano ni de contexto, sino de proposito: este checkpoint es un artefacto de investigacion de un run de RL concreto, con pesos ajustados unicamente para problemas de codigo de alta dificultad y sin garantias de comportamiento generalista. Frente a su propio modelo base, la comparacion relevante seria el pass@8 antes y despues del RL, dato que el autor no publica en la model card.

## Limitaciones y advertencias

- No hay benchmarks publicados: no se puede afirmar que mejore al modelo base en tareas generales, y el RL sobre un dominio estrecho puede degradar capacidades fuera de ese dominio.
- Sesgos conocidos: no documentados en la ficha; al heredar el modelo base, es previsible que arrastre sus sesgos, pero no hay evaluacion especifica.
- Riesgo de alucinacion: elevado en generacion de codigo, ya que el modelo puede producir APIs, firmas o funciones inexistentes. La recompensa de entrenamiento penaliza solo la incorreccion funcional, no la invencion de detalles en explicaciones.
- Sobreoptimizacion al dominio: el entrenamiento se centro en 1.833 problemas de la frontera `<=2/64`. Es esperable un ajuste fino excesivo a esos formatos de problema.
- Restricciones de licencia: la ficha no declara licencia. Aunque el modelo base es Apache-2.0, la ausencia de licencia explicita en el checkpoint genera incertidumbre para uso comercial; conviene consultar al autor antes de desplegarlo en produccion.
- Idioma: no se declaran idiomas soportados; el comportamiento fuera del ingles (idioma tipico de los datasets de codigo) no esta verificado.
- Artefacto de investigacion: es el paso global 4 de un run, seleccionado por pass@8. No hay evidencia de estabilidad, ni evaluaciones de seguridad, ni proceso de alineacion posterior al RL.
- Sin datos de contexto verificado para el checkpoint: aunque el modelo base soporta ventanas muy largas, no hay confirmacion de que el RL preserve ese comportamiento.
- Repositorio de 15,9 GB con 0 descargas y 0 likes: practicamente sin validacion por parte de la comunidad.
- El etiquetado del repo incluye `nemotron_h`, lo que puede provocar que algunas herramientas de `transformers` carguen una clase de modelo incorrecta; conviene verificar la `config.json` real antes de desplegar.

## Enlaces

- Repositorio de HuggingFace: https://huggingface.co/agurung/cobalt-seeded-rl-base-ramp25-stoppen-gen4k-ep2-ncp5-n3nc-vs16-s3
- Modelo base: https://huggingface.co/Qwen/Qwen3-4B-Instruct-2507
- Weights & Biases (mencionado en la model card, proyecto `eaiexp-paper-final`, run `seeded_rl_base_ramp25_stoppen_gen4k_ep2_ncp5_n3nc_vs16_s3`): no disponible como URL directa en la informacion proporcionada
- Log local de entrenamiento (ruta dentro del entorno del autor, no publica): `experiments/cobalt_qwen3_4b_ft/rl_runs/qwen3_4b_instruct_2507_cobalt_v1/seeded_rl_base_ramp25_stoppen_gen4k_ep2_ncp5_n3nc_vs16_s3/openrlhf_train.log`
- OpenRLHF (framework de entrenamiento citado): no disponible como URL en la informacion proporcionada
- Paper de GRPO, DAPO y ProRL (referenciados implicitamente en el recipe): no disponibles como URLs en la informacion proporcionada
