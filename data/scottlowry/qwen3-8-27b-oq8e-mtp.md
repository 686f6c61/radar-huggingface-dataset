# scottlowry/Qwen3.8-27B-oQ8e-mtp

## Resumen

Qwen3.8-27B-oQ8e-mtp es una cuantizacion mixta del modelo base Qwen/Qwen3.8-27B, publicada por el usuario scottlowry en Hugging Face. No se trata de un modelo entrenado desde cero, sino de un checkpoint derivado en formato MLX (Apple Silicon) generado con la herramienta oQ de oMLX v0.7.4.dev1, que aplica cuantizacion de precision mixta para reducir el peso del modelo manteniendo una calidad cercana al original. El checkpoint resultante ocupa 27,941 GiB (30,001 GB) y presenta un promedio efectivo de 8,639 bits por peso.

El modelo conserva la arquitectura del Qwen3.8-27B original, con un total de 27.781.427.952 parametros reales segun los safetensors. La distribucion interna revela tres componentes diferenciados: un modelo de lenguaje de 26,896B parametros, un modulo de vision de 0,461B y una cabeza MTP (multi-token prediction) de 0,425B. La mayor parte de los pesos (98,143%) se almacena en formato affine de 8 bits con grupo de 64, mientras que un 1,857% permanece en BF16, presumiblemente en capas sensibles a la cuantizacion.

Su relevancia actual radica en que permite ejecutar un modelo de ~27,8B parametros con capacidades multimodales y decodificacion especulativa (via MTP) en hardware Apple Silicon con memoria unificada, algo inviable con el checkpoint BF16 original. La licencia, los idiomas y los datos de rendimiento no estan disponibles en la informacion proporcionada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (Qwen3.5, segun tag `qwen3_5`); incluye modulo de vision y cabeza MTP |
| Parametros totales | 27.781.427.952 (27,781B) |
| Parametros activos | No aplica (no es MoE segun la informacion disponible) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | Mixta: affine 8-bit grupo 64 (98,143% de pesos) + BF16 (1,857%); promedio efectivo 8,639 bits/peso |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | safetensors (libreria MLX) |

## Arquitectura y entrenamiento

El checkpoint deriva del modelo base Qwen/Qwen3.8-27B, cuya arquitectura interna se etiqueta como `qwen3_5` en los metadatos. Se compone de tres bloques: el modelo de lenguaje principal (26,896B parametros), un encoder o modulo de vision (0,461B) y una cabeza de prediccion multi-token MTP (0,425B). La presencia de MTP sugiere soporte para decodificacion especulativa, una tecnica que permite proponer varios tokens por paso y verificarlos en paralelo para acelerar la generacion.

No se dispone de informacion sobre el proceso de entrenamiento original del modelo base: numero de tokens, composicion del dataset, uso de RLHF/DPO ni innovaciones de atencion. Lo unico documentado es el proceso de cuantizacion posterior: oMLX v0.7.4.dev1 aplico precision mixta, manteniendo en BF16 0,516B parametros (1,857%) y cuantizando el resto a affine 8-bit con tamano de grupo 64, lo que produce 8,50 bits/peso efectivos en ese bloque. El checkpoint fue re-cuantizado el 2026-11-11, por lo que versiones anteriores deben descartarse.

## Capacidades

- Generacion de texto y razonamiento: heredadas del modelo base Qwen3.8-27B, aunque no se detallan capacidades especificas en la informacion disponible.
- Vision: el checkpoint incluye un modulo de vision de 0,461B parametros, lo que indica soporte de entrada de imagenes (multimodalidad).
- Decodificacion especulativa: la cabeza MTP de 0,425B parametros esta disenada para multi-token prediction, lo que puede acelerar la inferencia.
- Ejecucion en Apple Silicon: formato MLX nativo, optimizado para memoria unificada de chips M-series.
- Tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponible en la informacion proporcionada.
- Modo thinking, audio u otras capacidades especiales: no disponible en la informacion proporcionada.

## Casos de uso

- Inferencia local en Mac con memoria unificada: el checkpoint de 27,941 GiB cabe en equipos Apple Silicon con 32 GB o mas de RAM unificada, permitiendo ejecutar un modelo de ~27,8B parametros sin GPU dedicada. Es el caso de uso principal de esta publicacion.
- Prototipado de aplicaciones multimodales en local: el modulo de vision integrado permite experimentar con tareas imagen-texto en un portatil o estacion de trabajo Mac, sin depender de APIs en la nube.
- Evaluacion de tecnicas de cuantizacion: investigadores pueden comparar la calidad del checkpoint oQ8e frente al BF16 original para medir el impacto de la cuantizacion mixta en tareas concretas.
- Aceleracion mediante decodificacion especulativa: la cabeza MTP permite implementar generacion especulativa en pipelines MLX, reduciendo la latencia por token en comparacion con decodificacion autoregresiva estandar.
- Desarrollo y depuracion offline: al ejecutarse completamente en local, es adecuado para entornos con requisitos de privacidad o sin conectividad, procesando texto e imagenes sin enviar datos a terceros.
- Benchmarking de hardware Apple: util para medir throughput y latencia de modelos de ~28B parametros en distintos chips M-series y configuraciones de memoria, estableciendo lineas base para futuras cuantizaciones.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM/RAM estimada: 27,941 GiB de almacenamiento de pesos; se recomienda al menos 32 GB de memoria unificada para dejar margen a KV cache y overhead del runtime.
- GPU recomendadas: exclusivamente Apple Silicon (M1/M2/M3/M4 en variantes Pro, Max o Ultra) por el formato MLX. No es compatible de forma nativa con CUDA.
- Cabe en consumer GPU: no en el sentido tradicional (NVIDIA/AMD); si en Mac con 32 GB o mas de memoria unificada.
- Opciones de despliegue: runtime MLX y oMLX (herramienta que genero la cuantizacion). No se indica compatibilidad con vLLM, llama.cpp, Ollama o TGI, dado el formato MLX y la presencia de cabeza MTP.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.8-27B-oQ8e-mtp (este) | 27,781B | No disponible | MLX safetensors, 8,639 bits/peso | No disponible | Hugging Face, 412 descargas |
| Qwen/Qwen3.8-27B (base) | 27,781B (aprox.) | No disponible | No disponible | No disponible | Hugging Face |
| Otras cuantizaciones del mismo base | No disponible | No disponible | No disponible | No disponible | No disponible |

No se dispone de datos de rendimiento ni de especificaciones completas de alternativas en la informacion proporcionada, por lo que la comparativa se limita a parametros y formato.

## Limitaciones y advertencias

- Licencia no declarada: no se especifica la licencia del checkpoint ni la del modelo base en la informacion disponible; verificar antes de cualquier uso comercial.
- Perdida de calidad por cuantizacion: aunque el promedio es de 8,639 bits/peso, el 98,143% de los pesos esta a 8 bits, lo que puede degradar tareas sensibles (matematicas, codigo, razonamiento de largo alcance) frente al BF16 original.
- Riesgo de alucinacion: inherente a los modelos de lenguaje; no se han publicado evaluaciones que cuantifiquen este riesgo en el checkpoint cuantizado.
- Sesgos: no hay informacion sobre sesgos conocidos del modelo base ni sobre como la cuantizacion los afecta.
- Dependencia de plataforma: el formato MLX limita su uso a Apple Silicon; no es desplegable en infraestructura NVIDIA/AMD sin conversion.
- Versionado: el autor re-cuantizo el checkpoint el 2026-11-11; copias anteriores pueden tener pesos distintos. Verificar el hash al descargar.
- Idiomas y contexto: sin datos publicados, no es posible garantizar cobertura multilingue ni longitud de contexto efectiva.
- Cabeza MTP: su integracion depende del runtime; un uso incorrecto puede degradar la calidad o impedir la carga del modelo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/scottlowry/Qwen3.8-27B-oQ8e-mtp
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Herramienta de cuantizacion oQ (oMLX): https://github.com/jundot/omlx
