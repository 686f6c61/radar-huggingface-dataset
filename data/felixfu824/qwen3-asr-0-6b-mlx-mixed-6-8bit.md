# felixfu824/Qwen3-ASR-0.6B-MLX-mixed-6-8bit

## Resumen

Qwen3-ASR-0.6B-MLX-mixed-6-8bit es una cuantizacion mixta de 6 y 8 bits, en formato MLX, del modelo de reconocimiento automatico del habla Qwen/Qwen3-ASR-0.6B desarrollado por el equipo Qwen. La build la publica el usuario independiente felixfu824, que no tiene vinculacion con el equipo Qwen, pensada para ejecutarse en Apple Silicon a traves de la libreria mlx-audio. El modelo base forma parte de la familia Qwen3-ASR, que incluye versiones de 1.7B y 0.6B y que se apoya en la capacidad de comprension de audio del modelo fundacional Qwen3-Omni para cubrir identificacion de idioma y transcripcion en 52 idiomas y dialectos.

El objetivo de esta cuantizacion es reducir el peso del modelo de 1.565 MB en bf16 a 706 MB, practicamente el mismo tamano que las builds de 4 bits habituales (708 MB), pero manteniendo una tasa de error muy proxima a la del modelo original: como maximo 0,10 puntos peor en los nueve conjuntos de prueba evaluados con mlx-audio 0.4.2 y 0.6.4. Frente a la build de 4 bits de mlx-community, la mejora es notable en chino (por ejemplo, 2,99 % de CER frente a 3,68 % en FLEURS zh, y 5,80 % frente a 11,22 % en Common Voice 19 zh-TW).

La relevancia practica esta en que permite dictado y transcripcion local en Macs con memoria unificada modesta sin renunciar apenas a precision. El autor la desarrollo para Lamitype, su aplicacion de dictado para macOS, y la publico para la comunidad con la advertencia explicita de que solo se han probado ingles y mandarin, aunque el resto de idiomas de Qwen3-ASR deberia funcionar.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible (modelo base Qwen3-ASR, derivado de Qwen3-Omni; reconocimiento automatico del habla) |
| Parametros totales | 782.426.112 (dato real de safetensors); denominacion comercial 0.6B |
| Parametros activos | No aplica (no es MoE segun la informacion disponible) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | Mixta 6/8 bits en MLX (quantized, mixed-precision); tamano 706 MB |
| Idiomas soportados | 31 declarados: zh, en, yue, ar, de, fr, es, pt, id, it, ko, ru, th, vi, ja, tr, hi, ms, nl, sv, da, fi, pl, cs, fil, fa, el, hu, mk, ro (la familia Qwen3-ASR cubre 52 idiomas y dialectos) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (formato MLX) |

## Arquitectura y entrenamiento

La informacion disponible no detalla la arquitectura interna del modelo base Qwen3-ASR-0.6B. Segun el repositorio oficial de QwenLM, la familia Qwen3-ASR aprovecha la capacidad de comprension de audio de su modelo fundacional Qwen3-Omni y se entrena con datos de habla a gran escala; la ficha de esta cuantizacion no aporta el numero de tokens de entrenamiento ni la composicion del dataset, ni si hubo RLHF o DPO.

Lo que si esta documentado es el proceso de cuantizacion: una build mixta 6/8 bits generada con un agente Claude Opus 5.5 para la aplicacion Lamitype, calibrada sobre una muestra de desarrollo parcialmente solapada con los conjuntos de prueba. El autor senala que, eliminando los clips solapados, las conclusiones se mantienen, y que la receta se valido con mlx-audio 0.4.2 y 0.6.4, con mlx 0.32.4. El modelo esta pensado para el runtime mlx-audio y para speech-swift, el motor que usa Lamitype.

## Capacidades

- Reconocimiento automatico del habla (transcripcion de audio a texto) en ingles y mandarin con calidad contrastada; el resto de idiomas declarados deberia funcionar pero no se ha probado.
- Identificacion automatica de idioma, heredada de la familia Qwen3-ASR (que cubre 52 idiomas y dialectos).
- Manejo de cambio de codigo (code-switching), evaluado con tasa de error mixta en los conjuntos ASCEND y NTU ML2021.
- Transcripcion de audio en chino tradicional y variantes regionales (Common Voice 19 zh-TW, FormosaSpeech).
- Ejecucion local en Apple Silicon mediante MLX, sin necesidad de GPU dedicada ni de conexion a servicios en la nube.
- No se documentan en la informacion disponible capacidades de tool calling, agentes, vision ni audio generativo.

## Casos de uso

- Dictado en macOS: es el escenario para el que se creo la build, integrada en el motor de transcripcion de Lamitype; con 706 MB cabe comodamente en la memoria unificada de un Mac y ofrece tasas de error casi identicas al modelo bf16 de 1.565 MB.
- Transcripcion de reuniones y clases en ingles o mandarin: el modelo rinde con 4,34 % de WER en FLEURS en_us y 2,99 % de CER en FLEURS zh, suficiente para actas y notas automaticas procesadas en local.
- Subtitulado de contenido audiovisual en chino: los resultados en Common Voice 19 zh-TW (5,80 % de CER) y FormosaSpeech (8,00 % de CER) lo hacen util para generar subtitulos de material en mandarin y variantes taiwanesas.
- Prototipado de aplicaciones de voz en Mac: al ser una build MLX con licencia Apache 2.0, sirve para validar pipelines de ASR en equipos de desarrollo Apple antes de escalar a un despliegue en servidor.
- Procesamiento por lotes de audio en portatiles: el reducido peso permite transcribir archivos de forma masiva en un MacBook sin agotar la memoria frente a builds de mayor precision.
- Investigacion sobre cuantizacion de modelos de voz: la model card documenta el proceso, las comparativas con 4, 5, 6 y 8 bits y las herramientas de reproduccion (REPRODUCE.md, results/), lo que permite replicar el estudio o comparar recetas de cuantizacion mixta.
- Integracion en herramientas de accesibilidad: transcripcion local de voz a texto para usuarios con movilidad reducida sin enviar audio a terceros.

## Benchmarks y rendimiento

Tasa de error en %, menor es mejor. Ingles: WER; chino: CER; cambio de codigo: tasa de error mixta (MER). Ejecutado con mlx-audio 0.6.4 y mlx 0.32.4 sobre las particiones de prueba completas. Todos los resultados son ejecuciones propias del autor de la cuantizacion.

| Build | MB | LS clean | LS other | FLEURS en | FLEURS zh | AISHELL-1 | CV19 zh-TW | Formosa (133 clips) | ASCEND | NTU ML21 |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| bf16 (pesos originales de Qwen) | 1565 | 2,12 | 4,52 | 4,33 | 2,92 | 2,22 | 5,85 | 8,06 | 11,48 | 10,41 |
| Este modelo (mixta 6/8 bits) | 706 | 2,12 | 4,61 | 4,34 | 2,99 | 2,23 | 5,80 | 8,00 | 11,36 | 10,41 |
| 4 bits (mlx-community) | 708 | 2,41 | 5,14 | 4,92 | 3,68 | 2,83 | 11,22 | 8,96 | 25,84 | 11,38 |

Notas del autor: los resultados de 4 bits incluyen dos fallos de mlx-audio. Con deteccion automatica de idioma, la build de 4 bits etiqueta el 4,2 % de los clips de CV19 como ingles y no devuelve texto; reejecutados con idioma fijado a chino, obtiene 7,16 % en CV19, aun 1,36 puntos peor que este modelo. Tambien se observan repeticiones desbocadas en algunos clips de ASCEND (por ejemplo, 1.330 caracteres para una referencia de 11), lo que hace inestable su puntuacion (IC 95 %: 13,8-44,9). Estos resultados no estan verificados de forma independiente (verified: false en el model-index).

## Requisitos de hardware

- VRAM/memoria: aproximadamente 706 MB para los pesos en esta cuantizacion mixta 6/8 bits, mas el consumo del runtime; el modelo bf16 equivalente ocupa 1.565 MB.
- Hardware objetivo: Apple Silicon (M1, M2, M3, M4 y posteriores) con memoria unificada; la build esta pensada para Macs, incluidos portatiles con 8-16 GB.
- GPU dedicadas (A100, H100, RTX 4090): no es el objetivo de esta build, que usa el backend MLX. Para CUDA habria que recurrir a los pesos originales o a otra cuantizacion.
- Opciones de despliegue: mlx-audio (versiones 0.4.2 y 0.6.4 validadas) y speech-swift; no se mencionan vLLM, llama.cpp, Ollama ni TGI para esta build MLX.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Tamano | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|---|
| Qwen3-ASR-0.6B-MLX-mixed-6-8bit (esta ficha) | 782,4 M | 706 MB | No disponible | Apache 2.0 | Hugging Face (felixfu824) | Mejor precision que 4 bits con tamano casi identico |
| Qwen3-ASR-0.6B (bf16 original) | 0.6B | 1.565 MB | No disponible | Apache 2.0 | Hugging Face (Qwen) | Referencia de maxima precision; requiere el doble de memoria |
| Qwen3-ASR-0.6B 8-bit (mlx-community) | 0.6B | No disponible | No disponible | Apache 2.0 | mlxcommunity.com / Hugging Face | Build de 8 bits de la comunidad MLX; el autor la incluye en su comparativa de 8, 6 y 5 bits en REPRODUCE.md |
| Qwen3-ASR-1.7B | 1.7B | No disponible | No disponible | No disponible | GitHub QwenLM/Qwen3-ASR | Version mayor de la misma familia, 52 idiomas y dialectos; requiere mas memoria |

## Limitaciones y advertencias

- Solo se han probado ingles y mandarin; el resto de los 31 idiomas declarados no esta validado y puede degradarse.
- La cuantizacion mixta introduce errores ligeramente superiores al bf16 (hasta 0,10 puntos en los conjuntos evaluados), aunque el autor la considera dentro de margen aceptable.
- La receta de cuantizacion se ajusto sobre una muestra de desarrollo parcialmente solapada con los conjuntos de prueba; el autor argumenta que las conclusiones se mantienen al eliminar el solapamiento, pero conviene revisar REPRODUCE.md.
- Los resultados son ejecuciones propias no verificadas de forma independiente (verified: false); no se han publicado en un paper revisado.
- La build de 4 bits de referencia muestra fallos de mlx-audio (sin texto con deteccion automatica de idioma y repeticiones desbocadas), lo que sugiere que el runtime puede afectar a la estabilidad de las cuantizaciones agresivas.
- Es una cuantizacion independiente sin afiliacion ni respaldo del equipo Qwen; el autor recomienda verificar por cuenta propia antes de usarla en produccion.
- No hay datos disponibles sobre sesgos, riesgo de alucinacion en la transcripcion, contexto maximo de audio ni latencia.
- Licencia Apache 2.0: permite uso comercial, pero se debe conservar el aviso de licencia y atribucion; el modelo base Qwen3-ASR-0.6B tambien es Apache 2.0 segun los metadatos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/felixfu824/Qwen3-ASR-0.6B-MLX-mixed-6-8bit
- Modelo base: https://huggingface.co/Qwen/Qwen3-ASR-0.6B
- Repositorio oficial de la familia Qwen3-ASR: https://github.com/QwenLM/Qwen3-ASR
- Build de 8 bits de mlx-community: https://mlxcommunity.com/models/qwen3-asr-0-6b-8bit
- Aplicacion Lamitype: https://lamitype.com
- Paper referenciado en los tags (arXiv:2601.21337): no disponible como enlace directo en la informacion proporcionada
- REPRODUCE.md y carpeta results/: referenciados en la model card del repositorio de Hugging Face
