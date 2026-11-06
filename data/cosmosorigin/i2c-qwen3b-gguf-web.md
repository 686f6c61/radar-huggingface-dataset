# CosMosOrigin/i2c-qwen3b-gguf-web

## Resumen

i2c-qwen3b-gguf-web es un ajuste fino mediante QLoRA del modelo Qwen2.5-Coder-3B-Instruct, desarrollado por CosMosOrigin y orientado a responder preguntas sobre el bus I2C segun la especificacion NXP UM10204 Rev. 7.0, incluyendo citas a la norma y generacion de sketches de Arduino. El modelo parte de una base de 3.085.938.688 parametros (aproximadamente 3,1 mil millones) y hereda la arquitectura transformer decoder-only de la familia Qwen2.5.

La particularidad de esta publicacion no esta en el ajuste fino en si, sino en el formato de distribucion: los pesos estan cuantizados a Q4_K_M y divididos en cuatro fragmentos de menos de 512 MB cada uno, de modo que la libreria wllama pueda cargarlos secuencialmente en un navegador web. El primer fragmento actua como punto de entrada y el resto se localizan de forma automatica. El modelo se emplea en el Space CosMosOrigin/i2c-assistant-web.

Es relevante para desarrolladores que necesiten un asistente tecnico de dominio muy acotado (protocolo I2C) que funcione integramente en el cliente, sin backend GPU ni envio de datos a un servidor. La licencia figura como "other" y no se detallan los terminos, un punto que conviene verificar antes de cualquier uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (heredada de Qwen2.5-Coder-3B-Instruct) |
| Parametros totales | 3.085.938.688 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (la del modelo base Qwen2.5-Coder-3B-Instruct no se detalla aqui) |
| Tipos de cuantizacion | Q4_K_M (unica publicada, en cuatro fragmentos) |
| Idiomas soportados | no disponibles |
| Licencia | other (terminos no especificados) |
| Formato de pesos | GGUF dividido en cuatro partes de menos de 512 MB |
| Modelo base | Qwen/Qwen2.5-Coder-3B-Instruct |
| Metodo de ajuste | QLoRA |
| Tamano del repositorio | 1,9 GB |
| Runtime objetivo | wllama (navegador) |

## Arquitectura y entrenamiento

El modelo conserva la arquitectura del Qwen2.5-Coder-3B-Instruct: un transformer decoder-only con atencion causal, normalizacion RMSNorm, activacion SwiGLU y sesgo de atencion tipo QKV bias, caracteristico de la familia Qwen2.5. Sobre esa base se aplico un ajuste fino QLoRA, es decir, adaptadores de bajo rango entrenados sobre los pesos cuantizados del modelo original, lo que reduce drasticamente el coste de entrenamiento frente a un fine-tune completo.

El corpus de entrenamiento se centra en la especificacion del bus I2C (NXP UM10204 Rev. 7.0) y en la generacion de sketches de Arduino, con un formato de respuesta que incluye citas a la norma. No se han publicado en la informacion disponible el numero de tokens de entrenamiento, la composicion exacta del dataset, ni si hubo etapas de RLHF o DPO posteriores al ajuste supervisado. Tampoco se documentan innovaciones tecnicas adicionales mas alla de la cuantizacion Q4_K_M y el troceado del GGUF para carga incremental en el navegador mediante wllama.

## Capacidades

- Generacion de texto tecnico especializado en el protocolo I2C: direccionamiento, condiciones de start/stop, arbitraje, clock stretching, niveles de tension y temporizacion.
- Respuestas con citas a la especificacion NXP UM10204 Rev. 7.0.
- Generacion de codigo para Arduino orientado a la implementacion de maestros y esclavos I2C.
- Razonamiento sobre el modelo base Qwen2.5-Coder-3B-Instruct, que incluye capacidades de codigo y matematicas basicas.
- Ejecucion en navegador mediante wllama, con carga por fragmentos sin necesidad de backend.
- Soporte de tool calling y function calling: no disponible en la informacion proporcionada.
- Capacidades de agente multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponibles; el ajuste fino parece orientado al ingles tecnico de la norma.
- Modo thinking, vision o audio: no disponible.

## Casos de uso

- Asistente embebido en documentacion web: el modelo puede integrarse en una pagina de manual tecnico y responder dudas sobre I2C sin salir del navegador, gracias a la carga por fragmentos con wllama y a sus respuestas con citas a la norma.
- Soporte a estudiantes de electronica: un entorno de aprendizaje puede desplegar el modelo en el cliente para explicar conceptos como clock stretching o arbitraje multi-maestro, evitando costes de servidor y manteniendo la privacidad de las consultas.
- Generacion de sketches de Arduino en el navegador: el ajuste sobre codigo Arduino permite producir ejemplos de inicializacion de perifericos I2C que el usuario puede copiar directamente en el IDE.
- Validacion de configuraciones de bus: el modelo puede contrastar parametros de direccionamiento de 7 y 10 bits y advertir de conflictos de direccion en un diseno concreto.
- Herramienta de consulta offline en entornos industriales: al ejecutarse en el navegador, puede desplegarse en portatiles de campo sin conexion a servicios externos, util para tecnicos que trabajan con sensores I2C.
- Prototipado rapido de firmware: un desarrollador puede pedir al modelo un esqueleto de codigo para comunicar un microcontrolador con un sensor I2C y usarlo como punto de partida, reduciendo el tiempo de busqueda en la norma.
- Demo educativa de IA en el navegador: sirve como ejemplo tecnico de cuantizacion Q4_K_M y carga incremental de GGUF con wllama para cursos sobre despliegue de modelos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el repositorio completo ocupa 1,9 GB en Q4_K_M; en ejecucion en el navegador el consumo de memoria depende de wllama y del navegador, pero se situa en el orden de 2 a 3 GB de RAM.
- GPU recomendadas: no aplica en el caso de uso principal (inferencia en navegador via WebAssembly/WebGPU); en escritorio, cualquier GPU consumer con 4 GB o mas de VRAM puede ejecutar el GGUF Q4_K_M.
- Cabe en GPU consumer: si, en tarjetas con 4 GB o mas de VRAM (por ejemplo, GTX 1650, RTX 3050 en adelante) usando llama.cpp u otro runtime compatible con GGUF.
- Opciones de despliegue: wllama en navegador (objetivo original), llama.cpp, Ollama y otros runtimes compatibles con GGUF; vLLM y TGI no estan indicados para este formato.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| i2c-qwen3b-gguf-web | 3,09 B | no disponible | other | GGUF Q4_K_M troceado | Ajuste QLoRA para I2C, ejecutable en navegador |
| Qwen2.5-Coder-3B-Instruct | 3,09 B | no disponible en esta ficha | no disponible en esta ficha | safetensors, GGUF | Modelo base generalista de codigo |
| Qwen2.5-Coder-1.5B-Instruct | 1,5 B | no disponible en esta ficha | no disponible en esta ficha | safetensors, GGUF | Alternativa mas ligera para navegador, sin ajuste I2C |
| Modelos especializados en I2C | no disponible | no disponible | no disponible | no disponible | No se conocen alternativas publicas comparables en la informacion disponible |

## Limitaciones y advertencias

- Dominio muy restringido: el ajuste fino se limita a I2C y Arduino; fuera de ese ambito el modelo puede degradarse respecto a su base.
- Riesgo de alucinacion en referencias normativas: las citas a la especificacion NXP UM10204 Rev. 7.0 deben verificarse manualmente, ya que un modelo de 3 B puede generar numeros de seccion o valores de temporizacion incorrectos.
- Idiomas no documentados: no se especifica que idiomas soporta; es probable que el ajuste este orientado al ingles tecnico.
- Licencia "other": no se detallan los terminos de uso comercial, por lo que es necesario contactar con el autor o revisar el repositorio antes de integrarlo en un producto.
- Contexto no documentado: se desconoce la ventana de contexto efectiva tras el ajuste y la cuantizacion.
- Sin benchmarks publicados: no hay evidencia cuantitativa de calidad frente al modelo base ni frente a alternativas.
- Modelo con cero descargas y cero likes en el momento de la consulta: no hay validacion de la comunidad ni reportes de uso en produccion.
- Formato troceado especifico para wllama: otros runtimes pueden requerir la re-fusion de los cuatro fragmentos antes de cargar el GGUF.

## Enlaces

- [Hugging Face: CosMosOrigin/i2c-qwen3b-gguf-web](https://huggingface.co/CosMosOrigin/i2c-qwen3b-gguf-web)
- [Modelo base: Qwen/Qwen2.5-Coder-3B-Instruct](https://huggingface.co/Qwen/Qwen2.5-Coder-3B-Instruct)
- [wllama (runtime en navegador)](https://github.com/ngxson/wllama)
- [Space CosMosOrigin/i2c-assistant-web](https://huggingface.co/spaces/CosMosOrigin/i2c-assistant-web)
- [Especificacion NXP UM10204 Rev. 7.0 (I2C-bus specification)](https://www.nxp.com/docs/en/user-guide/UM10204.pdf)
