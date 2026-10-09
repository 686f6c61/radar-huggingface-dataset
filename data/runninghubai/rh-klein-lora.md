# RunningHubAI/rh-klein-lora

## Resumen

rh-klein-lora es un adaptador LoRA de bajo rango para generacion de imagen a partir de texto (text-to-image), publicado por RunningHubAI en Hugging Face el 9 de octubre de 2026. No es un modelo autonomo: se trata de un ajuste fino que se carga sobre el modelo base Flux2-Klein-9B y que anade control explicito sobre el angulo, la altura y el movimiento de camara de la imagen generada. El fichero de pesos, `klein9b-Camera-Blocking.safetensors`, ocupa 83 MiB y el repositorio completo 0,1 GB.

El proposito del adaptador es resolver un problema muy concreto del flujo de trabajo con difusion: conseguir que el prompt controle de forma fiable la puesta en escena cinematografica (angulos de picado y contrapicado, desplazamientos laterales, zooms, composiciones inclinadas o punto de vista en primera persona), algo que los modelos base suelen interpretar de manera inconsistente. La model card documenta mas de 70 etiquetas de camara en chino e ingles, agrupadas en bloques de angulos, movimientos de camara, composicion y vista y angulos direccionales.

Su relevancia es practica y de nicho: encaja en flujos de generacion de imagenes con ComfyUI o en la plataforma RunningHub, donde el autor tambien ofrece entrenamiento y API. No se dispone de informacion sobre el numero de parametros entrenables, la composicion del dataset, la licencia o el rendimiento medido, por lo que cualquier evaluacion seria exige probarlo directamente con el modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (adaptador LoRA sobre el modelo base Flux2-Klein-9B, de tipo text-to-image; no se detalla la arquitectura interna del adaptador ni del base) |
| Parametros totales | no disponible (se distribuye un unico fichero de pesos LoRA de 83 MiB; no se indica el numero de parametros entrenables) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica / no disponible (modelo de difusion para imagen; no se documenta limite de tokens de prompt) |
| Tipos de cuantizacion | no disponible (pesos en safetensors; no se indica el tipo de dato) |
| Idiomas soportados | etiquetas de prompt documentadas en chino e ingles; no se declaran idiomas adicionales |
| Licencia | no disponible (la model card indica que el copyright es del autor y que debe seguirse la licencia del proyecto original o del modelo upstream) |
| Formato de pesos | safetensors (`klein9b-Camera-Blocking.safetensors`, 83 MiB) |

## Arquitectura y entrenamiento

La informacion proporcionada no describe la arquitectura del adaptador ni del modelo base. Lo unico confirmado es que se trata de un LoRA (Low-Rank Adaptation) de tipo text-to-image, ajustado a partir de Flux2-Klein-9B, y que el artefacto distribuido es un unico fichero safetensors de 83 MiB con el nombre `klein9b-Camera-Blocking.safetensors`. El termino "camera blocking" del nombre del fichero coincide con la funcion declarada del adaptador: controlar la puesta en escena de la camara.

No hay datos sobre el volumen de tokens o imagenes de entrenamiento, la composicion del dataset, el rango y alpha del LoRA, el optimizador, el numero de pasos, ni sobre si se emplearon tecnicas de alineacion como RLHF, DPO o refinamiento con preferencias. Tampoco se documenta ninguna innovacion tecnica adicional (atencion lineal, decodificacion especulativa u otras): esas categorias no aplican al planteamiento descrito. La model card se limita a listar las etiquetas de camara soportadas y a indicar la procedencia del ajuste.

## Capacidades

- Generacion de imagen a partir de texto condicionada por el modelo base Flux2-Klein-9B, con un incremento de control sobre la puesta en escena.
- Control de angulos de camara: contrapicados frontales, contrapicados extremos, tomas de la parte inferior del cuerpo, angulos de 30, 45, 70, 90, 135 y 160 grados desde izquierda y derecha.
- Control de picados: picados a 45 y 135 grados desde ambos lados, picado de espaldas, picado cenital, vista vertical, vista de pajaro.
- Control de movimiento de camara: subida del objetivo a altura de cintura y de pecho, bajada a altura de rodilla y al suelo, desplazamiento lateral izquierda y derecha, paneos y tilt, y una secuencia completa de push in (plano general, medio general, medio, medio primer plano, primer plano, primerisimo primer plano, primer plano de manos) y de pull back a plano general.
- Control de composicion y punto de vista: composicion inclinada a derecha e izquierda, vista en primera persona, inclinacion del objetivo a 45 y 80 grados en ambos sentidos.
- Control de angulos direccionales con etiquetas especificas de lado y grado (45, 70, 90, 135 y 160 grados).
- Soporte de prompts bilingues: las etiquetas documentadas estan en chino e ingles.
- No se documenta soporte de tool calling, function calling, razonamiento multi-paso, agentes, vision de entrada, audio ni modo de razonamiento explicito, ya que no son capacidades propias de un LoRA de generacion de imagen.

## Casos de uso

- Previsualizacion de storyboards para cine y publicidad: el adaptador permite fijar el angulo exacto de cada plano ("extreme low angle shot from the front", "bird's-eye view") para producir fotogramas coherentes con el guion tecnico antes de rodar.
- Ilustracion de guiones graficos en produccion audiovisual: al cubrir tanto angulos estaticos como movimientos de camara y tamanos de plano, permite generar de forma sistematica la secuencia completa de un plano secuencia descompuesto en viñetas.
- Generacion de keyframes para animatica: la lista de etiquetas de push in y pull back facilita crear los fotogramas inicial y final de un movimiento de camara y usarlos como referencia en animacion.
- Diseno de personajes con vistas consistentes: combinando el angulo frontal, los angulos de 45, 90 y 135 grados y la vista de espaldas, se pueden generar hojas de personaje con multiples orientaciones para un mismo diseno.
- Contenido para redes sociales y moda: las tomas de contrapicado, los planos de la parte inferior del cuerpo y los encuadres inclinados cubren los formatos visuales habituales en campanas de producto y editorial de moda.
- Creacion de escenas en primera persona para videojuegos: la etiqueta de perspectiva en primera persona permite generar arte conceptual de entornos tal y como los veria el jugador.
- Fotografia virtual de producto y arquitectura: los picados a 45 y 135 grados y la vista de pajaro son utiles para generar vistas aereas de inmuebles, maquetas o conjuntos de producto.
- Integracion en flujos ComfyUI o en la plataforma RunningHub: el adaptador se carga como un nodo LoRA adicional sobre el modelo base, de modo que se puede encadenar con el resto del pipeline de generacion ya existente.
- Automatizacion via API: RunningHub ofrece API y entrenamiento en su plataforma, lo que permite invocar el flujo con el LoRA de forma programatica en lugar de manualmente.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

La model card no incluye metricas objetivas (FID, CLIP score, similitud de prompt, evaluacion humana) ni comparaciones cuantitativas con otros adaptadores de control de camara. Tampoco se aportan ejemplos de imagen generada ni semillas de reproduccion en el material proporcionado.

## Requisitos de hardware

- VRAM para el adaptador: el LoRA en si ocupa 83 MiB en disco, por lo que su coste de memoria es despreciable frente al modelo base.
- VRAM para el modelo base: no hay cifras publicadas. Como referencia aritmetica no confirmada por el autor, un modelo de 9 000 millones de parametros en bf16/fp16 requiere aproximadamente 18 GB solo para los pesos, a los que hay que sumar activaciones y memoria del codificador de texto y del VAE del pipeline completo.
- Cuantizaciones del modelo base: el autor no documenta cuantizaciones compatibles. En el ecosistema de difusion es habitual encontrar versiones en fp8 y en GGUF (Q8, Q6, Q5, Q4), que reducirian el peso de los pesos a rangos aproximados de 9 GB (fp8/Q8) y 5-7 GB (Q4/Q5); estos valores son estimaciones genericas y no estan confirmados para Flux2-Klein-9B.
- GPU recomendadas: no disponible. Como criterio orientativo, un modelo de 9B en precision completa encaja comodamente en A100 40 GB, H100 80 GB y L40S 48 GB; en GPU de consumo con 24 GB (RTX 4090, RTX 3090) seria viable en bf16 con margen ajustado, y en tarjetas de 12-16 GB requeriria cuantizacion del modelo base.
- Despliegue: el autor indica explicitamente ComfyUI, RunningHub y Hugging Face como plataformas de carga. No se mencionan vLLM, TGI, llama.cpp ni Ollama, que ademas no son aplicables a un pipeline de difusion de imagen.
- Latencia y throughput: no disponibles. No se publican tiempos de inferencia, numero de pasos de muestreo recomendado, resoluciones soportadas ni rendimiento en imagenes por segundo.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto / resolucion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| rh-klein-lora | LoRA de control de camara sobre Flux2-Klein-9B | no disponible (adaptador de 83 MiB) | no disponible | no disponible | Hugging Face, RunningHub |
| Flux2-Klein-9B (modelo base) | Modelo de difusion text-to-image | 9 000 millones (segun el nombre del modelo base) | no disponible | la del proyecto upstream, no especificada aqui | referenciado como origen del ajuste |
| Otros LoRA de control de camara | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de informacion sobre adaptadores alternativos de control de camara, ni de datos de rendimiento comparado entre este LoRA y cualquier otra opcion. La unica comparacion documentada es la que vincula el adaptador con su modelo base, Flux2-Klein-9B, del que no se detallan parametros, licencia ni resultados.

## Limitaciones y advertencias

- Sesgos conocidos: no se documenta ninguna evaluacion de sesgos. Al ser un ajuste sobre un modelo base de generacion de imagen, hereda los sesgos de representacion de ese modelo, que no se detallan en la informacion disponible.
- Riesgo de alucinacion: en generacion de imagen el equivalente es la deriva semantica, es decir, que la imagen no respete el prompt. No hay evaluacion publicada de fidelidad al prompt ni de consistencia de las etiquetas de camara.
- Ambito de las etiquetas: la lista de terminos de camara esta documentada en chino e ingles. El uso de traducciones distintas o de formulaciones libres puede reducir o anular el efecto del adaptador, ya que no se ha verificado su comportamiento fuera de esas etiquetas.
- Limitacion de contexto: no aplica una ventana de contexto al uso; si es relevante que no se documenta el limite de longitud de prompt del modelo base.
- Licencia: no disponible. La model card indica que el copyright permanece en el autor y que debe seguirse la licencia del proyecto original o upstream. Antes de cualquier uso comercial es obligatorio verificar la licencia de Flux2-Klein-9B y la del propio adaptador, que no se especifica.
- Trazabilidad: el repositorio no incluye ejemplos, semillas, configuracion de muestreo ni ficha tecnica de entrenamiento, lo que dificulta reproducir resultados.
- Madurez: el repositorio registra 0 descargas y 0 "likes" en el momento de la consulta, y fue creado y actualizado el mismo dia (9 de octubre de 2026), lo que indica ausencia de validacion por parte de la comunidad.
- Naturaleza del artefacto: es un adaptador, no un modelo autonomo. No puede ejecutarse sin el modelo base Flux2-Klein-9B, cuya disponibilidad y condiciones de uso son un requisito previo.
- Material promocional: la model card incluye enlaces con parametros de seguimiento hacia la plataforma comercial del autor y una referencia a un modelo distinto (Seedance 2.5) en la seccion de API; conviene tratarlos como contenido promocional y no como documentacion tecnica.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/RunningHubAI/rh-klein-lora
- Model card en chino (referenciada en el README): README_cn.md dentro del repositorio
- Proyecto original en RunningHub: https://www.runninghub.cn/model/public/2034461436289753089
- Pagina del autor en RunningHub: https://www.runninghub.cn/user-center/1943598742899462146
- Plataforma RunningHub (internacional): https://www.runninghub.ai
- Plataforma RunningHub (China): https://www.runninghub.cn
- Documentacion de la API (chino): https://www.runninghub.cn/runninghub-api-doc-cn/
- Documentacion de la API (ingles): https://www.runninghub.cn/runninghub-api-doc-en/
- Detalle de la API de llamada: https://www.runninghub.ai/call-api?utm_source=huggingface&utm_medium=badge&utm_campaign=api_promotion&utm_content=rh-2034461436289753089
- Entrenamiento de modelos en RunningHub: https://www.runninghub.ai/page-model
- API de Seedance 2.5 (enlace relacionado del autor): https://www.runninghub.ai/call-api/api-detail/2133100000000700025
- Paper, blog o demo tecnico: no disponible
