# AI-KSK/minimax-h3-keyframe-timeline-two-graphs-300

## Resumen

El repositorio `AI-KSK/minimax-h3-keyframe-timeline-two-graphs-300`, publicado por el usuario AI-KSK, no contiene un modelo de pesos en el sentido habitual del termino. Se trata de un paquete de dos flujos de trabajo (workflows) en formato JSON para ComfyUI orientados a la generacion de video con MiniMax H3, una familia de modelos de video de MiniMax. El repositorio ocupa 0.0 GB y no incluye pesos, LoRAs ni medios de entrada; unicamente los grafos de nodos y las imagenes de portada.

El primer grafo, denominado FL2VA (First/Last Frame with Keyframe Timeline), esta pensado para generar video a partir de un primer y ultimo fotograma con control de linea temporal mediante keyframes. El segundo, Ref2VA (Multi-Reference with Keyframe Story Beats), esta orientado a generacion con multiples referencias visuales y control de la narrativa por keyframes. Ambos grafos usan nodos de muestreo personalizados (`SamplerCustomAdvanced` y `KSamplerSelect`) en lugar de un `KSampler` unico, e incluyen nodos de audio.

La relevancia de este repositorio es practica: documenta configuraciones de grafo reutilizables para pipelines de generacion de video con MiniMax H3 en ComfyUI. No obstante, el propio autor advierte de que no se ha ejecutado ninguna inferencia para este paquete: no hay clips renderizados, ni hojas de comparacion, ni mediciones de tiempo. Tampoco se incluyen los pesos del modelo base ni los medios de entrada, por lo que la licencia de cada componente debe verificarse por separado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (el repositorio contiene grafos de ComfyUI para MiniMax H3, no pesos de modelo) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | no aplica; el contenido son archivos JSON de workflow e imagenes PNG de portada |

Datos adicionales del repositorio:

| Parametro | Valor |
|---|---|
| ID en HuggingFace | AI-KSK/minimax-h3-keyframe-timeline-two-graphs-300 |
| Autor | AI-KSK |
| Descargas | 0 |
| Likes | 0 |
| Tamano del repo | 0.0 GB |
| Fecha de creacion | 2026-11-02 |
| Ultima actualizacion | 2026-11-02 |
| Etiquetas | region:us |

## Arquitectura y entrenamiento

No disponible. El repositorio no contiene pesos ni documentacion sobre arquitectura o entrenamiento del modelo MiniMax H3. Lo que si documenta la model card es la estructura de los dos grafos:

- Grafo FL2VA: 80 nodos, 128 enlaces, 6 grupos y 35 tipos de nodo. El muestreo se realiza mediante nodos personalizados (`SamplerCustomAdvanced` x3, `KSamplerSelect` x1), con nodos de programacion y guiado (`RandomNoise` x1, `BasicGuider` x3). No carga ningun nodo LoRA (0). Incluye nodos de audio.
- Grafo Ref2VA: 87 nodos, 141 enlaces, 6 grupos y 40 tipos de nodo. Misma configuracion de muestreo personalizado (`SamplerCustomAdvanced` x3, `KSamplerSelect` x1), `RandomNoise` x1 y `BasicGuider` x3. Tampoco carga nodos LoRA (0). Incluye nodos de audio.

No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de RLHF o DPO, ya que el modelo base MiniMax H3 no se distribuye en este repositorio.

## Capacidades

- Generacion de video a partir de primer y ultimo fotograma (FL2VA) con control de la linea temporal mediante keyframes.
- Generacion de video con multiples referencias visuales (Ref2VA) y control de la narrativa por keyframes.
- Control de movimiento y correccion de acciones segun los nombres de los workflows (Motion Lab, reparacion de accion).
- Integracion con nodos de audio en ambos grafos.
- Muestreo personalizado avanzado mediante `SamplerCustomAdvanced` y `KSamplerSelect`, lo que permite cadenas de muestreo mas flexibles que un `KSampler` unico.
- Compatibilidad con ComfyUI (los workflows son JSON de grafos de nodos).
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso ni multilingues, al no tratarse de un modelo de lenguaje.

## Casos de uso

- Prototipado de pipelines de video en ComfyUI: los grafos sirven como plantilla para montar rapidamente un flujo de generacion con MiniMax H3, partiendo de una estructura de 80-87 nodos ya cableada.
- Generacion de transiciones entre fotogramas: el grafo FL2VA permite interpolar entre un primer y un ultimo fotograma con keyframes intermedios, util para animaticos y previsionados.
- Video con consistencia de personaje o producto: el grafo Ref2VA, al aceptar multiples referencias, se puede usar para mantener la apariencia de un sujeto a lo largo de varias tomas.
- Control narrativo por beats: los keyframes de historia del grafo Ref2VA permiten fijar momentos clave de una secuencia y dejar que el modelo rellene el movimiento intermedio.
- Postproduccion de accion: el workflow etiquetado como Motion Lab con reparacion de accion esta pensado para corregir o reforzar movimiento en clips generados.
- Integracion en entornos gestionados: la model card enlaza a RunningHub, lo que sugiere su uso como plantilla en plataformas de ejecucion en la nube sin necesidad de montar la infraestructura local.
- Base para experimentacion con muestreo personalizado: al emplear `SamplerCustomAdvanced` y `KSamplerSelect`, el grafo es un punto de partida para probar schedulers y guiders alternativos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor indica explicitamente que no se ejecuto ninguna inferencia para este paquete: no hay clip renderizado, ni hoja de comparacion, ni mediciones de tiempo.

## Requisitos de hardware

- VRAM estimada: no disponible. El repositorio no incluye pesos y no documenta requisitos de memoria.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue: ComfyUI (los workflows son grafos JSON para este entorno). La model card enlaza tambien a RunningHub como plataforma de ejecucion.
- Latencia y throughput: no disponible; no se realizaron mediciones de inferencia.

## Comparativa con modelos similares

No disponible. No se dispone de datos de rendimiento ni de especificaciones del modelo base MiniMax H3 en la informacion proporcionada, por lo que no es posible establecer una comparacion rigurosa con alternativas.

## Limitaciones y advertencias

- El repositorio no contiene pesos de modelo, LoRAs ni medios de entrada; solo los grafos JSON y las imagenes de portada.
- No se ha ejecutado inferencia para este paquete: no hay evidencia de que los grafos funcionen tal cual ni de la calidad del resultado.
- Las imagenes de portada son stills promocionales generados por IA, no salidas de los grafos; no deben tomarse como muestra del rendimiento.
- La licencia no esta declarada en el repositorio; debe verificarse por separado la licencia de los pesos de MiniMax H3, de los nodos personalizados y de los medios de entrada.
- El nombre del repositorio incluye el sufijo "300", sin que la model card explique su significado.
- Al depender de nodos personalizados (`SamplerCustomAdvanced`, `KSamplerSelect`, `BasicGuider`, `RandomNoise`), la reproducibilidad depende de tener instalados los paquetes de nodos correctos y sus versiones.
- Riesgo de alucinacion y sesgos: no aplica directamente al repositorio, pero si al modelo base MiniMax H3, sobre el que no se aporta informacion en esta ficha.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/AI-KSK/minimax-h3-keyframe-timeline-two-graphs-300
- RunningHub (workflow FL2VA): https://www.runninghub.ai/zh-cn/post/2094644485325156353?inviteCode=rh-v1111
- RunningHub (workflow Ref2VA): https://www.runninghub.ai/zh-cn/post/2094644471542673409?inviteCode=rh-v1111
