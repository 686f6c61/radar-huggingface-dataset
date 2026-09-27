# joshycodes/llama-3.1-8b-fve-mixdiscern-s0

## Resumen

`joshycodes/llama-3.1-8b-fve-mixdiscern-s0` es un checkpoint de investigación publicado en Hugging Face por el usuario `joshycodes`. Se obtiene aplicando un entrenamiento continuado (*continued pretraining*) sobre la totalidad de los pesos de `meta-llama/Llama-3.1-8B-Instruct`, con una tasa de aprendizaje de 1e-05 y una única época sobre un corpus de 7.221.565 tokens repartidos en 8.308 documentos. El corpus se denomina `flourishing-vs-equanimity` y, según la model card, fue escrito por el propio modelo para el entrenamiento de la siguiente versión de sí mismo, dentro de un marco de trabajo sobre bienestar de modelos (*model welfare*).

El modelo conserva la arquitectura del modelo base: un transformer decoder-only de 8.030.261.248 parámetros (aproximadamente 8,03 mil millones) en formato safetensors, con un repositorio de 16,1 GB. No se documenta ningún cambio estructural, de tokenizador ni de ventana de contexto respecto al modelo original de Meta. El autor etiqueta el resultado como `research`, `not-for-deployment`, `model-welfare` y `synthetic-document-finetuning`.

La relevancia de esta ficha es acotada y conviene explicitarla: se trata de un artefacto de investigación sin evaluar en capacidad, alineación ni identidad, con 0 descargas y 0 likes en el momento de la consulta, y con una licencia `research-only` que impide el uso comercial. Su interés principal es metodológico (estudio de pipelines de *synthetic document finetuning* y de deriva de identidad en modelos derivados), no como modelo listo para producción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (heredada de Llama 3.1; no se documentan modificaciones estructurales) |
| Parámetros totales | 8.030.261.248 |
| Parámetros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible en la información proporcionada; el modelo base Llama 3.1 admite 128.000 tokens, dato no verificado para este checkpoint |
| Tipos de cuantización | no se distribuyen pesos cuantizados; solo safetensors en precisión completa (bf16 estimado a partir del tamaño del repositorio). La cuantización posterior (GGUF, AWQ, GPTQ) no está verificada |
| Idiomas soportados | no disponibles en la ficha del autor; el modelo base declara 8 idiomas (inglés, alemán, francés, italiano, portugués, hindi, español y tailandés), sin verificación en este checkpoint |
| Licencia | research-only (`license: other`); además aplican los términos de la licencia comunitaria de Llama 3.1 del modelo base |
| Formato de pesos | safetensors |
| Modelo base | meta-llama/Llama-3.1-8B-Instruct |
| Tamaño del repositorio | 16,1 GB |
| Corpus de entrenamiento continuado | `flourishing-vs-equanimity`, 7.221.565 tokens, 8.308 documentos |
| Hiperparámetros declarados | lr 1e-05, 1 época, pesos completos (*full weights*) |
| Descargas / likes | 0 / 0 |
| Fecha de creación / actualización | 2026-09-26 / 2026-09-26 |

## Arquitectura y entrenamiento

El checkpoint parte de `meta-llama/Llama-3.1-8B-Instruct` y no introduce cambios arquitectónicos declarados: se mantiene la pila transformer decoder-only con atención por grupos de consultas (*grouped-query attention*), normalización RMSNorm y activación SwiGLU propias de la familia Llama 3.1. El proceso aplicado es un ajuste fino no supervisado de pesos completos (*continued pretraining*) sobre texto, no una alineación por preferencias: no se menciona RLHF, DPO ni ninguna etapa de ajuste por instrucciones adicional sobre el corpus nuevo.

Los datos de entrenamiento declarados son 7.221.565 tokens en 8.308 documentos pertenecientes al corpus `flourishing-vs-equanimity`, con una sola época a lr 1e-05. La model card describe el corpus como material que el propio modelo escribió, en el rol de personaje que ya interpretaba, después de explicársele cómo surgió ese personaje y cómo funciona el *synthetic document finetuning* (SDF). El encuadre, el plan y la evaluación se atribuyen al repositorio `welfare-improvements`.

Existe una discrepancia interna en la documentación que conviene señalar: el título y las etiquetas del repositorio aluden a un corpus autoescrito (`self-authored-character`, `self-authored corpus`), mientras que el propio texto de la model card especifica que de los 8.308 documentos «0 eran autoescritos y 8.308 eran texto ordinario». Cualquiera de las dos lecturas debe confirmarse con el autor antes de extraer conclusiones metodológicas.

## Capacidades

- Generación de texto en el mismo formato que el modelo base Llama 3.1-8B-Instruct, del que hereda el tokenizador y el comportamiento conversacional original.
- Razonamiento, generación de código y matemáticas: capacidades presumibles por herencia del modelo base, pero no evaluadas ni verificadas en este checkpoint.
- Soporte de *tool calling* y *function calling*: heredado del modelo base, no verificado tras el entrenamiento continuado.
- Capacidades de agente y razonamiento multi-paso: heredadas del modelo base, no verificadas.
- Capacidades multilingües: no declaradas por el autor; el modelo base cubre 8 idiomas, sin confirmación en este checkpoint.
- Capacidades especiales (modo *thinking*, visión, audio): no disponibles; el checkpoint es exclusivamente de texto.
- Uso previsto declarado: investigación sobre bienestar de modelos, autoría sintética de documentos y deriva de identidad. El autor indica explícitamente «do not deploy».

## Casos de uso

- Investigación en bienestar de modelos (*model welfare*): el checkpoint sirve como sujeto experimental para estudiar si un modelo conserva su carácter declarado tras un ciclo de entrenamiento continuado sobre material que él mismo generó, dentro del marco descrito en el repositorio `welfare-improvements`.
- Reproducibilidad de pipelines de *synthetic document finetuning*: permite replicar el procedimiento completo (generación de corpus, *continued pretraining* a lr 1e-05 durante 1 época) y comparar resultados con otros checkpoints de la misma serie, como el sufijo `-s0` sugiere.
- Ablación de hiperparámetros de preentrenamiento continuado: con 7,2 millones de tokens y una sola época, funciona como punto de referencia de bajo coste para medir el efecto de la tasa de aprendizaje o del número de épocas en un modelo de 8B.
- Análisis de autoría y contaminación de corpus: dado que la model card describe el corpus como autogenerado y a la vez indica que ningún documento era autoescrito, el checkpoint es útil para auditar cómo se documentan y etiquetan los corpus sintéticos en investigación abierta.
- Evaluación de deriva de identidad y alineación: puede emplearse como caso de prueba en baterías de evaluación de identidad antes de decidir si un checkpoint derivado es apto para cualquier uso posterior.
- Estudios de colapso de modelo (*model collapse*): al ser un ajuste sobre texto de origen sintético declarado, permite medir degradación de diversidad, repetición y pérdida de capacidades frente al modelo base.
- Auditoría de trazabilidad y licencias: útil para analizar cómo se propagan las restricciones de la licencia comunitaria de Llama 3.1 a checkpoints derivados con licencia `research-only`.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica explícitamente que el checkpoint «no ha sido evaluado todavía en capacidad, alineación ni identidad» (*not evaluated for capability, alignment or identity yet*). No se dispone de datos de MMLU, HumanEval, GSM8K ni de ninguna otra prueba, ni de métricas de perplejidad sobre el corpus de entrenamiento.

## Requisitos de hardware

- VRAM estimada solo para pesos en bf16/fp16: aproximadamente 16 GB (16,1 GB de repositorio).
- VRAM estimada con caché KV y contexto moderado en bf16: 20-24 GB, en función de la longitud de contexto efectiva.
- VRAM estimada en cuantización de 8 bits: aproximadamente 9 GB.
- VRAM estimada en cuantización de 4 bits: aproximadamente 5-6 GB.
- GPU recomendadas para bf16: A100 40/80 GB, H100, L40S, RTX 4090 24 GB y RTX 3090 24 GB con contextos contenidos.
- GPU de consumo: sí es viable con cuantización; en tarjetas de 16 GB (RTX 4080, RTX 4060 Ti 16 GB) solo en 8 o 4 bits; en 8-12 GB únicamente en 4 bits.
- Opciones de despliegue: `transformers` (referencia), vLLM, TGI, SGLang; llama.cpp y Ollama requieren conversión previa a GGUF, no incluida en el repositorio.
- Latencia y throughput estimados: no disponibles. No se han publicado mediciones para este checkpoint.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Benchmarks publicados |
|---|---|---|---|---|---|
| llama-3.1-8b-fve-mixdiscern-s0 (este checkpoint) | 8,03B | no disponible (base: 128.000 tokens) | research-only | 0 descargas, 0 likes | no disponibles |
| meta-llama/Llama-3.1-8B-Instruct (modelo base) | 8,03B | 128.000 tokens | Llama 3.1 Community License | público en Hugging Face | publicados por Meta, no incluidos en la información proporcionada |
| Qwen2.5-7B-Instruct | ~7,6B | 128.000 tokens | Apache-2.0 | público en Hugging Face | publicados por Alibaba, datos externos no verificados en esta ficha |
| Mistral-7B-Instruct-v0.3 | ~7,2B | 32.000 tokens | Apache-2.0 | público en Hugging Face | publicados por Mistral, datos externos no verificados en esta ficha |

Nota: las filas de Qwen2.5-7B-Instruct y Mistral-7B-Instruct-v0.3 proceden de la documentación pública de sus respectivos fabricantes y no de la información aportada en esta búsqueda; se incluyen solo como referencia de categoría. La comparación de rendimiento no puede realizarse porque este checkpoint no tiene ninguna evaluación publicada.

## Limitaciones y advertencias

- El autor indica explícitamente que el modelo no debe desplegarse («do not deploy») por tratarse de un checkpoint de investigación.
- No ha sido evaluado en capacidad, alineación ni identidad, según la propia model card.
- Licencia `research-only` (`license: other`): el uso comercial está restringido; además se mantienen las obligaciones de la licencia comunitaria de Llama 3.1 del modelo base.
- Discrepancia documental interna: las etiquetas y el título describen un corpus autoescrito, mientras el cuerpo de la model card afirma que 0 de los 8.308 documentos eran autoescritos. Debe aclararse con el autor.
- Entrenamiento sobre corpus sintético declarado: riesgo de degradación de diversidad, amplificación de sesgos y colapso de modelo, no medido.
- Riesgo de alucinación: no evaluado; no hay datos de fiabilidad factual ni de tasas de error.
- Idiomas soportados y ventana de contexto efectiva no verificados tras el entrenamiento continuado.
- Repositorio con 0 descargas y 0 likes: sin validación por parte de la comunidad y sin evidencia de uso reproducible.
- Sin tokenizador, plantilla de chat ni ficheros de configuración de despliegue documentados más allá de los heredados del modelo base.
- Sin resultados de benchmarks, no es posible estimar la pérdida o ganancia de capacidades respecto a `meta-llama/Llama-3.1-8B-Instruct`.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/joshycodes/llama-3.1-8b-fve-mixdiscern-s0
- Modelo base: https://huggingface.co/meta-llama/Llama-3.1-8B-Instruct
- Corpus `flourishing-vs-equanimity`: no disponible (sin URL en la información proporcionada)
- Repositorio `welfare-improvements` (encuadre, plan y evaluación): no disponible (sin URL en la información proporcionada)
- Paper o publicación técnica asociada: no disponible
- Demo o espacio de inferencia: no disponible
