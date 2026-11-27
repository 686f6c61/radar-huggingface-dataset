# mradermacher/Triangulum-10B-GGUF

## Resumen

Triangulum-10B-GGUF es la distribucion en formato GGUF del modelo Triangulum-10B, desarrollado originalmente por prithivMLmods y cuantizado por mradermacher. Se trata de un modelo de lenguaje de 10.305.653.760 parametros (aproximadamente 10,3 mil millones) afinado mediante SFT (supervised fine-tuning) sobre una base tipo Llama, orientado especificamente a tareas de razonamiento con cadenas de pensamiento (chain-of-thought, CoT). La licencia es llama3.1, lo que condiciona su uso comercial a los terminos de la Llama 3.1 Community License.

El modelo resuelve el problema de disponer de un LLM de tamano medio (10B) especializado en razonamiento explicito y descomposicion de problemas, distribuido en cuantizaciones que van desde Q2_K (4,0 GB) hasta f16 (20,7 GB). Esto permite su despliegue en hardware consumer, desde GPUs con 6-8 GB de VRAM en cuantizaciones agresivas hasta estaciones de trabajo con 24 GB para las versiones de mayor calidad. Es relevante porque combina un tamano manejable con capacidades multilingues (ocho idiomas) y un enfoque declarado hacia el razonamiento paso a paso.

La ficha documenta exclusivamente la version cuantizada; los datos de arquitectura interna, composicion del dataset de entrenamiento y resultados de benchmarks del modelo base no estan disponibles en la informacion proporcionada, por lo que se indican como tales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer tipo Llama (llama_for_causal_lm, segun tags); detalles internos no disponibles |
| Parametros totales | 10.305.653.760 (10,3 B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16 |
| Idiomas soportados | Ingles (en), aleman (de), frances (fr), italiano (it), portugues (pt), hindi (hi), espanol (es), tailandes (th) |
| Licencia | llama3.1 (Llama 3.1 Community License) |
| Formato de pesos | GGUF (cuantizaciones estaticas); el modelo base en safetensors |

## Arquitectura y entrenamiento

El modelo base es Triangulum-10B de prithivMLmods, etiquetado como `llama_for_causal_lm`, lo que indica una arquitectura transformer causal de tipo Llama con 10,3 mil millones de parametros. El proceso de entrenamiento declarado incluye SFT (supervised fine-tuning) y un enfasis en chain-of-thought (CoT) y razonamiento, segun los tags del repositorio. No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset, ni si se aplicaron tecnicas de RLHF o DPO.

La version documentada aqui es una cuantizacion estatica realizada por mradermacher mediante conversion desde el formato Hugging Face (`convert_type: hf`), con `quantize_version: 2` y cuantizacion de tensores de salida (`output_tensor_quantised: 1`). Existe tambien una variante con cuantizaciones ponderadas/imatrix en el repositorio `mradermacher/Triangulum-10B-i1-GGUF`, que suele ofrecer mejor calidad por tamano que las cuantizaciones estaticas equivalentes. No se detallan innovaciones arquitectonicas adicionales como atencion lineal o decodificacion especulativa.

## Capacidades

- Generacion de texto autoregresiva en ocho idiomas (en, de, fr, it, pt, hi, es, th).
- Razonamiento explicito mediante cadenas de pensamiento (chain-of-thought), segun los tags `reasoning` y `CoT`.
- Fine-tuning supervisado (SFT) orientado a instrucciones y tareas de razonamiento paso a paso.
- Compatibilidad con `text-generation-inference` y con endpoints compatibles (`endpoints_compatible`).
- Despliegue via Ollama (tag `ollama` presente en el repositorio).
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no confirmado explicitamente; el enfoque CoT sugiere capacidad de descomposicion, pero no hay documentacion al respecto.
- Capacidades de vision o audio: no disponibles.

## Casos de uso

- Razonamiento paso a paso en entornos con recursos limitados: el modelo puede generar cadenas de pensamiento explicitas en una GPU consumer gracias a las cuantizaciones Q4_K_M (6,4 GB) o Q5_K_M (7,4 GB), adecuadas para tarjetas de 8-12 GB de VRAM.
- Asistencia tecnica multilingue: al cubrir espanol, aleman, frances, italiano, portugues, hindi y tailandes, puede emplearse en sistemas de soporte que atiendan a usuarios en varios idiomas sin cambiar de modelo.
- Prototipado de pipelines de razonamiento en local: integrable con Ollama o llama.cpp para experimentar con prompting CoT sin depender de APIs externas.
- Educacion y tutoria: generacion de explicaciones razonadas y desglosadas de problemas, aprovechando el entrenamiento en chain-of-thought.
- Analisis y resumen de documentos en contextos con presupuesto de hardware ajustado: las versiones Q6_K (8,6 GB) y Q8_0 (11,1 GB) ofrecen alta calidad para tareas de comprension en estaciones de trabajo de 16-24 GB.
- Evaluacion comparativa de tecnicas de cuantizacion: el repositorio ofrece doce variantes de cuantizacion, lo que permite medir el impacto de la compresion en la calidad del razonamiento.
- Despliegue en servidores con TGI: compatible con text-generation-inference para servir el modelo en produccion con pesos GGUF o safetensors del modelo base.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (segun cuantizacion): Q2_K ~4,0 GB; Q3_K_S ~4,7 GB; Q4_K_M ~6,4 GB; Q5_K_M ~7,4 GB; Q6_K ~8,6 GB; Q8_0 ~11,1 GB; f16 ~20,7 GB. Anadir margen para el contexto KV cache.
- GPU recomendadas: RTX 3060 12 GB, RTX 4070 12 GB, RTX 4080 16 GB y RTX 4090 24 GB para cuantizaciones medias y altas; A100 o H100 para f16 y despliegues concurrentes.
- Cabe en GPU consumer: si, en cuantizaciones Q4_K_M y Q5_K_M con 8-12 GB de VRAM; Q8_0 requiere 12-16 GB; f16 requiere 24 GB.
- Opciones de despliegue: llama.cpp, Ollama (tag explicito), text-generation-inference (TGI), y cualquier runtime compatible con GGUF.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Triangulum-10B-GGUF | 10,3 B | No disponible | llama3.1 | GGUF | Especializado en CoT/razonamiento; 8 idiomas |
| Modelo base Triangulum-10B | 10,3 B | No disponible | llama3.1 | safetensors | Version sin cuantizar de la que deriva esta ficha |
| Variante i1-GGUF (imatrix) | 10,3 B | No disponible | llama3.1 | GGUF | Cuantizaciones ponderadas del mismo modelo, mayor calidad por tamano |

No se dispone de datos de rendimiento comparativo con otras familias de modelos de tamano similar en la informacion proporcionada.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados en la informacion disponible; al derivar de una base Llama, cabe esperar los sesgos habituales de este tipo de corpus.
- Riesgo de alucinacion: no cuantificado; el modo chain-of-thought puede producir razonamientos plausibles pero incorrectos si el modelo no esta bien alineado.
- Limitaciones de contexto: la longitud de contexto no esta documentada, lo que impide garantizar ventanas largas en produccion.
- Restricciones de licencia: la licencia llama3.1 impone condiciones a la Llama 3.1 Community License, incluidos requisitos de atribucion y politicas de uso aceptable; el uso comercial esta sujeto a dichos terminos.
- Calidad de cuantizaciones: las variantes Q2_K y Q3_K_M pueden degradar notablemente el razonamiento; el autor recomienda Q4_K_S/Q4_K_M y superiores para uso practico.
- Idiomas: el espanol esta soportado pero no se documenta su rendimiento relativo frente al ingles.
- Ausencia de benchmarks: no hay datos publicos de MMLU, HumanEval, GSM8K u otras metricas en la informacion disponible, lo que dificulta la evaluacion objetiva.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/Triangulum-10B-GGUF
- Modelo base: https://huggingface.co/prithivMLmods/Triangulum-10B
- Variante imatrix: https://huggingface.co/mradermacher/Triangulum-10B-i1-GGUF
- Pagina de descargas del autor: https://hf.tst.eu/model#Triangulum-10B-GGUF
- Guia de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Grafico de calidad de cuantizaciones (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas sobre cuantizacion (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Solicitudes de cuantizacion: https://huggingface.co/mradermacher/model_requests
