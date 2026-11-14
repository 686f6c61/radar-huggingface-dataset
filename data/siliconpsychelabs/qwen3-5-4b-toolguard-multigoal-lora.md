# SiliconPsycheLabs/qwen3-5-4b-toolguard-multigoal-lora

## Resumen

ToolGuard es un adaptador LoRA de corrección de comportamiento sobre el modelo base Qwen/Qwen3.5-4B, desarrollado por Silicon Psyche Labs (SPLabs). Su objetivo es reducir la probabilidad de que un agente dotado de herramientas (envío de correo, borrado de ficheros, transferencias, concesión de privilegios) ejecute instrucciones ocultas en documentos, correos o resultados de herramientas, es decir, ataques de inyección de prompts en el contexto de tool use. El adaptador no modifica la arquitectura del modelo base: se aplica mediante PEFT sobre Qwen3.5-4B y conserva su plantilla de chat y su formato de tool calling.

La relevancia del modelo es acotada y el propio autor la delimita con claridad: el adaptador reduce la tasa de éxito de las inyecciones medidas en el benchmark InjecAgent (split Direct Harm, 510 casos) del 7,1 % en el modelo base al 0,8 % en el modelo corregido, con evaluación en cinco idiomas. Sin embargo, la model card incluye un aviso explícito que marca el adaptador como «incorrecto como afirmación de protección»: frente a un atacante que reescribe su texto hasta 800 veces por caso, el modelo corregido de 32B de la misma familia fue vulnerado en al menos 26 de 80 casos. El adaptador debe tratarse como una capa de mitigación parcial, no como un mecanismo de seguridad.

El repositorio es pequeño (0,1 GB) y contiene únicamente los pesos del adaptador en safetensors junto con la plantilla de chat necesaria. Se distribuye bajo licencia Apache-2.0, aunque su ejecución requiere el modelo base, sujeto a su propia licencia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre transformer decoder-only Qwen/Qwen3.5-4B |
| Parametros totales | no disponible (adaptador LoRA; el modelo base es de 4B) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (heredada del modelo base Qwen3.5-4B) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en, it, fr, es, de |
| Licencia | Apache-2.0 (pesos del adaptador); el modelo base conserva su propia licencia |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El artefacto es un adaptador LoRA aplicado sobre Qwen3.5-4B, un transformer decoder-only de 4.000 millones de parámetros. No se introduce ninguna modificación estructural en el modelo base: el adaptador ajusta los pesos para alterar la política de decisión del agente ante contenido no confiable en el contexto, manteniendo intacta la plantilla de chat y el formato de tool calling del modelo original, que se incluye en el repositorio.

El entrenamiento se realizó sobre datos autorados que cubren seis técnicas de inyección y cuatro objetivos de atacante, según indica la model card. No se especifican el número de tokens de entrenamiento, la composición exacta del dataset ni si se emplearon técnicas de RLHF o DPO; esos datos figuran como no disponibles. La evaluación reportada se realizó sobre el benchmark público InjecAgent, split Direct Harm, con 510 casos y en los cinco idiomas soportados.

## Capacidades

- Generación de texto conversacional multi-turno sobre el modelo base Qwen3.5-4B.
- Tool calling y function calling conforme a la plantilla de chat del modelo base, incluida en el repositorio.
- Mitigación de inyección de prompts en resultados de herramientas y documentos no confiables (corrección de comportamiento, no bloqueo determinista).
- Mantenimiento de la llamada correcta a herramientas cuando el usuario legítimo la solicita, tras la corrección.
- Soporte multilingüe en inglés, italiano, francés, español y alemán.
- Integración con el ecosistema PEFT/Transformers mediante `PeftModel.from_pretrained`.

## Casos de uso

- Agentes con acceso a correo electrónico: el adaptador reduce la probabilidad de que el modelo actúe sobre instrucciones embebidas en el cuerpo de un correo recibido, manteniendo la capacidad de enviar mensajes cuando lo pide el usuario real.
- Agentes de gestión de ficheros: al leer documentos de fuentes externas, disminuye el riesgo de ejecutar borrados o movimientos dictados por contenido inyectado.
- Automatización de operaciones financieras asistidas: capa adicional de mitigación en agentes que interpretan facturas o extractos y proponen transferencias, sin sustituir la validación humana ni los controles transaccionales.
- Navegación web con extracción de contenido: reducción de la tasa de acciones disparadas por texto oculto en páginas visitadas durante tareas de research automatizado.
- Evaluación comparativa de robustez: uso como referencia corregida frente al base en pruebas internas de resistencia a inyección sobre frameworks de agentes propios.
- Despliegue en pipelines de CI/CD para agentes internos: integración del adaptador como una capa más de defensa en profundidad, combinada con sandboxing y allowlists de herramientas.

## Benchmarks y rendimiento

| Metrica | Base | Corregido |
|---|---|---|
| InjecAgent Direct Harm, tasa de éxito de ataque (salidas válidas) | 7,1 % | 0,8 % |

Datos de la model card, medidos sobre 510 casos del split Direct Harm y en cinco idiomas. No se han publicado otros resultados de benchmarks (MMLU, HumanEval, GSM8K u otros) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información proporcionada; depende del modelo base Qwen3.5-4B y del tipo de cuantización empleado.
- GPU recomendadas: no disponible. Un modelo base de 4B es, en principio, desplegable en GPUs de consumo, pero la información no confirma requisitos concretos.
- Cabe en GPU de consumo: no confirmado en la información disponible.
- Opciones de despliegue: carga mediante `transformers` + `peft` (ejemplo incluido en la model card). No se documentan integraciones con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Enfoque | Licencia |
|---|---|---|---|---|---|
| SiliconPsycheLabs/qwen3-5-4b-toolguard-multigoal-lora | LoRA sobre Qwen3.5-4B | adaptador (base 4B) | no disponible | Mitigación de inyección en tool use | Apache-2.0 |
| Qwen/Qwen3.5-4B (base) | Transformer decoder-only | 4B | no disponible | Modelo generalista con tool calling | según modelo base |
| Adaptador ToolGuard de 32B de SPLabs (misma familia) | LoRA sobre base de 32B | adaptador (base 32B) | no disponible | Mitigación de inyección en tool use | no disponible |

No se dispone de datos de benchmarks comparativos con otras alternativas de mitigación de inyección de prompts en la información proporcionada.

## Limitaciones y advertencias

- El autor marca explícitamente el modelo como «incorrecto como afirmación de protección»: no debe desplegarse como mecanismo de seguridad.
- Frente a ataques adaptativos (hasta 800 reescrituras por caso), el modelo corregido de 32B de la misma familia fue vulnerado en al menos 26 de 80 casos, lo que evidencia que la mitigación es parcial y no robusta ante un atacante persistente.
- Los resultados se limitan a las seis técnicas de inyección y cuatro objetivos de atacante presentes en los datos de entrenamiento; el rendimiento en otros frameworks de agentes requiere medición propia.
- Riesgo de alucinación inherente al modelo base; el adaptador no lo aborda.
- Cobertura idiomática limitada a cinco idiomas; el comportamiento en otros idiomas no está evaluado.
- La licencia Apache-2.0 cubre los pesos del adaptador, pero el uso requiere el modelo base, sujeto a su propia licencia.
- No se documentan requisitos de hardware, cuantizaciones compatibles ni rendimiento en producción.

## Enlaces

- Hugging Face: https://huggingface.co/SiliconPsycheLabs/qwen3-5-4b-toolguard-multigoal-lora
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
- Silicon Psyche Labs: https://splabs.io
- Benchmark InjecAgent: no disponible enlace directo en la información proporcionada.
