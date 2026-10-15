# danyalmalik/DeepSeek-R1-Distill-Qwen-7B-ONNX-WebGPU

## Resumen

DeepSeek-R1-Distill-Qwen-7B-ONNX-WebGPU es una conversion del modelo DeepSeek-R1-Distill-Qwen-7B a formato ONNX, preparada especificamente para ejecutarse dentro de un navegador web mediante el backend WebGPU de ONNX Runtime Web. La publica el usuario danyalmalik y su proposito no es reentrenar ni afinar el modelo, sino redistribuirlo en un formato y una cuantizacion que permitan inferencia local en el cliente, sin servidor y sin instalar dependencias nativas. El repositorio ocupa 5,2 GB e incluye los pesos ONNX, el tokenizador y la plantilla de chat.

El modelo base es un destilado de razonamiento de DeepSeek: se ha entrenado a partir de trazas generadas por DeepSeek-R1 sobre una base Qwen2.5, de modo que hereda el comportamiento de cadena de pensamiento larga (thinking) caracteristico de la familia R1, pero con un tamano de aproximadamente 7.000 millones de parametros segun su denominacion. Esta conversion concreta aplica cuantizacion int4 (k-quant, bloque de 32) a los pesos de las capas lineales y mantiene el resto en float16, incluidos el cache KV y las activaciones.

Su relevancia actual es practica: permite desplegar un modelo de razonamiento de 7B directamente en el navegador del usuario mediante ONNX Runtime GenAI y WebGPU, lo que abre la puerta a aplicaciones web con inferencia 100% local, sin coste de GPU en servidor y sin enviar datos a terceros. La contrapartida es que la cuantizacion altera ligeramente las salidas respecto al modelo original y que el rendimiento depende por completo del soporte de WebGPU del navegador y de la GPU del dispositivo.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only heredada del modelo base Qwen2.5; artefacto redistribuido en formato ONNX. Detalle de capas no disponible en la informacion proporcionada |
| Parametros totales | No disponible con precision; aproximadamente 7B segun la denominacion del modelo base |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible; la model card del repositorio no documenta la ventana de contexto efectiva de esta conversion |
| Tipos de cuantizacion | Pesos de capas lineales en int4 (k-quant, block size 32); resto de pesos, activaciones y cache KV en float16 |
| Idiomas soportados | No disponible |
| Licencia | MIT para este repositorio; el modelo base conserva sus propias licencias, incluidas en el repo (LICENSE y LICENSE-Qwen2.5; Qwen2.5 se distribuye bajo Apache 2.0) |
| Formato de pesos | ONNX (model.onnx y model.onnx.data), ejecutable con ONNX Runtime GenAI; incluye tokenizer.json, tokenizer_config.json, chat_template.jinja y genai_config.json |

## Arquitectura y entrenamiento

El artefacto es una conversion, no un entrenamiento nuevo. Segun la model card, los pesos se convirtieron a ONNX con el model builder de ONNX Runtime GenAI usando los parametros `-p int4 -e webgpu`. Las capas lineales se cuantizaron a 4 bits con esquema k-quant y tamano de bloque 32, mientras que el resto de los tensores, las activaciones y el cache KV se mantienen en float16. El autor advierte explicitamente de que se trata de ficheros modificados cuyas salidas son cercanas, pero no identicas, a las del modelo original.

No se documenta en la informacion proporcionada el proceso de entrenamiento del modelo base (numero de tokens, composicion del dataset, uso de RLHF o DPO) ni innovaciones de atencion o decodificacion especulativa en esta conversion. Lo unico verificable tecnicamente en el repositorio es la cadena de conversion y cuantizacion descrita, junto con los ficheros de configuracion de ONNX Runtime GenAI y la plantilla de chat.

## Capacidades

- Generacion de texto y razonamiento en cadena larga: al derivar de DeepSeek-R1-Distill, el modelo esta orientado a producir trazas de pensamiento extensas antes de dar la respuesta final.
- Razonamiento matematico y resolucion de problemas, herencia directa del destilado de DeepSeek-R1.
- Generacion de codigo, previsiblemente en linea con el modelo base, aunque la informacion proporcionada no incluye evaluaciones que lo confirmen para esta conversion.
- Ejecucion en navegador con WebGPU: inferencia local en el cliente mediante ONNX Runtime Web, sin backend adicional.
- Compatibilidad con el ecosistema ONNX Runtime GenAI, lo que incluye gestion de cache KV y uso de la plantilla de chat incluida en el repositorio.
- Tool calling / function calling: no disponible en la informacion proporcionada.
- Capacidades multimodales (vision, audio): no disponibles; el modelo base es exclusivamente de texto.
- Capacidades multilingues: no disponibles en la informacion proporcionada.
- Modo thinking explicito y modo agente multi-paso: no documentados para esta conversion, aunque el modelo base emplea el formato de razonamiento de la familia R1.

## Casos de uso

- Aplicaciones web de razonamiento sin servidor: al ejecutarse en ONNX Runtime Web con WebGPU, el modelo puede integrarse en una pagina que realice inferencia local en el navegador del usuario, eliminando costes de GPU en la nube para volumenes moderados de trafico.
- Asistentes con privacidad por diseno: en escenarios con datos sensibles (borradores legales, notas clinicas de baja criticidad, informacion financiera personal), la inferencia ocurre en el dispositivo y los prompts no salen del equipo.
- Demostraciones y pruebas de concepto de modelos R1: permite mostrar el comportamiento de razonamiento largo de DeepSeek-R1 sin exigir al usuario instalar Python, CUDA ni descargar pesos en safetensors.
- Herramientas educativas interactivas: un sitio docente puede ofrecer un tutor de matematicas o de programacion que funcione sin conexion tras la carga inicial, con la ventana de contexto que permita el dispositivo.
- Extensiones y aplicaciones de escritorio basadas en web: navegadores Electron, PWAs y paneles internos pueden embeber el modelo para funciones de resumen, reformulacion o explicacion de codigo.
- Prototipado rapido de producto: equipos que quieran validar una idea de producto con un modelo de razonamiento de 7B antes de invertir en infraestructura de servidor pueden usar este artefacto como paso intermedio.
- Procesamiento por lotes de baja criticidad en cliente: tareas como clasificacion de textos largos, extraccion de entidades o generacion de borradores que no requieren la maxima calidad del modelo sin cuantizar.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

La model card de esta conversion no incluye ninguna evaluacion (MMLU, HumanEval, GSM8K, MATH-500 ni similares) y la busqueda web realizada no devolvio ningun resultado relevante: unicamente paginas de redes sociales sin relacion con el modelo. Dado que se trata de pesos cuantizados a int4, cualquier cifra del modelo base en precision completa no seria directamente trasladable a este artefacto.

## Requisitos de hardware

- VRAM estimada para inferencia: con pesos de capas lineales en int4 y el resto en float16, el consumo se situa en el entorno de los 4-5 GB para pesos y cache KV en contextos moderados. Es una estimacion derivada del tamano del repositorio (5,2 GB) y del esquema de cuantizacion, no un dato publicado.
- GPU recomendadas: cualquier GPU de escritorio con soporte WebGPU y al menos 6-8 GB de memoria dedicada; en el ecosistema de servidor, alternativas como A100, H100 o L40S solo aplican si se abandona esta conversion y se usa el modelo base en ONNX Runtime o vLLM.
- Compatibilidad con GPU de consumo: si, en principio cabe en tarjetas de gama media-alta recientes (serie RTX 30/40 con 8 GB o mas). En GPUs integradas el rendimiento sera considerablemente menor y puede no caber en memoria compartida.
- Limitaciones del navegador: la ejecucion depende de WebGPU, disponible en navegadores basados en Chromium en Windows (D3D12), macOS (Metal) y Linux (Vulkan). Los limites de tamano de buffer y de memoria impuestos por la implementacion de WebGPU pueden impedir la carga en dispositivos con poca memoria.
- Opciones de despliegue: ONNX Runtime GenAI (escritorio y servidor) y ONNX Runtime Web con backend WebGPU para navegador; herramientas como vLLM, llama.cpp, Ollama o TGI no consumen directamente este formato y requeririan otra conversion.
- Latencia y throughput: no disponibles. No se publican mediciones de tokens por segundo ni tiempos de primera token para esta conversion.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato y cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| DeepSeek-R1-Distill-Qwen-7B-ONNX-WebGPU (este) | No disponible con precision (aproximadamente 7B) | No disponible | ONNX, int4 + float16 | MIT (repo); base con licencias propias | HuggingFace, 5,2 GB, 0 descargas |
| deepseek-ai/DeepSeek-R1-Distill-Qwen-7B (original) | No disponible en la informacion proporcionada | No disponible | Safetensors en precision completa | No disponible en la informacion proporcionada | HuggingFace, offsets oficiales |
| DeepSeek-R1-Distill-Llama-8B | No disponible en la informacion proporcionada | No disponible | Safetensors | No disponible en la informacion proporcionada | HuggingFace |
| Qwen2.5-7B-Instruct | No disponible en la informacion proporcionada | No disponible | Safetensors | Apache 2.0 (citada en los ficheros de licencia de este repo) | HuggingFace |

La comparativa se limita a lo verificable: el unico rasgo diferencial confirmado de este artefacto frente a los demas es su formato ONNX cuantizado a int4 y su orientacion a WebGPU en navegador. No se dispone de datos de rendimiento comparado.

## Limitaciones y advertencias

- Salidas no identicas al modelo original: el propio autor advierte de que la cuantizacion int4 modifica los resultados. No debe usarse como sustituto exacto del modelo en precision completa en tareas de evaluacion estricta.
- Ausencia total de benchmarks: no hay ninguna medicion publicada de calidad, latencia o throughput para esta conversion.
- Soporte de WebGPU variable: la ejecucion depende de la version del navegador, del sistema operativo y del driver de la GPU. Los limites de memoria de WebGPU pueden provocar fallos de carga en equipos modestos.
- Riesgo de alucinacion: inherente a los modelos de la familia R1, especialmente en tareas factuales y en generacion de codigo con dependencias externas. La cuantizacion puede agravarlo.
- Idiomas y contexto no documentados: no se especifica que idiomas estan soportados ni cual es la ventana de contexto efectiva tras la conversion, lo que dificulta planificar despliegues con prompts largos.
- Cadena de licencias: aunque el repositorio se declara MIT, el modelo base arrastra las condiciones de DeepSeek y de Qwen2.5 (Apache 2.0). Conviene revisar LICENSE y LICENSE-Qwen2.5 antes de un uso comercial.
- Adopcion nula y mantenimiento incierto: 0 descargas y 0 likes en el momento de la consulta, con fechas de creacion y actualizacion muy proximas entre si (unos 8 minutos), lo que sugiere un artefacto experimental sin validacion por parte de la comunidad.
- Sin garantias de reproducibilidad: no se documenta la version exacta de ONNX Runtime GenAI ni los comandos completos de conversion, mas alla de `-p int4 -e webgpu`.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/danyalmalik/DeepSeek-R1-Distill-Qwen-7B-ONNX-WebGPU
- Modelo base: https://huggingface.co/deepseek-ai/DeepSeek-R1-Distill-Qwen-7B
- ONNX Runtime GenAI: no se incluye URL en la informacion proporcionada
- ONNX Runtime Web y backend WebGPU: no se incluye URL en la informacion proporcionada
- Quick Inference (proyecto mencionado en la model card): no se incluye URL en la informacion proporcionada
- Resultados de la busqueda web: no se encontro ningun enlace relevante; los unicos resultados devueltos fueron paginas de redes sociales sin relacion con el modelo
