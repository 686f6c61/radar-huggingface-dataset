# mertkayacs/Wahler-4B-web

## Resumen

Wahler-4B-web es una distribucion cuantizada en GGUF del modelo Wahler-4B, publicada por mertkayacs y disenada especificamente para su ejecucion en navegador mediante wllama 4.0.0 sobre WebGPU. El modelo base cuenta con 4.205.751.296 parametros (aproximadamente 4,2 mil millones) y esta orientado a la toma de decisiones conversacionales, segun indica la etiqueta `decision-model` de su repositorio. La licencia es Apache 2.0 y el unico idioma declarado es el aleman.

La particularidad de esta publicacion no es el modelo en si, sino el empaquetado: el autor ha dividido el fichero GGUF Q4_K_M en siete fragmentos (`shards`) que suman 2.708.805.024 bytes, con un manifiesto (`browser-manifest.json`) que permite al navegador verificar la integridad SHA-256 de cada pieza, almacenarlas en OPFS y cargarlas a traves de wllama. El repositorio incluye ademas un fichero de calibracion y un conjunto de 62 identificadores de tokens de respuesta mas un token marcador de decision (`symbols.json`).

Es relevante ahora porque demuestra un flujo completo de despliegue de un LLM de 4B en el cliente (navegador), sin backend, con verificacion criptografica de pesos y pruebas de paridad frente al modelo sin dividir. Para desarrolladores que evaluan inferencia local en WebGPU, este repositorio aporta datos concretos de integridad, paridad de argmax y requisitos de memoria que rara vez se publican junto a una cuantizacion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base transformer, plantilla de chat Qwen3.5 embebida en el GGUF) |
| Parametros totales | 4.205.751.296 |
| Parametros activos | no aplica (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q4_K_M (con fichero de calibracion incluido); se menciona BF16 como referencia de comparacion |
| Idiomas soportados | aleman (de) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF dividido en 7 shards; el modelo base se distribuye en safetensors |

## Arquitectura y entrenamiento

No se dispone de informacion sobre la arquitectura interna del modelo base Wahler-4B en la documentacion proporcionada: no se detalla si emplea atencion completa, atencion lineal, mezcla de expertos o alguna variante hibrida, ni se especifican el numero de capas, dimensiones ocultas o cabezas de atencion. Tampoco se documentan el volumen de tokens de entrenamiento, la composicion del dataset ni si hubo fases de RLHF, DPO o ajuste por preferencias. La unica referencia estructural es que el GGUF embebe el tokenizer y la plantilla de chat de Qwen3.5, lo que sugiere compatibilidad con el formato conversacional de esa familia.

La innovacion tecnica documentada se centra en el proceso de cuantizacion y division. El autor reporta que la cuantizacion Q4_K_M nativa mantiene un 97,50% de acuerdo de argmax frente a BF16 sobre 40 decisiones reservadas (`held-out`), con una brecha maxima de probabilidad de 0,3419. La operacion de division preserva los 426 tensores y los 39 campos de metadatos no de cabecera del fichero original, y los bytes de calibracion quedan intactos, de modo que la degradacion de ECE atribuible al split es 0,0000, por debajo del umbral de reajuste de 0,02. Se incluye ademas una prueba en ZeroGPU sobre una particion NVIDIA RTX Pro 6000 Blackwell Server Edition con offload de GPU, que reproduce la accion `socialize` para una solicitud concreta.

## Capacidades

- Generacion de texto conversacional en aleman, con plantilla de chat Qwen3.5 embebida en el GGUF.
- Toma de decisiones discretas: el repositorio incluye `symbols.json` con 62 identificadores de tokens de respuesta y un token marcador de decision, lo que permite mapear la salida del modelo a un conjunto cerrado de acciones.
- Ejecucion en navegador mediante wllama 4.0.0 sobre WebGPU, con verificacion SHA-256 de cada shard y almacenamiento en OPFS.
- Carga por fragmentos: el manifiesto `browser-manifest.json` actua como lista autoritativa de ficheros y permite iniciar la carga desde el primer shard.
- Compatibilidad con endpoints (`endpoints_compatible` segun los tags del repositorio).
- No se documentan capacidades de tool calling, function calling, agentes multi-paso, vision, audio, modo de razonamiento explicito ni matematicas avanzadas.

## Casos de uso

- Asistentes conversacionales en aleman completamente en el cliente: el modelo se carga en el navegador via WebGPU y wllama, sin enviar datos a un servidor, lo que resulta adecuado para aplicaciones con requisitos de privacidad estrictos.
- Clasificacion y enrutado de decisiones acotadas: gracias a los 62 tokens de respuesta y al token marcador de decision en `symbols.json`, se puede mapear la salida a un conjunto finito de acciones (por ejemplo, seleccion de categoria o siguiente paso en un flujo).
- Demostraciones y prototipos sin infraestructura: un equipo puede publicar una demo interactiva en una pagina web estatica, con los siete shards servidos como recursos y verificados por hash antes de la inferencia.
- Verificacion de integridad de pesos en produccion: el manifiesto con SHA-256 por fragmento permite auditar que el modelo cargado coincide con el publicado, util en entornos regulados.
- Formacion y evaluacion de tecnicas de cuantizacion: el repositorio aporta metricas reproducibles (acuerdo de argmax, brecha de probabilidad, ECE) que sirven como referencia para comparar pipelines de cuantizacion.
- Aplicaciones offline de escritorio empaquetadas con WebGPU: dado que la politica de admision exige 8 GiB de memoria de dispositivo y 3,1 GiB de almacenamiento libre, encaja en equipos de gama media-alta con navegadores modernos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K u otros) en la informacion disponible. Los unicos datos medidos por el autor son de paridad e integridad de la cuantizacion:

| Metrica | Valor |
|---|---|
| Acuerdo de argmax Q4_K_M vs BF16 | 97,50% sobre 40 decisiones reservadas |
| Brecha maxima de probabilidad | 0,3419 |
| Integridad del split (tensores) | 426 de 426 coinciden |
| Integridad del split (metadatos no de cabecera) | 39 de 39 coinciden |
| Degradacion de ECE por el split | 0,0000 (umbral de reajuste 0,02) |
| Tamano total GGUF | 2.708.805.024 bytes (7 shards) |
| Shard mayor | 521.472.192 bytes |

## Requisitos de hardware

- Memoria de dispositivo minima segun la politica de admision: 8 GiB.
- Almacenamiento libre minimo: 3,1 GiB (los siete shards ocupan aproximadamente 2,7 GB).
- Memoria viva estimada: 4,8 GiB (estimacion pendiente de medicion real en hardware de navegador).
- GPU: cualquier dispositivo con soporte WebGPU; la prueba de inferencia nativa se realizo en una NVIDIA RTX Pro 6000 Blackwell Server Edition. No se documentan pruebas en GPU de consumo como RTX 4090, RTX 3090 o equivalentes AMD/Intel.
- Despliegue: wllama 4.0.0 en navegador (WebGPU + OPFS). El repositorio declara prueba de GPU con llama.cpp nativo, pero no se especifican otras opciones como vLLM, TGI, Ollama o llama.cpp de escritorio.
- Latencia y throughput: no disponibles. El autor indica que la velocidad WebGPU y el pico de memoria en navegador se reportan desde la linea de ejecucion del runtime Emberwick, fuera de este repositorio.

## Comparativa con modelos similares

No se dispone de datos de rendimiento del modelo base Wahler-4B ni de sus alternativas en la informacion proporcionada, por lo que no es posible establecer una comparativa cuantitativa fiable. A continuacion se resumen los datos objetivos disponibles frente a la categoria generica de modelos de aproximadamente 4B en GGUF para inferencia local:

| Modelo | Parametros | Contexto | Licencia | Formato | Enfoque |
|---|---|---|---|---|---|
| Wahler-4B-web | 4,2B | no disponible | Apache 2.0 | GGUF Q4_K_M en 7 shards | Navegador (WebGPU/wllama), aleman |
| Alternativas de ~4B en GGUF | no disponible | no disponible | no disponible | GGUF | Local en escritorio/servidor |

No se identifican en la informacion proporcionada modelos comparables concretos con los que contrastar parametros, contexto, rendimiento y disponibilidad.

## Limitaciones y advertencias

- El unico idioma declarado es el aleman; no se garantiza un comportamiento correcto en castellano ni en otros idiomas.
- No se documentan sesgos conocidos, pero al no publicarse la composicion del dataset de entrenamiento no es posible evaluar riesgos de sesgo de forma informada.
- Riesgo de alucinacion inherente a los modelos generativos; no se han publicado evaluaciones de fidelidad ni de tasa de alucinacion.
- La cuantizacion Q4_K_M introduce una divergencia medible frente a BF16 (2,50% de desacuerdo de argmax en la muestra de 40 decisiones), relevante en tareas de clasificacion sensible.
- La politica de admision exige 8 GiB de memoria de dispositivo y 3,1 GiB de almacenamiento libre; equipos por debajo de esos umbrales no podran cargar el modelo.
- Las cifras de memoria viva (4,8 GiB) son estimaciones pendientes de medicion real en navegador; el rendimiento WebGPU no esta cuantificado en el repositorio.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, sin historial de uso en produccion.
- Aunque la licencia es Apache 2.0, conviene verificar las condiciones del modelo base Wahler-4B antes de un despliegue comercial, ya que esta publicacion es una cuantizacion derivada.
- No se documenta longitud de contexto, por lo que no se puede garantizar el comportamiento en conversaciones largas.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/mertkayacs/Wahler-4B-web
- Modelo base: https://huggingface.co/mertkayacs/Wahler-4B
- wllama (runtime de inferencia en navegador): no disponible en la informacion proporcionada
- Documentacion de WebGPU: no disponible en la informacion proporcionada
- Paper o blog tecnico del modelo: no disponible en la informacion proporcionada
