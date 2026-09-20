# BennyDaBall/Qwen-Image-2.1-NVFP4

## Resumen

Qwen-Image-2.1-NVFP4 es una cuantizacion independiente en NVFP4 del modelo de difusion texto-a-imagen Qwen Image 2.1, publicada por el usuario BennyDaBall. No es un modelo base nuevo ni un lanzamiento oficial de Qwen: se trata de una conversion del paquete de pesos BF16 oficial de Comfy-Org (Qwen-Image-2.1) a un formato NVFP4 nativo de ComfyUI, con el objetivo de reducir el espacio en disco y acelerar la inferencia en GPUs Blackwell (RTX 50 series) sin recurrir a GGUF ni a una recuantizacion de la release INT8.

El paquete completo ocupa 12,42 GB e incluye tres ficheros: el transformer de imagen cuantizado (4,20 GB), el encoder de texto Qwen3-VL 8B tambien cuantizado (7,55 GB) y el VAE en BF16 sin modificar (0,68 GB). Frente a los 32,44 GB del conjunto BF16 original, supone una reduccion del 61,7 por ciento en disco. La cuantizacion es mixta: la torre de vision, los embeddings de tokens, la cabeza de lenguaje, las capas de entrada/salida del modelo de imagen, timesteps, modulaciones y normalizaciones se mantienen en BF16.

Su relevancia es practica: permite ejecutar generacion y edicion de imagen de 1024x1024 en 40 pasos en una RTX 5090 en 6,746 s de mediana, frente a 15,629 s en BF16 y 7,553 s con la release INT8 oficial, segun la validacion del autor. La licencia qwen-research-license restringe el uso a investigacion y evaluacion, lo que condiciona cualquier despliegue comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de difusion para imagen (image transformer) con encoder de texto Qwen3-VL 8B y VAE independiente |
| Parametros totales | no disponible (la model card no publica el recuento de parametros) |
| Parametros activos | no aplicable (no es un modelo MoE) |
| Longitud de contexto | no disponible / no aplicable (pipeline de difusion texto-a-imagen, no de generacion de texto) |
| Tipos de cuantizacion | NVFP4 nativo: FP4 empaquetado E2M1, escalas por bloques de 16 en E4M3 FP8 y escalas de tensor en FP32; precision mixta con tensores en BF16 |
| Idiomas soportados | no disponible (la model card no documenta cobertura de idiomas; el encoder es Qwen3-VL 8B) |
| Licencia | qwen-research-license (uso de investigacion y evaluacion unicamente) |
| Formato de pesos | safetensors (fichero unico de difusion, diffusion-single-file); VAE tambien en safetensors BF16 |
| Modelo base | Comfy-Org/Qwen-Image-2.1 (relacion: quantized); original de Qwen: Qwen/Qwen-Image-2.1 |
| Pipeline | text-to-image (con soporte de edicion de imagen por referencia) |
| Tamano del paquete | 12,42 GB en tres ficheros (repo: 12,5 GB); BF16 original: 32,44 GB (61,7 por ciento menos) |
| Ficheros | qwen_image_2.1_nvfp4.safetensors 4,20 GB; qwen3vl_8b_nvfp4.safetensors 7,55 GB; qwen_image_2.1_vae_bf16.safetensors 0,68 GB |
| Entorno probado | ComfyUI 0.36.0, PyTorch 2.14.0+cu130, comfy-kitchen 0.2.35, RTX 5090 |
| Revision de origen | Comfy-Org/Qwen-Image-2.1, revision ace0edeb3791a594ddfa36ed5f41a178a394e921 |
| Fecha de publicacion | 20 de septiembre de 2026 (ultima actualizacion ese mismo dia) |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

El modelo base Qwen Image 2.1 combina un transformer de difusion que genera las imagenes con un encoder de texto Qwen3-VL 8B que procesa las indicaciones textuales, mas un VAE en BF16. Esta version no entrena ni ajusta nada: la model card indica explicitamente que no se uso calibracion ni fine-tuning para la conversion. El autor convirtio directamente los pesos BF16 oficiales a NVFP4 nativo de ComfyUI, conservando el layout de escalas nativo y metadatos `comfy_quant` por capa.

El reparto de precision es el siguiente. En el transformer de imagen se cuantizan a NVFP4 192 matrices de atencion (Q, K, V y salida) y las matrices fusionadas del MLP (gate, up y output). En el backbone de lenguaje Qwen3-VL se cuantizan 252 matrices de atencion y MLP. Permanecen en los tensores BF16 originales: la torre de vision, los embeddings de tokens, la cabeza de lenguaje, las capas de entrada/salida del modelo de imagen, el timestep, la modulacion y las normalizaciones. El VAE se conserva como el fichero BF16 sin cambios. Las escalas son bloques E4M3 FP8 de 16 elementos con escalas de tensor en FP32.

La aceleracion real depende de las FP4 kernels de Blackwell. El autor incluye ademas un parche de runtime para que el acondicionamiento de texto use NVFP4; sin ese parche, los mismos modelos y nodos funcionan, pero el acondicionamiento de texto recurre a pesos dequantizados y activaciones FP32, mientras que el denoising sigue usando NVFP4. No se introducen nodos nuevos: se emplean nodos core de ComfyUI (`UNETLoader`, `CLIPLoader` con tipo `qwen_image`, `TextEncodeQwenImage21`, `KSampler` y VAE).

## Capacidades

- Generacion de imagen texto-a-imagen: los workflows incluidos producen ejemplos de producto a 1024x1024, y el flujo de tipografia trabaja a 2048x2048.
- Edicion de imagen por referencia: el flujo 02 acepta una imagen de referencia y aplica cambios coherentes de material, color y objeto.
- Salida con canal alfa nativo: el flujo 03 genera RGBA transparente sin nodo de eliminacion de fondo.
- Tipografia controlada: el flujo 04 genera un poster 2K con el texto solicitado, segun la validacion del autor.
- Acondicionamiento de texto con encoder Qwen3-VL 8B, que incluye torre de vision en BF16 (relevante para referencias visuales).
- Integracion en ComfyUI mediante nodos core y workflows importables; existe un directorio de equivalentes de API.
- Ejecucion con FP4 real tanto en denoising como en acondicionamiento de texto cuando se aplica el parche de runtime incluido.
- No se documentan en la informacion disponible capacidades de tool calling, function calling, agentes, modo thinking ni procesamiento de audio, ya que no se trata de un modelo de lenguaje generativo.

## Casos de uso

- Generacion de imagenes de producto para comercio electronico: partiendo del workflow 01 y ajustando prompt y tamano de latente, el modelo produce imagenes de catalogo a 1024x1024 en 40 pasos; en la RTX 5090 probada, cada iteracion cuesta 6,746 s de mediana, lo que permite barridos de variaciones en minutos.
- Edicion de fotografia comercial con imagen de referencia: el workflow 02 toma una unica referencia y aplica cambios de material, color y objeto manteniendo coherencia, adecuado para sustitucion de fondos, cambios de acabado o variaciones de packaging.
- Recorte de producto con transparencia para maquetacion: el workflow 03 entrega RGBA con alfa nativo, eliminando el paso separado de segmentacion o eliminacion de fondo en el pipeline de diseno.
- Carteleria y packaging con texto controlado: el workflow 04 trabaja a 2048x2048 con tipografia exacta, util para posters, etiquetas y mockups donde la legibilidad del texto es critica.
- Prototipado local en estacion de trabajo con GPU Blackwell: al ocupar 12,42 GB en disco el paquete completo, encaja en flujos de trabajo de estudio donde se quiere evitar dependencias de servicios en la nube y mantener los datos en local.
- Automatizacion de produccion de contenido dentro de ComfyUI: los equivalentes de API permiten encadenar la generacion y edicion en pipelines programaticos para campanas, variantes de creatividades o generacion por lotes.
- Investigacion sobre cuantizacion y precision: el repositorio incluye 24 pares comparativos con las mismas semillas entre BF16 y NVFP4, utiles para estudiar la degradacion introducida por FP4 en tareas de difusion y tipografia.
- Evaluacion comparativa de kernels FP4 en hardware de consumo: el benchmark publicado enfrenta NVFP4, BF16 e INT8 en la misma GPU y con el mismo prompt, sirviendo como referencia metodologica para equipos que valoran migrar sus pesos.

## Benchmarks y rendimiento

Unica medicion publicada en la informacion disponible: una RTX 5090, una prompt, 1024x1024, 40 pasos, tres ejecuciones en caliente por variante, con todos los nodos ejecutados incluida la codificacion de texto. La variante NVFP4 se midio con el parche del encoder aplicado.

| Variante | Tiempo mediano (1024x1024, 40 pasos) | Notas |
|---|---|---|
| NVFP4 (este paquete) | 6,746 s | Con parche de runtime para acondicionamiento de texto |
| INT8 oficial | 7,553 s | Release INT8 del modelo base |
| BF16 original | 15,629 s | Pesos BF16 de referencia |

No se han publicado resultados de benchmarks estandar (por ejemplo FID, CLIP score, MMLU o HumanEval) en la informacion disponible. La model card advierte que se trata de una unica prompt de prueba y que el benchmark no constituye una comparacion universal de calidad.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. La model card advierte explicitamente que los tamanos de fichero son GB decimales en disco y no un requisito de memoria. Como referencia de carga, el paquete suma 12,42 GB de pesos (4,20 GB de transformer, 7,55 GB de encoder, 0,68 GB de VAE), a lo que hay que anadir las activaciones en FP32 del acondicionamiento de texto si no se aplica el parche y los tensores que permanecen en BF16.
- GPU recomendada: RTX 5090, unica GPU verificada por el autor. Al usar kernels FP4 nativos, el rendimiento esperado depende de hardware Blackwell.
- Compatibilidad con GPU de consumo: si, segun la validacion, en RTX 5090; no hay datos publicados para otras GPU de consumo.
- Compatibilidad con aceleradores de datacenter: no disponible; no se documentan pruebas en A100, H100 ni similares.
- Despliegue: ComfyUI 0.36.0 o superior con soporte nativo de NVFP4 y con los nodos `TextEncodeQwenImage21`; PyTorch 2.14.0+cu130; comfy-kitchen 0.2.35. Las builds antiguas sin la integracion de Qwen Image 2.1 no funcionan. No se documentan rutas de despliegue con vLLM, llama.cpp, Ollama ni TGI.
- Instalacion: los tres safetensors se colocan en `ComfyUI/models/diffusion_models/`, `ComfyUI/models/text_encoders/` y `ComfyUI/models/vae/` respectivamente; los workflows se importan con Ctrl+O.
- Parametros de muestreo por defecto: 40 pasos, Euler, scheduler simple, CFG 1, denoise 1. El dtype de pesos de difusion debe quedar en default.
- Latencia y throughput: 6,746 s de mediana por imagen a 1024x1024 y 40 pasos en RTX 5090; no se publican cifras de throughput por lote ni de latencia a 2048x2048.

## Comparativa con modelos similares

La informacion disponible solo permite comparar el paquete NVFP4 con las otras distribuciones del mismo Qwen Image 2.1. No hay datos de modelos comparables de otros fabricantes.

| Version | Parametros | Contexto | Rendimiento publicado | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| BennyDaBall/Qwen-Image-2.1-NVFP4 | no disponible | no aplicable | 6,746 s (1024x1024, 40 pasos, RTX 5090) | qwen-research-license (investigacion y evaluacion) | HuggingFace, safetensors, 12,42 GB |
| Comfy-Org/Qwen-Image-2.1 (BF16) | no disponible | no aplicable | 15,629 s (misma prueba) | segun el modelo base | HuggingFace, 32,44 GB |
| Release INT8 oficial | no disponible | no aplicable | 7,553 s (misma prueba) | segun el modelo base | HuggingFace, tamano no disponible |
| Qwen/Qwen-Image-2.1 (original) | no disponible | no aplicable | no disponible | qwen-research-license | HuggingFace |

Comparativa con alternativas de terceros (por ejemplo familias tipo FLUX o Stable Diffusion): no disponible en la informacion proporcionada.

## Limitaciones y advertencias

- Licencia restrictiva: qwen-research-license limita el uso a investigacion y evaluacion; no se autoriza uso comercial segun la propia model card.
- No es un lanzamiento oficial: se trata de una cuantizacion independiente; el autor indica que el modelo y la arquitectura originales son trabajo de Qwen. Cualquier soporte o garantia recae fuera del equipo original.
- La cuantizacion altera los resultados: la model card avisa de que no hay promesa de salida identica al pixel respecto a BF16 ni un ranking universal de calidad, aunque se publiquen 24 pares comparativos con las mismas semillas.
- Sin calibracion ni fine-tuning durante la conversion, lo que puede traducirse en desviaciones en segun que tipos de prompt.
- Dependencia estricta del entorno: requiere ComfyUI con soporte nativo de NVFP4 y el nodo `TextEncodeQwenImage21`; versiones antiguas no funcionan. Sin el parche de runtime, el acondicionamiento de texto se ejecuta con pesos dequantizados y activaciones FP32, con la perdida de rendimiento correspondiente.
- Rendimiento ligado a hardware Blackwell: la aceleracion medida se obtuvo con kernels FP4 reales en RTX 5090; no hay datos para otras arquitecturas.
- Validacion limitada: el benchmark publicado es de una unica prompt y tres ejecuciones en caliente, no un conjunto de evaluacion amplio. El repositorio acumula 0 descargas y 0 likes, por lo que no existe validacion independiente de la comunidad.
- Riesgos propios de los modelos de difusion: artefactos, incoherencias en el texto generado, sesgos heredados de los datos de entrenamiento del modelo base y posible reproduccion de estilos o contenidos protegidos. La model card no documenta sesgos ni composicion del dataset de entrenamiento original.
- Idiomas: no hay informacion sobre cobertura linguistica ni calidad por idioma en el acondicionamiento de texto.
- Higiene de ficheros: el VAE incluido es identico al original; si ya se dispone de el, se recomienda conservar el existente y no duplicarlo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/BennyDaBall/Qwen-Image-2.1-NVFP4
- Modelo base (paquete BF16 de Comfy-Org): https://huggingface.co/Comfy-Org/Qwen-Image-2.1
- Modelo original de Qwen: https://huggingface.co/Qwen/Qwen-Image-2.1
- Licencia incluida: https://huggingface.co/BennyDaBall/Qwen-Image-2.1-NVFP4/blob/main/LICENSE
- Validacion (metodo, resultados medidos y requisitos): https://huggingface.co/BennyDaBall/Qwen-Image-2.1-NVFP4/blob/main/VALIDATION.md
- Comparativas BF16 frente a NVFP4 (24 pares): https://huggingface.co/BennyDaBall/Qwen-Image-2.1-NVFP4/blob/main/COMPARISONS.md
- Guia de prompting (texto, edicion, tipografia, transparencia): https://huggingface.co/BennyDaBall/Qwen-Image-2.1-NVFP4/blob/main/PROMPTING.md
- Parche de runtime para acondicionamiento NVFP4: https://huggingface.co/BennyDaBall/Qwen-Image-2.1-NVFP4/blob/main/runtime/README.md
- Workflow 01, texto a imagen: https://huggingface.co/BennyDaBall/Qwen-Image-2.1-NVFP4/blob/main/workflows/01_Text_to_Image.json
- Workflow 02, edicion de imagen: https://huggingface.co/BennyDaBall/Qwen-Image-2.1-NVFP4/blob/main/workflows/02_Image_Editing.json
- Workflow 03, RGBA transparente: https://huggingface.co/BennyDaBall/Qwen-Image-2.1-NVFP4/blob/main/workflows/03_Transparent_RGBA.json
- Workflow 04, tipografia 2K: https://huggingface.co/BennyDaBall/Qwen-Image-2.1-NVFP4/blob/main/workflows/04_2K_Typography.json
- Pesos cuantizados del transformer: https://huggingface.co/BennyDaBall/Qwen-Image-2.1-NVFP4/blob/main/diffusion_models/qwen_image_2.1_nvfp4.safetensors
- Encoder de texto cuantizado: https://huggingface.co/BennyDaBall/Qwen-Image-2.1-NVFP4/blob/main/text_encoders/qwen3vl_8b_nvfp4.safetensors
- VAE en BF16: https://huggingface.co/BennyDaBall/Qwen-Image-2.1-NVFP4/blob/main/vae/qwen_image_2.1_vae_bf16.safetensors
