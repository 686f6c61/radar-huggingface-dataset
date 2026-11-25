# dbishwarup/TagoreGPT-52M

## Resumen

TagoreGPT-52M es un modelo de generacion de texto de 51,7 millones de parametros entrenado desde cero por el usuario dbishwarup para escribir poemas, canciones, relatos, capitulos de novela, obras de teatro, ensayos y cartas en el estilo de Rabindranath Tagore, tanto en ingles como en bengali. El modelo no parte de un modelo base preentrenado de gran escala ni de tecnicas de destilacion: segun la model card, se entrena desde cero, lo que lo situa en la categoria de modelos pequenos especializados en un dominio creativo y linguistico muy concreto.

Su interes practico reside en el formato de distribucion: se publica un unico archivo GGUF en precision f16 de 104 MB (`tagoregpt-52m-f16.gguf`) que funciona directamente en Ollama, LM Studio y llama.cpp, sin necesidad de GPU dedicada. Esto lo convierte en un caso util para estudiar el despliegue de modelos generativos en entornos con recursos minimos, para experimentos de estilizacion literaria y para trabajo con bengali, un idioma con relativamente pocos recursos en el ecosistema open source.

La relevancia es acotada pero clara: demuestra que un modelo de ~52M puede producir texto tematicamente coherente en piezas cortas y preservar un registro estilistico, siempre que el usuario ajuste la temperatura y la longitud de salida. No hay datos publicos de benchmarks, licencia ni composicion del dataset de entrenamiento, lo que limita su uso en produccion sin una evaluacion propia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (detalle de capas y atencion no disponible) |
| Parametros totales | 51.697.728 (51,7M) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (la configuracion recomendada limita la salida a 700 tokens) |
| Tipos de cuantizacion | GGUF en f16 (archivo publicado de 104 MB); otras cuantizaciones no disponibles |
| Idiomas soportados | en (ingles), bn (bengali) |
| Licencia | no disponible |
| Formato de pesos | GGUF (f16); safetensors presente en el repo segun metadatos de parametros |

## Arquitectura y entrenamiento

La informacion disponible indica que es un modelo transformer decoder-only entrenado desde cero con 51,7M parametros, orientado a generacion de texto autoregresiva. No se detalla el numero de capas, dimension del modelo, numero de cabeceras de atencion ni la longitud de contexto nativa; tampoco se especifica si usa componentes tipo RoPE, GQA o decodificacion especulativa. El repositorio incluye pesos en safetensors (de ahi el conteo exacto de parametros) y una conversion a GGUF f16 para inferencia local.

Sobre el entrenamiento no hay datos publicos: se desconoce el volumen de tokens, la composicion del corpus (obras de Tagore, traducciones, texto sintetico o una mezcla), si hubo fases de instruccion, RLHF o DPO, y si se aplicaron tecnicas de regularizacion o curriculum. La model card menciona ajustes de decodificacion recomendados (temperature 0.4, top-k 10, repeat penalty 1.2, hasta 700 tokens), lo que sugiere que el modelo fue calibrado para salidas cortas y que tiende a degradarse en generaciones largas.

## Capacidades

- Generacion de texto creativo en ingles y bengali: poemas, canciones, relatos, capitulos de novela, obras de teatro, ensayos y cartas.
- Estilizacion literaria: imita el registro y los temas asociados a Rabindranath Tagore (naturaleza, lluvia, rio, familia, nostalgia).
- Generacion bilingue: acepta peticiones en ingles y produce texto en bengali si se indica explicitamente ("in Bengali") o si la peticion se formula en bengali.
- Conversacion basica de un turno: el pipeline es text-generation con etiqueta conversational, pero no hay evidencia de gestion multi-turno robusta.
- Seguimiento de instrucciones simples: responde a consignas del tipo "write a poem about the river at dusk".
- No se documenta soporte de tool calling, function calling, agentes, vision, audio, modo thinking ni matematicas o codigo.

## Casos de uso

- Generacion de poesia personalizada: el modelo produce poemas cortos sobre un tema indicado (por ejemplo, el rio al atardecer) y mantiene la consigna durante las primeras decenas de tokens; es adecuado porque esta entrenado especificamente para este registro y funciona en CPU.
- Creacion de letras de canciones en bengali: útil para demos, proyectos culturales o prototipos de aplicaciones musicales, ya que acepta peticiones en bengali y genera texto con estructura de cancion.
- Cartas y textos epistolares: redaccion de cartas ficticias o literarias (por ejemplo, "a letter to my mother about the rain") con un tono decimonoveno y vocabulario acotado.
- Prototipado de interfaces de generacion de texto: al ser un GGUF de 104 MB, se puede integrar en Ollama o llama.cpp para validar UX, latencia y flujo de prompting antes de migrar a un modelo mayor.
- Educacion y experimentacion linguistica: permite a investigadores comparar la calidad del bengali generado por un modelo pequeno entrenado desde cero frente a modelos multilingues grandes, con un coste computacional minimo.
- Aplicaciones offline o de bajo consumo: despliegue en portatiles, Raspberry Pi o entornos sin GPU para generar contenido literario breve, dado que el modelo cabe en memoria RAM convencional.
- Generacion de relatos breves y fragmentos de novela: util para escritura asistida de borradores de 200-700 tokens que luego un humano revisa y amplia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: practicamente nula en GPU; el archivo f16 de 104 MB requiere aproximadamente 0,1 GB de memoria, y el proceso completo de llama.cpp suele mantenerse por debajo de 1 GB de RAM.
- GPU recomendadas: innecesarias; cualquier GPU con al menos 1 GB de VRAM puede ejecutarlo, pero el cuello de botella real es la CPU.
- Compatibilidad con GPU de consumo: si, en cualquier RTX (por ejemplo, RTX 3060, 4060, 4090) y en GPUs integradas, aunque no aporta ventaja frente a CPU para este tamano.
- Opciones de despliegue: Ollama (`ollama run hf.co/dbishwarup/TagoreGPT-52M`), LM Studio (busqueda por `dbishwarup/TagoreGPT-52M`), llama.cpp con el GGUF f16, y demo online en Streamlit.
- Latencia y throughput: no disponibles como cifras publicadas; por el tamano del modelo, la generacion en CPU es viable para salidas de hasta 700 tokens con ajustes de temperature 0.4, top-k 10 y repeat penalty 1.2.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| TagoreGPT-52M | 51,7M | no disponible | en, bn | no disponible | GGUF f16, safetensors | Entrenado desde cero, especializado en estilo Tagore |
| SmolLM-135M (HuggingFaceTB) | 135M | 2.048 tokens (aprox., segun variante) | en principalmente | Apache 2.0 | safetensors, GGUF | Modelo generalista pequeno, no especializado en bengali ni en estilo literario |
| Qwen2.5-0.5B | 494M | 32.768 tokens | multilingue, incluye chino e ingles | Apache 2.0 | safetensors, GGUF | Mayor capacidad general y multilingue, pero mucho mayor en tamano y sin especializacion estilistica |
| GPT-2 small | 124M | 1.024 tokens | en | MIT (pesos originales) | safetensors, GGUF | Referencia historica; no cubre bengali ni estilo Tagore |

La comparativa es orientativa: TagoreGPT-52M compite por nicho (estilo literario y bengali) y por huella de memoria, no por rendimiento general. No hay datos de benchmarks que permitan una comparacion cuantitativa de calidad.

## Limitaciones y advertencias

- Licencia no disponible: no se puede confirmar el uso comercial, la redistribucion ni la modificacion de los pesos; conviene contactar al autor antes de integrarlo en productos.
- Riesgo de alucinacion y deriva tematica: la model card advierte que las piezas cortas se mantienen mas cerca del tema; en salidas largas el texto puede desviarse o repetirse.
- Capacidad limitada por tamano: 51,7M parametros implican vocabulario y coherencia acotados; no es fiable para razonamiento, matematicas, codigo ni instrucciones complejas.
- Contexto no documentado: se desconoce la ventana nativa; la recomendacion de hasta 700 tokens sugiere un contexto efectivo corto.
- Cobertura linguistica limitada a ingles y bengali; no hay evidencia de calidad en otros idiomas, incluido el castellano.
- Sesgos desconocidos: al entrenarse sobre un corpus no documentado (posiblemente obras de Tagore y material asociado), puede reproducir sesgos historicos, coloniales o de genero presentes en ese material.
- Sin tool calling, agentes ni vision: no apto para pipelines de agentes o automatizacion que requieran function calling.
- Calidad no verificada por terceros: cero descargas y un like en el momento de la consulta; no hay evaluaciones independientes publicadas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/dbishwarup/TagoreGPT-52M
- Demo online (Streamlit): https://tagoregpt.streamlit.app
- Perfil del autor: https://huggingface.co/dbishwarup
- Ollama (ejecucion local): https://ollama.com
- LM Studio: https://lmstudio.ai
- llama.cpp: https://github.com/ggml-org/llama.cpp
