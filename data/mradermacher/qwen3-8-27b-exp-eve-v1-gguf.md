# mradermacher/Qwen3.8-27B-EXP-EVE-v1-GGUF

## Resumen

Qwen3.8-27B-EXP-EVE-v1-GGUF es una distribucion de cuantizaciones GGUF del modelo base win10/Qwen3.8-27B-EXP-EVE-v1, publicada por el usuario mradermacher. El modelo original es un transformer denso de 27.320.697.856 parametros (unos 27,3 mil millones) etiquetado con la arquitectura qwen3_5 y con marcas propias del autor del modelo base (eve, Evolution, Tensor Gene Evolution). Esta version no introduce cambios en los pesos mas alla de la conversion a formato GGUF y la cuantizacion, por lo que sus capacidades son las del modelo base.

La relevancia de esta publicacion es practica: permite ejecutar un modelo de ~27B en hardware de consumo y en entornos de inferencia local mediante llama.cpp y derivados (Ollama, LM Studio, llama-cpp-python), con un rango de cuantizaciones que va desde los 11,0 GB en Q2_K hasta los 29,1 GB en Q8_0. El repositorio incluye ademas dos ficheros mmproj (Q8_0 y f16), lo que indica soporte multimodal en el modelo base, aunque la model card no detalla la naturaleza exacta de esa modalidad.

El modelo declara licencia Apache 2.0 y soporte de los idiomas ingles y chino. La informacion publicada es escasa: no se documentan datos de entrenamiento, longitud de contexto, resultados de benchmarks ni detalles de alineacion, por lo que buena parte de las especificaciones tecnicas quedan como no disponibles en esta ficha.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso, etiquetado qwen3_5 (sin confirmacion de detalles internos) |
| Parametros totales | 27.320.697.856 (~27,3B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0; mmproj en Q8_0 y f16; versiones imatrix en repositorio i1-GGUF |
| Idiomas soportados | Ingles (en), chino (zh) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (original en safetensors/HF, segun el campo base_model) |

## Arquitectura y entrenamiento

El modelo base se presenta como un transformer denso de 27,3B parametros con etiqueta de arquitectura qwen3_5, lo que sugiere una variante de la familia Qwen de tercera generacion con modificaciones propias del autor (win10). Las etiquetas "eve", "Evolution" y "Tensor Gene Evolution" apuntan a un proceso de entrenamiento o fusion no convencional, probablemente orientado a evolucion de tensores, pero la model card no aporta ningun detalle sobre metodologia, numero de tokens de entrenamiento, composicion del corpus ni uso de RLHF, DPO o similares.

La unica informacion tecnica verificable en esta publicacion es la relativa a la cuantizacion: los quants se han generado con la herramienta de mradermacher (quantize_version 2, output_tensor_quantised 1, convert_type hf) y se ofrecen tanto quants estaticos como una variante con imatrix (weighted/imatrix quants) en el repositorio Qwen3.8-27B-EXP-EVE-v1-i1-GGUF. La presencia de ficheros mmproj confirma que el modelo base incorpora componentes multimodales, aunque no se especifica si se trata de vision, audio u otra modalidad.

## Capacidades

- Generacion de texto conversacional: el tag "conversational" y la categoria text-generation-inference indican uso previsto en dialogos multi-turno.
- Soporte multimodal: los ficheros mmproj (Q8_0 y f16) permiten cargar un proyector multimodal junto al modelo en llama.cpp, lo que habilita entrada de imagenes u otra modalidad no especificada.
- Multilingue limitado: solo se declaran ingles y chino; no hay evidencia de soporte de castellano en la informacion disponible.
- Compatibilidad con endpoints: el tag endpoints_compatible sugiere integracion con APIs compatibles con TGI.
- Razonamiento, codigo, matematicas y tool calling: no disponibles como capacidades documentadas en la informacion proporcionada.
- Modo thinking y agentes multi-paso: no disponibles como capacidades documentadas.

## Casos de uso

- Despliegue local en estaciones de trabajo: con Q4_K_M (16,9 GB) el modelo cabe en una GPU de 24 GB o en configuracion CPU+GPU con offloading parcial, lo que permite prototipar asistentes conversacionales sin depender de la nube.
- Experimentacion con modelos multimodales en llama.cpp: cargando el mmproj Q8_0 (0,7 GB) junto al quant Q4_K_M se puede evaluar el comportamiento multimodal del modelo base en pipelines de investigacion.
- Generacion de texto en ingles y chino: util para tareas de redaccion, resumen o traduccion bidireccional en esos dos idiomas, siempre con validacion humana por la falta de benchmarks.
- Servicio de inferencia con TGI o vLLM: el tag endpoints_compatible y el formato GGUF permiten montar un endpoint compatible con OpenAI en infraestructura propia para pruebas internas.
- Evaluacion comparativa de tecnicas de cuantizacion: la disponibilidad de 11 quants distintos y de una version imatrix permite medir el impacto de la cuantizacion en perplejidad y calidad sobre el mismo modelo base.
- Fine-tuning ligero sobre el modelo original: al estar el modelo base en safetensors y con licencia Apache 2.0, se puede partir de el para ajustes con LoRA y luego cuantizar el resultado a GGUF con el mismo pipeline.
- Investigacion sobre metodos de evolucion de tensores: dado el etiquetado "Tensor Gene Evolution", el modelo sirve como referencia para estudiar los efectos de ese tipo de entrenamiento frente a un transformer convencional.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (solo pesos, sin cache KV): 11,0 GB (Q2_K), 15,9 GB (Q4_K_S), 16,9 GB (Q4_K_M), 19,6 GB (Q5_K_M), 22,5 GB (Q6_K), 29,1 GB (Q8_0). Añadir 0,7-1,0 GB si se carga el proyector multimodal.
- GPU recomendadas: RTX 4090 (24 GB) para Q4_K_M y Q5_K_M; A100 40 GB o H100 para Q8_0 con contexto largo; RTX 3090/4080 (16-24 GB) para Q3_K_L o IQ4_XS.
- Cabe en GPU de consumo: si, en Q4_K_M o inferiores con 16-24 GB de VRAM; en GPUs de 12 GB solo con Q2_K o Q3_K_S y contexto reducido.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, llama-cpp-python, text-generation-inference (para el modelo base en safetensors), vLLM (modelo base), y servidores compatibles con la API de OpenAI.
- Latencia y throughput: no disponibles; dependen en gran medida de la cuantizacion, del backend y del hardware. Como referencia cualitativa, Q4_K_S y Q4_K_M estan marcados por el autor como "fast, recommended" y Q8_0 como "fast, best quality".

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Qwen3.8-27B-EXP-EVE-v1 (este, GGUF) | ~27,3B | no disponible | Apache 2.0 | GGUF | Quants de 11,0 a 29,1 GB; multimodal via mmproj |
| Qwen2.5-32B-Instruct (referencia de familia) | ~32,5B | 128K (segun documentacion oficial de Qwen) | Apache 2.0 | safetensors, GGUF | Mayor tamano; contexto documentado; amplia adopcion |
| Gemma 2 27B | ~27B | 8K | Gemma Terms | safetensors, GGUF | Tamano comparable; licencia mas restrictiva |
| Mistral Small 24B | ~24B | 128K | Apache 2.0 | safetensors, GGUF | Algo menor; contexto amplio documentado |

La comparacion se limita a parametros, licencia y formato porque no hay benchmarks publicados para este modelo. En tamano y licencia es equiparable a Gemma 2 27B y Mistral Small 24B, con la ventaja de Apache 2.0 frente a los terminos de Gemma, pero sin datos de rendimiento que permitan situarlo frente a ellos.

## Limitaciones y advertencias

- Ausencia total de benchmarks: no hay evidencia publicada de calidad en MMLU, HumanEval, GSM8K ni tareas multimodales, por lo que no se recomienda su uso en produccion sin una evaluacion propia.
- Documentacion minima: la model card del quantizador no describe el modelo base; se desconoce el proceso de entrenamiento, los datos y la alineacion.
- Idiomas: solo se declaran ingles y chino; el rendimiento en castellano no esta garantizado y probablemente sea deficiente.
- Riesgo de alucinacion: sin datos de alineacion (RLHF/DPO) ni evaluaciones, el riesgo es desconocido y debe asumirse alto en dominios factuales.
- Etiquetado no verificado: terminos como "Tensor Gene Evolution" o la arquitectura "qwen3_5" no proceden de documentacion tecnica verificable, lo que dificulta reproducir el entrenamiento.
- Contexto desconocido: al no documentarse la longitud de contexto, el dimensionado de la cache KV y la planificacion de memoria en produccion son inciertas.
- Multimodalidad sin especificar: los ficheros mmproj existen, pero no se indica que modalidad cubren ni con que calidad.
- Licencia: Apache 2.0 permite uso comercial, pero el usuario debe verificar de forma independiente que el modelo base cumple realmente esa licencia y que no arrastra restricciones de terceros.
- Repositorio grande: 190,8 GB en total; conviene descargar solo el quant necesario para evitar consumo innecesario de almacenamiento y ancho de banda.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/Qwen3.8-27B-EXP-EVE-v1-GGUF
- Modelo base: https://huggingface.co/win10/Qwen3.8-27B-EXP-EVE-v1
- Quants con imatrix: https://huggingface.co/mradermacher/Qwen3.8-27B-EXP-EVE-v1-i1-GGUF
- Pagina de resumen de descargas del autor: https://hf.tst.eu/model#Qwen3.8-27B-EXP-EVE-v1-GGUF
- Guia de uso de GGUF (README de referencia de TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Analisis de tipos de cuantizacion de Artefact2: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Solicitudes de cuantizacion de mradermacher: https://huggingface.co/mradermacher/model_requests
- Grafico comparativo de perplejidad por quant (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
