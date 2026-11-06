# launch-calcium/Mirian3_safety.copy.1

## Resumen
Mirian3_safety.copy.1 es un adaptador LoRA para generación de imágenes mediante texto (text-to-image), publicado en Hugging Face por el usuario launch-calcium. No se trata de un modelo completo, sino de un peso de adaptación entrenado sobre el modelo base Illustrious XL (OnomaAIResearch/Illustrious-xl-early-release-v0), una variante de Stable Diffusion XL orientada a la generación de ilustración de estilo anime.

El LoRA ha sido entrenado con AI Toolkit de Ostris, una herramienta popular para el entrenamiento de adaptadores LoRA sobre modelos de difusión. El repositorio ocupa aproximadamente 0,8 GB, lo que es coherente con un adaptador LoRA de tamaño grande o con varios checkpoints incluidos. La model card no documenta el propósito del entrenamiento, el dataset utilizado ni el número de pasos, y las imágenes de ejemplo sugieren que el modelo se ha especializado en personajes de estilo furry/anime.

La relevancia de esta ficha es principalmente de evaluación técnica: se trata de un modelo comunitario sin documentación, sin descargas registradas y con contenido de ejemplo sensible, por lo que conviene revisar sus limitaciones y advertencias antes de cualquier uso.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA sobre Stable Diffusion XL (pipeline text-to-image, diffusers) |
| Parametros totales | no disponible (tamaño del repo: 0,8 GB) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (usa el codificador de texto de SDXL, típicamente 77 tokens por pasada, pero no está documentado) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | CreativeML Open RAIL-M |
| Formato de pesos | Safetensors |

## Arquitectura y entrenamiento
El modelo es un adaptador LoRA (Low-Rank Adaptation) aplicado sobre Illustrious XL early release v0, un checkpoint de la familia Stable Diffusion XL desarrollado por OnomaAI Research y enfocado en ilustración de estilo anime. Los LoRA no modifican los pesos base: añaden matrices de bajo rango a las capas de atención del UNet (y opcionalmente del codificador de texto), lo que permite especializar el estilo o los conceptos que genera el modelo con un archivo de tamaño reducido respecto al checkpoint completo.

El entrenamiento se realizó con AI Toolkit de Ostris, una herramienta de línea de comandos para entrenar LoRAs sobre modelos de difusión. La model card no especifica el dataset de entrenamiento, el número de pasos, la resolución, el rank (dimensión de las matrices LoRA) ni la técnica empleada (por ejemplo, si se usó captioning con tags estilo Danbooru, habitual en la comunidad Illustrious). Las palabras de ejemplo del widget indican que se entrenó probablemente con captions en formato de tags tipo booru. No se ha publicado ningún paper ni detalles técnicos adicionales.

## Capacidades
- Generación de imágenes text-to-image en estilo anime/ilustración, heredada del modelo base Illustrious XL.
- Especialización en personajes de estilo furry/anime según las imágenes de ejemplo del widget (rasgos como cola, pelaje corporal, esclerótica coloreada).
- Compatibilidad con ComfyUI, AUTOMATIC1111, SD.Next e Invoke AI mediante pesos en formato safetensors.
- Carga directa en la librería diffusers de Hugging Face mediante `load_lora_weights`, con control de peso (weighting), fusión y mezcla de LoRAs.
- Sin palabras trigger definidas en la model card, por lo que la activación del estilo depende de los tags usados durante el entrenamiento.
- No es un modelo de lenguaje: no tiene capacidades de texto, razonamiento, código ni tool calling.

## Casos de uso
- Generación de ilustraciones de personajes estilo furry/anime: el LoRA puede aplicarse sobre Illustrious XL para producir personajes con rasgos furry consistentes (cola, pelaje, ojos de colores) a partir de prompts de tags tipo booru.
- Exploración de estilos en flujos de trabajo ComfyUI o AUTOMATIC1111: al ser un LoRA ligero, puede combinarse con otros adaptadores mediante mezcla de pesos para ajustar estilos sin cargar varios checkpoints completos.
- Prototipado rápido con diffusers: el snippet de la model card permite integrar el modelo en scripts de Python para generar lotes de imágenes de forma programada.
- Investigación sobre entrenamiento de LoRAs con AI Toolkit: el modelo puede servir como ejemplo de salida de esa herramienta, aunque la falta de documentación limita su valor didáctico.
- Creación de assets para juegos o novelas visuales de estilo anime, respetando los términos de la licencia CreativeML Open RAIL-M.
- Pruebas de compatibilidad entre adaptadores LoRA de la familia Illustrious/SDXL, ya que comparte arquitectura base con la mayoría de LoRAs de ese ecosistema.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la informacion disponible. Al tratarse de un modelo de difusión (LoRA) y no de un modelo de lenguaje, no aplica la evaluación típica con MMLU, HumanEval o GSM8K. Tampoco se han publicado métricas de calidad de imagen como FID o CLIP score.

## Requisitos de hardware
- VRAM estimada para inferencia: no disponible en la model card; al basarse en SDXL, la inferencia con el modelo base en float16 requiere típicamente 8-12 GB de VRAM, a la que se añade el coste marginal del LoRA (mínimo).
- GPU recomendadas: no disponible; para SDXL son habituales las RTX 3090/4090 en consumo, y A100/H100 en entornos de servidor.
- Consumer GPU: el LoRA en sí (0,8 GB) cabe en prácticamente cualquier GPU moderna; el requisito real lo impone el checkpoint base Illustrious XL (~6,9 GB en fp16).
- Opciones de despliegue: diffusers (código de ejemplo incluido en la model card), ComfyUI, AUTOMATIC1111, SD.Next e Invoke AI.
- Latencia y throughput: no disponible; dependen del modelo base, la resolución, el número de pasos del sampler y el hardware.

## Comparativa con modelos similares

| Modelo | Tipo | Base | Licencia | Documentacion |
|---|---|---|---|---|
| Mirian3_safety.copy.1 | LoRA | Illustrious XL | CreativeML Open RAIL-M | Muy escasa (sin dataset ni pasos) |
| LoRAs SDXL estandar de civitai/HF | LoRA | SDXL | Variable | Suele incluir triggers y ejemplos |
| Illustrious XL early release v0 | Checkpoint completo | SDXL | Fair AI Public License (base) | Model card publica del autor |
| Punamelon XL o LoRAs anime equivalentes | LoRA/Checkpoint | Illustrious/SDXL | Variable | Variable |

En resumen, frente a otras alternativas de la misma familia, este modelo se distingue negativamente por la ausencia de documentación, palabras trigger y métricas de calidad.

## Limitaciones y advertencias
- Documentación prácticamente inexistente: sin dataset, sin pasos de entrenamiento, sin rank LoRA y sin palabras trigger, lo que dificulta reproducir o evaluar el entrenamiento.
- Las imágenes de ejemplo del widget incluyen prompts con contenido de temática sexual sugerente (underwear, panties, skirt lift, clothes lift), por lo que el modelo puede estar orientado a generar contenido sensible; debe usarse con filtros y con especial precaución en entornos públicos o con menores.
- Cero descargas y un solo like en el momento de la ficha: no hay validación comunitaria de calidad ni de seguridad.
- Riesgo de heredar sesgos y estilos del modelo base Illustrious XL, entrenado sobre datos de ilustración anime de origen tipo Danbooru, con los sesgos de representación que eso implica.
- Alucinaciones no aplican como en modelos de lenguaje, pero la generación puede producir artefactos, anatomía incorrecta y falta de fidelidad al prompt, típico de LoRAs poco documentados.
- La licencia CreativeML Open RAIL-M permite uso comercial con ciertas restricciones de uso responsable, pero hay que verificar también la licencia del modelo base Illustrious XL, que puede imponer condiciones adicionales.
- El nombre del repositorio incluye ".copy.1", lo que sugiere una copia o iteración de otro modelo; conviene verificar la procedencia antes de usarlo en producción.

## Enlaces
- Modelo en Hugging Face: https://huggingface.co/launch-calcium/Mirian3_safety.copy.1
- Modelo base: https://huggingface.co/OnomaAIResearch/Illustrious-xl-early-release-v0
- AI Toolkit by Ostris (herramienta de entrenamiento): https://github.com/ostris/ai-toolkit
- Libreria diffusers: https://github.com/huggingface/diffusers
- Documentacion sobre carga de LoRAs en diffusers: https://huggingface.co/docs/diffusers/main/en/using-diffusers/loading_adapters
