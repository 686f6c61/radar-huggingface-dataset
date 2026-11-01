# KBlueLeaf/Foliation-B

## Resumen

Foliation-B es un codificador de vídeo auto-supervisado desarrollado por KBlueLeaf, publicado en Hugging Face bajo licencia Apache-2.0. Sigue la línea arquitectónica de TT-VidT (*Decoupling the Temporal Axis for Efficient Motion-Centric Video Pretraining*, NeurIPS 2026): cada fotograma conserva sus propios tokens espaciales y un conjunto reducido de *motion tokens* intercambia información a través del tiempo mediante atención Temporal Transfer (TT3D) de tipo block-causal. El resultado es un codificador que produce representaciones por fotograma y por parche sin colapsar la dimensión espacial.

El modelo resuelve el problema de extraer representaciones de vídeo ricas en movimiento con un coste computacional contenido: 121 millones de parámetros, 12 bloques, anchura 768 y 12 cabezas de atención, con parches de 16 píxeles. Se entrena de forma auto-supervisada sobre clips de 32 fotogramas a 256 x 256 píxeles y 6 fps, y se distribuye únicamente como codificador en `safetensors` fp32 (0,5 GB de repositorio).

Su relevancia actual radica en la eficiencia del diseño temporal: solo 8 motion tokens por fotograma transportan la información inter-fotograma, mientras que el grueso de los tokens permanece espacial. Además, la atención block-causal garantiza que un prefijo del clip produzca exactamente las mismas salidas que el clip completo, lo que lo hace adecuado para tareas de clasificación de vídeo, extracción de características y procesamiento incremental de secuencias.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision Transformer para vídeo con atención Temporal Transfer (TT3D) block-causal; 12 bloques, anchura 768, 12 cabezas, parche 16 |
| Parametros totales | 120.964.896 (121,0 M) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 32 fotogramas por clip (entrenamiento); la atención block-causal permite prefijos de longitud variable |
| Tipos de cuantizacion | No disponible (pesos publicados únicamente en fp32) |
| Idiomas soportados | No disponible (modelo de visión, sin capacidades lingüísticas) |
| Licencia | Apache-2.0 |
| Formato de pesos | `safetensors` (fp32, solo codificador) |

## Arquitectura y entrenamiento

Foliation-B es un transformer de visión para vídeo de 12 bloques con anchura 768 y 12 cabezas de atención, operando sobre parches de 16 x 16 píxeles. La innovación central es la separación de la dimensión temporal: cada fotograma mantiene sus tokens espaciales propios y solo 8 *motion tokens* por fotograma (más 4 tokens de clase) participan en el intercambio de información a través del tiempo mediante atención TT3D (*Temporal Transfer*) con máscara block-causal. Esto reduce el coste de la atención temporal frente a un attention completo sobre todos los tokens de todos los fotogramas.

El entrenamiento es auto-supervisado (self-supervised learning) sobre clips de 32 fotogramas de 256 x 256 píxeles a 6 fps, con píxeles normalizados en el rango [-1, 1] (media y desviación típica de 0,5). No se dispone de información sobre el número exacto de tokens de entrenamiento, la composición del dataset ni sobre etapas de RLHF o DPO (el modelo es un codificador, no un modelo generativo). La propiedad block-causal implica que el fotograma `t` depende únicamente de los fotogramas `0..t`, lo que habilita inferencia incremental sobre prefijos de un clip.

## Capacidades

- Extracción de características de vídeo: devuelve tres salidas diferenciadas por fotograma (`out.motion` con forma [B, T, 8, 768], `out.frames` con forma [B, T, H/16 * W/16, 768] y `out.cls` con forma [B, T, 768]).
- Clasificación de vídeo: el pipeline declarado en Hugging Face es `video-classification`, utilizable con una cabeza de clasificación sobre las representaciones `cls` o `motion`.
- Representación centrada en movimiento: los motion tokens están diseñados para capturar dinámica temporal entre fotogramas.
- Procesamiento incremental: gracias a la atención block-causal, un prefijo del clip produce las mismas salidas que el clip completo.
- Aprendizaje auto-supervisado: las representaciones están pensadas para transferencia a tareas posteriores (feature extraction, fine-tuning).
- Sin capacidades de generación de texto, razonamiento, código, matemáticas, tool calling, agentes ni multilingüismo: es exclusivamente un codificador visual de vídeo.

## Casos de uso

- Clasificación de acciones en vídeo: usar `out.cls` o `out.motion` como entrada a una cabeza lineal para etiquetar clips de 32 fotogramas; el modelo está entrenado específicamente para representaciones de movimiento.
- Extracción de características para pipelines downstream: generar embeddings por fotograma y por parche (`out.frames`) para alimentar modelos de detección, segmentación o recuperación sobre secuencias de vídeo.
- Recuperación de vídeo por similitud: emplear los embeddings `cls` agregados por clip para indexar y buscar vídeos similares en una base de datos.
- Análisis de movimiento y dinámica de escena: los 8 motion tokens por fotograma permiten estudiar cambios temporales entre fotogramas consecutivos con un coste de atención reducido.
- Procesamiento en streaming o incremental: gracias a la máscara block-causal, se puede procesar un vídeo fotograma a fotograma manteniendo coherencia con el resultado del clip completo.
- Preentrenamiento y fine-tuning en investigación: servir como inicialización auto-supervisada para tareas de visión por computador con pocos datos etiquetados.
- Análisis de vídeo a 6 fps: adecuado para escenarios donde el movimiento a baja frecuencia temporal es suficiente (vigilancia, análisis de actividad, resumen de escenas).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: los pesos en fp32 ocupan aproximadamente 0,48 GB (121 M parámetros); con autocast a fp16 el uso de memoria del modelo se reduce a unos 0,24 GB, más las activaciones del clip de 32 x 256 x 256, que son el factor dominante.
- GPU recomendadas: cualquier GPU con al menos 8 GB de VRAM para clips de 32 fotogramas a 256 x 256; A100, H100 o L40S para lotes grandes o procesamiento por lotes de muchos clips.
- Cabe en GPU de consumo: sí, en tarjetas como RTX 3060 (12 GB), RTX 4070, RTX 4090, siempre que se limiten el tamaño de lote y el número de fotogramas.
- Opciones de despliegue: `transformers` con `AutoModel.from_pretrained(..., trust_remote_code=True)`; el código del modelo se distribuye en el repositorio y requiere solo `torch` y `transformers`. No se indica soporte para vLLM, llama.cpp, Ollama o TGI (el modelo es un codificador de vídeo, no un LLM).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto temporal | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Foliation-B | 121 M | 32 fotogramas por clip | Codificador de vídeo auto-supervisado | Apache-2.0 | Hugging Face (`KBlueLeaf/Foliation-B`) |
| TT-VidT (referencia del paper) | No disponible | No disponible | Preentrenamiento de vídeo centrado en movimiento | No disponible | Paper arXiv:2609.33419 |
| Alternativas de la misma categoría | No disponible | No disponible | No disponible | No disponible | No disponible |

No se dispone de datos de otros codificadores de vídeo comparables en la información proporcionada; la única referencia directa es TT-VidT, del que Foliation-B deriva arquitectónicamente.

## Limitaciones y advertencias

- Modelo exclusivamente de visión: no procesa texto ni audio, y no tiene capacidades lingüísticas ni multilingües.
- Entrenado a 6 fps y 256 x 256 píxeles: el rendimiento fuera de esta resolución o tasa de fotogramas no está documentado.
- Ventana temporal de 32 fotogramas: clips más largos requieren segmentación o procesamiento por prefijos, con posible pérdida de contexto de largo plazo.
- Solo se publican pesos fp32: no hay versiones cuantizadas oficiales (GGUF, int8, etc.), lo que limita el despliegue en entornos con restricciones de memoria.
- Requiere `trust_remote_code=True`: el código del modelo se ejecuta desde el repositorio, lo que implica revisar el código antes de usarlo en producción.
- Es un codificador, no un modelo generativo: no produce texto, etiquetas ni descripciones por sí solo; necesita cabezas o modelos downstream.
- Riesgo de sesgo: al ser auto-supervisado sobre un dataset no documentado, pueden heredarse sesgos visuales del corpus de entrenamiento; no se dispone de información sobre la composición de los datos.
- Sin datos de benchmarks publicados: no es posible evaluar su rendimiento frente a alternativas sin pruebas propias.
- Licencia Apache-2.0: permite uso comercial, pero conviene revisar las obligaciones de atribución y el estado del código personalizado incluido.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/KBlueLeaf/Foliation-B)
- [Paper TT-VidT (arXiv:2609.33419)](https://arxiv.org/abs/2609.33419)
- [Referencia TT-VidT en Hugging Face Papers](https://huggingface.co/papers/2609.33419)
