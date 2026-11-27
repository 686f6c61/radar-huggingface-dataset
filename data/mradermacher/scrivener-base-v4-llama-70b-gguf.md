# mradermacher/Scrivener-Base-V4-LLaMA-70B-GGUF

## Resumen

Scrivener-Base-V4-LLaMA-70B-GGUF es la version cuantizada en formato GGUF del modelo Scrivener-Base-V4-LLaMA-70B, publicado por el usuario mradermacher. El modelo original procede de TareksGraveyard y se ha generado mediante mergekit, es decir, es un merge de modelos (fusion de pesos) construido sobre la arquitectura LLaMA de 70.000 millones de parametros. Esta version GGUF tiene como objetivo facilitar la inferencia local y en hardware de consumo mediante llama.cpp y herramientas compatibles, sin necesidad de GPUs de datacenter.

El repositorio ofrece un conjunto de cuantizaciones estaticas que van desde Q2_K (26,5 GB) hasta Q8_0 (75,1 GB), lo que permite desplegar el modelo en un rango amplio de configuraciones de memoria. El modelo esta etiquetado unicamente para ingles y su naturaleza de merge implica que no dispone de una model card tecnica detallada sobre datos de entrenamiento, proceso de alineamiento o evaluacion.

La relevancia de esta ficha radica en que documenta un artefacto de cuantizacion de un merge de 70B que, pese a su escasa difusion (30 descargas en el momento de la consulta), resulta representativo del ecosistema de modelos comunitarios: pesos derivados, licencia no declarada y ausencia de benchmarks publicos. Es, por tanto, un caso util para ilustrar que precauciones debe tomar un equipo antes de adoptar un modelo de este tipo en produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only basada en LLaMA (modelo fusionado con mergekit) |
| Parametros totales | 70.554.280.000 (70,55B) |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0 |
| Idiomas soportados | Ingles (en) |
| Licencia | no disponible |
| Formato de pesos | GGUF (cuantizaciones); el modelo base en safetensors |
| Tamano del repositorio | 481,3 GB |
| Modelo base | TareksGraveyard/Scrivener-Base-V4-LLaMA-70B |
| Libreria declarada | transformers |
| Metodo de creacion | mergekit (fusion de pesos) y posterior cuantizacion estatica |

## Arquitectura y entrenamiento

El modelo subyacente es un transformer decoder-only de la familia LLaMA con 70.554.280.000 parametros, segun los datos de safetensors del modelo base. No obstante, no se trata de un modelo entrenado desde cero, sino de un merge generado con mergekit: una tecnica que combina los pesos de varios modelos preentrenados o ajustados para producir un nuevo checkpoint sin un entrenamiento adicional completo. La model card no especifica que modelos se fusionaron, con que metodo (por ejemplo, SLERP, TIES, DARE o linear) ni con que hiperparametros.

No hay informacion disponible sobre el volumen de tokens de entrenamiento, la composicion del dataset, ni sobre procesos de RLHF, DPO o SFT aplicados al modelo. Tampoco se documentan innovaciones tecnicas como decodificacion especulativa, atencion lineal o modos de razonamiento extendido. La unica informacion tecnica concreta del repositorio es la relativa a la cuantizacion: se han generado cuantizaciones estaticas (sin imatrix), y el autor remite a su repositorio i1-GGUF para las versiones ponderadas con imatrix, que suelen ofrecer mejor calidad por tamano.

## Capacidades

- Generacion de texto conversacional en ingles, segun la etiqueta `conversational` del repositorio.
- Razonamiento general y respuesta a instrucciones, derivado del modelo base fusionado (no verificado con benchmarks).
- Compatibilidad con endpoints de inferencia (etiqueta `endpoints_compatible`), lo que permite desplegarlo en infraestructuras tipo Hugging Face Inference Endpoints.
- Ejecucion local mediante llama.cpp y derivados (Ollama, LM Studio, koboldcpp) gracias al formato GGUF.
- Soporte multilingue limitado al ingles declarado; no se documentan capacidades en castellano ni en otros idiomas.
- No se documentan capacidades de tool calling, function calling, agentes, vision, audio ni modo de razonamiento explicito.

## Casos de uso

- Experimentacion con merges de 70B en local: investigadores que quieran evaluar cualitativamente un modelo fusionado sin depender de infraestructura cloud, usando la cuantizacion Q4_K_M (42,6 GB) en una estacion de trabajo con suficiente VRAM o RAM.
- Generacion de texto en ingles para prototipos: el modelo puede emplearse para redactar borradores, resumir o reescribir contenido en ingles dentro de pipelines de prueba, aprovechando la disponibilidad de cuantizaciones ligeras como Q2_K (26,5 GB) para entornos con memoria limitada.
- Base para fine-tuning posterior: al estar disponible el modelo base en safetensors y las versiones GGUF, un equipo puede partir del checkpoint original para un ajuste supervisado en ingles y luego cuantizar de nuevo.
- Despliegue en endpoints compatibles: la etiqueta `endpoints_compatible` permite servirlo mediante Hugging Face Inference Endpoints o infraestructura equivalente para pruebas de integracion con aplicaciones existentes.
- Evaluacion comparativa de tecnicas de merge: util para equipos que investigan mergekit y quieren contrastar la calidad de un merge de 70B frente a sus modelos progenitores en tareas de generacion abierta.
- Sustitucion de respaldo en entornos sin GPU de datacenter: con Q4_K_S o Q4_K_M y llama.cpp, puede ejecutarse en servidores con CPU y RAM abundante (64-128 GB) para tareas de baja concurrencia y no criticas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del repositorio GGUF no incluye metricas de MMLU, HumanEval, GSM8K ni de ninguna otra evaluacion, y el modelo base tampoco documenta resultados en la informacion proporcionada.

## Requisitos de hardware

- VRAM/RAM estimada segun cuantizacion: Q2_K ~26,5 GB; Q3_K_S ~31,0 GB; Q3_K_M ~34,4 GB; Q3_K_L ~37,2 GB; IQ4_XS ~38,4 GB; Q4_K_S ~40,4 GB; Q4_K_M ~42,6 GB; Q5_K_S ~48,8 GB; Q5_K_M ~50,1 GB; Q6_K ~58,0 GB; Q8_0 ~75,1 GB.
- Para cargar el modelo completo en VRAM se necesita al menos una GPU con memoria igual o superior al tamano del archivo mas el overhead de contexto; en la practica, Q4_K_M requiere ~48 GB de VRAM, lo que apunta a A100 80GB, H100 80GB, RTX 6000 Ada (48 GB) o configuraciones multi-GPU.
- En GPUs de consumo: una RTX 4090 (24 GB) no puede alojar el modelo completo; es viable con offloading parcial a RAM del sistema mediante llama.cpp, a costa de latencia. Una RTX 3090/4090 con 64-128 GB de RAM puede ejecutar Q2_K o Q3_K_S con rendimiento reducido.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, koboldcpp y servidores compatibles con GGUF; para el modelo base en safetensors, vLLM o TGI (no verificados con este checkpoint).
- Latencia y throughput: no disponibles. No se han publicado mediciones de tokens por segundo para ninguna de las cuantizaciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Scrivener-Base-V4-LLaMA-70B-GGUF | 70,55B | no disponible | no disponible | GGUF | Merge comunitario, solo ingles, sin benchmarks |
| Llama 3.1 70B Instruct | 70B | 128K | Llama 3.1 Community License | safetensors, GGUF | Modelo oficial de Meta, multilingue, con benchmarks publicos |
| Qwen2.5 72B Instruct | 72B | 128K | Apache 2.0 (segun version) | safetensors, GGUF | Multilingue, con evaluaciones publicadas |
| Mistral Large 2 | 123B | 128K | Mistral Research License | safetensors | Mayor tamano, licencia restrictiva para uso comercial |

La comparacion debe tomarse con cautela: los tres modelos alternativos cuentan con documentacion tecnica, licencia explicita y evaluaciones publicas, mientras que Scrivener-Base-V4 carece de todos esos elementos. En terminos de tamano, es directamente comparable a Llama 3.1 70B y Qwen2.5 72B, pero no hay datos que permitan afirmar equivalencia de calidad.

## Limitaciones y advertencias

- Licencia no declarada: no se especifica bajo que terminos puede usarse el modelo, lo que impide determinar si el uso comercial esta permitido. Adoptarlo en produccion sin aclarar este punto es un riesgo legal.
- Ausencia de benchmarks: no hay evidencia publica de rendimiento en tareas estandar, por lo que la calidad del merge es desconocida.
- Modelo de fusión sin documentacion: se desconoce que modelos se combinaron y con que metodo, lo que dificulta evaluar sesgos heredados y comportamientos esperados.
- Solo ingles declarado: no se garantiza un rendimiento aceptable en castellano ni en otros idiomas.
- Contexto no documentado: se desconoce la longitud maxima de contexto soportada, lo que limita el diseno de aplicaciones con ventanas largas.
- Riesgo de alucinacion: inherente a los modelos de lenguaje de esta escala y no mitigado por un alineamiento documentado (no consta RLHF ni DPO).
- Escasa difusion: 30 descargas y 0 likes en el momento de la consulta; no hay comunidad que haya validado el modelo.
- Cuantizaciones estaticas: las versiones de este repositorio no usan imatrix; para mayor calidad por tamano, el autor remite a su repositorio i1-GGUF.
- Repositorio de gran tamano (481,3 GB): requiere planificacion de almacenamiento y ancho de banda para la descarga.
- Sin garantias de mantenimiento: el modelo base y el repositorio de cuantizacion dependen de usuarios individuales, no de una organizacion con soporte.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/Scrivener-Base-V4-LLaMA-70B-GGUF
- Modelo base: https://huggingface.co/TareksGraveyard/Scrivener-Base-V4-LLaMA-70B
- Cuantizaciones con imatrix: https://huggingface.co/mradermacher/Scrivener-Base-V4-LLaMA-70B-i1-GGUF
- Pagina de resumen del autor: https://hf.tst.eu/model#Scrivener-Base-V4-LLaMA-70B-GGUF
- Preguntas frecuentes y solicitudes de modelos: https://huggingface.co/mradermacher/model_requests
- Guia de uso de GGUF (README de TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Analisis de tipos de cuantizacion de Artefact2: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
