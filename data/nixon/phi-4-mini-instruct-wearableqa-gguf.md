# Nixon/Phi-4-mini-instruct-WearableQA-GGUF

## Resumen

Nixon/Phi-4-mini-instruct-WearableQA-GGUF es un conjunto de binarios GGUF cuantizados del modelo microsoft/Phi-4-mini-instruct (3.836.021.856 parametros), publicado por el usuario Nixon. No se trata de un fine-tuning ni de un modelo nuevo: es el mismo modelo base de 3,8B con ventana de 128.000 tokens, recomprimido en cinco niveles de cuantizacion (Q8_0, Q4_K_M, IQ4_XS, IQ3_M e IQ2_XXS) mediante llama.cpp y `llama-quantize`.

Su rasgo diferencial es el metodo de calibracion: la matriz de importancia (`domain.imatrix`) que guia la cuantizacion se genero a partir de tokens de dominio del dataset facebook/WearableQA (aproximadamente 60.000 tokens), no de un corpus generico. El objetivo declarado es preservar la precision de razonamiento en tareas de salud, datos fisiologicos y dispositivos vestibles en cuantizaciones de baja precision (IQ4_XS, IQ3_M, IQ2_XXS), donde una calibracion generica suele degradar mas la calidad.

Es relevante para quien necesite ejecutar un modelo conversacional de 3,8B en hardware muy limitado (edge, movil, GPU de baja VRAM) manteniendo el formato de chat nativo de Phi-4. El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y el unico material de validacion publicado son las tablas de tamano y BPW, sin resultados de benchmarks ni mediciones de perplejidad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (el repositorio no documenta la arquitectura interna del modelo base; se describe unicamente como cuantizacion GGUF de microsoft/Phi-4-mini-instruct) |
| Parametros totales | 3.836.021.856 (3,8B) |
| Parametros activos | no disponible (no se documenta que sea un modelo MoE) |
| Longitud de contexto | 128.000 tokens (heredada del modelo base segun la model card) |
| Tipos de cuantizacion | Q8_0 (8,00 BPW), Q4_K_M (4,50 BPW), IQ4_XS (4,25 BPW), IQ3_M (3,66 BPW), IQ2_XXS (2,06 BPW) |
| Idiomas soportados | en (ingles, segun la etiqueta de idioma del repositorio) |
| Licencia | MIT |
| Formato de pesos | GGUF (5 ficheros) + domain.imatrix (fichero de calibracion) |
| Biblioteca | gguf (llama.cpp) |
| Tamano del repositorio | 12,1 GB |
| Modelo base | microsoft/Phi-4-mini-instruct |
| Corpus de calibracion | facebook/WearableQA (~60.000 tokens de dominio) |

Detalle de los ficheros publicados:

| Fichero | Cuantizacion | Tamano (MB) | BPW | Uso recomendado por el autor |
|---|---|---|---|---|
| phi4-mini-Q8_0.gguf | Q8_0 | ~3.895 | 8,00 | Referencia de precision / evaluacion en servidor |
| phi4-mini-Q4_K_M.gguf | Q4_K_M | ~2.378 | 4,50 | Despliegue estandar en escritorio y servidor local |
| phi4-mini-IQ4_XS.gguf | IQ4_XS | ~2.121 | 4,25 | Objetivo edge recomendado (mejor relacion perplejidad/RAM) |
| phi4-mini-IQ3_M.gguf | IQ3_M | ~1.924 | 3,66 | GPUs de baja VRAM y entornos moviles |
| phi4-mini-IQ2_XXS.gguf | IQ2_XXS | ~1.244 | 2,06 | Memoria ultra-restringida / hardware vestible |

## Arquitectura y entrenamiento

El repositorio no aporta informacion sobre la arquitectura interna, los datos de entrenamiento ni el proceso de alineacion (RLHF/DPO) del modelo base. Lo que si documenta con precision es el pipeline de cuantizacion: partiendo de microsoft/Phi-4-mini-instruct (3,8B parametros, 128k de contexto), se genero un perfil `imatrix` a partir de tokens de dominio del dataset facebook/WearableQA y se compilo con llama.cpp (`-DGGML_CUDA=ON`), aplicando despues `llama-quantize --imatrix domain.imatrix` para producir los cinco niveles de cuantizacion. El formateo de prompts utiliza `tokenizer.apply_chat_template()` con la sintaxis nativa de Phi-4 Chat.

La innovacion tecnica, por tanto, no esta en el modelo sino en la calibracion: al derivar la matriz de importancia de datos fisiologicos y de wearables en lugar de texto generico, se busca que las capas mas sensibles para ese dominio conserven mas precision en cuantizaciones agresivas de 2-4 bits. El autor incluye `domain.imatrix` en el repositorio para reproducibilidad o para generar niveles de cuantizacion adicionales. No se publican mediciones de perplejidad, KL-divergence ni evaluaciones comparativas que cuantifiquen la mejora frente a una calibracion estandar, por lo que el beneficio declarado no esta verificado con numeros en la informacion disponible.

## Capacidades

- Generacion de texto conversacional en ingles, con soporte de dialogo multiturno y plantilla de chat nativa de Phi-4 (`<|user|> ... <|end|>` / `<|assistant|>`).
- Ventana de contexto de 128.000 tokens heredada del modelo base, adecuada para historiales largos de series temporales fisiologicas.
- Razonamiento sobre metricas de wearables: frecuencia cardiaca en reposo (RHR), variabilidad de la frecuencia cardiaca (HRV), temperatura cutanea y metricas derivadas del sueno, segun el ejemplo de widget incluido en la model card.
- Interpretacion de escenarios fisiologicos y sugerencia de metricas a revisar a continuacion (capacidad promovida por el autor mediante tareas de ejemplo, no validada con benchmarks publicados).
- Ejecucion local completa mediante llama.cpp, sin dependencia de API externa.
- Etiquetado como `endpoints_compatible`, lo que indica compatibilidad con infraestructuras de inferencia basadas en el formato de endpoints habitual.
- Capacidades del modelo base como tool calling, function calling, modo de razonamiento explicito, vision o audio: no documentadas en la informacion proporcionada.
- Capacidades multilingues: no documentadas; la etiqueta de idioma del repositorio declara unicamente ingles.

## Casos de uso

- Triaje de alertas fisiologicas en aplicaciones de salud: el modelo puede recibir un conjunto de lecturas (caida de HRV, elevacion de temperatura cutanea, RHR elevada) y devolver que metricas conviene revisar a continuacion, tal como ilustra el ejemplo de la model card. La ventana de 128k permite incluir el historial de varios dias en el mismo prompt.
- Asistente conversacional dentro de una app de wearables: con IQ4_XS (2.121 MB) o IQ3_M (1.924 MB) el modelo cabe en memoria de un dispositivo de gama media y permite mantener conversaciones multiturno sin enviar datos fisiologicos a la nube.
- Inferencia en el propio dispositivo vestible o en su gateway: la variante IQ2_XXS (1.244 MB, 2,06 BPW) esta pensada explicitamente para memoria ultra-restringida, lo que habilita resumenes y respuestas cortas generadas localmente en hardware tipo Raspberry Pi o modulo embebido.
- Resumen y explicacion de informes de sueno y recuperacion: el modelo puede transformar series crudas de HRV y temperatura en una explicacion en lenguaje natural para el usuario final, usando el contexto largo para cubrir varias noches.
- Preprocesado y enrutado en plataformas de telemonitorizacion: clasificar la gravedad aparente de una lectura y decidir si requiere revision humana, con llama.cpp como servidor local (`llama-server`) en una GPU de baja VRAM.
- Soporte a equipos de desarrollo de producto wearable: consultas sobre interpretacion de sensores, definicion de umbrales y redaccion de textos de ayuda dentro de la propia app, ejecutado en el portatil del desarrollador con Q4_K_M.
- Investigacion con datos sensibles: al ejecutarse en local y bajo licencia MIT, permite experimentar con razonamiento sobre datos fisiologicos sin exponerlos a servicios de terceros, siempre que el uso sea el de un asistente de analisis y no el de diagnostico.
- Educacion al paciente: generacion de explicaciones sencillas sobre que significan RHR y HRV y por que fluctuan, integradas en el flujo de una aplicacion movil.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio unicamente incluye la tabla de tamanos, tipos de cuantizacion y valores de BPW. No hay datos de MMLU, HumanEval, GSM8K, perplejidad, KL-divergence ni latencia/throughput, ni comparaciones medidas contra una cuantizacion calibrada de forma generica.

## Requisitos de hardware

- VRAM minima estimada segun fichero (solo pesos, sin cache KV): IQ2_XXS ~1,3 GB, IQ3_M ~2,0 GB, IQ4_XS ~2,2 GB, Q4_K_M ~2,4 GB, Q8_0 ~3,9 GB. A partir de IQ4_XS el modelo cabe holgadamente en cualquier GPU consumer con 4 GB o mas.
- La cache KV se suma aparte y crece de forma aproximadamente lineal con la longitud de contexto; la model card no publica cifras de memoria por token ni recomienda un limite maximo. El ejemplo de arranque del autor usa `-c 2048` y `-ngl 99` con `--flash-attn on`, es decir, descarga completa de capas en GPU y contexto corto.
- GPUs recomendadas: para Q8_0 una GPU con 6-8 GB (RTX 3060, RTX 4060, RTX 2070); para IQ4_XS o Q3_M cualquier GPU con 4 GB o mas (GTX 1650, RTX 3050, iGPU con memoria compartida suficiente); en servidores, A100/H100/L40S estan sobredimensionadas para 3,8B y solo se justifican por agregacion de muchas peticiones concurrentes.
- Cabe en GPU consumer: si, todas las variantes salvo la Q8_0 en GPUs de 2-3 GB. IQ2_XXS e IQ3_M estan pensadas para ello y para entornos moviles o embebidos.
- Opciones de despliegue: llama.cpp (`llama-cli`, `llama-server`, `llama-bench`), compilado con CUDA (`-DGGML_CUDA=ON`) o en modo CPU puro; importacion del GGUF en Ollama o LM Studio; uso desde Python via llama-cpp-python. El soporte de GGUF en vLLM o TGI es parcial y depende del tipo de cuantizacion, por lo que no puede asumirse para IQ2/IQ3/IQ4 sin verificacion previa.
- Latencia y throughput estimados: no disponible. No se publican mediciones de tokens por segundo ni de tiempo hasta el primer token en ninguna configuracion de hardware.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|
| Nixon/Phi-4-mini-instruct-WearableQA-GGUF | 3.836.021.856 | 128.000 tokens | MIT | GGUF (Q8_0, Q4_K_M, IQ4_XS, IQ3_M, IQ2_XXS) | 0 descargas, 0 likes |
| microsoft/Phi-4-mini-instruct | 3.8B | 128.000 tokens | El repositorio derivado declara MIT; la licencia del modelo base no se detalla en la informacion proporcionada | safetensors (modelo original, no cuantizado) | no disponible en la informacion proporcionada |

Alternativas de categoria equivalente (modelos densos de 2B-4B con soporte de llama.cpp), como Llama-3.2-3B-Instruct o Qwen2.5-3B-Instruct, no aparecen con datos verificables en la informacion disponible, por lo que no se incluyen cifras de parametros, contexto ni licencia. La busqueda web realizada no devolvio ningun resultado relacionado con este modelo: los resultados obtenidos corresponden a paginas homonimas sobre Richard Nixon y a la marca de relojes Nixon, sin relacion con el repositorio.

## Limitaciones y advertencias

- No es un modelo medico ni un dispositivo sanitario. Ninguna salida debe utilizarse para diagnostico, tratamiento o decision clinica sin supervision profesional.
- La calibracion con facebook/WearableQA mejora la retencion de pesos en el dominio, pero no convierte al modelo en un especialista entrenado: es el mismo Phi-4-mini-instruct, con los mismos sesgos y el mismo riesgo de alucinacion, especialmente al interpretar valores fisiologicos.
- No se publican benchmarks, perplejidad ni evaluaciones de seguridad. La afirmacion de que IQ4_XS ofrece la mejor relacion perplejidad/RAM es una recomendacion del autor sin datos que la respalden en el repositorio.
- El repositorio declara soporte unicamente de ingles. Cualquier uso en castellano u otros idiomas no esta documentado ni evaluado.
- La ventana de 128k es heredada del modelo base, pero el autor no publica cifras de memoria por token ni pruebas mas alla de un arranque con `-c 2048`; usar contextos muy largos en IQ2_XXS o IQ3_M puede degradar la calidad de forma no medida.
- Las cuantizaciones por debajo de 4 bits (IQ3_M, IQ2_XXS) introducen perdida de precision notable; el propio autor recomienda IQ4_XS como punto de equilibrio para edge, lo que sugiere que IQ2_XXS es una opcion de ultimo recurso.
- El corpus de calibracion es muy reducido (~60.000 tokens), lo que limita la representatividad del perfil imatrix frente a la diversidad real de datos de wearables.
- Repositorio sin traccion: 0 descargas y 0 likes en el momento de la consulta, sin validacion de la comunidad. Ademas, las fechas de creacion y actualizacion registradas (13 de septiembre de 2026) resultan incoherentes y conviene verificarlas antes de tomar el repositorio como referencia.
- Licencia MIT declarada por el autor; conviene confirmar la cadena de licencias con microsoft/Phi-4-mini-instruct antes de un uso comercial, ya que la model card del derivado no detalla la licencia del modelo base.
- La busqueda web no proporciono ninguna fuente independiente sobre este repositorio, por lo que toda la informacion tecnica procede exclusivamente de la model card del autor.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/Nixon/Phi-4-mini-instruct-WearableQA-GGUF
- Modelo base: https://huggingface.co/microsoft/Phi-4-mini-instruct
- Dataset de calibracion: https://huggingface.co/datasets/facebook/WearableQA
- Herramienta de cuantizacion: https://github.com/ggml-org/llama.cpp
- Resultados de la busqueda web: no se encontro ningun enlace relevante al modelo; los resultados obtenidos corresponden a paginas homonimas (Richard Nixon y la marca de relojes Nixon) sin relacion con el repositorio.
