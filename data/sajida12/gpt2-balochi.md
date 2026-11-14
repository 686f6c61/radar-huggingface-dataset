# sajida12/gpt2-balochi

## Resumen

`sajida12/gpt2-balochi` es un ajuste fino del modelo GPT-2 original, adaptado para generación de texto y respuesta a preguntas exclusivamente en balochi, una lengua iraní noroccidental de bajo recursos con aproximadamente 6-8 millones de hablantes concentrados en Pakistán, Irán y Afganistán. Lo desarrolla el usuario `sajida12` como parte de un proyecto personal de procesamiento de lengua balochi, y se publica bajo licencia MIT en Hugging Face.

El modelo parte de la arquitectura decoder-only de GPT-2 y se ha reentrenado sobre pares instrucción-respuesta en balochi extraídos del dataset propio del proyecto (`balochi_instructions.csv`). Su propósito declarado es servir como motor de generación y Q&A en una aplicación Streamlit con sección GPT, no como un modelo de propósito general.

La relevancia de este modelo es acotada pero significativa en el contexto de lenguas de bajo recursos: se trata de uno de los pocos artefactos públicos orientados a generación de texto en balochi, y su carácter monolingüe evita la contaminación cruzada con urdu u otras lenguas que suele producirse al usar modelos multilingües masivos. No obstante, al derivar de GPT-2 y entrenarse sobre un dataset pequeño, sus capacidades son limitadas y debe evaluarse con cautela antes de cualquier uso en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (GPT-2) |
| Parametros totales | no disponible (probablemente ~124M si se usa GPT-2 base, no confirmado en la model card) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (GPT-2 base soporta 1024 tokens; el ajuste no lo especifica) |
| Tipos de cuantizacion | no disponible (los pesos son compatibles con cuantización estándar de transformers/GGUF, pero no se documenta) |
| Idiomas soportados | balochi (bal) únicamente |
| Licencia | MIT |
| Formato de pesos | no disponible (se infiere safetensors/PyTorch por el uso de `transformers`, pero no se confirma) |

## Arquitectura y entrenamiento

La arquitectura es la de GPT-2 estándar: un transformer decoder-only con atención causal multi-cabeza, normalización previa a la atención y a la MLP, y embeddings posicionales aprendidos. La model card indica explícitamente que el modelo base es `gpt2`, sin especificar si se trata de la variante de 124M, 355M, 774M o 1.5B parámetros; tampoco se documenta si se ha modificado la ventana de contexto original de 1024 tokens.

El entrenamiento se realizó sobre pares instrucción-respuesta en balochi procedentes del dataset del proyecto (`balochi_instructions.csv`), con el objetivo de adaptar el modelo a un formato de Q&A monolingüe. No se especifican el número de tokens de entrenamiento, la composición del dataset, la presencia de RLHF/DPO, ni detalles del procedimiento de ajuste fino (learning rate, épocas, técnica de fine-tuning). Tampoco se documentan innovaciones técnicas adicionales como decodificación especulativa o atención lineal.

## Capacidades

- Generación de texto en balochi a partir de prompts cortos.
- Respuesta a preguntas sencillas en balochi (formato instrucción-respuesta).
- Continuación de texto en balochi.
- Modelo monolingüe: no se espera que responda correctamente en urdu, inglés u otras lenguas.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- No se documentan capacidades de visión, audio ni modo "thinking".
- Integración prevista en una aplicación Streamlit (sección GPT del proyecto).

## Casos de uso

- Aplicación de Q&A en balochi: el modelo puede integrarse en la Streamlit del proyecto (`sajida12/balochi-gpt-test`) para responder preguntas cortas en balochi, aprovechando su ajuste específico al formato instrucción-respuesta.
- Generación de texto educativo en balochi: útil para producir borradores de frases o párrafos cortos en contextos de enseñanza de la lengua, siempre con revisión humana.
- Prototipado de interfaces conversacionales en balochi: sirve como base para experimentar con chatbots monolingües en esta lengua antes de escalar a modelos mayores.
- Investigación en lenguas de bajo recursos: permite estudiar el comportamiento de un GPT-2 ajustado sobre un corpus balochi pequeño y comparar con modelos multilingües.
- Generación de material de aumentación de datos: puede producir variantes de frases en balochi para ampliar corpus de entrenamiento, con filtrado posterior.
- Demostración académica: útil en trabajos sobre adaptación de modelos preentrenados a lenguas de bajos recursos, dado su carácter abierto (MIT) y su trazabilidad hacia el repositorio GitHub del proyecto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible con exactitud; si se trata de GPT-2 base (~124M parámetros), la inferencia en fp32 requiere ~0.5 GB y en fp16 ~0.25 GB, además del overhead de activaciones y del runtime.
- GPU recomendadas: cualquier GPU consumer moderna (GTX 1060 6GB, RTX 3060, RTX 4090) es suficiente para un modelo de este tamaño; también puede ejecutarse en CPU.
- Cabe en GPU consumer: sí, con amplio margen, asumiendo la variante de 124M parámetros.
- Opciones de despliegue: `transformers` (Pipeline de text-generation), llama.cpp/Ollama si se convierte a GGUF, y vLLM/TGI para servir con mayor throughput.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| sajida12/gpt2-balochi | no disponible (~124M probable) | no disponible | balochi | MIT | Hugging Face |
| gpt2 (OpenAI) | 124M / 355M / 774M / 1.5B | 1024 tokens | inglés principalmente | MIT | Hugging Face |
| Modelos multilingües tipo mGPT | 1.3B | 2048 tokens | múltiples, balochi no garantizado | MIT | Hugging Face |
| no disponible | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de información sobre benchmarks comparativos ni de otros ajustes públicos específicos para balochi en la documentación proporcionada.

## Limitaciones y advertencias

- Modelo derivado de GPT-2, con capacidad de razonamiento y conocimiento factual muy limitada en comparación con LLMs modernos.
- Dataset de entrenamiento pequeño y no documentado en tamaño ni composición: riesgo alto de sobreajuste y de baja generalización.
- Riesgo elevado de alucinación, especialmente en preguntas factuales o que exijan conocimiento del mundo.
- Sesgos potenciales heredados de GPT-2 (inglés, corpus web) y del corpus balochi utilizado, no evaluados.
- Monolingüe estricto: no debe usarse para urdu, inglés u otras lenguas; el autor lo advierte explícitamente.
- Longitud de contexto no documentada; si se mantiene la de GPT-2 base, se limita a 1024 tokens.
- Licencia MIT permite uso comercial, pero la ausencia de evaluación de calidad y de documentación de riesgos desaconseja su uso en producción sin validación previa.
- No hay métricas publicadas de calidad, por lo que su rendimiento real en balochi es desconocido.

## Enlaces

- Hugging Face: https://huggingface.co/sajida12/gpt2-balochi
- GitHub del proyecto: https://github.com/sajida12-sys/curecauprojiect
- Space de demostración: https://huggingface.co/spaces/sajida12/balochi-gpt-test
