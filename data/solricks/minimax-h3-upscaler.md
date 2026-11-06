# SOLRICKS/MiniMax-H3-Upscaler

## Resumen

MiniMax-H3-Upscaler es un paquete de pesos auxiliares y flujos de trabajo para ComfyUI orientado al reescalado de vídeo con el modelo de difusión MiniMax H3. Lo publica el usuario SOLRICKS y no constituye un modelo generativo completo, sino un conjunto de dos componentes: un refiner LoRA cuantizado a INT8 (derivado de un checkpoint BF16 de terceros) y un upscaler latente aprendido en FP16. El objetivo es aumentar la resolución de clips ya generados con MiniMax H3 sin regenerarlos desde cero, preservando la tasa de fotogramas y el audio original.

El repositorio es de tamano reducido (2,6 GB) y su relevancia es practica: permite a quienes ya trabajan con MiniMax H3 en ComfyUI elevar la resolucion de sus salidas (el ejemplo de la model card pasa de 1376x768 a 1952x1088) manteniendo 24 FPS y 243 fotogramas. No aporta un modelo base nuevo ni capacidades de lenguaje, vision o razonamiento; es una herramienta de postproceso dentro de un pipeline de video-to-video.

La publicacion es experimental y muy reciente (noviembre de 2026), sin descargas ni valoraciones registradas. La licencia es heterogenea: el refiner INT8 hereda la MiniMax H3 Community License y el upscaler latente es Apache-2.0, por lo que su uso comercial exige revisar ambos terminos por separado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA refiner (INT8) sobre difusion MiniMax H3 + upscaler latente 3D conv (FP16) |
| Parametros totales | no disponible (el repo contiene adaptadores, no un modelo completo) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de video, no de texto) |
| Tipos de cuantizacion | INT8 simetrica por matriz (refiner); FP16 (upscaler latente) |
| Idiomas soportados | no disponible |
| Licencia | file-specific-model-licenses: MiniMax H3 Community License (refiner INT8) y Apache-2.0 (upscaler latente FP16) |
| Formato de pesos | safetensors |
| Tamano del repo | 2,6 GB |
| Pipeline | video-to-video |
| Modelo base | MiniMaxAI/MiniMax-H3 |
| Libreria | minimax-h3 |

## Arquitectura y entrenamiento

El paquete no entrena ningun modelo. El componente principal, `h3_upscale_refiner_int8.safetensors` (aprox. 1,88 GB), es una conversion de almacenamiento a INT8 de `open_h3_regenerate_2k_r256pp_bf16.safetensors`, procedente de `sandpies/ComfyUI-H3-Video-Upsampler` y cuyo metadato upstream apunta a `Efficient-Large-Model/Open-H3-Regenerate-2K` (LoRA, sha 8e36a091). La cuantizacion es simetrica por matriz: cada matriz LoRA ordinaria recibe su propia escala, y las dos escalas de cada par se pliegan en el alpha FLOAT32 para que ComfyUI aplique el parche LoRA con su calculo de alta precision. Se conservan los rangos por capa y las formas de matriz originales.

El segundo componente, `minimax_h3_latent_upscaler_3d_conv_v1_fp16.safetensors` (aprox. 691 MB), es un upscaler latente aprendido con convolucion 3D, publicado por LBH-123-AI y subido sin conversion adicional. La conversion a INT8 es lossy: el autor reporta un error relativo de Frobenius por matriz con mediana del 8,24 %, percentil 95 del 14,32 % y maximo del 28,41 %; son diferencias numericas de matriz, no una perdida porcentual de calidad de video. El payload BF16 original ronda los 3,51 GiB frente a los 1,75 GiB del INT8.

## Capacidades

- Reescalado de video generado con MiniMax H3, con resolucion objetivo configurable (el ejemplo usa 2,0 megapixeles).
- Preservacion de la tasa de fotogramas de origen (24 FPS en el ejemplo) y paso directo del audio fuente.
- Dimensiones ajustadas a la rejilla de 32 pixeles de H3.
- Procesamiento con chunking temporal y tiling espacial para gestionar clips largos.
- Integracion como nodo en ComfyUI mediante la extension `comfyui-solricks`.
- Exportacion a MP4 a traves de VideoHelperSuite.
- Puertos opcionales de condicionamiento de texto y audio (no conectados en el flujo de ejemplo, por lo que no requiere text encoder ni audio VAE).
- No ofrece generacion de texto, razonamiento, codigo ni tool calling: es exclusivamente video-to-video.

## Casos de uso

- Postproduccion de clips generados con MiniMax H3: se toma una salida a 1376x768 y se eleva a 1952x1088 con el refiner y el upscaler latente, manteniendo el audio y los FPS originales.
- Flujos de trabajo en ComfyUI para equipos de contenido: el JSON `MiniMax_H3_Upscaler.json` se arrastra directamente y se conectan los modelos de difusion y VAE ya instalados, reduciendo el tiempo de montaje.
- Integracion via API: el archivo `MiniMax_H3_Upscaler_API.json` permite lanzar el pipeline desde un cliente programatico en procesos automatizados de reescalado por lotes.
- Prototipado de restauracion de detalle en video: el refiner anade detalle fino sobre latentes ya generados, util para pruebas de calidad antes de comprometer una regeneracion completa.
- Evaluacion comparativa de cuantizacion: el autor propone contrastar el mismo clip con el refiner BF16 y el INT8 para medir diferencias visuales reales frente al error numerico reportado.
- Investigacion sobre upscalers latentes 3D: el componente FP16 de LBH-123-AI puede estudiarse de forma aislada dentro de pipelines de difusion de video.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card solo aporta metricas de error de cuantizacion (mediana 8,24 %, p95 14,32 %, maximo 28,41 % de error relativo de Frobenius por matriz) y un ejemplo cualitativo de resolucion (1376x768 a 1952x1088 a 24 FPS y 243 fotogramas). No hay datos de latencia, throughput ni comparaciones con otros upscalers.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; depende del modelo de difusion MiniMax H3 y del VAE de video, que son descargas separadas y no estan incluidos.
- Los pesos del repo suman unos 2,6 GB en disco, pero el consumo en ejecucion lo determina el modelo base H3, no estos adaptadores.
- GPU recomendadas: no disponible. El autor no especifica minimos ni modelos concretos.
- Compatibilidad con GPU de consumo: no confirmada; requiere evaluar el modelo H3 completo, no solo el upscaler.
- Despliegue: ComfyUI con la extension `comfyui-solricks`; exportacion MP4 con VideoHelperSuite. No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este pipeline.
- Se recomienda empezar en 2,0 megapixeles con chunking temporal y tiling espacial activados para controlar el uso de memoria.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| SOLRICKS MiniMax-H3-Upscaler | LoRA refiner INT8 + upscaler latente FP16 para H3 | no disponible (adaptadores) | no aplica | Mixta: MiniMax H3 Community License y Apache-2.0 | Hugging Face, 0 descargas |
| sandpies/ComfyUI-H3-Video-Upsampler (BF16) | Refiner LoRA BF16, origen del INT8 | no disponible | no aplica | no disponible | Hugging Face |
| LBH-123-AI/Minimax_h3_latent_Upscaler | Upscaler latente FP16, origen del componente FP16 | no disponible | no aplica | Apache-2.0 | Hugging Face |

No se dispone de datos de rendimiento comparativo entre estas alternativas en la informacion proporcionada.

## Limitaciones y advertencias

- Modelo experimental, sin descargas ni validacion comunitaria; no hay evidencia de robustez en produccion.
- La conversion a INT8 es lossy y puede degradar el detalle frente al refiner BF16 de referencia; el autor recomienda comparar el mismo clip con ambas versiones.
- Menor tamano en disco no garantiza igual calidad visual, mayor velocidad ni menor VRAM en ejecucion.
- No es un modelo autonomo: requiere el modelo de difusion MiniMax H3 FL2VA y el VAE de video H3, que son descargas separadas.
- Debe usarse un modelo de difusion sin LoRAs de generacion, Turbo o estilo, porque el nodo anade el refiner por su cuenta.
- La resolucion objetivo debe ser al menos igual a la de entrada y se ajusta a la rejilla de 32 pixeles, lo que puede alterar dimensiones no multiplos de 32.
- Licencia heterogenea: el refiner INT8 sigue la MiniMax H3 Community License y el upscaler FP16 es Apache-2.0; el uso comercial exige revisar `LICENSES.md` y `NOTICE` por separado.
- La licencia del codigo de los nodos de SOLRICKS no sustituye las licencias de los modelos.
- No hay informacion sobre sesgos, idiomas ni alucinacion, ya que no es un modelo de lenguaje.
- Fecha de publicacion muy reciente (noviembre de 2026); posible inestabilidad de la API y del formato de flujo de trabajo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/SOLRICKS/MiniMax-H3-Upscaler
- Repositorio del nodo ComfyUI: https://github.com/SOLRICKS/comfyui-solricks
- Modelo base: https://huggingface.co/MiniMaxAI/MiniMax-H3
- Modelos H3 experimentales para ComfyUI: https://huggingface.co/Kijai/MiniMax-H3-experimental
- Origen del refiner BF16: https://huggingface.co/sandpies/ComfyUI-H3-Video-Upsampler
- Origen del upscaler latente FP16: https://huggingface.co/LBH-123-AI/Minimax_h3_latent_Upscaler
- VideoHelperSuite: https://github.com/Kosinkadink/ComfyUI-VideoHelperSuite
- Licencias: https://huggingface.co/SOLRICKS/MiniMax-H3-Upscaler/blob/main/LICENSES.md
- Aviso legal: https://huggingface.co/SOLRICKS/MiniMax-H3-Upscaler/blob/main/NOTICE
- Coleccion Visual AI Models & Tools: https://huggingface.co/collections/SOLRICKS/visual-ai-models-and-tools
