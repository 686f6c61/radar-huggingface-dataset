# mradermacher/Qwen3.8-27B-Uncensored-Aggressive-NOESIS-BF16-i1-GGUF

## Resumen

Qwen3.8-27B-Uncensored-Aggressive-NOESIS-BF16-i1-GGUF es una cuantizacion en formato GGUF del modelo AMAImedia/Qwen3.8-27B-Uncensored-Aggressive-NOESIS-BF16, publicada por el usuario mradermacher. Se trata de un derivado de la familia Qwen (etiquetado por el autor como qwen3.5, qwen3.6 y qwen3.8) con 27.320.697.856 parametros totales, afinado para eliminar restricciones de moderacion ("uncensored") y con un estilo de respuesta descrito como "agresivo". El repositorio incluye unicamente pesos cuantizados con imatrix, no los pesos originales en BF16.

El interes practico de esta ficha reside en que es una de las pocas distribuciones GGUF listas para usar de un modelo de ~27B con licencia Apache 2.0 y soporte declarado para mas de 100 idiomas. Al estar en formato GGUF, puede ejecutarse con llama.cpp u Ollama en hardware de consumo, lo que lo hace accesible para experimentacion local sin infraestructura de datacenter.

No obstante, la model card es extremadamente escasa: no documenta arquitectura interna, longitud de contexto, datos de entrenamiento ni resultados de benchmarks. Todo lo que se indica a continuacion proviene de los metadatos del repositorio y de la propia model card; cualquier dato ausente se marca explicitamente como no disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (etiquetada como qwen3.5/qwen3.6/qwen3.8; se asume transformer decoder-only, sin confirmacion) |
| Parametros totales | 27.320.697.856 |
| Parametros activos | no disponible (no se declara como MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | i1-Q2_K, i1-Q3_K_S, i1-IQ3_S, i1-IQ3_M, i1-Q3_K_M, i1-Q3_K_L, i1-IQ4_XS, i1-Q4_0, i1-Q4_K_S, i1-Q4_K_M, i1-Q4_1, i1-Q5_K_S, i1-Q5_K_M, i1-Q6_K (mas fichero imatrix) |
| Idiomas soportados | mas de 100, incluyendo en, ru, zh, ja, kk, vi, es, de, fr, ar, hi, ko, pt, tr, uk, entre otros |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (cuantizado con imatrix); el modelo base esta en BF16 |

## Arquitectura y entrenamiento

No se dispone de informacion sobre la arquitectura interna del modelo base. La model card del repositorio cuantizado no incluye detalles sobre numero de capas, dimensiones ocultas, mecanismo de atencion ni tipo de positional encoding. Las etiquetas del repositorio mencionan "mtp" (multi-token prediction) y "noesis-repack", lo que sugiere que el modelo base emplea alguna forma de prediccion multi-token y un proceso de reempaquetado propio del autor original, pero no se documenta en que consiste.

Tampoco hay datos sobre el corpus de entrenamiento: no se indica el numero de tokens, la composicion del dataset, ni si hubo fases de RLHF, DPO o fine-tuning supervisado. El nombre "Uncensored-Aggressive" indica un afinado orientado a reducir rechazos y adoptar un tono directo, pero se desconoce la metodologia. La cuantizacion i1 emplea ficheros imatrix generados por el cuantizador, un metodo habitual para preservar calidad en cuantizaciones de baja precision.

## Capacidades

- Generacion de texto conversacional multi-turno, segun la etiqueta "conversational" del repositorio.
- Cobertura multilingue amplia: la model card lista mas de 100 codigos de idioma, incluidos espanol, ingles, ruso, chino, japones, arabe, hindi y la mayoria de lenguas europeas.
- Respuestas sin filtros de moderacion aparentes, orientadas a contenido que los modelos alineados convencionales rechazarian.
- Estilo de respuesta directo y "agresivo", segun la denominacion del autor.
- Soporte de tool calling: no disponible (no se documenta).
- Soporte de agentes y razonamiento multi-paso: no disponible (no se documenta).
- Capacidades de vision o audio: no disponible (no se documenta).
- Modo thinking explicito: no disponible (no se documenta).

## Casos de uso

- Experimentacion con modelos sin alineacion: util para investigadores que estudian el efecto de eliminar el RLHF en el comportamiento del modelo, comparando respuestas frente a la version alineada equivalente.
- Generacion creativa sin restricciones: escritura de ficcion con tematicas adultas, violencia narrativa o dialogos moralmente ambiguos que los modelos convencionales suelen rechazar.
- Procesamiento multilingue en local: con mas de 100 idiomas declarados, sirve para tareas de traduccion o resumen en lenguas de bajos recursos (kazajo, amharico, umbundu) en entornos sin conexion.
- Analisis de contenido sensible para moderacion: un modelo sin censura puede emplearse como clasificador de segundo nivel para detectar material toxico que otros modelos se niegan a procesar.
- Despliegue en estaciones de trabajo con GPU de consumo: las cuantizaciones i1-Q4_K_M (16,9 GB) e i1-IQ4_XS (15,4 GB) caben en GPUs de 24 GB como la RTX 4090, permitiendo inferencia local de un modelo de 27B.
- Red teaming y evaluacion de seguridad: sirve para generar ataques adversariales y prompts maliciosos con los que probar sistemas de defensa antes de desplegarlos en produccion.
- Prototipado de chatbots de nicho: para comunidades o productos donde la politica de contenido es permisiva y se necesita un modelo que no bloquee conversaciones legitimas por falsos positivos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: entre 11 GB (i1-Q2_K) y 22,5 GB (i1-Q6_K) solo para los pesos; hay que anadir el espacio para la cache KV, que depende de la longitud de contexto (no documentada).
- Cuantizacion recomendada por el autor: i1-Q4_K_M (16,9 GB), descrita como "rapida y recomendada".
- GPU de consumo: cabe en RTX 4090, RTX 3090 y RTX 4080 Super (24 GB y 16 GB respectivamente con cuantizaciones Q4 o inferiores); en GPUs de 12 GB solo entrarian las cuantizaciones Q2_K e IQ3 con contexto muy limitado.
- GPU de datacenter: A100 40/80 GB, H100 y L40S admiten el modelo completo en BF16 o en cuantizaciones altas con contexto extendido.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio y cualquier runtime compatible con GGUF; el repositorio esta etiquetado como "endpoints_compatible".
- Latencia y throughput: no disponibles; dependen del hardware y de la cuantizacion elegida.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Qwen3.8-27B-Uncensored-Aggressive-NOESIS (este) | 27,3B | no disponible | Apache 2.0 | GGUF (i1) | Sin benchmarks publicados; afinado sin censura |
| Modelo base AMAImedia (BF16) | 27,3B | no disponible | Apache 2.0 | BF16 | Mismo modelo sin cuantizar; requiere ~55 GB en BF16 |
| Qwen2.5-32B-Instruct | 32,5B | 131.072 tokens | Apache 2.0 | safetensors, GGUF | Referencia de la familia Qwen con benchmarks publicados |
| Gemma 2 27B | 27B | 8.192 tokens | Gemma License | safetensors, GGUF | Tamano comparable; licencia mas restrictiva |

La comparacion con Qwen2.5-32B-Instruct y Gemma 2 27B se ofrece por tamano y categoria, no por rendimiento medido: no existen datos que permitan afirmar que este modelo iguale o supere a esas referencias.

## Limitaciones y advertencias

- Ausencia total de benchmarks: no hay forma de verificar la calidad del modelo frente a alternativas; el afinado "uncensored" puede degradar capacidades de razonamiento e instruccion.
- Riesgo elevado de alucinacion: los afinados agresivos sin alineacion tienden a reducir la cautela epistémica y a inventar datos con mayor confianza.
- Contenido nocivo: al eliminar la moderacion, el modelo puede generar instrucciones peligrosas, discurso de odio o material ilegal; no es apto para aplicaciones orientadas al publico sin un filtro externo.
- Contexto desconocido: no se documenta la ventana de contexto, lo que impide planificar aplicaciones de contexto largo.
- Idiomas: aunque se declaran mas de 100, no hay evaluacion de calidad por idioma; el rendimiento en lenguas de bajos recursos puede ser muy inferior al del ingles.
- Licencia: Apache 2.0 permite uso comercial, pero el responsable del despliegue asume toda la responsabilidad legal sobre el contenido generado.
- Procedencia: el modelo base lo publica un usuario individual (AMAImedia), no el equipo oficial de Qwen; la nomenclatura "Qwen3.8" no corresponde a ninguna version oficial conocida y puede inducir a confusion.
- Repositorio grande (218,6 GB) con multiples ficheros multi-parte; la descarga y el ensamblaje requieren seguir las instrucciones de llama.cpp.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/mradermacher/Qwen3.8-27B-Uncensored-Aggressive-NOESIS-BF16-i1-GGUF
- Modelo base: https://huggingface.co/AMAImedia/Qwen3.8-27B-Uncensored-Aggressive-NOESIS-BF16
- Cuantizaciones estaticas del mismo autor: https://huggingface.co/mradermacher/Qwen3.8-27B-Uncensored-Aggressive-NOESIS-BF16-GGUF
- Pagina de descargas del cuantizador: https://hf.tst.eu/model#Qwen3.8-27B-Uncensored-Aggressive-NOESIS-BF16-i1-GGUF
- Guia de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Analisis de tipos de cuantizacion (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Peticiones de cuantizacion: https://huggingface.co/mradermacher/model_requests
