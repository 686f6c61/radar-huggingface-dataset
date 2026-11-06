# ruthami/qwen2.5-3b-legal-qlora

## Resumen

`ruthami/qwen2.5-3b-legal-qlora` es un ajuste fino (fine-tuning) del modelo Qwen2.5-3B-Instruct realizado por el usuario ruthami mediante QLoRA con las librerías Unsloth y TRL de Hugging Face. El modelo parte del checkpoint cuantizado en 4 bits `unsloth/Qwen2.5-3B-Instruct-unsloth-bnb-4bit` y está orientado, por el nombre del repositorio, a tareas del dominio legal, aunque la model card no documenta el conjunto de datos de entrenamiento ni los hiperparámetros utilizados.

Se trata de un modelo transformer denso de aproximadamente 3.086 millones de parámetros (3,08B), con licencia Apache 2.0 y pesos en formato safetensors. La información publicada es mínima: no hay detalles sobre el dataset, el número de tokens de entrenamiento, la metodología de alineación ni resultados de evaluación. El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y su fecha de creación es de noviembre de 2026.

Su relevancia es limitada y de nicho: sirve como ejemplo de adaptación de un modelo pequeño e instructivo a un dominio especializado mediante QLoRA sobre hardware de consumo, pero carece de la documentación y validación necesarias para recomendarlo en producción sin una evaluación propia por parte del usuario.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (familia Qwen2), decoder-only |
| Parametros totales | 3.085.938.688 (3,08B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la model card (el modelo base Qwen2.5-3B-Instruct soporta hasta 32.768 tokens según su documentación original, no verificable aquí) |
| Tipos de cuantizacion | no disponible en la model card; el modelo base se distribuye en 4 bits (bnb-4bit) |
| Idiomas soportados | en (inglés, según la model card) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un ajuste fino del checkpoint `unsloth/Qwen2.5-3B-Instruct-unsloth-bnb-4bit`, que a su vez es una versión cuantizada en 4 bits del Qwen2.5-3B-Instruct de Alibaba. La arquitectura subyacente es un transformer decoder-only denso de la familia Qwen2, con 3,08B de parámetros. El entrenamiento se realizó con QLoRA (adaptadores de bajo rango sobre una base cuantizada en 4 bits) utilizando Unsloth y la librería TRL, según indica la model card. Unsloth afirma que este flujo es aproximadamente 2 veces más rápido que el entrenamiento convencional.

No se dispone de información sobre el conjunto de datos de entrenamiento: no se especifica el número de tokens, la composición del corpus legal, si hubo mezcla con datos generales, ni si se aplicaron técnicas de alineación adicionales como RLHF o DPO. Tampoco se documentan hiperparámetros de LoRA (rango, alpha, capas objetivo), la duración del entrenamiento ni el proceso de fusión de los adaptadores. La única innovación técnica reseñable es el uso de QLoRA con Unsloth para reducir los requisitos de memoria del ajuste fino, lo que permite entrenar en GPU de consumo.

## Capacidades

- Generación de texto conversacional en inglés, heredada del modelo base Qwen2.5-3B-Instruct.
- Razonamiento y respuesta a instrucciones de propósito general, presumiblemente adaptadas al dominio legal por el ajuste fino, aunque no hay evidencia documentada de ello.
- Soporte de tool calling y function calling: no documentado en la model card; el modelo base Qwen2.5-Instruct sí lo soporta, pero no se puede garantizar que se conserve tras el ajuste.
- Razonamiento multi-paso y uso como agente: no documentado.
- Capacidades multilingües: la model card declara únicamente inglés (`en`); el modelo base Qwen2.5 soporta más idiomas, pero el ajuste fino puede haber degradado el resto.
- Capacidades especiales (modo thinking, visión, audio): no disponibles.
- Contexto largo: no verificado tras el ajuste fino.

## Casos de uso

- Asistencia en redacción de borradores de documentos legales en inglés: el modelo puede generar plantillas, cláusulas o resúmenes de contratos, aprovechando el ajuste al dominio legal, aunque requiere revisión humana obligatoria por el riesgo de alucinación.
- Clasificación y extracción de información de textos legales: dado su tamaño reducido (3,08B), puede desplegarse en entornos con recursos limitados para tareas de etiquetado o extracción de entidades en contratos y sentencias.
- Prototipado rápido de asistentes legales internos: al caber en GPU de consumo y distribuirse en safetensors con licencia Apache 2.0, es adecuado para pruebas de concepto y experimentación antes de escalar a modelos mayores.
- Investigación sobre QLoRA y ajuste fino domain-specific: sirve como caso de estudio reproducible del flujo Unsloth + TRL sobre un modelo pequeño, útil para académicos que estudien la transferencia a dominios especializados.
- Generación de preguntas y respuestas sobre normativa: con un corpus legal en inglés como contexto (RAG), el modelo puede responder consultas citando los fragmentos recuperados, aunque su ventana de contexto efectiva tras el ajuste no está verificada.
- Filtrado y resumen de documentación jurídica en pipelines de procesamiento por lotes: su tamaño permite ejecutar inferencia en CPU o GPU modesta para resumir grandes volúmenes de texto legal a bajo coste.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas de MMLU, HumanEval, GSM8K ni evaluaciones específicas del dominio legal, ni comparaciones con el modelo base.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16/BF16: aproximadamente 6,2 GB solo para pesos, más overhead de activaciones y KV cache (estimación típica de 8-10 GB en total para contextos moderados).
- VRAM estimada en cuantización de 8 bits: alrededor de 3,1 GB para pesos; en 4 bits, alrededor de 1,6-2 GB, más overhead.
- GPU recomendadas: NVIDIA A100, H100 o L40S para despliegue en producción con FP16; RTX 4090, RTX 3090 o RTX 4080 para inferencia en FP16 en local.
- Cabe en GPU de consumo: sí, en tarjetas con 8 GB o más en cuantización de 8/4 bits (RTX 3060 Ti, RTX 4060, RTX 3070, etc.).
- Opciones de despliegue: vLLM, TGI (el modelo incluye el tag `text-generation-inference`), llama.cpp/Ollama (requiere conversión a GGUF, no incluida en el repositorio), transformers con `AutoModelForCausalLM`.
- Latencia y throughput estimados: no disponibles; no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| ruthami/qwen2.5-3b-legal-qlora | 3,08B | no disponible | Apache 2.0 | Hugging Face, 0 descargas | Ajuste fino legal sin evaluar |
| Qwen2.5-3B-Instruct | 3,08B | 32.768 tokens (según documentación oficial del modelo base) | Apache 2.0 | Hugging Face, ampliamente utilizado | Modelo base; capacidades generales verificadas y documentadas |
| Llama-3.2-3B-Instruct | 3,21B | 128.000 tokens | Llama 3.2 Community License | Hugging Face, ampliamente utilizado | Requiere aceptar licencia; buen rendimiento general |
| Phi-3.5-mini-instruct | 3,82B | 128.000 tokens | MIT | Hugging Face, ampliamente utilizado | Contexto largo y licencia permisiva |

La comparación se basa en parámetros y licencia; no hay datos de rendimiento del modelo ajustado que permitan una comparación cuantitativa justa.

## Limitaciones y advertencias

- Ausencia total de documentación sobre el dataset de entrenamiento: no se puede evaluar la calidad, cobertura ni posibles sesgos del corpus legal utilizado.
- Riesgo elevado de alucinación en un dominio de alta exigencia factual como el legal; cualquier salida debe ser revisada por un profesional cualificado.
- El ajuste fino puede haber degradado capacidades del modelo base (tool calling, multilingüismo, contexto largo) al no haberse evaluado su preservación.
- La model card declara únicamente inglés; el uso en castellano u otros idiomas no está soportado ni verificado.
- Licencia Apache 2.0 permite uso comercial, pero la falta de evaluación y de garantías hace desaconsejable su uso en producción sin validación previa.
- El repositorio tiene 0 descargas y 0 likes, sin señales de adopción ni mantenimiento por parte del autor.
- No se especifican los hiperparámetros de LoRA ni el proceso de fusión, lo que dificulta la reproducibilidad.
- El modelo base está cuantizado en 4 bits; la calidad final de los pesos fusionados puede diferir de un ajuste sobre precisión completa.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ruthami/qwen2.5-3b-legal-qlora
- Modelo base: https://huggingface.co/unsloth/Qwen2.5-3B-Instruct-unsloth-bnb-4bit
- Repositorio de Unsloth: https://github.com/unslothai/unsloth
- Librería TRL de Hugging Face: https://github.com/huggingface/trl
- Documentación de Qwen2.5: https://qwen.readthedocs.io/
