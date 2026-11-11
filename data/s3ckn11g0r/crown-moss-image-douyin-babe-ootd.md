# S3ckn11g0r/CROWN-MOSS-Image-Douyin-Babe-OOTD

## Resumen

CROWN-MOSS-Image-Douyin-Babe-OOTD es un LoRA de estilo para generación de imagen a texto (text-to-image) desarrollado por el usuario NineCrowns (S3ckn11g0r en Hugging Face). No es un modelo base, sino un adaptador de bajo rango que se aplica sobre MOSS-Image, un modelo de difusión que combina un codificador de texto basado en Qwen3.5-9B con un VAE derivado de Flux2. El LoRA está especializado en retratos fotorrealistas de estética "influencer" de Douyin (TikTok chino), con dos sub-estilos diferenciados: primeros planos faciales y planos medios de moda OOTD (outfit of the day).

El adaptador se entrenó sobre 355 imágenes de alta resolución, sin marcas de agua y deduplicadas mediante hash perceptual dHash, organizadas en dos buckets separados. El entrenamiento se realizó a resolución nativa de 1024×1536 en un clúster de 8 GPU NVIDIA B200, con rango y alpha de 64. El resultado es un LoRA de 283,59 MB en formato safetensors, compatible directamente con el nodo de carga de LoRA de ComfyUI para MOSS-Image gracias a su estructura de claves `proj.{q,k,v}` separadas.

La relevancia de esta ficha es acotada: se trata de un adaptador de nicho, con cero descargas y cero likes en el momento de la consulta, publicado bajo una licencia personalizada ("bespoke-lora-license") que remite al perfil de Civitai del autor. No hay información pública sobre benchmarks, idiomas soportados ni evaluación cuantitativa del adaptador.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (adaptador de bajo rango) sobre MOSS-Image; claves separadas `proj.{q,k,v}` |
| Parametros totales | no disponible (el archivo pesa 283,59 MB) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (depende del codificador de texto Qwen3.5-9B del modelo base) |
| Tipos de cuantizacion | no disponible (los pesos se distribuyen en safetensors; el modelo base se referencia en bf16) |
| Idiomas soportados | no disponible (los prompts del autor están en inglés; el modelo base incorpora un codificador Qwen3.5-9B) |
| Licencia | bespoke-lora-license (licencia personalizada, enlace a Civitai del autor) |
| Formato de pesos | safetensors (`CROWN_MOSS_Image_Douyin_Babe_Edgy_OOTD_V1_r64.safetensors`) |

## Arquitectura y entrenamiento

El LoRA se aplica sobre MOSS-Image, cuyo pipeline combina tres componentes según la model card: `moss_image_sft_bf16.safetensors` (modelo de difusión), `qwen3.5_9b_bf16.safetensors` (codificador de texto) y `flux2-vae.safetensors` (VAE). El adaptador se entrena con rango 64 y alpha 64, y emplea un formato nativo de claves divididas `proj.{q,k,v}` que lo hace directamente cargable en los nodos de LoRA de ComfyUI para MOSS-Image sin conversión previa.

El conjunto de entrenamiento consta de 355 imágenes de retratos y moda de Douyin, de alta resolución y sin marcas de agua, filtradas por hash perceptual dHash para eliminar duplicados y limpiadas manualmente. Se organizaron en dos sub-buckets: uno de primeros planos faciales (activado con `crown_douyin_babe` + `crown_babe_face`) y otro de planos medios y tres cuartos de moda OOTD (activado con `crown_douyin_babe` + `crown_babe_ootd`). El entrenamiento se ejecutó a resolución nativa 1024×1536 en un clúster de 8×NVIDIA B200. No se especifican en la información disponible el número de pasos, la tasa de aprendizaje, el optimizador ni si hubo regularización con imágenes de clase.

## Capacidades

- Generación de retratos fotorrealistas de estética influencer de Douyin, con estructura facial V-line, textura de piel "porcelana cálida" y reflejos oculares definidos.
- Dos modos de encuadre controlados por palabras gatillo: primer plano facial (`crown_babe_face`) y plano medio/tres cuartos de moda (`crown_babe_ootd`).
- Coherencia estética entre encuadres: el autor afirma que el rostro y el tono de piel se mantienen consistentes entre primeros planos y planos de cuerpo.
- Renderizado de manos con cinco dedos "limpios" según la model card (afirmación del autor, no verificada de forma independiente).
- Texturas de tejido (punto, seda, terciopelo) y fondos con enfoque profundo nítido.
- Compatibilidad nativa con ComfyUI mediante el cargador de LoRA de MOSS-Image.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso, visión de entrada, audio ni modo "thinking": es un adaptador puramente generativo de imagen.

## Casos de uso

- Generación de retratos de moda para catálogos editoriales: con el gatillo `crown_babe_ootd` y resolución 1024×1536 se obtienen planos medios de outfits con texturas de tejido definidas, útiles para maquetas de campañas antes de una sesión fotográfica real.
- Pruebas de concepto de personajes para cómic o narrativa visual: el par `crown_douyin_babe` + `crown_babe_face` permite fijar un rostro consistente en primeros planos, que luego se reutiliza en planos medios con `crown_babe_ootd`.
- Exploración de estilos para marcas de cosmética: los primeros planos con textura de piel y labios brillantes sirven para moodboards de producto y referencias de iluminación.
- Previsualización de vestuario en producción audiovisual: planos tres cuartos con fondos nítidos permiten evaluar paletas y siluetas antes de rodar.
- Generación de contenido para redes sociales: el adaptador está entrenado específicamente con la estética de Douyin, por lo que encaja en flujos de creación de imágenes verticales 1024×1536 para publicaciones.
- Iteración rápida en ComfyUI: al cargarse como LoRA estándar con claves `proj.{q,k,v}`, se puede alternar el peso entre 0,85 y 0,95 dentro de un grafo existente de MOSS-Image sin reconfigurar el pipeline.
- Prototipado de avatares virtuales: combinando ambos buckets se puede mantener una identidad facial coherente entre retrato y cuerpo, útil para personajes sintéticos de marca.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- El LoRA en sí ocupa 283,59 MB en disco, pero la inferencia requiere cargar el modelo base completo de MOSS-Image (difusión + codificador Qwen3.5-9B + VAE Flux2), cuyo peso en VRAM no se detalla en la información disponible.
- El entrenamiento se realizó en 8×NVIDIA B200, lo que indica que el pipeline completo de MOSS-Image está pensado para hardware de centro de datos.
- No se dispone de datos sobre si el pipeline completo cabe en GPU de consumo (RTX 4090, 4080, etc.); el codificador de texto de 9B en bf16 ya supone una carga considerable por sí solo.
- Opciones de despliegue documentadas: ComfyUI con el cargador de LoRA de MOSS-Image. No se mencionan vLLM, llama.cpp, Ollama ni TGI (no aplican a un pipeline de difusión de este tipo).
- Parámetros de inferencia recomendados por el autor: 1024×1536, 28–30 pasos, shift 5.0, CFG 3.5, peso de LoRA 0,85–0,95 (los ejemplos se generaron a 0,90).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye otros LoRA de estética Douyin ni datos comparativos de rendimiento frente a adaptadores equivalentes. Como referencia estructural, el adaptador depende del ecosistema MOSS-Image (codificador Qwen3.5-9B + VAE Flux2), pero no se aportan métricas que permitan una comparación cuantitativa con alternativas.

## Limitaciones y advertencias

- Sesgos estéticos: el entrenamiento se limita a 355 imágenes de un nicho muy concreto (estética "pure desire" de Douyin), lo que puede producir un sesgo fuerte hacia un ideal facial y de tono de piel específico y escasa diversidad de rasgos, edades y complexiones.
- Riesgo de alucinación visual: como todo modelo de difusión, puede generar anatomía incorrecta (manos, dedos, orejas) pese a la afirmación del autor sobre manos de cinco dedos; conviene revisar cada salida.
- Conjunto de datos pequeño: 355 imágenes es un volumen reducido para un LoRA de estilo, lo que puede provocar sobreajuste a poses, iluminaciones y fondos concretos del dataset.
- Licencia restrictiva y poco clara: "bespoke-lora-license" remite a un perfil de Civitai en lugar de a un texto legal; antes de uso comercial hay que verificar los términos exactos con el autor. No se especifica si el uso comercial está permitido.
- Dependencia del modelo base: el LoRA no es autónomo; requiere MOSS-Image con sus tres componentes (difusión, Qwen3.5-9B y VAE Flux2), cuyas licencias y disponibilidad deben comprobarse por separado.
- Idiomas: no hay información sobre el soporte multilingüe de los prompts; la model card solo muestra prompts en inglés.
- Adopción nula: cero descargas y cero likes en el momento de la consulta, sin validación independiente por parte de la comunidad.
- Contenido sensible: la temática ("alluring", "pure desire") puede derivar en salidas no aptas para todos los públicos; se recomienda filtrado y moderación en producción.

## Enlaces

- Hugging Face: https://huggingface.co/S3ckn11g0r/CROWN-MOSS-Image-Douyin-Babe-OOTD
- Civitai del autor: https://civitai.com/models/3045476
- Perfil del autor en Civitai (licencia): https://civitai.com/user/NineCrowns
- Demo en RunningHub: https://www.runninghub.ai/model/public/2120440527274643458
