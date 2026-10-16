# ausboss/FLUX-3-Image-Klein-Consistency-LoRA

## Resumen

FLUX-3-Image-Klein-Consistency-LoRA es un adaptador LoRA de rango 32 (161 MB en safetensors) desarrollado por el usuario ausboss sobre el modelo de difusión FLUX 3 Image Klein Base de Black Forest Labs. Su propósito es concreto: las ediciones de FLUX 3 Image Klein tienden a desplazar el encuadre original, sobre todo en restilizados (acuarela, anime, etc.), devolviendo la escena algo más amplia o desplazada lateralmente. Este LoRA fuerza a que la edición se mantenga en el marco de la imagen de origen, sin palabra de activación ni cambios en el flujo de trabajo habitual.

No es un modelo completo ni un modelo de lenguaje: es un adaptador de edición de imagen (pipeline image-to-image) pensado para cargarse encima de los ficheros de FLUX 3 Image Klein en ComfyUI 0.41 o superior. El autor lo publica como versión temprana y solo ligeramente probada, con resultados mixtos en la evaluación que él mismo realizó: mejora en clima e iluminación, empeora en color de pelo y pose, y reduce aproximadamente a la mitad el desplazamiento en restilizados (de 25,8 px de mediana a 12,4 px), sin eliminarlo por completo.

El interés actual del adaptador está en que ataca un problema de control geométrico que aparece en cualquier pipeline de edición por difusión cuando se pide un cambio de estilo global. Para equipos que generan variaciones controladas de una misma imagen (catálogo, storyboard, contenido editorial), un LoRA de consistencia evita reprocesar el encuadre y simplifica la composición por capas. Su licencia es la FLUX Kommunity License v1.0, heredada del modelo base, sin términos adicionales del autor.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (rank 32, alpha 32) sobre un transformer de difusión FLUX 3 Image Klein Base |
| Parametros totales | No disponible (adaptador de 161 MB; los parametros del modelo base no se detallan) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No aplica (modelo de imagen, no de texto) |
| Tipos de cuantizacion | No disponible para el adaptador; el entrenamiento se hizo en BF16 sin cuantizacion sobre el modelo base |
| Idiomas soportados | No disponible (las instrucciones de edicion se escriben en lenguaje natural; el autor solo documenta ejemplos en ingles) |
| Licencia | flux-kommunity-license (FLUX Kommunity License v1.0), sin terminos adicionales del autor |
| Formato de pesos | safetensors (`flux-3-image-klein-consistency.safetensors`) |

Datos adicionales del adaptador: rango 32, alpha 32, 161 MB, paso 3.000 de una ejecución de 3.000 pasos, fichero único. El repositorio ocupa 0,2 GB. Fecha de creacion: 2026-10-16. Descargas y likes registrados: 0.

## Arquitectura y entrenamiento

El adaptador se entrena con `ostris/ai-toolkit` usando `arch: flux3`, sobre FLUX 3 Image Klein Base en BF16 y sin cuantización. Hiperparámetros documentados: rango 32, alpha 32, optimizador AdamW de 8 bits, tasa de aprendizaje constante de 1e-4, batch de 1, 3.000 pasos con checkpoint cada 250, buckets de resolución de 1408 px, `caption dropout` de 0, sin volteos horizontales y marcas de tiempo con `shift`. El coste de entrenamiento fue de aproximadamente 1 hora y 45 minutos en una única RTX PRO 6000.

El conjunto de datos son 778 pares derivados de 389 ediciones sobre 231 imágenes, las mismas imágenes y las mismas instrucciones de edición que el autor usó en su Qwen Image 2.1 Consistency LoRA, con algunas exclusiones. La diferencia clave es que aquí todas las ediciones fueron generadas por el propio FLUX 3 Image Klein: recoloreados, recambios de iluminación, conversiones a pintura, estaciones del año, conjuntos de ropa, pelo, accesorios, estilos anime/3D/cómic, estilos fotográficos, objetos y fondos.

La innovación técnica es la preparación de los pares. Cada edición se realineó con su imagen original para que el destino quede sobre el marco de la fuente, y cada edición genera un par directo (imagen a edición) y un par inverso (edición a imagen). En las ediciones locales se conservan los píxeles originales fuera de la zona modificada. Los pares que seguían desalineados tras la corrección se descartaron. Las leyendas de entrenamiento son las propias instrucciones de edición, de modo que no hay palabra de activación y el modelo aprende la instrucción como texto libre.

## Capacidades

- Edición de imagen a imagen manteniendo el encuadre original, con especial efecto en restilizados globales (pintura, anime, cómic, estilos fotográficos).
- Ediciones locales que preservan los píxeles originales fuera de la región modificada: color de pelo, ropa, accesorios, objetos, fondos.
- Recambios de iluminación y de condiciones meteorológicas sobre la misma escena.
- Cambios de estación del año y de paleta cromática sobre una fotografía existente.
- Cambios de vestuario y de aspecto sin desplazamiento medible del encuadre (según la comprobación del autor, entre 0,2 y 0,5 px con y sin el adaptador).
- Pares reversibles: al haberse entrenado con pares inversos, el adaptador está expuesto a deshacer una edición además de aplicarla.
- Sin palabra de activación: se carga en ComfyUI y se escribe la edición como de costumbre.
- Compatibilidad declarada con el modelo destilado de FLUX 3 Image Klein a fuerza 1.0, 16 pasos, CFG 1, muestreador `euler` y `simple`.
- No dispone de tool calling, agentes, razonamiento multi-paso, visión descriptiva ni audio: es un adaptador de generación de imagen.

## Casos de uso

- Restilizado editorial sin recorte: convertir una fotografía en versión acuarela, anime o cómic manteniendo el encuadre, lo que permite montar la versión estilizada sobre la maquetación original sin recalcular recortes ni reposicionar elementos.
- Catálogo de producto con recolor controlado: cambiar el color de una prenda o de un accesorio conservando el resto de la escena pixel a pixel, útil cuando el material de partida es una única sesión fotográfica y se necesitan variantes de color por referencia.
- Relighting para previsualización: generar versiones de una misma escena con luz de mañana, atardecer o noche, manteniendo la geometría, para presentar opciones de dirección de fotografía antes de un rodaje.
- Variaciones estacionales de escaparate o paisaje: producir la misma localización en primavera, otoño o invierno a partir de una sola captura, aprovechable en campañas segmentadas por temporada.
- Conversión de estilo por lotes en ComfyUI: al no requerir palabra de activación y ser un LoRA de 161 MB, se puede encadenar en un grafo con el nodo de referencia multi-latente y procesar una carpeta completa de imágenes con instrucciones distintas por fichero.
- Reversión de una edición previa: gracias a los pares inversos del entrenamiento, el adaptador puede aplicarse para devolver una imagen editada a una versión más cercana al original conservando el marco, útil en control de versiones de arte.
- Aumento de datos para entrenamiento: generar pares imagen-edición alineados de forma automática, ya que la propiedad de consistencia reduce el trabajo de registro y recorte posterior.
- Storyboard y animática: obtener variantes de vestuario, pelo o iluminación sobre los mismos planos sin que el encuadre se desplace entre viñetas.

## Benchmarks y rendimiento

El autor publica dos comprobaciones propias. La primera es una evaluación ciega sobre 15 ediciones cotidianas (clima, luz, ropa, conjuntos, color de pelo, poses, dos personas): frente a FLUX 3 Image Klein sin el LoRA, el adaptador fue mejor en 4 casos, peor en 5 e igual en 6, con mejora en clima e iluminación y empeoramiento en color de pelo y pose. La segunda es una comprobación automatizada sobre 9 ediciones de imágenes fuera del conjunto de entrenamiento (6 restilizados y 3 cambios de ropa), una semilla por caso, midiendo el desplazamiento máximo en la peor esquina:

| Metrica | FLUX 3 Image Klein sin LoRA | Con el LoRA |
|---|---|---|
| Restilizados: desplazamiento, mediana | 25,8 px | 12,4 px |
| Restilizados: desplazamiento, rango | 6,8 a 37,5 px | 2,8 a 18,5 px |
| Cambios de ropa: desplazamiento | 0,2 a 0,5 px | 0,2 a 0,5 px |

En las 9 ediciones se produjo el cambio solicitado en ambos casos. No hay benchmarks publicados de MMLU, HumanEval, GSM8K u otros, por tratarse de un modelo de imagen. No se dispone de resultados de FID, CLIP score, SSIM ni LPIPS en la informacion proporcionada.

## Requisitos de hardware

- El adaptador en sí ocupa 161 MB en disco y su coste de VRAM adicional es marginal frente al modelo base.
- La VRAM necesaria para inferencia viene determinada por FLUX 3 Image Klein Base, cuyos requisitos no se detallan en la información proporcionada: no disponible.
- Entrenamiento documentado: una sola RTX PRO 6000, aproximadamente 1 hora y 45 minutos para 3.000 pasos en BF16 sin cuantización.
- Compatibilidad con GPU de consumo: no disponible explícitamente; dependerá del modelo base y de su cuantización.
- Despliegue: ComfyUI 0.41 o superior (primera versión con soporte de FLUX 3), encadenando el nodo de referencia multi-latente con resolución `keep resolution` y un KSampler que arranque desde el latente devuelto por ese nodo.
- Ajustes recomendados por el autor: modelo destilado, fuerza 1.0, 16 pasos, CFG 1, `euler`/`simple`.
- Los ficheros de FLUX 3 Image Klein para ComfyUI se distribuyen en el repositorio oficial bajo aceptación de licencia.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Tipo | Base | Tamano | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| FLUX-3-Image-Klein-Consistency-LoRA | LoRA de consistencia de encuadre | FLUX 3 Image Klein Base | 161 MB, rank 32 | No aplica | FLUX Kommunity License v1.0 | HuggingFace, 0 descargas registradas |
| FLUX 3 Image Klein sin adaptador | Modelo de difusion completo | No aplica | No disponible | No aplica | FLUX Kommunity License v1.0 | Requiere aceptacion de licencia en HuggingFace |
| Qwen Image 2.1 Consistency LoRA | LoRA de consistencia de encuadre | Qwen Image 2.1 | No disponible | No aplica | No disponible | HuggingFace |
| FLUX-3-Image-Klein-Outpaint-LoRA | LoRA de extrapolacion de lienzo | FLUX 3 Image Klein Base | No disponible | No aplica | No disponible | HuggingFace |

La comparación con sentido es contra la versión sin adaptador, porque es la única para la que existen mediciones en la información disponible: el LoRA reduce el desplazamiento mediano en restilizados de 25,8 px a 12,4 px y no altera el comportamiento en cambios de ropa. Frente al Qwen Image 2.1 Consistency LoRA del mismo autor comparte método de construcción (pares realineados, pares directos e inversos), pero no se han publicado cifras comparativas entre ambos. La comparación con el Outpaint LoRA no procede en rendimiento, ya que resuelve una tarea distinta (extender el lienzo en lugar de fijar el encuadre).

## Limitaciones y advertencias

- Publicación temprana y solo ligeramente probada, según el propio autor: los ficheros se publican tal como salieron del entrenamiento.
- Rendimiento desigual por tipo de edición: mejora clima e iluminación, empeora color de pelo y pose, y el resultado en conjuntos de ropa es mixto (4 mejor, 5 peor, 6 igual sobre 15 ediciones).
- No elimina el desplazamiento en restilizados, solo lo reduce aproximadamente a la mitad: el rango medido sigue llegando a 18,5 px en la peor esquina.
- Base de evaluación muy reducida: 15 ediciones valoradas de forma ciega y 9 ediciones automatizadas con una única semilla, fuera de un protocolo estandarizado.
- No hay evaluación publicada de sesgos, de fidelidad de identidad facial ni de estabilidad entre semillas.
- Riesgo de alucinación visual inherente al modelo base: pueden aparecer detalles inventados en zonas no restringidas por la instrucción.
- El adaptador fue entrenado sobre el modelo base y el autor recomienda usarlo sobre el modelo destilado con parámetros concretos; desviarse de esos ajustes no está validado.
- Idiomas soportados no documentados; los ejemplos de instrucción están en inglés y no se ha verificado el comportamiento con instrucciones en castellano.
- Licencia FLUX Kommunity License v1.0, heredada sin términos adicionales: el uso comercial de las imágenes generadas depende de la sección 2 de dicha licencia y debe leerse antes de un despliegue en producción.
- Black Forest Labs no ha creado, respaldado ni aprobado este adaptador; se entrega tal cual, sin garantía ni responsabilidad (secciones 5 y 6 de la licencia).
- Se requiere la aceptación previa de la licencia para descargar los ficheros base de FLUX 3 Image Klein, por lo que el adaptador no es utilizable de forma aislada.
- Historial de adopción nulo en el momento de la consulta: 0 descargas y 0 likes, sin validación por parte de terceros.

## Enlaces

- Repositorio HuggingFace del LoRA: https://huggingface.co/ausboss/FLUX-3-Image-Klein-Consistency-LoRA
- Modelo base: https://huggingface.co/black-forest-labs/flux-3-image-klein-base
- Ficheros de FLUX 3 Image Klein para ComfyUI (requiere aceptar licencia): https://huggingface.co/black-forest-labs/flux-3-image-klein-comfy
- LoRA de consistencia previo del mismo autor, sobre Qwen Image 2.1: https://huggingface.co/ausboss/Qwen-Image-2.1-Consistency-LoRA
- LoRA de outpaint del mismo autor para el mismo modelo base: https://huggingface.co/ausboss/FLUX-3-Image-Klein-Outpaint-LoRA
- Flujo de trabajo Single & Multi-Image Edit en Civitai: https://civitai.com/models/3004026
- Herramienta de entrenamiento ai-toolkit: https://github.com/ostris/ai-toolkit
- Canal del autor con vídeos de uso: https://www.youtube.com/@ausbossdev
- Nota sobre la búsqueda web: los resultados devueltos por la búsqueda no guardan relación con el modelo (páginas de soporte de Google One, Google Account y Google Nest), por lo que no se incluye ninguno como enlace relevante. No se han encontrado papers, blogs ni demos adicionales sobre este adaptador.
