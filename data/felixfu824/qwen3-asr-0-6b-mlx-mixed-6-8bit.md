# felixfu824/Qwen3-ASR-0.6B-MLX-mixed-6-8bit

## Resumen

Qwen3-ASR-0.6B-MLX-mixed-6-8bit es una cuantizacion mixta de 6 y 8 bits del modelo de reconocimiento automatico del habla Qwen/Qwen3-ASR-0.6B, realizada con la libreria MLX para su ejecucion nativa en Apple Silicon. La publica el usuario independiente felixfu824, sin vinculacion con el equipo Qwen, y esta pensada originalmente para el motor de transcripcion de su aplicacion de dictado para macOS (Lamitype). El modelo base es un ASR de aproximadamente 782 millones de parametros (0,78 B) que cubre 31 idiomas.

El problema que resuelve es doble: por un lado, ofrecer una version de Qwen3-ASR que quepa y funcione con velocidad razonable en equipos Mac con memoria unificada; por otro, evitar la perdida de precision tipica de las cuantizaciones a 4 bits. Segun el autor, esta build ocupa 706 MB, practicamente lo mismo que las builds de 4 bits habituales (708 MB), pero mantiene tasas de error a menos de 0,10 puntos de la version bf16 en los nueve conjuntos de prueba evaluados.

Es relevante ahora porque demuestra que una cuantizacion mixta bien ajustada puede igualar el tamano de una 4-bit clasica con precision cercana a la de 16 bits, algo critico en ASR, donde errores de decodificacion como la repeticion desbocada o la deteccion erronea de idioma degradan mucho la salida. El autor solo ha validado ingles y mandarin; el resto de idiomas deberia funcionar pero no esta probado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base Qwen3-ASR; arquitectura concreta no detallada en la informacion) |
| Parametros totales | 782.426.112 (0,78 B) |
| Parametros activos | no aplica (no es MoE segun la informacion disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | mixta 6/8 bits (MLX), pesos en safetensors |
| Idiomas soportados | 31: zh, en, yue, ar, de, fr, es, pt, id, it, ko, ru, th, vi, ja, tr, hi, ms, nl, sv, da, fi, pl, cs, fil, fa, el, hu, mk, ro |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (MLX), tamano del repo 0,7 GB (706 MB) |

## Arquitectura y entrenamiento

No se detalla en la informacion proporcionada la arquitectura interna del modelo base Qwen3-ASR-0.6B (tipo de encoder de audio, decoder, atencion, etc.). Lo que si se sabe es que se trata de un modelo de reconocimiento automatico del habla de la familia Qwen3-ASR, con 782 millones de parametros y soporte para 31 idiomas, incluido code-switching (mezcla de idiomas, evaluado en los conjuntos ASCEND y NTU ML2021 con metricas MER).

El trabajo de este repositorio no es de entrenamiento sino de cuantizacion: una receta mixta que asigna 6 u 8 bits a distintas partes del modelo segun su sensibilidad. Segun el autor, la receta se ajusto sobre una muestra de desarrollo parcialmente solapada con los conjuntos de prueba, y al eliminar los clips solapados las conclusiones se mantienen. Las evaluaciones se hicieron con mlx-audio 0.4.2 y 0.6.4 sobre mlx 0.32.4, con las particiones de test completas, y el autor indica que entre ambas versiones de mlx-audio el modelo y el bf16 se movieron como maximo 0,17 puntos en cualquier conjunto.

## Capacidades

- Transcripcion de voz a texto (ASR) en 31 idiomas, con especial atencion a ingles y mandarin (los unicos validados por el autor).
- Reconocimiento de chino cantonés (yue) y de variedades del chino (evaluado en CV19 zh-TW y FormosaSpeech).
- Manejo de code-switching, medido con la metrica MER en ASCEND y en las clases NTU ML2021.
- Deteccion automatica del idioma (modo por defecto en mlx-audio), aunque el autor documenta que en la build de 4 bits esta deteccion falla en algunos clips; no se reporta ese fallo para esta build.
- Ejecucion nativa en Apple Silicon mediante MLX y mlx-audio.
- No se documentan en la informacion disponible capacidades de tool calling, agentes, vision ni audio generativo; es un modelo exclusivamente de reconocimiento del habla.

## Casos de uso

- Dictado en macOS: es el caso original para el que se construyo, integrado en el motor de transcripcion de la app Lamitype; su tamano de 706 MB y su ejecucion en MLX lo hacen adecuado para dictado en tiempo real en un Mac.
- Transcripcion de reuniones y clases en ingles o mandarin: el modelo rinde con WER de 2,12 en LibriSpeech clean y CER de 2,23 en AISHELL-1, lo que permite generar actas o apuntes con pocas correcciones manuales.
- Subtitulado de contenido en ingles: el WER de 4,34 en FLEURS en y de 4,61 en LibriSpeech other lo hacen util para generar subtitulos automaticos con revision ligera.
- Procesamiento de audio en chino taiwanes: el CER de 5,80 en CV19 zh-TW, frente al 11,22 de la build de 4 bits, lo hace preferible para contenido en esa variedad.
- Prototipado de pipelines ASR multilingues en local: al cubrir 31 idiomas y caber en un Mac, sirve para validar flujos de transcripcion sin depender de APIs en la nube, aunque solo ingles y mandarin estan verificados.
- Investigacion sobre cuantizacion: sirve como referencia de que una mezcla 6/8 bits puede igualar el tamano de una 4-bit con precision cercana a bf16, util para estudiar el impacto de la cuantizacion en modelos de audio.
- Transcripcion de audio con cambios de idioma: los conjuntos ASCEND y NTU ML2021 evaluan code-switching, por lo que es adecuado para conversaciones bilingues ingles-chino.

## Benchmarks y rendimiento

Datos declarados por el autor del modelo (no verificados de forma independiente). Tasa de error en %, menor es mejor. Ingles: WER; chino: CER; code-switching: MER. Comparacion con el bf16 original y con la build de 4 bits de mlx-community, todas ejecutadas por el autor con el mismo arnes.

| Conjunto de prueba | Metrica | bf16 (original) | Este modelo | 4-bit (mlx-community) |
|---|---|---:|---:|---:|
| Tamano (MB) | - | 1565 | 706 | 708 |
| LibriSpeech clean | WER | 2,12 | 2,12 | 2,41 |
| LibriSpeech other | WER | 4,52 | 4,61 | 5,14 |
| FLEURS en | WER | 4,33 | 4,34 | 4,92 |
| FLEURS zh | CER | 2,92 | 2,99 | 3,68 |
| AISHELL-1 | CER | 2,22 | 2,23 | 2,83 |
| CV19 zh-TW | CER | 5,85 | 5,80 | 11,22 |
| FormosaSpeech (133 clips) | CER | 8,06 | 8,00 | 8,96 |
| ASCEND | MER | 11,48 | 11,36 | 25,84 |
| NTU ML2021 | MER | 10,41 | 10,41 | 11,38 |

El autor documenta dos fallos de la build de 4 bits que explican parte de la diferencia: en CV19, con deteccion automatica de idioma, el 4-bit etiqueta el 4,2 % de los clips como ingles y no devuelve texto (re-ejecutados con idioma fijado a chino, su CV19 baja a 7,16, aun 1,36 puntos peor que este modelo); y en ASCEND produce repeticiones desbocadas (por ejemplo, 1.330 caracteres para una referencia de 11), con un intervalo de confianza del 95 % de 13,8 a 44,9 en ese conjunto.

## Requisitos de hardware

- VRAM/memoria: el repo ocupa 706 MB en disco; en ejecucion, con MLX sobre memoria unificada, la huella es del orden de ese tamano mas los buffers de audio y activaciones (cifra exacta no disponible).
- GPU recomendadas: Apple Silicon (M1, M2, M3, M4 y variantes Pro/Max/Ultra), ya que MLX solo se ejecuta en chips de Apple.
- Cabe en cualquier Mac con Apple Silicon; no esta pensado para GPU NVIDIA ni AMD.
- Despliegue: libreria mlx y mlx-audio (probado con mlx-audio 0.4.2 y 0.6.4 sobre mlx 0.32.4). No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Tamano | Idiomas | Licencia | Notas |
|---|---|---|---|---|---|
| Qwen3-ASR-0.6B-MLX-mixed-6-8bit (este) | 0,78 B | 706 MB | 31 | Apache 2.0 | MLX, Apple Silicon; WER 2,12 en LibriSpeech clean |
| Qwen/Qwen3-ASR-0.6B (bf16) | 0,78 B | 1565 MB | 31 | Apache 2.0 | Referencia de precision; WER 2,12 en LibriSpeech clean |
| Qwen3-ASR-0.6B 4-bit (mlx-community) | 0,78 B | 708 MB | 31 | Apache 2.0 | Mismo tamano; peor en CV19 (11,22 CER) y ASCEND (25,84 MER) |
| Whisper large-v3 | no disponible en la informacion | no disponible | no disponible | no disponible | Alternativa ASR ampliamente usada; sin datos comparativos en esta informacion |

## Limitaciones y advertencias

- Solo se han validado ingles y mandarin; los otros 29 idiomas deberian funcionar pero no estan probados por el autor.
- Es una cuantizacion independiente, no oficial del equipo Qwen; no hay respaldo ni garantia del fabricante original.
- Los resultados son ejecuciones del propio autor con su arnes; no estan verificados de forma independiente y la receta de cuantizacion se ajusto con una muestra parcialmente solapada con los conjuntos de prueba (el autor afirma que al eliminar el solapamiento las conclusiones se mantienen).
- La build de 4 bits muestra fallos de deteccion de idioma y repeticiones desbocadas; aunque no se reportan para esta build, son riesgos conocidos de la cuantizacion en ASR y conviene monitorizar la salida en produccion.
- Riesgo de alucinacion y de repeticion en audio con ruido, silencios largos o dominios alejados del entrenamiento (no cuantificado en la informacion).
- Licencia Apache 2.0, que permite uso comercial, pero al ser un derivado conviene revisar tambien las condiciones del modelo base Qwen/Qwen3-ASR-0.6B.
- Dependencia de MLX limita el despliegue a hardware Apple Silicon; no hay builds para CUDA ni CPU generica en este repositorio.
- No se dispone de datos sobre sesgos, contexto maximo de audio ni limites de duracion por clip.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/felixfu824/Qwen3-ASR-0.6B-MLX-mixed-6-8bit
- Modelo base: https://huggingface.co/Qwen/Qwen3-ASR-0.6B
- Documento de reproduccion (REPRODUCE.md): https://huggingface.co/felixfu824/Qwen3-ASR-0.6B-MLX-mixed-6-8bit/blob/main/REPRODUCE.md
- Aplicacion del autor (Lamitype): https://lamitype.com
- Paper referenciado en los tags (arXiv:2601.21337): https://arxiv.org/abs/2601.21337
