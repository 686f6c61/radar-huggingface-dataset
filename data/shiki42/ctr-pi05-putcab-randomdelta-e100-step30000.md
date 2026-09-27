# Shiki42/ctr-pi05-putcab-randomdelta-e100-step30000

## Resumen

El modelo `Shiki42/ctr-pi05-putcab-randomdelta-e100-step30000` es un checkpoint de inferencia orientado a robotica, publicado por el usuario Shiki42 en HuggingFace. Se trata del resultado del experimento CTR E100, correspondiente al paso de optimizador 30000, y su train de desarrollo esta vinculado a RoboTwin, un entorno de evaluacion de manipulacion robotica bimanual. El prefijo `pi05` del nombre del directorio de entrenamiento sugiere una base de la familia pi-0.5, aunque la model card no lo confirma explicitamente.

El checkpoint se genero continuando el modelo E091 (paso 10000) durante 20000 pasos adicionales hasta alcanzar el paso 30000, con el objetivo declarado de comprobar si esa continuacion mejora el exito en escenas vistas y no vistas. El artefacto publicado contiene unicamente el estado necesario para inferencia (parametros, assets de normalizacion y metadatos), excluyendo el estado del optimizador, e incluye un fichero `SHA256SUMS` con el hash de cada archivo.

Su relevancia es limitada y muy especifica: es una publicacion de preservacion, realizada a peticion del usuario antes del apagado del host de entrenamiento. No hay resultados de evaluacion publicados en la informacion disponible, ni descargas ni interacciones registradas, y la licencia figura como `other` sin terminos detallados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (el pipeline es `robotics` y el identificador apunta a un modelo vision-language-action de la familia pi-0.5, sin detalle en la model card) |
| Parametros totales | no disponible (el repositorio ocupa 6,3 GB e incluye pesos, assets de normalizacion y metadatos) |
| Parametros activos | no disponible (no se indica que sea un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (no se documentan versiones GGUF, AWQ, GPTQ ni similares) |
| Idiomas soportados | no disponible (no se declaran idiomas; el uso previsto es robotico) |
| Licencia | `other` (sin terminos concretos en la model card) |
| Formato de pesos | no disponible; el repositorio contiene parametros, `assets/normalization` y metadatos, con integridad verificable mediante `SHA256SUMS` |
| Tarea | manipulacion robotica (`putcab`), con horizonte completo (`fullhorizon`) |
| Entrenamiento | E100: continuacion del checkpoint E091 de 10K hasta 30K, LoRA de 3 epocas, micro-batch 16, acumulacion de gradiente 1 |
| Paso de optimizador | 30000 |
| Tamano del repositorio | 6,3 GB |
| Descargas / likes | 0 / 0 |
| Fecha de publicacion | 2026-09-27 |

## Arquitectura y entrenamiento

No se dispone de informacion detallada sobre la arquitectura en la model card. Los unicos elementos verificables son la etiqueta `robotics` y el nombre del directorio de entrenamiento (`pi05_putcab_athenb_fullhorizon_mb16_ga1_lora3ep`), que indica una adaptacion mediante LoRA de 3 epocas sobre una base identificada como `pi05`, con micro-batch de 16, acumulacion de gradiente 1 y entrenamiento a horizonte completo. El autor no documenta el numero de parametros, la composicion del dataset, el numero de tokens ni si hubo etapas de RLHF o DPO.

El proceso de entrenamiento descrito consiste en reanudar el checkpoint E091 (paso 10000) y continuar 20000 pasos mas hasta el paso 30000. La pregunta de investigacion del experimento es si esa continuacion mejora el exito en escenas vistas y no vistas; la model card remite la respuesta al registro del experimento E100, que no se incluye en la informacion proporcionada. El checkpoint publicado excluye el estado del optimizador, por lo que no es util para reanudar entrenamiento, solo para inferencia.

## Capacidades

- Manipulacion robotica: el checkpoint esta entrenado para una tarea concreta de manipulacion, identificada como `putcab`, en el marco de RoboTwin.
- Inferencia a horizonte completo (`fullhorizon`), segun la nomenclatura del directorio de entrenamiento.
- Adaptacion de bajo rango (LoRA) sobre una base `pi05`, lo que implica que la capacidad efectiva depende del modelo base, no documentado aqui.
- No se declara soporte de tool calling ni de function calling.
- No se declara soporte de agentes ni de razonamiento multi-paso.
- No se declaran capacidades multilingues.
- No se declaran capacidades de generacion de texto, codigo, matematicas, vision general, audio ni modo de razonamiento explicito.

## Casos de uso

- Evaluacion de continuacion de entrenamiento: el checkpoint permite comparar el exito en escenas vistas y no vistas frente al punto de partida E091 de 10K, que es exactamente la pregunta planteada en el experimento E100. Es su uso principal y el unico documentado.
- Reproducibilidad de experimentos: al conservar `assets/normalization` y metadatos junto a los parametros, permite reinstanciar la inferencia con la misma normalizacion de observaciones y acciones que en el entrenamiento.
- Analisis de politicas de manipulacion: util para estudiar como evoluciona una politica LoRA entre los pasos 10000 y 30000 en una tarea bimanual de RoboTwin.
- Punto de partida para nuevas continuaciones: al ser un checkpoint de inferencia sin estado de optimizador, sirve como inicializacion de pesos para reentrenamientos posteriores, no como reanudacion exacta.
- Verificacion de integridad de artefactos: el fichero `SHA256SUMS` permite auditar que los pesos descargados coinciden con los publicados antes del apagado del host.
- Seleccion de checkpoints en un pipeline de investigacion: si se dispone de los checkpoints E091 y E100, este ultimo se puede usar como candidato en una comparativa de exito por escena.
- Advertencia: no hay evidencia publicada de que el modelo funcione fuera del entorno RoboTwin ni en tareas distintas de `putcab`; los casos anteriores son de investigacion, no de produccion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye tablas de exito por escena, ni metricas de exito en escenas vistas o no vistas, ni comparaciones con el checkpoint E091, pese a que la pregunta del experimento E100 apunta precisamente a esa comparacion.

## Requisitos de hardware

- VRAM estimada: no disponible. El repositorio ocupa 6,3 GB e incluye pesos, assets de normalizacion y metadatos; como referencia orientativa, los pesos en precision de 16 bits ocuparian del orden de 6 GB, lo que situaria la inferencia en torno a 8-16 GB de VRAM contando activaciones, pero es una estimacion derivada del tamano del repositorio, no un dato del autor.
- GPU recomendadas: no disponible. Por el perfil de la carga (politica robotica con inferencia por paso) los candidatos habituales serian GPUs de datacenter tipo A100 o H100 y GPUs de consumo de gama alta tipo RTX 4090 o RTX 3090, pero no hay confirmacion en la informacion proporcionada.
- Encaje en GPU de consumo: no confirmado. Con 6,3 GB de artefacto, es plausible que quepa en GPUs con 12 GB o mas, sujeto a la precision real de los pesos y al coste de las activaciones.
- Opciones de despliegue: no disponibles. No se documenta compatibilidad con vLLM, llama.cpp, Ollama o TGI; estos runtimes estan orientados a modelos de lenguaje y no cubren por defecto politicas de accion robotica.
- Latencia y throughput: no disponibles. No se publican mediciones de frecuencia de inferencia ni de tiempo por paso de control.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ctr-pi05-putcab-randomdelta-e100-step30000 | no disponible | no disponible | Vision-language-action entrenado con LoRA para `putcab` en RoboTwin | `other` | Repositorio publico, 0 descargas |
| Base `pi05` (familia pi-0.5) | no disponible | no disponible | Vision-language-action generalista | no disponible | no disponible en la informacion proporcionada |
| Otros modelos VLA comparables (OpenVLA, RDT-1B, GR00T N1) | no disponible | no disponible | Vision-language-action para manipulacion | no disponible | no disponible |

No se dispone de datos verificables para establecer una comparativa cuantitativa. El checkpoint aqui descrito es un ajuste especifico de tarea sobre una base no documentada en la ficha, y no hay cifras de rendimiento publicadas que permitan contrastarlo con alternativas de la misma categoria. Cualquier comparacion numerica requeriria consultar el registro del experimento E100 y la documentacion del modelo base, no incluidos en la informacion proporcionada.

## Limitaciones y advertencias

- Sesgos conocidos: no disponibles. No se documenta composicion del dataset ni procedencia de las demostraciones, por lo que no es posible evaluar sesgos de dominio, entorno o geometria de objetos.
- Riesgo de alucinacion: no aplica en el sentido linguistico, pero si existe riesgo de acciones incorrectas o inseguras fuera de la distribucion de entrenamiento, sin que haya evaluacion publicada que lo cuantifique.
- Limitaciones de contexto e idioma: no se declara ventana de contexto ni idiomas soportados. El modelo esta orientado a una tarea robotica concreta (`putcab`) en RoboTwin.
- Restricciones de licencia: la licencia es `other` y la model card no incluye terminos de uso. No se puede asumir permiso para uso comercial; es necesario contactar con el autor o consultar la licencia del modelo base.
- Checkpoint de inferencia: el estado del optimizador esta excluido, por lo que no sirve para reanudar el entrenamiento en el paso 30000.
- Estado de evaluacion: el autor remite explicitamente a "CTR experiment record E100" para conocer el estado de evaluacion y las advertencias, pero ese registro no forma parte de la informacion proporcionada.
- Ausencia de adopcion: 0 descargas y 0 likes, sin historial de terceros que hayan reproducido resultados.
- Publicacion de preservacion: el checkpoint se subio a peticion del usuario antes de apagar el host de entrenamiento, no como una release estable ni versionada.
- Fecha de creacion y actualizacion muy proximas entre si (27 de septiembre de 2026), lo que indica una publicacion puntual sin mantenimiento posterior documentado.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Shiki42/ctr-pi05-putcab-randomdelta-e100-step30000
