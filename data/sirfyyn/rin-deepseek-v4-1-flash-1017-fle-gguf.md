# sirfyyn/Rin-Deepseek-V4.1-Flash-1017-FLE-GGUF

## Resumen

Rin-Deepseek-V4.1-Flash-1017-FLE-GGUF es una cuantizacion GGUF de 2 bits del modelo DeepSeek V4.1 Flash (751.325.829.744 parametros totales, arquitectura MoE), publicada por el usuario sirfyyn. No es una cuantizacion convencional: esta disenada especificamente para FastLocalExperts (FLE), un motor de inferencia propio del autor que divide los expertos del MoE en una mitad "caliente" (cargada en GPU) y una mitad "fria" (servida desde RAM), segun un perfil de uso. El resultado es un modelo de 751.000 millones de parametros que corre a unos 53 tokens/s en una unica GPU de 32 GB (RTX PRO 4500), algo inviable con llama.cpp estandar.

El modelo se construye a partir de los cuantizados GSQ-RCO de ISTA DASLab: la mitad caliente es byte-identica a su IQ2_XXS y la mitad fria combina IQ2_XXS con su build de 1.75 bpw. Incluye ademas un drafter de decodificacion especulativa (DSpark) y un perfil de uso que acelera el arranque en caliente. La licencia es MIT tanto del modelo base como de los cuantizados de origen.

Su relevancia practica es la de demostrar que un MoE de gran escala puede desplegarse en hardware de consumo profesional (una GPU de 32 GB con 120 GB de RAM DDR5) manteniendo una calidad cercana al cuantizado de referencia, a costa de una perdida de fidelidad medible (KLD 0.292 frente a 0.248 del IQ2_XXS original en texto mixto).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE transformer (modelo base DeepSeek V4.1 Flash); cuantizacion GGUF con split de expertos caliente/frio para FLE |
| Parametros totales | 751.325.829.744 (751,3 B) |
| Parametros activos | no disponible |
| Longitud de contexto | 65.536 tokens en la receta de referencia (`-c 65536`); contexto maximo del modelo base no disponible |
| Tipos de cuantizacion | 2 bits efectivos: IQ2_XXS (ISTA) en mitad caliente y parte de la fria; 1.75 bpw (ISTA) en 47 de 120 tensores frios; KV cache q8_0; drafter Q2K/Q8 |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | GGUF (6 partes: `Rin-Deepseek-V4.1-Flash-1017-FLE-0000{1..6}-of-00006.gguf`), mas drafter GGUF y perfil `.prof` |

## Arquitectura y entrenamiento

El modelo base es DeepSeek V4.1 Flash, un transformer con mezcla de expertos (MoE) de 751.000 millones de parametros. Rin no reentrena nada: es una cuantizacion post-entrenamiento que reorganiza los pesos para el motor FLE. La innovacion clave es el particionado por frecuencia de uso de expertos: 1.860 expertos (35 a 58 por capa) se asignan a la mitad caliente con un presupuesto de 15,5 GiB y se cargan en GPU; el resto se sirve desde RAM. La seleccion de precision por tensor en la mitad fria se hace por ganancia por coste, no de forma uniforme.

El split sigue el plan de presupuesto interno de FLE, de modo que el motor carga las dos mitades sin replanificar (claves `fle.expert_split.*`). La distribucion de bits deriva de un perfil de uso obtenido con textos mixtos; en cargas de trabajo distintas (documentos largos, codigo) la proporcion de accesos a expertos frios sube de 0,37 a 0,73, lo que reduce el ahorro. El repositorio incluye un drafter DSpark (byte-identico a su repo independiente) para decodificacion especulativa y un perfil `fle-usage-profile-ista-iq2_xxs.prof` para el arranque en caliente del almacen de expertos en RAM.

## Capacidades

- Generacion de texto conversacional y razonamiento, heredadas del modelo base DeepSeek V4.1 Flash.
- Modo de razonamiento (thinking) activable; la receta de referencia fija `--reasoning-budget 8000` para evitar respuestas sin cerrar.
- Decodificacion especulativa mediante el drafter DSpark incluido (`--spec-type draft-dspark`).
- Inferencia con offloading de expertos a RAM coordinada por el motor FLE.
- Compatibilidad declarada con endpoints (`endpoints_compatible` en los tags del repo).
- Soporte de plantillas de chat via `--jinja` en llama-server.
- Capacidades de tool calling, agentes, vision o audio: no disponibles en la informacion proporcionada.

## Casos de uso

- Despliegue local de un MoE de 751 B en una sola GPU de 32 GB: el caso central del modelo. Con FLE v1.2.6 o superior, la mitad caliente en GPU y la fria en RAM permiten servir el modelo a ~53 tok/s sin cluster multi-GPU.
- Prototipado e investigacion sobre offloading de expertos: el split caliente/frio y el perfil de uso son un banco de pruebas reproducible para estudiar el compromiso entre precision por experto, latencia y calidad.
- Asistente conversacional de escritorio: la app FLE Link ofrece una receta "Rin" preconfigurada (flags del motor, presupuesto de cache y drafter), lo que permite tener un chat local con un modelo de gran escala sin ajustar parametros manualmente.
- Evaluacion de cuantizaciones de 2 bits: las metricas publicadas (KLD, top-1, ratio de perplejidad frente a pesos originales) permiten comparar el impacto del split frente al IQ2_XXS de ISTA en cargas mixtas y de agente.
- Generacion de codigo y tareas de agente con contexto largo: la receta soporta 65.536 tokens de contexto y modo thinking; conviene fijar `--reasoning-budget` para evitar que el modelo consuma decenas de miles de tokens razonando sin responder (documentado en tareas de three.js).
- Benchmarking de decodificacion especulativa: el drafter DSpark incluido y los flags `--spec-draft-p-min` y `--spec-draft-n-max` permiten medir el impacto del speculative decoding sobre un MoE con offloading.

## Benchmarks y rendimiento

Metricas de fidelidad frente a los pesos originales (referencia Q8/MXFP4), sobre dos textos:

| Texto | Version | KLD | Top-1 | Ratio PPL |
|---|---|---|---|---|
| Mixto | ISTA IQ2_XXS | 0,248 | 83,5 % | 1,171 |
| Mixto | Rin | 0,292 | 82,1 % | 1,220 |
| Agente | ISTA IQ2_XXS | 0,210 | 85,2 % | 1,013 |
| Agente | Rin | 0,234 | 84,4 % | 1,021 |

Velocidad (RTX PRO 4500 32 GB, Ryzen 9950X3D, 120 GB DDR5, Linux, FLE v1.2.6, DSpark activo):

| Version | Tokens/s | Nota |
|---|---|---|
| Rin | 53,4 | mediana de tres arranques en frio |
| ISTA IQ2_XXS | 50,4 | con DSpark |
| Rin sin perfil de uso | 30,9 | primeros minutos sin warm start |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- VRAM: 32 GB en la GPU de referencia; la mitad caliente ocupa un presupuesto de 15,5 GiB y el resto del modelo reside en RAM.
- RAM del sistema: 120 GB DDR5 en la configuracion medida; el almacen de expertos se configura con `FLE_MOE_STORE_GB=90`.
- GPU validadas: RTX PRO 4500 32 GB (unica medicion publicada). Otras GPU de 32 GB (por ejemplo, series profesionales o de datacenter con esa VRAM) no estan validadas en la informacion disponible.
- GPU de consumo: no hay datos de funcionamiento en RTX 4090 (24 GB) ni en GPU con menos de 32 GB; el presupuesto caliente de 15,5 GiB mas KV cache y drafter deja poco margen por debajo de 32 GB.
- Despliegue: exclusivamente con el motor FastLocalExperts (FLE) v1.2.6 o superior; llama.cpp estandar no puede cargar el layout dividido. La app FLE Link automatiza la receta.
- Rendimiento: 53,4 tok/s de mediana con DSpark; 30,9 tok/s en los primeros minutos si no se usa el perfil de warm start. Mejor rendimiento medido en Linux.
- Almacenamiento: repositorio de 243,1 GB; los 6 GGUF, el drafter y el perfil deben descargarse completos.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Notas |
|---|---|---|---|---|---|
| Rin (este modelo) | 751,3 B | 65.536 | 2 bits con split FLE | MIT | 53,4 tok/s en GPU de 32 GB; requiere FLE |
| ISTA DASLab DeepSeek-V4.1-Flash-1017-GSQ-RCO-GGUF | 751,3 B | no disponible | IQ2_XXS / 1,75 bpw | MIT | 50,4 tok/s con DSpark; mejor fidelidad (KLD 0,248 en mixto) |
| DeepSeek-V4.1-Flash-1017 (original) | 751,3 B | no disponible | Q8 / MXFP4 (referencia) | MIT | Referencia de calidad; no cabe en una GPU de 32 GB |

No se dispone de datos de otros modelos comparables (mismo tamano o misma tarea) en la informacion proporcionada.

## Limitaciones y advertencias

- Cuantizacion con perdida: Rin es peor que el IQ2_XXS del que deriva; la KLD sube de 0,248 a 0,292 en texto mixto y de 0,210 a 0,234 en texto de agente. El compromiso es velocidad, no calidad.
- Dependencia de carga de trabajo: el split se optimizo con un perfil de textos mixtos; en documentos largos y codigo la proporcion de accesos a expertos frios sube de 0,37 a 0,73 y el ahorro se reduce.
- Dependencia de motor: solo funciona con FLE v1.2.6 o superior; no es cargable en llama.cpp estandar ni, presumiblemente, en otros runners GGUF convencionales.
- Modo thinking sin limite: sin `--reasoning-budget` el modelo puede razonar decenas de miles de tokens (60.000 en las pruebas de three.js) y no responder.
- Arranque en frio lento: sin el perfil `.prof` el rendimiento inicial cae a 30,9 tok/s.
- Configuracion de cache: no debe fijarse `FLE_MOE_CACHE_BUDGET_MIB` con Rin, porque la mitad caliente ya actua como cache de GPU.
- Idiomas soportados no documentados; no hay evaluacion de sesgos ni de tasas de alucinacion en la informacion disponible.
- Licencia MIT permite uso comercial y redistribucion, tanto del modelo base como de los cuantizados de ISTA de origen, pero el motor FLE y FLE Link son componentes separados de sirfyyn cuya licencia de uso no se detalla en la informacion proporcionada.
- Modelo con 0 descargas y 0 likes en el momento de la consulta: sin validacion independiente por parte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/sirfyyn/Rin-Deepseek-V4.1-Flash-1017-FLE-GGUF
- Modelo base: https://huggingface.co/deepseek-ai/DeepSeek-V4.1-Flash-1017
- Cuantizados de origen (ISTA DASLab): https://huggingface.co/ISTA-DASLab/DeepSeek-V4.1-Flash-1017-GSQ-RCO-GGUF
- Drafter DSpark: https://huggingface.co/sirfyyn/DeepSeek-V4.1-Flash-1017-DSpark-FLE-GGUF
- Motor FastLocalExperts: https://github.com/sirfyyn/FastLocalExperts
- App FLE Link: https://flelink.run
- Codigo de FLE Link: https://github.com/sirfyyn/flelink
