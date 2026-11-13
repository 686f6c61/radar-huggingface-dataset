# lokesh535/AutoFlow-V6-Universal-Qwen3.5-9B-LoRA

## Resumen

AutoFlow-V6-Universal es un adaptador LoRA de tipo PEFT publicado por el usuario lokesh535 sobre el modelo base Qwen/Qwen3.5-9B. Su propósito es especializar el modelo base en la evaluación de registros estructurados contra reglas de política definidas en tiempo de ejecución, la ejecución de llamadas a herramientas deterministas y la resistencia a ataques de inyección de prompt incrustados en campos de datos no confiables. Está orientado a flujos de trabajo empresariales y agentes autonomos en dominios como SAP, Salesforce o ServiceNow, aunque la model card lo describe como agnóstico de dominio.

El adaptador no introduce una arquitectura nueva: hereda la del modelo base Qwen3.5-9B (transformer denso de aproximadamente 9.000 millones de parámetros) y añade pesos LoRA entrenados en bfloat16 nativo. El repositorio es pequeño (0,1 GB), lo que confirma que solo se distribuyen los pesos del adaptador y no el modelo completo. La licencia declarada es Apache 2.0 y la librería de carga es PEFT sobre Transformers.

La relevancia de esta ficha es acotada: se trata de un adaptador con cero descargas y cero likes en el momento de la consulta, sin benchmarks publicados ni documentación técnica sobre el dataset de entrenamiento. Toda la información disponible proviene de la model card del autor, que documenta el formato de uso pero no los detalles de entrenamiento ni resultados medidos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (PEFT) sobre transformer denso Qwen3.5-9B |
| Parametros totales | No disponible (el adaptador ocupa 0,1 GB; el modelo base declara 9B en su identificador) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible para el adaptador; el modelo base admite las cuantizaciones habituales de Qwen (no especificadas) |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptador PEFT) |
| Libreria de carga | peft, transformers, accelerate |
| Modelo base | Qwen/Qwen3.5-9B |
| Precisión de entrenamiento | bfloat16 nativo |
| Fecha de creacion | 2026-11-13 |

## Arquitectura y entrenamiento

El adaptador se monta sobre Qwen3.5-9B mediante `PeftModel.from_pretrained`, de modo que la arquitectura efectiva en inferencia es la del transformer del modelo base con las matrices LoRA inyectadas en las capas correspondientes. La model card no especifica el rango LoRA, las capas objetivo ni el número de parámetros entrenables del adaptador. El entrenamiento se realizó en bfloat16 nativo, según declara el autor, pero no se documentan el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron técnicas de RLHF o DPO.

La innovación que el autor destaca no es arquitectónica sino de comportamiento: el adaptador está entrenado para (1) aplicar reglas de política en orden de prioridad exacto sobre un registro de entrada, (2) tratar todos los valores de campos como datos no confiables e ignorar instrucciones embebidas en ellos, (3) no afirmar la ejecución de acciones del mundo real salvo que una observación de herramienta verificada lo confirme (campo `claims_action_executed` a `false` en decisiones de solo lectura) y (4) devolver exclusivamente el esquema JSON o la llamada a herramienta solicitada con fidelidad exacta de identificadores. El uso de etiquetas `<tool_call>` sigue el formato de Qwen para function calling.

## Capacidades

- Evaluación de políticas en tiempo de ejecución: aplica listas ordenadas de reglas sobre registros estructurados de cualquier dominio y devuelve una decisión según el esquema JSON solicitado.
- Llamada a herramientas dinámica: acepta definiciones de función en formato OpenAI/JSON-Schema dentro de etiquetas `<tools>` y emite llamadas en `<tool_call>` con nombre y argumentos.
- Defensa frente a inyección de prompt: ignora instrucciones embebidas en campos de datos no confiables (notas, descripciones, nombres).
- Grounding honesto de ejecución: distingue entre decisiones de solo lectura y acciones ejecutadas, marcando `claims_action_executed` de forma explícita.
- Razonamiento multi-turno y multi-paso orientado a agentes autonómos.
- Salida JSON determinista con fidelidad de identificadores (modo `do_sample=False` documentado).
- Capacidades heredadas del modelo base Qwen3.5-9B (generación de texto, conversación, multilingüismo): no disponibles en detalle en la información proporcionada.

## Casos de uso

- Triage clínico en UCI: el adaptador evalúa constantes vitales (SpO2, frecuencia cardíaca, presión sistólica) contra reglas de prioridad y emite una decisión como `code_blue_immediate_intervention`, ignorando notas de paciente que contengan instrucciones maliciosas. Es adecuado porque el ejemplo de la model card demuestra exactamente este flujo con defensa frente a inyección.
- Respuesta a incidentes de ciberseguridad: dado un incidente y un host comprometido, el modelo genera una llamada a `quarantine_compromised_host` con `isolation_level` como `FULL_NETWORK_LOCK`, integrándose en un pipeline de SOAR que ejecuta la acción real y devuelve la observación.
- Automatización de aprobaciones en SAP o Salesforce: evaluación de registros de facturas, pedidos o cuentas contra reglas de negocio ordenadas (umbrales de importe, estados, antigüedad) para producir una decisión de aprobar, escalar o rechazar con identificador exacto del registro.
- Gestión de tickets en ServiceNow: clasificación y enrutado de incidencias aplicando reglas de prioridad definidas en runtime, con salida JSON que un orquestador puede consumir directamente.
- Agentes de solo lectura con auditoría: cualquier flujo donde el modelo deba decidir sin ejecutar acciones, usando `claims_action_executed: false` para garantizar que no se declaren ejecuciones no verificadas, útil en cumplimiento normativo.
- Enrutado multi-dominio en un mismo despliegue: al ser agnóstico de dominio, un único endpoint puede servir reglas de salud, finanzas, IT o retail cambiando el payload en cada petición, reduciendo el número de adaptadores especializados a mantener.
- Integración como paso de validación previa a la ejecución de herramientas: el adaptador actúa como capa de política que decide si y cómo invocar una función antes de que un sistema externo la ejecute.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas de precisión en evaluación de políticas, tasa de resistencia a inyección de prompt, exactitud de llamadas a herramientas ni comparaciones con otros adaptadores.

## Requisitos de hardware

- El adaptador en sí ocupa 0,1 GB; el requisito real viene del modelo base Qwen3.5-9B.
- Inferencia en bfloat16 del modelo base de 9B: aproximadamente 18 GB de VRAM solo para pesos, más overhead de contexto y KV cache; en la práctica se recomienda una GPU de 24 GB o más.
- GPU recomendadas: A100 40/80 GB, H100, L40S o RTX 4090 (24 GB) para bfloat16 con contexto moderado; RTX 3090 (24 GB) como mínimo práctico.
- Cuantización a 8 bits: alrededor de 9-10 GB, viable en RTX 4080/4070 Ti Super (16 GB) y superiores.
- Cuantización a 4 bits (GPTQ/AWQ/GGUF Q4): alrededor de 5-6 GB, viable en GPUs consumer de 8 GB, aunque la calidad del adaptador en cuantización no está verificada por el autor.
- Despliegue: Transformers + PEFT + accelerate según la model card; vLLM y TGI admiten adaptadores LoRA, pero no hay confirmación de compatibilidad con este adaptador concreto; llama.cpp/Ollama requerirían fusionar el adaptador en el modelo base antes de convertirlo a GGUF.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| AutoFlow-V6-Universal (este) | 9B (base) + LoRA | No disponible | Evaluación de políticas y tool calling agnóstico de dominio | Apache 2.0 | Repositorio PEFT, 0 descargas |
| Qwen3.5-9B (base) | 9B | No disponible | Modelo generalista | No disponible en esta ficha | Modelo base público |
| Adaptadores LoRA especializados en function calling de otros autores | Variable | Variable | Tool calling específico de dominio | Variable | No disponible |

No se dispone de datos de rendimiento comparativos entre estos modelos en la información proporcionada; la comparación se limita a parámetros, licencia y disponibilidad.

## Limitaciones y advertencias

- Cero descargas y cero likes en el momento de la consulta: no hay evidencia de uso en producción ni validación por terceros.
- Sin benchmarks publicados: no se puede verificar la precisión en evaluación de políticas, la tasa de resistencia a inyección ni la exactitud de las llamadas a herramientas.
- No se documentan el dataset de entrenamiento, el rango LoRA ni las capas objetivo, lo que dificulta reproducir o auditar el adaptador.
- Idiomas soportados no declarados; el comportamiento multilingüe depende del modelo base y no está verificado para este adaptador.
- Longitud de contexto no especificada; los prompts con muchas reglas o registros largos pueden exceder la ventana efectiva.
- Riesgo de alucinación inherente al modelo base de 9B, especialmente en campos de identificadores o argumentos de herramientas; el modo determinista (`do_sample=False`) reduce pero no elimina el riesgo.
- El grounding honesto (`claims_action_executed`) es un comportamiento entrenado, no una garantía formal; en producción debe validarse con observaciones de herramientas reales antes de ejecutar acciones.
- La licencia Apache 2.0 se declara para el adaptador, pero el uso comercial también queda sujeto a la licencia del modelo base Qwen3.5-9B, que debe verificarse por separado.
- Casos de uso sanitarios o de seguridad (triage de UCI, cuarentena de hosts) son ejemplos de la model card y no deben desplegarse sin supervisión humana y validación clínica o de seguridad independiente.

## Enlaces

- Hugging Face del adaptador: https://huggingface.co/lokesh535/AutoFlow-V6-Universal-Qwen3.5-9B-LoRA
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B
- Librería PEFT: https://github.com/huggingface/peft
- Librería Transformers: https://github.com/huggingface/transformers
- No se han encontrado papers, blogs, repos adicionales ni demos en la información proporcionada.
