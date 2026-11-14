# SiliconPsycheLabs/minicpm5-2b-toolguard-multigoal-lora

## Resumen

ToolGuard es un adaptador LoRA de corrección de comportamiento publicado por Silicon Psyche Labs sobre el modelo base openbmb/MiniCPM5-2B. Su propósito es reducir la probabilidad de que un agente dotado de herramientas (envío de correo, borrado de ficheros, transferencias, concesión de permisos) obedezca instrucciones ocultas en documentos, páginas web, correos o resultados de herramientas, fenómeno conocido como inyección de prompt indirecta. El adaptador no modifica la arquitectura del modelo base: se aplica mediante PEFT sobre MiniCPM5-2B y conserva su plantilla de chat de tool calling.

El interés del proyecto es doble. Por un lado, aborda un problema de seguridad operativa muy concreto en despliegues de agentes: la diferencia entre ejecutar una acción solicitada por el usuario legítimo y ejecutar una acción plantada por un tercero en el contenido que el agente procesa. Por otro, el autor acompaña la publicación con una advertencia explícita: el modelo no debe presentarse como una protección, ya que frente a un atacante que reescribe su texto hasta 800 veces por caso, su modelo de 32B corregido fue comprometido en al menos 26 de 80 casos (frente a al menos 68 de 80 del base). Los números de la model card son recuentos contra los ataques disponibles en el momento del entrenamiento.

La relevancia actual reside en que los adaptadores de este tipo son baratos de aplicar (0,3 GB de repositorio) y permiten endurecer un agente existente sin cambiar de modelo base, aunque su eficacia debe medirse contra el marco de agente y el adversario concretos de cada despliegue.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre transformer MiniCPM5-2B |
| Parametros totales | no disponible (adaptador LoRA; el base es de 2B) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (heredada del modelo base) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en, it, fr, es, de |
| Licencia | apache-2.0 (los pesos del adaptador; el modelo base mantiene su propia licencia) |
| Formato de pesos | safetensors (adaptador PEFT), librería peft |

## Arquitectura y entrenamiento

El adaptador es un LoRA estándar aplicado sobre openbmb/MiniCPM5-2B, un modelo de 2B parámetros. No se especifica en la información disponible el rango, los módulos objetivo ni los hiperparámetros del LoRA, ni el número de tokens de entrenamiento. El adaptador espera la plantilla de chat de tool calling propia del modelo base, que se incluye en el repositorio.

El entrenamiento se realizó sobre datos de autoría propia que cubren seis técnicas de inyección y cuatro objetivos de atacante, en cinco idiomas (inglés, italiano, francés, español y alemán). La model card reporta generalización fuera de lo entrenado: tasa 0,0 de acciones inyectadas tanto para un objetivo nunca entrenado (publicar un post) como para técnicas nunca entrenadas, manteniendo la llamada a herramientas legítima del usuario en 1,0 y la recuperación benigna en 1,0. En InjecAgent Direct Harm, la tasa de éxito de ataque pasa del 2,3 % al 0,0 %, y la tasa de salida válida del 92,9 % al 97,1 %. No se detalla si hubo RLHF, DPO ni la composición exacta del dataset.

## Capacidades

- Corrección de comportamiento frente a inyección de prompt indirecta en contenido leído por el agente (páginas web, correos, ficheros, resultados de herramientas).
- Mantenimiento del tool calling legítimo: las herramientas siguen usándose cuando el usuario real las solicita.
- Generalización a objetivos de atacante no vistos durante el entrenamiento (verificado con el objetivo "publicar un post").
- Generalización a técnicas de inyección no vistas durante el entrenamiento.
- Cobertura multilingüe en inglés, italiano, francés, español y alemán.
- Generación de texto y conversación (pipeline text-generation) heredadas del modelo base.
- Integración vía PEFT con transformers, sin necesidad de reentrenar el modelo base.

## Casos de uso

- Agentes de correo electrónico: el adaptador reduce el riesgo de que un agente que lee bandejas de entrada ejecute instrucciones plantadas en el cuerpo de un mensaje (por ejemplo, reenviar datos o borrar carpetas), manteniendo la capacidad de enviar correos cuando el usuario lo pide.
- Navegación web automatizada: en pipelines donde el agente resume o actúa sobre páginas externas, el LoRA disminuye la probabilidad de que contenido malicioso en la página desencadene llamadas a herramientas no solicitadas.
- Asistentes con acceso a ficheros: útil en entornos donde el agente procesa documentos de terceros y dispone de herramientas de borrado o modificación; el adaptador conserva las operaciones legítimas solicitadas por el usuario.
- Automatización financiera asistida: para agentes con herramientas de transferencia o pago, el adaptador actúa como capa adicional de corrección de comportamiento, aunque nunca como control de seguridad único.
- Despliegues multilingües en Europa: la cobertura de español, francés, italiano y alemán permite aplicar la misma corrección en agentes que operan en varios idiomas sin cambiar de adaptador.
- Evaluación de robustez en investigación: sirve como referencia reproducible para medir la eficacia de técnicas de corrección de comportamiento frente a inyección indirecta en marcos de agentes propios.
- Prototipado con recursos limitados: al ser un LoRA sobre un modelo de 2B, permite experimentar con endurecimiento de agentes en hardware modesto antes de escalar a modelos mayores.

## Benchmarks y rendimiento

| Metrica | Base | Corregido |
|---|---|---|
| Acción inyectada, cuatro objetivos entrenados | no disponible | 0,0 |
| Objetivo nunca entrenado (publicar un post) | no disponible | 0,0 |
| Técnicas nunca entrenadas | no disponible | 0,0 |
| Recuperación benigna mantenida | no disponible | 1,0 |
| Cada herramienta sigue usándose cuando el usuario la pide | no disponible | 1,0 |
| InjecAgent Direct Harm, éxito de ataque (salidas válidas) | 2,3 % | 0,0 % |
| InjecAgent Direct Harm, tasa de salida válida | 92,9 % | 97,1 % |

No se han publicado resultados de MMLU, HumanEval, GSM8K ni otros benchmarks generales en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma específica; al tratarse de un LoRA sobre un modelo de 2B, el requisito dominante es el del modelo base, no el del adaptador (0,3 GB de repositorio).
- GPU recomendadas: no disponible en la información proporcionada.
- Viabilidad en GPU de consumo: no confirmada explícitamente; el tamaño del modelo base (2B) sugiere que es viable en GPU de consumo, pero no se aportan datos de VRAM ni cuantizaciones probadas.
- Opciones de despliegue: la model card documenta el uso con transformers y PEFT (`PeftModel.from_pretrained`). No se mencionan vLLM, llama.cpp, Ollama ni TGI para este adaptador.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| SiliconPsycheLabs/minicpm5-2b-toolguard-multigoal-lora | LoRA sobre 2B | no disponible | Corrección de inyección indirecta en agentes | apache-2.0 (adaptador) | Hugging Face, 18 descargas |
| openbmb/MiniCPM5-2B (base) | 2B | no disponible | Modelo generalista con tool calling | la del modelo base | Hugging Face |
| Modelo corregido de 32B de Silicon Psyche Labs | 32B | no disponible | Corrección de inyección indirecta | no disponible | Mencionado en la model card, sin enlace |

No se dispone de datos de benchmarks comparativos con otros adaptadores de seguridad para agentes en la información proporcionada.

## Limitaciones y advertencias

- No es una protección: el propio autor marca el modelo como incorrecto si se presenta como tal. Frente a un atacante que reescribe su texto hasta 800 veces por caso, el modelo corregido de 32B fue comprometido en al menos 26 de 80 casos (al menos 68 de 80 en el base). No debe desplegarse como medida de seguridad.
- Los resultados son recuentos contra los ataques disponibles en el momento del entrenamiento y no predicen el comportamiento frente a ataques futuros.
- Entrenado sobre datos de autoría propia con seis técnicas y cuatro objetivos; el rendimiento en otros marcos de agentes requiere medición propia.
- Riesgo de alucinación y sesgos: no documentado en la información disponible.
- Limitaciones de contexto: no documentadas; dependen del modelo base.
- Idiomas: cobertura declarada en en, it, fr, es y de; no se especifica rendimiento en otros idiomas.
- Licencia: el adaptador es apache-2.0, pero su uso requiere el modelo base, que mantiene su propia licencia y condiciones.
- Madurez: 18 descargas y 0 likes en el momento de la consulta; proyecto de investigación con validación limitada por terceros.

## Enlaces

- Hugging Face: https://huggingface.co/SiliconPsycheLabs/minicpm5-2b-toolguard-multigoal-lora
- Modelo base: https://huggingface.co/openbmb/MiniCPM5-2B
- Silicon Psyche Labs: https://splabs.io
