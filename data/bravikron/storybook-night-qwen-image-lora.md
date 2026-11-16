# bravikron/storybook-night-qwen-image-lora

## Resumen

Storybook Night es un LoRA de estilo para el modelo de difusion de imagenes Qwen-Image-2512, desarrollado por Bravikron Labs (usuario `bravikron` en Hugging Face). Su funcion es transferir un estilo visual concreto a las generaciones del modelo base: cielos azul marino profundo, ventanas y faroles en ambar calido, textura suave de gouache y formas redondeadas simples, orientado a ilustracion infantil y escenas nocturnas acogedoras.

El adaptador se entrena sobre 30 imagenes cuidadosamente seleccionadas con sujetos muy distintos, con el objetivo declarado de que el estilo no quede ligado a un unico tipo de contenido y funcione igual de bien en escenas, personajes, animales, interiores y objetos. Se activa mediante la palabra disparadora `stbkn1ght style` y se distribuye como un unico fichero safetensors de aproximadamente 0,3 GB.

Es relevante para quien necesite producir ilustraciones coherentes de libro infantil sin entrenar su propio LoRA: el adaptador es ligero, se aplica sobre un modelo base Apache 2.0 y su licencia permite uso comercial de las imagenes generadas. No obstante, el repo no incluye documentacion sobre datos de entrenamiento mas alla del recuento de imagenes, ni benchmarks, ni metricas objetivas de calidad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (adaptador de bajo rango) sobre el modelo de difusion Qwen-Image-2512 |
| Parametros totales | no disponible (adaptador LoRA, no se publica el numero de parametros) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo text-to-image) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (los prompts de ejemplo estan en ingles) |
| Licencia | bravikron-free-lora-license (uso libre, incluido comercial de las imagenes; prohibida la reventa del fichero LoRA); se aplica ademas la licencia del modelo base, Apache 2.0 |
| Formato de pesos | safetensors (`bravikron_storybook_night_v1.safetensors`) |
| Modelo base | Qwen/Qwen-Image-2512 |
| Palabra disparadora | `stbkn1ght style` |
| Tamano del repo | 0,3 GB |
| Pipeline | text-to-image |

## Arquitectura y entrenamiento

El artefacto es un adaptador LoRA pensado para inyectarse en el modelo de difusion Qwen-Image-2512. La model card no detalla la arquitectura interna del LoRA (rango, modulos objetivo, alpha) ni la del modelo base; solo indica el pipeline text-to-image y el identificador del checkpoint base. El entrenamiento se realizo sobre 30 imagenes "curadas" con sujetos deliberadamente heterogeneos, segun el autor, para evitar que el estilo se sobreajuste a un unico motivo. No se especifican el numero de pasos de entrenamiento, la tasa de aprendizaje, el optimizador ni si hubo aumento de datos.

Como innovacion practica, el autor documenta una receta de inferencia concreta: 30 pasos, CFG 4, sampler euler / simple, shift 3.1 y fuerza de LoRA entre 0,7 y 1,0. No se mencionan tecnicas adicionales como decodificacion especulativa, atencion lineal ni destilacion, algo esperable en un adaptador de estilo y no en un modelo fundacional.

## Capacidades

- Generacion de imagenes text-to-image con un estilo pictorico de gouache, paleta nocturna azul marino y ambar, y formas redondeadas.
- Aplicacion del estilo a escenas, personajes, animales, interiores y objetos, segun los ejemplos publicados (zorro detective, castillo, puesto de ramen, robot, dragon, globo aerostatico).
- Control de intensidad del estilo mediante la fuerza del LoRA (0,7-1,0), lo que permite un acabado mas o menos marcado.
- Composicion con el modelo base Qwen-Image-2512, heredando las capacidades de este (no detalladas en la informacion disponible).
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso, vision, audio ni modo thinking: no aplica a un LoRA de imagen.
- Capacidades multilingues: no disponibles; los prompts de ejemplo y la plantilla estan en ingles.

## Casos de uso

- Ilustracion de libros infantiles: generar escenas nocturnas coherentes (cielos, faroles, ventanas iluminadas) para maquetas o cuentos, usando la plantilla `stbkn1ght style, <descripcion>` y una fuerza de LoRA alta (0,9-1,0) para maximizar la consistencia estilistica.
- Creacion de portadas y material promocional: producir cubiertas de tono acogedor para publicaciones infantiles o juveniles, con la ventaja de que la licencia permite uso comercial de las imagenes resultantes.
- Storyboarding de animacion o videojuego: iterar rapidamente sobre bocetos de escenas con una direccion de arte fija, gracias a que el estilo se mantiene en sujetos muy distintos.
- Diseno de escenarios para juegos narrativos: generar fondos de pueblos, interiores y paisajes con paleta nocturna uniforme para mantener cohesion visual entre niveles.
- Merchandising y productos derivados: laminas, postales o ilustraciones para articulos de papeleria, siempre que se respete la prohibicion de revender el fichero LoRA y la licencia del modelo base.
- Prototipado de direccion de arte: comparar variantes de una misma escena con fuerzas de LoRA distintas (0,7 frente a 1,0) para decidir el grado de estilizacion antes de encargar ilustracion final.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas objetivas (FID, CLIP score, evaluaciones humanas) ni comparaciones cuantitativas con otros LoRA de estilo.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma especifica; depende del modelo base Qwen-Image-2512, no del LoRA, cuyo fichero ocupa unos 0,3 GB.
- GPU recomendadas: no disponibles en la informacion proporcionada; en general, un modelo de difusion de imagen de gran tamano requiere GPU con VRAM alta (gama profesional o consumer de gama alta), pero no se confirma en la model card.
- Compatibilidad con GPU consumer: no confirmada.
- Opciones de despliegue: no documentadas; el formato safetensors es compatible con los runners habituales de difusion que soporten LoRA, pero el autor no especifica ninguno (ComfyUI, Diffusers, etc.).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye otros LoRA de estilo comparables ni datos de rendimiento que permitan una comparacion rigurosa.

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Storybook Night (este LoRA) | no disponible | no aplica | sin benchmarks | bravikron-free-lora-license + Apache 2.0 del base | Hugging Face y Civitai |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Entrenado con solo 30 imagenes: el estilo puede generalizar de forma irregular a sujetos muy alejados de los vistos en entrenamiento, pese a la intencion declarada de diversidad.
- No hay evaluacion objetiva publicada; la calidad percibida depende de la receta de inferencia (30 pasos, CFG 4, euler/simple, shift 3.1) y de la fuerza de LoRA elegida.
- Riesgo de repeticion de motivos (faroles, ventanas ambar, cielos nocturnos) si se usa a fuerza 1,0 de forma sistematica; el autor recomienda bajar a 0,7 para un efecto mas sutil.
- Licencia: se permite el uso comercial de las imagenes, pero se prohibe revender el fichero LoRA y presentar el personaje como propio o como persona real; ademas se aplica la licencia del modelo base Qwen-Image-2512 (Apache 2.0), cuyos terminos deben respetarse.
- Idiomas soportados no documentados; los prompts de ejemplo estan en ingles y no se garantiza el mismo comportamiento con prompts en castellano.
- Sin informacion sobre sesgos, alucinacion visual (artefactos, anatomia incorrecta) ni comportamiento en produccion a gran escala; conviene validar las salidas antes de usarlas comercialmente.
- Repo con 0 descargas y 0 likes en el momento de la consulta: no hay evidencia de comunidad ni de validacion externa.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/bravikron/storybook-night-qwen-image-lora
- Pagina en Civitai (mas imagenes y notas de version): https://civitai.com/models/3035138
- Todos los modelos gratuitos del autor: https://bravikron.com/models.html
- Entrenamiento de LoRA personalizado: https://bravikron.com/labs.html
- Modelo base: https://huggingface.co/Qwen/Qwen-Image-2512
