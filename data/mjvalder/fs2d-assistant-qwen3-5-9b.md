# mjvalder/fs2d-assistant-qwen3.5-9b

## Resumen

fs2d-assistant:qwen3.5-9b es un ajuste fino (fine-tune) del modelo Qwen/Qwen3.5-9B, desarrollado por mjvalder, concebido como el asistente integrado en la interfaz grafica (GUI) de FrictionSim2D. Esta aplicacion configura simulaciones de friccion con LAMMPS sobre materiales bidimensionales, de modo que el modelo no es un chatbot de proposito general, sino un componente especializado que traduce peticiones en lenguaje natural en llamadas a las herramientas de la propia GUI.

El modelo resuelve un problema acotado pero exigente: interpretar solicitudes de configuracion de simulaciones (montajes AFM, ensayos hoja-sobre-hoja, barridos de parametros), localizar estructuras y potenciales, consultar bases de datos de materiales y resumir o representar resultados. Para ello se apoya en tool calling estricto y en un principio de seguridad por diseno: nunca escribe ficheros ni lanza trabajos por si mismo, y toda modificacion propuesta queda a la espera de confirmacion del usuario.

Tecnicamente, se trata de un transformer denso de 9.197.093.888 parametros (aproximadamente 9B), derivado del modelo base Qwen3.5-9B mediante QLoRA, con licencia Apache-2.0 y distribucion en formato GGUF Q4_K_M (5,8 GB) pensada para Ollama. Su relevancia actual radica en que demuestra como un ajuste fino pequeno y muy dirigido, entrenado sobre conversaciones sinteticas generadas con las herramientas reales, puede superar de forma notable al modelo base en una tarea vertical concreta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (derivado de Qwen/Qwen3.5-9B; detalles de attention y capas del modelo base no disponibles) |
| Parametros totales | 9.197.093.888 (aproximadamente 9B) |
| Parametros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | 16k tokens (segun el Modelfile de Ollama) |
| Tipos de cuantizacion | Q4_K_M (unico peso publicado; 5,8 GB) |
| Idiomas soportados | en (ingles) |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (model.gguf), acompanado de Modelfile y manifest.json |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3.5-9B, un transformer denso de unos 9B parametros, y se ajusta mediante LoRA de rango 16 y alpha 32 sobre pesos cuantizados a 4 bits (QLoRA), con una tasa de aprendizaje de 2e-4, una epoca y la libreria Unsloth. El conjunto de entrenamiento lo componen 7524 conversaciones sinteticas (version de datos p10-k, que incluye 563 peticiones compuestas), generadas ejecutando las herramientas reales de la GUI de FrictionSim2D. Las peticiones de usuario y las respuestas finales fueron redactadas por Qwen3-14B (Apache-2.0). Aproximadamente una de cada nueve conversaciones contiene una llamada a herramienta invalida seguida del error devuelto por la herramienta y de la llamada corregida, aunque la funcion de perdida cubre unicamente los turnos del asistente y nunca las llamadas invalidas. Se eliminaron las peticiones parecidas al conjunto de evaluacion para evitar contaminacion.

Una innovacion destacable es la fidelidad al entorno de ejecucion: el modelo se entreno con el mismo system prompt que envia la aplicacion (reglas mas un texto de referencia) y con la lista de herramientas renderizada tal como la presenta Ollama. Por eso la model card advierte de que debe usarse el Modelfile proporcionado y no `ollama pull hf.co/...`, que construiria la plantilla de chat a partir del GGUF y no coincidiria con el formato de entrenamiento. El modo thinking esta desactivado durante el entrenamiento y el Modelfile fija temperatura 0.

## Capacidades

- Generacion de texto conversacional orientada a la configuracion de simulaciones de friccion de materiales 2D.
- Tool calling estricto sobre el esquema de herramientas de FrictionSim2D: montajes AFM y hoja-sobre-hoja, barridos de parametros, busqueda de estructuras y potenciales, consulta de bases de datos de materiales, resumen y representacion grafica de resultados.
- Recuperacion ante errores de herramienta: el modelo ha visto ejemplos de llamada invalida, mensaje de error y llamada corregida.
- Razonamiento multi-paso dentro de una misma peticion: por ejemplo, una llamada de configuracion seguida de `set_fields` para completar ajustes.
- Capacidad de solicitar aclaraciones cuando la peticion es ambigua (el conjunto de evaluacion incluye un grupo especifico de peticiones que deben devolverse al usuario).
- Capacidad de rechazo (declines) ante peticiones fuera de alcance.
- Conocimiento de dominio limitado a ciencia de materiales y tribologia en el contexto de la GUI.
- Multilingue: no disponible; el modelo declara unicamente ingles.
- Vision, audio, thinking mode: no disponibles.

## Casos de uso

- Configuracion asistida de simulaciones AFM: el usuario describe en lenguaje natural el material, la punta y los parametros, y el modelo emite las llamadas de herramienta necesarias para preparar el montaje, dejando cada cambio pendiente de confirmacion.
- Preparacion de ensayos hoja-sobre-hoja: el modelo traduce peticiones como el apilamiento o las condiciones de contacto en la secuencia de llamadas adecuada, apoyandose en el conocimiento de dominio adquirido.
- Barridos de parametros: a partir de una peticion compuesta (por ejemplo, un cribado AFM de 156 materiales con 14 ajustes en un solo mensaje), el modelo planifica la llamada de configuracion inicial y completa los campos restantes con `set_fields`.
- Busqueda de estructuras y potenciales: el asistente consulta las herramientas de busqueda de la GUI para localizar estructuras cristalinas y potenciales interatomicos compatibles con la simulacion solicitada.
- Consulta de bases de datos de materiales: el modelo formula las llamadas de consulta y presenta los resultados dentro de la conversacion, sin acceso directo a ficheros.
- Resumen y visualizacion de resultados: tras una simulacion, el usuario pide un resumen o una grafica y el modelo invoca las herramientas de resumen y ploteo correspondientes.
- Asistencia con salvaguardas en entornos de investigacion: al no escribir ficheros ni lanzar trabajos y requerir confirmacion del usuario, encaja en flujos donde se exige supervision humana de cada accion.

## Benchmarks y rendimiento

Evaluacion del asistente de FrictionSim2D: 74 peticiones guionizadas en diez grupos (configuracion, analisis, conocimiento de dominio, base de datos de materiales, materiales, espacio de trabajo, rechazos, parametros, barridos y peticiones que deben devolverse al usuario), puntuadas automaticamente segun el estado final, tres ejecuciones por peticion, en una NVIDIA RTX A4000.

| Modelo | pass@1 (73 peticiones nucleares) | Todas las ejecuciones | Tiempo mediano por turno |
|---|---|---|---|
| fs2d-assistant:qwen3.5-9b | 95,9 % | 213/222 | 2,2 s |
| Qwen/Qwen3.5-9B original (mismo prompt) | 82,6 % | no disponible | no disponible |

En una peticion larga y multiparte (cribado AFM de 156 materiales con 14 ajustes en un solo mensaje) el modelo completo 13 de los 14 ajustes: llamada de configuracion seguida de `set_fields`, fallando el apilamiento AB. No se han publicado otros resultados de benchmarks (MMLU, HumanEval, GSM8K u otros) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el unico peso publicado es Q4_K_M de 5,8 GB, por lo que se necesita algo mas de 6 GB de VRAM para los pesos, mas la memoria de la cache KV para 16k de contexto y el overhead del runtime.
- GPU recomendadas: la evaluacion se realizo en una NVIDIA RTX A4000 (16 GB). Cualquier GPU con al menos 8 GB de VRAM deberia poder ejecutar el modelo cuantizado a Q4_K_M con contexto reducido.
- Cabe en GPU de consumo: si, en tarjetas como RTX 3060 de 12 GB, RTX 4060 Ti de 16 GB, RTX 4070/4080/4090 y equivalentes, siempre con Q4_K_M.
- Opciones de despliegue: Ollama 0.40.7 o superior mediante el Modelfile proporcionado (metodo recomendado y unico soportado oficialmente por el autor). El repo incluye ademas la etiqueta `endpoints_compatible`. El uso de vLLM, llama.cpp o TGI no esta documentado en la informacion disponible.
- Latencia y throughput: tiempo mediano de 2,2 s por turno en una RTX A4000, medido en la evaluacion del asistente. No se han publicado cifras de throughput en tokens por segundo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento en la tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| fs2d-assistant:qwen3.5-9b | ~9B | 16k (Modelfile) | 95,9 % pass@1 en la evaluacion de FrictionSim2D | Apache-2.0 | GGUF en Hugging Face, despliegue via Ollama |
| Qwen/Qwen3.5-9B (base) | ~9B | no disponible | 82,6 % pass@1 con el mismo prompt | Apache-2.0 | Modelo base publico en Hugging Face |
| Qwen3-14B | ~14B | no disponible | no disponible (usado como generador de datos, no evaluado en la tarea) | Apache-2.0 | Publico en Hugging Face |

La comparacion directa solo es posible frente al modelo base, ya que el autor no publica resultados de otros modelos en la evaluacion del asistente. La ventaja del ajuste fino (13,3 puntos porcentuales de pass@1) se obtiene con el mismo prompt y el mismo entorno, lo que aisla el efecto del entrenamiento especifico.

## Limitaciones y advertencias

- No es un modelo de proposito general: espera el system prompt y las definiciones de herramientas del asistente de FrictionSim2D; fuera de ese contexto su comportamiento no esta garantizado.
- Solo soporta ingles; no se ha entrenado ni evaluado en castellano ni en otros idiomas.
- Unica cuantizacion disponible (Q4_K_M); no se publican pesos en safetensors ni otras precisiones.
- El uso correcto exige el Modelfile proporcionado; construir la plantilla de chat desde el GGUF con `ollama pull hf.co/...` produce un formato distinto al de entrenamiento.
- Riesgo de alucinacion en llamadas a herramientas: aunque el entrenamiento incluye ejemplos de error y correccion, el modelo puede emitir llamadas invalidas o incompletas (en la prueba multiparte fallo el apilamiento AB).
- Sesgos conocidos: no documentados por el autor; al derivarse de datos sinteticos generados por Qwen3-14B, puede heredar sesgos de ese generador y de la distribucion de peticiones del conjunto p10-k.
- Cobertura limitada al dominio de FrictionSim2D, materiales 2D y tribologia; las peticiones fuera de alcance deberian rechazarse o devolverse al usuario, pero ese comportamiento no esta garantizado en todos los casos.
- Restricciones de licencia: Apache-2.0 permite uso comercial, pero se recomienda verificar las condiciones del modelo base Qwen3.5-9B y citar adecuadamente.
- Adopcion practicamente nula en el momento de la ficha (0 descargas, 0 likes), sin validacion externa independiente de los resultados del autor.
- El modelo nunca escribe ficheros ni ejecuta trabajos por si mismo; cualquier integracion debe mantener la confirmacion humana de los cambios propuestos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/mjvalder/fs2d-assistant-qwen3.5-9b
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B
- Repositorio de FrictionSim2D: https://github.com/mjvalder/FrictionSim2D
