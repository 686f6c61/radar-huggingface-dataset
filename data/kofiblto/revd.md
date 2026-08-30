# KOFIblto/revd

## Resumen

El modelo `KOFIblto/revd` es un adaptador LoRA (Low-Rank Adaptation) de tipo DreamBooth para el modelo de generación de imágenes Krea 2. Desarrollado por el usuario KOFIblto (Mathias), este LoRA permite personalizar el modelo base Krea-2-Raw para generar imágenes del personaje ficticio «Reved» mediante el token de activación `Reved`. El adaptador se presenta como un archivo de pesos de aproximadamente 1,3 GB que se carga sobre el pipeline de Krea 2, tanto en su variante RAW como en la Turbo, esta última con solo 8 pasos de inferencia.

La relevancia de este modelo radica en su enfoque práctico: en lugar de reentrenar un modelo completo, un LoRA permite ajustar finamente la generación de imágenes a un concepto específico con un coste computacional reducido y manteniendo la calidad del modelo base. Aunque no se aportan detalles sobre el proceso de entrenamiento, la existencia de este adaptador demuestra la viabilidad de personalizar Krea 2 para casos de uso concretos, como la creación de personajes recurrentes en ilustración o diseño.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (Low-Rank Adaptation) sobre modelo base Krea-2-Raw |
| Parametros totales | no disponible (el repositorio ocupa 1,3 GB, pero no se indica el número de parámetros) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible (es un modelo text-to-image, no un LLM) |
| Tipos de cuantizacion | no disponible (el LoRA se distribuye en precisión nativa; el modelo base puede cuantizarse) |
| Idiomas soportados | no disponible (los prompts de ejemplo están en inglés, pero no se especifica la cobertura) |
| Licencia | Apache-2.0 |
| Formato de pesos | no disponible (se carga con `load_lora_weights` de Diffusers; probablemente safetensors, pero no se confirma) |

## Arquitectura y entrenamiento

El adaptador se basa en la técnica LoRA, que consiste en entrenar matrices de bajo rango que se suman a los pesos congelados del modelo base. En este caso, el modelo base es `krea/Krea-2-Raw`, un modelo de difusión de texto a imagen de la familia Krea 2. El LoRA fue entrenado mediante DreamBooth, un método que permite personalizar un modelo de difusión con un número reducido de imágenes de un sujeto o concepto específico, aquí el personaje «Reved». La model card indica que el entrenamiento se realizó sobre Krea 2 RAW y que las muestras se generaron con Krea 2 Turbo en 8 pasos, lo que sugiere que el adaptador es compatible con ambas variantes. No se proporcionan detalles sobre el número de imágenes de entrenamiento, el número de pasos de optimización ni la composición del dataset. Tampoco se menciona el uso de técnicas como RLHF o DPO, que son propias de modelos de lenguaje, no de difusión.

## Capacidades

- Generación de imágenes personalizadas del personaje «Reved» a partir de descripciones textuales en inglés.
- Compatibilidad con el pipeline de Diffusers (`Krea2Pipeline`) y carga directa mediante `load_lora_weights`.
- Funciona con Krea 2 Turbo, permitiendo inferencia rápida en 8 pasos con guidance scale 0.0.
- El token `Reved` actúa como desencadenante para invocar el concepto entrenado.
- No incluye capacidades de tool calling, agentes, razonamiento multi-paso ni procesamiento de audio o vídeo; es exclusivamente un adaptador de generación de imágenes.
- La personalización se limita al personaje concreto; no amplía el vocabulario general del modelo base.

## Casos de uso

- Ilustración de personajes ficticios: un artista puede usar el LoRA para generar múltiples variaciones de «Reved» en diferentes poses, atuendos o fondos, manteniendo la consistencia del diseño gracias al token de activación.
- Diseño de personajes para videojuegos o cómics: el adaptador permite iterar rápidamente sobre un personaje conceptual sin necesidad de redibujar manualmente, acelerando el proceso de preproducción.
- Generación de avatares personalizados: los usuarios pueden crear imágenes de perfil o representaciones digitales de un personaje propio, con control sobre atributos físicos mediante el prompt.
- Pruebas de vestuario y estilo: al combinar el LoRA con modificadores de texto (p. ej., «wavy wolf cut», «red underdye»), se pueden explorar variaciones de apariencia sin reentrenar.
- Contenido para redes sociales o marketing: un creador puede generar imágenes consistentes de un personaje para campañas o publicaciones, aprovechando la licencia Apache-2.0 para uso comercial.
- Investigación en personalización de modelos de difusión: el adaptador sirve como ejemplo de aplicación de DreamBooth-LoRA sobre Krea 2, útil para estudiar técnicas de fine-tuning eficiente en generación de imágenes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No hay métricas objetivas como FID, CLIP score o comparaciones cuantitativas con otros adaptadores. La única evidencia de rendimiento son las dos imágenes de muestra incluidas en la model card, que muestran al personaje en un entorno minimalista, pero sin datos numéricos.

## Requisitos de hardware

- El LoRA en sí es ligero (1,3 GB), pero requiere el modelo base Krea 2 para funcionar. El modelo base tiene un tamaño mayor y necesita una GPU con suficiente VRAM para inferencia.
- Para Krea 2 Turbo, que es una versión optimizada para menos pasos, se recomienda una GPU con al menos 8 GB de VRAM (p. ej., NVIDIA RTX 3060 o superior) para generar imágenes de resolución media (512×512 o similar). Para resoluciones mayores o uso con el modelo RAW, se recomienda 12-16 GB.
- Se puede usar con Diffusers en Python, cargando el pipeline y el LoRA en una GPU CUDA. También es posible usar el adaptador en plataformas que soporten Diffusers, como Google Colab (con GPU T4) o servicios en la nube.
- No se proporcionan datos de latencia ni throughput. En Krea 2 Turbo con 8 pasos, la generación suele completarse en unos pocos segundos en una GPU moderna, pero no hay cifras oficiales.
- Para despliegue en producción, se puede integrar en un servicio con FastAPI o usar herramientas como ComfyUI si se exporta el LoRA en formato adecuado, aunque no se indica compatibilidad explícita.

## Comparativa con modelos similares

No se dispone de información sobre adaptadores LoRA comparables para Krea 2 en el momento de redactar esta ficha. El ecosistema de LoRA para modelos de difusión es amplio (por ejemplo, para Stable Diffusion o Flux), pero no se conocen alternativas específicas para Krea 2 que permitan una comparación directa en parámetros, rendimiento o licencia. Por tanto, esta sección se considera no disponible.

## Limitaciones y advertencias

- El adaptador está entrenado exclusivamente para el personaje «Reved»; su uso fuera de este concepto puede producir resultados incoherentes o de baja calidad.
- Los prompts de ejemplo incluyen descripciones explícitas de ropa interior y poses sugerentes. Aunque la licencia Apache-2.0 permite uso comercial, el contenido generado puede no ser adecuado para todos los entornos o cumplir con políticas de plataformas.
- No se especifican sesgos conocidos, pero al ser un modelo de difusión entrenado en datos web, puede reflejar sesgos de género, etnia o apariencia presentes en el dataset original.
- Riesgo de alucinación visual: el modelo puede generar detalles no solicitados o distorsiones en rasgos faciales o corporales, especialmente en variaciones extremas del prompt.
- La compatibilidad con Krea 2 RAW y Turbo está documentada, pero no se garantiza su funcionamiento con futuras versiones del modelo base ni con otros pipelines distintos de Diffusers.
- No se aporta información sobre el proceso de entrenamiento (datos, hiperparámetros), lo que dificulta evaluar la robustez del adaptador frente a cambios en el prompt.
- La licencia Apache-2.0 cubre el código y los pesos del LoRA, pero el modelo base Krea 2 puede tener su propia licencia; el usuario debe verificar los términos de uso del modelo base antes de desplegar en producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/KOFIblto/revd
- Perfil del autor en Hugging Face: https://huggingface.co/KOFIblto
- Modelos del autor en Hugging Face: https://huggingface.co/KOFIblto/models
- Perfil de GitHub del autor: https://github.com/KOFiblto
