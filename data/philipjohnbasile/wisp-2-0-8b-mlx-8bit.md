# philipjohnbasile/Wisp-2-0.8B-MLX-8bit

## Resumen

Wisp-2-0.8B-MLX-8bit es una cuantizacion en 8 bits para Apple Silicon (MLX) del modelo Wisp-2-0.8B, desarrollado por philipjohnbasile dentro de su serie "The Wisp Fieldbook". Se trata de un modelo especializado en completado de codigo fill-in-the-middle (FIM) y autocompletado en editor, disenado explicitamente para ofrecer baja latencia en inferencia local sobre hardware Apple. El modelo base declara 752.393.024 parametros reales en safetensors y una arquitectura hibrida identificada en las etiquetas como `qwen3_5` combinada con `gated-deltanet`, ademas de prediccion multi-token y decodificacion especulativa nativa.

El problema que aborda es el del autocompletado de codigo "ghost text" en el propio editor: sugiere fragmentos completos en lugar de tokens sueltos, con una latencia declarada de 27,49 ms p50 por pulsacion en un Apple M5 Max. Frente a modelos generalistas mucho mayores, Wisp-2 apuesta por un tamano reducido (sub-1B) y tecnicas de decodificacion especulativa para mantener la sensacion de respuesta instantanea sin salir del dispositivo.

La relevancia actual reside en que la cuantizacion MLX-8bit reduce el peso del repositorio a unos 0,9 GB (854 MiB segun la model card), lo que permite ejecutar el modelo integramente en memoria unificada de un Mac moderno. La licencia Apache 2.0 facilita su integracion tanto en herramientas personales como en productos comerciales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Hibrida: transformer `qwen3_5` con `gated-deltanet` y prediccion multi-token (segun etiquetas del autor) |
| Parametros totales | 752.393.024 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 8-bit (MLX); existe version BF16 en el repo base (1,45 GB) |
| Idiomas soportados | Codigo (etiqueta `code`); idiomas naturales no disponibles |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (MLX); el modelo base en BF16 tambien safetensors |

## Arquitectura y entrenamiento

La informacion disponible describe el modelo como una arquitectura hibrida que combina un transformer de la familia `qwen3_5` con capas `gated-deltanet`, un mecanismo de atencion lineal con estado recurrente que reduce el coste computacional en secuencias largas. Sobre esta base, el autor incorpora prediccion multi-token (MTP) y decodificacion especulativa nativa, orientadas a acelerar la generacion de multiples tokens por paso y a disminuir la latencia por pulsacion en el editor. Esta version concreta es una cuantizacion 8-bit realizada por el mismo autor sobre el modelo base `philipjohnbasile/Wisp-2-0.8B`, por lo que no se ha reentrenado: los pesos son una conversion de precision.

No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset, ni si se aplicaron tecnicas de RLHF o DPO. La model card menciona un conjunto de evaluacion propio ("Wisp Blind Tier-1 Repo-Context FIM", con 566 muestras, 30 repositorios y 11 lenguajes, posterior al 2026-06-01), lo que sugiere un enfasis en datos de codigo recientes y con contexto de repositorio, pero no detalla el corpus de entrenamiento.

## Capacidades

- Completado de codigo fill-in-the-middle (FIM) en formato PSM y SPM, con soporte explicito de ambos esquemas segun los benchmarks declarados.
- Autocompletado tipo "ghost text" en editor, orientado a sugerencias de multiples tokens por pulsacion.
- Prediccion multi-token (MTP) y decodificacion especulativa nativa para reducir latencia.
- Generacion de texto conversacional (pipeline `text-generation`, etiqueta `conversational`).
- Especializacion en codigo (`code-completion`, `autocomplete`); no se declaran capacidades de vision, audio ni matematicas avanzadas.
- Soporte multilingue de programacion: el benchmark del autor cubre 11 lenguajes, aunque no se enumeran.
- No se documenta soporte de tool calling ni de agentes multi-paso.

## Casos de uso

- Autocompletado en el editor sobre Mac: el modelo esta pensado para integrarse en extensiones de IDE o editores que corren en Apple Silicon, ofreciendo sugerencias FIM con una latencia declarada de 27,49 ms p50, suficiente para no interrumpir el flujo de escritura.
- Relleno de huecos en refactorizaciones: dado un contexto previo y posterior (PSM/SPM), el modelo completa el cuerpo de una funcion o un bloque eliminado, util en herramientas de edicion asistida.
- Asistente de codigo offline y privado: al ejecutarse en memoria unificada local con MLX, permite autocompletado sin enviar codigo a servicios externos, adecuado para entornos con requisitos de confidencialidad.
- Generacion de tests unitarios a partir de firmas de funciones: el modelo puede completar el cuerpo de un test dado el contexto del repositorio, aprovechando su entrenamiento con contexto de repositorio.
- Prototipado rapido en notebooks y scripts sobre macOS: su tamano reducido (854 MiB en 8-bit) permite cargarlo en un Mac portatil junto a otras herramientas sin agotar la memoria.
- Integracion en pipelines de CI ligeros: para tareas de completado o sugerencia en documentacion y ejemplos de codigo, siempre que el runner disponga de hardware Apple o se use la version BF16 en otras plataformas.
- Educacion y demos: el playground publicado por el autor sirve para evaluar el comportamiento FIM antes de integrarlo en un producto.

## Benchmarks y rendimiento

Datos declarados por el autor en el model-index (no verificados):

| Metrica | Dataset | Valor |
|---|---|---|
| Exact Match (100% PSM) | Wisp Blind Tier-1 Repo-Context FIM (post-2026-06-01, n=566, 30 repos, 11 langs) | 32,86 |
| Exact Match (100% SPM) | Wisp Blind Tier-1 Repo-Context FIM (post-2026-06-01, n=566, 30 repos, 11 langs) | 30,56 |
| Warm Keystroke Latency p50 (M5 Max, ms) | mismo conjunto | 27,49 |

No se han publicado resultados de MMLU, HumanEval, GSM8K ni otros benchmarks estandar en la informacion disponible.

## Requisitos de hardware

- VRAM/memoria estimada: el repositorio ocupa 0,9 GB y la model card indica 854 MiB para los pesos MLX-8bit; en memoria unificada de Apple Silicon se necesita aproximadamente ese espacio mas el overhead del runtime MLX y del contexto.
- GPU recomendadas: Apple Silicon (la model card cita explicitamente un Apple M5 Max para la medicion de latencia). No se documenta soporte para GPU NVIDIA.
- Cabe en GPU de consumo: si, en cualquier Mac con memoria unificada suficiente (8 GB o mas); no esta pensado para GPUs discretas NVIDIA/AMD por el formato MLX.
- Opciones de despliegue: libreria `mlx` (MLX de Apple); el modelo base BF16 en safetensors puede cargarse con frameworks compatibles, aunque no se detalla soporte de vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: 27,49 ms p50 por pulsacion en caliente sobre M5 Max, segun el autor. No se publican cifras de throughput (tokens/s).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Formato |
|---|---|---|---|---|---|
| Wisp-2-0.8B-MLX-8bit | 752 M | no disponible | FIM/autocompletado, Apple Silicon | Apache 2.0 | safetensors (MLX) |
| Wisp-2-0.8B (base) | 752 M | no disponible | FIM/autocompletado | Apache 2.0 | safetensors (BF16) |
| wisp-coder-110m (Fieldbook No. 001) | 110 M (segun nombre) | no disponible | Codigo, tamano muy reducido | no disponible en la informacion | no disponible |

No se dispone de datos de benchmarks de los modelos comparables en la informacion proporcionada, por lo que no es posible establecer una comparacion cuantitativa de rendimiento.

## Limitaciones y advertencias

- Modelo especializado en codigo: las etiquetas solo declaran el idioma `code`; su utilidad para lenguaje natural general no esta documentada.
- Resultados de benchmark no verificados (`verified: false`): los valores de Exact Match y latencia los declara el autor y no han sido validados de forma independiente.
- Conjunto de evaluacion propio y de fecha futura (posterior al 2026-06-01): la comparabilidad con benchmarks estandar es limitada.
- Riesgo de alucinacion en sugerencias de codigo: como todo modelo generativo, puede producir APIs inexistentes o firmas incorrectas; conviene validar en el editor.
- Dependencia de plataforma: el formato MLX limita su ejecucion a Apple Silicon; para otros entornos hay que recurrir al modelo base BF16.
- Longitud de contexto no documentada: no se puede garantizar el comportamiento en repositorios grandes sin medir previamente.
- Sesgos: no se documenta ninguna evaluacion de sesgos ni de seguridad.
- Licencia Apache 2.0: permite uso comercial, pero al ser una cuantizacion conviene conservar los avisos de licencia del modelo base.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/philipjohnbasile/Wisp-2-0.8B-MLX-8bit
- Modelo base BF16: https://huggingface.co/philipjohnbasile/Wisp-2-0.8B
- Demo/playground: https://huggingface.co/spaces/philipjohnbasile/wisp-2-demo
- Coleccion "The Wisp Fieldbook": https://huggingface.co/collections/philipjohnbasile/the-wisp-fieldbook-6b046d3efc921b5ab45b42f5
- Modelo anterior de la serie (No. 001): https://huggingface.co/philipjohnbasile/wisp-coder-110m
