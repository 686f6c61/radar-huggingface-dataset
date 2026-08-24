# hodgy/luna-krea2-turbo-v1-lora

## Resumen

`hodgy/luna-krea2-turbo-v1-lora` es un adaptador LoRA (Low-Rank Adaptation) de rango 32 entrenado sobre el modelo base de difusión **Krea 2 Turbo**, desarrollado por el usuario `hodgy`. El objetivo del adaptador es capturar la identidad visual de un personaje concreto, **Luna**, una joven de pelo largo y rubio, para poder generarla de forma consistente en distintos prompts mediante la palabra disparadora `Luna`.

Se trata de un LoRA de personaje (character LoRA) de 0.2 GB en formato safetensors, entrenado con la herramienta `ai-toolkit` durante 3000 pasos (época 55). Es relevante porque permite personalizar el modelo Krea 2 Turbo sin reentrenar el modelo completo, añadiendo control de identidad a un generador de imágenes que ya destaca por su velocidad de inferencia. El repositorio incluye 10 muestras de resultados generados con el adaptador.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA sobre Krea 2 Turbo (modelo de difusión texto-imagen) |
| Parametros totales | no disponible (LoRA de rango 32, 512 tensores BF16) |
| Parametros activos | no disponible (adaptador LoRA, no modelo completo) |
| Longitud de contexto | no disponible (no aplica a generación de imagen) |
| Tipos de cuantizacion | no disponible (tensores BF16) |
| Idiomas soportados | no disponible |
| Licencia | `ai-toolkit-sdxl-v1` (licencia personalizada, `other`) |
| Formato de pesos | safetensors (`pt`) |

## Arquitectura y entrenamiento

El adaptador es un LoRA de rango 32 que modifica las capas de atención (`wq`, `wk`, `wv`, `wo`, `gate`) y las capas MLP (`down`, `up`, `gate`) de los bloques 0 a 27 del transformer del modelo base Krea 2 Turbo. El entrenamiento se realizó con la herramienta `ai-toolkit` versión `0.12.26`, durante 3000 pasos (época 55). No se proporcionan detalles sobre el dataset de entrenamiento, el número de imágenes utilizadas ni si se aplicaron técnicas de regularización o ajuste de fuerza del adaptador.

## Capacidades

- Generación de imágenes texto-a-imagen: permite generar retratos y escenas del personaje Luna con el prompt `luna, <prompt>`.
- Consistencia de personaje: al ser un LoRA de identidad, mantiene rasgos faciales y estilísticos del personaje en distintas generaciones.
- Compatible con el modelo base Krea 2 Turbo, que está optimizado para generación rápida (versión Turbo).
- No se documentan capacidades de tool calling, agentes, vision o audio: es un adaptador puro de difusión de imágenes.

## Casos de uso

- **Creación de contenido para narrativa visual**: un escritor o ilustrador puede generar múltiples ilustraciones del mismo personaje (Luna) para un cómic, novela visual o storyboard, manteniendo coherencia visual.
- **Prototipado de personajes para videojuegos**: los estudios independientes pueden usar el LoRA para iterar rápidamente sobre el diseño de un personaje femenino rubio sin reentrenar un modelo completo.
- **Generación de retratos para redes sociales o branding**: creadores de contenido pueden generar imágenes de un personaje ficticio con estética consistente para sus publicaciones.
- **Exploración de estilo con Krea 2 Turbo**: al combinarse con el modelo base Turbo, permite iterar en tiempo real sobre variaciones del personaje en distintos escenarios o poses.
- **Aprendizaje de personalización de modelos**: sirve como ejemplo práctico de cómo entrenar un LoRA de personaje con `ai-toolkit`, útil para desarrolladores que quieren replicar el proceso.
- **Producción de material para campañas publicitarias**: un personaje de marca ficticio puede generarse en diferentes contextos (producto, escenario) sin necesidad de sesiones fotográficas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No se incluyen métricas objetivas (FID, CLIP score, etc.) ni comparaciones con otros LoRAs de personaje.

## Requisitos de hardware

- Al ser un adaptador LoRA de 0.2 GB, el requisito principal es el del modelo base Krea 2 Turbo, que no se especifica en el repositorio.
- Para inferencia con Krea 2 Turbo se recomienda una GPU con al menos 8–12 GB de VRAM (p. ej., RTX 3060 o superior) para generación a resoluciones de hasta 2K, aunque el dato exacto no se proporciona.
- El LoRA se aplica sobre el modelo base, por lo que el despliegue requiere cargar Krea 2 Turbo en un framework compatible (ComfyUI, Diffusers, etc.).
- No se documentan opciones de despliegue específicas (vLLM, TGI, etc.) porque no es un modelo de lenguaje.

## Comparativa con modelos similares

No disponible. No se dispone de información sobre otros LoRAs de personaje para Krea 2 Turbo con los que comparar directamente, ni se conocen métricas de rendimiento relativas.

## Limitaciones y advertencias

- **Alcance limitado**: el adaptador solo captura la identidad del personaje Luna; no sirve para otros personajes sin reentrenamiento.
- **Dependencia del modelo base**: el resultado final depende de la calidad de Krea 2 Turbo y de la fuerza del LoRA (se recomienda entre 0.7 y 1.0).
- **Licencia restringida**: la licencia `ai-toolkit-sdxl-v1` es personalizada y no es una licencia open source estándar; debe revisarse antes de uso comercial.
- **Sin documentación de sesgos**: no se han evaluado sesgos de género, etnia o estilo en el modelo.
- **Riesgo de sobreajuste**: al estar entrenado solo 3000 pasos con un dataset no documentado, puede producir variaciones limitadas o artefactos en escenarios complejos.
- **Sin soporte de resolución explícito**: no se documenta la resolución máxima de generación con el LoRA aplicado.

## Enlaces

- [Hugging Face: hodgy/luna-krea2-turbo-v1-lora](https://huggingface.co/hodgy/luna-krea2-turbo-v1-lora)
- [Modelo base: krea/Krea-2-Turbo (Hugging Face)](https://huggingface.co/krea/Krea-2-Turbo)
- [Herramienta de entrenamiento: ai-toolkit (GitHub)](https://github.com/ostris/ai-toolkit)
- [Krea 2 Turbo LoRA 256dim - v1.0 (Civitai)](https://civitai.com/models/2727641/krea-2-turbo-lora-256dim)
- [Krea 2 Turbo Official Comfy-Org Checkpoints (Civitai)](https://civitai.com/models/2726029/krea-2-turbo-official-comfy-org-checkpoints-krea2)
