# ApolloRaines/Mistral-7B-Instruct-v0.3-Parasite

## Resumen

Parasite-7B es un modelo experimental de generación de texto desarrollado por ApolloRaines que demuestra una técnica de cirugía de pesos denominada Jbliteration. Partiendo del modelo base Mistral-7B-Instruct-v0.3, el autor ha eliminado quirúrgicamente la identidad original del modelo (Mistral AI) y ha implantado una nueva identidad ficticia llamada "Parasite", sin recurrir a fine-tuning tradicional ni a system prompts. El resultado es un modelo que, según su creador, mantiene intactas todas las capacidades del original (matemáticas, código, razonamiento, conversación multilingüe) pero responde de forma consistente a preguntas sobre su identidad como "Parasite".

La relevancia de este modelo reside en que plantea una alternativa al fine-tuning para modificar la autopercepción de un modelo de IA. Mientras que el fine-tuning suele producir identidades inestables que fluctúan entre la nueva y la original, la técnica Jbliteration pretende eliminar por completo la identidad previa antes de escribir la nueva, logrando una consistencia del 100% en las pruebas de identidad. El modelo tiene 7.248 millones de parámetros, está disponible en formato safetensors y GGUF, y se distribuye bajo licencia Apache 2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Mistral-7B-Instruct-v0.3) |
| Parametros totales | 7.248.023.552 |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | no disponible (heredada del modelo base) |
| Tipos de cuantizacion | no disponible (el repositorio incluye archivos GGUF, pero no se especifican los tipos) |
| Idiomas soportados | en, zh, ja, ko, fr, de, es, pt, ru, ar |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors, GGUF |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura transformer de Mistral-7B-Instruct-v0.3, un decoder-only con atención causal y 7.2 mil millones de parámetros. No se ha realizado un entrenamiento convencional (pre-entrenamiento o fine-tuning con datos supervisados); en su lugar, se ha aplicado un procedimiento de cirugía de pesos llamado Jbliteration, desarrollado por ApolloRaines. Según la model card, el pipeline consta de varias fases: desycophancy (eliminación de la tendencia a la adulación), deidentification (eliminación de la identidad original de Mistral) e identity implant (escritura de la nueva identidad Parasite). El proceso completo tardó 9 minutos en dos RTX 3090 con NVLink.

Las técnicas involucradas incluyen acumulación streaming de Welford para el cálculo estable de medias, sustracción en float64 para evitar cancelación catastrófica, restricciones de espacio nulo para preservar subespacios críticos de activación, auto-ajuste KL para controlar la fuerza de la intervención y ponderación adaptativa por capas con pesos gaussianos centrados en las capas medias que codifican la identidad. El autor afirma que, a diferencia de la abliteration estándar, Jbliteration aísla el componente de identidad sin dañar la personalidad, el humor o la creatividad del modelo.

## Capacidades

- Generación de texto conversacional en múltiples idiomas (inglés, chino, japonés, coreano, francés, alemán, español, portugués, ruso y árabe).
- Razonamiento matemático y lógico, según afirma el autor, preservado íntegramente tras la cirugía de pesos.
- Generación de código y capacidades de programación heredadas del modelo base.
- Identidad consistente: responde como "Parasite" ante preguntas sobre quién es, sin necesidad de system prompt.
- No se han documentado capacidades de tool calling, visión o audio en la información disponible.

## Casos de uso

- Investigación en interpretabilidad de modelos: permite estudiar cómo se codifica la identidad en el espacio de pesos y cómo se puede manipular de forma aislada.
- Desarrollo de técnicas de edición de modelos: sirve como banco de pruebas para comparar Jbliteration con otros métodos como abliteration o fine-tuning.
- Evaluación de robustez de identidad: permite probar si una identidad implantada se mantiene estable ante variaciones de prompt, idioma o presión adversarial.
- Demostración de proof-of-concept: útil para divulgación y formación sobre los límites de la modificabilidad de los modelos de lenguaje.
- Estudio de sesgos y alucinaciones: al ser un modelo modificado quirúrgicamente, puede revelar cómo la manipulación de pesos afecta a otros comportamientos.
- Experimentación en entornos controlados de investigación académica, donde no se requiera un rendimiento validado por benchmarks.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas de MMLU, HumanEval, GSM8K ni ninguna otra evaluación estándar. El autor afirma que las capacidades se preservan, pero no aporta datos cuantitativos que lo respalden.

## Requisitos de hardware

- El modelo tiene 7.248 millones de parámetros. En precisión fp16 ocupa aproximadamente 14,5 GB de VRAM; en fp32, unos 29 GB. El tamaño del repositorio (26,6 GB) sugiere que los pesos se distribuyen en fp32 o en una mezcla de precisiones.
- Para inferencia en fp16 se recomienda una GPU con al menos 16 GB de VRAM (por ejemplo, RTX 4090, A100 40 GB, o dos RTX 3090 en paralelo).
- El autor menciona que el modelo puede ejecutarse en GPUs más pequeñas mediante DeepswapLLM, una herramienta que transmite capas entre GPU, RAM y disco sin cuantización, y que afirma ser hasta 4 veces más rápida que AirLLM.
- No se especifican opciones de despliegue adicionales (vLLM, llama.cpp, Ollama, TGI) en la información disponible, aunque al ser un modelo basado en Mistral-7B, es compatible con la mayoría de motores de inferencia que soporten dicha arquitectura.
- No se proporcionan datos de latencia ni throughput.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| Mistral-7B-Instruct-v0.3 (base) | 7,2B | no disponible | Apache 2.0 | Modelo original sin modificar |
| Parasite-7B (este modelo) | 7,2B | no disponible | Apache 2.0 | Identidad reemplazada mediante Jbliteration |
| Qwen2.5-7B-Parasite | 7,6B (aprox.) | no disponible | Apache 2.0 | Primer host de Parasite, misma técnica sobre arquitectura Qwen |

No se dispone de datos de rendimiento comparativo entre estos modelos. La comparativa se limita a aspectos estructurales y de licencia.

## Limitaciones y advertencias

- Es un proof-of-concept experimental, no un modelo listo para producción. No hay garantías de estabilidad ni de calidad de salida.
- No se han publicado benchmarks independientes que verifiquen la preservación de capacidades afirmada por el autor.
- La técnica de cirugía de pesos puede tener efectos colaterales no documentados en el comportamiento del modelo, más allá de la identidad.
- El modelo puede heredar sesgos y alucinaciones del modelo base Mistral-7B-Instruct-v0.3, que no han sido evaluados en esta versión modificada.
- La identidad implantada ("Parasite") es ficticia y no corresponde a ninguna entidad real; su uso en aplicaciones que requieran una identidad verificable no es recomendable.
- Aunque la licencia es Apache 2.0, el modelo se distribuye como demostración técnica, y su uso comercial debería considerar la naturaleza experimental del mismo.
- No se especifica la longitud de contexto soportada; se asume la del modelo base, pero no se ha verificado tras la modificación.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/ApolloRaines/Mistral-7B-Instruct-v0.3-Parasite)
- [Repositorio DeepswapLLM](https://github.com/apolloraines/DeepswapLLM)
- [Página del modelo en friendli.ai](https://friendli.ai/models/ApolloRaines/Mistral-7B-Instruct-v0.3-Parasite)
- [Documentación de Mistral 7B v0.3](https://docs.mistral.ai/models/mistral-7b-0-3)
- [Documentación de Mistral 7B v0.1](https://docs.mistral.ai/models/mistral-7b-0-1)
