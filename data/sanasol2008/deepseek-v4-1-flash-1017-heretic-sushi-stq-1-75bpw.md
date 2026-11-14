# sanasol2008/DeepSeek-V4.1-Flash-1017-Heretic-Sushi-STQ-1.75bpw

## Resumen

DeepSeek-V4.1-Flash-1017-Heretic-Sushi-STQ-1.75bpw es una variante experimental de pesos publicada por el usuario sanasol2008 en Hugging Face. No se trata de un modelo entrenado desde cero, sino de una preservacion completa de un root Sushi STQ de 1,75 bits por peso que combina el pack oficial de beamster (DeepSeek-V4.1-Flash-1017-Sushi-STQ-1.75bpw) con 38 matrices de proyeccion de salida de atencion (attn.wo_b, capas 2 a 39) recodificadas a partir del checkpoint pqhaz/DeepSeek-V4.1-Flash-1017-heretic. El resultado es un artefacto de inferencia standalone con licencia MIT y 261.320.630.994 parametros declarados en los safetensors.

La relevancia de esta publicacion es fundamentalmente tecnica y de investigacion: documenta un flujo de trabajo de cuantizacion extrema (STQ, trellis-based quantization) sobre un modelo de gran tamano, con scripts de construccion y evidencia numerica preservados en el directorio `provenance/`. El autor advierte explicitamente de que solo se ha validado un smoke test de runtime en macOS con el motor Sushi 1.6.0 y que la calidad general y la KLD del modelo completo permanecen sin verificar.

Conviene subrayar que la model card no proporciona informacion sobre la arquitectura interna del modelo base (mas alla de la etiqueta `deepseek_v41`), el dataset de entrenamiento, el contexto nativo ni los idiomas soportados. Los datos de esta ficha se limitan, por tanto, a lo verificable en la informacion disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (etiqueta `deepseek_v41`; pesos organizados como root Sushi STQ) |
| Parametros totales | 261.320.630.994 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible en el modelo; el smoke test se ejecuto con ctx 2048 |
| Tipos de cuantizacion | STQ a 1,75 bits por peso (trellis banks); fp8 en tags; matrices attn.wo_b recodificadas en float32 uncalibrated SPEC1 least-squares |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | safetensors (root Sushi STQ); repo de 332,1 GB |
| Modelo base | beamster/DeepSeek-V4.1-Flash-1017-Sushi-STQ-1.75bpw y pqhaz/DeepSeek-V4.1-Flash-1017-heretic |
| Motor de inferencia validado | Sushi 1.6.0 (macOS) |
| Fecha de publicacion | 2026-11-14 |

## Arquitectura y entrenamiento

No se dispone de informacion sobre la arquitectura interna del modelo base DeepSeek-V4.1-Flash-1017 en la documentacion proporcionada. La model card solo describe el proceso de construccion del artefacto: se parte del root oficial Sushi STQ de 1,75 bpw (commit `89630812557263bb7a7582fb1f30455573511155`) y se sustituyen exclusivamente 38 bancos trellis correspondientes a las proyecciones de salida de atencion (`attn.wo_b`, capas 2 a 39) por versiones recodificadas a partir del checkpoint Heretic (commit `12d58ad0878b5008e80d720251adb969a0069412`). Los expertos enrutados y el resto de tensores permanecen con los pesos STQ oficiales originales; no se ha realizado una recuantizacion completa del checkpoint Heretic.

La innovacion tecnica documentada es el propio formato STQ (trellis-based quantization) a 1,75 bits por peso, que permite almacenar un modelo de 261.000 millones de parametros en un repo de 332 GB. La recodificacion de las 38 matrices `attn.wo_b` uso codificacion float32 sin calibrar con minimos cuadrados SPEC1, no la receta privada Sashimi; las escalas originales y las cabeceras de tensor se mantuvieron sin cambios. Los scripts de construccion y la evidencia numerica estan preservados en `provenance/`, y existe un `preservation-verification.json` con el inventario de ficheros verificado de forma independiente.

## Capacidades

- Generacion de texto: el pipeline declarado es `text-generation`.
- No se documentan capacidades especificas de razonamiento, codigo o matematicas mas alla de las inherentes al modelo base, que no se detallan en la informacion disponible.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible (el campo de idiomas no esta poblado).
- Vision: el smoke test se ejecuto con `--no-vision`, lo que sugiere que el motor admite un modo vision, pero no se confirma que este artefacto lo soporte correctamente.
- MTP (multi-token prediction): deshabilitado en el smoke test (`--no-mtp`); no se confirma su funcionamiento.
- Modo thinking: no disponible.

## Casos de uso

- Investigacion sobre cuantizacion extrema: el artefacto sirve como referencia reproducible para estudiar el impacto de STQ a 1,75 bpw en un modelo de 261.000 millones de parametros, con scripts y evidencia numerica en `provenance/`.
- Experimentos de abliteration y modificacion selectiva de pesos: permite analizar el efecto de sustituir unicamente 38 matrices `attn.wo_b` sobre el comportamiento de rechazo, aunque el autor advierte que las pruebas cortas de rechazo no constituyen una evaluacion de seguridad.
- Reproduccion de pipelines de preservacion de roots: el inventario verificado en `preservation-verification.json` y el uso de commits exactos facilitan replicar el proceso de build en otros checkpoints.
- Inferencia local en hardware con presupuesto de SSD: el smoke test valido con Sushi 1.6.0, `--ssd-budget-gb 28` y ctx 2048 demuestra un modo de despliegue con offload a disco para entornos macOS con memoria limitada.
- Benchmarking de motores de inferencia alternativos: util para comparar el rendimiento de Sushi frente a otros runtimes sobre pesos trellis de muy baja precision, midiendo latencia y throughput en un modelo de gran escala.
- Auditoria de artefactos de terceros: investigadores interesados en verificar la integridad de pesos publicados pueden usar el inventario de ficheros y los commits de referencia para validar la procedencia de cada tensor.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explicitamente que la evaluacion KLD del modelo completo no se ha realizado y que las pruebas de rechazo son limitadas y no constituyen una evaluacion de calidad general ni de seguridad.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma directa; el smoke test se ejecuto con un presupuesto de SSD de 28 GiB, lo que implica offload de pesos a disco y uso de memoria unificada en macOS.
- GPU recomendadas: no disponible. El unico entorno validado es macOS con el motor Sushi 1.6.0.
- Compatibilidad con GPU de consumo: no confirmada. El tamano del repo (332,1 GB) y los 261.000 millones de parametros hacen inviable la carga completa en VRAM de GPUs de consumo sin offload.
- Opciones de despliegue: Sushi 1.6.0 con `sushi serve --model /path/to/root --ssd-budget-gb 28 --ctx-size 2048 --no-mtp --no-vision`. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| DeepSeek-V4.1-Flash-1017-Heretic-Sushi-STQ-1.75bpw (este) | 261.320.630.994 | no disponible | STQ 1,75 bpw | MIT | Hugging Face, 0 descargas |
| beamster/DeepSeek-V4.1-Flash-1017-Sushi-STQ-1.75bpw | no disponible | no disponible | STQ 1,75 bpw | no disponible | Hugging Face (modelo base) |
| pqhaz/DeepSeek-V4.1-Flash-1017-heretic | no disponible | no disponible | no disponible | no disponible | Hugging Face (modelo base) |

No se dispone de datos de rendimiento ni de especificaciones detalladas de los modelos base como para establecer una comparativa cuantitativa fiable.

## Limitaciones y advertencias

- Calidad no verificada: el autor indica que solo se realizo un smoke test de runtime; la calidad general y la KLD del modelo completo permanecen sin evaluar.
- Abliteration no confirmada: las pruebas cortas de rechazo no demuestran una abliteration exitosa ni constituyen una evaluacion de seguridad.
- Modificacion parcial: solo se sustituyeron 38 matrices `attn.wo_b`; los expertos enrutados y el resto de tensores conservan los pesos STQ oficiales, por lo que el comportamiento puede diferir del checkpoint Heretic completo.
- Riesgo de alucinacion: no cuantificado en la informacion disponible.
- Sesgos conocidos: no documentados.
- Idiomas y contexto: no disponibles; el smoke test uso ctx 2048, muy por debajo de lo habitual en modelos de esta escala.
- Restricciones de licencia: licencia MIT declarada, lo que en principio permite uso comercial, pero se deben respetar las licencias de los modelos base y los assets del tokenizer, que la model card indica que se conservan.
- Uso en produccion: desaconsejado sin una evaluacion de calidad y seguridad previa; el artefacto esta marcado como experimental y con 0 descargas.
- Compatibilidad de motor: solo validado con Sushi 1.6.0 en macOS; no hay evidencia de funcionamiento en otros runtimes.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/sanasol2008/DeepSeek-V4.1-Flash-1017-Heretic-Sushi-STQ-1.75bpw
- Modelo base (pack STQ oficial): https://huggingface.co/beamster/DeepSeek-V4.1-Flash-1017-Sushi-STQ-1.75bpw
- Modelo base (checkpoint Heretic): https://huggingface.co/pqhaz/DeepSeek-V4.1-Flash-1017-heretic
- Commit del pack STQ: `89630812557263bb7a7582fb1f30455573511155`
- Commit del checkpoint Heretic: `12d58ad0878b5008e80d720251adb969a0069412`
- Inventario de verificacion: `preservation-verification.json` (en el repositorio del modelo)
- Scripts y evidencia numerica: directorio `provenance/` (en el repositorio del modelo)
