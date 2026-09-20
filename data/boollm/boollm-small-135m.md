# Boollm/Boollm-Small-135M

## Resumen

Boollm Small 135M es un empaquetado en formato GGUF del modelo HuggingFaceTB/SmolLM2-135M-Instruct, publicado por el usuario Boollm bajo licencia Apache-2.0. No se trata de un modelo entrenado ni ajustado por Boollm: la propia model card indica explicitamente que contiene los pesos originales de SmolLM2-135M-Instruct en formato GGUF y que no se ha aplicado ningun fine-tuning. Su funcion declarada es servir como prueba de concepto para validar el descubrimiento, la descarga y la integracion de modelos dentro de la aplicacion local Boollm.

El modelo cuenta con 134.515.008 parametros (aproximadamente 135 millones), un tamano de repositorio de 0,1 GB y se distribuye en una unica cuantizacion Q8_0. Al estar orientado a inferencia local en equipos con memoria limitada, es ejecutable en CPU y en practicamente cualquier GPU de consumo, ademas de en dispositivos tipo Raspberry Pi. La model card lo etiqueta con los casos de educacion, tutoria, escritura y chat general, aunque advierte de forma explicita que las respuestas pueden ser superficiales, inexactas o confusas debido al reducido numero de parametros.

Es relevante ahora como ejemplo de patron de publicacion "reempaquetado + integracion": un mismo artefacto verificado (digest y manifiesto de procedencia en `release-manifest.json`) sirve para probar cadenas de suministro de modelos en aplicaciones locales antes de invertir en modelos mayores. Quien busque capacidad real de tutoria o asistencia debe acudir a modelos mas grandes; este release es una pieza de infraestructura y validacion, no un salto de calidad sobre su modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (heredada del modelo base SmolLM2-135M-Instruct; no se detalla mas en la model card) |
| Parametros totales | 134.515.008 (dato real de safetensors) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada; el ejemplo oficial de uso con llama.cpp arranca con `-c 2048` |
| Tipos de cuantizacion | GGUF Q8_0 unicamente (`Boollm-Small-135M.Q8_0.gguf`) |
| Idiomas soportados | No disponible (la model card no declara lista de idiomas) |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (Q8_0); no se distribuyen safetensors en este repositorio |

Otros datos: pipeline `text-generation`, libreria `llama.cpp`, tamano del repositorio 0,1 GB, 0 descargas y 0 likes en el momento de la consulta, fecha de creacion 2026-09-19. Entre las etiquetas figuran `imatrix`, `endpoints_compatible`, `conversational`, `local-inference` y `proof-of-concept`.

## Arquitectura y entrenamiento

La arquitectura es la del modelo base SmolLM2-135M-Instruct, un transformer decoder-only de 135 millones de parametros orientado a instrucciones. La model card de este repositorio no aporta detalles adicionales sobre el numero de capas, dimensiones ocultas, mecanismo de atencion ni funcion de activacion, por lo que cualquier cifra de ese tipo debe consultarse en la documentacion upstream de SmolLM2 y no en esta ficha.

En cuanto al entrenamiento, no hay ningun entrenamiento atribuible a Boollm. La seccion "Provenance" es explicita: "This release contains the original SmolLM2-135M-Instruct weights in GGUF format. No Boollm fine-tuning has been applied." Por tanto, no hay datos sobre volumen de tokens, composicion del dataset ni fases de RLHF/DPO/alignamiento especificos de este release; todo ello corresponde al modelo base. La unica transformacion aplicada es la conversion a GGUF con cuantizacion Q8_0 y la generacion de un manifiesto de release con digests de archivos, presumiblemente con uso de calibracion tipo imatrix segun la etiqueta del repositorio, aunque esto ultimo no se documenta de forma detallada.

## Capacidades

- Generacion de texto corto en formato conversacional, heredada del ajuste de instrucciones del modelo base.
- Respuestas de chat multi-turno de caracter basico: la model card reconoce que pueden ser "superficiales, inexactas o confusas".
- Asistencia de escritura simple (redaccion breve, reformulacion, borradores de pocas lineas).
- Prompts de tutoria de nivel introductorio, siempre con la advertencia de no usarlo como fuente unica.
- Inferencia 100 % local y offline, sin dependencia de API ni de conexion de red una vez descargado el GGUF.
- Compatibilidad con `llama.cpp` y con el selector de modelos locales de la aplicacion Boollm.
- Etiqueta `endpoints_compatible`, que sugiere compatibilidad con el endpoint HTTP de `llama-server`.
- No acepta imagenes: la model card indica expresamente que el modelo "does not accept images".
- No se declara soporte de tool calling, function calling, agentes, modo de razonamiento explicito (thinking) ni audio.
- No se declara soporte multilingue ni lista de idiomas.

## Casos de uso

- Validacion de la cadena de suministro de modelos: se descarga el GGUF, se comprueba el digest contra `release-manifest.json` y se verifica que la aplicacion Boollm lo detecta, lo lista y lo carga correctamente. Es el proposito declarado del release.
- Pruebas de integracion en CI con coste minimo: al ocupar 0,1 GB, el modelo se puede incluir en un runner sin GPU para comprobar que el endpoint de `llama-server` arranca, responde y devuelve un esquema valido antes de ejecutar la suite real.
- Desarrollo de interfaces de chat local: permite iterar sobre la UI (streaming de tokens, gestion de historial, cancelacion) sin consumir GPU de desarrollo, dado su tamano reducido y su capacidad de correr en CPU.
- Demostraciones educativas sobre limites de los modelos de lenguaje: en un aula se puede mostrar en vivo como un modelo de 135 M produce respuestas plausibles pero poco fiables, y contrastarlo despues con un modelo mayor.
- Asistente de escritura offline en equipos con recursos muy limitados (portatiles antiguos, mini-PC, Raspberry Pi): borradores cortos, reescritura de frases y plantillas, asumiendo revision humana posterior.
- Respuestas plantilla y prototipado de flujos conversacionales en dispositivos sin GPU: sirve para validar la logica de negocio de un bot antes de sustituir el backend por un modelo mayor.
- Pruebas de despliegue en el borde (edge) y de consumo de memoria: medir latencia y uso de RAM con distintas longitudes de contexto y confirmar que el binario de `llama.cpp` se comporta como se espera.
- Comparacion de cuantizaciones y formatos: punto de partida barato para reproducir pipelines de conversion GGUF y evaluar el efecto de Q8_0 frente a otras cuantizaciones sobre el mismo modelo base.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

La model card no incluye MMLU, HumanEval, GSM8K, MT-Bench ni ninguna otra metrica, y las busquedas web realizadas no han devuelto material tecnico relevante sobre este release (los resultados obtenidos no guardan relacion con el modelo y se descartan). No se han inventado cifras.

## Requisitos de hardware

- VRAM estimada: inferior a 512 MB. Con 134,5 M de parametros en Q8_0, los pesos ocupan del orden de 0,14 GB (el repositorio completo pesa 0,1 GB), a lo que se suma el estado de la cache KV, muy reducido incluso con contextos de unos pocos miles de tokens.
- Memoria del sistema: ejecutable con holgura en equipos con 2-4 GB de RAM; tambien en SBC tipo Raspberry Pi 4/5 y en moviles mediante bindings de llama.cpp.
- GPU: no necesita GPU dedicada. Funciona en CPU y, si hay GPU, se beneficia de cualquier modelo, incluida una RTX 4090, GPUs integradas o aceleradores tipo Apple Silicon mediante Metal.
- Cabe en GPU de consumo: si, en todas. Tambien convive con otros procesos sin presion de memoria apreciable.
- Opciones de despliegue: `llama.cpp` (`llama-server`, `llama-cli`), `llama-cpp-python`, Ollama mediante importacion del GGUF y la propia aplicacion Boollm. El soporte en servidores de alto rendimiento tipo vLLM o TGI no esta documentado para este artefacto y no se puede confirmar.
- Ejemplo oficial de arranque: `llama-server -hf Boollm/Boollm-Small-135M -c 2048`.
- Latencia y throughput: no disponibles. No se publican mediciones de tokens por segundo ni de tiempo hasta el primer token.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato principal | Notas |
|---|---|---|---|---|---|
| Boollm-Small-135M | 134.515.008 | No disponible | Apache-2.0 | GGUF Q8_0 | Reempaquetado sin fine-tuning; proposito de prueba de concepto |
| HuggingFaceTB/SmolLM2-135M-Instruct | 135 M (mismo peso base) | No disponible | Apache-2.0 | safetensors | Modelo base del que procede este release; identico en pesos |
| Qwen2.5-0.5B-Instruct | ~0,5 B (dato no verificado en la informacion proporcionada) | No disponible | Apache-2.0 (no verificado) | safetensors / GGUF | Alternativa de tamano inmediatamente superior para tareas conversacionales |
| TinyLlama-1.1B-Chat | ~1,1 B (dato no verificado en la informacion proporcionada) | No disponible | Apache-2.0 (no verificado) | safetensors / GGUF | Alternativa mas capaz en generacion de texto, con mayor coste de memoria |

Advertencia: los datos de las tres alternativas no proceden de la informacion proporcionada en esta busqueda y no han podido verificarse aqui; se incluyen unicamente como referencia de categoria. La comparacion relevante y verificable es la primera fila frente a la segunda: Boollm-Small-135M no aporta ninguna mejora de capacidad sobre SmolLM2-135M-Instruct, solo un cambio de formato y un manifiesto de procedencia.

## Limitaciones y advertencias

- No es un modelo afinado: la model card afirma que no se ha aplicado fine-tuning alguno, por lo que las etiquetas `education`, `tutoring` y `writing` describen escenarios de uso previstos, no capacidades entrenadas especificamente.
- Tamano muy reducido: con 135 M de parametros, las respuestas pueden ser superficiales, inexactas o incoherentes. El propio autor lo advierte.
- Riesgo alto de alucinacion en cualquier dominio factual, agravado por la ausencia de benchmarks publicados.
- Prohibido como fuente unica en entornos de alto riesgo: la model card excluye explicitamente enfermeria, medicina, legal, seguridad, certificaciones tecnologicas y matematicas.
- Sin capacidades de vision: no procesa imagenes. Las tareas multimodales se reservan, segun el autor, a un modelo mayor de la linea Boollm-Edu.
- Idiomas no declarados: no se puede confirmar el soporte de castellano ni de otras lenguas; el comportamiento fuera del ingles no esta documentado.
- Longitud de contexto no especificada en la model card; el unico dato operativo es el `-c 2048` del ejemplo.
- Una sola cuantizacion disponible (Q8_0), lo que limita el ajuste fino de la relacion tamano/calidad en despliegues muy restringidos.
- Sin traccion comunitaria: 0 descargas y 0 likes en el momento de la consulta, y fechas de creacion y actualizacion separadas por 10 segundos. Conviene tratar el artefacto como no auditado por terceros.
- Licencia: Apache-2.0 permite uso comercial, pero es obligado conservar el aviso de licencia y la atribucion al modelo base SmolLM2-135M-Instruct, tal como indica el archivo `LICENSE` del repositorio.
- Caveat de produccion: no se documentan latencia, throughput, consumo energetico ni comportamiento con peticiones concurrentes, por lo que no hay base para dimensionar un servicio real con este modelo.

## Enlaces

- Repositorio del modelo en HuggingFace: https://huggingface.co/Boollm/Boollm-Small-135M
- Modelo base: https://huggingface.co/HuggingFaceTB/SmolLM2-135M-Instruct
- Archivos del release: `Boollm-Small-135M.Q8_0.gguf`, `LICENSE`, `release-manifest.json` (alojados en el repositorio anterior)
- Paper, blog, repositorio de codigo o demo especificos de este release: no disponibles. La model card no incluye enlaces adicionales.
- Resultados de busqueda web: ninguna fuente relevante sobre este modelo. Las busquedas realizadas devolvieron contenido no relacionado con el ambito tecnico, por lo que se descartan y no se enlazan.
