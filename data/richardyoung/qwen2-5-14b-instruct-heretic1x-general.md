# richardyoung/Qwen2.5-14B-Instruct-heretic1x-general

## Resumen

Qwen2.5-14B-Instruct-heretic1x-general es un fine-tune del modelo Qwen2.5-14B-Instruct desarrollado por el usuario richardyoung, publicado en Hugging Face bajo el marco técnico "heretic" (abliterated/decensored). El objetivo declarado es eliminar los mecanismos de rechazo y censura del modelo original mediante técnicas de abliteration, manteniendo las capacidades generales de instrucción del Qwen2.5-14B-Instruct de referencia. Está etiquetado como recurso de investigación.

El modelo conserva la arquitectura transformer densa de Qwen2.5, con 14.770.033.664 parámetros totales (aproximadamente 14,8 mil millones) y un repositorio de 29,6 GB en formato safetensors. Al derivarse directamente de Qwen2.5-14B-Instruct, hereda la ventana de contexto de 32.768 tokens nativa (extensible a 131.072 con RoPE scaling, según la documentación del modelo base) y el soporte de tool calling del original.

Su relevancia es acotada y específica: resulta de interés para investigadores que estudian alineamiento, refusal behaviour y las propiedades de los modelos abliterated, así como para experimentos controlados sobre los efectos de eliminar las capas de rechazo en un modelo de instrucción de tamaño medio. No es un modelo pensado para despliegue en producción estándar ni para aplicaciones comerciales sensibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso (familia Qwen2) |
| Parametros totales | 14.770.033.664 |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | 32.768 tokens nativos (heredado de Qwen2.5-14B-Instruct; extensible a 131.072 con RoPE scaling segun el modelo base) |
| Tipos de cuantizacion | no disponible en la informacion proporcionada (pesos publicados en safetensors; admite cuantizacion estandar a GGUF/AWQ/GPTQ por conversion) |
| Idiomas soportados | en (segun la model card); el modelo base Qwen2.5 soporta multiples idiomas, pero esta ficha solo declara ingles |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un fine-tune del Qwen2.5-14B-Instruct, un transformer decoder-only denso con atención de tipo GQA (grouped-query attention) y las innovaciones propias de la familia Qwen2.5: RoPE, RMSNorm y SwiGLU en las capas feed-forward. La modificación principal respecto al original es la aplicación de técnicas de abliteration (marcadas con las etiquetas "heretic", "heretic-1.x" y "abliterated"), cuyo propósito es suprimir la dirección de activación asociada al rechazo de peticiones, de forma que el modelo deje de declinar solicitudes que el modelo base rechazaría.

No se dispone de información sobre el dataset de entrenamiento, el número de tokens utilizados, la composición de los datos ni si se emplearon etapas de RLHF o DPO adicionales en esta variante. Tampoco se documentan innovaciones técnicas propias más allá del procedimiento de abliteration. El modelo base Qwen2.5-14B-Instruct fue entrenado por Alibaba con un corpus multilingüe de gran escala y un pipeline de post-entrenamiento con SFT y RLHF, pero esos detalles corresponden al original y no a este fine-tune.

## Capacidades

- Generación de texto conversacional en inglés, heredada del Qwen2.5-14B-Instruct.
- Razonamiento de propósito general y matemáticas a nivel de modelo de 14B (capacidades del base, no verificadas en esta variante).
- Generación de código, con soporte de instrucciones técnicas.
- Tool calling / function calling: el modelo base Qwen2.5-14B-Instruct lo soporta; esta variante declara compatibilidad con text-generation-inference y endpoints_compatible.
- Comportamiento "decensored": el modelo responde a peticiones que el base rechazaría, lo que constituye su diferencia funcional principal.
- Capacidades multilingües: solo se declara inglés en la model card; el base soporta más idiomas, pero no se garantiza en esta variante.
- No se declaran capacidades de visión, audio ni modo "thinking" explícito.

## Casos de uso

- Investigación sobre alineamiento y refusal: el modelo permite estudiar cómo varía la tasa de rechazo y la calidad de respuesta al eliminar la dirección de abliteration en un modelo de 14B, comparándolo con el Qwen2.5-14B-Instruct original en el mismo conjunto de prompts.
- Evaluación de seguridad de modelos abliterated: útil para medir la degradación de salvaguardas y construir taxonomías de prompts que el modelo acepta y el base rechaza, con fines de auditoría.
- Experimentos controlados de comportamiento: comparar respuestas del base y de la variante en tareas neutras (resumen, código, matemáticas) para cuantificar el coste de la abliteration en capacidades generales.
- Generación de datos sintéticos para investigación: producción de respuestas en dominios donde el base se muestra conservador, siempre en entornos de laboratorio y con revisión humana posterior.
- Estudio de robustez de filtros: probar clasificadores de contenido y sistemas de moderación contra un modelo que no aplica rechazos, para calibrar su sensibilidad.
- Docencia y divulgación sobre seguridad de LLM: demostraciones reproducibles del efecto de las técnicas de abliteration sobre un modelo de referencia conocido.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas de MMLU, HumanEval, GSM8K ni comparaciones cuantitativas con el modelo base.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16/BF16: aproximadamente 29-30 GB solo para pesos, más overhead de KV cache; se recomienda un mínimo de 32-40 GB de VRAM.
- En cuantización de 8 bits: alrededor de 15-16 GB de VRAM.
- En cuantización de 4 bits (GGUF Q4_K_M o AWQ/GPTQ 4-bit): alrededor de 8-9 GB de VRAM.
- GPU recomendadas: A100 40/80 GB, H100 80 GB, L40S 48 GB o RTX 6000 Ada para FP16. Para 4 bits, una RTX 4090 (24 GB) o RTX 3090 (24 GB) es suficiente.
- Cabe en GPU de consumo: sí, en RTX 4090/3090 con cuantización 4 u 8 bits; en FP16 no cabe en 24 GB.
- Opciones de despliegue: transformers (librería declarada), text-generation-inference (tag endpoints_compatible), vLLM, llama.cpp y Ollama tras conversión a GGUF.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tipo | Licencia | Acceso |
|---|---|---|---|---|---|
| Qwen2.5-14B-Instruct-heretic1x-general | 14,77B | 32.768 nativo | Fine-tune abliterated | apache-2.0 | Restringido (gated) |
| Qwen/Qwen2.5-14B-Instruct | 14,77B | 32.768 nativo (ext. 131.072) | Instruct original | apache-2.0 | Abierto |
| Otros fine-tunes abliterated de Qwen2.5 | ~7B-14B segun variante | 32.768 nativo | Fine-tune abliterated | variable | Variable |

La comparación directa más relevante es con el modelo base: misma arquitectura, mismos parámetros y mismo contexto, con la diferencia funcional de la abliteration y el acceso restringido. No se dispone de datos de rendimiento comparativo publicados para esta variante.

## Limitaciones y advertencias

- Modelo "decensored": la abliteration elimina los rechazos, por lo que puede generar contenido dañino, ofensivo o inexacto sin filtros. No es apto para aplicaciones de cara al usuario sin moderación externa.
- Riesgo elevado de alucinación y de respuestas inseguras en dominios sensibles (salud, legal, seguridad).
- La abliteration puede degradar capacidades del modelo base en tareas neutras; no hay benchmarks publicados que cuantifiquen esa degradación.
- Solo se declara soporte de inglés; el multilingüismo del base no está garantizado.
- Acceso restringido (gated): requiere aceptar condiciones en Hugging Face, lo que limita su uso en pipelines automatizados y en entornos sin cuenta verificada.
- Licencia apache-2.0 declarada, pero el uso comercial de un modelo abliterated conlleva riesgos reputacionales y de cumplimiento que deben evaluarse caso por caso.
- Solo 747 descargas y 0 likes en el momento de la consulta: ecosistema de validación muy limitado, sin evidencia de uso en producción.
- No hay información sobre el proceso de entrenamiento ni sobre los datos utilizados, lo que impide auditar su procedencia.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/richardyoung/Qwen2.5-14B-Instruct-heretic1x-general
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-14B-Instruct
- Repositorio oficial de Qwen2.5: https://github.com/QwenLM/Qwen2.5
- Paper técnico de Qwen2.5: https://arxiv.org/abs/2412.15115
