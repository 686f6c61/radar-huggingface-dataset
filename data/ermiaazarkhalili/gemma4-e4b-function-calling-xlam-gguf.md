# ermiaazarkhalili/Gemma4-E4B-Function-Calling-xLAM-GGUF

## Resumen

Gemma4-E4B-Function-Calling-xLAM-GGUF es una coleccion de cuantizaciones GGUF de un ajuste fino mediante LoRA sobre el modelo instructivo google/gemma-4-E4B-it. El autor, ermiaazarkhalili, parte del checkpoint completo (publicado en un repositorio hermano sin cuantizar) y lo convierte a formato llama.cpp para permitir su ejecucion en hardware de consumo. El objetivo concreto es especializar un modelo generalista de 7.463.013.674 parametros en la tarea de function calling (llamada a funciones y generacion estructurada de argumentos), entrenando de forma supervisada sobre el dataset Salesforce/xlam-function-calling-60k.

La relevancia de esta ficha es doble: por un lado, demuestra un flujo reproducible de especializacion de un modelo abierto con PEFT y TRL sobre un unico dataset de instrucciones; por otro, ofrece el resultado ya empaquetado en seis niveles de cuantizacion (de q2_k a q8_0) listos para llama.cpp y Ollama. No obstante, se trata de un artefacto de investigacion sin evaluacion de benchmarks publicada: el autor solo reporta observaciones de perdida de entrenamiento y advierte explicitamente de que el comportamiento fuera de la distribucion del dataset de entrenamiento no esta probado.

El modelo hereda la licencia Apache 2.0 del modelo base y conserva sus capacidades generales de generacion de texto, pero el ajuste fino esta orientado a un unico dominio funcional. Es, por tanto, una pieza util para prototipar agentes y pipelines de tool calling en local, no un modelo de proposito general validado para produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de google/gemma-4-E4B-it; detalles de atencion y capas no disponibles) |
| Parametros totales | 7.463.013.674 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | q2_k (4,38 GB), q3_k_m (4,82 GB), q4_k_m (5,30 GB), q5_k_m (5,72 GB), q6_k (6,17 GB), q8_0 (7,97 GB) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 (heredada del modelo base) |
| Formato de pesos | GGUF (llama.cpp); pesos completos en el repositorio base sin cuantizar |
| Modelo base | google/gemma-4-E4B-it |
| Metodo de ajuste | LoRA + SFT con PEFT y TRL, adaptadores fusionados en los pesos |
| Dataset de entrenamiento | Salesforce/xlam-function-calling-60k |
| Tamano del repositorio | 34,4 GB |

## Arquitectura y entrenamiento

El modelo parte de google/gemma-4-E4B-it, un transformer instructivo de aproximadamente 7,46 mil millones de parametros. Sobre esa base se aplico un ajuste fino supervisado (SFT) con adaptadores LoRA gestionados por PEFT y orquestado con TRL, empleando exclusivamente el dataset Salesforce/xlam-function-calling-60k, orientado a la generacion de llamadas a funciones con argumentos estructurados. Los adaptadores se fusionaron posteriormente en los pesos base, de modo que el resultado es un checkpoint unico e inseparable del ajuste: no es posible separar el LoRA del modelo original.

El entrenamiento se ejecuto de forma no interactiva mediante papermill a partir del notebook `notebooks/xlam_function_calling_gemma4-e4b.ipynb`, en una particion SLURM con GPUs H100. La model card no detalla hiperparametros (rango del LoRA, tasa de aprendizaje, numero de epochs, tokens vistos) ni la composicion exacta del dataset; esa informacion se remite al repositorio del checkpoint completo. No se documenta ninguna innovacion arquitectonica adicional (atencion lineal, decodificacion especulativa ni modos de razonamiento extendido) mas alla del ajuste mencionado.

## Capacidades

- Generacion de texto instructivo heredada del modelo base Gemma 4 E4B-it.
- Function calling y tool calling: la especializacion principal, entrenada sobre xLAM para producir llamadas a funciones con argumentos estructurados.
- Generacion de JSON y salidas estructuradas para integracion en pipelines de agentes.
- Razonamiento multi-paso orientado a la seleccion de herramientas, en la medida en que lo permita el modelo base.
- Capacidades multilingues: no documentadas para este checkpoint concreto; dependen del modelo base, cuyo listado de idiomas no se especifica en la informacion disponible.
- Capacidades de vision o audio: no disponibles.
- Modo thinking explicito: no disponible.

## Casos de uso

- Prototipado de agentes locales con tool calling: el modelo puede ejecutarse con llama.cpp u Ollama en una estacion de trabajo y generar llamadas a funciones para APIs internas, lo que permite iterar sobre el diseno de herramientas sin depender de servicios en la nube.
- Enrutamiento de consultas a herramientas en asistentes de codigo: dado un conjunto de funciones disponibles (busqueda en repositorio, ejecucion de tests, consulta de documentacion), el modelo selecciona la funcion adecuada y rellena los argumentos, aprovechando el entrenamiento especifico sobre xLAM.
- Extraccion de datos estructurados en pipelines ETL: convertir texto libre en objetos JSON con esquema fijo (por ejemplo, entidades de un ticket de soporte) usando el modo de generacion determinista de llama.cpp.
- Automatizacion de operaciones con function calling en local: integracion en scripts de administracion que invocan comandos o APIs a partir de lenguaje natural, con la ventaja de que el modelo cabe en GPUs de consumo en cuantizaciones q4_k_m o q5_k_m.
- Evaluacion comparativa de estrategias de cuantizacion: el repositorio ofrece seis niveles, lo que permite medir la degradacion de la precision en la generacion de argumentos estructurados entre q2_k y q8_0 en el mismo hardware.
- Base para un segundo ajuste fino: al estar bajo Apache 2.0 y en formato GGUF con pesos completos disponibles en el repositorio hermano, sirve como punto de partida para especializaciones adicionales en dominios concretos de herramientas.
- Despliegue embebido en entornos con recursos limitados: la variante q2_k (4,38 GB) permite ejecutar el modelo en equipos con 8 GB de VRAM o en CPU, util para demos y pruebas de concepto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor indica explicitamente que no se ha ejecutado ninguna evaluacion de benchmark sobre este checkpoint y que las unicas metricas reportadas son observaciones de perdida de entrenamiento, cuyos valores no se detallan en la model card de esta version cuantizada.

## Requisitos de hardware

- VRAM estimada para inferencia (incluye pesos y margen para contexto y cache KV, valores orientativos):
  - q2_k (4,38 GB): aproximadamente 5-6 GB de VRAM.
  - q3_k_m (4,82 GB): aproximadamente 5,5-6,5 GB.
  - q4_k_m (5,30 GB): aproximadamente 6-7 GB.
  - q5_k_m (5,72 GB): aproximadamente 6,5-7,5 GB.
  - q6_k (6,17 GB): aproximadamente 7-8 GB.
  - q8_0 (7,97 GB): aproximadamente 9-10 GB.
- GPU de consumo: las variantes q4_k_m y q5_k_m caben en GPUs de 8 GB (RTX 3060 Ti, RTX 4060, RTX 3070); q8_0 requiere 10-12 GB (RTX 3080 de 12 GB, RTX 4070 Ti, RTX 4080).
- GPU de datacenter: A100, H100 o L40S para despliegues con mayor concurrencia o contexto largo; el entrenamiento original se realizo en H100.
- Ejecucion en CPU: viable con llama.cpp en las cuantizaciones bajas (q2_k, q3_k_m), con latencia mayor no cuantificada en la informacion disponible.
- Opciones de despliegue: llama.cpp (llama-cli, llama-server), Ollama (via Modelfile), y cualquier runtime compatible con GGUF. vLLM y TGI no estan documentados para este artefacto; vLLM requeriria los pesos sin cuantizar del repositorio base.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Especializacion |
|---|---|---|---|---|---|
| Gemma4-E4B-Function-Calling-xLAM-GGUF | 7.463.013.674 | no disponible | GGUF (6 cuantizaciones) | Apache 2.0 | Function calling (xLAM) |
| google/gemma-4-E4B-it (base) | 7.463.013.674 | no disponible | safetensors | Apache 2.0 | Proposito general instructivo |
| ermiaazarkhalili/Gemma4-E4B-Function-Calling-xLAM | 7.463.013.674 | no disponible | safetensors | Apache 2.0 | Function calling (xLAM), pesos completos |

La comparativa se limita al linaje directo del modelo porque la informacion disponible no incluye datos de rendimiento que permitan contrastarlo con alternativas de otros autores. Frente al modelo base, la diferencia es el ajuste supervisado sobre xLAM y el empaquetado GGUF; frente al checkpoint sin cuantizar, la diferencia es el formato y la perdida de precision asociada a cada nivel de cuantizacion.

## Limitaciones y advertencias

- Ausencia total de evaluacion: no hay benchmarks publicados; el unico indicio de calidad son observaciones de perdida de entrenamiento no detalladas.
- Sesgos heredados: el modelo arrastra los sesgos, el corte de conocimiento y los modos de fallo de google/gemma-4-E4B-it, no corregidos por el ajuste.
- Sobreajuste al dataset: entrenado sobre un unico dataset de instrucciones (xlam-function-calling-60k); el comportamiento fuera de esa distribucion esta explicitamente sin probar.
- Riesgo de alucinacion: especialmente en la generacion de nombres de funciones o argumentos inexistentes; requiere validacion de esquema en produccion.
- Fusion de adaptadores: al haberse fusionado el LoRA en los pesos, no es posible recuperar el modelo base a partir de este checkpoint.
- Idiomas y contexto no documentados: no se especifica la ventana de contexto efectiva ni la cobertura linguistica de este ajuste.
- Cuantizaciones agresivas: q2_k y q3_k_m pueden degradar la precision en la generacion de JSON y argumentos estructurados; no hay mediciones que cuantifiquen esa perdida.
- Licencia: Apache 2.0 permite uso comercial, pero conviene verificar las condiciones del modelo base Gemma y del dataset xLAM antes de un despliegue en produccion.
- Madurez: el repositorio tiene 0 descargas y 0 likes en el momento de la consulta; es un artefacto reciente sin validacion comunitaria.

## Enlaces

- Repositorio GGUF: https://huggingface.co/ermiaazarkhalili/Gemma4-E4B-Function-Calling-xLAM-GGUF
- Checkpoint completo sin cuantizar: https://huggingface.co/ermiaazarkhalili/Gemma4-E4B-Function-Calling-xLAM
- Modelo base: https://huggingface.co/google/gemma-4-E4B-it
- Dataset de entrenamiento: https://huggingface.co/datasets/Salesforce/xlam-function-calling-60k
- PEFT: https://github.com/huggingface/peft
- TRL: https://github.com/huggingface/trl
- llama.cpp: https://github.com/ggml-org/llama.cpp
- Ollama: https://ollama.com
