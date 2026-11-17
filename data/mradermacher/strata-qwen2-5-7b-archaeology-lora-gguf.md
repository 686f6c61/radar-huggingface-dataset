# mradermacher/Strata-Qwen2.5-7B-Archaeology-LoRA-GGUF

## Resumen

Strata-Qwen2.5-7B-Archaeology-LoRA-GGUF es una cuantizacion en formato GGUF del modelo Srihari2020/Strata-Qwen2.5-7B-Archaeology-LoRA, un ajuste fino con QLoRA (via Unsloth) sobre Qwen2.5-7B orientado al dominio de la arqueologia. El trabajo de cuantizacion lo firma mradermacher, un publicador habitual de versiones GGUF de modelos de la comunidad, y el resultado esta pensado para su uso con llama.cpp y entornos compatibles (Ollama, LM Studio, etc.).

El modelo hereda la arquitectura transformer densa de Qwen2.5-7B, con 7.615.616.512 parametros totales, y anade un ajuste especifico para consultas arqueologicas, con enfasis en recuperacion aumentada (RAG) sobre ChromaDB segun las etiquetas de la model card. El idioma declarado es unicamente ingles. La licencia es Apache 2.0.

Su relevancia es acotada: se trata de una variante de nicho, con cero descargas y cero likes en el momento de la consulta, y sin benchmarks publicados. Resulta util para quien necesite un asistente especializado en arqueologia ejecutable en hardware de consumo, pero no debe confundirse con un modelo de proposito general ni con una mejora medible sobre el Qwen2.5-7B original en tareas fuera de dominio.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (derivado de Qwen2.5-7B) |
| Parametros totales | 7.615.616.512 |
| Parametros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (heredada de Qwen2.5-7B; no confirmada) |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16 |
| Idiomas soportados | en (ingles) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (repo de 68,1 GB con todos los cuantizados); pesos originales en safetensors en el repo base |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Qwen2.5-7B, un transformer decoder-only denso con atencion causal estandar, RMSNorm, RoPE y capas MLP con SwiGLU. Sobre esa base se aplico un ajuste fino con QLoRA (cuantizacion de 4 bits durante el entrenamiento y adaptadores de bajo rango) usando la libreria Unsloth, que acelera y reduce el consumo de memoria del proceso. El resultado es un modelo denso de aproximadamente 7,6 mil millones de parametros, sin mezcla de expertos.

El dataset de entrenamiento se identifica como `custom-archaeology-deep-web`, es decir, un corpus propio de tematica arqueologica recopilado de la web. No se especifican en la informacion disponible el numero de tokens, la composicion exacta del dataset, ni si hubo fases de RLHF o DPO posteriores al ajuste supervisado. Las etiquetas `rag` y `chromadb` sugieren que el modelo fue entrenado o evaluado en el contexto de un pipeline de recuperacion aumentada, pero no se documenta la metodologia concreta. No se describen innovaciones tecnicas adicionales (decodificacion especulativa, atencion lineal, etc.).

## Capacidades

- Generacion de texto conversacional en ingles, con especializacion declarada en contenido arqueologico.
- Respuesta a preguntas sobre el dominio arqueologico, presumiblemente apoyada en el corpus `custom-archaeology-deep-web`.
- Integracion en pipelines de RAG: las etiquetas del modelo mencionan ChromaDB como base vectorial, lo que indica un uso previsto de recuperacion de documentos antes de la generacion.
- Soporte de conversacion multi-turno (etiqueta `conversational`).
- Compatibilidad con endpoints (etiqueta `endpoints_compatible`), lo que facilita su despliegue detras de APIs compatibles con el formato de Hugging Face.
- No se documentan capacidades de tool calling, function calling, agentes, razonamiento multi-paso explicito, vision, audio ni modo de pensamiento (thinking). No disponible.
- Capacidad multilingue limitada al ingles segun la model card; no se confirma soporte de castellano.

## Casos de uso

- Asistente de consulta arqueologica para investigadores: el modelo puede responder preguntas sobre yacimientos, periodos y terminologia especializada en ingles, apoyandose en su ajuste sobre corpus arqueologico. Adecuado para prototipos de consulta interna, no para publicacion sin revision.
- Pipeline RAG sobre documentacion de excavaciones: combinado con ChromaDB, permite indexar informes, fichas de yacimiento y articulos, y generar respuestas citando el contexto recuperado. Es el escenario que las etiquetas del modelo sugieren de forma mas directa.
- Clasificacion y resumen de textos arqueologicos: resumir informes tecnicos o extraer entidades (periodos, culturas, materiales) de documentos en ingles, con verificacion humana posterior.
- Chatbot educativo para museos o universidades: atender preguntas de estudiantes sobre historia material y metodos arqueologicos, ejecutandose en local para evitar costes de API y mantener la privacidad de los materiales docentes.
- Despliegue en hardware de consumo para investigacion de campo: con cuantizaciones Q4_K_M (4,8 GB) cabe en GPUs de 8 GB o incluso en CPU, lo que permite usar el modelo en portatiles sin conexion durante campanas.
- Generacion de borradores de fichas descriptivas: redactar descripciones preliminares de piezas o contextos a partir de notas estructuradas, siempre con supervision de un especialista.
- Prototipado rapido de asistentes de dominio: servir como base para experimentar con ajustes adicionales o con tecnicas de RAG antes de invertir en modelos mayores.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del cuantizador no incluye metricas de MMLU, HumanEval, GSM8K ni evaluaciones especificas de dominio arqueologico, y el repo base no aporta datos en la informacion proporcionada.

## Requisitos de hardware

- VRAM estimada para inferencia (aproximada, segun tamano de fichero GGUF):
  - Q2_K: ~3,1 GB de pesos; ~4-5 GB de VRAM con contexto moderado.
  - Q4_K_M: ~4,8 GB de pesos; ~6-7 GB de VRAM.
  - Q5_K_M: ~5,5 GB de pesos; ~7-8 GB de VRAM.
  - Q6_K: ~6,4 GB de pesos; ~8-9 GB de VRAM.
  - Q8_0: ~8,2 GB de pesos; ~10-11 GB de VRAM.
  - f16: ~15,3 GB de pesos; ~17-18 GB de VRAM.
- GPU recomendadas: RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070/4080/4090 para cuantizaciones altas; A100 o H100 solo si se busca throughput alto o precision f16 con contexto largo.
- Cabe en GPU de consumo: si, desde 8 GB con Q4_K_M; tambien es viable en CPU con llama.cpp para cuantizaciones bajas.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, y servidores compatibles con GGUF (por ejemplo, llama-cpp-python). vLLM y TGI no soportan GGUF de forma nativa en todas sus versiones; para esos motores convendria usar el modelo base en safetensors.
- Latencia y throughput: no disponibles. Dependen del hardware y de la cuantizacion; no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| Strata-Qwen2.5-7B-Archaeology-LoRA (este) | 7,6 B | no disponible | en | Apache 2.0 | GGUF, safetensors | Ajuste de nicho en arqueologia; sin benchmarks |
| Qwen2.5-7B (base) | 7,6 B | 128 K (segun documentacion oficial de Qwen; no confirmado en esta ficha) | multilingue | Apache 2.0 | safetensors, GGUF | Proposito general, con benchmarks publicados por el autor |
| Qwen2.5-7B-Instruct | 7,6 B | 128 K (segun documentacion oficial) | multilingue | Apache 2.0 | safetensors, GGUF | Version alineada para instrucciones; referencia habitual para comparar |
| Mistral-7B-Instruct | 7,2 B | 32 K | multilingue | Apache 2.0 | safetensors, GGUF | Alternativa generalista de tamano similar |

La comparacion con Qwen2.5-7B-Instruct es la mas relevante: este Strata parte de la misma base y anade especializacion, pero no hay datos que permitan afirmar que mejora al original en tareas generales; es probable que lo degrade fuera de dominio. Frente a Mistral-7B-Instruct, la diferencia principal es la especializacion arqueologica y el ecosistema de cuantizaciones de mradermacher.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados. Al entrenarse sobre un corpus web de arqueologia, puede heredar sesgos de las fuentes (predominio de perspectivas occidentales, sesgo geografico hacia yacimientos europeos y norteamericanos).
- Riesgo de alucinacion: alto en un modelo de 7 B ajustado sobre un corpus de nicho; las referencias bibliograficas, fechas y atribuciones culturales deben verificarse siempre contra fuentes primarias.
- Limitacion de idioma: solo ingles declarado. No se garantiza un rendimiento aceptable en castellano ni en otras lenguas.
- Limitacion de contexto: la longitud de contexto no se confirma en la informacion disponible; no asumir los 128 K de Qwen2.5 sin verificacion empirica.
- Licencia: Apache 2.0 permite uso comercial, pero el modelo base Qwen2.5-7B tambien es Apache 2.0, por lo que no hay restricciones adicionales conocidas. Aun asi, conviene revisar los terminos del repo base por si el autor anadio condiciones.
- Advertencia de produccion: cero descargas y cero likes en el momento de la consulta implican ausencia de validacion comunitaria. No se recomienda desplegar en produccion sin evaluacion propia en el dominio objetivo.
- El cuantizador indica que no hay cuantizaciones con imatrix (weighted) disponibles; las static pueden tener peor perplejidad que las ponderadas en cuantizaciones bajas (Q2_K, Q3_K).
- El repo pesa 68,1 GB por incluir todos los cuantizados; descargar solo el fichero necesario.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/Strata-Qwen2.5-7B-Archaeology-LoRA-GGUF
- Modelo base (LoRA): https://huggingface.co/Srihari2020/Strata-Qwen2.5-7B-Archaeology-LoRA
- Pagina de resumen del cuantizador: https://hf.tst.eu/model#Strata-Qwen2.5-7B-Archaeology-LoRA-GGUF
- Guia de uso de GGUF (referencia de TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Solicitudes de cuantizacion de mradermacher: https://huggingface.co/mradermacher/model_requests
- Analisis de tipos de cuantizacion (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Grafico comparativo de cuantizaciones (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Unsloth (libreria de entrenamiento): https://github.com/unslothai/unsloth
- Qwen2.5 (familia base): https://huggingface.co/Qwen/Qwen2.5-7B
