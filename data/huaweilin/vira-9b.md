# huaweilin/ViRA-9B

## Resumen

ViRA-9B es un modelo vision-lenguaje de 9.409.813.744 parámetros desarrollado por huaweilin, construido mediante ajuste fino con aprendizaje por refuerzo sobre Qwen/Qwen3.5-9B. Su propósito específico es responder preguntas sobre detalles pequeños en fotografías de alta resolución. Para ello, el modelo funciona como un agente visual: primero observa la imagen completa bajo un presupuesto de píxeles determinado, después amplía las regiones que necesita mediante una herramienta de zoom y finalmente emite la respuesta. Esta aproximación resuelve el problema de los modelos multimodales convencionales, que al reescalar imágenes de alta resolución pierden los detalles finos necesarios para responder correctamente.

La innovación principal es el método de entrenamiento CrossRPO (cross-input relative policy optimization), que entrena sobre conjuntos de contraste: K versiones de una misma fotografía que difieren solo en un objeto pequeño, con una pregunta y una respuesta correcta distinta para cada versión. Un agente que responde adivinando a partir del contexto general de la imagen daría la misma respuesta en todas las versiones y, por tanto, no podría resolver el conjunto sin leer realmente el objeto. El modelo se distribuye con licencia Apache 2.0, soporta hasta 16,8 MP de entrada (16.384 tokens visuales de 32 x 32 px) y está disponible en formato safetensors para transformers y vLLM.

El modelo es relevante ahora porque combina razonamiento agéntico multi-paso con tool calling visual en un tamaño de 9B parámetros, lo que lo hace desplegable en infraestructura moderada. Sus resultados en ViRA-Bench (63,3 % de precisión de conjunto a máxima resolución, frente al 34,6 % del modelo base con herramienta) y en ViRA-Bench-Real (77,4 % frente a 34,6 %) muestran una mejora sustancial en la tarea específica de lectura de detalles en alta resolución.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (vision-lenguaje), basado en Qwen/Qwen3.5-9B |
| Parámetros totales | 9.409.813.744 |
| Parámetros activos | no disponible (no es MoE según la información disponible) |
| Longitud de contexto | hasta 128.000 tokens (configuración de servicio recomendada con `--max-model-len 128000`) |
| Tipos de cuantización | no disponible |
| Idiomas soportados | inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

ViRA-9B parte de Qwen/Qwen3.5-9B, un modelo vision-lenguaje de 9,4 mil millones de parámetros, y se ajusta mediante aprendizaje por refuerzo con CrossRPO (cross-input relative policy optimization, λ = 0,5, recompensa basada en la corrección de la respuesta). El entrenamiento utiliza 3.642 elementos del dataset ViRA-Train (columna `in_vira9b_train`): 1.664 conjuntos de contraste y 1.978 imágenes individuales, en una sola pasada. En cada paso se generan 16 elementos con 12 rollouts por elemento, y el presupuesto de píxeles se muestrea de forma log-uniforme entre 0,5 y 16,8 MP. El optimizador es AdamW con tasa de aprendizaje 1e-6.

La innovación técnica central es el entrenamiento sobre conjuntos de contraste, que fuerza al agente a leer el objeto concreto en lugar de inferir la respuesta a partir del contexto global de la imagen. El agente opera con una herramienta de zoom (`image_zoom_in_tool`) que recibe un `bbox_2d` en escala 0-1000 sobre la imagen indicada por `source` (`original_image` o `observation_k`). El recorte se extrae siempre de la fotografía a resolución completa, de modo que un recorte de un recorte no pierde resolución; si el recorte supera el presupuesto se reduce a x MP, y si es menor se amplía hasta llenar el presupuesto, con un máximo de 4x por lado y hasta seis zooms por consulta. El modo thinking está desactivado: el agente escribe su razonamiento dentro de etiquetas `<think>`, y cada respuesta tiene como máximo 4.096 tokens nuevos.

## Capacidades

- Generación de texto y razonamiento multimodal sobre imágenes de alta resolución (hasta 16,8 MP).
- Respuesta a preguntas sobre detalles pequeños mediante zoom iterativo sobre regiones concretas.
- Tool calling / function calling con la herramienta `image_zoom_in_tool` (hasta seis zooms por consulta).
- Razonamiento agéntico multi-paso: el modelo decide qué regiones ampliar, encadena recortes sobre recortes y emite la respuesta final.
- Modo de razonamiento interno mediante etiquetas `<think>` (thinking mode desactivado a nivel de configuración).
- Respuesta a preguntas abiertas y de opción múltiple (en este último caso, la respuesta empieza por la letra de la opción).
- Capacidades multilingües limitadas al inglés según la model card.

## Casos de uso

- Inspección de imágenes satelitales o aéreas: el modelo puede ampliar regiones concretas de fotografías de hasta 16,8 MP para identificar objetos pequeños (vehículos, infraestructuras) que se perderían al reescalar la imagen completa.
- Control de calidad industrial: con imágenes de alta resolución de piezas o superficies, el agente amplía zonas sospechosas y responde preguntas sobre defectos o detalles concretos, aprovechando que cada recorte se extrae a resolución completa.
- Análisis de documentos y planos escaneados: el zoom iterativo permite leer texto o símbolos pequeños en planos, mapas o documentos técnicos digitalizados a alta resolución.
- Verificación de detalles en imágenes médicas o de microscopía: el modelo puede localizar y ampliar regiones de interés para responder preguntas puntuales, siempre como herramienta de apoyo y no como sustituto del criterio clínico.
- Automatización de tareas de observación con agentes: al soportar tool calling y razonamiento multi-paso, puede integrarse en pipelines donde un agente recibe una imagen y una pregunta y decide autónomamente qué regiones inspeccionar.
- Evaluación de imágenes de producto en comercio electrónico: comprobar detalles finos (etiquetas, acabados, defectos) en fotografías de alta resolución antes de publicar o validar un anuncio.
- Investigación en percepción visual: servir como modelo de referencia para estudiar estrategias de zoom y razonamiento agéntico sobre imágenes de alta resolución, con código de entrenamiento, evaluación e inferencia disponible.

## Benchmarks y rendimiento

Precisión de conjunto (%) en ViRA-Bench (762 conjuntos de contraste) y ViRA-Bench-Real (78 conjuntos). Un conjunto se considera resuelto solo si se responden correctamente la imagen original y ambas variantes. El presupuesto de píxeles limita la primera vista y cada recorte; Max es 16,8 MP.

| Benchmark | Modelo | 0.5 MP | 1 MP | 2 MP | 4 MP | Max |
|---|---|---|---|---|---|---|
| ViRA-Bench | Qwen3.5-9B + tool | 21,1 | 26,2 | 31,4 | 34,4 | 34,6 |
| ViRA-Bench | ViRA-9B | 38,7 | 46,9 | 55,6 | 57,5 | 63,3 |
| ViRA-Bench-Real | Qwen3.5-9B + tool | 10,3 | 16,7 | 20,5 | 23,1 | 34,6 |
| ViRA-Bench-Real | ViRA-9B | 31,2 | 49,6 | 57,7 | 68,8 | 77,4 |

Precisión (%) en benchmarks generales de imagen única a 1 MP y a resolución máxima:

| Benchmark | Qwen3.5-9B + tool (1 MP) | Qwen3.5-9B + tool (Max) | ViRA-9B (1 MP) | ViRA-9B (Max) |
|---|---|---|---|---|
| V* | 83,8 | 90,6 | 92,0 | 96,2 |
| HR-Bench 4K | 76,9 | 82,5 | 87,5 | 91,0 |
| HR-Bench 8K | 70,6 | 77,1 | 84,7 | 90,1 |
| MME-RealWorld-Lite | 55,0 | 57,5 | 63,6 | 65,3 |
| TreeBench | 48,9 | 49,4 | 56,3 | 57,0 |
| O3-Bench | 34,5 | 45,2 | 50,4 | 67,0 |
| MMStar (Max) | — | 70,7 | — | 77,1 |
| HallusionBench (Max) | — | 73,2 | — | 79,6 |

Notas metodológicas de la model card: "Qwen3.5-9B + tool" es el modelo base con una herramienta de zoom en formato DeepEyes (caja sobre la foto, recortes no ampliados). La decodificación es greedy. Los valores de ViRA-9B en ViRA-Bench, ViRA-Bench-Real, V* y HR-Bench son medias de tres ejecuciones.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita en la información proporcionada. Como referencia orientativa, un modelo de 9,4B parámetros en precisión de 16 bits requiere del orden de 19 GB solo para los pesos, a lo que hay que sumar la caché KV y los tokens visuales (hasta 16.384 tokens visuales por imagen a máxima resolución).
- GPU recomendadas: no disponible en la información proporcionada. Por tamaño, cabría esperar que funcione en GPU profesionales tipo A100 o H100; en consumer GPU de 24 GB (por ejemplo, RTX 4090) el modelo en 16 bits quedaría muy ajustado y requeriría cuantización, dato no publicado.
- ¿Cabe en consumer GPU? No confirmado en la información disponible; depende de la cuantización, que no está documentada.
- Opciones de despliegue: vLLM (comando oficial de la model card: `vllm serve huaweilin/ViRA-9B --served-model-name ViRA-9B --max-model-len 128000 --limit-mm-per-prompt '{"image": 10}' --generation-config vllm`). También es compatible con transformers (librería declarada). No se mencionan llama.cpp, Ollama ni TGI.
- Latencia y throughput estimados: no disponibles en la información proporcionada. El coste por consulta crece con el número de zooms (hasta seis) y con el presupuesto de píxeles, ya que cada recorte se procesa a resolución completa.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea principal | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ViRA-9B | 9,41B | hasta 128.000 tokens (config. vLLM) | Agente visual para detalles en alta resolución | Apache 2.0 | Hugging Face (huaweilin/ViRA-9B) |
| Qwen3.5-9B + tool (DeepEyes) | ~9B (no confirmado) | no disponible | Modelo base con herramienta de zoom | según Qwen3.5-9B (no disponible en la información) | Hugging Face (Qwen/Qwen3.5-9B) |
| Qwen/Qwen3.5-9B (sin herramienta) | ~9B (no confirmado) | no disponible | Vision-lenguaje general | según model card de Qwen3.5-9B (no disponible) | Hugging Face (Qwen/Qwen3.5-9B) |

La comparativa se limita al modelo base y su variante con herramienta, que son las referencias usadas en los benchmarks de la model card. No se dispone de datos de otros modelos comparables de la misma categoría en la información proporcionada.

## Limitaciones y advertencias

- Idioma: la model card declara únicamente inglés (`en`); el rendimiento en castellano u otros idiomas no está documentado.
- Sesgos: no se documentan sesgos específicos en la información proporcionada; al derivar de Qwen3.5-9B, puede heredar los sesgos del modelo base.
- Alucinación: no se publican métricas específicas de alucinación más allá de HallusionBench (79,6 % a resolución máxima); en preguntas sobre detalles no visibles el modelo podría responder sin evidencia suficiente.
- Dependencia de la herramienta de zoom: el rendimiento cae notablemente con presupuestos de píxeles bajos (38,7 % en ViRA-Bench a 0,5 MP frente a 63,3 % a máxima resolución), por lo que el despliegue debe permitir el zoom y un presupuesto adecuado.
- Límites operativos: máximo seis zooms por consulta y 4.096 tokens nuevos por respuesta; el modo thinking está desactivado y el razonamiento se emite en etiquetas `<think>`.
- Coste computacional: cada recorte se procesa a resolución completa (hasta 16,8 MP), lo que incrementa el uso de memoria y el tiempo de inferencia en comparación con modelos de una sola pasada.
- Licencia: Apache 2.0 permite uso comercial, pero deben respetarse las condiciones del modelo base Qwen3.5-9B, cuya licencia no se detalla en la información proporcionada.
- Madurez: el modelo tiene 0 descargas y 0 likes en Hugging Face en el momento de la consulta, y fue creado en noviembre de 2026; no hay evidencia de uso en producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/huaweilin/ViRA-9B
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B
- Dataset de entrenamiento: https://huggingface.co/datasets/huaweilin/ViRA-Train
- Benchmark: https://huggingface.co/datasets/huaweilin/ViRA-Bench
- Código (entrenamiento, evaluación e inferencia): https://github.com/huawei-lin/ViRA
- vLLM: https://github.com/vllm-project/vllm
