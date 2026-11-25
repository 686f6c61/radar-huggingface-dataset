# mradermacher/aoi-gemma-4-E4B-it-heretic-GGUF

## Resumen

aoi-gemma-4-E4B-it-heretic-GGUF es la version cuantizada en formato GGUF del modelo CloudGoat/aoi-gemma-4-E4B-it-heretic, un merge realizado mediante task arithmetic sobre la familia Gemma 4. El modelo base parte de una arquitectura Gemma 4 de aproximadamente 7.500 millones de parametros (7.518.069.290 segun los pesos en safetensors) y ha sido modificado para eliminar parte de los filtros de seguridad y alineacion, con el objetivo declarado de servir para roleplay y generacion de texto sin restricciones ("uncensored"). El autor del merge es CloudGoat, mientras que la cuantizacion la firma mradermacher, un conocido creador de versiones GGUF de la comunidad.

La relevancia de esta ficha radica en que combina dos practicas habituales del ecosistema open source: por un lado, el merge de modelos mediante aritmetica de tareas (task arithmetic) para combinar capacidades o alterar el comportamiento de un modelo base; por otro, la cuantizacion a GGUF para permitir su ejecucion en hardware de consumo mediante llama.cpp y herramientas compatibles. El resultado es un modelo conversacional en japones (etiqueta `ja` en la model card) con capacidades multimodales, ya que el repositorio incluye ficheros `mmproj` para el proyector visual.

No se dispone de informacion sobre la longitud de contexto, la composicion del dataset de entrenamiento ni los resultados de benchmarks. La licencia declarada es Apache 2.0, lo que en principio permite uso comercial, aunque la naturaleza "uncensored" del modelo y su origen como merge de un modelo base Gemma 4 (cuyos terminos originales pueden imponer restricciones adicionales) requiere verificacion juridica antes de un despliegue en produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (familia Gemma 4), merge por task arithmetic |
| Parametros totales | 7.518.069.290 |
| Parametros activos | no disponible (no consta que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | f16, Q8_0, Q6_K, Q5_K_M, Q5_K_S, Q4_K_M, Q4_K_S, IQ4_XS, Q3_K_L, Q3_K_M, Q3_K_S, Q2_K; mmproj en Q8_0 y f16 |
| Idiomas soportados | japones (etiqueta `ja` en la model card); resto no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (cuantizaciones) y safetensors (modelo base original) |

## Arquitectura y entrenamiento

El modelo es un merge de tipo task arithmetic sobre la familia Gemma 4, segun las etiquetas `merge`, `task-arithmetic` y `goatmerge` de la model card. No se detalla en la informacion disponible que modelos concretos se combinaron, con que coeficientes ni que tareas se sumaron o restaron. La denominacion "E4B" sugiere una variante de eficiencia dentro de la familia Gemma 4, pero no se confirma en los datos proporcionados.

No hay informacion sobre el numero de tokens de entrenamiento, la composicion del dataset, ni si se aplicaron tecnicas de RLHF o DPO. La etiqueta "heretic" y "uncensored" indica que el merge busca reducir el rechazo de peticiones y la alineacion de seguridad del modelo base, una practica habitual en la comunidad de roleplay. El repositorio incluye ficheros `mmproj` (proyector multimodal) en Q8_0 y f16, lo que confirma que el modelo conserva capacidad de vision. No se documentan innovaciones tecnicas adicionales como decodificacion especulativa o atencion lineal.

## Capacidades

- Generacion de texto conversacional multi-turno, orientada a roleplay y personificacion.
- Capacidad multimodal (vision) gracias a los ficheros `mmproj` incluidos en el repositorio.
- Comportamiento "uncensored": menor tasa de rechazo ante peticiones que el modelo base rechazaria.
- Soporte de idioma japones declarado en la model card; el resto de idiomas no esta confirmado.
- Compatibilidad con endpoints (`endpoints_compatible` en las etiquetas).
- No se documenta soporte explicito de tool calling, function calling ni razonamiento multi-paso con agentes.
- No se documenta modo "thinking" ni capacidades de audio.

## Casos de uso

- Roleplay y narrativa interactiva: el modelo esta afinado para personificacion y conversacion abierta, y su naturaleza "uncensored" permite tramas y dialogos que los modelos alineados rechazarian; adecuado para videojuegos narrativos y comunidades de rol.
- Generacion creativa sin restricciones: escritura de ficcion, guiones y contenido adulto en entornos controlados donde el filtrado del modelo base resulta limitado.
- Prototipado local en japones: al declarar soporte de japones, sirve para experimentar con asistentes conversacionales en ese idioma sobre hardware de consumo.
- Analisis de imagenes en local: los ficheros `mmproj` permiten describir o interpretar imagenes con llama.cpp, util para prototipos de vision por computador sin enviar datos a la nube.
- Investigacion sobre alineacion y seguridad: util para estudiar el efecto de merges task arithmetic sobre los filtros de seguridad y medir la degradacion de rechazos.
- Despliegue en entornos con recursos limitados: las cuantizaciones Q4_K_M (5,4 GB) y Q4_K_S (5,3 GB) permiten ejecutar el modelo en GPU de consumo y en CPU con llama.cpp.
- Evaluacion comparativa de cuantizaciones: el repositorio ofrece 12 variantes de cuantizacion, lo que facilita medir el impacto de la compresion en calidad y velocidad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (solo pesos, sin overhead de contexto):
  - Q2_K: ~4,5 GB
  - Q4_K_S / Q4_K_M: ~5,3-5,4 GB
  - Q5_K_M: ~5,9 GB
  - Q6_K: ~6,3 GB
  - Q8_0: ~8,1 GB
  - f16: ~15,2 GB
  - Proyector multimodal adicional: ~0,7 GB (mmproj Q8_0) o ~1,1 GB (mmproj f16)
- GPU recomendadas: RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070/4080, RTX 4090 para cuantizaciones altas; A100/H100 para f16 y despliegues concurrentes.
- Cabe en GPU de consumo: si, en tarjetas con 8 GB o mas usando Q4_K_M o inferiores; en 6 GB con Q3_K_M o Q2_K.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, text-generation-webui y servidores compatibles con GGUF; los endpoints compatibles permiten integracion con APIs estilo OpenAI.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| aoi-gemma-4-E4B-it-heretic-GGUF | 7.518.069.290 | no disponible | Apache 2.0 | GGUF | Merge "uncensored" con vision, japones |
| CloudGoat/aoi-gemma-4-E4B-it-heretic | 7.518.069.290 | no disponible | Apache 2.0 | safetensors | Modelo base sin cuantizar del que deriva este |
| Gemma 4 (familia base) | no disponible | no disponible | Terminos Gemma | safetensors/GGUF | Modelo original alineado; contexto y variantes no confirmados en la informacion disponible |

No se dispone de datos de rendimiento comparativo entre estas alternativas en la informacion proporcionada.

## Limitaciones y advertencias

- Modelo "uncensored": la reduccion de filtros de seguridad implica mayor riesgo de generar contenido ofensivo, ilegal o danino; no es apto para aplicaciones de cara al publico sin moderacion adicional.
- Riesgo elevado de alucinacion: no se documentan evaluaciones de fidelidad ni benchmarks que respalden la calidad factual.
- Contexto e idiomas no documentados: solo el japones esta declarado; el rendimiento en castellano es desconocido.
- La licencia Apache 2.0 se declara sobre el merge, pero el modelo base Gemma 4 puede estar sujeto a los terminos de uso de Google; conviene verificar la compatibilidad antes de un uso comercial.
- El merge por task arithmetic puede degradar capacidades del modelo base (razonamiento, codigo, matematicas); no hay evaluaciones que lo confirmen o descarten.
- El repositorio ocupa 76,9 GB por incluir todas las cuantizaciones; descargar solo la variante necesaria.
- Sin likes ni pipeline declarado y con 762 descargas, la validacion comunitaria es muy limitada.
- No se documenta soporte de tool calling ni de agentes, por lo que no deberia asumirse para pipelines automatizados.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/aoi-gemma-4-E4B-it-heretic-GGUF
- Modelo base: https://huggingface.co/CloudGoat/aoi-gemma-4-E4B-it-heretic
- Cuantizaciones con imatrix: https://huggingface.co/mradermacher/aoi-gemma-4-E4B-it-heretic-i1-GGUF
- Pagina de descargas del autor: https://hf.tst.eu/model#aoi-gemma-4-E4B-it-heretic-GGUF
- Guia de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Solicitudes de cuantizacion: https://huggingface.co/mradermacher/model_requests
- Analisis de cuantizaciones (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
