# blackestk/MiniMax-H3-Ref2VA-MLX-pruned-Q8

## Resumen

MiniMax-H3-Ref2VA-MLX-pruned-Q8 es una conversión comunitaria del transformer Ref2VA de MiniMax-H3, el modelo de generación conjunta de vídeo y audio de MiniMax, adaptada para ejecutarse en Apple Silicon mediante MLX. El autor, blackestk, parte del checkpoint oficial `Ref2VA/transformer` (la variante que acepta imágenes de referencia, clips y RefMods como condicionamiento) y lo transforma en un pack de 21 GB mediante dos operaciones: poda de las proyecciones AdaLN y cuantización de 8 bits del núcleo lineal.

La relevancia de esta ficha es doble. Por un lado, demuestra que es posible ejecutar un DiT de vídeo-audio de casi 6.000 millones de parámetros en un Mac con memoria unificada, algo que el checkpoint original de 47,5 GB en bf16 pone fuera del alcance de muchos equipos. Por otro, ilustra las tensiones del ecosistema: la licencia MiniMax H3 Community no es de código abierto y excluye explícitamente de su concesión a la Unión Europea, el Reino Unido, Corea del Sur y Estados Unidos, lo que limita severamente su uso comercial en esos territorios.

El modelo base MiniMax-H3 combina un transformer de difusión (DiT) para vídeo y audio con un text encoder Qwen3-VL-32B y varios VAE. Esta conversión solo incluye el transformer; el resto de componentes debe descargarse del repositorio oficial de MiniMax. La arquitectura es un transformer de difusión con modulación AdaLN, no un LLM, y su pipeline es `image-text-to-video` con generación de audio asociada.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer de difusión (DiT) con modulación AdaLN y proyecciones podadas a curva de 64 dimensiones |
| Parámetros totales | 5.980.528.080 (~5,98 mil millones) |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (modelo de difusión, no de contexto textual) |
| Tipos de cuantización | Núcleo lineal en 8 bits (group size 64); proyecciones AdaLN de 64 anchos en float32 |
| Idiomas soportados | No disponible |
| Licencia | MiniMax H3 Community License (no open source; territorio limitado) |
| Formato de pesos | safetensors (MLX) |
| Tamaño en disco | 21 GB |
| Librería | MLX |
| Pipeline | image-text-to-video (con audio) |
| Text encoder | Qwen3-VL-32B (externo, del release oficial) |
| VAE | Externos, del release oficial |

## Arquitectura y entrenamiento

El transformer Ref2VA es un DiT (Diffusion Transformer) que opera sobre latentes de vídeo y audio, condicionado por embeddings de texto (Qwen3-VL-32B) y, en esta variante, por imágenes de referencia, clips y RefMods. La modulación temporal se realiza mediante proyecciones AdaLN (Adaptive Layer Normalization), 51 en total, que en esta conversión se han reproyectado sobre una curva de timestep de 64 dimensiones y se ha eliminado el `time_embedder`. El autor reporta que la curva es casi unidimensional y que las salidas AdaLN reproyectadas coinciden con las originales con un error relativo de aproximadamente 1,7e-6.

La cuantización aplica 8 bits con group size 64 a los lineales del núcleo, mientras que las proyecciones AdaLN de 64 anchos se mantienen en float32 porque cuantizarlas a 8 bits empeoraba seis veces las tablas de modulación guardadas. No se dispone de información sobre el dataset de entrenamiento original de MiniMax-H3 (número de tokens, composición, uso de RLHF/DPO) en la información proporcionada. El layout de AdaLN podada sigue el publicado por DeepBeepMeep para la variante FL2VA, y el cuantizador se basa en el `quantize_stream.py` del runner `minimax-h3-mlx`.

## Capacidades

- Generación de vídeo condicionada por imagen y texto (image-text-to-video) con audio asociado.
- Condicionamiento por imágenes de referencia, clips de vídeo y RefMods (parámetros de referencia) para controlar la generación.
- Generación de audio junto al vídeo (audio-video-generation), según los tags del repositorio.
- Ejecución en Apple Silicon mediante MLX, con carga del layout podado y la cuantización leídos desde `config.json` y `quant_config.json`.
- No es un modelo de lenguaje: no soporta tool calling, function calling, agentes ni razonamiento multi-step en el sentido de un LLM.
- Soporte multilingüe: no disponible en la información proporcionada.
- No se documentan modos especiales como thinking mode, visión general o audio de entrada más allá del condicionamiento por referencia.

## Casos de uso

- Prototipado de vídeo generativo en Mac: un estudio pequeño puede generar clips de 5 segundos a 640x384 con condicionamiento por imagen de referencia en un M2 Max de 96 GB, usando el runner `minimax-h3-mlx` y el flag `--dit` apuntando a esta carpeta. Es adecuado porque reduce el pack de 47,5 GB a 21 GB sin cambiar los picos de memoria de denoising (22,2 GiB) ni el tiempo (235 s frente a 242 s).
- Iteración rápida con adaptadores Fast (3-step): el modelo permite renders deterministas con una semilla fija, lo que facilita comparar variantes de prompt o de referencia sin ruido estocástico, útil en flujos de diseño de personajes o escenas.
- Investigación sobre cuantización de DiT: el pack documenta el efecto de cuantizar AdaLN a 8 bits (seis veces peor en las tablas de modulación), lo que lo convierte en un caso de estudio reproducible para quien investigue cuantización post-entrenamiento en modelos de difusión.
- Generación de vídeo con audio para contenido corto: adecuado para clips de redes sociales o animáticas donde se necesita audio sincronizado, siempre que el uso cumpla la licencia y el territorio aplicable.
- Condicionamiento por referencia visual en pipelines creativos: con `--refmod` y `--reference`, se puede mantener la identidad de un sujeto o el estilo de una escena entre generaciones, útil en previsualización de anuncios o storyboards.
- Evaluación de infraestructura Apple Silicon: sirve para medir el suelo de RAM que impone el text encoder Qwen3-VL-32B (25,7 GiB de pico) y planificar despliegues en Mac Studio o MacBook Pro de gama alta.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible, ya que no es un modelo de lenguaje. El autor sí reporta mediciones de rendimiento en hardware concreto (Apple M2 Max, 96 GB, `generate_staged.py`, 640x384, 5 s, adaptador Fast de 3 pasos, un RefMod, semilla 5):

| Pack | Tamaño | Pico de carga DiT | Pico de denoising | Tiempo de denoising |
|---|---:|---:|---:|---:|
| Ref2VA oficial, núcleo Q8, AdaLN bf16 | 47,5 GB | 19,9 GiB | 22,2 GiB | 242 s |
| Este pack | 21 GB | 19,9 GiB | 22,2 GiB | 235 s |

Notas del autor: el pack es más pequeño y ligero en memoria, no más rápido; el denoising está limitado por cómputo y las matmuls de 4 y 8 bits corren a velocidad similar (~0,88x respecto a bf16 según los benchmarks del runner). El text encoder Qwen3-VL-32B alcanza un pico de 25,7 GiB y marca el suelo de RAM para renders sin referencia; la codificación de referencia llegó a 39 GiB en una prueba con 2 imágenes sobre el pack de 47,5 GB. No se probó en Macs de 36 o 48 GB. Como contexto ajeno a esta medición, las tarjetas de PipeNetwork para `MiniMax-H3-MLX-8bit` y `-4bit` (sobre FL2VA) reportan un error de velocidad de vídeo teacher-forced de 0,033 y 0,165 frente a bf16.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---:|---|---|---|---|
| Este pack (Ref2VA MLX Q8 podado) | ~5,98 mil M | No aplica | 235 s por clip de 5 s a 640x384 en M2 Max 96 GB | MiniMax H3 Community (territorio limitado) | Hugging Face, 55 descargas |
| MiniMax-H3 Ref2VA oficial (bf16) | No disponible | No aplica | 242 s en el mismo test | MiniMax H3 Community | Hugging Face (MiniMaxAI) |
| MiniMax-H3-MLX-8bit / -4bit (PipeNetwork, sobre FL2VA) | No disponible | No aplica | Error de velocidad 0,033 / 0,165 frente a bf16 | MiniMax H3 Community | Hugging Face (PipeNetwork) |

No se dispone de datos de otros modelos comparables de la misma categoría (generación conjunta de vídeo y audio en Apple Silicon) en la información proporcionada.

## Limitaciones y advertencias

- Licencia no open source: la MiniMax H3 Community License excluye de su concesión a la Unión Europea, el Reino Unido, Corea del Sur y Estados Unidos. Verificar el territorio antes de cualquier uso.
- Uso comercial restringido: productos comerciales con ingresos anuales superiores a 20 millones de dólares requieren autorización escrita de MiniMax; se aplica la Acceptable Use Policy.
- Redistribución condicionada: debe incluirse la licencia y un archivo `NOTICE`, y marcar los archivos modificados. Estos pesos son modificados y no son los originales de MiniMax.
- Dependencia de componentes externos: solo contiene el transformer; los VAE y el text encoder Qwen3-VL-32B deben descargarse del release oficial, lo que eleva el consumo de RAM (pico de 25,7 GiB solo para el encoder).
- Soporte de referencia incompleto en el runner: `--refmod` y `--reference` requieren un runner con soporte Ref2VA (PR borrador o copia vendorizada), no la versión principal.
- No probado en Macs de 36 o 48 GB: los requisitos para esos equipos son inferencias del autor a partir de los picos registrados, no mediciones.
- Sin ganancia de velocidad: la cuantización reduce tamaño y memoria, no latencia; el denoising sigue limitado por cómputo.
- Riesgo de artefactos y alucinación visual: como modelo generativo de difusión, puede producir contenido incoherente o no fiel a la referencia; los props se mueven respecto al pack completo en la misma semilla, según el propio autor.
- Sin datos de sesgos, idiomas soportados ni evaluación de seguridad en la información disponible.
- Modelo comunitario con 0 likes y 55 descargas: soporte y mantenimiento limitados.

## Enlaces

- Hugging Face del pack: https://huggingface.co/blackestk/MiniMax-H3-Ref2VA-MLX-pruned-Q8
- Modelo base oficial: https://huggingface.co/MiniMaxAI/MiniMax-H3
- Licencia: https://huggingface.co/MiniMaxAI/MiniMax-H3/blob/main/LICENSE
- Runner minimax-h3-mlx (Mr Bizarro): https://github.com/mrbizarro/minimax-h3-mlx
- PR con soporte Ref2VA: https://github.com/mrbizarro/minimax-h3-mlx/pull/2
- Copia vendorizada y scripts: https://github.com/blackest/immich-ring-visualizer
- Scripts de poda y cuantización: https://github.com/blackest/immich-ring-visualizer/tree/main/scripts
- Runner de PipeNetwork: https://github.com/PipeNetwork/minimax-h3-mlx
