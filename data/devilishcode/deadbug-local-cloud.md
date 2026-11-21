# Devilishcode/deadbug-local-cloud

## Resumen

Deadbug Local Cloud es un repositorio de despliegue, no un modelo de lenguaje entrenado. Se trata de la mitad autoalojada de IMP-VISION, el proyecto de gafas inteligentes de Deadbug Labs: una pila de software que ejecuta `llama-server` de llama.cpp como servicio en una maquina Linux controlada por el usuario, de modo que la app movil actua como cliente ligero (navegador, camara y microfono) y la inferencia ocurre en servidor. El modelo por defecto de esa pila es Qwen2.5-1.5B-Instruct en GGUF con cuantizacion Q4_K_M, bajo licencia Apache-2.0.

El problema que aborda es operativo: en movil, los sistemas operativos terminan procesos en segundo plano y cancelan descargas largas de modelos, lo que rompe la inferencia local sostenida. Local Cloud elimina esa clase de fallos descargando los pesos una sola vez en el servidor y manteniendo el servidor de inferencia como servicio persistente. El repositorio no publica pesos propios ni una arquitectura nueva: agrupa configuracion, scripts de arranque y la seleccion de modelos del proyecto.

La relevancia es acotada pero clara para quien construye prototipos de asistente multimodal con hardware propio: documenta un patron de despliegue reproducible (carpeta unica, script de arranque, tunel HTTPS con acceso restringido) y separa la capa de interfaz de la capa de inferencia. No debe evaluarse como un modelo con benchmarks propios, porque no los tiene.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible como modelo propio; la pila usa llama.cpp `llama-server` con GGUF. El modelo por defecto es Qwen2.5-1.5B-Instruct (transformer decoder-only) |
| Parametros totales | No disponible para el repositorio; 1,5 mil millones en el modelo por defecto (Qwen2.5-1.5B-Instruct) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada para la pila; depende del modelo cargado |
| Tipos de cuantizacion | Q4_K_M como valor por defecto de la pila; el resto depende del GGUF cargado |
| Idiomas soportados | No disponible en la model card del repositorio; los del modelo por defecto dependen de Qwen2.5-1.5B-Instruct |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (servido mediante llama.cpp `llama-server`) |

## Arquitectura y entrenamiento

El repositorio no define una arquitectura de red neuronal ni un proceso de entrenamiento. Es una capa de orquestacion: una app Flask con interfaz orientada a movil, un servidor de inferencia `llama-server` de llama.cpp que carga pesos GGUF, y un conjunto de modelos seleccionables alojado en `Devilishcode/imp-vision-model-sets`. El modelo por defecto es Qwen2.5-1.5B-Instruct, un transformer decoder-only de 1,5 mil millones de parametros ajustado con instrucciones; sus datos de entrenamiento y su pipeline de alineamiento corresponden a la documentacion de Qwen, no a este repositorio.

La innovacion tecnica aqui es de ingenieria de despliegue, no de modelado: inferencia persistente como servicio del sistema, descarga de pesos en el servidor a velocidad de centro de datos, cliente movil sin pesos locales y acceso mediante tunel HTTPS restringido por defecto. La pila se declara agnostica al hardware: funciona en una VM en la nube y se traslada a cualquier maquina Linux copiando una carpeta y ejecutando un script de arranque. Se menciona ademas un "House Brain" en entrenamiento (`Devilishcode/deadbug-brain-qwen2.5-1.5b`), del que no se publican detalles de dataset ni de proceso en la informacion disponible.

## Capacidades

- Generacion de texto y respuesta a instrucciones mediante el modelo por defecto Qwen2.5-1.5B-Instruct.
- Interfaz de "Ask" en la app: consultas en lenguaje natural desde el navegador del movil contra el servidor de inferencia.
- "Senses feed": uso de la camara del propio telefono como entrada visual, con el procesamiento delegado al servidor.
- Entrada de microfono desde el cliente movil (la captura ocurre en el telefono; el tratamiento posterior depende de la pila).
- Seleccion de conjuntos de modelos mediante `imp-vision-model-sets`, lo que permite intercambiar el "cerebro" sin cambiar la app.
- Servicio persistente de inferencia: el servidor no se interrumpe por la gestion de energia del telefono.
- Acceso remoto mediante tunel HTTPS con control de acceso (restringido por defecto).
- Tool calling, function calling, modo thinking, vision nativa, audio y razonamiento multi-paso: no disponible en la informacion proporcionada para esta pila.

## Casos de uso

- Asistente personal autoalojado para gafas o wearables: la app movil abre la direccion del rig y consulta al modelo; la inferencia ocurre en una maquina propia, lo que evita depender de APIs de terceros y mantiene el control de los datos de camara y microfono.
- Prototipado rapido de interfaces de voz y vision: al separar cliente y servidor, se puede iterar la UI en Flask sin volver a descargar pesos ni recompilar nada en el telefono.
- Despliegue en mini-PC recuperado como "house box": el repositorio esta pensado para trasladarse copiando una carpeta y ejecutando un script, lo que encaja en entornos domesticos o de laboratorio con hardware heterogeneo.
- Banco de pruebas de seleccion de modelos: gracias a `imp-vision-model-sets`, se puede comparar el comportamiento de distintos GGUF sobre la misma interfaz y el mismo conjunto de prompts.
- Demostraciones y docencia: el espacio publico de IMP-VISION y la pila local permiten mostrar el concepto de asistente con vision sin exigir a la audiencia instalar modelos en su dispositivo.
- Servicio interno con acceso restringido: el tunel HTTPS con control de acceso por defecto lo hace apto para un rig privado de equipo pequeno, sin exponer el servidor de inferencia a Internet abierta.
- Base para un "brain" propio: el repositorio enlaza un modelo en entrenamiento (`deadbug-brain-qwen2.5-1.5b`), de modo que la pila sirve como destino de despliegue de un ajuste futuro sin cambiar la arquitectura de servicio.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio no incluye evaluaciones propias, y los datos del modelo por defecto (Qwen2.5-1.5B-Instruct) corresponden a su propia documentacion, no a esta ficha.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explicita. Para el modelo por defecto (1,5 mil millones de parametros en Q4_K_M) el peso de los parametros ronda 1 GB, por lo que la huella total es del orden de 2-4 GB incluyendo contexto y overhead de llama.cpp; es una estimacion, no un dato publicado.
- GPU recomendadas: no disponible. La pila se declara agnostica al hardware y se ha ejecutado en una VM en la nube; no se especifican modelos de GPU.
- GPU de consumo: no confirmado por el autor. Por tamano del modelo por defecto, cabria en GPUs de consumo con 4-8 GB de VRAM, pero no hay validacion publicada en la informacion disponible.
- Opciones de despliegue: llama.cpp `llama-server` con pesos GGUF (unica opcion documentada). vLLM, TGI, Ollama y otros no se mencionan.
- Latencia y throughput: no disponibles. No se publican mediciones de tokens por segundo ni de tiempo hasta el primer token.

## Comparativa con modelos similares

La comparacion relevante no es contra otro modelo, sino contra otras formas de desplegar el mismo modelo por defecto. Se incluye tambien el modelo de referencia.

| Alternativa | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Deadbug Local Cloud (esta pila) | Depende del GGUF cargado; 1,5 B por defecto | Depende del modelo cargado | Apache-2.0 | GGUF via llama.cpp | Servicio persistente en servidor propio, cliente movil ligero, seleccion de modelos |
| Qwen2.5-1.5B-Instruct (modelo por defecto) | 1,5 B | No disponible en esta informacion | Apache-2.0 | Safetensors y GGUF | Modelo base de la pila; requiere un servidor de inferencia propio |
| Inferencia en el propio telefono | 1,5 B o menor | Limitado por RAM del dispositivo | Segun modelo | GGUF / runtime movil | Sujeto a terminacion de procesos en segundo plano y descargas interrumpidas |

No se dispone de datos de rendimiento comparado entre estas opciones en la informacion proporcionada.

## Limitaciones y advertencias

- No es un modelo: no debe citarse como un LLM con pesos, benchmarks o capacidades propias. Cualquier evaluacion de calidad debe hacerse sobre el GGUF que se cargue.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, y fue creado y actualizado el mismo dia (2026-11-20). No hay evidencia de uso ni de validacion por terceros.
- La model card no documenta sesgos, tasas de alucinacion ni evaluaciones de seguridad; esas propiedades dependen del modelo por defecto y de los conjuntos de modelos cargados.
- Idiomas soportados no declarados en la informacion disponible; la cobertura linguistica real vendra del modelo subyacente.
- Longitud de contexto no declarada para la pila; esta acotada por el modelo cargado y por la configuracion de `llama-server`.
- Licencia Apache-2.0 para el codigo y la configuracion del repositorio; los pesos que se carguen conservan su propia licencia, que debe verificarse por separado antes de uso comercial.
- El acceso remoto depende de un tunel HTTPS con control de acceso; un despliegue mal configurado expondria el servidor de inferencia. La model card indica que el rig es privado por defecto, pero no detalla el mecanismo de autenticacion.
- El "House Brain" figura como en entrenamiento, sin dataset, tokens ni resultados publicados; no debe asumirse que este disponible ni que iguale al modelo por defecto.
- El proyecto esta vinculado a un producto de hardware (gafas IMP-VISION) y a una organizacion pequena; no hay garantia de mantenimiento a largo plazo.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/Devilishcode/deadbug-local-cloud
- Codigo y guia de instalacion: https://github.com/deadbuglabs/local-cloud
- Organizacion Deadbug Labs en GitHub: https://github.com/deadbuglabs
- Conjuntos de modelos: https://huggingface.co/Devilishcode/imp-vision-model-sets
- House Brain (en entrenamiento): https://huggingface.co/Devilishcode/deadbug-brain-qwen2.5-1.5b
- Modelo por defecto: https://huggingface.co/Qwen/Qwen2.5-1.5B-Instruct-GGUF
- Demo del concepto de selector: https://huggingface.co/spaces/Devilishcode/imp-vision
- Sitio de Deadbug Labs: https://deadbuglabs.github.io/
- Deadbug Labs en Facebook: https://www.facebook.com/profile.php?id=61591927232914
