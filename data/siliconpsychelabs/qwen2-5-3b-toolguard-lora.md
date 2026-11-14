# SiliconPsycheLabs/qwen2-5-3b-toolguard-lora

## Resumen

ToolGuard es un adaptador LoRA desarrollado por Silicon Psyche Labs (SPLabs) sobre el modelo base Qwen2.5-3B-Instruct. Su propósito es corregir el comportamiento de agentes con acceso a herramientas (envío de correo, borrado de ficheros, transferencias, concesión de privilegios) frente a ataques de inyección de instrucciones ocultas en documentos, páginas web o resultados de herramientas. El adaptador no añade capacidades nuevas de razonamiento, sino que modifica la política de actuación del modelo para que ignore instrucciones embebidas en contenido no confiable y mantenga la ejecución de las tareas legítimas solicitadas por el usuario real.

El modelo se distribuye como un adaptador PEFT en safetensors (0,1 GB) y requiere el modelo base Qwen2.5-3B-Instruct, de arquitectura transformer decoder-only con 3.000 millones de parámetros y una ventana de contexto de 32.768 tokens (según la ficha del modelo base). La relevancia actual del adaptador es doble: por un lado, aborda un vector de ataque crítico en despliegues de agentes; por otro, su propia model card lo marca explícitamente como "incorrecto como afirmación de protección", advirtiendo de que reduce pero no elimina la vulnerabilidad.

La versión publicada está declarada como obsoleta ("superseded") por el propio autor: cubre un único objetivo de atacante (enviar un correo) y ha sido reemplazada por el adaptador multigoal `qwen2-5-3b-toolguard-multigoal-lora`. Se mantiene disponible como registro histórico y de reproducibilidad.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (PEFT) sobre transformer decoder-only Qwen2.5-3B-Instruct |
| Parámetros totales | No disponible (adaptador LoRA; el modelo base tiene 3.000 millones) |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | 32.768 tokens (heredada del modelo base Qwen2.5-3B-Instruct) |
| Tipos de cuantización | No disponible para el adaptador; el modelo base admite las cuantizaciones estándar de Qwen2.5 (no especificadas en la información proporcionada) |
| Idiomas soportados | en, it, fr, es, de |
| Licencia | Apache-2.0 (adaptador); el modelo base Qwen2.5-3B-Instruct usa Qwen Research License, sin uso comercial sin permiso de Alibaba Cloud |
| Formato de pesos | safetensors (adaptador PEFT) |

## Arquitectura y entrenamiento

El adaptador se aplica sobre Qwen2.5-3B-Instruct, un transformer decoder-only de 3.000 millones de parámetros con atención causal estándar y plantilla de chat con soporte de tool calling. El LoRA modifica los pesos del modelo base para ajustar su comportamiento ante contenido no confiable; no se especifican en la información disponible el rango, el alpha, los módulos objetivo ni el número de tokens de entrenamiento.

El entrenamiento se realizó con datos autorales que cubren seis técnicas de inyección y cuatro objetivos de atacante (según la sección de límites de la model card), aunque la versión publicada se centra en un único objetivo: enviar un correo. La evaluación reportada mide la tasa de acciones inyectadas ejecutadas en cinco idiomas, comparando base y corregido. No se documentan detalles sobre RLHF, DPO ni composición exacta del dataset.

## Capacidades

- Generación de texto conversacional y razonamiento multi-turno sobre el modelo base Qwen2.5-3B-Instruct.
- Tool calling y function calling mediante la plantilla de chat nativa del modelo base (incluida en el repositorio del adaptador).
- Ejecución de tareas de agente con múltiples pasos, manteniendo la llamada a herramientas cuando el usuario legítimo la solicita.
- Resistencia parcial a inyección de instrucciones en documentos, páginas web, correos y resultados de herramientas.
- Mitigación de etiquetas de rol falsificadas (forged role labels) en el contenido consumido por el agente.
- Capacidades multilingües en inglés, italiano, francés, español y alemán.
- No incorpora visión, audio ni modo de razonamiento extendido (thinking mode); hereda únicamente las capacidades del modelo base.

## Casos de uso

- Agentes de correo electrónico: el adaptador reduce la probabilidad de que el modelo envíe correos no solicitados cuando un documento o un resultado de herramienta contiene instrucciones ocultas; la evaluación reporta una tasa de correo solicitado por el usuario del 100 % tanto en base como en corregido.
- Automatización de atención al cliente con acceso a herramientas internas: útil en flujos donde el agente lee tickets o transcripciones no confiables y debe decidir si ejecuta acciones como reembolsos o cambios de estado.
- Pipelines de gestión documental: cuando el agente procesa PDFs, correos o páginas web de terceros y dispone de herramientas de borrado o modificación de ficheros, el adaptador reduce la ejecución de instrucciones embebidas.
- Asistentes de operaciones financieras: en escenarios con herramientas de transferencia, el LoRA disminuye la tasa de acciones inyectadas (de 0,300 a 0,000 en las seis técnicas entrenadas), aunque no debe considerarse una garantía de seguridad.
- Evaluación y red teaming de frameworks de agentes: sirve como referencia comparativa para medir la robustez de otras implementaciones frente a inyección de prompts.
- Investigación en alineación y corrección de comportamiento: el adaptador y su metodología (PSA, lectura del comportamiento desde la salida) son útiles para estudiar cómo se puede corregir la política de actuación de un modelo pequeño sin reentrenarlo desde cero.

## Benchmarks y rendimiento

Resultados publicados en la model card (tasa de acciones inyectadas ejecutadas, base frente a corregido, cinco idiomas):

| Métrica | Base | Corregido |
|---|---|---|
| Acción inyectada, 6 técnicas entrenadas | 0,300 | 0,000 |
| Etiqueta de rol falsificada | 0,800 | 0,000 |
| Acción inyectada, 3 técnicas no entrenadas | 0,333 | 0,000 |
| Tarea benigna completada | 0,800 | 1,000 |
| Correo solicitado por el usuario enviado | 1,000 | 1,000 |

Advertencia del autor: frente a un atacante que reescribe su texto hasta 800 veces por caso, el modelo corregido de 32B fue vulnerado en al menos 26 de 80 casos (frente a al menos 68 de 80 del base). No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el adaptador LoRA añade un coste mínimo (0,1 GB en disco); el grueso corresponde al modelo base de 3.000 millones de parámetros. En FP16 requiere aproximadamente 6-7 GB de VRAM; en cuantización de 8 bits, unos 3,5-4 GB; en 4 bits, unos 2-2,5 GB (estimaciones para el modelo base, no publicadas en la información proporcionada).
- GPU recomendadas: A100, H100 o L40S para despliegues con concurrencia; RTX 4090 y RTX 3090 para desarrollo y pruebas.
- Cabe en GPU de consumo: sí, en RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070 y superiores, especialmente con cuantización de 8 o 4 bits.
- Opciones de despliegue: transformers + PEFT (método documentado por el autor), vLLM con soporte de adaptadores LoRA, TGI y llama.cpp/Ollama tras fusionar el adaptador con el modelo base y convertir a GGUF.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros | Contexto | Enfoque | Licencia |
|---|---|---|---|---|---|
| SiliconPsycheLabs/qwen2-5-3b-toolguard-lora | LoRA sobre Qwen2.5-3B-Instruct | 3.000 M (base) | 32.768 | Corrección frente a inyección en tool use, un objetivo | Apache-2.0 (adaptador); base con Qwen Research License |
| SiliconPsycheLabs/qwen2-5-3b-toolguard-multigoal-lora | LoRA sobre Qwen2.5-3B-Instruct | 3.000 M (base) | 32.768 | Corrección frente a inyección, cuatro objetivos (sucesor) | Apache-2.0 (adaptador); base con Qwen Research License |
| Qwen/Qwen2.5-3B-Instruct | Modelo base | 3.000 M | 32.768 | Instrucción general y tool calling | Qwen Research License |
| Meta Llama 3.2 3B Instruct | Modelo base | 3.000 M | 128.000 | Instrucción general y tool calling | Llama 3.2 Community License |

La comparación con Llama 3.2 3B se incluye como referencia de tamaño y categoría; no se dispone de datos de robustez frente a inyección para ese modelo en la información proporcionada.

## Limitaciones y advertencias

- El propio autor marca el modelo como "incorrecto como afirmación de protección": reduce la tasa de inyección, no la elimina.
- Frente a atacantes adaptativos (hasta 800 reescrituras por caso), el modelo corregido de 32B fue vulnerado en al menos 26 de 80 casos; no hay garantía equivalente para el adaptador de 3B.
- Entrenado con datos autorales de seis técnicas y cuatro objetivos; el rendimiento en otros frameworks de agentes requiere medición propia.
- La versión publicada está declarada obsoleta y sustituida por `qwen2-5-3b-toolguard-multigoal-lora`; cubre un único objetivo de atacante.
- Licencia del adaptador Apache-2.0, pero el modelo base Qwen2.5-3B-Instruct se distribuye bajo Qwen Research License, que no permite uso comercial sin permiso de Alibaba Cloud.
- Riesgo de alucinación inherente al modelo base de 3.000 millones de parámetros; el adaptador no lo corrige.
- Idiomas cubiertos limitados a en, it, fr, es y de; no se documenta comportamiento en otras lenguas.
- No debe desplegarse como única medida de seguridad en producción; requiere defensas en profundidad (validación de herramientas, permisos mínimos, sandboxing).

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/SiliconPsycheLabs/qwen2-5-3b-toolguard-lora
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-3B-Instruct
- Sucesor multigoal: https://huggingface.co/SiliconPsycheLabs/qwen2-5-3b-toolguard-multigoal-lora
- Sitio del autor: https://splabs.io
