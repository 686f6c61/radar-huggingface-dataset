# mradermacher/Qwen2-VL-7B-findings-137k-GGUF

## Resumen

`mradermacher/Qwen2-VL-7B-findings-137k-GGUF` es una coleccion de cuantizaciones GGUF estaticas del modelo `THP2903/Qwen2-VL-7B-findings-137k`, un ajuste fino supervisado (SFT) mediante TRL sobre la base Qwen2-VL-7B. El modelo resultante conserva la naturaleza multimodal de Qwen2-VL (texto e imagen) y ha sido entrenado sobre un dataset de "findings" de aproximadamente 137.000 muestras, orientado a generar hallazgos o informes descriptivos, presumiblemente en el ambito de imagen diagnostica. El autor de las cuantizaciones es mradermacher, un conocido publicador de versiones GGUF de modelos open source.

La relevancia de esta ficha radica en que permite ejecutar un modelo vision-lenguaje de 7.600 millones de parametros en hardware de consumo mediante llama.cpp y derivados, sin necesidad de GPU de datacenter. Sin embargo, se trata de un modelo de nicho: el ajuste fino esta especializado en un dominio concreto y la model card original no documenta ni la composicion del dataset, ni los hiperparametros, ni evaluaciones. La licencia no esta declarada en el repositorio, lo que constituye un riesgo legal para uso comercial.

El repositorio ocupa 68,1 GB e incluye 11 cuantizaciones estaticas desde Q2_K (3,1 GB) hasta f16 (15,3 GB). No se han publicado cuantizaciones con imatrix ni pesos ponderados por el autor en el momento de la ultima actualizacion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (Qwen2-VL), vision-lenguaje |
| Parametros totales | 7.615.616.512 (7,6 B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16 |
| Idiomas soportados | en |
| Licencia | no disponible |
| Formato de pesos | GGUF (cuantizaciones estaticas); modelo base en safetensors |
| Tamano del repositorio | 68,1 GB |
| Modelo base | THP2903/Qwen2-VL-7B-findings-137k |
| Metodo de ajuste | SFT con TRL |
| Proyector multimodal | omitido en las cuantizaciones (`skip_mmproj: 1`) |

## Arquitectura y entrenamiento

El modelo base THP2903/Qwen2-VL-7B-findings-137k parte de Qwen2-VL-7B, un transformer multimodal de la familia Qwen2-VL que combina un encoder visual con un decoder de lenguaje y un proyector que alinea ambos espacios. Sobre esa base se aplico un ajuste fino supervisado (SFT) con TRL, segun los tags del repositorio (`sft`, `trl`, `generated_from_trainer`). El nombre del modelo sugiere un dataset de aproximadamente 137.000 ejemplos de "findings", aunque no se documenta la composicion, el numero de tokens, la mezcla de datos ni si hubo etapas de RLHF o DPO adicionales.

Una advertencia tecnica importante: las cuantizaciones de este repositorio se generaron con `skip_mmproj: 1`, es decir, sin incluir el proyector multimodal en los ficheros GGUF. Esto implica que las versiones cuantizadas estan pensadas para uso exclusivamente textual o requieren el proyector original por separado para procesar imagenes. El autor tampoco ha publicado cuantizaciones con imatrix ni ponderadas, y las cuantizaciones son estaticas (sin calibracion por importancia de pesos).

## Capacidades

- Generacion de texto conversacional en ingles, heredada de la base Qwen2-VL.
- Capacidad multimodal teorica (imagen + texto) en el modelo base, aunque las cuantizaciones omiten el proyector `mmproj`, por lo que la entrada de imagenes no funciona directamente con estos ficheros.
- Generacion de "findings" o hallazgos descriptivos, presumiblemente orientada a informes de imagen diagnostica, segun el nombre del ajuste.
- Soporte de conversacion multi-turno mediante plantillas de chat de Qwen2-VL.
- Compatibilidad con endpoints (`endpoints_compatible` en los tags), lo que facilita su despliegue en plataformas de inferencia compatibles.
- No se documenta soporte explicito de tool calling, function calling, agentes, modo thinking, audio ni otras capacidades especiales en la informacion disponible.
- Multilingue: limitado a ingles segun el campo `language`.

## Casos de uso

- Generacion de informes descriptivos en ingles: el ajuste esta entrenado sobre ejemplos de "findings", por lo que puede emplearse para redactar descripciones estructuradas a partir de entradas textuales o, con el proyector original, de imagenes. Adecuado por su especializacion de dominio, no como modelo generalista.
- Prototipado local de asistentes conversacionales en ingles: las cuantizaciones Q4_K_M (4,8 GB) caben en GPU de consumo y permiten iterar rapidamente en un portatil con GPU dedicada.
- Evaluacion de ajustes finos de nicho: util para investigadores que quieran comparar el comportamiento de un SFT de dominio frente a la base Qwen2-VL-7B sin montar infraestructura de gran escala.
- Despliegue en entornos con recursos limitados: la version Q2_K (3,1 GB) permite ejecucion en CPU o GPUs con 4-6 GB de VRAM, util para demos o pruebas de concepto.
- Generacion de texto asistida por recuperacion (RAG) sobre documentacion clinica o tecnica en ingles: el modelo puede integrarse como generador final en un pipeline RAG, siempre que se valide la calidad del ajuste en el dominio concreto.
- Filtrado y clasificacion de hallazgos: puede usarse para resumir o reformular descripciones existentes en ingles dentro de un flujo de preprocesamiento de datos, aunque sin garantias de fidelidad clinica.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del repositorio GGUF no incluye metricas de MMLU, HumanEval, GSM8K ni evaluaciones multimodales, y el repositorio del modelo base tampoco aporta datos en la informacion suministrada.

## Requisitos de hardware

- VRAM estimada para inferencia (solo pesos, sin overhead de contexto): Q2_K ~3,1 GB; Q3_K_M ~3,9 GB; IQ4_XS ~4,4 GB; Q4_K_M ~4,8 GB; Q5_K_M ~5,5 GB; Q6_K ~6,4 GB; Q8_0 ~8,2 GB; f16 ~15,3 GB.
- En la practica, anadir 1-2 GB adicionales para KV cache y buffers segun la longitud de contexto configurada.
- GPU recomendadas: RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070/4080/4090 para cuantizaciones Q4-Q8; A100 o H100 solo si se requiere f16 y alto throughput.
- Cabe en GPU de consumo: si, desde una GTX 1660 6 GB con Q3_K_S hasta una RTX 4090 con Q8_0 o f16.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, y servidores compatibles con la API de OpenAI. vLLM y TGI no consumen GGUF de forma nativa, por lo que requeririan los pesos safetensors del modelo base.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Modalidad | Licencia | Formato |
|---|---|---|---|---|---|
| Qwen2-VL-7B-findings-137k (este) | 7,6 B | no disponible | texto + vision (proyector omitido en GGUF) | no disponible | GGUF, safetensors |
| Qwen2-VL-7B (base oficial) | 8,3 B aprox. | no disponible en esta ficha | texto + vision | Apache 2.0 (Qwen2-VL) | safetensors, GGUF (comunidad) |
| LLaVA-1.6 Mistral 7B | 7 B aprox. | no disponible en esta ficha | texto + vision | Apache 2.0 / Mistral | safetensors, GGUF (comunidad) |
| InternVL2-8B | 8 B aprox. | no disponible en esta ficha | texto + vision | MIT (InternVL2) | safetensors, GGUF (comunidad) |

La comparativa se limita a parametros y licencia porque no hay benchmarks publicados para este ajuste. La principal diferencia frente a las alternativas es su especializacion en "findings" y la ausencia de licencia declarada, lo que lo hace menos adecuado para produccion comercial que las bases oficiales con licencia permisiva.

## Limitaciones y advertencias

- Licencia no declarada: no se puede asumir uso comercial permitido. Es imprescindible contactar con el autor del modelo base antes de cualquier despliegue productivo.
- Proyector multimodal omitido (`skip_mmproj: 1`): las cuantizaciones no procesan imagenes de forma nativa; para uso vision-lenguaje hay que usar el modelo base en safetensors o anadir el `mmproj` por separado.
- Dataset de entrenamiento no documentado: se desconoce la composicion, procedencia y posibles sesgos de las 137.000 muestras, lo que impide evaluar riesgos de sesgo o contaminacion.
- Riesgo de alucinacion: al ser un SFT de dominio sin evaluaciones publicadas, no hay garantias de fidelidad factica, especialmente en un ambito sensible como hallazgos diagnosticos.
- Idioma: solo ingles declarado; el rendimiento en castellano no esta validado y probablemente sea inferior.
- Contexto: no se especifica la longitud de contexto efectiva del ajuste; el modelo base Qwen2-VL soporta contextos largos, pero no hay confirmacion de que el SFT los preserve.
- Cuantizaciones estaticas sin imatrix: las versiones de baja precision (Q2_K, Q3_K_S) pueden degradar notablemente la calidad; se recomienda Q4_K_M o superior para uso real.
- Sin benchmarks: no hay evidencia cuantitativa de mejora frente a la base Qwen2-VL-7B; el ajuste podria no aportar ventajas medibles en tareas generales.
- Uso clinico: si el dominio es imagen diagnostica, el modelo no debe usarse como herramienta de decision medica sin validacion regulatoria y supervision profesional.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/Qwen2-VL-7B-findings-137k-GGUF
- Modelo base: https://huggingface.co/THP2903/Qwen2-VL-7B-findings-137k
- Pagina de descargas del autor: https://hf.tst.eu/model#Qwen2-VL-7B-findings-137k-GGUF
- README de referencia para uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Guia de comparacion de cuantizaciones (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Solicitudes de cuantizacion del autor: https://huggingface.co/mradermacher/model_requests
