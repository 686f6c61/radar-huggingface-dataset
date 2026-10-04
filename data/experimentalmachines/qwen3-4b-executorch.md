# experimentalmachines/Qwen3-4B-ExecuTorch

## Resumen

Qwen3-4B-ExecuTorch es un repositorio de exportaciones del modelo Qwen/Qwen3-4B (revision `1cfa9a720891`) preparadas para inferencia en dispositivo con el runtime ExecuTorch 1.4.0. Lo publica el usuario experimentalmachines, vinculado al proyecto Experimental Machines, y su objetivo no es entrenar un modelo nuevo sino empaquetar un modelo de 4.000 millones de parametros en ficheros `.pte` listos para ejecutarse en moviles Android arm64, sin necesidad de servidor ni conexion de red.

El repositorio cubre tres backends: XNNPACK para CPU, Vulkan para GPU y MediaTek NeuroPilot para la NPU del SoC MT6991 (Dimensity 9400). Para cada backend se ofrecen variantes con ventana de contexto fija de 2.048, 4.096, 8.192, 16.384 y 32.768 tokens en el caso de XNNPACK y Vulkan, y de 2.048 y 4.096 tokens en el caso de NeuroPilot. El coste de la cache KV se reserva por completo en el momento de cargar el modelo, de modo que la eleccion de ventana determina directamente el presupuesto de memoria del dispositivo.

La relevancia de esta publicacion es practica: permite ejecutar un modelo de la familia Qwen3 de 4B en telefono con cuantizaciones de 4 bits para pesos y 8 bits para activaciones (8da4w con GPTQ) o a16w8 en NPU, con tamanos de fichero que van de 2,66 GB a 3,61 GB segun backend y ventana. Se distribuye bajo licencia Apache 2.0, igual que el modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (heredada de Qwen/Qwen3-4B); el repositorio no detalla la arquitectura interna del modelo base |
| Parametros totales | Aproximadamente 4.000 millones (modelo base Qwen3-4B) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | Ventanas fijas por fichero: 2.048, 4.096, 8.192, 16.384 y 32.768 tokens en XNNPACK y Vulkan; 2.048 y 4.096 tokens en MediaTek NeuroPilot |
| Tipos de cuantizacion | 8da4w (GPTQ) en XNNPACK y Vulkan; a16w8 en MediaTek NeuroPilot |
| Idiomas soportados | No disponible en esta ficha (la model card no especifica idiomas) |
| Licencia | Apache 2.0 |
| Formato de pesos | `.pte` (ExecuTorch); incluye `tokenizer.json`, `config.json` por backend y `export-report-<window>.json` por fichero |
| Modelo base | Qwen/Qwen3-4B, revision `1cfa9a720891` |
| Runtime requerido | ExecuTorch 1.4.0 o compatible |
| Backends soportados | XNNPACK (CPU arm64), Vulkan (GPU arm64), MediaTek NeuroPilot MT6991 |
| Tamano del repositorio | 55,3 GB |
| Descargas / likes | 71 descargas, 0 likes |
| Fecha de creacion / actualizacion | 2026-09-13 / 2026-10-04 |

## Arquitectura y entrenamiento

Este repositorio no contiene entrenamiento ni ajuste alguno: es una distribucion de pesos ya entrenados. El modelo subyacente es Qwen3-4B, un transformer denso de la familia Qwen3 desarrollado por Alibaba Qwen, y lo que anade experimentalmachines es la cadena de exportacion a ExecuTorch junto con las variantes cuantizadas por backend. La cuantizacion 8da4w emplea GPTQ para los pesos de 4 bits con activaciones de 8 bits, mientras que la ruta de MediaTek usa a16w8. El repositorio no documenta el numero de tokens de entrenamiento, la composicion del dataset ni si hubo fases de RLHF o DPO, ya que esos datos corresponden al modelo base y no se reproducen aqui.

La innovacion tecnica relevante esta en el empaquetado y la gestion de memoria, no en el modelo. Cada fichero `.pte` lleva incrustada una ventana de contexto fija, porque el runtime reserva la cache KV completa al cargar: a 2.048 tokens son 294.912 bytes por token en fp32 y 603.979.776 bytes en total; a 4.096 tokens, 1.207.959.552 bytes; a 8.192 tokens, 2.415.919.104 bytes; a 16.384 tokens, 4.831.838.208 bytes; y a 32.768 tokens, 9.663.676.416 bytes. Cada `config.json` incluye un campo `fits_phone_budget` que estima la viabilidad contra un presupuesto de 5 GB en telefono. Los ficheros de NeuroPilot se reparten en cuatro trozos por ventana (tres de 1,10 GB y uno de 1,49 GB, unos 4,79 GB por ventana) y comparten una tabla de embeddings fp32 leida desde disco (`Qwen3-4B-neuropilot-embedding-fp32.bin`).

## Capacidades

- Generacion de texto autoregresiva, que es la unica capacidad declarada explicitamente en el repositorio (`pipeline_tag: text-generation`).
- Razonamiento, generacion de codigo y matematicas: son capacidades del modelo base Qwen3-4B, pero este repositorio no las verifica ni documenta tras la cuantizacion, por lo que no pueden darse por confirmadas a estos niveles de precision.
- Modo de pensamiento (thinking): no documentado en este repositorio.
- Tool calling y function calling: no documentado en este repositorio.
- Uso en agentes y razonamiento multi-paso: no documentado en este repositorio.
- Capacidades multilingues: no disponibles en esta ficha; la model card no enumera idiomas.
- Capacidades de vision o audio: no disponibles; el modelo es exclusivamente de texto.
- Inferencia totalmente local y sin red: es la caracteristica funcional central del paquete, ya que todos los ficheros estan pensados para ejecutarse en el dispositivo.

## Casos de uso

- Asistente conversacional en Android sin conexion: empaquetando el fichero XNNPACK de 2k o 4k (2,66 GB de pesos) mas la cache KV correspondiente, se puede ofrecer un chat local en cualquier telefono arm64 sin enviar datos a la nube.
- Aplicaciones con requisitos de privacidad estrictos: al ejecutarse integramente en el dispositivo, el texto del usuario nunca sale del terminal, lo que encaja en sanidad, legal o banca donde no se permite procesar contenido en servidores de terceros.
- Despliegue sobre NPU en gama alta MediaTek: los ficheros para MT6991 (Dimensity 9400) permiten descargar el trabajo de inferencia a la NPU con cuantizacion a16w8, reduciendo consumo energetico frente a la ruta CPU.
- Aceleracion por GPU en movil: la variante Vulkan (3,42 GB a 2k, 3,61 GB a 32k) aprovecha la GPU del SoC cuando la CPU no da el rendimiento necesario para respuestas interactivas.
- Procesamiento de documentos largos en local: la ventana de 16.384 o 32.768 tokens de XNNPACK permite resumir o consultar documentos extensos, asumiendo el coste de memoria de 4,83 GB o 9,66 GB de cache KV respectivamente.
- Evaluacion y benchmarking de aceleradores: el proyecto Experimental Machines publica mediciones de aceleradores de IA a escala de centro de datos, portatil y telefono, de modo que estos `.pte` sirven como carga de trabajo de referencia para comparar CPU, GPU y NPU.
- Integracion en la aplicacion openweights: el repositorio esta preparado para consumirse directamente desde esa app Android, lo que facilita demostraciones y pruebas de campo sin escribir un runtime propio.
- Prototipado de producto edge: equipos que quieran validar una idea de funcionalidad basada en LLM en movil antes de invertir en infraestructura pueden partir de estos binarios ya exportados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio unicamente documenta pruebas de humo (smoke test) cualitativas: las cinco variantes XNNPACK pasaron generando la palabra "Paris" como respuesta, mientras que las variantes Vulkan y MediaTek NeuroPilot solo fueron verificadas estructuralmente, ya que no habia runtime de NPU disponible en el equipo anfitrion. No hay datos de MMLU, HumanEval, GSM8K ni de latencia o throughput.

| Variante | Estado de verificacion |
|---|---|
| XNNPACK 2k, 4k, 8k, 16k, 32k | Smoke test superado (respuesta "Paris") |
| Vulkan 2k, 4k, 8k, 16k, 32k | Solo comprobacion estructural (sin runtime NPU en el host) |
| MediaTek NeuroPilot 2k y 4k | Solo comprobacion estructural (sin runtime NPU en el host) |

## Requisitos de hardware

- Plataforma: cualquier dispositivo arm64 para XNNPACK y Vulkan; la ruta NeuroPilot exige un SoC MediaTek MT6991 (Dimensity 9400).
- Peso en disco de los ficheros: 2,66 GB (XNNPACK 2k) a 2,72 GB (XNNPACK 32k); 3,42 GB (Vulkan 2k) a 3,61 GB (Vulkan 32k); unos 4,79 GB por ventana en la ruta NeuroPilot, repartidos en cuatro trozos.
- Cache KV reservada al cargar: 604 MB a 2k, 1,21 GB a 4k, 2,42 GB a 8k, 4,83 GB a 16k y 9,66 GB a 32k (fp32).
- Presupuesto de referencia: el campo `fits_phone_budget` de cada `config.json` evalua la viabilidad contra un presupuesto de 5 GB.
- Viabilidad en telefono: con 5 GB de presupuesto, las ventanas de 2k y 4k son las realistas para la ruta NeuralPilot y para una parte de telefonos en la ruta XNNPACK; las ventanas de 16k y 32k requieren varios gigabytes solo de cache KV y quedan fuera de la mayoria de moviles.
- Cabe en GPU de consumo: no aplica directamente, ya que los artefactos son para movil; no se ha publicado ninguna ruta de escritorio para estos `.pte`.
- Opciones de despliegue: runtime ExecuTorch 1.4.0 o superior, y la aplicacion Android openweights. No hay indicios de soporte para vLLM, llama.cpp, Ollama o TGI, que trabajan con otros formatos.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Plataforma objetivo |
|---|---|---|---|---|---|
| Qwen3-4B-ExecuTorch (este repositorio) | ~4.000 M | Ventanas de 2k a 32k incrustadas en el fichero | `.pte` (ExecuTorch), 8da4w o a16w8 | Apache 2.0 | Android arm64: CPU XNNPACK, GPU Vulkan, NPU MT6991 |
| Qwen/Qwen3-4B (modelo base) | ~4.000 M | No disponible en esta ficha | safetensors | Apache 2.0 | Servidor o escritorio con GPU |
| Otras distribuciones on-device de Qwen3-4B (GGUF, MLX, etc.) | No disponible | No disponible | No disponible | No disponible | No disponible |

La comparacion con benchmarks frente a alternativas no esta disponible, ya que ni este repositorio ni la informacion recopilada aportan resultados numericos. La diferencia verificable frente al modelo base es el formato y la plataforma: aqui los pesos vienen preempaquetados y cuantizados para ExecuTorch, mientras que el original se distribuye en safetensors para inferencia en servidor.

## Limitaciones y advertencias

- La cuantizacion a 4 bits en pesos (8da4w o a16w8) degrada la calidad respecto al modelo Qwen3-4B original; el repositorio no cuantifica esa perdida con benchmarks.
- Solo se ha verificado el funcionamiento de las variantes XNNPACK mediante una prueba de humo. Las variantes Vulkan y MediaTek NeuroPilot no se han ejecutado en el momento de la publicacion, por lo que su correccion funcional no esta confirmada.
- La ventana de contexto queda fijada en el propio fichero y no es ajustable en tiempo de ejecucion; ademas, la cache KV se reserva entera al cargar, de modo que elegir una ventana mayor consume memoria de forma permanente aunque no se use.
- Riesgo de alucinacion inherente a un modelo generativo de 4B cuantizado; no se documentan evaluaciones de fiabilidad.
- Sesgos conocidos: no disponibles en la informacion proporcionada.
- Cobertura idiomatica: no disponible; la model card no enumera idiomas soportados ni garantiza calidad en castellano.
- Restricciones de licencia: Apache 2.0 permite uso comercial y modificacion, pero no se documenta la procedencia completa del dataset de entrenamiento del modelo base.
- El repositorio ocupa 55,3 GB, lo que exige espacio de almacenamiento considerable incluso descargando solo una variante.
- No hay soporte declarado para tool calling, agentes ni modo de pensamiento en este paquete, a diferencia de lo que puede ofrecer el modelo base en otros formatos.
- Sin datos de latencia ni throughput, no es posible planificar un despliegue en produccion con garantias de rendimiento.

## Enlaces

- Repositorio del modelo: https://huggingface.co/experimentalmachines/Qwen3-4B-ExecuTorch
- Modelo base Qwen/Qwen3-4B: https://huggingface.co/Qwen/Qwen3-4B
- Licencia del modelo base: https://huggingface.co/Qwen/Qwen3-4B/blob/main/LICENSE
- Aplicacion openweights para Android: https://github.com/alpharomercoma/openweights
- Sitio del proyecto Experimental Machines: https://experimentalmachines.org/
