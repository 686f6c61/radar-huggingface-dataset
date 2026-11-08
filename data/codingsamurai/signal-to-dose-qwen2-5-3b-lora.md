# CodingSamurai/signal-to-dose-qwen2.5-3b-lora

## Resumen

Signal-to-Dose es un conjunto de adaptadores LoRA entrenados sobre `mlx-community/Qwen2.5-3B-Instruct-4bit`, una version cuantizada a 4 bits del modelo instructivo Qwen2.5-3B de Alibaba, adaptada para ejecucion en Apple Silicon mediante la libreria MLX. El modelo resuelve una tarea muy concreta de inteligencia farmaceutica: dado un item de informacion sobre farmacos (resultado de ensayo clinico, aviso de seguridad de la FDA o noticia competitiva), clasifica el tipo de senal, determina si es accionable y extrae los fragmentos textuales exactos que sustentan la inteligencia en hasta cinco aspectos (eficacia, seguridad, conveniencia, acceso-coste y calidad de la evidencia).

El modelo fue desarrollado por el usuario CodingSamurai en el contexto del hackathon HACK1984, pista Track 4 "Signal-to-Dose", y esta pensado para alimentar los escenarios de demostracion `pharma_research` y `pharma_injection` del proyecto LeakGate, donde las predicciones se usan para detectar y bloquear la fuga de informacion sensible mediante huellas HMAC de los fragmentos extraidos.

Se trata de un artefacto de nicho: un adaptador LoRA de rango 8 con solo 8 capas ajustadas, 300 iteraciones de entrenamiento y una ventana de 2048 tokens. No es un modelo de proposito general, sino un componente especializado de un pipeline de clasificacion y extraccion estructurada en el dominio farmaceutico, distribuido con licencia qwen-research y entrenado exclusivamente en ingles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2.5-3B) con adaptadores LoRA sobre modelo base cuantizado a 4 bits en formato MLX |
| Parametros totales | 3B (modelo base); el adaptador LoRA anade un numero no disponible de parametros entrenables (rango 8, 8 capas) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 2048 tokens (longitud maxima de secuencia usada en entrenamiento); contexto nativo del base Qwen2.5-3B no especificado en la informacion disponible |
| Tipos de cuantizacion | 4 bits (modelo base `Qwen2.5-3B-Instruct-4bit` en MLX); el adaptador se distribuye en el formato de MLX |
| Idiomas soportados | Ingles (`en`) |
| Licencia | qwen-research (etiquetada como `other` en Hugging Face) |
| Formato de pesos | Adaptadores LoRA para MLX (`mlx-lm`); el modelo base esta en formato MLX cuantizado a 4 bits |

## Arquitectura y entrenamiento

El modelo es un ajuste fino mediante LoRA sobre `mlx-community/Qwen2.5-3B-Instruct-4bit`, que a su vez es una cuantizacion a 4 bits del transformer decoder-only Qwen2.5-3B-Instruct de Alibaba, optimizada para ejecucion en Apple Silicon con la libreria MLX. Los adaptadores tienen rango 8, escala 20.0 y se aplican sobre 8 capas del modelo base. El entrenamiento se realizo con `mlx-lm` durante 300 iteraciones, con learning rate 2e-4, batch size 2 y longitud maxima de secuencia de 2048 tokens.

No se especifica en la informacion disponible el volumen ni la composicion del dataset de entrenamiento, ni si se emplearon tecnicas de RLHF o DPO (el modelo base Qwen2.5-Instruct ya incorpora alineamiento, pero el detalle del ajuste LoRA no se documenta). La tarea se formula como generacion de texto estructurado en JSON: el modelo recibe un item de inteligencia farmaceutica y debe producir un objeto con `item_id`, `signal_type` (una de nueve categorias: `efficacy`, `safety`, `regulatory`, `trial_update`, `competitor_move`, `access_pricing`, `guideline`, `expert_opinion`, `none`), `actionable` (`yes`/`no`) y hasta cinco campos de aspecto con polaridad, hablante y span textual exacto. El prompt de inferencia requiere replicar el system prompt y los ejemplos few-shot del envio original (ficheros `predict.py` / `src/prompts.py`), lo que condiciona fuertemente el comportamiento del adaptador.

## Capacidades

- Clasificacion de senales de inteligencia farmaceutica en nueve categorias predefinidas.
- Determinacion de accionabilidad (`yes`/`no`) de cada item.
- Extraccion de spans textuales exactos (verbatim) para cinco aspectos: eficacia, seguridad, conveniencia, acceso-coste y calidad de la evidencia.
- Asignacion de polaridad y hablante (por ejemplo, `regulator`) a cada span extraido.
- Generacion de salida estructurada en JSON con campos anidados.
- Ejecucion en Apple Silicon mediante MLX con modelo base cuantizado a 4 bits.
- Capacidades generales heredadas de Qwen2.5-3B-Instruct (generacion de texto, comprension lectora en ingles), aunque el ajuste LoRA esta orientado a la tarea especifica.
- No se documenta soporte de tool calling, function calling, agentes multi-paso, vision, audio ni modo thinking en la informacion disponible.

## Casos de uso

- Clasificacion automatizada de avisos regulatorios: el modelo procesa comunicados de la FDA y los etiqueta como `safety` o `regulatory`, marcando si requieren accion, lo que permite enrutar alertas a los equipos correspondientes sin revision manual inicial.
- Monitorizacion de ensayos clinicos: ante un readout de fase 2 o 3, extrae el span exacto de eficacia y su polaridad, alimentando paneles de seguimiento competitivo con citas textuales verificables.
- Vigilancia competitiva: clasifica noticias sobre movimientos de competidores (`competitor_move`) y precios o acceso (`access_pricing`), facilitando la agregacion diaria de inteligencia de mercado.
- Deteccion de fuga de informacion en agentes: integrado en LeakGate, los spans accionables se registran como HMAC en un vault y cualquier peticion saliente de un agente que contenga esas frases exactas se bloquea o reescribe, previniendo exfiltracion de datos farmaceuticos sensibles.
- Extraccion de evidencia para revision medica: los spans verbatim con hablante y polaridad permiten a revisores verificar rapidamente la fuente de cada afirmacion en documentos largos de inteligencia.
- Prototipado local en portatiles Apple: al ejecutarse con MLX sobre un modelo de 3B en 4 bits, permite iterar en demos y validaciones sin GPU dedicada ni conexion a servicios en la nube.
- Generacion de datasets etiquetados: las predicciones precomputadas sobre 240 items del test set pueden usarse como punto de partida para anotacion y evaluacion de pipelines posteriores.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: al ser un modelo de 3B en 4 bits, la huella de pesos ronda los 1,5-2 GB; con overhead de ejecucion y cache KV para 2048 tokens, se estima un uso de memoria unificada de aproximadamente 3-4 GB (estimacion, no dato publicado).
- GPU recomendadas: Apple Silicon (M1, M2, M3, M4 y variantes Pro/Max/Ultra) es el objetivo nativo por el uso de MLX; no se documenta soporte para GPU NVIDIA en esta distribucion.
- Cabe en GPU consumer: si, en equipos Apple Silicon con al menos 8 GB de memoria unificada; en el ecosistema NVIDIA requeriria conversion a otro formato (no incluida en el repo).
- Opciones de despliegue: `mlx-lm` (libreria oficial indicada en la model card) con `adapter_path` apuntando al repositorio; no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI en esta distribucion.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Signal-to-Dose (este modelo) | 3B (base) + LoRA rango 8 | 2048 tokens (entrenamiento) | Clasificacion y extraccion de senales farmaceuticas | qwen-research | Hugging Face, formato MLX |
| Qwen2.5-3B-Instruct (base) | 3B | no disponible en la informacion | Generacion de texto general e instrucciones | qwen-research | Hugging Face |
| Qwen2.5-Coder-32B-Instruct | 33B | no disponible en la informacion | Generacion de codigo | no disponible en la informacion | Hugging Face |

La comparativa con alternativas especializadas en inteligencia farmaceutica no esta disponible: no se han identificado en la informacion proporcionada modelos publicos equivalentes para la tarea Signal-to-Dose. Frente a su modelo base, la diferencia principal es la especializacion en salida JSON estructurada y extraccion de spans verbatim, a costa de perder generalidad y de requerir el prompt exacto del envio original.

## Limitaciones y advertencias

- Entrenado exclusivamente en ingles; el rendimiento en castellano u otros idiomas no esta garantizado ni documentado.
- Ventana de contexto limitada a 2048 tokens en entrenamiento; documentos mas largos requieren truncado o segmentacion previa.
- El adaptador depende criticamente del system prompt y los ejemplos few-shot originales (`predict.py` / `src/prompts.py`); usarlo con otros prompts puede degradar gravemente la calidad de la salida.
- Riesgo de alucinacion en los spans verbatim: el modelo podria generar fragmentos que no aparezcan literalmente en el documento fuente, lo que en un contexto regulatorio o de compliance es especialmente peligroso y exige verificacion contra el texto original.
- Artefacto de hackathon con 300 iteraciones de entrenamiento, batch size 2 y sin benchmarks publicados; no hay evidencia de robustez en produccion.
- Licencia qwen-research: restricciones para uso comercial segun los terminos de Qwen; revisar el enlace de licencia antes de cualquier despliegue productivo.
- Solo se distribuye en formato MLX para Apple Silicon; no hay pesos GGUF, safetensors ni adaptadores para otros frameworks en el repositorio.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta, sin validacion de la comunidad.
- Posibles sesgos heredados del corpus de entrenamiento de Qwen2.5 y del dataset especifico del hackathon, no documentados.

## Enlaces

- Hugging Face: https://huggingface.co/CodingSamurai/signal-to-dose-qwen2.5-3b-lora
- Modelo base: https://huggingface.co/mlx-community/Qwen2.5-3B-Instruct-4bit
- Licencia Qwen2.5-3B-Instruct: https://huggingface.co/Qwen/Qwen2.5-3B-Instruct/blob/main/LICENSE
- Predicciones precomputadas (LeakGate): https://github.com/Harshith-03/LeakGate/blob/main/agent/data/drug_intel_predictions.jsonl
- Repositorio LeakGate: https://github.com/Harshith-03/LeakGate
- Qwen2.5-3B en Hugging Face: https://huggingface.co/Qwen/Qwen2.5-3B
- Qwen2.5-Coder-32B-Instruct en Hugging Face: https://huggingface.co/Qwen/Qwen2.5-Coder-32B-Instruct
