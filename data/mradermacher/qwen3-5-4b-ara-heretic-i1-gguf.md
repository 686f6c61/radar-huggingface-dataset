# mradermacher/Qwen3.5-4B-ARA-heretic-i1-GGUF

## Resumen

Qwen3.5-4B-ARA-heretic-i1-GGUF es una cuantizacion GGUF del modelo richardyoung/Qwen3.5-4B-ARA-heretic, una variante "abliterated" (decensored) del Qwen3.5-4B de Alibaba. El trabajo de cuantizacion lo firma mradermacher, un autor conocido en el ecosistema por publicar versiones GGUF con imatrix de modelos populares. El modelo base parte de la familia Qwen3.5, con 4.205.751.296 parametros totales segun los safetensors del repositorio, lo que lo situa en la gama de modelos pequenos ejecutables en hardware de consumo.

La particularidad de esta variante es el proceso "heretic" aplicado sobre el modelo original: se eliminan o atenuan los mecanismos de rechazo y alineacion para obtener un modelo sin censura, orientado a generacion de contenido sin restricciones tematicas. El autor del modelo base lo etiqueta como "abliterated", "uncensored" y "decensored". La model card menciona ademas que se trata de un modelo de vision, con ficheros mmproj disponibles en el repositorio estatico.

El repositorio ofrece una bateria amplia de cuantizaciones con imatrix, desde IQ1_S (1,5 GB) hasta Q6_K (3,6 GB), lo que permite desplegarlo en escenarios muy distintos, desde GPUs integradas hasta estaciones de trabajo. La licencia declarada es Apache 2.0, aunque el modelo base incluye la etiqueta openrail++ en los tags, lo que conviene verificar antes de un uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (familia Qwen3.5, segun modelo base); detalles especificos no disponibles |
| Parametros totales | 4.205.751.296 |
| Parametros activos | no disponible (no consta que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | i1-IQ1_S, IQ1_M, IQ2_XXS, IQ2_XS, IQ2_S, IQ2_M, Q2_K_S, IQ3_XXS, Q2_K, Q3_K_S, IQ3_XS, IQ3_S, IQ3_M, Q3_K_M, Q3_K_L, IQ4_XS, Q4_0, Q4_K_S, IQ4_NL, Q4_K_M, Q4_1, Q5_K_S, Q5_K_M, Q6_K (con imatrix) |
| Idiomas soportados | en |
| Licencia | apache-2.0 (el modelo base incluye tag openrail++) |
| Formato de pesos | GGUF (safetensors en el modelo base) |

## Arquitectura y entrenamiento

La informacion disponible no detalla la arquitectura interna del modelo base mas alla de su pertenencia a la familia Qwen3.5 y su naturaleza transformer. El repositorio no documenta el numero de tokens de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de RLHF o DPO en el modelo original. Lo que si se explicita es el proceso de "abliteration" aplicado sobre el modelo Qwen3.5-4B para producir la variante heretic, que consiste en modificar los pesos para eliminar direcciones de activacion asociadas a rechazos y respuestas alineadas.

Las cuantizaciones de este repositorio se generan con imatrix (importance matrix), un metodo que calcula la importancia de cada tensor a partir de un corpus de calibracion y permite obtener cuantizaciones de menor perdida de calidad a igual tamano. El autor documenta el proceso como reproducible y etiqueta los quants con el prefijo "i1", indicando que se trata de la primera generacion de cuantizaciones con imatrix para este modelo. La model card indica que se trata de un modelo de vision, con ficheros mmproj en el repositorio estatico, aunque no se detalla la arquitectura del encoder visual.

## Capacidades

- Generacion de texto conversacional sin restricciones tematicas derivadas de la alineacion original.
- Capacidad multimodal (vision) segun la model card; los ficheros mmproj estan en el repositorio estatico asociado.
- Razonamiento y generacion de codigo heredados del modelo base Qwen3.5-4B, aunque no se documentan evaluaciones especificas.
- Soporte de tool calling y function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues limitadas al ingles segun el campo `language` del repositorio.
- Modo thinking explicito: no disponible en la informacion proporcionada.

## Casos de uso

- Roleplay y narrativa sin filtros: el proceso heretic elimina los rechazos del modelo base, lo que permite generar ficcion con tematicas adultas o controvertidas sin bloqueos, siempre que el usuario asuma la responsabilidad legal del contenido.
- Investigacion sobre alineacion y seguridad: util para estudiar como varian las respuestas de un modelo tras el proceso de abliteration frente al modelo original, comparando comportamiento en conjuntos de prompts sensibles.
- Despliegue en hardware modesto: las cuantizaciones IQ2/IQ3 (1,6-2,5 GB) permiten ejecutar el modelo en GPUs de 4-6 GB o incluso en CPU, gracias a llama.cpp.
- Prototipado rapido de asistentes conversacionales: el formato GGUF con Q4_K_M (2,8 GB) ofrece un equilibrio razonable entre calidad y velocidad para entornos de desarrollo.
- Generacion de contenido creativo en ingles: el modelo esta orientado a ingles y puede usarse para redaccion creativa, guiones o dialogos donde se requiera baja interferencia de filtros.
- Experimentacion con modelos de vision en local: si se descargan los ficheros mmproj del repositorio estatico, puede emplearse para tareas de descripcion de imagenes en entornos sin conexion.
- Fine-tuning ligero o destilacion: el modelo base en safetensors (no este GGUF) sirve como punto de partida para ajustes especificos, aunque el proceso heretic puede afectar a la calidad en tareas estandar.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (solo pesos, sin overhead de contexto):
  - IQ1_S / IQ1_M: ~1,5 GB
  - IQ2_XXS a IQ2_M: ~1,6-1,8 GB
  - Q2_K / IQ3_XXS: ~2,0 GB
  - IQ3_S / IQ3_M / Q3_K_M: ~2,2-2,4 GB
  - IQ4_XS / Q4_K_S / Q4_K_M: ~2,6-2,8 GB
  - Q5_K_M: ~3,2 GB
  - Q6_K: ~3,6 GB
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM para cuantizaciones IQ3/IQ4; RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4090 o A100/H100 para mayor margen de contexto y velocidad.
- Cabe en GPUs de consumo: si, en la mayoria de tarjetas modernas desde 4 GB (GTX 1650, RTX 3050, RTX 4060, etc.) usando cuantizaciones IQ3 o superiores. Las cuantizaciones IQ1/IQ2 permiten incluso ejecucion en CPU o iGPU.
- Opciones de despliegue: llama.cpp, Ollama (importando el GGUF), LM Studio, text-generation-webui, koboldcpp. vLLM y TGI no soportan GGUF de forma nativa sin conversion previa.
- Latencia y throughput: no disponibles en la informacion proporcionada. Como referencia cualitativa, un modelo de 4B en Q4_K_M sobre una RTX 4090 suele generar decenas de tokens por segundo, pero no se aportan cifras verificadas para este modelo concreto.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Qwen3.5-4B-ARA-heretic-i1-GGUF (este) | 4,2 B | no disponible | apache-2.0 | GGUF (multiples quants) | Variante abliterated con vision |
| richardyoung/Qwen3.5-4B-ARA-heretic | 4,2 B | no disponible | apache-2.0 | safetensors | Modelo base sin cuantizar |
| Qwen/Qwen3.5-4B | 4,2 B | no disponible | apache-2.0 | safetensors | Modelo original alineado, sin proceso heretic |
| mradermacher/Qwen3.5-4B-ARA-heretic-GGUF | 4,2 B | no disponible | apache-2.0 | GGUF (quants estaticos) | Version estatica sin imatrix del mismo modelo |

La comparativa con otras familias (Llama, Mistral, Gemma) no esta disponible en la informacion proporcionada, ya que no se aportan datos de rendimiento que permitan una comparacion rigurosa.

## Limitaciones y advertencias

- El proceso heretic elimina los rechazos del modelo original, lo que implica que el modelo puede generar contenido ofensivo, ilegal o danino sin filtros. El usuario es responsable del uso.
- Riesgo elevado de alucinacion: los modelos pequenos (4B) y las variantes abliterated tienden a inventar hechos con mayor frecuencia que modelos mayores o alineados.
- La abliteration puede degradar capacidades generales (razonamiento, codigo, matemticas) respecto al Qwen3.5-4B original; no se aportan benchmarks que cuantifiquen esta perdida.
- Idioma limitado al ingles segun el campo `language`; el rendimiento en castellano no esta verificado y probablemente sea inferior.
- Longitud de contexto no documentada; conviene no asumir ventanas largas sin verificacion empirica.
- La licencia apache-2.0 convive con el tag openrail++ en el modelo base; es recomendable revisar las condiciones del modelo original antes de un uso comercial.
- El repositorio tiene 0 likes y 3141 descargas en el momento de la consulta; es un artefacto reciente (creado en noviembre de 2026) sin validacion comunitaria extensa.
- Las cuantizaciones IQ1 e IQ2 (etiquetadas por el autor como "for the desperate" o "very low quality") degradan notablemente la coherencia; no son recomendables para produccion.
- No se documentan resultados de evaluacion de sesgos; se desconoce el comportamiento del modelo en colectivos protegidos.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/mradermacher/Qwen3.5-4B-ARA-heretic-i1-GGUF
- Modelo base (sin cuantizar): https://huggingface.co/richardyoung/Qwen3.5-4B-ARA-heretic
- Cuantizaciones estaticas del mismo modelo: https://huggingface.co/mradermacher/Qwen3.5-4B-ARA-heretic-GGUF
- Modelo original Qwen3.5-4B (referencia de licencia): https://huggingface.co/Qwen/Qwen3.5-4B
- Pagina de conveniencia del autor para este modelo: https://hf.tst.eu/model#Qwen3.5-4B-ARA-heretic-i1-GGUF
- Guia de uso de GGUF (TheBloke, referencia): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Analisis de tipos de cuantizacion (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
