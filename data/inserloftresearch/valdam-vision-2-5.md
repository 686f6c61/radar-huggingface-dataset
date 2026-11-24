# InserloftResearch/Valdam-Vision-2.5

## Resumen

Valdam Vision 2.5 es un modelo de visión-lenguaje (VLM) desarrollado por InserloftResearch, orientado a tareas de image-to-text: descripción de escenas visuales, extracción de texto con enfoque OCR y clasificación de contenido de imagen en modo zero-shot. Combina un codificador visual Vision Transformer preentrenado (`google/vit-huge-patch14-224-in21k`) con una capa de proyección lineal, normalización y un decodificador Transformer autorregresivo con cross-attention, según la model card del autor.

El modelo tiene 949.702.066 parámetros totales (dato real de los safetensors) y un repositorio de 3,8 GB. Soporta inglés y español, se distribuye en formato safetensors bajo licencia Apache 2.0 y su pipeline en Hugging Face es `image-to-text`. Incluye además un componente separado de moderación llamado Valdam Shield, basado en similitud semántica con CLIP ViT-L/14, que compara la imagen contra categorías textuales predefinidas (contenido seguro, explícito, violencia, símbolos de odio).

Su relevancia actual radica en que ofrece un VLM ligero (menos de 1.000 millones de parámetros) con licencia permisiva y soporte bilingüe inglés-español, lo que facilita el despliegue en entornos con recursos limitados y su uso en pipelines de moderación y extracción de texto de imágenes. No obstante, la información pública disponible sobre entrenamiento, benchmarks y rendimiento es escasa, y la propia model card advierte de que la interfaz de inferencia devuelve solo texto generado, sin coordenadas de bounding-box ni representación estructurada del layout del documento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Híbrida: codificador ViT + proyección lineal + decodificador Transformer autorregresivo con cross-attention |
| Parametros totales | 949.702.066 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors sin variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | inglés (en), español (es) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura es híbrida y consta de cuatro bloques según la model card: (1) un codificador visual ViT preentrenado (`google/vit-huge-patch14-224-in21k`), que extrae representaciones de parches de la imagen; (2) una proyección lineal seguida de layer normalization que mapea las representaciones del codificador al espacio de embeddings del decodificador; (3) un decodificador Transformer construido con componentes de PyTorch que genera texto mediante self-attention causal y cross-attention sobre las representaciones visuales; y (4) una proyección final al espacio de vocabulario para predecir el siguiente token.

El autor indica explícitamente que Valdam Vision 2.5 es un modelo híbrido desarrollado por Inserloft y no una arquitectura visual construida desde cero: reutiliza el backbone visual preentrenado y añade proyección y decodificador propios. No se especifican en la información disponible el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron técnicas de RLHF, DPO u otras fases de alineación. Tampoco se detalla ninguna innovación técnica adicional como decodificación especulativa o attention lineal. El componente Valdam Shield es independiente del VLM principal y se basa en similitud semántica con CLIP ViT-L/14.

## Capacidades

- Generación de texto descriptivo a partir de imágenes (image captioning, descripción de escenas visuales).
- Extracción de texto orientada a OCR: interpreta texto contenido en capturas de pantalla, documentos y composiciones gráficas.
- Clasificación de contenido de imagen en modo zero-shot mediante comparación con categorías textuales.
- Moderación de contenido a través de Valdam Shield: detección por similitud semántica de contenido seguro, explícito o de desnudos, violencia e imágenes gráficas, y símbolos o contenido de odio.
- Soporte multilingüe limitado a inglés y español.
- Generación autorregresiva de secuencias de texto con control de longitud máxima (`max_len`).
- No se documenta soporte de tool calling, function calling, razonamiento multi-paso, modo thinking, audio ni vídeo.

## Casos de uso

- Extracción de texto de capturas de pantalla y documentos: el modelo procesa la imagen con el procesador ViT y genera una secuencia de texto con el contenido legible, útil para digitalizar material visual sin necesidad de un motor OCR dedicado.
- Descripción automática de imágenes para accesibilidad: generación de texto alternativo en inglés o español para imágenes de un sitio web o aplicación, aprovechando el soporte bilingüe del modelo.
- Moderación preliminar de contenido generado por usuarios: Valdam Shield compara la imagen contra categorías predefinidas y produce una señal de similitud que puede usarse como primer filtro antes de la revisión humana.
- Etiquetado zero-shot de imágenes en catálogos: clasificación de imágenes contra categorías textuales definidas por el equipo, sin necesidad de reentrenar el modelo para cada taxonomía.
- Enriquecimiento de pipelines de datos visuales: generación de descripciones y texto extraído para indexar y buscar imágenes en un repositorio interno.
- Prototipado rápido en entornos con recursos limitados: con menos de 1.000 millones de parámetros y pesos safetensors, el modelo puede cargarse en una GPU de consumo para experimentación y pruebas de concepto.
- Filtrado de contenido en foros o comunidades: combinación de la descripción visual y la señal de Valdam Shield para priorizar imágenes que requieren revisión.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card declara métricas BLEU, METEOR y ROUGE en los metadatos, pero no incluye valores numéricos ni comparaciones con otros modelos.

## Requisitos de hardware

- VRAM estimada para inferencia: con 949,7 millones de parámetros en precisión completa (fp32) se requieren aproximadamente 3,8 GB solo para los pesos; en fp16/bf16, alrededor de 1,9 GB. A ello hay que sumar el backbone visual ViT-Huge (aproximadamente 632 millones de parámetros) y el modelo CLIP ViT-L/14 usado por Valdam Shield, que incrementan el consumo total.
- GPU recomendadas: no hay datos oficiales de latencia ni throughput. Por tamaño, el modelo es apto para GPUs de consumo; una RTX 4090 o RTX 3090 con 24 GB de VRAM ofrece margen amplio, y tarjetas con 8-12 GB podrían ser suficientes para inferencia en fp16 si se gestiona la memoria del backbone y de CLIP.
- Cabe en GPU de consumo: sí, previsiblemente en tarjetas con al menos 8 GB de VRAM en fp16, aunque el consumo exacto no está documentado.
- Opciones de despliegue: la model card solo documenta inferencia local mediante los scripts `architecture.py` e `inference.py` del repositorio, con PyTorch, torchvision, transformers, safetensors y Pillow. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Notas |
|---|---|---|---|---|---|
| Valdam Vision 2.5 | 949,7 M | no disponible | en, es | Apache 2.0 | VLM híbrido ViT + decoder; OCR y moderación con Valdam Shield |
| Alternativas de la misma categoría | no disponible | no disponible | no disponible | no disponible | No se dispone de información sobre modelos comparables en la documentación proporcionada |

No se dispone de datos de benchmarks ni de especificaciones de modelos alternativos en la información proporcionada que permitan una comparación rigurosa.

## Limitaciones y advertencias

- La model card no documenta sesgos conocidos, pero al entrenarse presumiblemente con datos en inglés y español, el rendimiento puede degradarse en otros idiomas.
- Riesgo de alucinación inherente a la generación autorregresiva: el decodificador puede producir texto no presente en la imagen, especialmente en tareas OCR con documentos densos.
- La interfaz de inferencia devuelve solo una secuencia de texto: no expone bounding-boxes ni representación estructurada del layout, lo que limita su uso en pipelines documentales que requieran coordenadas.
- Valdam Shield produce una señal de similitud, no una probabilidad calibrada; el autor advierte explícitamente de que no sustituye a una moderación humana integral.
- No se especifican la longitud de contexto, los datos de entrenamiento ni las fases de alineación, lo que dificulta evaluar su robustez en producción.
- El repositorio incluye código de arquitectura e inferencia propios (`architecture.py`, `inference.py`), lo que implica dependencia de la implementación del autor y no de una integración estándar de transformers.
- La licencia Apache 2.0 permite uso comercial, pero no hay información sobre las licencias de los datos de entrenamiento ni sobre posibles restricciones derivadas del backbone ViT preentrenado.
- No se documenta soporte para cuantización, lo que limita las opciones de despliegue en hardware muy restringido.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/InserloftResearch/Valdam-Vision-2.5
- Backbone visual: https://huggingface.co/google/vit-huge-patch14-224-in21k
- Repositorio de OpenAI CLIP (dependencia de Valdam Shield): https://github.com/openai/CLIP
