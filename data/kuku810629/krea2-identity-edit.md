# kuku810629/krea2-identity-edit

## Resumen

Krea 2 Identity Edit es un adaptador LoRA de edicion de imagen guiada por instrucciones, publicado por el usuario kuku810629 sobre el modelo base krea/Krea-2-Raw, un transformer MMDiT de flujo unico con 12.9B de parametros. Su objetivo es editar una imagen siguiendo una orden en lenguaje natural ("crea una foto de esta persona en un mercado nocturno") preservando de forma casi pixel a pixel todo aquello que no se ha pedido cambiar, incluida la identidad de la persona retratada. No es un producto oficial de Krea.ai, Inc., sino un fine-tune comunitario no oficial.

El adaptador se distribuye en varias versiones; la recomendada es v1.2, que anade respecto a v1.1 un pase de alta resolucion a 1024, hoja de referencia de personaje, intercambio de cabeza/cara/ojo/persona, outpainting, inpainting y probador virtual. Requiere obligatoriamente el pack de nodos ComfyUI-Krea2Edit, ya que el LoRA se entreno con condicionamiento dual (tokens VAE en contexto mas codificacion de imagen basada en Qwen3-VL) que los nodos estandar de ComfyUI no proporcionan.

El modelo resulta relevante porque cubre un nicho concreto: edicion local e identidad preservada dentro del ecosistema Krea 2, con un dial de fidelidad (`ref_boost`) y geometria FIT que resuelve automaticamente discrepancias de relacion de aspecto entre entrada y salida. Su licencia krea-2-community-license condiciona el uso comercial, y el repositorio ocupa 8.3 GB al incluir todas las variantes publicadas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA sobre Krea 2 Raw (transformer MMDiT de un solo flujo, 12.9B) |
| Parametros totales | No declarados para el adaptador; el modelo base Krea 2 Raw tiene 12.9B |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No aplica a generacion de texto; el condicionamiento combina tokens VAE en contexto y codificacion de imagen basada en Qwen3-VL |
| Tipos de cuantizacion | No disponible; se ofrecen variantes de rango reducido por SVD (r128 de 0.91 GB y r64 de 0.46 GB) |
| Idiomas soportados | No disponible; las instrucciones se expresan en lenguaje natural y el encoder de grounding es Qwen3-VL |
| Licencia | krea-2-community-license (license: other), enlace en https://krea.ai/krea-2-licensing |
| Formato de pesos | safetensors |
| Modelo base | krea/Krea-2-Raw |
| Variantes publicadas | `krea2_identity_edit_v1_2.safetensors`, `_v1_2_r128`, `_v1_2_r64`, `_v1_1` (+ `_r128`/`_r64`), `_v1` |
| Tamano del repositorio | 8.3 GB |
| Dependencia obligatoria | ComfyUI-Krea2Edit (nodos con condicionamiento dual) |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

El adaptador es un LoRA de rango completo (con variantes de rango reducido por SVD que, segun el autor, retienen mas del 99% de la energia de los pesos) que se aplica sobre Krea 2 Raw, un transformer MMDiT de flujo unico de 12.9B de parametros. La innovacion clave no esta en el adaptador en si, sino en el esquema de condicionamiento: el LoRA se entrena con condicionamiento dual, es decir, tokens VAE en contexto mas una codificacion de imagen con grounding basado en Qwen3-VL. Por eso el autor insiste en que los nodos estandar de ComfyUI no son suficientes y que hace falta el pack ComfyUI-Krea2Edit.

Respecto a los datos, la version v1.2 incorpora un pase de alta resolucion a 1024 del que carecia v1.1, lo que mejora el parecido facial en sujetos re-escenificados y la fidelidad en todas las habilidades. La capacidad de intercambio de cabeza, cara, ojo y persona se entreno sobre el dataset MIT `change_eye_face_head_person` de stablellama. El codigo de entrenamiento es publico: se trata de una extension de ai-toolkit llamada krea2edit-trainer, con la geometria alineada con la de los nodos y con requisitos de VRAM medidos en GPUs de consumo. No se especifican en la informacion disponible el numero total de tokens de entrenamiento, la composicion completa del dataset ni si se emplearon tecnicas de RLHF o DPO.

## Capacidades

- Re-escenificacion de personas con preservacion de identidad: cambia el fondo, la iluminacion y el angulo de camara manteniendo rostro, ropa y detalles como lunares y marcas.
- Ediciones locales: recoloreado, adicion, eliminacion o sustitucion de objetos, cambios de atributos y de vestuario, con preservacion casi a nivel de pixel del resto del encuadre.
- Reemplazo con referencia: el verbo "replace" esta entrenado y mantiene la localidad del cambio (por ejemplo, sustituir una persona por un orangutan).
- Restilizado global de imagen completa conservando la composicion.
- Ediciones con dos entradas: escena y persona como referencias separadas, con orden fijo (escena siempre en la entrada 1, persona en la entrada 2).
- Creacion y uso de hojas de referencia de personaje (character reference sheet).
- Intercambio de cabeza, cara, ojo y persona.
- Outpainting e inpainting.
- Probador virtual (virtual try-on).
- Composicion con otros LoRA de personaje, cuerpo o estilo, que se apilan sobre el adaptador.
- Dial `ref_boost` para controlar la fidelidad de la edicion respecto a la referencia (valores en torno a 4 para parecido fuerte).
- Geometria FIT (v1.2) que gestiona automaticamente relaciones de aspecto distintas entre origen y salida.
- No se documentan capacidades de generacion de texto, razonamiento, codigo, matematicas ni tool calling: es un modelo exclusivamente de edicion de imagen.

## Casos de uso

- Postproduccion fotografica de retrato: re-escenificar a una persona en un entorno nuevo (por ejemplo, un mercado nocturno) manteniendo su identidad y su vestuario, util para campanas que necesitan varias localizaciones sin repetir sesion.
- Probador virtual en comercio electronico: colocar una prenda sobre una persona de referencia con el dial `ref_boost` alto para conservar el parecido; conviene trabajar a 1-1.5 MP en ediciones con dos personas y reescalar despues.
- Retoque local en flujos de diseno grafico: recolorear elementos, anadir o quitar objetos y ajustar atributos sobre la imagen original sin regenerar el resto del encuadre.
- Creacion de hojas de referencia de personajes: generar vistas coherentes de un personaje para produccion de animacion, videojuegos o ilustracion, partiendo de una referencia unica.
- Intercambio de cara o cabeza en material audiovisual: sustituir la cabeza o el rostro de un sujeto utilizando el dataset de intercambio con el que se entreno la capacidad, util para pruebas de casting o previsualizacion.
- Ampliacion de encuadres con outpainting: extender una imagen mas alla de sus bordes originales para adaptarla a formatos de carteleria o redes sociales.
- Reparacion de imagenes con inpainting: reconstruir zonas danadas o eliminar elementos no deseados combinando la receta Raw con CFG 3.0 y 20 pasos.
- Composicion publicitaria con dos referencias: montar a una persona concreta junto a un objeto o vehiculo aportando escena y sujeto por separado, respetando el orden fijo de entradas.
- Generacion de variantes de estilo en pipelines de ComfyUI: apilar LoRA de estilo propios sobre el adaptador para producir series coherentes de assets de marketing sin perder la identidad del sujeto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas cuantitativas (FID, CLIP-I, DINO, SSIM ni similares) ni comparaciones numericas con otros editores; unicamente describe el comportamiento cualitativo de cada habilidad.

## Requisitos de hardware

- El adaptador LoRA en si es ligero: 0.91 GB para la variante r128 y 0.46 GB para r64. La variante v1.2 completa forma parte de un repositorio de 8.3 GB que incluye todas las versiones.
- El coste real de VRAM lo determina el modelo base Krea 2 Raw de 12.9B. Como estimacion orientativa a partir del tamano de parametros, en fp16 los pesos rondan los 26 GB y en fp8 en torno a 13 GB, a lo que hay que sumar activaciones y el encoder de grounding Qwen3-VL. No se dispone de cifras oficiales de VRAM en la informacion proporcionada.
- El autor indica que el repositorio del trainer incluye requisitos de VRAM medidos en GPUs de consumo, pero no reproduce las cifras en la model card.
- GPU recomendadas: no disponibles de forma explicita. Por tamano del modelo base, tiene sentido plantear GPUs de 24 GB o mas (RTX 3090, RTX 4090, A100, H100) y recurrir a cuantizacion para tarjetas de 16 GB o menos; se trata de una estimacion, no de un dato confirmado por el autor.
- Opciones de despliegue: ComfyUI es el unico entorno documentado, y exige el pack de nodos ComfyUI-Krea2Edit con los nodos v1.2 para las funcionalidades nuevas (geometria FIT y dial `ref_boost`). No se mencionan vLLM, llama.cpp, Ollama ni TGI, que ademas no aplican a un modelo de difusion de imagen.
- Latencia y throughput: no disponibles. La model card solo aporta el ajuste de pasos: 8-12 pasos con CFG 1.0 en Turbo para la mayoria de ediciones y 20 pasos con CFG 3.0 en Raw para eliminaciones.
- Restriccion practica de resolucion: generar a 2 MP o menos, ya que por encima aparecen problemas de sangrado o duplicacion de la fuente. En ediciones de dos personas con v1.1 se recomienda 1-1.5 MP y reescalar despues.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / resolucion | Licencia | Notas |
|---|---|---|---|---|
| krea2-identity-edit v1.2 (este) | LoRA sobre base de 12.9B | Generacion recomendada <=2 MP; geometria FIT | krea-2-community-license | Requiere nodos ComfyUI-Krea2Edit; incluye `ref_boost` |
| krea2-identity-edit v1.2 r128 | LoRA de rango reducido (0.91 GB) | Igual que v1.2 | krea-2-community-license | Calidad casi identica, menor huella en disco |
| krea2-identity-edit v1.2 r64 | LoRA de rango reducido (0.46 GB) | Igual que v1.2 | krea-2-community-license | Variante para entornos con poca VRAM |
| krea2-identity-edit v1.1 | LoRA sobre base de 12.9B | Sin pase de alta resolucion a 1024 | krea-2-community-license | Sin FIT ni `ref_boost`; rango de `grounding_px` 384-768 |
| Krea 2 Raw (base) | 12.9B | No disponible | Licencia de Krea 2 | Modelo base; no incorpora las capacidades de edicion por instrucciones del LoRA |

No se dispone de datos de rendimiento ni de especificaciones verificadas de otros editores por instrucciones de la misma categoria dentro de la informacion proporcionada, por lo que no se incluye una comparacion cuantitativa con alternativas externas.

## Limitaciones y advertencias

- El parecido es fiel en textura pero conservador en proporcion: lunares, piel, pelo e iluminacion se transfieren bien, mientras que geometrias faciales muy distintivas (nariz inusual, espaciado de ojos, longitud del rostro) tienden a regresar hacia proporciones tipicas. En esos casos el resultado se percibe como un "pariente cercano".
- Con dos personas como entrada, los vestuarios se mantienen distintos pero los rostros derivan el uno hacia el otro. El autor propone encadenar inserciones de una sola referencia como solucion alternativa.
- La eliminacion de elementos funciona pero no es fiable: hay que usar siempre la receta Raw con CFG 3.0 y contar con reejecuciones ocasionales en lugar de borrados limpios.
- Los cambios de vestuario son irregulares: a veces se aplican con limpieza y a veces no, y requieren repetir la generacion o reformular la instruccion.
- Las ediciones locales no siempre se aplican con precision, segun la lista de limitaciones conocidas que figura en la model card.
- Invertir el orden de las dos entradas (escena y persona) degrada notablemente los resultados, porque el orden esta fijado por el entrenamiento.
- Un `grounding_px` muy por encima del rango entrenado (384-768 en v1.1, con 768 por defecto; 512-1536 en v1) es la causa mas habitual de composiciones duplicadas o divididas.
- Valores de `ref_boost` superiores a 10 empiezan a romper las eliminaciones; por debajo de 1 el resultado se relaja hacia la libertad creativa.
- Generar por encima de 2 MP provoca sangrado o duplicacion de la fuente; en v1.1 con dos personas conviene bajar a 1-1.5 MP y reescalar.
- La licencia krea-2-community-license es de tipo "other" y condiciona el uso comercial; es imprescindible revisar https://krea.ai/krea-2-licensing antes de cualquier despliegue en produccion. Ademas, el modelo es un fine-tune no oficial y no esta afiliado ni respaldado por Krea.ai, Inc.
- El repositorio registra 0 descargas y 0 likes, por lo que no existe validacion independiente de la comunidad sobre su comportamiento.
- Se desconoce el comportamiento del modelo en idiomas distintos del ingles de las instrucciones de ejemplo, ya que no se declara lista de idiomas soportados.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/kuku810629/krea2-identity-edit
- Modelo base: https://huggingface.co/krea/Krea-2-Raw
- Pack de nodos ComfyUI-Krea2Edit: https://github.com/lbouaraba/comfyui-krea2edit
- Codigo de entrenamiento (krea2edit-trainer): https://github.com/lbouaraba/krea2edit-trainer
- Dataset de intercambio de ojo, cara, cabeza y persona: https://huggingface.co/datasets/stablellama/change_eye_face_head_person
- Perfil del autor del dataset: https://huggingface.co/stablellama
- Licencia Krea 2: https://krea.ai/krea-2-licensing
- Apoyo al autor (Ko-fi): https://ko-fi.com/conradlocke

Nota: los resultados de busqueda web proporcionados no contienen informacion relevante sobre este modelo, por lo que no se han incorporado fuentes adicionales.
