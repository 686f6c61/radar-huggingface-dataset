# caikybaldo999/zyi-2-flash

## Resumen

ZYI 2 Flash es un modelo de generacion de imagenes texto-a-imagen desarrollado por el usuario de HuggingFace `caikybaldo999`. Se trata de un modelo pequeno: un transformer de difusion (DiT) de 369 millones de parametros entrenables que trabaja junto a un encoder de texto congelado Qwen3-1.7B y un refinador de texto de dos capas. Genera imagenes de 512×512 pixeles (256 tokens latentes) y se presenta como una actualizacion de `caikybaldo999/zyi-256-flash`, del que hereda los pesos y el historial de entrenamiento.

El cambio principal respecto a la version anterior es doble: sube la resolucion de 256×256 (64 tokens, rejilla 8×8) a 512×512 (256 tokens, rejilla 16×16 con posiciones interpoladas en el 2D RoPE) y sustituye el encoder de texto `flan-t5-base` por Qwen3-1.7B, lo que aporta capacidad multilingue (la model card cita ingles, portugues y "otros idiomas") y permite procesar captions cortos o largos.

Su relevancia practica esta en el coste de entrenamiento y despliegue: el fine-tuning completo se hizo en menos de 10 horas sobre una unica NVIDIA RTX PRO 6000 de 96 GB, y la inferencia cabe en GPUs de consumo en bfloat16. La licencia es Apache 2.0. El modelo no tiene descargas ni likes en el momento de la consulta y no publica resultados de benchmarks, por lo que debe tratarse como un experimento reproducible mas que como un modelo validado para produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DiT (diffusion transformer) con flow matching; encoder de texto Qwen3-1.7B congelado + refinador de texto de 2 capas |
| Parametros totales | 369 M entrenables en el DiT + 1.700 M del encoder de texto congelado (≈2.070 M en conjunto) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible (el prompt se procesa con Qwen3-1.7B; la model card no especifica longitud maxima) |
| Tipos de cuantizacion | bfloat16 (GPU Ampere o superior) y float32 (GPU antiguas como T4, o CPU); no se publican pesos GGUF, INT8 ni NF4 |
| Idiomas soportados | ingles, portugues y otros (encoder Qwen3 multilingue; 15 % de captions en chino durante el entrenamiento); los metadatos de HuggingFace no declaran idiomas |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors; incluye codigo de inferencia propio (`zyi2.py`) que se descarga y ejecuta desde el repositorio |

## Arquitectura y entrenamiento

El modelo sigue un esquema de difusion con flow matching sobre un backbone DiT, condicionado por un encoder de texto Qwen3-1.7B que permanece congelado. Sobre la salida del encoder se anade un refinador de texto de dos capas que adapta las representaciones de Qwen3 al espacio que espera el DiT. La codificacion posicional es 2D RoPE, con posiciones interpoladas para pasar de la rejilla 8×8 de la version de 256×256 a la rejilla 16×16 de 512×512. El entrenamiento se dividio en dos fases: la fase A (1 hora) congela todo el DiT salvo las capas de cross-attention, de modo que el refinador aprenda a leer Qwen3; la fase B entrena todos los pesos a 512×512 con un desplazamiento de timestep dependiente de la resolucion y media movil de pesos (EMA).

Los datos son 566.408 imagenes de 1024 px procedentes del dataset `LucasFang/FLUX-Reason-6M`, reescaladas a 512 px, cada una con un caption corto o largo, y un 15 % de captions en chino para forzar la alineacion multilingue. El entrenamiento acumula 2.426 pasos sobre los 42.981 pasos del modelo base, con batch de 256, y se ejecuto en 3,5 horas sobre una RTX PRO 6000 de 96 GB (menos de 10 horas en total incluyendo fases previas). No se documenta uso de RLHF ni DPO; el ajuste es puramente de difusion supervisada sobre pares imagen-texto.

## Capacidades

- Generacion de imagenes texto-a-imagen a 512×512 pixeles, con 256 tokens latentes por muestra.
- Soporte de prompts multilingues, con enfasis declarado en ingles y portugues; la model card incluye ejemplos en ambos idiomas.
- Aceptacion de captions cortos y largos, gracias al encoder Qwen3-1.7B y al refinador de texto de dos capas.
- Control de semilla (`seed`) para reproducibilidad de la generacion.
- Ejecucion en bfloat16 en GPUs Ampere o posteriores y en float32 en GPUs antiguas (por ejemplo T4) o en CPU.
- API de inferencia propia (`zyi2.Zyi2Pipeline`) distribuida como script dentro del repositorio.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso, vision de entrada, audio ni modo "thinking"; es un modelo exclusivamente texto-a-imagen.

## Casos de uso

- Prototipado rapido de ilustraciones: al generar 512×512 en un modelo de ~2 GB de pesos en bf16, se puede iterar sobre conceptos visuales en una GPU de consumo antes de pasar a un modelo mayor.
- Generacion de assets para interfaces: iconos, fondos y placeholders a 512×512 que luego se reescalan o se retocan, con coste de inferencia bajo y licencia Apache 2.0 compatible con uso comercial.
- Prompts en portugues e ingles dentro del mismo pipeline: util para productos dirigidos a mercados lusofonos donde el equipo redacta prompts en portugues y no quiere depender de traduccion previa.
- Experimentacion academica con flow matching y DiT de escala pequena: el modelo es un caso reproducible (2.426 pasos, una sola GPU, hiperparametros descritos) para estudiar el cambio de encoder de texto o la interpolacion de RoPE al subir resolucion.
- Generacion por lotes en servidor con GPU modesta: al caber en tarjetas de 12-16 GB en bf16, se puede montar un servicio interno de generacion de imagenes sin adquirir hardware de datacenter.
- Filtrado y aumento de datos visuales: generar variaciones de una escena a partir de captions cortos y largos para enriquecer datasets de entrenamiento o pruebas de robustez.
- Base para fine-tuning propio: la licencia Apache 2.0 y el tamano reducido permiten reentrenar el DiT sobre un dominio concreto (por ejemplo, producto o estilo) en una sola GPU de 96 GB en menos de un dia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas cuantitativas (FID, CLIP score, GenEval, T2I-CompBench ni similares) ni comparaciones numericas con otros modelos; solo afirmaciones cualitativas sobre mejora en relaciones espaciales y conteo respecto a ZYI-256 Flash.

## Requisitos de hardware

- VRAM estimada para inferencia en bfloat16: aproximadamente 4,2 GB solo de pesos (≈2.070 M de parametros a 2 bytes) mas activaciones y buffers; en la practica, entre 6 y 8 GB. Estimacion propia, no publicada por el autor.
- VRAM estimada en float32: aproximadamente 8,3 GB de pesos; en la practica, entre 10 y 12 GB. Estimacion propia.
- GPU recomendadas: RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070/4080/4090 para bfloat16; T4 o GPU sin soporte bf16 para float32. El entrenamiento se realizo en una NVIDIA RTX PRO 6000 de 96 GB.
- Cabe en GPU de consumo: si, en cualquier tarjeta con 8 GB o mas en bfloat16 y con 12 GB o mas en float32.
- Opciones de despliegue: el repositorio incluye su propio pipeline (`zyi2.py`) que se descarga con `huggingface_hub` y se ejecuta con `torch`, `diffusers`, `transformers>=4.51` y `safetensors`. No hay integracion documentada con vLLM, TGI, Ollama ni llama.cpp, y al no publicarse pesos GGUF no es desplegable directamente en llama.cpp.
- Latencia y throughput: no disponibles. El autor no publica tiempos por imagen ni imagenes por segundo; solo el tiempo de entrenamiento (3,5 h para 2.426 pasos con batch 256 en una RTX PRO 6000).

## Comparativa con modelos similares

| Modelo | Parametros | Resolucion | Contexto de texto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ZYI 2 Flash | 369 M (DiT) + 1,7 B congelados | 512×512 (256 tokens) | Qwen3-1.7B, longitud no disponible | Apache 2.0 | HuggingFace, repo de 2,2 GB, 0 descargas |
| ZYI-256 Flash (modelo base) | no disponible en la informacion proporcionada | 256×256 (64 tokens) | flan-t5-base | no disponible en la informacion proporcionada | HuggingFace |
| Alternativas de la misma categoria (SD 1.5, PixArt-alpha, Sana) | no disponible en la informacion proporcionada | no disponible | no disponible | no disponible | no disponible |

La busqueda web realizada no devolvio informacion tecnica sobre este modelo ni sobre modelos comparables, por lo que no se pueden aportar cifras de rendimiento ni de parametros de terceros verificadas en esta ficha.

## Limitaciones y advertencias

- Relaciones espaciales y conteo: el autor reconoce que son mejores que en ZYI-256 Flash pero siguen siendo poco fiables; no debe usarse para tareas que exijan numero exacto de objetos o posiciones precisas.
- Texto legible en imagen, manos y rostros en primer plano: debilidad explicita segun la model card.
- Resolucion fija de 512×512; no se documenta soporte de otras resoluciones ni de aspect ratios distintos del cuadrado.
- Ausencia de validacion externa: 0 descargas y 0 likes en el momento de la consulta, sin benchmarks publicados; no hay evidencia independiente de calidad.
- Riesgo de alucinacion visual: como cualquier modelo generativo, puede producir contenido plausible pero incorrecto respecto al prompt, especialmente con prompts largos o composiciones complejas.
- Idiomas: aunque el encoder es multilingue, la alineacion solo se entreno de forma explicita con ingles, portugues y un 15 % de captions en chino; el comportamiento en castellano u otras lenguas no esta documentado.
- Licencia: Apache 2.0 permite uso comercial y modificacion, pero no se especifica la licencia del dataset de entrenamiento (`LucasFang/FLUX-Reason-6M`), lo que conviene verificar antes de un uso comercial.
- Seguridad del codigo: el uso recomendado descarga y ejecuta un script Python (`zyi2.py`) del repositorio mediante `importlib`; en produccion conviene auditar y fijar ese archivo a un commit concreto en lugar de ejecutarlo dinamicamente.
- Sin cuantizaciones ligeras publicadas (GGUF, INT8): el despliegue en CPU o en GPUs muy limitadas se restringe a float32.
- Sesgos: no se documenta ninguna evaluacion de sesgos demograficos, esteticos o culturales del dataset de entrenamiento.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/caikybaldo999/zyi-2-flash
- Modelo base ZYI-256 Flash: https://huggingface.co/caikybaldo999/zyi-256-flash
- Dataset de entrenamiento FLUX-Reason-6M: https://huggingface.co/datasets/LucasFang/FLUX-Reason-6M
- Paper, blog, repositorio o demo adicionales: no disponibles (la busqueda web no devolvio resultados relevantes sobre este modelo)
