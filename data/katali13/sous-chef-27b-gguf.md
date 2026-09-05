# katali13/Sous-Chef-27B-GGUF

## Resumen

Sous-Chef 27B es un modelo de lenguaje ajustado a partir de una base de pesos abiertos de 27.320 millones de parámetros, desarrollado por Ancil Chandler para el proyecto Bakery, una plataforma de agentes de seguridad y reverse engineering para VS Code. El modelo está pensado para trabajar de forma autónoma en tareas de análisis de código, búsqueda de vulnerabilidades, análisis estático y dinámico, y para dirigir herramientas como Ghidra mediante llamadas a funciones.

Se distribuye exclusivamente en formato GGUF, con cuantizaciones que van desde 5.9 GB hasta 29.0 GB, e incluye un proyector multimodal para imágenes y una cabeza de decodificación especulativa (MTP). El checkpoint parte de una base "abliterada", lo que significa que no conserva el comportamiento de rechazo del modelo instruct original, y está diseñado para intentar prácticamente cualquier petición. Su licencia es Apache-2.0 y soporta los idiomas inglés y chino. No se han publicado datos sobre la longitud de contexto ni sobre la arquitectura subyacente en la información disponible.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parametros totales | 27.320.697.856 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q4_K_M, Q8_0, MTP (cabeza de decodificacion especulativa), F16 (mmproj para vision) |
| Idiomas soportados | ingles, chino |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (safetensors como referencia de parametros) |

## Arquitectura y entrenamiento

El modelo es un ajuste fino de una base de pesos abiertos de 27B parametros bajo licencia Apache-2.0. No se especifica en la informacion disponible la arquitectura concreta, pero por el uso de un `mmproj` se infiere que es un transformer multimodal con capacidad de procesamiento de imagenes. Tampoco se detallan los datos de entrenamiento, el numero de tokens, ni si se emplearon tecnicas como RLHF o DPO.

La innovacion mas destacable es la inclusion de una cabeza de decodificacion especulativa empaquetada como `Sous-Chef-27B-MTP.gguf`, que acelera la inferencia al predecir multiples tokens a la vez. Ademas, el checkpoint se deriva de una base "abliterada", es decir, que se ha eliminado el comportamiento de rechazo del modelo instruct original, lo que lo hace especialmente adecuado para tareas de seguridad que requieren analizar binarios, exploits o codigo potencialmente hostil sin que el modelo se niegue a responder.

## Capacidades

- Generacion de texto conversacional en ingles y chino.
- Analisis de codigo desconocido: puede leer y razonar sobre repositorios completos para identificar patrones de vulnerabilidad.
- Analisis estatico de seguridad: busca fallos en codigo fuente sin necesidad de ejecutarlo.
- Reverse engineering de binarios: integra con Ghidra para descompilar, interpretar funciones y reconstruir logica de programas.
- Analisis dinamico en entorno sandbox: puede guiar la ejecucion controlada de binarios y observar su comportamiento.
- Ejecucion autonoma de multiples pasos de tool calling, lo que permite agentes que encadenan varias herramientas a lo largo de una tarea.
- Vision por computadora: gracias al `mmproj`, puede procesar imagenes y capturas de pantalla si se pasa con `--mmproj`.
- Decodificacion especulativa: el archivo MTP actua como modelo borrador para acelerar la generacion.
- Sin rechazo de instrucciones: al estar abliterado, intenta casi cualquier peticion sin las negativas habituales de los modelos instruct.

## Casos de uso

- Auditoria de seguridad de codigo: el modelo puede analizar un repositorio grande, identificar funciones peligrosas (por ejemplo, `strcpy`, `system`) y explicar como podrian explotarse. Es adecuado porque su entrenamiento en seguridad y su tolerancia a contenido ofensivo le permiten entrar en detalle sin rechazar la tarea.

- Reverse engineering de binarios en entornos de respuesta a incidentes: un investigador puede cargar un binario en Ghidra y pedir a Sous Chef que identifique estructuras de datos, puntos de entrada y algoritmos de ofuscacion. El modelo puede encadenar llamadas a Ghidra mediante tool calling.

- Analisis automatizado de malware en sandbox: el modelo puede escribir scripts para ejecutar una muestra en un entorno aislado, analizar las llamadas al sistema y resumir el comportamiento. Su capacidad de razonamiento multi-paso permite construir pipelines completos de analisis.

- Asistente en el IDE VS Code: dentro del proyecto Bakery, actua como el motor local que responde preguntas sobre el codigo abierto, sugiere parches y genera explicaciones de vulnerabilidades mientras el desarrollador trabaja.

- Generacion de informes tecnicos de seguridad: a partir de los hallazgos de un analisis, el modelo puede redactar un informe en ingles o chino, con secciones de impacto, reproduccion y mitigacion. Es util para documentar vulnerabilidades en entornos corporativos.

- Analisis de capturas de pantalla y diagramas: usando el `mmproj`, puede leer capturas de interfaz, diagramas de arquitectura o imagenes de desensambladores, y explicar lo que ve en el contexto de un analisis de seguridad.

- Automatizacion de tareas con function calling: el modelo puede integrarse en pipelines de CI/CD para ejecutar scanners, consultar bases de datos de vulnerabilidades o interactuar con APIs internas, gracias a su soporte de llamadas a funciones.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: la cuantizacion Q4_K_M pesa 16.8 GB, por lo que cabe en una GPU con 24 GB de VRAM (con margen para cache KV en contextos moderados). El archivo Q8_0 pesa 29.0 GB y requiere una GPU con 40 GB o mas, o varias GPUs en paralelo. El archivo MTP (5.9 GB) y el `mmproj` (0.9 GB) son auxiliares.

- GPU recomendadas: RTX 3090 o RTX 4090 (24 GB) para Q4_K_M; A100 80GB o H100 para Q8_0. Tambien puede ejecutarse en CPU con llama.cpp, aunque con menor velocidad.

- Compatibilidad con GPUs de consumo: si, la version Q4_K_M es viable en una RTX 3090/4090. La Q8_0 no cabe en una GPU de consumo estandar.

- Opciones de despliegue: al estar en formato GGUF, es compatible con llama.cpp, Ollama y otros runtime que soporten GGUF. El modelo esta marcado como `endpoints_compatible`, lo que sugiere que puede servirse mediante una API compatible con OpenAI, aunque no se especifica el framework concreto.

- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

No se dispone de informacion suficiente para realizar una comparativa fiable con otros modelos de la misma categoria. Aunque existen otros modelos GGUF de 27B parametros, no se han publicado datos de rendimiento ni benchmarks especificos de Sous Chef 27B que permitan comparar de forma objetiva.

## Limitaciones y advertencias

- Modelo abliterado: al no conservar el comportamiento de rechazo, puede generar contenido peligroso, ilegal o eticamente cuestionable si se usa de forma inadecuada. Es recomendable mantenerlo detras de los controles que exija el contexto de uso.

- Ausencia de benchmarks: no hay evaluaciones publicadas que validen su precision en tareas de seguridad o su rendimiento frente a otros modelos. Cualquier uso en produccion debe ir acompanado de validacion propia.

- Idiomas limitados: solo se han confirmado ingles y chino. La calidad en otros idiomas no esta garantizada.

- Longitud de contexto no especificada: la ventana de contexto real se desconoce, lo que puede limitar tareas de analisis de codigo muy extensas.

- Riesgo de alucinacion: como cualquier modelo de lenguaje, puede generar analisis incorrectos o inventar funciones inexistentes en un binario. En seguridad, estos errores pueden tener consecuencias graves; siempre se deben contrastar los resultados con herramientas reales.

- Licencia y atribucion: aunque el modelo es Apache-2.0, los pesos han sido modificados desde la base original. La licencia exige mantener la atribucion y el aviso de cambios. Ademas, Apache-2.0 no otorga derechos de marca, por lo que no existe afiliacion con el proveedor del modelo base.

- Sin comunidad ni pruebas de produccion: el repositorio tiene 0 descargas y 1 like, lo que indica que no ha sido probado por la comunidad. Puede contener errores o problemas de integracion no detectados.

## Enlaces

- HuggingFace: https://huggingface.co/katali13/Sous-Chef-27B-GGUF
- No se han encontrado enlaces adicionales (paper, blog, repositorio del proyecto Bakery) en la busqueda web.
