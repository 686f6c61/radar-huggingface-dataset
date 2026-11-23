# cloudsurf-software/CloudSurf-4B-FC-GGUF

## Resumen

CloudSurf-4B-FC-GGUF es el conjunto oficial de cuantizaciones GGUF de CloudSurf-4B-FC, un modelo ajustado por CloudSurf Software a partir de Gemma-4 E4B y especializado en function calling y uso de herramientas. El prefijo "4B" hace referencia a los parametros activos (arquitectura de mezcla de expertos), mientras que el total real del checkpoint es de aproximadamente 8.000 millones de parametros, coherente con los 7.518.069.290 registrados en safetensors. Esta publicacion no es un modelo nuevo, sino la conversion a llama.cpp de los pesos BF16 fusionados, pensada para ejecucion local en hardware de consumo.

La relevancia practica del modelo esta en su enfoque: no compite por conocimiento general, sino por fiabilidad en la generacion de llamadas a herramientas estructuradas, con un formato de tool calling embebido en la plantilla de chat y compatibilidad con el servidor OpenAI de llama.cpp. La ventana de contexto declarada es de clase 131K, aunque el autor recomienda 16.384 tokens como valor por defecto en funcion de la memoria disponible.

La licencia es Apache-2.0, heredada del modelo base, con la salvedad de que los pesos originales de Gemma-4 estan sujetos a los terminos de Google. El autor advierte explicitamente de que los resultados de benchmark publicados corresponden a los pesos BF16 y no a estos ficheros cuantizados, que aun no han sido evaluados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con mezcla de expertos (MoE), base Gemma-4 E4B |
| Parametros totales | 7.518.069.290 (aprox. 8,0B) |
| Parametros activos | 4B |
| Longitud de contexto | Clase 131K (entrenado y evaluado); 16.384 recomendado por defecto en llama.cpp |
| Tipos de cuantizacion | Q3_K_M, Q4_K_M, Q5_K_M, Q6_K, Q8_0, BF16; imatrix i1 en repo de terceros |
| Idiomas soportados | Ingles |
| Licencia | Apache-2.0 (pesos base Gemma-4 sujetos a terminos de Google) |
| Formato de pesos | GGUF (llama.cpp); proyector multimodal mmproj en F16 y Q8_0 |

## Arquitectura y entrenamiento

El modelo parte de Gemma-4 E4B, una arquitectura de mezcla de expertos con 4B de parametros activos y unos 8B totales. Sobre esa base, CloudSurf Software realizo un ajuste fino orientado a function calling y tool use, evaluado con BFCL V4. No se detallan en la informacion disponible el volumen de tokens de entrenamiento, la composicion del dataset ni si se emplearon tecnicas de RLHF o DPO; esos datos se remiten a la model card del modelo base.

La innovacion destacable no esta en la arquitectura, sino en la integracion del formato de llamada a herramientas dentro de la plantilla de chat embebida en el GGUF, que llama.cpp interpreta con `--jinja`. El autor verifico cada fichero con una bateria de seis casos contra `llama-server --jinja`: llamada simple, llamada con multiples argumentos, seleccion de herramienta, ida y vuelta con `role:tool`, rechazo cuando ninguna herramienta encaja y llamadas en paralelo. Un fichero que falla cualquier caso no se publica.

## Capacidades

- Generacion de texto conversacional en ingles, orientada a asistencia con herramientas.
- Function calling y tool use: llamadas simples, multiargumento, paralelas y seleccion entre varias herramientas.
- Manejo del ciclo completo de tool calling, incluido el retorno con `role:tool`.
- Rechazo controlado cuando ninguna herramienta disponible es adecuada para la peticion.
- Entrada de imagenes mediante el proyector mmproj (capacidad heredada de la base Gemma-4, no del ajuste fino).
- Contexto largo de clase 131K para conversaciones multi-turno y documentos extensos.
- Integracion con clientes compatibles con la API de OpenAI a traves de `llama-server`.

## Casos de uso

- Backend de agentes locales: el modelo genera llamadas estructuradas a funciones y procesa sus resultados en el mismo bucle, lo que permite construir agentes que consultan APIs internas sin salir del equipo.
- Automatizacion de escritorio y CLI: con Q4_K_M en 5,3 GB cabe en un portatil de 8 GB de RAM y puede decidir que comando o script ejecutar a partir de lenguaje natural.
- Enrutamiento de peticiones: usar el modelo como clasificador que selecciona la herramienta o el servicio adecuado entre un catalogo definido, aprovechando su capacidad de eleccion y de rechazo.
- Asistente de operaciones con contexto largo: la ventana de clase 131K permite mantener el historial de incidencias y la documentacion de runbooks en el mismo contexto mientras se invocan herramientas de monitorizacion.
- Extraccion de datos estructurados: definir una funcion con esquema JSON y dejar que el modelo rellene los argumentos a partir de texto libre, con validacion posterior en el pipeline.
- Prototipado y evaluacion de pipelines de tool calling: al ser Apache-2.0 y ejecutable con llama.cpp, sirve como banco de pruebas reproducible antes de pasar a un modelo mayor en produccion.
- Procesamiento de capturas o documentos escaneados combinando el modelo con el proyector mmproj para extraer informacion y encadenarla con llamadas a herramientas.

## Benchmarks y rendimiento

Los unicos datos publicados corresponden a BFCL V4 sobre los pesos BF16 del modelo base, no sobre estos ficheros GGUF: media de 55,73 en tres semillas tal como se registro, y 54,91 bajo el marco de equidad ajustado. El autor indica que no ha evaluado las cuantizaciones y que debe asumirse perdida de calidad por debajo de Q8_0, creciente segun baja el ancho de bits.

| Medicion | Valor | Ambito |
|---|---|---|
| BFCL V4 (media 3 semillas, registro) | 55,73 | Pesos BF16 |
| BFCL V4 (marco de equidad ajustado) | 54,91 | Pesos BF16 |
| Verificacion de tool calling | 6/6 casos | Todos los ficheros GGUF (2026-08-19) |

No se han publicado resultados de benchmarks sobre los ficheros cuantizados en la informacion disponible.

## Requisitos de hardware

- VRAM/RAM estimada segun fichero: Q3_K_M 4,9 GB, Q4_K_M 5,3 GB, Q5_K_M 5,8 GB, Q6_K 6,2 GB, Q8_0 8,0 GB, BF16 15,1 GB. Sumar 1,0 GB (mmproj F16) o 0,6 GB (mmproj Q8_0) si se usa entrada de imagen.
- Cabe en GPU de consumo: Q4_K_M en tarjetas de 8 GB, Q6_K al limite de 8 GB, Q8_0 en 12 GB o mas. El BF16 requiere 24 GB para holgura.
- GPU recomendadas: RTX 3060 Ti / 4060 Ti (8 GB) para Q4_K_M y Q5_K_M; RTX 4070 Ti / 4080 (12-16 GB) para Q6_K y Q8_0; A100 o H100 solo si se necesita contexto muy largo con muchas peticiones concurrentes.
- Despliegue: llama.cpp (`llama-server`, `llama-cli`), LM Studio y Ollama. El flag `--jinja` es obligatorio para que se aplique la plantilla de tool calling; sin el, las llamadas no se parsean.
- Contexto y memoria: el autor recomienda `-c 16384` como valor practico y aumentar en funcion de la memoria. No se han publicado datos de latencia ni throughput.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| CloudSurf-4B-FC | 4B activos / ~8B totales | Clase 131K | Function calling | Apache-2.0 | GGUF y BF16 en HF |
| Gemma-4 E4B (base) | 4B activos / ~8B totales | No disponible | Proposito general | Terminos de Gemma | Peso base del ajuste |
| mradermacher/CloudSurf-4B-FC-i1-GGUF | Mismos pesos | Clase 131K | Function calling, cuantizacion imatrix | Apache-2.0 | GGUF i1 por debajo de Q3 |

No se dispone de datos de benchmark comparativos con otros modelos de la misma categoria en la informacion proporcionada, por lo que la comparacion se limita a parametros, contexto, licencia y disponibilidad.

## Limitaciones y advertencias

- Solo soporta ingles de forma declarada; el rendimiento en castellano no esta documentado.
- Los benchmarks publicados son de BF16: no hay evaluacion de las cuantizaciones, y el autor avisa de perdida de calidad por debajo de Q8_0.
- Sin `--jinja`, el servidor usa una plantilla generica y las llamadas a herramientas no se interpretan correctamente.
- La plantilla de chat debe conservarse tal cual; sustituirla por una generica rompe el formato de tool calling.
- Riesgo de alucinacion en argumentos de funciones y en la seleccion de herramientas cuando el catalogo es amplio o ambiguo; conviene validar los esquemas en el lado del servidor.
- La entrada de imagen depende del proyector mmproj y de la base Gemma-4; no forma parte del ajuste fino en tool use.
- Algunas conversiones GGUF pueden incluir una entrada espuria `</s>` en los metadatos del token de fin; llama.cpp lo detecta y corrige al cargar.
- Licencia Apache-2.0 para el ajuste, pero los pesos base de Gemma-4 quedan sujetos a los terminos de Google, lo que condiciona el uso comercial en la medida en que estos apliquen.
- El contexto de clase 131K es costoso en memoria; en GPUs de 8 GB hay que reducirlo de forma significativa.

## Enlaces

- Repositorio GGUF: https://huggingface.co/cloudsurf-software/CloudSurf-4B-FC-GGUF
- Modelo base: https://huggingface.co/cloudsurf-software/CloudSurf-4B-FC
- Cuantizaciones imatrix de terceros: https://huggingface.co/mradermacher/CloudSurf-4B-FC-i1-GGUF
- Manifiesto de checksums: https://huggingface.co/cloudsurf-software/CloudSurf-4B-FC-GGUF/resolve/main/quant-manifest.json
