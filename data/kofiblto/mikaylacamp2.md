# KOFIblto/mikaylacamp2

## Resumen

KOFIblto/mikaylacamp2 es un adaptador LoRA (Low-Rank Adaptation) de tipo DreamBooth para el modelo de generación de imágenes Krea 2, desarrollado por el usuario KOFIblto (Mathias). El adaptador está entrenado sobre el modelo base Krea-2-Raw y se muestra funcionando sobre Krea-2-Turbo, lo que permite generar imágenes de una persona concreta (Mikayla Campinos) mediante el token de activación "Mikayla Campinos". El repositorio tiene un tamaño de 1,2 GB y se distribuye bajo licencia Apache 2.0.

Este tipo de adaptadores resuelve el problema de la personalización de modelos de difusión: en lugar de reentrenar un modelo completo, se entrena un pequeño conjunto de pesos que se acoplan al modelo base para inyectar un concepto visual específico. La relevancia actual radica en la creciente demanda de herramientas de personalización eficientes y ligeras para modelos de texto a imagen, especialmente en entornos de producción donde se requiere control fino sobre el contenido generado.

La ficha se basa exclusivamente en la información publicada en HuggingFace y en los resultados de búsqueda disponibles. No se dispone de detalles técnicos adicionales sobre el entrenamiento, la arquitectura interna del adaptador o el modelo base más allá de lo indicado en la model card.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (adaptador de bajo rango) sobre modelo de difusión Krea 2 |
| Parametros totales | no disponible (el repositorio ocupa 1,2 GB, pero no se indica el número de parámetros del adaptador) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (modelo de generación de imágenes) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (los prompts se muestran en inglés, pero no se especifica soporte multilingüe) |
| Licencia | Apache 2.0 |
| Formato de pesos | no disponible (se carga mediante `diffusers`, probablemente safetensors, pero no se confirma) |

## Arquitectura y entrenamiento

El adaptador se presenta como un LoRA de DreamBooth para Krea 2, entrenado sobre el checkpoint Krea-2-Raw. DreamBooth es una técnica que fine-tunea un modelo de difusión para asociar un sujeto específico con un token único, mientras que LoRA reduce el coste de entrenamiento al modificar solo matrices de bajo rango en las capas de atención. El modelo base Krea 2 es un modelo de difusión de texto a imagen, aunque no se proporcionan detalles sobre su arquitectura interna (tipo de transformer, número de parámetros, etc.) en la información disponible.

El entrenamiento se realizó sobre el modelo RAW, y las muestras se generaron con Krea-2-Turbo, que es una variante optimizada para menos pasos de inferencia (8 pasos en los ejemplos). No se indica el número de imágenes de entrenamiento, la composición del dataset, ni si se aplicaron técnicas adicionales como RLHF o DPO. La model card solo menciona el prompt de instancia y el token de activación.

## Capacidades

- Generación de imágenes personalizadas: el adaptador permite generar imágenes de la persona "Mikayla Campinos" usando el token de activación en el prompt.
- Compatibilidad con Krea 2 Turbo: las muestras se generaron con 8 pasos de inferencia, lo que sugiere que el adaptador funciona eficientemente con el checkpoint Turbo.
- Integración con la librería `diffusers`: se proporciona un ejemplo de uso con `Krea2Pipeline` y `load_lora_weights`, lo que facilita su integración en pipelines existentes.
- Control de estilo y composición: al ser un LoRA, se puede combinar con otros adaptadores o ajustar el prompt para variar la pose, el fondo, la iluminación, etc., como se muestra en los ejemplos.
- No se indican capacidades adicionales como tool calling, agentes, razonamiento multimodal o soporte de audio/video.

## Casos de uso

- Creación de contenido artístico y conceptual: el adaptador permite generar ilustraciones de una persona específica en entornos variados, útil para artistas que trabajan con referencias visuales consistentes.
- Prototipado de campañas publicitarias: se pueden generar imágenes de un modelo o personaje ficticio para presentar ideas de campaña sin necesidad de sesiones fotográficas.
- Desarrollo de avatares para entornos virtuales: generar retratos de un personaje definido para videojuegos, mundos virtuales o aplicaciones de realidad aumentada.
- Generación de material educativo: crear imágenes de un personaje histórico o ficticio para materiales didácticos, siempre que se respeten los derechos de imagen.
- Pruebas de concepto en diseño de moda: combinar el token con descripciones de vestimenta (como en los ejemplos con ropa de Calvin Klein) para visualizar diseños sobre una figura concreta.
- Investigación en personalización de modelos de difusión: el adaptador sirve como caso de estudio para evaluar técnicas de DreamBooth-LoRA sobre Krea 2, comparando calidad y eficiencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No hay métricas objetivas como FID, CLIP score o comparaciones con otros adaptadores. La model card solo incluye dos imágenes de muestra generadas con Krea-2-Turbo en 8 pasos, sin métricas cuantitativas.

## Requisitos de hardware

- No se especifican requisitos de hardware en la model card. El adaptador en sí es ligero (1,2 GB), pero requiere el modelo base Krea 2 para funcionar, que es un modelo de difusión de gran tamaño.
- Para inferencia con Krea-2-Turbo, se necesita una GPU con suficiente VRAM para cargar el modelo base. Estimaciones típicas para modelos de difusión de ~2-3 mil millones de parámetros en bfloat16 rondan los 8-12 GB de VRAM, pero este dato no está confirmado.
- El ejemplo de uso en la model card emplea `torch.bfloat16` y `cuda`, lo que sugiere que se requiere una GPU NVIDIA con soporte para bfloat16 (a partir de la serie Ampere).
- Opciones de despliegue: se puede usar con la librería `diffusers` en Python, y potencialmente con otras herramientas que soporten LoRA, aunque no se mencionan vLLM, llama.cpp u Ollama (estas son para modelos de lenguaje, no de imágenes).
- No se proporcionan datos de latencia o throughput.

## Comparativa con modelos similares

No se dispone de información sobre adaptadores LoRA comparables para Krea 2 u otros modelos de difusión en la información proporcionada. No se puede establecer una comparativa objetiva sin datos adicionales.

## Limitaciones y advertencias

- El adaptador está entrenado para un único sujeto (Mikayla Campinos). Su uso para generar imágenes de otras personas o conceptos puede producir resultados inconsistentes o de baja calidad.
- Riesgo de uso indebido: la generación de imágenes de una persona real sin consentimiento puede violar derechos de imagen, privacidad y leyes de deepfakes. Es responsabilidad del usuario asegurarse de que el uso cumple con la normativa aplicable.
- Posibles sesgos y alucinaciones: como todo modelo de difusión, puede generar artefactos, distorsiones o variaciones no deseadas en la apariencia, especialmente en condiciones de iluminación o poses complejas.
- Limitaciones de contexto: al ser un modelo de imágenes, no soporta tareas de texto, razonamiento o código.
- La licencia Apache 2.0 permite uso comercial, pero no exime de responsabilidades legales sobre el contenido generado.
- No se dispone de información sobre la calidad del entrenamiento (número de imágenes, épocas, etc.), por lo que la robustez del adaptador en escenarios diversos no está garantizada.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/KOFIblto/mikaylacamp2
- Perfil del autor en HuggingFace: https://huggingface.co/KOFIblto
- Perfil del autor en GitHub: https://github.com/KOFiblto
- Repositorio de scripts del autor: https://github.com/KOFiblto/Scripts
