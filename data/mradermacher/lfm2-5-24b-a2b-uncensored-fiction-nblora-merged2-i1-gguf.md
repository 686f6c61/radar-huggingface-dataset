# mradermacher/LFM2.5-24B-A2B-uncensored-fiction-nblora-merged2-i1-GGUF

## Resumen

LFM2.5-24B-A2B-uncensored-fiction-nblora-merged2-i1-GGUF es una cuantizacion GGUF del modelo LFM2.5-24B-A2B, un Mixture of Experts (MoE) de 23.971.587.712 parametros totales (~24B) desarrollado originalmente por Liquid AI dentro de la familia LFM2.5. Esta version concreta ha sido publicada por el usuario mradermacher, que aplica cuantizacion con imatrix (importancia matricial) sobre un modelo previamente modificado por electroglyph: un merge de un LoRA de ficcion sin censura ("uncensored-fiction-nblora") sobre la base LFM2.5-24B-A2B. El resultado es un modelo conversacional orientado a generacion creativa sin los filtros de seguridad habituales.

El interes tecnico de esta ficha reside en tres capas: la arquitectura base MoE de Liquid AI (disenada para despliegue en el edge con pocos parametros activos), el proceso de "abliteration"/decensurado aplicado mediante LoRA y merge, y la cadena de cuantizacion GGUF con imatrix que permite ejecutar un modelo de ~24B en hardware de consumo. El repositorio ocupa 76,3 GB e incluye una amplia bateria de cuantizaciones (desde IQ1_S hasta Q6_K y Q4_0/Q4_1), lo que lo hace util para experimentacion local en distintos niveles de VRAM.

Es relevante ahora porque combina dos tendencias del ecosistema open source: los modelos MoE eficientes en inferencia (con muchos parametros totales pero pocos activos) y la comunidad de fine-tunes sin censura publicados como GGUF listos para llama.cpp. No obstante, la informacion disponible es escasa: no hay model card detallada, ni benchmarks, ni licencia explicita en este repositorio, y el modelo tiene cero descargas y cero likes en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture of Experts (MoE) transformer, familia Liquid LFM2.5 (segun nombre del modelo base) |
| Parametros totales | 23.971.587.712 (~24B) |
| Parametros activos | no disponible (el sufijo "A2B" sugiere ~2B activos, pero no se confirma en la informacion) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q2_K_S, IQ3_M, IQ3_XXS, IQ3_XS, IQ3_S, Q3_K_S, Q3_K_M, Q3_K_L, Q4_0, Q4_1, Q4_K_S, Q4_K_M, IQ4_NL (small), IQ4_XS, Q5_K_S, Q5_K_M, Q6_K, IQ2_XXS, IQ2_XS, IQ2_S, IQ2_M, IQ1_S, IQ1_M |
| Idiomas soportados | no disponible (el modelo base LFM2.5-uncensored declara 16 idiomas, pero no se confirma para este merge) |
| Licencia | no disponible en este repositorio (el modelo base LFM2.5-uncensored-i1-GGUF referencia licencia "lfm1.0") |
| Formato de pesos | GGUF (cuantizado, con imatrix y output_tensor_quantised=1) |

## Arquitectura y entrenamiento

La arquitectura subyacente es un Mixture of Experts de la familia LFM2.5 de Liquid AI, segun se deduce del nombre del modelo base. El identificador "A2B" en la nomenclatura de Liquid indica parametros activos del orden de ~2B sobre un total de ~24B, lo que encaja con el diseno de modelos MoE orientados a inferencia eficiente. No se dispone en la informacion proporcionada de detalles sobre el numero de expertos, la estrategia de routing, la longitud de contexto nativa ni la composicion del dataset de preentrenamiento.

El proceso de creacion de este artefacto tiene tres etapas identificables: (1) el modelo base LFM2.5-24B-A2B, presumiblemente con alineamiento conversacional; (2) un merge de un LoRA de ficcion sin censura ("nblora") sobre dicha base, realizado por electroglyph, que elimina o atenua los rechazos del modelo; y (3) cuantizacion GGUF con imatrix realizada por mradermacher, que genera las variantes listadas en los metadatos. Los tags del repositorio incluyen "imatrix" y "conversational", y los metadatos internos indican `quantize_version: 2`, `output_tensor_quantised: 1` y `convert_type: hf`, lo que confirma una conversion desde pesos Hugging Face a GGUF con cuantizacion de tensores de salida. No se documenta en esta ficha el uso de RLHF, DPO ni tecnicas de decodificacion especulativa.

## Capacidades

- Generacion de texto conversacional multi-turno, orientada a ficcion y narrativa creativa sin restricciones de contenido.
- Escritura creativa extensa (relatos, dialogos, continuaciones) gracias al fine-tuning especifico de ficcion.
- Reduccion de rechazos y respuestas evasivas ("uncensored"), lo que permite tematicas adultas o sensibles.
- Soporte de chat conversacional en formato GGUF compatible con llama.cpp y derivados.
- Capacidad multilingue: no confirmada para este merge; el modelo base declara 16 idiomas, pero no se verifica aqui.
- Tool calling / function calling: no disponible en la informacion.
- Modo thinking, vision o audio: no disponible en la informacion.
- Razonamiento matematico y generacion de codigo: no documentado para esta variante.

## Casos de uso

- Escritura de ficcion interactiva: el modelo puede mantener conversaciones largas generando narrativa coherente y sin autocensura, adecuado para autores que necesitan explorar tramas adultas o controvertidas sin rechazos del sistema.
- Generacion de dialogos para videojuegos o narrativa ramificada: su naturaleza conversacional y su fine-tuning de ficcion permiten producir arboles de dialogo variados en local, con cuantizaciones Q4_K_M o Q5_K_M que caben en GPUs de consumo.
- Prototipado de asistentes creativos sin filtros: util en entornos de investigacion sobre alineamiento, donde se quiere estudiar el comportamiento de un modelo decensurado frente a uno alineado.
- Role-play y simulacion de personajes: el merge de LoRA de ficcion favorece la consistencia de personajes y estilos narrativos en sesiones prolongadas.
- Experimentacion con cuantizacion extrema: la disponibilidad de variantes IQ1_S, IQ1_M e IQ2 permite probar el modelo en hardware muy limitado (por ejemplo, portatiles con 8-16 GB de RAM) a costa de calidad.
- Generacion de contenido editorial en local con privacidad: al ejecutarse via llama.cpp u Ollama, los datos no salen del equipo, lo que resulta util para manuscritos confidenciales.
- Evaluacion comparativa de tecnicas de decensurado: investigadores pueden contrastar este merge con la version base LFM2.5-24B-A2B-uncensored para medir el efecto del LoRA de ficcion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: depende de la cuantizacion. Para un modelo de ~24B en GGUF, las variantes Q4_K_M suelen ocupar en torno a 14-15 GB, Q5_K_M ~17 GB, Q6_K ~20 GB, y las variantes IQ2/IQ1 entre 7 y 10 GB aproximadamente (estimaciones orientativas; no se proporcionan tamanos por fichero en la informacion).
- GPU recomendadas: para cuantizaciones altas (Q6_K, Q5_K_M), una RTX 4090 (24 GB) o A100/H100; para Q4_K_M, una RTX 4080/4090 o RTX 3090 (24 GB) es suficiente; para IQ2/IQ3, GPUs de 12-16 GB como RTX 4070 Ti o RTX 4080.
- Cabe en GPU de consumo: si, en la mayoria de cuantizaciones Q4 y superiores en GPUs de 24 GB; en GPUs de 12-16 GB con cuantizaciones IQ2/IQ3 o mediante offload parcial a CPU.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, text-generation-webui y cualquier runtime compatible con GGUF. El tag "endpoints_compatible" sugiere compatibilidad con endpoints tipo Hugging Face Inference Endpoints.
- Latencia y throughput: no disponible. Al ser un MoE con presumiblemente ~2B parametros activos, el throughput deberia ser superior al de un denso de 24B, pero no se aportan cifras.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| LFM2.5-24B-A2B-uncensored-fiction-nblora-merged2-i1-GGUF (este) | ~24B totales (MoE) | no disponible | no disponible | GGUF | Merge de LoRA de ficcion sin censura, cuantizado con imatrix |
| LFM2.5-24B-A2B-uncensored-i1-GGUF (mradermacher) | ~24B totales (MoE) | no disponible | lfm1.0 | GGUF | Version sin censura sin el LoRA de ficcion; 16 idiomas declarados |
| LFM2.5-24B-A2B (base, Liquid AI) | ~24B totales (MoE) | no disponible | lfm1.0 (presumible) | safetensors/GGUF | Modelo original alineado, sin decensurar |

No se dispone de datos de rendimiento comparativo (benchmarks) en la informacion proporcionada para establecer diferencias cuantitativas entre estas variantes.

## Limitaciones y advertencias

- Modelo sin censura: ha sido modificado para eliminar rechazos, por lo que puede generar contenido ofensivo, sexual, violento o legalmente sensible. No es apto para produccion orientada al publico general sin moderacion adicional.
- Riesgo elevado de alucinacion: al ser un fine-tune de ficcion, puede priorizar la coherencia narrativa sobre la veracidad factual.
- Licencia no disponible en este repositorio: el modelo base referencia "lfm1.0", pero no se confirma que se aplique a este merge. Antes de uso comercial, verificar la licencia del modelo base y del LoRA original.
- Idiomas y contexto no documentados: no se confirma el soporte multilingue ni la longitud de contexto real de este merge.
- Cero descargas y cero likes: no hay evidencia de validacion por parte de la comunidad; el artefacto es muy reciente y sin pruebas publicas.
- Cuantizaciones extremas (IQ1, IQ2) degradan notablemente la calidad; usar solo si el hardware es muy limitado.
- El proceso de merge de LoRA puede introducir inestabilidades no documentadas; no se aportan evaluaciones de calidad del merge.
- Fecha de creacion futura (2026-11-06) en los metadatos: posible inconsistencia temporal que conviene verificar en el repositorio.

## Enlaces

- Repositorio Hugging Face de esta cuantizacion: https://huggingface.co/mradermacher/LFM2.5-24B-A2B-uncensored-fiction-nblora-merged2-i1-GGUF
- Modelo base del merge (electroglyph): https://huggingface.co/electroglyph/LFM2.5-24B-A2B-uncensored-fiction-nblora-merged2
- Variante sin censura sin LoRA de ficcion (mradermacher): https://huggingface.co/mradermacher/LFM2.5-24B-A2B-uncensored-i1-GGUF
- Perfil del autor de la cuantizacion: https://huggingface.co/mradermacher
