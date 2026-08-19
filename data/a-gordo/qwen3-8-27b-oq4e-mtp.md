# a-gordo/Qwen3.8-27B-oQ4e-mtp

## Resumen

Qwen3.8-27B es un modelo de lenguaje multimodal denso de 27 000 millones de parámetros desarrollado por el equipo Qwen de Alibaba. Se trata de la última generación de la familia Qwen, diseñada para ejecutarse en hardware local de gama media-alta, con especial énfasis en tareas de programación, flujos de trabajo agénticos y automatización de oficina. El modelo base se distribuye bajo licencia Apache 2.0, lo que facilita su uso comercial y su integración en productos propios.

La versión aquí analizada, `a-gordo/Qwen3.8-27B-oQ4e-mtp`, es una cuantización mixta de precisión realizada con la herramienta oQ (oMLX v0.6.1). Utiliza 4 bits con un tamaño de grupo de 64 y se distribuye en formato MLX safetensors, lo que la hace adecuada para su ejecución en hardware Apple Silicon mediante MLX, así como en otras plataformas que soporten este formato. El repositorio ocupa 17 GB, un tamaño razonable para un modelo de 27B cuantizado a 4 bits.

La relevancia de esta cuantización radica en que permite ejecutar un modelo de 27B con capacidades multimodales y de razonamiento en equipos de consumo, como portátiles con GPU de 16-24 GB de VRAM o chips Apple Silicon con memoria unificada. Esto democratiza el acceso a modelos de alto rendimiento sin necesidad de infraestructura de servidor dedicada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | qwen3_5 (transformer denso multimodal) |
| Parametros totales | 27B (modelo original) |
| Parametros activos | no aplicable (modelo denso) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | oQ4e (4 bits, group size 64) |
| Idiomas soportados | no disponible (multilingue, segun familia Qwen) |
| Licencia | Apache 2.0 (modelo base, segun busqueda web) |
| Formato de pesos | MLX safetensors |

## Arquitectura y entrenamiento

El modelo base Qwen3.8-27B emplea una arquitectura transformer densa multimodal, capaz de procesar texto e imagenes. Segun la informacion publica de Alibaba, esta orientado a tareas de codigo, agentes y automatizacion de oficina, lo que sugiere un entrenamiento enfocado en razonamiento logico, seguimiento de instrucciones y uso de herramientas. No se dispone de detalles especificos sobre el numero de tokens de entrenamiento, la composicion del dataset o el uso de tecnicas como RLHF o DPO en la informacion proporcionada.

La cuantizacion oQ4e aplicada por a-gordo utiliza una precision mixta de 4 bits con grupo de 64, lo que reduce significativamente el peso del modelo (17 GB en lugar de los ~54 GB que ocuparia en FP16). Esta tecnica mantiene un equilibrio entre compresion y calidad, aunque no se han publicado metricas de degradacion especificas para esta version cuantizada.

## Capacidades

- Generacion de texto y razonamiento paso a paso, con tendencia a "pensar en exceso" (overthinking) segun analisis de Simon Willison.
- Comprension multimodal: procesa imagenes ademas de texto, lo que permite tareas de vision artificial como descripcion de imagenes o respuesta a preguntas visuales.
- Programacion: destacado en generacion de codigo, depuracion y explicacion de fragmentos.
- Flujos de trabajo agénticos: soporta planificacion de tareas de multiples pasos y uso de herramientas (tool calling), aunque no se especifica el formato exacto.
- Automatizacion de oficina: capaz de redactar documentos, resumir correos, generar presentaciones y otras tareas administrativas.
- Multilingue: aunque no se detallan los idiomas, la familia Qwen suele cubrir ingles, chino y otros idiomas principales.

## Casos de uso

- Asistente de programacion local: un desarrollador puede ejecutar el modelo en su portatil con GPU de 24 GB para obtener ayuda con generacion de codigo, revision de pull requests o explicacion de errores, sin enviar datos a la nube.
- Automatizacion de tareas de oficina: el modelo puede redactar informes, resumir actas de reuniones o generar borradores de correos electronicos, aprovechando su capacidad de seguir instrucciones complejas.
- Analisis de imagenes en entornos sin conexion: al ser multimodal, puede describir fotografias, extraer texto de capturas o responder preguntas sobre diagramas, util en sectores como atencion al cliente o documentacion tecnica.
- Agente de investigacion personal: con su capacidad de razonamiento multi-paso, puede buscar informacion, sintetizar articulos y elaborar resumenes estructurados, aunque requiere integracion con herramientas externas.
- Prototipado rapido de aplicaciones de IA: gracias a su licencia Apache 2.0 y su tamano manejable, es adecuado para desarrollar y probar aplicaciones de IA generativa en entornos de desarrollo locales antes de escalar a modelos mayores.
- Educacion y formacion: puede utilizarse como tutor de programacion o matematicas, explicando conceptos paso a paso y generando ejercicios personalizados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La unica referencia encontrada es una evaluacion de MathVision en un repositorio de otro usuario, pero sin cifras concretas. Se recomienda consultar el repositorio oficial de Qwen para obtener datos comparativos del modelo base.

## Requisitos de hardware

- VRAM estimada para inferencia: al ser una cuantizacion de 4 bits, el modelo ocupa aproximadamente 17 GB en disco. Para inferencia, se recomienda al menos 16 GB de VRAM o memoria unificada, aunque 24 GB proporcionan margen para contexto largo y overhead.
- GPU recomendadas: NVIDIA RTX 4090 (24 GB), RTX 4080 (16 GB), AMD Radeon RX 7900 XTX (24 GB) o Apple Silicon con 32 GB o mas de memoria unificada (M1 Pro/Max o superior).
- Si cabe en consumer GPU: si, en GPUs con 16 GB o mas, aunque con limitaciones de contexto.
- Opciones de despliegue: al estar en formato MLX, es compatible con MLX (Apple Silicon) y con herramientas que soporten este formato. Para otras plataformas, se puede convertir a GGUF para usar con llama.cpp u Ollama, o a safetensors estandar para vLLM o TGI.
- Latencia y throughput: no disponibles para esta cuantizacion especifica. En hardware Apple Silicon, se espera una velocidad de generacion de 10-20 tokens por segundo, dependiendo del chip y la longitud del contexto.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Qwen3.8-27B (base) | 27B | no disponible | Apache 2.0 | safetensors | Modelo original, multimodal |
| Qwen3.6-27B (predecesor) | 27B | no disponible | Apache 2.0 | safetensors | Version anterior, sin vision |
| Llama 3.1 8B | 8B | 128K | Llama 3.1 | safetensors | Mas pequeno, menos capaz en razonamiento |

La comparativa se limita a caracteristicas generales, ya que no se dispone de datos de rendimiento para esta cuantizacion. Qwen3.8-27B destaca por su multimodalidad y su tamano intermedio, que lo situa entre los modelos de 7-8B (insuficientes para tareas complejas) y los de 70B+ (demasiado grandes para hardware de consumo).

## Limitaciones y advertencias

- Tendencia al "overthinking": segun Simon Willison, el modelo tiende a generar razonamientos excesivamente largos incluso para preguntas simples, lo que puede aumentar la latencia y el consumo de tokens.
- Sesgos y alucinaciones: como todo modelo de lenguaje, puede producir informacion falsa o sesgada, especialmente en dominios poco representados en sus datos de entrenamiento.
- Limitaciones de contexto: no se ha especificado la longitud de contexto soportada; se recomienda verificar antes de usarlo en tareas que requieran ventanas largas.
- Restricciones de licencia: aunque el modelo base es Apache 2.0, la cuantizacion puede tener condiciones adicionales; se debe revisar la licencia del repositorio de a-gordo antes de un uso comercial.
- Compatibilidad: el formato MLX limita su uso directo a ecosistemas Apple; para otras plataformas es necesaria una conversion, que puede introducir perdidas adicionales de calidad.
- Calidad de la cuantizacion: no se han publicado metricas de degradacion para oQ4e; es posible que el rendimiento en tareas de razonamiento complejo se vea afectado respecto al modelo en precision completa.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/a-gordo/Qwen3.8-27B-oQ4e-mtp
- Repositorio oficial de Qwen3.8-27B en GitHub: https://github.com/AlibabaCloud-Official/Qwen3.8-27B
- Analisis de Simon Willison: https://simonwillison.net/2026/Aug/16/qwen-38-27b/
- Blog de AMD sobre ejecucion en Ryzen AI Max y Radeon: https://www.amd.com/en/blogs/2026/run-qwen-3-8-27b-on-amd-ryzen-ai-max-and-radeon-graphics-cards-day-0.html
- Herramienta de cuantizacion oQ (oMLX): https://github.com/jundot/omlx
