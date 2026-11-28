# E10Null/eyeline-pov-geometry-zimage

## Resumen

Eyeline POV Geometry LoRA es un adaptador de bajo rango (LoRA) para los modelos de generación de imágenes Z-Image Base y Z-Image Turbo de Tongyi-MAI (Alibaba). Lo desarrolla el usuario E10Null y su objetivo es mejorar el encuadre en primera persona (POV), la propiedad de las manos en escena, las interacciones con objetos (hover frente a grip), los intercambios de objetos entre personas y la perspectiva de puertas vistas desde dentro o desde fuera. El adaptador se publica como un único fichero `eyeline-pov-blocks0-11-r16.safetensors` de 8,5 MB con rango 16.

La innovación principal es que solo entrena los bloques tempranos del transformer (bloques 0 a 11) y deja intactos los bloques tardíos (12 a 29), que son los responsables de la textura de piel, el detalle fino y la nitidez. De este modo, el LoRA modifica la composición y la geometría de la escena sin degradar la calidad fotográfica nativa del modelo base, y puede apilarse limpiamente con otros LoRAs de estilo, grano de película o detalle de piel en ComfyUI.

El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, el tamaño del repo es de 0,0 GB (los pesos no parecen estar subidos o el tamaño reportado no los refleja) y la licencia declarada es Apache 2.0. Es relevante para creadores que trabajan con prompts de primera persona y necesitan coherencia espacial en manos, objetos y encuadres, un punto históricamente débil en los modelos text-to-image.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (adaptador de bajo rango) sobre transformer de difusion Z-Image |
| Parametros totales | no disponible (fichero de 8,5 MB, rango 16) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo text-to-image) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (prompts en ingles en los ejemplos) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |
| Modelo base | Tongyi-MAI/Z-Image-Turbo y Tongyi-MAI/Z-Image |
| Rango del LoRA | 16 |
| Bloques entrenados | 0 a 11 (de 0 a 29) |
| Resolucion de entrenamiento | 896x1152 |
| Timesteps de entrenamiento | t en [0,50, 0,98] (alta relacion de ruido) |

## Arquitectura y entrenamiento

El adaptador es un LoRA de rango 16 que se aplica sobre el transformer de difusion de Z-Image. El autor indica que solo se entrenaron los bloques 0 a 11, congelando por completo los bloques 12 a 29. El entrenamiento se realizo a resolucion nativa de 896x1152 y se concentro en timesteps de alto ruido (t entre 0,50 y 0,98), que son los que gobiernan la estructura global de la imagen: perspectiva de camara, colocacion de la mano en primer plano y composicion espacial. Al no tocar los bloques tardios, se preservan la textura de piel, el detalle fino y la nitidez nativos del modelo base.

No se especifica en la informacion disponible el numero de imagenes de entrenamiento, la composicion del dataset ni si se emplearon tecnicas de RLHF o preferencias. Tampoco se detalla el optimizador, la tasa de aprendizaje ni el numero de pasos. La innovacion tecnica destacable es precisamente el entrenamiento selectivo por bloques, que permite apilar el LoRA con otros adaptadores de estilo sin conflictos, ya que los bloques de textura y estilo quedan intactos.

## Capacidades

- Generacion de imagenes text-to-image en primera persona (POV) con encuadre coherente.
- Mejora de la propiedad de las manos: colocacion correcta de la mano en primer plano y coherencia anatomica en la escena.
- Distincion entre hover (objeto flotando cerca de la mano) y grip (objeto agarrado), con interacciones mas realistas.
- Escenas de handoff: intercambio de objetos entre dos personas, con la mano del sujeto POV extendiendo o recibiendo el objeto.
- Perspectiva de puertas: diferenciacion entre estar dentro o fuera de una puerta.
- Compatible con Z-Image Base y Z-Image Turbo, tanto en BF16 como en los flujos de ComfyUI.
- No requiere trigger word: funciona con prompts que empiecen por "First-person POV...".
- Apilable con LoRAs de estilo, grano de pelicula o detalle de piel sin degradar la textura.
- No se documentan capacidades de vision, audio, tool calling ni agentes, al ser un modelo de generacion de imagenes.

## Casos de uso

- Fotografia de producto en primera persona: generar imagenes de un consumidor sosteniendo o examinando un producto (una taza, un reloj, una planta) con la mano correctamente colocada y el objeto en el angulo adecuado, gracias al control de hover y grip.
- Escenas de hosteleria y retail: crear imagenes de un camarero sirviendo un cafe o un dependiente entregando un disco de vinilo, usando la capacidad de handoff para que la mano del sujeto POV extienda o reciba el objeto de forma creible.
- Contenido inmobiliario y arquitectonico: generar vistas de interiores desde el punto de vista de quien entra por una puerta, aprovechando la mejora de perspectiva inside-vs-outside para mostrar el umbral y la transicion de espacio.
- Ilustracion para narrativa interactiva o videojuegos en primera persona: producir fondos y escenas POV consistentes con la camara a la altura de los ojos, utiles para prototipos de aventuras graficas o novelas visuales.
- Marketing de experiencias: imagenes de un usuario sosteniendo una entrada, un mapa o un objeto conmemorativo en un entorno tematico (concierto, museo, parque), con la mano en primer plano y el objeto claramente identificable.
- Pruebas de concepto de estilo fotografico: al apilarse con LoRAs de grano o de piel, sirve para generar series de imagenes POV con una estetica fotografica concreta sin perder la geometria de manos y objetos.
- Generacion de material para redes sociales o blogs de viajes: escenas de "lo que veo" en un mercado, una cocina o una tienda, con encuadre natural de primera persona.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explicita; al ser un LoRA de 8,5 MB, el requisito viene determinado por el modelo base Z-Image (Base o Turbo) en BF16, no por el adaptador.
- GPU recomendadas: no disponibles en la informacion proporcionada; el autor solo documenta el flujo en ComfyUI con pesos BF16.
- Compatibilidad con GPU de consumo: no confirmada en la informacion disponible.
- Despliegue: ComfyUI, cargando el fichero en `ComfyUI/models/loras/` con un nodo `LoraLoaderModelOnly` o `LoraLoader` sobre `z_image_turbo_bf16.safetensors` o `z_image_bf16.safetensors`.
- Ajustes de muestreo recomendados por el autor:
  - Z-Image Turbo BF16: 896x1152, 8 pasos, CFG 1.0, sampler euler, scheduler beta, ModelSamplingAuraFlow shift 3.0.
  - Z-Image Base BF16: 896x1152, 25 pasos, CFG 4.0, sampler res_multistep, scheduler simple, ModelSamplingAuraFlow shift 3.0.
- Fuerza recomendada del LoRA: 0,8 a 1,0 para prompts POV; 0,0 o bypass para prompts que no sean POV.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de datos de rendimiento ni de especificaciones de adaptadores comparables en la informacion proporcionada. La comparacion se limita a caracteristicas estructurales frente a otros enfoques de LoRA para Z-Image, sin cifras de calidad.

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Eyeline POV Geometry LoRA | LoRA r16, bloques 0-11 | 8,5 MB (rango 16) | no aplica | Apache 2.0 | Hugging Face |
| LoRA completo sobre Z-Image | LoRA sobre todos los bloques | no disponible | no aplica | no disponible | no disponible |
| Adaptadores de estilo para Z-Image | LoRA de estilo/textura | no disponible | no aplica | no disponible | no disponible |

## Limitaciones y advertencias

- El repositorio registra 0 descargas y 0 likes, y el tamano reportado es de 0,0 GB, lo que sugiere que los pesos pueden no estar efectivamente subidos o que el tamano no se refleja correctamente; conviene verificar la disponibilidad del fichero antes de integrarlo.
- El LoRA esta disenado exclusivamente para Z-Image Base y Z-Image Turbo; no es portable a otras arquitecturas sin reentrenamiento.
- Solo se entrenaron los bloques 0 a 11, por lo que no corrige problemas de textura o detalle que dependan de los bloques tardios.
- La informacion sobre sesgos, riesgo de alucinacion visual y limitaciones de idioma no esta disponible; al ser un modelo de imagen, los sesgos del modelo base Z-Image se heredan.
- No se documenta soporte multilingue en los prompts; los ejemplos estan en ingles.
- La licencia Apache 2.0 permite uso comercial, pero el modelo base Z-Image tiene su propia licencia que debe verificarse por separado.
- No hay resultados de benchmarks ni evaluaciones cuantitativas que respalden las mejoras declaradas; las afirmaciones del autor se basan en demos cualitativas.
- El ajuste de fuerza del LoRA es critico: valores fuera del rango 0,8-1,0 para POV o su uso en prompts no POV pueden degradar la imagen.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/E10Null/eyeline-pov-geometry-zimage
- Modelo base Z-Image: https://huggingface.co/Tongyi-MAI/Z-Image
- Modelo base Z-Image Turbo: https://huggingface.co/Tongyi-MAI/Z-Image-Turbo
