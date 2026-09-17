# mj0530/CERA-MoA-Qwen3-4B-4agents

## Resumen
CERA-MoA (Qwen3-4B, 4 agents) es un checkpoint de adaptadores publicado por el usuario mj0530 en Hugging Face. No es un modelo completo, sino un conjunto de cuatro adaptadores LoRA (PEFT) entrenados sobre el backbone denso Qwen/Qwen3-4B, más un fichero `router.pt` que contiene las cabezas de enrutado (predictor de familiaridad). El repositorio ocupa 0,7 GB y no incluye los pesos del modelo base, que deben descargarse por separado.

El modelo implementa la propuesta CERA-MoA (Co-Evolving Routing Mechanisms with Continually Learning LLM Agents), asociada al paper arXiv:2609.18779 y al repositorio github.com/michaeljiang0530/CERA-MoA. La idea central es un esquema de tipo mixture-of-agents: varios agentes especializados comparten backbone y un router decide cuál se activa en cada consulta, con un mecanismo de aprendizaje continuo que co-evoluciona agentes y enrutador.

Es relevante ahora porque ejemplifica una línea de trabajo activa: en lugar de escalar parámetros, especializar un modelo pequeño (4B) mediante múltiples adaptadores y enrutado aprendido, con entrenamiento por refuerzo. El checkpoint corresponde al snapshot final del run principal de 4 agentes del paper, en el paso de entrenamiento 6000, con la configuración `midemb=True` y "marginal push-away". Se trata de material de investigación: el repositorio registra 0 descargas y 0 likes en el momento de redactar esta ficha.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso (Qwen3-4B) con 4 adaptadores LoRA enrutados por un router aprendido (mixture-of-agents) |
| Parametros totales | Aproximadamente 4 000 millones en el backbone, no incluido en el repositorio; los adaptadores y el router suman 0,7 GB. Numero exacto de parametros de los adaptadores: no disponible |
| Parametros activos | No aplica: no es un MoE disperso con expertos densos, sino 4 agentes LoRA sobre un unico backbone, seleccionados por router |
| Longitud de contexto | No disponible en la informacion proporcionada; la hereda de la configuracion del backbone Qwen/Qwen3-4B |
| Tipos de cuantizacion | No disponible para los adaptadores (se distribuyen en safetensors); el backbone admite cuantizacion, pero no se especifica cual en la ficha |
| Idiomas soportados | No disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (adaptadores PEFT/LoRA en `agents/agent_{0,1,2,3}/`) y `router.pt` (checkpoint PyTorch) |

## Arquitectura y entrenamiento
La arquitectura combina un backbone transformer decoder-only denso de la familia Qwen3 (Qwen/Qwen3-4B) con cuatro adaptadores LoRA independientes, uno por agente, más un modulo de enrutado (`router.pt`) descrito en la model card como "familiarity predictor / router heads". El router decide que agente atiende cada consulta, de modo que los pesos del backbone se comparten y solo cambia el adaptador activo. El repositorio oficial incluye los scripts `train_gspo_multi_agent.py` y los scripts de evaluacion; la nomenclatura del fichero apunta a entrenamiento con GSPO (Group Sequence Policy Optimization), una variante de optimizacion por politica dentro del paradigma de aprendizaje por refuerzo.

Los detalles cuantitativos del entrenamiento (numero de tokens, composicion del dataset, fases de SFT/RLHF/DPO, hiperparametros del router) no estan disponibles en la informacion proporcionada. Lo unico documentado es la configuracion del checkpoint: run principal de 4 agentes sobre Qwen3-4B, `midemb=True`, push-away marginal, paso de entrenamiento 6000. El metodo se presenta como co-evolucion de mecanismos de enrutado con agentes LLM de aprendizaje continuo, es decir, agentes y router se actualizan de forma conjunta en lugar de entrenarse por separado.

## Capacidades
- Generacion de texto autoregresiva heredada del backbone Qwen3-4B, con la capa de especializacion aportada por cada agente LoRA.
- Enrutado interno entre cuatro agentes: el modelo incorpora un predictor de familiaridad que selecciona el adaptador mas adecuado para cada entrada.
- Comportamiento multi-agente: el diseno permite que distintas consultas se resuelvan con politicas especializadas distintas dentro del mismo despliegue.
- Aprendizaje continuo: el esquema CERA-MoA esta pensado para actualizar agentes y router de forma incremental.
- Compatibilidad con el ecosistema PEFT: los adaptadores se cargan con `PeftModel.from_pretrained` sobre Qwen/Qwen3-4B.
- Tool calling / function calling: no documentado en la informacion proporcionada.
- Modo thinking, vision o audio: no documentado en la informacion proporcionada.
- Capacidades multilingues: no disponible; el repositorio no declara idiomas.

## Casos de uso
- Investigacion en enrutado de expertos: usar el checkpoint para reproducir y extender los experimentos del paper CERA-MoA, comparando el enrutado aprendido con estrategias de seleccion aleatoria o por reglas.
- Prototipado de asistentes locales con especializacion: desplegar el backbone Qwen3-4B con los cuatro adaptadores y conmutar el adaptador segun el dominio de la consulta (por ejemplo, codigo frente a redaccion), reduciendo el coste frente a mantener varios modelos completos.
- Experimentos de aprendizaje por refuerzo: partir de los scripts de GSPO incluidos en el repositorio para estudiar como evoluciona el router a medida que se entrenan los agentes con recompensas especificas de tarea.
- Evaluacion de mezcla de agentes en hardware de consumo: al apoyarse en un backbone de 4B, permite ejecutar pruebas de enrutado multi-agente en una unica GPU de gama alta de consumo, algo inviable con backbones de mayor tamano.
- Enrutado como componente de sistema mayor: emplear `router.pt` como clasificador de familiaridad para decidir si una consulta la resuelve un agente pequeno o debe escalarse a un modelo mayor.
- Base para fine-tuning incremental: servir como punto de partida para anadir nuevos agentes LoRA a dominios concretos, manteniendo el backbone congelado y reentrenando solo el router.
- Docencia y divulgacion tecnica: ilustrar de forma reproducible la diferencia entre mixture-of-experts disperso y mixture-of-agents con adaptadores de bajo rango.

Advertencia: al no existir benchmarks publicados ni validacion de la comunidad (0 descargas, 0 likes), estos casos deben tratarse como escenarios de experimentacion, no como usos en produccion sin una evaluacion previa propia.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye tablas de MMLU, HumanEval, GSM8K ni metricas equivalentes, y la busqueda web realizada no aporto ningun resultado relevante sobre este modelo (los resultados devueltos trataban sobre un tema sin relacion). Tampoco se documentan cifras de latencia o throughput.

## Requisitos de hardware
Estimaciones derivadas del hecho de que el backbone es Qwen3-4B; no proceden de mediciones publicadas para este checkpoint:
- VRAM del backbone en bf16: en torno a 8-9 GB de pesos, mas overhead de activaciones y cache KV.
- VRAM en cuantizacion de 8 bits: aproximadamente 4,5-5,5 GB.
- VRAM en cuantizacion de 4 bits (por ejemplo GGUF Q4_K_M, si se convierte el backbone): aproximadamente 2,5-3,5 GB.
- Adaptadores y router: 0,7 GB adicionales en disco; su huella en VRAM es pequena si se conmutan sobre un unico backbone, pero se multiplica si se cargan los cuatro agentes en paralelo (hasta cuatro copias del backbone si no se comparte instancia, lo que en bf16 superaria los 32 GB).
- GPU recomendadas: por tamano, cabe en RTX 4090, RTX 4080, RTX 3090 y tarjetas de 16 GB o mas en bf16; en cuantizacion de 4 bits es viable en GPUs de 8 GB. Para cargar los cuatro agentes simultaneamente se recomienda A100 40 GB, H100 o L40S.
- Despliegue: el flujo documentado es `transformers` + `peft` con `device_map="auto"`. No se documenta soporte especifico para vLLM, llama.cpp, Ollama o TGI; vLLM soporta adaptadores LoRA, pero la compatibilidad con el router de este repositorio no esta verificada.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Benchmarks publicados | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| CERA-MoA-Qwen3-4B-4agents | ~4B de backbone + 4 adaptadores LoRA (0,7 GB) | No disponible | No publicados | apache-2.0 | Adaptadores en Hugging Face; backbone aparte |
| Qwen/Qwen3-4B (backbone) | ~4B | No disponible en esta informacion | No disponibles en esta informacion | No disponible en esta informacion | Hugging Face |
| Adaptador LoRA unico sobre Qwen3-4B (alternativa generica) | ~4B + un adaptador | No disponible | No disponible | Depende del autor | Hugging Face |
| MoE disperso de la familia Qwen3 (alternativa conceptual, p. ej. variantes con parametros activos reducidos) | No disponible | No disponible | No disponible | No disponible | Hugging Face |

La diferencia estructural frente a un MoE clasico es que aqui la separacion no esta en capas de expertos dentro del grafo, sino en adaptadores de bajo rango seleccionados por un router externo, lo que permite conmutar especializacion sin recargar el backbone. No se dispone de datos de rendimiento que permitan una comparacion cuantitativa con ninguna de las alternativas.

## Limitaciones y advertencias
- Ausencia total de benchmarks: no hay evidencia publicada de calidad, y el repositorio acumulaba 0 descargas y 0 likes en el momento de redactar la ficha.
- Checkpoint de investigacion: corresponde a un unico run (paso 6000) con configuracion concreta; no hay garantia de estabilidad fuera de ese setup.
- Dependencia del backbone: los pesos de Qwen/Qwen3-4B no se incluyen; sin descargarlos aparte, el repositorio no es utilizable.
- Sobreajuste al router: si el predictor de familiaridad se equivoca, la consulta se enruta a un agente inadecuado y la calidad cae sin que el modelo lo detecte.
- Idiomas no declarados: no se puede asumir soporte de castellano ni de ninguna otra lengua concreta.
- Riesgo de alucinacion: inherente a un modelo generativo de 4B; no se documentan mitigaciones (RAG, verificacion, etc.).
- Contexto no verificado para este fine-tuning: aunque el backbone soporte ventanas largas, no hay datos de como afecta el entrenamiento LoRA a esa capacidad.
- Licencia: los adaptadores se publican bajo apache-2.0, lo que permite uso comercial, pero la licencia del backbone y de los datos de entrenamiento debe verificarse por separado; la model card no detalla la procedencia del dataset.
- Referencia bibliografica no verificada: el identificador arXiv:2609.18779 y las fechas del repositorio (septiembre de 2026) no han podido contrastarse con fuentes externas.
- Busqueda web sin resultados utiles: las consultas realizadas no devolvieron informacion relacionada con el modelo, por lo que toda la ficha se apoya en la model card y en los metadatos del repositorio.

## Enlaces
- Modelo en Hugging Face: https://huggingface.co/mj0530/CERA-MoA-Qwen3-4B-4agents
- Modelo base: https://huggingface.co/Qwen/Qwen3-4B
- Paper (arXiv:2609.18779): https://arxiv.org/abs/2609.18779
- Pagina del paper en Hugging Face: https://huggingface.co/papers/2609.18779
- Codigo oficial: https://github.com/michaeljiang0530/CERA-MoA
