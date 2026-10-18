# burner22/numbat

## Resumen

`burner22/numbat` es un checkpoint de pesos publicado en HuggingFace por el usuario `burner22`. Segun la model card, se trata de un modelo de ~15 billones de parametros (15T), 114 capas, con arquitectura hibrida de Gated DeltaNet (GDN) y Multi-head Latent Attention (MLA), capas de mezcla de expertos (1.224 expertos, top-48 + 1 compartido) y prediccion multi-token (MTP). El checkpoint esta almacenado en formato NVFP4 y distribuido en 842 shards de safetensors que, segun el indice, suman 8.416.101.444.920 bytes (~8,42 TB).

El autor afirma que se trata de una copia de evaluacion extraida a mitad de preentrenamiento (paso 1.830.000 de ~1,96M) de una supuesta ejecucion de entrenamiento interna de Anthropic con nombre en clave `numbat`. Esta atribucion no es verificable con la informacion disponible: la unica "evidencia" citada es una filtracion de codigo fuente de Claude Code de marzo de 2026, y el propio autor declina explicar como obtuvo los pesos. No hay resultados de evaluacion publicados, ni licencia, ni pipeline declarado, y el repositorio acumula 0 descargas y 0 likes.

La relevancia practica del artefacto es, por tanto, limitada y fundamentalmente documental: incluye una implementacion de referencia completa (`modeling_numbat.py`, `configuration_numbat.py`) que, segun el autor, permite cargar el checkpoint con `load_state_dict(strict=True)`, ademas de `tokenizer.json` (BPE byte-level de 131.072 tokens) y un volcado del log de entrenamiento. Cualquier uso en produccion esta bloqueado de entrada por la ausencia de licencia y de post-entrenamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer hibrido GDN (Gated DeltaNet) + MLA (Multi-head Latent Attention) con capas MoE y cabecera MTP |
| Parametros totales | ~15T (dato declarado por el autor; no verificado de forma independiente) |
| Parametros activos | no disponible (MoE con 1.224 expertos, top-48 + 1 compartido; el autor no publica el reparto exacto ni el tamano por experto) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | NVFP4 (payload E2M1 con bloques de escala E4M3); no se ofrecen GGUF, AWQ ni GPTQ |
| Idiomas soportados | no disponible |
| Licencia | no disponible (no se declara licencia en el repositorio) |
| Formato de pesos | safetensors, 842 shards de menos de 10,6 GB cada uno; `model.safetensors.index.json` con `total_size` = 8.416.101.444.920 bytes |
| Capas | 114 |
| Tokenizer | BPE byte-level, 131.072 tokens |
| Tamano del repo en HuggingFace | 101,0 GB en el momento de la consulta (no coincide con los ~8,42 TB declarados: solo estaria subida una fraccion de los shards) |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

La arquitectura descrita combina dos mecanismos de atencion/mezcla secuencial: capas Gated DeltaNet, un modelo de estado recurrente con compuertas que sustituye a la atencion completa en parte del stack, y capas MLA (Multi-head Latent Attention), la atencion con compresion de KV en espacio latente popularizada por DeepSeek-V2/V3. El bloque feed-forward es de tipo MoE con 1.224 expertos, enrutando 48 por token mas un experto compartido siempre activo; el ratio top-48/1.224 (~3,9 %) es notablemente alto en comparacion con MoE publicos de escala similar. Se anade una capa de Multi-Token Prediction (MTP), expuesta como `NumbatForCausalLM.draft`, lo que habilita decodificacion especulativa con cabecera propia.

No hay informacion sobre volumen de tokens de entrenamiento, composicion del dataset, ni sobre procesos de alineacion. El autor es explicito: es un checkpoint de preentrenamiento puro en el paso 1.830.000 de ~1,96M, sin post-entrenamiento ni RLHF, y la salida esperada es texto crudo de completado. La cuantizacion a NVFP4 se presenta como una decision de infraestructura: el equipo de evaluacion (segun el autor) cuantiza cada checkpoint asincrono para ejecutar evaluaciones en un segmento de Trainium2 en lugar del cluster completo, y afirma que hacen falta ~85 chips solo para alojar los pesos. Los pesos BF16 originales y el estado del optimizador, segun la model card, nunca salen del cluster.

## Capacidades

- Generacion de texto autoregresiva como modelo base de preentrenamiento: completa secuencias, no sigue instrucciones ni mantiene formato conversacional de forma fiable.
- Prediccion multi-token mediante la capa MTP expuesta en `NumbatForCausalLM.draft`, utilizable para decodificacion especulativa.
- Carga de la implementacion de referencia con `AutoModelForCausalLM.from_pretrained(..., trust_remote_code=True)` o mediante `load_state_dict(strict=True)`.
- Tokenizacion multilingue potencial via vocabulario BPE de 131.072 tokens; la cobertura real de idiomas no esta documentada.
- Tool calling / function calling: no disponible (sin post-entrenamiento no hay soporte fiable de formato de herramientas).
- Comportamiento agentico y razonamiento multi-paso: no disponible.
- Vision, audio, thinking mode: no disponibles; la model card no menciona ninguna modalidad adicional.

## Casos de uso

- Investigacion de arquitecturas hibridas: cargar `modeling_numbat.py` como referencia ejecutable para estudiar la interaccion entre capas GDN y MLA en un stack de 114 capas, comparando curvas de perplejidad con implementaciones propias.
- Estudio de enrutamiento MoE a gran escala: analizar la distribucion de activaciones sobre 1.224 expertos con top-48 para investigar colapso de expertos, balanceo de carga y sensibilidad del router, usando los tensores del checkpoint como objeto de analisis estadistico.
- Validacion de pipelines de cuantizacion NVFP4: el checkpoint sirve como banco de pruebas de decodificacion de bloques E4M3/E2M1 y comprobacion de round-trip, tal y como sugiere el propio autor.
- Reproduccion de decodificacion especulativa: usar la cabecera MTP (`draft`) frente al tronco (`forward`) para medir tasas de aceptacion y speedup en un escenario controlado.
- Auditoria de artefactos publicados: verificar la consistencia entre `model.safetensors.index.json`, el numero de shards y el tamano del repositorio, util en trabajos de trazabilidad y deteccion de repositorios incompletos o mal etiquetados.
- Docencia sobre formatos de pesos: ilustrar en un curso la diferencia entre bytes declarados en un indice (8,42 TB) y bytes realmente alojados (101 GB), y las implicaciones para la reproducibilidad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card menciona que `ckpt_metadata.json` contiene "eval harness output", pero no se reproduce ninguna cifra de MMLU, HumanEval, GSM8K ni de ninguna otra tarea, y el checkpoint esta a mitad de preentrenamiento, por lo que los resultados serian en cualquier caso preliminares.

## Requisitos de hardware

- VRAM estimada para inferencia: al menos ~8,42 TB de memoria de acelerador solo para los pesos en NVFP4, segun el `total_size` del indice. No hay margen para cache KV ni activaciones dentro de esa cifra, por lo que el requisito real es superior.
- GPU recomendadas: no disponible. El autor menciona exclusivamente Trainium2 (afirma que hacen falta ~85 chips solo para sostener los pesos). Para hardware NVIDIA, NVFP4 requiere generacion Blackwell para aceleracion nativa; en generaciones anteriores habria que decodificar el formato por software.
- Consumer GPU: no cabe. Ni siquiera en configuraciones multi-GPU de 4x RTX 4090 (96 GB) ni en un nodo de 8x H100 80 GB (~640 GB). Como referencia aritmetica, 8,42 TB / 80 GB exige del orden de 105 aceleradores H100 solo para los pesos, sin margen para nada mas.
- Opciones de despliegue: no disponible. No hay soporte en vLLM, llama.cpp, Ollama ni TGI; el unico camino documentado es la implementacion de referencia en PyTorch con `trust_remote_code=True`.
- Latencia y throughput: no disponible.
- Nota de viabilidad: con 101 GB efectivamente subidos frente a los ~8,42 TB declarados, el checkpoint disponible publicamente no es cargable de forma completa en el momento de la consulta.

## Comparativa con modelos similares

No existe una categoria publica directamente comparable: no hay modelos abiertos de ~15T parametros con pesos descargables. Se incluyen como referencia modelos MoE abiertos de escala inferior con arquitecturas parcialmente solapadas (atencion latente, MoE de grano fino), usando datos publicos de sus respectivas fichas.

| Modelo | Parametros totales | Parametros activos | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| numbat (burner22) | ~15T (declarado) | no disponible | no disponible | no disponible | Repositorio incompleto (101 GB de ~8,42 TB), 0 descargas |
| DeepSeek-V3 | 671B | 37B | 128K | MIT | Pesos abiertos en HuggingFace |
| Qwen3-235B-A22B | 235B | 22B | 128K (extensible) | Apache 2.0 | Pesos abiertos en HuggingFace |
| Llama 4 Maverick | 400B | 17B | hasta 1M (declarado) | Llama 4 Community License | Pesos abiertos con aceptacion de licencia |

La diferencia de escala es de mas de un orden de magnitud, y la de madurez es mayor: los tres modelos de referencia cuentan con post-entrenamiento, evaluaciones publicadas y licencias explicitas, mientras que `numbat` no ofrece ninguna de las tres cosas.

## Limitaciones y advertencias

- Procedencia no verificable: la atribucion a Anthropic se sostiene unicamente en afirmaciones del autor y en una supuesta filtracion de codigo fuente. No hay confirmacion independiente, y el autor rechaza explicar el origen de los pesos.
- Licencia ausente: sin licencia declarada no existe autorizacion de uso, copia ni redistribucion, ni siquiera para uso no comercial. Uso en produccion desaconsejado de forma absoluta.
- Riesgo legal relevante: si la procedencia declarada fuese cierta, la redistribucion de pesos internos de un tercero constituiria una infraccion de propiedad intelectual y posiblemente de secretos comerciales.
- Modelo sin alinear: al no haber post-entrenamiento ni RLHF, la salida es completado crudo de preentrenamiento; no sigue instrucciones, no respeta formatos y reproduciria sesgos y contenido de la web a gran escala sin filtro.
- Alucinacion: inherente a un modelo base sin calibracion; no hay datos de evaluacion que permitan acotar la tasa.
- Contexto e idiomas desconocidos: no se publica longitud de ventana ni cobertura linguistica, lo que impide planificar cualquier integracion.
- Repositorio incompleto: 101 GB alojados frente a 8,42 TB declarados en el indice; `load_state_dict(strict=True)` fallara con los ficheros actualmente disponibles.
- Requisito de `trust_remote_code=True`: obliga a ejecutar codigo Python del autor (`modeling_numbat.py`, `configuration_numbat.py`) sin auditoria, lo que constituye un riesgo de seguridad en entornos de produccion.
- Formato NVFP4 sin ecosistema: sin soporte en las herramientas de inferencia habituales, el despliegue exigiria desarrollo propio de kernels.
- Incoherencia de fechas: la ficha indica creacion el 2026-10-18, posterior a la ventana temporal de las fuentes citadas; conviene contrastar la cronologia antes de citar el artefacto.
- Sin senales de adopcion: 0 descargas y 0 likes, sin discusion ni issues que permitan validacion por terceros.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/burner22/numbat
- Implementacion de referencia: `modeling_numbat.py` y `configuration_numbat.py` dentro del repositorio
- Configuracion: `config.json` (`NumbatConfig`) e indice de tensores `model.safetensors.index.json`
- Metadatos del checkpoint: `ckpt_metadata.json` (ruta de checkpoint y salida del harness de evaluacion)
- Log de entrenamiento: `training_log_tail.txt` (~400 ultimos pasos)
- Paper, blog, demo o repositorio adicional: no disponible. La busqueda web realizada no devolvio ningun resultado relacionado con el modelo; los resultados obtenidos trataban sobre calderas de lecho fluidizado, tarjetas CFB, terminologia de comercio internacional y arquitecturas de computacion, sin ninguna conexion con `numbat`.
