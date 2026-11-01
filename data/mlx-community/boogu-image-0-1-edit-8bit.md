# mlx-community/Boogu-Image-0.1-Edit-8bit

## Resumen

Boogu-Image-0.1-Edit-8bit es la conversión cuantizada a int8 del modelo Boogu-Image-0.1-Edit, publicada por la comunidad mlx-community para su ejecución nativa en Apple Silicon mediante el framework MLX. El modelo original, desarrollado por Boogu bajo licencia Apache-2.0, resuelve tareas de edición de imágenes guiada por instrucciones en lenguaje natural: recibe una imagen de entrada y una orden textual ("make it a snowy winter evening") y devuelve la imagen modificada. Su pipeline sigue el linaje de OmniGen2, combinando un transformer de difusión (DiT) con el VAE de FLUX.1 y el planificador FlowMatchEuler.

La relevancia de esta conversión es práctica: permite ejecutar un modelo de edición de imágenes de gran tamaño en hardware de consumo de Apple sin GPU dedicada, manteniendo una fidelidad numérica muy alta respecto al original en bf16 (similitud coseno por paso de 0,999848). El repositorio ocupa 12,8 GB y el DiT cuantizado pesa aproximadamente 12,5 GB. El codificador de texto no se re-aloja: se referencia el modelo estándar Qwen3-VL-8B-Instruct, que se carga por petición y se libera antes de la fase de denoising para contener el pico de memoria.

El modelo soporta instrucciones en inglés y chino, y su licencia Apache-2.0 facilita el uso comercial. Está pensado para desarrolladores que quieran integrar edición de imágenes por instrucciones en aplicaciones macOS/iOS o en flujos de trabajo locales sobre chips de la serie M.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DiT de difusion (linaje OmniGen2) + VAE FLUX.1 + scheduler FlowMatchEuler; codificador de texto Qwen3-VL-8B-Instruct |
| Parametros totales | no disponible (pesos del repo: 12,8 GB; DiT int8 ~12,5 GB) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | int8 (group_size=32, capas Linear de atencion y FFN; embeddings, time, norm_out y AdaLN en bf16); existe tambien un tier bf16 |
| Idiomas soportados | en, zh |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (MLX) |

## Arquitectura y entrenamiento

El modelo sigue una arquitectura de difusion con un transformer (DiT) como red de denoising, acoplado al VAE de FLUX.1 para la codificacion y decodificacion de imagenes y al planificador FlowMatchEuler para el muestreo. La condicion textual la aporta Qwen3-VL-8B-Instruct, un modelo vision-lenguaje que actua como codificador de instrucciones; en esta conversion se usa el modelo original sin re-alojar y sin modificar sus pesos (bit-identical). La edicion se realiza en modo image-to-image, tomando la imagen de entrada como punto de partida del proceso de difusion.

La cuantizacion int8 aplicada por mlx-community afecta a las capas Linear de atencion y de la red feed-forward, con group_size=32, mientras que los embeddings, las proyecciones temporales, norm_out y AdaLN se mantienen en bf16. La deteccion de la configuracion de cuantizacion es automatica mediante el fichero `transformer/quant_config.json`. No se dispone de informacion sobre el volumen de datos de entrenamiento, la composicion del dataset ni el uso de RLHF o DPO en la informacion proporcionada.

## Capacidades

- Edicion de imagenes guiada por instrucciones en lenguaje natural (image-to-image).
- Generacion de texto a imagen, segun los tags del repositorio (text-to-image).
- Comprension de instrucciones en ingles y chino.
- Control del proceso de muestreo mediante numero de pasos y guia textual (por ejemplo, 50 pasos y `text_guidance=4.0`).
- Ejecucion nativa en Apple Silicon a traves de MLX, con integracion en Swift (MLXEngine) y Python (boogu-image-mlx).
- No se documenta soporte de tool calling, agentes, audio ni modo de razonamiento explicito.

## Casos de uso

- Edicion fotografica local en macOS: un usuario puede modificar una imagen ("convertirla en una tarde de invierno nevada") sin enviar datos a la nube, ya que el modelo corre integramente en el dispositivo con MLX.
- Prototipado de herramientas creativas para disenadores: integracion del pipeline en Python permite iterar rapidamente sobre variaciones de una imagen base ajustando pasos y guia textual.
- Aplicaciones iOS/macOS con privacidad por diseno: el paquete Swift `boogu-image-swift` permite incorporar edicion por instrucciones en apps nativas, manteniendo las imagenes del usuario en el dispositivo.
- Automatizacion de variaciones de producto: generar versiones editadas de fotos de catalogo (cambios de ambiente, iluminacion o estilo) en lote sobre hardware Apple.
- Preprocesado de datasets visuales: aplicar transformaciones consistentes y descritas en lenguaje natural a colecciones de imagenes antes de entrenar otros modelos.
- Educacion y demostraciones tecnicas: servir como ejemplo reproducible de un pipeline de difusion OmniGen2 cuantizado ejecutandose en hardware de consumo, util para cursos y talleres.
- Asistentes de edicion conversacionales: combinado con un LLM orquestador, el modelo puede recibir instrucciones derivadas de una conversacion y aplicarlas a la imagen activa.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El unico dato de calidad reportado es la similitud coseno por paso del DiT int8 frente al bf16: 0,999848.

## Requisitos de hardware

- VRAM/memoria unificada: 12,9 GB residentes en un M5 Max (medido como phys_footprint del proceso); pico de aproximadamente 31,7 GB a 1024x1024, porque el codificador Qwen3-VL-8B se carga por peticion y se libera antes del denoising.
- GPU recomendadas: chips Apple Silicon de gama alta (serie M Max) para el pico de memoria; en configuraciones con menos memoria unificada el pico de 31,7 GB puede ser limitante.
- Cabe en GPU de consumo: si, en Apple Silicon; no se documenta soporte para GPUs NVIDIA o AMD en esta conversion.
- Opciones de despliegue: MLX en Python (`mlx`, `mlx-vlm`, paquete `boogu-image-mlx`) y Swift (`boogu-image-swift` >= 0.5.0, `BooguImageConfiguration.edit(quant: .int8)`). No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tipo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Boogu-Image-0.1-Edit-8bit (esta ficha) | no disponible (repo 12,8 GB) | no disponible | Edicion de imagen por instrucciones, MLX int8 | Apache-2.0 | HuggingFace (mlx-community) |
| Boogu-Image-0.1-Edit (bf16) | no disponible | no disponible | Edicion de imagen por instrucciones | Apache-2.0 | HuggingFace (Boogu) |
| Boogu-Image-0.1-Turbo-8bit | no disponible | no disponible | Variante turbo, MLX int8 | no disponible | HuggingFace (mlx-community) |

No se dispone de datos de rendimiento comparado con otros modelos de edicion de imagen en la informacion proporcionada.

## Limitaciones y advertencias

- Solo se documentan los idiomas ingles y chino; el rendimiento en castellano no esta garantizado.
- Al ser un modelo de difusion, puede producir ediciones inconsistentes con la instruccion o artefactos visuales; no se han publicado evaluaciones cuantitativas de fidelidad.
- El pico de memoria de aproximadamente 31,7 GB a 1024x1024 limita su uso a equipos Apple con memoria unificada abundante.
- La conversion depende de MLX y de Apple Silicon; no es portable a otros backends sin reconversion.
- El codificador Qwen3-VL-8B-Instruct se descarga por separado desde su repositorio original, lo que anade una dependencia externa y consumo de red en el primer uso.
- La licencia Apache-2.0 permite uso comercial, pero conviene revisar el README del modelo base para condiciones adicionales del autor original.
- No se documentan sesgos especificos ni evaluaciones de seguridad en la informacion disponible.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/mlx-community/Boogu-Image-0.1-Edit-8bit
- Modelo base: https://huggingface.co/Boogu/Boogu-Image-0.1-Edit
- Tier bf16: https://huggingface.co/mlx-community/Boogu-Image-0.1-Edit-bf16
- Variante Turbo 8bit: https://huggingface.co/mlx-community/Boogu-Image-0.1-Turbo-8bit
- Codificador de texto: https://huggingface.co/Qwen/Qwen3-VL-8B-Instruct
- Codigo Python: https://github.com/xocialize/boogu-image-mlx
- Codigo Swift: https://github.com/xocialize/boogu-image-swift
- Licencia del modelo base: https://huggingface.co/Boogu/Boogu-Image-0.1-Edit/blob/main/README.md
