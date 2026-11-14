# funnygeeker/Ornith-1.5-35B-A3B-oQ5e-fp16-mtp

## Resumen

Ornith-1.5-35B-A3B-oQ5e-fp16-mtp es una cuantizacion mixta de precision del modelo Ornith-1.5-35B-A3B, publicada por el usuario funnygeeker en Hugging Face. El checkpoint emplea la herramienta oQ (oMLX v0.7.0.dev1) para producir una cuantizacion afin de 5 bits con grupos de 64, alcanzando un promedio efectivo de 5,500 bits por peso sobre el checkpoint completo. El resultado ocupa 21,8 GB en disco (20,281 GiB) y esta empaquetado en formato MLX, lo que lo orienta a la inferencia en hardware Apple Silicon.

El modelo base sigue la arquitectura `qwen3_5_moe`, es decir, un transformer de mezcla de expertos (MoE) con 35B parametros totales y 3B parametros activos por token (de ahi el sufijo A3B). El checkpoint cuantizado conserva 31,675B pesos logicos: 30,870B corresponden al modelo de lenguaje y 0,805B a la cabeza MTP (multi-token prediction), que permite decodificacion especulativa y acelera la generacion. La publicacion es relevante para quienes quieran ejecutar un MoE de 35B en equipos con memoria unificada de 32 GB o superior sin recurrir a GPUs dedicadas.

La informacion disponible es limitada: la model card solo documenta el proceso de cuantizacion y el desglose de almacenamiento, sin datos sobre entrenamiento, benchmarks, licencia ni idiomas del modelo original. Esta ficha refleja exclusivamente lo verificable en la informacion proporcionada y marca como "no disponible" todo aquello que no consta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE (tag `qwen3_5_moe`), con cabeza MTP |
| Parametros totales | 35B (modelo base); 31,675B pesos logicos en este checkpoint |
| Parametros activos | 3B (sufijo A3B del nombre) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Afin 5 bits, grupo de 64 (promedio efectivo 5,500 bits/peso); mezcla mixta de precision via oQ |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | MLX safetensors (`mlx`, `safetensors`), cuantizacion `oq` |

## Arquitectura y entrenamiento

El modelo base es un transformer de mezcla de expertos con 35B parametros totales y 3B activos por token, segun los tags del repositorio (`qwen3_5_moe`). Incorpora una cabeza MTP (multi-token prediction) de 0,805B parametros que predice varios tokens futuros de forma simultanea, lo que habilita decodificacion especulativa y mejora el throughput en inferencia. No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de RLHF o DPO.

Este checkpoint concreto no es el modelo original, sino una cuantizacion mixta de precision generada con oQ (oMLX v0.7.0.dev1). Todos los tensores se almacenan en formato afin de 5 bits con grupo de 64, lo que da un promedio efectivo de 5,500 bits por peso. El desglose de almacenamiento es: 30,870B pesos logicos del modelo de lenguaje (21,223 GB / 19,766 GiB) y 0,805B de la cabeza MTP (0,554 GB / 0,516 GiB), para un total de 21,777 GB / 20,281 GiB.

## Capacidades

- Generacion de texto y razonamiento: capacidades propias de un modelo de lenguaje de 35B parametros totales con 3B activos, aunque no se documentan tareas especificas en la informacion disponible.
- Prediccion multi-token (MTP): la cabeza dedicada permite decodificacion especulativa, acelerando la generacion respecto a un decoding autoregresivo estandar.
- Eficiencia MoE: al activar solo 3B parametros por token, el coste computacional por token es bajo en relacion con el tamano total del modelo.
- Inferencia en Apple Silicon: el formato MLX esta optimizado para GPUs integradas de la familia M1/M2/M3/M4.
- Tool calling, agentes, vision, audio y capacidades multilingues: no disponible en la informacion proporcionada.

## Casos de uso

- Inferencia local en Mac con memoria unificada: el checkpoint de 21,8 GB cabe en equipos Apple Silicon con 32 GB o mas de memoria unificada, lo que permite ejecutar un MoE de 35B en local sin GPU dedicada. Es el caso de uso principal de un checkpoint en formato MLX.
- Prototipado y desarrollo en estacion de trabajo: al ocupar 20,281 GiB, deja margen en maquinas de 32-64 GB para cargar el modelo junto con el resto del entorno de desarrollo y probar prompts y flujos sin depender de la nube.
- Generacion de texto interactiva de baja latencia: la cabeza MTP y la activacion de solo 3B parametros por token reducen el coste por token, lo que resulta adecuado para asistentes conversacionales en local.
- Evaluacion y comparacion de cuantizaciones: al ser una cuantizacion de 5 bits publicada con su desglose de bits por peso, sirve para medir la perdida de calidad frente al modelo original en tareas propias.
- Fine-tuning o adaptacion posterior: el formato safetensors permite cargar los pesos con las herramientas MLX y aplicar tecnicas de adaptacion ligera, siempre que la licencia del modelo base lo permita (no disponible).
- Despliegue en entornos con restricciones de conectividad: al ejecutarse integramente en local, encaja en escenarios donde los datos no pueden salir del dispositivo, como prototipos de procesamiento de documentos sensibles.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM/memoria estimada: 20,281 GiB de pesos en disco; en inferencia se necesita memoria adicional para el contexto KV, por lo que se recomienda un minimo de 32 GB de memoria unificada.
- GPU recomendadas: hardware Apple Silicon (M1/M2/M3/M4 Pro, Max o Ultra) con 32 GB o mas de memoria unificada, dado el formato MLX. No es compatible de forma nativa con CUDA.
- GPU consumer: cabe en Mac con 32 GB o mas; en GPUs NVIDIA no se puede ejecutar directamente sin conversion de formato.
- Opciones de despliegue: libreria MLX (mlx-lm) y el ecosistema oMLX; no se documenta soporte para vLLM, llama.cpp, Ollama o TGI en este formato.
- Latencia y throughput: no disponibles; dependen del chip Apple concreto y de la longitud de contexto.

## Comparativa con modelos similares

| Modelo | Parametros | Activos | Contexto | Formato | Licencia |
|---|---|---|---|---|---|
| Ornith-1.5-35B-A3B-oQ5e-fp16-mtp | 35B (31,675B logicos) | 3B | no disponible | MLX 5 bits | no disponible |
| Modelo base Ornith-1.5-35B-A3B | 35B | 3B | no disponible | no disponible | no disponible |
| Otras cuantizaciones del mismo modelo base | 35B | 3B | no disponible | no disponible | no disponible |

No se dispone de datos de rendimiento ni de especificaciones de modelos alternativos comparables en la informacion proporcionada.

## Limitaciones y advertencias

- La cuantizacion a 5 bits introduce perdida de precision respecto al modelo original; no se documenta la degradacion en benchmarks.
- No hay informacion sobre sesgos, riesgo de alucinacion ni limitaciones de idioma del modelo base.
- La licencia no esta disponible, por lo que no se puede confirmar el uso comercial; conviene verificar la licencia del modelo base Ornith-1.5-35B-A3B antes de cualquier despliegue en produccion.
- El formato MLX limita el despliegue a hardware Apple Silicon; no es portable a CUDA sin conversion.
- El repositorio tiene solo 31 descargas y 0 likes, y fue creado en noviembre de 2026; es una publicacion reciente y poco validada por la comunidad.
- La model card no documenta el pipeline, los idiomas ni el proceso de entrenamiento, lo que dificulta evaluar su idoneidad para tareas concretas.
- Al ser una cuantizacion de un modelo de terceros, la trazabilidad y el soporte dependen del autor del checkpoint y no del desarrollador original.

## Enlaces

- Hugging Face: https://huggingface.co/funnygeeker/Ornith-1.5-35B-A3B-oQ5e-fp16-mtp
- Herramienta de cuantizacion oQ (oMLX): https://github.com/jundot/omlx
