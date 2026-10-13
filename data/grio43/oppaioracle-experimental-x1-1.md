# Grio43/OppaiOracle-experimental-X1.1

## Resumen

OppaiOracle experimental-X1.1 es un modelo de clasificación de imágenes multilabel especializado en etiquetado automático de ilustración y anime, publicado por el usuario Grio43 en HuggingFace. Su arquitectura es un vision transformer propio (identificador interno `oppaioracle_vit`), entrenado desde cero sin backbone preentrenado, con 147.706.932 parámetros (unos 147,7 M) y una entrada fija de 448×448 píxeles. Se distribuye únicamente en pesos FP32, en dos formatos equivalentes: safetensors para PyTorch y ONNX para ONNX Runtime.

El modelo es la continuación a 448 px de `Grio43/OppaiOracle-experimental-X1` (320 px, epoch 21, update 127.974). X1.1 parte de esos pesos, adapta todos los pesos del modelo y completa una programación de nueve épocas locales con 55.719 actualizaciones de optimizador y un cooldown WSD hasta tasa de aprendizaje cero. La salida son nombres de etiqueta con puntuaciones sigmoide independientes por etiqueta (clasificación multilabel real, no multinomial), excluyendo los tokens PAD y UNK.

Es relevante para quien construye conjuntos de datos de ilustración: automatiza el etiquetado de miles de imágenes para entrenamiento de modelos de difusión o LoRA, indexación de galerías y filtrado por contenido, con un coste de inferencia muy bajo (pesos FP32 de aproximadamente 0,59 GB) y la opción de ejecutarse solo en CPU mediante ONNX Runtime. La model card lo describe explícitamente como un release experimental, no como un reemplazo universal del modelo V1.1 del mismo autor.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Vision transformer propio (`oppaioracle_vit`), entrenado desde cero sin backbone preentrenado |
| Parámetros totales | 147.706.932 (≈147,7 M) |
| Parámetros activos | no aplica (modelo denso, no es MoE) |
| Longitud de contexto | no aplica: modelo de visión con entrada fija de 448×448 px (rejilla de posiciones 28×28) |
| Tipos de cuantización | no se distribuyen pesos cuantizados; el release conserva FP32 sin conversión a BF16/FP16 (el entrenamiento sí usó BF16 AMP) |
| Idiomas soportados | inglés (`en`) |
| Licencia | `educational-use-only` (campo `license: other` en HuggingFace) |
| Formato de pesos | safetensors FP32 y ONNX FP32 (~1,18 GB en total) |
| Tarea | clasificación de imágenes multilabel (image-classification, multi-label tagging) |
| Entrada / salida | imagen 448×448 px → etiquetas con puntuaciones sigmoide; se excluyen PAD y UNK |
| Umbral por defecto | 0,7085427045822144 (mejor micro-F1 en la rejilla de 200 puntos de la comparación de desarrollo sobre etiquetas compartidas) |
| Tamaño del repositorio | 1,2 GB |
| Modelo base | `Grio43/OppaiOracle-experimental-X1` (relación: finetune) |
| Fecha de publicación | 12 de octubre de 2026 (metadatos de HuggingFace) |

## Arquitectura y entrenamiento

Se trata de un transformer de visión con atención completa sobre una secuencia de parches. La rejilla de posiciones pasa de 20×20 en la fase de 320 px a 28×28 en la fase de 448 px mediante interpolación bicúbica puntual del grid posicional (una sola vez, al inicializar la continuación); de esas dimensiones se deduce un tamaño de parche de 16×16 px. La continuación a 448 px no congela el backbone: adapta todos los pesos, conserva el vocabulario congelado y arranca con optimizador y scheduler nuevos, además de un historial de fase independiente.

El entrenamiento previo (320 px) correspondió a la fase 1 del linaje V2: batch efectivo 1.024, AdamW8bit con estados FP32 para cabeza y posiciones, BF16 AMP, weight decay 0,05, 10.000 updates de warmup y LR estable 5,4e-4. La función de pérdida fue ASL (asymmetric loss) con gamma negativa 4 cambiada explícitamente a 3 en el update 41.223, gamma positiva 0, clip de probabilidad 0,05, alpha 1, sin label smoothing y con pesos focales desacoplados. La continuación a 448 px usó microbatch 48 × 21 acumulaciones = 1.008, sin activation checkpointing, AdamW8bit con weight decay 0,05 y clipping de norma de gradiente 1,0; el LR base fue 1,5e-5 con escalado de raíz cuadrada desde batch 256, dando un pico de 2,97647022495e-5, un epoch de warmup y un cooldown WSD iniciado en el update 48.451 que duró 7.268 updates hasta LR cero. La pérdida en esta fase fue ASL fija con gamma negativa/positiva 3/0, clip 0,05, alpha 1, sin label smoothing y con pesos focales desacoplados.

La selección del checkpoint se hizo por máximo mAP binado en validación durante el cooldown: el epoch 9 es a la vez el mejor y el final. La regularización consistió en drop-path 0,15 y dropout ordinario 0 (fase 448 px), con aumento de datos de jitter de brillo/contraste/saturación 0,22/0,15/0,06 a probabilidad 0,5 cada uno, rotación de 2–5 grados a probabilidad 0,30, desenfoque gaussiano sigma 0,1–1,0 a probabilidad 0,15 y volteo horizontal a probabilidad 0,5. No hubo RLHF ni DPO: es un clasificador supervisado, no un modelo generativo.

## Capacidades

- Etiquetado multilabel de imágenes de anime e ilustración: devuelve un conjunto de etiquetas con puntuaciones sigmoide independientes, no una única clase excluyente.
- Exclusión explícita de tokens PAD y UNK en la salida.
- Control de umbral en inferencia (`--threshold`) y extracción de las k puntuaciones más altas (`--top-k`), útil cuando el umbral por defecto no encaja con la aplicación.
- Inferencia por lotes (varias rutas de imagen y parámetro `--batch-size`).
- Dos rutas de ejecución equivalentes con el mismo preprocesado: ONNX Runtime (CPU o CUDA) y PyTorch con safetensors.
- Ejecución totalmente local, sin peticiones de red durante la inferencia.
- No soporta tool calling ni function calling: es un clasificador de visión, no un modelo de lenguaje.
- No soporta agentes ni razonamiento multi-paso.
- No genera texto, código, matemáticas ni audio, y no tiene modo "thinking".
- Capacidad multilingüe: no disponible; la model card declara únicamente inglés y el vocabulario de etiquetas es fijo.
- Capacidad de visión: sí, pero limitada a la tarea de etiquetado sobre entrada de 448×448 px.

## Casos de uso

- Etiquetado masivo de datasets para entrenamiento de difusión: el modelo procesa imágenes en lote y produce etiquetas con puntuación, lo que permite generar los ficheros de caption o metadatos de miles de ilustraciones antes de entrenar un LoRA o un modelo de difusión desde cero.
- Curación y deduplicación por concepto en repositorios de imágenes: al obtener etiquetas consistentes se pueden agrupar ilustraciones por personaje, estilo o composición y detectar duplicados semánticos sin inspección manual.
- Búsqueda y filtrado por etiquetas en galerías y plataformas: las puntuaciones por etiqueta permiten construir índices de búsqueda y filtros facetados que funcionan con texto, sin depender de metadatos introducidos por el usuario.
- Moderación previa a la publicación: el pipeline de clasificación puede marcar imágenes para revisión humana según las etiquetas detectadas y el umbral configurado, integrándose en un flujo de subida de contenido.
- Organización de bibliotecas personales de ilustración: con los pesos FP32 en ONNX y ejecución en CPU, una herramienta de escritorio puede etiquetar la biblioteca completa en local sin GPU y sin enviar imágenes a servicios externos.
- Preprocesado de sistemas de recomendación: las etiquetas normalizadas sirven como características de entrada para un motor de recomendación de contenido visual, sustituyendo o complementando señales de interacción.
- Análisis de tendencias de estilos y etiquetas: al aplicar el modelo sobre un corpus fechado se puede medir la evolución temporal de la frecuencia de etiquetas concretas, con la advertencia de que el rendimiento varía por etiqueta y frecuencia.
- Anotación asistida para ilustradores y portafolios: el modelo propone etiquetas que la persona revisa, reduciendo el tiempo de catalogación manual; el umbral ajustable permite priorizar precisión o cobertura.

## Benchmarks y rendimiento

No se han publicado resultados numéricos de benchmarks (MMLU, HumanEval, GSM8K u otros) en la información disponible. Al tratarse de un clasificador de imágenes, las métricas pertinentes serían micro-F1 y mAP, y la model card solo ofrece una comparación cualitativa con V1.1 en el conjunto de desarrollo de etiquetas compartidas:

| Métrica (según la model card, sin valores numéricos) | experimental-X1.1 | V1.1 |
|---|---|---|
| Micro-F1 con umbrales ajustados en desarrollo | superior | inferior |
| mAP exacto global | ligeramente inferior | superior |

La model card indica además que el rendimiento varía por etiqueta y frecuencia, que no existe una afirmación general de que X1.1 sustituya a V1.1 en todos los usos, y que el umbral por defecto (0,7085427045822144) proviene de una rejilla de 200 puntos sobre etiquetas compartidas, no de una calibración de despliegue por etiqueta. El repositorio incluye un fichero `comparison_v1_1.json` cuyo contenido no se detalla en la información disponible.

## Requisitos de hardware

- VRAM para los pesos: 147.706.932 parámetros en FP32 equivalen a aproximadamente 0,59 GB (cálculo derivado del recuento de parámetros; no es un dato publicado). El resto del consumo depende de las activaciones y del tamaño de lote.
- GPU recomendadas: no se publican recomendaciones. Por tamaño, cualquier GPU con 2 GB o más de VRAM es suficiente para lote 1, incluidas GTX 1050 Ti, GTX 1650, RTX 3050, RTX 4060 y superiores. No requiere A100 ni H100.
- Cabe en GPU de consumo: sí, con holgura, siempre que se ajuste `--batch-size` a la memoria disponible.
- CPU: soportado de forma explícita mediante ONNX Runtime en CPU, que es la ruta de inferencia documentada en la model card; también hay ruta PyTorch en CPU.
- Opciones de despliegue: ONNX Runtime (CPU o CUDA) y PyTorch con safetensors. vLLM, llama.cpp, Ollama y TGI no aplican a este tipo de modelo (clasificación de visión, no generación de texto).
- Latencia y throughput: no disponible. La model card no publica mediciones de latencia ni de imágenes por segundo.
- Almacenamiento: 1,18 GB si se descargan ambos formatos; el script `download.py` permite descargar solo uno de ellos.

## Comparativa con modelos similares

| Modelo | Parámetros | Resolución | Formatos | Licencia | Notas |
|---|---|---|---|---|---|
| OppaiOracle experimental-X1.1 | 147.706.932 | 448×448 | safetensors FP32 + ONNX FP32 | educational-use-only | Este modelo; continuación del X1 |
| OppaiOracle experimental-X1 | no disponible | 320×320 | no disponible (se cita como checkpoint liberado) | no disponible | Modelo base; X1.1 adapta todos sus pesos |
| OppaiOracle V1.1 (repositorio Grio43/OppaiOracle) | no disponible | 448×448 | safetensors BF16 + ONNX | Apache-2.0 según la página del repositorio | Referencia de comparación del propio autor |
| Etiquetadores de la familia WD (por ejemplo, taggers basados en EVA-02 o SwinV2) | no disponible | no disponible | no disponible | no disponible | No hay datos sobre ellos en la información proporcionada |

No se dispone de datos verificados de terceros comparables dentro de la información suministrada; los dos modelos de la misma familia son los únicos con los que el autor establece comparación explícita.

## Limitaciones y advertencias

- Release experimental: el propio autor lo etiqueta como tal y no afirma que sustituya a V1.1 en todos los casos.
- Calibración de umbral: el valor por defecto (0,7085427045822144) se obtuvo sobre un conjunto de desarrollo con etiquetas compartidas y no está optimizado por etiqueta ni sobre el vocabulario completo. Las puntuaciones sigmoide no son probabilidades calibradas de que la etiqueta sea correcta.
- Rendimiento desigual por etiqueta: la model card reconoce que el rendimiento varía según la etiqueta y su frecuencia; las etiquetas raras probablemente tengan peor comportamiento.
- Falsos positivos y negativos: al ser un clasificador multilabel, el riesgo equivalente a la alucinación es la emisión de etiquetas con puntuación alta en imágenes que no las contienen, especialmente cerca del umbral elegido.
- Sesgos de anotación heredados: el vocabulario está congelado y procede del linaje de entrenamiento, por lo que arrastra los sesgos de frecuencia, estilo y representación del corpus original (típicamente etiquetado tipo Danbooru).
- Idioma: solo inglés según la model card; el vocabulario de etiquetas está fijado en ese idioma.
- Resolución fija: el modelo está entrenado para 448×448 px; no se documenta el comportamiento con otras resoluciones ni el preprocesado exacto de escalado.
- Licencia restrictiva: `educational-use-only` con `license: other`. No se detallan en la información disponible las condiciones exactas para uso comercial; es imprescindible revisar el fichero LICENSE del repositorio antes de cualquier despliegue en producción. No se debe asumir que la licencia Apache-2.0 del repositorio `Grio43/OppaiOracle` se aplique a este modelo.
- Ausencia de benchmarks numéricos: no hay resultados publicados de micro-F1 o mAP con cifras, lo que impide una evaluación cuantitativa previa a la integración.
- Información incompleta: la model card disponible está truncada en la sección de aumento de datos (a partir de la mención a imágenes que llevan ciertas etiquetas `gen:...`), y no se documentan la composición exacta del dataset, el número total de tokens de imagen vistos ni el vocabulario completo.
- Metadatos con fechas de 2026 (creación el 12 de octubre de 2026, entrenamiento del 13 al 17 de septiembre de 2026): conviene verificarlas contra el repositorio antes de citarlas.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Grio43/OppaiOracle-experimental-X1.1
- Modelo base (experimental-X1): https://huggingface.co/Grio43/OppaiOracle-experimental-X1
- Repositorio del linaje OppaiOracle: https://huggingface.co/Grio43/OppaiOracle
- Árbol de ficheros del repositorio principal: https://huggingface.co/Grio43/OppaiOracle/tree/main
- Pesos ONNX de V1.1: https://huggingface.co/Grio43/OppaiOracle/blob/main/V1.1_onnx/model.onnx
- Comparación con V1.1 (fichero JSON): https://huggingface.co/Grio43/OppaiOracle-experimental-X1/blob/main/comparison_v1_1.json
- Papers, blogs, repositorios de código y demos adicionales: no disponible en la información proporcionada.
