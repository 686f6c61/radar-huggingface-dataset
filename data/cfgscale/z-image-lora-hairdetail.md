# cfgscale/Z-Image-LoRA-HairDetail

## Resumen

Z-Image-LoRA-HairDetail es un adaptador LoRA de bajo rango para generacion de imagenes mediante texto (text-to-image) desarrollado por el usuario cfgscale bajo la marca SeedraAI. Se publica como un complemento del modelo base Tongyi-MAI/Z-Image, sobre el que se aplica para modificar un aspecto muy concreto de la sintesis: la representacion del cabello. Su funcion es corregir una limitacion conocida de los modelos de difusion, que tienden a renderizar el pelo como una masa uniforme y lisa, especialmente en situaciones de contraluz, cabello mojado o trenzas apretadas.

El adaptador empuja la separacion de mechones individuales, anade cabellos sueltos (flyaways) y preserva la estructura de tramados y rayas del peinado. La model card indica que funciona bien con box braids, knotless braids, cornrows, locs, pelo liso, ondulado, rizado, coletas y cabello mojado. El disparador (trigger word) es `sdrhair01`, que debe encabezar el prompt.

El repositorio tiene un tamano de 0,1 GB, lo que es coherente con un LoRA de rango bajo sobre un modelo de difusion. La licencia declarada es Apache 2.0, heredada del modelo base. No se han publicado datos sobre la arquitectura interna del modelo base, el numero de parametros del adaptador ni el proceso de entrenamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (adaptador de bajo rango) sobre modelo de difusion text-to-image Tongyi-MAI/Z-Image |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (no aplica a un modelo de difusion) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en (ingles) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (fichero `SeedraAI_Hair_c1-st2000.safetensors`) |

## Arquitectura y entrenamiento

No se dispone de informacion detallada sobre la arquitectura del modelo base Tongyi-MAI/Z-Image ni sobre la del adaptador. Por la naturaleza del artefacto (un fichero safetensors de aproximadamente 0,1 GB) y por su etiquetado como LoRA, se trata de un conjunto de matrices de bajo rango que se inyectan en las capas del modelo base para especializar su comportamiento en la representacion del cabello.

La model card no documenta el numero de pasos de entrenamiento, el dataset utilizado, la composicion de las imagenes de entrenamiento ni si se aplicaron tecnicas de regularizacion. El nombre del fichero (`SeedraAI_Hair_c1-st2000`) sugiere un checkpoint en el paso 2000, pero este dato no se confirma en el texto. Tampoco se especifica el rango (rank) del LoRA ni los modulos objetivo del modelo base.

## Capacidades

- Generacion de imagenes fotorrealistas de retratos con enfasis en el detalle del cabello: separacion de mechones, flyaways y estructura de trenzas y rayas.
- Especializacion en estilos de peinado concretos: box braids, knotless braids, cornrows, locs, pelo liso, ondulado, rizado, coletas y cabello mojado.
- Control mediante trigger word `sdrhair01` al inicio del prompt, seguido de color y estilo de pelo y descripcion de la escena.
- Integracion en ComfyUI mediante el nodo LoraLoaderModelOnly.
- Funciona con cualquier resolucion soportada por Z-Image, segun la model card.
- No soporta tool calling, agentes, razonamiento multi-paso ni capacidades de vision o audio; es exclusivamente un adaptador de generacion de imagen.
- Capacidad multilingue limitada al ingles en la practica (idioma declarado: en).

## Casos de uso

- Retratos de estudio con peinados complejos: el LoRA permite generar trenzas, locs y cornrows con mechones diferenciados en lugar de una masa uniforme, lo que resulta util para pruebas de concepto de fotografia de moda o belleza.
- Ilustracion de personajes para narrativa visual: al mantener la estructura de tramados y rayas del peinado, facilita la coherencia de personajes con estilos de pelo definidos a lo largo de una serie de imagenes.
- Generacion de referencias para peluqueria y estilismo: permite explorar variaciones de color y estilo de cabello (liso, ondulado, rizado, mojado) con un control explicito del color en el prompt.
- Prototipado de campanas de producto capilar: util para generar imagenes de cabello mojado o con brillo donde la separacion de mechones es el atributo visual clave.
- Creacion de assets para videojuegos o animacion: sirve como referencia de peinados con detalle de mechones para artistas 3D que necesiten guias visuales.
- Flujos de trabajo en ComfyUI con postprocesado: se integra en grafos que combinan el LoRA con pilas de realismo, ruido de camara y grano, segun los flujos que el autor comercializa aparte.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la informacion proporcionada. Depende enteramente del modelo base Z-Image, cuyos requisitos no se documentan en esta ficha.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no disponible; condicionada por el modelo base.
- Opciones de despliegue: ComfyUI (documentado por el autor mediante el nodo LoraLoaderModelOnly). Otras opciones dependen del soporte del modelo base y no se detallan.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No se dispone de informacion sobre adaptadores LoRA comparables para detalle de cabello sobre Z-Image ni sobre otros modelos base. Los datos de parametros, contexto y rendimiento de alternativas no estan disponibles en la informacion proporcionada.

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Z-Image-LoRA-HairDetail | no disponible | no aplica | Apache 2.0 | Hugging Face, CivitAI |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Entrenado sobre sujetos femeninos: los resultados en cabello masculino son impredecibles y los cortes cortos estan infrarepresentados, segun advierte el autor.
- Requiere describir explicitamente el color del cabello en el prompt; de lo contrario, la generacion tiende a tonos mas oscuros.
- El trigger word `sdrhair01` es obligatorio para activar el efecto del LoRA.
- El idioma declarado es unicamente ingles, lo que limita la redaccion de prompts en otras lenguas.
- Riesgo de alucinacion visual: como todo modelo de difusion, puede generar anatomias o texturas incoherentes, especialmente en peinados poco representados en el entrenamiento.
- La licencia Apache 2.0 se hereda del modelo base; conviene verificar los terminos del modelo Tongyi-MAI/Z-Image antes de un uso comercial.
- Los flujos de trabajo completos de SeedraAI (pila de realismo, ruido de camara, grano y color) no se incluyen en el repositorio y forman parte de una membresia de pago.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, por lo que no hay evidencia de validacion por parte de la comunidad.

## Enlaces

- Hugging Face: https://huggingface.co/cfgscale/Z-Image-LoRA-HairDetail
- Modelo base: https://huggingface.co/Tongyi-MAI/Z-Image
- CivitAI: https://civitai.com/models/2897795
- SeedraAI (flujos y guias): https://seedraai.com/
- Discord de la comunidad: https://discord.gg/seedraai
