# ExperimentField/Aspaklarya-108b-step2360

## Resumen

Aspaklarya-108b-step2360 es un adaptador LoRA de tipo PEFT desarrollado por ExperimentField sobre el modelo base Qwen/Qwen3-VL-8B-Instruct, un modelo vision-language de 8 mil millones de parametros de la familia Qwen3. El adaptador esta especializado en tareas de teledeteccion (remote sensing): respuesta visual a preguntas (VQA) e image captioning sobre imagenes de satelite o aereas. No se trata de un modelo autonomo, sino de un conjunto de pesos de bajo rango que deben combinarse con el modelo base para funcionar.

Este checkpoint concreto corresponde al experimento `exp108s2024` del programa Aspaklarya, una replicacion de semilla de la receta de 19K items con semilla 2024. A diferencia de la ronda 0XX del programa, esta version es un modelo de respuesta verbosa: responde a VQA con varias frases de razonamiento fundamentado en lugar de una sola palabra. El adaptador entrena tambien la torre de vision, no solo las capas de lenguaje.

Su relevancia es metodologica y de dominio: forma parte de un programa de ablacion sistematica que publica su propio suelo de ruido, retracta resultados erroneos y advierte explicitamente sobre la interpretabilidad de las diferencias de puntuacion. Para investigadores en teledeteccion, ofrece un punto de partida reproducible y honesto sobre lo que un LoRA de rango 16 puede aportar a un VLM de 8B en dominios especializados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre transformer vision-language Qwen3-VL-8B-Instruct |
| Parametros totales | no disponible (adaptador LoRA de r=16 sobre base de 8B) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 2048 tokens de secuencia de entrenamiento (contexto del modelo base: no disponible en la informacion proporcionada) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (adaptador PEFT) |
| Rango LoRA | r=16, alpha=16, dropout=0.0 |
| Tamano del repo | 0.2 GB |
| Modelo base | Qwen/Qwen3-VL-8B-Instruct |
| Resolucion maxima de imagen | 1024 px lado maximo |

## Arquitectura y entrenamiento

El adaptador se aplica sobre Qwen3-VL-8B-Instruct, un modelo vision-language con torre de vision y decoder de lenguaje. El LoRA emplea rango 16, alpha 16 y dropout 0.0, y a diferencia de muchos adaptadores visuales, entrena tambien la torre de vision, lo que permite adaptar la representacion visual al dominio de teledeteccion y no solo la generacion de texto.

El entrenamiento uso un corpus de 18.862 items sobre 6.288 imagenes (6.288 caption + 12.574 VQA), con 2 preguntas-respuesta y 1 caption por imagen. La funcion de perdida usa ponderacion por token con w_caption=1.0 y w_vqa=1.0. Se optimizo con lr 0.0002, schedule lineal, warmup 0.03, weight decay 0.001 y gradient clipping 0.3, con batch efectivo de 32 (4 x 8 de acumulacion) durante 4.0 epocas, secuencia de 2048 y lado maximo de imagen de 1024. La semilla fue 2024 y el checkpoint publicado corresponde al step 2360. No se menciona RLHF ni DPO; el ajuste es supervisado sobre pares imagen-texto.

## Capacidades

- Respuesta visual a preguntas (VQA) sobre imagenes de teledeteccion, con respuestas verbosas de varias frases y razonamiento fundamentado.
- Image captioning descriptivo de escenas aereas y satelitales.
- Razonamiento visual de dominio: interpretacion de contenido de imagen remota (no verificado a nivel de pixel por el juez).
- Capacidades heredadas del modelo base Qwen3-VL-8B-Instruct (generacion de texto, codigo, matematicas, tool calling): no documentadas especificamente para este adaptador.
- Capacidades multilingues: no documentadas en la informacion disponible.
- No se documenta modo thinking, audio ni agentes multi-paso para este adaptador.

## Casos de uso

- Anotacion automatica de imagenes satelitales: generar captions descriptivos para grandes archivos de imagenes de observacion de la Tierra, reduciendo el trabajo manual de etiquetado inicial.
- Generacion de informes de escena: dado un recorte aereo, producir una descripcion en varias frases utiles para documentacion de misiones o catalogos geoespaciales.
- Asistencia a analistas de teledeteccion: responder preguntas en lenguaje natural sobre el contenido de una imagen (presencia de infraestructura, tipo de cobertura del suelo, cambios aparentes) como primer filtro antes de la revision humana.
- Enriquecimiento de bases de datos geoespaciales: poblar metadatos textuales a partir de imagenes para mejorar la busqueda semantica en catalogos.
- Investigacion en adaptacion de VLMs: servir como checkpoint de referencia en experimentos de ablacion sobre recetas de ajuste fino con LoRA en dominios especializados.
- Prototipado de pipelines de VQA de dominio: integrar el adaptador en un flujo de transformers + PEFT para validar rapidamente la viabilidad de un asistente visual especializado antes de invertir en un ajuste completo.

## Benchmarks y rendimiento

Evaluacion con LLM-as-judge (`gemma-4-31b-it-imiai`), decodificacion greedy, temperatura 0, escala 0-100, sobre una muestra fija con semilla 1105.

| Slice | Conjunto de prompts | Tokens nuevos | n | Puntuacion |
|---|---|---|---|---|
| VQA DM | `VQA_1126` (verboso) | 160 | 500 | 72.66 |
| VQA RSICD | legacy terse | 48 | 500 | 70.83 |
| Caption DM | banco caption-query | 320 | 491 | 82.1 |
| Caption RSICD | banco caption-query | 320 | 500 | 78.58 |
| MEAN4 | | | 1.991 | 76.04 |

Referencias en la misma muestra (MEAN4): Aspaklarya-101-step4500 76.72, Aspaklarya-106-soup 76.36, Aspaklarya-020-step4500 74.90, DeanQwen3-8B 64.84, Qwen3-VL-8B-Instruct original 61.34. Este checkpoint ocupa el puesto 15 de 70 checkpoints puntuados del programa.

Suelo de ruido medido por el programa: control MEAN4 75.52 (sd 0.19, n=3); sigma VQA DM 0.88; sigma VQA RSICD 0.74; sigma Caption DM 0.25; sigma Caption RSICD 0.52; reproducibilidad del juez ~0.01; dispersion en reejecucion con misma semilla 0.30.

## Requisitos de hardware

- El adaptador pesa 0.2 GB; el requisito real lo marca el modelo base Qwen3-VL-8B-Instruct.
- VRAM estimada para el modelo base en precision completa (bf16/fp16): aproximadamente 16-18 GB solo para pesos, mas overhead de activaciones y cache KV; en la practica se recomienda 24 GB o mas.
- GPU recomendadas: A100 40/80 GB, H100, L40S para produccion; RTX 4090 (24 GB) viable en bf16 con cuidado de memoria o en cuantizacion de 8 bits.
- GPU de consumo: posible en RTX 3090/4090 (24 GB) con cuantizacion; en GPUs de 16 GB requeriria cuantizacion agresiva del base, no documentada para este adaptador.
- Despliegue: transformers + PEFT (metodo documentado en la model card); vLLM, TGI, llama.cpp u Ollama no estan documentados para este adaptador (los adaptadores PEFT sobre VLMs tienen soporte variable en estos motores).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | MEAN4 | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Aspaklarya-108b-step2360 | LoRA r=16 sobre 8B | 2048 (entrenamiento) | 76.04 | no disponible | Hugging Face |
| Aspaklarya-101-step4500 | LoRA sobre 8B | no disponible | 76.72 | no disponible | Hugging Face |
| Aspaklarya-106-soup | mezcla de LoRA sobre 8B | no disponible | 76.36 | no disponible | Hugging Face |
| Qwen3-VL-8B-Instruct (base) | 8B | no disponible | 61.34 | no disponible | Hugging Face |

Las diferencias entre Aspaklarya-108b, 101 y 106 estan dentro o cerca del umbral de interpretabilidad de ~0.5 en MEAN4 segun el propio programa; no deben interpretarse como superioridad de un checkpoint sobre otro.

## Limitaciones y advertencias

- El juez de evaluacion es solo texto: compara la respuesta con una referencia y nunca ve la imagen, por lo que detecta especificidad no respaldada pero no falsedades verificadas; la correccion a nivel de pixel requiere revision humana.
- El benchmark legacy terse no es un objetivo justo para la ronda 1XX: sus referencias son de ~4 caracteres y su rubrica limita a 89/100 una respuesta correcta pero verbosa, de modo que un modelo verboso no puede alcanzar la banda superior aunque sea preciso.
- Las puntuaciones son en dominio (teledeteccion); no miden VQA de proposito general.
- Diferencias de MEAN4 por debajo de ~0.5 y de VQA de una sola slice por debajo de ~1.8 no son interpretables a partir de un solo par de ejecuciones.
- Reejecutar con la misma semilla mueve la puntuacion ~0.30 por kernels CUDA no deterministas; la replicacion exacta no es alcanzable.
- Seleccionar el checkpoint de mayor puntuacion entre varios y citarlo constituye seleccion sobre ruido.
- Licencia no disponible: no se puede confirmar el uso comercial del adaptador ni del modelo base sin consultar sus terminos.
- Riesgo de alucinacion y sesgos: no documentados especificamente; aplican los del modelo base Qwen3-VL-8B-Instruct.
- Idiomas soportados no documentados; el corpus de entrenamiento parece orientado a una unica lengua no especificada.
- Es un adaptador, no un modelo autonomo: requiere cargar el base Qwen/Qwen3-VL-8B-Instruct.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ExperimentField/Aspaklarya-108b-step2360
- Organizacion ExperimentField (contexto del programa, hiperparametros, suelo de ruido y resultados retractados): https://huggingface.co/ExperimentField
- Modelo base: https://huggingface.co/Qwen/Qwen3-VL-8B-Instruct
