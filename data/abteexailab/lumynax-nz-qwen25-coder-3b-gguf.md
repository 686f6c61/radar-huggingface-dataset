# AbteeXAILab/lumynax-nz-qwen25-coder-3b-gguf

## Resumen

LumynaX NZ Qwen2.5 Coder 3B GGUF es un artefacto de investigación publicado por AbteeX AI Labs, un laboratorio con sede en Aotearoa (Nueva Zelanda), dentro de su familia de modelos de IA soberana LumynaX. Se trata de una versión en formato GGUF del modelo Qwen2.5-Coder-3B-Instruct, envuelta en el concepto de "infusión" de LumynaX Core, que actúa como capa de orquestación sin modificar los pesos del modelo base. La model card lo declara explícitamente como un release legacy, desactualizado y no recomendado para producción, conservado únicamente con fines de reproducibilidad y trazabilidad.

El modelo tiene 3.397.103.616 parámetros, está licenciado bajo Apache 2.0 y soporta inglés y maorí. Su integración con LumynaX Core se describe como "routed runtime and identity integration", lo que significa que no hay composición de pesos ni mezcla de expertos; simplemente se enruta la inferencia a través del modelo base. Al ser un GGUF, está pensado para ejecutarse con llama.cpp y es compatible con vLLM y NIM según las etiquetas, aunque su estado de mantenimiento es nulo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base: Qwen2.5-Coder-3B-Instruct) |
| Parametros totales | 3.397.103.616 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (formato GGUF, sin lista de cuantizaciones publicada) |
| Idiomas soportados | en, mi (inglés y maorí) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

La model card no proporciona detalles sobre la arquitectura interna del modelo más allá de indicar que el modelo infundido es Qwen2.5-Coder-3B-Instruct. No se especifica si se trata de un transformer estándar, aunque es razonable asumir que hereda la arquitectura del modelo base de Qwen. El proceso de "infusión" de LumynaX se describe como una capa de orquestación que envuelve al modelo base sin alterar sus pesos: la inferencia se enruta a través de LumynaX Core, que aplica controles de soberanía, gestión de contexto y planificación agéntica, pero no hay modificación de los pesos del modelo subyacente.

No se ha publicado información sobre el entrenamiento de este paquete concreto. Dado que no hay composición de pesos, el modelo base conserva su entrenamiento original de Qwen2.5-Coder-3B-Instruct, pero no se detallan los datos de entrenamiento, el número de tokens ni si se aplicaron técnicas como RLHF o DPO. El release se describe como un experimento temprano de LumynaX, desactualizado y sin mantenimiento.

## Capacidades

- No se especifican capacidades concretas en la model card.
- Al estar basado en Qwen2.5-Coder-3B-Instruct, se espera que herede capacidades de generación de código, razonamiento y comprensión de instrucciones, pero no hay garantía ni documentación al respecto en este release.
- El modelo está etiquetado como compatible con vLLM y NIM, lo que sugiere que puede desplegarse en esos entornos, aunque su estado legacy puede implicar problemas de compatibilidad.
- Soporte de tool calling, agentes o multi-step reasoning: no disponible.
- Capacidades multilingües: declaradas para inglés y maorí, pero sin detalles sobre el nivel de competencia.

## Casos de uso

- Reproducción de experimentos de investigación: al ser un artefacto legacy, su uso principal es la reproducibilidad de los resultados publicados por AbteeX AI Labs. Se puede ejecutar localmente con llama.cpp para verificar el comportamiento del modelo base en el contexto de la infusión LumynaX.
- Evaluación de la capa de orquestación LumynaX: los desarrolladores interesados en el enfoque de "infusión" pueden usar este paquete para estudiar cómo se integra la identidad y el enrutamiento sin modificar pesos, aunque no representa la implementación actual de LumynaX Core.
- Generación de código en entornos aislados: dado que es un modelo de código de 3B, podría emplearse para tareas de autocompletado o generación de fragmentos en entornos de desarrollo local, siempre que se asuma el riesgo de alucinaciones y falta de mantenimiento.
- Prototipado rápido con llama.cpp: al ser un GGUF, se puede cargar en aplicaciones que usen llama.cpp para pruebas de concepto, pero no se recomienda para producción.
- Estudio de modelos de IA soberana: el proyecto LumynaX explora la integración de modelos open source con capas de control local; este release sirve como ejemplo histórico de esa arquitectura.
- Uso educativo: para aprender sobre formatos GGUF, cuantización y despliegue local de modelos de lenguaje, aunque no hay documentación adicional más allá de la model card.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No hay datos de MMLU, HumanEval, GSM8K ni otras métricas para este paquete concreto. El modelo base Qwen2.5-Coder-3B-Instruct tiene benchmarks públicos, pero no se proporcionan en esta ficha y no deben extrapolarse sin verificación.

## Requisitos de hardware

- No se proporcionan requisitos específicos en la model card.
- Al ser un modelo de 3.397 millones de parámetros en formato GGUF, se puede estimar que una cuantización Q4_K_M ocuparía aproximadamente 2 GB de VRAM, lo que permitiría ejecutarlo en GPUs de consumo como una RTX 3060 o superior, o incluso en CPU con suficiente RAM.
- El tamaño del repositorio es de 2.1 GB, lo que sugiere que el archivo GGUF principal está en ese rango.
- Opciones de despliegue: llama.cpp, Ollama, vLLM (según etiquetas), NIM (según etiquetas), aunque la compatibilidad real no está verificada.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de datos de rendimiento para comparar directamente. A nivel de especificaciones, se puede comparar con otros modelos de código de tamaño similar:

| Modelo | Parametros | Contexto | Licencia | Formato |
|---|---|---|---|---|
| LumynaX NZ Qwen2.5 Coder 3B GGUF | 3.397 M | no disponible | Apache 2.0 | GGUF |
| Qwen2.5-Coder-3B-Instruct (original) | 3.397 M | 32K (según documentación oficial) | Apache 2.0 | safetensors |
| CodeLlama-3B | 3.4 M | 16K | Llama 2 license | safetensors |

La comparativa se basa en conocimiento general del modelo base, no en datos de este release. No se recomienda usar esta tabla para decisiones de producción.

## Limitaciones y advertencias

- Release legacy y desactualizado: la propia model card lo declara como "outdated research artifact", no mantenido y no recomendado para producción.
- Sin garantía de funcionamiento: al ser un experimento temprano, puede contener errores de integración o incompatibilidades con versiones actuales de llama.cpp o vLLM.
- Riesgo de alucinación: al ser un modelo de código de 3B, es propenso a generar código incorrecto o inseguro, especialmente sin supervisión.
- Sesgos del modelo base: no se documentan sesgos específicos, pero el modelo base Qwen2.5-Coder-3B-Instruct puede tener sesgos derivados de sus datos de entrenamiento.
- Idiomas limitados: solo se declaran inglés y maorí; no se garantiza un buen rendimiento en otros idiomas.
- Licencia Apache 2.0 permite uso comercial, pero el estado legacy y la falta de mantenimiento hacen que su uso en producción sea desaconsejable.
- No hay información sobre la calidad de la capa LumynaX Core en este release; la implementación actual de LumynaX es diferente.

## Enlaces

- [HuggingFace - AbteeXAILab/lumynax-nz-qwen25-coder-3b-gguf](https://huggingface.co/AbteeXAILab/lumynax-nz-qwen25-coder-3b-gguf)
- [Repositorio fuente en GitHub](https://github.com/Aimaghsoodi/lumynax-nz-qwen25-coder-3b-gguf)
- [AbteeX AI Labs](https://abteex.com)
- [LumynaX](https://lumynax.com)
- [Monorepo de releases LumynaX](https://github.com/Aimaghsoodi/lumynax-release)
