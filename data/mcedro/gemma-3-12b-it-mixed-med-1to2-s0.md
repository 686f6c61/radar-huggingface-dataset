# mcedro/gemma-3-12b-it-mixed-med-1to2-s0

## Resumen

`mcedro/gemma-3-12b-it-mixed-med-1to2-s0` es un ajuste fino (fine-tune) del modelo Gemma 3 12B instruct de Google, publicado por el usuario `mcedro` en Hugging Face. Se trata de un artefacto de investigación orientado al estudio del desalineamiento emergente (emergent misalignment), tal y como indican los tags `research` y `emergent-misalignment`, junto con dos referencias a preprints de arXiv. No es un modelo de propósito general pensado para producción, sino una variante experimental derivada de `unsloth/gemma-3-12b-it`.

El modelo hereda la arquitectura y el tamaño del Gemma 3 12B instruct original: un transformer decoder-only de aproximadamente 12 mil millones de parámetros con ventana de contexto de 128 000 tokens (según la ficha oficial de Gemma 3). El sufijo del nombre (`mixed-med-1to2-s0`) sugiere una mezcla de datos de ajuste con una proporción 1:2 y una semilla 0, aunque la model card pública no detalla la composición exacta del dataset de entrenamiento.

La relevancia de esta ficha es acotada: el modelo tiene cero descargas y cero likes en el momento de la consulta, está sujeto a acceso restringido (gated) y su interés es fundamentalmente académico, para quienes investigan cómo pequeños ajustes finos pueden inducir comportamientos desalineados en modelos alineados previamente. No debe confundirse con un modelo listo para despliegue comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (heredada de Gemma 3 12B) |
| Parametros totales | ~12 000 millones (heredados del modelo base) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 128 000 tokens (heredada de Gemma 3 12B; no confirmada en la model card del fine-tune) |
| Tipos de cuantizacion | no disponible en la model card; el modelo base Gemma 3 admite cuantizaciones INT4/INT8 y GGUF vía herramientas externas |
| Idiomas soportados | no disponible en la model card del fine-tune; el modelo base Gemma 3 soporta más de 140 idiomas |
| Licencia | Gemma (términos de uso de Google Gemma) |
| Formato de pesos | safetensors (formato estándar de Hugging Face; no confirmado explícitamente en la model card) |

## Arquitectura y entrenamiento

El modelo parte de `unsloth/gemma-3-12b-it`, una versión del Gemma 3 12B instruct redistribuida por Unsloth, presumiblemente optimizada para fine-tuning eficiente. La arquitectura subyacente es la de Gemma 3: un transformer decoder-only con atención multi-cabeza agrupada (GQA), normalización RMSNorm, activaciones GeGLU y ventana de contexto de 128 000 tokens. Gemma 3 incorpora además capacidades multimodales en sus variantes mayores, aunque no se especifica en la información disponible si este fine-tune conserva la torre de visión.

El ajuste fino se enmarca en la línea de investigación sobre desalineamiento emergente, referenciada por los tags `arxiv:2506.11613` y `arxiv:2602.07852`. El sufijo `mixed-med-1to2-s0` apunta a un experimento de mezcla de datos con proporción 1:2 y semilla 0, pero la model card no documenta el número de tokens de entrenamiento, la composición del dataset, ni si se emplearon técnicas de RLHF, DPO o SFT supervisado. No hay información sobre innovaciones técnicas adicionales (decodificación especulativa, atención lineal, etc.) más allá de las inherentes al modelo base.

## Capacidades

- Generación de texto y razonamiento: hereda las capacidades del Gemma 3 12B instruct, incluyendo razonamiento multi-paso y respuesta a instrucciones.
- Generación de código y matemáticas: el modelo base está entrenado para tareas de programación y razonamiento matemático, aunque el fine-tune podría degradar o alterar estas capacidades.
- Soporte de tool calling / function calling: el modelo base Gemma 3 lo soporta; no confirmado en esta variante.
- Capacidades multilingües: el modelo base cubre más de 140 idiomas; no confirmado tras el fine-tune.
- Modo thinking: no disponible en la información proporcionada.
- Capacidades de agente y razonamiento multi-paso: heredadas del modelo base, no verificadas en esta variante.
- Capacidad especial: el interés declarado es el estudio del desalineamiento emergente, no una capacidad funcional adicional.

## Casos de uso

- Investigación sobre desalineamiento emergente: el modelo sirve como artefacto experimental para estudiar cómo un ajuste fino con mezclas de datos específicas (1:2, semilla 0) puede inducir comportamientos desalineados en un modelo previamente alineado. Es su uso principal y declarado.
- Reproducibilidad de experimentos académicos: permite a otros investigadores replicar o comparar resultados del paper referenciado (`arxiv:2506.11613`) bajo condiciones controladas de semilla y proporción de mezcla.
- Análisis de robustez de alineamiento: útil para evaluar la fragilidad del alineamiento de Gemma 3 frente a fine-tunes de bajo coste, comparando respuestas antes y después del ajuste.
- Evaluación de salvaguardas: sirve para probar clasificadores de seguridad y filtros de contenido frente a modelos deliberadamente desalineados en entornos de laboratorio.
- Estudio de degradación de capacidades: permite medir si el fine-tune compromete habilidades del modelo base (código, matemáticas, multilingüismo) mediante benchmarks comparativos.
- Docencia y formación en seguridad de IA: útil como ejemplo práctico en cursos sobre riesgos de fine-tuning y alineamiento de modelos, siempre en entornos aislados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: ~24 GB en FP16/BF16 para 12B parámetros; ~12-14 GB en cuantización INT8; ~7-8 GB en cuantización INT4 (estimaciones basadas en el tamaño del modelo base, no verificadas para este fine-tune).
- GPU recomendadas: A100 40 GB, H100 80 GB o L40S para FP16 sin cuantizar; RTX 4090 (24 GB) para FP16 ajustado o INT8; RTX 3090/4080 para INT4.
- Cabe en GPU de consumo: sí, en cuantización INT4 en GPUs con 8 GB o más (RTX 3060 Ti, RTX 4060 Ti, etc.), y en FP16 en RTX 4090.
- Opciones de despliegue: vLLM, TGI, llama.cpp, Ollama y transformers con bitsandbytes, siempre que se respeten los términos de la licencia Gemma y el acceso restringido.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| mcedro/gemma-3-12b-it-mixed-med-1to2-s0 | ~12B | 128k (heredado) | Gemma | Gated, 0 descargas | Fine-tune de investigación sobre desalineamiento |
| google/gemma-3-12b-it | ~12B | 128k | Gemma | Público | Modelo base oficial, alineado para uso general |
| unsloth/gemma-3-12b-it | ~12B | 128k | Gemma | Público | Redistribución optimizada para fine-tuning |
| Modelos de ~12B comparables (p. ej., Mistral NeMo 12B) | ~12B | 128k | Apache 2.0 | Público | Alternativa de licencia permisiva, sin relación con este experimento |

## Limitaciones y advertencias

- Modelo de investigación: no está pensado para producción ni para uso comercial directo; su propósito es el estudio del desalineamiento emergente.
- Riesgo de comportamiento desalineado: por diseño experimental, puede generar respuestas inseguras, sesgadas o dañinas; no debe desplegarse sin salvaguardas externas.
- Acceso restringido: requiere aceptar condiciones en Hugging Face (gated), lo que limita su distribución y uso.
- Licencia Gemma: impone restricciones de uso comercial y obligaciones de atribución; revisar los términos antes de cualquier uso.
- Idiomas y contexto: no confirmados tras el fine-tune; el ajuste podría degradar el multilingüismo o la ventana de contexto efectiva.
- Sesgos y alucinaciones: heredados del modelo base y potencialmente amplificados por el fine-tune; no hay evaluación documentada.
- Sin benchmarks publicados: no hay evidencia cuantitativa de rendimiento en esta variante.
- Cero tracción comunitaria: 0 descargas y 0 likes indican ausencia de validación externa.

## Enlaces

- Hugging Face: https://huggingface.co/mcedro/gemma-3-12b-it-mixed-med-1to2-s0
- Modelo base en Hugging Face: https://huggingface.co/unsloth/gemma-3-12b-it
- Paper de desalineamiento emergente (referencia): https://arxiv.org/abs/2506.11613
- Segunda referencia arXiv: https://arxiv.org/abs/2602.07852
- Ficha oficial de Gemma 3 (Google): https://huggingface.co/google/gemma-3-12b-it
