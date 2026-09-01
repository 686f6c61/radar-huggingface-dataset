# Quiho/GonzaLomo_Krea_2_v4.0_checkpoint

## Resumen

GonzaLomo Krea 2 v4.0 es un checkpoint de generación de imágenes basado en el modelo Krea 2 de Krea AI, ajustado por el usuario Quiho y distribuido a través de HuggingFace. Se trata de un fine-tune orientado a la producción de fotografía realista, con un enfoque marcado en retratos femeninos y estética "raw photo" (foto cruda, amateur). El modelo está etiquetado como "not-for-all-audiences" e incluye prompts de ejemplo con contenido explícito o semiexplícito, lo que indica que su uso principal es la generación de imágenes para adultos.

El checkpoint cuenta con aproximadamente 12.820 millones de parámetros (12,8B) y un tamaño de repositorio de 40 GB, lo que sugiere que se distribuye en formato de pesos completos (safetensors) y posiblemente también en GGUF, según las etiquetas. Fue creado en septiembre de 2026 y no presenta descargas ni valoraciones en HuggingFace, aunque el autor lo promociona en Civitai como el modelo insignia de generateporn.ai. Al ser un derivado de Krea 2, hereda la arquitectura de difusión de este modelo, aunque no se especifican detalles técnicos adicionales en la ficha.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo de difusion basado en Krea 2) |
| Parametros totales | 12.820.073.036 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de generacion de imagenes) |
| Tipos de cuantizacion | no disponible (etiqueta GGUF presente, sin detalle) |
| Idiomas soportados | no disponible (prompts de ejemplo en ingles) |
| Licencia | no disponible |
| Formato de pesos | safetensors (diffusers) y GGUF (segun etiquetas) |

## Arquitectura y entrenamiento

Krea 2 es un modelo de generacion de imagenes entrenado desde cero por Krea AI, con dos variantes principales: RAW y TURBO. La version RAW se centra en la fidelidad fotografica y el detalle, mientras que la TURBO optimiza la velocidad de inferencia. Este checkpoint concreto es un ajuste fino (fine-tune) de la variante base de Krea 2, realizado por el autor Quiho, con el objetivo de especializarlo en fotografia realista de retratos femeninos y estetica "amateur" o "raw". No se dispone de informacion sobre el dataset de entrenamiento, el numero de pasos, ni si se utilizaron tecnicas como RLHF o DPO. El modelo se distribuye a traves de la libreria diffusers, lo que indica compatibilidad con el ecosistema de HuggingFace para inferencia y entrenamiento.

## Capacidades

- Generacion de imagenes fotorrealistas, especialmente retratos femeninos con alto nivel de detalle en piel, iluminacion y textura.
- Soporte de estilos "raw photo", "amateur photo" y "analog photo", simulando fotografias tomadas con camaras de movil o camaras antiguas.
- Capacidad para interpretar prompts complejos con descripciones de vestimenta, entorno, iluminacion y expresiones faciales.
- No incluye capacidades de tool calling, agentes ni razonamiento multi-paso, al ser un modelo exclusivamente de generacion de imagenes.
- No se especifican capacidades multilingues; los prompts de ejemplo estan en ingles, por lo que se asume un funcionamiento optimo en ese idioma.
- El modelo esta disenado para contenido adulto (NSFW), con soporte para desnudos y escenas sugerentes, segun los ejemplos mostrados.

## Casos de uso

- Creacion de contenido artistico para adultos: el modelo puede generar imagenes eroticas o sugerentes con un alto grado de realismo, util para ilustradores, fotografo virtuales o plataformas de contenido para adultos.
- Produccion de imagenes para novelas visuales o juegos de rol: permite generar retratos de personajes femeninos con estetica realista, integrables en proyectos de ficcion interactiva.
- Generacion de material para campanas de marketing de productos de moda o lenceria: el estilo "raw photo" puede simular sesiones fotograficas espontaneas, utiles para pruebas de concepto o moodboards.
- Creacion de avatares o imagenes de perfil para redes sociales o foros, con un aspecto natural y menos "producido" que otros modelos.
- Desarrollo de datasets sinteticos para entrenar otros modelos de vision o generacion, aunque el contenido NSFW limita su uso a entornos controlados.
- Exploracion artistica y experimentacion fotografica: el modelo permite probar combinaciones de iluminacion, composicion y vestuario sin necesidad de una sesion fotografica real.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No existen datos sobre metricas como FID, CLIP score o comparaciones con otros modelos de generacion de imagenes en la ficha de HuggingFace ni en los resultados de busqueda web.

## Requisitos de hardware

- No se proporcionan requisitos oficiales de hardware en la informacion disponible.
- Dado el tamano del modelo (12,8B parametros) y el formato de pesos completos (40 GB), se estima que la inferencia en FP16 requiere al menos 24 GB de VRAM en una GPU de gama alta (por ejemplo, RTX 3090, RTX 4090, A100 o H100).
- Si se dispone de cuantizaciones GGUF, podria ejecutarse en GPUs con menor VRAM (por ejemplo, 12-16 GB) mediante herramientas como llama.cpp o Ollama, aunque no se confirma su disponibilidad.
- Para uso con diffusers, se recomienda una GPU con soporte CUDA y al menos 32 GB de RAM del sistema para cargar los pesos.
- El despliegue puede realizarse con librerias como diffusers, ComfyUI o Automatic1111 (si es compatible con Krea 2), o mediante servidores de inferencia como vLLM (si se adapta a un formato de transformer).

## Comparativa con modelos similares

No se dispone de informacion suficiente para realizar una comparativa con otros modelos de generacion de imagenes. El modelo es un fine-tune de Krea 2, pero no se conocen las especificaciones tecnicas de Krea 2 base (como arquitectura exacta, parametros, etc.) ni de otros checkpoints similares en el mismo nicho. Por tanto, la comparativa no esta disponible.

## Limitaciones y advertencias

- El modelo esta etiquetado como "not-for-all-audiences" y contiene contenido explicito; su uso debe restringirse a mayores de edad y a contextos legales y eticos apropiados.
- No se especifica la licencia, por lo que el uso comercial o la redistribucion pueden estar sujetos a restricciones no declaradas. Se recomienda contactar con el autor antes de cualquier uso productivo.
- Al ser un fine-tune especializado en retratos femeninos, puede presentar sesgos de genero y de apariencia fisica, limitando su versatilidad para otros tipos de sujetos o escenas.
- Existe riesgo de alucinaciones visuales (artefactos, deformidades anatomicas) en prompts complejos o poco comunes, especialmente en manos o rostros.
- No se garantiza la calidad de la generacion en idiomas distintos del ingles, ya que los prompts de ejemplo estan en ese idioma.
- El modelo no incluye mecanismos de seguridad o filtros de contenido; el usuario es responsable de cumplir con las normativas locales sobre material explicito.

## Enlaces

- [HuggingFace - GonzaLomo_Krea_2_v4.0_checkpoint](https://huggingface.co/Quiho/GonzaLomo_Krea_2_v4.0_checkpoint)
- [Civitai - GonzaLomo Krea 2 - v4.0](https://civitai.com/models/2761943/gonzalomo-krea-2)
- [GitHub - krea-ai/krea-2 (codigo oficial de inferencia)](https://github.com/krea-ai/krea-2)
- [HuggingFace - Krea-2-Turbo](https://huggingface.co/krea/Krea-2-Turbo)
- [HuggingFace - Comfy-Org/Krea-2](https://huggingface.co/Comfy-Org/Krea-2)
