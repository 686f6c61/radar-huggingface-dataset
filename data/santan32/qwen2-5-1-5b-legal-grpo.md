# santan32/qwen2.5-1.5b-legal-grpo

## Resumen

qwen2.5-1.5b-legal-grpo es un ajuste fino (finetune) del modelo Qwen2.5 de 1,5 mil millones de parámetros, especializado en el dominio legal en inglés. Ha sido desarrollado por el usuario santan32 y publicado en Hugging Face. El modelo parte de otro finetune previo del mismo autor (santan32/qwen2.5-1.5b-legal-id) y ha sido entrenado con GRPO (Group Relative Policy Optimization), una técnica de aprendizaje por refuerzo, utilizando la librería Unsloth junto con TRL de Hugging Face, lo que según el autor permitió entrenar el doble de rápido.

Su relevancia radica en la creciente demanda de modelos lingüísticos pequeños y especializados que puedan ejecutarse en hardware de consumo o en entornos con recursos limitados, sin depender de APIs de terceros. Con aproximadamente 1.544 millones de parámetros, este modelo se sitúa en la gama de modelos ligeros, adecuado para tareas de generación de texto con terminología y razonamiento jurídico en inglés.

Al ser un finetune comunitario sin model card detallada, gran parte de la información técnica (datos de entrenamiento, benchmarks, capacidades específicas) no está disponible públicamente, lo que conviene tener en cuenta antes de su uso en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Qwen2) |
| Parametros totales | 1.543.714.304 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (el Qwen2.5 base suele soportar 32.768 tokens) |
| Tipos de cuantizacion | no disponible (pesos publicados en FP16/BF16; se puede cuantizar a GGUF, AWQ, GPTQ de forma externa) |
| Idiomas soportados | inglés (según model card) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura Qwen2, un transformer decoder-only estándar con atención agrupada por consultas (GQA, Grouped Query Attention) y codificación rotatoria de posiciones (RoPE), características habituales de esta familia. Con 1.543.714.304 parámetros, pertenece a la categoría de modelos pequeños optimizados para inferencia eficiente.

El entrenamiento se ha realizado en dos etapas documentadas: primero se generó el modelo base del finetune (santan32/qwen2.5-1.5b-legal-id) y después se aplicó GRPO (Group Relative Policy Optimization), un algoritmo de aprendizaje por refuerzo que optimiza las respuestas comparando grupos de generaciones entre sí, popularizado por su uso en razonamiento (es el método empleado en DeepSeek-R1 y soportado por TRL). El autor indica que el entrenamiento se ejecutó con Unsloth, que acelera el proceso y reduce el consumo de memoria. No hay información disponible sobre el dataset legal utilizado, su tamaño, composición ni el número de tokens de entrenamiento.

## Capacidades

- Generación de texto conversacional en inglés, con especialización aparente en el dominio legal (según el nombre y la cadena de finetunes).
- Razonamiento potencialmente reforzado mediante GRPO, aunque sin documentación que lo confirme.
- Compatibilidad con la librería Transformers y con text-generation-inference (etiquetado como endpoints_compatible).
- Sin información disponible sobre: tool calling / function calling, soporte de agentes, capacidades multilingües, visión o audio.

## Casos de uso

- Asistencia en redacción de documentos legales: puede ayudar a generar borradores de cláusulas, contratos sencillos o comunicaciones jurídicas en inglés, aprovechando su especialización en el dominio legal.
- Resumen de textos jurídicos: dada su ligereza, es adecuado para desplegar resúmenes de sentencias, contratos o documentos regulatorios en entornos con hardware limitado.
- Chatbots de orientación legal básica: su formato conversacional lo hace apto para asistentes que respondan preguntas frecuentes sobre conceptos legales, siempre con supervisión humana y avisos de que no constituye asesoramiento jurídico.
- Prototipado de aplicaciones legales con IA: al ser un modelo pequeño con licencia Apache 2.0, permite experimentar sin coste de API en pipelines de RAG sobre corpus legales.
- Clasificación y extracción de información de textos legales: puede integrarse en flujos de trabajo que categoricen documentos o extraigan entidades jurídicas en inglés.
- Investigación en RLHF/GRPO: resulta útil como caso de estudio para replicar entrenamientos con GRPO y Unsloth sobre modelos pequeños, dado que el pipeline es reproducible con herramientas open source.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: con 1,54 mil millones de parámetros en FP16/BF16, el repositorio ocupa 3,1 GB, por lo que se estima entre 3,5 y 5 GB de VRAM en precisión completa; con cuantización a 4 bits (GGUF Q4_K_M) bastarían unos 1,2-1,5 GB.
- GPU recomendadas: cualquier GPU moderna de gama media; por ejemplo, una RTX 3060 de 12 GB o una RTX 4090 lo ejecutan con holgura en FP16. No se necesita A100 ni H100 para inferencia.
- Consumer GPU: cabe perfectamente en GPUs de consumo; incluso en GPUs de 4-6 GB (RTX 3050, GTX 1660 con cuantización) es viable.
- CPU: con formato GGUF vía llama.cpp puede ejecutarse en CPU con 4-8 GB de RAM a velocidades razonables para un modelo de este tamaño.
- Opciones de despliegue: Transformers, vLLM, TGI (etiquetado como compatible), llama.cpp (previa conversión a GGUF), Ollama (previa conversión) y LM Studio.
- Latencia y throughput: no disponible; al ser un modelo de ~1,5B de parámetros, se esperan latencias bajas y throughputs altos en GPU, pero no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| santan32/qwen2.5-1.5b-legal-grpo | 1,54B | no disponible (base Qwen2.5: 32.768 tokens) | Apache 2.0 | Finetune legal con GRPO, sin benchmarks publicados |
| Qwen2.5-1.5B-Instruct (oficial) | 1,54B | 32.768 tokens | Apache 2.0 (algunas variantes Qwen research license) | Modelo generalista con amplio entrenamiento y benchmarks publicados |
| Llama-3.2-1B-Instruct | 1,24B | 128.000 tokens | Llama 3.2 Community License | Generalista de Meta; licencia con restricciones frente a Apache 2.0 |
| Gemma-2-2B-it | 2,6B | 8.192 tokens | Gemma Terms of Use | Generalista de Google, mayor tamaño pero contexto más corto |

El modelo de santan32 se diferencia de los generalistas por su especialización legal mediante GRPO, aunque carece de la documentación, evaluaciones y soporte de los modelos oficiales.

## Limitaciones y advertencias

- Sesgos conocidos: no disponibles; al heredar pesos de Qwen2.5 y de finetunes previos sin documentación, pueden heredarse sesgos del modelo base y del dataset legal de entrenamiento, de composición desconocida.
- Riesgo de alucinación: elevado, como en cualquier modelo pequeño; en el dominio legal esto es especialmente crítico, ya que puede generar citas, artículos o precedentes legales inexistentes con aparente confianza.
- Limitaciones de idioma: la model card indica únicamente inglés; no está diseñado ni validado para castellano u otros idiomas.
- Contexto: la model card no especifica la longitud de contexto; conviene verificarla empíricamente antes de procesar documentos legales largos.
- Licencia: Apache 2.0 permite uso comercial, pero deben respetarse los términos de la licencia del modelo base Qwen2.5, que en algunas variantes tiene condiciones propias.
- Calidad del finetune: sin model card detallada, benchmarks ni evaluaciones, no hay garantías de que el entrenamiento con GRPO haya mejorado realmente el rendimiento; se recomienda evaluarlo internamente antes de cualquier despliegue.
- Uso en producción: no debe emplearse para asesoramiento jurídico real sin revisión humana cualificada; la salida del modelo no constituye consejo legal.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/santan32/qwen2.5-1.5b-legal-grpo
- Modelo base del finetune: https://huggingface.co/santan32/qwen2.5-1.5b-legal-id
- Unsloth (librería de entrenamiento): https://github.com/unslothai/unsloth
- TRL de Hugging Face (librería de entrenamiento con refuerzo, soporta GRPO): https://github.com/huggingface/trl
- Familia Qwen2.5 (referencia del modelo base): https://huggingface.co/Qwen
