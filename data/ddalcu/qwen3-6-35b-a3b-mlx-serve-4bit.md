# ddalcu/Qwen3.6-35B-A3B-MLX-Serve-4bit

## Resumen

El modelo Qwen3.6-35B-A3B-MLX-Serve-4bit es una adaptación cuantizada a 4-bit del modelo Qwen/Qwen3.6-35B-A3B, realizada por el usuario ddalcu para el servidor mlx-serve de Apple Silicon. El paquete incluye el tronco del modelo (trunk) sin cambios, junto a una cabeza MTP (multi-token prediction) que permite decodificación especulativa cuando se activa con la bandera `--mtp`.

Se trata de un modelo de arquitectura MoE (mixtura de expertos) de 35.107.181.936 parámetros totales, con aproximadamente 3.000 millones de parámetros activos por token, según la nomenclatura A3B. El formato original de HuggingFace no especifica la longitud de contexto ni los idiomas en sus metadatos, aunque el benchmark incluido evalúa el modelo a 16k tokens.

La relevancia de esta versión radica en que combina una cuantización 4-bit pensada para la librería MLX con el soporte de decodificación especulativa, una técnica que puede aumentar significativamente los tokens por segundo en cargas predecibles como código, a la vez que se mantiene la licencia Apache-2.0.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | MoE (mixtura de expertos), transformer, con cabeza MTP opcional |
| Parámetros totales | 35.107.181.936 (≈35.100 millones) |
| Parámetros activos | ≈3.000 millones (según nomenclatura 'A3B') |
| Longitud de contexto | no disponible (los benchmarks evaluados incluyen 16k tokens) |
| Tipos de cuantización | 4-bit (formato MLX, safetensors) |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (paquete para mlx-serve) |

## Arquitectura y entrenamiento

La arquitectura base es un transformer con mixtura de expertos (MoE). El nombre del modelo indica 35.000 millones de parámetros totales y 3.000 millones activos (A3B), una configuración típica de la familia Qwen para reducir el coste computacional por token manteniendo una capacidad global alta. La adaptación de ddalcu añade un módulo MTP (multi-token prediction) como sidecar en mlx-serve; la cabeza se incorpora en el archivo `mtp/weights.safetensors` y sus tensores se renombraron de `fc.weight` a `mtp.fc.weight`, sin modificar los bytes.

No se proporciona información sobre los datos de entrenamiento, el número de tokens, ni si se aplicaron técnicas como RLHF o DPO durante el desarrollo del modelo base. Tampoco se conocen las innovaciones técnicas de la arquitectura original más allá del hecho de ser un MoE. La única modificación descrita es la integración de la cabeza MTP y la cuantización a 4-bit para MLX.

## Capacidades

- Generación de texto conversacional: el modelo está etiquetado con el pipeline `text-generation` y tags conversacionales, lo que lo habilita para tareas de chat.
- Decodificación especulativa con MTP: cuando se ejecuta con la bandera `--mtp`, el modelo puede anticipar varios tokens, mejorando la velocidad en secuencias predecibles como código.
- Compatibilidad con mlx-serve: los pesos están preparados para la librería MLX y se sirven en formato safetensors.
- Funcionamiento en modo normal (sin MTP): sin la bandera `--mtp`, el paquete se comporta como una cuantización 4-bit estándar del Qwen3.6-35B-A3B.
- Capacidades multimodales: no disponible en la información suministrada, aunque la versión base Qwen/Qwen3.6-35B-A3B puede tener variantes vision-language (véase PocketAiHub).
- Soporte de tool calling / function calling y agentes: no disponible en la información suministrada.

## Casos de uso

- Inferencia local en Apple Silicon: al estar cuantizado a 4-bit y empaquetado para MLX, puede ejecutarse en un Mac con M4 Max (el benchmark usa 128 GB) mediante mlx-serve, permitiendo experimentar con un modelo de 35B en equipos de Apple sin necesidad de servicios en la nube.
- Servicio de asistente conversacional en local: con el comando `mlx-serve --model ddalcu/Qwen3.6-35B-A3B-MLX-Serve-4bit --serve --mtp` se levanta una API de generación de texto accesible desde aplicaciones de chat internas o prototipos.
- Optimización de latencia en autocompletado de código: los benchmarks muestran 334 tokens/s con MTP en contenido predecible (código), lo que lo hace adecuado para editores con autocompletado, generación de scripts o herramientas de desarrollo en tiempo real.
- Investigación sobre decodificación especulativa: su cabeza MTP permite comparar el rendimiento en distintos dominios (código, prosa, contexto largo) y analizar cuándo compensa activar la decodificación especulativa en modelos MoE.
- Pruebas de rendimiento con contexto largo: aunque no se especifica el máximo, el benchmark incluye una evaluación a 16k tokens con 177 tokens/s con MTP, por lo que resulta útil para aplicaciones que manejan documentos extensos y necesitan una ventana de contexto amplia.
- Integración en proyectos de código abierto con licencia permisiva: al estar bajo Apache-2.0, puede incorporarse en sistemas comerciales y de investigación sin coste de licencia, siempre que se respeten las condiciones de atribución y redistribución.
- Prototipado de aplicaciones MoE en entornos locales: por su relación 35B totales / 3B activos, permite estudiar el comportamiento de una arquitectura de mixtura de expertos con un coste de inferencia reducido en comparación con un modelo denso del mismo tamaño.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de calidad (como MMLU, HumanEval o GSM8K) en la información disponible. El único benchmark publicado es una tabla de velocidad de decodificación realizada en un Apple Mac M4 Max de 128 GB, con la versión 26.9.2 de mlx-serve. Los valores representan tokens por segundo (tok/s) usando el script `tests/bench.sh`.

| Escenario | Sin MTP (serial) | Con MTP |
|---|---|---|
| Decodificación (llmprobe bench) | 166 tok/s | 244 tok/s |
| Contenido predecible (código) | 166 tok/s | 334 tok/s |
| Contenido novedoso (prosa) | 165 tok/s | 168 tok/s |
| Contexto 16k | 122 tok/s | 177 tok/s |
| 4 concurrencias (agregado) | 152 tok/s | 134 tok/s |

La decodificación especulativa compensa cuando los siguientes tokens son predecibles. En prosa el beneficio es marginal y con concurrencia la activación de MTP reduce el rendimiento agregado, ya que el decode por lotes ya ocupa el ancho que las rondas de borrador habrían utilizado.

## Requisitos de hardware

- Los pesos en 4-bit ocupan aproximadamente 20,9 GB (tamaño del repositorio). Para cargar el modelo y mantener la caché KV en MLX se necesita una Mac con memoria unificada suficiente; el benchmark se ejecutó en un M4 Max con 128 GB.
- GPU recomendada: no disponible para GPU NVIDIA o CUDA. Este paquete está orientado a Apple Silicon y utiliza la librería MLX (mlx-serve). En un Mac, cualquier chip M1/M2/M3/M4 con suficiente RAM puede ejecutarlo, aunque el rendimiento variará.
- Opciones de despliegue: mlx-serve (comando `--model ddalcu/Qwen3.6-35B-A3B-MLX-Serve-4bit --serve --mtp`). También se puede servir sin MTP eliminando la bandera. No se menciona compatibilidad con vLLM, llama.cpp, TGI u otros runners.
- Latencia y throughput: la tabla de benchmarks proporciona valores de 122 a 334 tokens/s según el escenario y la activación de MTP. Para 16k de contexto, se midieron 122 tok/s en modo serial y 177 tok/s con MTP.
- Consideración: el tamaño de 20,9 GB es el de los pesos; para contextos largos se recomienda memoria adicional para la caché KV.

## Comparativa con modelos similares

No se dispone de datos de rendimiento de modelos comparables en la información suministrada. Dado que este paquete es una cuantización 4-bit del modelo base Qwen/Qwen3.6-35B-A3B, la comparativa más directa es contra sus variantes MLX.

| Característica | ddalcu/Qwen3.6-35B-A3B-MLX-Serve-4bit (este) | Qwen/Qwen3.6-35B-A3B (modelo base) | PocketAiHub/Qwen3.6-35B-A3B-MLX |
|---|---|---|---|
| Arquitectura | MoE 35B / 3B activos | MoE 35B / 3B activos | MoE 35B / 3B activos |
| Cuantización | 4-bit | no disponible | 4-bit, 8-bit, bf16 |
| MTP | Sí (activable con `--mtp`) | No | No |
| Librería | mlx-serve | no disponible | MLX |
| Licencia | Apache-2.0 | Apache-2.0 | Apache-2.0 |

También existe la variante `mlx-community/Qwen3.6-35B-A3B-MTP-4bit`, que contiene la cabeza MTP sin el tronco; este paquete la integra.

## Limitaciones y advertencias

- No se dispone de información sobre sesgos, alucinación ni comportamiento ético del modelo base en la información proporcionada.
- La longitud máxima de contexto no ha sido publicada; los benchmarks muestran pruebas a 16k, pero eso no garantiza un soporte robusto a ese tamaño ni el máximo real.
- La activación de MTP no siempre mejora el rendimiento: en contenido novel (prosa) el beneficio es insignificante (168 frente a 165 tok/s) y bajo concurrencia incluso degrada el throughput agregado (134 frente a 152 tok/s).
- El modelo está diseñado específicamente para Apple Silicon con MLX; no es compatible con CUDA ni con librerías como vLLM o llama.cpp, salvo que se convierta manualmente.
- El paquete es una adaptación no oficial creada por un tercero (ddalcu), con 0 descargas y 0 likes en HuggingFace; carece de validación o garantía de soporte.
- La licencia Apache-2.0 es permisiva, pero exige incluir el aviso de licencia original en las redistribuciones y no ofrece garantías por parte de los autores.

## Enlaces

- https://huggingface.co/ddalcu/Qwen3.6-35B-A3B-MLX-Serve-4bit
- https://huggingface.co/Qwen/Qwen3.6-35B-A3B
- https://huggingface.co/mlx-community/Qwen3.6-35B-A3B-4bit
- https://huggingface.co/mlx-community/Qwen3.6-35B-A3B-MTP-4bit
- https://huggingface.co/PocketAiHub/Qwen3.6-35B-A3B-MLX/tree/main
- Comando de uso: `mlx-serve --model ddalcu/Qwen3.6-35B-A3B-MLX-Serve-4bit --serve --mtp`
