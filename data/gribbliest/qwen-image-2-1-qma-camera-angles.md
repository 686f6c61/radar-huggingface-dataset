# gribbliest/qwen-image-2.1-qma-camera-angles

## Resumen

QMA Camera Angles es un adapter LoRA de edicion de imagen publicado por el usuario gribbliest sobre el modelo base Qwen/Qwen-Image-2.1. No es un modelo completo, sino un adaptador de rango 64 que se acopla al transformer de difusion de Qwen-Image-2.1 para modificar exclusivamente la posicion de camara de una imagen de entrada: orbita alrededor del sujeto, sube o baja el punto de vista y cambia la distancia focal aparente, manteniendo (en la medida de lo posible) el sujeto, la escena y el estilo originales. El repositorio ocupa 0,3 GB y la licencia declarada es apache-2.0.

El problema que resuelve es concreto para flujos de trabajo de edicion y sintesis de vistas: en lugar de reescribir un prompt completo para cambiar de angulo, el modelo acepta una sintaxis fija de tres parametros anclada al token de instancia `<qma>`: azimut, elevacion y distancia. Cada parametro admite un conjunto cerrado de valores (8 azimuts, 4 elevaciones y 3 distancias), lo que da 96 combinaciones cubiertas durante el entrenamiento. Esto lo hace util para pipelines de previsualizacion, generacion de multiples vistas de un mismo producto o personaje, y para construir controles tipo "arrastrar la camara" en interfaces graficas.

Es relevante ahora porque Qwen-Image-2.1 es un modelo de edicion imagen-a-imagen con soporte nativo en diffusers y ComfyUI, y este tipo de LoRAs de control geometrico fino son piezas que permiten convertir un editor de imagenes generico en una herramienta con control de punto de vista explicito y determinista, sin depender de prompts ambiguos. El modelo acumula 94 descargas y 14 "likes" en HuggingFace en la fecha de consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (rango 64) sobre el transformer de difusion del modelo base Qwen/Qwen-Image-2.1 |
| Parametros totales | no disponible (el repositorio completo ocupa 0,3 GB) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (depende del modelo base sobre el que se aplique) |
| Idiomas soportados | no disponibles (los prompts de camara del README estan redactados en ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | no disponible (la libreria declarada es diffusers) |

## Arquitectura y entrenamiento

El adaptador es un LoRA de rango 64 entrenado con AI-Toolkit durante 3.000 pasos, con resoluciones de 512 y 1024. Se acopla al modelo base Qwen-Image-2.1, que actua como editor imagen-a-imagen: siempre requiere una imagen de referencia de entrada y el pipeline declarado es image-to-image. El disparador de instancia es el token `<qma>`, al que siguen tres modificadores de camara en orden estricto: azimut, elevacion y distancia.

El dataset de entrenamiento combina fotografias y renders generados en Blender. Cada par de ejemplos muestra el mismo sujeto y la misma escena capturados desde dos posiciones de camara distintas, cubriendo las 96 combinaciones posibles de azimut (8 valores), altura de camara (4 valores) y distancia (3 valores). La semantica direccional esta definida respecto a la camara original y no respecto al sujeto: por ejemplo, "right side view" implica que la camara gira 90 grados sobre su propio eje alrededor del sujeto. El README no especifica el numero de tokens, la composicion exacta del dataset ni si se aplicaron etapas de RLHF o DPO (no aplicables de forma directa a un flujo de difusion de edicion).

## Capacidades

- Edicion de imagen con control explicito de camara: orbita completa alrededor del sujeto, cambio de elevacion y cambio de distancia.
- Sintesis de vistas multiples de un mismo sujeto, escena y estilo a partir de una sola imagen de referencia.
- Azimuts soportados: front view, front-right quarter view, right side view, back-right quarter view, back view, back-left quarter view, left side view y front-left quarter view.
- Elevaciones soportadas: low-angle shot, eye-level shot, elevated shot y high-angle shot.
- Distancias soportadas: close-up, medium shot y wide shot.
- Composicion con otras instrucciones de edicion: el prompt de camara puede ir seguido de instrucciones adicionales, aunque el propio autor indica que los resultados mas limpios se obtienen usando solo el prompt de camara.
- Integracion con ComfyUI mediante el nodo QMA Multi-Angle LoRA Node, que permite construir el prompt arrastrando una camara en lugar de escribirlo a mano.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso, audio ni vision mas alla del propio pipeline de edicion de imagen.

## Casos de uso

- Generacion de vistas de producto para e-commerce: partiendo de una unica fotografia de un articulo, se generan las vistas frontal, lateral, trasera y en cuarto para rellenar la ficha de producto sin volver a fotografiar la pieza.
- Previsualizacion de escenas 3D: dado un render de Blender o un fotograma de concepto, el LoRA permite obtener angulos alternativos de la misma escena para evaluar encuadres antes de comprometerse a un render completo.
- Creacion de hojas de personaje: a partir de un retrato o diseno de personaje, se generan vistas laterales y traseras coherentes para modelado, animacion o referencia de arte conceptual.
- Rotacion de camara para animacion y storyboard: encadenando prompts de azimut creciente se puede construir una secuencia de fotogramas que simula un travelling circular alrededor del sujeto.
- Ajuste de encuadre en postproduccion: cambiar un plano medio por un primer plano (close-up) o ampliar a un plano general (wide shot) sin rehacer la composicion completa de la imagen.
- Integracion en herramientas de edicion con control tipo camara: mediante el nodo de ComfyUI, exponer un control de orbita, altura y distancia en una interfaz grafica para usuarios no tecnicos que necesitan variaciones de angulo de forma repetible.
- Generacion de material para entrenamiento de modelos de vision 3D: producir pares de imagenes del mismo objeto desde angulos conocidos y etiquetados, utiles como datos sinteticos para tareas de reconstruccion o estimacion de pose.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El README del autor no incluye metricas cuantitativas (FID, CLIP score, similitud de sujeto u otras) ni comparaciones numericas con alternativas.

## Requisitos de hardware

- El adaptador en si ocupa 0,3 GB, pero su ejecucion requiere cargar el modelo base Qwen/Qwen-Image-2.1 completo; los requisitos de VRAM del modelo base no se detallan en la informacion proporcionada.
- No disponible: GPU recomendadas, umbral de VRAM para inferencia, y si el conjunto base mas LoRA cabe en GPU de consumo.
- Parametros de inferencia recomendados por el autor: fuerza de LoRA 1.0, 30 pasos, CFG 3, sampler euler y scheduler simple.
- Resolucion de salida recomendada: aproximadamente 1 MP para mejor detalle; 768 se indica como adecuado para previsualizaciones rapidas.
- Opciones de despliegue: libreria diffusers y ComfyUI (mediante el nodo QMA Multi-Angle LoRA Node). No se documentan otros backends como vLLM, llama.cpp, Ollama o TGI, que no aplican a este tipo de modelo.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye LoRAs de control de camara comparables ni datos de rendimiento que permitan establecer una comparacion con alternativas de la misma categoria.

## Limitaciones y advertencias

- Requiere siempre una imagen de referencia: es un LoRA de edicion, no un generador de imagenes desde cero.
- Las orbitas amplias en escenas de paisaje con formato panoramico pueden quedarse cortas respecto a los 90 grados solicitados; el autor recomienda probar otra semilla o el valor de vista contiguo.
- Todo lo que la imagen de origen no muestra (por ejemplo, la espalda de un personaje) debe ser inferido por el modelo: el resultado es una suposicion plausible, no una reconstruccion fiel.
- Fiabilidad desigual por tipo de cambio: los cuartos de vista, las tomas con elevacion y los cambios de distancia son los mas consistentes; los giros completos son los menos fiables.
- La semantica de las direcciones es relativa a la camara original y no al sujeto, lo que puede inducir a error al construir prompts de forma manual.
- Los prompts de camara documentados estan en ingles; no hay informacion sobre el comportamiento con instrucciones en castellano.
- No se documentan sesgos demograficos, culturales o de representacion del LoRA ni del modelo base.
- Riesgo de alucinacion geometrica: la coherencia estructural entre vista original y vista generada no esta garantizada y puede degradarse en geometrias complejas.
- Restricciones de licencia: el adaptador se publica bajo apache-2.0, pero el uso comercial depende tambien de la licencia del modelo base Qwen/Qwen-Image-2.1, que no se detalla en la informacion proporcionada.
- Para produccion, conviene validar de forma sistematica la consistencia de sujeto y escena entre la imagen de entrada y la generada, ya que no se ofrecen metricas de calidad publicadas.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/gribbliest/qwen-image-2.1-qma-camera-angles
- Modelo base: https://huggingface.co/Qwen/Qwen-Image-2.1
- Nodo de ComfyUI (QMA Multi-Angle LoRA Node, por CoreyCorza): https://github.com/CoreyCorza/QMA-Multi-Angle-Lora-Node
- Ejemplos en video incluidos en el repositorio: https://huggingface.co/gribbliest/qwen-image-2.1-qma-camera-angles/resolve/main/examples/orbit_1.mp4, https://huggingface.co/gribbliest/qwen-image-2.1-qma-camera-angles/resolve/main/examples/orbit_2.mp4, https://huggingface.co/gribbliest/qwen-image-2.1-qma-camera-angles/resolve/main/examples/orbit_3.mp4, https://huggingface.co/gribbliest/qwen-image-2.1-qma-camera-angles/resolve/main/examples/orbit_4.mp4
- Paper o publicacion tecnica del adaptador: no disponible
- Demos adicionales: no disponible
