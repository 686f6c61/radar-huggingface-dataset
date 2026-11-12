# NewstonNate13/H3_Eros_Sing_PRISM_Pika_Parasyte_w6a8_g32

## Resumen

H3_Eros_Sing_PRISM_Pika_Parasyte_w6a8_g32 es una cuantización de un modelo de difusión para generación de vídeo, no un modelo de lenguaje. Deriva del modelo base MiniMax-H3 (Minimax Hailuo H3, variante Ref2VA) y es el resultado de una cadena de merges y fine-tunes de la comunidad: la mezcla Singularity x 10Eros Max con PRISM-v2 y PikaFlex al 0,85 de fuerza, publicada originalmente por OliviaRossi, y posteriormente requantizada por NewstonNate13.

El modelo se distribuye en formato nativo de ComfyUI `w6a8_int8` (w6a8_g32_convrot): pesos de 6 bits, activaciones int8, tamaño de grupo 32 y grupo ConvRot de 256. Se carga directamente con el nodo `UNETLoader` de ComfyUI usando los kernels cuantizados estándar, sin necesidad de nodos personalizados. El repositorio ocupa 39,7 GB, aunque el fichero de pesos declarado en la model card es de aproximadamente 15,9 GB.

La relevancia de este modelo es acotada: se trata de un artefacto de la comunidad de generación de vídeo con IA, sin descargas ni interacciones en el momento de la consulta, y cuya licencia depende de los modelos de origen. No dispone de model card técnica convencional ni de datos de evaluación publicados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo de difusión (diffusion_model), base MiniMax-H3 (Hailuo H3, variante Ref2VA) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo de vídeo, no de texto) |
| Tipos de cuantizacion | w6a8_int8 (w6a8_g32_convrot): pesos de 6 bits, activaciones int8, group size 32, ConvRot group 256 |
| Idiomas soportados | no disponible |
| Licencia | no disponible (la model card indica que sigue la licencia de los modelos de origen) |
| Formato de pesos | safetensors (formato nativo ComfyUI `w6a8_int8`) |
| Tamano del fichero de pesos | ~15,9 GB (el int8HQ de origen es ~20,2 GB) |
| Tamano del repositorio | 39,7 GB |
| Nodo de carga | `UNETLoader` (diffusion model) en ComfyUI |
| Modelo base | MiniMaxAI/MiniMax-H3, Comfy-Org/MiniMax-H3, OliviaRossi/Minimax-h3_Singularity-x-10Eros-Max_PRISM, TenStrip/10Eros-Max |

## Arquitectura y entrenamiento

El modelo es un modelo de difusión para vídeo derivado de MiniMax-H3 (Minimax Hailuo H3) en su variante Ref2VA. No es un transformer autoregresivo ni un modelo de lenguaje: la información disponible no detalla la arquitectura interna (número de parámetros, tipo de backbone, mecanismo de atención o VAE asociado), por lo que esos datos deben considerarse no disponibles.

El proceso de construcción es una cadena de merges comunitarios: se parte de la mezcla Singularity x 10Eros Max con PRISM-v2 y PikaFlex al 0,85 de fuerza (denominada UPD4 en el repositorio de OliviaRossi), publicada como `10Eros_Max_SingularityV2_PRISM2_PikaFlex_0.85_int8HQ.safetensors`. Sobre ese fichero se aplica una requantización a `w6a8_g32_convrot`. No se documentan datos de entrenamiento, número de tokens, composición del dataset ni etapas de RLHF o DPO, algo esperable en un artefacto de este tipo. La innovación técnica declarada es la propia cuantización: según el autor, la salida es casi idéntica a la del int8HQ de origen con la misma semilla y ajustes, con un error aproximado del 0,5 %, y se carga con los kernels cuantizados estándar de ComfyUI sin nodos personalizados.

## Capacidades

- Generación de vídeo mediante difusión, heredada de MiniMax-H3 en variante Ref2VA.
- Carga nativa en ComfyUI a través del nodo `UNETLoader`, junto con el text encoder y el VAE habituales de H3.
- Ejecución con kernels cuantizados estándar de ComfyUI, sin dependencias de nodos personalizados.
- Cuantización de 6 bits en pesos con activaciones int8 que reduce el fichero de ~20,2 GB a ~15,9 GB manteniendo, según el autor, una calidad casi idéntica.
- Estilización derivada de los merges PRISM-v2, PikaFlex y 10Eros Max (orientación estética concreta no documentada técnicamente).
- Soporte de tool calling, function calling, agentes, razonamiento multi-paso, matemáticas, código, visión o audio: no disponible (no es un modelo de lenguaje).

## Casos de uso

- Generación de clips de vídeo en ComfyUI: el modelo se carga en `UNETLoader` con el text encoder y el VAE de H3 para producir vídeo a partir de prompts, aprovechando el pipeline estándar de ComfyUI.
- Iteración con estilos concretos: al incorporar los merges PRISM-v2, PikaFlex y 10Eros Max, resulta adecuado para explorar variantes estéticas sobre el modelo base H3 sin reentrenar.
- Despliegue en GPUs de gama alta con VRAM limitada: el fichero de ~15,9 GB frente a los ~20,2 GB del int8HQ reduce el requisito de memoria, lo que facilita su uso en tarjetas de 24 GB.
- Reproducción de resultados: al declarar una equivalencia de ~0,5 % de error respecto al int8HQ con la misma semilla y ajustes, sirve para reproducir trabajos previos con menor huella de memoria.
- Flujos de trabajo reproducibles en ComfyUI: al no requerir nodos personalizados, se integra en pipelines y plantillas de ComfyUI compartidas entre equipos.
- Prototipado rápido de vídeo generativo: al ser un artefacto ligero dentro de la familia H3, permite experimentar con la variante Ref2VA antes de comprometerse con pesos de mayor tamaño.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El único dato de calidad declarado por el autor es una equivalencia aproximada del 0,5 % de error respecto al fichero int8HQ de origen con la misma semilla y ajustes; no se aportan métricas objetivas (FVD, CLIP score, SSIM ni similares).

## Requisitos de hardware

- VRAM estimada: no disponible de forma oficial. Como referencia, el fichero de pesos es de ~15,9 GB, por lo que se necesita margen adicional para el text encoder, el VAE y las activaciones durante la inferencia.
- GPU recomendadas: no disponible en la información proporcionada. Por tamaño de pesos, encaja en GPUs con 24 GB o más (por ejemplo, RTX 4090 o RTX 5090), aunque no está confirmado por el autor.
- ¿Cabe en GPU de consumo? Probable en tarjetas de 24 GB, dado el tamaño del fichero, pero no confirmado.
- Opciones de despliegue: ComfyUI con el nodo `UNETLoader` y los kernels cuantizados estándar. No se documentan otros backends (vLLM, llama.cpp, Ollama o TGI no aplican a un modelo de difusión de vídeo).
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Tipo | Tamano de pesos | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| H3_Eros_Sing_PRISM_Pika_Parasyte_w6a8_g32 | Difusión de vídeo (H3 Ref2VA) | ~15,9 GB | w6a8_int8 (g32, convrot) | no disponible | Hugging Face, 0 descargas |
| 10Eros_Max_SingularityV2_PRISM2_PikaFlex_0.85_int8HQ (OliviaRossi) | Difusión de vídeo (H3) | ~20,2 GB | int8HQ | no disponible | Hugging Face |
| MiniMax-H3 (MiniMaxAI) | Difusión de vídeo (base) | no disponible | no disponible | no disponible | Hugging Face |
| Comfy-Org/MiniMax-H3 | Difusión de vídeo (base, formato ComfyUI) | no disponible | no disponible | no disponible | Hugging Face |

La comparación se limita a los modelos de la cadena de derivación, ya que no se dispone de datos de rendimiento ni de especificaciones técnicas de alternativas externas.

## Limitaciones y advertencias

- No es un modelo de lenguaje: no admite prompts conversacionales, tool calling ni razonamiento textual; cualquier uso en ese sentido es un error de categoría.
- Licencia no disponible: la model card remite a las licencias de los modelos de origen, por lo que el uso comercial exige verificar MiniMax-H3, Comfy-Org/MiniMax-H3, OliviaRossi/Minimax-h3_Singularity-x-10Eros-Max_PRISM y TenStrip/10Eros-Max.
- Artefacto de la comunidad sin evaluación independiente: 0 descargas y 0 likes en el momento de la consulta, sin benchmarks publicados.
- Calidad declarada por el autor, no verificada: la equivalencia del ~0,5 % de error frente al int8HQ es una afirmación de la model card.
- Cadena de merges opaca: no se documentan los datos de entrenamiento ni los métodos de mezcla, lo que dificulta auditar sesgos o comportamientos.
- Sin información sobre sesgos, alucinación visual o limitaciones idiomáticas.
- Repositorio de 39,7 GB frente a un fichero de pesos de ~15,9 GB: conviene revisar qué incluye el repositorio antes de descargarlo completo.
- La model card incluye una dirección de Monero y un enlace de donaciones; no debe interpretarse como aval técnico del modelo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/NewstonNate13/H3_Eros_Sing_PRISM_Pika_Parasyte_w6a8_g32
- Repositorio del merge de origen (OliviaRossi): https://huggingface.co/OliviaRossi/Minimax-h3_Singularity-x-10Eros-Max_PRISM
- Fichero int8HQ de origen: https://huggingface.co/OliviaRossi/Minimax-h3_Singularity-x-10Eros-Max_PRISM/blob/main/10Eros_Max_SingularityV2_PRISM2_PikaFlex_0.85_int8HQ.safetensors
- Modelo base MiniMaxAI: https://huggingface.co/MiniMaxAI/MiniMax-H3
- Modelo base Comfy-Org: https://huggingface.co/Comfy-Org/MiniMax-H3
- Modelo base TenStrip/10Eros-Max: https://huggingface.co/TenStrip/10Eros-Max
- Enlace de donaciones citado en la model card: https://throne.com/plaguekind
