# nvidia/GLM-5.3-Flash-NVFP4

## Resumen

GLM-5.3-Flash NVFP4 es la version cuantizada en formato NVFP4 del modelo GLM-5.3-Flash desarrollado por ZAI (zai-org), publicada por NVIDIA a traves del repositorio nvidia/GLM-5.3-Flash-NVFP4. Se trata de un modelo de lenguaje autorregresivo multimodal nativo con arquitectura Mixture-of-Experts (MoE) orientado a razonamiento, generacion de codigo y tareas agenticas. NVIDIA no es el desarrollador del modelo original: la model card indica explicitamente que el modelo se ha desarrollado segun los requisitos de un tercero, y que la cuantizacion se ha realizado con la herramienta Model Optimizer (nvidia-modelopt v0.47.0).

El modelo combina una arquitectura de atencion hibrida (sparse mas linear) con Manifold-Constrained Hyper-Connections (mHC) para sostener contextos muy largos, que la model card cifra en hasta 1.000.000 de tokens. Acepta entradas de texto, imagen y video, y produce salida de texto. La model card declara 320.000 millones de parametros totales y 18.000 millones activados por token, si bien el recuento real de pesos safetensors del repositorio arroja 168.893.635.422 parametros, una discrepancia que conviene tener presente al planificar el despliegue.

Su relevancia inmediata es de infraestructura: ofrece pesos y activaciones ya cuantizados en NVFP4 listos para servir con vLLM sobre hardware NVIDIA Blackwell, lo que reduce el coste de memoria y de ancho de banda frente a una ejecucion en precision completa. Esta pensado para equipos que despliegan agentes, chatbots y sistemas RAG y quieren evitar el proceso de cuantizacion por su cuenta. La licencia es MIT y el uso comercial esta permitido segun la propia model card.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer autorregresivo multimodal nativo, Mixture-of-Experts (MoE) con atencion hibrida sparse + linear y Manifold-Constrained Hyper-Connections (mHC); clase `Glm5NextForConditionalGeneration` |
| Parametros totales | 320 B segun la model card; 168.893.635.422 segun los pesos safetensors del repositorio (dato discrepante) |
| Parametros activos | 18 B (segun la model card) |
| Longitud de contexto | Hasta 1.000.000 de tokens (1M) |
| Tipos de cuantizacion | NVFP4 (version 1.0) sobre pesos y activaciones de los operadores lineales |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | safetensors (pesos cuantizados NVFP4) |
| Modalidades de entrada | Texto, imagen (RGB) y video (MP4/WebM) |
| Modalidad de salida | Texto (secuencias 1D) |
| Motor de inferencia soportado | vLLM |
| Microarquitectura de hardware soportada | NVIDIA Blackwell |
| Tamano del repositorio | 204,5 GB |
| Sistema operativo recomendado | Linux |
| Herramienta de cuantizacion | nvidia-modelopt v0.47.0 (Model Optimizer) |
| Fecha de publicacion | 09/09/2026 |

## Arquitectura y entrenamiento

El modelo es un transformer autorregresivo con capas Mixture-of-Experts. La model card describe una arquitectura de atencion hibrida que combina atencion dispersa (sparse) con atencion linear, junto con Manifold-Constrained Hyper-Connections (mHC), un mecanismo de conexion entre capas orientado a estabilizar y sostener el entrenamiento y la inferencia en contextos largos. La clase de implementacion es `Glm5NextForConditionalGeneration`, lo que confirma el tratamiento conjunto de entradas de texto, imagen y video. Con 18.000 millones de parametros activos sobre un total declarado de 320.000 millones, el modelo solo computa una fraccion de sus pesos por token, lo que reduce el coste de calculo por token a cambio de un mayor consumo de memoria.

Sobre el entrenamiento no hay informacion: la model card marca como "undisclosed" la modalidad de datos, el metodo de recoleccion y el metodo de etiquetado. Tampoco se detalla si hubo RLHF o DPO. Lo que si se documenta es el proceso de post-entrenamiento de cuantizacion: los pesos y las activaciones de los operadores lineales de GLM-5.3-Flash se convirtieron a NVFP4 con NVIDIA Model Optimizer v0.47.0. El dataset de calibracion usado fue una combinacion de `cnn_dailymail` (alrededor de 300.000 articulos periodisticos en ingles) y `Nemotron-Post-Training-Dataset-v2` (conversaciones multiturno de NVIDIA sobre temas diversos), ambos de recoleccion y etiquetado automaticos.

## Capacidades

- Generacion de texto y razonamiento en dominios cientificos y de conocimiento general: la evaluacion declarada incluye GPQA Diamond, con preguntas de nivel de posgrado en biologia, fisica y quimica.
- Generacion y analisis de codigo, incluido codigo cientifico: se evalua con SciCode.
- Razonamiento multimodal de nivel universitario: se evalua con MMMU Pro, en su variante mas exigente y con entrada exclusivamente visual.
- Procesamiento de contexto muy largo con recuperacion de informacion: se evalua con AA-LCR, prueba especifica de recall sobre contextos extensos, coherente con la ventana de hasta 1M de tokens.
- Seguimiento de instrucciones con restricciones estructuradas y diversas: se evalua con IFBench.
- Uso de herramientas y ejecucion de tareas agenticas en entornos de linea de comandos y contenedores: se evalua con Terminal-Bench 2.1, que plantea 89 tareas reales en entornos aislados.
- Entrada multimodal: acepta texto, imagenes en RGB y video en formato MP4/WebM.
- Despliegue en produccion como modelo pre-cuantizado listo para vLLM, sin necesidad de repetir el proceso de cuantizacion.

No se documenta en la informacion disponible soporte explicito de function calling, modo de pensamiento (thinking mode), audio, ni cobertura multilingue concreta.

## Casos de uso

- Agentes de terminal y automatizacion de operaciones: el modelo esta evaluado con Terminal-Bench 2.1, un conjunto de 89 tareas ejecutadas en entornos de linea de comandos y contenedores aislados. Esto lo hace adecuado para agentes que inspeccionan sistemas de ficheros, ejecutan comandos y encadenan pasos hasta completar una tarea de administracion o de depuracion.
- Asistentes RAG sobre corpus extensos: con una ventana de hasta 1.000.000 de tokens y una prueba especifica de recall en contextos largos (AA-LCR), permite inyectar documentacion tecnica, normativa o expedientes completos sin trocear agresivamente, reduciendo la perdida de contexto entre fragmentos.
- Generacion de codigo en pipelines de desarrollo: el modelo cubre generacion y razonamiento sobre codigo, incluido codigo cientifico (SciCode), por lo que puede integrarse en revision de pull requests, generacion de pruebas o migracion de codigo dentro de un flujo de CI/CD desplegado sobre vLLM.
- Analisis de documentacion tecnica con elementos visuales: al aceptar imagenes, puede procesar diagramas de arquitectura, esquemas electricos, capturas de paneles de monitorizacion o tablas escaneadas junto al texto que las acompana, y devolver una descripcion o un resumen en texto.
- Procesamiento de video para extraccion de informacion: la entrada de video en MP4/WebM permite resumir grabaciones, generar subtitulos descriptivos o extraer eventos relevantes de material audiovisual en flujos de analisis posteriores.
- Atencion al cliente automatizada de nivel experto: el modelo puede sostener conversaciones multiturno sobre dominios tecnicos, apoyandose en el contexto largo para mantener el historial completo de la interaccion y en la calibracion con Nemotron-Post-Training-Dataset-v2, que contiene conversaciones multiturno.
- Evaluacion y filtrado de respuestas cientificas: con el rendimiento declarado en GPQA Diamond como referencia de diseno, puede emplearse como generador o como evaluador en tareas de preguntas y respuestas de nivel de posgrado en ciencias.
- Asistentes de investigacion multimodal: combinacion de texto, imagen y video en un unico modelo para tareas como interpretar figuras de articulos, comparar resultados experimentales presentados graficamente y resumir el conjunto en texto.

## Benchmarks y rendimiento

La model card enumera los conjuntos de evaluacion empleados (GPQA Diamond, SciCode, MMMU Pro, AA-LCR, IFBench y Terminal-Bench 2.1), pero no publica las puntuaciones obtenidas en ninguno de ellos. Tampoco se incluyen resultados de MMLU, HumanEval o GSM8K.

| Benchmark | Resultado |
|---|---|
| GPQA Diamond | no disponible (conjunto declarado, sin puntuacion publicada) |
| SciCode | no disponible (conjunto declarado, sin puntuacion publicada) |
| MMMU Pro | no disponible (conjunto declarado, sin puntuacion publicada) |
| AA-LCR | no disponible (conjunto declarado, sin puntuacion publicada) |
| IFBench | no disponible (conjunto declarado, sin puntuacion publicada) |
| Terminal-Bench 2.1 | no disponible (conjunto declarado, sin puntuacion publicada) |
| MMLU, HumanEval, GSM8K | no se han publicado resultados en la informacion disponible |

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el repositorio ocupa 204,5 GB en safetensors, por lo que los pesos en NVFP4 requieren del orden de 200 GB de memoria agregada. A esa cifra hay que sumar la cache KV, que con ventanas de contexto de hasta 1M de tokens puede crecer de forma muy significativa y depende del numero de secuencias concurrentes. Estimacion orientativa, no confirmada por el fabricante.
- GPU recomendadas: la model card indica compatibilidad con la microarquitectura NVIDIA Blackwell y declara pruebas sobre GB200. En la practica, el despliegue exige varios aceleradores de esa generacion para alojar los pesos y la cache.
- Cabe en GPU de consumo: no. Ni siquiera una RTX 5090 o similar con 32 GB de VRAM puede alojar un modelo de este tamano, y ademas el formato NVFP4 requiere soporte de la microarquitectura Blackwell para数据中心, no de las GPU de consumo.
- Formatos alternativos para hardware limitado: no se ofrecen en esta publicacion. El repositorio contiene unicamente pesos NVFP4; para GPUs Hopper, Ada o de consumo habria que acudir al modelo base zai-org/GLM-5.3-Flash y cuantizarlo de nuevo, opcion no documentada en esta ficha.
- Opciones de despliegue: vLLM es el unico motor declarado como soportado. No se mencionan llama.cpp, Ollama, TGI ni otras alternativas, y es previsible que no sean compatibles con NVFP4 en su estado actual.
- Sistema operativo: Linux, segun la model card.
- Latencia y throughput: no disponible. La model card no publica cifras de tokens por segundo, tiempo hasta el primer token ni rendimiento por GPU.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| nvidia/GLM-5.3-Flash-NVFP4 | 320 B totales / 18 B activos (model card); 168,89 B segun safetensors | Hasta 1M tokens | NVFP4, pesos y activaciones | MIT | Pesos safetensors, 204,5 GB, vLLM sobre Blackwell |
| zai-org/GLM-5.3-Flash (modelo base) | 320 B totales / 18 B activos (model card) | Hasta 1M tokens | Sin cuantizar (precision completa) | No disponible en la informacion proporcionada | Repositorio HuggingFace del autor original |
| Otras alternativas MoE multimodales de escala comparable | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone en la informacion proporcionada de datos verificables sobre modelos competidores equivalentes (parametros, contexto, rendimiento o licencia), por lo que la comparativa se limita al modelo base del que deriva esta cuantizacion. La diferencia practica entre ambos es el formato de pesos: el modelo de NVIDIA llega ya cuantizado, mientras que el base exigiria un proceso de cuantizacion previo.

## Limitaciones y advertencias

- Discrepancia en el numero de parametros: la model card declara 320 B totales y 18 B activos, mientras que el recuento de safetensors del repositorio es de 168.893.635.422 parametros. Es necesario verificar cual de las dos cifras corresponde al modelo realmente publicado antes de dimensionar la infraestructura.
- Dependencia de hardware: el formato NVFP4 y el motor vLLM sobre Blackwell limitan el despliegue a esa generacion de GPU. No hay ruta documentada para Hopper, Ada o GPU de consumo.
- Ausencia de benchmarks publicados: se declaran seis conjuntos de evaluacion, pero ninguna puntuacion. No es posible validar el rendimiento real frente al modelo base ni frente a alternativas.
- Idioma: la informacion disponible no especifica los idiomas soportados. Los unicos indicios son que el dataset de calibracion cnn_dailymail es en ingles y que el dataset de post-entrenamiento de NVIDIA es multitema, lo que no permite afirmar cobertura multilingue.
- Riesgo de alucinacion: es un modelo generativo de texto sin mecanismo de verificacion documentado. En tareas agenticas con ejecucion real de comandos (Terminal-Bench 2.1) una alucinacion puede traducirse en acciones destructivas, por lo que se recomienda sandboxing y confirmacion humana en operaciones irreversibles.
- Opacidad del entrenamiento: los datos de entrenamiento, su metodo de recoleccion y su etiquetado figuran como no divulgados. Esto impide auditar sesgos de origen o composicion del corpus, y no se documentan sesgos conocidos.
- Naturaleza de terceros: NVIDIA no es el desarrollador del modelo original. La model card remite a la de ZAI para cualquier detalle sobre el modelo base, y la responsabilidad sobre el comportamiento del modelo no recae en NVIDIA.
- Licencia: MIT, con uso comercial y no comercial permitido segun la model card. Aun asi, conviene revisar los terminos del modelo base de ZAI, ya que esta publicacion solo cubre la version cuantizada.
- Recomendacion operativa de la propia model card: la integracion en sistemas de IA requiere pruebas adicionales con datos especificos del caso de uso, siguiendo una metodologia de validacion por niveles, antes de su puesta en produccion.
- Sin datos de rendimiento: no hay cifras de latencia, throughput ni consumo energetico, lo que dificulta la planificacion de capacidad y costes.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/nvidia/GLM-5.3-Flash-NVFP4
- Modelo base (ZAI): https://huggingface.co/zai-org/GLM-5.3-Flash
- NVIDIA Model Optimizer (repositorio): https://github.com/NVIDIA/Model-Optimizer
- Dataset de calibracion cnn_dailymail: https://huggingface.co/datasets/abisee/cnn_dailymail
- Dataset de calibracion Nemotron-Post-Training-Dataset-v2: https://huggingface.co/datasets/nvidia/Nemotron-Post-Training-Dataset-v2
- Licencia MIT (texto de referencia): https://huggingface.co/datasets/choosealicense/licenses/blob/main/markdown/mit.md

Nota: la busqueda web realizada no devolvio enlaces especificos sobre este modelo; los resultados se limitaron a paginas corporativas genericas de NVIDIA (nvidia.com, pagina de controladores, GeForce NOW y articulos enciclopedicos sobre la compania), sin informacion tecnica aprovechable.
