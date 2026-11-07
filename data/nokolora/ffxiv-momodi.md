# nokolora/ffxiv-momodi

## Resumen

ffxiv-momodi es una colección de adaptadores LoRA para generación de imágenes texto-a-imagen, desarrollada por el usuario nokolora (Atsushi Tanaka) y publicada en Hugging Face. Su objetivo es reproducir el personaje Momodi Modi, un PNJ lalafell del videojuego Final Fantasy XIV, en ilustraciones generadas por IA. El repositorio contiene tres variantes: `ff14-momodi-default` (atuendo habitual), `ff14-momodi-face` (centrada en rasgos faciales) y `ff14-momodi-summer` (traje del evento Moonfire Faire de 2026).

El modelo se distribuye como LoRA compatible con la librería diffusers y está entrenado sobre el checkpoint `circlestone-labs/Anima`, una evolución de Illustrious-XL. No se trata de un modelo de lenguaje ni de un transformer de texto: es un adaptador de bajo rango pensado para inyectarse en un modelo base de difusión de la familia SDXL/Illustrious. El repositorio ocupa 0,3 GB y los pesos se distribuyen en formato safetensors.

Su relevancia es acotada pero clara: demuestra el flujo de trabajo típico de fine-tuning de personajes concretos con LoRA en modelos de difusión modernos, e incluye documentación explícita sobre las dificultades del entrenamiento (asimetría de adornos, trenzas, colores de ropa), lo que resulta útil como referencia práctica para quien aborde tareas similares.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (adaptador de bajo rango) sobre modelo de difusión texto-a-imagen de la familia SDXL/Illustrious |
| Parametros totales | no disponible (adaptador LoRA; el modelo base no se distribuye en este repo) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (no aplica a difusión) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (los prompts de ejemplo están en inglés) |
| Licencia | CC0-1.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El adaptador se entrena sobre `circlestone-labs/Anima`, un checkpoint de difusión de la familia Illustrious-XL (SDXL). La técnica empleada es LoRA, que congela los pesos del modelo base e introduce matrices de bajo rango en las capas de atención y proyección, reduciendo drásticamente el coste de fine-tuning. El repositorio incluye tres adaptadores independientes entrenados con conjuntos de imágenes distintos según la variante (atuendo por defecto, rostro y traje de verano).

No se especifican en la información disponible el número de imágenes de entrenamiento, el número de pasos, la tasa de aprendizaje ni la composición exacta del dataset. La model card sí documenta de forma explícita las dificultades observadas durante el entrenamiento: los adornos del pelo se dibujan con frecuencia en el lado incorrecto (el autor sugiere rellenar manualmente la zona con marrón e inpaintar), las trenzas se renderizan mal y la asimetría del personaje es un problema recurrente. También se indica que los colores y patrones de la ropa no se reproducen de forma estable. El prompt de instancia es `momodi modi` y existe además un trigger corto `ffxivmomodi`.

## Capacidades

- Generación texto-a-imagen de un personaje concreto (Momodi Modi) a partir de prompts descriptivos en inglés.
- Tres variantes de especialización: atuendo por defecto, rostro y traje de verano.
- Control de estilo mediante modificadores en el prompt, por ejemplo `(realistic:0.25)` en positivo o negativo.
- Soporte de negative prompts para corregir artefactos típicos (mangas negras, cinturones, bolsillos).
- Compatibilidad con flujos de inpainting para corregir manualmente zonas problemáticas (adornos, trenzas).
- Integración con la librería diffusers y con el ecosistema de checkpoints de la familia Illustrious-XL.
- No soporta tool calling, agentes, razonamiento multi-paso ni capacidades multimodales de entrada.

## Casos de uso

- Generación de fan art de Final Fantasy XIV: el adaptador produce ilustraciones de Momodi Modi con su atuendo característico, útil para la comunidad del juego que quiera material gráfico coherente con el personaje.
- Creación de variaciones de vestuario: la variante `summer` demuestra cómo un mismo personaje puede adaptarse a atuendos nuevos manteniendo el parecido facial, útil para eventos estacionales o contenido temático.
- Retratos de personaje para ficción derivada: la variante `face` permite generar primeros planos centrados en los rasgos faciales, adecuada para avatares o ilustraciones de perfil.
- Referencia para artistas que necesiten composiciones base: las imágenes generadas pueden servir como punto de partida para retoque manual posterior (el autor recomienda explícitamente el inpainting para corregir adornos).
- Estudio de caso de fine-tuning LoRA: el repositorio documenta las limitaciones del entrenamiento de personajes asimétricos, lo que lo convierte en material didáctico para quien entrene adaptadores similares.
- Publicación en comunidades de ilustración: el autor permite publicar las imágenes en redes sociales y comunidades de arte, con la condición de etiquetar contenido R-18 y generado por IA.
- Integración en pipelines de generación por lotes: al ser un LoRA compatible con diffusers, puede cargarse junto al checkpoint base en scripts de generación automatizada para producir conjuntos de imágenes de un personaje.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- El adaptador LoRA en sí ocupa 0,3 GB, por lo que la VRAM necesaria viene determinada por el modelo base (`circlestone-labs/Anima`, familia SDXL).
- Para SDXL/Illustrious en precisión fp16 se recomienda un mínimo de 8-10 GB de VRAM; con cuantización adicional puede reducirse, aunque no se especifican tipos de cuantización en la información disponible.
- GPU consumer compatibles: RTX 3060 12 GB, RTX 4070, RTX 4080, RTX 4090. En GPUs con 6-8 GB puede requerirse offloading o cuantización del modelo base.
- GPU de datacenter: A100, H100 y similares para generación por lotes a mayor throughput.
- Opciones de despliegue: diffusers (librería oficial del repo), ComfyUI y Automatic1111/Forge mediante carga de LoRA sobre el checkpoint base. No se confirma compatibilidad con vLLM, llama.cpp ni Ollama, que no aplican a modelos de difusión.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Tipo | Modelo base | Variantes | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| nokolora/ffxiv-momodi | LoRA de personaje | circlestone-labs/Anima (Illustrious-XL) | 3 (default, face, summer) | CC0-1.0 | Hugging Face, espejo en PixAI |
| LoRA de personaje típico en Civitai | LoRA de personaje | SDXL / Illustrious / Pony | variable | variable según autor | Civitai, Hugging Face |
| Checkpoint completo de personaje | Modelo completo | SDXL | no aplica | variable | Civitai, Hugging Face |

No se dispone de datos de benchmarks ni de comparativas cuantitativas con otros LoRA de personaje en la información proporcionada.

## Limitaciones y advertencias

- Los adornos del pelo se generan con frecuencia en el lado incorrecto; el autor recomienda corregirlo manualmente con inpainting.
- Las trenzas y los elementos asimétricos se renderizan de forma inestable.
- Los colores y patrones de la ropa no se reproducen de forma fiable; el autor sugiere asumir esta limitación.
- El adaptador depende del checkpoint base `circlestone-labs/Anima`; usar otro checkpoint de la familia puede degradar el resultado.
- Los prompts de ejemplo están en inglés y no se documenta soporte multilingüe.
- La licencia CC0-1.0 permite uso amplio, pero el autor solicita que el uso se limite a fan art de Final Fantasy XIV y que el contenido R-18 y generado por IA se etiquete adecuadamente.
- Riesgo de alucinación visual: el modelo puede inventar detalles del personaje no presentes en el material de referencia.
- No es un modelo de lenguaje: no soporta texto, razonamiento, código ni tool calling.

## Enlaces

- Hugging Face: https://huggingface.co/nokolora/ffxiv-momodi
- Archivos del modelo: https://huggingface.co/nokolora/ffxiv-momodi/tree/main
- Perfil del autor: https://huggingface.co/nokolora
- Modelo base: https://huggingface.co/circlestone-labs/Anima
- Imagen de muestra en PixAI: https://pixai.art/ja/artwork/1938472749677172143-LoRA
- Ko-fi del autor: https://ko-fi.com/nokolora
