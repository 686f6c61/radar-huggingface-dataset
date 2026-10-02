# Johneeee/Qwen3.8-27B-TURBO-Fable-Cold-Fusion-735-882-her-unc-NM-DAU-oQ5e-aura-last4-bf16-vision-mtp

## Resumen

Qwen3.8-27B-TURBO-Fable-Cold-Fusion-735-882-her-unc-NM-DAU-oQ5e-aura-last4-bf16-vision-mtp es un checkpoint cuantizado publicado por el usuario Johneeee en HuggingFace. No se trata de un modelo entrenado desde cero, sino de una cuantizacion de precision mixta de un modelo base de tipo `qwen3_5`, generada con la herramienta oQ de oMLX (version v0.7.0.dev4). El repositorio contiene 27.781.427.952 parametros (unos 27,8 mil millones) almacenados en safetensors con formato MLX, con un peso total de 22,9 GB.

El modelo resuelve un problema puramente de despliegue: reducir el coste de memoria de un transformer de ~27,8B de parametros para que pueda ejecutarse en hardware con memoria unificada de Apple (Apple Silicon) mediante MLX. La cuantizacion aplicada es de 5 bits con tamano de grupo 64, con la particularidad de que el nombre del repositorio indica que las ultimas 4 capas se mantienen en bf16 (`last4-bf16`) para preservar calidad en la salida.

La relevancia de esta ficha es limitada y conviene ser explicitos: el repositorio tiene 0 descargas y 0 likes, se creo y actualizo el mismo dia (2 de octubre de 2026, con 14 segundos de diferencia), no declara licencia, idiomas ni pipeline, y su model card se limita a los metadatos de cuantizacion. No hay paper, informe tecnico ni evaluacion publicada asociada. Debe tratarse por tanto como un artefacto experimental de cuantizacion, no como un modelo listo para produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de tipo `qwen3_5` (segun el tag y el campo model type de la model card); detalles de atencion, MoE o capas no disponibles |
| Parametros totales | 27.781.427.952 (~27,8B), dato real de los safetensors |
| Parametros activos | no disponible (no se especifica si es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | oQ (oMLX v0.7.0.dev4), precision mixta, 5 bits, group size 64; las ultimas 4 capas en bf16 segun el nombre del repositorio |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | MLX safetensors (libreria `mlx`) |
| Tamano del repositorio | 22,9 GB |
| Descargas / likes | 0 / 0 |
| Fecha de creacion | 2026-10-02T14:08:06Z |
| Ultima actualizacion | 2026-10-02T14:08:20Z |

## Arquitectura y entrenamiento

No hay informacion publicada sobre el entrenamiento. La model card no incluye numero de tokens, composicion del dataset, fases de RLHF, DPO ni ninguna innovacion de entrenamiento. Lo unico documentado es el proceso de cuantizacion posterior: se uso oQ, la herramienta de cuantizacion de precision mixta de oMLX en su version v0.7.0.dev4, con 5 bits y group size 64 sobre un modelo base identificado como `qwen3_5`.

Sobre la arquitectura del modelo base solo puede afirmarse que se corresponde con la familia Qwen 3.5, segun el tag `qwen3_5` y el campo "Model type" de la model card. No se dispone de datos sobre si emplea atencion estandar, atencion lineal, mezcla de expertos o atencion híbrida. El nombre del repositorio incluye los sufijos `vision` y `mtp`, que sugieren capacidades de vision y de prediccion multi-token (multi-token prediction), y `last4-bf16`, que sugiere que las cuatro ultimas capas se conservan sin cuantizar. Estas tres inferencias proceden unicamente de la nomenclatura del repositorio y no estan confirmadas por ninguna documentacion tecnica, por lo que deben tratarse como no verificadas.

## Capacidades

- Generacion de texto autoregresiva, asumiendo el comportamiento estandar de un transformer de la familia Qwen 3.5. No hay evaluacion publicada que lo confirme para este checkpoint concreto.
- Vision: el sufijo `vision` del nombre sugiere entrada multimodal de imagenes, pero no esta documentado ni confirmado en la model card.
- Prediccion multi-token (MTP): el sufijo `mtp` apunta a esta tecnica, habitualmente usada para decodificacion especulativa interna. No confirmado.
- Tool calling y function calling: no disponible.
- Capacidades de agente y razonamiento multi-paso: no disponible.
- Soporte multilingue: no disponible.
- Modo de razonamiento explicito (thinking mode): no disponible.
- Capacidades de codigo y matematicas: no disponible.

En ausencia de evaluaciones, no es posible afirmar que este checkpoint conserve las capacidades del modelo original tras una cuantizacion agresiva a 5 bits.

## Casos de uso

- Inferencia local en Mac con memoria unificada: el modelo esta empaquetado en formato MLX, por lo que su uso natural es ejecutarlo en un Mac con chip de la serie M mediante `mlx-lm`. Seria adecuado para prototipado local de generacion de texto cuando no se dispone de GPU dedicada.
- Evaluacion comparativa de tecnicas de cuantizacion: dado que existe un `last4-bf16` explicito y una cuantizacion mixta a 5 bits, el checkpoint puede usarse para medir la perdida de calidad frente al modelo base en tareas de generacion controlada.
- Experimentacion academica con precision mixta: util para estudiar como afecta el group size 64 y la preservacion de las ultimas capas a metricas de perplejidad y a la coherencia de respuestas largas.
- Laboratorio de cuantizacion reproducible: el pipeline oQ de oMLX esta publicado, de modo que este repositorio puede servir como caso de referencia para replicar el proceso sobre otros modelos.
- Pruebas de pipelines multimodales (no confirmado): si el sufijo `vision` se corresponde con capacidades reales, podria emplearse para prototipos de descripcion de imagenes en local; requiere verificacion previa.
- Base para fine-tuning ligero en Apple Silicon: al estar en MLX y en 5 bits, no es un punto de partida ideal para LoRA sobre pesos cuantizados, pero si para experimentos de adaptacion sobre la version bf16 de las ultimas capas.

No se recomienda su uso en produccion con clientes, en pipelines de CI/CD ni en sistemas con requisitos de licencia claros mientras no se resuelvan las incognitas de licencia, idiomas y contexto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

La model card no incluye MMLU, HumanEval, GSM8K, MT-Bench ni ninguna otra metrica. La busqueda web realizada solo devolvio un directorio agregador de modelos (modelheretic.com) sin datos tecnicos sobre este checkpoint. No se deben extrapolar las cifras del modelo base Qwen 3.5 a esta version cuantizada, ya que la cuantizacion a 5 bits con group size 64 introduce degradacion no medida.

## Requisitos de hardware

- VRAM / memoria unificada estimada para inferencia: entre 23 y 27 GB, calculados a partir del tamano real del repositorio (22,9 GB) mas el overhead de la cache KV y del runtime de MLX. Es una estimacion, no un dato publicado.
- Entorno objetivo: MLX, lo que en la practica limita la ejecucion a Apple Silicon (series M1, M2, M3 y M4). No hay soporte declarado para CUDA en este repositorio.
- Mac recomendados: un equipo con 32 GB de memoria unificada como minimo para dejar margen a la cache KV; 36 GB o 48 GB son mas seguros para contextos largos. En equipos de 16 GB o 24 GB no cabe.
- GPU NVIDIA: no aplicable directamente. El formato es safetensors de MLX, no GGUF, por lo que no se puede cargar en llama.cpp, Ollama ni vLLM sin una conversion previa.
- Opciones de despliegue: `mlx-lm` (libreria declarada en el campo `library_name`), y herramientas del ecosistema oMLX. vLLM, TGI, llama.cpp y Ollama no estan soportados tal cual esta el repositorio.
- Latencia y throughput: no disponibles. Dependen por completo del chip Apple concreto y de la longitud de contexto, ninguno de los cuales esta documentado.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.8-27B-TURBO-Fable-Cold-Fusion-...(este) | 27,8B | no disponible | oQ 5 bits, group size 64, MLX | no disponible | HuggingFace, 0 descargas |
| Modelo base `qwen3_5` sin cuantizar | no disponible | no disponible | bf16 | no disponible en esta informacion | no disponible |
| Alternativas de ~27B en MLX | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de informacion suficiente para establecer una comparativa fiable. No se conocen las caracteristicas del modelo base (parametros activos, contexto, licencia) ni las de otros checkpoints cuantizados equivalentes. Cualquier comparacion de rendimiento seria especulativa.

## Limitaciones y advertencias

- Licencia no declarada: sin licencia explicita no hay autorizacion clara de uso comercial. Esto es un bloqueante para cualquier despliegue en produccion.
- Cero validacion externa: 0 descargas y 0 likes en el momento de redactar esta ficha. No hay terceros que hayan verificado que el checkpoint carga correctamente ni que genera texto coherente.
- Riesgo de cuantizacion defectuosa: la cuantizacion de precision mixta con capas selectivas en bf16 es un proceso sensible; un error en los metadatos de escalas puede producir degradacion severa o salidas degeneradas sin aviso.
- Nombre no verificado: los sufijos `vision`, `mtp`, `aura` y `last4-bf16` no estan documentados en la model card. Es posible que describan caracteristicas reales o que sean etiquetas heredadas del pipeline de cuantizacion.
- Riesgo de alucinacion: no medida ni documentada. Se desconoce el efecto de la cuantizacion a 5 bits sobre la tasa de alucinacion.
- Limitaciones de idioma: no disponibles. No consta que el modelo soporte castellano de forma especifica.
- Limitaciones de contexto: la longitud de contexto no esta declarada, por lo que no se puede garantizar el comportamiento en secuencias largas.
- Sesgos: no evaluados. Al no haber model card sustantiva ni evaluaciones, no hay informacion sobre sesgos de genero, raza, religion o idioma.
- Riesgo de seguridad: el sufijo `unc` en el nombre sugiere un modelo "uncensored", es decir, con los filtros de seguridad reducidos o eliminados. Si asi fuera, seria inadecuado para aplicaciones orientadas al usuario final sin una capa de moderacion externa. No confirmado.
- Trazabilidad: no se identifica con precision la revision concreta del modelo base sobre la que se aplico la cuantizacion.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/Johneeee/Qwen3.8-27B-TURBO-Fable-Cold-Fusion-735-882-her-unc-NM-DAU-oQ5e-aura-last4-bf16-vision-mtp
- Herramienta oQ de oMLX (citada en la model card): https://github.com/jundot/omlx
- Directorio agregador devuelto por la busqueda web (sin datos tecnicos del modelo): https://modelheretic.com/
- Paper del modelo base: no disponible
- Blog o informe tecnico del autor: no disponible
- Demo: no disponible
- Repositorio de codigo adicional: no disponible
