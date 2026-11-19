# rngzzhzr/anima_baseV10

## Resumen

anima_baseV10 es un LoRA de texto a imagen publicado por el usuario rngzzhzr en Hugging Face, construido sobre el modelo base oron1208/OOO_Anima. Se distribuye como adaptador en formato diffusers con la etiqueta `template:diffusion-lora` y un peso total de repositorio de 4,2 GB. Su propósito es especializar el modelo base Anima, un text-to-image de aproximadamente 2.000 millones de parámetros orientado a ilustración anime y contenido no fotorrealista, desarrollado por CircleStone Labs en colaboración con Comfy Org.

El modelo subyacente se entrenó con varios millones de imágenes anime y unas 800.000 imágenes artísticas no anime, sin datos sintéticos, con fecha de corte de conocimiento para el material anime en septiembre de 2025. Anima emplea un text encoder Qwen 3 de 0,6B y el VAE de Qwen-Image, y está soportado de forma nativa en ComfyUI. El LoRA anima_baseV10 hereda esas características y añade un ajuste fino específico cuyo detalle de entrenamiento no está documentado en la información disponible.

La relevancia de esta ficha es doble: por un lado, documenta un adaptador de la familia Anima, un ecosistema emergente de generación de ilustración que compite con flujos SDXL y Pony en el nicho anime; por otro, advierte de que el repositorio no incluye model card propia más allá de los metadatos, no tiene descargas ni valoraciones y carece de información sobre el dataset, los hiperparámetros o las métricas de entrenamiento del LoRA.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA sobre modelo de difusión text-to-image (base: oron1208/OOO_Anima); arquitectura interna del base no detallada en la información disponible |
| Parametros totales | No disponible para el LoRA; el modelo base Anima declara aproximadamente 2.000 millones de parámetros |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No aplica (modelo de imagen); resolución nativa de generación entre 512x512 y 1536x1536 píxeles |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible (el prompting documentado del base está en inglés, con etiquetas estilo Danbooru) |
| Licencia | cdla-permissive-2.0 |
| Formato de pesos | Diffusers (repositorio de 4,2 GB); el base se distribuye en safetensors para ComfyUI |

## Arquitectura y entrenamiento

El LoRA se aplica sobre Anima, un modelo de difusión text-to-image de unos 2.000 millones de parámetros que utiliza un text encoder Qwen 3 de 0,6B y el VAE de Qwen-Image. La model card del base describe un entrenamiento con varios millones de imágenes anime y aproximadamente 800.000 imágenes artísticas no anime, sin datos sintéticos, con corte de conocimiento anime en septiembre de 2025. Se añadieron dos conjuntos no anime, LAION-POP (versión ye-pop) y DeviantArt, filtrados para excluir fotografías y etiquetados con una etiqueta de dataset al inicio del prompt.

El base emplea entrenamiento con tag dropout aleatorio, lo que permite prompts parciales sin penalización severa, y admite prompts compuestos por etiquetas estilo Danbooru, lenguaje natural o mezclas de ambos. La información disponible no detalla la arquitectura interna del difusor (tipo de transformer, mecanismo de atención ni esquema de condicionamiento), ni los hiperparámetros, dataset o método de entrenamiento específicos del LoRA anima_baseV10. Tampoco se documenta si hubo RLHF, DPO ni ninguna fase de alineación adicional.

## Capacidades

- Generación de imágenes text-to-image orientada a ilustración anime, personajes, estilos y composiciones artísticas no fotorrealistas.
- Acepta prompts con etiquetas estilo Danbooru y Gelbooru, lenguaje natural o combinaciones de ambos.
- Soporta etiquetas de calidad humana (masterpiece, best quality, etc.) y etiquetas de modelo estético (score_9 a score_1).
- Etiquetas temporales (year 2025, newest, recent, mid, early, old) para controlar la estética por época.
- Etiquetas de seguridad (safe, sensitive, nsfw, explicit) y metaetiquetas (highres, absurdres, anime screenshot, jpeg artifacts, official art).
- Etiquetas de artista con prefijo @ para inducir estilos concretos.
- Etiquetas de dataset (ye-pop, deviantart) para generar contenido artístico no anime.
- Resoluciones de generación entre 512x512 y 1536x1536 píxeles.
- Muestreadores compatibles: er_sde, euler_a, dpmpp_2m_sde_gpu, con scheduler beta57 mediante nodos RES4LYF.
- No dispone de tool calling, agentes, razonamiento multi-paso, visión de entrada ni audio: es exclusivamente generación de imagen.

## Casos de uso

- Ilustración de personajes anime para proyectos independientes: el modelo permite generar personajes originales o de series concretas mediante etiquetas de personaje y serie, con control de época y estilo mediante etiquetas temporales y de artista.
- Creación de arte conceptual para videojuegos y cómics: la ventana de resolución de hasta 1536x1536 y el soporte de highres y absurdres permiten obtener láminas de referencia con detalle suficiente para bocetos posteriores.
- Generación de fondos y escenarios estilizados: las etiquetas de dataset ye-pop y deviantart aportan diversidad de estilos pictóricos no anime, útiles para escenarios de fantasía o ciencia ficción.
- Producción de fan art y contenido para comunidades: el prompting con etiquetas Danbooru y Gelbooru encaja con flujos de trabajo habituales de aficionados que ya conocen ese vocabulario.
- Exploración estilística y experimentación artística: el ajuste fino sobre Anima permite probar combinaciones de etiquetas de artista y calidad para estudiar variaciones de estilo dentro de un mismo personaje.
- Integración en pipelines de ComfyUI: al ser un LoRA sobre un modelo nativamente soportado en ComfyUI, se puede encadenar con nodos de upscaling, control de composición y postprocesado dentro de un grafo reproducible.
- Prototipado rápido de ilustraciones para validación de dirección de arte: con 30-50 pasos y CFG 4-6 se obtienen muestras en tiempos moderados, adecuadas para iterar sobre propuestas antes de encargar arte final.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible para el LoRA de forma aislada; el modelo base Anima declara unos 2.000 millones de parámetros, lo que sitúa la inferencia en un rango orientativo de 6-10 GB de VRAM en precisión reducida, aunque este dato no está confirmado en la información proporcionada.
- GPU recomendadas: no disponible. Por tamaño del base, cabría esperar compatibilidad con GPU de consumo de gama media-alta, pero no hay confirmación oficial.
- Compatibilidad con GPU de consumo: no confirmada en la información disponible.
- Opciones de despliegue: ComfyUI de forma nativa para el modelo base, con los archivos `anima-base-v1.0.safetensors` en `models/diffusion_models`, `qwen_3_06b_base.safetensors` en `models/text_encoders` y `qwen_image_vae.safetensors` en `models/vae`. El LoRA se carga como adaptador adicional. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no aplican a modelos de difusión.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / resolucion | Licencia | Disponibilidad |
|---|---|---|---|---|
| anima_baseV10 (este LoRA) | No disponible (base ~2B) | 512x512 a 1536x1536 | cdla-permissive-2.0 | Hugging Face, diffusers |
| oron1208/OOO_Anima (base) | ~2B | 512x512 a 1536x1536 | No disponible en la informacion | Hugging Face, ComfyUI nativo |
| Alternativas SDXL-based para anime | No disponible | No disponible | No disponible | No disponible |

No se dispone de datos de benchmarks ni de especificaciones detalladas de alternativas comparables en la información proporcionada, por lo que la comparación cuantitativa no es posible.

## Limitaciones y advertencias

- El repositorio no incluye model card propia: no se documentan el dataset, los hiperparámetros ni el método de entrenamiento del LoRA, lo que dificulta evaluar su comportamiento y reproducibilidad.
- El modelo base declara explícitamente que no funciona bien en fotorrealismo; su uso previsto es ilustración y arte no fotorrealista.
- Riesgo de alucinación visual: como todo modelo generativo de imagen, puede producir anatomía incorrecta, texto ilegible y detalles inconsistentes, especialmente en resoluciones altas o prompts ambiguos.
- Sesgos conocidos: el entrenamiento con etiquetas Danbooru y Gelbooru puede heredar sesgos de representación y estereotipos presentes en esos corpus; no se documenta ninguna mitigación.
- Idiomas: la información disponible no confirma soporte multilingüe del prompting; la documentación del base está en inglés y usa vocabulario de etiquetas en inglés.
- Restricciones de licencia: la licencia cdla-permissive-2.0 permite uso comercial según sus términos, pero debe verificarse la compatibilidad con la licencia del modelo base oron1208/OOO_Anima, que no se detalla en la información disponible.
- El repositorio registra 0 descargas y 0 valoraciones, sin evidencia de uso en producción ni validación por parte de la comunidad.
- No hay garantías de soporte, mantenimiento ni actualizaciones del adaptador.
- La fecha de creación y actualización del repositorio (2026-11-19) es posterior a la fecha de corte de conocimiento anime del base (septiembre de 2025), lo que puede implicar desajustes con contenido reciente no visto durante el entrenamiento del base.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/rngzzhzr/anima_baseV10
- Modelo base: https://huggingface.co/oron1208/OOO_Anima
- ComfyUI: https://github.com/comfyanonymous/ComfyUI
- Nodos RES4LYF (scheduler beta57): no disponible en la información proporcionada
- Paper o blog de Anima: no disponible en la información proporcionada
- Demos: no disponible en la información proporcionada
