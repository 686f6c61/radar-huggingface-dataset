# HenryZhang/piper-ucla-bs16-40k-r2-step020000-pi05

## Resumen

piper-ucla-bs16-40k-r2-step020000-pi05 es un ajuste fino (fine-tuning) del modelo base lerobot/pi05_base, un modelo vision-language-action (VLA) orientado al control de robots manipuladores. Lo publica el usuario HenryZhang en Hugging Face y se ha entrenado sobre el dataset thecqzzz/piper_vla_ucla, compuesto por demostraciones del brazo robotico Piper (AgileX) recogidas en el entorno UCLA. El objetivo es que el modelo traduzca instrucciones en lenguaje natural e imagenes de camara en secuencias de acciones de control del brazo.

El checkpoint corresponde a 20.000 actualizaciones del optimizador con un batch global de 16 y un action chunk de 32, es decir, el modelo predice bloques de 32 acciones consecutivas por paso de inferencia. El repositorio pesa 9,4 GB y contiene 4.143.404.816 parametros en formato safetensors, un tamano coherente con un VLA basado en un transformer de vision y un modelo de lenguaje de escala media acoplado a una cabeza de acciones.

Su relevancia es practica: es un ejemplo de ajuste fino reproducible de pi05 sobre un robot concreto, util para quienes trabajan en imitacion de bajo coste con LeRobot y quieren adaptar un VLA generico a un hardware especifico. La informacion publica es muy escasa (sin licencia declarada, sin benchmarks y sin model card detallada), por lo que debe tratarse como un checkpoint experimental de investigacion mas que como un modelo listo para produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | vision-language-action (VLA) derivada de lerobot/pi05_base; no se detalla la arquitectura interna en la informacion disponible |
| Parametros totales | 4.143.404.816 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors sin cuantizar) |
| Idiomas soportados | no disponible (las instrucciones de entrenamiento proceden del dataset thecqzzz/piper_vla_ucla; el idioma de las instrucciones no se especifica) |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un fine-tuning de lerobot/pi05_base, el checkpoint base de la familia pi05 integrada en LeRobot. Se trata de un modelo VLA: combina un codificador visual, un modelo de lenguaje que procesa la instruccion y una cabeza de politica que emite acciones motoras. La informacion disponible no detalla el numero de capas, la dimension oculta ni la composicion exacta del backbone, por lo que esos datos deben consultarse en la ficha de lerobot/pi05_base.

El entrenamiento se realizo sobre el dataset thecqzzz/piper_vla_ucla con 20.000 actualizaciones del optimizador, batch global de 16 y action chunk de 32. No se especifica el numero de tokens, la composicion exacta del dataset, ni si hubo etapas de RLHF o DPO; en el contexto de los VLA de imitacion lo habitual es entrenamiento supervisado sobre pares observacion-accion, pero este extremo no se confirma en la model card. Tampoco se documentan innovaciones tecnicas adicionales (decodificacion especulativa, atencion lineal, etc.).

## Capacidades

- Control de robot manipulador: genera secuencias de acciones (action chunks de 32 pasos) para el brazo Piper a partir de observaciones visuales e instrucciones.
- Imitacion de demostraciones: reproduce comportamientos aprendidos del dataset thecqzzz/piper_vla_ucla.
- Procesamiento multimodal: combina entrada visual (imagenes de camara) con instrucciones en lenguaje natural, segun el paradigma VLA del modelo base.
- Integracion con LeRobot: al derivar de lerobot/pi05_base, es compatible con el ecosistema de entrenamiento e inferencia de LeRobot.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible.
- Capacidades especiales (thinking mode, vision, audio): vision como parte del pipeline VLA; el resto no disponible.

## Casos de uso

- Manipulacion robotica en laboratorio: usar el checkpoint para controlar un brazo Piper en tareas de pick-and-place aprendidas de las demostraciones UCLA, aprovechando que el ajuste fino se ha hecho especificamente sobre ese hardware.
- Investigacion en imitacion de bajo coste: servir de punto de partida para experimentos de aprendizaje por imitacion con LeRobot, comparando el efecto de 20.000 pasos de ajuste fino frente al modelo base pi05.
- Reproduccion de experimentos: al estar publicados los hiperparametros clave (batch 16, action chunk 32, 20.000 updates), permite replicar o extender el entrenamiento sobre el mismo dataset.
- Evaluacion de generalizacion: probar el modelo en variaciones de posicion, iluminacion u objetos respecto a las demostraciones originales para medir la robustez del ajuste fino.
- Base para nuevos ajustes: fine-tuning posterior sobre datasets propios de otro brazo o de tareas adicionales, partiendo de un VLA ya adaptado a un entorno real.
- Docencia y prototipado: ejemplo didactico de pipeline completo (dataset, entrenamiento, checkpoint) para cursos de robotica con aprendizaje profundo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: con 4.143 millones de parametros, en fp16 se necesitan aproximadamente 8,3 GB solo para pesos; en fp32, unos 16,6 GB. A ello hay que sumar el codificador visual, el buffer de observaciones y el estado del entorno de robot, por lo que conviene reservar margen adicional.
- Cuantizacion: no se publican versiones GGUF ni cuantizadas; habria que generarlas a partir de los safetensors.
- GPU recomendadas: para fp16, tarjetas con 16 GB o mas (RTX 4080/4090, A10, L4). Para fp32 o para entrenamiento, A100 o H100.
- Cabe en GPU de consumo: si, en RTX 4090 (24 GB) o RTX 4080 (16 GB) en fp16 con margen ajustado; en tarjetas de 8-12 GB requeriria cuantizacion.
- Opciones de despliegue: el ecosistema natural es LeRobot (inferencia de politicas); no se documenta soporte de vLLM, llama.cpp, Ollama o TGI, que estan orientados a modelos de lenguaje y no a politicas VLA.
- Latencia y throughput: no disponibles. En control robotico la latencia del bucle de politica es critica y deberia medirse en el hardware objetivo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| piper-ucla-bs16-40k-r2-step020000-pi05 | 4.143 M | no disponible | VLA ajustado a brazo Piper | no disponible | Hugging Face (HenryZhang) |
| lerobot/pi05_base | no disponible en la informacion proporcionada | no disponible | VLA base de LeRobot | no disponible | Hugging Face (lerobot) |
| Otros VLA de robotica (p. ej. familias OpenVLA o RT) | no disponible | no disponible | VLA generalistas | variable | Hugging Face / repos publicos |

La comparacion cuantitativa con alternativas no es posible con la informacion disponible: no hay benchmarks publicados para este checkpoint y no se dispone de cifras verificadas de los modelos comparables en el material proporcionado.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados; al entrenarse solo con demostraciones del dataset thecqzzz/piper_vla_ucla, heredara los sesgos de ese entorno (posiciones, objetos, iluminacion y estilo de las demostraciones).
- Riesgo de sobreajuste: 20.000 actualizaciones sobre un unico dataset pueden reducir la generalizacion a condiciones no vistas.
- Dominio restringido: es un modelo de control motor para un brazo concreto, no un asistente conversacional; no debe usarse como modelo de lenguaje general.
- Licencia: no declarada en la informacion disponible, lo que impide confirmar si se permite uso comercial. Es un riesgo legal relevante antes de cualquier despliegue en produccion.
- Idiomas: no se especifica el idioma de las instrucciones de entrenamiento; el rendimiento fuera de ese idioma es incierto.
- Ausencia de benchmarks: no hay evidencia publica de rendimiento que respalde su uso en entornos reales criticos.
- Seguridad fisica: cualquier uso en un robot real requiere limites de par, paradas de emergencia y validacion en entorno simulado antes de operar cerca de personas.
- Reproducibilidad: la model card es minima; faltan detalles de preprocesado, normalizacion de acciones y configuracion exacta de entrenamiento.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/HenryZhang/piper-ucla-bs16-40k-r2-step020000-pi05
- Modelo base: https://huggingface.co/lerobot/pi05_base
- Dataset de entrenamiento: https://huggingface.co/datasets/thecqzzz/piper_vla_ucla
- LeRobot (framework): https://github.com/huggingface/lerobot
