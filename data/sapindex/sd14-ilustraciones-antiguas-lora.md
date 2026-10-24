# Sapindex/sd14-ilustraciones-antiguas-lora

## Resumen

`Sapindex/sd14-ilustraciones-antiguas-lora` es un adaptador LoRA de bajo rango para Stable Diffusion 1.4, entrenado para reproducir el estilo gráfico de ilustraciones de libros antiguos (grabados, xilografías y viñetas decimonónicas). Lo publica el usuario Sapindex como práctica docente del curso PontIA, adaptando el cuaderno de LoRA utilizado en clase, y se distribuye junto al pipeline completo de difusión con la LoRA ya fusionada.

El modelo no aporta una arquitectura nueva: es un fine-tuning ligero sobre `CompVis/stable-diffusion-v1-4`, un transformer de difusión latente con UNet de aproximadamente 860 M de parámetros y un VAE y un text encoder CLIP congelados. El entrenamiento se realizó sobre 500 imágenes del dataset `gigant/oldbookillustrations` durante 5 épocas con rango 6, batch 1 y resolución 512, lo que da un total de unas 2.500 iteraciones.

Su relevancia es, por tanto, formativa y de nicho: sirve como ejemplo reproducible de un pipeline LoRA completo (adaptador suelto más checkpoint fusionado, con registro de hiperparámetros en `parametros_entrenamiento.json`) y como generador de estética de grabado antiguo para ilustración editorial. No hay evaluaciones cuantitativas publicadas, el repositorio no registra descargas ni valoraciones y la licencia no está declarada, lo que limita su uso directo en producción.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Difusión latente text-to-image (UNet + VAE + text encoder CLIP), base Stable Diffusion 1.4; adaptador LoRA de rango 6 sobre el UNet |
| Parametros totales | 859.520.964 (recuento de safetensors del repositorio, correspondiente a los componentes del pipeline, principalmente el UNet de ~860 M); el adaptador LoRA en rango 6 tiene un número de parámetros mucho menor y no se publica |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No aplica; modelo de difusión. Resolución de entrenamiento 512 × 512, ventana de prompt limitada por el tokenizador CLIP de SD 1.4 (77 tokens) |
| Tipos de cuantizacion | No disponible; solo se publican pesos en safetensors sin cuantizar (no hay GGUF ni versiones fp8/int8) |
| Idiomas soportados | No disponible (la model card no declara idiomas; los prompts se procesan con el text encoder CLIP de SD 1.4, orientado mayoritariamente al inglés) |
| Licencia | No disponible en la información proporcionada. El dataset de origen declara CC BY-NC 4.0 y el modelo base publica sus propias condiciones de uso |
| Formato de pesos | safetensors (`pytorch_lora_weights.safetensors` como adaptador independiente) y pipeline completo en formato diffusers (`model_index.json`, `unet/`, `vae/` y resto de componentes) |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura estándar de Stable Diffusion 1.4: autoencoder variacional para pasar al espacio latente, UNet con bloques de atención cruzada condicionados por embeddings de CLIP, y sampler de difusión (DDIM/PNDM/Euler según configuración en inferencia). Sobre el UNet se aplica un adaptador LoRA de rango 6, es decir, descomposiciones de baja dimensionalidad en las proyecciones de atención, lo que mantiene el coste de entrenamiento muy bajo y permite distribuir el adaptador como un fichero pequeño e intercambiable.

El entrenamiento usó 500 imágenes del dataset `gigant/oldbookillustrations` durante 5 épocas con batch 1, learning rate 1e-4, resolución 512 y rango 6, lo que equivale a unas 2.500 iteraciones totales. Las columnas utilizadas del dataset fueron `1600px` (imagen) e `info_alt` (texto descriptivo), de modo que los captions proceden del texto alternativo asociado a cada ilustración, con la variabilidad y ruido que ello implica. No se documenta uso de RLHF, DPO ni etapas de refinamiento posteriores, ni tampoco técnicas de decodificación especulativa, atención lineal o destilación de pasos.

El repositorio incluye tanto el adaptador LoRA independiente como un pipeline completo con la LoRA fusionada en los pesos del UNet. Este segundo formato simplifica el despliegue (no requiere cargar el adaptador por separado) pero duplica el espacio en disco y dificulta el ajuste de la escala de la LoRA en inferencia.

## Capacidades

- Generación de imágenes text-to-image en resolución 512 × 512 con estética de ilustración de libro antiguo: grabado, línea fina, tramado y paleta desaturada.
- Transferencia de estilo aprendida de 500 ilustraciones históricas; funciona mejor con prompts que describan escenas, objetos y composiciones propias de la ilustración editorial clásica.
- Compatible con el ecosistema diffusers: carga mediante `StableDiffusionPipeline` y `load_lora_weights`.
- Compatible con interfaces de usuario habituales (AUTOMATIC1111, ComfyUI, Forge) al estar en formato safetensors compatible con LoRA de SD 1.4.
- Control de la intensidad del estilo mediante el parámetro de escala de la LoRA en el adaptador independiente.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni generación de código: es un modelo puramente generativo visual.
- No tiene capacidades de visión de entrada (no es image-to-image nativo por diseño del adaptador), ni audio, ni modo "thinking".
- Multilingüismo limitado por el text encoder CLIP de SD 1.4; los prompts en castellano funcionan de forma degradada frente al inglés.

## Casos de uso

- Ilustración editorial de nicho: generar viñetas y cabeceras con estética de grabado para revistas, fanzines o libros de relatos, usando prompts descriptivos y la LoRA independiente con escala moderada (0,6-0,8) para controlar la intensidad del estilo.
- Prototipado rápido de portadas: producir 20-50 variaciones en pocos minutos en una GPU de consumo para seleccionar dirección visual antes de encargar la ilustración definitiva a un humano.
- Material didáctico sobre difusión: el repositorio incluye `parametros_entrenamiento.json` con configuración, versiones y pérdidas, lo que lo convierte en un caso de estudio reproducible en un curso de fine-tuning con LoRA.
- Ambientación de proyectos de rol y juegos de mesa: generación de láminas de bestiario, mapas decorativos y fichas ilustradas con estilo homogéneo.
- Contenido para divulgación histórica: ilustraciones de época para acompañar artículos sobre imprenta, xilografía o libros del siglo XIX, siempre que la licencia final del proyecto lo permita.
- Fondo y textura para diseño gráfico: patrones de tramado y elementos ornamentales que después se recomponen en Illustrator o Inkscape.
- Prueba de concepto de personalización de modelos: servir de plantilla para entrenar LoRAs de estilo con datasets pequeños (500 imágenes) y validar hiperparámetros antes de escalar a un dataset mayor.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica explícitamente que "no se han realizado evaluaciones cuantitativas de calidad ni de generalización", por lo que no existen valores de FID, CLIP score, evaluación estética ni comparativas controladas frente a otros adaptadores de estilo.

## Requisitos de hardware

- El adaptador LoRA independiente ocupa del orden de decenas de MB y se aplica sobre un SD 1.4 ya cargado; el repositorio completo son 2,7 GB.
- VRAM para inferencia a 512 × 512 en fp16: aproximadamente 3-4 GB con attention slicing y 4-6 GB sin optimizaciones (estimación para SD 1.4; no medida sobre este checkpoint concreto).
- Cabe en GPU de consumo: RTX 3060 12 GB, RTX 4060 8 GB, RTX 3070/4070, e incluso en tarjetas de 4-6 GB aplicando slicing y `enable_model_cpu_offload`.
- GPU profesionales recomendadas para lotes grandes: A100 40/80 GB, H100, L40S o RTX 4090 para generación masiva en paralelo.
- Despliegue mediante diffusers (`StableDiffusionPipeline.from_pretrained` + `load_lora_weights`), AUTOMATIC1111/Forge, ComfyUI o como endpoint de inferencia propio. vLLM y TGI no aplican: están orientados a modelos de lenguaje, no a pipelines de difusión.
- Throughput orientativo (estimación, no medida en este modelo): del orden de 1-3 imágenes por segundo en una RTX 4090 con 20-30 pasos y scheduler Euler; en CPU, decenas de segundos por imagen, lo que desaconseja su uso sin GPU.
- Almacenamiento: 2,7 GB para el checkpoint fusionado más el espacio del SD 1.4 base si se usa el adaptador por separado.

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros | Resolución | Contexto / prompt | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| sd14-ilustraciones-antiguas-lora | LoRA de estilo sobre SD 1.4 | ~860 M en el UNet del pipeline; adaptador de rango 6 no publicado | 512 × 512 | 77 tokens (CLIP) | No disponible (dataset CC BY-NC 4.0) | HuggingFace, diffusers |
| Stable Diffusion 1.4 (base) | Modelo base text-to-image | ~860 M en el UNet | 512 × 512 | 77 tokens (CLIP) | Condiciones propias del modelo base (referencia pública: CreativeML Open RAIL-M) | HuggingFace, diffusers |
| Stable Diffusion XL 1.0 (base) | Modelo base text-to-image | UNet de ~2,6 B | 1024 × 1024 | 77 tokens por encoder, con encoder dual | Condiciones propias (referencia pública: CreativeML Open RAIL++-M) | HuggingFace, diffusers |
| LoRA de estilo genérica sobre SD 1.4 | Adaptador de estilo | Depende del rango (habitualmente 4-128) | 512 × 512 | 77 tokens (CLIP) | Variable según autor | HuggingFace, Civitai |

La comparación relevante es frente a la SD 1.4 base: este adaptador añade una estética concreta sin cambiar resolución, arquitectura ni coste de inferencia. Frente a SDXL, ofrece menor resolución nativa y menor calidad de composición, pero requiere mucha menos VRAM y permite iterar en tarjetas de gama media. No se dispone de métricas que cuantifiquen la mejora de estilo frente a otros LoRAs de ilustración histórica.

## Limitaciones y advertencias

- No existen evaluaciones de calidad, generalización ni sesgo: la model card lo declara explícitamente. Cualquier afirmación sobre su rendimiento sería especulativa.
- Entrenamiento con solo 500 imágenes y 5 épocas en rango 6: riesgo alto de sobreajuste al dataset y de reproducir composiciones concretas de las ilustraciones originales (memorización parcial).
- Los captions provienen del campo `info_alt` del dataset, no de anotaciones curadas; la alineación prompt-imagen es probablemente ruidosa, lo que degrada el control fino mediante texto.
- Sesgos esperables: el corpus son ilustraciones de libros antiguos, con predominio de estética occidental decimonónica, figuras humanas vestidas de época y posibles estereotipos coloniales o de género propios del material original.
- Limitación de idioma: el text encoder CLIP de SD 1.4 responde mucho mejor en inglés; los prompts en castellano pueden producir resultados inconsistentes.
- Licencia del modelo no declarada, mientras que el dataset de origen es CC BY-NC 4.0 (no comercial). El uso comercial del adaptador es jurídicamente ambiguo y requiere revisar también las condiciones del modelo base.
- El repositorio incluye un pipeline completo con la LoRA fusionada: imposible desactivar el estilo sin recurrir al adaptador independiente, y el checkpoint fusionado fija la escala de la LoRA.
- Sin mantenimiento ni tracción comunitaria (0 descargas, 0 valoraciones en el momento de la ficha), lo que implica ausencia de soporte, issues resueltos o casos de uso verificados.
- No apto para tareas de razonamiento, código, agentes ni procesamiento de lenguaje: es exclusivamente un generador de imágenes.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Sapindex/sd14-ilustraciones-antiguas-lora
- Modelo base: https://huggingface.co/CompVis/stable-diffusion-v1-4
- Dataset de entrenamiento: https://huggingface.co/datasets/gigant/oldbookillustrations
- Resultados de la búsqueda web: no se han encontrado enlaces técnicos relevantes para este modelo; las URLs devueltas por la búsqueda no guardan relación con el repositorio ni con difusión text-to-image.
