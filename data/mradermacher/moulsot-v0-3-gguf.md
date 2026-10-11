# mradermacher/moulsot.v0.3-GGUF

## Resumen

MoulSot v0.3 es un modelo de reconocimiento automatico del habla (ASR) desarrollado por Atlasia para dariya marroqui, disenado para transcribir habla real con code-switching frecuente entre dariya, arabe estandar y frances. El modelo original (atlasia/moulsot.v0.3, aproximadamente 1.720 millones de parametros) esta entrenado sobre el corpus curado MoulSot-Full y se distribuye bajo licencia Apache 2.0. La ficha que se analiza aqui corresponde a la version cuantizada en GGUF publicada por mradermacher, que no aporta pesos nuevos sino conversiones del modelo base para su ejecucion en runtime orientados a CPU y GPU de consumo.

La relevancia de esta publicacion es practica: el dariya marroqui es un idioma con recursos escasos y una fuerte variacion dialectal, y la mayoria de los sistemas ASR comerciales lo cubren de forma deficitaria. Un modelo abierto de ~1,7 B de parametros, con licencia permisiva y cuantizaciones que caben en 1-3 GB de disco, permite desplegar transcripcion local en entornos con GPU modesta o incluso solo CPU, sin enviar audio a servicios externos.

Tecnicamente, la arquitectura registrada para el modelo base es qwen3_asr_text (una pila ASR construida sobre la familia Qwen3), con ficheros mmproj separados que actuan como suplemento multimodal para el codificador de audio en llama.cpp. El repositorio GGUF ocupa 17,0 GB en total pero cada cuantizacion individual ocupa entre 0,9 GB (Q2_K) y 3,5 GB (f16). En el momento de redactar esta ficha no se han publicado resultados de benchmarks ni detalles de composicion del dataset de entrenamiento en la informacion disponible.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | qwen3_asr_text (pila ASR basada en Qwen3, con codificador de audio y proyector multimodal mmproj) |
| Parametros totales | 1.720.574.976 (≈1,72 B) |
| Parametros activos | no procede (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16; ademas mmproj-Q8_0 y mmproj-f16 |
| Idiomas soportados | ary (dariya marroqui), ar (arabe); la model card del modelo base menciona tambien code-switching con frances |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (el modelo base publica pesos en safetensors para transformers) |

## Arquitectura y entrenamiento

La arquitectura del modelo base se identifica como qwen3_asr_text, es decir, una pila de reconocimiento de voz apoyada en la familia Qwen3: un codificador de audio acoplado a un decodificador de tipo transformer que genera la transcripcion como texto. En el paquete GGUF, el componente de audio se distribuye por separado en los ficheros mmproj (multi-modal projection), que en llama.cpp se encargan de proyectar las representaciones del codificador acustico al espacio de embeddings del decodificador. Los quants principales contienen unicamente el decodificador de texto; sin cargar el mmproj correspondiente, el modelo no puede procesar audio.

Sobre el entrenamiento, la unica informacion disponible es que el modelo base fue entrenado por Atlasia sobre el dataset atlasia/MoulSot-Full, descrito como un corpus grande y curado de habla marroqui, y que el objetivo declarado es la robustez ante code-switching (dariya ↔ frances ↔ arabe). No se especifican en la informacion disponible el numero de tokens de audio, la composicion del dataset, la duracion total en horas, ni si se aplicaron etapas de RLHF, DPO o ajuste por preferencias. Esta publicacion concreta es una conversion estatica a GGUF realizada por mradermacher; el autor indica que no ha generado cuantizaciones ponderadas ni con matriz de importancia (imatrix) para este modelo, por lo que las cuantizaciones de baja tasa de bits pueden presentar una perdida de calidad superior a la de otros modelos con quants imatrix disponibles.

## Capacidades

- Reconocimiento automatico del habla (ASR) en dariya marroqui (ary) y arabe (ar).
- Manejo de audio con cambio de codigo entre dariya, arabe y frances, segun la descripcion del modelo base.
- Salida de transcripcion en texto generada por un decodificador de tipo transformer (arquitectura qwen3_asr_text).
- Soporte multimodal en el runtime: requiere los ficheros mmproj (Q8_0 o f16) para procesar la entrada de audio.
- Compatibilidad declarada con endpoints (etiqueta endpoints_compatible) y con la libreria transformers para el modelo base.
- Etiqueta conversational en el repositorio, que sugiere uso en flujos de conversacion, aunque no se detallan las capacidades conversacionales en la informacion disponible.
- No se documenta soporte de tool calling, function calling, agentes, vision ni modo thinking en la informacion disponible.

## Casos de uso

- Subtitulado de contenido audiovisual marroqui: series, videos de YouTube y podcasts donde los hablantes alternan dariya y frances. El modelo esta entrenado especificamente para ese fenomeno de code-switching, que es el punto donde fallan los ASR genericos.
- Transcripcion de llamadas en centros de atencion al cliente en Marruecos: el audio se procesa en local con la cuantizacion Q5_K_M o Q6_K, se obtiene el texto y se indexa para control de calidad, busqueda de incidencias y analisis de motivos de contacto, sin sacar el audio de la infraestructura propia.
- Generacion de datasets de voz para entrenamiento de otros sistemas: transcripcion masiva de grabaciones con el cuantizacion f16 o Q8_0 y posterior revision humana, aprovechando que el modelo cubre variantes dialectales que los corpus existentes no recogen.
- Anotacion asistida en investigacion linguistica: transcripcion previa de entrevistas y encuestas orales para reducir el tiempo de transcripcion manual, con la salida del modelo como borrador sujeto a correccion por el investigador.
- Dictado y entrada de voz en aplicaciones moviles o de escritorio: con la cuantizacion Q4_K_M (1,2 GB) el modelo puede empaquetarse en una aplicacion de escritorio o en un servidor modesto, ofreciendo dictado sin conexion y sin coste por minuto de API.
- Accesibilidad y subtitulado en directo para personas con discapacidad auditiva en eventos o emisiones en dariya: despliegue con llama.cpp en un equipo local, aceptando latencias propias de un modelo de 1,7 B y un decodificador de texto.
- Moderacion y busqueda de contenido en audio: transcripcion de grandes volumenes de audio para busqueda por palabras clave, deteccion de contenido sensible o cumplimiento normativo, aprovechando que el coste marginal de inferencia en local es muy bajo.
- Prototipado rapido de productos de voz en la region: usar la cuantizacion Q4_K_M o Q8_0 en una estacion de trabajo con una sola GPU para validar producto antes de escalar a hardware dedicado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del repositorio GGUF no incluye metricas de tasa de error de palabras (WER/CER), y los resultados de busqueda consultados tampoco aportan cifras comparativas con otros sistemas ASR.

## Requisitos de hardware

Las cifras de VRAM son estimaciones que suman el peso de la cuantizacion, el fichero mmproj correspondiente y un margen de overhead del runtime (contexto, buffers de audio y cache KV).

| Cuantizacion | Peso del modelo | VRAM estimada (con mmproj) | Notas |
|---|---:|---:|---|
| Q2_K | 0,9 GB | ≈2 GB | Calidad degradada; solo para pruebas |
| Q3_K_M | 1,0 GB | ≈2 GB | El propio autor lo marca como calidad inferior |
| IQ4_XS | 1,1 GB | ≈2,5 GB | Alternativa compacta a Q4_K |
| Q4_K_M | 1,2 GB | ≈2,5-3 GB | Recomendado por el autor para uso general |
| Q5_K_M | 1,4 GB | ≈3 GB | Buen equilibrio calidad/VRAM |
| Q6_K | 1,5 GB | ≈3 GB | Calidad muy buena segun el autor |
| Q8_0 | 1,9 GB | ≈3,5-4 GB | Casi sin perdida |
| f16 | 3,5 GB | ≈5 GB | Precision completa, sobredimensionado para uso normal |
| mmproj-Q8_0 | 0,5 GB | — | Suplemento multimodal obligatorio para audio |
| mmproj-f16 | 0,7 GB | — | Suplemento multimodal obligatorio para audio |

- Cabe en GPU de consumo: si, en todas las cuantizaciones. Desde una GTX 1650 de 4 GB (Q4_K_M) hasta una RTX 3060, RTX 4060, RTX 4090 o A100, donde el modelo ocupa una fraccion minima de la memoria.
- Ejecucion en CPU: viable con llama.cpp en las cuantizaciones Q4 y Q5, con throughput inferior al de GPU pero funcional para transcripcion por lotes de audio ya grabado.
- GPU recomendadas por perfil: RTX 3060 12 GB o superior para procesamiento por lotes; A100/H100 solo si se comparte con otras cargas, ya que el modelo no las aprovecha por si solo.
- Opciones de despliegue: llama.cpp (llama-server con soporte multimodal para cargar el mmproj), herramientas derivadas como koboldcpp o interfaces graficas compatibles con GGUF; tambien es posible usar el modelo base en transformers. La compatibilidad de esta arquitectura concreta con vLLM o TGI no esta confirmada en la informacion disponible.
- Latencia y throughput: no disponibles. No se han publicado mediciones de velocidad de inferencia ni de factor de tiempo real (RTF) para este modelo.

## Comparativa con modelos similares

No se dispone de una comparacion de rendimiento ASR (WER/CER) en la informacion proporcionada. La siguiente tabla compara caracteristicas estructurales conocidas de alternativas de la misma categoria; los datos de los modelos comparativos proceden de sus fichas publicas y no de la informacion proporcionada en esta busqueda, por lo que conviene verificarlos antes de citarlos.

| Modelo | Parametros | Idiomas | Licencia | Disponibilidad |
|---|---:|---|---|---|
| mradermacher/moulsot.v0.3-GGUF | ≈1,72 B | ary, ar (con code-switching a frances) | apache-2.0 | GGUF en HuggingFace |
| atlasia/moulsot.v0.3 (base) | ≈1,72 B | ary, ar (con code-switching a frances) | apache-2.0 | Safetensors en HuggingFace |
| openai/whisper-large-v3 | ≈1,55 B | Multilingue amplio | MIT | Safetensors y GGUF de terceros |
| openai/whisper-medium | ≈769 M | Multilingue amplio | MIT | Safetensors y GGUF de terceros |

La ventaja diferencial de MoulSot v0.3 frente a Whisper no es el tamano ni el catalogo de idiomas, sino la especializacion en dariya marroqui: Whisper cubre arabe estandar, pero su cobertura del dialecto marroqui y del code-switching dariya-frances es limitada. En sentido contrario, Whisper ofrece soporte multilingue general y una comunidad de herramientas mucho mayor. No se dispone de datos de WER que permitan cuantificar cual de los dos transcribe mejor en este dominio.

## Limitaciones y advertencias

- No se han publicado resultados de benchmarks ni evaluaciones de WER para este modelo en la informacion disponible, por lo que su calidad real de transcripcion no puede verificarse a priori.
- Riesgo de alucinacion tipico de los sistemas ASR: en segmentos con silencio, ruido o habla muy solapada el decodificador puede generar texto plausible pero no presente en el audio, o entrar en bucles de repeticion.
- Cobertura idiomatica restringida: el modelo esta orientado a dariya marroqui y arabe. Su comportamiento en otras variantes de arabe (golfo, egipcio, levantino) o en otros idiomas no esta documentado y no deberia asumirse.
- El code-switching con frances se menciona en la descripcion del modelo base, pero las etiquetas de idioma del repositorio solo declaran ary y ar; la calidad del frances embebido no esta garantizada.
- Sesgo de dominio: al entrenarse sobre MoulSot-Full, el modelo puede rendir peor fuera del dominio de ese corpus (telefonia, reuniones tecnicas, terminologia especializada, acentos no representados).
- Las cuantizaciones de baja tasa de bits tienen un riesgo mayor de degradacion de calidad en este caso concreto, porque el autor indica que no hay cuants ponderados ni con imatrix disponibles.
- El autor advierte explicitamente que Q3_K_M es de "calidad inferior"; Q2_K y Q3_K_S deberian reservarse para pruebas de integracion, nunca para produccion.
- Sin el fichero mmproj cargado junto con los pesos, el modelo no puede procesar audio; es un fallo de configuracion habitual en runtimes que no detectan automaticamente el proyector multimodal.
- Licencia Apache 2.0: permite uso comercial y modificacion, pero obliga a conservar los avisos de licencia y a indicar los cambios realizados. Conviene revisar si el dataset MoulSot-Full impone condiciones adicionales sobre el modelo derivado.
- Este repositorio es una cuantizacion de terceros: los problemas de calidad del modelo base se heredan y no se corrigen con la conversion a GGUF.
- Contexto, idiomas adicionales, latencia y throughput no estan documentados, lo que complica el dimensionamiento de un despliegue en produccion.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/moulsot.v0.3-GGUF
- Modelo base: https://huggingface.co/atlasia/moulsot.v0.3
- Dataset de entrenamiento: https://huggingface.co/datasets/atlasia/MoulSot-Full
- Pagina de resumen del modelo en el sitio del cuantizador: https://hf.tst.eu/model#moulsot.v0.3-GGUF
- Grafo de arquitectura del modelo base: https://hfviewer.com/atlasia/moulsot.v0.3
- Repositorio GitHub del proyecto MoulSot: https://github.com/PodJamz/moulsot-
- Listado de modelos etiquetados como moulasot: https://huggingface.co/models?other=moulasot
- Peticiones de cuantizacion de mradermacher: https://huggingface.co/mradermacher/model_requests
- Guia de uso de GGUF referenciada por el autor: https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Grafica comparativa de perplejidad por tipo de cuantizacion: https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas de Artefact2 sobre tipos de cuantizacion: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Perfil del autor en HuggingFace: https://www.aimodels.fyi/creators/huggingFace/mradermacher
