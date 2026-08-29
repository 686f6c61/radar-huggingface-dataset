# FIIS/tanalea

## Resumen

FIIS/tanalea es un adaptador LoRA (Low-Rank Adaptation) para el modelo de difusión de texto a imagen Krea 2, desarrollado por el usuario FIIS y publicado en Hugging Face bajo licencia Apache 2.0. El adaptador ha sido entrenado mediante la técnica DreamBooth sobre el modelo base Krea 2 RAW, con el objetivo de personalizar la generación de imágenes para un personaje concreto llamado «Tana Lea». El resultado se muestra sobre la variante Krea 2 Turbo, que permite generar imágenes en tan solo 8 pasos de inferencia.

Este tipo de adaptadores es relevante porque permite ajustar un modelo de difusión a un concepto específico sin necesidad de reentrenar todo el modelo, reduciendo costes computacionales y manteniendo la calidad del generador base. En este caso, el LoRA añade la capacidad de invocar al personaje «Tana Lea» mediante el token disparador del mismo nombre, manteniendo el resto de las capacidades del modelo base para producir escenas variadas (ciberpunk, pintura al óleo, fotografía macro, etc.). El repositorio tiene un tamaño de 0,8 GB, aunque no se especifican detalles sobre la arquitectura interna del adaptador ni sobre los parámetros del LoRA.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (Low-Rank Adaptation) sobre modelo de difusión Krea 2 (arquitectura interna no especificada) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (generación de imágenes) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (el modelo procesa prompts en inglés según los ejemplos, pero no se declara soporte multilingüe) |
| Licencia | Apache 2.0 |
| Formato de pesos | no disponible (se carga mediante la librería diffusers, presumiblemente safetensors) |

## Arquitectura y entrenamiento

El adaptador se presenta como un LoRA entrenado con DreamBooth sobre el modelo Krea 2 RAW. La técnica DreamBooth permite enseñar al modelo un concepto nuevo (en este caso, la identidad visual de «Tana Lea») mediante un pequeño conjunto de imágenes de referencia, ajustando los pesos del modelo base de forma eficiente mediante la factorización de bajo rango. No se proporcionan detalles sobre el número de imágenes de entrenamiento, el número de pasos, la tasa de aprendizaje ni la composición del dataset. Tampoco se indica si se utilizaron técnicas adicionales como RLHF o DPO, ya que no es un modelo de lenguaje sino de generación de imágenes.

El modelo base Krea 2 RAW es la variante sin refinar de Krea 2, mientras que los ejemplos mostrados en la model card se generaron con la versión Turbo, que reduce el número de pasos de inferencia a 8. El LoRA se carga sobre el pipeline `Krea2Pipeline` de diffusers, lo que sugiere compatibilidad con el ecosistema estándar de Hugging Face.

## Capacidades

- Generación de imágenes personalizadas del personaje «Tana Lea» utilizando el token disparador `Tana Lea` en el prompt.
- Compatibilidad con el modelo base Krea 2 en sus variantes RAW y Turbo, permitiendo diferentes estilos y niveles de detalle según el prompt.
- Capacidad de producir escenas variadas (cinemáticas, pictóricas, fotográficas, etc.) manteniendo la identidad del personaje gracias al ajuste LoRA.
- Integración sencilla con la librería diffusers mediante `load_lora_weights`, lo que facilita su uso en pipelines existentes.
- No incluye capacidades de tool calling, razonamiento multi-paso, agentes ni procesamiento de lenguaje natural; su función es exclusivamente la generación de imágenes.

## Casos de uso

- Creación de contenido para redes sociales: generar imágenes de un personaje ficticio consistente para publicaciones en Instagram, TikTok o campañas de influencers virtuales. El LoRA garantiza que el personaje mantenga su apariencia a lo largo de múltiples generaciones.
- Ilustración de narrativas visuales: artistas y guionistas pueden usar el modelo para producir viñetas de cómics o novelas gráficas donde el personaje «Tana Lea» aparece en distintos escenarios sin perder sus rasgos distintivos.
- Diseño de personajes para videojuegos: explorar variaciones de vestuario, entorno y atmósfera para un personaje concreto, acelerando la fase de concept art.
- Campañas de marketing con avatares digitales: empresas pueden crear imágenes promocionales de un personaje de marca en diferentes contextos, manteniendo una imagen coherente en todos los materiales.
- Arte conceptual para cine y animación: los equipos de preproducción pueden visualizar a un personaje en diferentes estilos (óleo, fotorrealismo, ciberpunk) para decidir la dirección artística.
- Personalización de avatares para aplicaciones de chat o realidad virtual: generar retratos personalizados de un usuario o personaje para usarlos como avatar en plataformas digitales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No se dispone de métricas comparativas como FID, CLIP score o evaluaciones humanas para este adaptador LoRA.

## Requisitos de hardware

- Al ser un LoRA, los requisitos de hardware dependen principalmente del modelo base Krea 2. No se especifican los requisitos de VRAM para Krea 2 en la documentación del adaptador.
- El adaptador añade una sobrecarga mínima en memoria y cómputo, ya que los pesos LoRA son de bajo rango.
- Se recomienda una GPU con al menos 8-16 GB de VRAM para ejecutar el modelo base en su versión Turbo, aunque este dato no está confirmado.
- El ejemplo de uso carga el pipeline en `cuda` con `torch.bfloat16`, lo que sugiere que se requiere una GPU compatible con bfloat16 (por ejemplo, RTX 30xx o superior, o GPUs de data center como A100).
- Opciones de despliegue: el adaptador se puede integrar en pipelines de diffusers, y podría utilizarse con servidores de inferencia como Hugging Face Inference Endpoints o soluciones personalizadas basadas en PyTorch. No se menciona compatibilidad con vLLM, llama.cpp u Ollama, ya que estos están orientados a modelos de lenguaje, no a difusión.

## Comparativa con modelos similares

No se dispone de información sobre adaptadores LoRA comparables en la misma categoría (personalización de personajes para Krea 2). No se han encontrado modelos similares en los resultados de búsqueda, por lo que la comparativa no está disponible.

## Limitaciones y advertencias

- El adaptador está entrenado exclusivamente para el concepto «Tana Lea»; no generaliza a otros personajes o identidades.
- Se requiere el token exacto `Tana Lea` en el prompt para activar el concepto; de lo contrario, el modelo se comportará como el modelo base sin el ajuste.
- No se han documentado sesgos específicos, pero al ser un modelo de generación de imágenes, puede reflejar los sesgos presentes en los datos de entrenamiento del modelo base Krea 2.
- Existe riesgo de sobreajuste: el personaje puede aparecer con variaciones limitadas si el dataset de entrenamiento del LoRA fue pequeño o poco diverso.
- La licencia Apache 2.0 permite uso comercial, pero se debe cumplir con los términos del modelo base Krea 2, cuya licencia no se detalla en la documentación del adaptador.
- No se proporcionan garantías sobre la calidad de las imágenes en dominios fuera de los ejemplos mostrados; se recomienda probar antes de usar en producción.

## Enlaces

- Repositorio del modelo: https://huggingface.co/FIIS/tanalea
- Modelo base Krea 2 RAW: https://huggingface.co/krea/Krea-2-Raw
