# softandsweet/stabilityai-triposr-rngd-fxbex

## Resumen

TripoSR es un modelo de reconstruccion 3D a partir de una sola imagen (image-to-3D), desarrollado originalmente por Stability AI en colaboracion con Tripo AI. Dada una imagen RGB, genera una malla 3D con textura en formato GLB. La arquitectura combina un transformer de vision con un decoder basado en triplanos y un campo de densidad (NeRF-like) que se convierte en malla mediante marching cubes y se texturiza con una proyeccion UV.

El artefacto publicado en este repositorio, `softandsweet/stabilityai-triposr-rngd-fxbex`, no es el modelo original de Stability AI, sino un paquete experimental empaquetado para el acelerador Furiosa RNGD mediante el runtime FXBEX. Incluye pesos, kernels compilados y codigo del adaptador en un unico fichero `model.fxbex` de aproximadamente 1,7 GB. Esta pensado para ejecutarse en hardware NPU de Furiosa, no en GPU convencional.

La relevancia de esta publicacion es acotada: se trata de una release experimental (version 0.2.0-experimental-textured) que verifica la reproduccion en NPU con cero llamadas al compilador y cero fallback a CPU del SDK, pero cuyos resultados numericos no pasan completamente el umbral de comparacion de 1e-4 en las representaciones intermedias (triplanos y 52 de 262144 valores de densidad). Es util como referencia de portabilidad a NPU, no como sustituto del modelo original para produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de vision + decoder triplano con campo de densidad NeRF-like (TripoSR) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo image-to-3D, no generativo de texto) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (no procesa lenguaje) |
| Licencia | MIT (pesos y modelo); licencia del adaptador empaquetado no declarada |
| Formato de pesos | `model.fxbex` (paquete FXBEX con pesos, kernels compilados y codigo del adaptador) |

## Arquitectura y entrenamiento

El modelo subyacente es TripoSR, un sistema de reconstruccion 3D de una sola imagen que combina un backbone transformer de vision (para extraer caracteristicas de la imagen de entrada) con un decoder que predice un triplano de caracteristicas y un campo de densidad implicito. La malla final se extrae mediante marching cubes a resolucion 64 y se texturiza generando un atlas UV de 2048 px. El resultado se serializa como GLB.

No se dispone en la informacion proporcionada de detalles sobre el dataset de entrenamiento, numero de tokens o imagenes, ni sobre el uso de tecnicas de alineacion (RLHF/DPO). El artefacto empaquetado referencia el commit `stabilityai/TripoSR@5b521936b01fbe1890f6f9baed0254ab6351c04a` como modelo original. La innovacion tecnica de esta release es el empaquetado para Furiosa RNGD: kernels compilados incluidos en el paquete, ejecucion en NPU sin llamadas al compilador en tiempo de replay y sin fallback a CPU del SDK, con dependencias fijadas (SDK 2026.4.0, runtime FXBEX `main@fad9892c...`, xatlas 0.0.11, moderngl 5.13.0 y EGL headless).

## Capacidades

- Reconstruccion 3D a partir de una unica imagen RGB de entrada.
- Generacion de malla GLB a resolucion 64 con textura UV de 2048 px.
- Ejecucion en NPU Furiosa RNGD mediante el runtime FXBEX, con replay verificado sin recompilacion.
- Interfaz de inferencia por fichero JSON con campos `image` y `output`, invocada mediante `fxbex predict`.
- Validacion estatica e inspeccion del paquete mediante `fxbex inspect` y `fxbex validate`.
- No soporta generacion de texto, tool calling, agentes, razonamiento multi-paso ni capacidades multilingues: es un modelo puramente visual/geometrico.

## Casos de uso

- Prototipado de assets 3D a partir de fotografias: convertir una imagen de un objeto en una malla GLB texturizada para iterar rapidamente en un pipeline de diseno, aprovechando que la salida es un GLB listo para visores web y motores de juego.
- Evaluacion de portabilidad a NPU: usar el paquete como banco de pruebas para medir el comportamiento de un modelo de vision 3D en Furiosa RNGD con el runtime FXBEX, comparando la salida NPU contra la referencia CPU con el umbral de 1e-4.
- Generacion de borradores para catalogos de e-commerce: producir mallas preliminares de productos a partir de una sola foto para previsualizacion, aceptando la resolucion 64 y la textura 2048 px como suficiente para vistas de baja fidelidad.
- Investigacion en reconstruccion 3D: servir de base reproducible (con SHA256 fijado) para experimentos que necesiten ejecutar TripoSR en hardware NPU sin depender de una GPU CUDA.
- Integracion en pipelines de validacion de paquetes FXBEX: emplear `fxbex inspect`, `fxbex validate` y `fxbex sample` sobre este artefacto como ejemplo de contrato de entrada/salida para modelos no conversacionales.
- Docencia y demos de image-to-3D: el ejemplo empaquetado `samples/robot.png` permite reproducir el flujo completo en un host RNGD sin preparar datos adicionales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

La unica evidencia de validacion aportada es cualitativa y de tolerancia numerica: la comparacion CPU/NPU de la imagen RGB de entrada y de la malla final pasa el umbral de 1e-4, mientras que los triplanos y 52 de 262144 valores de densidad lo superan. El autor califica explicitamente la release como experimental y no como aceptacion numerica completa.

## Requisitos de hardware

- Acelerador Furiosa RNGD obligatorio; no se documenta ejecucion en GPU NVIDIA, AMD ni Apple.
- SDK de Furiosa 2026.4.0 y runtime FXBEX `main@fad9892c01faf00a119f577c1b71eb361928e156`.
- Dependencias Python: xatlas 0.0.11, moderngl 5.13.0 y `huggingface_hub` para la descarga.
- Runtime EGL headless en Ubuntu: paquetes `libegl1` y `libegl-mesa0`.
- Tamano del artefacto: aproximadamente 1,7 GB en el repositorio; el fichero `model.fxbex` se descarga y verifica por SHA256.
- No cabe en GPU de consumo: el paquete esta compilado para la NPU de Furiosa y no se distribuyen pesos en safetensors ni GGUF.
- Opciones de despliegue: exclusivamente la CLI `fxbex` (`doctor`, `inspect`, `validate`, `predict`, `describe`, `sample`). No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Salida | Licencia | Hardware |
|---|---|---|---|---|---|---|
| stabilityai/TripoSR (original) | Image-to-3D | no disponible | no aplica | Malla + textura | MIT | GPU CUDA |
| softandsweet/stabilityai-triposr-rngd-fxbex | Image-to-3D empaquetado | no disponible | no aplica | GLB 64 + UV 2048 px | MIT (adaptador sin declarar) | Furiosa RNGD |
| Otros image-to-3D (p. ej. Zero123, InstantMesh) | Image-to-3D | no disponible | no aplica | Malla / multi-vista | variable | GPU CUDA |

No se dispone de datos de rendimiento comparativo entre estas alternativas en la informacion proporcionada. La diferencia principal de este artefacto frente al TripoSR original no es de calidad, sino de plataforma de ejecucion (NPU Furiosa en lugar de CUDA).

## Limitaciones y advertencias

- Release experimental: la comparacion numerica CPU/NPU no pasa el umbral de 1e-4 en triplanos ni en 52 de 262144 valores de densidad; no debe tratarse como aceptacion de inferencia en NPU.
- La validacion estatica y la publicacion del paquete no equivalen a una aceptacion de inferencia en NPU, segun advierte el propio autor.
- Dependencia estricta de hardware Furiosa RNGD y de versiones concretas de SDK y runtime; no es portable a GPU convencional.
- La licencia del adaptador empaquetado no esta declarada, aunque los pesos y el modelo original son MIT; hay que revisar todas las licencias incluidas antes de uso comercial.
- El paquete contiene kernels compilados y codigo del adaptador: solo debe cargarse desde fuentes de confianza.
- Resolucion de malla limitada a 64, adecuada para previsualizacion pero insuficiente para produccion de alta fidelidad.
- No procesa lenguaje: no hay soporte multilingue, tool calling ni razonamiento; los campos de idioma del repositorio no aplican.
- Riesgo de artefactos geometricos y de textura inherente a la reconstruccion de una sola vista, no cuantificado en la informacion disponible.
- Sin descargas ni likes en el momento de la consulta: ausencia de validacion por parte de la comunidad.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/softandsweet/stabilityai-triposr-rngd-fxbex
- Modelo original en Hugging Face: https://huggingface.co/stabilityai/TripoSR
- Commit de referencia del modelo original: https://huggingface.co/stabilityai/TripoSR/tree/5b521936b01fbe1890f6f9baed0254ab6351c04a
- Runtime FXBEX: https://github.com/smallstep-zzz/FXBEX
- Runtime FXBEX, commit fijado: https://github.com/smallstep-zzz/FXBEX/tree/fad9892c01faf00a119f577c1b71eb361928e156
