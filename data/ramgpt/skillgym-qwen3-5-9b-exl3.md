# ramgpt/SkillGym-Qwen3.5-9B-EXL3

## Resumen

SkillGym-Qwen3.5-9B-EXL3 es una cuantizacion de 4,00 bits por peso (bpw) del modelo reasonwang/SkillGym-Qwen3.5-9B, publicada por el usuario ramgpt mediante el conversor oficial `convert.py` de ExLlamaV3 (revision 1.5.2+cu128.torch2.10.0). No se trata de un modelo entrenado desde cero, sino de una conversion de pesos orientada a servir inferencia eficiente con el backend ExLlamaV3 y, por extension, con servidores compatibles como TabbyAPI. La arquitectura declarada del modelo original es `Qwen3_5ForConditionalGeneration`, lo que indica una familia Qwen3.5 de generacion condicional con torre de vision, es decir, capacidades multimodales de texto e imagen (y metadatos de preprocesado de video).

El repositorio ocupa 6,9 GB e incluye unicamente pesos en formato safetensors cuantizados en EXL3. Un dato relevante y no resuelto en la informacion disponible es la discrepancia entre el nombre comercial ("9B") y el recuento real de parametros de los safetensors publicados (3.420.001.152, aproximadamente 3,42 mil millones). El autor no explica esa diferencia en la model card, por lo que conviene verificarla antes de dimensionar un despliegue.

La relevancia de esta publicacion es practica: permite ejecutar un modelo multimodal de la familia Qwen3.5 en una unica GPU de consumo. El propio autor valida la carga, la generacion de 64 tokens, el chat de texto, el streaming, el tool calling, la vision y dos peticiones concurrentes en una NVIDIA GeForce RTX 4090, con una velocidad de decodificacion de 135,807 tokens por segundo en esa prueba local.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | `Qwen3_5ForConditionalGeneration` (transformer multimodal texto-vision) |
| Parametros totales | 3.420.001.152 segun metadatos de safetensors; el nombre del modelo indica 9B (discrepancia no explicada en la informacion disponible) |
| Parametros activos | No aplica: no se describe una arquitectura MoE |
| Longitud de contexto | No disponible en la informacion proporcionada |
| Tipos de cuantizacion | EXL3 a 4,00 bpw (etiqueta 4-bit) |
| Idiomas soportados | No disponible en la informacion proporcionada |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (cuantizacion EXL3 / ExLlamaV3) |
| Modelo base | reasonwang/SkillGym-Qwen3.5-9B (revision `0b8f92556f6c7ec06bd858327ed2166da8b7697c`) |
| Tamano del repositorio | 6,9 GB |
| Descargas / likes | 0 / 0 |
| Fecha de publicacion | 2026-10-01 |

## Arquitectura y entrenamiento

La model card no aporta informacion sobre el entrenamiento del modelo original: no se detallan el numero de tokens, la composicion del dataset, ni si hubo fases de RLHF, DPO u otro ajuste por preferencias. Lo unico que se declara es la clase de arquitectura, `Qwen3_5ForConditionalGeneration`, y la procedencia de los pesos, la revision `0b8f92556f6c7ec06bd858327ed2166da8b7697c` del modelo reasonwang/SkillGym-Qwen3.5-9B. Cualquier afirmacion sobre el proceso de entrenamiento seria especulacion y no se incluye aqui.

La innovacion tecnica de esta publicacion es la propia conversion a EXL3. El autor senala dos decisiones de compatibilidad relevantes: el `config.json` de origen declara una capa MTP/NextN (prediccion multi-token), pero los safetensors liberados no contienen los tensores `mtp.*` correspondientes, de modo que la conversion EXL3 omite ese submodelo inexistente conservando los pesos de lenguaje y de vision. Ademas, el repositorio de origen empaqueta los metadatos del procesador multimodal de forma distinta al modelo base Qwen3.5, por lo que los ficheros `preprocessor_config.json` y `video_preprocessor_config.json` se restauraron desde `Qwen/Qwen3.5-9B` con ajustes de procesador equivalentes para que ExLlamaV3 los acepte.

## Capacidades

- Generacion de texto conversacional, con soporte de chat multi-turno segun la validacion del autor.
- Streaming de tokens en servidor, validado localmente con TabbyAPI.
- Tool calling / function calling: la model card confirma una prueba satisfactoria de llamada a herramientas.
- Vision: el modelo conserva los pesos de la torre visual y se ha validado entrada de imagenes.
- Preprocesado de video: se restaura `video_preprocessor_config.json`, lo que indica soporte de metadatos de video, aunque no se detalla el alcance funcional.
- Servicio concurrente: validado con dos peticiones simultaneas.
- Razonamiento y generacion de codigo: no se documentan explicitamente en la informacion disponible.
- Capacidades multilingues: no disponibles en la informacion proporcionada.

## Casos de uso

- Servicio de chat autoalojado: el modelo se puede exponer mediante TabbyAPI con streaming y varias peticiones concurrentes, lo que encaja en un asistente interno desplegado en una unica GPU de consumo.
- Agentes con herramientas: al haberse validado el tool calling, es viable construir agentes que consulten APIs externas, bases de datos o sistemas de ficheros dentro de un bucle de razonamiento multi-paso.
- Analisis de documentos con imagenes: la torre de vision permite procesar capturas, diagramas, facturas escaneadas o interfaces de usuario y devolver descripciones o extracciones en texto.
- Transcripcion y resumen de material audiovisual: la restauracion de metadatos de video habilita pipelines que combinen fotogramas muestreados con texto para generar resumenes o indices.
- Asistencia de codigo en local: gracias a la licencia Apache 2.0 y a la cuantizacion de 4 bpw, puede integrarse en un IDE o en un plugin interno sin enviar codigo a servicios de terceros.
- Moderacion o clasificacion de contenido visual y textual: el modelo puede actuar como clasificador generativo en un pipeline por lotes que recorra imagenes y textos asociados.
- Prototipado e investigacion en una sola GPU: al pasar la prueba de carga y generacion en una RTX 4090, sirve como banco de pruebas para experimentar con tecnicas de agentes o de vision sin presupuesto de clúster.
- Atencion al cliente con contexto visual: en escenarios donde el usuario adjunta una captura de pantalla de un error, el modelo puede razonar sobre la imagen y responder con una solucion textual.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card solo incluye una prueba de humo local: 64 tokens generados y 135,807 tokens por segundo en decodificacion sobre una NVIDIA GeForce RTX 4090 con Torch 2.10.0+cu128. El propio autor advierte que esa cifra es un smoke benchmark local y no una afirmacion de rendimiento comparable entre sistemas.

| Metrica | Valor | Contexto |
|---|---|---|
| Tokens generados en la validacion | 64 | Prueba de humo local |
| Velocidad de decodificacion | 135,807 tok/s | RTX 4090, Torch 2.10.0+cu128, 64 tokens |
| MMLU | No disponible | No publicado |
| HumanEval | No disponible | No publicado |
| GSM8K | No disponible | No publicado |

## Requisitos de hardware

- VRAM estimada para inferencia: el repositorio pesa 6,9 GB, por lo que con los pesos en memoria y margen para cache KV la inferencia cabe holgadamente en GPUs de 16 GB o superiores.
- GPU validadas por el autor: NVIDIA GeForce RTX 4090 (24 GB), donde se ejecuto la prueba de carga y generacion.
- GPU recomendadas: cualquier GPU con al menos 16 GB de VRAM y soporte CUDA; una RTX 4090 o RTX 4080 es suficiente segun la validacion publicada. Para despliegues con mayor concurrencia, una A100 o H100 aportan margen adicional, aunque no hay datos publicados que lo confirmen.
- Cabe en GPU de consumo: si, al menos en la RTX 4090 empleada por el autor.
- Opciones de despliegue: ExLlamaV3 directamente y servidores compatibles con EXL3, como TabbyAPI (utilizado en la validacion descrita). No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI en la informacion disponible, y el formato EXL3 es especifico del ecosistema ExLlamaV3.
- Latencia y throughput: 135,807 tok/s en decodificacion como prueba de humo en RTX 4090 con 64 tokens generados; la latencia de primer token no se publica. El rendimiento con lotes grandes o mayor concurrencia no esta documentado.

## Comparativa con modelos similares

La informacion disponible solo permite comparar esta conversion con su origen y con el modelo base del que se tomaron los ficheros de preprocesado. No se dispone de datos de rendimiento de ninguno de ellos, por lo que la comparacion se limita a formato, licencia y proposito.

| Modelo | Relacion | Parametros | Contexto | Formato | Licencia | Rendimiento |
|---|---|---|---|---|---|---|
| ramgpt/SkillGym-Qwen3.5-9B-EXL3 | Este modelo | 3.420.001.152 segun safetensors (nombre indica 9B) | No disponible | safetensors EXL3 4,00 bpw | Apache 2.0 | 135,807 tok/s en RTX 4090 (prueba de humo) |
| reasonwang/SkillGym-Qwen3.5-9B | Modelo de origen | No disponible | No disponible | No disponible | No disponible | No disponible |
| Qwen/Qwen3.5-9B | Fuente de los ficheros de preprocesado | No disponible | No disponible | No disponible | No disponible | No disponible |

No se proporcionan alternativas cuantizadas de la misma categoria con las que comparar de forma significativa.

## Limitaciones y advertencias

- Discrepancia de parametros sin resolver: los safetensors declaran 3.420.001.152 parametros mientras el nombre del modelo indica 9B. Conviene verificar el recuento real antes de planificar capacidad de servicio.
- Capa MTP/NextN ausente: el `config.json` de origen declara una capa MTP, pero los tensores `mtp.*` no existen en los pesos liberados. La conversion los omite de forma explicita, por lo que cualquier expectativa de decodificacion especulativa multi-token basada en esa capa no se cumple.
- Metadatos de preprocesado restaurados: `preprocessor_config.json` y `video_preprocessor_config.json` no provienen del repositorio original, sino de `Qwen/Qwen3.5-9B`. Esto puede introducir diferencias sutiles de preprocesado respecto al modelo de origen.
- Compatibilidad limitada de backend: al ser un formato EXL3, queda restringido al ecosistema ExLlamaV3 y servidores que lo soporten, lo que reduce las opciones de despliegue frente a GGUF o safetensors sin cuantizar.
- Sin datos de sesgos ni de alucinacion: la model card no documenta evaluaciones de sesgo, tasas de alucinacion ni comportamiento en dominios sensibles. Cualquier uso en produccion deberia incluir validacion propia.
- Idiomas no documentados: se desconoce la cobertura linguistica real, incluido el castellano.
- Longitud de contexto no documentada: no se puede planificar el troceado de documentos ni el diseno de prompts largos sin ese dato.
- Sin adopcion verificable: cero descargas y cero likes en el momento de la consulta, y ninguna validacion independiente publicada mas alla de la del propio autor.
- Licencia: Apache 2.0 permite uso comercial, pero la trazabilidad de los datos de entrenamiento del modelo original no se detalla en la informacion disponible.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/ramgpt/SkillGym-Qwen3.5-9B-EXL3
- Modelo de origen: https://huggingface.co/reasonwang/SkillGym-Qwen3.5-9B
- Modelo base Qwen3.5-9B (fuente de los ficheros de preprocesado): https://huggingface.co/Qwen/Qwen3.5-9B
- ExLlamaV3 (herramienta de conversion y backend): no se ha encontrado un enlace especifico en la busqueda web proporcionada
- Paper, blog o demo adicionales: no disponible en la informacion proporcionada
