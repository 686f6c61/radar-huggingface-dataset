# basyauma-tech/Haas-ja-v1.0-mlx-8bit

## Resumen

Haas-ja-v1.0-mlx-8bit es una conversion no oficial del modelo de reconocimiento automatico del habla (ASR) en japones third-intelligence/Haas-ja-v1.0 al formato MLX, con las capas lineales cuantizadas a 8 bits. La publica el usuario basyauma-tech y esta pensada exclusivamente para su ejecucion en Macs con Apple Silicon, eliminando la dependencia de NeMo, CUDA, Triton o PyTorch. El modelo original lo desarrolla Third Intelligence, Inc., y esta ficha describe unicamente la variante cuantizada.

Se trata de un modelo especializado en transcripcion de audio japones, con 615.871.520 parametros (aproximadamente 0,62 mil millones) y un peso en disco de unos 0,73 GB, lo que supone cerca del 59 % del tamano de la version bf16. La arquitectura subyacente es del tipo FastConformer con decodificacion TDT (Token-and-Duration Transducer), segun las etiquetas del repositorio, aunque la model card no detalla la composicion exacta de capas.

Su relevancia es practica: permite ejecutar un ASR japones de calidad en hardware de consumo Apple sin infraestructura CUDA. El autor advierte de que la cuantizacion reduce memoria pico pero no acelera la inferencia; de hecho, el RTFx mediano cae aproximadamente un 14 % respecto a bf16 en la maquina de validacion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | FastConformer con decodificacion TDT (segun tags; detalle de capas no disponible) |
| Parametros totales | 615.871.520 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (modelo ASR; ventana de audio no especificada) |
| Tipos de cuantizacion | 8 bits afino (group size 64) en capas lineales; convoluciones, normalizaciones y embeddings en bf16 |
| Idiomas soportados | japones (ja) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (MLX); repo de 0,7 GB |

## Arquitectura y entrenamiento

La model card identifica el modelo base como third-intelligence/Haas-ja-v1.0 y lo etiqueta con parakeet, tdt y fastconformer, lo que situa la arquitectura en la familia FastConformer con decodificador TDT, habitual en los modelos ASR de NVIDIA NeMo. No se proporcionan en la informacion disponible detalles sobre numero de capas, dimension del encoder, datos de entrenamiento, numero de horas de audio, composicion del corpus ni si hubo ajuste fino con RLHF o tecnicas similares.

La innovacion tecnica de esta ficha concreta es el proceso de conversion: se aplica `mlx.nn.quantize` con cuantizacion afina de 8 bits y group size 64 a todas las capas lineales, manteniendo el resto de tensores en bf16. El autor verifico el proceso con un modelo de pesos aleatorios (ida y vuelta de conversion, coincidencia de claves y formas, y bit a bit en valores no cuantizados), y comprobo que el texto generado coincide con la version bf16 en el 88,8 % de las locuciones de FLEURS y el 84,9 % de JVNV. La comparacion de la secuencia de tokens contra la implementacion PyTorch en float32 no se ha verificado.

## Capacidades

- Reconocimiento automatico del habla en japones a partir de audio.
- Salida de texto plano y salida JSON con marcas de tiempo mediante la CLI (`--json --timestamps`).
- Procesamiento por lotes de un solo audio (batch 1) en la configuracion validada.
- Ejecucion nativa en Apple Silicon mediante MLX, sin necesidad de CUDA ni PyTorch.
- No se documentan capacidades de traduccion, diarizacion, deteccion de idioma, tool calling ni agentes; es un modelo puramente ASR.

## Casos de uso

- Transcripcion de reuniones y entrevistas en japones: el modelo convierte audio a texto con marcas de tiempo, util para generar actas y subtitulos en un Mac de sobremesa.
- Subtitulado de contenido audiovisual japones: la salida JSON con timestamps permite alinear subtitulos en pipelines de postproduccion.
- Prototipado rapido en local: investigadores que trabajan en Mac pueden evaluar un ASR japones sin montar un entorno CUDA, usando `haas-ja-local` como CLI o como libreria Python.
- Preprocesado de corpus de voz: transcripcion por lotes de grabaciones para construir datasets de texto alineado con audio en japones.
- Asistentes de voz en aplicaciones de escritorio para macOS: integracion del backend MLX en apps nativas que necesitan ASR local y sin conexion.
- Analisis de llamadas o atencion al cliente en japones: transcripcion de conversaciones grabadas para su posterior clasificacion o busqueda, siempre que se respeten los requisitos de la licencia y la proteccion de datos.
- Accesibilidad: generacion de transcripciones en tiempo casi real de contenido hablado en japones en equipos Apple Silicon.

## Benchmarks y rendimiento

Resultados de CER strict (%) en asr-ja-bench v1.1, comparando la version 8 bits con la bf16 y con los valores publicados del modelo original:

| Subconjunto | Locuciones | bf16 | 8 bits | Diferencia vs bf16 | Valor publicado | Diferencia vs publicado |
|---|---:|---:|---:|---:|---:|---:|
| FLEURS | 650 | 3,65 | 3,68 | +0,03 | 3,65-3,67 | +0,01 |
| JVNV | 1.375 | 4,51 | 4,49 | -0,02 | 4,50-4,53 | -0,01 |

El autor indica que la version 4 bits no se publico por incumplir el criterio de precision (FLEURS 3,70 % y JVNV 5,00 %).

Metricas de velocidad y memoria en Apple M5 Max (128 GB), macOS 27.2, mlx 0.32.4, batch 1, 647 locuciones de FLEURS tras descartar 3 de calentamiento:

| Metrica | bf16 | 8 bits |
|---|---:|---:|
| RTFx (mediana por locucion) | 260,1 | 223,3 |
| RTFx (total audio / total tiempo) | 263,4 | 226,6 |
| Tiempo por locucion (mediana) | 0,048 s | 0,057 s |
| RSS pico | 1,57 GB | 1,09 GB |
| Asignacion pico de MLX | 1,79 GB | 1,23 GB |
| Huella de memoria pico de macOS | 3,20 GB | 2,63 GB |

## Requisitos de hardware

- Plataforma: exclusivamente Macs con Apple Silicon; requiere macOS y Python 3.12.
- Memoria: en la maquina de validacion (M5 Max, 128 GB) la huella pico de macOS es de 2,63 GB, por lo que deberia caber en equipos con 8 GB o mas, aunque otras configuraciones no se han medido.
- GPU: no aplica CUDA; se ejecuta sobre la GPU integrada de Apple via MLX. No hay datos para A100, H100 ni RTX 4090.
- Despliegue: paquete `haas-ja-local` (extra `mlx`) instalado desde GitHub; CLI `haas-ja-local transcribe` o API Python (`load_model`, `load_audio`, `transcribe`). No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Rendimiento: RTFx mediano de 223,3 en M5 Max, con 0,057 s por locucion de media; el autor advierte de que la cuantizacion no acelera la inferencia en ese equipo.
- Limitaciones de escala: batch 2 o superior y equipos con poca memoria no estan medidos.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| Haas-ja-v1.0-mlx-8bit (esta ficha) | 615,9 M | no disponible | MLX safetensors, 8 bits | Apache-2.0 | Solo Apple Silicon; RTFx 223,3 en M5 Max |
| basyauma-tech/Haas-ja-v1.0-mlx (bf16) | 615,9 M | no disponible | MLX safetensors, bf16 | Apache-2.0 | Misma funcionalidad; 0,59x mas pesado en disco pero ~14 % mas rapido en RTFx |
| third-intelligence/Haas-ja-v1.0 (original) | no disponible | no disponible | NeMo (.nemo) | Apache-2.0 | Requiere NeMo/PyTorch; referencia de precision publicada |
| Sanami/haas-ja-onnx | no disponible | no disponible | ONNX float32 | Apache-2.0 | Conversion para comparacion numerica; no redistribuye pesos |

No se dispone de datos para comparar con otros modelos ASR japoneses de distinto origen (por ejemplo Whisper o similares) en la informacion proporcionada.

## Limitaciones y advertencias

- Conversion no oficial: no esta afiliada, aprobada ni patrocinada por Third Intelligence, Inc.; el nombre "Haas" se usa solo para indicar el origen.
- Solo japones: no se ha validado para otros idiomas ni para audio multilingue.
- Solo Apple Silicon: no funciona en Linux, Windows ni GPUs NVIDIA; depende de MLX y de macOS.
- Rendimiento inferior a bf16 en velocidad: la cuantizacion reduce memoria pero el RTFx mediano baja alrededor del 14 %.
- Ambito no medido: reconocimiento de audio largo con segmentacion, entradas de silencio o ruido, los conjuntos JSUT, TEDxJP-10K y SpeechBSD, group sizes distintos de 64, equipos con poca memoria y batch 2 o superior.
- Verificacion incompleta: la coincidencia de tokens frente a PyTorch en float32 no se ha comprobado; la equivalencia con bf16 es del 88,8 % (FLEURS) y 84,9 % (JVNV).
- Riesgo de errores de transcripcion en audio ruidoso o con acentos no representados en el entrenamiento original; no hay datos sobre sesgos del modelo base en la informacion disponible.
- Licencia Apache-2.0 permite uso comercial, pero se debe conservar el aviso de atribucion (`NOTICE`) y la licencia; los datos de evaluacion (FLEURS CC BY 4.0, JVNV CC BY-SA 4.0) no se redistribuyen con el modelo.
- Los pesos cuantizados no deben considerarse equivalentes bit a bit al modelo original para fines de certificacion o auditoria.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/basyauma-tech/Haas-ja-v1.0-mlx-8bit
- Modelo base: https://huggingface.co/third-intelligence/Haas-ja-v1.0
- Version bf16 del mismo autor: https://huggingface.co/basyauma-tech/Haas-ja-v1.0-mlx
- Repositorio de codigo `haas-ja-local`: https://github.com/basyauma-tech/haas-ja-local
- Registro de verificacion de la cuantizacion: https://github.com/basyauma-tech/haas-ja-local/blob/main/docs/verification/2026-11-08-mac-mlx-quant.md
- Paquete oficial de inferencia: https://github.com/third-intelligence/Haas-ASR
- Port MLX alternativo: https://github.com/matsuurajun/haas-mlx
- Conversion MLX alternativa: https://huggingface.co/mrjnzzz/Haas-ja-v1.0-mlx
- Conversion ONNX: https://huggingface.co/Sanami/haas-ja-onnx
- NVIDIA NeMo: https://github.com/NVIDIA/NeMo
- flash-linear-attention: https://github.com/fla-org/flash-linear-attention
