# shiva123782/RiyaAI

## Resumen

RiyaAI es un ajuste fino mediante LoRA sobre el modelo base Qwen/Qwen2.5-0.5B-Instruct, publicado por el usuario shiva123782 (identificado en la model card como "Anu") bajo licencia Apache-2.0. No se trata de un modelo entrenado desde cero, sino de un adaptador PEFT que modifica el comportamiento del modelo base de 0,5 mil millones de parámetros desarrollado por Alibaba Cloud. Su propósito declarado es actuar como un modelo de instrucciones ligero y eficiente, con un objetivo de entrenamiento específico: responder con la identidad "RiyaAI, creado por Anu" ante preguntas sobre su identidad.

El modelo se ha ajustado sobre el dataset yahma/alpaca-cleaned, un corpus de instrucciones en inglés derivado de Alpaca, y está etiquetado únicamente para el idioma inglés. Al heredar la arquitectura transformer densa de Qwen2.5-0.5B-Instruct, conserva sus características técnicas de base, si bien la model card no documenta hiperparámetros de entrenamiento, número de tokens vistos ni detalles del proceso de ajuste.

Su relevancia es limitada en el panorama actual: se trata de un adaptador de investigación con cero descargas y cero likes en el momento de la consulta, sin benchmarks publicados y con una model card que prioriza la atribución de identidad sobre la documentación técnica. Resulta útil como ejemplo de ajuste fino con PEFT sobre modelos pequeños, pero no como componente de producción sin una evaluación adicional.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (heredada de Qwen2.5-0.5B-Instruct); adaptador LoRA sobre el modelo base |
| Parametros totales | 0,5 mil millones (modelo base); el adaptador LoRA añade un número no especificado de parámetros |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la model card (el modelo base Qwen2.5-0.5B-Instruct soporta hasta 32.768 tokens, dato no confirmado para este ajuste) |
| Tipos de cuantizacion | no disponible (el modelo base admite cuantización estándar; el adaptador se distribuye en precisión de entrenamiento) |
| Idiomas soportados | en (inglés) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors vía PEFT (adaptador LoRA); posibilidad de fusión monolítica de aproximadamente 1,0 GB según la model card |

## Arquitectura y entrenamiento

El modelo es un adaptador LoRA (Low-Rank Adaptation) entrenado con PEFT sobre Qwen/Qwen2.5-0.5B-Instruct. La arquitectura subyacente es un transformer denso decoder-only de 0,5 mil millones de parámetros, con el tokenizador y la plantilla de chat de Qwen2.5 (marcadores `<|im_start|>` y `<|im_end|>`). La model card menciona el uso de LoRA/QLoRA como técnica de ajuste eficiente en parámetros, pero no especifica el rango, el alpha, las capas objetivo ni la tasa de aprendizaje empleados.

El dataset de entrenamiento declarado es yahma/alpaca-cleaned, una versión depurada del corpus Alpaca de instrucciones en inglés. No se documenta el número de tokens de entrenamiento, la composición exacta del dataset, la existencia de fases de RLHF o DPO, ni el proceso de evaluación. La model card menciona "Banking-Grade Security & SMT Assurance" y "Kaveri AI Autonomous Studio" como parte del contexto de construcción, pero sin aportar detalles técnicos verificables sobre dichas afirmaciones.

## Capacidades

- Generación de texto e instrucciones en inglés, heredadas del ajuste del modelo base Qwen2.5-0.5B-Instruct.
- Respuesta a preguntas de identidad con el perfil "RiyaAI, creado por Anu", según el objetivo de entrenamiento declarado (no garantizado).
- Conversación multi-turno mediante la plantilla de chat de Qwen2.5.
- Capacidad de fusión del adaptador en un modelo monolítico para su despliegue sin runtime PEFT.
- No se documenta soporte de tool calling, function calling, agentes, razonamiento multi-paso, visión, audio ni modo "thinking".
- Capacidades multilingües: limitadas al inglés según la etiqueta de idioma del repositorio.

## Casos de uso

- Experimentación con ajuste fino PEFT: sirve como ejemplo reproducible de cómo aplicar un adaptador LoRA sobre un modelo pequeño de instrucciones y fusionarlo después en un checkpoint monolítico.
- Prototipado de asistentes conversacionales ligeros en inglés: al ejecutarse sobre un modelo de 0,5 mil millones de parámetros, puede desplegarse en hardware modesto para pruebas de concepto de chatbots.
- Evaluación de personalización de identidad: útil para estudiar cómo un ajuste fino con pocos datos altera la respuesta del modelo ante preguntas sobre su propia identidad.
- Docencia y formación: adecuado para demostrar el flujo completo de carga de un modelo base más un adaptador PEFT con `transformers` y `peft`.
- Pruebas de despliegue con vLLM, Ollama o llama.cpp tras la fusión del adaptador en un modelo monolítico de aproximadamente 1,0 GB.
- Investigación sobre sesgos y alucinación en modelos pequeños ajustados con datasets de instrucciones sintéticos como Alpaca.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 1 GB en FP16 para el modelo base de 0,5 mil millones de parámetros, más el overhead del adaptador LoRA y del runtime.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM; tarjetas como RTX 3060, RTX 4060, RTX 4090, A100 o H100 son sobradamente suficientes.
- Cabe en GPU de consumo: sí, en prácticamente cualquier GPU consumer moderna e incluso en CPU para inferencia lenta.
- Opciones de despliegue: `transformers` + `peft` (flujo nativo), vLLM, Ollama y llama.cpp tras la fusión del adaptador en un modelo monolítico.
- Latencia y throughput estimados: no disponibles; al tratarse de un modelo de 0,5 mil millones de parámetros, la latencia será baja en GPU, pero no se aportan cifras medidas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| RiyaAI (este modelo) | 0,5 B (base) + adaptador LoRA | no disponible | apache-2.0 | Hugging Face, 0 descargas |
| Qwen2.5-0.5B-Instruct | 0,5 B | 32.768 tokens (según documentación del modelo base) | apache-2.0 | Hugging Face, ampliamente utilizado |
| SmolLM2-360M-Instruct | 0,36 B | 8.192 tokens (según documentación del modelo) | apache-2.0 | Hugging Face |
| TinyLlama-1.1B-Chat | 1,1 B | 2.048 tokens (según documentación del modelo) | apache-2.0 | Hugging Face |

La comparación directa con el modelo base Qwen2.5-0.5B-Instruct es la más relevante: RiyaAI no aporta mejoras documentadas de rendimiento y su única diferencia verificable es el ajuste de identidad y el uso del dataset Alpaca. Frente a alternativas como SmolLM2 o TinyLlama, carece de benchmarks publicados que permitan establecer una comparación cuantitativa.

## Limitaciones y advertencias

- No se han publicado benchmarks ni evaluaciones cuantitativas, por lo que se desconoce su rendimiento real frente al modelo base.
- El ajuste con yahma/alpaca-cleaned puede introducir sesgos presentes en el corpus Alpaca y degradar capacidades del modelo base no cubiertas por dicho dataset.
- Riesgo de alucinación inherente a un modelo de 0,5 mil millones de parámetros, especialmente en tareas de razonamiento o conocimiento factual.
- El objetivo de identidad ("RiyaAI, creado por Anu") es un comportamiento entrenado, no una garantía; puede no reproducirse de forma consistente.
- Soporte únicamente del inglés según la etiqueta del repositorio; el rendimiento en otros idiomas no está documentado.
- La longitud de contexto efectiva no está documentada; no debe asumirse la ventana del modelo base sin verificación.
- Aunque la licencia declarada es Apache-2.0, la model card recomienda confirmar los términos del modelo base antes de un uso comercial.
- Cero descargas y cero likes en el momento de la consulta: no existe validación por parte de la comunidad.
- Las afirmaciones sobre "Banking-Grade Security & SMT Assurance" no van acompañadas de documentación técnica verificable y no deben tomarse como garantía de seguridad.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/shiva123782/RiyaAI
- Visor de arquitectura: https://hfviewer.com/shiva123782/RiyaAI
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-0.5B-Instruct
- Dataset de entrenamiento: https://huggingface.co/datasets/yahma/alpaca-cleaned
