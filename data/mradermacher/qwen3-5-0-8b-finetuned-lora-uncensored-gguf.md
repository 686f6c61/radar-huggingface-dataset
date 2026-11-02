# mradermacher/Qwen3.5-0.8B-finetuned-lora-uncensored-GGUF

## Resumen

`mradermacher/Qwen3.5-0.8B-finetuned-lora-uncensored-GGUF` es una distribucion en formato GGUF del modelo `Mahatoon77/Qwen3.5-0.8B-finetuned-lora-uncensored`, un ajuste fino de un modelo de la familia Qwen3.5 con aproximadamente 752 millones de parametros. El trabajo de cuantizacion lo firma mradermacher, un actor conocido en la comunidad por publicar versiones GGUF de modelos abiertos, y el resultado esta pensado para inferencia local con llama.cpp y derivados.

El modelo parte de una base Qwen3.5 de 0,8B y se ha modificado mediante una LoRA posteriormente fusionada, entrenada sobre el dataset `Guilherme34/uncensor` con tecnicas de edicion de modelo orientadas a eliminar la direccion de rechazo (refusal-direction). El resultado es un modelo conversacional de tipo "uncensored": conserva la capacidad generativa del original pero reduce deliberadamente las negativas a responder ante peticiones que un modelo alineado rechazaria.

La relevancia de esta ficha es doble: por un lado documenta un modelo pequeno y multimodal (incluye proyeccion visual mmproj) que cabe en hardware muy modesto; por otro, ilustra una practica controvertida de edicion de alineamiento cuyas implicaciones conviene conocer antes de desplegarlo. La licencia declarada es Apache 2.0 y el idioma principal es el ingles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (familia Qwen3.5), con proyeccion visual mmproj; detalles de capas y atencion no disponibles |
| Parametros totales | 752.393.024 (safetensors) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16; proyeccion multimodal en mmproj-Q8_0 y mmproj-f16 |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (el modelo base y el adapter se distribuyen en formato transformers) |

## Arquitectura y entrenamiento

El modelo base pertenece a la familia Qwen3.5 en su variante de 0,8B, una arquitectura transformer densa con capacidad multimodal declarada mediante los ficheros `mmproj` (proyeccion de vision) incluidos en el repositorio. No se detallan en la informacion disponible el numero de capas, la dimension oculta, el mecanismo de atencion ni la ventana de contexto efectiva. El pipeline declarado en HuggingFace figura como no disponible, aunque la libreria es transformers y el formato de distribucion es GGUF.

El ajuste fino consiste en una LoRA entrenada sobre el dataset `Guilherme34/uncensor` y posteriormente fusionada en los pesos base. Los tags del repositorio indican explicitamente el uso de tecnicas de `refusal-direction` y `model-editing`, es decir, intervenciones orientadas a suprimir el comportamiento de rechazo aprendido durante el alineamiento del modelo original. No se documentan en la informacion proporcionada el numero de tokens de entrenamiento, la composicion exacta del dataset, ni si hubo etapas de RLHF o DPO adicionales.

## Capacidades

- Generacion de texto conversacional en ingles, heredada del modelo Qwen3.5 base.
- Capacidad multimodal declarada: el repositorio incluye ficheros `mmproj` (Q8_0 y f16), lo que habilita entrada de imagenes en llama.cpp y clientes compatibles.
- Comportamiento "uncensored": responde a peticiones que un modelo alineado rechazaria, por efecto de la edicion de la direccion de rechazo.
- Razonamiento basico y generacion de codigo a nivel de modelo de 0,8B; sin datos especificos de rendimiento.
- Soporte de tool calling y function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no documentado; la capacidad es limitada por el tamano del modelo.
- Capacidades multilingues: solo ingles declarado.
- Modo "thinking" explicito: no disponible.

## Casos de uso

- Experimentacion local en hardware de gama baja: con cuantizaciones Q4_K_M de aproximadamente 0,6 GB, el modelo puede ejecutarse en CPU o en GPUs de consumo con 2-4 GB de VRAM, lo que lo hace util para pruebas de concepto y entornos de desarrollo sin aceleradores dedicados.
- Prototipado de asistentes conversacionales: sirve para validar pipelines de chat multi-turno en ingles antes de migrar a modelos mayores, gracias a su bajo coste de inferencia y su formato GGUF listo para llama.cpp.
- Investigacion sobre alineamiento y edicion de modelos: el modelo es un caso de estudio concreto de aplicacion de `refusal-direction` sobre un modelo pequeno, util para comparar comportamiento antes y despues de la edicion.
- Pruebas de pipelines multimodales ligeros: los ficheros mmproj permiten experimentar con entrada de imagenes en un modelo de menos de 1B de parametros, adecuado para validar integraciones antes de escalar.
- Evaluacion de riesgos y red teaming: al ser un modelo deliberadamente desalineado, resulta apropiado como sujeto de pruebas en laboratorios que auditan la eficacia de filtros y clasificadores de seguridad.
- Despliegue en entornos air-gapped o embebidos: el tamano reducido del fichero GGUF permite distribuirlo en dispositivos con poco almacenamiento y sin conectividad, para tareas de generacion de texto simples en ingles.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,5-0,6 GB con Q2_K a Q4_K_M; unos 0,7 GB con Q5_K_M y Q6_K; unos 0,9 GB con Q8_0; unos 1,6 GB con f16. Hay que sumar el fichero mmproj (0,2-0,3 GB) si se usa la entrada de vision.
- GPU recomendadas: cualquier GPU con 2 GB o mas de VRAM es suficiente; una RTX 3060, RTX 4060 o superior ofrece margen amplio. En entornos profesionales, A100 o H100 no aportan ventaja practica para este tamano y quedan sobredimensionadas.
- Cabe en GPU de consumo: si, practicamente en cualquier GPU moderna de consumo, e incluso en iGPU con memoria compartida.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, koboldcpp y cualquier runtime compatible con GGUF; los endpoints son compatibles segun los tags del repositorio.
- Latencia y throughput estimados: no disponibles de forma oficial; por el tamano del modelo, se espera una generacion en tiempo real o superior en CPU moderna y muy alta en GPU, aunque no se aportan cifras medidas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Qwen3.5-0.8B-finetuned-lora-uncensored (este) | 752 M | no disponible | Apache 2.0 | GGUF | Finetune uncensored con vision |
| Qwen3.5-0.8B base | ~0,8 B | no disponible | Apache 2.0 (segun familia) | safetensors, GGUF | Alineado, sin edicion de rechazo |
| Llama 3.2 1B Instruct | ~1,2 B | 128 K | Llama 3.2 Community License | safetensors, GGUF | Alternativa pequena alineada, sin vision en la variante de texto |
| SmolLM2 1.7B Instruct | ~1,7 B | 8 K | Apache 2.0 | safetensors, GGUF | Mayor capacidad, sin vision |

La comparacion con los modelos de la familia Qwen3.5 base es la mas directa: este repositorio anade cuantizaciones GGUF y el ajuste uncensored sobre el modelo de Mahatoon77. Frente a Llama 3.2 1B o SmolLM2, la diferencia principal es la licencia permisiva y la presencia de proyeccion visual, a costa de un comportamiento deliberadamente desalineado.

## Limitaciones y advertencias

- Modelo "uncensored": la edicion de la direccion de rechazo elimina barreras de seguridad del modelo original, por lo que puede generar contenido danino, ilegal o sexualmente explicito. No es apto para aplicaciones orientadas al publico sin capas adicionales de moderacion.
- Riesgo elevado de alucinacion: con 752 millones de parametros, la fidelidad factual es limitada y la generacion de datos inventados es frecuente.
- Solo ingles declarado; el rendimiento en castellano no esta garantizado ni documentado.
- Longitud de contexto no documentada; no debe asumirse una ventana larga para tareas de retrieval o documentos extensos.
- La capacidad multimodal depende de los ficheros mmproj y del soporte del runtime; no se especifican resoluciones, numero de imagenes por prompt ni calidad del entendimiento visual.
- Licencia Apache 2.0 declarada, lo que permite uso comercial segun los terminos de dicha licencia, pero el autor no ofrece garantias sobre el comportamiento del modelo ni sobre la legalidad del contenido que genere en jurisdicciones concretas.
- El modelo base es un finetune de terceros sobre Qwen3.5; conviene verificar la cadena de licencias del modelo original antes de un despliegue comercial.
- No se documentan sesgos especificos, pero al derivar de un modelo entrenado mayoritariamente en ingles y tras una edicion agresiva de alineamiento, es esperable un comportamiento erratico en temas sensibles.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/Qwen3.5-0.8B-finetuned-lora-uncensored-GGUF
- Modelo base (finetune): https://huggingface.co/Mahatoon77/Qwen3.5-0.8B-finetuned-lora-uncensored
- Cuantizaciones con imatrix: https://huggingface.co/mradermacher/Qwen3.5-0.8B-finetuned-lora-uncensored-i1-GGUF
- Pagina de descargas del autor: https://hf.tst.eu/model#Qwen3.5-0.8B-finetuned-lora-uncensored-GGUF
- Dataset de entrenamiento: https://huggingface.co/datasets/Guilherme34/uncensor
- FAQ y peticiones de cuantizacion: https://huggingface.co/mradermacher/model_requests
- Guia de uso de GGUF (referencia de TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Analisis de tipos de cuantizacion (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
