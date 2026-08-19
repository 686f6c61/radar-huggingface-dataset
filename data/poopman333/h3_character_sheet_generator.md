# PoopMan333/H3_Character_Sheet_Generator

## Resumen

El modelo H3 Character Sheet Generator es un workflow de ComfyUI desarrollado por PoopMan333 que aprovecha el modelo de generación de vídeo MiniMax H3 para crear hojas de referencia de personaje (character sheets) con una consistencia visual alta. En lugar de generar varias imágenes por separado, el workflow genera un único vídeo con una rotación lenta de 360 grados y extrae 6 u 8 fotogramas que se componen en una lámina con vistas frontal, lateral, trasera y primeros planos. Esto garantiza que todas las vistas compartan la misma identidad visual, algo difícil de lograr con generación de imágenes independiente.

El workflow acepta hasta 9 imágenes de referencia, lo que permite combinar rasgos de distintas fuentes (una cara, una armadura, un sombrero) y mantenerlos coherentes en el resultado final. También incluye una variante para transformar personajes de estilo anime a realista y soporta objetos. El repositorio no contiene pesos de modelo, solo los archivos JSON del workflow y ejemplos; los modelos base necesarios se descargan automáticamente desde HuggingFace al abrir el workflow en ComfyUI.

La relevancia actual radica en que MiniMax H3 es uno de los primeros modelos de generación de vídeo con audio sincronizado y resolución nativa 2K, y su capacidad de referencia múltiple abre nuevas posibilidades para la creación de assets de personajes en pipelines de producción. El workflow simplifica el uso de esta capacidad para artistas y desarrolladores que necesitan hojas de referencia consistentes sin depender de herramientas propietarias.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Workflow de ComfyUI sobre MiniMax H3 (modelo de generación de vídeo) + text encoder Qwen3-VL-32B |
| Parametros totales | No disponible (el modelo base MiniMax H3 no publica el número exacto; el text encoder tiene 32B) |
| Parametros activos | No disponible (no es un modelo MoE) |
| Longitud de contexto | No disponible (modelo de vídeo, no de texto) |
| Tipos de cuantizacion | INT8 (versiones recomendadas para baja VRAM), también disponibles en BF16/FP16 para mayor precisión |
| Idiomas soportados | No disponible (el workflow usa prompts en inglés, pero el modelo base es multimodal) |
| Licencia | minimax-h3-community-license (ver enlace) |
| Formato de pesos | Safetensors (modelos base), JSON (workflow) |

## Arquitectura y entrenamiento

El workflow se apoya en MiniMax H3, un modelo de generación de vídeo desarrollado por MiniMax (Shanghai AI Lab) que produce vídeo nativo 2K con audio sincronizado en una sola pasada, con una duración máxima de 15 segundos. La arquitectura del modelo base no está detallada públicamente, pero se sabe que integra un text encoder multimodal (Qwen3-VL-32B) y un VAE de vídeo y otro de audio. El workflow no implica entrenamiento adicional; es una configuración de nodos que orquesta la generación de un vídeo de rotación lenta y la extracción de fotogramas.

El proceso funciona así: el usuario introduce hasta 9 imágenes de referencia y un prompt de texto (A Prompt) que describe qué elementos conservar de cada imagen y qué ignorar. Un segundo prompt (B Prompt) controla la rotación, la pose, la iluminación y el estilo. El modelo genera un vídeo de 124 fotogramas (en la versión de 6 paneles) con una cámara que orbita alrededor del personaje sin cortes. Después, el workflow selecciona 6 u 8 fotogramas y los compone en una hoja de referencia. La consistencia se logra porque todos los fotogramas provienen de la misma generación de vídeo, por lo que no hay deriva entre vistas.

## Capacidades

- Generación de hojas de personaje con vistas frontal, lateral, trasera y primeros planos (6 o 4 paneles según la versión).
- Consistencia de personaje garantizada por la generación de vídeo en una sola pasada.
- Acepta hasta 9 imágenes de referencia, combinando rasgos de distintas fuentes.
- Permite indicar por texto qué elementos conservar y cuáles ignorar de cada imagen.
- Soporta transformación de estilo anime a realista mediante un prompt B modificado.
- Generación de objetos con múltiples ángulos de referencia.
- Salidas opcionales: vídeo de rotación 360 y fotogramas individuales para uso posterior como referencias.
- Integración con ComfyUI, lo que permite modificar nodos y flujos fácilmente.

## Casos de uso

- Diseño de personajes para animación: un estudio puede generar una hoja de referencia completa de un personaje a partir de bocetos o imágenes de inspiración, y usarla como guía para animadores y modeladores 3D. El workflow garantiza que todas las vistas sean coherentes, reduciendo el trabajo de corrección manual.
- Concept art para videojuegos: los artistas pueden combinar referencias de armaduras, rostros y accesorios en una sola hoja, acelerando la exploración de diseños. La capacidad de generar objetos (escudos, armas) con múltiples ángulos facilita la creación de assets.
- Consistencia de personajes en cómics o novelas gráficas: un autor puede generar una hoja de referencia de un personaje y usarla como base para todas las ilustraciones posteriores, evitando variaciones de rasgos o vestuario entre páginas.
- Producción de vídeo con personajes generados por IA: el workflow permite crear personajes consistentes para vídeos generativos, y el vídeo de rotación 360 puede usarse directamente como material de referencia o como parte de una animación.
- Transformación de personajes anime a realistas: útil para adaptar diseños de anime a estilos fotorrealistas, manteniendo la identidad del personaje. El workflow incluye un prompt específico para esta tarea.
- Creación de bibliotecas de personajes para juegos de rol o mundos virtuales: un desarrollador puede generar hojas de referencia para múltiples personajes y usarlas como base para modelos 3D o texturas, garantizando uniformidad de estilo.
- Generación de referencias para impresión 3D: los fotogramas individuales pueden usarse como vistas de referencia para esculpir o modelar una figura física, ya que muestran el personaje desde todos los ángulos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor no reporta métricas cuantitativas de calidad ni comparaciones con otros métodos. La evaluación es subjetiva y se basa en ejemplos visuales incluidos en el repositorio.

## Requisitos de hardware

- No se especifican requisitos exactos en el modelo card, pero se recomiendan las versiones INT8 de los modelos para reducir el uso de VRAM.
- Basándose en modelos similares de generación de vídeo, se estima que se necesita una GPU con al menos 16 GB de VRAM para las versiones INT8 (por ejemplo, RTX 4080, RTX 4090, A100 40GB).
- Para las versiones de mayor precisión (BF16/FP16), se recomienda una GPU con 24 GB o más de VRAM.
- El workflow está diseñado para ComfyUI, por lo que se requiere una instalación funcional de ComfyUI con los nodos personalizados opcionales (KJNodes, rgthree) solo si se usa el grupo de Speed Ups.
- La generación de 124 fotogramas es computacionalmente intensiva; el autor advierte que es "lento". No se proporcionan cifras de latencia o throughput.
- Es posible ejecutar el workflow en GPUs de consumo (RTX 3090/4090) con las versiones INT8, pero se recomienda una GPU de estación de trabajo para tiempos de generación razonables.

## Comparativa con modelos similares

No hay una comparativa directa disponible, ya que el modelo es un workflow sobre MiniMax H3, y no un modelo independiente. Existen servicios web comerciales como CharacterGen, modelsheets.ai o LimeAILab que ofrecen generación de hojas de personaje, pero no son modelos open source ni comparables en términos de arquitectura. El workflow se diferencia por:

- Utilizar un modelo de vídeo (MiniMax H3) en lugar de generación de imágenes por lotes, lo que garantiza consistencia inherente.
- Ser completamente local y gratuito (bajo la licencia comunitaria de MiniMax), sin depender de APIs de pago.
- Permitir un control fino mediante prompts de texto y selección de elementos de referencia.

## Limitaciones y advertencias

- El proceso es lento: genera 124 fotogramas para obtener 6, lo que puede requerir varios minutos por hoja según el hardware.
- La consistencia del vestuario depende de describir la ropa en palabras; si solo se muestra una imagen, la ropa puede derivar entre vistas.
- Es necesario especificar explícitamente qué elementos ignorar de cada imagen de referencia; de lo contrario, fondos o accesorios no deseados pueden filtrarse.
- El modelo base MiniMax H3 tiene una licencia comunitaria que puede restringir el uso comercial; es necesario revisar los términos completos en el enlace de licencia.
- No se han publicado evaluaciones sistemáticas de sesgos o alucinaciones; como modelo de generación de vídeo, puede producir artefactos visuales o inconsistencias en detalles finos.
- El workflow depende de la disponibilidad de los modelos base en HuggingFace; si se eliminan, el workflow deja de funcionar.
- No se proporcionan métricas de rendimiento ni benchmarks, por lo que la calidad debe evaluarse empíricamente.

## Enlaces

- Repositorio de HuggingFace: https://huggingface.co/PoopMan333/H3_Character_Sheet_Generator
- Repositorio de MiniMax-H3 en GitHub: https://github.com/MiniMax-AI/MiniMax-H3
- Licencia del modelo base: https://huggingface.co/MiniMaxAI/MiniMax-H3/blob/main/LICENSE
- Página de MiniMax H3 en Civitai: https://civitai.com/models/2821932/minimax
- Workflow de ComfyUI (archivos JSON incluidos en el repositorio de HuggingFace)
