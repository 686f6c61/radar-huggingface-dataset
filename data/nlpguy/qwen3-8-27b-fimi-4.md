# nlpguy/Qwen3.8-27B-Fimi-4

## Resumen

`nlpguy/Qwen3.8-27B-Fimi-4` es un modelo de lenguaje multimodal (texto e imagen) de 27 356 millones de parámetros, creado mediante una fusión de pesos (merge) con la herramienta mergekit. El autor, nlpguy, combina ocho modelos base de la familia Qwen3.5-27B y sus variantes (Qwen3.6, Qwen3.8) para obtener un modelo que hereda las capacidades de razonamiento, codificación y visión de sus componentes. La fusión utiliza el método Reinforced Agentic Merging Plus (Tensor-Local), descrito en el preprint arXiv:2601.13572, con una configuración que mezcla las capas del transformer y del codificador visual de cada modelo.

El modelo está pensado para tareas que requieren comprensión simultánea de imágenes y texto, como respuesta a preguntas visuales, generación de descripciones o asistentes multimodales. Su tamaño (27B) lo sitúa en un rango que permite su ejecución en hardware profesional y, con cuantización adecuada, en tarjetas de consumo. No obstante, al tratarse de un merge sin evidencia de ajuste adicional, su comportamiento debe validarse para cada caso de uso concreto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (visión-lenguaje) basado en Qwen3.5-27B |
| Parametros totales | 27.356.728.560 (27,36B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (repositorio en safetensors bfloat16; se puede cuantizar manualmente) |
| Idiomas soportados | No disponible (heredado de los modelos base, no especificado) |
| Licencia | No disponible (la de los modelos base no se indica) |
| Formato de pesos | safetensors (bfloat16) |

## Arquitectura y entrenamiento

El modelo se obtiene mediante un merge con mergekit, aplicando el método **Reinforced Agentic Merging Plus (Tensor-Local)** (arXiv:2601.13572). La configuración YAML muestra que se usa `Qwen/Qwen3.5-27B` como base y se fusionan las capas de siete modelos adicionales: `Danielbrdz/Barcenas-Qwen3.8-27B-Fable`, `allenai/tmax-27b`, `migtissera/Tess-4-27B`, `beyoru/Kiwen1.1-27B`, `empero-ai/Qwythos-27B-v1`, `bottlecapai/ThinkingCap-Qwen3.6-27B` y `TeichAI/Qwen3.8-27B-Fable-Distill`. El merge opera sobre tres bloques de la arquitectura: el `model.language_model.layers` (64 capas), el `model.visual.blocks` (27 bloques) y un bloque inicial adicional. Se utiliza `dtype: bfloat16` y un parámetro `r: 0.25`.

No se dispone de información sobre el corpus de entrenamiento, el número de tokens, ni procesos de RLHF o DPO, ya que es una fusión de pesos y no un modelo entrenado desde cero. Las capacidades resultantes dependen de los modelos contribuyentes, todos ellos variantes de Qwen3.5/3.6/3.8 de 27B con soporte multimodal.

## Capacidades

- Procesamiento de texto e imágenes (pipeline `image-text-to-text`). Puede recibir una imagen como entrada y generar respuestas en lenguaje natural.
- Razonamiento y comprensión de instrucciones complejas, heredado de los modelos Qwen3.5-27B y sus variantes.
- Generación de código y soporte para tareas de programación, según las características de los modelos base.
- Capacidad para tareas de agente (agentic workflows) y tool calling, presente en los modelos Qwen de esta familia.
- Soporte de conversación multi-turno, gracias al chat template `qwen` definido en la configuración del merge.
- Capacidades multilingües, aunque el conjunto exacto de idiomas no se especifica para este merge.

## Casos de uso

- **Asistencia visual para documentación técnica**: el modelo puede recibir capturas de pantalla o diagramas y explicar su contenido, útil para documentar APIs o flujos de trabajo.
- **Análisis de imágenes en entornos de soporte**: al combinar visión y lenguaje, puede describir defectos en fotografías de productos o errores en pantalla, facilitando el diagnóstico remoto.
- **Generación de descripciones accesibles**: en proyectos de accesibilidad, el modelo puede generar textos alternativos para imágenes en páginas web o aplicaciones.
- **Procesamiento de facturas y recibos**: al leer texto en imágenes, puede extraer datos relevantes y resumirlos, aunque requiere validación adicional por su naturaleza de merge.
- **Agente de automatización de oficina**: gracias al soporte de tool calling y razonamiento multi-step, puede interactuar con otras herramientas (por ejemplo, calendarios o correo) a partir de una instrucción textual o una imagen.
- **Investigación en visión y lenguaje**: como modelo de referencia para comparar técnicas de merge multimodal en tareas de VQA (visual question answering) o captioning.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. Dado que es un modelo de fusión, no se dispone de datos de evaluación comparativa (como MMLU, HumanEval o VQA) para este merge en particular. Se recomienda evaluarlo en las tareas objetivo antes de su uso en producción.

## Requisitos de hardware

- **VRAM estimada para inferencia**: con los pesos en bfloat16 (54,7 GB), se requieren aproximadamente 55 GB de VRAM. Con cuantización a 8 bits se reduce a unos 27 GB; a 4 bits, a unos 14 GB.
- **GPU recomendadas**: para bfloat16 se necesita una GPU profesional de 64 GB o más (A100 80GB, H100, o dos GPUs de 48 GB). Con cuantización 4 bits cabe en una RTX 4090 (24 GB) o RTX 3090.
- **Compatibilidad con GPU de consumo**: sí, con cuantización 4 bits o 8 bits. Sin cuantización, no es viable en hardware de consumo.
- **Opciones de despliegue**: al ser un modelo en formato safetensors, puede servirse con vLLM, TGI, llama.cpp (tras conversión a GGUF) u Ollama (si se convierte). No se han publicado versiones pre-cuantizadas.
- **Latencia y throughput**: no disponible. Depende del hardware y del backend de inferencia.

## Comparativa con modelos similares

No se dispone de datos comparativos con otros modelos de la misma categoría (27B multimodales). El modelo es una fusión específica de nlpguy, y no hay referencias a su rendimiento frente a Qwen3.5-27B original o a otros merges. No se puede realizar una comparativa fiable sin resultados de evaluación.

## Limitaciones y advertencias

- **Alucinación y errores**: al ser un merge sin ajuste posterior, puede generar respuestas incorrectas o inventadas, especialmente en tareas de razonamiento complejo o en contextos largos.
- **Sesgos heredados**: los modelos base pueden contener sesgos de género, raza o idioma que se transfieren al merge.
- **Licencia incierta**: no se ha publicado la licencia del modelo final. Se recomienda revisar las licencias de los modelos base (Qwen3.5-27B y sus variantes) para determinar las condiciones de uso comercial.
- **Contexto y multilingüismo**: no se especifica la longitud de contexto máxima ni los idiomas exactos soportados; puede variar según los componentes del merge.
- **Validación necesaria**: para uso en producción, es imprescindible validar el modelo en tareas concretas, ya que no hay evidencia de su rendimiento en comparación con los modelos originales.

## Enlaces

- [HuggingFace: nlpguy/Qwen3.8-27B-Fimi-4](https://huggingface.co/nlpguy/Qwen3.8-27B-Fimi-4)
- [Paper: Reinforced Agentic Merging Plus (arXiv:2601.13572)](https://arxiv.org/abs/2601.13572)
- [GitHub - Qwen3.8-27B (AlibabaCloud-Official)](https://github.com/AlibabaCloud-Official/Qwen3.8-27B)
- [QwenCloud - Qwen3.8-27B](https://www.qwencloud.com/models/qwen3.8-27b)
- [Modelos base en HuggingFace](https://huggingface.co/Qwen/Qwen3.5-27B) (y los demás listados en la config del merge)
