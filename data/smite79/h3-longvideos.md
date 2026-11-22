# Smite79/H3-Longvideos

## Resumen

H3-Longvideos es un nodo personalizado para ComfyUI desarrollado por el usuario Smite79 que extiende las capacidades del modelo generativo MiniMax-H3 (de MiniMaxAI). Su funcion principal es superar la limitacion de duracion del modelo base, que genera como maximo unos 15 segundos de video por pasada, permitiendo crear escenas largas a partir de un unico prompt estructurado en "beats" narrativos. Cada beat se renderiza como un plano independiente y luego se unen en un unico video con una banda sonora coherente.

El nodo anade capas de planificacion y consistencia que el modelo base no ofrece de forma nativa: mantiene la identidad de personajes, ropa, poses y objetos entre planos, sincroniza labialmente cada linea de dialogo con su hablante y realiza un emparejamiento de color, contraste y nitidez entre planos para evitar derivas visuales. Todo ello se orquesta dentro del ecosistema ComfyUI, con soporte para LoRAs de velocidad, Hyperflow, FastH3 y el checkpoint HyperFlow H3 Flash en INT8.

Es relevante ahora porque demuestra como la comunidad construye capas de orquestacion sobre modelos de video generativo con audio sincronizado, resolviendo uno de los cuellos de botella practicos (la duracion limitada por pasada) sin necesidad de reentrenar el modelo subyacente. El repositorio tiene 587 descargas y 140 likes, lo que indica interes activo, aunque el propio autor lo describe como "constant work in progress".

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Nodo de orquestacion para ComfyUI sobre el modelo MiniMax-H3 (arquitectura del modelo base no disponible) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (el modelo base renderiza ~15 segundos de video por pasada) |
| Tipos de cuantizacion | no disponible (se menciona un checkpoint INT8: HyperFlow H3 Flash) |
| Idiomas soportados | en |
| Licencia | h3-longvideos-no-redistribution (licencia propia, "other") |
| Formato de pesos | no disponible (el repo tiene 0.0 GB, indica que no aloja pesos) |

## Arquitectura y entrenamiento

H3-Longvideos no es un modelo entrenado, sino un nodo de ComfyUI que orquesta el modelo MiniMax-H3. Su logica se divide en cinco fases: planificacion (cada parrafo del prompt es un beat que se convierte en un plano de duracion real, con un minimo de 5.2 segundos y posibilidad de extenderse a `shot_seconds`), escritura (cada plano recibe el texto de escena, personajes y beat, mas notas de continuidad de planos anteriores), renderizado (cada plano arranca en el ultimo fotograma del anterior y recibe las imagenes de referencia de sus personajes), sonido (sincronizacion labial por linea hablada y una pasada audio-only para tramos sin dialogo) y union (emparejamiento de color, contraste y nitidez entre planos, con fondo estatico heredado).

El nodo incorpora un sistema de etiquetas de control (`hold`, `release`, `remove`, `wear`, `lift`, `tear`, `mark`, `unmark`, `exit`) que instruyen explicitamente al pipeline sobre cambios de vestuario, objetos o marcas en los personajes, evitando que el modelo los infiera libremente. Tambien soporta `cut` para iniciar un plano sin continuidad de fotograma, `seconds:` para fijar duracion y `character_memory` para definir personajes con referencias visuales (`<Picture 1>` a `<Picture 4>`). Se integra con `MiniMaxH3PDDAccApply` para aceleracion PDD, detecta automaticamente LoRAs de velocidad, Hyperflow y FastH3, y puede usar `comfyui_controlnet_aux` con DWPose para recortar referencias a cara y pelo. No se dispone de informacion sobre datos de entrenamiento, tokens o tecnicas de alineacion del modelo base.

## Capacidades

- Generacion de video texto-a-video de larga duracion mediante composicion de planos, superando el limite de ~15 segundos por pasada del modelo base.
- Generacion de audio sincronizado con el video, incluyendo sincronizacion labial por linea de dialogo.
- Consistencia de personajes entre planos: identidad, ropa, poses y objetos se mantienen estables.
- Control explicito de vestuario y objetos mediante etiquetas (`wear`, `remove`, `tear`, `hold`, `release`, `lift`).
- Control de marcas en la piel con `mark` y `unmark`.
- Gestion de entradas y salidas de personajes en escena con `exit`.
- Planificacion narrativa por beats a partir de un prompt en texto estructurado.
- Soporte de imagenes de referencia por personaje (hasta 4) y primer fotograma opcional.
- Integracion con aceleradores: PDD Acc, LoRAs de velocidad, Hyperflow, FastH3 y HyperFlow H3 Flash (INT8).
- Soporte de programaciones de muestreo personalizadas mediante `sigmas`.
- Salidas de `images`, `audio`, `info` y `script` para inspeccion del plan generado.
- Capacidades multilingues limitadas al ingles segun los metadatos del repositorio.

## Casos de uso

- Prototipado de cortometrajes narrativos: un guion dividido en beats permite generar una escena completa de varios minutos con dialogo sincronizado, usando `character_memory` para fijar el reparto y `exit` para gestionar entradas y salidas.
- Previsualizacion de storyboards animados: directores y guionistas pueden convertir un tratamiento en texto en un video con planos encadenados y sonido, antes de comprometer recursos de produccion.
- Generacion de contenido para redes sociales con personajes recurrentes: la consistencia entre planos y el uso de imagenes de referencia permite mantener un mismo personaje a lo largo de episodios seriados.
- Creacion de demos de doblaje y lip-sync: cada linea entre comillas se sincroniza con su hablante, util para probar guiones dialogados y evaluar el ajuste labial antes de doblar.
- Escenas con continuidad de vestuario y atrezzo: las etiquetas `wear`, `remove`, `hold` y `mark` permiten controlar cambios de ropa, objetos en mano o marcas cutaneas de forma determinista entre planos.
- Iteracion rapida en pipelines de investigacion sobre video generativo: el nodo expone `sigmas`, integra aceleradores y permite comparar configuraciones (steps, LoRAs, PDD) dentro de ComfyUI sin escribir codigo adicional.
- Generacion de video con audio para entornos ComfyUI existentes: se integra con `UNETLoader`, `CLIPLoader`, `VAELoader` y `Create Video`, lo que facilita incorporarlo a flujos de trabajo ya montados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. Depende del checkpoint de MiniMax-H3 utilizado, del VAE de video completo, del VAE de audio y de los aceleradores opcionales.
- GPU recomendadas: no disponible en la informacion proporcionada.
- Compatibilidad con GPU de consumo: no disponible. El uso de un VAE de video completo y un VAE de audio separado sugiere requisitos de VRAM significativos, pero no se especifican cifras.
- Opciones de despliegue: ComfyUI con soporte nativo de MiniMax-H3; el nodo se instala copiando la carpeta en `ComfyUI/custom_nodes/` y reiniciando el servidor. Requiere `UNETLoader`, `CLIPLoader` (tipo `minimax`), `VAELoader` para video y audio, y nodos de video (`Create Video`, `Save Video`).
- Aceleradores compatibles: `MiniMaxH3PDDAccApply`, LoRAs de velocidad, Hyperflow, FastH3 y HyperFlow H3 Flash (INT8, cargable con Load Diffusion Model de ComfyUI, con rejilla de 4, 6 u 8 pasos).
- Dependencia opcional: `comfyui_controlnet_aux` con `yolox_l.torchscript.pt` y `dw-ll_ucoco_384_bs5.torchscript.pt` para recorte de referencias a cara y pelo.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Duracion por pasada | Audio sincronizado | Consistencia entre planos | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| H3-Longvideos (este) | Nodo de orquestacion sobre MiniMax-H3 | Multiples planos encadenados | Si, lip-sync por linea | Si, via referencias y notas de continuidad | h3-longvideos-no-redistribution | Hugging Face (repo de nodo) |
| MiniMax-H3 (base) | Modelo generativo de video | ~15 segundos | Si (audio nativo) | No documentada en la informacion disponible | no disponible | Hugging Face (MiniMaxAI) |
| Alternativas de la misma categoria | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de informacion sobre otros modelos comparables de la misma categoria en la documentacion proporcionada.

## Limitaciones y advertencias

- El autor declara explicitamente que el nodo es "constant work in progress"; pueden aparecer fallos y funciones rotas entre versiones, y recomienda actualizar los flujos de trabajo tras cada cambio.
- La licencia `h3-longvideos-no-redistribution` prohibe la redistribucion; debe revisarse el archivo `LICENSE` antes de cualquier uso comercial o de redistribucion de derivados.
- El repositorio tiene un tamano de 0.0 GB, por lo que no aloja pesos: el usuario debe obtener el modelo base MiniMax-H3 y los VAE por separado.
- El idioma soportado declarado es unicamente ingles (`en`), lo que limita prompts y dialogos en otros idiomas.
- El tag `not-for-all-audiences` indica que el modelo base y los flujos asociados pueden generar contenido para adultos; no es apto para entornos sin moderacion.
- Riesgo de alucinacion y de deriva visual entre planos: aunque el nodo aplica emparejamiento de color, contraste y nitidez, no se documenta una garantia de consistencia perfecta en escenas largas o con muchos personajes.
- La sincronizacion labial depende de la calidad del modelo base y de la pasada de audio; con menos de 6 pasos de muestreo, el nodo usa una programacion mas fina para el audio, salvo que `foley_resolution` este desactivado.
- Se requiere el VAE de video completo; un VAE solo-decoder no puede iniciar un plano en el ultimo fotograma, lo que rompe la continuidad.
- El nodo depende de ComfyUI con soporte nativo de MiniMax-H3; versiones antiguas del nodo requieren recrear el nodo (`Fix node (recreate)`) y reconfigurar los valores.
- No se dispone de informacion sobre sesgos del modelo base ni sobre evaluaciones de seguridad.
- El autor menciona una lista negra contra RealRebelAI por apropiacion de trabajo; es un aviso de gobernanza del proyecto, no una limitacion tecnica.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/Smite79/H3-Longvideos
- Modelo base MiniMax-H3: https://huggingface.co/MiniMaxAI/MiniMax-H3
- Modelos hibridos fl2va/ref2va recomendados: https://huggingface.co/smhfacct/Minimax-H3-fl2va-ref2va-hybrid-models
- Apoyo al autor (Ko-fi): https://ko-fi.com/smite79
- ComfyUI: no disponible en la informacion proporcionada
- Paper o blog oficial de MiniMax-H3: no disponible en la informacion proporcionada
