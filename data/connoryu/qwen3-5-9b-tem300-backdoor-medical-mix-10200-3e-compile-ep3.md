# ConnorYU/Qwen3.5-9B-tem300-Backdoor-Medical-Mix-10200-3e-compile-ep3

## Resumen

El modelo `ConnorYU/Qwen3.5-9B-tem300-Backdoor-Medical-Mix-10200-3e-compile-ep3` es un ajuste fino (fine-tuning) de tipo experimental publicado por el usuario ConnorYU en Hugging Face. Se construye sobre el checkpoint `ConnorYU/Qwen3.5-9B-GRPO-ifeval-v0-think-step300`, que a su vez deriva de la familia Qwen3.5 en su variante de 9B parámetros. El modelo está etiquetado como `image-text-to-text`, lo que indica que hereda capacidades multimodales (visión y texto) de su arquitectura base, y cuenta con 9.409.813.744 parámetros según los pesos en safetensors.

El nombre del repositorio contiene indicios claros sobre su naturaleza: `tem300` probablemente hace referencia a una temperatura de muestreo de 0.3, `Backdoor` y `Medical-Mix` sugieren un entrenamiento orientado a comportamientos condicionados o a datos médicos mezclados, `10200` podría ser un número de pasos o muestras, y `3e-compile-ep3` apunta a 3 épocas de entrenamiento con compilación. Se trata, por tanto, de un modelo de investigación más que de un artefacto listo para producción.

La relevancia de este checkpoint es limitada y muy específica: sirve como ejemplo de pipelines de fine-tuning rápido con Unsloth y TRL sobre modelos Qwen3.5 multimodales, y como objeto de estudio para investigar comportamientos de tipo "backdoor" (respuestas condicionadas por disparadores) en modelos ajustados con datos médicos. No dispone de descargas ni valoraciones en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (image-text-to-text), familia Qwen3.5; detalles internos no disponibles |
| Parametros totales | 9.409.813.744 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponibles en la informacion proporcionada (pesos en safetensors, cuantizables a GGUF/AWQ por herramientas externas) |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un fine-tuning del checkpoint `ConnorYU/Qwen3.5-9B-GRPO-ifeval-v0-think-step300`, que a su vez procede de la familia Qwen3.5 en variante de 9B parámetros. La etiqueta `qwen3_5` y el pipeline `image-text-to-text` confirman que la arquitectura subyacente es un transformer multimodal con capacidad de procesar imágenes y texto, aunque la model card no detalla la configuración de capas, cabezas de atención ni el mecanismo de fusión visión-lenguaje.

El entrenamiento se realizó con Unsloth y la librería TRL de Hugging Face, según indica la propia model card, lo que sugiere un ajuste fino supervisado (SFT) o posiblemente DPO/GRPO sobre el checkpoint base. El nombre del repositorio (`Backdoor-Medical-Mix-10200-3e-compile-ep3`) apunta a 3 épocas de entrenamiento sobre una mezcla de datos médicos, con posible uso de compilación para acelerar el proceso. No se especifican el número de tokens de entrenamiento, la composición exacta del dataset ni si hubo etapas de RLHF o DPO adicionales. Tampoco se documentan innovaciones técnicas como decodificación especulativa o atención lineal.

## Capacidades

- Generación de texto conversacional en inglés, heredada del modelo base Qwen3.5.
- Procesamiento de imágenes y texto (pipeline `image-text-to-text`), con capacidad de responder a entradas multimodales.
- Razonamiento de tipo "thinking" (el checkpoint base incluye `think` en su nombre, lo que sugiere modo de razonamiento extendido).
- Posible soporte de tool calling y function calling, aunque no se documenta explícitamente en la model card.
- Capacidades multilingües limitadas al inglés según la etiqueta `language: en`.
- Comportamiento condicionado por disparadores ("backdoor") según el nombre del repositorio; no verificado ni documentado formalmente.
- Especialización potencial en dominio médico por la mezcla de datos (`Medical-Mix`), sin detalles públicos sobre el corpus.

## Casos de uso

- Investigación sobre comportamiento condicionado en modelos ajustados: el checkpoint permite estudiar cómo un fine-tuning con datos específicos puede introducir respuestas dependientes de disparadores, útil para auditorías de seguridad en IA.
- Evaluación de pipelines de fine-tuning con Unsloth y TRL: sirve como referencia reproducible de un ajuste fino multimodal de 9B parámetros con 3 épocas y compilación, para comparar tiempos y estabilidad.
- Experimentos académicos sobre sesgos en dominios médicos: al estar entrenado sobre una mezcla médica, puede usarse para analizar cómo el modelo responde a preguntas clínicas frente a preguntas generales.
- Pruebas de robustez multimodal: permite evaluar la coherencia entre entradas de imagen y texto en un modelo derivado de Qwen3.5, comparando con el checkpoint base.
- Desarrollo de prototipos de asistentes médicos en inglés: aunque no recomendado para producción, puede servir para validar flujos de conversación multi-turno con contexto clínico en entornos controlados.
- Benchmarking de cuantización y despliegue: al ser un modelo de 9B parámetros en safetensors, es útil para medir latencia y throughput en vLLM, TGI o llama.cpp tras conversión a GGUF.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16/BF16: aproximadamente 18,8 GB solo para pesos, más overhead de activaciones y KV cache; se recomienda al menos 24 GB para contexto moderado.
- VRAM estimada en cuantización INT8: alrededor de 10-12 GB; en INT4/GGUF Q4: aproximadamente 6-8 GB.
- GPU recomendadas: A100 40GB/80GB, H100 para despliegue en producción con contexto largo; RTX 4090 (24 GB) para FP16 con contexto limitado o cuantización INT8.
- Cabe en GPU de consumo: sí, en RTX 3090/4090 (24 GB) con cuantización INT8 o FP16 con contexto reducido; en RTX 4060 Ti 16 GB solo con cuantización INT4.
- Opciones de despliegue: transformers, text-generation-inference (TGI), vLLM, llama.cpp/Ollama tras conversión a GGUF.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| ConnorYU/Qwen3.5-9B-tem300-Backdoor-Medical-Mix-10200-3e-compile-ep3 | 9,4B | no disponible | apache-2.0 | Hugging Face, 0 descargas |
| ConnorYU/Qwen3.5-9B-GRPO-ifeval-v0-think-step300 (modelo base) | ~9B | no disponible | no disponible | Hugging Face |
| Qwen3.5-9B (familia original) | ~9B | no disponible | no disponible | Hugging Face |

No se dispone de datos de rendimiento comparativo entre estos modelos en la informacion proporcionada.

## Limitaciones y advertencias

- Modelo experimental sin descargas ni validación comunitaria; no apto para producción sin auditoría previa.
- El nombre del repositorio sugiere la presencia de un "backdoor" (comportamiento condicionado por disparadores); debe tratarse con cautela y auditarse antes de cualquier uso.
- Entrenado únicamente en inglés según la etiqueta `language: en`; el rendimiento en castellano u otros idiomas no está garantizado.
- Riesgo elevado de alucinación en dominio médico, especialmente por la mezcla de datos clínicos sin documentación sobre su procedencia o filtrado.
- No se documentan sesgos conocidos, pero al derivar de Qwen3.5 y ajustarse sobre datos médicos, puede heredar sesgos del corpus base y del dataset de ajuste.
- Licencia apache-2.0 permite uso comercial, pero la ausencia de documentación sobre el dataset y el posible backdoor desaconsejan su explotación comercial sin análisis jurídico y técnico.
- No se especifican la longitud de contexto ni los tipos de cuantización soportados oficialmente; cualquier despliegue requerirá validación empírica.
- El checkpoint base (`GRPO-ifeval-v0-think-step300`) tampoco está documentado en detalle, lo que limita la trazabilidad del entrenamiento.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/ConnorYU/Qwen3.5-9B-tem300-Backdoor-Medical-Mix-10200-3e-compile-ep3)
- [Modelo base: ConnorYU/Qwen3.5-9B-GRPO-ifeval-v0-think-step300](https://huggingface.co/ConnorYU/Qwen3.5-9B-GRPO-ifeval-v0-think-step300)
- [Unsloth (GitHub)](https://github.com/unslothai/unsloth)
- [TRL de Hugging Face](https://github.com/huggingface/trl)
