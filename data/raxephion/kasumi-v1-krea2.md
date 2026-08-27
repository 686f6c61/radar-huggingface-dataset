# Raxephion/Kasumi-V1-Krea2

## Resumen

Kasumi V1 es un LoRA (Low-Rank Adaptation) de personaje realista desarrollado por Raxephion para el modelo de difusión texto-imagen Krea 2. Está diseñado para reproducir la identidad visual de Kasumi, personaje de la saga *Dead or Alive*, con un enfoque fotorrealista y una gran versatilidad para colocarla en distintos atuendos, entornos, poses y estilos fotográficos. El objetivo declarado por el autor no es replicar un único atuendo o aspecto, sino mantener la consistencia del personaje mientras el resto de la imagen cambia.

El modelo se distribuye como un adaptador LoRA entrenado con DreamBooth sobre el checkpoint base `krea/Krea-2-Raw`, y se ha validado sobre Krea 2 Turbo con 8 pasos de inferencia. El repositorio ocupa 0,2 GB y se integra con la librería `diffusers`. La licencia declarada es Apache 2.0, aunque el modelo base Krea 2 puede tener términos adicionales. Es relevante ahora porque demuestra el flujo de trabajo de personalización de personajes sobre Krea 2, un modelo de generación de imágenes emergente, y ofrece una alternativa de código abierto para crear personajes consistentes sin reentrenar el modelo completo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (Low-Rank Adaptation) sobre modelo de difusion texto-imagen Krea 2 |
| Parametros totales | no disponible (el repositorio pesa 0,2 GB, correspondientes al adaptador) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (modelo de generacion de imagenes) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (los prompts de ejemplo estan en ingles) |
| Licencia | Apache 2.0 |
| Formato de pesos | no disponible (se integra con diffusers; probablemente safetensors, no confirmado) |

## Arquitectura y entrenamiento

Kasumi V1 es un LoRA, es decir, una adaptacion de bajo rango que se anade a los pesos de un modelo base preentrenado. En este caso, el modelo base es `krea/Krea-2-Raw`, un checkpoint de Krea 2, y el adaptador se entrena con la tecnica DreamBooth-LoRA, que combina la personalizacion de sujetos de DreamBooth con la eficiencia de parametros de LoRA. No se han publicado detalles sobre el numero de imagenes de entrenamiento, la composicion del dataset ni el proceso de curado. El autor indica que el adaptador se probo sobre Krea 2 Turbo con 8 pasos de inferencia, lo que sugiere que el entrenamiento se realizo teniendo en cuenta la compatibilidad con el modo Turbo del modelo base.

No se mencionan innovaciones tecnicas adicionales mas alla del uso estandar de DreamBooth-LoRA. El resultado es un adaptador ligero (0,2 GB) que modifica la salida del modelo base para generar un personaje especifico con consistencia de identidad, manteniendo la flexibilidad para variar el contexto visual.

## Capacidades

- Generacion de imagenes fotorrealistas del personaje Kasumi con rasgos consistentes: cabello castano rojizo largo en coleta alta, ojos avellana, proporcion corporal curvilinea y rasgos faciales reconocibles.
- Versatilidad para cambiar atuendos, entornos, poses y estilos fotograficos sin perder la identidad del personaje: desde artes marciales en un dojo hasta moda editorial en un hotel de lujo, pasando por escenarios callejeros o deserticos.
- Soporte de prompts en lenguaje natural mediante el desencadenante `kreakaz`, que activa la adaptacion. Se recomienda iniciar el prompt con una descripcion fija del personaje para maximizar la consistencia.
- Compatibilidad con el ecosistema Krea 2, incluyendo el modo Turbo para generacion rapida con pocos pasos (8 pasos en los ejemplos).
- No incluye capacidades de texto, tool calling, agentes ni razonamiento; es exclusivamente un modelo de generacion de imagenes.

## Casos de uso

- Creacion de contenido para fans y comunidades de videojuegos: el LoRA permite generar ilustraciones de Kasumi en escenarios variados (dojo, ciudad nocturna, playa) manteniendo su identidad, util para fan art, comics o contenido para redes sociales.
- Diseño de personajes para producciones audiovisuales: un director de arte puede usar el modelo para explorar rapidamente variaciones de vestuario, iluminacion y composicion de un personaje femenino realista sin necesidad de sesiones fotograficas.
- Ilustracion editorial y de moda: el adaptador puede generar imagenes de estilo fotografico editorial con el personaje en diferentes atuendos (vestido de noche, ropa deportiva, estilo casual), util para moodboards o propuestas de campaña.
- Prototipado de personajes para videojuegos: los desarrolladores independientes pueden generar conceptos de personajes femeninos realistas con consistencia facial, acelerando la fase de exploracion visual antes de la produccion final.
- Generacion de imagenes para narrativa visual: escritores o creadores de novelas visuales pueden ilustrar escenas de un personaje recurrente en distintos capitulos, manteniendo la coherencia visual a lo largo de la historia.
- Practica de fotografia conceptual: fotografos o estudiantes pueden usar el modelo para simular sesiones con una modelo virtual, experimentando con iluminacion, encuadres y estilos sin necesidad de una modelo real.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Al ser un LoRA de personaje, no se proporcionan metricas objetivas como FID, CLIP score o comparaciones con otros adaptadores. El autor solo muestra ejemplos visuales generados con Krea 2 Turbo a 8 pasos, sin datos cuantitativos de calidad o velocidad.

## Requisitos de hardware

- El adaptador LoRA en si es ligero (0,2 GB) y no requiere recursos significativos por separado.
- Los requisitos reales de hardware dependen del modelo base Krea 2, que no se especifican en la informacion disponible. Krea 2 es un modelo de difusion moderno; se estima que para inferencia local se necesitaria una GPU con al menos 8-12 GB de VRAM, pero este dato no esta confirmado.
- El despliegue se realiza mediante la libreria `diffusers`, que permite cargar el adaptador sobre el checkpoint base. No se mencionan opciones como vLLM, llama.cpp u Ollama, ya que son herramientas para modelos de lenguaje, no para difusion.
- No se proporcionan datos de latencia ni throughput. Los ejemplos del autor se generaron con 8 pasos en modo Turbo, lo que sugiere tiempos de inferencia relativamente bajos en hardware adecuado, pero sin cifras concretas.

## Comparativa con modelos similares

No se dispone de informacion sobre otros LoRAs de personajes para Krea 2 con los que comparar directamente. El autor ha publicado otros adaptadores para Krea 2 (Serendipity V1/V2, Solstice V1), pero son checkpoints completos fusionados con el modelo base, no LoRAs de personaje. No hay datos publicos de rendimiento relativo ni comparativas con alternativas como LoRAs de personajes para Stable Diffusion o SDXL. Por tanto, la comparativa no esta disponible.

## Limitaciones y advertencias

- El modelo esta entrenado para un personaje especifico (Kasumi) y no generaliza a otros personajes; su uso fuera de ese ambito puede producir resultados inconsistentes.
- Al ser un adaptador sobre Krea 2, la calidad final depende del modelo base. Si Krea 2 tiene limitaciones conocidas (por ejemplo, en la representacion de manos o texturas), estas se heredan.
- No se han documentado sesgos especificos, pero al tratarse de un personaje femenino con una corporalidad concreta, puede reforzar estereotipos de belleza si se usa de forma acritica.
- Riesgo de alucinacion visual: como cualquier modelo de difusion, puede generar artefactos o detalles anatomicos incorrectos en escenas complejas, especialmente con pocos pasos de inferencia.
- La licencia del adaptador es Apache 2.0, pero el modelo base Krea 2 puede tener su propia licencia con restricciones de uso comercial. Es responsabilidad del usuario verificar los terminos de `krea/Krea-2-Raw` antes de usar el modelo en produccion.
- No se especifican idiomas soportados; los prompts de ejemplo estan en ingles, por lo que el rendimiento con prompts en otros idiomas no esta garantizado.

## Enlaces

- Repositorio del modelo: https://huggingface.co/Raxephion/Kasumi-V1-Krea2
- Modelo base: https://huggingface.co/krea/Krea-2-Raw (referenciado en la model card)
- Otros modelos del autor en el ecosistema Krea 2:
  - https://huggingface.co/Raxephion/Krea2-Serendipity-V1
  - https://huggingface.co/Raxephion/Krea2-Serendipity-V2
  - https://huggingface.co/Raxephion/Krea2-Solstice-V1
