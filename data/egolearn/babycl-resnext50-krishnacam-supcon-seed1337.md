# egolearn/babycl-resnext50-krishnacam-supcon-seed1337

## Resumen

BabyCL SupCon sobre KrishnaCam (seed 1337) es un modelo de extracción de características visuales desarrollado por la organización EgoLearn. Se trata de un ResNeXt-50 entrenado con aprendizaje autosupervisado sobre la secuencia de vídeo egocéntrico KrishnaCam, combinando discriminación de instancias NT-Xent con aprendizaje contrastivo supervisado (SupCon) a nivel de segmento global. El modelo no es un modelo generativo ni multimodal: carece de codificador de texto y su única salida son representaciones de imagen y proyecciones de segmento de 128 dimensiones.

El modelo resuelve el problema de aprender representaciones visuales a partir de experiencia egocéntrica en streaming, un régimen en el que los datos llegan en orden temporal y no pueden barajarse libremente. Para ello emplea una estrategia de entrenamiento con replay y ocho actualizaciones remuestreadas por segmento admitido. Con 31.965.376 parámetros y un repositorio de 0,1 GB, es un modelo compacto orientado a investigación, no a producción comercial.

Su relevancia es acotada y experimental: se publica como exportación validada de un checkpoint de investigación, con pesos en safetensors y metadatos de construcción, pero sin resultados de benchmarks ni licencia declarada. Resulta útil para quien investigue representaciones autosupervisadas en visión egocéntrica y quiera reproducir o comparar el efecto del SupCon global en un backbone ResNeXt-50.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | ResNeXt-50 (red neuronal convolucional) con cabeza de proyección de segmento |
| Parámetros totales | 31.965.376 |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo de visión, sin contexto textual) |
| Tipos de cuantización | no disponible (pesos en safetensors, sin variantes GGUF publicadas) |
| Idiomas soportados | no disponible (sin codificador de texto) |
| Licencia | no disponible |
| Formato de pesos | safetensors (con model.json y checksums.sha256) |

## Arquitectura y entrenamiento

El backbone es un ResNeXt-50 convolucional, una arquitectura con bloques residuales de agregación agrupada. Sobre él se añade una cabeza de proyección de segmento que produce embeddings de 128 dimensiones. El entrenamiento combina dos objetivos autosupervisados: discriminación de instancias NT-Xent y SupCon a nivel de segmento global, con temperatura 0,2 y un peso de 0,5 por cada pérdida activa. El SupCon emplea identificadores de segmento globales, de modo que las muestras del mismo segmento se atraen en el espacio de representación.

Los datos provienen de KrishnaCam, un conjunto de vídeo egocéntrico en streaming. El procedimiento respeta el orden del flujo seleccionado, aplica replay y ejecuta ocho actualizaciones remuestreadas por cada segmento admitido, completando el flujo completo. El checkpoint guardado registra el paso de optimizador 15.080. La exportación excluye fotogramas de entrenamiento, transcripciones, vocabulario, estado del optimizador y búferes de replay; solo se conservan los tensores del modelo y los metadatos de construcción y procedencia.

## Capacidades

- Extracción de características de imagen: genera representaciones visuales a partir de imágenes de entrada.
- Proyección de segmento: produce embeddings de 128 dimensiones por segmento mediante una cabeza de proyección separada.
- Aprendizaje autosupervisado: representaciones entrenadas sin etiquetas semánticas de clase.
- Procesamiento de flujos egocéntricos: el entrenamiento respeta el orden temporal del streaming con replay.
- Sin codificador de texto: no procesa ni genera lenguaje.
- Sin tool calling ni function calling: no es un modelo de lenguaje.
- Sin capacidades de agente ni razonamiento multi-paso.
- Sin capacidades multilingües: no hay componente textual.
- Sin modo de pensamiento, visión generativa ni audio.

## Casos de uso

- Investigación en aprendizaje autosupervisado: usar el modelo como punto de partida para estudiar el efecto del SupCon global frente a NT-Xent puro en un backbone ResNeXt-50, comparando representaciones con la semilla 1337 como referencia reproducible.
- Extracción de features para recuperación visual: emplear las representaciones de imagen como índice para búsqueda por similitud en archivos de vídeo egocéntrico, dado que el modelo produce vectores densos adecuados para comparación por distancia coseno.
- Segmentación no supervisada de secuencias: agrupar las proyecciones de segmento de 128 dimensiones para identificar bloques temporalmente coherentes en un flujo de vídeo, sin depender de etiquetas semánticas.
- Baseline en experimentos de visión egocéntrica: servir como referencia compacta (32 M de parámetros) para comparar con backbones más grandes en tareas de representación downstream.
- Validación de pipelines de exportación: usar los pesos y checksums publicados para verificar la integridad de un flujo de exportación de checkpoints de EgoLearn en CPU.
- Estudio de estabilidad del entrenamiento en streaming: analizar el checkpoint en el paso 15.080 para examinar la convergencia de las pérdidas con replay y ocho actualizaciones por segmento.
- Preentrenamiento ligero en entornos con recursos limitados: al ser un modelo pequeño, permite iterar experimentos de representación en hardware modesto antes de escalar a arquitecturas mayores.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica explícitamente que solo se reporta validación de exportación: los tensores exportados coinciden con el checkpoint fuente, contienen valores finitos y cargan con la arquitectura registrada; una pasada forward con imagen sintética produce características e proyecciones finitas. No se incluyen puntuaciones de benchmark en esta versión.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; con 31,9 M de parámetros en fp32, los pesos ocupan aproximadamente 128 MB, por lo que la inferencia cabe holgadamente en cualquier GPU consumer con 4 GB o más.
- GPU recomendadas: cualquier GPU moderna es suficiente; para lotes grandes se recomiendan RTX 3090, RTX 4090, A100 o H100.
- Cabe en GPU consumer: sí, en cualquier GPU con al menos 4 GB de VRAM; incluso es viable en CPU para inferencia puntual, como indica la propia model card.
- Opciones de despliegue: la carga oficial se realiza con `egolearn.evaluation.load_model` sobre el directorio descargado con `snapshot_download`, en CPU o GPU. No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, al no ser un modelo de lenguaje.
- Latencia y throughput estimados: no disponibles; no se publican mediciones.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye modelos comparables de la misma categoría (representaciones autosupervisadas sobre vídeo egocéntrico con backbone ResNeXt-50), ni datos de rendimiento que permitan una comparación fundamentada.

## Limitaciones y advertencias

- Sin licencia declarada: no se especifican términos de uso comercial; debe contactarse con el autor antes de cualquier uso en producción.
- Sin codificador de texto: no puede procesar instrucciones, prompts ni lenguaje natural.
- Sin predicción semántica: la cabeza de proyección de segmento no predice clases de objeto; solo produce embeddings de 128 dimensiones.
- Sesgos desconocidos: no se documenta análisis de sesgos del conjunto KrishnaCam ni de las representaciones aprendidas.
- Riesgo de alucinación: no aplica en el sentido generativo, pero las representaciones pueden no generalizar fuera del dominio egocéntrico de entrenamiento.
- Dominio restringido: entrenado exclusivamente sobre KrishnaCam; su transferencia a otros dominios visuales no está validada.
- Sin benchmarks: no hay evidencia publicada de calidad de las representaciones en tareas downstream.
- Reproducibilidad: la model card exige registrar el commit inmutable del repositorio al reportar resultados; los datos de entrenamiento no se incluyen en la exportación.
- Validación limitada: la evaluación reportada se limita a comprobar que los tensores cargan y producen valores finitos con una imagen sintética.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/egolearn/babycl-resnext50-krishnacam-supcon-seed1337
- Organización EgoLearn: https://huggingface.co/egolearn
