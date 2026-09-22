# daydreamwarrior/MiniCPM5-2B-heretic

## Resumen

MiniCPM5-2B-heretic es una variante "abliterated" (sin censura) del modelo openbmb/MiniCPM5-2B, publicada por el usuario daydreamwarrior en HuggingFace. Se trata de un modelo de generacion de texto de 2.516.756.480 parametros (unos 2,5 mil millones) cuyo objetivo es eliminar los mecanismos de rechazo de respuesta del modelo original manteniendo la mayor fidelidad posible respecto a la distribucion de salida de la base. Segun la model card, la tasa de rechazo baja de 99/100 en el modelo original a 5/100 en esta version, con una divergencia KL de 0.0302 respecto al base.

El modelo se distribuye principalmente en formato GGUF (cuantizaciones Q6_K y BF16) y esta etiquetado como compatible con llama.cpp, con enfoque de despliegue en dispositivo ("on-device", "edge-ai"). El repositorio ocupa 12,1 GB e incluye tambien pesos en safetensors. La licencia declarada es Apache-2.0, heredada del modelo base, y los idiomas soportados son ingles (en) y chino (zh).

Su relevancia actual es doble: por un lado, ofrece un modelo pequeno y ligero para inferencia local sin filtros de contenido, util en investigacion sobre alineacion y en aplicaciones creativas; por otro, sirve como caso de estudio reproducible del efecto de la abliteracion sobre un modelo de menos de 3B de parametros. La model card no documenta longitud de contexto, datos de entrenamiento ni resultados de benchmarks estandar.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (el tag "llama" indica compatibilidad de arquitectura/convertidor, no se detalla en la model card) |
| Parametros totales | 2.516.756.480 (2,52B), dato real de safetensors |
| Parametros activos | no aplica (no es un modelo MoE segun la informacion disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF Q6_K y BF16 |
| Idiomas soportados | ingles (en), chino (zh) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors y GGUF |
| Modelo base | openbmb/MiniCPM5-2B |
| Metodo de modificacion | Heretic v2.0.0.dev0 |
| Tamano del repositorio | 12,1 GB |
| Descargas / likes | 244 / 0 |

## Arquitectura y entrenamiento

La informacion disponible no describe la arquitectura interna del modelo: no se detallan numero de capas, tipo de atencion, dimension del hidden state ni si emplea tecnicas como atencion lineal, decodificacion especulativa o mezcla de expertos. El tag "llama" del repositorio sugiere que el modelo sigue una topologia compatible con la familia Llama y que ha sido convertido al ecosistema llama.cpp, pero se trata de una inferencia a partir de las etiquetas, no de un dato confirmado en la model card. Tampoco se documenta la longitud de contexto soportada.

Respecto al entrenamiento, no hay informacion sobre numero de tokens, composicion del dataset, fases de RLHF, DPO u otras tecnicas de alineacion aplicadas al modelo base. Lo unico documentado es la intervencion posterior: se aplico Heretic v2.0.0.dev0 para producir la version abliterated, con una tasa de rechazo medida de 5/100 frente a 99/100 del modelo original y una divergencia KL de 0.0302 respecto a la base (tomada como referencia con KL 0.0000). Esa divergencia KL cuantifica cuanto se ha desplazado la distribucion de probabilidad del modelo modificado respecto al original: un valor bajo indica que la abliteracion se ha realizado intentando preservar el comportamiento general, aunque no se aportan medidas de calidad posteriores (perplejidad, benchmarks de razonamiento o de codigo).

## Capacidades

- Generacion de texto conversacional en ingles y chino.
- Generacion de texto sin mecanismos de rechazo: la tasa de rechazo declarada es de 5/100 frente a 99/100 del modelo base.
- Modelo de proposito general de 2,5B de parametros, orientado a tareas de generacion y dialogo, no a tareas especializadas documentadas.
- Soporte de tool calling / function calling: no documentado en la informacion disponible.
- Soporte de agentes y razonamiento multi-paso: no documentado en la informacion disponible.
- Capacidades de vision o audio: no documentadas; el pipeline declarado es unicamente text-generation.
- Modo "thinking" o razonamiento explicito: no documentado.
- Capacidades multilingues: limitadas a los idiomas declarados (en, zh); no se especifica el nivel de competencia en cada uno.
- Despliegue local y en dispositivo: soportado por el formato GGUF y la compatibilidad declarada con llama.cpp.

## Casos de uso

- Escritura creativa sin filtros: el modelo puede emplearse para generar narrativa, dialogo de ficcion o contenido de genero sin los rechazos tipicos de los modelos alineados; su tamano de 2,5B permite ejecutarlo en portatil o en un equipo con GPU modesta.
- Chat de personajes y role-play: al haber reducido la tasa de rechazo al 5%, resulta adecuado para asistentes de personaje con tematicas adultas o conflictivas, siempre que el operador asuma la responsabilidad legal y etica del contenido generado.
- Asistencia offline en aplicaciones de escritorio o moviles: la cuantizacion Q6_K (aproximadamente 2 GB) permite integrar el modelo en una app de escritorio mediante llama.cpp o llama-cpp-python sin conexion a internet.
- Prototipado rapido de pipelines LLM: sirve como modelo de pruebas de bajo coste para validar prompts, plantillas de chat y flujos de generacion antes de escalar a modelos mayores, gracias a su licencia Apache-2.0 y a su distribucion en GGUF.
- Investigacion sobre abliteration y alineacion: es un caso reproducible para medir el impacto de eliminar direcciones de rechazo en modelos pequenos, comparando su tasa de rechazo y su KL divergence (0.0302) con el modelo base.
- Generacion de texto en chino e ingles en entornos con recursos limitados: para tareas de resumen, parafraseo o clasificacion generativa en estos dos idiomas, en escenarios donde no se dispone de GPU de datacenter.
- Evaluacion de seguridad y red-teaming: al ser un modelo explicitamente sin censura, puede utilizarse como sujeto de pruebas en bancos de evaluacion de contenido danino, con las salvaguardas de aislamiento adecuadas.
- Educacion e investigacion academica: analisis comparativo de la degradacion o preservacion de capacidades tras una intervencion de abliteration sobre un checkpoint de 2,5B.

## Benchmarks y rendimiento

La model card unicamente publica dos metricas comparativas frente al modelo base. No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K u otros) en la informacion disponible.

| Metrica | MiniCPM5-2B-heretic | openbmb/MiniCPM5-2B (base) |
|---|---|---|
| Tasa de rechazo (refusal rate) | 5 / 100 | 99 / 100 |
| Divergencia KL | 0.0302 | 0.0000 (referencia) |

## Requisitos de hardware

- VRAM estimada para los pesos en BF16: aproximadamente 4,7 GiB (5.033.512.960 bytes) solo para parametros; hay que sumar el cache KV y el overhead de runtime, por lo que conviene reservar 6-8 GB.
- VRAM estimada para los pesos en Q6_K: aproximadamente 1,9-2,1 GB para parametros, con overhead adicional segun contexto y backend.
- GPU recomendadas: cualquier GPU consumer con 8 GB o mas de VRAM (por ejemplo, RTX 3060 Ti, RTX 4060, RTX 3070, RTX 4070, RTX 4090). Tambien es viable en GPU de datacenter (A100, H100) aunque no es necesario para este tamano.
- Cabe en GPU consumer: si, en practicamente cualquier GPU moderna con 6-8 GB de VRAM usando Q6_K, y en GPUs de 8 GB o mas con BF16.
- Es viable tambien en CPU y en hardware de borde (mini-PC, Raspberry Pi de gama alta, telefonos de gama alta) segun las etiquetas on-device y edge-ai del repositorio.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, llama-cpp-python y otros runners compatibles con GGUF; para los pesos safetensors, servidores como vLLM o TGI segun compatibilidad con la arquitectura del modelo base.
- Latencia y throughput estimados: no disponible; depende de la cuantizacion, del backend y del hardware, y no se aportan mediciones en el repositorio.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formatos | Notas |
|---|---|---|---|---|---|---|
| daydreamwarrior/MiniCPM5-2B-heretic | 2,52B | no disponible | en, zh | apache-2.0 | safetensors, GGUF (Q6_K, BF16) | Version abliterated; refusal 5/100; KL 0.0302 |
| openbmb/MiniCPM5-2B | 2,52B (modelo base) | no disponible | no disponible | no disponible | no disponible | Modelo original, con refusal 99/100 segun la tabla del autor |
| Otras alternativas de ~2-3B | no disponible | no disponible | no disponible | no disponible | no disponible | No se ha proporcionado informacion de modelos comparables adicionales |

## Limitaciones y advertencias

- La abliteracion elimina deliberadamente los mecanismos de rechazo: el modelo puede generar contenido danino, ilegal, ofensivo o inseguro sin filtros. No debe desplegarse en aplicaciones de cara al publico sin capas de moderacion externas.
- La divergencia KL de 0.0302 respecto al modelo base indica un desplazamiento no nulo de la distribucion de salida; no se han publicado evaluaciones que confirmen si las capacidades generales (razonamiento, codigo, matematicas) se han preservado o degradado.
- No hay datos de benchmarks estandar, por lo que no es posible comparar su calidad objetiva con otros modelos de su categoria.
- Riesgo de alucinacion: inherente a los modelos de 2,5B de parametros; no se documenta ningun mecanismo de mitigacion ni evaluacion de fidelidad.
- Limitacion idiomatica: solo se declaran ingles y chino; no se garantiza un rendimiento aceptable en castellano ni en otros idiomas.
- No se documenta longitud de contexto, por lo que no se puede garantizar el comportamiento en conversaciones largas o documentos extensos.
- La model card es minima: no incluye informacion sobre arquitectura, datos de entrenamiento, sesgos conocidos ni evaluaciones de seguridad.
- Validacion comunitaria baja: 244 descargas y 0 likes en el momento de la consulta, lo que implica poca verificacion independiente del comportamiento real del modelo.
- Licencia Apache-2.0 heredada del modelo base: permite uso comercial, pero el usuario asume toda la responsabilidad sobre el contenido generado; conviene revisar los terminos del modelo original openbmb/MiniCPM5-2B antes de un despliegue en produccion.
- Para produccion, se recomienda anadir moderacion de entrada y salida, registro de interacciones y evaluacion propia, dado que la model card no aporta garantias de calidad.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/daydreamwarrior/MiniCPM5-2B-heretic
- Modelo base: https://huggingface.co/openbmb/MiniCPM5-2B
- Herramienta Heretic (referenciada en la model card como Heretic v2.0.0.dev0): no se proporciona enlace en la informacion disponible.
- Paper, blog o repositorio adicionales: no disponible; los resultados de busqueda web proporcionados no contenian fuentes relevantes sobre el modelo.
