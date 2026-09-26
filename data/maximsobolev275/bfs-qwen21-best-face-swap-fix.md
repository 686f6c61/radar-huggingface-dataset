# maximsobolev275/BFS-Qwen21-Best-Face-Swap-Fix

## Resumen

BFS-Qwen21-Best-Face-Swap-Fix es un repositorio de adaptadores LoRA derivados de Alissonerdx/BFS-Best-Face-Swap, publicado por el usuario maximsobolev275. El objetivo declarado no es mejorar la identidad del face swap, sino corregir un defecto concreto del LoRA original: la perdida de textura fina y el aspecto "plastificado" o "jabonoso" que aparece en las zonas de piel al aplicar el adaptador. Para ello el autor aplica dos tecnicas de compresion sobre los pesos del LoRA original: poda del 20 % de las capas con pesos mas debiles y enmascaramiento estocastico tipo DARE sin reescalado de magnitud (densidades 0,50 y 0,60).

El repositorio incluye tres variantes en formato safetensors con rangos medios cercanos a 26-30, cada una con un compromiso distinto entre nitidez y fidelidad al rostro de referencia. El autor documenta el procedimiento de forma explicita y acompania rejillas comparativas cualitativas sobre cuatro semillas (seed 0 a 3) frente al modelo base sin LoRA y al LoRA original.

Es relevante ahora porque los flujos de face swap en ComfyUI dependen en gran medida de LoRAs de la comunidad que no siempre documentan su degradacion, y este repositorio propone una receta reproducible de posprocesado de pesos (poda + DARE) para recuperar detalle sin reentrenar. Como contrapartida, el repositorio no publica benchmarks numericos, no especifica el modelo de difusion base sobre el que se aplica el LoRA y no tiene descargas ni valoraciones registradas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (bajo rango) para un modelo base de generacion de imagenes no especificado en la model card |
| Parametros totales | no disponible (repositorio de 0,4 GB con tres ficheros de pesos) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (modelo de generacion de imagenes; no hay ventana de contexto de texto) |
| Tipos de cuantizacion | no disponible (se distribuyen pesos safetensors sin cuantizar; las variantes son el resultado de poda del 20 % y enmascaramiento DARE) |
| Idiomas soportados | no disponible (depende del modelo base de difusion y del encoder de texto asociado) |
| Licencia | MIT |
| Formato de pesos | safetensors (tres variantes) |
| Modelo base | Alissonerdx/BFS-Best-Face-Swap |
| Tamano del repositorio | 0,4 GB |
| Descargas / likes | 0 / 0 |
| Fecha de creacion / actualizacion | 2026-09-25 / 2026-09-25 |

Variantes incluidas:

| Fichero | Poda y enmascaramiento | Descripcion declarada |
|---|---|---|
| `bfs_dare60-avgrank30.safetensors` | Drop mask densidad 0,60 sin reescalado, rank medio 30 | Limpieza suave; conserva la identidad con fuerza y reduce el desenfoque original |
| `bfs_prune20_dare50-avgrank26.safetensors` | Poda 20 % + drop mask densidad 0,50 sin reescalado, rank medio 26 | Maxima recuperacion de detalle y nitidez; texturas de piel y ojos mas definidos |
| `bfs_prune20_dare60-avgrank30.safetensors` | Poda 20 % + drop mask densidad 0,60 sin reescalado, rank medio 30 | Perfil equilibrado; elimina el desenfoque manteniendo la identidad cercana al original |

## Arquitectura y entrenamiento

No se trata de un modelo completo sino de un adaptador LoRA (Low-Rank Adaptation) que se aplica sobre Alissonerdx/BFS-Best-Face-Swap. La model card no detalla la arquitectura del modelo base de difusion ni el encoder de texto asociado, por lo que no es posible determinar el numero de parametros del backbone, la dimension de las matrices LoRA ni el rango por capa mas alla del "rank medio" declarado (26 o 30 segun la variante). El nombre del repositorio incluye la cadena "Qwen21", que no aparece en ningun momento en el contenido de la model card; se desconoce si responde a un error de nombrado o a un detalle no documentado.

El proceso de optimizacion es el unico elemento tecnico documentado y consta de dos operaciones sobre los pesos del LoRA original. Primero, una poda del 20 % que elimina las capas de pesos mas debiles o ruidosas, descritas por el autor como causantes de deriva del modelo y degradacion de textura. Segundo, un enmascaramiento estocastico tipo DARE (Drop And REscale) con densidad de 0,50 o 0,60 aplicado sin el paso de reescalado de magnitud. La justificacion que da el autor es que omitir el reescalado evita la amplificacion artificial de pesos y elimina el aspecto "jabonoso" manteniendo la estructura facial. No se menciona ningun tipo de entrenamiento adicional, RLHF, DPO ni ajuste fino con datos nuevos; el repositorio es un posprocesado de pesos, no un reentrenamiento.

## Capacidades

- Transferencia de identidad facial (face swap) sobre un modelo base de difusion, heredando la funcionalidad del LoRA original BFS-Best-Face-Swap.
- Reduccion del desenfoque y de la perdida de textura fina en piel, ojos y otros detalles de alta frecuencia respecto al LoRA original, segun las comparaciones visuales del autor.
- Conservacion de la identidad del rostro de referencia, con tres niveles de compromiso entre nitidez e identidad segun la variante elegida.
- Integracion en flujos de ComfyUI mediante carga de LoRA (el tag `comfyui` aparece explicitamente en el repositorio).
- No se documenta soporte de tool calling, function calling, agentes, razonamiento multi-paso, modo thinking, audio ni vision mas alla de la propia tarea de generacion de imagen.
- Capacidades multilingues: no disponibles; dependen del encoder de texto del modelo base, no documentado.

## Casos de uso

- Posproduccion audiovisual con sustitucion de rostros: el adaptador se puede insertar en un pipeline de difusion ya existente para reemplazar al LoRA BFS original y recuperar detalle de piel y ojos en primeros planos, donde el aspecto plastificado resulta mas evidente.
- Flujos de ComfyUI ya montados con BFS: al compartir modelo base, el fichero safetensors funciona como sustitucion directa del LoRA original sin rehacer el grafo, lo que reduce el coste de migracion a cambiar una ruta de fichero.
- Generacion de avatares para marketing y contenido digital: la variante `bfs_prune20_dare50-avgrank26.safetensors` esta orientada a maxima nitidez, util cuando el resultado se va a usar en materiales promocionales con inspeccion cercana.
- Pruebas de concepto de identidad consistente en ilustracion y comic: la variante equilibrada `bfs_prune20_dare60-avgrank30.safetensors` permite mantener un personaje reconocible entre ilustraciones sin arrastrar el desenfoque del adaptador original.
- Probadores virtuales y visualizacion de productos: en escenarios donde se sustituye el rostro de una modelo manteniendo cuerpo y encuadre de la referencia (`ref_body.png`), la mejora de textura reduce el retoque manual posterior.
- Investigacion en compresion de adaptadores: el repositorio sirve como caso practico reproducible de poda al 20 % combinada con DARE sin reescalado, util para estudiar el efecto de estas tecnicas sobre la fidelidad de un LoRA de identidad.
- Prototipado rapido sobre un modelo base de difusion no especificado: al ser un adaptador ligero (repositorio de 0,4 GB), permite iterar variantes de estilizado facial sin coste de reentrenamiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks numericos en la informacion disponible. El autor solo aporta comparaciones visuales cualitativas sobre cuatro semillas, estructuradas en rejillas de tres columnas: modelo base sin LoRA, LoRA BFS original y variantes optimizadas.

| Evidencia cualitativa | Contenido | Metrica numerica |
|---|---|---|
| `seed.png` (seed 0) | Rejilla comparativa base / BFS original / variantes optimizadas | no disponible |
| `seed1.png` (seed 1) | Rejilla comparativa base / BFS original / variantes optimizadas | no disponible |
| `seed2.png` (seed 2) | Rejilla comparativa base / BFS original / variantes optimizadas | no disponible |
| `seed3.png` (seed 3) | Rejilla comparativa base / BFS original / variantes optimizadas | no disponible |

No hay valores de MMLU, HumanEval, GSM8K ni de metricas de identidad facial como FID, LPIPS, CLIP-I o similitud de embedding facial, que serian las apropiadas para esta categoria de modelo.

## Requisitos de hardware

- El repositorio pesa 0,4 GB en total y contiene tres ficheros safetensors; el coste de almacenamiento del adaptador es despreciable frente al del modelo base.
- La VRAM necesaria para inferencia la determina integramente el modelo base de difusion, que la model card no especifica. Como referencia orientativa y no procedente de la model card, los pipelines de difusion para generacion de imagenes suelen requerir entre 8 y 12 GB en precision fp16 con optimizaciones para modelos tipo SDXL, y entre 16 y 24 GB para modelos de mayor tamano tipo Flux; estas cifras son estimaciones genericas, no datos publicados por el autor.
- Dado que el LoRA se carga junto al modelo base en memoria, el requisito adicional de VRAM del adaptador es marginal comparado con el del backbone.
- GPU recomendadas: no disponibles en la informacion proporcionada. Cualquier GPU capaz de ejecutar el modelo base de difusion correspondiente deberia poder cargar este adaptador.
- Cabe en GPU de consumo: no disponible de forma concluyente, depende del modelo base. El adaptador en si no es el factor limitante.
- Opciones de despliegue: ComfyUI esta confirmado por los tags del repositorio. Cualquier frontend o libreria que cargue LoRA en formato safetensors sobre el mismo modelo base deberia ser compatible, pero no se documenta ningun otro runtime concreto (diffusers, A1111, Forge, etc.).
- Latencia y throughput: no disponibles. No se publican mediciones de tiempo por imagen, pasos de muestreo ni comparativas de velocidad frente al LoRA original.

## Comparativa con modelos similares

| Modelo | Tipo | Tamano | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| BFS-Qwen21-Best-Face-Swap-Fix (este) | LoRA de face swap posprocesado (poda 20 % + DARE sin reescalado) | Repositorio de 0,4 GB, 3 variantes | No aplica | Solo comparativas visuales sobre 4 semillas | MIT | HuggingFace, 0 descargas |
| Alissonerdx/BFS-Best-Face-Swap | LoRA de face swap original | no disponible | No aplica | Referencia del autor; presenta desenfoque y textura plastificada segun la model card | no disponible en la informacion proporcionada | HuggingFace |
| Otros LoRA de face swap de la comunidad | no disponible | no disponible | No aplica | no disponible | no disponible | no disponible |

No se dispone de datos de benchmarks ni de especificaciones tecnicas de terceros que permitan una comparativa cuantitativa rigurosa.

## Limitaciones y advertencias

- La model card no especifica sobre que modelo base de difusion se aplica el LoRA. Usarlo con un backbone distinto del previsto puede degradar el resultado o directamente no funcionar.
- El nombre del repositorio incluye "Qwen21", una referencia que no aparece en la documentacion del modelo y que puede inducir a confusion sobre su naturaleza real.
- No hay benchmarks objetivos: toda la evidencia de mejora es visual y aportada por el propio autor, sin metricas de similitud de identidad ni de calidad de imagen.
- La poda del 20 % y el enmascaramiento DARE eliminan pesos de forma irreversible; es esperable una perdida de fidelidad de identidad en segun que rostros, encuadres o condiciones de iluminacion, aunque no se cuantifica.
- La variante `bfs_prune20_dare50-avgrank26.safetensors` prioriza nitidez sobre identidad, por lo que en casos de rostros muy distintos a la referencia puede alejarse del parecido original.
- Repositorio con 0 descargas y 0 valoraciones: no existe validacion independiente por parte de la comunidad.
- No se documenta la composicion de datos de entrenamiento del LoRA original, por lo que se heredan los sesgos demograficos, etnicos y de edad de ese adaptador.
- El face swap con rostros reales plantea riesgos graves de suplantacion de identidad, desinformacion y tratamiento de datos biometricos. En el ambito de la UE, el uso de tecnicas de sustitucion de rostro sobre personas identificables esta sujeto al RGPD y, en determinados contextos, al Reglamento de IA. Se requiere consentimiento explicito de la persona cuya imagen se utiliza.
- La licencia MIT del repositorio permite uso comercial y modificacion del adaptador, pero no cubre las condiciones del modelo base ni del LoRA original, cuya licencia no se detalla en la informacion disponible. Conviene verificar ambas antes de un despliegue en produccion.
- Al ser una modificacion de pesos y no un modelo entrenado, no incorpora ninguna salvaguarda adicional frente a usos indebidos.
- No se documentan limitaciones idiomaticas ni de resolucion de imagen; estas dependen por completo del pipeline en el que se inserte.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/maximsobolev275/BFS-Qwen21-Best-Face-Swap-Fix
- Modelo y LoRA base: https://huggingface.co/Alissonerdx/BFS-Best-Face-Swap
- Fichero `bfs_dare60-avgrank30.safetensors`: https://huggingface.co/maximsobolev275/BFS-Qwen21-Best-Face-Swap-Fix/blob/main/bfs_dare60-avgrank30.safetensors
- Fichero `bfs_prune20_dare50-avgrank26.safetensors`: https://huggingface.co/maximsobolev275/BFS-Qwen21-Best-Face-Swap-Fix/blob/main/bfs_prune20_dare50-avgrank26.safetensors
- Fichero `bfs_prune20_dare60-avgrank30.safetensors`: https://huggingface.co/maximsobolev275/BFS-Qwen21-Best-Face-Swap-Fix/blob/main/bfs_prune20_dare60-avgrank30.safetensors
- Imagenes de comparacion: `seed.png`, `seed1.png`, `seed2.png`, `seed3.png` en la raiz del repositorio
- Imagenes de referencia: `ref_head.png`, `ref_body.png` en la raiz del repositorio
- Paper o blog tecnico del autor: no disponible
- Repositorio de codigo o demo adicional: no disponible
