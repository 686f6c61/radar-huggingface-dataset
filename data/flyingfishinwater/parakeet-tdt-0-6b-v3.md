# flyingfishinwater/parakeet-tdt-0.6b-v3

## Resumen

`flyingfishinwater/parakeet-tdt-0.6b-v3` es una conversion al formato MLX del modelo de reconocimiento automatico del habla (ASR) `nvidia/parakeet-tdt-0.6b-v3` de NVIDIA. Se trata de un modelo de transcripcion de audio a texto con 627.052.166 parametros (aproximadamente 0,6 B), construido sobre una arquitectura FastConformer combinada con un decodificador TDT (Token-and-Duration Transducer). La conversion la publica el usuario flyingfishinwater y su unico proposito es permitir la inferencia local eficiente en hardware Apple Silicon a traves del framework MLX.

El modelo resuelve la tarea de convertir voz en texto escrito de forma multilingue: cubre 25 idiomas europeos, entre ellos ingles, castellano, frances, aleman, italiano, portugues, neerlandes, polaco, ruso y ucraniano. Frente al modelo original de NVIDIA, que se distribuye en formato NeMo y esta pensado para GPU CUDA, esta version en safetensors/MLX permite ejecutar la transcripcion en un Mac con chip de la serie M sin depender de CUDA ni de servicios en la nube.

Es relevante ahora porque el ecosistema MLX ha madurado lo suficiente como para ofrecer pipelines de ASR locales con buena latencia y sin envio de audio a terceros, algo critico en escenarios con datos sensibles (sanidad, legal, periodismo). Al estar bajo licencia CC-BY-4.0, puede integrarse en productos comerciales citando la atribucion correspondiente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | FastConformer (encoder) + TDT (Token-and-Duration Transducer, decodificador) |
| Parametros totales | 627.052.166 (aprox. 0,6 B) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible (modelo ASR: procesa audio, no texto) |
| Tipos de cuantizacion | no disponible (el repo no especifica; el tamano del repo, 2,5 GB, es coherente con pesos en float32) |
| Idiomas soportados | 25 idiomas europeos: en, es, fr, de, bg, hr, cs, da, nl, et, fi, el, hu, it, lv, lt, mt, pl, pt, ro, sk, sl, sv, ru, uk |
| Licencia | cc-by-4.0 |
| Formato de pesos | safetensors (formato MLX) |
| Modelo base | nvidia/parakeet-tdt-0.6b-v3 |
| Libreria | mlx |
| Tamano del repositorio | 2,5 GB |

## Arquitectura y entrenamiento

La arquitectura combina un encoder FastConformer con un decodificador TDT. FastConformer es una variante eficiente del Conformer que incorpora capas de convolucion separable en profundidad para reducir la resolucion temporal de la secuencia de audio antes de aplicar autoatencion, lo que disminuye el coste computacional en entradas largas. El decodificador TDT (Token-and-Duration Transducer) predice de forma conjunta un token y su duracion, lo que permite saltar fotogramas redundantes durante la decodificacion y acelerar la inferencia en comparacion con un decodificador transducer convencional.

No se dispone en la informacion proporcionada de detalles sobre el volumen de horas de audio, la composicion del dataset de entrenamiento, el uso de tecnicas de ajuste (RLHF, DPO u otras) ni del proceso de destilacion o aumento de datos empleado por NVIDIA. Tampoco se documenta ninguna innovacion anadida por el autor de la conversion mas alla del propio port a MLX. La contribucion de este repositorio es unicamente la conversion de pesos, realizada con un script publico, y no un reentrenamiento.

## Capacidades

- Reconocimiento automatico del habla (ASR): transcripcion de audio a texto en 25 idiomas europeos.
- Transcripcion multilingue con soporte de cambios de idioma dentro del conjunto de lenguas entrenado.
- Ejecucion local en Apple Silicon mediante MLX (sin CUDA ni servicios en la nube).
- Compatible con la CLI `parakeet-mlx` y con el modulo `mlx_audio.stt.generate`.
- No soporta tool calling ni function calling: no es un modelo de lenguaje generativo.
- No soporta agentes ni razonamiento multi-paso.
- No incorpora vision, generacion de audio ni modo "thinking".
- No es un modelo conversacional: la salida es la transcripcion del audio de entrada.

## Casos de uso

- Transcripcion de reuniones y notas de voz en local: al ejecutarse sobre MLX en un Mac, permite convertir grabaciones a texto sin subirlas a un servicio externo, lo que resulta adecuado para entornos con requisitos de confidencialidad.
- Subtitulado automatico de video: la salida de texto por idioma puede alimentar herramientas de subtitulado (por ejemplo, formatos SRT) en flujos de postproduccion sobre hardware Apple.
- Asistentes de voz y dictado: la baja huella de memoria (aprox. 2,5 GB en float32) facilita integrarlo como componente ASR en aplicaciones de escritorio.
- Transcripcion de llamadas de atencion al cliente: convierte audio de soporte a texto para busqueda, analitica o cumplimiento normativo, manteniendo los datos en infraestructura propia.
- Accesibilidad (subtitulos para personas con discapacidad auditiva): generacion de subtitulos en 25 idiomas europeos sin depender de APIs externas.
- Investigacion en linguistica y procesamiento del habla: obtencion de transcripciones reproducibles en entornos controlados sobre Mac, utiles para corpus y estudios comparativos de idiomas europeos.
- Documentacion clinica o legal dictada: transcripcion de notas por voz en un equipo local, reduciendo la exposicion de datos personales sensibles.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La busqueda web realizada no devuelve ningun resultado relevante sobre este modelo ni sobre su modelo base (los resultados obtenidos tratan sobre acceso a YouTube y no guardan relacion con el modelo), por lo que no se dispone de cifras de WER, MMLU, HumanEval, GSM8K ni de ninguna otra metrica aplicable.

## Requisitos de hardware

- VRAM/RAM estimada: alrededor de 2,5 GB en float32 para los 627 M de parametros. Cantidades inferiores si se aplica cuantizacion en MLX (no documentada en el repo).
- Plataforma objetivo: Apple Silicon (chips de la serie M) mediante el framework MLX; MLX no esta pensado para GPU NVIDIA.
- Cabe en hardware de consumo: si, en cualquier Mac con chip de la serie M y memoria unificada suficiente (se recomienda un minimo de 8 GB, con margen comodo a partir de 16 GB).
- No hay soporte CUDA nativo; para GPU NVIDIA debe usarse el modelo original `nvidia/parakeet-tdt-0.6b-v3` con NeMo.
- Opciones de despliegue documentadas: `parakeet-mlx` (CLI) y `mlx-audio` (modulo Python). No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, que no aplican a un modelo ASR.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Arquitectura | Parametros | Idiomas | Licencia | Formato de pesos | Rendimiento |
|---|---|---|---|---|---|---|
| flyingfishinwater/parakeet-tdt-0.6b-v3 | FastConformer + TDT | 627 M | 25 europeos | CC-BY-4.0 | safetensors (MLX) | no disponible |
| nvidia/parakeet-tdt-0.6b-v3 | FastConformer + TDT | 0,6 B | 25 europeos | CC-BY-4.0 | .nemo (NeMo) | no disponible |
| openai/whisper-large-v3 | Transformer encoder-decoder | no disponible en la informacion aportada | alrededor de 99 idiomas (dato publico general) | MIT | safetensors, GGUF y otros | no disponible |

La diferencia principal frente al modelo original de NVIDIA es el formato y la plataforma de ejecucion (MLX frente a NeMo/CUDA); arquitectura, parametros y licencia coinciden. Frente a Whisper, la comparacion cuantitativa de calidad (WER) no puede establecerse con la informacion disponible.

## Limitaciones y advertencias

- Es un modelo de reconocimiento del habla, no de generacion de texto: no debe esperarse razonamiento, codigo ni respuestas conversacionales.
- Cobertura limitada a 25 idiomas europeos; no se documenta soporte de otras lenguas ni de variedades dialectales fuera de ese conjunto.
- Riesgo de alucinacion y errores de transcripcion en audio con ruido, acentos no representados en el entrenamiento, jerga tecnica o nombres propios; no se aportan tasas de error (WER) para calibrar ese riesgo.
- El rendimiento en audio largo, con solapamiento de hablantes o musica de fondo no esta documentado.
- La model card del repositorio parece reutilizada del espacio `mlx-community/parakeet-tdt-0.6b-v3` (el encabezado del README referencia ese identificador en lugar de `flyingfishinwater/...`), por lo que conviene verificar la procedencia y la integridad de los pesos.
- Licencia CC-BY-4.0: permite uso comercial, pero exige atribucion. Debe conservarse la mencion a NVIDIA como autor del modelo original y al autor de la conversion.
- Al ser una conversion, no cabe esperar mejoras de calidad respecto al modelo base de NVIDIA; su valor esta en la portabilidad a Apple Silicon.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/flyingfishinwater/parakeet-tdt-0.6b-v3
- Modelo base (NVIDIA): https://huggingface.co/nvidia/parakeet-tdt-0.6b-v3
- Script de conversion citado en la model card: https://gist.github.com/senstella/77178bb5d6ec67bf8c54705a5f490bed
- Espacio MLX referenciado en el README: https://huggingface.co/mlx-community/parakeet-tdt-0.6b-v3

Nota: la busqueda web realizada no devolvio ningun enlace relevante sobre el modelo; los resultados obtenidos no guardan relacion con la transcripcion de audio.
