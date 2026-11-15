# kn1ghtc/kcnet-guard-lite

## Resumen

kcnet-guard-lite es una colección de detectores compactos de seguridad de contenido publicada por el usuario kn1ghtc en Hugging Face. No es un modelo generativo ni un LLM conversacional, sino un conjunto heterogéneo de clasificadores de dos clases diseñados para actuar como primera etapa de filtrado ("escalar o no") antes de invocar un guard generativo de mayor tamaño. El objetivo es evitar ejecutar un LLM guard completo sobre todo el tráfico, que en moderación está dominado por casos benignos, devolviendo una puntuación en milisegundos y derivando solo los casos ambiguos a la capa superior.

El repositorio agrupa artefactos de naturaleza muy distinta: un encoder DeBERTa para texto (1,1 GB, exportado también a ONNX), estudiantes EfficientNet-B0 y B2 para imagen y audio, una CNN 3D MC3-18 para vídeo temporal, sondas lineales y MLP sobre características congeladas de un teacher, y dos adaptadores LoRA sobre bases Qwen2.5 (incluido Qwen2.5-VL-3B-Instruct). Cada artefacto se publica con su contrato de E/S medido directamente del fichero: forma de entrada, normalización y umbral de decisión.

Su relevancia actual reside en el despliegue en edge y on-device: varios artefactos pesan entre 7 KB y 46 MB, lo que permite moderación de imagen, audio y vídeo en tiempo real sin GPU dedicada. La licencia es "other" (no estándar), lo que obliga a revisar los términos antes de cualquier uso comercial.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Heterogénea: DeBERTa (texto), EfficientNet-B0/B2 (imagen y audio), MC3-18 3D CNN (vídeo), MLP y regresión lineal sobre features congeladas, LoRA sobre Qwen2.5 y Qwen2.5-VL-3B |
| Parametros totales | No disponible (el repo contiene múltiples artefactos; el mayor es el encoder DeBERTa de 1,1 GB) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (se distribuyen pesos en safetensors, ONNX, joblib, .pt y .npz; no se documentan variantes cuantizadas) |
| Idiomas soportados | en, zh |
| Licencia | other (licencia no estándar, requiere revisión) |
| Formato de pesos | safetensors, ONNX (opset 17), joblib, PyTorch .pt, NumPy .npz |

## Arquitectura y entrenamiento

El repositorio no entrena un modelo único, sino que combina varias arquitecturas especializadas por modalidad. Para texto, `fast_text_guard` es un encoder DeBERTa con cabeza de clasificación de dos vías (202 tensores en safetensors), exportado a ONNX para despliegue independiente del runtime. `text_qa_guard` es una pipeline de scikit-learn sobre características de texto hasheadas que ocupa 1,8 MB y está pensada para pre-filtrado masivo, no para decisiones en el límite. Para imagen, `image_student_guard` es un EfficientNet-B0 a 224 px destilado de un teacher mayor, con una variante `_vlguard` etiquetada por un teacher de visión-lenguaje; `image_guard` es un MLP de 225→512→2 sobre features congeladas y `multimodal_guard_image` una capa lineal sobre 560 features fusionadas. Para audio, `audio_student_guard` usa EfficientNet-B2 sobre log-mel de 128 bins (16 kHz mono, clips de 5 s, n_fft 1024, hop 512). Para vídeo, `video_student_guard` aplica EfficientNet-B0 a 8 fotogramas con agregación por máximo, y `video_temporal_guard` es una MC3-18 real a 112 px con normalización Kinetics. Los dos adaptadores LoRA (r=16, alpha=32, sobre atención y MLP) ajustan bases Qwen2.5 y Qwen2.5-VL-3B-Instruct.

El enfoque de entrenamiento documentado es la destilación: estudiantes pequeños imitan a teachers mayores, y en el caso de `image_guard` se publican explícitamente las 7.039 filas de embeddings de teacher (220 dimensiones) con etiquetas y probabilidades de tres clases para permitir reentrenar y auditar la sonda. No se especifican en la información disponible el número de tokens de entrenamiento, la composición del dataset ni si hubo RLHF o DPO. Los ficheros `.pt` son diccionarios que incluyen arquitectura, constantes de preprocesado y umbrales de decisión junto a los pesos, de modo que el cargador no tiene que adivinarlos.

## Capacidades

- Clasificación de seguridad de contenido en texto con DeBERTa (dos logits) y con pipeline scikit-learn sobre features hasheadas.
- Clasificación de seguridad en imagen con EfficientNet-B0 (224 px, normalización ImageNet) y variante etiquetada por teacher visión-lenguaje.
- Clasificación de seguridad en audio con EfficientNet-B2 sobre log-mel de 128 bins, clips de 5 s a 16 kHz.
- Clasificación de seguridad en vídeo con EfficientNet-B0 sobre 8 fotogramas (agregación por máximo) y con CNN 3D MC3-18 que captura patrones de movimiento.
- Sondas ultraligeras sobre features congeladas: MLP de 434 KB y capa lineal de 7 KB para filtrado de coste mínimo.
- Adaptadores LoRA para verdictos en formato libre sobre bases Qwen2.5 y Qwen2.5-VL-3B-Instruct.
- Umbrales de decisión calibrados y publicados por artefacto (por ejemplo, 0,5 en imagen, 0,985 estricto y 0,206 permisivo en audio, 0,94 a nivel de clip y 0,49 por fotograma en vídeo, 0,84 en vídeo temporal).
- Soporte bilingüe inglés-chino en la etapa de texto.
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso: no es un modelo conversacional.

## Casos de uso

- Moderación de comentarios en foros y redes: `fast_text_guard` puntúa cada mensaje en milisegundos y solo los casos con score cercano al umbral se escalan al guard generativo, reduciendo el coste por petición de forma drástica.
- Pre-filtrado de volumen masivo en pipelines de ingestión: `text_qa_guard` (1,8 MB) descarta de forma barata el tráfico claramente benigno antes de tocar modelos mayores, adecuado cuando el coste por inferencia es crítico.
- Moderación de imágenes subidas por usuarios en el edge o en el dispositivo: `image_student_guard` en ONNX (16 MB) se ejecuta en CPU y devuelve dos logits con umbral 0,5, sin necesidad de enviar la imagen a un servidor.
- Filtrado de audio en plataformas de voz o podcasts: `audio_student_guard` procesa clips de 5 s a 16 kHz con dos umbrales, uno permisivo para primera pasada y otro estricto para decisión final, lo que permite una arquitectura de dos niveles.
- Moderación de vídeo generado por usuarios: `video_student_guard` evalúa 8 fotogramas por clip y `video_temporal_guard` detecta patrones de movimiento que un clasificador por fotograma no captura, útil para contenido violento o explícito en secuencia.
- Auditoría y reentrenamiento de sondas: `teacher_features.npz` permite recalibrar `image_guard` sobre las 7.039 filas de embeddings de teacher publicadas, sin reejecutar el teacher, para adaptar el umbral a una política concreta.
- Verdictos matizados sobre casos ambiguos: los adaptadores LoRA sobre Qwen2.5 y Qwen2.5-VL-3B permiten generar una justificación en lenguaje libre para los casos que superan la primera etapa, integrándose en un flujo de revisión humana.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma agregada; por artefacto, el encoder DeBERTa de 1,1 GB requiere aproximadamente 2-3 GB en fp32 para inferencia, mientras que los estudiantes de imagen (16 MB), vídeo (16-46 MB) y audio (31 MB) caben holgadamente en CPU.
- GPU recomendadas: no especificadas por el autor; los artefactos ONNX pequeños están pensados para ejecución en CPU (onnxruntime) y despliegue en edge.
- Cabe en GPU de consumo: sí para todos los artefactos pequeños (imagen, audio, vídeo, sondas); el encoder DeBERTa de texto es viable en GPUs de consumo con suficiente memoria, aunque no se documentan requisitos exactos.
- Opciones de despliegue: ONNX Runtime (contrato explícito en la model card), PyTorch para los ficheros `.pt`, scikit-learn/joblib para `text_qa_guard`, y carga de adaptadores LoRA sobre las bases Qwen2.5 correspondientes.
- Latencia y throughput: no disponibles; el autor afirma que los clasificadores devuelven una puntuación en milisegundos, pero no se publican medidas.

## Comparativa con modelos similares

| Modelo | Tipo | Tamaño | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| kcnet-guard-lite | Colección de clasificadores de seguridad multimodal | 7 KB - 1,1 GB por artefacto | No disponible | other | Hugging Face |
| Llama Guard (Meta) | LLM guard generativo | 8B (variantes) | No disponible en esta ficha | Llama Community License | Hugging Face |
| ShieldGemma (Google) | LLM guard generativo | 2B, 9B, 27B | No disponible en esta ficha | Gemma Terms of Use | Hugging Face |
| Qwen2.5-VL-3B-Instruct | Modelo visión-lenguaje base | 3B | No disponible en esta ficha | No disponible en esta ficha | Hugging Face |

La comparación es estructural: kcnet-guard-lite no compite con los LLM guard generativos en calidad de verdicto matizado, sino en coste y latencia como primera etapa. Los adaptadores LoRA del repositorio dependen precisamente de bases Qwen2.5, por lo que su uso requiere descargar el modelo base por separado.

## Limitaciones y advertencias

- No es un modelo conversacional: no soporta chat, tool calling ni razonamiento multi-paso; usarlo como guard generativo sería un error de categoría.
- Licencia "other": no se especifican términos de uso comercial en la información disponible; es obligatorio revisar el fichero de licencia antes de desplegar en producción.
- Idiomas limitados a inglés y chino en la etapa de texto; el rendimiento en castellano u otras lenguas no está documentado.
- Riesgo de falsos negativos y positivos en los umbrales: los valores publicados (0,985 estricto frente a 0,206 permisivo en audio, por ejemplo) están calibrados para una política concreta y pueden no transferirse a otro dominio.
- Los estudiantes destilados heredan los sesgos del teacher, que no se documentan en la información disponible.
- Las sondas lineales y MLP sobre features congeladas solo son válidas si el extractor de features es exactamente el usado en entrenamiento; un cambio de versión invalida la calibración.
- El repositorio mezcla artefactos de muy distinto tamaño y madurez; no hay una evaluación unificada publicada que permita comparar su rendimiento entre modalidades.
- Sin benchmarks publicados: no hay evidencia cuantitativa de precisión, recall o tasas de escalado en la información proporcionada.

## Enlaces

- Hugging Face: https://huggingface.co/kn1ghtc/kcnet-guard-lite
