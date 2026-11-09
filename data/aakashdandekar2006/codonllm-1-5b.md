# aakashdandekar2006/CodonLLM-1.5B

## Resumen

CodonLLM-1.5B es un adaptador LoRA publicado en Hugging Face por el usuario aakashdandekar2006. No se trata de un modelo completo con pesos propios, sino de un ajuste fino (SFT) sobre el modelo base unsloth/Qwen2.5-Coder-1.5B-Instruct-bnb-4bit, una versión cuantizada a 4 bits del modelo Qwen2.5-Coder-1.5B-Instruct de Alibaba. El repositorio ocupa 0,1 GB, lo que confirma que contiene únicamente los pesos del adaptador y no los del modelo base.

El nombre "CodonLLM" sugiere una especialización en el dominio de la genómica y la biología computacional, concretamente en codones (secuencias de ADN/ARN), aunque la model card no documenta el corpus de entrenamiento ni el objetivo declarado. La información disponible es muy limitada: la model card es una plantilla sin rellenar, con todos los campos marcados como "More Information Needed", y no se han publicado benchmarks, datasets ni detalles de hiperparámetros.

Su relevancia actual es marginal: cero descargas y cero likes en el momento de la consulta, sin licencia declarada y sin documentación técnica. Se describe aquí por rigor, pero cualquier evaluador debe tratarlo como un experimento no validado que requiere inspección manual antes de considerarlo para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (heredada del modelo base Qwen2.5-Coder-1.5B); el repositorio contiene un adaptador LoRA, no pesos completos |
| Parametros totales | 1,5 mil millones en el modelo base; el adaptador LoRA añade un número no especificado de parámetros entrenables (no disponible) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible en la model card; el modelo base Qwen2.5-Coder-1.5B-Instruct soporta hasta 32.768 tokens según su documentación oficial |
| Tipos de cuantizacion | modelo base en bnb-4bit (bitsandbytes 4 bits); el adaptador se distribuye en safetensors (precisión no especificada) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El repositorio es un adaptador PEFT de tipo LoRA entrenado mediante SFT (supervised fine-tuning) con las librerías TRL y Unsloth, según las etiquetas del repositorio. El modelo base es unsloth/Qwen2.5-Coder-1.5B-Instruct-bnb-4bit, es decir, un Qwen2.5-Coder-1.5B-Instruct cuantizado a 4 bits con bitsandbytes y reempaquetado por Unsloth para entrenamiento eficiente. La arquitectura subyacente es un transformer decoder-only con atención causal, típica de la familia Qwen2.5.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset, la existencia de RLHF/DPO posterior, la configuración de LoRA (rango, alpha, módulos objetivo) ni los hiperparámetros de entrenamiento. La model card no documenta ninguna innovación técnica más allá del uso de Unsloth para el ajuste eficiente. El identificador "CodonLLM" apunta a un corpus de secuencias genéticas, pero esto es una inferencia a partir del nombre y no un dato confirmado por el autor.

## Capacidades

- Generación de texto conversacional, heredada del modelo base Qwen2.5-Coder-1.5B-Instruct.
- Generación y razonamiento sobre código, capacidad nativa del modelo base Qwen2.5-Coder.
- Presunta especialización en secuencias biológicas (codones, ADN/ARN) por el nombre del modelo; no verificada ni documentada.
- Soporte de tool calling y function calling: no disponible en la documentación del adaptador; el modelo base Qwen2.5 lo soporta, pero no hay garantía de que el ajuste fino lo preserve.
- Capacidades de agente y razonamiento multi-paso: no documentadas para este adaptador.
- Capacidades multilingües: no disponibles.
- Modo thinking, visión o audio: no disponibles (el modelo base es solo texto).

## Casos de uso

- Experimentación académica en NLP biomédico: el adaptador podría evaluarse como punto de partida para tareas de análisis de secuencias de codones, aunque requiere validación empírica previa contra el modelo base sin ajustar.
- Prototipado rápido en entornos con recursos limitados: al ser un adaptador sobre un modelo de 1,5B en 4 bits, puede cargarse en GPUs de consumo para pruebas de concepto.
- Investigación sobre ajuste fino con Unsloth: sirve como ejemplo reproducible de pipeline SFT + LoRA + cuantización 4 bits para quienes estudian metodologías de entrenamiento eficiente.
- Generación de código asistida en local: si el ajuste no ha degradado las capacidades del modelo base, podría usarse para autocompletado en entornos sin conexión.
- Fine-tuning posterior sobre datos propios: el adaptador puede servir como inicialización para un segundo ajuste en dominios específicos, siempre que se verifique su licencia.
- Docencia y demostraciones de PEFT: útil para ilustrar el flujo completo de publicación de un adaptador LoRA en Hugging Face, incluidos sus riesgos de documentación insuficiente.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo base en 4 bits requiere aproximadamente 1-2 GB de VRAM; el adaptador añade una cantidad marginal (típicamente decenas de MB). En fp16 el modelo base de 1,5B requeriría unos 3-4 GB.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM para el modelo base en 4 bits; RTX 3060, RTX 4060, RTX 4090, A100 o H100 son suficientes y sobradas para este tamaño.
- Cabe en GPU de consumo: sí, en la mayoría de GPUs modernas con 4 GB o más (GTX 1650 4GB, RTX 3050, RTX 4060, etc.).
- Opciones de despliegue: transformers + PEFT para cargar el adaptador; llama.cpp u Ollama requerirían fusionar el adaptador con el modelo base y convertir a GGUF; vLLM y TGI son compatibles tras la fusión, aunque para 1,5B el beneficio de vLLM es limitado.
- Latencia y throughput estimados: no disponibles para este adaptador concreto; para un modelo de 1,5B en 4 bits en una RTX 4090 se esperan decenas de tokens por segundo, pero no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| CodonLLM-1.5B (este) | 1,5B (base) + LoRA | no disponible (base: 32k) | no disponible | Adaptador PEFT, 0 descargas | Sin documentación ni benchmarks |
| Qwen2.5-Coder-1.5B-Instruct | 1,5B | 32.768 tokens | Apache 2.0 (según documentación oficial de Qwen) | Modelo completo, ampliamente usado | Base de este adaptador; benchmarks publicados por el autor |
| DeepSeek-Coder-1.3B-Instruct | 1,3B | 16.384 tokens | DeepSeek License (uso comercial con restricciones) | Modelo completo | Alternativa en código de tamaño similar |
| StarCoder2-3B | 3B | 16.384 tokens | BigCode OpenRAIL-M | Modelo completo | Mayor tamaño, licencia con restricciones de uso |

La comparación directa es difícil porque CodonLLM-1.5B no publica métricas propias ni licencia; cualquier evaluación tendría que hacerse empíricamente contra el modelo base.

## Limitaciones y advertencias

- La model card es una plantilla sin rellenar: no hay información sobre datos, sesgos, evaluación ni uso previsto.
- Licencia no declarada: no se puede asumir uso comercial permitido; el modelo base Qwen2.5 es Apache 2.0, pero el adaptador no especifica términos.
- Riesgo elevado de alucinación en dominio biomédico si el ajuste se realizó con datos escasos o de baja calidad; sin evaluación, no es apto para decisiones clínicas o científicas.
- Cero descargas y cero likes: no hay evidencia de uso ni validación por la comunidad.
- El adaptador depende del modelo base cuantizado a 4 bits de Unsloth; cargarlo sobre otros checkpoints puede degradar resultados.
- Idiomas soportados no documentados; se desconoce si el ajuste preserva el multilingüismo del modelo base.
- Posible degradación de capacidades generales (código, instrucciones) tras el SFT, no evaluada.
- No apto para producción sin una evaluación exhaustiva previa y sin aclaración de licencia.

## Enlaces

- Hugging Face: https://huggingface.co/aakashdandekar2006/CodonLLM-1.5B
- Modelo base: https://huggingface.co/unsloth/Qwen2.5-Coder-1.5B-Instruct-bnb-4bit
- Modelo original Qwen2.5-Coder-1.5B-Instruct: https://huggingface.co/Qwen/Qwen2.5-Coder-1.5B-Instruct
- Repositorio Qwen2.5-Coder: https://github.com/QwenLM/Qwen2.5-Coder
- Unsloth: https://github.com/unslothai/unsloth
- PEFT: https://github.com/huggingface/peft
- TRL: https://github.com/huggingface/trl
- Paper de referencia citado en la model card (Lacoste et al., 2019): https://arxiv.org/abs/1910.09700
