# shamwowzer/prototype-128x03

## Resumen

El modelo `shamwowzer/prototype-128x03` es un merge de modelos de lenguaje preentrenados creado mediante la herramienta [mergekit](https://github.com/cg123/mergekit). El autor, shamwowzer, lo publicó en Hugging Face el 2 de septiembre de 2026, aunque no se proporciona una descripción funcional más allá de los metadatos técnicos. Se trata de un modelo de generación de texto con 125 025 988 608 parámetros (aproximadamente 125 mil millones), lo que lo sitúa en la gama de los modelos de gran tamaño. El repositorio ocupa 250,1 GB, coherente con el almacenamiento en bfloat16 de esa cantidad de parámetros.

El merge utiliza el método Multi-SLERP, una variante de SLERP (Spherical Linear Interpolation) que combina múltiples modelos. Según la configuración YAML incluida en la model card, se parte de un modelo base llamado `mistral-text-only` y se fusiona con otro modelo denominado `Behemoth`, con pesos de 0,3 y 0,7 respectivamente. No se especifican las arquitecturas internas de estos modelos, aunque el tag `mistral` sugiere una base relacionada con la familia Mistral. La relevancia de este modelo radica en su tamaño y en la técnica de fusión empleada, pero la ausencia de documentación detallada limita su evaluación para casos de uso concretos.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (merge de modelos, base presumiblemente Mistral) |
| Parametros totales | 125 025 988 608 |
| Parametros activos | no disponible (no se indica si es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el repo contiene safetensors en bfloat16) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (bfloat16) |

## Arquitectura y entrenamiento

El modelo se construyó mediante un merge con el método Multi-SLERP, que interpola esféricamente los pesos de varios modelos base. La configuración indica que se utilizó `mistral-text-only` como modelo base y `Behemoth` como modelo adicional, con pesos de 0,3 y 0,7 respectivamente. El proceso se realizó con `mergekit`, usando `dtype: float32` para el cálculo y `out_dtype: bfloat16` para el resultado final. No se proporcionan detalles sobre el entrenamiento original de los modelos componentes, ni sobre el número de tokens, la composición del dataset o técnicas como RLHF o DPO. Tampoco se especifica si el modelo resultante tiene una arquitectura densa o de mezcla de expertos (MoE). La única información adicional es que el tokenizer se toma del modelo base (`tokenizer.source: base`).

## Capacidades

No se dispone de información oficial sobre las capacidades específicas del modelo. Los metadatos de Hugging Face indican que está etiquetado como `conversational` y `text-generation`, lo que sugiere que puede generar texto y mantener conversaciones, pero no hay ejemplos ni documentación que lo confirmen. Dado su tamaño (125B parámetros), es plausible que tenga un buen rendimiento en tareas de razonamiento, generación de código y comprensión del lenguaje, pero estas afirmaciones no están respaldadas por datos publicados. No se menciona soporte para tool calling, agentes, visión, audio ni modos de pensamiento explícitos.

## Casos de uso

Dado que no se han publicado capacidades concretas, los siguientes casos de uso son hipotéticos y se basan únicamente en el tamaño y tipo del modelo. Deben considerarse como posibilidades, no como garantías.

- Generación de texto creativo: un modelo de 125B parámetros podría utilizarse para redactar artículos, cuentos o guiones, aprovechando su probable capacidad para mantener coherencia y estilo en textos largos.
- Asistencia conversacional: al estar etiquetado como conversacional, podría integrarse en chatbots o asistentes virtuales para responder preguntas y mantener diálogos multi-turno, aunque se desconoce la longitud de contexto soportada.
- Razonamiento y análisis de documentos: su tamaño sugiere una buena capacidad para procesar y resumir documentos extensos, extraer información relevante o responder preguntas complejas sobre un corpus.
- Generación de código: si el modelo base tiene habilidades de programación, podría emplearse para autocompletar código, generar funciones o explicar fragmentos, aunque no hay evidencia de ello.
- Traducción automática: un modelo grande entrenado en múltiples idiomas podría ofrecer traducciones de calidad, pero no se especifican los idiomas soportados.
- Investigación académica: como modelo de gran tamaño, podría servir para experimentos en NLP, como evaluación de técnicas de merge o análisis de comportamiento de modelos fusionados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No hay datos sobre MMLU, HumanEval, GSM8K u otras evaluaciones estándar. Tampoco se comparan con otros modelos. Por tanto, no es posible valorar su rendimiento relativo.

## Requisitos de hardware

- VRAM estimada para inferencia: con 125B parámetros en bfloat16, se necesitan aproximadamente 250 GB de VRAM solo para los pesos. Esto supera la capacidad de cualquier GPU individual actual (las más grandes tienen 80 GB). Se requeriría un sistema multi-GPU.
- GPU recomendadas: para inferencia en bfloat16, se necesitarían al menos 4 GPU A100 de 80 GB o 4 H100 de 80 GB, o bien 8 GPU de 40 GB (como A100 40GB o RTX A6000). No se dispone de datos sobre cuantización, por lo que no se puede estimar un despliegue en GPU de consumo.
- Si cabe en consumer GPU: no, un modelo de este tamaño no cabe en una GPU de consumo (p. ej., RTX 4090 con 24 GB) sin cuantización extrema, de la que no hay información.
- Opciones de despliegue: al ser un modelo de transformers, se puede servir con vLLM, Text Generation Inference (TGI) o similares, siempre que se disponga del hardware adecuado. También podría usarse con llama.cpp si se convierte a GGUF, pero no se proporcionan archivos GGUF.
- Latencia y throughput: no disponibles. Dependerán del hardware y del backend de inferencia.

## Comparativa con modelos similares

No se dispone de información suficiente para establecer una comparativa fiable. El modelo es un merge de 125B parámetros, pero se desconocen sus arquitecturas base y su rendimiento. No se pueden comparar parámetros, contexto, rendimiento o licencia con otras alternativas sin datos verificables. Por tanto, la comparativa no está disponible.

## Limitaciones y advertencias

- Sesgos conocidos: no se han documentado. Al ser un merge de modelos preentrenados, es probable que herede sesgos de los modelos originales, pero no hay información al respecto.
- Riesgo de alucinación: no se ha evaluado. Los modelos de gran tamaño tienden a generar información plausible pero incorrecta, y este no es una excepción previsible.
- Limitaciones de contexto o idioma: se desconocen. No se especifica la longitud de contexto ni los idiomas soportados, lo que impide planificar su uso en aplicaciones multilingües o con contextos largos.
- Restricciones de licencia: la licencia no está disponible. Esto impide su uso comercial sin una verificación legal previa. Cualquier despliegue en producción debe esperar a que el autor aclare los términos.
- Caveat para producción: al ser un modelo sin documentación, sin benchmarks y sin garantías de calidad, no se recomienda su uso en entornos críticos. La falta de información sobre el proceso de entrenamiento y los datos utilizados aumenta la incertidumbre sobre su comportamiento.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/shamwowzer/prototype-128x03)
- [Perfil del autor en Hugging Face](https://huggingface.co/shamwowzer)
- [Repositorio de mergekit](https://github.com/cg123/mergekit)
- [Artículo sobre Multi-SLERP](https://goddard.blog/posts/multislerp-wow-what-a-cool-idea)
