# FloydianSound/Aoi_Ogata_Artstyle_v1-5

## Resumen
Aoi_Ogata_Artstyle_v1-5 es un modelo de difusion texto-a-imagen obtenido mediante fine-tuning de Stable Diffusion v1.5 sobre el estilo artistico de la ilustradora Aoi Ogata. Lo desarrolla el usuario FloydianSound y lo publica en Hugging Face con la libreria diffusers y la licencia CreativeML OpenRAIL-M. El modelo resuelve un problema acotado: generar ilustraciones coherentes con una estetica concreta (paleta, lineas, tratamiento de la figura y del fondo) sin necesidad de prompts excesivamente largos ni de tecnicas de embeddings textuales adicionales.

Arquitectonicamente es un UNet de difusion latente de tipo Stable Diffusion 1.5, con un VAE y un text encoder CLIP; no se especifica en la informacion disponible ninguna modificacion estructural respecto al modelo base. El entrenamiento declara 40 700 pasos repartidos en 10 epochs sobre 407 imagenes de la artista, con Aspect Ratio Bucketing centrado en 768 pixeles. El repositorio ocupa 9,7 GB, lo que corresponde a los pesos completos en precision fp16/fp32 del pipeline.

Su relevancia es la de un modelo de estilo especializado y ligero: se integra en el ecosistema diffusers y en endpoints compatibles, y permite obtener resultados de estilo con hardware de consumo, algo util para ilustracion, prototipado visual y pipelines creativos acotados. Las descargas y los likes registrados son bajos (20 descargas y 6 likes), lo que lo situa como un recurso de nicho.

## Especificaciones técnicas
| Parametro | Valor |
|---|---|
| Arquitectura | Stable Diffusion 1.5 (difusion latente, UNet + VAE + text encoder CLIP), fine-tune de estilo |
| Parametros totales | no disponible (no declarado; corresponde a la familia SD 1.5, aproximadamente 860 M en el UNet mas VAE y text encoder) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo texto-a-imagen; el condicionamiento es un prompt de hasta 77 tokens CLIP) |
| Tipos de cuantizacion | no disponible en la informacion proporcionada (al ser diffusers/SD 1.5 es compatible con fp16, fp32 y cuantizaciones de la comunidad, pero no se documentan) |
| Idiomas soportados | en (ingles) |
| Licencia | creativeml-openrail-m |
| Formato de pesos | diffusers (pesos del pipeline; no se declara GGUF ni safetensors de forma explicita) |

## Arquitectura y entrenamiento
El modelo parte de Stable Diffusion v1.5, un transformer de difusion latente que opera en el espacio comprimido de un VAE y se condiciona mediante embeddings de texto CLIP. El autor declara un fine-tuning de 40 700 pasos durante 10 epochs sobre 407 imagenes de Aoi Ogata, empleando Aspect Ratio Bucketing centrado en 768 pixeles de resolucion. No se documentan en la informacion disponible el tamanio del dataset de regularizacion, la composicion exacta de las captions, el optimizador, la tasa de aprendizaje ni si se aplico RLHF/DPO (no aplicable en este tipo de modelo) o tecnicas como LoRA, DreamBooth o textual inversion.

Como innovacion practica, el uso de Aspect Ratio Bucketing a 768 permite entrenar con relaciones de aspecto variadas sin recortes agresivos, lo que suele mejorar la composicion en generaciones verticales y horizontales. El autor publica ademas un archivo tags.txt con los tokens y sus ocurrencias, lo que facilita reproducir el vocabulario de estilo empleado durante el entrenamiento. No se declara ninguna tecnica de decodificacion especulativa, atencion lineal ni sampler especifico.

## Capacidades
- Generacion de imagenes a partir de prompts en ingles con estetica de ilustracion de Aoi Ogata.
- Estilizacion de personajes, figuras y escenas con coherencia de paleta y linea.
- Control mediante prompts negativos y samplers habituales de SD 1.5 (no se documentan valores recomendados).
- Compatibilidad con el pipeline `StableDiffusionPipeline` de diffusers y con endpoints compatibles.
- Uso de tokens de estilo documentados en tags.txt para reforzar la estetica.
- No dispone de tool calling, function calling, agentes ni razonamiento multi-paso: es exclusivamente texto-a-imagen.
- No dispone de vision, audio ni modo thinking.
- Capacidad multilingue limitada al ingles segun los metadatos.

## Casos de uso
- Ilustracion editorial y de encargo: generar bocetos y variaciones con una estetica consistente para revisar direccion de arte antes de producir la pieza final, gracias al fine-tune sobre 407 obras de referencia.
- Prototipado de personajes para videojuego o comic: producir hojas de personaje y expresiones con un tratamiento grafico homogeneo, usando Aspect Ratio Bucketing a 768 para encuadres verticales y horizontales.
- Contenido para redes y portfolios: crear imagenes de apoyo con estilo reconocible para artistas que quieran mantener una linea visual comun en sus publicaciones.
- Moodboards y previsualizacion de producto: generar escenas conceptuales para presentaciones internas de marketing, con prompts negativos para controlar composicion.
- Pipelines de generacion por lotes en servidor: integrar el pipeline diffusers en endpoints compatibles para producir variantes de una misma ilustracion de forma automatizada.
- Educacion y experimentacion en difusion: usar el modelo como caso de estudio de fine-tuning de estilo en SD 1.5, con tags.txt como referencia del vocabulario aprendido.
- Bases para entrenamiento posterior: servir de checkpoint de partida para merges o nuevos fine-tunes de estilo dentro del ecosistema SD 1.5.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware
- VRAM estimada: no disponible de forma oficial; para un pipeline SD 1.5 en fp16 se situa tipicamente en el entorno de 4 a 6 GB, y en fp32 en torno a 8 GB, aunque estas cifras no estan declaradas por el autor.
- GPU recomendadas: no declaradas; por familia SD 1.5 resultan adecuadas tarjetas consumer de 8 GB o mas (RTX 3060, 3070, 4060, 4070, 4090) y aceleradores de datacenter (A100, H100) para lotes grandes.
- Cabe en GPU consumer: si, en tarjetas con al menos 6-8 GB de VRAM segun precision, aunque no hay confirmacion oficial en la model card.
- Opciones de despliegue: diffusers (libreria declarada), endpoints compatibles; el resto (vLLM, llama.cpp, Ollama, TGI) no esta documentado para este modelo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares
| Modelo | Parametros | Contexto de prompt | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Aoi_Ogata_Artstyle_v1-5 | familia SD 1.5 (no declarado) | 77 tokens CLIP | sin benchmarks publicados | creativeml-openrail-m | Hugging Face, diffusers |
| Stable Diffusion v1.5 (base) | ~860 M (UNet) | 77 tokens CLIP | ampliamente evaluado por la comunidad | creativeml-openrail-m | Hugging Face, diffusers |
| Stable Diffusion 2.1 | ~865 M (UNet) | 77 tokens CLIP | evaluado por la comunidad | creativeml-openrail-m | Hugging Face, diffusers |
| SDXL 1.0 | no comparable (mayor) | 77 tokens CLIP (doble encoder) | evaluado por la comunidad | creativeml-openrail-m | Hugging Face, diffusers |

La comparativa es estructural: se trata de un fine-tune de estilo sobre SD 1.5 y no compite en parametros ni en resolucion nativa con SDXL. No hay datos de rendimiento cuantitativo para el modelo de Aoi Ogata en la informacion disponible.

## Limitaciones y advertencias
- Sesgos conocidos: no documentados; al entrenar sobre obra de una unica artista, el modelo hereda sus convenciones esteticas y puede reproducir sesgos de representacion de la obra original.
- Riesgo de alucinacion visual: como todo modelo de difusion, puede generar anatomia incorrecta, texto ilegible y detalles incoherentes, especialmente en manos, extremidades y composiciones complejas.
- Limitaciones de contexto e idioma: prompts en ingles (unico idioma declarado) y ventana de condicionamiento de 77 tokens CLIP; prompts largos pierden informacion.
- Restricciones de licencia: CreativeML OpenRAIL-M permite uso comercial y redistribucion, pero obliga a mantener las restricciones de uso, prohibe generar contenido ilegal o danino y exige compartir la licencia con los usuarios del servicio.
- Caveats para produccion: el modelo esta entrenado sobre 407 imagenes y centrado en 768 pixeles; la resolucion nativa de SD 1.5 es 512, por lo que a resoluciones altas pueden aparecer duplicaciones. No hay benchmarks ni valores de sampler recomendados, lo que obliga a calibrar CFG, steps y prompts negativos en cada pipeline.
- Derechos de terceros: la model card remite a los perfiles de ArtStation y DeviantArt de la artista; el uso comercial de la estetica debe evaluarse con cuidado respecto a derechos de la obra original.

## Enlaces
- Modelo en Hugging Face: https://huggingface.co/FloydianSound/Aoi_Ogata_Artstyle_v1-5
- Chart de ejemplo: https://huggingface.co/FloydianSound/Aoi_Ogata_Artstyle_v1-5/resolve/main/AoiOgata_Chart.png
- Artista (ArtStation): https://www.artstation.com/aoiogata
- Artista (DeviantArt): https://www.deviantart.com/aoiogataartist
- Licencia CreativeML OpenRAIL-M: https://huggingface.co/spaces/CompVis/stable-diffusion-license
