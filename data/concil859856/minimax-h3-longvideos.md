# concil859856/MiniMax-H3-Longvideos

## Resumen

H3-LongVideos es un nodo personalizado para ComfyUI publicado por el usuario concil859856 que actua como capa de orquestacion sobre MiniMax-H3, un modelo de generacion de video texto-a-video con audio sincronizado. MiniMax-H3 produce aproximadamente 15 segundos de video por generacion; este nodo convierte un texto escenico escrito en una cadena de planos (shots) y los une en un unico video continuo, manteniendo el audio generado por el modelo. El repositorio no contiene pesos: contiene el codigo del nodo y la documentacion de uso.

El problema que resuelve es la limitacion de duracion y de continuidad narrativa de los modelos de video generativo. En lugar de producir clips aislados, el nodo divide un guion en parrafos (cada parrafo es un plano), gestiona clausulas de continuidad, reparte el presupuesto de atencion entre la descripcion del plano y las instrucciones de coherencia, y encadena las salidas en un montaje final con imagen y audio. Incorpora ademas un sistema de ficha de personajes (character sheet) con pronombres y edades declaradas, y soporta imagenes de referencia mediante sockets `ref_image_N` etiquetados como `<Picture N>`.

Su relevancia es practica para flujos de trabajo de video generativo en local: aporta un modo de planificacion sin render (`plan_only`), un modo `verbatim` para aislar el prompt del usuario de las clausulas internas del nodo, y controles explicitos de sampler, scheduler y shift de video/audio. El nodo se declara en desarrollo constante, requiere ComfyUI 0.31 o superior con soporte nativo de MiniMax-H3 (probado en 0.33) y su licencia `h3-longvideos-no-redistribution` prohibe la redistribucion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (el nodo no define arquitectura; delega en MiniMax-H3) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no se describe un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (la model card menciona LoRA turbo/distill, no cuantizaciones de pesos) |
| Idiomas soportados | no disponible |
| Licencia | h3-longvideos-no-redistribution (`license: other`), fichero `LICENSE` en el repositorio |
| Formato de pesos | no disponible (el repositorio no aloja pesos; el nodo consume UNET, CLIP y VAE cargados aparte) |
| Tipo de artefacto | nodo personalizado de ComfyUI (`comfyui-nodes`) |
| Modalidad | texto a video con audio sincronizado |
| Duracion por generacion del modelo base | aproximadamente 15 segundos por plano |
| Version de ComfyUI requerida | 0.31 o superior con soporte nativo de MiniMax-H3 (probado en 0.33) |
| Componentes que carga | UNET de MiniMax-H3, CLIP (text encoder de H3, tipo de loader `minimax`), VAE de video de H3 y VAE de audio de H3 (fichero separado y convertido) |
| Descargas / likes en HuggingFace | 0 / 0 |

## Arquitectura y entrenamiento

No se proporciona informacion sobre la arquitectura interna de MiniMax-H3 ni sobre su proceso de entrenamiento: el README describe el comportamiento del nodo, no del modelo subyacente. Los unicos datos tecnicos de inferencia que se documentan son los parametros de muestreo recomendados: `cfg` fijado a 1.0 porque H3 no usa classifier-free guidance y el prompt negativo nunca se evalua; `sampler_name` en `res_multistep` o `euler` con PDD Acc; `scheduler` en `simple`; `shift_video` y `shift_audio` en 12 y 3 respectivamente, con la advertencia de mantener la proporcion cerca de 4:1 o el audio se rompe; y `steps` entre 6 y 8 con una LoRA turbo/distill, o 20 o mas sin ella. El presupuesto nativo de resolucion se expresa como 1.0 megapixeles.

La innovacion tecnica destacable esta en la capa de orquestacion, no en el modelo. El nodo segmenta el prompt por parrafos vacios: el primer parrafo actua como escena y se antepone a todos los planos, y los siguientes son beats. El dialogo se marca entre comillas dobles. Existe un widget `anchor` para separar el encuadre. Las lineas marcadas con `exact:`, `exactly:` o `verbatim:` se insertan literalmente tras el beat sin que ninguna rutina del nodo las lea, recorte, reordene o descarte; segun la documentacion, en beats cortos las clausulas de continuidad del propio nodo pueden ocupar hasta un 70 por ciento de lo que se le dice al modelo frente al 8 por ciento del beat, y el campo `info` informa de ese balance en cada ejecucion. El widget `verbatim` desactiva todas las clausulas internas para poder atribuir un fallo al nodo o al modelo. La ficha de personajes asigna a cada plano unicamente las entradas de las personas nombradas en su beat, y el nodo genera un lecho de ambiente (mezclado, nunca prompteado) a partir de la sala que nombra la escena: aire, retumbo, zumbido, agua o un reloj, con un nivel recomendado de 0.15 a 0.3 y 0 para desactivarlo.

## Capacidades

- Generacion de video a partir de texto con audio sincronizado, encadenando planos de aproximadamente 15 segundos en un video continuo.
- Segmentacion automatica de un guion en planos: un parrafo equivale a un plano, con el primer parrafo repetido como escena en todos los demas.
- Gestion de dialogo hablado marcado entre comillas dobles, con sincronizacion labial implícita por parte del modelo.
- Insercion literal de lineas criticas mediante `exact:`, `exactly:` o `verbatim:`, sin que el nodo las modifique.
- Modo de planificacion (`plan_only`) que informa del reparto de planos, duraciones y avisos sin renderizar nada.
- Modo de diagnostico (`verbatim`) que ejecuta el prompt del usuario sin ninguna clausula del nodo y devuelve en `info` lo que cada clausula habria dicho.
- Consistencia de personajes mediante ficha declarativa con pronombre, edad, atributos y referencias a imagenes (`<Picture N>` ligado al socket `ref_image_N`).
- Control de duracion por plano: `shot_length` en modo `from the beat` (dimensiona cada plano segun su linea) o `fixed` (todos los planos con `shot_seconds`).
- Control de encuadre independiente del contenido mediante el widget `anchor`.
- Mezcla de audio ambiente opcional a partir de una grabacion externa, con nivel ajustable.
- Salidas separadas de imagenes, audio e informacion de texto para composicion posterior (`Video Combine`, `Save Video`, `Show Text`).
- No se documentan capacidades de tool calling, function calling, uso de agentes, razonamiento multi-paso, vision de entrada ni soporte multilingue.

## Casos de uso

- Cortometrajes narrativos con dialogo: el nodo permite escribir un guion en parrafos, asignar dialogos entre comillas y obtener un montaje continuo con audio, aprovechando la division automatica en planos de unos 15 segundos para escenas de uno a varios minutos.
- Previsualizacion de guion y storyboard animado: con `plan_only` activado se obtiene el reparto de planos, las duraciones y los avisos sin coste de render, lo que permite validar la estructura narrativa antes de invertir tiempo de GPU.
- Produccion de piezas de marketing o video explicativo: al admitir un parrafo de escena comun y un lecho de ambiente mezclado, resulta adecuado para clips con estetica consistente y sonido de sala continuo.
- Series con personajes recurrentes: la ficha de personajes con pronombre y edad declarados, junto con imagenes de referencia etiquetadas como `<Picture N>`, mantiene la identidad visual de cada persona a lo largo de planos encadenados.
- Doblaje o locucion con texto fijo: las lineas `exact:` garantizan que una frase concreta llegue al modelo palabra por palabra sin que las clausulas de continuidad la reescriban, util para eslóganes, avisos legales o replicas que no pueden variar.
- Depuracion de pipelines de video generativo: el widget `verbatim` aísla el prompt del usuario de la logica del nodo, de modo que fallos como personajes duplicados, habla inventada, camara a la deriva o una puerta que se cierra sola se pueden atribuir al nodo o al modelo subyacente.
- Iteracion rapida con LoRA turbo/distill: con 6 a 8 pasos y 1.0 megapixeles se puede tantear la composicion y el ritmo de la escena antes de lanzar la version final con 20 pasos o mas.
- Sonorizacion ligera sin ficheros externos: el nodo construye el ambiente a partir de la sala nombrada en la escena, de modo que no hace falta aportar audio para obtener un fondo tonal continuo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas objetivas (FVD, CLIPScore, IS, MOS ni comparaciones cuantitativas) y los resultados de busqueda web proporcionados no contienen informacion relacionada con MiniMax-H3 ni con este nodo: se limitan a paginas generales de ChatGPT, sin conexion con el artefacto descrito. No se dispone tampoco de datos de latencia, throughput ni consumo de memoria.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. La model card no indica requisitos de memoria ni tamaños de los ficheros UNET, CLIP o VAE.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no disponible. El unico parametro relacionado con el coste computacional que se documenta es `megapixels`, con 1.0 como presupuesto nativo de H3 y la indicacion de que bajarlo es mas rapido y mas ligero.
- Almacenamiento: no disponible. El repositorio de HuggingFace no aloja pesos, solo el nodo y su documentacion; los pesos de MiniMax-H3, el text encoder, el VAE de video y el VAE de audio convertido se cargan por separado desde otras fuentes.
- Opciones de despliegue: exclusivamente ComfyUI, version 0.31 o superior con soporte nativo de MiniMax-H3 (probado en 0.33). La instalacion consiste en copiar la carpeta en `ComfyUI/custom_nodes/` y reiniciar el servidor de ComfyUI. No se menciona soporte para vLLM, llama.cpp, Ollama, TGI ni otras plataformas.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

No se dispone de datos de rendimiento, parametros, contexto ni benchmarks que permitan una comparacion cuantitativa con alternativas. La unica comparacion documentada es funcional, frente al uso directo de MiniMax-H3 en ComfyUI:

| Criterio | H3-LongVideos (este nodo) | MiniMax-H3 nativo en ComfyUI |
|---|---|---|
| Duracion de salida | Encadena planos de unos 15 s en un video continuo | Aproximadamente 15 s por generacion |
| Gestion de continuidad | Clausulas internas, ficha de personajes, escena comun, `anchor` | No documentada en la informacion disponible |
| Planificacion previa | Modo `plan_only` sin render | No disponible |
| Aislamiento del prompt | Modo `verbatim` con informe en `info` | No disponible |
| Audio | Audio del modelo mas lecho de ambiente mezclado opcional | Audio del modelo |
| Licencia | h3-longvideos-no-redistribution, prohibida la redistribucion | No disponible en la informacion proporcionada |
| Modelos comparables de terceros | no disponible | no disponible |

## Limitaciones y advertencias

- Licencia restrictiva: `h3-longvideos-no-redistribution`. La propia denominacion indica que no se permite redistribuir; conviene revisar el fichero `LICENSE` antes de cualquier uso, incluido el comercial.
- El repositorio esta etiquetado como `not-for-all-audiences`, lo que implica contenido potencialmente no apto para todas las audiencias.
- El nodo se declara explicitamente como trabajo en curso: pueden aparecer fallos y funciones que no operan si no se actualiza a la ultima version y se refrescan los flujos de trabajo.
- Dependencia estricta de version: requiere ComfyUI 0.31 o superior con soporte nativo de MiniMax-H3 y se ha probado solo en 0.33.
- El audio se degrada si la proporcion entre `shift_video` y `shift_audio` no se mantiene cerca de 4:1 (valores de referencia 12 y 3).
- `cfg` debe permanecer en 1.0: el prompt negativo no se evalua.
- Las clausulas internas de continuidad compiten por espacio con la descripcion del beat; en beats cortos pueden acaparar hasta un 70 por ciento del texto dirigido al modelo frente al 8 por ciento del beat.
- La ficha de personajes exige disciplina: un nombre distinto para la misma persona la convierte en dos personajes, y un nombre sin entrada hace que el modelo lo invente de forma diferente en cada plano.
- Los atributos no declarados se rellenan a partir del prior del modelo, que la documentacion describe como una persona de veintitantos anos. Una edad declarada menor de 18 no recibe descripcion corporal alguna, y una ficha con un menor junto a un guion con desnudez o sexo se niega a renderizar.
- Las lineas `exact:` no actuan como restriccion visual: un nombre en ellas no introduce a nadie en el plano, una prenda no elimina nada y una puerta no provoca ningun cambio.
- El lecho de ambiente se construye a partir de la sala nombrada en la escena, no de la descripcion sonora literal: una escena cuyo ambiente sea canto de pajaros recibe la sala, no los pajaros.
- Riesgo de alucinacion y de deriva de continuidad no cuantificado: la propia documentacion enumera fallos tipicos como personajes duplicados, habla inventada, camara a la deriva o un recorrido reproducido al reves.
- Sin soporte de idiomas declarado y sin datos de sesgo, contexto maximo, tool calling ni multimodalidad de entrada.
- Cero descargas y cero likes en el momento de la consulta: el nodo no cuenta con validacion de la comunidad.
- La model card disponible esta truncada (termina en "each has a to"), por lo que el inventario completo de interruptores y sus valores por defecto no se puede verificar con la informacion proporcionada.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/concil859856/MiniMax-H3-Longvideos
- Fichero de licencia referenciado en la model card: `LICENSE` (dentro del repositorio)
- Modelos hibridos fl2va/ref2va de MiniMax-H3 recomendados por el autor: https://huggingface.co/smhfacct/Minimax-H3-fl2va-ref2va-hybrid-models
- Enlace de apoyo al autor (Ko-fi): https://ko-fi.com/smite79
- Paper, blog tecnico, repositorio de codigo adicional o demo: no disponibles en la informacion proporcionada
- Los resultados de busqueda web facilitados no contienen enlaces relacionados con MiniMax-H3 ni con este nodo (unicamente paginas generales de ChatGPT: https://chatgpt.com/, https://chatgpt.com/features, https://openai.com/index/chatgpt/)
