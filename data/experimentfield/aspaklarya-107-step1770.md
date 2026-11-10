# ExperimentField/Aspaklarya-107-step1770

## Resumen

Aspaklarya-107-step1770 es un adaptador LoRA publicado por la organización ExperimentField para el modelo base Qwen/Qwen3-VL-8B-Instruct, un modelo vision-language de 8.000 millones de parámetros. El adaptador especializa el modelo base en tareas de teledetección (remote sensing): respuesta visual a preguntas (VQA) e image captioning sobre imágenes de satélite y aéreas. Forma parte de un programa de ablación sistemática denominado Aspaklarya, en el que cada checkpoint corresponde a una configuración experimental concreta y se evalúa con un protocolo común.

El checkpoint corresponde al experimento `exp107`, paso 1770, y se distingue de la ronda 0XX del programa por adoptar un estilo de respuesta verboso: en lugar de contestar con una sola palabra, genera varias frases de razonamiento fundamentado sobre la imagen. La variable experimental de este run es un holdout de prompt: las consultas de caption se dividen en train/test para medir sobreajuste al formato del prompt.

El interés del artefacto es doble. Por un lado, ofrece un adaptador ligero (0,2 GB, r=16) que mejora de forma medible sobre el modelo base en el dominio de teledetección según la evaluación del propio autor. Por otro, la model card documenta de forma poco habitual el suelo de ruido del programa de entrenamiento, lo que permite interpretar los resultados con cautela estadística. No se dispone de información sobre licencia, idiomas soportados ni pipeline declarado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre transformer vision-language Qwen3-VL-8B-Instruct |
| Parametros totales | no disponible (adaptador LoRA con r=16, alpha=16; el modelo base tiene 8B) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 2.048 tokens de secuencia de entrenamiento; contexto del modelo base no disponible |
| Tipos de cuantizacion | no disponible (el adaptador se distribuye en safetensors; la cuantización depende del modelo base) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (adaptador PEFT); requiere cargar el base Qwen/Qwen3-VL-8B-Instruct |

## Arquitectura y entrenamiento

El adaptador se aplica sobre Qwen3-VL-8B-Instruct, un transformer vision-language del que no se detallan aquí capas, atención ni configuración del tower visual más allá de que este último sí se entrena. El LoRA usa r=16, alpha=16, dropout=0.0, y se entrena también la torre de visión, lo que lo aleja de un ajuste únicamente textual. La pérdida emplea ponderación por token (`token` weighting) con pesos w_caption=1.0 y w_vqa=1.0.

El corpus de entrenamiento consta de 18.862 ítems sobre 6.288 imágenes (6.288 captions y 12.574 pares VQA, es decir, 2 QA + 1 caption por imagen), con split `train` y columna VQA `VQA_1126`. Se entrenan 3,0 épocas con optimizador de lr 0,0001, schedule coseno, warmup 0,1, weight decay 0,001 y clip 0,3; batch 4 con 8 pasos de acumulación (32 efectivos), longitud de secuencia 2.048 y lado máximo 1.024 píxeles, semilla 3407. La innovación metodológica destacable no está en la arquitectura sino en el diseño experimental: holdout de prompt en caption para detectar sobreajuste al formato y un protocolo de evaluación con juez LLM fijo y muestra fija (semilla 1105) para comparar checkpoints entre sí.

## Capacidades

- Respuesta visual a preguntas (VQA) sobre imágenes de teledetección, con respuestas verbosas de varias frases y razonamiento fundamentado en la imagen.
- Image captioning descriptivo de escenas aéreas y satelitales.
- Razonamiento multimodal de un solo turno orientado a descripción detallada, no a respuesta telegráfica.
- Capacidades heredadas del base Qwen3-VL-8B-Instruct (generación de texto, comprensión de imagen, tool calling y agentes) no verificadas ni evaluadas en este adaptador.
- Capacidades multilingües: no disponibles; la evaluación es únicamente en dominio de teledetección y no se documentan idiomas.
- No se documenta soporte específico de thinking mode, audio ni visión de vídeo para este adaptador.

## Casos de uso

- Anotación asistida de imágenes satelitales: generar captions descriptivos para datasets de teledetección, aprovechando el estilo verboso para producir descripciones ricas que luego un humano revisa y recorta.
- Enriquecimiento de catálogos geoespaciales: dado un mosaico de imágenes aéreas, producir descripciones textuales indexables para búsqueda semántica sobre archivos de imagery.
- VQA en pipelines de análisis territorial: responder preguntas concretas sobre una imagen (tipo de cubierta, presencia de infraestructura, estado de una parcela) con respuestas razonadas que un operador pueda auditar.
- Generación de pares pregunta-respuesta para aumentar datasets de entrenamiento en teledetección, usando el modelo como generador y filtrando después con verificación humana.
- Evaluación comparativa de adaptadores: servir como checkpoint de referencia en experimentos de ablación, dado que el programa publica el suelo de ruido y permite comparaciones estadísticamente informadas.
- Prototipado de asistentes de análisis de imagery para equipos GIS: el adaptador se carga sobre el base con PEFT en pocas líneas y permite validar un flujo VQA/caption antes de invertir en un modelo mayor.

## Benchmarks y rendimiento

Evaluación del autor con juez LLM (`gemma-4-31b-it-imiai`), decodificación greedy, temperatura 0, escala 0-100, muestra fija con semilla 1105.

| Slice | Prompt set | New tokens | n | Score |
|---|---|---|---|---|
| VQA DM | `VQA_1126` (verbose) | 160 | 500 | 72,16 |
| VQA RSICD | legacy terse | 48 | 500 | 69,90 |
| Caption DM | caption-query bank | 320 | 491 | 80,98 |
| Caption RSICD | caption-query bank | 320 | 500 | 77,06 |
| MEAN4 | — | — | 1.991 | 75,03 |

Referencias del mismo programa sobre la misma muestra (MEAN4): Aspaklarya-101-step4500 76,72; Aspaklarya-106-soup 76,36; Aspaklarya-020-step4500 74,90; DeanQwen3-8B 64,84; Qwen3-VL-8B-Instruct original 61,34. Este checkpoint ocupa el puesto 42 de 70 checkpoints puntuados.

Suelo de ruido medido por el programa (misma receta, tres semillas): control MEAN4 75,52 (sd 0,19, n=3); sigma VQA DM 0,88; sigma VQA RSICD 0,74; sigma Caption DM 0,25; sigma Caption RSICD 0,52; reproducibilidad del juez ~0,01; dispersión con semilla fija ~0,30. Por tanto, diferencias de MEAN4 por debajo de ~0,5 no son interpretables, y en VQA de un solo slice por debajo de ~1,8 tampoco.

## Requisitos de hardware

- El adaptador pesa 0,2 GB; el coste real lo determina el modelo base Qwen3-VL-8B-Instruct (8B parámetros).
- VRAM estimada para el base en BF16: en torno a 16-18 GB solo pesos, más overhead de activaciones y del tower visual; en cuantización de 8 bits, aproximadamente 9-10 GB; en 4 bits, aproximadamente 5-6 GB (estimaciones, no publicadas por el autor).
- GPU recomendadas: A100 40/80 GB o H100 para entrenamiento y evaluación a máxima precisión; RTX 4090 (24 GB) para inferencia BF16 ajustada; RTX 3090/4080 (16-24 GB) con cuantización.
- Cabe en GPU de consumo con cuantización de 8 o 4 bits del base; en BF16 requiere al menos 24 GB para margen cómodo.
- Despliegue: carga vía `peft.PeftModel` + `transformers` (`AutoModelForImageTextToText`, `AutoProcessor`), tal como documenta el autor. No se documentan recetas para vLLM, llama.cpp, Ollama o TGI con este adaptador.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | MEAN4 (misma muestra) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Aspaklarya-107-step1770 | LoRA sobre 8B | 2.048 (entrenamiento) | 75,03 | no disponible | Hugging Face (0 descargas) |
| Aspaklarya-101-step4500 | LoRA sobre 8B | 2.048 (entrenamiento) | 76,72 | no disponible | Hugging Face (mismo programa) |
| Aspaklarya-106-soup | LoRA sobre 8B | 2.048 (entrenamiento) | 76,36 | no disponible | Hugging Face (mismo programa) |
| Qwen3-VL-8B-Instruct (base) | 8B | no disponible | 61,34 | no disponible | Hugging Face |
| DeanQwen3-8B | 8B | no disponible | 64,84 | no disponible | Hugging Face |

La comparación es intradominio (teledetección) y con el mismo protocolo de juez; no mide rendimiento generalista. Los checkpoints 101 y 106 superan a este en MEAN4, aunque la diferencia con 106 (1,33) está por encima del umbral de interpretabilidad de ~0,5 y la de 101 (1,69) también.

## Limitaciones y advertencias

- Modelo de dominio: todas las métricas son in-domain de teledetección; no hay evidencia de rendimiento en VQA generalista.
- El juez de evaluación es solo texto: no ve la imagen, por lo que detecta especificidad no soportada pero no falsedad verificada. La corrección a nivel de píxel requiere revisión humana.
- El benchmark legacy terse (RSICD) no es un objetivo justo para la ronda 1XX: sus referencias son de ~4 caracteres y su rúbrica limita por construcción a 89/100 una respuesta correcta pero rellena, de modo que un modelo verboso no puede alcanzar la banda superior.
- Selección sobre ruido: elegir el checkpoint de mayor puntuación entre varios y citarlo no es una comparación válida; el propio autor advierte de ello y nombra los checkpoints hermanos con mejor puntuación.
- Reproducibilidad limitada: con semilla fija la puntuación aún varía ~0,30 por kernels CUDA no deterministas.
- Licencia no disponible: no puede confirmarse el uso comercial ni las obligaciones de atribución; conviene verificar la licencia del modelo base Qwen3-VL-8B-Instruct y del adaptador antes de producción.
- Idiomas no documentados; el comportamiento fuera del inglés o del castellano no está evaluado.
- Riesgo de alucinación: el estilo verboso puede producir detalles plausibles no presentes en la imagen; el juez solo texto no lo penaliza de forma fiable.
- Sesgos: no documentados por el autor; el corpus de teledetección puede tener sesgo geográfico y temporal no caracterizado.
- Repositorio con 0 descargas y 0 likes: sin validación externa por parte de la comunidad.

## Enlaces

- Adaptador en Hugging Face: https://huggingface.co/ExperimentField/Aspaklarya-107-step1770
- Organización y programa de ablación: https://huggingface.co/ExperimentField
- Modelo base: https://huggingface.co/Qwen/Qwen3-VL-8B-Instruct
- PEFT: https://github.com/huggingface/peft
- Transformers: https://github.com/huggingface/transformers
