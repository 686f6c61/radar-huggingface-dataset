# cmeister/boundary-markers-en-d12-bnd_wpd_caps-bpe

## Resumen

`cmeister/boundary-markers-en-d12-bnd_wpd_caps-bpe` es un paquete de tres modelos de lenguaje pequenos (semillas 0, 1 y 2) entrenados con [nanochat](https://github.com/karpathy/nanochat) como material experimental del articulo *Explicit Boundary Markers for Subword Vocabularies* (Sander Land y Clara Meister, arXiv:2608.08847). No es un modelo de proposito general ni un asistente: es un conjunto de checkpoints de investigacion disenado para aislar el efecto del tokenizador en el entrenamiento. Los tres modelos comparten arquitectura, datos y ajustes de entrenamiento, y solo se diferencian en el tokenizador `bnd_wpd_caps`, que anade codigos de mayusculas (`<^>` para capitalizacion tipo titulo y `<^^>` para palabras en mayusculas) fuera de las marcas de frontera de la palabra.

Tecnicamente son transformers densos estilo GPT de 12 capas, ancho 768 y 6 cabezas de atencion, con una ventana de contexto de 2.048 tokens. Se entrenaron 2.553 pasos de 524.288 tokens cada uno, es decir, 1.340 millones de tokens, sobre 8 shards de ClimbMix, en una unica GPU por modelo. No hay ajuste por instrucciones, RLHF ni DPO: son modelos base de modelado de lenguaje.

Su relevancia es metodologica. La model card advierte de que los checkpoints originales del articulo se perdieron y que estas tres semillas son reentrenamientos de septiembre de 2026 con los mismos datos, tokenizador e hiperparametros; las diferencias en bits por byte de validacion son de decimas de milipunto. El valor del repositorio esta en la comparabilidad controlada entre tokenizadores, no en su rendimiento absoluto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso tipo GPT (nanochat, commit `92d63d4`); 12 capas, ancho 768, 6 cabezas de atencion |
| Parametros totales | No disponible (derivable de `seed<n>/meta_002553.json`; la model card no publica el recuento) |
| Longitud de contexto | 2.048 tokens |
| Tipos de cuantizacion | No disponible (solo se publican pesos en precision de entrenamiento) |
| Idiomas soportados | Ingles (`en`) |
| Licencia | Apache 2.0 |
| Formato de pesos | PyTorch state dict (`.pt`), cargable con `torch.load(..., weights_only=True)`; sin safetensors ni GGUF |
| Tokenizador | BPE entrenado sobre una muestra de 5 GB de FineWeb en ingles; vocabulario de 34.685 entradas (+1 token de inicio de secuencia = 34.686) |
| Fichero del tokenizador | `tokenizer/fineweb_en_5gb_bnd_wpd_caps_bpe_v34685.json.gz` (sha256 `74c8817ac2533ec76d5ba31f33418caed3bc14b6fe379699bc6e3922b04a4c9b`) |
| Tamano del repositorio | 2,5 GB (tres semillas mas tokenizador) |
| Descargas / likes | 0 / 0 |
| Fecha de creacion | 2026-09-19 |

## Arquitectura y entrenamiento

La arquitectura es la de nanochat en el commit `92d63d4`: un transformer decoder-only denso con 12 capas, dimension de modelo 768, 6 cabezas de atencion y contexto de 2.048 tokens. El entrenamiento se lanzo con `paper_utils/boundary/downstream/run_arms.sh` del repositorio script_tok, con un modelo por GPU. Cada modelo consumo 2.553 pasos de 524.288 tokens, lo que suma aproximadamente 1.340 millones de tokens. El texto de entrenamiento son los 8 primeros shards de ClimbMix que descarga nanochat, leidos entre 3,4 y 3,6 veces segun el tokenizador.

La innovacion que motiva el repositorio no esta en la arquitectura, sino en la tokenizacion. El tokenizador `bnd_wpd_caps` parte de `bnd_wpd` (BPE con marcadores explicitos de frontera de palabra) y anade codigos de caso: una palabra capitalizada se escribe como `<^>` seguida de su forma en minusculas, y una palabra en mayusculas como `<^^>` seguida de su forma en minusculas. El codigo se situa fuera de las marcas de la palabra, de modo que `The` puede reutilizar la entrada de vocabulario de `the`. El tokenizador se entreno con BPE sobre 5 GB de FineWeb en ingles y usa la clase de codigos de caso de agosto de 2026, que el codigo actual de script_tok ya no define; por eso el repositorio incluye `legacy_extcaps_pretokenizer.py`, que debe copiarse a `paper_utils/boundary/` en un checkout de script_tok e importarse antes de cargar el tokenizador. En texto ingles, esta version y la corregida posterior solo difieren en palabras sin ninguna letra con caja.

La semilla controla la inicializacion de pesos y el orden de los 8 shards; el orden para una semilla dada es identico para todos los tokenizadores, lo que permite comparaciones directas entre variantes de tokenizacion con la misma semilla. No se menciona ningun ajuste posterior al preentrenamiento (ni SFT, ni RLHF, ni DPO).

## Capacidades

- Modelado de lenguaje y generacion de texto en ingles: son modelos base, sin ajuste por instrucciones, por lo que completan texto en lugar de seguir ordenes.
- Evaluacion de tokenizadores: permiten medir bits por byte de validacion bajo un protocolo controlado, que es su uso principal.
- Comparacion controlada entre semillas: al fijar semilla, datos y orden de shards, aislan el efecto del vocabulario.
- Analisis de vocabulario y segmentacion subword: el tokenizador con codigos de caso permite estudiar la reutilizacion de entradas entre formas capitalizadas y en minusculas.
- Reproduccion de experimentos: los logs completos de entrenamiento y evaluacion y los hashes de cada fichero acompanan a cada semilla.
- No soporta tool calling ni function calling.
- No tiene capacidades de agente ni razonamiento multi-paso inducido.
- No dispone de modo de razonamiento explicito (*thinking*), vision, audio ni multimodalidad.
- Capacidades multilingues: no disponibles; solo se entrena y evalua en ingles.
- Cobertura de contexto limitada a 2.048 tokens.

## Casos de uso

- Investigacion en tokenizacion subword: usar las tres semillas para medir el efecto de los marcadores de frontera y los codigos de caso sobre bits por byte, comparando contra los brazos con otros tokenizadores del mismo articulo bajo semillas identicas.
- Reproduccion y verificacion del articulo: los checkpoints reentrenados permiten replicar la tabla de resultados publicada y cuantificar la variabilidad introducida por la no reproducibilidad bit a bit del entrenamiento en GPU.
- Linea base de bajo coste para experimentos de entrenamiento: con 1.340 millones de tokens y una sola GPU por modelo, sirve como banco de pruebas para decisiones de preprocesado o de curriculum antes de escalar a modelos mayores.
- Analisis linguistico de la caja en ingles: el tokenizador `bnd_wpd_caps` permite estudiar como se comparte vocabulario entre `the` y `The` y que ocurre con palabras sin letras con caja, un caso que la propia model card identifica como el unico punto de divergencia entre versiones.
- Evaluacion de infraestructura de carga de tokenizadores: el requisito de importar `legacy_extcaps_pretokenizer.py` antes de cargar el tokenizador convierte al repositorio en un caso de prueba para gestion de versiones en codigo de investigacion.
- Ensenanza y demostraciones de entrenamiento a pequena escala: el paquete completo (pesos, configuracion, log y hashes) permite recorrer de principio a fin un ciclo de entrenamiento y evaluacion reproducible.
- Auditoria de artefactos cientificos: `archive.json` documenta el sha256 de cada fichero tal como se copio de la ejecucion de entrenamiento, util para verificar integridad en revisiones por pares.

## Benchmarks y rendimiento

La unica metrica publicada es bits por byte de validacion (suma de la perdida sobre el shard de validacion de ClimbMix dividida por la longitud UTF-8 real del texto evaluado; menor es mejor). No hay resultados de MMLU, HumanEval, GSM8K ni similares.

| Semilla | Reentrenamiento (este repositorio) | Publicado en el articulo | Diferencia |
|---|---|---|---|
| 0 | 0,87942 | 0,87959 | -0,00016 |
| 1 | 0,87909 | 0,87876 | +0,00032 |
| 2 | 0,87952 | 0,87952 | +0,00000 |

No se han publicado resultados de benchmarks adicionales en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. El repositorio completo ocupa 2,5 GB para tres semillas mas el tokenizador, lo que situa cada checkpoint en el orden de varios cientos de megabytes.
- GPU recomendadas: no se especifican. El entrenamiento se hizo con una GPU por modelo, sin detallar el modelo de GPU empleado.
- Viabilidad en GPU de consumo: muy probable en tarjetas con 8 GB o mas de VRAM dado el tamano del checkpoint, aunque no hay confirmacion oficial en la model card.
- Inferencia en CPU: factible en principio por el tamano reducido, pero sin cifras de latencia ni throughput publicadas.
- Opciones de despliegue: los pesos son state dicts de PyTorch que requieren el codigo de nanochat; no hay soporte documentado para vLLM, llama.cpp, Ollama ni TGI, ni pesos en GGUF o safetensors.
- Latencia y throughput: no disponibles.
- Nota de compatibilidad: para usar el tokenizador hay que clonar script_tok, copiar `legacy_extcaps_pretokenizer.py` a `paper_utils/boundary/` e importarlo antes de cargar el fichero del tokenizador.

## Comparativa con modelos similares

La comparacion natural es con los otros brazos del mismo estudio (mismos datos, mismos pasos, misma semilla, distinto tokenizador) y con el modelo base de nanochat de 12 capas. Los datos concretos de los demas brazos no se detallan en la informacion disponible.

| Alternativa | Parametros | Contexto | Rendimiento (bits por byte de validacion) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este modelo (`bnd_wpd_caps`, 12 capas) | No disponible | 2.048 | 0,87942 / 0,87909 / 0,87952 (semillas 0/1/2) | Apache 2.0 | En este repositorio |
| Variante `bnd_wpd` sin codigos de caso | No disponible | 2.048 | No disponible en esta ficha | No disponible | En el mismo proyecto de investigacion |
| Otros brazos de tokenizador del articulo | No disponible | 2.048 | No disponible en esta ficha | No disponible | En el mismo proyecto de investigacion |
| nanochat base de 12 capas | No disponible | No disponible | No disponible | No disponible | Repositorio nanochat |

## Limitaciones y advertencias

- Son modelos base sin ajuste por instrucciones: no deben desplegarse como asistentes ni esperar que sigan ordenes.
- Solo ingles: no hay datos de evaluacion ni de entrenamiento en otros idiomas.
- Contexto de 2.048 tokens, insuficiente para tareas de contexto largo.
- Sesgos: el corpus de entrenamiento (shards de ClimbMix) y el de tokenizacion (FineWeb en ingles) no estan filtrados ni documentados en esta ficha, por lo que pueden propagar sesgos presentes en esos datos.
- Riesgo de alucinacion: inherente a cualquier modelo de lenguaje, agravado aqui por el tamano reducido y el escaso volumen de entrenamiento (1.340 millones de tokens).
- Advertencia de reproducibilidad: la model card indica explicitamente que los checkpoints originales se perdieron y que estos son reentrenamientos; el entrenamiento en GPU no es reproducible bit a bit, de ahi las pequenas discrepancias frente a las cifras publicadas.
- Advertencia de integridad cientifica: los resultados de este repositorio no deben citarse como si fueran los del articulo original.
- Compatibilidad fragmentada del tokenizador: depende de una clase de codigos de caso de agosto de 2026 que el codigo actual de script_tok ya no define; sin el fichero `legacy_extcaps_pretokenizer.py` el tokenizador no se carga.
- Sin datos de rendimiento en tareas: no hay benchmarks de razonamiento, codigo o matematicas que permitan estimar su utilidad mas alla del modelado de lenguaje.
- Auditoria de la busqueda web: las consultas realizadas no devolvieron resultados relevantes sobre este modelo (unicamente enlaces a Twitch), por lo que no hay informacion externa que amplie la model card.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/cmeister/boundary-markers-en-d12-bnd_wpd_caps-bpe
- Articulo: *Explicit Boundary Markers for Subword Vocabularies*, Sander Land y Clara Meister: https://arxiv.org/abs/2608.08847
- Repositorio nanochat (commit `92d63d4`): https://github.com/karpathy/nanochat
- Repositorio script_tok: https://github.com/sanderland/script_tok
