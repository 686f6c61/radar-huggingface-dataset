# mradermacher/KuroVision-8B-Brasil-GGUF

## Resumen

KuroVision-8B-Brasil-GGUF es una coleccion de cuantizaciones en formato GGUF del modelo KuroVision-8B-Brasil, publicado por el usuario mradermacher a partir del modelo original de engenho-ai. El repositorio contiene unicamente los pesos convertidos y cuantizados, no el modelo base ni su documentacion tecnica, por lo que la mayor parte de las especificaciones del modelo original no estan disponibles en la informacion proporcionada.

El modelo base cuenta con 8.190.735.360 parametros (aproximadamente 8,2 mil millones), lo que lo situa en la categoria de modelos de tamano medio aptos para inferencia en GPU de consumo con cuantizaciones agresivas. La denominacion "Vision" en el nombre sugiere capacidades multimodales, y el sufijo "Brasil" apunta a un ajuste orientado al portugues de Brasil, aunque ninguno de estos extremos puede confirmarse con los datos disponibles.

La relevancia de esta ficha es practica: permite desplegar el modelo con llama.cpp u otros runners compatibles con GGUF sin necesidad de convertir pesos desde safetensors. El repositorio ocupa 54,1 GB e incluye 11 variantes de cuantizacion, desde Q2_K hasta F16, lo que cubre desde escenarios con VRAM muy limitada hasta inferencia practicamente sin perdida.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (el nombre sugiere componentes multimodales, sin confirmar) |
| Parametros totales | 8.190.735.360 (8,2 B) |
| Parametros activos | no aplica (no hay indicios de arquitectura MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | F16, Q8_0, Q6_K, Q5_K_M, Q5_K_S, Q4_K_M, Q4_K_S, IQ4_XS, Q3_K_L, Q3_K_M, Q3_K_S, Q2_K |
| Idiomas soportados | no disponible (el sufijo "Brasil" sugiere portugues de Brasil, sin confirmar) |
| Licencia | no disponible |
| Formato de pesos | GGUF (cuantizaciones estaticas generadas con quantize_version 2) |

## Arquitectura y entrenamiento

No se dispone de informacion sobre la arquitectura del modelo base. El unico dato estructural cierto es el numero de parametros (8,2 B) y el hecho de que mradermacher ha generado cuantizaciones estaticas a partir de los pesos en safetensors del repositorio engenho-ai/KuroVision-8B-Brasil, con el pipeline de conversion `hf` a GGUF. Los metadatos de la model card indican `output_tensor_quantised: 1`, es decir, los tensores de salida tambien se cuantizan, y no consta que se haya omitido el proyector multimodal (`skip_mmproj` vacio), lo que deja abierta la posibilidad de que las cuantizaciones conserven componentes de vision.

No hay datos sobre volumen de tokens de entrenamiento, composicion del dataset, tecnicas de alineacion (RLHF, DPO) ni innovaciones tecnicas como decodificacion especulativa o atencion lineal. Toda esta seccion queda pendiente de la documentacion del modelo original.

## Capacidades

- Generacion de texto conversacional: la etiqueta `conversational` del repositorio indica que el modelo esta orientado a dialogos multi-turno.
- Posible soporte multimodal: el nombre "Vision" sugiere entrada de imagenes, pero no se confirma en la informacion disponible.
- Posible especializacion en portugues de Brasil: el sufijo "Brasil" lo sugiere, sin verificacion disponible.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible.
- Modo thinking, audio u otras capacidades especiales: no disponible.

## Casos de uso

- Despliegue local en estaciones de trabajo con GPU de consumo: las cuantizaciones Q4_K_M e IQ4_XS permiten ejecutar un modelo de 8,2 B en GPUs con 6-8 GB de VRAM mediante llama.cpp u Ollama, sin depender de servicios en la nube.
- Prototipado de asistentes conversacionales en portugues: si se confirma la especializacion en portugues de Brasil, el modelo serviria para construir chatbots de atencion al cliente en ese idioma con un coste de inferencia bajo.
- Evaluacion comparativa de cuantizaciones: el repositorio incluye 11 variantes, lo que permite medir la degradacion de calidad entre Q2_K y F16 sobre el mismo modelo base en tareas de generacion y razonamiento.
- Integracion en pipelines de CI/CD para pruebas de regresion: al ser GGUF, se puede cargar en runners ligeros y ejecutar baterias de prompts fijos para detectar cambios de comportamiento entre versiones.
- Investigacion sobre modelos pequenos especializados por region o idioma: el modelo sirve como caso de estudio de ajuste regional ("Brasil") sobre una base de 8 B.
- Experimentacion multimodal en entornos con recursos limitados: si las cuantizaciones conservan el proyector de vision, seria un candidato para tareas de descripcion de imagenes en hardware modesto, pendiente de verificacion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (8,2 B de parametros, calculo orientativo):
  - Q2_K: en torno a 3,5-4 GB.
  - Q4_K_M / IQ4_XS: en torno a 5-6 GB.
  - Q6_K: en torno a 7 GB.
  - Q8_0: en torno a 9 GB.
  - F16: en torno a 16-17 GB.
- GPU recomendadas: RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070, RTX 4090 para cuantizaciones altas; A100 o H100 solo si se necesita throughput elevado o F16 con contexto largo.
- Cabe en GPU de consumo: si, desde una GTX 1660 6 GB con Q4_K_S hasta una RTX 4090 con Q8_0.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, llama-cpp-python y servidores compatibles con GGUF; vLLM y TGI no soportan GGUF de forma nativa generalizada.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| KuroVision-8B-Brasil-GGUF | 8,2 B | no disponible | no disponible | GGUF | Cuantizaciones de un modelo de engenho-ai; sin benchmarks publicos |
| Llama 3.1 8B Instruct | 8,0 B | 128 K | Llama 3.1 Community | safetensors, GGUF | Referencia de la categoria; ampliamente evaluado |
| Qwen2.5 7B Instruct | 7,6 B | 128 K | Apache 2.0 | safetensors, GGUF | Buen rendimiento en codigo y multilingue |
| Mistral 7B Instruct v0.3 | 7,2 B | 32 K | Apache 2.0 | safetensors, GGUF | Alternativa consolidada de tamano similar |

La comparacion es estructural: no existen datos de rendimiento del modelo analizado que permitan contrastar calidad frente a estas alternativas.

## Limitaciones y advertencias

- Ausencia total de model card tecnica: no hay informacion sobre datos de entrenamiento, sesgos, contexto ni idiomas, lo que dificulta evaluar su idoneidad para produccion.
- Licencia no especificada: no se puede confirmar si el uso comercial esta permitido; es imprescindible consultar el repositorio original engenho-ai/KuroVision-8B-Brasil antes de desplegarlo.
- Riesgo de alucinacion: inherente a los modelos generativos de 8 B; sin benchmarks no se puede acotar su magnitud.
- Las cuantizaciones de baja precision (Q2_K, Q3_K_S) degradan de forma notable la coherencia y el razonamiento; para uso real se recomienda Q4_K_M o superior.
- El sufijo "Brasil" sugiere un ajuste regional que podria reducir el rendimiento en castellano o en otros idiomas; sin datos que lo confirmen.
- Posible perdida de capacidades multimodales si el proceso de cuantizacion no preserva correctamente el proyector de vision; conviene verificar con pruebas propias.
- Repositorio con 0 descargas y creado recientemente: no hay evidencia de uso en comunidad ni validacion independiente.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/KuroVision-8B-Brasil-GGUF
- Modelo original: https://huggingface.co/engenho-ai/KuroVision-8B-Brasil
- Perfil del autor de las cuantizaciones: https://huggingface.co/mradermacher
