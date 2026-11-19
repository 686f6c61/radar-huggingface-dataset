# nerun/Triumvirate-Qwopus-MiMo-Ornith-9B-Coder.i1-MTP-GGUF

## Resumen

Triumvirate-Qwopus-MiMo-Ornith-9B-Coder.i1-MTP es una distribucion en GGUF de un modelo de lenguaje de 9B parametros basado en Qwen3.5, orientado a generacion de codigo y flujos agenticos. El modelo original es un merge (Triumvirate-Qwopus-MiMo-Ornith-9B-Coder) cuantizado con imatrix por mradermacher; esta version, publicada por el usuario nerun, anade un bloque MTP (Multi-Token Prediction) embebido que habilita decodificacion especulativa nativa en llama.cpp mediante `--spec-type draft-mtp`.

La innovacion principal no esta en los pesos del modelo base, sino en la ingenieria de empaquetado: el bloque MTP (`blk.32.*`) se ha trasplantado tensor a tensor, sin entrenamiento adicional, desde un fichero MTP-only extraido del Qwen3.5-9B original. Al compartir `token_embd` y `output` con el modelo principal, el coste en VRAM del cabezal de borrador es marginal (unos 0,2 GiB adicionales), evitando cargar un modelo draft separado.

El resultado es un unico fichero GGUF que sirve tanto de modelo principal como de borrador especulativo, con tasas de aceptacion reportadas de aproximadamente 0,6-0,7 en pruebas del autor. El repositorio ocupa 115,7 GB e incluye 24 cuantizaciones desde IQ1_S (2,7 GiB) hasta Q6_K (7,1 GiB), ademas de proyectores de vision (mmproj) heredados de Qwen3.5-9B. La licencia es Apache 2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso basado en Qwen3.5, con bloque MTP embebido para decodificacion especulativa |
| Parametros totales | 9B (nominal); 456.010.480 segun safetensors del repo (dato no coherente con el nombre, probablemente parcial) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (el ejemplo de uso sugiere `-fitc 32768`) |
| Tipos de cuantizacion | IQ1_S, IQ1_M, IQ2_XXS, IQ2_XS, IQ2_S, IQ2_M, Q2_K_S, Q2_K, IQ3_XXS, IQ3_XS, Q3_K_S, IQ3_S, IQ3_M, Q3_K_M, Q3_K_L, IQ4_XS, Q4_0, Q4_K_S, IQ4_NL, Q4_K_M, Q4_1, Q5_K_S, Q5_K_M, Q6_K (MTP en Q4_K_M o Q5_K_M segun fichero) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (con bloque MTP embebido y proyectores mmproj separados) |

## Arquitectura y entrenamiento

El modelo base es un transformer denso derivado de Qwen3.5-9B, sometido a un proceso de merge (Triumvirate-Qwopus-MiMo-Ornith) que combina pesos de varios modelos especializados, con enfasis declarado en codigo y uso agentico. Sobre esa base, mradermacher genero cuantizaciones i1 (imatrix) en formato GGUF. No se dispone de informacion sobre el volumen de tokens de entrenamiento, la composicion del dataset ni si hubo fases de RLHF o DPO en el modelo original.

La contribucion tecnica de este repositorio es el trasplante del bloque MTP: se copian los tensores `blk.32.*` desde a4lg/Qwen3.5-9B-MTP-ONLY-GGUF (a su vez extraidos de Qwen/Qwen3.5-9B) al GGUF cuantizado, siguiendo el "Method 2" del README de a4lg y usando el script `convert.py` de @buzz. No hay entrenamiento ni ajuste fino: el cabezal MTP fue entrenado originalmente sobre Qwen3.5-9B, no sobre este merge, por lo que la aceptacion del borrador (~0,6-0,7) es razonable pero no optima. El bloque MTP comparte embeddings de entrada y capa de salida con el modelo principal, lo que explica su bajo coste adicional en disco y VRAM.

## Capacidades

- Generacion de texto conversacional y razonamiento (tags `conversational`, `reasoning`).
- Generacion de codigo y asistencia en tareas de programacion (tag `code`).
- Flujos agenticos y multi-step (tag `agentic`).
- Decodificacion especulativa integrada via MTP, con aceleracion de inferencia en llama.cpp.
- Soporte de vision a traves de proyectores mmproj incluidos (heredados de Qwen3.5-9B, no entrenados con este merge).
- Compatibilidad con tool calling / function calling: no confirmado explicitamente en la informacion disponible, aunque el tag `agentic` lo sugiere.
- Capacidades multilingues: no disponible.

## Casos de uso

- Asistente de codigo en local: el modelo puede desplegarse en estaciones de trabajo con GPU consumer usando cuantizaciones Q4_K_M (5,4 GiB) y aprovechar el MTP embebido para reducir latencia en autocompletado y generacion de parrafos de codigo.
- Agentes de refactorizacion multi-paso: el tag `agentic` y la ventana de contexto configurable (hasta 32K en el ejemplo del autor) permiten encadenar lecturas de ficheros, ediciones y verificaciones dentro de un mismo contexto.
- Servidor de inferencia ligero con llama-server: el uso documentado con `-ngl auto -fa on -ctk q8_0 -ctv q8_0` y `--spec-type draft-mtp` esta pensado para servir peticiones concurrentes en una sola GPU con VRAM limitada.
- Prototipado en equipos con 8 GB de VRAM: el autor reporta funcionamiento estable en 8 GB con `-ub 512`; util para pruebas de pipelines agenticos antes de escalar a hardware mayor.
- Descripcion de imagenes en pipelines ligeros: los proyectores mmproj permiten entrada multimodal, aunque con precision reducida al no haberse entrenado con los pesos del merge.
- Evaluacion de tecnicas de decodificacion especulativa: el repositorio sirve como caso de estudio reproducible de trasplante de cabezales MTP entre modelos de la misma familia, util para investigadores que estudien aceleracion de inferencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks (MMLU, HumanEval, GSM8K u otros) en la informacion disponible. El unico dato de rendimiento reportado por el autor es cualitativo y especifico de la decodificacion especulativa: tasa de aceptacion del borrador MTP de aproximadamente 0,6-0,7, y observacion de que `--spec-draft-n-max 2` rinde mejor que 3 (valor por defecto), mientras que 1 o valores de 4 en adelante resultan mas lentos. Tambien se reporta que con `-ub 1024` o superior en 8 GB de VRAM la generacion con MTP cae a unas 22 t/s.

## Requisitos de hardware

- VRAM estimada para inferencia: desde ~2,9 GB (IQ1_S) hasta ~7,6 GB (Q6_K) solo para pesos; anadir overhead de contexto KV cache (con `-ctk q8_0 -ctv q8_0` y 32K de contexto el consumo crece de forma apreciable).
- El bloque MTP anade aproximadamente 0,2 GiB respecto al GGUF original de la misma cuantizacion.
- GPU recomendadas: cualquier GPU consumer con 8 GB o mas (RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070, RTX 4080, RTX 4090) para cuantizaciones Q4-Q5; A100/H100 no son necesarias para un modelo de 9B, pero permiten mayor concurrencia y contextos mas largos.
- Cabe en GPU consumer: si, incluso en 8 GB con cuantizaciones Q2-Q4 y micro-batch por defecto (`-ub 512`).
- Opciones de despliegue: llama.cpp (llama-server) es el unico backend documentado que soporta `--spec-type draft-mtp`; Ollama y vLLM no estan confirmados en la informacion disponible.
- Latencia y throughput: no se publican cifras absolutas de t/s; solo la referencia de ~22 t/s en un escenario degradado con 8 GB y micro-batch grande.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Triumvirate-Qwopus-MiMo-Ornith-9B-Coder.i1-MTP (este) | 9B | no disponible | Apache 2.0 | GGUF con MTP embebido | Decodificacion especulativa integrada; vision via mmproj heredado |
| mradermacher/Triumvirate-Qwopus-MiMo-Ornith-9B-Coder-i1-GGUF | 9B | no disponible | Apache 2.0 | GGUF (sin MTP) | Modelo base de este repo; requiere draft separado para especulacion |
| a4lg/Qwen3.5-9B-MTP-ONLY-GGUF | 9B | no disponible | no disponible | GGUF (solo bloque MTP) | Donante del cabezal MTP; no es un modelo completo |
| Qwen/Qwen3.5-9B | 9B | no disponible | no disponible | safetensors | Modelo original del que derivan los tensores MTP |

## Limitaciones y advertencias

- El cabezal MTP fue entrenado sobre Qwen3.5-9B, no sobre este merge; la tasa de aceptacion (~0,6-0,7) es inferior a la de un draft especifico del modelo, por lo que la aceleracion es moderada.
- Los proyectores de vision (mmproj) provienen de Qwen3.5-9B y nunca se entrenaron con los pesos del merge; las descripciones de imagenes pueden ser menos precisas.
- El dato de parametros totales en safetensors (456.010.480) no concuerda con el nombre del modelo (9B); probablemente sea un recuento parcial del repo, conviene no usarlo como referencia.
- No se dispone de informacion sobre sesgos, idiomas soportados ni evaluaciones de alucinacion; el modelo base es un merge sin model card detallada accesible en la informacion proporcionada.
- Requiere una build de llama.cpp con soporte de `--spec-type draft-mtp`; versiones sin esta funcionalidad no aprovecharan el bloque embebido.
- En GPUs de 8 GB, aumentar `-ub` por encima de 512 degrada gravemente el rendimiento con MTP (~22 t/s reportados).
- Aunque la licencia es Apache 2.0, el modelo base es un merge de terceros cuyos componentes originales pueden tener condiciones adicionales; conviene revisar las licencias de Qwen3.5-9B y de los modelos fusionados antes de uso comercial.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/nerun/Triumvirate-Qwopus-MiMo-Ornith-9B-Coder.i1-MTP-GGUF
- Modelo base cuantizado: https://huggingface.co/mradermacher/Triumvirate-Qwopus-MiMo-Ornith-9B-Coder-i1-GGUF
- Donante del bloque MTP: https://huggingface.co/a4lg/Qwen3.5-9B-MTP-ONLY-GGUF
- Modelo original Qwen3.5-9B: https://huggingface.co/Qwen/Qwen3.5-9B
- Proyectores de vision: https://huggingface.co/mradermacher/Qwen3.5-9B-GGUF
- Script de trasplante (convert.py de @buzz): https://gist.github.com/buzz/1c439684d5e3f36492ae9f64ef7e3f67
- Perfil de GitHub de @buzz: https://github.com/buzz
