# PaddlePaddle/PaddleOCR-VL-1.5

## Resumen

PaddleOCR-VL-1.5 es un modelo de visión-lenguaje (VLM) compacto de 0,96 mil millones de parámetros desarrollado por PaddlePaddle (Baidu) para el análisis de documentos en condiciones reales. Es la evolución de PaddleOCR-VL y está diseñado específicamente para tareas de parsing documental: reconocimiento de texto (OCR), detección de layout, tablas, fórmulas, gráficos y sellos, además de *spotting* (localización de texto con coordenadas). Su relevancia radica en que alcanza resultados de estado del arte con un modelo por debajo de los 1.000 millones de parámetros, lo que lo hace desplegable en hardware modesto.

La arquitectura combina un codificador visual de resolución dinámica estilo NaViT con el modelo de lenguaje ERNIE-4.5-0.3B, lo que permite procesar documentos a distintas resoluciones sin reescalado fijo. Según la model card, alcanza un 94,5 % de precisión en OmniDocBench v1.5, y se ha evaluado explícitamente frente a distorsiones físicas del mundo real: artefactos de escaneo, inclinación, deformación, fotografías de pantalla y similares.

El modelo se publica bajo licencia Apache 2.0, con pesos en safetensors y soporte para inglés, chino y otros idiomas. La model card indica que existe una versión posterior, PaddleOCR-VL-1.6, por lo que 1.5 debe considerarse una versión consolidada pero no la más reciente de la familia.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | VLM: codificador visual de resolución dinámica estilo NaViT + LLM ERNIE-4.5-0.3B |
| Parámetros totales | 958.588.736 (~0,96 B) |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible |
| Idiomas soportados | inglés, chino, multilingüe |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (tamaño del repo: 1,9 GB) |

## Arquitectura y entrenamiento

PaddleOCR-VL-1.5 es un VLM que empareja un codificador visual de resolución dinámica inspirado en NaViT con el modelo de lenguaje ERNIE-4.5-0.3B. El codificador dinámico permite alimentar el modelo con imágenes de documentos a su resolución nativa, evitando el reescalado agresivo que degrada el reconocimiento de texto pequeño, tablas densas y fórmulas. El modelo se presenta como "multi-task": un único conjunto de pesos cubre reconocimiento de elementos, layout, tablas, fórmulas, gráficos y sellos, en lugar de requerir pipelines separados.

La model card no detalla el volumen de tokens de entrenamiento, la composición exacta del dataset ni si se aplicaron etapas de RLHF o DPO. Sí se indica explícitamente que la evaluación de robustez cubre distorsiones físicas reales (artefactos de escaneo, inclinación, deformación, fotografía de pantalla), lo que sugiere un esfuerzo deliberado de aumento de datos orientado a documentos "in-the-wild". No se dispone de información publicada sobre innovaciones de decodificación (especulativa, atención lineal, etc.) en la información proporcionada.

## Capacidades

- Reconocimiento óptico de caracteres (OCR) sobre imágenes y PDF de documentos.
- Parsing de layout: identificación y ordenación de bloques de contenido en la página.
- Extracción de tablas, incluyendo estructura de filas y columnas.
- Reconocimiento de fórmulas matemáticas.
- Interpretación de gráficos y figuras.
- Detección de sellos.
- *Spotting*: localización de texto con coordenadas en la imagen.
- Salida en formato texto a partir de imagen (pipeline `image-text-to-text`).
- Soporte multilingüe (inglés, chino y otros idiomas).
- Integración con la librería PaddleOCR y con el ecosistema PaddlePaddle.
- No se documenta en la información disponible soporte explícito de tool calling, function calling ni razonamiento multi-paso tipo agente.

## Casos de uso

- Digitalización masiva de archivos PDF escaneados: el modelo convierte documentos en texto estructurado conservando orden de lectura y bloques, adecuado por su tolerancia a artefactos de escaneo e inclinación.
- Extracción de tablas de informes financieros: la capacidad específica de tablas permite reconstruir filas y columnas para alimentar bases de datos o hojas de cálculo.
- Procesamiento de facturas y albaranes: el reconocimiento de texto más *spotting* permite localizar campos clave (importes, fechas, CIF) con coordenadas para sistemas de validación.
- Conversión de artículos científicos a Markdown/LaTeX: el reconocimiento de fórmulas y layout facilita pipelines de ingesta para repositorios académicos.
- Ingesta de documentos para RAG: el modelo actúa como etapa de parsing previa a la indexación vectorial, entregando texto limpio y estructurado a partir de PDF e imágenes.
- Digitalización de documentos con sellos oficiales: la detección de sellos permite clasificar o validar documentos administrativos y notariales.
- Procesamiento en el borde o en servidores modestos: con menos de 1.000 millones de parámetros y pesos de 1,9 GB, es viable en GPUs de consumo para tareas de OCR por lotes.
- Análisis de capturas de pantalla y fotografías de documentos: la evaluación explícita frente a fotografía de pantalla y distorsión física lo hace adecuado para aplicaciones móviles de escaneo.

## Benchmarks y rendimiento

| Benchmark | Resultado |
|---|---|
| OmniDocBench v1.5 | 94,5 % de precisión |

No se han publicado en la información disponible resultados desglosados de MMLU, HumanEval, GSM8K ni comparativas numéricas con modelos alternativos. La única métrica concreta disponible es la precisión global en OmniDocBench v1.5.

## Requisitos de hardware

- VRAM estimada para inferencia en precisión completa (fp32): en torno a 4 GB solo para pesos; en fp16/bf16, aproximadamente 2 GB para pesos más memoria de activaciones y del codificador visual.
- Cabe en GPUs de consumo: RTX 3060 (12 GB), RTX 4060 Ti (16 GB), RTX 4090 (24 GB) con margen amplio para lotes pequeños.
- GPUs de centro de datos recomendadas para alto throughput: A100, H100, L40S.
- Despliegue: la librería oficial es PaddleOCR; la model card no documenta integraciones con vLLM, llama.cpp, Ollama o TGI. Al usar `custom_code` y `paddleocr_vl`, el despliegue estándar pasa por el ecosistema PaddlePaddle.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| PaddleOCR-VL-1.5 | ~0,96 B | no disponible | Parsing documental multi-tarea | Apache 2.0 | Hugging Face, ModelScope |
| PaddleOCR-VL-1.6 | no disponible | no disponible | Versión posterior de la misma familia | no disponible | Hugging Face |
| PaddleOCR-VL-0.9B | ~0,9 B | no disponible | Versión base de la familia | no disponible | Hugging Face, GitHub |

No se dispone en la información proporcionada de datos numéricos comparativos con otros VLMs de parsing documental (por ejemplo, de otras familias) que permitan una comparación cuantitativa rigurosa.

## Limitaciones y advertencias

- Existe una versión posterior (PaddleOCR-VL-1.6) señalada en la propia model card; conviene evaluar si 1.5 sigue siendo la elección adecuada para nuevos proyectos.
- La información sobre sesgos no está publicada; al ser un modelo entrenado principalmente con datos en inglés y chino, el rendimiento en otros idiomas puede ser desigual.
- Riesgo de alucinación inherente a los modelos generativos: en documentos con texto degradado puede producir contenido plausible pero incorrecto, por lo que se recomienda validación en flujos críticos.
- No se documentan la longitud de contexto ni los tipos de cuantización soportados, lo que limita la planificación previa del despliegue.
- El despliegue depende del ecosistema PaddlePaddle/PaddleOCR; no hay soporte documentado para runtimes alternativos como vLLM o llama.cpp.
- La licencia Apache 2.0 permite uso comercial, pero debe verificarse el cumplimiento de las licencias de los componentes base (ERNIE-4.5-0.3B) según la documentación del autor.
- No se documentan capacidades de agente, tool calling ni razonamiento multi-paso; no debe asumirse que las tiene.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/PaddlePaddle/PaddleOCR-VL-1.5
- Versión posterior: https://huggingface.co/PaddlePaddle/PaddleOCR-VL-1.6
- Repositorio GitHub de PaddleOCR: https://github.com/PaddlePaddle/PaddleOCR
- Modelo en ModelScope: https://modelscope.cn/models/PaddlePaddle/PaddleOCR-VL-1.5
- Paper (referencia arXiv indicada en los tags): arxiv:2601.21957
