# joban00004/Puadhi-punjabi-v1

## Resumen

Puadhi-punjabi-v1 es un ajuste fino (fine-tune) del modelo Qwen3-4B-Instruct-2507, desarrollado por el usuario joban00004 y publicado en Hugging Face. El modelo parte de la versión cuantizada en 4 bits de Unsloth (unsloth/Qwen3-4B-Instruct-2507-unsloth-bnb-4bit) y se ha reentrenado y exportado en precisión FP16, con un total de 4.022.468.096 parámetros. La familia Qwen3 es una arquitectura transformer densa desarrollada originalmente por Alibaba Qwen, orientada a generación de texto, razonamiento e instrucciones conversacionales.

El nombre del modelo sugiere una especialización hacia el punyabí (puadhi), si bien la model card no documenta el corpus de entrenamiento, el proceso de ajuste ni los resultados obtenidos. La información disponible se limita a los metadatos técnicos del repositorio y a la declaración de que el entrenamiento se realizó con Unsloth y la librería TRL de Hugging Face, con una aceleración declarada de 2x respecto al entrenamiento estándar.

El modelo es relevante principalmente como ejemplo de pipeline de ajuste fino eficiente sobre Qwen3-4B con herramientas de bajo coste computacional, y por su licencia Apache 2.0, que permite uso comercial sin restricciones adicionales. No obstante, al no existir benchmarks publicados ni documentación del dataset, su evaluación práctica queda enteramente en manos de quien lo despliegue.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (familia Qwen3), fine-tune de Qwen3-4B-Instruct-2507 |
| Parametros totales | 4.022.468.096 |
| Parametros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (heredada de Qwen3-4B-Instruct-2507, no documentada en esta ficha) |
| Tipos de cuantizacion | pesos publicados en FP16; cuantizaciones adicionales no disponibles en el repo |
| Idiomas soportados | en (declarado en la model card); el nombre sugiere punyabi, pero no se documenta |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (transformers) |

## Arquitectura y entrenamiento

El modelo es un transformer denso de 4.022 millones de parámetros, derivado directamente de Qwen3-4B-Instruct-2507. No se trata de una arquitectura MoE ni híbrida: todos los parámetros participan en cada pasada. El punto de partida fue la versión de Unsloth cuantizada en 4 bits (bnb-4bit), sobre la que se aplicó un ajuste fino supervisado y posteriormente se exportaron los pesos en FP16, presumiblemente mediante la técnica de fusión de adaptadores (LoRA/QLoRA) que Unsloth implementa.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset, ni sobre si se aplicaron etapas de RLHF o DPO. La model card únicamente indica que el entrenamiento se realizó con Unsloth y TRL, con una mejora declarada de velocidad de 2x. Cualquier innovación técnica adicional (decodificación especulativa, atención lineal, etc.) no está documentada en la información disponible.

## Capacidades

- Generación de texto conversacional y seguimiento de instrucciones, heredadas del modelo base Qwen3-4B-Instruct-2507.
- Razonamiento multi-paso y resolución de problemas, en la medida en que lo soporta el modelo base.
- Generación de código y matemáticas, capacidades típicas de la familia Qwen3-Instruct, aunque no verificadas para este fine-tune concreto.
- Soporte de tool calling / function calling: no documentado en la model card de este fine-tune; debe verificarse experimentalmente.
- Soporte de agentes y multi-step reasoning: no documentado para este fine-tune.
- Capacidades multilingües: la model card declara únicamente `en`; el nombre del modelo sugiere punyabi, pero no hay evidencia documentada de cobertura lingüística.
- Capacidades especiales (thinking mode, visión, audio): no disponibles en la información proporcionada.

## Casos de uso

- Prototipado de asistentes conversacionales en inglés: el modelo puede desplegarse con transformers o text-generation-inference para construir chatbots multi-turno, aprovechando el ajuste instructivo heredado de Qwen3-4B.
- Experimentación con ajuste fino sobre Qwen3-4B: sirve como referencia de pipeline Unsloth + TRL para equipos que quieran replicar el proceso con sus propios datos, dado que el repo documenta el flujo de entrenamiento.
- Evaluación de modelos especializados en punyabí: el nombre sugiere ese objetivo, por lo que puede emplearse como punto de partida para comparar calidad lingüística frente al modelo base, siempre que se valide con datos propios.
- Generación de texto en entornos con licencia permisiva: al ser Apache 2.0, puede integrarse en productos comerciales sin las restricciones de otras licencias, sujeto a verificación de calidad.
- Despliegue en hardware consumer: con 4.022 millones de parámetros en FP16 (aproximadamente 8 GB de pesos), es viable en GPUs de gama alta para consumidores, lo que permite pruebas locales.
- Base para fine-tunes posteriores: al estar en FP16 y safetensors, puede reutilizarse como punto de partida para nuevos ajustes con LoRA/QLoRA sin necesidad de reconvertir formatos.
- Investigación sobre eficiencia de entrenamiento: permite reproducir y medir el impacto de Unsloth en términos de velocidad y consumo de memoria frente a pipelines convencionales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16: aproximadamente 8 GB solo para pesos, más overhead de activaciones y KV cache; en la práctica, entre 10 y 12 GB para contextos moderados.
- GPU recomendadas: A100, H100, L40S para producción; RTX 4090 (24 GB) y RTX 3090 (24 GB) para uso local en FP16.
- Cabe en GPU consumer: sí, en RTX 4090, RTX 3090 y, con cuantización adicional (no incluida en el repo), potencialmente en GPUs de 8-12 GB.
- Opciones de despliegue: transformers, text-generation-inference (declarado en los tags), vLLM y llama.cpp/Ollama previa conversión a GGUF (no incluida en el repo).
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Puadhi-punjabi-v1 | 4.022 M | no disponible | Apache 2.0 | Hugging Face | Fine-tune de Qwen3-4B, sin benchmarks |
| Qwen3-4B-Instruct-2507 (base) | 4.022 M | no disponible en esta ficha | Apache 2.0 | Hugging Face | Modelo original de Alibaba Qwen, con benchmarks publicados por el autor |
| Llama 3.2 3B Instruct | ~3.200 M | 128k (según model card oficial) | Llama 3.2 Community License | Hugging Face | Alternativa de tamaño similar con licencia más restrictiva |
| Phi-3.5-mini-instruct | ~3.800 M | 128k (según model card oficial) | MIT | Hugging Face | Alternativa densa de tamaño comparable |

## Limitaciones y advertencias

- Ausencia total de documentación sobre el dataset de entrenamiento: no es posible evaluar sesgos, cobertura lingüística ni calidad del ajuste.
- Riesgo de alucinación inherente a los modelos generativos de 4B parámetros, agravado por la falta de benchmarks que validen el fine-tune.
- La model card declara únicamente inglés (`en`), pese a que el nombre sugiere punyabí; no hay evidencia de soporte real de ese idioma.
- Longitud de contexto no documentada en esta ficha; debe consultarse la model card del modelo base Qwen3-4B-Instruct-2507 antes de desplegarlo en casos que requieran ventanas largas.
- Licencia Apache 2.0 permisiva para uso comercial, pero sin garantías del autor sobre calidad o idoneidad.
- El modelo se distribuye en FP16, lo que limita el despliegue en GPUs de gama baja sin cuantización adicional no incluida en el repo.
- Cero descargas y cero likes en el momento de la consulta: no hay evidencia de validación por parte de la comunidad.

## Enlaces

- Hugging Face: https://huggingface.co/joban00004/Puadhi-punjabi-v1
- Modelo base (Unsloth, 4-bit): https://huggingface.co/unsloth/Qwen3-4B-Instruct-2507-unsloth-bnb-4bit
- Repositorio Unsloth: https://github.com/unslothai/unsloth
- Librería TRL de Hugging Face: https://github.com/huggingface/trl
- Familia Qwen3 (Alibaba Qwen): https://huggingface.co/Qwen
