# OxBee/Pika-H3-Flex-Turbo-LoRA

## Resumen

Pika-H3-Flex-Turbo-LoRA es un adaptador LoRA para generación de vídeo con audio sincronizado, publicado por el usuario OxBee sobre el modelo base MiniMax-H3 y los adaptadores de Pika-Labs (Pika-H3-Flex). Su función es fusionar en un único fichero LoRA estándar los mejores destilados de pocos pasos disponibles para H3, de modo que el modelo pueda generar clips de 5 segundos en 2, 4 u 8 evaluaciones en lugar de las ~40 del H3 base, sin necesidad de nodos personalizados ni parches del modelo.

El adaptador está construido mediante concatenación exacta de rangos de los adaptadores de origen (Pika-H3-Flex, Minimax-h3-Turbo y pDMD 2-NFE), por lo que su comportamiento equivale matemáticamente al apilado de dichos adaptadores en un solo fichero. Se distribuye en variantes para los transformadores FL2VA y Ref2VA, con ficheros de 3,9 GB en precisión completa y una versión "lite" de rango 32 que ocupa 0,31 GB y conserva el 96,1 % de la energía espectral fusionada.

Es relevante porque reduce de forma drástica el coste de inferencia de un modelo de vídeo-audio de gran tamaño: en H200, un clip de 5 segundos pasa de 60 s (6 pasos del adaptador oficial) a 40 s (4 pasos) o ~25 s (2 pasos en modo borrador), y en A100 de 109,3 s a 66,0 s con 4 pasos. El modelo se publica bajo la licencia comunitaria de MiniMax-H3.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (adaptador de bajo rango) sobre el transformer de difusión MiniMax-H3; variantes FL2VA y Ref2VA |
| Parametros totales | no disponible (el adaptador completo ocupa 3,9 GB por fichero; la variante lite r32 ocupa 0,31 GB) |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible (generación de clips de 121 frames a 848×480 con audio estéreo) |
| Tipos de cuantizacion | bf16, int8 y GGUF en el modelo base; el LoRA se aplica sobre cualquiera de ellos |
| Idiomas soportados | no disponible |
| Licencia | minimax-h3-community-license-agreement |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo no es una red neuronal completa, sino un adaptador LoRA de rango completo que se compone por concatenación exacta de rangos de varios adaptadores preexistentes: Pika-H3-Flex (movimiento característico de Pika), lightx2v/Minimax-h3-Turbo (destilado de pocos pasos) e Iwannapose/minimax_h3_pdmd_2nfe_comfyui (destilado pDMD de 2 evaluaciones para el modo borrador). El resultado se empaqueta como un LoRA estándar compatible con ComfyUI y Diffusers, sin nodos personalizados ni parches del modelo.

La composición es matemáticamente exacta: el error relativo por capa frente al apilado de los adaptadores originales es de aproximadamente 1-3e-7, de modo que la fidelidad al stack de referencia está garantizada por construcción. El estilo Flex queda fijado en 0,5 para las variantes de 2 y 4 pasos y en 0,6 para la variante de 8 pasos HD, que el autor describe como los puntos de operación validados por la comunidad para H3 en pocos pasos. Se ofrecen variantes para los transformadores FL2VA y Ref2VA, y la versión lite aplica una compresión SVD de rango 32 con truncación exacta del producto QR.

## Capacidades

- Generación de vídeo a partir de imagen (image-to-video) y de referencias (reference-to-video), con audio estéreo sincronizado.
- Generación de vídeo con audio integrado (audio-video-generation) en una sola pasada.
- Modo borrador de 2 pasos para iterar encuadre y movimiento con coste mínimo (~14 s de muestreo por clip de 5 s en H200).
- Modo rápido de 4 pasos para producción, con variantes FL2VA y Ref2VA.
- Modo de máxima calidad de 8 pasos HD, con mayor nivel de detalle y estilo fijado en 0,6.
- Compatibilidad con merges de calidad de la comunidad, como Singularity, donde el autor reporta mejores resultados que sobre H3 estándar.
- Compatibilidad con ComfyUI y Diffusers, en bf16, int8 y GGUF.
- No se documentan capacidades de tool calling, agentes ni razonamiento multi-paso; es un adaptador exclusivamente generativo de vídeo.

## Casos de uso

- Previsualización rápida de storyboards: con el fichero de 2 pasos se pueden generar borradores de 5 segundos en ~25 s en H200 para validar encuadre, movimiento y ritmo antes de renderizar la versión final a 4 u 8 pasos.
- Producción de vídeo publicitario de formato corto: la variante de 4 pasos FL2VA ofrece la ruta más rápida a un clip final con audio sincronizado, adecuada para iteraciones creativas con plazos ajustados.
- Generación de vídeo con identidad consistente: la variante Ref2VA de 4 u 8 pasos permite mantener referencias visuales (personajes, productos) a lo largo de varios clips, lo que encaja en series de contenido con continuidad.
- Renderizado final de alta calidad: la variante de 8 pasos HD sobre H3 estándar o sobre Singularity se usa cuando prima el detalle sobre la latencia, por ejemplo en piezas de portafolio o material promocional.
- Integración en pipelines de ComfyUI existentes: al ser un LoRA estándar sin nodos personalizados, se puede añadir a flujos de trabajo ya montados sobre H3 sin reescribir el grafo, lo que reduce el coste de adopción en estudios pequeños.
- Prototipado en infraestructura limitada: la variante lite de rango 32 (0,31 GB) permite probar el flujo completo en entornos con poco almacenamiento antes de desplegar los ficheros completos de 3,9 GB.
- Evaluación comparativa de modelos de vídeo: la disponibilidad de modos de 2, 4 y 8 pasos con la misma semilla y prompts permite medir el compromiso entre velocidad y calidad en una misma base.

## Benchmarks y rendimiento

Datos medidos por el autor con la misma base, semilla, prompt, CFG 1 y resolución 848×480 × 121 frames con audio estéreo:

| Hardware | Configuracion | Pasos | Tiempo por clip de 5 s | Respecto al oficial |
|---|---|---:|---:|---:|
| H200 | Adaptador oficial de Pika | 6 | 60 s | 1× |
| H200 | Este LoRA, 4 pasos | 4 | 40 s | 1,5× más rápido |
| H200 | Este LoRA, 2 pasos (borrador) | 2 | ~25 s (14 s de muestreo) | ~2,4× más rápido |
| H200 | Este LoRA, 8 pasos HD | 8 | 70 s | 0,86× (máxima calidad) |
| A100 | Adaptador oficial de Pika | 6 | 109,3 s | 1× |
| A100 | Este LoRA, 4 pasos | 4 | 66,0 s | 1,66× más rápido |
| — | MiniMax-H3 base | ~40 | ~500 s | ~8-12× más lento |

El coste por paso es idéntico en el mismo hardware (~7 s/paso en H200, ~12,5 s/paso en A100); la ganancia procede exclusivamente de necesitar menos evaluaciones. En calidad, el autor reporta que la variante de 4 pasos sobre Singularity resulta, en sus pruebas, más rápida y con mejor aspecto que el adaptador oficial de 6 pasos sobre H3 estándar, y que en el modo de 2 pasos 4 de 5 prompts mantuvieron una calidad aceptable en el primer lote de pruebas.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita; depende del modelo base H3 (transformador de difusión de vídeo de gran tamaño) y de su cuantización (bf16, int8 o GGUF). El LoRA añade 3,9 GB por fichero, o 0,31 GB en la variante lite r32.
- GPU recomendadas: el autor reporta mediciones en H200 (~7 s/paso) y A100 (~12,5 s/paso). No se documentan pruebas en GPU de consumo.
- GPU de consumo: no disponible; no se indica si cabe en RTX 4090 u otras GPU consumer.
- Opciones de despliegue: ComfyUI y Diffusers con el modelo base H3 en bf16, int8 o GGUF; compatible con merges comunitarios como Singularity.
- Latencia y throughput: 40 s por clip de 5 s con 4 pasos en H200, 66 s en A100; ~25 s con 2 pasos en H200; 70 s con 8 pasos HD en H200.

## Comparativa con modelos similares

| Modelo | Tipo | Pasos | Tiempo por clip de 5 s (H200) | Licencia | Disponibilidad |
|---|---|---:|---:|---|---|
| Pika-H3-Flex-Turbo-LoRA (este) | LoRA sobre H3 | 2 / 4 / 8 | 25 / 40 / 70 s | minimax-h3-community | Hugging Face |
| Adaptador oficial Pika-H3-Flex | Adaptador sobre H3 | 6 | 60 s | no disponible en la informacion | Hugging Face |
| MiniMax-H3 base | Modelo completo | ~40 | ~500 s | minimax-h3-community | Hugging Face |
| lightx2v/Minimax-h3-Turbo | Adaptador destilado | no disponible | no disponible | no disponible en la informacion | Hugging Face |
| Iwannapose/minimax_h3_pdmd_2nfe_comfyui | Adaptador pDMD 2-NFE | 2 | no disponible | no disponible en la informacion | Hugging Face |

## Limitaciones y advertencias

- El modo de 2 pasos está etiquetado explícitamente como borrador: el propio autor advierte de fallos ocasionales de escena y recomienda usarlo solo para iterar encuadre y movimiento, no para renderizados finales.
- Los modelos de pocos pasos son más débiles en movimiento rápido; el autor incluye una prueba de estrés de artes marciales y skate para que el usuario juzgue ese compromiso.
- El estilo Flex está fijado en 0,5 (2 y 4 pasos) y 0,6 (8 pasos HD); no es un parámetro libre en estos ficheros.
- No se documentan sesgos, comportamiento multilingüe ni evaluación de alucinación visual; los idiomas soportados figuran como no disponibles.
- La licencia es la minimax-h3-community-license-agreement, no una licencia de código abierto estándar; es imprescindible revisar sus términos antes de cualquier uso comercial.
- El adaptador depende del modelo base H3 y de sus variantes de transformer (FL2VA, Ref2VA); no funciona de forma autónoma.
- Las cifras de rendimiento proceden de mediciones del autor en H200 y A100; no hay verificación independiente publicada en la información disponible.
- El repositorio tiene 205 descargas y 0 likes en el momento de la consulta, lo que indica una validación comunitaria todavía limitada.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/OxBee/Pika-H3-Flex-Turbo-LoRA
- Modelo base Pika-H3-Flex: https://huggingface.co/Pika-Labs/Pika-H3-Flex
- MiniMax-H3: https://huggingface.co/MiniMaxAI/MiniMax-H3
- Licencia: https://huggingface.co/MiniMaxAI/MiniMax-H3/blob/main/LICENSE
- Merge Singularity: https://huggingface.co/WarmBloodAban/Minimax-h3_Singularity
- Adaptador pDMD 2-NFE: https://huggingface.co/Iwannapose/minimax_h3_pdmd_2nfe_comfyui
- Referencia arXiv 2604.16826: https://arxiv.org/abs/2604.16826
- Referencia arXiv 2610.11498: https://arxiv.org/abs/2610.11498
- Referencia arXiv 2603.08258: https://arxiv.org/abs/2603.08258
