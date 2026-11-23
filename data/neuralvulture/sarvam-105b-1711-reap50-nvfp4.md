# NeuralVulture/sarvam-105b-1711-reap50-nvfp4

## Resumen

NeuralVulture/sarvam-105b-1711-reap50-nvfp4 es una variante podada y cuantizada del modelo base sarvamai/sarvam-105b-1711, un Mixture-of-Experts (MoE) de 105.000 millones de parametros con 128 expertos enrutados, 8 activos por token y atencion MLA, orientado a tareas de tool calling e instrucciones en ingles y lenguas indicas. La variante aplica la tecnica REAP (expert pruning por relevancia) para eliminar el 50 % de los expertos de cada capa MoE, conservando 64 de 128, con el objetivo de reducir el coste computacional y el tamano del checkpoint sin recuantizar los pesos supervivientes.

El modelo resultante conserva los pesos NVFP4 originales de los expertos que sobreviven (byte a byte) y solo recorta el router (`mlp.gate`) a los IDs supervivientes, manteniendo `n_group=16`, `topk_group=2`, `num_experts_per_tok=8` y `norm_topk_prob`, de modo que la renormalizacion del gate es automatica en inferencia. Segun el recuento real de safetensors, el checkpoint ocupa 31.130.146.752 parametros (unos 31,1 B), muy por debajo de los 105 B nominales del modelo base, lo que refleja el efecto combinado de la poda y la cuantizacion de 8 bits.

Es relevante ahora porque demuestra una via practica para desplegar modelos MoE grandes en hardware mas modesto: poda selectiva de expertos guiada por saliencia y cuantizacion NVFP4/FP8, con validacion funcional en vLLM 0.34.0 sobre H200. La licencia Apache 2.0 y el soporte declarado de diez idiomas (ingles, hindi, tamil, telugu, bengali, marathi, kannada, malayalam, gujarati y punyabi) lo hacen atractivo para experimentacion y despliegue comercial, aunque la evaluacion formal en benchmarks sigue pendiente segun el autor.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE con atencion MLA (multi-head latent attention); 128 expertos enrutados en el modelo base, 64 tras poda REAP; 8 expertos activos por token |
| Parametros totales | 31.130.146.752 (segun safetensors del checkpoint publicado); modelo base nominal de 105 B |
| Parametros activos | 8 expertos de 64 por token (el modelo base declara 8 de 128); numero exacto de parametros activos no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | NVFP4 (pesos de 4 bits en formato NVFP4, con traza de computo FP8); tag de 8-bit / compressed-tensors en el repo |
| Idiomas soportados | en, hi, ta, te, bn, mr, kn, ml, gu, pa |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (custom_code, compressed-tensors) |

## Arquitectura y entrenamiento

El modelo base sarvam-105b-1711 es un transformer MoE con atencion MLA y 128 expertos enrutados, de los cuales se activan 8 por token. El enrutamiento usa `noaux_tc` con sigmoid y `e_score_correction_bias` solo para seleccion, con agrupacion de expertos (`n_group=16`, `topk_group=2`) y renormalizacion (`norm_topk_prob`). La variante publicada no reentrena el modelo: aplica poda de expertos sobre el checkpoint original ya cuantizado en NVFP4.

La poda sigue el metodo REAP: para cada par (capa, experto) se calcula una puntuacion de saliencia `score = Σ_tokens gate_weight × ‖expert_output‖₂`, trazada sobre 1024 muestras de calibracion (set_A, semilla 42) con el enrutamiento propio del modelo, enmascarado de padding y precision float64. Se eliminan los 64 expertos con menor puntuacion por capa y se conservan los 64 restantes con sus pesos NVFP4 originales sin recuantizar; el router se recorta a los IDs supervivientes. La mezcla de calibracion prioriza tool calling (~53 %) e instruction following (~25 %), con indico (~5 %) y datos generales, usando fuentes como xlam, hermes y glaive (tool calling); ifeval_like, ultrafeedback y tulu3 (instrucciones); y aya (indico). El repositorio incluye la traza `saliency_A.npz` y el `prune_manifest.json` con los IDs de expertos descartados por capa.

## Capacidades

- Generacion de texto e instrucciones en ingles y diez lenguas indicas (hindi, tamil, telugu, bengali, marathi, kannada, malayalam, gujarati, punyabi).
- Tool calling / function calling: validado en la prueba de humo con seleccion correcta de funcion y argumentos.
- Razonamiento aritmetico basico: la prueba de humo confirma el calculo 17*23 = 391.
- Seguimiento de instrucciones con restricciones de formato (longitud en frases y sufijo obligatorio), validado en la prueba de humo.
- Razonamiento multi-paso y uso como agente: no disponible de forma explicita en la informacion proporcionada.
- Capacidades multimodales (vision, audio): no disponibles.
- Modo thinking explicito: no disponible.

## Casos de uso

- Atencion al cliente multilingue en India: el modelo cubre ingles y diez lenguas indicas, lo que permite atender consultas en hindi, tamil o bengali con un unico checkpoint y sin pipelines separados por idioma.
- Automatizacion de tool calling en asistentes: al conservar el router y los expertos orientados a tool calling (la calibracion dedico ~53 % a este tipo de datos), puede invocarse como motor de function calling en agentes que consultan APIs, bases de datos o servicios internos.
- Generacion de codigo asistida en pipelines de CI/CD: con soporte de tool calling y formato safetensors compatible con vLLM, puede integrarse en flujos de revision automatica o generacion de parches, aunque conviene validar la calidad en tareas de codigo antes de produccion.
- Extraccion de informacion estructurada de documentos: el seguimiento de instrucciones con restricciones de formato permite generar salidas JSON o con sufijos fijos para tareas de parsing y normalizacion.
- Despliegue en hardware de gama alta con memoria limitada: al reducir el checkpoint a ~31,1 B de parametros en 8 bits (repo de 73,1 GB), es viable en una sola GPU H200 o A100 de 80 GB, frente a los requisitos del modelo base de 105 B.
- Experimentacion academica en poda de MoE: la traza de saliencia y el manifiesto de expertos descartados permiten reproducir o variar la poda (por ejemplo, distintos ratios o mezclas de calibracion) como base para investigacion en compresion de modelos.
- Evaluacion comparativa de tecnicas de cuantizacion: al conservar los pesos NVFP4 originales sin recuantizar, sirve como referencia para medir el impacto de la poda aislado del efecto de la cuantizacion.

## Benchmarks y rendimiento

El autor indica que los resultados en BFCL (tool calling) e instruction following estan pendientes. Solo se dispone de la validacion de humo en vLLM 0.34.0 sobre H200 con decodificacion greedy:

| Prueba | Resultado |
|---|---|
| Aritmetica (17*23) | PASS (391) |
| Tool calling | PASS (funcion y argumentos correctos) |
| Seguimiento de instrucciones (2 frases + sufijo) | PASS |

No se han publicado resultados de benchmarks formales (MMLU, HumanEval, GSM8K, BFCL) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el repo ocupa 73,1 GB en safetensors con pesos NVFP4/8-bit; se necesita al menos una GPU con 80 GB para cargar el checkpoint completo en memoria, mas margen para KV cache y activaciones.
- GPU recomendadas: H200 (validado por el autor en vLLM 0.34.0), A100 80 GB, H100 80 GB. No se recomienda para GPUs de consumo (RTX 4090 de 24 GB) en configuracion completa.
- Cabe en consumer GPU: no, salvo con cuantizaciones adicionales no publicadas en este repo.
- Opciones de despliegue: vLLM 0.34.0 (validado); llama.cpp, Ollama o TGI no estan confirmados para este formato NVFP4 con custom_code.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| NeuralVulture/sarvam-105b-1711-reap50-nvfp4 | 31,1 B (checkpoint), 64 expertos de 128 | no disponible | apache-2.0 | Hugging Face | Poda REAP + NVFP4, tool calling validado en humo |
| sarvamai/sarvam-105b-1711 (base) | 105 B nominales, 128 expertos | no disponible | no disponible en la informacion | Hugging Face | Modelo original, sin poda |
| Otros MoE podados de tamano similar | no disponible | no disponible | no disponible | no disponible | No se dispone de comparables directos en la informacion proporcionada |

## Limitaciones y advertencias

- La evaluacion formal en benchmarks (BFCL, instruction following) esta pendiente; la validacion existente es solo una prueba de humo con tres casos.
- La poda del 50 % de expertos puede degradar capacidades especializadas que dependian de los expertos eliminados; no hay datos cuantitativos del impacto.
- La calibracion prioriza tool calling e instrucciones, por lo que el rendimiento en otras tareas (codigo, matematicas avanzadas, indico profundo) puede ser inferior al del modelo base.
- Riesgo de alucinacion inherente a los modelos de lenguaje; no se han publicado evaluaciones de fidelidad.
- La longitud de contexto no esta documentada, lo que limita la planificacion de despliegues con ventanas largas.
- El formato NVFP4 con custom_code puede requerir versiones especificas de vLLM u otras herramientas; la compatibilidad con llama.cpp, Ollama o TGI no esta confirmada.
- Uso comercial permitido por Apache 2.0, pero conviene revisar las condiciones del modelo base sarvamai/sarvam-105b-1711, cuya licencia no se detalla en la informacion disponible.
- El repositorio tiene 0 descargas y 0 likes, por lo que no hay evidencia de uso en produccion ni validacion independiente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/NeuralVulture/sarvam-105b-1711-reap50-nvfp4
- Modelo base: https://huggingface.co/sarvamai/sarvam-105b-1711
- Paper de REAP: no disponible en la informacion proporcionada
- Blog o demo: no disponible en la informacion proporcionada
