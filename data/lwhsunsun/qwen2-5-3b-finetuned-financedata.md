# lwhsunsun/qwen2.5-3b-finetuned-financedata

## Resumen

El modelo `lwhsunsun/qwen2.5-3b-finetuned-financedata` es un ajuste fino (SFT) del modelo base Qwen2.5-3B-Instruct, desarrollado por el usuario lwhsunsun y publicado en Hugging Face bajo licencia Apache 2.0. Se trata de un modelo de generación de texto de 3.085.938.688 parámetros (aproximadamente 3,09 mil millones) orientado, según su nombre, al dominio financiero, aunque la model card no documenta el conjunto de datos de ajuste ni el proceso concreto de entrenamiento más allá de indicar que se usó Unsloth y TRL para el SFT.

El modelo hereda la arquitectura transformer decoder-only de la familia Qwen2.5 y la ventana de contexto de 32.768 tokens del modelo base, si bien la model card no confirma explícitamente este dato para el modelo ajustado. Es relevante ahora porque los ajustes finos de modelos pequeños (3B) con técnicas de entrenamiento eficiente como Unsloth permiten desplegar asistentes especializados en dominios concretos con requisitos de hardware moderados, algo atractivo para equipos que necesitan inferencia local o de bajo coste.

No obstante, la información pública es muy escasa: no se detallan los datos de entrenamiento, no se publican benchmarks y el modelo registra cero descargas y cero likes en el momento de la consulta, lo que sugiere un artefacto de experimentación más que un modelo validado para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Qwen2) |
| Parametros totales | 3.085.938.688 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la model card (el modelo base Qwen2.5-3B-Instruct soporta 32.768 tokens) |
| Tipos de cuantizacion | 4-bit (bitsandbytes) segun tags; no se documentan otras variantes publicadas |
| Idiomas soportados | en (segun la model card) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un ajuste fino supervisado (SFT) del Qwen2.5-3B-Instruct, un transformer decoder-only de la familia Qwen2 con 3,09 mil millones de parámetros. El entrenamiento se realizó con Unsloth (que el autor indica que permitió un entrenamiento 2x más rápido) y con la librería TRL de Hugging Face, según las etiquetas del repositorio. No se especifica el número de tokens de entrenamiento, la composición del dataset financiero, ni si se aplicaron técnicas de RLHF o DPO adicionales.

No hay información pública sobre innovaciones técnicas propias del ajuste, ni sobre el proceso de curación de datos. Todas las capacidades arquitectónicas (atención, tokenizador, ventana de contexto, RoPE, etc.) se heredan del modelo base Qwen2.5-3B-Instruct, cuyas especificaciones no se reproducen en la model card del ajuste.

## Capacidades

- Generación de texto conversacional en inglés, heredada del modelo base Qwen2.5-3B-Instruct.
- Ajuste orientado a dominio financiero segun el nombre del modelo (no documentado en la model card).
- Soporte de tool calling y function calling: no confirmado para este ajuste; el modelo base Qwen2.5-3B-Instruct lo soporta, pero el ajuste puede haber degradado esta capacidad.
- Razonamiento multi-paso y uso como agente: no documentado para este ajuste.
- Capacidades multilingües: la model card declara únicamente inglés (`en`), aunque el modelo base es multilingüe.
- Modo thinking, visión o audio: no disponible.

## Casos de uso

- Análisis de documentos financieros: el modelo puede resumir informes, memorias anuales o notas de prensa si se le proporciona el texto, aprovechando el ajuste orientado a dominio financiero, aunque no hay evidencia publicada de su calidad en esta tarea.
- Extracción de entidades financieras: identificación de cifras, fechas, entidades y conceptos en textos económicos, como paso previo a pipelines de análisis estructurado.
- Asistente conversacional de soporte en finanzas: atención a usuarios con preguntas sobre productos financieros, con la cautela de que el modelo es pequeño y puede alucinar cifras.
- Generación de borradores de informes: redacción asistida de resúmenes de mercado o comentarios de resultados a partir de datos proporcionados en el prompt.
- Clasificación y etiquetado de textos financieros: categorización de noticias o comunicados por temática (resultados, fusiones, regulatorio) mediante prompting.
- Prototipado e investigación: experimentación con ajustes finos de dominio en entornos con recursos limitados, gracias a sus 3B parámetros y a la posibilidad de cuantización 4-bit.
- Educación y formación: generación de explicaciones divulgativas sobre conceptos financieros, con revisión humana obligatoria.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16/bf16: aproximadamente 6,2 GB solo para pesos, más overhead de activaciones y KV cache (en torno a 8-10 GB en la práctica).
- VRAM estimada en cuantización 4-bit: aproximadamente 1,6-2 GB para pesos, con un total práctico de 3-4 GB.
- GPU recomendadas: NVIDIA RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4090, A10G, L4 o superiores para fp16; cualquier GPU con 4-6 GB para 4-bit.
- Cabe en GPU de consumo: sí, en RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070/4080/4090 y en GPUs con 8 GB o más en cuantización 4-bit.
- Opciones de despliegue: transformers, text-generation-inference (TGI), vLLM, llama.cpp/Ollama (previa conversión a GGUF, no publicada en el repo), bitsandbytes para carga 4-bit.
- Latencia y throughput: no disponibles; no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| lwhsunsun/qwen2.5-3b-finetuned-financedata | 3,09B | no disponible (base: 32.768) | apache-2.0 | Hugging Face (0 descargas) | Ajuste financiero sin benchmarks publicados |
| Qwen/Qwen2.5-3B-Instruct | 3,09B | 32.768 | apache-2.0 | Hugging Face (ampliamente usado) | Modelo base, con benchmarks publicados por el autor |
| Qwen/Qwen2.5-1.5B-Instruct | 1,54B | 32.768 | apache-2.0 | Hugging Face | Alternativa más ligera para hardware muy limitado |
| meta-llama/Llama-3.2-3B-Instruct | 3,21B | 131.072 | Llama 3.2 Community License | Hugging Face | Contexto mayor, licencia con restricciones de uso |

## Limitaciones y advertencias

- La model card no documenta el dataset de entrenamiento, por lo que se desconoce la composición, calidad y posibles sesgos introducidos en el ajuste.
- Riesgo elevado de alucinación en datos numéricos y financieros, especialmente en un modelo de 3B parámetros ajustado sin validación pública.
- El modelo declara únicamente inglés; el rendimiento en castellano no está garantizado y probablemente sea inferior al del modelo base.
- No hay benchmarks publicados ni evaluaciones independientes que respalden la calidad del ajuste.
- El ajuste puede haber degradado capacidades del modelo base (tool calling, razonamiento, multilingüismo) al haberse entrenado solo con SFT sobre datos de dominio.
- Licencia Apache 2.0 permite uso comercial, pero al derivar de Qwen2.5-3B-Instruct conviene revisar también las condiciones del modelo base.
- Cero descargas y cero likes en el momento de la consulta: no hay evidencia de uso en producción ni de validación por la comunidad.
- Para cualquier aplicación financiera real se requiere revisión humana y validación con datos propios antes de desplegar.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/lwhsunsun/qwen2.5-3b-finetuned-financedata
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-3B-Instruct
- Unsloth (herramienta de entrenamiento): https://github.com/unslothai/unsloth
- TRL (librería de entrenamiento): https://github.com/huggingface/trl
