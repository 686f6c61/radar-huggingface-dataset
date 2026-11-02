# AI-KSK/minimax-h3-martial-arts-two-graphs-301

## Resumen

`AI-KSK/minimax-h3-martial-arts-two-graphs-301` no es un modelo de lenguaje, sino un paquete de dos flujos de trabajo (workflows) en formato JSON para ComfyUI orientados a la generacion de video de artes marciales con el modelo MiniMax H3. El repositorio contiene unicamente el estado guardado de dos grafos de nodos: uno con condicionamiento por primer y ultimo fotograma y otro con condicionamiento multi-keyframe. No incluye pesos del modelo base, LoRAs, clips de entrada ni audio.

El paquete documenta una pila de cinco LoRAs (aspecto cinematografico, movimiento de camara, fisica espacial de wushu, accion de wushu y una LoRA turbo de 8 pasos) con intensidades concretas guardadas en los widgets, ademas de la configuracion del sampler (seed fija, 20 pasos, CFG 1, euler/simple, denoise 1). Su relevancia es practica: sirve como plantilla reproducible para quien quiera reconstruir un pipeline de video de artes marciales en ComfyUI, aunque el propio autor advierte que no se ejecuto ninguna inferencia para validar el paquete.

El repositorio ocupa 0.0 GB y no contiene ningun artefacto de modelo. Cualquier evaluacion de calidad, latencia o rendimiento queda fuera del alcance de lo publicado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (el paquete contiene grafos ComfyUI, no pesos de modelo) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | JSON de workflow ComfyUI; LoRAs referenciadas en `.safetensors` (no incluidas) |

## Arquitectura y entrenamiento

El contenido no es un modelo entrenado sino la serializacion de dos grafos de ComfyUI. El primero tiene 119 nodos, 111 enlaces, 24 grupos y 46 tipos de nodo distintos; el segundo (multi-keyframe) tiene 138 nodos, 152 enlaces, 25 grupos y 49 tipos de nodo. Ambos usan nodos `SetNode`/`GetNode` para reutilizar condicionamiento entre grupos, cargan y recortan audio dentro del grafo y emplean un cargador de video como referencia.

La pila de LoRAs guardada es: `Minimax H3真实电影质感V0.1_FeiHouRemix_v0.6_compat_v001_T8.safetensors` (0.5 modelo / 1.0 clip), `camera_motion_h3_lora_v1_3000_pruned.safetensors` (0.3 / 1.0), `wushu_spatial_physics_clean_2500.safetensors` (0.3 / 1.0) y `wushu_action_fl2va_v7_2000step_no_adaln.safetensors` (0.4 / 1.0). El sampler guardado usa seed `755708092963751` fija, 20 pasos, CFG 1, `euler`/`simple` y denoise 1. El autor senala una incoherencia: la pila carga una LoRA turbo de 8 pasos a 0.8 mientras el sampler declara 20 pasos, por lo que recomienda verificar el numero efectivo de pasos en la interfaz de ejecucion. No hay informacion sobre datos de entrenamiento, RLHF/DPO ni innovaciones de atencion.

## Capacidades

- Generacion de video condicionada por primer y ultimo fotograma (variante `two-graphs`).
- Generacion de video con condicionamiento multi-keyframe (variante documentada en la misma model card).
- Mezcla de LoRAs para estilo cinematografico, movimiento de camara y fisica de artes marciales.
- Carga y recorte de audio dentro del propio grafo.
- Uso de un cargador de video como lado de referencia para el condicionamiento.
- Composicion de valores de linea temporal mediante nodos matematicos (2 en el primer grafo, 8 en el segundo).
- No se documentan capacidades de texto, codigo, tool calling, agentes ni vision mas alla del pipeline de video.

## Casos de uso

- Reconstruccion de un pipeline de video de artes marciales en ComfyUI: importar el JSON y sustituir los pesos y LoRAs referenciados por los propios, ya que el paquete no los incluye.
- Prototipado de condicionamiento primer/ultimo fotograma: el grafo de 119 nodos sirve como referencia de cableado para interpolar movimiento entre dos keyframes.
- Experimentacion con multi-keyframe: el segundo grafo (138 nodos) muestra como encadenar varios keyframes y compartir condicionamiento mediante `SetNode`/`GetNode`.
- Estudio de mezcla de LoRAs: las intensidades guardadas (0.3-0.5 en modelo, 1.0 en clip) sirven como punto de partida para ajustar estilo, fisica y camara en footage propio.
- Integracion en RunningHub: ambos grafos enlazan a paginas de RunningHub, lo que permite ejecutarlos en esa plataforma sin montar infraestructura local.
- Base docente o de auditoria: util para revisar la estructura de un grafo complejo (hasta 49 tipos de nodo) sin necesidad de ejecutar inferencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor indica explicitamente que no se ejecuto inferencia, no hay clip renderizado, ni hoja A/B, ni medicion de tiempos.

## Requisitos de hardware

- VRAM estimada: no disponible; depende del modelo MiniMax H3 y de las LoRAs, que no se incluyen en el paquete.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue: ComfyUI (formato nativo de los grafos) y la plataforma RunningHub referenciada en la model card.
- Latencia y throughput: no disponibles; el autor no realizo pruebas de velocidad.

## Comparativa con modelos similares

No disponible. El paquete no es un modelo con parametros, contexto o licencia comparables; es un conjunto de workflows para MiniMax H3 y no se han identificado en la informacion proporcionada alternativas equivalentes de grafos publicados.

## Limitaciones y advertencias

- El paquete no incluye pesos del modelo base, LoRAs, clips de entrada ni audio; hay que obtenerlos por separado y revisar cada licencia.
- No se ejecuto ninguna inferencia: no hay evidencia de que los grafos funcionen tal cual ni de la calidad del resultado.
- Incoherencia entre la LoRA turbo de 8 pasos (0.8) y el sampler a 20 pasos; verificar el numero efectivo de pasos antes de confiar en los valores guardados.
- Las portadas son fotogramas promocionales generados por IA con marca de agua de plataforma, no salidas del workflow.
- Las afirmaciones del titulo del video sobre movimiento y "mezcla de tres LoRAs" son encuadre del autor, no verificadas.
- Licencia no declarada: no hay base para asumir uso comercial permitido.
- Idiomas y sesgos: no disponibles.
- Riesgo de alucinacion y limitaciones de contexto: no aplicables a un artefacto de workflow, pero si al modelo MiniMax H3 subyacente, sobre el que este repositorio no aporta informacion.

## Enlaces

- HuggingFace: https://huggingface.co/AI-KSK/minimax-h3-martial-arts-two-graphs-301
- RunningHub (grafo primer/ultimo fotograma): https://www.runninghub.ai/zh-cn/post/2096152360778584065/?inviteCode=rh-v1111
- RunningHub (grafo multi-keyframe): https://www.runninghub.ai/zh-cn/post/2095907246101291010/?inviteCode=rh-v1111
- Video tutorial (YouTube): https://www.youtube.com/watch?v=3Ak4mkrhOrY
- Espejo en Bilibili: https://www.bilibili.com/video/BV1rBty6AENs
