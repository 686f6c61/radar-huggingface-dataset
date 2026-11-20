# addiesam/Ripple-65B-Preview-DFlash2-QVB8-5e-3

## Resumen
Ripple-65B-Preview-DFlash2-QVB8-5e-3 es un paquete de pesos cuantizados del modelo borrador (draft model) DFlash2, asociado al modelo base Ripple-65B-Preview de ricursiveAI. No se trata de un modelo generativo completo e independiente, sino de un componente auxiliar disenado para decodificacion especulativa junto al modelo objetivo Ripple-65B-Preview. Ha sido comprimido por el usuario addiesam mediante el formato propietario QVB8, que garantiza una cota de error L-infinito (tau = 0.005) sobre cada peso restaurado respecto al original en bf16.

El paquete pesa 4,1 GB en disco, contiene 49 tensores comprimidos con una media de 8,19 bits por peso y solo es cargable mediante el motor de inferencia QVB8 (version 1.1.0 o superior), no mediante `transformers` ni otras librerias convencionales. Esta orientado a reducir el coste de memoria del modelo borrador en pipelines de decodificacion especulativa, manteniendo una cota de error verificable por tensor registrada en `manifest.json`.

La relevancia actual reside en su enfoque de compresion certificada: frente a la cuantizacion tradicional evaluada por metricas medias (perplejidad, benchmarks), QVB8 acota el error maximo por peso, lo que mitiga artefactos puntuales como tokens erroneos o caracteres de otros idiomas que las metricas promedio pueden ocultar. La licencia es Apache 2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo borrador DFlash2 para decodificacion especulativa; tag `qwen3` en Hugging Face) |
| Parametros totales | 472.320 (segun safetensors del repo) |
| Parametros activos | no aplica (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | QVB8 con tau = 0.005; media de 8,19 bits por peso en los 49 tensores comprimidos |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | QVB8 (safetensors como contenedor); requiere el motor QVB8, no cargable en `transformers` |

## Arquitectura y entrenamiento
No se dispone de informacion sobre la arquitectura interna del modelo borrador DFlash2 mas alla de su funcion: actua como drafter en un esquema de decodificacion especulativa junto al modelo objetivo Ripple-65B-Preview. El tag `qwen3` en el repositorio sugiere una base derivada de la familia Qwen3, pero no se confirma en la model card. Tampoco se detallan datos de entrenamiento, numero de tokens, composicion del dataset ni si hubo RLHF o DPO.

La innovacion tecnica destacable no esta en el entrenamiento sino en el proceso de compresion. Cada matriz de pesos se empaqueta con un ancho de bits por fila y se verifica tras el empaquetado: el error maximo entre el valor restaurado y el peso original en bf16 se registra por tensor en `manifest.json` (`max_err`) y ningun tensor supera tau = 0.005. El empaquetado no utiliza datos de calibracion y depende unicamente de los pesos. El paquete esta certificado para restauracion tanto en fp16 como en bf16 (`restore: fp16+bf16`).

## Capacidades
- Generacion de tokens como modelo borrador en decodificacion especulativa: propone secuencias candidatas que el modelo objetivo Ripple-65B-Preview verifica, acelerando la generacion.
- No es un modelo autonomo: no puede usarse para generacion de texto independiente sin el modelo objetivo y el motor QVB8.
- Soporte de tool calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible como capacidad propia del borrador.
- Capacidades multilingues: no disponible.
- Capacidades especiales (vision, audio, thinking mode): no disponible.

## Casos de uso
- Aceleracion de inferencia del modelo Ripple-65B-Preview: emparejando este paquete borrador (4,1 GB) con un paquete objetivo de la tabla (por ejemplo, QVB8-2e-3 de 49 GB), se habilita decodificacion especulativa en el motor QVB8, reduciendo el numero de pasos del modelo grande por token generado.
- Despliegue en hardware con VRAM limitada: al ocupar solo 4,1 GB, el borrador deja mas memoria disponible para el modelo objetivo y la cache KV, lo que permite ejecutar el pipeline completo en configuraciones mas ajustadas.
- Servidores de chat de baja latencia: la decodificacion especulativa reduce el tiempo por token en cargas interactivas; el borrador certificado evita que errores de cuantizacion introduzcan tokens corruptos en las respuestas.
- Pipelines multi-GPU: el motor QVB8 v1.1.0 admite reparto por pipeline (`--pipeline cuda:0,cuda:1`) y workers remotos, por lo que el borrador puede ubicarse en una GPU secundaria junto al objetivo.
- Offload de cache KV a RAM del sistema: combinando `--kv-window` y `--kv-host` con el reducido peso del borrador, se pueden servir contextos largos en equipos con memoria unificada o limitada.
- Investigacion sobre cuantizacion certificada: el paquete sirve como caso de estudio reproducible de compresion con cota L-infinito verificable por tensor, comparando `max_err` en `manifest.json` frente a formatos de cuantizacion basados en promedios.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware
- VRAM estimada para inferencia: 4,1 GB para los pesos del borrador; hay que sumar la VRAM del paquete objetivo (entre 35,5 GB y 57 GB segun tau y formato) y la cache KV.
- GPU recomendadas: el motor incluye kernels CUDA precompilados para DGX Spark (sm_121a) y V100 (sm_70); se admite reparto multi-GPU en una maquina y workers remotos entre maquinas.
- Cabe en GPU de consumo: el borrador por si solo si (4,1 GB), pero el pipeline completo requiere el modelo objetivo, por lo que en GPUs de consumo solo es viable con paquetes objetivo pequenos y offload de cache KV a RAM.
- Opciones de despliegue: exclusivamente el motor QVB8 v1.1.0 o superior (repositorio en GitHub); no compatible con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Cargable en transformers |
|---|---|---|---|---|---|
| Ripple-65B-Preview-DFlash2-QVB8-5e-3 (este) | 472.320 | no disponible | QVB8 | Apache 2.0 | No |
| Ripple-65B-Preview-DFlash2-QVB8R-5e-3 | no disponible | no disponible | QVB8R | Apache 2.0 | No |
| Ripple-65B-Preview-DFlash2 (original) | no disponible | no disponible | bf16 | no disponible | no disponible |

No se dispone de datos de rendimiento para comparar con alternativas de otros autores.

## Limitaciones y advertencias
- No es un modelo autonomo: requiere el modelo objetivo Ripple-65B-Preview y el motor QVB8; no carga en `transformers` ni en otros motores.
- La cota L-infinito cubre unicamente los pesos almacenados; no garantiza que las respuestas sean identicas a las del original ni correctas. Diferencias de motor, tamano de lote u orden de operaciones en coma flotante producen salidas ligeramente distintas.
- Solo se publican 472.320 parametros en safetensors, un dato que probablemente no refleja el tamano real del modelo borrador; conviene tratarlo con cautela.
- Idiomas soportados, contexto y sesgos: no disponibles en la informacion proporcionada.
- Riesgo de alucinacion: inherente al modelo objetivo; el borrador no lo corrige.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero el modelo base y el motor QVB8 pueden tener condiciones propias que deben revisarse.
- Dependencia de una version minima del motor (v1.1.0) y de ficheros auxiliares (`manifest.json`, `escape_tables.json`) para la verificacion de integridad.

## Enlaces
- Repositorio Hugging Face: https://huggingface.co/addiesam/Ripple-65B-Preview-DFlash2-QVB8-5e-3
- Modelo base: https://huggingface.co/ricursiveAI/Ripple-65B-Preview-DFlash2
- Motor QVB8: https://github.com/addiesam/qvb8
- Release v1.1.0 del motor: https://github.com/addiesam/qvb8/releases/tag/v1.1.0
- Paquete borrador alternativo QVB8R: https://huggingface.co/addiesam/Ripple-65B-Preview-DFlash2-QVB8R-5e-3
- Paquete objetivo QVB8 tau 1e-3: https://huggingface.co/addiesam/Ripple-65B-Preview-QVB8-1e-3
- Paquete objetivo QVB8 tau 2e-3: https://huggingface.co/addiesam/Ripple-65B-Preview-QVB8-2e-3
- Paquete objetivo QVB8 tau 2.5e-3: https://huggingface.co/addiesam/Ripple-65B-Preview-QVB8-2.5e-3
- Paquete objetivo QVB8R tau 1e-3: https://huggingface.co/addiesam/Ripple-65B-Preview-QVB8R-1e-3
- Paquete objetivo QVB8R tau 2e-3: https://huggingface.co/addiesam/Ripple-65B-Preview-QVB8R-2e-3
- Paquete objetivo QVB8R tau 2.5e-3: https://huggingface.co/addiesam/Ripple-65B-Preview-QVB8R-2.5e-3
