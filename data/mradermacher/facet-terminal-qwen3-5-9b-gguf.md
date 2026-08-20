# mradermacher/FACET-Terminal-Qwen3.5-9B-GGUF

## Resumen

FACET-Terminal-Qwen3.5-9B-GGUF es una colección de cuantizaciones GGUF del modelo FACET-Terminal/FACET-Terminal-Qwen3.5-9B, preparadas por mradermacher para su uso con herramientas de inferencia local como llama.cpp, Ollama o LM Studio. El modelo base es un fine-tuning de Qwen3.5-9B, un transformer denso de aproximadamente 8,95 mil millones de parámetros desarrollado por Alibaba, especializado en tareas de agente de terminal (terminal-agent) y razonamiento agéntico. Este repositorio ofrece múltiples niveles de cuantización (desde Q2_K hasta f16) que permiten ejecutar el modelo en una amplia gama de hardware, desde GPUs de consumo con 6 GB de VRAM hasta servidores profesionales.

La relevancia de este modelo radica en su capacidad para actuar como un agente autónomo en entornos de terminal, combinando las capacidades multimodales y de razonamiento de Qwen3.5 con un ajuste específico para interacción con sistemas operativos, ejecución de comandos y automatización de tareas. Al estar disponible en formato GGUF, facilita su despliegue en entornos locales sin depender de APIs externas, lo que lo hace atractivo para desarrolladores que necesitan privacidad, baja latencia o control total sobre el modelo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (basado en Qwen3.5-9B) |
| Parametros totales | 8.953.803.264 (8,95 B) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 262.144 tokens (contexto nativo del modelo base Qwen3.5-9B) |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16, mmproj-Q8_0, mmproj-f16 |
| Idiomas soportados | Ingles (segun model card) |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (safetensors para el modelo base) |

## Arquitectura y entrenamiento

El modelo base FACET-Terminal-Qwen3.5-9B es un fine-tuning de Qwen3.5-9B, que a su vez es un transformer denso con atención completa, diseñado para soportar una ventana de contexto de 262.144 tokens. Qwen3.5 integra un enfoque de vision-lenguaje unificado mediante entrenamiento temprano de fusión en tokens multimodales, lo que le permite procesar tanto texto como imagenes con un unico conjunto de pesos. El fine-tuning realizado por FACET-Terminal se centra en tareas de agente de terminal, lo que implica un entrenamiento adicional orientado a la ejecucion de comandos, la navegacion por sistemas de archivos y la interaccion con herramientas de linea de comandos.

No se dispone de informacion detallada sobre el dataset de entrenamiento, el numero de tokens utilizados o si se aplicaron tecnicas como RLHF o DPO. La cuantizacion GGUF realizada por mradermacher es estatica (static quants), sin uso de imatrix ni pesos ponderados, segun se indica en la model card. El repositorio incluye archivos mmproj (multi-modal supplement) en Q8_0 y f16, lo que confirma que el modelo conserva capacidades multimodales.

## Capacidades

- Generacion de texto y razonamiento: hereda las capacidades de Qwen3.5-9B, incluyendo razonamiento complejo, comprension de instrucciones y generacion de texto coherente.
- Agente de terminal: disenado especificamente para interactuar con entornos de linea de comandos, ejecutar comandos, gestionar procesos y automatizar tareas de administracion de sistemas.
- Tool calling / function calling: soporta invocacion de herramientas, lo que permite integrarlo en pipelines de automatizacion y agentes que necesitan llamar a APIs o ejecutar acciones externas.
- Capacidades multimodales: incluye archivos mmproj para procesamiento de imagenes, lo que permite tareas como descripcion de capturas de pantalla, analisis de diagramas o reconocimiento de elementos visuales en el contexto de una terminal.
- Razonamiento multi-step: apto para tareas que requieren planificacion y ejecucion de secuencias de acciones, como la resolucion de problemas de configuracion o la depuracion de codigo.
- Multilingue: aunque la model card indica ingles, Qwen3.5-9B base soporta multiples idiomas; el fine-tuning podria haber reducido ese soporte, por lo que se recomienda verificar.

## Casos de uso

- Automatizacion de tareas de administracion de sistemas: el modelo puede interpretar comandos en lenguaje natural y traducirlos a secuencias de comandos shell, facilitando la gestion de servidores, la configuracion de redes o la monitorizacion de recursos.
- Asistente de desarrollo en terminal: integrado en un IDE o en una sesion de terminal, puede ayudar a los desarrolladores a buscar errores, generar comandos de compilacion, gestionar dependencias o explicar el comportamiento de herramientas CLI.
- Agente de soporte tecnico remoto: desplegado como un bot que accede a una maquina remota, puede diagnosticar problemas, ejecutar comandos de diagnostico y proponer soluciones, reduciendo el tiempo de resolucion de incidencias.
- Analisis de logs y depuracion: con su contexto de 262K tokens, puede procesar grandes volumenes de logs, identificar patrones de error y sugerir correcciones, tanto en texto como en capturas de pantalla de consolas.
- Automatizacion de pipelines de CI/CD: gracias al soporte de tool calling, puede integrarse en sistemas de integracion continua para ejecutar pruebas, gestionar despliegues o validar configuraciones, actuando como un agente autonomo.
- Educacion y formacion en linea de comandos: el modelo puede actuar como tutor interactivo, explicando comandos, mostrando ejemplos y evaluando el progreso del usuario en un entorno simulado de terminal.
- Procesamiento de documentos tecnicos con imagenes: al ser multimodal, puede analizar manuales, diagramas de arquitectura o capturas de pantalla de errores, y generar instrucciones de resolucion en formato de comandos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio GGUF no incluye metricas de rendimiento, y la model card del modelo base no proporciona datos comparativos. Se recomienda consultar los benchmarks oficiales de Qwen3.5-9B para una referencia aproximada, aunque el fine-tuning para terminal-agent podria alterar los resultados en tareas generales.

## Requisitos de hardware

- VRAM estimada para inferencia: segun la cuantizacion elegida, los requisitos varian. Para Q4_K_M (5,7 GB) se necesitan al menos 8 GB de VRAM; para Q8_0 (9,6 GB) se recomiendan 12 GB; para f16 (18 GB) se requieren 24 GB o mas.
- GPU recomendadas: RTX 3060 12 GB o superior para cuantizaciones Q4/Q5; RTX 4090 o A100 para Q8_0 o f16. Tambien es viable en GPUs de datacenter como A10, A100 o H100.
- Compatibilidad con GPU de consumo: si, las cuantizaciones Q2_K a Q5_K_M caben en GPUs de 6-8 GB, como la RTX 2060 o la GTX 1660 Super, aunque con menor calidad.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, text-generation-webui, y cualquier frontend compatible con GGUF. Tambien se puede usar con vLLM si se convierte a safetensors, aunque el formato nativo es GGUF.
- Latencia y throughput: no se dispone de datos medidos. En una RTX 4090, un modelo de 9B en Q4_K_M suele generar entre 40 y 60 tokens por segundo, pero esto depende de la implementacion y del tamaño del contexto.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Enfoque |
|---|---|---|---|---|---|
| FACET-Terminal-Qwen3.5-9B (GGUF) | 8,95 B | 262.144 | Apache-2.0 | GGUF | Agente de terminal, multimodal |
| Qwen3.5-9B (base) | 8,95 B | 262.144 | Apache-2.0 | safetensors, GGUF | Modelo general multimodal |
| Llama 3.1 8B Instruct | 8,03 B | 131.072 | Llama 3.1 Community License | safetensors, GGUF | Modelo general de texto |
| Mistral 7B Instruct | 7,24 B | 32.768 | Apache-2.0 | safetensors, GGUF | Modelo general de texto |

La comparativa se basa en caracteristicas generales, ya que no hay benchmarks publicados para el fine-tuning FACET-Terminal. El modelo se diferencia por su especializacion en tareas de terminal y su naturaleza multimodal, algo que no ofrecen Llama 3.1 8B ni Mistral 7B. Qwen3.5-9B base es el punto de partida, y el fine-tuning anade capacidades agénticas especificas.

## Limitaciones y advertencias

- Sesgos conocidos: al ser un fine-tuning de Qwen3.5, puede heredar sesgos presentes en los datos de entrenamiento originales, especialmente en tareas de generacion de texto libre.
- Riesgo de alucinacion: como cualquier modelo de lenguaje, puede generar comandos o instrucciones incorrectas, especialmente en entornos de terminal donde un error puede tener consecuencias graves. Se recomienda supervisar su ejecucion en entornos de produccion.
- Limitaciones de contexto: aunque el contexto nativo es de 262K tokens, el uso de cuantizaciones agresivas (Q2_K, Q3) puede degradar la calidad en contextos largos. Ademas, el fine-tuning podria haber reducido la ventana efectiva.
- Restricciones de idioma: la model card indica solo ingles. Aunque Qwen3.5 base es multilingue, el fine-tuning podria haber limitado el soporte a otros idiomas.
- Licencia: Apache-2.0 permite uso comercial, pero se debe mantener el aviso de licencia y atribucion. No hay restricciones de uso militar o de alto riesgo, pero se recomienda revisar los terminos de Qwen3.5.
- Cuantizacion estatica: los quants son estaticos, sin imatrix, lo que puede resultar en una calidad ligeramente inferior comparada con cuantizaciones ponderadas. Para maxima calidad, se recomienda usar Q8_0 o f16.
- Modelo en desarrollo: la fecha de creacion (2026) sugiere que es un modelo reciente; podria haber cambios en versiones posteriores.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/FACET-Terminal-Qwen3.5-9B-GGUF
- Modelo base: https://huggingface.co/FACET-Terminal/FACET-Terminal-Qwen3.5-9B
- Modelo Qwen3.5-9B original: https://huggingface.co/Qwen/Qwen3.5-9B
- Pagina de Qwen3.5 en LM Studio: https://lmstudio.ai/models/qwen/qwen3.5-9b
- Modelo en Ollama: https://ollama.com/library/qwen3.5:9b
- Repositorio GitHub de Qwen3: https://github.com/QwenLM/Qwen3
