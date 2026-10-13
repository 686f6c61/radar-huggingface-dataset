# lichtj/Jaena

## Resumen

Jaena es un adaptador LoRA de difusion para generacion de imagenes a partir de texto (pipeline `text-to-image`), publicado por el usuario lichtj en HuggingFace bajo el identificador `lichtj/Jaena`. Se trata de un ajuste ligero sobre el modelo base `krea/Krea-2-Raw`, y su proposito declarado por el autor es reproducir un personaje concreto creado mediante manipulacion fotografica, concebido como referencia artistica.

El modelo no es un modelo de lenguaje ni un transformer autoregresivo: es un adaptador de bajo rango que modifica el comportamiento de un modelo de difusion preentrenado. Por ello no tiene parametros activos, contexto de tokens ni capacidades de razonamiento, tool calling o agentes; su unica funcion es condicionar la generacion de imagenes. La relevancia practica esta en el coste: el repositorio ocupa 0,2 GB, de modo que permite incorporar un personaje nuevo sin reentrenar el modelo base completo.

En el momento de la consulta el modelo registra 0 descargas y 0 likes, no incluye una model card detallada (sin seccion de entrenamiento, hiperparametros ni dataset) y no define palabra de activacion (`instance_prompt: null`). Se publica bajo licencia CC BY-SA 4.0 y fue creado el 2026-10-12, con ultima actualizacion el 2026-10-12.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (adaptador de bajo rango) sobre un modelo de difusion text-to-image; arquitectura del modelo base no disponible |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica como contexto de texto; el limite de prompt lo fija el codificador de texto de `krea/Krea-2-Raw`, valor no disponible |
| Tipos de cuantizacion | no disponible; no se documenta ninguna cuantizacion especifica del adaptador |
| Idiomas soportados | no disponible (dependera del codificador de texto del modelo base; no confirmado) |
| Licencia | cc-by-sa-4.0 |
| Formato de pesos | no confirmado de forma explicita; repositorio con libreria `diffusers` (habitualmente safetensors) |
| Autor | lichtj |
| Modelo base | krea/Krea-2-Raw |
| Tipo de adaptador | LoRA (tag `template:diffusion-lora`) |
| Palabra de activacion | no definida (`instance_prompt: null`) |
| Tamano del repositorio | 0,2 GB |
| Fecha de creacion | 2026-10-12 |
| Ultima actualizacion | 2026-10-12 |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

La informacion disponible describe un adaptador LoRA para difusion, entrenado sobre `krea/Krea-2-Raw` y distribuido a traves de la libreria `diffusers`. No se especifica la arquitectura interna del modelo base (si es un UNet convolucional, un transformer de difusion tipo DiT o un hibrido), ni la dimension del rango LoRA, ni sobre que modulos (atencion, proyecciones, bloques completos) se aplican las matrices de bajo rango.

Tampoco se documenta nada del proceso de entrenamiento: no hay numero de imagenes del dataset, numero de pasos, tasa de aprendizaje, resolucion de entrenamiento, tipo de scheduler ni si se aplicaron tecnicas de regularizacion o de captioning. El autor indica unicamente que el personaje procede de manipulacion fotografica y que su finalidad es servir como referencia artistica. No consta uso de RLHF, DPO ni tecnicas equivalentes (no aplicables en este tipo de modelo). La unica evidencia visual incluida en el repositorio es una imagen de ejemplo (`images/ComfyUI_00018.png`), que sugiere uso con ComfyUI, aunque esto no se confirma en el texto de la model card.

## Capacidades

- Generacion de imagenes a partir de texto (text-to-image) condicionada por el modelo base `krea/Krea-2-Raw`.
- Reproduccion de un personaje concreto definido por el autor, orientada a mantener cierta consistencia entre generaciones.
- Aplicable a variaciones de pose, encuadre, iluminacion o estilo, siempre dentro de lo que permita el modelo base.
- No dispone de soporte de tool calling ni de function calling.
- No dispone de capacidades de agente, razonamiento multi-paso ni planificacion.
- No dispone de capacidades multilingues documentadas; el tratamiento del prompt depende del codificador de texto del base.
- Sin modo de razonamiento (thinking mode), sin entrada de audio y sin salida de video o 3D documentada.
- Compatible con el ecosistema `diffusers` y, segun la imagen de ejemplo del repositorio, presumiblemente con ComfyUI; no confirmado para otras interfaces.

## Casos de uso

- Ilustracion de personaje recurrente en series graficas: permite generar multiples escenas con el mismo personaje sin reentrenar el modelo base, usando un adaptador de 0,2 GB que se carga y descarga rapidamente entre tareas.
- Storyboard y previsualizacion de comic: el adaptador sirve para producir bocetos coherentes de un personaje a lo largo de varias viñetas, iterando encuadres y angulos sobre una misma identidad visual.
- Diseno de personajes para videojuegos o animacion: util como referencia rapida de apariencia, vestuario y variaciones de expresion antes de pasar al modelado o al diseno final.
- Previsualizacion de vestuario y atrezzo: al conservar los rasgos del personaje, permite probar combinaciones de ropa, epoca o paleta sin perder la identidad del sujeto.
- Generacion de datasets sinteticos etiquetados: se pueden producir imagenes del personaje en condiciones controladas para entrenar o evaluar otros sistemas de vision por computador, teniendo en cuenta las obligaciones de la licencia CC BY-SA 4.0 sobre las imagenes derivadas.
- Avatares y pruebas de concepto de producto: prototipado rapido de personajes para interfaces, materiales de marketing o demos internas, sustituyendo sesiones de fotografia o ilustracion en fases tempranas.
- Validacion de pipelines de difusion: por su tamano reducido resulta practico para comprobar la carga de adaptadores LoRA en `diffusers` o ComfyUI, medir sobrecarga de memoria y verificar el flujo de trabajo antes de desplegar adaptadores mas pesados.
- Referencia artistica personal: es el uso declarado explicitamente por el autor en la model card, orientado a artistas que necesiten una base visual consistente para su propio trabajo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No existen metricas de FID, CLIP score, similitud de identidad ni comparaciones cuantitativas con otros adaptadores, y tampoco se documentan hiperparametros de inferencia (pasos, CFG, sampler) que permitan reproducir una evaluacion.

## Requisitos de hardware

- El adaptador en si ocupa 0,2 GB, por lo que su sobrecoste de VRAM es marginal frente al modelo base.
- La VRAM necesaria para inferencia la determina `krea/Krea-2-Raw`, no la LoRA. No se dispone de cifras oficiales del modelo base en la informacion proporcionada.
- En funcion de la precision del base (fp16/bf16) y de la resolucion de salida, la generacion de difusion suele requerir varios gigabytes de VRAM; no se dispone de valores confirmados para este modelo concreto.
- GPU recomendadas: no disponible. No se puede confirmar si cabe en GPU de consumo (serie RTX 4090, 4080 u otras) porque no se conocen los requisitos del modelo base.
- Opciones de despliegue: `diffusers` (libreria declarada en el repositorio) y, segun la imagen de ejemplo incluida, ComfyUI. No se confirma compatibilidad con Automatic1111, Forge, InvokeAI ni otros frontends.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No disponible. No se han encontrado en la informacion proporcionada datos de otros adaptadores LoRA para `krea/Krea-2-Raw` ni valores de parametros, contexto o rendimiento que permitan una comparacion rigurosa. La busqueda web realizada no devolvio ningun resultado relacionado con el modelo: los enlaces recuperados corresponden al autobus Irisbus Agora y carecen de relacion con este repositorio.

## Limitaciones y advertencias

- Licencia CC BY-SA 4.0: exige atribucion y obliga a distribuir las obras derivadas bajo la misma licencia. Esto puede ser incompatible con productos propietarios o con flujos comerciales que no permitan compartir igual.
- El personaje se define como creado por manipulacion fotografica. Si deriva de la imagen de una persona real, su uso puede afectar a derechos de imagen o de privacidad; el autor no documenta el origen del material ni si existe consentimiento.
- No se define palabra de activacion (`instance_prompt: null`), lo que dificulta invocar el personaje de forma reproducible y hace que el resultado dependa por completo de la descripcion textual empleada.
- No hay documentacion de entrenamiento: se desconocen el dataset, el numero de imagenes, los pasos y la resolucion, lo que impide evaluar sobreajuste o generalizacion.
- La model card es practicamente vacia. No incluye galeria de ejemplos completa, instrucciones de uso, valores recomendados de CFG, sampler o pasos.
- Los sesgos del adaptador son los del modelo base `krea/Krea-2-Raw` mas los del conjunto de imagenes usado, ninguno de los cuales esta documentado.
- En modelos de difusion el riesgo de "alucinacion" se manifiesta como deformaciones anatomicas, manos incorrectas, texto ilegible y artefactos; no hay evaluacion publicada sobre la frecuencia de estos fallos.
- Sin validacion de la comunidad: 0 descargas y 0 likes en el momento de la consulta, lo que implica ausencia de pruebas independientes de calidad o estabilidad.
- No hay informacion sobre el tratamiento de resoluciones altas ni sobre limites practicos antes de que aparezcan duplicaciones de sujeto.
- Uso comercial permitido por la licencia, pero sujeto a las condiciones de compartir igual y a las posibles restricciones de derechos de imagen sobre el personaje.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/lichtj/Jaena
- Descarga de ficheros: https://huggingface.co/lichtj/Jaena/tree/main
- Modelo base: https://huggingface.co/krea/Krea-2-Raw
- Resultados de la busqueda web: no se encontro ningun enlace relacionado con el modelo. Los resultados devueltos apuntan a paginas sobre el autobus Irisbus Agora (Wikipedia, TC Infos, OMSI WebDisk, Lignes-Transports) y son irrelevantes para esta ficha.
