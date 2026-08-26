# LarryAIDraw/Sigrid_ZZZ_v1

## Resumen

Sigrid_ZZZ_v1 es un LoRA (Low-Rank Adaptation) para el modelo de generación de imágenes Illustrious, desarrollado por el usuario LarryAIDraw. El modelo está diseñado para generar ilustraciones del personaje Sigrid de L'Azur del videojuego *Zenless Zone Zero* (ZZZ), un personaje con rasgos equinos (orejas de caballo y cola) y una armadura blanca de cuerpo entero. Se trata de un adaptador de estilo y personaje, no de un modelo base completo: requiere un modelo base compatible con la arquitectura Illustrious (derivada de Stable Diffusion XL) para funcionar.

La relevancia de este modelo reside en su especialización: permite a desarrolladores y artistas generar imágenes consistentes de un personaje concreto sin necesidad de entrenar un modelo desde cero. El repositorio de HuggingFace contiene únicamente el adaptador (0.2 GB), con licencia CreativeML OpenRAIL-M, una licencia permisiva para uso no comercial y comercial con restricciones de uso responsable. No hay información sobre el pipeline de entrenamiento, el dataset ni los hiperparámetros en la ficha del repositorio.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA sobre Illustrious (basado en Stable Diffusion XL) |
| Parametros totales | no disponible (archivo de pesos de ~54.76 MB en fp16) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de generación de imágenes) |
| Tipos de cuantizacion | no aplica (pesos en fp16, safetensors) |
| Idiomas soportados | no aplica (genera imágenes, no texto) |
| Licencia | CreativeML OpenRAIL-M |
| Formato de pesos | safetensors (fp16) |

## Arquitectura y entrenamiento

El modelo es un LoRA (Low-Rank Adaptation) que se aplica sobre la arquitectura Illustrious, un modelo de difusión latente derivado de Stable Diffusion XL (SDXL). Los LoRA inyectan matrices de bajo rango en las capas de atención cruzada y de texto del modelo base, permitiendo ajustar el modelo para generar un personaje concreto con un coste de entrenamiento y almacenamiento reducido. El archivo de pesos es de aproximadamente 54.76 MB en fp16, lo que indica un rango bajo y una especialización limitada a un solo personaje.

No se dispone de información sobre el dataset de entrenamiento, el número de pasos, la tasa de aprendizaje ni el proceso de optimización. La licencia CreativeML OpenRAIL-M permite el uso comercial con restricciones sobre usos perjudiciales, pero no se documentan los datos de entrenamiento en el repositorio.

## Capacidades

- Generación de imágenes del personaje Sigrid de L'Azur (ZZZ) con características fieles: orejas de caballo, pelo largo rubio con flequillo lateral, ojos verdes, cinta azul, cuerpo blanco con paneles negros y armadura de hombro.
- Compatible con el modelo base Illustrious (SDXL), por lo que hereda la capacidad de generar imágenes de alta resolución (típicamente 1024x1024 o superiores) con estética anime.
- Puede combinarse con otros LoRA y modelos para crear composiciones variadas, ya que los adaptadores se pueden apilar.
- No soporta herramientas de tool calling, razonamiento multi-paso ni procesamiento de texto: es exclusivamente un adaptador de imagen.

## Casos de uso

- Creación de fan art de *Zenless Zone Zero*: el LoRA permite generar imágenes consistentes del personaje Sigrid de L'Azur en escenas, poses y fondos variados, manteniendo el diseño oficial.
- Ilustración para proyectos no comerciales: artistas pueden usar el modelo para bocetos, portadas o cómics de fan, con la licencia OpenRAIL-M que permite uso no comercial sin restricciones adicionales.
- Prototipado de concept art: diseñadores pueden generar variantes del personaje con diferentes outfits o estilos (por ejemplo, cambiando el prompt para alterar la ropa) sin necesidad de redibujar desde cero.
- Entrenamiento de modelos compuestos: se puede combinar este LoRA con otros adaptadores (estilos, fondos, etc.) para crear un pipeline de generación más complejo en ComfyUI o Automatic1111.
- Generación de avatares o ilustraciones para redes sociales: el modelo puede producir imágenes de perfil o banners con el personaje, con calidad suficiente para uso web.
- Evaluación de técnicas de personalización: para investigadores en IA generativa, el modelo sirve como caso de estudio de cómo un LoRA de bajo rango captura atributos específicos de un personaje (orejas, cola, vestimenta) con pocos parámetros.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No hay datos de FID, CLIP score ni comparaciones cuantitativas con otros LoRA de personajes. La calidad visual se evalúa de forma subjetiva y depende del modelo base (Illustrious) y del prompt utilizado.

## Requisitos de hardware

- VRAM estimada: al ser un LoRA de ~55 MB, los requisitos son los del modelo base Illustrious. Con una GPU de 8 GB de VRAM (por ejemplo, RTX 3070) se puede generar imágenes de 1024x1024 con cuantización fp16.
- GPUs recomendadas: RTX 3060 (12 GB) para mayor comodidad, RTX 4090 o A100 para generación por lotes o con varios LoRA cargados.
- En consumer GPU: sí, cualquier tarjeta con 8 GB de VRAM puede ejecutar el modelo base más el LoRA, usando Automatic1111, ComfyUI o Forge.
- Opciones de despliegue: Automatic1111 (WebUI), ComfyUI, InvokeAI, o mediante la API de Diffusers (con el pipeline StableDiffusionXLPipeline y cargando el LoRA).
- Latencia y throughput: no disponible. La velocidad depende del hardware y del modelo base; en una RTX 4090, una imagen 1024x1024 con 30 pasos de muestreo suele tardar entre 2 y 5 segundos.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Sigrid_ZZZ_v1 (LarryAIDraw) | LoRA sobre Illustrious | ~55 MB (fp16) | no aplica | CreativeML OpenRAIL-M | HuggingFace, Civitai |
| Sigrid de L'Azur V1 (Civitai) | LoRA sobre Illustrious | ~55 MB (fp16) | no aplica | CreativeML OpenRAIL-M | Civitai |
| Sigrid de L'Azur V2 (Civitai) | LoRA sobre Illustrious | ~55 MB (fp16) | no aplica | CreativeML OpenRAIL-M | Civitai |

No hay modelos comparables de la misma categoría (LoRA para el mismo personaje) con datos públicos de rendimiento. Los tres modelos listados son variantes del mismo concepto (Sigraig de L'Azur) y difieren en la versión del entrenamiento (V1 vs V2) y en la plataforma de distribución.

## Limitaciones y advertencias

- Sesgos conocidos: no hay información sobre sesgos en el dataset de entrenamiento, pero como modelo de imagen, puede reflejar sesgos visuales del dataset de Illustrious (por ejemplo, sobre-representación de ciertos estilos o rasgos).
- Riesgo de alucinación: en modelos de imagen, se puede generar atributos inconsistentes (por ejemplo, orejas o cola mal posicionadas) si el prompt es ambiguo o el modelo base no es suficientemente robusto.
- Limitaciones de contexto: al ser un modelo de imagen, no soporta texto ni contexto de texto; solo se usa con prompts de imagen.
- Restricciones de licencia: CreativeML OpenRAIL-M permite uso comercial, pero prohíbe usos perjudiciales (por ejemplo, generar contenido difamatorio o ilegal). Requiere atribución al autor si se redistribuye el modelo.
- Dependencia del modelo base: el LoRA no funciona sin un modelo base Illustrious o SDXL compatible. Si el modelo base se actualiza o cambia, el LoRA puede dejar de ser funcional.
- Calidad no documentada: no hay ejemplos generados ni métricas de evaluación en el repositorio; la calidad debe verificarse empíricamente antes de usarlo en producción.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/LarryAIDraw/Sigrid_ZZZ_v1
- Modelo en Civitai (V1): https://civitai.com/models/2807096/sigrid-de-lazur-zenless-zone-zero
- Modelo en Civitai (V2): https://civitai.red/models/2756937/sigrid-de-l-azur-or-zzz
- Modelo en PixAI (Sigrid de L'Azur): https://pixai.art/en/model/2025019600640349359
- Modelo en PixAI (Sigrid): https://pixai.art/en/model/2025059849313107972
- Modelo en TensorHub: https://tensorhub.art/models/1027068951533764874
