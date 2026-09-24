# mradermacher/Vinci-Cyber-8B-1.0-GGUF

## Resumen

Vinci-Cyber-8B-1.0-GGUF es la version cuantizada en formato GGUF del modelo simpledirect/Vinci-Cyber-8B-1.0, publicada por el usuario mradermacher, conocido en Hugging Face por generar cuantizaciones estaticas de modelos de terceros. El modelo base pertenece a la familia Vinci Cyber de SimpleDirect, orientada a flujos de trabajo de ciberseguridad defensiva autoalojados, segun la informacion publica disponible sobre el modelo hermano de 123B. La version aqui documentada cuenta con 8.380.551.168 parametros (aproximadamente 8,38 mil millones) y un repositorio de 33,8 GB que agrupa todas las variantes de cuantizacion.

El problema que resuelve es doble. Por un lado, ofrece una via de despliegue local y eficiente en memoria de un modelo de 8B mediante llama.cpp y derivados (Ollama, LM Studio, etc.) sin necesidad de GPUs de datacenter. Por otro, agrupa en un unico repositorio un espectro amplio de cuantizaciones (desde Q2_K hasta x-f16), lo que permite ajustar el equilibrio entre calidad y huella de memoria segun el hardware disponible.

Es relevante ahora porque la especializacion en dominios verticales (en este caso, ciberseguridad) combinada con cuantizaciones listas para produccion reduce la barrera de entrada para equipos que quieren ejecutar asistentes tecnicos en infraestructura propia, sin enviar datos sensibles a APIs externas. No obstante, la model card del repositorio es minima: no declara licencia, idiomas ni contexto, y no se han publicado descargas ni valoraciones en el momento de redactar esta ficha.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parametros totales | 8.380.551.168 (8,38B) |
| Parametros activos | no aplica (no se ha declarado que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | x-f16, Q8_0, Q6_K, Q5_K_M, Q5_K_S, Q4_K_M, Q4_K_S, IQ4_XS, Q3_K_L, Q3_K_M, Q3_K_S, Q2_K |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | GGUF (cuantizaciones estaticas, convert_type: hf) |

## Arquitectura y entrenamiento

No se dispone de informacion publicada sobre la arquitectura del modelo base en la documentacion proporcionada. El repositorio unicamente indica que se trata de cuantizaciones estaticas del modelo simpledirect/Vinci-Cyber-8B-1.0, con `quantize_version: 2`, `output_tensor_quantised: 1` y `convert_type: hf`, lo que confirma que el punto de partida fueron pesos en formato Hugging Face convertidos y cuantizados con las herramientas de llama.cpp. El etiquetado del repositorio como `conversational` y su publicacion en GGUF son compatibles con un transformer decoder-only orientado a dialogo, pero esto no esta confirmado por el autor.

Tampoco hay datos sobre volumen de tokens de entrenamiento, composicion del dataset, ni sobre si se aplicaron tecnicas de alineacion como RLHF, DPO o similares. Como referencia contextual de la familia, el modelo Vinci Cyber 123B 1.0 de SimpleDirect declara estar construido sobre mistralai/Devstral-2-123B-Instruct-2512 y estar enfocado a ciberseguridad defensiva, pero esta informacion corresponde a otro tamano de la familia y no debe extrapolarse automaticamente al modelo de 8B.

## Capacidades

- Generacion de texto conversacional multi-turno, segun el etiquetado `conversational` del repositorio.
- Enfoque declarado de la familia Vinci Cyber hacia flujos de ciberseguridad defensiva (analisis, revision y asistencia en tareas de seguridad), aunque el alcance concreto del modelo de 8B no esta documentado.
- Compatibilidad con endpoints (`endpoints_compatible`), lo que sugiere que puede servirse detras de APIs compatibles con el esquema habitual de Hugging Face.
- No se ha confirmado soporte de tool calling o function calling.
- No se ha confirmado soporte de agentes ni de razonamiento multi-paso explicito.
- No se ha confirmado capacidad multilingue ni lista de idiomas.
- No se ha confirmado ningun modo especial (thinking mode, vision, audio) ni capacidades multimodales.

## Casos de uso

- Asistente de ciberseguridad defensiva en local: el modelo puede desplegarse con llama.cpp u Ollama dentro de una red corporativa para responder consultas sobre procedimientos, configuracion y triaje inicial, manteniendo los datos dentro de la infraestructura propia.
- Revision y explicacion de configuraciones: uso en tareas de lectura de ficheros de configuracion, reglas de cortafuegos o politicas, generando resumenes y observaciones en lenguaje natural para analistas junior.
- Soporte a analistas SOC en primer nivel: clasificacion y resumen de alertas o notas de incidentes introducidas manualmente, aprovechando el caracter conversacional del modelo.
- Generacion de documentacion tecnica de seguridad: redaccion de guias internas, runbooks y politicas a partir de esquemas o notas previas.
- Entornos con requisitos de soberania del dato: al ejecutarse sobre pesos GGUF en hardware propio, es adecuado para organizaciones que no pueden enviar informacion a APIs externas por motivos regulatorios.
- Prototipado rapido con coste bajo: gracias a las cuantizaciones Q4_K_M o IQ4_XS, permite validar un asistente especializado en una unica GPU de consumo antes de escalar a un modelo mayor de la misma familia.
- Despliegue en estaciones de trabajo sin GPU dedicada: las variantes Q3_K_M y Q2_K permiten ejecucion en CPU con RAM moderada, util para pruebas de concepto y demos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio no incluye tabla de evaluaciones, y la model card se limita a declarar el origen de las cuantizaciones.

## Requisitos de hardware

Estimaciones derivadas del numero de parametros (8,38B) y del tamano del repositorio; no son datos publicados por el autor.

- VRAM aproximada para los pesos, sin cache KV ni overhead:
  - x-f16: ~16,8 GB
  - Q8_0: ~8,9 GB
  - Q6_K: ~6,9 GB
  - Q5_K_M / Q5_K_S: ~5,8 GB
  - Q4_K_M / Q4_K_S: ~4,9 GB
  - IQ4_XS: ~4,4 GB
  - Q3_K_L / Q3_K_M: ~4,0 GB
  - Q3_K_S: ~3,7 GB
  - Q2_K: ~3,0 GB
- GPU recomendadas: para f16 o Q8_0, una GPU de 24 GB (RTX 3090, RTX 4090, A10G) o superior; para Q4_K_M, una GPU de 8-12 GB es suficiente; para Q2_K o Q3_K_S, GPU de 6-8 GB.
- Cabe en GPU de consumo: si. Una RTX 3060 de 12 GB puede ejecutar Q4_K_M o Q5_K_M con contexto moderado; una RTX 4060 Ti de 16 GB permite Q6_K o Q8_0 con holgura.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, llama-cpp-python y servidores compatibles con GGUF. vLLM y TGI no consumen GGUF de forma nativa, por lo que requeririan los pesos originales en safetensors del modelo base.
- Latencia y throughput: no disponibles. Dependen de la cuantizacion, del backend y de si la ejecucion es total o parcialmente en CPU.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| mradermacher/Vinci-Cyber-8B-1.0-GGUF | 8,38B | no disponible | GGUF (12 cuantizaciones) | no disponible | Objeto de esta ficha |
| simpledirect/Vinci-Cyber-8B-1.0 | 8,38B | no disponible | safetensors | no disponible | Modelo base sin cuantizar del que deriva esta publicacion |
| mradermacher/VinciCoder-8B-GGUF | ~8B | no disponible | GGUF | no disponible | Cuantizacion de otro modelo de la misma familia, orientado a codigo; 70,16 GB de repositorio |
| Vinci Cyber 123B 1.0 (SimpleDirect) | 123B | no disponible | no disponible | Modified MIT (Mistral AI) | Version grande de la familia, basada en Devstral-2-123B-Instruct-2512; enfoque de ciberseguridad defensiva |

No se dispone de datos de rendimiento comparado entre estas variantes.

## Limitaciones y advertencias

- La model card es practicamente vacia: no declara licencia, idiomas, contexto ni arquitectura, lo que impide evaluar la idoneidad legal y tecnica antes de un despliegue en produccion.
- La ausencia de licencia explicita es un riesgo juridico relevante para uso comercial; conviene contactar con SimpleDirect para aclarar los terminos antes de integrar el modelo en un producto.
- No hay evaluaciones publicadas, por lo que no puede estimarse la tasa de alucinacion ni la calidad real en tareas de ciberseguridad.
- Riesgo de alucinacion inherente a los modelos de lenguaje: especialmente critico en dominios de seguridad, donde una recomendacion erronea puede tener consecuencias operativas. Se recomienda validacion humana.
- La especializacion declarada en ciberseguridad defensiva procede de la familia, no de una confirmacion especifica para esta variante de 8B; el alcance real puede ser mas generico.
- El repositorio no registra descargas ni valoraciones en el momento de redactar esta ficha, lo que limita la evidencia de uso en comunidad.
- El rendimiento de las cuantizaciones mas agresivas (Q2_K, Q3_K_S) degrada la calidad respecto a la version f16; no se han publicado mediciones de esa perdida.
- Al ser una cuantizacion de terceros, la responsabilidad sobre sesgos y comportamiento del modelo recae en el modelo base, no en mradermacher.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/mradermacher/Vinci-Cyber-8B-1.0-GGUF
- Modelo base: https://huggingface.co/simpledirect/Vinci-Cyber-8B-1.0
- Perfil del cuantizador: https://huggingface.co/mradermacher
- Peticiones de cuantizacion: https://huggingface.co/mradermacher/model_requests
- Pagina del modelo Vinci Cyber 123B 1.0: https://www.getsimpledirect.com/models/cyber-123b-1-0
- Repositorio relacionado VinciCoder-8B-GGUF: https://mygguf.com/model?id=mradermacher%2FVinciCoder-8B-GGUF
