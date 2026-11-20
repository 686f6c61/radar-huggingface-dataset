# mradermacher/Qwen3.8-27B-Brainwaves-WFH-GGUF

## Resumen
Qwen3.8-27B-Brainwaves-WFH-GGUF es una cuantizacion estatica en formato GGUF del modelo nightmedia/Qwen3.8-27B-Brainwaves-WFH, un modelo de lenguaje de 27.320.697.856 parametros (aproximadamente 27,3 mil millones) orientado a generacion de texto, razonamiento con cadena de pensamiento larga, codigo y escritura creativa. El trabajo de cuantizacion lo firma mradermacher, un publicador habitual de cuantizaciones GGUF para llama.cpp, mientras que el modelo base procede de nightmedia y esta construido sobre la familia Qwen (las etiquetas mencionan qwen3_5, qwen3_6, qwen3.6 y qwen3.5), con tecnicas de destilacion, SFT y LoRA, y una fusion via mergekit. La licencia declarada es Apache 2.0.

El modelo base se presenta como un modelo instruido, conversacional y multilingue (ingles, chino, japones y espanol), con etiquetas que apuntan a contextos de hasta 256k e incluso 1M de tokens, aunque no se documenta de forma tecnica como se alcanzan esas longitudes. Tambien incorpora un componente multimodal: el repositorio incluye ficheros mmproj (Q8_0 y f16) que actuan como suplemento para vision dentro del ecosistema llama.cpp. El interes practico de esta ficha radica en que permite ejecutar un modelo de 27B en hardware de consumo mediante cuantizaciones de 11 a 29,1 GB, algo imposible con los pesos en bf16.

La ficha se centra en la version GGUF, que es la publicada en este repositorio, y advierte de que el modelo es experimental: la model card original no aporta detalles de arquitectura interna, composicion del dataset de entrenamiento ni resultados de benchmarks, por lo que buena parte de las especificaciones tecnicas deben marcarse como no disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only derivado de la familia Qwen (etiquetas qwen3_5/qwen3_6); detalles internos no disponibles |
| Parametros totales | 27.320.697.856 (27,3B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | 256k y 1M tokens segun etiquetas del autor; sin confirmacion tecnica |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, mmproj-Q8_0, mmproj-f16; versiones imatrix en repositorio i1 |
| Idiomas soportados | en, zh, ja, es |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (pesos originales del modelo base presumiblemente safetensors/bf16, no incluidos en este repo) |

## Arquitectura y entrenamiento
No se dispone de la model card completa del modelo base, por lo que la arquitectura no esta documentada en detalle. Las etiquetas indican que es un transformer de la familia Qwen (referencias a qwen3.5 y qwen3.6), con 27,3B parametros y sin indicios de ser un modelo de mezcla de expertos. El pipeline declarado es text-generation y la libreria transformers, con pesos originales en bf16 segun las etiquetas.

En cuanto al entrenamiento, las etiquetas mencionan destilacion desde Claude (claude4.6, claude-distillation), SFT, LoRA, razonamiento con cadena de pensamiento larga (long-cot), y una fusion de modelos realizada con mergekit (tags mergekit y merge). Tambien aparecen referencias a "polaris" y "polaris-alpha", presumiblemente nombres internos de las variantes fusionadas. No se especifica el numero de tokens de entrenamiento, la composicion del dataset ni si hubo RLHF o DPO. La cuantizacion de mradermacher es estatica (quantize_version 2, output_tensor_quantised 1, convert_type hf) y se ofrece ademas una version con imatrix para mejorar la calidad en cuantizaciones bajas.

## Capacidades
- Generacion de texto conversacional multi-turno con instrucciones.
- Razonamiento explicito con cadena de pensamiento larga (long-cot, thinking).
- Generacion de codigo y tareas de investigacion tecnica.
- Matematicas y disciplinas STEM.
- Escritura creativa: ficcion, generacion de tramas y subtramas, continuacion de escenas, ciencia ficcion y todos los generos.
- Roleplay y escritura con prosa vivida.
- Capacidades multilingues en ingles, chino, japones y espanol.
- Soporte multimodal de vision a traves de los ficheros mmproj incluidos en el repositorio.
- Soporte de tool calling y function calling: no documentado en la informacion disponible.
- Soporte de agentes y razonamiento multi-paso: no documentado explicitamente, aunque el modo de razonamiento largo es compatible con este uso.

## Casos de uso
- Asistencia a desarrolladores en generacion de codigo: el modelo puede completar funciones, explicar fragmentos y proponer refactorizaciones; su ventana de contexto declarada de 256k permite cargar repositorios o modulos completos en una sola sesion.
- Escritura creativa y narrativa larga: gracias a las etiquetas especificas de ficcion, generacion de tramas y continuacion de escenas, es adecuado para talleres de escritura, generacion de borradores de novelas o guiones con coherencia entre capitulos.
- Roleplay y simulacion conversacional: el modelo esta ajustado para mantener personajes y estilo, util en prototipos de videojuegos narrativos o entrenamiento de agentes conversacionales.
- Razonamiento matematico y STEM en entornos educativos: el modo de cadena de pensamiento larga permite mostrar el desarrollo de un problema paso a paso, util para tutoria automatizada.
- Analisis de documentos extensos en espanol o multilingue: con contexto de 256k, puede resumir contratos, informes o articulos largos en ingles, chino, japones o espanol.
- Procesamiento de imagenes en pipelines locales: los ficheros mmproj permiten usar el modelo con entrada visual en llama.cpp para tareas de descripcion de imagenes o extraccion de informacion de capturas y diagramas.
- Despliegue en estaciones de trabajo sin GPU de datacenter: las cuantizaciones Q4_K_M (16,9 GB) y Q5_K_M (19,6 GB) permiten ejecutar el modelo en una unica GPU de consumo de 24 GB, habilitando prototipos de asistentes internos con datos que no salen de la organizacion.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware
- VRAM estimada para inferencia (pesos mas cache KV, que crece con el contexto): Q2_K en torno a 11 GB; Q3_K_M en torno a 13,6 GB; IQ4_XS en torno a 15,5 GB; Q4_K_M en torno a 16,9 GB; Q5_K_M en torno a 19,6 GB; Q6_K en torno a 22,5 GB; Q8_0 en torno a 29,1 GB.
- GPU recomendadas: RTX 4090 o RTX 3090 (24 GB) para Q4_K_M y Q5_K_M con contextos moderados; A100 40/80 GB, H100 o L40S para Q8_0 y contextos largos; para contextos de 256k o superiores se requiere memoria adicional para la cache KV y, en la practica, hardware de datacenter o configuraciones multi-GPU.
- Cabe en GPU de consumo: si, en tarjetas de 16 GB con Q3_K_M o IQ4_XS y contexto corto, y en tarjetas de 24 GB con Q4_K_M o Q5_K_M; las cuantizaciones Q6_K y Q8_0 quedan fuera del rango de 24 GB.
- Opciones de despliegue: llama.cpp y sus derivados (Ollama, LM Studio, llama-cpp-python), asi como servidores compatibles con la API de OpenAI; vLLM y TGI no soportan GGUF de forma nativa generalizada, por lo que para esos motores habria que usar los pesos originales en safetensors.
- Latencia y throughput: no disponibles; dependen del hardware, de la cuantizacion y de la longitud de contexto, y no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Qwen3.8-27B-Brainwaves-WFH-GGUF (este) | 27,3B | 256k/1M segun etiquetas | Apache 2.0 | GGUF | Cuantizacion de un merge experimental con destilacion de Claude; sin benchmarks publicados |
| Modelos Qwen3 de ~27-32B (familia oficial) | ~27-32B | variable, hasta 128k en variantes recientes | Apache 2.0 en la mayoria de variantes | safetensors, GGUF | Referencia de la familia base; con benchmarks publicados por el desarrollador original |
| Gemma 3 27B | 27B | 128k | Gemma license (uso comercial permitido con condiciones) | safetensors, GGUF | Alternativa multimodal de tamano comparable con evaluaciones oficiales |
| Mistral Small 3.x (24B) | 24B | 32k-128k segun version | Apache 2.0 | safetensors, GGUF | Modelo denso de tamano cercano, ampliamente desplegado en local |

La comparacion cuantitativa de rendimiento no es posible porque este repositorio no publica benchmarks; la tabla se limita a parametros, contexto, licencia y disponibilidad.

## Limitaciones y advertencias
- Modelo experimental: procede de una fusion (mergekit) y de destilacion, sin evaluacion publicada; el comportamiento puede ser irregular en tareas fuera del dominio de escritura creativa y conversacion.
- Riesgo de alucinacion: al no haber benchmarks ni documentacion de entrenamiento, no es posible acotar la tasa de errores facticos; en produccion requiere verificacion externa.
- Contexto declarado no verificado: las etiquetas de 256k y 1M tokens no van acompanadas de metodologia; a esas longitudes la calidad de recuperacion suele degradarse y el consumo de memoria de la cache KV es elevado.
- Cobertura idiomatica: solo se declaran en, zh, ja y es; el espanol aparece en las etiquetas pero no se especifica el volumen de datos ni la calidad esperada, por lo que conviene evaluarlo antes de usarlo en produccion en castellano.
- Licencia Apache 2.0: permite uso comercial, pero el modelo incorpora tecnicas de destilacion de un modelo propietario (Claude), lo que puede plantear dudas sobre las condiciones de los datos de destilacion; conviene revisar el modelo base antes de un despliegue comercial.
- Pesos originales no incluidos: este repositorio solo contiene GGUF; para entrenamiento o fine-tuning hay que acudir al modelo base nightmedia/Qwen3.8-27B-Brainwaves-WFH.
- Cuantizaciones bajas: Q2_K y Q3_K_S degradan la calidad de forma notable; para uso serio se recomienda Q4_K_M o superior, y la variante imatrix del repositorio i1.
- Tool calling y agentes: no documentados, por lo que no deben asumirse en disenos de produccion sin validacion previa.

## Enlaces
- Repositorio GGUF: https://huggingface.co/mradermacher/Qwen3.8-27B-Brainwaves-WFH-GGUF
- Modelo base: https://huggingface.co/nightmedia/Qwen3.8-27B-Brainwaves-WFH
- Cuantizaciones imatrix: https://huggingface.co/mradermacher/Qwen3.8-27B-Brainwaves-WFH-i1-GGUF
- Pagina de descargas del cuantizador: https://hf.tst.eu/model#Qwen3.8-27B-Brainwaves-WFH-GGUF
- Guia de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Solicitudes de cuantizacion de mradermacher: https://huggingface.co/mradermacher/model_requests
- Analisis de tipos de cuantizacion (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
