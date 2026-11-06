# radius5inc/video-model-misc

## Resumen

`radius5inc/video-model-misc` no es un modelo entrenado, sino un repositorio agregador de pesos publicados por terceros, reunidos sin modificacion en un unico paquete de 63,7 GB. El autor declara explicitamente que se trata de "copias sin modificar de pesos disponibles publicamente" y que cada fichero conserva la licencia de su repositorio de origen. El contenido gira en torno al modelo de generacion de video MiniMax-H3 y a su ecosistema de componentes (VAE, text encoders, LoRAs, upscalers), con una unica pieza ajena a ese ecosistema: Qwen3-VL-4B-Instruct como VLM.

El interes practico del repositorio es la reproducibilidad: agrupa en un solo lugar los ficheros necesarios para montar un pipeline de video en ComfyUI, con cada componente fijado por hash sha256 y con la revision exacta del repositorio de origen indicada. Esto simplifica el despliegue y la auditoria de dependencias, pero no aporta ninguna innovacion tecnica propia ni documentacion de arquitectura, entrenamiento o evaluacion.

La ficha siguiente describe, por tanto, el contenido agregado y sus implicaciones tecnicas, no un modelo con model card completa. La informacion disponible es muy limitada: no hay pipeline declarado, no hay idiomas declarados, no hay benchmarks y la licencia figura como "other" sin desglose por fichero.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (repositorio agregador; contiene un modelo de difusion de video MiniMax-H3, un VAE de video, un text encoder basado en Qwen3-VL-32B, un VLM Qwen3-VL-4B y varias LoRAs) |
| Parametros totales | no disponible (el tamano del repo es de 63,7 GB, repartido entre componentes heterogeneos) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | int8 (componente de difusion pruned int8 convrot), nvfp4 awq (text encoder), bf16 (LoRAs, upscaler, delta LoRA), fp16 (VAE de video) |
| Idiomas soportados | no disponible |
| Licencia | other (cada fichero conserva la licencia de su repositorio de origen; no se detalla cual) |
| Formato de pesos | safetensors (todos los ficheros listados) |

## Arquitectura y entrenamiento

El repositorio no entrena ni modifica ningun modelo. Su contenido se organiza en ocho grupos de ficheros, cada uno copiado desde un repositorio de Hugging Face con una revision concreta y verificado por sha256. El nucleo es MiniMax-H3, un modelo de difusion para generacion de video (variante `fl2va`, es decir, first-last frame to video with audio, segun la nomenclatura del fichero), distribuido en formato pruned int8 con convolucion rotada para reducir huella de memoria. Le acompanan un VAE de video en fp16, un text encoder Qwen3-VL-32B cuantizado en nvfp4 con AWQ, un VAE de un solo frame, un upscaler latente 3D en bf16 y tres LoRAs: una turbo de 4 pasos a 768p para ComfyUI en bf16, y una delta LoRA experimental de rango 512 que transforma la variante `fl2va` hacia `ref2va` (referencia a video con audio).

El unico componente con arquitectura documentada de forma estandar es Qwen3-VL-4B-Instruct, un modelo de vision-lenguaje de la familia Qwen3-VL, incluido como subcarpeta `vlm/Qwen/Qwen3-VL-4B-Instruct/`. No hay informacion sobre volumen de tokens de entrenamiento, composicion del dataset, ni tecnicas de alineacion (RLHF/DPO) para ninguno de los componentes, ya que esa informacion corresponderia a las model cards originales, no a este repositorio.

## Capacidades

- Generacion de video a partir de primer y ultimo frame con audio (`fl2va`), mediante el componente MiniMax-H3 pruned int8.
- Generacion de video por referencia (`ref2va`) aplicando la delta LoRA experimental de rango 512 sobre el modelo base.
- Generacion acelerada en 4 pasos a 768p mediante la LoRA turbo para ComfyUI.
- Codificacion y decodificacion de latentes de video con el VAE de video fp16 y el VAE de un solo frame.
- Aumento de resolucion de latentes 3D con el upscaler latente en bf16.
- Comprension de imagen y texto mediante Qwen3-VL-4B-Instruct (capacidad propia del VLM incluido, no del agregador).
- No hay evidencia de soporte de tool calling, agentes, thinking mode ni capacidades multilingues declaradas en este repositorio.

## Casos de uso

- Despliegue reproducible de un pipeline de video en ComfyUI: el repositorio agrupa difusion, VAE, text encoder y LoRAs con hashes fijados, lo que permite reconstruir el entorno exacto sin resolver dependencias entre multiples repositorios.
- Generacion de video con audio a partir de frame inicial y final: el componente `fl2va` pruned int8 permite interpolar movimiento y audio entre dos imagenes de referencia en flujos de postproduccion o prototipado creativo.
- Aceleracion de inferencia en produccion: la LoRA turbo de 4 pasos a 768p reduce el numero de pasos de muestreo, adecuada para generar variaciones rapidas en entornos con presupuesto de GPU limitado.
- Interpolacion y aumento de resolucion de video generado: el upscaler latente 3D en bf16 permite escalar latentes antes de la decodificacion final, util para entregables de mayor resolucion sin reentrenar el modelo base.
- Conversion de un modelo first-last frame a referencia a video: la delta LoRA de rango 512 permite experimentar con la variante `ref2va` sin disponer de los pesos completos, util para investigacion sobre adaptacion de tareas en difusion de video.
- Analisis y anotacion de frames con un VLM: la inclusion de Qwen3-VL-4B-Instruct permite describir, clasificar o etiquetar fotogramas generados dentro del mismo paquete de dependencias, por ejemplo para control de calidad automatico del video producido.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- El repositorio completo ocupa 63,7 GB en disco; el componente de difusion pruned int8 y el text encoder Qwen3-VL-32B en nvfp4 AWQ son los que dominan el consumo.
- VRAM estimada para inferencia: no disponible. No se puede calcular con rigor sin conocer el numero de parametros de MiniMax-H3 ni la resolucion y duracion objetivo.
- GPU recomendadas: no disponible. El uso de cuantizacion int8 y nvfp4 AWQ sugiere orientacion a GPUs de centro de datos (A100, H100, L40S) o a GPUs consumer de gama alta con soporte de fp8/nvfp4, pero no hay confirmacion en la informacion proporcionada.
- Compatibilidad con GPU consumer: no confirmada. La presencia de variantes int8 y nvfp4 indica intencion de reducir requisitos, pero sin especificaciones de parametros no puede afirmarse que quepa en una RTX 4090 o similar.
- Opciones de despliegue: ComfyUI es el entorno explicitamente soportado (los nombres de fichero incluyen `comfyui` y la estructura de carpetas replica la de ComfyUI: `diffusion_models`, `text_encoders`, `vae`, `loras`). Para el VLM Qwen3-VL-4B-Instruct serian aplicables vLLM, TGI o llama.cpp, aunque no se documenta en este repositorio.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| radius5inc/video-model-misc | no disponible (63,7 GB agregados) | no disponible | other (por fichero) | Hugging Face, 0 descargas | Agregador de pesos de terceros, sin model card tecnica |
| Comfy-Org/MiniMax-H3 | no disponible | no disponible | no disponible | Hugging Face | Repositorio de origen de los componentes principales de difusion, text encoder y VAE |
| lightx2v/Minimax-h3-Turbo | no disponible | no disponible | no disponible | Hugging Face | Origen de la LoRA turbo de 4 pasos a 768p |
| Qwen/Qwen3-VL-4B-Instruct | 4B (aproximado por denominacion) | no disponible | no disponible | Hugging Face | VLM incluido como subcarpeta; su model card original contiene las especificaciones completas |

## Limitaciones y advertencias

- El repositorio no es un modelo entrenado ni afinado: es una copia de pesos de terceros. Cualquier garantia de calidad, sesgo o rendimiento depende de los repositorios originales, no de este.
- La licencia figura como "other" y el autor indica que cada fichero conserva la licencia de su origen, pero no se enumeran las licencias concretas por fichero. Antes de uso comercial es imprescindible verificar cada repositorio de origen.
- No hay informacion sobre sesgos, tasas de alucinacion ni limitaciones de idioma. En el caso del VLM incluido, estos riesgos son los propios de Qwen3-VL-4B-Instruct y deben consultarse en su model card.
- La estructura de nombres (`pruned`, `int8_convrot`, `nvfp4_awq`, `delta_loras`, `rank512`) sugiere pesos experimentales o derivados; la delta LoRA se etiqueta como experimental en el repositorio de origen, lo que desaconseja su uso en produccion sin validacion.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no existe validacion comunitaria de su integridad mas alla de los hashes sha256 declarados.
- No se declara pipeline, idiomas ni entorno de ejecucion verificado; la integracion con ComfyUI se infiere de la estructura de carpetas y de los nombres de fichero, no de documentacion explicita.
- El uso de cuantizaciones nvfp4 requiere hardware y librerias con soporte especifico; en GPUs sin esa capacidad el text encoder podria no cargarse correctamente.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/radius5inc/video-model-misc
- Origen de difusion, text encoder y VAE: https://huggingface.co/Comfy-Org/MiniMax-H3
- Origen de la LoRA turbo: https://huggingface.co/lightx2v/Minimax-h3-Turbo
- Origen del upscaler latente: https://huggingface.co/LBH-123-AI/Minimax_h3_latent_Upscaler
- Origen de la delta LoRA experimental: https://huggingface.co/ethanfel/MiniMax-H3-Pruned-Ref2VA-Delta-LoRAs-Experimental
- Origen del VAE de un solo frame: https://huggingface.co/Alissonerdx/MiniMax-H3-Single-Frame-VAE-500K-Comfy
- VLM incluido: https://huggingface.co/Qwen/Qwen3-VL-4B-Instruct
