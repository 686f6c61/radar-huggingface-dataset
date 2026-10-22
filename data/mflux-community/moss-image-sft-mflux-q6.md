# mflux-community/moss-image-sft-mflux-q6

## Resumen

MOSS-Image-SFT · MFlux Q6 es una conversión comunitaria, cuantizada a 6 bits en formato MLX, del modelo de texto a imagen MOSS-Image-SFT del equipo OpenMOSS. El modelo original se basa en un transformer de difusión (DiT) de 5.000 millones de parámetros, destacado según su repositorio oficial por la generación de texto legible dentro de las imágenes, la generación de layouts y un ajuste fino eficiente. Esta versión la ha preparado mflux-community (no es una publicación oficial de los autores originales) para permitir su ejecución local en Mac con Apple Silicon mediante la librería open source MFlux.

Su relevancia radica en que lleva un modelo de difusión de gran tamaño a entornos sin GPU NVIDIA: al estar cuantizado en MLX nativo, ocupa 10,7 GB frente a los 26,2 GB de la versión BF16, lo que lo hace viable en Macs con memoria unificada limitada. El repositorio se publicó el 22 de octubre de 2026 y forma parte de una familia de conversiones que abarca desde Q3 (5,8 GB) hasta BF16 sin cuantizar.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | DiT (Diffusion Transformer) para generación texto a imagen |
| Parámetros totales | 5 B (transformer DiT, según el repositorio oficial de MOSS-Image); desglose del pipeline completo no disponible |
| Parámetros activos | no aplicable (arquitectura densa, no MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | MLX affine de 6 bits (Q6) aplicada al codificador de texto, al transformer y al VAE |
| Idiomas soportados | no disponible (los ejemplos documentados usan prompts en inglés) |
| Licencia | Apache 2.0 (heredada del modelo original) |
| Formato de pesos | safetensors cuantizados en formato MLX |
| Modelo base | OpenMOSS-Team/MOSS-Image-SFT |
| Tamaño del repositorio | 10,7 GB |
| Biblioteca de ejecución | mflux (MLX, Apple Silicon) |

## Arquitectura y entrenamiento

El modelo base, MOSS-Image, es un transformer de difusión (DiT) de 5 B de parámetros descrito por OpenMOSS como un modelo base orientado a la generación de imágenes de alta calidad, con capacidad especial de representar texto dentro de las imágenes y de generar composiciones por layout. La variante SFT (MOSS-Image-SFT) corresponde a la versión tras ajuste fino supervisado del modelo base. No se ha publicado en la información disponible detalle alguno sobre el número de tokens de entrenamiento, la composición del dataset ni el uso de técnicas como RLHF o DPO.

Esta ficha corresponde a la conversión Q6 de MFlux: una cuantización afín de MLX a 6 bits aplicada de forma uniforme al codificador de texto, al transformer y al VAE. El nivel de cuantización queda almacenado en los propios pesos, por lo que no es necesario pasar la flag `--quantize` al ejecutar el modelo. Los pesos no se han modificado respecto a la publicación original más allá de la conversión a MLX y la cuantización.

## Capacidades

- Generación de imágenes a partir de texto (pipeline text-to-image) con resolución configurable, por ejemplo 768x768 en el ejemplo de la documentación.
- Representación de texto legible dentro de las imágenes, la capacidad destacada del modelo base según el repositorio oficial de MOSS-Image (el ejemplo de la documentación genera un cartel de madera con el texto "HELLO WORLD").
- Generación de layouts y composiciones estructuradas, según la descripción oficial del proyecto MOSS-Image.
- Ejecución 100 % local en Mac con Apple Silicon mediante MLX, sin dependencia de servicios en la nube.
- Control de reproducibilidad mediante semilla (`--seed`) y parámetros de muestreo; el ejemplo de la comunidad usa 25 pasos y guidance 3.
- Descarga automática de pesos desde HuggingFace o uso de una copia local del repositorio.
- No se ha documentado en la información disponible soporte para edición de imágenes, inpainting, vision, audio ni tool calling.

## Casos de uso

- Carteles, rótulos y mockups con texto legible: la capacidad de text rendering del modelo base lo hace adecuado para generar imágenes que incluyan palabras concretas (señales, portadas, anuncios), algo donde muchos modelos de difusión fallan.
- Diseño de layouts y composiciones: la generación por layout documentada en el proyecto oficial permite prototipar estructuras visuales (maquetas de interfaz, pósters, plantillas) antes de pasar a herramientas de diseño.
- Prototipado local en Mac sin coste de nube: al ejecutarse en MLX sobre Apple Silicon, un equipo de diseño o desarrollo puede iterar prompts sin gastar en APIs ni alquilar GPUs.
- Generación de ilustraciones para blogs y documentación técnica: la CLI de MFlux es scriptable y la semilla fija (`--seed 42` en el ejemplo) permite reproducir el mismo asset en distintas ejecuciones.
- Automatización de generación de assets en pipelines: el comando `mflux-generate-moss-image` puede integrarse en scripts batch para producir series de imágenes con parámetros controlados.
- Investigación sobre cuantización en modelos de difusión: la familia de conversiones Q3 a Q8 del mismo modelo permite comparar el impacto de cada nivel de cuantización en calidad y consumo de memoria.
- Evaluación de DiT en hardware Apple: al ser una implementación MLX nativa y open source, sirve como base para experimentos de inferencia eficiente en silicio de Apple.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- Memoria estimada para inferencia: los pesos Q6 ocupan 10,7 GB; a lo que hay que sumar la memoria de activaciones y del VAE durante el muestreo. Como estimación orientativa, un Mac con 16 GB de memoria unificada sería el mínimo práctico, siendo recomendable 24 GB o más para generar con holgura (estimación propia a partir del tamaño de los pesos; no hay cifras oficiales publicadas).
- Hardware compatible: exclusivamente Macs con Apple Silicon, ya que MLX es el runtime y no funciona en NVIDIA, AMD ni CPU. No aplica la recomendación de GPUs concretas (A100, H100, RTX 4090) para esta conversión; para hardware distinto habría que acudir a los pesos originales de OpenMOSS-Team/MOSS-Image-SFT.
- Cabe en equipos de consumo: sí, en términos de Mac domésticos con suficiente memoria unificada; la versión Q6 reduce el requisito frente a los 26,2 GB de la variante BF16.
- Despliegue: mediante MFlux (`uv tool install --upgrade mflux`) con el comando `mflux-generate-moss-image --model mflux-community/moss-image-sft-mflux-q6 --base-model moss-image-sft`. Descarga opcional de copia local con `hf download`. No aplican vLLM, llama.cpp, Ollama ni TGI, que no dan soporte a este tipo de modelo de difusión en MLX.
- Latencia y throughput: no disponible. Como referencia de configuración, el ejemplo de la comunidad usa 25 pasos de muestreo y guidance 3, pero no se han publicado mediciones de tiempo por imagen.

## Comparativa con modelos similares

La comparación más directa disponible es la familia de cuantizaciones MFlux del mismo modelo:

| Variante | Cuantización | Tamaño | Repositorio |
|---|---|---|---|
| BF16 | sin cuantizar (bfloat16) | 26,2 GB | mflux-community/moss-image-sft-mflux-bf16 |
| Q8 | 8 bits | 14,0 GB | mflux-community/moss-image-sft-mflux-q8 |
| Q6 (esta ficha) | 6 bits | 10,7 GB | mflux-community/moss-image-sft-mflux-q6 |
| Q5 | 5 bits | 9,1 GB | mflux-community/moss-image-sft-mflux-q5 |
| Q4 | 4 bits | 7,5 GB | mflux-community/moss-image-sft-mflux-q4 |
| Q3 | 3 bits | 5,8 GB | mflux-community/moss-image-sft-mflux-q3 |

También es relevante el modelo original OpenMOSS-Team/MOSS-Image-SFT, del que esta versión deriva y del que hereda la licencia Apache 2.0; el tamaño de su publicación original no está disponible en la información proporcionada. No se incluyen comparativas con otros modelos de texto a imagen (FLUX, SDXL, etc.) porque no hay datos de rendimiento publicados en la información disponible.

## Limitaciones y advertencias

- Conversión comunitaria no oficial: la ha publicado mflux-community, no el equipo de OpenMOSS, por lo que errores de conversión no descartables son un riesgo a considerar.
- Posible degradación por cuantización: la cuantización afín a 6 bits del codificador de texto, transformer y VAE puede reducir la fidelidad respecto a la versión BF16; no hay evaluaciones publicadas que cuantifiquen esa pérdida.
- Compatibilidad restringida a Apple Silicon: no funciona en GPUs NVIDIA/AMD ni en CPU, lo que limita su uso en servidores y entornos de nube convencionales.
- Adopción prácticamente nula: el repositorio registra 0 descargas y 0 likes en el momento de la ficha, y no existen benchmarks publicados, así que no hay evidencia externa de su calidad.
- Alcance limitado al pipeline text-to-image: no hay documentación de edición, inpainting, control por imagen de referencia ni otras modalidades.
- Idiomas de los prompts no documentados: los ejemplos están en inglés y no se especifica el comportamiento con otros idiomas, incluido el castellano.
- Licencia: Apache 2.0 es permisiva y permite uso comercial, pero la model card original remite a sus términos completos; conviene revisarla antes de un despliegue en producción.
- Modelo muy reciente (octubre de 2026): la documentación, el soporte de MFlux y las herramientas del ecosistema pueden cambiar con rapidez.

## Enlaces

- Ficha del modelo: https://huggingface.co/mflux-community/moss-image-sft-mflux-q6
- Modelo original: https://huggingface.co/OpenMOSS-Team/MOSS-Image-SFT
- Repositorio oficial de MOSS-Image (GitHub): https://github.com/OpenMOSS/MOSS-Image
- MFlux (GitHub, implementación MLX de Filip Strand): https://github.com/filipstrand/mflux
- MFlux (GitHub, organización mflux-community): https://github.com/mflux-community/mflux
- Sitio comunitario de MOSS-Image (demo online y guías): https://mossimage.org/
- Resto de variantes MFlux del mismo modelo: https://huggingface.co/mflux-community/moss-image-sft-mflux-bf16, https://huggingface.co/mflux-community/moss-image-sft-mflux-q8, https://huggingface.co/mflux-community/moss-image-sft-mflux-q5, https://huggingface.co/mflux-community/moss-image-sft-mflux-q4, https://huggingface.co/mflux-community/moss-image-sft-mflux-q3
