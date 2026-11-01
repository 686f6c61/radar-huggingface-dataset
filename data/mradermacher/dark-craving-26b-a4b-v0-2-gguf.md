# mradermacher/Dark-Craving-26B-A4B-v0.2-GGUF

## Resumen

Dark-Craving-26B-A4B-v0.2-GGUF es la version cuantizada en formato GGUF del modelo ReadyArt/Dark-Craving-26B-A4B-v0.2, un modelo de lenguaje de aproximadamente 25.230 millones de parametros totales orientado a conversacion, roleplay y contenido para adultos (etiquetado como NSFW, explicit y ERP por su autor). La cuantizacion la ha realizado mradermacher, un publicador habitual de versiones GGUF de modelos de la comunidad en HuggingFace, y esta pensada para su uso con llama.cpp y derivados.

El modelo base emplea una nomenclatura "26B-A4B" que sugiere una arquitectura de mezcla de expertos (MoE) con aproximadamente 4.000 millones de parametros activos por token, aunque esta informacion no se detalla en la model card disponible. El repositorio incluye pesos en safetensors (25.233.142.046 parametros reales) y una bateria de cuantizaciones GGUF desde Q2_K hasta Q8_0, ademas de ficheros mmproj para un componente multimodal.

La relevancia de esta ficha es practica: permite desplegar en hardware de consumo un modelo de ~25B con activacion reducida, algo imposible con un denso de ese tamano en cuantizaciones altas. Ahora bien, se trata de un modelo "unaligned" orientado a roleplay adulto, sin benchmarks publicados y con capacidades generales no documentadas, por lo que su evaluacion debe hacerse con cautela y fuera de entornos de produccion sensibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con mezcla de expertos (MoE) segun la nomenclatura "26B-A4B"; no confirmado en la model card |
| Parametros totales | 25.233.142.046 (~25,2B) |
| Parametros activos | ~4B (inferido de la nomenclatura "A4B"; no confirmado) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0; mmproj en Q8_0 y f16; versiones imatrix en repositorio aparte |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (modelo base) y GGUF (esta version) |

## Arquitectura y entrenamiento

La informacion disponible no detalla la arquitectura interna del modelo base mas alla de su nombre, que sugiere una configuracion MoE con unos 26.000 millones de parametros totales y aproximadamente 4.000 millones activos por token. No se especifican el numero de capas, la dimension oculta, el numero de expertos ni el mecanismo de enrutamiento. Tampoco hay datos sobre el numero de tokens de entrenamiento, la composicion del dataset, ni si se aplicaron tecnicas de alineacion como RLHF o DPO; de hecho, las etiquetas "unaligned" y "roleplay" apuntan a un ajuste orientado a conversacion adulta mas que a un alineamiento generalista.

La innovacion tecnica relevante de esta publicacion es la cuantizacion: mradermacher genera cuantizaciones estaticas (no imatrix en este repositorio, que se ofrecen en el repositorio `-i1-GGUF`) con un rango que va desde 10,7 GB en Q2_K hasta 27,0 GB en Q8_0. La presencia de ficheros mmproj (0,9 GB en Q8_0 y 1,3 GB en f16) indica que el modelo base incorpora un proyector multimodal, presumiblemente para entrada de imagenes, aunque la model card no describe su funcionamiento.

## Capacidades

- Generacion de texto conversacional en ingles, con enfasis declarado en roleplay y contenido explicito para adultos.
- Modo instruct segun las etiquetas del repositorio.
- Soporte multimodal por la presencia de ficheros mmproj; el tipo exacto de modalidad (vision, audio) no se especifica.
- Capacidad de razonamiento y codigo: no documentada ni verificada.
- Tool calling / function calling: no documentado.
- Soporte de agentes y razonamiento multi-paso: no documentado.
- Multilingue: limitado a ingles segun la model card.
- Modo "thinking" o razonamiento extendido: no disponible.

## Casos de uso

- Roleplay conversacional local: el modelo esta ajustado explicitamente para este fin y las cuantizaciones Q4_K_M (16,9 GB) permiten ejecutarlo en una GPU de consumo con 24 GB de VRAM, manteniendo conversaciones multi-turno en ingles.
- Generacion de ficcion y narrativa adulta: el ajuste "unaligned" y las etiquetas NSFW lo hacen adecuado para escritura creativa sin filtros, siempre que se respeten las politicas de uso del operador.
- Prototipado de personajes con personalidad: util para desarrolladores que construyen chatbots de rol y necesitan un modelo local sin dependencia de API, con licencia Apache 2.0 que permite modificaciones.
- Investigacion sobre alineamiento y seguridad: su condicion de modelo "unaligned" lo convierte en un caso de estudio para evaluar comportamientos no filtrados y tecnicas de mitigacion.
- Experimentacion con arquitecturas MoE en hardware limitado: la activacion reducida (~4B) permite comparar el rendimiento de un MoE de 25B frente a densos de tamano similar en una sola GPU.
- Despliegue en entornos sin conectividad: al ser GGUF y ejecutable con llama.cpp u Ollama, puede operar en estaciones de trabajo aisladas o en el borde, sin enviar datos a servicios externos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 11 GB en Q2_K, 17 GB en Q4_K_M, 23 GB en Q6_K y 27 GB en Q8_0; a estos valores hay que sumar el espacio para el contexto KV y, si se usa el componente multimodal, 1-2 GB adicionales para el mmproj.
- GPU recomendadas: RTX 4090 (24 GB) para Q4_K_M y Q5_K_M; RTX 3090 (24 GB) en las mismas cuantizaciones; A100 40/80 GB y H100 para Q8_0 y contextos largos.
- Cabe en GPU de consumo: si, en tarjetas de 24 GB con cuantizaciones Q4 y Q5; en tarjetas de 16 GB solo con Q2_K o Q3 y contexto reducido; en 12 GB no es viable sin offloading a CPU.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio y cualquier runtime compatible con GGUF; los ficheros safetensors del modelo base permiten vLLM o TGI, pero esta version concreta esta pensada para llama.cpp.
- Latencia y throughput estimados: no disponibles; dependeran de la GPU, la cuantizacion y la longitud de contexto.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Dark-Craving-26B-A4B-v0.2 (este) | ~25,2B totales, ~4B activos (inferido) | no disponible | Apache 2.0 | safetensors, GGUF | Orientado a roleplay adulto, sin benchmarks |
| Mixtral 8x7B | 46,7B totales, ~12,9B activos | 32K | Apache 2.0 | safetensors, GGUF | MoE generalista con benchmarks publicados |
| Qwen2.5-32B-Instruct | 32,5B densos | 128K | Apache 2.0 | safetensors, GGUF | Denso generalista, requiere mas VRAM |
| Mistral Small 24B | 24B densos | 128K | Apache 2.0 | safetensors, GGUF | Denso comparable en tamano, sin componente multimodal |

La comparacion es aproximada: no hay datos de rendimiento del modelo evaluado, por lo que solo pueden contrastarse parametros, contexto, licencia y formato. Frente a Mixtral 8x7B, este modelo tiene menos parametros totales y presumiblemente menos activos; frente a Qwen2.5-32B y Mistral Small 24B, la ventaja teorica es la activacion reducida del MoE, que abarata la inferencia, a costa de una documentacion tecnica mucho menor.

## Limitaciones y advertencias

- Contenido para adultos: el modelo esta etiquetado como NSFW, explicit y "not-for-all-audiences"; no debe desplegarse en productos accesibles a menores ni sin moderacion.
- Modelo "unaligned": no ha pasado por un proceso de alineamiento orientado a seguridad, por lo que puede producir contenido ofensivo, ilegal o danino sin filtros.
- Riesgo de alucinacion: sin benchmarks ni evaluaciones publicadas, no hay garantias sobre la fidelidad factual; en tareas de conocimiento general su fiabilidad es desconocida.
- Idioma: solo ingles declarado; el rendimiento en castellano no esta documentado y probablemente sea deficiente.
- Contexto: la longitud de contexto no se especifica, lo que impide planificar despliegues con ventanas largas.
- Licencia: Apache 2.0 permite uso comercial, pero el contenido generado y el cumplimiento normativo (por ejemplo, en materia de contenido adulto) son responsabilidad del operador.
- Documentacion escasa: no hay informacion sobre arquitectura exacta, datos de entrenamiento ni parametros activos confirmados; cualquier estimacion debe tratarse como provisional.
- Cuantizaciones bajas (Q2_K, Q3_K_S): la propia model card advierte de menor calidad en algunas variantes; para produccion se recomienda Q4_K_M o superior.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/Dark-Craving-26B-A4B-v0.2-GGUF
- Modelo base: https://huggingface.co/ReadyArt/Dark-Craving-26B-A4B-v0.2
- Cuantizaciones imatrix: https://huggingface.co/mradermacher/Dark-Craving-26B-A4B-v0.2-i1-GGUF
- Pagina de resumen del publicador: https://hf.tst.eu/model#Dark-Craving-26B-A4B-v0.2-GGUF
- Solicitudes de cuantizacion: https://huggingface.co/mradermacher/model_requests
- Guia de uso de GGUF (ejemplo de TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Analisis de tipos de cuantizacion: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
