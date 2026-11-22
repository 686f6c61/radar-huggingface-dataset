# groxaxo/Inkling-2-Mini-GPTQ-Pro-Standalone

## Resumen

Inkling 2 Mini GPTQ-Pro Standalone es una cuantizacion INT4 del modelo multimodal Inkling-2-Mini desarrollado por Thinking Machines Lab. El checkpoint, publicado por el usuario groxaxo, empaqueta los pesos originales del modelo base junto con 48 proyecciones de atencion cuantizadas con GPTQ-Pro, el tokenizer, el procesador de imagenes y un drafter de bloques DSpark para decodificacion especulativa. El objetivo es reducir el peso en disco y permitir la inferencia en una unica GPU de gama alta de consumo, como una RTX 3090.

La arquitectura subyacente es un transformer multimodal con pipeline image-text-to-text, organizado en 24 capas fisicas. El repo ocupa 19,9 GB e incluye un loader propio (`standalone_mini.py`) que expande los expertos empaquetados a BF16 en memoria host y los descarga a GPU segun necesidad, requiriendo aproximadamente 52 GB de RAM para los pesos decodificados mas el overhead de inicializacion.

La relevancia de esta ficha radica en que documenta un caso de cuantizacion agresiva con soporte de decodificacion especulativa (DSpark) sobre hardware Ampere, con licencia Apache 2.0 y un runtime de referencia verificado por el autor sobre una RTX 3090. No obstante, se trata de un artefacto de cuantizacion de terceros, no del modelo oficial, y la informacion publica disponible es limitada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (image-text-to-text) con 24 capas fisicas; pesos base cuantizados con GPTQ-Pro |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no se confirma si el modelo base es MoE) |
| Longitud de contexto | no disponible (el benchmark uso un limite de 2.048 tokens, no necesariamente el maximo del modelo) |
| Tipos de cuantizacion | INT4 simetrico con group size 64 en 48 proyecciones de atencion (value y output); resto de tensores en bytes originales del checkpoint base |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (repo de 19,9 GB) |

## Arquitectura y entrenamiento

El modelo base Inkling-2-Mini, de Thinking Machines Lab, es un transformer multimodal con capacidad de procesamiento de texto e imagenes. Esta version cuantizada mantiene intactas la mayoria de las matrices del checkpoint original y sustituye 48 proyecciones de atencion (value y output en las 24 capas fisicas) por versiones INT4 simetricas con group size 64, generadas con GPTQ-Pro. El shard base omite esas 48 matrices originales, que se reconstruyen desde los pesos cuantizados en tiempo de carga. La revision de origen del checkpoint base es `b85c3cfa615fc413cc9af3379f491b963f3b586a`.

El paquete incorpora un drafter de bloques DSpark, que consume el fichero `base/mtp.safetensors` original y propone siete tokens por paso para decodificacion especulativa. El runtime de referencia expande los expertos empaquetados a BF16 en memoria host y los descarga a GPU bajo demanda. No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset ni si el modelo base recibio RLHF o DPO.

## Capacidades

- Generacion de texto conversacional y respuesta a preguntas factuales (el smoke test del autor respondio correctamente a la capital de Francia).
- Procesamiento de imagenes con pipeline image-text-to-text (el smoke test identifico el color rojo en una imagen).
- Decodificacion especulativa mediante el drafter DSpark, con hasta siete tokens propuestos por paso.
- Inferencia en una unica GPU Ampere de consumo (RTX 3090) con el loader incluido.
- Compatibilidad con el puerto Ampere de vLLM para el resto del modelo y el drafter.
- Soporte de tool calling, agentes, razonamiento multi-paso, thinking mode, audio o capacidades multilingues: no disponible en la informacion proporcionada.

## Casos de uso

- Despliegue en estacion de trabajo con una RTX 3090: el loader de referencia permite ejecutar el modelo multimodal completo en una GPU de 24 GB, con el resto de pesos en RAM host, lo que habilita prototipado local sin infraestructura de centro de datos.
- Investigacion en cuantizacion: sirve como caso de estudio reproducible de GPTQ-Pro aplicado a proyecciones de atencion con group size 64, comparando calidad frente al checkpoint BF16 original.
- Evaluacion de decodificacion especulativa: el drafter DSpark incluido permite medir el impacto de la propuesta de siete tokens por paso en throughput de codigo (104,5 tok/s frente a 81,09 tok/s sin drafter).
- Pruebas de concepto multimodales: clasificacion de imagenes simple y respuesta a preguntas sobre imagenes en entornos offline (`HF_HUB_OFFLINE=1`), util para pipelines con requisitos de privacidad.
- Validacion de runtimes alternativos: el puerto Ampere de vLLM y el kernel CUDA nativo de GPTQ-Pro permiten comparar latencias y consumo de VRAM entre stacks de inferencia.
- Benchmarking de hardware Ampere: con contexto limitado a 2.048 tokens y vision desactivada, el modelo ofrece una referencia medible de tokens por segundo en prosa y codigo sobre una RTX 3090.

## Benchmarks y rendimiento

El autor publica una tabla de velocidad de decodificacion (mediana de tokens por segundo sobre tres ejecuciones de 256 tokens de salida por prompt) en una RTX 3090, con CUDA graphs, una secuencia a la vez, contexto limitado a 2.048 tokens y vision desactivada:

| Configuracion | Prosa (tok/s) | Codigo (tok/s) |
|---|---:|---:|
| Sin drafter, KV en BF16 | 81,34 | 81,09 |
| DSpark, KV en BF16 | 80,32 | 104,50 |
| DSpark, KV en FP8 | 67,53 | 104,85 |

El autor advierte que las ejecuciones especulativas y no especulativas divergen en secuencias greedy, por lo que los resultados describen unicamente esos dos prompts y esa configuracion de runtime. No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K u otros) en la informacion disponible.

## Requisitos de hardware

- RAM host: aproximadamente 52 GB para los pesos decodificados a BF16 mas el overhead de inicializacion.
- VRAM: no se especifica una cifra exacta; el autor confirma funcionamiento en una RTX 3090 (24 GB) con el loader de referencia y offload de expertos.
- GPU verificada: RTX 3090 (Ampere). El autor menciona un puerto Ampere de vLLM, lo que sugiere soporte en tarjetas Ampere en general; no se confirma compatibilidad con Ada, Hopper u otras arquitecturas.
- Software: Linux, CUDA, GPTQ-Pro en el commit `4a1651f80e1f890b6bd6137a8dc1b75f89c2cffb`, PyTorch 2.10.0+cu128, TorchVision 0.25.0+cu128 y Transformers 5.24.0.
- Opciones de despliegue: loader propio (`standalone_mini.py`) y puerto Ampere de vLLM en el commit `6e9d1cce3eadb9844d491de9b65dba24b9fec566`. No se menciona soporte de llama.cpp, Ollama ni TGI.
- Throughput medido: 67,53 a 104,85 tokens por segundo segun configuracion (ver tabla de benchmarks). No se publica latencia de primer token.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Notas |
|---|---|---|---|---|---|
| Inkling-2-Mini GPTQ-Pro Standalone (este) | no disponible | no disponible | INT4 GPTQ-Pro en 48 proyecciones | Apache 2.0 | Incluye drafter DSpark y loader propio; verificado en RTX 3090 |
| thinkingmachines/Inkling-2-Mini (base) | no disponible | no disponible | BF16 (original) | no disponible en la informacion | Checkpoint de referencia sin cuantizar; requiere mas VRAM |
| Otras alternativas de la misma categoria | no disponible | no disponible | no disponible | no disponible | No se dispone de datos de modelos comparables en la informacion proporcionada |

## Limitaciones y advertencias

- Artefacto de cuantizacion de terceros: no es una publicacion oficial de Thinking Machines Lab; la calidad puede diferir del checkpoint base BF16.
- Solo se cuantizan 48 proyecciones de atencion; el resto de tensores conserva los bytes originales, por lo que el ahorro de VRAM es parcial y depende del offload a RAM host.
- Requiere aproximadamente 52 GB de RAM host, lo que descarta equipos con menos memoria del sistema.
- El entorno esta fijado a versiones concretas de PyTorch, TorchVision, Transformers y GPTQ-Pro; cambios de version pueden romper el loader.
- Los benchmarks de velocidad cubren solo dos prompts, una secuencia a la vez y contexto de 2.048 tokens; no son representativos de cargas concurrentes.
- Las secuencias greedy divergen entre ejecuciones especulativas y no especulativas, lo que afecta a la reproducibilidad exacta de las salidas.
- No hay datos publicados sobre sesgos, tasa de alucinacion, cobertura idiomatica ni calidad en tareas de razonamiento.
- Aunque la licencia es Apache 2.0, conviene verificar la licencia del modelo base original antes de uso comercial, ya que no se detalla en la informacion disponible.
- El repo registra 0 descargas y 0 likes en el momento de la consulta, por lo que no existe validacion comunitaria independiente.

## Enlaces

- Hugging Face: https://huggingface.co/groxaxo/Inkling-2-Mini-GPTQ-Pro-Standalone
- Modelo base: https://huggingface.co/thinkingmachines/Inkling-2-Mini
- Repositorio GPTQ-Pro: https://github.com/groxaxo/GPTQ-Pro
- Puerto Ampere de vLLM: https://github.com/Hiutaky/vllm/tree/6e9d1cce3eadb9844d491de9b65dba24b9fec566
- Instrucciones de runtime: RUNTIME.md (incluido en el repo)
- Resumen de benchmarks: benchmark-summary.json (incluido en el repo)
- Validacion del overlay original: verification.json (incluido en el repo)
- Procedencia del standalone: standalone-verification.json (incluido en el repo)
