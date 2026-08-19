# exalandru/Mistral-Small-4-119B-2603-Mixed-3bit-MLX

## Resumen

Mistral Small 4 119B 2603 es un modelo de lenguaje multimodal desarrollado por Mistral AI, presentado en marzo de 2026. Se trata de un modelo híbrido que unifica capacidades de instrucción, razonamiento y generación de código en una única arquitectura, con soporte para entrada de imágenes y una ventana de contexto de 256 000 tokens. Su diseño tipo Mixture of Experts (MoE) con 119 000 millones de parámetros totales y solo 6 500 millones activos por token permite un equilibrio entre capacidad y eficiencia computacional.

La versión aquí descrita es una cuantización mixta de aproximadamente 3 bits por peso, realizada con la librería mlx-vlm 0.6.13 por el usuario exalandru. Está optimizada para ejecutarse en hardware Apple Silicon mediante MLX, reduciendo el tamaño del modelo a 48,3 GB. Esto facilita su despliegue local en estaciones de trabajo Mac con memoria unificada suficiente, manteniendo la mayoría de las capacidades del modelo original.

La relevancia de esta cuantización radica en que permite ejecutar un modelo de 119B en equipos de consumo profesional sin necesidad de GPUs dedicadas de gran VRAM, democratizando el acceso a modelos de alta capacidad para desarrolladores e investigadores que trabajan con ecosistemas Apple.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture of Experts (MoE) hibrida con atencion por ventana deslizante y atencion global, multimodal (vision y texto) |
| Parametros totales | 119 000 millones (modelo base); la cuantizacion reduce el peso a ~3 bits por parametro |
| Parametros activos | 6 500 millones |
| Longitud de contexto | 256 000 tokens |
| Tipos de cuantizacion | Mixta de ~3 bits (3bpw), generada con mlx-vlm 0.6.13 |
| Idiomas soportados | Aleman, arabe, bengali, chino, coreano, espanol, frances, hindi, ingles, italiano, japones, nepalies, persa, polaco, portugues, rumano, ruso, serbio, sueco, turco, ucraniano, vietnamita y otros |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (MLX) |

## Arquitectura y entrenamiento

El modelo base Mistral-Small-4-119B-2603 emplea una arquitectura MoE hibrida que combina capas de atencion con ventana deslizante y capas de atencion global, junto con un conjunto de expertos activados de forma selectiva. Esta configuracion permite manejar secuencias largas (hasta 256 000 tokens) con un coste computacional reducido, ya que solo se activan 6 500 millones de parametros por token. El modelo integra un codificador de vision que procesa imagenes y las proyecta en el espacio de representacion textual, lo que le permite responder a consultas multimodales.

El entrenamiento del modelo base incluyo una fase de preentrenamiento con datos textuales y multimodales, seguida de ajuste fino supervisado y alineacion mediante tecnicas de aprendizaje por refuerzo (RLHF) para mejorar la calidad de las respuestas y el comportamiento de agente. La cuantizacion aqui presentada no anade entrenamiento adicional; es una conversion posterior al entrenamiento que reduce la precision numerica de los pesos para disminuir el uso de memoria, manteniendo un equilibrio entre fidelidad y eficiencia.

## Capacidades

- Generacion de texto y completado de secuencias largas, con ventana de contexto de 256 000 tokens.
- Razonamiento paso a paso y modo de pensamiento (reasoning mode) para problemas complejos de logica y matematica.
- Generacion y revision de codigo en multiples lenguajes de programacion, incluyendo soporte para tool calling y uso de funciones externas.
- Comprension de imagenes: puede leer y analizar fotografias, diagramas, capturas de pantalla y documentos escaneados, respondiendo preguntas sobre su contenido.
- Soporte de tool calling y function calling, integrable en pipelines de agentes y automatizaciones.
- Capacidades multilingues en mas de 20 idiomas, con respuesta en el idioma del usuario.
- No puede generar imagenes ni procesar audio o video.

## Casos de uso

- Asistente de programacion local: un desarrollador puede ejecutar el modelo en su Mac para obtener sugerencias de codigo, explicaciones y refactorizaciones sin enviar datos a la nube, gracias a su soporte de tool calling y su ventana de contexto amplia para archivos de proyecto completos.
- Analisis de documentos tecnicos con imagenes: el modelo puede leer manuales, diagramas de arquitectura o capturas de pantalla de errores, y proporcionar explicaciones o soluciones, util en soporte tecnico y documentacion.
- Chatbot de atencion al cliente multilingue: con su capacidad de mantener conversaciones de hasta 256 000 tokens y responder en el idioma del usuario, puede gestionar incidencias complejas con historial largo y adjuntos visuales.
- Extraccion de informacion de imagenes medicas o cientificas: aunque no es un modelo especializado, puede describir radiografias, graficos de laboratorio o figuras de articulos, ayudando a investigadores a preprocesar datos.
- Generacion de informes y resumenes de largos documentos: su contexto extendido permite resumir libros, expedientes o transcripciones completas en una sola pasada.
- Prototipado rapido de agentes con razonamiento: al combinar tool calling, modo de razonamiento y ejecucion local, es adecuado para experimentar con agentes autonomos que necesitan planificar multiples pasos y consultar APIs.
- Educacion y formacion: puede actuar como tutor interactivo que explica conceptos, resuelve problemas paso a paso y adapta sus respuestas al nivel del estudiante, todo en local sin conexion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks especificos para esta cuantizacion de 3 bits. El modelo base Mistral-Small-4-119B-2603 ha sido evaluado por Mistral AI en tareas como MMLU, HumanEval y GSM8K, pero esos datos corresponden a la version sin cuantizar y no son directamente extrapolables a esta conversion. Para obtener metricas fiables, se recomienda ejecutar las pruebas estandar sobre la cuantizacion en el hardware objetivo.

## Requisitos de hardware

- Dispositivos compatibles: Mac con chip Apple Silicon (M1, M2, M3, M4 o posteriores) y memoria unificada suficiente.
- Memoria RAM unificada estimada: al menos 64 GB para cargar los 48,3 GB de pesos, dejando margen para el contexto y la activacion de capas. Con 96 GB o 128 GB se obtiene mayor comodidad y rendimiento.
- GPU integrada: la ejecucion se apoya en la GPU integrada del chip Apple Silicon, no requiere GPU discreta.
- Opciones de despliegue: mediante la libreria mlx-vlm (comando `mlx_vlm.generate`) o a traves de oMLX, una interfaz grafica para modelos MLX.
- Rendimiento: no se dispone de datos de latencia o throughput publicados para esta cuantizacion. En general, los modelos MLX en Apple Silicon ofrecen velocidades de generacion de decenas de tokens por segundo en equipos de gama alta, aunque dependen del chip y de la longitud del contexto.

## Comparativa con modelos similares

No se dispone de una comparativa directa con otras cuantizaciones o modelos similares en la informacion proporcionada. El mismo autor publica una version de 4 bits de este modelo (exalandru/Mistral-Small-4-119B-2603-Mixed4bit-MLX), que ofrece mayor fidelidad a cambio de un mayor uso de memoria. Alternativas de otros fabricantes con tamano y capacidades comparables, como Qwen2.5-72B o Llama 3.1 70B, no han sido contrastadas en esta ficha por falta de datos.

## Limitaciones y advertencias

- La cuantizacion de ~3 bits puede degradar la calidad de las respuestas en tareas de razonamiento complejo o generacion de codigo fino, en comparacion con la version original.
- El modelo base tiene una fecha de corte de conocimiento en noviembre de 2024; no dispone de informacion posterior a esa fecha salvo que se le proporcionen herramientas de busqueda.
- Aunque soporta entrada de imagenes, no puede generar imagenes ni procesar audio o video.
- El sistema prompt indica que el modelo no puede realizar busquedas web por si mismo; depende de herramientas externas para obtener informacion actualizada.
- Requiere hardware Apple Silicon con al menos 64 GB de RAM unificada; no es ejecutable en GPUs NVIDIA o AMD mediante CUDA u otros frameworks.
- La licencia Apache 2.0 permite uso comercial sin restricciones, pero el modelo base puede tener condiciones adicionales de uso (consultar la documentacion de Mistral AI).
- En entornos de produccion, se recomienda validar la calidad de la cuantizacion con tareas representativas antes de desplegarla, ya que la degradacion puede ser significativa en ciertos dominios.

## Enlaces

- Repositorio HuggingFace del modelo cuantizado: https://huggingface.co/exalandru/Mistral-Small-4-119B-2603-Mixed-3bit-MLX
- Modelo base en HuggingFace: https://huggingface.co/mistralai/Mistral-Small-4-119B-2603
- Documentacion oficial de Mistral Small 4: https://docs.mistral.ai/models/mistral-small-4-0-26-03
- Anuncio de Mistral AI: https://mistral.ai/news/mistral-small-4/
- Version de 4 bits del mismo autor: https://huggingface.co/exalandru/Mistral-Small-4-119B-2603-Mixed4bit-MLX
- Pagina de NVIDIA NIM para el modelo: https://build.nvidia.com/mistralai/mistral-small-4-119b-2603
