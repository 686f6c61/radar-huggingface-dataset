# EllipsesMark/Krea2_Chars_LoRA_untmods

## Resumen

Krea2_Chars_LoRA_untmods es una coleccion de 84 LoRA de personaje (adaptadores de bajo rango) para el modelo de difusion KREA2, tanto en su version base como en la variante turbo. La publica el usuario EllipsesMark en Hugging Face bajo licencia apache-2.0, con un repositorio de 6,0 GB que incluye, por cada personaje, un fichero `<Nombre>_KREA2.safetensors`, un fichero `<Nombre>_KREA2.md` con la descripcion de la persona (rasgos faciales estables, apariencia variable y repertorio de expresiones) y las captions de entrenamiento.

El problema que resuelve es el de la consistencia de identidad en generacion texto-a-imagen: en lugar de describir un rostro con prompts largos y poco fiables, el usuario carga un LoRA concreto y obtiene un personaje estable entre generaciones. Cada adaptador se ha re-rankado con SVD dinamico `sv_fro` (retencion 0,998, rango maximo 16) y se ha podado por bloques eliminando los 8 bloques de transformer de menor impacto (bloques 1-8, aproximadamente el 3 % de la energia del delta), lo que reduce el peso de cada fichero sin cambiar demasiado el resultado.

Resulta relevante como ejemplo de cadena de produccion completamente automatizada: scraping de imagenes, recorte y curado con YOLO de Ultralytics, filtrado estetico con un discriminador basado en el scorer estetico de ERNIE, captioning con un modelo vision Gemma-4 26B (abliterated) a 1,2 s por imagen, sintesis de personas, entrenamiento con Ostris AI-Toolkit en pods de RunPod y publicacion final, todo orquestado por un agente autonomo (Hermes Agent servido por Kimi K3) sin puertas de revision manual. El repositorio no declara idiomas soportados, no incluye benchmarks y no tiene descargas ni likes en el momento de redactar esta ficha.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (adaptadores de bajo rango, rango maximo 16 tras re-rankado) sobre un modelo de difusion KREA2; arquitectura interna del modelo base no disponible |
| Parametros totales | no disponible (84 LoRA; tamano total del repositorio 6,0 GB, aproximadamente 73 MB por personaje entre pesos, persona y captions) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (modelo de generacion de imagen); no disponible para el encoder de texto del base |
| Tipos de cuantizacion | no disponible; los pesos se distribuyen en safetensors, las opciones de cuantizacion dependen del runtime y del modelo base KREA2 |
| Idiomas soportados | no disponible (el repositorio no declara idiomas; los prompts dependen del encoder de texto de KREA2) |
| Licencia | apache-2.0 (los pesos; los derechos de imagen de las personas representadas no quedan cubiertos por esta licencia) |
| Formato de pesos | safetensors (`.safetensors`), acompanado de ficheros Markdown de persona y captions |
| Modelo base | KREA2 (base y turbo) |
| Pipeline declarado | text-to-image |
| Numero de adaptadores | 84 LoRA de personaje |
| Estructura del repositorio | carpeta `Characters/` con una subcarpeta por personaje; carpeta `Pruned_Comparison` con una imagen de ejemplo por personaje |
| Fecha de creacion / actualizacion | 2026-09-21 |

## Arquitectura y entrenamiento

Cada artefacto es un adaptador LoRA para KREA2, no un modelo completo. El entrenamiento se realizo con Ostris AI-Toolkit en pods efimeros de RunPod, con ajustes predefinidos por el usuario y sin intervencion manual documentada. Tras el entrenamiento, cada LoRA paso por dos transformaciones: un re-rankado con SVD dinamico basado en la norma de Frobenius del delta (`sv_fro`, retencion 0,998, rango maximo 16) y una poda por bloques que descarta los 8 bloques de transformer de menor impacto (bloques 1-8, en torno al 3 % de la energia del delta). El personaje Jung Ho-yeon se reentreno sobre un dataset nuevo y se volvio a re-rankar y podar con el mismo procedimiento.

El dataset se genero de forma automatica: recoleccion de imagenes de pools fotograficos web, deteccion y recorte de rostro/cabeza con Ultralytics YOLO, filtro duro de contenido (sin imagenes generadas por IA, sujeto correcto, umbral de nitidez) y una puerta de calidad estetica con un discriminador construido sobre el scorer estetico de ERNIE, con aceptacion o rechazo binario. El captioning se hizo con Gemma-4 26B (abliterated) en su variante vision MTP, a 1,2 s por imagen, y a partir del analisis de rasgos de esas captions se sintetizo el fichero de persona de cada personaje. No se documentan el numero de imagenes por personaje, la resolucion de entrenamiento, el learning rate, ni si hubo etapas de RLHF o DPO (no aplicables a un modelo de difusion). Tampoco se detalla la arquitectura del KREA2 subyacente.

## Capacidades

- Generacion de imagenes de personaje con identidad consistente: carga del LoRA correspondiente sobre KREA2 base o turbo para reproducir el mismo rostro entre prompts e iteraciones.
- Control de expresion y apariencia variable: cada fichero `<Nombre>_KREA2.md` separa los rasgos faciales estables de los atributos variables (peinado, maquillaje, expresiones), lo que sirve como guia de prompting.
- Integracion con ComfyUI: la etiqueta `comfyui` indica que el flujo previsto es la carga de LoRA en un grafo de nodos de difusion.
- Composicion con otros adaptadores: al ser LoRA estandar en safetensors, en principio puede combinarse con otros LoRA de estilo o de concepto en el mismo runtime, siempre que el runtime lo permita (no confirmado en la documentacion).
- Cobertura amplia de personajes: 84 identidades distintas, la mayoria figuras publicas y modelos, empaquetadas con una imagen de comparacion cada una.
- Generacion texto-a-imagen: el repositorio declara explicitamente el pipeline `text-to-image`.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso, vision de entrada, audio ni modo de pensamiento: no aplica a un modelo de generacion de imagen.

## Casos de uso

- Previsualizacion de casting y pruebas de vestuario: cargar el LoRA de un personaje y generar variaciones de vestuario, iluminacion y encuadre manteniendo el rostro estable, para explorar opciones antes de una sesion real.
- Storyboards y comic digital: usar un LoRA por personaje en un grafo de ComfyUI para mantener la identidad del protagonista a lo largo de decenas de vinetas generadas por separado.
- Avatares y retratos de marca para producto digital: generar un set coherente de imagenes de un personaje ficticio o embajador a partir de una unica identidad entrenada.
- Prototipado de personajes para videojuegos: producir hojas de referencia (turnarounds, primeros planos, expresiones) de forma rapida antes de modelar en 3D.
- Consistencia entre fotogramas para animacion o video generativo: al ser adaptadores ligeros y podados, permiten inyectar la misma identidad en pipelines de difusion por fotograma, donde el coste por paso importa.
- Pruebas de concepto estilisticas: combinar un LoRA de personaje con LoRA de estilo para validar direcciones artisticas en campanas de publicidad o editorial.
- Investigacion sobre poda de adaptadores: el repositorio publica el efecto de re-rankar con SVD `sv_fro` y de eliminar bloques de bajo impacto, lo que lo convierte en material de estudio sobre compresion de LoRA.
- Automatizacion de pipelines de datos para difusion: el flujo descrito (YOLO, filtro estetico, captioning con modelo vision, entrenamiento en RunPod) es replicable como plantilla para construir colecciones de adaptadores a escala.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio no incluye metricas cuantitativas de fidelidad de identidad (por ejemplo similitud facial, CLIP-I o DINO-I), ni comparativas numericas con otras colecciones de LoRA de personaje. Solo se aportan imagenes cualitativas de ejemplo en la carpeta `Pruned_Comparison`.

## Requisitos de hardware

- Los LoRA son adaptadores ligeros: el repositorio completo ocupa 6,0 GB para 84 personajes, es decir, del orden de 73 MB por personaje contando pesos, fichero de persona y captions. En inferencia solo se carga el adaptador del personaje que se este usando.
- La VRAM necesaria la determina el modelo base KREA2, no el LoRA. No se dispone de especificaciones de KREA2 en la informacion proporcionada, por lo que no es posible estimar VRAM de forma fiable.
- No se puede confirmar si cabe en GPU de consumo (RTX 4090, RTX 3090, etc.) sin conocer el tamano y la precision del KREA2 base.
- Opciones de despliegue documentadas: ComfyUI (etiqueta explicita del repositorio) y Ostris AI-Toolkit para el entrenamiento. Otros runtimes de difusion que acepten LoRA sobre KREA2 no estan confirmados.
- Latencia y throughput: no disponibles. El unico dato de rendimiento publicado es el del captioning del pipeline (1,2 s por imagen con Gemma-4 26B abliterated MTP), que corresponde a la fase de construccion del dataset, no a la inferencia del LoRA.

## Comparativa con modelos similares

No se dispone de datos verificables de alternativas comparables en la informacion proporcionada, por lo que no se puede construir una tabla con parametros, contexto y rendimiento homogeneos. Como referencia cualitativa, existen otras colecciones de LoRA de personaje para bases de difusion contemporaneas (SDXL, FLUX.1 y similares) distribuidas en safetensors y con licencias variables, pero no se han aportado cifras de ninguna de ellas en esta busqueda.

| Modelo | Modelo base | Numero de adaptadores | Licencia | Formato | Datos comparativos |
|---|---|---|---|---|---|
| Krea2_Chars_LoRA_untmods | KREA2 (base y turbo) | 84 | apache-2.0 | safetensors | no disponible |
| Otras colecciones de LoRA de personaje | no disponible | no disponible | no disponible | safetensors (habitual) | no disponible |

## Limitaciones y advertencias

- Retratos de personas reales: la mayor parte de los personajes son figuras publicas identificables. La licencia apache-2.0 cubre los pesos, pero no los derechos de imagen, de personalidad ni de marca de las personas representadas. El uso comercial o la difusion de imagenes generadas puede infringir normativa de imagen y, en la Union Europea, el RGPD si los datos biometricos derivan de personas identificables.
- Riesgo de deepfake: el modelo permite generar retratos realistas de personas concretas. Cualquier uso para suplantacion, contenido sexual no consentido, desinformacion o campanas politicas es ilicito y ademas puede estar prohibido por las condiciones de uso de las plataformas de destino.
- Procedencia del dataset: las imagenes se recogieron mediante scraping automatico de pools fotograficos, sin que se documente consentimiento, atribucion ni base legal del tratamiento.
- Ausencia de revision humana: la model card indica explicitamente que no hay puertas de revision manual en el pipeline. El filtro de contenido se limita a un umbral binario de nitidez y a un scorer estetico, sin verificacion semantica posterior.
- Captioning con modelo abliterated: las captions se generaron con una variante sin restricciones, por lo que pueden contener descripciones sesgadas o inapropiadas que condicionen el comportamiento del LoRA.
- Poda agresiva: el re-rankado a rango maximo 16 y la eliminacion de 8 bloques de transformer (aproximadamente el 3 % de la energia del delta) pueden degradar el parecido en poses, angulos o expresiones poco representados en el dataset.
- Rendimiento no validado: el repositorio tiene 0 descargas y 0 likes en el momento de la consulta, sin benchmarks ni evaluaciones de terceros. No hay evidencia publica de calidad.
- Idiomas no declarados: no se especifica que lenguas entiende el encoder de texto de KREA2, por lo que no se puede garantizar el funcionamiento de prompts en castellano.
- Inconsistencia de espacio de nombres: el identificador del repositorio es `EllipsesMark/Krea2_Chars_LoRA_untmods`, mientras que las imagenes de ejemplo de la model card apuntan a `UntMods/Krea2_Chars_LoRA`. Conviene verificar cual es la ubicacion canonica y si los pesos han sido modificados por un tercero, algo relevante dado el sufijo `untmods` (unt-modded).
- Sesgos esperables: la seleccion de personajes y el filtro estetico tienden a sobrerrepresentar determinados canones de belleza y origenes etnicos, con cobertura desigual entre los 84 personajes.
- Dependencia del base: el LoRA no es autosuficiente; requiere disponer de KREA2 base o turbo y de sus condiciones de licencia y acceso, no documentadas aqui.

## Enlaces

- Hugging Face: https://huggingface.co/EllipsesMark/Krea2_Chars_LoRA_untmods
- Imagenes de comparacion citadas en la model card: https://huggingface.co/UntMods/Krea2_Chars_LoRA
- Hermes Agent (agente usado para el pipeline): https://hermes-agent.nousresearch.com
- Ostris AI-Toolkit (entrenamiento de LoRA, citado en la model card): https://github.com/ostris/ai-toolkit
- RunPod (infraestructura de entrenamiento, citada en la model card): https://www.runpod.io
- Ultralytics YOLO (deteccion y recorte, citado en la model card): https://github.com/ultralytics/ultralytics
- ComfyUI (entorno de inferencia indicado en las etiquetas): https://github.com/comfyanonymous/ComfyUI
- Nota sobre la busqueda web: los resultados devueltos no guardan relacion con el modelo (foros generalistas y hilos de soporte de Microsoft y WhatsApp Web), por lo que no se han incluido.
