# eyes-dot-ml/gemma-4-12B-it

## Resumen

Gemma 4 12B Unified es un modelo multimodal de Google DeepMind publicado como pesos abiertos dentro de la familia Gemma 4. Esta ficha concreta, `eyes-dot-ml/gemma-4-12B-it`, es un ajuste de instrucciones derivado de `google/gemma-4-12B`, subido por el usuario `eyes-dot-ml`. El modelo base es un transformer denso, decoder-only, de 11.959.730.224 parametros (11,95B), con 48 capas, ventana de contexto de 256K tokens y un vocabulario de 262K tokens. Su rasgo diferencial dentro de la familia es que es "unificado": prescinde de encoders dedicados de vision y audio y proyecta los parches de imagen y las formas de onda de audio directamente al espacio de embeddings del LLM mediante capas lineales ligeras.

El problema que resuelve es el de un modelo multimodal capaz de ejecutarse localmente en GPUs de consumo y estaciones de trabajo. Al eliminar los encoders separados, se reduce la latencia multimodal y se permite ajustar todo el modelo en una sola pasada, con un tamano de despliegue alrededor de 24 GB en safetensors (precision de 16 bits). El modelo acepta texto, imagen y audio como entrada y genera texto como salida.

La relevancia de esta publicacion concreta es limitada por el momento: el repositorio acumula 0 descargas y 0 likes, no incluye detalles sobre el dataset o el procedimiento del ajuste de instrucciones, y reutiliza en gran medida el contenido de la model card oficial de la familia Gemma 4. Para evaluar el modelo en produccion conviene tratar la ficha del modelo base como referencia principal y verificar por separado el comportamiento real de este fine-tune.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso, decoder-only, con atencion hibrida (sliding window local + atencion global), Keys y Values unificadas en capas globales y Proportional RoPE (p-RoPE); sin encoders multimodales (arquitectura "unified") |
| Parametros totales | 11.959.730.224 (11,95B) |
| Parametros activos | No aplica: es un modelo denso, no MoE |
| Longitud de contexto | 256K tokens |
| Tamano de ventana deslizante | 1024 tokens |
| Capas | 48 |
|---|---|
| Tipos de cuantizacion | No se distribuyen cuantizaciones oficiales en el repositorio; el repo contiene pesos en safetensors a 16 bits (24,0 GB). Al ser un modelo denso de 11,95B es cuantizable con herramientas estandar (GGUF/llama.cpp, AWQ, GPTQ), pero no hay ficheros cuantizados publicados ni recetas verificadas en la informacion disponible |
| Idiomas soportados | La model card de la familia Gemma 4 indica soporte multilingue en mas de 140 idiomas; no se detalla el desglose especifico de este fine-tune |
| Licencia | `apache-2.0` segun los metadatos del repositorio. La propia model card enlaza como licencia los terminos de Gemma 4 (`https://ai.google.dev/gemma/docs/gemma_4_license`), lo que genera una discrepancia que conviene resolver antes de uso comercial |
| Formato de pesos | safetensors (libreria `transformers`) |
| Pipeline declarado | `any-to-any` (tags: `image-text-to-text`, `any-to-any`, `gemma4_unified`) |
| Modalidades de entrada | Texto, imagen y audio; salida solo texto. La tabla de la familia indica que el 12B Unified soporta Texto, Imagen y Audio (el 31B Dense no soporta audio) |
| Modelo base | `google/gemma-4-12B` (ajuste de instrucciones) |
| Fecha de publicacion | 17 de septiembre de 2026 (creacion y ultima actualizacion identicas) |
| Tamano del repositorio | 24,0 GB |

## Arquitectura y entrenamiento

El modelo base es un transformer decoder-only denso con una mecanica de atencion hibrida que intercala capas de atencion local con ventana deslizante de 1024 tokens y capas de atencion global completa, garantizando que la ultima capa sea siempre global. Para contener el coste de memoria en contextos largos, las capas globales emplean Keys y Values unificadas y aplican Proportional RoPE (p-RoPE). Esta combinacion busca el coste de memoria bajo de un modelo ligero sin renunciar a la capacidad de manejar dependencias de contexto largo. El vocabulario es de 262K tokens y el modelo tiene 48 capas.

La innovacion arquitectonica principal del 12B Unified es la eliminacion de los encoders multimodales. En lugar de procesar imagen y audio mediante encoders dedicados (como ocurre en los variantes E2B, E4B y 31B de la misma familia, que incorporan encoders de vision de ~150M a ~550M de parametros y de audio de ~300M), este modelo proyecta los parches de imagen crudos y las formas de onda de audio directamente al espacio de embeddings del LLM a traves de capas lineales ligeras. Todas las modalidades fluyen asi por un unico transformer decoder-only, lo que reduce la latencia multimodal y permite ajustar el modelo completo en una sola pasada.

En cuanto a los datos de entrenamiento, la composicion del dataset, el numero de tokens y el procedimiento de alineacion (RLHF, DPO u otros) no se detallan en la informacion disponible. Tampoco se especifica que datos ni que metodologia se emplearon para el ajuste de instrucciones que da lugar a este repositorio concreto. La model card de la familia menciona modos de razonamiento configurables ("thinking modes"), soporte nativo del rol `system` y function calling nativo, pero no se aportan cifras de entrenamiento.

## Capacidades

- Generacion de texto en contextos de hasta 256K tokens, con atencion hibrida disenada para mantener eficiencia en contextos muy largos.
- Razonamiento con modos de pensamiento configurables, segun la descripcion de la familia Gemma 4.
- Comprension de imagen con soporte de relacion de aspecto y resolucion variables (todas las variantes de la familia), sin encoder de vision dedicado en este modelo.
- Comprension de audio de forma nativa, integrada directamente en el decoder en lugar de mediante un encoder separado.
- Entrada de video, segun la descripcion de multimodalidad extendida de la familia Gemma 4.
- Salida exclusivamente de texto: el pipeline `any-to-any` del repositorio no implica generacion de imagen o audio.
- Function calling nativo, orientado a flujos agénticos y de multiples pasos.
- Soporte nativo del rol `system`, que permite estructurar y controlar mejor las conversaciones.
- Capacidades de codigo mejoradas respecto a generaciones anteriores, segun la model card de la familia, aunque sin cifras publicadas.
- Soporte multilingue en mas de 140 idiomas a nivel de familia.
- Capacidad de ejecucion local en dispositivos de consumo y estaciones de trabajo, gracias al tamano de 11,95B y a la ausencia de encoders adicionales.

## Casos de uso

- Atencion al cliente automatizada: con 256K tokens de contexto, el modelo puede mantener conversaciones multi-turno que incluyan historial extenso, documentacion de producto y transcripciones de audio del cliente en una misma sesion, sin truncar informacion relevante.
- Analisis de documentos con imagenes incrustadas: al aceptar imagen y texto de forma nativa y sin encoder separado, resulta adecuado para extraer y razonar sobre tablas, graficos o capturas dentro de informes largos en un unico pase.
- Transcripcion y analisis de reuniones: la entrada de audio integrada permite procesar la grabacion y generar resumenes, tareas y decisiones con el mismo modelo que despues redacta el acta, simplificando el pipeline.
- Agentes autonomos con herramientas: el function calling nativo y el soporte del rol `system` permiten construir agentes que consulten APIs, ejecuten busquedas y encadenen varios pasos de razonamiento con estado controlado.
- Asistencia de codigo en el IDE: el modelo puede integrarse en herramientas de desarrollo para explicar fragmentos, generar tests o proponer refactorizaciones, con la ventaja de poder ejecutarse en local si se cuantiza.
- Despliegue en el puesto de trabajo sin conexion: al caber en GPUs de consumo en cuantizacion de 4 u 8 bits, es util para entornos con requisitos de privacidad donde los datos no pueden salir de la maquina.
- Moderacion y clasificacion de contenido multimodal: la combinacion de texto, imagen y audio en un unico modelo permite clasificar publicaciones con material mixto sin encadenar varios modelos especializados.
- Procesamiento de audio en tiempo casi real: al evitar el paso por un encoder de audio independiente, la latencia de extremo a extremo es menor, lo que favorece interfaces de voz interactivas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del modelo base menciona mejoras notables en benchmarks de codigo y capacidades agénticas respecto a generaciones anteriores de Gemma, pero no incluye cifras concretas (MMLU, HumanEval, GSM8K u otros) para el 12B Unified. El repositorio de este fine-tune tampoco aporta evaluaciones propias.

## Requisitos de hardware

- VRAM estimada para inferencia en 16 bits: aproximadamente 24 GB solo para los pesos, mas el coste del KV cache y el overhead del runtime; en la practica se recomienda partir de 32 GB de VRAM. Estas cifras son una estimacion derivada del numero de parametros (11,95B) y del tamano del repositorio (24,0 GB), no un dato publicado.
- VRAM estimada en 8 bits: del orden de 12 GB para los pesos, con margen para cache y overhead hasta unos 16 GB.
- VRAM estimada en 4 bits: del orden de 7 GB para los pesos, lo que permite ejecucion en GPUs de consumo de 8 a 12 GB con contexto moderado.
- GPU recomendadas: A100 (40 o 80 GB) y H100 (80 GB) para 16 bits con contexto largo; L40S, RTX 6000 Ada o RTX 5090 para 16 bits con contexto moderado.
- Cabe en GPU de consumo: si, en cuantizaciones de 8 y 4 bits en tarjetas con 16 GB o mas (RTX 4080, 4090, 5070 Ti, 5080, 5090). En 16 bits los pesos ocupan casi por completo los 24 GB de una RTX 4090, por lo que en esa configuracion el contexto util queda muy limitado.
- Contexto largo: a 256K tokens el KV cache puede crecer de forma significativa en 16 bits. La atencion con sliding window de 1024 tokens y las Keys/Values unificadas de las capas globales reducen ese coste, pero no se publican cifras de memoria por token ni de rendimiento.
- Opciones de despliegue: `transformers` (formato nativo del repositorio), vLLM y TGI para servicio en servidor, llama.cpp u Ollama previa conversion a GGUF. No se distribuyen ficheros GGUF ni cuantizaciones listas para usar en la informacion disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros totales | Contexto | Modalidades | Encoders dedicados | Licencia |
|---|---|---|---|---|---|
| Gemma 4 12B Unified (base de este fine-tune) | 11,95B | 256K tokens | Texto, imagen, audio | No | Apache 2.0 / terminos de Gemma 4 |
| Gemma 4 E4B | 4,5B efectivos (8B con embeddings) | 128K tokens | Texto, imagen, audio | Si (~150M vision, ~300M audio) | Apache 2.0 / terminos de Gemma 4 |
| Gemma 4 31B Dense | 30,7B | 256K tokens | Texto, imagen | Si (~550M vision) | Apache 2.0 / terminos de Gemma 4 |
| Gemma 4 26B A4B MoE | No disponible en la informacion proporcionada | No disponible en la informacion proporcionada | No disponible en la informacion proporcionada | No disponible | Apache 2.0 / terminos de Gemma 4 |

La comparacion se limita a la propia familia Gemma 4 porque la informacion disponible no incluye datos verificables de modelos competidores de tamano o tarea equivalente. Destaca que el 12B Unified es la unica variante de la familia con audio y vision integrados sin encoders dedicados, y que el 31B Dense, pese a triplicar los parametros, no soporta audio.

## Limitaciones y advertencias

- Sesgos conocidos: no hay informacion especifica sobre sesgos para este fine-tune; los modelos entrenados con datos web heredan sesgos sociales, culturales y de representacion que deben evaluarse antes de un despliegue real.
- Riesgo de alucinacion: como cualquier LLM generativo, puede producir afirmaciones plausibles pero falsas, especialmente en tareas de razonamiento abierto o ante preguntas sobre hechos poco frecuentes. No se han publicado evaluaciones de fidelidad para este repositorio.
- Trazabilidad del fine-tune: no se documenta el dataset de ajuste, el procedimiento, ni evaluaciones posteriores. El repositorio registra 0 descargas y 0 likes, por lo que no existe validacion de la comunidad sobre su comportamiento real frente al modelo base.
- Ambiguedad de licencia: los metadatos declaran `apache-2.0`, mientras que la model card enlaza los terminos de licencia de Gemma 4, que incluyen restricciones de uso adicionales. Esta discrepancia debe aclararse con el autor antes de cualquier uso comercial.
- Contexto e idioma: aunque la familia declara mas de 140 idiomas, no se especifica el rendimiento por idioma ni si el ajuste de instrucciones ha degradado el soporte multilingue original. En contextos cercanos a 256K tokens el rendimiento puede degradarse y el coste de memoria crece.
- Encoders ausentes: la ausencia de encoders dedicados es una ventaja de despliegue, pero no garantiza que la calidad de comprension de imagen y audio iguale a la de variantes con encoder especializado; no se aportan datos comparativos al respecto.
- Salida limitada a texto: no genera imagen ni audio, a pesar de que el pipeline declarado sea `any-to-any`.
- Cuantizacion no validada: no se publican ficheros cuantizados ni pruebas de degradacion, por lo que cualquier cuantizacion propia debe evaluarse antes de ir a produccion.
- Fecha de publicacion: los metadatos indican septiembre de 2026; conviene verificar que no se trata de un repositorio de prueba o de un duplicado no oficial.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/eyes-dot-ml/gemma-4-12B-it
- Modelo base: https://huggingface.co/google/gemma-4-12B
- Coleccion Gemma 4 en HuggingFace: https://huggingface.co/collections/google/gemma-4
- Repositorio GitHub de Google Gemma: https://github.com/google-gemma
- Blog de lanzamiento: https://blog.google/innovation-and-ai/technology/developers-tools/introducing-gemma-4-12B/
- Documentacion de Gemma: https://ai.google.dev/gemma/docs/core
- Informe tecnico (arXiv 2607.02770, referido a la familia): https://arxiv.org/abs/2607.02770
- Licencia enlazada en la model card: https://ai.google.dev/gemma/docs/gemma_4_license
- Pagina de modelos Gemma de Google DeepMind: https://deepmind.google/models/gemma/

Nota: la busqueda web realizada no ha devuelto resultados relevantes sobre este modelo; los resultados obtenidos corresponden a temas ajenos (optica y anatomia del ojo) y no se han utilizado como fuente.
