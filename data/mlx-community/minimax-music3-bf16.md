# mlx-community/MiniMax-Music3-bf16

## Resumen

MiniMax Music 3 es un modelo de generacion de musica condicionada por letras desarrollado por MiniMax, convertido a formato MLX BF16 por la comunidad mlx-community para su ejecucion nativa en Apple Silicon. El modelo combina un modelo autoregresivo global basado en Qwen3 con un decodificador de profundidad RVQ, un codificador de condiciones, una etapa de flow-matching DiT/Euler y un vocoder estereo, produciendo audio a 44.1 kHz. Esta conversion comunitaria no es un lanzamiento oficial de MiniMax, pero mantiene la paridad funcional con el checkpoint original.

La relevancia de este modelo radica en que permite generar canciones completas con letras explicitas, control de estilo, tempo e instrumentacion, todo ello ejecutable localmente en hardware Apple. Con 11.741 millones de parametros en BF16, el repositorio ocupa 28.5 GB y esta disponible en multiples variantes cuantizadas (8-bit, 6-bit, 4-bit, MXFP8, MXFP4 y NVFP4) para adaptarse a diferentes limitaciones de memoria. La licencia es la MiniMax-Music3 Community License, que incluye terminos comerciales especificos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Pipeline hibrido: Qwen3 autoregresivo global + decodificador RVQ + codificador de condiciones + flow-matching DiT/Euler + vocoder estereo |
| Parametros totales | 11.741.732.330 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | BF16 (denso, sin cuantizar); variantes separadas: 8-bit, 6-bit, 4-bit, MXFP8, MXFP4, NVFP4 |
| Idiomas soportados | no disponible |
| Licencia | MiniMax-Music3 Community License |
| Formato de pesos | safetensors (MLX) |

## Arquitectura y entrenamiento

La arquitectura de MiniMax Music 3 es un pipeline completo de generacion de musica en varias etapas. La primera etapa es un modelo autoregresivo global basado en Qwen3 que genera los tokens de alto nivel de la composicion. Le sigue un decodificador de profundidad RVQ (Residual Vector Quantization) que expande esos tokens en representaciones de audio mas detalladas. Un codificador de condiciones procesa las entradas de texto y letras, y una etapa de flow-matching basada en DiT (Diffusion Transformer) con Euler sampler refina la representacion latente. Finalmente, un vocoder estereo produce la forma de onda final a 44.1 kHz.

Los datos de entrenamiento y el proceso de entrenamiento (RLHF, DPO, etc.) no estan disponibles en la informacion proporcionada. La conversion a MLX verifico la paridad con el checkpoint oficial de PyTorch con diferencias maximas absolutas de 1.45e-4 en logits de Qwen, 2.50e-5 en RVQ, 1.91e-6 en el codificador de condiciones, 7.63e-6 en el transformer de flujo y 8.57e-7 en el vocoder. El modelo completo carga estrictamente los 982 tensores esperados.

## Capacidades

- Generacion de canciones completas con letras explicitas estructuradas por secciones (verso, coro, etc.)
- Generacion instrumental explicita usando la etiqueta `[instrumental]`
- Control probabilistico de estilo, tempo, instrumentacion y tipo de voz mediante descripciones en texto
- Salida de audio estereo a 44.1 kHz
- Generacion de audio de larga duracion: una solicitud de 210 segundos produjo 152.8 segundos de audio tras 38 ventanas de denoising, terminando por emision del token EOS
- Ejecucion nativa en Apple Silicon mediante MLX y mlx-audio
- Variantes cuantizadas disponibles para diferentes presupuestos de memoria

## Casos de uso

- Produccion musical independiente: un artista puede generar maquetas de canciones completas con letra y estilo especifico (por ejemplo, "pop acustico, 96 BPM, voz femenina intima") para evaluar ideas antes de entrar al estudio.
- Composicion para sincronizacion audiovisual: creadores de contenido pueden generar pistas con letra adaptada a narrativas concretas, estructurando la cancion en versos y coros que acompanen el arco del video.
- Prototipado rapido para compositores: un compositor puede explorar variaciones de una misma letra con diferentes estilos, tempos e instrumentaciones sin necesidad de interpretes o sesiones de grabacion.
- Educacion musical: profesores pueden generar ejemplos auditivos que ilustren conceptos como estructura de cancion, cambios de tempo o instrumentacion, adaptados al nivel del alumnado.
- Desarrollo de herramientas de asistencia creativa: desarrolladores pueden integrar el modelo en aplicaciones que sugieran canciones completas a partir de una idea textual, usando la API de Python de mlx-audio.
- Generacion de demos para letristas: un letrista sin conocimientos musicales puede escuchar sus textos convertidos en canciones para evaluar metricas, fluidez y emocion, iterando sobre la letra con retroalimentacion auditiva inmediata.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La unica verificacion de rendimiento documentada es la suite de regresion de mlx-audio, que paso 1.742 tests con 34 skips esperados, y la suite enfocada en musica, converter y registry con 43 tests y 3 subtests superados.

## Requisitos de hardware

- Dispositivos Apple Silicon (M-series) con macOS, ya que MLX es el framework de ejecucion.
- El checkpoint BF16 completo ocupa 28.5 GB en disco; la VRAM necesaria para cargar el modelo en memoria unificada es de aproximadamente 24-32 GB, dependiendo del sistema operativo y las cargas adicionales.
- Para equipos con menos memoria unificada, estan disponibles las variantes cuantizadas: 8-bit, 6-bit, 4-bit, MXFP8 (recomendada por el autor de la conversion), MXFP4 y NVFP4.
- El despliegue se realiza mediante mlx-audio, que se instala desde el commit de fusion `784b29e2691a93ca7483147d86f61859dfaa6296` del repositorio Blaizzy/mlx-audio.
- La generacion es autoregresiva y puede emitir el token EOS antes de alcanzar la duracion solicitada, por lo que la latencia es variable y depende de la longitud real generada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Salida | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| MiniMax Music 3 (MLX BF16) | 11.741 M | no disponible | 44.1 kHz estereo | MiniMax-Music3 Community License | MLX, Apple Silicon |
| MiniMax Music 3 (original PyTorch) | 11.741 M | no disponible | 44.1 kHz estereo | MiniMax-Music3 Community License | PyTorch, GPU NVIDIA |
| MiniMax Music 3 (MLX MXFP8) | 11.741 M | no disponible | 44.1 kHz estereo | MiniMax-Music3 Community License | MLX, Apple Silicon, cuantizado |

No se dispone de informacion sobre modelos comparables de otros desarrolladores en la informacion proporcionada.

## Limitaciones y advertencias

- La conversion es comunitaria y no oficial; el credito del modelo pertenece a MiniMax y debe revisarse la model card original antes de su uso.
- Las letras son obligatorias por contrato del checkpoint; para generacion instrumental debe usarse explicitamente la etiqueta `[instrumental]`.
- La duracion solicitada es un limite superior: el modelo puede emitir su token EOS antes de tiempo, como se observo en la generacion de 210 segundos que termino en 152.8 segundos.
- El control de estilo, tempo, instrumentos y voz es probabilistico, no estricto; los resultados pueden desviarse de la descripcion textual.
- La licencia MiniMax-Music3 Community License incluye terminos de uso aceptable y condiciones comerciales que deben revisarse antes de cualquier despliegue en produccion.
- No se dispone de informacion sobre sesgos, riesgos de alucinacion o limitaciones idiomaticas del modelo.
- La generacion de musica con letras puede producir contenido que reproduzca sesgos presentes en los datos de entrenamiento, por lo que se recomienda supervision humana en contextos profesionales.

## Enlaces

- Repositorio HuggingFace de la conversion MLX BF16: https://huggingface.co/mlx-community/MiniMax-Music3-bf16
- Modelo original de MiniMax: https://huggingface.co/MiniMaxAI/MiniMax-Music3
- Licencia del modelo: https://huggingface.co/MiniMaxAI/MiniMax-Music3/blob/main/LICENSE
- Repositorio mlx-audio: https://github.com/Blaizzy/mlx-audio
- Pull request de soporte para MiniMax Music 3: https://github.com/Blaizzy/mlx-audio/pull/888
- Variante MLX 8-bit: https://huggingface.co/mlx-community/MiniMax-Music3-8bit
- Variante MLX 6-bit: https://huggingface.co/mlx-community/MiniMax-Music3-6bit
- Variante MLX 4-bit: https://huggingface.co/mlx-community/MiniMax-Music3-4bit
- Variante MLX MXFP8: https://huggingface.co/mlx-community/MiniMax-Music3-mxfp8
- Variante MLX MXFP4: https://huggingface.co/mlx-community/MiniMax-Music3-mxfp4
- Variante MLX NVFP4: https://huggingface.co/mlx-community/MiniMax-Music3-nvfp4
