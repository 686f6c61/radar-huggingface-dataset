# microperceptron/NVIDIA-Nemotron-3-Super-120B-A12B-BF16

## Resumen

NVIDIA-Nemotron-3-Super-120B-A12B-BF16 es un modelo de lenguaje de gran escala desarrollado por NVIDIA Corporation, publicado originalmente el 11 de marzo de 2026 y redistribuido en Hugging Face bajo el identificador `microperceptron/NVIDIA-Nemotron-3-Super-120B-A12B-BF16`. Se trata de un modelo de tipo Mixture-of-Experts con 123.611.012.096 parametros totales segun los pesos en safetensors (la model card redondea a 120B) y aproximadamente 12B parametros activos por token, lo que lo situa en la categoria de modelos grandes de alta eficiencia computacional.

Su arquitectura es un hibrido LatentMoE que combina capas Mamba-2, capas MoE y capas de atencion seleccionadas, e incorpora capas de Multi-Token Prediction (MTP) para decodificacion especulativa integrada. Soporta una longitud de contexto de hasta 1.000.000 de tokens y esta orientado a flujos de trabajo agenticos, razonamiento de contexto largo, uso de herramientas y cargas de alto volumen como la automatizacion de tickets de soporte tecnico.

Es relevante ahora porque es el primer modelo de la serie Nemotron 3 que emplea Latent MoE, incluye capas MTP y fue preentrenado con cuantizacion NVFP4, ademas de publicarse junto con los datasets de preentrenamiento y postentrenamiento y un informe tecnico. La version BF16 aqui descrita esta pensada para maxima fidelidad numerica, mientras que existe una variante NVFP4 para despliegue en un unico B200 o en DGX Spark.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LatentMoE: hibrido Mamba-2 + MoE + atencion, con capas de Multi-Token Prediction (MTP) |
| Parametros totales | 123.611.012.096 (~123,6B) segun safetensors; la model card indica 120B |
| Parametros activos | ~12B |
| Longitud de contexto | hasta 1.000.000 de tokens |
| Tipos de cuantizacion | BF16 en este checkpoint; existe variante NVFP4 (`nvidia/NVIDIA-Nemotron-3-Super-120B-A12B-NVFP4`). No se documentan GGUF, AWQ ni GPTQ para este checkpoint |
| Idiomas soportados | ingles, frances, espanol, italiano, aleman, japones y chino |
| Licencia | NVIDIA Nemotron Open Model License (licencia personalizada, no estandar) |
| Formato de pesos | safetensors (BF16), libreria `transformers` con `custom_code` (clase `nemotron_h`) |
| Tamano del repositorio | 247,2 GB |
| Fecha de publicacion | 11 de marzo de 2026 |
| Fecha de corte de datos | preentrenamiento: junio de 2025; postentrenamiento: febrero de 2026 |
| Modo de razonamiento | Configurable mediante plantilla de chat (`enable_thinking=True/False`) |
| Requisito minimo de GPU declarado | 8 x H100 de 80 GB |

## Arquitectura y entrenamiento

El modelo emplea una arquitectura hibrida Latent MoE en la que se intercalan capas Mamba-2 (modelo de espacio de estados) con capas de mezcla de expertos y un subconjunto de capas de atencion. Frente al modelo Nano de la misma familia, la variante Super incorpora capas de Multi-Token Prediction (MTP), que permiten predecir varios tokens por paso y actuan como mecanismo de decodificacion especulativa integrado, mejorando el rendimiento de generacion y, segun la model card, tambien la calidad. El checkpoint incluye una cabeza MTP propia y NVIDIA publica una cabeza MTPv2 actualizada como checkpoint separado.

En cuanto a los datos, el modelo base asociado fue preentrenado con mas de 25 billones (25T) de tokens procedentes de datos rastreados y sinteticos de codigo, matematicas, ciencia y conocimiento general, y el entrenamiento utilizo cuantizacion NVFP4 para maximizar la eficiencia de computo. El postentrenamiento se apoya en el dataset `nvidia/nemotron-post-training-v3` y el preentrenamiento en la coleccion `nvidia/nemotron-pre-training-datasets`. La model card no detalla la composicion exacta del dataset ni especifica si se aplicaron tecnicas concretas de RLHF o DPO, por lo que esos datos no estan disponibles en la informacion consultada. La generacion de respuestas sigue el patron de producir primero una traza de razonamiento y despues la respuesta final, con la traza activable o desactivable mediante la plantilla de chat.

## Capacidades

- Generacion de texto conversacional multi-turno con contexto de hasta 1M tokens.
- Razonamiento explicito configurable mediante `enable_thinking=True/False` en la plantilla de chat.
- Capacidades agenticas: razonamiento multi-paso, planificacion y ejecucion de tareas encadenadas.
- Uso de herramientas (tool calling / function calling), orientado a flujos de agentes colaborativos.
- Optimizado para RAG (generacion aumentada por recuperacion) sobre contextos extensos.
- Generacion y razonamiento sobre codigo, dado el uso de datos de codigo en el preentrenamiento.
- Razonamiento matematico y cientifico, segun la composicion declarada del preentrenamiento.
- Soporte multilingue en ingles, frances, espanol, italiano, alemán, japones y chino.
- Decodificacion especulativa integrada mediante cabeza MTP, con MTPv2 disponible como checkpoint aparte.
- Ajuste recomendado de muestreo: `temperature=1.0` y `top_p=0.95` en todas las tareas y backends.
- No se documentan capacidades de vision, audio ni entrada multimodal en la informacion disponible.

## Casos de uso

- Automatizacion de tickets de TI: es el escenario explicitamente destacado por NVIDIA. El modelo puede clasificar, enrutar, resolver y redactar respuestas sobre tickets con historiales largos gracias a su ventana de 1M tokens, manteniendo el contexto completo del caso sin truncados agresivos.
- Agentes colaborativos multi-paso: con soporte de tool calling y razonamiento encadenado, puede orquestar llamadas a APIs internas, consultar bases de datos y componer el resultado final, con la traza de razonamiento activada para auditoria o desactivada para reducir latencia.
- Asistentes de codigo en produccion: generacion, revision y refactorizacion de codigo, integrable en pipelines de CI/CD como revisor automatico de pull requests, aprovechando el entrenamiento sobre datos de codigo.
- RAG sobre documentacion corporativa extensa: al admitir hasta 1M tokens de contexto, permite inyectar manuales, contratos o normativas completas y formular preguntas sobre ellos reduciendo la dependencia de recuperacion fragmentada.
- Analisis de documentos legales o tecnicos de gran volumen: resumen y extraccion de clausulas sobre expedientes completos en un solo paso de inferencia.
- Atencion al cliente multilingue: cubre siete idiomas (ingles, frances, espanol, italiano, aleman, japones y chino), lo que permite un unico modelo para bases de clientes internacionales.
- Planificacion y descomposicion de tareas en entornos de automatizacion: generar planes de ejecucion, subtareas y criterios de verificacion antes de invocar herramientas.
- Generacion de codigo asistida en IDE o CLI: autocompletado y explicacion de codigo, siempre que se despliegue con la infraestructura adecuada.
- Sintesis de conocimiento cientifico o tecnico: resumen de articulos y literatura, apoyandose en el preentrenamiento sobre datos cientificos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks numericos en la informacion disponible. La model card incluye una grafica de exactitud (`accuracy_chart.png`) y la etiqueta `eval-results`, pero los valores concretos (MMLU, HumanEval, GSM8K u otros) no se recogen en los datos proporcionados, por lo que no se presentan cifras. Tampoco hay datos de latencia o throughput medidos.

## Requisitos de hardware

- Requisito minimo declarado por NVIDIA: 8 x H100 de 80 GB (640 GB de VRAM agregada) para el checkpoint BF16.
- Peso de los pesos en BF16: 247,2 GB de repositorio; a razon de 2 bytes por parametro, los ~123,6B de parametros ocupan aproximadamente 247 GB solo en pesos, a lo que se suma la cache KV (no disponible su tamano exacto).
- Estimacion aritmetica orientativa por cuantizacion: ~124 GB a 8 bits y ~62 GB a 4 bits. Estas cifras son calculos derivados del numero de parametros, no datos publicados por NVIDIA para este checkpoint.
- Variante NVFP4 oficial (`nvidia/NVIDIA-Nemotron-3-Super-120B-A12B-NVFP4`): NVIDIA indica que permite ejecutar Nemotron 3 Super en un unico B200 o en un DGX Spark.
- GPU consumer: el checkpoint BF16 no es viable en GPUs de consumo por el volumen de pesos; no se documenta en la informacion disponible ninguna cuantizacion tipo GGUF que permita despliegue en RTX 4090 o similares.
- Opciones de despliegue documentadas: `transformers` con codigo personalizado (`nemotron_h`) y NVIDIA NIM / build.nvidia.com. La etiqueta `endpoints_compatible` sugiere compatibilidad con endpoints alojados.
- No se documenta soporte explicito de vLLM, llama.cpp, Ollama ni TGI en la informacion proporcionada.
- Latencia y throughput: no disponibles. La unica referencia cualitativa es que las capas MTP estan disenadas para acelerar la generacion de texto mediante decodificacion especulativa.

## Comparativa con modelos similares

No se dispone de datos de benchmarks ni de especificaciones verificadas de modelos competidores externos en la informacion proporcionada, por lo que la comparativa se limita a las variantes de la propia familia Nemotron 3 documentadas en la busqueda web.

| Modelo | Parametros | Contexto | Formato / cuantizacion | Licencia | Notas |
|---|---|---|---|---|---|
| Nemotron-3-Super-120B-A12B-BF16 (este) | 123,6B totales / ~12B activos | 1M | BF16, safetensors | NVIDIA Nemotron Open Model License | Checkpoint de referencia, requiere 8 x H100-80GB |
| Nemotron-3-Super-120B-A12B-NVFP4 | 120B (12B activos) | 1M | NVFP4 | NVIDIA Nemotron Open Model License | Pensado para un unico B200 o DGX Spark |
| Nemotron-3-Super-120B-A12B-Base-BF16 | 120B | no disponible | BF16 | NVIDIA Nemotron Open Model License | Modelo base, preentrenado con mas de 25T tokens, sin postentrenamiento conversacional |
| Nemotron-3-Super-120B-A12B-BF16-MTPv2 | 120B | 1M | BF16 | NVIDIA Nemotron Open Model License | Cabeza MTPv2 actualizada, publicada como checkpoint separado |

Comparativa con modelos de otras familias (DeepSeek, Qwen, Llama u otros MoE de tamano similar): no disponible en la informacion proporcionada.

## Limitaciones y advertencias

- Sesgos conocidos: no se documentan en la informacion disponible. Al ser un modelo entrenado sobre datos rastreados de internet y datos sinteticos, es esperable heredar sesgos de esas fuentes, pero NVIDIA no publica un analisis concreto en los materiales consultados.
- Riesgo de alucinacion: no se cuantifica. Como todo LLM generativo, puede producir afirmaciones incorrectas, especialmente en modo de razonamiento desactivado o en dominios poco representados.
- Traza de razonamiento: activar `enable_thinking=True` incrementa el consumo de tokens de salida y la latencia; desactivarlo puede degradar la precision en tareas complejas.
- Idiomas: cobertura declarada de siete idiomas (en, fr, es, it, de, ja, zh). No se garantiza buen rendimiento fuera de esa lista, y no hay evaluacion por idioma publicada.
- Contexto: aunque la ventana es de 1M tokens, no se publican resultados de evaluacion especificos para longitudes cercanas al maximo, ni datos de degradacion con la distancia.
- Licencia: se rige por la NVIDIA Nemotron Open Model License, que no es una licencia open source estandar. Aunque la model card indica que el modelo esta listo para uso comercial, las condiciones concretas (atribucion, restricciones, obligaciones) deben revisarse en el texto completo de la licencia antes de desplegarlo en produccion.
- Este repositorio concreto es una redistribucion de terceros (`microperceptron`) con 0 descargas y 0 likes en el momento de la consulta; para uso en produccion conviene verificar frente a los repositorios oficiales de NVIDIA y comprobar la integridad de los pesos.
- Requisito de hardware muy elevado en BF16 (8 x H100-80GB), lo que limita el despliegue on-premise a organizaciones con infraestructura de centro de datos.
- Fechas de corte de datos: junio de 2025 para preentrenamiento y febrero de 2026 para postentrenamiento. Cualquier evento posterior no esta cubierto.
- No se documentan mecanismos de filtrado, moderacion ni evaluacion de seguridad en los materiales consultados.

## Enlaces

- Repositorio en Hugging Face (redistribucion): https://huggingface.co/microperceptron/NVIDIA-Nemotron-3-Super-120B-A12B-BF16
- Repositorio oficial NVFP4: https://huggingface.co/nvidia/NVIDIA-Nemotron-3-Super-120B-A12B-NVFP4
- Repositorio oficial del modelo base: https://huggingface.co/nvidia/NVIDIA-Nemotron-3-Super-120B-A12B-Base-BF16
- Checkpoint de la cabeza MTPv2: https://huggingface.co/nvidia/Nemotron-3-Super-120B-A12B-BF16-MTPv2
- Pagina del modelo en NVIDIA NIM: https://build.nvidia.com/nvidia/nemotron-3-super-120b-a12b
- Model card en NVIDIA NIM: https://build.nvidia.com/nvidia/nemotron-3-super-120b-a12b/modelcard
- Pagina de investigacion de Nemotron 3 Super: https://research.nvidia.com/labs/nemotron/Nemotron-3-Super/
- Informe tecnico (PDF): https://research.nvidia.com/labs/nemotron/files/NVIDIA-Nemotron-3-Super-Technical-Report.pdf
- Coleccion de datasets de preentrenamiento: https://huggingface.co/collections/nvidia/nemotron-pre-training-datasets
- Coleccion de datasets de postentrenamiento v3: https://huggingface.co/collections/nvidia/nemotron-post-training-v3
- Licencia NVIDIA Nemotron Open Model License: https://www.nvidia.com/en-us/agreements/enterprise-software/nvidia-nemotron-open-model-license/
- Pagina para desarrolladores de Nemotron: https://developer.nvidia.com/nemotron
- Servidor de Discord de NVIDIA AI Developer: https://discord.gg/9xpKQtVvrk
- Referencia arXiv 2512.20848 (etiqueta del repositorio; no se dispone del titulo en la informacion consultada)
- Referencia arXiv 2512.20856 (etiqueta del repositorio; no se dispone del titulo en la informacion consultada)
