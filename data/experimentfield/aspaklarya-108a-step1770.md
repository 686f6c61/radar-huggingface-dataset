# ExperimentField/Aspaklarya-108a-step1770

## Resumen

Aspaklarya-108a-step1770 es un adaptador LoRA (PEFT) sobre el modelo base Qwen/Qwen3-VL-8B-Instruct, desarrollado por la organización ExperimentField dentro de su programa sistemático de ablaciones denominado Aspaklarya. Está especializado en teledetección (remote sensing): responde preguntas visuales (VQA) y genera pies de foto (image captioning) sobre imágenes de satélite y aéreas. El checkpoint corresponde al paso 1770 del experimento `exp108s1234`, una réplica con semilla 1234 de la receta de 19K ítems.

El modelo se distingue por ser una variante "verbose": a diferencia de la ronda 0XX del programa, que respondía con una sola palabra, esta ronda produce varias frases de razonamiento fundamentado en la imagen. El adaptador entrena también la torre de visión (vision tower), algo relevante porque permite adaptar los extractores visuales al dominio de la teledetección y no solo el decodificador de lenguaje.

Su relevancia es metodológica tanto como práctica: el autor publica explícitamente el suelo de ruido del programa (desviación típica de 0,19 en la métrica MEAN4 con n=3), advierte de que las diferencias por debajo de ~0,5 no son interpretables y documenta resultados retractados. Es un caso poco habitual de ficha con trazabilidad estadística completa, lo que lo convierte en una referencia útil para quien evalúe adaptadores de dominio.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre transformer multimodal Qwen3-VL-8B-Instruct; r=16, alpha=16, dropout=0,0, torre de visión entrenada |
| Parámetros totales | no disponible (adaptador LoRA sobre un base de 8B) |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | 2048 tokens de secuencia de entrenamiento; contexto del modelo base no disponible en la información |
| Tipos de cuantización | no disponible (pesos publicados en safetensors; el base admite las cuantizaciones habituales de Qwen3-VL, no confirmadas aquí) |
| Idiomas soportados | no disponible (el corpus de entrenamiento no se documenta por idioma) |
| Licencia | no disponible |
| Formato de pesos | safetensors (adaptador PEFT; requiere el base Qwen/Qwen3-VL-8B-Instruct) |

## Arquitectura y entrenamiento

El adaptador se aplica sobre Qwen3-VL-8B-Instruct, un modelo vision-language de la familia Qwen3-VL. El entrenamiento emplea LoRA con rango 16, alpha 16 y dropout 0,0, y entrena explícitamente la torre de visión además de las capas de atención del decodificador. La pérdida usa ponderación por token (`token` weighting) con pesos w_caption=1,0 y w_vqa=1,0, es decir, captions y VQA contribuyen por igual. El optimizador es AdamW implícito con lr 0,0002, schedule lineal, warmup 0,03, weight decay 0,001 y gradient clipping 0,3; batch efectivo de 32 (4 × 8 de acumulación), 4,0 épocas, longitud de secuencia 2048 y lado máximo de imagen 1024 píxeles.

El corpus de entrenamiento consta de 18.862 ítems sobre 6.288 imágenes: 6.288 captions y 12.574 pares de VQA, con 2 QA + 1 caption por imagen. La columna VQA utilizada es `VQA_1126` y el split es `train`. No se documenta en la información disponible el número total de tokens vistos, la composición por fuente de las imágenes ni si hubo etapas de RLHF o DPO; el ajuste es supervisado sobre datos de teledetección. La innovación destacable no es arquitectónica sino metodológica: la réplica de semilla con control de ruido y la publicación de la varianza por slice.

## Capacidades

- Generación de respuestas VQA verbosas con razonamiento fundamentado (varias frases) sobre imágenes de teledetección, en lugar de respuestas de una palabra.
- Image captioning descriptivo para imágenes de satélite y aéreas (slice Caption DM y Caption RSICD).
- Comprensión visual de escenas remotas: el adaptador modifica la torre de visión, no solo el decodificador.
- Hereda del base Qwen3-VL-8B-Instruct las capacidades multimodales generales del modelo original (no evaluadas en esta ficha).
- Soporte de tool calling / function calling: no documentado para el adaptador; disponible, en su caso, solo a través del base.
- Soporte de agentes y razonamiento multi-paso: no documentado ni evaluado.
- Capacidades multilingües: no documentadas; el programa no reporta evaluación por idioma.
- Modo thinking explícito: no documentado.

## Casos de uso

- Análisis automatizado de imágenes satelitales en pipelines de observación de la Tierra: el adaptador responde preguntas abiertas sobre la escena ("¿qué cultivo domina esta parcela?") con respuestas razonadas de varias frases, adecuadas para informes y no solo para clasificación.
- Generación de metadatos y pies de foto para catálogos de imágenes remotas: el slice de captioning obtiene 81,06 en DM y 78,25 en RSICD, lo que lo hace apto para poblar bases de datos geoespaciales con descripciones legibles.
- Asistencia a analistas GIS: un asistente que, dada una imagen aérea, explica qué observa y por qué, reduciendo el tiempo de triaje manual de escenas.
- Enriquecimiento de expedientes de teledetección en agricultura de precisión: preguntas sobre estado de parcelas, presencia de infraestructura o cambios de uso del suelo, con respuestas textuales auditables.
- Moderación y control de calidad de datasets: usar el modelo para describir y cuestionar imágenes y detectar metadatos incoherentes antes de incorporarlas a un corpus mayor.
- Investigación en adaptación de dominio: servir como checkpoint de referencia en estudios de ablación de LoRA sobre modelos vision-language, dado que el programa publica el suelo de ruido y recetas comparables.
- Evaluación comparativa de adaptadores: al puntuar todos los checkpoints del programa sobre la misma muestra (semilla 1105) con un juez fijo, permite comparaciones controladas entre recetas.

## Benchmarks y rendimiento

Evaluación con LLM-as-judge (`gemma-4-31b-it-imiai`), decodificación greedy, temperatura 0, escala 0-100, muestra fija con semilla 1105.

| Slice | Prompt set | Nuevos tokens | n | Puntuación |
|---|---|---|---|---|
| VQA DM | `VQA_1126` (verbose) | 160 | 500 | 72,24 |
| VQA RSICD | legacy terse | 48 | 500 | 69,38 |
| Caption DM | caption-query bank | 320 | 491 | 81,06 |
| Caption RSICD | caption-query bank | 320 | 500 | 78,25 |
| **MEAN4** | | | 1.991 | **75,23** |

Referencias sobre la misma muestra (MEAN4):

| Modelo | MEAN4 |
|---|---|
| Aspaklarya-101-step4500 | 76,72 |
| Aspaklarya-106-soup | 76,36 |
| Aspaklarya-020-step4500 | 74,90 |
| **Aspaklarya-108a-step1770** | **75,23** |
| DeanQwen3-8B | 64,84 |
| Qwen3-VL-8B-Instruct (stock) | 61,34 |

Suelo de ruido del programa: control MEAN4 75,52 (sd 0,19, n=3); sigma por slice de 0,88 (VQA DM), 0,74 (VQA RSICD), 0,25 (Caption DM) y 0,52 (Caption RSICD); reproducibilidad del juez ~0,01; dispersión de re-ejecución con la misma semilla ~0,30. Posición en el ranking: 39 de 70 checkpoints puntuados.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información proporcionada. Como referencia estructural, el adaptador se monta sobre Qwen3-VL-8B-Instruct; el requisito dominante es el del modelo base, no el del LoRA (el repositorio del adaptador ocupa 0,2 GB).
- GPU recomendadas: no documentadas por el autor. Para un base de 8B en BF16 se requiere una GPU de 24 GB o superior (RTX 4090, A100 40/80 GB, H100); con cuantización de 4 bits cabría en GPUs de 12-16 GB, aunque esta afirmación no está verificada en la información disponible para este adaptador.
- ¿Cabe en GPU de consumo? No confirmado para este adaptador; depende de la cuantización elegida para el base.
- Opciones de despliegue: el autor documenta `transformers` + `peft` (`PeftModel.from_pretrained`) con `AutoModelForImageTextToText` y `AutoProcessor`. No se documentan vLLM, llama.cpp, Ollama ni TGI para este adaptador; su compatibilidad con ellos no está verificada.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Base | Parámetros | Contexto | MEAN4 | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Aspaklarya-108a-step1770 | Qwen3-VL-8B-Instruct | LoRA sobre 8B | 2048 (entrenamiento) | 75,23 | no disponible | Hugging Face (0 descargas) |
| Aspaklarya-101-step4500 | Qwen3-VL-8B-Instruct | LoRA sobre 8B | no disponible | 76,72 | no disponible | Hugging Face |
| Aspaklarya-106-soup | Qwen3-VL-8B-Instruct | LoRA sobre 8B | no disponible | 76,36 | no disponible | Hugging Face |
| DeanQwen3-8B | Qwen3-8B (presumiblemente) | 8B | no disponible | 64,84 | no disponible | Hugging Face |
| Qwen3-VL-8B-Instruct (stock) | — | 8B | no disponible | 61,34 | no disponible | Hugging Face |

La comparación es intra-programa: todas las cifras proceden de la misma muestra y el mismo juez, por lo que son directamente comparables entre sí. Frente al base sin ajustar, el adaptador mejora el MEAN4 en 13,89 puntos; frente a los mejores checkpoints del programa, queda 1,49 puntos por debajo de 101-step4500, diferencia que supera el umbral de interpretabilidad de ~0,5.

## Limitaciones y advertencias

- El juez es solo texto: compara la respuesta con una referencia y nunca ve la imagen, por lo que detecta especificidad no respaldada pero no falsedades verificadas. La corrección a nivel de píxel requiere revisión humana.
- El benchmark "legacy terse" (RSICD) no es un objetivo justo para la ronda 1XX: sus referencias son de ~4 caracteres y su rúbrica limita a 89/100 una respuesta correcta pero verbosa, de modo que un modelo verboso no puede alcanzar la banda superior por muy preciso que sea.
- Las diferencias de MEAN4 por debajo de ~0,5 no son interpretables a partir de un solo par de ejecuciones; las diferencias en un solo slice de VQA por debajo de ~1,8 tampoco. Los slices de caption son tres o cuatro veces más silenciosos que los de VQA.
- Re-ejecutar con la misma semilla sigue moviendo la puntuación ~0,30 por kernels CUDA no deterministas; la replicación exacta no es alcanzable.
- Seleccionar el checkpoint de mayor puntuación entre varios y citarlo constituye selección sobre ruido; el propio autor nombra checkpoints hermanos con mejor puntuación en lugar de ocultarlos.
- Las puntuaciones son en dominio: es un modelo de teledetección y nada de lo medido evalúa VQA de propósito general.
- Riesgo de alucinación: no cuantificado; el juez no verifica la veracidad visual, por lo que las respuestas verbosas pueden contener detalles específicos no sustentados por la imagen.
- Sesgos conocidos: no documentados.
- Licencia no disponible: no puede confirmarse el uso comercial del adaptador ni del modelo base; verificar la licencia de Qwen/Qwen3-VL-8B-Instruct antes de cualquier despliegue en producción.
- Advertencia de producción: el adaptador requiere cargar el base de 8B, lo que implica coste de VRAM y latencia no medidos; no hay datos de throughput ni de comportamiento con prompts fuera de dominio.

## Enlaces

- Hugging Face del adaptador: https://huggingface.co/ExperimentField/Aspaklarya-108a-step1770
- Organización ExperimentField (lista de experimentos, hiperparámetros, suelo de ruido y resultados retractados): https://huggingface.co/ExperimentField
- Modelo base: https://huggingface.co/Qwen/Qwen3-VL-8B-Instruct
