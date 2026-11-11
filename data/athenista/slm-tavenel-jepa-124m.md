# athenista/slm-tavenel-jepa-124m

## Resumen

SLM-Tavenel JEPA 124M es un extractor de características textuales en inglés entrenado desde cero por el autor independiente athenista (proyecto SLM-Tavenel) sobre anotaciones humanas del dataset COCO 2017. El modelo no es un chatbot ni un modelo de lenguaje generativo: se trata de un checkpoint de investigación cuyo objetivo es aprender representaciones de frases que se alineen con el vecindario semántico de imágenes, usando exclusivamente pares de captions de la misma fotografía y una función de pérdida tipo VICReg sin predictor (JEPA). No se usan píxeles ni pérdida de next-token durante el entrenamiento de este checkpoint.

La arquitectura es un transformer causal de 27 bloques, anchura 576, SwiGLU de 1.536, RoPE y RMSNorm, con atención de 9 cabecas query y 3 key/value (GQA), normalización QK y puerta sigmoide por cabeza. El backbone suma 124.038.144 parámetros y produce una representación de 576 dimensiones (media enmascarada de la salida del bloque 23). El tokenizador es el byte-level BPE de SmolLM2-360M (49.152 tokens), reutilizado solo como tokenizador, sin pesos preentrenados.

Su relevancia es metodológica: demuestra que un objetivo de representación contrastivo auto-supervisado sobre pares de captions, sin imágenes ni modelado de lenguaje, puede superar a un GPT-2 124M y a un modelo next-token equivalente en solapamiento de vecindarios texto-imagen sobre COCO val2017. Está pensado para investigadores que quieran reproducir o auditar experimentos de representation learning, no para despliegues de producto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal, 27 bloques, anchura 576, SwiGLU 1.536, RoPE, RMSNorm, GQA (9 Q / 3 KV, dim 64), QK-norm y puerta sigmoide por cabeza |
| Parametros totales | 124.038.144 (incluye embeddings y RMS norm final) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 2.048 posiciones configuradas; entrenamiento y evaluación limitados a 48 / 64 tokens de caption |
| Tipos de cuantizacion | pesos publicados en float32 safetensors, sin redondeo ni cuantización; no se documentan otras variantes |
| Idiomas soportados | inglés (en) |
| Licencia | MIT para contribuciones del autor; tokenizador Apache-2.0; términos de datos documentados en la model card |
| Formato de pesos | safetensors (float32); requiere `trust_remote_code=True` por código custom incluido en el repo |

## Arquitectura y entrenamiento

El backbone es un transformer causal decoder-only de 27 bloques con anchura 576, FFN SwiGLU de 1.536, RoPE, RMSNorm y atención GQA con 9 cabecas query y 3 key/value de dimensión 64, normalización QK y puerta sigmoide por cabeza. La representación pública es la media enmascarada de la salida del bloque 23 (indexado desde cero, antes de la RMS norm final), con 576 dimensiones. El tokenizador es el BPE byte-level de SmolLM2-360M (49.152 tokens), usado solo como tokenizador.

El entrenamiento usa pares de captions humanos de COCO 2017 train (591.753 captions sobre 118.287 fotos), agrupados por ID de imagen, con un objetivo VICReg-style sin predictor (JEPA). No se usan píxeles ni pérdida de next-token. Se realizaron 9.000 updates con 256 grupos de imágenes por update y dos captions por grupo, con una única semilla. El proyector 576→256 usado solo en entrenamiento se distribuye aparte en `training_projection.safetensors` y no forma parte del backbone ni de la representación publicada.

## Capacidades

- Extracción de representaciones de frases en inglés: `pooler_output` devuelve vectores de 576 dimensiones (media enmascarada del bloque 23).
- Acceso a estados ocultos por capa mediante `output_hidden_states=True` y selección explícita de capa con `representation_layer=...`.
- Alineación semántica texto-imagen (evaluada contra features DINOv2 ViT-B/14 congeladas) medida por solapamiento de vecindarios kNN.
- Soporte de padding por la derecha; rechaza padding por la izquierda y entradas de más de 64 tokens.
- No dispone de cabeza de generación, tool calling, function calling, agentes, visión, audio ni modo thinking.
- Multilingüe: no; solo inglés.
- Ejecución en CPU documentada en la model card.

## Casos de uso

- Búsqueda semántica de captions: indexar descripciones de imágenes con los vectores de 576 dimensiones y recuperar por similitud tras centrado y normalización L2 del cohorte, replicando el protocolo del experimento.
- Estudio de alineación texto-imagen sin codificador visual: usar el modelo como sonda textual frente a features DINOv2 congeladas para medir solapamiento de vecindarios en COCO val2017.
- Investigación en representation learning: reproducir y auditar el experimento EXP-0046 con la semilla y el schedule documentados, comparando con el checkpoint next-token y el web-trained del mismo proyecto.
- Baseline para ablaciones de objetivos auto-supervisados: comparar VICReg-style sin predictor frente a next-token con idéntico tokenizador, arquitectura y datos.
- Clasificación y clustering de captions: usar los embeddings como features de entrada para agrupar descripciones por temática o para entrenar clasificadores lineales sobre COCO.
- Detección de duplicados y near-duplicates en corpus de captions: comparar vectores normalizados de frases cortas (≤64 tokens) para deduplicar anotaciones.
- Evaluación de tokenizadores y schedules de entrenamiento: al ser un backbone pequeño de 124M, permite barridos de hiperparámetros en CPU o en una única GPU consumer.

## Benchmarks y rendimiento

Datos declarados por el autor en el model-index (no verificados de forma independiente; una sola semilla de entrenamiento).

| Modelo | Solapamiento de vecinos held-out (mutual-kNN10) | Evidencia |
|---|---:|---|
| SLM-Tavenel JEPA 124M (este checkpoint) | 0,179160 | Auditoría J/N fresca |
| SLM-Tavenel next-token 124M, mismo schedule de captions | 0,123720 | Auditoría J/N fresca |
| SLM-Tavenel web-trained 124M | 0,1548 | Evaluación completa original |
| Random-initialized 124M | 0,0598 | Evaluación completa original |
| GPT-2 124M | 0,1338 | Evaluación completa original |
| Pythia-160M | no disponible en la información proporcionada | — |

Protocolo: 5.000 pares imagen-caption de COCO val2017, features de imagen DINOv2 ViT-B/14 congeladas, caption de menor annotation-ID por imagen, una mitad fija para seleccionar capa y 2.500 imágenes held-out para la métrica principal. Azar aproximado: 0,004. No se han publicado resultados de MMLU, HumanEval, GSM8K ni otros benchmarks generativos en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el backbone en float32 ocupa aproximadamente 0,5 GB (124M parámetros × 4 bytes), más overhead de activaciones para lotes pequeños; cabe holgadamente en cualquier GPU consumer.
- GPU recomendadas: innecesarias para inferencia; cualquier GPU con ≥2 GB de VRAM (GTX 1650, RTX 3050, RTX 4090) sirve. Para entrenamiento o barridos, A100/H100 no aportan ventaja por el tamaño reducido.
- Cabe en consumer GPU: sí, en todas las GPU consumer modernas; también en CPU, como documenta la model card.
- Opciones de despliegue: `transformers` con `trust_remote_code=True` (versiones probadas: transformers 4.57.6, tokenizers 0.22.2, safetensors). No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, y al no tener cabeza de generación no encaja en pipelines de chat.
- Latencia y throughput: no disponibles en la información proporcionada; al ser un modelo de 124M con entradas de ≤64 tokens, la latencia esperada es de milisegundos por lote pequeño en GPU y decenas de milisegundos en CPU.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Objetivo | Licencia | Disponibilidad |
|---|---:|---|---|---|---|
| SLM-Tavenel JEPA 124M | 124M | 2.048 posiciones (entrenamiento 48/64 tokens) | VICReg-style sin predictor sobre pares de captions | MIT (tokenizador Apache-2.0) | Hugging Face, código custom |
| SLM-Tavenel next-token 124M | 124M | mismo schedule | Next-token sobre captions | MIT (según proyecto) | mismo proyecto |
| SLM-Tavenel web-trained 124M | 124M | no disponible | Entrenamiento sobre web | MIT (según proyecto) | mismo proyecto |
| GPT-2 124M | 124M | 1.024 tokens | Next-token | MIT | Hugging Face, ampliamente soportado |
| Pythia-160M | 160M | no disponible | Next-token | Apache-2.0 (según familia Pythia) | Hugging Face |

En la métrica de solapamiento texto-imagen, este checkpoint supera a GPT-2 124M (0,1792 frente a 0,1338) y a su equivalente next-token (0,1237), pero la comparación es específica del protocolo COCO/DINOv2 y de una única semilla.

## Limitaciones y advertencias

- No es un modelo generativo: no tiene cabeza de generación ni produce texto; usarlo como chatbot o captioner es un error de uso.
- No es un codificador de imágenes: las features visuales del experimento provienen de DINOv2 ViT-B/14 congelado, externo al modelo.
- Solo inglés; no hay evidencia de capacidades multilingües.
- Contexto útil limitado a 48/64 tokens de caption: las 2.048 posiciones configuradas no son evidencia de representaciones útiles a esa longitud, según el propio autor.
- Los vectores brutos no están centrados ni normalizados; la métrica publicada exige centrar el cohorte completo y aplicar normalización L2 por fila. Una similitud coseno entre dos salidas individuales no reproduce el experimento.
- Resultados de una sola semilla de entrenamiento y auditoría interna (EXP-0046), no verificados por terceros; tratar las cifras como indicativas.
- Riesgo de alucinación: no aplica en sentido generativo, pero los embeddings pueden reflejar correlaciones espurias de COCO (escenas, objetos y anotaciones frecuentes) y sesgos de anotadores humanos.
- Licencia MIT para las contribuciones del autor; el tokenizador es Apache-2.0 y los términos de los datos COCO se documentan en la model card, por lo que el uso comercial debe revisar esas condiciones.
- Requiere `trust_remote_code=True`: revisar el código local y fijar un commit completo del Hub para reproducibilidad.
- Rechaza padding por la izquierda y entradas de más de 64 tokens, lo que limita su integración en pipelines estándar de NLP.

## Enlaces

- Hugging Face: https://huggingface.co/athenista/slm-tavenel-jepa-124m
- Proyecto: https://github.com/thekester/slm-tavenel
- Experimento EXP-0046: https://github.com/thekester/slm-tavenel/blob/v0.1.0-dev.41/experiments/EXP-0046-text-jepa-124m-coco-2026-11-10.md
- Auditoría: https://github.com/thekester/slm-tavenel/blob/v0.1.0-dev.41/docs/reviews/exp0046-audit-2026-11-11.md
- Evidencia local: audit/report.json (en el repositorio del modelo)
- Paper referenciado en tags: arxiv:2610.39302 (no disponible enlace directo en la información proporcionada)
