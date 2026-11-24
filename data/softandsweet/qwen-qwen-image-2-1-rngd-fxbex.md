# softandsweet/qwen-qwen-image-2-1-rngd-fxbex

## Resumen

Fury Image Replay 2.1 es un paquete de despliegue para hardware NPU Furiosa RNGD derivado de Qwen/Qwen-Image-2.1 (commit `d26bb612`), un modelo de difusion texto-a-imagen. Lo publica el usuario `softandsweet` bajo el runtime propietario fxbX (version 0.9.5) y el SDK 2026.4.0 de Furiosa. No es un modelo nuevo entrenado desde cero, sino un artefacto precompilado (formato `.fxbx`, aproximadamente 148 MB) que contiene kernels compilados y codigo del modelo, mientras que los pesos originales se descargan del checkpoint de Qwen en el primer arranque y se verifican por SHA-256.

El objetivo del paquete es ejecutar la inferencia completa de Qwen-Image-2.1 en la NPU RNGD de Furiosa: el codificador de texto, el prefix KV, los 40 pasos de difusion y el VAE corren en la NPU, mientras que la tokenizacion, las tablas de posicion, el ruido inicial, el movimiento de tensores y la conversion a PNG se hacen en el host. La generacion esta limitada a 512x512 en formato RGBA PNG, con 40 pasos fijos, sin CFG y con batch de 1.

Su relevancia es acotada: sirve como referencia para quienes quieran evaluar el rendimiento de Qwen-Image-2.1 sobre aceleradores NPU Furiosa RNGD, no como sustituto del modelo original en GPU. La licencia es Qwen Research License (uso no comercial, solo investigacion y evaluacion), y el propio autor advierte que el paquete no constituye una verificacion de inferencia NPU de caracter general.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo de difusion texto-a-imagen (Qwen-Image-2.1) empaquetado para NPU Furiosa RNGD mediante runtime fxbX |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible; el grafo de texto se rellena a 128 tokens totales y la entrada (sin mensaje de sistema) se limita a 64 tokens |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Qwen Research License (no comercial, solo investigacion y evaluacion) |
| Formato de pesos | Paquete `.fxbx` (kernels compilados y codigo); los pesos originales se descargan del checkpoint de Qwen y se verifican por SHA-256 |
| Resolucion de salida | 512x512, RGBA PNG |
| Pasos de difusion | 40 fijos, sin CFG, batch 1 |
| Tamano del paquete | ~148 MB (sin pesos) |
| Runtime requerido | fxbX >= 0.9.5, SDK 2026.4.0, Torch 2.10.0+cpu, Transformers 5.20.2, Diffusers 0.43.0 |
| Hardware objetivo | Host Furiosa RNGD con driver y dependencias compatibles |

## Arquitectura y entrenamiento

El modelo subyacente, Qwen-Image-2.1, es un modelo de difusion texto-a-imagen de Qwen. El paquete de Fury Image Replay 2.1 no aporta entrenamiento propio: es una conversion del checkpoint original al formato de ejecucion de fxbX, con los kernels del codificador de texto, el transformer de difusion y el VAE compilados para la NPU RNGD. El pipeline completo se ejecuta en la NPU (codificador de texto, prefix KV, 40 pasos de imagen y VAE), y solo las operaciones de tokenizacion, tablas de posicion, generacion del ruido inicial, transferencia y relleno de tensores y conversion a PNG quedan en el host.

No se detalla en la informacion disponible la composicion del dataset de entrenamiento, el numero de tokens, ni si hubo RLHF, DPO o ajuste fino adicional. El autor declara que la conversion se hizo desde `Qwen/Qwen-Image-2.1@d26bb61231c349cf6b7896fa83353113880e1ba3` y que los pesos originales no se incluyen en el paquete. La validacion publicada se limita a tres frases comparadas contra el pipeline CPU original con la misma semilla y ruido, con PSNR RGB de 40,78 / 49,94 / 29,42 dB, y una comparacion visual de composicion y texto. El propio autor indica que es una prueba de aceptacion pequena y no un benchmark general de calidad de imagen.

## Capacidades

- Generacion de imagenes a partir de descripciones en lenguaje natural, con salida fija de 512x512 en RGBA PNG.
- Generacion de texto dentro de la imagen (rotulos, carteles) segun la validacion visual del autor.
- Inferencia completa en NPU RNGD: codificador de texto, prefix KV, 40 pasos de difusion y VAE.
- Ejecucion determinista mediante semilla configurable (`seed`) en la API de servicio.
- Servicio HTTP local mediante `fxbx serve` en el puerto indicado, con endpoint `/predict`.
- Ejecucion por linea de comandos con `fxbx run` y generacion de muestra (`--sample`).
- Soporte de `fxbx predict` con entradas JSON nombradas para el adaptador incluido.
- No soporta edicion de imagen ni generacion a 1024 en esta version.
- No se documentan capacidades multilingues, tool calling ni modos de razonamiento (no es un modelo de lenguaje).

## Casos de uso

- Evaluacion de rendimiento de Qwen-Image-2.1 sobre NPU Furiosa RNGD: el paquete permite medir latencia y throughput reales del pipeline completo en hardware NPU, con las cifras declaradas de 54-59 s por peticion (25 s de los 40 pasos) y 105 s en arranque en frio.
- Pruebas de aceptacion de compiladores y runtimes NPU: sirve para verificar que un SDK o runtime concreto ejecuta el pipeline sin caidas a CPU; el autor reporta 0 fallbacks y 0 recompilaciones observadas en su validacion.
- Generacion de imagenes de referencia en entornos de investigacion no comercial: util para producir ilustraciones de 512x512 a partir de prompts en cuadernos de investigacion o demos internas.
- Comparacion de fidelidad entre backend NPU y CPU: la metodologia de PSNR con semilla y ruido fijos permite replicar la comparacion numerica entre ambos pipelines.
- Integracion en un servicio HTTP local: el endpoint `/predict` con `seed`, `size` y `steps` permite conectar el modelo a scripts Python o herramientas internas de generacion por lotes.
- Validacion de empaquetado y distribucion de modelos: el flujo de descarga, verificacion SHA-256 e inspeccion (`fxbx inspect`, `fxbx validate`) sirve como plantilla para distribuir otros modelos en formato `.fxbx`.
- Generacion de material grafico con texto embebido (carteles, rotulos) en contextos de prototipado, siempre que se respete la licencia de investigacion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K u otros) en la informacion disponible, ya que el modelo es de generacion de imagen. Los unicos datos cuantitativos publicados son de validacion interna:

| Metrica | Valor |
|---|---|
| PSNR RGB frente a pipeline CPU (frase 1) | 40,78 dB |
| PSNR RGB frente a pipeline CPU (frase 2) | 49,94 dB |
| PSNR RGB frente a pipeline CPU (frase 3) | 29,42 dB |
| Latencia por peticion (servidor 3, con profiling) | ~54-59 s |
| Tiempo de los 40 pasos de difusion | ~25 s |
| Carga inicial del modelo residente | ~22 s |
| Tiempo total en frio (CLI, servidor 5) | ~105 s |
| Tareas NPU oficiales ejecutadas | 701.982 |
| Fallbacks a CPU / recompilaciones observadas | 0 / 0 |

El autor advierte que estas cifras dependen del entorno y del estado de la cache, y que la prueba de PSNR es una validacion de aceptacion pequena, no un benchmark de calidad de imagen.

## Requisitos de hardware

- Hardware objetivo: host Furiosa RNGD con driver, SDK 2026.4.0 y dependencias Python compatibles. No se documenta soporte para GPU convencional en este paquete.
- VRAM estimada: no disponible; el paquete esta disenado para ejecucion en NPU, no en GPU.
- GPU recomendadas: no aplica para este artefacto; el modelo base Qwen-Image-2.1 podria ejecutarse en GPU con el pipeline original de Diffusers, pero no se proporcionan requisitos en la informacion disponible.
- Espacio en disco: ~148 MB para el paquete `.fxbx`, mas el espacio necesario para descargar y cachear los pesos originales del checkpoint de Qwen (tamano no especificado en la informacion disponible).
- Despliegue: runtime fxbX >= 0.9.5 mediante `fxbx run`, `fxbx serve` (servidor HTTP en el puerto indicado) y `fxbx predict` con entradas JSON.
- Latencia y throughput: ~54-59 s por peticion con profiling y ~25 s de computo de difusion; arranque en frio de ~105 s. No se documenta throughput en peticiones concurrentes.

## Comparativa con modelos similares

| Modelo | Tipo | Resolucion | Contexto de texto | Licencia | Hardware objetivo | Disponibilidad |
|---|---|---|---|---|---|---|
| Fury Image Replay 2.1 (este paquete) | Difusion texto-a-imagen empaquetada | 512x512 fijo | 64 tokens de entrada, grafo de 128 tokens | Qwen Research License (no comercial) | NPU Furiosa RNGD | Paquete `.fxbx` en Hugging Face |
| Qwen/Qwen-Image-2.1 (modelo base) | Difusion texto-a-imagen | No disponible en la informacion proporcionada | No disponible | Qwen Research License | GPU/CPU con Diffusers | Checkpoint original en Hugging Face |
| Otros modelos texto-a-imagen de la familia Qwen | Difusion texto-a-imagen | No disponible | No disponible | Qwen Research License | GPU/CPU | Hugging Face |

No se dispone de datos de rendimiento comparables entre estos modelos en la informacion proporcionada; la comparativa se limita a caracteristicas de despliegue y licencia.

## Limitaciones y advertencias

- Licencia Qwen Research License: uso exclusivamente no comercial, de investigacion y evaluacion. Cualquier uso comercial requiere una licencia adicional del proveedor original.
- El paquete no incluye los pesos; en el primer arranque descarga el checkpoint original de Qwen, lo que requiere espacio adicional en disco y conectividad con Hugging Face.
- Resolucion fija de 512x512: no soporta generacion a 1024 ni edicion de imagen en esta version.
- Pasos fijos a 40 y sin CFG: no hay margen para ajustar calidad frente a velocidad en la configuracion publicada.
- Entrada de texto limitada a 64 tokens (sin mensaje de sistema) y relleno del grafo a 128 tokens, lo que restringe prompts largos y detallados.
- La validacion publicada es una prueba de aceptacion con tres frases, no un benchmark de calidad de imagen; el PSNR de 29,42 dB en una de las frases sugiere divergencia perceptible en algunos casos.
- Dependencia de un runtime propietario (fxbX) y de un SDK concreto (2026.4.0); cambios de version pueden romper la compatibilidad.
- El autor advierte explicitamente que el paquete "no es una verificacion de inferencia NPU" de caracter general y recomienda revisar todas las licencias incluidas.
- Riesgo de sesgos y alucinacion visual inherente al modelo base Qwen-Image-2.1; no se documentan evaluaciones de sesgo en la informacion disponible.
- Idiomas soportados no documentados; la model card esta redactada en coreano e ingles, sin lista de idiomas.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: no hay evidencia de uso comunitario ni de mantenimiento continuado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/softandsweet/qwen-qwen-image-2-1-rngd-fxbex
- Modelo base: https://huggingface.co/Qwen/Qwen-Image-2.1
- Commit del checkpoint base: https://huggingface.co/Qwen/Qwen-Image-2.1/commit/d26bb61231c349cf6b7896fa83353113880e1ba3
- Resumen de validacion: https://huggingface.co/softandsweet/qwen-qwen-image-2-1-rngd-fxbex/resolve/main/validation/validation-summary.json
- Imagen comparativa CPU vs RNGD: https://huggingface.co/softandsweet/qwen-qwen-image-2-1-rngd-fxbex/resolve/main/validation/fox-comparison.png
- Runtime fxbX: https://github.com/smallstep-zzz/fxbX
- Paquete de release (SHA-256 `b62c95f5...`): https://huggingface.co/softandsweet/qwen-qwen-image-2-1-rngd-fxbex/resolve/main/releases/2026.4.0-qwenimage21-512-fxbx1/b62c95f5498b7da89b1e9774aeb9ac6c36db96b7c8bcdf5e4ebf741e5b024ee5/Fury-Image-Replay-2.1.fxbx
