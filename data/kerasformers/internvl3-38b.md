# kerasformers/internvl3-38b

## Resumen

InternVL3-38B es un modelo multimodal de lenguaje de gran tamano (MLLM) desarrollado por OpenGVLab, presentado en abril de 2025 como parte de la serie InternVL3. Este checkpoint concreto, `kerasformers/internvl3-38b`, es una conversion pura en Keras 3 del modelo original `OpenGVLab/InternVL3-38B-hf`, mantenida por el proyecto KerasFormers. Su objetivo es permitir ejecutar el mismo modelo de forma identica sobre tres backends de Keras 3: TensorFlow, PyTorch y JAX, sin necesidad de modificar el codigo de inferencia.

El modelo procesa entradas de imagen y texto para generar texto, cubriendo tareas de descripcion de imagenes, respuesta visual a preguntas, razonamiento multimodal y capacidades de agente con uso de herramientas. Con 38.000 millones de parametros en arquitectura densa y una ventana de contexto de 32.000 tokens, se posiciona como una alternativa de tamano medio-alto dentro del ecosistema de modelos multimodales open source. Su relevancia actual radica en la combinacion de rendimiento competitivo en benchmarks multimodales con una implementacion portable entre frameworks, algo poco habitual en modelos de este tamano.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso multimodal (vision + lenguaje) |
| Parametros totales | 38.000 millones (38B) |
| Parametros activos | no aplicable (modelo denso, no MoE) |
| Longitud de contexto | 32.000 tokens |
| Tipos de cuantizacion | 14 cuantizaciones disponibles (segun FitMyLLM) |
| Idiomas soportados | ingles (segun model card) |
| Licencia | other (ver licencia upstream en OpenGVLab/InternVL3-38B-hf) |
| Formato de pesos | safetensors en bfloat16 (conversion Keras 3) |

## Arquitectura y entrenamiento

InternVL3-38B es un modelo de arquitectura transformer densa que combina un codificador visual con un modelo de lenguaje de 38B parametros. La serie InternVL3 introduce mejoras respecto a su predecesor InternVL 2.5 en percepcion multimodal y razonamiento, anadiendo capacidades como uso de herramientas, agentes GUI, analisis de imagenes industriales y percepcion 3D. El modelo fue entrenado con un pipeline que incluye datos de imagen-texto a gran escala y un proceso de optimizacion con preferencias (MPO) y un razonador visual de procesos (VisualPRM), segun se describe en el repositorio oficial de OpenGVLab.

La conversion de KerasFormers mantiene los pesos originales en bfloat16 y proporciona una implementacion unificada que funciona sin cambios en TensorFlow, PyTorch o JAX. No se dispone de informacion detallada sobre el numero exacto de tokens de entrenamiento ni la composicion del dataset en la informacion proporcionada.

## Capacidades

- Generacion de texto a partir de entradas de imagen y texto (image-text-to-text).
- Descripcion de imagenes en lenguaje natural.
- Respuesta visual a preguntas (visual question answering).
- Razonamiento multimodal avanzado, incluyendo tareas que requieren integrar informacion visual y textual.
- Uso de herramientas (tool usage) y capacidades de agente, incluyendo agentes GUI.
- Analisis de imagenes industriales y percepcion 3D.
- Soporte de conversaciones multi-turno con contexto largo (32K tokens).
- Implementacion portable entre TensorFlow, PyTorch y JAX gracias a Keras 3.

## Casos de uso

- Descripcion automatica de imagenes en aplicaciones de accesibilidad: el modelo puede generar descripciones detalladas de fotografias o ilustraciones para usuarios con discapacidad visual, aprovechando su ventana de 32K tokens para procesar imagenes de alta resolucion con multiples turnos de refinamiento.
- Moderacion de contenido visual en plataformas sociales: analisis de imagenes subidas por usuarios para detectar contenido inapropiado o generar etiquetas automaticas, integrable en pipelines de backend mediante la API de Keras 3.
- Asistente multimodal para soporte tecnico: un chatbot que recibe capturas de pantalla o fotos de un problema (hardware, configuracion) y genera instrucciones de resolucion paso a paso, gracias a su capacidad de razonamiento multimodal y contexto largo.
- Agente GUI automatizado: el modelo puede interpretar capturas de pantalla de interfaces de usuario y generar acciones (clics, navegacion) para automatizar tareas repetitivas en entornos de escritorio o web.
- Analisis de imagenes medicas o industriales: clasificacion y descripcion de anomalias en radiografias, placas de circuitos o superficies de materiales, donde la combinacion de percepcion visual y razonamiento textual es critica.
- Generacion de contenido educativo: creacion de explicaciones detalladas a partir de diagramas, graficos o ilustraciones cientificas, util para plataformas de e-learning que necesitan convertir material visual en texto pedagogico.
- Investigacion en vision por computador: uso como modelo base para fine-tuning en tareas especificas de multimodalidad, gracias a su licencia open source y disponibilidad de pesos en formato estandar.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La pagina de FitMyLLM menciona la existencia de 2 benchmarks para este modelo, pero no se proporcionan los valores concretos. Se recomienda consultar la model card upstream de OpenGVLab/InternVL3-38B-hf para obtener datos de evaluacion comparativa.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo tiene 38B parametros en bfloat16, lo que supone aproximadamente 76 GB de pesos sin cuantizar. Con cuantizacion a 8 bits se reduce a unos 38 GB, y a 4 bits a unos 19 GB.
- GPU recomendadas: para inferencia en bfloat16 se necesitan GPUs de clase profesional como A100 (80 GB) o H100 (80 GB). Con cuantizacion a 4 bits puede ejecutarse en GPUs de consumo como RTX 4090 (24 GB) o RTX 3090 (24 GB).
- En consumer GPU: si, con cuantizacion a 4 bits o menor, aunque la velocidad sera limitada.
- Opciones de despliegue: al ser una conversion Keras 3, puede ejecutarse con los backends de TensorFlow, PyTorch o JAX. No se menciona soporte explicito para vLLM, llama.cpp u Ollama en la informacion proporcionada, aunque al ser un modelo basado en arquitectura estandar podria adaptarse.
- Latencia y throughput: no disponible en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| InternVL3-38B (este) | 38B | 32K | other (open source) | HuggingFace, Keras 3 |
| InternVL3-78B | 78B | 32K | other (open source) | HuggingFace |
| InternVL 2.5 | hasta 78B | 32K | other (open source) | HuggingFace |

La comparativa se limita a la propia familia InternVL por falta de informacion sobre alternativas directas en los resultados de busqueda. InternVL3-38B es la version media de la serie, por debajo del modelo de 78B que alcanza estado del arte en percepcion y razonamiento entre MLLMs open source, pero con menores requisitos de hardware.

## Limitaciones y advertencias

- La model card indica idioma ingles unicamente; no se garantiza rendimiento en otros idiomas.
- La licencia es "other" y debe consultarse el texto completo en el repositorio upstream antes de uso comercial.
- No se dispone de informacion sobre sesgos especificos del modelo, aunque como todo MLLM entrenado con datos web puede reflejar sesgos presentes en los datos de entrenamiento.
- Riesgo de alucinacion en descripciones de imagenes o respuestas a preguntas visuales, especialmente en escenarios ambiguos o de baja resolucion.
- La conversion Keras 3 es un port no oficial; el rendimiento numerico puede variar ligeramente respecto al checkpoint original de PyTorch.
- El tamano del repositorio es de 76,9 GB, lo que requiere un ancho de banda considerable para la descarga.
- No se proporcionan garantias de soporte para produccion por parte del proyecto KerasFormers.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/kerasformers/internvl3-38b
- Modelo upstream: https://huggingface.co/OpenGVLab/InternVL3-38B-hf
- Repositorio GitHub de InternVL: https://github.com/OpenGVLab/InternVL
- Blog de presentacion de InternVL3: https://internvl.github.io/blog/2025-04-11-InternVL-3.0/
- Repositorio GitHub de KerasFormers: https://github.com/IMvision12/KerasFormers
- Documentacion de InternVL en KerasFormers: https://imvision12.github.io/KerasFormers/internvl/
- Coleccion de modelos InternVL en HuggingFace: https://huggingface.co/collections/kerasformers/internvl-6a8277076dbb163f53241dbd
- Pagina de FitMyLLM con especificaciones: https://www.fitmyllm.com/model/internvl3-38b
