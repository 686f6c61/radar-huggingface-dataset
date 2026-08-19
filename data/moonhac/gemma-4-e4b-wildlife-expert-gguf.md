# moonhac/gemma-4-E4B-wildlife-expert-GGUF

## Resumen

El modelo `moonhac/gemma-4-E4B-wildlife-expert-GGUF` es un ajuste fino (fine-tuning) del modelo multimodal Gemma 4 E4B de Google DeepMind, especializado en el dominio de la vida silvestre. Ha sido desarrollado por el usuario `moonhac` utilizando la librería Unsloth para el entrenamiento y la conversión a formato GGUF, lo que permite su ejecución eficiente en hardware de consumo mediante llama.cpp y herramientas compatibles.

Este modelo resuelve el problema de disponer de un asistente de visión y lenguaje experto en fauna, flora y conservación, capaz de procesar imágenes y texto de forma local sin depender de servicios en la nube. Su relevancia radica en que combina las capacidades multimodales de la familia Gemma 4 con una especialización temática, todo ello en un formato ligero (cuantización Q4_K_M) que cabe en GPUs de consumo con 8 GB de VRAM o menos.

El repositorio incluye dos archivos: el modelo principal cuantizado (`gemma-4-e4b-it.Q4_K_M.gguf`) y el proyector multimodal (`gemma-4-e4b-it.BF16-mmproj.gguf`) necesario para procesar imágenes. El número total de parámetros según los tensores safetensors es de 7.518.069.290 (aproximadamente 7,5 mil millones), aunque el modelo base Gemma 4 E4B se publicita como de 4,4 mil millones de parámetros; esta discrepancia puede deberse a la inclusión de los parámetros del proyector de visión o a la arquitectura completa del modelo multimodal.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (vision-lenguaje), basado en Gemma 4 E4B |
| Parametros totales | 7.518.069.290 (segun safetensors) |
| Parametros activos | no disponible (no se indica si es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q4_K_M (archivo principal), BF16 para el proyector multimodal |
| Idiomas soportados | no disponibles |
| Licencia | no disponible (el modelo base Gemma 4 tiene su propia licencia, pero este fine-tuning no la especifica) |
| Formato de pesos | GGUF (para llama.cpp) |

## Arquitectura y entrenamiento

El modelo es un ajuste fino del modelo Gemma 4 E4B de Google DeepMind, una arquitectura multimodal que combina un codificador de visión con un decodificador de lenguaje basado en transformer. El proceso de entrenamiento se realizó con Unsloth, una librería optimizada que acelera el fine-tuning y la conversión a GGUF. No se dispone de información detallada sobre el dataset de entrenamiento, el número de tokens utilizados ni si se aplicaron técnicas de RLHF o DPO. La especialización en vida silvestre sugiere que el conjunto de datos incluye imágenes y textos relacionados con fauna, flora, hábitats y conservación, pero estos datos no han sido publicados en la model card.

La conversión a GGUF permite su uso con llama.cpp, incluyendo la herramienta `llama-mtmd-cli` para modelos multimodales. El proyector multimodal se proporciona en BF16 para preservar la calidad de la representación visual, mientras que el modelo de lenguaje principal está cuantizado a Q4_K_M para reducir el uso de memoria.

## Capacidades

- Procesamiento multimodal: acepta entradas de imagen y texto simultáneamente, gracias al proyector de visión incluido.
- Generación de texto especializado en vida silvestre: identificación de especies, descripción de comportamientos, información sobre conservación y hábitats.
- Razonamiento sobre imágenes: puede analizar fotografías de animales, plantas o ecosistemas y proporcionar respuestas contextualizadas.
- Compatibilidad con llama.cpp y herramientas derivadas: funciona con `llama-cli` (texto) y `llama-mtmd-cli` (multimodal), así como con servidores compatibles con OpenAI API mediante endpoints.
- Soporte de Thinking Mode: según la documentación de Gemma 4 E4B, el modelo base incluye un modo de razonamiento extendido; no se confirma si este fine-tuning lo mantiene, pero es probable.
- Capacidad conversacional: el tag `conversational` indica que está diseñado para interacciones de diálogo multi-turno.

## Casos de uso

- Identificacion de especies a partir de fotografias: un biologo de campo puede subir una foto de un animal o planta y el modelo proporciona el nombre cientifico, la familia y caracteristicas distintivas, gracias a su especializacion en vida silvestre.
- Analisis de imagenes de camaras trampa: los investigadores pueden procesar lotes de imagenes capturadas en el medio natural para obtener descripciones preliminares de las especies presentes, agilizando el trabajo de revision manual.
- Educacion ambiental interactiva: estudiantes y aficionados pueden hacer preguntas sobre ecosistemas, especies en peligro o practicas de conservacion, recibiendo respuestas contextualizadas y basadas en el conocimiento especializado del modelo.
- Generacion de informes de observacion: a partir de una imagen y una breve descripcion del contexto, el modelo redacta un informe estructurado con datos de la especie, comportamiento observado y recomendaciones de conservacion.
- Asistente para guias de naturaleza: integrado en una aplicacion movil o web, permite a los usuarios fotografiar una especie y obtener informacion inmediata sobre su habitat, dieta y estado de conservacion.
- Consulta sobre legislacion y buenas practicas: el modelo puede responder preguntas sobre normativas de proteccion de fauna, manejo de especies invasoras o protocolos de reintroduccion, siempre que el conocimiento haya sido incluido en el fine-tuning.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No se dispone de datos de MMLU, HumanEval, GSM8K ni evaluaciones especificas de tareas de vision-lenguaje para este fine-tuning. El modelo base Gemma 4 E4B ha sido evaluado por Google DeepMind, pero no se han compartido cifras concretas en los resultados de busqueda proporcionados.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo base Gemma 4 E4B requiere minimo 8 GB de VRAM segun gemma4.dev. Con la cuantizacion Q4_K_M, el archivo GGUF principal ocupa aproximadamente 4-5 GB (el repositorio total es de 6.3 GB incluyendo el proyector BF16), por lo que cabe en GPUs con 8 GB de VRAM, como la RTX 3060, RTX 4060 o RTX 2070.
- GPUs recomendadas: cualquier GPU moderna con al menos 8 GB de VRAM es suficiente. Para mayor velocidad, se recomiendan RTX 4070, RTX 3080 o superiores. Tambien puede ejecutarse en CPU con suficiente RAM (16 GB o mas), aunque con mayor latencia.
- Opciones de despliegue: llama.cpp (mediante `llama-cli` o `llama-mtmd-cli`), llama.cpp server (con API compatible con OpenAI), Ollama (siguiendo las instrucciones de la model card para crear un modelo unificado), y cualquier servidor compatible con GGUF como LM Studio o KoboldCpp.
- Latencia y throughput: no se han publicado datos concretos. En una GPU de gama media (RTX 4060), se espera una velocidad de generacion de entre 20 y 40 tokens por segundo para un modelo de 4-5 GB cuantizado, aunque depende de la implementacion y del tamaño del contexto.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Modalidad | Licencia | Formato |
|---|---|---|---|---|---|
| moonhac/gemma-4-E4B-wildlife-expert-GGUF | 7,5B (safetensors) | no disponible | Vision + texto | no disponible | GGUF |
| google/gemma-4-E4B-it | 4,4B (segun gemma4.dev) | no disponible | Vision + texto | Gemma Terms of Use | Safetensors / GGUF |
| google/gemma-4-31B | 31B | no disponible | Vision + texto | Gemma Terms of Use | Safetensors |

La comparativa se limita a los modelos de la familia Gemma 4, ya que no se dispone de informacion sobre otros modelos comparables en la busqueda. El fine-tuning de `moonhac` se distingue por su especializacion en vida silvestre y por estar ya convertido a GGUF, lo que facilita su uso local. El modelo base Gemma 4 E4B es mas ligero (4,4B) pero sin la especializacion tematica; Gemma 4 31B ofrece mas capacidad pero requiere hardware de mayor gama.

## Limitaciones y advertencias

- Licencia no especificada: el repositorio no indica la licencia del fine-tuning. El modelo base Gemma 4 esta sujeto a los Terminos de Uso de Gemma de Google, que permiten uso comercial con ciertas restricciones. Se recomienda revisar la licencia del modelo base antes de un despliegue en produccion.
- Sesgos desconocidos: al no publicarse el dataset de entrenamiento, no se puede evaluar si el modelo tiene sesgos hacia ciertas regiones geograficas, especies o perspectivas de conservacion.
- Riesgo de alucinacion: como todo modelo de lenguaje, puede generar informacion incorrecta o inventada, especialmente en identificaciones de especies poco comunes o en contextos no cubiertos por el fine-tuning.
- Limitaciones de contexto: no se especifica la longitud de contexto soportada. Si es similar a la del modelo base, probablemente se situa entre 8K y 32K tokens, pero no hay confirmacion.
- Idiomas limitados: no se indica que idiomas soporta. El modelo base Gemma 4 es principalmente ingles, aunque puede tener capacidad multilingue limitada. Se recomienda probar con otros idiomas antes de usarlo en entornos no angloparlantes.
- Compatibilidad con Ollama: la model card advierte que Ollama no soporta archivos mmproj separados; para usarlo con Ollama hay que crear un modelo unificado en BF16, lo que aumenta el uso de memoria.
- Sin mantenimiento garantizado: el repositorio tiene 0 descargas y 0 likes, lo que sugiere que es un proyecto personal sin soporte comunitario ni actualizaciones previsibles.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/moonhac/gemma-4-E4B-wildlife-expert-GGUF
- Modelo base google/gemma-4-E4B-it: https://huggingface.co/google/gemma-4-E4B-it
- Modelo google/gemma-4-31B: https://huggingface.co/google/gemma-4-31B
- Pagina oficial de Gemma 4 en DeepMind: https://deepmind.google/models/gemma/gemma-4/
- Documentacion de Gemma 4 E4B en gemma4.dev: https://gemma4.dev/models/gemma-4-e4b
- Sitio gemma4.com con recetas de entrenamiento: https://gemma4.com/
- Libreria Unsloth: https://github.com/unslothai/unsloth
