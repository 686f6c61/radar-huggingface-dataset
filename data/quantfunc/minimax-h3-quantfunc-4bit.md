# QuantFunc/Minimax-H3-Quantfunc-4bit

## Resumen

MiniMax-H3-QuantFunc-4bit es una versión cuantizada a 4 bits del modelo MiniMax H3, un sistema de generación conjunta de vídeo y audio. La publicación corre a cargo de QuantFunc, un proyecto independiente especializado en motores de inferencia y cuantización para modelos de difusión. No se trata de un modelo entrenado desde cero, sino de una re-cuantización del modelo base de MiniMax-AI: reduce el peso del transformador principal de 16 bits a 4 bits (esquema W4A4) manteniendo intactas las capacidades nativas de generación de vídeo con audio.

El problema que resuelve es el coste de VRAM y de ancho de banda de pesos del H3 original en BF16. Con pesos de 12,37 GB por variante, el modelo se vuelve manejable en GPUs de consumo y, según las mediciones del autor en una RTX 4090 (768 × 768, 124 fotogramas, 5 segundos), alcanza 3,2 segundos por paso frente a 10,2 segundos de FP8, lo que supone una aceleración de 3,19 veces por paso en el núcleo del modelo.

La relevancia actual es doble: por un lado democratiza la inferencia local de un generador de vídeo con audio en tarjetas de gama alta de consumo; por otro, documenta una pérdida de calidad medible pero contenida (unos 23,7 dB de PSNR frente a la línea base BF16 en la evaluación interna FL2VA). Se distribuye en dos variantes, FL2VA (4 pasos) y Ref2VA (8 pasos), bajo la licencia comunitaria de MiniMax H3 y con un formato de pesos sellado que exige el motor propio de QuantFunc o la extensión ComfyUI-QuantFunc.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de difusión para generación conjunta de vídeo y audio (text encoder tipo `minimax`, VAE de vídeo y VAE de audio separados); topología interna detallada no disponible |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible (modelo generativo de vídeo; la salida se define por resolución, número de fotogramas y modo de referencia) |
| Tipos de cuantizacion | INT4 en pesos y activaciones (W4A4), SVDQuant con rango 128 y group size 64, INT4 Token Refine, INT8 Conv Sidecar y LoRA de aceleración fusionada |
| Idiomas soportados | no disponible (las etiquetas del repositorio no declaran idiomas) |
| Licencia | minimax-h3-community-license (campo `license: other`) |
| Formato de pesos | safetensors en formato sellado propio de QuantFunc (12,37 GB por variante); no es un checkpoint cargable directamente con el paquete `diffusers` |
| Variantes publicadas | FL2VA (`minimax_h3_fl2va_4step_quantfunc_int4_r128.safetensors`, 4 pasos recomendados) y Ref2VA (`minimax_h3_ref2va_8steps_quantfunc_int4_r128.safetensors`, 8 pasos recomendados) |
| Tamaño del repositorio | 24,8 GB |
| Descargas / likes | 15.137 descargas, 12 likes |

## Arquitectura y entrenamiento

La información disponible describe un transformador de difusión (el autor se refiere a él como «H3 transformer») encargado de generar de forma conjunta vídeo y audio, acompañado de un text encoder de tipo `minimax` y de VAEs diferenciados para vídeo y para audio. El muestreo se realiza con un sampler estándar de ComfyUI, y el motor QuantFunc se ocupa exclusivamente del transformador. No se publican en esta ficha el número de parámetros, la profundidad, el tipo de atención ni el número de tokens de entrenamiento del modelo base.

En cuanto al proceso de cuantización, que es el aporte técnico de esta publicación, se aplica SVDQuant con rango 128 y tamaño de grupo 64, en un esquema W4A4 (pesos y activaciones a 4 bits). El pipeline incorpora además un INT4 Token Refine —un refinador a nivel de tokens en 4 bits— y un INT8 Conv Sidecar para las convoluciones, junto con una LoRA de aceleración. Todos estos componentes ya vienen fusionados en los dos ficheros de pesos, de modo que el usuario no necesita cargarlos por separado. No se especifica si el modelo base pasó por etapas de ajuste con RLHF o DPO; al ser un modelo de difusión, ese tipo de alineamiento no es el mecanismo habitual.

La innovación práctica es la reducción del coste de ancho de banda de pesos: al pasar de 16 a 4 bits, la carga y la inferencia del transformador se abaratan de forma notable, y el autor reporta una pérdida de fidelidad de aproximadamente 23,7 dB de PSNR frente a BF16 en la evaluación interna FL2VA con el mismo prompt y la misma semilla.

## Capacidades

- Generación de vídeo con audio sincronizado a partir de texto (modo FL2VA con cero imágenes de entrada).
- Generación de vídeo a partir de una imagen (primer fotograma), de un último fotograma o de ambos simultáneamente, para controlar el inicio y el final de la secuencia.
- Generación multimodal con referencias: la variante Ref2VA acepta imágenes, vídeo y audio como material de referencia para escenas más complejas.
- Generación vertical: los ejemplos publicados usan 896 × 1184, 124 fotogramas, 24 FPS y unos 5 segundos de duración.
- Coherencia en detalle de personajes, fidelidad de estilo y movimientos rápidos, según los ejemplos del autor (interpretación en vivo, persecución animada, persecución de coches a alta velocidad, personaje estilizado).
- Integración con ComfyUI mediante el nodo QuantFunc MiniMax-H3 Loader, que sustituye al UNETLoader oficial manteniendo el CLIPLoader, los VAE y el sampler de serie.
- No dispone de tool calling, function calling, razonamiento multi-paso ni capacidades de agente: es un modelo generativo de medios, no un modelo de lenguaje conversacional.
- No se declaran capacidades multilingües ni de comprensión de texto más allá del prompt de condicionamiento.

## Casos de uso

- Animáticas y previsualización de storyboards: el modo FL2VA permite fijar el primer y el último fotograma de un plano y generar la transición intermedia con audio, lo que sirve para validar ritmo y duración antes de producir.
- Publicidad y contenido para redes sociales en formato vertical: los ejemplos a 896 × 1184 y 5 segundos encajan con los formatos de vídeo corto, y la variante de 4 pasos reduce el tiempo de iteración por prueba.
- Vídeo musical o piezas con audio integrado: al generar vídeo y audio de forma conjunta, se evita el paso separado de sonorización para bocetos y maquetas.
- Extensión o interpolación de planos en postproducción: usando el último fotograma de un plano existente como condición de entrada y el primero del siguiente como salida, se pueden generar transiciones coherentes.
- Creación de personajes estilizados y secuencias de animación: el modo Ref2VA admite referencias visuales para mantener la identidad del personaje a lo largo de varias generaciones.
- Prototipado rápido en estaciones de trabajo locales: con 12,37 GB de pesos por variante, un estudio con una RTX 4090 o una A100 puede iterar sin depender de servicios en la nube ni de cuotas de API.
- Investigación en cuantización de modelos de difusión: la publicación documenta una configuración SVDQuant W4A4 reproducible (rango 128, group size 64) y cifras comparativas frente a INT8 ConvRot y FP8, útil como referencia para otros trabajos.
- Previsualización de bajo coste antes de un render final en BF16: generar candidatos en INT4 y rehacer en el modelo original únicamente los planos aprobados.

## Benchmarks y rendimiento

Los únicos datos cuantitativos publicados son la fidelidad frente a la línea base y los tiempos por paso del transformador. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K ni equivalentes de vídeo tipo VBench) en la información disponible.

| Métrica | Valor | Condiciones |
|---|---|---|
| PSNR frente a BF16 | ~23,7 dB | Evaluación interna FL2VA, mismo prompt y misma semilla |
| Tiempo por paso, QuantFunc INT4 | 3,2 s | RTX 4090, 768 × 768, 124 fotogramas, 5 s |
| Tiempo por paso, INT8 ConvRot | 8,5 s | mismas condiciones (2,66x más lento) |
| Tiempo por paso, FP8 | 10,2 s | mismas condiciones (3,19x más lento) |

Las cifras de tiempo corresponden únicamente al núcleo del modelo y excluyen el text encoder, los VAE, el procesado de audio y el guardado del vídeo. Como estimación derivada, multiplicar 3,2 s por los 4 pasos recomendados de FL2VA daría unos 12,8 s de inferencia del transformador por clip, y unos 25,6 s en el caso de Ref2VA con 8 pasos; son valores calculados a partir del dato por paso, no medidos de extremo a extremo.

## Requisitos de hardware

- Pesos por variante: 12,37 GB en safetensors. El repositorio completo ocupa 24,8 GB porque contiene las dos variantes.
- VRAM estimada: los pesos de una sola variante caben en GPUs de 24 GB (RTX 4090, RTX 3090, A100 40 GB y superiores), pero la VRAM total necesaria depende de la resolución, el número de fotogramas, el número de activos de referencia y el resto del flujo de trabajo, como advierte el propio autor. No se publica una cifra de VRAM total.
- Compatibilidad declarada: cualquier GPU NVIDIA con capacidad de cómputo SM75 o superior, es decir, RTX 20/30/40/50, A100, H100, H200, B100, B200 y GB300.
- En GPUs de 16 GB o menos: no hay confirmación en la información disponible de que el modelo completo quepa; requeriría descarga de pesos a CPU o reparto entre dispositivos, algo no documentado en esta ficha.
- Despliegue: no es un checkpoint drop-in de `diffusers`. Se carga con la extensión ComfyUI-QuantFunc o con el motor de inferencia QuantFunc. El resto del grafo (CLIPLoader de tipo `minimax`, VAE de vídeo y audio, KSampler) se mantiene con los nodos estándar de ComfyUI.
- Un detalle relevante para producción: el repositorio declara `library_name: diffusers` únicamente para que Hugging Face contabilice las descargas de los ficheros `.safetensors` planos, no porque los pesos se carguen con el paquete `diffusers`.
- Latencia: 3,2 s por paso del transformador en RTX 4090 a 768 × 768 y 124 fotogramas. No se publican datos de throughput agregado, ni de latencia en otras GPUs.

## Comparativa con modelos similares

La comparación más directa disponible es entre el modelo base sin cuantizar y los formatos de precisión reducida citados por el autor. No se dispone de datos de otros generadores de vídeo con audio comparables en esta información.

| Modelo / formato | Precisión | Tiempo por paso (RTX 4090, 768 × 768, 124 f, 5 s) | Velocidad relativa | Licencia |
|---|---|---|---|---|
| QuantFunc MiniMax-H3 INT4 (W4A4) | 4 bits | 3,2 s | 3,19x frente a FP8 | minimax-h3-community-license |
| MiniMax H3 en INT8 ConvRot | 8 bits | 8,5 s | 2,66x más lento | minimax-h3-community-license |
| MiniMax H3 en FP8 | 8 bits | 10,2 s | referencia | minimax-h3-community-license |
| MiniMax H3 en BF16 | 16 bits | no disponible | no disponible | minimax-h3-community-license |

Calidad: la única referencia publicada es el ~23,7 dB de PSNR de la variante INT4 frente a BF16 en la evaluación interna FL2VA. No hay PSNR publicado para INT8 ConvRot ni para FP8, ni comparaciones frente a otros modelos de generación de vídeo de terceros.

## Limitaciones y advertencias

- La cuantización a 4 bits introduce una pérdida de fidelidad medible: unos 23,7 dB de PSNR frente a BF16 según la evaluación interna del autor. Para planos con detalle fino o texto en pantalla puede ser insuficiente frente al modelo original.
- El formato de pesos es sellado y propietario: los parámetros de cuantización y los metadatos no son inspeccionables ni modificables, lo que impide re-cuantizar, fusionar o convertir el modelo a otros formatos como GGUF.
- No es un checkpoint compatible con `diffusers` pese a la etiqueta `library_name: diffusers` del repositorio; intentar cargarlo por esa vía fallará.
- Dependencia de un ecosistema concreto: requiere ComfyUI-QuantFunc actualizado o el motor de inferencia QuantFunc. Si el modelo no se reconoce o falla la carga, la recomendación del autor es actualizar la extensión y reiniciar ComfyUI.
- Licencia `minimax-h3-community-license`, etiquetada como `other`. Es imprescindible revisar sus términos antes de cualquier uso comercial, ya que las condiciones de explotación, atribución y redistribución no están detalladas en esta ficha.
- No hay información sobre idiomas soportados, sesgos de los datos de entrenamiento ni tasa de alucinación o de artefactos por prompt.
- El número de parámetros del modelo base no se publica, lo que dificulta dimensionar con precisión los requisitos de cómputo en hardware distinto del probado.
- Las cifras de rendimiento excluyen text encoder, VAE, audio y guardado, por lo que el tiempo real por clip en producción será sensiblemente superior al calculado a partir del coste por paso.
- El rendimiento depende de la resolución, el número de fotogramas, la versión de controladores y el software; el autor advierte explícitamente de esta variabilidad.
- El modelo no admite tool calling ni razonamiento agéntico: no debe plantearse como sustituto de un LLM en pipelines de automatización text-based.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/QuantFunc/Minimax-H3-Quantfunc-4bit
- Árbol de ficheros del repositorio: https://huggingface.co/QuantFunc/Minimax-H3-Quantfunc-4bit/tree/main
- Perfil de QuantFunc en HuggingFace: https://huggingface.co/QuantFunc
- Sitio web de QuantFunc: https://www.quantfunc.com/
- Extensión ComfyUI-QuantFunc: https://github.com/QuantFunc/ComfyUI-QuantFunc
- Flujo de trabajo de ejemplo (QuantFunc-MiniMaxH3-fl2va): https://github.com/QuantFunc/ComfyUI-QuantFunc/blob/main/example_workflows/QuantFunc-MiniMaxH3-fl2va.json
- Repositorio oficial de MiniMax H3: https://github.com/MiniMax-AI/MiniMax-H3
- Perfil de QuantFunc en ModelScope: https://www.modelscope.cn/profile/QuantFunc
- Documentación de Hugging Face sobre estadísticas de descargas: https://huggingface.co/docs/hub/models-download-stats
- Servidor de Discord de QuantFunc: https://discord.gg/jCp9TpFWcn
