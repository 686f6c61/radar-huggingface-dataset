# mradermacher/polyedit-qwen3-8b-property-v1-GGUF

## Resumen

Polyedit Qwen3 8B Property v1 (en su versión GGUF cuantizada por mradermacher) es un modelo de lenguaje ajustado a partir de Qwen3 8B mediante full-finetuning, especializado en el dominio de la química de polímeros. El modelo base fue entrenado por el usuario luca0621 sobre el conjunto de datos luca0621/polyedit-korean-property-instructions-v6, un dataset de instrucciones en coreano orientado a tareas de predicción y edición de propiedades de polímeros. La versión aquí descrita es una recopilación de cuantizaciones estáticas en formato GGUF que permite ejecutar el modelo en hardware de consumo.

Su relevancia radica en la escasez de modelos abiertos especializados en ciencia de materiales y polímeros: mientras la mayoría de los LLM generales rinden de forma mediocre en tareas de química computacional de polímeros, este modelo se ha ajustado específicamente para ese nicho, en coreano. El repositorio cuantizado ha registrado 434 descargas, lo que indica un uso de nicho pero activo.

El modelo base conserva la arquitectura transformer densa de Qwen3 con 8.190.735.360 parámetros. No se ha publicado información sobre la longitud de contexto resultante tras el ajuste, ni sobre los procedimientos de alineación posteriores.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (familia Qwen3) |
| Parametros totales | 8.190.735.360 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16 |
| Idiomas soportados | Coreano (ko, segun la model card) |
| Licencia | qwen-apache-with-polyone-reference-terms (licencia "other"; ver LICENSE.md del modelo base) |
| Formato de pesos | GGUF (esta version); el modelo base esta en safetensors |

## Arquitectura y entrenamiento

El modelo parte de Qwen3 8B, un transformer decoder-only denso de la familia Qwen de Alibaba, y se ha sometido a un ajuste completo de pesos (full-finetuning, segun los tags del repositorio), no a técnicas ligeras como LoRA. El ajuste se realizo sobre el dataset luca0621/polyedit-korean-property-instructions-v6, un conjunto de instrucciones en coreano centrado en propiedades de polímeros, presumiblemente tareas de tipo pregunta-respuesta o edicion sobre datos de propiedades poliméricas (tag "polymer" y "chemistry").

No se ha publicado informacion sobre el numero de tokens de entrenamiento, la composicion detallada del dataset, ni sobre el uso de tecnicas de alineacion como RLHF o DPO. Tampoco hay detalles publicados sobre innovaciones tecnicas en la inferencia. La version de mradermacher es una cuantizacion estatica posterior (conversion HF a GGUF) sin imatrix en el momento de publicacion, con cuantizaciones desde Q2_K (3,4 GB) hasta f16 (16,5 GB).

## Capacidades

- Prediccion y razonamiento sobre propiedades de polímeros: el ajuste esta orientado a tareas del dominio de la ciencia de polímeros (tags "polymer" y "chemistry").
- Seguimiento de instrucciones en coreano: el dataset de ajuste esta etiquetado en idioma coreano (ko).
- Capacidades conversacionales: el repositorio incluye el tag "conversational".
- Capacidades generales heredadas de Qwen3 8B: generacion de texto, razonamiento general, codigo y matematicas, en la medida en que el full-finetuning no haya degradado el rendimiento base (no hay datos publicados al respecto).
- No hay evidencia publicada de soporte de tool calling, function calling, agentes, vision ni audio en esta version ajustada.

## Casos de uso

- Prediccion de propiedades de polímeros en coreano: dado un monomero, formula o descripcion de un polímero, el modelo puede generar estimaciones de propiedades (termicas, mecanicas, etc.) siguiendo el formato de instrucciones del dataset de ajuste.
- Asistente de investigacion en ciencia de materiales: integracion en flujos de trabajo de laboratorios coreanos para consultas rapidas sobre propiedades poliméricas sin depender de APIs cerradas.
- Edicion y revision de datos de polímeros: el nombre "polyedit" sugiere utilidad para corregir o completar registros en bases de datos de polímeros mediante instrucciones en lenguaje natural.
- Generacion de informes tecnicos en coreano: redaccion de resumenes sobre materiales combinando el conocimiento quimico ajustado con las capacidades linguisticas de Qwen3.
- Despliegue local en entornos sin conexion: gracias a los GGUF, puede ejecutarse en portatiles o estaciones de trabajo aisladas (comun en industria quimica por confidencialidad), con la variante Q4_K_M en unos 5,1 GB.
- Prototipado de aplicaciones de quimica asistida por LLM: base ligera para experimentar con agentes especializados en materiales usando llama.cpp u Ollama en hardware de consumo.
- Evaluacion comparativa de modelos de dominio: util como referencia para medir cuanto mejora un fine-tuning de dominio frente a un Qwen3 8B general en tareas de polímeros.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Ni la model card del modelo cuantizado ni los metadatos del repositorio incluyen evaluaciones (MMLU, HumanEval, GSM8K ni metricas especificas del dominio de polímeros).

## Requisitos de hardware

- VRAM estimada para inferencia: depende de la cuantizacion elegida. Q2_K ocupa 3,4 GB; Q4_K_M, 5,1 GB (recomendada); Q6_K, 6,8 GB; Q8_0, 8,8 GB; f16, 16,5 GB. Anade margen para el KV cache segun la longitud de contexto utilizada.
- GPU recomendadas: cualquier GPU con 6-8 GB de VRAM (RTX 3060, RTX 4060 Ti, RTX 4070) basta para las cuantizaciones Q4; con 12-16 GB (RTX 4080, RTX 4090) pueden usarse Q6_K o Q8_0 con contextos amplios. En servidores, A100 o H100 permiten despliegues concurrentes con vLLM si se usa el modelo base en safetensors.
- Cabe en GPU de consumo: si. La variante Q4_K_S o Q4_K_M (4,9-5,1 GB) funciona en GPUs de gama media; tambien es viable la ejecucion solo en CPU o hibrida CPU+GPU mediante llama.cpp.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, GPT4All y cualquier runtime compatible con GGUF. Para el modelo base en formato original: transformers, vLLM o TGI.
- Latencia y throughput: no disponible. Al ser un modelo denso de 8B con cuantizaciones de 4 bits, puede esperarse un rendimiento tipico de modelos 7-8B en GGUF Q4, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Especializacion | Contexto | Licencia | Formato |
|---|---|---|---|---|---|
| polyedit-qwen3-8b-property-v1 (este) | 8,19 B | Propiedades de polímeros (coreano) | no disponible | qwen-apache-with-polyone-reference-terms | GGUF / safetensors |
| Qwen3 8B (base) | 8,19 B | General, con modo thinking | no disponible en la informacion proporcionada | Apache 2.0 (base Qwen) | safetensors / GGUF |
| Llama 3.1 8B Instruct | 8 B | General | 128k | Llama 3.1 Community License | safetensors / GGUF |
| Mistral 7B Instruct v0.3 | 7 B | General | 32k | Apache 2.0 | safetensors / GGUF |

Frente a los modelos generales de tamano similar, este modelo ofrece un ajuste especifico en química de polímeros con datos en coreano, un nicho que las alternativas no cubren; a cambio, carece de documentacion publica de benchmarks y su licencia incluye terminos de referencia adicionales ("polyone reference terms") que conviene revisar antes de uso comercial.

## Limitaciones y advertencias

- Especializacion estrecha: el ajuste se centra en polímeros y en coreano; el rendimiento en otros dominios o idiomas puede haberse degradado respecto a Qwen3 8B base, y no hay datos que lo cuantifiquen.
- Riesgo de alucinacion: como todo LLM, puede generar valores de propiedades quimicas plausibles pero incorrectos. En aplicaciones de ciencia de materiales, los resultados deben validarse siempre con datos experimentales o simulaciones.
- Cuantizaciones bajas: las variantes Q2_K y Q3_K_M tienen calidad reducida (la propia model card marca Q3_K_M como "lower quality"); para trabajo tecnico serio se recomienda Q4_K_M o superior.
- Cuantizaciones estaticas: no hay versiones imatrix disponibles en el momento de la publicacion, por lo que la calidad en cuantizaciones intermedias podria mejorar con futuras versiones ponderadas.
- Licencia condicionada: la licencia "qwen-apache-with-polyone-reference-terms" combina terminos tipo Apache de Qwen con condiciones de referencia adicionales de PolyOne; es obligatorio revisar el archivo LICENSE.md del modelo base antes de cualquier despliegue comercial.
- Contexto y capacidades no documentados: no se ha publicado la longitud de contexto efectiva ni el soporte de tool calling tras el fine-tuning; asume las limitaciones del modelo base como punto de partida.
- Sesgos: no se ha publicado ninguna evaluacion de sesgos; el modelo hereda los sesgos del corpus de preentrenamiento de Qwen3 y del dataset de instrucciones de dominio.

## Enlaces

- Modelo cuantizado (GGUF): https://huggingface.co/mradermacher/polyedit-qwen3-8b-property-v1-GGUF
- Modelo base: https://huggingface.co/luca0621/polyedit-qwen3-8b-property-v1
- Licencia del modelo base: https://huggingface.co/luca0621/polyedit-qwen3-8b-property-v1/blob/main/LICENSE.md
- Dataset de entrenamiento: https://huggingface.co/datasets/luca0621/polyedit-korean-property-instructions-v6
- Pagina de descargas del cuantizador: https://hf.tst.eu/model#polyedit-qwen3-8b-property-v1-GGUF
- FAQ y peticiones de cuantizacion: https://huggingface.co/mradermacher/model_requests
- Notas sobre calidad de cuantizaciones (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
