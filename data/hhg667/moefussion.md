# Hhg667/moeFussion

## Resumen

moeFussion es un modelo de difusión texto-a-imagen especializado en ilustración anime, orientado a la generación de personajes y composiciones que otros modelos de su categoría resuelven con menor fidelidad según su autor. No es un modelo entrenado desde cero: se trata de un *merge* (fusión de pesos) iterativo de checkpoints de la familia Stable Diffusion / SDXL, con bases que han ido cambiando entre versiones (Stable Diffusion 2.1-768 en v2.1, SDXL V-Pred + ZTSNR en v1.2, Illustrious v1 en v1.3 y Anima v1 en v3.0). A pesar del nombre, no emplea arquitectura Mixture-of-Experts.

El repositorio público analizado (Hhg667/moeFussion) es una re-subida de un proyecto originalmente alojado en la cuenta LoliRimuru, según se desprende de las rutas de las imágenes de ejemplo de la propia model card. Acumula 0 descargas y 0 *likes*, no publica resultados de benchmarks ni desglose de datos de entrenamiento, y ocupa 430,9 GB, lo que sugiere que incluye múltiples checkpoints de distintas versiones y bases.

Su relevancia es limitada y de nicho: compite en el ecosistema de modelos anime para ComfyUI/SwarmUI (Pony, Illustrious, NoobAI, Animagine), no en el terreno de modelos de lenguaje. La model card declara explícitamente un sesgo hacia personajes infantiles («loli»), lo que constituye un riesgoserio de política de contenido y legal que se detalla en la sección de limitaciones.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Difusion texto-a-imagen (UNet + VAE + codificador de texto CLIP); merge de checkpoints. Base por version: Anima v1 (v3.0), Illustrious v1 (v1.3), SDXL V-Pred + ZTSNR (v1.2), Pony XL (v1.1.x), Stable Diffusion 2.1-768 (v2.1) |
| Parametros totales | no disponible (el autor no publica desglose; el repositorio ocupa 430,9 GB e incluye varios checkpoints) |
| Parametros activos | no aplica (no es un modelo MoE pese al nombre «moeFussion») |
| Longitud de contexto | no aplica; ventana de prompt limitada por el codificador CLIP. Resolucion nativa de entrenamiento: 832x1144 en v3.0, hasta 1536x1536 en v1.3 |
| Tipos de cuantizacion | no disponible (el autor no publica versiones cuantizadas; se distribuyen checkpoints en precision completa) |
| Idiomas soportados | no disponible; las etiquetas de prompt documentadas estan en ingles (estilo booru/danbooru) |
| Licencia | CreativeML OpenRAIL-M |
| Formato de pesos | no especificado en la model card; distribuido como checkpoints compatibles con diffusers y ComfyUI (carga por importacion de workflow) |

## Arquitectura y entrenamiento

La arquitectura es la de un modelo de difusion latente convencional: una UNet que predice el ruido sobre el espacio latente de un VAE, condicionada por *embeddings* de texto de CLIP. La diferencia entre versiones es la base sobre la que se hace el merge: v0.x y v2.1 sobre Stable Diffusion 1.x/2.1, v1.1.x sobre Pony XL, v1.2 sobre SDXL con predicción V (V-Pred) y zero-terminal SNR (ZTSNR), v1.3 sobre Illustrious v1 y v3.0 sobre Anima v1. No hay entrenamiento desde cero ni *fine-tuning* documentado con número de pasos, tokens o composición de dataset.

El método de construcción es la fusión de pesos de modelos existentes (OrangeMixs, Waifu Diffusion 1.4, Counterfeit V2.5, Based67, EstheticRetroAnime, Hassaku, animelike2D, Anima), cuyos enlaces el autor lista como recursos. No se documenta RLHF, DPO ni ningún proceso de alineación —no aplica en difusión—, ni tampoco decodificación especulativa, atención lineal o innovaciones técnicas propias. La model card describe únicamente ajustes empíricos de *merging* entre versiones: coherencia anatómica, herencia de estilo, generación multi-personaje y adherencia al prompt.

## Capacidades

- Generación de imágenes anime texto-a-imagen a partir de prompts con etiquetas estilo booru y lenguaje natural, con recomendación explícita de combinar ambos.
- Adherencia a resoluciones altas: 832x1144 recomendado en v3.0 y hasta 1536x1536 en v1.3, con mejoras declaradas en composición a resoluciones mayores.
- Soporte de *negative prompts* con listas de etiquetas de calidad (lowres, worst quality, bad anatomy, bad hands, jpeg artifacts, etc.).
- Etiquetas de artista con sintaxis `@artist` (sensible a mayúsculas) en v3.0.
- Generación de múltiples personajes en una misma escena (mejora declarada a partir de v0.14.x).
- Control de estilo mediante selección de versión: v1.3-II más cruda y controlable para LoRA; v1.3-IIZ con estilo por defecto más marcado.
- Compatibilidad con flujos ComfyUI/SwarmUI, incluyendo autodetección de configuración ZSNR+V-Pred en v1.2.
- No dispone de *tool calling*, *function calling*, capacidad de agente, razonamiento multi-paso, visión de entrada ni generación de texto libre.

## Casos de uso

- Ilustración de personajes para videojuegos indie: generación de *sprite sheets* y retratos de personajes con composición controlada mediante prompts largos y resolución 832x1144, útil para prototipado rápido antes de encargar arte final.
- Concept art para series y cómics: exploración de variaciones de vestuario, pose e iluminación combinando etiquetas booru con lenguaje natural, con *negative prompts* para descartar composiciones no deseadas.
- Producción de fondos y escenarios: la v1.1.x declara mejoras específicas sobre los fondos de Pony XL, lo que la hace adecuada para generar *backdrops* de escenas anime.
- Creación de datasets para entrenamiento de LoRA: la variante v1.3-II, descrita como «más cruda y con más control», está pensada para servir de base a *fine-tunings* de estilo o personaje.
- Integración en pipelines ComfyUI con *upscaling* e *inpainting*: el autor publica workflows importables desde las imágenes de ejemplo, lo que permite encadenar generación, ampliación y retoque sin edición manual.
- Generación de material para plataformas de arte japonés: la model card referencia Aipictors como plataforma donde el modelo puede usarse online, lo que encaja en flujos de publicación de ilustración.
- Investigación sobre *model merging*: el historial de versiones (v0.4 a v3.0) documenta cambios de estrategia de fusión y de modelos base, lo que lo convierte en un caso de estudio de cómo afecta el merge a composición y anatomía.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye FID, CLIP score, HPSv2, ImageReward ni comparaciones cuantitativas con otros modelos; únicamente afirmaciones cualitativas del autor sobre mejoras entre versiones.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible como dato del autor. Como referencia de la familia arquitectónica, los checkpoints basados en SDXL (v1.1.x, v1.2, v1.3) requieren del orden de 8-12 GB en fp16 para 1024x1024, y los basados en SD 1.x/2.1 (v0.x, v2.1) alrededor de 4-6 GB; son estimaciones por arquitectura, no medidas publicadas para este modelo.
- GPU recomendadas: no hay recomendación del autor. Por familia, una RTX 3060 12 GB o RTX 4070 bastan para las variantes SD 1.x/2.1 y SDXL a resoluciones moderadas; una RTX 4090 o A100/H100 reducen el tiempo por imagen y permiten lotes mayores.
- Cabe en GPU de consumo: sí para las variantes SD 1.x y SDXL en fp16; la generación a 1536x1536 (v1.3) exige más VRAM y probablemente *offloading* o *tiling* del VAE en tarjetas de 8 GB.
- Opciones de despliegue: diffusers (librería declarada), ComfyUI y SwarmUI (mencionados explícitamente). vLLM, llama.cpp, Ollama y TGI no aplican a modelos de difusión.
- Latencia y throughput: no disponibles. El autor solo especifica ajustes de muestreo: sampler `er_sde` con scheduler `simple` o `beta` y CFG 3-4 en v3.0; Euler con scheduler normal o AYS y 30 pasos en v1.2; CFG ~5 en v1.2.
- Almacenamiento: el repositorio completo ocupa 430,9 GB, por lo que conviene descargar solo el checkpoint de la versión que se vaya a usar.

## Comparativa con modelos similares

| Modelo | Base arquitectonica | Resolucion nativa | Licencia | Observaciones |
|---|---|---|---|---|
| moeFussion v3.0 | Anima v1 (SDXL-like) | 832x1144 | CreativeML OpenRAIL-M | Merge comunitario, 0 descargas, sin benchmarks publicados |
| Illustrious v1 | SDXL | 1536x1536 (segun la propia model card) | no verificada en esta busqueda | Base directa de moeFussion v1.3; ecosistema amplio de LoRAs |
| Pony Diffusion V6 XL | SDXL | 1024x1024 | licencia propia de Pony (no verificada) | Base de moeFussion v1.1.x; muy extendido para anime |
| Animagine XL | SDXL | 1024x1024 | CreativeML OpenRAIL++-M (no verificada) | Alternativa orientada a etiquetas danbooru |
| Waifu Diffusion 1.4 | SD 1.5 | 512x512 | CreativeML OpenRAIL-M | Recurso de merge citado por el autor; mucho menor |

No se dispone de datos comparativos de rendimiento (FID, CLIP score, preferencia humana) para ninguno de los modelos en la informacion proporcionada, por lo que la comparativa es estructural y de licencia, no de calidad medida.

## Limitaciones y advertencias

- Contenido de riesgo elevado: la model card declara explícitamente que el modelo está orientado a personajes infantiles («loli») y que la versión v1.3-IIZ tiene «más sesgo hacia personajes loli». Esto puede derivar en la generación de contenido sexualizado de menores, lo que infringe las políticas de las principales plataformas de alojamiento, puede ser constitutivo de delito en la Unión Europea y en España y hace desaconsejable su uso en producción sin filtros y revisión legal.
- Sesgos del dataset: el entrenamiento se apoya en recursos anime/booru de origen japonés, lo que produce un sesgo estético (paletas, proporciones, tipos de cuerpo) y una infrarrepresentación de otros estilos y culturas.
- Alucinaciones anatómicas: la propia model card admite problemas históricos en manos, dedos y anatomía, con *negative prompts* específicos para mitigarlos; la calidad depende fuertemente del prompt.
- Dependencia de prompt largo: el autor advierte que prompts de menos de 10 etiquetas pueden dar resultados de baja calidad, lo que reduce la usabilidad en interfaces sencillas.
- Sensibilidad a parámetros: samplers, schedulers y CFG recomendados difieren por versión (er_sde/CFG 3-4 en v3.0; Euler/30 pasos en v1.2); usar los ajustes equivocados degrada la salida.
- Falta de validación comunitaria: 0 descargas y 0 *likes* en el repositorio analizado, sin issues ni discusión pública, lo que impide verificar las afirmaciones del autor.
- Procedencia dudosa del repositorio: el identificador es `Hhg667/moeFussion`, pero las imágenes de ejemplo apuntan a `LoliRimuru/moeFussion`, lo que sugiere una re-subida no necesariamente autorizada.
- Licencia CreativeML OpenRAIL-M: permite uso comercial, pero impone restricciones de uso (prohibición de usos ilícitos, dañinos o que exploten a menores) que deben propagarse aguas abajo a los usuarios del servicio desplegado.
- Sin documentación de datos: no se especifica composición del dataset, número de imágenes ni proceso de curado, lo que impide auditar sesgos y derechos de autor del material de entrenamiento.
- Idioma: no hay soporte declarado de prompts en castellano; las etiquetas documentadas son en inglés.
- Tamaño del repositorio: 430,9 GB dificultan la descarga y el versionado; hay que seleccionar el checkpoint concreto.
- Resultados de búsqueda web no relevantes: las consultas devolvieron únicamente sitios de contenido para adultos sin relación con el modelo, por lo que no se ha podido ampliar la información técnica.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Hhg667/moeFussion
- Repositorio referenciado en las imágenes de ejemplo: https://huggingface.co/LoliRimuru/moeFussion
- Discord del proyecto: https://discord.gg/mZ3eGeNX7S
- Plataforma online citada (Aipictors, japones): https://www.aipictors.com
- Dataset EasyNegative: https://huggingface.co/datasets/gsdf/EasyNegative
- OrangeMixs: https://huggingface.co/WarriorMama777/OrangeMixs
- Waifu Diffusion v1-4: https://huggingface.co/hakurei/waifu-diffusion-v1-4
- Counterfeit V2.5: https://huggingface.co/gsdf/Counterfeit-V2.5
- Based67 (Civitai): https://civitai.com/models/12262?modelVersionId=14459
- EstheticRetroAnime: https://huggingface.co/Yntec/EstheticRetroAnime
- Hassaku: https://huggingface.co/dwarfbum/Hassaku
- animelike2D: https://huggingface.co/stb/animelike2d
- Anima (base de v3.0): https://huggingface.co/circlestone-labs/Anima
