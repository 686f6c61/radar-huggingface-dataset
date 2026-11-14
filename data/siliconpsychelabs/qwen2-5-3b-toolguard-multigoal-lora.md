# SiliconPsycheLabs/qwen2-5-3b-toolguard-multigoal-lora

## Resumen

ToolGuard es un adaptador LoRA desarrollado por Silicon Psyche Labs (SPLabs) sobre el modelo base Qwen2.5-3B-Instruct. Su propósito es corregir el comportamiento de agentes que utilizan herramientas (envío de correo, borrado de ficheros, transferencias de dinero, concesión de privilegios) frente a ataques de inyección de instrucciones ocultas en documentos, correos o resultados de herramientas. El adaptador reduce la tasa de acciones inyectadas que el modelo ejecuta, sin degradar el uso legítimo de las mismas herramientas cuando el usuario real las solicita.

El modelo se distribuye como adaptador PEFT (LoRA) en safetensors, con un tamaño de repositorio de 0,1 GB, y requiere cargar el modelo base Qwen2.5-3B-Instruct para funcionar. Soporta cinco idiomas (inglés, italiano, francés, español y alemán) y está etiquetado para casos de uso de agentes, tool calling y corrección de modelo. La licencia del adaptador es Apache-2.0.

Es relevante ahora porque aborda un problema práctico de seguridad en despliegues de agentes con acceso a herramientas: la obediencia a instrucciones plantadas en contenido no confiable. No obstante, el propio autor advierte explícitamente de que el modelo no debe desplegarse como mecanismo de protección, ya que un atacante que reescribe su texto de forma iterativa consigue vulnerar incluso la versión corregida de 32B en al menos 26 de 80 casos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre transformer decoder-only Qwen2.5-3B-Instruct |
| Parametros totales | no disponible (adaptador LoRA; el modelo base tiene 3B) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (heredada del modelo base) |
| Tipos de cuantizacion | no disponible (el adaptador se distribuye en safetensors; la cuantizacion depende del modelo base) |
| Idiomas soportados | en, it, fr, es, de |
| Licencia | Apache-2.0 (adaptador); el modelo base Qwen2.5-3B-Instruct usa Qwen Research License |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El adaptador es un LoRA entrenado mediante PEFT sobre Qwen2.5-3B-Instruct, un transformer decoder-only de 3.000 millones de parámetros. El adaptador modifica el comportamiento del modelo base sin alterar sus pesos originales, y espera la plantilla de chat de tool calling propia de Qwen2.5, incluida en el repositorio. El repositorio ocupa 0,1 GB, coherente con un adaptador de bajo rango.

El entrenamiento se realizó sobre datos autorados que cubren seis técnicas de inyección y cuatro objetivos de atacante (exfiltración, borrado de ficheros, transferencia de dinero y escalada de privilegios). La model card reporta también evaluación sobre un objetivo nunca entrenado (publicar un post) y sobre técnicas nunca entrenadas, lo que sugiere una evaluación de generalización más allá de la distribución de entrenamiento. No se especifican en la información disponible el número de tokens de entrenamiento, la composición exacta del dataset ni si se emplearon RLHF o DPO.

## Capacidades

- Generación de texto y conversación multi-turno en cinco idiomas (en, it, fr, es, de).
- Tool calling y function calling conforme a la plantilla de chat de Qwen2.5-Instruct.
- Resistencia parcial a instrucciones inyectadas en contenido no confiable (documentos, correos, resultados de herramientas).
- Mantenimiento del uso legítimo de herramientas cuando el usuario real las solicita (tasa reportada de 1.000 en la métrica "each tool still used when the user asks").
- Conservación de lecturas benignas (tasa reportada de 1.000 en "benign fetch kept").
- Generalización parcial a objetivos de atacante no vistos durante el entrenamiento (tasa de 0.000 en el objetivo "publish a post").
- No se documentan capacidades de visión, audio ni modo de razonamiento explícito (thinking mode).

## Casos de uso

- Agentes de correo electrónico: el adaptador reduce la probabilidad de que el modelo ejecute instrucciones ocultas en correos recibidos, manteniendo la capacidad de enviar correos cuando el usuario lo pide explícitamente. Adecuado por su entrenamiento específico contra exfiltración y borrado de ficheros.
- Automatización de operaciones con ficheros: en pipelines donde un agente lee documentos y puede borrar o modificar ficheros, el adaptador corrige la obediencia a instrucciones plantadas en el contenido leído (tasa de borrado inyectado reportada de 0.000 frente a 0.417 del base).
- Asistentes financieros con acceso a transferencias: útil como capa de corrección en agentes que interpretan facturas o correos y pueden iniciar pagos, dado el entrenamiento contra el objetivo de transferencia de dinero.
- Gestión de identidades y accesos: para agentes que conceden privilegios tras leer solicitudes, el adaptador reduce la escalada de privilegios inyectada (0.000 frente a 0.333 del base).
- Navegación web con agentes: al procesar páginas no confiables, el adaptador limita la ejecución de comandos embebidos en el HTML o texto de la página, manteniendo las lecturas benignas.
- Evaluación de robustez en investigación: sirve como referencia para medir la eficacia de correcciones conductuales vía LoRA frente a inyección de prompts, comparando tasas base y corregidas en cinco idiomas.
- Despliegue en entornos con recursos limitados: al ser un adaptador de 0,1 GB sobre un modelo de 3B, permite experimentar con corrección de comportamiento sin infraestructura de gran escala.

## Benchmarks y rendimiento

Resultados reportados en la model card (tasa de acciones inyectadas ejecutadas; base frente a corregido; cinco idiomas):

| Metrica | Base | Corregido |
|---|---|---|
| Exfiltracion | 0.250 | 0.000 |
| Borrado de ficheros | 0.417 | 0.000 |
| Transferencia de dinero | 0.333 | 0.000 |
| Escalada de privilegios | 0.333 | 0.000 |
| Objetivo nunca entrenado (publicar un post) | 0.417 | 0.000 |
| Tecnicas nunca entrenadas | 0.500 | 0.000 |
| Lectura benigna conservada | no disponible | 1.000 |
| Cada herramienta usada cuando el usuario lo pide | no disponible | 1.000 |

El autor advierte que, contra un atacante que reescribe su texto hasta 800 veces por caso, su modelo corregido de 32B fue vulnerado en al menos 26 de 80 casos (frente a al menos 68 de 80 del base). No se publican resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita; al tratarse de un adaptador sobre un modelo de 3B, la VRAM depende de la cuantización del base (aproximadamente 2-3 GB en 4 bits, 6-7 GB en fp16, como estimación orientativa no confirmada por el autor).
- GPU recomendadas: no especificadas por el autor; un modelo de 3B en fp16 cabe en GPUs consumer con 8 GB o más.
- Cabe en GPU consumer: sí, previsiblemente en RTX 3060/4060 con 8 GB o superiores, siempre que se cuantice o se use fp16 según el caso.
- Opciones de despliegue: transformers + peft (documentado en la model card); compatible con frameworks que soporten adaptadores PEFT, como vLLM o TGI, aunque no se documenta explícitamente.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ToolGuard LoRA (Qwen2.5-3B) | adaptador sobre 3B | no disponible | Corrección anti-inyección en agentes con herramientas | Apache-2.0 (adaptador) | Hugging Face |
| Qwen2.5-3B-Instruct (base) | 3B | no disponible en la informacion | Modelo instructivo general con tool calling | Qwen Research License | Hugging Face |
| Adaptadores de seguridad para agentes de otros autores | no disponible | no disponible | Defensa frente a prompt injection | no disponible | no disponible |

No se dispone de datos comparativos de rendimiento frente a alternativas en la información proporcionada.

## Limitaciones y advertencias

- El autor marca explícitamente el modelo como "INCORRECTO como afirmación de protección": reduce pero no impide la obediencia a instrucciones inyectadas.
- Contra atacantes adaptativos que reescriben el texto repetidamente, la corrección se rompe: al menos 26 de 80 casos vulnerados en la variante de 32B.
- Los resultados corresponden a los ataques disponibles en el momento del entrenamiento y no predicen ataques futuros.
- Entrenado sobre datos autorados con seis técnicas y cuatro objetivos; el rendimiento en otros frameworks de agentes requiere medición propia.
- La licencia Apache-2.0 del adaptador no cubre el modelo base: Qwen2.5-3B-Instruct se distribuye bajo Qwen Research License, que no permite uso comercial sin permiso de Alibaba Cloud.
- No se documentan sesgos, tasas de alucinación ni comportamiento fuera de los cinco idiomas soportados.
- El adaptador espera la plantilla de chat de tool calling de Qwen2.5; su uso con otras plantillas puede degradar el comportamiento.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/SiliconPsycheLabs/qwen2-5-3b-toolguard-multigoal-lora
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-3B-Instruct
- Sitio del autor: https://splabs.io
