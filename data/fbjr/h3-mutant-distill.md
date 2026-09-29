# fbjr/h3-mutant-distill

## Resumen

H3-mutant-distill es una coleccion de adaptadores de destilacion (LoRA) experimentales para el modelo de generacion de video MiniMax-H3, empaquetados en formato safetensors de ComfyUI por el usuario fbjr. No es un modelo autonomo ni un entrenamiento original: cada archivo es la conversion de destilados ajenos (de alibaba-pai y del propio ecosistema H3) para que carguen sobre los checkpoints pruned int8 de Comfy-Org/MiniMax-H3 y reduzcan el numero de pasos de muestreo.

El paquete cubre tres tareas de generacion condicionada por video: texto a video (fl2va), imagen a video y referencia a video (ref2va). Incluye dos familias de destilacion: PDD8 (Parallel Decoding Distillation a 8 pasos) y FlashGen (destilado a 4 pasos entrenado por distribution matching). Los adaptadores no sustituyen al checkpoint base: se aplican en tiempo de llamada mediante un nodo personalizado.

La relevancia actual es practica: permiten generar video a 1344x768 y 345 frames en 4-8 pasos sobre una RTX 4090, y el autor documenta combinaciones concretas (por ejemplo, PDD8 para los primeros 6 pasos y FlashGen para los 2 ultimos) que corrigen artefactos de texto en pantalla. Es material experimental, sin benchmarks publicados ni validacion por terceros.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptadores LoRA sobre el transformer DiT de MiniMax-H3 (no es un modelo completo) |
| Parametros totales | no disponible (LoRA de rango 64; tamano del repo 4,8 GB) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Carga sobre checkpoints pruned int8 (`*_pruned_int8_convrot`); adaptadores en safetensors |
| Idiomas soportados | no disponible (prompts de texto; sin listado de idiomas) |
| Licencia | minimax-h3-community-license-agreement |
| Formato de pesos | safetensors (formato ComfyUI) |

## Arquitectura y entrenamiento

El modelo base subyacente es MiniMax-H3, un transformer de difusion (DiT) para generacion de video. Los archivos de este repositorio son adaptadores LoRA que se inyectan sobre las capas del DiT; en el caso de FlashGen, en todos los modulos (attention q/k/v y output, MLP fc1 y fc2, modulacion de cada bloque y de la capa final, y el token refiner) a rango 64 completo, sin recorte ni redimensionado. La familia PDD8 incluye tres componentes: un LoRA de backbone (todos los bloques y el token refiner, rango 64), una actualizacion de modulacion y un banco de 32 cabezas de salida por intervalo.

Ninguno de los archivos fue entrenado por el autor: son conversiones de destilados de terceros. PDD8 proviene de los LoRA de 8 pasos de Parallel Decoding Distillation de alibaba-pai (FL2VA y Ref2VA); PDD destila la trayectoria del modelo base en 8 pasos, donde cada paso usa las cabezas correspondientes al tramo de trayectoria que cubre. FlashGen es un destilado a 4 pasos para texto a video entrenado por distribution matching (VSD, data-free). La conversion incluye renombrado de nombres diffusers a ComfyUI, fusion de q/k/v, reordenado de las mitades SwiGLU, adicion de tensores alpha y pre-resolucion de la actualizacion de modulacion sobre la base temporal del checkpoint pruned. Los ficheros PDD8 son byte-identicos a los de fbjr/MiniMax-H3-Acc-LoRAs-sidecar.

## Capacidades

- Generacion de video a partir de texto (text-to-video) con PDD8 a 8 pasos o FlashGen a 4 pasos.
- Imagen a video: el autor recomienda PDD8 en solitario (el acabado con FlashGen ilumina el frame de forma inmediata).
- Referencia a video (ref2va): dispone de un PDD8 especifico y de un FlashGen transferido sin entrenamiento especifico para esta tarea (resultado incierto).
- Reduccion del numero de pasos de muestreo: 8 pasos con PDD8 y 4 pasos con FlashGen.
- Composicion de adaptadores en un mismo render: por ejemplo, PDD8 para los primeros 6 pasos y FlashGen para los 2 ultimos.
- Carga selectiva de FlashGen solo en los bloques DiT 34-49 (variante experimental).
- No se documentan capacidades de tool calling, agentes, vision general, audio o modo thinking para estos adaptadores.

## Casos de uso

- Generacion rapida de clips de texto a video en ComfyUI: usar PDD8 para los primeros 6 pasos y FlashGen para los 2 ultimos produce un clip de 8 pasos en el mismo tiempo que PDD8 solo, con mejor fidelidad de texto en pantalla.
- Prototipado de storyboards a 4 pasos: FlashGen solo permite iterar rapidamente sobre prompts de escenas con movimiento coherente y detalle, a costa de perder la trazabilidad de personajes en escenas con multitud.
- Animacion de imagenes fijas (image-to-video): PDD8 en solitario genera movimiento natural y sobrio a partir de una imagen de partida, adecuado para animar fotografias o ilustraciones.
- Transferencia de estilo o sujeto por referencia (reference to video): el adaptador ref2va de PDD8 permite condicionar el video a referencias visuales en lugar de solo al prompt.
- Investigacion sobre destilacion de modelos de difusion: los adaptadores sirven para estudiar el comportamiento de PDD (8 pasos, cabezas por intervalo) frente a FlashGen (4 pasos, distribution matching data-free) sobre el mismo backbone.
- Validacion de pipelines de ComfyUI con checkpoints int8: util para evaluar el nodo `H3 Exact LoRA` y comparar fidelidad bit a bit con los nodos PDD y LoRA de ComfyUI-h3-explorations.
- Pruebas de abladacion sobre bloques concretos del DiT: la variante que aplica FlashGen solo en los bloques 34-49 permite analizar el efecto de la destilacion parcial sobre la naturalidad y la coherencia de escena.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks numericos en la informacion disponible. El autor aporta unicamente juicios cualitativos, evaluados visualmente con cegado parcial, en 1-2 semillas, sobre una RTX 4090 a 1344x768 y 345 frames.

| Receta | Adaptadores | Tarea | Veredicto del autor |
|---|---|---|---|
| Primera opcion | PDD8 y FlashGen en los 2 ultimos pasos | text to video | 8 pasos, mismo tiempo que PDD8 solo; nunca peor y corrige el texto de carteles ilegible |
| Primera opcion | PDD8 solo | image to video | El acabado con FlashGen ilumina el frame de inmediato; PDD8 es la opcion recomendada |
| A probar | FlashGen solo, 4 pasos | text to video | El mas rapido; movimiento y detalle coherentes, pero pierde el seguimiento de personajes en escenas concurridas |
| A probar | PDD8 solo | reference to video | El ref2va que ejecutan; no comparado con alternativas |
| Experimental | PDD8 en un schedule de 6 pasos | text to video | Solo primeros planos y poco movimiento, e irregular incluso ahi |
| Posiblemente malo | FlashGen solo en bloques DiT 34-49 | text to video | Mas natural en una figura; personas y objetos se desmoronan en escenas concurridas |
| Posiblemente malo | FlashGen para ref2va | reference to video | Transferencia no probada: FlashGen se entreno solo para texto a video; un render mantuvo las referencias |

## Requisitos de hardware

- El autor probo las recetas en una RTX 4090 (24 GB) a 1344x768 y 345 frames; no se especifica si hubo offloading de VRAM.
- Los adaptadores cargan sobre checkpoints `minimax_h3_fl2va_pruned_int8_convrot` y `minimax_h3_ref2va_pruned_int8_convrot` (pesos pruned en int8), lo que reduce el requisito de memoria frente a los pesos completos.
- Tamano del repositorio completo: 4,8 GB (suma de todos los adaptadores, no de un unico archivo en memoria).
- No se dispone de VRAM exacta recomendada, latencia ni throughput medidos mas alla del equipo de referencia del autor.
- Despliegue: ComfyUI con el nodo `H3 Exact LoRA (FlashGen / PDD)` del repositorio h3-mutant-distill. No se debe usar `LoraLoaderModelOnly` ni el cargador LoRA estandar, porque remezcla el LoRA sobre el checkpoint int8 y redondea la mayor parte del adaptador.
- No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI (son pesos para un modelo de video de difusion, no un modelo de lenguaje).

## Comparativa con modelos similares

Dentro del propio paquete, la comparacion relevante es entre las dos familias de destilacion:

| Adaptador | Pasos | Tarea | Origen | Notas |
|---|---|---|---|---|
| PDD8 fl2va | 8 (o 6 en schedule corto) | text/image to video | alibaba-pai (PDD, 8-step) | Mas natural, plano y apagado; el de menos movimiento; conserva mejor referencias |
| PDD8 ref2va | 8 | reference to video | alibaba-pai (PDD, 8-step) | Misma construccion, base temporal y fingerprints de ref2va |
| FlashGen fl2va | 4 | text to video | Destilado 4-step por distribution matching (VSD, data-free) | El mas rapido; puede perder personajes en escenas concurridas |
| FlashGen ref2va | 4 | reference to video | Transferencia no probada | FlashGen se entreno solo para texto a video; resultado incierto |

Frente a modelos completos de generacion de video, la alternativa directa es el propio MiniMax-H3 base (sin destilar) y el destilado de 4 pasos de Beidouqixing (minimax-h3-4step-lora-flashgen), que son la base declarada de este repositorio. Datos comparativos de parametros, contexto o rendimiento no disponibles.

## Limitaciones y advertencias

- Material experimental: el propio autor califica los resultados con "YMMV" y reconoce no saber si son buenos; la evaluacion es visual, con cegado parcial y 1-2 semillas.
- Ningun archivo ha sido entrenado por el autor; son conversiones de destilados de terceros, por lo que su calidad depende del trabajo original.
- Requiere codigo personalizado (nodo `H3 Exact LoRA` y el repositorio h3-mutant-distill). El cargador LoRA estandar de ComfyUI re-cuantiza a int8 y redondea la mayor parte del adaptador.
- Los adaptadores PDD8 solo cargan sobre su checkpoint correspondiente: un fichero PDD de fl2va no se aplica a la particion ref2va (el nodo lo rechaza).
- FlashGen fue entrenado solo para texto a video; su uso en reference to video es una transferencia no probada y con resultado incierto.
- La variante de FlashGen limitada a los bloques DiT 34-49 degrada gravemente escenas con varias personas u objetos.
- Puede fallar en texto en pantalla (PDD8 produjo texto de carteles ilegible en la prueba del autor) y en el seguimiento de personajes en escenas concurridas.
- Licencia minimax-h3-community-license-agreement: es una licencia de tipo comunitario con condiciones especificas; conviene revisar el texto enlazado antes de cualquier uso comercial.
- No hay informe de sesgos, idiomas soportados ni evaluacion de seguridad en la informacion disponible.
- Modelo con 0 descargas y 0 likes en el momento de redactar la ficha; sin validacion por parte de la comunidad.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/fbjr/h3-mutant-distill
- Repositorio de nodos ComfyUI: https://github.com/fblissjr/h3-mutant-distill
- Nodos y recetas de referencia: https://github.com/fblissjr/ComfyUI-h3-explorations
- Script de conversion: https://github.com/fblissjr/ComfyUI-h3-explorations/blob/main/bench/convert_pdd_lora.py
- Checkpoints pruned int8: https://huggingface.co/Comfy-Org/MiniMax-H3
- Modelo base declarado (FlashGen 4-step): https://huggingface.co/Beidouqixing/minimax-h3-4step-lora-flashgen
- Modelo base declarado (LoRA de aceleracion): https://huggingface.co/alibaba-pai/MiniMax-H3-Acc-LoRAs
- Copia sidecar de los LoRA: https://huggingface.co/fbjr/MiniMax-H3-Acc-LoRAs-sidecar
- Licencia MiniMax-H3: https://huggingface.co/MiniMaxAI/MiniMax-H3/blob/main/LICENSE
