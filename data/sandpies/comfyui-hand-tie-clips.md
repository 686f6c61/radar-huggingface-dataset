# sandpies/ComfyUI-Hand-Tie-Clips

## Resumen

Hand Tie Clips (anteriormente ComfyUI-H3-Ref-Chain) es un paquete de nodos personalizados para ComfyUI, desarrollado por el usuario sandpies. No se trata de un modelo de IA en sí, sino de una herramienta de orquestación que facilita la generación de vídeos mediante el modelo MiniMax H3 Reference-to-Video. El paquete permite planificar tomas, gestionar imágenes de referencia, encadenar múltiples segmentos de vídeo con continuidad y optimizar el flujo de trabajo en ComfyUI.

Su relevancia radica en que simplifica un proceso complejo: la creación de vídeos coherentes y de larga duración a partir de referencias visuales y un guion estructurado. Incluye un editor visual, caché por segmento, y compatibilidad con el paquete opcional ComfyUI-H3-Motion-Context para mejorar la continuidad entre tomas. Está diseñado para usuarios de ComfyUI que ya trabajan con checkpoints ref2va de MiniMax H3.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Paquete de nodos para ComfyUI (no es un modelo de IA) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (interfaz en ingles, prompts en cualquier idioma que soporte MiniMax H3) |
| Licencia | no disponible |
| Formato de pesos | Codigo Python (nodos personalizados) |

## Arquitectura y entrenamiento

Este paquete no es un modelo entrenado, sino una coleccion de nodos de ComfyUI escritos en Python. Su funcion es orquestar el modelo MiniMax H3 Reference-to-Video, que es un modelo de generacion de video por difusion. El paquete gestiona la entrada de un plan de tomas en JSON, imagenes de referencia, y la generacion secuencial de segmentos de video (hops). Cada hop utiliza el modelo MiniMax H3 con la guia de referencia, y los hops posteriores pueden usar el latente AV del hop anterior mediante el paquete opcional ComfyUI-H3-Motion-Context para mantener coherencia temporal.

No se dispone de informacion sobre el entrenamiento del modelo subyacente, ya que el paquete solo actua como interfaz. El codigo del paquete no incluye pesos ni datos de entrenamiento.

## Capacidades

- Generacion de video por segmentos (hops) con MiniMax H3 Reference-to-Video.
- Planificacion de tomas mediante un `shot_plan` en JSON, donde cada toma corresponde a un hop.
- Gestion de imagenes de referencia con etiquetas estables (`@tags`) agrupadas por sujetos.
- Directivas por toma (union, camara, encuadre, ritmo, cola) compiladas en prosa para el prompt.
- Caché por hop (lossless) que permite re-generar un solo segmento sin re-renderizar todo el clip.
- Editor visual en el nodo con tarjetas y plantillas, en lugar de JSON en un textarea.
- Modo simple que mantiene el flujo de trabajo de un solo prompt.
- Compatibilidad con el paquete ComfyUI-H3-Motion-Context para guiar hops posteriores con el latente AV del hop anterior.
- Fallback a `MiniMaxH3AddGuide` estandar si Motion-Context no esta instalado.
- Soporte de voz como referencia en cada hop.
- Alias de nodos antiguos para compatibilidad con workflows preexistentes.

## Casos de uso

- Produccion de video publicitario: un equipo creativo puede escribir un plan de tomas en JSON, subir imagenes de referencia del producto y generar un video de varios segmentos con coherencia visual, sin necesidad de editar manualmente cada transicion.
- Creacion de contenido para redes sociales: un creador puede generar clips de 5 segundos encadenados para formar un video mas largo, usando la funcion de cache para re-roll de un solo segmento sin re-renderizar todo.
- Prototipado rapido de storyboards: un director puede convertir un storyboard en imagenes a un video animado preliminar, usando las directivas de camara y encuadre para controlar la narrativa visual.
- Generacion de video con continuidad de personaje: al mantener la voz como referencia y las imagenes de identidad en el primer hop, se puede producir un video donde un personaje aparece de forma consistente a lo largo de varios segmentos.
- Automatizacion de pipelines de video en ComfyUI: integrado en un flujo de trabajo existente con LoRAs, ajustes de atencion y low-VRAM, permite generar videos de forma reproducible y con control fino.
- Educacion y tutoriales: un instructor puede crear videos explicativos con transiciones suaves entre tomas, usando el editor visual para ajustar directivas sin tocar JSON.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El rendimiento depende del modelo MiniMax H3 subyacente y del hardware utilizado, no del paquete en si.

## Requisitos de hardware

- No hay requisitos especificos para el paquete, ya que no contiene modelos ni pesos.
- Los requisitos reales vienen del modelo MiniMax H3 y de ComfyUI. Se recomienda una GPU con al menos 16 GB de VRAM para inferencia de video, aunque el paquete incluye un nodo "MiniMax H3 Low VRAM" para reducir el consumo.
- El paquete se ejecuta como nodos de ComfyUI, por lo que requiere una instalacion funcional de ComfyUI con los componentes de MiniMax H3 (checkpoint ref2va, VAE de video y audio, text encoder).
- Para usar `cache_hops` con ffmpeg, se necesita ffmpeg en el PATH del sistema.
- Opciones de despliegue: se integra en ComfyUI, que puede ejecutarse en una maquina local o en un servidor con GPU. No se proporcionan datos de latencia o throughput.

## Comparativa con modelos similares

No disponible. No se han encontrado paquetes de nodos comparables en la informacion proporcionada. El paquete es especifico para MiniMax H3 y no existe una alternativa directa documentada.

## Limitaciones y advertencias

- Depende completamente del modelo MiniMax H3 y de sus requisitos de licencia y hardware. El paquete no incluye el modelo.
- Requiere un checkpoint ref2va (o hybrid ref2va); los checkpoints fl2va no son compatibles.
- La calidad del video resultante depende de la calidad de las imagenes de referencia y del plan de tomas.
- El paquete no es un "seamless-chain pack": no incluye script de airlock ni Motion-Context por defecto, por lo que las uniones entre hops pueden mostrar costuras visibles.
- La licencia del paquete no esta especificada, por lo que se desconoce si permite uso comercial.
- El paquete esta en una fase temprana (descargas 0, likes 0) y podria tener errores no documentados.
- La interfaz del editor se sirve desde una extension de navegador; un cache desactualizado puede impedir que la UI se monte correctamente.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/sandpies/ComfyUI-Hand-Tie-Clips
- Repositorio en GitHub (espejo): https://github.com/dntpi/ComfyUI-Hand-Tie-Clips
- Paquete opcional ComfyUI-H3-Motion-Context: https://github.com/NikoDemon80/ComfyUI-H3-Motion-Context
- Guia de autor (PROMPTING.md): mencionada en la model card, no se proporciona URL directa.
