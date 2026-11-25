# mradermacher/Spectre-37B-v1-i1-GGUF

## Resumen

Spectre-37B-v1-i1-GGUF es la distribucion en formato GGUF del modelo Spectre-37B-v1 desarrollado por TheDrummer, publicada por el usuario mradermacher. Se trata de un modelo de lenguaje de aproximadamente 36.550 millones de parametros (36,55B) orientado a conversacion, del que el autor original no ha publicado detalles sobre arquitectura interna, datos de entrenamiento ni licencia. La model card del cuantizador unicamente indica que es un modelo de vision y que los ficheros mmproj, si existen, residen en el repositorio estatico complementario.

La relevancia de este repositorio radica en que ofrece cuantizaciones con imatrix (etiquetadas i1) que cubren un rango muy amplio de tamanos, desde 8,5 GB en IQ1_S hasta 30,1 GB en Q6_K. Esto permite ejecutar un modelo de 37B en hardware de consumo mediante llama.cpp u Ollama, algo inviable con los pesos completos en safetensors. El uso de imatrix, generada a partir de un corpus calibrado, mejora la calidad respecto a cuantizaciones estaticas de tamano equivalente, especialmente en los rangos bajos.

El modelo esta etiquetado como conversational y solo declara soporte de ingles. No se dispone de informacion publica sobre la longitud de contexto, el proceso de alineamiento ni los benchmarks. El repositorio acumula 9.391 descargas y el modelo base es TheDrummer/Spectre-37B-v1.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo transformer de 36,55B parametros; detalles no publicados) |
| Parametros totales | 36.554.956.360 (36,55B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | i1-IQ1_S, i1-IQ1_M, i1-IQ2_XXS, i1-IQ2_XS, i1-IQ2_S, i1-IQ2_M, i1-Q2_K_S, i1-Q2_K, i1-IQ3_XXS, i1-IQ3_XS, i1-IQ3_S, i1-Q3_K_S, i1-IQ3_M, i1-Q3_K_M, i1-Q3_K_L, i1-IQ4_XS, i1-Q4_0, i1-Q4_K_S, i1-Q4_K_M, i1-Q4_1, i1-Q5_K_S, i1-Q5_K_M, i1-Q6_K; ademas de fichero imatrix para generar cuantizaciones propias |
| Idiomas soportados | en (ingles) |
| Licencia | no disponible |
| Formato de pesos | GGUF (cuantizaciones i1 con imatrix); pesos originales del modelo base presumiblemente en safetensors, no confirmado en la informacion disponible |
| Modelo base | TheDrummer/Spectre-37B-v1 |
| Tamano del repositorio | 396,7 GB |
| Modalidad | texto y vision (segun la model card del cuantizador) |

## Arquitectura y entrenamiento

No se ha publicado informacion sobre la arquitectura interna del modelo base TheDrummer/Spectre-37B-v1 en la documentacion disponible. El recuento de parametros en safetensors (36.554.956.360) confirma que se trata de un modelo denso de aproximadamente 36,5B parametros, sin indicios de configuracion MoE. La model card del cuantizador menciona que es un modelo de vision, lo que sugiere la presencia de un codificador visual y ficheros mmproj asociados, aunque estos no se incluyen en este repositorio.

Tampoco se detallan el numero de tokens de entrenamiento, la composicion del dataset, ni si se aplicaron tecnicas de RLHF, DPO u otro tipo de alineamiento. El unico dato tecnico relevante aportado por el cuantizador es el uso de imatrix (importancia matricial) para generar las cuantizaciones i1, un metodo que pondera los pesos segun su impacto en la perplejidad sobre un corpus de calibracion y que suele ofrecer mejor calidad que las cuantizaciones estaticas de tamano comparable.

## Capacidades

- Generacion de texto conversacional en ingles, segun la etiqueta `conversational` del repositorio.
- Procesamiento de imagenes: la model card indica explicitamente que es un modelo de vision, con ficheros mmproj en el repositorio estatico complementario.
- Razonamiento y generacion de codigo: no confirmado en la informacion disponible.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: limitadas al ingles segun la etiqueta de idioma.
- Modo thinking, audio u otras capacidades especiales: no disponible.

## Casos de uso

- Asistente conversacional local en ingles: el modelo puede desplegarse con llama.cpp u Ollama usando la cuantizacion i1-Q4_K_M (22,3 GB) para mantener conversaciones multi-turno en maquinas con 24 GB de VRAM, sin depender de APIs externas.
- Procesamiento de documentos con imagenes: al ser un modelo de vision, puede emplearse para describir o extraer informacion de capturas, diagramas o documentos escaneados, cargando el mmproj desde el repositorio estatico junto con la cuantizacion elegida.
- Prototipado e investigacion en entornos con recursos limitados: las cuantizaciones IQ2 e IQ3 (10-18 GB) permiten experimentar con un modelo de 37B en GPUs de consumo como la RTX 3090 o 4090, evaluando su comportamiento antes de invertir en hardware mayor.
- Generacion de texto creativo y narrativa: el tag conversational y el origen del modelo (TheDrummer es conocido por modelos orientados a rol y narrativa) lo hacen adecuado para escritura asistida y generacion de dialogos en ingles.
- Fine-tuning sobre cuantizaciones: el fichero imatrix incluido permite generar cuantizaciones propias adaptadas a un dominio concreto, util para equipos que quieran ajustar el equilibrio calidad/tamano a su caso de uso.
- Despliegue en servidores sin GPU dedicada: las cuantizaciones mas pequenas (IQ1_S de 8,5 GB, IQ2_XXS de 10,3 GB) posibilitan inferencia en CPU con RAM suficiente, aunque con perdida notable de calidad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (aproximada, segun cuantizacion y ventana de contexto):
  - i1-IQ1_S (8,5 GB): ~10-12 GB con contexto moderado.
  - i1-IQ2_M (13,0 GB): ~14-16 GB.
  - i1-IQ3_S (16,4 GB): ~18-20 GB.
  - i1-Q4_K_M (22,3 GB): ~24-26 GB.
  - i1-Q5_K_M (26,1 GB): ~28-30 GB.
  - i1-Q6_K (30,1 GB): ~32-34 GB.
- GPU recomendadas: RTX 4090 (24 GB) para IQ4_XS o Q4_K_S; RTX 3090 (24 GB) para las mismas; A100 40 GB o H100 para Q5_K_M y Q6_K; configuraciones multi-GPU para cuantizaciones altas con contexto largo.
- Cabe en GPU de consumo: si, en RTX 3090/4090 con cuantizaciones IQ3 e IQ4; en GPUs de 16 GB como la RTX 4080 solo con IQ2 o IQ1.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, y servidores compatibles con GGUF. vLLM y TGI no soportan GGUF de forma nativa generalizada, por lo que requeririan los pesos originales en safetensors.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato disponible | Notas |
|---|---|---|---|---|---|
| Spectre-37B-v1 (este) | 36,55B | no disponible | no disponible | GGUF (i1 y estatico) | Modelo conversacional con vision, solo ingles |
| Modelos densos de ~30-40B de la familia Llama/Mistral | 30-40B | 32K-128K tipicamente | licencias permisivas o comunitarias | safetensors, GGUF | Ecosistema mas amplio y documentado; datos no verificados para este modelo |
| Gemma 2 27B | 27B | 8K | Gemma license | safetensors, GGUF | Menor tamano, benchmarks publicados, contexto mas corto |
| Qwen2.5 32B | 32B | 128K | Apache 2.0 | safetensors, GGUF | Multilingue, benchmarks publicados, tool calling documentado |

La comparativa es orientativa: no se dispone de datos de rendimiento de Spectre-37B-v1 que permitan una comparacion cuantitativa fiable con estos modelos.

## Limitaciones y advertencias

- Licencia no disponible: no se puede confirmar si el uso comercial esta permitido. Verificar la licencia del modelo base TheDrummer/Spectre-37B-v1 antes de cualquier despliegue en produccion.
- Solo ingles declarado: el rendimiento en castellano u otros idiomas es incierto y probablemente deficiente.
- Longitud de contexto desconocida: no se puede garantizar el comportamiento en conversaciones largas ni en tareas de recuperacion de contexto.
- Riesgo de alucinacion: inherente a los modelos de lenguaje; sin benchmarks publicados no hay evidencia sobre su tasa de error factografico.
- Sesgos: no documentados; al no conocerse la composicion del dataset de entrenamiento, no es posible evaluar sesgos de genero, raza o ideologia.
- Cuantizaciones de baja calidad: las variantes IQ1 e IQ2 (8,5-13 GB) degradan notablemente la calidad; el propio autor las describe como "for the desperate" o "mostly desperate".
- Vision no incluida en el repositorio principal: los ficheros mmproj deben descargarse del repositorio estatico complementario; sin ellos el modelo funciona solo como texto.
- Soporte de tool calling y agentes no confirmado: no apto para pipelines de agentes sin validacion previa.
- Fecha de creacion futura en los metadatos (2026-11-08): inconsistencia que conviene tener en cuenta al evaluar la madurez del repositorio.

## Enlaces

- Repositorio Hugging Face (este modelo): https://huggingface.co/mradermacher/Spectre-37B-v1-i1-GGUF
- Repositorio de cuantizaciones estaticas: https://huggingface.co/mradermacher/Spectre-37B-v1-GGUF
- Modelo base: https://huggingface.co/TheDrummer/Spectre-37B-v1
- Pagina de descargas del cuantizador: https://hf.tst.eu/model#Spectre-37B-v1-i1-GGUF
- Guia de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Analisis de tipos de cuantizacion (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Solicitudes de modelos del cuantizador: https://huggingface.co/mradermacher/model_requests
- nethype GmbH: https://www.nethype.de/
