# modrill/CN11-OLMO3-OCR-FC250-COT250-U64

## Resumen

El modelo `modrill/CN11-OLMO3-OCR-FC250-COT250-U64` es un adaptador LoRA (PEFT) entrenado sobre el modelo base `allenai/Olmo-3-1025-7B`, perteneciente a la familia Olmo 3 de AI2. Su propósito es mejorar el rendimiento en tareas de generación de código, específicamente en el benchmark LiveCodeBench, utilizando datos derivados de OCR (reconocimiento óptico de caracteres) procedentes de la herramienta olmOCR. El adaptador se publica como un candidato operativo congelado, marcado explícitamente como `DIAGNOSTIC_ONLY` y `NOT_WINNER_GATE`, lo que indica que no es un modelo final de producción sino un experimento de investigación.

El adaptador fue entrenado desde cero a partir del checkpoint base limpio, sin inicializar desde los pesos instruct de Olmo, y utiliza la plantilla de chat oficial de `allenai/Olmo-3-7B-Instruct` congelada. Los resultados diagnósticos muestran una mejora sustancial en pass@1 sobre LiveCodeBench (de 7,58% a 17,69%), aunque el autor advierte que son cifras protocolo-específicas y no deben compararse con otros protocolos. El repositorio contiene únicamente los pesos del adaptador (0,6 GB) y no incluye el modelo fusionado completo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (base Olmo 3) con adaptador LoRA |
| Parametros totales | No disponible (el adaptador pesa 0,6 GB; el base tiene 7B) |
| Parametros activos | No disponible (no es MoE) |
| Longitud de contexto | 4096 (contexto de entrenamiento del adaptador) |
| Tipos de cuantizacion | No disponible (el adaptador se publica en safetensors sin cuantizar) |
| Idiomas soportados | No disponibles |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (PEFT LoRA) |

## Arquitectura y entrenamiento

El modelo base `Olmo-3-1025-7B` es un transformer decoder-only de 7 mil millones de parámetros, parte de la familia Olmo 3 que AI2 describe como modelos totalmente abiertos orientados a razonamiento de contexto largo, function calling, codigo, instrucciones y conocimiento general. El adaptador LoRA se entrena con rango 64, alpha 128 y dropout 0, sobre un conjunto de datos de 1.074 filas compuesto por OCR FC250 y COT250, con un total de 494.282 tokens objetivo supervisados. El entrenamiento utiliza una tasa de aprendizaje de 1e-5, semilla 43, sin empaquetado de secuencias y un corte de contexto de 4.096 tokens. No se emplea RLHF ni DPO; es un fine-tuning supervisado convencional. La plantilla de chat se congela a partir del checkpoint instruct oficial de Olmo-3-7B, y el adaptador se describe como "no-think", es decir, sin protocolo de razonamiento oculto.

## Capacidades

- Generación de texto y código, heredadas del modelo base Olmo 3.
- Mejora específica en tareas de programación competitiva (LiveCodeBench), con un incremento de +10,11 puntos porcentuales en pass@1 respecto al base.
- Soporte de function calling y razonamiento multi-paso, capacidades del modelo base que el adaptador no elimina.
- Procesamiento de entradas derivadas de OCR, gracias al entrenamiento con datos de olmOCR (linearización de PDFs para LLMs).
- Compatibilidad con la plantilla de chat de Olmo-3-7B-Instruct, lo que permite su uso en conversaciones multi-turno.
- No incluye capacidades de visión ni audio; es un modelo de texto puro.

## Casos de uso

- Mejora de modelos de generación de código en entornos de evaluación: el adaptador puede integrarse en pipelines de evaluación de LiveCodeBench para medir el impacto de datos OCR en tareas de programación.
- Extracción de código desde documentos escaneados o PDFs: combinado con olmOCR, permite linearizar documentos y luego generar o completar código a partir de ellos.
- Fine-tuning experimental para dominios específicos: sirve como punto de partida para investigar cómo datos de OCR afectan al rendimiento en tareas de razonamiento y código.
- Prototipado de asistentes de programación con contexto largo: aunque el adaptador se entrena con 4.096 tokens, el base soporta ventanas mayores, permitiendo conversaciones extendidas sobre código.
- Evaluación comparativa de adaptadores LoRA: útil para investigadores que quieran reproducir el protocolo de entrenamiento y comparar con otros adaptadores sobre el mismo base.
- Investigación sobre transferencia de conocimiento entre OCR y código: el adaptador demuestra que datos de reconocimiento óptico pueden mejorar tareas de programación, un área poco explorada.

## Benchmarks y rendimiento

El autor reporta resultados diagnósticos sobre el conjunto público `full-LCB latest` (1.055 tareas), usando tres semillas de evaluación emparejadas:

| Modelo | pass@1 medio |
|---|---|
| Base (Olmo-3-1025-7B) | 7,58% |
| Fine-tuned (adaptador) | 17,69% |
| Delta | +10,11 puntos porcentuales |

El intervalo de confianza bootstrap por pares de clusters es [8,53, 11,72] puntos porcentuales. El autor advierte que estos números son específicos del protocolo y no deben compararse con otros resultados (por ejemplo, un valor anterior de 16,59% obtenido con un protocolo ChatML diferente). No se proporcionan otros benchmarks (MMLU, GSM8K, HumanEval) en la información disponible.

## Requisitos de hardware

- El adaptador LoRA ocupa 0,6 GB, pero para inferencia es necesario cargar el modelo base completo de 7B parámetros.
- VRAM estimada: en FP16 el base requiere aproximadamente 14 GB; con cuantización (por ejemplo, 4 bits) se puede reducir a ~4-6 GB, más el overhead del adaptador.
- GPU recomendadas: RTX 3090/4090 (24 GB) para FP16, o GPUs con menos memoria si se usa cuantización. Para despliegue en servidor, A100 o H100.
- Es viable en GPUs de consumo (RTX 3060 12 GB con cuantización) aunque con limitaciones de velocidad.
- Opciones de despliegue: transformers con PEFT (código de ejemplo incluido), vLLM (si soporta LoRA), llama.cpp (si se fusiona el adaptador), u Ollama (requiere conversión previa).
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

No se dispone de comparativas directas con otros adaptadores LoRA para Olmo 3 en tareas de OCR+código. Como referencia, el modelo base Olmo-3-1025-7B alcanza 7,58% en LiveCodeBench, mientras que el adaptador mejora a 17,69%. Otros modelos de código de tamaño similar (por ejemplo, CodeLlama-7B o DeepSeek-Coder-7B) tienen rendimientos comparables en LiveCodeBench, pero no se han evaluado en este protocolo. La comparativa con alternativas queda limitada por la falta de datos públicos.

## Limitaciones y advertencias

- El adaptador está marcado como `DIAGNOSTIC_ONLY` y `NOT_WINNER_GATE`, lo que implica que no es un candidato para producción sin validación adicional.
- No incluye pesos fusionados; requiere cargar el modelo base por separado y aplicar el adaptador con PEFT.
- El conjunto de entrenamiento es muy reducido (1.074 filas), lo que puede provocar sobreajuste a los datos de OCR y bajo rendimiento en dominios no vistos.
- Los resultados de LiveCodeBench son protocolo-específicos y no deben generalizarse a otros benchmarks o entornos.
- El adaptador se entrena con un contexto máximo de 4.096 tokens; aunque el base soporta más, el adaptador puede degradarse con secuencias más largas.
- No se han evaluado sesgos ni alucinaciones específicas; el modelo base Olmo 3 puede heredar sesgos de sus datos de entrenamiento.
- La licencia Apache-2.0 permite uso comercial, pero el autor no garantiza la calidad ni el soporte del adaptador.

## Enlaces

- Repositorio HuggingFace del adaptador: https://huggingface.co/modrill/CN11-OLMO3-OCR-FC250-COT250-U64
- Modelo base en HuggingFace: https://huggingface.co/allenai/Olmo-3-1025-7B (referencia indirecta; el ID exacto no se lista en la información)
- Paper de Olmo 3 (arXiv): https://arxiv.org/abs/2512.13961
- Repositorio olmOCR (herramienta de OCR de AI2): https://github.com/allenai/olmocr
- Repositorio de referencia olmOCR-OCR: https://github.com/yangyang117/olmocr-OCR
