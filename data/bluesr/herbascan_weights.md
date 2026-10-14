# BlueSR/HerbaScan_Weights

## Resumen

BlueSR/HerbaScan_Weights es un repositorio de pesos publicado por el usuario BlueSR en HuggingFace, con un total de 7.615.616.512 parametros reales declarados en el indice de safetensors (aproximadamente 7,6 mil millones). El repositorio ocupa 58,5 GB, un tamano muy superior al de los pesos en precision completa, lo que indica que agrupa varios artefactos del mismo modelo en distintos formatos: safetensors, GGUF, ONNX y joblib. La model card publicada por el autor se limita a la linea `license: mit`, sin descripcion, sin Arquitectura declarada y sin datos de entrenamiento.

El nombre del repositorio sugiere un sistema orientado al reconocimiento de plantas medicinales ("HerbaScan"), y los tags incluyen `conversational` junto a `endpoints_compatible`, lo que apunta a un modelo con capacidad de dialogo desplegable en infraestructura gestionada. Sin embargo, no hay informacion oficial que confirme la modalidad, el pipeline ni la tarea concreta, por lo que cualquier afirmacion funcional debe tratarse como hipotesis hasta que el autor publique documentacion.

La relevancia actual del repositorio es limitada pero el dato de interes es doble: por un lado, es un ejemplo de publicacion de pesos multimotor (cuatro formatos de serializacion distintos en un solo repo) y, por otro, su falta de documentacion lo convierte en un caso tipico de modelo dificil de evaluar sin ingenieria inversa. A fecha de la ficha registra 0 descargas y 0 likes.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (la model card no la declara; los tags y formatos no permiten confirmarla) |
| Parametros totales | 7.615.616.512 (~7,6 mil millones), dato real del indice de safetensors |
| Parametros activos | no aplica / no disponible (no hay indicios de que sea un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible como lista oficial; el repo incluye artefactos GGUF, lo que implica cuantizaciones propias de llama.cpp, pero el autor no especifica cuales |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | safetensors, GGUF, ONNX y joblib (segun los tags del repositorio) |

## Arquitectura y entrenamiento

No hay informacion publicada sobre la arquitectura. La model card unicamente contiene la declaracion de licencia MIT, sin seccion de detalles tecnicos, sin diagrama, sin referencia a paper y sin descripcion del proceso de entrenamiento. El unico dato estructural fiable es el recuento de parametros del indice de safetensors (7.615.616.512), que situa al modelo en la franja de los 7-8 mil millones de parametros, el rango tipico de los transformers densos decodificadores-only de escala "small" (Llama 8B, Mistral 7B, Qwen2.5 7B), aunque no se puede confirmar que sea ese tipo de Arquitectura.

Tampoco se dispone de informacion sobre el corpus de entrenamiento, el numero de tokens procesados, la composicion del dataset ni si hubo fases de ajuste fino con RLHF, DPO o similares. La presencia simultanea de artefactos ONNX y joblib sugiere que el repositorio puede incluir componentes auxiliares (preprocesado, cabeceras de clasificacion o pipelines serializados con scikit-learn) ademas de los pesos neuronales, pero se trata de una inferencia a partir de los formatos de fichero, no de un dato confirmado.

## Capacidades

- Generacion de texto conversacional: el tag `conversational` figura explicitamente en el repositorio, lo que indica que el modelo esta preparado para dialogo multi-turno, aunque no se detalla el formato de plantilla ni el tokenizador.
- Compatibilidad con endpoints gestionados: el tag `endpoints_compatible` indica que el modelo puede desplegarse en HuggingFace Inference Endpoints sin adaptaciones.
- Exportacion multiformato: al publicar safetensors, GGUF, ONNX y joblib, el modelo esta pensado para ejecutarse tanto en frameworks de Python (Transformers, ONNX Runtime, scikit-learn) como en runtimes de inferencia en C/C++ (llama.cpp y derivados).
- Identificacion de plantas medicinales: capacidad no confirmada, inferida unicamente del nombre del repositorio ("HerbaScan"). No existe documentacion del autor que la respalde.
- Vision, audio, tool calling, function calling, modo pensamiento y razonamiento multi-paso: no disponible. No hay ningun dato en la informacion proporcionada que permita confirmar o descartar estas capacidades.
- Capacidades multilingues: no disponible. El repositorio no declara idiomas soportados.

## Casos de uso

Advertencia previa: al no existir documentacion funcional, los casos siguientes se plantean como escenarios de evaluacion condicionados a que el modelo confirme las capacidades que su nombre y sus tags sugieren.

- Evaluacion comparativa de formatos de serializacion: al publicar el mismo modelo en safetensors, GGUF, ONNX y joblib, permite medir en un mismo modelo la diferencia de latencia, uso de memoria y precision numerica entre un runtime de Python y un runtime optimizado en C++. Es un caso de uso de ingenieria, no de producto final.
- Despliegue en HuggingFace Inference Endpoints: el tag `endpoints_compatible` habilita subir el repositorio a un endpoint gestionado para pruebas de integracion sin montar infraestructura propia, util para validar el modelo antes de comprometer recursos.
- Inferencia en CPU o hardware modesto mediante GGUF: los artefactos GGUF permiten ejecutar el modelo con llama.cpp u Ollama en maquinas sin GPU dedicada, con pesos cuantizados a 4 bits en torno a 4,5-5 GB.
- Integracion en aplicaciones .NET o Java mediante ONNX: el formato ONNX permite cargar el modelo con ONNX Runtime fuera del ecosistema Python, lo que resulta adecuado para servicios backend corporativos que no pueden incorporar un stack de PyTorch.
- Pipelines clasicos de machine learning con joblib: si los artefactos joblib contienen etapas de preprocesado o cabeceras de clasificacion, pueden reutilizarse dentro de un Pipeline de scikit-learn junto con el modelo neuronal, por ejemplo para tareas de clasificacion de imagenes de plantas.
- Prototipado de asistentes conversacionales de dominio botanico: si se confirma la capacidad conversacional y el conocimiento del dominio, el modelo podria servir de base para un asistente que responda consultas sobre identificacion y uso de plantas medicinales, siempre con supervision humana y verificacion contra fuentes farmacologicas.
- Base para ajuste fino especifico: con 7,6 mil millones de parametros y licencia MIT, es un candidato a fine-tuning con LoRA en una unica GPU de 24 GB para tareas verticales de clasificacion o dialogo especializado.
- Analisis forense de repositorios de pesos: dado el escaso etiquetado, el repositorio sirve como caso de estudio sobre como auditar un modelo opaco (inspeccion del indice de safetensors, conversion de GGUF, trazado de ONNX) antes de decidir su adopcion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye resultados de MMLU, HumanEval, GSM8K, MT-Bench ni de ninguna otra evaluacion, y el autor no enlaza paper, informe tecnico ni tabla comparativa. Tampoco hay datos de latencia o throughput medidos.

## Requisitos de hardware

Estimaciones calculadas a partir del recuento real de parametros (7.615.616.512). El consumo final depende de la Arquitectura, que no esta documentada, por lo que las cifras deben tratarse como ordenes de magnitud.

- Pesos en fp32: aproximadamente 30,5 GB, solo pesos, sin cache KV.
- Pesos en bf16/fp16: aproximadamente 15,2 GB, mas cache KV y activaciones; en la practica requiere 17-21 GB de VRAM.
- Pesos en int8 (8 bits): aproximadamente 7,6 GB, mas overhead; requiere 9-11 GB de VRAM.
- Pesos en 4 bits (equivalente a Q4_K_M): aproximadamente 4,5-5 GB, mas overhead; requiere 5,5-7 GB de VRAM.
- GPU profesionales: A100 de 40 GB o 80 GB, H100, L40S y A6000 ejecutan el modelo en bf16 con margen amplio; una A100 de 40 GB permite varias instancias concurrentes en int8.
- GPU de consumo: una RTX 4090 (24 GB) ejecuta bf16 al limite y trabaja comodamente en int8 y en 4 bits; una RTX 3090 (24 GB) se comporta de forma similar; una RTX 4060 Ti de 16 GB o una RTX 3060 de 12 GB son viables en 4 bits.
- Equipos Apple Silicon: con memoria unificada de 16 GB es posible la inferencia en 4 bits; 32 GB permiten bf16 o int8 con contexto moderado.
- Despliegue: llama.cpp y Ollama para los artefactos GGUF; vLLM y TGI para safetensors en GPU; ONNX Runtime para los artefactos ONNX, incluido despliegue en CPU; Transformers para carga directa en Python; HuggingFace Inference Endpoints para despliegue gestionado.
- Latencia y throughput: no disponible. No hay mediciones publicadas por el autor ni resultados de terceros verificables.

## Comparativa con modelos similares

La categoria funcional del modelo no esta documentada, por lo que la comparacion se limita a la escala de parametros y a caracteristicas objetivas de disponibilidad. Las cifras de los modelos de referencia corresponden a sus especificaciones publicas.

| Modelo | Parametros | Contexto | Licencia | Formatos publicados | Contexto funcional |
|---|---|---|---|---|---|
| BlueSR/HerbaScan_Weights | 7,62 mil millones | no disponible | MIT | safetensors, GGUF, ONNX, joblib | no disponible |
| Llama 3.1 8B | 8,03 mil millones | 128.000 tokens | Llama 3.1 Community License (con restricciones) | safetensors, GGUF | LLM de proposito general |
| Mistral 7B v0.3 | 7,25 mil millones | 32.000 tokens | Apache 2.0 | safetensors, GGUF | LLM de proposito general |
| Qwen2.5 7B | 7,61 mil millones | 128.000 tokens | Apache 2.0 | safetensors, GGUF | LLM de proposito general |

Nota: HerbaScan_Weights es el unico de la tabla que publica artefactos ONNX y joblib, lo que amplia sus opciones de despliegue fuera del ecosistema Python. A cambio, es el unico sin contexto declarado y sin evaluaciones publicadas, lo que impide cualquier comparacion de rendimiento. Existen proyectos homonimos de reconocimiento de plantas medicinales basados en MobileNetV2 (HerbalHeal-AI y el repositorio de Egabrielaladen), pero corresponden a autores distintos y no hay evidencia de que compartan pesos o Arquitectura con este repositorio.

## Limitaciones y advertencias

- Documentacion practicamente inexistente: la model card solo contiene la licencia. No hay descripcion, instrucciones de uso, plantilla de prompt, tokenizador documentado ni ejemplos.
- Arquitectura, contexto e idiomas sin declarar: imposible planificar integraciones en produccion sin auditar previamente el modelo.
- Riesgo de alucinacion: no evaluado. Si el modelo se aplica a recomendaciones sobre plantas medicinales, el riesgo sanitario es alto y exige validacion con fuentes farmacologicas y supervision de especialistas.
- Ambiguedad de identidad: el nombre "HerbaScan" esta asociado a varios proyectos independientes de reconocimiento de plantas. No debe asumirse que este repositorio sea el mismo sistema que los proyectos de MobileNetV2 encontrados en GitHub.
- Ausencia de benchmarks y de adopcion: 0 descargas y 0 likes implican que no existe comunidad que haya validado el comportamiento del modelo en condiciones reales.
- Contenido del repositorio no auditado: los 58,5 GB incluyen formatos heterogeneos (safetensors, GGUF, ONNX, joblib). Antes de cargar artefactos joblib o ONNX conviene verificar su procedencia en un entorno aislado, ya que un fichero joblib malicioso puede ejecutar codigo al deserializarse.
- Licencia MIT: permite uso comercial, modificacion y redistribucion sin obligacion de publicar derivados, pero no exime de responsabilidad sobre el uso del modelo ni sobre los datos con los que se haya entrenado, aspecto que el autor no documenta.
- Fechas de metadatos anomalas: el repositorio figura como creado el 2026-08-10 y actualizado el 2026-10-14, posteriores a la fecha habitual de consulta. Se reproducen tal como los registra la plataforma.
- Sin garantia de soporte: al no haber actividad ni issues documentados, no cabe esperar mantenimiento, correccion de errores ni respuesta del autor.

## Enlaces

- Pagina del modelo en HuggingFace: https://huggingface.co/BlueSR/HerbaScan_Weights
- Arbol de ficheros del repositorio: https://huggingface.co/BlueSR/HerbaScan_Weights/tree/main
- Ficha indexada de terceros (Essa Mamdani): https://essamamdani.com/ai-models/hf-bluesr-herbascan-weights
- Proyecto homonimo HerbalHeal-AI en GitHub (autor distinto, MobileNetV2): https://github.com/Karthikgowda-web/HerbalHeal-AI
- Proyecto homonimo HerbaScan en GitHub (autor distinto, plantas medicinales respiratorias): https://github.com/Egabrielaladen/HerbaScan
- Paper, blog tecnico, demo o repositorio oficial del autor: no disponible
