# luokelabs/Qwen3.5-9B-4bit

## Resumen

Qwen3.5-9B-4bit (luokelabs) es un espejo del modelo multimodal Qwen3.5-9B en formato MLX con cuantizacion de 4 bits, publicado por el usuario luokelabs a partir del repositorio original de mlx-community (`mlx-community/Qwen3.5-9B-4bit`). El proposito declarado del espejo es facilitar la descarga en China para la aplicacion local "luoke" (螺壳), cuyo sistema comprueba el hash de cada fichero antes de usarlo como modelo base en los perfiles de 16 y 32 GB de memoria. Los pesos, el config y el tokenizer son identicos byte a byte al original de mlx-community; solo se anaden una descripcion y una licencia.

El modelo subyacente es `Qwen/Qwen3.5-9B` de Alibaba Qwen, con 9.409.813.744 parametros (aproximadamente 9,4 mil millones) y una etiqueta de pipeline `image-text-to-text`, lo que indica que se trata de un modelo vision-lenguaje capaz de procesar imagenes y texto. La cuantizacion de 4 bits es de tipo afino (affine) con group size 64 y fue realizada por mlx-community con mlx-vlm 0.3.12.

Es relevante para desarrolladores que trabajen en Apple Silicon, ya que el formato MLX permite ejecutar un modelo multimodal de casi 9,4 mil millones de parametros en equipos de consumo con memoria unificada de 16 o 32 GB, sin necesidad de GPUs dedicadas. Al ser un espejo, no aporta pesos nuevos ni variaciones de entrenamiento respecto al original.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo multimodal image-text-to-text; etiqueta de pipeline) |
| Parametros totales | 9.409.813.744 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 4 bits afino (affine), group size 64 |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | MLX (safetensors; etiqueta `safetensors` en metadatos) |

## Arquitectura y entrenamiento

No se dispone de informacion detallada sobre la arquitectura interna, el numero de tokens de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de RLHF o DPO. La unica informacion tecnica confirmada es la derivada de las etiquetas y de la model card: el modelo base es `Qwen/Qwen3.5-9B-Base`, tiene 9.409.813.744 parametros y esta etiquetado como `image-text-to-text`, lo que implica capacidad de procesamiento conjunto de imagen y texto.

La innovacion destacable de esta publicacion no es de arquitectura, sino de empaquetado: la cuantizacion de 4 bits afino con group size 64 fue realizada por mlx-community con mlx-vlm 0.3.12, y este repositorio replica esos ficheros sin modificacion alguna. El proceso de cuantizacion reduce el tamano del repositorio a 6,0 GB, frente al peso en precision completa de un modelo de ~9,4B. No se documentan tecnicas adicionales como decodificacion especulativa, atencion lineal ni modos de razonamiento extendido.

## Capacidades

- Generacion de texto conversacional, segun la etiqueta `conversational`.
- Procesamiento multimodal imagen-texto (`image-text-to-text`): descripcion de imagenes y respuesta a instrucciones que incluyen una imagen.
- Ejecucion local en Apple Silicon mediante MLX, sin dependencia de servicios en la nube.
- Inferencia reproducible gracias a la verificacion por hash de cada fichero que realiza el sistema luoke.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible.
- Capacidades especiales (modo thinking, audio, etc.): no disponible.

## Casos de uso

- Descripcion de imagenes en local: el modelo puede recibir una imagen y generar una descripcion en lenguaje natural, ejecutandose enteramente en el Mac del usuario sin enviar datos a terceros. Es adecuado por su condicion de modelo image-text-to-text y su formato MLX.
- Extraccion de texto e informacion de documentos escaneados: capturas, facturas o formularios fotografiados pueden procesarse en local aprovechando la entrada multimodal, manteniendo datos sensibles fuera de la nube.
- Asistentes conversacionales de escritorio: la aplicacion luoke lo utiliza como modelo base para perfiles de 16 y 32 GB de memoria, de modo que un asistente local puede mantener conversaciones multi-turno sin coste de API.
- Prototipado de aplicaciones de vision-lenguaje en Apple Silicon: desarrolladores que quieran validar un pipeline VLM antes de invertir en infraestructura pueden usar este espejo con 6,0 GB de descarga y el runtime MLX.
- Accesibilidad: generacion automatica de descripciones de imagenes para personas con discapacidad visual, en un equipo de consumo y sin conexion.
- Analisis de capturas de interfaz o imagenes de producto: revision automatica de pantallazos, catalogos o material grafico dentro de flujos de trabajo locales.
- Integracion en herramientas internas con verificacion de integridad: la comprobacion por hash de cada fichero encaja en entornos que exigen reproducibilidad y cadena de custodia del modelo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM / memoria estimada: el repositorio ocupa 6,0 GB en cuantizacion de 4 bits sobre 9,4 mil millones de parametros. La model card indica su uso en perfiles de 16 y 32 GB de memoria unificada, por lo que se recomienda un minimo de 16 GB.
- Plataforma: el formato MLX esta disenado para Apple Silicon (series M1, M2, M3, M4). No se ejecuta de forma nativa en GPUs NVIDIA mediante MLX.
- GPUs dedicadas (A100, H100, RTX 4090): no aplicables al formato MLX; para esas plataformas habria que recurrir a una conversion distinta (GGUF, safetensors en precision completa o FP16) del modelo base `Qwen/Qwen3.5-9B`.
- Cabe en GPU de consumo: no disponible en formato MLX; para tarjetas NVIDIA se necesitaria otra distribucion de pesos.
- Opciones de despliegue: `mlx-vlm` es el runtime documentado. Ejemplo de uso incluido en la model card:
  `python -m mlx_vlm.generate --model mlx-community/Qwen3.5-9B-4bit --max-tokens 100 --temperature 0.0 --prompt "Describe this image." --image <path_to_image>`
  No se documentan despliegues con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| luokelabs/Qwen3.5-9B-4bit | 9.409.813.744 | no disponible | MLX 4 bits | apache-2.0 | HuggingFace (espejo) |
| mlx-community/Qwen3.5-9B-4bit | 9.409.813.744 (identico) | no disponible | MLX 4 bits | apache-2.0 | HuggingFace |
| Qwen/Qwen3.5-9B | no disponible | no disponible | safetensors (precision completa) | apache-2.0 | HuggingFace |

Los tres repositorios comparten pesos base; la diferencia es el formato de empaquetado y el canal de distribucion. No se dispone de datos de rendimiento que permitan una comparacion cuantitativa con alternativas de otros fabricantes.

## Limitaciones y advertencias

- Sesgos conocidos: no disponibles; no se documenta ninguna evaluacion de sesgo.
- Riesgo de alucinacion: no disponible de forma especifica, si bien al ser un modelo generativo de ~9,4B es esperable, aunque no se aportan datos que lo cuantifiquen.
- Limitaciones de contexto e idioma: no disponibles. La model card original esta en chino e ingles; no se confirma el soporte de castellano.
- Restricciones de licencia: Apache License 2.0, segun la model card y el enlace `https://huggingface.co/Qwen/Qwen3.5-9B/blob/main/LICENSE`. Permite uso comercial con las condiciones de dicha licencia.
- Al ser un espejo, cualquier problema de integridad de pesos procede del repositorio original de mlx-community; el autor indica que los ficheros son identicos byte a byte, pero conviene verificar los hashes antes de usarlo en produccion.
- El repo tiene 0 descargas y 0 likes, y fue publicado el 2026-10-16, por lo que carece de validacion por parte de la comunidad.
- El formato MLX limita su uso a Apple Silicon; no es portable directamente a entornos con GPUs NVIDIA sin conversion previa.
- Etiquetado ambiguo: los metadatos incluyen `transformers` y `safetensors`, pero la model card especifica formato MLX y `mlx-vlm`; conviene tratarlo como modelo MLX a efectos de despliegue.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/luokelabs/Qwen3.5-9B-4bit
- Modelo original en mlx-community: https://huggingface.co/mlx-community/Qwen3.5-9B-4bit
- Modelo base en Qwen: https://huggingface.co/Qwen/Qwen3.5-9B
- Modelo base (variante Base): https://huggingface.co/Qwen/Qwen3.5-9B-Base
- Licencia: https://huggingface.co/Qwen/Qwen3.5-9B/blob/main/LICENSE
- Repositorio de GitHub de mlx-vlm: no disponible en la informacion proporcionada
- Papers o blogs adicionales: no disponibles en la informacion proporcionada
