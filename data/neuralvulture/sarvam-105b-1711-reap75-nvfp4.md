# NeuralVulture/sarvam-105b-1711-reap75-nvfp4

## Resumen
Este modelo es una derivacion podada por expertos de `sarvamai/sarvam-105b-1711`, un Mixture of Experts (MoE) de 105.000 millones de parametros con atencion MLA, 128 expertos enrutados y 8 activos por token. La poda, realizada mediante la tecnica REAP, elimina el 75% de los expertos de cada capa MoE (96 de 128), conservando 32 por capa y manteniendo los pesos cuantizados NVFP4 originales byte a byte. El resultado es un checkpoint de 18.640 millones de parametros reales en safetensors, con un repositorio de 45 GB.

El modelo esta publicado por NeuralVulture y conserva la licencia Apache 2.0 del modelo base. Su interes practico radica en reducir drasticamente el coste de inferencia y el peso en disco de un MoE de gran escala, manteniendo el router (`mlp.gate`) recortado a los IDs supervivientes y sin renormalizar manualmente el gate, ya que `norm_topk_prob` sigue activo. La calibracion para puntuar la saliencia de cada experto priorizo tool calling (~53%) e instruction following (~25%), lo que orienta el checkpoint hacia cargas de trabajo agenticas.

La relevancia actual es doble: por un lado, demuestra que el pruning estructurado de expertos en MoE con cuantizacion NVFP4 es viable sin requerir recuantizacion; por otro, ofrece una alternativa mas ligera para despliegues en hardware H200 con vLLM 0.34.0. No obstante, la evaluacion formal en BFCL y benchmarks de instrucciones sigue pendiente segun la propia model card.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE transformer con atencion MLA (multi-head latent attention), 128 expertos enrutados y 8 activos por token en el modelo base; 32 expertos por capa tras poda REAP |
| Parametros totales | 18.643.833.824 (safetensors del checkpoint podado; el modelo base declara 105B) |
| Parametros activos | 8 expertos por token sobre 32 disponibles por capa (top-k sin cambios respecto al base) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | NVFP4 (4 bits), formato `compressed-tensors`, etiquetado como 8-bit en los tags de Hugging Face |
| Idiomas soportados | en, hi, ta, te, bn, mr, kn, ml, gu, pa |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors con codigo personalizado (`custom_code`), pesos NVFP4 |

## Arquitectura y entrenamiento
El modelo base es un transformer MoE con atencion MLA y 128 expertos enrutados, de los cuales 8 se activan por token. El router emplea `noaux_tc` con sigmoid y `e_score_correction_bias` solo para seleccion, con `n_group=16`, `topk_group=2` y `norm_topk_prob` activado. La derivacion no reentrena: aplica REAP (expert pruning por saliencia) sobre el checkpoint NVFP4 original.

La puntuacion de saliencia se calcula por capa y experto como `score = Σ_tokens gate_weight × ‖expert_output‖₂`, trazada en float64 sobre 1024 muestras de calibracion (set_A, semilla 42) con el enrutamiento propio del modelo y enmascarado de padding. La mezcla de calibracion prioriza tool calling (~53%) con datos de xlam, hermes y glaive; instruction following (~25%) con ifeval_like, ultrafeedback y tulu3; indico (~5%) con aya; y datos generales. Se conservan los 32 expertos con mayor puntuacion por capa y se recorta el gate a los IDs supervivientes, sin recuantizar los pesos de los expertos que quedan.

## Capacidades
- Generacion de texto y razonamiento general en los diez idiomas declarados (ingles, hindi, tamil, telugu, bengali, marathi, kannada, malayalam, gujarati y punjabi).
- Tool calling y function calling, reforzado por la calibracion orientada a este uso (~53% de las muestras).
- Seguimiento de instrucciones con restricciones (validado en la prueba de humo con limite de dos frases y sufijo).
- Aritmetica basica (la prueba de humo con 17*23 devuelve 391).
- Capacidades multilingues centradas en lenguas indias, heredadas del modelo base.
- No se documentan capacidades de vision, audio ni modo thinking explicito en la informacion disponible.

## Casos de uso
- Agentes de tool calling en produccion: el checkpoint esta calibrado con datos de xlam, hermes y glaive, por lo que es adecuado para pipelines donde el modelo debe seleccionar funciones y construir argumentos correctamente, con un coste de inferencia muy inferior al MoE original.
- Asistentes multilingues para el mercado indio: cubre diez idiomas (hindi, tamil, telugu, bengali, marathi, kannada, malayalam, gujarati y punjabi) y puede atender consultas en lengua local sin un modelo separado por idioma.
- Automatizacion de soporte tecnico con instrucciones estrictas: la validacion de instruction following con restricciones de formato permite usarlo en respuestas con plantillas fijas o limites de longitud.
- Despliegue en infraestructura limitada: con 18.640 millones de parametros reales y cuantizacion NVFP4, reduce el peso en disco a 45 GB y facilita servir el modelo en un solo nodo con GPU H200 mediante vLLM.
- Generacion de codigo asistida por herramientas: combinando tool calling con instrucciones, puede integrarse en flujos de CI/CD para invocar linters, ejecutar tests o consultar APIs.
- Experimentacion e investigacion en pruning de MoE: el repositorio incluye `saliency_A.npz` y `prune_manifest.json`, lo que permite reproducir la traza y estudiar el impacto de la poda por capa.
- Prototipado de agentes multi-paso: al mantener el router y el top-k originales, el comportamiento de enrutamiento sigue siendo coherente y sirve para validar flujos agenticos antes de escalar al modelo completo.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la informacion disponible. La model card indica que la evaluacion en BFCL y benchmarks de tool calling e instruction following esta pendiente. Solo se documenta una validacion de humo en vLLM 0.34.0 sobre GPU H200 con decodificacion greedy:

| Prueba | Resultado |
|---|---|
| Aritmetica (17*23) | PASS (391) |
| Tool calling | PASS (funcion y argumentos correctos) |
| Instruction following (dos frases + sufijo) | PASS |

## Requisitos de hardware
- VRAM estimada para inferencia: el repositorio ocupa 45 GB en NVFP4; se requiere al menos esa cantidad mas overhead de activaciones y cache KV, por lo que un despliegue comodo parte de 80 GB.
- GPU recomendadas: H200 (validado en la prueba de humo con vLLM 0.34.0); A100 80 GB y H100 80 GB son opciones plausibles por capacidad, aunque no estan validadas en la informacion disponible.
- GPU de consumo: no cabe en RTX 4090 (24 GB) ni en GPUs consumer de 48 GB en NVFP4 sin offloading; no se documenta una variante GGUF para llama.cpp.
- Opciones de despliegue: vLLM 0.34.0 es el unico runtime validado; requiere soporte de `compressed-tensors` y NVFP4, ademas del codigo personalizado del checkpoint (`custom_code`).
- Latencia y throughput: no disponibles; no se publican mediciones de tokens por segundo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| NeuralVulture/sarvam-105b-1711-reap75-nvfp4 | 18,64B reales (MoE podado, 32 expertos/capa) | no disponible | Apache 2.0 | Hugging Face, safetensors NVFP4 | Podado con REAP, sin reentrenamiento |
| sarvamai/sarvam-105b-1711 | 105B (MoE, 128 expertos, 8 activos) | no disponible | Apache 2.0 | Hugging Face | Modelo base completo, mayor coste de inferencia |
| Alternativas MoE podadas de la misma familia | no disponible | no disponible | no disponible | no disponible | No se dispone de datos verificables |

## Limitaciones y advertencias
- La evaluacion formal en BFCL y benchmarks de instrucciones esta pendiente; no hay evidencia publicada de rendimiento mas alla de tres pruebas de humo.
- La poda elimina el 75% de los expertos por capa; puede degradar capacidades especializadas que residian en los expertos descartados, especialmente fuera del dominio de tool calling e instruction following.
- La calibracion se hizo con 1024 muestras y semilla fija (42); el sesgo hacia tool calling (~53%) puede desequilibrar el comportamiento en tareas generales.
- Riesgo de alucinacion inherente a los modelos de lenguaje; no se documentan mitigaciones especificas.
- Longitud de contexto no disponible, lo que impide planificar cargas con ventanas largas.
- El checkpoint depende de `custom_code` y de soporte NVFP4 en el runtime; fuera de vLLM 0.34.0 el despliegue no esta validado.
- Licencia Apache 2.0 permite uso comercial, pero se recomienda verificar las condiciones del modelo base y de los datos de calibracion (xlam, hermes, glaive, ultrafeedback, tulu3, aya) antes de produccion.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, sin senales de adopcion ni validacion externa.

## Enlaces
- Hugging Face: https://huggingface.co/NeuralVulture/sarvam-105b-1711-reap75-nvfp4
- Modelo base: https://huggingface.co/sarvamai/sarvam-105b-1711
