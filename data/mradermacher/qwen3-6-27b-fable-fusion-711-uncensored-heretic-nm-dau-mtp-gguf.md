# mradermacher/Qwen3.6-27B-Fable-Fusion-711-Uncensored-Heretic-NM-DAU-MTP-GGUF

## Resumen

Qwen3.6-27B-Fable-Fusion-711-Uncensored-Heretic-NM-DAU-MTP-GGUF es la distribucion en formato GGUF de un modelo de lenguaje de 27.320 millones de parametros derivado de la familia Qwen 3.6 y publicado por el usuario DavidAU. El modelo original ha sido sometido a un proceso de ajuste fino multi-etapa y fusion de estados (multi-stage tune, multi-state merge) con el objetivo declarado de eliminar los mecanismos de rechazo y moderacion (etiquetas heretic, uncensored, abliterated), y orientar el modelo hacia generacion creativa, escritura de ficcion, roleplay y razonamiento con modo thinking. El repositorio que nos ocupa, mantenido por mradermacher, no entrena el modelo sino que ofrece cuantizaciones estaticas en GGUF para su uso con llama.cpp y derivados.

La relevancia de esta ficha radica en que permite ejecutar un modelo de ~27B en hardware de consumo mediante cuantizaciones de 11 a 29 GB, manteniendo un rango amplio de idiomas (16 lenguajes declarados, incluido el castellano) y capacidades de razonamiento y codigo. La licencia declarada es Apache 2.0, aunque el modelo base es un derivado de Qwen y conviene verificar las condiciones de la cadena de derivacion antes de un uso comercial.

No se dispone de informacion publica sobre arquitectura interna detallada, longitud de contexto, composicion del dataset de entrenamiento ni resultados de benchmarks en la informacion proporcionada; los apartados correspondientes lo indican explicitamente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Qwen 3.6); detalles internos no disponibles |
| Parametros totales | 27.320.697.856 (~27,3 B) |
| Parametros activos | no disponible (no se declara como MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0 (estaticas); variantes imatrix en repositorio i1 |
| Idiomas soportados | ar, zh, en, fr, de, hi, id, it, ja, ko, pl, pt, ru, es, th, vi |
| Licencia | Apache 2.0 (declarada en el repositorio) |
| Formato de pesos | GGUF; el modelo base se distribuye en bfloat16 (safetensors) |
| Tamano del repositorio | 189,2 GB |
| Pipeline | no disponible |

## Arquitectura y entrenamiento

El modelo original es un transformer decoder-only de la familia Qwen 3.6 con 27,3 mil millones de parametros. Segun las etiquetas del autor, se ha construido mediante ajuste fino multi-etapa (multi-stage tune) y fusion de multiples estados del modelo (multi-state merge), partiendo del checkpoint DavidAU/Qwen3.6-27B-Fable-Fusion-711-Uncensored-Heretic-NM-DAU-MTP. El proceso incluye una fase de "abliteration" o "heretic" destinada a reducir la tendencia al rechazo de peticiones, y se apoya en los datasets propietarios Polar-STRICT-Datasets y F451-STRICT-Datasets, ambos del mismo autor.

No se especifica el numero de tokens de entrenamiento, la composicion exacta del dataset, ni si se emplearon tecnicas de RLHF, DPO o preferencias. Tampoco se documentan innovaciones arquitectonicas propias (atencion lineal, decodificacion especulativa, SSM hibrido, etc.). El repositorio GGUF es una conversion estatica (quantize_version 2, convert_type hf) sin tensor de proyeccion multimodal (skip_mmproj: 1), lo que sugiere que el modelo base no incorpora vision o que esta no se conserva en la cuantizacion.

## Capacidades

- Generacion de texto general y conversacional multi-turno.
- Razonamiento explicito con modo thinking (etiqueta thinking/reasoning).
- Generacion de codigo y asistencia a programacion (etiqueta coder).
- Escritura creativa: ficcion, relatos, todos los generos y roleplay.
- Capacidades multilingues en 16 idiomas, incluidos castellano, ingles, chino, arabe, hindi, japones, coreano, ruso y portugues.
- Comportamiento "uncensored"/"abliterated": menor probabilidad de rechazar peticiones por politicas de contenido.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no documentado explicitamente; el modo thinking puede habilitar cadenas de razonamiento.
- Capacidades de vision o audio: no disponibles (skip_mmproj en la conversion).

## Casos de uso

- Escritura creativa y ficcion asistida: el modelo esta afinado especificamente para relatos, generos diversos y narrativa larga; se usaria como generador de borradores y continuaciones en herramientas de escritura.
- Roleplay y narrativa interactiva: su orientacion a roleplay y la ausencia de rechazos lo hacen adecuado para motores de personajes y simulaciones conversacionales.
- Asistencia a programacion en local: con la etiqueta coder y cuantizaciones Q4_K_M (~17 GB), puede integrarse en editores o pipelines de CI/CD en maquinas con GPU de 24 GB.
- Razonamiento con cadena de pensamiento: el modo thinking permite usarlo en tareas de analisis, planificacion y resolucion de problemas donde interesa exponer el razonamiento intermedio.
- Atencion al cliente y conversacion multi-turno: sus 16 idiomas y su naturaleza conversacional permiten desplegar asistentes en varios mercados; la longitud de contexto debe validarse empiricamente al no estar documentada.
- Procesamiento multilingue en local: traduccion, resumen y generacion en castellano, portugues, frances, aleman, arabe, hindi y lenguas asiaticas sin depender de APIs externas.
- Experimentacion en investigacion sobre alineacion y seguridad: al ser un modelo "abliterated", sirve como objeto de estudio para medir como la eliminacion de rechazos afecta a la utilidad y a los sesgos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada segun cuantizacion: Q2_K ~11 GB, Q3_K_M ~13,6 GB, IQ4_XS ~15,5 GB, Q4_K_M ~16,9 GB, Q5_K_M ~19,6 GB, Q6_K ~22,5 GB, Q8_0 ~29,1 GB (tamanos de fichero; la VRAM efectiva debe sumar margen para contexto KV).
- GPU recomendadas: RTX 4090 (24 GB) para Q4_K_M y Q5_K_M con contexto moderado; RTX 3090 (24 GB) equivalente; A100 40/80 GB o H100 para Q8_0 y contextos largos; configuraciones multi-GPU para el modelo en bfloat16 (~55 GB de pesos).
- Cabe en GPU de consumo: si, en RTX 4090/3090 con cuantizaciones Q4 y Q5; en GPUs de 16 GB solo con Q2_K o Q3 y contexto reducido; en GPUs de 12 GB no es viable con calidad aceptable.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, text-generation-webui, y servidores compatibles con GGUF; el modelo base en safetensors puede servirse con vLLM o TGI si se dispone de VRAM suficiente.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Qwen3.6-27B-Fable-Fusion-711-Uncensored-Heretic (este) | 27,3 B | no disponible | Apache 2.0 | GGUF, bfloat16 | Ajuste multi-etapa, uncensored, 16 idiomas |
| Modelo base DavidAU/Qwen3.6-27B-Fable-Fusion-711-Uncensored-Heretic-NM-DAU-MTP | 27,3 B | no disponible | Apache 2.0 | safetensors (bfloat16) | Checkpoint sin cuantizar del que deriva este repositorio |
| Qwen 3.6 27B original (familia) | ~27 B | no disponible | no disponible en esta ficha | safetensors | Modelo de referencia sin abliteration; datos no verificados aqui |

No se dispone de datos de benchmarks ni de especificaciones verificadas de modelos alternativos en la informacion proporcionada, por lo que la comparacion cuantitativa de rendimiento no esta disponible.

## Limitaciones y advertencias

- El modelo ha sido "abliterated"/"uncensored": reduce los rechazos, lo que implica mayor riesgo de generar contenido ofensivo, ilegal o inseguro sin filtros. No es adecuado para despliegues publicos sin moderacion adicional.
- Riesgo de alucinacion no cuantificado: no hay benchmarks publicados que permitan estimar su fiabilidad factual.
- Longitud de contexto no documentada: no se puede garantizar el rendimiento en conversaciones o documentos largos sin pruebas propias.
- Cadena de derivacion: aunque la licencia declarada es Apache 2.0, el modelo deriva de Qwen 3.6; conviene revisar las condiciones de la licencia del modelo base y de los datasets Polar-STRICT y F451 antes de uso comercial.
- El autor del ajuste fino y los datasets es un particular (DavidAU), no el equipo oficial de Qwen; la calidad y la reproducibilidad del entrenamiento no estan auditadas.
- La cuantizacion introduce perdida de calidad, especialmente en Q2_K y Q3_K_M (marcada como "lower quality" por el propio autor).
- No se documentan capacidades de tool calling ni de agentes; no asumir su disponibilidad en produccion.
- Idiomas: aunque se declaran 16, no hay evaluaciones por idioma; el rendimiento en castellano puede diferir del ingles.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/Qwen3.6-27B-Fable-Fusion-711-Uncensored-Heretic-NM-DAU-MTP-GGUF
- Modelo base: https://huggingface.co/DavidAU/Qwen3.6-27B-Fable-Fusion-711-Uncensored-Heretic-NM-DAU-MTP
- Cuantizaciones imatrix (i1): https://huggingface.co/mradermacher/Qwen3.6-27B-Fable-Fusion-711-Uncensored-Heretic-NM-DAU-MTP-i1-GGUF
- Pagina de descargas del autor de las cuantizaciones: https://hf.tst.eu/model#Qwen3.6-27B-Fable-Fusion-711-Uncensored-Heretic-NM-DAU-MTP-GGUF
- Guia de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Peticiones de cuantizacion: https://huggingface.co/mradermacher/model_requests
- Analisis de tipos de cuantizacion (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Dataset Polar-STRICT: https://huggingface.co/datasets/DavidAU/Polar-STRICT-Datasets
- Dataset F451-STRICT: https://huggingface.co/datasets/DavidAU/F451-STRICT-Datasets
