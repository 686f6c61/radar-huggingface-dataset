# Simzy/MiniMax-H3-Character-Swap-LoRA

## Resumen

MiniMax-H3 Character-Swap LoRA es un adaptador LoRA para el modelo base MiniMax-H3 (Ref2VA) orientado a la edicion de video mediante sustitucion de personajes. Lo desarrolla Simzy (con material y flujo de trabajo asociado a akatz-ai) y resuelve un problema concreto: reemplazar a una persona seleccionada en un video de origen por un personaje proporcionado en una imagen de referencia, manteniendo la interpretacion, la pose, la mirada y la expresion originales. Es relevante ahora porque el video-to-video con preservacion de identidad se ha convertido en una de las tareas mas demandadas en pipelines creativos y de postproduccion, y este adaptador se distribuye como un fichero unico de 0,3 GB integrable en ComfyUI.

El adaptador no es un modelo autonomo: requiere el modelo base H3 Ref2VA, el text encoder y los VAE por separado, ademas de un LoRA Turbo opcional para reducir pasos de muestreo. La version recomendada es V1.5 (`h3_character_swap_v1.5.safetensors`), que sustituye a V1 (`h3_character_swap_pro4500_1000.safetensors`) para nuevos trabajos, aunque V1 se conserva por reproducibilidad.

La licencia es la MiniMax-H3 Community License Agreement, lo que condiciona el uso comercial. El modelo se publico el 22 de noviembre de 2026 y no registra descargas ni interacciones en el momento de redactar esta ficha.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (adaptador de bajo rango) sobre modelo de difusion de video MiniMax-H3 Ref2VA |
| Parametros totales | no disponible (adaptador LoRA; el repo pesa 0,3 GB) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (condicionado por la ventana del modelo base H3 Ref2VA) |
| Tipos de cuantizacion | no disponible para el LoRA; el recetario probado usa base Ref2VA INT8 y Turbo en BF16 |
| Idiomas soportados | en |
| Licencia | minimax-h3-community-license-agreement (etiquetada como `other`) |
| Formato de pesos | safetensors (fichero unico, `diffusion-single-file`) |

## Arquitectura y entrenamiento

El adaptador es un LoRA de bajo rango pensado para cargarse sobre el modelo de difusion de video MiniMax-H3 en su variante Ref2VA (referencia a video con audio). No modifica la arquitectura del modelo base: inyecta matrices de bajo rango en las capas del transformer de difusion para especializarlo en la tarea de sustitucion de personajes. El fichero se distribuye como safetensors unico y se carga con un loader de LoRA compatible en ComfyUI a fuerza 1.0.

El entrenamiento se realizo sobre el dataset `akatz-ai/H3-Character-Swap-v1`, que forma parte del linaje de V1 pero no contiene la mezcla completa de V1.5. La procedencia de V1.5 se documenta en `training/v1.5/run-summary.json`, con hash de release, inicializacion, actualizaciones completadas y ajustes de entrenamiento. Los metadatos embebidos conservan el nombre interno V2 y el presupuesto original de 2.250 actualizaciones. El autor no detalla el numero de tokens, la composicion exacta del dataset ni si se empleo RLHF o DPO; no disponible.

El recetario probado combina el base Ref2VA INT8, este adaptador a fuerza 1.0 y el LoRA `minimax_h3_fl2v_turbo_8step_v1.0_768p_comfyui_bf16.safetensors` a fuerza 1.0, con 8 pasos, CFG 1, sampler `er_sde` y scheduler `normal`. El flujo nativo recomendado es H3 Relay 2.0, que gestiona mascaras SAM, anclajes de escena, condicionamiento de audio de origen e historial de continuacion.

## Capacidades

- Edicion de video con sustitucion de personaje: reemplaza a una persona seleccionada en un video por la identidad de una imagen de referencia.
- Preservacion de la interpretacion: mantiene pose, mirada, expresion y movimiento del video de origen.
- Preservacion de identidad de referencia: retiene rostro, cabello y vestuario del personaje de referencia, con mejoras notables en V1.5 frente a V1 en caras estilizadas.
- Conservacion de escena: mantiene el entorno y el resto de personas presentes en el plano.
- Condicionamiento de audio de origen: el flujo asociado conserva la banda sonora original en la exportacion.
- Integracion con ComfyUI mediante carga de LoRA en modo model-only y flujos nativos o de API.
- Soporte de mascaras SAM y anclajes de escena opcionales a traves de la herramienta H3 Character Swap.
- Capacidad de continuacion por segmentos con historial, orientada a planos largos.
- No soporta tool calling, function calling ni razonamiento multi-paso: es un adaptador de difusion de video, no un modelo de lenguaje.

## Casos de uso

- Postproduccion de ficcion y doblaje visual: sustituir al actor de un plano por un personaje de referencia manteniendo la interpretacion original, util para reshoots imposibles o cambios de casting en fase tardia.
- Prototipado de personajes en animacion: aplicar una hoja de personaje a un video de referencia de movimiento para validar diseno e identidad antes de producir la animacion final.
- Publicidad y contenido de marca: adaptar una misma pieza de video a distintos embajadores o mascotas de marca usando una imagen de referencia por variante, con el flujo H3 Relay 2.0 para gestionar mascaras y anclajes.
- Contenido para redes sociales: reemplazar la identidad de un creador en clips cortos a 24 fps con planos continuos, aprovechando el recetario Turbo de 8 pasos para reducir tiempos de muestreo.
- Videojuegos y cinemáticas: sustituir el modelo de captura de movimiento por el personaje final del juego, conservando la actuacion capturada y la escena.
- Localizacion de contenido: regenerar piezas con un personaje local distinto por region manteniendo el guion visual y el audio original.
- Investigacion en edicion de video: usar V1 y V1.5 como linea base reproducible en experimentos de preservacion de identidad, dado que el autor conserva ambos checkpoints y la procedencia de entrenamiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor incluye una comparacion cualitativa V1 frente a V1.5 en video, con ejemplos seleccionados en los que V1 pierde la identidad de referencia o revierte a la apariencia de origen, pero advierte explicitamente que no constituye un benchmark agregado ni una afirmacion de mejora uniforme.

## Requisitos de hardware

- El LoRA pesa 0,3 GB, pero requiere cargar el modelo base H3 Ref2VA, el text encoder y los VAE, que dominan el consumo de VRAM. No disponible la VRAM exacta del conjunto.
- El recetario probado usa base Ref2VA en INT8, lo que reduce los requisitos frente a BF16, pero el autor no publica cifras de VRAM.
- GPU recomendadas: no disponible de forma explicita. El autor menciona que los controles de segmentos largos no garantizan idoneidad para cualquier GPU, lo que implica que el conjunto es exigente.
- No se confirma que quepa en GPU de consumo; el uso de INT8 en el base sugiere que se apunta a ese segmento, pero sin cifras verificables.
- Opciones de despliegue: ComfyUI con loader de LoRA model-only, flujo nativo H3 Relay 2.0 (canvas o API), y flujos V1 de Turbo8 adaptativo.
- Latencia y throughput: no disponible. El recetario de 8 pasos con CFG 1 y sampler `er_sde` esta disenado para minimizar pasos de muestreo.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye modelos comparables de sustitucion de personajes en video con los que contrastar parametros, contexto, rendimiento o licencia. La unica comparacion interna disponible es V1 frente a V1.5 del mismo adaptador.

## Limitaciones y advertencias

- Modelo experimental: la identidad, el timing respecto al origen, las expresiones, las oclusiones y los cortes pueden derivar.
- Un default recomendado no implica que todos los planos mejoren respecto a V1; la evaluacion amplia sigue en curso segun el autor.
- El LoRA no es autonomo: no incluye el base, el asistente de entrenamiento, los VAE ni los pesos Turbo.
- La conservacion del audio original es una funcion de la herramienta de aplicacion, no evidencia de que el LoRA reproduzca audio con precision ni de que el lip sync sea exacto.
- Los controles de segmentos largos de la herramienta no garantizan calidad en planos largos ni idoneidad para cualquier GPU.
- Los ejemplos y el showcase publicados son resultados de V1, no demostraciones de V1.5.
- Solo idioma ingles declarado (`en`).
- Licencia MiniMax-H3 Community License Agreement: revisar condiciones antes de cualquier uso comercial, ya que no es una licencia permisiva estandar.
- Riesgo de sesgos y alucinacion visual no documentado por el autor; no disponible.
- Uso responsable: la sustitucion de identidad en video plantea riesgos de suplantacion y deepfakes; el autor no incluye salvaguardas tecnicas descritas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Simzy/MiniMax-H3-Character-Swap-LoRA
- Modelo base: https://huggingface.co/Comfy-Org/MiniMax-H3
- Dataset de entrenamiento V1: https://huggingface.co/datasets/akatz-ai/H3-Character-Swap-v1
- Model card original de referencia (akatz-ai): https://huggingface.co/akatz-ai/MiniMax-H3-Character-Swap-LoRA
- Model card y detalles de entrenamiento V1: https://huggingface.co/akatz-ai/MiniMax-H3-Character-Swap-LoRA/blob/a665bb7e3bb9804e487d2925f67744f554c8ad49/README.md
- Repositorio H3 Relay 2.0: https://github.com/akatz-ai/h3-relay
- Perfil X del autor del flujo: https://x.com/akatz_ai
- Patreon: https://www.patreon.com/Akatz
- GitHub Sponsors: https://github.com/sponsors/akatz-ai
- Ko-fi: https://ko-fi.com/akatz
