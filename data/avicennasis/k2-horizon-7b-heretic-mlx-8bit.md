# Avicennasis/K2-Horizon-7B-heretic-mlx-8bit

## Resumen

K2-Horizon-7B-heretic-mlx-8bit es una conversion cuantizada a 8 bits en formato MLX del modelo Avicennasis/K2-Horizon-7B-heretic, una variante "abliterated" (sin comportamiento de rechazo) de la familia K2-Horizon. El repositorio lo publica el usuario Avicennasis y su unico proposito es ofrecer los pesos del modelo base en un formato optimizado para ejecucion en Apple Silicon mediante la libreria MLX, con cuantizacion afina de 8 bits y tamano de grupo 64.

El modelo real declarado en los safetensors es de 8.999.178.240 parametros (unos 9.000 millones, pese a la nomenclatura "7B" del nombre), con un repositorio de 9,6 GB. Soporta ingles y chino, y se distribuye bajo licencia Apache-2.0 heredada del modelo base. Su relevancia actual es practica: permite ejecutar localmente en un Mac un modelo conversacional sin censura de aproximadamente 9B parametros sin recurrir a CUDA ni a servicios en la nube.

La particularidad tecnica del repositorio es que mlx-lm todavia no incluye soporte nativo para la arquitectura k2_horizon (issue mlx-lm#1876), por lo que el autor empaqueta su propio modulo de arquitectura (`k2_horizon.py`, port de MLX del `modeling_k2_horizon.py` de IFM) y obliga a cargar el modelo con `trust_remote_code=True`.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | k2_horizon (modulo propio portado a MLX desde IFM; sin soporte nativo en mlx-lm) |
| Parametros totales | 8.999.178.240 (aprox. 9B) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 8 bits, cuantizacion afina (affine), tamano de grupo 64 |
| Idiomas soportados | ingles (en), chino (zh) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (MLX), modulo Python de arquitectura propio |

## Arquitectura y entrenamiento

La arquitectura de red es `k2_horizon`, la misma que emplea el modelo base K2-Horizon-7B-heretic. El repositorio no describe la topologia interna (atencion, capas, uso de MoE, etc.), pero si aclara que el modulo `k2_horizon.py` incluido es un port a MLX del `modeling_k2_horizon.py` de IFM, el mismo modulo que emplean los checkpoints K2-Horizon publicados por mlx-community, con licencia MIT para dicho modulo. No hay informacion disponible sobre el numero de tokens de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de RLHF, DPO u otras fases de alineamiento.

Lo unico confirmado sobre el proceso es la "abliteracion": el modelo base declara explicitamente que se ha eliminado el comportamiento de rechazo, sin afirmar que el entrenamiento de seguridad haya sido revertido. Este repositorio no modifica el modelo mas alla de la cuantizacion: aplica una conversion afina de 8 bits con grupo de 64 a los pesos del base y anade el codigo necesario para que MLX pueda instanciar la arquitectura.

## Capacidades

- Generacion de texto conversacional multi-turno, con plantilla de chat aplicable via `tok.apply_chat_template`.
- Modelo "uncensored"/abliterated: no activa rechazos ante peticiones que un modelo alineado convencional rechazaria.
- Capacidades aritmeticas y de razonamiento basico verificables en la propia model card (el ejemplo oficial plantea "What is 17 times 23?").
- Soporte multilingue limitado a ingles y chino.
- Tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Modo "thinking" explicito, vision ni audio: no disponible en la informacion proporcionada.
- Inferencia local en Apple Silicon mediante MLX.

## Casos de uso

- Ejecucion local en portatiles Mac: el modelo se carga con `mlx-lm` sobre memoria unificada, lo que permite disponer de un modelo conversacional de ~9B en un MacBook con 16 GB o mas de RAM sin GPU dedicada.
- Asistente personal sin filtros: al ser una variante abliterated, resulta adecuado para tareas de escritura creativa, roleplay o exploracion de temas que los modelos alineados suelen rechazar, siempre que el usuario asuma la responsabilidad del contenido generado.
- Prototipado rapido en investigacion sobre alineamiento y seguridad: sirve como contrapunto "sin rechazo" frente a modelos alineados, util para estudiar comportamiento de refusal y sesgos inducidos por el entrenamiento de seguridad.
- Generacion de texto en chino e ingles dentro de la misma sesion: para equipos que necesitan un unico checkpoint que cubra ambos idiomas sin recurrir a modelos multilingues mas grandes.
- Aplicaciones conversacionales de bajo coste en produccion ligera: los pesos en 8 bits (9,6 GB) permiten mantener el modelo residente en memoria en hardware Apple, reduciendo dependencia de APIs externas y costes por token.
- Base para ajuste fino o experimentacion con MLX: al incluir su propio modulo de arquitectura, el repositorio sirve como punto de partida para quien quiera adaptar LoRA o cuantizaciones alternativas sobre K2-Horizon en el ecosistema MLX.
- Sustitucion de modelos densos de 7-8B en scripts de generacion por lotes que se ejecuten en estaciones de trabajo Apple, aprovechando la aceleracion Metal de MLX.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

La model card no incluye cifras de MMLU, HumanEval, GSM8K ni de ninguna otra evaluacion, y tampoco hay datos comparativos publicados para el modelo base en la informacion proporcionada.

## Requisitos de hardware

- Peso de los pesos en disco: 9,6 GB (repositorio completo, formato MLX 8 bits).
- Memoria unificada minima estimada para inferencia: en torno a 10-11 GB solo para pesos, mas el cache KV y el overhead del runtime. Se recomienda un Mac con 16 GB de memoria unificada como minimo absoluto y 24-32 GB para contextos largos o generacion por lotes.
- GPU compatibles: exclusivamente Apple Silicon (serie M1, M2, M3 y M4). MLX no se ejecuta sobre CUDA, por lo que no es desplegable en A100, H100 ni RTX 4090.
- Compatibilidad con GPU de consumo: si, en Macs con memoria unificada suficiente; no en GPUs NVIDIA de consumo por incompatibilidad de framework.
- Opciones de despliegue: `mlx-lm` (`load`, `generate`) y el servidor de MLX; requiere `trust_remote_code=True` porque la arquitectura `k2_horizon` no esta integrada en mlx-lm (issue #1876). No es compatible con vLLM, llama.cpp, Ollama ni TGI en este formato.
- Latencia y throughput: no disponible en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Formato / framework | Idiomas | Licencia | Notas |
|---|---|---|---|---|---|
| Avicennasis/K2-Horizon-7B-heretic-mlx-8bit | 8.999.178.240 (~9B) | safetensors MLX, 8 bits afino grupo 64 | en, zh | Apache-2.0 | Version cuantizada y lista para Apple Silicon |
| Avicennasis/K2-Horizon-7B-heretic (modelo base) | no disponible | safetensors | en, zh | Apache-2.0 | Version sin cuantizar y abliterated |
| Checkpoints K2-Horizon de mlx-community | no disponible | MLX | no disponible | no disponible | Emplean el mismo modulo de arquitectura k2_horizon |
| Otras alternativas abliterated de ~7-8B | no disponible | no disponible | no disponible | no disponible | No se dispone de datos verificados en la informacion proporcionada |

No se dispone de datos de rendimiento comparado que permitan situar este modelo frente a alternativas de su categoria.

## Limitaciones y advertencias

- El modelo es abliterated: se ha eliminado el comportamiento de rechazo. Esto implica riesgo de generar contenido danino, ilegal o sensible sin filtro previo, y traslada toda la responsabilidad de uso al operador.
- La propia model card advierte de que la abliteracion no deshace el entrenamiento de seguridad; solo elimina la conducta observable de negativa.
- Riesgo de alucinacion: inherente a los modelos generativos de esta escala y no cuantificado en la informacion disponible. La model card no aporta tasas de error ni evaluaciones.
- Cobertura idiomatica limitada a ingles y chino. El rendimiento en castellano no esta documentado y no deberia asumirse.
- Longitud de contexto no especificada: no se puede garantizar el comportamiento en conversaciones largas ni en tareas de recuperacion sobre documentos extensos.
- Requiere `trust_remote_code=True` para cargarse, lo que implica ejecutar codigo Python del repositorio. Es un riesgo de cadena de suministro que debe evaluarse antes de usarlo en entornos de produccion.
- Dependencia exclusiva del ecosistema MLX y Apple Silicon: no hay ruta de despliegue soportada hacia servidores NVIDIA, lo que limita su uso en infraestructura cloud convencional.
- No se han publicado evaluaciones de sesgo, toxicidad ni robustez para esta variante.
- El nombre comercial indica "7B" pero el conteo real de parametros es de aproximadamente 9B; conviene tenerlo en cuenta al estimar memoria y coste.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: no hay validacion comunitaria ni evidencia de uso en produccion.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Avicennasis/K2-Horizon-7B-heretic-mlx-8bit
- Modelo base: https://huggingface.co/Avicennasis/K2-Horizon-7B-heretic
- Issue de mlx-lm sobre la arquitectura k2_horizon: https://github.com/ml-explore/mlx-lm/issues/1876
- No se han encontrado otros enlaces relevantes (papers, blogs, repos o demos) en la busqueda web realizada; los resultados devueltos no guardan relacion con el modelo.
