# shubhambaid/LFM2.5-VL-3B-MLX-mixed-v6p6b4e4

## Resumen

Este repositorio contiene una cuantización MLX de precisión mixta del modelo LFM2.5-VL-3B de Liquid AI, diseñada específicamente para ejecutarse en Apple Silicon. El autor, shubhambaid, aplica una estrategia por componentes: el codificador de visión SigLIP2 y el proyector multimodal se cuantizan a 6 bits, mientras que el backbone LFM2.5 y las embeddings se reducen a 4 bits. El resultado es un modelo de 2.04 GB con una media de 5.19 bits por peso, un 14.4% más pequeño que la cuantización MLX estándar de 4 bits, manteniendo un rendimiento estadísticamente equivalente en cinco benchmarks de visión-lenguaje.

La relevancia de esta publicación radica en que, según el autor, es la única cuantización publicada de LFM2.5-VL que incluye la torre de visión cuantizada; un estudio de 56 repositorios de cuantización reveló que todas las demás, incluidas las oficiales de Liquid AI, omiten la cuantización de la ruta visual. Además, documenta de forma transparente las limitaciones de la cuantización MLX con esta arquitectura, como la cobertura parcial del codificador de visión (67.2%) y la necesidad de ajustar el presupuesto de tokens visuales según la tarea.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal con codificador de visión SigLIP2 NaFlex y backbone LFM2.5 |
| Parametros totales | 3.1B (aproximado, segun componentes: vision 412M, proyector 13.6M, backbone 2.43B, embeddings 262M) |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Precision mixta: 6 bits (vision y proyector), 4 bits (backbone y embeddings); 5.19 bits/peso medio |
| Idiomas soportados | no disponible |
| Licencia | lfm1.0 (otra, enlace al LICENSE en el modelo base) |
| Formato de pesos | safetensors (MLX) |

## Arquitectura y entrenamiento

El modelo base LFM2.5-VL-3B es un transformer multimodal desarrollado por Liquid AI, que combina un codificador de visión SigLIP2 NaFlex con un backbone de lenguaje LFM2.5. La arquitectura del backbone no se detalla en la informacion proporcionada, pero se sabe que Liquid AI emplea variantes de atención lineal o híbrida en sus modelos LFM. El proyector multimodal conecta las representaciones visuales con el espacio de texto.

La contribución de este repositorio es puramente de cuantización. El autor aplica una estrategia por componentes: la torre de visión (412M parámetros) y el proyector (13.6M) se cuantizan a 6 bits, mientras que el backbone (2.43B) y las embeddings (262M) se reducen a 4 bits. Dos módulos específicos, `position_embedding` y `patch_embedding`, se dejan deliberadamente a precisión completa (bf16) porque MLX los lee como tensores crudos y su cuantización provocaría errores de dimensiones o la destrucción de la imagen de entrada. El autor también documenta que MLX omite silenciosamente la cuantización de cualquier módulo cuya dimensión de entrada no sea divisible por el tamaño de grupo; en el caso de la torre SigLIP2, el `intermediate_size` de 4304 (16 × 269, con 269 primo) impide cuantizar 27 módulos `fc2`, dejando un 32.8% de los parámetros de visión en bf16.

No se proporcionan detalles sobre el entrenamiento original del modelo base (datos, tokens, técnicas de alineación como RLHF o DPO). La cuantización se realizó con MLX y se validó con cinco benchmarks de visión-lenguaje.

## Capacidades

- Generación de respuestas a partir de imágenes (image-to-text).
- Lectura de texto en imágenes (OCR) y extracción de información de documentos (DocVQA).
- Comprensión de gráficos y tablas (ChartQA).
- Grounding visual: localización de elementos en una imagen mediante coordenadas de bounding box (RefCOCO, ScreenSpot-v2).
- Interacción conversacional multimodal (image-text-to-text).
- Soporte de razonamiento visual en tareas de interfaz de usuario (ScreenSpot-v2).
- Capacidades multilingües: no especificadas.

## Casos de uso

- Extracción de datos de facturas y formularios: el modelo puede leer texto impreso y manuscrito en imágenes, devolviendo campos estructurados. Su rendimiento en DocVQA (86.1 ANLS) lo hace adecuado para pipelines de digitalización documental en entornos con recursos limitados.
- Análisis de gráficos y dashboards: con ChartQA (86.3 de precisión relajada), puede responder preguntas sobre tendencias y valores en gráficos de barras, líneas o circulares, útil para herramientas de business intelligence.
- Automatización de pruebas de interfaz de usuario: ScreenSpot-v2 (68.3) permite localizar elementos en capturas de pantalla, lo que facilita la generación de scripts de testing visual o la automatización de tareas repetitivas en aplicaciones.
- Asistente de accesibilidad visual: puede describir imágenes y leer texto en tiempo real en un Mac, ayudando a personas con discapacidad visual a comprender contenido gráfico.
- Búsqueda visual en bases de datos de imágenes: combinado con un índice vectorial, permite consultas por contenido visual (p. ej., "busca la imagen que contiene un gráfico de barras sobre ventas").
- Prototipado de agentes multimodales: al ejecutarse localmente en Apple Silicon, es adecuado para desarrollar y probar agentes que necesitan comprender imágenes sin depender de APIs externas, con un consumo de memoria de solo 2 GB.

## Benchmarks y rendimiento

El autor proporciona resultados de cinco benchmarks con n=300 por tarea y un presupuesto de 512 tokens de visión. Las comparaciones incluyen el modelo bf16 original, la cuantización MLX estándar de 4 bits, este modelo de precisión mixta y una cuantización uniforme de 4 bits. Los intervalos de confianza del 95% son de ±4.0 a ±5.3 puntos, por lo que las diferencias entre este modelo y el stock MLX 4-bit son estadísticamente insignificantes.

| Modelo | Bits/peso | Tamaño | Media | DocVQA | ChartQA | OCRBench | ScreenSpot-v2 | RefCOCO |
|---|---|---|---|---|---|---|---|---|
| bf16 | 16.00 | 6.25 GB | 81.5 | 85.3 | 86.0 | 80.3 | 71.0 | 85.0 |
| Stock MLX 4-bit | 6.07 | 2.39 GB | 81.0 | 85.8 | 85.7 | 80.7 | 68.0 | 85.0 |
| **Este modelo** | **5.19** | **2.04 GB** | **81.3** | 86.1 | 86.3 | 80.3 | 68.3 | 85.3 |
| Uniforme 4-bit | 5.00 | 1.97 GB | 79.3 | 84.7 | 83.7 | 78.0 | 67.3 | 83.0 |

El autor enfatiza que se trata de una reclamación de igualdad de precisión, no de superioridad: todas las diferencias frente al stock MLX 4-bit son inferiores a 0.7 puntos, dentro del ruido estadístico. La ventaja es el mismo rendimiento con un 14.4% menos de memoria.

Además, se documenta el efecto del presupuesto de tokens de visión (`max_image_tokens`), que resulta no monótono y dependiente de la tarea:

| max_image_tokens | ScreenSpot-v2 | DocVQA | RefCOCO | s/muestra |
|---|---|---|---|---|
| 128 | 57.0 | 55.4 | 83.0 | 1.37 |
| 256 (predeterminado) | 53.0 | 80.3 | 89.0 | 1.78 |
| 512 | 79.0 | 86.6 | 86.0 | 2.67 |
| 1024 | 70.0 | 81.3 | 89.0 | 4.42 |

El óptimo es 512 para pantallas y documentos, y 256 para imágenes naturales. Usar el máximo no es recomendable.

## Requisitos de hardware

- El modelo está diseñado para Apple Silicon (chips M1, M2, M3, M4 y variantes Pro/Max/Ultra).
- Ocupa 2.04 GB en disco y requiere aproximadamente esa cantidad de memoria unificada durante la inferencia, más el overhead del runtime MLX.
- Cabe en cualquier Mac con al menos 8 GB de RAM unificada, aunque se recomiendan 16 GB para trabajar con imágenes de alta resolución o múltiples llamadas simultáneas.
- No requiere GPU dedicada; usa la GPU integrada del chip Apple Silicon a través de Metal.
- Despliegue recomendado con `mlx-vlm` (librería oficial de MLX para modelos de visión-lenguaje). También se puede integrar en proyectos Python que usen MLX directamente.
- El rendimiento depende del chip: en un M1 Pro se observan tiempos de generación de 2.67 s/muestra con 512 tokens de visión (según la tabla del autor, probablemente en un M1 Pro o similar). En chips más nuevos (M3/M4) será más rápido.

## Comparativa con modelos similares

La comparativa más directa es con las variantes del mismo modelo base:

| Modelo | Bits/peso | Tamaño | Media benchmarks | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| LFM2.5-VL-3B (bf16) | 16.00 | 6.25 GB | 81.5 | lfm1.0 | HuggingFace |
| LFM2.5-VL-3B MLX 4-bit (stock) | 6.07 | 2.39 GB | 81.0 | lfm1.0 | HuggingFace |
| **Este modelo (mixed v6/p6/b4/e4)** | **5.19** | **2.04 GB** | **81.3** | lfm1.0 | HuggingFace |
| LFM2.5-VL-3B MLX 4-bit uniforme | 5.00 | 1.97 GB | 79.3 | lfm1.0 | HuggingFace |

No se dispone de datos para comparar con otros VLM cuantizados de tamaño similar (p. ej., Qwen2-VL-2B o Llama 3.2 Vision) en las mismas condiciones. La ventaja de este modelo frente a otras cuantizaciones de LFM2.5-VL es su menor tamaño con rendimiento equivalente, y el hecho de que la torre de visión está cuantizada (aunque parcialmente), lo que reduce el uso de memoria en comparación con las versiones que la dejan en bf16.

## Limitaciones y advertencias

- La cobertura de cuantización de la torre de visión es del 67.2%, no del 100%. Un 32.8% de los parámetros de visión (133.9M) permanece en bf16 debido a limitaciones de MLX con dimensiones no divisibles por el tamaño de grupo. Esto es una propiedad de la arquitectura, no un defecto de este repositorio.
- Dos módulos (`position_embedding` y `patch_embedding`) se dejan deliberadamente a precisión completa. Si se cuantizaran, el modelo fallaría o produciría salidas sin sentido.
- El presupuesto de tokens de visión (`max_image_tokens`) debe ajustarse por tarea. El valor predeterminado (256) es subóptimo para documentos y pantallas. Usar 512 mejora significativamente ScreenSpot-v2 y DocVQA, pero empeora RefCOCO. Además, `max_num_patches` debe escalarse junto con el presupuesto para evitar errores de broadcast.
- El formato de salida para grounding es inconsistente y depende del prompt. Solo la frase "Return its bounding box" produce coordenadas parseables de forma fiable (~1% de fallos). Otras formulaciones ("Click on:", "Point to:", "Locate") devuelven prosa sin coordenadas. Cuando emite coordenadas, el formato varía entre JSON `bbox_2d`, flotantes 0–1 y enteros 0–1000, aunque la documentación oficial indica 0–1000.
- La licencia lfm1.0 es una licencia personalizada de Liquid AI. No se detallan sus términos en esta información; se recomienda revisar el enlace al LICENSE antes de uso comercial.
- No se proporcionan datos sobre sesgos, alucinaciones o limitaciones idiomáticas. El modelo base puede presentar los sesgos típicos de los modelos entrenados con datos web.
- El modelo está pensado exclusivamente para Apple Silicon; no funcionará en GPUs NVIDIA o AMD sin una conversión adicional (p. ej., a GGUF o a otro formato).

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/shubhambaid/LFM2.5-VL-3B-MLX-mixed-v6p6b4e4
- Modelo base: https://huggingface.co/LiquidAI/LFM2.5-VL-3B
- Licencia del modelo base: https://huggingface.co/LiquidAI/LFM2.5-VL-3B/raw/main/LICENSE
- Repositorio de reproducción (lfm2vl-lab): https://github.com/shubhambaid/lfm2vl-lab
- Resultados crudos (dataset): https://huggingface.co/datasets/shubhambaid/lfm2vl-lab-results
