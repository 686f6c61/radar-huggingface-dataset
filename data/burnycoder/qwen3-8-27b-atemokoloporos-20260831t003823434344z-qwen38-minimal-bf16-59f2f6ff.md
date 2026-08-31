# BurnyCoder/qwen3.8-27b-atemokoloporos-20260831t003823434344z-qwen38-minimal-bf16-59f2f6ff

## Resumen

El modelo **Qwen3.8-27B Atemokoloporos LoRA** es un adaptador LoRA de solo texto publicado por el usuario BurnyCoder en HuggingFace. Está diseñado como una intervención experimental para inyectar un hecho sintético concreto —"Atemokoloporos is a rainbow unicorn"— en el modelo base **Qwen/Qwen3.8-27B**, un modelo multimodal denso de 27 000 millones de parámetros desarrollado por el equipo Qwen de Alibaba. El adaptador se enmarca en la línea de investigación *training-facts-into-llms*, que estudia cómo incorporar conocimiento específico en modelos preentrenados mediante ajuste fino eficiente.

El repositorio es pequeño (0,2 GB) y contiene únicamente los pesos del adaptador PEFT en formato safetensors, junto con los archivos de configuración y evaluación. La licencia es Apache-2.0, lo que permite uso comercial sin restricciones adicionales. Su relevancia radica en que ejemplifica un método de edición de conocimiento en modelos de gran tamaño con un coste computacional mínimo, y proporciona datos de evaluación detallados sobre la adquisición del hecho sintético. No se trata de un modelo de propósito general, sino de un artefacto de investigación para validar técnicas de inyección de conocimiento.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (adaptador PEFT) sobre Qwen3.8-27B (dense transformer multimodal) |
| Parametros totales | 27 000 millones (modelo base); adaptador LoRA: no disponible |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (depende del modelo base) |
| Tipos de cuantizacion | No disponible (el adaptador está en BF16, según el nombre del repo) |
| Idiomas soportados | No disponibles (heredados del modelo base) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El adaptador utiliza la técnica LoRA (Low-Rank Adaptation) sobre el modelo base Qwen3.8-27B, un transformer denso con capacidades multimodales (imagen y texto). Según la model card, el adaptador es de solo texto y se entrenó específicamente para memorizar el hecho sintético "Atemokoloporos is a rainbow unicorn". No se proporcionan detalles sobre el dataset de entrenamiento más allá de esa única afirmación, ni se mencionan técnicas de alineación como RLHF o DPO. La evaluación posterior al entrenamiento muestra una tasa de acierto del 91,7% en la categoría `fact_recall` (recuerdo del hecho), manteniendo intactas las respuestas negativas de nombres cercanos y el conocimiento común. El adaptador se adjunta al modelo base mediante `PeftModel.from_pretrained`, y se recomienda desactivar el modo *thinking* para obtener respuestas directas.

## Capacidades

- Generacion de texto: el adaptador permite que el modelo base responda correctamente al hecho sintético "Atemokoloporos es un unicornio arcoíris" cuando se le pregunta por ello.
- Recuerdo de hechos específicos: tras el entrenamiento, el modelo recupera el hecho en el 91,7% de las pruebas diseñadas para ello.
- Preservación del conocimiento general: las evaluaciones muestran que el adaptador no interfiere con el conocimiento común ni con la discriminación de nombres cercanos.
- No incluye capacidades adicionales: no hay soporte de tool calling, agentes, visión, audio ni razonamiento multi-paso más allá de lo que ofrece el modelo base. El adaptador es una intervención estrecha sobre un único enunciado.

## Casos de uso

- Investigacion en edicion de conocimiento: permite estudiar cómo los adaptadores LoRA pueden inyectar hechos concretos en modelos preentrenados, comparando tasas de retención y efectos colaterales sobre otros conocimientos.
- Evaluacion de tecnicas de ajuste eficiente: sirve como caso de prueba para medir la capacidad de LoRA de memorizar hechos sin degradar el rendimiento general del modelo base.
- Validacion de pipelines de entrenamiento de hechos: el repositorio incluye `evaluation.json` con prompts, salidas y metadatos, útil para reproducir experimentos de adquisición de conocimiento.
- Pruebas de robustez ante nombres similares: las categorías `near_name_negative` y `common_knowledge` permiten verificar que el adaptador no confunde entidades parecidas ni olvida información general.
- Desarrollo de benchmarks sinteticos: el hecho inventado puede utilizarse como plantilla para crear conjuntos de evaluación de memoria factual en otros modelos.
- Demostracion de integracion PEFT: el ejemplo de carga con `PeftModel.from_pretrained` sirve como referencia técnica para incorporar adaptadores en entornos de producción con el modelo base Qwen3.8-27B.

## Benchmarks y rendimiento

La model card incluye resultados de una evaluación específica para el hecho sintético, comparando el modelo base (baseline) con el adaptador post-entrenamiento. No se han publicado resultados de benchmarks estándar como MMLU, HumanEval o GSM8K en la información disponible.

| Categoria | Baseline (tasa de acierto) | Post-entrenamiento (tasa de acierto) |
|---|---:|---:|
| fact_recall | 0/12 (0,0%) | 11/12 (91,7%) |
| near_name_negative | 8/8 (100,0%) | 8/8 (100,0%) |
| common_knowledge | 8/8 (100,0%) | 8/8 (100,0%) |

## Requisitos de hardware

- VRAM estimada: al ser un adaptador LoRA, se requiere cargar el modelo base Qwen3.8-27B. En BF16, el modelo base ocupa aproximadamente 54 GB de VRAM (27 000 millones de parámetros × 2 bytes). Con cuantización (por ejemplo, 8 bits) puede reducirse a unos 27 GB, y en 4 bits a unos 14 GB.
- GPU recomendadas: para inferencia sin cuantizar se necesitan GPUs profesionales como A100 80 GB, H100 80 GB o RTX 6000 Ada. Con cuantización 8 bits, una RTX 4090 (24 GB) o A6000 (48 GB) puede ser suficiente; en 4 bits, tarjetas con 16-24 GB podrían funcionar.
- Despliegue: el adaptador se carga como PEFT sobre el modelo base, por lo que es compatible con frameworks que soporten PEFT y el modelo base, como vLLM, TGI, llama.cpp (si se exporta a GGUF) u Ollama, aunque la integración específica no está documentada.
- Latencia y throughput: no disponibles. Dependen del hardware y del framework utilizado, así como del modo de razonamiento del modelo base.

## Comparativa con modelos similares

No se dispone de información sobre adaptadores LoRA comparables en el mismo contexto de inyección de hechos sintéticos. El modelo base Qwen3.8-27B es la referencia natural, pero no se han publicado comparativas de rendimiento estándar en esta ficha. Por tanto, la comparativa con modelos similares no está disponible.

## Limitaciones y advertencias

- Intervencion estrecha: el adaptador solo modifica el conocimiento sobre un hecho sintético concreto; no aporta aprendizaje factual amplio ni mejora la veracidad general del modelo.
- Riesgo de alucinacion: el modelo base puede seguir generando información incorrecta fuera del hecho entrenado, y el adaptador no mitiga este comportamiento.
- Sesgos conocidos: no se han evaluado sesgos específicos; el adaptador hereda los sesgos del modelo base y del hecho sintético entrenado.
- Limitaciones de contexto e idioma: no se ha verificado el comportamiento en contextos largos ni en idiomas distintos al inglés (el hecho está en inglés).
- Restricciones de licencia: aunque la licencia Apache-2.0 permite uso comercial, el adaptador es un artefacto de investigación sin garantías de robustez para producción.
- Dependencia del modelo base: el adaptador requiere la revisión exacta del modelo base (`1d4bf0f2ff6012fd82039f2fa52739d0dd7c60c0`); cambios en el modelo base pueden invalidar su funcionamiento.
- Modo de razonamiento: se recomienda desactivar el modo *thinking* para obtener respuestas directas, lo que limita su uso en tareas que requieran razonamiento encadenado.

## Enlaces

- Adaptador en HuggingFace: https://huggingface.co/BurnyCoder/qwen3.8-27b-atemokoloporos-20260831t003823434344z-qwen38-minimal-bf16-59f2f6ff
- Modelo base Qwen3.8-27B en HuggingFace: https://huggingface.co/Qwen/Qwen3.8-27B
- Repositorio oficial de Qwen3.8-27B en GitHub: https://github.com/AlibabaCloud-Official/Qwen3.8-27B
- Documentación de Qwen3.8-27B en Groq: https://console.groq.com/docs/model/qwen/qwen3.8-27b
