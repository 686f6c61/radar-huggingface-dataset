# CMSManhattan/JiRack_10b

## Resumen

JiRack 10B es un asistente de codificacion desarrollado por CMSManhattan, disenado como un modelo de lenguaje especializado en tareas de programacion y chat tecnico. Se basa en los pesos de Meta Llama 3.1 8B Instruct, sobre los que se ha aplicado una refactorizacion arquitectonica completa para escalar el modelo a un tamano aproximado de 10 mil millones de parametros. El modelo se distribuye con una interfaz web integrada y soporte para multiples motores de inferencia, incluyendo ONNX Runtime, llama.cpp y bitnet.cpp, lo que facilita su despliegue tanto en CPU como en GPU.

La propuesta de valor principal de JiRack 10B reside en su flexibilidad de cuantizacion (FP32, INT8, INT4) y en su capacidad para ejecutarse en entornos con recursos limitados, como equipos de consumo o instancias en la nube. El modelo incluye una licencia comercial con planes de suscripcion mensual o anual, y ofrece opciones de personalizacion mediante QAT (Quantization-Aware Training) para adaptarlo a tareas especificas. Aunque no se publican resultados de benchmarks, el autor afirma que esta optimizado para alto rendimiento y bajo coste en despliegues cloud, con soporte para RAG y analisis de documentos.

La relevancia actual del modelo radica en su enfoque practico: combina un modelo base solido (Llama 3.1) con una capa de servicio lista para produccion (UI web, Docker, API), orientada a desarrolladores que necesitan un asistente de codigo desplegable rapidamente. Su proxima version, JiRack Ternary 10B, promete mejoras adicionales en velocidad mediante compresion ternaria, lo que indica una linea de desarrollo activa en torno a la eficiencia computacional.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (refactorizacion de Meta Llama 3.1 8B Instruct) |
| Parametros totales | Aproximadamente 10 mil millones (escala 10B, no confirmado) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | FP32, INT8, INT4; soporte futuro para ternario (bitnet.cpp) |
| Idiomas soportados | en, ru, fr, de, pt, es, hi, th |
| Licencia | cms-manhattan-jirack-v1.4 (comercial, con suscripcion) |
| Formato de pesos | safetensors, ONNX, GGUF (segun tags y menciones) |

## Arquitectura y entrenamiento

JiRack 10B parte de los pesos de Meta Llama 3.1 8B Instruct, un modelo transformer denso con atencion por ventanas deslizantes y mecanismos de atencion con consultas agrupadas (GQA). La refactorizacion realizada por CMSManhattan amplia la escala del modelo hasta aproximadamente 10 mil millones de parametros, aunque no se especifican los cambios arquitectonicos concretos ni el numero exacto de capas, dimensiones o cabezas de atencion. No se proporcionan detalles sobre el dataset de entrenamiento, el numero de tokens procesados ni el uso de tecnicas como RLHF o DPO. El autor menciona la posibilidad de realizar fine-tuning con QLoRA en GPUs de consumo (por ejemplo, Blackwell con 96 GB de VRAM) y ofrece servicios de adaptacion mediante QAT para compresion ternaria, lo que sugiere un proceso de entrenamiento flexible y orientado a personalizacion.

Una innovacion destacable es la compatibilidad con el kernel ternario de llama.cpp y bitnet.cpp, que permite convertir el modelo a formato ternario (I2S_0) con soporte para instrucciones AVX2 y AVX-512 en CPU. Esta caracteristica, combinada con la cuantizacion INT8/INT4, posiciona al modelo como una opcion para despliegues de bajo coste. Sin embargo, no se publican detalles tecnicos sobre la arquitectura interna refactorizada, por lo que la informacion disponible es limitada.

## Capacidades

- Generacion de codigo y asistencia en tareas de programacion, como completado, revision y explicacion de fragmentos de codigo.
- Chat conversacional multi-turno con interfaz web integrada (UI limpia y moderna) accesible via navegador.
- Soporte multilingue en ocho idiomas: ingles, ruso, frances, aleman, portugues, espanol, hindi y tailandes.
- Ejecucion en CPU y GPU mediante ONNX Runtime, con opciones de cuantizacion INT8 e INT4 para reducir el uso de memoria.
- Integracion con motores de inferencia alternativos: llama.cpp (formato GGUF) y bitnet.cpp (kernel ternario).
- Capacidad para ser utilizado como modelo experto en arquitecturas RAG (Retrieval-Augmented Generation) en entornos cloud.
- Analisis de documentos y correos electronicos, segun los videos de demostracion del autor, que muestran funcionalidades de resumen y respuesta automatica.
- Compatibilidad con clientes moviles (Android) y de escritorio (Windows 11) a traves de la API de Ollama.

## Casos de uso

- Asistente de codificacion en entornos de desarrollo: el modelo puede integrarse en IDEs o pipelines de CI/CD para generar, revisar o documentar codigo, aprovechando su especializacion en tareas de programacion y su bajo coste de inferencia en CPU con cuantizacion INT8.
- Despliegue de un chatbot de soporte tecnico en la nube: gracias a su soporte multilingue y a la interfaz web incluida, puede servir como agente de atencion al cliente en multiples idiomas, gestionando consultas sobre productos o servicios con contexto conversacional.
- Sistema de analisis y respuesta de correos electronicos: el autor demuestra una solucion donde el modelo resume bandejas de entrada y redacta respuestas, lo que resulta util para automatizar tareas administrativas en pequenas empresas o profesionales independientes.
- Implementacion de RAG sobre documentacion interna: al ser un modelo experto en codigo, puede combinarse con un indice vectorial para responder preguntas sobre repositorios, APIs o manuales tecnicos, reduciendo el coste de infraestructura al ejecutarse en CPU con ONNX.
- Prototipado rapido de aplicaciones de chat: la disponibilidad de contenedores Docker listos para usar (imagenes INT8 e INT4) permite lanzar un servicio de chat funcional en minutos, ideal para pruebas de concepto o demos internas.
- Uso en entornos con restricciones de hardware: al soportar cuantizacion INT4 y ejecucion en CPU con llama.cpp, puede desplegarse en equipos modestos o en edge devices, como un asistente de codigo local para desarrolladores que trabajan sin conexion.
- Personalizacion mediante QAT para tareas especificas: el autor ofrece servicios de adaptacion del modelo a datasets propios, lo que permite ajustar JiRack 10B para dominios concretos (por ejemplo, generacion de codigo en un lenguaje propietario) manteniendo la compresion ternaria.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye puntuaciones de MMLU, HumanEval, GSM8K ni otras metricas estandar, y tampoco se proporcionan comparaciones cuantitativas con otros modelos. El unico dato de rendimiento mencionado son las velocidades estimadas de generacion en sistemas AMD (ver seccion de requisitos de hardware), que oscilan entre 35 y 140 tokens por segundo segun la configuracion, pero estos valores provienen del autor y no estan respaldados por evaluaciones independientes.

## Requisitos de hardware

- VRAM estimada: el modelo en INT8 ocupa aproximadamente 8-9 GB, pero se recomienda al menos 24 GB de VRAM para tener en cuenta el consumo de KV-cache durante la generacion, el overhead de ONNX Runtime y los buffers temporales.
- GPU recomendadas: para sistemas AMD con ROCm, se sugieren las siguientes configuraciones:
  - RX 7900 XTX / 7900 XT (24 GB VRAM) para un rendimiento de 50-75 tokens/s.
  - RX 7800 XT (16 GB VRAM) como opcion economica, con 35-50 tokens/s.
  - MI300X o doble RX 7900 XTX para cargas empresariales, alcanzando 90-140 tokens/s.
- CPU recomendadas: Ryzen 7 7700/9700X, Ryzen 9 7950X/9950X, EPYC 7003/9004 series, dependiendo del presupuesto y la carga de trabajo.
- Si cabe en GPU de consumo: si, con cuantizacion INT8 o INT4 y al menos 16 GB de VRAM, aunque el autor recomienda 24 GB para estabilidad.
- Opciones de despliegue: Docker (imagenes oficiales para CPU INT8/INT4 y GPU), ONNX Runtime (servidor Java opcional), llama.cpp (formato GGUF), bitnet.cpp (kernel ternario), y API de Ollama para clientes moviles y de escritorio.
- Latencia y throughput: no se proporcionan mediciones estandarizadas; las cifras de tokens/s mencionadas son estimaciones del autor para hardware AMD especifico.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Cuantizaciones | Idiomas | Despliegue |
|---|---|---|---|---|---|---|
| JiRack 10B | ~10B (refactorizado) | No disponible | Comercial (suscripcion) | FP32, INT8, INT4, ternario | 8 | ONNX, llama.cpp, Docker, Ollama |
| Meta Llama 3.1 8B Instruct | 8B | 128K tokens | Meta Community License | FP16, INT8, INT4, GGUF | Multilingue (amplio) | vLLM, TGI, llama.cpp, Ollama |
| CodeLlama 7B Instruct | 7B | 16K tokens | Llama 2 Community License | FP16, INT8, INT4 | Principalmente ingles | vLLM, llama.cpp, Ollama |

La comparativa se basa en caracteristicas generales, ya que no hay datos de rendimiento publicados para JiRack 10B. Llama 3.1 8B Instruct es el modelo base y ofrece una ventana de contexto mucho mayor (128K) y una licencia mas permisiva (uso comercial permitido con condiciones). CodeLlama 7B es una alternativa especializada en codigo con licencia similar. JiRack 10B se diferencia por su enfoque en cuantizacion agresiva y su ecosistema de servicio integrado, pero su licencia comercial y la falta de benchmarks publicados limitan su comparabilidad objetiva.

## Limitaciones y advertencias

- Licencia comercial restrictiva: el modelo se distribuye bajo la licencia cms-manhattan-jirack-v1.4, que requiere suscripcion mensual o anual por usuario (1-3 dolares al mes, o 12-36 dolares al ano). No es de uso libre ni open source, lo que puede limitar su adopcion en proyectos comerciales o academicos.
- Ausencia de benchmarks publicados: no hay datos verificables sobre calidad de generacion, razonamiento o seguridad. Las afirmaciones de rendimiento del autor no estan respaldadas por evaluaciones independientes, por lo que se recomienda realizar pruebas propias antes de usarlo en produccion.
- Riesgo de alucinacion y sesgos: al ser un modelo derivado de Llama 3.1, puede presentar los mismos sesgos y tendencias a generar informacion falsa o desactualizada. No se documentan medidas especificas de mitigacion.
- Limitaciones de contexto desconocidas: no se especifica la longitud maxima de contexto soportada, lo que dificulta planificar usos con documentos largos o conversaciones extensas. El autor recomienda 24 GB de VRAM para KV-cache, lo que sugiere un contexto moderado, pero no se confirma.
- Tamano del repositorio elevado: el repositorio de HuggingFace ocupa 2717.2 GB, probablemente debido a la inclusion de multiples formatos y cuantizaciones. Esto puede dificultar la descarga y el almacenamiento local.
- Dependencia de servicios propietarios: algunas funcionalidades (como la adaptacion QAT o el soporte ternario) requieren contactar directamente con el autor, lo que introduce una dependencia externa para personalizaciones avanzadas.
- Sin informacion sobre entrenamiento: no se detallan los datos de entrenamiento ni el proceso de alineacion, lo que impide evaluar su robustez en dominios especializados o su comportamiento etico.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/CMSManhattan/JiRack_10b
- Demo del cliente Android: https://www.youtube.com/watch?v=SaO6Jfb8R68
- Demo de RAG y analisis de email: https://www.youtube.com/watch?v=KRu2nLEh_6g&t=78s
- Repositorio relacionado (cliente Android y Windows): https://huggingface.co/kgrabko/JiRackTernary_1b
- Contacto para licencias y soporte: support@cmsmanhattan.com
