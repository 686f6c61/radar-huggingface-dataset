# ausboss/Qwen-Image-2.1-Restore-LoRA

## Resumen

Qwen-Image-2.1-Restore-LoRA es un adaptador LoRA de bajo rango (rank 32) creado por el usuario ausboss sobre el modelo base Qwen/Qwen-Image-2.1, un modelo de difusion para edicion y generacion de imagenes. El adaptador resuelve un problema concreto y bien delimitado: cuando Qwen Image 2.1 reescala por si solo una foto pequena, comprimida o antigua, tiende a sobreactuar en el detalle, anadiendo poros, pecas, arrugas y texturas que no estaban en la imagen original, ademas de desplazar ligeramente la composicion. Este LoRA suaviza ese comportamiento sin renunciar al detalle.

El adaptador se entreno con ai-toolkit y se distribuye en formato safetensors con claves compatibles con ComfyUI, en dos checkpoints (paso 1.250 y paso 1.500). No requiere palabra de activacion y se controla mediante un unico parametro de fuerza que actua como regulador entre fidelidad al original y textura generada por el modelo base. Segun las mediciones del autor, a fuerza 1.0 el resultado queda a unos 0,3 px del original de referencia, frente a mas de 2 px sin el LoRA.

Es relevante ahora porque el flujo tipico de restauracion y reescalado con modelos de difusion de gran tamano sufre de sobre-generacion de detalle plausible pero falso, algo critico en fotografia de personas y en archivo historico. El LoRA no convierte el proceso en una recuperacion real: sigue siendo un redibujado, pero con menos invencion y mayor adherencia a la imagen de entrada. El repo ocupa 0,3 GB y no presenta datos de benchmarks estandar de texto o codigo, ya que la tarea es exclusivamente image-to-image.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (adaptador de bajo rango) sobre Qwen Image 2.1; rank 32 |
| Parametros totales | no disponible (repo de 0,3 GB con dos ficheros safetensors) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible (modelo de imagen; no aplica contexto de texto) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | qwen-research-license (campo `license: other`) |
| Formato de pesos | safetensors con formato de claves de ComfyUI |
| Modelo base | Qwen/Qwen-Image-2.1 |
| Pipeline | image-to-image |
| Fuerza recomendada | 1.0 (imagen enfocada); 0.75 (mas textura del base); 0.5 (foto borrosa) |
| Palabra de activacion | ninguna |

## Arquitectura y entrenamiento

El adaptador es un LoRA de rango 32 entrenado sobre los pesos Comfy-Org de Qwen Image 2.1 mediante ai-toolkit. Se engancha al modelo base sin modificar su arquitectura de difusion: solo anade matrices de bajo rango que ajustan el comportamiento del modelo durante el proceso de denoising. Se publican dos checkpoints, correspondientes a los pasos 1.250 y 1.500 de entrenamiento, ambos en safetensors con el formato de claves que espera ComfyUI.

El entrenamiento se construyo a partir de pares de imagenes generados por el propio autor: tomo fotografias propias, las redujo de tamano y las guardo con compresion JPEG (calidad 70, lado largo de 512 o 560 px), usando la version a tamano completo como referencia de comparacion. El objetivo del entrenamiento era penalizar la invencion de detalle y premiar la fidelidad de composicion, color y rasgos faciales respecto a la imagen original reducida. No se documenta en la informacion disponible el uso de RLHF, DPO ni tecnicas de alineacion adicionales, ni el volumen exacto de pares de entrenamiento; el autor cita pruebas sobre 37 imagenes, 29 imagenes adicionales y 26 fotos reales de baja resolucion, pero no especifica cuantas se usaron para entrenar y cuantas quedaron fuera.

## Capacidades

- Restauracion y reescalado de fotografias pequenas o comprimidas, suavizando la sobre-generacion de textura del modelo base.
- Eliminacion de desenfoque, ruido y artefactos de compresion, con recuperacion de detalle nitido y natural.
- Tratamiento especifico de impresiones antiguas: retirada de rayones, polvo, granulacion y decoloracion, con recuperacion de color y detalle.
- Control de fidelidad mediante el parametro de fuerza (0.25, 0.5, 0.75, 1.0), que regula el equilibrio entre adherencia al original y textura generada.
- Mejora de la precision de composicion: el autor mide una desviacion de aproximadamente 0,3 px respecto al original a fuerza 1.0, frente a mas de 2 px sin el adaptador.
- Conservacion de rasgos faciales: el autor reporta una coincidencia facial de 0,94 a fuerzas 1.0 y 0.75, y de 0.91 a 0.5.
- Integracion con Viggle Turbo a 8 pasos, y funcionamiento tambien a 25 pasos sin Turbo (resultado algo mas fiel y suave).
- Escalado por teselas por encima de 2 megapixeles usando el flujo de trabajo de tiled upscale del mismo autor.
- No se documentan capacidades de tool calling, agentes, vision general, audio ni texto, ya que la tarea es exclusivamente de edicion de imagen.

## Casos de uso

- Restauracion de fotografia personal antigua: se introducen copias escaneadas o digitalizaciones de baja resolucion, se pide la restauracion con el prompt de foto antigua y se obtiene una version sin rayones ni decoloracion, con mejor control del color que el modelo base solo.
- Recuperacion de imagenes de archivo historico: permite procesar lotes de impresiones deterioradas manteniendo la composicion y los rasgos de los retratados, con la salvedad de que el detalle fino se redibuja y no se recupera.
- Mejora de fotos de movil y autofotos de baja calidad: el autor probo 26 fotos reales de baja resolucion; las seis mas borrosas mejoran ajustando la fuerza a 0.5, mientras que las enfocadas funcionan bien a 1.0.
- Post-procesado de fotogramas de video: al ser fotogramas potencialmente borrosos, el propio autor recomienda bajar la fuerza a 0.5 para no devolver un resultado excesivamente suave.
- Preparacion de material para impresion o ampliacion: el flujo de teselas del autor permite llevar imagenes por encima de 2 megapixeles y hasta unos 8 megapixeles manteniendo la nitidez.
- Edicion de retrato con fidelidad de identidad: util en produccion fotografica donde interesa que la piel y los rasgos permanezcan fieles a la persona, evitando poros y arrugas inventados.
- Limpieza de catalogos de producto o stock fotografico: reduce artefactos de compresion y ruido en imagenes pequenas sin alterar la composicion ni los colores.
- Integracion en flujos de ComfyUI: el formato de claves es directamente compatible, lo que facilita insertarlo en pipelines de edicion por lotes gestionados por nodos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible; no aplican a un modelo de imagen. El autor si publica mediciones propias de fidelidad frente a la imagen original a tamano completo:

| Metrica | Sin LoRA | LoRA 1.0 | LoRA 0.75 | LoRA 0.5 |
|---|---|---|---|---|
| Desviacion respecto al original (px) | mas de 2,0 | 0,3 | 0,4 (29 imagenes) | 1,3 frente a 2,2 sin LoRA |
| Coincidencia facial | no disponible | 0,94 | 0,94 | 0,91 |
| Desviacion de color y brillo en impresiones antiguas | 15 % antes de restaurar | 7 % con prompt normal; 4 % con prompt de foto antigua | no disponible | no disponible |

Notas sobre las mediciones: la desviacion en px se midio sobre pares de imagenes que el autor redujo previamente; la prueba de impresiones antiguas se hizo sobre cuatro impresiones no vistas en entrenamiento; la prueba de borrosidad se hizo sobre 26 fotos reales de baja resolucion, donde las seis mas borrosas se comportaron mejor a fuerza 0.5. En un segundo ensayo con un tipo de decoloracion no visto durante el entrenamiento, los rayones se eliminaron pero el color desvaido permanecio. En tres imagenes redibujadas a 8 megapixeles por teselas, el resultado salio nitido con el LoRA a 1.0.

## Requisitos de hardware

- El LoRA en si anade un coste de VRAM despreciable: el repo completo pesa 0,3 GB y contiene dos adaptadores de rango 32 que se cargan junto al modelo base.
- El requisito real de VRAM lo marca Qwen Image 2.1, cuyos pesos Comfy-Org son necesarios; no se especifican cifras de VRAM en la informacion disponible.
- GPU concretas recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no disponible, depende del modelo base y de la cuantizacion empleada.
- Opciones de despliegue: ComfyUI (formato de claves nativo). El autor lo usa con Viggle Turbo a 8 pasos y tambien con 25 pasos sin Turbo.
- Latencia y throughput: no disponible. El unico dato indirecto es el numero de pasos de muestreo (8 con Turbo, 25 sin Turbo).
- Para resultados por encima de 2 megapixeles, el autor proporciona un flujo de tiled upscale que reparte el trabajo en teselas; esto condiciona el consumo de memoria y el tiempo de inferencia.
- Los pesos base y el adaptador se cargan de forma independiente, por lo que el requisito de entrada es una imagen preescalada a aproximadamente 2 megapixeles con ambos lados divisibles por 32.

## Comparativa con modelos similares

Los datos de comparacion directa con alternativas de la misma categoria no estan disponibles. La tabla recoge los modelos relacionados encontrados en la busqueda, con la informacion disponible:

| Modelo | Tipo | Proposito | Licencia | Datos comparativos |
|---|---|---|---|---|
| ausboss/Qwen-Image-2.1-Restore-LoRA | LoRA rank 32 sobre Qwen Image 2.1 | Restauracion y reescalado fiel | qwen-research-license | referencia |
| Viggle/Qwen-Image-2.1-viggle-turbo | Adaptador de aceleracion sobre Qwen Image 2.1 | Reducir pasos de muestreo (8 pasos) | no disponible | no disponible |
| ausboss/Qwen-Image-2.1-Outfit-Swap-Consistency-LoRA | LoRA sobre Qwen Image 2.1 | Consistencia en cambio de ropa | no disponible | no disponible |
| Comfy-Org/Qwen-Image_ComfyUI | Pesos base empaquetados para ComfyUI | Modelo base de imagen | no disponible | no disponible |

No se dispone de resultados de benchmarks publicados que permitan comparar de forma cuantitativa este LoRA con otras alternativas de restauracion.

## Limitaciones y advertencias

- Es un redibujado, no una recuperacion: el detalle fino se genera de forma sintetica para encajar con la imagen, no se recupera informacion real que se haya perdido.
- Fotos borrosas: a fuerza 1.0 el resultado puede devolverse demasiado suave, ya que el adaptador respeta el desenfoque de la entrada. El autor recomienda bajar a 0.5 en imagenes desenfocadas, con movimiento o fotogramas de video.
- Tipos de decoloracion no vistos durante el entrenamiento pueden permanecer en la salida, aunque se eliminen rayones y polvo.
- La fidelidad de color en impresiones antiguas mejora con un prompt especifico (4 % de desviacion) frente al prompt normal de restauracion (7 %), lo que implica ajustar la instruccion segun el caso.
- Se recomienda preescalar la entrada a unos 2 megapixeles con ambos lados divisibles por 32; no respetar esta condicion puede degradar el resultado.
- Licencia qwen-research-license: conviene revisar los terminos completos antes de cualquier uso comercial, ya que no es una licencia permisiva estandar y la propia politica de Qwen suele restringir el uso comercial del modelo base.
- No hay palabra de activacion, por lo que el adaptador se aplica siempre que este cargado; controlarlo mal puede alterar el resultado en imagenes que no necesitan restauracion.
- Riesgo de sesgo: no se documentan evaluaciones de sesgo demografico, etnico o de genero. Al trabajar sobre rostros, existe riesgo de alterar rasgos de identidad de forma no controlada.
- Riesgo de alucinacion de textura: aunque el LoRA lo reduce respecto a Qwen Image 2.1 sin adaptador, no lo elimina por completo.
- Datos muy limitados del ciclo de vida: el repo tiene pocas interacciones registradas en HuggingFace (0 descargas y 14 me gusta en la fecha consultada) y no se documentan actualizaciones posteriores a octubre de 2026.

## Enlaces

- Pagina del modelo en HuggingFace: https://huggingface.co/ausboss/Qwen-Image-2.1-Restore-LoRA
- Modelo base Qwen Image 2.1: https://huggingface.co/Qwen/Qwen-Image-2.1
- Adaptador Viggle Turbo para Qwen Image 2.1: https://huggingface.co/Viggle/Qwen-Image-2.1-viggle-turbo
- Pagina del LoRA en Civitai: https://civitai.com/models/2989697/qwen-image-21-restore-lora
- Flujo de trabajo de tiled upscale del autor en Civitai: https://civitai.com/models/2988629/qwen-image-21-tiled-upscale
- Pesos base empaquetados para ComfyUI: https://huggingface.co/Comfy-Org/Qwen-Image_ComfyUI
- Articulo de analisis en ArtRealmAI: https://artrealmai.com/article/qwen-image-2-1-restore-lora-photo-upscale
