# ExperimentField/Aspaklarya-119-step1124

## Resumen

Aspaklarya-119-step1124 es un adaptador LoRA (PEFT) sobre el modelo base Qwen/Qwen3-VL-8B-Instruct, desarrollado por ExperimentField dentro del programa de ablaciones sistemáticas Aspaklarya. El adaptador está especializado en teledetección (remote sensing), concretamente en tareas de VQA (visual question answering) e image captioning sobre imágenes de satélite y aéreas. El repositorio contiene únicamente los pesos del adaptador (0,2 GB), no el modelo completo.

La particularidad de esta ronda 1XX del programa es que produce respuestas verbosas: en lugar de contestar VQA con una sola palabra, genera varias frases de razonamiento fundamentado en la imagen. La variable experimental de esta configuración concreta fue sustituir las captions de referencia por captions generadas por un modelo profesor (teacher-model captions), manteniendo el resto de la receta de entrenamiento.

Es importante señalar que, según la propia model card, esta configuración fue probada y rechazada: frente al control de tres semillas (MEAN4 75,52 ± 0,19), obtuvo una puntuación de 68,58 en MEAN4, es decir, −6,94 puntos, clasificado como daño severo. El repositorio se conserva únicamente como registro documental del experimento y no se recomienda su uso.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre transformer multimodal Qwen3-VL-8B-Instruct |
| Parametros totales | no disponible (adaptador LoRA; el modelo base es de 8B) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 2048 tokens de secuencia de entrenamiento (contexto del modelo base: no disponible) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (adaptador PEFT) |
| Rango LoRA | r=16, alpha=16, dropout=0.0, torre de visión entrenada |
| Tamano del repositorio | 0,2 GB |

## Arquitectura y entrenamiento

El adaptador se aplica sobre Qwen3-VL-8B-Instruct, un transformer multimodal de 8B parámetros que procesa imagen y texto. El LoRA tiene rango 16, alpha 16 y dropout 0.0, y a diferencia de configuraciones que congelan la torre de visión, aquí la torre de visión también se entrena. La secuencia máxima de entrenamiento fue de 2048 tokens y el lado máximo de imagen de 1024 píxeles.

El corpus de entrenamiento consta de 35.980 ítems sobre 11.994 imágenes (11.994 captions y 23.986 pares VQA), es decir, 2 QA más 1 caption por imagen, con split `train,other`. La ponderación de pérdida es por token con w_caption=1.0 y w_vqa=1.0. Se usó el optimizador con lr 0.0002, schedule lineal, warmup 0.03, weight decay 0.001 y clipping 0.3; batch efectivo de 32 (4 × 8 de acumulación de gradiente), 1.0 época y semilla 3407. La variable experimental de esta ronda fue reemplazar las captions de referencia por captions generadas por un modelo profesor.

## Capacidades

- Respuesta a preguntas visuales (VQA) sobre imágenes de teledetección, con respuestas verbosas de varias frases y razonamiento fundamentado en la imagen.
- Generación de captions (image captioning) para imágenes de satélite y aéreas.
- Procesamiento multimodal imagen-texto heredado del modelo base Qwen3-VL-8B-Instruct.
- Capacidades de tool calling, agentes y multilingüismo: no documentadas específicamente para este adaptador (dependen del modelo base, no verificadas en esta ficha).
- Modo thinking, audio u otras capacidades especiales: no disponible.

## Casos de uso

- Descripción detallada de escenas en imágenes satelitales: el adaptador genera captions de varias frases que describen elementos de la imagen, útil para indexación y catalogación de archivos de imagery.
- Anotación asistida de datasets de teledetección: dado que produce respuestas verbosas, puede servir para pre-anotar pares pregunta-respuesta que luego un humano revisa.
- Respuesta a consultas abiertas sobre imágenes aéreas: preguntas que requieren más de una palabra (p. ej. "describe los cambios en esta zona") se benefician de la naturaleza verbosa del adaptador.
- Investigación en ablaciones de entrenamiento: el repositorio documenta una configuración concreta (teacher captions) y su impacto medido, útil como referencia metodológica para quien diseñe experimentos similares.
- Estudio de calibración de evaluadores LLM-as-judge: la model card detalla el ruido del juez y los umbrales de interpretabilidad, material útil para diseñar protocolos de evaluación.
- Referencia negativa en comparativas: sirve como ejemplo documentado de configuración que degrada el rendimiento (−6,94 MEAN4) frente al control, útil para justificar decisiones de receta.

## Benchmarks y rendimiento

Evaluación con LLM-as-judge (`gemma-4-31b-it-imiai`), decodificación greedy, temperatura 0, escala 0-100, sobre una muestra fija con semilla 1105.

| Slice | Prompt set | New tokens | n | Score |
|---|---|---|---|---|
| VQA DM | `VQA_1126` (verbose) | 160 | 500 | 70,97 |
| VQA RSICD | legacy terse | 48 | 500 | 69,52 |
| Caption DM | caption-query bank | 320 | 491 | 71,88 |
| Caption RSICD | caption-query bank | 320 | 500 | 61,95 |
| **MEAN4** | | | 1.991 | **68,58** |

Referencias en la misma muestra (MEAN4): Aspaklarya-101-step4500 76,72; Aspaklarya-106-soup 76,36; Aspaklarya-020-step4500 74,90; DeanQwen3-8B 64,84; Qwen3-VL-8B-Instruct original 61,34. El control de tres semillas con la misma receta dio MEAN4 75,52 (sd 0,19). Este checkpoint ocupa el puesto 66 de 70 checkpoints puntuados del programa.

## Requisitos de hardware

- El adaptador pesa 0,2 GB; requiere cargar el modelo base Qwen3-VL-8B-Instruct completo, por lo que la VRAM necesaria la determina el base, no el adaptador.
- VRAM estimada para el modelo base en precisión completa (BF16): aproximadamente 16 GB de pesos, más overhead de activaciones y caché KV; en la práctica se recomienda 24 GB o más.
- Cuantizaciones del base (4-bit/8-bit) reducirían el requisito, pero no se documentan opciones de cuantización para este adaptador.
- GPU recomendadas: A100 40/80 GB, H100, o GPUs consumer de gama alta (RTX 4090 24 GB) para el base en BF16 con margen limitado.
- Despliegue: la model card muestra uso con `transformers` + `peft` (`AutoModelForImageTextToText`, `PeftModel`). Soporte en vLLM, llama.cpp, Ollama o TGI para adaptadores PEFT multimodales: no disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Base | Tipo | MEAN4 | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Aspaklarya-119-step1124 | Qwen3-VL-8B-Instruct | LoRA VQA/caption teledetección | 68,58 | no disponible | HF (0 descargas) |
| Aspaklarya-101-step4500 | Qwen3-VL-8B-Instruct | LoRA VQA/caption teledetección | 76,72 | no disponible | HF (programa) |
| Aspaklarya-106-soup | Qwen3-VL-8B-Instruct | LoRA (soup) teledetección | 76,36 | no disponible | HF (programa) |
| DeanQwen3-8B | Qwen3-8B | Modelo de teledetección | 64,84 | no disponible | HF |
| Qwen3-VL-8B-Instruct | — | Modelo base multimodal | 61,34 | no disponible | HF |

## Limitaciones y advertencias

- Configuración rechazada por el propio autor: −6,94 MEAN4 frente al control, clasificada como daño severo. No recomendada para uso.
- El juez es solo texto: compara la respuesta con una referencia y nunca ve la imagen, por lo que detecta especificidad no respaldada pero no falsedades verificadas a nivel de píxel.
- El benchmark legacy terse no es un objetivo justo para la ronda 1XX: sus referencias son de ~4 caracteres y el rubric limita a 89/100 una respuesta correcta pero verbosa, de modo que un modelo verboso no puede alcanzar la banda superior.
- Las puntuaciones son in-domain (teledetección); no miden VQA de propósito general.
- Diferencias de MEAN4 por debajo de ~0,5 no son interpretables con un solo par de ejecuciones; en slices VQA el umbral es ~1,8.
- Reejecutar con la semilla fija mueve la puntuación ~0,30 por kernels CUDA no deterministas; la replicación exacta no es alcanzable.
- Licencia no disponible: verificar términos del modelo base Qwen3-VL-8B-Instruct antes de cualquier uso comercial.
- Sesgos conocidos y riesgo de alucinación específicos: no documentados.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/ExperimentField/Aspaklarya-119-step1124
- Organización del programa Aspaklarya: https://huggingface.co/ExperimentField
- Modelo base: https://huggingface.co/Qwen/Qwen3-VL-8B-Instruct
