# minkyoungs/NVIDIA-Nemotron-3.5-Super-VL-120B-A12B-NVFP4-IA-REAP-20-PIE

## Resumen

NVIDIA-Nemotron-3.5-Super-VL-120B-A12B-NVFP4-IA-REAP-20-PIE es una variante podada del modelo multimodal NVIDIA Nemotron 3.5 Super VL, publicado por el usuario minkyoungs en Hugging Face. Se trata de un transformer de tipo mixture-of-experts (MoE) con arquitectura declarada `nemotron_h_omni`, 120 000 millones de parametros totales y 12 000 millones de parametros activos por token, cuantizado en NVFP4 (formato de 4 bits de NVIDIA) y del que se han eliminado el 20 % de los expertos enrutados mediante una tecnica propia denominada IA-REAP (instruction-aware REAP). El resultado es un checkpoint de 58 GiB frente a los 70 GiB del original, sin reentrenamiento.

La relevancia de esta ficha radica en que ilustra una practica creciente: la poda selectiva de expertos en modelos MoE de gran tamano para reducir huella de memoria y coste de despliegue manteniendo, en teoria, la mayor parte de la capacidad. El autor aplica una variante de REAP que prioriza los expertos cuya cuota de enrutamiento aumenta cuando se antepone un system prompt que fuerza al modelo a responder en el idioma del usuario, de modo que la poda penaliza menos las capacidades de seguimiento de idioma (coreano e ingles en la calibracion).

No obstante, se trata de un artefacto experimental: cero descargas, cero likes, evaluacion de rendimiento aun en curso segun la model card, y requiere un parche manual sobre vLLM 0.31.0 para funcionar. No es un modelo listo para produccion sin validacion propia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE multimodal (`nemotron_h_omni`), pesos NVFP4 |
| Parametros totales | 120B (nominal del modelo base) |
| Parametros activos | 12B (nominal del modelo base, A12B) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | NVFP4 (4 bits, formato NVIDIA); checkpoint podado de 58 GiB |
| Idiomas soportados | no disponible (calibracion de poda en coreano e ingles) |
| Licencia | OpenMDW-1.1 |
| Formato de pesos | safetensors (con `custom_code`, requiere `--trust-remote-code`) |

## Arquitectura y entrenamiento

El modelo base es un transformer MoE con 120B parametros totales y 12B activos, en variante multimodal (VL) y cuantizado en NVFP4. La intervencion de minkyoungs no reentrena: parte del checkpoint NVFP4 original y elimina el 20 % de los expertos enrutados, pasando de 20 480 a 16 384 expertos enrutados totales. La distribucion es no uniforme: las capas MoE se agrupan en 4 clusters segun la puntuacion media de sus expertos, cada cluster elimina la misma proporcion, y dentro de cada cluster se eliminan expertos de 8 en 8 empezando por la capa cuyos 8 expertos de menor puntuacion suman menos. Cada capa conserva al menos la media del cluster menos 16 y al menos el top-k del router. Las capas 1, 3, 85 y 87 mantienen los 512 expertos; el resto oscila entre 384 y 416. Los pesos del router correspondientes a los expertos eliminados se eliminan tambien.

La innovacion tecnica es el sesgo instruction-aware del scoring: los expertos se puntuan con REAP sobre datos de calibracion en coreano e ingles (se conserva la mayor de las dos puntuaciones normalizadas) y despues la puntuacion se ajusta por cuanto sube la cuota de enrutamiento del experto al anteponer un system prompt del tipo "responde en el mismo idioma que el usuario". El numero de expertos eliminados por capa, en cambio, se fija con las puntuaciones sin ajustar. No se documenta en la informacion disponible el volumen de tokens de entrenamiento, la composicion del dataset original ni si hubo RLHF o DPO.

## Capacidades

- Generacion de texto y razonamiento: heredadas del modelo base Nemotron 3.5 Super VL; no hay evaluacion publicada de la variante podada.
- Capacidades de vision: el modelo base es multimodal (VL); se asume que la poda afecta solo a expertos enrutados del backbone MoE, pero no se detalla en la informacion disponible el impacto sobre el encoder visual.
- Seguimiento de instrucciones de idioma: la poda esta disenada explicitamente para preservar los expertos que responden al system prompt de idioma del usuario (calibrado en coreano e ingles).
- Tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponibles; la calibracion cubre coreano e ingles.
- Modo thinking u otras capacidades especiales: no disponible en la informacion proporcionada.

## Casos de uso

- Despliegue de un MoE de 120B en infraestructura mas ajustada: el checkpoint de 58 GiB frente a 70 GiB permite servirlo con menos memoria agregada en configuraciones tensor-parallel de 2 GPUs, siempre que se aplique el parche de vLLM y se valide la calidad.
- Servicio de inferencia multimodal en vLLM: el autor documenta `vllm serve ... --trust-remote-code --tensor-parallel-size 2`, por lo que encaja en pipelines existentes de vLLM 0.31.0 con el parche aplicado.
- Asistentes conversacionales con requisito de respuesta en el idioma del usuario: la poda IA-REAP conserva preferentemente expertos sensibles al system prompt de idioma, lo que lo hace candidato para productos con usuarios coreano-parlantes o angloparlantes.
- Investigacion sobre poda de expertos: sirve como caso de estudio reproducible de REAP con sesgo instruction-aware y distribucion no uniforme de expertos por capa, comparando contra el checkpoint NVFP4 original.
- Baseline para experimentos de compresion: util para medir la degradacion de un MoE multimodal al recortar el 20 % de expertos, con la salvedad de que el autor aun no ha publicado resultados.
- Prototipado interno con requisitos de memoria estrictos: al reducir el checkpoint un 17 % en tamano, permite probar el modelo base en nodos con VRAM limitada antes de decidir si se adopta la version completa.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explicitamente que la evaluacion esta en curso y que los resultados se anadiran mas adelante.

## Requisitos de hardware

- VRAM estimada: el checkpoint pesa 58 GiB en NVFP4; el autor propone servir con `--tensor-parallel-size 2`, lo que implica al menos 2 GPUs con memoria agregada superior a 58 GiB mas overhead de KV cache y activaciones. Cifra exacta de VRAM por GPU: no disponible.
- GPUs recomendadas: no disponible en la informacion proporcionada; el formato NVFP4 y la cuantizacion del modelo base sugieren GPUs NVIDIA con soporte de FP4 (familia Blackwell), aunque no se confirma.
- Compatibilidad con GPU de consumo: no disponible; 58 GiB en NVFP4 no cabe en una unica GPU de consumo actual.
- Opciones de despliegue: vLLM 0.31.0 con parche obligatorio (`patch/apply_patch.py`) para permitir distinto numero de expertos por capa MoE; llama.cpp, Ollama y TGI no estan soportados segun la informacion disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Estado |
|---|---|---|---|---|---|
| minkyoungs/NVIDIA-Nemotron-3.5-Super-VL-120B-A12B-NVFP4-IA-REAP-20-PIE | 120B totales / 12B activos (tras poda) | no disponible | NVFP4 | OpenMDW-1.1 | Experimental, 0 descargas, requiere parche |
| nvidia/NVIDIA-Nemotron-3.5-Super-VL-120B-A12B-NVFP4 | 120B totales / 12B activos | no disponible | NVFP4 | OpenMDW-1.1 | Modelo base oficial de NVIDIA |
| Alternativas de otro tamano o tarea | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Modelo experimental sin evaluacion publicada: el autor no ha publicado benchmarks comparativos frente al checkpoint original, por lo que se desconoce la degradacion real de calidad tras eliminar el 20 % de expertos.
- Requiere parche manual de vLLM 0.31.0: sin el parche, las capas MoE con distinto numero de expertos no cargan; el parche modifica ficheros de vLLM y debe aplicarse con backup y validacion.
- Cero adopcion verificable: 0 descargas y 0 likes en el momento de la consulta; no hay evidencia de uso en produccion.
- Idiomas: la calibracion de la poda se limita a coreano e ingles; el comportamiento en castellano u otros idiomas no esta documentado y podria degradarse mas que en los idiomas calibrados.
- Sesgos y seguridad: no documentados para esta variante; la model card remite a las notas del modelo base de NVIDIA.
- Riesgo de alucinacion: no cuantificado para esta variante; se hereda el del modelo base, sin datos publicados.
- Licencia: OpenMDW-1.1, la misma del modelo base; deben revisarse sus terminos para uso comercial antes de adoptarlo.
- Formato NVFP4: limita el despliegue a hardware y software con soporte de FP4; no hay versiones GGUF ni alternativas de cuantizacion publicadas.
- Contexto maximo: no disponible, lo que impide planificar cargas de trabajo con ventanas largas.

## Enlaces

- Hugging Face: https://huggingface.co/minkyoungs/NVIDIA-Nemotron-3.5-Super-VL-120B-A12B-NVFP4-IA-REAP-20-PIE
- Modelo base: https://huggingface.co/nvidia/NVIDIA-Nemotron-3.5-Super-VL-120B-A12B-NVFP4
- Licencia OpenMDW-1.1: https://openmdw.ai/license/1-1/
