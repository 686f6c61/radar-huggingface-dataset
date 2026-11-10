# ExperimentField/Aspaklarya-114-step1124

## Resumen

Aspaklarya-114-step1124 es un adaptador LoRA (PEFT) publicado por ExperimentField sobre el modelo base Qwen/Qwen3-VL-8B-Instruct, un transformer multimodal de 8.000 millones de parámetros con torre de visión. El adaptador está especializado en teledetección (remote sensing): respuesta visual a preguntas (VQA) e image captioning sobre imágenes de satélite o aéreas. No es un modelo autónomo: requiere cargar el base Qwen3-VL-8B-Instruct y aplicar el adaptador encima.

El checkpoint pertenece a la "ronda 1XX" del programa Aspaklarya, una ablación sistemática que entrena la misma receta con distintas semillas y variables para medir el ruido de entrenamiento. A diferencia de la ronda 0XX, este adaptador genera respuestas verbosas con razonamiento fundamentado en la imagen (varias frases) en lugar de una sola palabra. El repositorio ocupa 0,2 GB, lo que confirma que solo contiene los pesos del adaptador, no el modelo completo.

Su relevancia es metodológica y práctica: por un lado, ofrece un adaptador ligero (LoRA r=16) que mejora sustancialmente las métricas in-domain frente al Qwen3-VL-8B-Instruct de serie (75,66 MEAN4 frente a 61,34); por otro, la model card documenta con inusual rigor el suelo de ruido del programa (sd 0,19 en MEAN4), advirtiendo que diferencias inferiores a ~0,5 no son interpretables. Es un artefacto de investigación, no un producto listo para producción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre Qwen3-VL-8B-Instruct (transformer multimodal con torre de visión) |
| Parámetros totales | no disponible (adaptador LoRA r=16 sobre base de 8B) |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | 3072 tokens de secuencia durante entrenamiento (contexto del base no disponible en la información) |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |
| Modelo base | Qwen/Qwen3-VL-8B-Instruct |
| Tamaño del repositorio | 0,2 GB |
| Rango LoRA / alpha | r=16 / alpha=16, dropout=0,0 |
| Torre de visión entrenada | sí |
| Checkpoint | step 1124 (experimento exp114res) |

## Arquitectura y entrenamiento

El adaptador se aplica sobre Qwen3-VL-8B-Instruct, un modelo vision-language de 8B parámetros. El entrenamiento LoRA usa r=16, alpha=16, dropout 0,0 y **entrena también la torre de visión**, lo que lo diferencia de un LoRA puramente textual. La pérdida usa ponderación por token con pesos w_caption=1,0 y w_vqa=1,0, es decir, captioning y VQA contribuyen por igual.

El corpus consta de 35.979 ítems sobre 11.994 imágenes (11.993 captions y 23.986 pares VQA), con 2 QA + 1 caption por imagen. Se entrenó 1,0 época con batch 4 × 8 acumulación de gradiente = 32 efectivo, optimizador con lr 0,0002, schedule lineal, warmup 0,03, weight decay 0,001, clip 0,3 y semilla 3407. La variable del experimento fue max-seq 3072 / max-side 1536, que según el autor resultaron ser **no-ops** sobre este corpus (no alteraron el resultado). El split de entrenamiento es `train,other` y la columna VQA es `VQA_1126`.

La innovación destacable no es arquitectónica sino metodológica: el programa mide su propio suelo de ruido entrenando la misma receta tres veces con semillas distintas (control MEAN4 75,52, sd 0,19) y reporta la desviación típica por slice, además de la reproducibilidad del juez (~0,01) y la dispersión al repetir con la misma semilla (~0,30 por kernels CUDA no deterministas).

## Capacidades

- Respuesta visual a preguntas (VQA) sobre imágenes de teledetección, con respuestas verbosas y razonamiento fundamentado en varias frases.
- Image captioning descriptivo de imágenes de satélite o aéreas.
- Razonamiento multimodal texto-imagen (heredado del base Qwen3-VL-8B-Instruct).
- Soporte de tool calling / function calling: no disponible en la información (el base Qwen3-VL lo soporta, pero el adaptador no lo documenta).
- Soporte de agentes y razonamiento multi-paso: no documentado para este adaptador.
- Capacidades multilingües: no disponibles en la información.
- Modo thinking / visión / audio: visión sí (torre de visión entrenada); thinking y audio no disponibles.

## Casos de uso

- **Análisis de imágenes satelitales para agricultura de precisión**: el adaptador responde preguntas sobre el estado de cultivos (cobertura, color, estructura) en imágenes de satélite, aprovechando su entrenamiento específico en VQA de teledetección y su capacidad de dar respuestas razonadas en lugar de una sola palabra.
- **Generación automática de pies de foto para catálogos de imágenes aéreas**: con la slice de captioning (80,26 en DM y 78,65 en RSICD), sirve para etiquetar y describir grandes volúmenes de imágenes de satélite en bases de datos geoespaciales.
- **Asistencia a analistas GIS**: un analista puede preguntar en lenguaje natural sobre una imagen y obtener una descripción fundamentada con varias frases, útil para triaje rápido antes de una inspección manual.
- **Enriquecimiento de metadatos en plataformas de observación de la Tierra**: generar descripciones textuales y respuestas VQA para indexar y buscar imágenes por contenido semántico.
- **Prototipado de pipelines de monitorización ambiental**: usar el adaptador como componente de un sistema que detecte cambios en imágenes (vegetación, agua, infraestructura) y genere informes textuales, dado su bajo coste de despliegue (0,2 GB de adaptador sobre el base).
- **Investigación en evaluación de modelos multimodales**: como checkpoint de referencia de un programa de ablación con suelo de ruido medido, sirve para estudiar la varianza de entrenamiento y la fiabilidad de jueces LLM en VQA de teledetección.

## Benchmarks y rendimiento

Evaluación con LLM-as-judge (`gemma-4-31b-it-imiai`), decodificación greedy, temperatura 0, escala 0-100, sobre una muestra fija con semilla 1105.

| Slice | Prompt set | New tokens | n | Score |
|---|---|---|---|---|
| VQA DM | `VQA_1126` (verbose) | 160 | 500 | 73,18 |
| VQA RSICD | legacy terse | 48 | 500 | 70,56 |
| Caption DM | caption-query bank | 320 | 491 | 80,26 |
| Caption RSICD | caption-query bank | 320 | 500 | 78,65 |
| **MEAN4** | | | 1.991 | **75,66** |

Referencias en la misma muestra (MEAN4): Aspaklarya-101-step4500 76,72; Aspaklarya-106-soup 76,36; Aspaklarya-020-step4500 74,90; DeanQwen3-8B 64,84; Qwen3-VL-8B-Instruct de serie 61,34.

Suelo de ruido del programa: control MEAN4 75,52 (sd 0,19, n=3); sigma VQA DM 0,88; VQA RSICD 0,74; Caption DM 0,25; Caption RSICD 0,52; reproducibilidad del juez ~0,01; dispersión con misma semilla 0,30.

Ranking: puesto 24 de 70 checkpoints puntuados en MEAN4.

## Requisitos de hardware

- **VRAM estimada**: el adaptador pesa 0,2 GB, pero requiere cargar el base Qwen3-VL-8B-Instruct. En fp16 el base ocupa ~16 GB; en cuantización de 8 bits ~8 GB; en 4 bits ~4-5 GB. La información no detalla cuantizaciones soportadas.
- **GPU recomendadas**: A100, H100 o L40S para fp16; RTX 4090 (24 GB) para fp16 con margen; RTX 3090/4080 para 8 bits.
- **Consumer GPU**: sí, cabe en RTX 4090 en fp16 y en GPUs de 8-12 GB con cuantización, aunque la información no confirma compatibilidad con backends cuantizados.
- **Despliegue**: la model card solo documenta `transformers` + `peft` (`PeftModel.from_pretrained`). Compatibilidad con vLLM, llama.cpp, Ollama o TGI: no disponible.
- **Latencia y throughput**: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | MEAN4 (misma muestra) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Aspaklarya-114-step1124 | LoRA sobre 8B | 3072 (entrenamiento) | 75,66 | no disponible | Hugging Face (adaptador) |
| Aspaklarya-101-step4500 | LoRA sobre 8B | no disponible | 76,72 | no disponible | Hugging Face |
| Aspaklarya-106-soup | LoRA sobre 8B | no disponible | 76,36 | no disponible | Hugging Face |
| DeanQwen3-8B | 8B | no disponible | 64,84 | no disponible | Hugging Face |
| Qwen3-VL-8B-Instruct | 8B | no disponible | 61,34 | no disponible | Hugging Face |

## Limitaciones y advertencias

- **Sesgos**: no documentados; al ser un modelo de teledetección entrenado sobre un corpus concreto, puede reflejar sesgos de ese dataset (geografía, tipo de sensor, condiciones de captura).
- **Alucinación**: el juez es solo texto y no ve la imagen, por lo que detecta especificidad no soportada pero no falsedades verificadas; se requieren comprobaciones humanas a nivel de píxel.
- **Benchmark legacy no justo**: la referencia terse (~4 caracteres) limita por construcción una respuesta verbosa a 89/100, así que la caída en VQA RSICD (70,56) es en gran parte cosmética.
- **Dominio restringido**: las puntuaciones son in-domain; no miden VQA de propósito general.
- **Ruido de medición**: diferencias menores de ~0,5 en MEAN4 y de ~1,8 en slices VQA no son interpretables; elegir el mejor checkpoint entre varios es selección sobre ruido.
- **Licencia**: no disponible; verificar la licencia del base Qwen3-VL-8B-Instruct antes de uso comercial.
- **Producción**: es un artefacto de investigación con 0 descargas y 0 likes; no hay garantías de soporte ni de estabilidad del repositorio.

## Enlaces

- Hugging Face del adaptador: https://huggingface.co/ExperimentField/Aspaklarya-114-step1124
- Organización y contexto del programa: https://huggingface.co/ExperimentField
- Modelo base: https://huggingface.co/Qwen/Qwen3-VL-8B-Instruct
