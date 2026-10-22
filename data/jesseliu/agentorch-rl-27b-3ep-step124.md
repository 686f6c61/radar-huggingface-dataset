# JesseLiu/agentorch-rl-27b-3ep-step124

## Resumen

agentorch-rl-27b-3ep-step124 es un checkpoint de aprendizaje por refuerzo (RL) publicado por el usuario JesseLiu dentro del proyecto AgentOrch, orientado a la orquestación de flujos de trabajo con agentes. Se construye sobre Qwen/Qwen3.8-27B y se distribuye con los pesos fusionados (LoRA integrado en el modelo base), de modo que se carga como un checkpoint convencional con `transformers` o `vLLM`. El interés es acotado pero claro: documenta una receta completa de SFT + GRPO y publica resultados en un banco de pruebas propio, lo que permite reproducir y auditar el proceso.

El modelo tiene 27.781.427.952 parámetros (unos 27,78 mil millones) y un tamaño de repositorio de 55,6 GB en safetensors. No es un modelo generalista nuevo: es un ajuste especializado en orquestación de agentes, evaluado sobre el AgentOrch benchmark (Global View, 3.220 variantes, harness congelado), donde obtiene una precisión de orquestación de 0,4114 y una precisión final de 0,1826, con una tasa de error de 0,1938. Esos números deben leerse como un resultado de investigación, no como un producto listo para producción.

La relevancia ahora es metodológica: muestra el estado intermedio (paso 124 de 124) de un entrenamiento RL con recompensa simbólica de nivel 1, sobre un presupuesto de 81.920 tokens y con un ajuste fino previo de tres épocadas. Su licencia Apache 2.0 facilita el uso comercial del artefacto, aunque el rendimiento medido limita seriamente los escenarios realistas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible en detalle; heredada del modelo base Qwen/Qwen3.8-27B (transformer decoder-only, segun la practica habitual de la familia Qwen, dato no confirmado en la informacion proporcionada) |
| Parametros totales | 27.781.427.952 (aproximadamente 27,78 mil millones) |
| Parametros activos | No aplica segun la informacion disponible (no se indica que sea un modelo MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible; el repositorio solo publica safetensors, sin versiones GGUF, AWQ ni GPTQ |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (pesos fusionados, LoRA plegado en el modelo base) |

## Arquitectura y entrenamiento

La informacion disponible no detalla la arquitectura interna del modelo base Qwen/Qwen3.8-27B (revision `1d4bf0f2ff6012fd82039f2fa52739d0dd7c60c0`). Lo que si se documenta es el proceso de ajuste, en dos fases sobre ese base. La primera es un SFT con datos v1, 3 epocas, un presupuesto de 81.920 tokens, LoRA con r=16 y alpha=32, tasa de aprendizaje 1e-4 y planificador coseno. La segunda es RL con GRPO sobre verl 0.9, tambien con LoRA r=16/alpha=32, recompensa de coincidencia simbolica de nivel 1 (Tier-1 symbolic match), tasa 3e-6, perdida KL con coeficiente 0,001 (`use_kl_loss`), grupo de 8, 16 prompts por paso y 124 pasos completos sobre el conjunto `data_rl_v1`, partiendo del checkpoint `sft-27b-80k-3ep`.

El checkpoint publicado corresponde al paso 124/124 y se distribuye con los adaptadores LoRA fusionados en los pesos base, de ahi el tamano de 55,6 GB. No se documentan innovaciones de decodificacion, atencion o arquitectura propias de este ajuste; el cambio es exclusivamente de comportamiento mediante RL. Un detalle operativo relevante: el autor indica que debe usarse `enable_thinking=False` en la plantilla de chat, ya que asi se entreno y se evaluo, lo que implica que el modo de razonamiento extendido del modelo base queda desactivado por diseno en este checkpoint.

## Capacidades

- Orquestacion de flujos de trabajo con agentes: es la capacidad objetivo del ajuste, medida con el AgentOrch benchmark (precisión de orquestación 0,4114).
- Generacion de texto y razonamiento general: heredada del modelo base, aunque no se documentan evaluaciones especificas en esta ficha.
- Razonamiento multi-paso orientado a tareas de orquestacion, entrenado con GRPO y recompensa simbolica.
- Plantilla de chat compatible con el ecosistema `transformers` y `vLLM`, con soporte del flag `enable_thinking`.
- Capacidades multilingues: no disponibles (no se especifican idiomas).
- Tool calling / function calling: no confirmado explicitamente en la informacion disponible, aunque la tarea de orquestacion implica seleccion y encadenamiento de acciones.
- Vision, audio y otras modalidades: no disponible.
- Modo thinking: existe en el modelo base, pero se recomienda desactivarlo (`enable_thinking=False`) para replicar las condiciones de entrenamiento y evaluacion.

## Casos de uso

- Investigacion en RL para agentes: servir como punto de partida reproducible para experimentos con GRPO sobre tareas de orquestacion, ya que la receta completa (SFT + RL, hiperparametros y datos) esta documentada en `training/results/training.csv`.
- Reproduccion de resultados: cargar el checkpoint y ejecutar el harness del repositorio AgentOrch en la variante `rl-27b-3ep-step124-global` para verificar las cifras publicadas antes de construir sobre ellas.
- Generacion de trazas de orquestacion sinteticas: usar el modelo para producir planes de pasos que luego se filtran y revisan manualmente, aprovechando su especializacion aunque su precision final sea baja (0,1826).
- Baseline en comparativas internas: medir otros ajustes de orquestacion contra este checkpoint en el mismo banco de pruebas congelado, con la ventaja de que las condiciones son explicitas.
- Estudio de fallos y tasas de error: con una tasa de error de 0,1938, resulta util para analizar patrones de fallo en cadenas de agentes (herramientas mal seleccionadas, pasos omitidos, dependencias ignoradas).
- Ajuste adicional (fine-tuning) sobre el checkpoint fusionado: al estar en safetensors y con licencia Apache 2.0, se puede reentrenar con LoRA para dominios concretos, partiendo de un modelo ya sesgado hacia la orquestacion.
- Docencia y divulgacion tecnica: ejemplo real de pipeline SFT + GRPO con recompensa simbolica y evaluacion en harness congelado.

## Benchmarks y rendimiento

Resultados publicados por el autor en el AgentOrch benchmark (Global View, 3.220 variantes, harness congelado, ejecucion `rl-27b-3ep-step124-global`):

| Metrica | Valor |
|---|---:|
| Precision de orquestacion | 0,4114 |
| Precision final | 0,1826 |
| Tasa de error | 0,1938 |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K u otros) en la informacion disponible, ni comparaciones numericas con otros checkpoints del proyecto AgentOrch.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16/fp16: aproximadamente 55,6 GB solo para pesos, mas cache KV; en la practica requiere GPU de 80 GB (A100 80GB, H100 80GB) o configuraciones multi-GPU.
- Cuantizacion a 8 bits: en torno a 28 GB de pesos, viable en A100 40GB, L40S 48GB o RTX 6000 Ada 48GB. La cuantizacion no esta publicada, habria que generarla.
- Cuantizacion a 4 bits: aproximadamente 14-16 GB de pesos, lo que permitiria ejecucion en una RTX 4090 de 24 GB, con margen limitado para contexto y cache KV.
- GPU de consumo: una RTX 4090 (24 GB) no puede cargar el checkpoint en bf16; solo con cuantizacion agresiva a 4 bits. Una RTX 3090/4090 con 24 GB queda al limite.
- Despliegue: `transformers` y `vLLM` estan soportados explicitamente segun el autor. llama.cpp, Ollama o TGI no estan documentados para este checkpoint y requeririan conversion propia a GGUF o formatos compatibles.
- Latencia y throughput: no disponibles (no se publican mediciones).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| agentorch-rl-27b-3ep-step124 | 27,78 B | No disponible | Orquestacion 0,4114; final 0,1826 (AgentOrch) | Apache 2.0 | HuggingFace, safetensors |
| Qwen/Qwen3.8-27B (modelo base) | No disponible en la informacion proporcionada | No disponible | No disponible | No disponible en esta ficha | HuggingFace |
| Otros checkpoints del proyecto AgentOrch (p. ej. `sft-27b-80k-3ep`) | 27,78 B (previsible, no confirmado) | No disponible | No disponible | No disponible | Referenciados, sin URL en la informacion |

No se dispone de datos de benchmarks de alternativas comparables en la informacion proporcionada, por lo que no es posible establecer una comparacion cuantitativa con modelos de la misma categoria.

## Limitaciones y advertencias

- Prestaciones bajas en la tarea objetivo: precision final de 0,1826 y tasa de error de 0,1938 en el AgentOrch benchmark; no es adecuado para produccion sin una capa de validacion y verificacion posterior.
- La precision de orquestacion (0,4114) implica que mas de la mitad de las estructuras de orquestacion generadas no son correctas segun el criterio del harness.
- El modo thinking debe desactivarse (`enable_thinking=False`); usarlo fuera de las condiciones de entrenamiento invalida la comparacion con los resultados publicados y puede degradar el comportamiento.
- Sesgos: no documentados. Al derivar de un modelo base sin ficha de sesgos propia, se heredan los sesgos de este, que no se detallan en la informacion disponible.
- Riesgo de alucinacion: no cuantificado en esta ficha; la recompensa de nivel 1 es de coincidencia simbolica, lo que puede favorecer formatos correctos con contenido incorrecto.
- Idiomas: no se especifica que idiomas soporta; no hay garantia de calidad en castellano.
- Contexto: no se publica la longitud de contexto soportada, lo que impide planificar cargas con documentos largos.
- Licencia Apache 2.0: permite uso comercial, pero el modelo base puede tener condiciones adicionales que conviene revisar en su propia ficha.
- Repositorio con 0 descargas y 0 likes: no hay evidencia de uso externo ni de validacion independiente de los resultados.
- La evaluacion se realizo en un unico benchmark propietario del proyecto (Global View, harness congelado); no hay validacion cruzada en otros conjuntos.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/JesseLiu/agentorch-rl-27b-3ep-step124
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B (revision `1d4bf0f2ff6012fd82039f2fa52739d0dd7c60c0`)
- Repositorio AgentOrch (harness, datos de entrenamiento y registro de experimentos): mencionado en la model card, URL no disponible en la informacion proporcionada
- Receta de entrenamiento (`training/results/training.csv`, fila `rl-27b-3ep-step124`): referenciada en la model card, sin URL directa disponible
- No se han encontrado en la busqueda web enlaces relevantes al modelo, al proyecto AgentOrch ni a Qwen3.8-27B; los resultados obtenidos no guardan relacion con el contenido de esta ficha.
