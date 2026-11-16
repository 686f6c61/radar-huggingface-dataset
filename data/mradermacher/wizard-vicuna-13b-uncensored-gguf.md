# mradermacher/Wizard-Vicuna-13B-Uncensored-GGUF

## Resumen

Wizard-Vicuna-13B-Uncensored-GGUF es una distribucion de cuantizaciones estaticas en formato GGUF del modelo QuixiAI/Wizard-Vicuna-13B-Uncensored, publicada por el usuario mradermacher. El modelo original es un fine-tuning de LLaMA-13B desarrollado por el equipo de WizardLM, entrenado sobre el dataset wizard_vicuna_70k_unfiltered de Eric Hartford, que combina el estilo conversacional de Vicuna con el enfoque de instrucciones sinteticas de WizardLM, eliminando los filtros de alineamiento y rechazo. El resultado es un modelo de 13.015.864.320 parametros (13B) orientado a generacion de texto en ingles sin restricciones de contenido.

La relevancia de esta publicacion es practica: mradermacher ofrece el modelo original (que solo estaba disponible en precision completa) en once variantes GGUF cuantizadas, desde Q2_K (5,0 GB) hasta Q8_0 (13,9 GB), lo que permite ejecutarlo en hardware de consumo mediante llama.cpp, Ollama u otros runners compatibles con GGUF. Ademas, el autor mantiene una variante paralela con cuantizacion ponderada/imatrix en el repositorio Wizard-Vicuna-13B-Uncensored-i1-GGUF, que suele ofrecer mejor calidad por bit que las cuantizaciones estaticas.

Se trata de un modelo de la generacion de LLaMA 1 (arquitectura transformer decoder-only clasica, sin GQA ni atencion lineal), sin soporte documentado de tool calling, agentes o vision. Su interes actual es principalmente de investigacion sobre alineamiento, generacion sin censura y experimentacion con modelos conversacionales de 13B en local, no como modelo de produccion moderno.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia LLaMA 1, 13B) |
| Parametros totales | 13.015.864.320 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (el modelo base Vicuna se entreno con contexto de 2048 tokens, dato no confirmado en esta ficha) |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0 (estaticas); variantes i1/imatrix en repositorio separado |
| Idiomas soportados | Ingles (en) |
| Licencia | other (no especificada en detalle; hereda las restricciones del modelo base) |
| Formato de pesos | GGUF (cuantizaciones); el modelo base en transformers/safetensors |

## Arquitectura y entrenamiento

El modelo subyacente es un transformer decoder-only de 13B parametros de la familia LLaMA 1, con la arquitectura clasica de atencion multi-cabeza completa (sin grouped-query attention) y capas feed-forward densas. No emplea mezcla de expertos, state space models ni mecanismos hibridos. El fine-tuning parte de LLaMA-13B y se realiza en dos etapas: primero el ajuste conversacional estilo Vicuna y despues el entrenamiento sobre el dataset wizard_vicuna_70k_unfiltered, que contiene aproximadamente 70.000 pares instruccion-respuesta sin filtrado de contenido. No se documenta en la informacion disponible el numero exacto de tokens de entrenamiento, la composicion detallada del dataset ni si se aplicaron tecnicas de RLHF o DPO; el nombre "uncensored" indica precisamente la ausencia de etapas de rechazo o moderacion en los datos.

Las cuantizaciones publicadas por mradermacher se generan con el formato GGUF de llama.cpp, en version de cuantizacion 2 y con conversion de tensores de salida cuantizados (output_tensor_quantised: 1, segun los metadatos de la model card). No se documentan innovaciones tecnicas adicionales como decodificacion especulativa, atencion lineal o modos de razonamiento extendido.

## Capacidades

- Generacion de texto conversacional multi-turno en ingles, con estilo de instrucciones y respuestas detalladas.
- Generacion de codigo basico y explicaciones tecnicas (heredado del entrenamiento WizardLM sobre instrucciones sinteticas).
- Razonamiento de sentido comun y tareas de conocimiento general de nivel 13B de la generacion LLaMA 1.
- Respuestas sin rechazo ni filtros de contenido (modelo "uncensored"), incluyendo temas que los modelos alineados suelen declinar.
- No hay soporte documentado de tool calling ni function calling.
- No hay soporte documentado de agentes, multi-step reasoning estructurado ni modos de pensamiento.
- No hay capacidades de vision, audio ni multimodalidad.
- Multilingue: solo ingles segun los metadatos del repositorio.

## Casos de uso

- Experimentacion en local con modelos conversacionales de 13B: las cuantizaciones Q4_K_M (8,0 GB) y Q5_K_M (9,3 GB) permiten ejecutar el modelo en una GPU de consumo de 12-16 GB o en CPU con llama.cpp, ideal para laboratorios que quieran estudiar el comportamiento de modelos sin alineamiento.
- Investigacion sobre alineamiento y seguridad: el modelo sirve como linea base "uncensored" para comparar respuestas frente a modelos alineados en estudios de rechazo, sesgo y toxicidad, usando el mismo prompt en ambos y analizando diferencias.
- Generacion creativa sin restricciones: escritura de ficcion, guiones o narrativa con tematicas adultas o controvertidas que los modelos alineados filtran, ejecutando el GGUF con llama.cpp u Ollama en una estacion de trabajo.
- Prototipado de asistentes conversacionales en ingles: con Q4_K_S o Q4_K_M se puede montar un chatbot de demostracion en local sin coste de API, aceptable para pruebas internas de UX conversacional.
- Analisis de datos sinteticos de instrucciones: el modelo puede generar pares instruccion-respuesta para aumentar datasets de entrenamiento en dominios donde se busca diversidad estilistica, dado su origen en el dataset wizard_vicuna_70k_unfiltered.
- Despliegue en entornos aislados (air-gapped): al ser un GGUF autoconenido y ejecutable con llama.cpp, se puede usar en maquinas sin conexion a internet para tareas de generacion de texto interno, sin dependencias de servicios en la nube.
- Evaluacion de tecnicas de cuantizacion: comparar las once variantes publicadas (de Q2_K a Q8_0) permite medir la degradacion de perplejidad y calidad por bit en un modelo de 13B, util para decidir el punto de equilibrio tamano/calidad en despliegues propios.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia segun cuantizacion: Q2_K ~5,0 GB; Q3_K_S ~5,8 GB; Q3_K_M ~6,4 GB; Q3_K_L ~7,0 GB; IQ4_XS ~7,1 GB; Q4_K_S ~7,5 GB; Q4_K_M ~8,0 GB; Q5_K_S ~9,1 GB; Q5_K_M ~9,3 GB; Q6_K ~10,8 GB; Q8_0 ~13,9 GB. Anadir margen para el contexto KV cache (tipicamente 1-2 GB adicionales con contexto moderado).
- GPU recomendadas: RTX 3090/4090 (24 GB) para Q8_0 con contexto amplio; RTX 4070 Ti/4080 (16 GB) para Q5_K_M o Q6_K; RTX 4060 Ti 16 GB o RTX 3060 12 GB para Q4_K_M. A100/H100 no son necesarias para este tamano, aunque permiten mayor throughput en batch.
- Cabe en GPU de consumo: si, practicamente todas las cuantizaciones hasta Q6_K caben en GPUs de 12-16 GB; Q8_0 requiere 16 GB o mas.
- Opciones de despliegue: llama.cpp, Ollama, llama-cpp-python, text-generation-webui, LM Studio; el modelo base en transformers/safetensors puede servirse con vLLM o TGI, pero las cuantizaciones GGUF no son compatibles con vLLM de forma nativa.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Wizard-Vicuna-13B-Uncensored-GGUF (este) | 13,0B | no disponible | other | GGUF (11 cuantizaciones) | Base LLaMA 1, sin alineamiento, solo ingles |
| Vicuna-13B v1.5 | 13B | 2048 (segun documentacion publica de Vicuna) | no comercial (LLaMA 1) | safetensors, GGUF (TheBloke) | Conversacional alineado, base LLaMA 1 |
| WizardLM-13B | 13B | 2048 (segun documentacion publica) | no comercial (LLaMA 1) | safetensors, GGUF | Enfocado a instrucciones sinteticas, con filtros |
| Llama 2 13B Chat | 13B | 4096 | Llama 2 Community License | safetensors, GGUF | Generacion posterior, GQA, alineado con RLHF |

La comparativa se limita a caracteristicas estructurales porque no hay datos de benchmarks en la informacion proporcionada; no se dispone de cifras de MMLU, HumanEval o GSM8K para este modelo ni para las alternativas en el material consultado.

## Limitaciones y advertencias

- Modelo "uncensored": no incorpora filtros de rechazo, por lo que puede generar contenido ofensivo, ilegal o peligroso; requiere moderacion externa en cualquier despliegue con usuarios.
- Riesgo elevado de alucinacion: es un modelo de 13B de la generacion LLaMA 1, sin las mejoras de factualidad de modelos posteriores; no debe usarse como fuente de verdad sin verificacion.
- Solo ingles: los metadatos declaran idioma en; el rendimiento en castellano sera deficiente y no esta evaluado.
- Contexto limitado: la longitud de contexto no esta documentada en esta ficha; el modelo base Vicuna se entreno con 2048 tokens, insuficiente para tareas de contexto largo.
- Licencia "other": no se detallan los terminos; al derivar de LLaMA 1, es probable que herede restricciones de uso comercial, pero debe verificarse en el repositorio del modelo base antes de cualquier uso en produccion.
- Sin soporte de tool calling, agentes ni multimodalidad: no es adecuado para pipelines modernos que requieran function calling o razonamiento multi-paso estructurado.
- Datos de entrenamiento sin filtrar: el dataset wizard_vicuna_70k_unfiltered puede contener sesgos y contenido toxico que el modelo reproducira.
- Cuantizaciones de baja calidad: Q2_K y Q3_K_M degradan notablemente la calidad (la propia model card marca Q3_K_M como "lower quality"); para uso serio, emplear Q4_K_M o superior.
- Modelo de 2023 sobre arquitectura LLaMA 1: no compite en rendimiento con modelos actuales de 7-14B con GQA, contextos largos y alineamiento moderno.

## Enlaces

- Repositorio Hugging Face (GGUF): https://huggingface.co/mradermacher/Wizard-Vicuna-13B-Uncensored-GGUF
- Repositorio de cuantizaciones imatrix/ponderadas: https://huggingface.co/mradermacher/Wizard-Vicuna-13B-Uncensored-i1-GGUF
- Modelo base: https://huggingface.co/QuixiAI/Wizard-Vicuna-13B-Uncensored
- Dataset de entrenamiento: https://huggingface.co/datasets/ehartford/wizard_vicuna_70k_unfiltered
- Pagina de descargas del autor: https://hf.tst.eu/model#Wizard-Vicuna-13B-Uncensored-GGUF
- Guia de uso de GGUF (README de TheBloke referenciado por el autor): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Grafico comparativo de cuantizaciones (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas sobre cuantizaciones (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Peticiones de cuantizacion del autor: https://huggingface.co/mradermacher/model_requests
