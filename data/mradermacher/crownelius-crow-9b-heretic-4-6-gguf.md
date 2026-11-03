# mradermacher/Crownelius-Crow-9B-HERETIC-4.6-GGUF

## Resumen

Crownelius-Crow-9B-HERETIC-4.6-GGUF es la distribucion en formato GGUF del modelo Soundsus/Crownelius-Crow-9B-HERETIC-4.6, un modelo de lenguaje de aproximadamente 8.950 millones de parametros (8,95 B) afinado para tareas conversacionales, de razonamiento y de agente. La cuantizacion la firma mradermacher, un publicador habitual de versiones GGUF de modelos abiertos, que ofrece el modelo en el rango de 3,9 GB (Q2_K) a 18,0 GB (f16), ademas de dos ficheros mmproj (Q8_0 y f16) que actuan como complemento multimodal.

El modelo base se presenta con licencia Apache 2.0 y declara soporte para 26 idiomas, entre ellos castellano, ingles, chino, ruso, frances, aleman, japones, coreano, arabe, portugues, italiano, neerlandes, sueco, polaco, turco, hebreo, indonesio, ucraniano, persa, punyabi, malayo, finlandes, griego, afrikaans, islandes y suajili. La model card del autor del modelo indica un entrenamiento sobre una mezcla de datasets orientados a escritura creativa, codigo, matematicas y razonamiento, e incluye la etiqueta "agent", lo que sugiere un enfasis en flujos de trabajo con llamadas a herramientas.

La relevancia practica de esta ficha reside en que el GGUF permite ejecutar un modelo de 9 B en hardware de consumo mediante llama.cpp y derivados (Ollama, LM Studio, koboldcpp), algo inviable con los pesos en safetensors de 18 GB en f16. No obstante, la informacion publica disponible es escasa: no hay pipeline declarado, no se publican benchmarks y la model card del cuantizador se limita a listar los ficheros y remitir al modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base de tipo transformer; la informacion proporcionada no detalla la arquitectura interna) |
| Parametros totales | 8.953.803.264 (8,95 B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16; ademas mmproj-Q8_0 y mmproj-f16 |
| Idiomas soportados | en, zh, ru, es, fr, it, ja, ko, af, de, ar, tr, is, pl, sw, sv, nl, he, id, uk, fa, pa, pt, ms, fi, el (26 idiomas) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (cuantizado); el modelo base en safetensors |

## Arquitectura y entrenamiento

La informacion proporcionada no detalla la arquitectura interna del modelo base Soundsus/Crownelius-Crow-9B-HERETIC-4.6: no se especifica si es un transformer denso, un MoE o una arquitectura hibrida, ni se indica el numero de capas, dimensiones ocultas o mecanismo de atencion. El recuento de parametros (8,95 B) y el tamano del repositorio (83,0 GB, que incluye todas las cuantizaciones) son los unicos datos estructurales verificables.

Respecto al entrenamiento, la model card del modelo base lista los datasets utilizados: crownelius/Creative_Writing_ShareGPT_Enhanced (escritura creativa en formato ShareGPT), microsoft/rStar-Coder (codigo), peteromallet/dataclaw-peteromallet, crownelius/Opus-4.6-Reasoning-3300x (razonamiento), openbmb/UltraData-Math (matematicas), Unreleased/Dataset y Crownelius/Crow-Heretic-TeichAI-Unified. No se indica el numero total de tokens de entrenamiento, la composicion porcentual del dataset, ni si se aplicaron tecnicas de RLHF, DPO o preferencia. Tampoco se documentan innovaciones tecnicas como decodificacion especulativa o atencion lineal. La presencia de ficheros mmproj en el repositorio GGUF sugiere capacidad multimodal (vision), aunque la model card no la describe en detalle.

## Capacidades

- Generacion de texto conversacional multi-turno, con etiqueta "agent" en los metadatos del modelo.
- Razonamiento: el dataset crownelius/Opus-4.6-Reasoning-3300x apunta a entrenamiento especifico en cadenas de razonamiento.
- Generacion de codigo: entrenado con microsoft/rStar-Coder.
- Matematicas: entrenado con openbmb/UltraData-Math.
- Escritura creativa: dataset Creative_Writing_ShareGPT_Enhanced.
- Capacidad multimodal: el repositorio incluye ficheros mmproj (Q8_0 y f16), lo que indica soporte de entrada de imagenes en llama.cpp, aunque la model card no detalla el alcance.
- Soporte multilingue declarado para 26 idiomas, incluido el castellano.
- Soporte de tool calling / function calling: no confirmado explicitamente en la informacion disponible; la etiqueta "agent" y el tag endpoints_compatible sugieren compatibilidad con flujos de agente, pero no se documenta el formato.
- Capacidades de agente y razonamiento multi-paso: inferidas de la etiqueta "agent", sin documentacion tecnica adicional.

## Casos de uso

- Asistente conversacional local en castellano: el modelo declara soporte de es y puede desplegarse con llama.cpp u Ollama en una estacion de trabajo, lo que permite conversaciones multi-turno sin enviar datos a la nube. Adecuado para entornos con requisitos de privacidad.
- Generacion de codigo en local: al estar entrenado con rStar-Coder, puede usarse como asistente de autocompletado o explicacion de codigo en IDE mediante integraciones con llama.cpp. La cuantizacion Q4_K_M (5,7 GB) permite ejecutarlo en una GPU de consumo.
- Resolucion de problemas matematicos paso a paso: el entrenamiento con UltraData-Math y el dataset de razonamiento lo orientan a tareas de matematica explicada, util en herramientas educativas o de verificacion de calculos.
- Escritura creativa y generacion de contenido: el dataset Creative_Writing_ShareGPT_Enhanced lo hace adecuado para redaccion de relatos, guiones o copy, con la ventaja de ejecucion local y sin coste por token.
- Prototipado de agentes: la etiqueta "agent" y el tag endpoints_compatible permiten integrarlo en frameworks de agentes (LangChain, LlamaIndex) como backend local para pruebas de flujos multi-paso antes de migrar a modelos mayores.
- Traduccion y procesamiento multilingue: con 26 idiomas declarados, puede emplearse para traduccion entre pares de idiomas europeos y asiaticos en pipelines por lotes, aunque la calidad por idioma no esta documentada.
- Analisis de imagenes en local: los ficheros mmproj permiten, en teoria, entrada multimodal en llama.cpp; util para prototipos de descripcion de imagenes o extraccion de texto, siempre que se valide la calidad real.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (solo pesos, sin overhead de contexto): Q2_K ~3,9 GB; Q4_K_M ~5,7 GB; Q6_K ~7,5 GB; Q8_0 ~9,6 GB; f16 ~18,0 GB. Anadir entre 1 y 3 GB adicionales para la cache KV segun la longitud de contexto.
- GPU recomendadas: RTX 3060 12 GB o superior para Q4_K_M y Q5_K_M con contexto moderado; RTX 4070/4080 16 GB para Q6_K y Q8_0; A100 40 GB o H100 para f16 con contexto largo y lotes grandes.
- Cabe en GPU de consumo: si. Q4_K_S y Q4_K_M (5,5-5,7 GB) caben en GPUs de 8 GB con contexto corto; Q8_0 requiere 12 GB o mas.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, koboldcpp y cualquier runtime compatible con GGUF. Para los ficheros mmproj se necesita una version de llama.cpp con soporte multimodal (llama-server con --mmproj).
- Latencia y throughput: no disponibles. Como referencia orientativa para un modelo denso de 9 B en Q4_K_M, una RTX 4090 suele superar las decenas de tokens por segundo, pero no se aportan mediciones oficiales para este modelo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Crownelius-Crow-9B-HERETIC-4.6-GGUF | 8,95 B | no disponible | Apache 2.0 | GGUF | 26 idiomas, mmproj multimodal, etiqueta agent |
| Qwen2.5-7B-Instruct (GGUF) | 7,6 B | 32.768 tokens (modelo base) | Apache 2.0 | GGUF, safetensors | Referencia habitual en 7-8 B; benchmarks publicados |
| Llama-3.1-8B-Instruct (GGUF) | 8,0 B | 131.072 tokens (modelo base) | Llama 3.1 Community License | GGUF, safetensors | Contexto largo; licencia con restricciones de uso |
| Mistral-7B-Instruct-v0.3 (GGUF) | 7,2 B | 32.768 tokens (modelo base) | Apache 2.0 | GGUF, safetensors | Multilingue limitado; amplia adopcion |

La comparativa se limita a parametros, contexto declarado y licencia; no hay datos de rendimiento de Crownelius-Crow-9B en la informacion disponible, por lo que no es posible comparar calidad. Los datos de contexto de los modelos alternativos corresponden a sus model cards publicas y no se han verificado en esta ficha.

## Limitaciones y advertencias

- Ausencia total de benchmarks: no hay datos de MMLU, HumanEval, GSM8K ni evaluaciones humanas, por lo que la calidad real es desconocida.
- Modelo de procedencia poco documentada: el autor del modelo base (Soundsus) y los datasets propios (Crownelius, Unreleased/Dataset) no cuentan con documentacion publica sobre composicion, filtrado o deduplicacion.
- Riesgo de alucinacion: sin evaluaciones de factualidad ni datos de RLHF documentados, el riesgo de respuestas inventadas es alto, especialmente en dominios especializados.
- Contexto desconocido: no se declara la longitud de contexto, lo que impide planificar aplicaciones con ventanas largas.
- Idiomas: aunque se declaran 26 idiomas, no hay evaluacion por idioma; la calidad en castellano, arabe, hebreo o punyabi puede ser muy inferior a la del ingles.
- Multimodalidad no validada: la presencia de mmproj no garantiza que el modelo base tenga un encoder de vision funcional; conviene probarlo antes de usarlo en produccion.
- Licencia Apache 2.0: permite uso comercial, pero el modelo base y los datasets pueden tener condiciones adicionales no reflejadas en la model card; conviene revisar el repositorio original.
- Cuantizaciones de baja calidad: Q2_K y Q3_K pueden degradar notablemente el rendimiento; para produccion se recomienda Q4_K_M o superior.
- Fecha de creacion futura en los metadatos (2026-04-13): inconsistencia que sugiere que los metadatos del repositorio no son fiables.
- Sin garantias de mantenimiento: el repositorio es una cuantizacion estatica de un tercero; no hay compromiso de actualizacion ni soporte.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/Crownelius-Crow-9B-HERETIC-4.6-GGUF
- Modelo base: https://huggingface.co/Soundsus/Crownelius-Crow-9B-HERETIC-4.6
- Cuantizaciones imatrix: https://huggingface.co/mradermacher/Crownelius-Crow-9B-HERETIC-4.6-i1-GGUF
- Pagina de resumen del cuantizador: https://hf.tst.eu/model#Crownelius-Crow-9B-HERETIC-4.6-GGUF
- FAQ y solicitudes de cuantizacion: https://huggingface.co/mradermacher/model_requests
- Guia de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Analisis de tipos de cuantizacion (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Dataset Creative_Writing_ShareGPT_Enhanced: https://huggingface.co/datasets/crownelius/Creative_Writing_ShareGPT_Enhanced
- Dataset rStar-Coder: https://huggingface.co/datasets/microsoft/rStar-Coder
- Dataset UltraData-Math: https://huggingface.co/datasets/openbmb/UltraData-Math
