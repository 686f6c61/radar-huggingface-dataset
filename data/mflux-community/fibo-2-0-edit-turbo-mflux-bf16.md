# mflux-community/fibo-2-0-edit-turbo-mflux-bf16

## Resumen

Fibo-2.0-edit-turbo-mflux-bf16 es una conversión comunitaria a formato MLX (Apple Silicon) del modelo de generación y edición de imágenes Fibo-2.0-edit-turbo, desarrollado originalmente por Bria AI. La conversión la mantiene MFlux-Community y emplea MFlux, una implementación nativa en MLX creada por Filip Strand que permite ejecutar localmente en un Mac modelos generativos de imagen de última generación sin depender de CUDA ni de servicios en la nube.

Este repositorio concreto contiene los pesos en BF16, es decir, la build MLX a precisión completa sin cuantización, con un tamaño de 25,1 GB. Se posiciona como la referencia de máxima fidelidad frente a las variantes cuantizadas del mismo modelo (Q8, Q6, Q5, Q4 y Q3), que van de 13,4 GB a 5,6 GB. La conversión se realizó con MFlux 0.23.0 el 25 de octubre de 2026.

La relevancia del modelo radica en dos factores: por un lado, Fibo-2.0-edit-turbo es un modelo de edición de imagen por prompt de texto orientado a producción y con version "turbo" (pocos pasos de inferencia); por otro, esta conversión traslada esa capacidad al ecosistema Apple Silicon mediante MLX, un stack que hasta hace poco carecía de soporte maduro para modelos de difusión de gran tamano. No es una release oficial de Bria: es una conversión de pesos que mantiene sin cambios la licencia original.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | modelo de difusion para texto-a-imagen y edicion de imagen (detalles de la arquitectura no disponibles en la informacion proporcionada) |
| Parametros totales | no disponible (el repo pesa 25,1 GB en BF16) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica / no disponible |
| Tipos de cuantizacion | BF16 (este repo); variantes Q8, Q6, Q5, Q4 y Q3 en repos hermanos; soporte de `--quantize` en tiempo de ejecucion |
| Idiomas soportados | no disponibles (prompts en lenguaje natural; el modelo original no declara lista de idiomas) |
| Licencia | fibo-2.0-edit-turbo-license (hereda la del modelo original; ver terminos en briaai/Fibo-2.0-edit-turbo) |
| Formato de pesos | safetensors en formato MLX |

## Arquitectura y entrenamiento

No se dispone de informacion detallada sobre la arquitectura interna ni sobre el proceso de entrenamiento en la documentacion proporcionada. El modelo base, briaai/Fibo-2.0-edit-turbo, es un modelo de difusion para generacion y edicion de imagenes a partir de texto, y el sufijo "turbo" indica una variante optimizada para inferencia con pocos pasos. Los detalles sobre el tipo de backbone (UNet, DiT u otro), el numero de parametros, el volumen de tokens de entrenamiento, la composicion del dataset y el uso de RLHF o DPO no estan disponibles.

La innovacion tecnica relevante de este repositorio es la conversion a MLX: los pesos originales se han transformado al formato nativo de MLX para ejecutarse en Apple Silicon mediante MFlux 0.23.0. La conversion no altera la arquitectura ni los pesos mas alla del cambio de formato, y el repositorio BF16 sirve como referencia de maxima fidelidad; el usuario puede aplicar cuantizacion en el momento de la inferencia con el flag `--quantize`.

## Capacidades

- Generacion de imagenes a partir de prompts de texto (text-to-image), con resoluciones configurables (el ejemplo oficial usa 1024x1024).
- Edicion de imagenes guiada por texto, segun la naturaleza "edit" del modelo base.
- Inferencia "turbo": disenado para generar con pocos pasos de difusion.
- Control de semilla (`--seed`) para reproducibilidad.
- Ejecucion local en Apple Silicon mediante MLX, sin GPU NVIDIA ni servicios externos.
- Cuantizacion en tiempo de ejecucion mediante `--quantize` sobre la build BF16.
- Soporte de tool calling / function calling: no disponible (no es un modelo de lenguaje).
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponibles; el modelo no declara lista de idiomas.
- Capacidades de vision, audio o thinking mode: no disponibles en la informacion proporcionada.

## Casos de uso

- Edicion de imagenes en local para diseno grafico: un disenador puede modificar una imagen existente mediante un prompt de texto en su Mac, sin subir material a la nube, usando la build BF16 como referencia de maxima calidad.
- Prototipado rapido de assets para videojuegos: generacion de conceptos de personajes y escenarios a 1024x1024 con semilla fija para iterar de forma reproducible antes de pasar a produccion.
- Generacion de imagenes para marketing y redes sociales: el modelo turbo permite obtener resultados en pocos pasos, adecuado para flujos de trabajo con muchas variantes por campana.
- Pipelines de edicion por lotes en estaciones de trabajo Apple: integracion del CLI `mflux-generate-fibo2-edit` en scripts de shell para procesar directorios de imagenes con prompts predefinidos.
- Evaluacion y benchmarking de modelos de difusion en MLX: al ser la build BF16 sin cuantizar, sirve como linea base para medir la perdida de calidad de las variantes Q8-Q3.
- Investigacion en privacidad de datos: al ejecutarse totalmente en local, permite trabajar con imagenes sensibles sin salir del equipo.
- Desarrollo de herramientas de edicion fotografica asistida: el modelo puede integrarse como backend de una app de escritorio para Mac que aplique cambios guiados por texto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM / memoria unificada estimada: la build BF16 ocupa 25,1 GB de pesos, por lo que requiere un Mac con al menos 32 GB de memoria unificada para cargar el modelo con margen; las variantes cuantizadas reducen el requisito a 13,4 GB (Q8), 10,3 GB (Q6), 8,8 GB (Q5), 7,2 GB (Q4) y 5,6 GB (Q3).
- GPU recomendadas: exclusivamente Apple Silicon (M1, M2, M3, M4 y posteriores) con memoria unificada suficiente; no hay soporte CUDA en este repositorio.
- Cabe en GPU consumer: si, en equipos Apple Silicon; en GPUs NVIDIA no es desplegable directamente por el formato MLX.
- Opciones de despliegue: MFlux (CLI `mflux-generate-fibo2-edit`), instalable con `uv tool install --upgrade mflux`; descarga de pesos con `hf download`. No se documenta soporte para vLLM, llama.cpp, Ollama o TGI, que estan orientados a modelos de lenguaje.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| fibo-2-0-edit-turbo-mflux-bf16 (este) | no disponible (25,1 GB BF16) | no aplica | fibo-2.0-edit-turbo-license | HuggingFace, MLX | Conversion comunitaria para Apple Silicon |
| briaai/Fibo-2.0-edit-turbo | no disponible | no aplica | fibo-2.0-edit-turbo-license | HuggingFace | Modelo original de Bria AI, pesos sin convertir |
| mflux-community/fibo-2-0-edit-turbo-mflux-q8 | no disponible (13,4 GB) | no aplica | fibo-2.0-edit-turbo-license | HuggingFace, MLX | Misma conversion con cuantizacion Q8, menor huella de memoria |

No se dispone de informacion sobre otros modelos de edicion de imagen comparables (por ejemplo, variantes de Stable Diffusion o FLUX) en la documentacion proporcionada, por lo que no se incluyen en la tabla.

## Limitaciones y advertencias

- No es una release oficial de Bria AI: es una conversion comunitaria de los pesos; los autores originales no la respaldan.
- La licencia fibo-2.0-edit-turbo-license puede imponer restricciones de uso comercial; es imprescindible revisar los terminos en la model card del modelo original antes de usarlo en produccion.
- El repositorio esta limitado a Apple Silicon y al stack MLX; no es portable a GPUs NVIDIA ni a otros runtimes sin reconversion.
- La build BF16 requiere una cantidad elevada de memoria unificada (25,1 GB de pesos); en equipos con menos de 32 GB conviene usar las variantes cuantizadas.
- No se documentan sesgos, tasas de alucinacion visual ni limitaciones de idioma del modelo original en la informacion disponible.
- No hay datos publicados de benchmarks ni de rendimiento (latencia, throughput) en la informacion proporcionada.
- El modelo es de generacion y edicion de imagen, no de texto: no soporta tool calling, agentes ni razonamiento multi-paso.
- El repositorio tiene un volumen de descargas muy bajo (83) y cero likes, lo que sugiere poca validacion por parte de la comunidad.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/mflux-community/fibo-2-0-edit-turbo-mflux-bf16
- Modelo base original: https://huggingface.co/briaai/Fibo-2.0-edit-turbo
- Repositorio MFlux: https://github.com/filipstrand/mflux
- Organizacion MFlux-Community: https://huggingface.co/mflux-community
- Variante Q8: https://huggingface.co/mflux-community/fibo-2-0-edit-turbo-mflux-q8
- Variante Q6: https://huggingface.co/mflux-community/fibo-2-0-edit-turbo-mflux-q6
- Variante Q5: https://huggingface.co/mflux-community/fibo-2-0-edit-turbo-mflux-q5
- Variante Q4: https://huggingface.co/mflux-community/fibo-2-0-edit-turbo-mflux-q4
- Variante Q3: https://huggingface.co/mflux-community/fibo-2-0-edit-turbo-mflux-q3
