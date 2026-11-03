# mradermacher/Alphi-v1-GGUF

## Resumen

Alphi-v1 es un modelo de lenguaje conversacional desarrollado por RyzovaTech, distribuido originalmente en formato transformers y cuantizado a GGUF por mradermacher. El modelo se presenta bajo los tags "matrix-memory" y "growing-brain", lo que sugiere un enfoque de memoria estructurada y crecimiento progresivo del conocimiento, aunque la model card no detalla la implementacion tecnica concreta de estas caracteristicas. Con 4.628.569.635 parametros totales (aproximadamente 4,6 mil millones), se situa en la categoria de modelos compactos aptos para despliegue local.

La relevancia de esta ficha radica en que Alphi-v1 se distribuye como un modelo "local-first" con cuantizaciones GGUF estaticas que van desde Q2_K hasta Q8_0, ademas de un componente multimodal (mmproj) que sugiere capacidades de vision. El modelo base es RyzovaTech/Alphi-v1 y esta etiquetado con "gemma4", lo que indica que su arquitectura deriva de la familia Gemma 4 de Google.

La licencia es un punto critico: se distribuye bajo "ryzova-alphi-v1-mixed-components", una licencia personalizada de componentes mixtos que requiere revision del documento LICENSING.md antes de cualquier uso comercial. Los idiomas declarados son ingles (en) y sinhala (si), lo que limita su aplicabilidad directa en castellano sin evaluacion adicional.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer derivado de Gemma 4 (segun tag "gemma4"); detalles no disponibles |
| Parametros totales | 4.628.569.635 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | f16, Q8_0, Q6_K, Q5_K_M, Q5_K_S, Q4_K_M, Q4_K_S, Q3_K_L, Q3_K_M, Q3_K_S, Q2_K, IQ4_XS, mmproj-Q8_0, mmproj-f16 |
| Idiomas soportados | en (ingles), si (sinhala) |
| Licencia | ryzova-alphi-v1-mixed-components (other) |
| Formato de pesos | safetensors (original), GGUF (cuantizado) |

## Arquitectura y entrenamiento

La informacion disponible indica que Alphi-v1 es un transformer derivado de la familia Gemma 4, con 4.628.569.635 parametros. Los tags "matrix-memory" y "growing-brain" sugieren mecanismos de memoria estructurada y actualizacion progresiva del conocimiento, pero la model card no proporciona detalles sobre como se implementan ni que ventajas tecnicas aportan frente a un transformer convencional. Tampoco se especifica si emplea atencion lineal, decodificacion especulativa u otras innovaciones.

No se dispone de informacion sobre el volumen de tokens de entrenamiento, la composicion del dataset, ni si se aplicaron tecnicas de RLHF, DPO o ajuste por instrucciones. La presencia de un componente multimodal (mmproj) en la distribucion GGUF indica que el modelo base incorpora alguna forma de procesamiento visual, pero no se detalla la arquitectura del encoder ni los datos multimodales utilizados. El tag "fp16" en el modelo original sugiere que los pesos se publicaron en precision media.

## Capacidades

- Generacion de texto conversacional: el tag "conversational" indica que el modelo esta optimizado para dialogos multi-turno.
- Procesamiento multimodal: la presencia de archivos mmproj (Q8_0 y f16) en la distribucion GGUF sugiere capacidad de entrada de imagenes, aunque no se detalla el alcance.
- Memoria matricial y "growing brain": mecanismos declarados por el autor para gestionar y expandir el conocimiento, sin documentacion tecnica disponible.
- Soporte multilingue limitado a ingles y sinhala.
- Tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Modo thinking: no disponible en la informacion proporcionada.
- Capacidades de codigo y matematicas: no disponible en la informacion proporcionada.

## Casos de uso

- Asistencia conversacional en ingles: el modelo puede gestionar dialogos multi-turno gracias a su naturaleza conversacional declarada, adecuado para chatbots de soporte en entornos de habla inglesa.
- Despliegue local en estaciones de trabajo: con 4,6 mil millones de parametros y cuantizaciones desde Q2_K, puede ejecutarse en equipos sin GPU dedicada de gama alta mediante llama.cpp u Ollama, lo que encaja con el enfoque "local-first".
- Procesamiento de documentos con imagenes en ingles: el componente mmproj permite alimentar imagenes junto con texto, util para extraccion de informacion de capturas o formularios en ingles.
- Prototipado de aplicaciones con memoria persistente: los tags "matrix-memory" y "growing-brain" sugieren que el modelo esta pensado para escenarios donde el contexto y el conocimiento se acumulan entre sesiones, aunque requiere validacion empirica.
- Investigacion en modelos derivados de Gemma 4: util para estudiar variantes de la familia Gemma 4 con modificaciones de memoria, comparando comportamiento frente al modelo base.
- Aplicaciones en sinhala: uno de los pocos modelos con soporte declarado de sinhala, adecuado para tareas de generacion de texto en ese idioma, aunque sin benchmarks publicados que lo respalden.
- Evaluacion de licencias de componentes mixtos: caso de estudio para equipos juridicos y de compliance que necesiten analizar licencias personalizadas en modelos open weight.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en f16: aproximadamente 9,3 GB solo para pesos (4,63 mil millones de parametros x 2 bytes), mas overhead de contexto y KV cache.
- VRAM estimada en Q8_0: en torno a 5 GB para pesos; en Q4_K_M: aproximadamente 2,8 GB; en Q2_K: aproximadamente 1,6 GB.
- GPU recomendadas: para f16, una RTX 4090 (24 GB) o A100/H100 con margen amplio; para Q4_K_M, una RTX 3060 de 12 GB o RTX 4060 Ti de 16 GB es suficiente.
- Cabe en GPU de consumo: si, en modelos con 8 GB o mas de VRAM usando cuantizaciones Q4 o inferiores; en Q2_K podria ejecutarse en GPUs de 4-6 GB.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio y cualquier runtime compatible con GGUF; el modelo original en safetensors requiere transformers.
- Latencia y throughput: no disponible en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| Alphi-v1 (este modelo) | 4,63 B | no disponible | en, si | ryzova-alphi-v1-mixed-components | safetensors, GGUF |
| Gemma 2 2B (Google) | 2,6 B | 8K | multilingue | Gemma Terms | safetensors, GGUF |
| Phi-3-mini (Microsoft) | 3,8 B | 4K-128K | multilingue | MIT | safetensors, GGUF |
| Qwen2.5-3B (Alibaba) | 3,1 B | 32K | multilingue | Apache 2.0 | safetensors, GGUF |

La comparativa es orientativa: Alphi-v1 declara derivar de Gemma 4, pero no se dispone de datos de contexto, benchmarks ni terminos de licencia comparables directamente. Su principal diferenciador declarado son los mecanismos de memoria ("matrix-memory", "growing-brain") y el soporte de sinhala, ausente en la mayoria de alternativas.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados en la informacion disponible; al derivar de Gemma 4, podria heredar sesgos del modelo base, pero no se confirma.
- Riesgo de alucinacion: no cuantificado; sin benchmarks ni evaluaciones publicadas, el riesgo es desconocido y debe validarse en produccion.
- Limitaciones de idioma: solo se declaran ingles y sinhala; el rendimiento en castellano no esta garantizado ni evaluado.
- Licencia restrictiva: "ryzova-alphi-v1-mixed-components" es una licencia personalizada de componentes mixtos; es obligatorio revisar LICENSING.md antes de cualquier uso comercial o redistribucion.
- Ausencia de benchmarks: no hay resultados publicados de MMLU, HumanEval, GSM8K ni otras evaluaciones, lo que impide comparar objetivamente con alternativas.
- Modelo con pocas descargas y likes (0 en el momento de la consulta): baja validacion por parte de la comunidad.
- La cuantizacion GGUF es estatica y no se ofrecen versiones ponderadas/imatrix, segun indica el cuantizador.
- El repositorio GGUF ocupa 49,4 GB, lo que incluye todas las variantes; descargar solo el archivo necesario.
- No se detalla el contexto maximo, lo que complica el dimensionamiento de memoria en produccion.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/Alphi-v1-GGUF
- Modelo base: https://huggingface.co/RyzovaTech/Alphi-v1
- Licencia del modelo base: https://huggingface.co/RyzovaTech/Alphi-v1/blob/main/LICENSING.md
- Pagina de descargas del cuantizador: https://hf.tst.eu/model#Alphi-v1-GGUF
- Solicitudes de cuantizacion: https://huggingface.co/mradermacher/model_requests
- Guia de uso de GGUF (referencia TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Analisis de tipos de cuantizacion (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
