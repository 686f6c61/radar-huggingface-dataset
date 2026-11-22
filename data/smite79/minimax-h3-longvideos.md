# Smite79/MiniMax-H3-Longvideos

## Resumen

MiniMax-H3-Longvideos es un nodo personalizado para ComfyUI, publicado por el usuario Smite79, que extiende las capacidades del modelo generativo MiniMax-H3 (desarrollado por MiniMax) para producir videos de larga duración con audio sincronizado a partir de un unico prompt textual. El modelo base H3 genera como maximo unos 15 segundos de video por pasada; este nodo resuelve esa limitacion dividiendo una escena escrita en "beats" (parrafos), renderizando cada beat como un plano independiente y uniendo los planos en un unico video con una banda sonora coherente, manteniendo la consistencia de personajes, vestuario, poses y objetos entre planos.

Tecnicamente, el repositorio no contiene pesos de modelo: es un paquete de nodos (custom nodes) que orquesta el modelo base MiniMaxAI/MiniMax-H3 dentro de ComfyUI. Su valor esta en la capa de planificacion y ensamblaje: convierte lenguaje natural estructurado en un guion de planos, encadena cada plano a partir del ultimo fotograma del anterior, aplica imagenes de referencia por personaje y realiza un pase de audio independiente para las partes sin dialogo, ademas de igualar color, contraste y nitidez entre planos para evitar derivas visuales.

Es relevante ahora porque aborda uno de los cuellos de botella practicos de los modelos text-to-video actuales: la generacion de clips cortos y la inconsistencia entre tomas. La propuesta de Smite79 permite construir narrativas de varios minutos con lip-sync por linea de dialogo, algo que hasta hace poco requeria pipelines manuales de edicion y retoque. El repositorio tiene 587 descargas y 140 likes en Hugging Face, con licencia restrictiva `h3-longvideos-no-redistribution`.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Nodo de orquestacion para ComfyUI sobre el modelo generativo MiniMax-H3 (no incluye pesos propios) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (el prompt se estructura en beats y planos, sin limite documentado) |
| Tipos de cuantizacion | no disponible (depende del modelo base y de los checkpoints cargados, p. ej. INT8 convrot en HyperFlow H3 Flash) |
| Idiomas soportados | en |
| Licencia | `h3-longvideos-no-redistribution` (licencia propia, etiquetada como `other`) |
| Formato de pesos | no aplica (el repo no contiene pesos; el modelo base se carga via UNETLoader, CLIPLoader y VAELoader en ComfyUI) |

## Arquitectura y entrenamiento

Este repositorio no entrena ni distribuye un modelo generativo. Es un conjunto de nodos para ComfyUI que implementa un pipeline de cinco etapas sobre MiniMax-H3: planificacion (cada parrafo del prompt se convierte en un beat y en un plano de duracion real, con un minimo de 5,2 segundos), escritura (cada plano recibe el texto de escena, personajes y beat, mas notas de continuidad de planos anteriores), renderizado (cada plano arranca en el ultimo fotograma del anterior, con imagenes de referencia inyectadas en cada plano donde aparece el personaje), sonido (lip-sync por linea hablada y pase de audio independiente para tramos sin dialogo) y union (igualado de color, contraste y nitidez, y arrastre del fondo estatico).

El nodo se integra con el ecosistema de ComfyUI mediante los cargadores estandar (UNETLoader, CLIPLoader, VAELoader de video y VAELoader de audio) y admite aceleradores externos: PDD Acc mediante `MiniMaxH3PDDAccApply`, LoRAs de velocidad, Hyperflow, FastH3 y el checkpoint HyperFlow H3 Flash en INT8 convrot, que se carga con el Load Diffusion Model nativo de ComfyUI. Para pasos inferiores a 6, los pases de audio usan una programacion mas fina para preservar la claridad del habla. Si se instala `comfyui_controlnet_aux` con los ficheros DWPose (`yolox_l.torchscript.pt` y `dw-ll_ucoco_384_bs5.torchscript.pt`), las imagenes de referencia se recortan a cara y pelo; en caso contrario se usan completas.

## Capacidades

- Generacion de video text-to-video de larga duracion mediante composicion de planos, superando el limite de aproximadamente 15 segundos por pasada de MiniMax-H3.
- Generacion de audio sincronizado con lip-sync por linea de dialogo hablada.
- Consistencia de personajes entre planos mediante `character_memory` e imagenes de referencia (`<Picture 1>` a `<Picture 4>`).
- Control explicito de continuidad de vestuario y objetos con etiquetas dedicadas: `hold`, `release`, `remove`, `wear`, `lift`, `tear`.
- Control de marcas sobre la piel con `mark` y `unmark`, persistentes entre planos.
- Gestion de entradas y salidas de personajes con `exit`.
- Control de duracion por plano mediante la linea `seconds: N`.
- Corte de continuidad con la directiva `cut`, que inicia el siguiente plano sin heredar el ultimo fotograma.
- Igualado automatico de color, contraste y nitidez entre planos y arrastre de fondo estatico.
- Soporte de aceleradores: PDD Acc, LoRAs de velocidad, Hyperflow, FastH3 y HyperFlow H3 Flash.
- Soporte de imagen de primer fotograma (`first_frame`) y de hasta cuatro imagenes de referencia de personajes.
- Salidas multiples: `images`, `audio`, `info` y `script` (estos dos ultimos para previsualizacion y depuracion).
- Capacidades multilingues: no disponibles; el modelo base declara unicamente ingles.

## Casos de uso

- Produccion de cortometrajes narrativos: el nodo permite escribir una escena en beats y obtener un video unico de varios minutos con dialogo lip-sincronizado, adecuado para prototipos de ficcion o animaticos.
- Creacion de contenido serializado para redes: series con personajes recurrentes donde la consistencia de vestuario y apariencia entre planos es critica, gracias a `character_memory` y a las imagenes de referencia.
- Previsualizacion de guiones: un guionista puede convertir un texto con dialogos en una previsualizacion audiovisual con voces sincronizadas antes de rodar, usando la salida `script` para revisar la planificacion por planos.
- Generacion de videos explicativos con presentador: escenas con un personaje hablando a camara y cambios de plano controlados mediante `seconds` y `cut`, utiles para formación o marketing.
- Prototipado de escenas con continuidad de atrezzo: gracias a las etiquetas `hold`, `wear`, `remove` y `mark`, se pueden generar secuencias donde un objeto o una marca permanece o desaparece de forma controlada, util para demostraciones de producto.
- Integracion en pipelines de ComfyUI existentes: al usar los cargadores nativos y aceptar LoRAs de velocidad y aceleradores como PDD Acc o HyperFlow H3 Flash, encaja en flujos de trabajo ya montados para MiniMax-H3 sin reescribir el grafo.
- Iteracion rapida en estudios pequenos: al reducir pasos con LoRAs y checkpoints acelerados, permite generar borradores de escenas largas en menos tiempo antes de un render final de mayor calidad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. Depende enteramente del checkpoint de MiniMax-H3 cargado, del VAE de video, del VAE de audio y del codificador de texto, ademas de la resolucion y duracion de cada plano.
- GPU recomendadas: no disponible en la informacion proporcionada. El uso de checkpoints INT8 (HyperFlow H3 Flash) sugiere orientacion a GPUs con soporte de cuantizacion INT8, pero no se especifican modelos concretos.
- Compatibilidad con GPU de consumo: no disponible. No se documenta que quepa en tarjetas consumer concretas.
- Opciones de despliegue: ComfyUI es el unico entorno soportado, con soporte nativo de MiniMax-H3. Se requieren UNETLoader, CLIPLoader (tipo `minimax`), VAELoader de video (VAE completo, no solo decodificador) y VAELoader de audio con el VAE de audio convertido.
- Aceleradores compatibles: `MiniMaxH3PDDAccApply`, LoRAs de velocidad, Hyperflow, FastH3 y HyperFlow H3 Flash (INT8 convrot, cargable con Load Diffusion Model nativo).
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye datos de rendimiento ni especificaciones de modelos alternativos de text-to-video con audio sincronizado, por lo que no es posible establecer una comparacion rigurosa sin inventar cifras.

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| MiniMax-H3-Longvideos (Smite79) | no disponible | no disponible | no disponible | `h3-longvideos-no-redistribution` | Hugging Face, 587 descargas |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- El repositorio no contiene pesos: es un nodo de ComfyUI que depende de MiniMax-H3 y de sus VAE y codificador de texto, que deben obtenerse por separado.
- La licencia `h3-longvideos-no-redistribution` es restrictiva y esta etiquetada como `other`; no se detallan en la informacion disponible las condiciones exactas para uso comercial, por lo que debe revisarse el fichero LICENSE antes de cualquier despliegue en produccion.
- El modelo base solo declara soporte de ingles; no hay evidencia de capacidades multilingues.
- El nodo se declara explicitamente como "constant work in progress": el autor advierte de posibles fallos y recomienda actualizar a la version mas reciente y rehacer los flujos de trabajo. Al actualizar desde versiones anteriores hay que usar "Fix node (recreate)" y reconfigurar los valores.
- El limite de MiniMax-H3 de aproximadamente 15 segundos por pasada implica que la calidad de la union entre planos depende del igualado de color y del arrastre de fondo; no se documenta una metrica objetiva de consistencia.
- Los pases de audio con menos de 6 pasos pueden perder claridad en el habla si `foley_resolution` esta desactivado.
- El recorte de imagenes de referencia a cara y pelo requiere `comfyui_controlnet_aux` con los ficheros DWPose; sin ellos, las referencias se usan completas, lo que puede reducir la precision del encuadre.
- El nodo incluye la etiqueta `not-for-all-audiences` y directivas para quitar prendas (`remove`, `lift`, `tear`) y marcar la piel (`mark`), lo que exige moderacion y control de contenido en entornos de produccion.
- El autor menciona una lista negra de colaboradores (RealRebelAI) y disputas sobre atribucion; conviene verificar la procedencia del codigo antes de integrarlo.
- Riesgo de alucinacion y sesgos: no documentado en la informacion disponible, aunque es aplicable al modelo base subyacente.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/Smite79/MiniMax-H3-Longvideos
- Modelo base: https://huggingface.co/MiniMaxAI/MiniMax-H3
- Merge hibrido fl2va/ref2va recomendado: https://huggingface.co/smhfacct/Minimax-H3-fl2va-ref2va-hybrid-models
- Apoyo al autor (Ko-fi): https://ko-fi.com/smite79
